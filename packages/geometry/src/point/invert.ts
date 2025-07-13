import { isPoint3d } from "./guard.js";
import type { Point, Point3d } from "./point-type.js";

/**
 * Inverts one or more axis of a point
 * ```js
 * invert({x:10, y:10}); // Yields: {x:-10, y:-10}
 * invert({x:10, y:10}, `x`); // Yields: {x:-10, y:10}
 * ```
 * @param pt Point to invert
 * @param what Which axis. If unspecified, both axies are inverted
 * @returns
 */
export const invert = (
  pt: Point | Point3d,
  what: `both` | `x` | `y` | `z` = `both`
): Point => {
  switch (what) {
    case `both`: {
      return isPoint3d(pt) ? Object.freeze({
        ...pt,
        x: pt.x * -1,
        y: pt.y * -1,
        z: pt.z * -1,
      }) : Object.freeze({
        ...pt,
        x: pt.x * -1,
        y: pt.y * -1,
      });
    }
    case `x`: {
      return Object.freeze({
        ...pt,
        x: pt.x * -1,
      });
    }
    case `y`: {
      return Object.freeze({
        ...pt,
        y: pt.y * -1,
      });
    }
    case `z`: {
      if (isPoint3d(pt)) {
        return Object.freeze({
          ...pt,
          z: pt.z * -1,
        });
      } else throw new Error(`pt parameter is missing z`);
    }
    default: {
      throw new Error(`Unknown what parameter. Expecting 'both', 'x' or 'y'`);
    }
  }
};