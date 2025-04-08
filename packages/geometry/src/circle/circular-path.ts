import type { Path } from "../path/index.js";
import type { Circle } from "./circle-type.js";

export type CircularPath = Circle & Path & {
  readonly kind: `circular`
};