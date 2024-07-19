import * as Rx from '../../../dist/rx.js';
import * as Flow from '../../../dist/flow.js';
import { Elapsed } from '../../../dist/flow.js';
import * as Numbers from '../../../dist/numbers.js';
import * as Data from '../../../dist/data.js';

const state = {
  rpm: 0,
  text: `s_orig1`,
  sub: {
    name: `s_orig2`
  },
  missing: false
}
const m = Data.magic(state, {
  sub: {
    name: () => `random:${Math.random()}`
  }
});
m.update({ sub: { name:`hello` } });

// const updaters = {
//   rpm: () => Math.random(),
//   text: () => `1`,
// }

// const r = Data.reactiveUpdate(state, updaters);

// r.onDiff(diff => {
//   console.log(`diff: ${JSON.stringify(diff)}`);
// });
// r.onValue(value => {
//   console.log(`value: ${JSON.stringify(value)}`);
// });
// r.onField(`rpm`, value => {
//   console.log(`!! rpm: ${value}`);
// });

// setTimeout(() => {
//   r.update({missing:true});
// }, 3000);

// setTimeout(async () => {
//   const d = await r.pull();
//  //console.log(d);
// }, 2000);
