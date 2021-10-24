export const pointToString = function (p: Point): string {
  if (p.z !== undefined)
    return `(${p.x},${p.y},${p.z})`;
  else
    return `(${p.x},${p.y})`;
}

export const guard = function (p: Point, name = 'Point') {
  if (p === undefined) throw Error(`${name} is undefined`);
  if (p === null) throw Error(`${name} is null`);
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
