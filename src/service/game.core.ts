import {
  bgCanvas,
  effectCanvas,
  gameCanvas,
  gameCtx,
  GAME_X_WIDTH,
  GAME_Y_WIDTH,
  ROOT,
  UNIT_SIZE,
} from "@src/util/global";
import Logger from "@src/util/logger";
import Animator from "./animator";
import BlockManager from "./block.manager";
import MapGenerator from "./map.generator";
import Pointer from "./pointer";
import ScoreCalculator from "./score.calculator";

export default class GameCore {
  seek: number = 0;
  blockManager: BlockManager;
  animator: Animator;
  mapGenerator: MapGenerator;
  scoreCalculator: ScoreCalculator;
  pointer: Pointer;
  logger: Logger;

  constructor() {
    this.blockManager = new BlockManager();
    this.animator = new Animator();
    this.mapGenerator = new MapGenerator();
    this.scoreCalculator = new ScoreCalculator();
    this.pointer = new Pointer();

    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").log("setup game core...");
    this.pointer.inject(this.mapGenerator);
  }

  initialize() {
    this.logger.dir("initialize").log("initialize");
    this.setupCanvas();
    const map = this.blockManager.initialize();
    this.mapGenerator.initialize(map);
  }

  handleResizeCanvasSize = () => {
    bgCanvas.width = innerWidth;
    bgCanvas.height = innerHeight;
    gameCanvas.width = innerWidth;
    gameCanvas.height = innerHeight;
    effectCanvas.width = innerWidth;
    effectCanvas.height = innerHeight;
  };

  setupCanvas() {
    this.logger.dir("setupCanvas").log("setup canvas elements");

    this.logger.dir("setupCanvas").log("add background canvas");
    ROOT.append(bgCanvas);
    this.logger.dir("setupCanvas").log("add game canvas");
    ROOT.append(gameCanvas);
    this.logger.dir("setupCanvas").log("add effect canvas");
    ROOT.append(effectCanvas);

    this.handleResizeCanvasSize();
    this.logger.dir("setupCanvas").log("add event window resize detect");
    window.addEventListener("resize", this.handleResizeCanvasSize.bind(this));
  }

  animation(time: number) {
    requestAnimationFrame(this.animation.bind(this));
    this.clearRect();
    time *= 0.001;

    if (this.seek !== Math.floor(time)) {
      // timer zone
      this.renderPerSecond.call(this);
    }

    this.scoreCalculator.render();
    this.mapGenerator.render();
    this.blockManager.render();

    this.seek = Math.floor(time);
  }

  clearRect() {
    gameCtx.clearRect(0, 0, innerWidth, innerHeight);
  }

  render() {
    this.logger.dir("render").log("start game core rendering...");

    this.logger.dir("render").log("start calulator rendering...");
    this.logger.dir("render").log("start game map rendering...");
    this.logger.dir("render").log("start block rendering...");

    requestAnimationFrame(this.animation.bind(this));
  }
  renderPerSecond() {
    // console.log("hello");
  }
}
