# ISSUE-05 — Backdating via expanded heatmap

**Slice type:** Vertical slice
**Depends on:** ISSUE-03, ISSUE-04
**Demo when done:** Tap a habit's card body — the heatmap expands. Tap a past square: for a binary habit it toggles done/empty instantly; for a multi-count habit a small +/− stepper opens to set that day's count. The square recolours live and the change persists.

---

## Why this is a vertical slice
Adds the **edit-the-past thread** through the heatmap: a new interaction (card-body tap → expand), per-type editing, write-back to completions, live recolour. Closes the "I forgot to log yesterday" loop without any guilt mechanics.

## User-visible outcome
- **Tap the card body** (not the check button, not a swipe) → expands a larger heatmap for that habit.
- **Tap any past square** (and today):
  - **Binary:** toggles that day **done ↔ empty** instantly. **[RESOLVED: smart per type]**
  - **Multi-count:** opens a **small stepper popover (+/−)** to set that day's count; gray/orange/green updates live.
- No time-limit window — any past day is editable.

## In scope
- Card-body tap → expanded heatmap view/state.
- Per-type square editing (binary toggle vs multi stepper popover) writing to the `Completion` store.
- Live recolour of edited cells.

## Out of scope (later slices)
- Schedule edits and the target-cap rule → ISSUE-06.
- Reduce-Motion instant variants of the expand animation → ISSUE-10.

## Implementation notes by layer
- **UI:** ensure three separate gesture targets per card don't collide — **check button** (today action), **swipe** (ISSUE-07, edit/archive), **card body tap** (expand heatmap). The expanded view can be inline-expand or a detail surface; keep it within the offline shell.
- **Logic:** editing a past day creates/updates/deletes that `(habitId, date)` completion exactly like today's logic, just for an arbitrary date.
- **Data:** no schema change; reuse the completion helpers.
- **Multi stepper:** clamp `0..target` for that habit; at 0, delete the record.

## Acceptance criteria
- [ ] Tapping the card body expands the heatmap; tapping the check button or swiping does not.
- [ ] Binary: tapping a past square toggles done/empty and the colour updates immediately.
- [ ] Multi-count: tapping a past square opens a +/− stepper; setting a value recolours the square (gray/orange/green).
- [ ] Any past day is editable (no locked window); today is editable here too.
- [ ] Backdated changes persist across reload and offline.

## Reference
PRD §4 (card-body tap), §6.3, §6.4 **[RESOLVED]**, §11.7.
