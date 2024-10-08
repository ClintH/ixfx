import test from 'ava';

import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';
import { isApprox } from '../../../numbers/IsApprox.js';

test(`timeout-repeat`, async t => {
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
        t.fail(`Elapsed: ${ elapsed }`);
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
  t.is(values, 19);
});

test(`timeout-value-immediate`, async t => {
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
      t.true(isApprox(0.1, 150, elapsed), `Long time: ${ elapsed }`);
    } else {
      if (count > 1) { // First one can be a bit slow
        t.true(isApprox(0.1, 50, elapsed), `Short time: ${ elapsed }. Count: ${ count }`)
      }
    }
    t.is(value, hello ? `hello` : `goodbye`);
    count++;
    hello = !hello;
  });

  await Flow.sleep(1000);
  s1.dispose(`test`);
  t.true(r1.isDisposed());
});

test(`timeout-value-non-immediate`, async t => {
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
      t.true(isApprox(0.1, 150, elapsed), `Long time: ${ elapsed }. Count: ${ count }`);
    } else {
      // In non immediate case we expect a long initial wait
      if (count === 0) {
        t.true(isApprox(0.1, 220, elapsed), `Initial long time: ${ elapsed }. Count: ${ count }`);
      } else {
        t.true(isApprox(0.2, 50, elapsed), `Short time: ${ elapsed }. Count: ${ count }`)
      }
    }
    t.is(value, hello ? `hello` : `goodbye`);
    count++;
    hello = !hello;
  });

  await Flow.sleep(1000);
  s1.dispose(`test`);
  t.true(r1.isDisposed());
});
