import * as G from '@ixfx/geometry';
import * as V from '../../../visual/src/index.js';
import { interpolator, springStateful } from "./spring.js"

const ch = new V.CanvasHelper(`canvas`, {
  height: 360,
  width: 640
});
const dh = ch.getDrawHelper();
let cursor = { x: 640, y: 360 };
let current = { x: 0, y: 0 }
let interpol = springStateful(); // interpolator({ x: 0, y: 0 }, { x: 640, y: 360 });

function draw() {
  ch.fill(`white`);
  dh.dot(current, { radius: 10, fillStyle: `red` });
}

document.querySelector('canvas')?.addEventListener(`pointerup`, event => {
  cursor = {
    x: event.offsetX,
    y: event.offsetY
  }
  //interpol = interpolator({ x: 0, y: 0 }, cursor);
  t = 0;
  //loop();
});

let t = 0;
function loop() {
  let v = interpol(t);
  //console.log(`t: ${ t.toFixed(2) } v: ${ v.toFixed(2) }}`)
  current = G.Points.interpolate(1 - v, current, cursor, true)
  draw();
  t += 0.0001;
  //if (t >= 1) return;

  setTimeout(loop, 100);
}
loop();
