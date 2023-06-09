import test from 'ava';
import {getClosestIntegerKey} from '../../collections/Map.js';

test('getClosestIntegerKey', t => {
  const data =new Map<number,boolean>();
  data.set(1, true);
  data.set(2, true);
  data.set(3, true);
  data.set(4, true);
  console.log([...data.keys()]);
  t.is(getClosestIntegerKey(data, 3), 3);
  t.is(getClosestIntegerKey(data, 3.1), 3);
  t.is(getClosestIntegerKey(data, 3.5), 4);
  t.is(getClosestIntegerKey(data, 3.6), 4);
  t.is(getClosestIntegerKey(data, 100), 4);
  t.is(getClosestIntegerKey(data, -100), 1);


});