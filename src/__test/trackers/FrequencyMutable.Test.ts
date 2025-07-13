import expect from 'expect';
/* eslint-disable */
import type { KeyValue } from '../../PrimitiveTypes.js';
import { FrequencyTracker } from '../../trackers/FrequencyMutable.js';
import { shuffle } from '../../data/arrays/Random.js';
import { arrayValuesEqual } from '../Include.js';
import { isEqualValueDefault } from '../../util/IsEqual.js';

test(`sorting`, () => {
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
  const h = new FrequencyTracker();
  aSeries.forEach(d => {
    h.add(d);
  })
  arrayValuesEqual(t, h.toArray(), a, isEqualValueDefault);

  // Test frequencyOf
  expect(h.frequencyOf(`pineapple`)).toBe(9);
  expect(h.frequencyOf(`notfound`) === undefined).toBe(true);

  // Test iterators
  const aKeys = Array.from(h.keys());
  arrayValuesEqual(t, aKeys, [ `apple`, `orange`, `zebra`, `banana`, `pineapple` ]);

  const aValues = Array.from(h.values());
  arrayValuesEqual(t, aValues, [ 10, 2, 1, 3, 9 ]);

  // Should work
  h.add(null);
  expect(h.frequencyOf(null)).toBe(1);

  // Should throw
  expect(() => h.add(undefined)).toThrow();

  h.clear();
  expect(h.toArray().length === 0).toBe(true);

});

test(`events-add`, () => {
  expect.assertions(2);
  const h2 = new FrequencyTracker();
  h2.addEventListener(`change`, ev => {
    t.assert(true);
  });
  h2.add('hello');
  h2.add('there');
});

test(`events-clear`, () => {
  const h2 = new FrequencyTracker();
  h2.add('hello', 'there');

  h2.addEventListener(`change`, ev => {
    t.assert(true);
  });
  h2.clear();
});
