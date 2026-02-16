const KEY_PATTERN = /[a-z;]/i;
const DRILL_LEAD_IN_MS = 1800;

function extractKeys(pattern) {
  return Array.from(pattern.toLowerCase()).filter((char) => KEY_PATTERN.test(char));
}

export function buildLessonDrillChart(level, drillConfig) {
  const notesTarget = drillConfig?.notes ?? 30;
  const durationSec = drillConfig?.durationSec ?? 15;
  const totalNotes = Math.max(1, notesTarget);
  const spacingMs = (durationSec * 1000) / totalNotes;

  const primaryKeys = (level.keysPrimary ?? [])
    .filter((key) => typeof key === "string" && key.length > 0)
    .slice(0, 2);

  const poolFromLesson = (level.lesson?.patterns ?? []).flatMap(extractKeys);
  const fallbackPool = poolFromLesson.length > 0 ? poolFromLesson : ["f", "j"];
  const keyPool = primaryKeys.length > 0 ? primaryKeys : fallbackPool;

  return Array.from({ length: totalNotes }, (_, index) => ({
    id: index + 1,
    key: keyPool[index % keyPool.length],
    hitTimeMs: Math.round(DRILL_LEAD_IN_MS + index * spacingMs)
  }));
}
