
import { expect, test, vi } from "vitest";
import * as Arrays from '../src/index.js';
test(`sortByNumericProperty`, () => {
  const data = [
    { size: 10, colour: `red` },
    { size: 20, colour: `blue` },
    { size: 5, colour: `pink` },
    { size: 10, colour: `orange` },
  ];

  expect(Arrays.sortByNumericProperty(data, `size`)).toEqual([
    { size: 5, colour: `pink` },
    { size: 10, colour: `red` },
    { size: 10, colour: `orange` },
    { size: 20, colour: `blue` },
  ]);
});



test(`sortByProperty`, () => {
  const data = [
    { size: 11, colour: `red` },
    { size: 20, colour: `blue` },
    { size: 20, colour: `blue-green` },
    { size: 5, colour: `pink` },
    { size: 10, colour: `orange` },
  ];

  expect(Arrays.sortByProperty(data, `size`)).toEqual([
    { size: 5, colour: `pink` },
    { size: 10, colour: `orange` },
    { size: 11, colour: `red` },
    { size: 20, colour: `blue` },
    { size: 20, colour: `blue-green` },
  ]);

  expect(Arrays.sortByProperty(data, `colour`)).toEqual([
    { size: 20, colour: `blue` },
    { size: 20, colour: `blue-green` },
    { size: 10, colour: `orange` },
    { size: 5, colour: `pink` },
    { size: 11, colour: `red` },
  ]);

  const comparer = (a: any, b: any) => {
    if (a === b) return 0;
    if (a > b) return -1;
    return 1;
  }

  expect(Arrays.sortByProperty(data, `size`, comparer)).toEqual([
    { size: 20, colour: `blue` },
    { size: 20, colour: `blue-green` },
    { size: 11, colour: `red` },
    { size: 10, colour: `orange` },
    { size: 5, colour: `pink` },
  ]);
});
