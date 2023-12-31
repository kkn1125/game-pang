import {
  bgCtx,
  CELL_HOVER_COLOR,
  CELL_SELECTED_COLOR,
  effectCtx,
  gameCtx,
  images,
  OPTIONS,
  RESPONSIVE_UNIT_SIZE,
  selectCtx,
} from "@src/util/global";
import Logger from "@src/util/logger";
import { responseBlockAxis } from "@src/util/tool";

export type Direciton = "left" | "right" | "down" | "up" | null;

export default class Cell {
  static autoIncrement: number = 0;
  id: number;
  originType: string;
  type: string;
  x: number;
  y: number;
  scale: number;
  matched: boolean;
  isPang: boolean;
  score: number;
  isSelected: boolean;
  isHover: boolean;
  isInfo: boolean;
  isHint: boolean;

  logger: Logger;

  constructor(type: string, x: number, y: number, score: number) {
    this.id = Cell.autoIncrement;
    this.originType = type;
    this.type = type;
    this.x = x;
    this.y = y;
    this.scale = 1;
    this.matched = false;
    this.isPang = false;
    this.score = score;
    this.isSelected = false;
    this.isHover = false;
    this.isInfo = false;
    this.isHint = false;

    Cell.autoIncrement++;

    this.logger = new Logger("Cell");
  }

  getDirectionWith(dstCell: Cell) {
    const srcX = this.x;
    const srcY = this.y;
    const dstX = dstCell.x;
    const dstY = dstCell.y;
    // this.logger.dir("getDirectionWith").log(srcX, srcY, dstX, dstY);
    if (dstX > srcX) {
      // 오른쪽으로 스왑
      // this.logger.dir("getDirectionWith").log("오른쪽으로 스왑");
      return "right";
    }
    if (dstX < srcX) {
      // 왼쪽으로 스왑
      // this.logger.dir("getDirectionWith").log("왼쪽으로 스왑");
      return "left";
    }
    if (dstY > srcY) {
      // 아래쪽으로 스왑
      // this.logger.dir("getDirectionWith").log("아래쪽으로 스왑");
      return "down";
    }
    if (dstY < srcY) {
      // 위쪽으로 스왑
      // this.logger.dir("getDirectionWith").log("위쪽으로 스왑");
      return "up";
    }

    // this.logger
    //   .dir("getDirectionWith")
    //   .log(new Error("invalid both cell direction."));

    return null;
  }

  moveX(to: number) {
    let resolver: (value: unknown) => void;
    const promise = new Promise((resolve) => (resolver = resolve));
    const fromX = this.x;
    const toX = to;
    const direction = fromX !== to && fromX > to;
    const move = setInterval(() => {
      this.x +=
        fromX > to ? -OPTIONS.ANIMATION.SPEED / 2 : OPTIONS.ANIMATION.SPEED / 2;
      if (direction) {
        if (toX >= this.x) {
          clearInterval(move);
          resolver(true);
          this.x = fromX;
        }
      } else {
        if (toX <= this.x) {
          clearInterval(move);
          resolver(true);
          this.x = fromX;
        }
      }
    }, OPTIONS.ANIMATION.FRAME);
    return promise;
  }

  moveY(to: number): Promise<Cell> {
    let resolver: (value: Cell) => void;
    const promise: Promise<Cell> = new Promise(
      (resolve) => (resolver = resolve)
    );
    const fromY = this.y;
    const toY = to;
    const direction = fromY !== to && fromY > to;
    const move = setInterval(() => {
      this.y +=
        fromY > to ? -OPTIONS.ANIMATION.SPEED / 2 : OPTIONS.ANIMATION.SPEED / 2;
      if (direction) {
        if (toY >= this.y) {
          clearInterval(move);
          this.y = fromY;
          resolver(this);
        }
      } else {
        if (toY <= this.y) {
          clearInterval(move);
          this.y = fromY;
          resolver(this);
        }
      }
    }, OPTIONS.ANIMATION.FRAME);
    return promise;
  }

  scaleUp() {
    const LIMIT = 1.2;
    let resolver: (value: unknown) => void;
    const promise = new Promise((resolve) => (resolver = resolve));
    const animation = setInterval(() => {
      this.scale += 5 * OPTIONS.ANIMATION.SPEED ** 2;
      // console.log(this.scale);
      if (LIMIT < this.scale) {
        clearInterval(animation);
        resolver(true);
      }
    }, OPTIONS.ANIMATION.FRAME);
    return promise;
  }

  async zoomMotion() {
    await this.scaleUp();
  }

  swapEffect(target: Cell, direction: string) {
    let resolver: (value: unknown) => void;
    const promise = new Promise((resolve) => (resolver = resolve));
    // const selfX = this.x;
    // const selfY = this.y;
    // const targetX = target.x;
    // const targetY = target.y;
    // let move: number;
    switch (direction) {
      case "left":
      case "right":
        Promise.all([this.moveX(target.x), target.moveX(this.x)]).then(() => {
          resolver(true);
        });
        break;
      case "up":
      case "down":
        Promise.all([this.moveY(target.y), target.moveY(this.y)]).then(() => {
          resolver(true);
        });
        break;
      default:
        setTimeout(() => {
          resolver(false);
        }, 0);
        break;
    }
    this.logger
      .dir("swapEffect")
      .debug(`from ${this.type} to ${target.type} swapping...`);

    return promise;
  }

  pang() {
    // if (!this.checkTypeItem()) {
    this.type = "";
    this.isPang = true;
    // }
  }

  highlight(type: string) {
    const [x, y] = responseBlockAxis(
      this.x * RESPONSIVE_UNIT_SIZE(),
      this.y * RESPONSIVE_UNIT_SIZE()
    );
    switch (type) {
      case "hover":
        bgCtx.fillStyle = CELL_HOVER_COLOR + "56";
        break;
      case "select":
        bgCtx.fillStyle = CELL_SELECTED_COLOR + "56";
        break;
    }
    bgCtx.beginPath();
    bgCtx.roundRect(
      x,
      y,
      RESPONSIVE_UNIT_SIZE(),
      RESPONSIVE_UNIT_SIZE(),
      15
    );
    bgCtx.fill();
  }

  checkTypeItem() {
    return !!this.type.match(/^(all|horizon|vertical)$/g);
  }
  checkOriginTypeItem() {
    return !!this.originType.match(/^(all|horizon|vertical)$/g);
  }

  render() {
    const [x, y] = responseBlockAxis(this.x, this.y);
    const image = images[this.type] as HTMLImageElement;
    if (image) {
      gameCtx.imageSmoothingQuality = "low";
      gameCtx.imageSmoothingEnabled = true;
      gameCtx.drawImage(
        image,
        Math.floor(
          ((1 - this.scale) * RESPONSIVE_UNIT_SIZE()) / 2 +
            this.x * RESPONSIVE_UNIT_SIZE() +
            Math.floor(x - this.x)
        ),
        Math.floor(
          ((1 - this.scale) * RESPONSIVE_UNIT_SIZE()) / 2 +
            this.y * RESPONSIVE_UNIT_SIZE() +
            Math.floor(y - this.y)
        ),
        RESPONSIVE_UNIT_SIZE() * this.scale,
        RESPONSIVE_UNIT_SIZE() * this.scale
      );
      if (this.isInfo) {
        selectCtx.fillStyle = "green";
        selectCtx.font = "bold 10px Arial";
        selectCtx.fillText(
          `[${this.type}] ${Math.floor(this.x)}, ${Math.floor(this.y)}`,
          Math.floor(this.x * RESPONSIVE_UNIT_SIZE() + Math.floor(x - this.x)) +
            1,
          Math.floor(this.y * RESPONSIVE_UNIT_SIZE() + Math.floor(y - this.y)) +
            8
        );
        selectCtx.font = "";
        selectCtx.fillStyle = "#000000";
        selectCtx.strokeStyle = "#00000056";
        selectCtx.strokeRect(
          Math.floor(this.x * RESPONSIVE_UNIT_SIZE() + Math.floor(x - this.x)),
          Math.floor(this.y * RESPONSIVE_UNIT_SIZE() + Math.floor(y - this.y)),
          RESPONSIVE_UNIT_SIZE(),
          RESPONSIVE_UNIT_SIZE()
        );
        selectCtx.strokeStyle = "#000000";
      }
      if (this.isHint) {
        selectCtx.strokeStyle = "green";
        selectCtx.strokeRect(
          Math.floor(this.x * RESPONSIVE_UNIT_SIZE() + Math.floor(x - this.x)),
          Math.floor(this.y * RESPONSIVE_UNIT_SIZE() + Math.floor(y - this.y)),
          RESPONSIVE_UNIT_SIZE(),
          RESPONSIVE_UNIT_SIZE()
        );
        selectCtx.fillStyle = "#00ff0056";
        selectCtx.fillRect(
          Math.floor(this.x * RESPONSIVE_UNIT_SIZE() + Math.floor(x - this.x)),
          Math.floor(this.y * RESPONSIVE_UNIT_SIZE() + Math.floor(y - this.y)),
          RESPONSIVE_UNIT_SIZE(),
          RESPONSIVE_UNIT_SIZE()
        );
        selectCtx.strokeStyle = "#000000";
        selectCtx.fillStyle = "#000000";
      }
    } else {
      gameCtx.fillStyle = "#000000";

      // gameCtx.fillRect(
      //   this.x * RESPONSIVE_UNIT_SIZE() + Math.floor(x - this.x),
      //   this.y * RESPONSIVE_UNIT_SIZE() + Math.floor(y - this.y),
      //   RESPONSIVE_UNIT_SIZE(),
      //   RESPONSIVE_UNIT_SIZE()
      // );

      if (this.type === "horizon") {
        gameCtx.font = "bold 16px arial";
        gameCtx.fillText(
          "↔",
          this.x * RESPONSIVE_UNIT_SIZE() +
            Math.floor(x - this.x) +
            RESPONSIVE_UNIT_SIZE() / 2 -
            gameCtx.measureText("↔").width / 2,
          this.y * RESPONSIVE_UNIT_SIZE() +
            Math.floor(y - this.y) +
            8 +
            RESPONSIVE_UNIT_SIZE() / 2
        );
        gameCtx.font = "";
      }
      if (this.type === "vertical") {
        gameCtx.font = "bold 16px arial";
        gameCtx.fillText(
          "↕",
          this.x * RESPONSIVE_UNIT_SIZE() +
            Math.floor(x - this.x) +
            RESPONSIVE_UNIT_SIZE() / 2 -
            gameCtx.measureText("↕").width / 2,
          this.y * RESPONSIVE_UNIT_SIZE() +
            Math.floor(y - this.y) +
            8 +
            RESPONSIVE_UNIT_SIZE() / 2
        );
        gameCtx.font = "";
      }
    }

    if (this.isSelected) {
      this.highlight("select");

      // effectCtx.fillStyle = "#000000";
      // effectCtx.beginPath();
      // effectCtx.arc(
      //   Math.floor(this.x * RESPONSIVE_UNIT_SIZE() + Math.floor(x - this.x)) +
      //     RESPONSIVE_UNIT_SIZE() / 2,
      //   Math.floor(this.y * RESPONSIVE_UNIT_SIZE() + Math.floor(y - this.y)) +
      //     RESPONSIVE_UNIT_SIZE() / 2,
      //   (RESPONSIVE_UNIT_SIZE() / 2) * this.scale * 0.95,
      //   0,
      //   2 * Math.PI
      // );
      // effectCtx.lineWidth = 3;
      // effectCtx.stroke();
      // gameCtx.shadowBlur = 1;
      // gameCtx.shadowColor = "black";
    }
    // if (this.isHover) {
    //   this.highlight("hover");
    // }
  }

  renderOtherCanvas(ctx: CanvasRenderingContext2D) {
    const [x, y] = responseBlockAxis(this.x, this.y);
    const image = images[this.type];
    if (image) {
      ctx.drawImage(
        image,
        this.x * RESPONSIVE_UNIT_SIZE() + Math.floor(x - this.x),
        this.y * RESPONSIVE_UNIT_SIZE() + Math.floor(y - this.y),
        RESPONSIVE_UNIT_SIZE(),
        RESPONSIVE_UNIT_SIZE()
      );
    } else {
      ctx.fillStyle = "#00000000";
      ctx.fillRect(
        this.x * RESPONSIVE_UNIT_SIZE() + Math.floor(x - this.x),
        this.y * RESPONSIVE_UNIT_SIZE() + Math.floor(y - this.y),
        RESPONSIVE_UNIT_SIZE(),
        RESPONSIVE_UNIT_SIZE()
      );
    }

    // if (this.isSelected) {
    //   this.highlight("select");
    // }
    // if (this.isHover) {
    //   this.highlight("hover");
    // }
  }

  static copy(cell: Cell, toCell: Cell) {
    return new Cell(cell.type, toCell.x, toCell.y, cell.score);
  }

  static is(srcCell: Cell, dstCell: Cell) {
    try {
      const { x: x1, y: y1 } = srcCell;
      const { x: x2, y: y2 } = dstCell;
      return x1 === x2 && y1 === y2;
    } catch (error) {
      return false;
    }
  }

  deepCopySelf() {
    const type = this.originType;
    const newCell = new Cell(this.type, this.x, this.y, this.score);
    newCell.originType = type;
    return newCell;
  }

  deepCopy(cell: Cell) {
    return new Cell(cell.type, cell.x, cell.y, cell.score);
  }

  deepCopyWithAxis(cell: Cell, x: number, y: number) {
    return new Cell(cell.type, x, y, cell.score);
  }
}
