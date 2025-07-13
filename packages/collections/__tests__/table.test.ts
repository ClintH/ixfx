import { expect, test } from 'vitest';
import { Table } from '../src/table.js';
test(`table`, () => {
  const t = new Table<number>();
  t.appendRow(1, 2, 3);
  expect(t.rowCount).toBe(1);
  expect(t.columnCount).toBe(3);

  expect(t.asArray()).toEqual([ [ 1, 2, 3 ] ]);

  t.appendRow(4, 5, 6);
  t.appendRow(7, 8, 9);
  expect(t.rowCount).toBe(3);
  expect(t.columnCount).toBe(3);

  t.set(1, 1, 0);
  expect(t.asArray()).toEqual([
    [ 1, 2, 3 ],
    [ 4, 0, 6 ],
    [ 7, 8, 9 ]
  ]);

  t.set

});

test(`getRowWithLabelsObject`, () => {
  const t = new Table<number>();
  t.appendRow(1, 2, 3);
  t.appendRow(4, 5, 6);
  t.appendRow(7, 8, 9);
  t.labelColumns(`a`, `b`, `c`);

  const r1 = t.getRowWithLabelsArray(1);
  const r2 = t.getRowWithLabelsObject(1);

  expect(r1).toEqual([
    [ `a`, 4 ], [ `b`, 5 ], [ `c`, 6 ]
  ]);

  expect(r2).toEqual({ a: 4, b: 5, c: 6 });

  expect(t.get(0, `b`)).toBe(2);
  expect(() => { t.get(0, `d`) }).toThrow();

});

test(`setCols`, () => {
  const t = new Table<string>();
  t.setRow(1, 5, `hello`);
  const arr = t.asArray();
  expect(t.asArray()).toEqual([
    [],
    [ `hello`, `hello`, `hello`, `hello`, `hello` ]
  ]);
})