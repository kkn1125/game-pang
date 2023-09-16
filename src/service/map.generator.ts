import Cell from "@src/model/cell";
import {
  bgCtx,
  BG_COLOR,
  effectCtx,
  OPTIONS,
  RESPONSIVE_UNIT_SIZE,
  SUB_OPTIONS,
} from "@src/util/global";
import Logger from "@src/util/logger";
import { responseBlockAxis } from "@src/util/tool";
import BaseModule from "./base.moudle";

export default class MapGenerator extends BaseModule {
  // seek: number = 0;
  map: Cell[][] = [];
  mapSize: [number, number] = [0, 0];
  logger: Logger;

  constructor(
    mode: string,
    x: number = OPTIONS.WIDTH.GAME.X,
    y: number = OPTIONS.WIDTH.GAME.Y
  ) {
    super(mode);
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").log("initialize mode:", mode);
    this.mapSize = [x, y];
  }

  initialize(map: Cell[][]) {
    this.logger.dir("initialize").log("get created map", map);
    this.map = map;
  }

  render() {
    bgCtx.fillStyle = BG_COLOR + "b6";
    bgCtx.fillRect(0, 0, innerWidth, innerHeight);
    if (this.mode === "test") {

      bgCtx.strokeStyle = "#56565626";

      for (const row of this.map) {
        for (const cell of row) {
          const [x, y] = responseBlockAxis(
            cell.x * RESPONSIVE_UNIT_SIZE(),
            cell.y * RESPONSIVE_UNIT_SIZE()
          );
          bgCtx.strokeRect(
            x,
            y,
            RESPONSIVE_UNIT_SIZE(),
            RESPONSIVE_UNIT_SIZE()
          );
        }
      }

      bgCtx.strokeStyle = "black";
    }

    effectCtx.fillStyle = BG_COLOR;
    // top, bottom
    effectCtx.fillRect(
      0,
      0,
      innerWidth,
      (innerHeight - OPTIONS.WIDTH.GAME.Y * RESPONSIVE_UNIT_SIZE()) / 2
    );
    effectCtx.fillRect(
      0,
      OPTIONS.WIDTH.GAME.Y * RESPONSIVE_UNIT_SIZE() +
        (innerHeight - OPTIONS.WIDTH.GAME.Y * RESPONSIVE_UNIT_SIZE()) / 2,
      innerWidth,
      (innerHeight - OPTIONS.WIDTH.GAME.Y * RESPONSIVE_UNIT_SIZE()) / 2
    );
    // both-side
    effectCtx.fillRect(
      0,
      0,
      innerWidth / 2 - (OPTIONS.WIDTH.GAME.X * RESPONSIVE_UNIT_SIZE()) / 2,
      innerHeight
    );
    effectCtx.fillRect(
      innerWidth / 2 -
        (OPTIONS.WIDTH.GAME.X * RESPONSIVE_UNIT_SIZE()) / 2 +
        OPTIONS.WIDTH.GAME.X * RESPONSIVE_UNIT_SIZE(),
      0,
      innerWidth / 2 - (OPTIONS.WIDTH.GAME.X * RESPONSIVE_UNIT_SIZE()) / 2,
      innerHeight
    );
  }

  clearSelect() {
    this.map.flat(1).forEach((cell) => (cell.isSelected = false));
  }
}
