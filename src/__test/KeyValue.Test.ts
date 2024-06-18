
/* eslint-disable */
import test from 'ava';
import { getSorter } from '../KeyValue.js';
import type { KeyValue } from '../PrimitiveTypes.js';

test(`sorting`, (t) => {
  const a: KeyValue[] = [
    [ `apples`, 10 ],
    [ `orange`, 2 ],
    [ `zebras`, 0 ]
  ];

  // Sort by numeric value
  t.deepEqual(getSorter(`value`)(a), [
    [ `zebras`, 0 ],
    [ `orange`, 2 ],
    [ `apples`, 10 ]
  ]);

  t.deepEqual(getSorter(`value-reverse`)(a), [
    [ `apples`, 10 ],
    [ `orange`, 2 ],
    [ `zebras`, 0 ]
  ]);

  // Sort by key
  t.deepEqual(getSorter(`key`)(a), [
    [ `apples`, 10 ],
    [ `orange`, 2 ],
    [ `zebras`, 0 ]
  ]);

  t.deepEqual(getSorter(`key-reverse`)(a), [
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
  t.deepEqual(getSorter(`value`)(b), [
    [ `d`, `four` ],
    [ `a`, `one` ],
    [ `c`, `three` ],
    [ `b`, `two` ],
  ]);
});