export const pointToString = function (p: Point): string {
  if (p.z !== undefined)
    return `(${p.x},${p.y},${p.z})`;
  else
    return `(${p.x},${p.y})`;
}

export const guard = function (p: Point, name = 'Point') {
  if (p === undefined) throw Error(`Parameter '${name}' is undefined. Expected {x,y}`);
  if (p === null) throw Error(`Parameter '${name}' is null. Expected {x,y}`);
  if (typeof (p.x) === "undefined") throw Error(`Parameter '${name}.x' is undefined. Expected {x,y}`);
  if (typeof (p.y) === "undefined") throw Error(`Parameter '${name}.y' is undefined. Expected {x,y}`);
}

export const toArray = function (p: Point): number[] {
  return [p.x, p.y];
}

export const equals = function (a: Point, b: Point): boolean {
  return a.x == b.x && a.y == b.y;
}

export const scale = function (a: Point, x: number, y: number | undefined = undefined): Point {
  if (y === undefined) y = x;
  return {x: a.x * x, y: a.y * y}
}

export type Point = {
  readonly x: number
  readonly y: number
  readonly z?: number
}
