export const trackSimple = () => {
  let count = 0;
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let total = 0;

  const seen = (v: number) => {
    min = Math.min(v, min);
    max = Math.max(v, max);
    total += v;
    count++;
  }

  const reset = () => {
    count = 0;
    min = Number.MAX_SAFE_INTEGER;
    max = Number.MIN_SAFE_INTEGER;
    total = 0;
  }

  const rangeToString = (digits = 2) => {
    return `${ min.toFixed(2) } - ${ max.toFixed(2) }`
  }
  return {
    seen, reset, rangeToString,
    get avg() {
      return total / count
    },
    get min() {
      return min;
    },
    get max() {
      return max;
    },
    get total() {
      return total;
    },
    get count() {
      return count;
    }
  }
}