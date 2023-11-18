/**
 * A point, consisting of x, y and maybe z fields.
 */
export type Point = {
  readonly x: number;
  readonly y: number;
  readonly z?: number;
};

export type Point3d = Point & {
  readonly z: number;
};

/**
 * A circle
 */
export type Circle = {
  readonly radius: number
}

export type ShapePositioned = CirclePositioned | RectPositioned;

/**
 * A line, which consists of an `a` and `b` {@link Point}.
 */
export type Line = {
  readonly a: Point
  readonly b: Point
}


/**
 * A {@link Circle} with position
 */
export type CirclePositioned = Point & Circle;

export type CircularPath = Circle & Path & {
  readonly kind: `circular`
};

export type Sphere = Point3d & {
  readonly radius: number;
};


/**
 * A PolyLine, consisting of more than one line.
 */
export type PolyLine = ReadonlyArray<Line>;


/**
 * Rectangle as array: `[width, height]`
 */
export type RectArray = readonly [ width: number, height: number ];

/**
 * Positioned rectangle as array: `[x, y, width, height]`
 */
export type RectPositionedArray = readonly [
  x: number,
  y: number,
  width: number,
  height: number
];
export type Rect = {
  readonly width: number;
  readonly height: number;
};
export type RectPositioned = Point & Rect;
export type Path = {
  length(): number
  /**
     * Returns a point at a relative (0.0-1.0) position along the path
     *
     * @param {number} t Relative position (0.0-1.0)
     * @returns {Point} Point
     */
  interpolate(t: number): Point
  bbox(): RectPositioned
  /**
   * Returns the nearest point on path to `point`
   * @param point 
   */
  nearest(point: Point): Point
  toString(): string
  toSvgString(): ReadonlyArray<string>
  readonly kind: `compound` | `elliptical` | `circular` | `arc` | `bezier/cubic` | `bezier/quadratic` | `line`
}

export type PointCalculableShape =
  | PolyLine
  | Line
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | RectPositioned
  | Point
  | CirclePositioned
  ;

/**
* Triangle.
*
* Helpers for creating:
*  - {@link Triangles.fromFlatArray}: Create from [x1, y1, x2, y2, x3, y3]
*  - {@link Triangles.fromPoints}: Create from three `{x,y}` sets
*  - {@link Triangles.fromRadius}: Equilateral triangle of a given radius and center
*/
export type Triangle = {
  readonly a: Point;
  readonly b: Point;
  readonly c: Point;
};

/**
 * Polar coordinate, made up of a distance and angle in radians.
 * Most computations involving PolarCoord require an `origin` as well.
 */
export type PolarCoord = {
  readonly distance: number;
  readonly angleRadian: number;
};

export type Vector = Point | PolarCoord;