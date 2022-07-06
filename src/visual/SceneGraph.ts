/* eslint-disable */
import {Arrays} from '../collections/index.js';
import {Points} from '../geometry/index.js';
import * as Rects from '../geometry/Rect.js';
import {hue as randomHue} from  '../Random.js';

export type Measurement = {
  size: Rects.Rect|Rects.RectPositioned
  ref: Box
  children: Array<Measurement|undefined>
}

export type PxUnit = {
  value: number;
  type: `px`;
}

export type BoxUnit = PxUnit;

export type BoxRect = {
  x?: BoxUnit
  y?: BoxUnit
  width?: BoxUnit
  height?: BoxUnit 
}

const unitIsEqual = (a:BoxUnit, b:BoxUnit):boolean => {
  if (a.type ===`px` && b.type === `px`) {
    return (a.value === b.value)
  }
  return false;
}

const boxRectIsEqual = (a:BoxRect|undefined, b:BoxRect|undefined):boolean => {
  if (a === undefined && b === undefined) return true;
  if (a === undefined) return false;
  if (b === undefined) return false;
  if (a.x && b.x) {
    if (!unitIsEqual(a.x, b.x)) return false;
  }
  if (a.y && b.y) {
    if (!unitIsEqual(a.y, b.y)) return false;
  }
  if (a.width && b.width) {
    if (!unitIsEqual(a.width, b.width)) return false;
  }
  if (a.height && b.height) {
    if (!unitIsEqual(a.height, b.height)) return false;
  }
  return true;
}

export class MeasureState {
  bounds: Rects.Rect;
  pass: number;
  measurements: Map<string, Measurement>;
  
  constructor(bounds:Rects.Rect) {
    this.bounds = bounds;
    this.pass = 0;
    this.measurements = new Map<string, Measurement>();
  }

  getSize(id:string):Rects.Rect|undefined {
    const s = this.measurements.get(id);
    if (s === undefined) return;
    if (Rects.isPlaceholder(s.size)) return;
    return s.size;
  }
  
  resolveToPx(u:BoxUnit|undefined, defaultValue:number):number {
    if (u === undefined) return defaultValue; //throw new Error(`unit undefined`);
    if (u.type === `px`) return u.value;
    throw new Error(`Unknown unit type ${u.type}`);
  }
}

export abstract class Box {
  visual:Rects.RectPositioned = Rects.placeholderPositioned;
  private _desiredSize:BoxRect|undefined;
  private _lastMeasure:Rects.RectPositioned | Rects.Rect|undefined

  protected children: Box[] = [];
  protected readonly _parent:Box|undefined;
  private _idMap: Map<string,Box> = new Map();

  debugLayout = false;
  
  private _visible = true;
  protected _ready = true;

  takesSpaceWhenInvisible = false;
  needsDrawing = true;
  protected _needsLayout = true;

  debugHue = randomHue();
  readonly id: string;
  
  constructor(parent:Box|undefined, id:string) {
    this.id = id;
    this._parent = parent;

    parent?.onChildAdded(this);
  }

  hasChild(box:Box):boolean {
    const byRef = this.children.find(c=>c === box);
    const byId = this.children.find( c => c.id === box.id);
    return byRef !== undefined || byId !== undefined;
  }

  notify(msg:string, source:Box) {
    this.onNotify(msg, source);
    this.children.forEach(c => c.notify(msg, source));
  }

  protected onNotify(msg:string, source:Box) {
  
  }

  protected onChildAdded(child:Box) {
    if (child.hasChild(this)) throw new Error(`Recursive`);
    if (child === this) throw new Error(`Cannot add self as child`);
    if (this.hasChild(child)) throw new Error(`Child already present`);

    this.children.push(child);
    this._idMap.set(child.id, child)
  }

  setReady(ready:boolean, includeChildren:boolean = false) {
    this._ready = ready;
    if (includeChildren) {
      this.children.forEach(c => c.setReady(ready, includeChildren));
    }
  }


  get visible():boolean {
    return this._visible;
  }

  set visible(v:boolean) {
    if (this._visible === v) return;
    this._visible = v;
    this.onLayoutNeeded();
  }

  get desiredSize():BoxRect|undefined {
    return this._desiredSize;
  }

  set desiredSize(v:BoxRect|undefined) {
    if (boxRectIsEqual(v, this._desiredSize)) return;
    this._desiredSize = v;
    this.onLayoutNeeded();
  }
  
  onLayoutNeeded() {
    this.notifyChildLayoutNeeded();
  }

  private notifyChildLayoutNeeded() {
    this._needsLayout = true;
    this.needsDrawing = true;
    if (this._parent !== undefined) {
      this._parent.notifyChildLayoutNeeded();
    } else {
      this.update();
    }
  }

  get root():Box {
    if (this._parent === undefined) return this;
    return this._parent.root;
  }

  protected measurePreflight() {}

  /**
   * Applies measurement, returning true if size is different than before
   * @param size 
   * @returns 
   */
   measureApply(m:Measurement, force:boolean) {

    let different = true;
    this._needsLayout = false;
    
    if (Rects.isEqual(m.size, this.visual)) different = false;
        
    if (Rects.isPositioned(m.size)) {
      this.visual = m.size;
    } else {
      this.visual = {
        x: 0, y: 0,
        width: m.size.width,
        height: m.size.height
      }
    }

    m.children.forEach(c => {
      if (c !== undefined) c.ref.measureApply(c, force);
    })
    if (different || force) {
      this.needsDrawing = true;
      this.root.notify(`measureApplied`, this);
    
    }
    return different;
  }


  debugLog(m:any) {
    console.log(this.id, m);
  }

  measureStart(opts:MeasureState, force:boolean, parent?:Measurement):Measurement|undefined {
    this.measurePreflight();

    let m:Measurement = {
      ref: this,
      size:Rects.placeholder,
      children:[]
    };
    opts.measurements.set(this.id, m);
    
    
    if (!this._visible && !this.takesSpaceWhenInvisible) {
      m.size = Rects.emptyPositioned;
    } else {
      let size = this._lastMeasure;
      if (this._needsLayout || this._lastMeasure === undefined) {
        size = this.measureSelf(opts, parent);
        this.root.notify(`measured`, this);
      }
      if (size === undefined) return;
      m.size = size;
      this._lastMeasure = size;
    }

    m.children = this.children.map(c => c.measureStart(opts, force, m));
    if (Arrays.without(m.children, undefined).length < this.children.length) {
      return undefined; // One of the children did not resolve
    }

    return m;
  }

  protected measureSelf(opts:MeasureState, parent?:Measurement):Rects.RectPositioned | Rects.Rect|undefined {
    let size = Rects.placeholderPositioned;
    if (parent) {
      // Use parent size
      if (parent.size) {
        size = {
          x: 0, y: 0,
          width: parent.size.width,
          height: parent.size.height 
        }
      }
    } else {
      // Use canvas size
      size = {
        x:0, y:0,
        width: opts.bounds.width,
        height: opts.bounds.height
      }
    }
    if (Rects.isPlaceholder(size)) return;
    return size;
  }

  /**
   * Called when update() is called
   * @param force 
   */
  protected abstract updateBegin(force:boolean):MeasureState;
  
  protected updateDone(state:MeasureState, force:boolean):void {
    this.onUpdateDone(state, force);
    this.children.forEach(c=>c.updateDone(state, force));
  }

  abstract onUpdateDone(state:MeasureState, force:boolean):void;

  update(force = false) {
    const state = this.updateBegin(force);
    let attempts = 5;
    let applied = false;

    while (attempts--) {
      const m = this.measureStart(state, force);
      if (m !== undefined) {
        // Apply measurements
        this.measureApply(m, force);
        if (!this._ready) return;
        applied = true;
        //this.onMeasurementApplied(sizeChanged, force;
        //return;
      }
    }

    this.updateDone( state, force);
    if (!applied) console.warn(`Ran out of measurement attempts`);
  }
}

export class CanvasMeasureState extends MeasureState {
  readonly ctx:CanvasRenderingContext2D;
  constructor(bounds:Rects.Rect, ctx:CanvasRenderingContext2D) {
    super(bounds);
    this.ctx = ctx;
  }
}


export class CanvasBox extends Box {
  readonly canvasEl:HTMLCanvasElement;

  constructor(parent:CanvasBox|undefined, canvasEl:HTMLCanvasElement, id:string) {
    super(parent, id);
    if (canvasEl === undefined) throw new Error(`canvasEl undefined`);
    if (canvasEl === null) throw new Error(`canvasEl null`);
    this.canvasEl = canvasEl;

    if (parent === undefined) this.designateRoot();
  }

  private designateRoot() {
    this.canvasEl.addEventListener(`pointermove`, evt => {
      const p = {x:evt.offsetX, y:evt.offsetY};
      this.notifyPointerMove(p);
    });

    this.canvasEl.addEventListener(`pointerleave`, evt => {
      this.notifyPointerLeave();    
    })

    this.canvasEl.addEventListener(`click`, evt => {
      const p = {x:evt.offsetX, y:evt.offsetY};
      this.notifyClick(p);
    })
  }

  protected onClick(p:Points.Point) {}

  private notifyClick(p:Points.Point) {
    if (Rects.isPlaceholder(this.visual)) return;
    if (Rects.intersectsPoint(this.visual, p)) {
      const pp = Points.subtract(p, this.visual.x, this.visual.y);
      this.onClick(pp);
      this.children.forEach(c=> (c as CanvasBox).notifyClick(pp));
    }
  }

  private notifyPointerLeave() {
    this.onPointerLeave();
    this.children.forEach(c=>(c as CanvasBox).notifyPointerLeave());
  }

  private notifyPointerMove(p:Points.Point) {
    if (Rects.isPlaceholder(this.visual)) return;
    if (Rects.intersectsPoint(this.visual, p)) {
      const pp = Points.subtract(p, this.visual.x, this.visual.y);
      this.onPointerMove(pp);
      this.children.forEach(c=> (c as CanvasBox).notifyPointerMove(pp));
    }
  };

  protected onPointerLeave() {

  }

  protected onPointerMove(p:Points.Point) {

  }

  protected updateBegin():MeasureState {
    const ctx = this.canvasEl.getContext(`2d`);
    if (ctx === null) throw new Error(`Context unavailable`);

    const s = this.canvasEl.getBoundingClientRect();

    return new CanvasMeasureState({
      width: s.width,
      height: s.height
    }, ctx);
  }

  override onUpdateDone(state: MeasureState, force: boolean) {
    if (!this.needsDrawing && !force) return;
    
    const ctx = this.canvasEl.getContext(`2d`);
    if (ctx === null) throw new Error(`Context unavailable`);

    ctx.save();
    ctx.translate(this.visual.x, this.visual.y);
    
    const v = this.visual;
    
    if (this.debugLayout) {
      
      //ctx.clearRect(0,0,v.width,v.height);
      
      ctx.lineWidth = 1;
      ctx.strokeStyle = `hsl(${this.debugHue}, 100%, 50%)`;

      //ctx.fillStyle = ctx.strokeStyle;
      //ctx.fillRect(0,0,v.width,v.height);
      
      ctx.strokeRect(0, 0, v.width, v.height);

      ctx.fillStyle = ctx.strokeStyle;
      ctx.fillText(this.id, 10, 10, v.width);

      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(v.width, v.height);
      ctx.stroke();
    }

    this.drawSelf(ctx);

    this.needsDrawing = false;
    ctx.restore();
  }

  protected drawSelf(ctx:CanvasRenderingContext2D):void {

  }
}