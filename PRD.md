# HabitFly — Product Requirements Document (v1)

**Tagline:** *Habits anywhere. Simple.*
**Status:** Build-ready (generated from the complete 123-question discovery, 10 phases)
**Source of truth:** [`HABITFLY-DISCOVERY-COMPLETE.md`](HABITFLY-DISCOVERY-COMPLETE.md) — do not contradict answered questions.
**Generated:** 27 June 2026
**Audience:** This PRD is written for Claude Code to build the app. It is intentionally explicit.

> **One-line promise:** *Habit tracking without the bloat.*
> **Vision:** "HabitFly exists for someone rebuilding a daily routine — a calm, deliberate check-in ritual with a growing heatmap, and nothing else."

---

## 0. How to read this document

1. **Guiding principles (§2) are non-negotiable.** Every feature must pass: *Does this help someone build consistent habits?* If no, reject it.
2. **MVP scope is §3–§11.** Anything marked *Post-MVP* (§13) is explicitly out of v1.
3. **Three resolved interaction decisions** (settled after discovery) are flagged with **[RESOLVED]** — see §6.4, §6.5, §2.3.
4. Monetization is **shelved** — see §12. Do not build paywalls, accounts, or tiers in v1.

---

## 1. What HabitFly is (and is not)

HabitFly is a **premium minimalist habit tracker**. It is a calm, deliberate daily check-in with a growing heatmap. That is the whole product.

It is the second app in the **Fly family** (after ScoreFly). Each Fly app does **one thing properly** and shares a loose family resemblance: black canvas, electric-green accent, the `*Fly` wordmark, and the `[Thing] anywhere. Simple.` tagline pattern.

### Reference apps
| App | Role | What we take | What we reject |
|---|---|---|---|
| **EverGreen** | Positive reference | Heatmap-first cards, one-tap check, no account, local-only, calm | Its streak counts ("23 days streak"), fire 🔥 icons, light-only theme |
| **Loggd** | Anti-reference | Dark heatmap aesthetic only | Gamification (XP, badges, levels), Tasks/Focus/Goals tabs, streak numbers, productivity creep |
| **ScoreFly** | Brand sibling | Exact palette, fonts, card style, motion, onboarding pattern | Nothing — match it |

### HabitFly is NOT
- A productivity app, task manager, goal planner, or focus timer
- An AI coach — no motivational quotes, insights, or habit suggestions
- A gamified app — no points, XP, levels, leaderboards, streaks, or social feeds
- A guilt machine — no "streak at risk", no shaming missed days
- A statistics dashboard — the heatmap is the only visualization

---

## 2. Guiding principles & brand

### 2.1 Non-negotiable principles
- **Mobile-first PWA** — iOS Safari "Add to Home Screen" is the primary target.
- **Fast** — open, log a habit, and close within seconds.
- **Heatmaps are the hero** — the primary (only) visualization.
- **Minimal statistics** — no charts, totals, or averages on screen.
- **No streaks, ever** — not as numbers, not hidden in detail.
- **No guilt mechanics** — missed days are quiet gray, never red, never nagging.
- **Visual confirmation only** — completion feels satisfying through animation, not sound or haptics.
- **Every interaction deliberate and satisfying.**
- **Simplicity over feature count.**

### 2.2 Design tokens (sourced from ScoreFly `index.html`)

```css
:root {
  /* Surfaces */
  --bg:        #000000;             /* page background — pure black */
  --card:      #111114;             /* habit cards, sheets */
  --card2:     #1c1c1e;             /* nested/secondary surfaces */
  --sep:       rgba(255,255,255,.08); /* 1px card borders, dividers */

  /* Brand / state */
  --green:     #06f03c;             /* DONE, wordmark "Fly", primary CTAs */
  --orange:    #ff9f0a;             /* PARTIAL (multi-count: 0 < count < target) */

  /* Text */
  --text:      #ffffff;
  --text-2:    rgba(235,235,245,.8);
  --text-3:    rgba(235,235,245,.4);

  /* Heatmap */
  --heatmap-empty: #2c2c2e;         /* not done / unscheduled / missed — all the same calm gray */
}
```

- **Heatmap squares have exactly three fills:** `--heatmap-empty` (not done), `--orange` (multi-count partial), `--green` (done). **Red is not used anywhere.**
- **Card style:** `background: var(--card); border: 1px solid var(--sep); border-radius: 12px;`
- **Layout:** mobile-first, content column `max-width: 430px`, centered; responsive up to desktop/iPad but optimized for iPhone.

### 2.3 Typography & assets
- **UI font:** Inter (`-apple-system` fallback).
- **Numbers/data font:** D-DIN (heatmap counts, multi-count targets like `5/8`).
- **Wordmark:** `Habit` in white + `Fly` in `--green`.
- **App icon / onboarding hero:** [`habitfly_logo.png`](habitfly_logo.png) — green fly with an **H** crest in a white ring on black. This is the Fly-family sibling of SupaFly. **[RESOLVED]**
- **Tagline:** *Habits anywhere. Simple.*
- **Theme:** **Dark only at launch.** Light theme is post-MVP. (Token names should already anticipate a future light theme via CSS variables, but no light theme ships in v1.)

---

## 3. Target user

**Primary (and only) audience:** a routine builder + discipline maintainer rebuilding a daily routine from scratch — starting with the developer themselves, then premium minimalists who hate bloated trackers. Design for this user only; there is **no secondary audience**.

- Opens the app **throughout the day**, logging each habit right after doing it.
- Tracks a **mixed personal routine** (health, reading, self-care — app stays habit-agnostic).
- Top frustrations to fix: **app feels heavy** and **too many taps**.
- **No fixed habit count** — app must scale gracefully (a free-tier cap is a *possible* future lever, not a v1 feature).
- **Retention success (6–12 mo):** still daily-active with 6+ months of heatmap history they value.

---

## 4. Information architecture

**Three-tab bottom tab bar** (per Phase 9 simplification):

| Tab | Contents |
|---|---|
| **Today** | Today's scheduled habits, incomplete first. FAB (+) to add. |
| **Habits** | Full habit library with **Active / Archived** segmented control. Drag to reorder (Active). FAB (+) to add. |
| **Settings** | Export · Import · About/version · Delete all data. |

- **FAB (+)** appears on **Today** and **Habits**, bottom-right (thumb reach). Not on Settings.
- **Create/Edit** habit uses **push navigation** (a new screen on the stack), not a modal or sheet.
- **Tap a habit card body** → expands the heatmap for backdating (§6.4). The **check button** and **swipe gestures** are separate targets.

---

## 5. Core concepts

### 5.1 Habit
A named thing the user wants to do on a schedule. Has:
- **Name** (required)
- **Schedule** (required) — any combination of the 7 weekdays; default = daily
- **Colour** (required) — from the **Fly palette** (~8 preset colours), used as **card accent only** (icon background / check button tint). The heatmap never uses the habit colour — it stays gray/orange/green.
- **Type:** binary (default) or multi-count (optional, target set at creation)
- **Icon:** optional; generic default in v1 (no icon picker in v1)

### 5.2 Completion
- **Binary habit:** done or not done for a given date. Heatmap: gray → green.
- **Multi-count habit** (e.g. 8 glasses of water): a `count` for the date, from `0` to `target`.
  - `count == 0` → gray (empty)
  - `0 < count < target` → **orange** (partial)
  - `count >= target` → **green** (done)

### 5.3 Heatmap
- **Per-habit, on the card**, EverGreen-style: **~4 rows × ~28 columns**, showing the **last 16 weeks (112 days)**, oldest at left.
- Three fills only (gray / orange / green). **Missed scheduled days look identical to unscheduled days** — calm gray, no distinction, no guilt.
- **Today's square gets a thin `--green` ring/outline** regardless of its fill, so the user can find "today" at a glance. **[RESOLVED]**

---

## 6. Feature specifications

### 6.1 Onboarding (first run)
- **One branded screen:** the HabitFly mascot ([`habitfly_logo.png`](habitfly_logo.png)), wordmark `HabitFly`, tagline *Habits anywhere. Simple.*, and a single **"Create your first habit"** CTA.
- CTA → the Create Habit screen.
- Shown once; never again after the first habit exists (or after dismissal).

### 6.2 Today tab
- Header: `HabitFly` wordmark (ScoreFly-style chrome).
- Shows **habits scheduled for today**. A Mon/Wed/Fri habit is hidden on Tuesday.
- **Order:** incomplete scheduled habits first.
- **On completion:** the completed habit **moves directly below the last undone scheduled habit** for the day (not hidden, not sent to a separate section). When all are done, the list is simply all-complete in order.
- **Empty state (no habits at all):** simple message ("No habits yet") + the FAB. No mascot, no onboarding copy here.
- **FAB (+)** bottom-right → Create Habit.

### 6.3 Habit card
Layout echoes EverGreen, minus the streak line:
```
[icon]  Habit name                         [ ✓ check button ]
        (multi-count only: "5/8" in D-DIN)
[ ──────── 16-week heatmap (4 × 28), today ringed ──────── ]
```
- **No streak text. No fire icon. No counts of consecutive days. Anywhere.**
- **Check button** (bottom-right of the card, EverGreen position) is the primary action for *today*:
  - **Binary:** tap = done (green); tap again = undone.
  - **Multi-count:** each **tap = +1** toward target. At target → green/done. **Long-press = −1.** Card shows `count/target` in D-DIN.
- **Completion feedback:** **visual only** — ScoreFly-style tap **scale (~0.977)** + **green flash** + the corresponding heatmap cell fills. **No haptics, no sound** (iOS Safari PWAs can't do native haptics; we deliberately stay visual-only on all platforms).
- **Reduce Motion:** fully respected — instant state changes, no scale/flash animation.

### 6.4 Backdating & heatmap detail **[RESOLVED]**
- **Tap the card body** (not the check button) → expands a larger heatmap view for that habit, used for backdating.
- **Tap any past square:**
  - **Binary habit:** tap toggles that day **done ↔ empty** instantly.
  - **Multi-count habit:** tap opens a **small stepper popover (+ / −)** to set that day's count; the square recolors live (gray / orange / green).
- Any past day is editable (no time-limit window). Today is also editable here.
- **No retroactive recalculation:** changing a habit's schedule never rewrites past squares (§10).

### 6.5 Create / Edit habit (push screen)
Fields:
1. **Name** (required, text)
2. **Schedule** (required) — daily by default; a 7-day toggle row lets the user pick any combination.
3. **Colour** (required) — Fly palette swatches (~8 colours).
4. **Type** — "Once daily" vs "Multiple times". Choosing "Multiple times" reveals a **target** input (e.g. 1–99).
5. **Icon** — optional; generic default (no picker in v1).

- **Editing:** users can edit **everything, anytime** (name, schedule, colour, target, type).
- **Lowering a multi-count target below today's count** → cap today's count to the new target (e.g. target 8→5 while at 6 → becomes 5/5 = green). See §10.
- Saving returns to the previous tab.

### 6.6 Habits tab
- **Segmented control: Active | Archived.**
- **Active:** all non-archived habits, **drag to reorder** (manual sort order is the only ordering; no categories, no tags).
- **Swipe gestures on a card:**
  - **Swipe right = Edit** (opens the edit screen).
  - **Swipe left = Archive** (non-destructive). *Note: discovery briefly considered swipe-to-delete; Phase 9 finalized **swipe-left = archive**. Permanent delete lives only in Settings.*
- **Archived segment:** archived habits, with **Restore** (full restore — returns to Active with all history intact and sort order at the bottom).
- **FAB (+)** → Create Habit.

### 6.7 Settings tab
v1 contents only:
- **Export data** — download a JSON backup (share/download).
- **Import data** — load a JSON backup file.
- **Delete all data** — nuclear reset, with confirmation.
- **About** — app name, tagline, version. (A "Fly family / ScoreFly" link is optional, not required.)

No theme switch (dark-only v1), no haptics/sound toggles, no account, no notifications.

---

## 7. Data model

Persisted in **localStorage** (see §8). Shapes below are the contract; exact field plumbing (timestamps, sort storage) is engineering's choice where the discovery said "doesn't matter."

### 7.1 Habit
```ts
type HabitColour = string; // hex from the Fly palette (~8 presets)

interface Habit {
  id: string;              // UUID, generated at creation
  name: string;
  schedule: boolean[7] | number[]; // any 7-day combination (engineering choice of encoding)
  colour: HabitColour;     // card accent only
  type: 'binary' | 'multi';
  target: number;          // 1 for binary; user-set for multi
  icon?: string;           // optional; generic default in v1
  archivedAt?: string | null; // archived if present (encoding is engineering choice)
  sortOrder?: number;      // manual drag order (encoding is engineering choice)
  // createdAt / updatedAt: engineering choice; add if useful
  reminder?: ReminderStub; // POST-MVP schema stub only — not used in v1
}
```

### 7.2 Completion
- **One record per habit per day.** Keyed by `habitId` + `date`.
- **Date format:** `YYYY-MM-DD` in **device local time**. Midnight rollover follows the device. No special DST logic — trust the local date.
- **Count:** integer. For binary habits, `1` = done.
- **Zero-count days store NO record** — absence = not logged. The heatmap infers gray from the absence of a record (and infers scheduled-vs-unscheduled from the habit's schedule, though both render the same gray).

```ts
interface Completion {
  habitId: string;
  date: string;   // 'YYYY-MM-DD', device local
  count: number;  // >= 1 (0-count rows are never stored)
}
```

### 7.3 Settings
Minimal: theme (`'dark'` in v1) + app version. Everything else follows system defaults.

### 7.4 What is NOT stored
- No streak fields. No statistics/aggregates object (heatmap is computed from completions on the fly).
- No reminders data in v1 (stub schema only, unused).
- **Permanent delete** removes the habit **and all its completions**.

---

## 8. Technical architecture

| Concern | Decision |
|---|---|
| **Framework** | **PWA** (same stack philosophy as ScoreFly — web tech, installable). No Expo/React Native. No SQLite. |
| **Primary platform** | **iOS Safari → Add to Home Screen.** Desktop/iPad supported but mobile-first. |
| **Storage** | **localStorage** (simple key-value; dataset is small). |
| **Offline** | **Full offline** via service worker + app-shell cache. All features work with no network, ever. |
| **Cloud sync** | **None in v1.** Fully local. Optional account/sync is post-MVP only. |
| **Accounts / auth** | **None in v1.** Open and use immediately. |
| **Backup / migration** | **Manual JSON export/import** in Settings. (iCloud auto-backup is the preferred long-term path, post-MVP; JSON is the v1 bridge for moving to a new device.) |
| **Notifications** | **None in v1** (post-MVP). |
| **Widgets** | **Skipped** (PWAs can't use iOS WidgetKit; post-MVP). |
| **Completion feedback** | **Visual only** (scale + green flash). No haptics, no sound. |
| **Analytics / crash reporting** | **None at launch** — ship silent; decide post-launch. |
| **Hosting / deploy** | **GitHub**, from the `habitfly` repo. |

### 8.1 Corrupt-storage recovery
If localStorage is unreadable/corrupt, attempt recovery in order: **iCloud backup (if/when available) → local JSON export → offer "Start fresh" reset** as a last resort (with a data-loss warning).

### 8.2 Error handling
Storage save failures → **silent background retry**; the user never sees an error unless it's fatal.

---

## 9. Interaction & motion details

- **Tap completion:** card scales to ~0.977 and flashes green; the heatmap cell fills. ~150ms, ScoreFly-matched.
- **Reduce Motion (`prefers-reduced-motion`):** all scale/flash/animated fills become **instant** state changes.
- **One-handed:** primary actions (check button, FAB) sit bottom/right for thumb reach.
- **Today ring:** today's heatmap cell carries a thin `--green` outline at all times.
- **Accessibility:** best-effort at launch (sufficient contrast, ≥44px touch targets, sensible labels); full audit is post-launch.

---

## 10. Edge cases (locked)

| Case | Behaviour |
|---|---|
| Forgot to log yesterday | Nothing special; yesterday stays gray. Backfill via heatmap tap. No prompt, no guilt. |
| DST / clock change | Device local `YYYY-MM-DD` always; no special logic. |
| New phone / device change | Manual JSON export → import (v1). iCloud auto-backup is post-MVP. |
| Schedule changed (e.g. daily → weekdays) | **No retroactive recalc.** Past squares stay as logged; change applies going forward only. |
| 50+ habits / 5+ years of data | No hard cap; **warn at scale** and suggest archiving old habits. Heatmaps should load acceptably. |
| Restore archived habit | **Full restore** with all history; lands at the bottom of the Active sort order. |
| Multi-count target lowered mid-day (8→5 at count 6) | **Cap count to new target** → 5/5 = green immediately. |
| User changes device date to log other days | **Allow it.** Trust the device date; no anti-cheat. |

---

## 11. MVP acceptance criteria (testable on iOS Safari PWA)

A build is v1-complete when, on an iPhone via Add-to-Home-Screen, offline:

1. First launch shows the one-screen branded onboarding; "Create your first habit" opens the Create screen.
2. I can create a habit with name + schedule (any 7-day combo) + Fly-palette colour; optionally make it multi-count with a target.
3. Today shows only habits scheduled for today, incomplete first; completing one moves it directly below the last undone scheduled habit.
4. Tapping a binary habit's check button toggles done/undone with a scale + green-flash animation and fills today's (ringed) heatmap cell — **with no haptic or sound**.
5. A multi-count habit: tap = +1 (shows `count/target`), long-press = −1; partial shows orange, target shows green.
6. Each card shows a 16-week (~4×28) heatmap using only gray/orange/green, no streak text or fire icons anywhere.
7. Tapping a card body expands the heatmap; tapping a past square toggles a binary day or opens a stepper for a multi-count day.
8. Habits tab: Active/Archived segments, drag-reorder on Active, swipe-right = edit, swipe-left = archive; Archived restores fully.
9. Settings: JSON export produces a file; import restores it; "Delete all" wipes everything after confirmation.
10. Reduce Motion makes all state changes instant.
11. The app loads and is fully functional with the network off after first install.
12. No accounts, no cloud calls, no notifications, no analytics, no paywall exist in the build.

---

## 12. Monetization — SHELVED

**Free at launch.** All monetization decisions are deferred to *monetization time*. Do **not** build any of the following in v1:
- Paywalls, free-tier habit caps, trials, upgrade prompts.
- Accounts or billing.

Recorded intent (for the future, non-binding): likely **one-time purchase + subscription** (EverGreen-style), with premium plausibly unlocking **unlimited habits + widgets + reminders**. Free-tier limit and trial length are **TBD at monetization time.**

---

## 13. Post-MVP backlog (explicitly NOT in v1)

- Light theme (and theme switcher)
- Icon picker (v1 ships a generic default only)
- Reminders / Web Push notifications (schema stub exists; smart/relative reminders when added)
- Home-screen widgets (likely needs a thin native wrapper)
- iCloud / cloud auto-backup and optional account-based sync
- Analytics / crash reporting (decide post-launch)
- Monetization (see §12)

---

## 14. Open items (none blocking)

All discovery decisions are locked and the three post-discovery interaction gaps are resolved. The only deferred-by-design items are the monetization specifics (§12) and the post-MVP backlog (§13). Nothing blocks starting the build.

*Generated from `HABITFLY-DISCOVERY-COMPLETE.md` (123 questions, Phases 1–10) + `DISCOVERY-QA.md`, ScoreFly design tokens, `habitfly_logo.png`, and three resolved interaction decisions.*
