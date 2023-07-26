/* eslint-disable */
import test from 'ava';
import {mutable} from '../../collections/queue/QueueMutable.js';

test(`basic`, t => {
  const a = mutable<string>();

  // Check initial state
  t.true(a.isEmpty);
  t.true(a.length === 0);
  t.false(a.isFull);
  t.falsy(a.peek);

  // Add two things
  t.true(a.enqueue(`test0`) === 1);
  t.true(a.enqueue(`test1`) === 2);

  t.true(a.length === 2);
  t.false(a.isEmpty);
  t.false(a.isFull);

  t.like(a.data, [`test0`, `test1`]);
  t.true(a.peek === `test0`);

  // Remove from front of queue
  let b = a.dequeue();
  t.true(a.length  === 1);
  t.true(b === `test0`);

  // Remove again, queue is empty
  b = a.dequeue();
  t.true(a.isEmpty);
  t.true(a.length === 0);
  t.falsy(a.peek);
  t.true(b === `test1`);

  // Add multiple
  a.enqueue('test2', 'test3', 'test4');
  t.true(a.length === 3);
  t.true(a.peek === 'test2');
});

test('bounded older', t => {
  const qOlder1 = mutable<string>({capacity: 3, discardPolicy: 'older'});
  const qOlder2 = mutable<string>({capacity: 3, discardPolicy: 'older'});
  
  // Add as a batch
  qOlder1.enqueue(`a`,`b`,`c`,`d`);

  // Add sequentially
  qOlder2.enqueue(`a`); qOlder2.enqueue(`b`); qOlder2.enqueue(`c`); qOlder2.enqueue(`d`);

  t.true(qOlder1.length === 3);
  t.true(qOlder1.isFull);
  t.like(qOlder1.data, [`b`,`c`,`d`]);
  t.true(qOlder2.length === 3);
  t.true(qOlder2.isFull);
  t.like(qOlder2.data, [`b`,`c`,`d`]);
  
  qOlder1.enqueue(`e`,`f`,`g`);
  qOlder2.enqueue(`e`); qOlder2.enqueue(`f`); qOlder2.enqueue(`g`);
  
  t.like(qOlder1.data, [`e`,`f`,`g`]);
  t.true(qOlder1.length === 3);
  t.true(qOlder1.isFull);

  t.like(qOlder2.data, [`e`,`f`,`g`]);
  t.true(qOlder2.length === 3);
  t.true(qOlder2.isFull);
});

test('bounded newer', t => {
  const q1 = mutable<string>({capacity: 3, discardPolicy: 'newer'});
  const q2 = mutable<string>({capacity: 3, discardPolicy: 'newer'});
  q1.enqueue(`a`,`b`,`c`,`d`);
  q2.enqueue(`a`); q2.enqueue(`b`); q2.enqueue(`c`); q2.enqueue(`d`);

  t.true(q1.length === 3);
  t.true(q1.isFull);
  t.like(q1.data, [`a`,`b`,`c`]);
  
  t.true(q2.length === 3);
  t.true(q2.isFull);
  t.like(q2.data, [`a`,`b`,`c`]);
  
  q1.enqueue(`e`,`f`,`g`);
  q2.enqueue(`e`); q2.enqueue(`f`); q2.enqueue(`g`);
  
  t.like(q1.data, [`a`,`b`,`c`]);
  t.true(q1.length === 3);
  t.true(q1.isFull);

  t.like(q2.data, [`a`,`b`,`c`]);
  t.true(q2.length === 3);
  t.true(q2.isFull);
  
});

test('bounded additions', t=>{
  const q1 = mutable<string>({capacity: 3, discardPolicy: 'additions'});
  const q2 = mutable<string>({capacity: 3, discardPolicy: 'additions'});

  q1.enqueue(`a`,`b`,`c`,`d`);
  q2.enqueue(`a`); q2.enqueue(`b`); q2.enqueue(`c`); q2.enqueue(`d`);

  t.true(q1.length === 3);
  t.true(q1.isFull);
  t.like(q1.data, [`a`,`b`,`c`]);
  
  t.true(q2.length === 3);
  t.true(q2.isFull);
  t.like(q2.data, [`a`,`b`,`c`]);
  
  q1.enqueue(`e`,`f`,`g`);
  
  t.like(q1.data, [`a`,`b`,`c`]);
  t.true(q1.length === 3);
  t.true(q1.isFull);

  q1.dequeue();
  t.true(q1.length === 2);
  t.false(q1.isFull);
})