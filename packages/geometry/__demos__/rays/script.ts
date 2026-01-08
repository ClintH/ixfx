import * as G from '@ixfx/geometry';
import * as V from '../../../visual/src/index.js';
import { shapes } from './shapes.js';
import { ring } from '../../src/surface-points.js';
import { pairwise } from '@ixfx/arrays';


const lines = shapes.flat();
const raycaster = G.Rays.raycast2d(lines);

const settings = {
  resolution: 360
}
const ch = new V.CanvasHelper(`canvas`, {
  height: 360,
  width: 640
});
const dh = ch.getDrawHelper();

type Light = {
  x: number,
  y: number,
  samples: number,
  radius: number,
  power: number
  //shadow: (light: G.Point) => G.Point[]
  //compute: (light: G.Point) => G.Point[]
  //computeAlt: () => G.Point[]
}

const lights: Light[] = [
  createLight({ x: ch.width / 2, y: ch.height / 2 }, 50)
]


function createLight(location: G.Point, radius: number, power = 1): Light {
  return {
    ...location,
    radius,
    power,
    samples: 32
    //shadow: G.Rays.visibilityPolygons(lines),
    //computeAlt: () => G.Rays.visibilityPolygonSweep(location, lines)
  }
}

function drawShapes(shapes: G.PolyLine[]) {
  let count = 0;
  for (const shape of shapes) {
    count++;
    if (count === 1) continue;
    const points = G.Lines.polyLineToPoints(shape, true);
    ch.ctx.beginPath();
    ch.ctx.strokeStyle = `darkgray`;
    ch.ctx.lineWidth = 2;
    for (let index = 0; index < points.length; index++) {
      if (index === 0) ch.ctx.moveTo(points[ index ].x, points[ index ].y);
      else {
        ch.ctx.lineTo(points[ index ].x, points[ index ].y);
      }
    }
    ch.ctx.closePath();
    ch.ctx.fill();
    ch.ctx.stroke();
    //dh.connectedPoints(points, { fillStyle: `silver`, loop: true });

  }
}

function draw() {
  ch.fill(`black`);
  let count = 0;
  for (const light of lights) {
    run(light);
    //drawLight(light);
    count++;
  }
  drawShapes(shapes);

  for (const index of G.Rays.intersections({ x: 0, y: 0 }, { x: 640, y: 320 }, lines)) {
    console.log(index);
    dh.dot(index, { radius: index.d * 10, fillStyle: `red` });
  }
}

// function drawLight(light: Light) {
//   dh.dot(light, { radius: light.radius, filled: false, strokeStyle: `yellow` });
// }

function run(light: Light) {
  const rad = 5;
  // const shadowFill = `hsl(120deg 0% 50% / 0.2)`;
  // const ringLights = [ ...ring(light, { count: 3 }) ];
  // for (const pt of ringLights) {
  //   const shadow = G.Rays.visibilityPolygonSweep(pt, 16, lines);
  //   dh.connectedPoints(shadow, { fillStyle: shadowFill });
  // }
  // let shadow = G.Rays.visibilityPolygonSweep(G.Points.sum(light, rad, 0), lines);
  // dh.connectedPoints(shadow, { fillStyle: shadowFill });

  // shadow = G.Rays.visibilityPolygonSweep(G.Points.sum(light, -rad, 0), lines);
  // dh.connectedPoints(shadow, { fillStyle: shadowFill });

  // shadow = G.Rays.visibilityPolygonSweep(G.Points.sum(light, 0, -rad), lines);
  // dh.connectedPoints(shadow, { fillStyle: shadowFill });
  // shadow = G.Rays.visibilityPolygonSweep(G.Points.sum(light, 0, rad), lines);
  // dh.connectedPoints(shadow, { fillStyle: shadowFill });

  const now = performance.now();
  const samples = raycaster(light);
  const elapsed1 = performance.now() - now;

  const fan = G.Rays.asFan(samples, light);

  renderLight(ch.ctx, light, fan, "rgba(255, 230, 161, 1)");
  applyRadialFalloff(ch.ctx, light, 900, "rgba(240, 214, 141, 1)");


  // for (const p of samples) {
  //   const line = lines[ p.line ];
  //   dh.line(line, { strokeStyle: `yellow` })
  // }
  //console.log(`1: ${ elapsed1 }`);

  //console.log(poly);

  //dh.connectedPoints(samples, { fillStyle: `silver`, strokeStyle: `red` });
  // for (const pw of pairwise(poly)) {
  //   dh.connectedPoints([ ...pw, light ], { fillStyle: `silver`, strokeStyle: `red` });
  // }
  //dh.dot(samples, { radius: 2 });

  // for (const rl of ringLights) {
  //   dh.dot(rl, { radius: 2, filled: true, fillStyle: `red` });

  // }
}

document.querySelector('canvas')?.addEventListener(`pointermove`, event => {
  lights[ 0 ].x = event.offsetX;
  lights[ 0 ].y = event.offsetY;
  draw();
});

function renderLight(
  ctx: CanvasRenderingContext2D,
  light: Light,
  samples: G.Rays.RaycastHit[],
  color: string
) {
  const cx = light.x;
  const cy = light.y;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (let index = 0; index < samples.length - 1; index++) {
    const a = samples[ index ];
    const b = samples[ index + 1 ];

    // Average penumbra for the triangle
    const alpha = (a.d + b.d) * 0.5;

    if (alpha <= 0) continue;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.closePath();

    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fill();
  }

  ctx.restore();
}

function applyRadialFalloff(
  ctx: CanvasRenderingContext2D,
  light: G.CirclePositioned,
  maxRadius: number,
  color: string
) {
  const g = ctx.createRadialGradient(
    light.x,
    light.y,
    0,
    light.x,
    light.y,
    maxRadius
  );

  ctx.save();
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalCompositeOperation = "hard-light";
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(light.x, light.y, maxRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}


//drawRayShapes(shapesAsPolar);
draw();