export const settingsScreen = {
  mount(container, ctx) {
    const settings = ctx.store.getState().settings;
    const sfxPercent = Math.round((settings.sfxVolume ?? 0) * 100);
    const musicPercent = Math.round((settings.musicVolume ?? 0) * 100);
    container.innerHTML = `
      <section class="screen-panel">
        <div class="screen-top">
          <h2>Settings</h2>
          <p class="muted">Audio controls</p>
          <div class="settings-grid">
            <div class="settings-row">
              <span class="muted">Mute</span>
              <button data-action="toggle-mute">${settings.muted ? "On" : "Off"}</button>
            </div>
            <div class="settings-row">
              <span class="muted">SFX Volume</span>
              <div class="settings-stepper">
                <button data-action="adjust-sfx" data-delta="-0.1">-</button>
                <strong>${sfxPercent}%</strong>
                <button data-action="adjust-sfx" data-delta="0.1">+</button>
              </div>
            </div>
            <div class="settings-row">
              <span class="muted">Music Volume</span>
              <div class="settings-stepper">
                <button data-action="adjust-music" data-delta="-0.1">-</button>
                <strong>${musicPercent}%</strong>
                <button data-action="adjust-music" data-delta="0.1">+</button>
              </div>
            </div>
          </div>
        </div>
        <div class="button-row bottom-actions">
          <button class="primary" data-action="go-screen" data-screen="menu" data-autofocus>
            Close
          </button>
        </div>
      </section>
    `;
  },
  unmount() {}
};
