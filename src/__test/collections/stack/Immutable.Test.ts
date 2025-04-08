import expect from 'expect';
/* eslint-disable */
import { StackImmutable } from '../../../collections/stack/StackImmutable.js';
import { arrayValuesEqual } from '../../Include.js';

test(`enumeration`, () => {
  let s = new StackImmutable<string>();
  s = s.push(`a`);
  s = s.push(`b`);
  s = s.push(`c`); // C is on the top of the stack

  let result = '';
  s.forEach((v) => (result += v));
  expect(result).toBe(`abc`);

  result = '';
  s.forEachFromTop((v) => (result += v));
  expect(result).toBe(`cba`);
});

test(`basic`, () => {
  // Empty stack
  let aa = new StackImmutable<string>();
  expect(aa.isEmpty).toBe(true);
  expect(aa.isFull).toBe(false);
  expect(aa.peek).toBeFalsy();
  expect(() => aa.pop()).toThrow();
  aa = aa.push(`something`);
  expect(aa.isEmpty).toBeFalsy();
  expect(aa.isFull).toBeFalsy();

  // Unbounded Stack
  const a = new StackImmutable<string>();
  const b = a.push(`test`);
  let c = b;
  for (let i = 0; i < 15; i++) {
    c = c.push(`test` + i);
    expect(c.peek).toBe(`test` + i);
  }

  // Take two off and add two more
  const d = c.pop().pop().push(`new1`).push(`new2`);

  // Tests immutability and stack ordering
  expect(a.data.length === 0).toBe(true);
  arrayValuesEqual(t, b.data, [ `test` ]);
  arrayValuesEqual(t, c.data, [
    `test`,
    `test0`,
    `test1`,
    `test2`,
    `test3`,
    `test4`,
    `test5`,
    `test6`,
    `test7`,
    `test8`,
    `test9`,
    `test10`,
    `test11`,
    `test12`,
    `test13`,
    `test14`,
  ]);
  arrayValuesEqual(t, d.data, [
    `test`,
    `test0`,
    `test1`,
    `test2`,
    `test3`,
    `test4`,
    `test5`,
    `test6`,
    `test7`,
    `test8`,
    `test9`,
    `test10`,
    `test11`,
    `test12`,
    `new1`,
    `new2`,
  ]);

  expect(a.length).toBe(0);
  expect(b.length).toBe(1);
  expect(c.length).toBe(16);
  expect(d.length).toBe(16);

  expect(a.peek).toBeFalsy();
  expect(b.peek).toBe(`test`);
  expect(c.peek).toBe(`test14`);
  expect(d.peek).toBe(`new2`);
});

test(`bounded`, () => {
  // Test different overflow logic for bounded stacks
  // Discard additions: let something in
  let e = new StackImmutable<string>(
    { capacity: 3, discardPolicy: `additions` },
    [ `test0`, `test1` ]
  );
  e = e.push(`test2`, `test3`, `test4`); // Only test2 should make it in
  arrayValuesEqual(t, e.data, [ `test0`, `test1`, `test2` ]);

  // Discard additions: already full
  e = new StackImmutable<string>({ capacity: 3, discardPolicy: `additions` }, [
    `test0`,
    `test1`,
    `test2`,
  ]);
  e = e.push(`test3`, `test4`, `test5`); // Nothing can get in
  arrayValuesEqual(t, e.data, [ `test0`, `test1`, `test2` ]);

  // Discard additions: let everything in
  e = new StackImmutable<string>({ capacity: 6, discardPolicy: `additions` }, [
    `test0`,
    `test1`,
    `test2`,
  ]);
  e = e.push(`test3`, `test4`, `test5`);
  arrayValuesEqual(t, e.data, [
    `test0`,
    `test1`,
    `test2`,
    `test3`,
    `test4`,
    `test5`,
  ]);

  // Older items are discarded - partial flush
  let f = new StackImmutable<string>({ capacity: 4, discardPolicy: `older` }, [
    `test0`,
    `test1`,
    `test2`,
  ]);
  f = f.push(`test3`, `test4`, `test5`);
  arrayValuesEqual(t, f.data, [ `test2`, `test3`, `test4`, `test5` ]);

  // Older items are discarded - complete flush
  f = new StackImmutable<string>({ capacity: 4, discardPolicy: `older` }, [
    `test0`,
    `test1`,
    `test2`,
  ]);
  f = f.push(`test3`, `test4`, `test5`, `test6`, `test7`);
  arrayValuesEqual(t, f.data, [ `test4`, `test5`, `test6`, `test7` ]);

  // Older items are discarded  - exact flush
  f = new StackImmutable<string>({ capacity: 3, discardPolicy: `older` }, [
    `test0`,
    `test1`,
    `test2`,
  ]);
  f = f.push(`test3`, `test4`, `test5`);
  arrayValuesEqual(t, f.data, [ `test3`, `test4`, `test5` ]);

  // Newer items are discarded - partial flush
  f = new StackImmutable<string>({ capacity: 4, discardPolicy: `newer` }, [
    `test0`,
    `test1`,
    `test2`,
  ]);
  f = f.push(`test3`, `test4`, `test5`);
  arrayValuesEqual(t, f.data, [ `test0`, `test3`, `test4`, `test5` ]);

  // Newer items are discarded - complete flush
  f = new StackImmutable<string>({ capacity: 4, discardPolicy: `newer` }, [
    `test0`,
    `test1`,
    `test2`,
  ]);
  f = f.push(`test3`, `test4`, `test5`, `test6`, `test7`);
  arrayValuesEqual(t, f.data, [ `test4`, `test5`, `test6`, `test7` ]);

  // Newer items are discarded - exact flush
  f = new StackImmutable<string>({ capacity: 3, discardPolicy: `newer` }, [
    `test0`,
    `test1`,
    `test2`,
  ]);
  f = f.push(`test3`, `test4`, `test5`);
  arrayValuesEqual(t, f.data, [ `test3`, `test4`, `test5` ]);

  // New items are discarded - Full, add one extra item
  f = new StackImmutable<string>({ capacity: 3, discardPolicy: `newer` }, [
    `test0`,
    `test1`,
    `test2`,
  ]);
  f = f.push(`test3`);
  arrayValuesEqual(t, f.data, [ `test0`, `test1`, `test3` ]);
});
