import { SCORING_BASE } from "../core/constants.js";

export function getMultiplier(combo) {
  if (combo >= 50) return 4;
  if (combo >= 25) return 3;
  if (combo >= 10) return 2;
  return 1;
}

export function createScoreState() {
  return {
    score: 0,
    combo: 0,
    multiplier: 1,
    maxCombo: 0,
    hits: {
      perfect: 0,
      good: 0,
      miss: 0
    }
  };
}

export function applyHit(scoreState, hitType) {
  if (hitType !== "perfect" && hitType !== "good") return scoreState;

  const combo = scoreState.combo + 1;
  const multiplier = getMultiplier(combo);
  const scoreGain = SCORING_BASE[hitType] * multiplier;

  return {
    ...scoreState,
    score: scoreState.score + scoreGain,
    combo,
    multiplier,
    maxCombo: Math.max(scoreState.maxCombo, combo),
    hits: {
      ...scoreState.hits,
      [hitType]: scoreState.hits[hitType] + 1
    }
  };
}

export function applyMiss(scoreState) {
  return {
    ...scoreState,
    combo: 0,
    multiplier: 1,
    hits: {
      ...scoreState.hits,
      miss: scoreState.hits.miss + 1
    }
  };
}
