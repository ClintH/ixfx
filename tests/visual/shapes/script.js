import {CanvasHelper} from '../../../dist/dom.js';
import {Drawing} from '../../../dist/visual.js';
import {degreeToRadian, Points, Lines, Shapes, Triangles, Rects} from '../../../dist/geometry.js';
import {dotProduct} from '../../../dist/arrays.js';

let ptr = {x: 0, y: 0};
let ptrClick = {x: 300, y: 200};

const canvas = new CanvasHelper(`#plot`, {fill:`viewport`,onResize:() => { draw(); }});

console.log(dotProduct([
  [1, 2, 3], [1, 2, 3]
]));

console.log(dotProduct([
  [2, 4, 6], [2, 4, 6]
]));

console.log(dotProduct([
  [1, 1, 1], [0, 1, -1]
]));

const tri = Triangles.fromFlatArray([0, 0, 0, 1, 1, 0]);
console.log(Triangles.barycentricCoord(tri, 0.5, 0.5));


const drawStarburst = () => {
  const pts = Shapes.starburst(300, 10, 140, {x: canvas.width / 2, y: canvas.height / 2});
  Drawing.connectedPoints(canvas.ctx, pts, {loop: true, fillStyle: `orange`, strokeStyle: `red`});
}

const drawTriangle = () => {
  const origin = {x: 200, y: 200};
  const t = Triangles.fromRadius(origin, 100, {initialAngleRadian: -Math.PI / 2});
  Drawing.triangle(canvas.ctx, t, {strokeStyle: `blue`, fillStyle: `silver`, debug: true});
  Drawing.dot(canvas.ctx, origin, {fillStyle: `blue`});

  const c = Triangles.centroid(t);
  Drawing.dot(canvas.ctx, c, {fillStyle: `yellow`});

  const innerCircle = Triangles.innerCircle(t);
  Drawing.circle(canvas.ctx, innerCircle, {strokeStyle: `purple`});

  const outerCircle = Triangles.outerCircle(t);
  Drawing.circle(canvas.ctx, outerCircle, {strokeStyle: `purple`});

  const inside = Triangles.intersectsPoint(t, ptr);
  Drawing.dot(canvas.ctx, ptr, {fillStyle: inside ? `red` : `black`});
}

const drawLine = () => {
  const { ctx } = canvas;
  const a = {x: 100, y: 100};
  const b = {x: 300, y: 150};
  const line = {a, b};
  const p = Lines.perpendicularPoint(line, -50, 0.5);

  console.log(p);
  Drawing.line(ctx, line, {strokeStyle: `black`});
  Drawing.dot(ctx, p, {radius: 2, fillStyle: `black`});

  const para = Lines.parallel(line, 50);
  Drawing.line(ctx, para, {strokeStyle: `red`});
  console.log(`Para length: ${Lines.length(para)}`);

  const scaled = Lines.scaleFromMidpoint(para, 0.5);
  Drawing.line(ctx, scaled, {strokeStyle: `blue`});
  console.log(`Scaled length: ${Lines.length(scaled)}`);

  const rotated = Lines.rotate(line, Math.PI / 2, 0.1);
  Drawing.line(ctx, rotated, {strokeStyle: `blue`});

}

const drawArrow = () => {
  const { ctx}= canvas;
  const opts = {
    angleRadian: degreeToRadian(45),
    tailThickness: 50,
    tailLength: 150,
    arrowSize: 200
  }
  const arrow = Shapes.arrow(ptrClick, `tail`, opts);
  Drawing.connectedPoints(ctx, arrow, {strokeStyle: `red`, loop: true});
}

const draw = () => {
  drawArrow();
}

document.addEventListener(`pointermove`, evt => {
  ptr = {
    x: evt.x,
    y: evt.y
  };
  canvas.clear();
  draw();
});

document.addEventListener(`pointerup`, evt => {
  ptrClick = {
    x: evt.x,
    y: evt.y
  };
  canvas.clear();
  draw();

});

