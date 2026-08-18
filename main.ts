// Drift: an eight-pad pentatonic instrument. Every note lives in the same
// scale, so any combination of pads — one finger or five — sounds
// consonant. Vertical position sweeps a shared filter and delay, so the
// same notes feel brighter or darker depending on where you touch.

const MIN_CUTOFF = 350;
const MAX_CUTOFF = 6000;
const ATTACK = 0.012;
const RELEASE = 0.35;

const instrument = document.querySelector<HTMLElement>("#instrument");
const hint = document.querySelector<HTMLElement>("#hint");
const pads = Array.from(document.querySelectorAll<HTMLButtonElement>(".pad"));

let audioContext: AudioContext | null = null;
let masterFilter: BiquadFilterNode | null = null;
let brightness = 0.5; // 0 = dark, 1 = bright — also drives the CSS backdrop.

type Voice = { oscillator: OscillatorNode; gain: GainNode };
const voices = new Map<string, Voice>();

function markPlayed() {
  hint?.classList.add("played");
}

function setBrightness(value: number) {
  brightness = Math.min(1, Math.max(0, value));
  document.documentElement.style.setProperty("--brightness", brightness.toFixed(3));
  if (masterFilter && audioContext) {
    const cutoff = MIN_CUTOFF * (MAX_CUTOFF / MIN_CUTOFF) ** brightness;
    masterFilter.frequency.setTargetAtTime(cutoff, audioContext.currentTime, 0.05);
  }
}

function ensureAudio(): AudioContext {
  if (audioContext) return audioContext;

  const context = new AudioContext();
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.7;
  filter.frequency.value = MIN_CUTOFF * (MAX_CUTOFF / MIN_CUTOFF) ** brightness;

  const compressor = context.createDynamicsCompressor();

  const delay = context.createDelay(1);
  delay.delayTime.value = 0.28;
  const feedback = context.createGain();
  feedback.gain.value = 0.32;
  const wet = context.createGain();
  wet.gain.value = 0.22;

  filter.connect(compressor);
  filter.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  wet.connect(compressor);
  compressor.connect(context.destination);

  audioContext = context;
  masterFilter = filter;
  return context;
}

function noteOn(voiceId: string, frequency: number, pad: HTMLElement | null) {
  const context = ensureAudio();
  if (context.state === "suspended") void context.resume();
  if (!masterFilter) return;
  if (voices.has(voiceId)) return;

  const oscillator = context.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.value = frequency;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0, context.currentTime);
  gain.gain.linearRampToValueAtTime(0.22, context.currentTime + ATTACK);

  oscillator.connect(gain);
  gain.connect(masterFilter);
  oscillator.start();

  voices.set(voiceId, { oscillator, gain });
  pad?.classList.add("active");
  markPlayed();
}

function noteOff(voiceId: string, pad: HTMLElement | null) {
  const voice = voices.get(voiceId);
  pad?.classList.remove("active");
  if (!voice || !audioContext) return;

  const { oscillator, gain } = voice;
  const now = audioContext.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + RELEASE);
  oscillator.stop(now + RELEASE + 0.05);
  voices.delete(voiceId);
}

function frequencyOf(pad: HTMLElement): number {
  return Number(pad.dataset.freq);
}

function updateBrightnessFromClientY(clientY: number) {
  const ratio = 1 - clientY / window.innerHeight;
  setBrightness(ratio);
}

// Pointer events unify mouse and touch, and each pointerId is its own
// voice, so a mouse drag glides between pads (glissando) while several
// simultaneous touches play a chord.
const pointerPads = new Map<number, HTMLElement>();

function padUnderPoint(x: number, y: number): HTMLElement | null {
  const el = document.elementFromPoint(x, y);
  return el?.closest<HTMLElement>(".pad") ?? null;
}

instrument?.addEventListener("pointerdown", (event) => {
  const pad = (event.target as HTMLElement).closest<HTMLElement>(".pad");
  if (!pad) return;
  event.preventDefault();
  pointerPads.set(event.pointerId, pad);
  noteOn(`pointer-${event.pointerId}`, frequencyOf(pad), pad);
  updateBrightnessFromClientY(event.clientY);
});

document.addEventListener("pointermove", (event) => {
  updateBrightnessFromClientY(event.clientY);

  const currentPad = pointerPads.get(event.pointerId);
  if (!currentPad) return;

  const pad = padUnderPoint(event.clientX, event.clientY);
  if (pad && pad !== currentPad) {
    noteOff(`pointer-${event.pointerId}`, currentPad);
    pointerPads.set(event.pointerId, pad);
    noteOn(`pointer-${event.pointerId}`, frequencyOf(pad), pad);
  }
});

function releasePointer(event: PointerEvent) {
  const pad = pointerPads.get(event.pointerId);
  if (!pad) return;
  noteOff(`pointer-${event.pointerId}`, pad);
  pointerPads.delete(event.pointerId);
}

document.addEventListener("pointerup", releasePointer);
document.addEventListener("pointercancel", releasePointer);

// A pad focused by keyboard and activated with Enter/Space fires a plain
// synthetic click (detail === 0 for keyboard, >=1 for a real pointer click)
// so Tab-only players can still sound a note without learning the letter keys.
instrument?.addEventListener("click", (event) => {
  if (event.detail !== 0) return; // real pointer clicks already handled above
  const pad = (event.target as HTMLElement).closest<HTMLElement>(".pad");
  if (!pad) return;
  const voiceId = `click-${pad.dataset.key}`;
  noteOn(voiceId, frequencyOf(pad), pad);
  window.setTimeout(() => noteOff(voiceId, pad), 180);
});

// Home-row keys give a stranger a second, un-pointed-at way to play: press
// and hold any of A S D F G H J K, chords included.
const keyPads = new Map<string, HTMLElement>();
for (const pad of pads) {
  const key = pad.dataset.key;
  if (key) keyPads.set(key, pad);
}

const BRIGHTNESS_STEP = 0.08;

document.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  const key = event.key.toLowerCase();

  const pad = keyPads.get(key);
  if (pad) {
    noteOn(`key-${key}`, frequencyOf(pad), pad);
    return;
  }

  if (key === "arrowup") {
    event.preventDefault();
    ensureAudio();
    setBrightness(brightness + BRIGHTNESS_STEP);
  } else if (key === "arrowdown") {
    event.preventDefault();
    ensureAudio();
    setBrightness(brightness - BRIGHTNESS_STEP);
  }
});

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  const pad = keyPads.get(key);
  if (pad) noteOff(`key-${key}`, pad);
});

setBrightness(brightness);
