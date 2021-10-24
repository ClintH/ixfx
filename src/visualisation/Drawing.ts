import * as Points from '../geometry/Point.js';
import * as Paths from '../geometry/Path.js';
import * as Lines from '../geometry/Line.js';
import {Beziers} from '../index.js';

export function paths(ctx: CanvasRenderingContext2D, ...pathsToDraw: Paths.Path[]): void {
  guardCtx(ctx);

  // Handle an array being passed
  if (Array.isArray(pathsToDraw[0])) return paths(ctx, ...pathsToDraw[0]);

  for (let i = 0; i < pathsToDraw.length; i++) {
    let p = pathsToDraw[i] as any;

    // Draw simple line
    if (p.a && p.b && p.quadratic) quadraticBezier(p, ctx, true);
    else if (p.a && p.b) line(p, ctx);
  }
}

export function points(ctx: CanvasRenderingContext2D, ...pts: Points.Point[]): void {
  guardCtx(ctx);

  if (pts.length == 0) return;

  // Handle an array being passed
  if (Array.isArray(pts[0])) return points(ctx, ...pts[0]);

  // Throw an error if any point is invalid
  for (let i = 0; i < pts.length; i++) Points.guard(pts[i], 'Index ' + i);

  // Draw points
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.stroke();
}

export function pointsEnclosed(ctx: CanvasRenderingContext2D, ...pts: Points.Point[]): void {
  guardCtx(ctx);
  if (pts.length == 0) return;

  // Handle an array being passed
  if (Array.isArray(pts[0])) return pointsEnclosed(ctx, ...pts[0]);

  // Throw an error if any point is invalid
  for (let i = 0; i < pts.length; i++) Points.guard(pts[i], 'Index ' + i);

  // Draw points
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.lineTo(pts[0].x, pts[0].y);
  ctx.stroke();
}


export function pointLabels(ctx: CanvasRenderingContext2D, ...pts: Points.Point[]): void {
  guardCtx(ctx);

  if (pts.length == 0) return;

  // Handle an array being passed
  if (Array.isArray(pts[0])) return pointLabels(ctx, ...pts[0]);

  // Throw an error if any point is invalid
  for (let i = 0; i < pts.length; i++) Points.guard(pts[i], 'Index ' + i);

  for (let i = 0; i < pts.length; i++) {
    ctx.fillText(i.toString(), pts[i].x, pts[i].y);
  }
}

function guardCtx(ctx: CanvasRenderingContext2D | any) {
  if (ctx === undefined) throw Error('ctx undefined');
}

function drawDot(pos: Points.Point, size: number, ctx: CanvasRenderingContext2D, fillStyle = 'red') {
  ctx.beginPath();
  ctx.strokeStyle = fillStyle;

  // x&y for arc is the center of circle
  ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
  ctx.stroke();
}

export function quadraticBezier(line: Beziers.QuadraticBezier, ctx: CanvasRenderingContext2D, debug: boolean = false) {
  guardCtx(ctx);

  const h = line.quadratic;
  const ss = ctx.strokeStyle;
  if (debug) {
    ctx.strokeStyle = 'whitesmoke'
    points(ctx, line.a, h, line.b);
    ctx.strokeStyle = ss;
  }

  ctx.beginPath();
  ctx.moveTo(line.a.x, line.a.y);
  ctx.quadraticCurveTo(h.x, h.y, line.b.x, line.b.y);
  ctx.stroke();

  if (debug) {
    ctx.fillText('a', line.a.x + 5, line.a.y);
    ctx.fillText('b', line.b.x + 5, line.b.y);
    ctx.fillText('h', h.x + 5, h.y);
    drawDot(h, 5, ctx);
    drawDot(line.a, 5, ctx, 'black');
    drawDot(line.b, 5, ctx, 'black');
  }
}

export function line(line: Lines.Line, ctx: CanvasRenderingContext2D, debug: boolean = false) {
  guardCtx(ctx);
  ctx.beginPath();
  ctx.moveTo(line.a.x, line.a.y);
  ctx.lineTo(line.b.x, line.b.y);
  if (debug) {
    ctx.fillText('a', line.a.x, line.a.y);
    ctx.fillText('b', line.b.x, line.b.y);
    drawDot(line.a, 5, ctx, 'black');
    drawDot(line.b, 5, ctx, 'black');
  }
  ctx.stroke();
}