import "reflect-metadata";
import Quest from "./model/quest";
import GameCore from "./service/game.core";
import { MODE, RUN_MODE, STORE_NAME } from "./util/global";

// console.log("LOG_BLOCK");
// LOG_BLOCK.push(1);

const gameCore = new GameCore();

gameCore.setOption("dev", MODE);
gameCore.setOption("runMode", RUN_MODE);
gameCore.setOption("storeName", STORE_NAME);

gameCore.initialize();
gameCore.autoQuests();
gameCore.render();
