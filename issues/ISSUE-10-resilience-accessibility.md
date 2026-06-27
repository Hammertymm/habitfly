# ISSUE-10 — Resilience & accessibility polish

**Slice type:** Cross-cutting hardening slice (do last)
**Depends on:** all prior slices
**Demo when done:** Turn on Reduce Motion → completions become instant, no animation. Corrupt the local store → the app offers a graceful recovery path instead of breaking. Add many habits/long history → a gentle "consider archiving" suggestion appears. Contrast and touch targets pass a basic check.

---

## Why this is a vertical slice
Earlier slices each shipped working behaviour; this one threads **the resilience and accessibility requirements** across all of them so the app is launch-grade, not just demo-grade.

## User-visible outcome
- **Reduce Motion (`prefers-reduced-motion`):** every animated change (completion scale/flash, heatmap fill, screen transitions) becomes **instant**.
- **Silent error handling:** storage save failures retry in the background; the user sees nothing unless it's fatal.
- **Corrupt-storage recovery:** if local data is unreadable, attempt recovery in order — iCloud (if/when available) → local JSON export → offer "Start fresh" reset with a data-loss warning.
- **Scale warning:** with very large datasets (e.g. 50+ habits / years of data), show a gentle suggestion to archive old habits. No hard cap.
- **Accessibility basics:** sufficient contrast, ≥44px touch targets, sensible labels.

## In scope
- Reduce-Motion variants for all motion introduced in ISSUE-02/03/04/05.
- Background-retry wrapper around storage writes; fatal-only surfacing.
- Corrupt-store detection + recovery flow (PRD §8.1).
- "Warn at scale" suggestion (PRD §10).
- Contrast / touch-target / labelling pass.

## Out of scope
- Full WCAG AA audit, VoiceOver flows → post-launch (PRD §9 "best effort at launch").
- Analytics/crash reporting → not in v1.

## Implementation notes by layer
- **UI:** honour `prefers-reduced-motion` globally; one place to switch animations to instant. Audit tap targets and text contrast against `--bg`/`--card`.
- **Logic:** wrap localStorage writes with try/retry; detect parse failures on read and route into recovery.
- **Data:** recovery reuses the ISSUE-08 import path for "restore from local JSON export."

## Acceptance criteria
- [ ] With Reduce Motion on, completing a habit changes state instantly (no scale/flash); heatmap fills instantly.
- [ ] A simulated storage write failure retries silently and does not interrupt the user.
- [ ] A simulated corrupt store presents the recovery flow (restore or start-fresh), not a crash.
- [ ] A large dataset triggers a non-blocking "consider archiving" suggestion; nothing is hard-capped.
- [ ] Primary controls are ≥44px and meet basic contrast against the dark canvas.

## Reference
PRD §6.3 (Reduce Motion), §8.1–8.2, §9, §10 (scale warning), §11.10.
