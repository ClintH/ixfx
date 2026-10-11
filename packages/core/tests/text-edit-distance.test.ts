import { expect, it } from 'vitest';
import { levenshteinOps } from '../src/text-edit-distance.js';

it(`identical strings: all keeps`, () => {
  expect(levenshteinOps(`abc`, `abc`)).toEqual([
    { type: `keep`, char: `a` },
    { type: `keep`, char: `b` },
    { type: `keep`, char: `c` },
  ]);
});

it(`empty to string: all inserts`, () => {
  expect(levenshteinOps(``, `abc`)).toEqual([
    { type: `insert`, char: `a` },
    { type: `insert`, char: `b` },
    { type: `insert`, char: `c` },
  ]);
});

it(`string to empty: all deletes`, () => {
  expect(levenshteinOps(`abc`, ``)).toEqual([
    { type: `delete`, char: `a` },
    { type: `delete`, char: `b` },
    { type: `delete`, char: `c` },
  ]);
});

it(`single replacement`, () => {
  expect(levenshteinOps(`cat`, `cut`)).toEqual([
    { type: `keep`, char: `c` },
    { type: `replace`, from: `a`, to: `u` },
    { type: `keep`, char: `t` },
  ]);
});

it(`ops transform a into b`, () => {
  const cases: Array<[ string, string ]> = [
    [`kitten`, `sitting`],
    [`flaw`, `lawn`],
    [`sunday`, `saturday`],
    [`acbd`, `abcd`],
  ];
  for (const [a, b] of cases) {
    let out = ``;
    for (const op of levenshteinOps(a, b)) {
      if (op.type === `keep` || op.type === `insert`)
        out += op.char;
      if (op.type === `replace`)
        out += op.to;
      // deletes contribute nothing
    }
    expect(out, `transforming '${a}' -> '${b}'`).toBe(b);
  }
});

it(`non-string input throws`, () => {
  expect(() => levenshteinOps(1 as any, `a`)).toThrow(TypeError);
  expect(() => levenshteinOps(`a`, null as any)).toThrow(TypeError);
});
