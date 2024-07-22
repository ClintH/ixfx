import test from 'ava';
import { Table } from '../../collections/Table.js';
test(`table`, test => {
  const t = new Table<number>();
  t.appendRow(1, 2, 3);
  test.is(t.rowCount, 1);
  test.is(t.columnCount, 3);

  test.deepEqual(t.asArray(), [ [ 1, 2, 3 ] ]);

  t.appendRow(4, 5, 6);
  t.appendRow(7, 8, 9);
  test.is(t.rowCount, 3);
  test.is(t.columnCount, 3);

  t.set(1, 1, 0);
  test.deepEqual(t.asArray(), [
    [ 1, 2, 3 ],
    [ 4, 0, 6 ],
    [ 7, 8, 9 ]
  ]);

  t.set

});

test(`getRowWithLabelsObject`, test => {
  const t = new Table<number>();
  t.appendRow(1, 2, 3);
  t.appendRow(4, 5, 6);
  t.appendRow(7, 8, 9);
  t.labelColumns(`a`, `b`, `c`);

  const r1 = t.getRowWithLabelsArray(1);
  const r2 = t.getRowWithLabelsObject(1);

  test.deepEqual(r1, [
    [ `a`, 4 ], [ `b`, 5 ], [ `c`, 6 ]
  ]);

  test.deepEqual(r2,
    { a: 4, b: 5, c: 6 }
  );

  test.is(t.get(0, `b`), 2);
  test.throws(() => { t.get(0, `d`) });

});

test(`setCols`, test => {
  const t = new Table<string>();
  t.setRow(1, 5, `hello`);
  const arr = t.asArray();
  test.deepEqual(t.asArray(), [
    [],
    [ `hello`, `hello`, `hello`, `hello`, `hello` ]
  ]);
})