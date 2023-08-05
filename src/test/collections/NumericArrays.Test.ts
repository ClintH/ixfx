import test from 'ava';
import { average } from '../../collections/NumericArrays.js';

test(`average`, (t) => {
  const a = [1];
  t.is(average(a), 1);

  const b = [1, 2, 3, 4, 5];
  t.is(average(b), 3);

  const c = [-5, 5];
  t.is(average(c), 0);

  const d = [1, 0, null, undefined, NaN];
  // @ts-ignore
  t.is(average(d), 0.5);

  const e = [1, 1.4, 0.9, 0.1];
  t.is(average(e), 0.85);
});
