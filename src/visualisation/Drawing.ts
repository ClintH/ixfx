import * as Points from '../geometry/Point.js';
import * as Paths from '../geometry/Path.js';
import * as Lines from '../geometry/Line.js';
import {array as guardArray} from '../Guards.js';
import * as Circles from '../geometry/Arc.js';
import * as Beziers from '../geometry/Bezier.js';
import * as Rects from '../geometry/Rect.js';
import * as color2k from 'color2k';
import {stack, Stack} from '../collections/Stack.js';
import {resolveEl} from '../dom/Forms.js';
import { resizeObservable } from '../dom/index.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
const PIPI = Math.PI * 2;

export const autoSizeCanvas = (canvasEl:HTMLCanvasElement, callback:() => void, timeoutMs:number = 1000) => {
  const ro = resizeObservable(canvasEl, timeoutMs).subscribe((entries:readonly ResizeObserverEntry[]) => {
    const e = entries.find(v => v.target === canvasEl);
    if (e === undefined) return;
    // eslint-disable-next-line functional/immutable-data
    canvasEl.width = e.contentRect.width;
    // eslint-disable-next-line functional/immutable-data
    canvasEl.height = e.contentRect.height;
    callback();
  });
  return ro;
};

type CanvasCtxQuery = null | string | CanvasRenderingContext2D | HTMLCanvasElement;
export const getCtx = (canvasElCtxOrQuery:CanvasCtxQuery): CanvasRenderingContext2D => {
  if (canvasElCtxOrQuery === null) throw Error(`canvasElCtxOrQuery null. Must be a 2d drawing context or Canvas element`);
  if (canvasElCtxOrQuery === undefined) throw Error(`canvasElCtxOrQuery undefined. Must be a 2d drawing context or Canvas element`);
  
  const ctx = (canvasElCtxOrQuery instanceof CanvasRenderingContext2D) ?
    canvasElCtxOrQuery : (canvasElCtxOrQuery instanceof HTMLCanvasElement) ?
      canvasElCtxOrQuery.getContext(`2d`) : (typeof canvasElCtxOrQuery === `string`) ?
        resolveEl<HTMLCanvasElement>(canvasElCtxOrQuery).getContext(`2d`): canvasElCtxOrQuery;
  if (ctx === null) throw new Error(`Could not create 2d context for canvas`);
  return ctx;
};

// TODO: Is there a way of automagically defining makeHelper to avoid repetition and keep typesafety and JSDoc?
export const makeHelper = (ctxOrCanvasEl:CanvasCtxQuery, canvasBounds?:Rects.Rect) => {
  const ctx = getCtx(ctxOrCanvasEl);
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
      if (opts.bounds === undefined && canvasBounds !== undefined) opts = {...opts, bounds: {...canvasBounds, x:0, y:0 }};
      textBlock(ctx, lines, opts);
    }
  };
};

type DrawingOpts = {
  readonly strokeStyle?:string
  readonly fillStyle?:string
  readonly debug?:boolean
};

const optsOp = (opts:DrawingOpts):StackOp => coloringOp(opts.strokeStyle, opts.fillStyle);

const applyOpts = (ctx:CanvasRenderingContext2D, opts:DrawingOpts = {}):DrawingStack => {
  if (ctx === undefined) throw Error(`ctx undefined`);

  // Create a drawing stack, pushing an op generated from drawing options
  const stack = drawingStack(ctx).push(optsOp(opts));
  
  // Apply stack to context
  stack.apply();
  return stack;
};

export const arc = (ctx:CanvasRenderingContext2D, arcs:Circles.ArcPositioned|ReadonlyArray<Circles.ArcPositioned>, opts:DrawingOpts = {}) => {
  applyOpts(ctx, opts);

  const draw = (arc:Circles.ArcPositioned) => {
    ctx.beginPath();
    ctx.arc(arc.x, arc.y, arc.radius, arc.startRadian, arc.endRadian);
    ctx.stroke();
  };

  if (Array.isArray(arcs)) {
    arcs.forEach(draw);
  } else draw(arcs as Circles.ArcPositioned);
};

type StackOp = (ctx:CanvasRenderingContext2D) => void
//apply(ctx:CanvasRenderingContext2D):void
//remove(ctx:CanvasRenderingContext2D):void

type DrawingStack = Readonly<{
  push(op:StackOp):DrawingStack
  pop():DrawingStack
  apply():DrawingStack
}>

const coloringOp = (strokeStyle:string|CanvasGradient|CanvasPattern|undefined, fillStyle:string|CanvasGradient|CanvasPattern|undefined):StackOp => {

  const apply = (ctx:CanvasRenderingContext2D) => {
    // eslint-disable-next-line functional/immutable-data
    if (fillStyle) ctx.fillStyle = fillStyle;
    // eslint-disable-next-line functional/immutable-data
    if (strokeStyle) ctx.strokeStyle = strokeStyle;
  };
  return apply;
};

export const drawingStack = (ctx:CanvasRenderingContext2D, stk?:Stack<StackOp>):DrawingStack => {
  if (stk === undefined) stk = stack<StackOp>();

  const push = (op:StackOp):DrawingStack => {
    if (stk === undefined) stk = stack<StackOp>();
    const s = stk.push(op);
    op(ctx);
    return drawingStack(ctx, s);
  };

  const pop = ():DrawingStack => {
    const s = stk?.pop();
    return drawingStack(ctx, s);
  };

  const apply = ():DrawingStack => {
    if (stk === undefined) return drawingStack(ctx);
    stk.forEach(op => op(ctx));
    return drawingStack(ctx, stk);
  };

  return {push, pop, apply};
};

export const circle = (ctx:CanvasRenderingContext2D, circlesToDraw:Circles.CirclePositioned|readonly Circles.CirclePositioned[], opts:DrawingOpts = {}) => {
  applyOpts(ctx, opts);

  const draw = (c:Circles.CirclePositioned) => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, PIPI);
    ctx.stroke();
  };
  if (Array.isArray(circlesToDraw)) circlesToDraw.forEach(draw);
  else draw(circlesToDraw as Circles.CirclePositioned);
};

export const paths = (ctx: CanvasRenderingContext2D, pathsToDraw: readonly Paths.Path[]|Paths.Path, opts: Readonly<{readonly strokeStyle?: string, readonly debug?: boolean}> = {}) =>  {
  applyOpts(ctx, opts);

  const draw = (path:Paths.Path) => {
    // Call appropriate drawing function depending on the type of path
    if (Beziers.isQuadraticBezier(path)) quadraticBezier(ctx, path, opts);
    else if (Lines.isLine(path)) line(ctx, path, opts);
    else throw new Error(`Unknown path type ${JSON.stringify(path)}`);
  };

  if (Array.isArray(pathsToDraw)) pathsToDraw.forEach(draw);
  else draw(pathsToDraw as Paths.Path);
};

/**
 * Draws a line between all the given points.
 *
 * @export
 * @param {CanvasRenderingContext2D} ctx
 * @param {...Points.Point[]} pts
 * @returns {void}
 */
export const connectedPoints = (ctx: CanvasRenderingContext2D, pts: readonly Points.Point[], opts: {readonly loop?: boolean, readonly strokeStyle?: string} = {}) => {
  const shouldLoop = opts.loop ?? false;

  guardArray(pts);
  if (pts.length === 0) return;

  // Throw an error if any point is invalid
  pts.forEach((pt, i) => Points.guard(pt, `Index ${i}`));

  applyOpts(ctx, opts);

  // Draw points
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.forEach((pt) => ctx.lineTo(pt.x, pt.y));

  if (shouldLoop) ctx.lineTo(pts[0].x, pts[0].y);
  //if (opts.strokeStyle) ctx.strokeStyle = opts.strokeStyle;
  ctx.stroke();
};

export const pointLabels = (ctx: CanvasRenderingContext2D, pts: readonly Points.Point[], opts: {readonly fillStyle?:string} = {}, labels?:readonly string[]) => {
  if (pts.length === 0) return;

  // Throw an error if any point is invalid
  pts.forEach((pt, i) => Points.guard(pt, `Index ${i}`));

  applyOpts(ctx, opts);

  pts.forEach((pt, i) => {
    const label = (labels !== undefined && i<labels.length) ? labels[i] : i.toString();
    ctx.fillText(label.toString(), pt.x, pt.y);    
  });
};


const dot = (ctx: CanvasRenderingContext2D, pos: Points.Point|readonly Points.Point[], opts?: DrawingOpts & {readonly radius?: number, readonly outlined?: boolean, readonly filled?: boolean})  => {
  if (opts === undefined) opts = {};
  const radius = opts.radius ?? 10;
  
  applyOpts(ctx, opts);

  ctx.beginPath();

  // x&y for arc is the center of circle
  if (Array.isArray(pos)) {
    pos.forEach(p => {
      ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
    });
  } else {
    const p = pos as Points.Point;
    ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
  }

  if (opts.filled || !opts.outlined) ctx.fill();
  if (opts.outlined) ctx.stroke();

};

export const bezier = (ctx: CanvasRenderingContext2D, bezierToDraw: Beziers.QuadraticBezier|Beziers.CubicBezier, opts?: DrawingOpts) => {
  if (Beziers.isQuadraticBezier(bezierToDraw)) {
    quadraticBezier(ctx, bezierToDraw, opts);
  } else if (Beziers.isCubicBezier(bezierToDraw)) {
    cubicBezier(ctx, bezierToDraw, opts);
  }
};

const cubicBezier = (ctx: CanvasRenderingContext2D, bezierToDraw: Beziers.CubicBezier, opts: DrawingOpts = {}) => {
  // eslint-disable-next-line functional/no-let
  let stack = applyOpts(ctx, opts);

  const {a, b, cubic1, cubic2} = bezierToDraw;
  const isDebug = opts.debug ?? false;

  if (isDebug) {
    // const ss = ctx.strokeStyle;
    // ctx.strokeStyle = ss;
  }
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.bezierCurveTo(cubic1.x, cubic1.y, cubic2.x, cubic2.y, b.x, b.y);
  ctx.stroke();

  if (isDebug) {
    stack = stack.push(optsOp({...opts, 
      strokeStyle: color2k.transparentize(opts.strokeStyle ?? `silver`, 0.6),
      fillStyle: color2k.transparentize(opts.fillStyle ?? `yellow`, 0.4)}));

    stack.apply();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(cubic1.x, cubic1.y);
    ctx.stroke();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(cubic2.x, cubic2.y);
    ctx.stroke();

    ctx.fillText(`a`, a.x + 5, a.y);
    ctx.fillText(`b`, b.x + 5, b.y);
    ctx.fillText(`c1`, cubic1.x + 5, cubic1.y);
    ctx.fillText(`c2`, cubic2.x + 5, cubic2.y);

    dot(ctx, cubic1, {radius: 3});
    dot(ctx, cubic2, {radius: 3});
    dot(ctx, a, {radius: 3});
    dot(ctx, b, {radius: 3});
    stack = stack.pop();
    stack.apply();
  }

};

const quadraticBezier = (ctx: CanvasRenderingContext2D, bezierToDraw: Beziers.QuadraticBezier, opts: DrawingOpts = {}) => {
  const {a, b, quadratic} = bezierToDraw;
  const isDebug = opts.debug ?? false;
  // eslint-disable-next-line functional/no-let
  let stack = applyOpts(ctx, opts);

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.quadraticCurveTo(quadratic.x, quadratic.y, b.x, b.y);
  ctx.stroke();

  if (isDebug) {
    // const fs = ctx.fillStyle;
    // const ss = ctx.strokeStyle;
    // ctx.fillStyle = opts.strokeStyle ?? `gray`;
    // ctx.strokeStyle = opts.strokeStyle ?? `gray`;
    stack = stack.push(optsOp({...opts, 
      strokeStyle: color2k.transparentize(opts.strokeStyle ?? `silver`, 0.6),
      fillStyle: color2k.transparentize(opts.fillStyle ?? `yellow`, 0.4)}));
    connectedPoints(ctx, [a, quadratic, b]);

    ctx.fillText(`a`, a.x + 5, a.y);
    ctx.fillText(`b`, b.x + 5, b.y);
    ctx.fillText(`h`, quadratic.x + 5, quadratic.y);
    dot(ctx, quadratic, {radius: 3});
    dot(ctx, a, {radius: 3});
    dot(ctx, b, {radius: 3});
    // ctx.fillStyle = fs;
    // ctx.strokeStyle = ss;
    stack = stack.pop();
    stack.apply();
  }

};

export const line = (ctx: CanvasRenderingContext2D, toDraw: Lines.Line|readonly Lines.Line[], opts: {readonly strokeStyle?: string, readonly debug?: boolean} = {}) => {
  const isDebug = opts.debug ?? false;

  applyOpts(ctx, opts);

  const draw = (d:Lines.Line) => {
    const {a, b} = d;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    if (isDebug) { 
      ctx.fillText(`a`, a.x, a.y);
      ctx.fillText(`b`, b.x, b.y);
      dot(ctx, a, {radius: 5, strokeStyle: `black`});
      dot(ctx, b, {radius: 5, strokeStyle: `black`});
    }
    ctx.stroke();
  };

  if (Array.isArray(toDraw)) toDraw.forEach(draw);
  else draw(toDraw as Lines.Line);

};

export const rect = (ctx: CanvasRenderingContext2D, toDraw: Rects.RectPositioned|readonly Rects.RectPositioned[], opts: DrawingOpts & {readonly filled?:boolean} = {}) => {
  applyOpts(ctx, opts);

  const draw = (d:Rects.RectPositioned) => {
    if (opts.filled) ctx.fillRect(d.x, d.y, d.width, d.height);
    ctx.strokeRect(d.x, d.y, d.width, d.height);

    if (opts.debug) {
      pointLabels(ctx, Rects.getCorners(d), undefined, [`NW`, `NE`, `SE`, `SW`]);
    }
  };

  if (Array.isArray(toDraw)) toDraw.forEach(draw);
  else draw(toDraw as Rects.RectPositioned);
};

export const textBlock = (ctx:CanvasRenderingContext2D, lines:readonly string[], opts:DrawingOpts & {readonly anchor:Points.Point, readonly anchorPadding?:number, readonly bounds?: Rects.RectPositioned}) => {
  applyOpts(ctx, opts);
  const anchorPadding = opts.anchorPadding ?? 0;

  const anchor = opts.anchor;
  const bounds = opts.bounds ?? {x:0, y:0, width:1000000, height:1000000};

  // Measure each line
  const blocks = lines.map(l => ctx.measureText(l));

  // Get width and height
  const widths = blocks.map(tm => tm.width);
  const heights = blocks.map(tm => tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent);

  // Find extremes
  const maxWidth = Math.max(...widths);
  const totalHeight = heights.reduce((acc, val) => acc+val, 0);

  // eslint-disable-next-line functional/no-let
  let {x, y} = anchor;

  if (anchor.x + maxWidth > bounds.width) x = bounds.width - (maxWidth + anchorPadding);
  else x -= anchorPadding;
  
  if (x < bounds.x) x = bounds.x + anchorPadding;

  if (anchor.y + totalHeight > bounds.height) y = bounds.height - (totalHeight + anchorPadding);
  else y -= anchorPadding;

  if (y < bounds.y) y = bounds.y + anchorPadding;

  lines.forEach((line, i) => {
    ctx.fillText(line, x, y);
    y += heights[i];
  });
};