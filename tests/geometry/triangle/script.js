import {parentSizeCanvas} from '../../../dist/dom.js';
import {Drawing} from '../../../dist/visual.js';
import {Triangles} from '../../../dist/geometry.js';

let ptr = {x: 0, y: 0};
let ptrClick = {x: 300, y: 200};

const canvasEl = document.getElementById(`plot`);
parentSizeCanvas('#plot', (args) => {
  draw();
});

/** @type {CanvasRenderingContext2D} */
const ctx = canvasEl.getContext(`2d`);


const drawTriangleE = () => {
  const origin = ptrClick;

  ctx.fillStyle = `black`;
  ctx.fillText(`Equilateral triangles`, 100, 100);
  const eq = {length: 100};

  const t = Triangles.Equilateral.fromCenter(eq, origin);
  Drawing.triangle(ctx, t, {strokeStyle: `blue`, fillStyle: `silver`, debug: true});

  const originFromA = Triangles.Equilateral.centerFromA(eq, origin);
  Drawing.triangle(ctx,
    Triangles.Equilateral.fromCenter(eq, originFromA), {strokeStyle: `red`, debug: true});

  const originFromB = Triangles.Equilateral.centerFromB(eq, origin);
  Drawing.triangle(ctx, Triangles.Equilateral.fromCenter(eq, originFromB), {strokeStyle: `green`, debug: true});

  const originFromC = Triangles.Equilateral.centerFromC(eq, origin);
  Drawing.triangle(ctx, Triangles.Equilateral.fromCenter(eq, originFromC), {strokeStyle: `orange`, debug: true});

}

const drawTriangleR = () => {
  const origin = ptrClick;

  ctx.fillStyle = `black`;
  ctx.fillText(`Right triangles`, 100, 100);
  const rt = {opposite: 100, adjacent: 150};

  Drawing.triangle(ctx,
    Triangles.Right.fromA(rt, origin),
    {strokeStyle: `blue`, debug: true});

  Drawing.triangle(ctx,
    Triangles.Right.fromB(rt, origin),
    {strokeStyle: `red`, debug: true});

  Drawing.triangle(ctx,
    Triangles.Right.fromC(rt, origin),
    {strokeStyle: `orange`, debug: true});
}

const drawTriangleIsos = () => {
  const origin = ptrClick;

  ctx.fillStyle = `black`;
  ctx.fillText(`Right triangles`, 100, 100);
  const rt = {legs: 200, base: 100};


  Drawing.triangle(ctx,
    Triangles.Isosceles.fromCenter(rt, origin),
    {strokeStyle: `black`, debug: true});

  Drawing.triangle(ctx,
    Triangles.Isosceles.fromA(rt, origin),
    {strokeStyle: `blue`, debug: true});

  Drawing.triangle(ctx,
    Triangles.Isosceles.fromB(rt, origin),
    {strokeStyle: `red`, debug: true});

  Drawing.triangle(ctx,
    Triangles.Isosceles.fromC(rt, origin),
    {strokeStyle: `orange`, debug: true});
}

const draw = () => {
  drawTriangleIsos();
}

document.addEventListener(`pointermove`, evt => {
  ptr = {
    x: evt.x,
    y: evt.y
  };
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  draw();
});

document.addEventListener(`pointerup`, evt => {
  ptrClick = {
    x: evt.x,
    y: evt.y
  };
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  draw();
});

