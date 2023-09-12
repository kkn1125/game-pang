import { effectCtx, gameCtx, UNIT_SIZE } from "@src/util/global";
import cat from "@src/assets/animals/cat.png";
import dog from "@src/assets/animals/dog.png";
import lion from "@src/assets/animals/lion.png";
import duck from "@src/assets/animals/duck.png";
import mouse from "@src/assets/animals/mouse.png";
import rabbit from "@src/assets/animals/rabbit.png";
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

  getImage() {
    const img = document.createElement("img");
    switch (this.type) {
      case "cat":
        img.src = cat;
        break;
      case "dog":
        img.src = dog;
        break;
      case "lion":
        img.src = lion;
        break;
      case "duck":
        img.src = duck;
        break;
      case "mouse":
        img.src = mouse;
        break;
      case "rabbit":
        img.src = rabbit;
        break;
    }
    return img;
  }

  swap(target: Cell) {
    let resolver1: (value: unknown) => void;
    let resolver2: (value: unknown) => void;
    const promise1 = new Promise((resolve) => (resolver1 = resolve));
    const promise2 = new Promise((resolve) => (resolver2 = resolve));
    const selfX = this.x;
    const targetX = target.x;
    if (this.x > target.x) {
      const thisMove = setInterval(() => {
        target.x += 0.1;
        if (targetX >= this.x) {
          clearInterval(thisMove);
          target.x = selfX;
          resolver1(true);
        }
      }, 16);
      const targetMove = setInterval(() => {
        this.x -= 0.1;
        if (selfX <= target.x) {
          clearInterval(targetMove);
          this.x = targetX;
          resolver2(true);
        }
      }, 16);
    }
    return Promise.all([promise1, promise2]);
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
      this.getImage(),
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
    return new Cell(toCell.type, toCell.x, toCell.y, cell.score);
  }
}
