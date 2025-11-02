import { kalman1dFilter } from "../../../packages/numbers/src/kalman";
//import { PlotElement } from 'https://unpkg.com/@ixfx/components@0.1.3/bundle';
import { PlotElement} from 'https://esm.run/@ixfx/components@0.2.3';
const ctx = document.getElementById('plot');


const f = kalman1dFilter({r:0.01,q:1});
const length = 100;
const data = [];
for (let i=0;i<length;i++) {
  const r = Math.random();
  const rf = f(r);
  data.push({raw:r,filtered:rf});
}

const plot = PlotElement.fromQuery(`#plot`);
for (const d of data) {
  plot.appendObjectBySeries(d, false);
}
plot.draw();