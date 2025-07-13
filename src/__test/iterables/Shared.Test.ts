import expect from 'expect';
import * as Iter from '../../iterables/index.js';
import { count } from "../../numbers/Count.js";
import { sleep } from "../../flow/Sleep.js";

test(`controller-basic`, async () => {
  let createdIterators = 0;
  let values = 0;
  const ic1 = Iter.iteratorController({
    iterator: () => {
      createdIterators++;
      return count(5);
    },
    onValue(value) {
      values++;
    },
  });
  await sleep(100);
  expect(values).toBe(0);
  expect(createdIterators).toBe(0);
  expect(ic1.state).toBe(`stopped`);
  ic1.start();
  expect(ic1.state).toBe(`running`);
  await sleep(100);
  expect(createdIterators).toBe(1);
  expect(values).toBe(5);
});

test(`controller-delay`, async () => {
  let createdIterators = 0;
  let values: number[] = [];
  const ic1 = Iter.iteratorController({
    iterator: () => {
      createdIterators++;
      return count(5);
    },
    onValue(value) {
      values.push(value);
    },
    delay: 50
  });
  ic1.start();
  await sleep(210);
  expect(createdIterators).toBe(1);
  expect(values.length).toBe(4);
  ic1.cancel();
});

test(`controller-restart`, async () => {
  let createdIterators = 0;
  let values: number[] = [];
  const ic1 = Iter.iteratorController({
    iterator: () => {
      createdIterators++;
      return count(5);
    },
    onValue(value) {
      values.push(value);
    },
    delay: 50
  });
  ic1.start();
  await sleep(210);
  expect(createdIterators).toBe(1);
  expect(values.length).toBe(4);
  ic1.restart();
  await sleep(50);
  expect(ic1.state).toBe(`running`);
  expect(createdIterators).toBe(2);

  await sleep(210);
  expect(values).toEqual([ 0, 1, 2, 3, 0, 1, 2, 3, 4 ]);
  ic1.cancel();
});

test(`controller-pause-resume`, async () => {
  let createdIterators = 0;
  let values: number[] = [];
  const ic1 = Iter.iteratorController({
    iterator: () => {
      createdIterators++;
      return count(10);
    },
    onValue(value) {
      values.push(value);
    },
    delay: 50
  });
  ic1.start();
  await sleep(210);
  ic1.pause();
  expect(createdIterators).toBe(1);
  expect(values.length).toBe(4);
  expect(ic1.state).toBe(`paused`);

  // Test that nothing happens while paused
  await sleep(110);
  expect(createdIterators).toBe(1);
  expect(values.length).toBe(4);
  expect(ic1.state).toBe(`paused`);

  // Continue, test that we don't create a new iterator
  // and that total values is 8
  ic1.start();
  await sleep(210);
  ic1.cancel();
  expect(createdIterators).toBe(1);
  expect(values.length).toBe(8);
  expect(ic1.state).toBe(`stopped`);
});


test(`fromFunctionAwaited`, async () => {
  let count = 0;
  let executed = 0;
  const results: Array<number> = [];
  const fn = () => {
    executed++;
    return executed;
  }
  for await (const v of Iter.fromFunctionAwaited(fn)) {
    results.push(v);
    count++;
    if (count === 5) break;
  }
  expect(count).toBe(5);
  expect(executed).toBe(5);
  expect(results).toEqual([ 1, 2, 3, 4, 5 ]);
});