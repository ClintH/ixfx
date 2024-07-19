import * as Rx from '../../../dist/rx.js';

const src = Rx.From.number(100);
const interpolated = Rx.Ops.interpolate({amount:0.1})(src);
interpolated.onValue(v => {
  console.log(`Interpolated: ${v}`);
})
src.onValue(v => {
  console.log(`Source: ${v}`);
})
src.set(1000);

setInterval(() => {
  interpolated.trigger()
},100);

// Rx.wrap(Rx.From.event(document.body, `pointerup`, { debugLifecycle:true, debugFiring:true}))
// .transform(v => v.composedPath())
// .batch({ elapsed: 200 })
// .onValue(v => {
//   console.log(v);
// });