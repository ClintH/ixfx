import { getPointParameter } from "../point/get-point-parameter.js";
import type { Point } from "../point/point-type.js";
import { guard } from "./guard.js";
import type { BarycentricCoord, Triangle } from "./triangle-type.js";


/**
 * Returns the [Barycentric coordinate](https://en.wikipedia.org/wiki/Barycentric_coordinate_system) of a point within a triangle
 *
 * @param t
 * @param a
 * @param b
 * @returns
 */
export const barycentricCoord = (
  t: Triangle,
  a: Point | number,
  b?: number
): BarycentricCoord => {
  const pt = getPointParameter(a, b);

  const ab = (x: number, y: number, pa: Point, pb: Point) =>
    (pa.y - pb.y) * x + (pb.x - pa.x) * y + pa.x * pb.y - pb.x * pa.y;

  const alpha = ab(pt.x, pt.y, t.b, t.c) / ab(t.a.x, t.a.y, t.b, t.c);
  const theta = ab(pt.x, pt.y, t.c, t.a) / ab(t.b.x, t.b.y, t.c, t.a);
  const gamma = ab(pt.x, pt.y, t.a, t.b) / ab(t.c.x, t.c.y, t.a, t.b);

  return {
    a: alpha,
    b: theta,
    c: gamma,
  };
};

/**
 * Convert Barycentric coordinate to Cartesian
 * @param t
 * @param bc
 * @returns
 */
export const barycentricToCartestian = (
  t: Triangle,
  bc: BarycentricCoord
): Point => {
  guard(t);
  const { a, b, c } = t;

  const x = a.x * bc.a + b.x * bc.b + c.x * bc.c;
  const y = a.y * bc.a + b.y * bc.b + c.y * bc.c;

  if (a.z && b.z && c.z) {
    const z = a.z * bc.a + b.z * bc.b + c.z * bc.c;
    return Object.freeze({ x, y, z });
  } else {
    return Object.freeze({ x, y });
  }
};
