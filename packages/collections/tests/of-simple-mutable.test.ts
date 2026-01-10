/* eslint-disable @typescript-eslint/ban-ts-comment */
import { test, expect } from 'vitest';
import { ofSimpleMutable } from '../src/map/map-of-simple-mutable.js';

test('basic', () => {
  const m = ofSimpleMutable<string>();
  m.addKeyedValues('key-a', 'a', 'aa', 'aaa');
  m.addKeyedValues(`key-b`, `b`, `bb`, `bbb`);
  m.addKeyedValues(`key-c`, `c`, `cc`, `ccc`);

  const keysAndCounts = [ ...m.keysAndCounts() ];
  expect(keysAndCounts.length === 3).toBe(true);
  expect(keysAndCounts).toEqual([
    [ `key-a`, 3 ],
    [ `key-b`, 3 ],
    [ `key-c`, 3 ],
  ]);

  expect(m.count(`key-a`) === 3).toBe(true);
  expect(m.count(`key-b`) === 3).toBe(true);
  expect(m.count(`key-c`) === 3).toBe(true);
  expect(m.count(`key-z`) === 0).toBe(true);

  expect(m.has(`key-a`)).toBe(true);
  expect(m.has(`key-b`)).toBe(true);
  expect(m.has(`key-c`)).toBe(true);
  expect(m.has(`key-z`)).toBe(false);

  expect(m.hasKeyValue(`key-a`, `a`)).toBe(true);
  expect(m.hasKeyValue(`key-a`, `aa`)).toBe(true);
  expect(m.hasKeyValue(`key-a`, `aaa`)).toBe(true);

  expect(m.hasKeyValue(`key-a`, `z`)).toBe(false);
  expect(m.hasKeyValue(`key-z`, `a`)).toBe(false);
  expect(m.hasKeyValue(`key-a`, ``)).toBe(false);

  // @ts-expect-error
  expect(m.hasKeyValue(`key-a`, undefined)).toBe(false);

  const valuesA = [ ...m.valuesFor(`key-a`) ];
  const valuesB = [ ...m.valuesFor(`key-b`) ];
  const valuesC = [ ...m.valuesFor(`key-c`) ];
  expect(valuesA).toEqual([ `a`, `aa`, `aaa` ]);
  expect(valuesB).toEqual([ `b`, `bb`, `bbb` ]);
  expect(valuesC).toEqual([ `c`, `cc`, `ccc` ]);
  expect([ ...m.valuesFor(`keys-z`) ].length === 0).toBe(true);

  expect(m.delete(`key-b`)).toBe(true);
  expect(m.has(`key-a`)).toBe(true);
  expect(m.has(`key-b`)).toBe(false);
  expect(m.has(`key-c`)).toBe(true);
  expect(m.count(`key-b`) === 0).toBe(true);
  expect([ ...m.valuesFor(`key-b`) ].length === 0).toBe(true);

  m.clear();
  expect([ ...m.keysAndCounts() ].length === 0).toBe(true);
});

test('entries', () => {
  const m = ofSimpleMutable<string>();
  m.addKeyedValues('key-a', 'a', 'aa');
  m.addKeyedValues(`key-b`, `b`, `bb`);
  m.addKeyedValues(`key-c`, `c`, `cc`);

  const entries = [ ...m.entriesFlat() ];
  expect(entries).toEqual([
    [ `key-a`, `a` ],
    [ `key-a`, `aa` ],
    [ `key-b`, `b` ],
    [ `key-b`, `bb` ],
    [ `key-c`, `c` ],
    [ `key-c`, `cc` ],
  ]);
});
