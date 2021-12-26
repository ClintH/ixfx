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


test('circular', () => {
  // Bounded circular
  let a = new Lists.Circular(5);
  let b = a.add('test');
  let c = b;
  for (let i = 0; i < 15; i++) {
    c = c.add('test' + i);
  }
  expect(a).toEqual([]);
  expect(b).toEqual(['test']);
  expect(c).toEqual(['test14', 'test10', 'test11', 'test12', 'test13']);
});

test('lifo', () => {
  // Bounded Lifo
  let a = new Lists.Lifo(5);
  let b = a.add('test');
  let c = b;
  for (let i = 0; i < 15; i++) {
    c = c.add('test' + i);
    expect(c.peek()).toEqual('test' + i);
  }
  let d = c.remove().remove().add('new1').add('new2');

  expect(a).toEqual([]);
  expect(b).toEqual(['test']);
  expect(c).toEqual(['test14', 'test13', 'test12', 'test11', 'test10']);
  expect(d).toEqual(['new2', 'new1', 'test12', 'test11', 'test10']);

  // Unbounded Lifo
  let a1 = new Lists.Lifo();
  for (let i = 0; i < 15; i++) {
    a1 = a1.add('test' + i);
  }
  expect(a1).toEqual(['test14', 'test13', 'test12', 'test11', 'test10', 'test9', 'test8', 'test7', 'test6', 'test5', 'test4', 'test3', 'test2', 'test1', 'test0']);
});

test('fifo', () => {
  // Bounded fifo
  let a = new Lists.Fifo(5);
  let b = a.add('test');
  let c = b;
  for (let i = 0; i < 15; i++) {
    c = c.add('test' + i);

    // Fifo peek returns oldest item, not the latest
    expect(c.peek()).toEqual('test');
  }

  let d = c.remove().remove().add('new1').add('new2');
  expect(a).toHaveLength(0);
  expect(b).toEqual(['test']);
  expect(c).toEqual(['test', 'test0', 'test1', 'test2', 'test3']);
  expect(d).toEqual(['test1', 'test2', 'test3', 'new1', 'new2']);

  // Unbounded fifo
  let a1 = new Lists.Fifo();
  for (let i = 0; i < 15; i++) {
    a1 = a1.add('test' + i);
  }
  expect(a1).toEqual(['test0', 'test1', 'test2', 'test3', 'test4', 'test5', 'test6', 'test7', 'test8', 'test9', 'test10', 'test11', 'test12', 'test13', 'test14']);
});

