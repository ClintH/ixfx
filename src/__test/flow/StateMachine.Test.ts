/* eslint-disable */
import test from 'ava';
import * as StateMachine from '../../flow/StateMachine.js';
import { isEmptyArray } from '../Include.js';

test('normaliseTargets', (t) => {
  let a = StateMachine.normaliseTargets('hello');
  t.like(a, [ { state: 'hello' } ]);

  a = StateMachine.normaliseTargets([ { state: 'a' }, { state: 'b' } ]);
  t.like(a, [ { state: 'a' }, { state: 'b' } ]);

  a = StateMachine.normaliseTargets([ 'a', 'b' ]);
  t.like(a, [ { state: 'a' }, { state: 'b' } ]);

  a = StateMachine.normaliseTargets(null);
  t.like(a, [ { state: null } ]);

  // @ts-ignore
  a = StateMachine.normaliseTargets([ null ]);
  t.like(a, [ { state: null } ]);

  // @ts-ignore
  t.throws(() => StateMachine.normaliseTargets(undefined));

  // @ts-ignore
  t.throws(() => StateMachine.normaliseTargets(10));

  // @ts-ignore
  t.throws(() => StateMachine.normaliseTargets([ false, true ]));

  // @ts-ignore
  t.throws(() => StateMachine.normaliseTargets([ 'someState', null ]));
  // @ts-ignore
  t.throws(() => StateMachine.normaliseTargets({ someObj: 'hi' }));
  t.throws(() =>
    // @ts-ignore
    StateMachine.normaliseTargets([ { state: 'ok' }, { someObj: 'hi' } ])
  );

  //t.like(StateMachine.normaliseTargets(['hello','there'], {}))
});

test('routine', (t) => {
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
  t.true(l.value === 'wakeup');
  t.true(isEmptyArray(l.visited));

  t.like(StateMachine.possible(l), [ 'coffee', 'phone' ]);
  t.true(StateMachine.isValidTransition(l, 'phone'));
  t.true(StateMachine.isValidTransition(l, 'coffee'));
  t.false(StateMachine.isDone(l));

  t.false(StateMachine.isValidTransition(l, 'breakfast'));
  t.throws(() => StateMachine.to(l, 'breakfast'));
  t.false(StateMachine.isValidTransition(l, 'teeth'));
  t.throws(() => StateMachine.to(l, 'teeth'));
  t.false(StateMachine.isValidTransition(l, 'wakeup'));
  t.throws(() => StateMachine.to(l, 'wakeup'));
  t.false(StateMachine.isValidTransition(l, 'bike'));
  t.throws(() => StateMachine.to(l, 'bike'));
  // @ts-ignore
  t.false(StateMachine.isValidTransition(l, 'blah'));
  // @ts-ignore
  t.throws(() => StateMachine.to(l, 'blah'));

  const ll1 = StateMachine.to(l, 'phone');
  const ll2 = StateMachine.to(ll1, 'teeth');
  const ll3 = StateMachine.to(ll2, 'bike');
  t.like(ll3.visited, [ 'wakeup', 'phone', 'teeth' ]);

  // Try with initial state further along
  const l1 = StateMachine.init(sm, 'coffee');
  t.true(isEmptyArray(l1.visited));

  t.true(l1.value === 'coffee');
  t.true(StateMachine.isValidTransition(l1, 'breakfast'));
  t.like(StateMachine.possible(l1), [ 'breakfast', 'teeth' ]);

  t.true(StateMachine.isValidTransition(l1, 'teeth'));
  t.false(StateMachine.isDone(l1));

  t.false(StateMachine.isValidTransition(l1, 'wakeup'));
  t.throws(() => StateMachine.to(l1, 'wakeup'));

  t.false(StateMachine.isValidTransition(l1, 'phone'));
  t.throws(() => StateMachine.to(l1, 'phone'));

  t.false(StateMachine.isValidTransition(l1, 'bike'));
  t.throws(() => StateMachine.to(l1, 'bike'));

  // l2: breakfast
  const l2 = StateMachine.to(l1, 'breakfast');
  t.true(l2.value === 'breakfast');
  t.true(l1.value === 'coffee');
  t.like(StateMachine.possible(l2), [ 'coffee', 'teeth' ]);

  t.false(StateMachine.isDone(l2));
  t.false(StateMachine.isDone(l1));

  t.true(StateMachine.isValidTransition(l2, 'coffee'));
  t.true(StateMachine.isValidTransition(l2, 'coffee'));

  // l3: teeth
  const l3 = StateMachine.to(l2, 'teeth');
  t.true(l3.value === 'teeth');
  t.false(StateMachine.isDone(l3));
  t.like(StateMachine.possible(l3), [ 'bike' ]);

  // l4: bike
  const l4 = StateMachine.to(l3, 'bike');
  t.true(l4.value === 'bike');
  t.true(isEmptyArray(StateMachine.possible(l4)));
  t.like(l4.visited, [ 'coffee', 'breakfast', 'teeth' ]);
  t.false(StateMachine.isDone(l1));
  t.false(StateMachine.isDone(l2));
  t.false(StateMachine.isDone(l3));
  t.true(StateMachine.isDone(l4));

  t.throws(() => StateMachine.to(l4, 'teeth'));
  t.throws(() => StateMachine.to(l4, 'wakeup'));
});

test('validation', (t) => {
  t.throws(() => {
    // @ts-ignore
    StateMachine.init(undefined);
  });

  t.throws(() => {
    // @ts-ignore
    StateMachine.init('hello');
  });

  t.throws(() => {
    // @ts-ignore
    StateMachine.init(null);
  });

  // Fails because 'there' does not exist as top-level
  t.throws(() => {
    StateMachine.init({
      hello: 'there',
    });
  });
  t.throws(() => {
    StateMachine.init({
      states: {
        hello: 'there',
      },
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
  t.throws(() => {
    StateMachine.init({
      states: {
        hello: 'there',
        // @ts-ignore
        hello: 'you',
      },
    });
  });

  // Target state repeated
  t.throws(() => {
    const d: StateMachine.Transitions = {
      a: [ 'b', 'b' ],
      b: 'a',
    };
    StateMachine.init(d);
  });

  // Target states contains undefined state
  t.throws(() => {
    const d: StateMachine.Transitions = {
      a: [ 'b', 'c' ],
      b: 'a',
    };
    StateMachine.init(d);
  });

  // Target states contains invalid data
  t.throws(() => {
    const d: StateMachine.Transitions = {
      // @ts-ignore
      a: [ false, 'b' ],
      b: null,
    };
    StateMachine.init(d);
  });
  t.throws(() => {
    const d: StateMachine.Transitions = {
      // @ts-ignore
      a: [ 'b', { someObject: 'true' } ],
      b: null,
    };
    StateMachine.init(d);
  });
});

test('next', (t) => {
  const smOnOff = {
    on: 'off',
    off: 'on',
  };

  const a = StateMachine.init(smOnOff, 'on');
  const b = StateMachine.next(a);
  const c = StateMachine.next(b);
  t.is(b.value, 'off');
  t.is(c.value, 'on');

  const smSeq = {
    a: 'b',
    b: 'c',
    c: null,
  };
  const aa = StateMachine.init(smSeq, 'a');
  const bb = StateMachine.next(aa);
  const cc = StateMachine.next(bb);
  t.is(aa.value, 'a');
  t.is(bb.value, 'b');
  t.is(cc.value, 'c');

  // Can't go past c
  t.throws(() => StateMachine.next(cc));
});

test('default', (t) => {
  const sm = {
    on: 'off',
    off: 'on',
  };

  // No initial state
  const l = StateMachine.init(sm);

  // Check that machine has been normalised
  t.like(l.machine, {
    off: [ { state: 'on' } ],
    on: [ { state: 'off' } ],
  });

  t.true(l.value === `on`);
  t.true(isEmptyArray(l.visited));

  t.like(StateMachine.possible(l), [ 'off' ]);

  // l2: Off
  const l2 = StateMachine.to(l, 'off');
  t.like(StateMachine.possible(l2), [ 'on' ]);
  t.true(l2.value === 'off');
  // Check that machine definition has not changed
  t.like(l.machine, {
    off: [ { state: 'on' } ],
    on: [ { state: 'off' } ],
  });
  t.like(l2.visited, [ 'on' ]);

  t.throws(() => {
    // @ts-ignore
    const l3 = StateMachine.to(l2, 'asdf');
  });

  t.throws(() => {
    // @ts-ignore
    const l3 = StateMachine.to(l2, 'off');
  });

  t.false(StateMachine.isDone(l));
  t.false(StateMachine.isDone(l2));

  const l3 = StateMachine.to(l2, 'on');
  t.like(l3.visited, [ 'on', 'off' ]);
});
