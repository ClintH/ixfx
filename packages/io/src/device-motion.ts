import { wave, jitter } from '@ixfx/modulation';

export type MotionData = {
  accel: { x: number, y: number, z: number }
  accelGrav: { x: number, y: number, z: number }
  rotRate: { alpha: number, beta: number, gamma: number }
  faked: boolean
}

export type MotionHandler = (data: MotionData) => void

const getXyz = (d: DeviceMotionEventAcceleration | null, fallback = 0) => {
  if (!d) return { x: fallback, y: fallback, z: fallback };
  return {
    x: d.x ?? fallback,
    y: d.y ?? fallback,
    z: d.z ?? fallback
  };
};

const getAbg = (d: DeviceMotionEventRotationRate | null, fallback = 0) => {
  if (!d) return { alpha: fallback, beta: fallback, gamma: fallback };
  return {
    alpha: d.alpha ?? fallback,
    beta: d.beta ?? fallback,
    gamma: d.gamma ?? fallback
  };
};

let fakeRunning = false;

const startFake = (handler: MotionHandler) => {
  if (fakeRunning) return;
  console.log(` --- using fake motion data ---`);
  fakeRunning = true;

  const w1 = wave({ secs: 2, shape: `sine` });
  const w2 = wave({ secs: 1.5, shape: `sine` });
  const w3 = wave({ secs: 3, shape: `sine` });
  const index1 = jitter({ relative: 0.1, clamped: true });
  const index2 = jitter({ relative: 0.2, clamped: true });
  const index3 = jitter({ relative: 0.4, clamped: true });

  setInterval(() => {
    handler({
      faked: true,
      accel: {
        x: w1(),
        y: w2(),
        z: w3()
      },
      accelGrav: {
        x: index1(1 - w1()),
        y: index2(1 - w2()),
        z: index3(1 - w3())
      }, rotRate: {
        alpha: Math.random(),
        beta: Math.random(),
        gamma: Math.random()
      }
    });
  }, 200);
};

/**
 * Listen for 'devicemotion' events. 
 * 
 * By default, trows an error if unsupported or permission was not granted.
 * However, if `useFakeDataAsFallback` is _true_, it will send back random data every 200ms instead.
 * 
 * Data is sent to `handler`.
 * 
 *
 * @param handler 
 * @param useFakeDataAsFallback If true, fake data will be generated and returned if the event could not be subscribed to.
 * @returns 
 */
export const listen = async (handler: MotionHandler, useFakeDataAsFallback = false): Promise<void> => {
  if (typeof DeviceMotionEvent === `undefined`) {
    console.log(`DeviceMotionEvent unavailable`);
    if (useFakeDataAsFallback) startFake(handler);
    return;
  }


  const onMotion = (event: DeviceMotionEvent) => {
    if (event.acceleration?.x === null && event.acceleration?.y === null && event.acceleration.z === null) {
      console.log(`Warning: devicemotion data empty. Device maybe doesn't have sensors?`);
      if (useFakeDataAsFallback) startFake(handler);
    }
    handler({
      accel: getXyz(event.acceleration),
      accelGrav: getXyz(event.accelerationIncludingGravity),
      rotRate: getAbg(event.rotationRate),
      faked: false
    });
  };

  if (typeof DeviceMotionEvent === `undefined`) {
    if (useFakeDataAsFallback) startFake(handler);
    throw new TypeError(`DeviceMotionEvent unavailable. Not loaded in secure context?`);
  }

  if (typeof (DeviceMotionEvent as any).requestPermission === `function`) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const p = await (DeviceMotionEvent as any).requestPermission();
    if (p === `granted`) {
      window.addEventListener(`devicemotion`, onMotion);
    } else {
      if (useFakeDataAsFallback) startFake(handler);
      throw new Error(`Permission denied when listening for devicemotion events`);
    }
  } else {
    window.addEventListener(`devicemotion`, onMotion);
  }
};
