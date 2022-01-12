
/**
 * Manage a set of colours. Uses CSS variables as a fallback if colour is not added
 *
 * @export
 * @class Palette
 */
export class Palette {
  readonly #store:Map<string, string> = new Map();
  default = `rebeccapurple`;

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
    let c = this.#store.get(key);
    if (c === undefined) {
      const varName = `--` + key;
      c = getComputedStyle(document.body).getPropertyValue(varName).trim();
      if (c === undefined) return this.default;

      // Cache CSS variable
      this.add(varName, c);
    }
    return c;
  }
}