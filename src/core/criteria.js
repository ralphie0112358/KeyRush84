export function evaluateLessonMastery(
  { accuracy, maxStreak },
  thresholds = { passAccuracy: 0.85, passStreak: 10 }
) {
  return (
    accuracy >= thresholds.passAccuracy && maxStreak >= thresholds.passStreak
  );
}

export function evaluateStageClear(
  { accuracy, maxStreak, targetKeyHitRate },
  thresholds = {
    minAccuracy: 0.8,
    minMaxStreak: 15,
    minTargetKeyHitRate: 0.7
  }
) {
  return (
    accuracy >= thresholds.minAccuracy &&
    maxStreak >= thresholds.minMaxStreak &&
    targetKeyHitRate >= thresholds.minTargetKeyHitRate
  );
}
