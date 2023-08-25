/* eslint-disable */
import test from 'ava';
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

test('getLengthChildren', (t) => {
  t.is(getLengthChildren(getTestObj()), 3);
  t.is(getLengthChildren(getTestMap()), 2);
});

test('directChildren', (t) => {
  t.deepEqual([...directChildren(getTestObj())], [
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
  t.deepEqual([...directChildren(simpleObj)], [["colour", {
    b: 0.5,
    g: 0.5,
    r: 0.5
  }]]);

  const colours = [{r: 1, g: 0, b: 0}, {r: 0, g: 1, b: 0}, {r: 0, g: 0, b: 1}];
  t.deepEqual([...directChildren(colours, 'colours')], [
    ["colours[0]", {r: 1, g: 0, b: 0}],
    ["colours[1]", {r: 0, g: 1, b: 0}],
    ["colours[2]", {r: 0, g: 0, b: 1}],
  ]);
});

test('traceByPath', (t) => {
  const o = getTestObj();
  const opts: PathOpts = {
    separator: '.',
    allowArrayIndexes: true
  }
  t.deepEqual([...traceByPath('kids[1]', o, opts)], [["kids[1]", {"name": "Sam"}]]);
  t.deepEqual([...traceByPath('address.street', o, opts)], [["address", {"number": 27, "street": "Blah St"}], ["street", "Blah St"]]);
  t.deepEqual([...traceByPath('kids[0].address.street', o, opts)], [["kids[0]", {"address": {"number": 35, "street": "West St"}, "name": "John"}], ["address", {"number": 35, "street": "West St"}], ["street", "West St"]]);

  const t2 = getTestMap();
  t.deepEqual([...traceByPath('jill.address.street', t2, opts)], [["jill", {"address": {"number": 27, "street": "Blah St"}}], ["address", {"number": 27, "street": "Blah St"}], ["street", "Blah St"]]);

  const opts2: PathOpts = {
    separator: '.',
    allowArrayIndexes: false
  }

  // Not found when we don't use array indexes
  t.deepEqual([...traceByPath('kids[1]', t, opts2)], [['kids[1]', undefined]]);
  t.deepEqual([...traceByPath('kids[0].address.street', t, opts2)], [['kids[0]', undefined]]);
});

test('getByPath', (t) => {
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
  t.deepEqual(e, ["postcode", 1000]);

  t.deepEqual(getByPath('jane.address.country', people), ['country', undefined]);
  t.deepEqual(getByPath('jane.address.country.state', people), ['country', undefined]);

  t.deepEqual([...traceByPath('jane.address.street.toofar', people)], [
    ["jane", {address: {postcode: 1000, street: 'West St', city: 'Blahville'}, colour: 'red'}],
    ["address", {postcode: 1000, street: 'West St', city: 'Blahville'}],
    ["street", "West St"],
    ["toofar", undefined]
  ]);

});