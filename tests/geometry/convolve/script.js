import {parentSizeCanvas} from '../../../dist/dom.js';
import { Convolve2d, Grids } from '../../../dist/geometry.js';
import { Drawing, ImageDataGrid } from '../../../dist/visual.js';
import { interval } from '../../../dist/flow.js';

/** @type {CanvasRenderingContext2D} */
const destCtx = document.getElementById(`dest`).getContext(`2d`);

/** @type {CanvasRenderingContext2D} */
const destMagnifiedCtx = document.getElementById(`destMagnified`).getContext(`2d`);

const magScale = 16;
const bgFill = `white`;
const grid = { rows: 16, cols: 16, size: 1 };
const gridScaled = { ...grid, size: magScale}
let imageGrid;
let imageData;

const readSource = () => {
  const sourceImgEl = document.getElementById(`sourceImg`);
  const sourceCanvasEl = document.getElementById(`source`);

  /** @type {CanvasRenderingContext2D} */
  const sourceCtx = sourceCanvasEl.getContext(`2d`);
  sourceCtx.fillStyle = bgFill;
  sourceCtx.fillRect(0,0,grid.cols,grid.rows);
  sourceCtx.drawImage(sourceImgEl, 0,0,grid.rows,grid.cols);

  const sourceMagnifiedCtx = sourceMagnified.getContext(`2d`);
  sourceMagnifiedCtx.fillStyle = bgFill;
  sourceMagnifiedCtx.fillRect(0,0,grid.cols*magScale,grid.rows*magScale);
  sourceMagnifiedCtx.drawImage(sourceImgEl,0,0);
  imageData = sourceCtx.getImageData(0,0,grid.cols, grid.rows);
  imageGrid = ImageDataGrid.accessor(imageData);
  // Draw grid
  const rects = [...Grids.asRectangles(gridScaled)];
  Drawing.rect(sourceMagnifiedCtx, rects, { strokeStyle: `silver`});
}

readSource();

/**
 * 
 * @param {[{r:number,g:number,b:number,opacity:number},v:number]} values 
 * @returns 
 */
const reducer = (values) => {
  let r = 0;
  let g = 0;
  let b = 0;
  let opacity = 0;

  for (let i=0;i<values.length;i++) {
    const rgb = values[i][1];
    const scale = values[i][0];
    if (rgb === undefined) continue;
    if (rgb.opacity === 0) continue;
    if (scale === 0) continue;
    r += (rgb.r * scale);
    g += (rgb.g * scale);
    b += (rgb.b * scale);
    opacity += (rgb.opacity * scale);
  }

  const result = {
    r: r,
    g: g,
    b: b,
    opacity: 255
  }
  return result;
};

/**
 * Tests using ImageDataGrid and Grid iterators
 * to step through pixels of a source image, drawing
 * it on a destination and magnified canvas
 */
const testSourceCopy = async () => {
  for await (const cell of interval(Grids.cells(grid), 20)) {
    const r = Grids.rectangleForCell(grid, cell);
    const px = imageGrid(cell);//scaleCell(cell));
    const fill = `rgb(${px.r},${px.g},${px.b})`;
    const opts = {stroked:false,fillStyle: fill, filled: true};

    Drawing.rect(destCtx, r, opts);

    // Draw magnified
    const rScaled = Grids.rectangleForCell(gridScaled,cell);
    Drawing.rect(destMagnifiedCtx, rScaled, opts );
  }
}

/**
 * Demonstrates raw convolve function
 */
const testConvolveRaw = async () => {
  // Visit all cells in grid (source image)
  const visitor = Grids.cells(grid);

  // Create convolve iterator
  const convolve = Convolve2d.convolve(grid, imageGrid, Convolve2d.rgbReducer, visitor, Convolve2d.boxBlurKernel);

  const baseOpts =  { filled: true, stroked: false };

  // For each source cell, compute convolved value
  for await (const [cell, value] of interval(convolve, 10)) {
    // Compute rectangle to fill for this cell
    const r = Grids.rectangleForCell(grid, cell);
    
    // Create drawing options
    const opts = {
      ...baseOpts,
      fillStyle: `rgb(${value.r},${value.g},${value.b})`
    };
    
    Drawing.rect(destCtx, r, opts);

    // Magnified version
    const rScaled = Grids.rectangleForCell(gridScaled, cell);
    Drawing.rect(destMagnifiedCtx, rScaled, opts);
  }
}

/**
 * Demonstrates using higher-level `convolveImage` helper function
 */
const testConvolveImage = async () => {
  const convolve = Convolve2d.convolveImage(Convolve2d.boxBlurKernel, imageData);
  const baseOpts =  { filled: true, stroked: false };

  // For each source cell, compute convolved value
  for await (const [cell, value] of interval(convolve, 10)) {
     // Compute rectangle to fill for this cell
     const r = Grids.rectangleForCell(grid, cell);
    
     // Create drawing options
     const opts = {
       ...baseOpts,
       fillStyle: `rgb(${value.r},${value.g},${value.b})`
     };
     
     Drawing.rect(destCtx, r, opts);
 
     // Magnified version
     const rScaled = Grids.rectangleForCell(gridScaled,cell);
     Drawing.rect(destMagnifiedCtx, rScaled, opts);
  }
}

testConvolveImage();