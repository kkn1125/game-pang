import Cell, { Direciton } from "@src/model/cell";
import {
  BASE_TYPE_SCORE,
  OPTIONS,
  TestCase1,
  TestCase2,
} from "@src/util/global";
import Logger from "@src/util/logger";
import BaseModule from "./base.moudle";
import ScoreCalculator from "./score.calculator";

type BlockSize = {
  x: number;
  y: number;
};
type Axis = [number, number];

export default class BlockManager extends BaseModule {
  types = BASE_TYPE_SCORE;
  logger: Logger;
  blockSize: BlockSize = { x: 50, y: 50 };
  map: Cell[][] = [];
  scoreCalculator: ScoreCalculator;

  constructor(mode: string, scoreCalculator: ScoreCalculator) {
    super(mode);
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").log("initialize mode:", mode);
    this.scoreCalculator = scoreCalculator;
  }

  scoreUp(score: number) {
    this.scoreCalculator.scoreUp(score);
  }

  initialize() {
    if (this.mode !== "test") {
      const map = this.createMap([OPTIONS.WIDTH.GAME.X, OPTIONS.WIDTH.GAME.Y]);
      this.logger.dir("initialize").log("created map", map);
      this.map = map;
      return map;
    } else {
      if (
        TestCase2.length !== OPTIONS.WIDTH.GAME.Y ||
        TestCase2[0].length !== OPTIONS.WIDTH.GAME.X
      ) {
        throw new Error("Invalid map size");
      }
      const map = this.createCustomMap(TestCase2);
      this.logger.dir("initialize").log("created custom map", map);
      this.map = map;
      return map;
    }
  }

  getCellScoreByType(type: string) {
    // const randomTypeIndex = Math.floor(Math.random() * this.types.length);
    const index = this.types.findIndex((typeScore) => typeScore[0] === type);
    return this.types[index][1];
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

  createCustomMap(customMap: string[][]) {
    return customMap.map((row, y) =>
      row.map((cell, x) => new Cell(cell, x, y, this.getCellScoreByType(cell)))
    );
  }

  isInBoundary(srcCell: Cell, dstCell: Cell) {
    this.logger
      .dir("isInBoundary")
      .debug("srcCell", "dstCell", srcCell, dstCell);
    const srcX = srcCell?.x;
    const srcY = srcCell?.y;

    if (srcX === undefined || srcY === undefined) {
      return false;
    }

    // 상
    const topCell = this.map[srcY - 1]?.[srcX];
    // 하
    const bottomCell = this.map[srcY + 1]?.[srcX];
    // 좌
    const leftCell = this.map[srcY]?.[srcX - 1];
    // 우
    const rightCell = this.map[srcY]?.[srcX + 1];

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
    for (let y = targetY + 1; y < OPTIONS.WIDTH.GAME.Y; y++) {
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
    for (let x = targetX + 1; x < OPTIONS.WIDTH.GAME.X; x++) {
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

  async revertSwap(srcCell: Cell, dstCell: Cell) {
    let resolver: (value: unknown) => void;
    const promise = new Promise((resolve) => (resolver = resolve));
    setTimeout(() => {
      this.swapBothCell(srcCell, dstCell).then(() => {
        resolver(true);
      });
    }, 150);
    return promise;
  }

  async swapBothCell(srcCell: Cell, dstCell: Cell) {
    this.logger.dir("swapBothCell").debug("before swap both cell:", this.map);
    this.logger
      .dir("swapBothCell")
      .dir("src")
      .debug("get both cell in this.map", this.map[srcCell?.y]?.[srcCell?.x]);
    this.logger
      .dir("swapBothCell")
      .dir("dest")
      .debug("get both cell in this.map", this.map[dstCell?.y]?.[dstCell?.x]);

    if (
      !this.map[srcCell?.y]?.[srcCell?.x] ||
      !this.map[dstCell?.y]?.[dstCell?.x]
    ) {
      return false;
    }

    try {
      const isBoundary = this.isInBoundary(srcCell, dstCell);

      if (!isBoundary) return false;
    } catch (error) {
      console.error(error);
      return false;
    }

    const swapDirection = srcCell.getDirectionWith(dstCell);
    if (swapDirection === null) return false;

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

    // exec pang
    const pangResult = this.inLinePang(
      swapedDstCell,
      swapedSrcCell,
      swapDirection
    );

    if (pangResult.every((cell) => cell.length === 0)) {
      this.logger.dir("swapBothCell").debug("no matched cell line");
      return false;
    }

    pangResult.flat(1).forEach((cell) => {
      cell.pang();
      this.scoreCalculator.scoreUp(cell.score);
    });
    return true;
  }

  async swapBothCellAndFill(srcCell: Cell, dstCell: Cell) {
    // let resolver: (value: unknown) => void;
    // const promise = new Promise((resolve) => (resolver = resolve));
    const isSwapped = await this.swapBothCell(srcCell, dstCell);
    // console.log("isSwapped", isSwapped);
    if (!isSwapped) {
      this.logger.dir("swapBothCellAndFill").error("not swapped");
      return false;
    }

    await this.searchColumnsAndFillEmptyCell();
    // setTimeout(() => {
    //   this.autoPangAndFill().then(() => {
    //     resolver(true);
    //   });
    // }, 100);
    return true;
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
    const yValue = OPTIONS.WIDTH.GAME.Y;
    const temp: Cell[] = [];
    for (let level = 0; level < yValue; level++) {
      const cell = this.map[level][x];
      if (cell) {
        temp.push(cell);
      }
    }
    return temp;
  }

  getPangableList() {
    const rows = this.searchRowsAndFilterPangable();
    const columns = this.searchColumnsAndFilterPangable();
    this.logger.dir("getPangableList").debug("pagable", rows, columns);
    const rowScores = rows.reduce((acc, row) => {
      // acc += (row?.[0].score || 0) * (row.slice(3)?.length || 0);
      if (row.length > 3) {
        acc += row[0].score * row.slice(3).length;
      }
      return acc;
    }, 0);
    const columnScores = columns.reduce((acc, column) => {
      // acc += (column?.[0].score || 0) * (column.slice(3)?.length || 0);
      if (column.length > 3) {
        acc += column[0].score * column.slice(3).length;
      }
      return acc;
    }, 0);

    this.logger
      .dir("getPangableList")
      .debug("추가 점수:", rowScores + columnScores);

    return [...new Set([...rows, ...columns].flat(1))];
  }

  async autoPangAndFill(loop: boolean = true) {
    const pangableList = this.getPangableList();
    // const tempType: string[] = [];
    pangableList.forEach((cell) => {
      cell.pang();

      // if (tempType.length === 0 || tempType.includes(cell.type)) {
      //   tempType.push(cell.type);
      // } else {
      //   tempType.splice(0);
      // }

      // const plusScore = (tempType.length - 3) * cell.score;

      this.scoreCalculator.scoreUp(
        cell.score /*  + (plusScore > 0 ? plusScore : 0) */
      );
    });
    await this.searchEmptyColumnsAndFill();
    // await this.searchColumnsAndFillEmptyCell();
    // console.log("searchEmptyColumnsAndFill done???");
    const isDone = this.getPangableList().length === 0;
    this.logger.dir("autoPangAndFill").log("isDone", isDone);
    if (loop && !isDone) {
      return await this.autoPangAndFill();
    }

    return isDone;
  }

  // new logic 2023-09-16 17:49:40
  async searchEmptyColumnsAndFill() {
    let resolver: (value: boolean) => void;
    const promise = new Promise((resolve) => (resolver = resolve));
    const promises: Promise<Cell[]>[] = [];

    for (let index = 0; index < OPTIONS.WIDTH.GAME.X; index++) {
      // promises.push(this.columnFillNewAnimals(index));
      promises.push(this.fillColumn(index));
    }

    // 전체열 병렬 처리(처럼)하기 위함.
    return await Promise.all(promises);

    return promise;

    // return true;

    // console.log(this.getColumnLine(1));
    // console.log(animalCells);
    // console.log(newCellsLine);
  }

  fillColumn(index: number) {
    const promises: Promise<Cell>[] = [];
    const columnLine = this.getColumnLine(index);
    const [startPoint, emptyAmount] = this.getEmptyStartPointAndAmount(index);
    const animalCells = this.filterEmptyCell(columnLine);
    const newCellsLine = this.fillNewCells(animalCells, emptyAmount, index);

    for (const idx in newCellsLine) {
      const idxx = Number(idx);
      const cell = newCellsLine[idxx];
      this.map[idxx][cell.x] = cell;

      promises.push(
        new Promise((resolve) => {
          cell.moveY(idxx).then(() => {
            cell.y = idxx;
            // console.log(cell, index);
            resolve(cell);
            // if (cell === newCellsLine[newCellsLine.length - 1]) {
            // }
          });
        })
      );
    }
    return Promise.all(promises);
  }

  // all cell filter pangable by rows
  searchRowsAndFilterPangable() {
    // this.logger
    //   .dir("searchRowsAndFilterPangable")
    //   .debug("check row cells is pangable");

    const rowTemp: Cell[][] = [];
    for (const row of this.map) {
      for (const cell of row) {
        // 빈 배열 -> 새 배열 추가
        // 마지막 배열 값의 셀과 현재 셀 값이 다를때 -> 새 배열 추가
        // 마지막 배열 값이 없을 때 -> 새 배열 추가

        const isEmpty = rowTemp.length === 0;
        const isEmptyLastArray = rowTemp[rowTemp.length - 1]?.length === 0;
        const isDifferenceType =
          rowTemp[rowTemp.length - 1]?.[0]?.type !== cell.type;
        if (isEmpty || isEmptyLastArray || isDifferenceType) {
          rowTemp.push([]);
        }

        rowTemp[rowTemp.length - 1].push(cell);
      }
      rowTemp.push([]);
    }
    const getPangRows = rowTemp.filter((row) => row.length > 2);
    // this.logger.dir("searchRowsAndFilterPangable").debug(getPangRows);
    return getPangRows;
  }

  // all cell filter pangable by columns
  searchColumnsAndFilterPangable() {
    // this.logger
    //   .dir("searchColumnsAndFilterPangable")
    //   .debug("check column cells is pangable");

    const columnTemp: Cell[][] = [];
    for (let index = 0; index < OPTIONS.WIDTH.GAME.X; index++) {
      const columns = this.getColumnLine(index);
      for (const cell of columns) {
        // 빈 배열 -> 새 배열 추가
        // 마지막 배열 값의 셀과 현재 셀 값이 다를때 -> 새 배열 추가
        // 마지막 배열 값이 없을 때 -> 새 배열 추가

        const isEmpty = columnTemp.length === 0;
        const isEmptyLastArray =
          columnTemp[columnTemp.length - 1]?.length === 0;
        const isDifferenceType =
          columnTemp[columnTemp.length - 1]?.[0]?.type !== cell.type;
        if (isEmpty || isEmptyLastArray || isDifferenceType) {
          columnTemp.push([]);
        }

        columnTemp[columnTemp.length - 1].push(cell);
      }
      columnTemp.push([]);
    }

    const getPangColumns = columnTemp.filter((column) => column.length > 2);
    // this.logger.dir("searchColumnsAndFilterPangable").debug(getPangColumns);
    return getPangColumns;
  }

  async searchColumnsAndFillEmptyCell() {
    this.logger
      .dir("searchColumnsAndFillEmptyCell")
      .log("start search empty column and fill cells...");
    const promises: Promise<boolean[]>[] = [];
    for (let index = 0; index < OPTIONS.WIDTH.GAME.X; index++) {
      promises.push(this.columnFillNewAnimals(index));
    }

    // 전체열 병렬 처리(처럼)하기 위함.
    await Promise.all(promises);

    const isDone = this.map.flat(1).every((cell) => cell.type !== "");

    // if (!isDone) {
    //   return await this.searchColumnsAndFillEmptyCell();
    // }

    return isDone;
  }

  async columnFillNewAnimals(x: number) {
    const yValue = OPTIONS.WIDTH.GAME.Y - 1;
    const [startPoint, emptyAmount] = this.getEmptyStartPointAndAmount(x);

    // const columnLine = this.getColumnLineFromStartPoint(x, startPoint);
    const columnLine = this.getColumnLine(x);
    // console.log(columnLine);
    const filterCells = this.filterEmptyCell(columnLine);
    const concatOriginAndNewCells = this.fillNewCells(
      filterCells,
      emptyAmount,
      x
    );

    /* fill column animation */
    const animationTemp: Cell[] = [];

    concatOriginAndNewCells.forEach((cell) => {
      const copyCell = cell.deepCopySelf();
      animationTemp.push(copyCell);
      if (this.map?.[cell.y]?.[cell.x]) {
        this.map[cell.y][cell.x] = copyCell;
      }
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
        tempCell.y += OPTIONS.ANIMATION.SPEED / 2;
        if (tempCell.y >= tempCellY) {
          tempCell.y = tempCellY;
          clearInterval(aniLoop);
          resolver(true);
        }
      }, OPTIONS.ANIMATION.FRAME);
    }

    return Promise.all(promiseTemp);
    /* fill column animation */

    // this.logger
    //   .dir("columnFillNewAnimals")
    //   .debug("concatOriginAndNewCells", concatOriginAndNewCells);
  }

  findEmptyCell(cells: Cell[]) {
    return cells.find((cell) => cell.type === "");
  }

  filterEmptyCell(cells: Cell[]) {
    return cells.filter((cell) => cell.type !== "");
  }

  fillNewCells(origin: Cell[], emptyAmount: number, x: number) {
    // let resolver: (value: Cell[]) => void;
    // const promise: Promise<Cell[]> = new Promise(
    //   (resolve) => (resolver = resolve)
    // );
    // this.logger
    //   .dir("searchColumnsAndFillEmptyCell")
    //   .dir("columnFillNewAnimals")
    //   .dir("fillNewCells")
    //   .debug(origin, startPoint, emptyAmount);
    // tempStartPoint 이게 사용되려나?
    const startPoint = origin[0].y;
    const tempEmptyAmount = emptyAmount;

    const temp: Cell[] = origin.map((cell) => {
      const copyCell = cell.deepCopySelf();
      // OPTIONS.WIDTH.GAME.Y - copyCell.y
      // copyCell.y += emptyAmount;

      return copyCell;
    });

    for (let index = 1; index <= tempEmptyAmount; index++) {
      const [type, score] = this.getRandomCellType();
      const copyCell = new Cell(type, x, 1 - index - 1, score);
      // this.logger
      //   .dir("searchColumnsAndFillEmptyCell")
      //   .dir("columnFillNewAnimals")
      //   .dir("fillNewCells")
      //   .dir("for loop")
      //   .debug(copyCell);
      temp.unshift(copyCell);
    }
    return temp;
  }

  getEmptyStartPointAndAmount(x: number) {
    const yValue = OPTIONS.WIDTH.GAME.Y - 1;
    let startPoint = -1;
    let emptyAmount = 0;

    for (let level = yValue; level >= 0; level--) {
      const cell = this.map[level][x];
      if (cell.type === "") {
        emptyAmount += 1;
        if (startPoint < cell.y) {
          startPoint = cell.y;
        }
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
