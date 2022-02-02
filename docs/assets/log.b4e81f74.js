import{r as L,a as h}from"./ShadowDom.fdb125f9.js";const k=(p,d={})=>{const{capacity:c=0,monospaced:u=!0,timestamp:g=!1,collapseDuplicates:v=!0}=d;let m=0,a,s=0;const b=L(p),M=h(b,`
  .log {
    font-family: ${u?'Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", Monaco, "Courier New", Courier, monospace':"normal"};
    background-color: var(--code-background-color);
    padding: var(--padding1, 0.2em);
  }
  .timestamp {
    margin-right: 0.5em;
    opacity: 0.5;
    font-size: 70%;
    align-self: center;
  }
  .line {
    display: flex;
  }
  .line:hover {
    background-color: var(--theme-bg-hover, whitesmoke);
  }
  .error {
    color: red;
  }
  .badge {
    border: 1px solid currentColor;
    align-self: center;
    font-size: 70%;
    padding-left: 0.2em;
    padding-right: 0.2em;
    border-radius: 1em;
    margin-left: 0.5em;
    margin-right: 0.5em;
  }
  .msg {
    flex: 1;
  }
  `),t=document.createElement("div");t.className="log",M.append(t);const y=n=>{const e=document.createElement("div");if(typeof n=="string")e.innerHTML=n;else if(n instanceof Error){const o=n.stack;o===void 0?e.innerHTML=n.toString():e.innerHTML=o.toString()}else e.innerHTML=n;e.classList.add("error"),r(e),a=void 0,s=0};let f=0;const S=(n="")=>{let e;const o=window.performance.now()-f;if(!(d.minIntervalMs&&o<d.minIntervalMs))if(f=window.performance.now(),typeof n=="object"?e=JSON.stringify(n):n===void 0?e="(undefined)":n===null?e="(null)":typeof n=="number"?(Number.isNaN(e)&&(e="(NaN)"),e=n.toString()):e=n,e.length===0){const i=document.createElement("hr");a=void 0,r(i)}else if(e===a&&v){const i=t.firstElementChild;let l=i.querySelector(".badge");l===null&&(l=document.createElement("div"),l.className="badge",i.insertAdjacentElement("beforeend",l)),i!==null&&(l.textContent=(++s).toString())}else{const i=document.createElement("div");i.innerHTML=e,r(i),a=e}},r=n=>{if(g){const e=document.createElement("div"),o=document.createElement("div");o.className="timestamp",o.innerText=new Date().toLocaleTimeString(),e.append(o,n),n.classList.add("msg"),e.classList.add("line"),n=e}else n.classList.add("line","msg");if(t.insertBefore(n,t.firstChild),c>0&&++m>c*2)for(;m>c;)t.lastChild?.remove(),m--;s=0};return{error:y,log:S,append:r,clear:()=>{t.innerHTML="",a=void 0,s=0},dispose:()=>{t.remove()}}};export{k as l};
