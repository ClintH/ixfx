import * as Geo from '../../../dist/geometry.js';
import { Grids, Points } from '../../../dist/geometry.js';
import { Draw } from './draw.js';
import * as Rx from '../../../dist/rx.js';

/** 
 * @param {Geo.GridVisual} grid
 * @param {Draw} drawer
 * @returns import('../../../dist/dom.js').Panel */
export const offsetPanel = (grid, drawer) => {
  /** @type Geo.GridCell */
  let startCell = { x: 0, y: 0 };

  /** @type Rx.ReactiveInitial<any>|undefined */
  let rxForm;
  let unsub = () => {}

  const go = (data) => {
    if (data === undefined && rxForm) data = rxForm.last();
    const vector = Geo.Points.fromString(data["xy"] ?? `0,0`);

    if (Geo.Points.isNaN(vector)) return;

    if (drawer) {
      drawer.clearVisited();
      drawer.clearCellText();
    }

    if (data["cardinals"]) {
      if (Points.isEmpty(vector)) return;
      const result = Grids.offsetCardinals(grid, startCell, Math.max(vector.x, vector.y), data["wrap-type"]);
      for (const [key, value] of Object.entries(result)) {
        if (drawer && value) {
          drawer.addVisited(value);
          drawer.appendCellText(key + ' ', value);
        }
      }
    } else {
      const result = Grids.offset(grid, startCell, vector, data["wrap-type"]);
      if (drawer && result) {
        drawer.addVisited(result);
      }
    }
  }

  const mount = (parent) => {
    parent.innerHTML = `
      <form>
        <label for="xy">x,y</label>
        <input id="xy" type="text" name="xy" value="2,2">
        
        <label for="wrap-type">Wrapping</label>
        <select id="wrap-type" name="wrap-type">
          <option>undefined</option>
          <option>stop</option>
          <option>unbounded</option>
          <option>wrap</option>
        </select>
        
        <label for="cardinals">Cardinals</label>
        <div>
          <input name="cardinals" type="checkbox" value="true" id="cardinals" checked>
          <p>When enabled, the larger of x or y option above is used to calculate an offset on all directions.</p>
        </div>
      <form>
      `
    rxForm = Rx.From.domForm(`form`);
    unsub = rxForm.onValue(value => {
      go(value);
    });
  }

  const notify = (name, args) => {
    switch (name) {
      case `click`:
        if (!args) args = { x: 0, y: 0 };
        startCell = args;
        if (drawer) {
          drawer.activated = [args];
        }
        go();
        break;
      default:
        console.warn(`visitPanel.notify: ${name}`);
    }
  }

  const ret = {
    id: `offset`,
    label: `Offset`,
    dismount: () => {
      unsub();
    },
    mount,
    notify
  }
  return ret;
}
