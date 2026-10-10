import { inlineConsole } from '../../../dist/dom.js';
import { DataDisplay } from '../../../dist/dom.js';
import { DataDisplayComponent }from '../../../dist/webcomponents.js';


const c = new DataDisplayComponent();
document.body.append(c);

const settings = {
  display: new DataDisplay({ theme: `dark`})
}

let state = Object.freeze({
  dark: false,
  x: 0.1,
  flag: true,
  dupe:`top-level`,
  nested: {
    dupe:`lower-level-orig`,
    y: 0.5,
    otherFlag: false,
    gamma: 0,
    delta:0,
    zeta:0,
    message: `Hello`
  }
});

function use() {
  if (state.dark) {
    document.body.style.backgroundColor = `hsl(100,1%,2%)`;
  } else {
    document.body.style.backgroundColor = `hsl(100,70%,90%)`;
  }
}
function mutate() {
  state = {
    ...state,
    dark: state.dark,
    x: Math.random(),
    flag: Math.random() > 0.5,
    nested: {
      ...state.nested,
      dupe: `lower-level`,
      y: Math.random(),
      gamma: Math.random(),
      delta: Math.random(),
      zeta: Math.random(),
      otherFlag: Math.random() > 0.5,
      message: `Hello`
    }
  }
  settings.display.update(state);
  c.update(state);
}

document.addEventListener(`click`, () => {
  state = {
    ...state,
    dark:!state.dark
  }
  use();

})

setInterval(mutate, 1000);
mutate();
use();
