
/* eslint-disable */
import test from 'ava';
import {type KeyValue, sortByKey, sortByValueNumber, sortByValueString} from '../KeyValue.js';

test(`sorting`, (t) => {
  const a: KeyValue[] = [
    [`apples`, 10],
    [`orange`, 2],
    [`zebras`, 0]
  ];

  // Sort by numeric value
  t.deepEqual(sortByValueNumber(false)(a), [
    [`zebras`, 0],
    [`orange`, 2],
    [`apples`, 10]
  ]);

  t.deepEqual(sortByValueNumber(true)(a), [
    [`apples`, 10],
    [`orange`, 2],
    [`zebras`, 0]
  ]);

  // Sort by key
  t.deepEqual(sortByKey(false)(a), [
    [`apples`, 10],
    [`orange`, 2],
    [`zebras`, 0]
  ]);

  t.deepEqual(sortByKey(true)(a), [
    [`zebras`, 0],
    [`orange`, 2],
    [`apples`, 10]
  ]);

  const b: KeyValue[] = [
    [`a`, `one`],
    [`b`, `two`],
    [`c`, `three`],
    [`d`, `four`]
  ];

  // Sort by string value
  t.deepEqual(sortByValueString(false)(b), [
    [`d`, `four`],
    [`a`, `one`],
    [`c`, `three`],
    [`b`, `two`],
  ]);
});