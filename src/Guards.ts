export const percent = (t: number, name = `?`): void => {
  if (Number.isNaN(t)) throw new Error(`Parameter '${name}' is NaN`);
  if (t < 0) throw new Error(`Parameter '${name}' must be above or equal to 0`);
  if (t > 1) throw new Error(`Parameter '${name}' must be below or equal to 1`);
};

export const notNegative = (t:number, name = `?`):boolean => {
  if (t < 0) throw new Error(`Parameter ${name} must be at least zero`);
  return true;
};

export const integer = (t:number, name = `?`, enforcePositive = false) => {
  if (Number.isNaN(t)) throw new Error(`Parameter '${name}' is NaN`);
  if (!Number.isInteger(t)) throw new Error(`Paramter ${name} is not an integer`);
  if (enforcePositive && t < 0) throw new Error(`Parameter '${name}' must be at least zero`);

}

export const isStringArray = (t:any):boolean => {
  if (!Array.isArray(t)) return false;
  for (let i=0;i<t.length;i++) {
    if (typeof t[i] !== `string`) return false;
  }
  return true;
};

export const array = (t: any, name = `?`): void => {
  if (!Array.isArray(t)) throw new Error(`Parameter '${name}' is expected to be an array'`);
};

export const defined = <T>(argument: T | undefined): argument is T => argument !== undefined;
