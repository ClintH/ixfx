
export class Table<V> {
  rows: Array<Array<V | undefined>> = [];
  rowLabels: Array<string> = [];
  colLabels: Array<string> = [];

  labelColumns(labels: Array<string>) {
    this.colLabels = labels;
  }

  labelColumn(columnNumber: number, label: string) {
    this.colLabels[ columnNumber ] = label;
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

  *rowsWithLabelsObject() {
    for (let index = 0; index < this.rows.length; index++) {
      const labelledRow = this.getRowWithLabelsObject(index);
      yield labelledRow;
    }
  }
  labelRows(labels: Array<string>) {
    this.rowLabels = labels;
  }

  appendRow(data: Array<V | undefined>) {
    this.rows.push(data);
  }

  getRowWithLabelsArray(rowNumber: number): Array<[ label: string | undefined, value: V | undefined ]> | undefined {
    const row = this.rows.at(rowNumber);
    if (row === undefined) return undefined;
    return row.map((value, index) => [ this.colLabels.at(index), value ]);
  }

  getRowWithLabelsObject(rowNumber: number): object | undefined {
    const row = this.rows.at(rowNumber);
    if (row === undefined) return undefined;
    const object = {};
    for (let index = 0; index < this.colLabels.length; index++) {
      const label = this.colLabels.at(index) ?? `-`;
      // @ts-expect-error
      object[ label ] = row[ index ];
    }
    return object;
  }

  getOrCreateRow(rowNumber: number): Array<V | undefined> {
    let row = this.rows.at(rowNumber);
    if (row === undefined) {
      row = [];
      this.rows[ rowNumber ] = row;
    }
    return row;
  }

  row(rowNumber: number): Array<V | undefined> | undefined {
    return this.rows.at(rowNumber);
  }

  set(rowNumber: number, columnNumber: number, value: V | undefined) {
    const row = this.getOrCreateRow(rowNumber);
    row[ columnNumber ] = value;
  }

  setRow(rowNumber: number, cols: number, value: V | undefined) {
    const row = this.getOrCreateRow(rowNumber);
    for (let columnNumber = 0; columnNumber < cols; columnNumber++) {
      row[ columnNumber ] = value;
    }
  }
}