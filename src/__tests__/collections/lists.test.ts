/* eslint-disable */
import {circularArray}  from '../../collections/CircularArray.js';

test(`circular`, () => {
  const a = circularArray(5);
  const b = a.add(`test`);
  let c = b;
  for (let i = 0; i < 15; i++) {
    c = c.add(`test` + i);
  }
  expect(a).toEqual([]);
  expect(a.isFull).toBeFalsy();
  expect(a.length).toEqual(0);

  expect(b).toEqual([`test`]);
  expect(b.isFull).toBeFalsy();
  expect(b.length).toEqual(1);
  
  expect(c).toEqual([`test14`, `test10`, `test11`, `test12`, `test13`]);
  expect(c.isFull).toBeTruthy();
  expect(c.length).toEqual(5);
});

