import Cell from "@src/model/cell";
import {
  bgCtx,
  BG_COLOR,
  effectCtx,
  gameCtx,
  GAME_X_WIDTH,
  GAME_Y_WIDTH,
  UNIT_SIZE,
} from "@src/util/global";
import Logger from "@src/util/logger";
import { responseBlockAxis } from "@src/util/tool";
import BlockManager from "./block.manager";

export default class MapGenerator {
  // seek: number = 0;
  map: Cell[][] = [];
  mapSize: [number, number] = [0, 0];
  logger: Logger;

  constructor(x: number = GAME_X_WIDTH, y: number = GAME_Y_WIDTH) {
    this.logger = new Logger(this.constructor.name);
    this.mapSize = [x, y];
  }

  initialize(map: Cell[][]) {
    this.logger.dir("initialize").log("get created map", map);
    this.map = map;
  }

  render() {
    this.clearRect();

    bgCtx.fillStyle = BG_COLOR + "56";
    bgCtx.fillRect(0, 0, innerWidth, innerHeight);

    bgCtx.strokeStyle = "#56565626";

    for (const row of this.map) {
      for (const cell of row) {
        const [x, y] = responseBlockAxis(
          cell.x * UNIT_SIZE,
          cell.y * UNIT_SIZE
        );
        bgCtx.strokeRect(x, y, UNIT_SIZE, UNIT_SIZE);
      }
    }

    effectCtx.fillStyle = BG_COLOR;
    // top, bottom
    effectCtx.fillRect(
      0,
      0,
      innerWidth,
      (innerHeight - GAME_Y_WIDTH * UNIT_SIZE) / 2
    );
    effectCtx.fillRect(
      0,
      GAME_Y_WIDTH * UNIT_SIZE + (innerHeight - GAME_Y_WIDTH * UNIT_SIZE) / 2,
      innerWidth,
      (innerHeight - GAME_Y_WIDTH * UNIT_SIZE) / 2
    );
    // both-side
    effectCtx.fillRect(
      0,
      (innerHeight - GAME_Y_WIDTH * UNIT_SIZE) / 2,
      innerWidth / 2 - (GAME_X_WIDTH * UNIT_SIZE) / 2,
      GAME_Y_WIDTH * UNIT_SIZE
    );
    effectCtx.fillRect(
      innerWidth / 2 -
        (GAME_X_WIDTH * UNIT_SIZE) / 2 +
        GAME_X_WIDTH * UNIT_SIZE,
      (innerHeight - GAME_Y_WIDTH * UNIT_SIZE) / 2,
      innerWidth / 2 - (GAME_X_WIDTH * UNIT_SIZE) / 2,
      GAME_Y_WIDTH * UNIT_SIZE
    );

    bgCtx.strokeStyle = "black";
  }

  clearSelect() {
    this.map.flat(1).forEach((cell) => (cell.isSelected = false));
  }

  clearRect() {
    bgCtx.clearRect(0, 0, innerWidth, innerHeight);
  }
}
