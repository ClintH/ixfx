/* eslint-disable */
import test from 'ava';
import type { KeyValue } from '../../KeyValue.js';
import { FrequencyMutable } from '../../data/FrequencyMutable.js';
import { shuffle } from '../../collections/Arrays.js';
import { arrayValuesEqual } from '../util.js';
import { isEqualValueDefault } from '../../IsEqual.js';

test(`sorting`, (t) => {
  const a: KeyValue[] = [
    [ `apple`, 10 ],
    [ `orange`, 2 ],
    [ `zebra`, 1 ],
    [ `banana`, 3 ],
    [ `pineapple`, 9 ]
  ];

  // Produces: [zebra, orange, apple, orange, apple ...]
  const aSeries = shuffle(a.flatMap(kv => Array(kv[ 1 ]).fill(kv[ 0 ])));

  // Test it can count properly
  const h = new FrequencyMutable();
  aSeries.forEach(d => {
    h.add(d);
  })
  arrayValuesEqual(t, h.toArray(), a, isEqualValueDefault);

  // Test frequencyOf
  t.is(h.frequencyOf(`pineapple`), 9);
  t.true(h.frequencyOf(`notfound`) === undefined);

  // Test iterators
  const aKeys = Array.from(h.keys());
  arrayValuesEqual(t, aKeys, [ `apple`, `orange`, `zebra`, `banana`, `pineapple` ]);

  const aValues = Array.from(h.values());
  arrayValuesEqual(t, aValues, [ 10, 2, 1, 3, 9 ]);

  // Should work
  h.add(null);
  t.is(h.frequencyOf(null), 1);

  // Should throw
  t.throws(() => h.add(undefined));

  h.clear();
  t.true(h.toArray().length === 0);

});

test(`events-add`, t => {
  t.plan(2);
  const h2 = new FrequencyMutable();
  h2.addEventListener(`change`, ev => {
    t.assert(true);
  });
  h2.add('hello');
  h2.add('there');
});

test(`events-clear`, t => {
  const h2 = new FrequencyMutable();
  h2.add('hello', 'there');

  h2.addEventListener(`change`, ev => {
    t.assert(true);
  });
  h2.clear();
});
