var f=Object.defineProperty;var w=(t,e,s)=>e in t?f(t,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[e]=s;var a=(t,e,s)=>(w(t,typeof e!="symbol"?e+"":e,s),s);import{s as b,r as m,$ as d,e as c,n as g}from"./vendor.7c3c5fb6.js";import{g as u}from"./Rect.68a6fabc.js";import{i as y,c as x,r as C,a as v}from"./Grid.89c8e304.js";import"./Grid.1cf73ea1.js";import"./Guards.9dd5c4a2.js";import"./util.7f611b44.js";import"./Events.084fe32f.js";var z=Object.defineProperty,_=Object.getOwnPropertyDescriptor,n=(t,e,s,i)=>{for(var r=i>1?void 0:i?_(e,s):e,o=t.length-1,h;o>=0;o--)(h=t[o])&&(r=(i?h(e,s,r):h(r))||r);return i&&r&&z(e,s,r),r},p;let l=(p=class extends b{constructor(){super();a(this,"lastCanvasSize",{rows:0,cols:0,shape:15});a(this,"cellRenderer");this.rows=5,this.cols=5,this.showToolbar=!1,this.pixelSize=15}onChanged(){const t=new CustomEvent("change",{bubbles:!0,composed:!0,detail:this.getGrid()});this.dispatchEvent(t)}getGrid(){const t=typeof this.rows=="string"?parseInt(this.rows):this.rows,e=typeof this.cols=="string"?parseInt(this.cols):this.cols,s=typeof this.pixelSize=="string"?parseInt(this.pixelSize):this.pixelSize;return{rows:t,cols:e,size:s}}_sizeInput(t){const e=t.target,s=e.value,i=parseInt(s);switch(e.id){case"rows":this.rows=i;break;case"cols":this.cols=i;break}this.onChanged()}draw(){const t=this.getGrid(),e=this.shadowRoot?.getElementById("previewCanvas");if(e===null)return;const s=e.getContext("2d");if(s===null)return;const i=3;y(t,this.lastCanvasSize)||(e.width=t.cols*t.size+i+i,e.height=t.rows*t.size+i+i),s.clearRect(0,0,e.width,e.height),s.translate(i,i),s.strokeStyle=u("grid-color","whitesmoke",this);for(const r of x(t)){let o=C(r,t);this.cellRenderer!==void 0&&this.cellRenderer(r,o,s),r.x==this.selectedCell?.x&&r.y==this.selectedCell?.y?(s.fillStyle=u("hover-color","black",this),s.fillRect(o.x,o.y,o.width,o.height)):s.strokeRect(o.x,o.y,o.width,o.height)}}async updated(){this.draw()}_cellPointerUp(t){const e=v({x:t.offsetX,y:t.offsetY},this.getGrid());if(e===void 0)return;this.selectedCell=e;const s=new CustomEvent("cellPointerUp",{bubbles:!0,composed:!0,detail:e});this.dispatchEvent(s)}_cellPointerMove(t){const e=v({x:t.offsetX,y:t.offsetY},this.getGrid());if(e===void 0)return;const s=new CustomEvent("cellPointerMove",{bubbles:!0,composed:!0,detail:e});this.dispatchEvent(s),this.title=`Cell ${e.x}, ${e.y}`}renderToolbar(){return this.showToolbar?d`
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
  </div>`:""}render(){return d`
      <div class="container">
        ${this.renderToolbar()}
        <div id="preview"><canvas @pointermove="${this._cellPointerMove}" @pointerup="${this._cellPointerUp}" id="previewCanvas"></div>  
      </div>`}},a(p,"styles",m`
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
  `),p);n([c()],l.prototype,"selectedCell",2);n([c()],l.prototype,"rows",2);n([c()],l.prototype,"cols",2);n([c()],l.prototype,"pixelSize",2);n([c()],l.prototype,"showToolbar",2);l=n([g("grid-editor")],l);
