import Cell, { Direciton } from "@src/model/cell";
import { gameCtx, GAME_X_WIDTH, GAME_Y_WIDTH } from "@src/util/global";
import Logger from "@src/util/logger";
import ScoreCalculator from "./score.calculator";

type BlockSize = {
  x: number;
  y: number;
};
type BlockTypeNScore = [string, number];
type Axis = [number, number];

export default class BlockManager {
  types: BlockTypeNScore[] = [
    ["dog", 1],
    ["cat", 2],
    ["duck", 3],
    ["mouse", 4],
    ["lion", 5],
  ];
  logger: Logger;
  blockSize: BlockSize = { x: 50, y: 50 };
  map: Cell[][] = [];
  scoreCalculator: ScoreCalculator;

  constructor(scoreCalculator: ScoreCalculator) {
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").log("initialize");
    this.scoreCalculator = scoreCalculator;
  }

  scoreUp(score: number) {
    this.scoreCalculator.scoreUp(score);
  }

  initialize() {
    const map = this.createMap([GAME_X_WIDTH, GAME_Y_WIDTH]);
    this.logger.dir("initialize").log("created map", map);
    this.map = map;
    return map;
  }

  getRandomCellType() {
    const randomTypeIndex = Math.floor(Math.random() * this.types.length);
    return this.types[randomTypeIndex];
  }

  createMap([xSize, ySize]: Axis) {
    const maps: Cell[][] = [];
    for (let y = 0; y < ySize; y++) {
      const cells: Cell[] = [];
      for (let x = 0; x < xSize; x++) {
        const [type, score] = this.getRandomCellType();
        cells.push(new Cell(type, x, y, score));
      }
      maps.push(cells);
    }
    return maps;
  }

  isInBoundary(srcCell: Cell, dstCell: Cell) {
    const srcX = srcCell.x;
    const srcY = srcCell.y;

    // 상
    const topCell = this.map?.[srcY - 1]?.[srcX];
    // 하
    const bottomCell = this.map?.[srcY + 1]?.[srcX];
    // 좌
    const leftCell = this.map?.[srcY]?.[srcX - 1];
    // 우
    const rightCell = this.map?.[srcY]?.[srcX + 1];

    const isIn =
      topCell === dstCell ||
      bottomCell === dstCell ||
      leftCell === dstCell ||
      rightCell === dstCell;

    this.logger.dir("swapBothCell").dir("isInBoundary").debug(isIn);

    return isIn;
  }

  inLinePang(srcCell: Cell, dstCell: Cell, direction: Direciton) {
    this.logger
      .dir("inLinePang")
      .debug("validating pangable line by dst cell.");

    const horizonPangList: Cell[] = [];
    const verticalPangList: Cell[] = [];

    if (direction === "left") {
      // src
      const upSrcLinePang = this.upLinePang(srcCell);
      const downSrcLinePang = this.downLinePang(srcCell);
      const leftSrcLinePang = this.leftLinePang(srcCell);

      // dst
      const upDstLinePang = this.upLinePang(dstCell);
      const downDstLinePang = this.downLinePang(dstCell);
      const rightDstLinePang = this.rightLinePang(dstCell);

      // collect
      const concatSrcUpDown = [
        ...new Set([...upSrcLinePang, ...downSrcLinePang]),
      ];
      const concatDstUpDown = [
        ...new Set([...upDstLinePang, ...downDstLinePang]),
      ];
      const concatSrcLeft = [...new Set(leftSrcLinePang)];
      const concatDstRight = [...new Set(rightDstLinePang)];

      // collect more than 2 animal
      if (concatSrcUpDown.length > 2) {
        verticalPangList.push(...concatSrcUpDown);
      }
      if (concatDstUpDown.length > 2) {
        verticalPangList.push(...concatDstUpDown);
      }

      if (concatSrcLeft.length > 2) {
        horizonPangList.push(...concatSrcLeft);
      }
      if (concatDstRight.length > 2) {
        horizonPangList.push(...concatDstRight);
      }
    } else if (direction === "right") {
      // dst
      const upDstLinePang = this.upLinePang(dstCell);
      const downDstLinePang = this.downLinePang(dstCell);
      const leftDstLinePang = this.leftLinePang(dstCell);

      // src
      const upSrcLinePang = this.upLinePang(srcCell);
      const downSrcLinePang = this.downLinePang(srcCell);
      const rightSrcLinePang = this.rightLinePang(srcCell);

      // collect
      const concatSrcUpDown = [
        ...new Set([...upSrcLinePang, ...downSrcLinePang]),
      ];
      const concatDstUpDown = [
        ...new Set([...upDstLinePang, ...downDstLinePang]),
      ];
      const concatDstLeft = [...new Set(leftDstLinePang)];
      const concatSrcRight = [...new Set(rightSrcLinePang)];

      // collect more than 2 animal
      if (concatSrcUpDown.length > 2) {
        verticalPangList.push(...concatSrcUpDown);
      }
      if (concatDstUpDown.length > 2) {
        verticalPangList.push(...concatDstUpDown);
      }

      if (concatDstLeft.length > 2) {
        horizonPangList.push(...concatDstLeft);
      }
      if (concatSrcRight.length > 2) {
        horizonPangList.push(...concatSrcRight);
      }
    } else if (direction === "up") {
      // src
      const upSrcLinePang = this.upLinePang(srcCell);
      const leftSrcLinePang = this.leftLinePang(srcCell);
      const rightSrcLinePang = this.rightLinePang(srcCell);

      // dst
      const downDstLinePang = this.downLinePang(dstCell);
      const leftDstLinePang = this.leftLinePang(dstCell);
      const rightDstLinePang = this.rightLinePang(dstCell);

      // collect
      const concatSrcLeftRight = [
        ...new Set([...leftSrcLinePang, ...rightSrcLinePang]),
      ];
      const concatDstLeftRight = [
        ...new Set([...leftDstLinePang, ...rightDstLinePang]),
      ];
      const concatSrcUp = [...new Set(upSrcLinePang)];
      const concatDstDown = [...new Set(downDstLinePang)];

      // collect more than 2 animal
      if (concatSrcLeftRight.length > 2) {
        verticalPangList.push(...concatSrcLeftRight);
      }
      if (concatDstLeftRight.length > 2) {
        verticalPangList.push(...concatDstLeftRight);
      }

      if (concatSrcUp.length > 2) {
        horizonPangList.push(...concatSrcUp);
      }
      if (concatDstDown.length > 2) {
        horizonPangList.push(...concatDstDown);
      }
    } else if (direction === "down") {
      // dst
      const upDstLinePang = this.upLinePang(dstCell);
      const leftDstLinePang = this.leftLinePang(dstCell);
      const rightDstLinePang = this.rightLinePang(dstCell);

      // src
      const downSrcLinePang = this.downLinePang(srcCell);
      const leftSrcLinePang = this.leftLinePang(srcCell);
      const rightSrcLinePang = this.rightLinePang(srcCell);

      // collect
      const concatDstLeftRight = [
        ...new Set([...leftDstLinePang, ...rightDstLinePang]),
      ];
      const concatSrcLeftRight = [
        ...new Set([...leftSrcLinePang, ...rightSrcLinePang]),
      ];
      const concatDstUp = [...new Set(upDstLinePang)];
      const concatSrcDown = [...new Set(downSrcLinePang)];

      // collect more than 2 animal
      if (concatSrcLeftRight.length > 2) {
        verticalPangList.push(...concatSrcLeftRight);
      }
      if (concatDstLeftRight.length > 2) {
        verticalPangList.push(...concatDstLeftRight);
      }

      if (concatDstUp.length > 2) {
        horizonPangList.push(...concatDstUp);
      }
      if (concatSrcDown.length > 2) {
        horizonPangList.push(...concatSrcDown);
      }
    }

    this.logger
      .dir("inLinePang")
      .dir("collected pang list")
      .debug(horizonPangList, verticalPangList);

    return [horizonPangList, verticalPangList];
  }

  upLinePang(targetCell: Cell) {
    const targetX = targetCell.x;
    const targetY = targetCell.y;
    const temp: Cell[] = [targetCell];
    for (let y = targetY - 1; y >= 0; y--) {
      const cell = this.map[y][targetX];
      if (cell.type === targetCell.type) {
        temp.push(this.map[y][targetX]);
        this.logger.dir("upLinePang").debug("cell count", y);
        continue;
      }
      this.logger.dir("upLinePang").error("cell is not matched type", cell);
      break;
    }
    this.logger.dir("upLinePang").log("pang list", temp);
    return temp;
  }

  downLinePang(targetCell: Cell) {
    const targetX = targetCell.x;
    const targetY = targetCell.y;
    const temp: Cell[] = [targetCell];
    for (let y = targetY + 1; y < GAME_Y_WIDTH; y++) {
      this.logger.dir("downLinePang").log(y, targetX);
      const cell = this.map[y][targetX];
      this.logger.dir("downLinePang").log(cell);
      if (cell.type === targetCell.type) {
        temp.push(this.map[y][targetX]);
        continue;
      }
      this.logger.dir("downLinePang").error("cell is not matched type", cell);
      break;
    }
    this.logger.dir("downLinePang").log("pang list", temp);
    return temp;
  }

  leftLinePang(targetCell: Cell) {
    const targetX = targetCell.x;
    const targetY = targetCell.y;
    const temp: Cell[] = [targetCell];
    for (let x = targetX - 1; x >= 0; x--) {
      const cell = this.map[targetY][x];
      if (cell.type === targetCell.type) {
        temp.push(this.map[targetY][x]);
        continue;
      }
      this.logger.dir("leftLinePang").error("cell is not matched type", cell);
      break;
    }
    this.logger.dir("leftLinePang").log("pang list", temp);
    return temp;
  }

  rightLinePang(targetCell: Cell) {
    const targetX = targetCell.x;
    const targetY = targetCell.y;
    const temp: Cell[] = [targetCell];
    for (let x = targetX + 1; x < GAME_X_WIDTH; x++) {
      const cell = this.map[targetY][x];
      if (cell && cell.type === targetCell.type) {
        temp.push(this.map[targetY][x]);
        continue;
      }
      this.logger.dir("rightLinePang").error("cell is not matched type", cell);
      break;
    }
    this.logger.dir("rightLinePang").log("pang list", temp);
    return temp;
  }

  async swapBothCell(srcCell: Cell, dstCell: Cell) {
    this.logger.dir("swapBothCell").debug("before swap both cell:", this.map);
    this.logger
      .dir("swapBothCell")
      .dir("src")
      .debug("get both cell in this.map", this.map[srcCell.y][srcCell.x]);
    this.logger
      .dir("swapBothCell")
      .dir("dest")
      .debug("get both cell in this.map", this.map[dstCell.y][dstCell.x]);

    const isBoundary = this.isInBoundary(srcCell, dstCell);

    if (!isBoundary) return;

    const swapDirection = srcCell.getDirectionWith(dstCell);
    if (swapDirection === null) return;

    this.logger.dir("swapBothCell").log(swapDirection);

    const swapResult = await srcCell.swapEffect(dstCell, swapDirection);
    if (!swapResult) {
      this.logger.dir("swapBothCell").error("swap error");
    }

    this.logger.dir("swapBothCell").debug("success swapEffect.");

    const destCopyCell = Cell.copy(dstCell, srcCell);
    const srcCopyCell = Cell.copy(srcCell, dstCell);
    this.map[srcCell.y][srcCell.x] = destCopyCell;
    this.map[dstCell.y][dstCell.x] = srcCopyCell;

    // swap 후
    const swapedSrcCell = this.map[srcCell.y][srcCell.x];
    const swapedDstCell = this.map[dstCell.y][dstCell.x];

    this.logger.dir("swapBothCell").dir("check src").debug(swapedSrcCell);
    this.logger.dir("swapBothCell").dir("check dst").debug(swapedDstCell);

    const pangResult = this.inLinePang(
      swapedDstCell,
      swapedSrcCell,
      swapDirection
    );

    pangResult.flat(1).forEach((cell) => {
      cell.pang();
      this.scoreCalculator.scoreUp(cell.score);
    });

    // 점수 획득 시 (팡) 빈 셀 채우기 로직 작성
    await this.searchColumnAndFillEmptyCell();

    this.logger.dir("swapBothCell").debug("after swap both cell:", this.map);
    this.logger
      .dir("swapBothCell")
      .dir("src")
      .debug("get both cell in this.map", this.map[srcCell.y][srcCell.x]);
    this.logger
      .dir("swapBothCell")
      .dir("dest")
      .debug("get both cell in this.map", this.map[dstCell.y][dstCell.x]);
  }

  getColumnLineFromStartPoint(x: number, startPoint: number) {
    const yValue = startPoint;
    const temp: Cell[] = [];
    for (let level = 0; level <= yValue; level++) {
      const cell = this.map[level][x];
      if (cell) {
        temp.push(cell);
      }
    }
    return temp;
  }
  getColumnLine(x: number) {
    const yValue = GAME_Y_WIDTH - 1;
    const temp: Cell[] = [];
    for (let level = 0; level < yValue; level++) {
      const cell = this.map[level][x];
      if (cell) {
        temp.push(cell);
      }
    }
    return temp;
  }

  async searchColumnAndFillEmptyCell() {
    this.logger
      .dir("searchColumnAndFillEmptyCell")
      .log("start search empty column and fill cells...");
    for (let index = 0; index < GAME_X_WIDTH; index++) {
      await this.columnFillNewAnimals(index);
    }
  }

  async columnFillNewAnimals(x: number) {
    const yValue = GAME_Y_WIDTH - 1;
    const [startPoint, emptyAmount] = this.getEmptyStartPointAndAmount(x);

    const columnLine = this.getColumnLineFromStartPoint(x, startPoint);
    // console.log(columnLine);
    const filterCells = this.filterEmptyCell(columnLine);
    const concatOriginAndNewCells = this.fillNewCells(
      filterCells,
      startPoint,
      emptyAmount,
      x
    );

    const animationTemp: Cell[] = [];

    concatOriginAndNewCells.forEach((cell) => {
      const copyCell = cell.deepCopySelf();
      animationTemp.push(copyCell);
      this.map[cell.y][cell.x] = copyCell;
    });

    const promiseTemp: Promise<boolean>[] = [];
    for (const tempCell of animationTemp) {
      let resolver: (value: boolean) => void;
      const aniPromise = new Promise<boolean>(
        (resolve) => (resolver = resolve)
      );
      promiseTemp.push(aniPromise);
      const tempCellY = tempCell.y;
      tempCell.y -= emptyAmount;
      const aniLoop = setInterval(() => {
        tempCell.y += 0.05;
        if (tempCell.y >= tempCellY) {
          tempCell.y = tempCellY;
          clearInterval(aniLoop);
          resolver(true);
        }
      });
    }

    Promise.all(promiseTemp).then(() => {});

    this.logger
      .dir("columnFillNewAnimals")
      .debug("concatOriginAndNewCells", concatOriginAndNewCells);
  }

  findEmptyCell(cells: Cell[]) {
    return cells.find((cell) => cell.type === "");
  }

  filterEmptyCell(cells: Cell[]) {
    return cells.filter((cell) => cell.type !== "");
  }

  fillNewCells(
    origin: Cell[],
    startPoint: number,
    emptyAmount: number,
    x: number
  ) {
    // let resolver: (value: Cell[]) => void;
    // const promise: Promise<Cell[]> = new Promise(
    //   (resolve) => (resolver = resolve)
    // );
    this.logger
      .dir("searchColumnAndFillEmptyCell")
      .dir("columnFillNewAnimals")
      .dir("fillNewCells")
      .debug(origin, startPoint, emptyAmount);
    // tempStartPoint 이게 사용되려나?
    let tempStartPoint = startPoint;
    const tempEmptyAmount = emptyAmount;

    const temp: Cell[] = origin.map((cell) => {
      const copyCell = cell.deepCopySelf();
      copyCell.y += emptyAmount;
      tempStartPoint--;

      return copyCell;
    });

    for (let index = tempEmptyAmount - 1; index >= 0; index--) {
      const [type, score] = this.getRandomCellType();
      const copyCell = new Cell(type, x, index, score);
      this.logger
        .dir("searchColumnAndFillEmptyCell")
        .dir("columnFillNewAnimals")
        .dir("fillNewCells")
        .dir("for loop")
        .debug(copyCell);
      temp.push(copyCell);
    }

    return temp;
  }

  getEmptyStartPointAndAmount(x: number) {
    const yValue = GAME_Y_WIDTH - 1;
    let startPoint = -1;
    let emptyAmount = 0;

    for (let level = yValue; level >= 0; level--) {
      const cell = this.map[level][x];
      if (cell.type === "") {
        emptyAmount += 1;
      }
      if (startPoint === -1 && cell.type === "") {
        startPoint = cell.y;
      }
    }
    return [startPoint, emptyAmount];
  }

  render() {
    for (const row of this.map) {
      for (const cell of row) {
        cell.render();
      }
    }
  }
}
