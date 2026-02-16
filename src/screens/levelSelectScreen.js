function getLevelButtons() {
  return Array.from({ length: 10 }, (_, index) => {
    const level = index + 1;
    return `<button data-action="pick-level" data-level-id="${level}">Level ${level}</button>`;
  }).join("");
}

export const levelSelectScreen = {
  mount(container, ctx) {
    const state = ctx.store.getState();
    const currentLevel = state.app.selectedLevelId;

    container.innerHTML = `
      <section class="screen-panel">
        <h2>Select Level</h2>
        <p class="muted">All levels are available. Select one, then lesson or quick start.</p>
        <div class="level-grid">
          ${getLevelButtons()}
        </div>
        <p>Selected Level: <strong>Level ${currentLevel}</strong></p>
        <div class="button-row bottom-actions">
          <button class="accent" data-action="start-lesson">Start Lesson</button>
          <button class="primary" data-action="quick-start">Quick Start</button>
          <button data-action="go-screen" data-screen="menu">Back</button>
        </div>
      </section>
    `;
  },
  unmount() {}
};
