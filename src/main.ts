import "reflect-metadata";
import GameCore from "./service/game.core";

const gameCore = new GameCore();

gameCore.initialize();
gameCore.render();
