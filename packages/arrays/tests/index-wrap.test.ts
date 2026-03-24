import { describe, expect, it } from "vitest";
import { indexWrap } from '../src/index-wrap.js';

describe(`index-wrap`, () => {
  it(`within-range`, () => {
    // Within range
    expect(indexWrap(2, 2, 5, `bounce`)).toStrictEqual({ index: 2, iterations: 0 });
    expect(indexWrap(3, 2, 5, `bounce`)).toStrictEqual({ index: 3, iterations: 0 });
    expect(indexWrap(4, 2, 5, `bounce`)).toStrictEqual({ index: 4, iterations: 0 });
    expect(indexWrap(5, 2, 5, `bounce`)).toStrictEqual({ index: 5, iterations: 0 });
  });

  it(`bounce`, () => {
    // Default logic: reverse. [2,3,4,5]
    expect(indexWrap(1, 2, 5, `bounce`)).toStrictEqual({ index: 3, iterations: 1 });
    expect(indexWrap(0, 2, 5, `bounce`)).toStrictEqual({ index: 4, iterations: 1 });
    expect(indexWrap(-1, 2, 5, `bounce`)).toStrictEqual({ index: 5, iterations: 1 });
    expect(indexWrap(-2, 2, 5, `bounce`)).toStrictEqual({ index: 4, iterations: 2 });
    expect(indexWrap(-3, 2, 5, `bounce`)).toStrictEqual({ index: 3, iterations: 2 });

    expect(indexWrap(6, 2, 5, `bounce`)).toStrictEqual({ index: 4, iterations: 1 });
    expect(indexWrap(7, 2, 5, `bounce`)).toStrictEqual({ index: 3, iterations: 1 });
    expect(indexWrap(8, 2, 5, `bounce`)).toStrictEqual({ index: 2, iterations: 1 });
    expect(indexWrap(9, 2, 5, `bounce`)).toStrictEqual({ index: 3, iterations: 2 });
  });

  it(`cycle`, () => {
    expect(indexWrap(1, 2, 5, `cycle`)).toStrictEqual({ index: 4, iterations: 1 });
    expect(indexWrap(0, 2, 5, `cycle`)).toStrictEqual({ index: 3, iterations: 1 });
    expect(indexWrap(-1, 2, 5, `cycle`)).toStrictEqual({ index: 2, iterations: 1 });
    expect(indexWrap(-2, 2, 5, `cycle`)).toStrictEqual({ index: 4, iterations: 2 });
    expect(indexWrap(-3, 2, 5, `cycle`)).toStrictEqual({ index: 3, iterations: 2 });

    expect(indexWrap(6, 2, 5, `cycle`)).toStrictEqual({ index: 3, iterations: 1 });
    expect(indexWrap(7, 2, 5, `cycle`)).toStrictEqual({ index: 4, iterations: 1 });
    expect(indexWrap(8, 2, 5, `cycle`)).toStrictEqual({ index: 5, iterations: 1 });
    expect(indexWrap(9, 2, 5, `cycle`)).toStrictEqual({ index: 3, iterations: 2 });
  });

  it(`brickwall`, () => {
    expect(indexWrap(1, 2, 5, `brickwall`)).toStrictEqual({ index: 2, iterations: 0 });
    expect(indexWrap(0, 2, 5, `brickwall`)).toStrictEqual({ index: 2, iterations: 0 });
    expect(indexWrap(-1, 2, 5, `brickwall`)).toStrictEqual({ index: 2, iterations: 0 });
    expect(indexWrap(-2, 2, 5, `brickwall`)).toStrictEqual({ index: 2, iterations: 0 });

    expect(indexWrap(6, 2, 5, `brickwall`)).toStrictEqual({ index: 5, iterations: 0 });
    expect(indexWrap(7, 2, 5, `brickwall`)).toStrictEqual({ index: 5, iterations: 0 });
  });
});
