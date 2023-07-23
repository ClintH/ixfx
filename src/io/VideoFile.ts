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
 * Starts video file playback, creating a VIDEO element automatically.
 * @param file File
 * @returns StartResult
 */
export const start = async (file: File): Promise<StartResult> => {
  const videoEl = document.createElement(`VIDEO`) as HTMLVideoElement;
  //eslint-disable-next-line functional/immutable-data
  videoEl.style.display = `none`;
  //eslint-disable-next-line functional/immutable-data
  videoEl.playsInline = true;
  //eslint-disable-next-line functional/immutable-data
  videoEl.muted = true;

  videoEl.classList.add(`ixfx-video`);

  document.body.appendChild(videoEl);

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
    const r = await startWithVideoEl(videoEl, file);
    stopVideo = r.dispose;
    return { videoEl, dispose };
  } catch (ex) {
    // If it didn't work, delete the created element
    console.error(ex);
    dispose();
    throw ex;
  }
};

/**
 * Starts playback of a video file in the provided VIDEO element.
 * @param videoEl
 * @param file
 * @returns
 */
const startWithVideoEl = async (
  videoEl: HTMLVideoElement,
  file: File
): Promise<StartResult> => {
  if (videoEl === undefined) throw new Error(`videoEl undefined`);
  if (videoEl === null) throw new Error(`videoEl null`);

  const url = URL.createObjectURL(file);

  //eslint-disable-next-line functional/immutable-data
  videoEl.src = url;
  //eslint-disable-next-line functional/immutable-data
  videoEl.loop = true;

  // Clean-up function
  const dispose = () => {
    videoEl.pause();
  };

  const ret = { videoEl, dispose };
  const p = new Promise<StartResult>((resolve, reject) => {
    videoEl.addEventListener(`loadedmetadata`, () => {
      videoEl
        .play()
        .then(() => {
          resolve(ret);
        })
        .catch((ex) => {
          reject(ex);
        });
    });
  });
  return p;
};
