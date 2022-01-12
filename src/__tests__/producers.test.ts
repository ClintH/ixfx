import {pingPong, pingPongPercent} from '../Producers.js';

const testNumeric = (given: number[], expectedRange: number[]) => {
  expect(given.length).toEqual(expectedRange.length);
  for (let i = 0; i < given.length; i++) {
    expect(given[i]).toBeCloseTo(expectedRange[i]);
  }
};

test(`pingPong`, () => {
  expect(() => pingPong(20, 2, 10).next()).toThrow();    // Interval too large
  expect(() => pingPong(1, 0, 10, 15).next()).toThrow(); // Offset out of range

  // Counting up
  let expectedRange = [10, 20, 30, 40, 50];
  let given: number[] = [];
  let count = 5;
  for (const v of pingPong(10, 10, 100)) {
    expect(v).not.toBeUndefined();
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(given, expectedRange);

  // Counting down, starting at 100
  expectedRange = [100, 90, 80, 70, 60];
  given = [];
  count = 5;
  for (const v of pingPong(-10, 10, 100, 100)) {
    expect(v).not.toBeUndefined();
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(given, expectedRange);

  // Counting down starting at default offset (10)
  expectedRange = [10, 100, 90, 80, 70];
  given = [];
  count = 5;
  for (const v of pingPong(-10, 10, 100)) {
    expect(v).not.toBeUndefined();
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(given, expectedRange);

  // Counting forward from edge of range
  expectedRange = [100, 10, 20, 30, 40];
  given = [];
  count = 5;
  for (const v of pingPong(10, 10, 100, 100)) {
    expect(v).not.toBeUndefined();
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(given, expectedRange);


  // Ping-pong
  expectedRange = [10, 20, 30, 40, 50, 40, 30, 20, 10, 20, 30, 40];
  given = [];
  count = 12;
  for (const v of pingPong(10, 10, 50)) {
    expect(v).not.toBeUndefined();
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(given, expectedRange);
});


test(`pingPongPercent`, () => {
  // Test out of range catching
  expect(() => pingPongPercent(2).next()).toThrow();
  expect(() => pingPongPercent(-2).next()).toThrow();
  expect(() => pingPongPercent(0).next()).toThrow();
  expect(() => pingPongPercent(0.1, -1).next()).toThrow();
  expect(() => pingPongPercent(0.1, 2).next()).toThrow();

  // Test counting up to 1
  let expectedRange = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  let given: number[] = [];
  let count = 11;
  for (const v of pingPongPercent(0.1)) {
    expect(v).not.toBeUndefined();
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(given, expectedRange);

  // Test counting down to 0
  expectedRange = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0];
  given = [];
  count = 11;
  for (const v of pingPongPercent(-0.1)) {
    expect(v).not.toBeUndefined();
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(given, expectedRange);

  // Test ping-pong
  expectedRange = [0, 0.2, 0.4, 0.6, 0.8, 1, 0.8, 0.6, 0.4, 0.2];
  expectedRange = [...expectedRange, ...expectedRange];
  given = [];
  count = 20;
  for (const v of pingPongPercent(0.2)) {
    expect(v).not.toBeUndefined();
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(given, expectedRange);

  // Test big interval
  expectedRange = [0, 0.8, 1, 0.2, 0];
  given = [];
  count = 5;
  for (const v of pingPongPercent(0.8)) {
    expect(v).not.toBeUndefined();
    // @ts-ignore
    given.push(v);
    if (--count === 0) break;
  }
  testNumeric(given, expectedRange);

  // Test alternate style and start
  const pp = pingPongPercent(0.1, 0.5);
  expect(pp.next().value).toEqual(0.5);
  expect(pp.next().value).toEqual(0.6);
  expect(pp.next().value).toEqual(0.7);
  expect(pp.next().value).toEqual(0.8);
  expect(pp.next().value).toEqual(0.9);
  expect(pp.next().value).toEqual(1.0);
  expect(pp.next().value).toEqual(0.9);
});
