
import { radiansBetweenCircular, radiansNormalise } from "../angles.js"
import type { Coord, PolarLine } from "./types.js"

type PolarLineIntersects = PolarLine & {
  sinBA: number
  angleMin: number
  angleMax: number
  wraps: boolean
}



export type IntersectionDistanceCompute = {
  compute: (angleRadian: number) => Generator<{ distance: number, line: PolarLine }>
  visibilityPolygon: (feather: number) => Coord[]
}

/**
 * Returns a generator function that checks for intersections with a static set of lines.
 * The generator yields values of `{ distance: number, line: PolarLine }`. Lines which have no
 * intersecton are not returned.
 * 
 * ```js
 * const c = intersectionDistanceCompute(line1, line2, line3);
 * 
 * // Get all results for angle 0.2 as an array
 * const computed = [...c.compute(0.2)]
 * 
 * // Sort array by distance (ascending)
 * computed.sort((a, b) => a.distance - b.distance);
 * ```
 * @param lines 
 * @returns 
 */
export const intersectionDistanceCompute = (...lines: PolarLine[]): IntersectionDistanceCompute => {
  const precompute = (line: PolarLine): PolarLineIntersects => {
    const angleMin = Math.min(line.a.angleRadian, line.b.angleRadian);
    const angleMax = Math.max(line.a.angleRadian, line.b.angleRadian);

    return {
      ...line,
      sinBA: Math.sin(line.b.angleRadian - line.a.angleRadian),
      angleMin,
      angleMax,
      wraps: Math.abs(line.b.angleRadian - line.a.angleRadian) > Math.PI
    };
  }

  const cache = lines.map(line => precompute(line));

  const visibilityPolygon = (feather = 1e-6) => {
    const angles: number[] = []
    lines.forEach(line => {
      angles.push(
        line.a.angleRadian,
        line.b.angleRadian,
        line.a.angleRadian - feather,
        line.a.angleRadian + feather,
        line.b.angleRadian - feather,
        line.b.angleRadian + feather
      );
    });
    angles.sort((a, b) => a - b);

    const polygon: Coord[] = [];

    for (const angleCalc of angles) {
      let minDistribution = Infinity;
      for (const seg of cache) {
        const d = distance(angleCalc, seg);
        if (d < minDistribution) minDistribution = d;
      }

      if (minDistribution < Infinity) {
        polygon.push({
          angleRadian: angleCalc,
          distance: minDistribution
        });
      }
    }

    return polygon;
  }

  const distance = (angle: number, seg: PolarLineIntersects): number => {
    const inside = seg.wraps
      ? angle >= seg.angleMax || angle <= seg.angleMin
      : angle >= seg.angleMin && angle <= seg.angleMax;

    if (!inside) return Number.NaN;

    const sin2θ = Math.sin(seg.b.angleRadian - angle);
    const sinθ1 = Math.sin(angle - seg.a.angleRadian);

    const denom = seg.b.distance * sin2θ + seg.a.distance * sinθ1;
    if (denom <= 0) return Number.NaN;

    return (seg.a.distance * seg.b.distance * seg.sinBA) / denom;
  }

  function* compute(angleRadian: number): Generator<{ distance: number, line: PolarLine }> {
    for (let index = 0; index < cache.length; index++) {
      const d = distance(angleRadian, cache[ index ]);
      if (Number.isNaN(d)) continue;
      yield { distance: d, line: lines[ index ] };
    }
  }

  // function* sweep(start: number, end: number, increment: number): Generator<{ distance: number, line: PolarLine }> {
  //   for (let index = 0; index < cache.length; index++) {
  //     let angle = start;
  //     const l = cache[ index ];
  //     while (angle < end) {
  //       if (angle >= l.angleMin && angle <= l.angleMax) {
  //         const d = distance(angle, cache[ index ]);
  //         if (Number.isNaN(d)) break;
  //         yield { distance: d, line: lines[ index ] };
  //       }
  //       angle += increment;
  //     }
  //   }
  // }
  return { compute, visibilityPolygon }
}

/**
 * Returns the distance at which a line from `angleRadian` hits `line`. Returns `Infinity`
 * if there's no intersection.
 * 
 * Calculations assume that all angles etc are in relation to a common origin point.
 * If repeatedly comparing against the same line (or set of lines), use {@link intersectionDistanceCompute} for
 * improved performance.
 * 
 * @param angleRadian 
 * @param line 
 * @returns 
 */
export const intersectionDistance = (angleRadian: number, line: PolarLine): number => {
  const ray = radiansNormalise(angleRadian);
  const a = radiansNormalise(line.a.angleRadian);
  const b = radiansNormalise(line.b.angleRadian);

  // Ray must lie between the segment angles
  if (!radiansBetweenCircular(ray, a, b)) return Infinity;

  const ad = line.a.distance;
  const ab = line.b.distance;

  const sineBA = Math.sin(b - a);
  const sineBRay = Math.sin(b - ray);
  const sineRayA = Math.sin(ray - a);

  const denominator = ab * sineBRay + ad * sineRayA;

  // Collinear or degenerate
  if (Math.abs(denominator) < 1e-10) return Infinity

  const r =
    (ad * ab * sineBA) /
    denominator;

  // Intersection is behind the origin
  if (r < 0) return Infinity

  return r;

  // //console.log(`   found!: ${ ray } line: ${ polarLineToString(line) } a: ${ a } bb: ${ b } r: ${ r }`);
  // return {
  //   angleRadian: angleRadian,
  //   distance: r,
  // };
}

