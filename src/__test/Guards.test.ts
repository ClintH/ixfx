import test from 'ava';

import { isStringArray } from '../util/GuardArrays.js';
import { ifNaN, percentTest, integerTest, integerParse } from '../util/GuardNumbers.js';
import { isPlainObjectOrPrimitive, isPlainObject } from '../util/GuardObject.js';
import { isInteger } from '../util/IsInteger.js';


test('isInteger', t => {
  // Nunber inputs
  t.true(isInteger(1));
  t.true(isInteger(0));
  t.false(isInteger(0.1));
  t.false(isInteger(0.9));
  t.false(isInteger(99.9));
  t.false(isInteger(Number.NaN));

  // String inputs
  t.true(isInteger(`1`));
  t.true(isInteger(`0`));
  t.false(isInteger(`1.1`));

  // @ts-expect-error
  t.false(isInteger({}));
  // @ts-expect-error
  t.false(isInteger(false));
  // @ts-expect-error
  t.false(isInteger(true));
  // @ts-expect-error
  t.false(isInteger(new Map()));

});

test('isPlainObjectOrPrimitive', t => {
  t.true(isPlainObjectOrPrimitive(`hello`));
  t.true(isPlainObjectOrPrimitive(10));
  t.true(isPlainObjectOrPrimitive({ hello: `there` }));
  t.false(isPlainObjectOrPrimitive(undefined));
  t.false(isPlainObjectOrPrimitive(null));
  t.false(isPlainObjectOrPrimitive(Number));
  if (typeof window !== `undefined`) {
    t.false(isPlainObjectOrPrimitive(window));
  }

});

test('isPlainObject', t => {
  t.false(isPlainObject(undefined));
  t.false(isPlainObject(null));
  t.false(isPlainObject(`hello`));
  t.false(isPlainObject(10));
  t.false(isPlainObject(Number));
  if (typeof window !== `undefined`) {
    t.false(isPlainObject(window));
  }
  t.true(isPlainObject({ hello: `there` }));

});

test('ifNaN', (t) => {
  t.is(ifNaN(Number.NaN, 10), 10);
  t.is(ifNaN(200, 10), 200);
  // @ts-ignore
  t.throws(() => ifNaN(null, 10));
  // @ts-ignore
  t.throws(() => ifNaN(undefined, 10));
  // @ts-ignore
  t.throws(() => ifNaN('100', 10));
});


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
