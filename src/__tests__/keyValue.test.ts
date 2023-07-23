
/* eslint-disable */
import {expect, test} from '@jest/globals';
import {type KeyValue, sortByKey, sortByValueNumber, sortByValueString} from '../KeyValue.js';

test(`sorting`, () => {
  const a: KeyValue[] = [
    [`apples`, 10],
    [`orange`, 2],
    [`zebras`, 0]
  ];

  // Sort by numeric value
  expect(sortByValueNumber(false)(a)).toStrictEqual([
    [`zebras`, 0],
    [`orange`, 2],
    [`apples`, 10]
  ]);

  expect(sortByValueNumber(true)(a)).toStrictEqual([
    [`apples`, 10],
    [`orange`, 2],
    [`zebras`, 0]
  ]);

  // Sort by key
  expect(sortByKey(false)(a)).toStrictEqual([
    [`apples`, 10],
    [`orange`, 2],
    [`zebras`, 0]
  ]);

  expect(sortByKey(true)(a)).toStrictEqual([
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
  expect(sortByValueString(false)(b)).toStrictEqual([
    [`d`, `four`],
    [`a`, `one`],
    [`c`, `three`],
    [`b`, `two`],
  ]);
});