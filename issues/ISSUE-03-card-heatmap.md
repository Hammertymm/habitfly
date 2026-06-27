# ISSUE-03 — Card heatmap (16-week, today ring)

**Slice type:** Vertical slice
**Depends on:** ISSUE-02
**Demo when done:** Each habit card shows an EverGreen-style heatmap of the last 16 weeks. Today's square carries a thin green ring. As you check habits off (ISSUE-02), the matching squares turn green.

---

## Why this is a vertical slice
Connects stored completions to the **hero visualization**. Reads the `Completion` data and renders the grid — the thing the user returns for.

## User-visible outcome
- Per-card heatmap: **~4 rows × ~28 columns = last 16 weeks (112 days)**, oldest at left.
- **Two fills for binary habits:** `--heatmap-empty` (#2c2c2e) for not-done, `--green` (#06f03c) for done.
- **Missed scheduled days look identical to unscheduled days** — same calm gray, no distinction, no guilt.
- **Today's cell** always has a thin `--green` outline/ring, whatever its fill.
- **No streak text, no fire icon, no consecutive-day count — anywhere.**

## In scope
- Heatmap component that maps a date window → cells, colouring each from completion data.
- "Today ring" overlay on the current date's cell.
- Render inside the existing card, below name/check.

## Out of scope (later slices)
- Orange/partial state (multi-count) → ISSUE-04 (the component should be built so orange slots in cleanly).
- Tap-to-expand / backdating → ISSUE-05.

## Implementation notes by layer
- **Logic:** build the 112-day window ending today; for each day, look up a completion → choose fill. Absence of a record = empty/gray.
- **UI:** square size/gap tuned to fit ~28 columns inside the 430px card. Use `--heatmap-empty` and `--green` only. Today ring = 1px `--green` border, no fill change.
- **Data:** read-only over the `Completion` store from ISSUE-02. No new schema.
- **Perf:** rendering 112 cells per card should stay smooth with many habits (sets up the "warn at scale" note in ISSUE-10).

## Acceptance criteria
- [ ] Each card shows a ~4×28 grid covering the last 16 weeks, oldest left.
- [ ] Days with a completion render `--green`; days without render `--heatmap-empty`.
- [ ] A scheduled-but-missed day looks identical to an unscheduled day (no red, no special mark).
- [ ] Today's cell has a thin green ring regardless of its fill.
- [ ] Logging/unlogging today (ISSUE-02) updates the corresponding cell live.
- [ ] No streak/fire/consecutive-day text appears.

## Reference
PRD §2.2, §5.3, §6.3, §11.6.
