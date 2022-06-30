import * as Drawing from './Drawing.js';
import * as Svg from './Svg.js';
import * as Plot from './Plot.js';
import * as Plot2 from './Plot2.js';

import * as Palette from  './Palette';
import * as Colour from './Colour.js';
import * as SceneGraph from './SceneGraph.js';
import * as Video from './Video.js';

/**
 * @module
 * 
 * XVisuals
 * 
 * Overview:
 * * {@link Colour}: Colour interpolation, scale generation and parsing
 * * {@link Palette}: Colour palette managment
 * * {@link Svg}: SVG helper
 * * {@link Drawing}: Canvas drawing helper
 */

/**
 * Colour interpolation, scale generation and parsing
 * 
 * Overview
 * * {@link interpolate}: Blend colours
 * * {@link scale}: Produce colour scale
 * * {@link opacity}: Give a colour opacity
 */
export {Colour};

export {Palette, Video,  Drawing, Svg, Plot, Plot2, SceneGraph};

try {
  if (typeof window !== `undefined`) {
    //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
    (window as any).ixfx = {...(window as any).ixfx, Visuals: {SceneGraph, Plot2, Drawing, Svg, Plot, Palette, Colour, Video}};
  }
} catch { /* no-op */ }
