import { effectCtx, gameCtx, images, UNIT_SIZE } from "@src/util/global";
import { responseBlockAxis, responsePointerAxis } from "@src/util/tool";

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
  }

  swap(target: Cell) {
    let resolver: (value: unknown) => void;
    const promise = new Promise((resolve) => (resolver = resolve));
    const selfX = this.x;
    const targetX = target.x;
    if (this.x > target.x) {
      const move = setInterval(() => {
        target.x += 0.1;
        this.x -= 0.1;
        if (targetX >= this.x && selfX <= target.x) {
          clearInterval(move);
          this.x = targetX;
          target.x = selfX;
          resolver(true);
        }
      }, 16);
    }
    return promise;
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

    gameCtx.drawImage(
      images[this.type],
      this.x * UNIT_SIZE + Math.floor(x - this.x),
      this.y * UNIT_SIZE + Math.floor(y - this.y),
      50,
      50
    );

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
}
