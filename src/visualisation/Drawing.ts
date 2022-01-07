import * as Points from '../geometry/Point.js';
import * as Paths from '../geometry/Path.js';
import * as Lines from '../geometry/Line.js';
import {array as guardArray} from '../Guards.js';
import * as Circles from '../geometry/Arc.js';
import * as Beziers from '../geometry/Bezier.js';
import * as Rects from '../geometry/Rect.js';

// TODO: Is there a way of automagically defining makeHelper to avoid repetition and keep typesafety and JSDoc?
export const makeHelper = (ctxOrCanvasEl: CanvasRenderingContext2D | HTMLCanvasElement) => {
  if (ctxOrCanvasEl === undefined) throw Error(`ctxOrCanvasEl undefined. Must be a 2d drawing context or Canvas element`);
  let ctx: CanvasRenderingContext2D;
  if (ctxOrCanvasEl instanceof HTMLCanvasElement) {
    const ctx_ = ctxOrCanvasEl.getContext(`2d`);
    if (ctx_ === null) throw new Error(`Could not creating drawing context`);
    ctx = ctx_;
  } else ctx = ctxOrCanvasEl;


  return {
    paths(pathsToDraw: Paths.Path[], opts?: DrawingOpts): void {
      paths(ctx, pathsToDraw, opts);
    },
    line(lineToDraw: Lines.Line|Lines.Line[], opts?: DrawingOpts): void {
      line(ctx, lineToDraw, opts);
    },
    rect(rectsToDraw:Rects.RectPositioned|Rects.RectPositioned[], opts?:DrawingOpts & { filled?:boolean}): void {
      rect(ctx, rectsToDraw, opts);
    },
    bezier(bezierToDraw: Beziers.QuadraticBezier|Beziers.CubicBezier, opts?:DrawingOpts): void {
      bezier(ctx, bezierToDraw, opts);
    },
    connectedPoints(pointsToDraw: Points.Point[], opts?: DrawingOpts & {loop?: boolean}): void {
      connectedPoints(ctx, pointsToDraw, opts);
    },
    pointLabels(pointsToDraw: Points.Point[], opts?:DrawingOpts): void {
      pointLabels(ctx, pointsToDraw, opts);
    },
    dot(dotPosition: Points.Point|Points.Point[], opts?: DrawingOpts & {radius: number, outlined?: boolean, filled?: boolean}): void {
      dot(ctx, dotPosition, opts);
    },
    circle(circlesToDraw:Circles.CirclePositioned|Circles.CirclePositioned[], opts:DrawingOpts):void {
      circle(ctx, circlesToDraw, opts);
    },
    arc(arcsToDraw:Circles.ArcPositioned|Circles.ArcPositioned[], opts:DrawingOpts):void {
      arc(ctx, arcsToDraw, opts);
    },
    textBlock(lines:string[], opts:DrawingOpts & { anchor:Points.Point, anchorPadding?:number, bounds?: Rects.RectPositioned}):void {
      textBlock(ctx, lines, opts);
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

export const arc = (ctx:CanvasRenderingContext2D, arcs:Circles.ArcPositioned|Circles.ArcPositioned[], opts:DrawingOpts = {}) => {
  applyOpts(ctx, opts);

  const draw = (arc:Circles.ArcPositioned) => {
    ctx.beginPath();
    ctx.arc(arc.x, arc.y, arc.radius, arc.startRadian, arc.endRadian);
    ctx.stroke();
  };

  if (Array.isArray(arcs)) {
    arcs.forEach(draw);
  } else draw(arcs);

};

export const circle = (ctx:CanvasRenderingContext2D, circlesToDraw:Circles.CirclePositioned|Circles.CirclePositioned[], opts:DrawingOpts = {}) => {
  applyOpts(ctx, opts);

  const draw = (c:Circles.CirclePositioned) => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, PIPI);
    ctx.stroke();
  };
  if (Array.isArray(circlesToDraw)) circlesToDraw.forEach(draw);
  else draw(circlesToDraw);
};

export const paths = (ctx: CanvasRenderingContext2D, pathsToDraw: Paths.Path[]|Paths.Path, opts: {strokeStyle?: string, debug?: boolean} = {}) =>  {
  applyOpts(ctx, opts);

  const draw = (path:Paths.Path) => {

    // Call appropriate drawing function depending on the type of path
    if (Beziers.isQuadraticBezier(path)) quadraticBezier(ctx, path, opts);
    else if (Lines.isLine(path)) line(ctx, path, opts);
    else throw new Error(`Unknown path type ${JSON.stringify(path)}`);
  };

  if (Array.isArray(pathsToDraw)) pathsToDraw.forEach(draw);
  else draw(pathsToDraw);
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

export const pointLabels = (ctx: CanvasRenderingContext2D, pts: Points.Point[], opts: {fillStyle?: string} = {}, labels?:string[]) => {
  guardCtx(ctx);

  if (pts.length === 0) return;

  // Throw an error if any point is invalid
  for (let i = 0; i < pts.length; i++) Points.guard(pts[i], `Index ` + i);

  if (opts.fillStyle) ctx.fillStyle = opts.fillStyle;

  for (let i = 0; i < pts.length; i++) {
    let label = i.toString();
    if (labels !== undefined && i<labels.length) {
      label =labels[i];
    }
    
    ctx.fillText(label.toString(), pts[i].x, pts[i].y);
  }
};

const guardCtx = (ctx: CanvasRenderingContext2D) => {
  if (ctx === undefined) throw Error(`ctx undefined`);
};

const dot = (ctx: CanvasRenderingContext2D, pos: Points.Point|Points.Point[], opts?: DrawingOpts & {radius?: number, outlined?: boolean, filled?: boolean})  => {
  if (opts === undefined) opts = {};
  const radius = opts.radius ?? 10;
  let filled = opts.filled ?? false;
  const outlined = opts.outlined ?? false;

  if (!filled && !outlined) filled = true;

  applyOpts(ctx, opts);

  ctx.beginPath();

  // x&y for arc is the center of circle
  if (Array.isArray(pos)) {
    for (let i=0;i<pos.length;i++) {
      ctx.arc(pos[i].x, pos[i].y, radius, 0, 2 * Math.PI);
    }
  } else {
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
  }


  if (filled) ctx.fill();
  if (outlined) ctx.stroke();
};

export const bezier = (ctx: CanvasRenderingContext2D, bezierToDraw: Beziers.QuadraticBezier|Beziers.CubicBezier, opts?: DrawingOpts) => {
  if (Beziers.isQuadraticBezier(bezierToDraw)) {
    quadraticBezier(ctx, bezierToDraw)
  }
}

const cubicBezier = (ctx: CanvasRenderingContext2D, bezierToDraw: Beziers.CubicBezier, opts: DrawingOpts) => {
  applyOpts(ctx, opts);

  const {a, b, cubic1, cubic2} = bezierToDraw;
  const debug = opts.debug ?? false;

  if (debug) {
    const ss = ctx.strokeStyle;
  }
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.bezierCurveTo(cubic1.x, cubic1.y, cubic2.x, cubic2.y, b.x, b.y);

};

const quadraticBezier = (ctx: CanvasRenderingContext2D, bezierToDraw: Beziers.QuadraticBezier, opts: DrawingOpts) => {
  applyOpts(ctx, opts);
  const {a, b, quadratic} = bezierToDraw;
  const debug = opts.debug ?? false;
  if (debug) {
    const ss = ctx.strokeStyle;
    connectedPoints(ctx, [a, quadratic, b], {strokeStyle: `silver`});
    ctx.strokeStyle = ss;
  }

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.quadraticCurveTo(quadratic.x, quadratic.y, b.x, b.y);
  ctx.stroke();

  if (debug) {
    const fs = ctx.fillStyle;
    ctx.fillStyle = `black`;
    ctx.fillText(`a`, a.x + 5, a.y);
    ctx.fillText(`b`, b.x + 5, b.y);
    ctx.fillText(`h`, quadratic.x + 5, quadratic.y);
    dot(ctx, quadratic, {radius: 5});
    dot(ctx, a, {radius: 5, fillStyle: `black`});
    dot(ctx, b, {radius: 5, fillStyle: `black`});
    ctx.fillStyle = fs;
  }
};

export const line = (ctx: CanvasRenderingContext2D, toDraw: Lines.Line|Lines.Line[], opts: {strokeStyle?: string, debug?: boolean} = {}) => {
  applyOpts(ctx, opts);

  const debug = opts.debug ?? false;

  const draw = (d:Lines.Line) => {
    const {a, b} = d;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    if (debug) {
      ctx.fillText(`a`, a.x, a.y);
      ctx.fillText(`b`, b.x, b.y);
      dot(ctx, a, {radius: 5, strokeStyle: `black`});
      dot(ctx, b, {radius: 5, strokeStyle: `black`});
    }
    ctx.stroke();
  };

  if (Array.isArray(toDraw)) toDraw.forEach(draw);
  else draw(toDraw);
};

export const rect = (ctx: CanvasRenderingContext2D, toDraw: Rects.RectPositioned|Rects.RectPositioned[], opts: DrawingOpts & {filled?:boolean} = {}) => {
  applyOpts(ctx, opts);

  const draw = (d:Rects.RectPositioned) => {
    if (opts.filled) ctx.fillRect(d.x, d.y, d.width, d.height);
    ctx.strokeRect(d.x, d.y, d.width, d.height);

    if (opts.debug) {
      pointLabels(ctx, Rects.getCorners(d), undefined, [`NW`, `NE`, `SE`, `SW`]);
    }
  };

  if (Array.isArray(toDraw)) toDraw.forEach(draw);
  else draw(toDraw);
};

export const textBlock = (ctx:CanvasRenderingContext2D, lines:string[], opts:DrawingOpts & { anchor:Points.Point, anchorPadding?:number, bounds?: Rects.RectPositioned}) => {
  applyOpts(ctx, opts);
  const anchorPadding = opts.anchorPadding ?? 0;

  const anchor = opts.anchor;
  let {bounds} = opts;
  if (bounds === undefined) bounds = {x:0, y:0, width:1000000, height:1000000};

  // Measure each line
  const blocks = lines.map(l => ctx.measureText(l));

  // Get width and height
  const widths = blocks.map(tm => tm.width);
  const heights = blocks.map(tm => tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent);

  // Find extremes
  const maxWidth = Math.max(...widths);
  const totalHeight = heights.reduce((acc, val) => acc+val, 0);

  let {x, y} = anchor;

  if (anchor.x + maxWidth > bounds.width) x = bounds.width - (maxWidth + anchorPadding);
  else x -= anchorPadding;
  
  if (x < bounds.x) x = bounds.x + anchorPadding;

  if (anchor.y + totalHeight > bounds.height) y = bounds.height - (totalHeight + anchorPadding);
  else y -= anchorPadding;

  if (y < bounds.y) y = bounds.y + anchorPadding;

  for (let i=0;i<lines.length;i++) {
    ctx.fillText(lines[i], x, y);
    y += heights[i];
  }
};