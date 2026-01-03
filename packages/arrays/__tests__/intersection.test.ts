
import { test, expect, assert } from 'vitest';
import * as Arrays from '../src/index.js';

test(`default`, () => {
  expect(Arrays.intersection([ 1, 2, 3 ], [ 2, 4, 6 ])).toEqual([ 2 ]);
  expect(Arrays.intersection([ 1, 2, 3 ], [ 4, 5, 6 ])).toEqual([]);
  expect(Arrays.intersection([ 1, 2, 3, 3 ], [ 3, 2, 1 ])).toEqual([ 3, 2, 1 ]);

  const p1 = { name: 'Bob', v: 1 }
  const p2 = { name: 'Sally', v: 2 }
  const p3 = { name: 'Bob', v: 3 }
  const p4 = { name: 'Jane', v: 3 }
  const p5 = { name: 'Sally', v: 2 }

  const pp1 = { name: 'Bob', v: 1 }
  const pp2 = { name: 'Sally', v: 2 }
  const pp3 = { name: 'Bob', v: 3 }
  const pp4 = { name: 'Jane', v: 3 }
  const pp5 = { name: 'Sally', v: 2 }

  // -- Compare by string value
  // same objects, just different order
  expect(Arrays.intersection([ p1, p2, p3 ], [ p3, p1, p2 ])).toEqual([ p3, p1, p2 ]);
  // some additional objects
  expect(Arrays.intersection([ p4, p1, p2, p3 ], [ p5, p3, p1, p2 ])).toEqual([ p2, p3, p1 ]);

  // -- Compare by equality
  const eq = (a, b) => a === b
  // same objects, just different order
  expect(Arrays.intersection([ p1, p2, p3 ], [ p3, p1, p2 ], eq)).toEqual([ p1, p2, p3 ]);
  // some additional objects
  expect(Arrays.intersection([ p4, p1, p2, p3 ], [ p5, p3, p1, p2 ], eq)).toEqual([ p1, p2, p3 ]);
  // different instances, no match
  expect(Arrays.intersection([ p1, p2, p3 ], [ pp3, pp1, pp2 ], eq)).toEqual([]);
  // one shared instance
  expect(Arrays.intersection([ p1, p2, p3 ], [ pp3, p1, pp2 ], eq)).toEqual([ p1 ]);

});

