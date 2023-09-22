import Cell from "@src/model/cell";
import Quest from "@src/model/quest";
import {
  bgCanvas,
  bgCtx,
  effectCanvas,
  effectCtx,
  gameCanvas,
  gameCtx,
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

  // hintQueue: Promise<Cell>[][] = [];
  // hintQueue: Cell[][] = [];

  constructor() {
    super(RUN_MODE);
    // RUN_MODE === "test" && LOG_BLOCK.push(0);
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").debug("dev", this._dev);
    this.logger.dir("constructor").debug("run mode", this._runMode);
    this.logger.dir("constructor").log("setup game core...");

    window.addEventListener("click", this.handleNewGame.bind(this));
    this.createNewGameButton();
  }

  initialCommitQuestInQueue() {
    while (this.questQueue.length > 0) {
      const quest = this.questQueue.pop();
      if (quest) {
        this.questManager.addQuest(quest);
      }
    }
  }

  showHint() {
    const hintTemp: Cell[] = [];
    if (this.scoreCalculator.hint > 0) {
      this.scoreCalculator.showHint();
      this.blockManager.getHint();
      this.blockManager.map.flat(1).forEach((cell) => {
        if (cell.isHint) {
          hintTemp.push(cell);
        }
      });
      document
        .querySelectorAll("#hintingGame")
        .forEach((el) => ((el as HTMLButtonElement).disabled = true));
    }
    if (this.scoreCalculator.hint === 0) {
      document
        .querySelectorAll("#hintingGame")
        .forEach((el) => ((el as HTMLButtonElement).disabled = true));
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        hintTemp.forEach((cell) => (cell.isHint = false));
        resolve(true);

        if (this.scoreCalculator.hint === 0) {
          document
            .querySelectorAll("#hintingGame")
            .forEach((el) => ((el as HTMLButtonElement).disabled = true));
        } else {
          document
            .querySelectorAll("#hintingGame")
            .forEach((el) => ((el as HTMLButtonElement).disabled = false));
        }
      }, 3000);
    });
  }

  async refreshGame(force: boolean = false) {
    this.gameEnd = false;
    this.pointer.gameEnd = false;

    const score = this.scoreCalculator.scores;
    const turn = this.scoreCalculator.turn;
    const combo = this.scoreCalculator.combo;
    const quests = this.questManager.quests.map((q) => {
      const qst = Quest.createQuest({
        title: q.title,
        content: q.content,
        score: q.result.score,
        turn: q.result.turn,
        type: q.condition.type,
        amount: q.condition.amount,
      });
      qst.currentAmount = q.currentAmount;
      return qst;
    });

    const map = await this.blockManager.initialize(force);
    this.mapGenerator.initialize(map);

    this.blockManager.resetScore();
    this.blockManager.resetQuest();

    this.scoreCalculator.scores = score;
    this.scoreCalculator.turn = turn;
    this.scoreCalculator.combo = combo;
    this.questManager.quests = quests;

    setTimeout(() => {
      this.execInitialPang();
    }, 16);
  }

  resetScore() {
    this.scoreCalculator.resetCombos();
    this.scoreCalculator.resetScores();
    this.scoreCalculator.resetTurns();
    this.scoreCalculator.resetHints();
  }

  resetQuest() {
    this.questManager.resetQuest();
  }

  async newGame(force: boolean = false) {
    this.gameEnd = false;
    this.pointer.gameEnd = false;
    this.blockManager.gameEnd = false;
    const map = await this.blockManager.initialize(force);
    this.mapGenerator.initialize(map);
    this.resetScore();
    this.resetQuest();
    this.autoQuests();
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
    document
      .querySelectorAll("#hintingGame")
      .forEach((el) => ((el as HTMLButtonElement).disabled = false));
    setTimeout(() => {
      this.execInitialPang();
    }, 16);
  }

  stopRender() {
    cancelAnimationFrame(this._animation);
  }

  createNewGameButton() {
    const wrap = document.createElement("div");
    wrap.id = "btnWrap";

    const button = document.createElement("button");
    button.id = "restartGame";
    button.innerText = "✨ 새로운 게임";
    // const button2 = document.createElement("button");
    // button2.id = "refreshGame";
    // button2.innerText = "♻️ 재배치";
    const button3 = document.createElement("button");
    button3.id = "hintingGame";
    button3.innerText = "🔎 힌트";

    wrap.append(button3, /* button2, */ button);
    document.body.append(wrap);
  }

  async handleNewGame(e: MouseEvent) {
    const target = e.target as HTMLButtonElement;

    if (target && target.id.match(/^(newGame|restartGame)/)) {
      await this.newGame(true);
      this.gameEnd = false;
      window.removeEventListener("click", this.handleNewGame.bind(this));
      wait.splice(0);
      setTimeout(() => {
        document.querySelectorAll("#modal").forEach((modal) => modal.remove());
      }, 10);
    } else if (target && target.id === "refreshGame") {
      document.querySelectorAll("#modal").forEach((modal) => modal.remove());
      await this.refreshGame(true);
    } else if (target && target.id === "hintingGame") {
      await this.showHint();
    } else if (target && target.id === "modal-close") {
      document.querySelectorAll("#modal").forEach((modal) => modal.remove());
    }
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

  async initialize() {
    this.logger.dir("initialize").log("initialize");
    this.loadModules();

    // this.initialCommitQuestInQueue();

    this.setupCanvas(
      bgCanvas,
      gameCanvas,
      effectCanvas,
      scoreCanvas,
      selectCanvas,
      questCanvas
    );
    this.injection();

    const map = await this.blockManager.initialize();
    this.mapGenerator.initialize(map);
    this.blockManager.gameEnd = this.gameEnd;
    return true;
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

    if (wait.length === 0 && !this.gameEnd && this.scoreCalculator.turn === 0) {
      wait.push(0);
      this.gameEnd = true;
      this.blockManager.gameEnd = true;
      this.pointer.gameEnd = true;
      setTimeout(() => {
        this.scoreCalculator.popupEndModal();
      }, 16);
    }

    if (Math.floor(time) !== this.seek) {
      //
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
    }, 500);

    this._animation = requestAnimationFrame(this.animation.bind(this));
  }

  execInitialPang() {
    // start detect pang lines
    wait.splice(0);
    // if (this.mode !== "test") {
    if (wait.length === 0) {
      wait.push(0);
      this.blockManager.autoPangAndFill().then(() => {
        wait.pop();
      });
    }
    // }
  }

  renderPerSecond() {
    // console.log("hello");
  }
}
