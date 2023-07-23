import {type Rgb} from '../visual/Colour.js';
import {ImageDataGrid} from '../visual/index.js';
import * as Grids from './Grid.js';

export type Kernel = readonly (readonly number[])[];
export type CellWithValue<V> = readonly [cell: Grids.Cell, value: V | undefined];
export type ScalarAndValue<V> = readonly [scalar: number, v: V | undefined];
export type KernelCompute = <V>(offset: Grids.Cell, value: V) => V;
export type KernelReduce<V> = (values: readonly ScalarAndValue<V>[]) => V | undefined;

/**
 * Multiply every element of kernel by the same `scalar` value.
 * Returns new result, input is unmodified
 * @param kernel 
 * @param scalar 
 * @returns 
 */
export const multiply = (kernel: Kernel, scalar: number): Kernel => {
  const rows = kernel.length;
  const cols = kernel[0].length;
  const copy: number[][] = [];
  //eslint-disable-next-line functional/no-let
  for (let row = 0; row < rows; row++) {
    //eslint-disable-next-line functional/immutable-data
    copy[row] = [];
    //eslint-disable-next-line functional/no-let
    for (let col = 0; col < cols; col++) {
      //eslint-disable-next-line functional/immutable-data
      copy[row][col] = kernel[row][col] * scalar;
    }
  }
  return copy;
};


export function convolveCell<V>(c: Grids.Cell, kernel: Kernel2dArray, source: Grids.Grid, access: Grids.CellAccessor<V>, reduce: KernelReduce<V>): V | undefined {
  const valuesAtKernelPos: ScalarAndValue<V>[] = kernel.map(o => {
    const pos = Grids.offset(source, c, o[0], `stop`); // `stop` avoids fringing at extents of image
    if (!pos) return [o[1], undefined];
    return [o[1], access(pos, `undefined`)];
  });
  return reduce(valuesAtKernelPos);
}

/**
 * Performs kernel-based convolution over `image`.
 * @param kernel 
 * @param image 
 */
export function* convolveImage(kernel: Kernel, image: ImageData) {
  const grid = {rows: image.width, cols: image.height};
  const imageDataAsGrid = ImageDataGrid.accessor(image);

  yield* convolve(kernel, grid, imageDataAsGrid, Grids.cells(grid), rgbReducer);
}

export function* convolve<V>(kernel: Kernel, source: Grids.Grid, access: Grids.CellAccessor<V>, visitor: Grids.VisitGenerator, reduce: KernelReduce<V>, origin?: Grids.Cell): IterableIterator<CellWithValue<V>> {

  //const wrap:Grids.BoundsLogic = `undefined`;
  // Use middle, eg 3x3 = 1,1
  if (!origin) {
    const kernelRows = kernel.length;
    const kernelCols = kernel[0].length;
    origin = {x: Math.floor(kernelRows / 2), y: Math.floor(kernelCols / 2)};
  }

  const asArray = kernel2dToArray(kernel, origin);
  for (const c of visitor) {
    const v = convolveCell<V>(c, asArray, source, access, reduce);
    yield [c, v];
  }
}

export type Kernel2dArray = ReadonlyArray<readonly [cell: Grids.Cell, value: number]>;

/**
 * For a given kernel, returns an array of offsets. These
 * consist of a cell offset (eg `{x:-1,y:-1}`) and the value at that kernel position.
 * @param kernel 
 * @param origin 
 * @returns 
 */
export const kernel2dToArray = (kernel: Kernel, origin?: Grids.Cell): Kernel2dArray => {
  const offsets: Kernel2dArray = [];
  const rows = kernel.length;
  const cols = kernel[0].length;
  if (!origin) origin = {x: Math.floor(rows / 2), y: Math.floor(cols / 2)};

  //eslint-disable-next-line functional/no-let
  for (let xx = 0; xx < rows; xx++) {
    //eslint-disable-next-line functional/no-let
    for (let yy = 0; yy < cols; yy++) {
      //eslint-disable-next-line functional/immutable-data
      // @ts-ignore
      offsets.push([{x: xx - origin.x, y: yy - origin.y}, kernel[xx][yy]]);
    }
  }
  return offsets;
};

export const rgbReducer: KernelReduce<Rgb> = (values: readonly ScalarAndValue<Rgb>[]) => {
  //eslint-disable-next-line functional/no-let
  let r = 0;
  //eslint-disable-next-line functional/no-let
  let g = 0;
  //eslint-disable-next-line functional/no-let
  let b = 0;
  //eslint-disable-next-line functional/no-let
  const opacity = 0;
  //eslint-disable-next-line functional/no-let
  for (let i = 0; i < values.length; i++) {
    const rgb = values[i][1];
    const scale = values[i][0];
    if (rgb === undefined) continue;
    if (rgb.opacity === 0) continue;
    if (scale === 0) continue;
    r += (rgb.r * scale);
    g += (rgb.g * scale);
    b += (rgb.b * scale);
    //opacity += ((rgb.opacity ?? 1) * scale);
  }

  const result = {
    r: r,
    g: g,
    b: b,
    opacity: 255
  };
  return result;
};
export const identityKernel = [
  [0, 0, 0],
  [0, 1, 0],
  [0, 0, 0]
];


export const edgeDetectionKernel = [
  [0, -1, 0],
  [-1, 4, -1],
  [0, -1, 0]
];

export const sharpenKernel = [
  [0, -1, 0],
  [-1, 5, -1],
  [0, -1, 0]
];

export const boxBlurKernel = multiply([
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1]
], 1 / 9);

export const gaussianBlur3Kernel = multiply([
  [1, 2, 1],
  [2, 4, 2],
  [1, 2, 1]
], 1 / 16);

export const gaussianBlur5Kernel = multiply([
  [1, 4, 6, 4, 1],
  [4, 16, 24, 16, 4],
  [6, 24, 36, 24, 6],
  [4, 16, 24, 16, 4],
  [1, 4, 6, 4, 1],
], 1 / 256);

export const unsharpMasking5Kernel = multiply([
  [1, 4, 6, 4, 1],
  [4, 16, 24, 16, 4],
  [6, 24, -476, 24, 6],
  [4, 16, 24, 16, 4],
  [1, 4, 6, 4, 1],
], -1 / 256);