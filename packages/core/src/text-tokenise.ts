const byWordRegex = /\s+/;

export type Tokeniser = {
  split: (input: string) => string[];
  joinWith: string;
};

export function byCharacter(): Tokeniser {
  return {
    split: s => [...s],
    joinWith: ``,
  };
}

export function byWord(
): Tokeniser {
  return {
    split: s => s.split(byWordRegex),
    joinWith: ` `,
  };
}
