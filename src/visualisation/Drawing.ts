import * as Points from '../geometry/Point.js';
import * as Paths from '../geometry/Path.js';
import * as Lines from '../geometry/Line.js';
import {array as guardArray} from '../Guards.js';

import {Beziers} from '../index.js';

// TODO: Would be nice to have a function that curries all these for a given ctx whilst still maintaining type safety

export function paths(ctx: CanvasRenderingContext2D, pathsToDraw: Paths.Path[], opts: {debug?: boolean} = {}): void {
  guardCtx(ctx);

  for (let i = 0; i < pathsToDraw.length; i++) {
    let p = pathsToDraw[i] as any;

    // Draw simple line
    if (p.a && p.b && p.quadratic) quadraticBezier(ctx, p, opts);
    else if (p.a && p.b) line(ctx, p, opts);
  }
}

/**
 * Draws a line between all the given points.
 *
 * @export
 * @param {CanvasRenderingContext2D} ctx
 * @param {...Points.Point[]} pts
 * @returns {void}
 */
export function connectedPoints(ctx: CanvasRenderingContext2D, pts: Points.Point[], opts: {loop?: boolean, strokeStyle?: string} = {}): void {
  guardCtx(ctx);
  guardArray(pts);

  const loop = opts.loop ?? false;

  if (pts.length == 0) return;

  // Throw an error if any point is invalid
  for (let i = 0; i < pts.length; i++) Points.guard(pts[i], 'Index ' + i);

  // Draw points
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }

  if (loop) ctx.lineTo(pts[0].x, pts[0].y);
  if (opts.strokeStyle) ctx.strokeStyle = opts.strokeStyle;
  ctx.stroke();
}

export function pointLabels(ctx: CanvasRenderingContext2D, pts: Points.Point[], opts: {fillStyle?: string} = {}): void {
  guardCtx(ctx);

  if (pts.length == 0) return;

  // Throw an error if any point is invalid
  for (let i = 0; i < pts.length; i++) Points.guard(pts[i], 'Index ' + i);

  if (opts.fillStyle) ctx.fillStyle = opts.fillStyle;

  for (let i = 0; i < pts.length; i++) {
    ctx.fillText(i.toString(), pts[i].x, pts[i].y);
  }
}

function guardCtx(ctx: CanvasRenderingContext2D | any) {
  if (ctx === undefined) throw Error('ctx undefined');
}

function drawDot(ctx: CanvasRenderingContext2D, pos: Points.Point, opts: {size: number, strokeStyle?: string, fillStyle?: string, outlined?: boolean, filled?: boolean}) {
  const size = opts.size ?? 10;
  let filled = opts.filled ?? false;
  const outlined = opts.outlined ?? false;

  if (!filled && !outlined) filled = true;

  ctx.beginPath();

  // x&y for arc is the center of circle
  ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI);

  if (opts.fillStyle) {
    ctx.fillStyle = opts.fillStyle;
  }
  if (filled) ctx.fill();


  if (opts.strokeStyle) {
    ctx.strokeStyle = opts.strokeStyle;
  }
  if (outlined) ctx.stroke();
}

export function quadraticBezier(ctx: CanvasRenderingContext2D, line: Beziers.QuadraticBezier, opts: {strokeStyle?: string, debug?: boolean}) {
  guardCtx(ctx);
  const debug = opts.debug ?? false;
  const h = line.quadratic;
  const ss = ctx.strokeStyle;
  if (debug) {
    connectedPoints(ctx, [line.a, h, line.b], {strokeStyle: 'silver'});
    ctx.strokeStyle = ss;
  }

  ctx.beginPath();
  ctx.moveTo(line.a.x, line.a.y);
  ctx.quadraticCurveTo(h.x, h.y, line.b.x, line.b.y);
  if (opts.strokeStyle) ctx.strokeStyle = opts.strokeStyle;
  ctx.stroke();

  if (debug) {
    ctx.fillStyle = 'black';
    ctx.fillText('a', line.a.x + 5, line.a.y);
    ctx.fillText('b', line.b.x + 5, line.b.y);
    ctx.fillText('h', h.x + 5, h.y);
    drawDot(ctx, h, {size: 5});
    drawDot(ctx, line.a, {size: 5, fillStyle: 'black'});
    drawDot(ctx, line.b, {size: 5, fillStyle: 'black'});
  }
}

export function line(ctx: CanvasRenderingContext2D, line: Lines.Line, opts: {debug?: boolean} = {}) {
  const debug = opts.debug ?? false;

  guardCtx(ctx);
  ctx.beginPath();
  ctx.moveTo(line.a.x, line.a.y);
  ctx.lineTo(line.b.x, line.b.y);
  if (debug) {
    ctx.fillText('a', line.a.x, line.a.y);
    ctx.fillText('b', line.b.x, line.b.y);
    drawDot(ctx, line.a, {size: 5, strokeStyle: 'black'});
    drawDot(ctx, line.b, {size: 5, strokeStyle: 'black'});
  }
  ctx.stroke();
}