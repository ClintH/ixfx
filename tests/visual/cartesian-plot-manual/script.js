import { Plot, CanvasSource, CanvasRegion } from '../../../dist/visual.js';
import { Easings } from '../../../dist/modulation.js';
import { ElementSizer } from '../../../dist/dom.js';

const ds = new Plot.DataSet();
const source = new CanvasSource(`canvas`, `min`);
const region = source.createRelative({ x: 0, y: 0, width: 1, height: 1 }, `independent`);

const p = new Plot.CartesianCanvasPlot(region, ds, {
  visualPadding: 30,
  grid: {
    increments: 0.1
  },
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
    grid: true,
    axes: true,
    axisValues: true,
    whiskers: true
  },
  whiskerLength: 10
});
p.setMeta(`alpha`, {
  colour: `purple`
});

// ds.add({x:1,y:1, fillStyle:`red`}, `alpha`);
// ds.add({x:0.5,y:0.5, fillStyle:`green`}, `alpha`);
// ds.add({x:0,y:0}, `alpha`);

// ds.add({x:0.9,y:0.2, fillStyle:`red`}, `beta`);
// ds.add({x:0.1,y:0.3, fillStyle:`green`}, `beta`);
// ds.add({x:0.2,y:0.4}, `beta`);
//ds.add({x:-1,y:-1, fillStyle:`purple`});

const line = Easings.line(0.5);

let resolution = 0.06;
for (let x = 0; x <= 1; x += resolution) {
  const p = line(x);

  // console.log(p.y);
  ds.add(p);
}

//p.draw();

const es = ElementSizer.canvasViewport(`canvas`, {
  onSetSize: (size, el) => {
    source.setLogicalSize(size);
    p.invalidateRange();
    p.draw();
    p.positionElementAt({ x: 1, y: 0.5 }, `#point-a`, `middle`);
  }
});

const ptToStr = (pt) => `${pt.x.toFixed(2)},${pt.y.toFixed(2)}`;

window.addEventListener(`pointermove`, event => {
  const el = document.getElementById(`pointer`);
  if (!el) return;

  const raw = { x: event.x, y: event.y };
  const sourceRel = source.toRelPoint(raw, `screen`, `independent`);
  const regionRel = region.toRelPoint(raw, `screen`, `independent`);
  const regionClamp = region.absToRegionPoint(raw, `screen`, true);
  const screenToValue = p.pointToValue(raw, `screen`, true);

  el.innerHTML = `
    Raw: ${ptToStr(raw)}<br>
    Source rel: ${ptToStr(sourceRel)}<br>
    Region rel: ${ptToStr(regionRel)}<br>
    Region clamped: ${ptToStr(regionClamp)}<br>
    Value: ${ptToStr(screenToValue)}<br>
  `;

});
