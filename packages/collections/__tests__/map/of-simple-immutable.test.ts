import { expect, test, assert } from 'vitest';
import { MapOfSimple } from '../../src/map/map-multi.js';
import { isEqualValueDefault } from '@ixfx/core';

test(`MapOfSimple`, () => {
  const m1 = new MapOfSimple<string>();
  expect([ ...m1.keys() ].length === 0).toBe(true);
  expect([ ...m1.entriesFlat() ].length === 0).toBe(true);
  expect([ ...m1.valuesFlat() ].length === 0).toBe(true);

  let m2 = new MapOfSimple<string>();
  m2 = m2.addKeyedValues(`name`, `jane`, `jill`, `joe`, `jack`);
  m2 = m2.addKeyedValues(`colours`, `red`, `blue`, `yellow`);
  expect([ ...m2.keys() ]).toStrictEqual([ 'name', 'colours' ]);
  expect([ ...m2.valuesFor(`name`) ]).toStrictEqual([ `jane`, `jill`, `joe`, `jack` ]);
  expect([ ...m2.valuesFor(`colours`) ]).toStrictEqual([ `red`, `blue`, `yellow` ]);
  assert.sameDeepMembers(

    [ ...m2.entriesFlat() ],
    [
      [ `name`, `jane` ],
      [ `name`, `jill` ],
      [ `name`, `joe` ],
      [ `name`, `jack` ],
      [ `colours`, `red` ],
      [ `colours`, `blue` ],
      [ `colours`, `yellow` ],
    ]
  );

  expect([ ...m2.valuesFor(`notfound`) ].length === 0).toBe(true);

  m2 = m2.clear();
  expect(m2.lengthKeys).toBe(0);

  let m3 = new MapOfSimple<string>();
  m3 = m3.addBatch([
    [ 'name', [ 'apple', 'carrot', 'pear' ] ],
    [ 'colours', [ 'red', 'green', 'blue' ] ]
  ]);
  expect([ ...m3.valuesFor('name') ]).toStrictEqual([ 'apple', 'carrot', 'pear' ])
  expect([ ...m3.valuesFor('colours') ]).toStrictEqual([ 'red', 'green', 'blue' ]);

  type Person = { name: string, size: number }
  let m4 = new MapOfSimple<Person>((v) => v.name, isEqualValueDefault);
  m4 = m4.addValue({ name: 'jill', size: 10 }, { name: 'jill', size: 1 });
  m4 = m4.addValue({ name: 'jane', size: 10 });
  expect([ ...m4.valuesFor('jill') ]).toStrictEqual([ { name: 'jill', size: 10 }, { name: 'jill', size: 1 } ])

  m4 = m4.deleteByValue({ name: 'jill', size: 1 });
  expect([ ...m4.valuesFor('jill') ]).toStrictEqual([ { name: 'jill', size: 10 } ])

  // Delete a value that doesn't exist
  m4 = m4.deleteKeyValue('jill', { name: 'jill', size: 100 });
  expect(m4.has('jill')).toBeTruthy()

  // Delete a value that does exist but different key
  m4 = m4.deleteKeyValue('jill', { name: 'jane', size: 10 });
  expect(m4.has('jill')).toBeTruthy()
  expect([ ...m4.valuesFor('jane') ]).toStrictEqual([ { name: 'jane', size: 10 } ])

  // Delete a value that does exist under key
  m4 = m4.deleteKeyValue('jill', { name: 'jill', size: 10 });
  expect(m4.has('jill')).toBeFalsy();

  m4 = m4.delete('jane');
  expect(m4.has('jane')).toBeFalsy();


});
