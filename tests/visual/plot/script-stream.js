import {Plot2} from '../../../dist/visual.js';
import {pingPongPercent} from '../../../dist/generators.js';
import {continuously} from '../../../dist/flow.js';
import {Oscillators} from '../../../dist/modulation.js';

const canvasEl = document.getElementById(`plot`);
let p = new Plot2.Plot(canvasEl, {
  autoSize: true
});

const testSeries = p.createSeries(`testb`, `stream`, {
  colour: `blue`
});

p.update();

const loop = continuously(() => {
  testSeries.add(Math.random());
  p.update();
}, 500);
loop.start();


document.getElementById(`btnToggle`).addEventListener(`click`, () => {
  if (loop.isDone) loop.start();
  else loop.cancel();
});

document.getElementById(`btnToggleYAxis`).addEventListener(`click`, () => {
  p.axisY.visible = !p.axisY.visible;
});