import * as Rx from '../../../dist/rx.js';

// const src = Rx.From.number(100);

// const interpolated = Rx.Ops.interpolate({amount:0.1})(src);
// interpolated.onValue(v => {
//   console.log(`Interpolated: ${v}`);
// })
// src.onValue(v => {
//   console.log(`Source: ${v}`);
// })
// src.set(1000);

// Rx.timeoutPing(interpolated, 100);

const rx = Rx.writable(
  Rx.From.number(100),
  Rx.Ops.interpolate({amount:0.1}),
  Rx.Ops.timeoutPing({millis:100})
)
rx.onValue(v => {
  console.log(` ${v}`);
});
rx.set(1000);

document.addEventListener(`click`, () => {
  const target = Math.round(Math.random()*1000);
  console.log(`target: ${target}`);
  rx.set(target);
})

// setInterval(() => {
//   interpolated.ping()
// },100);
