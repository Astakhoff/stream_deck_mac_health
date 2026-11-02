# Changelog

## 1.4.0 — 2026-11-02

- Press Disk to toggle saved Used / Remaining percentage and matching GiB.
- Keep the bar tied to used capacity and color tied to available-space thresholds in both modes.
- Remove the Free space caption and enlarge the capacity amount.

## 1.3.0 — 2026-11-02

- Add a separate Time Machine Backup action with a large elapsed age and an ago footer.
- Read local completion metadata every minute without mounting disconnected destinations.
- Use fixed green/yellow/red age thresholds and explicit Unknown for unavailable dates.
- Keep exact completion and metadata-check timestamps in settings.

## 1.2.0 — 2026-11-02

- Replace static swap amounts and the CPU averaging label with schematic rolling 5-minute graphs.
- Keep graphs free of axes, scale labels, legends, and extra numbers.
- Retain only bounded recent samples in memory; show gaps after missed readings and sleep.
- Include native macOS thermal state in CPU status color, without claiming a Celsius temperature.

## 1.1.0 — 2026-11-02

- Replace Normal / Warning / Critical key labels with fixed green / yellow / red colors.
- Enlarge swap, free-space, and CPU-window details using the available lower area.
- Keep unavailable-state labels and detailed status in action settings.

## 1.0.0 — 2026-11-02

- Add separate Memory, CPU, and Disk actions for macOS.
- Show system memory pressure and swap alongside estimated occupied RAM.
- Average overall CPU load over up to 10 seconds.
- Monitor available startup data-volume capacity with relative and absolute thresholds.
- Share a lightweight native sampler across visible actions and stop it when hidden.
- Include Apple Silicon and Intel in a universal helper.
- English-only interface and documentation. Direct/internal distribution; no Marketplace submission.
