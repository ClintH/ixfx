import * as Rx from '../../../packages/rx/bundle/index.js';

const el = document.querySelector(`#data`);

const rx = Rx.run(
  // Subscribe to 'pointermove'
  Rx.From.event(document, `pointermove`, { x: 0 }),

  // Ignore events from the non-primary pointer
  Rx.Ops.filter(evt => evt.isPrimary),

  // Just grab the x value
  Rx.Ops.field(`x`),

  // Drop all events if x is past half of the viewport
  Rx.Ops.drop(v => v <= window.innerWidth / 2)
);
rx.onValue(x => {
  el.innerHTML = `x value: ${JSON.stringify(x)}`;
});