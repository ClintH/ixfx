import {Plot2} from '../../../dist/visual.js';
import {pingPongPercent} from '../../../dist/generators.js';
import {continuously} from '../../../dist/flow.js';
import {Oscillators} from '../../../dist/modulation.js';

const canvasEl = document.getElementById(`plot`);
let p = new Plot2.Plot(canvasEl, {
  autoSize: true
});

const testSeriesA = p.createSeries(`testa`, `array`, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
const testSeriesB = p.createSeries(`testb`, `stream`);
p.axisY.seriesToShow = `testb`;
testSeriesA.drawingStyle = `line`;
//testSeriesB.drawingStyle = `dotted`;

p.update();

// const pp = pingPongPercent(0.1);
const sine = Oscillators.sine(0.1);

const loop = continuously(() => {
  const v = sine.next().value * 100;
  testSeriesB.add(v);
  p.update();
}, 10);
//loop.start();

document.getElementById(`btnToggle`).addEventListener(`click`, () => {
  if (loop.isDone) loop.start();
  else loop.cancel();
});

document.getElementById(`btnToggleYAxis`).addEventListener(`click`, () => {
  p.axisY.visible = !p.axisY.visible;
});