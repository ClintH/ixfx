import test from 'ava';
import { isStringArray, integerTest, integerParse, percentTest } from '../Guards.js';

test(`isStringArray`, (t) => {
  t.true(isStringArray([ `a`, `b`, `c` ]));
  t.true(isStringArray([ 'a' ]));
  t.false(isStringArray([ `a`, `b`, false ]));
  t.false(isStringArray([ `a`, `b`, null ]));
  t.false(isStringArray([ `a`, `b`, true ]));
  t.false(isStringArray([ `a`, `b`, {} ]));
});

test(`percent`, (t) => {
  t.false(percentTest(2)[ 0 ]);
  t.false(percentTest(-2)[ 0 ]);
  t.false(percentTest(Number.NaN)[ 0 ]);
  // @ts-expect-error
  t.false(percentTest(`string`)[ 0 ]);
  // @ts-expect-error
  t.false(percentTest(true)[ 0 ]);
  // @ts-expect-error
  t.false(percentTest(false)[ 0 ]);
  // @ts-expect-error
  t.false(percentTest({ a: true })[ 0 ]);

  t.true(percentTest(1)[ 0 ]);
  t.true(percentTest(0)[ 0 ]);
  t.true(percentTest(0.5)[ 0 ]);
});

test(`integer`, (t) => {
  // @ts-ignore
  t.false(integerTest(`string`)[ 0 ]);
  // @ts-ignore
  t.false(integerTest(true)[ 0 ]);
  // @ts-ignore
  t.false(integerTest(false)[ 0 ]);
  // @ts-ignore
  t.false(integerTest({ a: true })[ 0 ]);

  t.false(integerTest(-0.5)[ 0 ]);
  t.false(integerTest(0.5)[ 0 ]);
  t.false(integerTest(Number.NaN)[ 0 ]);

  t.true(integerTest(0)[ 0 ]);
  t.true(integerTest(1)[ 0 ]);
  t.true(integerTest(100)[ 0 ]);
});

test(`integerParse`, (t) => {
  t.is(integerParse(`10`, `positive`), 10);
  t.is(integerParse(`10.89`, `positive`), 10);
  t.is(integerParse(`0`, `positive`, 0), 0);
  t.is(integerParse(`-10`, `positive`, 0), 0);

  t.is(integerParse(`-10`, `negative`), -10);
  t.is(integerParse(`-10.99`, `negative`), -10);
  t.is(integerParse(`0`, `negative`), 0);
  t.true(Number.isNaN(integerParse(`10`, `negative`)));
  t.is(integerParse(`10`, `negative`, 0), 0);

  t.is(integerParse(`10`, `aboveZero`), 10);
  t.true(Number.isNaN(integerParse(`0`, `aboveZero`)));
  t.true(Number.isNaN(integerParse(`-10`, `aboveZero`)));

  t.true(integerParse(`-10`, `belowZero`) === -10);
  t.true(Number.isNaN(integerParse(`0`, `belowZero`)));
  t.true(Number.isNaN(integerParse(`10`, `belowZero`)));

  t.true(integerParse(`-1`, `bipolar`) === -1);
  t.true(integerParse(`1`, `bipolar`) === 1);
  t.true(integerParse(`0`, `bipolar`) === 0);
  t.true(Number.isNaN(integerParse(`-2`, `bipolar`)));
  t.true(Number.isNaN(integerParse(`2`, `bipolar`)));

  t.is(integerParse(`-10`, `nonZero`), -10);
  t.true(Number.isNaN(integerParse(`0`, `aboveZero`)));
  t.is(integerParse(`10`, `aboveZero`), 10);

  t.is(integerParse(`1`, `percentage`), 1);
  t.is(integerParse(`0`, `percentage`), 0);
  t.true(Number.isNaN(integerParse(`-1`, `percentage`)));
  t.true(Number.isNaN(integerParse(`-2`, `percentage`)));
  t.true(Number.isNaN(integerParse(`2`, `percentage`)));
});
