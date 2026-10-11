import { expect, it } from 'vitest';
import { parseUrlParameters } from '../src/url-parameters.js';

it(`string params`, () => {
  const p = parseUrlParameters(`https://example.com/?name=alice&empty=`);

  expect(p.string(`name`)).toBe(`alice`);
  // Present but empty: `empty=` is an empty string, not the default
  expect(p.string(`empty`, `fallback`)).toBe(``);
  // Missing: default is used
  expect(p.string(`missing`, `fallback`)).toBe(`fallback`);
});

it(`int params`, () => {
  const p = parseUrlParameters(`https://example.com/?size=10&bad=abc&float=1.5`);

  expect(p.int(`size`)).toBe(10);
  expect(p.int(`size`, 99)).toBe(10);
  // Missing: default (NaN by default)
  expect(p.int(`missing`)).toBeNaN();
  expect(p.int(`missing`, 5)).toBe(5);
  // Unparseable yields NaN
  expect(p.int(`bad`)).toBeNaN();
  // Truncates rather than rejects
  expect(p.int(`float`)).toBe(1);
});

it(`float params`, () => {
  const p = parseUrlParameters(`https://example.com/?x=1.5&bad=abc`);

  expect(p.float(`x`)).toBe(1.5);
  expect(p.float(`missing`, 0.5)).toBe(0.5);
  expect(p.float(`bad`)).toBeNaN();
});

it(`bool params`, () => {
  const p = parseUrlParameters(`https://example.com/?flag=true&off=false&other=1`);

  expect(p.bool(`flag`)).toBe(true);
  // Only the literal 'true' counts
  expect(p.bool(`off`)).toBe(false);
  expect(p.bool(`other`)).toBe(false);
  expect(p.bool(`missing`)).toBe(false);
});

it(`raw params are exposed`, () => {
  const p = parseUrlParameters(`https://example.com/?a=1&b=2`);
  expect(p.params.get(`a`)).toBe(`1`);
  expect(p.params.get(`b`)).toBe(`2`);
});
