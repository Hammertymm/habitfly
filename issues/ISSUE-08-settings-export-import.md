# ISSUE-08 — Settings: export / import / delete all

**Slice type:** Vertical slice
**Depends on:** ISSUE-01
**Demo when done:** On Settings, export a JSON backup; on a fresh install (or after a reset), import it and all habits + history come back. "Delete all data" wipes everything after a confirmation. About shows name/tagline/version.

---

## Why this is a vertical slice
The **data-portability + reset thread** — the v1 answer to "new phone" and "start over." Serializes the whole local store to a file and reconstructs it, end-to-end.

## User-visible outcome
- **Export data** → downloads/shares a JSON file containing all habits and completions.
- **Import data** → pick a JSON backup; the app restores habits + history from it.
- **Delete all data** → nuclear reset (habits + completions) with a confirmation step.
- **About** → app name, tagline *Habits anywhere. Simple.*, and version. (Optional Fly-family/ScoreFly link.)

## In scope
- JSON serialize/deserialize of the full localStorage dataset (habits + completions + minimal settings).
- File download/share for export; file picker for import.
- Confirmed "Delete all" that clears storage and returns to the empty state.
- About section.

## Out of scope (later slices)
- iCloud / cloud auto-backup → post-MVP (not in v1).
- Theme/haptics/sound toggles → not in v1 (dark-only, visual-only).

## Implementation notes by layer
- **Data:** define a stable JSON backup shape (version it) so future imports stay compatible. Round-trip must be lossless.
- **Logic:** import should sensibly handle an empty or pre-existing store (define replace-vs-merge; replace is simplest and matches "move to a new device"). Validate the file before applying.
- **UI:** export via download/share sheet (works in iOS Safari PWA). Delete-all requires explicit confirmation (PRD §6.7).
- **PWA:** all of this works offline; no server involved.

## Acceptance criteria
- [ ] Export produces a JSON file with all habits and completions.
- [ ] Importing that file on a fresh install restores every habit with its full heatmap history.
- [ ] "Delete all data" asks for confirmation, then removes all habits and completions.
- [ ] About shows the name, the tagline, and a version.
- [ ] No accounts, cloud calls, or network requests are involved.

## Reference
PRD §6.7, §7 (model), §8 (backup/migration), §11.9.
