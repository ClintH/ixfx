import { test, expect, describe } from 'vitest';
import { fromCssColour, resolveCss, CssColourNames } from '../src/colour/css-colours.js';
import * as Colour from '../src/colour/index.js';

describe(`css-colours`, () => {
  describe(`fromCssColour`, () => {
    test(`parses hex colour`, () => {
      const result = fromCssColour(`#ff0000`);
      expect(result.space).toBe(`srgb`);
    });

    test(`parses 3-digit hex colour`, () => {
      const result = fromCssColour(`#f00`);
      expect(result.space).toBe(`srgb`);
    });

    test(`parses named colour red`, () => {
      const result = fromCssColour(`red`);
      expect(result.space).toBe(`srgb`);
    });

    test(`parses named colour white`, () => {
      const result = fromCssColour(`white`);
      expect(result.space).toBe(`srgb`);
    });

    test(`parses named colour black`, () => {
      const result = fromCssColour(`black`);
      expect(result.space).toBe(`srgb`);
    });

    test(`parses hsl colour string`, () => {
      const result = fromCssColour(`hsl(0, 100%, 50%)`);
      expect(result.space).toBe(`hsl`);
    });

    test(`parses rgb colour string`, () => {
      const result = fromCssColour(`rgb(255, 0, 0)`);
      expect(result.space).toBe(`srgb`);
    });

    test(`parses oklch colour string`, () => {
      const result = fromCssColour(`oklch(50% 0.2 0)`);
      expect(result.space).toBe(`oklch`);
    });

    test(`parses rebeccapurple`, () => {
      const result = fromCssColour(`rebeccapurple`);
      expect(result.space).toBe(`srgb`);
    });

    test(`parses transparent`, () => {
      const result = fromCssColour(`transparent`);
      expect(result.opacity).toBe(0);
    });

    test(`converts case for named colours`, () => {
      const result1 = fromCssColour(`RED`);
      const result2 = fromCssColour(`red`);
      expect(result1).toEqual(result2);
    });

    test(`throws for invalid colour`, () => {
      expect(() => fromCssColour(`not-a-colour`)).toThrow();
    });

    test(`throws for empty string`, () => {
      expect(() => fromCssColour(``)).toThrow();
    });
  });

  describe(`resolveCss`, () => {
    test(`resolves named colour to hex`, () => {
      const result = resolveCss(`red`);
      expect(result).toBe(`#ff0000`);
    });

    test(`resolves white`, () => {
      const result = resolveCss(`white`);
      expect(result).toBe(`#ffffff`);
    });

    test(`resolves black`, () => {
      const result = resolveCss(`black`);
      expect(result).toBe(`#000000`);
    });

    test(`resolves blue`, () => {
      const result = resolveCss(`blue`);
      expect(result).toBe(`#0000ff`);
    });

    test(`resolves green`, () => {
      const result = resolveCss(`green`);
      expect(result).toBe(`#008000`);
    });

    test(`resolves rebeccapurple`, () => {
      const result = resolveCss(`rebeccapurple`);
      expect(result).toBe(`#663399`);
    });

    test(`resolves transparent`, () => {
      const result = resolveCss(`transparent`);
      expect(result).toBe(`#00000000`);
    });

    test(`returns unknown colour unchanged`, () => {
      const result = resolveCss(`not-a-colour` as CssColourNames);
      expect(result).toBe(`not-a-colour`);
    });

    test(`returns colour unchanged if not in map`, () => {
      const result = resolveCss(`rgb(255, 0, 0)`);
      expect(result).toBe(`rgb(255, 0, 0)`);
    });
  });
});

describe(`conversion - toColour`, () => {
  test(`converts string to Colour`, () => {
    const result = Colour.toColour(`red`);
    expect(result.space).toBe(`srgb`);
  });

  test(`converts Hsl to Colour`, () => {
    const hsl = Colour.HslSpace.scalar(0, 1, 0.5, 1);
    const result = Colour.toColour(hsl);
    expect(result.space).toBe(`hsl`);
  });

  test(`converts Rgb to Colour`, () => {
    const rgb = Colour.SrgbSpace.scalar(1, 0, 0, 1);
    const result = Colour.toColour(rgb);
    expect(result.space).toBe(`srgb`);
  });

  test(`converts OkLch to Colour`, () => {
    const oklch = Colour.OklchSpace.scalar(0.5, 0.1, 0.2, 1);
    const result = Colour.toColour(oklch);
    expect(result.space).toBe(`oklch`);
  });

  test(`throws for invalid input`, () => {
    expect(() => Colour.toColour(123)).toThrow();
  });

  test(`throws for undefined`, () => {
    expect(() => Colour.toColour(undefined)).toThrow();
  });

  test(`throws for null`, () => {
    expect(() => Colour.toColour(null)).toThrow();
  });
});

describe(`conversion - toStringFirst`, () => {
  test(`returns first valid colour as CSS string`, () => {
    const result = Colour.toStringFirst(`red`, `blue`);
    expect(result).toBe(`rgb(100% 0% 0%)`);
  });

  test(`skips undefined`, () => {
    const result = Colour.toStringFirst(undefined, `blue`);
    expect(result).toBe(`rgb(0% 0% 100%)`);
  });

  test(`returns fallback for all invalid`, () => {
    const result = Colour.toStringFirst(undefined, undefined);
    expect(result).toBe(`rebeccapurple`);
  });

  test(`converts structured colour to string`, () => {
    const hsl = Colour.HslSpace.scalar(0, 1, 0.5, 1);
    const result = Colour.toStringFirst(hsl);
    expect(typeof result).toBe(`string`);
  });
});

describe(`conversion - convert`, () => {
  test(`converts to hsl-scalar`, () => {
    const result = Colour.convert(`red`, `hsl-scalar`);
    expect(result.space).toBe(`hsl`);
    expect(result.unit).toBe(`scalar`);
  });

  test(`converts to hsl-absolute`, () => {
    const result = Colour.convert(`red`, `hsl-absolute`);
    expect(result.space).toBe(`hsl`);
    expect(result.unit).toBe(`absolute`);
  });

  test(`converts to oklch-scalar`, () => {
    const result = Colour.convert(`red`, `oklch-scalar`);
    expect(result.space).toBe(`oklch`);
    expect(result.unit).toBe(`scalar`);
  });

  test(`converts to oklch-absolute`, () => {
    const result = Colour.convert(`red`, `oklch-absolute`);
    expect(result.space).toBe(`oklch`);
    expect(result.unit).toBe(`absolute`);
  });

  test(`converts to srgb-8bit`, () => {
    const result = Colour.convert(`red`, `srgb-8bit`);
    expect(result.space).toBe(`srgb`);
    expect(result.unit).toBe(`8bit`);
  });

  test(`converts to srgb-scalar`, () => {
    const result = Colour.convert(`red`, `srgb-scalar`);
    expect(result.space).toBe(`srgb`);
    expect(result.unit).toBe(`scalar`);
  });

  test(`converts from Hsl to oklch`, () => {
    const hsl = Colour.HslSpace.scalar(0, 1, 0.5, 1);
    const result = Colour.convert(hsl, `oklch-scalar`);
    expect(result.space).toBe(`oklch`);
  });

  test(`converts from Rgb to hsl`, () => {
    const rgb = Colour.SrgbSpace.scalar(1, 0, 0, 1);
    const result = Colour.convert(rgb, `hsl-scalar`);
    expect(result.space).toBe(`hsl`);
  });

  test(`throws for invalid destination`, () => {
    expect(() => Colour.convert(`red`, `invalid` as any)).toThrow();
  });
});

describe(`conversion - convertToString`, () => {
  test(`converts to string`, () => {
    const result = Colour.convertToString(`red`, `hsl-scalar`);
    expect(typeof result).toBe(`string`);
  });

  test(`converts oklch to string`, () => {
    const result = Colour.convertToString(`red`, `oklch-scalar`);
    expect(typeof result).toBe(`string`);
  });
});

describe(`conversion - convertScalar`, () => {
  test(`converts to oklch`, () => {
    const result = Colour.convertScalar(`red`, `oklch`);
    expect(result.space).toBe(`oklch`);
    expect(result.unit).toBe(`scalar`);
  });

  test(`converts to hsl`, () => {
    const result = Colour.convertScalar(`red`, `hsl`);
    expect(result.space).toBe(`hsl`);
    expect(result.unit).toBe(`scalar`);
  });

  test(`converts to srgb`, () => {
    const result = Colour.convertScalar(`red`, `srgb`);
    expect(result.space).toBe(`srgb`);
    expect(result.unit).toBe(`scalar`);
  });

  test(`throws for unknown destination`, () => {
    expect(() => Colour.convertScalar(`red`, `unknown` as any)).toThrow();
  });
});

describe(`conversion - toHexColour`, () => {
  test(`converts string to hex`, () => {
    const result = Colour.toHexColour(`red`);
    expect(result).toBe(`#ff0000`);
  });

  test(`converts hsl to hex`, () => {
    const hsl = Colour.HslSpace.scalar(0, 1, 0.5, 1);
    const result = Colour.toHexColour(hsl);
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test(`converts rgb to hex`, () => {
    const rgb = Colour.SrgbSpace.scalar(1, 0, 0, 1);
    const result = Colour.toHexColour(rgb);
    expect(result).toBe(`#ff0000`);
  });

  test(`returns hex input unchanged`, () => {
    const result = Colour.toHexColour(`#ff0000`);
    expect(result).toBe(`#ff0000`);
  });
});

describe(`conversion - guard`, () => {
  test(`guards valid Hsl`, () => {
    const hsl = Colour.HslSpace.scalar(0, 1, 0.5, 1);
    expect(() => Colour.guard(hsl)).not.toThrow();
  });

  test(`guards valid Rgb`, () => {
    const rgb = Colour.SrgbSpace.scalar(1, 0, 0, 1);
    expect(() => Colour.guard(rgb)).not.toThrow();
  });

  test(`guards valid OkLch`, () => {
    const oklch = Colour.OklchSpace.scalar(0.5, 0.1, 0.2, 1);
    expect(() => Colour.guard(oklch)).not.toThrow();
  });

  test(`throws for unknown space`, () => {
    expect(() => Colour.guard({ space: `unknown` } as any)).toThrow();
  });
});
