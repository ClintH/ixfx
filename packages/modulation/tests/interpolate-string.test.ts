import type { StringInterpolateOptions } from '../src/interpolate-string.js';
import { Tokenise } from '@ixfx/core/text';

import { describe, expect, it } from 'vitest';
import { interpolateString, interpolatorByTokens, interpolatorCentered, interpolatorHuman } from '../src/interpolate-string.js';

describe(`interpolateString`, () => {
  it(`character`, async () => {
    const a = `hello there`;
    const b = `goodbye farewell`;

    const opts: StringInterpolateOptions = { style: `token`, tokenise: `character` };
    const i1 = interpolateString(0.5, a, b, opts);
    expect(i1).toBe(`goodbye ere`);

    const i2 = interpolateString(0.5, opts);
    expect(i2(a, b)).toBe(`goodbye ere`);

    const i3 = interpolateString(a, b, opts);
    expect(i3(0.5)).toBe(`goodbye ere`);
  });

  it(`word`, async () => {
    const a = `hello there`;
    const b = `goodbye farewell`;

    const opts: StringInterpolateOptions = { style: `token`, tokenise: `word` };
    const i1 = interpolateString(0.5, a, b, opts);
    expect(i1).toBe(`goodbye there`);

    const i2 = interpolateString(0.5, opts);
    expect(i2(a, b)).toBe(`goodbye there`);

    const i3 = interpolateString(a, b, opts);
    expect(i3(0.5)).toBe(`goodbye there`);
  });

  it(`byToken`, () => {
    let a = `abcde`;
    let b = `ABCDE`;
    let i = interpolatorByTokens(a, b, Tokenise.byCharacter());
    expect(i(0)).toBe(`abcde`);
    expect(i(0.25)).toBe(`Abcde`);
    expect(i(0.5)).toBe(`ABCde`);
    expect(i(0.75)).toBe(`ABCDe`);
    expect(i(1)).toBe(`ABCDE`);

    a = `hello`;
    b = `goodbye`;
    i = interpolatorByTokens(a, b, Tokenise.byCharacter());
    expect(i(0)).toBe(`hello`);
    expect(i(0.25)).toBe(`gollo`);
    expect(i(0.5)).toBe(`goodo`);
    expect(i(0.75)).toBe(`goodb`);
    expect(i(1)).toBe(`goodbye`);

    a = `hello there`;
    b = `goodbye and farewell`;
    i = interpolatorByTokens(a, b, Tokenise.byWord());
    expect(i(0)).toBe(`hello there`);
    expect(i(0.25)).toBe(`goodbye there `);
    expect(i(0.5)).toBe(`goodbye and `);
    expect(i(0.75)).toBe(`goodbye and `);
    expect(i(1)).toBe(`goodbye and farewell`);
  });

  it(`centered`, () => {
    let a = `abcde`;
    let b = `ABCDE`;
    let i = interpolatorCentered(a, b);
    expect(i(0)).toBe(`abcde`);
    expect(i(0.25)).toBe(`abCde`);
    expect(i(0.5)).toBe(`aBCDe`);
    expect(i(0.75)).toBe(`ABCDe`);
    expect(i(1)).toBe(`ABCDE`);

    a = `hello`;
    b = `goodbye`;
    i = interpolatorCentered(a, b);
    expect(i(0)).toBe(`hello`);
    expect(i(0.25)).toBe(`heodo`);
    expect(i(0.5)).toBe(`hoodb`);
    expect(i(0.75)).toBe(`hoodby`);
    expect(i(1)).toBe(`goodbye`);

    a = `hello there apple`;
    b = `goodbye and farewell banana`;
    i = interpolatorCentered(a, b, Tokenise.byWord());
    expect(i(0)).toBe(`hello there apple`);
    expect(i(0.25)).toBe(`hello and apple `);
    expect(i(0.5)).toBe(`hello and farewell `);
    expect(i(0.75)).toBe(`goodbye and farewell `);
    expect(i(1)).toBe(`goodbye and farewell banana`);
  });

  it(`human`, () => {
    let a = `abcde`;
    let b = `ABCDE`;
    let i = interpolatorHuman(a, b);
    expect(i(0)).toBe(`abcde`);
    expect(i(0.25)).toBe(`Abcde`);
    expect(i(0.5)).toBe(`ABCde`);
    expect(i(0.75)).toBe(`ABCDe`);
    expect(i(1)).toBe(`ABCDE`);

    a = `hello`;
    b = `goodbye`;
    i = interpolatorHuman(a, b);
    expect(i(0)).toBe(`hello`);
    expect(i(0.25)).toBe(`gohello`);
    expect(i(0.5)).toBe(`goodllo`);
    expect(i(0.75)).toBe(`goodblo`);
    expect(i(1)).toBe(`goodbye`);
  });
});