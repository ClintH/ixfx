import expect from 'expect';
import * as Easings from '../../modulation/easing/index.js';
import { repeatSync } from '../../flow/Repeat.js';

test(`tick`, async () => {
  const e1 = Easings.tickEasing(`sineIn`, 10)
  expect(e1.isDone).toBe(false);
  const e1D = Array.from(repeatSync(e1.compute, { count: 11 }));
  expect(e1.isDone).toBe(true);
})