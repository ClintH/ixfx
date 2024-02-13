import test from 'ava';
import { mapOfSimpleMutable } from '../../../collections/map/MapMulti.js';
import { arrayValuesEqual } from '../../Include.js';
import { isEqualValueDefault } from '../../../IsEqual.js';

test(`mapOfSimpleMutable`, (t) => {
  const m1 = mapOfSimpleMutable<string>();
  t.true([ ...m1.keys() ].length === 0);
  t.true([ ...m1.entriesFlat() ].length === 0);
  t.true([ ...m1.valuesFlat() ].length === 0);

  const m2 = mapOfSimpleMutable<string>();
  m2.addKeyedValues(`name`, `jane`, `jill`, `joe`, `jack`);
  m2.addKeyedValues(`colours`, `red`, `blue`, `yellow`);

  t.true([ ...m2.keys() ].length === 2);
  arrayValuesEqual(t, [ ...m2.get(`name`) ], [ `jane`, `jill`, `joe`, `jack` ]);
  arrayValuesEqual(t, [ ...m2.get(`colours`) ], [ `red`, `blue`, `yellow` ]);
  arrayValuesEqual(
    t,
    [ ...m2.entriesFlat() ],
    [
      [ `name`, `jane` ],
      [ `name`, `jill` ],
      [ `name`, `joe` ],
      [ `name`, `jack` ],
      [ `colours`, `red` ],
      [ `colours`, `blue` ],
      [ `colours`, `yellow` ],
    ],
    isEqualValueDefault
  );

  t.true([ ...m2.get(`notfound`) ].length === 0);
});
