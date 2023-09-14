import cat from "@src/assets/animals/cat-pad.png";
import dog from "@src/assets/animals/dog-pad.png";
import lion from "@src/assets/animals/lion-pad.png";
import duck from "@src/assets/animals/duck-pad.png";
import mouse from "@src/assets/animals/mouse-pad.png";
import rabbit from "@src/assets/animals/rabbit-pad.png";

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

// global canvas
export const MODE = import.meta.env.MODE as string;

export const createCanvas = (id?: string) => {
  const canvas = document.createElement("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  if (id) {
    canvas.id = id;
  }
  return [canvas, ctx] as [HTMLCanvasElement, CanvasRenderingContext2D];
};
export const ROOT = document.querySelector("#root") as HTMLDivElement;
export const [bgCanvas, bgCtx] = createCanvas("bg");
export const [gameCanvas, gameCtx] = createCanvas("game");
export const [effectCanvas, effectCtx] = createCanvas("effect");
export const [scoreCanvas, scoreCtx] = createCanvas("score");
export const [selectCanvas, selectCtx] = createCanvas("select");

export const UNIT_SIZE = 50;
export const GAME_X_WIDTH = 10;
export const GAME_Y_WIDTH = 10;

export const BG_COLOR = "#565656";

export const wait: number[] = [];
