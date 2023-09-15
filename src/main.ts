import "reflect-metadata";
import GameCore from "./service/game.core";
import { LOG_BLOCK, MODE, RUN_MODE } from "./util/global";

// console.log("LOG_BLOCK");
// LOG_BLOCK.push(1);

const gameCore = new GameCore();

gameCore.setOption("dev", MODE);
gameCore.setOption("runMode", RUN_MODE);

gameCore.initialize();
gameCore.render();
