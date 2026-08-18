---
updated: 2026-08-19
deliverable: comp4020-crit4-baishi
---

# Now

## State

This run's prompt named `comp4020-crit4-baishi`, 167h to cutoff — the start of
the week, so the job was plan + build, not finish. Fetched
`crits/04-instrument.json`: "An instrument" (week 5) — turn the browser into a
musical instrument a stranger can pick up and play, Web Audio API, client-side,
expressive, no score/fail state, playable with mouse/keyboard/touch.

Repo was the bare starter (2 commits). Built **Drift**: eight glowing pads
across one pentatonic scale (so no combination ever clashes), playable by
pointer, touch, or the home-row keys A S D F G H J K. Dragging/sliding across
pads glissandos between notes (each pointerId is its own voice, so multi-touch
gives real chords); vertical position continuously sweeps a shared lowpass
filter + feedback delay (ArrowUp/ArrowDown covers this for keyboard-only
players with no pointer); Tab+Enter/Space also reaches every pad. AudioContext
only starts on first gesture — no autoplay, silence is the resting state.

Caught and fixed a real bug before committing: pads were circles at
1920×1080 but ellipses at 390×844 (flexbox shrinking width, not height, to
fit 8 pads in a narrow row) — only visible by actually screenshotting the
mobile viewport, not from reading the CSS. Fixed with `flex-shrink: 0` and
re-tuned `clamp()`s. Also found `agent-browser press <key> --hold <ms>`
doesn't actually sustain the key in this sandbox (mid-hold `eval` always saw
the pad inactive) — worth recording in `MEMORY.md`. Verified real hold/chord
behaviour instead via `document.dispatchEvent(new KeyboardEvent(...))`
directly, which did work correctly and confirmed the instrument's own
keydown/keyup handling was right all along.

Wrote `spec/crit-4.test.ts` (deleted the worked-example `starter.test.ts`)
covering the mechanically-checkable spec lines: no `<audio>`/`<video>`
playback, `createOscillator` present in the build (live synthesis not a
sample), every pad a real focusable `<button>` naming its note and its own
key, no score/fail/wrong vocabulary anywhere, distinct notes per pad, a
non-empty hint before the player acts. `pnpm check` green (26 tests). Wrote
`PROCESS.md` with the two moments above, both already committed and cited.
Left `public/card.png` as the starter's placeholder deliberately — visual
identity (dark background, pink glow) only just landed, revisit once it's
settled rather than designing a card against a build that might still shift.

Committed in three stages (build, spec test, PROCESS.md) and pushed to
`origin/main` (`14aadaf`). `pnpm check:evidence` fails only on the missing
`reflections/crit-4.md`, which is a finishing-step item, correctly not owed
this early.

## Next action

This is mid-week build, not finished. A future run (deepen phase) could:

- Design and commit a real `public/card.png` (1200×630) now that the
  pink-glow-on-dark palette is settled, and update the description meta if
  the instrument's name/pitch changes.
- Run the fuller technical/a11y/interaction audit battery logged in
  `MEMORY.md` (axe-core sweep, HTML validation, Lighthouse, 200%-zoom
  reflow, tab-order/focus-visibility walk) — none of it has been run yet on
  this repo, only the ad hoc checks done during this build.
- Actually *listen* to it (this agent can't hear) — a future run should at
  minimum verify via `eval` that oscillators are actually being created/
  started/stopped correctly across rapid multi-note play, since correctness
  there is inferred from DOM state (`.active` classes, voice map size) not
  from audio itself. Consider whether an `AnalyserNode` + `eval`-readable
  level meter would give a genuine liveness signal for a future run, since
  this agent has no ears.
- Consider whether 8 pads / 1 octave-and-change is the right amount of
  range, or whether a second octave / an intentionally sparser 5-pad version
  reads better for "a stranger can play it uninstructed" — this was a first
  design pass, not something re-validated against the exemplar-comparison
  technique logged in `MEMORY.md` (fetching the brief's own named examples).
  The crit-4 brief itself names no specific exemplar to fetch, unlike
  assignment-1's Ciechanowski link — nothing to compare against there.
- Reflection (`reflections/crit-4.md`) and the rest of the finishing steps
  are for the run the prompt calls last, not before.
