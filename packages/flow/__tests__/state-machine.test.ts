import { test, expect, assert } from 'vitest';
import * as StateMachine from '../src/state-machine/index.js';

test('normaliseTargets', () => {
  let a = StateMachine.normaliseTargets('hello');
  assert.deepEqual(a, [ { state: 'hello' } ]);

  a = StateMachine.normaliseTargets([ { state: 'a' }, { state: 'b' } ]);
  assert.deepEqual(a, [ { state: 'a' }, { state: 'b' } ]);

  a = StateMachine.normaliseTargets([ 'a', 'b' ]);
  assert.deepEqual(a, [ { state: 'a' }, { state: 'b' } ]);

  a = StateMachine.normaliseTargets(null);
  assert.deepEqual(a, [ { state: null } ]);

  // @ts-ignore
  a = StateMachine.normaliseTargets([ null ]);
  assert.deepEqual(a, [ { state: null } ]);

  // @ts-ignore
  expect(() => StateMachine.normaliseTargets(undefined)).toThrow();

  // @ts-ignore
  expect(() => StateMachine.normaliseTargets(10)).toThrow();

  // @ts-ignore
  expect(() => StateMachine.normaliseTargets([ false, true ])).toThrow();

  // @ts-ignore
  expect(() => StateMachine.normaliseTargets([ 'someState', null ])).toThrow();
  // @ts-ignore
  expect(() => StateMachine.normaliseTargets({ someObj: 'hi' })).toThrow();
  expect(() =>
    // @ts-ignore
    StateMachine.normaliseTargets([ { state: 'ok' }, { someObj: 'hi' } ])).toThrow();

  //t.like(StateMachine.normaliseTargets(['hello','there'], {}))
});

test('routine', () => {
  const sm = {
    wakeup: [ 'coffee', 'phone' ],
    coffee: [ 'breakfast', 'teeth' ],
    breakfast: [ 'coffee', 'teeth' ],
    phone: [ 'teeth' ],
    teeth: 'bike',
    bike: null,
  };

  // Try with default state - which should be wakeup
  const l = StateMachine.init(sm);
  expect(l.value === 'wakeup').toBe(true);
  assert.deepEqual(l.visited, []);

  assert.deepEqual(StateMachine.possible(l), [ 'coffee', 'phone' ]);
  expect(StateMachine.isValidTransition(l, 'phone')).toBe(true);
  expect(StateMachine.isValidTransition(l, 'coffee')).toBe(true);
  expect(StateMachine.isDone(l)).toBe(false);

  expect(StateMachine.isValidTransition(l, 'breakfast')).toBe(false);
  expect(() => StateMachine.to(l, 'breakfast')).toThrow();
  expect(StateMachine.isValidTransition(l, 'teeth')).toBe(false);
  expect(() => StateMachine.to(l, 'teeth')).toThrow();
  expect(StateMachine.isValidTransition(l, 'wakeup')).toBe(false);
  expect(() => StateMachine.to(l, 'wakeup')).toThrow();
  expect(StateMachine.isValidTransition(l, 'bike')).toBe(false);
  expect(() => StateMachine.to(l, 'bike')).toThrow();
  // @ts-ignore
  expect(StateMachine.isValidTransition(l, 'blah')).toBe(false);
  // @ts-ignore
  expect(() => StateMachine.to(l, 'blah')).toThrow();

  const ll1 = StateMachine.to(l, 'phone');
  const ll2 = StateMachine.to(ll1, 'teeth');
  const ll3 = StateMachine.to(ll2, 'bike');
  assert.deepEqual(ll3.visited, [ 'wakeup', 'phone', 'teeth' ]);

  // Try with initial state further along
  const l1 = StateMachine.init(sm, 'coffee');
  assert.deepEqual(l1.visited, []);

  expect(l1.value === 'coffee').toBe(true);
  expect(StateMachine.isValidTransition(l1, 'breakfast')).toBe(true);
  assert.deepEqual(StateMachine.possible(l1), [ 'breakfast', 'teeth' ]);

  expect(StateMachine.isValidTransition(l1, 'teeth')).toBe(true);
  expect(StateMachine.isDone(l1)).toBe(false);

  expect(StateMachine.isValidTransition(l1, 'wakeup')).toBe(false);
  expect(() => StateMachine.to(l1, 'wakeup')).toThrow();

  expect(StateMachine.isValidTransition(l1, 'phone')).toBe(false);
  expect(() => StateMachine.to(l1, 'phone')).toThrow();

  expect(StateMachine.isValidTransition(l1, 'bike')).toBe(false);
  expect(() => StateMachine.to(l1, 'bike')).toThrow();

  // l2: breakfast
  const l2 = StateMachine.to(l1, 'breakfast');
  expect(l2.value === 'breakfast').toBe(true);
  expect(l1.value === 'coffee').toBe(true);
  assert.deepEqual(StateMachine.possible(l2), [ 'coffee', 'teeth' ]);

  expect(StateMachine.isDone(l2)).toBe(false);
  expect(StateMachine.isDone(l1)).toBe(false);

  expect(StateMachine.isValidTransition(l2, 'coffee')).toBe(true);
  expect(StateMachine.isValidTransition(l2, 'coffee')).toBe(true);

  // l3: teeth
  const l3 = StateMachine.to(l2, 'teeth');
  expect(l3.value === 'teeth').toBe(true);
  expect(StateMachine.isDone(l3)).toBe(false);
  assert.deepEqual(StateMachine.possible(l3), [ 'bike' ]);

  // l4: bike
  const l4 = StateMachine.to(l3, 'bike');
  expect(l4.value === 'bike').toBe(true);
  assert.deepEqual(StateMachine.possible(l4), []);
  assert.deepEqual(l4.visited, [ 'coffee', 'breakfast', 'teeth' ]);
  expect(StateMachine.isDone(l1)).toBe(false);
  expect(StateMachine.isDone(l2)).toBe(false);
  expect(StateMachine.isDone(l3)).toBe(false);
  expect(StateMachine.isDone(l4)).toBe(true);

  expect(() => StateMachine.to(l4, 'teeth')).toThrow();
  expect(() => StateMachine.to(l4, 'wakeup')).toThrow();
});

test('validation', () => {
  expect(() => {
    // @ts-ignore
    StateMachine.init(undefined);
  }).toThrow();

  expect(() => {
    // @ts-ignore
    StateMachine.init('hello');
  }).toThrow();

  expect(() => {
    // @ts-ignore
    StateMachine.init(null);
  }).toThrow();

  // Fails because 'there' does not exist as top-level
  expect(() => {
    StateMachine.init({
      hello: 'there',
    });
  }).toThrow();
  expect(() => {
    StateMachine.init({
      states: {
        hello: 'there',
      },
    });
  }).toThrow();

  // Fails because 'hello' is defined twice
  expect(() => {
    StateMachine.init({
      hello: 'there',
      // @ts-ignore
      hello: 'you',
    });
  }).toThrow();
  expect(() => {
    StateMachine.init({
      states: {
        hello: 'there',
        // @ts-ignore
        hello: 'you',
      },
    });
  }).toThrow();

  // Target state repeated
  expect(() => {
    const d: StateMachine.Transitions = {
      a: [ 'b', 'b' ],
      b: 'a',
    };
    StateMachine.init(d);
  }).toThrow();

  // Target states contains undefined state
  expect(() => {
    const d: StateMachine.Transitions = {
      a: [ 'b', 'c' ],
      b: 'a',
    };
    StateMachine.init(d);
  }).toThrow();

  // Target states contains invalid data
  expect(() => {
    const d: StateMachine.Transitions = {
      // @ts-ignore
      a: [ false, 'b' ],
      b: null,
    };
    StateMachine.init(d);
  }).toThrow();
  expect(() => {
    const d: StateMachine.Transitions = {
      // @ts-ignore
      a: [ 'b', { someObject: 'true' } ],
      b: null,
    };
    StateMachine.init(d);
  }).toThrow();
});

test('next', () => {
  const smOnOff = {
    on: 'off',
    off: 'on',
  };

  const a = StateMachine.init(smOnOff, 'on');
  const b = StateMachine.next(a);
  const c = StateMachine.next(b);
  expect(b.value).toBe('off');
  expect(c.value).toBe('on');

  const smSeq = {
    a: 'b',
    b: 'c',
    c: null,
  };
  const aa = StateMachine.init(smSeq, 'a');
  const bb = StateMachine.next(aa);
  const cc = StateMachine.next(bb);
  expect(aa.value).toBe('a');
  expect(bb.value).toBe('b');
  expect(cc.value).toBe('c');

  // Can't go past c
  expect(() => StateMachine.next(cc)).toThrow();
});

test('default', () => {
  const sm = {
    on: 'off',
    off: 'on',
  };

  // No initial state
  const l = StateMachine.init(sm);

  // Check that machine has been normalised
  assert.deepEqual(l.machine, {
    off: [ { state: 'on' } ],
    on: [ { state: 'off' } ],
  });

  expect(l.value === `on`).toBe(true);
  assert.deepEqual(l.visited, []);

  assert.deepEqual(StateMachine.possible(l), [ 'off' ]);

  // l2: Off
  const l2 = StateMachine.to(l, 'off');
  assert.deepEqual(StateMachine.possible(l2), [ 'on' ]);
  expect(l2.value === 'off').toBe(true);
  // Check that machine definition has not changed
  assert.deepEqual(l.machine, {
    off: [ { state: 'on' } ],
    on: [ { state: 'off' } ],
  });
  assert.deepEqual(l2.visited, [ 'on' ]);

  expect(() => {
    // @ts-ignore
    const l3 = StateMachine.to(l2, 'asdf');
  }).toThrow();

  expect(() => {
    // @ts-ignore
    const l3 = StateMachine.to(l2, 'off');
  }).toThrow();

  expect(StateMachine.isDone(l)).toBe(false);
  expect(StateMachine.isDone(l2)).toBe(false);

  const l3 = StateMachine.to(l2, 'on');
  assert.deepEqual(l3.visited, [ 'on', 'off' ]);
});
