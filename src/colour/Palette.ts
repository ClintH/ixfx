
/**
 * Manage a set of colours. Uses CSS variables as a fallback if colour is not added
 *
 * @export
 * @class Palette
 */
export class Palette {
  /* eslint-disable-next-line functional/prefer-readonly-type */
  readonly #store:Map<string, string> = new Map();
  readonly finalFallback:string;

  constructor(finalFallback:string = `rebeccapurple`) {
    this.finalFallback = finalFallback;
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
    const c = this.#store.get(key);
    if (c !== undefined) return c;

    const varName = `--` + key;
    const fromCss = getComputedStyle(document.body).getPropertyValue(varName).trim();
    if (fromCss === undefined) return this.finalFallback;

    // Cache CSS variable
    this.add(varName, fromCss);
    return fromCss;
  }
}