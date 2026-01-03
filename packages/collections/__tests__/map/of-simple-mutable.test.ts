import { expect, test, assert } from 'vitest';
import { mapOfSimpleMutable } from '../../src/map/map-multi.js';

test(`mapOfSimpleMutable`, () => {
  const m1 = mapOfSimpleMutable<string>();
  expect([ ...m1.keys() ].length === 0).toBe(true);
  expect([ ...m1.entriesFlat() ].length === 0).toBe(true);
  expect([ ...m1.valuesFlat() ].length === 0).toBe(true);

  const m2 = mapOfSimpleMutable<string>();
  m2.addKeyedValues(`name`, `jane`, `jill`, `joe`, `jack`);
  m2.addKeyedValues(`colours`, `red`, `blue`, `yellow`);

  expect([ ...m2.keys() ].length === 2).toBe(true);
  expect([ ...m2.valuesForAsArray(`name`) ]).toEqual([ `jane`, `jill`, `joe`, `jack` ]);
  expect([ ...m2.valuesForAsArray(`colours`) ]).toEqual([ `red`, `blue`, `yellow` ]);
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

  expect([ ...m2.valuesForAsArray(`notfound`) ].length === 0).toBe(true);
});
