/**
 * Manage a set of named colours. Uses CSS variables as a fallback if colour is not added
 *
 */
export type NamedColourPalette = {
  setElementBase(el: Element): void;
  has(key: string): boolean;

  /**
   * Returns a colour by name.
   *
   * If the colour is not found:
   *  1. Try to use a CSS variable `--key`, or
   *  2. The next fallback colour is used (array cycles)
   *
   * @param key
   * @param fallback
   * @returns
   */
  get(key: string, fallback?: string): string;

  /**
   * Gets a colour by key, adding and returning fallback if not present
   * @param key Key of colour
   * @param fallback Fallback colour if key is not found
   */
  getOrAdd(key: string, fallback?: string): string;

  /**
   * Adds a colour with a given key
   *
   * @param key
   * @param value
   */
  add(key: string, value: string): void;

  alias(from: string, to: string): void;
};

export const create = (fallbacks?: ReadonlyArray<string>): NamedColourPalette =>
  new NamedColourPaletteImpl(fallbacks);

class NamedColourPaletteImpl {
  readonly #store: Map<string, string> = new Map();
  readonly #aliases: Map<string, string> = new Map();

  readonly fallbacks: ReadonlyArray<string>;
  #lastFallback = 0;

  #elementBase: Element;

  constructor(fallbacks?: ReadonlyArray<string>) {
    if (fallbacks !== undefined) this.fallbacks = fallbacks;
    else this.fallbacks = [ `red`, `blue`, `green`, `orange` ];
    this.#elementBase = document.body;
  }

  setElementBase(el: Element) {
    this.#elementBase = el;
  }

  add(key: string, colour: string) {
    this.#store.set(key, colour);
  }

  alias(from: string, to: string) {
    this.#aliases.set(from, to);
  }

  get(key: string, fallback?: string): string {
    const alias = this.#aliases.get(key);
    if (alias !== undefined) key = alias;

    const c = this.#store.get(key);
    if (c !== undefined) return c;

    const variableName = `--` + key;
    let fromCss = getComputedStyle(this.#elementBase)
      .getPropertyValue(variableName)
      .trim();

    // Not found
    if (fromCss === undefined || fromCss.length === 0) {
      if (fallback !== undefined) return fallback;
      fromCss = this.fallbacks[ this.#lastFallback ];
      this.#lastFallback++;
      if (this.#lastFallback === this.fallbacks.length) this.#lastFallback = 0;
    }
    return fromCss;
  }

  getOrAdd(key: string, fallback?: string): string {
    if (this.has(key)) return this.get(key);
    const c = this.get(key, fallback);
    this.add(key, c);
    return c;
  }

  has(key: string): boolean {
    return this.#store.has(key);
  }
}
