import { OPTIONS, scoreCtx } from "@src/util/global";
import Logger from "@src/util/logger";
import BaseModule from "./base.moudle";

export default class ScoreCalculator extends BaseModule {
  logger: Logger;
  scores: number = 0;
  turn: number = 0;

  constructor(mode: string) {
    super(mode);
    if (mode === "none") {
      this.turn = OPTIONS.GAME.TURN;
    } else if (mode === "test") {
      this.turn = Infinity;
    }
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").log("initialize mode:", mode);
  }

  scoreUp(score: number) {
    this.scores += score;
    this.logger.dir("scoreUp").debug("get score", score);
  }

  turnCount() {
    this.logger.dir("turnCount").debug("count minus", this.turn);
    this.turn -= 1;
  }

  popupEndModal() {
    const wrap = document.createElement("div");
    wrap.id = "modal";

    wrap.innerHTML = `
      <div class="modal-head">
        <span>
        Modal
        </span>
        <button id="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <!--새 게임을 시작하시겠습니까?-->
        <button id="newGame">New Game</button>
      </div>
    `;

    document.body.append(wrap);
  }

  render() {
    scoreCtx.font = "bold 16px Arial";
    scoreCtx.textAlign = "left";
    scoreCtx.fillStyle = "#000000";
    scoreCtx.fillText(
      `score: ${this.scores} point${this.scores > 1 ? "s" : ""}`,
      50,
      50
    );
    if (this.turn > 5 && this.turn < 10) {
      scoreCtx.fillStyle = "#ffff00";
    } else if (this.turn <= 5) {
      scoreCtx.fillStyle = "#ff0000";
    }
    scoreCtx.fillText(
      `turn: ${this.turn} turn${this.scores > 1 ? "s" : ""}`,
      50,
      70
    );
  }
}
