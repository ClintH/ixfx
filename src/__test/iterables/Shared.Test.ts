import test from "ava";
import * as Iter from '../../iterables/index.js';

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