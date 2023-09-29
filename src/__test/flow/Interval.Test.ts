import test from 'ava';
import { intervalToMs, isInterval } from '../../flow/IntervalType.js';
import { Elapsed, interval } from '../../flow/index.js';
import { isApproximately } from '../../Numbers.js';
import { count } from '../../Generators.js';

test('interval-function', async (t) => {
  const rateMs = 100;
  const maxLoops = 5;
  const randomGenerator = interval(Math.random, { fixed: rateMs });

  //eslint-disable-next-line functional/no-let
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
  t.true(isApproximately(maxLoops * rateMs, 0.1, elapsed()));
});

test('interval-array', async (t) => {
  const opts = {
    fixed: 100,
    delay: 'before',
  } as const;
  const list = [ 'thom', 'jonny', 'colin', 'ed', 'phil' ];
  const iterateResult = [];
  const elapsed = Elapsed.once();
  for await (const i of interval(list, opts)) {
    if (typeof i !== 'string') t.fail(`Expected string type. Got: ${ typeof i }`);
    //eslint-disable-next-line functional/immutable-data
    iterateResult.push(i);
  }

  t.like(list, iterateResult);
  t.true(
    isApproximately((list.length + 1) * opts.fixed, 0.1, elapsed()),
    `Elapsed: ${ elapsed() }`
  );
});

test('interval-generator', async (t) => {
  // A generator that counts to 5
  const counter = count(5);
  const created = [];
  // Use interval to loop over counter with 1000ms delay
  for await (const v of interval(counter, 100)) {
    if (typeof v !== `number`) {
      t.fail(`Expected number return type, got ${ typeof v }`);
    }
    //eslint-disable-next-line functional/immutable-data
    created.push(v);
  }
  t.like(created, [ 0, 1, 2, 3, 4 ]);
});

test('interval-type', (t) => {
  t.true(isInterval(10));
  t.true(isInterval({ millis: 100 }));
  t.true(isInterval({ secs: 10 }));
  t.true(isInterval({ mins: 10 }));
  t.true(isInterval({ hours: 1 }));

  t.true(isInterval({ secs: 10, millis: 100 }));
  t.true(isInterval({ mins: 10, secs: 10, millis: 100 }));
  t.true(isInterval({ hours: 2, mins: 10, secs: 10, millis: 100 }));

  // @ts-ignore
  t.false(isInterval({ millis: false }));
  // @ts-ignore
  t.false(isInterval({ millis: 'hello' }));
  // @ts-ignore
  t.false(isInterval({ millis: undefined }));
  // @ts-ignore
  t.false(isInterval({ millis: null }));
  // @ts-ignore
  t.false(isInterval({ millis: Number.NaN }));

  t.false(isInterval(Number.NaN));

  // @ts-ignore
  t.false(isInterval(undefined));
  // @ts-ignore
  t.false(isInterval(null));
  // @ts-ignore
  t.false(isInterval('hello'));
  // @ts-ignore
  t.false(isInterval(false));
  // @ts-ignore
  t.false(isInterval(true));
  // @ts-ignore
  t.false(isInterval({ gorp: 10 }));
});

test('interval-type-to-ms', (t) => {
  t.is(intervalToMs({ millis: 1000 }), 1000);

  t.is(intervalToMs({ secs: 1 }), 1000);

  t.is(intervalToMs({ millis: 1000, secs: 1 }), 2000);

  t.is(intervalToMs({ mins: 1 }), 60 * 1000);
  t.is(intervalToMs({ mins: 1, secs: 1 }), 60 * 1000 + 1000);

  t.is(intervalToMs({ hours: 1 }), 60 * 60 * 1000);
  t.is(
    intervalToMs({ hours: 1, mins: 1, secs: 1 }),
    60 * 60 * 1000 + 60 * 1000 + 1000
  );
});
