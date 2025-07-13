import expect from 'expect';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';

test(`from-proxy-array`, async () => {
  const { proxy, rx } = Rx.From.arrayProxy([ `one`, `two`, `three` ]);
  let step = 0;
  rx.onValue(v => {
    //console.log(`value`, v);
    switch (step) {
      case 0: {
        expect(v).toEqual([ `one`, `two`, `three`, `four` ]);
        break;
      }
      case 1: {
        expect(v).toEqual([ `one`, `two`, `three` ]);
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

test(`from-proxy-array-as-object`, async () => {
  const { proxy, rx } = Rx.From.objectProxy([ `one`, `two`, `three` ]);
  let step = 0;
  rx.onValue(v => {
    //console.log(`value`, v);
    switch (step) {
      case 0: {
        expect(v).toEqual([ `one`, `two`, `three`, `four` ]);
        break;
      }
      case 1: {
        expect(v).toEqual([ `one`, `two`, `three` ]);
        break;
      }
    }
  })

  // Not allowed to change shape of array
  expect(() => proxy.push(`four`)).toThrow();
  await Flow.sleep(50);

  // Step 1: [one, two, three]
  step++;
  proxy.pop();
  await Flow.sleep(50);
});

test(`from-proxy-object-1`, async () => {
  const { proxy: person, rx: personRx } = Rx.From.objectProxy({ name: `jill` });
  let valueFired = 0;

  personRx.onValue(v => {
    expect(v).toEqual({ name: "john" });
    valueFired++;
  });
  personRx.on(v => {
    expect(v.value).toEqual({ name: `john` });
    valueFired++;
  });
  personRx.onDiff(diff => {
    expect(diff).toEqual([ { path: `name`, value: `john`, previous: `jill`, state: `change` } ]);
    valueFired++;
  })

  expect(person.name).toBe(`jill`);
  expect(personRx.last().name).toBe(`jill`);
  person.name = `john`;
  expect(person.name).toBe(`john`);
  expect(personRx.last().name).toBe(`john`);
  expect(valueFired).toBe(3);

  // @ts-ignore
  expect(() => proxy.age = 12).toThrow();
});

test(`from-proxy-object-2`, async () => {
  let valueFired = 0;
  const { proxy: person, rx: personRx } = Rx.From.objectProxy({
    name: `jill`,
    address: {
      street: `Test St`, number: 12
    }
  });
  personRx.onValue(_v => {
    valueFired++;
  });

  // Change one thing
  person.address = { street: `West St`, number: 12 };
  await Flow.sleep(50);
  expect(valueFired).toBe(1);
  expect(person).toEqual({
    name: `jill`,
    address: {
      street: `West St`, number: 12
    }
  });

  // Change two things
  valueFired = 0;
  person.name = `jane`;
  person.address = { street: `North St`, number: 13 };
  expect(valueFired).toBe(2);
  expect(person).toEqual({
    name: `jane`,
    address: {
      street: `North St`, number: 13
    }
  });

});

// Update single element within array
test(`from-object-array-as-object-2`, async () => {
  let valueFired = 0;
  const { proxy: array, rx: arrayRx } = Rx.From.objectProxy([ `a`, `b`, `c` ]);
  arrayRx.onValue(v => {
    expect(v).toEqual([ `a`, `d`, `c` ]);
    valueFired++;
  });
  arrayRx.onDiff(diff => {
    expect(diff).toEqual([ { path: `1`, value: `d`, previous: `b`, state: `change` } ]);
    valueFired++;
  });

  array[ 1 ] = `d`;
  expect(array).toEqual([ `a`, `d`, `c` ]);
  await Flow.sleep(50);
  expect(valueFired).toBe(2);
});