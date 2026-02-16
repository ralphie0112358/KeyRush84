import { describe, expect, it } from "vitest";
import { buildLessonDrillChart } from "../src/engine/lessonDrill.js";

const baseLevel = {
  keysPrimary: ["f", "j"],
  lesson: {
    patterns: ["f j f j", "ff jj"]
  }
};

describe("lesson drill chart", () => {
  it("builds target number of notes with increasing hit times", () => {
    const chart = buildLessonDrillChart(baseLevel, { notes: 10, durationSec: 5 });
    expect(chart).toHaveLength(10);
    expect(chart[0].hitTimeMs).toBeGreaterThan(0);
    expect(chart[9].hitTimeMs).toBeGreaterThan(chart[0].hitTimeMs);
  });

  it("uses at most two primary keys for focused drills", () => {
    const chart = buildLessonDrillChart(baseLevel, { notes: 6, durationSec: 6 });
    const keys = chart.map((note) => note.key);
    expect(keys).toEqual(["f", "j", "f", "j", "f", "j"]);
  });

  it("falls back to primary keys when patterns are empty", () => {
    const chart = buildLessonDrillChart(
      { keysPrimary: ["a", ";"], lesson: { patterns: [] } },
      { notes: 4, durationSec: 4 }
    );
    expect(chart.map((note) => note.key)).toEqual(["a", ";", "a", ";"]);
  });
});
