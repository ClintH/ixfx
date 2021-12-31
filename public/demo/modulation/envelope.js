import {Lines, Plot, Envelopes, Paths, Beziers, Drawing, MultiPaths, Points, Rects} from "/dist/bundle.js";

const canvas = document.getElementById('canvas');
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');
canvas.addEventListener
let env = Envelopes.pathEnvelope({looping: false});
//env.trigger();

document.getElementById('btnHold').addEventListener('click', () => {
  env.hold();
})

document.getElementById('btnRelease').addEventListener('click', () => {
  env.release();
})

document.getElementById('btnTrigger').addEventListener('click', () => {
  env.trigger();
})


const plot = new Plot(document.getElementById('plot'), 500);

function clear() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  window.addEventListener
}

const draw = function () {
  clear();
  let [stage, amt] = env.compute();

  plot.push(amt);
  ctx.fillStyle = 'black';
  ctx.fillText(`Stage: ${Envelopes.stageToText(stage)}`, 10, 10);
  ctx.fillText(amt, 10, 50);

  window.requestAnimationFrame(draw);

}

window.requestAnimationFrame(draw);


