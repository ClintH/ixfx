import * as rxjs from 'rxjs';
import * as lit_html from 'lit-html';
import * as lit from 'lit';
import { LitElement } from 'lit';

declare type Point = Readonly<{
    readonly x: number;
    readonly y: number;
    readonly z?: number;
}>;
declare const compareTo: (compareFn: (a: Point, b: Point) => Point, ...points: readonly Point[]) => Point;
declare const distance$1: (a: Point, b: Point) => number;
declare const guard$3: (p: Point, name?: string) => void;
declare const bbox$2: (...points: readonly Point[]) => RectPositioned;
declare const isPoint: (p: Point | RectPositioned | Rect) => p is Readonly<{
    readonly x: number;
    readonly y: number;
    readonly z?: number | undefined;
}>;
/**
 * Returns point as an array in the form [x,y]
 * let a = toArray({x:10, y:5}); // yields [10,5]
 * @param {Point} p
 * @returns {number[]}
 */
declare const toArray: (p: Point) => readonly number[];
declare const toString$2: (p: Point) => string;
/**
 * Returns true if the two points have identical values
 *
 * @param {Point} a
 * @param {Point} b
 * @returns {boolean}
 */
declare const equals$1: (a: Point, b: Point) => boolean;
/**
 * Returns true if two points are within a specified range.
 * Provide a point for the range to set different x/y range, or pass a number
 * to use the same range for both axis.
 *
 * Examples:
 * ```
 * withinRange({x:100,y:100}, {x:101, y:101}, 1); // True
 * withinRange({x:100,y:100}, {x:105, y:101}, {x:5, y:1}); // True
 * withinRange({x:100,y:100}, {x:105, y:105}, {x:5, y:1}); // False - y axis too far
 * ```
 * @param {Point} a
 * @param {Point} b
 * @param {(Point|number)} maxRange
 * @returns {boolean}
 */
declare const withinRange$1: (a: Point, b: Point, maxRange: Point | number) => boolean;
declare const lerp: (amt: number, a: Point, b: Point) => {
    x: number;
    y: number;
};
/**
 * Returns a point from two coordinates or an array of [x,y]
* ```
* let p = fromArray([10, 5]); // yields {x:10, y:5}
* let p = from(10, 5);        // yields {x:10, y:5}
* let p = from(10);           // yields {x:10, y:0} 0 is used for default y
* let p = from();             // yields {x:0, y:0} 0 used for default x & y
* ```
 * @param {(number | number[])} xOrArray
 * @param {number} [y]
 * @returns {Point}
 */
declare const from: (xOrArray?: number | readonly number[] | undefined, y?: number | undefined) => Point;
declare const fromNumbers$1: (...coords: readonly ReadonlyArray<number>[] | readonly number[]) => readonly Point[];
/**
 * Returns `a` minus `b`
 *
 * @param {Point} a
 * @param {Point} b
 * @returns {Point}
 */
declare const diff: (a: Point, b: Point) => Point;
/**
 * Returns `a` minus `b`
 *
 * @param {Point} a
 * @param {Point} b
 * @returns {Point}
 */
declare const sum: (a: Point, b: Point) => Point;
/**
 * Returns `a` multiplied by `b`
 *
 * @param {Point} a
 * @param {Point} b
 * @returns {Point}
 */
declare function multiply(a: Point, b: Point): Point;
/**
 * Returns `a` multipled by some x and/or y scaling factor
 *
 * @export
 * @param {Point} a Point to scale
 * @param {number} x Scale factor for x axis
 * @param {number} [y] Scale factor for y axis (defaults to no scaling)
 * @returns {Point} Scaled point
 */
declare function multiply(a: Point, x: number, y?: number): Point;

type Point$1_Point = Point;
declare const Point$1_compareTo: typeof compareTo;
declare const Point$1_isPoint: typeof isPoint;
declare const Point$1_toArray: typeof toArray;
declare const Point$1_lerp: typeof lerp;
declare const Point$1_from: typeof from;
declare const Point$1_diff: typeof diff;
declare const Point$1_sum: typeof sum;
declare const Point$1_multiply: typeof multiply;
declare namespace Point$1 {
  export {
    Point$1_Point as Point,
    Point$1_compareTo as compareTo,
    distance$1 as distance,
    guard$3 as guard,
    bbox$2 as bbox,
    Point$1_isPoint as isPoint,
    Point$1_toArray as toArray,
    toString$2 as toString,
    equals$1 as equals,
    withinRange$1 as withinRange,
    Point$1_lerp as lerp,
    Point$1_from as from,
    fromNumbers$1 as fromNumbers,
    Point$1_diff as diff,
    Point$1_sum as sum,
    Point$1_multiply as multiply,
  };
}

declare type Rect = {
    readonly width: number;
    readonly height: number;
};
declare type RectPositioned = Point & Rect;
declare const fromElement: (el: HTMLElement) => Rect;
declare const isEqual$1: (a: Rect, b: Rect) => boolean;
declare const fromCenter: (origin: Point, width: number, height: number) => RectPositioned;
declare const maxFromCorners: (topLeft: Point, topRight: Point, bottomRight: Point, bottomLeft: Point) => RectPositioned;
declare const guard$2: (rect: Rect, name?: string) => void;
declare const fromTopLeft: (origin: Point, width: number, height: number) => RectPositioned;
declare const getCorners: (rect: RectPositioned | Rect, origin?: Readonly<{
    readonly x: number;
    readonly y: number;
    readonly z?: number | undefined;
}> | undefined) => readonly Point[];
declare const getCenter: (rect: RectPositioned | Rect, origin?: Readonly<{
    readonly x: number;
    readonly y: number;
    readonly z?: number | undefined;
}> | undefined) => Point;
/**
 * Returns four lines based on each corner.
 * Lines are given in order: top, right, bottom, left
 *
 * @param {(RectPositioned|Rect)} rect
 * @param {Points.Point} [origin]
 * @returns {Lines.Line[]}
 */
declare const getLines: (rect: RectPositioned | Rect, origin?: Readonly<{
    readonly x: number;
    readonly y: number;
    readonly z?: number | undefined;
}> | undefined) => readonly Line[];

type Rect$1_Rect = Rect;
type Rect$1_RectPositioned = RectPositioned;
declare const Rect$1_fromElement: typeof fromElement;
declare const Rect$1_fromCenter: typeof fromCenter;
declare const Rect$1_maxFromCorners: typeof maxFromCorners;
declare const Rect$1_fromTopLeft: typeof fromTopLeft;
declare const Rect$1_getCorners: typeof getCorners;
declare const Rect$1_getCenter: typeof getCenter;
declare const Rect$1_getLines: typeof getLines;
declare namespace Rect$1 {
  export {
    Rect$1_Rect as Rect,
    Rect$1_RectPositioned as RectPositioned,
    Rect$1_fromElement as fromElement,
    isEqual$1 as isEqual,
    Rect$1_fromCenter as fromCenter,
    Rect$1_maxFromCorners as maxFromCorners,
    guard$2 as guard,
    Rect$1_fromTopLeft as fromTopLeft,
    Rect$1_getCorners as getCorners,
    Rect$1_getCenter as getCenter,
    Rect$1_getLines as getLines,
  };
}

declare type Path = {
    length(): number;
    /**
     * Returns a point at a relative (0.0-1.0) position along the path
     *
     * @param {number} t Relative position (0.0-1.0)
     * @returns {Point} Point
     */
    compute(t: number): Point;
    bbox(): RectPositioned;
    toString(): string;
    toSvgString(): string;
    readonly kind: `compound` | `circular` | `arc` | `bezier/cubic` | `bezier/quadratic` | `line`;
};
/**
 * Return the start point of a path
 *
 * @param {Path} path
 * @return {*}  {Point}
 */
declare const getStart: (path: Path) => Point;
/**
 * Return the end point of a path
 *
 * @param {Path} path
 * @return {*}  {Point}
 */
declare const getEnd: (path: Path) => Point;
declare type WithBeziers = {
    getBeziers(): readonly Path[];
};

type Path$1_Path = Path;
declare const Path$1_getStart: typeof getStart;
declare const Path$1_getEnd: typeof getEnd;
type Path$1_WithBeziers = WithBeziers;
declare namespace Path$1 {
  export {
    Path$1_Path as Path,
    Path$1_getStart as getStart,
    Path$1_getEnd as getEnd,
    Path$1_WithBeziers as WithBeziers,
  };
}

declare type Line = {
    readonly a: Point;
    readonly b: Point;
};
declare const isLine: (p: Path | Line | Point) => p is Line;
/**
 * Returns true if the lines have the same value
 *
 * @param {Line} a
 * @param {Line} b
 * @returns {boolean}
 */
declare const equals: (a: Line, b: Line) => boolean;
declare const guard$1: (l: Line, paramName?: string) => void;
declare const angleRadian: (lineOrPoint: Line | Point, b?: Readonly<{
    readonly x: number;
    readonly y: number;
    readonly z?: number | undefined;
}> | undefined) => number;
declare const withinRange: (l: Line, p: Point, maxRange: number) => boolean;
declare const length: (aOrLine: Point | Line, b?: Readonly<{
    readonly x: number;
    readonly y: number;
    readonly z?: number | undefined;
}> | undefined) => number;
declare const nearest: (line: Line, p: Point) => Point;
declare const slope: (lineOrPoint: Line | Point, b?: Readonly<{
    readonly x: number;
    readonly y: number;
    readonly z?: number | undefined;
}> | undefined) => number;
declare const extendX: (line: Line, xIntersection: number) => Point;
/**
 * Returns a line extended from it's start (`a`) by a specified distance
 *
 * ```js
 * const line = {a: {x: 0, y:0}, b: {x:10, y:10} }
 * const extended = extendFromStart(line, 2);
 * ```
 * @param {Line} line
 * @param {number} distance
 * @return {*}  {Line}
 */
declare const extendFromStart: (line: Line, distance: number) => Line;
declare const distance: (l: Line, p: Point) => number;
declare const compute$1: (a: Point, b: Point, t: number) => Point;
declare const toString$1: (a: Point, b: Point) => string;
declare const fromNumbers: (x1: number, y1: number, x2: number, y2: number) => Line;
/**
 * Returns an array representation of line: [a.x, a.y, b.x, b.y]
 *
 * @export
 * @param {Point} a
 * @param {Point} b
 * @returns {number[]}
 */
declare const toFlatArray: (a: Point, b: Point) => readonly number[];
declare const toSvgString$1: (a: Point, b: Point) => string;
declare const fromArray: (arr: readonly number[]) => Line;
declare const fromPoints: (a: Point, b: Point) => Line;
declare const joinPointsToLines: (...points: readonly Point[]) => readonly Line[];
declare const fromPointsToPath: (a: Point, b: Point) => LinePath;
declare type LinePath = Line & Path & {
    toFlatArray(): readonly number[];
};
declare const bbox$1: (line: Line) => RectPositioned;
declare const toPath$1: (line: Line) => LinePath;

type Line$1_Line = Line;
declare const Line$1_isLine: typeof isLine;
declare const Line$1_equals: typeof equals;
declare const Line$1_angleRadian: typeof angleRadian;
declare const Line$1_withinRange: typeof withinRange;
declare const Line$1_length: typeof length;
declare const Line$1_nearest: typeof nearest;
declare const Line$1_slope: typeof slope;
declare const Line$1_extendX: typeof extendX;
declare const Line$1_extendFromStart: typeof extendFromStart;
declare const Line$1_distance: typeof distance;
declare const Line$1_fromNumbers: typeof fromNumbers;
declare const Line$1_toFlatArray: typeof toFlatArray;
declare const Line$1_fromArray: typeof fromArray;
declare const Line$1_fromPoints: typeof fromPoints;
declare const Line$1_joinPointsToLines: typeof joinPointsToLines;
declare const Line$1_fromPointsToPath: typeof fromPointsToPath;
type Line$1_LinePath = LinePath;
declare namespace Line$1 {
  export {
    Line$1_Line as Line,
    Line$1_isLine as isLine,
    Line$1_equals as equals,
    guard$1 as guard,
    Line$1_angleRadian as angleRadian,
    Line$1_withinRange as withinRange,
    Line$1_length as length,
    Line$1_nearest as nearest,
    Line$1_slope as slope,
    Line$1_extendX as extendX,
    Line$1_extendFromStart as extendFromStart,
    Line$1_distance as distance,
    compute$1 as compute,
    toString$1 as toString,
    Line$1_fromNumbers as fromNumbers,
    Line$1_toFlatArray as toFlatArray,
    toSvgString$1 as toSvgString,
    Line$1_fromArray as fromArray,
    Line$1_fromPoints as fromPoints,
    Line$1_joinPointsToLines as joinPointsToLines,
    Line$1_fromPointsToPath as fromPointsToPath,
    Line$1_LinePath as LinePath,
    bbox$1 as bbox,
    toPath$1 as toPath,
  };
}

declare type QuadraticBezier = {
    readonly a: Point;
    readonly b: Point;
    readonly quadratic: Point;
};
declare type QuadraticBezierPath = Path & QuadraticBezier;
declare type CubicBezier = {
    readonly a: Point;
    readonly b: Point;
    readonly cubic1: Point;
    readonly cubic2: Point;
};
declare type CubicBezierPath = Path & CubicBezier;
declare const isQuadraticBezier: (path: Path | QuadraticBezier | CubicBezier) => path is QuadraticBezier;
declare const isCubicBezier: (path: Path | CubicBezier | QuadraticBezier) => path is CubicBezier;
/**
 * Returns a new quadratic bezier with specified bend amount
 *
 * @param {QuadraticBezier} b Curve
 * @param {number} [bend=0] Bend amount, from -1 to 1
 * @returns {QuadraticBezier}
 */
declare const quadraticBend: (a: Point, b: Point, bend?: number) => QuadraticBezier;
/**
 * Creates a simple quadratic bezier with a specified amount of 'bend'.
 * Bend of -1 will pull curve down, 1 will pull curve up. 0 is no curve
 * @param {Points.Point} start Start of curve
 * @param {Points.Point} end End of curve
 * @param {number} [bend=0] Bend amount, -1 to 1
 * @returns {QuadraticBezier}
 */
declare const quadraticSimple: (start: Point, end: Point, bend?: number) => QuadraticBezier;
declare const quadraticToSvgString: (start: Point, end: Point, handle: Point) => string;
declare const toPath: (cubicOrQuadratic: CubicBezier | QuadraticBezier) => CubicBezierPath | QuadraticBezierPath;
declare const cubic: (start: Point, end: Point, cubic1: Point, cubic2: Point) => CubicBezier;
declare const quadratic: (start: Point, end: Point, handle: Point) => QuadraticBezier;

type Bezier_QuadraticBezier = QuadraticBezier;
type Bezier_QuadraticBezierPath = QuadraticBezierPath;
type Bezier_CubicBezier = CubicBezier;
type Bezier_CubicBezierPath = CubicBezierPath;
declare const Bezier_isQuadraticBezier: typeof isQuadraticBezier;
declare const Bezier_isCubicBezier: typeof isCubicBezier;
declare const Bezier_quadraticBend: typeof quadraticBend;
declare const Bezier_quadraticSimple: typeof quadraticSimple;
declare const Bezier_quadraticToSvgString: typeof quadraticToSvgString;
declare const Bezier_toPath: typeof toPath;
declare const Bezier_cubic: typeof cubic;
declare const Bezier_quadratic: typeof quadratic;
declare namespace Bezier {
  export {
    Bezier_QuadraticBezier as QuadraticBezier,
    Bezier_QuadraticBezierPath as QuadraticBezierPath,
    Bezier_CubicBezier as CubicBezier,
    Bezier_CubicBezierPath as CubicBezierPath,
    Bezier_isQuadraticBezier as isQuadraticBezier,
    Bezier_isCubicBezier as isCubicBezier,
    Bezier_quadraticBend as quadraticBend,
    Bezier_quadraticSimple as quadraticSimple,
    Bezier_quadraticToSvgString as quadraticToSvgString,
    Bezier_toPath as toPath,
    Bezier_cubic as cubic,
    Bezier_quadratic as quadratic,
  };
}

declare type CompoundPath = Path & {
    segments: Path[];
    kind: `compound`;
};
/**
 * Returns a new compoundpath, replacing a path at a given index
 *
 * @param {CompoundPath} compoundPath Existing compoundpath
 * @param {number} index Index to replace at
 * @param {Paths.Path} path Path to substitute in
 * @returns {CompoundPath} New compoundpath
 */
declare const setSegment: (compoundPath: CompoundPath, index: number, path: Path) => CompoundPath;
/**
 * Computes x,y point at a relative position along compoundpath
 *
 * @param {Paths.Path[]} paths Combined paths (assumes contiguous)
 * @param {number} t Position (given as a percentage from 0 to 1)
 * @param {boolean} [useWidth] If true, widths are used for calulcating. If false, lengths are used
 * @param {Dimensions} [dimensions] Precalculated dimensions of paths, will be computed if omitted
 * @returns
 */
declare const compute: (paths: Path[], t: number, useWidth?: boolean | undefined, dimensions?: Dimensions | undefined) => Readonly<{
    readonly x: number;
    readonly y: number;
    readonly z?: number | undefined;
}>;
declare type Dimensions = {
    /**
     * Width of each path (based on bounding box)
     *
     * @type {number[]}
     */
    widths: number[];
    /**
     * Length of each path
     *
     * @type {number[]}
     */
    lengths: number[];
    /**
     * Total length of all paths
     *
     * @type {number}
     */
    totalLength: number;
    /**
     * Total width of all paths
     *
     * @type {number}
     */
    totalWidth: number;
};
/**
 * Computes the widths and lengths of all paths, adding them up as well
 *
 * @param {Paths.Path[]} paths
 * @returns {Dimensions}
 */
declare const computeDimensions: (paths: Path[]) => Dimensions;
/**
 * Computes the bounding box that encloses entire compoundpath
 *
 * @param {Paths.Path[]} paths
 *
 * @returns {Rects.Rect}
 */
declare const bbox: (paths: Path[]) => RectPositioned;
/**
 * Produce a human-friendly representation of paths
 *
 * @param {Paths.Path[]} paths
 * @returns {string}
 */
declare const toString: (paths: Path[]) => string;
/**
 * Throws an error if paths are not connected together, in order
 *
 * @param {Paths.Path[]} paths
 */
declare const guardContinuous: (paths: Path[]) => void;
declare const toSvgString: (paths: Path[]) => string;
/**
 * Create a compoundpath from an array of paths.
 * All this does is verify they are connected, and precomputes dimensions
 *
 * @param {...Paths.Path[]} paths
 * @returns {CompoundPath}
 */
declare const fromPaths: (...paths: Path[]) => CompoundPath;

type CompoundPath$1_CompoundPath = CompoundPath;
declare const CompoundPath$1_setSegment: typeof setSegment;
declare const CompoundPath$1_compute: typeof compute;
declare const CompoundPath$1_computeDimensions: typeof computeDimensions;
declare const CompoundPath$1_bbox: typeof bbox;
declare const CompoundPath$1_toString: typeof toString;
declare const CompoundPath$1_guardContinuous: typeof guardContinuous;
declare const CompoundPath$1_toSvgString: typeof toSvgString;
declare const CompoundPath$1_fromPaths: typeof fromPaths;
declare namespace CompoundPath$1 {
  export {
    CompoundPath$1_CompoundPath as CompoundPath,
    CompoundPath$1_setSegment as setSegment,
    CompoundPath$1_compute as compute,
    CompoundPath$1_computeDimensions as computeDimensions,
    CompoundPath$1_bbox as bbox,
    CompoundPath$1_toString as toString,
    CompoundPath$1_guardContinuous as guardContinuous,
    CompoundPath$1_toSvgString as toSvgString,
    CompoundPath$1_fromPaths as fromPaths,
  };
}

declare type ToString<V> = (itemToMakeStringFor: V) => string;
declare type IsEqual<V> = (a: V, b: V) => boolean;

declare type Listener<Events> = (ev: unknown, sender: SimpleEventEmitter<Events>) => void;
declare class SimpleEventEmitter<Events> {
    #private;
    protected fireEvent<K extends keyof Events>(type: K, args: Events[K]): void;
    /**
     * Adds event listener
     *
     * @template K
     * @param {K} type
     * @param {Listener<Events>} listener
     * @memberof SimpleEventEmitter
     */
    addEventListener<K extends keyof Events>(type: K, listener: (ev: Events[K], sender: SimpleEventEmitter<Events>) => void): void;
    /**
     * Remove event listener
     *
     * @param {Listener<Events>} listener
     * @memberof SimpleEventEmitter
     */
    removeEventListener<K extends keyof Events>(type: K, listener: Listener<Events>): void;
    /**
     * Clear all event listeners
     *
     * @memberof SimpleEventEmitter
     */
    clearEventListeners(): void;
}

declare type MutableValueSetEventMap<V> = {
    readonly add: {
        readonly value: V;
        readonly updated: boolean;
    };
    readonly clear: boolean;
    readonly delete: V;
};
declare const addUniqueByHash: <V>(set: ReadonlyMap<string, V> | undefined, hashFunc: ToString<V>, ...values: readonly V[]) => Map<any, any>;
declare const mutableStringSet: <V>(keyString?: ToString<V> | undefined) => MutableStringSetImpl<V>;
declare type MutableStringSet<V> = {
    readonly add: (item: V) => void;
    readonly has: (item: V) => boolean;
};
/**
 * A mutable set that stores unique items by their value, rather
 * than object reference.
 *
 * By default the JSON.stringify() representation is used to compare
 * objects. Alternatively, pass a function into the constructor
 *
 * It also fires `add`, `clear` and `delete` events.
 *
 * Usage
 * ```
 * .add(item);    // Add one or more items. Items with same key are overriden.
 * .has(item);    // Returns true if item *value* is present
 * .clear();      // Remove everything
 * .delete(item); // Delete item by value
 * .toArray();    // Returns values as an array
 * .values();     // Returns an iterator over values
 * ```
 *
 * Example
 * ```
 * const people = [
 *  {name: `Barry`, city: `London`}
 *  {name: `Sally`, city: `Bristol`}
 * ];
 * const set = mutableValueSet(person => {
 *  // Key person objects by name and city (assi)
 *  return `${person.name}-${person.city}`
 * });
 * set.add(...people);
 *
 * set.has({name:`Barry`, city:`Manchester`})); // False, key is different (Barry-Manchester)
 * set.has({name:`Barry`, city:`London`}));     // True, we have Barry-London as a key
 * set.has(people[1]);   // True, key of object is found (Sally-Bristol)
 *
 * set.addEventListener(`add`, newItem => {
 *  console.log(`New item added: ${newItem}`);
 * });
 * ```
 *
 * @export
 * @class MutableValueSet
 * @template V
 */
declare class MutableStringSetImpl<V> extends SimpleEventEmitter<MutableValueSetEventMap<V>> {
    store: Map<string, V>;
    keyString: ToString<V>;
    constructor(keyString?: ToString<V> | undefined);
    add(...v: ReadonlyArray<V>): void;
    values(): IterableIterator<V>;
    clear(): void;
    delete(v: V): boolean;
    has(v: V): boolean;
    toArray(): V[];
}

declare const Set_addUniqueByHash: typeof addUniqueByHash;
declare const Set_mutableStringSet: typeof mutableStringSet;
type Set_MutableStringSet<V> = MutableStringSet<V>;
declare namespace Set {
  export {
    Set_addUniqueByHash as addUniqueByHash,
    Set_mutableStringSet as mutableStringSet,
    Set_MutableStringSet as MutableStringSet,
  };
}

declare type GridVisual = Readonly<{
    readonly size: number;
}>;
declare type Grid = Readonly<{
    readonly rows: number;
    readonly cols: number;
}>;
declare type Cell = Readonly<{
    readonly x: number;
    readonly y: number;
}>;
declare type Neighbours = Readonly<{
    readonly n: Cell | undefined;
    readonly e: Cell | undefined;
    readonly s: Cell | undefined;
    readonly w: Cell | undefined;
    readonly ne: Cell | undefined;
    readonly nw: Cell | undefined;
    readonly se: Cell | undefined;
    readonly sw: Cell | undefined;
}>;
declare type CardinalDirection = `` | `n` | `ne` | `e` | `se` | `s` | `sw` | `w` | `nw`;
declare type BoundsLogic = `unbounded` | `undefined` | `stop` | `wrap`;
declare type VisitorLogic = {
    readonly options?: IdentifyNeighbours;
    readonly select: NeighbourSelector;
};
declare type VisitGenerator = Generator<Readonly<Cell>, void, unknown>;
declare type VisitorOpts = {
    readonly visited?: MutableStringSet<Cell>;
    readonly reversed?: boolean;
    readonly debug?: boolean;
};
declare type Visitor = (grid: Grid, start: Cell, opts?: VisitorOpts) => VisitGenerator;
declare type NeighbourMaybe = readonly [keyof Neighbours, Cell | undefined];
declare type Neighbour = readonly [keyof Neighbours, Cell];
declare type NeighbourSelector = (neighbours: ReadonlyArray<Neighbour>) => Neighbour | undefined;
declare type IdentifyNeighbours = (grid: Grid, origin: Cell) => ReadonlyArray<Neighbour>;
/**
 * Returns true if grids `a` and `b` are equal in value
 *
 * @param {(Grid|GridVisual)} a
 * @param {(Grid|GridVisual)} b
 * @return {*}  {boolean}
 */
declare const isEqual: (a: Grid | GridVisual, b: Grid | GridVisual) => boolean;
/**
 * Returns a key string for a cell instance
 * A key string allows comparison of instances by value rather than reference
 * @param {Cell} v
 * @returns {string}
 */
declare const cellKeyString: (v: Cell) => string;
/**
 * Returns true if two cells equal. Returns false if either cell (or both) are undefined
 *
 * @param {Cell} a
 * @param {Cell} b
 * @returns {boolean}
 */
declare const cellEquals: (a: Cell, b: Cell) => boolean;
declare const guard: (a: Cell, paramName?: string, grid?: Readonly<{
    readonly rows: number;
    readonly cols: number;
}> | undefined) => void;
/**
 * Returns true if cell coordinates are above zero and within bounds of grid
 *
 * @param {Grid} grid
 * @param {Cell} cell
 * @return {*}  {boolean}
 */
declare const inside: (grid: Grid, cell: Cell) => boolean;
/**
 * Returns a rect of the cell, positioned from the top-left corner
 *
 * @param {Cell} cell
 * @param {(Grid & GridVisual)} grid
 * @return {*}  {Rect.RectPositioned}
 */
declare const rectangleForCell: (cell: Cell, grid: Grid & GridVisual) => RectPositioned;
/**
 * Returns the cell at a specified visual coordinate
 *
 * @param {Point.Point} position Position, eg in pixels
 * @param {(Grid & GridVisual)} grid Grid
 * @return {*}  {(Cell | undefined)} Cell at position or undefined if outside of the grid
 */
declare const cellAtPoint: (position: Point, grid: Grid & GridVisual) => Cell | undefined;
declare const allDirections: readonly CardinalDirection[];
declare const crossDirections: readonly CardinalDirection[];
declare const neighbours: (grid: Grid, cell: Cell, bounds?: BoundsLogic, directions?: readonly CardinalDirection[] | undefined) => Neighbours;
/**
 * Returns the pixel midpoint of a cell
 *
 * @param {Cell} cell
 * @param {(Grid & GridVisual)} grid
 * @return {*}  {Point.Point}
 */
declare const cellMiddle: (cell: Cell, grid: Grid & GridVisual) => Point;
/**
 * Returns the cells on the line of start and end, inclusive
 *
 * @param {Cell} start Starting cel
 * @param {Cell} end End cell
 * @returns {Cell[]}
 */
declare const getLine: (start: Cell, end: Cell) => ReadonlyArray<Cell>;
/**
 * Returns cells that correspond to the cardinal directions at a specified distance
 *
 * @param grid Griod
 * @param steps Distance
 * @param start Start poiint
 * @param bound Logic for if bounds of grid are exceeded
 * @returns Cells corresponding to cardinals
 */
declare const offsetCardinals: (grid: Grid, start: Cell, steps: number, bounds?: BoundsLogic) => Neighbours;
/**
 * Returns an {x,y} signed vector corresponding to the provided cardinal direction.
 * ```
 * const n = getVectorFromCardinal(`n`); // {x: 0, y: -1}
 * ```
 * Optional `multiplier` can be applied to vector
 * ```
 * const n = getVectorFromCardinal(`n`, 10); // {x: 0, y: -10}
 * ```
 *
 * Blank direction returns {x: 0, y: 0}
 * @param cardinal Direction
 * @param multiplier Multipler
 * @returns Signed vector in the form of {x,y}
 */
declare const getVectorFromCardinal: (cardinal: CardinalDirection, multiplier?: number) => Cell;
/**
 * Returns a list of cells from `start` to `end`.
 *
 * Throws an error if start and end are not on same row or column.
 *
 * @param start Start cell
 * @param end end clel
 * @param endInclusive
 * @return {*}  {ReadonlyArray<Cell>}
 */
declare const simpleLine: (start: Cell, end: Cell, endInclusive?: boolean) => ReadonlyArray<Cell>;
/**
 *
 * Returns a coordinate offset from `start` by `vector` amount.
 *
 * Different behaviour can be specified for how to handle when coordinates exceed the bounds of the grid
 *
 *
 * Note: x and y wrapping are calculated independently. A large wrapping of x, for example won't shift down a line
 * @param {Grid} grid Grid to traverse
 * @param {Cell} vector Offset in x/y
 * @param {Cell} start Start point
 * @param {BoundsLogic} [bounds=`undefined`]
 * @returns {(Cell | undefined)}
 */
declare const offset: (grid: Grid, start: Cell, vector: Cell, bounds?: BoundsLogic) => Cell | undefined;
/**
 * Visits every cell in grid using supplied selection function
 * In-built functions to use: visitorDepth, visitorBreadth, visitorRandom
 *
 * Usage example:
 * ```js
 *  let visitor = Grids.visitor(Grids.visitorRandom, grid, startCell);
 *  for (let cell of visitor) {
 *   // do something with cell
 *  }
 * ```
 *
 * If you want to keep tabs on the visitor, pass in a MutableValueSet. This is
 * updated with visited cells (and is used internally anyway)
 * ```js
 *  let visited = new mutableValueSet<Grids.Cell>(c => Grids.cellKeyString(c));
 *  let visitor = Grids.visitor(Grids.visitorRandom, grid, startCell, visited);
 * ```
 *
 * To visit with some delay, try this pattern
 * ```js
 *  const delayMs = 100;
 *  const run = () => {
 *   let cell = visitor.next().value;
 *   if (cell === undefined) return;
 *   // Do something with cell
 *   setTimeout(run, delayMs);
 *  }
 *  setTimeout(run, delayMs);
 * ```
 * @param {(neighbourSelect: NeighbourSelector} neighbourSelect Select neighbour to visit
 * @param {Grid} grid Grid to visit
 * @param {Cell} start Starting cell
 * @param {MutableStringSet<Cell>} [visited] Optional tracker of visited cells
 * @returns {Iterable<Cell>}
 */
declare const visitor: (logic: VisitorLogic, grid: Grid, start: Cell, opts?: VisitorOpts) => VisitGenerator;
declare const visitorDepth: (grid: Grid, start: Cell, opts?: VisitorOpts) => VisitGenerator;
declare const visitorBreadth: (grid: Grid, start: Cell, opts?: VisitorOpts) => VisitGenerator;
declare const visitorRandomContiguous: (grid: Grid, start: Cell, opts?: VisitorOpts) => VisitGenerator;
declare const visitorRandom: (grid: Grid, start: Cell, opts?: VisitorOpts) => VisitGenerator;
declare const visitorRow: (grid: Grid, start: Cell, opts?: VisitorOpts) => VisitGenerator;
declare const visitFor: (grid: Grid, start: Cell, steps: number, visitor: Visitor) => Cell;
declare const visitorColumn: (grid: Grid, start: Cell, opts?: VisitorOpts) => VisitGenerator;
/**
 * Enumerate all cells in an efficient manner. If end of grid is reached, iterator will wrap to ensure all are visited.
 *
 * @param {Grid} grid
 * @param {Cell} [start={x:0, y:0}]
 */
declare const cells: (grid: Grid, start?: Cell) => Generator<{
    x: number;
    y: number;
}, void, unknown>;

type Grid$1_GridVisual = GridVisual;
type Grid$1_Grid = Grid;
type Grid$1_Cell = Cell;
type Grid$1_Neighbours = Neighbours;
type Grid$1_CardinalDirection = CardinalDirection;
type Grid$1_BoundsLogic = BoundsLogic;
type Grid$1_VisitGenerator = VisitGenerator;
type Grid$1_VisitorOpts = VisitorOpts;
type Grid$1_Visitor = Visitor;
type Grid$1_NeighbourMaybe = NeighbourMaybe;
type Grid$1_Neighbour = Neighbour;
declare const Grid$1_isEqual: typeof isEqual;
declare const Grid$1_cellKeyString: typeof cellKeyString;
declare const Grid$1_cellEquals: typeof cellEquals;
declare const Grid$1_guard: typeof guard;
declare const Grid$1_inside: typeof inside;
declare const Grid$1_rectangleForCell: typeof rectangleForCell;
declare const Grid$1_cellAtPoint: typeof cellAtPoint;
declare const Grid$1_allDirections: typeof allDirections;
declare const Grid$1_crossDirections: typeof crossDirections;
declare const Grid$1_neighbours: typeof neighbours;
declare const Grid$1_cellMiddle: typeof cellMiddle;
declare const Grid$1_getLine: typeof getLine;
declare const Grid$1_offsetCardinals: typeof offsetCardinals;
declare const Grid$1_getVectorFromCardinal: typeof getVectorFromCardinal;
declare const Grid$1_simpleLine: typeof simpleLine;
declare const Grid$1_offset: typeof offset;
declare const Grid$1_visitor: typeof visitor;
declare const Grid$1_visitorDepth: typeof visitorDepth;
declare const Grid$1_visitorBreadth: typeof visitorBreadth;
declare const Grid$1_visitorRandomContiguous: typeof visitorRandomContiguous;
declare const Grid$1_visitorRandom: typeof visitorRandom;
declare const Grid$1_visitorRow: typeof visitorRow;
declare const Grid$1_visitFor: typeof visitFor;
declare const Grid$1_visitorColumn: typeof visitorColumn;
declare const Grid$1_cells: typeof cells;
declare namespace Grid$1 {
  export {
    Grid$1_GridVisual as GridVisual,
    Grid$1_Grid as Grid,
    Grid$1_Cell as Cell,
    Grid$1_Neighbours as Neighbours,
    Grid$1_CardinalDirection as CardinalDirection,
    Grid$1_BoundsLogic as BoundsLogic,
    Grid$1_VisitGenerator as VisitGenerator,
    Grid$1_VisitorOpts as VisitorOpts,
    Grid$1_Visitor as Visitor,
    Grid$1_NeighbourMaybe as NeighbourMaybe,
    Grid$1_Neighbour as Neighbour,
    Grid$1_isEqual as isEqual,
    Grid$1_cellKeyString as cellKeyString,
    Grid$1_cellEquals as cellEquals,
    Grid$1_guard as guard,
    Grid$1_inside as inside,
    Grid$1_rectangleForCell as rectangleForCell,
    Grid$1_cellAtPoint as cellAtPoint,
    Grid$1_allDirections as allDirections,
    Grid$1_crossDirections as crossDirections,
    Grid$1_neighbours as neighbours,
    Grid$1_cellMiddle as cellMiddle,
    Grid$1_getLine as getLine,
    Grid$1_offsetCardinals as offsetCardinals,
    Grid$1_getVectorFromCardinal as getVectorFromCardinal,
    Grid$1_simpleLine as simpleLine,
    Grid$1_offset as offset,
    Grid$1_visitor as visitor,
    Grid$1_visitorDepth as visitorDepth,
    Grid$1_visitorBreadth as visitorBreadth,
    Grid$1_visitorRandomContiguous as visitorRandomContiguous,
    Grid$1_visitorRandom as visitorRandom,
    Grid$1_visitorRow as visitorRow,
    Grid$1_visitFor as visitFor,
    Grid$1_visitorColumn as visitorColumn,
    Grid$1_cells as cells,
  };
}

declare const defaultAdsrOpts: () => AdsrOpts;
declare type AdsrOpts = AdsrBaseOpts & {
    /**
     * Attack bezier 'bend'
     *
     * @type {number} Bend from -1 to 1. 0 for a straight line
     */
    readonly attackBend: number;
    /**
     * Decay bezier 'bend'
     *
     * @type {number} Bend from -1 to 1. 0 for a straight line
     */
    readonly decayBend: number;
    /**
     * Release bezier 'bend'
     *
     * @type {number} Bend from -1 to 1. 0 for a straight line
     */
    readonly releaseBend: number;
    readonly peakLevel: number;
    readonly initialLevel: number;
    readonly sustainLevel: number;
    readonly releaseLevel: number;
};
declare type AdsrBaseOpts = {
    /**
     * If true, envelope indefinately returns to attack stage after release
     *
     * @type {boolean}
     */
    readonly shouldLoop: boolean;
    /**
     * Duration for attack stage
     * Unit depends on timer source
     * @type {number}
     */
    readonly attackDuration: number;
    /**
     * Duration for decay stage
     * Unit depends on timer source
     * @type {number}
     */
    readonly decayDuration: number;
    /**
     * Duration for release stage
     * Unit depends on timer source
     * @type {number}
     */
    readonly releaseDuration: number;
};
interface StateChangeEvent {
    readonly newState: string;
    readonly priorState: string;
}
interface CompleteEvent {
}
declare type Events = {
    readonly change: StateChangeEvent;
    readonly complete: CompleteEvent;
};
declare class AdsrBase extends SimpleEventEmitter<Events> {
    #private;
    attackDuration: number;
    decayDuration: number;
    releaseDuration: number;
    decayDurationTotal: number;
    shouldLoop: boolean;
    constructor(opts: AdsrBaseOpts);
    switchState(): void;
    computeRaw(): [stage: string | undefined, amount: number];
    get isDone(): boolean;
    trigger(hold?: boolean): void;
    release(): void;
}
declare class Adsr extends AdsrBase {
    readonly attackPath: Path;
    readonly decayPath: Path;
    readonly releasePath: Path;
    readonly initialLevel: number;
    readonly peakLevel: number;
    readonly releaseLevel: number;
    readonly sustainLevel: number;
    readonly attackBend: number;
    readonly decayBend: number;
    readonly releaseBend: number;
    constructor(opts: AdsrOpts);
    compute(): [stage: string | undefined, scaled: number, raw: number];
}
declare const adsr: (opts: AdsrOpts) => Adsr;

declare const Envelope_defaultAdsrOpts: typeof defaultAdsrOpts;
type Envelope_AdsrOpts = AdsrOpts;
type Envelope_AdsrBaseOpts = AdsrBaseOpts;
type Envelope_StateChangeEvent = StateChangeEvent;
type Envelope_CompleteEvent = CompleteEvent;
declare const Envelope_adsr: typeof adsr;
declare namespace Envelope {
  export {
    Envelope_defaultAdsrOpts as defaultAdsrOpts,
    Envelope_AdsrOpts as AdsrOpts,
    Envelope_AdsrBaseOpts as AdsrBaseOpts,
    Envelope_StateChangeEvent as StateChangeEvent,
    Envelope_CompleteEvent as CompleteEvent,
    Envelope_adsr as adsr,
  };
}

/**
 * Creates an easing based on clock time
 *
 * @param {string} easingName Name of easing
 * @param {number} durationMs Duration in milliseconds
 * @returns Easing
 */
declare const timer: (easingName: string, durationMs: number) => Easing;
/**
 * Creates an easing based on ticks
 *
 * @param {string} easingName Name of easing
 * @param {number} durationTicks Duration in ticks
 * @returns {Easing}
 */
declare const tick: (easingName: string, durationTicks: number) => Easing;
declare type Easing = {
    /**
     * Computes the current value of the easing
     *
     * @returns {number}
     */
    compute(): number;
    /**
     * Reset the easing
     *
     */
    reset(): void;
    /**
     * Returns true if the easing is complete
     *
     * @returns {boolean}
     */
    isDone(): boolean;
};
/**
 * Return list of available easings
 *
 * @returns {string[]}
 */
declare const getEasings: () => string[];

declare const Easing$1_timer: typeof timer;
declare const Easing$1_tick: typeof tick;
type Easing$1_Easing = Easing;
declare const Easing$1_getEasings: typeof getEasings;
declare namespace Easing$1 {
  export {
    Easing$1_timer as timer,
    Easing$1_tick as tick,
    Easing$1_Easing as Easing,
    Easing$1_getEasings as getEasings,
  };
}

/**
 * The circular array grows to a fixed size. Once full, new
 * items replace the oldest item in the array. Immutable.
 *
 * Usage:
 * ```
 * let a = new Circular(10);
 * let b = a.add(something);
 * ```
 * @class CircularArray
 * @extends {Array}
 * @template V
 */
declare class MutableCircularArray<V> extends Array {
    #private;
    constructor(capacity: number);
    /**
     * Returns a new Circular with item added
     *
     * @param {V} thing Thing to add
     * @returns {Circular<V>} Circular with item added
     * @memberof Circular
     */
    add(thing: V): MutableCircularArray<V>;
    get pointer(): number;
    get isFull(): boolean;
}

declare class BasePlot {
    canvasEl: HTMLCanvasElement;
    precision: number;
    paused: boolean;
    scaleMin: number;
    scaleMax: number;
    allowScaleDeflation: boolean;
    labelInset: number;
    lastPaint: number;
    maxPaintMs: number;
    textHeight: number;
    plotPadding: number;
    showMiddle: boolean;
    showScale: boolean;
    drawLoop: () => void;
    constructor(canvasEl: HTMLCanvasElement);
    pushScale(min: number, max: number): number;
    map(value: number, x1: number, y1: number, x2: number, y2: number): number;
    scaleNumber(v: number): string;
    drawScale(g: CanvasRenderingContext2D, min: number, max: number, avg: number, range: number, plotWidth: number, plotHeight: number): void;
    baseDraw(): void;
    draw(g: CanvasRenderingContext2D, plotWidth: number, plotHeight: number): void;
    repaint(): void;
}

/**
 * Usage:
 * let plot = new Plot(plotCanvasEl)
 * plot.push(value)
 *
 * @export
 * @class Plot
 * @extends {BaseGraph}
 */
declare class Plot extends BasePlot {
    buffer: MutableCircularArray<number>;
    readonly samples: number;
    color: string;
    lineWidth: number;
    constructor(canvasEl: HTMLCanvasElement, samples?: number);
    draw(g: CanvasRenderingContext2D, plotWidth: number, plotHeight: number): void;
    clear(): void;
    push(v: number): void;
}

declare type Circle = {
    readonly radius: number;
};
declare type CirclePositioned = Point & Circle;

declare type Arc = {
    readonly radius: number;
    readonly startRadian: number;
    readonly endRadian: number;
    readonly counterClockwise?: boolean;
};
declare type ArcPositioned = Point & Arc;

declare enum OverflowPolicy$1 {
    /**
     * Removes items front of the queue (ie older items are discarded)
     */
    DiscardOlder = 0,
    /**
     * Remove from rear of queue to make space for new items (ie newer items are discarded)
     */
    DiscardNewer = 1,
    /**
     * Only adds new items that there are room for (ie. brand new items are discarded)
     */
    DiscardAdditions = 2
}
declare type StackOpts = {
    readonly debug?: boolean;
    readonly capacity?: number;
    readonly overflowPolicy?: OverflowPolicy$1;
};
/**
 * Immutable stack
 * `Push` & `pop` both return a new instance, the original is never modified.
 *
 * Usage:
 * ```
 * push(item);  // Return a new stack with item(s) added
 * pop();       // Return a new stack with top-most item removed (ie. newest)
 * .peek;       // Return what is at the top of the stack or undefined if empty
 * .isEmpty/.isFull;
 * .length;     // How many items in stack
 * .data;       // Get the underlying array
 * ```
 *
 * Example
 * ```
 * let sanga = new Stack();
 * sanga = sanga.push(`bread`, `tomato`, `cheese`);
 * sanga.peek;  // `cheese`
 * sanga = sanga.pop(); // removes `cheese`
 * sanga.peek;  // `tomato`
 * const sangaAlt = sanga.push(`lettuce`, `cheese`); // sanga stays [`bread`, `tomato`], while sangaAlt is [`bread`, `tomato`, `lettuce`, `cheese`]
 * ```
 *
 * Stack can also be created from the basis of an existing array. First index of array will be the bottom of the stack.
 * @class Stack
 * @template V
 */
declare class Stack<V> {
    readonly opts: StackOpts;
    readonly data: ReadonlyArray<V>;
    constructor(opts: StackOpts, data: ReadonlyArray<V>);
    push(...toAdd: ReadonlyArray<V>): Stack<V>;
    pop(): Stack<V>;
    /**
     * Enumerates stack from bottom-to-top
     *
     * @param {(v:V) => void} fn
     * @memberof Stack
     */
    forEach(fn: (v: V) => void): void;
    forEachFromTop(fn: (v: V) => void): void;
    get isEmpty(): boolean;
    get isFull(): boolean;
    get peek(): V | undefined;
    get length(): number;
}
/**
 * Returns an immutable stack
 *
 * @template V
 * @param {StackOpts} [opts={}]
 * @param {...V[]} startingItems
 * @returns {Stack<V>}
 */
declare const stack: <V>(opts?: StackOpts, ...startingItems: readonly V[]) => Stack<V>;
/**
 * Mutable stack
 *
 * Usage:
 * ```
 * push(item); // Add one or more items to the top of the stack
 * pop(); // Removes and retiurns the item at the top of the stack (ie the newest thing)
 * .peek; // Return what is at the top of the stack or undefined if empty
 * .isEmpty/.isFull;
 * .length; // How many items in stack
 * .data; // Get the underlying array
 * ```
 *
 * Example
 * ```
 * const sanga = new MutableStack();
 * sanga.push(`bread`, `tomato`, `cheese`);
 * sanga.peek;  // `cheese`
 * sanga.pop(); // removes `cheese`
 * sanga.peek;  // `tomato`
 * sanga.push(`lettuce`, `cheese`); // Stack is now [`bread`, `tomato`, `lettuce`, `cheese`]
 * ```
 *
 * Stack can also be created from the basis of an existing array. First index of array will be the bottom of the stack.
 * @class MutableStack
 * @template V
 */
declare class MutableStack<V> {
    readonly opts: StackOpts;
    data: ReadonlyArray<V>;
    constructor(opts: StackOpts, data: ReadonlyArray<V>);
    push(...toAdd: ReadonlyArray<V>): number;
    pop(): V | undefined;
    get isEmpty(): boolean;
    get isFull(): boolean;
    get peek(): V | undefined;
    get length(): number;
}
/**
 * Creates a mutable stack
 *
 * @template V
 * @param {StackOpts} opts
 * @param {...V[]} startingItems
 * @returns
 */
declare const stackMutable: <V>(opts: StackOpts, ...startingItems: readonly V[]) => MutableStack<V>;

declare const autoSizeCanvas: (canvasEl: HTMLCanvasElement, callback: () => void, timeoutMs?: number) => rxjs.Subscription;
declare type CanvasCtxQuery = null | string | CanvasRenderingContext2D | HTMLCanvasElement;
declare const getCtx: (canvasElCtxOrQuery: CanvasCtxQuery) => CanvasRenderingContext2D;
declare const makeHelper: (ctxOrCanvasEl: CanvasCtxQuery, canvasBounds?: Rect | undefined) => {
    paths(pathsToDraw: Path[], opts?: DrawingOpts | undefined): void;
    line(lineToDraw: Line | Line[], opts?: DrawingOpts | undefined): void;
    rect(rectsToDraw: RectPositioned | RectPositioned[], opts?: (DrawingOpts & {
        filled?: boolean | undefined;
    }) | undefined): void;
    bezier(bezierToDraw: QuadraticBezier | CubicBezier, opts?: DrawingOpts | undefined): void;
    connectedPoints(pointsToDraw: Point[], opts?: (DrawingOpts & {
        loop?: boolean | undefined;
    }) | undefined): void;
    pointLabels(pointsToDraw: Point[], opts?: DrawingOpts | undefined): void;
    dot(dotPosition: Point | Point[], opts?: (DrawingOpts & {
        radius: number;
        outlined?: boolean | undefined;
        filled?: boolean | undefined;
    }) | undefined): void;
    circle(circlesToDraw: CirclePositioned | CirclePositioned[], opts: DrawingOpts): void;
    arc(arcsToDraw: ArcPositioned | ArcPositioned[], opts: DrawingOpts): void;
    textBlock(lines: string[], opts: DrawingOpts & {
        anchor: Point;
        anchorPadding?: number;
        bounds?: RectPositioned;
    }): void;
};
declare type DrawingOpts = {
    readonly strokeStyle?: string;
    readonly fillStyle?: string;
    readonly debug?: boolean;
};
declare const arc: (ctx: CanvasRenderingContext2D, arcs: ArcPositioned | ReadonlyArray<ArcPositioned>, opts?: DrawingOpts) => void;
declare type StackOp = (ctx: CanvasRenderingContext2D) => void;
declare type DrawingStack = Readonly<{
    push(op: StackOp): DrawingStack;
    pop(): DrawingStack;
    apply(): DrawingStack;
}>;
declare const drawingStack: (ctx: CanvasRenderingContext2D, stk?: Stack<StackOp> | undefined) => DrawingStack;
declare const circle: (ctx: CanvasRenderingContext2D, circlesToDraw: CirclePositioned | readonly CirclePositioned[], opts?: DrawingOpts) => void;
declare const paths: (ctx: CanvasRenderingContext2D, pathsToDraw: readonly Path[] | Path, opts?: Readonly<{
    readonly strokeStyle?: string;
    readonly debug?: boolean;
}>) => void;
/**
 * Draws a line between all the given points.
 *
 * @export
 * @param {CanvasRenderingContext2D} ctx
 * @param {...Points.Point[]} pts
 * @returns {void}
 */
declare const connectedPoints: (ctx: CanvasRenderingContext2D, pts: readonly Point[], opts?: {
    readonly loop?: boolean;
    readonly strokeStyle?: string;
}) => void;
declare const pointLabels: (ctx: CanvasRenderingContext2D, pts: readonly Point[], opts?: {
    readonly fillStyle?: string;
}, labels?: readonly string[] | undefined) => void;
declare const bezier: (ctx: CanvasRenderingContext2D, bezierToDraw: QuadraticBezier | CubicBezier, opts?: DrawingOpts | undefined) => void;
declare const line: (ctx: CanvasRenderingContext2D, toDraw: Line | readonly Line[], opts?: {
    readonly strokeStyle?: string;
    readonly debug?: boolean;
}) => void;
declare const rect: (ctx: CanvasRenderingContext2D, toDraw: RectPositioned | readonly RectPositioned[], opts?: DrawingOpts & {
    readonly filled?: boolean;
}) => void;
declare const textBlock: (ctx: CanvasRenderingContext2D, lines: readonly string[], opts: DrawingOpts & {
    readonly anchor: Point;
    readonly anchorPadding?: number;
    readonly bounds?: RectPositioned;
}) => void;

declare const Drawing_autoSizeCanvas: typeof autoSizeCanvas;
declare const Drawing_getCtx: typeof getCtx;
declare const Drawing_makeHelper: typeof makeHelper;
declare const Drawing_arc: typeof arc;
declare const Drawing_drawingStack: typeof drawingStack;
declare const Drawing_circle: typeof circle;
declare const Drawing_paths: typeof paths;
declare const Drawing_connectedPoints: typeof connectedPoints;
declare const Drawing_pointLabels: typeof pointLabels;
declare const Drawing_bezier: typeof bezier;
declare const Drawing_line: typeof line;
declare const Drawing_rect: typeof rect;
declare const Drawing_textBlock: typeof textBlock;
declare namespace Drawing {
  export {
    Drawing_autoSizeCanvas as autoSizeCanvas,
    Drawing_getCtx as getCtx,
    Drawing_makeHelper as makeHelper,
    Drawing_arc as arc,
    Drawing_drawingStack as drawingStack,
    Drawing_circle as circle,
    Drawing_paths as paths,
    Drawing_connectedPoints as connectedPoints,
    Drawing_pointLabels as pointLabels,
    Drawing_bezier as bezier,
    Drawing_line as line,
    Drawing_rect as rect,
    Drawing_textBlock as textBlock,
  };
}

declare enum OverflowPolicy {
    /**
     * Removes items front of the queue (ie older items are discarded)
     */
    DiscardOlder = 0,
    /**
     * Remove from rear of queue to make space for new items (ie newer items are discarded)
     */
    DiscardNewer = 1,
    /**
     * Only adds new items that there are room for (ie. brand new items are discarded)
     */
    DiscardAdditions = 2
}
interface QueueOpts {
    readonly debug?: boolean;
    readonly capacity?: number;
    /**
     * Default is DiscardAdditions, meaning new items are discarded
     *
     * @type {OverflowPolicy}
     */
    readonly overflowPolicy?: OverflowPolicy;
}
declare class Queue<V> {
    readonly opts: QueueOpts;
    readonly data: ReadonlyArray<V>;
    /**
     * Creates an instance of Queue.
     * @param {QueueOpts} opts Options foor queue
     * @param {V[]} data Initial data. Index 0 is front of queue
     * @memberof Queue
     */
    constructor(opts: QueueOpts, data: ReadonlyArray<V>);
    enqueue(...toAdd: ReadonlyArray<V>): Queue<V>;
    dequeue(): Queue<V>;
    get isEmpty(): boolean;
    get isFull(): boolean;
    get length(): number;
    /**
     * Returns front of queue (oldest item), or undefined if queue is empty
     *
     * @readonly
     * @type {(V | undefined)}
     * @memberof Queue
     */
    get peek(): V | undefined;
}
/**
 * Returns an immutable queue
 *
 * ```usage
 * let q = queue();           // Create
 * q = q.enqueue(`a`, `b`);   // Add two strings
 * const front = q.peek();    // `a` is at the front of queue (oldest)
 * q = q.dequeue();           // q now just consists of `b`
 * ```
 * @template V
 * @param {QueueOpts} [opts={}] Options
 * @param {...V[]} startingItems Index 0 is the front of the queue
 * @returns {Queue<V>} A new queue
 */
declare const queue: <V>(opts?: QueueOpts, ...startingItems: readonly V[]) => Queue<V>;
declare type MutableQueue<V> = {
    get isEmpty(): boolean;
    readonly dequeue: () => V | undefined;
    readonly enqueue: (...toAdd: ReadonlyArray<V>) => number;
    get peek(): V | undefined;
    get length(): number;
    get isFull(): boolean;
    get data(): readonly V[];
};
/**
 * Returns a mutable queue
 *
 * ```usage
 * const q = queue();       // Create
 * q.enqueue(`a`, `b`);     // Add two strings
 * const front = q.dequeue();  // `a` is at the front of queue (oldest)
 * ```
 *
 * @template V
 * @param {QueueOpts} [opts={}]
 * @param {...ReadonlyArray<V>} startingItems
 */
declare const queueMutable: <V>(opts?: QueueOpts, ...startingItems: readonly V[]) => MutableQueue<V>;

declare const randomIndex: <V>(array: ArrayLike<V>) => number;
declare const randomElement: <V>(array: ArrayLike<V>) => V;
/**
 * Removes a random item from an array, returning both the item and the new array as a result.
 * Does not modify the original array unless `mutate` parameter is true
 *
 * @template V
 * @param {readonly} array Array to pluck item from
 * @param {*} V
 * @param {*} []
 * @return {*}  {({readonly value:V|undefined, readonly array:ReadonlyArray<V> })}
 */
declare const randomPluck: <V>(array: readonly V[], mutate?: boolean) => {
    readonly value: V | undefined;
    readonly array: V[];
};
declare const shuffle: (dataToShuffle: ReadonlyArray<unknown>) => ReadonlyArray<unknown>;
/**
 * Returns an array with a value omitted.
 * Value checking is completed via the provided `comparer` function, or by default checking whether `a === b`.
 *
 * @template V
 * @param {ReadonlyArray<V>} data
 * @param {V} value
 * @param {IsEqual<V>} [comparer=isEqualDefault]
 * @return {*}  {ReadonlyArray<V>}
 */
declare const without: <V>(data: readonly V[], value: V, comparer?: IsEqual<V>) => readonly V[];

declare const Lists_stack: typeof stack;
declare const Lists_stackMutable: typeof stackMutable;
declare const Lists_queue: typeof queue;
declare const Lists_queueMutable: typeof queueMutable;
declare const Lists_randomIndex: typeof randomIndex;
declare const Lists_randomElement: typeof randomElement;
declare const Lists_randomPluck: typeof randomPluck;
declare const Lists_shuffle: typeof shuffle;
declare const Lists_without: typeof without;
declare namespace Lists {
  export {
    Lists_stack as stack,
    Lists_stackMutable as stackMutable,
    OverflowPolicy$1 as StackOverflowPolicy,
    Lists_queue as queue,
    Lists_queueMutable as queueMutable,
    OverflowPolicy as QueueOverflowPolicy,
    Lists_randomIndex as randomIndex,
    Lists_randomElement as randomElement,
    Lists_randomPluck as randomPluck,
    Lists_shuffle as shuffle,
    Lists_without as without,
  };
}

/**
 * Returns a series that produces values according to a time interval
 *
 * Eg produce a random number every 500ms
 * ```
 * const randomGenerator = atInterval(() => Math.random(), 1000);
 * for await (const r of randomGenerator) {
 *  // use random value...
 * }
 * ```
 *
 * @template V
 * @param {number} intervalMs
 * @param {() => V} produce
 * @returns {Series<V>}
 */
declare const atInterval: <V>(produce: () => Promise<V>, intervalMs: number) => AsyncGenerator<Awaited<V>, void, unknown>;
/**
 * Generates a range of numbers, with a given interval.
 * Unlike numericRange, numbers might contain rounding errors
 * @param {number} interval Interval between numbers
 * @param {number} [start=0] Start
 * @param {number} [end] End (if undefined, range never ends)
 */
declare const numericRangeRaw: (interval: number, start?: number, end?: number | undefined, repeating?: boolean) => Generator<number, void, unknown>;
/**
 * Generates a range of numbers, with a given interval.
 *
 * For-loop example:
 * ```
 * let loopForever = numericRange(0.1); // By default starts at 0 and counts upwards forever
 * for (v of loopForever) {
 *  console.log(v);
 * }
 * ```
 *
 * If you want more control over when/where incrementing happens...
 * ````
 * let percent = numericRange(0.1, 0, 1);
 * let percentResult = percent.next();
 * while (!percentResult.done) {
 *  let v = percentResult.value;
 *  percentResult = percent.next();
 * }
 * ```
 *
 * Note that computations are internally rounded to avoid floating point math issues. So if the `interval` is very small (eg thousandths), specify a higher rounding
 * number.
 *
 * @param {number} interval Interval between numbers
 * @param {number} [start=0] Start
 * @param {number} [end] End (if undefined, range never ends)
 * @param {number} [rounding] A rounding that matches the interval avoids floating-point math hikinks. Eg if the interval is 0.1, use a rounding of 10
 */
declare const numericRange: (interval: number, start?: number, end?: number | undefined, repeating?: boolean, rounding?: number | undefined) => Generator<number, void, unknown>;
/**
 * Continually loops back and forth between 0 and 1 by a specified interval.
 * Looping returns start value, and is inclusive of 0 and 1.
 *
 * Usage
 * ```
 * for (let v of percentPingPong(0.1)) {
 *  // v will go up and down. Make sure you have a break somewhere because it is infinite
 * }
 * ```
 *
 * Alternative:
 * ```
 * let pp = percentPingPong(0.1, 0.5); // Setup generator one time
 * let v = pp.next().value; // Call .next().value whenever a new value is needed
 * ```
 *
 * Because limits are capped to 0 and 1, using large intervals can produce uneven distribution. Eg an interval of 0.8 yields 0, 0.8, 1
 *
 * @param {number} interval Amount to increment by. Defaults to 10%
 * @param {number} offset Starting point. Defaults to 0 using a positive interval or 1 for negative intervals
 * @param {number} rounding Rounding to apply. Defaults to 1000. This avoids floating-point rounding errors.
 */
declare const pingPongPercent: (interval?: number, offset?: number | undefined, rounding?: number) => Generator<number, never, unknown>;
/**
 * Ping-pongs continually between `start` and `end` with a given `interval`. Use `pingPongPercent` for 0-1 ping-ponging
 *
 * @param {number} interval Amount to increment by. Use negative numbers to start counting down
 * @param {number} lower Lower bound (inclusive)
 * @param {number} upper Upper bound (inclusive, must be greater than start)
 * @param {number} offset Starting point within bounds (defaults to `lower`)
 * @param {number} [rounding=1] Rounding is off by default. Use say 1000 if interval is a fractional amount to avoid rounding errors.
 */
declare const pingPong: (interval: number, lower: number, upper: number, offset?: number | undefined, rounding?: number) => Generator<number, never, unknown>;

declare const Generators_atInterval: typeof atInterval;
declare const Generators_numericRangeRaw: typeof numericRangeRaw;
declare const Generators_numericRange: typeof numericRange;
declare const Generators_pingPongPercent: typeof pingPongPercent;
declare const Generators_pingPong: typeof pingPong;
declare namespace Generators {
  export {
    Generators_atInterval as atInterval,
    Generators_numericRangeRaw as numericRangeRaw,
    Generators_numericRange as numericRange,
    Generators_pingPongPercent as pingPongPercent,
    Generators_pingPong as pingPong,
  };
}

declare type Primitive = string | number;
declare type KeyValue = readonly [key: string, value: Primitive];

declare type Bar = {
    readonly percentage: number;
    readonly data: KeyValue;
};
/**
 * Usage in HTML:
 * ```html
 * <style>
 * histogram-vis {
 *  display: block;
 *  height: 7em;
 *  --histogram-bar-color: pink;
 * }
 * </style>
 * <histogram-vis>
 * [
 *  ["apples", 5],
 *  ["oranges", 3],
 *  ["pineapple", 0],
 *  ["limes", 9]
 * ]
 * </histogram-vis>
 * ```
 *
 * CSS colour theming:
 * --histogram-bar-color
 * --histogram-label-color
 *
 * HTML tag attributes
 * showXAxis (boolean)
 * showDataLabels (boolean)
 *
 * @export
 * @class HistogramVis
 * @extends {LitElement}
 **/
declare class HistogramVis extends LitElement {
    static readonly styles: lit.CSSResult;
    data: readonly KeyValue[];
    showDataLabels: boolean;
    height: string;
    showXAxis: boolean;
    json: readonly KeyValue[] | undefined;
    constructor();
    connectedCallback(): void;
    barTemplate(bar: Bar, index: number, _totalBars: number): lit_html.TemplateResult<1>;
    render(): lit_html.TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        readonly "histogram-vis": HistogramVis;
    }
}

/**
 * Creates and drives a HistogramVis instance.
 * Data should be an outer array containing two-element arrays for each
 * data point. The first element of the inner array is expected to be the key, the second the frequency.
 * For example,  `[`apples`, 2]` means the key `apples` was counted twice.
 *
 * Usage:
 * .sortBy() automatically sorts prior to visualisation. By default off.
 * .update(data) full set of data to plot
 * .clear() empties plot - same as calling `update([])`
 * .el - The `HistogramVis` instance, or undefined if not created/disposed
 *
 * ```
 * const plot = new FrequencyHistogramPlot(document.getElementById('histogram'));
 * plot.sortBy('key'); // Automatically sort by key
 * ...
 * plot.update([[`apples`, 2], [`oranges', 0], [`bananas`, 5]])
 * ```
 *
 * @export
 * @class FrequencyHistogramPlot
 */
declare class FrequencyHistogramPlot {
    #private;
    readonly parentEl: HTMLElement;
    el: HistogramVis | undefined;
    constructor(parentEl: HTMLElement);
    setAutoSort(sortStyle: `value` | `valueReverse` | `key` | `keyReverse`): void;
    clear(): void;
    init(): void;
    dispose(): void;
    update(data: ReadonlyArray<readonly [key: string, count: number]>): void;
}

export { Bezier as Beziers, CompoundPath$1 as Compound, Drawing, Easing$1 as Easings, Envelope as Envelopes, FrequencyHistogramPlot, Grid$1 as Grids, Line$1 as Lines, Lists, Path$1 as Paths, Plot, Point$1 as Points, Generators as Producers, Rect$1 as Rects, Set as Sets };
