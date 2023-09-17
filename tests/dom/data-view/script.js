import { inlineConsole,DataDisplay } from '../../../dist/dom.js';

const settings = {
  display: new DataDisplay()
}

let state = Object.freeze({
  x: 0.1,
  flag: true,
  nested: {
    y: 0.5,
    otherFlag: false,
    gamma: 0,
    delta:0,
    zeta:0,
    message: `Hello`
  }
});

function mutate() {
  state = {
    x: Math.random(),
    flag: Math.random() > 0.5,
    nested: {
      y: Math.random(),
      gamma: Math.random(),
      delta: Math.random(),
      zeta: Math.random(),
      otherFlag: Math.random() > 0.5,
      message: `Hello`
    }
  }
  settings.display.update(state);
}

setInterval(mutate, 1000);
mutate();