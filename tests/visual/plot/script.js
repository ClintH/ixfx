import { Plot } from '../../../dist/visual.js';

const p = Plot.CartesianCanvasPlot.create(`canvas`);

const generate = () => {
  for (let i = 0; i < 100; i++) {
    p.dataSet.add({ x: i, y: Math.random() }, `lemons`);
  }
  p.draw();
}