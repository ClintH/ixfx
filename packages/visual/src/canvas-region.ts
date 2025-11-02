import { scalerTwoWay, clamp, type NumberScaler } from "@ixfx/numbers";
import { resolveEl, resolveElementTry } from "@ixfx/dom";
import { resultErrorToString } from "@ixfx/guards";
import type { Rect, RectPositioned } from "@ixfx/geometry/rect";
import type { Point } from "@ixfx/geometry/point";
import { Points, Rects } from "@ixfx/geometry";
import type { CirclePositioned } from "@ixfx/geometry/circle";
import { piPi } from "./pi-pi.js";

export type CanvasRegionSpecRelativePositioned = {
  relativePositioned: RectPositioned
  scale?: `independent`
}

export type CanvasRegionSpecAbsolutePositioned = {
  absPositioned: RectPositioned
}

export type CanvasRegionSpecRelativeSized = {
  relativeSize: Rect
  scale?: `independent`
  /**
   * Cardinal directions, or 'center' (default)
   */
  position: `center` | `n` | `s`
}

export type CanvasRegionSpecMatched = {
  match: HTMLElement | string
}

export type CanvasRegionSpec = { marginPx?: number } & (CanvasRegionSpecAbsolutePositioned | CanvasRegionSpecRelativePositioned | CanvasRegionSpecRelativeSized | CanvasRegionSpecMatched);

/**
 * Manges the drawing for a region of a canvas
 */
export class CanvasSource {
  #canvasEl: HTMLCanvasElement;
  #ctx: undefined | CanvasRenderingContext2D;
  #sizeBasis: `min` | `max`;
  #sizeScaler: { abs: NumberScaler, rel: NumberScaler };
  #logicalSize: Rect;
  #pixelScaling: number;

  #regions: CanvasRegion[] = [];

  constructor(canvasElementOrQuery: HTMLCanvasElement | string, sizeBasis: `min` | `max` = `min`) {
    this.#canvasEl = resolveEl<HTMLCanvasElement>(canvasElementOrQuery);
    this.#sizeBasis = sizeBasis;
    this.#pixelScaling = window.devicePixelRatio || 1;
    this.#sizeScaler = this.#createSizeScaler();
    this.#logicalSize = this.setLogicalSize({ width: this.#canvasEl.width, height: this.#canvasEl.height });
  }


  /**
   * Set logical size for region
   * @param size
   * @returns 
   */
  setLogicalSize(size: Rect) {
    this.#logicalSize = size;
    const el = this.#canvasEl;
    el.width = (size.width * this.#pixelScaling);
    el.height = (size.height * this.#pixelScaling);

    el.style.width = `${ (size.width).toString() }px`;
    el.style.height = `${ (size.height).toString() }px`;
    this.#sizeScaler = this.#createSizeScaler();
    this.invalidateContext();
    return size;
  }


  #createSizeScaler() {
    let inMax = 1;
    switch (this.#sizeBasis) {
      case `min`:
        inMax = Math.min(this.#canvasEl.width, this.#canvasEl.height);
        break;
      case `max`:
        inMax = Math.max(this.#canvasEl.width, this.#canvasEl.height);
        break;
    }
    const s = scalerTwoWay(0, inMax, 0, 1);
    return {
      abs: s.in,
      rel: s.out
    }
  }

  /**
   * Causes drawing context to be re-created
   */
  invalidateContext() {
    this.#ctx = undefined;
  }

  #add(region: CanvasRegion) {
    if (!region) throw new Error(`Param 'region' is undefined/null`);
    if (this.#regions.includes(region)) throw new Error(`Region already exists`);
    this.#regions.push(region);
    return region;
  }


  /**
   * Convert relative to absolute
   * @param pt 
   * @param kind 
   * @returns 
   */
  toAbsPoint(pt: Point, kind: `independent` = `independent`) {
    let { x, y } = pt;
    switch (kind) {
      case `independent`:
        x *= this.width;
        y *= this.height;

    }
    return { x, y };
  }

  /**
   * Gets the offset x,y
   */
  get offset() {
    const b = this.#canvasEl.getBoundingClientRect();
    return { x: b.left, y: b.top };
  }

  /**
   * Converts an absolute point to relative
   * @param pt 
   * @param source 
   * @param kind 
   * @param clamped 
   * @returns 
   */
  toRelPoint(pt: Point, source: `screen` | `source`, kind: `independent` | `skip` = `independent`, clamped = true) {
    let { x, y } = pt;
    if (source === `screen`) {
      const b = this.#canvasEl.getBoundingClientRect();
      x -= b.x;
      y -= b.y;
    }
    switch (kind) {
      case `independent`:
        x /= this.width;
        y /= this.height;
        break;
      case `skip`:
        break;
    }
    if (clamped) {
      x = clamp(x);
      y = clamp(y);
    }
    return { x, y };
  }

  /**
   * Converts a rectangle to absolute coordinates
   * @param rect 
   * @param kind 
   * @returns 
   */
  toAbsRect(rect: Rect | RectPositioned, kind: `independent` = `independent`) {
    let { width, height } = rect;
    switch (kind) {
      case `independent`:
        width *= this.width;
        height *= this.height;
        if (Rects.isRectPositioned(rect)) {
          return {
            ...this.toAbsPoint(rect),
            width,
            height
          }
        }
    }
    return { width, height }
  }


  /**
   * Creates a region
   * 
   * Absolute positioned. Uses source coordinates which don't change
   * ```js
   * source.createRegion({ 
   *  absPositioned: { x: 0, y: 0, width: 100, height: 100} 
   * });
   * ```
   * 
   * Relative positioned. Uses coordiantes relative to source dimensions.
   * Updated if source changes.
   * ```js
   * source.createRegion({
   *  relativePositioned: { x: 0, y:0, width: 1, height: 0.5 },
   *  scale: `independent`
   * });
   * ```
   * 
   * Relative sized. Uses size relative to source dimension. By default centers.
   * ```js
   * source.createRegion({
   *  relativeSize: { width: 0.5, height: 0.5 }
   *  position: `center`
   * })
   * ```
   * @param spec 
   * @returns 
   */
  createRegion(spec: CanvasRegionSpec) {
    const marginPx = spec.marginPx ?? 0;
    const marginPx2 = marginPx * 2;
    if (`absPositioned` in spec) {
      const rect = Rects.subtractSize(spec.absPositioned, marginPx, marginPx);
      return this.#add(new CanvasRegion(this, () => rect))
    }

    if (`relativePositioned` in spec) {
      let compute: ((source: CanvasSource) => RectPositioned);
      const rect = spec.relativePositioned;
      switch (spec.scale) {
        case `independent`:
          compute = (source: CanvasSource): RectPositioned => ({
            x: (rect.x * source.width) + marginPx,
            y: (rect.y * source.height) + marginPx,
            width: (rect.width * source.width) - marginPx2,
            height: (rect.height * source.height) - marginPx2
          });
          break;
        default:
          throw new Error(`Param 'kind' unknown (${ spec.scale })`);
      }
      return this.#add(new CanvasRegion(this, compute));
    }

    if (`relativeSize` in spec) {
      let compute: ((source: CanvasSource) => RectPositioned);
      const rect = spec.relativeSize;
      const position = spec.position;

      switch (spec.scale) {
        case `independent`:
          compute = (source: CanvasSource): RectPositioned => {
            const width = (rect.width * source.width) - marginPx2;
            const height = (rect.height * source.height) - marginPx2;
            let x = source.width / 2 - width / 2;
            let y = source.height / 2 - height / 2;
            switch (position) {
              case `n`:
                y = 0;
                break;
              case `s`:
                y = source.height - height;
                break;
              default:
              /** no-op, */
            }
            x += marginPx;
            y += marginPx;
            return { width, height, x, y }
          }
          break;
        default:
          throw new Error(`Param 'kind' unknown (${ spec.scale })`);
      }
      return this.#add(new CanvasRegion(this, compute));
    }

    if (`match` in spec) {
      const result = resolveElementTry(spec.match);
      if (!result.success) {
        throw new Error(`Could not resolve match element. ${ resultErrorToString(result) }`);
      }
      const compute = (_source: CanvasSource): RectPositioned => {
        const bounds = result.value.getBoundingClientRect();
        return {
          x: bounds.x + marginPx,
          y: bounds.y + marginPx,
          width: bounds.width - marginPx2,
          height: bounds.height - marginPx2
        }
      }
      return this.#add(new CanvasRegion(this, compute));
    }
    throw new Error(`Spec doesn't seem valid`);
  }

  /**
   * Clears the region of the canvas
   */
  clear() {
    const c = this.context;
    c.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Gets - or creates - the drawing context
   */
  get context() {
    if (this.#ctx) return this.#ctx;
    const c = this.#canvasEl.getContext(`2d`);
    if (!c) throw new Error(`Could not create 2d context`);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.scale(this.#pixelScaling, this.#pixelScaling);

    this.#ctx = c;

    for (const r of this.#regions) {
      r.recomputeRegion();
    }
    return this.#ctx;
  }

  /**
   * Gets a scaler for size
   */
  get sizeScaler() {
    return this.#sizeScaler;
  }

  /**
   * Gets the logical width
   */
  get width() {
    return this.#logicalSize.width;
  }

  /**
   * Gets the logical height
   */
  get height() {
    return this.#logicalSize.height;
  }

  get element() {
    return this.#canvasEl;
  }
}

/**
 * Draws on a canvas, constrained to a specific region
 */
export class CanvasRegion {
  source: CanvasSource;
  #regionCompute: (parent: CanvasSource) => RectPositioned;
  #r: RectPositioned;

  /**
   * Creates, using coordinate in canvas coordinates
   */
  constructor(source: CanvasSource, regionCompute: (parent: CanvasSource) => RectPositioned) {
    this.source = source;
    this.#regionCompute = regionCompute;
    this.#r = regionCompute(source);
  }

  /**
   * Calls the original `regionCompute` function passed in to the constructor
   * to recompute the absolute region
   */
  recomputeRegion() {
    this.#r = this.#regionCompute(this.source);
  }

  /**
   * Converts a region-relative point (0..1) to an absolute
   * point, which uses region-relative coordinates.
   * 
   * Eg if the region had an x,y of 100,100, `toAbsRegion({x:0,y:0})`
   * will return 0,0.
   *
   * @param regionRel 
   * @param scaleBy 
   * @returns 
   */
  toAbsRegion(regionRel: Point, scaleBy: `both` = `both`) {
    switch (scaleBy) {
      case `both`:
        return {
          x: regionRel.x * this.#r.width,
          y: regionRel.y * this.#r.height
        }
        break;
    }
  }

  /**
   * Returns a copy of `p` offset by the region's x & y
   * @param p 
   * @returns 
   */
  applyRegionOffset(p: Point) {
    return {
      x: p.x + this.#r.x,
      y: p.y + this.#r.y
    }
  }

  /**
   * Draws a line from a series of points.
   * Assumes region-relative, % coordinates (ie 0..1 scale)
   * @param relativePoints Points to connect, in region-relative coordinates
   * @param strokeStyle Stroke style
   * @param lineWidth Line with
   */
  drawConnectedPointsRelative(relativePoints: Point[], strokeStyle: string, lineWidth = 1) {
    const points = relativePoints.map(p => this.toAbsRegion(p));
    this.drawConnectedPoints(points, strokeStyle, lineWidth);
  }

  /**
   * Draws connected points in absolute coordinates,
   * however with 0,0 being the top-left of the region.
   * 
   * Thus, this will apply the region offset before drawing.
   * @param points Points to draw
   * @param strokeStyle Stroke style
   * @param lineWidth Line width
   */
  drawConnectedPoints(points: Point[], strokeStyle: string, lineWidth = 1) {
    const c = this.context;
    c.save();
    c.translate(this.#r.x, this.#r.y);
    c.beginPath();
    c.strokeStyle = strokeStyle;
    c.lineWidth = lineWidth;
    for (let index = 0; index < points.length; index++) {
      if (index === 0) {
        c.moveTo(points[ index ].x, points[ index ].y);
      } else {
        c.lineTo(points[ index ].x, points[ index ].y);
      }
    }
    c.stroke();
    c.restore();
  }

  /**
   * Fills text at a relative position
   * @param text 
   * @param relPos Relative, meaning 0.5,0.5 is the middle of the region
   * @param fillStyle 
   * @param baseline 
   * @param align 
   */
  fillTextRelative(text: string, relPos: Point, fillStyle = `black`, font: string, baseline: CanvasTextBaseline = `alphabetic`, align: CanvasTextAlign = `start`) {
    const point = this.toAbsRegion(relPos);
    this.fillTextRelative(text, point, fillStyle, font, baseline, align);
  }

  /**
   * Fills text at a region-relative position
   * @param text 
   * @param point Region relative, meaning 0,0 is top-left of region
   * @param fillStyle 
   * @param baseline 
   * @param align 
   */
  fillText(text: string, point: Point, fillStyle = `black`, font: string, baseline: CanvasTextBaseline = `alphabetic`, align: CanvasTextAlign = `start`) {
    const c = this.context;
    c.save();
    c.translate(this.#r.x, this.#r.y);
    if (font.length > 0) {
      c.font = font;
    }
    c.textBaseline = baseline;
    c.textAlign = align;
    c.fillStyle = fillStyle;
    c.fillText(text, point.x, point.y);
    c.restore();
  }

  drawCircles(relativeCircles: CirclePositioned[], fillStyle: string, strokeStyle = ``, lineWidth = 1) {
    const circles = relativeCircles.map(c => {
      return {
        ...this.toAbsRegion(c),
        radius: this.source.sizeScaler.abs(c.radius)
      }
    });

    const c = this.context;
    c.save();
    c.translate(this.#r.x, this.#r.y);
    c.fillStyle = fillStyle;
    c.strokeStyle = strokeStyle;
    c.lineWidth = lineWidth;

    for (const circle of circles) {
      c.beginPath();
      c.arc(circle.x, circle.y, circle.radius, 0, piPi);
      c.closePath();
      if (fillStyle.length > 0) {
        c.fill();
      }
      if (strokeStyle.length > 0) {
        c.stroke();
      }
    }
    c.restore();
  }

  /**
   * Clears the region
   */
  clear() {
    const c = this.context;
    c.clearRect(this.#r.x, this.#r.y, this.#r.width, this.#r.height);
  }

  /**
   * Fills the region
   * @param fillStyle
   */
  fill(fillStyle = `white`) {
    const c = this.context;
    c.fillStyle = fillStyle;
    c.fillRect(this.#r.x, this.#r.y, this.#r.width, this.#r.height);
  }

  /**
   * For debugging, draws an outline of the bounds
   * @param strokeStyle 
   * @param lineWidth 
   */
  drawBounds(strokeStyle: string, lineWidth = 1) {
    this.drawConnectedPointsRelative([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0, y: 0 }
    ], strokeStyle, lineWidth);

    this.drawConnectedPointsRelative([
      { x: 0, y: 1 },
      { x: 1, y: 0 }
    ], strokeStyle, lineWidth);
    this.drawConnectedPointsRelative([
      { x: 0, y: 0 },
      { x: 1, y: 1 }
    ], strokeStyle, lineWidth);
  }

  /**
   * Converts a  point to a region-relative one.
   * @param pt 
   * @param kind 
   * @returns 
   */
  toRelPoint(pt: Point, source: `screen` | `source` = `screen`, kind: `independent` = `independent`, clamped = true) {
    pt = this.source.toRelPoint(pt, source, `skip`, false);
    let { x, y } = pt;
    x -= this.x;
    y -= this.y;

    switch (kind) {
      case `independent`:
        x /= this.width;
        y /= this.height;
    }
    if (clamped) {
      x = clamp(x);
      y = clamp(y);
    }
    return { x, y };
  }

  /**
   * Converts absolute to region point
   * @param pt 
   * @param source 
   * @param clamped 
   * @returns 
   */
  absToRegionPoint(pt: Point, source: `screen`, clamped: boolean) {
    if (source === `screen`) {
      pt = Points.subtract(pt, this.source.offset);
    }

    let { x, y } = pt;
    x -= this.x;
    y -= this.y;

    if (clamped) {
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x > this.width + this.x) x = this.x + this.width;
      if (y > this.height + this.y) y = this.y + this.height;
    }
    return { x, y };
  }

  /**
   * Get center of region
   */
  get center() {
    return Rects.center(this.#r);
  }

  /**
   * Gets the drawing context
   */
  get context() {
    return this.source.context;
  }

  /**
   * SEts the region
   */
  set region(value: RectPositioned) {
    this.#r = value;
  }

  /**
   * Gets the region
   */
  get region() {
    return this.#r;
  }

  /**
   * Gets the width
   */
  get width() {
    return this.#r.width;
  }

  /**
   * Gets the height
   */
  get height() {
    return this.#r.height;
  }

  /**
   * Gets the x offset
   */
  get x() {
    return this.#r.x;
  }

  /**
   * Gets they y offset
   */
  get y() {
    return this.#r.y;
  }

  /**
   * Gets the width/height, whichever is smaller
   */
  get dimensionMin() {
    return Math.min(this.#r.width, this.#r.height);
  }
}
