import * as G from '@ixfx/geometry';
import * as V from '../../../../visual/src/index.js';
import { shapes } from './shapes.js';

const ch = new V.CanvasHelper(`canvas`, {
  height: 360,
  width: 640
});
const dh = ch.getDrawHelper();
const origin = { x: ch.width / 2, y: ch.height / 2 }
let ray: G.PolarRayWithOrigin = {
  origin,
  angleRadian: 0.32,
  length: ch.width * 2
}

// Convert cartestian lines to polar lines
const shapesAsPolar = shapes.map(shape => G.Polar.toPolarLine(shape, origin, { digits: 2, orderBy: `angle-min` }));

// Debug print
shapesAsPolar.forEach((shape, index) => {
  console.group(`Shape ${ index }`);
  shape.forEach(edge => {
    console.log(G.Polar.polarLineToString(edge));
  })
  console.groupEnd();
});

// Merge all the edges together
const pro = G.Polar.intersectionDistanceCompute(...shapesAsPolar.flat());

function drawRayShapes(shapes: G.PolarLine[][]) {
  for (const shape of shapes) {
    dh.ctx.strokeStyle = `black`;
    const lines = G.Polar.lineToCartestian(shape, origin);
    dh.line(lines);
  }
}

function drawCursor(cursor: G.Point, radius = 5) {
  dh.dot(cursor, { fillStyle: `red`, radius });
}

function drawRay(ray: G.PolarRayWithOrigin) {
  const line = G.Polar.Ray.toCartesian(ray);
  dh.line(line);
}



function draw() {
  ch.clear();
  dh.textBlock([ `Cursor angle:${ ray.angleRadian.toFixed(2) }` ], {
    anchor: { x: 10, y: 10 },
    fillStyle: `black`,
  });
  drawRayShapes(shapesAsPolar);
  drawRay(ray);
  intersectsPro(ray);
}

function intersectsPro(testRay: G.PolarRay) {
  const rayAngle = ray.angleRadian;

  const computed = [ ...pro(rayAngle) ];
  if (computed.length == 0) return;

  computed.sort((a, b) => a.distance - b.distance);
  for (const inter of computed) {
    dh.dot(G.Polar.toCartesian({ distance: inter.distance, angleRadian: rayAngle }, origin), { radius: 2, fillStyle: `yellow` })
  }

  dh.dot(G.Polar.toCartesian({ distance: computed[ 0 ].distance, angleRadian: rayAngle }, origin), { radius: 2, fillStyle: `red` })
}

function intersectsBasic(testRay: G.PolarRay, shapes: G.PolarLine[][]) {
  const rayAngle = ray.angleRadian;
  const start = performance.now();
  for (const shape of shapes) {
    dh.ctx.strokeStyle = `white`;
    for (const edge of shape) {
      const distance = G.Polar.intersectionDistance(rayAngle, edge);
      if (distance) {
        dh.dot(G.Polar.toCartesian({ angleRadian: rayAngle, distance }, origin), { radius: 2, fillStyle: `red` })
      }
    }
  }
  let elapsed = performance.now() - start;

  console.log(`elapsed basic: ${ elapsed }`);


  elapsed = performance.now() - start;
  console.log(`elapsed pro: ${ elapsed }`);

}
document.querySelector('canvas')?.addEventListener(`pointermove`, event => {
  const cursor = {
    x: event.offsetX,
    y: event.offsetY
  }
  ray = {
    ...ray,
    angleRadian: G.Points.angleRadianCircle(origin, cursor)
  }
  draw();
});

drawRayShapes(shapesAsPolar);
draw();