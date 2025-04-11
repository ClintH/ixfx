import { test, expect, describe } from 'vitest';
import { compareArrays, changedObjectDataFields, compareObjectKeys } from '../../src/records/compare.js';
import { isEmptyEntries } from '../../src/is-equal.js';
import { compareIterableValuesShallow } from '../../src/iterable-compare-values-shallow.js';

const objectEmpty = (o: object) => Object.entries(o).length === 0;

test(`compare-keys`, () => {
  const a = { colour: `red`, intensity: 5 };
  const b = { colour: `pink`, size: 10 };
  const c = compareObjectKeys(a, b);
  expect(c.shared).toEqual([ `colour` ]);
  expect(c.a).toEqual([ `intensity` ]);
  expect(c.b).toEqual([ `size` ]);

})

describe(`compare`, () => {

  test(`compare-array`, () => {
    // Removing an item
    const r1 = compareArrays([ `one`, `two`, `three` ], [ `one`, `two` ]);
    expect(r1.isArray).toBe(true);
    expect(r1.hasChanged).toBe(true);
    expect(isEmptyEntries(r1.changed)).toBe(true);
    expect(isEmptyEntries(r1.added)).toBe(true);
    expect(r1.removed).toEqual([ 2 ]);
    expect(r1.summary).toEqual([ [ `del`, 2, `three` ] ]);

    // Adding
    const r2 = compareArrays([ `one`, `two`, `three` ], [ `one`, `apple`, `two`, `three` ]);
    expect(r2.isArray).toBe(true);
    expect(r2.hasChanged).toBe(true);
    expect(r2.added).toEqual({ 3: 'three' });
    expect(r2.changed).toEqual({ 1: `apple`, 2: 'two' });
    expect(r2.summary).toEqual(
      [ [ `mutate`, 1, `apple` ], [ `mutate`, 2, `two` ], [ `add`, 3, `three` ] ]
    );

    // Changing
    const r3 = compareArrays([ `one`, `two`, `three` ], [ `one`, `twotwo`, `three` ]);
    expect(r3.isArray).toBe(true);
    expect(r3.hasChanged).toBe(true);
    expect(isEmptyEntries(r3.children)).toBe(true);
    expect(isEmptyEntries(r3.added)).toBe(true);
    expect(r3.removed.length === 0).toBe(true);
    expect(r3.changed).toEqual({ 1: 'twotwo' })
    expect(r3.summary).toEqual([ [ `mutate`, 1, `twotwo` ] ]);

    // Not chaging
    const r5 = compareArrays([ `one`, `two`, `three` ], [ `one`, `two`, `three` ]);
    expect(r5.hasChanged).toBe(false);

  });

  test('changedObjectDataFields', () => {
    const a = {
      position: { x: 1, y: 1 },
      message: `hello`,
      v: 10,
      flag: true
    };

    const r1 = changedObjectDataFields(a, { ...a });
    expect(objectEmpty(r1)).toBe(true);

    const r2 = changedObjectDataFields(a, {
      ...a,
      message: `hello!`,
    });
    expect(Object.entries(r2).length).toBe(1);
    expect((r2 as any).message).toBe(`hello!`);

    const r3 = changedObjectDataFields(a, {
      ...a,
      position: { x: 10, y: 1 },
      message: `hello!`,
    });
    expect(Object.entries(r3).length).toBe(2);
    expect((r3 as any).message).toBe(`hello!`);
    expect((r3 as any).position).toEqual({ x: 10 });
    //console.log(`changedObjectDataFields done`);
  });

  test(`changedObjectDataFields-array`, () => {
    // Arrays
    const a = {
      value: 10,
      colours: [ `red`, `blue`, `green` ]
    };
    const rr1 = changedObjectDataFields(a, structuredClone(a));
    expect(objectEmpty(rr1)).toBe(true);

    // Additional value
    const r2 = changedObjectDataFields(a, {
      ...a,
      colours: [ `red`, `blue`, `green`, `yellow` ]
    });
    expect(r2).toEqual({ colours: [ `red`, `blue`, `green`, `yellow` ] });

    // Changed order
    const r3 = changedObjectDataFields(a, {
      ...a,
      colours: [ `green`, `red`, `blue` ]
    });
    expect(r3).toEqual({ colours: [ `green`, `red`, `blue` ] });

    // Removed from end
    const r4a = changedObjectDataFields(a, {
      ...a,
      colours: [ `red`, `blue` ]
    });
    expect(r4a).toEqual({ colours: [ `red`, `blue` ] });

    // Remove from beginning
    const r4b = changedObjectDataFields(a, {
      ...a,
      colours: [ `blue`, `green` ]
    });
    expect(r4b).toEqual({ colours: [ `blue`, `green` ] });

    // Remove from middle
    const r4c = changedObjectDataFields(a, {
      ...a,
      colours: [ `red`, `green` ]
    });
    expect(r4c).toEqual({ colours: [ `red`, `green` ] });

  });



  test(`compare-values`, () => {
    const a = [ 'apples', 'oranges', 'pears' ];
    const b = [ 'pears', 'kiwis', 'bananas' ];
    const r = compareIterableValuesShallow(a, b);
    expect(r.shared).toEqual([ 'pears' ]);
    expect(r.a).toEqual([ 'apples', 'oranges' ]);
    expect(r.b).toEqual([ 'kiwis', 'bananas' ]);

    const a1 = [ 'apples', 'oranges' ];
    const b1 = [ 'oranges', 'apples' ];

    const aa = [ { name: 'John' }, { name: 'Mary' }, { name: 'Sue' } ];
    const bb = [ { name: 'John' }, { name: 'Mary' }, { name: 'Jane' } ];
    const rr = compareIterableValuesShallow(aa, bb, (a, b) => a.name === b.name);
    expect(rr.shared).toEqual([ { name: 'John' }, { name: 'Mary' } ]);
    expect(rr.a).toEqual([ { name: 'Sue' } ]);
    expect(rr.b).toEqual([ { name: 'Jane' } ]);

  });
});

// test(`compareData-array`, t => {
//   const a = [ `red`, `green`, `blue` ];
//   const r1 = compareData(a, [ `red`, `green`, `blue` ]);
//   t.false(r1.hasChanged);

//   // Additional item
//   const r2 = compareData(a, [ `red`, `green`, `blue`, `yellow` ]);
//   t.deepEqual(r2.added, { _3: `yellow` });
//   t.true(objectEmpty(r2.changed));
//   t.true(objectEmpty(r2.removed));

//   // Remove from end
//   const r3a = compareData(a, [ `red`, `green` ]);
//   t.true(objectEmpty(r3a.changed));
//   t.true(objectEmpty(r3a.added));
//   t.deepEqual(r3a.removed, [ `_2` ]);

//   // Remove from beginning. Indexes shuffle down
//   const r3b = compareData(a, [ `green`, `blue` ]);
//   t.true(objectEmpty(r3b.added));
//   t.deepEqual(r3b.changed, { _0: `green`, _1: `blue` });
//   // since array indexes are changing, it's not _0 that is removed, as we might expect
//   t.deepEqual(r3b.removed, [ `_2` ]);

//   // Remove from middle. This also means that blue changes because its now in index 1
//   const r3c = compareData(a, [ `red`, `blue` ]);
//   t.deepEqual(r3c.changed, { _1: `blue` });
//   t.true(objectEmpty(r3c.added));
//   t.deepEqual(r3c.removed, [ `_2` ]);

//   // Reordered.
//   const r4 = compareData(a, [ `blue`, `red`, `green` ]);
//   t.deepEqual(r4.changed, { _0: `blue`, _1: `red`, _2: `green` });
//   t.true(objectEmpty(r4.added));
//   t.true(objectEmpty(r4.removed));

//   // Lots of changes. Blue stays at position 2
//   const r5 = compareData(a, [ `green`, `pink`, `blue`, `orange` ]);
//   t.deepEqual(r5.changed, { _0: `green`, _1: `pink` });
//   t.deepEqual(r5.added, { _3: `orange` });
//   t.true(objectEmpty(r5.removed));
// });

// test('compareData', t => {
//   const a = {
//     position: { x: 1, y: 1 },
//     message: `hello`,
//     v: 10,
//     flag: true
//   };

//   const r1 = compareData(a, {
//     position: { x: 1, y: 1 },
//     message: `hello`,
//     v: 10,
//     flag: true
//   });
//   t.is(r1.hasChanged, false);
//   t.true(objectEmpty(r1.added));
//   t.true(objectEmpty(r1.changed));
//   t.true(objectEmpty(r1.removed));

//   // String value changes
//   const r2 = compareData(a, {
//     position: { x: 1, y: 1 },
//     message: `hello!`,
//     v: 10,
//     flag: true
//   });

//   t.is(r2.hasChanged, true);
//   t.true(objectEmpty(r2.added));
//   t.true(objectEmpty(r2.removed));
//   t.is(Object.entries(r2.changed).length, 1);
//   t.is((r2.changed as any).message, `hello!`);

//   // Number value changes
//   const r3 = compareData(a, {
//     position: { x: 1, y: 1 },
//     message: `hello`,
//     v: 0,
//     flag: true
//   });
//   t.is(r3.hasChanged, true);
//   t.true(objectEmpty(r3.added));
//   t.true(objectEmpty(r3.removed));
//   t.is(Object.entries(r3.changed).length, 1);
//   t.is((r3.changed as any).v, 0);


//   // bool value changes
//   const r4 = compareData(a, {
//     position: { x: 1, y: 1 },
//     message: `hello`,
//     v: 10,
//     flag: false
//   });
//   t.is(r4.hasChanged, true);
//   t.true(objectEmpty(r4.added));
//   t.true(objectEmpty(r4.removed));
//   t.is(Object.entries(r4.changed).length, 1);
//   t.is((r4.changed as any).flag, false);

//   // Several values change
//   const r5 = compareData(a, {
//     position: { x: 1, y: 1 },
//     message: `hello!`,
//     v: 0,
//     flag: false
//   });
//   t.is(r5.hasChanged, true);
//   t.true(objectEmpty(r5.added));
//   t.true(objectEmpty(r5.removed));
//   t.is(Object.entries(r5.changed).length, 3);
//   t.is((r5.changed as any).v, 0);
//   t.is((r5.changed as any).flag, false);
//   t.is((r5.changed as any).message, `hello!`);

//   // Additional field
//   const r6 = compareData(a, {
//     ...a,
//     additionalField: `hello2`
//   });
//   t.is(r6.hasChanged, true);
//   t.false(objectEmpty(r6.added));
//   t.true(objectEmpty(r6.removed));
//   t.true(objectEmpty(r6.changed));
//   t.is(Object.entries(r6.added).length, 1);
//   t.is((r6.added as any).additionalField, `hello2`);

//   // Sub-field change (one value)
//   const r7 = compareData(a, {
//     ...a,
//     position: { x: 0, y: 1 },
//   });
//   t.is(r7.hasChanged, true);
//   t.true(objectEmpty(r7.added));
//   t.true(objectEmpty(r7.removed));
//   t.true(objectEmpty(r7.changed));
//   const pos = r7.children.position;
//   t.true(pos.hasChanged);
//   t.true(objectEmpty(pos.added));
//   t.true(objectEmpty(pos.removed));
//   t.is(Object.entries(pos.changed).length, 1);
//   t.is(pos.changed.x, 0);

//   // Sub-field change (both values)
//   const r8 = compareData(a, {
//     ...a,
//     position: { x: 100, y: 200 },
//   });
//   t.is(r8.hasChanged, true);
//   t.true(objectEmpty(r8.added));
//   t.true(objectEmpty(r8.removed));
//   t.true(objectEmpty(r8.changed));
//   const pos2 = r8.children.position;
//   t.true(pos.hasChanged);
//   t.true(objectEmpty(pos2.added));
//   t.true(objectEmpty(pos2.removed));
//   t.is(Object.entries(pos2.changed).length, 2);
//   t.is(pos2.changed.x, 100);
//   t.is(pos2.changed.y, 200);

// });
