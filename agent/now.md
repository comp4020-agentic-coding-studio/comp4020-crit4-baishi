---
updated: 2026-08-22
deliverable: comp4020-crit4-baishi
---

# Now

## State

This run's prompt named `comp4020-crit4-baishi`, 88h to cutoff — still
mid-week (deepening, not the last run). Arrived clean at `76dbc2e`, `pnpm
check` green, working tree clean, up to date with `origin/main`.

Continued the technique that broke the "sensor battery exhausted" plateau
last run: re-derive checkable claims from the brief's own prose one clause
at a time against the current code, rather than reach for another synthetic
tool. This run's target was moment 5's blur/visibilitychange fix (releases
held voices when the whole page loses focus, e.g. alt-tab) — it only ever
covers the *page* losing focus, never asks what happens when focus moves
*within* the page while a key stays physically down.

Found a real, distinct stuck-note bug: focus a pad, hold Space (sustain
begins), then press Tab to move focus to the next pad without releasing
Space. In a real browser, the eventual `keyup` for the still-held key lands
on whatever element currently has focus — the pad you tabbed *to*, not the
one you tabbed *from*. The first pad's `keyup` never arrives, so it drones
forever. Verified live: `p.focus()` + synthetic trusted-shaped `keydown` on
the pad, then a real `agent-browser press Tab`, then reading
`document.activeElement` confirmed focus had genuinely moved — the original
pad still showed `.active === true` at that point, with no keyup pending
delivery to it at all.

Fixed with a `focusout` listener on `#instrument` (delegated, since
`focusout` bubbles unlike `blur`): it fires the instant focus actually
leaves a pad — Tab, Shift+Tab, or a click elsewhere — and releases that
pad's note right then, independent of where the physical key eventually
comes back up. Re-verified after rebuild:
- tabbing away from a held pad releases it immediately, confirmed at both
  marking viewports (1920×1080, 390×844)
- an ordinary in-place press-then-release (focus stays put, keydown then
  keyup on the same pad) still works unchanged
- `pnpm check` green (26/26), console clean before and after at both
  viewports

Committed as `3bbf17a` (the fix) and `99b75db` (PROCESS.md moment 7 citing
it), pushed to `origin/main`. Repo still private, as expected — shipping is
harness-owned.

## Next action

Two consecutive runs now (this one and the Tab+Enter/Space sustain fix
before it) found real bugs by working through the brief's interaction
prose clause-by-clause against the *current* code, after the prior
synthetic-sensor battery (axe-core/Lighthouse/html-validate/CWV/keyboard
tab-order/audio-domain) had gone dry across three runs. Both bugs were
about *timing/focus semantics of press-and-hold*, a category no structural
or scoring tool can see. Worth treating this as the primary technique to
reach for once sensors go quiet, not a one-off: re-read each clause of
"playable via mouse, keyboard, or touch," "no way to get it wrong," and
"different players produce different results" against the *current*
`main.ts`/`styles.css`, not against memory of what was already checked —
each fix so far has changed the code enough that a previously-clean clause
is worth re-deriving fresh, not assumed still clean.

One more focus-semantics angle not yet tried: does `focusout` firing on
*any* reason a pad loses focus (including a deliberate quick re-tap, or
focus moving to it and immediately away via a screen reader's own
navigation model) ever release a note the player didn't intend to end? Not
tested this run — worth a look next time before assuming `focusout` is a
strict improvement with no edge cases of its own.

The one substantive open thread is still unchanged and still needs a real
signal this agent can't generate alone:

- Whether 8 pads / a bit over one octave is the right range for "a
  stranger plays it uninstructed" needs a real stranger's reaction (the
  studio crit itself) — not another self-administered technical audit.

Not the last run — no reflection, no finishing steps yet. When a run does
land on the final-run prompt, the finishing steps (verify, `PROCESS.md`,
`reflections/crit-4.md`, commit, push) are still all outstanding.
