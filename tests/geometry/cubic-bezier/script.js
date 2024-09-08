import { Plot } from '../../../dist/visual.js';
import * as Rx from '../../../dist/rx.js';
import { Beziers, Points } from '../../../dist/geometry.js';
import * as Dom from '../../../dist/dom.js';
import {clamp} from '../../../dist/numbers.js';
const setPoint = (prefix, point) => {
  const inputX = /** HTMLInputElement */(document.getElementById(`${prefix}-x`));
  inputX.value = point.x;

  const inputY = /** HTMLInputElement */(document.getElementById(`${prefix}-y`));
  inputY.value = point.y;
}

const pointA = Rx.From.object({x:0,y:0});
pointA.onValue(value => {
  setPoint(`a`, value);
  use();
});

const pointB = Rx.From.object({x:1,y:1});
pointB.onValue(value => {
  setPoint(`b`, value);
  use();
});

const cubic1 = Rx.From.object({x:0.8,y:0.08});
cubic1.onValue(value => {
  setPoint(`cubic1`, value);
  use();
});

const cubic2 = Rx.From.object({x:0,y:1});
cubic2.onValue(value => {
  setPoint(`cubic2`, value);
  use();
});

const ds = new Plot.DataSet();
const p = new Plot.CartesianCanvasPlot(`#plot`, ds, {
  margin: 20,
  grid: {
    increments: 0.1
  },
  range:{min:{x:0,y:0},max:{x:1,y:1}},
  connectStyle:`line`,
  valueStyle:`dot`,
  textStyle: {
    size: `8px`,
    colour:`gray`
  },
  axisStyle: {
    colour:`hsl(0,0%,20%)`
  },
  show: {
    grid:false,
    axes:true,
    axisValues:true,
    whiskers:true
  },
  whiskerLength:10
});
p.setMeta(`default`, {
  colour:`hsl(50,100%,50%)`
})

function drag(suffix, rx) {
  Dom.DragDrop.draggable(`#point-${suffix}`, 
    {
      progress: (state) => {
        const v = p.screenToValue(state.viewport);
        let clamped = Points.clamp(v);
        rx.set(clamped);
        return {
          viewport: p.valueToScreen(clamped)
        }
      },
      abort: (reason, state) => {
        console.log(`abort: ${reason} - ${state}`);
      },
      success: (state) => {
        const v = Points.clamp(p.screenToValue(state.viewport));
        rx.set(v);
      }
    }, 
    {
      autoTranslate:true,
      quickDrag:true
    }
  );
  p.positionAt(rx.last(), `#point-${suffix}`,`middle`,`#container`);
  setPoint(suffix, rx.last());
  makeRxPair(suffix, rx);
}

drag(`a`, pointA);
drag(`b`, pointB);
drag(`cubic1`, cubic1);
drag(`cubic2`, cubic2);

function use() {
  ds.clear();
  const a = pointA.last();
  const b = pointB.last();
  const c1 = cubic1.last();
  const c2 = cubic2.last();
  
  //console.log(`a: ${a.x}x${a.y} \tb:${b.x}x${b.y} c1: ${c1.x}x${c1.y} c2: ${c2.x}x${c2.y}`);
  const bzr = Beziers.cubic(a,b,c1,c2);
  const i = Beziers.interpolator(bzr);
  let resolution = 0.03;
  for (let x=0;x<1;x+=resolution) {
    const v = i(x);
    ds.add(v);
  }
  ds.add(i(1));

  // Draw rays from anchors to control points
  p.overlayLines = [
    { a: a, b: c1, colour:`white`, width:4},
    { a: b, b: c2, colour:`white`, width:4}
  ]
  p.draw();
}
use();


function makeRxPair(prefix, rx) {
  const pair = Rx.combineLatestToObject({
    x:Rx.From.domNumberInputValue(`#${prefix}-x`),
    y:Rx.From.domNumberInputValue(`#${prefix}-y`, {emitInitialValue:true})
  });
  pair.onValue(value => {
    rx.set(value);
    use();
    
    p.positionAt(rx.last(), `#point-${prefix}`, `middle`,`#container`);
  })
}