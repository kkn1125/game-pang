import Cell from "@src/model/cell";
import {
  effectCtx,
  GAME_X_WIDTH,
  GAME_Y_WIDTH,
  UNIT_SIZE,
  wait,
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
    // this.logger.debug(this.grab);
    if (wait.length > 0) {
      this.logger.dir("clickCell").error("current working click event", wait);
      this.swapTemp = [];
      return;
    }

    if (this.grab) {
      this.logger.debug(this.grab);

      if (this.swapTemp.length < 2) {
        this.grab.isSelected = true;
        this.logger.dir("clickCell").log(this.swapTemp);
        this.logger
          .dir("clickCell")
          .dir("select first cell")
          .debug(this.swapTemp[0]);
        this.swapTemp.push(this.grab);
      }
      if (this.swapTemp.length === 2) {
        this.logger.dir("clickCell").log(this.swapTemp);
        this.logger.dir("clickCell").log("this.swapTemp length", 2);
        if (
          this.dependency.blockManager &&
          this.swapTemp[0] !== this.swapTemp[1] &&
          wait.length === 0
        ) {
          this.logger
            .dir("clickCell")
            .dir("select second cell")
            .debug(this.grab);

          // commit
          wait.push(0);
          this.logger.dir("clickCell").log("swap both run");
          const isSwapped = await this.dependency.blockManager.swapBothCell(
            this.swapTemp[0],
            this.swapTemp[1]
          );

          if (!isSwapped) {
            this.logger.dir("swapBothCellAndFill").error("not swapped");
            // console.log(this.swapTemp);
            const first =
              this.dependency.blockManager.map[this.swapTemp[0].y][
                this.swapTemp[0].x
              ];
            const second =
              this.dependency.blockManager.map[this.swapTemp[1].y][
                this.swapTemp[1].x
              ];
            await this.dependency.blockManager.revertSwap(first, second);

            // release
            wait.pop();

            this.swapTemp[0] && (this.swapTemp[0].isSelected = false);
            this.swapTemp[1] && (this.swapTemp[1].isSelected = false);

            this.swapTemp = [];

            return;
          }

          await this.dependency.blockManager.autoPangAndFill();
          // release
          wait.pop();

          this.swapTemp[0] && (this.swapTemp[0].isSelected = false);
          this.swapTemp[1] && (this.swapTemp[1].isSelected = false);
          this.logger.dir("clickCell").log("swap both end");
        }

        this.logger.dir("clickCell").log(this.swapTemp);
        this.swapTemp[0] && (this.swapTemp[0].isSelected = false);
        this.swapTemp[1] && (this.swapTemp[1].isSelected = false);
        this.swapTemp = [];
        this.logger.dir("clickCell").log(this.swapTemp);
      }
      this.logger.dir("clickCell").debug(this.swapTemp);
    } else {
      this.logger.dir("clickCell").debug("no grab");
    }
  }

  moveMouse(e: MouseEvent) {
    const x = e.clientX;
    const y = e.clientY;
    const [resX, resY] = responsePointerAxis(x, y);
    try {
      const cell = this.getCellInfo(resX, resY);
      this.grab = cell;
      if (!this.grab.isHover) {
        this.grab.isHover = true;
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
