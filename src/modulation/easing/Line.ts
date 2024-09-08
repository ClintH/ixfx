import type { Path } from '../../geometry/path/index.js';
import * as Points from '../../geometry/point/index.js';
import * as Bezier from '../../geometry/bezier/index.js';
import { sine } from '../Oscillator.js';
import { scale } from 'src/numbers/Scale.js';

/**
 * Interpolates points along a line.
 * By default it's a straight line, so use `bend` to make a non-linear curve.
 * @param bend -1...1. -1 will pull line up, 1 will push it down.
 * @returns 
 */
export const line = (bend: number = 0, warp: number = 0) => {
  const max = 1;
  const cubicB = {
    x: scale(bend, -1, 1, 0, max),
    y: scale(bend, -1, 1, max, 0),
  }

  // Add in bend as 'drive'
  let cubicA = Points.interpolate(Math.abs(bend), Points.Empty, cubicB);

  // Warp
  if (bend !== 0 && warp > 0) {
    if (bend > 0) {
      cubicA = Points.interpolate(warp, cubicA, { x: 0, y: cubicB.x * 2 });
    } else {
      cubicA = Points.interpolate(warp, cubicA, { x: cubicB.y * 2, y: 0 });
    }
  }

  const bzr = Bezier.cubic(Points.Empty, Points.Unit,
    cubicA, cubicB
  );

  const inter = Bezier.interpolator(bzr);
  return (value: number) => inter(value);
}