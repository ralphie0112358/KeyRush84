const STORAGE_KEY = "keyrush84.v1";
const DEFAULT_SETTINGS = {
  muted: false,
  sfxVolume: 0.7,
  musicVolume: 0.5
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadPersistedProgress() {
  if (!canUseStorage()) {
    return {
      lessonMasteryByLevel: {},
      clearedLevels: {},
      runHistoryByLevel: {}
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        lessonMasteryByLevel: {},
        clearedLevels: {},
        runHistoryByLevel: {}
      };
    }

    const parsed = JSON.parse(raw);
    return {
      lessonMasteryByLevel: parsed.progress?.lessonMasteryByLevel ?? {},
      clearedLevels: parsed.progress?.clearedLevels ?? {},
      runHistoryByLevel: parsed.progress?.runHistoryByLevel ?? {}
    };
  } catch {
    return {
      lessonMasteryByLevel: {},
      clearedLevels: {},
      runHistoryByLevel: {}
    };
  }
}

export function loadPersistedSettings() {
  if (!canUseStorage()) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }

    const parsed = JSON.parse(raw);
    return {
      muted: Boolean(parsed.settings?.muted ?? DEFAULT_SETTINGS.muted),
      sfxVolume: Number.isFinite(parsed.settings?.sfxVolume)
        ? parsed.settings.sfxVolume
        : DEFAULT_SETTINGS.sfxVolume,
      musicVolume: Number.isFinite(parsed.settings?.musicVolume)
        ? parsed.settings.musicVolume
        : DEFAULT_SETTINGS.musicVolume
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function savePersistedProgress(progressState) {
  if (!canUseStorage()) return;

  let existingSettings = { ...DEFAULT_SETTINGS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      existingSettings = {
        muted: Boolean(parsed.settings?.muted ?? DEFAULT_SETTINGS.muted),
        sfxVolume: Number.isFinite(parsed.settings?.sfxVolume)
          ? parsed.settings.sfxVolume
          : DEFAULT_SETTINGS.sfxVolume,
        musicVolume: Number.isFinite(parsed.settings?.musicVolume)
          ? parsed.settings.musicVolume
          : DEFAULT_SETTINGS.musicVolume
      };
    }
  } catch {
    existingSettings = { ...DEFAULT_SETTINGS };
  }

  const payload = {
    schemaVersion: 1,
    progress: {
      lessonMasteryByLevel: progressState.lessonMasteryByLevel ?? {},
      clearedLevels: progressState.clearedLevels ?? {},
      runHistoryByLevel: progressState.runHistoryByLevel ?? {}
    },
    settings: existingSettings
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function savePersistedSettings(settingsState) {
  if (!canUseStorage()) return;

  let existingProgress = {
    lessonMasteryByLevel: {},
    clearedLevels: {},
    runHistoryByLevel: {}
  };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      existingProgress = {
        lessonMasteryByLevel: parsed.progress?.lessonMasteryByLevel ?? {},
        clearedLevels: parsed.progress?.clearedLevels ?? {},
        runHistoryByLevel: parsed.progress?.runHistoryByLevel ?? {}
      };
    }
  } catch {
    existingProgress = {
      lessonMasteryByLevel: {},
      clearedLevels: {},
      runHistoryByLevel: {}
    };
  }

  const payload = {
    schemaVersion: 1,
    progress: existingProgress,
    settings: {
      muted: Boolean(settingsState?.muted ?? DEFAULT_SETTINGS.muted),
      sfxVolume: Number.isFinite(settingsState?.sfxVolume)
        ? settingsState.sfxVolume
        : DEFAULT_SETTINGS.sfxVolume,
      musicVolume: Number.isFinite(settingsState?.musicVolume)
        ? settingsState.musicVolume
        : DEFAULT_SETTINGS.musicVolume
    }
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export { STORAGE_KEY, DEFAULT_SETTINGS };
