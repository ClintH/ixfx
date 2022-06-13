import {parentSizeCanvas} from '../../../dist/dom.js';
import {Drawing} from '../../../dist/visual.js';
import {Lines, Shapes, Triangles} from '../../../dist/geometry.js';

const canvasEl = document.getElementById(`plot`);
parentSizeCanvas('#plot', (args) => {
  drawLine();
});

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


}

