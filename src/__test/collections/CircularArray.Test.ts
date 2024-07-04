import test from 'ava';
import { circularArray } from '../../collections/CircularArray.js';

test(`circularArray`, t => {
  const ca1 = circularArray<string>(5);
  const ca2 = ca1.add(`a`);
  const ca3 = ca2.add(`b`);
  const ca4 = ca3.add(`c`);
  const ca5 = ca4.add(`d`);
  const ca6 = ca5.add(`e`);


  t.true(ca1.length === 0);
  t.true(ca2.length === 1);
  t.true(ca3.length === 2);
  t.true(ca4.length === 3);
  t.true(ca5.length === 4);
  t.true(ca6.length === 5);

  t.true(ca1 !== ca2);
  t.true(ca2 !== ca3);
  t.true(ca3 !== ca4);
  t.true(ca4 !== ca5);
  t.true(ca5 !== ca6);

  t.like(ca6 as string[], [ `a`, `b`, `c`, `d`, `e` ]);

  t.false(ca1.isFull);
  t.false(ca2.isFull);
  t.false(ca3.isFull);
  t.false(ca4.isFull);
  t.false(ca5.isFull);
  t.true(ca6.isFull);

  t.true(ca1.pointer === 0);
  t.true(ca2.pointer === 1);
  t.true(ca3.pointer === 2);
  t.true(ca4.pointer === 3);
  t.true(ca5.pointer === 4);
  t.true(ca6.pointer === 0);


  const ca7 = ca6.add(`f`);
  t.true(ca7.length === 5);
  t.true(ca7.pointer === 1);

  t.like(ca6 as string[], [ `a`, `b`, `c`, `d`, `e` ]);
  t.like(ca7 as string[], [ `f`, `b`, `c`, `d`, `e` ]);

});