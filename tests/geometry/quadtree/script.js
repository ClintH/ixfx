import {parentSizeCanvas} from '../../../dist/dom.js';
import {Drawing} from '../../../dist/visual.js';
import * as Flow from '../../../dist/flow.js';
import * as Random from '../../../dist/random.js';
import {quadTree, Layouts, Circles, degreeToRadian, Points, Lines, Shapes, Triangles, Rects} from '../../../dist/geometry.js';
import {dotProduct} from '../../../dist/arrays.js';
import {Trees} from '../../../dist/collections.js';

const canvasEl = document.getElementById(`plot`);

let ptr = {x: 0, y: 0};
let ptrClick = {x: 300, y: 200};

const rect = {width: window.innerWidth - 200, height: window.innerHeight -200, x: 100, y: 100};

const quad = quadTree(rect);
const items = [];

/** @type {CanvasRenderingContext2D} */
const ctx = canvasEl.getContext(`2d`);

const drawQuad = () => {
  Drawing.rect(ctx, rect, { strokeStyle: `black`});
  //packed.forEach(c => Drawing.circle(ctx, c, { fillStyle: `hsl(${c.hue*360}, 50%, 50%)`}));

  for (const quadNode of Trees.dfs(quad)) {
    Drawing.rect(ctx, quadNode.boundary, { fillStyle: `transparent`, strokeStyle: `red`});
    for (const item of quadNode.items) {
      Drawing.dot(ctx, item, { fillStyle: `black`});
    }
  }
}

const draw = () => {
  drawQuad();
}

parentSizeCanvas('#plot', (args) => {
  draw();
});

document.addEventListener(`keyup`, () => {
  ctx.clearRect(0,0,canvasEl.width, canvasEl.height);
  draw();
})

// document.addEventListener(`pointermove`, evt => {
//   ptr = {
//     x: evt.x,
//     y: evt.y
//   };
//   ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
//   draw();
// });

document.addEventListener(`pointerup`, evt => {
  ptrClick = {
    x: evt.x,
    y: evt.y
  };
  quad.add(ptrClick);
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  draw();
});

