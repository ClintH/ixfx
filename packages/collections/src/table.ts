import { resultIsError, type Result } from "@ixfx/guards";
import type { TableRow, TableValue } from "./types.js";


/**
 * Stores values in a table of rows (vertical) and columns (horizontal)
 */
export class Table<V> {
  rows: TableRow<V>[] = [];
  rowLabels: string[] = [];
  colLabels: string[] = [];
  /**
   * Keep track of widest row
   */
  columnMaxLength = 0;

  /**
   * Gets the label for a given column index,
   * returning _undefined_ if not found.
   * 
   * Case-sensitive
   * @param label Label to seek
   * @returns Index of column, or _undefined_ if not found
   */
  getColumnLabelIndex(label: string): number | undefined {
    for (const [ index, l ] of this.colLabels.entries()) {
      if (l === label) return index;
    }
  }

  /**
   * Gets the label for a given row index,
   * returning _undefined_ if not found.
   * 
   * Case-sensitive
   * @param label Label to seek
   * @returns Index of row, or _undefined_ if not found
   */
  getRowLabelIndex(label: string): number | undefined {
    for (const [ index, l ] of this.rowLabels.entries()) {
      if (l === label) return index;
    }
  }
  /**
   * Dumps the values of the table to the console
   */
  print(): void {
    console.table([ ...this.rowsWithLabelsObject() ]);
  }



  /**
   * Return a copy of table as nested array
   * 
   * ```js
   * const t = new Table();
   * // add stuff
   * // ...
   * const m = t.asArray();
   * for (const row of m) {
   *  for (const colValue of row) {
   *    // iterate over all column values for this row
   *  }
   * }
   * ```
   * 
   * Alternative: get value at row Y and column X
   * ```js
   * const value = m[y][x];
   * ```
   * @returns 
   */
  asArray(): (V | undefined)[][] {
    const r: (V | undefined)[][] = [];
    for (const row of this.rows) {
      if (row === undefined) r.push([]);
      else r.push([ ...row ]);
    }
    return r;
  }

  /**
   * Return the number of rows
   */
  get rowCount(): number {
    return this.rows.length;
  }

  /**
   * Return the maximum number of columns in any row
   */
  get columnCount(): number {
    return this.columnMaxLength;
    // const lengths = this.rows.map(row => row.length);
    // return Math.max(...lengths);
  }

  /**
   * Iterates over the table row-wise, in object format.
   * @see {@link rowsWithLabelsArray} to get rows in array format
   */
  *rowsWithLabelsObject(): Generator<object | undefined, void, unknown> {
    for (let index = 0; index < this.rows.length; index++) {
      const labelledRow = this.getRowWithLabelsObject(index);
      yield labelledRow;
    }
  }

  /**
   * Iterates over each row, including the labels if available
   * @see {@link rowsWithLabelsObject} to get rows in object format
   */
  *rowsWithLabelsArray(): Generator<[ label: string | undefined, value: V | undefined ][] | undefined, void, unknown> {
    for (let index = 0; index < this.rows.length; index++) {
      const labelledRow = this.getRowWithLabelsArray(index);
      yield labelledRow;
    }
  }

  /**
   * Assign labels to columns
   * @param labels 
   */
  labelColumns(...labels: string[]): void {
    this.colLabels = labels;
  }

  /**
   * Assign label to a specific column
   * First column has an index of 0
   * @param columnIndex 
   * @param label 
   */
  labelColumn(columnIndex: number, label: string): void {
    this.colLabels[ columnIndex ] = label;
  }

  /**
   * Label rows
   * @param labels Labels 
   */
  labelRows(...labels: string[]): void {
    this.rowLabels = labels;
  }

  /**
   * Assign label to a specific row
   * First row has an index of 0
   * @param rowIndex 
   * @param label 
   */
  labelRow(rowIndex: number, label: string): void {
    this.rowLabels[ rowIndex ] = label;
  }

  /**
   * Adds a new row
   * @param data Columns
   */
  appendRow(...data: TableValue<V>[]): TableRow<V> {
    this.columnMaxLength = Math.max(this.columnMaxLength, data.length);
    this.rows.push(data);
    return data;
  }

  /**
   * Gets a row along with labels, as an array
   * @param rowIndex 
   * @returns 
   */
  getRowWithLabelsArray(rowIndex: number): [ label: string | undefined, value: V | undefined ][] | undefined {
    const row = this.rows.at(rowIndex);
    if (row === undefined) return undefined;
    return row.map((value, index) => [ this.colLabels.at(index), value ]);
  }

  /**
   * Return a row of objects. Keys use the column labels.
   * 
   * ```js
   * const row = table.getRowWithLabelsObject(10);
   * // eg:
   * // [{ colour: red, size: 10}, { colour: blue, size: 20 }]
   * ```
   * @param rowIndex 
   * @returns 
   */
  getRowWithLabelsObject(rowIndex: number): object | undefined {
    const row = this.rows.at(rowIndex);
    if (row === undefined) return undefined;
    const object = {};
    for (let index = 0; index < this.colLabels.length; index++) {
      const label = this.colLabels.at(index) ?? index.toString();
      (object as Record<string, any>)[ label ] = row[ index ];
    }
    return object;
  }

  /**
   * Gets or creates a row at given position
   * @param row Index or label of row 
   * @returns 
   */
  #getOrCreateRawRow(row: number | string): Result<
    TableRow<V>,
    `row-label-notfound` | `row-index-invalid`> {
    const index = typeof row === `number` ? row : this.getRowLabelIndex(row);
    // Couldn't lookup label
    if (index === undefined) return { success: false, error: `row-label-notfound` };

    // Bad index
    if (index < 0) return { success: false, error: `row-index-invalid` }

    // Within existing set of rows
    if (index < this.rows.length) {
      return { success: true, value: this.rows[ index ] };
    }

    const newRow: TableRow<V> = [];
    this.rows[ index ] = newRow;

    return { success: true, value: newRow };
  }

  /**
   * Gets a copy of values at given row, specified by index or label
   * @param row 
   * @returns Returns row or throws an error if label or index not found 
   */
  row(row: number | string): readonly (V | undefined)[] | undefined {
    const r = this.#getRowRaw(row);
    if (resultIsError(r)) {
      throw new Error(r.error);
    }
    return [ ...r.value ]
  }

  /**
   * Set the value of row,columm.
   * Row is created if it doesn't exist, with the other column values being _undefined_
   * @param row Index or label 
   * @param column Column 
   * @param value Value to set at row,column
   */
  set(row: number | string, column: number | string, value: V | undefined): void {
    const result = this.#getOrCreateRawRow(row);
    if (resultIsError(result)) throw new Error(result.error);

    // Have an array that corresponds to row
    const r = result.value;
    const columnIndex = typeof column === `number` ? column : this.getColumnLabelIndex(column);
    if (typeof columnIndex === `undefined`) throw new Error(`Column label '${ column }' not found or is invalid`);

    if (columnIndex < 0) throw new Error(`Column index invalid (less than zero)`);

    // Already have needed columns
    r[ columnIndex ] = value;
  }

  /**
   * Gets the value at a specified row and column.
   * Throws an error if coordinates are out of range or missing.
   * @param row Row index or label
   * @param column Column index or label
   * @returns 
   */
  get(row: number | string, column: number | string): TableValue<V> {
    const rowR = this.#getRowRaw(row);
    if (resultIsError(rowR)) throw new Error(rowR.error);

    const colR = this.#getColumnRaw(rowR.value, column);
    if (resultIsError(colR)) throw new Error(colR.error);

    return colR.value.value;
  }

  #getRowRaw(row: number | string): Result<TableRow<V>, `row-label-notfound` | `row-invalid` | `row-index-out-of-range`> {
    let index: number | undefined = 0;
    if (typeof row === `number`) {
      index = row;
    } else {
      index = this.getRowLabelIndex(row);
      if (typeof index !== `number`) return { error: `row-label-notfound`, success: false };
    }
    if (typeof index !== `number`) return { error: `row-invalid`, success: false };

    if (index < 0 || index >= this.rows.length) return { error: `row-index-out-of-range`, success: false };
    return { success: true, value: this.rows[ index ] };
  }

  #getColumnRaw(row: TableRow<V>, column: number | string): Result<{ index: number, value: V | undefined }, `col-label-notfound` | `col-index-out-of-range`> {
    const colIndex = typeof column === `number` ? column : this.getColumnLabelIndex(column);
    if (typeof colIndex !== `number`) return { success: false, error: `col-label-notfound` };
    if (colIndex < 0 || colIndex >= row.length) return { success: false, error: `col-index-out-of-range` };
    return {
      success: true, value: { index: colIndex, value: row[ colIndex ] }
    };
  }

  /**
   * Set all the columns of a row to a specified value.
   *
   * By default, sets the number of columns corresponding to
   * the table's maximum column length. To set an arbitrary
   * length of the row, use `length`
   * @param row Index or label of row
   * @param length How wide the row is. If unset, uses the current maximum width of rows.
   * @param value Value to set
   */
  setRow(row: number | string, value: V | undefined, length?: number): TableRow<V> {
    // Get or create a row
    const rowResult = this.#getOrCreateRawRow(row);
    if (resultIsError(rowResult)) throw new Error(rowResult.error);

    // Set value within row
    const r = rowResult.value;
    const width = typeof length === `number` ? length : this.columnMaxLength;
    for (let columnNumber = 0; columnNumber < width; columnNumber++) {
      r[ columnNumber ] = value;
    }
    return r;
  }
}