import { numberTest, resultThrow } from '@ixfx/guards';
import { type RandomSource } from '@ixfx/random';
import { scalar as hslScalar, toCssString } from './hsl.js';

/**
 * Returns a full HSL colour string (eg `hsl(20,50%,75%)`) based on a index.
 * It's useful for generating perceptually different shades as the index increments.
 *
 * ```
 * el.style.backgroundColor = goldenAgeColour(10);
 * ```
 *
 * Saturation and lightness can be specified, as numeric ranges of 0-1.
 *
 * @param saturation Saturation (0-1), defaults to 0.5
 * @param lightness Lightness (0-1), defaults to 0.75
 * @param alpha Opacity (0-1), defaults to 1.0
 * @returns HSL colour string eg `hsl(20,50%,75%)`
 */
export const goldenAngleColour = (
  index: number,
  saturation = 0.5,
  lightness = 0.75,
  alpha = 1
) => {
  resultThrow(
    numberTest(index, `positive`, `index`),
    numberTest(saturation, `percentage`, `saturation`),
    numberTest(lightness, `percentage`, `lightness`),
    numberTest(alpha, `percentage`, `alpha`)
  );
  // Via Stackoverflow
  const hueDeg = index * 137.508; // use golden angle approximation
  const hueRel = (hueDeg % 360) / 360
  return toCssString(hslScalar(hueRel, saturation, lightness, alpha));
  //return alpha === 1 ? `hsl(${ hue },${ saturation * 100 }%,${ lightness * 100 }%)` : `hsl(${ hue },${ saturation * 100 }%,${ lightness * 100 }%,${ alpha * 100 }%)`;
};

/**
 * Returns a random hue component (0..359)
 * 
 * ```
 * // Generate hue
 * const h = randomHue(); // 0-359
 *
 * // Generate hue and assign as part of a HSL string
 * el.style.backgroundColor = `hsl(${randomHue(), 50%, 75%})`;
 * ```
 * @param rand
 * @returns
 */
export const randomHue = (rand: RandomSource = Math.random): number => rand() * 360;
