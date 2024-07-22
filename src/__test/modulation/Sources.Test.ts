import test from "ava";
import * as Mod from '../../modulation/index.js';
import * as Flow from '../../flow/index.js';
import { round } from "../../numbers/Round.js";
import * as Arrays from '../../data/arrays/index.js';

test(`ticks-exclusive`, t => {
  const s1 = Mod.Sources.ticks(10);
  const s1Results = [ ...Flow.repeat(12, () => s1()) ];
  t.deepEqual(s1Results, [ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 0 ]);

  const s2 = Mod.Sources.ticks(10, { exclusiveEnd: true });
  const s2Results = [ ...Flow.repeat(12, () => s2()) ];
  t.deepEqual(s2Results, [ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0, 0.1 ]);

  const s3 = Mod.Sources.ticks(10, { exclusiveStart: true });
  const s3Results = [ ...Flow.repeat(12, () => s3()) ];
  t.deepEqual(s3Results, [ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 0.1, 0.2 ]);

  const s4 = Mod.Sources.ticks(10, { exclusiveStart: true, exclusiveEnd: true });
  const s4Results = [ ...Flow.repeat(12, () => s4()) ];
  t.deepEqual(s4Results, [ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3 ]);
});

test(`ticks`, t => {
  // oneShot
  const s1 = Mod.Sources.ticks(5, { cycleLimit: 1 });
  const s1Results = [ ...Flow.repeat(10, () => s1()) ];
  t.deepEqual(s1Results, [ 0, 0.2, 0.4, 0.6, 0.8, 1, 1, 1, 1, 1 ]);

  // startAt
  const s2 = Mod.Sources.ticks(5, { startAt: 3 });
  const s2Results = [ ...Flow.repeat(10, () => s2()) ];
  t.deepEqual(s2Results, [ 0.6, 0.8, 1, 0, 0.2, 0.4, 0.6, 0.8, 1, 0 ]);

  // startAtRelative
  const s3 = Mod.Sources.ticks(5, { startAtRelative: 0.5 });
  const s3Results = [ ...Flow.repeat(10, () => s3()) ];
  t.deepEqual(s3Results, [ 0.6, 0.8, 1, 0, 0.2, 0.4, 0.6, 0.8, 1, 0 ]);

  // startAtRelative and exclusiveStart
  const s4 = Mod.Sources.ticks(5, { startAtRelative: 0.5, exclusiveStart: true });
  const s4Results = [ ...Flow.repeat(10, () => s4()) ];
  t.deepEqual(s4Results, [ 0.4, 0.6, 0.8, 1, 0.2, 0.4, 0.6, 0.8, 1, 0.2 ]);

  // startAtRelative, exclusiveStart and exclusiveEnd
  const s5 = Mod.Sources.ticks(5, { startAtRelative: 0.5, exclusiveStart: true, exclusiveEnd: true });
  const s5Results = [ ...Flow.repeat(10, () => s5()) ];
  t.deepEqual(s5Results, [ 0.4, 0.6, 0.8, 0.2, 0.4, 0.6, 0.8, 0.2, 0.4, 0.6 ]);
});

test(`elapsed`, async t => {
  const s1 = Mod.Sources.elapsed(500);
  const s1Results = await Array.fromAsync(Flow.repeatAwait(10, async () => {
    await Flow.sleep(100);
    return round(1, s1())
  }));
  t.deepEqual(s1Results, [ 0.2, 0.4, 0.6, 0.8, 0, 0.2, 0.4, 0.6, 0.8, 0 ]);

  // oneShot
  const s2 = Mod.Sources.elapsed(500, { cycleLimit: 1 });
  const s2Results = await Array.fromAsync(Flow.repeatAwait(10, async () => {
    await Flow.sleep(100);
    return round(1, s2())
  }));
  t.deepEqual(s2Results, [ 0.2, 0.4, 0.6, 0.8, 1, 1, 1, 1, 1, 1 ]);

  // startAt
  const s3 = Mod.Sources.elapsed(500, { startAt: performance.now() - 250 });
  const s3Results = await Array.fromAsync(Flow.repeatAwait(10, async () => {
    await Flow.sleep(100);
    return round(1, s3())
  }));
  const s3a = Arrays.isEqual(s3Results, [ 0.7, 0.9, 0.1, 0.3, 0.5, 0.7, 0.9, 0.1, 0.3, 0.5 ]);
  const s3b = Arrays.isEqual(s3Results, [ 0.7, 0.9, 0.1, 0.2, 0.4, 0.6, 0.8, 0, 0.2, 0.4 ]);
  //console.log(s3Results);
  t.true(s3a || s3b);

  // startAtRelative
  const s4 = Mod.Sources.elapsed(500, { startAtRelative: 0.5 });
  const s4Results = await Array.fromAsync(Flow.repeatAwait(10, async () => {
    await Flow.sleep(100);
    return round(1, s4())
  }));

  const s4a = Arrays.isEqual(s4Results, [ 0.7, 0.9, 0.1, 0.3, 0.5, 0.7, 0.9, 0.1, 0.3, 0.5 ]);
  const s4b = Arrays.isEqual(s4Results, [ 0.7, 0.9, 0.1, 0.2, 0.4, 0.6, 0.8, 0, 0.2, 0.4 ]);
  //console.log(s4Results);
  t.true(s4a || s4b);

});