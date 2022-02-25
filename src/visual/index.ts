import * as Drawing from './Drawing.js';
import * as Svg from './Svg.js';
import * as Plot from './Plot.js';
import * as DictionaryOfColourCombinations from './DictionaryOfColourCombinations';
import * as Palette from  './Palette';
import * as Colour from './Colour.js';

/**
 * Colour interpolation, scale generation and parsing
 * 
 * Overview
 * * {@link interpolate}: Blend colours
 * * {@link scale}: Produce colour scale
 * * {@link opacity}: Give a colour opacity
 */
export {Colour};

export {Palette,  Drawing, Svg, Plot, DictionaryOfColourCombinations};

// @ts-ignore
//eslint-disable-next-line functional/immutable-data
if (window !== undefined) window.ixfx = {Drawing, Svg, Plot, Palette, Colour};