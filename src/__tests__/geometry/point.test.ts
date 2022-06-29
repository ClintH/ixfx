
import * as Points from '../../geometry/Point.js';

test(`subtract`, () => {
  expect(Points.subtract({x:5, y:10}, 1)).toEqual({x: 4, y: 9});


  expect(Points.subtract(5, 10, 1, 2)).toEqual({x: 4, y: 8});
  expect(Points.subtract(1, 2, 0, 0)).toEqual({x: 1, y: 2});

  expect(Points.subtract({x: 5, y: 10}, -1, -2)).toEqual({x: 6, y: 12});
  expect(Points.subtract({x: 5, y: 10}, {x: 1, y: 2})).toEqual({x: 4, y: 8});


  expect(() => Points.subtract(NaN, 2, 0, 0)).toThrow();
  expect(() => Points.subtract(1, NaN, 0, 0)).toThrow();
  expect(() => Points.subtract(1, 2, NaN, 0)).toThrow();
  expect(() => Points.subtract(1, 2, 0, NaN)).toThrow();
});

test(`sum`, () => {
  expect(Points.sum({x:5, y:10}, 1)).toEqual({x: 6, y: 11});


  expect(Points.sum(5, 10, 1, 2)).toEqual({x: 6, y: 12});
  expect(Points.sum(1, 2, 0, 0)).toEqual({x: 1, y: 2});

  expect(Points.sum({x: 5, y: 10}, -1, -2)).toEqual({x: 4, y: 8});
  expect(Points.sum({x: 5, y: 10}, {x: 1, y: 2})).toEqual({x: 6, y: 12});


  expect(() => Points.sum(NaN, 2, 0, 0)).toThrow();
  expect(() => Points.sum(1, NaN, 0, 0)).toThrow();
  expect(() => Points.sum(1, 2, NaN, 0)).toThrow();
  expect(() => Points.sum(1, 2, 0, NaN)).toThrow();
});

test(`multiply`, () => {
  expect(Points.multiply({x:5, y:10}, 2)).toEqual({x: 10, y: 20});
  
  expect(Points.multiply({x: 2, y: 3}, {x: 0.5, y: 2})).toEqual({x: 1, y: 6});
  expect(Points.multiply({x: 2, y: 3}, 0.5, 2)).toEqual({x: 1, y: 6});

  expect(Points.multiply({x: 2, y: 3}, 0, 2)).toEqual({x: 0, y: 6});
  expect(Points.multiply({x: 2, y: 3}, 2, 0)).toEqual({x: 4, y: 0});


  expect(() => Points.multiply({x: 10, y: 5}, NaN, 2)).toThrow();
  expect(() => Points.multiply({x: 10, y: 5}, 2, NaN)).toThrow();
});

test(`divide`, () => {
  expect(Points.divide({x:5, y:10}, 2)).toEqual({x: 2.5, y: 5});


  expect(Points.divide({x: 10, y: 5}, {x: 5, y: 2})).toEqual({x: 2, y: 2.5});
  expect(Points.divide({x: 10, y: 5}, 5, 2)).toEqual({x: 2, y: 2.5});

  // A contains 0
  expect(Points.divide({x: 0, y: 5}, {x: 5, y: 2})).toEqual({x: 0, y: 2.5});
  expect(Points.divide({x: 10, y: 0}, 5, 2)).toEqual({x: 2, y: 0});

  // Should not throw if a contains a zero
  // expect(() => Points.divide({x: 0, y: 5}, 1, 11)).toThrow();
  // expect(() => Points.divide({x: 10, y: 0}, 1, 1)).toThrow();

  // B contains zero
  expect(() => Points.divide({x: 10, y: 5}, 0, 10)).toThrow();
  expect(() => Points.divide({x: 10, y: 5}, 10, 0)).toThrow();
  expect(() => Points.divide({x: 10, y: 5}, {x: 0, y: 10})).toThrow();
  expect(() => Points.divide({x: 10, y: 5}, {x: 10, y: 0})).toThrow();

  // B contains NaN
  expect(() => Points.divide({x: 10, y: 5}, NaN, 2)).toThrow();
  expect(() => Points.divide({x: 10, y: 5}, 2, NaN)).toThrow();
});

test(`length`, () => {
  // Expected results from https://calculator.academy/normalize-vector-calculator/#f1p1|f2p0
  expect(Points.distance({x: 5, y:2})).toBeCloseTo(5.385164807134504, 7);
  expect(Points.distance({x: -5, y:2})).toBeCloseTo(5.385164807134504, 7);
  expect(Points.distance({x: 5, y:-2})).toBeCloseTo(5.385164807134504, 7);
});

test(`angle`, () => {
  // Expected results from https://calculator.academy/normalize-vector-calculator/#f1p1|f2p0
  expect(Points.angle({x: 0, y:10})).toBeCloseTo(1.5708, 4); // 90 degrees
  expect(Points.angle({x: 10, y:0})).toBeCloseTo(0, 4); // 0 degrees
  expect(Points.angle({x: 2, y:5})).toBeCloseTo(1.190290375284613456, 4); // 68 degrees

  
});

test(`normalise`, () => {
  // Expected results from https://calculator.academy/normalize-vector-calculator/#f1p1|f2p0
  expect(Points.normalise({x: 5, y:2})).toEqual({x:0.9284766908852594, y:0.3713906763541037});
  expect(Points.normalise({x: -5, y:2})).toEqual({x:-0.9284766908852594, y:0.3713906763541037});
  expect(Points.normalise({x: 5, y:-2})).toEqual({x:0.9284766908852594, y:-0.3713906763541037});

});

test(`normaliseByRect`, () => {
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