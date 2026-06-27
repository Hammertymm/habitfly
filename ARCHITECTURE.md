# How HabitFly is built

A plain-English orientation for future-you (or anyone new). HabitFly is a
**vanilla-JavaScript Progressive Web App** — no framework, no build step, no
dependencies. You edit files, refresh the browser, and that's it. If you can
read HTML/CSS/JS, you can change anything here.

---

## The whole project in one breath

A single HTML page loads two scripts. `store.js` is the **data** (habits +
history in `localStorage`). `app.js` is the **app** (draws the screens, handles
taps). A service worker (`sw.js`) caches everything so it works offline. Pushing
to `main` publishes it to GitHub Pages.

---

## File map

| File | Job |
|---|---|
| `index.html` | The page skeleton: header, 3 empty tab `<section>`s, the tab bar, the FAB, an overlay div for push-screens, and one hidden file input. Almost everything visible is drawn by JS into the empty sections. |
| `styles.css` | All styling. Starts with the **design tokens** (`--bg`, `--green`, …) as CSS variables — change a colour in one place, it updates everywhere. Self-hosts the fonts via `@font-face`. |
| `store.js` | **Data layer.** Exposes a global `Store` object. Owns the `localStorage` read/write, the habit + completion shapes, scheduling, export/import. **No DOM code here.** |
| `app.js` | **Controller.** Exposes `HabitFly`. Renders the tabs and cards, handles every tap, runs the create/edit/detail screens. **Talks to data only through `Store`.** |
| `sw.js` | Service worker. Caches the app shell; serves it offline; auto-updates (see below). |
| `manifest.webmanifest` | Tells the phone it's an installable app (name, icon, standalone, colours). |
| `fonts/`, `habitfly_logo.png` | Self-hosted assets so nothing depends on the network at runtime. |

The big idea: **`store.js` knows nothing about the screen, `app.js` knows
nothing about `localStorage`.** That separation is why each is easy to change
without breaking the other.

---

## The data model (`store.js`)

Everything lives under one `localStorage` key: `habitfly.v1`.

```js
state = {
  habits: [ Habit, … ],
  completions: { [habitId]: { 'YYYY-MM-DD': count } },  // count >= 1; 0 is never stored
  onboarded: boolean,
  settings: { theme, version }
}

Habit = {
  id,                 // UUID
  name,
  schedule,           // 7 booleans, index 0 = Monday … 6 = Sunday
  colour,             // a Fly-palette hex; CARD ACCENT ONLY — never the heatmap
  type,               // 'binary' | 'multi'
  target,             // 1 for binary; the goal for multi
  archived,           // hidden from Today/Active when true
  order               // manual sort position
}
```

Two rules that matter:
- **Absence = not done.** We never store a `0`. "Did nothing on Tuesday" is
  simply the lack of a record, which the heatmap draws as gray.
- **A day's colour is derived, not stored.** `Store.dayState(habit, date)`
  returns `'empty' | 'partial' | 'done'` by comparing the count to the target.
  That one function is the single source of truth for heatmap colours.

Dates are local `YYYY-MM-DD` strings (what the phone's calendar says), so there
are no timezone surprises.

---

## How the screen gets drawn (`app.js`)

There's no virtual DOM and no templating library — just **template strings →
`innerHTML`**.

- `render()` looks at which tab is active and calls `renderToday()`,
  `renderHabits()`, or `renderSettings()`, which build an HTML string and drop
  it into that tab's `.view-body`.
- A habit **card** = accent dot + name + (count) + check button + a 112-cell
  heatmap, all from `cardHTML()`.
- After any change (a tap, a save), we just call `render()` again to rebuild the
  visible list. Simple and predictable. (Trade-off: it rebuilds more than
  strictly necessary — fine for a normal number of habits. See *Known
  trade-offs*.)

### One listener to rule them all (event delegation)

Because cards are constantly rebuilt, we don't attach a listener to each button.
Instead there's **one** `click` listener on `document` that figures out what was
clicked using `event.target.closest('.some-class')` and acts accordingly. Add a
new button? Give it a class and add one `if` branch in that handler. Gestures
(swipe / drag / long-press) use `pointerdown/move/up` the same way.

### Screens

Create, edit, and the expanded heatmap are "push screens" — full-screen overlays
rendered into the `#screen` div by `openScreen(html)` and dismissed by
`closeScreen()`. Onboarding and the corrupt-data recovery prompt are similar
overlays appended to `<body>`.

---

## A couple of flows, end to end

**Tapping a habit's check button**
`click` handler → `completeToday(id)` → `Store.incMulti` / `Store.toggleBinary`
(writes to `localStorage`) → `render()` (rebuilds Today, re-sorts) →
`popCard()` (the scale + flash, skipped under Reduce Motion).

**Backdating a past day**
Tap card body → `openDetail(id)` (expanded interactive heatmap) → tap a past
cell → `handleDayEdit` → binary toggles instantly; multi opens a stepper
popover → `Store.setCount` → recolour.

---

## Offline & auto-updating (`sw.js`)

The service worker uses **stale-while-revalidate**: it serves the cached copy
instantly (so the app is fast and works with no network), then fetches the
latest in the background and updates the cache. Result: when you push a change,
users get it on their **next** launch — you do **not** need to bump a version
string by hand. (Bump `CACHE` only if you ever want to force-purge everything.)

---

## Running & shipping

- **Run locally:** serve the folder over `http://` (a service worker won't run
  from `file://`). Any static server works. Then open the URL.
- **Ship:** `git push` to `main`. GitHub Pages rebuilds in ~1 minute. All paths
  are **relative** (`./`, `store.js`), so it works under the `/habitfly/`
  subpath without changes.

---

## Known trade-offs (intentional, for later if ever needed)

- **Full re-render per tap.** `render()` rebuilds the whole visible list. Clean
  and bug-resistant; could be optimized to update a single card if you ever have
  dozens of habits and notice jank.
- **Some duplicated logic** (e.g. the toggle-button rows). Left simple on
  purpose; a small generic helper could collapse it later.

If you change how a "day" is coloured, edit **`Store.dayState`** — everything
downstream follows from it.
