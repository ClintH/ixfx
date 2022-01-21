import * as Sets from '../../collections/Set';
import {jest} from '@jest/globals';

test(`mutableValueSet`, () => {
  const barry = {name: `Barry`, city: `London`};
  const barryOther = {name: `Barry`, city: `Manchester`};
  const barryCase = {name: `BARRY`, city: `London`}; 
  const sally = {name: `Sally`, city: `Bristol`};
  const sallyOther = {name: `Sally`, city: `Manchester`};
  const sallyMoreProps = {name: `Sally`, city: `Bristol`, age: 27};
  
  const people = [
    {name: `Barry`, city: `London`},
    {name: `Sally`, city: `Bristol`}
  ];

  type Person = { readonly name: string, readonly city: string }

  // Test default JSON
  const set = new Sets.MutableValueSet();
  set.add(...people);
  expect(set.has(barry)).toBeTruthy();
  expect(set.has(sally)).toBeTruthy();
  expect(set.has(barryOther)).toBeFalsy();
  expect(set.has(barryCase)).toBeFalsy();
  expect(set.has(sallyOther)).toBeFalsy();
  expect(set.has(sallyMoreProps)).toBeFalsy();
  expect(set.toArray()).toEqual(people);

  expect(set.delete(barry)).toBeTruthy();
  expect(set.delete(sallyMoreProps)).toBeFalsy();

  // Test custom key generator
  const set2 = new Sets.MutableValueSet<Person>(item => (item.name.toLocaleUpperCase() + `-` + item.city.toLocaleUpperCase()));
  set2.add(...people);
  expect(set2.has(barry)).toBeTruthy();
  expect(set2.has(sally)).toBeTruthy();
  expect(set2.has(barryOther)).toBeFalsy();
  expect(set2.has(barryCase)).toBeTruthy(); // <-- different than JSON case
  expect(set2.has(sallyOther)).toBeFalsy();
  expect(set2.has(sallyMoreProps)).toBeTruthy(); // <-- different than JSON case
  expect(set2.toArray()).toEqual(people);

  expect(set2.delete(barry)).toBeTruthy();
  expect(set2.delete(sallyMoreProps)).toBeTruthy();
  
  // Test events
  const set3 = new Sets.MutableValueSet<string>();
  const addHandler = jest.fn();
  const clearHandler = jest.fn();
  const deleteHandler = jest.fn();
  set3.addEventListener(`add`, addHandler);
  set3.addEventListener(`delete`, deleteHandler);
  set3.addEventListener(`clear`, clearHandler);

  set3.add(`a`, `b`, `c`, `d`, `e`, `f`);

  expect(addHandler).toBeCalledTimes(6);
  expect(set3.delete(`a`)).toBeTruthy();
  expect(set3.delete(`b`)).toBeTruthy();
  expect(deleteHandler).toBeCalledTimes(2);

  set3.clear();
  expect(clearHandler).toBeCalled();

});