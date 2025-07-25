import { test, expect } from 'vitest';
import * as Modulation from '../../src/index.js';
import * as Flow from '@ixfx/flow';

test(`ticks-exclusive`, () => {
  const s1 = Modulation.Sources.ticks(10);
  const s1Results = Array.from(Flow.repeatSync(() => s1(), { count: 12 }));
  expect(s1Results).toEqual([ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 0 ]);

  const s2 = Modulation.Sources.ticks(10, { exclusiveEnd: true });
  const s2Results = Array.from(Flow.repeatSync(() => s2(), { count: 12 }));
  expect(s2Results).toEqual([ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0, 0.1 ]);

  const s3 = Modulation.Sources.ticks(10, { exclusiveStart: true });
  const s3Results = Array.from(Flow.repeatSync(() => s3(), { count: 12 }));
  expect(s3Results).toEqual([ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 0.1, 0.2 ]);

  const s4 = Modulation.Sources.ticks(10, { exclusiveStart: true, exclusiveEnd: true });
  const s4Results = Array.from(Flow.repeatSync(() => s4(), { count: 12 }));
  expect(s4Results).toEqual([ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3 ]);
});

test(`ticks`, () => {
  // oneShot
  const s1 = Modulation.Sources.ticks(5, { cycleLimit: 1 });
  const s1Results = Array.from(Flow.repeatSync(() => s1(), { count: 10 }));
  expect(s1Results).toEqual([ 0, 0.2, 0.4, 0.6, 0.8, 1, 1, 1, 1, 1 ]);

  // startAt
  const s2 = Modulation.Sources.ticks(5, { startAt: 3 });
  const s2Results = Array.from(Flow.repeatSync(() => s2(), { count: 10 }));
  expect(s2Results).toEqual([ 0.6, 0.8, 1, 0, 0.2, 0.4, 0.6, 0.8, 1, 0 ]);

  // startAtRelative
  const s3 = Modulation.Sources.ticks(5, { startAtRelative: 0.5 });
  const s3Results = Array.from(Flow.repeatSync(() => s3(), { count: 10 }));
  expect(s3Results).toEqual([ 0.6, 0.8, 1, 0, 0.2, 0.4, 0.6, 0.8, 1, 0 ]);

  // startAtRelative and exclusiveStart
  const s4 = Modulation.Sources.ticks(5, { startAtRelative: 0.5, exclusiveStart: true });
  const s4Results = Array.from(Flow.repeatSync(() => s4(), { count: 10 }));
  expect(s4Results).toEqual([ 0.4, 0.6, 0.8, 1, 0.2, 0.4, 0.6, 0.8, 1, 0.2 ]);

  // startAtRelative, exclusiveStart and exclusiveEnd
  const s5 = Modulation.Sources.ticks(5, { startAtRelative: 0.5, exclusiveStart: true, exclusiveEnd: true });
  const s5Results = Array.from(Flow.repeatSync(() => s5(), { count: 10 }));
  expect(s5Results).toEqual([ 0.4, 0.6, 0.8, 0.2, 0.4, 0.6, 0.8, 0.2, 0.4, 0.6 ]);
});

