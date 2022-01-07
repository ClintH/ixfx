import * as Lists from '../../src/collections/Lists';

/*
test('perfCircular', () => {
  const items = 100 * 1000;
  console.log(`Circular performance.Items: ${items}`);
  let s = performance.now();

  let a = new Lists.Circular(10);
  for (let i = 0; i < items; i++) {
    a = a.add('something');
  }
  console.log(performance.now() - s);
});

test('perfFifo', () => {
  const items = 100 * 1000;
  console.log(`Fifo performance.Items: ${items}`);
  let s = performance.now();

  let a = new Lists.Fifo(10);
  for (let i = 0; i < items; i++) {
    a = a.add('something');
  }
  console.log(performance.now() - s);
});

test('perfLifo', () => {
  const items = 100 * 1000;
  console.log(`Lifo performance.Items: ${items}`);
  let s = performance.now();

  let a = new Lists.Lifo(10);
  for (let i = 0; i < items; i++) {
    a = a.add('something');
  }
  console.log(performance.now() - s);
});
*/


test(`circular`, () => {
  const a = new Lists.Circular(5);
  const b = a.add(`test`);
  let c = b;
  for (let i = 0; i < 15; i++) {
    c = c.add(`test` + i);
  }
  expect(a).toEqual([]);
  expect(a.isFull).toBeFalsy();
  expect(a.length).toEqual(0);

  expect(b).toEqual([`test`]);
  expect(b.isFull).toBeFalsy();
  expect(b.length).toEqual(1);
  
  expect(c).toEqual([`test14`, `test10`, `test11`, `test12`, `test13`]);
  expect(c.isFull).toBeTruthy();
  expect(c.length).toEqual(5);

});

test(`stack`, () => {

  // Empty stack 
  let aa = Lists.stack<string>();
  expect(aa.isEmpty).toBeTruthy();
  expect(aa.isFull).toBeFalsy();
  expect(aa.peek).toBeUndefined();
  expect(() => aa.pop()).toThrowError();
  aa = aa.push(`something`);
  expect(aa.isEmpty).toBeFalsy();
  expect(aa.isFull).toBeFalsy();
  
  // Unbounded Stack
  const a = Lists.stack<string>();
  const b = a.push(`test`);
  let c = b;
  for (let i = 0; i < 15; i++) {
    c = c.push(`test` + i);
    expect(c.peek).toEqual(`test` + i);
  }

  // Take two off and add two more
  const d = c.pop().pop().push(`new1`).push(`new2`);

  // Tests immutability and stack ordering
  expect(a.data).toEqual([]);
  expect(b.data).toEqual([`test`]); 
  expect(c.data).toEqual([`test`, `test0`, `test1`, `test2`, `test3`, `test4`, `test5`, `test6`, `test7`, `test8`, `test9`, `test10`, `test11`, `test12`, `test13`, `test14`]);
  expect(d.data).toEqual([`test`, `test0`, `test1`, `test2`, `test3`, `test4`, `test5`, `test6`, `test7`, `test8`, `test9`, `test10`, `test11`, `test12`, `new1`, `new2`]);

  expect(a.length).toEqual(0);
  expect(b.length).toEqual(1);
  expect(c.length).toEqual(16);
  expect(d.length).toEqual(16);

  expect(a.peek).toBeUndefined();
  expect(b.peek).toEqual(`test`);
  expect(c.peek).toEqual(`test14`);
  expect(d.peek).toEqual(`new2`);

  // Test different overflow logic for bounded stacks

  // Discard additions: let something in
  let e = Lists.stack<string>({capacity: 3, overflowPolicy: Lists.StackOverflowPolicy.DiscardAdditions}, `test0`, `test1`);
  e = e.push(`test2`, `test3`, `test4`); // Only test2 should make it in
  expect(e.data).toEqual([`test0`, `test1`, `test2`]);

  // Discard additions: already full
  e = Lists.stack<string>({capacity: 3, overflowPolicy: Lists.StackOverflowPolicy.DiscardAdditions}, `test0`, `test1`, `test2`);
  e = e.push(`test3`, `test4`, `test5`); // Nothing can get in
  expect(e.data).toEqual([`test0`, `test1`, `test2`]);

  // Discard additions: let everything in 
  e = Lists.stack<string>({capacity: 6, overflowPolicy: Lists.StackOverflowPolicy.DiscardAdditions}, `test0`, `test1`, `test2`);
  e = e.push(`test3`, `test4`, `test5`); 
  expect(e.data).toEqual([`test0`, `test1`, `test2`, `test3`, `test4`, `test5`]);
  
  // Older items are discarded - partial flush
  let f = Lists.stack<string>({capacity: 4, overflowPolicy: Lists.StackOverflowPolicy.DiscardOlder}, `test0`, `test1`, `test2`);
  f = f.push(`test3`, `test4`, `test5`);
  expect(f.data).toEqual([`test2`, `test3`, `test4`, `test5`]);

  // Older items are discarded - complete flush
  f = Lists.stack<string>({capacity: 4, overflowPolicy: Lists.StackOverflowPolicy.DiscardOlder}, `test0`, `test1`, `test2`);
  f = f.push(`test3`, `test4`, `test5`, `test6`, `test7`);
  expect(f.data).toEqual([`test4`, `test5`, `test6`, `test7`]);

  // Older items are discarded  - exact flush
  f = Lists.stack<string>({capacity: 3, overflowPolicy: Lists.StackOverflowPolicy.DiscardOlder}, `test0`, `test1`, `test2`);
  f = f.push(`test3`, `test4`, `test5`);
  expect(f.data).toEqual([`test3`, `test4`, `test5`]);

  // Newer items are discarded - partial flush
  f = Lists.stack<string>({capacity: 4, overflowPolicy: Lists.StackOverflowPolicy.DiscardNewer}, `test0`, `test1`, `test2`);
  f = f.push(`test3`, `test4`, `test5`);
  expect(f.data).toEqual([`test0`, `test3`, `test4`, `test5`]);

  // Newer items are discarded - complete flush
  f = Lists.stack<string>({capacity: 4, overflowPolicy: Lists.StackOverflowPolicy.DiscardNewer}, `test0`, `test1`, `test2`);
  f = f.push(`test3`, `test4`, `test5`, `test6`, `test7`);
  expect(f.data).toEqual([`test4`, `test5`, `test6`, `test7`]);

  // Newer items are discarded - exact flush
  f = Lists.stack<string>({capacity: 3, overflowPolicy: Lists.StackOverflowPolicy.DiscardNewer}, `test0`, `test1`, `test2`);
  f = f.push(`test3`, `test4`, `test5`);
  expect(f.data).toEqual([`test3`, `test4`, `test5`]);
});

test(`queue-mutable`, () => {
  const a = Lists.queueMutable<string>();
  expect(a.isEmpty).toBeTruthy();
  expect(a.length).toEqual(0);
  expect(a.isFull).toBeFalsy();
  expect(a.peek).toBeUndefined();

  a.enqueue(`test0`);
  a.enqueue(`test1`);
  expect(a.length).toEqual(2);
  expect(a.isEmpty).toBeFalsy();
  expect(a.isFull).toBeFalsy();

  expect(a.data).toEqual([`test0`, `test1`]);
  expect(a.peek).toEqual(`test0`);

  let b = a.dequeue();
  expect(a.length).toEqual(1);
  expect(b).toEqual(`test0`);

  b = a.dequeue();
  expect(a.isEmpty).toBeTruthy();
  expect(a.length).toEqual(0);
  expect(a.peek).toBeUndefined();
  expect(b).toEqual(`test1`);
});

test(`queue`, () => {
  // Front of queue is index 0, end of queue (newer items) are end of array

  // Bounded queue. Default is that new additions are ignored
  const a = Lists.queue<string>({capacity:5 });
  expect(a.isEmpty).toBeTruthy();
  const b = a.enqueue(`test`);
  let c = b;
  for (let i = 0; i < 15; i++) {
    c = c.enqueue(`test` + i);

    // Queue peek always returns oldest item, not the latest
    expect(c.peek).toEqual(`test`);

    if (i < 3) expect(c.isFull).toBeFalsy();
    else expect(c.isFull).toBeTruthy();
    expect(c.isEmpty).toBeFalsy();
  }

  // Test immutability and enqueing
  const d = c.dequeue().dequeue().enqueue(`new1`).enqueue(`new2`);
  expect(a.length).toEqual(0);  
  expect(b.data).toEqual([`test`]);
  expect(c.data).toEqual([`test`, `test0`, `test1`, `test2`, `test3`]);
  expect(d.data).toEqual([`test1`, `test2`, `test3`, `new1`, `new2`]);

  // Unbounded queue
  let a1 = Lists.queue<string>();
  for (let i = 0; i < 15; i++) {
    a1 = a1.enqueue(`test` + i);
  }
  expect(a1.data).toEqual([`test0`, `test1`, `test2`, `test3`, `test4`, `test5`, `test6`, `test7`, `test8`, `test9`, `test10`, `test11`, `test12`, `test13`, `test14`]);

  // Test different overflow logic

  // Discard additions: let something in
  let e = Lists.queue<string>({capacity: 4, overflowPolicy: Lists.QueueOverflowPolicy.DiscardAdditions}, `test0`, `test1`, `test2`);
  e = e.enqueue(`test3`, `test4`, `test5`); // Only test3 should make it in
  expect(e.data).toEqual([`test0`, `test1`, `test2`, `test3`]);

  // Discard additions: already full
  e = Lists.queue<string>({capacity: 3, overflowPolicy: Lists.QueueOverflowPolicy.DiscardAdditions}, `test0`, `test1`, `test2`);
  e = e.enqueue(`test3`, `test4`, `test5`);
  expect(e.data).toEqual([`test0`, `test1`, `test2`]);
  
  // Discard additions: let everything in
  e = Lists.queue<string>({capacity: 6, overflowPolicy: Lists.QueueOverflowPolicy.DiscardAdditions}, `test0`, `test1`, `test2`);
  e = e.enqueue(`test3`, `test4`, `test5`);
  expect(e.data).toEqual([`test0`, `test1`, `test2`, `test3`, `test4`, `test5`]);
  
  // Older items are discarded (ie test0, test1) - partial flush
  let f = Lists.queue<string>({capacity: 4, overflowPolicy: Lists.QueueOverflowPolicy.DiscardOlder}, `test0`, `test1`, `test2`);
  f = f.enqueue(`test3`, `test4`, `test5`);
  expect(f.data).toEqual([`test2`, `test3`, `test4`, `test5`]);

  // Older items are discarded (ie test0, test1) - complete flush
  f = Lists.queue<string>({capacity: 4, overflowPolicy: Lists.QueueOverflowPolicy.DiscardOlder}, `test0`, `test1`, `test2`);
  f = f.enqueue(`test3`, `test4`, `test5`, `test6`, `test7`);
  expect(f.data).toEqual([`test4`, `test5`, `test6`, `test7`]);

  // Older items are discarded (ie test0, test1) - exact flush
  f = Lists.queue<string>({capacity: 3, overflowPolicy: Lists.QueueOverflowPolicy.DiscardOlder}, `test0`, `test1`, `test2`);
  f = f.enqueue(`test3`, `test4`, `test5`);
  expect(f.data).toEqual([`test3`, `test4`, `test5`]);

  // Newer items are discarded (ie test1, test2) - partial flush
  let g = Lists.queue<string>({capacity: 4, overflowPolicy: Lists.QueueOverflowPolicy.DiscardNewer}, `test0`, `test1`, `test2`);
  g = g.enqueue(`test3`, `test4`, `test5`); // Only `test2` should survive from original
  expect(g.data).toEqual([`test0`, `test3`, `test4`, `test5`]);

  // Newer items are discarded (ie test1, test2) - complete flush
  g = Lists.queue<string>({capacity: 4, overflowPolicy: Lists.QueueOverflowPolicy.DiscardNewer}, `test0`, `test1`, `test2`);
  g = g.enqueue(`test3`, `test4`, `test5`, `test6`, `test7`);
  expect(g.data).toEqual([`test4`, `test5`, `test6`, `test7`]);

  // Newer items are discarded (ie test1, test2) - exact flush
  g = Lists.queue<string>({capacity: 3, overflowPolicy: Lists.QueueOverflowPolicy.DiscardNewer}, `test0`, `test1`, `test2`);
  g = g.enqueue(`test3`, `test4`, `test5`);
  expect(g.data).toEqual([`test3`, `test4`, `test5`]);

});

