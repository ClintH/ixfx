import test from 'ava';
import * as StateMachine from '../../flow/StateMachine.js';
import { type StatesHandler, init } from '../../flow/StateMachineDriver2.js';
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
      states: ['init'],
      expressions: [
        () => {
          return { next: true };
        },
      ],
    },
    {
      states: ['three'],
      expressions: [
        () => {
          return { next: 'four' };
        },
      ],
    },
    {
      states: ['four'],
      expressions: [
        () => {
          return { score: 0, next: 'three' };
        },
        () => {
          return { score: 10, next: 'five' };
        },
      ],
    },
  ];

  return { states, handlers };
}

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
    states: ['__fallback'],
    expressions: [
      () => {
        return { next: true };
      },
    ],
  });
  const driver = await init(states, { handlers, debug: true });
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
});
