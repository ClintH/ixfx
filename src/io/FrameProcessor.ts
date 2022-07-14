export type Sources = ``| `camera`;
import * as Camera from './Camera.js';
import * as Video from '../visual/Video.js';

type State = `ready`|`initialised`|`disposed`;
export class FrameProcessor {
  private _source:Sources;
  private _state:State;
  private _teardownNeeded = false;
  
  private _cameraConstraints:Camera.Constraints|undefined;
  private _cameraStartResult:Camera.StartResult|undefined;
  private _cameraCapture:Video.ManualCapturer|undefined;

  private _showCanvas:boolean;
  constructor() {
    this._state = `ready`;
    this._source = ``;
    this._showCanvas = false;
  }

  async useCamera(constraints?:Camera.Constraints) {
    if (this._state === `disposed`) throw new Error(`Disposed`);

    this._source  = `camera`;
    if (this._teardownNeeded) this.teardown();
    this._cameraConstraints = constraints;
    await this.init();
  }

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
  }

  private async initCamera() {
    const r = await Camera.start(this._cameraConstraints);
    if (r === undefined) throw new Error(`Could not start camera`);

    this._cameraCapture = Video.manualCapture(r.videoEl, {showCanvas:this._showCanvas});
    this._cameraStartResult = r;
    this._teardownNeeded = true;

    this._cameraStartResult = r;
  }

  dispose() {
    if (this._state === `disposed`) return;
    this.teardown();
    this._state = `disposed`;
  }

  private async init() {
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

  getFrame():ImageData|undefined {
    if (this._state === `disposed`) throw new Error(`Disposed`);

    switch (this._source) {
    case `camera`:
      return this.getFrameCamera();
    }
  }

  private getFrameCamera():ImageData|undefined {
    return this._cameraCapture?.capture();
  }
} 
