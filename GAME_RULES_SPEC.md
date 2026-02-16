# KeyRush84 V1 Game Rules Spec

## Purpose
Define current gameplay behavior for the implemented V1 prototype.

## Session Structure
1. Menu (select level or start)
2. Optional Lesson
3. Stage Gameplay
4. In-stage results overlay
5. Dedicated Results page (optional follow-up)
6. Progress view

## Input and Hit Timing
- Notes fall toward a single bottom hit threshold.
- Multiple notes may be visible simultaneously.
- One keypress resolves at most one note.
- Wrong key near a hittable note is a miss.
- Unresolved notes that pass miss window become auto misses.

## Stage Timing Windows
- `Perfect`: <= 60ms
- `Good`: <= 120ms
- `Miss`: > 120ms or wrong key

## Lesson Timing Windows
- Lesson hit windows are derived from visual overlap math:
  - Based on sprite height and fall speed
  - `Good` accepts overlap with the hit line
  - `Perfect` is a tighter subset of `Good`

## Scoring
- Base points:
  - `Perfect`: 100
  - `Good`: 70
  - `Miss`: 0
- Combo increases on hit, resets on miss.
- Multiplier:
  - `x1`: combo 0-9
  - `x2`: combo 10-24
  - `x3`: combo 25-49
  - `x4`: combo 50+

## Lesson Rules
- Lesson is optional; player may proceed to stage.
- Current default lesson practice targets:
  - `notes`: 8
  - `durationSec`: 10
  - `passAccuracy`: 85%
  - `passStreak`: 6
- Lesson practice uses at most two primary keys for focused repetition.
- On pass, lesson mastery for level is persisted.

## Stage Completion and Clear Criteria
- Stage runs until duration completes or user presses `Finish Run`.
- At stage end, a centered in-stage overlay appears with summary stats.
- Clear criteria:
  - Accuracy >= 80%
  - Max streak >= 15
  - Target-key hit rate >= 70%

## Results and Progress
- Results stored per run:
  - score, accuracy, WPM, max combo, hit counts, clear status
- In-stage overlay includes replay/menu/results navigation.
- Dedicated Results page shows last run details.
- Progress persists in `localStorage`:
  - lesson mastery by level
  - stage clear by level
  - run history by level (capped list)

## Level Access Rules
- All levels are directly selectable from menu level picker.
- No lock gating in V1.

## Non-Goals for V1
- Chords (multi-key simultaneous hit)
- Hold notes
- Song/BPM sync to external tracks
- Multiplayer and online leaderboards
