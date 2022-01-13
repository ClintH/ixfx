/* eslint-disable */
/// <reference types="jest-extended" />
import {MutableMapMulti} from "../../collections/MutableMapMulti.js";

test(`mutableMultiValueMap`, () => {
  const m = new MutableMapMulti();
  expect(m.isEmpty).toBeTrue();
  m.addKeyedValues(`apples`, `a` );
  m.addKeyedValues(`oranges`, `d`, `e`)
  m.addKeyedValues(`apples`, `b`,`c`);

  expect(m.count(`apples`)).toEqual(3);
  expect(m.count(`oranges`)).toEqual(2);
  expect(m.count(`notfound`)).toEqual(0);

  expect(m.findKeyForValue(`a`)).toEqual(`apples`);
  expect(m.findKeyForValue(`d`)).toEqual(`oranges`);
  expect(m.findKeyForValue(`c`)).toEqual(`apples`);
  expect(m.findKeyForValue(`notfound`)).toBeUndefined();

  expect(m.hasKey(`apples`)).toBeTruthy();
  expect(m.hasKey(`oranges`)).toBeTruthy();
  expect(m.hasKey(`notfound`)).toBeFalsy();
  expect(m.isEmpty).toBeFalse();

  expect(m.keys()).toIncludeSameMembers([`apples`, `oranges`]);
  expect(m.keysAndCounts()).toIncludeSameMembers([
    [`apples`, 3],
    [`oranges`, 2]
  ])

  expect(m.has(`c`)).toBeTrue();
  expect(m.has(`e`)).toBeTrue();
  expect(m.has(`f`)).toBeFalse();

  m.clear();
  expect(m.isEmpty).toBeTrue();



});