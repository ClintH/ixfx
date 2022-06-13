
import * as Points from '../../geometry/Point.js';

test(`sum`, () => {
  expect(Points.sum(5, 10, 1, 2)).toEqual({x: 6, y: 3});
  expect(Points.sum(1, 2, 0, 0)).toEqual({x: 1, y: 2});

  expect(Points.sum({x: 5, y: 10}, -1, -2)).toEqual({x: 4, y: 8});
  expect(Points.sum({x: 5, y: 10}, {x: 1, y: 2})).toEqual({x: 6, y: 12});


  expect(() => Points.sum(NaN, 2, 0, 0)).toThrow();
  expect(() => Points.sum(1, NaN, 0, 0)).toThrow();
  expect(() => Points.sum(1, 2, NaN, 0)).toThrow();
  expect(() => Points.sum(1, 2, 0, NaN)).toThrow();
});

test(`multiply`, () => {
  expect(Points.multiply({x: 2, y: 3}, {x: 0.5, y: 2})).toEqual({x: 1, y: 6});
  expect(Points.multiply({x: 2, y: 3}, 0.5, 2)).toEqual({x: 1, y: 6});

  expect(Points.multiply({x: 2, y: 3}, 0, 2)).toEqual({x: 0, y: 6});
  expect(Points.multiply({x: 2, y: 3}, 2, 0)).toEqual({x: 4, y: 0});


  expect(() => Points.multiply({x: 10, y: 5}, NaN, 2)).toThrow();
  expect(() => Points.multiply({x: 10, y: 5}, 2, NaN)).toThrow();
});

test(`divide`, () => {
  expect(Points.divide({x: 10, y: 5}, {x: 5, y: 2})).toEqual({x: 2, y: 2.5});
  expect(Points.divide({x: 10, y: 5}, 5, 2)).toEqual({x: 2, y: 2.5});

  // A contains 0
  expect(() => Points.divide({x: 0, y: 5}, 1, 11)).toThrow();
  expect(() => Points.divide({x: 10, y: 0}, 1, 1)).toThrow();

  // B contains zero
  expect(() => Points.divide({x: 10, y: 5}, 0, 10)).toThrow();
  expect(() => Points.divide({x: 10, y: 5}, 10, 0)).toThrow();
  expect(() => Points.divide({x: 10, y: 5}, {x: 0, y: 10})).toThrow();
  expect(() => Points.divide({x: 10, y: 5}, {x: 10, y: 0})).toThrow();

  // B contains NaN
  expect(() => Points.divide({x: 10, y: 5}, NaN, 2)).toThrow();
  expect(() => Points.divide({x: 10, y: 5}, 2, NaN)).toThrow();
});


test(`normalise`, () => {
  expect(Points.normaliseByRect(100, 100, 100, 100)).toEqual({x: 1, y: 1});
  expect(Points.normaliseByRect(0, 0, 100, 100)).toEqual({x: 0, y: 0});
  expect(Points.normaliseByRect(50, 50, 100, 100)).toEqual({x: 0.5, y: 0.5});

  expect(Points.normaliseByRect(200, 50, 100, 100)).toEqual({x: 2, y: 0.5});
  expect(Points.normaliseByRect(50, 200, 100, 100)).toEqual({x: 0.5, y: 2});

  expect(Points.normaliseByRect({x: 100, y: 100}, 100, 100)).toEqual({x: 1, y: 1});
  expect(Points.normaliseByRect({x: 0, y: 0}, 100, 100)).toEqual({x: 0, y: 0});
  expect(Points.normaliseByRect({x: 50, y: 50}, 100, 100)).toEqual({x: 0.5, y: 0.5});

});

test(`wrap`, () => {
  // Within range
  expect(Points.wrap({x: 0, y: 0}, {x: 100, y: 100})).toEqual({x: 0, y: 0});

  expect(Points.wrap({x: 50, y: 50}, {x: 100, y: 100})).toEqual({x: 50, y: 50});
  expect(Points.wrap({x: 99, y: 99}, {x: 100, y: 100})).toEqual({x: 99, y: 99});

  // On the boundary
  expect(Points.wrap({x: 100, y: 100}, {x: 100, y: 100})).toEqual({x: 0, y: 0});

  // Wrapped x
  expect(Points.wrap({x: 150, y: 99}, {x: 100, y: 100})).toEqual({x: 50, y: 99});
  expect(Points.wrap({x: -50, y: 99}, {x: 100, y: 100})).toEqual({x: 50, y: 99});

  // Wrapped y
  expect(Points.wrap({x: 50, y: 150}, {x: 100, y: 100})).toEqual({x: 50, y: 50});
  expect(Points.wrap({x: 50, y: -50}, {x: 100, y: 100})).toEqual({x: 50, y: 50});

  // Wrapped x & y
  expect(Points.wrap({x: 150, y: 150}, {x: 100, y: 100})).toEqual({x: 50, y: 50});

});

test(`clamp`, () => {
  // Within range
  expect(Points.clamp({x: 50, y: 50}, 0, 100)).toEqual({x: 50, y: 50});
  expect(Points.clamp(50, 50, 0, 100)).toEqual({x: 50, y: 50});

  expect(Points.clamp({x: 100, y: 100}, 0, 100)).toEqual({x: 100, y: 100});
  expect(Points.clamp(100, 100, 0, 100)).toEqual({x: 100, y: 100});

  // Out of range x
  expect(Points.clamp({x: 101, y: 100}, 0, 100)).toEqual({x: 100, y: 100});
  expect(Points.clamp({x: -1, y: 100}, 0, 100)).toEqual({x: 0, y: 100});

  // Out of range y
  expect(Points.clamp({x: 100, y: 101}, 0, 100)).toEqual({x: 100, y: 100});
  expect(Points.clamp({x: 100, y: -1}, 0, 100)).toEqual({x: 100, y: 0});


});