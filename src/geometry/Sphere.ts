import type { Point3d } from "./points/Types.js";

export type Sphere = Point3d & {
  readonly radius: number;
};
