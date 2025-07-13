import { test, expect, describe } from 'vitest';
import { jsComparer, numericComparer, comparerInverse, defaultComparer } from '../src/comparers.js';

describe(`comparers`, () => {
  test('jsComparer', () => {
    const r1 = [ 1, 2, 3, 4 ];
    const r1SortedA = [ ...r1 ].sort();
    const r1SortedB = [ ...r1 ].sort(jsComparer);
    expect(r1SortedA).toEqual(r1SortedB);

    const r2 = [ 4, 3, 2, 1 ];
    const r2SortedA = [ ...r2 ].sort();
    const r2SortedB = [ ...r2 ].sort(jsComparer);
    expect(r2SortedA).toEqual(r2SortedB);

    const r3 = [ 'oranges', 'apples' ];
    const r3SortedA = [ ...r3 ].sort();
    const r3SortedB = [ ...r3 ].sort(jsComparer);
    expect(r3SortedA).toEqual(r3SortedB);

    // Test weird sorting default
    const r4 = [ 10, 20, 5, 100 ];
    const r4SortedA = [ ...r4 ].sort();
    const r4SortedB = [ ...r4 ].sort(jsComparer);
    expect(r4SortedA).toEqual(r4SortedB);
  });

  test('numericComparer', () => {
    expect([ 10, -20, 5, -100 ].sort(numericComparer)).toEqual([ -100, -20, 5, 10 ]);
    expect([ 10, 20, 5, 100 ].sort(numericComparer)).toEqual([ 5, 10, 20, 100 ]);
    expect([ 10, 20, 0, 0, 100 ].sort(numericComparer)).toEqual([ 0, 0, 10, 20, 100 ]);

    // Inverted
    expect(
      [ 10, -20, 5, -100 ].sort(comparerInverse(numericComparer))).toEqual(
        [ 10, 5, -20, -100 ]
      );
    expect(
      [ 10, 20, 5, 100 ].sort(comparerInverse(numericComparer))).toEqual(
        [ 100, 20, 10, 5 ]
      );
    expect(
      [ 10, 20, 0, 0, 100 ].sort(comparerInverse(numericComparer))).toEqual(
        [ 100, 20, 10, 0, 0 ]
      );
  });

  test('defaultComparer', () => {
    expect([ 10, -20, 5, -100 ].sort(defaultComparer)).toEqual([ -100, -20, 5, 10 ]);
    expect([ 10, 20, 5, 100 ].sort(defaultComparer)).toEqual([ 5, 10, 20, 100 ]);
    expect([ 10, 20, 0, 0, 100 ].sort(defaultComparer)).toEqual([ 0, 0, 10, 20, 100 ]);
    //eslint-disable-next-line functional/immutable-data
    expect('a b c d e'.split(' ').sort(defaultComparer)).toEqual('a b c d e'.split(' '));
    //eslint-disable-next-line functional/immutable-data
    expect('e d c b a'.split(' ').sort(defaultComparer)).toEqual('a b c d e'.split(' '));

    // Inverted
    expect(
      [ 10, -20, 5, -100 ].sort(comparerInverse(defaultComparer))).toEqual(
        [ 10, 5, -20, -100 ]
      );
    expect(
      [ 10, 20, 5, 100 ].sort(comparerInverse(defaultComparer))).toEqual(
        [ 100, 20, 10, 5 ]
      );
    expect(
      [ 10, 20, 0, 0, 100 ].sort(comparerInverse(defaultComparer))).toEqual(
        [ 100, 20, 10, 0, 0 ]
      );
    expect(
      //eslint-disable-next-line functional/immutable-data
      'a b c d e'.split(' ').sort(comparerInverse(defaultComparer))).toEqual(
        'e d c b a'.split(' ')
      );
    expect(
      //eslint-disable-next-line functional/immutable-data
      'e d c b a'.split(' ').sort(comparerInverse(defaultComparer))).toEqual(
        'e d c b a'.split(' ')
      );
  });
});