
import { test, expect, assert } from 'vitest';
import * as R from '../src/index.js';

test(`string`, () => {
  const dummySource = () => 0.5;
  expect(R.string(10)).length(10);
  expect(R.string({ length: 20 })).length(20);

  // Fixed random
  const r = R.string({ length: 3, source: dummySource });
  expect(r).length(3);
  expect(r[ 0 ]).toBe(r[ 1 ]);
  expect(r[ 0 ]).toBe(r[ 2 ]);
});

test(`guid`, () => {
  expect(R.shortGuid()).length(6);
  let iter = 1000;
  const s1 = new Set<string>();
  while (iter > 0) {
    const r = R.shortGuid();
    expect(s1.has(r)).toBeFalsy();
    s1.add(r);
    iter--;
  };

  const s2 = new Set<string>();
  const dummySource = () => 0.5;
  iter = 1000;

  // Fixed random gen, expect all values to be the same
  while (iter > 0) {
    const r = R.shortGuid({ source: dummySource });
    if (iter === 1000) s2.add(r);
    expect(s2.has(r)).toBeTruthy();
    iter--;
  }
});