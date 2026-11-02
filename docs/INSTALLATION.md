# Installation and interpretation

## Install the plugin

1. Install Stream Deck from the [official Elgato downloads page](https://www.elgato.com/downloads).
2. Use macOS 13 or later and Stream Deck 6.9 or later.
3. Double-click the supplied `com.astakhoff.mac-health.streamDeckPlugin` installer.
4. Search the actions list for **Mac Health**.
5. Drag **Memory** onto one key, **CPU** onto another, and optionally **Disk** onto a third.

The keys are independent. They do not alternate between metrics and there is no combined key. Add them to any existing page, or create a separate page for Mac Health.

Colors are fixed: green means normal, yellow warning, and red critical. These words appear only in the settings panel; the key uses that space for larger details. CPU has configurable usage thresholds; Disk has configurable available-space percentage and GiB thresholds. Memory uses macOS pressure status rather than configurable occupied-RAM thresholds.

## Reading the keys

- **Memory:** occupied-RAM estimate, macOS pressure status, and current swap allocation. High occupied RAM or swap alone does not necessarily imply critical pressure. Yellow/red pressure is a reason to inspect your workload in Activity Monitor.
- **CPU:** overall usage, averaged over up to 10 seconds. The first reading needs a second counter sample, so CPU initially says Sampling. The bottom line shows the actual window.
- **Disk:** percentage used and available GiB on the startup data volume. Freeing disk space and closing applications are your own actions; the plugin never does either automatically.

Press Memory or CPU to open Activity Monitor. Press Disk to open Disk Utility. These launches only occur when you press a key.

## Troubleshooting

| Display | Meaning and next step |
| --- | --- |
| Waiting | Waiting for the helper's first reading. |
| Sampling | CPU needs at least two native counter reads; allow about 2 seconds. |
| Unknown | A particular system metric is unavailable. Read the details in the settings panel. |
| Offline | Helper failed or the last sample is older than 6.5 seconds. Check that the installed `bin/mac-health` helper exists. Reinstall the complete package. |
| PROBE_UNAVAILABLE | The native helper could not start or exited. Confirm macOS compatibility and reinstall from a trusted build. |
| INVALID_SAMPLE | The helper returned malformed data; no healthy status is fabricated. Reinstall if this persists. |

Sampling pauses when all Mac Health keys are hidden. It restarts automatically when a key appears. After sleep or a long gap, the CPU averaging window resets. The plugin cannot keep updating if macOS itself is completely unresponsive.

The pressure sysctl is an internal macOS interface and may change. A missing pressure state yields Unknown even if the RAM percentage is still available. No permissions should be granted to work around a missing system counter.

## Remove

Remove Mac Health through Stream Deck's plugin management. This plugin has no login items, LaunchAgents, background service, or server-side records. The sampler runs only as a child of the plugin, and stops when no key is visible or when the plugin exits.
