import { test, expect } from 'vitest';
import * as M from '../src/maps.js';
import { comparerInverse, numericComparer } from '../src/comparers.js';
import { isEqualValueDefault } from '../src/is-equal.js';

test(`addObjectMutate`, () => {
  const m1 = new Map<string, number>();
  M.addObjectEntriesMutate(m1, {
    Sally: { colour: `red` },
    Bob: { colour: `pink` }
  });
  expect(m1.entries().toArray()).toEqual([
    [ `Sally`, { colour: `red` } ],
    [ `Bob`, { colour: `pink` } ]
  ])

});

test(`sortByValue`, () => {
  const m1 = new Map<string, number>();
  m1.set("mango", 100);
  m1.set("apple", 20);
  m1.set("banana", 1);
  m1.set("pear", 40);

  expect(M.sortByValue(m1)).toStrictEqual([
    [ "banana", 1 ],
    [ "apple", 20 ],
    [ "pear", 40 ],
    [ "mango", 100 ],
  ]);

  expect(M.sortByValue(m1, comparerInverse(numericComparer))).toStrictEqual([
    [ "mango", 100 ],
    [ "pear", 40 ],
    [ "apple", 20 ],
    [ "banana", 1 ],
  ]);

  const m2 = new Map<string, string>();
  m2.set("mango", "a");
  m2.set("apple", "z");
  m2.set("banana", "f");
  m2.set("pear", "g");
  expect(M.sortByValue(m2)).toStrictEqual([
    [ "mango", "a" ],
    [ "banana", "f" ],
    [ "pear", "g" ],
    [ "apple", "z" ],
  ]);
})

test(`sortByValueProperty`, () => {
  const m = new Map();
  m.set(`4491`, { name: `Bob`, size: 10 });
  m.set(`2319`, { name: `Alice`, size: 100 });
  m.set(`1000`, { name: `Charlie`, size: 1 });

  expect(M.sortByValueProperty(m, `name`)).toStrictEqual([
    [ "2319", { name: `Alice`, size: 100 } ],
    [ "4491", { name: `Bob`, size: 10 } ],
    [ "1000", { name: `Charlie`, size: 1 } ],
  ]);

  expect(M.sortByValueProperty(m, `size`)).toStrictEqual([
    [ "1000", { name: `Charlie`, size: 1 } ],
    [ "4491", { name: `Bob`, size: 10 } ],
    [ "2319", { name: `Alice`, size: 100 } ],
  ]);
});

test(`findValue2`, () => {
  const m = new Map<string, { name: string, size: number }>();
  m.set(`4491`, { name: `Bob`, size: 10 });
  m.set(`2319`, { name: `Alice`, size: 100 });
  m.set(`1000`, { name: `Charlie`, size: 1 });
  expect(M.findValue(m, v => v.size > 1)).not.toBe({ name: `Bob`, size: 10 });
});

test(`findEntryByPredicate`, () => {
  const m = initMap();
  expect(M.findEntryByPredicate(m, v => v.size === 100)).toEqual([ `Alice`, { name: `Alice`, size: 100 } ]);
});

test(`findEntryByValue`, () => {
  const m = initMap();
  expect(M.findEntryByValue(m, { name: `Alice`, size: 100 }, isEqualValueDefault)).toEqual([ `Alice`, { name: `Alice`, size: 100 } ]);
});

test(`fromIterable`, () => {
  const data = [
    { fruit: `granny-smith`, family: `apple`, colour: `green` },
    { fruit: `mango`, family: `stone-fruit`, colour: `orange` },
    { fruit: `apricot`, family: `stone-fruit`, colour: `orange` },
    { fruit: `granny-smith`, family: `apple`, colour: `red` },
  ];

  // Overwrite
  const m1 = M.fromIterable(data, v => v.fruit, `overwrite`);
  expect(m1.get(`granny-smith`)).toEqual({ fruit: `granny-smith`, family: `apple`, colour: `red` });
  expect(m1.get(`Mango`)).toBeFalsy();

  // Skip
  const m2 = M.fromIterable(data, v => v.fruit, `skip`);
  expect(m2.get(`granny-smith`)).toEqual({ fruit: `granny-smith`, family: `apple`, colour: `green` });

  // Throw
  expect(() => M.fromIterable(data, v => v.fruit, `throw`)).toThrow();
});

test(`fromObject`, () => {
  const data = {
    Sally: { name: `Sally`, colour: `red` },
    Bob: { name: `Bob`, colour: `pink` }
  };
  const map = M.fromObject(data);
  expect(map.get(`Sally`)).toEqual({ name: `Sally`, colour: `red` });
});

test(`getClosestIntegerKey`, () => {
  const m1 = new Map<number, string>();
  m1.set(1, "one");
  m1.set(2, "two");
  m1.set(3, "three");
  m1.set(4, "four");

  expect(M.getClosestIntegerKey(m1, 3)).toBe(3);
  expect(M.getClosestIntegerKey(m1, 3.1)).toBe(3);
  expect(M.getClosestIntegerKey(m1, 3.5)).toBe(4);
  expect(M.getClosestIntegerKey(m1, 3.6)).toBe(4);
  expect(M.getClosestIntegerKey(m1, 100)).toBe(4);
  expect(M.getClosestIntegerKey(m1, -100)).toBe(1);
});

test(`findBySomeKey`, () => {
  const m1 = new Map<string, string>();
  m1.set("a.a", "a.a");
  m1.set("a.b", "a.b");
  m1.set("b.a", "b.a");
  m1.set("b.b", "b.b");
  m1.set("c.a", "c.a");
  expect(M.findBySomeKey(m1, [ `a.c`, `b.a` ])).toEqual("b.a");

});

test(`hasKeyValue`, () => {
  const m1 = initMap();
  const v = m1.get(`Bob`);
  expect(M.hasKeyValue(m1, `Bob`, v)).toBeTruthy();

  expect(M.hasKeyValue(m1, `Bob`, { name: `Bob`, size: 10 }, isEqualValueDefault)).toBeTruthy();
  expect(M.hasKeyValue(m1, `Bob`, { name: `Bob`, size: 11 }, isEqualValueDefault)).toBeFalsy();
  expect(M.hasKeyValue(m1, `Bob`, { name: `BoB`, size: 10 }, isEqualValueDefault)).toBeFalsy();

  const compareName = (a, b) => a.name === b.name;
  expect(M.hasKeyValue(m1, `Bob`, { name: `Bob`, size: 10 }, compareName)).toBeTruthy();
  expect(M.hasKeyValue(m1, `Bob`, { name: `Bob`, size: 11 }, compareName)).toBeTruthy();
  expect(M.hasKeyValue(m1, `Bob`, { name: `BoB`, size: 10 }, compareName)).toBeFalsy();


});

test(`mapToArray`, () => {
  const m1 = initMap();
  expect(M.mapToArray(m1, (key, v) => v.size)).toEqual([ 10, 100, 1 ]);
  expect(M.mapToArray(m1, (key, v) => ({ ...v, name: v.name.toUpperCase() }))).toEqual([
    { name: `BOB`, size: 10 },
    { name: `ALICE`, size: 100 },
    { name: `CHARLIE`, size: 1 }
  ]);

});

test(`mergeByKey`, () => {
  const mA = new Map([ [ 1, `A-1` ], [ 2, `A-2` ], [ 3, `A-3` ] ]);
  const mB = new Map([ [ 1, `B-1` ], [ 2, `B-2` ], [ 4, `B-4` ] ]);
  const reconcile = (a: string, b: string) => b.replace(`-`, `!`);
  const output = M.mergeByKey(reconcile, mA, mB).entries().toArray();
  expect(output).toEqual([
    [ 1, `B!1` ], [ 2, `B!2` ], [ 3, `A-3` ], [ 4, `B-4` ]
  ]);
});

// test(`addKeepExisting`, () => {
//   const m = new Map<string, { name: string, size: number }>();
//   const hasher = v => v.name;

//   m.set(`Bob`, { name: `Bob`, size: 10 });
//   m.set(`Alice`, { name: `Alice`, size: 100 });
//   m.set(`Charlie`, { name: `Charlie`, size: 1 });
//   expect(M.addKeepingExisting(m, hasher,
//     { name: `Bob`, size: 10 },
//     { name: `Jane`, size: 11 }
//   ).entries().toArray()).toEqual([
//     [ "Bob", { name: `Bob`, size: 10 } ],
//     [ "Alice", { name: `Alice`, size: 100 } ],
//     [ "Charlie", { name: `Charlie`, size: 1 } ],
//     [ "Jane", { name: `Jane`, size: 11 } ]
//   ])
// });

test(`addValueMutate`, () => {
  const hasher = v => v.name;

  // Overwrite
  let m = initMap();
  const m1 = M.addValueMutate(m, hasher, `overwrite`, { name: `Charlie`, size: 2 }, { name: `Jane`, size: 9 });
  expect(m.get(`Charlie`)).toStrictEqual({ name: `Charlie`, size: 2 });
  expect(m.get(`Jane`)).toStrictEqual({ name: `Jane`, size: 9 });
  expect(m1).toBe(m);

  // Skip
  m = initMap();
  const m2 = M.addValueMutate(m, hasher, `skip`, { name: `Charlie`, size: 2 }, { name: `Jane`, size: 9 });
  expect(m.get(`Charlie`)).toStrictEqual({ name: `Charlie`, size: 1 });
  expect(m.get(`Jane`)).toStrictEqual({ name: `Jane`, size: 9 });
  expect(m2).toBe(m);

  // Throw
  m = initMap();
  expect(() => M.addValueMutate(m, hasher, `throw`, { name: `Charlie`, size: 2 }, { name: `Jane`, size: 9 })).toThrow();
  expect(m.has(`Jane`)).toBeFalsy();

});

const initMap = () => {
  const m = new Map<string, { name: string, size: number }>();

  m.set(`Bob`, { name: `Bob`, size: 10 });
  m.set(`Alice`, { name: `Alice`, size: 100 });
  m.set(`Charlie`, { name: `Charlie`, size: 1 });
  return m;
}


test(`deleteByValueCompareMutate`, () => {
  const compByName = (a, b) => a.name === b.name;

  let m = initMap();
  M.deleteByValueCompareMutate(m, { name: `Charlie`, size: 1 }, compByName);
  M.deleteByValueCompareMutate(m, { name: `Alice`, size: 101 }, compByName);
  expect(m.has(`Charlie`)).toBeFalsy();
  expect(m.has(`Alice`)).toBeFalsy();

  m = initMap();
  M.deleteByValueCompareMutate(m, { name: `Charlie`, size: 1 }, isEqualValueDefault);
  M.deleteByValueCompareMutate(m, { name: `Alice`, size: 101 }, isEqualValueDefault);
  expect(m.has(`Charlie`)).toBeFalsy();
  expect(m.has(`Alice`)).toBeTruthy();

});

test(`filterValues`, () => {
  const m = initMap();
  expect([ ...M.filterValues(m, v => v.size >= 10) ]).toEqual(
    [ { name: `Bob`, size: 10 }, { name: `Alice`, size: 100 } ]
  );
});

test(`findValue`, () => {
  const m = initMap();
  expect(M.findValue(m, v => v.size > 10)).toEqual({ name: `Alice`, size: 100 });
})

test(`addValue`, () => {
  const hasher = v => v.name;

  let m = initMap();
  const m1 = M.addValue(m, hasher, `overwrite`, { name: `Charlie`, size: 2 }, { name: `Jane`, size: 9 });
  expect(m1.get(`Charlie`)).toStrictEqual({ name: `Charlie`, size: 2 });
  expect(m1.get(`Jane`)).toStrictEqual({ name: `Jane`, size: 9 });
  expect(m.get(`Charlie`)).toStrictEqual({ name: `Charlie`, size: 1 });
  expect(m.get(`Jane`)).toBeFalsy();
  expect(m1).not.toBe(m);

  m = initMap();
  const m2 = M.addValue(m, hasher, `skip`, { name: `Charlie`, size: 2 }, { name: `Jane`, size: 9 });
  expect(m2.get(`Charlie`)).toStrictEqual({ name: `Charlie`, size: 1 });
  expect(m2.get(`Jane`)).toStrictEqual({ name: `Jane`, size: 9 });
  expect(m.get(`Jane`)).toBeFalsy();
  expect(m2).not.toBe(m);

  m = initMap();
  expect(() => M.addValueMutate(m, hasher, `throw`, { name: `Charlie`, size: 2 }, { name: `Jane`, size: 9 })).toThrow();
  expect(m.has(`Jane`)).toBeFalsy();
})