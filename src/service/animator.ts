import Logger from "@src/util/logger";
import BaseModule from "./base.moudle";

export default class Animator extends BaseModule {
  logger: Logger;

  constructor(mode: string) {
    super(mode);
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").log("initialize mode:", mode);
  }
}
