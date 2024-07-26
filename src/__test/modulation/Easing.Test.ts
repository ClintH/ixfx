import test from 'ava';
import * as Easings from '../../modulation/easing/index.js';
import { repeat, repeatAwait } from '../../flow/Repeat.js';

test(`tick`, async t => {
  const e1 = Easings.tickEasing(`sineIn`, 10)
  t.false(e1.isDone);
  const e1D = [ ...repeat(11, e1.compute) ];
  console.log(e1D);
  t.true(e1.isDone);

})