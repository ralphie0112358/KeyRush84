import { beforeEach, describe, expect, it } from "vitest";
import {
  loadPersistedProgress,
  savePersistedProgress,
  STORAGE_KEY
} from "../src/persistence/storage.js";

describe("progress storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns empty defaults when storage is missing", () => {
    const loaded = loadPersistedProgress();
    expect(loaded.lessonMasteryByLevel).toEqual({});
    expect(loaded.clearedLevels).toEqual({});
    expect(loaded.runHistoryByLevel).toEqual({});
  });

  it("saves and reloads progress payload", () => {
    savePersistedProgress({
      lessonMasteryByLevel: { 1: true, 2: false },
      clearedLevels: { 1: true },
      runHistoryByLevel: {
        1: [{ score: 1000, accuracy: 92, wpm: 30 }]
      }
    });

    const loaded = loadPersistedProgress();
    expect(loaded.lessonMasteryByLevel["1"]).toBe(true);
    expect(loaded.clearedLevels["1"]).toBe(true);
    expect(loaded.runHistoryByLevel["1"]).toHaveLength(1);
  });

  it("falls back to defaults on malformed storage value", () => {
    window.localStorage.setItem(STORAGE_KEY, "{bad-json");
    const loaded = loadPersistedProgress();
    expect(loaded.lessonMasteryByLevel).toEqual({});
    expect(loaded.clearedLevels).toEqual({});
    expect(loaded.runHistoryByLevel).toEqual({});
  });
});
