/* eslint-disable */
// @ts-nocheck
/// <reference types="jest-extended" />
import "jest-extended"
import { expect, test } from '@jest/globals';
import {mapMutable} from '../../collections/map/MapMutable.js';
import {map} from '../../collections/map/MapImmutable.js';
import {mergeByKey} from '../../collections/map/index.js';


test(`map-mergeByKey`, () => {
  const m1 = new Map();
  m1.set(`1`, `1-1`);
  m1.set(`2`, `1-2`);
  m1.set(`3`, `1-3`);
  m1.set(`4`, `1-4`);

  const m2 = new Map();
  m2.set(`1`, `2-1`);
  m2.set(`2`, `2-2`);
  m2.set(`3`, `2-3`);
  m2.set(`5`, `2-5`);

  const m3 = mergeByKey((a:string, b:string) => {
    return b.replace(`-`, `!`);
  }, m1, m2);

  expect(m3.get(`1`)).toEqual(`2!1`);
  expect(m3.get(`2`)).toEqual(`2!2`);
  expect(m3.get(`3`)).toEqual(`2!3`);
  expect(m3.get(`4`)).toEqual(`1-4`);
  expect(m3.get(`5`)).toEqual(`2-5`);
});

test(`immutableMap`, () => {
  const m = map();
  const m2 = m.add([`apples`, 10]);
  const m3 = m2.add({key: `oranges`, value: 9}, {key: `grapes`, value:10});

  expect(m.isEmpty()).toBeTruthy();
  expect(m2.isEmpty()).toBeFalsy();
  expect(m3.isEmpty()).toBeFalsy();

  expect(m.has(`apples`)).toBeFalsy();

  expect(m2.has(`apples`)).toBeTruthy();
  expect(m3.has(`apples`)).toBeTruthy();

  expect(m.has(`oranges`)).toBeFalsy();
  expect(m2.has(`oranges`)).toBeFalsy();
  expect(m3.has(`oranges`)).toBeTruthy();

  const m4 = m3.clear();
  expect(m4.isEmpty()).toBeTruthy();
  expect(m.has(`oranges`)).toBeFalsy();
  expect(m2.has(`oranges`)).toBeFalsy();
  expect(m3.has(`oranges`)).toBeTruthy();

  const m5 = m3.delete(`apples`);
  expect(m.has(`apples`)).toBeFalsy();
  expect(m2.has(`apples`)).toBeTruthy();
  expect(m3.has(`apples`)).toBeTruthy();
  expect(m5.has(`apples`)).toBeFalsy();

  expect(m3.get(`grapes`)).toEqual(10);
  expect(m3.get(`notthere`)).toBeUndefined();

  // test starting with data
  const m6 = map<string, number>([[`apples`, 10], [`oranges`, 9], [`grapes`, 10]]);
  const m6Entries = Array.from(m6.entries());
  const m3Entries = Array.from(m3.entries());
  expect(m6Entries).toIncludeSameMembers(m3Entries);
});

test(`mutableMap`, () => {
  const m = mapMutable();
  expect(m.isEmpty()).toBeTruthy();
  m.add([`apples`, 10], [`oranges`, 9]);
  expect(m.isEmpty()).toBeFalsy();
  expect(m.has(`apples`)).toBeTruthy();
  expect(m.has(`oranges`)).toBeTruthy();
  expect(m.has(`notthere`)).toBeFalsy();

  m.add({key:`grapes`, value:10});
  m.set(`mangoes`, 100);
  m.delete(`oranges`);
  expect(m.has(`apples`)).toBeTruthy();
  expect(m.has(`oranges`)).toBeFalsy();
  expect(m.has(`grapes`)).toBeTruthy();
  expect(m.has(`mangoes`)).toBeTruthy();
  
  expect(m.get(`apples`)).toEqual(10);
  expect(m.get(`notthere`)).toBeUndefined();

})