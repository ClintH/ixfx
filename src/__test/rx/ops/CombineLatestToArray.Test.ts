import expect from 'expect';
import * as Rx from '../../../rx/index.js';

test(`combine-latest-as-array`, async () => {
  const s1 = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
  const s2 = [ 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 ];
  const createSources = () => ([
    Rx.From.array(s1, { interval: 1 }),
    Rx.From.array(s2, { interval: 20 })
  ])

  // Test 1 - Break when a source completes
  const r1 = Rx.combineLatestToArray(createSources(), { onSourceDone: `break` });
  const r1Array = await Rx.toArray(r1);

  // Since source 1 runs and completes before source 2 even has a chance to produce:
  expect(r1Array).toEqual([
    [ 0, undefined ], [ 1, undefined ], [ 2, undefined ], [ 3, undefined ], [ 4, undefined ], [ 5, undefined ], [ 6, undefined ], [ 7, undefined ], [ 8, undefined ], [ 9, undefined ]
  ])

  // Test 2 - Allow sources to complete
  const r2 = Rx.combineLatestToArray(createSources(), { onSourceDone: `allow` });
  const r2Array = await Rx.toArray(r2) as number[][];

  // First half array will be first source, with _undefined_ for second source since it's too slow
  for (let i = 0; i < 1; i++) {
    expect(r2Array[ i ][ 0 ]).toBe(i);
    expect(r2Array[ i ][ 1 ]).toBeFalsy();
  }

  // Second half of array will be last value of first source along with second source values
  for (let i = 10; i < 20; i++) {
    expect(r2Array[ i ][ 0 ]).toBe(9);
    expect(r2Array[ i ][ 1 ]).toBe(i);

  }
});