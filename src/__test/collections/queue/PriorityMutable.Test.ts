import test from 'ava';
import { PriorityMutable } from '../../../collections/queue/PriorityMutable.js';

test(`basic`, (t) => {
  const p1 = new PriorityMutable<string>();
  p1.enqueueWithPriority(`low`, 2);
  p1.enqueueWithPriority(`high`, 4);
  p1.enqueueWithPriority(`medium`, 3);

  t.is(p1.peekMax(), `high`);
  t.is(p1.peekMin(), `low`);
  t.is(p1.length, 3);

  t.is(p1.dequeueMax(), `high`);
  t.is(p1.peekMax(), `medium`);


  t.is(p1.dequeueMax(), `medium`);
  t.is(p1.peekMax(), `low`);

});