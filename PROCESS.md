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

## Still open

The link-preview card (`public/card.png`) is still the starter's generic
placeholder — deliberately left for a later pass once the instrument's visual
identity (the pink-on-dark glow) is settled, rather than designed against a
build that might still change shape.
