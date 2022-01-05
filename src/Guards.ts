export const percent = (t: number, name = `?`): void => {
  if (isNaN(t)) throw new Error(`Parameter '${name}' is NaN`);
  if (t < 0) throw new Error(`Parameter '${name}' must be above or equal to 0`);
  if (t > 1) throw new Error(`Parameter '${name}' must be below or equal to 1`);
};

export const array = (t: any, name = `?`): void => {
  if (!Array.isArray(t)) throw new Error(`Parameter '${name}' is expected to be an array'`);
};

export const defined = <T>(argument: T | undefined): argument is T => argument !== undefined;
