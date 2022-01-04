import * as Points from '../geometry/Point.js';
import * as Paths from '../geometry/Path.js';
import * as Lines from '../geometry/Line.js';
import {array as guardArray} from '../Guards.js';

import {Beziers} from '../index.js';
import {CirclePositioned} from '../geometry/Arc.js';

// TODO: Is there a way of automagically defining makeHelper to avoid repetition and keep typesafety and JSDoc?
export const makeHelper = (ctxOrCanvasEl: CanvasRenderingContext2D | HTMLCanvasElement) => {
  if (ctxOrCanvasEl === undefined) throw Error(`ctxOrCanvasEl undefined. Must be a 2d drawing context or Canvas element`);
  let ctx: CanvasRenderingContext2D;
  if (ctxOrCanvasEl instanceof HTMLCanvasElement) {
    ctx = ctxOrCanvasEl.getContext(`2d`)!;
  } else ctx = ctxOrCanvasEl;


  return {
    paths(pathsToDraw: Paths.Path[], opts?: {strokeStyle?: string, debug?: boolean}): void {
      paths(ctx, pathsToDraw, opts);
    },
    line(lineToDraw: Lines.Line, opts?: {strokeStyle?: string, debug?: boolean}): void {
      line(ctx, lineToDraw, opts);
    },
    quadraticBezier(bezierToDraw: Beziers.QuadraticBezier, opts: {strokeStyle?: string, debug?: boolean}): void {
      quadraticBezier(ctx, bezierToDraw, opts);
    },
    connectedPoints(pointsToDraw: Points.Point[], opts: {loop?: boolean, strokeStyle?: string} = {}): void {
      connectedPoints(ctx, pointsToDraw, opts);
    },
    pointLabels(pointsToDraw: Points.Point[], opts: {fillStyle?: string} = {}): void {
      pointLabels(ctx, pointsToDraw, opts);
    },
    dot(dotPosition: Points.Point, opts: {radius: number, strokeStyle?: string, fillStyle?: string, outlined?: boolean, filled?: boolean}): void {
      dot(ctx, dotPosition, opts);
    },
    circle(circleToDraw:CirclePositioned, opts:DrawingOpts):void {
      circle(ctx, circleToDraw, opts);
    }
  };
};

type DrawingOpts = {
  strokeStyle?:string
  fillStyle?:string
  debug?:boolean
};

const PIPI = Math.PI * 2;

const applyOpts = (ctx:CanvasRenderingContext2D, opts:DrawingOpts):void => {
  guardCtx(ctx);
  if (opts.strokeStyle) ctx.strokeStyle = opts.strokeStyle;
  if (opts.fillStyle) ctx.fillStyle = opts.fillStyle;
};

export const circle = (ctx:CanvasRenderingContext2D, circle:CirclePositioned, opts:DrawingOpts = {}) => {
  applyOpts(ctx, opts);
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, PIPI);
  ctx.stroke();
  ctx.closePath();
};

export const paths = (ctx: CanvasRenderingContext2D, pathsToDraw: Paths.Path[], opts: {strokeStyle?: string, debug?: boolean} = {}) =>  {
  guardCtx(ctx);

  for (let i = 0; i < pathsToDraw.length; i++) {
    const p = pathsToDraw[i] as any;

    // Draw simple line
    if (p.a && p.b && p.quadratic) quadraticBezier(ctx, p, opts);
    else if (p.a && p.b) line(ctx, p, opts);
  }
};

/**
 * Draws a line between all the given points.
 *
 * @export
 * @param {CanvasRenderingContext2D} ctx
 * @param {...Points.Point[]} pts
 * @returns {void}
 */
export const connectedPoints = (ctx: CanvasRenderingContext2D, pts: Points.Point[], opts: {loop?: boolean, strokeStyle?: string} = {}) => {
  guardCtx(ctx);
  guardArray(pts);

  const loop = opts.loop ?? false;

  if (pts.length === 0) return;

  // Throw an error if any point is invalid
  for (let i = 0; i < pts.length; i++) Points.guard(pts[i], `Index ` + i);

  // Draw points
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }

  if (loop) ctx.lineTo(pts[0].x, pts[0].y);
  if (opts.strokeStyle) ctx.strokeStyle = opts.strokeStyle;
  ctx.stroke();
};

export const pointLabels = (ctx: CanvasRenderingContext2D, pts: Points.Point[], opts: {fillStyle?: string} = {}) => {
  guardCtx(ctx);

  if (pts.length === 0) return;

  // Throw an error if any point is invalid
  for (let i = 0; i < pts.length; i++) Points.guard(pts[i], `Index ` + i);

  if (opts.fillStyle) ctx.fillStyle = opts.fillStyle;

  for (let i = 0; i < pts.length; i++) {
    ctx.fillText(i.toString(), pts[i].x, pts[i].y);
  }
};

const guardCtx = (ctx: CanvasRenderingContext2D | any) => {
  if (ctx === undefined) throw Error(`ctx undefined`);
};

const dot = (ctx: CanvasRenderingContext2D, pos: Points.Point, opts: {radius: number, strokeStyle?: string, fillStyle?: string, outlined?: boolean, filled?: boolean})  => {
  const radius = opts.radius ?? 10;
  let filled = opts.filled ?? false;
  const outlined = opts.outlined ?? false;

  if (!filled && !outlined) filled = true;

  ctx.beginPath();

  // x&y for arc is the center of circle
  ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);

  if (opts.fillStyle) {
    ctx.fillStyle = opts.fillStyle;
  }
  if (filled) ctx.fill();


  if (opts.strokeStyle) {
    ctx.strokeStyle = opts.strokeStyle;
  }
  if (outlined) ctx.stroke();
};

export const quadraticBezier = (ctx: CanvasRenderingContext2D, bezierToDraw: Beziers.QuadraticBezier, opts: {strokeStyle?: string, debug?: boolean}) => {
  guardCtx(ctx);
  const debug = opts.debug ?? false;
  //const h = line.quadratic;

  const {a, b, quadratic} = bezierToDraw;
  const ss = ctx.strokeStyle;
  if (debug) {
    connectedPoints(ctx, [a, quadratic, b], {strokeStyle: `silver`});
    ctx.strokeStyle = ss;
  }

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.quadraticCurveTo(quadratic.x, quadratic.y, b.x, b.y);
  if (opts.strokeStyle) ctx.strokeStyle = opts.strokeStyle;
  ctx.stroke();

  if (debug) {
    ctx.fillStyle = `black`;
    ctx.fillText(`a`, a.x + 5, a.y);
    ctx.fillText(`b`, b.x + 5, b.y);
    ctx.fillText(`h`, quadratic.x + 5, quadratic.y);
    dot(ctx, quadratic, {radius: 5});
    dot(ctx, a, {radius: 5, fillStyle: `black`});
    dot(ctx, b, {radius: 5, fillStyle: `black`});
  }
};

export const line = (ctx: CanvasRenderingContext2D, lineToDraw: Lines.Line, opts: {strokeStyle?: string, debug?: boolean} = {}) => {
  const debug = opts.debug ?? false;
  const {a, b} = lineToDraw;

  const ss = ctx.strokeStyle;
  guardCtx(ctx);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  if (debug) {
    ctx.fillText(`a`, a.x, a.y);
    ctx.fillText(`b`, b.x, b.y);
    dot(ctx, a, {radius: 5, strokeStyle: `black`});
    dot(ctx, b, {radius: 5, strokeStyle: `black`});
  }
  if (opts.strokeStyle) ctx.strokeStyle = opts.strokeStyle;
  ctx.stroke();
  ctx.strokeStyle = ss;
};