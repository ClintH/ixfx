import { Point, Point3d } from "./point-type.js";

/**
 * An empty point of `{ x: 0, y: 0 }`.
 *
 * Use `isEmpty` to check if a point is empty.
 * Use `Empty3d` to get an empty point with `z`.
 */
export const Empty: Point = { x: 0, y: 0 } as const;

/**
 * Returns { x:1, y:1 }
 */
export const Unit: Point = { x: 1, y: 1 } as const;

/**
 * An empty Point of `{ x: 0, y: 0, z: 0}`
 * Use `isEmpty` to check if a point is empty.
 * Use `Empty` to get an empty point without `z`.
 */
export const Empty3d: Point3d = { x: 0, y: 0, z: 0 } as const;

/**
 * Returns { x:1,y:1,z:1 }
 */
export const Unit3d: Point3d = { x: 1, y: 1, z: 1 } as const;