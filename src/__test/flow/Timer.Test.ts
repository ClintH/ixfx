import expect from 'expect';
import * as Timer from '../../flow/Timer.js';
import { sleep } from '../../flow/Sleep.js';
import { isApprox } from '../../numbers/IsApprox.js';
import { round } from '../../numbers/Round.js';
import * as Flow from '../../flow/index.js';

test(`of-total`, async () => {
  const r1 = Timer.ofTotal(500, { clampValue: false });
  let since = Flow.Elapsed.since();
  for (let i = 0; i < 10; i++) {
    const v = r1();
    if (since() >= 500) {
      // if total time has elapsed, expect r1() to be above 1
      expect(v > 1).toBe(true);
    } else {
      // if total time hasn't elapsed, expect it to be below
      expect(v < 1).toBe(true);
    }
    await Flow.sleep(100);
  }

  const r2 = Timer.ofTotal(500, { clampValue: true });
  since = Flow.Elapsed.since();
  for (let i = 0; i < 10; i++) {
    const v = r2();
    if (since() >= 500) {
      // if total time has elapsed, expect r2() to be above 1
      expect(v).toBe(1);
    } else {
      // if total time hasn't elapsed, expect it to be below
      expect(v < 1).toBe(true);
    }
    await Flow.sleep(100);
  }

  const r3 = Timer.ofTotal(500, { wrapValue: true });
  since = Flow.Elapsed.since();
  let v2 = 0;
  for (let i = 1; i < 7; i++) {
    const v1 = round(4, r3());
    expect(isApprox(0.15, v2, v1)).toBe(true);
    await Flow.sleep(100);
    v2 += 0.2;
    // Wrapping point
    if (i === 5) v2 = 0;
  }

  const r4 = Timer.ofTotal(500, { wrapValue: false, clampValue: true });
  since = Flow.Elapsed.since();
  let v3 = 0;
  for (let i = 1; i < 15; i++) {
    const v1 = round(2, r4());
    if (since() >= 500) {
      expect(v1).toBe(1);
    } else {
      expect(isApprox(0.01, v3, v1)).toBe(true);
    }
    await Flow.sleep(100);
    v3 += 0.2;
  }
});

test('of-total-ticks', async () => {
  let totalTicks = 100;
  const r1 = Timer.ofTotalTicks(totalTicks, { clampValue: false, wrapValue: false });
  for (let i = 1; i < 100; i++) {
    const v1 = r1();
    const v2 = i / 100;
    expect(v1).toBe(v2);
  }

  // clamp:false
  for (let i = 0; i < 30; i++) {
    const v1 = round(3, r1());
    const v2 = round(3, 1 + (i / totalTicks));
    expect(v1).toBe(v2);
  }

  totalTicks = 10;
  const r2 = Timer.ofTotalTicks(totalTicks, { clampValue: true });
  // Burn through total
  for (let i = 0; i < totalTicks; i++) r2();
  for (let i = 1; i < (totalTicks * 2); i++) {
    // Expect to return 1 since clampValue:true
    expect(r2()).toBe(1);
  }

  totalTicks = 10;
  const r3 = Timer.ofTotalTicks(totalTicks, { wrapValue: true });
  // Burn through total
  for (let i = 0; i < totalTicks; i++) r3();
  // Next call should wrap
  for (let i = 1; i < totalTicks; i++) {
    let v1 = round(5, r3());
    const v2 = i / 10;

    // Let value be a bit off due to rounding
    expect(isApprox(0.001, v2, v1)).toBe(true);
  }

});