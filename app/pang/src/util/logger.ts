import chalk from "chalk";
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
      `(${time})`,
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
    if (MODE !== "development") return () => {};

    const values = this._logger.log.bind(
      window.console,
      ...this.convert("yellowBright")
    );
    this.clearDir();
    return values;
  }

  get debug() {
    if (MODE !== "development") return () => {};

    const values = this._logger.log.bind(
      window.console,
      ...this.convert("blueBright")
    );
    this.clearDir();
    return values;
  }

  get error() {
    if (MODE !== "development") return () => {};

    const values = this._logger.log.bind(
      window.console,
      ...this.convert("redBright")
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
