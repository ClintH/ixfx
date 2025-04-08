import type { Point } from "./point/point-type.js";
import { distance } from "./point/distance.js";
/**
 * Simplifies a curve by dropping points based on shortest distance.
 * 
 * Values of `epsilon` approaching zero keep more of the original points.
 * Making `epsilon` larger will filter out more points, making the curve more lossy and jagged.
 * 
 * ```js
 * // Source set of points that define the curve
 * const pts = [ {x:100,y:200}, {x:10, y:20}, ... ];
 * 
 * const simplified = rdpShortestDistance(pts, 3); // Yields an array of points
 * ```
 * It is an implementation of the [Ramer Douglas Peucker algorithm](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm)
 * by Marius Karthaus. Try the online playground: https://karthaus.nl/rdp/
 * 
 * @param points 
 * @param epsilon 
 * @returns 
 */
export const rdpShortestDistance = (points: Array<Point>, epsilon = 0.1): Array<Point> => {
  const firstPoint = points[ 0 ];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastPoint = points.at(-1)!;
  if (points.length < 3) {
    return points;
  }
  let index = -1;
  let distribution = 0;
  for (let index_ = 1; index_ < points.length - 1; index_++) {
    const cDistribution = distanceFromPointToLine(points[ index_ ], firstPoint, lastPoint);

    if (cDistribution > distribution) {
      distribution = cDistribution;
      index = index_;
    }
  }
  if (distribution > epsilon) {
    // iterate
    const l1 = points.slice(0, index + 1);
    const l2 = points.slice(index);
    const r1 = rdpShortestDistance(l1, epsilon);
    const r2 = rdpShortestDistance(l2, epsilon);
    // concat r2 to r1 minus the end/startpoint that will be the same
    const rs = [ ...r1.slice(0, - 1), ...r2 ];//concat(r2);
    return rs;
  } else {
    return [ firstPoint, lastPoint ];
  }
}

/**
 * Simplifies a curve by dropping points based on perpendicular distance
 * 
 * Values of `epsilon` approaching zero keep more of the original points.
 * Making `epsilon` larger will filter out more points, making the curve more lossy and jagged.
 * 
 * ```js
 * // Source set of points that define the curve
 * const pts = [ {x:100,y:200}, {x:10, y:20}, ... ];
 * 
 * const simplified = rdpShortestDistance(pts, 3); // Yields an array of points
 * ```
 * It is an implementation of the [Ramer Douglas Peucker algorithm](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm)
 * by Marius Karthaus. Try the online playground: https://karthaus.nl/rdp/
 * 
 * @param points 
 * @param epsilon 
 * @returns 
 */
export const rdpPerpendicularDistance = (points: Array<Point>, epsilon = 0.1): Array<Point> => {
  const firstPoint = points[ 0 ];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastPoint = points.at(-1)!;
  if (points.length < 3) {
    return points;
  }
  let index = -1;
  let distribution = 0;
  for (let index_ = 1; index_ < points.length - 1; index_++) {
    const cDistribution = findPerpendicularDistance(points[ index_ ], firstPoint, lastPoint);
    if (cDistribution > distribution) {
      distribution = cDistribution;
      index = index_;
    }
  }
  if (distribution > epsilon) {
    // iterate
    const l1 = points.slice(0, index + 1);
    const l2 = points.slice(index);
    const r1 = rdpPerpendicularDistance(l1, epsilon);
    const r2 = rdpPerpendicularDistance(l2, epsilon);
    // concat r2 to r1 minus the end/startpoint that will be the same
    const rs = [ ...r1.slice(0, - 1), ...r2 ];
    return rs;
  } else {
    return [ firstPoint, lastPoint ];
  }
}


function findPerpendicularDistance(p: Point, p1: Point, p2: Point) {
  // if start and end point are on the same x the distance is the difference in X.
  let result;
  let slope;
  let intercept;
  if (p1.x == p2.x) {
    result = Math.abs(p.x - p1.x);
  } else {
    slope = (p2.y - p1.y) / (p2.x - p1.x);
    intercept = p1.y - (slope * p1.x);
    result = Math.abs(slope * p.x - p.y + intercept) / Math.sqrt(Math.pow(slope, 2) + 1);
  }

  return result;
}


const distanceFromPointToLine = (p: Point, index: Point, index_: Point) => {
  const lineLength = distance(index, index_);//First, we need the length of the line segment.
  if (lineLength == 0) {	//if it's 0, the line is actually just a point.
    return distance(p, index);
  }
  const t = ((p.x - index.x) * (index_.x - index.x) + (p.y - index.y) * (index_.y - index.y)) / lineLength;

  //t is very important. t is a number that essentially compares the individual coordinates
  //distances between the point and each point on the line.

  if (t < 0) {	//if t is less than 0, the point is behind i, and closest to i.
    return distance(p, index);
  }	//if greater than 1, it's closest to j.
  if (t > 1) {
    return distance(p, index_);
  }
  return distance(p, { x: index.x + t * (index_.x - index.x), y: index.y + t * (index_.y - index.y) });
}


