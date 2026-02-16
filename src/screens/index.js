import { menuScreen } from "./menuScreen.js";
import { levelSelectScreen } from "./levelSelectScreen.js";
import { lessonScreen } from "./lessonScreen.js";
import { gameplayScreen } from "./gameplayScreen.js";
import { resultsScreen } from "./resultsScreen.js";
import { progressScreen } from "./progressScreen.js";
import { settingsScreen } from "./settingsScreen.js";

export const screens = {
  menu: menuScreen,
  levelSelect: levelSelectScreen,
  lesson: lessonScreen,
  gameplay: gameplayScreen,
  results: resultsScreen,
  progress: progressScreen,
  settings: settingsScreen
};
