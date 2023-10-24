import test from 'ava';
import { compareData, getPathsAndData, map, updateByPath, applyChanges, getField, getPaths } from '../Immutable.js';
import { arrayValuesEqual } from './util.js';
import { isEqualValueDefault } from '../IsEqual.js';


test(`getPathsAndData`, t => {
  const d1 = {
    accel: { x: 1, y: 2, z: 3 },
    gyro: { x: 4, y: 5, z: 6 },
  };
  const r1 = getPathsAndData(d1);
  arrayValuesEqual(t, r1, [
    { path: `accel`, value: d1.accel },
    { path: `accel.x`, value: 1 },
    { path: `accel.y`, value: 2 },
    { path: `accel.z`, value: 3 },
    { path: `gyro`, value: d1.gyro },
    { path: `gyro.x`, value: 4 },
    { path: `gyro.y`, value: 5 },
    { path: `gyro.z`, value: 6 }
  ], isEqualValueDefault);


  const d2 = {
    message: `hello`,
    profiles: [
      { name: `John`, animals: [ `mouse`, `turtle` ] },
      { name: `Jane`, animals: [ `snake`, `rabbit` ] }
    ]
  }
  const r2 = getPathsAndData(d2);
  arrayValuesEqual(t, r2, [
    { path: `message`, value: `hello` },
    { path: `profiles`, value: d2.profiles },
    { path: `profiles[0]`, value: d2.profiles[ 0 ] },
    { path: `profiles[0].name`, value: d2.profiles[ 0 ].name },

    { path: `profiles[0].animals`, value: d2.profiles[ 0 ].animals },
    { path: `profiles[0].animals[0]`, value: d2.profiles[ 0 ].animals[ 0 ] },
    { path: `profiles[0].animals[1]`, value: d2.profiles[ 0 ].animals[ 1 ] },

    { path: `profiles[1]`, value: d2.profiles[ 1 ] },
    { path: `profiles[1].name`, value: d2.profiles[ 1 ].name },
    { path: `profiles[1].animals`, value: d2.profiles[ 1 ].animals },
    { path: `profiles[1].animals[0]`, value: d2.profiles[ 1 ].animals[ 0 ] },
    { path: `profiles[1].animals[1]`, value: d2.profiles[ 1 ].animals[ 1 ] },

  ], isEqualValueDefault);
});

test('getPaths', (t) => {
  const d = {
    accel: { x: 1, y: 2, z: 3 },
    gyro: { x: 4, y: 5, z: 6 },
  };
  const paths = getPaths(d);

  arrayValuesEqual(t, paths, [
    `accel`,
    `accel.x`,
    `accel.y`,
    `accel.z`,
    `gyro`,
    `gyro.x`,
    `gyro.y`,
    `gyro.z`,
  ]);

  const paths2 = getPaths(d, true);
  arrayValuesEqual(t, paths2, [
    `accel.x`,
    `accel.y`,
    `accel.z`,
    `gyro.x`,
    `gyro.y`,
    `gyro.z`,
  ]);

  // @ts-ignore
  t.throws(() => getPaths(undefined));

  t.deepEqual(getPaths(null), []);

  const d2 = {
    message: `hello`,
    profiles: [
      { name: `John`, animals: [ `mouse`, `turtle` ] },
      { name: `Jane`, animals: [ `snake`, `rabbit` ] }
    ]
  }
  const d2R = getPaths(d2);
  arrayValuesEqual(t, d2R, [
    `message`,
    `profiles`,
    `profiles[0]`, `profiles[0].name`, `profiles[0].animals`, `profiles[0].animals[0]`, `profiles[0].animals[1]`,
    `profiles[1]`, `profiles[1].name`, `profiles[1].animals`, `profiles[1].animals[0]`, `profiles[1].animals[1]`,
  ])
});


test('getField', (t) => {
  const d = {
    accel: { x: 1, y: 2, z: 3 },
    gyro: { x: 4, y: 5, z: 6 },
  };
  t.is(getField(d, `accel.x`), 1);
  t.is(getField(d, `gyro.z`), 6);
  t.like(getField(d, `gyro`), { x: 4, y: 5, z: 6 });

  const d2 = {
    message: `hello`,
    profiles: [
      { name: `John`, animals: [ `mouse`, `turtle` ] },
      { name: `Jane`, animals: [ `snake`, `rabbit` ] }
    ]
  }
  t.is(getField(d2, `profiles[1].animals[1]`), `rabbit`);

  t.throws(() => getField(d, ``))
  // @ts-expect-error
  t.throws(() => getField(undefined));
  // @ts-expect-error
  t.throws(() => getField(null));
  // @ts-expect-error
  t.throws(() => getField(false));
  // @ts-expect-error
  t.throws(() => getField(10));

  const d3 = {
    message: `hello`,
    profiles: [
      { name: `John`, animals: [ `mouse`, `turtle` ] },
      { name: `Jane`, animals: [ `snake`, `rabbit` ] }
    ]
  }
  t.deepEqual(getField(d3, `profiles`), d3.profiles);
  t.deepEqual(getField(d3, `profiles[0]`), d3.profiles[ 0 ]);
  t.deepEqual(getField(d3, `profiles[0].animals`), d3.profiles[ 0 ].animals);
  t.deepEqual(getField(d3, `profiles[0].animals[1]`), d3.profiles[ 0 ].animals[ 1 ]);


});

test('map', (t) => {
  const o1a = {
    x: 10,
    y: 20,
  };
  //eslint-disable-next-line functional/no-let
  let count = 0;
  const o1b = map<typeof o1a, string>(o1a, (fieldValue, field, index) => {
    if (count === 0 && index !== 0) t.fail('index not right. Expected 0');
    else if (count === 1 && index !== 1) t.fail('index not right. Expected 1');
    if (count === 0 && field !== 'x') t.fail('Expected field x');
    if (count === 1 && field !== 'y') t.fail('Expected field y');

    count++;
    return fieldValue.toString();
  });

  t.like(o1b, { x: '10', y: '20' });
  t.not(o1b, o1a);

  const o2a = { width: 100, height: 250, colour: 'red' };
  const o2b = map(o2a, (fieldValue, fieldName) => {
    if (fieldName === 'width') return fieldValue * 3;
    else if (typeof fieldValue === 'number') return fieldValue * 2;
    return fieldValue;
  });
  t.like(o2b, { width: 300, height: 500, colour: 'red' });
  // Test immutability
  t.like(o2a, { width: 100, height: 250, colour: 'red' });
});


test(`applyChanges`, t => {
  const test = {
    msg: `hello`,
    position: { x: 10, y: 20 },
    value: false
  }
  const d1 = compareData(test, {
    ...test,
    msg: `hello!`,
  });
  const d1R = applyChanges(test, d1);
  t.deepEqual(d1R, {
    ...test,
    msg: `hello!`
  });

  const d2 = compareData(test, {
    ...test,
    position: { x: 11, y: 22 }
  });
  const d2R = applyChanges(test, d2);
  t.deepEqual(d2R, {
    ...test,
    position: { x: 11, y: 22 }
  });

  const d3 = applyChanges(test, [ { path: `position.y`, value: 22, previous: 20 } ]);
  t.deepEqual(d3, {
    ...test,
    position: { x: 10, y: 22 }
  });
});

test(`compareData`, t => {
  const test = {
    msg: `hello`,
    position: { x: 10, y: 20 },
    value: false
  }

  const c1 = compareData(test, {
    msg: `hello`,
    position: { x: 10, y: 20 },
    value: false
  });
  t.is(c1.length, 0);

  const c2 = compareData(test, {
    msg: `hello!`,
    position: { x: 10, y: 20 },
    value: false
  });
  t.is(c2.length, 1);
  t.deepEqual(c2, [ { path: `msg`, previous: `hello`, value: `hello!` } ]);

  const c3 = compareData(test, {
    msg: `hello`,
    position: { x: 1, y: 20 },
    value: false
  });
  t.is(c3.length, 1);
  t.deepEqual(c3, [ { path: `position.x`, previous: 10, value: 1 } ]);

  const c4 = compareData(test, {
    msg: `hello`,
    position: { x: 1, y: 20 },
    value: true
  });
  t.is(c4.length, 2);
  t.deepEqual(c4, [
    { path: `position.x`, previous: 10, value: 1 },
    { path: `value`, previous: false, value: true }
  ]);

  const c5 = compareData(test, {
    msg: `hello`,
    position: { x: 1, y: 3 },
    value: true
  });
  t.is(c5.length, 3);
  t.deepEqual(c5, [
    { path: `position.x`, previous: 10, value: 1 },
    { path: `position.y`, previous: 20, value: 3 },
    { path: `value`, previous: false, value: true }
  ]);

  const test2 = {
    colours: [ `red`, `green`, `blue` ],
    sizes: [ 10, 20, 30 ]
  };

  const cc1 = compareData(test2, {
    colours: [ `red`, `green`, `blue` ],
    sizes: [ 10, 20, 30 ]
  });
  t.is(cc1.length, 0);

  // Remove from array end
  const cc2 = compareData(test2, {
    colours: [ `red`, `green` ],
    sizes: [ 10, 20, 30 ]
  });
  t.is(cc2.length, 1);
  t.deepEqual(cc2, [ { path: `colours[2]`, previous: `blue`, value: undefined } ]);

  // Remove from array start
  const cc3 = compareData(test2, {
    colours: [ `green`, `blue` ],
    sizes: [ 10, 20, 30 ]
  });
  t.is(cc3.length, 3);
  t.deepEqual(cc3, [
    { path: `colours[0]`, previous: `red`, value: `green` },
    { path: `colours[1]`, previous: `green`, value: `blue` },
    { path: `colours[2]`, previous: `blue`, value: undefined }
  ]);

  // Array re-arrange
  const cc4 = compareData(test2, {
    colours: [ `blue`, `red`, `green` ],
    sizes: [ 10, 20, 30 ]
  });
  t.is(cc4.length, 3);
  t.deepEqual(cc4, [
    { path: `colours[0]`, previous: `red`, value: `blue` },
    { path: `colours[1]`, previous: `green`, value: `red` },
    { path: `colours[2]`, previous: `blue`, value: `green` }
  ]);
});

test(`updateByPath`, t => {
  const a = {
    position: { x: 10, y: 20 },
    message: `hello`
  };
  const r1 = updateByPath(a, `message`, `there`);
  t.is(a.message, `hello`);
  t.is(r1.message, `there`);

  const r2 = updateByPath(a, `position.x`, 20);
  t.is(a.position.x, 10);
  t.is(r2.position.x, 20);

  // If missing keys are used: root
  t.throws(() => {
    updateByPath(a, `notfound`, 100)
  });
  // missing sub-key
  t.throws(() => {
    updateByPath(a, `position.notfound`, 100)
  });

  // Arrays
  const aa = {
    colours: [ `red`, `green`, `blue` ],
    flag: true
  };
  const rr1 = updateByPath(aa, `colours[1]`, `pink`);

  t.deepEqual(rr1, { flag: true, colours: [ `red`, `pink`, `blue` ] });

  const rr2 = updateByPath(aa, `colours`, [ `orange`, `black` ]);
  t.deepEqual(rr2, { flag: true, colours: [ `orange`, `black` ] })

  // Deeper nesting
  const aaa = {
    profile: {
      jane: {
        colours: [ `red`, `green`, `blue` ]
      },
      selected: -1
    },
    widgets: [
      { colour: `red`, size: 10 },
      { colour: `green`, size: 20 }
    ]
  }
  const rrr1 = updateByPath(aaa, `profile.jane.colours[0]`, `yellow`);
  t.is(rrr1.profile.jane.colours[ 0 ], `yellow`);
  const rrr2 = updateByPath(aaa, `widgets[1].size`, 30);
  t.is(rrr2.widgets[ 1 ].size, 30);

  // Array values which are objects
  const b = {
    values: [
      { colour: `red`, size: 10 },
      { colour: `green`, size: 20 }
    ]
  }
  const b1 = updateByPath(b, `values[1].size`, 22);
  t.deepEqual(b1,
    {
      values: [
        { colour: `red`, size: 10 },
        { colour: `green`, size: 22 }
      ]
    });

  const b2 = updateByPath(b, `values[1]`, { colour: `pink`, size: 5 });
  t.deepEqual(b2, {
    values: [
      { colour: `red`, size: 10 },
      { colour: `pink`, size: 5 }
    ]
  });

  const b3 = updateByPath(b, `values`, `hello`);
  t.deepEqual(b3, {
    values: `hello`
  });


});