import {numberTracker} from '../../data/NumberTracker.js';

test(`numberTracker`, () => {

  const a = numberTracker(`test`);
  expect(a.id).toEqual(`test`);
  expect(a.total).toEqual(0);
  
  a.seen(10);
  a.seen(10);
  a.seen(10);

  expect(a.avg).toEqual(10);
  expect(a.min).toEqual(10);
  expect(a.max).toEqual(10);
  expect(a.total).toEqual(30);
  expect(a.last).toEqual(10);
  expect(a.seenCount).toEqual(3);

  a.seen(100);
  expect(a.avg).toEqual(32.5);
  expect(a.min).toEqual(10);
  expect(a.max).toEqual(100);
  expect(a.total).toEqual(130);
  expect(a.last).toEqual(100);
  expect(a.seenCount).toEqual(4);

});