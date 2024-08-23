import test from "ava";

import * as Rx from '../../rx/index.js';
import * as Flow from '../../flow/index.js';
test(`basic`, async t => {
  const counter = Rx.From.number(0);
  let x = 100;
  const target = Rx.From.func(() => {
    return x++;
  })

  const vtp = Rx.valueToPing(counter, target);
  const vtpValues: number[] = [];
  vtp.onValue(v => {
    vtpValues.push(v);
  })

  for (let i = 0; i < 5; i++) {
    counter.set(i);
    await Flow.sleep(10);
  }
  // Set 5 values, expect 5 values triggered
  t.deepEqual(vtpValues, [ 100, 101, 102, 103, 104 ]);
});

test(`signal`, async t => {
  const counter = Rx.From.number(0);
  const ac = new AbortController();

  let x = 100;
  const target = Rx.From.func(() => {
    return x++;
  })

  const vtp = Rx.valueToPing(counter, target, { signal: ac.signal });
  const vtpValues: number[] = [];
  vtp.onValue(v => {
    vtpValues.push(v);
    if (vtpValues.length === 5) ac.abort(`Test`);
  })

  for (let i = 0; i < 10; i++) {
    counter.set(i);
    await Flow.sleep(10);

  }
  // Set 5 values, expect 5 values triggered
  t.deepEqual(vtpValues, [ 100, 101, 102, 103, 104 ]);
});


test(`gated`, async t => {
  const counter = Rx.From.number(0);
  let x = 100;
  const target = Rx.From.func(() => {
    return x++;
  })

  const vtp = Rx.valueToPing(counter, target, { gate: (v) => v % 2 === 0 });
  const vtpValues: number[] = [];
  vtp.onValue(v => {
    vtpValues.push(v);
  })

  for (let i = 0; i < 10; i++) {
    counter.set(i);
    await Flow.sleep(10);
  }
  // Expect only 5 entries even though we set 10 values since we gate based on odd/even
  t.deepEqual(vtpValues, [ 100, 101, 102, 103, 104 ]);
});