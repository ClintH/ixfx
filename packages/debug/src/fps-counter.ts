/**
 * Calculates frames per second.
 * 
 * Returns a function which needs to be called at the end of each frame.
 * 
 * ```js
 * const fps = fpsCounter();
 * 
 * function loop() {
 *  fps(); // Calculate fps
 *  window.requestAnimationFrame(loop);
 * }
 * 
 * loop();
 * ```
 * @param autoDisplay If true (default), prints out the FPS to the console
 * @param computeAfterFrames Calculates after this many frames. Higher numbers smoothes the value somewhat
 * @returns 
 */
export const fpsCounter = (autoDisplay = true, computeAfterFrames = 500): () => number => {
  let count = 0;
  let lastFps = 0;
  let countStart = performance.now();

  return () => {
    if (count++ >= computeAfterFrames) {
      const elapsed = performance.now() - countStart;
      countStart = performance.now();
      count = 0;
      lastFps = Math.floor((computeAfterFrames / elapsed) * 1000);
      if (autoDisplay) console.log(`fps: ${ lastFps }`);
    }
    return lastFps
  }
}