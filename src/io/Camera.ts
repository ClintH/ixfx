import {waitFor} from '~/flow/WaitFor.js';
import * as Rects from '../geometry/Rect.js';

/**
 * Print available media devices to console
 * @param filterKind Defaults `videoinput`
 */
export const dumpDevices = async (filterKind = `videoinput`) => {
  const devices = await navigator.mediaDevices.enumerateDevices();

  devices.forEach(d => {
    
    if (d.kind !== filterKind) return;
    console.log(d.label);
    console.log(` Kind: ${d.kind}`);
    console.log(` Device id: ${d.deviceId}`);
  });
};

/**
 * Constraints when requesting a camera source
 */
export type Constraints = {
  /**
   * Camera facing: user is front-facing, environment is a rear camera
   */
  readonly facingMode?: `user`|`environment`,
  /**
   * Maximum resolution
   */
  readonly max?:Rects.Rect,
  /**
   * Minimum resolution
   */
  readonly min?:Rects.Rect
  /**
   * Ideal resolution
   */
  readonly ideal?:Rects.Rect
  /**
   * If specified, will try to use this media device id
   */
  readonly deviceId?:string

  /**
   * Number of milliseconds to wait on `getUserMedia` before giving up.
   * Defaults to 30seconds
   */
  readonly startTimeoutMs?:number
}

const startTimeoutMs = 10000;

/**
 * Result from starting a camera
 */
//eslint-disable-next-line functional/no-mixed-type
export type StartResult = {
  /**
   * Call dispose to stop the camera feed and remove any created resources, 
   * such as a VIDEO element
   */
  readonly dispose:() => void;
  /**
   * Video element camera is connected to
   */
  readonly videoEl:HTMLVideoElement;
}
/**
 * Attempts to start a video-only stream from a camera into a hidden
 * VIDEO element for frame capture. The VIDEO element is created automatically.
 * 
 * 
 * ```js
 * import {Camera} from 'https://unpkg.com/ixfx/dist/visual.js'
 * try 
 *  const { videoEl, dispose } = await Camera.start();
 *  for await (const frame of frames(videoEl)) {
 *   // Do something with pixels...
 *  }
 * } catch (ex) {
 *  console.error(`Video could not be started`);
 * }
 * ```
 * 
 * Be sure to call the dispose() function to stop the video stream and remov
 * the created VIDEO element.
 * 
 * _Constraints_ can be specified to select a camera and resolution:
 * ```js
 * import {Camera} from 'https://unpkg.com/ixfx/dist/visual.js'
 * try 
 *  const { videoEl, dispose } = await Camera.start({
 *    facingMode: `environment`,
 *    max: { width: 640, height: 480 }
 *  });
 *  for await (const frame of frames(videoEl)) {
 *   // Do something with pixels...
 *  }
 * } catch (ex) {
 *  console.error(`Video could not be started`);
 * }
 * ```
 * @param constraints 
 * @returns Returns `{ videoEl, dispose }`, where `videoEl` is the created VIDEO element, and `dispose` is a function for removing the element and stopping the video.
 */
export const start = async (constraints:Constraints = {}): Promise<StartResult> => {
  const videoEl = document.createElement(`VIDEO`) as HTMLVideoElement;
  //eslint-disable-next-line functional/immutable-data
  videoEl.style.display = `none`;
  videoEl.classList.add(`ixfx-camera`);
  
  document.body.appendChild(videoEl);
  
  //eslint-disable-next-line functional/no-let
  let stopVideo = () => { /* no-op */ };

  const dispose = () => {
    try {
      // Stop source
      stopVideo();
    } catch {
      /* no-op */
    }

    // Remove the element we created
    videoEl.remove();
  };

  try {
    // Attempt to start video 
    const r = await startWithVideoEl(videoEl, constraints);
    stopVideo = r.dispose;
    return  {videoEl, dispose};
  } catch (ex) {
    // If it didn't work, delete the created element 
    console.error(ex);
    dispose();
    throw ex;
  }

};

/**
 * Attempts to start a video-only stream from a camera into the designated VIDEO element.
 * @param videoEl 
 * @param constraints 
 * @returns Result contains videoEl and dispose function
 */
const startWithVideoEl = async (videoEl:HTMLVideoElement, constraints:Constraints = {}):Promise<StartResult> => {
  if (videoEl === undefined) throw new Error(`videoEl undefined`);
  if (videoEl === null) throw new Error(`videoEl null`);

  const maxRes = constraints.max;
  const minRes = constraints.min;
  const idealRes = constraints.ideal;

  // Setup constraints
  const c = {
    audio: false,
    video: {
      width: {},
      height: {}
    }
  };

  // Just in case some intuitive values are passed in...
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((constraints as any).facingMode === `front`) constraints = {...constraints, facingMode: `user`};
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((constraints as any).facingMode === `back`) constraints = {...constraints, facingMode: `environment`};

  if (constraints.facingMode) {
    //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
    (c.video as any).facingMode = constraints.facingMode;
  }

  if (constraints.deviceId) {
    //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
    (c.video as any).deviceId = constraints.deviceId;
  }

  if (idealRes) {
    //eslint-disable-next-line functional/immutable-data
    c.video.width = {
      ...c.video.width,
      ideal: idealRes.width
    };
    //eslint-disable-next-line functional/immutable-data
    c.video.height = {
      ...c.video.height,
      ideal: idealRes.height
    };
  } 

  if (maxRes) {
    //eslint-disable-next-line functional/immutable-data
    c.video.width = {
      ...c.video.width,
      max: maxRes.width
    };
    //eslint-disable-next-line functional/immutable-data
    c.video.height = {
      ...c.video.height,
      max: maxRes.height
    };
  }

  if (minRes) {
    //eslint-disable-next-line functional/immutable-data
    c.video.width = {
      ...c.video.width,
      min: minRes.width
    };
    //eslint-disable-next-line functional/immutable-data
    c.video.height = {
      ...c.video.height,
      min: minRes.height
    };
  }

  // Request stream
  const done = waitFor(constraints.startTimeoutMs ?? startTimeoutMs, 
    (reason) => {
      throw new Error(`Camera getUserMedia failed: ${reason}`);
    });

  try {
    const stream = await navigator.mediaDevices.getUserMedia(c);

    // Clean-up function
    const dispose = () => {
      videoEl.pause();
      const t = stream.getTracks();
      t.forEach(track => track.stop());
    };

    // Assign to VIDEO element
    //eslint-disable-next-line functional/immutable-data
    videoEl.srcObject = stream;
    done();

    const ret = {videoEl, dispose};
    const p = new Promise<StartResult>((resolve, reject) => {
      videoEl.addEventListener(`loadedmetadata`,  () => {
        videoEl.play().then(() => {
          resolve(ret);
        }).catch((ex) => {
          reject(ex);
        });
      });
    });
    return p;
  } catch (ex) {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    done((ex as any).toString());
    throw ex;
  }

};