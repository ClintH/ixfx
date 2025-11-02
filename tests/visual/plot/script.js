import { Plot } from '../../../packages/bundle/dist/src/visual.js';

const ds = new Plot.DataSet();
const p = Plot.CartesianCanvasPlot.fromCanvas(`canvas`, ds) // Plot.CartesianCanvasPlot.create(`canvas`);

const generate = () => {
  for (let i = 0; i < 100; i++) {
    p.dataSet.add({ x: i, y: Math.random() }, `lemons`);
  }
  p.draw();
}
generate();