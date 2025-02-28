

import * as Svg from './svg/index.js';
export * as Svg from './svg/index.js';

import * as NamedColourPalette from './NamedColourPalette.js';

import * as Colour from './colour/index.js';
/**
 * Colour interpolation, scale generation and parsing
 *
 * Overview
 * * {@link interpolator}: Blend colours
 * * {@link scale}: Produce colour scale
 * * {@link multiplyOpacity}: Modify opacity with a scalar
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

export * as Colour from './colour/index.js';

export type * from './Types.js';

import * as SceneGraph from './SceneGraph.js';
import * as Video from './Video.js';

export * from './CanvasRegion.js';

/**
 * Wraps [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) as an ixfx {@link Geometry.Grid} type.
 * This is useful because it's otherwise a one-dimensional array listing each rgba in turn.
 */
export * as ImageDataGrid from './ImageDataGrid.js';
export * as BipolarView from './BipolarView.js';
export * as NamedColourPalette from './NamedColourPalette.js';

import * as Drawing from './Drawing.js';
export * as Drawing from './Drawing.js';

//export * as Plot2 from './Plot2.js';

export * as Plot from './plot/index.js';
export * as SceneGraph from './SceneGraph.js';
//export * from './ScaleCanvas.js';
export * from './plot/CartesianCanvasPlot.js';



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
export * as Video from './Video.js';

try {
  if (typeof window !== `undefined`) {
    (window as any).ixfx = {
      ...(window as any).ixfx,
      Visuals: {
        SceneGraph,
        Drawing,
        Svg,
        NamedColourPalette,
        Colour,
        Video,
      },
    };
  }
} catch {
  /* no-op */
}


