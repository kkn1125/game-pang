import {
  bgCanvas,
  bgCtx,
  effectCanvas,
  effectCtx,
  gameCanvas,
  gameCtx,
  GAME_X_WIDTH,
  GAME_Y_WIDTH,
  ROOT,
  scoreCanvas,
  scoreCtx,
  selectCanvas,
  selectCtx,
  UNIT_SIZE,
  wait,
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
  canvases: HTMLCanvasElement[] = [];

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
    this.setupCanvas(
      bgCanvas,
      gameCanvas,
      effectCanvas,
      scoreCanvas,
      selectCanvas
    );
    this.injection();

    const map = this.blockManager.initialize();
    this.mapGenerator.initialize(map);
  }

  injection() {
    this.pointer.inject(this.blockManager);
    this.pointer.inject(this.mapGenerator);
  }

  handleResizeCanvasSize = () => {
    this.logger
      .dir("setupCanvas")
      .dir("handleResizeCanvasSize")
      .log(`resize all canvas`);
    for (const canvas of this.canvases) {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    }
  };

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

  animation(time: number) {
    this.clearRect();
    const milliseconds = time;
    time *= 0.001;

    if (Math.floor(milliseconds) % 60 === 0) {
      // timer zone
      // this.renderPerSecond.call(this);
    }

    this.scoreCalculator.render();
    this.mapGenerator.render();
    this.blockManager.render();

    requestAnimationFrame(this.animation.bind(this));

    this.seek = Math.floor(time);
  }

  clearRect() {
    bgCtx.clearRect(0, 0, innerWidth, innerHeight);
    scoreCtx.clearRect(0, 0, innerWidth, innerHeight);
    gameCtx.clearRect(0, 0, innerWidth, innerHeight);
    selectCtx.clearRect(0, 0, innerWidth, innerHeight);
    effectCtx.clearRect(0, 0, innerWidth, innerHeight);
  }

  render() {
    this.logger.dir("render").log("start game core rendering...");

    this.logger.dir("render").log("start calulator rendering...");
    this.logger.dir("render").log("start game map rendering...");
    this.logger.dir("render").log("start block rendering...");

    // start detect pang lines
    this.blockManager.autoPangAndFill();

    requestAnimationFrame(this.animation.bind(this));
  }
  renderPerSecond() {
    // console.log("hello");
  }
}
