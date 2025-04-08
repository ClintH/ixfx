import { test, expect } from 'vitest';
import type { KeyValue } from '../src/types.js';
import { getSorter } from '../src/key-value.js';

test(`sorting`, () => {
  const a: KeyValue[] = [
    [ `apples`, 10 ],
    [ `orange`, 2 ],
    [ `zebras`, 0 ]
  ];

  // Sort by numeric value
  expect(getSorter(`value`)(a)).toEqual([
    [ `zebras`, 0 ],
    [ `orange`, 2 ],
    [ `apples`, 10 ]
  ]);

  expect(getSorter(`value-reverse`)(a)).toEqual([
    [ `apples`, 10 ],
    [ `orange`, 2 ],
    [ `zebras`, 0 ]
  ]);

  // Sort by key
  expect(getSorter(`key`)(a)).toEqual([
    [ `apples`, 10 ],
    [ `orange`, 2 ],
    [ `zebras`, 0 ]
  ]);

  expect(getSorter(`key-reverse`)(a)).toEqual([
    [ `zebras`, 0 ],
    [ `orange`, 2 ],
    [ `apples`, 10 ]
  ]);

  const b: KeyValue[] = [
    [ `a`, `one` ],
    [ `b`, `two` ],
    [ `c`, `three` ],
    [ `d`, `four` ]
  ];

  // Sort by string value
  expect(getSorter(`value`)(b)).toEqual([
    [ `d`, `four` ],
    [ `a`, `one` ],
    [ `c`, `three` ],
    [ `b`, `two` ],
  ]);
});