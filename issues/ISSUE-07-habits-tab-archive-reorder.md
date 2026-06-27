# ISSUE-07 — Habits tab: archive / restore / reorder / swipe

**Slice type:** Vertical slice
**Depends on:** ISSUE-01, ISSUE-06
**Demo when done:** On Habits, switch between **Active** and **Archived**. Swipe a card left to archive it (it leaves Today and Active, keeps its history); swipe right to edit. Drag to reorder Active habits. Restore an archived habit and it returns with all history.

---

## Why this is a vertical slice
Completes the **manage-your-habits thread**: the segmented library, the two swipe gestures, manual ordering, and the archive/restore lifecycle — all reading/writing the same `Habit` store.

## User-visible outcome
- **Segmented control: Active | Archived** on the Habits tab.
- **Swipe right = Edit** (opens ISSUE-06 screen).
- **Swipe left = Archive** (non-destructive). Archived habits leave Today and the Active list but keep all completions.
- **Drag to reorder** Active habits (manual sort is the only ordering — no categories, no tags).
- **Archived segment** lists archived habits with **Restore** → returns to Active with full history, landing at the bottom of the sort order.

## In scope
- Active/Archived segmentation driven by the habit's archived state (PRD §7.1 — encoding is engineering's choice).
- Swipe-left archive + swipe-right edit gestures (must not collide with card-body tap from ISSUE-05 or the check button).
- Drag-reorder persistence for Active habits.
- Restore action.

## Out of scope (later slices)
- **Permanent delete** of a single habit is **not** here — permanent delete is a Settings-level "Delete all" in v1 (ISSUE-08). (Per-habit hard delete is out of v1 scope entirely; archive is the off-ramp.)

## Implementation notes by layer
- **Data:** archive = set the habit's archived marker; restore = clear it and place at bottom of sort order. Reorder = persist manual order (encoding engineering's choice).
- **Logic:** Today and Active exclude archived habits; Archived shows only archived.
- **UI:** three coexisting gestures per Active card — **swipe** (archive/edit), **card-body tap** (expand heatmap, ISSUE-05), **check button** (today). Keep them unambiguous. Archived cards can show their heatmap read-only with a Restore button.

## Acceptance criteria
- [ ] Habits tab has Active/Archived segments that filter correctly.
- [ ] Swipe left archives a habit; it disappears from Today and Active but keeps its completions.
- [ ] Swipe right opens the Edit screen.
- [ ] Active habits can be dragged into a new order that persists across reload.
- [ ] Restoring an archived habit returns it to Active with all history, at the bottom of the order.
- [ ] No per-habit "delete" exists here (archive only); swipe gestures don't trigger the heatmap-expand tap.

## Reference
PRD §4, §6.6, §7.1, §10 (restore), §11.8.
