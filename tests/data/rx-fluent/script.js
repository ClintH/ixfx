import { Reactive} from '../../../dist/data.js';
import * as Flow from '../../../dist/flow.js';
import { Elapsed } from '../../../dist/flow.js';
import * as Generators from '../../../dist/generators.js';

Reactive.wrap(Reactive.event(document.body, `pointerup`, { debugLifecycle:true, debugFiring:true}))
.transform(v => v.composedPath())
.batch({ elapsed: 200 })
.value(v => {
  console.log(v);
});