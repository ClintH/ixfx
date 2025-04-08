import expect from 'expect';
/* eslint-disable */
import { fromListBidirectional, fromList, WithEvents } from '../../flow/StateMachine.js';
import { arrayValuesEqual, eventPromise } from '../Include.js';

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
    new WithEvents(m, { initial: `blah` });
  }).toThrow();

  const sm = new WithEvents(m, { initial: `attack` });

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
  let sm = new WithEvents(m, { initial: `awake` });

  // Try one path
  expect(() => {
    sm.state = `brushTeeth`;
  }).toThrow();
  sm.state = `coffee`;
  sm.state = `brushTeeth`;
  expect(sm.isDone).toBe(true);

  // Try a different valid path
  sm = new WithEvents(m, { initial: `awake` });
  sm.state = `breakfast`;
  sm.state = `coffee`;
  sm.state = `brushTeeth`;
  expect(sm.isDone).toBe(true);

  // Try auto-progression
  sm = new WithEvents(m, { initial: `awake`, debug: debug });
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
  const m = new WithEvents(trans);
  arrayValuesEqual(t, m.statesDefined, [ 'one', 'two', 'three' ]);

  // Now in 'one'
  expect(m.state === `one`).toBe(true);
  expect(m.isValid('two')).toBe(true);
  expect(m.isValid('three')).toBe(false);
  expect(m.isDone).toBe(false);

  expect(m.isDone).toBe(false);
  arrayValuesEqual(t, m.statesPossible, [ 'two' ]);

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
  const m = new WithEvents(trans);
  arrayValuesEqual(t, m.statesDefined, [ 'one', 'two', 'three' ]);

  // State: 'one'
  expect(m.state === `one`).toBe(true);
  expect(m.isValid(`one`)).toBe(false);
  expect(m.isValid(`two`)).toBe(true);
  expect(m.isValid(`three`)).toBe(false);

  expect(m.isDone).toBe(false);
  arrayValuesEqual(t, m.statesPossible, [ 'two' ]);

  // State: 'two'
  expect(m.next() === `two`).toBe(true);
  expect(m.isValid(`one`)).toBe(true);
  expect(m.isValid(`two`)).toBe(false);
  expect(m.isValid(`three`)).toBe(true);
  arrayValuesEqual(t, m.statesPossible, [ 'one', 'three' ]);

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
  arrayValuesEqual(t, m.statesPossible, [ 'two' ]);

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
  const sm = new WithEvents(m, { initial: `attack` });
  sm.state = `decay`;
  sm.state = `sustain`;
  sm.state = `release`; // Finalises
  expect(sm.isDone).toBe(true);
  arrayValuesEqual(t, sm.statesDefined, [
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
  const sm = new WithEvents(trans, { initial: `attack` });

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
  const sm = new WithEvents(trans, { initial: `attack` });

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
