export const addShadowCss = (parentEl:HTMLElement, styles:string):ShadowRoot => {
  const styleEl = document.createElement(`style`);
  styleEl.textContent = styles;

  let shadowRoot;
  if (parentEl.shadowRoot) {
    shadowRoot = parentEl.shadowRoot;
    shadowRoot.innerHTML = ``;
  } else {
    shadowRoot = parentEl.attachShadow({ mode: `open` });
  }
  shadowRoot.appendChild(styleEl);
  return shadowRoot;
};
