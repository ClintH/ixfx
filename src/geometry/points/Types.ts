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