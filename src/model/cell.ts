import {
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
  type: string;
  x: number;
  y: number;
  matched: boolean;
  isPang: boolean;
  score: number;
  isSelected: boolean;
  isHover: boolean;

  logger: Logger;

  constructor(type: string, x: number, y: number, score: number) {
    this.id = Cell.autoIncrement;
    this.type = type;
    this.x = x;
    this.y = y;
    this.matched = false;
    this.isPang = false;
    this.score = score;
    this.isSelected = false;
    this.isHover = false;

    Cell.autoIncrement++;

    this.logger = new Logger("Cell");
  }

  getDirectionWith(dstCell: Cell) {
    const srcX = this.x;
    const srcY = this.y;
    const dstX = dstCell.x;
    const dstY = dstCell.y;
    this.logger.dir("getDirectionWith").log(srcX, srcY, dstX, dstY);
    if (dstX > srcX) {
      // 오른쪽으로 스왑
      this.logger.dir("getDirectionWith").log("오른쪽으로 스왑");
      return "right";
    }
    if (dstX < srcX) {
      // 왼쪽으로 스왑
      this.logger.dir("getDirectionWith").log("왼쪽으로 스왑");
      return "left";
    }
    if (dstY > srcY) {
      // 아래쪽으로 스왑
      this.logger.dir("getDirectionWith").log("아래쪽으로 스왑");
      return "down";
    }
    if (dstY < srcY) {
      // 위쪽으로 스왑
      this.logger.dir("getDirectionWith").log("위쪽으로 스왑");
      return "up";
    }

    this.logger
      .dir("getDirectionWith")
      .log(new Error("invalid both cell direction."));

    return null;
  }

  swapEffect(target: Cell, direction: string) {
    let resolver: (value: unknown) => void;
    const promise = new Promise((resolve) => (resolver = resolve));
    const selfX = this.x;
    const selfY = this.y;
    const targetX = target.x;
    const targetY = target.y;
    let move: number;
    switch (direction) {
      case "left":
        move = setInterval(() => {
          target.x += OPTIONS.ANIMATION.SPEED / 2;
          this.x -= OPTIONS.ANIMATION.SPEED / 2;
          if (targetX >= this.x && selfX <= target.x) {
            clearInterval(move);
            this.x = selfX;
            target.x = targetX;
            resolver(true);
          }
        }, OPTIONS.ANIMATION.FRAME);
        break;
      case "right":
        move = setInterval(() => {
          target.x -= OPTIONS.ANIMATION.SPEED / 2;
          this.x += OPTIONS.ANIMATION.SPEED / 2;
          if (targetX <= this.x && selfX >= target.x) {
            clearInterval(move);
            this.x = selfX;
            target.x = targetX;
            resolver(true);
          }
        }, OPTIONS.ANIMATION.FRAME);
        break;
      case "down":
        move = setInterval(() => {
          target.y -= OPTIONS.ANIMATION.SPEED / 2;
          this.y += OPTIONS.ANIMATION.SPEED / 2;
          if (targetY <= this.y && selfY >= target.y) {
            clearInterval(move);
            this.y = selfY;
            target.y = targetY;
            resolver(true);
          }
        }, OPTIONS.ANIMATION.FRAME);
        break;
      case "up":
        move = setInterval(() => {
          target.y += OPTIONS.ANIMATION.SPEED / 2;
          this.y -= OPTIONS.ANIMATION.SPEED / 2;
          if (targetY >= this.y && selfY <= target.y) {
            clearInterval(move);
            this.y = selfY;
            target.y = targetY;
            resolver(true);
          }
        }, OPTIONS.ANIMATION.FRAME);
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
    this.type = "";
    this.isPang = true;
  }

  highlight(type: string) {
    const [x, y] = responseBlockAxis(
      this.x * RESPONSIVE_UNIT_SIZE(),
      this.y * RESPONSIVE_UNIT_SIZE()
    );
    switch (type) {
      case "hover":
        selectCtx.fillStyle = "#56565656";
        break;
      case "select":
        selectCtx.fillStyle = "#48c46e56";
        break;
    }
    selectCtx.fillRect(x, y, RESPONSIVE_UNIT_SIZE(), RESPONSIVE_UNIT_SIZE());
  }

  render() {
    const [x, y] = responseBlockAxis(this.x, this.y);
    const image = images[this.type];
    if (image) {
      gameCtx.imageSmoothingQuality = "low";
      gameCtx.imageSmoothingEnabled = true;
      gameCtx.drawImage(
        image,
        Math.floor(this.x * RESPONSIVE_UNIT_SIZE() + Math.floor(x - this.x)),
        Math.floor(this.y * RESPONSIVE_UNIT_SIZE() + Math.floor(y - this.y)),
        RESPONSIVE_UNIT_SIZE(),
        RESPONSIVE_UNIT_SIZE()
      );
    } else {
      gameCtx.fillStyle = "#00000000";
      gameCtx.fillRect(
        this.x * RESPONSIVE_UNIT_SIZE() + Math.floor(x - this.x),
        this.y * RESPONSIVE_UNIT_SIZE() + Math.floor(y - this.y),
        RESPONSIVE_UNIT_SIZE(),
        RESPONSIVE_UNIT_SIZE()
      );
    }

    if (this.isSelected) {
      this.highlight("select");
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

  deepCopySelf() {
    return new Cell(this.type, this.x, this.y, this.score);
  }

  deepCopy(cell: Cell) {
    return new Cell(cell.type, cell.x, cell.y, cell.score);
  }

  deepCopyWithAxis(cell: Cell, x: number, y: number) {
    return new Cell(cell.type, x, y, cell.score);
  }
}
