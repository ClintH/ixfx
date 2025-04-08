import expect from 'expect';
/* eslint-disable */
import * as Pool from '../../data/Pool.js';

test(`sharing`, () => {
  let generated = 0;
  const p = new Pool.Pool<string>({
    capacity: 3,
    fullPolicy: `error`,
    capacityPerResource: 2,
    generate: () => `random-${ ++generated }`,
  });

  const used = [];
  used.push(p.use(`a`));
  used.push(p.use(`b`));
  used.push(p.use(`c`));
  used.push(p.use(`d`));
  used.push(p.use(`e`));
  used.push(p.use(`f`));
  const data = used.map(u => u.data);

  // Expect to see each resource being used twice due to capacityPerResource:2
  expect(data).toEqual([ `random-1`, `random-1`, `random-2`, `random-2`, `random-3`, `random-3` ]);

  // Expect an error if we ask for another resource
  expect(() => p.use(`g`)).toThrow();
});

test(`removing-resources`, () => {
  const p = new Pool.Pool<string>({
    capacity: 3,
    debug: false,
    fullPolicy: `evictOldestUser`,
    capacityPerResource: 1,
  });

  const rA = p.addResource(`a`);
  const rB = p.addResource(`b`);
  const rC = p.addResource(`c`);

  const uA = p.use(`a`);
  const uB = p.use(`b`);
  const uC = p.use(`c`);

  // Dispose resources A & B
  rA.dispose(`test`);
  rB.dispose(`test`);

  // Add two new resources
  const rD = p.addResource(`d`);
  const rE = p.addResource(`e`);

  expect(p.hasResource(`a`)).toBeFalsy();
  expect(p.hasResource(`b`)).toBeFalsy();
  expect(p.hasResource(`c`)).toBe(true);

  expect(uA.isDisposed).toBe(true);
  expect(uB.isDisposed).toBe(true);
  expect(uC.isDisposed).toBeFalsy();

  expect(p.hasUser(`a`)).toBe(false);
  expect(p.hasUser(`b`)).toBe(false);
  expect(p.hasUser(`c`)).toBe(true);

  p.maintain();

  expect(p.hasUser(`a`)).toBeFalsy();
  expect(p.hasUser(`b`)).toBeFalsy();
  expect(p.hasUser(`c`)).toBeTruthy();
});

test(`evictOldestUser`, () => {
  //eslint-disable-next-line functional/no-let
  let generated = 0;
  const p = new Pool.Pool<string>({
    capacity: 3,
    debug: false,
    fullPolicy: `evictOldestUser`,
    capacityPerResource: 1,
    generate: () => `random-${ ++generated }`,
  });

  const uA = p.use(`a`);
  const uB = p.use(`b`);
  const uC = p.use(`c`);
  const uD = p.use(`d`);
  const uE = p.use(`e`);

  expect(p.hasUser(`a`)).toBeFalsy();
  expect(p.hasUser(`b`)).toBeFalsy();
  expect(p.hasUser(`c`)).toBeTruthy();
  expect(p.hasUser(`d`)).toBeTruthy();
  expect(p.hasUser(`e`)).toBeTruthy();
});

test(`generate`, () => {
  //eslint-disable-next-line functional/no-let
  let generated = 0;
  const p = new Pool.Pool<string>({
    capacity: 5,
    debug: false,
    capacityPerResource: 1,
    generate: () => `random-${ ++generated }`,
  });

  const rA = p.addResource(`hello`);
  const rB = p.addResource(`there`);
  const rC = p.addResource(`fella`);

  const uA = p.useValue(`a`);
  const uB = p.useValue(`b`);
  const uC = p.useValue(`c`);
  const uD = p.useValue(`d`);
  const uE = p.useValue(`e`);

  expect(uC).toBe(`fella`);
  expect(uE).toBe(`random-2`);

  expect(() => {
    const uF = p.use(`f`);
  }).toThrow();
});

test(`basic`, () => {
  const p = new Pool.Pool<string>({
    capacity: 5,
    debug: false,
    capacityPerResource: 1,
  });

  const rA = p.addResource(`hello`);
  const rB = p.addResource(`there`);
  const rC = p.addResource(`fella`);

  const resA = p.use(`a`);
  const resB = p.use(`b`);
  const resC = p.use(`c`);

  expect(resA.data).toBe(`hello`);
  expect(resB.data).toBe(`there`);
  expect(resC.data).toBe(`fella`);

  const resAa = p.use(`a`);
  const resBb = p.use(`b`);
  const resCc = p.use(`c`);

  expect(rA.usersCount).toBe(1);
  expect(rB.usersCount).toBe(1);
  expect(rC.usersCount).toBe(1);

  expect(resAa.data).toBe(`hello`);
  expect(resBb.data).toBe(`there`);
  expect(resCc.data).toBe(`fella`);

  expect(() => {
    const resD = p.use(`d`);
  }).toThrow();
});

test(`release`, () => {
  const p = new Pool.Pool<string>({
    capacity: 5,
    debug: false,
    capacityPerResource: 1,
  });

  const rA = p.addResource(`hello`);
  const rB = p.addResource(`there`);
  const rC = p.addResource(`fella`);

  const resA = p.use(`a`);
  const resB = p.use(`b`);
  const resC = p.use(`c`);

  p.release(`a`);
  expect(p.hasUser(`a`)).toBeFalsy();
  expect(rA.usersCount).toBe(0);
});
