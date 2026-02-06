import { expect, test, describe } from 'vitest';
import { intervalToMs, isInterval, elapsedToHumanString, isDateObject } from '../src/interval-type.js';

describe('isDateObject', () => {
  test('returns true for Date objects', () => {
    expect(isDateObject(new Date())).toBe(true);
    expect(isDateObject(new Date('2024-01-01'))).toBe(true);
  });

  test('returns false for non-Date values', () => {
    expect(isDateObject(null)).toBe(false);
    expect(isDateObject(undefined)).toBe(false);
    expect(isDateObject('2024-01-01')).toBe(false);
    expect(isDateObject(1704067200000)).toBe(false);
    expect(isDateObject({})).toBe(false);
    expect(isDateObject([])).toBe(false);
  });
});

describe('elapsedToHumanString', () => {
  test('formats milliseconds', () => {
    expect(elapsedToHumanString(100)).toBe('100ms');
    expect(elapsedToHumanString(999)).toBe('999ms');
  });

  test('formats seconds', () => {
    expect(elapsedToHumanString(10 * 1000)).toBe('10.0secs');
    expect(elapsedToHumanString(119 * 1000)).toBe('119.0secs');
  });

  test('formats minutes', () => {
    expect(elapsedToHumanString(2 * 60 * 1000)).toBe('2.00mins');
    expect(elapsedToHumanString(59 * 60 * 1000)).toBe('59.00mins');
  });

  test('formats hours', () => {
    expect(elapsedToHumanString(60 * 60 * 1000)).toBe('1.00hrs');
    expect(elapsedToHumanString(2.5 * 60 * 60 * 1000)).toBe('2.50hrs');
  });

  test('accepts functions', () => {
    const fn = () => 100;
    expect(elapsedToHumanString(fn)).toBe('100ms');
  });

  test('accepts zero with rounding', () => {
    const elapsed = () => 0;
    expect(elapsedToHumanString(elapsed, 0)).toBe('0ms');
  });

  test('accepts interval objects', () => {
    expect(elapsedToHumanString({ millis: 100 })).toBe('100ms');
    expect(elapsedToHumanString({ secs: 2 })).toBe('2.0secs');
    // 1 min = 60 secs, which is < 120, so shows as secs
    expect(elapsedToHumanString({ mins: 1 })).toBe('60.0secs');
    expect(elapsedToHumanString({ hours: 1 })).toBe('1.00hrs');
  });
});

describe('isInterval', () => {
  test('returns true for valid intervals', () => {
    expect(isInterval(10)).toBe(true);
    expect(isInterval({ millis: 100 })).toBe(true);
    expect(isInterval({ secs: 10 })).toBe(true);
    expect(isInterval({ mins: 10 })).toBe(true);
    expect(isInterval({ hours: 1 })).toBe(true);

    expect(isInterval({ secs: 10, millis: 100 })).toBe(true);
    expect(isInterval({ mins: 10, secs: 10, millis: 100 })).toBe(true);
    expect(isInterval({ hours: 2, mins: 10, secs: 10, millis: 100 })).toBe(true);
  });

  test('returns false for invalid intervals', () => {
    // @ts-ignore
    expect(isInterval({ millis: false })).toBe(false);
    // @ts-ignore
    expect(isInterval({ millis: 'hello' })).toBe(false);
    // @ts-ignore
    expect(isInterval({ millis: undefined })).toBe(false);
    // @ts-ignore
    expect(isInterval({ millis: null })).toBe(false);
    // @ts-ignore
    expect(isInterval({ millis: Number.NaN })).toBe(false);

    expect(isInterval(Number.NaN)).toBe(false);

    // @ts-ignore
    expect(isInterval(undefined)).toBe(false);
    // @ts-ignore
    expect(isInterval(null)).toBe(false);
    // @ts-ignore
    expect(isInterval('hello')).toBe(false);
    // @ts-ignore
    expect(isInterval(false)).toBe(false);
    // @ts-ignore
    expect(isInterval(true)).toBe(false);
    // @ts-ignore
    expect(isInterval({ gorp: 10 })).toBe(false);
  });
});

describe('intervalToMs', () => {
  test('converts millis to ms', () => {
    expect(intervalToMs({ millis: 1000 })).toBe(1000);
  });

  test('converts secs to ms', () => {
    expect(intervalToMs({ secs: 1 })).toBe(1000);
  });

  test('converts combined units to ms', () => {
    expect(intervalToMs({ millis: 1000, secs: 1 })).toBe(2000);
  });

  test('converts mins to ms', () => {
    expect(intervalToMs({ mins: 1 })).toBe(60 * 1000);
    expect(intervalToMs({ mins: 1, secs: 1 })).toBe(60 * 1000 + 1000);
  });

  test('converts hours to ms', () => {
    expect(intervalToMs({ hours: 1 })).toBe(60 * 60 * 1000);
    expect(intervalToMs({ hours: 1, mins: 1, secs: 1 })).toBe(60 * 60 * 1000 + 60 * 1000 + 1000);
  });

  test('uses default value when interval is undefined', () => {
    expect(intervalToMs(undefined, 10)).toBe(10);
  });

  test('throws when interval is undefined and no default', () => {
    expect(() => intervalToMs(undefined)).toThrow();
  });

  test('throws for invalid interval types', () => {
    // @ts-expect-error
    expect(() => intervalToMs(null)).toThrow();
    // @ts-expect-error
    expect(intervalToMs(null, 10)).toBe(10);
    // @ts-expect-error
    expect(() => intervalToMs(`hello`)).toThrow();
    // @ts-expect-error
    expect(intervalToMs(`hello`, 10)).toBe(10);
    // @ts-expect-error
    expect(() => intervalToMs({ blerg: 10 })).toThrow();
    // @ts-expect-error
    expect(intervalToMs({ blerg: 10 }, 10)).toBe(10);
  });
});
