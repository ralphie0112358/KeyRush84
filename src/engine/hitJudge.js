import { TIMING_WINDOWS_MS } from "../core/constants.js";

export function judgeTimingOffset(offsetMs, windows = TIMING_WINDOWS_MS) {
  const absOffset = Math.abs(offsetMs);

  if (absOffset <= windows.perfect) return "perfect";
  if (absOffset <= windows.good) return "good";
  return "miss";
}
