import { expect, test } from 'vitest';
import { PriorityMutable } from '../../src/queue/priority-mutable.js';

test(`basic`, () => {
  const p1 = new PriorityMutable<string>();
  p1.enqueueWithPriority(`low`, 2);
  p1.enqueueWithPriority(`high`, 4);
  p1.enqueueWithPriority(`medium`, 3);

  expect(p1.peekMax()).toBe(`high`);
  expect(p1.peekMin()).toBe(`low`);
  expect(p1.length).toBe(3);

  expect(p1.dequeueMax()).toBe(`high`);
  expect(p1.peekMax()).toBe(`medium`);


  expect(p1.dequeueMax()).toBe(`medium`);
  expect(p1.peekMax()).toBe(`low`);

});