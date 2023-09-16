import * as Points from '../geometry/Point.js';
import * as Paths from '../geometry/Path.js';
import * as Lines from '../geometry/Line.js';
import * as Triangles from '../geometry/Triangle.js';
import { throwArrayTest } from '../Guards.js';
import * as Circles from '../geometry/Circle.js';
import * as Arcs from '../geometry/Arc.js';
import * as Beziers from '../geometry/Bezier.js';
import * as Rects from '../geometry/Rect.js';
import * as Ellipses from '../geometry/Ellipse.js';
import * as Colours from '../visual/Colour.js';
import { resolveEl } from '../dom/Util.js';
import { roundUpToMultiple } from '../Util.js';
import type { IStackImmutable } from '../collections/stack/IStackImmutable.js';
import { StackImmutable } from '../collections/stack/StackImmutable.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
const PIPI = Math.PI * 2;

export type CanvasCtxQuery =
  | null
  | string
  | CanvasRenderingContext2D
  | HTMLCanvasElement;

/**
 * Gets a 2d drawing context from canvas element or query, or throws an error
 * @param canvasElCtxOrQuery Canvas element reference or DOM query
 * @returns Drawing context.
 */
export const getContext = (
  canvasElCtxOrQuery: CanvasCtxQuery
): CanvasRenderingContext2D => {
  if (canvasElCtxOrQuery === null) {
    throw Error(
      `canvasElCtxOrQuery null. Must be a 2d drawing context or Canvas element`
    );
  }
  if (canvasElCtxOrQuery === undefined) {
    throw Error(
      `canvasElCtxOrQuery undefined. Must be a 2d drawing context or Canvas element`
    );
  }

  const ctx =
    canvasElCtxOrQuery instanceof CanvasRenderingContext2D
      ? canvasElCtxOrQuery
      : canvasElCtxOrQuery instanceof HTMLCanvasElement
        ? canvasElCtxOrQuery.getContext(`2d`)
        : typeof canvasElCtxOrQuery === `string`
          ? resolveEl<HTMLCanvasElement>(canvasElCtxOrQuery).getContext(`2d`)
          : canvasElCtxOrQuery;
  if (ctx === null) throw new Error(`Could not create 2d context for canvas`);
  return ctx;
};

/**
 * Makes a helper object that wraps together a bunch of drawing functions that all use the same drawing context
 * @param ctxOrCanvasEl Drawing context or canvs element reference
 * @param canvasBounds Bounds of drawing (optional). Used for limiting `textBlock`
 * @returns
 */
export const makeHelper = (
  ctxOrCanvasEl: CanvasCtxQuery,
  canvasBounds?: Rects.Rect
) => {
  // TODO: Is there a way of automagically defining makeHelper to avoid repetition and keep typesafety and JSDoc?
  const ctx = getContext(ctxOrCanvasEl);
  return {
    paths(pathsToDraw: Paths.Path[], opts?: DrawingOpts): void {
      paths(ctx, pathsToDraw, opts);
    },
    line(lineToDraw: Lines.Line | Lines.Line[], opts?: DrawingOpts): void {
      line(ctx, lineToDraw, opts);
    },
    rect(
      rectsToDraw: Rects.RectPositioned | Rects.RectPositioned[],
      opts?: DrawingOpts & { filled?: boolean }
    ): void {
      rect(ctx, rectsToDraw, opts);
    },
    bezier(
      bezierToDraw: Beziers.QuadraticBezier | Beziers.CubicBezier,
      opts?: DrawingOpts
    ): void {
      bezier(ctx, bezierToDraw, opts);
    },
    connectedPoints(
      pointsToDraw: Points.Point[],
      opts?: DrawingOpts & { loop?: boolean }
    ): void {
      connectedPoints(ctx, pointsToDraw, opts);
    },
    pointLabels(pointsToDraw: Points.Point[], opts?: DrawingOpts): void {
      pointLabels(ctx, pointsToDraw, opts);
    },
    dot(
      dotPosition: Points.Point | Points.Point[],
      opts?: DrawingOpts & {
        radius: number;
        outlined?: boolean;
        filled?: boolean;
      }
    ): void {
      dot(ctx, dotPosition, opts);
    },
    circle(
      circlesToDraw: Circles.CirclePositioned | Circles.CirclePositioned[],
      opts: DrawingOpts
    ): void {
      circle(ctx, circlesToDraw, opts);
    },
    arc(
      arcsToDraw: Arcs.ArcPositioned | Arcs.ArcPositioned[],
      opts: DrawingOpts
    ): void {
      arc(ctx, arcsToDraw, opts);
    },
    textBlock(
      lines: string[],
      opts: DrawingOpts & {
        anchor: Points.Point;
        anchorPadding?: number;
        bounds?: Rects.RectPositioned;
      }
    ): void {
      if (opts.bounds === undefined && canvasBounds !== undefined) {
        opts = { ...opts, bounds: { ...canvasBounds, x: 0, y: 0 } };
      }
      textBlock(ctx, lines, opts);
    },
  };
};

/**
 * Drawing options
 */
export type DrawingOpts = {
  /**
   * Stroke style
   */
  readonly strokeStyle?: string;
  /**
   * Fill style
   */
  readonly fillStyle?: string;
  /**
   * If true, diagnostic helpers will be drawn
   */
  readonly debug?: boolean;
};

export type LineOpts = {
  readonly lineWidth?: number;
  readonly lineCap?: CanvasLineCap;
  readonly lineJoin?: CanvasLineJoin;
};

/**
 * Creates a drawing op to apply provided options
 * @param opts Drawing options that apply
 * @returns Stack
 */
const optsOp = (opts: DrawingOpts): StackOp =>
  coloringOp(opts.strokeStyle, opts.fillStyle);

/**
 * Applies drawing options to `ctx`, returning a {@link DrawingStack}
 * @param ctx Context
 * @param opts Options
 * @returns
 */
const applyOpts = (
  ctx: CanvasRenderingContext2D,
  opts: DrawingOpts = {},
  ...additionalOps: readonly StackOp[]
): DrawingStack => {
  if (ctx === undefined) throw Error(`ctx undefined`);

  // Create a drawing stack, pushing an op generated from drawing options
  //eslint-disable-next-line functional/immutable-data
  const stack = drawingStack(ctx).push(optsOp(opts), ...additionalOps);

  // Apply stack to context
  stack.apply();
  return stack;
};

/**
 * Draws one or more arcs.
 * @param ctx
 * @param arcs
 * @param opts
 */
export const arc = (
  ctx: CanvasRenderingContext2D,
  arcs: Arcs.ArcPositioned | ReadonlyArray<Arcs.ArcPositioned>,
  opts: DrawingOpts = {}
) => {
  applyOpts(ctx, opts);

  const draw = (arc: Arcs.ArcPositioned) => {
    ctx.beginPath();
    ctx.arc(arc.x, arc.y, arc.radius, arc.startRadian, arc.endRadian);
    ctx.stroke();
  };

  if (Array.isArray(arcs)) {
    arcs.forEach(draw);
  } else draw(arcs as Arcs.ArcPositioned);
};

/**
 * A drawing stack operation
 */
export type StackOp = (ctx: CanvasRenderingContext2D) => void;

/**
 * A drawing stack (immutable)
 */
export type DrawingStack = {
  /**
   * Push a new drawing op
   * @param op Operation to add
   * @returns stack with added op
   */
  push(...ops: readonly StackOp[]): DrawingStack;
  /**
   * Pops an operatiomn
   * @returns Drawing stack with item popped
   */
  pop(): DrawingStack;
  /**
   * Applies drawing stack
   */
  apply(): DrawingStack;
};

/**
 * Colouring drawing op. Applies `fillStyle` and `strokeStyle`
 * @param strokeStyle
 * @param fillStyle
 * @returns
 */
const coloringOp = (
  strokeStyle: string | CanvasGradient | CanvasPattern | undefined,
  fillStyle: string | CanvasGradient | CanvasPattern | undefined
): StackOp => {
  const apply = (ctx: CanvasRenderingContext2D) => {
    // eslint-disable-next-line functional/immutable-data
    if (fillStyle) ctx.fillStyle = fillStyle;
    // eslint-disable-next-line functional/immutable-data
    if (strokeStyle) ctx.strokeStyle = strokeStyle;
  };
  return apply;
};

const lineOp = (
  lineWidth: number | undefined,
  lineJoin: CanvasLineJoin | undefined,
  lineCap: CanvasLineCap | undefined
): StackOp => {
  const apply = (ctx: CanvasRenderingContext2D) => {
    // eslint-disable-next-line functional/immutable-data
    if (lineWidth) ctx.lineWidth = lineWidth;
    // eslint-disable-next-line functional/immutable-data
    if (lineJoin) ctx.lineJoin = lineJoin;
    // eslint-disable-next-line functional/immutable-data
    if (lineCap) ctx.lineCap = lineCap;
  };
  return apply;
};

/**
 * Creates and returns an immutable drawing stack for a context
 * @param ctx Context
 * @param stk Initial stack operations
 * @returns
 */
export const drawingStack = (
  ctx: CanvasRenderingContext2D,
  stk?: IStackImmutable<StackOp>
): DrawingStack => {
  if (stk === undefined) stk = new StackImmutable<StackOp>();

  const push = (...ops: StackOp[]): DrawingStack => {
    if (stk === undefined) stk = new StackImmutable<StackOp>();
    //eslint-disable-next-line functional/immutable-data
    const s = stk.push(...ops);
    ops.forEach((o) => o(ctx));
    return drawingStack(ctx, s);
  };

  const pop = (): DrawingStack => {
    //eslint-disable-next-line functional/immutable-data
    const s = stk?.pop();
    return drawingStack(ctx, s);
  };

  const apply = (): DrawingStack => {
    if (stk === undefined) return drawingStack(ctx);
    stk.forEach((op) => op(ctx));
    return drawingStack(ctx, stk);
  };

  return { push, pop, apply };
};

export const lineThroughPoints = (
  ctx: CanvasRenderingContext2D,
  points: readonly Points.Point[],
  opts?: DrawingOpts
): void => {
  applyOpts(ctx, opts);

  // https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
  ctx.moveTo(points[ 0 ].x, points[ 0 ].y);

  points.forEach((p, index) => {
    if (index + 2 >= points.length) return;
    const pNext = points[ index + 1 ];
    const mid = {
      x: (p.x + pNext.x) / 2,
      y: (p.y + pNext.y) / 2,
    };
    const cpX1 = (mid.x + p.x) / 2;
    const cpX2 = (mid.x + pNext.x) / 2;
    ctx.quadraticCurveTo(cpX1, pNext.y, mid.x, mid.y);
    ctx.quadraticCurveTo(cpX2, pNext.y, pNext.x, pNext.y);
  });
};

/**
 * Draws one or more circles. Will draw outline/fill depending on
 * whether `strokeStyle` or `fillStyle` params are present in the drawing options.
 *
 * ```js
 * // Draw a circle with radius of 10 at 0,0
 * circle(ctx, {radius:10});
 *
 * // Draw a circle of radius 10 at 100,100
 * circle(ctx, {radius: 10, x: 100, y: 100});
 *
 * // Draw two blue outlined circles
 * circle(ctx, [ {radius: 5}, {radius: 10} ], {strokeStyle:`blue`});
 * ```
 * @param ctx Drawing context
 * @param circlesToDraw Circle(s) to draw
 * @param opts Drawing options
 */
export const circle = (
  ctx: CanvasRenderingContext2D,
  circlesToDraw: Circles.CirclePositioned | readonly Circles.CirclePositioned[],
  opts: DrawingOpts = {}
) => {
  applyOpts(ctx, opts);

  const draw = (c: Circles.CirclePositioned) => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, PIPI);
    if (opts.strokeStyle) ctx.stroke();
    //eslint-disable-next-line functional/immutable-data
    if (opts.fillStyle) ctx.fill();
  };
  if (Array.isArray(circlesToDraw)) circlesToDraw.forEach(draw);
  else draw(circlesToDraw as Circles.CirclePositioned);
};

/**
 * Draws one or more ellipses. Will draw outline/fill depending on
 * whether `strokeStyle` or `fillStyle` params are present in the drawing options.
 * @param ctx
 * @param ellipsesToDraw
 * @param opts
 */
export const ellipse = (
  ctx: CanvasRenderingContext2D,
  ellipsesToDraw:
    | Ellipses.EllipsePositioned
    | readonly Ellipses.EllipsePositioned[],
  opts: DrawingOpts = {}
) => {
  applyOpts(ctx, opts);

  const draw = (e: Ellipses.EllipsePositioned) => {
    ctx.beginPath();
    const rotation = e.rotation ?? 0;
    const startAngle = e.startAngle ?? 0;
    const endAngle = e.endAngle ?? PIPI;
    ctx.ellipse(e.x, e.y, e.radiusX, e.radiusY, rotation, startAngle, endAngle);
    if (opts.strokeStyle) ctx.stroke();
    //eslint-disable-next-line functional/immutable-data
    if (opts.fillStyle) ctx.fill();
  };
  if (Array.isArray(ellipsesToDraw)) ellipsesToDraw.forEach(draw);
  else draw(ellipsesToDraw as Ellipses.EllipsePositioned);
};

/**
 * Draws one or more paths.
 * supported paths are quadratic beziers and lines.
 * @param ctx
 * @param pathsToDraw
 * @param opts
 */
export const paths = (
  ctx: CanvasRenderingContext2D,
  pathsToDraw: readonly Paths.Path[] | Paths.Path,
  opts: { readonly strokeStyle?: string; readonly debug?: boolean } = {}
) => {
  applyOpts(ctx, opts);

  const draw = (path: Paths.Path) => {
    // Call appropriate drawing function depending on the type of path
    if (Beziers.isQuadraticBezier(path)) quadraticBezier(ctx, path, opts);
    else if (Lines.isLine(path)) line(ctx, path, opts);
    else throw new Error(`Unknown path type ${ JSON.stringify(path) }`);
  };

  if (Array.isArray(pathsToDraw)) pathsToDraw.forEach(draw);
  else draw(pathsToDraw as Paths.Path);
};

/**
 * Draws a line between all the given points.
 * If a fillStyle is specified, it will be filled.
 *
 * See also:
 * * {@link line}: Draw one or more lines
 *
 * @param ctx
 * @param pts
 */
export const connectedPoints = (
  ctx: CanvasRenderingContext2D,
  pts: readonly Points.Point[],
  opts: {
    readonly loop?: boolean;
    readonly fillStyle?: string;
    readonly strokeStyle?: string;
  } = {}
) => {
  const shouldLoop = opts.loop ?? false;

  throwArrayTest(pts);
  if (pts.length === 0) return;

  // Throw an error if any point is invalid
  pts.forEach((pt, i) => Points.guard(pt, `Index ${ i }`));

  applyOpts(ctx, opts);

  // Draw points
  ctx.beginPath();
  ctx.moveTo(pts[ 0 ].x, pts[ 0 ].y);
  pts.forEach((pt) => ctx.lineTo(pt.x, pt.y));

  if (shouldLoop) ctx.lineTo(pts[ 0 ].x, pts[ 0 ].y);

  // if (opts.strokeStyle) ctx.strokeStyle = opts.strokeStyle;
  if (
    opts.strokeStyle ||
    (opts.strokeStyle === undefined && opts.fillStyle === undefined)
  ) {
    ctx.stroke();
  }
  if (opts.fillStyle) {
    //eslint-disable-next-line functional/immutable-data
    ctx.fill();
  }
};

/**
 * Draws labels for a set of points
 * @param ctx
 * @param pts Points to draw
 * @param opts
 * @param labels Labels for points
 */
export const pointLabels = (
  ctx: CanvasRenderingContext2D,
  pts: readonly Points.Point[],
  opts: { readonly fillStyle?: string } = {},
  labels?: readonly string[]
) => {
  if (pts.length === 0) return;

  // Throw an error if any point is invalid
  pts.forEach((pt, i) => Points.guard(pt, `Index ${ i }`));

  applyOpts(ctx, opts);

  pts.forEach((pt, i) => {
    const label =
      labels !== undefined && i < labels.length ? labels[ i ] : i.toString();
    ctx.fillText(label.toString(), pt.x, pt.y);
  });
};

/**
 * Returns `point` with the canvas's translation matrix applied
 * @param ctx
 * @param point
 * @returns
 */
export const translatePoint = (
  ctx: CanvasRenderingContext2D,
  point: Points.Point
): Points.Point => {
  const m = ctx.getTransform();
  return {
    x: point.x * m.a + point.y * m.c + m.e,
    y: point.x * m.b + point.y * m.d + m.f,
  };
};

/**
 * Creates a new HTML IMG element with a snapshot of the
 * canvas. Element will need to be inserted into the document.
 *
 * ```
 * const myCanvas = document.getElementById('someCanvas');
 * const el = copyToImg(myCanvas);
 * document.getElementById('images').appendChild(el);
 * ```
 * @param canvasEl
 * @returns
 */
export const copyToImg = (canvasEl: HTMLCanvasElement): HTMLImageElement => {
  const img = document.createElement(`img`);
  //eslint-disable-next-line functional/immutable-data
  img.src = canvasEl.toDataURL(`image/jpeg`);
  return img;
};

/**
 * Draws filled circle(s) at provided point(s)
 * @param ctx
 * @param pos
 * @param opts
 */
export const dot = (
  ctx: CanvasRenderingContext2D,
  pos: Points.Point | readonly Points.Point[],
  opts?: DrawingOpts & {
    readonly radius?: number;
    readonly outlined?: boolean;
    readonly filled?: boolean;
  }
) => {
  if (opts === undefined) opts = {};
  const radius = opts.radius ?? 10;

  applyOpts(ctx, opts);

  ctx.beginPath();

  // x&y for arc is the center of circle
  if (Array.isArray(pos)) {
    pos.forEach((p) => {
      ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
    });
  } else {
    const p = pos as Points.Point;
    ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
  }

  //eslint-disable-next-line functional/immutable-data
  if (opts.filled || !opts.outlined) ctx.fill();
  if (opts.outlined) ctx.stroke();
};

/**
 * Draws a cubic or quadratic bezier
 * @param ctx
 * @param bezierToDraw
 * @param opts
 */
export const bezier = (
  ctx: CanvasRenderingContext2D,
  bezierToDraw: Beziers.QuadraticBezier | Beziers.CubicBezier,
  opts?: DrawingOpts
) => {
  if (Beziers.isQuadraticBezier(bezierToDraw)) {
    quadraticBezier(ctx, bezierToDraw, opts);
  } else if (Beziers.isCubicBezier(bezierToDraw)) {
    cubicBezier(ctx, bezierToDraw, opts);
  }
};

const cubicBezier = (
  ctx: CanvasRenderingContext2D,
  bezierToDraw: Beziers.CubicBezier,
  opts: DrawingOpts = {}
) => {
  // eslint-disable-next-line functional/no-let
  let stack = applyOpts(ctx, opts);

  const { a, b, cubic1, cubic2 } = bezierToDraw;
  const isDebug = opts.debug ?? false;

  if (isDebug) {
    /*
     * const ss = ctx.strokeStyle;
     * ctx.strokeStyle = ss;
     */
  }
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.bezierCurveTo(cubic1.x, cubic1.y, cubic2.x, cubic2.y, b.x, b.y);
  ctx.stroke();

  if (isDebug) {
    //eslint-disable-next-line functional/immutable-data
    stack = stack.push(
      optsOp({
        ...opts,
        strokeStyle: Colours.opacity(opts.strokeStyle ?? `silver`, 0.6),
        fillStyle: Colours.opacity(opts.fillStyle ?? `yellow`, 0.4),
      })
    );

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

    dot(ctx, cubic1, { radius: 3 });
    dot(ctx, cubic2, { radius: 3 });
    dot(ctx, a, { radius: 3 });
    dot(ctx, b, { radius: 3 });
    //eslint-disable-next-line functional/immutable-data
    stack = stack.pop();
    stack.apply();
  }
};

const quadraticBezier = (
  ctx: CanvasRenderingContext2D,
  bezierToDraw: Beziers.QuadraticBezier,
  opts: DrawingOpts = {}
) => {
  const { a, b, quadratic } = bezierToDraw;
  const isDebug = opts.debug ?? false;
  // eslint-disable-next-line functional/no-let
  let stack = applyOpts(ctx, opts);

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.quadraticCurveTo(quadratic.x, quadratic.y, b.x, b.y);
  ctx.stroke();

  if (isDebug) {
    /*
     * const fs = ctx.fillStyle;
     * const ss = ctx.strokeStyle;
     * ctx.fillStyle = opts.strokeStyle ?? `gray`;
     * ctx.strokeStyle = opts.strokeStyle ?? `gray`;
     */
    //eslint-disable-next-line functional/immutable-data
    stack = stack.push(
      optsOp({
        ...opts,
        strokeStyle: Colours.opacity(opts.strokeStyle ?? `silver`, 0.6),
        fillStyle: Colours.opacity(opts.fillStyle ?? `yellow`, 0.4),
      })
    );
    connectedPoints(ctx, [ a, quadratic, b ]);

    ctx.fillText(`a`, a.x + 5, a.y);
    ctx.fillText(`b`, b.x + 5, b.y);
    ctx.fillText(`h`, quadratic.x + 5, quadratic.y);
    dot(ctx, quadratic, { radius: 3 });
    dot(ctx, a, { radius: 3 });
    dot(ctx, b, { radius: 3 });
    /*
     * ctx.fillStyle = fs;
     * ctx.strokeStyle = ss;
     */
    //eslint-disable-next-line functional/immutable-data
    stack = stack.pop();
    stack.apply();
  }
};

/**
 * Draws one or more lines.
 *
 * Each line is drawn independently, ie it's not assumed lines are connected.
 *
 * See also:
 * * {@link connectedPoints}: Draw a series of connected points
 * @param ctx
 * @param toDraw
 * @param opts
 */
export const line = (
  ctx: CanvasRenderingContext2D,
  toDraw: Lines.Line | readonly Lines.Line[],
  opts: LineOpts & DrawingOpts = {}
) => {
  const isDebug = opts.debug ?? false;
  const o = lineOp(opts.lineWidth, opts.lineJoin, opts.lineCap);
  applyOpts(ctx, opts, o);

  const draw = (d: Lines.Line) => {
    const { a, b } = d;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    if (isDebug) {
      ctx.fillText(`a`, a.x, a.y);
      ctx.fillText(`b`, b.x, b.y);
      dot(ctx, a, { radius: 5, strokeStyle: `black` });
      dot(ctx, b, { radius: 5, strokeStyle: `black` });
    }
    ctx.stroke();
  };

  if (Array.isArray(toDraw)) toDraw.forEach(draw);
  else draw(toDraw as Lines.Line);
};

/**
 * Draws one or more triangles
 * @param ctx
 * @param toDraw
 * @param opts
 */
export const triangle = (
  ctx: CanvasRenderingContext2D,
  toDraw: Triangles.Triangle | readonly Triangles.Triangle[],
  opts: DrawingOpts & { readonly filled?: boolean } = {}
) => {
  applyOpts(ctx, opts);

  const draw = (t: Triangles.Triangle) => {
    connectedPoints(ctx, Triangles.corners(t), { ...opts, loop: true });

    if (opts.debug) {
      pointLabels(ctx, Triangles.corners(t), undefined, [ `a`, `b`, `c` ]);
    }
  };

  if (Array.isArray(toDraw)) toDraw.forEach(draw);
  else draw(toDraw as Triangles.Triangle);
};

// export const arrowFromTip = (ctx:CanvasRenderingContext2D, tipPos: Points.Point, tailLength:number, opts:DrawingOpts) => {
//   if (opts.fillStyle) ctx.fillStyle = opts.fillStyle;
//   if (opts.strokeStyle) ctx.strokeStyle = opts.strokeStyle;

//   ctx.save();
//   ctx.translate
//   ctx.restore();
// }

/**
 * Draws one or more rectangles
 * @param ctx
 * @param toDraw
 * @param opts
 */
export const rect = (
  ctx: CanvasRenderingContext2D,
  toDraw: Rects.RectPositioned | readonly Rects.RectPositioned[],
  opts: DrawingOpts & {
    readonly filled?: boolean;
    readonly stroked?: boolean;
  } = {}
) => {
  applyOpts(ctx, opts);

  const draw = (d: Rects.RectPositioned) => {
    if (opts.filled) ctx.fillRect(d.x, d.y, d.width, d.height);
    if (opts.stroked ?? true) ctx.strokeRect(d.x, d.y, d.width, d.height);

    if (opts.debug) {
      pointLabels(ctx, Rects.corners(d), undefined, [ `NW`, `NE`, `SE`, `SW` ]);
    }
  };

  if (Array.isArray(toDraw)) toDraw.forEach(draw);
  else draw(toDraw as Rects.RectPositioned);
};

/**
 * Returns the width of `text`. Rounds number up to nearest multiple if provided. If
 * text is empty or undefined, 0 is returned.
 * @param ctx
 * @param text
 * @param widthMultiple
 * @returns
 */
export const textWidth = (
  ctx: CanvasRenderingContext2D,
  text?: string | null,
  padding = 0,
  widthMultiple?: number
): number => {
  // if (text === undefined || text === null || text.length === 0) return 0;
  // const m = ctx.measureText(text);
  // if (widthMultiple) return roundUpToMultiple(m.width, widthMultiple) + padding;
  // return m.width + padding;
  const rect = textRect(ctx, text, padding, widthMultiple);
  return rect.width;
};

export const textRect = (ctx: CanvasRenderingContext2D,
  text?: string | null,
  padding = 0, widthMultiple?: number): Rects.Rect => {
  if (text === undefined || text === null || text.length === 0) return Rects.empty;
  const m = ctx.measureText(text);

  const width = (widthMultiple) ? roundUpToMultiple(m.width, widthMultiple) + padding : m.width + padding;

  return {
    width: width,
    height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + padding + padding
  }
}

export const textHeight = (
  ctx: CanvasRenderingContext2D,
  text?: string | null,
  padding = 0): number => {
  const rect = textRect(ctx, text, padding);
  return rect.height;
  // if (text === undefined || text === null || text.length === 0) return 0;
  // const m = ctx.measureText(text);
  // return m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + padding + padding;
}


/**
 * Draws a block of text. Each array item is considered a line.
 * @param ctx
 * @param lines
 * @param opts
 */
export const textBlock = (
  ctx: CanvasRenderingContext2D,
  lines: readonly string[],
  opts: DrawingOpts & {
    readonly anchor: Points.Point;
    readonly anchorPadding?: number;
    readonly bounds?: Rects.RectPositioned;
  }
) => {
  applyOpts(ctx, opts);
  const anchorPadding = opts.anchorPadding ?? 0;

  const anchor = opts.anchor;
  const bounds = opts.bounds ?? { x: 0, y: 0, width: 1000000, height: 1000000 };

  // Measure each line
  //eslint-disable-next-line functional/prefer-tacit
  const blocks = lines.map((l) => ctx.measureText(l));

  // Get width and height
  const widths = blocks.map((tm) => tm.width);
  const heights = blocks.map(
    (tm) => tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent
  );

  // Find extremes
  const maxWidth = Math.max(...widths);
  const totalHeight = heights.reduce((acc, val) => acc + val, 0);

  // eslint-disable-next-line functional/no-let
  let { x, y } = anchor;

  if (anchor.x + maxWidth > bounds.width) {
    x = bounds.width - (maxWidth + anchorPadding);
  } else x -= anchorPadding;

  if (x < bounds.x) x = bounds.x + anchorPadding;

  if (anchor.y + totalHeight > bounds.height) {
    y = bounds.height - (totalHeight + anchorPadding);
  } else y -= anchorPadding;

  if (y < bounds.y) y = bounds.y + anchorPadding;

  lines.forEach((line, i) => {
    ctx.fillText(line, x, y);
    y += heights[ i ];
  });
};

export type HorizAlign = `left` | `right` | `center`;
export type VertAlign = `top` | `center` | `bottom`;

/**
 * Draws an aligned text block
 */
export const textBlockAligned = (
  ctx: CanvasRenderingContext2D,
  text: readonly string[] | string,
  opts: DrawingOpts & {
    readonly bounds: Rects.RectPositioned;
    readonly horiz?: HorizAlign;
    readonly vert?: VertAlign;
  }
) => {
  const { bounds } = opts;
  const { horiz = `left`, vert = `top` } = opts;

  //eslint-disable-next-line functional/no-let
  let lines: readonly string[];
  if (typeof text === `string`) lines = [ text ];
  else lines = text;

  applyOpts(ctx, opts);

  ctx.save();
  ctx.translate(bounds.x, bounds.y);
  //eslint-disable-next-line functional/immutable-data
  ctx.textAlign = `left`;
  //eslint-disable-next-line functional/immutable-data
  ctx.textBaseline = `top`;
  const middleX = bounds.width / 2;
  const middleY = bounds.height / 2;

  // Measure each line
  //eslint-disable-next-line functional/prefer-tacit
  const blocks = lines.map((l) => ctx.measureText(l));
  const heights = blocks.map(
    (tm) => tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent
  );
  const totalHeight = heights.reduce((acc, val) => acc + val, 0);

  //eslint-disable-next-line functional/no-let
  let y = 0;
  if (vert === `center`) y = middleY - totalHeight / 2;
  else if (vert === `bottom`) {
    y = bounds.height - totalHeight;
  }

  lines.forEach((line, i) => {
    //eslint-disable-next-line functional/no-let
    let x = 0;
    if (horiz === `center`) x = middleX - blocks[ i ].width / 2;
    else if (horiz === `right`) x = bounds.width - blocks[ i ].width;
    ctx.fillText(lines[ i ], x, y);
    y += heights[ i ];
  });

  ctx.restore();
};
