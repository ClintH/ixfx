export * from './canvas-helper.js';
export * from './pointer-visualise.js';
// import * as Svg from './svg/index.js';
// export * as Svg from './svg/index.js';

import * as NamedColourPalette from './named-colour-palette.js';


import * as Colour from './colour/index.js';

export * as Colour from './colour/index.js';

//export type * from './types.js';

//import * as SceneGraph from './SceneGraph.js';
import * as Video from './video.js';

//export * from '../../dom/src/CanvasRegion.js';

export * as Drawing from './drawing.js';

/**
 * Wraps [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) as an ixfx {@link @ixfx/geometry.Grid} type.
 * This is useful because it's otherwise a one-dimensional array listing each rgba in turn.
 */
export * as ImageDataGrid from './image-data-grid.js';
//export * as BipolarView from '../../dom/src/plot/BipolarView.js';
//export * as NamedColourPalette from './named-colour-palette.js';

//export * as Plot2 from './Plot2.js';

//export * as Plot from './plot/index.js';
//export * as SceneGraph from './SceneGraph.js';
//export * from './ScaleCanvas.js';
//export * from './plot/CartesianCanvasPlot.js';



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
export * as Video from './video.js';

try {
  if (typeof window !== `undefined`) {
    (window as any).ixfx = {
      ...(window as any).ixfx,
      Visuals: {
        NamedColourPalette,
        Colour,
        Video,
      },
    };
  }
} catch {
  /* no-op */
}


