/* eslint-disable */

import {stack, OverflowPolicy as StackOverflowPolicy} from '../../collections/Stack.js';

describe(`stack`, () => {

  test(`enumeration`, () => {
    let s = stack<string>();
    s = s.push(`a`);
    s = s.push(`b`);
    s = s.push(`c`); // C is on the top of the stack

    let result = '';
    s.forEach(v => result += v);
    expect(result).toEqual(`abc`);

    result = '';
    s.forEachFromTop(v => result += v);
    expect(result).toEqual(`cba`);
  });

  test(`basic`, () => {
    // Empty stack 
    let aa = stack<string>();
    expect(aa.isEmpty).toBeTruthy();
    expect(aa.isFull).toBeFalsy();
    expect(aa.peek).toBeUndefined();
    expect(() => aa.pop()).toThrowError();
    aa = aa.push(`something`);
    expect(aa.isEmpty).toBeFalsy();
    expect(aa.isFull).toBeFalsy();

    // Unbounded Stack
    const a = stack<string>();
    const b = a.push(`test`);
    let c = b;
    for (let i = 0; i < 15; i++) {
      c = c.push(`test` + i);
      expect(c.peek).toEqual(`test` + i);
    }

    // Take two off and add two more
    const d = c.pop().pop().push(`new1`).push(`new2`);

    // Tests immutability and stack ordering
    expect(a.data).toEqual([]);
    expect(b.data).toEqual([`test`]);
    expect(c.data).toEqual([`test`, `test0`, `test1`, `test2`, `test3`, `test4`, `test5`, `test6`, `test7`, `test8`, `test9`, `test10`, `test11`, `test12`, `test13`, `test14`]);
    expect(d.data).toEqual([`test`, `test0`, `test1`, `test2`, `test3`, `test4`, `test5`, `test6`, `test7`, `test8`, `test9`, `test10`, `test11`, `test12`, `new1`, `new2`]);

    expect(a.length).toEqual(0);
    expect(b.length).toEqual(1);
    expect(c.length).toEqual(16);
    expect(d.length).toEqual(16);

    expect(a.peek).toBeUndefined();
    expect(b.peek).toEqual(`test`);
    expect(c.peek).toEqual(`test14`);
    expect(d.peek).toEqual(`new2`);
  });

  test(`bounded`, () => {
    // Test different overflow logic for bounded stacks
    // Discard additions: let something in
    let e = stack<string>({capacity: 3, overflowPolicy: StackOverflowPolicy.DiscardAdditions}, `test0`, `test1`);
    e = e.push(`test2`, `test3`, `test4`); // Only test2 should make it in
    expect(e.data).toEqual([`test0`, `test1`, `test2`]);

    // Discard additions: already full
    e = stack<string>({capacity: 3, overflowPolicy: StackOverflowPolicy.DiscardAdditions}, `test0`, `test1`, `test2`);
    e = e.push(`test3`, `test4`, `test5`); // Nothing can get in
    expect(e.data).toEqual([`test0`, `test1`, `test2`]);

    // Discard additions: let everything in 
    e = stack<string>({capacity: 6, overflowPolicy: StackOverflowPolicy.DiscardAdditions}, `test0`, `test1`, `test2`);
    e = e.push(`test3`, `test4`, `test5`);
    expect(e.data).toEqual([`test0`, `test1`, `test2`, `test3`, `test4`, `test5`]);

    // Older items are discarded - partial flush
    let f = stack<string>({capacity: 4, overflowPolicy: StackOverflowPolicy.DiscardOlder}, `test0`, `test1`, `test2`);
    f = f.push(`test3`, `test4`, `test5`);
    expect(f.data).toEqual([`test2`, `test3`, `test4`, `test5`]);

    // Older items are discarded - complete flush
    f = stack<string>({capacity: 4, overflowPolicy: StackOverflowPolicy.DiscardOlder}, `test0`, `test1`, `test2`);
    f = f.push(`test3`, `test4`, `test5`, `test6`, `test7`);
    expect(f.data).toEqual([`test4`, `test5`, `test6`, `test7`]);

    // Older items are discarded  - exact flush
    f = stack<string>({capacity: 3, overflowPolicy: StackOverflowPolicy.DiscardOlder}, `test0`, `test1`, `test2`);
    f = f.push(`test3`, `test4`, `test5`);
    expect(f.data).toEqual([`test3`, `test4`, `test5`]);

    // Newer items are discarded - partial flush
    f = stack<string>({capacity: 4, overflowPolicy: StackOverflowPolicy.DiscardNewer}, `test0`, `test1`, `test2`);
    f = f.push(`test3`, `test4`, `test5`);
    expect(f.data).toEqual([`test0`, `test3`, `test4`, `test5`]);

    // Newer items are discarded - complete flush
    f = stack<string>({capacity: 4, overflowPolicy: StackOverflowPolicy.DiscardNewer}, `test0`, `test1`, `test2`);
    f = f.push(`test3`, `test4`, `test5`, `test6`, `test7`);
    expect(f.data).toEqual([`test4`, `test5`, `test6`, `test7`]);

    // Newer items are discarded - exact flush
    f = stack<string>({capacity: 3, overflowPolicy: StackOverflowPolicy.DiscardNewer}, `test0`, `test1`, `test2`);
    f = f.push(`test3`, `test4`, `test5`);
    expect(f.data).toEqual([`test3`, `test4`, `test5`]);
  });

});