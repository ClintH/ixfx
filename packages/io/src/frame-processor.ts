import { Video } from '@ixfx/visual';
import * as Camera from './camera.js';
import * as VideoFile from './video-file.js';
import type { FrameProcessorSources } from './types.js';

type State = `ready` | `initialised` | `disposed`;

/**
 * Frame procesor options
 */
export type FrameProcessorOpts = {
  /**
   * If true, capture canvas will be shown. Default: false
   */
  readonly showCanvas?: boolean;
  /**
   * If true, raw source will be shown. Default: false.
   */
  readonly showPreview?: boolean;
  /**
   * If specified, this function will be called after ImageData is captured
   * from the intermediate canvs. This allows for drawing on top of the
   * captured image.
   */
  readonly postCaptureDraw?: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => void;

  /**
   * Default constraints to use for the camera source
   */
  readonly cameraConstraints?: Camera.Constraints;

  /**
   * If specified, this canvas will be used for capturing frames to
   */
  readonly captureCanvasEl?: HTMLCanvasElement;
};

/**
 * Frame Processor
 * Simplifies grabbing frames from a camera or video file.
 * 
 * First, create:
 * ```js
 * const fp = new FrameProcessor();
 * ```
 * 
 * Then either use the camera or a video file:
 * ```js
 * fp.useCamera(constraints);
 * // or:
 * gp.useVideo(file);
 * ```
 * 
 * With `useCamera`, optionally specify {@link Camera.Constraints} to pick which camera and resolution.
 * 
 * ```js
 * fp.getFrame(); // Gets the last frame
 * fp.dispose(); // Close down camera/file
 * ```
 * 
 * See {@link FrameProcessorOpts} for details on available options.
 */
export class FrameProcessor {
  private _source: FrameProcessorSources;
  private _state: State;
  private _teardownNeeded = false;

  private _cameraConstraints: Camera.Constraints | undefined;
  private _cameraStartResult: Camera.StartResult | undefined;
  private _videoSourceCapture: Video.ManualCapturer | undefined;

  private _videoFile: File | undefined;
  private _videoStartResult: VideoFile.StartResult | undefined;

  private _showCanvas: boolean;
  private _showPreview: boolean;
  private _postCaptureDraw;
  private _timer: number;
  private _captureCanvasEl?: HTMLCanvasElement;

  /**
   * Create a new frame processor
   * @param opts
   */
  constructor(opts: FrameProcessorOpts = {}) {
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
  showPreview(enabled: boolean) {
    if (this._state === `disposed`) throw new Error(`Disposed`);
    let el: HTMLElement | undefined;

    switch (this._source) {
      case `camera`: {
        el = this._cameraStartResult?.videoEl;
        if (el !== undefined) el.style.display = enabled ? `block` : `none`;
        break;
      }
    }

    this._showPreview = enabled;
  }

  /**
   * Shows or hides the Canvas we're capturing to
   * @param enabled
   */
  showCanvas(enabled: boolean) {
    if (this._state === `disposed`) throw new Error(`Disposed`);
    let el: HTMLElement | undefined;

    if (this._source === `camera` || this._source === `video`) {
      el = this._videoSourceCapture?.canvasEl;
      if (el !== undefined) el.style.display = enabled ? `block` : `none`;
    } else throw new Error(`Source not implemented: ${ this._source }`);

    this._showCanvas = enabled;
  }

  /**
   * Returns the current capturer instance
   * @returns
   */
  getCapturer(): Video.ManualCapturer | undefined {
    if (this._state === `disposed`) throw new Error(`Disposed`);
    if (this._source === `camera` || this._source === `video`) {
      return this._videoSourceCapture;
    }
    throw new Error(`Source kind not supported ${ this._source }`);
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
  async useCamera(constraints?: Camera.Constraints) {
    if (this._state === `disposed`) throw new Error(`Disposed`);

    this._source = `camera`;
    if (this._teardownNeeded) this.teardown();
    if (constraints) this._cameraConstraints = constraints;

    await this.init();
  }

  async useVideo(file: File) {
    if (this._state === `disposed`) throw new Error(`Disposed`);
    this._source = `video`;
    if (this._teardownNeeded) this.teardown();
    this._videoFile = file;
    await this.init();
  }

  /**
   * Initialises camera
   */
  private async initCamera() {
    const r = await Camera.start(this._cameraConstraints);
    if (r === undefined) throw new Error(`Could not start camera`);
    this._cameraStartResult = r;
    void this.postInit(r);
  }

  private async initVideo() {
    if (!this._videoFile) throw new Error(`Video file not defined`);
    const r = await VideoFile.start(this._videoFile);
    this._videoStartResult = r;

    void this.postInit(r);
  }

  private async postInit(r: Camera.StartResult | VideoFile.StartResult) {
    if (this._showPreview) r.videoEl.style.display = `block`;

    // Set up manual capturer
    this._videoSourceCapture = Video.manualCapture(r.videoEl, {
      postCaptureDraw: this._postCaptureDraw,
      showCanvas: this._showCanvas,
      canvasEl: this._captureCanvasEl,
    });

    this._teardownNeeded = true;
    this._cameraStartResult = r;
    return Promise.resolve();
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
      case `camera`: {
        await this.initCamera();
        break;
      }
      case `video`: {
        await this.initVideo();
        break;
      }
    }
    this._state = `initialised`;
  }

  private teardown() {
    if (!this._teardownNeeded) return;
    if (this._source === `camera` || this._source === `video`) {
      this._videoSourceCapture?.dispose();
    }
    switch (this._source) {
      case `camera`: {
        this._cameraStartResult?.dispose();
        break;
      }
      case `video`: {
        this._videoStartResult?.dispose();
        break;
      }
    }
    this._teardownNeeded = false;
  }

  /**
   * Get the last frame
   * @returns
   */
  getFrame(): ImageData | undefined {
    if (this._state === `disposed`) throw new Error(`Disposed`);

    switch (this._source) {
      case `camera`: {
        return this.getFrameCamera();
      }
      case `video`: {
        return this.getFrameCamera();
      }
      default: {
        throw new Error(`source type unhandled ${ this._source }`);
      }
    }
  }

  /**
   * Get the timestamp of the processor (elapsed time since starting)
   * @returns
   */
  getTimestamp(): number {
    return performance.now() - this._timer;
  }

  private getFrameCamera(): ImageData | undefined {
    return this._videoSourceCapture?.capture();
  }
}
