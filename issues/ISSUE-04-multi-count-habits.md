# ISSUE-04 — Multi-count habits (target, +1 / −1, orange)

**Slice type:** Vertical slice
**Depends on:** ISSUE-02, ISSUE-03
**Demo when done:** Create a "Drink 8 glasses of water" habit with a target. On Today, each tap of its check button adds +1 (card shows `5/8`); long-press removes one. Below target the heatmap cell is orange; at target it's green.

---

## Why this is a vertical slice
Extends the create → complete → heatmap thread to the **counted** case, adding the third heatmap state (orange). Touches creation, completion logic, card display, and heatmap colouring together.

## User-visible outcome
- Create screen gains a **"Once daily" vs "Multiple times"** choice; choosing multiple reveals a **target** input (e.g. 1–99).
- On Today: **tap = +1** toward target; **long-press = −1.** Card shows `count/target` in **D-DIN**.
- States: `count==0` gray; `0<count<target` **orange** (`--orange` #ff9f0a); `count>=target` green/done.
- Heatmap shows orange for partial past days, green for met-target days.

## In scope
- Habit `type:'multi'` + `target` (PRD §7.1).
- Multi-count completion logic: increment/decrement, clamp `0..target`; delete the record at 0.
- `count/target` label on the card (D-DIN).
- Heatmap orange fill for partial days (slot into the ISSUE-03 component).

## Out of scope (later slices)
- Backfilling past multi-count days via stepper → ISSUE-05.
- Editing target after creation + the lower-target cap rule → ISSUE-06.

## Implementation notes by layer
- **Data:** reuse `Completion.count`; for multi habits the count climbs to target. Still no zero-count rows.
- **Logic:** tap `+1` (cap at target), long-press `−1` (floor at 0 → delete record). Recompute card colour/label from count vs target.
- **UI:** binary habits keep their simple toggle; only multi habits show `count/target` and accept long-press. Heatmap: choose gray/orange/green from count vs that day's target.
- **Edge:** at `target`, a further tap should not exceed target (undo is long-press, per PRD §6.3).

## Acceptance criteria
- [ ] Create screen offers "Once daily" vs "Multiple times"; the latter reveals a target field.
- [ ] Tap adds +1 up to target; long-press subtracts 1 down to 0.
- [ ] Card shows `count/target` in D-DIN for multi habits.
- [ ] Heatmap cell is orange when `0 < count < target`, green when `count >= target`, gray at 0.
- [ ] Binary habits are unaffected (still simple toggle, no count label).
- [ ] All of the above persists across reload and offline.

## Reference
PRD §5.2, §6.3, §6.5, §7.1–7.2, §11.5.
