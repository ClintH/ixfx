import {Plot2} from '../../../dist/visual.js';
import {continuously} from '../../../dist/flow.js';
import {integer} from '../../../dist/random.js';

const canvasEl = document.getElementById(`plot`);

const p = new Plot2.Plot(canvasEl);


const c = continuously(() => {
  // const accel = {
  //   x: integer(1000, -1000),
  //   y: integer(1000, -1000),
  //   z: integer(10000, -10000)
  // }
  // const gyro = {
  //   x: integer(1000, -1000),
  //   y: integer(1000, -1000),
  //   z: integer(10000, -10000)
  // }

  const d = {
    acc: {x: 6995, y: -3834, z: -1644},
    gyro: {x: -35, y: 102, z: 213 * Math.random()}
  };

  const d2 = {
    acc: {x: -3000},
    gyro: {z: 213 * Math.random()}
  };

  p.plot(d);

  //p.plot({accel, gyro});
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

document.getElementById(`btnToggleYAxis`).addEventListener(`click`, evt => {
  p.axisY.visible = !p.axisY.visible;
});

c.start();
