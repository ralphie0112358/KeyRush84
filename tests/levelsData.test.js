import { describe, expect, it } from "vitest";
import { loadLevelsData, validateLevelsData } from "../src/data/levels.js";

describe("levels data", () => {
  it("loads and validates bundled levels", () => {
    const data = loadLevelsData();

    expect(data.version).toBe("v1");
    expect(data.levels.length).toBeGreaterThan(0);
    expect(data.levels[0].id).toBe(1);
    expect(data.levels[0].title).toBeTypeOf("string");
  });

  it("throws when levels collection is missing", () => {
    expect(() => validateLevelsData({ version: "v1" })).toThrow(
      "levels must be a non-empty array"
    );
  });

  it("throws when duplicate level ids exist", () => {
    expect(() =>
      validateLevelsData({
        version: "v1",
        levels: [
          {
            id: 1,
            title: "L1",
            goal: "Goal",
            keysPrimary: ["f"],
            keysReview: [],
            lesson: { expectation: "x", patterns: ["f"] },
            stage: { durationSec: 60, targetNps: 1, patternPool: ["f"] }
          },
          {
            id: 1,
            title: "L1 dup",
            goal: "Goal",
            keysPrimary: ["j"],
            keysReview: [],
            lesson: { expectation: "x", patterns: ["j"] },
            stage: { durationSec: 60, targetNps: 1, patternPool: ["j"] }
          }
        ]
      })
    ).toThrow("duplicate level id: 1");
  });

  it("throws on invalid lesson patterns structure", () => {
    expect(() =>
      validateLevelsData({
        version: "v1",
        levels: [
          {
            id: 1,
            title: "L1",
            goal: "Goal",
            keysPrimary: ["f"],
            keysReview: [],
            lesson: { expectation: "x", patterns: [] },
            stage: { durationSec: 60, targetNps: 1, patternPool: ["f"] }
          }
        ]
      })
    ).toThrow("levels[0].lesson.patterns must be a non-empty string array");
  });
});
