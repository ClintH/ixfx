import { CanvasRegion, CanvasSource } from '../../../dist/visual.js';
import {ElementSizer,resolveEl }from '../../../dist/dom.js';


const canvasEl = resolveEl(`canvas`);
const source = new CanvasSource(canvasEl);
const r = source.createRegion({
  match:`#targetEl`
});
ElementSizer.canvasViewport(canvasEl, {
  onSetSize: (size, _el) => {
    source.setLogicalSize(size);
    draw();
  }
});


// const r = new CanvasRegion(s, {
//   x: 100, y: 0, width: 100, height: 300
// });



function draw() {
  if (typeof r === `undefined`) return;
  r.fill(`pink`);
  r.drawBounds(`blue`);
}
