import expect from 'expect';
import { compareKeys } from "../../data/Compare.js";

test(`compare-keys`, () => {
  const a = { colour: `red`, intensity: 5 };
  const b = { colour: `pink`, size: 10 };
  const c = compareKeys(a, b);
  expect(c.shared).toEqual([ `colour` ]);
  expect(c.a).toEqual([ `intensity` ]);
  expect(c.b).toEqual([ `size` ]);

})