import chalk from "chalk";
import { MODE } from "./global";

export default class Logger {
  name: string = "SYS";
  _logger = console;
  directories: string[] = [];

  constructor(name: string) {
    this.name = name;
  }

  convert(color: string, ...data: any[]) {
    if(MODE !== 'development') return;
    const time = new Date().toLocaleTimeString("ko");
    this._logger.log(
      chalk[color](
        `[${this.name}]`/* .padEnd(17, " ") */ + " >",
        chalk.greenBright(...this.directories.map(this.reform))
      ),
      ...data,
      `(${time})`
    );
  }

  reform(str: string) {
    return `[${str}] >`;
  }

  dir(dir: string) {
    this.directories.push(dir);
    return this;
  }

  log(...data: any[]) {
    this.convert("yellowBright", ...data);
    this.clearDir();
  }
  debug(...data: any[]) {
    this.convert("blueBright", ...data);
    this.clearDir();
  }
  error(...data: any[]) {
    this.convert("redBright", ...data);
    this.clearDir();
  }

  clearDir() {
    this.directories = [];
  }
}
