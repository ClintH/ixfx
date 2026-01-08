import { crossProductRaw } from "./point/dot-product.js";
import type { CirclePositioned } from "./circle/circle-type.js";
import type { Line } from "./line/line-type.js";
import type { Point } from "./point/point-type.js";

export type RaycastHit = {
  x: number, y: number, d: number, line: number
}
type LineAsPoints = [ ax: number, ay: number, bx: number, by: number ]
type RayAngle = {
  angle: number, x: number, y: number
}

/**
 * Yields the intersecting points from `a` to `b` against a set of lines.
 * 
 * ```js
 * const a = { x: 0, y: 0 };
 * const b = { x: 640, y: 320 };
 * for (const point of G.Rays.intersections(a,b, lines)) {
 *  // Do something with  { x,, y } 
 * }
 * ```
 * 
 * Results are a {@link RaycastHit}, consisting of `x,y` for coordinates,
 * `d` for relative distance of point from `a`, and `line` which is the index of the line.
 * @param a 
 * @param b 
 * @param lines 
 */
export function* intersections(a: Point, b: Point, lines: Line[]): Generator<RaycastHit> {
  for (let index = 0; index < lines.length; index++) {
    const line = lines[ index ];
    const d = intersectDistanceRay(a.x, a.y,
      b.x, b.y,
      [ line.a.x, line.a.y, line.b.x, line.b.y ]
    )
    if (Number.isFinite(d)) {
      const t = Math.sqrt(d);
      const x = a.x + b.x * t;
      const y = a.y + b.y * t;
      yield { x, y, d: t, line: index }
    }
  }
}

function intersectDistanceRay(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  s: LineAsPoints // 0:ax,1:ay,2:bx,3:by
): number {
  const vx = s[ 2 ] - s[ 0 ];
  const vy = s[ 3 ] - s[ 1 ];

  const wx = s[ 0 ] - ox;
  const wy = s[ 1 ] - oy;

  const d = crossProductRaw(dx, dy, vx, vy);
  if (d === 0) return Infinity; // parallel

  const t = crossProductRaw(wx, wy, vx, vy) / d;
  if (t <= 0) return Infinity;

  const u = crossProductRaw(wx, wy, dx, dy) / d;
  if (u < 0 || u > 1) return Infinity;

  return t * t;
}

/**
 * Returns a function that performs raycasting.
 * 
 * The raycast function takes in the position of a ray source,
 * and returns the x,y coordinates of where rays land on a provided list of lines.
 * 
 * ```js
 * const raycaster = raycast2d(lines);
 * const light = { x: 10, y: 20 }
 * raycaster(light); // Yields: { x, y, index }
 * ```
 * 
 * An `index` property is given for each coordinate, which corresponds to the `lines` array.
 * This allows correspondence between hits and lines.
 * @param lines 
 * @returns 
 */
export function raycast2d(lines: Line[]): (light: Point) => RaycastHit[] {
  const segments = lines.map(l => [ l.a.x, l.a.y, l.b.x, l.b.y ] as LineAsPoints);
  return (light: Point) => raycast2dImpl(light, segments);
}

function raycast2dImpl(
  light: Point,
  segments: LineAsPoints[],
  threshold = 1e-4
): RaycastHit[] {
  const ox = light.x;
  const oy = light.y;

  const events: RayAngle[] = [];

  // Build sweep angles
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let index = 0; index < segments.length; index++) {
    const s = segments[ index ];
    // 0:ax,1:ay,2:bx,3:by
    const a1 = Math.atan2(s[ 1 ] - oy, s[ 0 ] - ox);
    const a2 = Math.atan2(s[ 3 ] - oy, s[ 2 ] - ox);

    events.push(
      { angle: a1 - threshold, x: Math.cos(a1 - threshold), y: Math.sin(a1 - threshold) },
      { angle: a1, x: Math.cos(a1), y: Math.sin(a1) },
      { angle: a1 + threshold, x: Math.cos(a1 + threshold), y: Math.sin(a1 + threshold) },

      { angle: a2 - threshold, x: Math.cos(a2 - threshold), y: Math.sin(a2 - threshold) },
      { angle: a2, x: Math.cos(a2), y: Math.sin(a2) },
      { angle: a2 + threshold, x: Math.cos(a2 + threshold), y: Math.sin(a2 + threshold) },
    );
  }

  events.sort((a, b) => a.angle - b.angle);

  const result: RaycastHit[] = [];

  // Sweep
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
    const event = events[ eventIndex ];
    let min = Infinity;
    let hitX = 0;
    let hitY = 0;
    let hitIndex = -1;
    for (let s = 0; s < segments.length; s++) {
      const d = intersectDistanceRay(ox, oy, event.x, event.y, segments[ s ]);
      if (d < min) {
        min = d;
        const t = Math.sqrt(d);
        hitX = ox + event.x * t;
        hitY = oy + event.y * t;
        hitIndex = s;
      }
    }

    if (min < Infinity) {
      result.push({ d: min, x: hitX, y: hitY, line: hitIndex });
    }
  }

  return result;
}

export function asFan(samples: RaycastHit[], light: CirclePositioned): RaycastHit[] {
  const cx = light.x;
  const cy = light.y;
  samples.sort((a, b) =>
    Math.atan2(a.y - cy, a.x - cx) -
    Math.atan2(b.y - cy, b.x - cx)
  );
  samples.push({ ...samples[ 0 ] });
  return samples;
}

