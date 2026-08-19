---
updated: 2026-08-19
deliverable: comp4020-crit4-baishi
---

# Now

## State

This run's prompt named `comp4020-crit4-baishi`, 160h to cutoff — a deepening
run, not the first build (Drift, the eight-pad pentatonic instrument, was
already built and pushed by the previous run). Ran the fuller audit battery
that run's own `now.md` had flagged as not-yet-done, and closed three of its
four open threads.

**Audio liveness (closed).** This agent can't hear, so every prior check of
note-on/off had only ever read `.active` classes. Verified for real by tapping
the Web Audio graph from outside the app: patched `AudioContext.prototype.
createOscillator`/`AudioNode.prototype.connect` and spliced an `AnalyserNode`
in front of the destination via `eval`. First attempt showed nothing —
dispatching a synthetic `KeyboardEvent` left the context permanently
`"suspended"` (Chrome's autoplay gate doesn't count a page-dispatched event as
real user activation, even though the pad still lit up). A real CDP-driven
`agent-browser mouse down`/`press` resumed the context and the analyser read a
genuine signal, confirmed further with a two-note chord (correctly-mixed peak,
clean drop to zero on release). Wrote this technique up as a `MEMORY.md`
lesson — it'll recur on every future audio crit.

**Audit battery (closed, two real fixes).** axe-core + html-validate caught
`aria-label` on a plain `<div>` (→ `role="group"`, `010fb7c`). Lighthouse
caught a real console error on every load from the browser's implicit
`favicon.ico` probe (→ added `public/favicon.svg` + a `<link rel="icon">`,
`8e7375c`; best-practices back to 1.0). A manual WCAG contrast calc confirmed
axe's remaining "incomplete" colour-contrast flag (the animated gradient
background) is a genuine non-issue at 11.6–17.2:1 across the full range.

**Card.png (closed).** Replaced the starter's placeholder with a real
1200×630 card, built by reusing the site's own compiled stylesheet in a
standalone composition rather than a separate mockup (`c050385`).

**A real bug, self-introduced and self-corrected.** The 200%-zoom reflow
check found a genuine 134px horizontal overflow at 390×844 zoomed — fixed
with `flex-wrap: wrap` (`9ab56fd`). I glanced at a desktop screenshot
afterward, judged it "unaffected, single row," and said so in that commit
message and in `PROCESS.md`. Wrong: `.pad`'s size was still a `vw`-based
clamp tied to the full viewport rather than to `.instrument`'s own rendered
width (capped by `main`'s 640px `max-width`), so at 1920px wide it saturated
at its rem max and 8 pads + gaps (688px) never fit the 640px row — it was
*already* wrapping into 7+1 at plain desktop zoom, visible in that same
screenshot, and I missed it on a glance. Caught on a later, more careful pass
that measured `getBoundingClientRect()` and counted actual row positions
instead of eyeballing. Fixed for real with CSS container queries
(`container-type: inline-size` on `.instrument`, `cqw` instead of `vw` on
`.pad`'s size/gap, `6392ba8`), then re-verified by measurement at all four
combinations (both marking viewports × normal/200% zoom) before pushing.
Corrected the inaccurate claim honestly in `PROCESS.md` (`b2de0d1`) rather
than leaving it — this is the same "narrate the miss, not just the fix"
practice `MEMORY.md` already asks for.

All 8 of this run's commits pushed to `origin/main` (`b2de0d1`). `pnpm check`
green, `pnpm check:evidence` fails only on the still-correctly-absent
`reflections/crit-4.md` (a finishing-step item). Preview server processes
shut down before finishing.

## Next action

Still mid-week (deepening), not the last run. Only one open thread remains
from the prior hand-off:

- Whether 8 pads / 1 octave-and-change is the right range, or whether a
  sparser/wider layout reads better for "a stranger can play it
  uninstructed," is still untested against real strangers — this agent has
  only ever checked its own audits, not a naive player's reaction.
- Everything else the prior run's `now.md` flagged (card.png, the full audit
  battery, audio liveness) is now done. A future deepening run should look
  for genuinely new angles rather than re-running what's already closed —
  e.g. a fresh axe-core/html-validate/Lighthouse pass only makes sense again
  if the markup or CSS changes meaningfully first.
- Reflection (`reflections/crit-4.md`) and the rest of the finishing steps
  are for the run the prompt calls last, not before.
