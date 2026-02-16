import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/core/app.js";

function mountRoot(id = "app") {
  document.body.innerHTML = `<div id="${id}"></div>`;
  return document.getElementById(id);
}

describe("app routing and actions", () => {
  let app = null;

  beforeEach(() => {
    document.body.innerHTML = "";
    window.localStorage.clear();
    app = null;
  });

  afterEach(() => {
    if (app) {
      app.destroy();
      app = null;
    }
  });

  it("throws if root element is missing", () => {
    app = createApp({ rootId: "missing-root" });

    expect(() => app.init()).toThrow("Root element not found");
  });

  it("boots on menu screen", () => {
    mountRoot();
    app = createApp();
    app.init();

    expect(app.store.getState().app.screen).toBe("menu");
    expect(document.activeElement?.textContent?.trim()).toBe("Start");
  });

  it("enters lesson from menu via Start Game", () => {
    mountRoot();
    app = createApp();
    app.init();

    document.querySelector("[data-action='start-game']").click();

    const state = app.store.getState();
    expect(state.app.selectedLevelId).toBe(1);
    expect(state.session.mode).toBe("lesson");
    expect(state.app.screen).toBe("lesson");
  });

  it("sets level from picker and starts lesson for selected level", () => {
    mountRoot();
    app = createApp();
    app.init();

    document.querySelector("[data-action='toggle-level-picker']").click();
    document.querySelector("[data-action='pick-level'][data-level-id='4']").click();

    const state = app.store.getState();
    expect(state.app.selectedLevelId).toBe(4);
    expect(state.session.mode).toBe("lesson");
    expect(state.app.screen).toBe("lesson");
  });

  it("starts stage from lesson screen", () => {
    mountRoot();
    app = createApp();
    app.init();

    document.querySelector("[data-action='start-game']").click();
    document.querySelector("[data-screen='gameplay']").click();

    const state = app.store.getState();
    expect(state.session.mode).toBe("lesson");
    expect(state.app.screen).toBe("gameplay");
  });

  it("jumps to selected lesson from gameplay via global level picker", () => {
    mountRoot();
    app = createApp();
    app.init();

    document.querySelector("[data-action='start-game']").click();
    document.querySelector("[data-screen='gameplay']").click();
    expect(app.store.getState().app.screen).toBe("gameplay");

    document.querySelector("[data-action='toggle-level-picker']").click();
    document.querySelector("[data-action='pick-level'][data-level-id='2']").click();

    const state = app.store.getState();
    expect(state.app.selectedLevelId).toBe(2);
    expect(state.session.mode).toBe("lesson");
    expect(state.app.screen).toBe("lesson");
  });

  it("opens and closes level picker popup", () => {
    mountRoot();
    app = createApp();
    app.init();

    document.querySelector("[data-action='toggle-level-picker']").click();
    expect(app.store.getState().app.levelPickerOpen).toBe(true);
    expect(document.querySelector(".level-picker-modal")).not.toBeNull();

    document.querySelector("[data-action='close-level-picker']").click();
    expect(app.store.getState().app.levelPickerOpen).toBe(false);
    expect(document.querySelector(".level-picker-modal")).toBeNull();
  });

  it("closes level picker, settings, and progress with Escape", () => {
    const root = mountRoot();
    app = createApp();
    app.init();

    document.querySelector("[data-action='toggle-level-picker']").click();
    expect(app.store.getState().app.levelPickerOpen).toBe(true);

    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(app.store.getState().app.levelPickerOpen).toBe(false);

    document.querySelector(".global-settings-button").click();
    expect(app.store.getState().app.screen).toBe("settings");

    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(app.store.getState().app.screen).toBe("menu");

    document.querySelector(".star-progress-button").click();
    expect(app.store.getState().app.screen).toBe("progress");

    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(app.store.getState().app.screen).toBe("menu");
  });

  it("activates focused button with Enter key", () => {
    const root = mountRoot();
    app = createApp();
    app.init();

    const startButton = document.querySelector("[data-action='start-game']");
    startButton.focus();

    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(app.store.getState().app.screen).toBe("lesson");
  });

  it("moves focus between buttons with arrow keys", () => {
    const root = mountRoot();
    app = createApp();
    app.init();

    const startButton = document.querySelector("[data-action='start-game']");
    startButton.focus();

    root.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })
    );
    expect(document.activeElement?.textContent?.trim()).toBe("Start");

    root.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true })
    );
    expect(document.activeElement?.textContent?.trim()).toBe("Start");
  });
});
