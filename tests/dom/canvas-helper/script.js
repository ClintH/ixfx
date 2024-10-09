import { CanvasHelper } from '../../../dist/dom.js';
import {Grids} from '../../../dist/geometry.js';
import {Random, Visual} from '../../../dist/bundle.js';

const ch = new CanvasHelper(`canvas`, {
  height:100,
  width:100,
  resizeLogic: `min`,
  onResize:(ctx, size) => {
    //console.log(`draw`);
    Visual.Drawing.rect(ctx, size, { crossed:true, strokeStyle:`silver`});
    ctx.font = `24pt serif`;
    ctx.fillText(`This is some text.`, 5, 100);
  }
});
ch.addEventListener(`pointerup`, event => {
  //console.log(event);
  const ctx = ch.ctx;
  ctx.fillStyle = `black`;
  let x = event.canvasX;
  let y = event.canvasY;
  ctx.fillRect(x,y,1,1);
});

// ch.addEventListener(`pointerup`, event => {
//   console.log(`pointerup`,event);
// });
// ch.addEventListener(`pointerdown`, event => {
//   console.log(`pointerdown`,event);
// });
// ch.addEventListener(`pointermove`, event => {
//   console.log(`pointermove x: ${event.x} logical: ${event.logicalX} physical: ${event.physicalX}`);
// });
