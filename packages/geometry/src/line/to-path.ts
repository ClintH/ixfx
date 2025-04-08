import type { LinePath } from "./line-path-type.js";
import type { Line } from "./line-type.js";
import { length } from "./length.js";
import { interpolate } from "./interpolate.js";
import type { Point } from "../point/point-type.js";
import { parallel, perpendicularPoint } from "./angles.js";
import { midpoint } from "./midpoint.js";
import { toFlatArray, toSvgString, slope, withinRange, apply } from "./index.js";
import { bbox } from "./bbox.js";
import { relativePosition } from "./relative-position.js";
import { sum } from "./sum.js";
import { divide } from "./divide.js";
import { rotate } from "./rotate.js";
import { nearest } from "./nearest.js";
import { distanceSingleLine } from './distance-single-line.js';
import { isEqual } from "./is-equal.js";
import { multiply } from "./multiply.js";
import { subtract } from "./subtract.js";
import { toString } from "./to-string.js";
/**
 * Returns a path wrapper around a line instance. This is useful if there are a series
 * of operations you want to do with the same line because you don't have to pass it
 * in as an argument to each function.
 * 
 * Note that the line is immutable, so a function like `sum` returns a new LinePath,
 * wrapping the result of `sum`.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Create a path
 * const l = Lines.toPath(fromNumbers(0,0,10,10));
 * 
 * // Now we can use it...
 * l.length();
 * 
 * // Mutate functions return a new path
 * const ll = l.sum({x:10,y:10});
 * ll.length();
 * ```
 * @param line 
 * @returns 
 */
export const toPath = (line: Line): LinePath => {
  const { a, b } = line;
  return Object.freeze({
    ...line,
    length: () => length(a, b),
    interpolate: (amount: number) => interpolate(amount, a, b),
    relativePosition: (point: Point) => relativePosition(line, point),
    bbox: () => bbox(line),
    toString: () => toString(a, b),
    toFlatArray: () => toFlatArray(a, b),
    toSvgString: () => toSvgString(a, b),
    toPoints: () => [ a, b ],
    rotate: (amountRadian: number, origin: Point) => toPath(rotate(line, amountRadian, origin)),
    nearest: (point: Point) => nearest(line, point),
    sum: (point: Point) => toPath(sum(line, point)),
    divide: (point: Point) => toPath(divide(line, point)),
    multiply: (point: Point) => toPath(multiply(line, point)),
    subtract: (point: Point) => toPath(subtract(line, point)),
    midpoint: () => midpoint(a, b),
    distanceToPoint: (point: Point) => distanceSingleLine(line, point),
    parallel: (distance: number) => parallel(line, distance),
    perpendicularPoint: (distance: number, amount?: number) => perpendicularPoint(line, distance, amount),
    slope: () => slope(line),
    withinRange: (point: Point, maxRange: number) => withinRange(line, point, maxRange),
    isEqual: (otherLine: Line) => isEqual(line, otherLine),
    apply: (fn: (point: Point) => Point) => toPath(apply(line, fn)),
    kind: `line`
  });
};