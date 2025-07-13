import expect from 'expect';
import * as Rx from '../../../rx/index.js';

test(`annotate-op`, async () => {
  const r1 = Rx.wrap([ 1, 2, 3 ]).annotateWithOp(Rx.Ops.sum());
  const r1D = await Rx.toArray(r1);
  expect(r1D).toEqual([
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
  expect(r2D).toEqual([
    { value: 4, annotation: 4 },
    { value: 2, annotation: 4 },
    { value: 3, annotation: 4 },
    { value: 10, annotation: 10 },
    { value: 5, annotation: 10 }
  ]);

});

test(`annotate`, async () => {
  const createObjects = () => {
    return [ 1, 2, 3 ];
  }
  const input = Rx.From.array(createObjects());
  const annotated = Rx.annotate(input, n => {
    return { blah: 4 - n }
  });
  const data = await Rx.toArray(annotated);
  expect(data).toEqual([
    { value: 1, annotation: { blah: 3 } },
    { value: 2, annotation: { blah: 2 } },
    { value: 3, annotation: { blah: 1 } }
  ]);

});