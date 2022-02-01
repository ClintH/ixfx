import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {KeyValue} from '~/KeyValue.js';

type Bar = {
  readonly percentage:number
  readonly data:KeyValue
};

const jsonData = (obj:unknown) => {
  if (obj === null || obj === undefined) return;
  // eslint-disable-next-line functional/no-try-statement
  try {
    if (typeof obj === `string`) {
      if (obj.length === 0) return;
      const o = JSON.parse(obj);
      if (!Array.isArray(o)) {
        console.error(`Histogram innerText should be JSON array`);
        return;
      }
      
      // eslint-disable-next-line functional/no-loop-statement, functional/no-let
      for (let i=0;i<o.length; i++) {
        if (!Array.isArray(o[i])) {
          console.error(`Histogram array should consist of inner arrays`);
          return;
        }
        if (o[i].length !== 2) {
          console.error(`Histogram inner arrays should consist of two elements`);
          return;
        }
        if (typeof o[i][0] !== `string`) {
          console.error(`First element of inner array should be a string (index ${i})`);
          return;
        }
        if (typeof o[i][1] !== `number`) {
          console.error(`Second element of inner array should be a number (index ${i})`);
          return;
        }
      }
      return o;
    }
  } catch (ex) {
    console.log(obj);
    console.error(ex);
  }
  return undefined;
};

/**
 * Usage in HTML:
 * ```html
 * <style>
 * histogram-vis {
 *  display: block;
 *  height: 7em;
 *  --histogram-bar-color: pink;
 * }
 * </style>
 * <histogram-vis>
 * [
 *  ["apples", 5],
 *  ["oranges", 3],
 *  ["pineapple", 0],
 *  ["limes", 9]
 * ]
 * </histogram-vis>
 * ```
 * 
 * CSS colour theming:
 * --histogram-bar-color
 * --histogram-label-color
 * 
 * HTML tag attributes
 * showXAxis (boolean)
 * showDataLabels (boolean)
 *
 * @export
 * @class HistogramVis
 * @extends {LitElement}
 **/
@customElement(`histogram-vis`)
export class HistogramVis extends LitElement {
  static readonly styles = css`
    :host {
    }
    div.container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    div.chart {
      display: grid;
      flex: 1;
      grid-template-rows: 1fr 1px min-content;
      justify-items: center;
    }
    div.bar {
      display: flex;
      flex-direction: column-reverse;
      align-items: center;
      justify-self: normal;
      padding-left: 0.3vw;
      padding-right: 0.3vw;
    }
    div.bar>div.barTrack {
      background-color: var(--histogram-bar-color, gray);
      align-self: stretch;
    }
    div.xAxisLabels, div.data {
      font-size: min(1vw, 1em);
      color: var(--histogram-label-color, currentColor);
    }
    div.xAxisLabels {
      width: 100%;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      text-align: center;
    }
    div.xAxis {
      background-color: var(--histogram-axis-color, silver);
      width: 100%;
      height: 100%;
    }
  `;

  // static properties = {
  //   showXAxis: { attribute: false}
  // };

  
  // eslint-disable-next-line functional/prefer-readonly-type
  @property()
  declare data:readonly KeyValue[];

  // eslint-disable-next-line functional/prefer-readonly-type
  @property()
  declare showDataLabels:boolean;

  // eslint-disable-next-line functional/prefer-readonly-type
  @property()
  declare height:string;

  // eslint-disable-next-line functional/prefer-readonly-type
  @property()
  declare showXAxis:boolean;

  // eslint-disable-next-line functional/prefer-readonly-type
  @property({ converter: jsonData, type: Object })
  declare json:readonly KeyValue[]|undefined;

  constructor() {
    super();
    this.data = [];
    this.showDataLabels = true;
    this.height = `100%`;
    this.showXAxis = true;
    this.json = undefined;
  }

  connectedCallback() {
    if (!this.hasAttribute(`json`)) {
      this.setAttribute(`json`, this.innerText);
    }
    super.connectedCallback();
  }

  barTemplate(bar:Bar, index:number, _totalBars:number) {
    const {percentage} = bar;
    const [key, freq] = bar.data;

    // grid-area: rowStart / gridColStart / gridRowEnd / gridColEnd
    const rowStart = 1;
    const rowEnd = 2;
    const colStart = index + 1;
    const colEnd = colStart +1;

    const dataLabel = html`<div class="data">${freq}</div>`;
    const xAxis = html`${key}`;
    return html`
    <div class="bar" style="grid-area: ${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}">
      <div class="barTrack" style="height: ${(percentage??0)*100}%"></div>
      ${this.showDataLabels ? dataLabel : `` }
    </div>
    <div class="xAxisLabels" style="grid-area: ${rowStart+2} / ${colStart} / ${rowEnd+2} / ${colEnd}">
      ${this.showXAxis ? xAxis : ``}
    </div>`;
  }

  render() {
    if ((this.data === undefined || this.data.length === 0) && this.json === undefined) return html``;

    const d = this.data ?? this.json;
    const length = d.length;
    const highestCount = Math.max(...d.map(d => d[1] as number));
    const bars = d.map(kv => ({data: kv, percentage: kv[1] as number / highestCount }));

    const xAxis = html`<div class="xAxis" style="grid-area: 2 / 1 / 3 / ${d.length+1}"></div>`;
    const height = this.height ? `height: ${this.height};` : ``;
    const h = html`
    <style>
    div.chart {
      grid-template-columns: repeat(${d.length}, minmax(2px, 1fr));
    }
    </style>
    <div class="container" style="${height}">
      <div class="chart">
      ${repeat(bars, (bar) => bar.data[0], (b, index) => this.barTemplate(b, index, length))}
        ${this.showXAxis ? xAxis :  ``}
      </div>
    </div>`;
    return h;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    // eslint-disable-next-line quotes
    readonly "histogram-vis": HistogramVis
  }
}