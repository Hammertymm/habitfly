# ISSUE-01 — Create a binary habit (first real tracer bullet)

**Slice type:** Tracer bullet (first end-to-end feature)
**Depends on:** ISSUE-00
**Demo when done:** Tap the FAB, fill in a habit name, pick which weekdays it's scheduled, pick a Fly-palette colour, save — and see that habit appear on **Today** (only on its scheduled days) and in the **Habits** list. Reload the app: it's still there.

---

## Why this is a vertical slice
First thread that touches **every layer for one capability**: a Create UI → validation → the `Habit` data model → `localStorage` persistence → rendering on two tabs. It births the data model that later slices thicken.

## User-visible outcome
- A **FAB (+)** on Today and Habits opens a **Create Habit** push screen.
- Required: **name**, **schedule** (any combination of 7 weekdays, default daily), **colour** (Fly palette, ~8 swatches).
- Saving persists the habit and returns to the previous tab.
- Today shows habits **scheduled for today**; Habits shows **all active** habits.
- Cards render: accent-coloured icon slot + habit name. (No heatmap yet, no check yet.)

## In scope
- `Habit` model per PRD §7.1: `id` (UUID), `name`, `schedule` (7-day), `colour`, `type:'binary'`, `target:1`, optional generic `icon`.
- localStorage read/write layer (a small data module other slices reuse).
- Create screen via **push navigation** (new screen on the stack), with the weekday toggle row + Fly-palette swatches.
- Today renders the scheduled-today subset; Habits renders all active habits.
- Basic card component (icon + name) reused by later slices.

## Out of scope (later slices)
- Check button / completion → ISSUE-02. Heatmap → ISSUE-03.
- Multi-count type + target field → ISSUE-04. Editing → ISSUE-06.
- Reorder / archive / swipe → ISSUE-07. Empty-state/onboarding copy → ISSUE-09.

## Implementation notes by layer
- **Data:** define the `Habit` shape and a `habits` collection in localStorage; UUID at creation. Schedule encoding is engineering's choice as long as any 7-day combo works (PRD §7.1).
- **Logic:** "is this habit scheduled today?" = does its schedule include the device-local weekday. Today filters on this.
- **UI:** Fly-palette swatch set (~8 colours) — colour is **card-accent only**; never used in a heatmap. Create screen validates that name + schedule + colour are present.
- **PWA:** new screen/assets must remain in the offline shell cache.

## Acceptance criteria
- [ ] FAB on Today and Habits opens the Create screen (push navigation).
- [ ] I can set name + pick any combination of weekdays + pick a Fly-palette colour.
- [ ] Saving stores the habit in localStorage and returns to the previous tab.
- [ ] A Mon/Wed/Fri habit appears on Today on Wednesday but not on Tuesday.
- [ ] The habit appears in the Habits list regardless of weekday.
- [ ] After a full reload (and offline), the habit is still there.
- [ ] Card accent uses the chosen colour; no heatmap or check control yet.

## Reference
PRD §5.1, §6.2, §6.5, §7.1, §11.2.
