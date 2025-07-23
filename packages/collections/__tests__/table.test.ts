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


});

const initTable = (): Table<string> => {
  const t = new Table<string>();
  t.appendRow(`a-a`, `a-b`, `a-c`, `a-d`);
  t.appendRow(`b-a`, `b-b`, `b-c`, `b-d`);
  t.appendRow(`c-a`, `c-b`, `c-c`, `c-d`);
  t.appendRow(`d-a`, `d-b`, `d-c`, `d-d`);
  t.appendRow(`e-a`, `e-b`, `e-c`, `e-d`);
  return t;
}

const initLabelledTabled = (): Table<string> => {
  const t = initTable();
  t.labelRows(`row-a`, `row-b`, `row-c`, `row-d`, `row-e`);
  t.labelColumns(`col-a`, `col-b`, `col-c`, `col-d`, `col-e`);
  return t;
}

test(`get`, () => {
  const t = initLabelledTabled();
  expect(t.getColumnLabelIndex(`col-c`)).toBe(2);
  expect(t.getRowLabelIndex(`row-c`)).toBe(2);

  expect(t.row(`row-b`)).toStrictEqual([ `b-a`, `b-b`, `b-c`, `b-d` ]);


  expect(t.get(`row-c`, `col-d`)).toBe(`c-d`);
  expect(() => t.get(`row-a`, `col-missing`)).toThrowError();
  expect(() => t.get(`row-missing`, `col-a`)).toThrowError();

  expect(t.get(0, 0)).toBe(`a-a`);
  expect(t.get(2, 2)).toBe(`c-c`);


  expect(() => t.get(-1, 1)).toThrowError();
  expect(() => t.get(1, -1)).toThrowError();


});

test(`immutability`, () => {
  const t = initTable();
  const r1 = t.row(1);
  expect(r1).not.toBeUndefined();
  if (typeof r1 !== `undefined`) {
    for (let index = 0; index < r1.length; index++) {
      // @ts-expect-error asdfasf  asdf 
      r1[ index ] = `xx`;
    }
    expect(t.get(1, 1)).toBe(`b-b`);
  }
});

test(`adding-rows`, () => {
  const t = new Table<string>();
  t.set(5, 5, `a`);
  expect(t.get(5, 5)).toEqual(`a`);
  expect(t.asArray()).toEqual([
    [], // 0
    [], // 1
    [], // 2
    [], // 3
    [], // 4
    [ undefined, undefined, undefined, undefined, undefined, `a` ], // 5
  ])
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

test(`setRow`, () => {
  const t = new Table<string>();
  t.setRow(1, `hello`, 5);
  expect(t.asArray()).toStrictEqual([
    [],
    [ `hello`, `hello`, `hello`, `hello`, `hello` ]
  ]);
})