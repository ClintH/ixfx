import test from 'ava';
import * as Rx from '../../../rx/index.js';
test(`transform`, async t => {
  // Simple array as source
  const data = [ 1, 2, 3, 4, 5 ];
  const values = Rx.transform(data, (v => v + '!'));
  const valuesArray = await Rx.toArray(values);
  t.is(valuesArray.length, data.length);
  for (let i = 0; i < data.length; i++) {
    t.is(valuesArray[ i ], data[ i ] + '!');
  }
});