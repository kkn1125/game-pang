import { isMobile, OPTIONS, scoreCtx } from "@src/util/global";
import Logger from "@src/util/logger";
import BaseModule from "./base.moudle";

export default class ScoreCalculator extends BaseModule {
  logger: Logger;
  hint: number = OPTIONS.GAME.HINT;
  scores: number = 0;
  turn: number = 0;
  combo: number = 0;
  scoreIncrementRatioByCombo: number = 1;

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
    this.scores += score * this.scoreIncrementRatioByCombo;
    this.logger.dir("scoreUp").debug("get score", score);
  }

  turnUp(turn: number = 0) {
    this.turn += turn;
  }

  turnCount() {
    this.logger.dir("turnCount").debug("count minus", this.turn);
    this.turn -= 1;
  }

  countUpCombo() {
    this.combo += 1;
    this.logger.dir("countUpCombo").debug("count up combo", this.combo);
  }

  showHint() {
    this.hint -= 1;
  }

  calculateScoreIncrementRatioByCombo() {
    if (this.combo < 10) {
      this.scoreIncrementRatioByCombo = 1;
    } else if (this.combo < 30 && this.combo >= 10) {
      this.scoreIncrementRatioByCombo = 2;
    } else if (this.combo < 50 && this.combo >= 30) {
      this.scoreIncrementRatioByCombo = 3;
    } else if (this.combo < 70 && this.combo >= 50) {
      this.scoreIncrementRatioByCombo = 4;
    } else if (this.combo < 90 && this.combo >= 70) {
      this.scoreIncrementRatioByCombo = 5;
    } else if (this.combo >= 90) {
      this.scoreIncrementRatioByCombo = 6;
    }
  }

  resetHints() {
    this.hint = OPTIONS.GAME.HINT;
  }
  resetTurns() {
    this.turn = OPTIONS.GAME.TURN;
  }
  resetScores() {
    this.scores = 0;
  }
  resetCombos() {
    this.combo = 0;
    this.scoreIncrementRatioByCombo = 1;
    this.logger.dir("resetCombo").debug("reset combo", this.combo);
  }

  minusCombo(combo: number) {
    this.combo -= combo;
  }

  divideCombo() {
    this.combo = Math.floor(this.combo / 2);
  }

  popupEndModal() {
    const wrap = document.createElement("div");
    wrap.id = "modal";

    wrap.innerHTML = `
      <div class="modal-head">
        <span>
        알림
        </span>
        <button id="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        아쉽지만 턴이 끝났습니다 🥲
        <br />
        새 게임을 시작하시겠습니까?
        <br />
        <br />
        <button id="newGame">✨ 새로운 게임</button>
      </div>
    `;

    document.body.append(wrap);
  }

  popupShuffleModal() {
    const wrap = document.createElement("div");
    wrap.id = "modal";

    wrap.innerHTML = `
      <div class="modal-head">
        <span>
        알림
        </span>
        <button id="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        일치 가능한 동물이 없습니다. 동물을 재배치 합니다.
        <br />
        <br />
        <button id="refreshGame">✨ 재배치</button>
      </div>
    `;

    document.body.append(wrap);
  }

  render() {
    this.calculateScoreIncrementRatioByCombo();

    scoreCtx.font = "bold 16px Arial";
    scoreCtx.textAlign = "left";
    scoreCtx.fillStyle = "#000000";
    const scoreText = `score: ${this.scores} Point${
      this.scores > 1 ? "s" : ""
    }  Hint: ${this.hint}`;
    scoreCtx.fillText(scoreText, 50, 50 - (isMobile() ? 20 : 0));
    if (this.turn > 5 && this.turn < 10) {
      scoreCtx.fillStyle = "#ffff00";
    } else if (this.turn <= 5) {
      scoreCtx.fillStyle = "#ff0000";
    }
    const turnText = `turn: ${this.turn} Turn${this.turn > 1 ? "s" : ""}`;
    scoreCtx.fillText(turnText, 50, 70 - (isMobile() ? 20 : 0));

    scoreCtx.fillText(
      `Combo: ${this.combo}`,
      scoreCtx.measureText(turnText).width + 50 + 10,
      70 - (isMobile() ? 20 : 0)
    );
  }
}
