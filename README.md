# HabitFly

**Habits anywhere. Simple.**

### ▶︎ Live app: **https://hammertymm.github.io/habitfly/**

Open it in Safari and tap **Share → Add to Home Screen** to install it as an offline app.

HabitFly is a premium-minimalist habit tracker — a calm, deliberate daily check-in with a growing heatmap, and nothing else. It's part of the **Fly family** (sibling to ScoreFly): each app does *one thing properly*.

> _"HabitFly exists for someone rebuilding a daily routine — a calm, deliberate check-in ritual with a growing heatmap, and nothing else."_

## Philosophy

- **Heatmap-first.** The growing heatmap is the only visualization.
- **No streaks, no guilt, no gamification, no productivity creep.** Missed days are quiet gray — never red, never nagging.
- **Fully offline.** No account, no cloud. Your data stays on your device.
- **Visual-only feedback.** Dark, fast, deliberate. Open → log → close in seconds.

## Status — v1 shipped & live

All 11 vertical slices are built and deployed to GitHub Pages.

| Artifact | What it is |
|---|---|
| [`index.html` · `app.js` · `store.js` · `sw.js`](.) | The app — a vanilla-JS offline PWA (no build step, no dependencies) |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | How it's built — a plain-English tour of the code |
| [`CHANGELOG.md`](CHANGELOG.md) | What shipped, version by version |
| [`PRD.md`](PRD.md) | Full product requirements, generated from a 123-question discovery (10 phases) |
| [`issues/`](issues/) | The PRD sliced into 11 buildable **vertical slices** (tracer bullets) |
| [GitHub Issues #1–#11](https://github.com/Hammertymm/habitfly/issues?q=is%3Aissue) | The slices, tracked + closed under the **v1 MVP** milestone with a dependency map |

Every push to `main` auto-deploys to Pages within ~1 minute.

## Design tokens (Fly family — sourced from ScoreFly)

```css
--bg:#000000;  --card:#111114;  --card2:#1c1c1e;  --sep:rgba(255,255,255,.08);
--green:#06f03c;        /* DONE · wordmark "Fly" · CTAs */
--orange:#ff9f0a;       /* PARTIAL (multi-count) */
--heatmap-empty:#2c2c2e;/* not done / missed / unscheduled — all the same calm gray */
--text:#ffffff;  --text-2:rgba(235,235,245,.8);  --text-3:rgba(235,235,245,.4);
```

Fonts: **Inter** (UI), **D-DIN** (numbers). Dark only at launch.

## Tech

PWA · `localStorage` · service worker · **full offline** · iOS-Safari-first (Add to Home Screen) · deployed from this repo.

## Not in v1

Accounts, cloud sync, notifications, home-screen widgets, light theme, analytics, and monetization are all **post-MVP** (see PRD §12–§13).
