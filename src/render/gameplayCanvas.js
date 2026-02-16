export function createGameplayCanvas({
  canvas,
  notes = [],
  approachWindowMs = 2000,
  noteHeightPx = 22,
  spawnY = 30
}) {
  let ctx = null;
  const isJsdom =
    typeof window !== "undefined" &&
    typeof window.navigator?.userAgent === "string" &&
    window.navigator.userAgent.toLowerCase().includes("jsdom");

  if (!isJsdom) {
    try {
      ctx = canvas.getContext("2d");
    } catch (error) {
      ctx = null;
    }
  }
  const width = canvas.width;
  const height = canvas.height;
  const hitLineY = height - 56;
  const travelDistancePx = hitLineY - spawnY;
  const pixelsPerMs = travelDistancePx / approachWindowMs;
  const staggerSlots = Math.max(4, Math.min(8, notes.length > 0 ? 6 : 4));
  const contentWidth = width - 80;
  const slotWidth = contentWidth / staggerSlots;

  function noteX(noteId) {
    const slot = (noteId - 1) % staggerSlots;
    return 40 + slotWidth * slot + slotWidth / 2;
  }

  function drawBackground() {
    ctx.fillStyle = "#081225";
    ctx.fillRect(0, 0, width, height);
  }

  function drawNotes(noteTrack, simTimeMs) {
    noteTrack.getNotes().forEach((note) => {
      if (note.resolved) return;
      const y = hitLineY - (note.hitTimeMs - simTimeMs) * pixelsPerMs;
      if (y < -20 || y > height + 20) return;

      const x = noteX(note.id);
      const noteWidth = Math.max(30, slotWidth * 0.72);
      const noteHeight = noteHeightPx;

      ctx.fillStyle = "rgba(40, 215, 255, 0.92)";
      ctx.fillRect(x - noteWidth / 2, y - noteHeight / 2, noteWidth, noteHeight);

      ctx.strokeStyle = "rgba(189, 255, 77, 0.95)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        x - noteWidth / 2,
        y - noteHeight / 2,
        noteWidth,
        noteHeight
      );

      ctx.fillStyle = "#041122";
      ctx.font = "bold 14px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(note.key.toUpperCase(), x, y + 1);
    });
  }

  function drawFeedback(lastFeedback) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 18px Trebuchet MS";
    ctx.textAlign = "left";
    ctx.fillText(lastFeedback, 12, 26);
  }

  function drawCenteredSummary(summary) {
    if (!ctx) return;

    drawBackground();
    ctx.fillStyle = "rgba(8, 18, 37, 0.70)";
    ctx.fillRect(0, 0, width, height);

    const lines = [
      summary.completed ? "STAGE COMPLETE" : "STAGE ENDED",
      `Clear: ${summary.cleared ? "PASSED" : "NOT PASSED"}`,
      `Score: ${summary.score}`,
      `Accuracy: ${summary.accuracy}%`,
      `WPM: ${summary.wpm}`,
      `Max Combo: ${summary.maxCombo}`
    ];

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(214, 241, 255, 0.96)";
    ctx.font = "bold 26px Trebuchet MS";
    ctx.fillText(lines[0], width / 2, height / 2 - 88);

    ctx.font = "bold 18px Trebuchet MS";
    lines.slice(1).forEach((line, index) => {
      ctx.fillText(line, width / 2, height / 2 - 40 + index * 30);
    });
  }

  function render({ simTimeMs, noteTrack, lastFeedback }) {
    if (!ctx) return;
    drawBackground();
    drawNotes(noteTrack, simTimeMs);
    drawFeedback(lastFeedback);
  }

  function drawIdleFrame(lastFeedback = "READY") {
    if (!ctx) return;
    drawBackground();
    drawFeedback(lastFeedback);
  }

  function getHitboxTimingWindowMs() {
    if (!pixelsPerMs || pixelsPerMs <= 0) return 120;
    return (noteHeightPx / 2) / pixelsPerMs;
  }

  return { render, drawIdleFrame, drawCenteredSummary, getHitboxTimingWindowMs };
}
