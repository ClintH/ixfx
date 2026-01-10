import { expect, describe, test } from 'vitest';
import * as N from '../src/index.js';

describe(`basics`, () => {
  test('slice', () => {
    const r1 = [ ...N.slice([ 0, 1, 2, 3, 4, 5 ]) ];
    expect(r1).toEqual([ 0, 1, 2, 3, 4, 5 ]);

    const r2 = [ ...N.slice([ 0, 1, 2, 3, 4, 5 ], 3) ];
    expect(r2).toEqual([ 3, 4, 5 ]);

    const r3 = [ ...N.slice([ 0, 1, 2, 3, 4, 5 ], 3, 4) ];
    expect(r3).toEqual([ 3, 4 ]);

    const r4 = [ ...N.slice([ 0, 1, 2, 3, 4, 5 ], 0, 2) ];
    expect(r4).toEqual([ 0, 1, 2 ]);
  });
})