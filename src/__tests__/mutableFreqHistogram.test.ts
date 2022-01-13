/// <reference types="jest-extended" />

/* eslint-disable */
import {KeyValue} from '../KeyValue.js';
import {MutableFreqHistogram} from '../MutableFreqHistogram.js';
import {shuffle} from '../util.js';
import {jest} from '@jest/globals';

test(`sorting`, () => {  
  const a: KeyValue[] = [
    [`apple`, 10],
    [`orange`, 2],
    [`zebra`, 1],
    [`banana`, 3],
    [`pineapple`, 9]
  ];

  // Produces: [zebra, orange, apple, orange, apple ...]
  const aSeries = shuffle(a.flatMap(kv => Array(kv[1]).fill(kv[0])));
 
  // Test it can count properly
  const h = new MutableFreqHistogram();
  aSeries.forEach(d => {
    h.add(d);
  })
  expect(h.toArray()).toIncludeSameMembers(a);

  // Test frequencyOf
  expect(h.frequencyOf(`pineapple`)).toEqual(9);
  expect(h.frequencyOf(`notfound`)).toBeUndefined();

  // Test iterators
  const aKeys = Array.from(h.keys());
  expect(aKeys).toIncludeSameMembers([`apple`, `orange`, `zebra`, `banana`, `pineapple`]);

  const aValues = Array.from(h.values());
  expect(aValues).toIncludeSameMembers([10, 2, 1, 3, 9]);
  
  // Should work
  h.add(null);
  expect(h.frequencyOf(null)).toEqual(1);

  // Should throw
  expect(() => h.add(undefined)).toThrow();

  h.clear();
  expect(h.toArray()).toEqual([]);

  const changeHandler = jest.fn();

  // Test events are firing
  const h2 = new MutableFreqHistogram();
  h2.addEventListener(`change`, changeHandler);

  // Only one event when adding as a batch
  h2.add(...aSeries);
  expect(changeHandler).toBeCalledTimes(1);

  // One event for clear
  h2.clear();
  expect(changeHandler).toBeCalledTimes(2);

  // One event per add (plus the previous add and clear)
  aSeries.forEach(d => {
    h2.add(d);
  })
  expect(changeHandler).toBeCalledTimes(aSeries.length+2);
});