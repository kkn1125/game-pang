import Cell, { Direciton } from "@src/model/cell";
import {
  BASE_TYPE_SCORE,
  OPTIONS,
  RANDOM_ITEM,
  TestCase1,
  TestCase2,
  wait,
} from "@src/util/global";
import Logger from "@src/util/logger";
import BaseModule from "./base.moudle";
import QuestManager from "./quest.manager";
import ScoreCalculator from "./score.calculator";

export default class BlockManager extends BaseModule {
  types = BASE_TYPE_SCORE /* .filter(
    (type) => !type[0].match(/^(all|vertical|horizon)$/g)
  ) */;
  logger: Logger;
  blockSize: BlockSize = { x: 50, y: 50 };
  map: Cell[][] = [];
  scoreCalculator: ScoreCalculator;
  questManager: QuestManager;

  dupRemove: boolean = false;

  animalsPang: {
    [k in Animals]: number;
  } = {
    cat: 0,
    dog: 0,
    lion: 0,
    duck: 0,
    mouse: 0,
    rabbit: 0,
    panda: 0,
    pig: 0,
    racoon: 0,
  };

  gameEnd: boolean = false;

  constructor(
    mode: string,
    scoreCalculator: ScoreCalculator,
    questManager: QuestManager
  ) {
    super(mode);
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").log("initialize mode:", mode);
    this.scoreCalculator = scoreCalculator;
    this.questManager = questManager;
  }

  containsType(type: string) {
    return this.types.some((types) => types[0] === type);
  }

  scoreUp(score: number) {
    this.scoreCalculator.scoreUp(score);
  }

  async initialize(force: boolean = false) {
    wait.push(0);

    this.dupRemove = false;
    if (force || this.mode !== "test") {
      const map = this.createMap([OPTIONS.WIDTH.GAME.X, OPTIONS.WIDTH.GAME.Y]);
      this.logger.dir("initialize").log("created map", map);
      this.map = map;
      await this.removeDuplicate();
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
      await this.removeDuplicate();
      return map;
    }
  }

  resetScore() {
    this.scoreCalculator.resetCombos();
    this.scoreCalculator.resetScores();
    this.scoreCalculator.resetTurns();
  }
  resetQuest() {
    this.questManager.resetQuest();
  }

  async removeDuplicate() {
    let resolver: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolver = resolve;
    });
    const BASE_VALUE = {
      FRAME: OPTIONS.ANIMATION.FRAME,
      SPEED: OPTIONS.ANIMATION.SPEED,
    };
    OPTIONS.ANIMATION.FRAME = 0;
    OPTIONS.ANIMATION.SPEED = 100;

    this.logger.dir("removeDuplicate").log("start remove");
    await this.autoPangAndFill();
    this.logger.dir("removeDuplicate").log("done remove");

    this.resetScore();
    this.resetQuest();

    OPTIONS.ANIMATION.FRAME = BASE_VALUE.FRAME;
    OPTIONS.ANIMATION.SPEED = BASE_VALUE.SPEED;

    this.dupRemove = true;
    setTimeout(() => {
      resolver(true);
    }, 16);
    return promise;
  }

  getCellScoreByType(type: string) {
    const index = this.types.findIndex((typeScore) => typeScore[0] === type);
    return this.types[index][1];
  }

  getRandomCellType() {
    const onlyAnimals = this.types.filter(
      (type) => !type[0].match(/^(all|horizon|vertical)$/g)
    );
    const randomTypeIndex = Math.floor(Math.random() * onlyAnimals.length);
    return onlyAnimals[randomTypeIndex];
  }

  // randomItem() {
  //   const itemKeys = Object.keys(RANDOM_ITEM).filter((item) => item !== "none");
  //   const randomIndex = Math.floor(Math.random() * itemKeys.length);
  //   return itemKeys[randomIndex];
  // }

  randomItemPickBasedOnPercentage(defaultType: string) {
    const choice = RANDOM_ITEM.filter((q) => q.item !== "all")[
      Math.floor(Math.random() * (RANDOM_ITEM.length - 1))
    ];
    this.logger.dir("randomItemPickBasedOnPercentage").debug(choice);

    // Define the item probabilities
    const itemProbabilities = RANDOM_ITEM;

    const randomValue = Math.random();

    // Initialize cumulative probability
    let cumulativeProbability = 0;

    // Iterate through item probabilities and select an item based on probability
    for (const itemInfo of itemProbabilities) {
      cumulativeProbability += itemInfo.probability;
      if (randomValue <= cumulativeProbability) {
        return itemInfo.item;
      }
    }

    // Return a default item if no item is selected (this should not happen)
    return choice.item;

    // const randomValue = Math.random() * 100;
    // let runningSum = 0;
    // let choice = Object.keys(RANDOM_ITEM).filter((q) => q !== "all")[
    //   Math.floor(Math.random() * 2)
    // ];
    // for (let i = 0; i < Object.keys(RANDOM_ITEM).length; i++) {
    //   runningSum += Object.values(RANDOM_ITEM)[i];

    //   if (randomValue <= runningSum) {
    //     choice = Object.keys(RANDOM_ITEM)[i];
    //     break;
    //   }
    // }
    // this.logger.dir("randomItemPickBasedOnPercentage").debug(choice);
    // return choice;
  }

  getRandomCellTypeMoreThanLessAnimalInMap() {
    this.logger
      .dir("getRandomCellTypeMoreThanLessAnimalInMap")
      .log("getRandomNewCell");
    const counter = this.map
      .flat(1)
      .reduce((acc, cur) => {
        if (cur.type === "" || cur.checkTypeItem()) return acc;

        const index = acc.findIndex((ac) => ac[0] === cur.type);
        if (index === -1) {
          acc.push([cur.type, 0]);
        } else {
          acc[index][1] += 1;
        }
        return acc;
      }, [] as [string, number][])
      .concat(this.questManager.quests.map((q) => [q.condition.type, 0]));

    const desc = counter.sort((a, b) => a[1] - b[1]).slice(0, -1);

    const randomMinIndex = Math.floor(Math.random() * desc.length);
    const randomMin = desc[randomMinIndex];
    const minIndex = this.types.findIndex((type) => type[0] === randomMin[0]);
    const randomTypeIndex = minIndex;
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

  mockisInBoundary(mockMap: Cell[][], srcCell: Cell, dstCell: Cell) {
    const srcX = srcCell?.x;
    const srcY = srcCell?.y;

    if (srcX === undefined || srcY === undefined) {
      return false;
    }

    // 상
    const topCell = mockMap[srcY - 1]?.[srcX];
    // 하
    const bottomCell = mockMap[srcY + 1]?.[srcX];
    // 좌
    const leftCell = mockMap[srcY]?.[srcX - 1];
    // 우
    const rightCell = mockMap[srcY]?.[srcX + 1];

    const isIn =
      topCell === dstCell ||
      bottomCell === dstCell ||
      leftCell === dstCell ||
      rightCell === dstCell;

    return isIn;
  }

  checkTypeItem(cell: Cell) {
    return cell.checkTypeItem();
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
      const upDstLinePang = dstCell.checkTypeItem()
        ? []
        : this.upLinePang(dstCell);
      const downDstLinePang = dstCell.checkTypeItem()
        ? []
        : this.downLinePang(dstCell);
      const rightDstLinePang = dstCell.checkTypeItem()
        ? []
        : this.rightLinePang(dstCell);

      // collect
      const concatSrcUpDown = [
        ...new Set([...upSrcLinePang, ...downSrcLinePang]),
      ];
      const concatDstUpDown = [
        ...new Set([...upDstLinePang, ...downDstLinePang]),
      ];
      const concatSrcLeft = [...new Set(leftSrcLinePang)];
      const concatDstRight = [...new Set(rightDstLinePang)];

      if (concatSrcUpDown.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatSrcUpDown.forEach((cell) => {
          if (cell.id === srcCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }
      if (concatDstUpDown.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatDstUpDown.forEach((cell) => {
          if (cell.id === dstCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }
      if (concatSrcLeft.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatSrcLeft.forEach((cell) => {
          if (cell.id === srcCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }
      if (concatDstRight.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatDstRight.forEach((cell) => {
          if (cell.id === dstCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }

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
      const upDstLinePang = dstCell.checkTypeItem()
        ? []
        : this.upLinePang(dstCell);
      const downDstLinePang = dstCell.checkTypeItem()
        ? []
        : this.downLinePang(dstCell);
      const leftDstLinePang = dstCell.checkTypeItem()
        ? []
        : this.leftLinePang(dstCell);

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

      if (concatSrcUpDown.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatSrcUpDown.forEach((cell) => {
          if (cell.id === srcCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }
      if (concatDstUpDown.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatDstUpDown.forEach((cell) => {
          if (cell.id === dstCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }
      if (concatDstLeft.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatDstLeft.forEach((cell) => {
          if (cell.id === dstCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }
      if (concatSrcRight.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatSrcRight.forEach((cell) => {
          if (cell.id === srcCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }

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
      const downDstLinePang = dstCell.checkTypeItem()
        ? []
        : this.downLinePang(dstCell);
      const leftDstLinePang = dstCell.checkTypeItem()
        ? []
        : this.leftLinePang(dstCell);
      const rightDstLinePang = dstCell.checkTypeItem()
        ? []
        : this.rightLinePang(dstCell);

      // collect
      const concatSrcLeftRight = [
        ...new Set([...leftSrcLinePang, ...rightSrcLinePang]),
      ];
      const concatDstLeftRight = [
        ...new Set([...leftDstLinePang, ...rightDstLinePang]),
      ];
      const concatSrcUp = [...new Set(upSrcLinePang)];
      const concatDstDown = [...new Set(downDstLinePang)];

      if (concatSrcLeftRight.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatSrcLeftRight.forEach((cell) => {
          if (cell.id === srcCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }
      if (concatDstLeftRight.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatDstLeftRight.forEach((cell) => {
          if (cell.id === dstCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }
      if (concatSrcUp.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatSrcUp.forEach((cell) => {
          if (cell.id === srcCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }
      if (concatDstDown.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatDstDown.forEach((cell) => {
          if (cell.id === dstCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }

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
      const upDstLinePang = dstCell.checkTypeItem()
        ? []
        : this.upLinePang(dstCell);
      const leftDstLinePang = dstCell.checkTypeItem()
        ? []
        : this.leftLinePang(dstCell);
      const rightDstLinePang = dstCell.checkTypeItem()
        ? []
        : this.rightLinePang(dstCell);

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

      if (concatSrcLeftRight.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatSrcLeftRight.forEach((cell) => {
          if (cell.id === srcCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }
      if (concatDstLeftRight.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatDstLeftRight.forEach((cell) => {
          if (cell.id === dstCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }
      if (concatDstUp.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatDstUp.forEach((cell) => {
          if (cell.id === dstCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }
      if (concatSrcDown.length > OPTIONS.ITEM.MATCH_LIMIT) {
        concatSrcDown.forEach((cell) => {
          if (cell.id === srcCell.id) {
            this.map[cell.y][cell.x].type =
              this.randomItemPickBasedOnPercentage(
                this.map[cell.y][cell.x].type
              );
          }
        });
      }

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

    if (dstCell.checkTypeItem()) {
      if (dstCell.type === "horizon") {
        dstCell.type = "";
        const temp: Cell[] = [];
        for (const cell of this.map.flat(1)) {
          if (srcCell.originType === cell.originType) {
            temp.push(...this.horizonPang(cell.x, cell.y));
          }
        }
        const removeDuplicated = [...new Set(temp)];
        this.logger.dir("swapBothCell").dir("horizon").debug(removeDuplicated);
        removeDuplicated.forEach((cell) => {
          this.animalsPang[cell.originType] += 1;
          this.questManager.questAmountUp(cell.originType);
          cell.pang();
          this.scoreCalculator.scoreUp(
            cell.score /*  + (plusScore > 0 ? plusScore : 0) */
          );
        });
      }
      if (dstCell.type === "vertical") {
        const temp: Cell[] = [];
        dstCell.type = "";
        for (const cell of this.map.flat(1)) {
          if (srcCell.originType === cell.originType) {
            temp.push(...this.verticalPang(cell.x, cell.y));
          }
        }
        const removeDuplicated = [...new Set(temp)];
        this.logger.dir("swapBothCell").dir("vertical").debug(removeDuplicated);
        removeDuplicated.forEach((cell) => {
          this.animalsPang[cell.originType] += 1;
          this.questManager.questAmountUp(cell.originType);
          cell.pang();
          this.scoreCalculator.scoreUp(
            cell.score /*  + (plusScore > 0 ? plusScore : 0) */
          );
        });
      }
      if (dstCell.type === "all") {
        const temp: Cell[] = [];
        dstCell.type = "";
        for (const cell of this.map.flat(1)) {
          if (srcCell.originType === cell.originType) {
            temp.push(...this.allPang(cell.x, cell.y));
          }
        }
        const removeDuplicated = [...new Set(temp)];
        this.logger.dir("swapBothCell").dir("all").debug(removeDuplicated);
        removeDuplicated.forEach((cell) => {
          this.animalsPang[cell.originType] += 1;
          this.questManager.questAmountUp(cell.originType);
          cell.pang();
          this.scoreCalculator.scoreUp(
            cell.score /*  + (plusScore > 0 ? plusScore : 0) */
          );
        });
      }
      await this.autoPangAndFill();
      return true;
    }

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
      if (!cell.checkTypeItem()) {
        this.animalsPang[cell.type] += 1;
        this.questManager.questAmountUp(cell.type);
        cell.pang();
        this.scoreCalculator.scoreUp(cell.score);
      }
    });

    return true;
  }

  async swapBothCellAndFill(srcCell: Cell, dstCell: Cell) {
    const isSwapped = await this.swapBothCell(srcCell, dstCell);

    if (!isSwapped) {
      this.logger.dir("swapBothCellAndFill").error("not swapped");
      return false;
    }

    await this.searchColumnsAndFillEmptyCell();
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

  getMockColumnLine(mockMap: Cell[][], x: number) {
    const yValue = OPTIONS.WIDTH.GAME.Y;
    const temp: Cell[] = [];
    for (let level = 0; level < yValue; level++) {
      const cell = mockMap[level][x];
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

  getMockPangableList(mockMap: Cell[][]) {
    const rows = this.searchMockRowsAndFilterPangable(mockMap);
    const columns = this.searchMockColumnsAndFilterPangable(mockMap);
    this.logger.dir("getPangableList").debug("pagable", rows, columns);
    const rowScores = rows.reduce((acc, row) => {
      if (row.length > 3) {
        acc += row[0].score * row.slice(3).length;
      }
      return acc;
    }, 0);
    const columnScores = columns.reduce((acc, column) => {
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

  getPangableList() {
    const rows = this.searchRowsAndFilterPangable();
    const columns = this.searchColumnsAndFilterPangable();
    this.logger.dir("getPangableList").debug("pagable", rows, columns);
    const rowScores = rows.reduce((acc, row) => {
      if (row.length > 3) {
        acc += row[0].score * row.slice(3).length;
      }
      return acc;
    }, 0);
    const columnScores = columns.reduce((acc, column) => {
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

  mockingPangableColumnLines() {
    const mockMap = this.mockingMap();
    const isSuccess: Cell[][] = [];

    for (const row of mockMap) {
      for (const column in row) {
        const [src, dst] = this.mockSwapBothCell(
          mockMap,
          row[Number(column)],
          row[Number(column) + 1]
        );
        const pangableColumns = this.searchMockColumnsAndFilterPangable(
          mockMap
        ).map((group) =>
          group.map((cell) => {
            const isSameSrc = Cell.is(src, cell);
            const isSameDst = Cell.is(dst, cell);
            if (isSameSrc) {
              return dst;
            }
            if (isSameDst) {
              return src;
            }
            return cell.deepCopySelf();
          })
        );
        const pangableRows = this.searchMockRowsAndFilterPangable(mockMap).map(
          (group) =>
            group.map((cell) => {
              const isSameSrc = Cell.is(src, cell);
              const isSameDst = Cell.is(dst, cell);
              if (isSameSrc) {
                return dst;
              }
              if (isSameDst) {
                return src;
              }
              return cell.deepCopySelf();
            })
        );
        this.mockRevertSwap(mockMap, src, dst);

        const removeDup = [...pangableColumns, ...pangableRows];
        if (removeDup.length > 0) {
          isSuccess.push(...removeDup);
        }
      }
    }

    return isSuccess;
  }
  mockingPangableRowLines() {
    const mockMap = this.mockingMap();
    const isSuccess: Cell[][] = [];

    for (let column = 0; column < OPTIONS.WIDTH.GAME.X; column++) {
      const columns = this.getMockColumnLine(mockMap, column);
      for (const row in columns) {
        const [src, dst] = this.mockSwapBothCell(
          mockMap,
          columns[Number(row)],
          columns[Number(row) + 1]
        );
        if (!(src && dst)) continue;

        const pangableColumns = this.searchMockColumnsAndFilterPangable(
          mockMap
        ).map((group) =>
          group.map((cell) => {
            const isSameSrc = Cell.is(src, cell);
            const isSameDst = Cell.is(dst, cell);
            if (isSameSrc) {
              return dst;
            }
            if (isSameDst) {
              return src;
            }
            return cell.deepCopySelf();
          })
        );
        const pangableRows = this.searchMockRowsAndFilterPangable(mockMap).map(
          (group) =>
            group.map((cell) => {
              const isSameSrc = Cell.is(src, cell);
              const isSameDst = Cell.is(dst, cell);
              if (isSameSrc) {
                return dst;
              }
              if (isSameDst) {
                return src;
              }
              return cell.deepCopySelf();
            })
        );
        this.mockRevertSwap(mockMap, src, dst);

        const removeDup = [...new Set([...pangableColumns, ...pangableRows])];
        if (removeDup.length > 0) {
          isSuccess.push(...removeDup);
        }
      }
    }

    return isSuccess;
  }

  mockPangableItem() {
    const mockMap = this.mockingMap();
    return mockMap
      .flat(1)
      .filter((cell) => cell.checkTypeItem())
      .map((cell) => [cell]);
  }

  mockingMap() {
    return [...this.map].map((row) => row.map((cell) => cell.deepCopySelf()));
  }

  mockRevertSwap(mockMap: Cell[][], srcCell: Cell, dstCell: Cell) {
    return this.mockSwapBothCell(mockMap, srcCell, dstCell);
  }

  mockSwapBothCell(mockMap: Cell[][], srcCell: Cell, dstCell: Cell) {
    if (
      !mockMap[srcCell?.y]?.[srcCell?.x] ||
      !mockMap[dstCell?.y]?.[dstCell?.x]
    ) {
      return [];
    }

    try {
      const isBoundary = this.mockisInBoundary(mockMap, srcCell, dstCell);

      if (!isBoundary) return [];
    } catch (error) {
      console.error(error);
      return [];
    }
    const swapDirection = srcCell.getDirectionWith(dstCell);
    if (swapDirection === null) return [];

    const destCopyCell = Cell.copy(dstCell, srcCell);
    const srcCopyCell = Cell.copy(srcCell, dstCell);
    mockMap[srcCell.y][srcCell.x] = destCopyCell;
    mockMap[dstCell.y][dstCell.x] = srcCopyCell;

    // swap 후
    const swapedSrcCell = mockMap[srcCell.y][srcCell.x];
    const swapedDstCell = mockMap[dstCell.y][dstCell.x];

    return [swapedSrcCell, swapedDstCell];
  }

  /* version 3 features item */
  allPang(x: number, y: number) {
    const temp: Cell[] = [];
    this.map[y][x].type = "";
    temp.push(...this.verticalPang(x, y));
    temp.push(...this.horizonPang(x, y));
    return temp;
  }

  verticalPang(x: number, y: number) {
    const temp: Cell[] = [];
    this.map[y][x].type = "";
    const vertical = this.getColumnLine(x);
    vertical.forEach((cell) => {
      if (cell.type === "horizon") {
        temp.push(...this.horizonPang(cell.x, cell.y));
      }
      if (cell.type === "all") {
        temp.push(...this.allPang(cell.x, cell.y));
      }
      temp.push(cell);
    });
    return temp;
  }

  horizonPang(x: number, y: number) {
    const temp: Cell[] = [];
    this.map[y][x].type = "";
    this.map[y].forEach((cell) => {
      if (cell.type === "vertical") {
        temp.push(...this.verticalPang(cell.x, cell.y));
      }
      if (cell.type === "all") {
        temp.push(...this.allPang(cell.x, cell.y));
      }
      temp.push(cell);
    });
    return temp;
  }

  async allPangAndAutoFill(x: number, y: number) {
    this.scoreCalculator.turnCount();
    const temp = this.allPang(x, y);
    const removeDuplicated = [...new Set(temp)];
    this.logger.dir("allPangAndAutoFill").debug(removeDuplicated);
    removeDuplicated.forEach((cell) => {
      this.animalsPang[cell.type] += 1;
      this.questManager.questAmountUp(cell.type);
      cell.pang();
      this.scoreCalculator.scoreUp(
        cell.score /*  + (plusScore > 0 ? plusScore : 0) */
      );
    });
    return await this.autoPangAndFill();
  }

  async verticalPangAndAutoFill(x: number, y: number) {
    this.scoreCalculator.turnCount();
    const temp = this.verticalPang(x, y);
    const removeDuplicated = [...new Set(temp)];
    this.logger.dir("verticalPangAndAutoFill").debug(removeDuplicated);
    removeDuplicated.forEach((cell) => {
      this.animalsPang[cell.type] += 1;
      this.questManager.questAmountUp(cell.type);
      cell.pang();

      this.scoreCalculator.scoreUp(
        cell.score /*  + (plusScore > 0 ? plusScore : 0) */
      );
    });
    return await this.autoPangAndFill();
  }

  async horizonPangAndAutoFill(x: number, y: number) {
    this.scoreCalculator.turnCount();
    const temp = this.horizonPang(x, y);
    const removeDuplicated = [...new Set(temp)];
    this.logger.dir("horizonPangAndAutoFill").debug(removeDuplicated);
    removeDuplicated.forEach((cell) => {
      this.animalsPang[cell.type] += 1;
      this.questManager.questAmountUp(cell.type);
      cell.pang();

      this.scoreCalculator.scoreUp(
        cell.score /*  + (plusScore > 0 ? plusScore : 0) */
      );
    });
    return await this.autoPangAndFill();
  }
  /* version 3 features item */

  async autoPangAndFillInItem() {
    const rows = this.searchRowsAndFilterPangable();
    const columns = this.searchColumnsAndFilterPangable();
    this.logger.dir("getPangableList").debug(rows.length, columns.length);
    for (let i = 0; i < rows.length + columns.length; i++) {
      this.scoreCalculator.countUpCombo();
    }

    const pangableList = this.getPangableList();
    pangableList.forEach((cell) => {
      if (!cell.checkTypeItem()) {
        this.animalsPang[cell.type] += 1;
        this.questManager.questAmountUp(cell.type);
        cell.pang();
        this.scoreCalculator.scoreUp(cell.score);
      }
    });
    await this.searchEmptyColumnsAndFill();
    const isDone = this.getPangableList().length === 0;
    this.logger.dir("autoPangAndFill").log("isDone", isDone);
    if (!isDone) {
      return await this.autoPangAndFillInItem();
    }

    // mocking pangable lines
    const resultColumns = this.mockingPangableColumnLines();
    const resultRows = this.mockingPangableRowLines();

    this.logger
      .dir("autoPangAndFill")
      .dir("check mocking pangable")
      .debug(resultColumns || resultRows);
    if (resultColumns.length > 0 || resultRows.length > 0) {
      //
    } else {
      this.logger
        .dir("autoPangAndFill")
        .dir("check mocking pangable")
        .error("required reset game");
      if (
        !document.querySelector("#modal") &&
        !this.gameEnd &&
        resultColumns.length === 0 &&
        resultRows.length === 0
      ) {
        this.scoreCalculator.popupShuffleModal();
      }
    }

    return isDone;
  }

  async autoPangAndFill(loop: boolean = true) {
    const rows = this.searchRowsAndFilterPangable();
    const columns = this.searchColumnsAndFilterPangable();
    this.logger.dir("getPangableList").debug(rows.length, columns.length);
    for (let i = 0; i < rows.length + columns.length; i++) {
      this.scoreCalculator.countUpCombo();
    }

    const pangableList = this.getPangableList();

    // 채울 때 4개이상 동물 중간 아이템 셀로 교체
    [...rows, ...columns].forEach((group) => {
      if (group.length > OPTIONS.ITEM.MATCH_LIMIT) {
        //
        const groupMatched = group.every(
          (gp) => gp.originType === group[0].originType
        );
        if (groupMatched) {
          group[Math.floor(group.length / 2)].type =
            this.randomItemPickBasedOnPercentage(
              group[Math.floor(group.length / 2)].type
            );
        }
      }
    });

    this.logger
      .dir("searchEmptyColumnsAndFill")
      .log("rows columns", rows, columns);

    pangableList.forEach((cell) => {
      if (!cell.checkOriginTypeItem()) {
        const change = cell.checkTypeItem() ? cell.type : "";
        this.animalsPang[cell.type] += 1;
        this.questManager.questAmountUp(cell.type);
        cell.pang();
        if (change) {
          cell.type = change;
        }
        this.scoreCalculator.scoreUp(cell.score);
      }
    });

    await this.searchEmptyColumnsAndFill();

    const isDone = this.getPangableList().length === 0;
    // 3~ 라인
    this.logger.dir("autoPangAndFill").log("isDone", isDone);

    if (loop && !isDone) {
      return await this.autoPangAndFill();
    }

    // mocking pangable lines
    const resultColumns = this.mockingPangableColumnLines();
    const resultRows = this.mockingPangableRowLines();

    this.logger
      .dir("autoPangAndFill")
      .dir("check mocking pangable")
      .debug(resultColumns || resultRows);
    if (resultColumns.length > 0 || resultRows.length > 0) {
      //
    } else {
      this.logger
        .dir("autoPangAndFill")
        .dir("check mocking pangable")
        .error("required reset game");
      if (
        !document.querySelector("#modal") &&
        !this.gameEnd &&
        resultColumns.length === 0 &&
        resultRows.length === 0
      ) {
        this.scoreCalculator.popupShuffleModal();
      }
    }

    return isDone;
  }

  getHint() {
    // mocking pangable lines
    const resultColumns = this.mockingPangableColumnLines();
    const resultRows = this.mockingPangableRowLines();
    const resultItems = this.mockPangableItem();
    const groups = [...resultColumns, ...resultRows, ...resultItems];
    this.logger.dir("getHint").debug("groups", groups);
    const group = groups[Math.floor(Math.random() * groups.length)];
    // first group info
    if (resultColumns.length > 0 || resultRows.length > 0) {
      //
      group.forEach((cell) => {
        try {
          this.map[cell.y][cell.x].isHint = true;
        } catch (error) {
          //
        }
      });
    } else {
      this.logger
        .dir("autoPangAndFill")
        .dir("check mocking pangable")
        .error("required reset game");
    }
  }

  // new logic 2023-09-16 17:49:40
  async searchEmptyColumnsAndFill() {
    const promises: Promise<Cell[]>[] = [];

    for (let index = 0; index < OPTIONS.WIDTH.GAME.X; index++) {
      promises.push(this.fillColumn(index));
    }

    // 전체열 병렬 처리(처럼)하기 위함.
    return await Promise.all(promises);
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
            resolve(cell);
          });
        })
      );
    }
    return Promise.all(promises);
  }

  // all cell filter pangable by rows
  searchMockRowsAndFilterPangable(mockMap: Cell[][], round: number = 2) {
    const rowTemp: Cell[][] = [];
    for (const row of mockMap) {
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

        if (!cell.type.match(/^(vertical|horizon|all)$/g))
          rowTemp[rowTemp.length - 1].push(cell);
      }
      rowTemp.push([]);
    }
    const getPangRows = rowTemp.filter((row) => row.length > round);
    return getPangRows;
  }

  // all cell filter pangable by columns
  searchMockColumnsAndFilterPangable(mockMap: Cell[][], round: number = 2) {
    const columnTemp: Cell[][] = [];
    for (let index = 0; index < OPTIONS.WIDTH.GAME.X; index++) {
      const columns = this.getMockColumnLine(mockMap, index);
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

        if (!cell.type.match(/^(vertical|horizon|all)$/g))
          columnTemp[columnTemp.length - 1].push(cell);
      }
      columnTemp.push([]);
    }

    const getPangColumns = columnTemp.filter((column) => column.length > round);
    return getPangColumns;
  }

  // all cell filter pangable by rows
  searchRowsAndFilterPangable(round: number = 2) {
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

        // if (!cell.type.match(/^(vertical|horizon|all)$/g))
        rowTemp[rowTemp.length - 1].push(cell);
      }
      rowTemp.push([]);
    }
    const getPangRows = rowTemp.filter((row) => row.length > round);

    return getPangRows.filter(
      (group) =>
        // item stack score loop 방지
        !group[0].checkTypeItem() &&
        group.every((gp) => gp.type === group[0].type)
    );
  }

  // all cell filter pangable by columns
  searchColumnsAndFilterPangable(round: number = 2) {
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

    const getPangColumns = columnTemp.filter((column) => column.length > round);
    return getPangColumns.filter(
      (group) =>
        // item stack score loop 방지
        !group[0].checkTypeItem() &&
        group.every((gp) => gp.type === group[0].type)
    );
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

    return isDone;
  }

  async columnFillNewAnimals(x: number) {
    const yValue = OPTIONS.WIDTH.GAME.Y - 1;
    const [startPoint, emptyAmount] = this.getEmptyStartPointAndAmount(x);

    const columnLine = this.getColumnLine(x);
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
  }

  findEmptyCell(cells: Cell[]) {
    return cells.find((cell) => cell.type === "");
  }

  filterEmptyCell(cells: Cell[]) {
    return cells.filter((cell) => cell.type !== "");
  }

  fillNewCells(origin: Cell[], emptyAmount: number, x: number) {
    const tempEmptyAmount = emptyAmount;

    const temp: Cell[] = origin.map((cell) => {
      const copyCell = cell.deepCopySelf();

      return copyCell;
    });

    for (let index = 1; index <= tempEmptyAmount; index++) {
      const [type, score] = this.getRandomCellType();
      const copyCell = new Cell(type, x, 1 - index - 1, score);
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
    if (!this.dupRemove) return;
    for (const row of this.map) {
      for (const cell of row) {
        cell.render();
      }
    }
  }
}
