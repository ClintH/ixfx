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
 * Placeholder point: `{ x: NaN, y: NaN }`
 * Use `isPlaceholder` to check if a point is a placeholder.
 * Use `Placeholder3d` get a point with `z` property.
 */
//eslint-disable-next-line @typescript-eslint/naming-convention
export const Placeholder = Object.freeze({ x: Number.NaN, y: Number.NaN });

/**
 * Placeholder point: `{x: NaN, y:NaN, z:NaN }`
 * Use `isPlaceholder` to check if a point is a placeholder.
 * Use `Placeholder` to get a point without `z` property.
 */
export const Placeholder3d = Object.freeze({ x: Number.NaN, y: Number.NaN, z: Number.NaN });