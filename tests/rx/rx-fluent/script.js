import * as Rx from '../../../dist/rx.js';
import * as Flow from '../../../dist/flow.js';
import { Elapsed } from '../../../dist/flow.js';
import * as Generators from '../../../dist/generators.js';

Rx.wrap(Rx.fromEvent(document.body, `pointerup`, { debugLifecycle:true, debugFiring:true}))
.transform(v => v.composedPath())
.batch({ elapsed: 200 })
.value(v => {
  console.log(v);
});