import * as Grids from '../geometry/Grid.js';
import type { Rgb } from './Colour.js';

/**
 * Returns a function that accesses pixel values by x,y
 * @param image 
 * @returns 
 */
export const accessor = (image: ImageData): Grids.CellAccessor<Rgb> => {
  const grid = { rows: image.width, cols: image.height };
  const data = image.data;

  const fn: Grids.CellAccessor<Rgb> = (cell: Grids.Cell, bounds) => {
    const index = Grids.indexFromCell(grid, cell, bounds);
    if (index === undefined) {
      return undefined;
    }
    const pxIndex = index * 4;
    return {
      r: data[ pxIndex ],
      g: data[ pxIndex + 1 ],
      b: data[ pxIndex + 2 ],
      opacity: data[ pxIndex + 3 ],
      space: `srgb`
    };
  };
  return fn;
};


/**
 * Yields pixels of an image row by row
 * @param image 
 */
export function* byRow(image: ImageData) {
  const a = accessor(image);
  const grid = { rows: image.width, cols: image.height };

  for (let y = 0; y < grid.rows; y++) {
    let row: Rgb[] = [];
    for (let x = 0; x < grid.cols; x++) {
      const p = a({ x, y }, `undefined`);
      if (p) row.push(p);
    }
    yield row;
  }
}

/**
 * Yields pixels of an image column by column
 * @param image 
 */
export function* byColumn(image: ImageData) {
  const a = accessor(image);
  const grid = { rows: image.width, cols: image.height };

  for (let x = 0; x < grid.cols; x++) {
    let col: Rgb[] = [];
    for (let y = 0; y < grid.rows; y++) {
      const p = a({ x, y }, `undefined`);
      if (p) col.push(p);
    }
    yield col;
  }
}