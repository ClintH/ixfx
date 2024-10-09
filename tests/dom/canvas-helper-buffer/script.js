import { CanvasHelper } from '../../../dist/dom.js';
import {Grids} from '../../../dist/geometry.js';
import {Random} from '../../../dist/bundle.js';

const ch = new CanvasHelper(`canvas`, {
  height:200,
  width:200
});

const b = ch.getWritableBuffer();

ch.addEventListener(`pointerup`, event => {
  //console.log(`pointerup x: ${event.x} logical: ${event.canvasX}`);

  // Write in canvas coords
  const ctx = ch.ctx;
  ctx.fillStyle = `red`;
  let x = event.offsetX;
  let y = event.offsetY;

  const phys = {
    x:Math.floor(event.physicalX), 
    y:Math.floor(event.physicalY)
  };
  console.log(phys);
  ctx.fillRect(x,y,1,1);
  b.set({r:0,g:1,b:0,unit:`relative`},phys );
  b.flip();
  // Write in image data coords
});
// ch.addEventListener(`pointerdown`, event => {
//   console.log(`pointerdown`,event);
// });
// ch.addEventListener(`pointermove`, event => {
//   console.log(`pointermove x: ${event.x} logical: ${event.logicalX} physical: ${event.physicalX}`);
// });



const grayscale = (v) => {
  return {
    r: v,
    g: v,
    b: v,
    opacity: 1
  }
}

const pixelWhite = {r:1,g:1,b:1};
const pixelBlack = {r:0,g:0,b:0};

/**
 * 
 * @param {{r,g,b}} px 
 * @param {number} whiteLevel
 * @param {number} blackLevel
 */
const levels = (px, blackLevel,whiteLevel) => {
  if (px.r < blackLevel) return pixelBlack;
  if (px.g <blackLevel) return pixelBlack;
  if (px.b <blackLevel) return pixelBlack;
  
  if (px.r > whiteLevel) return pixelWhite;
  if (px.g >whiteLevel) return pixelWhite;
  if (px.b >whiteLevel) return pixelWhite
  return px;
}

const makeNoise = (fnc) => {
  const data = Grids.Array1d.createMutable(0, b.grid);
  for (const cell of Grids.By.cells(data)) {
    let px = fnc();
    px = levels(px, 0.6, 0.7);
    data.set(px, cell);
  }
  
  return data;
}

const drawNoise = (noiseData) => {
  console.log(noiseData);
  ch.drawBounds(`red`);
  for (const cellValue of Grids.By.cellsAndValues(noiseData)) {
    //console.log(cellValue);
    //let pixel = {r:255,g:100,b:100,unit:`8bit`};
    b.set(cellValue.value, cellValue.cell);
  }
  b.flip();
}

const noiseData = makeNoise( () => grayscale(Math.random()));
drawNoise(noiseData);
