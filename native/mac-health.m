#import <Foundation/Foundation.h>
#include <mach/mach.h>
#include <mach/mach_host.h>
#include <mach/vm_statistics.h>
#include <sys/sysctl.h>
#include <sys/mount.h>
#include <sys/time.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>

static volatile sig_atomic_t running = 1;
static void stop(int sig) { (void)sig; running = 0; }
static host_cpu_load_info_data_t previous;
static int have_previous = 0;

// Time Machine metadata is private and may change. Never mount a destination,
// enumerate backup contents, or mistake an inaccessible preference for no backup.
static double backup_checked = 0, backup_completed = 0;
static int backup_accessible = 0;
static void backup_sample(double now) {
    if (backup_checked > 0 && now >= backup_checked && now - backup_checked < 60000) return;
    backup_checked = now; backup_completed = 0; backup_accessible = 0;
    CFPreferencesSynchronize(CFSTR("com.apple.TimeMachine"), kCFPreferencesAnyUser, kCFPreferencesAnyHost);
    id destinations = CFBridgingRelease(CFPreferencesCopyValue(CFSTR("Destinations"), CFSTR("com.apple.TimeMachine"), kCFPreferencesAnyUser, kCFPreferencesAnyHost));
    if (![destinations isKindOfClass:[NSArray class]]) return;
    backup_accessible = 1;
    for (id destination in destinations) {
        if (![destination isKindOfClass:[NSDictionary class]]) continue;
        id dates = destination[@"SnapshotDates"];
        if (![dates isKindOfClass:[NSArray class]]) continue;
        for (id date in dates) {
            if (![date isKindOfClass:[NSDate class]]) continue;
            double timestamp = [date timeIntervalSince1970] * 1000.0;
            if (timestamp > 0 && timestamp <= now && timestamp > backup_completed) backup_completed = timestamp;
        }
    }
}

static void sample(void) {
    mach_port_t host = mach_host_self();
    host_cpu_load_info_data_t cpu = {0};
    mach_msg_type_number_t cpu_count = HOST_CPU_LOAD_INFO_COUNT;
    int cpu_ok = host_statistics(host, HOST_CPU_LOAD_INFO, (host_info_t)&cpu, &cpu_count) == KERN_SUCCESS;
    double usage = -1;
    if (cpu_ok && have_previous) {
        uint64_t total = 0, busy = 0;
        for (int i = 0; i < CPU_STATE_MAX; i++) {
            uint32_t delta = (uint32_t)(cpu.cpu_ticks[i] - previous.cpu_ticks[i]);
            total += delta;
            if (i != CPU_STATE_IDLE) busy += delta;
        }
        if (total) usage = 100.0 * (double)busy / (double)total;
    }
    if (cpu_ok) { previous = cpu; have_previous = 1; }
    else have_previous = 0;

    uint64_t physical = 0;
    size_t physical_len = sizeof(physical);
    int physical_ok = sysctlbyname("hw.memsize", &physical, &physical_len, NULL, 0) == 0;
    vm_statistics64_data_t vm = {0};
    mach_msg_type_number_t vm_count = HOST_VM_INFO64_COUNT;
    vm_size_t page = 0;
    int vm_ok = host_page_size(host, &page) == KERN_SUCCESS && host_statistics64(host, HOST_VM_INFO64, (host_info64_t)&vm, &vm_count) == KERN_SUCCESS;
    mach_port_deallocate(mach_task_self(), host);
    uint64_t used = 0, compressed = 0;
    if (vm_ok) {
        uint64_t app = vm.internal_page_count > vm.purgeable_count ? vm.internal_page_count - vm.purgeable_count : 0;
        compressed = (uint64_t)vm.compressor_page_count * page;
        used = (app + vm.wire_count) * page + compressed;
        if (physical_ok && used > physical) used = physical;
    }
    int pressure = -1;
    size_t pressure_len = sizeof(pressure);
    if (sysctlbyname("kern.memorystatus_vm_pressure_level", &pressure, &pressure_len, NULL, 0) != 0) pressure = -1;
    struct xsw_usage swap = {0};
    size_t swap_len = sizeof(swap);
    int swap_ok = sysctlbyname("vm.swapusage", &swap, &swap_len, NULL, 0) == 0;
    struct statfs disk = {0};
    int disk_ok = statfs("/System/Volumes/Data", &disk) == 0;
    struct timeval wall;
    gettimeofday(&wall, NULL);
    backup_sample((double)wall.tv_sec * 1000.0 + wall.tv_usec / 1000.0);
    printf("{\"timestamp\":%.0f,\"cpu\":", (double)wall.tv_sec * 1000.0 + wall.tv_usec / 1000.0);
    if (usage >= 0) printf("%.3f", usage); else printf("null");
    printf(",\"thermal\":%ld", (long)NSProcessInfo.processInfo.thermalState);
    printf(",\"memory\":{\"valid\":%s,\"total\":%llu,\"used\":%llu,\"compressed\":%llu,\"pressure\":%d,\"swap\":", vm_ok && physical_ok && physical ? "true" : "false", (unsigned long long)physical, (unsigned long long)used, (unsigned long long)compressed, pressure);
    if (swap_ok) printf("%llu", (unsigned long long)swap.xsu_used); else printf("null");
    printf("},\"disk\":{\"valid\":%s,\"total\":%llu,\"available\":%llu},", disk_ok ? "true" : "false", disk_ok ? (unsigned long long)disk.f_blocks * disk.f_bsize : 0, disk_ok ? (unsigned long long)disk.f_bavail * disk.f_bsize : 0);
    printf("\"backup\":{\"accessible\":%s,\"checkedAt\":%.0f,\"lastCompleted\":", backup_accessible ? "true" : "false", backup_checked);
    if (backup_completed > 0) printf("%.0f", backup_completed); else printf("null");
    printf("}}\n");
    fflush(stdout);
}
int main(int argc, char **argv) {
    int remaining = -1;
    if (argc == 3 && strcmp(argv[1], "--samples") == 0) {
        remaining = atoi(argv[2]);
        if (remaining < 1 || remaining > 30) return 2;
    } else if (argc != 1) return 2;
    signal(SIGTERM, stop); signal(SIGINT, stop); signal(SIGPIPE, stop);
    while (running) {
        @autoreleasepool { sample(); }
        if (remaining > 0 && --remaining == 0) break;
        sleep(2);
    }
    return 0;
}
