import test from 'ava';
import * as Rx from '../../../rx/index.js';

test(`max`, async t => {
  const r1 = Rx.run(Rx.From.array([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]),
    Rx.Ops.max()
  );
  const r1d = await Rx.toArray(r1);
  t.deepEqual(r1d, [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]);

  const r2 = Rx.run(Rx.From.array([ 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 ]),
    Rx.Ops.max()
  );
  const r2d = await Rx.toArray(r2);
  t.deepEqual(r2d, [ 10 ]);

  const r3 = Rx.run(Rx.From.array([ 1, 'hello', false, 9 ]),
    Rx.Ops.max()
  );
  const r3d = await Rx.toArray(r3);
  t.deepEqual(r3d, [ 1, 9 ]);
});

test(`min`, async t => {
  const r1 = Rx.run(Rx.From.array([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]),
    Rx.Ops.min()
  );
  const r1d = await Rx.toArray(r1);
  t.deepEqual(r1d, [ 1 ]);

  const r2 = Rx.run(Rx.From.array([ 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 ]),
    Rx.Ops.min()
  );
  const r2d = await Rx.toArray(r2);
  t.deepEqual(r2d, [ 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 ]);

  const r3 = Rx.run(Rx.From.array([ 9, 'hello', false, 1 ]),
    Rx.Ops.min()
  );
  const r3d = await Rx.toArray(r3);
  t.deepEqual(r3d, [ 9, 1 ]);

  // With annotation
  const r4 = Rx.run(Rx.From.array([ 9, 'hello', false, 1 ]),
    Rx.Ops.min({ annotate: true })
  );
  const r4d = await Rx.toArray(r4);
  t.deepEqual(r4d, [ { value: 9, min: 9 }, { value: 1, min: 1 } ]);

  // skipIdentical: false
  const r6 = Rx.run(Rx.From.array([ 1, 1, 2, 2, 3, 2, 2, 3 ]),
    Rx.Ops.min({ skipIdentical: false })
  );
  const r6d = await Rx.toArray(r6);
  t.deepEqual(r6d, [ 1, 1, 1, 1, 1, 1, 1, 1 ]);

});

test(`sum`, async t => {
  const r1 = Rx.run(Rx.From.array([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]),
    Rx.Ops.sum()
  );
  const r1d = await Rx.toArray(r1);

  t.deepEqual(r1d, [ 1, 3, 6, 10, 15, 21, 28, 36, 45, 55 ]);

  const r3 = Rx.run(Rx.From.array([ 9, 'hello', false, 1 ]),
    Rx.Ops.sum()
  );
  const r3d = await Rx.toArray(r3);
  t.deepEqual(r3d, [ 9, 10 ]);
});

test(`average`, async t => {
  const r1 = Rx.run(Rx.From.array([ 1, 2, 3 ]),
    Rx.Ops.average()
  );
  const r1d = await Rx.toArray(r1);
  t.deepEqual(r1d, [ 1, 1.5, 2 ]);

  const r3 = Rx.run(Rx.From.array([ 9, 'hello', false, 1 ]),
    Rx.Ops.average()
  );
  const r3d = await Rx.toArray(r3);
  t.deepEqual(r3d, [ 9, 5 ]);
});

test(`tally`, async t => {
  const r1 = Rx.run(Rx.From.array([ 1, 2, 3 ]),
    Rx.Ops.tally()
  );
  const r1d = await Rx.toArray(r1);

  t.deepEqual(r1d, [ 1, 2, 3 ]);

  const r3 = Rx.run(Rx.From.array([ 9, 'hello', false, 1 ]),
    Rx.Ops.tally()
  );
  const r3d = await Rx.toArray(r3);
  t.deepEqual(r3d, [ 1, 2, 3, 4 ]);
});

test(`rank`, async t => {
  const r1 = Rx.run(Rx.From.array([
    { name: `a`, size: 1 },
    { name: `b`, size: 4 },
    { name: `c`, size: 0 }
  ]),
    Rx.Ops.rank((a, b) => {
      if (a.size > b.size) return `a`;
      if (b.size > a.size) return `b`;
      return `eq`
    })
  );
  const r1d = await Rx.toArray(r1);
  t.deepEqual(r1d, [
    { name: `a`, size: 1 },
    { name: `b`, size: 4 }
  ]);
});