# ISSUE-09 — Onboarding + empty states

**Slice type:** Vertical slice
**Depends on:** ISSUE-01
**Demo when done:** A brand-new user sees a single branded screen — the HabitFly fly, the wordmark, the tagline, and a "Create your first habit" button that opens the Create screen. Once habits exist, the screen never returns. With zero habits, Today shows a calm "No habits yet" message + the FAB.

---

## Why this is a vertical slice
The **first-impression thread**: one-screen onboarding → into the existing create flow → into a populated app; plus the zero-state for Today. Thin, but it makes the app feel finished and on-brand.

## User-visible outcome
- **First run:** one branded screen — [`../habitfly_logo.png`](../habitfly_logo.png) mascot, `HabitFly` wordmark, tagline *Habits anywhere. Simple.*, and a single **"Create your first habit"** CTA → Create screen.
- Shown **once**; not shown again after the first habit exists (or after the CTA is used).
- **Today empty state (no habits at all):** simple "No habits yet" message + the FAB. No mascot, no onboarding copy here.

## In scope
- One-screen onboarding gated on "has the user any habits / been onboarded?"
- CTA routes into the ISSUE-01 Create screen.
- Today empty-state component.

## Out of scope
- Multi-step onboarding, starter-habit suggestions, mascot animation → not in v1 (PRD chose the one-screen, branded variant).

## Implementation notes by layer
- **Logic:** show onboarding when there are no habits and onboarding hasn't been completed; persist a simple "onboarded" flag (or infer from habit count).
- **UI:** reuse brand tokens; the mascot/wordmark/tagline match the Fly look. Keep the empty state minimal — distinct from onboarding (PRD §6.2 vs §6.1).
- **PWA:** assets cached in the offline shell.

## Acceptance criteria
- [ ] A fresh install shows the one-screen branded onboarding with the fly, wordmark, and tagline.
- [ ] "Create your first habit" opens the Create screen; completing it lands in the populated app.
- [ ] Onboarding does not reappear once a habit exists.
- [ ] With zero habits, Today shows "No habits yet" + the FAB (no mascot/onboarding copy).

## Reference
PRD §2.3, §6.1, §6.2, §11.1.
