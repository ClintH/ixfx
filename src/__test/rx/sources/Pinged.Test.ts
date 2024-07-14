import test from "ava";

import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';
test(`basic`, async t => {
  const counter = Rx.From.number(0);
  const isEven = Rx.From.pinged(counter, value => (value & 1) == 0);

  const results: boolean[] = [];
  isEven.onValue(v => {
    //console.log(`isEven: ${ v }`);
    results.push(v);
  })
  for (let i = 0; i < 10; i++) {
    //console.log(`set: ${ i }`);
    counter.set(i);
    await Flow.sleep(10);
  }
  t.deepEqual(results, [ false, true, false, true, false, true, false, true, false ]);
});