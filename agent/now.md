---
updated: 2026-08-22
deliverable: comp4020-crit4-baishi
---

# Now

## State

This run's prompt named `comp4020-crit4-baishi`, 82h to cutoff — still
mid-week (deepening, not the last run). Arrived clean at `cf13500`, `pnpm
check` green, working tree clean, up to date with `origin/main`.

Continued the clause-by-clause brief-re-derivation technique that found the
last two real bugs (see `MEMORY.md`), this time turning it on the prior
run's own `focusout` fix: does releasing a note on *any* focus-loss reason
ever end one the player didn't intend to end — specifically, could a
pointer chord (clicking pad B with a mouse) steal DOM focus away from a
pad A currently held via keyboard Space/Enter, cutting A's note short?

Tested live against `dist/` served with `CI=true pnpm preview`:
- real click on pad A first (genuine gesture, resumes `AudioContext`)
- `pads[0].focus()` + synthetic `keydown` for Space on pad A → `focus-a`
  voice sustaining, `activeElement.dataset.key === "a"`
- real `agent-browser mouse down`/`mouse up` on pad S → `activeElement`
  stayed `a` throughout (never moved to S), both `a` and `s` showed
  `.active === true` simultaneously (a genuine cross-modal chord), and `s`
  released cleanly on mouse up while `a` kept sustaining
- dispatched the matching synthetic `keyup` for Space on pad A → released
  cleanly, console clean throughout

No bug this time — the existing `pointerdown` listener's
`event.preventDefault()` (in `main.ts`, originally there to stop
scroll/selection during a drag) also suppresses the browser's default
click-to-focus behaviour, so pointer input never steals focus from a
keyboard-held pad in the first place. Wrote this up in `MEMORY.md` as the
mechanism, not just the "checked, clean" result, so a future run doesn't
have to re-diagnose why if it revisits this.

No code changes, no commits this run — a legitimate "checked a real
concern, confirmed the code already handles it" outcome, not a failure to
find work.

## Next action

The clause-by-clause technique has now run three times on Drift's
press-and-hold logic: two real bugs (Tab+Enter/Space fixed-blip; stuck note
on mid-hold Tab-away) and one clean check (pointer chord vs. keyboard-held
focus). It's earned its place as the default deepening technique here once
the synthetic-sensor battery (axe-core/Lighthouse/html-validate/CWV/
keyboard tab-order/audio-domain — all exhausted across six earlier runs)
goes quiet, but it isn't guaranteed to keep finding bugs — recognise a
clean result as legitimate and don't manufacture a fix that isn't needed.

No specific untried clause identified for next time. Options for a future
run, roughly in order of how likely they are to be genuinely new ground:
- Re-read the brief's own prose once more for any clause not yet checked
  against the *current* code (it keeps changing as fixes land).
- The one substantive open thread that isn't self-administrable: whether 8
  pads / a bit over one octave is the right range for "a stranger plays it
  uninstructed" needs a real stranger's reaction — the studio crit itself,
  not another technical probe.
- If both come up empty, that's a legitimate state to report, not a
  reason to invent busywork (see the repeated "manufactured work reads
  worse than an honest nothing-to-fix" lesson in `MEMORY.md`).

Not the last run — no reflection yet, correctly. When a run does land on
the final-run prompt, the finishing steps (verify, `PROCESS.md`,
`reflections/crit-4.md`, commit, push) are still all outstanding.
