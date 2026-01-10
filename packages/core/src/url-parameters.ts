/**
 * Allows for access to URL parameters.
 * 
 * If `url` is not specified, `docment.location`'s .searchParams is used.
 * 
 * ```js
 * const p = parseUrlParameters();
 * 
 * // eg. gets an integer param called 'size`, using NaN as a default
 * p.int(`size`);
 * 
 * // As above, but will return 10 if 'size' is not specified in URL.
 * p.int(`size`, 10);
 * 
 * // Returns _true_ if 'engage' parameter is present and value is 'true'
 * p.bool(`engage`);
 * ```
 * @param url 
 * @returns 
 */
export const parseUrlParameters = (url?: string) => {
  const parameters: URLSearchParams = new URL(url ?? document.location.toString()).searchParams;

  return {
    params: parameters as URLSearchParams,
    int: (name: string, defaultValue: number = Number.NaN): number => intParamOrDefault(parameters, name, defaultValue),
    float: (name: string, defaultValue: number = Number.NaN): number => floatParamOrDefault(parameters, name, defaultValue),
    string: (name: string, defaultValue = ``): string => stringParamOrDefault(parameters, name, defaultValue),
    bool: (name: string): boolean => boolParamOrDefault(parameters, name)
  }
}

/**
 * Return an integer value from URL parameter or use a default value.
 * Value is considered _false_ if it's not present, or it is explicitly 'false'
 * @returns 
 */
function boolParamOrDefault(parameters: URLSearchParams, name: string): boolean {
  const p = parameters.get(name);
  if (p === null) return false;

  if (p === `true`) return true;
  return false;
}

/**
 * Return an integer value from URL parameter or use a default value
 * @returns 
 */
function intParamOrDefault(parameters: URLSearchParams, name: string, defaultValue: number): number {
  const p = parameters.get(name);
  if (p !== null) {
    const v = Number.parseInt(p);
    return v;
  }
  return defaultValue;
}

/**
 * Return a float value from URL parameter or use a default value
 * @returns 
 */
function floatParamOrDefault(parameters: URLSearchParams, name: string, defaultValue: number): number {
  const p = parameters.get(name);
  if (p !== null) {
    const v = Number.parseFloat(p);
    return v;
  }
  return defaultValue;
}

/**
 * Return a string value from URL parameter or use a default value
 * @returns 
 */
function stringParamOrDefault(parameters: URLSearchParams, name: string, defaultValue: string): string {
  const p = parameters.get(name);
  if (p !== null) {
    return p;
  }
  return defaultValue;
}