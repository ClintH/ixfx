import { piPi } from "src/data/index.js";
import { Points, Rects } from "src/geometry/index.js";
import type { CirclePositioned, Point, Rect, RectPositioned } from "src/geometry/Types.js";
import { scalerTwoWay } from "src/numbers/Scale.js";
import { resolveEl } from "../dom/ResolveEl.js";
import { clamp } from "src/numbers/Clamp.js";

export class CanvasSource {
  #canvasEl: HTMLCanvasElement;
  #ctx: undefined | CanvasRenderingContext2D;
  #sizeBasis: `min` | `max`;
  #sizeScaler;
  #logicalSize: Rect;
  #pixelScaling;

  #regions: Array<CanvasRegion> = [];

  constructor(canvasElementOrQuery: HTMLCanvasElement | string, sizeBasis: `min` | `max` = `min`) {
    this.#canvasEl = resolveEl<HTMLCanvasElement>(canvasElementOrQuery);
    this.#sizeBasis = sizeBasis;
    this.#pixelScaling = window.devicePixelRatio || 1;
    this.#sizeScaler = this.#createSizeScaler();
    this.#logicalSize = this.setLogicalSize({ width: this.#canvasEl.width, height: this.#canvasEl.height });
  }


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

  invalidateContext() {
    this.#ctx = undefined;
  }

  #add(region: CanvasRegion) {
    this.#regions.push(region);
    return region;
  }

  createFixedAbsolute(canvasCoordsRect: RectPositioned) {
    return this.#add(new CanvasRegion(this, () => canvasCoordsRect))
  }

  toAbsPoint(pt: Point, kind: `independent` = `independent`) {
    let { x, y } = pt;
    switch (kind) {
      case `independent`:
        x *= this.width;
        y *= this.height;

    }
    return { x, y };
  }

  get offset() {
    const b = this.#canvasEl.getBoundingClientRect();
    return { x: b.left, y: b.top };
  }

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

  createRelative(rect: RectPositioned, kind: `independent` = `independent`) {
    let compute: undefined | ((source: CanvasSource) => RectPositioned);
    switch (kind) {
      case `independent`:
        compute = (source: CanvasSource): RectPositioned => ({
          x: rect.x * source.width,
          y: rect.y * source.height,
          width: rect.width * source.width,
          height: rect.height * source.height
        })
        break;
    }
    // const compute = (source: CanvasSource) => {
    //   return {
    //     x: source.sizeScaler.abs(rect.x),
    //     y: source.sizeScaler.abs(rect.y),
    //     width: source.sizeScaler.abs(rect.width),
    //     height: source.sizeScaler.abs(rect.height),
    //   }
    // };
    return this.#add(new CanvasRegion(this, compute));
  }

  clear() {
    const c = this.context;
    c.clearRect(0, 0, this.width, this.height);
  }

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

  get sizeScaler() {
    return this.#sizeScaler;
  }

  get width() {
    return this.#logicalSize.width;
  }

  get height() {
    return this.#logicalSize.height;
  }
}

/**
 * Draws on a canvas, constrained to a specific region
 */
export class CanvasRegion {
  source;
  #regionCompute;
  #r;

  /**
   * Creates, using coordinate in canvas coordinates
   */
  constructor(source: CanvasSource, regionCompute: (parent: CanvasSource) => RectPositioned) {
    this.source = source;
    this.#regionCompute = regionCompute;
    this.#r = regionCompute(source);
  }

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
   * @param rel 
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

  applyRegionOffset(p: Point) {
    return {
      x: p.x + this.#r.x,
      y: p.y + this.#r.y
    }
  }

  drawConnectedPointsRelative(relativePoints: Array<Point>, strokeStyle: string, lineWidth = 1) {
    const points = relativePoints.map(p => this.toAbsRegion(p));
    this.drawConnectedPoints(points, strokeStyle, lineWidth);
  }

  drawConnectedPoints(points: Array<Point>, strokeStyle: string, lineWidth = 1) {
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
  fillTextRelative(text: string, relPos: Point, fillStyle: string = `black`, font: string, baseline: CanvasTextBaseline = `alphabetic`, align: CanvasTextAlign = `start`) {
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
  fillText(text: string, point: Point, fillStyle: string = `black`, font: string, baseline: CanvasTextBaseline = `alphabetic`, align: CanvasTextAlign = `start`) {
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

  drawCircles(relativeCircles: Array<CirclePositioned>, fillStyle: string, strokeStyle: string = ``, lineWidth = 1) {
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

  clear() {
    const c = this.context;
    c.clearRect(this.#r.x, this.#r.y, this.#r.width, this.#r.height);
  }

  fill(fillStyle: string = `white`) {
    const c = this.context;
    c.fillStyle = fillStyle;
    c.fillRect(this.#r.x, this.#r.y, this.#r.width, this.#r.height);
  }

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

  get center() {
    return Rects.center(this.#r);
  }

  get context() {
    return this.source.context;
  }

  set region(value: RectPositioned) {
    this.#r = value;
  }

  get region() {
    return this.#r;
  }

  get width() {
    return this.#r.width;
  }

  get height() {
    return this.#r.height;
  }

  get x() {
    return this.#r.x;
  }

  get y() {
    return this.#r.y;
  }

  get dimensionMin() {
    return Math.min(this.#r.width, this.#r.height);
  }
}
