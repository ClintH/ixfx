import { arrayTest, resultThrow } from '@ixfx/guards';
import { Colour } from '@ixfx/visual';
import { resolveEl } from '@ixfx/dom';
//import type { IStackImmutable } from '@ixfx/collections';
import { StackImmutable, type IStackImmutable } from '@ixfx/collections/stack';
import { Beziers, Lines, Points, Rects, Triangles, type Arcs, type Circles, type Ellipses, type Paths } from '@ixfx/geometry';
import { quantiseEvery } from '@ixfx/numbers';

// import type { Point } from '../geometry/point/PointType.js';
// import type { Line } from '../geometry/line/LineType.js';
// import type { CirclePositioned } from '../geometry/circle/CircleType.js';
// import type { Rect, RectPositioned } from '../geometry/rect/index.js';
// import type { Path } from '../geometry/path/PathType.js';
// import type { Triangle } from '../geometry/triangle/TriangleType.js';

// import { Empty as RectsEmpty } from '../geometry/rect/Empty.js';
// import { corners as RectsCorners } from '../geometry/rect/Corners.js';
// import { isLine } from '../geometry/line/Guard.js';
// import { quantiseEvery } from '../numbers/Quantise.js';

const PIPI = Math.PI * 2;

export type CanvasContextQuery =
  | null
  | string
  | CanvasRenderingContext2D
  | HTMLCanvasElement;

/**
 * Gets a 2d drawing context from canvas element or query, or throws an error
 * @param canvasElementContextOrQuery Canvas element reference or DOM query
 * @returns Drawing context.
 */
export const getContext = (
  canvasElementContextOrQuery: CanvasContextQuery
): CanvasRenderingContext2D => {
  if (canvasElementContextOrQuery === null) {
    throw new Error(
      `canvasElCtxOrQuery null. Must be a 2d drawing context or Canvas element`
    );
  }
  if (canvasElementContextOrQuery === undefined) {
    throw new Error(
      `canvasElCtxOrQuery undefined. Must be a 2d drawing context or Canvas element`
    );
  }

  const ctx =
    canvasElementContextOrQuery instanceof CanvasRenderingContext2D
      ? canvasElementContextOrQuery
      : canvasElementContextOrQuery instanceof HTMLCanvasElement
        ? canvasElementContextOrQuery.getContext(`2d`)

        : typeof canvasElementContextOrQuery === `string`
          ? resolveEl<HTMLCanvasElement>(canvasElementContextOrQuery).getContext(`2d`)
          : canvasElementContextOrQuery;
  if (ctx === null) throw new Error(`Could not create 2d context for canvas`);
  return ctx;
};

export type DrawingHelper = ReturnType<typeof makeHelper>
/**
 * Makes a helper object that wraps together a bunch of drawing functions that all use the same drawing context
 * @param ctxOrCanvasEl Drawing context or canvs element reference
 * @param canvasBounds Bounds of drawing (optional). Used for limiting `textBlock`
 * @returns
 */
export const makeHelper = (
  ctxOrCanvasEl: CanvasContextQuery,
  canvasBounds?: Rects.Rect
) => {
  const ctx = getContext(ctxOrCanvasEl);
  return {
    ctx,
    paths(pathsToDraw: Paths.Path[] | readonly Paths.Path[], opts?: DrawingOpts): void {
      paths(ctx, pathsToDraw, opts);
    },
    line(lineToDraw: Lines.Line | Lines.Line[], opts?: DrawingOpts): void {
      line(ctx, lineToDraw, opts);
    },
    rect(
      rectsToDraw: Rects.Rect | Rects.Rect[] | Rects.RectPositioned | Rects.RectPositioned[],
      opts?: RectOpts
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
      opts?: DrawingOpts & Partial<ConnectedPointsOptions>
    ): void {
      connectedPoints(ctx, pointsToDraw, opts);
    },
    pointLabels(pointsToDraw: Points.Point[], opts?: DrawingOpts): void {
      pointLabels(ctx, pointsToDraw, opts);
    },
    dot(
      dotPosition: Points.Point | Points.Point[],
      opts?: DotOpts
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
  if (ctx === undefined) throw new Error(`ctx undefined`);

  // Create a drawing stack, pushing an op generated from drawing options
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
  arcs: Arcs.ArcPositioned | readonly Arcs.ArcPositioned[],
  opts: DrawingOpts = {}
) => {
  applyOpts(ctx, opts);

  const draw = (arc: Arcs.ArcPositioned) => {
    ctx.beginPath();
    ctx.arc(arc.x, arc.y, arc.radius, arc.startRadian, arc.endRadian);
    ctx.stroke();
  };

  const arcsArray: Arcs.ArcPositioned[] = Array.isArray(arcs) ? arcs : [ arcs ];
  for (const arc of arcsArray) {
    draw(arc);
  }

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
   * @param ops Operation to add
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
    if (fillStyle) ctx.fillStyle = fillStyle;
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
    if (lineWidth) ctx.lineWidth = lineWidth;
    if (lineJoin) ctx.lineJoin = lineJoin;
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
  stk ??= new StackImmutable<StackOp>();

  const push = (...ops: StackOp[]): DrawingStack => {
    stk ??= new StackImmutable<StackOp>();
    const s = stk.push(...ops);
    for (const o of ops) o(ctx);
    return drawingStack(ctx, s);
  };

  const pop = (): DrawingStack => {
    const s = stk?.pop();
    return drawingStack(ctx, s);
  };

  const apply = (): DrawingStack => {
    if (stk === undefined) return drawingStack(ctx);
    for (const op of stk.data) op(ctx);
    return drawingStack(ctx, stk);
  };

  return { push, pop, apply };
};

/**
 * Draws a curved line through a set of points
 * @param ctx 
 * @param points 
 * @param opts 
 */
export const lineThroughPoints = (
  ctx: CanvasRenderingContext2D,
  points: readonly Points.Point[],
  opts?: DrawingOpts
): void => {
  applyOpts(ctx, opts);

  // https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
  ctx.moveTo(points[ 0 ].x, points[ 0 ].y);

  for (const [ index, p ] of points.entries()) {
    if (index + 2 >= points.length) continue;
    const pNext = points[ index + 1 ];
    const mid = {
      x: (p.x + pNext.x) / 2,
      y: (p.y + pNext.y) / 2,
    };
    const cpX1 = (mid.x + p.x) / 2;
    const cpX2 = (mid.x + pNext.x) / 2;
    ctx.quadraticCurveTo(cpX1, pNext.y, mid.x, mid.y);
    ctx.quadraticCurveTo(cpX2, pNext.y, pNext.x, pNext.y);
  }
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
    if (opts.fillStyle) ctx.fill();
  };

  if (Array.isArray(circlesToDraw)) {
    for (const c of circlesToDraw) draw(c as Circles.CirclePositioned);
  } else {
    draw(circlesToDraw as Circles.CirclePositioned);
  }
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

  const draw = (ellipse: Ellipses.EllipsePositioned) => {
    ctx.beginPath();
    const rotation = ellipse.rotation ?? 0;
    const startAngle = ellipse.startAngle ?? 0;
    const endAngle = ellipse.endAngle ?? PIPI;
    ctx.ellipse(ellipse.x, ellipse.y, ellipse.radiusX, ellipse.radiusY, rotation, startAngle, endAngle);
    if (opts.strokeStyle) ctx.stroke();
    if (opts.fillStyle) ctx.fill();
  };

  const ellipsesArray = Array.isArray(ellipsesToDraw) ? ellipsesToDraw : [ ellipsesToDraw ];
  for (const ellipse of ellipsesArray) {
    draw(ellipse);
  }
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

  if (Array.isArray(pathsToDraw)) {
    for (const p of pathsToDraw) draw(p);
  } else {
    draw(pathsToDraw as Paths.Path);
  }
};

export type ConnectedPointsOptions = {
  readonly lineWidth: number
  readonly loop: boolean
  readonly fillStyle: string
  readonly strokeStyle: string
}
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
  opts: Partial<ConnectedPointsOptions> = {}
) => {
  const shouldLoop = opts.loop ?? false;

  resultThrow(arrayTest(pts, `pts`));

  if (pts.length === 0) return;

  // Throw an error if any point is invalid
  for (const [ index, pt ] of pts.entries()) Points.guard(pt, `Index ${ index }`);

  applyOpts(ctx, opts);

  // Draw points
  if (opts.lineWidth) ctx.lineWidth = opts.lineWidth;
  ctx.beginPath();
  ctx.moveTo(pts[ 0 ].x, pts[ 0 ].y);
  for (const pt of pts) ctx.lineTo(pt.x, pt.y);

  if (shouldLoop) ctx.lineTo(pts[ 0 ].x, pts[ 0 ].y);

  // if (opts.strokeStyle) ctx.strokeStyle = opts.strokeStyle;
  if (
    opts.strokeStyle ||
    (opts.strokeStyle === undefined && opts.fillStyle === undefined)
  ) {
    ctx.stroke();
  }
  if (opts.fillStyle) {
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
  for (const [ index, pt ] of pts.entries()) Points.guard(pt, `Index ${ index }`);

  applyOpts(ctx, opts);

  for (const [ index, pt ] of pts.entries()) {
    const label =
      labels !== undefined && index < labels.length ? labels[ index ] : index.toString();
    ctx.fillText(label.toString(), pt.x, pt.y);
  }
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
  img.src = canvasEl.toDataURL(`image/jpeg`);
  return img;
};

export type DotOpts = DrawingOpts & {
  readonly radius?: number;
  readonly stroke?: boolean;
  readonly filled?: boolean;
  readonly strokeWidth?: number;
}

/**
 * Draws filled circle(s) at provided point(s)
 * @param ctx
 * @param pos
 * @param opts
 */
export const dot = (
  ctx: CanvasRenderingContext2D,
  pos: Points.Point | (Points.Point | Circles.CirclePositioned)[] | Circles.CirclePositioned,
  opts?: DotOpts
) => {
  opts ??= {};
  const radius = opts.radius ?? 10;
  const positions = Array.isArray(pos) ? pos : [ pos ];
  const stroke = opts.stroke ? opts.stroke : opts.strokeStyle !== undefined;
  let filled = opts.filled ? opts.filled : opts.fillStyle !== undefined;
  if (!stroke && !filled) filled = true;

  applyOpts(ctx, opts);

  for (const pos of positions) {
    ctx.beginPath();
    if (`radius` in pos) {
      ctx.arc(pos.x, pos.y, pos.radius, 0, 2 * Math.PI);
    } else {
      ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    }
    if (filled) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  }

  // const makePath = () => {
  //   ctx.beginPath();

  //   // x&y for arc is the center of circle
  //   if (Array.isArray(pos)) {
  //     for (const p of pos) {
  //       ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
  //     }
  //   } else {
  //     const p = pos as Point;
  //     ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
  //   }
  // }
  // makePath();
  // if (opts.filled || !opts.stroke) {
  //   ctx.fill();
  // }
  // if (opts.stroke) {
  //   if (opts.strokeWidth) ctx.lineWidth = opts.strokeWidth;
  //   //makePath();
  //   ctx.stroke();
  // }
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
    stack = stack.push(
      optsOp({
        ...opts,
        strokeStyle: Colour.multiplyOpacity(opts.strokeStyle ?? `silver`, 0.6),
        fillStyle: Colour.multiplyOpacity(opts.fillStyle ?? `yellow`, 0.4),
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
    stack = stack.push(
      optsOp({
        ...opts,
        strokeStyle: Colour.multiplyOpacity(opts.strokeStyle ?? `silver`, 0.6),
        fillStyle: Colour.multiplyOpacity(opts.fillStyle ?? `yellow`, 0.4),
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

  if (Array.isArray(toDraw)) {
    for (const t of toDraw) draw(t as Lines.Line);
  } else {
    draw(toDraw as Lines.Line);
  }
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

  if (Array.isArray(toDraw)) {
    for (const t of toDraw) {
      draw(t);
    }
  } else {
    draw(toDraw as Triangles.Triangle);
  }
};

// export const arrowFromTip = (ctx:CanvasRenderingContext2D, tipPos: Point, tailLength:number, opts:DrawingOpts) => {
//   if (opts.fillStyle) ctx.fillStyle = opts.fillStyle;
//   if (opts.strokeStyle) ctx.strokeStyle = opts.strokeStyle;

//   ctx.save();
//   ctx.translate
//   ctx.restore();
// }


export type RectOpts = DrawingOpts & Readonly<Partial<{
  stroke: boolean
  filled: boolean
  strokeWidth: number
  /**
   * If true, diagonals are drawn
   */
  crossed: boolean
}>>

/**
 * Draws one or more rectangles.
 * 
 * @param ctx
 * @param toDraw
 * @param opts
 */
export const rect = (
  ctx: CanvasRenderingContext2D,
  toDraw: Rects.Rect | Rects.Rect[] | Rects.RectPositioned | Rects.RectPositioned[],
  opts: RectOpts = {}
) => {
  applyOpts(ctx, opts);

  const filled = opts.filled ?? (opts.fillStyle === undefined ? false : true);
  const stroke = opts.stroke ?? (opts.strokeStyle === undefined ? false : true);
  const draw = (d: Rects.RectPositioned | Rects.Rect) => {
    const x = `x` in d ? d.x : 0;
    const y = `y` in d ? d.y : 0;
    if (filled) ctx.fillRect(x, y, d.width, d.height);
    if (stroke) {
      if (opts.strokeWidth) ctx.lineWidth = opts.strokeWidth;
      //if (opts.strokeStyle) ctx.strokeStyle = opts.strokeStyle;
      ctx.strokeRect(x, y, d.width, d.height);
    }
    if (opts.crossed) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(d.width, d.height);
      ctx.stroke();
      ctx.moveTo(0, d.height);
      ctx.lineTo(d.width, 0);
      ctx.stroke();
    }
    if (opts.debug) {
      pointLabels(ctx, Rects.corners(d), undefined, [ `NW`, `NE`, `SE`, `SW` ]);
    }
  };

  if (Array.isArray(toDraw)) {
    for (const t of toDraw) {
      draw(t);
    }
  } else {
    draw(toDraw as Rects.RectPositioned);
  }
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
  const rect = textRect(ctx, text, padding, widthMultiple);
  return rect.width;
};

export const textRect = (ctx: CanvasRenderingContext2D,
  text?: string | null,
  padding = 0, widthMultiple?: number): Rects.Rect => {
  if (text === undefined || text === null || text.length === 0) return Rects.Empty;
  const m = ctx.measureText(text);

  const width = (widthMultiple) ? quantiseEvery(m.width, widthMultiple) + padding : m.width + padding;

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
    readonly align?: `top` | `center`
    readonly anchorPadding?: number;
    readonly bounds?: Rects.RectPositioned;
  }
) => {
  applyOpts(ctx, opts);
  const anchorPadding = opts.anchorPadding ?? 0;
  const align = opts.align ?? `top`;
  const anchor = opts.anchor;
  const bounds = opts.bounds ?? { x: 0, y: 0, width: 1_000_000, height: 1_000_000 };

  // Measure each line
  const blocks = lines.map((l) => ctx.measureText(l));

  // Get width and height
  const widths = blocks.map((tm) => tm.width);
  const heights = blocks.map(
    (tm) => tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent + 3
  );

  // Find extremes
  const maxWidth = Math.max(...widths);
  const totalHeight = heights.reduce((accumulator, value) => accumulator + value, 0);

  let { x, y } = anchor;

  if (anchor.x + maxWidth > bounds.width) {
    x = bounds.width - (maxWidth + anchorPadding);
  } else x -= anchorPadding;

  if (x < bounds.x) x = bounds.x + anchorPadding;

  if (anchor.y + totalHeight > bounds.height) {
    y = bounds.height - (totalHeight + anchorPadding);
  } else y -= anchorPadding;

  if (y < bounds.y) y = bounds.y + anchorPadding;

  if (align === `top`) {
    ctx.textBaseline = `top`;
  } else {
    ctx.textBaseline = `middle`;
  }
  for (const [ index, line ] of lines.entries()) {
    ctx.fillText(line, x, y);
    y += heights[ index ];
  }
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

  const lines = typeof text === `string` ? [ text ] : text;

  applyOpts(ctx, opts);

  ctx.save();
  ctx.translate(bounds.x, bounds.y);
  ctx.textAlign = `left`;
  ctx.textBaseline = `top`;
  const middleX = bounds.width / 2;
  const middleY = bounds.height / 2;

  // Measure each line
  const blocks = lines.map((l) => ctx.measureText(l));
  const heights = blocks.map(
    (tm) => tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent
  );
  const totalHeight = heights.reduce((accumulator, value) => accumulator + value, 0);

  let y = 0;
  if (vert === `center`) y = middleY - totalHeight / 2;
  else if (vert === `bottom`) {
    y = bounds.height - totalHeight;
  }

  for (const [ index, line ] of lines.entries()) {
    let x = 0;
    if (horiz === `center`) x = middleX - blocks[ index ].width / 2;
    else if (horiz === `right`) x = bounds.width - blocks[ index ].width;
    ctx.fillText(line, x, y);
    y += heights[ index ];
  }

  ctx.restore();
};
