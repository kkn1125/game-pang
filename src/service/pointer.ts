import Cell from "@src/model/cell";
import { wait } from "@src/util/global";
import Logger from "@src/util/logger";
import { capitalize, responsePointerAxis } from "@src/util/tool";
import BaseModule from "./base.module";
import BlockManager from "./block.manager";
import MapGenerator from "./map.generator";
import ScoreCalculator from "./score.calculator";
import { Dependency } from "./types";

//53389
export default class Pointer extends BaseModule {
  logger: Logger;
  dependency: Dependency = {};
  grab: Cell | null = null;
  swapTemp: Cell[] = [];
  gameEnd: boolean = false;

  // TODO: mode 받는 공통 상속 클래스 생성하기 2023-09-14 22:30:34
  constructor(mode: string) {
    super(mode);
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").log("initialize mode:", mode);

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
    // if (this.mode === "test") {
    //   if (wait.length === 0) {
    //     this.logger.only().dir("test").dir("clickCell").log("auto pang");
    //     wait.push(0);

    //     await this.dependency.blockManager?.autoPangAndFill(false);
    //     this.logger.debug(this.grab);

    //     wait.pop();
    //   } else {
    //     this.logger
    //       .only()
    //       .dir("test")
    //       .dir("clickCell")
    //       .error("blocked click event");
    //   }
    //   return;
    // }
    this.logger.dir("clickCell").dir("debug wait").debug("!!!!!!!!wait", wait);
    if (wait.length > 0) {
      this.logger.dir("clickCell").error("current working click event", wait);
      this.swapTemp = [];
      return;
    }

    if (this.grab) {
      this.logger.dir("clickCell").debug(this.grab);

      if (this.swapTemp.length < 2) {
        this.grab.isSelected = true;
        this.swapTemp.push(this.grab);
        this.logger.dir("clickCell").log(this.swapTemp);
        this.logger
          .dir("clickCell")
          .dir("select first cell")
          .debug(this.swapTemp[0]);

        if (this.swapTemp[0].type.match(/^(horizon)$/g)) {
          wait.push(0);
          await this.dependency.blockManager?.horizonPangAndAutoFill(
            this.swapTemp[0].x,
            this.swapTemp[0].y
          );
          this.swapTemp = [];
          wait.pop();
          return;
        }
        if (this.swapTemp[0].type.match(/^(vertical)$/g)) {
          wait.push(0);
          await this.dependency.blockManager?.verticalPangAndAutoFill(
            this.swapTemp[0].x,
            this.swapTemp[0].y
          );
          this.swapTemp = [];
          wait.pop();
          return;
        }
        if (this.swapTemp[0].type.match(/^(all)$/g)) {
          wait.push(0);
          await this.dependency.blockManager?.allPangAndAutoFill(
            this.swapTemp[0].x,
            this.swapTemp[0].y
          );
          this.swapTemp = [];
          wait.pop();
          return;
        }
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
          const isBoundary = this.dependency.blockManager.isInBoundary(
            this.swapTemp[0],
            this.swapTemp[1]
          );
          this.logger.dir("clickCell").debug("isBoundary", isBoundary);

          if (isBoundary) {
            this.dependency.scoreCalculator?.turnCount();
          }
          try {
            const isSwapped = await this.dependency.blockManager.swapBothCell(
              this.swapTemp[0],
              this.swapTemp[1]
            );

            if (!isSwapped) {
              this.logger.dir("swapBothCellAndFill").error("not swapped");
              if (isBoundary) {
                this.dependency.scoreCalculator?.divideCombo();
              }
              const first =
                this.dependency.blockManager.map?.[this.swapTemp[0]?.y]?.[
                  this.swapTemp?.[0]?.x
                ];
              const second =
                this.dependency.blockManager.map?.[this.swapTemp[1]?.y]?.[
                  this.swapTemp?.[1]?.x
                ];
              await this.dependency.blockManager.revertSwap(first, second);
              await this.dependency.blockManager.autoPangAndFill();

              // release
              wait.pop();

              this.swapTemp[0] && (this.swapTemp[0].isSelected = false);
              this.swapTemp[1] && (this.swapTemp[1].isSelected = false);

              this.swapTemp = [];

              return;
            }
          } catch (error) {
            return;
          }

          await this.dependency.blockManager.autoPangAndFill();
          this.logger.dir("clickCell").debug("release??");
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
      this.logger.dir("clickCell2").debug(this.swapTemp);
    } else {
      this.logger.dir("clickCell").debug("no grab");
    }
    this.logger
      .dir("clickCell")
      .debug("map", this.dependency.blockManager?.map);
  }

  moveMouse(e: MouseEvent) {
    const x = e.clientX;
    const y = e.clientY;
    const [resX, resY] = responsePointerAxis(x, y);
    try {
      if (this.gameEnd) {
        throw new Error("the game end");
      }
      const cell = this.getCellInfo(resX, resY);
      this.grab = cell;
      if (cell) {
        //
      }
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
