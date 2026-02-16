import { evaluateLessonMastery } from "../core/criteria.js";
import { createGameLoop } from "../engine/gameLoop.js";
import { buildLessonDrillChart } from "../engine/lessonDrill.js";
import { createNoteTrack } from "../engine/noteTrack.js";
import { applyHit, applyMiss, createScoreState } from "../engine/scoring.js";
import { createKeyboardInput } from "../input/keyboard.js";
import { createGameplayCanvas } from "../render/gameplayCanvas.js";
import { getSelectedLevel } from "../state/selectors.js";

export const lessonScreen = {
  mount(container, ctx) {
    const state = ctx.store.getState();
    const selectedLevel = getSelectedLevel(state);
    const levelId = state.app.selectedLevelId;

    if (!selectedLevel) {
      container.innerHTML = `
        <section class="screen-panel">
          <h2>Lesson</h2>
          <p class="muted">No level data available. Return to start and retry.</p>
          <div class="button-row bottom-actions">
            <button data-action="go-screen" data-screen="menu">Quit</button>
          </div>
        </section>
      `;
      return;
    }

    const drillConfig = state.levels.defaults?.lessonDrill ?? {
      notes: 30,
      durationSec: 15,
      passAccuracy: 0.85,
      passStreak: 10
    };

    const previousResult =
      state.lesson.lastDrillResult?.levelId === levelId
        ? state.lesson.lastDrillResult
        : null;
    const hasPassedLesson = Boolean(previousResult?.passed);

    container.innerHTML = `
      <section class="screen-panel gameplay-panel">
        <div class="screen-top">
          <h2>Lesson: Level ${levelId} - ${selectedLevel.title}</h2>
          <p class="muted">${selectedLevel.goal}</p>
          <p class="lesson-compact">
            Expected: ${selectedLevel.lesson.expectation}
          </p>
          <p class="lesson-compact">
            Keys: ${selectedLevel.keysPrimary.join(", ")} · Patterns: ${selectedLevel.lesson.patterns
              .slice(0, 2)
              .join(" | ")}
          </p>
          <div class="gameplay-hud">
            <span>Notes <strong data-ui="notes-progress">0 / ${drillConfig.notes}</strong></span>
            <span>Acc <strong data-ui="accuracy">0%</strong></span>
            <span>Streak <strong data-ui="streak">0</strong></span>
            <span>Best <strong data-ui="best-streak">0</strong></span>
            <span>Time <strong data-ui="time-left">${drillConfig.durationSec.toFixed(1)}s</strong></span>
            <span>Status <strong data-ui="status">READY</strong></span>
          </div>
          <p class="muted lesson-compact" data-ui="pass-criteria">
            Pass target: Accuracy >= ${Math.round(
              drillConfig.passAccuracy * 100
            )}% and streak >= ${drillConfig.passStreak}
          </p>
          <p class="muted lesson-compact" data-ui="result-line">
            ${
              previousResult
                ? `Last drill: ${previousResult.passed ? "PASSED" : "NOT PASSED"} (${previousResult.accuracyPct}% / streak ${previousResult.maxStreak})`
                : "Run the drill to practice this level before stage."
            }
          </p>
        </div>
        <div class="playfield-block">
          <canvas
            data-ui="highway"
            width="860"
            height="300"
            class="gameplay-canvas"
            aria-label="lesson drill highway"
          ></canvas>
          <div class="playfield-hitline" aria-hidden="true"></div>
          <div class="playfield-countdown hidden" data-ui="countdown-overlay" aria-live="polite"></div>
        </div>

        <div class="button-row bottom-actions">
          <button class="primary" data-ui="start-drill" ${
            hasPassedLesson ? "" : "data-autofocus"
          }>
            Practice
          </button>
          <button
            data-action="go-screen"
            data-screen="gameplay"
            data-ui="continue-stage"
            ${hasPassedLesson ? "data-autofocus" : ""}
          >
            Play
          </button>
          <button data-action="go-screen" data-screen="menu">Quit</button>
        </div>
      </section>
    `;

    const ui = {
      notesProgress: container.querySelector("[data-ui='notes-progress']"),
      accuracy: container.querySelector("[data-ui='accuracy']"),
      streak: container.querySelector("[data-ui='streak']"),
      bestStreak: container.querySelector("[data-ui='best-streak']"),
      timeLeft: container.querySelector("[data-ui='time-left']"),
      status: container.querySelector("[data-ui='status']"),
      resultLine: container.querySelector("[data-ui='result-line']"),
      canvas: container.querySelector("[data-ui='highway']"),
      countdownOverlay: container.querySelector("[data-ui='countdown-overlay']"),
      startDrill: container.querySelector("[data-ui='start-drill']"),
      continueStage: container.querySelector("[data-ui='continue-stage']")
    };

    let loop = null;
    let keyboard = null;
    let noteTrack = null;
    let renderer = null;
    let chart = [];
    let targetNotes = drillConfig.notes;
    let scoreState = createScoreState();
    let finalized = false;
    let simTimeMs = 0;
    const inputQueue = [];
    let stageDurationMs = drillConfig.durationSec * 1000;
    let countdownTimers = [];
    let autoAdvanceTimer = null;

    function stopDrill() {
      countdownTimers.forEach((timerId) => clearTimeout(timerId));
      countdownTimers = [];
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
      }
      ui.countdownOverlay.textContent = "";
      ui.countdownOverlay.classList.remove("ready-message");
      ui.countdownOverlay.classList.add("hidden");
      if (loop) loop.stop();
      if (keyboard) keyboard.destroy();
      loop = null;
      keyboard = null;
    }

    function finalizeDrill(completed) {
      if (finalized) return;
      finalized = true;
      stopDrill();

      const totalJudged =
        scoreState.hits.perfect + scoreState.hits.good + scoreState.hits.miss;
      const correctJudged = scoreState.hits.perfect + scoreState.hits.good;
      const accuracy = totalJudged > 0 ? correctJudged / totalJudged : 0;
      const passed = evaluateLessonMastery(
        {
          accuracy,
          maxStreak: scoreState.maxCombo
        },
        {
          passAccuracy: drillConfig.passAccuracy,
          passStreak: drillConfig.passStreak
        }
      );

      const result = {
        levelId,
        accuracyPct: Math.round(accuracy * 100),
        maxStreak: scoreState.maxCombo,
        totalJudged,
        passed,
        completed
      };

      ctx.store.setState((prev) => ({
        ...prev,
        lesson: {
          ...prev.lesson,
          lastDrillResult: result
        },
        progress: {
          ...prev.progress,
          lessonMasteryByLevel: {
            ...prev.progress.lessonMasteryByLevel,
            [levelId]: Boolean(prev.progress.lessonMasteryByLevel[levelId] || passed)
          }
        }
      }));

      ui.status.textContent = passed ? "PASSED" : "NOT PASSED";
      ui.resultLine.textContent = `Drill ${passed ? "passed" : "not passed"}: ${result.accuracyPct}% accuracy, best streak ${result.maxStreak}.`;
      renderer?.drawIdleFrame(ui.status.textContent);
      ctx.audio?.playSfx(passed ? "lessonPass" : "lessonFail");
      ui.startDrill.disabled = false;
      if (passed) {
        ui.countdownOverlay.classList.remove("hidden");
        ui.countdownOverlay.classList.add("ready-message");
        ui.countdownOverlay.textContent = "You are Ready!";
        autoAdvanceTimer = setTimeout(() => {
          ui.continueStage?.click();
        }, 1000);
      } else {
        ui.countdownOverlay.classList.remove("hidden");
        ui.countdownOverlay.classList.add("ready-message");
        ui.countdownOverlay.textContent = "You need more practice";
        autoAdvanceTimer = setTimeout(() => {
          startDrill();
        }, 1000);
      }
    }

    function updateHud() {
      const totalJudged =
        scoreState.hits.perfect + scoreState.hits.good + scoreState.hits.miss;
      const correctJudged = scoreState.hits.perfect + scoreState.hits.good;
      const accuracyPct =
        totalJudged > 0 ? Math.round((correctJudged / totalJudged) * 100) : 0;
      const timeLeftMs = Math.max(0, stageDurationMs - simTimeMs);

      ui.notesProgress.textContent = `${Math.min(totalJudged, targetNotes)} / ${
        targetNotes
      }`;
      ui.accuracy.textContent = `${accuracyPct}%`;
      ui.streak.textContent = String(scoreState.combo);
      ui.bestStreak.textContent = String(scoreState.maxCombo);
      ui.timeLeft.textContent = `${(timeLeftMs / 1000).toFixed(1)}s`;
    }

    function processResult(result) {
      if (result.type === "none") return;
      if (result.type === "perfect" || result.type === "good") {
        scoreState = applyHit(scoreState, result.type);
        ui.status.textContent = result.type.toUpperCase();
        ctx.audio?.playSfx(result.type === "perfect" ? "hitPerfect" : "hitGood");
        return;
      }
      if (result.type === "miss") {
        scoreState = applyMiss(scoreState);
        ui.status.textContent = "MISS";
        ctx.audio?.playSfx("hitMiss");
      }
    }

    function beginDrillRun() {
      if (finalized) return;
      ui.countdownOverlay.textContent = "";
      ui.countdownOverlay.classList.add("hidden");
      chart = buildLessonDrillChart(selectedLevel, drillConfig);
      targetNotes = chart.length;
      stageDurationMs = (chart[chart.length - 1]?.hitTimeMs ?? 0) + 800;
      renderer = createGameplayCanvas({
        canvas: ui.canvas,
        notes: chart,
        approachWindowMs: 2600
      });
      const visualGoodWindowMs = Math.round(renderer.getHitboxTimingWindowMs());
      const lessonWindows = {
        perfect: Math.max(60, Math.round(visualGoodWindowMs * 0.5)),
        good: Math.max(120, visualGoodWindowMs)
      };
      noteTrack = createNoteTrack(chart, lessonWindows);

      keyboard = createKeyboardInput({
        onKey({ key }) {
          if (finalized) return;
          ui.status.textContent = `KEY ${key.toUpperCase()}`;
          inputQueue.push({ key });
        }
      });

      loop = createGameLoop({
        update(currentSimTimeMs) {
          simTimeMs = currentSimTimeMs;

          const queue = inputQueue.splice(0, inputQueue.length);
          queue.forEach((input) => {
            processResult(
              noteTrack.resolveInput({ key: input.key, timeMs: currentSimTimeMs })
            );
          });

          noteTrack.autoMissExpired(currentSimTimeMs).forEach(processResult);

          const totalJudged =
            scoreState.hits.perfect + scoreState.hits.good + scoreState.hits.miss;
          if (currentSimTimeMs >= stageDurationMs || totalJudged >= targetNotes) {
            finalizeDrill(true);
          }
        },
        render(currentSimTimeMs) {
          renderer.render({
            simTimeMs: currentSimTimeMs,
            noteTrack,
            lastFeedback: ui.status.textContent
          });
          updateHud();
        }
      });

      ui.status.textContent = "RUNNING";
      ui.resultLine.textContent = "Drill active. Keep eyes on screen and strike cleanly.";
      loop.start();
    }

    function startDrill() {
      ctx.audio?.resume();
      stopDrill();
      finalized = false;
      simTimeMs = 0;
      scoreState = createScoreState();
      inputQueue.length = 0;
      ui.startDrill.disabled = true;
      ui.continueStage?.focus();

      const countdownValues = ["3", "2", "1"];
      countdownValues.forEach((value, index) => {
        const timerId = setTimeout(() => {
          ui.countdownOverlay.classList.remove("hidden");
          ui.countdownOverlay.textContent = value;
          ui.status.textContent = value;
          ctx.audio?.playSfx("countdownTick");
        }, index * 1000);
        countdownTimers.push(timerId);
      });

      const startTimerId = setTimeout(() => {
        ctx.audio?.playSfx("countdownGo");
        beginDrillRun();
      }, countdownValues.length * 1000);
      countdownTimers.push(startTimerId);
    }

    function onStartDrill(event) {
      event.preventDefault();
      event.stopPropagation();
      startDrill();
    }

    ui.startDrill.addEventListener("click", onStartDrill);

    container.__cleanup = () => {
      stopDrill();
      ui.startDrill.removeEventListener("click", onStartDrill);
    };
  },
  unmount(container) {
    if (container?.__cleanup) {
      container.__cleanup();
      delete container.__cleanup;
    }
  }
};
