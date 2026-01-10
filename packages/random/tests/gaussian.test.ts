



import { expect, test } from "vitest";
import * as R from '../src/index.js';
import { rangeIntegerTest, rangeTest } from '@ixfx/guards';
import { frequencyByGroup } from '../src/util/frequency.js';

const groupByTens = (v: number) => Math.floor(v * 10);

test(`gaussian`, () => {
  const tests = 10_000;
  const r1: number[] = [];
  const g = R.gaussianSource();
  while (r1.length < tests) {
    r1.push(g());
  };

  const frequency = [ ...frequencyByGroup(groupByTens, r1).entries() ];

  for (const entry of frequency) {
    // Calculate percentage and round down to an integer
    entry[ 1 ] = Math.floor((entry[ 1 ] / tests) * 10);
  }
  // Sort by the group
  frequency.sort((a, b) => a[ 0 ] > b[ 0 ] ? 1 : a[ 0 ] === b[ 0 ] ? 0 : -1);

  const shape1 = JSON.stringify(frequency) === JSON.stringify([
    [ 1, 0 ], [ 2, 0 ],
    [ 3, 1 ], [ 4, 3 ],
    [ 5, 3 ], [ 6, 1 ],
    [ 7, 0 ], [ 8, 0 ]
  ]);
  const shape2 = JSON.stringify(frequency) === JSON.stringify([
    [ 0, 0 ], [ 1, 0 ],
    [ 2, 0 ], [ 3, 1 ],
    [ 4, 3 ], [ 5, 3 ],
    [ 6, 1 ], [ 7, 0 ],
    [ 8, 0 ], [ 9, 0 ]
  ]);
  const shape3 = JSON.stringify(frequency) === JSON.stringify([
    [ 1, 0 ], [ 2, 0 ],
    [ 3, 1 ], [ 4, 3 ],
    [ 5, 3 ], [ 6, 1 ],
    [ 7, 0 ], [ 8, 0 ]
  ]);
  const shape4 = JSON.stringify(frequency) === JSON.stringify([
    [ 1, 0 ], [ 2, 0 ],
    [ 3, 1 ], [ 4, 3 ],
    [ 5, 3 ], [ 6, 1 ],
    [ 7, 0 ], [ 8, 0 ],
    [ 9, 0 ]
  ]);
  const shape5 = JSON.stringify(frequency) === JSON.stringify([
    [ 0, 0 ], [ 1, 0 ],
    [ 2, 0 ], [ 3, 1 ],
    [ 4, 3 ], [ 5, 3 ],
    [ 6, 1 ], [ 7, 0 ],
    [ 8, 0 ]
  ]
  );

  const shape6 = JSON.stringify(frequency) === JSON.stringify([
    [ 1, 0 ], [ 2, 2 ],
    [ 3, 13 ], [ 4, 33 ],
    [ 5, 34 ], [ 6, 13 ],
    [ 7, 2 ], [ 8, 0 ]
  ]
  );
  const shape7 = JSON.stringify(frequency) === JSON.stringify([
    [ 0, 0 ], [ 1, 0 ],
    [ 2, 2 ], [ 3, 13 ],
    [ 4, 34 ], [ 5, 33 ],
    [ 6, 13 ], [ 7, 1 ],
    [ 8, 0 ]
  ]
  );

  expect(shape1 || shape2 || shape3 || shape4 || shape5 || shape6 || shape7).toBeTruthy();
});