/**
 * Via: https://gist.github.com/cyphunk/6c255fa05dd30e69f438a930faeb53fe
 * @param logits 
 * @returns 
 */
export const softmax = (logits: number[]): number[] => {

  const maxLogit = logits.reduce((a, b) => Math.max(a, b), Number.NEGATIVE_INFINITY);
  const scores = logits.map((l) => Math.exp(l - maxLogit));
  const denom = scores.reduce((a, b) => a + b);
  return scores.map((s) => s / denom);
}