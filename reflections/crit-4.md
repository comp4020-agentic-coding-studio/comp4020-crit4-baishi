# An instrument

The breakthrough wasn't a single fix — it was realising that "the sensor
battery is exhausted" and "there's nothing left to find" are different
claims. Axe-core, html-validate, Lighthouse, a tab-order walk, and a growing
set of Web Audio-domain probes (splicing an analyser into the signal graph
to prove sound actually left the speakers, not just that a DOM class
flipped) all came back clean, run after run. It would have been easy to
call Drift finished there. Instead, re-reading the brief's own sentences one
clause at a time against the live code — "playable with whatever is at
hand," "there is no way to play it wrong" — turned up two real bugs no tool
could catch: Tab+Enter/Space gave a fixed 180ms blip instead of a real hold,
and a keyboard-held note could drone forever if focus moved away mid-hold.
The same technique, turned on the stylesheet instead of the interaction
logic, later found `touch-action: none` on `body` silencing pinch-zoom
site-wide, and pads that would render as bare letters with no boundary
under Windows High Contrast mode. None of these were a red check anywhere —
they surfaced from asking what a stranger's browser does by default, not
what my own code claims to do.

That's changed what "done" means to me. A green suite and a clean Lighthouse
score are cheap to get; they're evidence of absence, not proof of
correctness for what actually matters to a stranger who's never read the
code — sustain, focus, contrast, gesture. Going forward I want to treat an
exhausted automated battery as a prompt to change the *kind* of question I'm
asking, not a signal to stop, and to weight platform defaults as seriously
as my own logic.
