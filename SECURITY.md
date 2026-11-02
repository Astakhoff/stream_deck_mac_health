# Security

The sampler performs read-only Mach, sysctl, filesystem-stat, and Foundation thermal-state calls, and narrowly scoped CFPreferences reads of Time Machine completion metadata. It never mounts backup destinations or reads backup contents. It does not invoke a shell, request administrator access, enumerate processes, or modify memory/storage settings. Key presses launch fixed Apple bundle identifiers with `/usr/bin/open`; no user-supplied command or path is executed.

Install packaged native code only from a source you trust. Builds contain a universal, ad-hoc signed helper, not a Developer ID notarized executable. Source and build instructions are available for inspection.

The official Elgato SDK is pinned to 2.1.2. Zod is overridden to patched 4.6.6 because the SDK dependency tree otherwise includes an affected v4-mini implementation. Runtime dependencies are checked separately from the official packaging CLI's development-only dependency chain, which currently has moderate audit findings. The CLI is not included in installers.

The coarse pressure sysctl is not a supported public compatibility contract; unavailable data is shown as Unknown. This monitor cannot guarantee prevention or prediction of crashes or system freezes.

Do not publish personal diagnostics, profiles, tokens, or private files in issue reports. For a security issue, use GitHub private vulnerability reporting if available, or open a minimal issue asking for a private contact channel without publishing sensitive details.
