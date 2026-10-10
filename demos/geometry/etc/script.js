import {CanvasHelper, parentSizeCanvas} from '../../../dist/dom.js';
import {Drawing} from '../../../dist/visual.js';
import {continuously} from '../../../dist/flow.js';

import {pingPong} from '../../../dist/modulation.js';

import {Lines} from '../../../dist/geometry.js';

let ptr = {x: 0, y: 0};
let ptrClick = {x: 300, y: 200};
let pp = pingPong(0.001, -1, 2);

const canvas = new CanvasHelper(`#plot`);

const interpolateTest = () => {
  const { ctx } = canvas;
  const line = {
    a: { x: 50, y:50},
    b: {x : 100, y: 130}
  };

  const v = pp.next().value;
  Drawing.line(ctx, line, { strokeStyle: `orange` });

  const pt = Lines.interpolate(v, line, true);
  
  Drawing.dot(ctx, pt, {fillStyle:`black`});
}

const update = () => {
canvas.clear();
  interpolateTest();

}

continuously(() => {
  update();
}).start();

document.addEventListener(`pointermove`, evt => {
  ptr = {
    x: evt.x,
    y: evt.y
  };
});

document.addEventListener(`pointerup`, evt => {
  ptrClick = {
    x: evt.x,
    y: evt.y
  };
});


