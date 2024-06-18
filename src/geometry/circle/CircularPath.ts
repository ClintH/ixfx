import type { Path } from "../path/index.js";
import type { Circle } from "./CircleType.js";

export type CircularPath = Circle & Path & {
  readonly kind: `circular`
};