import { test, expect, assert, type TestContext } from 'vitest';
import { compareData, getPathsAndData, updateByPath, applyChanges, getField, getPaths } from '../../src/records/pathed.js';
import { resultToValue, type Result } from '@ixfx/guards';


test(`get-paths-and-data`, () => {
  const d1 = {
    accel: { x: 1, y: 2, z: 3 },
    gyro: { x: 4, y: 5, z: 6 },
  };
  const r1 = [ ...getPathsAndData(d1) ];
  assert.sameDeepMembers(r1, [
    { path: `accel`, value: d1.accel },
    { path: `accel.x`, value: 1 },
    { path: `accel.y`, value: 2 },
    { path: `accel.z`, value: 3 },
    { path: `gyro`, value: d1.gyro },
    { path: `gyro.x`, value: 4 },
    { path: `gyro.y`, value: 5 },
    { path: `gyro.z`, value: 6 }
  ]);

  const d2 = {
    message: `hello`,
    profiles: [
      { name: `John`, animals: [ `mouse`, `turtle` ] },
      { name: `Jane`, animals: [ `snake`, `rabbit` ] }
    ]
  }
  const r2 = [ ...getPathsAndData(d2) ];
  assert.sameDeepMembers(r2, [
    { path: `message`, value: `hello` },
    { path: `profiles`, value: d2.profiles },
    { path: `profiles.0`, value: d2.profiles[ 0 ] },
    { path: `profiles.0.name`, value: d2.profiles[ 0 ].name },

    { path: `profiles.0.animals`, value: d2.profiles[ 0 ].animals },
    { path: `profiles.0.animals.0`, value: d2.profiles[ 0 ].animals[ 0 ] },
    { path: `profiles.0.animals.1`, value: d2.profiles[ 0 ].animals[ 1 ] },

    { path: `profiles.1`, value: d2.profiles[ 1 ] },
    { path: `profiles.1.name`, value: d2.profiles[ 1 ].name },
    { path: `profiles.1.animals`, value: d2.profiles[ 1 ].animals },
    { path: `profiles.1.animals.0`, value: d2.profiles[ 1 ].animals[ 0 ] },
    { path: `profiles.1.animals.1`, value: d2.profiles[ 1 ].animals[ 1 ] },

  ]);
});

test('get-paths', () => {
  const d = {
    accel: { x: 1, y: 2, z: 3 },
    gyro: { x: 4, y: 5, z: 6 },
  };
  const paths = [ ...getPaths(d) ];

  assert.sameMembers(paths, [
    `accel`,
    `accel.x`,
    `accel.y`,
    `accel.z`,
    `gyro`,
    `gyro.x`,
    `gyro.y`,
    `gyro.z`,
  ]);

  const paths2 = [ ...getPaths(d, true) ];
  assert.sameMembers(paths2, [
    `accel.x`,
    `accel.y`,
    `accel.z`,
    `gyro.x`,
    `gyro.y`,
    `gyro.z`,
  ]);

  expect([ ...getPaths(null) ]).toEqual([]);
  // @ts-expect-error
  expect([ ...getPaths(undefined) ]).toEqual([]);

  const d2 = {
    message: `hello`,
    profiles: [
      { name: `John`, animals: [ `mouse`, `turtle` ] },
      { name: `Jane`, animals: [ `snake`, `rabbit` ] }
    ]
  }
  const d2R = [ ...getPaths(d2) ];
  assert.sameMembers(d2R, [
    `message`,
    `profiles`,
    `profiles.0`, `profiles.0.name`, `profiles.0.animals`, `profiles.0.animals.0`, `profiles.0.animals.1`,
    `profiles.1`, `profiles.1.name`, `profiles.1.animals`, `profiles.1.animals.0`, `profiles.1.animals.1`,
  ])
});

function testResult<T>(t: TestContext & object, result: Result<T, any>, value: T) {
  if (result.success) {
    expect(result.value).toEqual(value);
  } else {
    expect(false, `Result not successful ${ result.error }`);
  }
}

test('get-field', (t) => {
  const t1 = getField<string>({ name: { first: `Thom`, last: `Yorke` } }, `name.first`);
  testResult(t, t1, `Thom`);

  const t2 = getField({ colours: [ `red`, `green`, `blue` ] }, `colours.1`);
  testResult(t, t2, `green`);
  const t3 = getField({ colours: [ `red`, `green`, `blue` ] }, `colours.3`);
  expect(t3.success).toBe(false);
  const d = {
    accel: { x: 1, y: 2, z: 3 },
    gyro: { x: 4, y: 5, z: 6 },
  };
  const t4 = getField(d, `accel.x`);
  testResult(t, t4, 1);
  const t5 = getField<number>(d, `gyro.z`);
  testResult(t, t5, 6);
  const t6 = getField(d, `gyro`);
  testResult(t, t6, { x: 4, y: 5, z: 6 });
  const d2 = {
    message: `hello`,
    profiles: [
      { name: `John`, animals: [ `mouse`, `turtle` ] },
      { name: `Jane`, animals: [ `snake`, `rabbit` ] }
    ]
  }
  const d2a = getField(d2, `profiles.1.animals.1`);
  testResult(t, d2a, `rabbit`);

  expect(getField(d2, `profiles.1.animals.2`).success).toBe(false);
  expect(getField(d2, `profiles.1.animals.hello`).success).toBe(false);
  expect(getField(d2, `profiles.-1.animals.1`).success).toBe(false);
  expect(getField(d2, `profiles.2.animals.2`).success).toBe(false);
  expect(getField(d2, `profiles.1.animalz`).success).toBe(false);
  expect(getField(d2, `message.1`).success).toBe(false);

  expect(() => getField(d, ``)).toThrow()
  // @ts-expect-error
  expect(() => getField(undefined)).toThrow();
  // @ts-expect-error
  expect(() => getField(null)).toThrow();
  // @ts-expect-error
  expect(() => getField(false)).toThrow();
  // @ts-expect-error
  expect(() => getField(10)).toThrow();

  const d3 = {
    message: `hello`,
    profiles: [
      { name: `John`, animals: [ `mouse`, `turtle` ] },
      { name: `Jane`, animals: [ `snake`, `rabbit` ] }
    ]
  }
  expect(resultToValue(getField(d3, `profiles`))).toEqual(d3.profiles);
  expect(resultToValue(getField(d3, `profiles.0`))).toEqual(d3.profiles[ 0 ]);
  expect(resultToValue(getField(d3, `profiles.0.animals`))).toEqual(d3.profiles[ 0 ].animals);
  expect(resultToValue(getField(d3, `profiles.0.animals.1`))).toEqual(d3.profiles[ 0 ].animals[ 1 ]);
});

test(`apply - changes`, () => {
  const test = {
    msg: `hello`,
    position: { x: 10, y: 20 },
    value: false
  }
  const d1 = [ ...compareData(test, {
    ...test,
    msg: `hello!`,
  }) ];
  const d1R = applyChanges(test, d1);
  expect(d1R).toEqual({
    ...test,
    msg: `hello!`
  });

  const d2 = [ ...compareData(test, {
    ...test,
    position: { x: 11, y: 22 }
  }) ];
  const d2R = applyChanges(test, d2);
  expect(d2R).toEqual({
    ...test,
    position: { x: 11, y: 22 }
  });

  const d3 = applyChanges(test, [ { path: `position.y`, value: 22, previous: 20, state: `added` } ]);
  expect(d3).toEqual({
    ...test,
    position: { x: 10, y: 22 }
  });
});

test(`compare - data - array`, () => {
  // Index 1 has a value when it didn't before
  const c1 = [ ...compareData([ `a` ], [ `a`, `a` ], { includeMissingFromA: true }) ];
  expect(c1).toEqual([ { path: `1`, previous: undefined, value: `a`, state: `added` } ]);

  // Indexes 1 & 2 are now undefined
  const c2 = [ ...compareData([ `a`, `a`, `a` ], [ `a` ], { includeMissingFromA: true }) ];
  expect(c2).toEqual(
    [ { path: `1`, previous: `a`, value: undefined, state: `removed` }, { path: `2`, previous: `a`, value: undefined, state: `removed` } ]
  );

  const c3 = [ ...compareData([], [ `a`, `a`, `a` ] as any, { includeMissingFromA: true }) ];
  expect(c3).toEqual([
    { path: `0`, previous: undefined, value: `a`, state: `added` },
    { path: `1`, previous: undefined, value: `a`, state: `added` },
    { path: `2`, previous: undefined, value: `a`, state: `added` }
  ]);

  const c4 = [ ...compareData([ `a`, `a`, `a` ], [], { includeMissingFromA: true }) ];
  expect(c4).toEqual([
    { path: `0`, previous: `a`, value: undefined, state: `removed` },
    { path: `1`, previous: `a`, value: undefined, state: `removed` },
    { path: `2`, previous: `a`, value: undefined, state: `removed` }
  ]);

});

test(`compare - data`, () => {
  const test = {
    msg: `hello`,
    position: { x: 10, y: 20 },
    value: false
  }

  // Value is the same
  const c1 = [ ...compareData(test, {
    msg: `hello`,
    position: { x: 10, y: 20 },
    value: false
  }) ];
  expect(c1.length).toBe(0);

  // Top-level change
  const c2 = [ ...compareData(test, {
    msg: `hello!`,
    position: { x: 10, y: 20 },
    value: false
  }) ];
  expect(c2.length).toBe(1);
  expect(c2).toEqual([ { path: `msg`, previous: `hello`, value: `hello!`, state: `change` } ]);

  // Second-level change - default, not including parents
  const c3a = [ ...compareData(test, {
    msg: `hello`,
    position: { x: 1, y: 20 },
    value: false
  }, { includeParents: false }) ];
  expect(c3a).toEqual([
    { path: `position.x`, previous: 10, value: 1, state: `change` }
  ]);

  // Second-level change - default, including parents
  const c3b = [ ...compareData(test, {
    msg: `hello`,
    position: { x: 1, y: 20 },
    value: false
  }, { includeParents: true }) ];
  expect(c3b).toEqual([
    { path: `position.x`, previous: 10, value: 1, state: `change` },
    { path: `position`, previous: { x: 10, y: 20 }, value: { x: 1, y: 20 }, state: `change` },
  ]);

  // Top-level and second level change
  const c4 = [ ...compareData(test, {
    msg: `hello`,
    position: { x: 1, y: 20 },
    value: true
  }) ];
  expect(c4.length).toBe(2);
  expect(c4).toEqual([
    { path: `position.x`, previous: 10, value: 1, state: `change` },
    { path: `value`, previous: false, value: true, state: `change` }
  ]);

  // Top-level and second-level change
  const c5 = [ ...compareData(test, {
    msg: `hello`,
    position: { x: 1, y: 3 },
    value: true
  }) ];
  expect(c5.length).toBe(3);
  expect(c5).toEqual([
    { path: `position.x`, previous: 10, value: 1, state: `change` },
    { path: `position.y`, previous: 20, value: 3, state: `change` },
    { path: `value`, previous: false, value: true, state: `change` }
  ]);
});

test(`compare - data - undefined`, () => {
  const test = {
    msg: `hello`,
    position: { x: 10, y: 20 },
    value: false
  }
  // Key doesn't exist
  const c1 = [ ...compareData(test, {
    position: { x: 10, y: 20 },
    value: false
  }) ]
  // Expect it picks up on 'msg' removal
  expect(c1).toEqual([
    {
      path: 'msg',
      previous: 'hello',
      value: undefined,
      state: 'removed'
    }
  ])

  // Value is undefined, treating it as removal
  const c2 = [ ...compareData(test, {
    msg: undefined,
    position: { x: 10, y: 20 },
    value: false
  }, { undefinedValueMeansRemoved: true }) ]
  // Expect it treats 'msg' as being removed
  expect(c2).toEqual([
    {
      path: 'msg',
      previous: 'hello',
      value: undefined,
      state: 'removed'
    }
  ])

  // Value is undefined, treating undefined as a value
  const c3 = [ ...compareData(test, {
    msg: undefined,
    position: { x: 10, y: 20 },
    value: false
  }, { undefinedValueMeansRemoved: false }) ]
  // Expect it treats the value as changed
  expect(c3).toEqual([
    { path: 'msg', previous: 'hello', value: undefined, state: 'change' }
  ])

});
test(`compare - data - deep - a`, () => {
  const t1 = {
    a: {
      b: {
        c: {
          d: {
            value: 1
          }
        }
      }
    }
  };

  // 1. No change
  const c1 = [ ...compareData(t1, {
    a: {
      b: {
        c: {
          d: {
            value: 1
          }
        }
      }
    }
  }) ];
  expect(c1.length).toBe(0);

  // 2. Deep value change
  const c2 = [ ...compareData(t1, {
    a: {
      b: {
        c: {
          d: {
            value: 2
          }
        }
      }
    }
  }) ];
  expect(c2).toEqual([ { path: `a.b.c.d.value`, previous: 1, value: 2, state: `change` } ]);

  // 3. Deep value delete
  const c3 = [ ...compareData(t1, {
    a: {
      b: {
        c: {
          // @ts-expect-error
          d: {
          }
        }
      }
    }
  }) ];
  expect(c3).toEqual(
    [ { path: `a.b.c.d.value`, previous: 1, value: undefined, state: `removed` } ]
  );

  // 4. Deep value add, including missing false
  const c4 = [ ...compareData(t1, {
    a: {
      b: {
        c: {
          d: {
            // @ts-expect-error
            wow: true
          }
        }
      }
    }
  }, { includeMissingFromA: false }) ];
  expect(c4).toEqual(
    [ { path: `a.b.c.d.value`, previous: 1, value: undefined, state: `removed` } ]
  );

  // 5. Deep value add, including missing false
  const c5 = [ ...compareData(t1, {
    a: {
      b: {
        c: {
          d: {
            // @ts-expect-error
            wow: true
          }
        }
      }
    }
  }, { includeMissingFromA: true }) ];
  expect(c5).toEqual([
    { path: `a.b.c.d.value`, previous: 1, value: undefined, state: `removed` },
    { path: `a.b.c.d.wow`, previous: undefined, value: true, state: `added` }
  ]);


});

test(`compare - data - deep -with-parents`, () => {
  const t1 = {
    a: {
      b: {
        c: {
          d: {
            value: 1
          }
        }
      }
    }
  };

  // 1. No change
  const c1 = [ ...compareData(t1, {
    a: {
      b: {
        c: {
          d: {
            value: 1
          }
        }
      }
    }
  }, { includeParents: true }) ];
  expect(c1.length).toBe(0);

  // 2. Deep value change
  const c2 = [ ...compareData(t1, {
    a: {
      b: {
        c: {
          d: {
            value: 2
          }
        }
      }
    }
  }) ];
  expect(c2).toEqual([ { path: `a.b.c.d.value`, previous: 1, value: 2, state: `change` } ]);

  // 3. Deep value delete
  const c3 = [ ...compareData(t1, {
    a: {
      b: {
        c: {
          // @ts-expect-error
          d: {
          }
        }
      }
    }
  }, { includeParents: true }) ];
  expect(c3).toEqual([
    { path: `a.b.c.d.value`, previous: 1, value: undefined, state: `removed` },
    { path: `a.b.c.d`, previous: { value: 1 }, value: {}, state: `change` },
    { path: `a.b.c`, previous: { d: { value: 1 } }, value: { d: {} }, state: `change` },
    { path: `a.b`, previous: { c: { d: { value: 1 } } }, value: { c: { d: {} } }, state: `change` },
    { path: `a`, previous: { b: { c: { d: { value: 1 } } } }, value: { b: { c: { d: {} } } }, state: `change` }
  ]);

  // 4. Deep value add, including missing false
  const c4 = [ ...compareData(t1, {
    a: {
      b: {
        c: {
          d: {
            // @ts-expect-error
            wow: true
          }
        }
      }
    }
  }, { includeParents: true, includeMissingFromA: false }) ];
  expect(c4).toEqual([
    { path: `a.b.c.d.value`, previous: 1, value: undefined, state: `removed` },
    { path: `a.b.c.d`, previous: { value: 1 }, value: { wow: true }, state: `change` },
    { path: `a.b.c`, previous: { d: { value: 1 } }, value: { d: { wow: true } }, state: `change` },
    { path: `a.b`, previous: { c: { d: { value: 1 } } }, value: { c: { d: { wow: true } } }, state: `change` },
    { path: `a`, previous: { b: { c: { d: { value: 1 } } } }, value: { b: { c: { d: { wow: true } } } }, state: `change` }
  ]);

  // 5. Deep value add, including missing false
  const c5 = [ ...compareData(t1, {
    a: {
      b: {
        c: {
          d: {
            // @ts-expect-error
            wow: true
          }
        }
      }
    }
  }, { includeParents: true, includeMissingFromA: true }) ];
  expect(c5).toEqual([
    { path: `a.b.c.d.value`, previous: 1, value: undefined, state: `removed` },
    { path: `a.b.c.d.wow`, previous: undefined, value: true, state: `added` },
    { path: `a.b.c.d`, previous: { value: 1 }, value: { wow: true }, state: `change` },
    { path: `a.b.c`, previous: { d: { value: 1 } }, value: { d: { wow: true } }, state: `change` },
    { path: `a.b`, previous: { c: { d: { value: 1 } } }, value: { c: { d: { wow: true } } }, state: `change` },
    { path: `a`, previous: { b: { c: { d: { value: 1 } } } }, value: { b: { c: { d: { wow: true } } } }, state: `change` }
  ]);


});
test(`compare - data - arrays`, () => {
  const test2 = {
    colours: [ `red`, `green`, `blue` ],
    sizes: [ 10, 20, 30 ]
  };

  const cc1 = [ ...compareData(test2, {
    colours: [ `red`, `green`, `blue` ],
    sizes: [ 10, 20, 30 ]
  }) ];
  expect(cc1.length).toBe(0);

  // Remove from array end
  const cc2 = [ ...compareData(test2, {
    colours: [ `red`, `green` ],
    sizes: [ 10, 20, 30 ]
  }) ];
  expect(cc2).toEqual(
    [ { path: `colours.2`, previous: `blue`, value: undefined, state: `removed` } ]
  );

  // Remove from array start
  const cc3 = [ ...compareData(test2, {
    colours: [ `green`, `blue` ],
    sizes: [ 10, 20, 30 ]
  }) ];
  expect(cc3).toEqual([
    { path: `colours.0`, previous: `red`, value: `green`, state: `change` },
    { path: `colours.1`, previous: `green`, value: `blue`, state: `change` },
    { path: `colours.2`, previous: `blue`, value: undefined, state: `removed` }
  ]);

  // Array re-arrange
  const cc4 = [ ...compareData(test2, {
    colours: [ `blue`, `red`, `green` ],
    sizes: [ 10, 20, 30 ]
  }) ];
  expect(cc4).toEqual([
    { path: `colours.0`, previous: `red`, value: `blue`, state: `change` },
    { path: `colours.1`, previous: `green`, value: `red`, state: `change` },
    { path: `colours.2`, previous: `blue`, value: `green`, state: `change` }
  ]);
});

test(`update - by - path`, () => {
  const a = {
    position: { x: 10, y: 20 },
    message: `hello`
  };
  const r1 = updateByPath(a, `message`, `there`);
  expect(a.message).toBe(`hello`);
  expect(r1.message).toBe(`there`);

  const r2 = updateByPath(a, `position.x`, 20);
  expect(a.position.x).toBe(10);
  expect(r2.position.x).toBe(20);

  // If missing keys are used: root
  expect(() => {
    updateByPath(a, `notfound`, 100)
  }).toThrow();
  // missing sub-key
  expect(() => {
    updateByPath(a, `position.notfound`, 100)
  }).toThrow();

  // Arrays
  const aa = {
    colours: [ `red`, `green`, `blue` ],
    flag: true
  };
  const rr1 = updateByPath(aa, `colours.1`, `pink`);

  expect(rr1).toEqual({ flag: true, colours: [ `red`, `pink`, `blue` ] });

  const rr2 = updateByPath(aa, `colours`, [ `orange`, `black` ]);
  expect(rr2).toEqual({ flag: true, colours: [ `orange`, `black` ] })

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
  const rrr1 = updateByPath(aaa, `profile.jane.colours.0`, `yellow`);
  expect(rrr1.profile.jane.colours[ 0 ]).toBe(`yellow`);
  const rrr2 = updateByPath(aaa, `widgets.1.size`, 30);
  expect(rrr2.widgets[ 1 ].size).toBe(30);

  // Array values which are objects
  const b = {
    values: [
      { colour: `red`, size: 10 },
      { colour: `green`, size: 20 }
    ]
  }
  const b1 = updateByPath(b, `values.1.size`, 22);
  expect(b1).toEqual({
    values: [
      { colour: `red`, size: 10 },
      { colour: `green`, size: 22 }
    ]
  });

  const b2 = updateByPath(b, `values.1`, { colour: `pink`, size: 5 });
  expect(b2).toEqual({
    values: [
      { colour: `red`, size: 10 },
      { colour: `pink`, size: 5 }
    ]
  });

  // Throw because we're changing the shape from an object to a string
  expect(() => {
    updateByPath(b, `values`, `hello`)
  }).toThrow();

  const b3 = updateByPath(b, `values`, `hello`, true);
  expect(b3).toEqual({
    values: `hello`
  });



  // Expect to throw because 'number' is missing
  expect(() => {
    updateByPath({
      name: `jill`, address: {
        street: `Test St`, number: 12
      }
    }, `address`, { street: `West St` });
  }).toThrow();

  const c1 = updateByPath({
    name: `jill`, address: {
      street: `Test St`, number: 12
    }
  }, `address`, { street: `West St`, number: 12 });
  expect(c1).toEqual({
    name: `jill`, address: {
      street: `West St`, number: 12
    }
  });

  const c2 = updateByPath([ `a`, `b`, `c` ], `2`, `d`);
  expect(c2).toEqual([ `a`, `b`, `d` ]);

  // Throws because array index is out of bounds
  expect(() => {
    updateByPath([ `a`, `b`, `c` ], `3`, `d`);
  }).toThrow();
  // Allowed
  const c3 = updateByPath([ `a`, `b`, `c` ], `3`, `d`, true);

  expect(c3).toEqual([ `a`, `b`, `c`, `d` ]);

});

