import test from 'ava';
import * as Rx from '../../rx/index.js';
import * as Flow from '../../flow/index.js';
import { isApproximately, count } from '../../numbers/index.js';
import * as Iter from '../../iterables/index.js';
import { interval } from '../../flow/index.js';

// const r = Rx.object({ name: `bob`, level: 2 });
// r.on(value => {
//   // reactive value has been changed
// });
// r.onDiff(changes => {
//   // or handle just the set of changed fields
// })

// // ...somewhere else
// // apply partial update, eg:
// r.update({ name: `jane ` })
// // set a field
// r.updateField(`level`, 3);
// // update whole object and let it take care of figuring out changeset
// r.set({ name: `barry`, level: 4 });

// const source = Rx.event(window, `pointermove`);
// let t = Rx.throttle(source, { elapsed: 100 })
// t = Rx.field(t, `button`);
// t.on(value => {
//   // button id
// })

// test(`rx-run`, async t => {
//   const r = Rx.run(
//     // Produce a random number
//     Rx.fromFunction(Math.random, { interval: 10 }),
//     // Scale to 0,1
//     Rx.Ops.transform(v => Math.floor(v * 2))
//   );
//   const off = r.value(value => {
//     console.log(value);
//   });
//   await Flow.sleep(1000);
//   off();
// });


test(`rx-manual`, t => {
  const v = Rx.manual();
  t.plan(1);
  v.on(msg => {
    t.deepEqual(msg.value, `hello`);
  });
  v.set(`hello`);
});








