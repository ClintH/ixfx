import {Plot2} from '../../../dist/visual.js';
import {continuously} from '../../../dist/flow.js';
import * as Random from '../../../dist/random.js';
import * as Components from '../../../dist/components.js';
//Components.PlotElement;

const p = /** @type Components.PlotElement*/(document.getElementById(`plot`));
p.autoRedraw = false;
// const p = new Plot2.Plot(`#plot`, {
//   scaling:`normalise`,
//   autoSize:true
// });

const c = continuously(() => {
  const d = {
    acc: {
      x: Random.float({min:-6995,max:6995}), 
      y: Random.float({min:-3834,max:3834}), 
      z: Random.float({min:-1644,max:1644})
    },
    gyro: {
      x: Random.float({min:-35,max:35}), 
      y: Random.float({min:-102,max:102}), 
      z: Random.float({min:-213,max:213})}
  };

  const d2 = {
    acc: {x: -3000},
    gyro: {z: 213 * Math.random()}
  };

  //p.plot(d.acc.x, `x`);
  //p.plot(d.acc.y, `y`);
  p.plotObject(d);

  p.draw();
  //p.dra();
}, 100);
c.start();

document.getElementById(`btnToggle`)?.addEventListener(`click`, evt => {
  if (c.runState === `idle`) c.start();
  else c.cancel();
});

// document.getElementById(`btnToggleYAxis`)?.addEventListener(`click`, evt => {
//   p.axisY.visible = !p.axisY.visible;
// });

c.start();
