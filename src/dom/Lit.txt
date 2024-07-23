/**
 * Warning: don't export Lit.js anywhere, because this breaks usage under Node.js
 */
import { render, type TemplateResult } from 'lit-html';
import { resolveEl } from './ResolveEl.js';
import type { Reactive } from '../rx/Types.js';
import { hasLast } from '../rx/index.js';

export { html as LitHtml } from 'lit-html';

/**
 * Dynamically render a reactive value using [lit-html](https://lit.dev/docs/libraries/standalone-templates/).
 * 
 * ```js
 * // Reactive number
 * const num = Rx.number(10);
 * 
 * // Render value into #test as a H1 tag
 * Rx.lit(`#test`, num, x => Rx.LitHtml`<h1>${x}</h1>`)
 *
 * // For demo purposes, update value.
 * // Re-rendering will happen automatically.
 * setInterval(() => {
 *   num.set(Math.floor(Math.random()*100));
 * }, 100);
 * ```
 * @param elOrQuery 
 * @param source 
 * @param gen 
 */
export const lit = <T>(elOrQuery: string | HTMLElement, source: Reactive<T>, gen: (s: T | undefined) => TemplateResult<any>) => {
  const el = resolveEl(elOrQuery);
  source.onValue(value => {
    render(gen(value), el);
  });

  if (hasLast(source)) {
    render(gen(source.last()), el);
  }

}
