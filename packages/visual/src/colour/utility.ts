export function calculateHueDistance(a: number, b: number, limit = 1) {
  let long = -1;
  let short = -1;
  if (b < a) {
    long = (b - a);
    short = limit - (a - b);
  } else {
    long = (b - a);
    short = (long) - limit;
  }
  const forward = short > 0 ? short : long;
  const backward = short > 0 ? long : short;
  if (Math.abs(long) < Math.abs(short)) {
    const t = short;
    short = long;
    long = t;
  }
  return { long, short, forward, backward };
}

export function wrapScalarHue(value: number) {
  value = value % 1;
  if (value < 0) return (1 - Math.abs(value)) % 1;
  return value;
}

// export function cssAngleFormat(value:string) {
//   let start = value.indexOf(`)`);
//   let end = value.lastIndexOf(')');
//   if (start < 0) return value;
//   if (end < start) return value;

// }