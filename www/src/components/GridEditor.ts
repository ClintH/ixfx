/* eslint-disable */
import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {getCssVariable} from '~/visual/Palette';
import * as Grids from '~/geometry/Grid';
import * as Rects from '~/geometry/Rect';

export type CellRenderer = (cell:Grids.Cell, rect:Rects.RectPositioned, ctx:CanvasRenderingContext2D) => boolean;

@customElement(`grid-editor`)
export class GridEditor extends LitElement {
  static readonly styles = css`
  .container {
  }
  label {
    user-select: none;
  }
  .row {
    padding-right: 0.5em;
  }
  .row>label {

  }
  input[type="number"] {
    width: 2.5em;
  }
  #preview {
    display: flex;
    justify-content: center;
  }
  section {
    display: flex;
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
    font-size: 80%;
  }
  .toolbar > * {
    margin-left: 0.3em;
    margin-right: 0.3em;
  }
  `;

  // eslint-disable-next-line functional/prefer-readonly-type
  // @property()
  // declare grid: Grids.Grid & Grids.GridVisual;

  @property()
  declare selectedCell: Grids.Cell|undefined;

  @property()
  declare rows: number;
  
  @property()
  declare cols: number;

  @property()
  declare pixelSize: number;

  @property()
  declare showToolbar: boolean;

  lastCanvasSize = {rows:0,cols:0,shape:15};
  cellRenderer:undefined|CellRenderer;

  constructor() {
    super();
    this.rows = 5;
    this.cols = 5;
    this.showToolbar = false;
    this.pixelSize = 15;
  }

  private onChanged() {
    const ev = new CustomEvent(`change`, {bubbles: true, composed: true, detail: this.getGrid()});
    this.dispatchEvent(ev);
  }

  getGrid():Grids.Grid & Grids.GridVisual {
    const rows = typeof this.rows === `string` ? parseInt(this.rows) : this.rows;
    const cols = typeof this.cols === `string` ? parseInt(this.cols) : this.cols;
    const size = typeof this.pixelSize === `string` ? parseInt(this.pixelSize) : this.pixelSize;
    return {rows, cols, size};

  }

  private _sizeInput(e: Event) {
    const src = e.target as HTMLInputElement;
    const val = src.value;
    const valNumber = parseInt(val);
    switch (src.id) {
    case `rows`:
      this.rows = valNumber;
      break;
    case `cols`:
      this.cols = valNumber;
      break;
    }
    this.onChanged();
  }

  draw() {
    const shape = this.getGrid();
    const canvasEl = this.shadowRoot?.getElementById(`previewCanvas`) as HTMLCanvasElement;
    if (canvasEl === null) return;
    const ctx = canvasEl.getContext(`2d`);
    if (ctx === null) return;

    const padding = 3;
    if (!Grids.isEqual(shape, this.lastCanvasSize)) {
      canvasEl.width = (shape.cols * shape.size) + padding + padding;
      canvasEl.height = (shape.rows * shape.size) + padding + padding;
    }

    //const walker = Grids.walkByRow(shape, {x:0, y:0}, true);
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.translate(padding, padding);
    ctx.strokeStyle = getCssVariable(`grid-color`, `whitesmoke`, this);
    for (const cell of Grids.cells(shape)) {
      let r = Grids.rectangleForCell(cell, shape);
      if (this.cellRenderer !== undefined) this.cellRenderer(cell, r, ctx);
      if (cell.x == this.selectedCell?.x && cell.y == this.selectedCell?.y) {
        ctx.fillStyle = getCssVariable(`hover-color`, `black`, this);
        ctx.fillRect(r.x, r.y, r.width, r.height);
      } else {
        ctx.strokeRect(r.x, r.y, r.width, r.height);
      }
    }
  }

  async updated() {
    this.draw();
  }

  _cellPointerUp(evt:PointerEvent) {
    const cell = Grids.cellAtPoint({x: evt.offsetX, y: evt.offsetY}, this.getGrid());
    if (cell === undefined) return;
    this.selectedCell = cell;
    const ev = new CustomEvent(`cellPointerUp`, {bubbles: true, composed: true, detail: cell});
    this.dispatchEvent(ev);
  }

  _cellPointerMove(evt:PointerEvent) {
    const cell = Grids.cellAtPoint({x: evt.offsetX, y: evt.offsetY}, this.getGrid());
    if (cell === undefined) return;

    const ev = new CustomEvent(`cellPointerMove`, {bubbles: true, composed: true, detail: cell});
    this.dispatchEvent(ev);
    this.title = `Cell ${cell.x}, ${cell.y}`;
  }

  renderToolbar() {
    if (!this.showToolbar) return ``;
    return html`
  <div class="toolbar">
    <section>
      <div class="row">
        <label>Rows:</label>
        <input @input="${this._sizeInput}" .value="${this.rows}" id="rows" type="number" min="1" max="500">
      </div>
      <div class="row">
        <label>Cols:</label>
        <input @input="${this._sizeInput}" .value="${this.cols}" id="cols" type="number" min="1" max="500">
      </div>
    </section>
    <section>
      <select>
        <option>Fill with</option>
      </select>
    </section>
  </div>`
  }

  render() {

   const h = html`
      <div class="container">
        ${this.renderToolbar()}
        <div id="preview"><canvas @pointermove="${this._cellPointerMove}" @pointerup="${this._cellPointerUp}" id="previewCanvas"></div>  
      </div>`;
    return h;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    // eslint-disable-next-line quotes
    readonly "grid-editor": GridEditor
  }
}