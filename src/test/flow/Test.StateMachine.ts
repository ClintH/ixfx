/* eslint-disable */
import test from 'ava';
import {
  drive,
  fromList,
  fromListBidirectional,
} from '../../flow/StateMachine.js';

test('fromList', (t) => {
  const m = fromList('one', 'two', 'three');

  // Now in 'one'
  t.true(m.state === `one`);
  t.true(m.isValid('two'));
  t.false(m.isValid('three'));
  t.false(m.isDone);

  t.false(m.isDone);
  t.like(m.states, ['one', 'two', 'three']);

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
  const m = fromListBidirectional('one', 'two', 'three');

  // State: 'one'
  t.true(m.state === `one`);
  t.false(m.isValid(`one`));
  t.true(m.isValid(`two`));
  t.false(m.isValid(`three`));

  t.false(m.isDone);
  t.like(m.states, ['one', 'two', 'three']);

  // State: 'two'
  t.true(m.next() === `two`);
  t.true(m.isValid(`one`));
  t.false(m.isValid(`two`));
  t.true(m.isValid(`three`));

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
