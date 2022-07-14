/* eslint-disable @typescript-eslint/no-non-null-assertion,functional/immutable-data */
import {continuously, delayLoop } from "../flow/index.js";

//eslint-disable-next-line functional/no-mixed-type
export type Capturer = {
  start():void;
  cancel():void;
  readonly canvasEl:HTMLCanvasElement;
}

//eslint-disable-next-line functional/no-mixed-type
export type ManualCapturer = {
  capture():ImageData;
  readonly canvasEl:HTMLCanvasElement;
  dispose():void;
};

//eslint-disable-next-line functional/no-mixed-type
export type CaptureOpts = {
  readonly maxIntervalMs?:number;
  readonly showCanvas?:boolean;
  readonly workerScript?:string;
  readonly onFrame?:(pixels:ImageData) => void;
};

export type ManualCaptureOpts = {
  readonly showCanvas?:boolean
}

/**
 * Options for frames generator
 */
export type FramesOpts = {
  /**
   * Max frame rate (millis per frame), or 0 for animation speed
   */
  readonly maxIntervalMs?:number;
  /**
   * False by default, created canvas will be hidden
   */
  readonly showCanvas?:boolean;
  /**
   * If provided, this canvas will be used as the buffer rather than creating one.
   */
  readonly canvasEl?:HTMLCanvasElement;
}

/**
 * Generator that yields frames from a video element as [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData).
 * 
 * ```js
 * import {Video} from 'https://unpkg.com/ixfx/dist/visual.js'
 * 
 * const ctx = canvasEl.getContext(`2d`); 
 * for await (const frame of Video.frames(videoEl)) {
 *   // TODO: Some processing of pixels
 *
 *   // Draw image on to the visible canvas
 *   ctx.putImageData(frame, 0, 0);
 * }
 * ```
 * 
 * Under the hood it creates a hidden canvas where frames are drawn to. This is necessary
 * to read back pixel data. An existing canvas can be used if it is passed in as an option.
 * 
 * Options:
 * * `canvasEl`: CANVAS element to use as a buffer (optional)
 * * `maxIntervalMs`: Max frame rate (0 by default, ie runs as fast as possible)
 * * `showCanvas`: Whether buffer canvas will be shown (false by default)
 * @param sourceVideoEl 
 * @param opts 
 */
//eslint-disable-next-line func-style
export async function* frames(sourceVideoEl:HTMLVideoElement, opts:FramesOpts = {}):AsyncIterable<ImageData>  {
  // TODO: Ideally use OffscreenCanvas when it has wider support?
  // TODO: When ImageBitmap has possibility to get pixels, that might also help to avoid having to write to hidden canvas

  const maxIntervalMs = opts.maxIntervalMs ?? 0;
  const showCanvas = opts.showCanvas ?? false;
  //eslint-disable-next-line functional/no-let
  let canvasEl = opts.canvasEl;
  //eslint-disable-next-line functional/no-let
  let w, h;
  w = h = 0;

  // Create & setup canvas
  if (canvasEl === undefined) {
    canvasEl = document.createElement(`CANVAS`) as HTMLCanvasElement;
    canvasEl.classList.add(`ixfx-frames`);
    if (!showCanvas) {
      canvasEl.style.display = `none`;
    }
    document.body.appendChild(canvasEl);
  }
  
  // Update size of canvas based on video
  const updateSize = () => {
    if (canvasEl === undefined) return;
    w = sourceVideoEl.videoWidth;
    h = sourceVideoEl.videoHeight;
    canvasEl.width = w;
    canvasEl.height = h;
  };

  //eslint-disable-next-line functional/no-let
  let c:CanvasRenderingContext2D|null = null;

  const looper = delayLoop(maxIntervalMs);
  //eslint-disable-next-line functional/no-loop-statement
  for await (const _ of looper) {
    // If we don't yet have the size of video, get it
    if (w === 0 || h === 0) updateSize();
    
    // If there is still no dimensions (ie stream has not started), there's nothing to do yet
    if (w === 0 || h === 0) continue;

    // Draw current frame from video element to hidden canvas
    if (c === null) c = canvasEl.getContext(`2d`);
    if (c === null) return;
    c.drawImage(sourceVideoEl, 0, 0, w, h);

    // Get pixels
    const pixels = c.getImageData(
      0, 0, w, h
    );
    yield pixels;
  }
}

/**
 * Captures frames from a video element. It can send pixel data to a function or post to a worker script.
 * 
 * @example Using a function
 * ```js
 * import {Video} from 'https://unpkg.com/ixfx/dist/visual.js'
 * 
 * // Capture from a VIDEO element, handling frame data
 * // imageData is ImageData type: https://developer.mozilla.org/en-US/docs/Web/API/ImageData
 * Video.capture(sourceVideoEl, {
 *  onFrame(imageData => {
 *    // Do something with pixels...
 *  });
 * });
 * ```
 * 
 * @example Using a worker
 * ```js
 * import {Video} from 'https://unpkg.com/ixfx/dist/visual.js'
 * 
 * Video.capture(sourceVideoEl, {
 *  workerScript: `./frameProcessor.js`
 * });
 * ```
 * 
 * In frameProcessor.js:
 * ```
 * const process = (frame) => {
 *  // ...process frame
 * 
 *  // Send image back?
 *  self.postMessage({frame});
 * };
 * 
 * self.addEventListener(`message`, evt => {
 *   const {pixels, width, height} = evt.data;
 *   const frame = new ImageData(new Uint8ClampedArray(pixels),
 *     width, height);
 *
 *   // Process it
 *   process(frame);
 * });
 * ```
 * 
 * Options:
 * * `canvasEl`: CANVAS element to use as a buffer (optional)
 * * `maxIntervalMs`: Max frame rate (0 by default, ie runs as fast as possible)
 * * `showCanvas`: Whether buffer canvas will be shown (false by default)
 * * `workerScript`: If this specified, this URL will be loaded as a Worker, and frame data will be automatically posted to it
 * 
 * Implementation: frames are captured using a animation-speed loop to a hidden canvas. From there
 * the pixel data is extracted and sent to either destination. In future the intermediate drawing to a
 * canvas could be skipped if it becomes possible to get pixel data from an ImageBitmap.
 * @param sourceVideoEl Source VIDEO element
 * @param opts 
 * @returns 
 */
export const capture = (sourceVideoEl: HTMLVideoElement, opts:CaptureOpts = {}):Capturer => {
  const maxIntervalMs = opts.maxIntervalMs ?? 0;
  const showCanvas = opts.showCanvas ?? false;
  const onFrame = opts.onFrame;

  // Ideally use OffscreenCanvas when it has support?
  const w = sourceVideoEl.videoWidth;
  const h = sourceVideoEl.videoHeight;

  // Create canvas
  const canvasEl = document.createElement(`CANVAS`) as HTMLCanvasElement;
  canvasEl.classList.add(`ixfx-capture`);
  
  if (!showCanvas) {
    canvasEl.style.display = `none`;
  }
  canvasEl.width = w;
  canvasEl.height = h;
  //eslint-disable-next-line functional/no-let
  let c:CanvasRenderingContext2D|null = null;
  //eslint-disable-next-line functional/no-let
  let worker:Worker|undefined;
  if (opts.workerScript) {
    worker = new Worker(opts.workerScript);
  }

  // Should we get image data?
  const getPixels = worker || onFrame;
  if (!getPixels && !showCanvas) {
    console.warn(`Video will be captured to hidden element without any processing. Is this what you want?`);
  }

  const loop = continuously(() => {
    // Draw current frame from video element to hidden canvas
    if (c === null) c = canvasEl.getContext(`2d`);
    if (c === null) return;
    c.drawImage(sourceVideoEl, 0, 0, w, h);
    //eslint-disable-next-line functional/no-let
    let pixels:ImageData|undefined;

    if (getPixels) {
      // ImageData necessary
      pixels = c.getImageData(
        0, 0, w, h
      );
    }

    if (worker) {
      // Send to worker
      worker.postMessage({
        pixels: pixels!.data.buffer,
        width: w,
        height: h,
        channels: 4
      }, [pixels!.data.buffer]); 
    }
    if (onFrame) {
      // Send to callback
      try {
        onFrame(pixels!);
      } catch (e) {
        console.error(e);
      }
    }
  
  }, maxIntervalMs);

  return {
    start: () => loop.start(),
    cancel: () => loop.cancel(),
    canvasEl
  };
};


export const manualCapture =(sourceVideoEl: HTMLVideoElement, opts:ManualCaptureOpts = {}):ManualCapturer => {
  const showCanvas = opts.showCanvas ?? false;
    
  // Ideally use OffscreenCanvas when it has support?
  const w = sourceVideoEl.videoWidth;
  const h = sourceVideoEl.videoHeight;
  
  // Create canvas
  const canvasEl = document.createElement(`CANVAS`) as HTMLCanvasElement;
  canvasEl.classList.add(`ixfx-capture`);
  
  if (!showCanvas) canvasEl.style.display = `none`;
  
  canvasEl.width = w;
  canvasEl.height = h;

  const capture = ():ImageData => {
    //eslint-disable-next-line functional/no-let
    let c:CanvasRenderingContext2D|null = null;

    // Draw current frame from video element to hidden canvas
    if (c === null) c = canvasEl.getContext(`2d`);
    if (c === null) throw new Error(`Could not create graphics context`);
    c.drawImage(sourceVideoEl, 0, 0, w, h);
    //eslint-disable-next-line functional/no-let
    const pixels=  c.getImageData(
      0, 0, w, h
    );
    return pixels;
  };

  const dispose = ():void => {
    try {
      canvasEl.remove();
    } catch (_) {
      // no-op
    }
  };

  const c:ManualCapturer = {
    canvasEl,
    capture,
    dispose
  };
  return c;
};