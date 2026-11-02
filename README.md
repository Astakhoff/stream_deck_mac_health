# Mac Health

Three separate Stream Deck keys for macOS: **Memory**, **CPU**, and **Disk**. Add any combination; there is no combined dashboard action.

![Three independent Mac Health keys with illustrative readings](docs/mac-health-preview.png)

The keys help you notice resource pressure while working with many applications. They monitor your Mac locally; they do not quit apps, clear memory, change system settings, or predict every crash or freeze.

## What each key means

| Key | Large number and bar | Status color | Bottom line |
| --- | --- | --- | --- |
| Memory | Estimated physical RAM used | macOS coarse memory-pressure level | Swap currently allocated |
| CPU | Average total CPU usage over up to 10 seconds | Configurable CPU thresholds | Actual averaging window |
| Disk | Used startup data-volume capacity | Configurable available-space thresholds | Available space in GiB |

Each action has its own settings. All visible actions share one small native sampler, which reads system counters every **2 seconds**. Sampling stops when no Mac Health action is visible. Press Memory or CPU to open Activity Monitor; press Disk to open Disk Utility.

### Memory

The percentage estimates physical memory used by anonymous pages, wired pages, and the physical compressor, subtracting purgeable anonymous pages. Reclaimable file cache is excluded. This is an estimate and may differ from Activity Monitor's Memory Used figure.

Color follows the system's coarse pressure level: **Normal** (green), **Warning** (yellow), or **Critical** (red). It is not a reproduction of Activity Monitor's pressure graph. A large swap allocation alone does not make the key red: swap can remain allocated after a busy period. Compressed memory, RAM capacity, swap, and the raw pressure level are shown in the settings panel.

Apple explains why memory pressure is more useful than treating occupied RAM as a problem: [Check if your Mac needs more RAM](https://support.apple.com/guide/activity-monitor/actmntr34865/mac).

### CPU

CPU usage is calculated from changes in system-wide Mach CPU ticks. **100% means the entire logical CPU capacity is busy**, unlike Activity Monitor's per-process percentages, which can exceed 100%. The key smooths up to five 2-second samples. During startup it shows the shorter actual window; after a long sampling gap it starts a new window.

Defaults: **Warning at 80%**, **Critical at 95%**. Brief spikes are averaged; this is not a temperature, thermal throttling, or GPU monitor.

### Disk

Disk reads available capacity on `/System/Volumes/Data`. Defaults:

- Warning: **10% or less free**, or **20 GiB or less available**.
- Critical: **5% or less free**, or **10 GiB or less available**.

Either condition triggers the corresponding status. APFS volumes share container space, so usage may differ from a Finder storage breakdown. Purgeable storage is not treated as immediately available. This key monitors space, not disk activity, SMART data, or SSD wear.

## Install

Requirements: **macOS 13+**, **Stream Deck 6.9+**, and a Stream Deck keypad or compatible virtual keys. Apple Silicon and Intel are included in the same native helper. Users installing a packaged build do not need Node.js or Xcode separately; Stream Deck provides its Node runtime.

For a packaged build, double-click `com.astakhoff.mac-health.streamDeckPlugin`, then find **Mac Health** in the action list. Drag **Memory**, **CPU**, and **Disk** onto three separate keys. See [installation and troubleshooting](docs/INSTALLATION.md).

This project is for direct/internal use. It has **not been submitted to Elgato Marketplace**. No store publication is automated.

## Build from source

Build on macOS with Node.js 20.5.1+ and Xcode Command Line Tools:

```sh
npm ci
npm run setup
npm run build:native
npm test
npm run validate
npm run pack
```

The installer and SHA-256 checksum are written to `dist/`. `build:native` compiles and ad-hoc signs a universal `arm64` + `x86_64` helper. Signing makes the build locally identifiable; it is not Developer ID notarization. No administrator privileges are required.

## Data and permissions

No account, tokens, Keychain access, Full Disk Access, Accessibility permission, or network requests are required. The plugin reads aggregate operating-system counters and filesystem capacity. It does not enumerate apps, read documents, or retain resource history. See [privacy](PRIVACY.md) and [security](SECURITY.md).

## Implementation

- `native/mac-health.c`: read-only Mach, sysctl, and filesystem sampler.
- `com.astakhoff.mac-health.sdPlugin/bin/metrics.js`: validation, averaging, thresholds, and stale handling.
- `bin/monitor.js`: one shared helper with bounded buffering and restart backoff.
- `bin/controller.js`: three independent action instances, their settings, and UI updates.
- `bin/plugin.mjs`: official Elgato Node SDK connection.

The undocumented `kern.memorystatus_vm_pressure_level` sysctl supplies the coarse pressure state. If it is unavailable or unrecognized, Memory shows an unknown status rather than inventing a healthy one. Measurements older than 6.5 seconds are hidden and shown as Offline. A system-wide freeze can prevent the monitor from repainting; this tool cannot guarantee an advance warning.

## License and AI assistance

MIT. Developed with substantial OpenAI Codex assistance in implementation, tests, documentation, and vector artwork, under human product direction. Independent project; not affiliated with Apple or Elgato.
