import * as Drawing from './Drawing.js';
import * as Svg from './Svg.js';
import * as Plot from './Plot.js';
import * as Plot2 from './Plot2.js';

import * as Palette from  './Palette';
import * as Colour from './Colour.js';
import * as SceneGraph from './SceneGraph.js';


/**
 * Colour interpolation, scale generation and parsing
 * 
 * Overview
 * * {@link interpolate}: Blend colours
 * * {@link scale}: Produce colour scale
 * * {@link opacity}: Give a colour opacity
 */
export {Colour};

export {Palette,  Drawing, Svg, Plot, Plot2, SceneGraph};

export * as Video from './Video.js';

// @ts-ignore
//eslint-disable-next-line functional/immutable-data
if (window !== undefined) window.ixfx = {Drawing, Svg, Plot, Palette, Colour};