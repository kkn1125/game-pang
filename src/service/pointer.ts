import Cell from "@src/model/cell";
import {
  effectCtx,
  GAME_X_WIDTH,
  GAME_Y_WIDTH,
  UNIT_SIZE,
} from "@src/util/global";
import Logger from "@src/util/logger";
import { capitalize, responsePointerAxis } from "@src/util/tool";
import BlockManager from "./block.manager";
import MapGenerator from "./map.generator";
import ScoreCalculator from "./score.calculator";

type Dependency = {
  ["mapGenerator"]?: MapGenerator;
  ["scoreCalculator"]?: ScoreCalculator;
  ["blockManager"]?: BlockManager;
};

export default class Pointer {
  logger: Logger;
  dependency: Dependency = {};
  grab: Cell | null = null;
  swapTemp: Cell[] = [];

  constructor() {
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").log("initialize");

    window.addEventListener("mousemove", this.moveMouse.bind(this));
    window.addEventListener("mousedown", this.clickCell.bind(this));
  }

  inject(module: MapGenerator | ScoreCalculator | BlockManager) {
    this.logger
      .dir("inject")
      .debug(`${capitalize(module.constructor.name)} is injected`);
    this.dependency[capitalize(module.constructor.name)] = module;
  }

  async clickCell() {
    if (this.grab) {
      this.logger.debug(this.grab);

      if (this.swapTemp.length < 2) {
        this.grab.isSelected = true;
        this.swapTemp.push(this.grab);
      }
      if (this.swapTemp.length === 2) {
        await this.swapTemp[0].swap(this.swapTemp[1]);
        if (this.dependency.mapGenerator) {
          this.dependency.mapGenerator.map[this.swapTemp[1].y][
            this.swapTemp[1].x
          ] = Cell.copy(this.swapTemp[0], this.swapTemp[1]);
          this.dependency.mapGenerator.map[this.swapTemp[0].y][
            this.swapTemp[0].x
          ] = Cell.copy(this.swapTemp[1], this.swapTemp[0]);
        }
        this.logger.dir("clickCell").log(this.swapTemp);
        this.swapTemp[0].isSelected = false;
        this.swapTemp[1].isSelected = false;
        this.swapTemp = [];
      }
    } else {
      this.logger.debug("no grab");
    }
  }

  moveMouse(e: MouseEvent) {
    const x = e.clientX;
    const y = e.clientY;

    const [resX, resY] = responsePointerAxis(x, y);

    try {
      const cell = this.getCellInfo(resX, resY);
      this.grab = cell;
      if (!cell.isHover) {
        cell.isHover = true;
      }
    } catch (error) {
      this.grab = null;
    }
  }

  getCellInfo(x: number, y: number): never | Cell {
    if (this.dependency.mapGenerator) {
      const cell = this.dependency.mapGenerator.map?.[y]?.[x];
      if (cell) {
        return cell;
      }
      throw new Error("not found cell");
    }
    throw new Error("no injected module");
  }
}
