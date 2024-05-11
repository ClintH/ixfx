import test from 'ava';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';
import { isApproximately } from '../../../numbers/IsApproximately.js';

/**
 * Tests read rate
 */
test(`array-interval`, async t => {
  const a1 = [ 1, 2, 3, 4, 5 ];
  const rateMs = 50;

  // Default options
  let start = Flow.Elapsed.once();
  const v1 = Rx.From.array(a1, { lazy: `initial`, interval: rateMs });
  t.false(v1.isDone());
  t.is(v1.last(), 1);

  let read: number[] = [];
  let seenClose = false;
  const v1Off = v1.on(msg => {
    if (msg.value) {
      read.push(msg.value);
      if (read.length === a1.length) {
        const elapsed = start();
        const expectedTime = rateMs * (a1.length + 1);
        t.true(isApproximately(expectedTime, 0.2, elapsed), `Elapsed time ${ elapsed } vs. ${ expectedTime }`);
      }
    } else if (msg.signal === `done`) {
      seenClose = true;
    }
  });
  await Flow.sleep((a1.length + 1) * rateMs);
  v1Off();
  t.deepEqual(read, a1);
  t.true(seenClose, `Done message`);
  t.true(v1.isDone());
});

/**
 * Continue iterating through same array when there's a subscriber
 * Lazy: very
 */
test(`array-when-stopped-continue-lazy-very`, async t => {
  const a1 = [ 1, 2, 3, 4, 5 ];

  // whenStopped: continue  lazy: initial 
  // 1. Read 2 items from source
  const v2 = Rx.From.array(a1, { whenStopped: `continue`, lazy: `very` });
  let read: number[] = [];
  let seenClose = false;
  const v2Off1 = v2.on(msg => {
    if (msg.value) {
      read.push(msg.value);
      if (read.length === 2) {
        v2Off1(); // Unsub
      }
    } else if (msg.signal === `done`) {
      seenClose = true;
    }
  });

  // Should only have two items, because we unsubscribed
  await Flow.sleep(200);
  t.deepEqual(read, [ 1, 2 ]);
  t.false(seenClose, `Done signal`); // Array is not done
  t.false(v2.isDone());

  // 2. keep reading, expecting data to continue and complete, matching input array
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
  t.true(v2.isDone());
  v2Off2();
});


test(`array-when-stopped-continue-lazy-initial`, async t => {
  const a1 = [ 1, 2, 3, 4, 5 ];

  // whenStopped: continue  lazy: initial 
  // 1. Read 2 items from source
  const v2 = Rx.From.array(a1, { whenStopped: `continue`, lazy: `initial`, interval: 10 });
  let read: number[] = [];
  let seenClose = false;
  const v2Off1 = v2.on(msg => {
    if (msg.value) {
      read.push(msg.value);
      if (read.length === 2) {
        v2Off1(); // Unsub
      }
    } else if (msg.signal === `done`) {
      seenClose = true;
    }
  });

  // Should only have two items, because we unsubscribed
  while (read.length != 2) {
    await Flow.sleep(10);
  }
  t.deepEqual(read, [ 1, 2 ]);
  t.false(seenClose, `Done signal`); // Array is not done
  t.false(v2.isDone());

  // 2. keep reading, expecting data to continue and complete, matching input array
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
  t.true(v2.isDone());
  v2Off2();
});

/**
 * Reset stepping through array
 * Very lazy, so when unsubscribed, it won't progress
 */
test(`array-when-stopped-reset-lazy-very`, async t => {
  const a1 = [ 1, 2, 3, 4, 5 ];
  let read: number[] = [];
  let seenClose = false;

  t.throws(() => {
    Rx.From.array(a1, { whenStopped: `reset`, lazy: `initial`, interval: 20 });
  });
  t.throws(() => {
    Rx.From.array(a1, { whenStopped: `reset`, lazy: `never`, interval: 20 });
  });

  // WhenStopped: 'reset',  lazy: 'initial'
  // 1. Read two items
  const v1 = Rx.From.array(a1, { whenStopped: `reset`, lazy: `very`, interval: 10 });
  const v1Off1 = v1.on(msg => {
    if (msg.value) {
      read.push(msg.value);
      if (read.length === 2) {
        // Since whenStopped=reset, it will reset to beginning of array
        // when there are no subscribers
        v1Off1();
      }
    }
  });
  await Flow.sleep(50);
  t.deepEqual(read, [ 1, 2 ]);
  t.false(v1.isDone());

  // 2. Continue reading. Expect final data to reset back to 1, 2... 
  seenClose = false;
  const v1Off2 = v1.on(msg => {
    if (msg.value) read.push(msg.value);
    if (msg.signal === `done`) seenClose = true;
  });
  await Flow.sleep(200);
  t.deepEqual(read, [ 1, 2, 1, 2, 3, 4, 5 ]);
  t.true(seenClose, `Done signal`);
  t.true(v1.isDone());
  v1Off2();
});
