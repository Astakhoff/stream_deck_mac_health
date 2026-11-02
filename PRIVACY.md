# Privacy

Mac Health reads aggregate CPU and virtual-memory counters, physical RAM size, coarse memory pressure, swap allocation, system thermal state, capacity of the macOS startup data volume, and local Time Machine destination completion dates. This information is used only to display four local Stream Deck keys and their settings diagnostics.

Only completion-date values from Time Machine metadata leave the native helper; destination names, identifiers, paths, bookmarks, and backup contents are not sent to the plugin UI or saved. No backup-age history or timestamp cache is written to disk. Time Machine metadata is refreshed once per minute, including when a destination is disconnected.

The plugin makes no Internet requests and uses no developer server. It communicates with the local Stream Deck application over a loopback WebSocket. It does not read credentials, Keychain items, documents, browsing history, process lists, application names, or per-process metrics. No telemetry or disk-based resource-history database is created. A bounded in-memory buffer retains up to 151 readings per metric for rolling 5-minute graphs; it is never uploaded and is cleared when the plugin process exits. Readings outside the current 5-minute window are not displayed. Stream Deck stores per-key display preferences and manages its own logs and settings. The official SDK may write operational logs locally.

The native sampler stops when no Mac Health action is visible. Removing the plugin stops monitoring. No separate service, account, or login item is installed. The plugin never quits applications or changes system settings automatically.

If you choose to report an issue on GitHub, review anything you share. Screenshots and measurements can reveal the state of your computer. The developer receives only information you submit voluntarily through the relevant service.

Support: https://github.com/Astakhoff/stream_deck_mac_health/issues
