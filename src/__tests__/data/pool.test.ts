/* eslint-disable */
import { expect, test } from '@jest/globals';
import * as Pool from '../../data/Pool.js';

test(`sharing`, () => {
  let generated = 0;
  const p = new Pool.Pool<string>( {
    capacity: 3,
    debug:true,
    fullPolicy:`error`,
    capacityPerResource:2,
    generate:() => `random-${++generated}`
  })


  p.use(`a`);
  p.use(`b`);
  p.use(`c`);
  p.use(`d`);
  p.use(`e`);
  p.use(`f`);

  const r = [...p.resources()];
  console.log(p.dumpToString());
});

test(`removing-resources`, () => {
  const p = new Pool.Pool<string>( {
    capacity: 3,
    debug:false,
    fullPolicy:`evictOldestUser`,
    capacityPerResource:1
  })

  const rA = p.addResource(`a`);
  const rB = p.addResource(`b`);
  const rC = p.addResource(`c`);

  const uA = p.use(`a`);
  const uB = p.use(`b`);
  const uC = p.use(`c`);

  rA.dispose(`test`);
  rB.dispose(`test`);

  const rD = p.addResource(`d`);
  const rE = p.addResource(`e`);

  expect(p.hasResource(`a`)).toBeFalsy();
  expect(p.hasResource(`b`)).toBeFalsy();
  expect(p.hasResource(`c`)).toBeTruthy();

  expect(uA.isDisposed).toBeTruthy();
  expect(uB.isDisposed).toBeTruthy();
  expect(uC.isDisposed).toBeFalsy();

  expect(p.hasUser(`a`)).toBeTruthy();
  expect(p.hasUser(`b`)).toBeTruthy();
  expect(p.hasUser(`c`)).toBeTruthy();
  
  p.maintain();

  expect(p.hasUser(`a`)).toBeFalsy();
  expect(p.hasUser(`b`)).toBeFalsy();
  expect(p.hasUser(`c`)).toBeTruthy();
  
});

test(`evictOldestUser`, () => {
  let generated = 0;
  const p = new Pool.Pool<string>( {
    capacity: 3,
    debug:false,
    fullPolicy:`evictOldestUser`,
    capacityPerResource:1,
    generate:() => `random-${++generated}`
  })

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
  let generated = 0;
  const p = new Pool.Pool<string>( {
     capacity: 5,
    debug:false,
    capacityPerResource:1,
    generate:() => `random-${++generated}`
  })

  const rA = p.addResource(`hello`);
  const rB = p.addResource(`there`);
  const rC = p.addResource(`fella`);

  const uA = p.useValue(`a`);
  const uB = p.useValue(`b`);
  const uC = p.useValue(`c`);
  const uD = p.useValue(`d`);
  const uE = p.useValue(`e`);

  expect(uC).toEqual(`fella`);
  expect(uE).toEqual(`random-2`);


  expect( () => {const uF = p.use(`f`) }).toThrow();
  
});

test(`basic`, () => {
  const p = new Pool.Pool<string>( {
     capacity: 5,
    debug:false,
    capacityPerResource:1
  })

  const rA = p.addResource(`hello`);
  const rB = p.addResource(`there`);
  const rC = p.addResource(`fella`);

  const resA = p.use(`a`);
  const resB = p.use(`b`);
  const resC = p.use(`c`);

  expect(resA.data).toEqual(`hello`);
  expect(resB.data).toEqual(`there`);
  expect(resC.data).toEqual(`fella`);

  const resAa = p.use(`a`);
  const resBb = p.use(`b`);
  const resCc = p.use(`c`);

  expect(rA.usersCount).toEqual(1);
  expect(rB.usersCount).toEqual(1);
  expect(rC.usersCount).toEqual(1);

  expect(resAa.data).toEqual(`hello`);
  expect(resBb.data).toEqual(`there`);
  expect(resCc.data).toEqual(`fella`);

  expect( () => { const resD = p.use(`d`)}).toThrow();
});

test(`release`, () => {
  const p = new Pool.Pool<string>({
     capacity: 5,
    debug:false,
    capacityPerResource:1
  })

  const rA = p.addResource(`hello`);
  const rB = p.addResource(`there`);
  const rC = p.addResource(`fella`);

  const resA = p.use(`a`);
  const resB = p.use(`b`);
  const resC = p.use(`c`);

  p.release(`a`);
  expect(p.hasUser(`a`)).toBeFalsy();
  expect(rA.usersCount).toEqual(0);
});
