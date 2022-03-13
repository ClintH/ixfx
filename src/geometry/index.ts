import * as Arcs from './Arc.js';
import * as Beziers from './Bezier.js';
import * as Circles from './Circle.js';
import * as Compound from './CompoundPath.js';
import * as Grids from './Grid.js';
import * as Lines from './Line.js';
import * as Paths from './Path.js';
import * as Points from './Point.js';
import * as Rects from './Rect.js';
import * as Ellipses from './Ellipse.js';

export {Circles, Arcs, Lines, Rects, Points, Paths, Grids, Beziers, Compound, Ellipses};

export * as Polar from './Polar.js';

export const degreeToRadian = (angleInDegrees:number) => (angleInDegrees) * (Math.PI / 180.0);

export const radianToDegree = (angleInRadians:number) => angleInRadians * 180 / Math.PI;

export const radiansFromAxisX = (point:Points.Point):number => Math.atan2(point.x, point.y);
