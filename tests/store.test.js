import { describe, expect, it, vi } from "vitest";
import { createStore, INITIAL_STATE } from "../src/state/store.js";

describe("store", () => {
  it("initializes with expected default state shape", () => {
    const store = createStore();
    const state = store.getState();

    expect(state).toEqual(INITIAL_STATE);
  });

  it("supports functional state updates", () => {
    const store = createStore();

    store.setState((prev) => ({
      ...prev,
      app: {
        ...prev.app,
        screen: "levelSelect"
      }
    }));

    expect(store.getState().app.screen).toBe("levelSelect");
    expect(store.getState().app.selectedLevelId).toBe(1);
  });

  it("notifies subscribers on state updates", () => {
    const store = createStore();
    const listener = vi.fn();

    store.subscribe(listener);
    store.setState((prev) => ({
      ...prev,
      session: { ...prev.session, mode: "lesson" }
    }));

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].session.mode).toBe("lesson");
  });

  it("supports unsubscribe to stop notifications", () => {
    const store = createStore();
    const listener = vi.fn();

    const unsubscribe = store.subscribe(listener);
    unsubscribe();

    store.setState((prev) => ({
      ...prev,
      app: { ...prev.app, selectedLevelId: 4 }
    }));

    expect(listener).not.toHaveBeenCalled();
  });
});
