export const addShadowCss = (
  parentEl: Readonly<HTMLElement>,
  styles: string
): ShadowRoot => {
  const styleEl = document.createElement(`style`);

  //eslint-disable-next-line functional/immutable-data
  styleEl.textContent = styles;
  //eslint-disable-next-line functional/no-let
  let shadowRoot;
  if (parentEl.shadowRoot) {
    shadowRoot = parentEl.shadowRoot;
    //eslint-disable-next-line functional/immutable-data
    shadowRoot.innerHTML = ``;
  } else {
    shadowRoot = parentEl.attachShadow({ mode: `open` });
  }
  shadowRoot.append(styleEl);
  return shadowRoot;
};
