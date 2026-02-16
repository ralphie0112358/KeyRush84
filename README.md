# KeyRush84

An 80s retro, Guitar Hero-inspired typing game for learning touch typing through rhythm gameplay.

This was coded 100% with CODEX ChatGPT 5.3

## Current Status
Prototype is playable and includes:
- Shared fixed playfield across screens (no scrollbars)
- Menu with level picker modal
- Lesson screen with interactive mini-lesson practice
- Gameplay with falling notes, scoring, and centered in-stage result overlay
- Dedicated Results page and real Progress page
- Progress persistence in `localStorage`
- Unit tests and coverage setup

## Local Setup
```bash
npm install
```

## Run Locally
```bash
npm run dev
```

## Tests
- Run tests once:
```bash
npm test
```

- Run test coverage:
```bash
npm run coverage
```

Current baseline:
- Test files: `12`
- Tests: `51`

## GitHub Pages (Auto Deploy from `master`)
A GitHub Actions workflow is included at:

```text
.github/workflows/deploy-pages.yml
```

It runs on pushes to `master` and deploys `dist/` to GitHub Pages.

In your repo settings:
1. Go to `Settings` -> `Pages`.
2. Set `Source` to `GitHub Actions`.

The workflow automatically sets the Vite base path to:

```text
/<repository-name>/
```

Notes:
1. `vite.config.js` uses `GH_PAGES_BASE` at build time.
2. If your default branch changes from `master`, update the workflow trigger.
