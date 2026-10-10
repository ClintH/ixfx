import {parentSizeCanvas} from '../../../dist/dom.js';
import {Drawing} from '../../../dist/visual.js';
import {Circles} from '../../../dist/geometry.js';

let ptr = {x: 0, y: 0};
let ptrClick = {x: 300, y: 200};

const canvasEl = /** @type {HTMLCanvasElement} */(document.getElementById(`plot`));

const ctx = /** @type {CanvasRenderingContext2D} */(canvasEl.getContext(`2d`));

function plot(pt) {
  ctx.fillRect(pt.x, pt.y, 1,1);

}
function exteriorIntegerPoints() {
  const c = {x:100, y:100,radius:100};
  ctx.strokeStyle = `whitesmoke`;
  
  ctx.fillStyle = `red`;
  plot(c);
  ctx.fillStyle = `black`;

  for (const pt of Circles.exteriorIntegerPoints(c)) {
    plot(pt);
  }
}

function interiorIntegerPoints() {
  const c = {x:100, y:100,radius:100};
  ctx.fillStyle = `green`;
  for (const pt of Circles.interiorIntegerPoints(c)) {
    plot(pt);
  }
}

interiorIntegerPoints();