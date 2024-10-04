import test, { type ExecutionContext } from "ava";
import { perSecond } from '../../modulation/source/PerSecond.js';
import * as Flow from '../../flow/index.js';
import { round } from "../../numbers/Round.js";
import * as Arrays from '../../data/arrays/index.js';
import { isApprox } from "../../numbers/IsApprox.js";

function arrayIsApprox(t: ExecutionContext, values: number[], baseValue: number, pc = 0.015) {
  for (const v of values) {
    t.true(isApprox(pc, baseValue, v), `baseValue: ${ baseValue } value: ${ v } pc: ${ pc }`);
  }

}
test(`per-second`, async t => {
  const r1 = perSecond(1000);
  const r1R = await Array.fromAsync(Flow.repeat(r1, { count: 4, delay: 100 }));
  arrayIsApprox(t, r1R, 100, 0.02);

  const r2 = perSecond(1000);
  const r2R = await Array.fromAsync(Flow.repeat(r2, { count: 2, delay: 500 }));
  arrayIsApprox(t, r2R, 500);

  // Overflow
  const r3 = perSecond(1000);
  const r4 = perSecond(1000, { clamp: true });

  await Flow.sleep(2000);
  const r3R = r3();
  t.true(isApprox(0.01, 2000, r3R), `v: ${ r3R }`);

  // Overflow clamped
  const r4R = r4();
  t.true(isApprox(0.01, 1000, r4R), `v: ${ r4R }`);

})