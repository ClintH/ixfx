export type LevenshteinOp
  = | { type: `keep`; char: string }
    | { type: `insert`; char: string }
    | { type: `delete`; char: string }
    | { type: `replace`; from: string; to: string };

/**
 * Compute the Levenshtein operations needed to transform `a` into string `b`.
 * @param a
 * @param b
 * @returns
 */
export function levenshteinOps(a: string, b: string): LevenshteinOp[] {
  if (typeof a !== `string`)
    throw new TypeError(`Param 'a' is not a string. Got: ${typeof a}`);
  if (typeof b !== `string`)
    throw new TypeError(`Param 'b' is not a string. Got: ${typeof b}`);

  const dp: number[][] = [];

  for (let i = 0; i <= a.length; i++) {
    dp[i] = [];
    for (let j = 0; j <= b.length; j++) {
      if (i === 0) {
        dp[i][j] = j;
      } else if (j === 0) {
        dp[i][j] = i;
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        );
      }
    }
  }

  const ops: LevenshteinOp[] = [];

  let i = a.length;
  let j = b.length;

  while (i > 0 || j > 0) {
    if (
      i > 0
      && j > 0
      && dp[i][j] === dp[i - 1][j - 1]
      && a[i - 1] === b[j - 1]
    ) {
      ops.push({ type: `keep`, char: a[i - 1] });
      i--;
      j--;
    } else if (
      i > 0
      && j > 0
      && dp[i][j] === dp[i - 1][j - 1] + 1
    ) {
      ops.push({
        type: `replace`,
        from: a[i - 1],
        to: b[j - 1],
      });
      i--;
      j--;
    } else if (
      j > 0
      && dp[i][j] === dp[i][j - 1] + 1
    ) {
      ops.push({ type: `insert`, char: b[j - 1] });
      j--;
    } else {
      ops.push({ type: `delete`, char: a[i - 1] });
      i--;
    }
  }
  return ops.reverse();
}