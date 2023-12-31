import cat from "@src/assets/animals/cat-pad.png";
import dog from "@src/assets/animals/dog-pad.png";
import duck from "@src/assets/animals/duck-pad.png";
import lion from "@src/assets/animals/lion-pad.png";
import mouse from "@src/assets/animals/mouse-pad.png";
import rabbit from "@src/assets/animals/rabbit-pad.png";
// ver2
import panda from "@src/assets/animals/panda2-pad.png";
import pig from "@src/assets/animals/pig2-pad.png";
import racoon from "@src/assets/animals/racoon2-pad.png";
// ver3
import all from "@src/assets/animals/all-pad.png";
import horizon from "@src/assets/animals/horizon-pad.png";
import vertical from "@src/assets/animals/vertical-pad.png";

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
// ver2
const pandaImg = document.createElement("img");
pandaImg.src = panda;
const pigImg = document.createElement("img");
pigImg.src = pig;
const racoonImg = document.createElement("img");
racoonImg.src = racoon;

const allImg = document.createElement("img");
allImg.src = all;
const horizonImg = document.createElement("img");
horizonImg.src = horizon;
const verticalImg = document.createElement("img");
verticalImg.src = vertical;

export const images = {
  cat: catImg,
  dog: dogImg,
  lion: lionImg,
  duck: duckImg,
  mouse: mouseImg,
  rabbit: rabbitImg,
  panda: pandaImg,
  pig: pigImg,
  racoon: racoonImg,
  all: allImg,
  horizon: horizonImg,
  vertical: verticalImg,
};

export const ROOT = document.querySelector("#root") as HTMLDivElement;
export const [bgCanvas, bgCtx] = createCanvas("bg");
export const [gameCanvas, gameCtx] = createCanvas("game");
export const [effectCanvas, effectCtx] = createCanvas("effect");
export const [scoreCanvas, scoreCtx] = createCanvas("score");
export const [selectCanvas, selectCtx] = createCanvas("select");
export const [questCanvas, questCtx] = createCanvas("quest");

bgCtx.translate(0.5, 0.5);
gameCtx.translate(0.5, 0.5);
effectCtx.translate(0.5, 0.5);
scoreCtx.translate(0.5, 0.5);
selectCtx.translate(0.5, 0.5);

export const isMobile = () =>
  !!window.navigator.userAgent.match(/android|mobile/gi);
export const RUN_MODE = import.meta.env.VITE_RUN_MODE || "none";

export const SUB_OPTIONS = {
  SIZE: {
    RATIO: 1,
  },
};
export const OPTIONS = {
  SIZE: {
    UNIT: 50,
  },
  ITEM: {
    MATCH_LIMIT: 3,
  },
  WIDTH: {
    GAME: {
      X: 9,
      Y: 9,
    },
  },
  ANIMATION: {
    SPEED: isMobile() ? 0.13 : 0.1,
    FRAME: 16,
  },
  GAME: {
    TURN: 75,
    HINT: RUN_MODE === "test" ? Infinity : 5,
  },
};
export const TEST_AMOUNT = 0;

export const RESPONSIVE_UNIT_SIZE = () =>
  OPTIONS.SIZE.UNIT + SUB_OPTIONS.SIZE.RATIO;

// export const BG_COLOR = "#dddddd";
export const BG_COLOR = "#ffffff";
export const CELL_OUTLINE_COLOR = "#565656";
export const CELL_HOVER_COLOR = "#565656";
export const CELL_SELECTED_COLOR = "#48c46e";

export const wait: number[] = [];

export const LOG_BLOCK: number[] = [];

export const STORE_NAME = "pang_store";

type BlockTypeNScore = [string, number];

export const BASE_TYPE_SCORE: BlockTypeNScore[] = [
  ["dog", 1],
  // ["cat", 2], //
  ["duck", 3],
  ["mouse", 4],
  // ["rabbit", 5], //
  ["lion", 6],
  ["pig", 7],
  ["panda", 8],
  ["racoon", 9],
  ["horizon", 0],
  ["vertical", 0],
  ["all", 0],
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
  ["cat", "mouse", "cat", "mouse", "dog", "lion", "rabbit", "lion", "mouse"],
  ["dog", "lion", "dog", "lion", "mouse", "cat", "dog", "mouse", "cat"],
  [
    "lion",
    "rabbit",
    "dog",
    "cat",
    "racoon",
    "mouse",
    "racoon",
    "rabbit",
    "cat",
  ],
  ["dog", "cat", "rabbit", "lion", "dog", "rabbit", "cat", "dog", "mouse"],
  ["lion", "racoon", "lion", "pig", "rabbit", "pig", "mouse", "cat", "lion"],
  ["dog", "cat", "mouse", "mouse", "racoon", "dog", "lion", "mouse", "pig"],
  ["lion", "rabbit", "dog", "cat", "lion", "pig", "rabbit", "cat", "pig"],
  ["cat", "lion", "dog", "racoon", "cat", "dog", "lion", "rabbit", "mouse"],
  ["dog", "cat", "lion", "mouse", "dog", "lion", "cat", "racoon", "cat"],
];

export const RANDOM_ITEM = [
  { item: "all", probability: 0.25 },
  { item: "horizon", probability: 0.3 },
  { item: "vertical", probability: 0.3 },
];
// export const RANDOM_ITEM = {
//   all: 0.005,
//   horizon: 1,
//   vertical: 1,
//   // none: 90,
// };

const set3 = (
  obj: {
    target: string;
    type: string;
  },
  num: number
) =>
  new Array(num).fill(0).map((ar, index) =>
    Object.assign(
      { ...obj },
      {
        title: obj.target + ` 수집가 - ${index + 1}`,
        content: `${obj.target}를 ${(2 + index) * 5}마리 잡으세요.`,
        amount: (2 + index) * 5,
        score: 100 * (index + 1),
        turn: 0,
        type: obj.type,
      }
    )
  );
const set3Turn = (
  obj: {
    target: string;
    type: string;
  },
  num: number
) =>
  new Array(num).fill(0).map((ar, index) =>
    Object.assign(
      { ...obj },
      {
        title: obj.target + ` 수집가 - ${index + 1}`,
        content: `${obj.target}를 ${(2 + index) * 5}마리 잡으세요.`,
        amount: (2 + index) * 5,
        score: 25 * (index + 1),
        turn: 3 * (index + 1),
        type: obj.type,
      }
    )
  );

export const QUEST_LIST_OBJ = [
  {
    title: "돼지가 너무 많아!",
    content: "돼지를 15마리 잡으세요.",
    amount: 15,
    score: 150,
    turn: 0,
    type: "pig",
  },
  {
    title: "찍찍찌익!",
    content: "쥐를 30마리 잡으세요.",
    amount: 30,
    score: 300,
    turn: 0,
    type: "mouse",
  },
  ...set3({ target: "팬더", type: "panda" }, 3),
  ...set3({ target: "돼지", type: "pig" }, 3),
  ...set3({ target: "사자", type: "lion" }, 3),
  ...set3({ target: "강아지", type: "dog" }, 3),
  ...set3({ target: "고양이", type: "cat" }, 3),
  ...set3({ target: "너구리", type: "racoon" }, 3),
  ...set3({ target: "오리", type: "duck" }, 3),
  ...set3({ target: "토끼", type: "rabbit" }, 3),
  ...set3({ target: "쥐", type: "mouse" }, 3),
  ...set3Turn({ target: "팬더", type: "panda" }, 3),
  ...set3Turn({ target: "돼지", type: "pig" }, 3),
  ...set3Turn({ target: "사자", type: "lion" }, 3),
  ...set3Turn({ target: "강아지", type: "dog" }, 3),
  ...set3Turn({ target: "고양이", type: "cat" }, 3),
  ...set3Turn({ target: "너구리", type: "racoon" }, 3),
  ...set3Turn({ target: "오리", type: "duck" }, 3),
  ...set3Turn({ target: "토끼", type: "rabbit" }, 3),
  ...set3Turn({ target: "쥐", type: "mouse" }, 3),
];

// export const QUEST_LIST = [
//   new Quest("돼지가 너무 많아!", "돼지를 15마리 잡으세요.", 150, {
//     type: "pig",
//     amount: TEST_AMOUNT || 15,
//   }),
//   new Quest("찍찍찌익!", "쥐를 30마리 잡으세요.", 300, {
//     type: "mouse",
//     amount: TEST_AMOUNT || 30,
//   }),
//   new Quest("팬더 수집가 - 1", "팬더를 10마리 잡으세요.", 100, {
//     type: "panda",
//     amount: TEST_AMOUNT || 10,
//   }),
//   new Quest("팬더 수집가 - 2", "팬더를 15마리 잡으세요.", 300, {
//     type: "panda",
//     amount: TEST_AMOUNT || 15,
//   }),
//   new Quest("팬더 수집가 - 3", "팬더를 20마리 잡으세요.", 600, {
//     type: "panda",
//     amount: TEST_AMOUNT || 20,
//   }),
//   new Quest("강아지 수집가 - 1", "강아지를 15마리 잡으세요.", 200, {
//     type: "dog",
//     amount: TEST_AMOUNT || 15,
//   }),
//   new Quest("강아지 수집가 - 2", "강아지를 20마리 잡으세요.", 400, {
//     type: "dog",
//     amount: TEST_AMOUNT || 20,
//   }),
//   new Quest("강아지 수집가 - 3", "강아지를 30마리 잡으세요.", 800, {
//     type: "dog",
//     amount: TEST_AMOUNT || 30,
//   }),
//   new Quest("사자 수집가 - 1", "사자를 15마리 잡으세요.", 200, {
//     type: "lion",
//     amount: TEST_AMOUNT || 15,
//   }),
//   new Quest("사자 수집가 - 2", "사자를 20마리 잡으세요.", 400, {
//     type: "lion",
//     amount: TEST_AMOUNT || 20,
//   }),
//   new Quest("사자 수집가 - 3", "사자를 30마리 잡으세요.", 800, {
//     type: "lion",
//     amount: TEST_AMOUNT || 30,
//   }),
//   new Quest("토끼 수집가 - 1", "토끼를 15마리 잡으세요.", 200, {
//     type: "rabbit",
//     amount: TEST_AMOUNT || 15,
//   }),
//   new Quest("토끼 수집가 - 2", "토끼를 20마리 잡으세요.", 400, {
//     type: "rabbit",
//     amount: TEST_AMOUNT || 20,
//   }),
//   new Quest("토끼 수집가 - 3", "토끼를 30마리 잡으세요.", 800, {
//     type: "rabbit",
//     amount: TEST_AMOUNT || 30,
//   }),
//   new Quest("오리 수집가 - 1", "오리를 15마리 잡으세요.", 200, {
//     type: "duck",
//     amount: TEST_AMOUNT || 15,
//   }),
//   new Quest("오리 수집가 - 2", "오리를 20마리 잡으세요.", 400, {
//     type: "duck",
//     amount: TEST_AMOUNT || 20,
//   }),
//   new Quest("오리 수집가 - 3", "오리를 30마리 잡으세요.", 800, {
//     type: "duck",
//     amount: TEST_AMOUNT || 30,
//   }),
//   new Quest("돼지 수집가 - 1", "돼지를 15마리 잡으세요.", 200, {
//     type: "pig",
//     amount: TEST_AMOUNT || 15,
//   }),
//   new Quest("돼지 수집가 - 2", "돼지를 20마리 잡으세요.", 400, {
//     type: "pig",
//     amount: TEST_AMOUNT || 20,
//   }),
//   new Quest("돼지 수집가 - 3", "돼지를 30마리 잡으세요.", 800, {
//     type: "pig",
//     amount: TEST_AMOUNT || 30,
//   }),
//   new Quest("너구리 수집가 - 1", "너구리를 15마리 잡으세요.", 200, {
//     type: "racoon",
//     amount: TEST_AMOUNT || 15,
//   }),
//   new Quest("너구리 수집가 - 2", "너구리를 20마리 잡으세요.", 400, {
//     type: "racoon",
//     amount: TEST_AMOUNT || 20,
//   }),
//   new Quest("너구리 수집가 - 3", "너구리를 30마리 잡으세요.", 800, {
//     type: "racoon",
//     amount: TEST_AMOUNT || 30,
//   }),
// ];
