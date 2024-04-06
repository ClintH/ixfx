import test from 'ava';
import * as Rx from '../../rx/index.js';
import * as Flow from '../../flow/index.js';
import { isApproximately } from '../../numbers/IsApproximately.js';
import * as Iter from '../../iterables/index.js';
test(`rx-from-array`, async t => {
  const a1 = [ 1, 2, 3, 4, 5 ];
  const rateMs = 5;

  // Default options
  let start = Flow.Elapsed.once();
  const v1 = Rx.readFromArray(a1, { lazy: `initial`, interval: rateMs });
  t.false(v1.isDone());
  t.is(v1.last(), 1);

  let read: number[] = [];
  let seenClose = false;
  const v1Off = v1.on(msg => {
    if (msg.value) {
      read.push(msg.value);
      if (read.length === a1.length) {
        const elapsed = start();
        const expectedTime = rateMs * (a1.length + 2);
        t.true(isApproximately(expectedTime, 0.2, elapsed), `Elapsed time ${ elapsed } vs. ${ expectedTime }`);
      }
    } else if (msg.signal === `done`) {
      seenClose = true;
    }
  });
  await Flow.sleep(1000);
  v1Off();
  t.deepEqual(read, a1);
  t.true(seenClose, `Done message`);
});

test(`rx-from-array-lazy`, async t => {
  const a1 = [ 1, 2, 3, 4, 5 ];

  // Pause: Step 1: read 2 items from source
  const v2 = Rx.readFromArray(a1, { lazy: `initial` });
  let read: number[] = [];
  let seenClose = false;
  const v2Off1 = v2.on(msg => {
    if (msg.value) {
      read.push(msg.value);
      if (read.length === 2) {
        v2Off1();
      }
    } else if (msg.signal === `done`) {
      seenClose = true;

    }
  });
  // Should only have two items, because we unsubscribed
  await Flow.sleep(200);
  t.deepEqual(read, [ 1, 2 ]);
  t.false(seenClose, `Done signal`); // Array is not done

  // Pause: Step 2: keep reading, expecting data to continue and complete
  const v2Off2 = v2.on(msg => {
    if (msg.value) {
      read.push(msg.value);
    } else if (msg.signal === `done`) {
      seenClose = true;
    }
  });
  await Flow.sleep(200);
  t.true(seenClose, `Done signal`);
  t.deepEqual(read, a1);

  // Reset: Step 1 read 2 times
  const v3 = Rx.readFromArray(a1, { whenStopped: `reset`, lazy: `initial`, interval: 10 });
  read = [];
  const v3Off1 = v3.on(msg => {
    if (msg.value) {
      read.push(msg.value);
      if (read.length === 2) {
        // Since whenStopped=reset, it will reset to beginning of array
        // when there are no subscribers
        v3Off1();
      }
    }
  });
  await Flow.sleep(50);
  t.deepEqual(read, [ 1, 2 ]);

  // Reset: Step 2: continue reading
  seenClose = false;
  const v3Off2 = v3.on(msg => {
    if (msg.value) read.push(msg.value);
    if (msg.signal === `done`) seenClose = true;
  });
  await Flow.sleep(200);
  t.deepEqual(read, [ 1, 2, 1, 2, 3, 4, 5 ]);
  t.true(seenClose, `Done signal`);
});
