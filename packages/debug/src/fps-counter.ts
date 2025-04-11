export const fpsCounter = (autoDisplay = true, computeAfterFrames = 500) => {
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