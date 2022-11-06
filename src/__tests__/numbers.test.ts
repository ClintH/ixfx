/* eslint-disable */
import { expect, test } from '@jest/globals';
import { average, linearSpace, quantiseEvery, round} from '../Numbers.js';

test(`round`, () => {
  expect(round(10, 2)).toEqual(10);
  expect(round(10.1234, 2)).toEqual(10.12);
  expect(round(10.1234, 3)).toEqual(10.123);
  expect(round(10.1234, 4)).toEqual(10.1234);


});

test(`linearSpace`, () => {
  const t1 = [...linearSpace(0, 9, 10)];
  expect(t1).toEqual([0,1,2,3,4,5,6,7,8,9]);

  const t2 = [...linearSpace(5,10,11)];

  expect(t2).toEqual([5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]);
  
  const t3 = [...linearSpace(10, 5, 6)];
  expect(t3).toEqual([10, 9, 8, 7, 6, 5]);

  const t4 =  [...linearSpace(10, 5, 2)];
  expect(t4).toEqual([10, 5]);

  const t5 =  [...linearSpace(10, 5, 3)];
  expect(t5).toEqual([10, 7.5, 5]);
  
});

test(`quantiseEvery`, () => {
  expect(quantiseEvery(11, 10)).toEqual(10);
  expect(quantiseEvery(25, 10)).toEqual(30);
  expect(quantiseEvery(0, 10)).toEqual(0);
  expect(quantiseEvery(4, 10)).toEqual(0);
  expect(quantiseEvery(100, 10)).toEqual(100);

  expect(quantiseEvery(15, 10, false)).toEqual(10);
  expect(quantiseEvery(15, 10, true)).toEqual(20);


  // @ts-ignore
  expect( () => quantiseEvery(`string`, 10)).toThrow();
  // @ts-ignore
  expect( () => quantiseEvery(10, Number.NaN)).toThrow();

})

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