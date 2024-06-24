import test from "ava";
import { compareKeys } from "../../data/Compare.js";

test(`compare-keys`, t => {
  const a = { colour: `red`, intensity: 5 };
  const b = { colour: `pink`, size: 10 };
  const c = compareKeys(a, b);
  t.deepEqual(c.shared, [ `colour` ]);
  t.deepEqual(c.a, [ `intensity` ]);
  t.deepEqual(c.b, [ `size` ]);

})