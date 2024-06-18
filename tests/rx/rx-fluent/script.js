import * as Rx from '../../../dist/rx.js';

Rx.wrap(Rx.From.event(document.body, `pointerup`, { debugLifecycle:true, debugFiring:true}))
.transform(v => v.composedPath())
.batch({ elapsed: 200 })
.onValue(v => {
  console.log(v);
});