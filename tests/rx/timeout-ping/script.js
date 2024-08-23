import * as Rx from '../../../dist/rx.js';
import * as Arrays from '../../../dist/arrays.js';

const source = Rx.From.func(Math.random);
const tp = Rx.timeoutPing(source, {secs:1});
tp.onValue(v => {
  console.log(v);
})
