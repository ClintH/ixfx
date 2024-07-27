import { gaussian } from "../Gaussian.js";
// Easings from https://easings.net/

const sqrt = Math.sqrt;
const pow = Math.pow;
const cos = Math.cos;
const pi = Math.PI;
const sin = Math.sin;


export const bounceOut = (x: number) => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (x < 1 / d1) {
    return n1 * x * x;
  } else if (x < 2 / d1) {
    return n1 * (x -= 1.5 / d1) * x + 0.75;
  } else if (x < 2.5 / d1) {
    return n1 * (x -= 2.25 / d1) * x + 0.9375;
  } else {
    return n1 * (x -= 2.625 / d1) * x + 0.984_375;
  }
};

export const quintIn = (x: number) => x * x * x * x * x;
export const quintOut = (x: number) => 1 - pow(1 - x, 5);
export const arch = (x: number) => x * (1 - x) * 4;

export const smoothstep = (x: number) => x * x * (3 - 2 * x);
export const smootherstep = (x: number) => (x * (x * 6 - 15) + 10) * x * x * x;
export const sineIn = (x: number) => 1 - cos((x * pi) / 2);
export const sineOut = (x: number) => sin((x * pi) / 2);
export const quadIn = (x: number) => x * x;
export const quadOut = (x: number) => 1 - (1 - x) * (1 - x);
export const sineInOut = (x: number) => -(cos(pi * x) - 1) / 2;
export const quadInOut = (x: number) => x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2;
export const cubicIn = (x: number) => x * x * x;
export const cubicOut = (x: number) => 1 - pow(1 - x, 3);
export const quartIn = (x: number) => x * x * x * x;
export const quartOut = (x: number) => 1 - pow(1 - x, 4);
export const expoIn = (x: number) => (x === 0 ? 0 : pow(2, 10 * x - 10));
export const expoOut = (x: number) => (x === 1 ? 1 : 1 - pow(2, -10 * x));
export const quintInOut = (x: number) =>
  x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2;
export const expoInOut = (x: number) =>
  x === 0
    ? 0
    : x === 1
      ? 1
      // eslint-disable-next-line unicorn/no-nested-ternary
      : x < 0.5
        ? pow(2, 20 * x - 10) / 2
        : (2 - pow(2, -20 * x + 10)) / 2;
export const circIn = (x: number) => 1 - sqrt(1 - pow(x, 2));
export const circOut = (x: number) => sqrt(1 - pow(x - 1, 2));
export const backIn = (x: number) => {
  const c1 = 1.701_58;
  const c3 = c1 + 1;

  return c3 * x * x * x - c1 * x * x;
};
export const backOut = (x: number) => {
  const c1 = 1.701_58;
  const c3 = c1 + 1;

  return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2);
};
export const circInOut = (x: number) =>
  x < 0.5
    ? (1 - sqrt(1 - pow(2 * x, 2))) / 2
    : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2;

export const backInOut = (x: number) => {
  const c1 = 1.701_58;
  const c2 = c1 * 1.525;

  return x < 0.5
    ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
    : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
};
export const elasticIn = (x: number) => {
  const c4 = (2 * pi) / 3;

  return x === 0
    ? 0
    : (x === 1
      ? 1
      : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4));
};
export const elasticOut = (x: number) => {
  const c4 = (2 * pi) / 3;

  return x === 0
    ? 0
    : (x === 1
      ? 1
      : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1);
};

export const bounceIn = (x: number) => 1 - bounceOut(1 - x);

export const bell = gaussian();

export const elasticInOut = (x: number) => {
  const c5 = (2 * pi) / 4.5;

  return x === 0
    ? 0
    : x === 1
      ? 1
      // eslint-disable-next-line unicorn/no-nested-ternary
      : x < 0.5
        ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
        : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1;
};
export const bounceInOut = (x: number) => x < 0.5 ? (1 - bounceOut(1 - 2 * x)) / 2 : (1 + bounceOut(2 * x - 1)) / 2;
