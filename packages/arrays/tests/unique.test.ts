import { test, expect, assert } from 'vitest';
import * as Arrays from '../src/index.js';

test('default', () => {
  expect(Arrays.unique([])).toStrictEqual([])

  const a = [ 1, 2, 3, 1, 2, 3, 4 ];
  assert.sameDeepMembers(Arrays.unique(a), [ 1, 2, 3, 4 ]);

  const b = [ 1, 2, 3, 4, 5, 6, 7, 8 ];
  assert.sameDeepMembers(Arrays.unique<number>([ a, b ]), [ 1, 2, 3, 4, 5, 6, 7, 8 ]);

  const c = [
    { name: 'Bob', v: 1 },
    { name: 'Sally', v: 2 },
    { name: 'Bob', v: 3 },
    { name: 'Sally', v: 2 }
  ];
  assert.sameDeepMembers(Arrays.unique(c), [
    { name: 'Bob', v: 1 },
    { name: 'Sally', v: 2 },
    { name: 'Bob', v: 3 } ]
  );

  const d1 = [ 1, 2, 3, 3 ];
  const d2 = [ 2, 3, 4, 5, 6, 6 ];
  assert.sameDeepMembers(Arrays.unique<number>([ d1, d2 ]), [ 1, 2, 3, 4, 5, 6 ])
});

type Person = {
  name: string;
  v: number;
};


test('eq', () => {
  const p1 = { name: 'Bob', v: 1 }
  const p2 = { name: 'Sally', v: 2 }
  const p3 = { name: 'Bob', v: 3 }
  const c = [ p1, p2, p3 ]

  // Only two because we're checking based on name only
  const eq = (a: Person, b: Person) => a.name === b.name;
  assert.sameDeepMembers<Person>(
    Arrays.unique<Person>(c, eq),
    [
      p1,
      p2,
    ]
  );

  // Check based on instance
  const eqDefault = (a: Person, b: Person) => a === b;
  assert.sameDeepMembers<Person>(
    Arrays.unique<Person>(c, eqDefault),
    [ p1, p2, p3 ]
  );
});
