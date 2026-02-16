import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/core/criteria.js", () => ({
  evaluateLessonMastery: vi.fn(),
  evaluateStageClear: vi.fn(() => false)
}));

vi.mock("../src/engine/lessonDrill.js", () => ({
  buildLessonDrillChart: vi.fn(() => [{ id: 1, key: "f", hitTimeMs: 0 }])
}));

vi.mock("../src/engine/noteTrack.js", () => ({
  createNoteTrack: vi.fn(() => ({
    resolveInput: vi.fn(() => ({ type: "none" })),
    autoMissExpired: vi.fn(() => []),
    getNotes: vi.fn(() => [])
  }))
}));

vi.mock("../src/engine/gameLoop.js", () => ({
  createGameLoop: vi.fn((handlers) => ({
    start: vi.fn(() => {
      handlers.update(2000);
      handlers.render(2000);
    }),
    stop: vi.fn()
  }))
}));

vi.mock("../src/input/keyboard.js", () => ({
  createKeyboardInput: vi.fn(() => ({ destroy: vi.fn() }))
}));

vi.mock("../src/render/gameplayCanvas.js", () => ({
  createGameplayCanvas: vi.fn(() => ({
    render: vi.fn(),
    drawIdleFrame: vi.fn(),
    drawCenteredSummary: vi.fn(),
    getHitboxTimingWindowMs: vi.fn(() => 180)
  }))
}));

import { evaluateLessonMastery } from "../src/core/criteria.js";
import { createGameLoop } from "../src/engine/gameLoop.js";
import { lessonScreen } from "../src/screens/lessonScreen.js";
import { gameplayScreen } from "../src/screens/gameplayScreen.js";

function createStore(initialState) {
  let state = structuredClone(initialState);
  return {
    getState() {
      return state;
    },
    setState(updater) {
      state = typeof updater === "function" ? updater(state) : { ...state, ...updater };
    }
  };
}

function baseState() {
  return {
    app: { screen: "lesson", selectedLevelId: 1, levelPickerOpen: false },
    levels: {
      status: "loaded",
      defaults: {
        lessonDrill: { notes: 8, durationSec: 10, passAccuracy: 0.85, passStreak: 6 },
        stagePass: { minAccuracy: 0.8, minMaxStreak: 15, minTargetKeyHitRate: 0.7 }
      },
      items: [
        {
          id: 1,
          title: "F + J",
          goal: "Goal",
          keysPrimary: ["f", "j"],
          lesson: { expectation: "x", patterns: ["f j"] },
          stage: { durationSec: 30, targetNps: 1.2, patternPool: ["f j"] }
        },
        {
          id: 2,
          title: "D + K",
          goal: "Goal",
          keysPrimary: ["d", "k"],
          lesson: { expectation: "x", patterns: ["d k"] },
          stage: { durationSec: 35, targetNps: 1.5, patternPool: ["d k"] }
        }
      ]
    },
    session: { mode: "lesson", status: "idle" },
    run: { active: false, lastResult: null },
    lesson: { lastDrillResult: null },
    progress: { lessonMasteryByLevel: {}, clearedLevels: {}, runHistoryByLevel: {} },
    settings: { muted: false, sfxVolume: 0.7, musicVolume: 0.5 }
  };
}

describe("lesson and gameplay flow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("auto-advances to play trigger after passing practice", () => {
    evaluateLessonMastery.mockReturnValue(true);
    const container = document.createElement("div");
    const store = createStore(baseState());
    const audio = { playSfx: vi.fn(), playMusic: vi.fn(), resume: vi.fn() };

    lessonScreen.mount(container, { store, audio });
    const continueButton = container.querySelector("[data-ui='continue-stage']");
    const continueClickSpy = vi.spyOn(continueButton, "click");

    container.querySelector("[data-ui='start-drill']").click();
    vi.advanceTimersByTime(3000);

    expect(container.querySelector("[data-ui='countdown-overlay']").textContent).toBe(
      "You are Ready!"
    );

    vi.advanceTimersByTime(1000);
    expect(continueClickSpy).toHaveBeenCalled();
  });

  it("auto-restarts practice after fail transition", () => {
    evaluateLessonMastery.mockReturnValue(false);
    const container = document.createElement("div");
    const store = createStore(baseState());
    const audio = { playSfx: vi.fn(), playMusic: vi.fn(), resume: vi.fn() };

    lessonScreen.mount(container, { store, audio });
    container.querySelector("[data-ui='start-drill']").click();
    vi.advanceTimersByTime(3000);

    expect(container.querySelector("[data-ui='countdown-overlay']").textContent).toBe(
      "You need more practice"
    );

    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(1);
    expect(container.querySelector("[data-ui='countdown-overlay']").textContent).toBe("3");
  });

  it("starts gameplay with countdown and switches music to home on finish", () => {
    createGameLoop.mockImplementationOnce(() => ({
      start: vi.fn(),
      stop: vi.fn()
    }));

    const container = document.createElement("div");
    const state = baseState();
    state.app.screen = "gameplay";
    state.session.mode = "lesson";
    const store = createStore(state);
    const audio = { playSfx: vi.fn(), playMusic: vi.fn(), resume: vi.fn() };

    gameplayScreen.mount(container, { store, audio });
    vi.advanceTimersByTime(0);
    expect(container.querySelector("[data-ui='countdown-overlay']").textContent).toBe("3");

    vi.advanceTimersByTime(3000);
    const skipButton = container.querySelector("[data-ui='finish-run']");
    expect(skipButton.disabled).toBe(false);
    skipButton.click();

    expect(audio.playMusic).toHaveBeenCalledWith("home");
  });
});
