import { scoreCtx } from "@src/util/global";
import Logger from "@src/util/logger";
import BaseModule from "./base.moudle";

export default class ScoreCalculator extends BaseModule {
  logger: Logger;
  scores: number = 0;

  constructor(mode: string) {
    super(mode);
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").log("initialize mode:", mode);
  }

  scoreUp(score: number) {
    this.scores += score;
    this.logger.dir("scoreUp").debug("get score", score);
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
  }
}
