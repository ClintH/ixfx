import * as Rx from '../../../dist/rx.js';
import * as Arrays from '../../../dist/arrays.js';

// const p1 = Rx.cache(Rx.run(
//   Rx.From.event(window, `pointermove`),
//   Rx.Ops.transform(event =>  Math.abs(event.movementX) + Math.abs(event.movementY)), 
//   Rx.Ops.batch({elapsed:100})
// ), [0]);
// let speed = 0;
// setInterval(() => {
//   const last = p1.last();
//   if (last) {
//     speed += Arrays.average(p1.last());
//     p1.reset();
//   }
//   speed *= 0.5;
//   if (speed < 0.001) speed = 0;
//   console.log(speed);
// }, 200);

// Solution: Timestamp data
const p1 = Rx.cache(Rx.run(
  Rx.From.event(window, `pointermove`),
  Rx.Ops.transform(event =>  Math.abs(event.movementX) + Math.abs(event.movementY)), 
  Rx.Ops.annotate(value => ({ value, timestamp: Date.now() })),
  Rx.Ops.batch({quantity:5})
), []);
setInterval(() => {
  const l = p1.last();
  if (l) {
    p1.reset();
  }
  console.log(l);
}, 200);

// Solution: Using timeoutTrigger, emitting 0 for speed when there's no pointermove
// const p1 = Rx.run(
//     Rx.From.event(window, `pointermove`),
//     Rx.Ops.transform(event =>  Math.abs(event.movementX) + Math.abs(event.movementY)), 
//     Rx.Ops.timeoutTrigger({ interval:200, value:0, repeat: true }),
//     Rx.Ops.batch({elapsed:100}),
//     Rx.Ops.transform(value => Arrays.average(value))
// );
// p1.value(speed => {
//   console.log(speed);
// })