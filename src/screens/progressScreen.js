import {
  getLevelProgressRows,
  getProgressSummary
} from "../state/selectors.js";

function renderLevelRows(rows) {
  if (rows.length === 0) {
    return `<p class="muted">No level data loaded yet.</p>`;
  }

  return `
    <table class="progress-table">
      <thead>
        <tr>
          <th>Level</th>
          <th>Lesson</th>
          <th>Stage</th>
          <th>Best Score</th>
          <th>Best Acc</th>
          <th>Best WPM</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
          <tr>
            <td>Level ${row.id}</td>
            <td>${row.lessonMastered ? "YES" : "NO"}</td>
            <td>${row.stageCleared ? "YES" : "NO"}</td>
            <td>${row.bestScore ?? "-"}</td>
            <td>${row.bestAccuracy !== null ? `${row.bestAccuracy}%` : "-"}</td>
            <td>${row.bestWpm ?? "-"}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

export const progressScreen = {
  mount(container, ctx) {
    const state = ctx.store.getState();
    const summary = getProgressSummary(state);
    const rows = getLevelProgressRows(state);
    const lastRun = state.run.lastResult;

    container.innerHTML = `
      <section class="screen-panel">
        <h2>Progress</h2>
        <div class="gameplay-hud">
          <span>Lessons Mastered <strong>${summary.masteredCount}/${summary.levelCount}</strong></span>
          <span>Stages Cleared <strong>${summary.clearedCount}/${summary.levelCount}</strong></span>
          <span>Total Runs <strong>${summary.totalRuns}</strong></span>
        </div>
        ${
          lastRun
            ? `<p class="muted">Latest Run: Level ${lastRun.levelId} | Score ${lastRun.score} | Acc ${lastRun.accuracy}% | WPM ${lastRun.wpm}</p>`
            : `<p class="muted">No runs recorded yet.</p>`
        }
        ${renderLevelRows(rows)}
        <div class="button-row bottom-actions">
          <button data-action="go-screen" data-screen="menu" data-autofocus>
            Close
          </button>
        </div>
      </section>
    `;
  },
  unmount() {}
};
