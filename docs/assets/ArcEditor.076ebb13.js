var S=Object.defineProperty;var b=(i,e,n)=>e in i?S(i,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):i[e]=n;var c=(i,e,n)=>(b(i,typeof e!="symbol"?e+"":e,n),n);import{s as f,r as v,$ as w,e as u}from"./vendor.7c3c5fb6.js";import{t as y}from"./Arc.9ff8c67a.js";import"./Grid.1cf73ea1.js";const p=(i,e,n)=>{const t=document.createElementNS("http://www.w3.org/2000/svg","path");return t.setAttributeNS(null,"d",i),e.appendChild(t),n&&o(t,n),t},m=(i,e,n)=>{const t=document.createElementNS("http://www.w3.org/2000/svg","circle");return t.setAttributeNS(null,"cx",i.x.toString()),t.setAttributeNS(null,"cy",i.y.toString()),t.setAttributeNS(null,"r",i.radius.toString()),e.appendChild(t),n&&o(t,n),t},h=(i,e,n)=>{let t=null;if(n!==void 0&&(t=i.querySelector(`#${n}`)),t===null){const r=document.createElementNS("http://www.w3.org/2000/svg",e);return i.appendChild(r),n&&(r.id=n),r}return t},A=(i,e,n,t)=>{const r=h(e,"line",t);return r.setAttributeNS(null,"x1",i.a.x.toString()),r.setAttributeNS(null,"y1",i.a.y.toString()),r.setAttributeNS(null,"x2",i.b.x.toString()),r.setAttributeNS(null,"y2",i.b.y.toString()),n&&o(r,n),r},N=(i,e,n,t,r)=>{const s=h(n,"text",r);return s.setAttributeNS(null,"x",i.x.toString()),s.setAttributeNS(null,"y",i.y.toString()),s.textContent=e,t&&(o(s,t),t.anchor&&s.setAttributeNS(null,"text-anchor",t.anchor),t.align&&s.setAttributeNS(null,"alignment-baseline",t.align)),s},o=(i,e)=>{e.fillStyle&&i.setAttributeNS(null,"fill",e.fillStyle),e.strokeStyle&&i.setAttributeNS(null,"stroke",e.strokeStyle),e.strokeWidth&&i.setAttributeNS(null,"stroke-width",e.strokeWidth.toString())},g=(i,e)=>(e&&o(i,e),{text:(t,r,s,a)=>N(t,r,i,s,a),line:(t,r,s)=>A(t,i,r,s),circle:(t,r)=>m(t,i,r),path:(t,r)=>p(t,i,r),query:t=>i.querySelector(t),get width(){const t=i.getAttributeNS(null,"width");return t===null?0:parseFloat(t)},set width(t){i.setAttributeNS(null,"width",t.toString())},get height(){const t=i.getAttributeNS(null,"height");return t===null?0:parseFloat(t)},set height(t){i.setAttributeNS(null,"height",t.toString())},clear:()=>{for(;i.firstChild;)i.removeChild(i.lastChild)}});var R=Object.defineProperty,x=Object.getOwnPropertyDescriptor,d=(i,e,n,t)=>{for(var r=t>1?void 0:t?x(e,n):e,s=i.length-1,a;s>=0;s--)(a=i[s])&&(r=(t?a(e,n,r):a(r))||r);return t&&r&&R(e,n,r),r};const C="arc-editor";class l extends f{constructor(){super();this.startRadian=0,this.endRadian=Math.PI,this.radius=10}getArc(){return{startRadian:this.startRadian,endRadian:this.endRadian,radius:this.radius,counterClockwise:this.counterClockwise}}setArc(e){this.radius=e.radius,this.startRadian=e.startRadian,this.endRadian=e.endRadian,this.counterClockwise=e.counterClockwise}getBounds(){const e=g(this.shadowRoot.querySelector("svg"));return{width:e.width,height:e.height}}renderSvg(){const e=g(this.shadowRoot.querySelector("svg"),{fillStyle:"transparent",strokeStyle:"pink",strokeWidth:3});e.clear();const n=e.width,t=e.height,r=this.getArc(),s={x:n/2,y:t/2};e.path(y(s,r))}async updated(){this.renderSvg()}render(){return w`
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
		`}}c(l,"styles",v`
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
  `);d([u()],l.prototype,"startRadian",2);d([u()],l.prototype,"endRadian",2);d([u()],l.prototype,"counterClockwise",2);d([u()],l.prototype,"radius",2);customElements.define(C,l);
