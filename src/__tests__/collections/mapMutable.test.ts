/// <reference types="jest-extended" />
/* eslint-disable */
// @ts-nocheck
import { expect, test, describe } from '@jest/globals';
import {MapArrayOpts, MapSetOpts} from  '../../collections/Interfaces.js'
import { mapArray, mapSet} from "../../collections/MapMultiMutable.js";
import {jest} from '@jest/globals'

test(`mutableMapSet`, () => {
  const m = mapSet<string>();
  m.addKeyedValues(`a`, `aa`, `ab`, `ac`, `aa`, `ab`);
  expect(m.count(`a`)).toEqual(3); // duplicate values should be dropped

  type Person = { readonly name: string, readonly city: string }

  const opts:MapSetOpts<Person> = {
    groupBy:(p) => p.city,
    hash: (p) => `${p.name}-${p.city}`
  }

  const barry = {name: `Barry`, city: `London`};
  const barryClone = {name: `Barry`, city: `London`};

  const m2 = mapSet<Person>(opts);
  expect(m2.count(`London`)).toEqual(0);
  m2.addValue(barry, barryClone);
  expect(m2.count(`London`)).toEqual(1);
});

describe(`mutableMapArray`, () => {

  test(`withOpts`, () => {
    type Person = { readonly name: string, readonly city: string }
    const barry = {name: `Barry`, city: `London`};

    const barryOther = {name: `Barry`, city: `Manchester`};
    const barryCase = {name: `BARRY`, city: `London`}; 
    const sally = {name: `Sally`, city: `Bristol`};
    const sallyOther = {name: `Sally`, city: `Manchester`};
    const sallyMoreProps = {name: `Sally`, city: `Bristol`, age: 27};
    
    const opts:MapArrayOpts<Person> = {
      groupBy:(p) => p.city,
      comparer:(a, b) => a.name === b.name && a.city === b.city
    }

    const m = mapArray<Person>(opts);
    
    m.addValue(barry, barryOther, barryCase, sally, sallyOther, sallyMoreProps);
   
    expect(m.count(`London`)).toEqual(2);
    expect(m.count(`Notfound`)).toEqual(0);
    expect(m.hasKeyValue(`Bristol`, {name: `Sally`, city: `Bristol`})).toBeTruthy();
    expect(m.hasKeyValue(`London`, {name: `Sally`, city: `Bristol`})).toBeFalsy();
    
    expect(m.has(`notfound`)).toBeFalse();
    expect(m.hasKeyValue(`Bristol`, sallyMoreProps)).toBeTruthy();
    
    // Key equality
    expect(m.has(`LONDON`)).toBeFalse();
    expect(m.has(`London`)).toBeTrue();
    
    // Fetch all values
    expect(m.get(`Bristol`)?.length).toEqual(2);

    // Lookup key from value
    expect(m.findKeyForValue({name: `BARRY`, city: `London`})).toEqual(`London`);

  });

  test(`events`, () =>{
    const m = mapArray<string>();
    
    const addKeyHandler = jest.fn();
    const addValueHandler = jest.fn();
    const clearHandler = jest.fn();
    const deleteKeyHandler = jest.fn();

    m.addEventListener(`clear`, clearHandler);
    m.addEventListener(`addedKey`, addKeyHandler);
    m.addEventListener(`addedValues`, addValueHandler);
    m.addEventListener(`deleteKey`, deleteKeyHandler);
    
    m.addKeyedValues(`a`, `aa`, `ab`, `ac`);

    expect(addValueHandler).toBeCalledTimes(1);
    expect(addKeyHandler).toBeCalledTimes(1);

    m.addKeyedValues(`c`, `ca`);
    m.addKeyedValues(`c`, `cb`);
    m.addKeyedValues(`c`, `cc`);
    expect(addValueHandler).toBeCalledTimes(4);

    m.addKeyedValues(`b`, `ba`, `bb`, `bc`);
    m.delete(`a`);
    expect(deleteKeyHandler).toBeCalledTimes(1);
    m.clear();
    expect(clearHandler).toBeCalledTimes(1);

  });

  test(`defaultOpts`, () => {
    const m = mapArray<string>();
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

    expect(m.has(`apples`)).toBeTruthy();
    expect(m.has(`oranges`)).toBeTruthy();
    expect(m.has(`notfound`)).toBeFalsy();
    expect(m.isEmpty).toBeFalse();

    expect(m.keys()).toIncludeSameMembers([`apples`, `oranges`]);
    expect(m.keysAndCounts()).toIncludeSameMembers([
      [`apples`, 3],
      [`oranges`, 2]
    ])

    expect(m.hasKeyValue(`apples`, `c`)).toBeTrue();
    expect(m.hasKeyValue(`oranges`, `e`)).toBeTrue();
    expect(m.hasKeyValue(`notfound`, `e`)).toBeFalse();
    expect(m.hasKeyValue(`notfound`, `f`)).toBeFalse();

    m.clear();
    expect(m.isEmpty).toBeTrue();
  });

});