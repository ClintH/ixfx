import {Plot3} from '../../../dist/visual.js';
import {pingPongPercent} from '../../../dist/numbers.js';
import {continuously} from '../../../dist/flow.js';
import {Oscillators} from '../../../dist/modulation.js';
import { scaleCanvas} from '../../../dist/visual.js';

const {ctx,bounds,element} = scaleCanvas(`#plot`);
const padding = 10;

const plotRegion = { 
  x: padding, 
  y: padding, 
  width: bounds.width-(padding*2), 
  height: bounds.height-(padding*2) 
};

const plot = Plot3.scalarCanvasPlot(element, plotRegion);

const loop = continuously(() => {
  ctx.fillStyle =`silver`;
  ctx.fillRect(0,0,bounds.width, bounds.height);
  ctx.fillStyle =`white`;
  ctx.fillRect(plotRegion.x, plotRegion.y, plotRegion.width, plotRegion.height);
  plot.add(`test`, Math.random());
  // testSeries.add(Math.random());
  plot.draw(ctx, true);

}, 1000);
loop.start();


document.getElementById(`btnToggle`).addEventListener(`click`, () => {
  if (loop.isDone) loop.start();
  else loop.cancel();
});

document.getElementById(`btnToggleYAxis`).addEventListener(`click`, () => {
  p.axisY.visible = !p.axisY.visible;
});