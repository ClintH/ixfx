import * as Rx from '../../../dist/rx.js';
import * as Flow from '../../../dist/flow.js';
import { Elapsed } from '../../../dist/flow.js';
import * as Numbers from '../../../dist/numbers.js';
import * as Data from '../../../dist/data.js';

const state = Data.pull( {
  slider: Rx.From.domValueAsNumber(`#slider`, 
  {
    when:`progress`, 
    makeRelative: true
  }),
  rand: Math.random,
  osc: Numbers.pingPongPercent(0.01)
});

setInterval(async () => {
  const s = await state.compute();
  console.log(s);
}, 100);

