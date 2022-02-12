/**
 * Manage a set of colours. Uses CSS variables as a fallback if colour is not added
 *
 */
export type Palette = {
  //eslint-disable-next-line functional/no-method-signature
  setElementBase(el:Element):void
  //eslint-disable-next-line functional/no-method-signature
  has(key:string):boolean

  /**
   * Returns a colour by name. 
   * 
   * If the colour is not found:
   *  1. Try to use a CSS variable `--key`, or
   *  2. The next fallback colour is used (array cycles)
   *
   * @param key
   * @returns
   */
  //eslint-disable-next-line functional/no-method-signature
  get(key:string, fallback?:string):string

  /**
   * Gets a colour by key, adding and returning fallback if not present
   * @param key Key of colour
   * @param fallback Fallback colour if key is not found
   */
  //eslint-disable-next-line functional/no-method-signature
  getOrAdd(key: string, fallback?:string):string

  /**
   * Adds a colour with a given key
   *
   * @param key
   * @param colour
   */
  //eslint-disable-next-line functional/no-method-signature
  add(key:string, value:string):void

  alias(from:string, to:string):void
};

export const create = (fallbacks?:readonly string[]):Palette => new PaletteImpl(fallbacks);

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

  add(key:string, colour:string) {
    this.#store.set(key, colour);
  }

  alias(from:string, to:string) {
    this.#aliases.set(from, to);
  }

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

  getOrAdd(key:string, fallback?:string):string {
    if (this.has(key)) return this.get(key);
    const c = this.get(key, fallback);
    this.add(key, c);
    return c;
  }

  has(key:string):boolean {
    return this.#store.has(key);
  }
}

