import { test, expect, describe } from 'vitest';
import { NumberMap } from '../../src/map/number-map.js';
import { MapOfSimple, ofSimple } from '../../src/map/map-of-simple.js';
import { MapOfSimpleBase } from '../../src/map/map-of-simple-base.js';
import { MapOfSimpleMutable } from '../../src/map/map-of-simple-mutable.js';
import { firstEntry, longestEntry, firstEntryByValue, cloneShallow, equals } from '../../src/map/map-multi-fns.js';

describe(`NumberMap`, () => {
  test(`default value is 0`, () => {
    const map = new NumberMap<string>();
    expect(map.get('missing')).toBe(0);
    expect(map.get('alsoMissing')).toBe(0);
  });

  test(`custom default value`, () => {
    const map = new NumberMap<string>(100);
    expect(map.get('missing')).toBe(100);
    expect(map.get('another')).toBe(100);
  });

  test(`set and get values`, () => {
    const map = new NumberMap<string>();
    map.set('a', 10);
    map.set('b', 20);
    expect(map.get('a')).toBe(10);
    expect(map.get('b')).toBe(20);
  });

  test(`add method`, () => {
    const map = new NumberMap<string>();
    expect(map.add('a')).toBe(1);
    expect(map.add('a')).toBe(2);
    expect(map.add('a', 5)).toBe(7);
    expect(map.add('b', 10)).toBe(10);
  });

  test(`multiply method`, () => {
    const map = new NumberMap<string>();
    map.set('a', 5);
    expect(map.multiply('a', 2)).toBe(10);
    expect(map.multiply('b', 3)).toBe(0);
  });

  test(`subtract method`, () => {
    const map = new NumberMap<string>();
    map.set('a', 10);
    expect(map.subtract('a')).toBe(9);
    expect(map.subtract('a', 3)).toBe(6);
    expect(map.subtract('b', 5)).toBe(-5);
  });

  test(`reset method`, () => {
    const map = new NumberMap<string>();
    map.set('a', 100);
    expect(map.reset('a')).toBe(0);
    expect(map.get('a')).toBe(0);
  });

  test(`reset with custom default`, () => {
    const map = new NumberMap<string>(50);
    map.set('a', 100);
    expect(map.reset('a')).toBe(50);
    expect(map.get('a')).toBe(50);
  });

  test(`extends Map`, () => {
    const map = new NumberMap<string>();
    map.set('a', 10);
    expect(map instanceof Map).toBe(true);
  });

  test(`has method`, () => {
    const map = new NumberMap<string>();
    map.set('a', 10);
    expect(map.has('a')).toBe(true);
    expect(map.has('b')).toBe(false);
  });

  test(`delete method from Map`, () => {
    const map = new NumberMap<string>();
    map.set('a', 10);
    map.delete('a');
    expect(map.has('a')).toBe(false);
    expect(map.get('a')).toBe(0);
  });
});

describe(`MapOfSimpleBase`, () => {
  test(`constructor with empty array`, () => {
    const base = new MapOfSimpleBase<number>();
    expect(base.isEmpty).toBe(true);
    expect(base.lengthKeys).toBe(0);
  });

  test(`constructor with initial data`, () => {
    const base = new MapOfSimpleBase<number>(undefined, undefined, [
      ['key1', [1, 2, 3]],
      ['key2', [4, 5]]
    ]);
    expect(base.count('key1')).toBe(3);
    expect(base.count('key2')).toBe(2);
  });

  test(`has method`, () => {
    const base = new MapOfSimpleBase<number>(undefined, undefined, [
      ['exists', [1]]
    ]);
    expect(base.has('exists')).toBe(true);
    expect(base.has('notExists')).toBe(false);
  });

  test(`hasKeyValue method`, () => {
    const base = new MapOfSimpleBase<number>(undefined, undefined, [
      ['key', [1, 2, 3]]
    ]);
    expect(base.hasKeyValue('key', 2)).toBe(true);
    expect(base.hasKeyValue('key', 99)).toBe(false);
    expect(base.hasKeyValue('notKey', 1)).toBe(false);
  });

  test(`count method`, () => {
    const base = new MapOfSimpleBase<number>(undefined, undefined, [
      ['key', [1, 2, 3]]
    ]);
    expect(base.count('key')).toBe(3);
    expect(base.count('missing')).toBe(0);
  });

  test(`keys iterator`, () => {
    const base = new MapOfSimpleBase<number>(undefined, undefined, [
      ['a', [1]],
      ['b', [2]],
      ['c', [3]]
    ]);
    const keys = [...base.keys()];
    expect(keys).toContain('a');
    expect(keys).toContain('b');
    expect(keys).toContain('c');
    expect(keys.length).toBe(3);
  });

  test(`valuesFlat iterator`, () => {
    const base = new MapOfSimpleBase<number>(undefined, undefined, [
      ['a', [1, 2]],
      ['b', [3, 4]]
    ]);
    const values = [...base.valuesFlat()];
    expect(values).toEqual([1, 2, 3, 4]);
  });

  test(`entriesFlat iterator`, () => {
    const base = new MapOfSimpleBase<number>(undefined, undefined, [
      ['a', [1, 2]],
      ['b', [3]]
    ]);
    const entries = [...base.entriesFlat()];
    expect(entries).toEqual([
      ['a', 1],
      ['a', 2],
      ['b', 3]
    ]);
  });

  test(`entries iterator`, () => {
    const base = new MapOfSimpleBase<number>(undefined, undefined, [
      ['a', [1, 2]],
      ['b', [3]]
    ]);
    const entries = [...base.entries()];
    expect(entries.length).toBe(2);
    expect(entries[0]).toEqual(['a', [1, 2]]);
    expect(entries[1]).toEqual(['b', [3]]);
  });

  test(`valuesFor iterator`, () => {
    const base = new MapOfSimpleBase<number>(undefined, undefined, [
      ['key', [1, 2, 3]]
    ]);
    const values = [...base.valuesFor('key')];
    expect(values).toEqual([1, 2, 3]);
  });

  test(`valuesFor for missing key`, () => {
    const base = new MapOfSimpleBase<number>();
    const values = [...base.valuesFor('missing')];
    expect(values).toEqual([]);
  });

  test(`keysAndCounts iterator`, () => {
    const base = new MapOfSimpleBase<number>(undefined, undefined, [
      ['a', [1, 2]],
      ['b', [3]]
    ]);
    const counts = [...base.keysAndCounts()];
    expect(counts).toContainEqual(['a', 2]);
    expect(counts).toContainEqual(['b', 1]);
  });

  test(`getRawArray method`, () => {
    const base = new MapOfSimpleBase<number>(undefined, undefined, [
      ['key', [1, 2]]
    ]);
    const arr = base.getRawArray('key');
    expect(arr).toEqual([1, 2]);
  });

  test(`getRawArray for missing key`, () => {
    const base = new MapOfSimpleBase<number>();
    const arr = base.getRawArray('missing');
    expect(arr).toBeUndefined();
  });

  test(`debugString method`, () => {
    const base = new MapOfSimpleBase<number>(undefined, undefined, [
      ['test', [1, 2]]
    ]);
    const debug = base.debugString();
    expect(debug).toContain('test');
    expect(debug).toContain('2');
  });

  test(`firstKeyByValue method`, () => {
    const base = new MapOfSimpleBase<number>(undefined, undefined, [
      ['a', [1, 2]],
      ['b', [3, 4]]
    ]);
    expect(base.firstKeyByValue(3)).toBe('b');
    expect(base.firstKeyByValue(1)).toBe('a');
    expect(base.firstKeyByValue(99)).toBeUndefined();
  });
});

describe(`MapOfSimple (immutable)`, () => {
  test(`addValue returns new instance`, () => {
    const original = ofSimple<number>();
    const updated = original.addValue(1);
    
    expect(original.isEmpty).toBe(true);
    expect(updated.isEmpty).toBe(false);
    expect(updated.count('1')).toBe(1);
  });

  test(`addKeyedValues`, () => {
    const m = ofSimple<number>().addKeyedValues('test', 1, 2, 3);
    expect(m.count('test')).toBe(3);
  });

  test(`addBatch`, () => {
    const m = (ofSimple<number>() as MapOfSimple<number>).addBatch([
      ['a', [1, 2]],
      ['b', [3, 4]]
    ]);
    expect(m.count('a')).toBe(2);
    expect(m.count('b')).toBe(2);
  });

  test(`delete removes key`, () => {
    const m = ofSimple<number>()
      .addKeyedValues('keep', 1)
      .addKeyedValues('remove', 2)
      .delete('remove');
    
    expect(m.has('keep')).toBe(true);
    expect(m.has('remove')).toBe(false);
  });

  test(`deleteKeyValue removes specific value`, () => {
    const m = ofSimple<number>()
      .addKeyedValues('key', 1, 2, 3)
      .deleteKeyValue('key', 2);
    
    expect(m.count('key')).toBe(2);
    expect([...m.valuesFor('key')]).toContain(1);
    expect([...m.valuesFor('key')]).toContain(3);
  });

  test(`deleteByValue removes value from all keys`, () => {
    const m = ofSimple<number>()
      .addKeyedValues('a', 1, 2)
      .addKeyedValues('b', 2, 3)
      .deleteByValue(2);
    
    expect(m.count('a')).toBe(1);
    expect(m.count('b')).toBe(1);
  });

  test(`clear returns empty map`, () => {
    const m = ofSimple<number>()
      .addKeyedValues('key', 1, 2, 3)
      .clear();
    
    expect(m.isEmpty).toBe(true);
  });

  test(`immutability is preserved`, () => {
    const m1 = ofSimple<number>().addKeyedValues('key', 1);
    const m2 = m1.addKeyedValues('key', 2);
    
    expect(m1.count('key')).toBe(1);
    expect(m2.count('key')).toBe(2);
  });

  test(`custom groupBy function`, () => {
    const m = ofSimple<{ id: number }>(
      v => `group-${v.id % 2}`
    ).addValue({ id: 1 }, { id: 2 }, { id: 3 });
    
    expect(m.count('group-0')).toBe(1);
    expect(m.count('group-1')).toBe(2);
  });
});

describe(`MapOfSimpleMutable`, () => {
  test(`addValue mutates in place`, () => {
    const m = new MapOfSimpleMutable<number>();
    m.addValue(1, 2, 3);
    
    expect(m.count('1')).toBe(1);
    expect(m.count('2')).toBe(1);
    expect(m.count('3')).toBe(1);
    expect(m.lengthKeys).toBe(3);
  });

  test(`deleteKeyValue mutates in place`, () => {
    const m = new MapOfSimpleMutable<number>();
    m.addKeyedValues('key', 1, 2, 3);
    m.deleteKeyValue('key', 2);
    
    expect(m.count('key')).toBe(2);
  });

  test(`delete mutates in place`, () => {
    const m = new MapOfSimpleMutable<number>();
    m.addKeyedValues('a', 1);
    m.addKeyedValues('b', 2);
    m.delete('a');
    
    expect(m.has('a')).toBe(false);
    expect(m.has('b')).toBe(true);
  });

  test(`clear mutates in place`, () => {
    const m = new MapOfSimpleMutable<number>();
    m.addKeyedValues('key', 1, 2, 3);
    m.clear();
    
    expect(m.isEmpty).toBe(true);
  });
});

describe(`map-multi-fns`, () => {
  describe(`firstEntry`, () => {
    test(`finds matching entry`, () => {
      const map = new MapOfSimpleBase<number>(undefined, undefined, [
        ['a', [1, 2]],
        ['b', [3, 4]]
      ]);
      
      const entry = firstEntry(map, (v) => v === 3);
      expect(entry).toBeDefined();
      expect(entry![0]).toBe('b');
    });

    test(`returns undefined when not found`, () => {
      const map = new MapOfSimpleBase<number>(undefined, undefined, [
        ['a', [1, 2]]
      ]);
      
      const entry = firstEntry(map, (v) => v === 99);
      expect(entry).toBeUndefined();
    });
  });

  describe(`firstEntryByValue`, () => {
    test(`finds entry containing value`, () => {
      const map = new MapOfSimpleBase<number>(undefined, undefined, [
        ['a', [1, 2]],
        ['b', [3, 4]]
      ]);
      
      const entry = firstEntryByValue(map, 3);
      expect(entry).toBeDefined();
      expect(entry![0]).toBe('b');
    });

    test(`returns undefined when value not found`, () => {
      const map = new MapOfSimpleBase<number>(undefined, undefined, [
        ['a', [1, 2]]
      ]);
      
      const entry = firstEntryByValue(map, 99);
      expect(entry).toBeUndefined();
    });
  });

  describe(`longestEntry`, () => {
    test(`finds entry with most items`, () => {
      const map = new MapOfSimpleBase<number>(undefined, undefined, [
        ['short', [1]],
        ['medium', [1, 2]],
        ['long', [1, 2, 3]]
      ]);
      
      const entry = longestEntry(map);
      expect(entry).toBeDefined();
      expect(entry![0]).toBe('long');
    });

    test(`returns undefined for empty map`, () => {
      const map = new MapOfSimpleBase<number>();
      const entry = longestEntry(map);
      expect(entry).toBeUndefined();
    });
  });

  describe(`cloneShallow`, () => {
    test(`creates shallow copy`, () => {
      const original = new MapOfSimpleBase<number>(undefined, undefined, [
        ['key', [1, 2]]
      ]);
      
      const cloned = cloneShallow(original);
      expect([...cloned.get('key')!]).toEqual([1, 2]);
      
      cloned.get('key')?.push(3);
      expect([...original.valuesFor('key')]).toEqual([1, 2]);
    });
  });

  describe(`equals`, () => {
    test(`returns true for equal maps`, () => {
      const map1 = new MapOfSimpleBase<number>(undefined, undefined, [
        ['a', [1, 2]]
      ]);
      const map2 = new MapOfSimpleBase<number>(undefined, undefined, [
        ['a', [2, 1]]
      ]);
      
      expect(equals(map1, map2)).toBe(true);
    });

    test(`returns false for different maps`, () => {
      const map1 = new MapOfSimpleBase<number>(undefined, undefined, [
        ['a', [1, 2]]
      ]);
      const map2 = new MapOfSimpleBase<number>(undefined, undefined, [
        ['a', [1, 2, 3]]
      ]);
      
      expect(equals(map1, map2)).toBe(false);
    });

    test(`returns false for different keys`, () => {
      const map1 = new MapOfSimpleBase<number>(undefined, undefined, [
        ['a', [1]]
      ]);
      const map2 = new MapOfSimpleBase<number>(undefined, undefined, [
        ['b', [1]]
      ]);
      
      expect(equals(map1, map2)).toBe(false);
    });
  });
});
