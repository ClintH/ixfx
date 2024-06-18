import test from 'ava';
import * as Rx from '../../rx/index.js';
import * as Flow from '../../flow/index.js';
import { count } from '../../numbers/Count.js';
import { isApproximately } from '../../numbers/IsApproximately.js';

const genArray = (count: number) => {
  const data: string[] = [];
  for (let i = 0; i < count; i++) {
    data[ i ] = `data-${ i }`;
  }
  return data;
}

// test(`derived`, async t => {
//   const counter = Rx.From.number(0);
//   const isEven = Rx.From.pinged(counter, value => (value & 1) == 0);

//   isEven.onValue(v => {
//     console.log(`isEven: ${ v }`);
//   })
//   for (let i = 0; i < 10; i++) {
//     console.log(`set: ${ i }`);
//     counter.set(i);
//     await Flow.sleep(100);
//   }
//   console.log(`Done`);
//   t.pass();
// });

// test(`derived-2`, async t => {
//   Rx.combineLatestToObject({
//     move: Rx.event<PointerEvent>(document.body, `pointermove`)
//   })
// });


// test(`dummy`, t => {
//   t.pass();
// })





