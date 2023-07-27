import test from 'ava';
import { ofSimpleMutable } from '../../collections/map/MapOfSimpleMutable.js';

test('basic', (t) => {
  const m = ofSimpleMutable<string>();
  m.addKeyedValues('key-a', 'a', 'aa', 'aaa');
  m.addKeyedValues(`key-b`, `b`, `bb`, `bbb`);
  m.addKeyedValues(`key-c`, `c`, `cc`, `ccc`);

  const keysAndCounts = [...m.keysAndCounts()];
  t.true(keysAndCounts.length === 3);
  t.like(keysAndCounts, [
    [`key-a`, 3],
    [`key-b`, 3],
    [`key-c`, 3],
  ]);

  t.true(m.count(`key-a`) === 3);
  t.true(m.count(`key-b`) === 3);
  t.true(m.count(`key-c`) === 3);
  t.true(m.count(`key-z`) === 0);

  t.true(m.has(`key-a`));
  t.true(m.has(`key-b`));
  t.true(m.has(`key-c`));
  t.false(m.has(`key-z`));

  t.true(m.hasKeyValue(`key-a`, `a`));
  t.true(m.hasKeyValue(`key-a`, `aa`));
  t.true(m.hasKeyValue(`key-a`, `aaa`));

  t.false(m.hasKeyValue(`key-a`, `z`));
  t.false(m.hasKeyValue(`key-z`, `a`));
  t.false(m.hasKeyValue(`key-a`, ``));

  // @ts-ignore
  t.false(m.hasKeyValue(`key-a`, undefined));

  const valuesA = [...m.get(`key-a`)];
  const valuesB = [...m.get(`key-b`)];
  const valuesC = [...m.get(`key-c`)];
  t.like(valuesA, [`a`, `aa`, `aaa`]);
  t.like(valuesB, [`b`, `bb`, `bbb`]);
  t.like(valuesC, [`c`, `cc`, `ccc`]);
  t.true([...m.get(`keys-z`)].length === 0);

  t.true(m.delete(`key-b`));
  t.true(m.has(`key-a`));
  t.false(m.has(`key-b`));
  t.true(m.has(`key-c`));
  t.true(m.count(`key-b`) === 0);
  t.true([...m.get(`key-b`)].length === 0);

  m.clear();
  t.true([...m.keysAndCounts()].length === 0);

  t.pass();
});

test('entries', (t) => {
  const m = ofSimpleMutable<string>();
  m.addKeyedValues('key-a', 'a', 'aa');
  m.addKeyedValues(`key-b`, `b`, `bb`);
  m.addKeyedValues(`key-c`, `c`, `cc`);

  const entries = [...m.entriesFlat()];
  t.like(entries, [
    [`key-a`, `a`],
    [`key-a`, `aa`],
    [`key-b`, `b`],
    [`key-b`, `bb`],
    [`key-c`, `c`],
    [`key-c`, `cc`],
  ]);
  t.pass();
});
