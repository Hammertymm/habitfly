# ISSUE-06 — Edit habit (full edit, target-cap rule)

**Slice type:** Vertical slice
**Depends on:** ISSUE-01, ISSUE-04
**Demo when done:** Open a habit's edit screen, change its name / schedule / colour / type / target, and save. Lowering a multi-count target below today's count caps it (8→5 while at 6 becomes 5/5 = green). Past heatmap squares are not rewritten.

---

## Why this is a vertical slice
Adds the **modify thread** end-to-end: reuse the Create screen for editing → write back to the habit → apply the one non-obvious rule (target cap) → ensure history stays intact (no retroactive recalc).

## User-visible outcome
- An **Edit Habit** screen (same form as Create, pre-filled) reachable from the habit (and via swipe-right in ISSUE-07).
- **Everything is editable anytime:** name, schedule, colour, type (binary ↔ multi), target, icon.
- **Lowering target below today's count → cap today's count to the new target** (e.g. 8→5 at 6 → 5/5, green).
- **Schedule changes are forward-only:** past heatmap squares never recalculate.

## In scope
- Edit screen (reuses ISSUE-01 / ISSUE-04 form), pre-populated.
- Persist edits to the existing `Habit` record (same `id`).
- Target-cap-on-lower logic for today's completion.
- Guarantee no retroactive recompute of past completions on schedule change.

## Out of scope (later slices)
- Swipe-right entry point + archive → ISSUE-07 (this slice exposes a temporary entry point, e.g. from the expanded heatmap/detail).
- Delete (permanent) → lives in Settings, ISSUE-08.

## Implementation notes by layer
- **UI:** one shared form component for Create and Edit; in edit mode it loads current values and saves in place.
- **Logic:** on save, if `type` is multi and new `target < today's count`, set today's count = target (PRD §10). Changing binary↔multi must keep data coherent (define sensible handling of existing counts).
- **Data:** update the habit in localStorage by `id`; do not touch `Completion` rows for past dates.

## Acceptance criteria
- [ ] I can edit name, schedule, colour, type, and target of an existing habit and save.
- [ ] Lowering a multi-count target below today's count caps today to the new target (becomes complete/green if met).
- [ ] Changing a habit's schedule does not alter any past heatmap squares.
- [ ] Edits persist across reload and offline; the habit keeps its original `id` and history.

## Reference
PRD §6.5, §7.1, §10 (target-cap; no retroactive recalc), §11 (general).
