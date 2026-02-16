export const resultsScreen = {
  mount(container, ctx) {
    const { app, run } = ctx.store.getState();
    const levelId = run.lastResult?.levelId ?? app.selectedLevelId;
    const summary = run.lastResult;

    container.innerHTML = `
      <section class="screen-panel">
        <h2>Results (Level ${levelId})</h2>
        ${
          summary
            ? `
          <p><strong>Level:</strong> ${summary.levelTitle ?? `Level ${levelId}`}</p>
          <p><strong>Score:</strong> ${summary.score}</p>
          <p><strong>Accuracy:</strong> ${summary.accuracy}%</p>
          <p><strong>WPM:</strong> ${summary.wpm}</p>
          <p><strong>Max Combo:</strong> ${summary.maxCombo}</p>
          <p><strong>Target Key Hit Rate:</strong> ${summary.targetKeyHitRate}%</p>
          <p><strong>Hits:</strong> P ${summary.hits.perfect} | G ${summary.hits.good} | M ${summary.hits.miss}</p>
          <p><strong>Stage Clear:</strong> ${summary.cleared ? "YES" : "NO"}</p>
          <p class="muted">Run status: ${summary.completed ? "Completed stage" : "Manually ended"}</p>
        `
            : `<p class="muted">No completed run yet. Start a level to generate results.</p>`
        }
        <div class="button-row bottom-actions">
          <button
            class="primary"
            data-action="go-screen"
            data-screen="menu"
            data-autofocus
          >
            Quit
          </button>
          <button data-action="go-screen" data-screen="gameplay">Replay Level</button>
        </div>
      </section>
    `;
  },
  unmount() {}
};
