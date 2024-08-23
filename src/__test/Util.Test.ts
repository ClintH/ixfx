import test from 'ava';
import { relativeDifference } from '../numbers/Difference.js';
import { toStringDefault } from '../util/ToString.js';
test('relativeDifference', (t) => {
  const rel = relativeDifference(100);
  t.is(rel(100), 1);
  t.is(rel(150), 1.5);
  t.is(rel(50), 0.5);
});


test(`toStringDefault`, (t) => {
  const a = {
    name: "Blah blah",
    age: 30,
    alive: true,
    height: 192.4
  }

  const aa = {
    name: "Blah blah",
    age: 30,
    alive: true,
    height: 192.4
  }

  const b = "Blah blah";
  const bb = "Blah blah";

  t.is(toStringDefault(a), toStringDefault(aa));
  t.is(toStringDefault(b), toStringDefault(bb));
})
