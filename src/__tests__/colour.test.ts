/* eslint-disable */
import * as Colour from '../visual/Colour.js';

test(`opacity`, () => {
  expect(Colour.opacity(`hsl(0,100%,50%)`, 0.5)).toEqual(`hsla(0, 100%, 50%, 50%)`);
});

test(`parse`, () => {
  expect(Colour.parseToHsla(`hsl(0,0,0)`)).toEqual([0,0,0, 1]);
  
  expect(Colour.parseToHsla(`hsl(100, 100%, 50%)`)).toEqual([100,1,0.5,1]);
  expect(Colour.parseToHsla(`hsl(100 100% 50%)`)).toEqual([100,1,0.5,1]);
  expect(Colour.parseToHsla(`hsl(100, 1, .5)`)).toEqual([100,1,0.5,1]);

  expect(Colour.parseToHsla(`red`)).toEqual([0,1,0.5, 1]);
  expect(Colour.parseToHsla(`rgb(255,0,0)`)).toEqual([0,1,0.5, 1]);
  expect(Colour.parseToHsla(`rgba(255,0,0, 1)`)).toEqual([0,1,0.5, 1]);

  expect(Colour.parseToHsla(`hotpink`)).toEqual([330,1,0.706, 1]);
  expect(Colour.parseToHsla(`rgb(255,105,180)`)).toEqual([330,1,0.7058823529411764, 1]);
  expect(Colour.parseToHsla(`rgba(255,105,180,0.5)`)).toEqual([330,1,0.7058823529411764, 0.5]);

  expect(Colour.parseToHsla(`hsla(0,0,0,0)`)).toEqual([0,0,0,0]);
  expect(Colour.parseToHsla(`hsla(100, 100%, 50%, 20%)`)).toEqual([100,1,0.5,0.2]);
  expect(Colour.parseToHsla(`hsla(100 100% 50% 20%)`)).toEqual([100,1,0.5,0.2]);
  expect(Colour.parseToHsla(`hsla(100, 1, .5, .2)`)).toEqual([100,1,0.5,0.2]);
});