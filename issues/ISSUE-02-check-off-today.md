# ISSUE-02 — Check off today + completion feedback + ordering

**Slice type:** Vertical slice
**Depends on:** ISSUE-01
**Demo when done:** On Today, tap a habit's check button — it animates (scale + green flash), marks done, and the card slides to sit directly below the last undone scheduled habit. Tap again to undo. Reload: the completion sticks.

---

## Why this is a vertical slice
Adds the **completion thread** end-to-end for binary habits: tap → `Completion` record → persistence → visual feedback → list reordering. This is the daily ritual the whole app exists for.

## User-visible outcome
- A **check button** at the **bottom-right of each card** (EverGreen position).
- **Binary:** tap = done (green); tap again = undone.
- **Feedback:** ScoreFly-style **scale (~0.977) + green flash**; **no haptics, no sound.**
- **Reordering:** a completed habit moves **directly below the last undone scheduled habit** for the day. Incomplete-first ordering on Today.

## In scope
- `Completion` model per PRD §7.2: one record per `habitId` + `date` (`YYYY-MM-DD`, device local), `count >= 1`. **Zero-count days store no record.**
- Toggle logic: completing writes a record (count 1); undoing deletes it.
- Completion animation (scale + green flash), ~150ms.
- Today ordering rule (incomplete first; completed moves below last undone scheduled habit).

## Out of scope (later slices)
- Heatmap rendering of completions → ISSUE-03 (data is produced here; the grid is drawn there).
- Multi-count +1/−1 and orange → ISSUE-04.
- Reduce-Motion handling → ISSUE-10 (instant variant).

## Implementation notes by layer
- **Data:** `Completion { habitId, date, count }`; helper to get/set/delete today's completion. Date = device-local `YYYY-MM-DD` (PRD §7.2).
- **Logic:** "done today?" = a completion exists for `(habitId, today)`. Ordering recomputed on each toggle.
- **UI:** check button is a distinct tap target from the card body (card-body tap is reserved for ISSUE-05). Animate on toggle.
- **PWA:** all writes are synchronous localStorage; must work offline.

## Acceptance criteria
- [ ] Tapping the check button marks a binary habit done with a scale + green-flash animation.
- [ ] Tapping again undoes it; the record is removed from storage.
- [ ] **No vibration and no sound** occur on completion.
- [ ] A completed habit moves directly below the last undone scheduled habit; incomplete stay on top.
- [ ] Completion persists across reload and offline.
- [ ] Completions are stored as `YYYY-MM-DD` in device-local time; no zero-count rows exist.

## Reference
PRD §5.2, §6.2, §6.3, §7.2, §9, §11.3–11.4.
