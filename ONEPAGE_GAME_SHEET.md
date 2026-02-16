# KeyRush84: One-Page Game Sheet

## Game Concept
An 80s retro, Guitar Hero-inspired typing game where players hit scrolling key-notes in rhythm to build touch-typing speed and accuracy. Every level starts with a short guided lesson on finger placement and expected keys.

## Player Promise
"Get better at touch typing while playing an arcade rhythm game that feels fast, stylish, and rewarding."

## Target Player
- Beginner to intermediate typists
- People who dislike traditional typing drills
- Short-session players (2-10 minutes)

## Core Loop
1. Start level
2. Optional pre-level lesson (keys, fingers, posture, mini drill) or quick start
3. Play rhythm typing chart (scrolling notes to hit zone)
4. Build combo/multiplier, avoid misses
5. Finish with performance summary + weak-key feedback
6. Jump to any level / replay for mastery

## Level Structure
- `Lesson` (recommended, skippable):
  - Keys introduced
  - Hand posture + finger map
  - Short mini-lesson practice
  - Mastery target: >=85% accuracy + minimum streak
- `Main Stage`: 60-120s chart using target keys + small review set
- `In-Stage Overlay + Results`: immediate centered overlay, plus dedicated results page

## Typing Curriculum (V1)
1. F/J
2. D/K
3. S/L
4. A/;
5. Home Row Mix
6. E/I
7. R/U
8. W/O
9. Q/P
10. Top+Home Mix

## Scoring and Feedback
- `Hit ratings`: Perfect / Good / Miss (timing window)
- `Score`: base points x combo multiplier
- `Learning stats`: per-key accuracy, confusion pairs, posture prompts
- `Fail state`: optional (health bar) or keep casual mode by default

## Visual and Audio Direction
- Neon synthwave palette, CRT glow, horizon grid
- Bold arcade typography and clear hit-line readability
- Distinct SFX for perfect/good/miss
- Optional retro backing track with mute toggle

## MVP Scope (Build First)
- Single song/session style gameplay loop
- 10-level curriculum with optional lesson
- Keyboard input timing + combo scoring
- In-stage results overlay + results screen
- Local progress save (browser localStorage)

## Out of Scope (Later)
- Online leaderboards
- Custom songs
- Multiplayer
- Account sync
- Personal bests (per level, WPM, accuracy, streak, score)

## Success Metrics (V1)
- 80%+ of players pass Level 1 lesson in <=3 attempts
- Session completion rate >60%
- Repeat play rate (same day) >30%
- Measurable per-key accuracy improvement over 3 runs

## Build Milestones
1. Lesson system + level data schema
2. Core note highway + hit detection
3. Scoring/combo/results pipeline
4. Retro UI polish + SFX + balancing
5. Playtest + tune timing windows and progression
