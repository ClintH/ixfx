import expect from 'expect';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';
import { isApprox } from '../../../numbers/IsApprox.js';

/**
 * Tests read rate
 */
test(`array-interval`, async () => {
  const a1 = [ 1, 2, 3, 4, 5 ];
  const rateMs = 50;

  // Default options
  let start = Flow.Elapsed.once();
  const v1 = Rx.From.array(a1, { lazy: `initial`, interval: rateMs });
  expect(v1.isDone()).toBe(false);
  expect(v1.last()).toBe(1);

  let read: number[] = [];
  let seenClose = false;
  const v1Off = v1.on(msg => {
    if (msg.value) {
      read.push(msg.value);
      if (read.length === a1.length) {
        const elapsed = start();
        const expectedTime = rateMs * (a1.length + 1);
        expect(isApprox(0.2, expectedTime, elapsed)).toBe(true);
      }
    } else if (msg.signal === `done`) {
      seenClose = true;
    }
  });
  await Flow.sleep((a1.length + 1) * rateMs);
  v1Off();
  expect(read).toEqual(a1);
  expect(seenClose).toBe(true);
  expect(v1.isDone()).toBe(true);
});

/**
 * Continue iterating through same array when there's a subscriber
 * Lazy: very
 */
test(`array-when-stopped-continue-lazy-very`, async () => {
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
  expect(read).toEqual([ 1, 2 ]);
  expect(seenClose).toBe(false); // Array is not done
  expect(v2.isDone()).toBe(false);

  // 2. keep reading, expecting data to continue and complete, matching input array
  const v2Off2 = v2.on(msg => {
    if (msg.value) {
      read.push(msg.value);
    } else if (msg.signal === `done`) {
      seenClose = true;
    }
  });
  await Flow.sleep(200);
  expect(seenClose).toBe(true);
  expect(read).toEqual(a1);
  expect(v2.isDone()).toBe(true);
  v2Off2();
});


test(`array-when-stopped-continue-lazy-initial`, async () => {
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
  expect(read).toEqual([ 1, 2 ]);
  expect(seenClose).toBe(false); // Array is not done
  expect(v2.isDone()).toBe(false);

  // 2. keep reading, expecting data to continue and complete, matching input array
  const v2Off2 = v2.on(msg => {
    if (msg.value) {
      read.push(msg.value);
    } else if (msg.signal === `done`) {
      seenClose = true;
    }
  });
  await Flow.sleep(200);
  expect(seenClose).toBe(true);
  expect(read).toEqual(a1);
  expect(v2.isDone()).toBe(true);
  v2Off2();
});

/**
 * Reset stepping through array
 * Very lazy, so when unsubscribed, it won't progress
 */
test(`array-when-stopped-reset-lazy-very`, async () => {
  const a1 = [ 1, 2, 3, 4, 5 ];
  let read: number[] = [];
  let seenClose = false;

  expect(() => {
    Rx.From.array(a1, { whenStopped: `reset`, lazy: `initial`, interval: 20 });
  }).toThrow();
  expect(() => {
    Rx.From.array(a1, { whenStopped: `reset`, lazy: `never`, interval: 20 });
  }).toThrow();

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
  expect(read).toEqual([ 1, 2 ]);
  expect(v1.isDone()).toBe(false);

  // 2. Continue reading. Expect final data to reset back to 1, 2... 
  seenClose = false;
  const v1Off2 = v1.on(msg => {
    if (msg.value) read.push(msg.value);
    if (msg.signal === `done`) seenClose = true;
  });
  await Flow.sleep(200);
  expect(read).toEqual([ 1, 2, 1, 2, 3, 4, 5 ]);
  expect(seenClose).toBe(true);
  expect(v1.isDone()).toBe(true);
  v1Off2();
});
