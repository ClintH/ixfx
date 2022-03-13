/* eslint-disable */
import {average} from '../collections/NumericArrays.js';
import { startsEnds } from '../Text.js';
import { wrap, scale, clamp, clampIndex, toStringDefault, isEqualDefault, isEqualValueDefault} from '../Util.js';

test(`scale`, () => {
  expect(scale(50, 0, 100, 0, 1)).toEqual(0.5);
  expect(scale(100, 0, 100, 0, 1)).toEqual(1);
  expect(scale(0, 0, 100, 0, 1)).toEqual(0);

});

test(`startsEnds`, () => {
  expect(startsEnds(`test`, `t`)).toBeTruthy();
  expect(startsEnds(`test`, `T`)).toBeFalsy();
  expect(startsEnds(`This is a test`, `This`, `test`)).toBeTruthy();
  expect(startsEnds(`This is a test`, `this`, `Test`)).toBeFalsy();
  expect(startsEnds(`This is a test`, `This`, `not`)).toBeFalsy();

});
test(`wrap`, () => {

  expect(() => wrap(0.5,0,360)).toThrow();
  expect(() => wrap(10,0.5,360)).toThrow();
  expect(() => wrap(10,0,20.5)).toThrow();

  expect(wrap(361, 0, 360)).toEqual(1);
  expect(wrap(360, 0, 360)).toEqual(0);
  expect(wrap(0, 0, 360)).toEqual(0);
  expect(wrap(150, 0, 360)).toEqual(150);
  expect(wrap(-20, 0, 360)).toEqual(340);
  expect(wrap(360*3, 0, 360)).toEqual(0);
  expect(wrap(150 - 360, 0, 360)).toEqual(150);
  expect(wrap(150 - (360*2), 0, 360)).toEqual(150);

  // Test default 0-360 range
  expect(wrap(361)).toEqual(1);
  expect(wrap(360)).toEqual(0);
  expect(wrap(0)).toEqual(0);
  expect(wrap(150)).toEqual(150);
  expect(wrap(-20)).toEqual(340);
  expect(wrap(360*3)).toEqual(0);
  expect(wrap(150 - 360)).toEqual(150);
  expect(wrap(150 - (360*2))).toEqual(150);

  // Non-zero min 
  expect(wrap(20, 20, 70)).toEqual(20);
  expect(wrap(70, 20, 70)).toEqual(20);
  expect(wrap(80, 20, 70)).toEqual(30);
  expect(wrap(-20, 20, 70)).toEqual(50);

  expect(wrap(20, 20, 30)).toEqual(20);
  expect(wrap(22, 20, 30)).toEqual(22);
  expect(wrap(5, 20, 30)).toEqual(25);
  expect(wrap(30, 20, 30)).toEqual(20);
  expect(wrap(31, 20, 30)).toEqual(21);
  expect(wrap(40, 20, 30)).toEqual(20);


});

test(`toStringDefault`, () => {
  const a = {
    name: "Blah blah",
    age: 30,
    alive: true,
    height: 192.4
  }

  const aa = {
    name: "Blah blah",
    age: 30,
    alive: true,
    height: 192.4
  }

  const b = "Blah blah";
  const bb ="Blah blah";

  expect(toStringDefault(a)).toEqual(toStringDefault(aa));
  expect(toStringDefault(b)).toEqual(toStringDefault(bb));
})

// Default isEqual tests by reference
test(`isEqualDefault`, () => {
  const a = {
    name: "Blah blah",
    age: 30,
    alive: true,
    height: 192.4
  }

  const aa = {
    name: "Blah blah",
    age: 30,
    alive: true,
    height: 192.4
  }

  const b = "Blah blah";
  const bb ="Blah blah";
  const c = "BLAH BLAH";

  expect(isEqualDefault(a,a)).toBeTruthy();
  expect(isEqualDefault(a, b as any)).toBeFalsy();
  expect(isEqualDefault(a,aa)).toBeFalsy(); // Same content but different references, false

  expect(isEqualDefault(b, b)).toBeTruthy();
  expect(isEqualDefault(b,bb)).toBeTruthy(); // Strings work by value using ===
  expect(isEqualDefault(b, c)).toBeFalsy();
});


// Test by value
test(`isEqualValueDefault`, () => {
  const a = {
    name: "Blah blah",
    age: 30,
    alive: true,
    height: 192.4
  }

  const aa = {
    name: "Blah blah",
    age: 30,
    alive: true,
    height: 192.4
  }

  const b = "Blah blah";
  const bb ="Blah blah";
  const c = "BLAH BLAH";

  expect(isEqualValueDefault(a,a)).toBeTruthy();
  expect(isEqualValueDefault(a, b as any)).toBeFalsy();
  expect(isEqualValueDefault(a,aa)).toBeTruthy();

  expect(isEqualValueDefault(b, b)).toBeTruthy();
  expect(isEqualValueDefault(b,bb)).toBeTruthy();
  expect(isEqualValueDefault(b, c)).toBeFalsy();
});

test(`average`, () => {
  const a = [1];
  expect(average(...a)).toEqual(1);

  const b =[1, 2, 3, 4, 5];
  expect(average(...b)).toEqual(3);

  const c = [-5, 5];
  expect(average(...c)).toEqual(0);

  const d = [1, 0, null, undefined, NaN];
  // @ts-ignore
  expect(average(...d)).toEqual(0.5);

  const e = [1, 1.4, 0.9, 0.1];
  expect(average(...e)).toEqual(0.85);
});

test(`clamp-inclusivity`, () => {
  expect(clamp(0, 0, 1)).toBe(0);
  expect(clamp(-1, 0, 1)).toBe(0);

  expect(clamp(1, 0, 1)).toBe(1);
  expect(clamp(1.1, 0, 1)).toBe(1);
});

test(`clamp-range`, () => {
  expect(clamp(0.5, 0, 1)).toBe(0.5);
  expect(clamp(0.000000005, 0, 1)).toBe(0.000000005);

  expect(clamp(100, -100, 100)).toBe(100);
  expect(clamp(-100, -100, 100)).toBe(-100);
  expect(clamp(0, -100, 100)).toBe(0);

  // test guards
  expect(() => clamp(NaN, 0, 100)).toThrow();
  expect(() => clamp(10, NaN, 100)).toThrow();
  expect(() => clamp(10, 0, NaN)).toThrow();
});

test(`clamp-zero-bounds`, () => {
  expect(clampIndex(0, 5)).toBe(0);
  expect(clampIndex(4, 5)).toBe(4);
  expect(clampIndex(5, 5)).toBe(4);
  expect(clampIndex(-5, 5)).toBe(0);

  // test throwing for non-ints
  expect(() => clampIndex(0, 5.5)).toThrow();
  expect(() => clampIndex(0.5, 5)).toThrow();
  expect(() => clampIndex(NaN, 5)).toThrow();
  expect(() => clampIndex(0, NaN)).toThrow();
});
