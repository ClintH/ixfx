import { Plot } from '../../../dist/visual.js';
import * as Data from '../../../dist/data.js';
import {Points} from '../../../dist/geometry.js';

import {Easings, mix, sineShape} from '../../../dist/modulation.js';



const ds = new Plot.DataSet();
const p = new Plot.CartesianCanvasPlot(`#plot`, ds, {
  margin: 20,
  grid: {
    increments: 0.1
  },
  range:{min:{x:0,y:0},max:{x:1,y:1}},
  connectStyle:`line`,
  valueStyle:``,
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

const sine = sineShape(1000);

function run(bend, warp) {
  ds.clear();
  
  const line = Easings.line(bend, warp);

  const dp = Data.Process.flow(
    line, 
    (v) => Points.clamp(v)
  );

  let resolution = 0.01;
  for (let x=0;x<1;x+=resolution) {
    ds.add(dp(x));
  }
  ds.add(dp(1));
  
  p.draw();
  
}
run(1, 0);

bend.addEventListener(`input`, () => {
  run(bend.valueAsNumber, warp.valueAsNumber);
});

warp.addEventListener(`input`, () => {
  run(bend.valueAsNumber, warp.valueAsNumber);
});