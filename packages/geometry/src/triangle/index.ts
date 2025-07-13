export type * from './triangle-type.js';
export * from './angles.js';
export * from './area.js';
export * from './barycentric.js';
export * from './bbox.js';
export * from './centroid.js';
export * from './corners.js';
export * from './create.js';
export * from './edges.js';
export * from './from.js';
export * from './kinds.js';
export * from './inner-circle.js';
export * from './guard.js';
export * from './outer-circle.js';
export * from './perimeter.js';
export * from './rotate.js';
/**
 * Functions for working with equilateral triangles, defined by length
 */
export * as Equilateral from './equilateral.js';

/**
 * Functions for working with right-angled triangles, defined by two of three edges
 */
export * as Right from './right.js';

export * as Isosceles from './isosceles.js';

/**
* Triangle.
*
* Helpers for creating:
*  - {@link Triangles.fromFlatArray}: Create from [x1, y1, x2, y2, x3, y3]
*  - {@link Triangles.fromPoints}: Create from three `{x,y}` sets
*  - {@link Triangles.fromRadius}: Equilateral triangle of a given radius and center
*/


