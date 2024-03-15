import {CanvasHelper} from '../../../dist/dom.js';
import {Drawing} from '../../../dist/visual.js';
import {QuadTree } from '../../../dist/geometry.js';
import {Trees} from '../../../dist/collections.js';

const canvas = new CanvasHelper(`#plot`,{fill:`viewport`});

let ptr = {x: 0, y: 0};
let ptrClick = {x: 300, y: 200};

const rect = {width: window.innerWidth - 200, height: window.innerHeight -200, x: 100, y: 100};

const quad = QuadTree.quadTree(rect);

const items = [];

const drawQuad = () => {
  Drawing.rect(canvas.ctx, rect, { strokeStyle: `black`});
  //packed.forEach(c => Drawing.circle(ctx, c, { fillStyle: `hsl(${c.hue*360}, 50%, 50%)`}));

  for (const quadNode of Trees.Traverse.depthFirst(quad)) {
    Drawing.rect(canvas.ctx, quadNode.boundary, { fillStyle: `transparent`, strokeStyle: `red`});
    for (const item of quadNode.getValue()) {
      Drawing.dot(canvas.ctx, item, { fillStyle: `black`});
    }
  }
}

const draw = () => {
  drawQuad();
}

document.addEventListener(`keyup`, () => {
  canvas.clear();//ctx.clearRect(0,0,canvasEl.width, canvasEl.height);
  draw();
})

document.addEventListener(`pointerup`, evt => {
  ptrClick = {
    x: evt.x,
    y: evt.y
  };
  const added = quad.add(ptrClick);
  console.log(`Added: ${added}`);
  canvas.clear();
  draw();
});