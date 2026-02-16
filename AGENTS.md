# AGENTS.md

## Purpose
This file gives coding agents a single source of truth for running and validating tests in this repository.

## Prerequisites
- Node.js 20+
- npm 10+

## Install Dependencies
Run once after cloning or after dependency changes:

```bash
npm install
```

## Test Commands
- Run full test suite once:

```bash
npm test
```

- Run tests in watch mode:

```bash
npm run test:watch
```

- Run tests with coverage:

```bash
npm run coverage
```

## Run App Locally
- Start dev server:

```bash
npm run dev
```

- Build production files:

```bash
npm run build
```

- Preview production build locally:

```bash
npm run preview
```

## Expected Baseline (Current)
- Test files: `10`
- Tests: `44`
- Command should exit with code `0`

## Interaction Notes
- Keyboard-first controls are required:
  - `Tab` and arrow keys move between enabled buttons.
  - `Enter` activates focused button.
- Avoid introducing any screen that requires mouse-only interaction.
- Do not introduce page or panel scrollbars; fit content inside the fixed playfield.

## Troubleshooting
- If coverage fails with missing provider:
  - Ensure `@vitest/coverage-v8` is installed in `devDependencies`
  - Re-run `npm install`
- If npm install fails due permissions on global npm cache/log path:
  - Use a local cache:

```bash
npm_config_cache=./.npm-cache npm install
```

## Agent Rule
Before marking a test-related task complete:
1. Run `npm test`
2. If logic changed, run `npm run coverage`
3. Report pass/fail counts and any uncovered critical logic
