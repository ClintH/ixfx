/* eslint-disable */
import {expect, test} from '@jest/globals';
import {type PathOpts, getLengthChildren, getByPath, traceByPath, directChildren} from '../../collections/Trees.js';

function getTestMap() {
  const testMap = new Map();
  testMap.set('jill', {
    address: {
      street: 'Blah St',
      number: 27
    }
  });
  testMap.set('john', {
    address: {
      street: 'West St',
      number: 35
    }
  });
  return testMap;
}

function getTestObj() {
  const testObj = {
    name: 'Jill',
    address: {
      street: 'Blah St',
      number: 27
    },
    kids: [
      {
        name: 'John',
        address: {
          street: 'West St',
          number: 35
        }
      },
      {name: 'Sam'}
    ]
  }
  return testObj;
}

test('getLengthChildren', () => {
  expect(getLengthChildren(getTestObj())).toEqual(3);
  expect(getLengthChildren(getTestMap())).toEqual(2);
});

test('directChildren', () => {
  expect([...directChildren(getTestObj())]).toEqual([
    ["name", "Jill"],
    ["address", {number: 27, street: "Blah St"}],
    ["kids", [
      {
        address: {
          number: 35,
          street: "West St"
        },
        name: "John"
      },
      {
        name: "Sam"
      }
    ]]
  ]);

  const simpleObj = {
    colour: {
      r: 0.5,
      g: 0.5,
      b: 0.5
    }
  }
  expect([...directChildren(simpleObj)]).toEqual([["colour", {
    b: 0.5,
    g: 0.5,
    r: 0.5
  }]]);

  const colours = [{r: 1, g: 0, b: 0}, {r: 0, g: 1, b: 0}, {r: 0, g: 0, b: 1}];
  expect([...directChildren(colours, 'colours')]).toEqual([
    ["colours[0]", {r: 1, g: 0, b: 0}],
    ["colours[1]", {r: 0, g: 1, b: 0}],
    ["colours[2]", {r: 0, g: 0, b: 1}],
  ]);
});

test('traceByPath', () => {
  const t = getTestObj();
  const opts: PathOpts = {
    separator: '.',
    allowArrayIndexes: true
  }
  expect([...traceByPath('kids[1]', t, opts)]).toEqual([["kids[1]", {"name": "Sam"}]]);
  expect([...traceByPath('address.street', t, opts)]).toEqual([["address", {"number": 27, "street": "Blah St"}], ["street", "Blah St"]]);
  expect([...traceByPath('kids[0].address.street', t, opts)]).toEqual([["kids[0]", {"address": {"number": 35, "street": "West St"}, "name": "John"}], ["address", {"number": 35, "street": "West St"}], ["street", "West St"]]);

  const t2 = getTestMap();
  expect([...traceByPath('jill.address.street', t2, opts)]).toEqual([["jill", {"address": {"number": 27, "street": "Blah St"}}], ["address", {"number": 27, "street": "Blah St"}], ["street", "Blah St"]]);

  const opts2: PathOpts = {
    separator: '.',
    allowArrayIndexes: false
  }

  // Not found when we don't use array indexes
  expect([...traceByPath('kids[1]', t, opts2)]).toEqual([['kids[1]', undefined]]);
  expect([...traceByPath('kids[0].address.street', t, opts2)]).toEqual([['kids[0]', undefined]]);
});

test('getByPath', () => {
  const people = {
    jane: {
      address: {
        postcode: 1000,
        street: 'West St',
        city: 'Blahville'
      },
      colour: 'red'
    }
  }
  const e = getByPath('jane.address.postcode', people);
  expect(e).toEqual(["postcode", 1000]);

  expect(getByPath('jane.address.country', people)).toEqual(['country', undefined]);
  expect(getByPath('jane.address.country.state', people)).toEqual(['country', undefined]);

  expect([...traceByPath('jane.address.street.toofar', people)]).toEqual([
    ["jane", {address: {postcode: 1000, street: 'West St', city: 'Blahville'}, colour: 'red'}],
    ["address", {postcode: 1000, street: 'West St', city: 'Blahville'}],
    ["street", "West St"],
    ["toofar", undefined]
  ]);

});