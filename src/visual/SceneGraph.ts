/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Arrays } from '../collections/index.js';
import { Points } from '../geometry/index.js';
import * as Rects from '../geometry/Rect.js';
import { hue as randomHue } from '../Random.js';

export type Measurement = {
  actual: Rects.Rect;
  ref: Box;
  children: Array<Measurement | undefined>;
};

export type Layout = {
  actual: Points.Point;
  ref: Box;
  children: Array<Layout | undefined>;
};

export type PxUnit = {
  value: number;
  type: `px`;
};

export type PcUnit = {
  value: number;
  type: `pc`;
};

export type BoxUnit = PxUnit | PcUnit;

export type BoxRect = {
  x?: BoxUnit;
  y?: BoxUnit;
  width?: BoxUnit;
  height?: BoxUnit;
};

export const boxUnitFromPx = (v: number): PxUnit => {
  return { type: `px`, value: v };
}
export const boxRectFromPx = (x: number, y: number, width: number, height: number): BoxRect => {
  return {
    x: boxUnitFromPx(x),
    y: boxUnitFromPx(y),
    width: boxUnitFromPx(width),
    height: boxUnitFromPx(height)
  }
}
export const boxRectFromRectPx = (r: Rects.RectPositioned): BoxRect => {
  return {
    x: boxUnitFromPx(r.x),
    y: boxUnitFromPx(r.y),
    width: boxUnitFromPx(r.width),
    height: boxUnitFromPx(r.height)
  }
}

const unitIsEqual = (a: BoxUnit, b: BoxUnit): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (a.type === `px` && b.type === `px`) {
    return a.value === b.value;
  }
  return false;
};

const boxRectIsEqual = (
  a: BoxRect | undefined,
  b: BoxRect | undefined
): boolean => {
  if (a === undefined && b === undefined) return true;
  if (a === undefined) return false;
  if (b === undefined) return false;
  if (a.x && b.x && !unitIsEqual(a.x, b.x)) return false;
  if (a.y && b.y && !unitIsEqual(a.y, b.y)) return false;
  if (a.width && b.width && !unitIsEqual(a.width, b.width)) return false;
  if (a.height && b.height && !unitIsEqual(a.height, b.height)) return false;
  return true;
};

class BaseState {
  bounds: Rects.RectPositioned;
  pass: number;
  constructor(bounds: Rects.RectPositioned) {
    this.bounds = bounds;
    this.pass = 0;
  }

  resolveToPx(u: BoxUnit | undefined, maxValue: number, defaultValue?: number): number | undefined {
    if (u === undefined && defaultValue !== undefined) return defaultValue;
    if (u === undefined) return; //throw new Error(`unit undefined`);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (u.type === undefined) throw new TypeError(`Expected 'type' and 'value' fields. Type is missing`);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (u.value === undefined) throw new TypeError(`Expected 'type' and 'value' fields. Value is missing`);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (u.type === `px`) return u.value;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (u.type === `pc`) return u.value * maxValue;
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    // @ts-expect-error
    throw new Error(`Unknown unit type: ${ u.type }`);
  }

  resolveBox(box: BoxRect | undefined): Rects.Rect | Rects.RectPositioned | undefined {
    if (box === undefined) return undefined;
    const x = this.resolveToPx(box.x, this.bounds.width);
    const y = this.resolveToPx(box.y, this.bounds.height);
    const width = this.resolveToPx(box.width, this.bounds.width);
    const height = this.resolveToPx(box.height, this.bounds.height);
    if (!width || !height) throw new TypeError(`Expected width and height`);
    if (x === undefined && y === undefined) {
      return Object.freeze({ width, height });
    } else {
      if (!x || !y) throw new TypeError(`Expected x and y`);
      return Object.freeze({
        x, y, width, height
      });
    }
  }
}

export class MeasureState extends BaseState {
  measurements: Map<string, Measurement>;

  constructor(bounds: Rects.RectPositioned) {
    super(bounds);
    this.measurements = new Map<string, Measurement>();
  }

  getActualSize(id: string): Rects.Rect | undefined {
    const s = this.measurements.get(id);
    if (s === undefined) return;
    if (Rects.isPlaceholder(s.actual)) return;
    return s.actual;
  }

  whatIsMeasured(): Array<string> {
    return [ ...this.measurements.keys() ]
  }
}

export class LayoutState extends BaseState {
  layouts: Map<string, Layout>;

  constructor(bounds: Rects.RectPositioned) {
    super(bounds);
    this.layouts = new Map<string, Layout>();
  }
}
/**
 * Box
 */
export abstract class Box {

  /** Rectangle Box occupies in canvas/etc */
  canvasRegion: Rects.RectPositioned = Rects.placeholderPositioned;

  private _desiredRect: BoxRect | undefined;

  protected _measuredSize: Rects.Rect | undefined;
  protected _layoutPosition: Points.Point | undefined;

  protected children: Array<Box> = [];
  protected readonly _parent: Box | undefined;
  private _idMap = new Map<string, Box>();

  debugLayout = false;

  private _visible = true;
  protected _ready = true;

  takesSpaceWhenInvisible = false;

  protected _needsMeasuring = true;
  protected _needsLayoutX = true;
  protected _needsDrawing = true;

  debugHue = randomHue();
  readonly id: string;

  /**
   * Constructor.
   * 
   * If `parent` is provided, `parent.onChildAdded(this)` is called.
   * @param parent parent box 
   * @param id id of this box
   */
  constructor(parent: Box | undefined, id: string) {
    this.id = id;
    this._parent = parent;

    parent?.onChildAdded(this);
  }

  /**
   * Returns _true_ if `box` is a child
   * @param box 
   * @returns 
   */
  hasChild(box: Box): boolean {
    const byReference = this.children.find((c) => c === box);
    const byId = this.children.find((c) => c.id === box.id);
    return byReference !== undefined || byId !== undefined;
  }

  /**
   * Sends a message to all child boxes.
   * 
   * This first calls `onNotify` on this instance,
   * before calling `notify()` on each child.
   * @param message 
   * @param source 
   */
  notify(message: string, source: Box) {
    this.onNotify(message, source);
    for (const c of this.children) c.notify(message, source);
  }

  *getChildren() {
    return this.children.entries();
  }

  /**
   * Handles a received message
   * @param _message 
   * @param _source 
   */
  protected onNotify(_message: string, _source: Box) {
    /** no-op */
  }

  /**
   * Notification a child box has been added
   * 
   * Throws if
   * - child has parent as its own child
   * - child is same as this
   * - child is already child of this
   * @param child 
   */
  protected onChildAdded(child: Box) {
    if (child.hasChild(this)) throw new Error(`Recursive`);
    if (child === this) throw new Error(`Cannot add self as child`);
    if (this.hasChild(child)) throw new Error(`Child already present`);

    this.children.push(child);
    this._idMap.set(child.id, child);

    this.layoutInvalidated(`Box.onChildAdded`);
  }

  /**
   * Sets `_ready` to `ready`. If `includeChildren` is _true_,
   * `setReady` is called on each child
   * @param ready 
   * @param includeChildren 
   */
  setReady(ready: boolean, includeChildren = false) {
    this._ready = ready;
    if (includeChildren) {
      for (const c of this.children) c.setReady(ready, includeChildren);
    }
  }

  /**
   * Gets visible state
   */
  get visible(): boolean {
    return this._visible;
  }

  /**
   * Sets visible state
   */
  set visible(v: boolean) {
    if (this._visible === v) return;
    this._visible = v;

    // Invalidated because we skip measuring when it is invisible
    this.layoutInvalidated(`Box.set visible`);
  }

  /**
   * Gets the box's desired region, or _undefined_
   */
  get desiredRegion(): BoxRect | undefined {
    return this._desiredRect;
  }

  /**
   * Sets the box's desired region.
   * Calls `onLayoutNeeded()`
   */
  set desiredRegion(v: BoxRect | undefined) {
    if (boxRectIsEqual(v, this._desiredRect)) return;
    this._desiredRect = v;
    this.layoutInvalidated(`set desiredRegion`);
  }

  /**
   * Calls `notifyChildLayoutNeeded`
   */
  layoutInvalidated(reason: string) {
    if (reason === undefined) debugger;
    this.debugLog(`layoutInvalidated ${ reason }`);
    this._needsMeasuring = true;
    this._needsLayoutX = true;
    // TODO: Only set to true during measuring if it actually changes
    this._needsDrawing = true;
    this.notifyChildLayoutNeeded();
  }

  drawingInvalidated(reason: string): void {
    this._needsDrawing = true;
    this.debugLog(`drawingInvalidated ${ reason }`);

  }

  /**
   * Called from a child, notifying us that
   * its layout has changed
   * @returns 
   */
  private notifyChildLayoutNeeded() {
    // TODO: Not all layout changes require re-layout higher up
    this._needsDrawing = true;
    this._needsLayoutX = true;
    this._needsMeasuring = true;
    if (this._parent === undefined) return;
    this._parent.notifyChildLayoutNeeded();
  }

  /**
   * Returns the root box
   */
  get root(): Box {
    if (this._parent === undefined) return this;
    return this._parent.root;
  }

  /**
   * Prepare for measuring
   */
  protected measurePreflight() {
    /** no-up */
  }

  /**
   * Applies actual size, returning _true_ if size is different than before
   * 
   * 1. Sets `_needsLayout` to _false_.
   * 2. Sets `visual` to `m`
   * 3. Calls `measureApply` on each child
   * 4. If there's a change or `force`, sets `needsDrawing` to _true_, and notifies root of `measureApplied`
   * @param m Measurement for box
   * @param force If true forces `measureApplied` notify
   * @returns 
   */
  protected measureApply(m: Measurement) {
    this._needsMeasuring = false;

    const different = this._measuredSize === undefined ? true : !Rects.isEqualSize(m.actual, this._measuredSize);
    if (different) {
      this.debugLog(`measureAply: Size is different than previous. Actual: ${ JSON.stringify(m.actual) } current: ${ JSON.stringify(this._measuredSize) }`);
      this._needsLayoutX = true;
    }

    this._measuredSize = { width: m.actual.width, height: m.actual.height };

    for (const c of m.children) {
      if (c !== undefined) c.ref.measureApply(c);
    }

    if (different) {
      this.root.notify(`measureApplied`, this);
    }
    return different;
  }

  protected layoutApply(l: Layout) {
    this._needsLayoutX = false;

    const different = this._layoutPosition === undefined ? true : !Points.isEqual(l.actual, this._layoutPosition);
    if (different) {
      this.debugLog(`layoutApply. Position different than previous. ${ JSON.stringify(l.actual) }`);
    }
    this._layoutPosition = { x: l.actual.x, y: l.actual.y };

    for (const c of l.children) {
      if (c !== undefined) c.ref.layoutApply(c);
    }

    if (different) {
      this.root.notify(`layoutApplied`, this);
    }
    return different;
  }

  /**
   * Debug log from this box context
   * @param m 
   */
  debugLog(m: any) {
    console.log(this.id, m);
  }

  layoutStart(measureState: MeasureState, layoutState: LayoutState, force: boolean, parent?: Layout): Layout | undefined {
    const m: Layout = {
      ref: this,
      actual: Points.Empty,
      children: [],
    };
    // Stash away measurement by id
    layoutState.layouts.set(this.id, m);

    const currentPosition = this.layoutSelf(measureState, layoutState, parent);
    this.root.notify(`laidout`, this);

    // For some reason we can't measure
    if (currentPosition === undefined) return;

    // Assign
    m.actual = currentPosition;
    this.debugLog(`layoutStart: current: ${ JSON.stringify(currentPosition) }`);
    m.children = this.children.map((c) => c.layoutStart(measureState, layoutState, force, m));
    if (Arrays.withoutUndefined(m.children).length < this.children.length) {
      return undefined; // One of the children did not resolve
    }
    return m;
  }

  protected layoutSelf(
    measureState: MeasureState,
    layoutState: LayoutState,
    _parent?: Layout
  ): Points.Point | undefined {
    // TODO: Proper layout
    const box = layoutState.resolveBox(this._desiredRect);
    const x = box === undefined ? 0 : (`x` in box ? box.x : 0);
    const y = box === undefined ? 0 : (`y` in box ? box.y : 0);
    if (x === undefined) debugger;
    if (y === undefined) debugger;
    return { x, y }
  }

  /**
   * Start of measuring
   * 1. Keeps track of measurements in `opts.measurements`
   * 2. If this box takes space
   * 2.1. Measure itself if needed
   * 2.2. Use size
   * 2. Calls `measureStart` on each child
   * @param opts Options
   * @param force 
   * @param parent Parent's measurement 
   * @returns Measurement
   */
  measureStart(
    opts: MeasureState,
    force: boolean,
    parent?: Measurement
  ): Measurement | undefined {
    this.measurePreflight();

    const m: Measurement = {
      ref: this,
      // So far no known measurement
      actual: Rects.placeholder,
      children: [],
    };
    // Stash away measurement by id
    opts.measurements.set(this.id, m);

    if (!this._visible && !this.takesSpaceWhenInvisible) {
      // If we're not visible, there's no actual size
      m.actual = Rects.emptyPositioned;
    } else {
      let currentMeasurement: Rects.Rect | string | undefined = this._measuredSize;

      // If we need to, measure how big it actually is
      if (this._needsMeasuring || this._measuredSize === undefined) {
        currentMeasurement = this.measureSelf(opts, parent);
        this.root.notify(`measured`, this);
      }

      // For some reason we can't measure
      if (typeof currentMeasurement === `string`) {
        this.debugLog(`measureStart: measureSelf failed: ${ currentMeasurement }`);
        return;
      } else if (currentMeasurement === undefined) {
        this.debugLog(`measureStart: measureSelf failed for some other reason`);
        return;
      }

      // Assign
      m.actual = currentMeasurement;
    }

    m.children = this.children.map((c) => c.measureStart(opts, force, m));
    if (Arrays.withoutUndefined(m.children).length < this.children.length) {
      this.debugLog(`measureStart: Child failed measureStart`);
      return undefined; // One of the children did not resolve
    }

    return m;
  }

  /**
   * Measure the box
   * 1. Uses desired rectangle, if possible
   * 2. Otherwise uses parent's size
   * @param opts Measure state
   * @param parent Parent size
   * @returns 
   */
  protected measureSelf(
    opts: MeasureState,
    parent?: Measurement
  ): Rects.Rect | string {
    let size = Rects.placeholder;

    const context = parent ? parent.actual : opts.bounds;
    const desired = opts.resolveBox(this._desiredRect);

    size = desired ? Rects.clamp(desired, context) : context;
    this.debugLog(`measureSelf: desired: ${ JSON.stringify(desired) }`);
    if (Rects.isPlaceholder(size)) {
      return `Box.measureSelf - No size for box?`;
    }
    return size;
  }


  /**
   * Gets initial state for a run of measurements & layout.
   * 
   * Called when update() is called
   * @param force
   */
  protected abstract updateBegin(context: any): [ MeasureState, LayoutState ];

  protected abstract updateComplete(measureChanged: boolean, layoutChanged: boolean): void;

  // protected updateDone(state: MeasureState, force: boolean): void {
  //   this.onUpdateDone(state, force);
  //   for (const c of this.children) c.updateDone(state, force);
  // }

  /**
   * Update has completed
   * @param state 
   * @param force 
   */
  //abstract onUpdateDone(state: MeasureState, force: boolean): void;

  /**
   * Update
   * 1. Calls `this.updateBegin()` to initialise measurement state
   * 2. In a loop, run `measureStart()` and then `measureApply` if possible
   * 3. Call `updateDone` when finished
   * @param force 
   * @returns 
   */
  update(context: object, force = false) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (context === undefined) throw new Error(`context is undefined`);

    if (!this._needsMeasuring && !this._needsLayoutX && !force) return;
    const [ measureState, layoutState ] = this.updateBegin(context);
    let attempts = 5;
    let measureApplied = false;
    let layoutApplied = false;

    // Measure everything
    if (this._needsMeasuring || force) {
      this.debugLog(`update: needs measuring (force: ${ force }) bounds: ${ JSON.stringify(measureState.bounds) }`);
      while (attempts--) {
        const m = this.measureStart(measureState, force);
        if (m !== undefined) {
          // Apply measurements
          this.measureApply(m);
          if (!this._ready) return;
          measureApplied = true;
        }
      }
      //this.updateDone(state, force);
      if (!measureApplied) this.debugLog(`Ran out of measurement attempts`);
    }

    // Lay it out
    if (this._needsLayoutX || force) {
      this.debugLog(`update: needs layout (force: ${ force })`);
      const p = this.layoutStart(measureState, layoutState, force);
      if (p === undefined) {
        this.debugLog(`Warning: could not layout`);
      } else {
        this.layoutApply(p);
        layoutApplied = true;
      }
      //this.layoutApply(p);
    }
    this.updateComplete(measureApplied, layoutApplied);
  }
}

/**
 * Canvas measure state
 */
export class CanvasMeasureState extends MeasureState {
  readonly ctx: CanvasRenderingContext2D;
  constructor(bounds: Rects.RectPositioned, ctx: CanvasRenderingContext2D) {
    super(bounds);
    this.ctx = ctx;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ctx === undefined) throw new Error(`ctx is undefined`);
  }
}

export class CanvasLayoutState extends LayoutState {
  readonly ctx: CanvasRenderingContext2D;
  constructor(bounds: Rects.RectPositioned, ctx: CanvasRenderingContext2D) {
    super(bounds);
    this.ctx = ctx;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ctx === undefined) throw new Error(`ctx is undefined`);

  }
}

/**
 * A Box that exists on a HTMLCanvasElement
 */
export class CanvasBox extends Box {
  readonly bounds: Rects.RectPositioned | undefined;
  constructor(
    parent: CanvasBox | undefined,
    //canvasElement: HTMLCanvasElement,
    id: string,
    bounds?: Rects.RectPositioned
  ) {
    super(parent, id);
    this.bounds = bounds;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    //if (canvasElement === undefined) throw new Error(`canvasEl undefined`);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    //if (canvasElement === null) throw new Error(`canvasEl null`);
    //this.canvasEl = canvasElement;

    //if (parent === undefined) this.designateRoot();
  }

  static fromCanvas(canvasElement: HTMLCanvasElement): CanvasBox {
    const box = new CanvasBox(undefined, `canvas-box`, canvasElement.getBoundingClientRect());
    return box;
  }

  /**
   * Called if this is the parent Box
   */
  public addEventHandlers(element: HTMLElement) {
    element.addEventListener(`pointermove`, (event) => {
      const p = { x: event.offsetX, y: event.offsetY };
      this.notifyPointerMove(p);
    });

    element.addEventListener(`pointerleave`, (_event) => {
      this.notifyPointerLeave();
    });

    element.addEventListener(`click`, (event) => {
      const p = { x: event.offsetX, y: event.offsetY };
      this.notifyClick(p);
    });
  }

  protected onClick(_p: Points.Point) {
    /** no-up */
  }

  /**
   * Click event has happened on canvas
   * 1. If it's within our range, call `onClick` and pass to all children via `notifyClick`
   * @param p 
   * @returns 
   */
  private notifyClick(p: Points.Point) {
    if (Rects.isPlaceholder(this.canvasRegion)) return;
    if (Rects.intersectsPoint(this.canvasRegion, p)) {
      const pp = Points.subtract(p, this.canvasRegion.x, this.canvasRegion.y);
      this.onClick(pp);
      // TODO: Only call `notifyClick` if child is within range?
      for (const c of this.children) (c as CanvasBox).notifyClick(pp);
    }
  }

  /**
   * Pointer has left
   * 1. Pass notification to all children via `notifyPointerLeave`
   */
  private notifyPointerLeave() {
    this.onPointerLeave();
    for (const c of this.children) (c as CanvasBox).notifyPointerLeave();
  }

  /**
   * Pointer has moved
   * 1. If it's within range `onPointerMove` is called, and pass on to all children via `notifyPointerMove`
   * @param p 
   * @returns 
   */
  private notifyPointerMove(p: Points.Point) {
    if (Rects.isPlaceholder(this.canvasRegion)) return;
    if (Rects.intersectsPoint(this.canvasRegion, p)) {
      const pp = Points.subtract(p, this.canvasRegion.x, this.canvasRegion.y);
      this.onPointerMove(pp);
      for (const c of this.children) (c as CanvasBox).notifyPointerMove(pp);
    }
  }

  /**
   * Handler when pointer has left
   */
  protected onPointerLeave() {
    /** no-up */
  }

  /**
   * Handler when pointer moves within our region
   * @param _p 
   */
  protected onPointerMove(_p: Points.Point) {
    /** no-up */

  }

  /**
   * Performs recalculations and drawing as necessary
   * If nothing needs to happen, function returns.
   * @param context 
   * @param force 
   */
  update(context: CanvasRenderingContext2D, force = false) {
    super.update(context, force);
    this.draw(context, force);
  }

  getBounds(): Rects.RectPositioned | undefined {
    if (this.bounds === undefined && this._parent) return (this._parent as CanvasBox).bounds;
    return this.bounds;
  }

  /**
   * Update begins.
   * @returns MeasureState
   */
  protected updateBegin(context: CanvasRenderingContext2D): [ MeasureState, LayoutState ] {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (context === undefined) throw new Error(`Context is undefined`);
    let bounds = this.getBounds();
    this.debugLog(`updateBegin bounds: ${ JSON.stringify(bounds) } measured: ${ JSON.stringify(this._measuredSize) }`);
    if (bounds === undefined) {
      this.debugLog(`No bounds for element or parent, using canvas bounds`);
      bounds = { x: 0, y: 0, width: context.canvas.width, height: context.canvas.height }
    }
    return [
      new CanvasMeasureState(bounds, context),
      new CanvasLayoutState(bounds, context)
    ]
    // if (this.region) {
    //   return new CanvasMeasureState(this.region);
    // } else {
    //   const s = this.canvasEl.getBoundingClientRect();

    //   return new CanvasMeasureState(
    //     {
    //       x: 0,
    //       y: 0,
    //       width: s.width,
    //       height: s.height,
    //     },
    //     ctx
    //   );
    // }
  }

  protected updateComplete(_measureChanged: boolean, _layoutChanged: boolean): void {
    this.debugLog(`updateComplete. measureChanged: ${ _measureChanged } layoutChanged: ${ _layoutChanged } pos: ${ JSON.stringify(this._layoutPosition) }`);
    this.canvasRegion = Rects.placeholderPositioned;
  }

  protected measureApply(m: Measurement): boolean {
    const different = super.measureApply(m);
    if (different) this.canvasRegion = Rects.placeholderPositioned;
    return different;
  }

  protected layoutApply(l: Layout): boolean {
    const different = super.layoutApply(l);
    if (different) this.canvasRegion = Rects.placeholderPositioned;
    return different;
  }

  public draw(ctx: CanvasRenderingContext2D, force = false) {
    //this.debugLog(`draw. needs drawing: ${ this._needsDrawing } force: ${ force } pos: ${ JSON.stringify(this._layoutPosition) } size: ${ JSON.stringify(this._measuredSize) }`);

    // if (!this._needsDrawing && !force) return;

    if (this._needsDrawing || force) {
      if (Rects.isPlaceholder(this.canvasRegion)) {
        if (this._layoutPosition === undefined) return;
        if (this._measuredSize === undefined) return;
        this.canvasRegion = {
          x: this._layoutPosition.x,
          y: this._layoutPosition.y,
          width: this._measuredSize.width,
          height: this._measuredSize.height
        }
      }

      //this.debugLog(`draw: canvasRegion: ${ JSON.stringify(this.canvasRegion) }`);
      if (this._needsLayoutX || this._needsMeasuring) {
        this.debugLog(`draw: warning: drawing with outdated layout / measurements`);
      }
      ctx.save();
      const v = this.canvasRegion;
      ctx.translate(v.x, v.y);

      if (this.debugLayout) {
        //ctx.clearRect(0,0,v.width,v.height);

        ctx.lineWidth = 1;
        ctx.strokeStyle = `hsl(${ this.debugHue }, 100%, 50%)`;

        //ctx.fillStyle = ctx.strokeStyle;
        //ctx.fillRect(0,0,v.width,v.height);

        ctx.strokeRect(0, 0, v.width, v.height);

        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillText(this.id, 10, 10, v.width);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(v.width, v.height);
        ctx.stroke();
      }

      this.drawSelf(ctx);

      this._needsDrawing = false;
      ctx.restore();
    }
    for (const c of this.children) {
      (c as CanvasBox).draw(ctx, force)
    }
  }

  /**
   * Draw this object
   * @param _ctx 
   */
  protected drawSelf(_ctx: CanvasRenderingContext2D): void {
    /** no-up */
  }
}
