import expect from 'expect';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';
test(`take-next-value`, async done => {
  const s1 = Rx.From.array([ 1, 2, 3, 4, 5 ], { interval: 100 });
  const r1 = await Rx.takeNextValue(s1);
  expect.assertions(3);

  // First value 1
  expect(r1).toBe(1);

  // Sleep for a bit to get past first value
  await Flow.sleep(50);

  // Second value should be 2
  const r2 = await Rx.takeNextValue(s1);
  expect(r2).toBe(2);

  // Sleep until all numbers emitted and source has ended. Should timeout
  await Flow.sleep(500);

  // This will throw because there's no more
  try {
    const v = await Rx.takeNextValue(s1, 500);
    done.fail(`Error not thrown. Instead got value: ${ v }`);
  } catch (error) {}
});
