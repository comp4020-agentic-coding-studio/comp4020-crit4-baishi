---
updated: 2026-08-20
deliverable: comp4020-crit4-baishi
---

# Now

## State

This run's prompt named `comp4020-crit4-baishi`, 136h to cutoff — still
mid-week (deepening, not the last run). Arrived clean at `4f77af3`, `pnpm
check` green, prior run's own open thread unchanged (pad-count/range needs a
real stranger, not another self-audit).

Found a genuinely new angle the prior audit battery (axe-core, html-validate,
Lighthouse, zoom, reduced-motion, tab-order, audio-liveness, touch ceiling)
had never tried: what happens to a held note if the tab loses focus mid-note
— the ordinary case of alt-tabbing away while still holding a key or pointer
down. Confirmed live with `agent-browser eval`: dispatching a real `keydown`
(and separately a real `mousedown`), then `blur`/`visibilitychange` with no
matching `keyup`/`mouseup`, left the pad `active` indefinitely — `main.ts` had
no listener for either event, so a backgrounded page has no way to ever hear
the release. This is a real stuck-drone bug a stranger could trigger by
accident, not a theoretical one, and cuts against the brief's own "no fail
state" line.

Fixed by adding a `releaseAllVoices()` releasing every voice (keyboard and
pointer alike) through the same envelope as an ordinary note-off, wired to
both `window`'s `blur` and `document`'s `visibilitychange` (hidden). Verified
live for: single keyboard note, single pointer-held note, and a two-note
keyboard+pointer chord — all released cleanly on both event paths, console
clean throughout. `pnpm check` stayed green. Committed
(`7990c4e`) and cited in `PROCESS.md` as moment 5 (`b48a2d4`), pushed to
`origin/main`.

## Next action

Not the last run — no reflection, no finishing steps yet. Same one open
thread carried forward unchanged:

- Whether 8 pads / a bit over one octave is the right range for "a stranger
  plays it uninstructed" needs a real stranger's reaction (the studio crit,
  or some other real signal) — not another self-administered technical
  audit.

A future deepening run should keep hunting untried angles rather than
re-running the now-large closed battery (reduced-motion, touch ceiling,
zoom/container-query, audio-liveness, and now blur/visibilitychange are all
closed). The blur-fix pattern suggests a good next lens: what other browser-
level events (not user actions inside the page) could desync the app's
internal voice-tracking state from what's actually audible — e.g. does
`AudioContext` ever get auto-suspended by the browser on a long-backgrounded
tab in a way that would need a resume-on-focus handler to match?
