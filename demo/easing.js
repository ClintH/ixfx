import {Plot, Easings} from "../dist/bundle.mjs";

const canvas = document.getElementById('canvas');
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');

let easing = Easings.timer('EaseInOutCirc', 1000);
console.log('Easing made!');

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
plot.showScale = false;
plot.showMiddle = false;

function clear() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}


const draw = function () {
  clear();
  const amt = easing.compute();

  ctx.fillStyle = 'black';
  if (easing.isDone()) {
    ctx.fillText('Easing complete.', 10, 10);
  } else {
    ctx.fillText('Easing...', 10, 10);
    plot.push(amt);
  }


  ctx.fillStyle = 'black';
  //  ctx.fillText(`Stage: ${Envelopes.stageToText(stage)}`, 10, 10);
  //ctx.fillText(amt, 10, 50);

  window.requestAnimationFrame(draw);

}

window.requestAnimationFrame(draw);


