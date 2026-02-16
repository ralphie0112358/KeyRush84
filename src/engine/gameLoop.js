import { GAMEPLAY } from "../core/constants.js";

export function createGameLoop({
  stepMs = GAMEPLAY.fixedStepMs,
  update,
  render
}) {
  let running = false;
  let rafId = null;
  let previousTime = 0;
  let accumulator = 0;
  let simTimeMs = 0;

  function frame(nowMs) {
    if (!running) return;

    if (previousTime === 0) previousTime = nowMs;
    const delta = Math.min(100, nowMs - previousTime);
    previousTime = nowMs;
    accumulator += delta;

    while (accumulator >= stepMs) {
      simTimeMs += stepMs;
      update(simTimeMs, stepMs);
      if (!running) return;
      accumulator -= stepMs;
    }

    if (!running) return;
    render(simTimeMs);
    if (!running) return;
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    previousTime = 0;
    accumulator = 0;
    simTimeMs = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  return { start, stop };
}
