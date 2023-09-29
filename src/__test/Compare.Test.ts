import test from 'ava';
import { changedDataFields, compareData } from '../Compare.js';

const objectEmpty = (o: object) => Object.entries(o).length === 0;


test('changedDataFields', t => {
  const a = {
    position: { x: 1, y: 1 },
    message: `hello`,
    v: 10,
    flag: true
  };

  const r1 = changedDataFields(a, { ...a });
  t.true(objectEmpty(r1));

  const r2 = changedDataFields(a, {
    ...a,
    message: `hello!`,
  });
  t.is(Object.entries(r2).length, 1);
  t.is((r2 as any).message, `hello!`);

  const r3 = changedDataFields(a, {
    ...a,
    position: { x: 10, y: 1 },
    message: `hello!`,
  });
  t.is(Object.entries(r3).length, 2);
  t.is((r3 as any).message, `hello!`);
  t.deepEqual((r3 as any).position, { x: 10 });

});

test(`changedDataFields-array`, t => {
  // Arrays
  const a = {
    value: 10,
    colours: [ `red`, `blue`, `green` ]
  };
  const rr1 = changedDataFields(a, structuredClone(a));
  t.true(objectEmpty(rr1));

  // Additional value
  const r2 = changedDataFields(a, {
    ...a,
    colours: [ `red`, `blue`, `green`, `yellow` ]
  });
  t.deepEqual(r2, { colours: [ `red`, `blue`, `green`, `yellow` ] });

  // Changed order
  const r3 = changedDataFields(a, {
    ...a,
    colours: [ `green`, `red`, `blue` ]
  });
  t.deepEqual(r3, { colours: [ `green`, `red`, `blue` ] });

  // Removed from end
  const r4a = changedDataFields(a, {
    ...a,
    colours: [ `red`, `blue` ]
  });
  t.deepEqual(r4a, { colours: [ `red`, `blue` ] });

  // Remove from beginning
  const r4b = changedDataFields(a, {
    ...a,
    colours: [ `blue`, `green` ]
  });
  t.deepEqual(r4b, { colours: [ `blue`, `green` ] });

  // Remove from middle
  const r4c = changedDataFields(a, {
    ...a,
    colours: [ `red`, `green` ]
  });
  t.deepEqual(r4c, { colours: [ `red`, `green` ] });


});

test(`compareData-array`, t => {
  const a = [ `red`, `green`, `blue` ];
  const r1 = compareData(a, [ `red`, `green`, `blue` ]);
  t.false(r1.hasChanged);

  // Additional item
  const r2 = compareData(a, [ `red`, `green`, `blue`, `yellow` ]);
  t.deepEqual(r2.added, { _3: `yellow` });
  t.true(objectEmpty(r2.changed));
  t.true(objectEmpty(r2.removed));

  // Remove from end
  const r3a = compareData(a, [ `red`, `green` ]);
  t.true(objectEmpty(r3a.changed));
  t.true(objectEmpty(r3a.added));
  t.deepEqual(r3a.removed, [ `_2` ]);

  // Remove from beginning. Indexes shuffle down
  const r3b = compareData(a, [ `green`, `blue` ]);
  t.true(objectEmpty(r3b.added));
  t.deepEqual(r3b.changed, { _0: `green`, _1: `blue` });
  // since array indexes are changing, it's not _0 that is removed, as we might expect
  t.deepEqual(r3b.removed, [ `_2` ]);

  // Remove from middle. This also means that blue changes because its now in index 1
  const r3c = compareData(a, [ `red`, `blue` ]);
  t.deepEqual(r3c.changed, { _1: `blue` });
  t.true(objectEmpty(r3c.added));
  t.deepEqual(r3c.removed, [ `_2` ]);

  // Reordered.
  const r4 = compareData(a, [ `blue`, `red`, `green` ]);
  t.deepEqual(r4.changed, { _0: `blue`, _1: `red`, _2: `green` });
  t.true(objectEmpty(r4.added));
  t.true(objectEmpty(r4.removed));

  // Lots of changes. Blue stays at position 2
  const r5 = compareData(a, [ `green`, `pink`, `blue`, `orange` ]);
  t.deepEqual(r5.changed, { _0: `green`, _1: `pink` });
  t.deepEqual(r5.added, { _3: `orange` });
  t.true(objectEmpty(r5.removed));
});

test('compareData', t => {
  const a = {
    position: { x: 1, y: 1 },
    message: `hello`,
    v: 10,
    flag: true
  };

  const r1 = compareData(a, {
    position: { x: 1, y: 1 },
    message: `hello`,
    v: 10,
    flag: true
  });
  t.is(r1.hasChanged, false);
  t.true(objectEmpty(r1.added));
  t.true(objectEmpty(r1.changed));
  t.true(objectEmpty(r1.removed));

  // String value changes
  const r2 = compareData(a, {
    position: { x: 1, y: 1 },
    message: `hello!`,
    v: 10,
    flag: true
  });

  t.is(r2.hasChanged, true);
  t.true(objectEmpty(r2.added));
  t.true(objectEmpty(r2.removed));
  t.is(Object.entries(r2.changed).length, 1);
  t.is((r2.changed as any).message, `hello!`);

  // Number value changes
  const r3 = compareData(a, {
    position: { x: 1, y: 1 },
    message: `hello`,
    v: 0,
    flag: true
  });
  t.is(r3.hasChanged, true);
  t.true(objectEmpty(r3.added));
  t.true(objectEmpty(r3.removed));
  t.is(Object.entries(r3.changed).length, 1);
  t.is((r3.changed as any).v, 0);


  // bool value changes
  const r4 = compareData(a, {
    position: { x: 1, y: 1 },
    message: `hello`,
    v: 10,
    flag: false
  });
  t.is(r4.hasChanged, true);
  t.true(objectEmpty(r4.added));
  t.true(objectEmpty(r4.removed));
  t.is(Object.entries(r4.changed).length, 1);
  t.is((r4.changed as any).flag, false);

  // Several values change
  const r5 = compareData(a, {
    position: { x: 1, y: 1 },
    message: `hello!`,
    v: 0,
    flag: false
  });
  t.is(r5.hasChanged, true);
  t.true(objectEmpty(r5.added));
  t.true(objectEmpty(r5.removed));
  t.is(Object.entries(r5.changed).length, 3);
  t.is((r5.changed as any).v, 0);
  t.is((r5.changed as any).flag, false);
  t.is((r5.changed as any).message, `hello!`);

  // Additional field
  const r6 = compareData(a, {
    ...a,
    additionalField: `hello2`
  });
  t.is(r6.hasChanged, true);
  t.false(objectEmpty(r6.added));
  t.true(objectEmpty(r6.removed));
  t.true(objectEmpty(r6.changed));
  t.is(Object.entries(r6.added).length, 1);
  t.is((r6.added as any).additionalField, `hello2`);

  // Sub-field change (one value)
  const r7 = compareData(a, {
    ...a,
    position: { x: 0, y: 1 },
  });
  t.is(r7.hasChanged, true);
  t.true(objectEmpty(r7.added));
  t.true(objectEmpty(r7.removed));
  t.true(objectEmpty(r7.changed));
  const pos = r7.children.position;
  t.true(pos.hasChanged);
  t.true(objectEmpty(pos.added));
  t.true(objectEmpty(pos.removed));
  t.is(Object.entries(pos.changed).length, 1);
  t.is(pos.changed.x, 0);

  // Sub-field change (both values)
  const r8 = compareData(a, {
    ...a,
    position: { x: 100, y: 200 },
  });
  t.is(r8.hasChanged, true);
  t.true(objectEmpty(r8.added));
  t.true(objectEmpty(r8.removed));
  t.true(objectEmpty(r8.changed));
  const pos2 = r8.children.position;
  t.true(pos.hasChanged);
  t.true(objectEmpty(pos2.added));
  t.true(objectEmpty(pos2.removed));
  t.is(Object.entries(pos2.changed).length, 2);
  t.is(pos2.changed.x, 100);
  t.is(pos2.changed.y, 200);

});
