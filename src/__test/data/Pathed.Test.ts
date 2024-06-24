import test from 'ava';
import { compareData, getPathsAndData, updateByPath, applyChanges, getField, getPaths } from '../../data/Pathed.js';
import { arrayValuesEqual } from '../Include.js';
import { isEqualValueDefault } from '../../util/IsEqual.js';

test(`get-paths-and-data`, t => {
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

  ], isEqualValueDefault);
});

test('get-paths', (t) => {
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

  //@ts-ignore
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
    `profiles.0`, `profiles.0.name`, `profiles.0.animals`, `profiles.0.animals.0`, `profiles.0.animals.1`,
    `profiles.1`, `profiles.1.name`, `profiles.1.animals`, `profiles.1.animals.0`, `profiles.1.animals.1`,
  ])
});

test('get-field', (t) => {
  t.is(getField({ name: { first: `Thom`, last: `Yorke` } }, `name.first`), `Thom`);
  t.is(getField({ colours: [ `red`, `green`, `blue` ] }, `colours.1`), `green`);
  t.falsy(getField({ colours: [ `red`, `green`, `blue` ] }, `colours.3`));
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
  t.is(getField(d2, `profiles.1.animals.1`), `rabbit`);

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
  t.deepEqual(getField(d3, `profiles.0`), d3.profiles[ 0 ]);
  t.deepEqual(getField(d3, `profiles.0.animals`), d3.profiles[ 0 ].animals);
  t.deepEqual(getField(d3, `profiles.0.animals.1`), d3.profiles[ 0 ].animals[ 1 ]);
});



test(`apply-changes`, t => {
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
  t.deepEqual(d1R, {
    ...test,
    msg: `hello!`
  });

  const d2 = [ ...compareData(test, {
    ...test,
    position: { x: 11, y: 22 }
  }) ];
  const d2R = applyChanges(test, d2);
  t.deepEqual(d2R, {
    ...test,
    position: { x: 11, y: 22 }
  });

  const d3 = applyChanges(test, [ { path: `position.y`, value: 22, previous: 20, state: `added` } ]);
  t.deepEqual(d3, {
    ...test,
    position: { x: 10, y: 22 }
  });
});

test(`compare-data-array`, t => {
  // Index 1 has a value when it didn't before
  const c1 = compareData([ `a` ], [ `a`, `a` ], { includeMissingFromA: true });
  t.deepEqual(c1, [ { path: `1`, previous: undefined, value: `a`, state: `added` } ]);

  // Indexes 1 & 2 are now undefined
  const c2 = compareData([ `a`, `a`, `a` ], [ `a` ], { includeMissingFromA: true });
  t.deepEqual(c2, [ { path: `1`, previous: `a`, value: undefined, state: `removed` }, { path: `2`, previous: `a`, value: undefined, state: `removed` } ]);

  const c3 = compareData([], [ `a`, `a`, `a` ], { includeMissingFromA: true });
  t.deepEqual(c3, [
    { path: `0`, previous: undefined, value: `a`, state: `added` },
    { path: `1`, previous: undefined, value: `a`, state: `added` },
    { path: `2`, previous: undefined, value: `a`, state: `added` }
  ]);

  const c4 = compareData([ `a`, `a`, `a` ], [], { includeMissingFromA: true });
  t.deepEqual(c4, [
    { path: `0`, previous: `a`, value: undefined, state: `removed` },
    { path: `1`, previous: `a`, value: undefined, state: `removed` },
    { path: `2`, previous: `a`, value: undefined, state: `removed` }
  ]);

});

test(`compare-data`, t => {
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
  t.is(c1.length, 0);

  // Top-level change
  const c2 = [ ...compareData(test, {
    msg: `hello!`,
    position: { x: 10, y: 20 },
    value: false
  }) ];
  t.is(c2.length, 1);
  t.deepEqual(c2, [ { path: `msg`, previous: `hello`, value: `hello!`, state: `change` } ]);

  // Second-level change - default, not including parents
  const c3a = [ ...compareData(test, {
    msg: `hello`,
    position: { x: 1, y: 20 },
    value: false
  }, { includeParents: false }) ];
  t.deepEqual(c3a, [
    { path: `position.x`, previous: 10, value: 1, state: `change` }
  ]);

  // Second-level change - default, including parents
  const c3b = [ ...compareData(test, {
    msg: `hello`,
    position: { x: 1, y: 20 },
    value: false
  }, { includeParents: true }) ];
  t.deepEqual(c3b, [
    { path: `position.x`, previous: 10, value: 1, state: `change` },
    { path: `position`, previous: { x: 10, y: 20 }, value: { x: 1, y: 20 }, state: `change` },
  ]);

  // Top-level and second level change
  const c4 = [ ...compareData(test, {
    msg: `hello`,
    position: { x: 1, y: 20 },
    value: true
  }) ];
  t.is(c4.length, 2);
  t.deepEqual(c4, [
    { path: `position.x`, previous: 10, value: 1, state: `change` },
    { path: `value`, previous: false, value: true, state: `change` }
  ]);

  // Top-level and second-level change
  const c5 = [ ...compareData(test, {
    msg: `hello`,
    position: { x: 1, y: 3 },
    value: true
  }) ];
  t.is(c5.length, 3);
  t.deepEqual(c5, [
    { path: `position.x`, previous: 10, value: 1, state: `change` },
    { path: `position.y`, previous: 20, value: 3, state: `change` },
    { path: `value`, previous: false, value: true, state: `change` }
  ]);
});

test(`compare-data-deep-a`, t => {
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
  t.is(c1.length, 0);

  // 2. Deep value change
  const c2 = compareData(t1, {
    a: {
      b: {
        c: {
          d: {
            value: 2
          }
        }
      }
    }
  });
  t.deepEqual(c2, [ { path: `a.b.c.d.value`, previous: 1, value: 2, state: `change` } ]);

  // 3. Deep value delete
  const c3 = compareData(t1, {
    a: {
      b: {
        c: {
          // @ts-expect-error
          d: {
          }
        }
      }
    }
  });
  t.deepEqual(c3, [ { path: `a.b.c.d.value`, previous: 1, value: undefined, state: `removed` } ]);

  // 4. Deep value add, including missing false
  const c4 = compareData(t1, {
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
  }, { includeMissingFromA: false });
  t.deepEqual(c4, [ { path: `a.b.c.d.value`, previous: 1, value: undefined, state: `removed` } ]);

  // 5. Deep value add, including missing false
  const c5 = compareData(t1, {
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
  }, { includeMissingFromA: true });
  t.deepEqual(c5, [
    { path: `a.b.c.d.value`, previous: 1, value: undefined, state: `removed` },
    { path: `a.b.c.d.wow`, previous: undefined, value: true, state: `added` }
  ]);


});

test(`compare-data-deep-with-parents`, t => {
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
  t.is(c1.length, 0);

  // 2. Deep value change
  const c2 = compareData(t1, {
    a: {
      b: {
        c: {
          d: {
            value: 2
          }
        }
      }
    }
  });
  t.deepEqual(c2, [ { path: `a.b.c.d.value`, previous: 1, value: 2, state: `change` } ]);

  // 3. Deep value delete
  const c3 = compareData(t1, {
    a: {
      b: {
        c: {
          // @ts-expect-error
          d: {
          }
        }
      }
    }
  }, { includeParents: true });
  t.deepEqual(c3, [
    { path: `a.b.c.d.value`, previous: 1, value: undefined, state: `removed` },
    { path: `a.b.c.d`, previous: { value: 1 }, value: {}, state: `change` },
    { path: `a.b.c`, previous: { d: { value: 1 } }, value: { d: {} }, state: `change` },
    { path: `a.b`, previous: { c: { d: { value: 1 } } }, value: { c: { d: {} } }, state: `change` },
    { path: `a`, previous: { b: { c: { d: { value: 1 } } } }, value: { b: { c: { d: {} } } }, state: `change` }
  ]);

  // 4. Deep value add, including missing false
  const c4 = compareData(t1, {
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
  }, { includeParents: true, includeMissingFromA: false });
  t.deepEqual(c4, [
    { path: `a.b.c.d.value`, previous: 1, value: undefined, state: `removed` },
    { path: `a.b.c.d`, previous: { value: 1 }, value: { wow: true }, state: `change` },
    { path: `a.b.c`, previous: { d: { value: 1 } }, value: { d: { wow: true } }, state: `change` },
    { path: `a.b`, previous: { c: { d: { value: 1 } } }, value: { c: { d: { wow: true } } }, state: `change` },
    { path: `a`, previous: { b: { c: { d: { value: 1 } } } }, value: { b: { c: { d: { wow: true } } } }, state: `change` }
  ]);

  // 5. Deep value add, including missing false
  const c5 = compareData(t1, {
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
  }, { includeParents: true, includeMissingFromA: true });
  t.deepEqual(c5, [
    { path: `a.b.c.d.value`, previous: 1, value: undefined, state: `removed` },
    { path: `a.b.c.d.wow`, previous: undefined, value: true, state: `added` },
    { path: `a.b.c.d`, previous: { value: 1 }, value: { wow: true }, state: `change` },
    { path: `a.b.c`, previous: { d: { value: 1 } }, value: { d: { wow: true } }, state: `change` },
    { path: `a.b`, previous: { c: { d: { value: 1 } } }, value: { c: { d: { wow: true } } }, state: `change` },
    { path: `a`, previous: { b: { c: { d: { value: 1 } } } }, value: { b: { c: { d: { wow: true } } } }, state: `change` }
  ]);


});
test(`compare-data-arrays`, t => {
  const test2 = {
    colours: [ `red`, `green`, `blue` ],
    sizes: [ 10, 20, 30 ]
  };

  const cc1 = [ ...compareData(test2, {
    colours: [ `red`, `green`, `blue` ],
    sizes: [ 10, 20, 30 ]
  }) ];
  t.is(cc1.length, 0);

  // Remove from array end
  const cc2 = compareData(test2, {
    colours: [ `red`, `green` ],
    sizes: [ 10, 20, 30 ]
  });
  t.deepEqual(cc2, [ { path: `colours.2`, previous: `blue`, value: undefined, state: `removed` } ]);

  // Remove from array start
  const cc3 = compareData(test2, {
    colours: [ `green`, `blue` ],
    sizes: [ 10, 20, 30 ]
  });
  t.deepEqual(cc3, [
    { path: `colours.0`, previous: `red`, value: `green`, state: `change` },
    { path: `colours.1`, previous: `green`, value: `blue`, state: `change` },
    { path: `colours.2`, previous: `blue`, value: undefined, state: `removed` }
  ]);

  // Array re-arrange
  const cc4 = compareData(test2, {
    colours: [ `blue`, `red`, `green` ],
    sizes: [ 10, 20, 30 ]
  });
  t.deepEqual(cc4, [
    { path: `colours.0`, previous: `red`, value: `blue`, state: `change` },
    { path: `colours.1`, previous: `green`, value: `red`, state: `change` },
    { path: `colours.2`, previous: `blue`, value: `green`, state: `change` }
  ]);
});

test(`update-by-path`, t => {
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
  const rr1 = updateByPath(aa, `colours.1`, `pink`);

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
  const rrr1 = updateByPath(aaa, `profile.jane.colours.0`, `yellow`);
  t.is(rrr1.profile.jane.colours[ 0 ], `yellow`);
  const rrr2 = updateByPath(aaa, `widgets.1.size`, 30);
  t.is(rrr2.widgets[ 1 ].size, 30);

  // Array values which are objects
  const b = {
    values: [
      { colour: `red`, size: 10 },
      { colour: `green`, size: 20 }
    ]
  }
  const b1 = updateByPath(b, `values.1.size`, 22);
  t.deepEqual(b1,
    {
      values: [
        { colour: `red`, size: 10 },
        { colour: `green`, size: 22 }
      ]
    });

  const b2 = updateByPath(b, `values.1`, { colour: `pink`, size: 5 });
  t.deepEqual(b2, {
    values: [
      { colour: `red`, size: 10 },
      { colour: `pink`, size: 5 }
    ]
  });

  // Throw because we're changing the shape from an object to a string
  t.throws(() => {
    updateByPath(b, `values`, `hello`)
  });

  const b3 = updateByPath(b, `values`, `hello`, true);
  t.deepEqual(b3, {
    values: `hello`
  });



  // Expect to throw because 'number' is missing
  t.throws(() => {
    updateByPath({
      name: `jill`, address: {
        street: `Test St`, number: 12
      }
    }, `address`, { street: `West St` });
  });

  const c1 = updateByPath({
    name: `jill`, address: {
      street: `Test St`, number: 12
    }
  }, `address`, { street: `West St`, number: 12 });
  t.deepEqual(c1, {
    name: `jill`, address: {
      street: `West St`, number: 12
    }
  });

  const c2 = updateByPath([ `a`, `b`, `c` ], `2`, `d`);
  t.deepEqual(c2, [ `a`, `b`, `d` ]);

  // Throws because array index is out of bounds
  t.throws(() => {
    updateByPath([ `a`, `b`, `c` ], `3`, `d`);
  });
  // Allowed
  const c3 = updateByPath([ `a`, `b`, `c` ], `3`, `d`, true);

  t.deepEqual(c3, [ `a`, `b`, `c`, `d` ]);

});

