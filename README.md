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
- Test files: `10`
- Tests: `44`

## GitHub Pages (Later)
This project is set up to be deployable to GitHub Pages.

For a repo page like `https://<user>.github.io/keyrush84/`, build with:

```bash
GH_PAGES_BASE=/keyrush84/ npm run build
```

Output is generated in:

```text
dist/
```

Then publish the generated `dist/` folder using GitHub Pages.

Publish options:
1. GitHub Actions workflow that builds and deploys `dist/` to Pages.
2. Manual deploy by pushing `dist/` contents to a Pages branch.

Notes:
1. Keep `vite.config.js` base configurable through `GH_PAGES_BASE`.
2. If repository name changes, update base path accordingly.
