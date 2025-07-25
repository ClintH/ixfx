import type { CirclePositioned } from "./circle/circle-type.js";
import type { Path } from "./path/path-type.js";
import type { Point } from "./point/point-type.js";
import { joinPointsToLines } from './line/join-points-to-lines.js';
import { toPath } from './line/to-path.js';
import { distance as PointsDistance } from "./point/distance.js";
import { sortByNumericProperty } from "@ixfx/arrays";

export type Waypoint = CirclePositioned;

export type WaypointOpts = {
  readonly maxDistanceFromLine: number;
  readonly enforceOrder: boolean;
};

/**
 * Create from set of points, connected in order starting at array position 0.
 * @param waypoints 
 * @param opts 
 * @returns 
 */
export const fromPoints = (
  waypoints: readonly Point[],
  opts: Partial<WaypointOpts> = {}
) => {
  const lines = joinPointsToLines(...waypoints);
  return init(
    lines.map((l) => toPath(l)),
    opts
  );
};

/**
 * Result 
 */
export type WaypointResult = {
  /**
   * Path being compared against
   */
  path: Path
  /**
   * Index of this path in original `paths` array
   */
  index: number
  /**
   * Nearest point on path. See also {@link distance}
   */
  nearest: Point
  /**
   * Closest distance to path. See also {@link nearest}
   */
  distance: number
  /**
   * Rank of this result, 0 being highest.
   */
  rank: number
  /**
   * Relative position on this path segment
   * 0 being start, 0.5 middle and so on.
   */
  positionRelative: number
}

/**
 * Given point `pt`, returns a list of {@link WaypointResult}, comparing
 * this point to a set of paths.
 * ```js
 * // Init once with a set of paths
 * const w = init(paths);
 * // Now call with a point to get results
 * const results = w({ x: 10, y: 20 });
 * ```
 */
export type Waypoints = (pt: Point) => WaypointResult[]

/**
 * Initialise
 * 
 * Options:
 * * maxDistanceFromLine: Distances greater than this are not matched. Default 0.1
 * @param paths 
 * @param opts 
 * @returns 
 */
export const init = (paths: readonly Path[], opts: Partial<WaypointOpts> = {}): Waypoints => {
  //const enforceOrder = opts.enforceOrder ?? true;
  const maxDistanceFromLine = opts.maxDistanceFromLine ?? 0.1;

  const checkUnordered = (pt: Point): WaypointResult[] => {
    const results = paths.map((p, index) => {
      const nearest = p.nearest(pt);
      const distance = PointsDistance(pt, nearest);

      // Relative position of nearest point on this path segment
      const positionRelative = p.relativePosition(nearest, maxDistanceFromLine);;
      return { positionRelative, path: p, index, nearest, distance, rank: Number.MAX_SAFE_INTEGER };
    });

    const filtered = results.filter((v) => v.distance <= maxDistanceFromLine);
    const sorted = sortByNumericProperty(filtered, `distance`);

    // Assign ranks

    for (let rank = 0; rank < sorted.length; rank++) {
      sorted[ rank ].rank = rank;
    }
    return sorted;
  };

  // const checkUnordered = (p:Point) => {
  //   // Calculate progress of pointer between all the waypoint lines
  //   const progresses = lines.map((line, index) => (
  //     {
  //       index,
  //       score: Points.progressBetween(p, line.a, line.b)
  //     }));
  //   // Sort by closest
  //   const sorted = Arrays.sortByNumericProperty(progresses, `score`);
  // };
  return checkUnordered;
};
