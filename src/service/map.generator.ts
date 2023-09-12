import Cell from "@src/model/cell";
import {
  bgCtx,
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

  // animation(time: number) {

  // }
  // clearRect() {
  //   gameCtx.clearRect(0, 0, innerWidth, innerHeight);
  // }
  render() {
    this.clearRect();
    // if (this.seek !== Math.floor(time)) {
    //   // timer zone
    //   this.renderPerSecond.call(this);
    // }
    // const [x, y] = this.mapSize;

    // const centerX = innerWidth / 2;
    // const centerY = innerHeight / 2;
    // const horizonValue = x * UNIT_SIZE;
    // const verticalValue = y * UNIT_SIZE;
    // const halfHorizon = horizonValue / 2;
    // const halfVertical = verticalValue / 2;

    bgCtx.strokeStyle = "#56565656";
    for (const row of this.map) {
      for (const cell of row) {
        const [x, y] = responseBlockAxis(
          cell.x * UNIT_SIZE,
          cell.y * UNIT_SIZE
        );
        bgCtx.strokeRect(x, y, UNIT_SIZE, UNIT_SIZE);
      }
    }

    bgCtx.strokeStyle = "black";
  }

  clearSelect() {
    this.map.flat(1).forEach((cell) => (cell.isSelected = false));
  }

  clearRect() {
    bgCtx.clearRect(0, 0, innerWidth, innerHeight);
  }
}
