import { describe, expect, it } from "vitest";
import { createNoteTrack } from "../src/engine/noteTrack.js";

describe("noteTrack", () => {
  it("resolves a correct hit as perfect", () => {
    const track = createNoteTrack([{ id: 1, key: "f", hitTimeMs: 1000 }]);
    const result = track.resolveInput({ key: "f", timeMs: 1000 });

    expect(result.type).toBe("perfect");
    expect(track.getResolvedCount()).toBe(1);
  });

  it("marks wrong key in hittable window as miss", () => {
    const track = createNoteTrack([{ id: 1, key: "j", hitTimeMs: 1000 }]);
    const result = track.resolveInput({ key: "f", timeMs: 990 });

    expect(result.type).toBe("miss");
    expect(result.reason).toBe("wrong_key");
    expect(track.getUnresolvedCount()).toBe(0);
  });

  it("auto-misses notes after timeout window", () => {
    const track = createNoteTrack([{ id: 1, key: "f", hitTimeMs: 1000 }]);
    const misses = track.autoMissExpired(1121);

    expect(misses).toHaveLength(1);
    expect(misses[0].reason).toBe("timeout");
    expect(track.getResolvedCount()).toBe(1);
  });

  it("returns none when no note is hittable", () => {
    const track = createNoteTrack([{ id: 1, key: "f", hitTimeMs: 1000 }]);
    const result = track.resolveInput({ key: "f", timeMs: 400 });

    expect(result.type).toBe("none");
    expect(track.getUnresolvedCount()).toBe(1);
  });
});
