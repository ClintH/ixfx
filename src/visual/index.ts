import * as Drawing from './Drawing.js';
import * as Svg from './Svg.js';
import * as Plot from './Plot.js';
import * as Plot2 from './Plot2.js';

import * as Palette from  './Palette.js';
import * as Colour from './Colour.js';
import * as SceneGraph from './SceneGraph.js';
import * as Video from './Video.js';

export * as ImageDataGrid from './ImageDataGrid.js';

/**
 * Colour interpolation, scale generation and parsing
 * 
 * Overview
 * * {@link interpolate}: Blend colours
 * * {@link scale}: Produce colour scale
 * * {@link opacity}: Give a colour opacity
 * * {@link randomHue}: Generate a random hue
 * * {@link goldenAngleColour}: Pick perceptually different shades
 * 
 * CSS
 * * {@link getCssVariable}: Parse a CSS-defined colour
 * 
 * Conversions: convert from 'blue', 'rgb(255,0,0)',  'hsl(0, 100%, 50%)' etc:
 * * {@link toHex}: to a hex format string
 * * {@link toHsl}: to a `{h, s, l}` object
 * * {@link toRgb}: to a `{r, g, b}` object
 */
export { Colour };

/**
 * Working with video, either playback from a file or stream from a video camera.
 * 
 * Overview
 * * {@link frames}: Yields frames from a video camera
 * * {@link capture}: Capture frames from a VIDEO element
 * 
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import {Video} from '../../ixfx/dist/visual.js';
 * // Import from web
 * import {Video} from 'https://unpkg.com/ixfx/dist/visual.js'
 * ```
 */
export { Video };

export { Palette,  Drawing, Svg, Plot, Plot2, SceneGraph };

try {
  if (typeof window !== `undefined`) {
    //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
    (window as any).ixfx = { ...(window as any).ixfx, Visuals: { SceneGraph, Plot2, Drawing, Svg, Plot, Palette, Colour, Video } };
  }
} catch { /* no-op */ }
