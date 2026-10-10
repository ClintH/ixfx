import * as Rx from '../../../dist/rx.js';
import * as Arrays from '../../../dist/arrays.js';

// Outputs the largest-ever seen value
const rx = Rx.writable(
  Rx.From.number(10),
  Rx.Ops.max()
);

rx.onValue(v => {
  // Will print the current largest value
  console.log(v);
});

rx.set(11); // Replace the original value of 10
rx.set(5);
rx.set(100);