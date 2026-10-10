import type { Timer } from '@ixfx/flow';
import { expect, it } from 'vitest';
import * as Envelopes from '../src/envelope.js';

// Controllable clock injected via the `timeSource` option: makes the
// envelope's stage timing fully deterministic (no real sleeping).
function clock() {
  let now = 0;
  let epoch = 0;
  return {
    now: () => now,
    advance: (ms: number) => {
      now += ms;
    },
    timerSource: (): Timer => ({
      reset: () => {
        epoch = now;
      },
      get elapsed() {
        return now - epoch;
      },
    }),
  };
}

it(`as-iterator`, () => {
  const c = clock();
  const e = new Envelopes.Adsr({
    attackDuration: 100,
    decayDuration: 100,
    releaseDuration: 100,
    timeSource: c.timerSource,
  });
  e.trigger();

  const order: string[] = [];
  let guard = 0;
  while (!e.isDone && guard++ < 100) {
    c.advance(10);
    const [state] = e.compute();
    if (state !== undefined && state !== order.at(-1))
      order.push(state);
  }

  expect(e.isDone).toBe(true);
  // Three stages of 100ms of envelope time. The state machine flips to
  // 'complete' on the sample after elapsed strictly exceeds the final
  // stage boundary, hence 300 + 2 x 10ms sampling.
  expect(c.now()).toBe(320);
  expect(order[0]).toBe(`attack`);
  expect(order).toContain(`decay`);
  expect(order).toContain(`release`);
  expect(order.at(-1)).toBe(`complete`);
});

it(`as-function`, () => {
  const c = clock();
  const e = Envelopes.adsr({
    attackDuration: 300,
    decayDuration: 300,
    releaseDuration: 300,
    releaseLevel: 0,
    initialLevel: 0.1,
    sustainLevel: 1,
    timeSource: c.timerSource,
  });

  // Sample every 100ms of envelope time until the envelope completes
  // (releaseLevel of 0 signals completion)
  let samples = 0;
  let value = Number.NaN;
  while (value !== 0 && samples++ < 100) {
    c.advance(100);
    value = e();
  }
  expect(value).toBe(0);
  // Trigger happens on first call (t=100), then 3 x 300ms stages
  expect(c.now()).toBe(1000);
});

// Smoke test for the default wall-clock time source (no injection)
it(`real-timer smoke`, async () => {
  const e = new Envelopes.Adsr({
    attackDuration: 20,
    decayDuration: 10,
    releaseDuration: 10,
  });
  e.trigger();
  await new Promise(resolve => setTimeout(resolve, 30));
  const [state] = e.compute();
  expect(state).not.toBe(`attack`);
  expect(e.isDone).toBe(false);
});
