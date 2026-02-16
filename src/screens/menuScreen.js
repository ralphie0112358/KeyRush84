import { getSelectedLevel, hasLoadedLevels } from "../state/selectors.js";

export const menuScreen = {
  mount(container, ctx) {
    const state = ctx.store.getState();
    const selectedLevel = getSelectedLevel(state);
    const currentLevel = state.app.selectedLevelId;
    const canStart = hasLoadedLevels(state) && selectedLevel !== null;

    container.innerHTML = `
      <section class="screen-panel menu-panel">
        <div class="screen-top">
          <h1>KeyRush84</h1>
        </div>
        <div class="playfield-block">
          <div class="menu-playfield-preview" aria-hidden="true">
            <div class="menu-preview-meta">
              <span>Press Start Game</span>
              <span>Use arrows + Enter</span>
            </div>
            <div class="menu-preview-text">Level ${currentLevel}</div>
          </div>
          <div class="playfield-hitline" aria-hidden="true"></div>
        </div>
        <div class="button-row bottom-actions">
          <button class="primary" data-action="start-game" data-autofocus ${
            canStart ? "" : "disabled"
          }>Start</button>
        </div>
      </section>
    `;
  },
  unmount() {}
};
