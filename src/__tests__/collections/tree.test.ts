/* eslint-disable */
import { expect, test } from '@jest/globals';
import { findByDottedPath } from '../../collections/Trees.js';

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

test('findByDottedPath', () => {
  const t = getTestObj();
  expect(findByDottedPath('kids[1]', t)).toEqual({name:'Sam'});
  expect(findByDottedPath('address.street', t)).toEqual('Blah St');
  expect(findByDottedPath('kids[0].address.street', t)).toEqual('West St');

  const t2 = getTestMap();
  expect(findByDottedPath('jill.address.street', t2)).toEqual('Blah St');
});