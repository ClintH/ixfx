import { setCssClass, setCssDisplay, setCssToggle } from "./Css.js";
import { resolveEl, resolveEls, type QueryOrElements } from "./ResolveEl.js";
import { setHtml, setText } from "./SetProperty.js";

export const el = (selectors: QueryOrElements) => {
  const elements = resolveEls(selectors);
  const text = setText(elements);
  const html = setHtml(elements);
  return {
    text,
    html,
    cssDisplay: (value: string) => { setCssDisplay(elements, value); },
    cssClass: (value: boolean, cssClass: string) => { setCssClass(elements, value, cssClass); },
    cssToggle: (cssClass: string) => { setCssToggle(elements, cssClass); },
    el: () => elements[ 0 ],
    els: () => elements
  }
}

export const elRequery = (selectors: string) => {
  ({
    text: (value: string | number) => { setText(selectors, value); },
    html: (value: string | number) => { setHtml(selectors, value); },
    cssDisplay: (value: string) => { setCssDisplay(selectors, value); },
    cssClass: (value: boolean, cssClass: string) => { setCssClass(selectors, value, cssClass); },
    cssToggle: (cssClass: string) => { setCssToggle(selectors, cssClass); },
    el: () => resolveEl(selectors),
    els: () => resolveEls(selectors)
  });
}
