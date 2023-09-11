export const max = <V>(iterable: Iterable<V>, scorer: (v: V) => number): V | undefined => {
  let highestValue: V | undefined;
  let highestScore = Number.MIN_SAFE_INTEGER;
  for (const value of iterable) {
    const score = scorer(value);
    if (score >= highestScore) {
      highestScore = score;
      highestValue = value;
    }
  }
  return highestValue;
}

export const min = <V>(iterable: Iterable<V>, scorer: (v: V) => number): V | undefined => {
  let lowestValue: V | undefined;
  let lowestScore
    = Number.MAX_SAFE_INTEGER;
  for (const value of iterable) {
    const score = scorer(value);
    if (score <= lowestScore) {
      lowestScore = score;
      lowestValue = value;
    }
  }
  return lowestValue;
}