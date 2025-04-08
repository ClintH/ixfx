import expect from 'expect';
import * as Rx from '../../../rx/index.js';
test(`transform`, async () => {
  // Simple array as source
  const data = [ 1, 2, 3, 4, 5 ];
  const values = Rx.transform(data, (v => v + '!'));
  const valuesArray = await Rx.toArray(values);
  expect(valuesArray.length).toBe(data.length);
  for (let i = 0; i < data.length; i++) {
    expect(valuesArray[ i ]).toBe(data[ i ] + '!');
  }
});