import "reflect-metadata";
import GameCore from "./service/game.core";

const gameCore = new GameCore();

gameCore.setOption("dev", true);
gameCore.initialize();
gameCore.render();
