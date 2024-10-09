import { Plot } from '../../../dist/visual.js';
import {Easings} from '../../../dist/modulation.js';

const ds = new Plot.DataSet();

const p = new Plot.CartesianCanvasPlot(`#plot`, ds, {
  margin: 20,
  grid: {
    increments: 0.1
  },
  //range:{min:{x:-1,y:-1},max:{x:1,y:1}},
  connectStyle:`line`,
  valueStyle:`dot`,
  textStyle: {
    size: `8px`,
    colour:`gray`
  },
  axisStyle: {
    colour:`gray`
  },
  show: {
    grid:false,
    axes:true,
    axisValues:true,
    whiskers:true
  },
  whiskerLength:10
});
p.setMeta(`alpha`, {
  colour:`purple`
});

// ds.add({x:1,y:1, fillStyle:`red`}, `alpha`);
// ds.add({x:0.5,y:0.5, fillStyle:`green`}, `alpha`);
// ds.add({x:0,y:0}, `alpha`);

// ds.add({x:0.9,y:0.2, fillStyle:`red`}, `beta`);
// ds.add({x:0.1,y:0.3, fillStyle:`green`}, `beta`);
// ds.add({x:0.2,y:0.4}, `beta`);
//ds.add({x:-1,y:-1, fillStyle:`purple`});

const line = Easings.line(1);

let resolution = 0.06;
for (let x=0;x<1;x+=resolution) {
  const p = line(x);
  //const pt = {x,y:p};

  //console.log(pt);
  ds.add(p);
}

p.draw();
