import test from 'ava';
import * as StateMachine from '../../flow/StateMachine.js';
import { type StatesHandler, init } from '../../flow/StateMachineDriver.js';
function createBasic() {
  // Simple state machine
  const states: StateMachine.Transitions = {
    init: 'one',
    one: 'two',
    two: 'three',
    three: 'four',
    four: ['three', 'five'],
    five: null,
  } as const;

  const handlers: StatesHandler<typeof states>[] = [
    {
      if: ['init'],
      then: { next: true },
    },
    {
      if: 'three',
      then: { next: 'four' },
    },
    {
      if: ['four'],
      then: [
        { score: 0, next: 'three' },
        { score: 10, next: 'five' },
      ],
    },
  ];

  return { states, handlers };
}

test('no-target', async (t) => {
  const { states } = createBasic();
  const handlers = [
    {
      if: '__fallback',
      then: [{ next: true }],
    },
    {
      if: 'three',
      then: [{ next: 'gazoo' }],
    },
  ];

  const driver = await init(states, { handlers, debug: false });
  t.is(driver.getValue(), 'init');
  await driver.run();
  t.is(driver.getValue(), 'one');
  await driver.run();
  t.is(driver.getValue(), 'two');
  await driver.run();
  t.is(driver.getValue(), 'three');

  // Throws because handler for state 'three' tries to go to an undefined state
  await t.throwsAsync(driver.run());

  const handlers2 = [
    {
      if: '__fallback',
      then: { next: true },
    },
    {
      if: 'three',
      then: [{ next: 'gazoo' }],
    },
    {
      if: 'blah',
      then: { next: 'who-cares' },
    },
  ];
  // Will throw because 'blah' is not part of state machine definition
  await t.throwsAsync(() => init(states, handlers2));
});

test('no-fallback', async (t) => {
  const { states, handlers } = createBasic();
  const driver = await init(states, { handlers, debug: false });

  t.is(driver.getValue(), `init`);
  await driver.run(); // init -> .next
  t.is(driver.getValue(), 'one');

  // In state 'one', which has no handler, nor is there a fallback
  // thus, will stay in same state.
  await driver.run();
  t.is(driver.getValue(), 'one');

  // Manually move it
  driver.to('two');
  driver.to('three');

  // Should now resume since there is a handler for state 'three'
  t.is(driver.getValue(), 'three');
  await driver.run();
  t.is(driver.getValue(), 'four');
});

test('basic', async (t) => {
  const { states, handlers } = createBasic();

  //eslint-disable-next-line functional/immutable-data
  handlers.push({
    if: ['__fallback'],
    then: [
      () => {
        // no-up
      },
      () => {
        return { next: true };
      },
    ],
  });
  const driver = await init(states, { handlers, debug: false });
  t.is(driver.getValue(), `init`);
  await driver.run(); // init -> .next
  t.is(driver.getValue(), 'one');

  // In state 'one',  but now we have __fallback defined
  await driver.run();
  t.is(driver.getValue(), 'two');
  await driver.run();
  t.is(driver.getValue(), 'three');
  await driver.run();
  t.is(driver.getValue(), 'four');
  await driver.run();
  t.is(driver.getValue(), 'five');

  // In final state, can't drive it further
  await t.throwsAsync(driver.run());
  t.is(driver.getValue(), 'five');
});
