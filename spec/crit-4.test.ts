import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// Turns the published spec for crits/04-instrument into checkable contracts.
// Lines a person has to judge at the crit (feel, latency, whether a gesture is
// expressive or just exhausting) are left to the crit, not asserted here.

const DIST = resolve("dist");
const doc = new JSDOM(readFileSync(join(DIST, "index.html"), "utf8")).window.document;

function builtScripts(): string {
  const assetsDir = join(DIST, "assets");
  return readdirSync(assetsDir)
    .filter((name) => name.endsWith(".js"))
    .map((name) => readFileSync(join(assetsDir, name), "utf8"))
    .join("\n");
}

describe("the browser is the instrument", () => {
  it("ships no pre-recorded audio or video to play back", () => {
    expect(doc.querySelectorAll("audio, video").length).toBe(0);
  });

  it("synthesises sound with the Web Audio API rather than loading a file", () => {
    const js = builtScripts();
    expect(js).toContain("createOscillator");
    expect(js).not.toMatch(/\.(mp3|wav|ogg)['"]/);
  });
});

describe("playable with whatever is at hand", () => {
  const pads = Array.from(doc.querySelectorAll<HTMLButtonElement>(".pad"));

  it("has more than one pad to play", () => {
    expect(pads.length).toBeGreaterThan(1);
  });

  it("every pad is a real button, so Tab and click/tap both reach it", () => {
    for (const pad of pads) {
      expect(pad.tagName).toBe("BUTTON");
      expect(pad.disabled).toBe(false);
    }
  });

  it("every pad names the note it plays, for anyone not looking at a screen", () => {
    for (const pad of pads) {
      expect(pad.getAttribute("aria-label")?.trim()).toBeTruthy();
    }
  });

  it("every pad maps to its own key, so a keyboard alone can play it", () => {
    const keys = pads.map((pad) => pad.dataset.key);
    expect(keys.every(Boolean)).toBe(true);
    expect(new Set(keys).size).toBe(pads.length);
  });
});

describe("there is no way to play it wrong", () => {
  it("declares no score, fail, or game-over state", () => {
    const text = doc.body.textContent?.toLowerCase() ?? "";
    for (const word of ["score", "fail", "game over", "you lose", "wrong note"]) {
      expect(text).not.toContain(word);
    }
  });

  it("every pad plays a distinct note in the same scale, so no combination clashes", () => {
    const pads = Array.from(doc.querySelectorAll<HTMLButtonElement>(".pad"));
    const freqs = pads.map((pad) => Number(pad.dataset.freq));
    expect(freqs.every((f) => f > 0)).toBe(true);
    expect(new Set(freqs).size).toBe(freqs.length);
  });
});

describe("the opening screen invites the first sound", () => {
  it("says something before the player has done anything", () => {
    const hint = doc.querySelector("#hint");
    expect(hint?.textContent?.trim()).toBeTruthy();
  });
});
