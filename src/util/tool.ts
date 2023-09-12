import { GAME_X_WIDTH, GAME_Y_WIDTH, UNIT_SIZE } from "./global";

export const capitalize = (str: string) =>
  str.charAt(0).toLowerCase() + str.slice(1);

export const responseBlockAxis = (x: number, y: number) => {
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  const horizonValue = GAME_X_WIDTH * UNIT_SIZE;
  const verticalValue = GAME_Y_WIDTH * UNIT_SIZE;
  const halfHorizon = horizonValue / 2;
  const halfVertical = verticalValue / 2;
  const resX = centerX + x - halfHorizon;
  const resY = centerY + y - halfVertical;
  return [resX, resY];
};

export const responsePointerAxis = (x: number, y: number): [number, number] => {
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  // const unitX = Math.floor(x / this.unit);
  // const unitY = Math.floor(y / this.unit);
  const horizonValue = GAME_X_WIDTH * UNIT_SIZE;
  const verticalValue = GAME_Y_WIDTH * UNIT_SIZE;
  const halfHorizon = horizonValue / 2;
  const halfVertical = verticalValue / 2;

  // const [resX,resY]=responseAxis(x,y)

  const unitCenterX = Math.floor((x - centerX + halfHorizon) / UNIT_SIZE);
  const unitCenterY = Math.floor((y - centerY + halfVertical) / UNIT_SIZE);
  return [unitCenterX, unitCenterY];
};
