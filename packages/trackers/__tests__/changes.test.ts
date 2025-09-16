import { test, expect, assert } from 'vitest';
import * as C from '../src/changes.js';

test(`boolean`, () => {
  const f1 = C.trackBooleanChange({ includeFirstValueInCount: true });
  expect(f1(true)).toEqual({ changed: true, changes: 1, identicalRun: 0, total: 1 });
  expect(f1(true)).toEqual({ changed: false, changes: 1, identicalRun: 1, total: 2 });
  expect(f1(false)).toEqual({ changed: true, changes: 2, identicalRun: 0, total: 3 });
  expect(f1(true)).toEqual({ changed: true, changes: 3, identicalRun: 0, total: 4 });

  // @ts-expect-error testing bad params
  expect(() => f1(null)).toThrow();
  // @ts-expect-error testing bad params
  expect(() => f1()).toThrow();
  // @ts-expect-error testing bad params
  expect(() => f1(`hello`)).toThrow();
  // @ts-expect-error testing bad params
  expect(() => f1(10)).toThrow();

  const f2 = C.trackBooleanChange({ includeFirstValueInCount: false });
  expect(f2(true)).toEqual({ changed: true, changes: 0, identicalRun: 0, total: 1 });

  const f3 = C.trackBooleanChange({ initial: true });
  expect(f3(true)).toEqual({ changed: false, changes: 0, identicalRun: 1, total: 1 });
})

test(`number`, () => {

  // NaN: allow
  const f1 = C.trackNumberChange({ includeFirstValueInCount: true, nanHandling: `allow` });
  expect(f1(10)).toEqual({ changed: true, changes: 1, identicalRun: 0, total: 1 });
  expect(f1(10)).toEqual({ changed: false, changes: 1, identicalRun: 1, total: 2 });
  expect(f1(100)).toEqual({ changed: true, changes: 2, identicalRun: 0, total: 3 });
  expect(f1(Number.NaN)).toEqual({ changed: true, changes: 3, identicalRun: 0, total: 4 });
  expect(f1(Number.NaN)).toEqual({ changed: false, changes: 3, identicalRun: 1, total: 5 });
  expect(f1(10)).toEqual({ changed: true, changes: 4, identicalRun: 0, total: 6 });
  // @ts-expect-error testing bad params
  expect(() => f1(null)).toThrow();
  // @ts-expect-error testing bad params
  expect(() => f1()).toThrow();
  // @ts-expect-error testing bad params
  expect(() => f1(`hello`)).toThrow();
  // @ts-expect-error testing bad params
  expect(() => f1(false)).toThrow();

  // NaN: skip
  const f2 = C.trackNumberChange({ includeFirstValueInCount: true, nanHandling: `skip` });
  expect(f2(10)).toEqual({ changed: true, changes: 1, identicalRun: 0, total: 1 });
  expect(f2(10)).toEqual({ changed: false, changes: 1, identicalRun: 1, total: 2 });
  expect(f2(100)).toEqual({ changed: true, changes: 2, identicalRun: 0, total: 3 });
  expect(f2(Number.NaN)).toEqual({ changed: false, changes: 2, identicalRun: 0, total: 3 });
  expect(f2(Number.NaN)).toEqual({ changed: false, changes: 2, identicalRun: 0, total: 3 });
  expect(f2(10)).toEqual({ changed: true, changes: 3, identicalRun: 0, total: 4 });

  // NaN: error
  const f3 = C.trackNumberChange({ includeFirstValueInCount: true, nanHandling: `error` });
  expect(f3(10)).toEqual({ changed: true, changes: 1, identicalRun: 0, total: 1 });
  expect(f3(10)).toEqual({ changed: false, changes: 1, identicalRun: 1, total: 2 });
  expect(f3(100)).toEqual({ changed: true, changes: 2, identicalRun: 0, total: 3 });
  expect(() => f3(Number.NaN)).toThrow();
  expect(() => f3(Number.NaN)).toThrow();
  expect(f3(10)).toEqual({ changed: true, changes: 3, identicalRun: 0, total: 4 });

  const f4 = C.trackNumberChange({ includeFirstValueInCount: false, nanHandling: `allow` });
  expect(f4(10)).toEqual({ changed: true, changes: 0, identicalRun: 0, total: 1 });

  const f5 = C.trackNumberChange({ initial: 20 });
  expect(f5(20)).toEqual({ changed: false, changes: 0, identicalRun: 1, total: 1 });

});