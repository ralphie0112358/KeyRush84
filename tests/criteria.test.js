import { describe, expect, it } from "vitest";
import {
  evaluateLessonMastery,
  evaluateStageClear
} from "../src/core/criteria.js";

describe("criteria", () => {
  it("passes lesson mastery at threshold", () => {
    expect(
      evaluateLessonMastery({ accuracy: 0.85, maxStreak: 10 })
    ).toBe(true);
  });

  it("fails lesson mastery below threshold", () => {
    expect(
      evaluateLessonMastery({ accuracy: 0.84, maxStreak: 10 })
    ).toBe(false);
    expect(
      evaluateLessonMastery({ accuracy: 0.9, maxStreak: 9 })
    ).toBe(false);
  });

  it("passes stage clear at thresholds", () => {
    expect(
      evaluateStageClear({
        accuracy: 0.8,
        maxStreak: 15,
        targetKeyHitRate: 0.7
      })
    ).toBe(true);
  });

  it("fails stage clear when any condition fails", () => {
    expect(
      evaluateStageClear({
        accuracy: 0.79,
        maxStreak: 15,
        targetKeyHitRate: 0.7
      })
    ).toBe(false);
    expect(
      evaluateStageClear({
        accuracy: 0.9,
        maxStreak: 14,
        targetKeyHitRate: 0.8
      })
    ).toBe(false);
    expect(
      evaluateStageClear({
        accuracy: 0.9,
        maxStreak: 20,
        targetKeyHitRate: 0.69
      })
    ).toBe(false);
  });
});
