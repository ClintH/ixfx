import expect from 'expect';
import * as Mod from '../../modulation/index.js';
import * as Flow from '../../flow/index.js';
import { round } from "../../numbers/Round.js";
import * as Arrays from '../../data/arrays/index.js';

test(`ticks-exclusive`, () => {
  const s1 = Mod.Sources.ticks(10);
  const s1Results = Array.from(Flow.repeatSync(() => s1(), { count: 12 }));
  expect(s1Results).toEqual([ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 0 ]);

  const s2 = Mod.Sources.ticks(10, { exclusiveEnd: true });
  const s2Results = Array.from(Flow.repeatSync(() => s2(), { count: 12 }));
  expect(s2Results).toEqual([ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0, 0.1 ]);

  const s3 = Mod.Sources.ticks(10, { exclusiveStart: true });
  const s3Results = Array.from(Flow.repeatSync(() => s3(), { count: 12 }));
  expect(s3Results).toEqual([ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 0.1, 0.2 ]);

  const s4 = Mod.Sources.ticks(10, { exclusiveStart: true, exclusiveEnd: true });
  const s4Results = Array.from(Flow.repeatSync(() => s4(), { count: 12 }));
  expect(s4Results).toEqual([ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3 ]);
});

test(`ticks`, () => {
  // oneShot
  const s1 = Mod.Sources.ticks(5, { cycleLimit: 1 });
  const s1Results = Array.from(Flow.repeatSync(() => s1(), { count: 10 }));
  expect(s1Results).toEqual([ 0, 0.2, 0.4, 0.6, 0.8, 1, 1, 1, 1, 1 ]);

  // startAt
  const s2 = Mod.Sources.ticks(5, { startAt: 3 });
  const s2Results = Array.from(Flow.repeatSync(() => s2(), { count: 10 }));
  expect(s2Results).toEqual([ 0.6, 0.8, 1, 0, 0.2, 0.4, 0.6, 0.8, 1, 0 ]);

  // startAtRelative
  const s3 = Mod.Sources.ticks(5, { startAtRelative: 0.5 });
  const s3Results = Array.from(Flow.repeatSync(() => s3(), { count: 10 }));
  expect(s3Results).toEqual([ 0.6, 0.8, 1, 0, 0.2, 0.4, 0.6, 0.8, 1, 0 ]);

  // startAtRelative and exclusiveStart
  const s4 = Mod.Sources.ticks(5, { startAtRelative: 0.5, exclusiveStart: true });
  const s4Results = Array.from(Flow.repeatSync(() => s4(), { count: 10 }));
  expect(s4Results).toEqual([ 0.4, 0.6, 0.8, 1, 0.2, 0.4, 0.6, 0.8, 1, 0.2 ]);

  // startAtRelative, exclusiveStart and exclusiveEnd
  const s5 = Mod.Sources.ticks(5, { startAtRelative: 0.5, exclusiveStart: true, exclusiveEnd: true });
  const s5Results = Array.from(Flow.repeatSync(() => s5(), { count: 10 }));
  expect(s5Results).toEqual([ 0.4, 0.6, 0.8, 0.2, 0.4, 0.6, 0.8, 0.2, 0.4, 0.6 ]);
});

test(`elapsed`, async () => {
  const s1 = Mod.Sources.elapsed(500);
  const s1Results = await Array.fromAsync(Flow.repeat(async () => {
    await Flow.sleep(100);
    return round(1, s1())
  }, { count: 10 }));
  expect(s1Results).toEqual([ 0.2, 0.4, 0.6, 0.8, 0, 0.2, 0.4, 0.6, 0.8, 0 ]);

  // oneShot
  const s2 = Mod.Sources.elapsed(500, { cycleLimit: 1 });
  const s2Results = await Array.fromAsync(Flow.repeatSync(async () => {
    await Flow.sleep(100);
    return round(1, s2())
  }, { count: 10 }));
  expect(s2Results).toEqual([ 0.2, 0.4, 0.6, 0.8, 1, 1, 1, 1, 1, 1 ]);

  // startAt
  const s3 = Mod.Sources.elapsed(500, { startAt: performance.now() - 250 });
  const s3x = Flow.repeat(async () => {
    await Flow.sleep(100);
    return round(1, s3())
  }, { count: 10 });
  const s3Results = await Array.fromAsync(s3x);
  const s3a = Arrays.isEqual(s3Results, [ 0.7, 0.9, 0.1, 0.3, 0.5, 0.7, 0.9, 0.1, 0.3, 0.5 ]);
  const s3b = Arrays.isEqual(s3Results, [ 0.7, 0.9, 0.1, 0.2, 0.4, 0.6, 0.8, 0, 0.2, 0.4 ]);
  //console.log(s3Results);
  expect(s3a || s3b).toBe(true);

  // startAtRelative
  const s4 = Mod.Sources.elapsed(500, { startAtRelative: 0.5 });
  const s4x = Flow.repeat(async () => {
    await Flow.sleep(100);
    const value = round(1, s4());
    return value;
  }, { count: 10 });

  const s4Results = await Array.fromAsync(s4x);

  const s4a = Arrays.isEqual(s4Results, [ 0.7, 0.9, 0.1, 0.3, 0.5, 0.7, 0.9, 0.1, 0.3, 0.5 ]);
  const s4b = Arrays.isEqual(s4Results, [ 0.7, 0.9, 0.1, 0.2, 0.4, 0.6, 0.8, 0, 0.2, 0.4 ]);
  //console.log(s4Results);
  expect(s4a || s4b).toBe(true);

});