/**
 * Demonstates starting a video stream, doing some basic pixel manipulation and
 * drawing the result to a canvas
 * 
 * This technique works well if you only want to show processed pixels, and the
 * output matches the input dimensions.
 */
import {Camera} from '../../../dist/io.js';
import {Video} from '../../../dist/visual.js';
import {intervalTracker} from '../../../dist/temporal.js';

const settings = {
  canvasEl: document.getElementById(`canvas`),
  frameIntervalTracker: intervalTracker(`fps`, 100)
}

let state = {
  fps: 0
}

const update = () => {
  const {frameIntervalTracker} = settings;
  frameIntervalTracker.mark();
  state = {
    ...state,
    fps: Math.round(1000 / frameIntervalTracker.avg)
  }
}

const startVideo = async () => {
  const {canvasEl} = settings;
  const {videoEl, dispose} = await Camera.start();
  const ctx = canvasEl.getContext(`2d`);
  canvasEl.width = videoEl.videoWidth;
  canvasEl.height = videoEl.videoHeight;
  try {
    for await (const frame of Video.frames(videoEl, {canvasEl})) {
      update();

      // TODO: Some processing of pixels

      // Since we passed in a canvas to frames(), it will automatically get the
      // latest video frame drawn to it.

      // Now we can just draw on top...

      // Or if we want, we could manipulate the pixels in `frame`, and
      // then draw it to the canvas with `putImageData`:
      ctx.putImageData(frame, 0, 0);

      ctx.fillText(`FPS: ${state.fps}`, 10, 10);

      // If the intention is to repaint the whole canvas, it is better to
      // not give frames() a canvas, but rather let it create its own.
      // This avoids visual clashes.
    }
  } catch (ex) {
    console.error(ex);
    dispose();
  }
}

const setup = () => {
  document.getElementById(`btnStart`).addEventListener(`click`, async () => {
    try {
      await startVideo();
    } catch (ex) {
      console.error(`Could not start video`);
      console.error(ex);
    }
  });
}
setup();
