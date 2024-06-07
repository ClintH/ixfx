import {parentSizeCanvas} from '../../../dist/dom.js';
import { Colour } from '../../../dist/visual.js';

const canvasWidth = 400;
const step = 0.005;
const max = 1;
const colours = ['rebeccapurple','yellow', 'red'];
const ci = Colour.interpolator(colours, { space:'lab'});

const drawInterpolation = () => {
  const el = /** @type HTMLCanvasElement */(document.getElementById('interpolate'));
  const ctx = el.getContext(`2d`);

  if (!ctx) return;
  let v = 0;
  let x = 0;
  let y = 0;
  let w = Math.max(1, canvasWidth*step);
  let h = 200;
  while (v <= max) {
    const colour = ci(v);
    ctx.fillStyle = Colour.toHslaString(colour);
    ctx.fillRect(x, y, w, h);
    x += w;
    v += step;
  }
}

const drawSteps = () => {
  const el = /** @type HTMLCanvasElement */(document.getElementById('steps'));
  const ctx = el.getContext(`2d`);
  const stepped = Colour.scale(colours, 10, { space:'lab'});
  
  if (!ctx) return;
  let v = 0;
  let x = 0;
  let y = 0;
  let w =  canvasWidth/stepped.length;
  let h = 200;
  while (v < stepped.length) {
    ctx.fillStyle = Colour.toString(stepped[v]);
    ctx.fillRect(x, y, w, h);
    x += w;
    v ++;
  }

  const grad = /** @type HTMLElement */(document.getElementById('gradient'));
  grad.style.background = Colour.cssLinearGradient(stepped);
}
drawInterpolation();
drawSteps();