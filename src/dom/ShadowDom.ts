export const addShadowCss = (parentEl:HTMLElement, styles:string):ShadowRoot => {
  const styleEl = document.createElement(`style`);
  styleEl.textContent = styles;

  const shadowRoot = parentEl.attachShadow({ mode: `open` });
  shadowRoot.appendChild(styleEl);
  return shadowRoot;
};