import {guard as guardPoint, Point} from './Point.js';
import {percent as guardPercent} from '../Guards.js';
import {Path} from './Path.js';
import { Rects, Points} from './index.js';
import {minFast} from '../collections/NumericArrays.js';
import {Arrays} from '../collections/index.js';

/**
 * A line, which consists of an `a` and `b` {@link Points.Point}.
 */
export type Line = {
  readonly a: Points.Point
  readonly b: Points.Point
}

/**
 * A PolyLine, consisting of more than one line.
 */
export type PolyLine = ReadonlyArray<Line>;

/**
 * Returns true if `p` is a valid line, containing `a` and `b` Points.
 * @param p Value to check
 * @returns True if a valid line.
 */
export const isLine = (p: Path | Line | Points.Point): p is Line => {
  if (p === undefined) return false;
  if ((p as Line).a === undefined) return false;
  if ((p as Line).b === undefined) return false;
  if (!Points.isPoint((p as Line).a)) return false;
  if (!Points.isPoint((p as Line).b)) return false;
  return true;
};

/**
 * Returns true if `p` is a {@link PolyLine}, ie. an array of {@link Line}s.
 * Validates all items in array.
 * @param p 
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPolyLine = (p: any): p is PolyLine => {
  if (!Array.isArray(p)) return false;

  const valid = !p.some(v => !isLine(v));
  return valid;
};

/**
 * Returns true if the lines have the same value
 *
 * @param {Line} a
 * @param {Line} b
 * @returns {boolean}
 */
export const equals = (a:Line, b:Line):boolean =>  a.a === b.a && a.b === b.b;

/**
 * Applies `fn` to both start and end points.
 * 
 * ```js
 * // Line 10,10 -> 20,20
 * const line = Lines.fromNumbers(10,10, 20,20);
 * 
 * // Applies randomisation to x&y
 * const rand = (p) => ({
 *  x: p.x * Math.random(),
 *  y: p.y * Math.random()
 * });
 * 
 * // Applies our randomisation function
 * const line2 = apply(line, rand);
 * ```
 * @param line Line
 * @param fn Function that takes a point and returns a point
 * @returns 
 */
export const apply = (line:Line, fn:(p:Points.Point) => Points.Point) => Object.freeze<Line>(
  {
    ...line,
    a: fn(line.a),
    b: fn(line.b)
  }
);


/**
 * Throws an exception if:
 * * line is undefined
 * * a or b parameters are missing
 * 
 * Does not validate points
 * @param line 
 * @param paramName 
 */
export const guard = (line:Line, paramName:string = `line`) => {
  if (line === undefined) throw new Error(`${paramName} undefined`);
  if (line.a === undefined) throw new Error(`${paramName}.a undefined. Expected {a:Point, b:Point}`);
  if (line.b === undefined) throw new Error(`${paramName}.b undefined. Expected {a:Point, b:Point}`);
};

/**
 * Returns the angle in radians of a line, or two points
 * ```js
 * angleRadian(line);
 * angleRadian(ptA, ptB);
 * ```
 * @param lineOrPoint 
 * @param b 
 * @returns 
 */
export const angleRadian = (lineOrPoint:Line|Points.Point, b?:Points.Point):number => {
  //eslint-disable-next-line functional/no-let
  let a:Points.Point;
  if (isLine(lineOrPoint)) {
    a = lineOrPoint.a;
    b = lineOrPoint.b;
  } else {
    a = lineOrPoint;
    if (b === undefined) throw new Error(`b point must be provided`);
  }
  return Math.atan2(b.y - a.y, b.x - a.x);
};

/**
 * Multiplies start and end of line by x,y given in `p`.
 * ```js
 * // Line 1,1 -> 10,10
 * const l = fromNumbers(1,1,10,10);
 * const ll = multiply(l, {x:2, y:3});
 * // Yields: 2,20 -> 3,30
 * ```
 * @param line 
 * @param point 
 * @returns 
 */
export const multiply = (line:Line, point:Points.Point):Line => (Object.freeze({
  ...line,
  a: Points.multiply(line.a, point),
  b: Points.multiply(line.b, point)
}));

/**
 * Divides both start and end points by given x,y
 * ```js
 * // Line 1,1 -> 10,10
 * const l = fromNumbers(1,1,10,10);
 * const ll = divide(l, {x:2, y:4});
 * // Yields: 0.5,0.25 -> 5,2.5
 * ```
 * @param line 
 * @param point 
 * @returns 
 */
export const divide = (line:Line, point:Points.Point):Line => Object.freeze({
  ...line,
  a: Points.divide(line.a, point),
  b: Points.divide(line.b, point)
});

/**
 * Adds both start and end points by given x,y
 * ```js
 * // Line 1,1 -> 10,10
 * const l = fromNumbers(1,1,10,10);
 * const ll = sum(l, {x:2, y:4});
 * // Yields: 3,5 -> 12,14
 * ```
 * @param line 
 * @param point 
 * @returns 
 */
export const sum = (line:Line, point:Points.Point):Line => Object.freeze({
  ...line,
  a: Points.sum(line.a, point),
  b: Points.sum(line.b, point)
});

/**
 * Subtracts both start and end points by given x,y
 * ```js
 * // Line 1,1 -> 10,10
 * const l = fromNumbers(1,1,10,10);
 * const ll = subtract(l, {x:2, y:4});
 * // Yields: -1,-3 -> 8,6
 * ```
 * @param line 
 * @param point 
 * @returns 
 */
export const subtract = (line:Line, point:Points.Point):Line => Object.freeze({
  ...line,
  a: Points.subtract(line.a, point),
  b: Points.subtract(line.b, point)
});

/**
 * Normalises start and end points by given width and height. Useful
 * for converting an absolutely-defined line to a relative one.
 * ```js
 * // Line 1,1 -> 10,10
 * const l = fromNumbers(1,1,10,10);
 * const ll = normaliseByRect(l, 10, 10);
 * // Yields: 0.1,0.1 -> 1,1
 * ```
 * @param line 
 * @param width
 * @param height 
 * @returns 
 */
export const normaliseByRect = (line:Line, width:number, height:number):Line => Object.freeze({
  ...line,
  a: Points.normaliseByRect(line.a, width, height),
  b: Points.normaliseByRect(line.b, width, height)
});


/**
 * Returns true if `point` is within `maxRange` of `line`.
 * ```js
 * const line = Lines.fromNumbers(0,20,20,20);
 * Lines.withinRange(line, {x:0,y:21}, 1); // True
 * ```
 * @param line
 * @param point
 * @param maxRange 
 * @returns True if point is within range
 */
export const withinRange = (line:Line, point:Points.Point, maxRange:number):boolean =>  {
  const dist = distance(line, point);
  return dist <= maxRange;
};

/**
 * Returns the length between two points
 * ```js
 * length(ptA, ptB);
 * ```
 * @param a First point
 * @param b Second point
 * @returns 
 */
export function length(a: Points.Point, b: Points.Point): number;

/**
 * Returns length of line. If a polyline (array of lines) is provided,
 * it is the sum total that is returned.
 * 
 * ```js
 * length(a: {x:0, y:0}, b: {x: 100, y:100});
 * length(lines);
 * ```
 * @param line Line
 */
export function length(line: Line|PolyLine): number;

/**
 * Returns length of line, polyline or between two points
 * @param aOrLine Point A, line or polyline (array of lines)
 * @param pointB Point B, if first parameter is a point
 * @returns Length (total accumulated length for arrays)
 */
//eslint-disable-next-line func-style
export function length(aOrLine: Points.Point|Line|PolyLine, pointB?: Points.Point): number  {
  if (isPolyLine(aOrLine)) {
    const sum = aOrLine.reduce((acc, v) => length(v) + acc, 0);
    return sum;
  }

  const [a, b] = getPointsParam(aOrLine, pointB);
  const x = b.x - a.x;
  const y = b.y - a.y;
  if (a.z !== undefined && b.z !== undefined) {
    const z = b.z - a.z;
    return Math.hypot(x, y, z);
  } else {
    return Math.hypot(x, y);
  }
}

export const midpoint =(aOrLine: Points.Point|Line, pointB?: Points.Point):Points.Point => {
  const [a, b] = getPointsParam(aOrLine, pointB);
  return interpolate(0.5, a, b);
};

/**
 * Returns [a,b] points from either a line parameter, or two points.
 * It additionally applies the guardPoint function to ensure validity.
 * This supports function overloading.
 * @ignore
 * @param aOrLine 
 * @param b 
 * @returns 
 */
export const getPointsParam = (aOrLine: Points.Point|Line, b?: Points.Point): readonly [Points.Point, Points.Point] => {
  //eslint-disable-next-line functional/no-let
  let a;
  if (isLine(aOrLine)) {
    b = aOrLine.b;
    a = aOrLine.a;
  } else {
    a = aOrLine;
    if (b === undefined) throw new Error(`Since first parameter is not a line, two points are expected. Got a: ${JSON.stringify(a)} b: ${JSON.stringify(b)}`);
  }
  guardPoint(a, `a`);
  guardPoint(a, `b`);

  return [a, b];
};

/**
 * Returns the nearest point on `line` closest to `point`.
 * 
 * ```js
 * const pt = nearest(line, {x:10,y:10});
 * ```
 * 
 * If an array of lines is provided, it will be the closest point amongst all the lines
 * @param line Line or array of lines
 * @param point
 * @returns Point {x,y}
 */
export const nearest = (line:Line|readonly Line[], point:Points.Point): Points.Point => {
  
  const n = (line:Line):Points.Point => {
    const {a, b} = line;
    const atob = { x: b.x - a.x, y: b.y - a.y };
    const atop = { x: point.x - a.x, y: point.y - a.y };
    const len = atob.x * atob.x + atob.y * atob.y;

    //eslint-disable-next-line functional/no-let
    let dot = atop.x * atob.x + atop.y * atob.y;
    const t = Math.min(1, Math.max(0, dot / len));
    dot = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
    return {x: a.x + atob.x * t, y: a.y + atob.y * t};
  };

  if (Array.isArray(line)) {
    const pts = line.map(l => n(l));
    const dists = pts.map(p => Points.distance(p, point));
    return Object.freeze<Points.Point>(pts[Arrays.minIndex(...dists)]);
  } else {
    return Object.freeze<Points.Point>(n(line as Line));
  }
};

/**
 * Calculates [slope](https://en.wikipedia.org/wiki/Slope) of line.
 * 
 * @example
 * ```js
 * slope(line);
 * slope(ptA, ptB)
 * ```
 * @param lineOrPoint Line or point. If point is provided, second point must be given too
 * @param b Second point if needed
 * @returns 
 */
export const slope = (lineOrPoint:Line|Points.Point, b?:Points.Point):number => {
  //eslint-disable-next-line functional/no-let
  let a:Points.Point;
  if (isLine(lineOrPoint)) {
    //eslint-disable-next-line functional/no-let
    a = lineOrPoint.a;
    b = lineOrPoint.b;
  } else {
    a = lineOrPoint;
    if (b === undefined) throw new Error(`b parameter required`);
  }
  if (b !== undefined) {
    return (b.y - a.y) / (b.x - a.x);
  } else throw Error(`Second point missing`);
};

const directionVector = (line:Line):Points.Point => ({
  x: line.b.x-line.a.x,
  y: line.b.y-line.a.y
});

const directionVectorNormalised = (line:Line):Points.Point => {
  const l = length(line);
  const v = directionVector(line);
  return {
    x: v.x / l,
    y: v.y / l
  };
};

/**
 * Returns a point perpendicular to `line` at a specified `distance`. Use negative
 * distances for the other side of line.
 * ```
 * // Project a point 100 units away from line, at its midpoint.
 * const pt = perpendicularPoint(line, 100, 0.5);
 * ```
 * @param line Line
 * @param distance Distance from line. Use negatives to flip side
 * @param amount Relative place on line to project point from. 0 projects from A, 0.5 from the middle, 1 from B.
 */
export const perpendicularPoint = (line:Line, distance:number, amount:number = 0) => {
  const origin = interpolate(amount, line);
  const dvn = directionVectorNormalised(line);
  return {
    x: origin.x  - dvn.y * distance,
    y: origin.y  + dvn.x * distance
  };
};

/**
 * Returns a parallel line to `line` at `distance`.
 * @param line
 * @param distance 
 */
export const parallel = (line:Line, distance:number):Line => {
  const dv = directionVector(line);
  const dvn = directionVectorNormalised(line);
  const a = {
    x: line.a.x - dvn.y * distance,
    y: line.a.y + dvn.x * distance
  };
  return {
    a,
    b: {
      x: a.x + dv.x,
      y: a.y + dv.y 
    }
  };
};

/**
 * Scales a line from its midpoint
 * 
 * @example Shorten by 50%, anchored at the midpoint
 * ```js
 * const l = {
 *  a: {x:50, y:50}, b: {x: 100, y: 90}
 * }
 * const l2 = scaleFromMidpoint(l, 0.5);
 * ```
 * @param line
 * @param factor 
 */
export const scaleFromMidpoint = (line:Line, factor:number):Line => {
  const a = interpolate(factor/2, line);
  const b = interpolate(0.5 + factor/2, line);
  return {a, b};
};

/**
 * Extends a line to intersection the x-axis at a specified location
 * @param line Line to extend
 * @param xIntersection Intersection of x-axis.
 */
export const extendX = (line:Line, xIntersection:number):Points.Point => {
  const y = line.a.y + (xIntersection - line.a.x) * slope(line);
  return Object.freeze({x: xIntersection, y});
};

/**
 * Returns a line extended from its `a` point by a specified distance
 *
 * ```js
 * const line = {a: {x: 0, y:0}, b: {x:10, y:10} }
 * const extended = extendFromStart(line, 2);
 * ```
 * @param ine
 * @param distance
 * @return Newly extended line
 */
export const extendFromA = (line:Line, distance:number):Line => {
  const len = length(line);
  return Object.freeze({
    ...line,
    a: line.a,
    b: Object.freeze({
      x: line.b.x + (line.b.x - line.a.x) / len * distance,
      y: line.b.y + (line.b.y - line.a.y) / len * distance,
    })
  })
  ;
};

/**
 * Returns the distance of `point` to the 
 * nearest point on `line`.
 * 
 * ```js
 * const d = distance(line, {x:10,y:10});
 * ```
 * 
 * If an array of lines is provided, the shortest distance is returned.
 * @param line Line (or array of lines)
 * @param point Point to check against
 * @returns Distance
 */
export const distance = (line:Line|ReadonlyArray<Line>, point:Points.Point):number => {
  if (Array.isArray(line)) {
    const distances = line.map(l => distanceSingleLine(l, point));
    return minFast(distances);
  } else {
    return distanceSingleLine(line as Line, point);
  }
};

const distanceSingleLine = (line:Line, point:Points.Point):number => {
  guard(line, `line`);
  guardPoint(point, `point`);

  const lineLength = length(line);
  if (lineLength === 0) {
    // Line is really a point
    return length(line.a, point);
  }

  const near = nearest(line, point);
  return length(near, point);
};

/**
 * Calculates a point in-between `a` and `b`.
 * 
 * ```js
 * // Get {x,y} at 50% along line
 * interpolate(0.5, line);
 * 
 * // Get {x,y} at 80% between point A and B
 * interpolate(0.8, ptA, ptB);
 * ```
 * @param amount Relative position, 0 being at a, 0.5 being halfway, 1 being at b
 * @param a Start
 * @param b End
 * @returns Point between a and b
 */
export function interpolate(amount: number, a: Points.Point, pointB: Points.Point): Points.Point;
export function interpolate(amount: number, line:Line): Points.Point;

//eslint-disable-next-line func-style
export function interpolate(amount:number, aOrLine:Points.Point|Line, pointB?:Points.Point): Points.Point {
  guardPercent(amount, `amount`);

  const [a, b] = getPointsParam(aOrLine, pointB);

  const d = length(a, b);
  const d2 = d * (1 - amount);

  const x = b.x - (d2 * (b.x - a.x) / d);
  const y = b.y - (d2 * (b.y - a.y) / d);

  return Object.freeze({x: x, y: y});
}

/**
 * Returns a string representation of two points
 * @param a 
 * @param b 
 * @returns 
 */
export function toString (a: Points.Point, b: Points.Point): string;

/**
 * Returns a string representation of a line 
 * @param line 
 */
export function toString(line:Line):string;

/**
 * Returns a string representation of a line or two points.
 * @param a
 * @param b 
 * @returns 
 */
//eslint-disable-next-line func-style
export function toString(a:Points.Point|Line, b?:Points.Point):string {
  if (isLine(a)) {
    guard(a, `a`);
    b = a.b;
    a = a.a;
  } else if (b === undefined) throw new Error(`Expect second point if first is a point`);
  return Points.toString(a) + `-` + Points.toString(b);
}

/**
 * Returns a line from a basis of coordinates
 * ```js
 * // Line from 0,1 -> 10,15
 * fromNumbers(0,1,10,15);
 * ```
 * @param x1 
 * @param y1 
 * @param x2 
 * @param y2 
 * @returns 
 */
export const fromNumbers = (x1: number, y1: number, x2: number, y2: number): Line => {
  if (Number.isNaN(x1)) throw new Error(`x1 is NaN`);
  if (Number.isNaN(x2)) throw new Error(`x2 is NaN`);
  if (Number.isNaN(y1)) throw new Error(`y1 is NaN`);
  if (Number.isNaN(y2)) throw new Error(`y2 is NaN`);

  const a = {x: x1, y: y1};
  const b = {x: x2, y: y2};
  return fromPoints(a, b);
};

/**
 * Returns an array representation of line: [a.x, a.y, b.x, b.y]
 * 
 * See {@link fromArray} to create a line _from_ this representation.
 *
 * @export
 * @param {Point} a
 * @param {Point} b
 * @returns {number[]}
 */
export const toFlatArray = (a: Points.Point, b: Points.Point): readonly number[] =>  [a.x, a.y, b.x, b.y];

/**
 * Returns an SVG description of line
 * @param a 
 * @param b 
 * @returns 
 */
export const toSvgString = (a: Points.Point, b: Points.Point): readonly string[] => [`M${a.x} ${a.y} L ${b.x} ${b.y}`];

/**
 * Returns a line from four numbers [x1,y1,x2,y2].
 * 
 * See {@link toFlatArray} to create an array from a line.
 * 
 * @param arr Array in the form [x1,y1,x2,y2]
 * @returns Line
 */
export const fromFlatArray = (arr: readonly number[]): Line => {
  if (!Array.isArray(arr)) throw new Error(`arr parameter is not an array`);
  if (arr.length !== 4) throw new Error(`array is expected to have length four`);
  return fromNumbers(arr[0], arr[1], arr[2], arr[3]);
};

/**
 * Returns a line from two points
 * ```js
 * // Line from 0,1 to 10,15
 * fromPoints({x:0,y:1}, {x:10,y:15});
 * ```
 * @param a Start point
 * @param b End point
 * @returns 
 */
export const fromPoints = (a: Points.Point, b: Points.Point): Line => {
  guardPoint(a, `a`);
  guardPoint(b, `b`);
  a = Object.freeze({...a});
  b = Object.freeze({...b});
  return Object.freeze({
    a: a,
    b: b
  });
};

/**
 * Returns an array of lines that connects provided points. Note that line is not closed.
 * 
 * Eg, if points a,b,c are provided, two lines are provided: a->b and b->c.
 * @param points 
 * @returns 
 */
export const joinPointsToLines = (...points:readonly Points.Point[]): PolyLine => {
  
  const lines = [];
  //eslint-disable-next-line functional/no-let
  let start = points[0];
  //eslint-disable-next-line functional/no-loop-statement,functional/no-let
  for (let i=1;i<points.length;i++) {
    //eslint-disable-next-line functional/immutable-data
    lines.push(fromPoints(start, points[i]));
    start = points[i];
  }
  return lines;
};

/**
 * Returns a {@link LinePath} from two points
 * @param a 
 * @param b 
 * @returns 
 */
export const fromPointsToPath = (a:Points.Point, b:Points.Point): LinePath => toPath(fromPoints(a, b));

/**
 * Returns a rectangle that encompasses dimension of line
 */
export const bbox = (line:Line):Rects.RectPositioned =>  Points.bbox(line.a, line.b);

/**
 * Returns a path wrapper around a line instance. This is useful if there are a series
 * of operations you want to do with the same line because you don't have to pass it
 * in as an argument to each function.
 * 
 * Note that the line is immutable, so a function like `sum` returns a new LinePath,
 * wrapping the result of `sum`.
 * 
 * ```js
 * // Create a path
 * const l = toPath(fromNumbers(0,0,10,10));
 * l.length();
 * 
 * // Mutate functions return a new path
 * const ll = l.sum({x:10,y:10});
 * ll.length();
 * ```
 * @param line 
 * @returns 
 */
export const toPath = (line:Line): LinePath => {
  const {a, b} = line;
  return Object.freeze({
    ...line,
    length: () => length(a, b),
    interpolate: (amount: number) => interpolate(amount, a, b),
    bbox: () => bbox(line),
    toString: () => toString(a, b),
    toFlatArray: () => toFlatArray(a, b),
    toSvgString: () => toSvgString(a, b),
    toPoints: () => [a, b],
    rotate: (amountRadian:number, origin:Points.Point) => toPath(rotate(line, amountRadian, origin)),
    sum:(point:Points.Point) => toPath(sum(line, point)),
    divide:(point:Points.Point) => toPath(divide(line, point)),
    multiply:(point:Point) => toPath(multiply(line, point)),
    subtract:(point:Point) => toPath(subtract(line, point)),
    apply:(fn:(point:Points.Point) => Points.Point) => toPath(apply(line, fn)),
    kind: `line`
  });
};

export type LinePath = Line & Path & {
  toFlatArray():readonly number[]
  toPoints():readonly Points.Point[]
  rotate(amountRadian:number, origin:Points.Point):LinePath
  sum(point:Points.Point):LinePath
  divide(point:Points.Point):LinePath
  multiply(point:Points.Point):LinePath
  subtract(point:Points.Point):LinePath
  apply(fn:(point:Points.Point) => Points.Point):LinePath
}

/**
 * Returns a line that is rotated by `angleRad`. By default it rotates
 * around its center, but an arbitrary `origin` point can be provided.
 * If `origin` is a number, it's presumed to be a 0..1 percentage of the line.
 * 
 * ```js
 * // Rotates line by 0.1 radians around point 10,10
 * rotate(line, 0.1, {x:10,y:10});
 * 
 * // Rotate line by 5 degrees around its center
 * rotate(line, degreeToRadian(5));
 * 
 * // Rotate line by 5 degres around its end point
 * rotate(line, degreeToRadian(5), line.b);
 * 
 * // Rotate by 90 degrees at the 80% position
 * rotated = rotate(line, Math.PI / 2, 0.8);
 * 
 * ```
 * @param line Line to rotate
 * @param amountRadian Angle in radians to rotate by
 * @param origin Point to rotate around. If undefined, middle of line will be used
 * @returns 
 */
export const rotate = (line:Line, amountRadian?:number, origin?:Points.Point|number):Line => {
  if (amountRadian === undefined || amountRadian === 0) return line;
  if (origin === undefined) origin = 0.5;
  if (typeof origin === `number`) {
    origin = interpolate(origin, line.a, line.b);
  }
  return Object.freeze({
    ...line,
    a: Points.rotate(line.a, amountRadian, origin),
    b: Points.rotate(line.b, amountRadian, origin)
  });
};