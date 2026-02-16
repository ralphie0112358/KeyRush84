import { GAMEPLAY } from "../core/constants.js";

const VALID_KEY_PATTERN = /[a-z;]/i;

function extractKeys(pattern) {
  return Array.from(pattern.toLowerCase()).filter((char) => VALID_KEY_PATTERN.test(char));
}

function getKeyPool(level) {
  const fromPatterns = level.stage.patternPool.flatMap(extractKeys);
  if (fromPatterns.length > 0) return fromPatterns;
  return level.keysPrimary;
}

function resolveTotalNotes(level, options = {}) {
  if (Number.isFinite(options.totalNotes) && options.totalNotes > 0) {
    return Math.floor(options.totalNotes);
  }

  if (Number.isFinite(level.stage.totalNotes) && level.stage.totalNotes > 0) {
    return Math.floor(level.stage.totalNotes);
  }

  if (
    Number.isFinite(GAMEPLAY.defaultStageTotalNotes) &&
    GAMEPLAY.defaultStageTotalNotes > 0
  ) {
    return Math.floor(GAMEPLAY.defaultStageTotalNotes);
  }

  return Math.max(1, Math.floor(level.stage.durationSec * level.stage.targetNps));
}

export function buildChartFromLevel(level, options = {}) {
  const keyPool = getKeyPool(level);
  const totalNotes = resolveTotalNotes(level, options);
  const stageDurationMs = level.stage.durationSec * 1000;
  const spacingMs = stageDurationMs / totalNotes;

  return Array.from({ length: totalNotes }, (_, index) => ({
    id: index + 1,
    key: keyPool[index % keyPool.length],
    hitTimeMs: Math.round(GAMEPLAY.leadInMs + index * spacingMs)
  }));
}
