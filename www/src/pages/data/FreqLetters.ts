/* eslint-disable */
import {LitElement, html, css} from 'lit';
import {property} from 'lit/decorators/property.js';
import {mutableFrequency} from '~/MutableFrequency';
import { sort } from 'fp-ts/Array';


export const tagName = `freq-letters`;

export class FreqLetters extends LitElement {
  static readonly styles = css`
  :host {
    display: flex;
    align-items: center;
    flex-direction: column;
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
  declare text: string;
  
  constructor() {
    super();
    this.text = `Hello there! - Obiwan Kenobi`;
  }

  _onInput(el) {
    this.text = el.target.value; 
    console.log(this.text);
  }

  render() {
    const freq = mutableFrequency();
    for (let i=0;i<this.text.length;i++) {
      freq.add(this.text.charAt(i));
    }
    
    return html`
    <div class="toolbar">
      <input @input="${this._onInput}" type="text" .value="${this.text}">
    </div>
    <div>
      result
    </div>
		`;
  }
}

customElements.define(tagName, FreqLetters);