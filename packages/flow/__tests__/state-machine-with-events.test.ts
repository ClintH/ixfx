import { test, expect, assert } from 'vitest';
import { fromListBidirectional, fromList, StateMachineWithEvents } from '../src/state-machine/index.js';

const createAdsr = () => fromList(`attack`, `decay`, `sustain`, `release`);

const createMulti = () => ({
  awake: [ `breakfast`, `coffee` ],
  breakfast: `coffee`,
  coffee: `brushTeeth`,
  brushTeeth: null,
});

// Test that machine throws an error for an unknown state
test(`transitions`, () => {
  const m = createAdsr();

  // Should throw creating a machine with invalid initial state
  expect(() => {
    new StateMachineWithEvents(m, { initial: `blah` });
  }).toThrow();

  const sm = new StateMachineWithEvents(m, { initial: `attack` });

  // Shouldn't be possible to set to undefined
  expect(() => {
    // @ts-ignore
    sm.state = undefined;
  }).toThrow();

  expect(() => {
    // @ts-ignore
    sm.state = null;
  }).toThrow();

  // Invalid state
  expect(() => {
    sm.state = `blah`;
  }).toThrow();

  // State is defined, but invalid from intial state of attack
  expect(() => {
    sm.state = `release`;
  }).toThrow();
});

// Tests that transitions defined as arrays can be navigated
// Also tests .next() function for progressing
test(`paths`, () => {
  const m = createMulti();
  const debug = false;
  let sm = new StateMachineWithEvents(m, { initial: `awake` });

  // Try one path
  expect(() => {
    sm.state = `brushTeeth`;
  }).toThrow();
  sm.state = `coffee`;
  sm.state = `brushTeeth`;
  expect(sm.isDone).toBe(true);

  // Try a different valid path
  sm = new StateMachineWithEvents(m, { initial: `awake` });
  sm.state = `breakfast`;
  sm.state = `coffee`;
  sm.state = `brushTeeth`;
  expect(sm.isDone).toBe(true);

  // Try auto-progression
  sm = new StateMachineWithEvents(m, { initial: `awake`, debug: debug });
  expect(sm.isDone).toBe(false);

  expect(sm.next() === `breakfast`).toBe(true);
  expect(sm.isDone).toBe(false);

  expect(sm.next() === `coffee`).toBe(true);
  expect(sm.isDone).toBeFalsy();

  expect(sm.next() === `brushTeeth`).toBe(true);
  expect(sm.isDone).toBe(true);

  expect(sm.next() === null).toBe(true);
  expect(sm.isDone).toBe(true);
});

test('fromList', () => {
  const trans = fromList('one', 'two', 'three');
  const m = new StateMachineWithEvents(trans);
  assert.sameMembers(m.statesDefined as string[], [ 'one', 'two', 'three' ]);

  // Now in 'one'
  expect(m.state === `one`).toBe(true);
  expect(m.isValid('two')).toBe(true);
  expect(m.isValid('three')).toBe(false);
  expect(m.isDone).toBe(false);

  expect(m.isDone).toBe(false);
  assert.sameMembers(m.statesPossible as string[], [ 'two' ]);

  // Now in 'two'
  expect(m.next() === `two`).toBe(true);
  expect(m.isValid('three')).toBe(true);
  expect(m.isValid('two')).toBe(false);
  expect(m.isValid('one')).toBe(false);
  expect(() => (m.state = `one`)).toThrow();
  expect(m.isDone).toBe(false);

  // Now in 'three'
  expect(m.next() === `three`).toBe(true);
  expect(m.isDone).toBe(true);
  expect(m.isValid('three')).toBe(false);
  expect(m.isValid('three')).toBe(false);
  expect(m.isValid('one')).toBe(false);
  expect(() => (m.state = `one`)).toThrow();
  expect(() => (m.state = `two`)).toThrow();

  expect(m.next() === null).toBe(true);
});

test('fromListBidirectional', () => {
  const trans = fromListBidirectional('one', 'two', 'three');
  const m = new StateMachineWithEvents(trans);
  assert.sameMembers(m.statesDefined as string[], [ 'one', 'two', 'three' ]);

  // State: 'one'
  expect(m.state === `one`).toBe(true);
  expect(m.isValid(`one`)).toBe(false);
  expect(m.isValid(`two`)).toBe(true);
  expect(m.isValid(`three`)).toBe(false);

  expect(m.isDone).toBe(false);
  assert.sameMembers(m.statesPossible as string[], [ 'two' ]);

  // State: 'two'
  expect(m.next() === `two`).toBe(true);
  expect(m.isValid(`one`)).toBe(true);
  expect(m.isValid(`two`)).toBe(false);
  expect(m.isValid(`three`)).toBe(true);
  assert.sameMembers(m.statesPossible as string[], [ 'one', 'three' ]);

  // State: 'one'
  m.state = `one`;
  expect(m.isDone).toBe(false);
  expect(m.state === `one`).toBe(true);
  expect(() => (m.state = `three`)).toThrow();

  // State: 'two'
  m.state = `two`;
  expect(m.state === `two`).toBe(true);
  expect(m.isDone).toBe(false);

  // State: 'three'
  m.state = `three`;
  expect(m.state === `three`).toBe(true);
  expect(m.isDone).toBe(false);
  expect(m.isValid(`one`)).toBe(false);
  expect(m.isValid(`two`)).toBe(true);
  expect(m.isValid(`three`)).toBe(false);
  assert.sameMembers(m.statesPossible as string[], [ 'two' ]);

  // State: 'two'
  m.state = `two`;
  expect(m.state === `two`).toBe(true);
  expect(m.isDone).toBe(false);

  // State: 'three'
  m.state = `three`;

  // Not done because it can always go back
  expect(m.isDone).toBe(false);
});

test('validation', () => {
  // @ts-ignore
  expect(() => fromList([ 'one', 'two' ])).toThrow();
  expect(() => fromList()).toThrow();

  // @ts-ignore
  expect(() => fromListBidirectional([ 'one', 'two' ])).toThrow();
  expect(() => fromList()).toThrow();
});

// // Tests that machine finalises after all states transition
test(`finalisation`, () => {
  const m = createAdsr();
  const sm = new StateMachineWithEvents(m, { initial: `attack` });
  sm.state = `decay`;
  sm.state = `sustain`;
  sm.state = `release`; // Finalises
  expect(sm.isDone).toBe(true);
  assert.sameMembers(sm.statesDefined as string[], [
    'attack',
    'decay',
    'sustain',
    'release',
  ]);

  // Test that we can't transition out of final state
  const states = Object.keys(m);
  for (const state of states) {
    if (state === `release`) continue;
    expect(() => {
      sm.state = state; // Should throw
    }).toThrow();
  }
});

// Test that all event ransitions happen, and there are no unexpected transitions
test('event - stop', async () => {
  const trans = createAdsr();
  const sm = new StateMachineWithEvents(trans, { initial: `attack` });

  await eventPromise({
    eventObj: sm,
    event: `stop`,
    fires: 1,
    timeoutMs: 1000,
    runAfterAdd: () => {
      sm.next(); // decay
      sm.next(); // sustain
      sm.next(); // release
      // ought to trigger stop
    },
  });
});

test(`event - change`, async () => {
  const trans = createAdsr();
  const sm = new StateMachineWithEvents(trans, { initial: `attack` });

  await eventPromise({
    eventObj: sm,
    event: `change`,
    timeoutMs: 1000,
    fires: 3,
    runAfterAdd: () => {
      sm.next(); // decay
      sm.next(); // sustain
      sm.next(); // release
    },
    validateEvent: (ev) => {
      if (ev.priorState === `attack` && ev.newState === `decay`) {
        return true;
      } else if (ev.priorState === `decay` && ev.newState === `sustain`) {
        return true;
      } else if (ev.priorState == `sustain` && ev.newState === `release`) {
        return true;
      }
      return false;
    },
  });
});

export type EventPromiseOpts = {
  event: string;
  eventObj: any;
  fires?: number;
  runAfterAdd?: () => void;
  validateEvent?: (data: any) => boolean;
  timeoutMs: number;
};

export const eventPromise = (opts: EventPromiseOpts) => {
  let fires = opts.fires ?? 1;
  let done = false;
  return new Promise((resolve, reject) => {
    // Event handler
    const handler = (data: any) => {
      fires--;
      if (fires < 0) {
        done = true;
        return reject(`Fired too many times: ${ opts.fires }`);
      }
      if (opts.validateEvent) {
        if (!opts.validateEvent(data)) {
          opts.eventObj.removeEventListener(handler);
          done = true;
          return reject(`Validation failed`);
        }
      }

      if (fires === 0) {
        done = true;
        opts.eventObj.removeEventListener(handler);
        resolve(data);
      }
    };

    // Add event handler
    opts.eventObj.addEventListener(opts.event, handler);
    if (opts.runAfterAdd) opts.runAfterAdd();

    setTimeout(() => {
      if (!done) {
        done = true;
        reject(`Timeout ${ opts.timeoutMs }`);
      }
    }, opts.timeoutMs);
  });
};