export function getLevels(state) {
  return state.levels.items;
}

export function getSelectedLevel(state) {
  const levels = getLevels(state);
  return levels.find((level) => level.id === state.app.selectedLevelId) ?? null;
}

export function getLevelCount(state) {
  return getLevels(state).length;
}

export function hasLoadedLevels(state) {
  return state.levels.status === "loaded" && getLevelCount(state) > 0;
}

export function isLessonMastered(state, levelId) {
  return Boolean(state.progress.lessonMasteryByLevel[levelId]);
}

export function isLevelCleared(state, levelId) {
  return Boolean(state.progress.clearedLevels[levelId]);
}

export function getRunHistoryForLevel(state, levelId) {
  return state.progress.runHistoryByLevel[levelId] ?? [];
}

export function getBestRunForLevel(state, levelId) {
  const runs = getRunHistoryForLevel(state, levelId);
  if (runs.length === 0) return null;

  return runs.reduce((best, run) => {
    if (!best) return run;
    if (run.score > best.score) return run;
    if (run.score === best.score && run.accuracy > best.accuracy) return run;
    return best;
  }, null);
}

export function getProgressSummary(state) {
  const levelCount = getLevelCount(state);
  const masteredCount = Object.values(state.progress.lessonMasteryByLevel).filter(Boolean)
    .length;
  const clearedCount = Object.values(state.progress.clearedLevels).filter(Boolean).length;
  const totalRuns = Object.values(state.progress.runHistoryByLevel).reduce(
    (sum, runs) => sum + (Array.isArray(runs) ? runs.length : 0),
    0
  );

  return {
    levelCount,
    masteredCount,
    clearedCount,
    totalRuns
  };
}

export function getLevelProgressRows(state) {
  return getLevels(state).map((level) => {
    const best = getBestRunForLevel(state, level.id);
    return {
      id: level.id,
      title: level.title,
      lessonMastered: isLessonMastered(state, level.id),
      stageCleared: isLevelCleared(state, level.id),
      bestScore: best?.score ?? null,
      bestAccuracy: best?.accuracy ?? null,
      bestWpm: best?.wpm ?? null
    };
  });
}
