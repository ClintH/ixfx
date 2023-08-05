/* eslint-disable */
import test from 'ava';
import * as StateMachine from '../../flow/StateMachine.js';
import { isEmptyArray } from '../util.js';

test('routine', (t) => {
  const sm = {
    wakeup: ['coffee', 'phone'],
    coffee: ['breakfast', 'teeth'],
    breakfast: ['coffee', 'teeth'],
    phone: ['teeth'],
    teeth: 'bike',
    bike: null,
  };

  // Try with default state - which should be wakeup
  const l = StateMachine.init(sm);
  t.true(l.value === 'wakeup');
  t.true(isEmptyArray(l.visited));

  t.like(StateMachine.possible(l), ['coffee', 'phone']);
  t.true(StateMachine.isValid(l, 'phone'));
  t.true(StateMachine.isValid(l, 'coffee'));
  t.false(StateMachine.done(l));

  t.false(StateMachine.isValid(l, 'breakfast'));
  t.throws(() => StateMachine.to(l, 'breakfast'));
  t.false(StateMachine.isValid(l, 'teeth'));
  t.throws(() => StateMachine.to(l, 'teeth'));
  t.false(StateMachine.isValid(l, 'wakeup'));
  t.throws(() => StateMachine.to(l, 'wakeup'));
  t.false(StateMachine.isValid(l, 'bike'));
  t.throws(() => StateMachine.to(l, 'bike'));
  // @ts-ignore
  t.false(StateMachine.isValid(l, 'blah'));
  // @ts-ignore
  t.throws(() => StateMachine.to(l, 'blah'));

  const ll1 = StateMachine.to(l, 'phone');
  const ll2 = StateMachine.to(ll1, 'teeth');
  const ll3 = StateMachine.to(ll2, 'bike');
  t.like(ll3.visited, ['wakeup', 'phone', 'teeth']);

  // Try with initial state further along
  const l1 = StateMachine.init(sm, 'coffee');
  t.true(isEmptyArray(l1.visited));

  t.true(l1.value === 'coffee');
  t.true(StateMachine.isValid(l1, 'breakfast'));
  t.like(StateMachine.possible(l1), ['breakfast', 'teeth']);

  t.true(StateMachine.isValid(l1, 'teeth'));
  t.false(StateMachine.done(l1));

  t.false(StateMachine.isValid(l1, 'wakeup'));
  t.throws(() => StateMachine.to(l1, 'wakeup'));

  t.false(StateMachine.isValid(l1, 'phone'));
  t.throws(() => StateMachine.to(l1, 'phone'));

  t.false(StateMachine.isValid(l1, 'bike'));
  t.throws(() => StateMachine.to(l1, 'bike'));

  // l2: breakfast
  const l2 = StateMachine.to(l1, 'breakfast');
  t.true(l2.value === 'breakfast');
  t.true(l1.value === 'coffee');
  t.like(StateMachine.possible(l2), ['coffee', 'teeth']);

  t.false(StateMachine.done(l2));
  t.false(StateMachine.done(l1));

  t.true(StateMachine.isValid(l2, 'coffee'));
  t.true(StateMachine.isValid(l2, 'coffee'));

  // l3: teeth
  const l3 = StateMachine.to(l2, 'teeth');
  t.true(l3.value === 'teeth');
  t.false(StateMachine.done(l3));
  t.like(StateMachine.possible(l3), ['bike']);

  // l4: bike
  const l4 = StateMachine.to(l3, 'bike');
  t.true(l4.value === 'bike');
  t.true(isEmptyArray(StateMachine.possible(l4)));
  t.like(l4.visited, ['coffee', 'breakfast', 'teeth']);
  t.false(StateMachine.done(l1));
  t.false(StateMachine.done(l2));
  t.false(StateMachine.done(l3));
  t.true(StateMachine.done(l4));

  t.throws(() => StateMachine.to(l4, 'teeth'));
  t.throws(() => StateMachine.to(l4, 'wakeup'));
});

test('validation', (t) => {
  // Fails because 'there' does not exist as top-level
  t.throws(() => {
    StateMachine.init({
      hello: 'there',
    });
  });
  // Fails because 'hello' is defined twice
  t.throws(() => {
    StateMachine.init({
      hello: 'there',
      // @ts-ignore
      hello: 'you',
    });
  });
});

test('default', (t) => {
  const sm = {
    on: 'off',
    off: 'on',
  };

  // No initial state
  const l = StateMachine.init(sm);
  t.true(l.value === `on`);
  t.true(isEmptyArray(l.visited));

  t.like(StateMachine.possible(l), ['off']);
  t.like(l.states, sm);

  // l2: Off
  const l2 = StateMachine.to(l, 'off');
  t.like(StateMachine.possible(l2), ['on']);
  t.true(l2.value === 'off');
  t.like(l2.states, sm);
  t.like(l2.visited, ['on']);

  t.throws(() => {
    // @ts-ignore
    const l3 = StateMachine.to(l2, 'asdf');
  });

  t.throws(() => {
    // @ts-ignore
    const l3 = StateMachine.to(l2, 'off');
  });

  t.false(StateMachine.done(l));
  t.false(StateMachine.done(l2));

  const l3 = StateMachine.to(l2, 'on');
  t.like(l3.visited, ['on', 'off']);
});
