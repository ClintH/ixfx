export const threshold = (threshold: number) => {
  return (v: number) => {
    return v >= threshold;
  };
};

export const rangeInclusive = (min: number, max: number) => {
  return (v: number) => {
    return v >= min && v <= max;
  };
};

export const filter = <V>(v: V, fn: (v: V) => boolean, skipValue: V | undefined): V | undefined => {
  if (fn(v)) return v;
  return skipValue;
};