import { Plot2 } from '../../../dist/visual.js';
import { continuously } from '../../../dist/flow.js';

//const {ctx,bounds,element} = scaleCanvas(`#plot`);

const padding = 10;

// const plotRegion = { 
//   x: padding, 
//   y: padding, 
//   width: bounds.width-(padding*2), 
//   height: bounds.height-(padding*2) 
// };

const plot = new Plot2.Plot(`#plot`, {
  resizeLogic: `both`
});


const loop = continuously(() => {
  // ctx.fillStyle =`silver`;
  // ctx.fillRect(0,0,bounds.width, bounds.height);
  // ctx.fillStyle =`white`;
  // ctx.fillRect(plotRegion.x, plotRegion.y, plotRegion.width, plotRegion.height);

  plot.plot({ test: Math.random() });

  //plot.add(`test`, Math.random());
  // testSeries.add(Math.random());
  //plot.draw(ctx, true);

}, 1000);
loop.start();


// document.getElementById(`btnToggle`).addEventListener(`click`, () => {
//   if (loop.isDone) loop.start();
//   else loop.cancel();
// });

// document.getElementById(`btnToggleYAxis`).addEventListener(`click`, () => {
//   p.axisY.visible = !p.axisY.visible;
// });