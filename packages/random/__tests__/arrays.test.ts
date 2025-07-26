
import { test, expect, assert } from 'vitest';
import * as R from '../src/index.js';

const dummyGenerator = () => 0.5;

test(`random-pluck`, () => {
  const orig = [ 1, 2, 3, 4, 5 ];

  // No mutation
  let count = 20;
  while (count > 0) {
    const result = R.randomPluck(orig);
    // Since we're continuing to pluck from original array, result.array should always be one less
    expect(result.remainder.length).toEqual(orig.length - 1);
    count--;
  }
  // Original is unmodified
  expect(orig).toStrictEqual([ 1, 2, 3, 4, 5 ]);

  // Now with mutation
  const input = [ ...orig ];
  count = 0;
  const pluckResults: number[] = [];
  while (count < input.length + 5) {
    const result = R.randomPluck(input, { mutate: true });
    if (typeof result === `undefined`) {
      expect(count).toBeGreaterThanOrEqual(input.length);
    } else {
      pluckResults.push(result);
      expect(input).length(orig.length - count - 1);
    }
    count++;
  }
  pluckResults.sort();
  expect(pluckResults).toStrictEqual([ 1, 2, 3, 4, 5 ]);

});

test(`random-element`, () => {
  const a = [ 1, 2, 3, 4, 5 ];
  let runs = 100;
  while (runs > 0) {
    const element = R.randomElement(a);
    expect(element).greaterThanOrEqual(0);
    expect(element).lessThanOrEqual(a.length);
    runs--;
  }

  // Fixed generator
  runs = 100;
  let dummyElement = -1;
  while (runs > 0) {
    const element = R.randomElement(a, dummyGenerator);
    if (dummyElement === -1) dummyElement = element;
    expect(element).toEqual(dummyElement);
    runs--;
  }
});

test(`random-index`, () => {
  const a = [ 1, 2, 3, 4, 5 ];
  let runs = 100;
  while (runs > 0) {
    const index = R.randomIndex(a);
    expect(index).greaterThanOrEqual(0);
    expect(index).lessThan(a.length);
    runs--;
  }

  // Fixed generator
  runs = 100;
  let dummyIndex = -1;
  while (runs > 0) {
    const index = R.randomIndex(a, dummyGenerator);
    if (dummyIndex === -1) dummyIndex = index;
    expect(index).toEqual(dummyIndex);
    runs--;
  }
});