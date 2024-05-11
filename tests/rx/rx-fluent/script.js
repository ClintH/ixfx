import * as Rx from '../../../dist/rx.js';

Rx.wrap(Rx.fromEvent(document.body, `pointerup`, { debugLifecycle:true, debugFiring:true}))
.transform(v => v.composedPath())
.batch({ elapsed: 200 })
.value(v => {
  console.log(v);
});