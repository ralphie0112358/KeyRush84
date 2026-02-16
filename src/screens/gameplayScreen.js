import { GAMEPLAY } from "../core/constants.js";
import { evaluateStageClear } from "../core/criteria.js";
import { buildChartFromLevel } from "../engine/chartBuilder.js";
import { createGameLoop } from "../engine/gameLoop.js";
import { createNoteTrack } from "../engine/noteTrack.js";
import { applyHit, applyMiss, createScoreState } from "../engine/scoring.js";
import { createKeyboardInput } from "../input/keyboard.js";
import { createGameplayCanvas } from "../render/gameplayCanvas.js";
import { getSelectedLevel } from "../state/selectors.js";

function createEmptyTargetStats() {
  return {
    total: 0,
    correct: 0
  };
}

export const gameplayScreen = {
  mount(container, ctx) {
    const state = ctx.store.getState();
    const selectedLevel = getSelectedLevel(state);

        if (!selectedLevel) {
      container.innerHTML = `
        <section class="screen-panel">
          <h2>Gameplay</h2>
          <p class="muted">No level data is available. Return to start and retry.</p>
          <div class="button-row bottom-actions">
            <button data-action="go-screen" data-screen="menu">Quit</button>
          </div>
        </section>
      `;
      return;
    }

    const levelId = selectedLevel.id;
    const mode = state.session.mode;
    const fixedStageTotalNotes = state.levels.defaults?.stageTotalNotes;
    const chart = buildChartFromLevel(selectedLevel, {
      totalNotes: fixedStageTotalNotes
    });
    const targetKeys = new Set(selectedLevel.keysPrimary);
    const stagePassThresholds = state.levels.defaults?.stagePass;
    const stageDurationMs = selectedLevel.stage.durationSec * 1000;
    const inputQueue = [];

    let scoreState = createScoreState();
    let targetStats = createEmptyTargetStats();
    let lastFeedback = "READY";
    let simTimeMs = 0;
    let finalized = false;
    let countdownTimers = [];
    let keyboard = null;
    let loop = null;

    container.innerHTML = `
      <section class="screen-panel gameplay-panel">
        <div class="screen-top">
          <h2>Gameplay: Level ${levelId} - ${selectedLevel.title}</h2>
          <p class="muted">${selectedLevel.goal}</p>
          <div class="gameplay-hud">
            <span>Score <strong data-ui="score">0</strong></span>
            <span>Combo <strong data-ui="combo">0</strong></span>
            <span data-ui="multiplier">x1</span>
            <span>Acc <strong data-ui="accuracy">0%</strong></span>
            <span>WPM <strong data-ui="wpm">0</strong></span>
            <span>Time <strong data-ui="time-left">${selectedLevel.stage.durationSec.toFixed(
              1
            )}s</strong></span>
          </div>
          <p class="muted gameplay-feedback">Feedback: <strong data-ui="feedback">READY</strong></p>
          <p class="muted lesson-compact">Primary Keys: ${selectedLevel.keysPrimary.join(", ")}</p>
        </div>
        <div class="playfield-block">
          <canvas
            data-ui="highway"
            width="860"
            height="360"
            class="gameplay-canvas"
            aria-label="typing highway"
          ></canvas>
          <div class="playfield-hitline" aria-hidden="true"></div>
          <div class="playfield-countdown hidden" data-ui="countdown-overlay" aria-live="polite"></div>
        </div>
        <div class="button-row bottom-actions" data-ui="run-actions">
          <button data-action="go-screen" data-screen="lesson">Practice</button>
          <button class="primary" data-ui="finish-run" data-autofocus>Skip</button>
          <button data-action="go-screen" data-screen="menu">Quit</button>
        </div>
        <div class="button-row bottom-actions hidden" data-ui="post-actions">
          <button class="primary" data-action="next-level" data-ui="post-next">
            Next
          </button>
          <button data-action="replay-stage" data-ui="post-replay">Replay</button>
          <button data-action="go-screen" data-screen="menu">Quit</button>
        </div>
      </section>
    `;

    const ui = {
      score: container.querySelector("[data-ui='score']"),
      combo: container.querySelector("[data-ui='combo']"),
      multiplier: container.querySelector("[data-ui='multiplier']"),
      accuracy: container.querySelector("[data-ui='accuracy']"),
      wpm: container.querySelector("[data-ui='wpm']"),
      timeLeft: container.querySelector("[data-ui='time-left']"),
      feedback: container.querySelector("[data-ui='feedback']"),
      canvas: container.querySelector("[data-ui='highway']"),
      countdownOverlay: container.querySelector("[data-ui='countdown-overlay']"),
      finishRun: container.querySelector("[data-ui='finish-run']"),
      runActions: container.querySelector("[data-ui='run-actions']"),
      postActions: container.querySelector("[data-ui='post-actions']"),
      postNext: container.querySelector("[data-ui='post-next']"),
      postReplay: container.querySelector("[data-ui='post-replay']")
    };

    const canvasRenderer = createGameplayCanvas({
      canvas: ui.canvas,
      notes: chart
    });
    const visualGoodWindowMs = Math.round(canvasRenderer.getHitboxTimingWindowMs());
    const stageWindows = {
      perfect: Math.max(60, Math.round(visualGoodWindowMs * 0.5)),
      good: Math.max(120, visualGoodWindowMs)
    };
    const noteTrack = createNoteTrack(chart, stageWindows);

    function stopActiveRun() {
      countdownTimers.forEach((timerId) => clearTimeout(timerId));
      countdownTimers = [];
      ui.countdownOverlay.textContent = "";
      ui.countdownOverlay.classList.add("hidden");
      if (loop) loop.stop();
      if (keyboard) keyboard.destroy();
      loop = null;
      keyboard = null;
    }

    function getElapsedActiveMs() {
      return Math.min(stageDurationMs, Math.max(0, simTimeMs - GAMEPLAY.leadInMs));
    }

    function buildRunSummary(completed) {
      const totalJudged =
        scoreState.hits.perfect + scoreState.hits.good + scoreState.hits.miss;
      const correctJudged = scoreState.hits.perfect + scoreState.hits.good;
      const accuracy =
        totalJudged > 0 ? correctJudged / totalJudged : 0;
      const elapsedMinutes = getElapsedActiveMs() / 60000;
      const wpm =
        elapsedMinutes > 0 ? Math.round((correctJudged / 5) / elapsedMinutes) : 0;
      const targetKeyHitRate =
        targetStats.total > 0 ? targetStats.correct / targetStats.total : 0;
      const cleared = evaluateStageClear(
        {
          accuracy,
          maxStreak: scoreState.maxCombo,
          targetKeyHitRate
        },
        stagePassThresholds
      );

      return {
        levelId,
        levelTitle: selectedLevel.title,
        mode,
        score: scoreState.score,
        maxCombo: scoreState.maxCombo,
        hits: scoreState.hits,
        accuracy: Math.round(accuracy * 100),
        wpm,
        targetKeyHitRate: Math.round(targetKeyHitRate * 100),
        cleared,
        completed
      };
    }

    function finalizeRun({ completed }) {
      if (finalized) return;
      finalized = true;
      stopActiveRun();

      const summary = buildRunSummary(completed);

      ctx.store.setState((prev) => ({
        ...prev,
        progress: {
          ...prev.progress,
          clearedLevels: {
            ...prev.progress.clearedLevels,
            [levelId]: Boolean(prev.progress.clearedLevels[levelId] || summary.cleared)
          },
          runHistoryByLevel: {
            ...prev.progress.runHistoryByLevel,
            [levelId]: [summary, ...(prev.progress.runHistoryByLevel[levelId] ?? [])].slice(
              0,
              25
            )
          }
        },
        run: {
          active: false,
          lastResult: summary
        }
      }));

      // Clear active UI and render centered stats directly on the playfield.
      ui.runActions.classList.add("hidden");
      ui.postActions.classList.remove("hidden");
      if (selectedLevel.id >= state.levels.items.length) {
        ui.postNext.disabled = true;
      }
      ui.feedback.textContent = "STAGE ENDED";
      ctx.audio?.playMusic("home");
      ctx.audio?.playSfx(summary.cleared ? "stagePass" : "stageFail");
      canvasRenderer.drawCenteredSummary(summary);
      const preferredButton = summary.cleared ? ui.postNext : ui.postReplay;
      (preferredButton?.disabled ? ui.postReplay : preferredButton)?.focus();
    }

    function processResult(result) {
      if (result.type === "none") return;

      if (targetKeys.has(result.expectedKey)) {
        targetStats = {
          ...targetStats,
          total: targetStats.total + 1,
          correct:
            result.type === "miss"
              ? targetStats.correct
              : targetStats.correct + 1
        };
      }

      if (result.type === "perfect" || result.type === "good") {
        scoreState = applyHit(scoreState, result.type);
        lastFeedback = result.type.toUpperCase();
        ctx.audio?.playSfx(result.type === "perfect" ? "hitPerfect" : "hitGood");
        return;
      }

      if (result.type === "miss") {
        scoreState = applyMiss(scoreState);
        lastFeedback = "MISS";
        ctx.audio?.playSfx("hitMiss");
      }
    }

    function beginStageRun() {
      if (finalized) return;
      ui.countdownOverlay.textContent = "";
      ui.countdownOverlay.classList.add("hidden");
      ui.finishRun.disabled = false;
      lastFeedback = "READY";

      keyboard = createKeyboardInput({
        onKey({ key }) {
          if (finalized) return;
          inputQueue.push({ key });
        }
      });

      loop = createGameLoop({
        update(currentSimTimeMs) {
          simTimeMs = currentSimTimeMs;

          const queue = inputQueue.splice(0, inputQueue.length);
          queue.forEach((input) => {
            const result = noteTrack.resolveInput({
              key: input.key,
              timeMs: currentSimTimeMs
            });
            processResult(result);
          });

          noteTrack.autoMissExpired(currentSimTimeMs).forEach(processResult);

          if (currentSimTimeMs >= stageDurationMs + GAMEPLAY.leadInMs) {
            finalizeRun({ completed: true });
          }
        },
        render(currentSimTimeMs) {
          const totalJudged =
            scoreState.hits.perfect + scoreState.hits.good + scoreState.hits.miss;
          const correctJudged = scoreState.hits.perfect + scoreState.hits.good;
          const accuracy =
            totalJudged > 0 ? Math.round((correctJudged / totalJudged) * 100) : 0;
          const elapsedMinutes = getElapsedActiveMs() / 60000;
          const wpm =
            elapsedMinutes > 0 ? Math.round((correctJudged / 5) / elapsedMinutes) : 0;
          const timeLeftMs = Math.max(
            0,
            stageDurationMs - Math.max(0, currentSimTimeMs - GAMEPLAY.leadInMs)
          );

          ui.score.textContent = String(scoreState.score);
          ui.combo.textContent = String(scoreState.combo);
          ui.multiplier.textContent = `x${scoreState.multiplier}`;
          ui.accuracy.textContent = `${accuracy}%`;
          ui.wpm.textContent = String(wpm);
          ui.timeLeft.textContent = `${(timeLeftMs / 1000).toFixed(1)}s`;
          ui.feedback.textContent = lastFeedback;

          canvasRenderer.render({
            simTimeMs: currentSimTimeMs,
            noteTrack,
            lastFeedback
          });
        }
      });

      loop.start();
    }

    function startStageCountdown() {
      ctx.audio?.resume();
      ui.finishRun.disabled = true;
      const countdownValues = ["3", "2", "1"];
      countdownValues.forEach((value, index) => {
        const timerId = setTimeout(() => {
          ui.countdownOverlay.classList.remove("hidden");
          ui.countdownOverlay.textContent = value;
          lastFeedback = value;
          ui.feedback.textContent = value;
          ctx.audio?.playSfx("countdownTick");
        }, index * 1000);
        countdownTimers.push(timerId);
      });

      const startTimerId = setTimeout(() => {
        ctx.audio?.playSfx("countdownGo");
        beginStageRun();
      }, countdownValues.length * 1000);
      countdownTimers.push(startTimerId);
    }

    function onFinishClick(event) {
      event.preventDefault();
      event.stopPropagation();
      finalizeRun({ completed: false });
    }

    ui.finishRun.addEventListener("click", onFinishClick);
    startStageCountdown();

    container.__cleanup = () => {
      finalized = true;
      stopActiveRun();
      ui.finishRun.removeEventListener("click", onFinishClick);
    };
  },
  unmount(container) {
    if (container?.__cleanup) {
      container.__cleanup();
      delete container.__cleanup;
    }
  }
};
