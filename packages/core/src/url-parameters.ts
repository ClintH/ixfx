export const parseUrlParameters = (url?: string) => {
  const parameters = new URL(url ?? document.location.toString()).searchParams;

  return {
    params: parameters,
    int: (name: string, defaultValue: number = Number.NaN) => intParamOrDefault(parameters, name, defaultValue),
    float: (name: string, defaultValue: number = Number.NaN) => floatParamOrDefault(parameters, name, defaultValue),
    string: (name: string, defaultValue = ``) => stringParamOrDefault(parameters, name, defaultValue),
    bool: (name: string) => boolParamOrDefault(parameters, name)
  }
}

/**
 * Return an integer value from URL parameter or use a default value.
 * Value is considered _false_ if it's not present, or it is explicitly 'false'
 * @returns 
 */
function boolParamOrDefault(parameters: URLSearchParams, name: string) {
  const p = parameters.get(name);
  if (p === null) return false;

  if (p === `true`) return true;
  return false;
}

/**
 * Return an integer value from URL parameter or use a default value
 * @returns 
 */
function intParamOrDefault(parameters: URLSearchParams, name: string, defaultValue: number) {
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
function floatParamOrDefault(parameters: URLSearchParams, name: string, defaultValue: number) {
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
function stringParamOrDefault(parameters: URLSearchParams, name: string, defaultValue: string) {
  const p = parameters.get(name);
  if (p !== null) {
    return p;
  }
  return defaultValue;
}