import {CanvasHelper} from '../../../dist/dom.js';
import {Drawing} from '../../../dist/visual.js';
import * as Flow from '../../../dist/flow.js';
import * as Random from '../../../dist/random.js';
import {Layouts, Circles, degreeToRadian, Points, Lines, Shapes, Triangles, Rects} from '../../../dist/geometry.js';
import {dotProduct} from '../../../dist/arrays.js';

const canvas = new CanvasHelper(`#plot`, {fill:`viewport`, onResize: () => draw()});

let ptr = {x: 0, y: 0};
let ptrClick = {x: 300, y: 200};

const circle = {x: window.innerWidth/2, y:window.innerHeight/2, radius: 200};
const rect = {width: window.innerWidth - 200, height: window.innerHeight -200, x: 100, y: 100};
const radiusRandom = Random.gaussianSource(4);
const radiusMin = 2;
const circleQuantity = 500;

const circlesToPack = [...Flow.repeat(circleQuantity,  () =>  ({ hue: Math.random(), radius: (radiusRandom() * 200)+ radiusMin }))];

const drawDistribution = () => {
  const amt = 500;
  for (let i=0;i<amt;i++) {
    const c = Circles.randomPoint(circle);
    Drawing.dot(canvas.ctx, c, { radius: 2 });
  }
}


const drawPacked = () => {
  Drawing.rect(canvas.ctx, rect, { strokeStyle:`black`});
  const m = performance.now();
  const packed = Layouts.CirclePacking.random(circlesToPack, rect);
  console.log(packed.length + '/' + circlesToPack.length + ' packed in ' + (performance.now() - m));
  packed.forEach(c => Drawing.circle(canvas.ctx, c, { fillStyle: `hsl(${c.hue*360}, 50%, 50%)`}));
}

const draw = () => {
  drawPacked();
}


document.addEventListener(`keyup`, () => {
  canvas.clear();
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

// document.addEventListener(`pointerup`, evt => {
//   ptrClick = {
//     x: evt.x,
//     y: evt.y
//   };
//   ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
//   draw();
// });

