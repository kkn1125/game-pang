import { effectCtx, gameCtx, images, UNIT_SIZE } from "@src/util/global";
import Logger from "@src/util/logger";
import { responseBlockAxis, responsePointerAxis } from "@src/util/tool";

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
    // const srcX = this.x;
    // const srcY = this.y;
    // const dstX = dstCell.x;
    // const dstY = dstCell.y;

    // const sameY = dstY === srcY;
    // const sameX = dstX === srcX;
    // const gapX = Math.abs(dstX - srcX);
    // const gapY = Math.abs(dstY - srcY);

    // const isHorizontalMove = gapX === 1 && sameY;
    // const isVerticalMove = gapY === 1 && sameX;

    // if (!(isHorizontalMove || isVerticalMove)) {
    //   return null;
    // }
    this.logger.log(srcX, srcY, dstX, dstY);
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
          target.x += 0.1;
          this.x -= 0.1;
          if (targetX >= this.x && selfX <= target.x) {
            clearInterval(move);
            this.x = selfX;
            target.x = targetX;
            resolver(true);
          }
        }, 16);
        break;
      case "right":
        move = setInterval(() => {
          target.x -= 0.1;
          this.x += 0.1;
          if (targetX <= this.x && selfX >= target.x) {
            clearInterval(move);
            this.x = selfX;
            target.x = targetX;
            resolver(true);
          }
        }, 16);
        break;
      case "down":
        move = setInterval(() => {
          target.y -= 0.1;
          this.y += 0.1;
          if (targetY <= this.y && selfY >= target.y) {
            clearInterval(move);
            this.y = selfY;
            target.y = targetY;
            resolver(true);
          }
        }, 16);
        break;
      case "up":
        move = setInterval(() => {
          target.y += 0.1;
          this.y -= 0.1;
          if (targetY >= this.y && selfY <= target.y) {
            clearInterval(move);
            this.y = selfY;
            target.y = targetY;
            resolver(true);
          }
        }, 16);
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
    effectCtx.clearRect(0, 0, innerWidth, innerHeight);
    const [x, y] = responseBlockAxis(this.x * UNIT_SIZE, this.y * UNIT_SIZE);
    switch (type) {
      case "hover":
        effectCtx.fillStyle = "#56565656";
        break;
      case "select":
        effectCtx.fillStyle = "#ff000056";
        break;
    }
    effectCtx.fillRect(x, y, 50, 50);
  }

  render() {
    const [x, y] = responseBlockAxis(this.x, this.y);
    const image = images[this.type];
    if (image) {
      gameCtx.drawImage(
        image,
        this.x * UNIT_SIZE + Math.floor(x - this.x),
        this.y * UNIT_SIZE + Math.floor(y - this.y),
        50,
        50
      );
    } else {
      gameCtx.fillStyle = "#00000000";
      gameCtx.fillRect(
        this.x * UNIT_SIZE + Math.floor(x - this.x),
        this.y * UNIT_SIZE + Math.floor(y - this.y),
        UNIT_SIZE,
        UNIT_SIZE
      );
    }

    if (this.isSelected) {
      this.highlight("select");
    }
    if (this.isHover) {
      this.highlight("hover");
    }
  }
  renderOtherCanvas(ctx: CanvasRenderingContext2D) {
    const [x, y] = responseBlockAxis(this.x, this.y);
    const image = images[this.type];
    if (image) {
      ctx.drawImage(
        image,
        this.x * UNIT_SIZE + Math.floor(x - this.x),
        this.y * UNIT_SIZE + Math.floor(y - this.y),
        50,
        50
      );
    } else {
      ctx.fillStyle = "#00000000";
      ctx.fillRect(
        this.x * UNIT_SIZE + Math.floor(x - this.x),
        this.y * UNIT_SIZE + Math.floor(y - this.y),
        UNIT_SIZE,
        UNIT_SIZE
      );
    }

    if (this.isSelected) {
      this.highlight("select");
    }
    if (this.isHover) {
      this.highlight("hover");
    }
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
