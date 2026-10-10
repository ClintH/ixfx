import * as Rx from '../../../dist/rx.js';
import * as Arrays from '../../../dist/arrays.js';


function withoutInitial() {
  const rx = Rx.From.domForm(`form`);
  rx.onValue(value => {
    console.log(`rx.onValue`, value);
  });
  setTimeout(() => {
    rx.setNamedValue(`colour`, { r: 0.5, g: 0.1, b: 1 })
  }, 1500);

  setTimeout(() => {
    rx.setNamedValue(`name`, `allo`);
    console.log(`Last value`, rx.last());
  }, 2500);
}

function withInitial() {
  const obj = Rx.From.object({
    whendate: `2024-10-03`,
    whentime: `12:34`,
    colour: `#ff0000`,
    email: `blah@asdf.com`,
    size: 12,
    radio: `am`,
    zork: 2,
    name: `some name`,
    checked: true,
    flavours: `Blueberry`,
  });
  const rx = Rx.From.domForm(`form`, {
    upstreamSource: obj
  });
  rx.onValue(value => {
    console.log(`rx.onValue`, value);
  });
  obj.onValue(value => {
    console.log(`obj.onValue`, value);

  });
  setTimeout(() => {
    obj.updateField(`email`, `zork@asf.com`);
  }, 1500);

  setTimeout(() => {
    rx.setNamedValue(`name`, `allo`);
    console.log(`Last value rx`, rx.last());
    console.log(`Last value obj`, obj.last());

  }, 2500);
}
withInitial();