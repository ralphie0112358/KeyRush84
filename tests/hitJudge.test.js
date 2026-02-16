import { describe, expect, it } from "vitest";
import { judgeTimingOffset } from "../src/engine/hitJudge.js";

describe("hitJudge", () => {
  it("returns perfect at and within 60ms", () => {
    expect(judgeTimingOffset(0)).toBe("perfect");
    expect(judgeTimingOffset(60)).toBe("perfect");
    expect(judgeTimingOffset(-60)).toBe("perfect");
  });

  it("returns good from 61ms to 120ms", () => {
    expect(judgeTimingOffset(61)).toBe("good");
    expect(judgeTimingOffset(-61)).toBe("good");
    expect(judgeTimingOffset(120)).toBe("good");
  });

  it("returns miss above 120ms", () => {
    expect(judgeTimingOffset(121)).toBe("miss");
    expect(judgeTimingOffset(-121)).toBe("miss");
  });
});
