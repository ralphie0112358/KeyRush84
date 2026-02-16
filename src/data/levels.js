import rawLevelsData from "../../levels.v1.json";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function validateLevel(level, index) {
  const label = `levels[${index}]`;

  assert(Number.isInteger(level.id) && level.id > 0, `${label}.id must be a positive integer`);
  assert(isString(level.title), `${label}.title must be a non-empty string`);
  assert(isString(level.goal), `${label}.goal must be a non-empty string`);
  assert(isStringArray(level.keysPrimary), `${label}.keysPrimary must be a string array`);
  assert(Array.isArray(level.keysReview), `${label}.keysReview must be an array`);
  assert(level.lesson && typeof level.lesson === "object", `${label}.lesson is required`);
  assert(
    isString(level.lesson.expectation),
    `${label}.lesson.expectation must be a non-empty string`
  );
  assert(
    isStringArray(level.lesson.patterns) && level.lesson.patterns.length > 0,
    `${label}.lesson.patterns must be a non-empty string array`
  );
  assert(level.stage && typeof level.stage === "object", `${label}.stage is required`);
  assert(
    Number.isFinite(level.stage.durationSec) && level.stage.durationSec > 0,
    `${label}.stage.durationSec must be a positive number`
  );
  assert(
    Number.isFinite(level.stage.targetNps) && level.stage.targetNps > 0,
    `${label}.stage.targetNps must be a positive number`
  );
  assert(
    isStringArray(level.stage.patternPool) && level.stage.patternPool.length > 0,
    `${label}.stage.patternPool must be a non-empty string array`
  );
}

export function validateLevelsData(data) {
  assert(data && typeof data === "object", "levels data must be an object");
  assert(isString(data.version), "version must be a non-empty string");
  assert(Array.isArray(data.levels) && data.levels.length > 0, "levels must be a non-empty array");

  const ids = new Set();
  data.levels.forEach((level, index) => {
    validateLevel(level, index);
    assert(!ids.has(level.id), `duplicate level id: ${level.id}`);
    ids.add(level.id);
  });

  return {
    version: data.version,
    levelAccess: data.levelAccess ?? null,
    defaults: data.defaults ?? {},
    levels: [...data.levels].sort((a, b) => a.id - b.id)
  };
}

export function loadLevelsData() {
  return validateLevelsData(rawLevelsData);
}
