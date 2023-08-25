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

export const filter = <V>(v: V, predicate: (v: V) => boolean, skipValue: V | undefined): V | undefined => {
  if (predicate(v)) return v;
  return skipValue;
};