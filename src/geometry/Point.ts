export const pointToString = function (p: Point): string {
  if (p.z !== undefined)
    return `(${p.x},${p.y},${p.z})`;
  else
    return `(${p.x},${p.y})`;
}

export const guard = function (p: Point, name = 'Point') {
  if (p === undefined) throw Error(`Parameter '${name}' is undefined. Expected {x,y}`);
  if (p === null) throw Error(`Parameter '${name}' is null. Expected {x,y}`);
  if (typeof (p.x) === 'undefined') throw Error(`Parameter '${name}.x' is undefined. Expected {x,y}`);
  if (typeof (p.y) === 'undefined') throw Error(`Parameter '${name}.y' is undefined. Expected {x,y}`);
  if (Number.isNaN(p.x)) throw Error(`Parameter '${name}.x' is NaN`);
  if (Number.isNaN(p.y)) throw Error(`Parameter '${name}.y' is NaN`);
}

function isPoint(p: any): p is Point {
  if (p.x === undefined) return false;
  if (p.y === undefined) return false;
  return true;
}

/**
 * Returns point as an array in the form [x,y]
 * let a = toArray({x:10, y:5}); // yields [10,5]
 * @param {Point} p
 * @returns {number[]}
 */
export const toArray = function (p: Point): number[] {
  return [p.x, p.y];
}

export const equals = function (a: Point, b: Point): boolean {
  return a.x == b.x && a.y == b.y;
}
/**
 * Returns a point from two coordinates
 * 
 * ```
 * let p = from(10, 5); // yields {x:10, y:5}
 * ```
 * @param {number} x
 * @param {number} y
 * @returns {Point}
 */
export function from(x: number, y: number): Point;

/**
* Returns a point from an array of [x,y]
* ```
* let p = fromArray([10, 5]); // yields {x: 10, y:5}
* ```
* @param {number[]} array
* @returns {Point}
*/
export function from(array: number[]): Point;

export function from(xOrArray: number | number[], y?: number): Point {
  if (Array.isArray(xOrArray)) {
    if (xOrArray.length !== 2) throw Error('Expected array of length two, got ' + xOrArray.length);
    return {
      x: xOrArray[0],
      y: xOrArray[1]
    }
  } else {
    if (y === undefined) throw Error('y is undefined');
    if (Number.isNaN(xOrArray)) throw Error('x is NaN');
    if (Number.isNaN(y)) throw Error('y is NaN');
    return {x: xOrArray, y: y};
  }
}


/**
 * Returns `a` minus `b`
 *
 * @param {Point} a
 * @param {Point} b
 * @returns {Point}
 */
export const diff = function (a: Point, b: Point): Point {
  guard(a, 'a');
  guard(b, 'b');
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}

/**
 * Returns `a` minus `b`
 *
 * @param {Point} a
 * @param {Point} b
 * @returns {Point}
 */
export const sum = function (a: Point, b: Point): Point {
  guard(a, 'a');
  guard(b, 'b');
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}

/**
 * Returns `a` multiplied by `b`
 *
 * @param {Point} a
 * @param {Point} b
 * @returns {Point}
 */
export function multiply(a: Point, b: Point): Point;

/**
 * Returns `a` multipled by some x and/or y scaling factor
 *
 * @export
 * @param {Point} a Point to scale
 * @param {number} x Scale factor for x axis
 * @param {number} [y] Scale factor for y axis (defaults to no scaling)
 * @returns {Point} Scaled point
 */
export function multiply(a: Point, x: number, y?: number): Point;

export function multiply(a: Point, bOrX: Point | number, y?: number) {
  guard(a, 'a');
  if (typeof bOrX == 'number') {
    if (typeof y === 'undefined') y = 1;
    return {x: a.x * bOrX, y: a.y * y}
  } else if (isPoint(bOrX)) {
    guard(bOrX, 'b');
    return {
      x: a.x * bOrX.x,
      y: a.y * bOrX.y
    };
  } else throw Error('Invalid arguments');
}

export type Point = {
  readonly x: number
  readonly y: number
  readonly z?: number
}
