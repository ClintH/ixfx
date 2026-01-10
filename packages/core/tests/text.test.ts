import { test, expect, describe } from 'vitest';
/* eslint-disable */
import {
  startsEnds,
  abbreviate,
  beforeMatch,
  afterMatch,
  between,
  betweenChomp,
  omitChars,
  splitByLength,
  beforeAfterMatch,
  wildcard,
} from '../src/text.js';

describe(`text`, () => {
  test('wildcard', () => {
    expect(wildcard(`bird*`)(`bird123`)).toBe(true);
    expect(wildcard(`bird*`)(`birdd123`)).toBe(true);
    expect(wildcard(`bird*`)(` bird123`)).toBe(false);

    expect(wildcard(`*bird`)(`123bird`)).toBe(true);
    expect(wildcard(`*bird`)(`123bird `)).toBe(false);

    expect(wildcard(`*bird*`)(`bird123`)).toBe(true);
    expect(wildcard(`*bird*`)(`123bird123`)).toBe(true);
    expect(wildcard(`*bird*`)(`123bird`)).toBe(true);

    expect(wildcard(`*bird*`)(`bir`)).toBe(false);


    expect(wildcard(`*bird*bird*`)(`bird123bird`)).toBe(true);
    expect(wildcard(`*bird*bird*`)(`123bird123bird123`)).toBe(true);

    expect(wildcard(`should noo*oot match`)(`should not match`)).toBe(false);

  });

  test('abbreviate', () => {
    expect(abbreviate(`This is something`, 100)).toBe(`This is something`);
    expect(abbreviate(`This is something`, 7)).toBe(`This is...`);
    expect(abbreviate(`abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz`, 5)).toBe(`abcde...`);
    expect(abbreviate(`abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz`, 20)).toBe(`abcdefghi...rstuvwxyz`);
  });

  test('beforeAfterMatch', () => {
    expect(beforeAfterMatch('T', '.')).toEqual([ `T`, `T` ]);
    expect(beforeAfterMatch('T', '.', { ifNoMatch: `fallback`, fallback: `x` })).toEqual([ `x`, `x` ]);
    expect(beforeAfterMatch('T', '.', { ifNoMatch: `original`, fallback: `x` })).toEqual([ `T`, `T` ]);
    expect(() => { beforeAfterMatch(`T`, `.`, { ifNoMatch: `throw` }) }).toThrow();

    expect(beforeAfterMatch('.T', '.')).toEqual([ ``, `T` ]);
    expect(beforeAfterMatch('.', '.')).toEqual([ ``, `` ]);

    expect(beforeAfterMatch('Hello.There', '.')).toEqual([ `Hello`, 'There' ]);
    expect(beforeAfterMatch('Hello.There.Poppet', '.')).toEqual([ `Hello`, 'There.Poppet' ]);
    expect(beforeAfterMatch('Hello.There.Poppet', '.', { fromEnd: true })).toEqual([ `Hello.There`, 'Poppet' ]);
    expect(beforeAfterMatch('Hello.There.Poppet', `!`)).toEqual([ 'Hello.There.Poppet', 'Hello.There.Poppet' ]);

    expect(beforeAfterMatch('Hello.There.Poppet', '.', { startPos: 6 })).toEqual([ `Hello.There`, 'Poppet' ]);
  });

  test('afterMatch', () => {
    expect(afterMatch('T', '.')).toBe('T');
    expect(afterMatch('T', '.', { ifNoMatch: `fallback`, fallback: `x` })).toBe('x');
    expect(afterMatch('T', '.', { fallback: `x` })).toBe('x');
    expect(() => afterMatch(`T`, `.`, { ifNoMatch: `throw` })).toThrow();

    expect(afterMatch('.T', '.')).toBe('T');
    expect(afterMatch('.', '.')).toBe('');

    expect(afterMatch('Hello.There', '.')).toBe('There');
    expect(afterMatch('Hello.There.Poppet', '.')).toBe('There.Poppet');
    expect(afterMatch('Hello.There.Poppet', '.', { fromEnd: true })).toBe('Poppet');
    expect(afterMatch('Hello.There.Poppet', '!')).toBe('Hello.There.Poppet');

    expect(afterMatch('Hello.There.Poppet', '.', { startPos: 6 })).toBe('Poppet');

  });

  test('beforeMatch', () => {
    expect(beforeMatch('H', '.')).toBe('H');
    expect(beforeMatch('T', '.', { ifNoMatch: `fallback`, fallback: `x` })).toBe('x');
    expect(beforeMatch('T', '.', { fallback: `x` })).toBe('x');
    expect(() => beforeMatch(`T`, `.`, { ifNoMatch: `throw` })).toThrow();

    expect(beforeMatch('H.', '.')).toBe('H');
    expect(beforeMatch('.', '.')).toBe('');

    expect(beforeMatch('Hello.There', '.')).toBe('Hello');
    expect(beforeMatch('Hello.There.Poppet', '.')).toBe('Hello');
    expect(beforeMatch('Hello.There.Poppet', '.', { fromEnd: true })).toBe('Hello.There');
    expect(beforeMatch('Hello.There.Poppet', '!')).toBe('Hello.There.Poppet');

    expect(beforeMatch('Hello.There.Poppet', '.', { startPos: 6 })).toBe('Hello.There');

    // With fallback
    expect(beforeMatch(`Hello There`, '!', { fallback: `Bob` })).toBe(`Bob`);
    expect(() => beforeMatch(`Hello There`, '!', { ifNoMatch: `throw` })).toThrow();
    expect(beforeMatch(`Hello There`, '!', { ifNoMatch: `original` })).toBe(`Hello There`);
    expect(() => beforeMatch(`Hello There`, '!', { ifNoMatch: `fallback` })).toThrow();

    expect(beforeMatch(`a.b.c.d`, `.`, { fromEnd: true })).toBe(`a.b.c`);
  });

  test('splitByLength', () => {
    const t1 = 'hello there';
    const t11 = splitByLength(t1, 2);
    expect(t11).toEqual([ 'he', 'll', 'o ', 'th', 'er', 'e' ]);

    // Test with chunk size longer than input string
    const t2 = 'hello';
    const t22 = splitByLength(t2, 5);
    expect(t22).toEqual([ 'hello' ]);
    const t23 = splitByLength(t2, 50);
    expect(t23).toEqual([ 'hello' ]);

  });

  test('omitChars', () => {
    expect(omitChars('hello there', 1, 3)).toBe('ho there');
  });

  test(`startsEnds`, () => {
    expect(startsEnds(`test`, `t`)).toBe(true);
    expect(startsEnds(`test`, `T`)).toBe(false);
    expect(startsEnds(`This is a test`, `This`, `test`)).toBe(true);
    expect(startsEnds(`This is a test`, `this`, `Test`)).toBe(false);
    expect(startsEnds(`This is a test`, `This`, `not`)).toBe(false);
  });

  test(`between`, () => {
    expect(between('hello [there] pal', '[', ']')).toBe('there');
    expect(between('hello [there] p]al', '[', ']')).toBe('there] p');
    expect(between('hello [there] p]al', '[', ']', false)).toBe('there');
    expect(between('hello !there! pal', '!')).toBe('there');

    expect(between('hello [there pal', '[', ']') === undefined).toBe(true);
    expect(between('hello there] pal', '[', ']') === undefined).toBe(true);
  });

  test(`betweenChomp`, () => {
    const r1 = betweenChomp('hello [there] pal', '[', ']');

    expect(r1[ 1 ]).toBe('there');
    expect(r1[ 0 ]).toBe('hello  pal');

    const r2 = betweenChomp('hello [there] p]al', '[', ']');
    expect(r2[ 1 ]).toBe('there] p');
    expect(r2[ 0 ]).toBe('hello al');

    const r3 = betweenChomp('hello [there] p]al', '[', ']', false);
    expect(r3[ 1 ]).toBe('there');
    expect(r3[ 0 ]).toBe('hello  p]al');

    const r4 = betweenChomp('hello !there! pal', '!');
    expect(r4[ 1 ]).toBe('there');
    expect(r4[ 0 ]).toBe('hello  pal');

    const r5 = betweenChomp('hello [there] pal', '{', '}');
    expect(r5[ 0 ]).toBe('hello [there] pal');
    expect(r5[ 1 ] === undefined).toBe(true);

    const r6 = betweenChomp(`test[1]`, `[`, `]`);
    expect(r6[ 1 ]).toBe(`1`);
    expect(r6[ 0 ]).toBe(`test`);

    // @ts-expect-error
    expect(() => betweenChomp(1, `st`)).toThrow();

    // @ts-expect-error
    expect(() => betweenChomp(``, {})).toThrow();

    // @ts-expect-error
    expect(() => betweenChomp(``, `st`, {})).toThrow();

  });
});