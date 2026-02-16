import { createStore, INITIAL_STATE } from "../state/store.js";
import { screens } from "../screens/index.js";
import { loadLevelsData } from "../data/levels.js";
import { createAudioManager } from "../audio/audioManager.js";
import {
  loadPersistedProgress,
  loadPersistedSettings,
  savePersistedProgress,
  savePersistedSettings
} from "../persistence/storage.js";

function createShell(root) {
  root.innerHTML = `
    <main class="app-shell">
      <header class="top-bar">
        <div class="brand">KeyRush84</div>
        <div class="top-right-controls">
          <div class="screen-chip">Screen: <span data-ui="screenName">home</span></div>
          <button
            class="star-progress-button"
            data-action="go-screen"
            data-screen="progress"
            aria-label="Open progress"
            title="Progress"
          >
            ★
          </button>
        </div>
      </header>
      <section class="playfield-frame">
        <div class="playfield-bg" aria-hidden="true"></div>
        <section class="screen-root" data-ui="screenRoot"></section>
        <section data-ui="overlayRoot"></section>
        <button
          class="global-levels-button"
          data-action="toggle-level-picker"
          aria-label="Open levels"
          title="Levels"
        >
          🪜
        </button>
        <button
          class="global-settings-button"
          data-action="go-screen"
          data-screen="settings"
          aria-label="Open settings"
          title="Settings"
        >
          ⚙
        </button>
      </section>
    </main>
  `;
}

function setScreen(store, screen) {
  store.setState((prev) => ({
    ...prev,
    app: {
      ...prev.app,
      screen,
      levelPickerOpen: false
    },
    run: {
      ...prev.run,
      active: screen === "gameplay"
    }
  }));
}

function setSelectedLevel(store, levelId) {
  store.setState((prev) => ({
    ...prev,
    app: {
      ...prev.app,
      selectedLevelId: levelId,
      levelPickerOpen: false
    }
  }));
}

function setSessionMode(store, mode) {
  store.setState((prev) => ({
    ...prev,
    session: {
      ...prev.session,
      mode
    }
  }));
}

function setLevelPickerOpen(store, isOpen) {
  store.setState((prev) => ({
    ...prev,
    app: {
      ...prev.app,
      levelPickerOpen: isOpen
    }
  }));
}

function setLevelsLoading(store) {
  store.setState((prev) => ({
    ...prev,
    levels: {
      ...prev.levels,
      status: "loading",
      error: null
    }
  }));
}

function setLevelsLoaded(store, levelsData) {
  store.setState((prev) => {
    const validSelected = levelsData.levels.some(
      (level) => level.id === prev.app.selectedLevelId
    );
    const selectedLevelId = validSelected
      ? prev.app.selectedLevelId
      : levelsData.levels[0].id;

    return {
      ...prev,
      app: {
        ...prev.app,
        selectedLevelId
      },
      levels: {
        status: "loaded",
        error: null,
        version: levelsData.version,
        levelAccess: levelsData.levelAccess,
        defaults: levelsData.defaults,
        items: levelsData.levels
      }
    };
  });
}

function setLevelsError(store, error) {
  store.setState((prev) => ({
    ...prev,
    levels: {
      ...prev.levels,
      status: "error",
      error: error instanceof Error ? error.message : String(error)
    }
  }));
}

function hydrateProgress(store) {
  const persistedProgress = loadPersistedProgress();
  store.setState((prev) => ({
    ...prev,
    progress: {
      ...prev.progress,
      lessonMasteryByLevel: {
        ...prev.progress.lessonMasteryByLevel,
        ...persistedProgress.lessonMasteryByLevel
      },
      clearedLevels: {
        ...prev.progress.clearedLevels,
        ...persistedProgress.clearedLevels
      },
      runHistoryByLevel: {
        ...prev.progress.runHistoryByLevel,
        ...persistedProgress.runHistoryByLevel
      }
    }
  }));
}

function hydrateSettings(store) {
  const persistedSettings = loadPersistedSettings();
  store.setState((prev) => ({
    ...prev,
    settings: {
      ...prev.settings,
      ...persistedSettings
    }
  }));
}

function clamp01(value, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

export function createApp({ rootId = "app" } = {}) {
  const store = createStore(INITIAL_STATE);
  const audio = createAudioManager();
  let activeScreen = null;
  let activeScreenName = null;
  let screenContainer = null;
  let overlayContainer = null;
  let screenNameNode = null;
  let rootNode = null;
  let initialized = false;

  function syncMusicForScreen(screenName) {
    if (screenName === "gameplay") {
      audio.playMusic("play");
      return;
    }
    if (
      screenName === "menu" ||
      screenName === "lesson" ||
      screenName === "progress" ||
      screenName === "settings" ||
      screenName === "results"
    ) {
      audio.playMusic("home");
      return;
    }
    audio.stopMusic();
  }

  function focusPreferredControl() {
    const preferred =
      screenContainer.querySelector("[data-autofocus]:not([disabled])") ??
      screenContainer.querySelector("button:not([disabled])");

    if (preferred instanceof HTMLElement) {
      preferred.focus();
    }
  }

  function getFocusableButtons() {
    if (!screenContainer) return [];
    const state = store.getState();
    const scope =
      state.app.levelPickerOpen
        ? overlayContainer?.querySelector(".level-picker-modal")
        : screenContainer;
    if (!scope) return [];
    return Array.from(
      scope.querySelectorAll("button:not([disabled])")
    );
  }

  function moveFocusByArrow(step) {
    const buttons = getFocusableButtons();
    if (buttons.length === 0) return;

    const active = document.activeElement;
    const currentIndex = buttons.findIndex((button) => button === active);
    const startIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (startIndex + step + buttons.length) % buttons.length;
    buttons[nextIndex].focus();
  }

  function renderScreen(state) {
    const nextScreenName = state.app.screen;
    const nextScreen = screens[nextScreenName];

    if (!nextScreen) {
      throw new Error(`Unknown screen: ${nextScreenName}`);
    }

    // Avoid remounting active runtime screens on internal state updates.
    if (
      activeScreenName === nextScreenName &&
      (nextScreenName === "gameplay" || nextScreenName === "lesson")
    ) {
      renderLevelPickerOverlay(state);
      if (activeScreen?.onStateChange) {
        activeScreen.onStateChange(state, { store });
      }
      return;
    }

    if (activeScreen?.unmount) {
      activeScreen.unmount(screenContainer);
    }

    screenContainer.innerHTML = "";
    nextScreen.mount(screenContainer, { store, audio });
    renderLevelPickerOverlay(state);
    syncMusicForScreen(nextScreenName);
    screenNameNode.textContent = nextScreenName === "menu" ? "home" : nextScreenName;
    activeScreen = nextScreen;
    activeScreenName = nextScreenName;
    focusPreferredControl();
  }

  function renderLevelPickerOverlay(state) {
    if (!overlayContainer) return;
    if (!state.app.levelPickerOpen) {
      overlayContainer.innerHTML = "";
      return;
    }

    const levelButtons = state.levels.items
      .map((level) => {
        const selected = level.id === state.app.selectedLevelId ? "selected" : "";
        const autoFocus = selected ? "data-autofocus" : "";
        const mastered = state.progress.lessonMasteryByLevel[level.id] ? "M" : "-";
        const cleared = state.progress.clearedLevels[level.id] ? "C" : "-";
        return `
          <button
            class="${selected}"
            data-action="pick-level"
            data-level-id="${level.id}"
            aria-label="Select level ${level.id}"
            ${autoFocus}
          >
            Level ${level.id} ${mastered}${cleared}
          </button>
        `;
      })
      .join("");

    overlayContainer.innerHTML = `
      <div class="level-picker-overlay" data-action="close-level-picker">
        <div class="level-picker-modal" role="dialog" aria-label="Level picker">
          <div class="level-picker-head">
            <h2>Select Level</h2>
            <button data-action="close-level-picker" data-autofocus>Close</button>
          </div>
          <div class="level-grid">${levelButtons || "<p>No levels available.</p>"}</div>
        </div>
      </div>
    `;
  }

  function handleAction(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.dataset.action;

    if (action === "go-screen") {
      audio.resume();
      audio.playSfx("uiConfirm");
      const screen = button.dataset.screen;
      if (screen) setScreen(store, screen);
      return;
    }

    if (action === "pick-level") {
      audio.resume();
      audio.playSfx("uiConfirm");
      const levelId = Number(button.dataset.levelId);
      if (!Number.isNaN(levelId)) {
        setSelectedLevel(store, levelId);
        setSessionMode(store, "lesson");
        setScreen(store, "lesson");
      }
      return;
    }

    if (action === "toggle-level-picker") {
      audio.resume();
      audio.playSfx("uiMove");
      const isOpen = store.getState().app.levelPickerOpen;
      setLevelPickerOpen(store, !isOpen);
      return;
    }

    if (action === "close-level-picker") {
      audio.resume();
      audio.playSfx("uiBack");
      setLevelPickerOpen(store, false);
      return;
    }

    if (action === "start-game") {
      audio.resume();
      audio.playSfx("uiConfirm");
      setSessionMode(store, "lesson");
      setScreen(store, "lesson");
      return;
    }

    if (action === "start-lesson") {
      audio.resume();
      audio.playSfx("uiConfirm");
      setSessionMode(store, "lesson");
      setScreen(store, "lesson");
      return;
    }

    if (action === "finish-run") {
      audio.resume();
      audio.playSfx("uiBack");
      store.setState((prev) => ({
        ...prev,
        run: {
          ...prev.run,
          active: false,
          lastResult: prev.run.lastResult ?? {
            levelId: prev.app.selectedLevelId,
            mode: prev.session.mode,
            score: 0,
            maxCombo: 0,
            hits: { perfect: 0, good: 0, miss: 0 },
            accuracy: 0,
            completed: false
          }
        }
      }));
      setScreen(store, "results");
      return;
    }

    if (action === "replay-stage") {
      audio.resume();
      audio.playSfx("uiConfirm");
      if (activeScreen?.unmount) {
        activeScreen.unmount(screenContainer);
      }
      activeScreen = null;
      activeScreenName = null;
      renderScreen(store.getState());
      return;
    }

    if (action === "next-level") {
      audio.resume();
      audio.playSfx("uiConfirm");
      const state = store.getState();
      const maxLevel = state.levels.items.length;
      const current = state.app.selectedLevelId;
      const next = Math.min(current + 1, maxLevel);

      if (next !== current) {
        setSelectedLevel(store, next);
      }

      setSessionMode(store, "lesson");
      setScreen(store, "lesson");
      return;
    }

    if (action === "quick-start") {
      audio.resume();
      audio.playSfx("uiConfirm");
      setSessionMode(store, "quick_start");
      setScreen(store, "gameplay");
      return;
    }

    if (action === "toggle-mute") {
      audio.resume();
      store.setState((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          muted: !prev.settings.muted
        }
      }));
      audio.playSfx("uiConfirm");
      return;
    }

    if (action === "adjust-sfx") {
      audio.resume();
      const delta = Number(button.dataset.delta ?? 0);
      store.setState((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          sfxVolume: clamp01(prev.settings.sfxVolume + delta, prev.settings.sfxVolume)
        }
      }));
      audio.playSfx("uiMove");
      return;
    }

    if (action === "adjust-music") {
      audio.resume();
      const delta = Number(button.dataset.delta ?? 0);
      store.setState((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          musicVolume: clamp01(prev.settings.musicVolume + delta, prev.settings.musicVolume)
        }
      }));
      audio.playSfx("uiMove");
    }
  }

  function handleKeydown(event) {
    const state = store.getState();

    if (
      (state.app.screen === "settings" || state.app.screen === "progress") &&
      event.key === "Escape"
    ) {
      event.preventDefault();
      audio.resume();
      audio.playSfx("uiBack");
      setScreen(store, "menu");
      return;
    }

    if (state.app.levelPickerOpen && event.key === "Escape") {
      event.preventDefault();
      audio.resume();
      audio.playSfx("uiBack");
      setLevelPickerOpen(store, false);
      return;
    }

    if (state.app.levelPickerOpen && event.key === "Tab") {
      event.preventDefault();
      moveFocusByArrow(event.shiftKey ? -1 : 1);
      return;
    }

    if (
      event.key === "ArrowRight" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();
      audio.resume();
      audio.playSfx("uiMove");
      const step =
        event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      moveFocusByArrow(step);
      return;
    }

    if (event.key !== "Enter") return;

    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return;

    const isButton = active.tagName === "BUTTON";
    const isActionTarget = active.matches("[data-action], [data-ui='finish-run']");

    if (!isButton && !isActionTarget) return;

    event.preventDefault();
    active.click();
  }

  function init() {
    const root = document.getElementById(rootId);
    if (!root) {
      throw new Error(`Root element not found: #${rootId}`);
    }

    rootNode = root;
    createShell(root);

    screenContainer = root.querySelector("[data-ui='screenRoot']");
    overlayContainer = root.querySelector("[data-ui='overlayRoot']");
    screenNameNode = root.querySelector("[data-ui='screenName']");
    root.addEventListener("click", handleAction);
    root.addEventListener("keydown", handleKeydown);
    initialized = true;

    hydrateProgress(store);
    hydrateSettings(store);
    audio.configure(store.getState().settings);

    store.subscribe(renderScreen);
    store.subscribe((nextState) => {
      savePersistedProgress(nextState.progress);
      savePersistedSettings(nextState.settings);
      audio.configure(nextState.settings);
    });
    renderScreen(store.getState());

    setLevelsLoading(store);
    try {
      const levelsData = loadLevelsData();
      setLevelsLoaded(store, levelsData);
    } catch (error) {
      setLevelsError(store, error);
    }
  }

  function destroy() {
    if (!initialized || !rootNode) return;

    if (activeScreen?.unmount) {
      activeScreen.unmount(screenContainer);
    }

    rootNode.removeEventListener("click", handleAction);
    rootNode.removeEventListener("keydown", handleKeydown);
    audio.stopMusic();
    initialized = false;
    activeScreen = null;
    activeScreenName = null;
    screenContainer = null;
    overlayContainer = null;
    screenNameNode = null;
    rootNode = null;
  }

  return {
    init,
    destroy,
    store
  };
}
