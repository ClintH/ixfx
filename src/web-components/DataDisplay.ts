
import { changedObjectDataFields } from "../data/Compare.js";
import { round } from "../numbers/Round.js";
export type FormattingOptions = {
  readonly precision?: number
  readonly roundNumbers?: number
}

export class DataDisplayComponent extends HTMLElement {
  previousValue: Record<string, any> | undefined;
  _shadow: ShadowRoot;
  _container: HTMLElement;

  constructor() {
    super();

    this._shadow = this.attachShadow({ mode: `open` });
    this._container = document.createElement(`section`);
    const style = document.createElement(`style`);
    style.textContent = `
    section {
      background: white;
      color: black;
      border: 2px solid hsl(0deg 0.61% 90%);
      padding: 1em;
      font-family: monospace;
      display:grid;
      grid-template-cols: repeat(2, 1fr);
    }
    div {
      border:1px solid black;
    }
    `
    this._shadow.append(style, this._container);
  }

  formatValue(v: any, options: FormattingOptions = {}): string {
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
    return JSON.stringify(v);
  }

  displayData(o: Record<string, any>) {
    for (const [ key, value ] of Object.entries(o)) {
      const domKey = `path-${ key }`;
      if (typeof value === `object`) {
        const element = this.getOrCreate(domKey, (parent) => {
          parent.classList.add(`row`, `nested`);
          const label = document.createElement(`label`);
          label.textContent = key;
          const valueElement = new DataDisplayComponent();
          parent.append(label, valueElement);
        });
        const valueElement = element.querySelector<DataDisplayComponent>(`data-display`);
        if (valueElement !== null) {
          valueElement.update(value);
        }

      } else {
        const element = this.getOrCreate(domKey, (parent) => {
          parent.classList.add(`row`);
          const label = document.createElement(`label`);
          label.textContent = key;
          const valueElement = document.createElement(`div`);
          valueElement.textContent = this.formatValue(value);
          parent.append(label, valueElement);
        });
        const valueElement = element.querySelector(`div`);
        if (valueElement === null) {
          debugger;
        } else {
          valueElement.innerHTML = this.formatValue(value);
        }
      }
    }

    // const paths = getFieldPaths(o);
    // console.log(`paths: ${ JSON.stringify(paths) }`);

    // for (const path of paths) {

    // }
  }

  getOrCreate(path: string, init?: (parent: HTMLElement) => void): HTMLElement {

    // eslint-disable-next-line unicorn/prefer-query-selector
    const element = this._shadow.getElementById(path);
    if (element !== null) return element;

    const elementCreated = document.createElement(`div`);
    elementCreated.id = path;
    if (init) init(elementCreated);
    this._container.append(elementCreated);
    return elementCreated;
  }

  update(value: Record<string, any>) {
    if (this.previousValue === undefined) {
      this.displayData(value);
    } else {
      this.displayData(changedDataFields(this.previousValue, value));
    }
    this.previousValue = value;
  }
}

customElements.define(`data-display`, DataDisplayComponent);