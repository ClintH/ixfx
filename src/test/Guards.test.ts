import test from 'ava';
import { integer, integerParse, percent } from '../Guards.js';

test(`percent`, (t) => {
  t.throws(() => percent(2));
  t.throws(() => percent(-2));
  t.throws(() => percent(Number.NaN));
  // @ts-ignore
  t.throws(() => percent(`string`));
  // @ts-ignore
  t.throws(() => percent(true));
  // @ts-ignore
  t.throws(() => percent(false));
  // @ts-ignore
  t.throws(() => percent({ a: true }));

  t.notThrows(() => percent(1));
  t.notThrows(() => percent(0));
  t.notThrows(() => percent(0.5));
});

test(`integer`, (t) => {
  // @ts-ignore
  t.throws(() => integer(`string`));
  // @ts-ignore
  t.throws(() => integer(true));
  // @ts-ignore
  t.throws(() => integer(false));
  // @ts-ignore
  t.throws(() => integer({ a: true }));

  t.throws(() => integer(-0.5));
  t.throws(() => integer(0.5));
  t.throws(() => integer(Number.NaN));

  t.notThrows(() => integer(0));
  t.notThrows(() => integer(1));
  t.notThrows(() => integer(100));
});

test(`integerParse`, (t) => {
  t.is(integerParse('10', 'positive'), 10);
  t.is(integerParse('10.89', 'positive'), 10);
  t.is(integerParse('0', 'positive', 0), 0);
  t.is(integerParse('-10', 'positive', 0), 0);

  t.is(integerParse('-10', 'negative'), -10);
  t.is(integerParse('-10.99', 'negative'), -10);
  t.is(integerParse('0', 'negative'), 0);
  t.true(Number.isNaN(integerParse('10', 'negative')));
  t.is(integerParse('10', 'negative', 0), 0);

  t.is(integerParse('10', 'aboveZero'), 10);
  t.true(Number.isNaN(integerParse('0', 'aboveZero')));
  t.true(Number.isNaN(integerParse('-10', 'aboveZero')));

  t.true(integerParse('-10', 'belowZero') === -10);
  t.true(Number.isNaN(integerParse('0', 'belowZero')));
  t.true(Number.isNaN(integerParse('10', 'belowZero')));

  t.true(integerParse('-1', 'bipolar') === -1);
  t.true(integerParse('1', 'bipolar') === 1);
  t.true(integerParse('0', 'bipolar') === 0);
  t.true(Number.isNaN(integerParse('-2', 'bipolar')));
  t.true(Number.isNaN(integerParse('2', 'bipolar')));

  t.is(integerParse('-10', 'nonZero'), -10);
  t.true(Number.isNaN(integerParse('0', 'aboveZero')));
  t.is(integerParse('10', 'aboveZero'), 10);

  t.is(integerParse('1', 'percentage'), 1);
  t.is(integerParse('0', 'percentage'), 0);
  t.true(Number.isNaN(integerParse('-1', 'percentage')));
  t.true(Number.isNaN(integerParse('-2', 'percentage')));
  t.true(Number.isNaN(integerParse('2', 'percentage')));
});
