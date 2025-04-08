export * as Waypoints from './waypoint.js';
export * as Layouts from './layout.js';
export * as Circles from './circle/index.js';
export * as Lines from './line/index.js';
export * as Rects from './rect/index.js';
export * as Points from './point/index.js';
export * as Paths from './path/index.js';
export * as Grids from './grid/index.js';
export * as Beziers from './bezier/index.js';
export * as Compound from './path/compound-path.js';
export * as Ellipses from './ellipse.js';
//export type * from './types.js';

export * from './angles.js';
export * as CurveSimplification from './curve-simplification.js';

/**
 * Quad tree is a datastructure for efficiently determining whether
 * a point/shape is at a location
 * - {@link quadTree}: Create a quad tree
 */
export * as QuadTree from './quad-tree.js';

export * as Scaler from './scaler.js';
export * as Convolve2d from '../../visual/src/convolve-2d.js';

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
export * as Arcs from './arc/index.js';

/**
 * Generate a few basic geometric shapes
 * Overview:
 * * {@link arrow}
 * * {@link starburst}
 */
export * as Shapes from './shape/index.js';

/**
 * Helper functions for working with vectors, which can either be a {@link Point} or Polar {@link Polar.Coord}.
 * While most of the functionality is provided in either of those modules, the Vector module lets you cleanly
 * interoperate between these two coordinates.
 */
export * as Vectors from './vector.js';


/**
 * Work with Polar coordinates.
 * A {@link Polar.Coord} is just `{ angleRadians:number, distance: number }`.
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
 * Comparisons: {@link isAntiParallel}, {@link isOpposite}, {@link isParallel}, {@link isPolarCoord}
 */
export * as Polar from './polar/index.js';

/**
 * Functions for producing points within a shape.
 * Useful for creating patterns.
 * 
 * Overview:
 * * {@link sphereFibonacci}: Generate points on a sphere
 * * {@link circleVogelSpiral}: Generate a sunflower-esque pattern of points in a circle 
 */
export * as SurfacePoints from './surface-points.js';

/**
 * Triangle processing.
 * 
 * Helpers for creating:
 * - {@link Triangles.fromFlatArray}: Create from `[ aX, aY, bX, bY, cX, cY ]`
 * - {@link Triangles.fromPoints}: Create from an array of three Points.
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
 * - {@link edges}: Edges of triangle as {@link Line}
 * - {@link corners}: Corner positions
 * - {@link innerCircle}: Largest circle to fit within triangle
 * - {@link outerCircle}: Largest circle to enclose triangle
 * - {@link toFlatArray}: Returns an array of coordinates: `[aX, aY, bX, bY, cX, cY]`
 * 
 * Comparisons
 * - {@link intersectsPoint}: Whether a point intersects triangle
 * - {@link isEqual}: Check whether two triangles have equal values
 * - {@link isAcute}, {@link isEquilateral}, {@link isIsosceles}, {@link isRightAngle}
 * - {@link isTriangle}: Returns true if object has expected properties of a triangle
 */
export * as Triangles from './triangle/index.js';

// try {
//   if (typeof window !== `undefined`) {
//     //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
//     (window as any).ixfx = { ...(window as any).ixfx, Geometry: { Circles, Arcs, Lines, Rects, Points, Paths, Grids, Beziers, Compound, Ellipses, Polar, Shapes, radiansFromAxisX, radianToDegree, degreeToRadian } };
//   }
// } catch { /* no-op */ }
