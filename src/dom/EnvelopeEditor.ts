import {LitElement, css, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {Drawing} from '..';
import {AdsrOpts, defaultAdsrOpts} from '../modulation/Envelope';
import * as Beziers from '../geometry/Bezier';
import {getCssVariable} from '~/colour/Palette';
import {copyToClipboard} from '.';

const jsonData = (obj: unknown) => {
  if (obj === null || typeof obj === `undefined` || obj === `undefined`) return;
  // eslint-disable-next-line functional/no-try-statement
  try {
    if (typeof obj === `string`) {
      if (obj.length === 0) return;
      const o = JSON.parse(obj);
      return o;
    }
  } catch (ex) {
    console.log(obj);
    console.error(ex);
  }
  return undefined;
};


@customElement(`envelope-editor`)
export class EnvelopeEditor extends LitElement {
  static readonly styles = css`
  .container {
 
  }
  label {
    user-select: none;
  }
  section {
    display: flex;
    flex-direction: column;
  }
  #controls {
    display: flex;
    justify-content: center;
  }
  #controls>section {
  }
  #controls label {
    display: flex;
    flex-direction: column;
    font-size: 80%;
  }
  section>h2 {
    font-size: 80%;
    text-align: center;
  }
  .toolbar {
    display: flex;
    justify-content: center;
    margin: 0.5em;
    flex-wrap: wrap;
  }
  .toolbar > * {
    margin-left: 0.3em;
    margin-right: 0.3em;
  }
  `;

  @query(`#attackPreview`) attackPreview!: HTMLCanvasElement;

  // eslint-disable-next-line functional/prefer-readonly-type
  @property()
  declare data: AdsrOpts;

  // eslint-disable-next-line functional/prefer-readonly-type
  @property({converter: jsonData, type: Object})
  declare json: AdsrOpts | undefined;

  constructor() {
    super();
    this.data = defaultAdsrOpts();
    this.json = undefined;
  }

  connectedCallback() {
    if (!this.hasAttribute(`json`)) {
      this.setAttribute(`json`, this.innerText);
    }
    super.connectedCallback();
  }

  private onChanged() {
    const ev = new CustomEvent(`change`, {bubbles: true, composed: true, detail: this.data});
    this.dispatchEvent(ev);
  }

  private _durationInput(e:Event) {
    const src = e.target as HTMLInputElement;
    const val = src.value;
    const valNumber = parseInt(val);
    switch (src.id) {
    case `attackDuration`:
      this.data = {...this.data, attackDuration: valNumber};
      break;
    case `decayDuration`:
      this.data = {...this.data, decayDuration: valNumber};
      break;
    case `releaseDuration`:
      this.data = {...this.data, releaseDuration: valNumber};
      break;
    }
    this.onChanged();
  }

  private _bendInput(e:Event) {
    const src = e.target as HTMLInputElement;
    const val = src.value;
    const valNumber = parseFloat(val)/100;
    switch (src.id) {
    case `attackBend`:
      this.data = {...this.data, attackBend: valNumber};
      break;
    case `decayBend`:
      this.data = {...this.data, decayBend: valNumber};
      break;
    case `releaseBend`:
      this.data = {...this.data, releaseBend: valNumber};
    }
    this.onChanged();
  }

  private _valueInput(e:Event) {
    const src = e.target as HTMLInputElement;
    const val = src.value;
    const valNumber = parseFloat(val)/100;
    const id = src.id;
    switch (id) {
    case `initialValue`:
      this.data = {...this.data, initialLevel: valNumber};
      break;
    case `peakLevel`:
      this.data = {...this.data, peakLevel: valNumber};
      break;
    case `sustainLevel`:
      this.data = { ...this.data, sustainLevel: valNumber};
      break;
    case `releaseLevel`:
      this.data ={...this.data, releaseLevel: valNumber};
      break;
    }
    this.onChanged();
  }

  renderPreviews() {
    if (this.data === undefined) return;
    const d = this.data;
    this.renderPreview(`attackPreview`, d.attackBend, d.initialLevel, d.peakLevel);
    this.renderPreview(`decayPreview`, d.decayBend, d.peakLevel, d.sustainLevel);
    this.renderPreview(`releasePreview`, d.releaseBend, d.sustainLevel, d.releaseLevel);
 
    const {ctx, width, height} = this.setupCtx(`sustainPreview`);
    const sustainLevel = d.sustainLevel ?? 1;
    if (ctx !== undefined) {
      Drawing.line(ctx, {
        a: {x: 0, y: (1-sustainLevel) * height},
        b: {x: width, y: (1-sustainLevel) * height}
      });
      ctx.resetTransform();
    }
  }

  setupCtx(id:string) {
    const el = this.shadowRoot?.getElementById(id) as HTMLCanvasElement;
    if (el === null) {
      console.warn(`Canvas ${id} not found`);
      return {ctx: undefined, width: 0, padding: 0, height: 0};

    }
    const ctx = el.getContext(`2d`);
    if (ctx === null) {
      console.warn(`Canvas ctx could not be created for ${id}`);
      return {ctx: undefined, width: 0, padding: 0, height: 0};
    }
    
    const padding = 4;
    const width = 100;
    const height = 100;
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = getCssVariable(`theme-accent`, `yellow`);
    ctx.lineWidth = 3;
    
    ctx.translate(padding/2, padding/2);
    return {ctx, padding, width: width-padding-padding, height:height -padding-padding};
  }

  renderPreview(id:string, bend:number|undefined, start:number|undefined, end:number|undefined) {
    if (bend === undefined) bend = 0;
    if (start === undefined) start = 0;
    if (end === undefined) end = 1;

    const {ctx, width, height} = this.setupCtx(id);
    if (ctx === undefined) return;

    const bezierToDraw = Beziers.quadraticBend(
      {x: 0, y: (1-start)*height}, 
      {x: width, y: (1-end)*height},
      bend
    );
    Drawing.bezier(ctx, bezierToDraw);
    ctx.resetTransform();
  }
  
  async updated() {
    this.renderPreviews();
  }

  private _reset() {
    this.data = defaultAdsrOpts();
    this.requestUpdate();
  }

  private _copy() {
    copyToClipboard(this.data);
  }

  render() {
    if (this.data === undefined) return html`<div>(undefined envelope)</div>`;
    const d = this.data;
    const h = html`
<div class="container">
<div id="preview">
</div>  
<div id="controls">
  <section>
    <h2>Attack</h2>
    <canvas title="Preview of attack stage" id="attackPreview" width="100" height="100"></canvas>
    <label>Duration: ${d.attackDuration} ms
      <input @input="${this._durationInput}" .value="${d.attackDuration}" type="range" id="attackDuration" min="0" max="5000">
    </label>
    <label>Bend: ${d.attackBend}
      <input @input="${this._bendInput}" .value="${d.attackBend*100}" type="range" id="attackBend" min="-100" max="100">
    </label>
    <label>Initial: ${d.initialLevel}
      <input @input="${this._valueInput}" .value=${d.initialLevel*100} type="range" id="initialValue" min="0" max="100">
    </label>
  </section>
  <section>
    <h2>Decay</h2>
    <canvas title="Preview of decay stage" id="decayPreview" width="100" height="100"></canvas>
    <label>Duration: ${d.decayDuration} ms
      <input @input="${this._durationInput}" .value="${d.decayDuration}" type="range" id="decayDuration" min="0" max="5000">
    </label>
    <label>Bend: ${d.decayBend}
      <input @input="${this._bendInput}" .value="${d.decayBend*100}" type="range" id="decayBend" min="-100" max="100">
    </label>
    <label>Peak: ${d.peakLevel}
      <input @input="${this._valueInput}" .value="${d.peakLevel*100}" type="range" id="peakLevel" min="0" max="100">
    </label>
  </section>
  <section>
    <h2>Sustain</h2>
    <canvas title="Preview of sustain stage" id="sustainPreview" width="100" height="100"></canvas>
    <label>Level: ${d.sustainLevel}
      <input @input="${this._valueInput}" .value="${d.sustainLevel*100}" type="range" id="sustainLevel" min="0" max="100">
    </label>
  </section>
  <section>
    <h2>Release</h2>
    <canvas title="Preview of release stage" id="releasePreview" width="100" height="100"></canvas>
    <label>Duration: ${d.releaseDuration} ms
      <input @input="${this._durationInput}" .value="${d.releaseDuration}" type="range" id="releaseDuration" min="0" max="5000">
    </label>
    <label>Bend: ${d.releaseBend}
      <input @input="${this._bendInput}" .value="${d.releaseBend*100}" type="range" id="releaseBend" min="-100" max="100">
    </label>
    <label>Release: ${d.releaseLevel}
      <input @input="${this._valueInput}" .value="${d.releaseLevel*100}" type="range" id="releaseLevel" min="0" max="100">
    </label>
  </section>
</div>
<div class="toolbar">
  <button title="Reset envelope to starting state" @click="${this._reset}">Reset</button>
  <button title="Copy envelope data to clipboard" @click="${this._copy}">Copy envelope</button>
</div>
</div>`;
    return h;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    // eslint-disable-next-line quotes
    readonly "envelope-editor": EnvelopeEditor
  }
}