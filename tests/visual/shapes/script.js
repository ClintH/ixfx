import {parentSizeCanvas} from '../../../dist/dom.js';
import {Drawing} from '../../../dist/visual.js';
import {degreeToRadian, Lines, Shapes, Triangles} from '../../../dist/geometry.js';
import {dotProduct} from '../../../dist/arrays.js';

let ptr = {x: 0, y: 0};

const canvasEl = document.getElementById(`plot`);
parentSizeCanvas('#plot', (args) => {
  draw();
});


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

/** @type {CanvasRenderingContext2D} */
const ctx = canvasEl.getContext(`2d`);

const drawStarburst = () => {
  const pts = Shapes.starburst(300, 10, 140, {x: canvasEl.width / 2, y: canvasEl.height / 2});
  Drawing.connectedPoints(ctx, pts, {loop: true, fillStyle: `orange`, strokeStyle: `red`});
}

const drawTriangle = () => {
  const origin = {x: 200, y: 200};
  const t = Triangles.equilateralFromOrigin(origin, 100, {initialAngleRadian: -Math.PI / 2});
  Drawing.triangle(ctx, t, {strokeStyle: `blue`, fillStyle: `silver`, debug: true});
  Drawing.dot(ctx, origin, {fillStyle: `blue`});

  const c = Triangles.centroid(t);
  Drawing.dot(ctx, c, {fillStyle: `yellow`});

  const innerCircle = Triangles.innerCircle(t);
  Drawing.circle(ctx, innerCircle, {strokeStyle: `purple`});

  const outerCircle = Triangles.outerCircle(t);
  Drawing.circle(ctx, outerCircle, {strokeStyle: `purple`});

  const inside = Triangles.intersectsPoint(t, ptr);
  Drawing.dot(ctx, ptr, {fillStyle: inside ? `red` : `black`});
}

const drawLine = () => {
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

const draw = () => {
  drawTriangle();
}

document.addEventListener(`pointermove`, evt => {
  ptr = {
    x: evt.x,
    y: evt.y
  };
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  draw();
})

