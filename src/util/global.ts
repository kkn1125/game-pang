import cat from "@src/assets/animals/cat-pad.png";
import dog from "@src/assets/animals/dog-pad.png";
import duck from "@src/assets/animals/duck-pad.png";
import lion from "@src/assets/animals/lion-pad.png";
import mouse from "@src/assets/animals/mouse-pad.png";
import rabbit from "@src/assets/animals/rabbit-pad.png";

// global canvas
export const MODE = import.meta.env.MODE as string;

export const createCanvas = (id?: string) => {
  const canvas = document.createElement("canvas") as HTMLCanvasElement;

  const ctx = canvas.getContext("2d", {
    desynchronized: false,
    alpha: true,
    willReadFrequently: false,
  }) as CanvasRenderingContext2D;
  if (id) {
    canvas.id = id;
  }
  return [canvas, ctx] as [HTMLCanvasElement, CanvasRenderingContext2D];
};

const catImg = document.createElement("img");
catImg.src = cat;
const dogImg = document.createElement("img");
dogImg.src = dog;
const lionImg = document.createElement("img");
lionImg.src = lion;
const duckImg = document.createElement("img");
duckImg.src = duck;
const mouseImg = document.createElement("img");
mouseImg.src = mouse;
const rabbitImg = document.createElement("img");
rabbitImg.src = rabbit;

export const images = {
  cat: catImg,
  dog: dogImg,
  lion: lionImg,
  duck: duckImg,
  mouse: mouseImg,
  rabbit: rabbitImg,
};

export const ROOT = document.querySelector("#root") as HTMLDivElement;
export const [bgCanvas, bgCtx] = createCanvas("bg");
export const [gameCanvas, gameCtx] = createCanvas("game");
export const [effectCanvas, effectCtx] = createCanvas("effect");
export const [scoreCanvas, scoreCtx] = createCanvas("score");
export const [selectCanvas, selectCtx] = createCanvas("select");

bgCtx.translate(0.5, 0.5);
gameCtx.translate(0.5, 0.5);
effectCtx.translate(0.5, 0.5);
scoreCtx.translate(0.5, 0.5);
selectCtx.translate(0.5, 0.5);

export const isMobile = window.navigator.userAgent.match(/android|mobile/gi);

export const SUB_OPTIONS = {
  SIZE: {
    RATIO: 1,
  },
};
export const OPTIONS = {
  SIZE: {
    UNIT: 50,
  },
  WIDTH: {
    GAME: {
      X: 9,
      Y: 9,
    },
  },
  ANIMATION: {
    SPEED: isMobile ? 0.5 : 0.1,
    FRAME: 16,
  },
  GAME: {
    TURN: 50,
  },
};
export const RESPONSIVE_UNIT_SIZE = () =>
  OPTIONS.SIZE.UNIT + SUB_OPTIONS.SIZE.RATIO;
// export const UNIT_SIZE = 50;
// export const GAME_X_WIDTH = 10;
// export const GAME_Y_WIDTH = 10;

export const BG_COLOR = "#dddddd";

export const wait: number[] = [];

// export const ANIMATION_SPEED = 0.1;
// export const ANIMATION_FRAME = 16;
export const LOG_BLOCK: number[] = [];

export const RUN_MODE = import.meta.env.VITE_RUN_MODE || "none";
export const STORE_NAME = "pang_store";

type BlockTypeNScore = [string, number];

export const BASE_TYPE_SCORE: BlockTypeNScore[] = [
  ["dog", 1],
  ["cat", 2],
  ["duck", 3],
  ["mouse", 4],
  ["lion", 5],
];
export const TestCase1 = [
  [
    "dog",
    "dog",
    "dog",
    "lion",
    "lion",
    "mouse",
    "dog",
    "mouse",
    "cat",
    "mouse",
  ],
  ["dog", "dog", "dog", "mouse", "dog", "lion", "lion", "lion", "mouse", "cat"],
  ["dog", "lion", "lion", "lion", "dog", "dog", "mouse", "dog", "mouse", "cat"],

  [
    "dog",
    "dog",
    "dog",
    "lion",
    "lion",
    "mouse",
    "dog",
    "mouse",
    "cat",
    "mouse",
  ],
  [
    "dog",
    "dog",
    "lion",
    "dog",
    "mouse",
    "dog",
    "mouse",
    "cat",
    "lion",
    "mouse",
  ],
  [
    "dog",
    "mouse",
    "mouse",
    "mouse",
    "dog",
    "dog",
    "lion",
    "mouse",
    "cat",
    "mouse",
  ],
  [
    "mouse",
    "lion",
    "dog",
    "dog",
    "lion",
    "dog",
    "dog",
    "mouse",
    "mouse",
    "cat",
  ],
  [
    "mouse",
    "lion",
    "dog",
    "dog",
    "lion",
    "dog",
    "mouse",
    "mouse",
    "mouse",
    "cat",
  ],
  [
    "dog",
    "lion",
    "lion",
    "mouse",
    "dog",
    "mouse",
    "cat",
    "cat",
    "cat",
    "mouse",
  ],
  [
    "dog",
    "dog",
    "dog",
    "lion",
    "lion",
    "mouse",
    "dog",
    "mouse",
    "cat",
    "mouse",
  ],
];
export const TestCase2 = [
  ["dog", "dog", "dog", "lion", "lion", "mouse", "dog", "mouse", "cat"],
  ["dog", "dog", "dog", "mouse", "dog", "lion", "lion", "lion", "mouse"],
  ["dog", "lion", "lion", "lion", "dog", "dog", "mouse", "dog", "mouse"],
  ["dog", "dog", "dog", "lion", "lion", "mouse", "dog", "mouse", "cat"],
  ["dog", "dog", "lion", "dog", "mouse", "dog", "mouse", "cat", "lion"],
  ["dog", "mouse", "mouse", "mouse", "dog", "dog", "lion", "mouse", "cat"],
  ["mouse", "lion", "dog", "dog", "lion", "dog", "dog", "mouse", "mouse"],
  ["mouse", "lion", "dog", "dog", "lion", "dog", "mouse", "mouse", "mouse"],
  ["dog", "lion", "lion", "mouse", "dog", "mouse", "cat", "cat", "cat"],
];
