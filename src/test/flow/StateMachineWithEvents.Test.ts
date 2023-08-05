/* eslint-disable */
import test from 'ava';
import {
  bidirectionalFromList,
  fromList,
  WithEvents,
} from '../../flow/StateMachine.js';
import { arrayValuesEqual, eventPromise } from '../util.js';
import { compareValuesEqual } from '../../collections/Arrays.js';

const createAdsr = () => fromList(`attack`, `decay`, `sustain`, `release`);

const createMulti = () => ({
  awake: [`breakfast`, `coffee`],
  breakfast: `coffee`,
  coffee: `brushTeeth`,
  brushTeeth: null,
});

// Test that machine throws an error for an unknown state
test(`transitions`, (t) => {
  const m = createAdsr();

  // Should throw creating a machine with invalid initial state
  t.throws(() => {
    new WithEvents(m, { initial: `blah` });
  });

  const sm = new WithEvents(m, { initial: `attack` });

  // Shouldn't be possible to set to undefined
  t.throws(() => {
    // @ts-ignore
    sm.state = undefined;
  });

  t.throws(() => {
    // @ts-ignore
    sm.state = null;
  });

  // Invalid state
  t.throws(() => {
    sm.state = `blah`;
  });

  // State is defined, but invalid from intial state of attack
  t.throws(() => {
    sm.state = `release`;
  });
});

// Tests that transitions defined as arrays can be navigated
// Also tests .next() function for progressing
test(`paths`, (t) => {
  const m = createMulti();
  const debug = false;
  let sm = new WithEvents(m, { initial: `awake` });

  // Try one path
  t.throws(() => {
    sm.state = `brushTeeth`;
  });
  sm.state = `coffee`;
  sm.state = `brushTeeth`;
  t.true(sm.isDone);

  // Try a different valid path
  sm = new WithEvents(m, { initial: `awake` });
  sm.state = `breakfast`;
  sm.state = `coffee`;
  sm.state = `brushTeeth`;
  t.true(sm.isDone);

  // Try auto-progression
  sm = new WithEvents(m, { initial: `awake`, debug: debug });
  t.false(sm.isDone);

  t.true(sm.next() === `breakfast`);
  t.false(sm.isDone);

  t.true(sm.next() === `coffee`);
  t.falsy(sm.isDone);

  t.true(sm.next() === `brushTeeth`);
  t.true(sm.isDone);

  t.true(sm.next() === null);
  t.true(sm.isDone);
});

test('fromList', (t) => {
  const trans = fromList('one', 'two', 'three');
  const m = new WithEvents(trans);
  arrayValuesEqual(t, m.statesDefined, ['one', 'two', 'three']);

  // Now in 'one'
  t.true(m.state === `one`);
  t.true(m.isValid('two'));
  t.false(m.isValid('three'));
  t.false(m.isDone);

  t.false(m.isDone);
  arrayValuesEqual(t, m.statesPossible, ['two']);

  // Now in 'two'
  t.true(m.next() === `two`);
  t.true(m.isValid('three'));
  t.false(m.isValid('two'));
  t.false(m.isValid('one'));
  t.throws(() => (m.state = `one`));
  t.false(m.isDone);

  // Now in 'three'
  t.true(m.next() === `three`);
  t.true(m.isDone);
  t.false(m.isValid('three'));
  t.false(m.isValid('three'));
  t.false(m.isValid('one'));
  t.throws(() => (m.state = `one`));
  t.throws(() => (m.state = `two`));

  t.true(m.next() === null);
});

test('fromListBidirectional', (t) => {
  const trans = bidirectionalFromList('one', 'two', 'three');
  const m = new WithEvents(trans);
  arrayValuesEqual(t, m.statesDefined, ['one', 'two', 'three']);

  // State: 'one'
  t.true(m.state === `one`);
  t.false(m.isValid(`one`));
  t.true(m.isValid(`two`));
  t.false(m.isValid(`three`));

  t.false(m.isDone);
  arrayValuesEqual(t, m.statesPossible, ['two']);

  // State: 'two'
  t.true(m.next() === `two`);
  t.true(m.isValid(`one`));
  t.false(m.isValid(`two`));
  t.true(m.isValid(`three`));
  arrayValuesEqual(t, m.statesPossible, ['one', 'three']);

  // State: 'one'
  m.state = `one`;
  t.false(m.isDone);
  t.true(m.state === `one`);
  t.throws(() => (m.state = `three`));

  // State: 'two'
  m.state = `two`;
  t.true(m.state === `two`);
  t.false(m.isDone);

  // State: 'three'
  m.state = `three`;
  t.true(m.state === `three`);
  t.false(m.isDone);
  t.false(m.isValid(`one`));
  t.true(m.isValid(`two`));
  t.false(m.isValid(`three`));
  arrayValuesEqual(t, m.statesPossible, ['two']);

  // State: 'two'
  m.state = `two`;
  t.true(m.state === `two`);
  t.false(m.isDone);

  // State: 'three'
  m.state = `three`;

  // Not done because it can always go back
  t.false(m.isDone);
});

test('validation', (t) => {
  // @ts-ignore
  t.throws(() => fromList(['one', 'two']));
  t.throws(() => fromList());

  // @ts-ignore
  t.throws(() => fromListBidirectional(['one', 'two']));
  t.throws(() => fromList());
});

// // Tests that machine finalises after all states transition
test(`finalisation`, (t) => {
  const m = createAdsr();
  const sm = new WithEvents(m, { initial: `attack` });
  sm.state = `decay`;
  sm.state = `sustain`;
  sm.state = `release`; // Finalises
  t.true(sm.isDone);
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
    t.throws(() => {
      sm.state = state; // Should throw
    });
  }
  t.pass();
});

// Test that all event ransitions happen, and there are no unexpected transitions
test('event - stop', async (t) => {
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
  t.pass();
});

test(`event - change`, async (t) => {
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
  t.pass();
});
