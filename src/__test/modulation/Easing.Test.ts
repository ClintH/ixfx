import test from 'ava';
import * as Easings from '../../modulation/easing/index.js';
import { repeatSync } from '../../flow/Repeat.js';

test(`tick`, async t => {
  const e1 = Easings.tickEasing(`sineIn`, 10)
  t.false(e1.isDone);
  const e1D = Array.fromAsync(repeatSync(e1.compute, { count: 11 }));
  console.log(e1D);
  t.true(e1.isDone);

})