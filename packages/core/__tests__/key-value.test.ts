import { test, expect } from 'vitest';
import type { KeyValue } from '../src/types.js';
import { keyValueSorter } from '../src/key-value.js';

test(`sorting`, () => {
  const a: KeyValue[] = [
    [ `apples`, 10 ],
    [ `orange`, 2 ],
    [ `zebras`, 0 ]
  ];

  // Sort by numeric value
  expect(keyValueSorter(`value`)(a)).toEqual([
    [ `zebras`, 0 ],
    [ `orange`, 2 ],
    [ `apples`, 10 ]
  ]);

  expect(keyValueSorter(`value-reverse`)(a)).toEqual([
    [ `apples`, 10 ],
    [ `orange`, 2 ],
    [ `zebras`, 0 ]
  ]);

  // Sort by key
  expect(keyValueSorter(`key`)(a)).toEqual([
    [ `apples`, 10 ],
    [ `orange`, 2 ],
    [ `zebras`, 0 ]
  ]);

  expect(keyValueSorter(`key-reverse`)(a)).toEqual([
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
  expect(keyValueSorter(`value`)(b)).toEqual([
    [ `d`, `four` ],
    [ `a`, `one` ],
    [ `c`, `three` ],
    [ `b`, `two` ],
  ]);
});