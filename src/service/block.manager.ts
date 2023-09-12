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

  render() {
    this.map.flat(1).forEach((cell) => {
      cell.render();
    });
  }
}
