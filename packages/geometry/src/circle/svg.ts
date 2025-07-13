import type { Point } from "../point/point-type.js";
import type { Circle, CirclePositioned } from "./circle-type.js";
import { isCircle, isCirclePositioned } from "./guard.js";

type ToSvg = {
  (circleOrRadius: Circle | number, sweep: boolean, origin: Point): ReadonlyArray<string>;
  (circle: CirclePositioned, sweep: boolean): ReadonlyArray<string>;
};


/**
 * Creates a SVG path segment.
 * @param a Circle or radius
 * @param sweep If true, path is 'outward'
 * @param origin Origin of path. Required if first parameter is just a radius or circle is non-positioned
 * @returns 
 */
export const toSvg: ToSvg = (a: CirclePositioned | number | Circle, sweep: boolean, origin?: Point): ReadonlyArray<string> => {
  if (isCircle(a)) {
    if (origin !== undefined) {
      return toSvgFull(a.radius, origin, sweep);
    }
    if (isCirclePositioned(a)) {
      return toSvgFull(a.radius, a, sweep);
    } else throw new Error(`origin parameter needed for non-positioned circle`);
  } else {
    if (origin === undefined) { throw new Error(`origin parameter needed`); } else {
      return toSvgFull(a, origin, sweep);
    }
  }
};

const toSvgFull = (radius: number, origin: Point, sweep: boolean): ReadonlyArray<string> => {
  // https://stackoverflow.com/questions/5737975/circle-drawing-with-svgs-arc-path
  const { x, y } = origin;
  const s = sweep ? `1` : `0`;
  return `
    M ${ x }, ${ y }
    m -${ radius }, 0
    a ${ radius },${ radius } 0 1,${ s } ${ radius * 2 },0
    a ${ radius },${ radius } 0 1,${ s } -${ radius * 2 },0
  `.split(`\n`);
};
