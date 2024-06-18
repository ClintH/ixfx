import test from 'ava';
import * as Rx from '../../../rx/index.js';

test(`annotate-op`, async t => {
  const r1 = Rx.run(
    Rx.From.array([ 1, 2, 3 ]),
    Rx.Ops.annotateWithOp(
      Rx.Ops.sum()
    )
  );
  const r1D = await Rx.toArray(r1);
  t.deepEqual(r1D, [
    { value: 1, annotation: 1 },
    { value: 2, annotation: 3 },
    { value: 3, annotation: 6 },

  ]);

  const r2 = Rx.run(
    Rx.From.array([ 4, 2, 3, 10, 5 ]),
    Rx.Ops.annotateWithOp(
      Rx.Ops.max({ skipIdentical: false })
    )
  );
  const r2D = await Rx.toArray(r2);
  t.deepEqual(r2D, [
    { value: 4, annotation: 4 },
    { value: 2, annotation: 4 },
    { value: 3, annotation: 4 },
    { value: 10, annotation: 10 },
    { value: 5, annotation: 10 }
  ]);

});

test(`annotate`, async t => {
  const createObjects = () => {
    return [ 1, 2, 3 ];
  }
  const input = Rx.From.array(createObjects());
  const annotated = Rx.annotate(input, n => {
    return { blah: 4 - n }
  });
  const data = await Rx.toArray(annotated);
  t.deepEqual(data, [
    { value: 1, annotation: { blah: 3 } },
    { value: 2, annotation: { blah: 2 } },
    { value: 3, annotation: { blah: 1 } }
  ]);

  // const c1 = Rx.chainer(
  //   Rx.Ops.average(),
  //   Rx.Ops.transform(v => {
  //     return 'hello';
  //   })
  // )
  // const r1 = Rx.run(
  //   Rx.From.array([ { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }, { value: 6 } ]),
  //   Rx.Ops.transform(v => {
  //     return v.value * 2;
  //   }),
  //   Rx.Ops.average(),
  //   Rx.Ops.transform(v => {
  //     return `x:${ v }`;
  //   }))

  // const r1 = Rx.run(
  //   Rx.From.array([ 1, 2, 3, 4, 5, 6 ]),
  //   Rx.Ops.annotate(f => {

  //   })
  // )
});