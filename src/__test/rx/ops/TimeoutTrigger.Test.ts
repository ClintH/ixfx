import expect from 'expect';

import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';
import { isApprox } from '../../../numbers/IsApprox.js';

test(`timeout-repeat`, async done => {
  // Emit 'goodbye' every 1s
  const s1 = Rx.From.func(() => 'goodbye', { interval: { secs: 2 } });
  const time = Flow.Elapsed.interval();

  let values = 0;
  const r1 = Rx.timeoutValue(s1, {
    interval: 50,
    repeat: true,
    fn() {
      const elapsed = time();
      const ok = isApprox(0.1, 50, elapsed);
      if (!ok && !r1.isDisposed()) {
        done.fail(`Elapsed: ${ elapsed }`);
      }
      return `hello`
    }
  });
  r1.onValue(v => {
    values++;
  });

  await Flow.sleep(1000);
  r1.dispose(`test`);
  // Expect 19 values
  expect(values).toBe(19);
});

test(`timeout-value-immediate`, async () => {
  // Emit 'goodbye' every 200ms
  const s1 = Rx.From.func(() => 'goodbye', { interval: 200 });

  // Emit 'hello' if we don't get anything from s1 after 150ms
  const r1 = Rx.timeoutValue(s1, { value: 'hello', interval: 150, immediate: true });
  const time = Flow.Elapsed.interval();
  let count = 0;
  let hello = true;
  r1.onValue(value => {
    const elapsed = time();
    if (hello) {
      expect(isApprox(0.1, 150, elapsed)).toBe(true);
    } else {
      if (count > 1) { // First one can be a bit slow
        expect(isApprox(0.1, 50, elapsed)).toBe(true)
      }
    }
    expect(value).toBe(hello ? `hello` : `goodbye`);
    count++;
    hello = !hello;
  });

  await Flow.sleep(1000);
  s1.dispose(`test`);
  expect(r1.isDisposed()).toBe(true);
});

test(`timeout-value-non-immediate`, async () => {
  // Emit 'goodbye' every 200ms
  const s1 = Rx.From.func(() => 'goodbye', { interval: 200 });
  // Emit 'hello' if we don't get anything from s1 after 150ms
  const r1 = Rx.timeoutValue(s1, { fn: () => 'hello', interval: 150, immediate: false });
  const time = Flow.Elapsed.interval();
  let count = 0;
  let hello = false;
  r1.onValue(value => {
    const elapsed = time();
    if (hello) {
      expect(isApprox(0.1, 150, elapsed)).toBe(true);
    } else {
      // In non immediate case we expect a long initial wait
      if (count === 0) {
        expect(isApprox(0.1, 220, elapsed)).toBe(true);
      } else {
        expect(isApprox(0.2, 50, elapsed)).toBe(true)
      }
    }
    expect(value).toBe(hello ? `hello` : `goodbye`);
    count++;
    hello = !hello;
  });

  await Flow.sleep(1000);
  s1.dispose(`test`);
  expect(r1.isDisposed()).toBe(true);
});
