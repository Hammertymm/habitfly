# ISSUE-00 — Walking skeleton & PWA shell

**Slice type:** Tracer bullet (foundation)
**Depends on:** — (start here)
**Demo when done:** Install HabitFly to the iPhone home screen, open it with the network off, and see the black Fly canvas with a `HabitFly` wordmark header and a working 3-tab bar (Today · Habits · Settings) — each tab an empty placeholder.

---

## Why this is a vertical slice
It proves the **whole delivery pipeline end-to-end** — GitHub → static host → service-worker install → offline launch → render in the Fly look — before any feature exists. Everything else hangs off this thread.

## User-visible outcome
- A real, installable PWA. "Add to Home Screen" gives a HabitFly icon ([`../habitfly_logo.png`](../habitfly_logo.png)).
- Launches offline after first load.
- Pure-black canvas, `Habit` (white) + `Fly` (green) wordmark, bottom tab bar with 3 tabs that switch.

## In scope
- `index.html`, app CSS with the **PRD §2.2 design tokens** as CSS variables, JS entry.
- **Web App Manifest** (`manifest.webmanifest`): name `HabitFly`, short_name `HabitFly`, `display: standalone`, `background_color`/`theme_color` `#000000`, icon set generated from `habitfly_logo.png`.
- **Service worker**: cache the app shell (HTML/CSS/JS/fonts/icon) so the app loads fully offline.
- Fonts wired: **Inter** (UI) and **D-DIN** (numbers) — self-hosted/cached, no network dependency at runtime.
- Tab-bar component + simple client-side view switching (Today / Habits / Settings), each rendering a placeholder.
- Content column `max-width: 430px`, centered.

## Out of scope (later slices)
- Any habit data, creation, or persistence → ISSUE-01.
- FAB behaviour, onboarding → ISSUE-09.

## Implementation notes by layer
- **PWA:** manifest + service worker registered on load; precache the shell; cache-first for shell assets. Verify "installable" in iOS Safari.
- **UI:** define every colour as a CSS variable from PRD §2.2. Card base style ready for reuse: `background:var(--card);border:1px solid var(--sep);border-radius:12px`.
- **Logic/Data:** a thin view-router only (e.g. `setActiveTab(name)`); no storage yet.
- **Repo:** structured to deploy as a static site from the GitHub `habitfly` repo.

## Acceptance criteria
- [ ] Visiting the site once, then going offline, the app still loads and runs.
- [ ] "Add to Home Screen" on iOS shows the HabitFly fly icon and opens in standalone (no Safari chrome).
- [ ] Header shows the `HabitFly` wordmark with `Fly` in `--green` (#06f03c).
- [ ] Background is pure black; cards/placeholders use `--card` with a `--sep` border.
- [ ] Tapping each of the 3 tabs switches the visible view.
- [ ] Inter renders for UI text; D-DIN is available for numeric text.
- [ ] No streaks, accounts, network calls, analytics, or sound anywhere.

## Reference
PRD §2 (tokens/typography/assets), §4 (IA / 3 tabs), §8 (architecture), §11.11.
