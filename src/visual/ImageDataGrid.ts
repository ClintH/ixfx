import * as Grids from '../geometry/grid/index.js';
import type { Rgb, Rgb8Bit } from './Colour.js';


export const grid = (image: ImageData): Grids.Grid => {
  const g = { rows: image.width, cols: image.height };
  return g;
}

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
    if (index === undefined) {
      return undefined;
    }
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
export const setter = (image: ImageData): Grids.GridCellSetter<Rgb8Bit> => {
  const g = grid(image);
  const data = image.data;

  const fn: Grids.GridCellSetter<Rgb8Bit> = (value: Rgb8Bit, cell: Grids.GridCell, bounds = `undefined`) => {
    const index = Grids.indexFromCell(g, cell, bounds);
    if (index === undefined) {
      return undefined;
    }
    const pxIndex = index * 4;
    data[ pxIndex ] = value.r;
    data[ pxIndex + 1 ] = value.g;
    data[ pxIndex + 2 ] = value.b;
    data[ pxIndex + 3 ] = value.opacity;
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
    let pixels = row.map(p => a(p, `undefined`));
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

  //Grids.visitorRow
  for (let x = 0; x < g.cols; x++) {
    let col: Rgb8Bit[] = [];
    for (let y = 0; y < g.rows; y++) {
      const p = a({ x, y }, `undefined`);
      if (p) col.push(p);
    }
    yield col;
  }
}