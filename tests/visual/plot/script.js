import {Plot2} from '../../../dist/visual.js';
import {pingPongPercent} from '../../../dist/numbers.js';
import {continuously} from '../../../dist/flow.js';
import {Oscillators} from '../../../dist/modulation.js';

const canvasEl = document.getElementById(`plot`);
let p = new Plot2.Plot(canvasEl, {
  autoSize: false
});
p.debugLayout = true;

//const testSeriesA = p.createSeries(`testa`, `array`, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
//const testSeriesB = p.createSeries(`testb`, `stream`);
//p.axisY.seriesToShow = `testb`;
//testSeriesA.drawingStyle = `bar`;
//testSeriesB.drawingStyle = `dotted`;

p.update();

// const pp = pingPongPercent(0.1);
const sine = Oscillators.sine(0.1);

const loop2 = continuously(() => {
  const d = {
    acc: {x: 6995*Math.random(), y: -3834*Math.random(), z: -1644*Math.random()},
    gyro: {x: -35*Math.random(), y: 102*Math.random(), z: 213 * Math.random()}
  };
  p.plot(d);
  p.update();
},100);
loop2.start();

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