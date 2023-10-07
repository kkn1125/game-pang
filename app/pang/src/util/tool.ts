import { OPTIONS, RESPONSIVE_UNIT_SIZE } from "./global";

export const capitalize = (str: string) =>
  str.charAt(0).toLowerCase() + str.slice(1);

export const responseBlockAxis = (x: number, y: number) => {
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  const horizonValue = OPTIONS.WIDTH.GAME.X * RESPONSIVE_UNIT_SIZE();
  const verticalValue = OPTIONS.WIDTH.GAME.Y * RESPONSIVE_UNIT_SIZE();
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
  const horizonValue = OPTIONS.WIDTH.GAME.X * RESPONSIVE_UNIT_SIZE();
  const verticalValue = OPTIONS.WIDTH.GAME.Y * RESPONSIVE_UNIT_SIZE();
  const halfHorizon = horizonValue / 2;
  const halfVertical = verticalValue / 2;

  // const [resX,resY]=responseAxis(x,y)

  const unitCenterX = Math.floor(
    (x - centerX + halfHorizon) / RESPONSIVE_UNIT_SIZE()
  );
  const unitCenterY = Math.floor(
    (y - centerY + halfVertical) / RESPONSIVE_UNIT_SIZE()
  );
  return [unitCenterX, unitCenterY];
};
