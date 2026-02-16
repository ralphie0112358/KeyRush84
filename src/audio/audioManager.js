function clamp01(value, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

const SFX = {
  uiMove: { freq: 420, durationMs: 60, type: "square", gain: 0.12 },
  uiConfirm: { freq: 620, durationMs: 90, type: "triangle", gain: 0.14 },
  uiBack: { freq: 260, durationMs: 90, type: "sine", gain: 0.12 },
  countdownTick: { freq: 520, durationMs: 120, type: "square", gain: 0.14 },
  countdownGo: { freq: 760, durationMs: 180, type: "triangle", gain: 0.18 },
  hitPerfect: { freq: 900, durationMs: 90, type: "square", gain: 0.16 },
  hitGood: { freq: 720, durationMs: 90, type: "triangle", gain: 0.14 },
  hitMiss: { freq: 180, durationMs: 120, type: "sawtooth", gain: 0.14 },
  lessonPass: { freq: 820, durationMs: 180, type: "triangle", gain: 0.18 },
  lessonFail: { freq: 210, durationMs: 220, type: "sawtooth", gain: 0.16 },
  stagePass: { freq: 900, durationMs: 240, type: "triangle", gain: 0.2 },
  stageFail: { freq: 170, durationMs: 260, type: "sawtooth", gain: 0.18 }
};

const MUSIC_PATTERNS = {
  home: {
    stepMs: 360,
    notes: [220, 277, 330, 277, 246, 330, 392, 330],
    type: "triangle",
    gain: 0.08
  },
  play: {
    stepMs: 250,
    notes: [196, 220, 247, 220, 196, 247, 294, 330],
    type: "sawtooth",
    gain: 0.1
  }
};

export function createAudioManager() {
  const AudioCtx =
    typeof window !== "undefined"
      ? window.AudioContext || window.webkitAudioContext
      : null;

  let audioCtx = null;
  let currentMusic = null;
  let musicTimerId = null;
  let musicStepIndex = 0;
  let settings = {
    muted: false,
    sfxVolume: 0.7,
    musicVolume: 0.5
  };

  function ensureCtx() {
    if (!AudioCtx) return null;
    if (!audioCtx) {
      try {
        audioCtx = new AudioCtx();
      } catch {
        audioCtx = null;
      }
    }
    return audioCtx;
  }

  async function resume() {
    const ctx = ensureCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // Ignore browser autoplay restrictions until next user gesture.
      }
    }
  }

  function configure(nextSettings = {}) {
    settings = {
      muted: Boolean(nextSettings.muted ?? settings.muted),
      sfxVolume: clamp01(nextSettings.sfxVolume, settings.sfxVolume),
      musicVolume: clamp01(nextSettings.musicVolume, settings.musicVolume)
    };
  }

  function playSfx(name) {
    const config = SFX[name];
    if (!config || settings.muted) return;
    const ctx = ensureCtx();
    if (!ctx || ctx.state !== "running") return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const gainValue = config.gain * settings.sfxVolume;
    const durationSec = config.durationMs / 1000;

    osc.type = config.type;
    osc.frequency.setValueAtTime(config.freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainValue, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  function stopMusic() {
    currentMusic = null;
    musicStepIndex = 0;
    if (musicTimerId !== null) {
      clearInterval(musicTimerId);
      musicTimerId = null;
    }
  }

  function playMusic(trackName) {
    if (!trackName || !MUSIC_PATTERNS[trackName]) {
      stopMusic();
      return;
    }
    if (currentMusic === trackName && musicTimerId !== null) return;
    stopMusic();
    currentMusic = trackName;

    const ctx = ensureCtx();
    if (!ctx || settings.muted) return;

    const pattern = MUSIC_PATTERNS[trackName];
    musicTimerId = setInterval(() => {
      if (!audioCtx || audioCtx.state !== "running" || settings.muted) return;
      const freq = pattern.notes[musicStepIndex % pattern.notes.length];
      musicStepIndex += 1;

      const now = audioCtx.currentTime;
      const durationSec = pattern.stepMs / 1000;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const gainValue = pattern.gain * settings.musicVolume;

      osc.type = pattern.type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(gainValue, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + durationSec + 0.03);
    }, pattern.stepMs);
  }

  return {
    configure,
    resume,
    playSfx,
    playMusic,
    stopMusic
  };
}
