/* eslint-disable */

import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';

export type HistogramBar = {
  key:string
  size:number
  asPercentage?:number
}

/*
Colour theming:
--histogram-bar-color
--histogram-label-color
*/
@customElement(`histogram-vis`)
export class HistogramVis extends LitElement {
  static styles = css`
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

  @property()
    data?:HistogramBar[] = [];

  barTemplate(bar:HistogramBar, index:number, bars:number) {
    const {asPercentage,key, size} = bar;

    // grid-area: rowStart / gridColStart / gridRowEnd / gridColEnd
    const rowStart = 1;
    const rowEnd = 2;
    const colStart = index + 1;
    const colEnd = colStart +1;
    return html`
    <div class="bar" style="grid-area: ${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}">
      <div class="barTrack" style="height: ${(asPercentage??0)*100}%"></div>
      <div class="data">${size}</div>
    </div>
    <div class="xAxisLabels" style="grid-area: ${rowStart+2} / ${colStart} / ${rowEnd+2} / ${colEnd}">
      ${key}
    </div>`
  }

  render() {
    const d = this.data;
    if (!d || d.length === 0) return html``;

    let max = Math.max(...d.map(d=>d.size));
    d.forEach(d=>{
      d.asPercentage = d.size/max;
    });

    let h = html`
    <style>
    div.chart {
      grid-template-columns: repeat(${d.length}, minmax(2px, 1fr));
    }
    </style>
    <div class="container">
      <div class="chart">
      ${repeat(d, (data) => data.key, (data, index) => this.barTemplate(data, index, d.length))}
        <div class="xAxis" style="grid-area: 2 / 1 / 3 / ${d.length+1}"></div>
      </div>
    </div>`
    return h;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    // eslint-disable-next-line quotes
    "histogram-vis": HistogramVis
  }
}