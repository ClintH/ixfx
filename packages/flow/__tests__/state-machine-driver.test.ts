import { test, expect } from 'vitest';
import * as StateMachine from '../src/state-machine/index.js';
function createBasic() {
  // Simple state machine
  const states: StateMachine.Transitions = {
    init: 'one',
    one: 'two',
    two: 'three',
    three: 'four',
    four: [ 'three', 'five' ],
    five: null,
  } as const;

  const handlers: StateMachine.DriverStatesHandler<typeof states>[] = [
    {
      if: [ 'init' ],
      then: { next: true },
    },
    {
      if: 'three',
      then: { next: 'four' },
    },
    {
      if: [ 'four' ],
      then: [
        { score: 0, next: 'three' },
        { score: 10, next: 'five' },
      ],
    },
  ];

  return { states, handlers };
}

test('no-target', async () => {
  const { states } = createBasic();
  const handlers = [
    {
      if: '__fallback',
      then: [ { next: true } ],
    },
    {
      if: 'three',
      then: [ { next: 'gazoo' } ],
    },
  ];

  const driver = await StateMachine.driver(states, { handlers, debug: false });
  expect(driver.getValue()).toBe('init');
  await driver.run();
  expect(driver.getValue()).toBe('one');
  await driver.run();
  expect(driver.getValue()).toBe('two');
  await driver.run();
  expect(driver.getValue()).toBe('three');

  // Throws because handler for state 'three' tries to go to an undefined state
  await expect(driver.run()).rejects.toThrowError();
  //await t.throwsAsync(driver.run());

  const handlers2 = [
    {
      if: '__fallback',
      then: { next: true },
    },
    {
      if: 'three',
      then: [ { next: 'gazoo' } ],
    },
    {
      if: 'blah',
      then: { next: 'who-cares' },
    },
  ];
  // Will throw because 'blah' is not part of state machine definition
  await expect(() => StateMachine.driver(states, handlers2)).rejects.toThrowError();
  //await t.throwsAsync(() => StateMachine.driver(states, handlers2));
});

test('no-fallback', async () => {
  const { states, handlers } = createBasic();
  const driver = await StateMachine.driver(states, { handlers, debug: false });

  expect(driver.getValue()).toBe(`init`);
  await driver.run(); // init -> .next
  expect(driver.getValue()).toBe('one');

  // In state 'one', which has no handler, nor is there a fallback
  // thus, will stay in same state.
  await driver.run();
  expect(driver.getValue()).toBe('one');

  // Manually move it
  driver.to('two');
  driver.to('three');

  // Should now resume since there is a handler for state 'three'
  expect(driver.getValue()).toBe('three');
  await driver.run();
  expect(driver.getValue()).toBe('four');
});

test('basic', async () => {
  const { states, handlers } = createBasic();

  //eslint-disable-next-line functional/immutable-data
  handlers.push({
    if: [ '__fallback' ],
    then: [
      () => {
        // no-up
        return undefined;
      },
      () => {
        return { next: true };
      },
    ],
  });
  const driver = await StateMachine.driver(states, { handlers, debug: false });
  expect(driver.getValue()).toBe(`init`);
  await driver.run(); // init -> .next
  expect(driver.getValue()).toBe('one');

  // In state 'one',  but now we have __fallback defined
  await driver.run();
  expect(driver.getValue()).toBe('two');
  await driver.run();
  expect(driver.getValue()).toBe('three');
  await driver.run();
  expect(driver.getValue()).toBe('four');
  await driver.run();
  expect(driver.getValue()).toBe('five');

  // In final state, can't drive it further
  await expect(driver.run()).rejects.toThrowError();// t.throwsAsync(driver.run());
  expect(driver.getValue()).toBe('five');
});
