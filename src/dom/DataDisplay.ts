import { fromObject } from "./DataTable.js";

// TODO Visually show data which has changed since last update
// TODO Click on a field to show a sparkline for it
/**
 * Creates a simple display for data. Designed to show ixfx state data
 * 
 * ```js
 * // Create once
 * const display = new DataDisplay();
 * 
 * // Call .update to show state
 * display.update(state);
 * ```
 */
export class DataDisplay {

  dataTable;

  /**
   * Constructor
   * @param darkMode 
   */
  constructor(darkMode = false) {

    const existing = document.querySelector(`#ixfx-data-display`);
    if (existing !== null) throw new Error(`DataDisplay already loaded on this page`);

    const container = document.createElement(`div`);
    container.id = `ixfx-data-display`;
    if (darkMode) container.classList.add(`dark`);

    const css = document.createElement(`style`);
    css.textContent = `
    #ixfx-data-display {
      background: white;
      color: black;
      border: 2px solid hsl(0deg 0.61% 90%);
      border-radius: 4px;
      z-index: 1000;
      opacity: 40%;
      padding: 1em;
      font-family: monospace;
      position: fixed;
      right: 1em;
      top: 1em;
    }
    #ixfx-data-display.dark {
      background: black;
      color: white;
      border: 2px solid hsl(0deg 0.61% 10%);
    }
    #ixfx-data-display:hover {
      opacity: 100%;
    }
    #ixfx-data-display table {
      border-collapse: collapse;
    }
    #ixfx-data-display tr:not(:last-child) {
      border-bottom: 2px solid hsl(0deg 0.61% 90%);
    }
    #ixfx-data-display.dark tr:not(:last-child) {
      border-bottom: 2px solid hsl(0deg 0.61% 10%);
    }
    #ixfx-data-display td {
      padding-bottom: 0.4em;
      padding-top: 0.4em;
    }
    #ixfx-data-display .label {
      color: hsl(0deg 0.61% 60%);
      text-align: right;
      padding-right: 0.5em;
    }
    #ixfx-data-display.dark .label {
      color: gray;
    }
    `

    container.style.display = `inline-block`;
    document.body.append(css);
    document.body.append(container);

    this.dataTable = fromObject(container, undefined, {
      objectsAsTables: true,
      roundNumbers: 2
    });
  }

  update(data: object) {
    this.dataTable.update(data);
  }
}