import chalk from "chalk";
import BaseLogger from "./base.logger";
import { LOG_BLOCK, MODE } from "./global";

export default class Logger {
  name: string = "SYS";
  _logger = console;
  directories: string[] = [];

  constructor(name: string) {
    this.name = name;
  }

  convert(color: string, ...data: any[]) {
    if (MODE !== "development") return [];
    if (LOG_BLOCK.length > 0 && !this.name.includes("only")) {
      return [];
    }

    const time = new Date().toLocaleTimeString("ko");
    return [
      chalk[color](
        `[${this.name}]` /* .padEnd(17, " ") */ + " >",
        chalk.greenBright(...this.directories.map(this.reform))
      ),
    ];
  }

  only = () => {
    const logger = new Logger(this.name + ":only");
    return logger;
  };

  reform(str: string) {
    return `[${str}] >`;
  }

  dir(dir: string) {
    this.directories.push(dir);
    return this;
  }

  get log() {
    const time = new Date().toLocaleTimeString("ko");
    const values = this._logger.log.bind(
      window.console,
      ...this.convert("yellowBright"),
      `(${time})`
    );
    this.clearDir();
    return values;
  }

  get debug() {
    const time = new Date().toLocaleTimeString("ko");
    const values = this._logger.log.bind(
      window.console,
      ...this.convert("blueBright"),
      `(${time})`
    );
    this.clearDir();
    return values;
  }

  get error() {
    const time = new Date().toLocaleTimeString("ko");
    const values = this._logger.log.bind(
      window.console,
      ...this.convert("redBright"),
      `(${time})`
    );
    this.clearDir();
    return values;
  }

  // log(...data: any[]) {
  //   this._logger.log.bind(
  //     window.console,
  //     ...this.convert("yellowBright", ...data)
  //   )();
  //   this.clearDir();
  // }
  // debug(...data: any[]) {
  //   this.convert("blueBright", ...data);
  //   this.clearDir();
  // }
  // error(...data: any[]) {
  //   this.convert("redBright", ...data);
  //   this.clearDir();
  // }

  clearDir() {
    this.directories = [];
  }
}
