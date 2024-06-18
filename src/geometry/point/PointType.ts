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
 * Placeholder point, where x and y is `NaN`.
 * Use `isPlaceholder` to check if a point is a placeholder.
 */
//eslint-disable-next-line @typescript-eslint/naming-convention
export const Placeholder = Object.freeze({ x: Number.NaN, y: Number.NaN });
