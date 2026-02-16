const INITIAL_STATE = {
  app: {
    screen: "menu",
    selectedLevelId: 1,
    levelPickerOpen: false
  },
  levels: {
    status: "idle",
    error: null,
    version: null,
    levelAccess: null,
    defaults: null,
    items: []
  },
  session: {
    mode: "quick_start",
    status: "idle"
  },
  run: {
    active: false,
    lastResult: null
  },
  lesson: {
    lastDrillResult: null
  },
  progress: {
    lessonMasteryByLevel: {},
    clearedLevels: {},
    runHistoryByLevel: {}
  },
  settings: {
    muted: false,
    sfxVolume: 0.7,
    musicVolume: 0.5
  }
};

export function createStore(initialState = INITIAL_STATE) {
  let state = structuredClone(initialState);
  const subscribers = new Set();

  function getState() {
    return state;
  }

  function setState(updater) {
    const nextState =
      typeof updater === "function"
        ? updater(state)
        : { ...state, ...updater };

    state = nextState;
    subscribers.forEach((listener) => listener(state));
  }

  function subscribe(listener) {
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  }

  return { getState, setState, subscribe };
}

export { INITIAL_STATE };
