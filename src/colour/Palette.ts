
/**
 * Manage a set of colours. Uses CSS variables as a fallback if colour is not added
 *
 * @export
 * @class Palette
 */
export class Palette {
  /* eslint-disable-next-line functional/prefer-readonly-type */
  readonly #store:Map<string, string> = new Map();
  /* eslint-disable-next-line functional/prefer-readonly-type */
  readonly #aliases:Map<string, string> = new Map();

  readonly fallbacks:string[];
  #lastFallback = 0;

  constructor(fallbacks?:string[]) {
    if (fallbacks !== undefined) this.fallbacks = fallbacks;
    else this.fallbacks = [`red`, `blue`, `green`, `orange`];
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
  get(key:string):string {
    const alias =  this.#aliases.get(key);
    if (alias !== undefined) key = alias;
  
    const c = this.#store.get(key);
    if (c !== undefined) return c;

    const varName = `--` + key;
    // eslint-disable-next-line functional/no-let
    let fromCss = getComputedStyle(document.body).getPropertyValue(varName).trim();

    if (fromCss === undefined || fromCss.length === 0) {
      fromCss = this.fallbacks[this.#lastFallback];
      this.#lastFallback++;
      if (this.#lastFallback === this.fallbacks.length) this.#lastFallback = 0;
    }
    // Cache CSS variable
    this.add(key, fromCss);
    return fromCss;
  }

  has(key:string):boolean {
    return this.#store.has(key);
  }
}

export const getCssVariable = (name:string, fallbackColour:string = `black`) => {
  const fromCss = getComputedStyle(document.body).getPropertyValue(`--${name}`).trim();
  if (fromCss === undefined || fromCss.length === 0) return fallbackColour;
  return fromCss;
};