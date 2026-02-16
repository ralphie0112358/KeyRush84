import { TIMING_WINDOWS_MS } from "../core/constants.js";
import { judgeTimingOffset } from "./hitJudge.js";

export function createNoteTrack(notes, windows = TIMING_WINDOWS_MS) {
  const state = notes.map((note) => ({
    ...note,
    resolved: false,
    result: null
  }));

  function getNearestHittableNote(timeMs) {
    let nearest = null;
    let nearestOffset = Number.POSITIVE_INFINITY;

    for (const note of state) {
      if (note.resolved) continue;
      const offset = Math.abs(timeMs - note.hitTimeMs);
      if (offset <= windows.good && offset < nearestOffset) {
        nearestOffset = offset;
        nearest = note;
      }
    }

    return nearest;
  }

  function resolveInput({ key, timeMs }) {
    const note = getNearestHittableNote(timeMs);
    if (!note) return { type: "none" };

    const expectedKey = note.key;
    const offsetMs = timeMs - note.hitTimeMs;

    if (key !== expectedKey) {
      note.resolved = true;
      note.result = "miss";
      return {
        type: "miss",
        reason: "wrong_key",
        noteId: note.id,
        expectedKey,
        pressedKey: key
      };
    }

    const hitType = judgeTimingOffset(offsetMs, windows);
    note.resolved = true;
    note.result = hitType;

    return {
      type: hitType,
      noteId: note.id,
      expectedKey,
      offsetMs
    };
  }

  function autoMissExpired(timeMs) {
    const misses = [];
    for (const note of state) {
      if (note.resolved) continue;
      if (timeMs - note.hitTimeMs > windows.good) {
        note.resolved = true;
        note.result = "miss";
        misses.push({
          type: "miss",
          reason: "timeout",
          noteId: note.id,
          expectedKey: note.key
        });
      }
    }
    return misses;
  }

  function getNextNote() {
    return state.find((note) => !note.resolved) ?? null;
  }

  function getUnresolvedCount() {
    return state.filter((note) => !note.resolved).length;
  }

  function getResolvedCount() {
    return state.length - getUnresolvedCount();
  }

  return {
    resolveInput,
    autoMissExpired,
    getNextNote,
    getUnresolvedCount,
    getResolvedCount,
    getNotes: () => state
  };
}
