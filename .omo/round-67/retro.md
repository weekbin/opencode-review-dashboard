# R67 Retro

## What worked
- t()'s params interpolation worked first-try for the {timestamp} and {kind} cases.
- TDD RED → GREEN in 2 cycles (initial test regex was too strict for the multi-param variant).

## What didn't
- Test regex caught a non-issue: my initial `[^"]+` matched the original `t("key")` 1-arg form, but the 2-arg form needs `t("badge.edited.tooltip"` (specific key name) — fixed by tightening.
