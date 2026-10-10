import { Plot, CanvasSource, CanvasRegion } from '../../../dist/visual.js';
import { Easings } from '../../../dist/modulation.js';
import { ElementSizer } from '../../../dist/dom.js';


const region = {
  x: 0.2,
  y: 0.2,
  width: 0.6,
  height: 0.5
}
const p = Plot.insert({ parent: `#container`, region }, {
  visualPadding: 20,
  grid: {
    increments: 0.1
  },
  //range: { min: { x: -1, y: -1 }, max: { x: 1, y: 1 } },
  range: { min: { x: 0, y: 0 }, max: { x: 1, y: 1 } },
  connectStyle: `line`,
  valueStyle: `dot`,
  textStyle: {
    size: `8px`,
    colour: `gray`
  },
  axisStyle: {
    colour: `gray`
  },
  show: {
    grid: false,
    axes: true,
    axisValues: true,
    whiskers: true
  },
  whiskerLength: 10
});
p.setMeta(`alpha`, {
  colour: `purple`
});
p.onInvalidated = () => {
  p.positionElementAt({ x: 1, y: 1 }, `#point-a`, `middle`);
}

// ds.add({x:1,y:1, fillStyle:`red`}, `alpha`);
// ds.add({x:0.5,y:0.5, fillStyle:`green`}, `alpha`);
// ds.add({x:0,y:0}, `alpha`);

// ds.add({x:0.9,y:0.2, fillStyle:`red`}, `beta`);
// ds.add({x:0.1,y:0.3, fillStyle:`green`}, `beta`);
// ds.add({x:0.2,y:0.4}, `beta`);
//ds.add({x:-1,y:-1, fillStyle:`purple`});

const line = Easings.line(1);

let resolution = 0.06;
for (let x = 0; x < 1; x += resolution) {
  const pt = line(x);
  //const pt = {x,y:p};

  //console.log(pt);
  p.dataSet.add(pt);
}

p.draw();

const ptToStr = (pt) => `${pt.x.toFixed(2)},${pt.y.toFixed(2)}`;

window.addEventListener(`pointermove`, event => {
  const el = document.getElementById(`pointer`);
  if (!el) return;

  const source = p.canvasSource;
  const region = p.canvasRegion;

  const raw = { x: event.x, y: event.y };
  const sourceRel = source.toRelPoint(raw, `screen`, `independent`, false);
  const regionRel = region.toRelPoint(raw, `screen`, `independent`);
  const regionClamp = region.absToRegionPoint(raw, `screen`, false);
  const screenToValue = p.pointToValue(raw, `screen`, false);

  el.innerHTML = `
    Raw: ${ptToStr(raw)}<br>
    Source rel: ${ptToStr(sourceRel)}<br>
    Region rel: ${ptToStr(regionRel)}<br>
    Region clamped: ${ptToStr(regionClamp)}<br>
    Value: ${ptToStr(screenToValue)}<br>
  `;

});