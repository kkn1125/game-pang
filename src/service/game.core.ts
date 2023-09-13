import {
  bgCanvas,
  effectCanvas,
  gameCanvas,
  gameCtx,
  GAME_X_WIDTH,
  GAME_Y_WIDTH,
  ROOT,
  scoreCanvas,
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
  _dev: boolean;

  constructor() {
    this.logger = new Logger(this.constructor.name);
    this.logger.dir("constructor").log("setup game core...");

    this.scoreCalculator = new ScoreCalculator();
    this.blockManager = new BlockManager(this.scoreCalculator);
    this.animator = new Animator();
    this.mapGenerator = new MapGenerator();
    this.pointer = new Pointer();
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
    this.setupCanvas();
    this.injection();

    const map = this.blockManager.initialize();
    this.mapGenerator.initialize(map);
  }

  injection() {
    this.pointer.inject(this.blockManager);
    this.pointer.inject(this.mapGenerator);
  }

  handleResizeCanvasSize = () => {
    bgCanvas.width = innerWidth;
    bgCanvas.height = innerHeight;
    gameCanvas.width = innerWidth;
    gameCanvas.height = innerHeight;
    effectCanvas.width = innerWidth;
    effectCanvas.height = innerHeight;
    scoreCanvas.width = innerWidth;
    scoreCanvas.height = innerHeight;
  };

  setupCanvas() {
    this.logger.dir("setupCanvas").log("setup canvas elements");

    this.logger.dir("setupCanvas").log("add background canvas");
    ROOT.append(bgCanvas);
    this.logger.dir("setupCanvas").log("add game canvas");
    ROOT.append(gameCanvas);
    this.logger.dir("setupCanvas").log("add effect canvas");
    ROOT.append(effectCanvas);
    this.logger.dir("setupCanvas").log("add score canvas");
    ROOT.append(scoreCanvas);

    this.handleResizeCanvasSize();
    this.logger.dir("setupCanvas").log("add event window resize detect");
    window.addEventListener("resize", this.handleResizeCanvasSize.bind(this));
  }

  animation(time: number) {
    this.clearRect();
    time *= 0.001;

    if (this.seek !== Math.floor(time)) {
      // timer zone
      this.renderPerSecond.call(this);
    }

    this.scoreCalculator.render();
    this.mapGenerator.render();
    this.blockManager.render();

    requestAnimationFrame(this.animation.bind(this));

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
