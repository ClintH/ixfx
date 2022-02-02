/* eslint-disable */
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import * as Arcs from '~/geometry/Arc';
import * as Svg from '~/dom/Svg';

export const tagName = `arc-editor`;

export class ArcEditor extends LitElement {
  static readonly styles = css`
  #container {
    display: flex;
    align-items: center;
    flex-direction: column
  }
  #toolbar {
    display: flex;
    padding: 1em;
    display: none;
  }
  #toolbar input {
    width: 3em;
    margin-right: 1em;
    margin-left: 0.3em;
  }
  `;

  @property()
  declare startRadian: number;
  
  @property()
  declare endRadian: number;
  
  @property()
  declare counterClockwise: boolean;
  
  @property()
  declare radius: number;
  
  constructor() {
    super();
    this.startRadian = 0;
    this.endRadian = Math.PI;
    this.radius = 10;
  }

  getArc():Arcs.Arc {
    return { 
      startRadian: this.startRadian,
      endRadian: this.endRadian,
      radius: this.radius,
      counterClockwise: this.counterClockwise
    };
  }

  setArc(arc:Arcs.Arc) {
    this.radius = arc.radius;
    this.startRadian = arc.startRadian;
    this.endRadian = arc.endRadian;
    this.counterClockwise = arc.counterClockwise;
  }

  getBounds() {
    const svg = Svg.svg(
      this.shadowRoot.querySelector(`svg`)
    );
    return {width: svg.width, height: svg.height};
  }

  renderSvg() {    
    const svg = Svg.svg(
      this.shadowRoot.querySelector(`svg`),
      { fillStyle: `transparent`, strokeStyle: `pink`, strokeWidth: 3 }
    );

    svg.clear();
    const w = svg.width;
    const h = svg.height;
    const a = this.getArc();
    const origin = {x: w/2, y: h/2};    
    svg.path(Arcs.toSvg(origin, a));
  }

  async updated() {
    this.renderSvg();
  }

  render() {
    return html`
			<div id="container">
        <div id="toolbar">
          <div class="opt">
            <label>Radius:</label>
            <input type="number" id="radius" value=${this.radius}>
          </div>
          <div class="opt">
            <label>Start radian:</label>
            <input type="number" id="startRadian" value=${this.startRadian}>
          </div>
          <div class="opt">
            <label>End radian:</label>
            <input type="number" id="endRadian" value=${this.endRadian}>
          </div>
        </div>
        <svg width=200 height=200></svg>
			</div>
		`;
  }
}

customElements.define(tagName, ArcEditor);