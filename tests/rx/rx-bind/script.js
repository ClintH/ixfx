import * as Rx from '../../../dist/rx.js';
import * as Numbers from '../../../dist/numbers.js';
import {Colour} from '../../../dist/visual.js';

const r1 = Rx.From.number(10);
const b1 = Rx.Dom.bindValueRange(r1,`#inputRange`, { twoway: true });


const r2 = Rx.From.object({h:0.1,s:1,l:0.5});
const b2 = Rx.Dom.bindValueColour(r2, `#inputColour`);

r2.onValue(value => {
  console.log(`r:`,value);
});
b2.input.onValue(value => {
  console.log(`b input: `,value);
});

// setInterval(() => {
//   const v = Math.random();
//   r1.set(v);

//   const hue = Math.random();
//   r2.set({h:hue,s:1,l:0.5});
// },2000);

// TODO: Number scaling
// TODO: Colour
// TODO: Date

// TODO: Bi-directional binding
// TODO: Integration with responsiveObject