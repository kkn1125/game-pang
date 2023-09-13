import Cell from "@src/model/cell";
import { gameCtx, GAME_X_WIDTH, GAME_Y_WIDTH } from "@src/util/global";
import Logger from "@src/util/logger";

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

  constructor() {
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").log("initialize");
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
    const topCell = this.map[srcY - 1][srcX];
    // 하
    const bottomCell = this.map[srcY + 1][srcX];
    // 좌
    const leftCell = this.map[srcY][srcX - 1];
    // 우
    const rightCell = this.map[srcY][srcX + 1];

    const isIn =
      topCell === dstCell ||
      bottomCell === dstCell ||
      leftCell === dstCell ||
      rightCell === dstCell;

    this.logger.dir("swapBothCell").dir("isInBoundary").debug(isIn);

    return isIn;
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

  render() {
    for (const row of this.map) {
      for (const cell of row) {
        cell.render();
      }
    }
  }
}
