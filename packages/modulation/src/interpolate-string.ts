import type { Tokeniser } from "@ixfx/core/text-tokenise.js";
import type { InterpolateOptions } from "./types.js";
import { Compare, Tokenise } from '@ixfx/core/text';
import { numberTest, resultThrow, stringTest } from "@ixfx/guards";
import { clamp } from "@ixfx/numbers";
import { get as getEasing } from './easing.js';

export type StringInterpolateOptions = Partial<InterpolateOptions> & {
  style: `token` | `centered` | `human`;
  tokenise?: `character` | `word`;
  tokeniser?: Tokeniser;
};

export function interpolateString(amount: number, options?: Partial<StringInterpolateOptions>): (a: string, b: string) => string;
export function interpolateString(amount: number, a: string, b: string, options?: Partial<StringInterpolateOptions>): string;
export function interpolateString(a: string, b: string, options?: Partial<StringInterpolateOptions>): (amount: number) => string;
export function interpolateString(pos1: number | string, pos2?: string | Partial<StringInterpolateOptions>, pos3?: string | Partial<StringInterpolateOptions>, pos4?: Partial<StringInterpolateOptions>) {
  let amountProcess: undefined | ((v: number) => number);
  let limits: StringInterpolateOptions[`limits`] = `clamp`;
  let style: StringInterpolateOptions[`style`] = `token`;
  let tokeniser: StringInterpolateOptions[`tokeniser`] = Tokenise.byCharacter();
  let interpolatorForReals: ((amount: number) => string) | undefined;
  let interpolatorForA: string | undefined;
  let interpolatorForB: string | undefined;

  const handleAmount = (amount: number) => {
    if (amountProcess)
      amount = amountProcess(amount);
    if (limits === undefined || limits === `clamp`) {
      amount = clamp(amount);
    } else if (limits === `wrap`) {
      if (amount > 1) {
        amount = amount % 1;
      } else if (amount < 0) {
        amount = 1 + (amount % 1);
      }
    }
    return amount;
  };

  const doTheEase = (_amt: number, _a: string, _b: string): string => {
    resultThrow(
      stringTest(_a, ``, `a`),
      stringTest(_b, ``, `b`),
      numberTest(_amt, ``, `amount`),
    );
    _amt = handleAmount(_amt);
    if (!interpolatorForReals || _a !== interpolatorForA || _b !== interpolatorForB) {
      interpolatorForA = _a;
      interpolatorForB = _b;
      switch (style) {
        case `centered`:
          interpolatorForReals = interpolatorCentered(_a, _b, tokeniser);
          break;
        case `human`:
          interpolatorForReals = interpolatorHuman(_a, _b);
          break;
        case `token`:
          interpolatorForReals = interpolatorByTokens(_a, _b, tokeniser);
          break;
        default:
          throw new TypeError(`Unknown interpolation style: ${style}`);
      }
    }

    return interpolatorForReals!(_amt);
  };

  const readOpts = (o: Partial<StringInterpolateOptions> = {}) => {
    if (o.easing) {
      const easer = getEasing(o.easing);
      if (!easer)
        throw new Error(`Easing function '${o.easing}' not found`);
      amountProcess = easer;
    } else if (o.transform) {
      if (typeof o.transform !== `function`)
        throw new Error(`Param 'transform' is expected to be a function. Got: ${typeof o.transform}`);
      amountProcess = o.transform;
    }
    limits = o.limits ?? `clamp`;
    style = o.style ?? `token`;
    if (o.tokenise === `word`) {
      tokeniser = Tokenise.byWord();
    } else if (o.tokenise === `character`) {
      tokeniser = Tokenise.byCharacter();
    } else {
      tokeniser = o.tokeniser ?? Tokenise.byCharacter();
    }
  };

  // if (typeof pos1 !== `string`)
  //  throw new TypeError(`First param is expected to be a string. Got: ${typeof pos1}`);
  if (typeof pos2 === `string`) {
    let a: string;
    let b: string;
    if ((pos3 === undefined || typeof pos3 === `object`) && typeof pos1 === `string`) {
      // interpolate(a: string, b: string, options?: Partial<InterpolateOptions>): (amount: number) => string;
      a = pos1;
      b = pos2;
      readOpts(pos3);
      return (amount: number) => doTheEase(amount, a, b);
    } else if (typeof pos3 === `string` && typeof pos1 === `number`) {
      // interpolate(amount: number, a: string, b: string, options?: Partial<InterpolateOptions>): string;
      a = pos2;
      b = pos3;
      readOpts(pos4);
      return doTheEase(pos1, a, b);
    } else {
      throw new TypeError(`Values for 'a' and 'b' not defined`);
    }
  } else if (typeof pos1 === `number` && (pos2 === undefined || typeof pos2 === `object`)) {
    // interpolate(amount: number, options?: Partial<InterpolateOptions>): (a:string,b:string)=>string;
    const amount = handleAmount(pos1);
    readOpts(pos2);
    resultThrow(numberTest(amount, ``, `amount`));
    return (aValue: string, bValue: string) => doTheEase(amount, aValue, bValue);
  }
};

/**
 * Interpolate by token. Returns a function that performs interpolation.
 *
 * ```js
 * import { Tokenise } from '@ixfx/core/text';
 * // Create an interpolator
 * const i = interpolatorByTokens(`hello there`, `goodbye and farewell`, Tokenise.byWord());
 * const i = interpolatorByTokens(`hello there`, `goodbye and farewell`, Tokenise.byCharacter());
 *
 * // Use it:
 * i(0.5); // Gets 50% between the two strings, returning a string
 * ```
 * @param a Start
 * @param b End
 * @param tokeniser Tokeniser
 * @returns Interpolator
 */
export function interpolatorByTokens(
  a: string,
  b: string,
  tokeniser: Tokenise.Tokeniser = Tokenise.byCharacter(),
): (amount: number) => string {
  if (typeof a !== `string`)
    throw new TypeError(`Param 'a' is not a string. Got: ${typeof a}`);
  if (typeof b !== `string`)
    throw new TypeError(`Param 'b' is not a string. Got: ${typeof b}`);

  const tokensA = tokeniser.split(a);
  const tokensB = tokeniser.split(b);
  const maxLen = Math.max(tokensA.length, tokensB.length);

  return (t: number) => {
    if (t <= 0)
      return a;
    if (t >= 1)
      return b;
    const result: string[] = [];
    // How many token positions should come from B
    const swapCount = Math.round(t * maxLen);

    for (let i = 0; i < maxLen; i++) {
      const tokenA = tokensA[i] ?? ``;
      const tokenB = tokensB[i] ?? ``;
      result.push(i < swapCount ? tokenB : tokenA);
    }
    return result.join(tokeniser.joinWith);
  };
}

export type CenteredInterpolationOptions = Tokeniser;

export function interpolatorCentered(
  a: string,
  b: string,
  options: CenteredInterpolationOptions = Tokenise.byCharacter(),
): (amount: number) => string {
  if (typeof a !== `string`)
    throw new TypeError(`Param 'a' is not a string. Got: ${typeof a}`);
  if (typeof b !== `string`)
    throw new TypeError(`Param 'b' is not a string. Got: ${typeof b}`);

  const tokensA = options.split(a);
  const tokensB = options.split(b);
  const maxLen = Math.max(tokensA.length, tokensB.length);

  return (t: number) => {
    if (t <= 0)
      return a;
    if (t >= 1)
      return b;
    // Start fully as A
    const result: string[] = [];

    for (let i = 0; i < maxLen; i++) {
      result[i] = tokensA[i] ?? ``;
    }

    const center = (maxLen - 1) / 2;
    const order = Array
      .from({ length: maxLen }, (_, i) => i)
      .sort((x, y) => {
        const dx = Math.abs(x - center);
        const dy = Math.abs(y - center);

        // Stable deterministic tie-breaker
        if (dx !== dy)
          return dx - dy;

        return x - y;
      });

    const replaceCount = Math.round(t * maxLen);

    for (let i = 0; i < replaceCount; i++) {
      const idx = order[i];
      result[idx] = tokensB[idx] ?? ``;
    }

    return result.join(options.joinWith);
  };
}

export function interpolatorHuman(
  a: string,
  b: string,
): (amount: number) => string {
  const ops = Compare.levenshteinOps(a, b);
  const editable = ops.filter(op => op.type !== `keep`);

  return (t: number) => {
    if (t <= 0)
      return a;
    if (t >= 1)
      return b;

    const applyCount = Math.round(editable.length * t);

    let applied = 0;
    let result = ``;

    for (const op of ops) {
      switch (op.type) {
        case `keep`:
          result += op.char;
          break;
        case `replace`:
          if (applied < applyCount) {
            result += op.to;
          } else {
            result += op.from;
          }
          applied++;
          break;
        case `insert`:
          if (applied < applyCount) {
            result += op.char;
          }
          applied++;
          break;
        case `delete`:
          if (applied >= applyCount) {
            result += op.char;
          }
          applied++;
          break;
      }
    }
    return result;
  };
}
