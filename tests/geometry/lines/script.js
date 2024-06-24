import {CanvasHelper} from '../../../dist/dom.js';
import {Drawing} from '../../../dist/visual.js';
import {Lines, degreeToRadian} from '../../../dist/geometry.js';

const c = new CanvasHelper(`#plot`, {fill:`viewport`});

function drawLine(origin, line) {
  Drawing.line(c.ctx, line, { strokeStyle: `black`});
  Drawing.dot(c.ctx,origin,{radius:2});
}

function draw(angle) {
  let x = 100;
  let y = 100;
  c.clear();
  const l1 = Lines.fromPivot({x,y}, 100, degreeToRadian(angle));
  drawLine({x,y}, l1);

  x += 100;
  const l2 = Lines.fromPivot({x,y}, 100, degreeToRadian(angle), 0.2);
  drawLine({x,y}, l2);

  x += 100;
  const l3= Lines.fromPivot({x,y}, 100, degreeToRadian(angle), 0);
  drawLine({x,y}, l3);

  x += 100;
  const l4 = Lines.fromPivot({x,y}, 100, degreeToRadian(angle), 1);
  drawLine({x,y}, l4);
}

let a = 45;
setInterval(() => {
  draw(a);
  a+=1;
  if (a>=360) a =0;
},10);