/// <reference types="jest-extended" />
/* eslint-disable */
import {MapMultiOpts, mutableMapArray} from "../../collections/MutableMap.js";
import {jest} from '@jest/globals'

describe(`mutableMapSet`, () => {

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
    
    const opts:MapMultiOpts<Person> = {
      groupBy:(p) => p.city,
      valueComparer:(a, b) => a.name == b.name && a.city == b.city 
    }

    const m = mutableMapArray<Person>(opts);
    
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
    const m = mutableMapArray<string>();
    
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
    const m = mutableMapArray<string>();
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