import { Pipes } from '../../../dist/data.js';
import * as Flow from '../../../dist/flow.js';
import * as Generators from '../../../dist/generators.js';

// const aa = Pipes.number(10);
// const bb = Pipes.number(20);

// const divide = Pipes.mergeValues((a,b) => a/b, {}, aa, bb);

// divide.setOutlet(value => {
//   console.log(`Divide output: ${value}`);
// }, { prime: true });

// aa.inlet(20);


// const rxWindow = Pipes.rxWindow();
// rxWindow.size(value => {
//   console.log(value);
// })

// const pipes = [];
// const sync = Pipes.synchronise({}, pipes);
// for await (const v of Pipes.asAsyncIterable(sync)) {
//   console.log(`Value: ${v}`);
// }

const everySecond = Generators.interval(() => `s:${Math.random()}`, 1000);
const everyThirdSecond = Generators.interval(() => `third:${Math.random()}`, 1000/3);

const sync = Pipes.synchronise({reset:false}, Pipes.fromIterable(everySecond), Pipes.fromIterable(everyThirdSecond));

for await (const v of Pipes.asAsyncIterable(sync)) {
  console.log(JSON.stringify(v));
}

// const pipe = Pipes.bidi();

// setInterval(() => pipe.inlet(Math.random()), 1000);

//const windowed = Pipes.slidingWindow(pipe, 3);

// const mma = Pipes.minMaxAvg(pipe);

// for await (const value of Pipes.asAsyncIterable(mma)) {
//   console.log(`iterable: ${JSON.stringify(value)}`);
// }

//const throttled = Pipes.throttle(onResizePipe, 1000);

// onResizePipe.setOutlet(v => {
//   console.log(`Value: ${v}`);
// }, { initialValue: true });