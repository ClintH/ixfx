/* eslint-disable */
import {average} from '../collections/NumericArrays.js';
import { startsEnds } from '../Text.js';
import { wrapInteger, wrap, scale, clamp, clampIndex, toStringDefault, isEqualDefault, isEqualValueDefault} from '../Util.js';
import {degreeToRadian, radianToDegree} from '../geometry/index.js';

test(`degreeToRadian`, () => {
  expect(degreeToRadian(30).toPrecision(4)).toEqual("0.5236");
  expect(degreeToRadian(45).toPrecision(4)).toEqual("0.7854");
  expect(degreeToRadian(60).toPrecision(4)).toEqual("1.047");
  expect(degreeToRadian(90).toPrecision(4)).toEqual("1.571");
  expect(degreeToRadian(120).toPrecision(4)).toEqual("2.094");
  expect(degreeToRadian(135).toPrecision(4)).toEqual("2.356");
  expect(degreeToRadian(150).toPrecision(4)).toEqual("2.618");
  expect(degreeToRadian(180).toPrecision(4)).toEqual("3.142");
  expect(degreeToRadian(200).toPrecision(4)).toEqual("3.491");
  expect(degreeToRadian(270).toPrecision(4)).toEqual("4.712");
  expect(degreeToRadian(360).toPrecision(4)).toEqual("6.283")
});

test(`radianToDegree`, () => {
  expect(radianToDegree(0)).toEqual(0);
  
  expect(Math.round(radianToDegree(0.5235))).toEqual(30);
  expect(Math.round(radianToDegree(0.7853))).toEqual(45);
  expect(Math.round(radianToDegree(1.047))).toEqual(60);
  expect(Math.round(radianToDegree(1.5707))).toEqual(90);
  expect(Math.round(radianToDegree(2.0943))).toEqual(120);
  expect(Math.round(radianToDegree(3.1415))).toEqual(180);
  expect(Math.round(radianToDegree(4.7123))).toEqual(270);
  expect(Math.round(radianToDegree(6.2831))).toEqual(360);


});

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
  expect(wrap(10.5, 5, 10)).toEqual(5.5);
  expect(wrap(4, 5, 9)).toEqual(8);
  expect(wrap(5, 5, 9)).toEqual(5);
  expect(wrap(9, 5, 9)).toEqual(5);
  expect(wrap(4.5, 5, 9)).toEqual(8.5);



});

test(`wrapInteger`, () => {

  // Test for non-integers
  expect(() => wrapInteger(0.5,0,360)).toThrow();
  expect(() => wrapInteger(10,0.5,360)).toThrow();
  expect(() => wrapInteger(10,0,20.5)).toThrow();

  expect(wrapInteger(361, 0, 360)).toEqual(1);
  expect(wrapInteger(360, 0, 360)).toEqual(0);
  expect(wrapInteger(0, 0, 360)).toEqual(0);
  expect(wrapInteger(150, 0, 360)).toEqual(150);
  expect(wrapInteger(-20, 0, 360)).toEqual(340);
  expect(wrapInteger(360*3, 0, 360)).toEqual(0);
  expect(wrapInteger(150 - 360, 0, 360)).toEqual(150);
  expect(wrapInteger(150 - (360*2), 0, 360)).toEqual(150);

  // Test default 0-360 range
  expect(wrapInteger(361)).toEqual(1);
  expect(wrapInteger(360)).toEqual(0);
  expect(wrapInteger(0)).toEqual(0);
  expect(wrapInteger(150)).toEqual(150);
  expect(wrapInteger(-20)).toEqual(340);
  expect(wrapInteger(360*3)).toEqual(0);
  expect(wrapInteger(150 - 360)).toEqual(150);
  expect(wrapInteger(150 - (360*2))).toEqual(150);

  // Non-zero min 
  expect(wrapInteger(20, 20, 70)).toEqual(20);
  expect(wrapInteger(70, 20, 70)).toEqual(20);
  expect(wrapInteger(80, 20, 70)).toEqual(30);
  expect(wrapInteger(-20, 20, 70)).toEqual(50);

  expect(wrapInteger(20, 20, 30)).toEqual(20);
  expect(wrapInteger(22, 20, 30)).toEqual(22);
  expect(wrapInteger(5, 20, 30)).toEqual(25);
  expect(wrapInteger(30, 20, 30)).toEqual(20);
  expect(wrapInteger(31, 20, 30)).toEqual(21);
  expect(wrapInteger(40, 20, 30)).toEqual(20);


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
