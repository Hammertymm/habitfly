# HabitFly — Build Issues (vertical slices / tracer bullets)

This folder breaks [`../PRD.md`](../PRD.md) into **independently grabbable issues**. Each one is a **vertical slice**: a thin thread cut through the *entire* stack — data → logic → UI → persistence — that ends in something you can **open and use**. After each slice lands, the app does a little more and still runs.

### Why slice it this way (plain-language)

A **tracer bullet** is a term from *The Pragmatic Programmer*. Instead of building all the plumbing first and hoping it works when you finally connect a UI (a "horizontal" approach), you fire one thin shot through every layer at once to see where it lands — then thicken it. The payoff for you:

- **Always runnable.** You never have a half-built data layer with nothing to look at.
- **Grab any ready slice.** Each file is self-contained enough to hand to one session/agent.
- **Demo after every slice.** Each issue states the exact thing you can show once it's done.

### How to use these files

1. Start at **ISSUE-00** (the walking skeleton — the actual first tracer bullet).
2. Pick the next slice whose **Depends on** is satisfied. Hand that file to a build session.
3. Each file has testable **Acceptance criteria** — the slice isn't done until they all pass.

### Slice map & dependencies

```
00 Walking skeleton & PWA shell  ── foundation for everything
        │
01 Create a habit (binary) ───────────────┐
        │                                  │
02 Check off today + feedback       09 Onboarding + empty states
        │                                  (needs 01)
03 Card heatmap
        │
04 Multi-count habits
        │
05 Backdating (expanded heatmap)
        │
06 Edit habit
        │
07 Habits tab: archive / restore / reorder
        │
08 Settings: export / import / delete all
        │
10 Resilience & accessibility polish  ── cross-cutting, last
```

| # | Slice | Depends on | Demo after it lands |
|---|---|---|---|
| [00](ISSUE-00-walking-skeleton.md) | Walking skeleton & PWA shell | — | Installs to home screen, opens offline, 3 empty tabs in the Fly look |
| [01](ISSUE-01-create-binary-habit.md) | Create a binary habit | 00 | Add a habit; it shows on Today (scheduled days) and Habits; survives reload |
| [02](ISSUE-02-check-off-today.md) | Check off today + feedback | 01 | Tap to complete; scale + green flash; completed habit reorders; persists |
| [03](ISSUE-03-card-heatmap.md) | Card heatmap | 02 | Each card shows a 16-week heatmap; today is ringed; greens appear as you log |
| [04](ISSUE-04-multi-count-habits.md) | Multi-count habits | 02, 03 | Water-style habit: tap +1 / long-press −1; orange partial, green at target |
| [05](ISSUE-05-backdating-heatmap.md) | Backdating via expanded heatmap | 03, 04 | Tap a card to expand; tap past squares to backfill (toggle or stepper) |
| [06](ISSUE-06-edit-habit.md) | Edit habit | 01, 04 | Edit anything anytime; lowering a target caps today's count |
| [07](ISSUE-07-habits-tab-archive-reorder.md) | Habits tab: archive / restore / reorder | 01, 06 | Active/Archived segments; swipe to archive/edit; drag to reorder; restore |
| [08](ISSUE-08-settings-export-import.md) | Settings: export / import / delete all | 01 | JSON backup round-trips to a new device; nuclear reset works |
| [09](ISSUE-09-onboarding-empty-states.md) | Onboarding + empty states | 01 | First-run branded screen; "No habits yet" empty state |
| [10](ISSUE-10-resilience-accessibility.md) | Resilience & accessibility polish | all | Reduce Motion, corrupt-storage recovery, scale warning, contrast/targets |

### Conventions shared by every slice

- **Brand tokens** come from PRD §2.2 (`--bg:#000`, `--card:#111114`, `--green:#06f03c`, `--orange:#ff9f0a`, `--heatmap-empty:#2c2c2e`, Inter + D-DIN). Never invent colours.
- **Stack:** PWA + `localStorage` + service worker, full offline, iOS-Safari-first, deploy from the GitHub `habitfly` repo. No frameworks-with-accounts, no SQLite, no cloud.
- **Forbidden in every slice:** streaks, fire icons, "X days" counts, gamification, haptics, sound, accounts, analytics, paywalls. (PRD §1, §2.1.)
- **Definition of done:** acceptance criteria pass **on an iPhone via Add-to-Home-Screen, offline.**
