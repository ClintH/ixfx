import {Espruino} from '../../../dist/io.js';

let device;

document.getElementById(`btnConnect`).addEventListener(`click`, async () => {
  const d = await Espruino.serial('pico');
  d.addEventListener('change', (ev) => {
    console.log(`${ev.priorState} -> ${ev.newState}`);
  });
  d.addEventListener(`data`, (ev) => {
    console.log(`> ${ev.data}`);
  });

  device = d;
  d.eval(`hap.trigger(1)`);
  console.log("Done.");
});

document.getElementById(`btnTrigger`).addEventListener(`click`, () => {
  console.log(`Trigger`);
  if (device === undefined) return;
  device.write(`\x10hap.trigger(3);\n`);
});