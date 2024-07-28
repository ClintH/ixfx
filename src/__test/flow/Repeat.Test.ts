import test from 'ava';
import { repeat } from '../../flow/Repeat.js';
import { Elapsed } from '../../flow/index.js';
import { isApprox } from '../../numbers/IsApprox.js';
import { count } from '../../numbers/Count.js';

test('function', async (t) => {
  const rateMs = 50;
  const maxLoops = 5;
  let startCalled = 0;
  let completeCalled = 0;
  const randomGenerator = await repeat(Math.random, {
    delay: rateMs,
    onStart() {
      startCalled++;
    },
    onComplete(withError) {
      completeCalled++;
    }
  });

  let produced = 0;
  const elapsed = Elapsed.since();

  for await (const r of randomGenerator) {
    if (typeof r !== 'number') {
      t.fail(`Iterator should be number. Got: ${ typeof r }`);
    }
    produced++;
    if (produced === maxLoops) break;
  }

  t.is(produced, maxLoops);
  t.true(isApprox(0.1, maxLoops * rateMs, elapsed()));
  t.is(startCalled, 1);
  t.is(completeCalled, 1);
});

test('array', async (t) => {
  let startCalled = 0;
  let completeCalled = 0;
  let errors = 0;
  const opts = {
    delay: 50,
    delayWhen: 'before',
    onStart() {
      startCalled++;
    },
    onComplete(withError: boolean) {
      if (withError) errors++;
      completeCalled++;
    }
  } as const;
  const list = [ 'thom', 'jonny', 'colin', 'ed', 'phil' ];
  const iterateResult = [];
  const elapsed = Elapsed.once();
  for await (const i of repeat(list, opts)) {
    if (typeof i !== 'string') t.fail(`Expected string type. Got: ${ typeof i }`);
    iterateResult.push(i);
  }

  t.like(list, iterateResult);
  t.true(
    isApprox(0.1, (list.length + 1) * opts.delay, elapsed()),
    `Elapsed: ${ elapsed() }`
  );

  t.is(errors, 0);
  t.is(startCalled, 1);
  t.is(completeCalled, 1);
});

test('generator', async (t) => {
  // A generator that counts to 5
  const counter = count(5);
  const created = [];
  // Use interval to loop over counter with delay
  for await (const v of repeat(counter, { delay: 50 })) {
    if (typeof v !== `number`) {
      t.fail(`Expected number return type, got ${ typeof v }`);
    }
    created.push(v);
  }
  t.like(created, [ 0, 1, 2, 3, 4 ]);
});


