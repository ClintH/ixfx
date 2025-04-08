import expect from 'expect';
import { intervalToMs, isInterval, elapsedToHumanString } from '../../flow/IntervalType.js';


test('elapsedToHumanString', () => {
  expect(elapsedToHumanString(100)).toBe('100ms');
  expect(elapsedToHumanString(10 * 1000)).toBe('10.0secs');

  const fn = () => 100;
  expect(elapsedToHumanString(fn)).toBe('100ms');

  const elapsed = () => 0;
  expect(elapsedToHumanString(elapsed, 0)).toBe('0ms');
});


test('interval-type', () => {
  expect(isInterval(10)).toBe(true);
  expect(isInterval({ millis: 100 })).toBe(true);
  expect(isInterval({ secs: 10 })).toBe(true);
  expect(isInterval({ mins: 10 })).toBe(true);
  expect(isInterval({ hours: 1 })).toBe(true);

  expect(isInterval({ secs: 10, millis: 100 })).toBe(true);
  expect(isInterval({ mins: 10, secs: 10, millis: 100 })).toBe(true);
  expect(isInterval({ hours: 2, mins: 10, secs: 10, millis: 100 })).toBe(true);

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

test('interval-type-to-ms', () => {
  expect(intervalToMs({ millis: 1000 })).toBe(1000);

  expect(intervalToMs({ secs: 1 })).toBe(1000);

  expect(intervalToMs({ millis: 1000, secs: 1 })).toBe(2000);

  expect(intervalToMs({ mins: 1 })).toBe(60 * 1000);
  expect(intervalToMs({ mins: 1, secs: 1 })).toBe(60 * 1000 + 1000);

  expect(intervalToMs({ hours: 1 })).toBe(60 * 60 * 1000);
  expect(intervalToMs({ hours: 1, mins: 1, secs: 1 })).toBe(60 * 60 * 1000 + 60 * 1000 + 1000);

  expect(intervalToMs(undefined, 10)).toBe(10);
  expect(() => intervalToMs(undefined)).toThrow();
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