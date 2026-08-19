# Process overview

A reading-guide to how the work came together — a map to the process, not an
essay about it.

## What I built

**Drift**: eight glowing pads laid out across one pentatonic scale, so any
combination a player touches sounds consonant. A pad sounds on mouse press,
touch, or one of the home-row keys A S D F G H J K; dragging or sliding a
finger across pads bends between notes (a glissando), and moving up or down
continuously sweeps a shared lowpass filter and feedback delay, so the same
eight notes feel brighter or darker depending on where you play. Nothing plays
until the player acts, and there is no way to play it wrong.

## The moments that mattered

1. **The pads were circles on a laptop screen and ellipses on a phone.**
   Building the layout with `clamp()`s sized against `vw`, I checked it first
   at 1920×1080 and it looked right — round pads, evenly spaced. Rather than
   assume the same CSS held at the other marking viewport, I resized to
   390×844 with `agent-browser` and screenshotted it, which is what actually
   showed the pads squashed into ovals: flexbox was shrinking their *width* to
   fit eight of them in the narrow row while their `height` clamp stayed
   untouched. I fixed it by giving pads `flex-shrink: 0` and re-tuning the
   size and gap `clamp()`s to genuinely fit a 390px-wide row rather than rely
   on flexbox to compress them, then re-screenshotted at 390×844 to confirm
   round pads before committing either version — so the commit history shows
   the working layout, not a broken one
   ([`7b23f91`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-baishi/commit/7b23f91f5ed1dba437d431d57e0d6f5361d38a4d)).
   This is the kind of thing a `pnpm check` typechecking/build/lint pass
   can't see and a desktop-only glance would have shipped: only looking at
   the rendered page at the other real viewport caught it.

2. **Keyboard sustain needed a real interaction test, not a read of the
   code.** `agent-browser press <key> --hold <ms>` turned out not to
   actually hold the key down in this sandbox — a background `press --hold`
   followed by a mid-hold `eval` always read the pad as inactive, which
   looked like a bug in `main.ts`'s `keydown`/`keyup` handling. Rather than
   patch code against a symptom I hadn't isolated, I dispatched a real
   `KeyboardEvent('keydown', {key: 'd'})` directly via `eval` instead, held
   it, then dispatched `keyup` — and the pad lit up correctly. That told me
   the instrument's key handling was right and the test tool's `--hold` flag
   was the thing not doing what its name suggested in this environment, so I
   verified the actual feature (glissando drag, arrow-key brightness, chord
   pads) with direct event dispatch for the rest of this session rather than
   trusting `--hold`
   ([`7b23f91`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-baishi/commit/7b23f91f5ed1dba437d431d57e0d6f5361d38a4d)).

3. **The pad row overflowed the viewport at 200% zoom — and my first fix for
   it quietly broke desktop.** Running the full technical audit battery
   (axe-core, html-validate, Lighthouse, a tab-order walk, a 200%-zoom
   reflow check) turned up a 134px horizontal overflow at 390×844 under
   200% CSS zoom, caught by checking `scrollWidth`/`clientWidth` via
   `eval`: `flex-wrap: nowrap` (needed at normal zoom to keep one tidy row)
   left the row nowhere to go but past the edge once the zoomed pads no
   longer fit the same 390 CSS-px width. Switching to `flex-wrap: wrap`
   fixed that overflow
   ([`9ab56fd`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-baishi/commit/9ab56fd606a023934fe9d2cdadd4fe7cea973706)),
   but I claimed in that commit — from a screenshot I glanced at rather
   than measured — that the normal single-row look at both marking
   viewports was unchanged. It wasn't: `.pad`'s size was still a `vw`-based
   clamp, tied to the full viewport rather than to `.instrument`'s own
   rendered width (capped at `main`'s 40rem/640px), so at 1920px wide the
   clamp saturated at its rem max and 8 pads plus gaps (688px) never fit
   the 640px row — it was wrapping into 7+1 at plain desktop zoom, with no
   zoom applied at all, in that same screenshot I'd already taken. A later,
   more careful re-check (measuring `getBoundingClientRect()` and counting
   distinct row positions, not eyeballing a screenshot) caught it before
   push. Fixed for real with CSS container queries — `container-type:
   inline-size` on `.instrument`, `cqw` instead of `vw` on `.pad`'s size and
   the row's gap — so pad size tracks the instrument's actual box width
   instead of the viewport
   ([`6392ba8`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-baishi/commit/6392ba83a7f0af6d21b74f41f476e00a60ccdeaa)),
   re-verified this time by measurement at all four combinations (both
   marking viewports, normal and 200% zoom): single row of 8 at both
   viewports' normal zoom, no horizontal overflow at either viewport's
   200% zoom, and the 2×4 wrap only appears where it's actually needed
   (mobile at 200% zoom). The general lesson: a screenshot glanced at
   rather than measured is not verification — the same mistake a prior
   crit's `MEMORY.md` had already warned about for a different property
   (circles turning to ellipses) recurred here for row count, and this
   time it slipped past me into a commit message before a second look
   caught it.

   The same audit pass also caught a real ARIA misuse (`aria-label` on a
   plain `<div>`, confirmed by both axe-core and html-validate) and a real
   console error on every page load (the browser's own `favicon.ico`
   probe, caught by Lighthouse) — fixed in
   [`010fb7c`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-baishi/commit/010fb7c8f4bfee61ebb80f3666be7da15566d7fa)
   and
   [`8e7375c`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-baishi/commit/8e7375caaba7845c63e248cafced0c84574d2c83).

4. **Proving the instrument actually makes sound, not just that the DOM says
   it did.** This agent can't hear, so every earlier check of note-on/off
   had only ever read `.active` classes and the hint text. Tapping into the
   real Web Audio graph from outside the app — patching
   `AudioContext.prototype.createOscillator` and `AudioNode.prototype.connect`
   via `eval`, with an `AnalyserNode` spliced in front of the destination —
   gave a genuine audio-domain signal instead of a DOM-state proxy. The
   first attempt showed nothing: a synthetic `dispatchEvent(new
   KeyboardEvent(...))` press left the `AudioContext` permanently
   `"suspended"`, because Chrome's autoplay gate doesn't count a
   page-dispatched synthetic event as real user activation, even though the
   pad still lit up and the oscillator object was still created. Switching
   to a real CDP-driven `agent-browser mouse down`/`press` resumed the
   context to `"running"` and the analyser read a genuine non-zero signal
   — confirmed further with a two-note chord (two live oscillators, a
   correctly-mixed higher peak, both dropping to zero cleanly on release).
   This is a one-off verification technique, not a code change to the
   instrument itself.

The link-preview card (`public/card.png`) also moved past the starter's
placeholder this pass, now that the pink-on-dark identity was settled — built
by reusing the site's own compiled stylesheet in a standalone composition
rather than a separate mockup, then screenshotted at the real 1200×630
og:image size
([`c050385`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-baishi/commit/c050385182e1fe65411d0a462b6e09036ec6ed81)).

## Still open

Whether eight pads over one octave-and-change is the right range, or whether
a sparser or wider layout reads better for "a stranger can play it
uninstructed," hasn't been re-tested against real strangers — only against
this agent's own checks.
