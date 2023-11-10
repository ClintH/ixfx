import * as Arcs from './Arc.js';
import * as Beziers from './Bezier.js';
import * as Circles from './Circle.js';
import * as Compound from './CompoundPath.js';
import * as Grids from './Grid.js';
import * as Lines from './Line.js';
import * as Paths from './Path.js';
import * as Points from './Point.js';
import * as Rects from './Rect.js';
import * as Ellipses from './Ellipse.js';
import * as Shapes from './Shape.js';
import * as Polar from './Polar.js';

export * as Waypoints from './Waypoint.js';
export * as Spheres from './Sphere.js';
export * as Layouts from './Layout.js';
export * as Circles from './Circle.js';
export * as Lines from './Line.js';
export * as Rects from './Rect.js';
export * as Points from './Point.js';
export * as Paths from './Path.js';
export * as Grids from './Grid.js';
export * as Beziers from './Bezier.js';
export * as Compound from './CompoundPath.js';
export * as Ellipses from './Ellipse.js';


/**
 * Quad tree is a datastructure for efficiently determining whether
 * a point/shape is at a location
 * - {@link quadTree}: Create a quad tree
 */
export * as QuadTree from './QuadTree.js';

export * as Scaler from './Scaler.js';
export * as Convolve2d from './Convolve2d.js';

/**
 * Work with arcs. Arcs are a angle-limited circle, describing a wedge.
 * 
 * {@link ArcPositioned} has a origin x,y.
 * 
 * Conversions:
 * - {@link fromDegrees}
 * - {@link toLine}: A line from start/end position of arc
 * - {@link toSvg}: Returns an SVG representation of arc
 * 
 * Calculations:
 * - {@link bbox}: Bounding box
 * - {@link interpolate}: Interplate two arcs
 * - {@link point}: Find a point on the arc, given an angle
 * - {@link length}: Circumference of arc
 * 
 * Comparisons:
 * - {@link isArc}: Returns true if object is Arc-ish
 * - {@link isEqual}: Returns true if two objects have identical arc properties
 */
export * as Arcs from './Arc.js';

/**
 * Generate a few basic geometric shapes
 * Overview:
 * * {@link arrow}
 * * {@link starburst}
 */
export * as Shapes from './Shape.js';

/**
 * Helper functions for working with vectors, which can either be a {@link Points.Point} or Polar {@link Polar.Coord}.
 * While most of the functionality is provided in either of those modules, the Vector module lets you cleanly
 * interoperate between these two coordinates.
 */
export * as Vectors from './Vector.js';


/**
 * Work with Polar coordinates.
 * A Polar {@link Coord} is just `{ angleRadians:number, distance: number }`.
 * 
 * Conversion: {@link toCartesian}, {@link fromCartesian}, {@link toString}
 * 
 * Math: {@link divide}, {@link invert}, {@link multiply}, {@link dotProduct}
 * 
 * Geometric manipulations: {@link rotate}, {@link rotateDegrees}
 * 
 * Cleaning: {@link clampMagnitude}, {@link normalise}
 * 
 * Debugging: {@link toString}
 * 
 * Comparisons: {@link isAntiParallel}, {@link isOpposite}, {@link isParallel}, {@link isCoord}
 */
export * as Polar from './Polar.js';

/**
 * Functions for producing points within a shape.
 * Useful for creating patterns.
 * 
 * Overview:
 * * {@link sphereFibonacci}: Generate points on a sphere
 * * {@link circleVogelSpiral}: Generate a sunflower-esque pattern of points in a circle 
 */
export * as SurfacePoints from './SurfacePoints.js';

/**
 * Triangle processing.
 * 
 * Helpers for creating:
 * - {@link Triangles.fromFlatArray}: Create from `[ x1, y1, x2, y2, x3, y3 ]`
 * - {@link Triangles.fromPoints}: Create from three `{ x, y }` sets
 * - {@link Triangles.fromRadius}: Equilateral triangle of a given radius and center
 * 
 * There are sub-modules for dealing with particular triangles:
 * - {@link Triangles.Equilateral}: Equilateral triangls
 * - {@link Triangles.Right}: Right-angled triangles
 * - {@link Triangles.Isosceles}: Iscosceles triangles
 * 
 * Calculations
 * - {@link angles}: Internal angles in radians. {@link anglesDegrees} for degrees. 
 * - {@link area}: Area of triangle
 * - {@link bbox}: Bounding box
 * - {@link centroid}: Centroid of triangle
 * - {@link perimeter}: Calculate perimeter
 * - {@link lengths}: Return array lengths of triangle's edges
 * - {@link rotate}, {@link rotateByVertex}
 * 
 * Conversions
 * - {@link edges}: Edges of triangle as {@link Lines.Line}
 * - {@link corners}: Corner positions
 * - {@link innerCircle}: Largest circle to fit within triangle
 * - {@link outerCircle}: Largest circle to enclose triangle
 * - {@link toFlatArray}
 * 
 * Comparisons
 * - {@link intersectsPoint}: Whether a point intersects triangle
 * - {@link isEqual}: Check whether two triangles have equal values
 * - {@link isAcute}, {@link isEquilateral}, {@link isIsosceles}, {@link isRightAngle}
 * - {@link isTriangle}: Returns true if object has expected properties of a triangle
 */
export * as Triangles from './Triangle.js';

/**
 * Convert angle in degrees to angle in radians.
 * @param angleInDegrees 
 * @returns 
 */
export function degreeToRadian(angleInDegrees: number): number;

/**
 * Convert angles in degrees to angles in radians
 * @param angleInDegrees 
 */
export function degreeToRadian(angleInDegrees: ReadonlyArray<number>): ReadonlyArray<number>;

//eslint-disable-next-line func-style
export function degreeToRadian(angleInDegrees: number | ReadonlyArray<number>): number | ReadonlyArray<number> {
  return Array.isArray(angleInDegrees) ? angleInDegrees.map(v => v * (Math.PI / 180)) : (angleInDegrees as number) * (Math.PI / 180);
}

/**
 * Convert angle in radians to angle in degrees
 * @param angleInRadians
 * @returns 
 */
export function radianToDegree(angleInRadians: number): number;

/**
 * Convert angles in radians to angles in degrees
 * @param angleInRadians 
 */
export function radianToDegree(angleInRadians: ReadonlyArray<number>): ReadonlyArray<number>;

//eslint-disable-next-line func-style
export function radianToDegree(angleInRadians: number | ReadonlyArray<number>): number | ReadonlyArray<number> {
  return Array.isArray(angleInRadians) ? angleInRadians.map(v => v * 180 / Math.PI) : (angleInRadians as number) * 180 / Math.PI;
}

/**
 * Angle from x-axis to point (ie. `Math.atan2`)
 * @param point 
 * @returns 
 */
export const radiansFromAxisX = (point: Points.Point): number => Math.atan2(point.x, point.y);

try {
  if (typeof window !== `undefined`) {
    //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
    (window as any).ixfx = { ...(window as any).ixfx, Geometry: { Circles, Arcs, Lines, Rects, Points, Paths, Grids, Beziers, Compound, Ellipses, Polar, Shapes, radiansFromAxisX, radianToDegree, degreeToRadian } };
  }
} catch { /* no-op */ }
