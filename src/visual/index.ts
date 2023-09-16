import * as Drawing from './Drawing.js';
import * as Svg from './Svg.js';
//import * as Plot from './Plot.js';

import * as Plot2 from './Plot2.js';

import * as Palette from './Palette.js';
import * as Colour from './Colour.js';
import * as SceneGraph from './SceneGraph.js';
import * as Video from './Video.js';
import { resolveEl } from '../dom/Util.js';

export * as ImageDataGrid from './ImageDataGrid.js';
export * as BipolarView from './BipolarView.js';
export * as Palette from './Palette.js';
export * as Drawing from './Drawing.js';
export * as Svg from './Svg.js';
export * as Plot from './Plot.js';

export * as Plot2 from './Plot2.js';
export * as PlotOld from './PlotOld.js';
export * as SceneGraph from './SceneGraph.js';

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
export * as Colour from './Colour.js';

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
    //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
    (window as any).ixfx = {
      ...(window as any).ixfx,
      Visuals: {
        SceneGraph,
        Plot2,
        Drawing,
        Svg,
        Palette,
        Colour,
        Video,
      },
    };
  }
} catch {
  /* no-op */
}

/**
 * Scales a canvas to account for retina displays.
 * 
 * ```js
 * const r = scaleCanvas(`#my-canvas`);
 * r.ctx;      // CanvasRendering2D
 * r.element;  // HTMLCanvasElement
 * r.bounds;   // {x:number,y:number,width:number,height:number}
 * ```
 * 
 * Eg:
 * ```js
 * const { ctx } = scaleCanvas(`#my-canvas`);
 * ctx.fillStyle = `red`;
 * ctx.fillRect(0,0,100,100);
 * ```
 * 
 * Throws an error if `domQueryOrElement` does not resolve.w
 * @param domQueryOrElement 
 * @returns 
 */
export const scaleCanvas = (domQueryOrElement: HTMLCanvasElement | string) => {
  const canvasElement = resolveEl<HTMLCanvasElement>(domQueryOrElement);
  const ratio = window.devicePixelRatio;
  canvasElement.style.width = canvasElement.width + `px`;
  canvasElement.style.height = canvasElement.height + `px`;
  canvasElement.width *= devicePixelRatio;
  canvasElement.height *= devicePixelRatio;

  const getContext = () => {
    const ctx = canvasElement.getContext(`2d`);

    if (ctx === null) throw new Error(`Could not get drawing context`);
    ctx.save();
    ctx.scale(ratio, ratio);
    return ctx;
  }
  return { ctx: getContext(), element: canvasElement, bounds: canvasElement.getBoundingClientRect() };
}
