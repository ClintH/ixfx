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

export type Constraints = {
  readonly facingMode?: `user`|`environment`,
  readonly max?:Rects.Rect,
  readonly min?:Rects.Rect
}

//eslint-disable-next-line functional/no-mixed-type
export type StartResult = {
  readonly dispose:() => void;
  readonly videoEl:HTMLVideoElement;
}
/**
 * Attempts to start a video-only stream from a camera into a hidden
 * VIDEO element for frame capture. The VIDEO element is created automatically.
 * 
 * 
 * ```
 * import { frames } from 'visual.js';
 * try 
 *  const { videoEl, dispose } = await start();
 *  for await (const frame of frames(videoEl)) {
 *   // Do something with pixels...
 *  }
 * } catch (ex) {
 *  console.error(`Video could not be started`);
 * }
 * ```
 * 
 * Be sure to call the dispose() function to stop the video stream and remove the created VIDEO element.
 * 
 * @param constraints 
 * @returns Returns `{ videoEl, dispose }`, where `videoEl` is the created VIDEO element, and `dispose` is a function for removing the element and stopping the video.
 */
export const start = async (constraints:Constraints = {}): Promise<StartResult|undefined> => {
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

  const facingMode = constraints.facingMode ?? `user`;
  const maxRes = constraints.max;
  const minRes = constraints.min;

  // Setup constraints
  const c = {
    audio: false,
    video: {
      facingMode,
      width: {},
      height: {}
    }
  };

  if (maxRes) {
    //eslint-disable-next-line functional/immutable-data
    c.video.width = {
      max: maxRes.width
    };
    //eslint-disable-next-line functional/immutable-data
    c.video.height = {
      max: maxRes.height
    };
  }
  if (minRes) {
    //eslint-disable-next-line functional/immutable-data
    c.video.width = {
      min: minRes.width
    };
    //eslint-disable-next-line functional/immutable-data
    c.video.height = {
      min: minRes.height
    };
  }

  // Clean-up function
  const dispose = () => {
    console.log(`Camera:dispose`);
    videoEl.pause();
    const t = stream.getTracks();
    t.forEach(track => track.stop());
  };

  // Request stream
  const stream = await navigator.mediaDevices.getUserMedia(c);

  // Assign to VIDEO element
  //eslint-disable-next-line functional/immutable-data
  videoEl.srcObject = stream;

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
};