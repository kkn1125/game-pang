import Logger from "@src/util/logger";

export default class Animator {
  logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").log("initialize");
  }
}
