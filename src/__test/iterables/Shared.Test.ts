import test from "ava";
import * as Iter from '../../iterables/index.js';
import { count } from "../../numbers/Count.js";
import { sleep } from "../../flow/Sleep.js";

test(`controller-basic`, async t => {
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
  t.is(values, 0);
  t.is(createdIterators, 0);
  t.is(ic1.state, `stopped`);
  ic1.start();
  t.is(ic1.state, `running`);
  await sleep(100);
  t.is(createdIterators, 1);
  t.is(values, 5);
});

test(`controller-delay`, async t => {
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
  t.is(createdIterators, 1);
  t.is(values.length, 4);
  ic1.cancel();
});

test(`controller-restart`, async t => {
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
  t.is(createdIterators, 1);
  t.is(values.length, 4);
  ic1.restart();
  await sleep(50);
  t.is(ic1.state, `running`);
  t.is(createdIterators, 2);

  await sleep(210);
  t.deepEqual(values, [ 0, 1, 2, 3, 0, 1, 2, 3, 4 ]);
  ic1.cancel();
});

test(`controller-pause-resume`, async t => {
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
  t.is(createdIterators, 1);
  t.is(values.length, 4);
  t.is(ic1.state, `paused`);

  // Test that nothing happens while paused
  await sleep(110);
  t.is(createdIterators, 1);
  t.is(values.length, 4);
  t.is(ic1.state, `paused`);

  // Continue, test that we don't create a new iterator
  // and that total values is 8
  ic1.start();
  await sleep(210);
  ic1.cancel();
  t.is(createdIterators, 1);
  t.is(values.length, 8);
  t.is(ic1.state, `stopped`);
});


test(`fromFunctionAwaited`, async t => {
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
  t.is(count, 5);
  t.is(executed, 5);
  t.deepEqual(results, [ 1, 2, 3, 4, 5 ]);
});