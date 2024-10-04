import test from 'ava';
import { toStringDefault } from '../util/ToString.js';

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
