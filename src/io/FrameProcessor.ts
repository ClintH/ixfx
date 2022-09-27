export type Sources = ``| `camera`;
import * as Camera from './Camera.js';
import * as Video from '../visual/Video.js';

type State = `ready`|`initialised`|`disposed`;

/**
 * Frame procesor options
 */
//eslint-disable-next-line functional/no-mixed-type
export type FrameProcessorOpts = {
  /**
   * If true, capture canvas will be shown
   */
  readonly showCanvas?:boolean
  /**
   * If true, raw source will be shown
   */
  readonly showPreview?:boolean
  /**
   * If specified, this function will be called after ImageData is captured
   * from the intermediate canvs. This allows for drawing on top of the
   * captured image.
   */
   readonly postCaptureDraw?:(ctx:CanvasRenderingContext2D, width:number, height:number) => void

   /**
    * Default constraints to use for the camera source
    */
   readonly cameraConstraints?:Camera.Constraints;

   /**
    * If specified, this canvas will be used for capturing frames to
    */
   readonly captureCanvasEl?:HTMLCanvasElement;
}

/**
 * Frame Processor
 * Simplifies grabbing frames from a source
 */
export class FrameProcessor {
  private _source:Sources;
  private _state:State;
  private _teardownNeeded = false;
  
  private _cameraConstraints:Camera.Constraints|undefined;
  private _cameraStartResult:Camera.StartResult|undefined;
  private _cameraCapture:Video.ManualCapturer|undefined;

  private _showCanvas:boolean;
  private _showPreview:boolean;
  private _postCaptureDraw;
  private _timer:number;
  private _captureCanvasEl?:HTMLCanvasElement;

  /**
   * Create a new frame processor
   * @param opts 
   */
  constructor(opts:FrameProcessorOpts = {}) {
    this._state = `ready`;
    this._source = ``;
    this._timer = performance.now();
    this._showCanvas = opts.showCanvas ?? false;
    this._showPreview = opts.showPreview ?? false;
    this._cameraConstraints = opts.cameraConstraints ?? undefined;
    this._captureCanvasEl = opts.captureCanvasEl ?? undefined;
    this._postCaptureDraw = opts.postCaptureDraw;
  }

  /**
   * Hides or shows the raw source in the DOM
   * @param enabled Preview enabled
   */
  showPreview(enabled:boolean) {
    if (this._state === `disposed`) throw new Error(`Disposed`);
    //eslint-disable-next-line functional/no-let
    let el:HTMLElement|undefined;

    switch (this._source) {
    case `camera`:
      el = this._cameraStartResult?.videoEl;
      if (el !== undefined) el.style.display = enabled ? `block` : `none`;
      break;
    }

    this._showPreview = enabled;
  }

  /**
   * Shows or hides the Canvas we're capturing to
   * @param enabled 
   */
  showCanvas(enabled:boolean) {
    if (this._state === `disposed`) throw new Error(`Disposed`);
    //eslint-disable-next-line functional/no-let
    let el:HTMLElement|undefined;
    switch (this._source) {
    case `camera`:
      el = this._cameraCapture?.canvasEl;
      if (el !== undefined) el.style.display = enabled ? `block` : `none`;  
      break;
    }  

    this._showCanvas = enabled;
  }

  /**
   * Returns the current capturer instance
   * @returns 
   */
  getCapturer():Video.ManualCapturer|undefined {
    if (this._state === `disposed`) throw new Error(`Disposed`);
    switch (this._source) {
    case `camera`:
      return this._cameraCapture;
    }
  }

  /**
   * Grab frames from a video camera source and initialises
   * frame processor.
   * 
   * If `constraints` are not specified, it will use the ones
   * provided when creating the class, or defaults.
   * 
   * @param constraints Override of constraints when requesting camera access
   */
  async useCamera(constraints?:Camera.Constraints) {
    if (this._state === `disposed`) throw new Error(`Disposed`);

    this._source = `camera`;
    if (this._teardownNeeded) this.teardown();
    if (constraints) this._cameraConstraints;
  
    await this.init();
  }

  /**
   * Initialises camera
   */
  private async initCamera() {
    const r = await Camera.start(this._cameraConstraints);
    if (r === undefined) throw new Error(`Could not start camera`);

    if (this._showPreview) r.videoEl.style.display = `block`;

    // Set up manual capturer
    this._cameraCapture = Video.manualCapture(r.videoEl, {
      postCaptureDraw:this._postCaptureDraw,
      showCanvas: this._showCanvas,
      canvasEl: this._captureCanvasEl
    });

    this._cameraStartResult = r;
    this._teardownNeeded = true;
    this._cameraStartResult = r;
  }

  /**
   * Closes down connections and removes created elements.
   * Once disposed, the frame processor cannot be used
   * @returns 
   */
  dispose() {
    if (this._state === `disposed`) return;
    this.teardown();
    this._state = `disposed`;
  }

  private async init() {
    this._timer = performance.now();
    switch (this._source) {
    case `camera`:
      await this.initCamera();
      break;
    }
    this._state = `initialised`;
  }

  private teardown() {
    if (!this._teardownNeeded) return;
    switch (this._source) {
    case `camera`:
      this._cameraCapture?.dispose();
      this._cameraStartResult?.dispose();
      break;
    }
    this._teardownNeeded = false;
  }

  /**
   * Get the last frame
   * @returns 
   */
  getFrame():ImageData|undefined {
    if (this._state === `disposed`) throw new Error(`Disposed`);

    switch (this._source) {
    case `camera`:
      return this.getFrameCamera();
    }
  }

  /**
   * Get the timestamp of the processor (elapsed time since starting)
   * @returns 
   */
  getTimestamp():number {
    return performance.now() - this._timer;
  }

  private getFrameCamera():ImageData|undefined {
    return this._cameraCapture?.capture();
  }
} 
