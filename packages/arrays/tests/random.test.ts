/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect, test, vi } from "vitest";
import * as Arrays from '../src/index.js';
test(`shuffle`, () => {
  const d1 = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
  const r1 = Arrays.shuffle(d1);
  expect(d1).not.toBe(r1);
  expect(d1).not.toStrictEqual(r1);

  const randomFunction = () => Math.random()
  const randFunctionSpy = vi.fn(randomFunction)
  Arrays.shuffle(d1, randFunctionSpy);
  // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
  const r2 = expect(randFunctionSpy).toBeCalledTimes(d1.length - 1)

  /** @ts-ignore */
  expect(() => Arrays.shuffle(false)).toThrow();
  /** @ts-ignore */
  expect(() => Arrays.shuffle(null)).toThrow();
  /** @ts-ignore */
  expect(() => Arrays.shuffle()).toThrow();
  /** @ts-ignore */
  expect(() => Arrays.shuffle(d1, false)).toThrow();
  /** @ts-ignore */
  expect(() => Arrays.shuffle(d1, null)).toThrow();
  /** @ts-ignore */
  expect(() => Arrays.shuffle(d1, {})).toThrow();

});

test(`randomElement`, () => {
  const d1 = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
  const r1: number[] = []
  for (const _ of d1) {
    r1.push(Arrays.randomElement(d1));
  }
  expect(r1).not.toEqual(d1);
  expect(r1).not.toStrictEqual(d1);

  /** @ts-ignore */
  expect(() => Arrays.randomElement(false)).toThrow();
  /** @ts-ignore */
  expect(() => Arrays.randomElement(null)).toThrow();
  /** @ts-ignore */
  expect(() => Arrays.randomElement()).toThrow();
  /** @ts-ignore */
  expect(() => Arrays.randomElement(d1, false)).toThrow();
  /** @ts-ignore */
  expect(() => Arrays.randomElement(d1, null)).toThrow();
  /** @ts-ignore */
  expect(() => Arrays.randomElement(d1, {})).toThrow();
});

test(`randomIndex`, () => {
  const d1 = [ 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 ]
  const r1: number[] = []
  for (const v of d1) {
    r1.push(Arrays.randomIndex(d1));
  }
  for (const v of r1) {
    expect(v).toBeLessThan(d1.length);
  }
  /** @ts-ignore */
  expect(() => Arrays.randomIndex(false)).toThrow();
  /** @ts-ignore */
  expect(() => Arrays.randomIndex(null)).toThrow();
  /** @ts-ignore */
  expect(() => Arrays.randomIndex()).toThrow();
  /** @ts-ignore */
  expect(() => Arrays.randomIndex(d1, false)).toThrow();
  /** @ts-ignore */
  expect(() => Arrays.randomIndex(d1, null)).toThrow();
  /** @ts-ignore */
  expect(() => Arrays.randomIndex(d1, {})).toThrow();
});