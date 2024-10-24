import test from 'ava';
import {
  average,
  isApprox,
  linearSpace,
  quantiseEvery,
  round,
  applyToValues,
  averageWeighted,
  weight,
  total
} from '../../numbers/index.js';
import { gaussian } from '../../modulation/Gaussian.js';

test('weight', t => {
  // Six items
  let r1 = weight([ 1, 1, 1, 1, 1, 1 ], gaussian());
  r1 = r1.map(r => round(2, r));
  t.deepEqual(r1, [ 0.02, 0.24, 0.85, 0.85, 0.24, 0.02 ]);
});

test('apply', t => {
  const o = {
    name: 'john',
    x: 10,
    y: 20
  };
  const o2 = applyToValues(o, (v) => v * 2);
  t.is(o2.x, 20);
  t.is(o2.y, 40);


  const oo = {
    h: 330,
    l: 0.7058823529411764,
    s: 1,
  }
  const oo2 = applyToValues(oo, v => round(3, v));
  t.like(oo2, { h: 330, l: 0.705, s: 1 });

});

test('is-approx', (t) => {

  // Check for divide by zero errors
  t.true(isApprox(0.1, 0, 0.05));
  t.true(isApprox(0.1, 0, -0.05));
  t.true(isApprox(0.1, 0, 0));
  t.false(isApprox(0.1, 0, 0.11));
  t.false(isApprox(0.1, 0, -0.11));
  t.true(isApprox(0, 0, 0));
  t.false(isApprox(0, 0, 0.1));
  // True due to rounding
  t.true(isApprox(0, 0, 0.000000001));



  const closeTo100 = isApprox(0.1, 100);
  t.true(closeTo100(100));
  t.true(closeTo100(101));
  t.true(closeTo100(90));
  t.false(closeTo100(80));
  t.false(closeTo100(111));
  t.false(closeTo100(Number.NaN));
  t.false(closeTo100(Number.NEGATIVE_INFINITY));
  t.false(closeTo100(Number.POSITIVE_INFINITY));
  t.false(closeTo100(Number.MAX_SAFE_INTEGER));
  t.false(closeTo100(Number.MIN_SAFE_INTEGER));

  t.throws(() => isApprox(Number.NaN, 100, 10));
  t.throws(() => isApprox(0, Number.NaN, 10));
  t.false(isApprox(0, 100, Number.NaN));


  t.throws(() => isApprox(Number.NaN, 100));
  // @ts-ignore
  t.throws(() => isApprox(false, 100));

  t.throws(() => isApprox(0.1, Number.NaN));
  // @ts-ignore
  t.throws(() => isApprox(0.1, { hello: 'there' }));
  // @ts-ignore
  t.throws(() => isApprox(0.1, '100'));
  // @ts-ignore
  t.throws(() => isApprox(0.1, true));

  const exact100 = isApprox(0, 100);
  t.true(exact100(100));
  t.false(exact100(101));
  t.false(exact100(99));

  t.true(isApprox(0.1, 1, 1.01));
  t.true(isApprox(0.1, 1, 1.1));

  t.true(isApprox(0.1, 1, 1));
  t.true(isApprox(0.1, 1, 0.99));
  t.false(isApprox(0.1, 1, 0));
});

test(`round`, (t) => {
  t.is(round(2, 10), 10);
  t.is(round(2, 10.1234), 10.12);
  t.is(round(3, 10.1234), 10.123);
  t.is(round(4, 10.1234), 10.1234);
  t.is(round(5, 0.010000000000009), 0.01);

  const r = round(3);
  t.is(r(100), 100);
  t.is(r(100.12345678), 100.123);
  t.is(r(0.00000000001), 0);

  const r2 = round(1, true);
  t.is(r2(0.9999), 1);
});

test(`linearSpace`, (t) => {
  const t1 = [ ...linearSpace(0, 9, 10) ];
  t.like(t1, [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);

  const t2 = [ ...linearSpace(5, 10, 11) ];

  t.like(t2, [ 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10 ]);

  const t3 = [ ...linearSpace(10, 5, 6) ];
  t.like(t3, [ 10, 9, 8, 7, 6, 5 ]);

  const t4 = [ ...linearSpace(10, 5, 2) ];
  t.like(t4, [ 10, 5 ]);

  const t5 = [ ...linearSpace(10, 5, 3) ];
  t.like(t5, [ 10, 7.5, 5 ]);
});

test(`quantiseEvery`, (t) => {
  t.is(quantiseEvery(1.11, 0.10), 1.10);
  t.is(quantiseEvery(1, 0.1), 1.0);
  t.is(quantiseEvery(1.19, 0.1), 1.2);
  t.is(quantiseEvery(1.2, 0.1), 1.2);


  t.is(quantiseEvery(11, 10), 10);
  t.is(quantiseEvery(25, 10), 30);
  t.is(quantiseEvery(0, 10), 0);
  t.is(quantiseEvery(4, 10), 0);
  t.is(quantiseEvery(100, 10), 100);

  t.is(quantiseEvery(15, 10, false), 10);
  t.is(quantiseEvery(15, 10, true), 20);

  // @ts-ignore
  t.throws(() => quantiseEvery(`string`, 10));
  // @ts-ignore
  t.throws(() => quantiseEvery(10, Number.NaN));
});

test(`averageWeighted`, t => {

  const r = round(2, averageWeighted([ 1, 2, 3 ], gaussian())); // 2.0
  t.is(r, 2.01);
});

test(`total`, t => {

  t.is(total([ 1, 2, 3 ]), 6);
  t.is(total([ 1, 2, -3 ]), 0);
  t.is(total([ 1, 2, Number.NaN, 3 ]), 6);
  // @ts-expect-error
  t.is(total([ 1, 2, null, 3 ]), 6);
  // @ts-expect-error
  t.is(total([ 1, 2, {}, 3 ]), 6);
});

test(`average`, (t) => {
  const a = [ 1 ];
  t.is(average(a), 1);

  const b = [ 1, 2, 3, 4, 5 ];
  t.is(average(b), 3);

  const c = [ -5, 5 ];
  t.is(average(c), 0);

  const d = [ 1, 0, null, undefined, NaN ];
  // @ts-ignore
  t.is(average(d), 0.5);

  // eslint-disable-next-line unicorn/prevent-abbreviations
  const e = [ 1, 1.4, 0.9, 0.1 ];
  t.is(average(e), 0.85);
});
