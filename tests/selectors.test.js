import { describe, expect, it } from "vitest";
import {
  getBestRunForLevel,
  getLevelCount,
  getLevelProgressRows,
  getLevels,
  getProgressSummary,
  getRunHistoryForLevel,
  getSelectedLevel,
  hasLoadedLevels,
  isLessonMastered,
  isLevelCleared
} from "../src/state/selectors.js";

function buildState(overrides = {}) {
  return {
    app: {
      selectedLevelId: 2
    },
    levels: {
      status: "loaded",
      items: [
        { id: 1, title: "Level 1" },
        { id: 2, title: "Level 2" }
      ]
    },
    progress: {
      lessonMasteryByLevel: {},
      clearedLevels: {},
      runHistoryByLevel: {}
    },
    ...overrides
  };
}

describe("state selectors", () => {
  it("returns levels collection", () => {
    const state = buildState();
    expect(getLevels(state)).toHaveLength(2);
  });

  it("returns selected level by id", () => {
    const state = buildState();
    expect(getSelectedLevel(state)?.title).toBe("Level 2");
  });

  it("returns null when selected id is missing", () => {
    const state = buildState({ app: { selectedLevelId: 99 } });
    expect(getSelectedLevel(state)).toBeNull();
  });

  it("returns level count and loaded state", () => {
    const state = buildState();
    expect(getLevelCount(state)).toBe(2);
    expect(hasLoadedLevels(state)).toBe(true);
  });

  it("returns not loaded when status is not loaded", () => {
    const state = buildState({
      levels: {
        status: "loading",
        items: [{ id: 1, title: "Level 1" }]
      }
    });
    expect(hasLoadedLevels(state)).toBe(false);
  });

  it("returns progress flags by level", () => {
    const state = buildState({
      progress: {
        lessonMasteryByLevel: { 2: true },
        clearedLevels: { 1: true },
        runHistoryByLevel: {}
      }
    });

    expect(isLessonMastered(state, 2)).toBe(true);
    expect(isLevelCleared(state, 1)).toBe(true);
  });

  it("computes best run and summary metrics", () => {
    const state = buildState({
      progress: {
        lessonMasteryByLevel: { 1: true, 2: true },
        clearedLevels: { 2: true },
        runHistoryByLevel: {
          1: [
            { score: 500, accuracy: 80, wpm: 20 },
            { score: 600, accuracy: 76, wpm: 18 }
          ],
          2: [{ score: 700, accuracy: 90, wpm: 28 }]
        }
      }
    });

    expect(getRunHistoryForLevel(state, 1)).toHaveLength(2);
    expect(getBestRunForLevel(state, 1)?.score).toBe(600);
    expect(getProgressSummary(state)).toEqual({
      levelCount: 2,
      masteredCount: 2,
      clearedCount: 1,
      totalRuns: 3
    });
  });

  it("builds level progress rows with best values", () => {
    const state = buildState({
      progress: {
        lessonMasteryByLevel: { 1: true },
        clearedLevels: { 1: true },
        runHistoryByLevel: {
          1: [{ score: 999, accuracy: 88, wpm: 33 }]
        }
      }
    });

    const rows = getLevelProgressRows(state);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      id: 1,
      lessonMastered: true,
      stageCleared: true,
      bestScore: 999,
      bestAccuracy: 88,
      bestWpm: 33
    });
  });
});
