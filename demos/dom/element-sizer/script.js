import { ElementSizer } from '../../../dist/dom.js';
import {Grids} from '../../../dist/geometry.js';
import {Random,Visual} from '../../../dist/bundle.js';
// export type CanvasStretchLogic = {
//   by:`stretch`|`maintain-ratio`
//   to:`viewport`|`parent`
//   fluid:`width`
// }

/**
 * @param {string} label
 * @param {HTMLCanvasElement} el 
 * @param {import('../../../dist/geometry.js').Rect} size 
 * @returns 
 */
const draw = (label, el, size) => {
  const ctx = el.getContext(`2d`);
  if (!ctx) return;
  ctx.fillStyle = `black`;
  let y = 10;
  let x = 3;
  const dh = Visual.Drawing.makeHelper(ctx);
  dh.textBlock([
    label,
    `${size.width}x${size.height}`,
    `Ratio: ${(size.width/size.height).toFixed(2)}`
  ], { 
    anchor: { x: 2, y:2},
  });

  dh.rect(size, { crossed:true, strokeStyle:`silver`});
  // ctx.fillText(label,x,y);
  // ctx.fillText(`${size.width}x${size.height}`, x,y+10);
  // ctx.fillText(`Ratio: ${(size.width/size.height).toFixed(2)}`,3,y+20);


}

const es1 = ElementSizer.canvasParent(`#c1>canvas`, {
  stretch:`both`, 
  onSetSize:(size,el) => {
    draw(`both`, el, size);
  }
});

const es2 = ElementSizer.canvasParent(`#c2>canvas`, {
  stretch:`width`, 
  onSetSize:(size,el) => {
    draw(`width`, el, size);
  }
});

const es3 = ElementSizer.canvasParent(`#c3>canvas`, {
  stretch:`height`, 
  onSetSize:(size,el) => {
    draw(`height`, el, size);
  }
});


const es4 = ElementSizer.canvasParent(`#d1>canvas`, {
  stretch:`both`, 
  onSetSize:(size,el) => {
    draw(`both`, el, size);
  }
});

const es5 = ElementSizer.canvasParent(`#d2>canvas`, {
  stretch:`width`, 
  onSetSize:(size,el) => {
    draw(`width`, el, size);
  }
});

const es6 = ElementSizer.canvasParent(`#d3>canvas`, {
  stretch:`height`, 
  onSetSize:(size,el) => {
    draw(`height`, el, size);
  }
});

const es7 = ElementSizer.canvasParent(`#d4>canvas`, {
  stretch:`min`, 
  onSetSize:(size,el) => {
    draw(`min`, el, size);
  }
});

const es8 = ElementSizer.canvasParent(`#d5>canvas`, {
  stretch:`max`, 
  onSetSize:(size,el) => {
    draw(`max`, el, size);
  }
});
// const ch1 = new ElementSizer(`#c1>canvas`, {
//   onSetSize:(size,el) => {
    
//   },
//   stretch:`both`
// });

// const ch2= new CanvasHelper(`#c2>canvas`, {
//   height:100,
//   width:200,
//   pixelZoom:3,
//   fill:`parent`
// });