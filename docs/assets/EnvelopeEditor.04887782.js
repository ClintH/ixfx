var x=Object.defineProperty;var P=(e,a,t)=>a in e?x(e,a,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[a]=t;var p=(e,a,t)=>(P(e,typeof a!="symbol"?a+"":a,t),t);import{v as h,s as L,r as B,$ as b,i as T,e as m,n as _}from"./vendor.7c3c5fb6.js";import{s as g,g as C}from"./Grid.1cf73ea1.js";import{b as D}from"./Guards.9dd5c4a2.js";import{i as I,a as S,c as k,d as w}from"./Envelope.8b6e6092.js";import{g as E}from"./Rect.68a6fabc.js";import{b as j}from"./Util.0a46c3dc.js";import"./Events.084fe32f.js";const y=e=>O(e.strokeStyle,e.fillStyle),d=(e,a={})=>{if(e===void 0)throw Error("ctx undefined");const t=u(e).push(y(a));return t.apply(),t},O=(e,a)=>i=>{a&&(i.fillStyle=a),e&&(i.strokeStyle=e)},u=(e,a)=>(a===void 0&&(a=g()),{push:s=>{a===void 0&&(a=g());const r=a.push(s);return s(e),u(e,r)},pop:()=>{const s=a?.pop();return u(e,s)},apply:()=>a===void 0?u(e):(a.forEach(s=>s(e)),u(e,a))}),M=(e,a,t={})=>{const i=t.loop??!1;D(a),a.length!==0&&(a.forEach((n,s)=>C(n,`Index ${s}`)),d(e,t),e.beginPath(),e.moveTo(a[0].x,a[0].y),a.forEach(n=>e.lineTo(n.x,n.y)),i&&e.lineTo(a[0].x,a[0].y),e.stroke())},o=(e,a,t)=>{t===void 0&&(t={});const i=t.radius??10;if(d(e,t),e.beginPath(),Array.isArray(a))a.forEach(n=>{e.arc(n.x,n.y,i,0,2*Math.PI)});else{const n=a;e.arc(n.x,n.y,i,0,2*Math.PI)}(t.filled||!t.outlined)&&e.fill(),t.outlined&&e.stroke()},z=(e,a,t)=>{I(a)?A(e,a,t):S(a)&&q(e,a,t)},q=(e,a,t={})=>{let i=d(e,t);const{a:n,b:s,cubic1:r,cubic2:l}=a,$=t.debug??!1;e.beginPath(),e.moveTo(n.x,n.y),e.bezierCurveTo(r.x,r.y,l.x,l.y,s.x,s.y),e.stroke(),$&&(i=i.push(y({...t,strokeStyle:h(t.strokeStyle??"silver",.6),fillStyle:h(t.fillStyle??"yellow",.4)})),i.apply(),e.moveTo(n.x,n.y),e.lineTo(r.x,r.y),e.stroke(),e.moveTo(s.x,s.y),e.lineTo(l.x,l.y),e.stroke(),e.fillText("a",n.x+5,n.y),e.fillText("b",s.x+5,s.y),e.fillText("c1",r.x+5,r.y),e.fillText("c2",l.x+5,l.y),o(e,r,{radius:3}),o(e,l,{radius:3}),o(e,n,{radius:3}),o(e,s,{radius:3}),i=i.pop(),i.apply())},A=(e,a,t={})=>{const{a:i,b:n,quadratic:s}=a,r=t.debug??!1;let l=d(e,t);e.beginPath(),e.moveTo(i.x,i.y),e.quadraticCurveTo(s.x,s.y,n.x,n.y),e.stroke(),r&&(l=l.push(y({...t,strokeStyle:h(t.strokeStyle??"silver",.6),fillStyle:h(t.fillStyle??"yellow",.4)})),M(e,[i,s,n]),e.fillText("a",i.x+5,i.y),e.fillText("b",n.x+5,n.y),e.fillText("h",s.x+5,s.y),o(e,s,{radius:3}),o(e,i,{radius:3}),o(e,n,{radius:3}),l=l.pop(),l.apply())},N=(e,a,t={})=>{const i=t.debug??!1;d(e,t);const n=s=>{const{a:r,b:l}=s;e.beginPath(),e.moveTo(r.x,r.y),e.lineTo(l.x,l.y),i&&(e.fillText("a",r.x,r.y),e.fillText("b",l.x,l.y),o(e,r,{radius:5,strokeStyle:"black"}),o(e,l,{radius:5,strokeStyle:"black"})),e.stroke()};Array.isArray(a)?a.forEach(n):n(a)},R=(e,a,t=0)=>V(e,a,t),V=(e,a,t=0)=>{if(isNaN(t))throw Error("bend is NaN");if(t<-1||t>1)throw Error("Expects bend range of -1 to 1");const i=k(e,a,.5);let n=i;a.y<e.y?n=t>0?{x:Math.min(e.x,a.x),y:Math.min(e.y,a.y)}:{x:Math.max(e.x,a.x),y:Math.max(e.y,a.y)}:n=t>0?{x:Math.max(e.x,a.x),y:Math.min(e.y,a.y)}:{x:Math.min(e.x,a.x),y:Math.max(e.y,a.y)};const s=k(i,n,Math.abs(t));return F(e,a,s)},F=(e,a,t)=>({a:Object.freeze(e),b:Object.freeze(a),quadratic:Object.freeze(t)});var G=Object.defineProperty,U=Object.getOwnPropertyDescriptor,v=(e,a,t,i)=>{for(var n=i>1?void 0:i?U(a,t):a,s=e.length-1,r;s>=0;s--)(r=e[s])&&(n=(i?r(a,t,n):r(n))||n);return i&&n&&G(a,t,n),n};const J=e=>{if(!(e===null||typeof e=="undefined"||e==="undefined"))try{if(typeof e=="string")return e.length===0?void 0:JSON.parse(e)}catch(a){console.log(e),console.error(a)}};var f;let c=(f=class extends L{constructor(){super();p(this,"attackPreview");this.data=w(),this.json=void 0}connectedCallback(){this.hasAttribute("json")||this.setAttribute("json",this.innerText),super.connectedCallback()}onChanged(){const e=new CustomEvent("change",{bubbles:!0,composed:!0,detail:this.data});this.dispatchEvent(e)}_durationInput(e){const a=e.target,t=a.value,i=parseInt(t);switch(a.id){case"attackDuration":this.data={...this.data,attackDuration:i};break;case"decayDuration":this.data={...this.data,decayDuration:i};break;case"releaseDuration":this.data={...this.data,releaseDuration:i};break}this.onChanged()}_bendInput(e){const a=e.target,t=a.value,i=parseFloat(t)/100;switch(a.id){case"attackBend":this.data={...this.data,attackBend:i};break;case"decayBend":this.data={...this.data,decayBend:i};break;case"releaseBend":this.data={...this.data,releaseBend:i}}this.onChanged()}_valueInput(e){const a=e.target,t=a.value,i=parseFloat(t)/100;switch(a.id){case"initialValue":this.data={...this.data,initialLevel:i};break;case"peakLevel":this.data={...this.data,peakLevel:i};break;case"sustainLevel":this.data={...this.data,sustainLevel:i};break;case"releaseLevel":this.data={...this.data,releaseLevel:i};break}this.onChanged()}renderPreviews(){if(this.data===void 0)return;const e=this.data;this.renderPreview("attackPreview",e.attackBend,e.initialLevel,e.peakLevel),this.renderPreview("decayPreview",e.decayBend,e.peakLevel,e.sustainLevel),this.renderPreview("releasePreview",e.releaseBend,e.sustainLevel,e.releaseLevel);const{ctx:a,width:t,height:i}=this.setupCtx("sustainPreview"),n=e.sustainLevel??1;a!==void 0&&(N(a,{a:{x:0,y:(1-n)*i},b:{x:t,y:(1-n)*i}}),a.resetTransform())}setupCtx(e){const a=this.shadowRoot?.getElementById(e);if(a===null)return console.warn(`Canvas ${e} not found`),{ctx:void 0,width:0,padding:0,height:0};const t=a.getContext("2d");if(t===null)return console.warn(`Canvas ctx could not be created for ${e}`),{ctx:void 0,width:0,padding:0,height:0};const i=4,n=100,s=100;return t.clearRect(0,0,n,s),t.strokeStyle=E("theme-accent","yellow"),t.lineWidth=3,t.translate(i/2,i/2),{ctx:t,padding:i,width:n-i-i,height:s-i-i}}renderPreview(e,a,t,i){a===void 0&&(a=0),t===void 0&&(t=0),i===void 0&&(i=1);const{ctx:n,width:s,height:r}=this.setupCtx(e);if(n===void 0)return;const l=R({x:0,y:(1-t)*r},{x:s,y:(1-i)*r},a);z(n,l),n.resetTransform()}async updated(){this.renderPreviews()}_reset(){this.data=w(),this.requestUpdate()}_copy(){j(this.data)}render(){if(this.data===void 0)return b`<div>(undefined envelope)</div>`;const e=this.data;return b`
<div class="container">
<div id="preview">
</div>  
<div id="controls">
  <section>
    <h2>Attack</h2>
    <canvas title="Preview of attack stage" id="attackPreview" width="100" height="100"></canvas>
    <label>Duration: ${e.attackDuration} ms
      <input @input="${this._durationInput}" .value="${e.attackDuration}" type="range" id="attackDuration" min="0" max="5000">
    </label>
    <label>Bend: ${e.attackBend}
      <input @input="${this._bendInput}" .value="${e.attackBend*100}" type="range" id="attackBend" min="-100" max="100">
    </label>
    <label>Initial: ${e.initialLevel}
      <input @input="${this._valueInput}" .value=${e.initialLevel*100} type="range" id="initialValue" min="0" max="100">
    </label>
  </section>
  <section>
    <h2>Decay</h2>
    <canvas title="Preview of decay stage" id="decayPreview" width="100" height="100"></canvas>
    <label>Duration: ${e.decayDuration} ms
      <input @input="${this._durationInput}" .value="${e.decayDuration}" type="range" id="decayDuration" min="0" max="5000">
    </label>
    <label>Bend: ${e.decayBend}
      <input @input="${this._bendInput}" .value="${e.decayBend*100}" type="range" id="decayBend" min="-100" max="100">
    </label>
    <label>Peak: ${e.peakLevel}
      <input @input="${this._valueInput}" .value="${e.peakLevel*100}" type="range" id="peakLevel" min="0" max="100">
    </label>
  </section>
  <section>
    <h2>Sustain</h2>
    <canvas title="Preview of sustain stage" id="sustainPreview" width="100" height="100"></canvas>
    <label>Level: ${e.sustainLevel}
      <input @input="${this._valueInput}" .value="${e.sustainLevel*100}" type="range" id="sustainLevel" min="0" max="100">
    </label>
  </section>
  <section>
    <h2>Release</h2>
    <canvas title="Preview of release stage" id="releasePreview" width="100" height="100"></canvas>
    <label>Duration: ${e.releaseDuration} ms
      <input @input="${this._durationInput}" .value="${e.releaseDuration}" type="range" id="releaseDuration" min="0" max="5000">
    </label>
    <label>Bend: ${e.releaseBend}
      <input @input="${this._bendInput}" .value="${e.releaseBend*100}" type="range" id="releaseBend" min="-100" max="100">
    </label>
    <label>Release: ${e.releaseLevel}
      <input @input="${this._valueInput}" .value="${e.releaseLevel*100}" type="range" id="releaseLevel" min="0" max="100">
    </label>
  </section>
</div>
<div class="toolbar">
  <button title="Reset envelope to starting state" @click="${this._reset}">Reset</button>
  <button title="Copy envelope data to clipboard" @click="${this._copy}">Copy envelope</button>
</div>
</div>`}},p(f,"styles",B`
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
  `),f);v([T("#attackPreview")],c.prototype,"attackPreview",2);v([m()],c.prototype,"data",2);v([m({converter:J,type:Object})],c.prototype,"json",2);c=v([_("envelope-editor")],c);
