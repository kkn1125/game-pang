import Logger from "@src/util/logger";
import BaseModule from "./base.moudle";

type StoreType = {
  id: number;
  score: number;
  turn: number;
  username: string;
};

export default class StoreManager extends BaseModule {
  storeName: string;
  logger: Logger;
  store: StoreType[] = [];

  constructor(mode: string, storeName: string) {
    super(mode);
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").log("initialize mode:", mode);
    this.storeName = storeName || "pang_store";

    this.getData();
  }

  getLocalStorage() {
    return JSON.parse(localStorage.getItem(this.storeName) || "[]");
  }

  saveLocalStorage() {
    localStorage.setItem(this.storeName, JSON.stringify(this.store));
  }

  saveStore(data: StoreType[]) {
    this.store = data;
  }

  getStore() {
    return this.store;
  }

  getData() {
    const data = this.getLocalStorage();
    this.saveStore(data);
  }

  saveData(data: StoreType[]) {
    this.saveStore(data);
    this.saveLocalStorage();
  }

  addData(data: StoreType) {
    this.store.push(data);
    this.saveLocalStorage();
  }
}
