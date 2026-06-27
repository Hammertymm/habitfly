# Changelog

All notable changes to HabitFly. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); dates are `YYYY-MM-DD`.

## [1.0.0] — 2026-06-27

First public release. Live at <https://hammertymm.github.io/habitfly/>.

A calm, offline-first habit tracker built as a dependency-free PWA. Heatmap-first,
no streaks, no guilt, no accounts. Part of the **Fly** app family.

### Added
- **Installable PWA shell** — black Fly canvas, `HabitFly` wordmark, 3 tabs
  (Today · Habits · Settings), self-hosted Inter + D-DIN fonts, full offline.
- **Create habits** — name, any 7-day schedule, a Fly-palette accent colour,
  and "once daily" vs "multiple times" with a per-day target.
- **One-tap completion** — binary habits toggle done/undone with a scale +
  green-flash animation; Today lists incomplete habits first and slides
  completed ones below the last undone.
- **16-week heatmaps** on every card (gray / orange / green), with today ringed.
- **Multi-count habits** — tap `+1` toward the target (partial = orange,
  target = green), long-press `−1`.
- **Backdating** — tap a card to expand its heatmap; tap any past day to toggle
  it (binary) or set a count via a stepper (multi-count).
- **Edit anything** — name, schedule, colour, type, target; lowering a target
  below today's count caps today; schedule changes never rewrite past days.
- **Habits tab** — Active / Archived segments, swipe-right to edit,
  swipe-left to archive, drag-handle to reorder, restore from archive.
- **Settings** — JSON export / import (move between devices), delete-all, about.
- **Onboarding** — one branded first-run screen with a "create your first habit"
  call to action; calm empty states.
- **Resilience & accessibility** — Reduce-Motion support, corrupt-storage
  recovery (import a backup or start fresh), a "consider archiving" hint at
  40+ habits, 44px touch targets.

### Fixed (post-launch code review, same day)
- Swipe/drag/long-press could leave a guard flag set and swallow the next tap.
- Duplicate `id="import-file"` resolved ambiguously; now a single shared input.
- Editing a habit with a non-palette colour silently reset it to green.
- A malformed `completions` blob in a backup could crash the completion handler.
- `save()` re-ran the same failing write silently; now logs instead of hiding it.
- Double-tapping a heatmap day stacked two popovers; now only one.
- Completion animation fired even when nothing changed (multi already at target).

### Changed
- Service worker switched from cache-first to **stale-while-revalidate**, so
  deploys reach users on their next launch without manual cache-version bumps.

### Tech
- Vanilla JS + `localStorage` + service worker. No framework, no build step,
  no dependencies. Hosted on GitHub Pages, auto-deployed from `main`.
