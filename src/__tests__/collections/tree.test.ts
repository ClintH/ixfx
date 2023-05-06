/* eslint-disable */
import { expect, test } from '@jest/globals';
import { PathOpts, traceByPath } from '../../collections/Trees.js';

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
        name:'John',
        address: {
          street: 'West St',
          number: 35
        }
      },
      {name:'Sam'}
    ]
  }
  return testObj;
}


test('traceByPath', () => {
  const t = getTestObj();
  const opts:PathOpts = {
    separator: '.',
    allowArrayIndexes: true
  }
  expect([...traceByPath('kids[1]', t, opts)]).toEqual([["kids[1]", {"name": "Sam"}]]);
  expect([...traceByPath('address.street', t, opts)]).toEqual([["address", {"number": 27, "street": "Blah St"}], ["street", "Blah St"]]);
  expect([...traceByPath('kids[0].address.street', t, opts)]).toEqual([["kids[0]", {"address": {"number": 35, "street": "West St"}, "name": "John"}], ["address", {"number": 35, "street": "West St"}], ["street", "West St"]]);

  const t2 = getTestMap();
  expect([...traceByPath('jill.address.street', t2, opts)]).toEqual([["jill", {"address": {"number": 27, "street": "Blah St"}}], ["address", {"number": 27, "street": "Blah St"}], ["street", "Blah St"]]);

  const opts2:PathOpts = {
    separator: '.',
    allowArrayIndexes: false
  }

  // Not found when we don't use array indexes
  expect([...traceByPath('kids[1]', t, opts2)]).toEqual([]);
  expect([...traceByPath('kids[0].address.street', t, opts2)]).toEqual([]);
});