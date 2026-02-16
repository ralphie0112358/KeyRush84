# KeyRush84 V1 UI Flow and Wireframes

## Purpose
Document the current implemented UI flow and primary screen layouts.

## Global Layout Rules
- Shared fixed playfield frame across all screens.
- No page or panel scrollbars.
- Keyboard-first navigation:
  - `Tab` and arrow keys move between buttons.
  - `Enter` activates focused button.

## Screen Flow
1. Main Menu
2. Level Picker (modal from menu)
3. Lesson (optional)
4. Gameplay
5. In-stage Results Overlay
6. Results page (optional)
7. Progress page

## 1) Main Menu
```text
+--------------------------------------------------+
| KeyRush84                       Screen: menu     |
|                                                  |
| Current Level: Lx (Level Title)                 |
| Goal + Primary Keys                             |
| Lesson Mastered: YES/NO  Stage Cleared: YES/NO  |
|                                                  |
| [ Start Game ] [ Choose Level ] [ Progress ]     |
| [ Settings (Stub) ]                              |
+--------------------------------------------------+
```

## 2) Level Picker Modal
```text
+---------------------- Select Level --------------+
| [Close]                                          |
| [L1 MC] [L2 --] [L3 M-] ...                     |
| M = lesson mastered, C = stage cleared          |
+--------------------------------------------------+
```

## 3) Lesson
```text
+--------------------------------------------------+
| Lesson: Lx - Title                               |
| Goal / Expected / Primary keys / Pattern preview |
|                                                  |
| Notes x/y  Acc z%  Streak n  Best b  Time t      |
| [ falling lesson field ]                         |
| Pass target: Accuracy >= 85%, Streak >= 6        |
| Status + result line                             |
|                                                  |
| [ Start/Retry/Practice ] [ Continue to Stage ]   |
| [ Skip Lesson ] [ Back to Menu ]                 |
+--------------------------------------------------+
```

Notes:
- While lesson is running, start button is hidden/disabled.
- On lesson completion, focus moves to `Continue to Stage`.

## 4) Gameplay
```text
+--------------------------------------------------+
| Gameplay: Lx - Title                             |
| Score / Combo / xMult / Acc / WPM / Time         |
| [ falling stage field + hit threshold ]          |
| Feedback + primary keys                          |
| [ Finish Run ] [ Abort to Menu ]                 |
+--------------------------------------------------+
```

## 5) In-stage Results Overlay
```text
              (centered stats text on playfield)
              Stage Complete/Ended
              Clear status
              Score / Acc / WPM / Max Combo
              [Replay Level] [Choose Level] [View Progress]
```

## 6) Results Page
- Dedicated page still exists as a fallback/debug route, but normal flow stays on playfield after stage end.

## 7) Progress Page
- Summary cards:
  - lessons mastered / total levels
  - stages cleared / total levels
  - total runs
- Latest run snapshot
- Per-level table:
  - lesson mastered
  - stage cleared
  - best score
  - best accuracy
  - best WPM
