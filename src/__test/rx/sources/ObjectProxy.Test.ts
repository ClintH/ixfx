import test from 'ava';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';

test(`from-proxy-array`, async t => {
  const { proxy, rx } = Rx.From.arrayProxy([ `one`, `two`, `three` ]);
  let step = 0;
  rx.onValue(v => {
    //console.log(`value`, v);
    switch (step) {
      case 0: {
        t.deepEqual(v, [ `one`, `two`, `three`, `four` ]);
        break;
      }
      case 1: {
        t.deepEqual(v, [ `one`, `two`, `three` ]);
        break;
      }
    }
  })

  // Step 0: [one,two,three,four]  
  proxy.push(`four`);
  await Flow.sleep(50);

  // Step 1: [one, two, three]
  step++;
  proxy.pop();
  await Flow.sleep(50);
});

test(`from-proxy-array-as-object`, async t => {
  const { proxy, rx } = Rx.From.objectProxy([ `one`, `two`, `three` ]);
  let step = 0;
  rx.onValue(v => {
    //console.log(`value`, v);
    switch (step) {
      case 0: {
        t.deepEqual(v, [ `one`, `two`, `three`, `four` ]);
        break;
      }
      case 1: {
        t.deepEqual(v, [ `one`, `two`, `three` ]);
        break;
      }
    }
  })

  // Not allowed to change shape of array
  t.throws(() => proxy.push(`four`));
  await Flow.sleep(50);

  // Step 1: [one, two, three]
  step++;
  proxy.pop();
  await Flow.sleep(50);
});

test(`from-proxy-object`, async t => {
  const { proxy: person, rx: personRx } = Rx.From.objectProxy({ name: `jill` });
  let valueFired = 0;

  personRx.onValue(v => {
    t.deepEqual(v, { name: "john" });
    valueFired++;
  });
  personRx.on(v => {
    t.deepEqual(v.value, { name: `john` });
    valueFired++;
  });
  personRx.onDiff(diff => {
    t.deepEqual(diff, [ { path: `name`, value: `john`, previous: `jill`, state: `change` } ]);
    valueFired++;
  })

  t.is(person.name, `jill`);
  t.is(personRx.last().name, `jill`);
  person.name = `john`;
  t.is(person.name, `john`);
  t.is(personRx.last().name, `john`);

  // @ts-ignore
  t.throws(() => proxy.age = 12);
});

test(`from-proxy-object`, async t => {
  let valueFired = 0;
  const { proxy: person, rx: personRx } = Rx.From.objectProxy({
    name: `jill`,
    address: {
      street: `Test St`, number: 12
    }
  });
  personRx.onValue(v => {
    valueFired++;
  });
  person.address = { street: `West St`, number: 12 };

  await Flow.sleep(50);
  t.is(valueFired, 4);
});

// Update single element within array
test(`from-object-array-as-object-2`, async t => {
  let valueFired = 0;
  const { proxy: array, rx: arrayRx } = Rx.From.objectProxy([ `a`, `b`, `c` ]);
  arrayRx.onValue(v => {
    t.deepEqual(v, [ `a`, `d`, `c` ]);
    valueFired++;
  });
  arrayRx.onDiff(diff => {
    t.deepEqual(diff, [ { path: `1`, value: `d`, previous: `b`, state: `change` } ]);
    valueFired++;
  });

  array[ 1 ] = `d`;
  t.deepEqual(array, [ `a`, `d`, `c` ]);
  await Flow.sleep(50);
  t.is(valueFired, 2);
});