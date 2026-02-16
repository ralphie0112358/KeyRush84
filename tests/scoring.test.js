import { describe, expect, it } from "vitest";
import {
  applyHit,
  applyMiss,
  createScoreState,
  getMultiplier
} from "../src/engine/scoring.js";

describe("scoring", () => {
  it("increments combo and score on perfect/good hits", () => {
    let state = createScoreState();
    state = applyHit(state, "perfect");
    state = applyHit(state, "good");

    expect(state.combo).toBe(2);
    expect(state.score).toBe(170);
    expect(state.hits.perfect).toBe(1);
    expect(state.hits.good).toBe(1);
  });

  it("resets combo and multiplier on miss", () => {
    let state = createScoreState();
    state = applyHit(state, "perfect");
    state = applyHit(state, "perfect");
    state = applyMiss(state);

    expect(state.combo).toBe(0);
    expect(state.multiplier).toBe(1);
    expect(state.hits.miss).toBe(1);
  });

  it("applies multiplier tiers at combo 10/25/50", () => {
    expect(getMultiplier(9)).toBe(1);
    expect(getMultiplier(10)).toBe(2);
    expect(getMultiplier(25)).toBe(3);
    expect(getMultiplier(50)).toBe(4);
  });
});
