
export type Palette = {
  //eslint-disable-next-line functional/no-method-signature
  setElementBase(el:Element):void
  //eslint-disable-next-line functional/no-method-signature
  has(key:string):boolean
  //eslint-disable-next-line functional/no-method-signature
  get(key:string, fallback?:string):string
  add(key:string, value:string):void
};

export const create = (fallbacks?:readonly string[]):Palette => new PaletteImpl(fallbacks);

/**
 * Manage a set of colours. Uses CSS variables as a fallback if colour is not added
 *
 * @export
 * @class Palette
 */
class PaletteImpl {
  /* eslint-disable-next-line functional/prefer-readonly-type */
  readonly #store:Map<string, string> = new Map();
  /* eslint-disable-next-line functional/prefer-readonly-type */
  readonly #aliases:Map<string, string> = new Map();

  readonly fallbacks:readonly string[];
  #lastFallback = 0;

  #elementBase:Element;

  constructor(fallbacks?:readonly string[]) {
    if (fallbacks !== undefined) this.fallbacks = fallbacks;
    else this.fallbacks = [`red`, `blue`, `green`, `orange`];
    this.#elementBase = document.body;

  }

  setElementBase(el:Element) {
    this.#elementBase = el;
  }

  /**
   * Adds a colour with a given name
   *
   * @param {string} key
   * @param {string} colour
   * @memberof Palette
   */
  add(key:string, colour:string) {
    this.#store.set(key, colour);
  }

  alias(from:string, to:string) {
    this.#aliases.set(from, to);
  }
  /**
   * Returns a colour by name. 
   * 
   * If the colour is not found:
   *  1. Try to use a CSS variable, or
   *  2. Fallback to default value (`rebeccapurple`).
   *
   * @param {string} key
   * @returns {string}
   * @memberof Palette
   */
  get(key:string, fallback?:string):string {
    const alias =  this.#aliases.get(key);
    if (alias !== undefined) key = alias;
  
    const c = this.#store.get(key);
    if (c !== undefined) return c;

    const varName = `--` + key;
    // eslint-disable-next-line functional/no-let
    let fromCss = getComputedStyle(this.#elementBase).getPropertyValue(varName).trim();

    // Not found
    if (fromCss === undefined || fromCss.length === 0) {
      if (fallback !== undefined) return fallback;
      fromCss = this.fallbacks[this.#lastFallback];
      this.#lastFallback++;
      if (this.#lastFallback === this.fallbacks.length) this.#lastFallback = 0;
    }
    return fromCss;
  }

  has(key:string):boolean {
    return this.#store.has(key);
  }
}

export const getCssVariable = (name:string, fallbackColour:string = `black`, root?:HTMLElement) => {
  if (root === undefined) root = document.body;
  const fromCss = getComputedStyle(root).getPropertyValue(`--${name}`).trim();
  if (fromCss === undefined || fromCss.length === 0) return fallbackColour;
  return fromCss;
};