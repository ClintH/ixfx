/* eslint-disable */
import { pingPong, pingPongPercent } from '../../modulation/PingPong.js';
import test, { type ExecutionContext } from 'ava';
import { isCloseTo } from '../Include.js';

const testNumeric = (t: ExecutionContext, given: number[], expectedRange: number[], precision = 1) => {
  t.is(given.length, expectedRange.length);
  for (let i = 0; i < given.length; i++) {
    const r = isCloseTo(given[ i ], expectedRange[ i ], precision);
    if (!r[ 0 ]) {
      t.fail(`Index: ${ i } not close. A: ${ given[ i ] } B: ${ expectedRange[ i ] } Precision: ${ precision }`);
    }
  }
};

test(`pingPong`, (t) => {
  t.throws(() => pingPong(20, 2, 10).next());    // Interval too large
  t.throws(() => pingPong(1, 0, 10, 15).next()); // Offset out of range

  // Counting up
  let expectedRange = [ 10, 20, 30, 40, 50 ];
  let given: number[] = [];
  let count = 5;
  for (const v of pingPong(10, 10, 100)) {
    t.true(v !== undefined);
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(t, given, expectedRange);

  // Counting down, starting at 100
  expectedRange = [ 100, 90, 80, 70, 60 ];
  given = [];
  count = 5;
  for (const v of pingPong(-10, 10, 100, 100)) {
    t.true(v !== undefined);
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(t, given, expectedRange);

  // Counting down starting at default offset (10)
  expectedRange = [ 10, 100, 90, 80, 70 ];
  given = [];
  count = 5;
  for (const v of pingPong(-10, 10, 100)) {
    t.true(v !== undefined);
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(t, given, expectedRange);

  // Counting forward from edge of range
  expectedRange = [ 100, 10, 20, 30, 40 ];
  given = [];
  count = 5;
  for (const v of pingPong(10, 10, 100, 100)) {
    t.true(v !== undefined);
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(t, given, expectedRange);


  // Ping-pong
  expectedRange = [ 10, 20, 30, 40, 50, 40, 30, 20, 10, 20, 30, 40 ];
  given = [];
  count = 12;
  for (const v of pingPong(10, 10, 50)) {
    t.true(v !== undefined);
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(t, given, expectedRange);
});


test(`pingPongPercent-1`, (t) => {
  // Test out of range catching
  t.throws(() => pingPongPercent(2).next());
  t.throws(() => pingPongPercent(-2).next());
  t.throws(() => pingPongPercent(0).next());
  t.throws(() => pingPongPercent(0.1, -2).next());
  t.throws(() => pingPongPercent(0.1, 2).next());
});

test(`pingPongPercent-2`, (t) => {
  // Test counting up to 1
  let expectedRange = [ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1 ];
  let given: number[] = [];
  let count = 11;
  for (const v of pingPongPercent(0.1)) {
    t.true(v !== undefined);
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(t, given, expectedRange);
});

test(`pingPongPercent-3`, (t) => {
  // Test counting down to 0
  let expectedRange = [ 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.003 ];
  let given = [];
  let count = 11;
  for (const v of pingPongPercent(-0.1, 0, 1, 1)) {
    t.true(v !== undefined);
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(t, given, expectedRange, 1);
});

test(`pingPongPercent-4`, (t) => {
  // Test ping-pong
  let expectedRange = [ 0, 0.2, 0.4, 0.6, 0.8, 1, 0.8, 0.6, 0.4, 0.2 ];
  expectedRange = [ ...expectedRange, ...expectedRange ];
  let given = [];
  let count = 20;
  for (const v of pingPongPercent(0.2)) {
    t.true(v !== undefined);
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(t, given, expectedRange);
});

test(`pingPongPercent-5`, (t) => {
  // Test big interval
  let expectedRange = [ 0, 0.8, 1, 0.2, 0 ];
  let given = [];
  let count = 5;
  for (const v of pingPongPercent(0.8)) {
    t.true(v !== undefined);
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  //console.log(given);
  testNumeric(t, given, expectedRange);

  // Test alternate style and start
  const pp = pingPongPercent(0.1, 0.5);
  t.is(pp.next().value, 0.5);
  t.is(pp.next().value, 0.6);
  t.is(pp.next().value, 0.7);
  t.is(pp.next().value, 0.8);
  t.is(pp.next().value, 0.9);
  t.is(pp.next().value, 1.0);
  t.is(pp.next().value, 0.9);
});
