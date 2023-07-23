import * as Lines from './Line.js';
import * as Points from './Point.js';
import { type CirclePositioned } from './Circle.js';
import { Arrays } from '../collections/index.js';
import { type Path } from './Path.js';

export type Waypoint = CirclePositioned;

export type Opts = {
  readonly maxDistanceFromLine?: number;
  readonly enforceOrder?: boolean;
};

export const fromPoints = (
  waypoints: readonly Points.Point[],
  opts: Opts = {}
) => {
  const lines = Lines.joinPointsToLines(...waypoints);
  return init(
    lines.map((l) => Lines.toPath(l)),
    opts
  );
};

export const init = (paths: readonly Path[], opts: Opts = {}) => {
  //const enforceOrder = opts.enforceOrder ?? true;
  const maxDistanceFromLine = opts.maxDistanceFromLine ?? 0.1;

  const checkUnordered = (pt: Points.Point) => {
    const results = paths.map((p, index) => {
      const nearest = p.nearest(pt);
      const distance = Points.distance(pt, nearest);
      return { path: p, index, nearest, distance };
    });

    const filtered = results.filter((v) => v.distance <= maxDistanceFromLine);
    const sorted = Arrays.sortByNumericProperty(filtered, `distance`);

    return sorted;
  };

  // const checkUnordered = (p:Points.Point) => {
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
