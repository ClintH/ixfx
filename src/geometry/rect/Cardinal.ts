import type { RectPositioned } from "./index.js";
import type { CardinalDirection } from '../Grid.js';
import type { Point } from "../point/index.js";

/**
 * Returns a point on cardinal direction, or 'center' for the middle.
 *
 * ```js
 * cardinal({x: 10, y:10, width:100, height: 20}, 'center');
 * ```
 * @param rect Rectangle
 * @param card Cardinal direction or 'center'
 * @returns Point
 */
export const cardinal = (
  rect: RectPositioned,
  card: CardinalDirection | `center`
): Point => {
  const { x, y, width, height } = rect;
  switch (card) {
    case `nw`: {
      return Object.freeze({ x, y });
    }
    case `n`: {
      return Object.freeze({
        x: x + width / 2,
        y,
      });
    }
    case `ne`: {
      return Object.freeze({
        x: x + width,
        y,
      });
    }
    case `sw`: {
      return Object.freeze({ x, y: y + height });
    }
    case `s`: {
      return Object.freeze({
        x: x + width / 2,
        y: y + height,
      });
    }
    case `se`: {
      return Object.freeze({
        x: x + width,
        y: y + height,
      });
    }
    case `w`: {
      return Object.freeze({ x, y: y + height / 2 });
    }
    case `e`: {
      return Object.freeze({ x: x + width, y: y + height / 2 });
    }
    case `center`: {
      return Object.freeze({
        x: x + width / 2,
        y: y + height / 2,
      });
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unknown direction: ${ card }`);
    }
  }
};