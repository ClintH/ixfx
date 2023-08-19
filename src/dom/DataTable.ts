import { resolveEl } from './Util.js';
import JSON5 from 'json5';

export type DataTableOpts = {
  readonly formatter?: DataFormatter;
  readonly precision?: number;
  readonly roundNumbers?: boolean;
};

export type DataTable<V> = {
  update(data: V): void;
  remove(): boolean;
};

/**
 * Creates a table of data points for each object in the map
 * ```
 * const t = DataTable.fromList(parentEl, map);
 * t.update(newMap);
 * ```
 */
export const fromList = (
  parentOrQuery: HTMLElement | string,
  //eslint-disable-next-line functional/prefer-readonly-type
  data: Map<string, object>
): DataTable<Map<string, object>> => {
  const parent = resolveEl(parentOrQuery);
  //eslint-disable-next-line functional/no-let
  let container: HTMLDivElement | undefined = document.createElement(
    'DIV'
  ) as HTMLDivElement;
  parent.append(container);

  const remove = () => {
    if (!container) return false;
    container.remove();
    container = undefined;
    return true;
  };

  const update = (data: ReadonlyMap<string, object>) => {
    const seenTables = new Set();

    for (const [key, value] of data) {
      const tKey = `table-${key}`;
      seenTables.add(tKey);
      //eslint-disable-next-line functional/no-let
      let t = parent.querySelector(`#${tKey}`);
      if (t === null) {
        t = document.createElement(`table`);
        //eslint-disable-next-line functional/immutable-data
        t.id = tKey;
        parent.append(t);
      }

      updateElement(t as HTMLTableElement, value);
    }

    // Remove tables that aren't present in map
    const tables = Array.from(parent.querySelectorAll(`table`));
    tables.forEach((t) => {
      if (!seenTables.has(t.id)) {
        t.remove();
      }
    });
  };

  if (data) update(data);
  return { update, remove };
  // return (d: ReadonlyMap<string, object>) => {
  //   update(d);
  // };
};

/**
 * Format data. Return _undefined_ to signal that
 * data was not handled.
 */
export type DataFormatter = (data: object, path: string) => string | undefined;

/**
 * Updates the given table element so each entry in the map is a
 * row in the table.
 *
 * Rows are keyed by the map key. Rows with keys not found in the map are deleted.
 * @param t Table
 * @param data Map of data
 * @param opts Options
 * @returns
 */
const updateElement = (
  //eslint-disable-next-line functional/prefer-immutable-types
  t: HTMLTableElement,
  data: object,
  opts: DataTableOpts = {}
) => {
  const precision = opts.precision ?? 2;

  if (data === undefined) {
    //eslint-disable-next-line functional/immutable-data
    t.innerHTML = ``;
    return;
  }
  const seenRows = new Set();

  for (const [key, value] of Object.entries(data)) {
    const domKey = `row-${key}`;
    // Keep track of keys currently in object
    seenRows.add(domKey);

    // Is there already a row for this key?
    //eslint-disable-next-line functional/no-let
    let rowEl = t.querySelector(`tr[data-key='${domKey}']`);
    if (rowEl === null) {
      // No row, add it
      rowEl = document.createElement(`tr`);
      t.append(rowEl);
      //eslint-disable-next-line functional/immutable-data
      rowEl.setAttribute(`data-key`, domKey);

      const keyEl = document.createElement(`td`);
      //eslint-disable-next-line functional/immutable-data
      keyEl.innerText = key;
      rowEl.append(keyEl);
    }

    // Is there already a cell for the value?
    //eslint-disable-next-line functional/no-let
    let valEl = rowEl.querySelector(`td[data-key='${domKey}-val']`);

    if (valEl === null) {
      // No, create the cell
      valEl = document.createElement(`td`);
      //eslint-disable-next-line functional/immutable-data
      valEl.setAttribute('data-key', `${domKey}-val`);
      rowEl.append(valEl);
    }

    // Format the value as HTML
    //eslint-disable-next-line functional/no-let
    let valueHTML: string | undefined;
    if (opts.formatter) {
      valueHTML = opts.formatter(value, key);
    }

    // If there's no formatter, or not handled...
    if (valueHTML === undefined) {
      if (typeof value === `object`) {
        valueHTML = JSON5.stringify(value);
      } else if (typeof value === `number`) {
        if (opts.roundNumbers) {
          valueHTML = Math.round(value).toString();
        } else {
          valueHTML = value.toFixed(precision);
        }
      } else {
        valueHTML = (value as object).toString();
      }
    }

    // Set the cell value
    //eslint-disable-next-line functional/immutable-data
    (valEl as HTMLElement).innerHTML = valueHTML;
  }

  // Remove rows that aren't present in data
  const rows = Array.from(t.querySelectorAll(`tr`));
  rows.forEach((r) => {
    const key = r.getAttribute('data-key');
    if (!seenRows.has(key)) {
      r.remove();
    }
  });
};

/**
 * Creates a HTML table where each row is a key-value pair from `data`.
 * First column is the key, second column data.
 *
 * ```js
 * const dt = fromObject(`#hostDiv`);
 * ```
 *
 * `dt` is a function to call when you want to update data:
 *
 * ```js
 * dt({
 *  name: `Blerg`,
 *  height: 120
 * });
 * ```
 */
export const fromObject = (
  parentOrQuery: Readonly<HTMLElement | string>,
  data?: object,
  opts?: DataTableOpts
): DataTable<object> => {
  const parent = resolveEl(parentOrQuery);
  //eslint-disable-next-line functional/no-let
  let t: HTMLTableElement | undefined = document.createElement(`table`);
  parent.append(t);

  const remove = () => {
    if (!t) return false;
    t.remove();
    t = undefined;
    return true;
  };

  // Update already if there's initial data
  if (data) updateElement(t, data, opts);

  const update = (d: object) => {
    if (!t) throw new Error(`Table disposed`);
    updateElement(t, d, opts);
  };

  return { remove, update };
};
