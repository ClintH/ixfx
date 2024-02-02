import { Pipes } from '../../../dist/data.js';
import * as Flow from '../../../dist/flow.js';
import { Elapsed } from '../../../dist/flow.js';
import * as Generators from '../../../dist/generators.js';

// Clicks
const clicks = Pipes.number(0);
Pipes.Dom.bindTextContent(`#lblClicks`, clicks);
btnClick.addEventListener(`click`, () => {
  clicks.value = clicks.value + 1;
})

// Pipe from event
const ptr = Pipes.event(document.body, `pointermove`);
ptr.on.message(m=> {
  console.log(m);
})

// Transform function
Pipes.Dom.bindHtmlContent(`#lblXy`, ptr, { transform: (ev) => {
    return `x: ${ev.x}, y: ${ev.y}`
}})
