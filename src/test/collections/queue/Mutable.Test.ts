import test from 'ava';
import { QueueMutable } from '../../../collections/queue/QueueMutable.js';
import { arrayValuesEqual } from '../../util.js';

test(`basic`, (t) => {
  const a = new QueueMutable<string>();
  t.truthy(a.isEmpty);
  t.is(a.length, 0);
  t.falsy(a.isFull);
  t.falsy(a.peek);

  a.enqueue(`test0`);
  a.enqueue(`test1`);
  t.is(a.length, 2);
  t.falsy(a.isEmpty);
  t.falsy(a.isFull);

  arrayValuesEqual(t, a.data, [`test0`, `test1`]);
  t.is(a.peek, `test0`);

  const b = a.dequeue();
  t.is(a.length, 1);
  t.is(b, `test0`);

  const c = a.dequeue();
  t.true(a.isEmpty);
  t.is(a.length, 0);
  t.falsy(a.peek);
  t.is(c, `test1`);
});
