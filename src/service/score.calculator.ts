import Logger from "@src/util/logger";

export default class ScoreCalculator {
  logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("initialize").log("initialize");
  }

  render() {
  }
}
