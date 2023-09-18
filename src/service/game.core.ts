import Quest from "@src/model/quest";
import {
  bgCanvas,
  bgCtx,
  effectCanvas,
  effectCtx,
  gameCanvas,
  gameCtx,
  OPTIONS,
  questCanvas,
  questCtx,
  RESPONSIVE_UNIT_SIZE,
  ROOT,
  RUN_MODE,
  scoreCanvas,
  scoreCtx,
  selectCanvas,
  selectCtx,
  SUB_OPTIONS,
  wait,
} from "@src/util/global";
import Logger from "@src/util/logger";
import Animator from "./animator";
import BaseModule from "./base.moudle";
import BlockManager from "./block.manager";
import MapGenerator from "./map.generator";
import Pointer from "./pointer";
import QuestManager from "./quest.manager";
import ScoreCalculator from "./score.calculator";
import StoreManager from "./store.manager";

export default class GameCore extends BaseModule {
  seek: number = 0;
  blockManager: BlockManager;
  animator: Animator;
  mapGenerator: MapGenerator;
  scoreCalculator: ScoreCalculator;
  storeManager: StoreManager;
  pointer: Pointer;
  questManager: QuestManager;
  logger: Logger;

  canvases: HTMLCanvasElement[] = [];

  gameEnd: boolean = false;

  _dev: boolean;
  _runMode: string;
  _baseWidth: number = innerWidth;
  _baseHeight: number = innerHeight;
  _storeName: string;
  _animation: number;

  questQueue: Quest[] = [];

  constructor() {
    super(RUN_MODE);
    // RUN_MODE === "test" && LOG_BLOCK.push(0);
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").debug("dev", this._dev);
    this.logger.dir("constructor").debug("run mode", this._runMode);
    this.logger.dir("constructor").log("setup game core...");

    window.addEventListener("click", this.handleNewGame.bind(this));
  }

  initialCommitQuestInQueue() {
    while (this.questQueue.length > 0) {
      const quest = this.questQueue.pop();
      if (quest) {
        this.questManager.addQuest(quest);
      }
    }
  }

  newGame() {
    this.gameEnd = false;
    // this.stopRender();
    // this.initialize();
    // this.render();
    const map = this.blockManager.initialize();
    this.mapGenerator.initialize(map);
    this.scoreCalculator.turn = OPTIONS.GAME.TURN;
    this.scoreCalculator.scores = 0;
    this.blockManager.animalsPang = {
      cat: 0,
      dog: 0,
      lion: 0,
      duck: 0,
      mouse: 0,
      rabbit: 0,
      panda: 0,
      pig: 0,
      racoon: 0,
    };

    setTimeout(() => {
      this.execInitialPang();
    }, 16);
  }

  stopRender() {
    cancelAnimationFrame(this._animation);
  }

  handleNewGame(e: MouseEvent) {
    const target = e.target as HTMLButtonElement;

    if (wait.length > 0 && target && target.id === "newGame") {
      this.newGame();
      window.removeEventListener("click", this.handleNewGame.bind(this));
      // target.parentElement?.parentElement?.remove();
      // console.log(target);
      wait.splice(0);
      setTimeout(() => {
        document.querySelectorAll("#modal").forEach((modal) => modal.remove());
      }, 10);
    } else if (target && target.id === "modal-close") {
      // this.newGame();
      // window.removeEventListener("click", this.handleNewGame.bind(this));
      // wait.splice(0);
      document.querySelectorAll("#modal").forEach((modal) => modal.remove());
    }
    document.querySelectorAll("#modal").forEach((modal) => modal.remove());
  }

  setOption(property: string, value: string | number | boolean) {
    if (`_${property}` in this) {
      this.logger
        .dir("setOption")
        .log(`success set option, property: ${property}, value: ${value}`);
      this[`_${property}`] = value;
    } else {
      throw new Error(`${property} is not a valid property`);
    }
  }

  initialize() {
    this.logger.dir("initialize").log("initialize");
    this.loadModules();

    this.initialCommitQuestInQueue();

    this.setupCanvas(
      bgCanvas,
      gameCanvas,
      effectCanvas,
      scoreCanvas,
      selectCanvas,
      questCanvas
    );
    this.injection();

    const map = this.blockManager.initialize();
    this.mapGenerator.initialize(map);
  }

  autoQuests() {
    this.questManager.autoQuests();
  }

  loadModules() {
    this.logger.dir("loadModules").log("start...");
    this.scoreCalculator = new ScoreCalculator(this.mode);
    this.questManager = new QuestManager(this.mode);
    this.blockManager = new BlockManager(
      this.mode,
      this.scoreCalculator,
      this.questManager
    );
    this.questManager.animalsPang = this.blockManager.animalsPang;
    this.animator = new Animator(this.mode);
    this.mapGenerator = new MapGenerator(this.mode);
    this.pointer = new Pointer(this.mode);
    this.storeManager = new StoreManager(this.mode, this._storeName);
    this.logger.dir("loadModules").log("success!");
  }

  setupCanvas(...canvases: HTMLCanvasElement[]) {
    this.canvases = canvases;
    this.logger.dir("setupCanvas").log("setup canvas elements");
    for (const canvas of canvases) {
      this.logger.dir("setupCanvas").log(`add ${canvas.id} canvas`);
      ROOT.append(canvas);
    }

    this.handleResizeCanvasSize();
    this.logger.dir("setupCanvas").log("add event window resize detect");
    window.addEventListener("resize", this.handleResizeCanvasSize.bind(this));
  }

  handleResizeCanvasSize = () => {
    this.logger
      .dir("setupCanvas")
      .dir("handleResizeCanvasSize")
      .log(`resize all canvas`);
    for (const canvas of this.canvases) {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
      this.logger
        .dir("handleResizeCanvasSize")
        .dir("if")
        .debug(this._baseWidth, innerWidth, RESPONSIVE_UNIT_SIZE());
      if (innerWidth <= 280) {
        SUB_OPTIONS.SIZE.RATIO = -25;
      } else if (innerWidth <= 375) {
        SUB_OPTIONS.SIZE.RATIO = -15;
      } else if (innerWidth <= 390) {
        SUB_OPTIONS.SIZE.RATIO = -14;
      } else if (innerWidth <= 393) {
        SUB_OPTIONS.SIZE.RATIO = -15;
      } else if (innerWidth <= 414) {
        SUB_OPTIONS.SIZE.RATIO = -12;
      } else if (innerWidth <= 540) {
        SUB_OPTIONS.SIZE.RATIO = -3;
      } else if (innerWidth <= 820) {
        SUB_OPTIONS.SIZE.RATIO = 15;
      } else if (innerWidth <= 1024) {
        SUB_OPTIONS.SIZE.RATIO = 5;
      } else if (innerWidth <= 1280) {
        SUB_OPTIONS.SIZE.RATIO = 6;
      } else {
        SUB_OPTIONS.SIZE.RATIO = 5;
      }
    }
  };

  injection() {
    this.pointer.inject(this.blockManager);
    this.pointer.inject(this.mapGenerator);
    this.pointer.inject(this.scoreCalculator);
    this.questManager.inject(this.blockManager);
    this.questManager.inject(this.scoreCalculator);
  }

  animation(time: number) {
    this.clearRect();
    const milliseconds = time;
    time *= 0.001;

    // if (Math.floor(milliseconds) % 60 === 0) {
    // timer zone
    // this.renderPerSecond.call(this);
    // console.log("map check", this.blockManager.map);
    // }
    if (wait.length === 0 && !this.gameEnd && this.scoreCalculator.turn === 0) {
      wait.push(0);
      this.gameEnd = true;
      this.scoreCalculator.popupEndModal();
    }

    if (Math.floor(time) !== this.seek) {
      // console.log(
      //   "this.blockManager.animalsPang",
      //   this.blockManager.animalsPang
      // );
      // console.log(
      //   "this.questManager.animalsPang",
      //   this.questManager.animalsPang
      // );
    }

    this.scoreCalculator.render();
    this.mapGenerator.render();
    this.blockManager.render();
    this.questManager.render();

    bgCtx.restore();
    scoreCtx.restore();
    gameCtx.restore();
    selectCtx.restore();
    effectCtx.restore();
    questCtx.restore();

    this._animation = requestAnimationFrame(this.animation.bind(this));

    this.seek = Math.floor(time);
  }

  clearRect() {
    bgCtx.clearRect(0, 0, innerWidth, innerHeight);
    scoreCtx.clearRect(0, 0, innerWidth, innerHeight);
    gameCtx.clearRect(0, 0, innerWidth, innerHeight);
    effectCtx.clearRect(0, 0, innerWidth, innerHeight);
    selectCtx.clearRect(0, 0, innerWidth, innerHeight);
    questCtx.clearRect(0, 0, innerWidth, innerHeight);

    bgCtx.save();
    scoreCtx.save();
    gameCtx.save();
    effectCtx.save();
    selectCtx.save();
    questCtx.save();
  }

  render() {
    this.logger.dir("render").log("start game core rendering...");

    this.logger.dir("render").log("start calulator rendering...");
    this.logger.dir("render").log("start game map rendering...");
    this.logger.dir("render").log("start block rendering...");

    setTimeout(() => {
      this.execInitialPang();
    }, 1000);

    this._animation = requestAnimationFrame(this.animation.bind(this));
  }

  execInitialPang() {
    // start detect pang lines
    if (this.mode !== "test") {
      if (wait.length === 0) {
        wait.push(0);
        this.blockManager.autoPangAndFill().then(() => {
          wait.pop();
        });
      }
    }
  }

  renderPerSecond() {
    // console.log("hello");
  }
}
