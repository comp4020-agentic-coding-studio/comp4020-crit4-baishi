---
updated: 2026-08-23
deliverable: comp4020-crit4-baishi
---

# Now

## State

This run's prompt named `comp4020-crit4-baishi`, 64h to cutoff — still
mid-week (deepening, not the last run). Arrived clean at `15be0e7`, `pnpm
check` green, working tree clean, up to date with `origin/main`.

Re-read `main.ts`'s own comments clause-by-clause (the technique that found
the last two real bugs) looking for an unverified claim. Found one: the
`keydown` handler for Tab-focused Enter/Space activation calls
`event.preventDefault()` specifically to stop the button's native
click-activation from *also* firing and double-triggering `noteOn` via the
separate assistive-tech `click` fallback (`click-${key}` is a different
voiceId than `focus-${key}`, so a double-fire would layer two live
oscillators rather than no-op). That claim had only ever been asserted in
the comment, never exercised with a real keyboard press.

Verified live against `CI=true pnpm preview --port 4501`: patched
`AudioContext.prototype.createOscillator` to count calls, focused a pad,
then sent genuine `agent-browser press Enter` and (separately) `press
Space` — both produced exactly 1 oscillator, confirming `preventDefault()`
on `keydown` does suppress the native synthetic click in this real browser,
so no double-trigger. Also checked the fallback path itself still works
in isolation: a plain `.click()` with no keydown/keyup at all (the actual
assistive-tech case the fallback exists for) created exactly 1 oscillator,
marked the pad `.active` immediately, and cleared it again after the 180ms
blip. Console stayed clean throughout. "Checked, confirmed correct" — no
bug, no code change, no commit. Preview server shut down cleanly after.

Re-fetched the brief and found one genuinely untried angle among the two
`now.md` had flagged: the page's own copy ("move up and down to brighten or
darken the sound") names the **pointer-drag** brightness path as the
primary way to sweep the filter, but every prior audio-domain check of that
sweep (see `MEMORY.md`) had only driven it via `agent-browser press
ArrowUp`/`ArrowDown` — a different code path in `main.ts`
(`document.keydown` → `setBrightness` directly) than the pointer one
(`pointermove` → `updateBrightnessFromClientY`).

Verified against `dist/` served with `CI=true pnpm preview` (note: port
4321 was occupied by an unrelated server in this environment — vite
preview silently fell back to 4322; check `agent-browser eval
"document.title"` after `open` if a preview URL looks wrong, don't assume
the port you asked for is the one you got):
- spliced an `AnalyserNode` in front of `destination` via a patched
  `AudioNode.prototype.connect` (same technique as prior runs)
- genuine `agent-browser mouse down` on pad A, then real `mouse move` to
  near the bottom of the viewport (same x, so the pad/pitch doesn't
  change) — analyser read low-band-only energy, `--brightness` at 0.028
- real `mouse move` to near the top — mid/high-band energy appeared
  (11.8/2.3), `--brightness` at 0.954
- `mouse up` cleared `.active` immediately, no stuck voice, console clean
  (one stray `[astro] Initializing prefetch script` debug line in the
  console buffer was leftover noise from the port-4321 mixup before
  navigating to the real 4322 page, not from this repo's code — Drift has
  no Astro dependency)

Confirmed audible, not just a CSS-variable bookkeeping change. "Checked,
confirmed correct" — no bug, no code change, no commit. Wrote the finding
into `MEMORY.md` with the general lesson: two input paths that both claim
to drive the same parameter (keyboard arrows vs. pointer drag) are two
separate claims, and confirming one doesn't cover the other.

Shut down the preview server cleanly afterwards.

## Next action

Eleven runs deep on this repo now across the full technical battery
(axe-core, html-validate, Lighthouse, CWV, keyboard tab-order,
audio-liveness/pitch/multi-voice-headroom, both brightness-sweep input
paths, and now the Enter/Space-vs-click double-trigger guard) plus four
rounds of brief/code clause-by-clause re-derivation (two real bugs found,
three clean checks). Genuinely untried self-administrable angles are
getting very scarce. Options for a future run, in rough order of how
likely they are to be new ground:
- One more careful brief/code re-read against whatever the code looks
  like by then — it keeps changing as fixes land, so a clause that was
  fine last time can regress.
- The one substantive open thread that isn't self-administrable: whether 8
  pads / a bit over one octave is the right range for "a stranger plays it
  uninstructed" needs a real stranger's reaction — the studio crit itself.
- If nothing turns up, that's a legitimate state to report, not a reason
  to invent busywork (the repeated lesson in `MEMORY.md`).

Not the last run — no reflection yet, correctly. When a run does land on
the final-run prompt, the finishing steps (verify, `PROCESS.md`,
`reflections/crit-4.md`, commit, push) are still all outstanding.
