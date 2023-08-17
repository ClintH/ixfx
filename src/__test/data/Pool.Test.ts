// /* eslint-disable */
// import test from 'ava';
// import * as Pool from '../../data/Pool.js';

// test(`sharing`, (t) => {
//   //eslint-disable-next-line functional/no-let
//   let generated = 0;
//   const p = new Pool.Pool<string>({
//     capacity: 3,
//     debug: true,
//     fullPolicy: `error`,
//     capacityPerResource: 2,
//     generate: () => `random-${++generated}`,
//   });

//   p.use(`a`);
//   p.use(`b`);
//   p.use(`c`);
//   p.use(`d`);
//   p.use(`e`);
//   p.use(`f`);

//   const r = [...p.resources()];
//   console.log(p.dumpToString());
// });

// test(`removing-resources`, (t) => {
//   const p = new Pool.Pool<string>({
//     capacity: 3,
//     debug: false,
//     fullPolicy: `evictOldestUser`,
//     capacityPerResource: 1,
//   });

//   const rA = p.addResource(`a`);
//   const rB = p.addResource(`b`);
//   const rC = p.addResource(`c`);

//   const uA = p.use(`a`);
//   const uB = p.use(`b`);
//   const uC = p.use(`c`);

//   rA.dispose(`test`);
//   rB.dispose(`test`);

//   const rD = p.addResource(`d`);
//   const rE = p.addResource(`e`);

//   t.falsy(p.hasResource(`a`));
//   t.falsy(p.hasResource(`b`));
//   t.true(p.hasResource(`c`));

//   t.true(uA.isDisposed);
//   t.true(uB.isDisposed);
//   t.falsy(uC.isDisposed);

//   t.truthy(p.hasUser(`a`));
//   t.truthy(p.hasUser(`b`));
//   t.truthy(p.hasUser(`c`));

//   p.maintain();

//   t.falsy(p.hasUser(`a`));
//   t.falsy(p.hasUser(`b`));
//   t.truthy(p.hasUser(`c`));
// });

// test(`evictOldestUser`, (t) => {
//   //eslint-disable-next-line functional/no-let
//   let generated = 0;
//   const p = new Pool.Pool<string>({
//     capacity: 3,
//     debug: false,
//     fullPolicy: `evictOldestUser`,
//     capacityPerResource: 1,
//     generate: () => `random-${++generated}`,
//   });

//   const uA = p.use(`a`);
//   const uB = p.use(`b`);
//   const uC = p.use(`c`);
//   const uD = p.use(`d`);
//   const uE = p.use(`e`);

//   t.falsy(p.hasUser(`a`));
//   t.falsy(p.hasUser(`b`));
//   t.truthy(p.hasUser(`c`));
//   t.truthy(p.hasUser(`d`));
//   t.truthy(p.hasUser(`e`));
// });

// test(`generate`, (t) => {
//   //eslint-disable-next-line functional/no-let
//   let generated = 0;
//   const p = new Pool.Pool<string>({
//     capacity: 5,
//     debug: false,
//     capacityPerResource: 1,
//     generate: () => `random-${++generated}`,
//   });

//   const rA = p.addResource(`hello`);
//   const rB = p.addResource(`there`);
//   const rC = p.addResource(`fella`);

//   const uA = p.useValue(`a`);
//   const uB = p.useValue(`b`);
//   const uC = p.useValue(`c`);
//   const uD = p.useValue(`d`);
//   const uE = p.useValue(`e`);

//   t.is(uC, `fella`);
//   t.is(uE, `random-2`);

//   t.throws(() => {
//     const uF = p.use(`f`);
//   });
// });

// test(`basic`, (t) => {
//   const p = new Pool.Pool<string>({
//     capacity: 5,
//     debug: false,
//     capacityPerResource: 1,
//   });

//   const rA = p.addResource(`hello`);
//   const rB = p.addResource(`there`);
//   const rC = p.addResource(`fella`);

//   const resA = p.use(`a`);
//   const resB = p.use(`b`);
//   const resC = p.use(`c`);

//   t.is(resA.data, `hello`);
//   t.is(resB.data, `there`);
//   t.is(resC.data, `fella`);

//   const resAa = p.use(`a`);
//   const resBb = p.use(`b`);
//   const resCc = p.use(`c`);

//   t.is(rA.usersCount, 1);
//   t.is(rB.usersCount, 1);
//   t.is(rC.usersCount, 1);

//   t.is(resAa.data, `hello`);
//   t.is(resBb.data, `there`);
//   t.is(resCc.data, `fella`);

//   t.throws(() => {
//     const resD = p.use(`d`);
//   });
// });

// test(`release`, (t) => {
//   const p = new Pool.Pool<string>({
//     capacity: 5,
//     debug: false,
//     capacityPerResource: 1,
//   });

//   const rA = p.addResource(`hello`);
//   const rB = p.addResource(`there`);
//   const rC = p.addResource(`fella`);

//   const resA = p.use(`a`);
//   const resB = p.use(`b`);
//   const resC = p.use(`c`);

//   p.release(`a`);
//   t.falsy(p.hasUser(`a`));
//   t.is(rA.usersCount, 0);
// });
