import test from 'ava';

import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';
import { count } from '../../../numbers/Count.js';
import { isApproximately } from '../../../numbers/IsApproximately.js';
test(`timeout-value-immediate`, async t => {
  // Emit 'a' every 100ms
  const s1 = Rx.From.func(() => 'goodbye', { interval: 200 });
  // Emit 'hello' if we don't get anything from s1 after 150ms
  const r1 = Rx.timeoutTrigger(s1, { value: 'hello', interval: 150, immediate: true });
  const time = Flow.Elapsed.interval();
  let count = 0;
  let hello = true;
  r1.value(value => {
    const elapsed = time();
    if (hello) {
      t.true(isApproximately(150, 0.1, elapsed), `Long time: ${ elapsed }`);
    } else {
      if (count > 1) { // First one can be a bit slow
        t.true(isApproximately(50, 0.1, elapsed), `Short time: ${ elapsed }. Count: ${ count }`)
      }
    }
    t.is(value, hello ? `hello` : `goodbye`);
    count++;
    hello = !hello;
  });

  await Flow.sleep(1000);
  s1.dispose(`test`);
  if (Rx.isDisposable(r1)) {
    t.true(r1.isDisposed());
  }
});

test(`timeout-value-non-immediate`, async t => {
  // Emit 'a' every 100ms
  const s1 = Rx.From.func(() => 'goodbye', { interval: 200 });
  // Emit 'hello' if we don't get anything from s1 after 150ms
  const r1 = Rx.timeoutTrigger(s1, { fn: () => 'hello', interval: 150, immediate: false });
  const time = Flow.Elapsed.interval();
  let count = 0;
  let hello = false;
  r1.value(value => {
    const elapsed = time();
    if (hello) {
      t.true(isApproximately(150, 0.1, elapsed), `Long time: ${ elapsed }. Count: ${ count }`);
    } else {
      // In non immediate case we expect a long initial wait
      if (count === 0) {
        t.true(isApproximately(220, 0.1, elapsed), `Initial long time: ${ elapsed }. Count: ${ count }`);
      } else {
        t.true(isApproximately(50, 0.1, elapsed), `Short time: ${ elapsed }. Count: ${ count }`)
      }
    }
    t.is(value, hello ? `hello` : `goodbye`);
    count++;
    hello = !hello;
  });

  await Flow.sleep(1000);
  s1.dispose(`test`);
  if (Rx.isDisposable(r1)) {
    t.true(r1.isDisposed());
  }
});
