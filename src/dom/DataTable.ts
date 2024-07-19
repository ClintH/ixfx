import { round } from '../numbers/Round.js';
import { resolveEl as resolveElement } from './ResolveEl.js';
import JSON5 from 'json5';

export type FormattingOptions = {
  readonly precision?: number
  readonly roundNumbers?: number
}
export type DataTableOpts = FormattingOptions & {
  readonly formatter?: DataFormatter
  readonly objectsAsTables?: boolean
  readonly idPrefix?: string
};

export type DataTable<V> = {
  update(data: V): void;
  remove(): boolean;
};

const toHtmlSimple = (v: any, options: FormattingOptions): string => {
  if (v === null) return `(null)`;
  if (v === undefined) return `(undefined)`;
  if (typeof v === `boolean`) return v ? `true` : `false`;
  if (typeof v === `string`) return `"${ v }"`;
  if (typeof v === `number`) {
    let vAsNumber = v;
    if (options.roundNumbers !== undefined) vAsNumber = round(options.roundNumbers, v)
    if (options.precision !== undefined) return vAsNumber.toFixed(options.precision);
    return vAsNumber.toString();
  }
  if (typeof v === `object`) return toTableSimple(v, options);
  return JSON5.stringify(v);
}

const toTableSimple = (v: object, options: FormattingOptions): string => {
  let html = `<div style="display:grid; grid-template-columns: repeat(2, 1fr)">`;
  for (const entry of Object.entries(v)) {
    const value = toHtmlSimple(entry[ 1 ], options);
    html += `<div class="label" style="display:table-cell">${ entry[ 0 ] }</div>
      <div class="data" style="display:table-cell">${ value }</div>`
  }
  html += `</div>`;
  return html;
}

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
  const parent = resolveElement(parentOrQuery);
  let container: HTMLDivElement | undefined = document.createElement(
    `DIV`
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

    for (const [ key, value ] of data) {
      const tKey = `table-${ key }`;
      seenTables.add(tKey);
      let t: HTMLElement | null = parent.querySelector(`#${ tKey }`);
      if (t === null) {
        t = document.createElement(`table`);
        if (!t) throw new Error(`Could not create table element`);
        //eslint-disable-next-line functional/immutable-data
        t.id = tKey;
        parent.append(t);
      }

      updateElement(t as HTMLTableElement, value);
    }

    // Remove tables that aren't present in map
    // eslint-disable-next-line unicorn/prefer-spread
    const tables = Array.from(parent.querySelectorAll(`table`));
    for (const t of tables) {
      if (!seenTables.has(t.id)) {
        t.remove();
      }
    }
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
 * @param options Options
 * @returns
 */
const updateElement = (
  //eslint-disable-next-line functional/prefer-immutable-types
  t: HTMLTableElement,
  data: object,
  options: DataTableOpts = {}
) => {
  const precision = options.precision ?? 2;
  const idPrefix = options.idPrefix ?? ``;
  const objectsAsTables = options.objectsAsTables ?? false;

  if (data === undefined) {
    //eslint-disable-next-line functional/immutable-data
    t.innerHTML = ``;
    return;
  }
  const seenRows = new Set();

  for (const [ key, value ] of Object.entries(data)) {
    const domKey = `${ idPrefix }-row-${ key }`;
    // Keep track of keys currently in object
    seenRows.add(domKey);

    // Is there already a row for this key?
    let rowEl = t.querySelector(`tr[data-key='${ domKey }']`);
    if (rowEl === null) {
      // No row, add it
      rowEl = document.createElement(`tr`);
      t.append(rowEl);
      rowEl.setAttribute(`data-key`, domKey);

      const keyEl = document.createElement(`td`);
      keyEl.textContent = key;
      keyEl.classList.add(`label`);
      rowEl.append(keyEl);
    }

    // Is there already a cell for the value?
    let valEl = rowEl.querySelector(`td[data-key='${ domKey }-val']`);

    if (valEl === null) {
      // No, create the cell
      valEl = document.createElement(`td`);
      valEl.classList.add(`data`);
      valEl.setAttribute(`data-key`, `${ domKey }-val`);
      rowEl.append(valEl);
    }

    // Format the value as HTML
    let valueHTML: string | undefined;
    if (options.formatter) {
      valueHTML = options.formatter(value, key);
    }

    // If there's no formatter, or not handled...
    if (valueHTML === undefined) {
      if (typeof value === `object`) {
        valueHTML = objectsAsTables ? toTableSimple(value, options) : JSON5.stringify(value);
      } else if (typeof value === `number`) {
        valueHTML = options.roundNumbers ? Math.round(value).toString() : value.toFixed(precision);
      } else if (typeof value === `boolean`) {
        valueHTML = value ? `true` : `false`;
      } else if (typeof value === `string`) {
        valueHTML = `"${ value }"`;
      } else {
        valueHTML = JSON.stringify(value);
      }
    }

    // Set the cell value
    (valEl as HTMLElement).innerHTML = valueHTML;
  }

  // Remove rows that aren't present in data
  // eslint-disable-next-line unicorn/prefer-spread
  const rows = Array.from(t.querySelectorAll(`tr`));
  for (const r of rows) {
    const key = r.getAttribute(`data-key`);
    if (!seenRows.has(key)) {
      r.remove();
    }
  }
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
  parentOrQuery: HTMLElement | string,
  data?: object,
  opts?: DataTableOpts
): DataTable<object> => {
  const parent = resolveElement(parentOrQuery);
  const idPrefix = opts?.idPrefix ?? Math.floor(Math.random() * 1000).toString();

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
    updateElement(t, d, { ...opts, idPrefix });
  };

  return { remove, update };
};
