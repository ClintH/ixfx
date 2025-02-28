export const resolveCss = (colour: string, fallback?: string): string => {
  if (typeof colour === `string`) {
    if (colour.startsWith(`--`)) {
      // Resolve CSS variable
      const value = getComputedStyle(document.body).getPropertyValue(colour);
      if (!value || value.length === 0) {
        if (!fallback) throw new Error(`Variable not found: ${ colour }`);
        return fallback;
      }
      return value;
    }
  }
  return colour;
}

/**
 * Gets a CSS variable.
 * ```
 * // Fetch --accent variable, or use `yellow` if not found.
 * getCssVariable(`accent`, `yellow`);
 * ```
 * @param name Name of variable. Leading '--' is unnecessary
 * @param fallbackColour Fallback colour if not found
 * @param root  Element to search variable from
 * @returns Colour or fallback.
 */
export const getCssVariable = (
  name: string,
  fallbackColour = `black`,
  root?: HTMLElement
): string => {
  if (root === undefined) root = document.body;
  if (name.startsWith(`--`)) name = name.slice(2);
  const fromCss = getComputedStyle(root).getPropertyValue(`--${ name }`).trim();
  if (fromCss === undefined || fromCss.length === 0) return fallbackColour;
  return fromCss;
};