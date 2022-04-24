import {Plot2} from '../../../dist/visual.js';
import {continuously} from '../../../dist/flow.js';
import {integer} from '../../../dist/random.js';

const canvasEl = document.getElementById(`plot`);

const p = new Plot2.Plot(canvasEl);


const c = continuously(() => {
  const accel = {
    x: integer(1000, -1000),
    y: integer(1000, -1000),
    z: integer(10000, -10000)
  }
  const gyro = {
    x: integer(1000, -1000),
    y: integer(1000, -1000),
    z: integer(10000, -10000)
  }


  p.plot({accel, gyro});
  // p.add(accel.x, `accel.x`);
  // p.add(accel.y, `accel.y`);
  // p.add(accel.z, `accel.z`);
  //p.add(Math.random(), `a`);
  //console.log(accel);
  p.update();
}, 100);
c.start();

document.getElementById(`btnToggle`).addEventListener(`click`, evt => {
  console.log(`is Done: ${c.isDone}`);
  if (c.isDone) c.start();
  else c.cancel();
});

c.start();
