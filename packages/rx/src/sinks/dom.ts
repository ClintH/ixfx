import { setProperty } from "@ixfxfun/dom";
import { resolveSource } from "../resolve-source.js";
import type { ReactiveOrSource } from "../types.js";

export type SetHtmlOptionsQuery = {
  query: string
}

export type SetHtmlOptionsElement = {
  el: HTMLElement
}

export type SetHtmlOptions = (SetHtmlOptionsQuery | SetHtmlOptionsElement) & {
  /**
   * If _true_ .innerHTML is used
   * If _false_ (default) .textContent is used
   */
  asHtml?: boolean;
};

/**
 * Values from `input` are set to the textContent/innerHTML of an element.
 * ```js
 * const rxSource = Rx.From.string('hello');
 * const rxSet = Rx.Sinks.setHtmlText(rxSource, { query: })
 * ```
 * @param rxOrSource 
 * @param optionsOrElementOrQuery 
 */
export const setHtmlText = (rxOrSource: ReactiveOrSource<any>, optionsOrElementOrQuery: SetHtmlOptions | string | HTMLElement) => {
  let el: HTMLElement | null | undefined;
  let options: SetHtmlOptions | undefined;
  if (typeof optionsOrElementOrQuery === `string`) {
    options = { query: optionsOrElementOrQuery };
  }
  if (typeof optionsOrElementOrQuery === `object`) {
     
    if (`nodeName` in optionsOrElementOrQuery) {
      options = { el: optionsOrElementOrQuery };
    } else {
      options = optionsOrElementOrQuery;
    }
  }
  if (options === undefined) throw new TypeError(`Missing element as second parameter or option`);
  if (`el` in options) {
    el = options.el;
  } else if (`query` in options) {
    el = document.querySelector<HTMLElement>(options.query);
  } else {
    throw new TypeError(`Options does not include 'el' or 'query' fields`);
  }
  if (el === null || el === undefined) throw new Error(`Element could not be resolved.`);

  const stream = resolveSource(rxOrSource);
  const setter = setProperty(options.asHtml ? `innerHTML` : `textContent`, el);
  const off = stream.onValue(value => {
    setter(value)
  });
  return off;
}