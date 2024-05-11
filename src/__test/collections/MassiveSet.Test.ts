import { MassiveSet } from '../../collections/set/MassiveSet.js';
import test, { type ExecutionContext } from 'ava';

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

test(`depth-2`, t => {
  const s = new MassiveSet(2);
  doAdds(s);
  t.is(s.sizeLocal(), 0);
  t.is(s.size(), 8);
  t.is(s.sizeChildren(), 4);
  t.is(s.sizeChildrenDeep(), 8);
  checkAdds(s, t);

  t.true(s.remove(`abc`));
  t.false(s.has(`abc`));
  t.false(s.remove(`notfound`));
});

test(`depth-1`, t => {
  const s = new MassiveSet(1);
  doAdds(s);
  t.is(s.sizeLocal(), 0);
  t.is(s.size(), 8);
  t.is(s.sizeChildren(), 4);
  t.is(s.sizeChildrenDeep(), 4);
  checkAdds(s, t);

  t.true(s.remove(`abc`));
  t.false(s.has(`abc`));
  t.false(s.remove(`notfound`));
});

const checkAdds = (s: MassiveSet, t: ExecutionContext) => {
  t.true(s.has(`a`));
  t.true(s.has(`abc`), `fail abc`);
  t.true(s.has(`abcd`), `fail abcd`);
  t.true(s.has(`acd`), `fail acd`);
  t.true(s.has(`b123`), `fail b123`);
  t.true(s.has(`c123`), `fail c123`);
  t.true(s.has(`c1234`), `fail c1234`);
  t.true(s.has(`d`));

  // @ts-expect-error
  t.false(s.has(undefined));
  // @ts-expect-error
  t.false(s.has(null));

  t.false(s.has(`ace`), `fail ace`);
  t.false(s.has(`z`));
}

test(`depth-0`, t => {
  const s = new MassiveSet(0);
  doAdds(s);
  t.is(s.size(), 8);
  t.is(s.sizeLocal(), 8);
  t.is(s.sizeChildren(), 0);
  t.is(s.sizeChildrenDeep(), 0);
  checkAdds(s, t);

  t.true(s.remove(`abc`));
  t.false(s.has(`abc`));
  t.false(s.remove(`notfound`));
});

