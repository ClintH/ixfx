import { Grids } from '@ixfx/geometry';
import { SrgbSpace } from './colour/srgb.js';
import type { Rgb, Rgb8Bit } from './colour/types.js';

/**
 * Returns a {@link Grids.Grid} based on the provided `image`
 * @param image ImageData
 * @returns Grid
 */
export const grid = (image: ImageData): Grids.Grid => {
  const g = { rows: image.width, cols: image.height };
  return g;
}

/**
 * Returns an object that allows get/set grid semantics on the underlying `image` data.
 * Uses 8-bit sRGB values, meaning 0..255 range for red, green, blue & opacity.
 * 
 * ```js
 * // Get CANVAS element, drawing context and then image data
 * const canvasEl = document.querySelector(`#my-canvas`);
 * const ctx = canvasEl.getContext(`2d`);
 * const imageData = ctx.getImageData();
 * 
 * // Now that we have image data, we can wrap it:
 * const asGrid = ImageDataGrid.wrap(imageData);
 * asGrid.get({ x:10, y: 20 }); // Get pixel at 10,20
 * asGrid.set(colour, { x:10, y: 20 }); // Set pixel value
 * 
 * // Display changes back on the canvas
 * ctx.putImageData(imageData, 0, 0)
 * ```
 * @param image 
 * @returns 
 */
export const wrap = (image: ImageData): Grids.GridWritable<Rgb8Bit> & Grids.GridReadable<Rgb8Bit> => {
  return {
    ...grid(image),
    get: accessor(image),
    set: setter(image)
  }
}

/**
 * Returns a function to access pixel values by x,y
 * @param image 
 * @returns 
 */
export const accessor = (image: ImageData): Grids.GridCellAccessor<Rgb8Bit> => {
  const g = grid(image);
  const data = image.data;

  const fn: Grids.GridCellAccessor<Rgb8Bit> = (cell: Grids.GridCell, bounds = `undefined`) => {
    const index = Grids.indexFromCell(g, cell, bounds);
    if (index === undefined) return;
    const pxIndex = index * 4;
    return {
      r: data[ pxIndex ],
      g: data[ pxIndex + 1 ],
      b: data[ pxIndex + 2 ],
      opacity: data[ pxIndex + 3 ],
      unit: `8bit`,
      space: `srgb`
    };
  };
  return fn;
};

/**
 * Returns a function that sets pixel values
 * @param image 
 * @returns 
 */
export const setter = (image: ImageData): Grids.GridCellSetter<Rgb> => {
  const g = grid(image);
  const data = image.data;

  const fn: Grids.GridCellSetter<Rgb> = (value: Rgb, cell: Grids.GridCell, bounds = `undefined`) => {
    const index = Grids.indexFromCell(g, cell, bounds);
    if (index === undefined) throw new Error(`Cell out of range. ${ cell.x },${ cell.y }`);
    const pixel = SrgbSpace.to8bit(value);
    const pxIndex = index * 4;
    data[ pxIndex ] = pixel.r;
    data[ pxIndex + 1 ] = pixel.g;
    data[ pxIndex + 2 ] = pixel.b;
    data[ pxIndex + 3 ] = pixel.opacity ?? 255;
  };
  return fn;
}

// export function* visit(image: ImageData, visitor: Grids.VisitGenerator) {
//   const a = accessor(image);

//   for (const cell of visitor) {
//     yield a(cell, `undefined`);
//   }
// }

/**
 * Yields pixels of an image row by row
 * @param image 
 */
export function* byRow(image: ImageData) {
  const a = accessor(image);
  const g = grid(image);

  const v = Grids.As.rows(g, { x: 0, y: 0 });
  for (const row of v) {
    const pixels = row.map(p => a(p, `undefined`));
    yield pixels
  }
}

/**
 * Yields pixels of an image column by column
 * @param image 
 */
export function* byColumn(image: ImageData) {
  const a = accessor(image);
  const g = grid(image);

  for (let x = 0; x < g.cols; x++) {
    const col: Rgb8Bit[] = [];
    for (let y = 0; y < g.rows; y++) {
      const p = a({ x, y }, `undefined`);
      if (p) col.push(p);
    }
    yield col;
  }
}