import test from 'ava';
import * as Easings from '../../modulation/easing/index.js';
import { repeatSync } from '../../flow/Repeat.js';

test(`tick`, async t => {
  const e1 = Easings.tickEasing(`sineIn`, 10)
  t.false(e1.isDone);
  const e1D = Array.from(repeatSync(e1.compute, { count: 11 }));
  t.true(e1.isDone);
})