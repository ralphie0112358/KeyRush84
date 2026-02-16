# KeyRush84 V1 Technical Architecture

## Goal
Capture the current architecture as implemented for the playable V1 prototype.

## Runtime and Tooling
- Browser runtime, vanilla JS (ES modules)
- Build/dev: Vite
- Tests: Vitest + jsdom
- Persistence: `localStorage` (`keyrush84.v1`)

## Rendering Model
- Shared fixed playfield frame (consistent background across screens)
- `Canvas` for falling-note rendering in lesson and gameplay
- `DOM` for menus, HUD text, overlays, results, and progress table

## Current Screen Model
- `menu`
- `lesson`
- `gameplay`
- `results`
- `progress`

Notes:
- Level selection is a modal in `menu`.
- Stage completion first shows an in-stage overlay, then optional dedicated results page.

## State Model (Current)
```js
{
  app: {
    screen: "menu",
    selectedLevelId: 1,
    levelPickerOpen: false
  },
  levels: {
    status: "idle|loading|loaded|error",
    error: null,
    version: null,
    levelAccess: null,
    defaults: null,
    items: []
  },
  session: {
    mode: "lesson|quick_start",
    status: "idle"
  },
  run: {
    active: false,
    lastResult: null
  },
  lesson: {
    lastDrillResult: null
  },
  progress: {
    lessonMasteryByLevel: {},
    clearedLevels: {},
    runHistoryByLevel: {}
  }
}
```

## Core Modules
- `src/core/app.js`
  - screen routing
  - keyboard activation/focus movement
  - progress hydration and persistence
- `src/core/constants.js`
  - timing/scoring constants
- `src/core/criteria.js`
  - lesson mastery and stage clear evaluators
- `src/data/levels.js`
  - `levels.v1.json` load + validation
- `src/engine/*`
  - chart building, note tracking, timing judgment, scoring, loop
- `src/render/gameplayCanvas.js`
  - draws falling notes and hit threshold
  - exposes hitbox timing window helper for lesson acceptance math
- `src/persistence/storage.js`
  - load/save progress payload
- `src/state/selectors.js`
  - selected level, progress summary, best-run lookups

## Input and Navigation
- Gameplay/Lesson typing:
  - `keydown` -> normalized key -> queue -> note judge
- UI navigation:
  - `Tab` and arrow keys move focus between enabled buttons
  - `Enter` activates focused button
- Mouse is optional; keyboard-only flow is supported.

## Note/Hit Model
- Notes have `{ id, key, hitTimeMs }`
- Multiple notes can be visible simultaneously
- Single bottom threshold for hit timing
- One keypress resolves at most one note
- Stage timing windows:
  - Perfect <= 60ms
  - Good <= 120ms
- Lesson windows are derived from visual overlap (sprite/fall-rate math).

## Lesson Flow (Current)
- Lesson is optional but recommended.
- Start/Retry launches a short practice run.
- Default lesson parameters from `levels.v1.json`:
  - `notes`: 8
  - `durationSec`: 10
  - `passAccuracy`: 0.85
  - `passStreak`: 6
- Practice uses up to two primary keys.
- After completion, focus moves to `Continue to Stage`.

## Stage Flow (Current)
- Run initializes chart and score state.
- On complete or manual finish:
  - run summary is computed
  - progress/clear status and run history are persisted
  - centered in-stage results overlay is shown
- Overlay actions:
  - replay level
  - view results page
  - back to menu

## Persistence Schema (Current)
```js
{
  schemaVersion: 1,
  progress: {
    lessonMasteryByLevel: {},
    clearedLevels: {},
    runHistoryByLevel: {}
  }
}
```

## Testing Baseline
- Unit and integration tests are active.
- Current baseline:
  - test files: 10
  - tests: 44
- Key covered modules:
  - hit judgment, scoring, note tracking, lesson drill generation
  - storage serialization/hydration
  - selectors/progress aggregations
  - app routing and keyboard controls
