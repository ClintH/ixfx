import * as G from '@ixfx/geometry';
import * as V from '../../../visual/src/index.js';
import { shapes } from './shapes.js';

const settings = {
  resolution: 360
}
const ch = new V.CanvasHelper(`canvas`, {
  height: 360,
  width: 640
});
const dh = ch.getDrawHelper();

type Light = G.Point & {
  power: number
  compute: G.Polar.IntersectionDistanceCompute

}

const lights: Light[] = [
  createLight({ x: ch.width / 2, y: ch.height / 2 })
]

function createLight(location: G.Point, power = 1): Light {
  // Convert cartesian lines to polar lines with location as origin
  const shapesAsPolar: G.PolarLine[][] = shapes.map(shape => G.Polar.toPolarLine(shape, location, { digits: 2, orderBy: `angle-min` }));

  // Merge all the edges together
  const edges = shapesAsPolar.flat();
  const compute = G.Polar.intersectionDistanceCompute(...edges);

  return {
    ...location,
    power,
    compute
  }
}

// function drawRayShapes(shapes: G.PolarLine[][]) {
//   for (const shape of shapes) {
//     dh.ctx.strokeStyle = `black`;
//     const lines = G.Polar.lineToCartestian(shape, origin);
//     dh.line(lines);
//   }
// }

function drawShapes(shapes: G.PolyLine[]) {
  //dh.ctx.strokeStyle = `black`;
  let count = 0;
  for (const shape of shapes) {
    count++;
    if (count === 1) continue;
    const points = G.Lines.polyLineToPoints(shape, true);
    ch.ctx.beginPath();
    ch.ctx.strokeStyle = `green`;
    ch.ctx.lineWidth = 2;
    for (let index = 0; index < points.length; index++) {
      if (index === 0) ch.ctx.moveTo(points[ index ].x, points[ index ].y);
      else {
        ch.ctx.lineTo(points[ index ].x, points[ index ].y);
      }
    }
    ch.ctx.closePath();

    ch.ctx.stroke();
    //dh.connectedPoints(points, { fillStyle: `silver`, loop: true });

  }

  // for (const shape of shapes) {
  //   dh.line(shape);
  // }
}

// function drawCursor(cursor: G.Point, radius = 5) {
//   dh.dot(cursor, { fillStyle: `red`, radius });
// }

// function drawRay(ray: G.PolarRayWithOrigin) {
//   const line = G.Polar.Ray.toCartesian(ray);
//   dh.line(line);
// }

// function drawLine(start: G.Point, end: G.Point) {
//   dh.line({
//     a: start,
//     b: end
//   });
// }

function draw() {
  //ch.clear();

  ch.fill(`black`);
  // dh.textBlock([ `Cursor angle:${ ray.angleRadian.toFixed(2) }` ], {
  //   anchor: { x: 10, y: 10 },
  //   fillStyle: `black`,
  // });
  let count = 0;
  for (const light of lights) {
    scanning(light);
    drawLight(light);
    count++;
  }
  drawShapes(shapes);

}

function drawLight(light: Light) {
  dh.dot(light, { filled: false, strokeStyle: `yellow` });
}

function scanning(light: Light) {
  const div = Math.PI * 2 / settings.resolution;
  const angleRadian = 0;
  // for (let index = 0; index < settings.resolution; index++) {
  //   const computed = [ ...light.compute.compute(angleRadian) ];
  //   if (computed.length == 0) continue;
  //   computed.sort((a, b) => a.distance - b.distance);

  //   const endPoint = G.Polar.toCartesian({ distance: computed[ 0 ].distance, angleRadian }, light);
  //   dh.connectedPoints([ light, endPoint ], { strokeStyle: `white` });
  //   dh.dot(G.Polar.toCartesian({ distance: computed[ 0 ].distance, angleRadian }, light), { radius: 2, fillStyle: `red` })

  //   angleRadian += div;
  // }

  const poly = light.compute.visibilityPolygon(1e-6);
  const cart = poly.map(v => G.Polar.toCartesian(v, light));
  dh.connectedPoints(cart, { strokeStyle: `red`, fillStyle: `whitesmoke` });

}

// function intersectsPro(testRay: G.PolarRay) {
//   const rayAngle = ray.angleRadian;

//   const computed = [ ...pro(rayAngle) ];
//   if (computed.length == 0) return;

//   computed.sort((a, b) => a.distance - b.distance);
//   for (const inter of computed) {
//     dh.dot(G.Polar.toCartesian({ distance: inter.distance, angleRadian: rayAngle }, origin), { radius: 2, fillStyle: `yellow` })
//   }

//   dh.dot(G.Polar.toCartesian({ distance: computed[ 0 ].distance, angleRadian: rayAngle }, origin), { radius: 2, fillStyle: `red` })
// }

document.querySelector('canvas')?.addEventListener(`pointermove`, event => {
  const cursor = {
    x: event.offsetX,
    y: event.offsetY
  }
  // let ray = {
  //   ...ray,
  //   angleRadian: G.Points.angleRadianCircle(origin, cursor)
  // }

  lights[ 0 ] = createLight({
    x: event.offsetX,
    y: event.offsetY
  })
  draw();
});

//drawRayShapes(shapesAsPolar);
draw();