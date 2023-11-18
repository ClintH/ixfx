import type { Rect } from '../geometry/Types.js';
import { waitFor } from '../flow/WaitFor.js';
import { getErrorMessage } from '../debug/GetErrorMessage.js';

const startTimeoutMs = 10_000;

/**
 * Print available media devices to console
 * @param filterKind Defaults `videoinput`
 */
export const dumpDevices = async (filterKind = `videoinput`) => {
  const devices = await navigator.mediaDevices.enumerateDevices();

  for (const d of devices) {
    if (d.kind !== filterKind) continue;
    console.log(d.label);
    console.log(` Kind: ${ d.kind }`);
    console.log(` Device id: ${ d.deviceId }`);
  }
};

/**
 * Constraints when requesting a camera source
 */
export type Constraints = {
  /**
   * Camera facing: user is front-facing, environment is a rear camera
   */
  readonly facingMode?: `user` | `environment`;
  /**
   * Maximum resolution
   */
  readonly max?: Rect;
  /**
   * Minimum resolution
   */
  readonly min?: Rect;
  /**
   * Ideal resolution
   */
  readonly ideal?: Rect;
  /**
   * If specified, will try to use this media device id
   */
  readonly deviceId?: string;

  /**
   * Number of milliseconds to wait on `getUserMedia` before giving up.
   * Defaults to 30seconds
   */
  readonly startTimeoutMs?: number;
};

/**
 * Result from starting a camera
 */
//eslint-disable-next-line functional/no-mixed-types
export type StartResult = {
  /**
   * Call dispose to stop the camera feed and remove any created resources,
   * such as a VIDEO element
   */
  readonly dispose: () => void;
  /**
   * Video element camera is connected to
   */
  readonly videoEl: HTMLVideoElement;
};

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
export const start = async (
  constraints: Constraints = {}
): Promise<StartResult> => {
  const videoEl = document.createElement(`VIDEO`) as HTMLVideoElement;
  //eslint-disable-next-line functional/immutable-data
  videoEl.style.display = `none`;
  //eslint-disable-next-line functional/immutable-data
  videoEl.playsInline = true;
  //eslint-disable-next-line functional/immutable-data
  videoEl.muted = true;

  videoEl.classList.add(`ixfx-camera`);

  document.body.append(videoEl);

  //eslint-disable-next-line functional/no-let
  let stopVideo = () => {
    /* no-op */
  };

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
    return { videoEl, dispose };
  } catch (error) {
    // If it didn't work, delete the created element
    console.error(error);
    dispose();
    throw error;
  }
};

/**
 * Attempts to start a video-only stream from a camera into the designated VIDEO element.
 * @param videoEl
 * @param constraints
 * @returns Result contains videoEl and dispose function
 */
const startWithVideoEl = async (
  videoEl: HTMLVideoElement,
  constraints: Constraints = {}
): Promise<StartResult> => {
  if (videoEl === undefined) throw new Error(`videoEl undefined`);
  if (videoEl === null) throw new Error(`videoEl null`);

  const maxResolution = constraints.max;
  const minResolution = constraints.min;
  const idealResolution = constraints.ideal;

  // Setup constraints
  const c = {
    audio: false,
    video: {
      width: {},
      height: {},
    },
  };

  // Just in case some intuitive values are passed in...
  if ((constraints as any).facingMode === `front`) {
    constraints = { ...constraints, facingMode: `user` };
  }
  if ((constraints as any).facingMode === `back`) {
    constraints = { ...constraints, facingMode: `environment` };
  }

  if (constraints.facingMode) {
    //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
    (c.video as any).facingMode = constraints.facingMode;
  }

  if (constraints.deviceId) {
    //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
    (c.video as any).deviceId = constraints.deviceId;
  }

  if (idealResolution) {
    //eslint-disable-next-line functional/immutable-data
    c.video.width = {
      ...c.video.width,
      ideal: idealResolution.width,
    };
    //eslint-disable-next-line functional/immutable-data
    c.video.height = {
      ...c.video.height,
      ideal: idealResolution.height,
    };
  }

  if (maxResolution) {
    //eslint-disable-next-line functional/immutable-data
    c.video.width = {
      ...c.video.width,
      max: maxResolution.width,
    };
    //eslint-disable-next-line functional/immutable-data
    c.video.height = {
      ...c.video.height,
      max: maxResolution.height,
    };
  }

  if (minResolution) {
    //eslint-disable-next-line functional/immutable-data
    c.video.width = {
      ...c.video.width,
      min: minResolution.width,
    };
    //eslint-disable-next-line functional/immutable-data
    c.video.height = {
      ...c.video.height,
      min: minResolution.height,
    };
  }

  // Request stream
  const done = waitFor(
    constraints.startTimeoutMs ?? startTimeoutMs,
    (reason) => {
      throw new Error(`Camera getUserMedia failed: ${ reason }`);
    }
  );

  try {
    const stream = await navigator.mediaDevices.getUserMedia(c);

    // Clean-up function
    const dispose = () => {
      videoEl.pause();
      const t = stream.getTracks();
      for (const track of t) track.stop();
    };

    // Assign to VIDEO element
    //eslint-disable-next-line functional/immutable-data
    videoEl.srcObject = stream;
    done();

    const returnValue = { videoEl, dispose };
    const p = new Promise<StartResult>((resolve, reject) => {
      videoEl.addEventListener(`loadedmetadata`, () => {
        videoEl
          .play()
          .then(() => {
            resolve(returnValue);
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
    return p;
  } catch (error) {
    done(getErrorMessage(error));
    throw error;
  }
};
