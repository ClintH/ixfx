import { describe, test, expect } from 'vitest';
import { MassiveSet } from '../src/set/massive-set.js';

const doAdds = (s: MassiveSet) => {
  s.add(`a`);
  s.add(`abc`);
  s.add(`abcd`);
  s.add(`acd`);
  s.add(`b123`);
  s.add(`c123`);
  s.add(`c1234`);
  s.add(`d`);
}

const checkAdds = (s: MassiveSet) => {
  expect(s.has(`a`)).toBe(true);
  expect(s.has(`abc`)).toBe(true);
  expect(s.has(`abcd`)).toBe(true);
  expect(s.has(`acd`)).toBe(true);
  expect(s.has(`b123`)).toBe(true);
  expect(s.has(`c123`)).toBe(true);
  expect(s.has(`c1234`)).toBe(true);
  expect(s.has(`d`)).toBe(true);

  // @ts-expect-error
  expect(s.has(undefined)).toBe(false);
  // @ts-expect-error
  expect(s.has(null)).toBe(false);

  expect(s.has(`ace`)).toBe(false);
  expect(s.has(`z`)).toBe(false);
}

describe('massive-set', async () => {
  test(`depth-2`, () => {
    const s = new MassiveSet(2);
    doAdds(s);
    expect(s.sizeLocal()).toBe(0);
    expect(s.size()).toBe(8);
    expect(s.sizeChildren()).toBe(4);
    expect(s.sizeChildrenDeep()).toBe(8);
    checkAdds(s);

    expect(s.remove(`abc`)).toBe(true);
    expect(s.has(`abc`)).toBe(false);
    expect(s.remove(`notfound`)).toBe(false);
  });

  test(`depth-1`, () => {
    const s = new MassiveSet(1);
    doAdds(s);
    expect(s.sizeLocal()).toBe(0);
    expect(s.size()).toBe(8);
    expect(s.sizeChildren()).toBe(4);
    expect(s.sizeChildrenDeep()).toBe(4);
    checkAdds(s);

    expect(s.remove(`abc`)).toBe(true);
    expect(s.has(`abc`)).toBe(false);
    expect(s.remove(`notfound`)).toBe(false);
  });

  test(`depth-0`, () => {
    const s = new MassiveSet(0);
    doAdds(s);
    expect(s.size()).toBe(8);
    expect(s.sizeLocal()).toBe(8);
    expect(s.sizeChildren()).toBe(0);
    expect(s.sizeChildrenDeep()).toBe(0);
    checkAdds(s);

    expect(s.remove(`abc`)).toBe(true);
    expect(s.has(`abc`)).toBe(false);
    expect(s.remove(`notfound`)).toBe(false);
  });

})