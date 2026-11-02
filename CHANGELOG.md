# Changelog

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
