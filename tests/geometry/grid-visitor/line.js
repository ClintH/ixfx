import * as Geo from '../../../dist/geometry.js';
import { Grids } from '../../../dist/geometry.js';
import { Draw } from './draw.js';
import * as Rx from '../../../dist/rx.js';

/** 
 * @param {Geo.GridVisual} grid
 * @param {Draw} drawer
 * @returns import('../../../dist/dom.js').Panel */
export const linePanel = (grid, drawer) => {

  let rxForm;

  let aCell = { x: 0, y: 0 };
  let bCell = { x: 0, y: 0 };

  let lastSetA = false;
  let unsub = () => {}

  const updateFromUi = (data) => {
    const aXy = Geo.Points.fromString(data["a-xy"] ?? `0,0`);
    const bXy = Geo.Points.fromString(data["b-xy"] ?? `0,0`);

    if (Geo.Points.isNaN(aXy) || Geo.Points.isNaN(bXy)) return;
    aCell = aXy;
    bCell = bXy;
  }

  const go = () => {
    if (drawer) {
      drawer.clearVisited();
    }

    const line = Grids.getLine(aCell, bCell);
    for (const cell of line) {
      drawer.addVisited(cell);
    }
  }

  const mount = (parent) => {
    parent.innerHTML = `
      <form>
        <label for="a-xy">A (x,y)</label>
        <input id="a-xy" type="text" name="a-xy" value="2,6">
        
        <label for="b-xy">B (x,y)</label>
        <input id="a-xy" type="text" name="b-xy" value="7,2">
        
      <form>
      `
    //const formEl = /** @type HTMLFormElement */(parent.querySelector(`form`));
    // unsub = Rx.From.merged(
    //   Rx.From.eventTrigger(formEl, `change`)
    // ).onValue(value => {
    //   updateFromUi();
    // })

    //getFormData = () => new FormData(formEl);
    rxForm = Rx.From.domForm(`form`);
    unsub = rxForm.onValue(value => {
      updateFromUi(value);
      go();
    });
    updateFromUi(rxForm.last());
    go();
  }

  const notify = (name, args) => {
    switch (name) {
      case `click`:
        if (!args) args = { x: 0, y: 0 };
        if (lastSetA) {
          bCell = args;
          rxForm.setNamedValue(`b-xy`, `${bCell.x},${bCell.y}`);
        } else {
          aCell = args;
          rxForm.setNamedValue(`a-xy`, `${aCell.x},${aCell.y}`);
        }
        lastSetA = !lastSetA;
        go();
        break;
      default:
        console.warn(`visitPanel.notify: ${name}`);
    }
  }

  const ret = {
    id: `line`,
    label: `Line`,
    dismount: () => {
      unsub();
    },
    mount,
    notify
  }
  return ret;
}
