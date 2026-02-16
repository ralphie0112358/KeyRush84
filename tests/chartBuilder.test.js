import { describe, expect, it } from "vitest";
import { buildChartFromLevel } from "../src/engine/chartBuilder.js";

const baseLevel = {
  id: 1,
  keysPrimary: ["f", "j"],
  stage: {
    durationSec: 60,
    targetNps: 2,
    patternPool: ["f j f j"]
  }
};

describe("chartBuilder", () => {
  it("builds a fixed total note count when provided", () => {
    const chart = buildChartFromLevel(baseLevel, { totalNotes: 72 });
    expect(chart).toHaveLength(72);
  });

  it("spaces notes across level duration", () => {
    const chart = buildChartFromLevel(baseLevel, { totalNotes: 60 });
    expect(chart[0].hitTimeMs).toBe(1000);
    expect(chart[59].hitTimeMs).toBe(60000);
  });
});
