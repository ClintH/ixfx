
export class Table<V> {
  rows: Array<Array<V | undefined>> = [];
  rowLabels: Array<string> = [];
  colLabels: Array<string> = [];

  labelColumns(...labels: Array<string>) {
    this.colLabels = labels;
  }

  labelColumn(columnNumber: number, label: string) {
    this.colLabels[ columnNumber ] = label;
  }

  getColumnLabelIndex(label: string): number | undefined {
    for (const [ index, l ] of this.colLabels.entries()) {
      if (l === label) return index;
    }
  }

  print() {
    console.table([ ...this.rowsWithLabelsObject() ]);
  }

  *rowsWithLabelsArray() {
    for (let index = 0; index < this.rows.length; index++) {
      const labelledRow = this.getRowWithLabelsArray(index);
      yield labelledRow;
    }
  }

  /**
   * Return a copy of table as nested array
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
  asArray(): Array<Array<V | undefined>> {
    const r: Array<Array<V | undefined>> = [];
    for (const row of this.rows) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (row === undefined) r.push([]);
      else r.push([ ...row ]);
    }
    return r;
  }

  /**
   * Return the number of rows
   */
  get rowCount() {
    return this.rows.length;
  }

  /**
   * Return the maximum number of columns in any row
   */
  get columnCount() {
    const lengths = this.rows.map(row => row.length);
    return Math.max(...lengths);
  }

  *rowsWithLabelsObject() {
    for (let index = 0; index < this.rows.length; index++) {
      const labelledRow = this.getRowWithLabelsObject(index);
      yield labelledRow;
    }
  }

  labelRows(...labels: Array<string>) {
    this.rowLabels = labels;
  }

  appendRow(...data: Array<V | undefined>) {
    this.rows.push(data);
  }

  getRowWithLabelsArray(rowNumber: number): Array<[ label: string | undefined, value: V | undefined ]> | undefined {
    const row = this.rows.at(rowNumber);
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
   * @param rowNumber 
   * @returns 
   */
  getRowWithLabelsObject(rowNumber: number): object | undefined {
    const row = this.rows.at(rowNumber);
    if (row === undefined) return undefined;
    const object = {};
    for (let index = 0; index < this.colLabels.length; index++) {
      const label = this.colLabels.at(index) ?? index.toString();
      // @ts-expect-error
      object[ label ] = row[ index ];
    }
    return object;
  }

  /**
   * Gets or creates a row at `rowNumber`.
   * @param rowNumber 
   * @returns 
   */
  private getOrCreateRow(rowNumber: number): Array<V | undefined> {
    let row = this.rows.at(rowNumber);
    if (row === undefined) {
      row = [];
      this.rows[ rowNumber ] = row;
    }
    return row;
  }

  /**
   * Gets the values at `rowNumber`
   * @param rowNumber 
   * @returns 
   */
  row(rowNumber: number): Array<V | undefined> | undefined {
    return this.rows.at(rowNumber);
  }

  /**
   * Set the value of row,column to `value`
   * @param rowNumber 
   * @param columnNumber 
   * @param value 
   */
  set(rowNumber: number, columnNumber: number, value: V | undefined) {
    const row = this.getOrCreateRow(rowNumber);
    row[ columnNumber ] = value;
  }

  get(rowNumber: number, column: number | string) {
    const row = this.getOrCreateRow(rowNumber);
    const index = typeof column === `number` ? column : this.getColumnLabelIndex(column);
    if (index === undefined) throw new Error(`Column not found: ${ column }`);
    return row[ index ];
  }

  /**
   * For a given row number, set all the columns to `value`.
   * `cols` gives the number of columns to set
   * @param rowNumber 
   * @param cols 
   * @param value 
   */
  setRow(rowNumber: number, cols: number, value: V | undefined) {
    const row = this.getOrCreateRow(rowNumber);
    for (let columnNumber = 0; columnNumber < cols; columnNumber++) {
      row[ columnNumber ] = value;
    }
  }
}