var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../arrays/src/index.ts
var src_exports = {};
__export(src_exports, {
  atWrap: () => atWrap,
  chunks: () => chunks,
  contains: () => contains,
  containsDuplicateInstances: () => containsDuplicateInstances,
  containsDuplicateValues: () => containsDuplicateValues,
  cycle: () => cycle,
  ensureLength: () => ensureLength,
  filterAB: () => filterAB,
  filterBetween: () => filterBetween,
  flatten: () => flatten,
  frequencyByGroup: () => frequencyByGroup,
  groupBy: () => groupBy,
  insertAt: () => insertAt,
  interleave: () => interleave,
  intersection: () => intersection,
  isContentsTheSame: () => isContentsTheSame,
  isEqual: () => isEqual,
  mergeByKey: () => mergeByKey,
  pairwise: () => pairwise,
  pairwiseReduce: () => pairwiseReduce,
  randomElement: () => randomElement,
  remove: () => remove,
  sample: () => sample,
  shuffle: () => shuffle,
  sortByNumericProperty: () => sortByNumericProperty,
  sortByProperty: () => sortByProperty,
  unique: () => unique,
  uniqueDeep: () => uniqueDeep,
  until: () => until,
  without: () => without,
  withoutUndefined: () => withoutUndefined,
  zip: () => zip
});

// ../arrays/src/array-cycle.ts
var cycle = (options) => {
  const opts = [...options];
  let index = 0;
  const next = () => {
    index++;
    if (index === opts.length) index = 0;
    return value();
  };
  const prev = () => {
    index--;
    if (index === -1) index = opts.length - 1;
    return value();
  };
  const value = () => {
    return opts.at(index);
  };
  const select = (indexOrValue) => {
    if (typeof indexOrValue === `number`) {
      index = indexOrValue;
    } else {
      const found = opts.indexOf(indexOrValue);
      if (found === -1) throw new Error(`Could not find value`);
      index = found;
    }
  };
  const toArray6 = () => [...opts];
  return { toArray: toArray6, next, prev, get current() {
    return value();
  }, select };
};

// ../guards/src/throw-from-result.ts
var throwFromResult = (test) => {
  if (test[0]) return false;
  else throw new Error(test[1]);
};

// ../guards/src/numbers.ts
var numberTest = (value, range2 = ``, parameterName = `?`) => {
  if (value === null) return [false, `Parameter '${parameterName}' is null`];
  if (typeof value === `undefined`) {
    return [false, `Parameter '${parameterName}' is undefined`];
  }
  if (Number.isNaN(value)) {
    return [false, `Parameter '${parameterName}' is NaN`];
  }
  if (typeof value !== `number`) {
    return [false, `Parameter '${parameterName}' is not a number (${JSON.stringify(value)})`];
  }
  switch (range2) {
    case `finite`: {
      if (!Number.isFinite(value)) {
        return [false, `Parameter '${parameterName} must be finite (Got: ${value})`];
      }
      break;
    }
    case `positive`: {
      if (value < 0) {
        return [false, `Parameter '${parameterName}' must be at least zero (${value})`];
      }
      break;
    }
    case `negative`: {
      if (value > 0) {
        return [false, `Parameter '${parameterName}' must be zero or lower (${value})`];
      }
      break;
    }
    case `aboveZero`: {
      if (value <= 0) {
        return [false, `Parameter '${parameterName}' must be above zero (${value})`];
      }
      break;
    }
    case `belowZero`: {
      if (value >= 0) {
        return [false, `Parameter '${parameterName}' must be below zero (${value})`];
      }
      break;
    }
    case `percentage`: {
      if (value > 1 || value < 0) {
        return [false, `Parameter '${parameterName}' must be in percentage range (0 to 1). (${value})`];
      }
      break;
    }
    case `nonZero`: {
      if (value === 0) {
        return [false, `Parameter '${parameterName}' must non-zero. (${value})`];
      }
      break;
    }
    case `bipolar`: {
      if (value > 1 || value < -1) {
        return [false, `Parameter '${parameterName}' must be in bipolar percentage range (-1 to 1). (${value})`];
      }
      break;
    }
  }
  return [true];
};
var throwNumberTest = (value, range2 = ``, parameterName = `?`) => {
  throwFromResult(numberTest(value, range2, parameterName));
};
var percentTest = (value, parameterName = `?`) => numberTest(value, `percentage`, parameterName);
var throwPercentTest = (value, parameterName = `?`) => {
  throwFromResult(percentTest(value, parameterName));
};
var integerTest = (value, range2 = ``, parameterName = `?`) => {
  const r = numberTest(value, range2, parameterName);
  if (!r[0]) return r;
  if (!Number.isInteger(value)) {
    return [false, `Param '${parameterName}' is not an integer`];
  }
  return [true];
};
var throwIntegerTest = (value, range2 = ``, parameterName = `?`) => {
  throwFromResult(integerTest(value, range2, parameterName));
};
var numberInclusiveRangeTest = (value, min8, max9, parameterName = `?`) => {
  if (typeof value !== `number`) {
    return [false, `Param '${parameterName}' is not a number type. Got type: '${typeof value}' value: '${JSON.stringify(value)}'`];
  }
  if (Number.isNaN(value)) {
    return [false, `Param '${parameterName}' is not within range ${min8}-${max9}. Got: NaN`];
  }
  if (Number.isFinite(value)) {
    if (value < min8) {
      return [false, `Param '${parameterName}' is below range ${min8}-${max9}. Got: ${value}`];
    } else if (value > max9) {
      return [false, `Param '${parameterName}' is above range ${min8}-${max9}. Got: ${value}`];
    }
    return [true];
  } else {
    return [false, `Param '${parameterName}' is not within range ${min8}-${max9}. Got: infinite`];
  }
};

// ../guards/src/arrays.ts
var arrayTest = (value, parameterName = `?`) => {
  if (!Array.isArray(value)) {
    return [false, `Parameter '${parameterName}' is expected to be an array'`];
  }
  return [true];
};
var throwArrayTest = (value, parameterName = `?`) => {
  throwFromResult(arrayTest(value, parameterName));
};
var guardArray = (array3, name = `?`) => {
  if (array3 === void 0) {
    throw new TypeError(`Param '${name}' is undefined. Expected array.`);
  }
  if (array3 === null) {
    throw new TypeError(`Param '${name}' is null. Expected array.`);
  }
  if (!Array.isArray(array3)) {
    throw new TypeError(`Param '${name}' not an array as expected`);
  }
};
var guardIndex = (array3, index, name = `index`) => {
  guardArray(array3);
  throwIntegerTest(index, `positive`, name);
  if (index > array3.length - 1) {
    throw new Error(
      `'${name}' ${index} beyond array max of ${array3.length - 1}`
    );
  }
};

// ../guards/src/function.ts
var functionTest = (value, parameterName = `?`) => {
  if (value === void 0) return [false, `Param '${parameterName}' is undefined. Expected: function.`];
  if (value === null) return [false, `Param '${parameterName}' is null. Expected: function.`];
  if (typeof value !== `function`) return [false, `Param '${parameterName}' is type '${typeof value}'. Expected: function`];
  return [true];
};
var throwFunctionTest = (value, parameterName = `?`) => {
  const [ok, msg] = functionTest(value, parameterName);
  if (ok) return;
  throw new TypeError(msg);
};

// ../guards/src/object.ts
var isPlainObject = (value) => {
  if (typeof value !== `object` || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
};
var isPlainObjectOrPrimitive = (value) => {
  const t2 = typeof value;
  if (t2 === `symbol`) return false;
  if (t2 === `function`) return false;
  if (t2 === `bigint`) return true;
  if (t2 === `number`) return true;
  if (t2 === `string`) return true;
  if (t2 === `boolean`) return true;
  return isPlainObject(value);
};

// ../guards/src/string.ts
var stringTest = (value, range2 = ``, parameterName = `?`) => {
  if (typeof value !== `string`) return [false, `Param '${parameterName} is not type string. Got: ${typeof value}`];
  switch (range2) {
    case `non-empty`:
      if (value.length === 0) return [false, `Param '${parameterName} is empty`];
      break;
  }
  return [true];
};
var throwStringTest = (value, range2 = ``, parameterName = `?`) => {
  throwFromResult(stringTest(value, range2, parameterName));
};

// ../arrays/src/at-wrap.ts
var atWrap = (array3, index) => {
  throwNumberTest(index, ``, `index`);
  if (!Array.isArray(array3)) throw new Error(`Param 'array' is not an array`);
  index = index % array3.length;
  return array3.at(index);
};

// ../arrays/src/chunks.ts
function chunks(array3, size) {
  const output = [];
  for (let index = 0; index < array3.length; index += size) {
    output.push(array3.slice(index, index + size));
  }
  return output;
}

// ../arrays/src/util/to-string.ts
var toStringDefault = (itemToMakeStringFor) => typeof itemToMakeStringFor === `string` ? itemToMakeStringFor : JSON.stringify(itemToMakeStringFor);

// ../arrays/src/util/is-equal.ts
var isEqualDefault = (a2, b2) => a2 === b2;
var isEqualValueDefault = (a2, b2) => {
  if (a2 === b2) return true;
  return toStringDefault(a2) === toStringDefault(b2);
};

// ../arrays/src/contains.ts
var contains = (haystack, needles, eq = isEqualDefault) => {
  if (!Array.isArray(haystack)) {
    throw new TypeError(`Expects haystack parameter to be an array`);
  }
  if (!Array.isArray(needles)) {
    throw new TypeError(`Expects needles parameter to be an array`);
  }
  for (const needle of needles) {
    let found = false;
    for (const element of haystack) {
      if (eq(needle, element)) {
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }
  return true;
};
var containsDuplicateValues = (data, keyFunction = toStringDefault) => {
  if (typeof data !== `object`) throw new Error(`Param 'data' is expected to be an Iterable. Got type: ${typeof data}`);
  const set5 = /* @__PURE__ */ new Set();
  for (const v of data) {
    const string_ = keyFunction(v);
    if (set5.has(string_)) return true;
    set5.add(string_);
  }
  return false;
};
var containsDuplicateInstances = (array3) => {
  if (!Array.isArray(array3)) throw new Error(`Parameter needs to be an array`);
  for (let index = 0; index < array3.length; index++) {
    for (let x = 0; x < array3.length; x++) {
      if (index === x) continue;
      if (array3[index] === array3[x]) return true;
    }
  }
  return false;
};

// ../arrays/src/ensure-length.ts
var ensureLength = (data, length5, expand = `undefined`) => {
  if (data === void 0) throw new Error(`Data undefined`);
  if (!Array.isArray(data)) throw new Error(`data is not an array`);
  if (data.length === length5) return [...data];
  if (data.length > length5) {
    return data.slice(0, length5);
  }
  const d2 = [...data];
  const add2 = length5 - d2.length;
  for (let index = 0; index < add2; index++) {
    switch (expand) {
      case `undefined`: {
        d2.push(void 0);
        break;
      }
      case `repeat`: {
        d2.push(data[index % data.length]);
        break;
      }
      case `first`: {
        d2.push(data[0]);
        break;
      }
      case `last`: {
        d2.push(data.at(-1));
        break;
      }
    }
  }
  return d2;
};

// ../arrays/src/equality.ts
var isEqual = (arrayA, arrayB, equality = isEqualDefault) => {
  guardArray(arrayA, `arrayA`);
  guardArray(arrayB, `arrayB`);
  if (arrayA.length !== arrayB.length) return false;
  for (let indexA = 0; indexA < arrayA.length; indexA++) {
    if (!equality(arrayA[indexA], arrayB[indexA])) return false;
  }
  return true;
};
var isContentsTheSame = (array3, equality) => {
  if (!Array.isArray(array3)) throw new Error(`Param 'array' is not an array.`);
  if (array3.length === 0) return true;
  const eq = equality ?? isEqualValueDefault;
  const a2 = array3[0];
  const r = array3.some((v) => !eq(a2, v));
  if (r) return false;
  return true;
};

// ../arrays/src/filter.ts
var withoutUndefined = (data) => {
  return data.filter((v) => v !== void 0);
};
var filterAB = (data, filter4) => {
  const a2 = [];
  const b2 = [];
  for (const datum of data) {
    if (filter4(datum)) a2.push(datum);
    else b2.push(datum);
  }
  return [a2, b2];
};
function* filterBetween(array3, predicate, startIndex, endIndex) {
  guardArray(array3);
  if (typeof startIndex === `undefined`) startIndex = 0;
  if (typeof endIndex === `undefined`) endIndex = array3.length;
  guardIndex(array3, startIndex, `startIndex`);
  guardIndex(array3, endIndex - 1, `endIndex`);
  for (let index = startIndex; index < endIndex; index++) {
    if (predicate(array3[index], index, array3)) yield array3[index];
  }
}
var without = (sourceArray, toRemove, comparer = isEqualDefault) => {
  if (Array.isArray(toRemove)) {
    const returnArray = [];
    for (const source of sourceArray) {
      if (!toRemove.some((v) => comparer(source, v))) {
        returnArray.push(source);
      }
    }
    return returnArray;
  } else {
    return sourceArray.filter((v) => !comparer(v, toRemove));
  }
};

// ../arrays/src/flatten.ts
var flatten = (array3) => [...array3].flat();

// ../arrays/src/frequency.ts
var frequencyByGroup = (groupBy2, data) => {
  if (!Array.isArray(data)) throw new TypeError(`Param 'array' is expected to be an array. Got type: '${typeof data}'`);
  const store = /* @__PURE__ */ new Map();
  for (const value of data) {
    const group2 = groupBy2(value);
    if (typeof group2 !== `string` && typeof group2 !== `number`) {
      throw new TypeError(`groupBy function is expected to return type string or number. Got type: '${typeof group2}' for value: '${value}'`);
    }
    let groupValue = store.get(group2);
    groupValue ??= 0;
    groupValue++;
    store.set(group2, groupValue);
  }
  return store;
};

// ../arrays/src/group-by.ts
var groupBy = (array3, grouper) => {
  const map3 = /* @__PURE__ */ new Map();
  for (const a2 of array3) {
    const key = grouper(a2);
    let existing = map3.get(key);
    if (!existing) {
      existing = [];
      map3.set(key, existing);
    }
    existing.push(a2);
  }
  return map3;
};

// ../arrays/src/unique.ts
var uniqueDeep = (arrays, comparer = isEqualDefault) => {
  const t2 = [];
  const contains2 = (v) => {
    for (const tValue of t2) {
      if (comparer(tValue, v)) return true;
    }
    return false;
  };
  const flattened = arrays.flat(10);
  for (const v of flattened) {
    if (!contains2(v)) t2.push(v);
  }
  return t2;
};
var unique = (arrays, toString8 = toStringDefault) => {
  const matching = /* @__PURE__ */ new Set();
  const t2 = [];
  const flattened = arrays.flat(10);
  for (const a2 of flattened) {
    const stringRepresentation = toString8(a2);
    if (matching.has(stringRepresentation)) continue;
    matching.add(stringRepresentation);
    t2.push(a2);
  }
  return t2;
};

// ../arrays/src/insert-at.ts
var insertAt = (data, index, ...values2) => {
  if (!Array.isArray(data)) {
    throw new TypeError(`Param 'data' is not an arry`);
  }
  return [...data.slice(0, index), ...values2, ...data.slice(index + 1)];
};

// ../arrays/src/interleave.ts
var interleave = (...arrays) => {
  if (arrays.some((a2) => !Array.isArray(a2))) {
    throw new Error(`All parameters must be an array`);
  }
  const lengths3 = arrays.map((a2) => a2.length);
  if (!isContentsTheSame(lengths3)) {
    throw new Error(`Arrays must be of same length`);
  }
  const returnValue = [];
  const length5 = lengths3[0];
  for (let index = 0; index < length5; index++) {
    for (const array3 of arrays) {
      returnValue.push(array3[index]);
    }
  }
  return returnValue;
};

// ../arrays/src/intersection.ts
var intersection = (arrayA, arrayB, equality = isEqualDefault) => arrayA.filter((valueFromA) => arrayB.some((valueFromB) => equality(valueFromA, valueFromB)));

// ../arrays/src/merge-by-key.ts
var mergeByKey = (keyFunction, reconcile, ...arrays) => {
  const result = /* @__PURE__ */ new Map();
  for (const m3 of arrays) {
    for (const mv of m3) {
      if (mv === void 0) continue;
      const mk = keyFunction(mv);
      let v = result.get(mk);
      v = v ? reconcile(v, mv) : mv;
      result.set(mk, v);
    }
  }
  return [...result.values()];
};

// ../arrays/src/pairwise.ts
function* pairwise(values2) {
  guardArray(values2, `values`);
  if (values2.length < 2) throw new Error(`Array needs to have at least two entries. Length: ${values2.length}`);
  for (let index = 1; index < values2.length; index++) {
    yield [values2[index - 1], values2[index]];
  }
}
var pairwiseReduce = (array3, reducer, initial) => {
  guardArray(array3, `arr`);
  if (array3.length < 2) return initial;
  for (let index = 0; index < array3.length - 1; index++) {
    initial = reducer(initial, array3[index], array3[index + 1]);
  }
  return initial;
};

// ../arrays/src/random.ts
var shuffle = (dataToShuffle, rand = Math.random) => {
  guardArray(dataToShuffle, `dataToShuffle`);
  const array3 = [...dataToShuffle];
  for (let index = array3.length - 1; index > 0; index--) {
    const index_ = Math.floor(rand() * (index + 1));
    [array3[index], array3[index_]] = [array3[index_], array3[index]];
  }
  return array3;
};
var randomElement = (array3, rand = Math.random) => {
  guardArray(array3, `array`);
  return array3[Math.floor(rand() * array3.length)];
};

// ../arrays/src/remove.ts
var remove = (data, index) => {
  if (!Array.isArray(data)) {
    throw new TypeError(`'data' parameter should be an array`);
  }
  guardIndex(data, index, `index`);
  return [...data.slice(0, index), ...data.slice(index + 1)];
};

// ../arrays/src/sample.ts
var sample = (array3, amount) => {
  if (!Array.isArray(array3)) throw new TypeError(`Param 'array' is not actually an array. Got type: ${typeof array3}`);
  let subsampleSteps = 1;
  if (amount <= 1) {
    const numberOfItems = array3.length * amount;
    subsampleSteps = Math.round(array3.length / numberOfItems);
  } else {
    subsampleSteps = amount;
  }
  throwIntegerTest(subsampleSteps, `positive`, `amount`);
  if (subsampleSteps > array3.length - 1) {
    throw new Error(`Subsample steps exceeds array length`);
  }
  const r = [];
  for (let index = subsampleSteps - 1; index < array3.length; index += subsampleSteps) {
    r.push(array3[index]);
  }
  return r;
};

// ../arrays/src/sort.ts
var sortByNumericProperty = (data, propertyName) => [...data].sort((a2, b2) => {
  guardArray(data, `data`);
  const av = a2[propertyName];
  const bv = b2[propertyName];
  if (av < bv) return -1;
  if (av > bv) return 1;
  return 0;
});
var sortByProperty = (data, propertyName) => [...data].sort((a2, b2) => {
  guardArray(data, `data`);
  const av = a2[propertyName];
  const bv = b2[propertyName];
  if (av < bv) return -1;
  if (av > bv) return 1;
  return 0;
});

// ../arrays/src/until.ts
function* until(data, predicate, initial) {
  let total2 = initial;
  for (const datum of data) {
    const [stop, accumulator] = predicate(datum, total2);
    if (stop) break;
    total2 = accumulator;
    yield datum;
  }
}

// ../arrays/src/zip.ts
var zip = (...arrays) => {
  if (arrays.some((a2) => !Array.isArray(a2))) {
    throw new Error(`All parameters must be an array`);
  }
  const lengths3 = arrays.map((a2) => a2.length);
  if (!isContentsTheSame(lengths3)) {
    throw new Error(`Arrays must be of same length`);
  }
  const returnValue = [];
  const length5 = lengths3[0];
  for (let index = 0; index < length5; index++) {
    returnValue.push(arrays.map((a2) => a2[index]));
  }
  return returnValue;
};

// dom.ts
var dom_exports = {};
__export(dom_exports, {
  ElementSizer: () => ElementSizer,
  getBoundingClientRectWithBorder: () => getBoundingClientRectWithBorder,
  getComputedPixels: () => getComputedPixels,
  resolveEl: () => resolveEl,
  resolveElementTry: () => resolveElementTry,
  resolveEls: () => resolveEls,
  setCssClass: () => setCssClass,
  setCssDisplay: () => setCssDisplay,
  setCssToggle: () => setCssToggle,
  setHtml: () => setHtml,
  setProperty: () => setProperty,
  setText: () => setText
});

// ../core/src/to-string.ts
var objectToString = Object.prototype.toString;
var toTypeString = (value) => objectToString.call(value);
var isMap = (value) => toTypeString(value) === `[object Map]`;
var isSet = (value) => toTypeString(value) === `[object Set]`;
var toStringDefault2 = (itemToMakeStringFor) => typeof itemToMakeStringFor === `string` ? itemToMakeStringFor : JSON.stringify(itemToMakeStringFor);
var defaultToString = (object2) => {
  if (object2 === null) return `null`;
  if (typeof object2 === `boolean` || typeof object2 === `number`) {
    return object2.toString();
  }
  if (typeof object2 === `string`) return object2;
  if (typeof object2 === `symbol`) throw new TypeError(`Symbol cannot be converted to string`);
  return JSON.stringify(object2);
};

// ../core/src/comparers.ts
var numericComparer = (x, y) => {
  if (x === y) return 0;
  if (x > y) return 1;
  return -1;
};
var jsComparer = (x, y) => {
  if (x === void 0 && y === void 0) return 0;
  if (x === void 0) return 1;
  if (y === void 0) return -1;
  const xString = defaultToString(x);
  const yString = defaultToString(y);
  if (xString < yString) return -1;
  if (xString > yString) return 1;
  return 0;
};
var comparerInverse = (comparer) => {
  return (x, y) => {
    const v = comparer(x, y);
    return v * -1;
  };
};
var defaultComparer = (x, y) => {
  if (typeof x === `number` && typeof y === `number`) {
    return numericComparer(x, y);
  }
  return jsComparer(x, y);
};

// ../core/src/count.ts
function* count(amount, offset2 = 0) {
  throwIntegerTest(amount, ``, `amount`);
  throwIntegerTest(offset2, ``, `offset`);
  if (amount === 0) return;
  let index = 0;
  do {
    yield amount < 0 ? -index + offset2 : index + offset2;
  } while (index++ < Math.abs(amount) - 1);
}

// ../core/src/continuously.ts
var continuously = (callback, interval, options = {}) => {
  let intervalMs = intervalToMs(interval, 0);
  throwIntegerTest(intervalMs, `positive`, `interval`);
  const fireBeforeWait = options.fireBeforeWait ?? false;
  const onStartCalled = options.onStartCalled;
  const signal = options.signal;
  let disposed = false;
  let runState = `idle`;
  let startCount = 0;
  let startCountTotal = 0;
  let startedAt = performance.now();
  let intervalUsed = interval ?? 0;
  let cancelled = false;
  let currentTimer;
  const deschedule = () => {
    if (currentTimer === void 0) return;
    globalThis.clearTimeout(currentTimer);
    currentTimer = void 0;
    startCount = 0;
    startedAt = Number.NaN;
  };
  const schedule = (scheduledCallback) => {
    if (intervalMs === 0) {
      if (typeof requestAnimationFrame === `undefined`) {
        currentTimer = globalThis.setTimeout(scheduledCallback, 0);
      } else {
        currentTimer = void 0;
        requestAnimationFrame(scheduledCallback);
      }
    } else {
      currentTimer = globalThis.setTimeout(scheduledCallback, intervalMs);
    }
  };
  const cancel = () => {
    if (cancelled) return;
    cancelled = true;
    if (runState === `idle`) return;
    runState = `idle`;
    deschedule();
  };
  const loop = async () => {
    if (signal?.aborted) {
      runState = `idle`;
    }
    if (runState === `idle`) return;
    runState = `running`;
    startCount++;
    startCountTotal++;
    const valueOrPromise = callback(startCount, performance.now() - startedAt);
    const value = typeof valueOrPromise === `object` ? await valueOrPromise : valueOrPromise;
    if (cancelled) {
      return;
    }
    runState = `scheduled`;
    if (value !== void 0 && !value) {
      cancel();
      return;
    }
    if (cancelled) return;
    schedule(loop);
  };
  const start = () => {
    if (disposed) throw new Error(`Disposed`);
    cancelled = false;
    if (onStartCalled !== void 0) {
      const doWhat = onStartCalled(startCount, performance.now() - startedAt);
      switch (doWhat) {
        case `cancel`: {
          cancel();
          return;
        }
        case `reset`: {
          reset();
          return;
        }
        case `dispose`: {
          disposed = true;
          cancel();
          return;
        }
      }
    }
    if (runState === `idle`) {
      startCount = 0;
      startedAt = performance.now();
      runState = `scheduled`;
      if (fireBeforeWait) {
        void loop();
      } else {
        schedule(loop);
      }
    }
  };
  const reset = () => {
    if (disposed) throw new Error(`Disposed`);
    cancelled = false;
    startCount = 0;
    startedAt = Number.NaN;
    if (runState !== `idle`) {
      cancel();
    }
    start();
  };
  return {
    start,
    reset,
    cancel,
    get interval() {
      return intervalUsed;
    },
    get runState() {
      return runState;
    },
    get startCountTotal() {
      return startCountTotal;
    },
    get startCount() {
      return startCount;
    },
    set interval(interval2) {
      const ms = intervalToMs(interval2, 0);
      throwIntegerTest(ms, `positive`, `interval`);
      intervalMs = ms;
      intervalUsed = interval2;
    },
    get isDisposed() {
      return disposed;
    },
    get elapsedMs() {
      return performance.now() - startedAt;
    }
  };
};

// ../core/src/correlate.ts
var orderScore = (a2, b2) => {
  if (a2.score > b2.score) return -1;
  else if (a2.score < b2.score) return 1;
  return 0;
};
var align = (similarityFunction, lastData, newData, options = {}) => {
  const matchThreshold = options.matchThreshold ?? 0;
  const debug = options.debug ?? false;
  const results = /* @__PURE__ */ new Map();
  const newThings = [];
  const lastMap = /* @__PURE__ */ new Map();
  lastData?.forEach((d2, index) => {
    if (typeof d2 === `undefined`) {
      throw new Error(`'lastData' contains undefined (index: ${index.toString()})`);
    }
    lastMap.set(d2.id, d2);
  });
  for (const newD of newData) {
    if (!lastData || lastData.length === 0) {
      if (debug) console.debug(`Correlate.align() new id: ${newD.id}`);
      newThings.push(newD);
      continue;
    }
    const scoredLastValues = Array.from(lastMap.values()).map((last5) => ({
      id: last5.id,
      score: last5 === null ? -1 : similarityFunction(last5, newD),
      last: last5
    }));
    if (scoredLastValues.length === 0) {
      if (debug) {
        console.debug(`Correlate.align() no valid last values id: ${newD.id}`);
      }
      newThings.push(newD);
      continue;
    }
    scoredLastValues.sort(orderScore);
    const top = scoredLastValues[0];
    if (top.score < matchThreshold) {
      if (debug) {
        console.debug(
          `Correlate.align() new item does not reach threshold. Top score: ${top.score.toString()} id: ${newD.id}`
        );
      }
      newThings.push(newD);
      continue;
    }
    if (debug && top.id !== newD.id) {
      console.log(
        `Correlate.align() Remapped ${newD.id} -> ${top.id} (score: ${top.score.toString()})`
      );
    }
    results.set(top.id, { ...newD, id: top.id });
    lastMap.delete(top.id);
  }
  newThings.forEach((t2) => results.set(t2.id, t2));
  return Array.from(results.values());
};
var alignById = (fn, options = {}) => {
  let lastData = [];
  const compute = (newData) => {
    lastData = align(fn, lastData, newData, options);
    return [...lastData];
  };
  return compute;
};

// ../core/src/default-keyer.ts
var defaultKeyer = (a2) => {
  return typeof a2 === `string` ? a2 : JSON.stringify(a2);
};

// ../core/src/elapsed.ts
var elapsedSince = () => {
  const start = performance.now();
  return () => {
    return performance.now() - start;
  };
};
var elapsedInterval = () => {
  let start = performance.now();
  return () => {
    const now = performance.now();
    const x = now - start;
    start = now;
    return x;
  };
};
var elapsedOnce = () => {
  const start = Date.now();
  let stoppedAt = 0;
  return () => {
    if (stoppedAt === 0) {
      stoppedAt = Date.now() - start;
    }
    return stoppedAt;
  };
};
var elapsedInfinity = () => {
  return () => {
    return Number.POSITIVE_INFINITY;
  };
};

// ../core/src/filters.ts
var filterValue = (v, predicate, skipValue) => {
  if (predicate(v)) return v;
  return skipValue;
};

// ../core/src/text.ts
var abbreviate = (source, maxLength = 15) => {
  throwFromResult(integerTest(maxLength, `aboveZero`, `maxLength`));
  if (typeof source !== `string`) throw new Error(`Parameter 'source' is not a string`);
  if (source.length > maxLength && source.length > 3) {
    if (maxLength > 15) {
      const chunk2 = Math.round((maxLength - 2) / 2);
      return source.slice(0, chunk2) + `...` + source.slice(-chunk2);
    }
    return source.slice(0, maxLength) + `...`;
  }
  return source;
};
var toStringAbbreviate = (source, maxLength = 20) => {
  if (source === void 0) return `(undefined)`;
  if (source === null) return `(null)`;
  return abbreviate(JSON.stringify(source), maxLength);
};
var wildcard = (pattern) => {
  const escapeRegex = (value) => value.replaceAll(/([!$()*+./:=?[\\\]^{|}])/g, `\\$1`);
  pattern = pattern.split(`*`).map((m3) => escapeRegex(m3)).join(`.*`);
  pattern = `^` + pattern + `$`;
  const regex = new RegExp(pattern);
  return (value) => {
    return regex.test(value);
  };
};

// ../core/src/is-equal-test.ts
var isEqualTrace = (eq) => {
  return (a2, b2) => {
    const result = eq(a2, b2);
    console.log(`isEqualTrace eq: ${result} a: ${toStringAbbreviate(a2)} b: ${toStringAbbreviate(b2)}`);
    return result;
  };
};

// ../core/src/is-equal.ts
var toStringOrdered = (itemToMakeStringFor) => {
  if (typeof itemToMakeStringFor === `string`) return itemToMakeStringFor;
  const allKeys = /* @__PURE__ */ new Set();
  JSON.stringify(itemToMakeStringFor, (key, value) => (allKeys.add(key), value));
  return JSON.stringify(itemToMakeStringFor, [...allKeys].sort());
};
var isEqualDefault2 = (a2, b2) => a2 === b2;
var isEqualValueDefault2 = (a2, b2) => {
  if (a2 === b2) return true;
  return toStringDefault2(a2) === toStringDefault2(b2);
};
var isEqualValuePartial = (a2, b2, fieldComparer) => {
  if (typeof a2 !== `object`) throw new Error(`Param 'a' expected to be object`);
  if (typeof b2 !== `object`) throw new Error(`Param 'b' expected to be object`);
  if (Object.is(a2, b2)) return true;
  const comparer = fieldComparer ?? isEqualValuePartial;
  for (const entryB of Object.entries(b2)) {
    const valueOnAKeyFromB = a2[entryB[0]];
    const valueB = entryB[1];
    if (typeof valueOnAKeyFromB === `object` && typeof valueB === `object`) {
      if (!comparer(valueOnAKeyFromB, valueB)) {
        return false;
      }
    } else {
      if (valueOnAKeyFromB !== valueB) {
        return false;
      }
    }
  }
  return true;
};
var isEqualValueIgnoreOrder = (a2, b2) => {
  if (a2 === b2) return true;
  return toStringOrdered(a2) === toStringOrdered(b2);
};
var isEmptyEntries = (value) => [...Object.entries(value)].length === 0;
var isEqualContextString = (a2, b2, _path) => {
  return JSON.stringify(a2) === JSON.stringify(b2);
};

// ../core/src/is-integer.ts
var isInteger = (value) => {
  if (value === void 0) return false;
  if (typeof value === `string`) {
    const v = Number.parseInt(value);
    if (Number.isNaN(v)) return false;
    if (v.toString() === value.toString()) return true;
    return false;
  }
  if (typeof value === `number`) {
    if (Number.isNaN(value)) return false;
    if (!Number.isFinite(value)) return false;
    if (Math.round(value) === value) return true;
    return false;
  }
  return false;
};

// ../core/src/is-primitive.ts
function isPrimitive(value) {
  if (typeof value === `number`) return true;
  if (typeof value === `string`) return true;
  if (typeof value === `bigint`) return true;
  if (typeof value === `boolean`) return true;
  return false;
}
function isPrimitiveOrObject(value) {
  if (isPrimitive(value)) return true;
  if (typeof value === `object`) return true;
  return false;
}

// ../core/src/iterable-compare-values-shallow.ts
var compareIterableValuesShallow = (a2, b2, eq = isEqualDefault2) => {
  const shared = [];
  const aUnique = [];
  const bUnique = [];
  for (const elementOfA of a2) {
    let seenInB = false;
    for (const elementOfB of b2) {
      if (eq(elementOfA, elementOfB)) {
        seenInB = true;
        break;
      }
    }
    if (seenInB) {
      shared.push(elementOfA);
    } else {
      aUnique.push(elementOfA);
    }
  }
  for (const elementOfB of b2) {
    let seenInA = false;
    for (const elementOfA of a2) {
      if (eq(elementOfB, elementOfA)) {
        seenInA = true;
      }
    }
    if (!seenInA) {
      bUnique.push(elementOfB);
    }
  }
  const isSame = aUnique.length === 0 && bUnique.length === 0;
  return {
    shared,
    isSame,
    a: aUnique,
    b: bUnique
  };
};

// ../core/src/key-value.ts
var sorterByValueIndex = (index, reverse2 = false) => {
  return (values2) => {
    const s = values2.toSorted((a2, b2) => {
      return defaultComparer(a2[index], b2[index]);
    });
    if (reverse2) return s.reverse();
    return s;
  };
};
var keyValueSorter = (sortStyle) => {
  switch (sortStyle) {
    case `value`: {
      return sorterByValueIndex(1, false);
    }
    case `value-reverse`: {
      return sorterByValueIndex(1, true);
    }
    case `key`: {
      return sorterByValueIndex(0, false);
    }
    case `key-reverse`: {
      return sorterByValueIndex(0, true);
    }
    default: {
      throw new Error(`Unknown sorting value '${sortStyle}'. Expecting: value, value-reverse, key or key-reverse`);
    }
  }
};

// ../core/src/util/round.ts
function round(a2, b2, roundUp) {
  throwIntegerTest(a2, `positive`, `decimalPlaces`);
  const up = typeof b2 === `boolean` ? b2 : roundUp ?? false;
  let rounder;
  if (a2 === 0) {
    rounder = Math.round;
  } else {
    const p2 = Math.pow(10, a2);
    if (up) {
      rounder = (v) => Math.ceil(v * p2) / p2;
    } else {
      rounder = (v) => Math.floor(v * p2) / p2;
    }
  }
  if (typeof b2 === `number`) return rounder(b2);
  return rounder;
}

// ../core/src/interval-type.ts
function intervalToMs(interval, defaultNumber) {
  if (isInterval(interval)) {
    if (typeof interval === `number`) return interval;
    let ms = interval.millis ?? 0;
    ms += (interval.hours ?? 0) * 60 * 60 * 1e3;
    ms += (interval.mins ?? 0) * 60 * 1e3;
    ms += (interval.secs ?? 0) * 1e3;
    return ms;
  } else {
    if (typeof defaultNumber !== `undefined`) return defaultNumber;
    throw new Error(`Not a valid interval: ${interval}`);
  }
}
function isInterval(interval) {
  if (interval === void 0) return false;
  if (interval === null) return false;
  if (typeof interval === `number`) {
    if (Number.isNaN(interval)) return false;
    if (!Number.isFinite(interval)) return false;
    return true;
  } else if (typeof interval !== `object`) return false;
  const hasMillis = `millis` in interval;
  const hasSecs = `secs` in interval;
  const hasMins = `mins` in interval;
  const hasHours = `hours` in interval;
  if (hasMillis && !numberTest(interval.millis)[0]) return false;
  if (hasSecs && !numberTest(interval.secs)[0]) return false;
  if (hasMins && !numberTest(interval.mins)[0]) return false;
  if (hasHours && !numberTest(interval.hours)[0]) return false;
  if (hasMillis || hasSecs || hasHours || hasMins) return true;
  return false;
}
var elapsedToHumanString = (millisOrFunction, rounding = 2) => {
  let interval = {} = 0;
  if (typeof millisOrFunction === `function`) {
    const intervalResult = millisOrFunction();
    return elapsedToHumanString(intervalResult);
  } else if (typeof millisOrFunction === `number`) {
    interval = millisOrFunction;
  } else if (typeof millisOrFunction === `object`) {
    interval = intervalToMs(interval);
  }
  let ms = intervalToMs(interval);
  if (typeof ms === `undefined`) return `(undefined)`;
  if (ms < 1e3) return `${round(rounding, ms)}ms`;
  ms /= 1e3;
  if (ms < 120) return `${ms.toFixed(1)}secs`;
  ms /= 60;
  if (ms < 60) return `${ms.toFixed(2)}mins`;
  ms /= 60;
  return `${ms.toFixed(2)}hrs`;
};

// ../core/src/track-unique.ts
var unique2 = (toString8 = toStringDefault2) => {
  const set5 = /* @__PURE__ */ new Set();
  return (value) => {
    if (value === null) throw new TypeError(`Param 'value' cannot be null`);
    if (value === void 0) throw new TypeError(`Param 'value' cannot be undefined`);
    const asString = typeof value === `string` ? value : toString8(value);
    if (set5.has(asString)) return false;
    set5.add(asString);
    return true;
  };
};
var uniqueInstances = () => {
  const set5 = /* @__PURE__ */ new Set();
  return (value) => {
    if (value === null) throw new TypeError(`Param 'value' cannot be null`);
    if (value === void 0) throw new TypeError(`Param 'value' cannot be undefined`);
    if (set5.has(value)) return false;
    set5.add(value);
    return true;
  };
};

// ../core/src/platform.ts
var runningiOS = () => [
  `iPad Simulator`,
  `iPhone Simulator`,
  `iPod Simulator`,
  `iPad`,
  `iPhone`,
  `iPod`
].includes(navigator.platform) || // iPad on iOS 13 detection
navigator.userAgent.includes(`Mac`) && `ontouchend` in document;

// ../core/src/promise-from-event.ts
var promiseFromEvent = (target, name) => {
  return new Promise((resolve2) => {
    const handler = (...args) => {
      target.removeEventListener(name, handler);
      if (Array.isArray(args) && args.length === 1) resolve2(args[0]);
      else resolve2(args);
    };
    target.addEventListener(name, handler);
  });
};

// ../core/src/reactive-core.ts
var isReactive = (rx) => {
  if (typeof rx !== `object`) return false;
  if (rx === null) return false;
  return `on` in rx && `onValue` in rx;
};
var hasLast = (rx) => {
  if (!isReactive(rx)) return false;
  if (`last` in rx) {
    const v = rx.last();
    if (v !== void 0) return true;
  }
  return false;
};

// ../debug/src/index.ts
var src_exports2 = {};
__export(src_exports2, {
  fpsCounter: () => fpsCounter,
  getErrorMessage: () => getErrorMessage,
  logColours: () => logColours,
  logSet: () => logSet,
  logger: () => logger,
  resolveLogOption: () => resolveLogOption
});

// ../debug/src/util.ts
var getOrGenerateSync = (map3, fn) => (key, args) => {
  let value = map3.get(key);
  if (value !== void 0) return value;
  value = fn(key, args);
  map3.set(key, value);
  return value;
};

// ../debug/src/logger.ts
var logger = (prefix, kind = `log`, colourKey) => (m3) => {
  if (m3 === void 0) {
    m3 = `(undefined)`;
  } else if (typeof m3 === `object`) {
    m3 = JSON.stringify(m3);
  }
  const colour = colourKey ?? prefix;
  switch (kind) {
    case `log`: {
      console.log(`%c${prefix} ${m3}`, `color: ${logColours(colour)}`);
      break;
    }
    case `warn`: {
      console.warn(prefix, m3);
      break;
    }
    case `error`: {
      console.error(prefix, m3);
      break;
    }
  }
};
var logSet = (prefix, verbose = true, colourKey) => {
  if (verbose) {
    return {
      log: logger(prefix, `log`, colourKey),
      warn: logger(prefix, `warn`, colourKey),
      error: logger(prefix, `error`, colourKey)
    };
  }
  return {
    log: (_) => {
    },
    warn: logger(prefix, `warn`, colourKey),
    error: logger(prefix, `error`, colourKey)
  };
};
var resolveLogOption = (l, defaults2 = {}) => {
  if (l === void 0 || typeof l === `boolean` && !l) {
    return (_) => {
    };
  }
  const defaultCat = defaults2.category ?? ``;
  const defaultKind = defaults2.kind ?? void 0;
  if (typeof l === `boolean`) {
    return (messageOrString) => {
      const m3 = typeof messageOrString === `string` ? { msg: messageOrString } : messageOrString;
      const kind = m3.kind ?? defaultKind;
      const category = m3.category ?? defaultCat;
      let message = m3.msg;
      if (category) message = `[${category}] ${message}`;
      switch (kind) {
        case `error`: {
          console.error(message);
          break;
        }
        case `warn`: {
          console.warn(message);
          break;
        }
        case `info`: {
          console.info(message);
          break;
        }
        default: {
          console.log(message);
        }
      }
    };
  }
  return l;
};
var logColourCount = 0;
var logColours = getOrGenerateSync(/* @__PURE__ */ new Map(), () => {
  const hue = ++logColourCount * 137.508;
  return `hsl(${hue},50%,75%)`;
});

// ../debug/src/fps-counter.ts
var fpsCounter = (autoDisplay = true, computeAfterFrames = 500) => {
  let count3 = 0;
  let lastFps = 0;
  let countStart = performance.now();
  return () => {
    if (count3++ >= computeAfterFrames) {
      const elapsed3 = performance.now() - countStart;
      countStart = performance.now();
      count3 = 0;
      lastFps = Math.floor(computeAfterFrames / elapsed3 * 1e3);
      if (autoDisplay) console.log(`fps: ${lastFps}`);
    }
    return lastFps;
  };
};

// ../debug/src/index.ts
var getErrorMessage = (ex) => {
  if (typeof ex === `string`) return ex;
  if (ex instanceof Error) {
    return ex.message;
  }
  return ex;
};

// ../core/src/resolve-core.ts
async function resolve(r, ...args) {
  if (typeof r === `object`) {
    if (`next` in r) {
      const tag = r[Symbol.toStringTag];
      if (tag === `Generator` || tag == `Array Iterator`) {
        const v = r.next();
        if (`done` in v && `value` in v) return v.value;
        return v;
      } else if (tag === `AsyncGenerator`) {
        const v = await r.next();
        if (`done` in v && `value` in v) return v.value;
        return v;
      } else {
        throw new Error(`Object has 'next' prop, but does not have 'AsyncGenerator', 'Generator' or 'Array Iterator' string tag symbol. Got: '${tag}'`);
      }
    } else if (isReactive(r)) {
      if (hasLast(r)) return r.last();
      throw new Error(`Reactive does not have last value`);
    } else {
      return r;
    }
  } else if (typeof r === `function`) {
    const v = await r(args);
    return v;
  } else {
    return r;
  }
}
function resolveSync(r, ...args) {
  if (typeof r === `object`) {
    if (`next` in r) {
      const tag = r[Symbol.toStringTag];
      if (tag === `Generator` || tag == `Array Iterator`) {
        const v = r.next();
        if (`done` in v && `value` in v) return v.value;
        return v;
      } else if (tag === `AsyncGenerator`) {
        throw new Error(`resolveSync cannot work with an async generator`);
      } else {
        throw new Error(`Object has 'next' prop, but does not have 'Generator' or 'Array Iterator' string tag symbol. Got: '${tag}'`);
      }
    } else if (isReactive(r)) {
      if (hasLast(r)) return r.last();
      throw new Error(`Reactive does not have last value`);
    } else {
      return r;
    }
  } else if (typeof r === `function`) {
    return r(args);
  } else {
    return r;
  }
}
async function resolveWithFallback(p2, fallback, ...args) {
  let errored = false;
  let fallbackValue = fallback.value;
  const overrideWithLast = fallback.overrideWithLast ?? false;
  if (fallbackValue === void 0) throw new Error(`Needs a fallback value`);
  try {
    const r = await resolve(p2, ...args);
    if (typeof r === `undefined`) return fallbackValue;
    if (typeof r === `number` && Number.isNaN(r)) return fallbackValue;
    if (overrideWithLast) fallbackValue = r;
    return r;
  } catch (error) {
    if (!errored) {
      errored = true;
      console.warn(`resolveWithFallback swallowed an error. Additional errors not reported.`, getErrorMessage(error));
    }
    return fallbackValue;
  }
}
function resolveWithFallbackSync(p2, fallback, ...args) {
  let errored = false;
  let fallbackValue = fallback.value;
  const overrideWithLast = fallback.overrideWithLast ?? false;
  if (fallbackValue === void 0) throw new Error(`Needs a fallback value`);
  try {
    const r = resolveSync(p2, ...args);
    if (typeof r === `undefined`) return fallbackValue;
    if (typeof r === `number` && Number.isNaN(r)) return fallbackValue;
    if (overrideWithLast) fallbackValue = r;
    return r;
  } catch (error) {
    if (!errored) {
      errored = true;
      console.warn(`resolveWithFallbackSync swallowed an error. Additional errors not reported.`, getErrorMessage(error));
    }
    return fallbackValue;
  }
}

// ../core/src/util/zip.ts
var zip2 = (...arrays) => {
  if (arrays.some((a2) => !Array.isArray(a2))) {
    throw new Error(`All parameters must be an array`);
  }
  const lengths3 = arrays.map((a2) => a2.length);
  const returnValue = [];
  const length5 = lengths3[0];
  for (let index = 0; index < length5; index++) {
    returnValue.push(arrays.map((a2) => a2[index]));
  }
  return returnValue;
};

// ../core/src/resolve-fields.ts
async function resolveFields(object2) {
  const resolvers = [];
  const keys = [];
  for (const entry of Object.entries(object2)) {
    const resolvable = entry[1];
    resolvers.push(resolve(resolvable));
    keys.push(entry[0]);
  }
  const results = await Promise.all(resolvers);
  const entries = zip2(keys, results);
  return Object.fromEntries(entries);
}
function resolveFieldsSync(object2) {
  const entries = [];
  for (const entry of Object.entries(object2)) {
    const resolvable = entry[1];
    const value = resolveSync(resolvable);
    entries.push([entry[0], value]);
  }
  return Object.fromEntries(entries);
}

// ../core/src/results.ts
function throwResult(result) {
  if (result.success) return true;
  if (typeof result.error === `string`) throw new Error(result.error);
  throw result.error;
}
function resultToError(result) {
  if (typeof result.error === `string`) return new Error(result.error);
  else return result.error;
}
function resultToValue(result) {
  if (result.success) return result.value;
  else throw resultToError(result);
}
function resultErrorToString(result) {
  if (typeof result.error === `string`) return result.error;
  else return getErrorMessage(result.error);
}

// ../core/src/sleep.ts
if (typeof window === `undefined` || !(`requestAnimationFrame` in window)) {
  if (typeof window === `undefined`) {
    globalThis.requestAnimationFrame = (callback) => {
      setTimeout(callback, 1);
    };
  }
}
var sleep = (optsOrMillis) => {
  const timeoutMs = intervalToMs(optsOrMillis, 1);
  const signal = optsOrMillis.signal;
  const value = optsOrMillis.value;
  throwNumberTest(timeoutMs, `positive`, `timeoutMs`);
  if (timeoutMs === 0) {
    return new Promise(
      (resolve2) => requestAnimationFrame((_) => {
        resolve2(value);
      })
    );
  } else {
    return new Promise((resolve2, reject) => {
      const onAbortSignal = () => {
        clearTimeout(t2);
        if (signal) {
          signal.removeEventListener(`abort`, onAbortSignal);
          reject(new Error(signal.reason));
        } else {
          reject(new Error(`Cancelled`));
        }
      };
      if (signal) {
        signal.addEventListener(`abort`, onAbortSignal);
      }
      const t2 = setTimeout(() => {
        signal?.removeEventListener(`abort`, onAbortSignal);
        if (signal?.aborted) {
          reject(new Error(signal.reason));
          return;
        }
        resolve2(value);
      }, timeoutMs);
    });
  }
};
var sleepWhile = async (predicate, checkInterval = 100) => {
  while (predicate()) {
    await sleep(checkInterval);
  }
};

// ../dom/src/resolve-el.ts
var resolveEl = (domQueryOrEl) => {
  const r = resolveElementTry(domQueryOrEl);
  if (r.success) return r.value;
  throw resultToError(r);
};
var resolveElementTry = (domQueryOrEl) => {
  if (typeof domQueryOrEl === `string`) {
    const d2 = document.querySelector(domQueryOrEl);
    if (d2 === null) {
      const error = domQueryOrEl.startsWith(`#`) ? `Query '${domQueryOrEl}' did not match anything. Try '#id', 'div', or '.class'` : `Query '${domQueryOrEl}' did not match anything. Did you mean '#${domQueryOrEl}?`;
      return { success: false, error };
    }
    domQueryOrEl = d2;
  } else if (domQueryOrEl === null) {
    return { success: false, error: `Param 'domQueryOrEl' is null` };
  } else if (domQueryOrEl === void 0) {
    return { success: false, error: `Param 'domQueryOrEl' is undefined` };
  }
  const el = domQueryOrEl;
  return { success: true, value: el };
};
var resolveEls = (selectors) => {
  if (selectors === void 0) return [];
  if (selectors === null) return [];
  if (Array.isArray(selectors)) return selectors;
  if (typeof selectors === `string`) {
    const elements = [...document.querySelectorAll(selectors)];
    return elements;
  }
  return [selectors];
};

// ../dom/src/css.ts
var getBoundingClientRectWithBorder = (elOrQuery) => {
  let el = resolveEl(elOrQuery);
  const size = el.getBoundingClientRect();
  if (el instanceof SVGElement) {
    el = el.parentElement;
  }
  const border = getComputedPixels(el, `borderTopWidth`, `borderLeftWidth`, `borderRightWidth`, `borderBottomWidth`);
  return {
    x: size.x,
    y: size.y,
    width: size.width + border.borderLeftWidth + border.borderRightWidth,
    height: size.height + border.borderTopWidth + border.borderBottomWidth
  };
};
var getComputedPixels = (elOrQuery, ...properties) => {
  const s = getComputedStyle(resolveEl(elOrQuery));
  const returnValue = {};
  for (const property of properties) {
    const v = s[property];
    if (typeof v === `string`) {
      if (v.endsWith(`px`)) {
        returnValue[property] = Number.parseFloat(v.substring(0, v.length - 2));
      } else {
        throw new Error(`Property '${String(property)}' does not end in 'px'. Value: ${v}`);
      }
    } else {
      throw new Error(`Property '${String(property)}' is not type string. Got: ${typeof v} Value: ${v}`);
    }
  }
  return returnValue;
};
var setCssClass = (selectors, value, cssClass) => {
  const elements = resolveEls(selectors);
  if (elements.length === 0) return;
  for (const element of elements) {
    if (value) element.classList.add(cssClass);
    else element.classList.remove(cssClass);
  }
};
var setCssToggle = (selectors, cssClass) => {
  const elements = resolveEls(selectors);
  if (elements.length === 0) return;
  for (const element of elements) {
    element.classList.toggle(cssClass);
  }
};
var setCssDisplay = (selectors, value) => {
  const elements = resolveEls(selectors);
  if (elements.length === 0) return;
  for (const element of elements) {
    element.style.display = value;
  }
};

// ../geometry/src/waypoint.ts
var waypoint_exports = {};
__export(waypoint_exports, {
  fromPoints: () => fromPoints2,
  init: () => init
});

// ../geometry/src/point/guard.ts
var isNull = (p2) => {
  if (isPoint3d(p2)) {
    if (p2.z !== null) return false;
  }
  return p2.x === null && p2.y === null;
};
var isNaN2 = (p2) => {
  if (isPoint3d(p2)) {
    if (!Number.isNaN(p2.z)) return false;
  }
  return Number.isNaN(p2.x) || Number.isNaN(p2.y);
};
function guard(p2, name = `Point`) {
  if (p2 === void 0) {
    throw new Error(
      `'${name}' is undefined. Expected {x,y} got ${JSON.stringify(p2)}`
    );
  }
  if (p2 === null) {
    throw new Error(
      `'${name}' is null. Expected {x,y} got ${JSON.stringify(p2)}`
    );
  }
  if (p2.x === void 0) {
    throw new Error(
      `'${name}.x' is undefined. Expected {x,y} got ${JSON.stringify(p2)}`
    );
  }
  if (p2.y === void 0) {
    throw new Error(
      `'${name}.y' is undefined. Expected {x,y} got ${JSON.stringify(p2)}`
    );
  }
  if (typeof p2.x !== `number`) {
    throw new TypeError(`'${name}.x' must be a number. Got ${typeof p2.x}`);
  }
  if (typeof p2.y !== `number`) {
    throw new TypeError(`'${name}.y' must be a number. Got ${typeof p2.y}`);
  }
  if (p2.z !== void 0) {
    if (typeof p2.z !== `number`) throw new TypeError(`${name}.z must be a number. Got: ${typeof p2.z}`);
    if (Number.isNaN(p2.z)) throw new Error(`'${name}.z' is NaN. Got: ${JSON.stringify(p2)}`);
  }
  if (p2.x === null) throw new Error(`'${name}.x' is null`);
  if (p2.y === null) throw new Error(`'${name}.y' is null`);
  if (Number.isNaN(p2.x)) throw new Error(`'${name}.x' is NaN`);
  if (Number.isNaN(p2.y)) throw new Error(`'${name}.y' is NaN`);
}
var guardNonZeroPoint = (pt, name = `pt`) => {
  guard(pt, name);
  throwNumberTest(pt.x, `nonZero`, `${name}.x`);
  throwNumberTest(pt.y, `nonZero`, `${name}.y`);
  if (typeof pt.z !== `undefined`) {
    throwNumberTest(pt.z, `nonZero`, `${name}.z`);
  }
  return true;
};
function isPoint(p2) {
  if (p2 === void 0) return false;
  if (p2 === null) return false;
  if (p2.x === void 0) return false;
  if (p2.y === void 0) return false;
  return true;
}
var isPoint3d = (p2) => {
  if (p2 === void 0) return false;
  if (p2 === null) return false;
  if (p2.x === void 0) return false;
  if (p2.y === void 0) return false;
  if (p2.z === void 0) return false;
  return true;
};
var isEmpty = (p2) => {
  if (isPoint3d(p2)) {
    if (p2.z !== 0) return false;
  }
  return p2.x === 0 && p2.y === 0;
};
var isPlaceholder = (p2) => {
  if (isPoint3d(p2)) {
    if (!Number.isNaN(p2.z)) return false;
  }
  return Number.isNaN(p2.x) && Number.isNaN(p2.y);
};

// ../geometry/src/line/from-points.ts
var fromPoints = (a2, b2) => {
  guard(a2, `a`);
  guard(b2, `b`);
  a2 = Object.freeze({ ...a2 });
  b2 = Object.freeze({ ...b2 });
  return Object.freeze({
    a: a2,
    b: b2
  });
};

// ../geometry/src/line/join-points-to-lines.ts
var joinPointsToLines = (...points) => {
  const lines = [];
  let start = points[0];
  for (let index = 1; index < points.length; index++) {
    lines.push(fromPoints(start, points[index]));
    start = points[index];
  }
  return lines;
};

// ../geometry/src/line/guard.ts
var isLine = (p2) => {
  if (p2 === void 0) return false;
  if (p2.a === void 0) return false;
  if (p2.b === void 0) return false;
  if (!isPoint(p2.a)) return false;
  if (!isPoint(p2.b)) return false;
  return true;
};
var isPolyLine = (p2) => {
  if (!Array.isArray(p2)) return false;
  const valid = !p2.some((v) => !isLine(v));
  return valid;
};
var guard2 = (line4, name = `line`) => {
  if (line4 === void 0) throw new Error(`${name} undefined`);
  if (line4.a === void 0) throw new Error(`${name}.a undefined. Expected {a:Point, b:Point}. Got: ${JSON.stringify(line4)}`);
  if (line4.b === void 0) throw new Error(`${name}.b undefined. Expected {a:Point, b:Point} Got: ${JSON.stringify(line4)}`);
};

// ../geometry/src/line/get-points-parameter.ts
var getPointParameter = (aOrLine, b2) => {
  let a2;
  if (isLine(aOrLine)) {
    b2 = aOrLine.b;
    a2 = aOrLine.a;
  } else {
    a2 = aOrLine;
    if (b2 === void 0) throw new Error(`Since first parameter is not a line, two points are expected. Got a: ${JSON.stringify(a2)} b: ${JSON.stringify(b2)}`);
  }
  guard(a2, `a`);
  guard(a2, `b`);
  return [a2, b2];
};

// ../geometry/src/line/length.ts
function length(aOrLine, pointB) {
  if (isPolyLine(aOrLine)) {
    const sum7 = aOrLine.reduce((accumulator, v) => length(v) + accumulator, 0);
    return sum7;
  }
  if (aOrLine === void 0) throw new TypeError(`Parameter 'aOrLine' is undefined`);
  const [a2, b2] = getPointParameter(aOrLine, pointB);
  const x = b2.x - a2.x;
  const y = b2.y - a2.y;
  if (a2.z !== void 0 && b2.z !== void 0) {
    const z = b2.z - a2.z;
    return Math.hypot(x, y, z);
  } else {
    return Math.hypot(x, y);
  }
}

// ../geometry/src/line/reverse.ts
function reverse(line4) {
  guard2(line4, `line`);
  return { a: line4.b, b: line4.a };
}

// ../geometry/src/line/interpolate.ts
function interpolate(amount, aOrLine, pointBOrAllowOverflow, allowOverflow) {
  if (typeof pointBOrAllowOverflow === `boolean`) {
    allowOverflow = pointBOrAllowOverflow;
    pointBOrAllowOverflow = void 0;
  }
  if (!allowOverflow) throwPercentTest(amount, `amount`);
  else throwNumberTest(amount, ``, `amount`);
  const [a2, b2] = getPointParameter(aOrLine, pointBOrAllowOverflow);
  const d2 = length(a2, b2);
  const d22 = d2 * (1 - amount);
  if (d2 === 0 && d22 === 0) return Object.freeze({ ...b2 });
  const x = b2.x - d22 * (b2.x - a2.x) / d2;
  const y = b2.y - d22 * (b2.y - a2.y) / d2;
  return Object.freeze({
    ...b2,
    x,
    y
  });
}
function pointAtDistance(line4, distance5, fromA3 = true) {
  if (!fromA3) line4 = reverse(line4);
  const dx = line4.b.x - line4.a.x;
  const dy = line4.b.y - line4.a.y;
  const theta = Math.atan2(dy, dx);
  const xp = distance5 * Math.cos(theta);
  const yp = distance5 * Math.sin(theta);
  return { x: xp + line4.a.x, y: yp + line4.a.y };
}

// ../geometry/src/line/angles.ts
var directionVector = (line4) => ({
  x: line4.b.x - line4.a.x,
  y: line4.b.y - line4.a.y
});
var directionVectorNormalised = (line4) => {
  const l = length(line4);
  const v = directionVector(line4);
  return {
    x: v.x / l,
    y: v.y / l
  };
};
var parallel = (line4, distance5) => {
  const dv = directionVector(line4);
  const dvn = directionVectorNormalised(line4);
  const a2 = {
    x: line4.a.x - dvn.y * distance5,
    y: line4.a.y + dvn.x * distance5
  };
  return {
    a: a2,
    b: {
      x: a2.x + dv.x,
      y: a2.y + dv.y
    }
  };
};
var perpendicularPoint = (line4, distance5, amount = 0) => {
  const origin = interpolate(amount, line4);
  const dvn = directionVectorNormalised(line4);
  return {
    x: origin.x - dvn.y * distance5,
    y: origin.y + dvn.x * distance5
  };
};

// ../geometry/src/line/midpoint.ts
var midpoint = (aOrLine, pointB) => {
  const [a2, b2] = getPointParameter(aOrLine, pointB);
  return interpolate(0.5, a2, b2);
};

// ../geometry/src/line/index.ts
var line_exports = {};
__export(line_exports, {
  Empty: () => Empty2,
  Placeholder: () => Placeholder2,
  angleRadian: () => angleRadian2,
  apply: () => apply2,
  asPoints: () => asPoints,
  bbox: () => bbox2,
  distance: () => distance2,
  distanceSingleLine: () => distanceSingleLine,
  divide: () => divide2,
  extendFromA: () => extendFromA,
  fromFlatArray: () => fromFlatArray,
  fromNumbers: () => fromNumbers,
  fromPivot: () => fromPivot,
  fromPoints: () => fromPoints,
  fromPointsToPath: () => fromPointsToPath,
  getPointParameter: () => getPointParameter,
  guard: () => guard2,
  interpolate: () => interpolate,
  isEmpty: () => isEmpty3,
  isEqual: () => isEqual3,
  isLine: () => isLine,
  isPlaceholder: () => isPlaceholder3,
  isPolyLine: () => isPolyLine,
  joinPointsToLines: () => joinPointsToLines,
  length: () => length,
  midpoint: () => midpoint,
  multiply: () => multiply4,
  nearest: () => nearest,
  normaliseByRect: () => normaliseByRect2,
  parallel: () => parallel,
  perpendicularPoint: () => perpendicularPoint,
  pointAtDistance: () => pointAtDistance,
  pointAtX: () => pointAtX,
  pointsOf: () => pointsOf,
  relativePosition: () => relativePosition,
  reverse: () => reverse,
  rotate: () => rotate3,
  scaleFromMidpoint: () => scaleFromMidpoint,
  slope: () => slope,
  subtract: () => subtract3,
  sum: () => sum3,
  toFlatArray: () => toFlatArray,
  toPath: () => toPath,
  toString: () => toString5,
  toSvgString: () => toSvgString,
  withinRange: () => withinRange2
});

// ../geometry/src/rect/guard.ts
var guardDim = (d2, name = `Dimension`) => {
  if (d2 === void 0) throw new Error(`${name} is undefined`);
  if (Number.isNaN(d2)) throw new Error(`${name} is NaN`);
  if (d2 < 0) throw new Error(`${name} cannot be negative`);
};
var guard3 = (rect2, name = `rect`) => {
  if (rect2 === void 0) throw new Error(`{$name} undefined`);
  if (isPositioned(rect2)) guard(rect2, name);
  guardDim(rect2.width, name + `.width`);
  guardDim(rect2.height, name + `.height`);
};
var getRectPositioned = (rect2, origin) => {
  guard3(rect2);
  if (isPositioned(rect2) && origin === void 0) {
    return rect2;
  }
  if (origin === void 0) throw new Error(`Unpositioned rect needs origin parameter`);
  return Object.freeze({ ...rect2, ...origin });
};
var guardPositioned = (rect2, name = `rect`) => {
  if (!isPositioned(rect2)) throw new Error(`Expected ${name} to have x,y`);
  guard3(rect2, name);
};
var isEmpty2 = (rect2) => rect2.width === 0 && rect2.height === 0;
var isPlaceholder2 = (rect2) => Number.isNaN(rect2.width) && Number.isNaN(rect2.height);
var isPositioned = (rect2) => rect2.x !== void 0 && rect2.y !== void 0;
var isRect = (rect2) => {
  if (rect2 === void 0) return false;
  if (rect2.width === void 0) return false;
  if (rect2.height === void 0) return false;
  return true;
};
var isRectPositioned = (rect2) => isRect(rect2) && isPositioned(rect2);

// ../geometry/src/point/normalise-by-rect.ts
function normaliseByRect(a2, b2, c4, d2) {
  if (isPoint(a2)) {
    if (typeof b2 === `number` && c4 !== void 0) {
      throwNumberTest(b2, `positive`, `width`);
      throwNumberTest(c4, `positive`, `height`);
    } else {
      if (!isRect(b2)) {
        throw new Error(`Expected second parameter to be a rect`);
      }
      c4 = b2.height;
      b2 = b2.width;
    }
    return Object.freeze({
      x: a2.x / b2,
      y: a2.y / c4
    });
  } else {
    throwNumberTest(a2, `positive`, `x`);
    if (typeof b2 !== `number`) {
      throw new TypeError(`Expecting second parameter to be a number (width)`);
    }
    if (typeof c4 !== `number`) {
      throw new TypeError(`Expecting third parameter to be a number (height)`);
    }
    throwNumberTest(b2, `positive`, `y`);
    throwNumberTest(c4, `positive`, `width`);
    if (d2 === void 0) throw new Error(`Expected height parameter`);
    throwNumberTest(d2, `positive`, `height`);
    return Object.freeze({
      x: a2 / c4,
      y: b2 / d2
    });
  }
}

// ../numbers/src/apply-to-values.ts
var applyToValues = (object2, apply4) => {
  const o = { ...object2 };
  for (const [key, value] of Object.entries(object2)) {
    if (typeof value === `number`) {
      o[key] = apply4(value);
    } else {
      o[key] = value;
    }
  }
  return o;
};

// ../numbers/src/numeric-arrays.ts
var weight = (data, fn) => {
  if (!Array.isArray(data)) throw new TypeError(`Param 'data' is expected to be an array. Got type: ${typeof data}`);
  const weightingFunction = fn ?? ((x) => x);
  return data.map(
    (value, index) => {
      if (typeof value !== `number`) throw new TypeError(`Param 'data' contains non-number at index: '${index}'. Type: '${typeof value}' value: '${value}'`);
      const relativePos = index / (data.length - 1);
      const weightForPosition = weightingFunction(relativePos);
      if (typeof weightForPosition !== `number`) throw new TypeError(`Weighting function returned type '${typeof weightForPosition}' rather than number for input: '${relativePos}'`);
      const finalResult = value * weightForPosition;
      return finalResult;
    }
  );
};
var validNumbers = (data) => data.filter((d2) => typeof d2 === `number` && !Number.isNaN(d2));
var dotProduct = (values2) => {
  let r = 0;
  const length5 = values2[0].length;
  for (let index = 0; index < length5; index++) {
    let t2 = 0;
    for (const [p2, value] of values2.entries()) {
      if (p2 === 0) t2 = value[index];
      else {
        t2 *= value[index];
      }
    }
    r += t2;
  }
  return r;
};
var average = (data) => {
  if (data === void 0) throw new Error(`data parameter is undefined`);
  const valid = validNumbers(data);
  const total2 = valid.reduce((accumulator, v) => accumulator + v, 0);
  return total2 / valid.length;
};
var min = (data) => Math.min(...validNumbers(data));
var maxIndex = (data) => data.reduce(
  (bestIndex, value, index, array3) => value > array3[bestIndex] ? index : bestIndex,
  0
);
var minIndex = (...data) => data.reduce(
  (bestIndex, value, index, array3) => value < array3[bestIndex] ? index : bestIndex,
  0
);
var max = (data) => Math.max(...validNumbers(data));
var total = (data) => data.reduce((previous, current) => {
  if (typeof current !== `number`) return previous;
  if (Number.isNaN(current)) return previous;
  if (!Number.isFinite(current)) return previous;
  return previous + current;
}, 0);
var maxFast = (data) => {
  let m3 = Number.MIN_SAFE_INTEGER;
  for (const datum of data) {
    m3 = Math.max(m3, datum);
  }
  return m3;
};
var totalFast = (data) => {
  let m3 = 0;
  for (const datum of data) {
    m3 += datum;
  }
  return m3;
};
var minFast = (data) => {
  let m3 = Number.MIN_SAFE_INTEGER;
  for (const datum of data) {
    m3 = Math.min(m3, datum);
  }
  return m3;
};

// ../numbers/src/average-weighted.ts
var averageWeighted = (data, weightings) => {
  if (typeof weightings === `function`) weightings = weight(data, weightings);
  const ww = zip(data, weightings);
  const [totalV, totalW] = ww.reduce(
    (accumulator, v) => [accumulator[0] + v[0] * v[1], accumulator[1] + v[1]],
    [0, 0]
  );
  return totalV / totalW;
};

// ../numbers/src/clamp.ts
var clamp = (value, min8 = 0, max9 = 1) => {
  if (Number.isNaN(value)) throw new Error(`Param 'value' is NaN`);
  if (Number.isNaN(min8)) throw new Error(`Param 'min' is NaN`);
  if (Number.isNaN(max9)) throw new Error(`Param 'max' is NaN`);
  if (value < min8) return min8;
  if (value > max9) return max9;
  return value;
};
var clamper = (min8 = 0, max9 = 1) => {
  if (Number.isNaN(min8)) throw new Error(`Param 'min' is NaN`);
  if (Number.isNaN(max9)) throw new Error(`Param 'max' is NaN`);
  return (v) => {
    if (v > max9) return max9;
    if (v < min8) return min8;
    return v;
  };
};
var clampIndex = (v, arrayOrLength) => {
  if (!Number.isInteger(v)) {
    throw new TypeError(`v parameter must be an integer (${v})`);
  }
  const length5 = Array.isArray(arrayOrLength) ? arrayOrLength.length : arrayOrLength;
  if (!Number.isInteger(length5)) {
    throw new TypeError(
      `length parameter must be an integer (${length5}, ${typeof length5})`
    );
  }
  v = Math.round(v);
  if (v < 0) return 0;
  if (v >= length5) return length5 - 1;
  return v;
};

// ../numbers/src/difference.ts
var differenceFromFixed = (initial, kind = `absolute`) => (value) => differenceFrom(kind, value, initial);
var differenceFromLast = (kind = `absolute`, initialValue = Number.NaN) => {
  let lastValue = initialValue;
  return (value) => {
    const x = differenceFrom(kind, value, lastValue);
    lastValue = value;
    return x;
  };
};
var differenceFrom = (kind = `absolute`, value, from2) => {
  if (Number.isNaN(from2)) {
    return 0;
  }
  const d2 = value - from2;
  let r = 0;
  if (kind === `absolute`) {
    r = Math.abs(d2);
  } else if (kind === `numerical`) {
    r = d2;
  } else if (kind === `relative`) {
    r = Math.abs(d2 / from2);
  } else if (kind === `relativeSigned`) {
    r = d2 / from2;
  } else throw new TypeError(`Unknown kind: '${kind}' Expected: 'absolute', 'relative', 'relativeSigned' or 'numerical'`);
  return r;
};

// ../numbers/src/guard.ts
var isValid = (possibleNumber) => {
  if (typeof possibleNumber !== `number`) return false;
  if (Number.isNaN(possibleNumber)) return false;
  return true;
};

// ../numbers/src/filter.ts
function* filterIterable(it) {
  for (const v of it) {
    if (isValid(v)) yield v;
  }
}
var thresholdAtLeast = (threshold) => {
  return (v) => {
    return v >= threshold;
  };
};
var rangeInclusive = (min8, max9) => {
  return (v) => {
    return v >= min8 && v <= max9;
  };
};

// ../numbers/src/flip.ts
var flip = (v) => {
  if (typeof v === `function`) v = v();
  throwNumberTest(v, `percentage`, `v`);
  return 1 - v;
};

// ../numbers/src/round.ts
function round2(a2, b2, roundUp) {
  throwIntegerTest(a2, `positive`, `decimalPlaces`);
  const up = typeof b2 === `boolean` ? b2 : roundUp ?? false;
  let rounder;
  if (a2 === 0) {
    rounder = Math.round;
  } else {
    const p2 = Math.pow(10, a2);
    if (up) {
      rounder = (v) => Math.ceil(v * p2) / p2;
    } else {
      rounder = (v) => Math.floor(v * p2) / p2;
    }
  }
  if (typeof b2 === `number`) return rounder(b2);
  return rounder;
}

// ../numbers/src/is-approx.ts
function isApprox(rangePercent, baseValue, v) {
  throwNumberTest(rangePercent, `percentage`, `rangePercent`);
  const range2 = Math.floor(rangePercent * 100);
  const test = (base, value) => {
    try {
      if (typeof value !== `number`) return false;
      if (Number.isNaN(value)) return false;
      if (!Number.isFinite(value)) return false;
      const diff = Math.abs(value - base);
      const relative2 = base === 0 ? Math.floor(diff * 100) : Math.floor(diff / base * 100);
      return relative2 <= range2;
    } catch {
      return false;
    }
  };
  if (baseValue === void 0) return test;
  throwNumberTest(baseValue, ``, `baseValue`);
  if (v === void 0) {
    return (value) => test(baseValue, value);
  } else {
    return test(baseValue, v);
  }
}
var isCloseTo = (a2, b2, precision = 3) => {
  const aa = a2.toPrecision(precision);
  const bb = b2.toPrecision(precision);
  if (aa !== bb) return [false, `A is not close enough to B. A: ${a2} B: ${b2} Precision: ${precision}`];
  else return [true];
};

// ../numbers/src/bipolar.ts
var bipolar_exports = {};
__export(bipolar_exports, {
  clamp: () => clamp2,
  fromScalar: () => fromScalar,
  immutable: () => immutable,
  scale: () => scale,
  scaleUnclamped: () => scaleUnclamped,
  toScalar: () => toScalar,
  towardZero: () => towardZero
});
var immutable = (startingValueOrBipolar = 0) => {
  if (typeof startingValueOrBipolar === `undefined`) throw new Error(`Start value is undefined`);
  const startingValue = typeof startingValueOrBipolar === `number` ? startingValueOrBipolar : startingValueOrBipolar.value;
  if (startingValue > 1) throw new Error(`Start value cannot be larger than 1`);
  if (startingValue < -1) throw new Error(`Start value cannot be smaller than -1`);
  if (Number.isNaN(startingValue)) throw new Error(`Start value is NaN`);
  const v = startingValue;
  return {
    [Symbol.toPrimitive](hint) {
      if (hint === `number`) return v;
      else if (hint === `string`) return v.toString();
      return true;
    },
    value: v,
    towardZero: (amt) => {
      return immutable(towardZero(v, amt));
    },
    add: (amt) => {
      return immutable(clamp2(v + amt));
    },
    multiply: (amt) => {
      return immutable(clamp2(v * amt));
    },
    inverse: () => {
      return immutable(-v);
    },
    interpolate: (amt, b2) => {
      return immutable(clamp2(interpolate2(amt, v, b2)));
    },
    asScalar: () => {
      return toScalar(v);
    }
  };
};
var toScalar = (bipolarValue) => {
  if (typeof bipolarValue !== `number`) throw new Error(`Expected v to be a number. Got: ${typeof bipolarValue}`);
  if (Number.isNaN(bipolarValue)) throw new Error(`Parameter is NaN`);
  return (bipolarValue + 1) / 2;
};
var fromScalar = (scalarValue) => {
  throwNumberTest(scalarValue, `percentage`, `v`);
  return scalarValue * 2 - 1;
};
var scale = (inputValue, inMin, inMax) => {
  return clamp2(scaler(inMin, inMax, -1, 1)(inputValue));
};
var scaleUnclamped = (inputValue, inMin, inMax) => {
  return scaler(inMin, inMax, -1, 1)(inputValue);
};
var clamp2 = (bipolarValue) => {
  if (typeof bipolarValue !== `number`) throw new Error(`Param 'bipolarValue' must be a number. Got: ${typeof bipolarValue}`);
  if (Number.isNaN(bipolarValue)) throw new Error(`Param 'bipolarValue' is NaN`);
  if (bipolarValue > 1) return 1;
  if (bipolarValue < -1) return -1;
  return bipolarValue;
};
var towardZero = (bipolarValue, amount) => {
  if (typeof bipolarValue !== `number`) throw new Error(`Parameter 'v' must be a number. Got: ${typeof bipolarValue}`);
  if (typeof amount !== `number`) throw new Error(`Parameter 'amt' must be a number. Got: ${typeof amount}`);
  if (amount < 0) throw new Error(`Parameter 'amt' must be positive`);
  if (bipolarValue < 0) {
    bipolarValue += amount;
    if (bipolarValue > 0) bipolarValue = 0;
  } else if (bipolarValue > 0) {
    bipolarValue -= amount;
    if (bipolarValue < 0) bipolarValue = 0;
  }
  return bipolarValue;
};

// ../numbers/src/wrap.ts
var wrapInteger = (v, min8 = 0, max9 = 360) => {
  throwIntegerTest(v, void 0, `v`);
  throwIntegerTest(min8, void 0, `min`);
  throwIntegerTest(max9, void 0, `max`);
  if (v === min8) return min8;
  if (v === max9) return min8;
  if (v > 0 && v < min8) v += min8;
  v -= min8;
  max9 -= min8;
  v = v % max9;
  if (v < 0) v = max9 - Math.abs(v) + min8;
  return v + min8;
};
var wrap = (v, min8 = 0, max9 = 1) => {
  throwNumberTest(v, ``, `min`);
  throwNumberTest(min8, ``, `min`);
  throwNumberTest(max9, ``, `max`);
  if (v === min8) return min8;
  if (v === max9) return min8;
  while (v <= min8 || v >= max9) {
    if (v === max9) break;
    if (v === min8) break;
    if (v > max9) {
      v = min8 + (v - max9);
    } else if (v < min8) {
      v = max9 - (min8 - v);
    }
  }
  return v;
};
var wrapRange = (min8, max9, fn, a2, b2) => {
  let r = 0;
  const distF = Math.abs(b2 - a2);
  const distFwrap = Math.abs(max9 - a2 + b2);
  const distBWrap = Math.abs(a2 + (360 - b2));
  const distMin = Math.min(distF, distFwrap, distBWrap);
  if (distMin === distBWrap) {
    r = a2 - fn(distMin);
  } else if (distMin === distFwrap) {
    r = a2 + fn(distMin);
  } else {
    if (a2 > b2) {
      r = a2 - fn(distMin);
    } else {
      r = a2 + fn(distMin);
    }
  }
  return wrapInteger(r, min8, max9);
};

// ../numbers/src/pi-pi.ts
var piPi = Math.PI * 2;

// ../numbers/src/interpolate.ts
function interpolate2(pos1, pos2, pos3, pos4) {
  let amountProcess;
  let limits = `clamp`;
  const handleAmount = (amount) => {
    if (amountProcess) amount = amountProcess(amount);
    if (limits === void 0 || limits === `clamp`) {
      amount = clamp(amount);
    } else if (limits === `wrap`) {
      if (amount > 1) amount = amount % 1;
      else if (amount < 0) {
        amount = 1 + amount % 1;
      }
    }
    return amount;
  };
  const doTheEase = (_amt, _a, _b) => {
    throwNumberTest(_a, ``, `a`);
    throwNumberTest(_b, ``, `b`);
    throwNumberTest(_amt, ``, `amount`);
    _amt = handleAmount(_amt);
    return (1 - _amt) * _a + _amt * _b;
  };
  const readOpts = (o = {}) => {
    if (o.transform) {
      if (typeof o.transform !== `function`) throw new Error(`Param 'transform' is expected to be a function. Got: ${typeof o.transform}`);
      amountProcess = o.transform;
    }
    limits = o.limits ?? `clamp`;
  };
  const rawEase = (_amt, _a, _b) => (1 - _amt) * _a + _amt * _b;
  if (typeof pos1 !== `number`) throw new TypeError(`First param is expected to be a number. Got: ${typeof pos1}`);
  if (typeof pos2 === `number`) {
    let a2;
    let b2;
    if (pos3 === void 0 || typeof pos3 === `object`) {
      a2 = pos1;
      b2 = pos2;
      readOpts(pos3);
      return (amount) => doTheEase(amount, a2, b2);
    } else if (typeof pos3 === `number`) {
      a2 = pos2;
      b2 = pos3;
      readOpts(pos4);
      return doTheEase(pos1, a2, b2);
    } else {
      throw new Error(`Values for 'a' and 'b' not defined`);
    }
  } else if (pos2 === void 0 || typeof pos2 === `object`) {
    const amount = handleAmount(pos1);
    readOpts(pos2);
    throwNumberTest(amount, ``, `amount`);
    return (aValue, bValue) => rawEase(amount, aValue, bValue);
  }
}
var interpolatorStepped = (incrementAmount, a2 = 0, b2 = 1, startInterpolationAt = 0, options) => {
  let amount = startInterpolationAt;
  return (retargetB, retargetA) => {
    if (retargetB !== void 0) b2 = retargetB;
    if (retargetA !== void 0) a2 = retargetA;
    if (amount >= 1) return b2;
    const value = interpolate2(amount, a2, b2, options);
    amount += incrementAmount;
    return value;
  };
};
var interpolateAngle = (amount, aRadians, bRadians, options) => {
  const t2 = wrap(bRadians - aRadians, 0, piPi);
  return interpolate2(amount, aRadians, aRadians + (t2 > Math.PI ? t2 - piPi : t2), options);
};

// ../numbers/src/linear-space.ts
function* linearSpace(start, end, steps2, precision) {
  throwNumberTest(start, ``, `start`);
  throwNumberTest(end, ``, `end`);
  throwNumberTest(steps2, ``, `steps`);
  const r = precision ? round2(precision) : (v) => v;
  const step = (end - start) / (steps2 - 1);
  throwNumberTest(step, ``, `step`);
  if (!Number.isFinite(step)) {
    throw new TypeError(`Calculated step value is infinite`);
  }
  for (let index = 0; index < steps2; index++) {
    const v = start + step * index;
    yield r(v);
  }
}

// ../numbers/src/util/queue-mutable.ts
var BasicQueueMutable = class {
  #store = [];
  enqueue(data) {
    this.#store.push(data);
  }
  dequeue() {
    return this.#store.shift();
  }
  get data() {
    return this.#store;
  }
  get size() {
    return this.#store.length;
  }
};

// ../numbers/src/moving-average.ts
var PiPi = Math.PI * 2;
var movingAverageLight = (scaling = 3) => {
  throwNumberTest(scaling, `aboveZero`, `scaling`);
  let average4 = 0;
  let count3 = 0;
  return (v) => {
    const r = numberTest(v, ``, `v`);
    if (r[0] && v !== void 0) {
      count3++;
      average4 = average4 + (v - average4) / Math.min(count3, scaling);
    }
    return average4;
  };
};
var movingAverage = (samples = 100, weighter) => {
  const q = new BasicQueueMutable();
  return (v) => {
    const r = numberTest(v);
    if (r[0] && v !== void 0) {
      q.enqueue(v);
      while (q.size > samples) {
        q.dequeue();
      }
    }
    return weighter === void 0 ? average(q.data) : averageWeighted(q.data, weighter);
  };
};
var smoothingFactor = (timeDelta, cutoff) => {
  const r = PiPi * cutoff * timeDelta;
  return r / (r + 1);
};
var exponentialSmoothing = (smoothingFactor2, value, previous) => {
  return smoothingFactor2 * value + (1 - smoothingFactor2) * previous;
};
var noiseFilter = (cutoffMin = 1, speedCoefficient = 0, cutoffDefault = 1) => {
  let previousValue = 0;
  let derivativeLast = 0;
  let timestampLast = 0;
  const compute = (value, timestamp) => {
    timestamp ??= performance.now();
    const timeDelta = timestamp - timestampLast;
    const s = smoothingFactor(timeDelta, cutoffDefault);
    const valueDelta = (value - previousValue) / timeDelta;
    const derivative = exponentialSmoothing(s, valueDelta, derivativeLast);
    const cutoff = cutoffMin + speedCoefficient * Math.abs(derivative);
    const a2 = smoothingFactor(timeDelta, cutoff);
    const smoothed = exponentialSmoothing(a2, value, previousValue);
    previousValue = smoothed;
    derivativeLast = derivative;
    timestampLast = timestamp;
    return smoothed;
  };
  return compute;
};

// ../numbers/src/scale.ts
var scale2 = (v, inMin, inMax, outMin, outMax, easing) => scaler(inMin, inMax, outMin, outMax, easing)(v);
var scaler = (inMin, inMax, outMin, outMax, easing, clamped) => {
  throwNumberTest(inMin, `finite`, `inMin`);
  throwNumberTest(inMax, `finite`, `inMax`);
  const oMax = outMax ?? 1;
  const oMin = outMin ?? 0;
  const clampFunction = clamped ? clamper(outMin, outMax) : void 0;
  return (v) => {
    if (inMin === inMax) return oMax;
    let a2 = (v - inMin) / (inMax - inMin);
    if (easing !== void 0) a2 = easing(a2);
    const x = a2 * (oMax - oMin) + oMin;
    if (clampFunction) return clampFunction(x);
    return x;
  };
};
var scalerNull = () => (v) => v;
var scaleClamped = (v, inMin, inMax, outMin, outMax, easing) => {
  if (outMax === void 0) outMax = 1;
  if (outMin === void 0) outMin = 0;
  if (inMin === inMax) return outMax;
  const x = scale2(v, inMin, inMax, outMin, outMax, easing);
  return clamp(x, outMin, outMax);
};
var scalePercentages = (percentage, outMin, outMax = 1) => {
  throwNumberTest(percentage, `percentage`, `v`);
  throwNumberTest(outMin, `percentage`, `outMin`);
  throwNumberTest(outMax, `percentage`, `outMax`);
  return scale2(percentage, 0, 1, outMin, outMax);
};
var scalePercent = (v, outMin, outMax) => scalerPercent(outMin, outMax)(v);
var scalerPercent = (outMin, outMax) => {
  return (v) => {
    throwNumberTest(v, `percentage`, `v`);
    return scale2(v, 0, 1, outMin, outMax);
  };
};
var scalerTwoWay = (inMin, inMax, outMin = 0, outMax = 1, clamped = false, easing) => {
  const toOut = scaler(inMin, inMax, outMin, outMax, easing, clamped);
  const toIn = scaler(outMin, outMax, inMin, inMax, easing, clamped);
  return { out: toOut, in: toIn };
};

// ../numbers/src/number-array-compute.ts
var numberArrayCompute = (data, opts = {}) => {
  if (data.length === 0) {
    return {
      total: Number.NaN,
      min: Number.NaN,
      max: Number.NaN,
      avg: Number.NaN,
      count: Number.NaN
    };
  }
  const nonNumbers = opts.nonNumbers ?? `throw`;
  let total2 = 0;
  let min8 = Number.MAX_SAFE_INTEGER;
  let max9 = Number.MIN_SAFE_INTEGER;
  let count3 = 0;
  for (let index = 0; index < data.length; index++) {
    let value = data[index];
    if (typeof value !== `number`) {
      if (nonNumbers === `ignore`) continue;
      if (nonNumbers === `throw`) throw new Error(`Param 'data' contains a non-number at index: ${index.toString()}`);
      if (nonNumbers === `nan`) value = Number.NaN;
    }
    if (Number.isNaN(value)) continue;
    min8 = Math.min(min8, value);
    max9 = Math.max(max9, value);
    total2 += value;
    count3++;
  }
  return {
    total: total2,
    max: max9,
    min: min8,
    count: count3,
    avg: total2 / count3
  };
};

// ../numbers/src/normalise.ts
var stream = (minDefault, maxDefault) => {
  let min8 = minDefault ?? Number.MAX_SAFE_INTEGER;
  let max9 = maxDefault ?? Number.MIN_SAFE_INTEGER;
  throwNumberTest(min8);
  throwNumberTest(max9);
  return (v) => {
    throwNumberTest(v);
    min8 = Math.min(min8, v);
    max9 = Math.max(max9, v);
    return scale2(v, min8, max9);
  };
};
var array = (values2, minForced, maxForced) => {
  if (!Array.isArray(values2)) {
    throw new TypeError(`Param 'values' should be an array. Got: ${typeof values2}`);
  }
  const mma = numberArrayCompute(values2);
  const min8 = minForced ?? mma.min;
  const max9 = maxForced ?? mma.max;
  return values2.map((v) => clamp(scale2(v, min8, max9)));
};

// ../numbers/src/proportion.ts
var proportion = (v, t2) => {
  if (typeof v === `function`) v = v();
  if (typeof t2 === `function`) t2 = t2();
  throwNumberTest(v, `percentage`, `v`);
  throwNumberTest(t2, `percentage`, `t`);
  return v * t2;
};

// ../numbers/src/quantise.ts
var quantiseEvery = (v, every3, middleRoundsUp = true) => {
  const everyString = every3.toString();
  const decimal = everyString.indexOf(`.`);
  let multiplier = 1;
  if (decimal >= 0) {
    const d2 = everyString.substring(decimal + 1).length;
    multiplier = 10 * d2;
    every3 = Math.floor(multiplier * every3);
    v = v * multiplier;
  }
  throwNumberTest(v, ``, `v`);
  throwIntegerTest(every3, ``, `every`);
  let div = v / every3;
  const divModule = div % 1;
  div = Math.floor(div);
  if (divModule === 0.5 && middleRoundsUp || divModule > 0.5) div++;
  const vv = every3 * div / multiplier;
  return vv;
};

// ../numbers/src/softmax.ts
var softmax = (logits) => {
  const maxLogit = logits.reduce((a2, b2) => Math.max(a2, b2), Number.NEGATIVE_INFINITY);
  const scores = logits.map((l) => Math.exp(l - maxLogit));
  const denom = scores.reduce((a2, b2) => a2 + b2);
  return scores.map((s) => s / denom);
};

// ../geometry/src/point/get-point-parameter.ts
function getTwoPointParameters(a1, ab2, ab3, ab4, ab5, ab6) {
  if (isPoint3d(a1) && isPoint3d(ab2)) return [a1, ab2];
  if (isPoint(a1) && isPoint(ab2)) return [a1, ab2];
  if (isPoint3d(a1)) {
    const b3 = {
      x: ab2,
      y: ab3,
      z: ab4
    };
    if (!isPoint3d(b3)) throw new Error(`Expected x, y & z parameters`);
    return [a1, b3];
  }
  if (isPoint(a1)) {
    const b3 = {
      x: ab2,
      y: ab3
    };
    if (!isPoint(b3)) throw new Error(`Expected x & y parameters`);
    return [a1, b3];
  }
  if (typeof ab5 !== `undefined` && typeof ab4 !== `undefined`) {
    const a3 = {
      x: a1,
      y: ab2,
      z: ab3
    };
    const b3 = {
      x: ab4,
      y: ab5,
      z: ab6
    };
    if (!isPoint3d(a3)) throw new Error(`Expected x,y,z for first point`);
    if (!isPoint3d(b3)) throw new Error(`Expected x,y,z for second point`);
    return [a3, b3];
  }
  const a2 = {
    x: a1,
    y: ab2
  };
  const b2 = {
    x: ab3,
    y: ab4
  };
  if (!isPoint(a2)) throw new Error(`Expected x,y for first point`);
  if (!isPoint(b2)) throw new Error(`Expected x,y for second point`);
  return [a2, b2];
}
function getPointParameter2(a2, b2, c4) {
  if (a2 === void 0) return { x: 0, y: 0 };
  if (Array.isArray(a2)) {
    if (a2.length === 0) return Object.freeze({ x: 0, y: 0 });
    if (a2.length === 1) return Object.freeze({ x: a2[0], y: 0 });
    if (a2.length === 2) return Object.freeze({ x: a2[0], y: a2[1] });
    if (a2.length === 3) return Object.freeze({ x: a2[0], y: a2[1], z: a2[2] });
    throw new Error(
      `Expected array to be 1-3 elements in length. Got ${a2.length}.`
    );
  }
  if (isPoint(a2)) {
    return a2;
  } else if (typeof a2 !== `number` || typeof b2 !== `number`) {
    throw new TypeError(
      `Expected point or x,y as parameters. Got: a: ${JSON.stringify(
        a2
      )} b: ${JSON.stringify(b2)}`
    );
  }
  if (typeof c4 === `number`) {
    return Object.freeze({ x: a2, y: b2, z: c4 });
  }
  return Object.freeze({ x: a2, y: b2 });
}

// ../geometry/src/point/distance.ts
function distance(a2, xOrB, y, z) {
  const pt = getPointParameter2(xOrB, y, z);
  guard(pt, `b`);
  guard(a2, `a`);
  return isPoint3d(pt) && isPoint3d(a2) ? Math.hypot(pt.x - a2.x, pt.y - a2.y, pt.z - a2.z) : Math.hypot(pt.x - a2.x, pt.y - a2.y);
}

// ../geometry/src/line/nearest.ts
var nearest = (line4, point2) => {
  const n2 = (line5) => {
    const { a: a2, b: b2 } = line5;
    const atob = { x: b2.x - a2.x, y: b2.y - a2.y };
    const atop = { x: point2.x - a2.x, y: point2.y - a2.y };
    const length5 = atob.x * atob.x + atob.y * atob.y;
    let dot2 = atop.x * atob.x + atop.y * atob.y;
    const t2 = Math.min(1, Math.max(0, dot2 / length5));
    dot2 = (b2.x - a2.x) * (point2.y - a2.y) - (b2.y - a2.y) * (point2.x - a2.x);
    return { x: a2.x + atob.x * t2, y: a2.y + atob.y * t2 };
  };
  if (Array.isArray(line4)) {
    const pts = line4.map((l) => n2(l));
    const dists = pts.map((p2) => distance(p2, point2));
    return Object.freeze(pts[minIndex(...dists)]);
  } else {
    return Object.freeze(n2(line4));
  }
};

// ../geometry/src/line/distance-single-line.ts
var distanceSingleLine = (line4, point2) => {
  guard2(line4, `line`);
  guard(point2, `point`);
  if (length(line4) === 0) {
    return length(line4.a, point2);
  }
  const near = nearest(line4, point2);
  return length(near, point2);
};

// ../geometry/src/point/find-minimum.ts
function findMinimum(comparer, ...points) {
  if (points.length === 0) throw new Error(`No points provided`);
  let min8 = points[0];
  for (const p2 of points) {
    if (isPoint3d(min8) && isPoint3d(p2)) {
      min8 = comparer(min8, p2);
    } else {
      min8 = comparer(min8, p2);
    }
  }
  return min8;
}

// ../geometry/src/rect/max.ts
var maxFromCorners = (topLeft, topRight, bottomRight, bottomLeft) => {
  if (topLeft.y > bottomRight.y) {
    throw new Error(`topLeft.y greater than bottomRight.y`);
  }
  if (topLeft.y > bottomLeft.y) {
    throw new Error(`topLeft.y greater than bottomLeft.y`);
  }
  const w1 = topRight.x - topLeft.x;
  const w2 = bottomRight.x - bottomLeft.x;
  const h1 = Math.abs(bottomLeft.y - topLeft.y);
  const h2 = Math.abs(bottomRight.y - topRight.y);
  return {
    x: Math.min(topLeft.x, bottomLeft.x),
    y: Math.min(topRight.y, topLeft.y),
    width: Math.max(w1, w2),
    height: Math.max(h1, h2)
  };
};

// ../geometry/src/point/bbox.ts
var bbox = (...points) => {
  const leftMost = findMinimum((a2, b2) => {
    return a2.x < b2.x ? a2 : b2;
  }, ...points);
  const rightMost = findMinimum((a2, b2) => {
    return a2.x > b2.x ? a2 : b2;
  }, ...points);
  const topMost = findMinimum((a2, b2) => {
    return a2.y < b2.y ? a2 : b2;
  }, ...points);
  const bottomMost = findMinimum((a2, b2) => {
    return a2.y > b2.y ? a2 : b2;
  }, ...points);
  const topLeft = { x: leftMost.x, y: topMost.y };
  const topRight = { x: rightMost.x, y: topMost.y };
  const bottomRight = { x: rightMost.x, y: bottomMost.y };
  const bottomLeft = { x: leftMost.x, y: bottomMost.y };
  return maxFromCorners(topLeft, topRight, bottomRight, bottomLeft);
};
var bbox3d = (...points) => {
  const box = bbox(...points);
  const zMin = findMinimum((a2, b2) => {
    return a2.z < b2.z ? a2 : b2;
  }, ...points);
  const zMax = findMinimum((a2, b2) => {
    return a2.z > b2.z ? a2 : b2;
  }, ...points);
  return {
    ...box,
    z: zMin.z,
    depth: zMax.z - zMin.z
  };
};

// ../geometry/src/line/bbox.ts
var bbox2 = (line4) => bbox(line4.a, line4.b);

// ../geometry/src/point/divider.ts
function divide(a1, ab2, ab3, ab4, ab5, ab6) {
  const [ptA, ptB] = getTwoPointParameters(a1, ab2, ab3, ab4, ab5, ab6);
  guard(ptA, `a`);
  guard(ptB, `b`);
  if (ptB.x === 0) throw new TypeError("Cannot divide by zero (b.x is 0)");
  if (ptB.y === 0) throw new TypeError("Cannot divide by zero (b.y is 0)");
  const pt = {
    x: ptA.x / ptB.x,
    y: ptA.y / ptB.y
  };
  if (isPoint3d(ptA) || isPoint3d(ptB)) {
    if (ptB.z === 0) throw new TypeError("Cannot divide by zero (b.z is 0)");
    pt.z = (ptA.z ?? 0) / (ptB.z ?? 0);
  }
  ;
  return Object.freeze(pt);
}
function divider(a2, b2, c4) {
  const divisor = getPointParameter2(a2, b2, c4);
  guardNonZeroPoint(divisor, `divisor`);
  return (aa, bb, cc) => {
    const dividend = getPointParameter2(aa, bb, cc);
    return typeof dividend.z === `undefined` ? Object.freeze({
      x: dividend.x / divisor.x,
      y: dividend.y / divisor.y
    }) : Object.freeze({
      x: dividend.x / divisor.x,
      y: dividend.y / divisor.y,
      z: dividend.z / (divisor.z ?? 1)
    });
  };
}

// ../geometry/src/line/divide.ts
var divide2 = (line4, point2) => Object.freeze({
  ...line4,
  a: divide(line4.a, point2),
  b: divide(line4.b, point2)
});

// ../geometry/src/line/from-numbers.ts
var fromNumbers = (x1, y1, x2, y2) => {
  if (Number.isNaN(x1)) throw new Error(`x1 is NaN`);
  if (Number.isNaN(x2)) throw new Error(`x2 is NaN`);
  if (Number.isNaN(y1)) throw new Error(`y1 is NaN`);
  if (Number.isNaN(y2)) throw new Error(`y2 is NaN`);
  const a2 = { x: x1, y: y1 };
  const b2 = { x: x2, y: y2 };
  return fromPoints(a2, b2);
};

// ../geometry/src/line/from-flat-array.ts
var fromFlatArray = (array3) => {
  if (!Array.isArray(array3)) throw new Error(`arr parameter is not an array`);
  if (array3.length !== 4) throw new Error(`array is expected to have length four`);
  return fromNumbers(array3[0], array3[1], array3[2], array3[3]);
};

// ../geometry/src/polar/index.ts
var polar_exports = {};
__export(polar_exports, {
  Ray: () => ray_exports,
  clampMagnitude: () => clampMagnitude,
  divide: () => divide3,
  dotProduct: () => dotProduct2,
  fromCartesian: () => fromCartesian,
  guard: () => guard4,
  invert: () => invert,
  isAntiParallel: () => isAntiParallel,
  isOpposite: () => isOpposite,
  isParallel: () => isParallel,
  isPolarCoord: () => isPolarCoord,
  multiply: () => multiply,
  normalise: () => normalise,
  rotate: () => rotate,
  rotateDegrees: () => rotateDegrees,
  spiral: () => spiral,
  spiralRaw: () => spiralRaw,
  toCartesian: () => toCartesian,
  toPoint: () => toPoint,
  toString: () => toString
});

// ../geometry/src/polar/guard.ts
var isPolarCoord = (p2) => {
  if (p2.distance === void 0) return false;
  if (p2.angleRadian === void 0) return false;
  return true;
};
var guard4 = (p2, name = `Point`) => {
  if (p2 === void 0) {
    throw new Error(
      `'${name}' is undefined. Expected {distance, angleRadian} got ${JSON.stringify(
        p2
      )}`
    );
  }
  if (p2 === null) {
    throw new Error(
      `'${name}' is null. Expected {distance, angleRadian} got ${JSON.stringify(
        p2
      )}`
    );
  }
  if (p2.angleRadian === void 0) {
    throw new Error(
      `'${name}.angleRadian' is undefined. Expected {distance, angleRadian} got ${JSON.stringify(
        p2
      )}`
    );
  }
  if (p2.distance === void 0) {
    throw new Error(
      `'${name}.distance' is undefined. Expected {distance, angleRadian} got ${JSON.stringify(
        p2
      )}`
    );
  }
  if (typeof p2.angleRadian !== `number`) {
    throw new TypeError(
      `'${name}.angleRadian' must be a number. Got ${p2.angleRadian}`
    );
  }
  if (typeof p2.distance !== `number`) {
    throw new TypeError(`'${name}.distance' must be a number. Got ${p2.distance}`);
  }
  if (p2.angleRadian === null) throw new Error(`'${name}.angleRadian' is null`);
  if (p2.distance === null) throw new Error(`'${name}.distance' is null`);
  if (Number.isNaN(p2.angleRadian)) {
    throw new TypeError(`'${name}.angleRadian' is NaN`);
  }
  if (Number.isNaN(p2.distance)) throw new Error(`'${name}.distance' is NaN`);
};

// ../geometry/src/pi.ts
var piPi2 = Math.PI * 2;

// ../geometry/src/angles.ts
function degreeToRadian(angleInDegrees) {
  return Array.isArray(angleInDegrees) ? angleInDegrees.map((v) => v * (Math.PI / 180)) : angleInDegrees * (Math.PI / 180);
}
function radianInvert(angleInRadians) {
  return (angleInRadians + Math.PI) % (2 * Math.PI);
}
function radianToDegree(angleInRadians) {
  return Array.isArray(angleInRadians) ? angleInRadians.map((v) => v * 180 / Math.PI) : angleInRadians * 180 / Math.PI;
}
var radiansFromAxisX = (point2) => Math.atan2(point2.x, point2.y);
var radiansSum = (start, amount, clockwise = true) => {
  if (clockwise) {
    let x = start + amount;
    if (x >= piPi2) x = x % piPi2;
    return x;
  } else {
    const x = start - amount;
    if (x < 0) {
      return piPi2 + x;
    }
    return x;
  }
};
var degreesSum = (start, amount, clockwise = true) => radianToDegree(radiansSum(degreeToRadian(start), degreeToRadian(amount), clockwise));
var radianArc = (start, end, clockwise = true) => {
  let s = start;
  if (end < s) {
    s = 0;
    end = piPi2 - start + end;
  }
  let d2 = end - s;
  if (clockwise) d2 = piPi2 - d2;
  if (d2 >= piPi2) return d2 % piPi2;
  return d2;
};
var degreeArc = (start, end, clockwise = true) => radianToDegree(radianArc(degreeToRadian(start), degreeToRadian(end), clockwise));

// ../geometry/src/polar/angles.ts
var rotate = (c4, amountRadian) => Object.freeze({
  ...c4,
  angleRadian: c4.angleRadian + amountRadian
});
var invert = (p2) => {
  guard4(p2, `c`);
  return Object.freeze({
    ...p2,
    angleRadian: p2.angleRadian - Math.PI
  });
};
var isOpposite = (a2, b2) => {
  guard4(a2, `a`);
  guard4(b2, `b`);
  if (a2.distance !== b2.distance) return false;
  return a2.angleRadian === -b2.angleRadian;
};
var isParallel = (a2, b2) => {
  guard4(a2, `a`);
  guard4(b2, `b`);
  return a2.angleRadian === b2.angleRadian;
};
var isAntiParallel = (a2, b2) => {
  guard4(a2, `a`);
  guard4(b2, `b`);
  return a2.angleRadian === -b2.angleRadian;
};
var rotateDegrees = (c4, amountDeg) => Object.freeze({
  ...c4,
  angleRadian: c4.angleRadian + degreeToRadian(amountDeg)
});

// ../geometry/src/point/subtract.ts
function subtract(a1, ab2, ab3, ab4, ab5, ab6) {
  const [ptA, ptB] = getTwoPointParameters(a1, ab2, ab3, ab4, ab5, ab6);
  guard(ptA, `a`);
  guard(ptB, `b`);
  const pt = {
    x: ptA.x - ptB.x,
    y: ptA.y - ptB.y
  };
  if (isPoint3d(ptA) || isPoint3d(ptB)) {
    pt.z = (ptA.z ?? 0) - (ptB.z ?? 0);
  }
  ;
  return Object.freeze(pt);
}

// ../geometry/src/point/empty.ts
var Empty = { x: 0, y: 0 };
var Unit = { x: 1, y: 1 };
var Empty3d = { x: 0, y: 0, z: 0 };
var Unit3d = { x: 1, y: 1, z: 1 };

// ../geometry/src/polar/conversions.ts
var toCartesian = (a2, b2, c4) => {
  if (isPolarCoord(a2)) {
    if (b2 === void 0) b2 = Empty;
    if (isPoint(b2)) {
      return polarToCartesian(a2.distance, a2.angleRadian, b2);
    }
    throw new Error(
      `Expecting (Coord, Point). Second parameter is not a point`
    );
  } else if (typeof a2 === `object`) {
    throw new TypeError(
      `First param is an object, but not a Coord: ${JSON.stringify(a2)}`
    );
  } else {
    if (typeof a2 === `number` && typeof b2 === `number`) {
      if (c4 === void 0) c4 = Empty;
      if (!isPoint(c4)) {
        throw new Error(
          `Expecting (number, number, Point). Point param wrong type`
        );
      }
      return polarToCartesian(a2, b2, c4);
    } else {
      throw new TypeError(
        `Expecting parameters of (number, number). Got: (${typeof a2}, ${typeof b2}, ${typeof c4}). a: ${JSON.stringify(
          a2
        )}`
      );
    }
  }
};
var fromCartesian = (point2, origin) => {
  point2 = subtract(point2, origin);
  const angle = Math.atan2(point2.y, point2.x);
  return Object.freeze({
    ...point2,
    angleRadian: angle,
    distance: Math.hypot(point2.x, point2.y)
  });
};
var polarToCartesian = (distance5, angleRadians, origin = Empty) => {
  guard(origin);
  return Object.freeze({
    x: origin.x + distance5 * Math.cos(angleRadians),
    y: origin.y + distance5 * Math.sin(angleRadians)
  });
};
var toString = (p2, digits) => {
  if (p2 === void 0) return `(undefined)`;
  if (p2 === null) return `(null)`;
  const angleDeg = radianToDegree(p2.angleRadian);
  const d2 = digits ? p2.distance.toFixed(digits) : p2.distance;
  const a2 = digits ? angleDeg.toFixed(digits) : angleDeg;
  return `(${d2},${a2})`;
};
var toPoint = (v, origin = Empty) => {
  guard4(v, `v`);
  return Object.freeze({
    x: origin.x + v.distance * Math.cos(v.angleRadian),
    y: origin.y + v.distance * Math.sin(v.angleRadian)
  });
};

// ../geometry/src/polar/math.ts
var normalise = (c4) => {
  if (c4.distance === 0) throw new Error(`Cannot normalise vector of length 0`);
  return Object.freeze({
    ...c4,
    distance: 1
  });
};
var clampMagnitude = (v, max9 = 1, min8 = 0) => {
  let mag = v.distance;
  if (mag > max9) mag = max9;
  if (mag < min8) mag = min8;
  return Object.freeze({
    ...v,
    distance: mag
  });
};
var dotProduct2 = (a2, b2) => {
  guard4(a2, `a`);
  guard4(b2, `b`);
  return a2.distance * b2.distance * Math.cos(b2.angleRadian - a2.angleRadian);
};
var multiply = (v, amt) => {
  guard4(v);
  throwNumberTest(amt, ``, `amt`);
  return Object.freeze({
    ...v,
    distance: v.distance * amt
  });
};
var divide3 = (v, amt) => {
  guard4(v);
  throwNumberTest(amt, ``, `amt`);
  return Object.freeze({
    ...v,
    distance: v.distance / amt
  });
};

// ../geometry/src/polar/ray.ts
var ray_exports = {};
__export(ray_exports, {
  fromLine: () => fromLine,
  toCartesian: () => toCartesian2,
  toString: () => toString2
});

// ../geometry/src/point/point-type.ts
var Placeholder = Object.freeze({ x: Number.NaN, y: Number.NaN });
var Placeholder3d = Object.freeze({ x: Number.NaN, y: Number.NaN, z: Number.NaN });

// ../geometry/src/point/angle.ts
var angleRadian = (a2, b2, c4) => {
  guard(a2, `a`);
  if (b2 === void 0) {
    return Math.atan2(a2.y, a2.x);
  }
  guard(b2, `b`);
  if (c4 === void 0) {
    return Math.atan2(b2.y - a2.y, b2.x - a2.x);
  }
  guard(c4, `c`);
  return Math.atan2(b2.y - a2.y, b2.x - a2.x) - Math.atan2(c4.y - a2.y, c4.x - a2.x);
};
var angleRadianCircle = (a2, b2, c4) => {
  const angle = angleRadian(a2, b2, c4);
  if (angle < 0) return angle + piPi2;
  return angle;
};

// ../geometry/src/polar/ray.ts
var toCartesian2 = (ray, origin) => {
  const o = getOrigin(ray, origin);
  const a2 = toCartesian(ray.offset, ray.angleRadian, o);
  const b2 = toCartesian(ray.offset + ray.length, ray.angleRadian, o);
  return { a: a2, b: b2 };
};
var getOrigin = (ray, origin) => {
  if (origin !== void 0) return origin;
  if (ray.origin !== void 0) return ray.origin;
  return { x: 0, y: 0 };
};
var toString2 = (ray) => {
  return `PolarRay(angle: ${ray.angleRadian} offset: ${ray.offset} len: ${ray.length})`;
};
var fromLine = (line4, origin) => {
  const o = origin ?? line4.a;
  return {
    angleRadian: angleRadian(line4.b, o),
    offset: distance(line4.a, o),
    length: distance(line4.b, line4.a),
    origin: o
  };
};

// ../geometry/src/polar/spiral.ts
function* spiral(smoothness, zoom) {
  let step = 0;
  while (true) {
    const a2 = smoothness * step++;
    yield {
      distance: zoom * a2,
      angleRadian: a2,
      step
    };
  }
}
var spiralRaw = (step, smoothness, zoom) => {
  const a2 = smoothness * step;
  return Object.freeze({
    distance: zoom * a2,
    angleRadian: a2
  });
};

// ../geometry/src/line/from-pivot.ts
var fromPivot = (origin = { x: 0.5, y: 0.5 }, length5 = 1, angleRadian3 = 0, balance = 0.5) => {
  const left = length5 * balance;
  const right = length5 * (1 - balance);
  const a2 = toCartesian(left, radianInvert(angleRadian3), origin);
  const b2 = toCartesian(right, angleRadian3, origin);
  return Object.freeze({
    a: a2,
    b: b2
  });
};

// ../geometry/src/line/from-points-to-path.ts
var fromPointsToPath = (a2, b2) => toPath(fromPoints(a2, b2));

// ../geometry/src/point/is-equal.ts
var isEqual2 = (...p2) => {
  if (p2 === void 0) throw new Error(`parameter 'p' is undefined`);
  if (p2.length < 2) return true;
  for (let index = 1; index < p2.length; index++) {
    if (p2[index].x !== p2[0].x) return false;
    if (p2[index].y !== p2[0].y) return false;
  }
  return true;
};

// ../geometry/src/line/is-equal.ts
var isEqual3 = (a2, b2) => isEqual2(a2.a, b2.a) && isEqual2(a2.b, b2.b);

// ../geometry/src/point/index.ts
var point_exports = {};
__export(point_exports, {
  Empty: () => Empty,
  Empty3d: () => Empty3d,
  Placeholder: () => Placeholder,
  Placeholder3d: () => Placeholder3d,
  PointTracker: () => PointTracker,
  PointsTracker: () => PointsTracker,
  Unit: () => Unit,
  Unit3d: () => Unit3d,
  abs: () => abs,
  angleRadian: () => angleRadian,
  angleRadianCircle: () => angleRadianCircle,
  apply: () => apply,
  averager: () => averager,
  bbox: () => bbox,
  bbox3d: () => bbox3d,
  centroid: () => centroid,
  clamp: () => clamp3,
  clampMagnitude: () => clampMagnitude2,
  compare: () => compare,
  compareByX: () => compareByX,
  compareByY: () => compareByY,
  compareByZ: () => compareByZ,
  convexHull: () => convexHull,
  distance: () => distance,
  distanceToCenter: () => distanceToCenter,
  distanceToExterior: () => distanceToExterior,
  divide: () => divide,
  divider: () => divider,
  dotProduct: () => dotProduct3,
  findMinimum: () => findMinimum,
  from: () => from,
  fromNumbers: () => fromNumbers2,
  fromString: () => fromString,
  getPointParameter: () => getPointParameter2,
  getTwoPointParameters: () => getTwoPointParameters,
  guard: () => guard,
  guardNonZeroPoint: () => guardNonZeroPoint,
  interpolate: () => interpolate3,
  invert: () => invert2,
  isEmpty: () => isEmpty,
  isEqual: () => isEqual2,
  isNaN: () => isNaN2,
  isNull: () => isNull,
  isPlaceholder: () => isPlaceholder,
  isPoint: () => isPoint,
  isPoint3d: () => isPoint3d,
  leftmost: () => leftmost,
  multiply: () => multiply2,
  multiplyScalar: () => multiplyScalar,
  normalise: () => normalise2,
  normaliseByRect: () => normaliseByRect,
  pipeline: () => pipeline,
  pipelineApply: () => pipelineApply,
  progressBetween: () => progressBetween,
  project: () => project,
  quantiseEvery: () => quantiseEvery2,
  random: () => random,
  random3d: () => random3d,
  reduce: () => reduce,
  relation: () => relation,
  rightmost: () => rightmost,
  rotate: () => rotate2,
  rotatePointArray: () => rotatePointArray,
  round: () => round3,
  subtract: () => subtract,
  sum: () => sum,
  to2d: () => to2d,
  to3d: () => to3d,
  toArray: () => toArray,
  toIntegerValues: () => toIntegerValues,
  toString: () => toString3,
  track: () => track,
  trackPoints: () => trackPoints,
  withinRange: () => withinRange,
  wrap: () => wrap2
});

// ../geometry/src/point/abs.ts
function abs(pt) {
  if (isPoint3d(pt)) {
    return Object.freeze({
      ...pt,
      x: Math.abs(pt.x),
      y: Math.abs(pt.y),
      z: Math.abs(pt.z)
    });
  } else if (isPoint(pt)) {
    return Object.freeze({
      ...pt,
      x: Math.abs(pt.x),
      y: Math.abs(pt.y)
    });
  } else throw new TypeError(`Param 'pt' is not a point`);
}

// ../geometry/src/point/apply.ts
function apply(pt, fn) {
  guard(pt, `pt`);
  if (isPoint3d(pt)) {
    return Object.freeze({
      ...pt,
      x: fn(pt.x, `x`),
      y: fn(pt.y, `y`),
      z: fn(pt.z, `z`)
    });
  }
  return Object.freeze({
    ...pt,
    x: fn(pt.x, `x`),
    y: fn(pt.y, `y`)
  });
}

// ../geometry/src/point/averager.ts
function averager(kind, opts) {
  let x;
  let y;
  let z;
  switch (kind) {
    case `moving-average-light`:
      const scaling = opts.scaling ?? 3;
      x = movingAverageLight(scaling);
      y = movingAverageLight(scaling);
      z = movingAverageLight(scaling);
      break;
    default:
      throw new Error(`Unknown averaging kind '${kind}'. Expected: 'moving-average-light'`);
  }
  return (point2) => {
    const ax = x(point2.x);
    const ay = y(point2.y);
    if (isPoint3d(point2)) {
      const az = z(point2.z);
      return Object.freeze({
        x: ax,
        y: ay,
        z: az
      });
    } else {
      return Object.freeze({
        x: ax,
        y: ay
      });
    }
  };
}

// ../geometry/src/point/centroid.ts
var centroid = (...points) => {
  if (!Array.isArray(points)) throw new Error(`Expected list of points`);
  const sum7 = points.reduce(
    (previous, p2) => {
      if (p2 === void 0) return previous;
      if (Array.isArray(p2)) {
        throw new TypeError(
          `'points' list contains an array. Did you mean: centroid(...myPoints)?`
        );
      }
      if (!isPoint(p2)) {
        throw new Error(
          `'points' contains something which is not a point: ${JSON.stringify(
            p2
          )}`
        );
      }
      return {
        x: previous.x + p2.x,
        y: previous.y + p2.y
      };
    },
    { x: 0, y: 0 }
  );
  return Object.freeze({
    x: sum7.x / points.length,
    y: sum7.y / points.length
  });
};

// ../geometry/src/point/clamp.ts
function clamp3(a2, min8 = 0, max9 = 1) {
  if (isPoint3d(a2)) {
    return Object.freeze({
      x: clamp(a2.x, min8, max9),
      y: clamp(a2.y, min8, max9),
      z: clamp(a2.z, min8, max9)
    });
  } else {
    return Object.freeze({
      x: clamp(a2.x, min8, max9),
      y: clamp(a2.y, min8, max9)
    });
  }
}

// ../geometry/src/point/compare.ts
var compare = (a2, b2) => {
  if (a2.x < b2.x && a2.y < b2.y) return -2;
  if (a2.x > b2.x && a2.y > b2.y) return 2;
  if (a2.x < b2.x || a2.y < b2.y) return -1;
  if (a2.x > b2.x || a2.y > b2.y) return 1;
  if (a2.x === b2.x && a2.x === b2.y) return 0;
  return Number.NaN;
};
var compareByX = (a2, b2) => {
  if (a2.x === b2.x) return 0;
  if (a2.x < b2.x) return -1;
  return 1;
};
var compareByY = (a2, b2) => {
  if (a2.y === b2.y) return 0;
  if (a2.y < b2.y) return -1;
  return 1;
};
var compareByZ = (a2, b2) => {
  if (a2.z === b2.z) return 0;
  if (a2.z < b2.z) return -1;
  return 1;
};

// ../geometry/src/point/convex-hull.ts
var convexHull = (...pts) => {
  const sorted = [...pts].sort(compareByX);
  if (sorted.length === 1) return sorted;
  const x = (points) => {
    const v = [];
    for (const p2 of points) {
      while (v.length >= 2) {
        const q = v.at(-1);
        const r = v.at(-2);
        if ((q.x - r.x) * (p2.y - r.y) >= (q.y - r.y) * (p2.x - r.x)) {
          v.pop();
        } else break;
      }
      v.push(p2);
    }
    v.pop();
    return v;
  };
  const upper = x(sorted);
  const lower = x(sorted.reverse());
  if (upper.length === 1 && lower.length === 1 && isEqual2(lower[0], upper[0])) {
    return upper;
  }
  return [...upper, ...lower];
};

// ../geometry/src/circle/guard.ts
var guard5 = (circle3, parameterName = `circle`) => {
  if (isCirclePositioned(circle3)) {
    guard(circle3, `circle`);
  }
  if (Number.isNaN(circle3.radius)) throw new Error(`${parameterName}.radius is NaN`);
  if (circle3.radius <= 0) throw new Error(`${parameterName}.radius must be greater than zero`);
};
var guardPositioned2 = (circle3, parameterName = `circle`) => {
  if (!isCirclePositioned(circle3)) throw new Error(`Expected a positioned circle with x,y`);
  guard5(circle3, parameterName);
};
var isNaN3 = (a2) => {
  if (Number.isNaN(a2.radius)) return true;
  if (isCirclePositioned(a2)) {
    if (Number.isNaN(a2.x)) return true;
    if (Number.isNaN(a2.y)) return true;
  }
  return false;
};
var isPositioned2 = (p2) => p2.x !== void 0 && p2.y !== void 0;
var isCircle = (p2) => p2.radius !== void 0;
var isCirclePositioned = (p2) => isCircle(p2) && isPositioned2(p2);

// ../geometry/src/circle/distance-center.ts
var distanceCenter = (a2, b2) => {
  guardPositioned2(a2, `a`);
  if (isCirclePositioned(b2)) {
    guardPositioned2(b2, `b`);
  }
  return distance(a2, b2);
};

// ../geometry/src/circle/distance-from-exterior.ts
var distanceFromExterior = (a2, b2) => {
  guardPositioned2(a2, `a`);
  if (isCirclePositioned(b2)) {
    return Math.max(0, distanceCenter(a2, b2) - a2.radius - b2.radius);
  } else if (isPoint(b2)) {
    const distribution = distance(a2, b2);
    if (distribution < a2.radius) return 0;
    return distribution;
  } else throw new Error(`Second parameter invalid type`);
};

// ../geometry/src/circle/is-equal.ts
var isEqual4 = (a2, b2) => {
  if (a2.radius !== b2.radius) return false;
  if (isCirclePositioned(a2) && isCirclePositioned(b2)) {
    if (a2.x !== b2.x) return false;
    if (a2.y !== b2.y) return false;
    if (a2.z !== b2.z) return false;
    return true;
  } else if (!isCirclePositioned(a2) && !isCirclePositioned(b2)) {
  } else return false;
  return false;
};

// ../geometry/src/point/sum.ts
function sum(a1, ab2, ab3, ab4, ab5, ab6) {
  const [ptA, ptB] = getTwoPointParameters(a1, ab2, ab3, ab4, ab5, ab6);
  guard(ptA, `a`);
  guard(ptB, `b`);
  const pt = {
    x: ptA.x + ptB.x,
    y: ptA.y + ptB.y
  };
  if (isPoint3d(ptA) || isPoint3d(ptB)) {
    pt.z = (ptA.z ?? 0) + (ptB.z ?? 0);
  }
  ;
  return Object.freeze(pt);
}

// ../geometry/src/circle/intersections.ts
var intersectionLine = (circle3, line4) => {
  const v1 = {
    x: line4.b.x - line4.a.x,
    y: line4.b.y - line4.a.y
  };
  const v2 = {
    x: line4.a.x - circle3.x,
    y: line4.a.y - circle3.y
  };
  const b2 = (v1.x * v2.x + v1.y * v2.y) * -2;
  const c4 = 2 * (v1.x * v1.x + v1.y * v1.y);
  const d2 = Math.sqrt(b2 * b2 - 2 * c4 * (v2.x * v2.x + v2.y * v2.y - circle3.radius * circle3.radius));
  if (Number.isNaN(d2)) return [];
  const u1 = (b2 - d2) / c4;
  const u2 = (b2 + d2) / c4;
  const returnValue = [];
  if (u1 <= 1 && u1 >= 0) {
    returnValue.push({
      x: line4.a.x + v1.x * u1,
      y: line4.a.y + v1.y * u1
    });
  }
  if (u2 <= 1 && u2 >= 0) {
    returnValue.push({
      x: line4.a.x + v1.x * u2,
      y: line4.a.y + v1.y * u2
    });
  }
  return returnValue;
};
var intersections = (a2, b2) => {
  const vector = subtract(b2, a2);
  const centerD = Math.hypot(vector.y, vector.x);
  if (centerD > a2.radius + b2.radius) return [];
  if (centerD < Math.abs(a2.radius - b2.radius)) return [];
  if (isEqual4(a2, b2)) return [];
  const centroidD = (a2.radius * a2.radius - b2.radius * b2.radius + centerD * centerD) / (2 * centerD);
  const centroid3 = {
    x: a2.x + vector.x * centroidD / centerD,
    y: a2.y + vector.y * centroidD / centerD
  };
  const centroidIntersectionD = Math.sqrt(a2.radius * a2.radius - centroidD * centroidD);
  const intersection2 = {
    x: -vector.y * (centroidIntersectionD / centerD),
    y: vector.x * (centroidIntersectionD / centerD)
  };
  return [
    sum(centroid3, intersection2),
    subtract(centroid3, intersection2)
  ];
};

// ../geometry/src/intersects.ts
var circleRect = (a2, b2) => {
  const deltaX = a2.x - Math.max(b2.x, Math.min(a2.x, b2.x + b2.width));
  const deltaY = a2.y - Math.max(b2.y, Math.min(a2.y, b2.y + b2.height));
  return deltaX * deltaX + deltaY * deltaY < a2.radius * a2.radius;
};
var circleCircle = (a2, b2) => intersections(a2, b2).length === 2;

// ../geometry/src/rect/Intersects.ts
function intersectsPoint(rect2, a2, b2) {
  guard3(rect2, `rect`);
  let x = 0;
  let y = 0;
  if (typeof a2 === `number`) {
    if (b2 === void 0) throw new Error(`x and y coordinate needed`);
    x = a2;
    y = b2;
  } else {
    x = a2.x;
    y = a2.y;
  }
  if (isPositioned(rect2)) {
    if (x - rect2.x > rect2.width || x < rect2.x) return false;
    if (y - rect2.y > rect2.height || y < rect2.y) return false;
  } else {
    if (x > rect2.width || x < 0) return false;
    if (y > rect2.height || y < 0) return false;
  }
  return true;
}
var isIntersecting = (a2, b2) => {
  if (!isRectPositioned(a2)) {
    throw new Error(`a parameter should be RectPositioned`);
  }
  if (isCirclePositioned(b2)) {
    return circleRect(b2, a2);
  } else if (isPoint(b2)) {
    return intersectsPoint(a2, b2);
  }
  throw new Error(`Unknown shape for b: ${JSON.stringify(b2)}`);
};

// ../geometry/src/rect/center.ts
var center = (rect2, origin) => {
  guard3(rect2);
  if (origin === void 0 && isPoint(rect2)) origin = rect2;
  else if (origin === void 0) origin = { x: 0, y: 0 };
  const r = getRectPositioned(rect2, origin);
  return Object.freeze({
    x: origin.x + rect2.width / 2,
    y: origin.y + rect2.height / 2
  });
};

// ../geometry/src/rect/distance.ts
var distanceFromExterior2 = (rect2, pt) => {
  guardPositioned(rect2, `rect`);
  guard(pt, `pt`);
  if (intersectsPoint(rect2, pt)) return 0;
  const dx = Math.max(rect2.x - pt.x, 0, pt.x - rect2.x + rect2.width);
  const dy = Math.max(rect2.y - pt.y, 0, pt.y - rect2.y + rect2.height);
  return Math.hypot(dx, dy);
};
var distanceFromCenter = (rect2, pt) => distance(center(rect2), pt);

// ../geometry/src/point/distance-to-center.ts
var distanceToCenter = (a2, shape) => {
  if (isRectPositioned(shape)) {
    return distanceFromExterior2(shape, a2);
  }
  if (isCirclePositioned(shape)) {
    return distanceFromExterior(shape, a2);
  }
  if (isPoint(shape)) return distance(a2, shape);
  throw new Error(`Unknown shape`);
};

// ../geometry/src/point/distance-to-exterior.ts
var distanceToExterior = (a2, shape) => {
  if (isRectPositioned(shape)) {
    return distanceFromExterior2(shape, a2);
  }
  if (isCirclePositioned(shape)) {
    return distanceFromExterior(shape, a2);
  }
  if (isPoint(shape)) return distance(a2, shape);
  throw new Error(`Unknown shape`);
};

// ../geometry/src/point/to-array.ts
var toArray = (p2) => [p2.x, p2.y];

// ../geometry/src/point/dot-product.ts
var dotProduct3 = (...pts) => {
  const a2 = pts.map((p2) => toArray(p2));
  return dotProduct(a2);
};

// ../geometry/src/point/from.ts
function from(xOrArray, y, z) {
  if (Array.isArray(xOrArray)) {
    if (xOrArray.length === 3) {
      return Object.freeze({
        x: xOrArray[0],
        y: xOrArray[1],
        z: xOrArray[2]
      });
    } else if (xOrArray.length === 2) {
      return Object.freeze({
        x: xOrArray[0],
        y: xOrArray[1]
      });
    } else {
      throw new Error(`Expected array of length two or three, got ${xOrArray.length}`);
    }
  } else {
    if (xOrArray === void 0) throw new Error(`Requires an array of [x,y] or x,y parameters at least`);
    else if (Number.isNaN(xOrArray)) throw new Error(`x is NaN`);
    if (y === void 0) throw new Error(`Param 'y' is missing`);
    else if (Number.isNaN(y)) throw new Error(`y is NaN`);
    if (z === void 0) {
      return Object.freeze({ x: xOrArray, y });
    } else {
      return Object.freeze({ x: xOrArray, y, z });
    }
  }
}
var fromString = (str) => {
  if (typeof str !== `string`) throw new TypeError(`Param 'str' ought to be a string. Got: ${typeof str}`);
  const comma = str.indexOf(`,`);
  const x = Number.parseFloat(str.substring(0, comma));
  const nextComma = str.indexOf(",", comma + 1);
  if (nextComma > 0) {
    const y = Number.parseFloat(str.substring(comma + 1, nextComma - comma + 2));
    const z = Number.parseFloat(str.substring(nextComma + 1));
    return { x, y, z };
  } else {
    const y = Number.parseFloat(str.substring(comma + 1));
    return { x, y };
  }
};
var fromNumbers2 = (...coords) => {
  const pts = [];
  if (Array.isArray(coords[0])) {
    for (const coord of coords) {
      if (!(coord.length % 2 === 0)) {
        throw new Error(`coords array should be even-numbered`);
      }
      pts.push(Object.freeze({ x: coord[0], y: coord[1] }));
    }
  } else {
    if (coords.length % 2 !== 0) {
      throw new Error(`Expected even number of elements: [x,y,x,y...]`);
    }
    for (let index = 0; index < coords.length; index += 2) {
      pts.push(
        Object.freeze({ x: coords[index], y: coords[index + 1] })
      );
    }
  }
  return pts;
};

// ../geometry/src/point/interpolate.ts
var interpolate3 = (amount, a2, b2, allowOverflow = false) => interpolate(amount, a2, b2, allowOverflow);

// ../geometry/src/point/invert.ts
var invert2 = (pt, what = `both`) => {
  switch (what) {
    case `both`: {
      return isPoint3d(pt) ? Object.freeze({
        ...pt,
        x: pt.x * -1,
        y: pt.y * -1,
        z: pt.z * -1
      }) : Object.freeze({
        ...pt,
        x: pt.x * -1,
        y: pt.y * -1
      });
    }
    case `x`: {
      return Object.freeze({
        ...pt,
        x: pt.x * -1
      });
    }
    case `y`: {
      return Object.freeze({
        ...pt,
        y: pt.y * -1
      });
    }
    case `z`: {
      if (isPoint3d(pt)) {
        return Object.freeze({
          ...pt,
          z: pt.z * -1
        });
      } else throw new Error(`pt parameter is missing z`);
    }
    default: {
      throw new Error(`Unknown what parameter. Expecting 'both', 'x' or 'y'`);
    }
  }
};

// ../geometry/src/point/multiply.ts
function multiply2(a1, ab2, ab3, ab4, ab5, ab6) {
  const [ptA, ptB] = getTwoPointParameters(a1, ab2, ab3, ab4, ab5, ab6);
  guard(ptA, `a`);
  guard(ptB, `b`);
  const pt = {
    x: ptA.x * ptB.x,
    y: ptA.y * ptB.y
  };
  if (isPoint3d(ptA) || isPoint3d(ptB)) {
    pt.z = (ptA.z ?? 0) * (ptB.z ?? 0);
  }
  ;
  return Object.freeze(pt);
}
var multiplyScalar = (pt, v) => {
  return isPoint3d(pt) ? Object.freeze({
    ...pt,
    x: pt.x * v,
    y: pt.y * v,
    z: pt.z * v
  }) : Object.freeze({
    ...pt,
    x: pt.x * v,
    y: pt.y * v
  });
};

// ../geometry/src/point/magnitude.ts
var clampMagnitude2 = (pt, max9 = 1, min8 = 0) => {
  const length5 = distance(pt);
  let ratio = 1;
  if (length5 > max9) {
    ratio = max9 / length5;
  } else if (length5 < min8) {
    ratio = min8 / length5;
  }
  return ratio === 1 ? pt : multiply2(pt, ratio, ratio);
};

// ../geometry/src/point/most.ts
var leftmost = (...points) => findMinimum((a2, b2) => a2.x <= b2.x ? a2 : b2, ...points);
var rightmost = (...points) => findMinimum((a2, b2) => a2.x >= b2.x ? a2 : b2, ...points);

// ../geometry/src/point/normalise.ts
var length2 = (ptOrX, y) => {
  if (isPoint(ptOrX)) {
    y = ptOrX.y;
    ptOrX = ptOrX.x;
  }
  if (y === void 0) throw new Error(`Expected y`);
  return Math.hypot(ptOrX, y);
};
var normalise2 = (ptOrX, y) => {
  const pt = getPointParameter2(ptOrX, y);
  const l = length2(pt);
  if (l === 0) return Empty;
  return Object.freeze({
    ...pt,
    x: pt.x / l,
    y: pt.y / l
  });
};

// ../geometry/src/point/pipeline.ts
var pipelineApply = (point2, ...pipelineFns) => pipeline(...pipelineFns)(point2);
var pipeline = (...pipeline2) => (pt) => (
  // eslint-disable-next-line unicorn/no-array-reduce
  pipeline2.reduce((previous, current) => current(previous), pt)
);

// ../core/src/maps.ts
var some = (map3, predicate) => [...map3.values()].some((v) => predicate(v));
var zipKeyValue = (keys, values2) => {
  if (keys.length !== values2.length) {
    throw new Error(`Keys and values arrays should be same length`);
  }
  return Object.fromEntries(keys.map((k, index) => [k, values2[index]]));
};
var getOrGenerate = (map3, fn) => async (key, args) => {
  let value = map3.get(key);
  if (value !== void 0) return value;
  value = await fn(key, args);
  if (value === void 0) throw new Error(`fn returned undefined`);
  map3.set(key, value);
  return value;
};

// ../core/src/trackers/tracked-value.ts
var TrackedValueMap = class {
  store;
  gog;
  constructor(creator) {
    this.store = /* @__PURE__ */ new Map();
    this.gog = getOrGenerate(this.store, creator);
  }
  /**
   * Number of named values being tracked
   */
  get size() {
    return this.store.size;
  }
  /**
   * Returns _true_ if `id` is stored
   * @param id
   * @returns
   */
  has(id) {
    return this.store.has(id);
  }
  /**
   * For a given id, note that we have seen one or more values.
   * @param id Id
   * @param values Values(s)
   * @returns Information about start to last value
   */
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  //eslint-disable-next-line functional/prefer-immutable-types
  async seen(id, ...values2) {
    const trackedValue = await this.getTrackedValue(id, ...values2);
    const result = trackedValue.seen(...values2);
    return result;
  }
  /**
   * Creates or returns a TrackedValue instance for `id`.
   * @param id
   * @param values
   * @returns
   */
  //eslint-disable-next-line functional/prefer-immutable-types
  async getTrackedValue(id, ...values2) {
    if (id === null) throw new Error(`id parameter cannot be null`);
    if (id === void 0) throw new Error(`id parameter cannot be undefined`);
    const trackedValue = await this.gog(id, values2[0]);
    return trackedValue;
  }
  /**
   * Remove a tracked value by id.
   * Use {@link reset} to clear them all.
   * @param id
   */
  delete(id) {
    this.store.delete(id);
  }
  /**
   * Remove all tracked values.
   * Use {@link delete} to remove a single value by id.
   */
  reset() {
    this.store = /* @__PURE__ */ new Map();
  }
  /**
   * Enumerate ids
   */
  *ids() {
    yield* this.store.keys();
  }
  /**
   * Enumerate tracked values
   */
  *tracked() {
    yield* this.store.values();
  }
  /**
   * Iterates TrackedValues ordered with oldest first
   * @returns
   */
  *trackedByAge() {
    const tp = [...this.store.values()];
    tp.sort((a2, b2) => {
      const aa = a2.elapsed;
      const bb = b2.elapsed;
      if (aa === bb) return 0;
      if (aa > bb) return -1;
      return 1;
    });
    for (const t2 of tp) {
      yield t2;
    }
  }
  /**
   * Iterates underlying values, ordered by age (oldest first)
   * First the named values are sorted by their `elapsed` value, and then
   * we return the last value for that group.
   */
  *valuesByAge() {
    for (const tb of this.trackedByAge()) {
      yield tb.last;
    }
  }
  /**
   * Enumerate last received values
   *
   * @example Calculate centroid of latest-received values
   * ```js
   * const pointers = pointTracker();
   * const c = Points.centroid(...Array.from(pointers.lastPoints()));
   * ```
   */
  *last() {
    for (const p2 of this.store.values()) {
      yield p2.last;
    }
  }
  /**
   * Enumerate starting values
   */
  *initialValues() {
    for (const p2 of this.store.values()) {
      yield p2.initial;
    }
  }
  /**
   * Returns a tracked value by id, or undefined if not found
   * @param id
   * @returns
   */
  get(id) {
    return this.store.get(id);
  }
};

// ../core/src/trackers/tracker-base.ts
var TrackerBase = class {
  /**
   * @ignore
   */
  seenCount;
  /**
   * @ignore
   */
  storeIntermediate;
  /**
   * @ignore
   */
  resetAfterSamples;
  /**
   * @ignore
   */
  sampleLimit;
  id;
  debug;
  constructor(opts = {}) {
    this.id = opts.id ?? `tracker`;
    this.debug = opts.debug ?? false;
    this.sampleLimit = opts.sampleLimit ?? -1;
    this.resetAfterSamples = opts.resetAfterSamples ?? -1;
    this.storeIntermediate = opts.storeIntermediate ?? (this.sampleLimit > -1 || this.resetAfterSamples > -1);
    this.seenCount = 0;
    if (this.debug) {
      console.log(`TrackerBase: sampleLimit: ${this.sampleLimit} resetAfter: ${this.resetAfterSamples} store: ${this.storeIntermediate}`);
    }
  }
  /**
   * Reset tracker
   */
  reset() {
    this.seenCount = 0;
    this.onReset();
  }
  /**
   * Adds a value, returning computed result.
   *  
   * At this point, we check if the buffer is larger than `resetAfterSamples`. If so, `reset()` is called.
   * If not, we check `sampleLimit`. If the buffer is twice as large as sample limit, `trimStore()` is
   * called to take it down to sample limit, and `onTrimmed()` is called.
   * @param p 
   * @returns 
   */
  seen(...p2) {
    if (this.resetAfterSamples > 0 && this.seenCount > this.resetAfterSamples) {
      this.reset();
    } else if (this.sampleLimit > 0 && this.seenCount > this.sampleLimit * 2) {
      this.seenCount = this.trimStore(this.sampleLimit);
      this.onTrimmed(`resize`);
    }
    this.seenCount += p2.length;
    const t2 = this.filterData(p2);
    return this.computeResults(t2);
  }
};

// ../core/src/trackers/object-tracker.ts
var ObjectTracker = class extends TrackerBase {
  values;
  constructor(opts = {}) {
    super(opts);
    this.values = [];
  }
  onTrimmed(reason) {
  }
  /**
   * Reduces size of value store to `limit`. 
   * Returns number of remaining items
   * @param limit
   */
  trimStore(limit) {
    if (limit >= this.values.length) return this.values.length;
    this.values = this.values.slice(-limit);
    return this.values.length;
  }
  /**
   * Allows sub-classes to be notified when a reset happens
   * @ignore
   */
  onReset() {
    this.values = [];
  }
  /**
   * Tracks a value
   * @ignore
   */
  filterData(p2) {
    const ts = p2.map(
      (v) => `at` in v ? v : {
        ...v,
        at: Date.now()
      }
    );
    const last5 = ts.at(-1);
    if (this.storeIntermediate) this.values.push(...ts);
    else switch (this.values.length) {
      case 0: {
        this.values.push(last5);
        break;
      }
      case 1: {
        this.values.push(last5);
        break;
      }
      case 2: {
        this.values[1] = last5;
        break;
      }
    }
    return ts;
  }
  /**
   * Last seen value. If no values have been added, it will return the initial value
   */
  get last() {
    if (this.values.length === 1) return this.values[0];
    return this.values.at(-1);
  }
  /**
   * Returns the oldest value in the buffer
   */
  get initial() {
    return this.values.at(0);
  }
  /**
   * Returns number of recorded values (includes the initial value in the count)
   */
  get size() {
    return this.values.length;
  }
  /**
   * Returns the elapsed time, in milliseconds since the initial value
   */
  get elapsed() {
    return Date.now() - this.values[0].at;
  }
};

// ../geometry/src/vector.ts
var vector_exports = {};
__export(vector_exports, {
  clampMagnitude: () => clampMagnitude3,
  divide: () => divide4,
  dotProduct: () => dotProduct4,
  fromLineCartesian: () => fromLineCartesian,
  fromLinePolar: () => fromLinePolar,
  fromPointPolar: () => fromPointPolar,
  fromRadians: () => fromRadians,
  multiply: () => multiply3,
  normalise: () => normalise3,
  quadrantOffsetAngle: () => quadrantOffsetAngle,
  subtract: () => subtract2,
  sum: () => sum2,
  toCartesian: () => toCartesian3,
  toPolar: () => toPolar,
  toRadians: () => toRadians,
  toString: () => toString4
});

// ../geometry/src/point/To.ts
var toIntegerValues = (pt, rounder = Math.round) => {
  guard(pt, `pt`);
  return Object.freeze({
    x: rounder(pt.x),
    y: rounder(pt.y)
  });
};
var to2d = (pt) => {
  guard(pt, `pt`);
  let copy = {
    ...pt
  };
  delete copy.z;
  return Object.freeze(copy);
};
var to3d = (pt, z = 0) => {
  guard(pt, `pt`);
  return Object.freeze({
    ...pt,
    z
  });
};
function toString3(p2, digits) {
  if (p2 === void 0) return `(undefined)`;
  if (p2 === null) return `(null)`;
  guard(p2, `pt`);
  const x = digits ? p2.x.toFixed(digits) : p2.x;
  const y = digits ? p2.y.toFixed(digits) : p2.y;
  if (p2.z === void 0) {
    return `(${x},${y})`;
  } else {
    const z = digits ? p2.z.toFixed(digits) : p2.z;
    return `(${x},${y},${z})`;
  }
}

// ../geometry/src/vector.ts
var EmptyCartesian = Object.freeze({ x: 0, y: 0 });
var piPi3 = Math.PI * 2;
var pi = Math.PI;
var fromRadians = (radians) => {
  return Object.freeze({
    x: Math.cos(radians),
    y: Math.sin(radians)
  });
};
var toRadians = (point2) => {
  return Math.atan2(point2.y, point2.x);
};
var fromPointPolar = (pt, angleNormalisation = ``, origin = EmptyCartesian) => {
  pt = subtract(pt, origin);
  let direction = Math.atan2(pt.y, pt.x);
  if (angleNormalisation === `unipolar` && direction < 0) direction += piPi3;
  else if (angleNormalisation === `bipolar`) {
    if (direction > pi) direction -= piPi3;
    else if (direction <= -pi) direction += piPi3;
  }
  return Object.freeze({
    distance: distance(pt),
    angleRadian: direction
  });
};
var fromLineCartesian = (line4) => subtract(line4.b, line4.a);
var fromLinePolar = (line4) => {
  guard2(line4, `line`);
  const pt = subtract(line4.b, line4.a);
  return fromPointPolar(pt);
};
var isPolar = (v) => {
  if (isPolarCoord(v)) return true;
  return false;
};
var isCartesian = (v) => {
  if (isPoint(v)) return true;
  return false;
};
var normalise3 = (v) => {
  if (isPolar(v)) {
    return normalise(v);
  } else if (isCartesian(v)) {
    return normalise2(v);
  }
  throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
};
var quadrantOffsetAngle = (p2) => {
  if (p2.x >= 0 && p2.y >= 0) return 0;
  if (p2.x < 0 && p2.y >= 0) return pi;
  if (p2.x < 0 && p2.y < 0) return pi;
  return piPi3;
};
var toPolar = (v, origin = Empty) => {
  if (isPolar(v)) {
    return v;
  } else if (isCartesian(v)) {
    return fromCartesian(v, origin);
  }
  throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
};
var toCartesian3 = (v) => {
  if (isPolar(v)) {
    return toPoint(v);
  } else if (isCartesian(v)) {
    return v;
  }
  throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
};
var toString4 = (v, digits) => {
  if (isPolar(v)) {
    return toString(v, digits);
  } else if (isCartesian(v)) {
    return toString3(v, digits);
  }
  throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
};
var dotProduct4 = (a2, b2) => {
  if (isPolar(a2) && isPolar(b2)) {
    return dotProduct2(a2, b2);
  } else if (isCartesian(a2) && isCartesian(b2)) {
    return dotProduct3(a2, b2);
  }
  throw new Error(`Expected two polar/Cartesian vectors.`);
};
var clampMagnitude3 = (v, max9 = 1, min8 = 0) => {
  if (isPolar(v)) {
    return clampMagnitude(v, max9, min8);
  } else if (isCartesian(v)) {
    return clampMagnitude2(v, max9, min8);
  }
  throw new Error(`Expected either polar or Cartesian vector`);
};
var sum2 = (a2, b2) => {
  const polar = isPolar(a2);
  a2 = toCartesian3(a2);
  b2 = toCartesian3(b2);
  const c4 = sum(a2, b2);
  return polar ? toPolar(c4) : c4;
};
var subtract2 = (a2, b2) => {
  const polar = isPolar(a2);
  a2 = toCartesian3(a2);
  b2 = toCartesian3(b2);
  const c4 = subtract(a2, b2);
  return polar ? toPolar(c4) : c4;
};
var multiply3 = (a2, b2) => {
  const polar = isPolar(a2);
  a2 = toCartesian3(a2);
  b2 = toCartesian3(b2);
  const c4 = multiply2(a2, b2);
  return polar ? toPolar(c4) : c4;
};
var divide4 = (a2, b2) => {
  const polar = isPolar(a2);
  a2 = toCartesian3(a2);
  b2 = toCartesian3(b2);
  const c4 = divide(a2, b2);
  return polar ? toPolar(c4) : c4;
};

// ../geometry/src/point/relation.ts
var relation = (a2, b2) => {
  const start = getPointParameter2(a2, b2);
  let totalX = 0;
  let totalY = 0;
  let count3 = 0;
  let lastUpdate = performance.now();
  let lastPoint = start;
  const update = (aa, bb) => {
    const p2 = getPointParameter2(aa, bb);
    totalX += p2.x;
    totalY += p2.y;
    count3++;
    const distanceFromStart = distance(p2, start);
    const distanceFromLast = distance(p2, lastPoint);
    const now = performance.now();
    const speed = distanceFromLast / (now - lastUpdate);
    lastUpdate = now;
    lastPoint = p2;
    return Object.freeze({
      angle: angleRadian(p2, start),
      distanceFromStart,
      distanceFromLast,
      speed,
      centroid: centroid(p2, start),
      average: {
        x: totalX / count3,
        y: totalY / count3
      }
    });
  };
  return update;
};

// ../geometry/src/point/point-tracker.ts
var PointTracker = class extends ObjectTracker {
  initialRelation;
  markRelation;
  lastResult;
  constructor(opts = {}) {
    super(opts);
  }
  /**
   * Notification that buffer has been knocked down to `sampleLimit`.
   * 
   * This will reset the `initialRelation`, which will use the new oldest value.
   */
  onTrimmed(_reason) {
    this.initialRelation = void 0;
  }
  /**
   * @ignore
   */
  onReset() {
    super.onReset();
    this.lastResult = void 0;
    this.initialRelation = void 0;
    this.markRelation = void 0;
  }
  /**
   * Adds a PointerEvent along with its
   * coalesced events, if available.
   * @param p 
   * @returns 
   */
  seenEvent(p2) {
    if (`getCoalescedEvents` in p2) {
      const events = p2.getCoalescedEvents();
      const asPoints2 = events.map((event2) => ({ x: event2.clientX, y: event2.clientY }));
      return this.seen(...asPoints2);
    } else {
      return this.seen({ x: p2.clientX, y: p2.clientY });
    }
  }
  /**
   * Makes a 'mark' in the tracker, allowing you to compare values
   * to this point.
   */
  mark() {
    this.markRelation = relation(this.last);
  }
  /**
   * Tracks a point, returning data on its relation to the
   * initial point and the last received point.
   * 
   * Use {@link seenEvent} to track a raw `PointerEvent`.
   * 
   * @param _p Point
   */
  computeResults(_p) {
    const currentLast = this.last;
    const previousLast = this.values.at(-2);
    if (this.initialRelation === void 0 && this.initial) {
      this.initialRelation = relation(this.initial);
    } else if (this.initialRelation === void 0) {
      throw new Error(`Bug: No initialRelation, and this.inital is undefined?`);
    }
    const lastRelation = previousLast === void 0 ? relation(currentLast) : relation(previousLast);
    const initialRel = this.initialRelation(currentLast);
    const markRel = this.markRelation !== void 0 ? this.markRelation(currentLast) : void 0;
    const speed = previousLast === void 0 ? 0 : length(previousLast, currentLast) / (currentLast.at - previousLast.at);
    const lastRel = {
      ...lastRelation(currentLast),
      speed
    };
    const r = {
      fromInitial: initialRel,
      fromLast: lastRel,
      fromMark: markRel,
      values: [...this.values]
    };
    this.lastResult = r;
    return r;
  }
  /**
   * Returns a polyline representation of stored points.
   * Returns an empty array if points were not saved, or there's only one.
   */
  get line() {
    if (this.values.length === 1) return [];
    return joinPointsToLines(...this.values);
  }
  /**
   * Returns a vector of the initial/last points of the tracker.
   * Returns as a polar coordinate
   */
  get vectorPolar() {
    return fromLinePolar(this.lineStartEnd);
  }
  /**
   * Returns a vector of the initial/last points of the tracker.
   * Returns as a Cartesian coordinate
   */
  get vectorCartesian() {
    return fromLineCartesian(this.lineStartEnd);
  }
  /**
   * Returns a line from initial point to last point.
   *
   * If there are less than two points, Lines.Empty is returned
   */
  get lineStartEnd() {
    const initial = this.initial;
    if (this.values.length < 2 || !initial) return Empty2;
    return {
      a: initial,
      b: this.last
    };
  }
  /**
   * Returns distance from latest point to initial point.
   * If there are less than two points, zero is returned.
   *
   * This is the direct distance from initial to last,
   * not the accumulated length.
   * @returns Distance
   */
  distanceFromStart() {
    const initial = this.initial;
    return this.values.length >= 2 && initial !== void 0 ? distance(initial, this.last) : 0;
  }
  /**
   * Difference between last point and the initial point, calculated
   * as a simple subtraction of x,y & z.
   *
   * `Points.Placeholder` is returned if there's only one point so far.
   */
  difference() {
    const initial = this.initial;
    return this.values.length >= 2 && initial !== void 0 ? subtract(this.last, initial) : Placeholder;
  }
  /**
   * Returns angle (in radians) from latest point to the initial point
   * If there are less than two points, undefined is return.
   * @returns Angle in radians
   */
  angleFromStart() {
    const initial = this.initial;
    if (initial !== void 0 && this.values.length > 2) {
      return angleRadian(initial, this.last);
    }
  }
  /**
   * Returns the total length of accumulated points.
   * Returns 0 if points were not saved, or there's only one
   */
  get length() {
    if (this.values.length === 1) return 0;
    const l = this.line;
    return length(l);
  }
  /**
  * Returns the last x coord
  */
  get x() {
    return this.last.x;
  }
  /**
   * Returns the last y coord
   */
  get y() {
    return this.last.y;
  }
  /**
   * Returns the last z coord (or _undefined_ if not available)
   */
  get z() {
    return this.last.z;
  }
};
var PointsTracker = class extends TrackedValueMap {
  constructor(opts = {}) {
    super((key, start) => {
      if (start === void 0) throw new Error(`Requires start point`);
      const p2 = new PointTracker({
        ...opts,
        id: key
      });
      p2.seen(start);
      return p2;
    });
  }
  /**
   * Track a PointerEvent
   * @param event
   */
  seenEvent(event2) {
    if (`getCoalescedEvents` in event2) {
      const events = event2.getCoalescedEvents();
      const seens = events.map((subEvent) => super.seen(subEvent.pointerId.toString(), subEvent));
      return Promise.all(seens);
    } else {
      return Promise.all([super.seen(event2.pointerId.toString(), event2)]);
    }
  }
};
var trackPoints = (options = {}) => new PointsTracker(options);
var track = (opts = {}) => new PointTracker(opts);

// ../geometry/src/point/progress-between.ts
var progressBetween = (position, waypointA, waypointB) => {
  const a2 = subtract(position, waypointA);
  const b2 = subtract(waypointB, waypointA);
  return isPoint3d(a2) && isPoint3d(b2) ? (a2.x * b2.x + a2.y * b2.y + a2.z * b2.z) / (b2.x * b2.x + b2.y * b2.y + b2.z * b2.z) : (a2.x * b2.x + a2.y * b2.y) / (b2.x * b2.x + b2.y * b2.y);
};

// ../geometry/src/point/project.ts
var project = (origin, distance5, angle) => {
  const x = Math.cos(angle) * distance5 + origin.x;
  const y = Math.sin(angle) * distance5 + origin.y;
  return { x, y };
};

// ../geometry/src/point/quantise.ts
function quantiseEvery2(pt, snap, middleRoundsUp = true) {
  guard(pt, `pt`);
  guard(snap, `snap`);
  if (isPoint3d(pt)) {
    if (!isPoint3d(snap)) throw new TypeError(`Param 'snap' is missing 'z' field`);
    return Object.freeze({
      x: quantiseEvery(pt.x, snap.x, middleRoundsUp),
      y: quantiseEvery(pt.y, snap.y, middleRoundsUp),
      z: quantiseEvery(pt.z, snap.z, middleRoundsUp)
    });
  }
  return Object.freeze({
    x: quantiseEvery(pt.x, snap.x, middleRoundsUp),
    y: quantiseEvery(pt.y, snap.y, middleRoundsUp)
  });
}

// ../random/src/arrays.ts
var randomElement2 = (array3, rand = Math.random) => {
  guardArray(array3, `array`);
  return array3[Math.floor(rand() * array3.length)];
};

// ../random/src/float-source.ts
var floatSource = (maxOrOptions = 1) => {
  const options = typeof maxOrOptions === `number` ? { max: maxOrOptions } : maxOrOptions;
  let max9 = options.max ?? 1;
  let min8 = options.min ?? 0;
  const source = options.source ?? Math.random;
  throwNumberTest(min8, ``, `min`);
  throwNumberTest(max9, ``, `max`);
  if (!options.min && max9 < 0) {
    min8 = max9;
    max9 = 0;
  }
  if (min8 > max9) {
    throw new Error(`Min is greater than max. Min: ${min8.toString()} max: ${max9.toString()}`);
  }
  return () => source() * (max9 - min8) + min8;
};
var float = (maxOrOptions = 1) => floatSource(maxOrOptions)();

// ../geometry/src/point/random.ts
var random = (rando) => {
  if (rando === void 0) rando = Math.random;
  return Object.freeze({
    x: rando(),
    y: rando()
  });
};
var random3d = (rando) => {
  if (rando === void 0) rando = Math.random;
  return Object.freeze({
    x: rando(),
    y: rando(),
    z: rando()
  });
};

// ../geometry/src/point/reduce.ts
var reduce = (pts, fn, initial) => {
  if (initial === void 0) initial = { x: 0, y: 0 };
  let accumulator = initial;
  for (const p2 of pts) {
    accumulator = fn(p2, accumulator);
  }
  ;
  return accumulator;
};

// ../geometry/src/point/rotate.ts
function rotate2(pt, amountRadian, origin) {
  if (origin === void 0) origin = { x: 0, y: 0 };
  guard(origin, `origin`);
  throwNumberTest(amountRadian, ``, `amountRadian`);
  const arrayInput = Array.isArray(pt);
  if (amountRadian === 0) return pt;
  if (!arrayInput) {
    pt = [pt];
  }
  const ptAr = pt;
  for (const [index, p2] of ptAr.entries()) guard(p2, `pt[${index}]`);
  const asPolar = ptAr.map((p2) => fromCartesian(p2, origin));
  const rotated = asPolar.map((p2) => rotate(p2, amountRadian));
  const asCartesisan = rotated.map((p2) => toCartesian(p2, origin));
  return arrayInput ? asCartesisan : asCartesisan[0];
}

// ../geometry/src/point/rotate-point-array.ts
var rotatePointArray = (v, amountRadian) => {
  const mat = [
    [Math.cos(amountRadian), -Math.sin(amountRadian)],
    [Math.sin(amountRadian), Math.cos(amountRadian)]
  ];
  const result = [];
  for (const [index, element] of v.entries()) {
    result[index] = [
      mat[0][0] * element[0] + mat[0][1] * element[1],
      mat[1][0] * element[0] + mat[1][1] * element[1]
    ];
  }
  return result;
};

// ../geometry/src/point/round.ts
var round3 = (ptOrX, yOrDigits, digits) => {
  const pt = getPointParameter2(ptOrX, yOrDigits);
  digits = digits ?? yOrDigits;
  digits = digits ?? 2;
  return Object.freeze({
    ...pt,
    x: round2(digits, pt.x),
    y: round2(digits, pt.y)
  });
};

// ../geometry/src/point/within-range.ts
var withinRange = (a2, b2, maxRange) => {
  guard(a2, `a`);
  guard(b2, `b`);
  if (typeof maxRange === `number`) {
    throwNumberTest(maxRange, `positive`, `maxRange`);
    maxRange = { x: maxRange, y: maxRange };
  } else {
    guard(maxRange, `maxRange`);
  }
  const x = Math.abs(b2.x - a2.x);
  const y = Math.abs(b2.y - a2.y);
  return x <= maxRange.x && y <= maxRange.y;
};

// ../geometry/src/point/wrap.ts
var wrap2 = (pt, ptMax, ptMin) => {
  if (ptMax === void 0) ptMax = { x: 1, y: 1 };
  if (ptMin === void 0) ptMin = { x: 0, y: 0 };
  guard(pt, `pt`);
  guard(ptMax, `ptMax`);
  guard(ptMin, `ptMin`);
  return Object.freeze({
    x: wrap(pt.x, ptMin.x, ptMax.x),
    y: wrap(pt.y, ptMin.y, ptMax.y)
  });
};

// ../geometry/src/line/multiply.ts
var multiply4 = (line4, point2) => Object.freeze({
  ...line4,
  a: multiply2(line4.a, point2),
  b: multiply2(line4.b, point2)
});

// ../geometry/src/line/relative-position.ts
var relativePosition = (line4, pt) => {
  const fromStart = distance(line4.a, pt);
  const total2 = length(line4);
  return fromStart / total2;
};

// ../geometry/src/line/rotate.ts
var rotate3 = (line4, amountRadian, origin) => {
  if (amountRadian === void 0 || amountRadian === 0) return line4;
  if (origin === void 0) origin = 0.5;
  if (typeof origin === `number`) {
    origin = interpolate(origin, line4.a, line4.b);
  }
  return Object.freeze({
    ...line4,
    a: rotate2(line4.a, amountRadian, origin),
    b: rotate2(line4.b, amountRadian, origin)
  });
};

// ../geometry/src/line/subtract.ts
var subtract3 = (line4, point2) => Object.freeze({
  ...line4,
  a: subtract(line4.a, point2),
  b: subtract(line4.b, point2)
});

// ../geometry/src/line/sum.ts
var sum3 = (line4, point2) => Object.freeze({
  ...line4,
  a: sum(line4.a, point2),
  b: sum(line4.b, point2)
});

// ../geometry/src/line/to-string.ts
function toString5(a2, b2) {
  if (isLine(a2)) {
    guard2(a2, `a`);
    b2 = a2.b;
    a2 = a2.a;
  } else if (b2 === void 0) throw new Error(`Expect second point if first is a point`);
  return toString3(a2) + `-` + toString3(b2);
}

// ../geometry/src/line/index.ts
var Empty2 = Object.freeze({
  a: Object.freeze({ x: 0, y: 0 }),
  b: Object.freeze({ x: 0, y: 0 })
});
var Placeholder2 = Object.freeze({
  a: Object.freeze({ x: Number.NaN, y: Number.NaN }),
  b: Object.freeze({ x: Number.NaN, y: Number.NaN })
});
var isEmpty3 = (l) => isEmpty(l.a) && isEmpty(l.b);
var isPlaceholder3 = (l) => isPlaceholder(l.a) && isPlaceholder(l.b);
var apply2 = (line4, fn) => Object.freeze(
  {
    ...line4,
    a: fn(line4.a),
    b: fn(line4.b)
  }
);
var angleRadian2 = (lineOrPoint, b2) => {
  let a2;
  if (isLine(lineOrPoint)) {
    a2 = lineOrPoint.a;
    b2 = lineOrPoint.b;
  } else {
    a2 = lineOrPoint;
    if (b2 === void 0) throw new Error(`b point must be provided`);
  }
  return Math.atan2(b2.y - a2.y, b2.x - a2.x);
};
var normaliseByRect2 = (line4, width, height4) => Object.freeze({
  ...line4,
  a: normaliseByRect(line4.a, width, height4),
  b: normaliseByRect(line4.b, width, height4)
});
var withinRange2 = (line4, point2, maxRange) => {
  const calculatedDistance = distance2(line4, point2);
  return calculatedDistance <= maxRange;
};
var slope = (lineOrPoint, b2) => {
  let a2;
  if (isLine(lineOrPoint)) {
    a2 = lineOrPoint.a;
    b2 = lineOrPoint.b;
  } else {
    a2 = lineOrPoint;
    if (b2 === void 0) throw new Error(`b parameter required`);
  }
  if (b2 === void 0) {
    throw new TypeError(`Second point missing`);
  } else {
    return (b2.y - a2.y) / (b2.x - a2.x);
  }
};
var scaleFromMidpoint = (line4, factor) => {
  const a2 = interpolate(factor / 2, line4);
  const b2 = interpolate(0.5 + factor / 2, line4);
  return { a: a2, b: b2 };
};
var pointAtX = (line4, x) => {
  const y = line4.a.y + (x - line4.a.x) * slope(line4);
  return Object.freeze({ x, y });
};
var extendFromA = (line4, distance5) => {
  const calculatedLength = length(line4);
  return Object.freeze({
    ...line4,
    a: line4.a,
    b: Object.freeze({
      x: line4.b.x + (line4.b.x - line4.a.x) / calculatedLength * distance5,
      y: line4.b.y + (line4.b.y - line4.a.y) / calculatedLength * distance5
    })
  });
};
function* pointsOf(line4) {
  const { a: a2, b: b2 } = line4;
  let x0 = Math.floor(a2.x);
  let y0 = Math.floor(a2.y);
  const x1 = Math.floor(b2.x);
  const y1 = Math.floor(b2.y);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    yield { x: x0, y: y0 };
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}
var distance2 = (line4, point2) => {
  if (Array.isArray(line4)) {
    const distances = line4.map((l) => distanceSingleLine(l, point2));
    return minFast(distances);
  } else {
    return distanceSingleLine(line4, point2);
  }
};
var toFlatArray = (a2, b2) => {
  if (isLine(a2)) {
    return [a2.a.x, a2.a.y, a2.b.x, a2.b.y];
  } else if (isPoint(a2) && isPoint(b2)) {
    return [a2.x, a2.y, b2.x, b2.y];
  } else {
    throw new Error(`Expected single line parameter, or a and b points`);
  }
};
function* asPoints(lines) {
  for (const l of lines) {
    yield l.a;
    yield l.b;
  }
}
var toSvgString = (a2, b2) => [`M${a2.x} ${a2.y} L ${b2.x} ${b2.y}`];

// ../geometry/src/line/to-path.ts
var toPath = (line4) => {
  const { a: a2, b: b2 } = line4;
  return Object.freeze({
    ...line4,
    length: () => length(a2, b2),
    interpolate: (amount) => interpolate(amount, a2, b2),
    relativePosition: (point2) => relativePosition(line4, point2),
    bbox: () => bbox2(line4),
    toString: () => toString5(a2, b2),
    toFlatArray: () => toFlatArray(a2, b2),
    toSvgString: () => toSvgString(a2, b2),
    toPoints: () => [a2, b2],
    rotate: (amountRadian, origin) => toPath(rotate3(line4, amountRadian, origin)),
    nearest: (point2) => nearest(line4, point2),
    sum: (point2) => toPath(sum3(line4, point2)),
    divide: (point2) => toPath(divide2(line4, point2)),
    multiply: (point2) => toPath(multiply4(line4, point2)),
    subtract: (point2) => toPath(subtract3(line4, point2)),
    midpoint: () => midpoint(a2, b2),
    distanceToPoint: (point2) => distanceSingleLine(line4, point2),
    parallel: (distance5) => parallel(line4, distance5),
    perpendicularPoint: (distance5, amount) => perpendicularPoint(line4, distance5, amount),
    slope: () => slope(line4),
    withinRange: (point2, maxRange) => withinRange2(line4, point2, maxRange),
    isEqual: (otherLine) => isEqual3(line4, otherLine),
    apply: (fn) => toPath(apply2(line4, fn)),
    kind: `line`
  });
};

// ../geometry/src/waypoint.ts
var fromPoints2 = (waypoints, opts = {}) => {
  const lines = joinPointsToLines(...waypoints);
  return init(
    lines.map((l) => toPath(l)),
    opts
  );
};
var init = (paths2, opts = {}) => {
  const maxDistanceFromLine = opts.maxDistanceFromLine ?? 0.1;
  const checkUnordered = (pt) => {
    const results = paths2.map((p2, index) => {
      const nearest3 = p2.nearest(pt);
      const distance5 = distance(pt, nearest3);
      const positionRelative = p2.relativePosition(nearest3, maxDistanceFromLine);
      ;
      return { positionRelative, path: p2, index, nearest: nearest3, distance: distance5, rank: Number.MAX_SAFE_INTEGER };
    });
    const filtered = results.filter((v) => v.distance <= maxDistanceFromLine);
    const sorted = sortByNumericProperty(filtered, `distance`);
    for (let rank3 = 0; rank3 < sorted.length; rank3++) {
      sorted[rank3].rank = rank3;
    }
    return sorted;
  };
  return checkUnordered;
};

// ../geometry/src/layout.ts
var layout_exports = {};
__export(layout_exports, {
  CirclePacking: () => circle_packing_exports
});

// ../geometry/src/circle-packing.ts
var circle_packing_exports = {};
__export(circle_packing_exports, {
  random: () => random3
});

// ../geometry/src/shape/index.ts
var shape_exports = {};
__export(shape_exports, {
  arrow: () => arrow,
  center: () => center3,
  isIntersecting: () => isIntersecting3,
  randomPoint: () => randomPoint3,
  starburst: () => starburst
});

// ../geometry/src/triangle/create.ts
var Empty3 = Object.freeze({
  a: { x: 0, y: 0 },
  b: { x: 0, y: 0 },
  c: { x: 0, y: 0 }
});
var Placeholder3 = Object.freeze({
  a: { x: Number.NaN, y: Number.NaN },
  b: { x: Number.NaN, y: Number.NaN },
  c: { x: Number.NaN, y: Number.NaN }
});
var equilateralFromVertex = (origin, length5 = 10, angleRadian3 = Math.PI / 2) => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 });
  const a2 = project(origin, length5, Math.PI - -angleRadian3 / 2);
  const c4 = project(origin, length5, Math.PI - angleRadian3 / 2);
  return { a: a2, b: origin, c: c4 };
};

// ../geometry/src/rect/corners.ts
var corners = (rect2, origin) => {
  const r = getRectPositioned(rect2, origin);
  return [
    { x: r.x, y: r.y },
    { x: r.x + r.width, y: r.y },
    { x: r.x + r.width, y: r.y + r.height },
    { x: r.x, y: r.y + r.height }
  ];
};

// ../geometry/src/rect/from-top-left.ts
var fromTopLeft = (origin, width, height4) => {
  guardDim(width, `width`);
  guardDim(height4, `height`);
  guard(origin, `origin`);
  return { x: origin.x, y: origin.y, width, height: height4 };
};

// ../geometry/src/shape/arrow.ts
var arrow = (origin, from2, opts = {}) => {
  const tailLength = opts.tailLength ?? 10;
  const tailThickness = opts.tailThickness ?? Math.max(tailLength / 5, 5);
  const angleRadian3 = opts.angleRadian ?? 0;
  const arrowSize = opts.arrowSize ?? Math.max(tailLength / 5, 15);
  const triAngle = Math.PI / 2;
  let tri;
  let tailPoints;
  if (from2 === `tip`) {
    tri = equilateralFromVertex(origin, arrowSize, triAngle);
    tailPoints = corners(
      fromTopLeft(
        { x: tri.a.x - tailLength, y: origin.y - tailThickness / 2 },
        tailLength,
        tailThickness
      )
    );
  } else if (from2 === `middle`) {
    const midX = tailLength + arrowSize / 2;
    const midY = tailThickness / 2;
    tri = equilateralFromVertex(
      {
        x: origin.x + arrowSize * 1.2,
        y: origin.y
      },
      arrowSize,
      triAngle
    );
    tailPoints = corners(
      fromTopLeft(
        { x: origin.x - midX, y: origin.y - midY },
        tailLength + arrowSize,
        tailThickness
      )
    );
  } else {
    tailPoints = corners(
      fromTopLeft(
        { x: origin.x, y: origin.y - tailThickness / 2 },
        tailLength,
        tailThickness
      )
    );
    tri = equilateralFromVertex(
      { x: origin.x + tailLength + arrowSize * 0.7, y: origin.y },
      arrowSize,
      triAngle
    );
  }
  const arrow2 = rotate2(
    [
      tailPoints[0],
      tailPoints[1],
      tri.a,
      tri.b,
      tri.c,
      tailPoints[2],
      tailPoints[3]
    ],
    angleRadian3,
    origin
  );
  return arrow2;
};

// ../geometry/src/circle/random.ts
var piPi4 = Math.PI * 2;
var randomPoint = (within, opts = {}) => {
  const offset2 = isCirclePositioned(within) ? within : { x: 0, y: 0 };
  const strategy = opts.strategy ?? `uniform`;
  const margin = opts.margin ?? 0;
  const radius = within.radius - margin;
  const rand = opts.randomSource ?? Math.random;
  switch (strategy) {
    case `naive`: {
      return sum(offset2, toCartesian(rand() * radius, rand() * piPi4));
    }
    case `uniform`: {
      return sum(offset2, toCartesian(Math.sqrt(rand()) * radius, rand() * piPi4));
    }
    default: {
      throw new Error(`Unknown strategy '${strategy}'. Expects 'uniform' or 'naive'`);
    }
  }
};

// ../geometry/src/rect/random.ts
var random2 = (rando) => {
  if (rando === void 0) rando = Math.random;
  return Object.freeze({
    x: rando(),
    y: rando(),
    width: rando(),
    height: rando()
  });
};
var randomPoint2 = (within, options = {}) => {
  const rand = options.randomSource ?? Math.random;
  const margin = options.margin ?? { x: 0, y: 0 };
  const x = rand() * (within.width - margin.x - margin.x);
  const y = rand() * (within.height - margin.y - margin.y);
  const pos = { x: x + margin.x, y: y + margin.y };
  return isPositioned(within) ? sum(pos, within) : Object.freeze(pos);
};

// ../geometry/src/circle/center.ts
var center2 = (circle3) => {
  return isCirclePositioned(circle3) ? Object.freeze({ x: circle3.x, y: circle3.y }) : Object.freeze({ x: circle3.radius, y: circle3.radius });
};

// ../geometry/src/triangle/guard.ts
var guard6 = (t2, name = `t`) => {
  if (t2 === void 0) throw new Error(`{$name} undefined`);
  guard(t2.a, name + `.a`);
  guard(t2.b, name + `.b`);
  guard(t2.c, name + `.c`);
};
var isTriangle = (p2) => {
  if (p2 === void 0) return false;
  const tri = p2;
  if (!isPoint(tri.a)) return false;
  if (!isPoint(tri.b)) return false;
  if (!isPoint(tri.c)) return false;
  return true;
};
var isEmpty4 = (t2) => isEmpty(t2.a) && isEmpty(t2.b) && isEmpty(t2.c);
var isPlaceholder4 = (t2) => isPlaceholder(t2.a) && isPlaceholder(t2.b) && isPlaceholder(t2.c);
var isEqual5 = (a2, b2) => isEqual2(a2.a, b2.a) && isEqual2(a2.b, b2.b) && isEqual2(a2.c, b2.c);

// ../geometry/src/triangle/centroid.ts
var centroid2 = (t2) => {
  guard6(t2);
  const total2 = reduce(
    [t2.a, t2.b, t2.c],
    (p2, accumulator) => ({
      x: p2.x + accumulator.x,
      y: p2.y + accumulator.y
    })
  );
  const div = {
    x: total2.x / 3,
    y: total2.y / 3
  };
  return div;
};

// ../geometry/src/shape/etc.ts
var randomPoint3 = (shape, opts = {}) => {
  if (isCirclePositioned(shape)) {
    return randomPoint(shape, opts);
  } else if (isRectPositioned(shape)) {
    return randomPoint2(shape, opts);
  }
  throw new Error(`Unknown shape. Only CirclePositioned and RectPositioned are supported.`);
};
var center3 = (shape) => {
  if (shape === void 0) {
    return Object.freeze({ x: 0.5, y: 0.5 });
  } else if (isRect(shape)) {
    return center(shape);
  } else if (isTriangle(shape)) {
    return centroid2(shape);
  } else if (isCircle(shape)) {
    return center2(shape);
  } else {
    throw new Error(`Unknown shape: ${JSON.stringify(shape)}`);
  }
};

// ../geometry/src/circle/is-contained-by.ts
var isContainedBy = (a2, b2, c4) => {
  const d2 = distanceCenter(a2, b2);
  if (isCircle(b2)) {
    return d2 < Math.abs(a2.radius - b2.radius);
  } else if (isPoint(b2)) {
    if (c4 === void 0) {
      return d2 <= a2.radius;
    } else {
      return d2 < Math.abs(a2.radius - c4);
    }
  } else throw new Error(`b parameter is expected to be CirclePositioned or Point`);
};

// ../geometry/src/circle/intersecting.ts
var isIntersecting2 = (a2, b2, c4) => {
  if (isEqual2(a2, b2)) return true;
  if (isContainedBy(a2, b2, c4)) return true;
  if (isCircle(b2)) {
    return circleCircle(a2, b2);
  } else if (isRectPositioned(b2)) {
    return circleRect(a2, b2);
  } else if (isPoint(b2) && c4 !== void 0) {
    return circleCircle(a2, { ...b2, radius: c4 });
  }
  return false;
};

// ../geometry/src/shape/is-intersecting.ts
var isIntersecting3 = (a2, b2) => {
  if (isCirclePositioned(a2)) {
    return isIntersecting2(a2, b2);
  } else if (isRectPositioned(a2)) {
    return isIntersecting(a2, b2);
  }
  throw new Error(
    `a or b are unknown shapes. a: ${JSON.stringify(a2)} b: ${JSON.stringify(b2)}`
  );
};

// ../geometry/src/shape/starburst.ts
var starburst = (outerRadius, points = 5, innerRadius, origin = Empty, opts) => {
  throwIntegerTest(points, `positive`, `points`);
  const angle = Math.PI * 2 / points;
  const angleHalf = angle / 2;
  const initialAngle = opts?.initialAngleRadian ?? -Math.PI / 2;
  if (innerRadius === void 0) innerRadius = outerRadius / 2;
  let a2 = initialAngle;
  const pts = [];
  for (let index = 0; index < points; index++) {
    const peak = toCartesian(outerRadius, a2, origin);
    const left = toCartesian(innerRadius, a2 - angleHalf, origin);
    const right = toCartesian(innerRadius, a2 + angleHalf, origin);
    pts.push(left, peak);
    if (index + 1 < points) pts.push(right);
    a2 += angle;
  }
  return pts;
};

// ../geometry/src/circle-packing.ts
var random3 = (circles, container, opts = {}) => {
  if (!Array.isArray(circles)) throw new Error(`Parameter 'circles' is not an array`);
  const attempts = opts.attempts ?? 2e3;
  const sorted = sortByNumericProperty(circles, `radius`);
  const positionedCircles = [];
  const willHit = (b2, radius) => positionedCircles.some((v) => isIntersecting2(v, b2, radius));
  while (sorted.length > 0) {
    const circle3 = sorted.pop();
    if (!circle3) break;
    const randomPointOpts = { ...opts, margin: { x: circle3.radius, y: circle3.radius } };
    for (let index = 0; index < attempts; index++) {
      const position = randomPoint3(container, randomPointOpts);
      if (!willHit(position, circle3.radius)) {
        positionedCircles.push(Object.freeze({ ...circle3, ...position }));
        break;
      }
    }
  }
  return positionedCircles;
};

// ../geometry/src/circle/index.ts
var circle_exports = {};
__export(circle_exports, {
  area: () => area,
  bbox: () => bbox3,
  center: () => center2,
  circumference: () => circumference,
  distanceCenter: () => distanceCenter,
  distanceFromExterior: () => distanceFromExterior,
  exteriorIntegerPoints: () => exteriorIntegerPoints,
  guard: () => guard5,
  guardPositioned: () => guardPositioned2,
  interiorIntegerPoints: () => interiorIntegerPoints,
  interpolate: () => interpolate4,
  intersectionLine: () => intersectionLine,
  intersections: () => intersections,
  isCircle: () => isCircle,
  isCirclePositioned: () => isCirclePositioned,
  isContainedBy: () => isContainedBy,
  isEqual: () => isEqual4,
  isIntersecting: () => isIntersecting2,
  isNaN: () => isNaN3,
  isPositioned: () => isPositioned2,
  length: () => length3,
  multiplyScalar: () => multiplyScalar2,
  nearest: () => nearest2,
  pointOnPerimeter: () => pointOnPerimeter,
  randomPoint: () => randomPoint,
  toPath: () => toPath2,
  toPositioned: () => toPositioned,
  toSvg: () => toSvg
});

// ../geometry/src/circle/area.ts
var area = (circle3) => {
  guard5(circle3);
  return Math.PI * circle3.radius * circle3.radius;
};

// ../geometry/src/rect/from-center.ts
var fromCenter = (origin, width, height4) => {
  guard(origin, `origin`);
  guardDim(width, `width`);
  guardDim(height4, `height`);
  const halfW = width / 2;
  const halfH = height4 / 2;
  return {
    x: origin.x - halfW,
    y: origin.y - halfH,
    width,
    height: height4
  };
};

// ../geometry/src/circle/bbox.ts
var bbox3 = (circle3) => {
  return isCirclePositioned(circle3) ? fromCenter(circle3, circle3.radius * 2, circle3.radius * 2) : { width: circle3.radius * 2, height: circle3.radius * 2, x: 0, y: 0 };
};

// ../geometry/src/circle/exterior-points.ts
function* exteriorIntegerPoints(circle3) {
  const { x, y, radius } = circle3;
  let xx = radius;
  let yy = 0;
  let radiusError = 1 - x;
  while (xx >= yy) {
    yield { x: xx + x, y: yy + y };
    yield { x: yy + x, y: xx + y };
    yield { x: -xx + x, y: yy + y };
    yield { x: -yy + x, y: xx + y };
    yield { x: -xx + x, y: -yy + y };
    yield { x: -yy + x, y: -xx + y };
    yield { x: xx + x, y: -yy + y };
    yield { x: yy + x, y: -xx + y };
    yy++;
    if (radiusError < 0) {
      radiusError += 2 * yy + 1;
    } else {
      xx--;
      radiusError += 2 * (yy - xx + 1);
    }
  }
}

// ../geometry/src/circle/interior-points.ts
function* interiorIntegerPoints(circle3) {
  const xMin = circle3.x - circle3.radius;
  const xMax = circle3.x + circle3.radius;
  const yMin = circle3.y - circle3.radius;
  const yMax = circle3.y + circle3.radius;
  for (let x = xMin; x < xMax; x++) {
    for (let y = yMin; y < yMax; y++) {
      const r = Math.abs(distance(circle3, x, y));
      if (r <= circle3.radius) yield { x, y };
    }
  }
}

// ../geometry/src/circle/perimeter.ts
var piPi5 = Math.PI * 2;
var nearest2 = (circle3, point2) => {
  const n2 = (a2) => {
    const l = Math.sqrt(Math.pow(point2.x - a2.x, 2) + Math.pow(point2.y - a2.y, 2));
    const x = a2.x + a2.radius * ((point2.x - a2.x) / l);
    const y = a2.y + a2.radius * ((point2.y - a2.y) / l);
    return { x, y };
  };
  if (Array.isArray(circle3)) {
    const pts = circle3.map((l) => n2(l));
    const dists = pts.map((p2) => distance(p2, point2));
    return Object.freeze(pts[minIndex(...dists)]);
  } else {
    return Object.freeze(n2(circle3));
  }
};
var pointOnPerimeter = (circle3, angleRadian3, origin) => {
  if (origin === void 0) {
    origin = isCirclePositioned(circle3) ? circle3 : { x: 0, y: 0 };
  }
  return {
    x: Math.cos(-angleRadian3) * circle3.radius + origin.x,
    y: Math.sin(-angleRadian3) * circle3.radius + origin.y
  };
};
var circumference = (circle3) => {
  guard5(circle3);
  return piPi5 * circle3.radius;
};
var length3 = (circle3) => circumference(circle3);

// ../geometry/src/circle/interpolate.ts
var piPi6 = Math.PI * 2;
var interpolate4 = (circle3, t2) => pointOnPerimeter(circle3, t2 * piPi6);

// ../geometry/src/circle/multiply.ts
function multiplyScalar2(a2, value) {
  if (isCirclePositioned(a2)) {
    const pt = multiplyScalar(a2, value);
    return Object.freeze({
      ...a2,
      ...pt,
      radius: a2.radius * value
    });
  } else {
    return Object.freeze({
      ...a2,
      radius: a2.radius * value
    });
  }
}

// ../geometry/src/circle/svg.ts
var toSvg = (a2, sweep, origin) => {
  if (isCircle(a2)) {
    if (origin !== void 0) {
      return toSvgFull(a2.radius, origin, sweep);
    }
    if (isCirclePositioned(a2)) {
      return toSvgFull(a2.radius, a2, sweep);
    } else throw new Error(`origin parameter needed for non-positioned circle`);
  } else {
    if (origin === void 0) {
      throw new Error(`origin parameter needed`);
    } else {
      return toSvgFull(a2, origin, sweep);
    }
  }
};
var toSvgFull = (radius, origin, sweep) => {
  const { x, y } = origin;
  const s = sweep ? `1` : `0`;
  return `
    M ${x}, ${y}
    m -${radius}, 0
    a ${radius},${radius} 0 1,${s} ${radius * 2},0
    a ${radius},${radius} 0 1,${s} -${radius * 2},0
  `.split(`
`);
};

// ../geometry/src/circle/to-path.ts
var toPath2 = (circle3) => {
  guard5(circle3);
  return {
    ...circle3,
    nearest: (point2) => nearest2(circle3, point2),
    /**
     * Returns a relative (0.0-1.0) point on a circle. 0=3 o'clock, 0.25=6 o'clock, 0.5=9 o'clock, 0.75=12 o'clock etc.
     * @param {t} Relative (0.0-1.0) point
     * @returns {Point} X,y
     */
    interpolate: (t2) => interpolate4(circle3, t2),
    bbox: () => bbox3(circle3),
    length: () => circumference(circle3),
    toSvgString: (sweep = true) => toSvg(circle3, sweep),
    relativePosition: (_point, _intersectionThreshold) => {
      throw new Error(`Not implemented`);
    },
    distanceToPoint: (_point) => {
      throw new Error(`Not implemented`);
    },
    kind: `circular`
  };
};

// ../geometry/src/circle/to-positioned.ts
var toPositioned = (circle3, defaultPositionOrX, y) => {
  if (isCirclePositioned(circle3)) return circle3;
  const pt = getPointParameter2(defaultPositionOrX, y);
  return Object.freeze({
    ...circle3,
    ...pt
  });
};

// ../geometry/src/rect/index.ts
var rect_exports = {};
__export(rect_exports, {
  Empty: () => Empty4,
  EmptyPositioned: () => EmptyPositioned,
  Placeholder: () => Placeholder4,
  PlaceholderPositioned: () => PlaceholderPositioned,
  applyDim: () => applyDim,
  applyFields: () => applyFields,
  applyMerge: () => applyMerge,
  applyScalar: () => applyScalar,
  area: () => area2,
  cardinal: () => cardinal,
  center: () => center,
  corners: () => corners,
  distanceFromCenter: () => distanceFromCenter,
  distanceFromExterior: () => distanceFromExterior2,
  divide: () => divide5,
  divideDim: () => divideDim,
  divideScalar: () => divideScalar,
  dividerByLargestDimension: () => dividerByLargestDimension,
  edges: () => edges,
  encompass: () => encompass,
  fromCenter: () => fromCenter,
  fromElement: () => fromElement,
  fromNumbers: () => fromNumbers3,
  fromTopLeft: () => fromTopLeft,
  getEdgeX: () => getEdgeX,
  getEdgeY: () => getEdgeY,
  getRectPositioned: () => getRectPositioned,
  getRectPositionedParameter: () => getRectPositionedParameter,
  guard: () => guard3,
  guardDim: () => guardDim,
  guardPositioned: () => guardPositioned,
  intersectsPoint: () => intersectsPoint,
  isEmpty: () => isEmpty2,
  isEqual: () => isEqual6,
  isEqualSize: () => isEqualSize,
  isIntersecting: () => isIntersecting,
  isPlaceholder: () => isPlaceholder2,
  isPositioned: () => isPositioned,
  isRect: () => isRect,
  isRectPositioned: () => isRectPositioned,
  lengths: () => lengths,
  maxFromCorners: () => maxFromCorners,
  multiply: () => multiply5,
  multiplyDim: () => multiplyDim,
  multiplyScalar: () => multiplyScalar3,
  nearestInternal: () => nearestInternal,
  perimeter: () => perimeter,
  random: () => random2,
  randomPoint: () => randomPoint2,
  subtract: () => subtract4,
  subtractOffset: () => subtractOffset,
  subtractSize: () => subtractSize,
  sum: () => sum4,
  sumOffset: () => sumOffset,
  toArray: () => toArray2
});

// ../geometry/src/rect/area.ts
var area2 = (rect2) => {
  guard3(rect2);
  return rect2.height * rect2.width;
};

// ../geometry/src/rect/apply.ts
function applyFields(op, rectOrWidth, heightValue) {
  let width = typeof rectOrWidth === `number` ? rectOrWidth : rectOrWidth.width;
  let height4 = typeof rectOrWidth === `number` ? heightValue : rectOrWidth.height;
  if (width === void 0) throw new Error(`Param 'width' undefined`);
  if (height4 === void 0) throw new Error(`Param 'height' undefined`);
  width = op(width, `width`);
  height4 = op(height4, `height`);
  if (typeof rectOrWidth === `object`) {
    if (isPositioned(rectOrWidth)) {
      const x = op(rectOrWidth.x, `x`);
      const y = op(rectOrWidth.y, `y`);
      return { ...rectOrWidth, width, height: height4, x, y };
    } else {
      return {
        ...rectOrWidth,
        width,
        height: height4
      };
    }
  }
  return { width, height: height4 };
}
function applyMerge(op, a2, b2, c4) {
  guard3(a2, `a`);
  if (isRect(b2)) {
    return isRectPositioned(a2) ? Object.freeze({
      ...a2,
      x: op(a2.x, b2.width),
      y: op(a2.y, b2.height),
      width: op(a2.width, b2.width),
      height: op(a2.height, b2.height)
    }) : Object.freeze({
      ...a2,
      width: op(a2.width, b2.width),
      height: op(a2.height, b2.height)
    });
  } else {
    if (typeof b2 !== `number`) {
      throw new TypeError(
        `Expected second parameter of type Rect or number. Got ${JSON.stringify(
          b2
        )}`
      );
    }
    if (typeof c4 !== `number`) throw new Error(`Expected third param as height. Got ${JSON.stringify(c4)}`);
    return isRectPositioned(a2) ? Object.freeze({
      ...a2,
      x: op(a2.x, b2),
      y: op(a2.y, c4),
      width: op(a2.width, b2),
      height: op(a2.height, c4)
    }) : Object.freeze({
      ...a2,
      width: op(a2.width, b2),
      height: op(a2.height, c4)
    });
  }
}
function applyScalar(op, rect2, parameter) {
  return isPositioned(rect2) ? Object.freeze({
    ...rect2,
    x: op(rect2.x, parameter),
    y: op(rect2.y, parameter),
    width: op(rect2.width, parameter),
    height: op(rect2.height, parameter)
  }) : Object.freeze({
    ...rect2,
    width: op(rect2.width, parameter),
    height: op(rect2.height, parameter)
  });
}
function applyDim(op, rect2, parameter) {
  return Object.freeze({
    ...rect2,
    width: op(rect2.width, parameter),
    height: op(rect2.height, parameter)
  });
}

// ../geometry/src/rect/cardinal.ts
var cardinal = (rect2, card) => {
  const { x, y, width, height: height4 } = rect2;
  switch (card) {
    case `nw`: {
      return Object.freeze({ x, y });
    }
    case `n`: {
      return Object.freeze({
        x: x + width / 2,
        y
      });
    }
    case `ne`: {
      return Object.freeze({
        x: x + width,
        y
      });
    }
    case `sw`: {
      return Object.freeze({ x, y: y + height4 });
    }
    case `s`: {
      return Object.freeze({
        x: x + width / 2,
        y: y + height4
      });
    }
    case `se`: {
      return Object.freeze({
        x: x + width,
        y: y + height4
      });
    }
    case `w`: {
      return Object.freeze({ x, y: y + height4 / 2 });
    }
    case `e`: {
      return Object.freeze({ x: x + width, y: y + height4 / 2 });
    }
    case `center`: {
      return Object.freeze({
        x: x + width / 2,
        y: y + height4 / 2
      });
    }
    default: {
      throw new Error(`Unknown direction: ${card}`);
    }
  }
};

// ../geometry/src/rect/divide.ts
var divideOp = (a2, b2) => a2 / b2;
function divide5(a2, b2, c4) {
  return applyMerge(divideOp, a2, b2, c4);
}
function divideScalar(rect2, amount) {
  return applyScalar(divideOp, rect2, amount);
}
function divideDim(rect2, amount) {
  return applyDim(divideOp, rect2, amount);
}

// ../geometry/src/rect/edges.ts
var edges = (rect2, origin) => {
  const c4 = corners(rect2, origin);
  return joinPointsToLines(...c4, c4[0]);
};
var getEdgeX = (rect2, edge) => {
  guard3(rect2);
  switch (edge) {
    case `top`: {
      return isPoint(rect2) ? rect2.x : 0;
    }
    case `bottom`: {
      return isPoint(rect2) ? rect2.x : 0;
    }
    case `left`: {
      return isPoint(rect2) ? rect2.y : 0;
    }
    case `right`: {
      return isPoint(rect2) ? rect2.x + rect2.width : rect2.width;
    }
  }
};
var getEdgeY = (rect2, edge) => {
  guard3(rect2);
  switch (edge) {
    case `top`: {
      return isPoint(rect2) ? rect2.y : 0;
    }
    case `bottom`: {
      return isPoint(rect2) ? rect2.y + rect2.height : rect2.height;
    }
    case `left`: {
      return isPoint(rect2) ? rect2.y : 0;
    }
    case `right`: {
      return isPoint(rect2) ? rect2.y : 0;
    }
  }
};

// ../geometry/src/rect/empty.ts
var Empty4 = Object.freeze({ width: 0, height: 0 });
var EmptyPositioned = Object.freeze({
  x: 0,
  y: 0,
  width: 0,
  height: 0
});

// ../geometry/src/rect/encompass.ts
var encompass = (rect2, ...points) => {
  const x = points.map((p2) => p2.x);
  const y = points.map((p2) => p2.y);
  let minX = Math.min(...x, rect2.x);
  let minY = Math.min(...y, rect2.y);
  let maxX = Math.max(...x, rect2.x + rect2.width);
  let maxY = Math.max(...y, rect2.y + rect2.height);
  let rectW = Math.max(rect2.width, maxX - minX);
  let rectH = Math.max(rect2.height, maxY - minY);
  return Object.freeze({
    ...rect2,
    x: minX,
    y: minY,
    width: rectW,
    height: rectH
  });
};

// ../geometry/src/rect/from-element.ts
var fromElement = (el) => ({
  width: el.clientWidth,
  height: el.clientHeight
});

// ../geometry/src/rect/from-numbers.ts
function fromNumbers3(xOrWidth, yOrHeight, width, height4) {
  if (width === void 0 || height4 === void 0) {
    if (typeof xOrWidth !== `number`) throw new Error(`width is not an number`);
    if (typeof yOrHeight !== `number`) {
      throw new TypeError(`height is not an number`);
    }
    return Object.freeze({ width: xOrWidth, height: yOrHeight });
  }
  if (typeof xOrWidth !== `number`) throw new Error(`x is not an number`);
  if (typeof yOrHeight !== `number`) throw new Error(`y is not an number`);
  if (typeof width !== `number`) throw new Error(`width is not an number`);
  if (typeof height4 !== `number`) throw new Error(`height is not an number`);
  return Object.freeze({ x: xOrWidth, y: yOrHeight, width, height: height4 });
}

// ../geometry/src/rect/get-rect-positionedparameter.ts
function getRectPositionedParameter(a2, b2, c4, d2) {
  if (typeof a2 === `number`) {
    if (typeof b2 === `number`) {
      if (typeof c4 === `number` && typeof d2 === `number`) {
        return { x: a2, y: b2, width: c4, height: d2 };
      } else if (isRect(c4)) {
        return { x: a2, y: b2, width: c4.width, height: c4.height };
      } else {
        throw new TypeError(`If params 'a' & 'b' are numbers, expect following parameters to be x,y or Rect`);
      }
    } else {
      throw new TypeError(`If parameter 'a' is a number, expect following parameters to be: y,w,h`);
    }
  } else if (isRectPositioned(a2)) {
    return a2;
  } else if (isRect(a2)) {
    if (typeof b2 === `number` && typeof c4 === `number`) {
      return { width: a2.width, height: a2.height, x: b2, y: c4 };
    } else if (isPoint(b2)) {
      return { width: a2.width, height: a2.height, x: b2.x, y: b2.y };
    } else {
      throw new TypeError(`If param 'a' is a Rect, expects following parameters to be x,y`);
    }
  } else if (isPoint(a2)) {
    if (typeof b2 === `number` && typeof c4 === `number`) {
      return { x: a2.x, y: a2.y, width: b2, height: c4 };
    } else if (isRect(b2)) {
      return { x: a2.x, y: a2.y, width: b2.width, height: b2.height };
    } else {
      throw new TypeError(`If parameter 'a' is a Point, expect following params to be: Rect or width,height`);
    }
  }
  throw new TypeError(`Expect a first parameter to be x,RectPositioned,Rect or Point`);
}

// ../geometry/src/rect/is-equal.ts
var isEqualSize = (a2, b2) => {
  if (a2 === void 0) throw new Error(`a undefined`);
  if (b2 === void 0) throw new Error(`b undefined`);
  return a2.width === b2.width && a2.height === b2.height;
};
var isEqual6 = (a2, b2) => {
  if (isPositioned(a2) && isPositioned(b2)) {
    if (!isEqual2(a2, b2)) return false;
    return a2.width === b2.width && a2.height === b2.height;
  } else if (!isPositioned(a2) && !isPositioned(b2)) {
    return a2.width === b2.width && a2.height === b2.height;
  } else {
    return false;
  }
};

// ../geometry/src/rect/lengths.ts
var lengths = (rect2) => {
  guardPositioned(rect2, `rect`);
  return edges(rect2).map((l) => length(l));
};

// ../geometry/src/rect/multiply.ts
var multiplyOp = (a2, b2) => a2 * b2;
function multiply5(a2, b2, c4) {
  return applyMerge(multiplyOp, a2, b2, c4);
}
function multiplyScalar3(rect2, amount) {
  return applyScalar(multiplyOp, rect2, amount);
}
function multiplyDim(rect2, amount) {
  return applyDim(multiplyOp, rect2, amount);
}

// ../geometry/src/rect/nearest.ts
var nearestInternal = (rect2, p2) => {
  let { x, y } = p2;
  if (x < rect2.x) x = rect2.x;
  else if (x > rect2.x + rect2.width) x = rect2.x + rect2.width;
  if (y < rect2.y) y = rect2.y;
  else if (y > rect2.y + rect2.height) y = rect2.y + rect2.height;
  return Object.freeze({ ...p2, x, y });
};

// ../geometry/src/rect/placeholder.ts
var Placeholder4 = Object.freeze({
  width: Number.NaN,
  height: Number.NaN
});
var PlaceholderPositioned = Object.freeze({
  x: Number.NaN,
  y: Number.NaN,
  width: Number.NaN,
  height: Number.NaN
});

// ../geometry/src/rect/perimeter.ts
var perimeter = (rect2) => {
  guard3(rect2);
  return rect2.height + rect2.height + rect2.width + rect2.width;
};

// ../geometry/src/rect/normalise-by-rect.ts
var dividerByLargestDimension = (rect2) => {
  const largest = Math.max(rect2.width, rect2.height);
  return (value) => {
    if (typeof value === `number`) {
      return value / largest;
    } else if (isPoint3d(value)) {
      return Object.freeze({
        ...value,
        x: value.x / largest,
        y: value.y / largest,
        z: value.x / largest
      });
    } else if (isPoint(value)) {
      return Object.freeze({
        ...value,
        x: value.x / largest,
        y: value.y / largest
      });
    } else throw new Error(`Param 'value' is neither number nor Point`);
  };
};

// ../geometry/src/rect/subtract.ts
var subtractOp = (a2, b2) => a2 - b2;
function subtract4(a2, b2, c4) {
  return applyMerge(subtractOp, a2, b2, c4);
}
function subtractSize(a2, b2, c4) {
  const w = typeof b2 === `number` ? b2 : b2.width;
  const h = typeof b2 === `number` ? c4 : b2.height;
  if (h === void 0) throw new Error(`Expected height as third parameter`);
  const r = {
    ...a2,
    width: a2.width - w,
    height: a2.height - h
  };
  return r;
}
function subtractOffset(a2, b2) {
  let x = 0;
  let y = 0;
  if (isPositioned(a2)) {
    x = a2.x;
    y = a2.y;
  }
  let xB = 0;
  let yB = 0;
  if (isPositioned(b2)) {
    xB = b2.x;
    yB = b2.y;
  }
  return Object.freeze({
    ...a2,
    x: x - xB,
    y: y - yB,
    width: a2.width - b2.width,
    height: a2.height - b2.height
  });
}

// ../geometry/src/rect/sum.ts
var sumOp = (a2, b2) => a2 + b2;
function sum4(a2, b2, c4) {
  return applyMerge(sumOp, a2, b2, c4);
}
function sumOffset(a2, b2) {
  let x = 0;
  let y = 0;
  if (isPositioned(a2)) {
    x = a2.x;
    y = a2.y;
  }
  let xB = 0;
  let yB = 0;
  if (isPositioned(b2)) {
    xB = b2.x;
    yB = b2.y;
  }
  return Object.freeze({
    ...a2,
    x: x + xB,
    y: y + yB,
    width: a2.width + b2.width,
    height: a2.height + b2.height
  });
}

// ../geometry/src/rect/to-array.ts
function toArray2(rect2) {
  if (isPositioned(rect2)) {
    return [rect2.x, rect2.y, rect2.width, rect2.height];
  } else if (isRect(rect2)) {
    return [rect2.width, rect2.height];
  } else {
    throw new Error(
      `Param 'rect' is not a rectangle. Got: ${JSON.stringify(rect2)}`
    );
  }
}

// ../geometry/src/path/index.ts
var path_exports = {};
__export(path_exports, {
  bbox: () => bbox4,
  computeDimensions: () => computeDimensions,
  distanceToPoint: () => distanceToPoint,
  fromPaths: () => fromPaths,
  getEnd: () => getEnd,
  getStart: () => getStart,
  guardContinuous: () => guardContinuous,
  interpolate: () => interpolate5,
  relativePosition: () => relativePosition2,
  setSegment: () => setSegment,
  toString: () => toString6,
  toSvgString: () => toSvgString2
});

// ../geometry/src/path/compound-path.ts
var compound_path_exports = {};
__export(compound_path_exports, {
  bbox: () => bbox4,
  computeDimensions: () => computeDimensions,
  distanceToPoint: () => distanceToPoint,
  fromPaths: () => fromPaths,
  guardContinuous: () => guardContinuous,
  interpolate: () => interpolate5,
  relativePosition: () => relativePosition2,
  setSegment: () => setSegment,
  toString: () => toString6,
  toSvgString: () => toSvgString2
});

// ../geometry/src/bezier/guard.ts
var isQuadraticBezier = (path2) => path2.quadratic !== void 0;
var isCubicBezier = (path2) => path2.cubic1 !== void 0 && path2.cubic2 !== void 0;

// ../geometry/src/path/start-end.ts
var getStart = function(path2) {
  if (isQuadraticBezier(path2)) return path2.a;
  else if (isLine(path2)) return path2.a;
  else throw new Error(`Unknown path type ${JSON.stringify(path2)}`);
};
var getEnd = function(path2) {
  if (isQuadraticBezier(path2)) return path2.b;
  else if (isLine(path2)) return path2.b;
  else throw new Error(`Unknown path type ${JSON.stringify(path2)}`);
};

// ../geometry/src/path/compound-path.ts
var setSegment = (compoundPath, index, path2) => {
  const existing = [...compoundPath.segments];
  existing[index] = path2;
  return fromPaths(...existing);
};
var interpolate5 = (paths2, t2, useWidth, dimensions) => {
  if (dimensions === void 0) {
    dimensions = computeDimensions(paths2);
  }
  const expected = t2 * (useWidth ? dimensions.totalWidth : dimensions.totalLength);
  let soFar = 0;
  const l = useWidth ? dimensions.widths : dimensions.lengths;
  for (const [index, element] of l.entries()) {
    if (soFar + element >= expected) {
      const relative2 = expected - soFar;
      let amt = relative2 / element;
      if (amt > 1) amt = 1;
      return paths2[index].interpolate(amt);
    } else soFar += element;
  }
  return { x: 0, y: 0 };
};
var distanceToPoint = (paths2, point2) => {
  if (paths2.length === 0) return 0;
  let distances = paths2.map((p2, index) => ({ path: p2, index, distance: p2.distanceToPoint(point2) }));
  distances = sortByNumericProperty(distances, `distance`);
  if (distances.length === 0) throw new Error(`Could not look up distances`);
  return distances[0].distance;
};
var relativePosition2 = (paths2, point2, intersectionThreshold, dimensions) => {
  if (dimensions === void 0) {
    dimensions = computeDimensions(paths2);
  }
  let distances = paths2.map((p2, index) => ({ path: p2, index, distance: p2.distanceToPoint(point2) }));
  distances = sortByNumericProperty(distances, `distance`);
  if (distances.length < 0) throw new Error(`Point does not intersect with path`);
  const d2 = distances[0];
  if (d2.distance > intersectionThreshold) throw new Error(`Point does not intersect with path. Minimum distance: ${d2.distance}, threshold: ${intersectionThreshold}`);
  const relativePositionOnPath = d2.path.relativePosition(point2, intersectionThreshold);
  let accumulated = 0;
  for (let index = 0; index < d2.index; index++) {
    accumulated += dimensions.lengths[index];
  }
  accumulated += dimensions.lengths[d2.index] * relativePositionOnPath;
  const accumulatedRel = accumulated / dimensions.totalLength;
  console.log(`acc: ${accumulated} rel: ${accumulatedRel} on path: ${relativePositionOnPath} path: ${d2.index}`);
  return accumulatedRel;
};
var computeDimensions = (paths2) => {
  const widths = paths2.map((l) => l.bbox().width);
  const lengths3 = paths2.map((l) => l.length());
  let totalLength = 0;
  let totalWidth = 0;
  for (const length5 of lengths3) {
    totalLength += length5;
  }
  for (const width of widths) {
    totalWidth += width;
  }
  return { totalLength, totalWidth, widths, lengths: lengths3 };
};
var bbox4 = (paths2) => {
  const boxes = paths2.map((p2) => p2.bbox());
  const corners3 = boxes.flatMap((b2) => corners(b2));
  return bbox(...corners3);
};
var toString6 = (paths2) => paths2.map((p2) => p2.toString()).join(`, `);
var guardContinuous = (paths2) => {
  let lastPos = getEnd(paths2[0]);
  for (let index = 1; index < paths2.length; index++) {
    const start = getStart(paths2[index]);
    if (!isEqual2(start, lastPos)) throw new Error(`Path index ${index} does not start at prior path end. Start: ${start.x},${start.y} expected: ${lastPos.x},${lastPos.y}`);
    lastPos = getEnd(paths2[index]);
  }
};
var toSvgString2 = (paths2) => paths2.flatMap((p2) => p2.toSvgString());
var fromPaths = (...paths2) => {
  guardContinuous(paths2);
  const dims = computeDimensions(paths2);
  return Object.freeze({
    segments: paths2,
    length: () => dims.totalLength,
    nearest: (_) => {
      throw new Error(`not implemented`);
    },
    interpolate: (t2, useWidth = false) => interpolate5(paths2, t2, useWidth, dims),
    relativePosition: (point2, intersectionThreshold) => relativePosition2(paths2, point2, intersectionThreshold, dims),
    distanceToPoint: (point2) => distanceToPoint(paths2, point2),
    bbox: () => bbox4(paths2),
    toString: () => toString6(paths2),
    toSvgString: () => toSvgString2(paths2),
    kind: `compound`
  });
};

// ../geometry/src/grid/index.ts
var grid_exports = {};
__export(grid_exports, {
  Array1d: () => array_1d_exports,
  Array2d: () => array_2d_exports,
  As: () => as_exports,
  By: () => enumerators_exports,
  Visit: () => visitors_exports,
  allDirections: () => allDirections,
  applyBounds: () => applyBounds,
  asRectangles: () => asRectangles,
  cellAtPoint: () => cellAtPoint,
  cellEquals: () => cellEquals,
  cellFromIndex: () => cellFromIndex,
  cellKeyString: () => cellKeyString,
  cellMiddle: () => cellMiddle,
  crossDirections: () => crossDirections,
  getLine: () => getLine,
  getVectorFromCardinal: () => getVectorFromCardinal,
  guardCell: () => guardCell,
  guardGrid: () => guardGrid,
  indexFromCell: () => indexFromCell,
  inside: () => inside,
  isCell: () => isCell,
  isEqual: () => isEqual7,
  neighbourList: () => neighbourList,
  neighbours: () => neighbours,
  offset: () => offset,
  offsetCardinals: () => offsetCardinals,
  randomNeighbour: () => randomNeighbour,
  rectangleForCell: () => rectangleForCell,
  simpleLine: () => simpleLine,
  toArray2d: () => toArray2d,
  values: () => values
});

// ../geometry/src/grid/inside.ts
var inside = (grid3, cell) => {
  if (cell.x < 0 || cell.y < 0) return false;
  if (cell.x >= grid3.cols || cell.y >= grid3.rows) return false;
  return true;
};

// ../geometry/src/grid/guards.ts
var isCell = (cell) => {
  if (cell === void 0) return false;
  return `x` in cell && `y` in cell;
};
var guardCell = (cell, parameterName = `Param`, grid3) => {
  if (cell === void 0) {
    throw new Error(parameterName + ` is undefined. Expecting {x,y}`);
  }
  if (cell.x === void 0) throw new Error(parameterName + `.x is undefined`);
  if (cell.y === void 0) throw new Error(parameterName + `.y is undefined`);
  if (Number.isNaN(cell.x)) throw new Error(parameterName + `.x is NaN`);
  if (Number.isNaN(cell.y)) throw new Error(parameterName + `.y is NaN`);
  if (!Number.isInteger(cell.x)) {
    throw new TypeError(parameterName + `.x is non-integer`);
  }
  if (!Number.isInteger(cell.y)) {
    throw new TypeError(parameterName + `.y is non-integer`);
  }
  if (grid3 !== void 0 && !inside(grid3, cell)) {
    throw new Error(
      `${parameterName} is outside of grid. Cell: ${cell.x},${cell.y} Grid: ${grid3.cols}, ${grid3.rows}`
    );
  }
};
var guardGrid = (grid3, parameterName = `Param`) => {
  if (grid3 === void 0) {
    throw new Error(`${parameterName} is undefined. Expecting grid.`);
  }
  if (!(`rows` in grid3)) throw new Error(`${parameterName}.rows is undefined`);
  if (!(`cols` in grid3)) throw new Error(`${parameterName}.cols is undefined`);
  if (!Number.isInteger(grid3.rows)) {
    throw new TypeError(`${parameterName}.rows is not an integer`);
  }
  if (!Number.isInteger(grid3.cols)) {
    throw new TypeError(`${parameterName}.cols is not an integer`);
  }
};

// ../geometry/src/grid/apply-bounds.ts
var applyBounds = function(grid3, cell, wrap7 = `undefined`) {
  guardGrid(grid3, `grid`);
  guardCell(cell, `cell`);
  let x = cell.x;
  let y = cell.y;
  switch (wrap7) {
    case `wrap`: {
      x = x % grid3.cols;
      y = y % grid3.rows;
      if (x < 0) x = grid3.cols + x;
      else if (x >= grid3.cols) {
        x -= grid3.cols;
      }
      if (y < 0) y = grid3.rows + y;
      else if (y >= grid3.rows) {
        y -= grid3.rows;
      }
      x = Math.abs(x);
      y = Math.abs(y);
      break;
    }
    case `stop`: {
      x = clampIndex(x, grid3.cols);
      y = clampIndex(y, grid3.rows);
      break;
    }
    case `undefined`: {
      if (x < 0 || y < 0) return;
      if (x >= grid3.cols || y >= grid3.rows) return;
      break;
    }
    case `unbounded`: {
      break;
    }
    default: {
      throw new Error(`Unknown BoundsLogic '${wrap7}'. Expected: wrap, stop, undefined or unbounded`);
    }
  }
  return Object.freeze({ x, y });
};

// ../geometry/src/grid/array-1d.ts
var array_1d_exports = {};
__export(array_1d_exports, {
  access: () => access,
  createArray: () => createArray,
  createMutable: () => createMutable,
  set: () => set,
  setMutate: () => setMutate,
  wrap: () => wrap3,
  wrapMutable: () => wrapMutable
});
var access = (array3, cols) => {
  const grid3 = gridFromArrayDimensions(array3, cols);
  const fn = (cell, wrap7 = `undefined`) => accessWithGrid(grid3, array3, cell, wrap7);
  return fn;
};
var accessWithGrid = (grid3, array3, cell, wrap7) => {
  const index = indexFromCell(grid3, cell, wrap7);
  if (index === void 0) return void 0;
  return array3[index];
};
var setMutate = (array3, cols) => {
  const grid3 = gridFromArrayDimensions(array3, cols);
  return (value, cell, wrap7 = `undefined`) => setMutateWithGrid(grid3, array3, value, cell, wrap7);
};
var setMutateWithGrid = (grid3, array3, value, cell, wrap7) => {
  const index = indexFromCell(grid3, cell, wrap7);
  if (index === void 0) throw new RangeError(`Cell (${cell.x},${cell.y}) is out of range of grid cols: ${grid3.cols} rows: ${grid3.rows}`);
  array3[index] = value;
  return array3;
};
var set = (array3, cols) => {
  const grid3 = gridFromArrayDimensions(array3, cols);
  return (value, cell, wrap7) => setWithGrid(grid3, array3, value, cell, wrap7);
};
var setWithGrid = (grid3, array3, value, cell, wrap7) => {
  const index = indexFromCell(grid3, cell, wrap7);
  if (index === void 0) throw new RangeError(`Cell (${cell.x},${cell.y}) is out of range of grid cols: ${grid3.cols} rows: ${grid3.rows}`);
  const copy = [...array3];
  copy[index] = value;
  array3 = copy;
  return copy;
};
var gridFromArrayDimensions = (array3, cols) => {
  const grid3 = { cols, rows: Math.ceil(array3.length / cols) };
  return grid3;
};
var wrapMutable = (array3, cols) => {
  const grid3 = gridFromArrayDimensions(array3, cols);
  return {
    ...grid3,
    get: access(array3, cols),
    set: setMutate(array3, cols),
    get array() {
      return array3;
    }
  };
};
var wrap3 = (array3, cols) => {
  const grid3 = gridFromArrayDimensions(array3, cols);
  return {
    ...grid3,
    get: (cell, boundsLogic = `undefined`) => accessWithGrid(grid3, array3, cell, boundsLogic),
    set: (value, cell, boundsLogic = `undefined`) => {
      array3 = setWithGrid(grid3, array3, value, cell, boundsLogic);
      return wrap3(array3, cols);
    },
    get array() {
      return array3;
    }
  };
};
var createArray = (initialValue, rowsOrGrid, columns2) => {
  const rows2 = typeof rowsOrGrid === `number` ? rowsOrGrid : rowsOrGrid.rows;
  const cols = typeof rowsOrGrid === `object` ? rowsOrGrid.cols : columns2;
  if (!cols) throw new Error(`Parameter 'columns' missing`);
  throwIntegerTest(rows2, `aboveZero`, `rows`);
  throwIntegerTest(cols, `aboveZero`, `cols`);
  const t2 = [];
  const total2 = rows2 * cols;
  for (let index = 0; index < total2; index++) {
    t2[index] = initialValue;
  }
  return t2;
};
var createMutable = (initialValue, rowsOrGrid, columns2) => {
  const rows2 = typeof rowsOrGrid === `number` ? rowsOrGrid : rowsOrGrid.rows;
  const cols = typeof rowsOrGrid === `object` ? rowsOrGrid.cols : columns2;
  if (!cols) throw new Error(`Parameter 'columns' missing`);
  const array3 = createArray(initialValue, rows2, cols);
  return wrapMutable(array3, cols);
};

// ../geometry/src/grid/array-2d.ts
var array_2d_exports = {};
__export(array_2d_exports, {
  access: () => access2,
  create: () => create,
  set: () => set2,
  setMutate: () => setMutate2,
  wrap: () => wrap4,
  wrapMutable: () => wrapMutable2
});
var create = (array3) => {
  let colLen = NaN;
  for (const row of array3) {
    if (Number.isNaN(colLen)) {
      colLen = row.length;
    } else {
      if (colLen !== row.length) throw new Error(`Array does not have uniform column length`);
    }
  }
  return { rows: array3.length, cols: colLen };
};
var setMutate2 = (array3) => {
  const grid3 = create(array3);
  return (value, cell, wrap7 = `undefined`) => setMutateWithGrid2(grid3, array3, value, cell, wrap7);
};
var setMutateWithGrid2 = (grid3, array3, value, cell, bounds) => {
  let boundCell = applyBounds(grid3, cell, bounds);
  if (boundCell === void 0) throw new RangeError(`Cell (${cell.x},${cell.y}) is out of range of grid cols: ${grid3.cols} rows: ${grid3.rows}`);
  array3[boundCell.y][boundCell.x] = value;
  return array3;
};
var access2 = (array3) => {
  const grid3 = create(array3);
  const fn = (cell, wrap7 = `undefined`) => accessWithGrid2(grid3, array3, cell, wrap7);
  return fn;
};
var accessWithGrid2 = (grid3, array3, cell, wrap7) => {
  let boundCell = applyBounds(grid3, cell, wrap7);
  if (boundCell === void 0) return void 0;
  return array3[boundCell.y][boundCell.x];
};
var wrapMutable2 = (array3) => {
  const grid3 = create(array3);
  return {
    ...grid3,
    get: access2(array3),
    set: setMutate2(array3),
    get array() {
      return array3;
    }
  };
};
var set2 = (array3) => {
  const grid3 = create(array3);
  return (value, cell, wrap7) => setWithGrid2(grid3, array3, value, cell, wrap7);
};
var setWithGrid2 = (grid3, array3, value, cell, wrap7) => {
  let boundCell = applyBounds(grid3, cell, wrap7);
  if (boundCell === void 0) throw new RangeError(`Cell (${cell.x},${cell.y}) is out of range of grid cols: ${grid3.cols} rows: ${grid3.rows}`);
  let copyWhole = [...array3];
  let copyRow = [...copyWhole[boundCell.y]];
  copyRow[boundCell.x] = value;
  copyWhole[boundCell.y] = copyRow;
  array3 = copyWhole;
  return copyWhole;
};
var wrap4 = (array3) => {
  const grid3 = create(array3);
  return {
    ...grid3,
    get: (cell, boundsLogic = `undefined`) => accessWithGrid2(grid3, array3, cell, boundsLogic),
    set: (value, cell, boundsLogic = `undefined`) => {
      array3 = setWithGrid2(grid3, array3, value, cell, boundsLogic);
      return wrap4(array3);
    },
    get array() {
      return array3;
    }
  };
};

// ../geometry/src/grid/as.ts
var as_exports = {};
__export(as_exports, {
  columns: () => columns,
  rows: () => rows
});

// ../geometry/src/grid/values.ts
function* values(grid3, iter) {
  for (const d2 of iter) {
    if (Array.isArray(d2)) {
      yield d2.map((v) => grid3.get(v, `undefined`));
    } else {
      yield grid3.get(d2, `undefined`);
    }
  }
}

// ../geometry/src/grid/enumerators/cells.ts
function* cells(grid3, start, wrap7 = true) {
  if (!start) start = { x: 0, y: 0 };
  guardGrid(grid3, `grid`);
  guardCell(start, `start`, grid3);
  let { x, y } = start;
  let canMove = true;
  do {
    yield { x, y };
    x++;
    if (x === grid3.cols) {
      y++;
      x = 0;
    }
    if (y === grid3.rows) {
      if (wrap7) {
        y = 0;
        x = 0;
      } else {
        canMove = false;
      }
    }
    if (x === start.x && y === start.y) canMove = false;
  } while (canMove);
}
function* cellValues(grid3, start, wrap7 = true) {
  yield* values(grid3, cells(grid3, start, wrap7));
}
function* cellsAndValues(grid3, start, wrap7 = true) {
  for (const cell of cells(grid3, start, wrap7)) {
    yield { cell, value: grid3.get(cell) };
  }
}

// ../geometry/src/grid/as.ts
var rows = function* (grid3, start) {
  if (!start) start = { x: 0, y: 0 };
  let row = start.y;
  let rowCells = [];
  for (const c4 of cells(grid3, start)) {
    if (c4.y === row) {
      rowCells.push(c4);
    } else {
      yield rowCells;
      rowCells = [c4];
      row = c4.y;
    }
  }
  if (rowCells.length > 0) yield rowCells;
};
function* columns(grid3, start) {
  if (!start) start = { x: 0, y: 0 };
  for (let x = start.x; x < grid3.cols; x++) {
    let colCells = [];
    for (let y = start.y; y < grid3.rows; y++) {
      colCells.push({ x, y });
    }
    yield colCells;
  }
}

// ../geometry/src/grid/offset.ts
var offset = function(grid3, start, vector, bounds = `undefined`) {
  return applyBounds(grid3, {
    x: start.x + vector.x,
    y: start.y + vector.y
  }, bounds);
};

// ../geometry/src/grid/directions.ts
var allDirections = Object.freeze([
  `n`,
  `ne`,
  `nw`,
  `e`,
  `s`,
  `se`,
  `sw`,
  `w`
]);
var crossDirections = Object.freeze([
  `n`,
  `e`,
  `s`,
  `w`
]);
var offsetCardinals = (grid3, start, steps2, bounds = `stop`) => {
  guardGrid(grid3, `grid`);
  guardCell(start, `start`);
  throwIntegerTest(steps2, `aboveZero`, `steps`);
  const directions = allDirections;
  const vectors = directions.map((d2) => getVectorFromCardinal(d2, steps2));
  const cells2 = directions.map(
    (d2, index) => offset(grid3, start, vectors[index], bounds)
  );
  return zipKeyValue(directions, cells2);
};
var getVectorFromCardinal = (cardinal2, multiplier = 1) => {
  let v;
  switch (cardinal2) {
    case `n`: {
      v = { x: 0, y: -1 * multiplier };
      break;
    }
    case `ne`: {
      v = { x: 1 * multiplier, y: -1 * multiplier };
      break;
    }
    case `e`: {
      v = { x: 1 * multiplier, y: 0 };
      break;
    }
    case `se`: {
      v = { x: 1 * multiplier, y: 1 * multiplier };
      break;
    }
    case `s`: {
      v = { x: 0, y: 1 * multiplier };
      break;
    }
    case `sw`: {
      v = { x: -1 * multiplier, y: 1 * multiplier };
      break;
    }
    case `w`: {
      v = { x: -1 * multiplier, y: 0 };
      break;
    }
    case `nw`: {
      v = { x: -1 * multiplier, y: -1 * multiplier };
      break;
    }
    default: {
      v = { x: 0, y: 0 };
    }
  }
  return Object.freeze(v);
};

// ../geometry/src/grid/enumerators/index.ts
var enumerators_exports = {};
__export(enumerators_exports, {
  cellValues: () => cellValues,
  cells: () => cells,
  cellsAndValues: () => cellsAndValues
});

// ../geometry/src/grid/geometry.ts
var getLine = (start, end) => {
  guardCell(start);
  guardCell(end);
  let startX = start.x;
  let startY = start.y;
  const dx = Math.abs(end.x - startX);
  const dy = Math.abs(end.y - startY);
  const sx = startX < end.x ? 1 : -1;
  const sy = startY < end.y ? 1 : -1;
  let error = dx - dy;
  const cells2 = [];
  while (true) {
    cells2.push(Object.freeze({ x: startX, y: startY }));
    if (startX === end.x && startY === end.y) break;
    const error2 = 2 * error;
    if (error2 > -dy) {
      error -= dy;
      startX += sx;
    }
    if (error2 < dx) {
      error += dx;
      startY += sy;
    }
  }
  return cells2;
};
var simpleLine = function(start, end, endInclusive = false) {
  const cells2 = [];
  if (start.x === end.x) {
    const lastY = endInclusive ? end.y + 1 : end.y;
    for (let y = start.y; y < lastY; y++) {
      cells2.push({ x: start.x, y });
    }
  } else if (start.y === end.y) {
    const lastX = endInclusive ? end.x + 1 : end.x;
    for (let x = start.x; x < lastX; x++) {
      cells2.push({ x, y: start.y });
    }
  } else {
    throw new Error(
      `Only does vertical and horizontal: ${start.x},${start.y} - ${end.x},${end.y}`
    );
  }
  return cells2;
};

// ../geometry/src/grid/indexing.ts
var indexFromCell = (grid3, cell, wrap7) => {
  guardGrid(grid3, `grid`);
  if (cell.x < 0) {
    switch (wrap7) {
      case `stop`: {
        cell = { ...cell, x: 0 };
        break;
      }
      case `unbounded`: {
        throw new Error(`unbounded not supported`);
      }
      case `undefined`: {
        return void 0;
      }
      case `wrap`: {
        cell = offset(grid3, { x: 0, y: cell.y }, { x: cell.x, y: 0 }, `wrap`);
        break;
      }
    }
  }
  if (cell.y < 0) {
    switch (wrap7) {
      case `stop`: {
        cell = { ...cell, y: 0 };
        break;
      }
      case `unbounded`: {
        throw new Error(`unbounded not supported`);
      }
      case `undefined`: {
        return void 0;
      }
      case `wrap`: {
        cell = { ...cell, y: grid3.rows + cell.y };
        break;
      }
    }
  }
  if (cell.x >= grid3.cols) {
    switch (wrap7) {
      case `stop`: {
        cell = { ...cell, x: grid3.cols - 1 };
        break;
      }
      case `unbounded`: {
        throw new Error(`unbounded not supported`);
      }
      case `undefined`: {
        return void 0;
      }
      case `wrap`: {
        cell = { ...cell, x: cell.x % grid3.cols };
        break;
      }
    }
  }
  if (cell.y >= grid3.rows) {
    switch (wrap7) {
      case `stop`: {
        cell = { ...cell, y: grid3.rows - 1 };
        break;
      }
      case `unbounded`: {
        throw new Error(`unbounded not supported`);
      }
      case `undefined`: {
        return void 0;
      }
      case `wrap`: {
        cell = { ...cell, y: cell.y % grid3.rows };
        break;
      }
    }
  }
  const index = cell.y * grid3.cols + cell.x;
  return index;
};
var cellFromIndex = (colsOrGrid, index) => {
  let cols = 0;
  cols = typeof colsOrGrid === `number` ? colsOrGrid : colsOrGrid.cols;
  throwIntegerTest(cols, `aboveZero`, `colsOrGrid`);
  return {
    x: index % cols,
    y: Math.floor(index / cols)
  };
};

// ../geometry/src/grid/is-equal.ts
var isEqual7 = (a2, b2) => {
  if (b2 === void 0) return false;
  if (a2 === void 0) return false;
  if (`rows` in a2 && `cols` in a2) {
    if (`rows` in b2 && `cols` in b2) {
      if (a2.rows !== b2.rows || a2.cols !== b2.cols) return false;
    } else return false;
  }
  if (`size` in a2) {
    if (`size` in b2) {
      if (a2.size !== b2.size) return false;
    } else return false;
  }
  return true;
};
var cellEquals = (a2, b2) => {
  if (b2 === void 0) return false;
  if (a2 === void 0) return false;
  return a2.x === b2.x && a2.y === b2.y;
};

// ../geometry/src/grid/neighbour.ts
var randomNeighbour = (nbos) => randomElement2(nbos);
var isNeighbour = (n2) => {
  if (n2 === void 0) return false;
  if (n2[1] === void 0) return false;
  return true;
};
var neighbourList = (grid3, cell, directions, bounds) => {
  const cellNeighbours = neighbours(grid3, cell, bounds, directions);
  const entries = Object.entries(cellNeighbours);
  return entries.filter((n2) => isNeighbour(n2));
};
var neighbours = (grid3, cell, bounds = `undefined`, directions) => {
  const directories = directions ?? allDirections;
  const points = directories.map(
    (c4) => offset(grid3, cell, getVectorFromCardinal(c4), bounds)
  );
  return zipKeyValue(directories, points);
};

// ../geometry/src/grid/to-array.ts
var toArray2d = (grid3, initialValue) => {
  const returnValue = [];
  for (let row = 0; row < grid3.rows; row++) {
    returnValue[row] = Array.from({ length: grid3.cols });
    if (initialValue) {
      for (let col = 0; col < grid3.cols; col++) {
        returnValue[row][col] = initialValue;
      }
    }
  }
  return returnValue;
};

// ../geometry/src/grid/to-string.ts
var cellKeyString = (v) => `Cell{${v.x},${v.y}}`;

// ../geometry/src/grid/visual.ts
function* asRectangles(grid3) {
  for (const c4 of cells(grid3)) {
    yield rectangleForCell(grid3, c4);
  }
}
var cellAtPoint = (grid3, position) => {
  const size = grid3.size;
  throwNumberTest(size, `positive`, `grid.size`);
  if (position.x < 0 || position.y < 0) return;
  const x = Math.floor(position.x / size);
  const y = Math.floor(position.y / size);
  if (x >= grid3.cols) return;
  if (y >= grid3.rows) return;
  return { x, y };
};
var rectangleForCell = (grid3, cell) => {
  guardCell(cell);
  const size = grid3.size;
  const x = cell.x * size;
  const y = cell.y * size;
  const r = fromTopLeft({ x, y }, size, size);
  return r;
};
var cellMiddle = (grid3, cell) => {
  guardCell(cell);
  const size = grid3.size;
  const x = cell.x * size;
  const y = cell.y * size;
  return Object.freeze({ x: x + size / 2, y: y + size / 2 });
};

// ../geometry/src/grid/visitors/index.ts
var visitors_exports = {};
__export(visitors_exports, {
  breadthLogic: () => breadthLogic,
  columnLogic: () => columnLogic,
  create: () => create2,
  depthLogic: () => depthLogic,
  neighboursLogic: () => neighboursLogic,
  randomContiguousLogic: () => randomContiguousLogic,
  randomLogic: () => randomLogic,
  rowLogic: () => rowLogic,
  stepper: () => stepper,
  visitByNeighbours: () => visitByNeighbours,
  withLogic: () => withLogic
});

// ../geometry/src/grid/visitors/breadth.ts
var breadthLogic = () => {
  return {
    select: (nbos) => nbos[0]
  };
};

// ../geometry/src/grid/visitors/cell-neighbours.ts
var neighboursLogic = () => {
  return {
    select: (neighbours2) => {
      return neighbours2.at(0);
    },
    getNeighbours: (grid3, cell) => {
      return neighbourList(grid3, cell, allDirections, `undefined`);
    }
  };
};

// ../geometry/src/grid/visitors/columns.ts
var columnLogic = (opts = {}) => {
  const reversed = opts.reversed ?? false;
  return {
    select: (nbos) => nbos.find((n2) => n2[0] === (reversed ? `n` : `s`)),
    getNeighbours: (grid3, cell) => {
      if (reversed) {
        if (cell.y > 0) {
          cell = { x: cell.x, y: cell.y - 1 };
        } else {
          if (cell.x === 0) {
            cell = { x: grid3.cols - 1, y: grid3.rows - 1 };
          } else {
            cell = { x: cell.x - 1, y: grid3.rows - 1 };
          }
        }
      } else {
        if (cell.y < grid3.rows - 1) {
          cell = { x: cell.x, y: cell.y + 1 };
        } else {
          if (cell.x < grid3.cols - 1) {
            cell = { x: cell.x + 1, y: 0 };
          } else {
            cell = { x: 0, y: 0 };
          }
        }
      }
      return [[reversed ? `n` : `s`, cell]];
    }
  };
};

// ../geometry/src/grid/visitors/depth.ts
var depthLogic = () => {
  return {
    select: (nbos) => nbos.at(-1)
  };
};

// ../geometry/src/grid/visitors/random.ts
var randomLogic = () => {
  return {
    getNeighbours: (grid3, cell) => {
      const t2 = [];
      for (const c4 of cells(grid3, cell)) {
        t2.push([`n`, c4]);
      }
      return t2;
    },
    select: randomNeighbour
  };
};

// ../geometry/src/grid/visitors/random-contiguous.ts
var randomContiguousLogic = () => {
  return {
    select: randomNeighbour
  };
};

// ../geometry/src/grid/visitors/rows.ts
var rowLogic = (opts = {}) => {
  const reversed = opts.reversed ?? false;
  return {
    select: (nbos) => nbos.find((n2) => n2[0] === (reversed ? `w` : `e`)),
    getNeighbours: (grid3, cell) => {
      if (reversed) {
        if (cell.x > 0) {
          cell = { x: cell.x - 1, y: cell.y };
        } else {
          if (cell.y > 0) {
            cell = { x: grid3.cols - 1, y: cell.y - 1 };
          } else {
            cell = { x: grid3.cols - 1, y: grid3.rows - 1 };
          }
        }
      } else {
        if (cell.x < grid3.rows - 1) {
          cell = { x: cell.x + 1, y: cell.y };
        } else {
          if (cell.y < grid3.rows - 1) {
            cell = { x: 0, y: cell.y + 1 };
          } else {
            cell = { x: 0, y: 0 };
          }
        }
      }
      return [[reversed ? `w` : `e`, cell]];
    }
  };
};

// ../events/src/map-of.ts
var MapOfSimple = class {
  #store = /* @__PURE__ */ new Map();
  /**
   * Gets a copy of the underlying array storing values at `key`, or an empty array if
   * key does not exist
   * @param key 
   * @returns 
   */
  get(key) {
    const arr = this.#store.get(key);
    if (!arr) return [];
    return [...arr];
  }
  /**
   * Returns the number of values stored under `key`
   * @param key 
   * @returns 
   */
  size(key) {
    const arr = this.#store.get(key);
    if (!arr) return 0;
    return arr.length;
  }
  /**
   * Iterate over all values contained under `key`
   * @param key 
   * @returns 
   */
  *iterateKey(key) {
    const arr = this.#store.get(key);
    if (!arr) return;
    yield* arr.values();
  }
  /**
   * Iterate all values, regardless of key
   */
  *iterateValues() {
    for (const key of this.#store.keys()) {
      yield* this.iterateKey(key);
    }
  }
  /**
   * Iterate all keys
   */
  *iterateKeys() {
    yield* this.#store.keys();
  }
  addKeyedValues(key, ...values2) {
    let arr = this.#store.get(key);
    if (!arr) {
      arr = [];
      this.#store.set(key, arr);
    }
    arr.push(...values2);
  }
  deleteKeyValue(key, value) {
    const arr = this.#store.get(key);
    if (!arr) return false;
    const arrCopy = arr.filter((v) => v !== value);
    if (arrCopy.length === arr.length) return false;
    this.#store.set(key, arrCopy);
    return true;
  }
  clear() {
    this.#store.clear();
  }
};

// ../events/src/simple-event-emitter.ts
var SimpleEventEmitter = class {
  #listeners = new MapOfSimple();
  #disposed = false;
  dispose() {
    if (this.#disposed) return;
    this.clearEventListeners();
  }
  get isDisposed() {
    return this.#disposed;
  }
  /**
   * Fire event
   * @param type Type of event
   * @param args Arguments for event
   * @returns
   */
  fireEvent(type2, args) {
    if (this.#disposed) throw new Error(`Disposed`);
    for (const l of this.#listeners.iterateKey(type2)) {
      l(args, this);
    }
  }
  /**
   * Adds event listener.
   * 
   * @throws Error if emitter is disposed
   * @typeParam K - Events
   * @param name Event name
   * @param listener Event handler
   */
  addEventListener(name, listener) {
    if (this.#disposed) throw new Error(`Disposed`);
    this.#listeners.addKeyedValues(
      name,
      listener
    );
  }
  /**
   * Remove event listener
   *
   * @param listener
   */
  removeEventListener(type2, listener) {
    if (this.#disposed) return;
    this.#listeners.deleteKeyValue(
      type2,
      listener
    );
  }
  /**
   * Clear all event listeners
   * @private
   */
  clearEventListeners() {
    if (this.#disposed) return;
    this.#listeners.clear();
  }
};

// ../collections/src/set/set-mutable.ts
var mutable = (keyString) => new SetStringMutable(keyString);
var SetStringMutable = class extends SimpleEventEmitter {
  // ✔ UNIT TESTED
  /* eslint-disable functional/prefer-readonly-type */
  store = /* @__PURE__ */ new Map();
  keyString;
  /**
   * Constructor
   * @param keyString Function which returns a string version of added items. If unspecified `JSON.stringify`
   */
  constructor(keyString) {
    super();
    this.keyString = keyString ?? defaultKeyer;
  }
  /**
   * Number of items stored in set
   */
  get size() {
    return this.store.size;
  }
  /**
   * Adds one or more items to set. `add` event is fired for each item
   * @param values items to add
   */
  add(...values2) {
    let somethingAdded = false;
    for (const value of values2) {
      const isUpdated = this.has(value);
      this.store.set(this.keyString(value), value);
      super.fireEvent(`add`, { value, updated: isUpdated });
      if (!isUpdated) somethingAdded = true;
    }
    return somethingAdded;
  }
  /**
   * Returns values from set as an iterable
   * @returns
   */
  //eslint-disable-next-line functional/prefer-tacit
  values() {
    return this.store.values();
  }
  /**
   * Clear items from set
   */
  clear() {
    this.store.clear();
    super.fireEvent(`clear`, true);
  }
  /**
   * Delete value from set.
   * @param v Value to delete
  * @returns _True_ if item was found and removed
   */
  delete(v) {
    const isDeleted = this.store.delete(this.keyString(v));
    if (isDeleted) super.fireEvent(`delete`, v);
    return isDeleted;
  }
  /**
   * Returns _true_ if item exists in set
   * @param v
   * @returns
   */
  has(v) {
    return this.store.has(this.keyString(v));
  }
  /**
   * Returns array copy of set
   * @returns Array copy of set
   */
  toArray() {
    return [...this.store.values()];
  }
};

// ../geometry/src/grid/visitors/visitor.ts
function* visitByNeighbours(logic, grid3, opts = {}) {
  guardGrid(grid3, `grid`);
  const start = opts.start ?? { x: 0, y: 0 };
  guardCell(start, `opts.start`, grid3);
  const v = opts.visited ?? mutable(cellKeyString);
  const possibleNeighbours = logic.getNeighbours ?? ((g2, c4) => neighbourList(g2, c4, crossDirections, `undefined`));
  let cellQueue = [start];
  let moveQueue = [];
  let current = void 0;
  while (cellQueue.length > 0) {
    if (current === void 0) {
      const nv = cellQueue.pop();
      if (nv === void 0) {
        break;
      }
      current = nv;
    }
    if (!v.has(current)) {
      v.add(current);
      yield current;
      const nextSteps = possibleNeighbours(grid3, current).filter(
        (step) => {
          if (step[1] === void 0) return false;
          return !v.has(step[1]);
        }
      );
      if (nextSteps.length === 0) {
        if (current !== void 0) {
          cellQueue = cellQueue.filter((cq) => cellEquals(cq, current));
        }
      } else {
        for (const n2 of nextSteps) {
          if (n2 === void 0) continue;
          if (n2[1] === void 0) continue;
          moveQueue.push(n2);
        }
      }
    }
    moveQueue = moveQueue.filter((step) => !v.has(step[1]));
    if (moveQueue.length === 0) {
      current = void 0;
    } else {
      const potential = logic.select(moveQueue);
      if (potential !== void 0) {
        cellQueue.push(potential[1]);
        current = potential[1];
      }
    }
  }
}

// ../geometry/src/grid/visitors/step.ts
var stepper = (grid3, createVisitor, start = { x: 0, y: 0 }, resolution = 1) => {
  guardGrid(grid3, `grid`);
  guardCell(start, `start`);
  throwIntegerTest(resolution, ``, `resolution`);
  const steps2 = [];
  let count3 = 0;
  let position = 0;
  for (const c4 of createVisitor(grid3, { start, boundsWrap: `undefined` })) {
    count3++;
    if (count3 % resolution !== 0) continue;
    steps2.push(c4);
  }
  return (step, fromStart = false) => {
    throwIntegerTest(step, ``, `step`);
    if (fromStart) position = step;
    else position += step;
    return steps2.at(position % steps2.length);
  };
};

// ../geometry/src/grid/visitors/index.ts
var create2 = (type2, opts = {}) => {
  switch (type2) {
    case `random-contiguous`:
      return withLogic(randomContiguousLogic(), opts);
    case `random`:
      return withLogic(randomLogic(), opts);
    case `depth`:
      return withLogic(depthLogic(), opts);
    case `breadth`:
      return withLogic(breadthLogic(), opts);
    case `neighbours`:
      return withLogic(neighboursLogic(), opts);
    case `row`:
      return withLogic(rowLogic(opts), opts);
    case `column`:
      return withLogic(columnLogic(opts), opts);
    default:
      throw new TypeError(`Param 'type' unknown. Value: ${type2}`);
  }
};
var withLogic = (logic, options = {}) => {
  return (grid3, optionsOverride = {}) => {
    return visitByNeighbours(logic, grid3, { ...options, ...optionsOverride });
  };
};

// ../geometry/src/bezier/index.ts
var bezier_exports = {};
__export(bezier_exports, {
  cubic: () => cubic,
  interpolator: () => interpolator,
  isCubicBezier: () => isCubicBezier,
  isQuadraticBezier: () => isQuadraticBezier,
  quadratic: () => quadratic,
  quadraticSimple: () => quadraticSimple,
  quadraticToSvgString: () => quadraticToSvgString,
  toPath: () => toPath3
});

// ../../node_modules/.pnpm/bezier-js@6.1.4/node_modules/bezier-js/src/utils.js
var { abs: abs2, cos, sin, acos, atan2, sqrt, pow } = Math;
function crt(v) {
  return v < 0 ? -pow(-v, 1 / 3) : pow(v, 1 / 3);
}
var pi2 = Math.PI;
var tau = 2 * pi2;
var quart = pi2 / 2;
var epsilon = 1e-6;
var nMax = Number.MAX_SAFE_INTEGER || 9007199254740991;
var nMin = Number.MIN_SAFE_INTEGER || -9007199254740991;
var ZERO = { x: 0, y: 0, z: 0 };
var utils = {
  // Legendre-Gauss abscissae with n=24 (x_i values, defined at i=n as the roots of the nth order Legendre polynomial Pn(x))
  Tvalues: [
    -0.06405689286260563,
    0.06405689286260563,
    -0.1911188674736163,
    0.1911188674736163,
    -0.3150426796961634,
    0.3150426796961634,
    -0.4337935076260451,
    0.4337935076260451,
    -0.5454214713888396,
    0.5454214713888396,
    -0.6480936519369755,
    0.6480936519369755,
    -0.7401241915785544,
    0.7401241915785544,
    -0.820001985973903,
    0.820001985973903,
    -0.8864155270044011,
    0.8864155270044011,
    -0.9382745520027328,
    0.9382745520027328,
    -0.9747285559713095,
    0.9747285559713095,
    -0.9951872199970213,
    0.9951872199970213
  ],
  // Legendre-Gauss weights with n=24 (w_i values, defined by a function linked to in the Bezier primer article)
  Cvalues: [
    0.12793819534675216,
    0.12793819534675216,
    0.1258374563468283,
    0.1258374563468283,
    0.12167047292780339,
    0.12167047292780339,
    0.1155056680537256,
    0.1155056680537256,
    0.10744427011596563,
    0.10744427011596563,
    0.09761865210411388,
    0.09761865210411388,
    0.08619016153195327,
    0.08619016153195327,
    0.0733464814110803,
    0.0733464814110803,
    0.05929858491543678,
    0.05929858491543678,
    0.04427743881741981,
    0.04427743881741981,
    0.028531388628933663,
    0.028531388628933663,
    0.0123412297999872,
    0.0123412297999872
  ],
  arcfn: function(t2, derivativeFn) {
    const d2 = derivativeFn(t2);
    let l = d2.x * d2.x + d2.y * d2.y;
    if (typeof d2.z !== "undefined") {
      l += d2.z * d2.z;
    }
    return sqrt(l);
  },
  compute: function(t2, points, _3d) {
    if (t2 === 0) {
      points[0].t = 0;
      return points[0];
    }
    const order = points.length - 1;
    if (t2 === 1) {
      points[order].t = 1;
      return points[order];
    }
    const mt = 1 - t2;
    let p2 = points;
    if (order === 0) {
      points[0].t = t2;
      return points[0];
    }
    if (order === 1) {
      const ret = {
        x: mt * p2[0].x + t2 * p2[1].x,
        y: mt * p2[0].y + t2 * p2[1].y,
        t: t2
      };
      if (_3d) {
        ret.z = mt * p2[0].z + t2 * p2[1].z;
      }
      return ret;
    }
    if (order < 4) {
      let mt2 = mt * mt, t22 = t2 * t2, a2, b2, c4, d2 = 0;
      if (order === 2) {
        p2 = [p2[0], p2[1], p2[2], ZERO];
        a2 = mt2;
        b2 = mt * t2 * 2;
        c4 = t22;
      } else if (order === 3) {
        a2 = mt2 * mt;
        b2 = mt2 * t2 * 3;
        c4 = mt * t22 * 3;
        d2 = t2 * t22;
      }
      const ret = {
        x: a2 * p2[0].x + b2 * p2[1].x + c4 * p2[2].x + d2 * p2[3].x,
        y: a2 * p2[0].y + b2 * p2[1].y + c4 * p2[2].y + d2 * p2[3].y,
        t: t2
      };
      if (_3d) {
        ret.z = a2 * p2[0].z + b2 * p2[1].z + c4 * p2[2].z + d2 * p2[3].z;
      }
      return ret;
    }
    const dCpts = JSON.parse(JSON.stringify(points));
    while (dCpts.length > 1) {
      for (let i = 0; i < dCpts.length - 1; i++) {
        dCpts[i] = {
          x: dCpts[i].x + (dCpts[i + 1].x - dCpts[i].x) * t2,
          y: dCpts[i].y + (dCpts[i + 1].y - dCpts[i].y) * t2
        };
        if (typeof dCpts[i].z !== "undefined") {
          dCpts[i].z = dCpts[i].z + (dCpts[i + 1].z - dCpts[i].z) * t2;
        }
      }
      dCpts.splice(dCpts.length - 1, 1);
    }
    dCpts[0].t = t2;
    return dCpts[0];
  },
  computeWithRatios: function(t2, points, ratios, _3d) {
    const mt = 1 - t2, r = ratios, p2 = points;
    let f1 = r[0], f2 = r[1], f3 = r[2], f4 = r[3], d2;
    f1 *= mt;
    f2 *= t2;
    if (p2.length === 2) {
      d2 = f1 + f2;
      return {
        x: (f1 * p2[0].x + f2 * p2[1].x) / d2,
        y: (f1 * p2[0].y + f2 * p2[1].y) / d2,
        z: !_3d ? false : (f1 * p2[0].z + f2 * p2[1].z) / d2,
        t: t2
      };
    }
    f1 *= mt;
    f2 *= 2 * mt;
    f3 *= t2 * t2;
    if (p2.length === 3) {
      d2 = f1 + f2 + f3;
      return {
        x: (f1 * p2[0].x + f2 * p2[1].x + f3 * p2[2].x) / d2,
        y: (f1 * p2[0].y + f2 * p2[1].y + f3 * p2[2].y) / d2,
        z: !_3d ? false : (f1 * p2[0].z + f2 * p2[1].z + f3 * p2[2].z) / d2,
        t: t2
      };
    }
    f1 *= mt;
    f2 *= 1.5 * mt;
    f3 *= 3 * mt;
    f4 *= t2 * t2 * t2;
    if (p2.length === 4) {
      d2 = f1 + f2 + f3 + f4;
      return {
        x: (f1 * p2[0].x + f2 * p2[1].x + f3 * p2[2].x + f4 * p2[3].x) / d2,
        y: (f1 * p2[0].y + f2 * p2[1].y + f3 * p2[2].y + f4 * p2[3].y) / d2,
        z: !_3d ? false : (f1 * p2[0].z + f2 * p2[1].z + f3 * p2[2].z + f4 * p2[3].z) / d2,
        t: t2
      };
    }
  },
  derive: function(points, _3d) {
    const dpoints = [];
    for (let p2 = points, d2 = p2.length, c4 = d2 - 1; d2 > 1; d2--, c4--) {
      const list = [];
      for (let j = 0, dpt; j < c4; j++) {
        dpt = {
          x: c4 * (p2[j + 1].x - p2[j].x),
          y: c4 * (p2[j + 1].y - p2[j].y)
        };
        if (_3d) {
          dpt.z = c4 * (p2[j + 1].z - p2[j].z);
        }
        list.push(dpt);
      }
      dpoints.push(list);
      p2 = list;
    }
    return dpoints;
  },
  between: function(v, m3, M) {
    return m3 <= v && v <= M || utils.approximately(v, m3) || utils.approximately(v, M);
  },
  approximately: function(a2, b2, precision) {
    return abs2(a2 - b2) <= (precision || epsilon);
  },
  length: function(derivativeFn) {
    const z = 0.5, len = utils.Tvalues.length;
    let sum7 = 0;
    for (let i = 0, t2; i < len; i++) {
      t2 = z * utils.Tvalues[i] + z;
      sum7 += utils.Cvalues[i] * utils.arcfn(t2, derivativeFn);
    }
    return z * sum7;
  },
  map: function(v, ds, de, ts, te) {
    const d1 = de - ds, d2 = te - ts, v2 = v - ds, r = v2 / d1;
    return ts + d2 * r;
  },
  lerp: function(r, v1, v2) {
    const ret = {
      x: v1.x + r * (v2.x - v1.x),
      y: v1.y + r * (v2.y - v1.y)
    };
    if (v1.z !== void 0 && v2.z !== void 0) {
      ret.z = v1.z + r * (v2.z - v1.z);
    }
    return ret;
  },
  pointToString: function(p2) {
    let s = p2.x + "/" + p2.y;
    if (typeof p2.z !== "undefined") {
      s += "/" + p2.z;
    }
    return s;
  },
  pointsToString: function(points) {
    return "[" + points.map(utils.pointToString).join(", ") + "]";
  },
  copy: function(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  angle: function(o, v1, v2) {
    const dx1 = v1.x - o.x, dy1 = v1.y - o.y, dx2 = v2.x - o.x, dy2 = v2.y - o.y, cross = dx1 * dy2 - dy1 * dx2, dot2 = dx1 * dx2 + dy1 * dy2;
    return atan2(cross, dot2);
  },
  // round as string, to avoid rounding errors
  round: function(v, d2) {
    const s = "" + v;
    const pos = s.indexOf(".");
    return parseFloat(s.substring(0, pos + 1 + d2));
  },
  dist: function(p1, p2) {
    const dx = p1.x - p2.x, dy = p1.y - p2.y;
    return sqrt(dx * dx + dy * dy);
  },
  closest: function(LUT, point2) {
    let mdist = pow(2, 63), mpos, d2;
    LUT.forEach(function(p2, idx) {
      d2 = utils.dist(point2, p2);
      if (d2 < mdist) {
        mdist = d2;
        mpos = idx;
      }
    });
    return { mdist, mpos };
  },
  abcratio: function(t2, n2) {
    if (n2 !== 2 && n2 !== 3) {
      return false;
    }
    if (typeof t2 === "undefined") {
      t2 = 0.5;
    } else if (t2 === 0 || t2 === 1) {
      return t2;
    }
    const bottom = pow(t2, n2) + pow(1 - t2, n2), top = bottom - 1;
    return abs2(top / bottom);
  },
  projectionratio: function(t2, n2) {
    if (n2 !== 2 && n2 !== 3) {
      return false;
    }
    if (typeof t2 === "undefined") {
      t2 = 0.5;
    } else if (t2 === 0 || t2 === 1) {
      return t2;
    }
    const top = pow(1 - t2, n2), bottom = pow(t2, n2) + top;
    return top / bottom;
  },
  lli8: function(x1, y1, x2, y2, x3, y3, x4, y4) {
    const nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4), ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4), d2 = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (d2 == 0) {
      return false;
    }
    return { x: nx / d2, y: ny / d2 };
  },
  lli4: function(p1, p2, p3, p4) {
    const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y, x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y;
    return utils.lli8(x1, y1, x2, y2, x3, y3, x4, y4);
  },
  lli: function(v1, v2) {
    return utils.lli4(v1, v1.c, v2, v2.c);
  },
  makeline: function(p1, p2) {
    return new Bezier(
      p1.x,
      p1.y,
      (p1.x + p2.x) / 2,
      (p1.y + p2.y) / 2,
      p2.x,
      p2.y
    );
  },
  findbbox: function(sections) {
    let mx = nMax, my = nMax, MX = nMin, MY = nMin;
    sections.forEach(function(s) {
      const bbox7 = s.bbox();
      if (mx > bbox7.x.min) mx = bbox7.x.min;
      if (my > bbox7.y.min) my = bbox7.y.min;
      if (MX < bbox7.x.max) MX = bbox7.x.max;
      if (MY < bbox7.y.max) MY = bbox7.y.max;
    });
    return {
      x: { min: mx, mid: (mx + MX) / 2, max: MX, size: MX - mx },
      y: { min: my, mid: (my + MY) / 2, max: MY, size: MY - my }
    };
  },
  shapeintersections: function(s1, bbox1, s2, bbox22, curveIntersectionThreshold) {
    if (!utils.bboxoverlap(bbox1, bbox22)) return [];
    const intersections2 = [];
    const a1 = [s1.startcap, s1.forward, s1.back, s1.endcap];
    const a2 = [s2.startcap, s2.forward, s2.back, s2.endcap];
    a1.forEach(function(l1) {
      if (l1.virtual) return;
      a2.forEach(function(l2) {
        if (l2.virtual) return;
        const iss = l1.intersects(l2, curveIntersectionThreshold);
        if (iss.length > 0) {
          iss.c1 = l1;
          iss.c2 = l2;
          iss.s1 = s1;
          iss.s2 = s2;
          intersections2.push(iss);
        }
      });
    });
    return intersections2;
  },
  makeshape: function(forward, back, curveIntersectionThreshold) {
    const bpl = back.points.length;
    const fpl = forward.points.length;
    const start = utils.makeline(back.points[bpl - 1], forward.points[0]);
    const end = utils.makeline(forward.points[fpl - 1], back.points[0]);
    const shape = {
      startcap: start,
      forward,
      back,
      endcap: end,
      bbox: utils.findbbox([start, forward, back, end])
    };
    shape.intersections = function(s2) {
      return utils.shapeintersections(
        shape,
        shape.bbox,
        s2,
        s2.bbox,
        curveIntersectionThreshold
      );
    };
    return shape;
  },
  getminmax: function(curve, d2, list) {
    if (!list) return { min: 0, max: 0 };
    let min8 = nMax, max9 = nMin, t2, c4;
    if (list.indexOf(0) === -1) {
      list = [0].concat(list);
    }
    if (list.indexOf(1) === -1) {
      list.push(1);
    }
    for (let i = 0, len = list.length; i < len; i++) {
      t2 = list[i];
      c4 = curve.get(t2);
      if (c4[d2] < min8) {
        min8 = c4[d2];
      }
      if (c4[d2] > max9) {
        max9 = c4[d2];
      }
    }
    return { min: min8, mid: (min8 + max9) / 2, max: max9, size: max9 - min8 };
  },
  align: function(points, line4) {
    const tx = line4.p1.x, ty = line4.p1.y, a2 = -atan2(line4.p2.y - ty, line4.p2.x - tx), d2 = function(v) {
      return {
        x: (v.x - tx) * cos(a2) - (v.y - ty) * sin(a2),
        y: (v.x - tx) * sin(a2) + (v.y - ty) * cos(a2)
      };
    };
    return points.map(d2);
  },
  roots: function(points, line4) {
    line4 = line4 || { p1: { x: 0, y: 0 }, p2: { x: 1, y: 0 } };
    const order = points.length - 1;
    const aligned = utils.align(points, line4);
    const reduce4 = function(t2) {
      return 0 <= t2 && t2 <= 1;
    };
    if (order === 2) {
      const a3 = aligned[0].y, b3 = aligned[1].y, c5 = aligned[2].y, d3 = a3 - 2 * b3 + c5;
      if (d3 !== 0) {
        const m12 = -sqrt(b3 * b3 - a3 * c5), m22 = -a3 + b3, v12 = -(m12 + m22) / d3, v2 = -(-m12 + m22) / d3;
        return [v12, v2].filter(reduce4);
      } else if (b3 !== c5 && d3 === 0) {
        return [(2 * b3 - c5) / (2 * b3 - 2 * c5)].filter(reduce4);
      }
      return [];
    }
    const pa = aligned[0].y, pb = aligned[1].y, pc = aligned[2].y, pd = aligned[3].y;
    let d2 = -pa + 3 * pb - 3 * pc + pd, a2 = 3 * pa - 6 * pb + 3 * pc, b2 = -3 * pa + 3 * pb, c4 = pa;
    if (utils.approximately(d2, 0)) {
      if (utils.approximately(a2, 0)) {
        if (utils.approximately(b2, 0)) {
          return [];
        }
        return [-c4 / b2].filter(reduce4);
      }
      const q3 = sqrt(b2 * b2 - 4 * a2 * c4), a22 = 2 * a2;
      return [(q3 - b2) / a22, (-b2 - q3) / a22].filter(reduce4);
    }
    a2 /= d2;
    b2 /= d2;
    c4 /= d2;
    const p2 = (3 * b2 - a2 * a2) / 3, p3 = p2 / 3, q = (2 * a2 * a2 * a2 - 9 * a2 * b2 + 27 * c4) / 27, q2 = q / 2, discriminant = q2 * q2 + p3 * p3 * p3;
    let u1, v1, x1, x2, x3;
    if (discriminant < 0) {
      const mp3 = -p2 / 3, mp33 = mp3 * mp3 * mp3, r = sqrt(mp33), t2 = -q / (2 * r), cosphi = t2 < -1 ? -1 : t2 > 1 ? 1 : t2, phi2 = acos(cosphi), crtr = crt(r), t1 = 2 * crtr;
      x1 = t1 * cos(phi2 / 3) - a2 / 3;
      x2 = t1 * cos((phi2 + tau) / 3) - a2 / 3;
      x3 = t1 * cos((phi2 + 2 * tau) / 3) - a2 / 3;
      return [x1, x2, x3].filter(reduce4);
    } else if (discriminant === 0) {
      u1 = q2 < 0 ? crt(-q2) : -crt(q2);
      x1 = 2 * u1 - a2 / 3;
      x2 = -u1 - a2 / 3;
      return [x1, x2].filter(reduce4);
    } else {
      const sd = sqrt(discriminant);
      u1 = crt(-q2 + sd);
      v1 = crt(q2 + sd);
      return [u1 - v1 - a2 / 3].filter(reduce4);
    }
  },
  droots: function(p2) {
    if (p2.length === 3) {
      const a2 = p2[0], b2 = p2[1], c4 = p2[2], d2 = a2 - 2 * b2 + c4;
      if (d2 !== 0) {
        const m12 = -sqrt(b2 * b2 - a2 * c4), m22 = -a2 + b2, v1 = -(m12 + m22) / d2, v2 = -(-m12 + m22) / d2;
        return [v1, v2];
      } else if (b2 !== c4 && d2 === 0) {
        return [(2 * b2 - c4) / (2 * (b2 - c4))];
      }
      return [];
    }
    if (p2.length === 2) {
      const a2 = p2[0], b2 = p2[1];
      if (a2 !== b2) {
        return [a2 / (a2 - b2)];
      }
      return [];
    }
    return [];
  },
  curvature: function(t2, d1, d2, _3d, kOnly) {
    let num, dnm, adk, dk, k = 0, r = 0;
    const d3 = utils.compute(t2, d1);
    const dd = utils.compute(t2, d2);
    const qdsum = d3.x * d3.x + d3.y * d3.y;
    if (_3d) {
      num = sqrt(
        pow(d3.y * dd.z - dd.y * d3.z, 2) + pow(d3.z * dd.x - dd.z * d3.x, 2) + pow(d3.x * dd.y - dd.x * d3.y, 2)
      );
      dnm = pow(qdsum + d3.z * d3.z, 3 / 2);
    } else {
      num = d3.x * dd.y - d3.y * dd.x;
      dnm = pow(qdsum, 3 / 2);
    }
    if (num === 0 || dnm === 0) {
      return { k: 0, r: 0 };
    }
    k = num / dnm;
    r = dnm / num;
    if (!kOnly) {
      const pk = utils.curvature(t2 - 1e-3, d1, d2, _3d, true).k;
      const nk = utils.curvature(t2 + 1e-3, d1, d2, _3d, true).k;
      dk = (nk - k + (k - pk)) / 2;
      adk = (abs2(nk - k) + abs2(k - pk)) / 2;
    }
    return { k, r, dk, adk };
  },
  inflections: function(points) {
    if (points.length < 4) return [];
    const p2 = utils.align(points, { p1: points[0], p2: points.slice(-1)[0] }), a2 = p2[2].x * p2[1].y, b2 = p2[3].x * p2[1].y, c4 = p2[1].x * p2[2].y, d2 = p2[3].x * p2[2].y, v1 = 18 * (-3 * a2 + 2 * b2 + 3 * c4 - d2), v2 = 18 * (3 * a2 - b2 - 3 * c4), v3 = 18 * (c4 - a2);
    if (utils.approximately(v1, 0)) {
      if (!utils.approximately(v2, 0)) {
        let t2 = -v3 / v2;
        if (0 <= t2 && t2 <= 1) return [t2];
      }
      return [];
    }
    const d22 = 2 * v1;
    if (utils.approximately(d22, 0)) return [];
    const trm = v2 * v2 - 4 * v1 * v3;
    if (trm < 0) return [];
    const sq = Math.sqrt(trm);
    return [(sq - v2) / d22, -(v2 + sq) / d22].filter(function(r) {
      return 0 <= r && r <= 1;
    });
  },
  bboxoverlap: function(b1, b2) {
    const dims = ["x", "y"], len = dims.length;
    for (let i = 0, dim, l, t2, d2; i < len; i++) {
      dim = dims[i];
      l = b1[dim].mid;
      t2 = b2[dim].mid;
      d2 = (b1[dim].size + b2[dim].size) / 2;
      if (abs2(l - t2) >= d2) return false;
    }
    return true;
  },
  expandbox: function(bbox7, _bbox) {
    if (_bbox.x.min < bbox7.x.min) {
      bbox7.x.min = _bbox.x.min;
    }
    if (_bbox.y.min < bbox7.y.min) {
      bbox7.y.min = _bbox.y.min;
    }
    if (_bbox.z && _bbox.z.min < bbox7.z.min) {
      bbox7.z.min = _bbox.z.min;
    }
    if (_bbox.x.max > bbox7.x.max) {
      bbox7.x.max = _bbox.x.max;
    }
    if (_bbox.y.max > bbox7.y.max) {
      bbox7.y.max = _bbox.y.max;
    }
    if (_bbox.z && _bbox.z.max > bbox7.z.max) {
      bbox7.z.max = _bbox.z.max;
    }
    bbox7.x.mid = (bbox7.x.min + bbox7.x.max) / 2;
    bbox7.y.mid = (bbox7.y.min + bbox7.y.max) / 2;
    if (bbox7.z) {
      bbox7.z.mid = (bbox7.z.min + bbox7.z.max) / 2;
    }
    bbox7.x.size = bbox7.x.max - bbox7.x.min;
    bbox7.y.size = bbox7.y.max - bbox7.y.min;
    if (bbox7.z) {
      bbox7.z.size = bbox7.z.max - bbox7.z.min;
    }
  },
  pairiteration: function(c12, c22, curveIntersectionThreshold) {
    const c1b = c12.bbox(), c2b = c22.bbox(), r = 1e5, threshold = curveIntersectionThreshold || 0.5;
    if (c1b.x.size + c1b.y.size < threshold && c2b.x.size + c2b.y.size < threshold) {
      return [
        (r * (c12._t1 + c12._t2) / 2 | 0) / r + "/" + (r * (c22._t1 + c22._t2) / 2 | 0) / r
      ];
    }
    let cc1 = c12.split(0.5), cc2 = c22.split(0.5), pairs = [
      { left: cc1.left, right: cc2.left },
      { left: cc1.left, right: cc2.right },
      { left: cc1.right, right: cc2.right },
      { left: cc1.right, right: cc2.left }
    ];
    pairs = pairs.filter(function(pair) {
      return utils.bboxoverlap(pair.left.bbox(), pair.right.bbox());
    });
    let results = [];
    if (pairs.length === 0) return results;
    pairs.forEach(function(pair) {
      results = results.concat(
        utils.pairiteration(pair.left, pair.right, threshold)
      );
    });
    results = results.filter(function(v, i) {
      return results.indexOf(v) === i;
    });
    return results;
  },
  getccenter: function(p1, p2, p3) {
    const dx1 = p2.x - p1.x, dy1 = p2.y - p1.y, dx2 = p3.x - p2.x, dy2 = p3.y - p2.y, dx1p = dx1 * cos(quart) - dy1 * sin(quart), dy1p = dx1 * sin(quart) + dy1 * cos(quart), dx2p = dx2 * cos(quart) - dy2 * sin(quart), dy2p = dx2 * sin(quart) + dy2 * cos(quart), mx1 = (p1.x + p2.x) / 2, my1 = (p1.y + p2.y) / 2, mx2 = (p2.x + p3.x) / 2, my2 = (p2.y + p3.y) / 2, mx1n = mx1 + dx1p, my1n = my1 + dy1p, mx2n = mx2 + dx2p, my2n = my2 + dy2p, arc2 = utils.lli8(mx1, my1, mx1n, my1n, mx2, my2, mx2n, my2n), r = utils.dist(arc2, p1);
    let s = atan2(p1.y - arc2.y, p1.x - arc2.x), m3 = atan2(p2.y - arc2.y, p2.x - arc2.x), e = atan2(p3.y - arc2.y, p3.x - arc2.x), _;
    if (s < e) {
      if (s > m3 || m3 > e) {
        s += tau;
      }
      if (s > e) {
        _ = e;
        e = s;
        s = _;
      }
    } else {
      if (e < m3 && m3 < s) {
        _ = e;
        e = s;
        s = _;
      } else {
        e += tau;
      }
    }
    arc2.s = s;
    arc2.e = e;
    arc2.r = r;
    return arc2;
  },
  numberSort: function(a2, b2) {
    return a2 - b2;
  }
};

// ../../node_modules/.pnpm/bezier-js@6.1.4/node_modules/bezier-js/src/poly-bezier.js
var PolyBezier = class _PolyBezier {
  constructor(curves) {
    this.curves = [];
    this._3d = false;
    if (!!curves) {
      this.curves = curves;
      this._3d = this.curves[0]._3d;
    }
  }
  valueOf() {
    return this.toString();
  }
  toString() {
    return "[" + this.curves.map(function(curve) {
      return utils.pointsToString(curve.points);
    }).join(", ") + "]";
  }
  addCurve(curve) {
    this.curves.push(curve);
    this._3d = this._3d || curve._3d;
  }
  length() {
    return this.curves.map(function(v) {
      return v.length();
    }).reduce(function(a2, b2) {
      return a2 + b2;
    });
  }
  curve(idx) {
    return this.curves[idx];
  }
  bbox() {
    const c4 = this.curves;
    var bbox7 = c4[0].bbox();
    for (var i = 1; i < c4.length; i++) {
      utils.expandbox(bbox7, c4[i].bbox());
    }
    return bbox7;
  }
  offset(d2) {
    const offset2 = [];
    this.curves.forEach(function(v) {
      offset2.push(...v.offset(d2));
    });
    return new _PolyBezier(offset2);
  }
};

// ../../node_modules/.pnpm/bezier-js@6.1.4/node_modules/bezier-js/src/bezier.js
var { abs: abs3, min: min2, max: max2, cos: cos2, sin: sin2, acos: acos2, sqrt: sqrt2 } = Math;
var pi3 = Math.PI;
var Bezier = class _Bezier {
  constructor(coords) {
    let args = coords && coords.forEach ? coords : Array.from(arguments).slice();
    let coordlen = false;
    if (typeof args[0] === "object") {
      coordlen = args.length;
      const newargs = [];
      args.forEach(function(point3) {
        ["x", "y", "z"].forEach(function(d2) {
          if (typeof point3[d2] !== "undefined") {
            newargs.push(point3[d2]);
          }
        });
      });
      args = newargs;
    }
    let higher = false;
    const len = args.length;
    if (coordlen) {
      if (coordlen > 4) {
        if (arguments.length !== 1) {
          throw new Error(
            "Only new Bezier(point[]) is accepted for 4th and higher order curves"
          );
        }
        higher = true;
      }
    } else {
      if (len !== 6 && len !== 8 && len !== 9 && len !== 12) {
        if (arguments.length !== 1) {
          throw new Error(
            "Only new Bezier(point[]) is accepted for 4th and higher order curves"
          );
        }
      }
    }
    const _3d = this._3d = !higher && (len === 9 || len === 12) || coords && coords[0] && typeof coords[0].z !== "undefined";
    const points = this.points = [];
    for (let idx = 0, step = _3d ? 3 : 2; idx < len; idx += step) {
      var point2 = {
        x: args[idx],
        y: args[idx + 1]
      };
      if (_3d) {
        point2.z = args[idx + 2];
      }
      points.push(point2);
    }
    const order = this.order = points.length - 1;
    const dims = this.dims = ["x", "y"];
    if (_3d) dims.push("z");
    this.dimlen = dims.length;
    const aligned = utils.align(points, { p1: points[0], p2: points[order] });
    const baselength = utils.dist(points[0], points[order]);
    this._linear = aligned.reduce((t2, p2) => t2 + abs3(p2.y), 0) < baselength / 50;
    this._lut = [];
    this._t1 = 0;
    this._t2 = 1;
    this.update();
  }
  static quadraticFromPoints(p1, p2, p3, t2) {
    if (typeof t2 === "undefined") {
      t2 = 0.5;
    }
    if (t2 === 0) {
      return new _Bezier(p2, p2, p3);
    }
    if (t2 === 1) {
      return new _Bezier(p1, p2, p2);
    }
    const abc = _Bezier.getABC(2, p1, p2, p3, t2);
    return new _Bezier(p1, abc.A, p3);
  }
  static cubicFromPoints(S, B, E, t2, d1) {
    if (typeof t2 === "undefined") {
      t2 = 0.5;
    }
    const abc = _Bezier.getABC(3, S, B, E, t2);
    if (typeof d1 === "undefined") {
      d1 = utils.dist(B, abc.C);
    }
    const d2 = d1 * (1 - t2) / t2;
    const selen = utils.dist(S, E), lx = (E.x - S.x) / selen, ly = (E.y - S.y) / selen, bx1 = d1 * lx, by1 = d1 * ly, bx2 = d2 * lx, by2 = d2 * ly;
    const e1 = { x: B.x - bx1, y: B.y - by1 }, e2 = { x: B.x + bx2, y: B.y + by2 }, A = abc.A, v1 = { x: A.x + (e1.x - A.x) / (1 - t2), y: A.y + (e1.y - A.y) / (1 - t2) }, v2 = { x: A.x + (e2.x - A.x) / t2, y: A.y + (e2.y - A.y) / t2 }, nc1 = { x: S.x + (v1.x - S.x) / t2, y: S.y + (v1.y - S.y) / t2 }, nc2 = {
      x: E.x + (v2.x - E.x) / (1 - t2),
      y: E.y + (v2.y - E.y) / (1 - t2)
    };
    return new _Bezier(S, nc1, nc2, E);
  }
  static getUtils() {
    return utils;
  }
  getUtils() {
    return _Bezier.getUtils();
  }
  static get PolyBezier() {
    return PolyBezier;
  }
  valueOf() {
    return this.toString();
  }
  toString() {
    return utils.pointsToString(this.points);
  }
  toSVG() {
    if (this._3d) return false;
    const p2 = this.points, x = p2[0].x, y = p2[0].y, s = ["M", x, y, this.order === 2 ? "Q" : "C"];
    for (let i = 1, last5 = p2.length; i < last5; i++) {
      s.push(p2[i].x);
      s.push(p2[i].y);
    }
    return s.join(" ");
  }
  setRatios(ratios) {
    if (ratios.length !== this.points.length) {
      throw new Error("incorrect number of ratio values");
    }
    this.ratios = ratios;
    this._lut = [];
  }
  verify() {
    const print = this.coordDigest();
    if (print !== this._print) {
      this._print = print;
      this.update();
    }
  }
  coordDigest() {
    return this.points.map(function(c4, pos) {
      return "" + pos + c4.x + c4.y + (c4.z ? c4.z : 0);
    }).join("");
  }
  update() {
    this._lut = [];
    this.dpoints = utils.derive(this.points, this._3d);
    this.computedirection();
  }
  computedirection() {
    const points = this.points;
    const angle = utils.angle(points[0], points[this.order], points[1]);
    this.clockwise = angle > 0;
  }
  length() {
    return utils.length(this.derivative.bind(this));
  }
  static getABC(order = 2, S, B, E, t2 = 0.5) {
    const u = utils.projectionratio(t2, order), um = 1 - u, C = {
      x: u * S.x + um * E.x,
      y: u * S.y + um * E.y
    }, s = utils.abcratio(t2, order), A = {
      x: B.x + (B.x - C.x) / s,
      y: B.y + (B.y - C.y) / s
    };
    return { A, B, C, S, E };
  }
  getABC(t2, B) {
    B = B || this.get(t2);
    let S = this.points[0];
    let E = this.points[this.order];
    return _Bezier.getABC(this.order, S, B, E, t2);
  }
  getLUT(steps2) {
    this.verify();
    steps2 = steps2 || 100;
    if (this._lut.length === steps2 + 1) {
      return this._lut;
    }
    this._lut = [];
    steps2++;
    this._lut = [];
    for (let i = 0, p2, t2; i < steps2; i++) {
      t2 = i / (steps2 - 1);
      p2 = this.compute(t2);
      p2.t = t2;
      this._lut.push(p2);
    }
    return this._lut;
  }
  on(point2, error) {
    error = error || 5;
    const lut = this.getLUT(), hits = [];
    for (let i = 0, c4, t2 = 0; i < lut.length; i++) {
      c4 = lut[i];
      if (utils.dist(c4, point2) < error) {
        hits.push(c4);
        t2 += i / lut.length;
      }
    }
    if (!hits.length) return false;
    return t /= hits.length;
  }
  project(point2) {
    const LUT = this.getLUT(), l = LUT.length - 1, closest = utils.closest(LUT, point2), mpos = closest.mpos, t1 = (mpos - 1) / l, t2 = (mpos + 1) / l, step = 0.1 / l;
    let mdist = closest.mdist, t3 = t1, ft = t3, p2;
    mdist += 1;
    for (let d2; t3 < t2 + step; t3 += step) {
      p2 = this.compute(t3);
      d2 = utils.dist(point2, p2);
      if (d2 < mdist) {
        mdist = d2;
        ft = t3;
      }
    }
    ft = ft < 0 ? 0 : ft > 1 ? 1 : ft;
    p2 = this.compute(ft);
    p2.t = ft;
    p2.d = mdist;
    return p2;
  }
  get(t2) {
    return this.compute(t2);
  }
  point(idx) {
    return this.points[idx];
  }
  compute(t2) {
    if (this.ratios) {
      return utils.computeWithRatios(t2, this.points, this.ratios, this._3d);
    }
    return utils.compute(t2, this.points, this._3d, this.ratios);
  }
  raise() {
    const p2 = this.points, np = [p2[0]], k = p2.length;
    for (let i = 1, pi6, pim; i < k; i++) {
      pi6 = p2[i];
      pim = p2[i - 1];
      np[i] = {
        x: (k - i) / k * pi6.x + i / k * pim.x,
        y: (k - i) / k * pi6.y + i / k * pim.y
      };
    }
    np[k] = p2[k - 1];
    return new _Bezier(np);
  }
  derivative(t2) {
    return utils.compute(t2, this.dpoints[0], this._3d);
  }
  dderivative(t2) {
    return utils.compute(t2, this.dpoints[1], this._3d);
  }
  align() {
    let p2 = this.points;
    return new _Bezier(utils.align(p2, { p1: p2[0], p2: p2[p2.length - 1] }));
  }
  curvature(t2) {
    return utils.curvature(t2, this.dpoints[0], this.dpoints[1], this._3d);
  }
  inflections() {
    return utils.inflections(this.points);
  }
  normal(t2) {
    return this._3d ? this.__normal3(t2) : this.__normal2(t2);
  }
  __normal2(t2) {
    const d2 = this.derivative(t2);
    const q = sqrt2(d2.x * d2.x + d2.y * d2.y);
    return { t: t2, x: -d2.y / q, y: d2.x / q };
  }
  __normal3(t2) {
    const r1 = this.derivative(t2), r2 = this.derivative(t2 + 0.01), q1 = sqrt2(r1.x * r1.x + r1.y * r1.y + r1.z * r1.z), q2 = sqrt2(r2.x * r2.x + r2.y * r2.y + r2.z * r2.z);
    r1.x /= q1;
    r1.y /= q1;
    r1.z /= q1;
    r2.x /= q2;
    r2.y /= q2;
    r2.z /= q2;
    const c4 = {
      x: r2.y * r1.z - r2.z * r1.y,
      y: r2.z * r1.x - r2.x * r1.z,
      z: r2.x * r1.y - r2.y * r1.x
    };
    const m3 = sqrt2(c4.x * c4.x + c4.y * c4.y + c4.z * c4.z);
    c4.x /= m3;
    c4.y /= m3;
    c4.z /= m3;
    const R = [
      c4.x * c4.x,
      c4.x * c4.y - c4.z,
      c4.x * c4.z + c4.y,
      c4.x * c4.y + c4.z,
      c4.y * c4.y,
      c4.y * c4.z - c4.x,
      c4.x * c4.z - c4.y,
      c4.y * c4.z + c4.x,
      c4.z * c4.z
    ];
    const n2 = {
      t: t2,
      x: R[0] * r1.x + R[1] * r1.y + R[2] * r1.z,
      y: R[3] * r1.x + R[4] * r1.y + R[5] * r1.z,
      z: R[6] * r1.x + R[7] * r1.y + R[8] * r1.z
    };
    return n2;
  }
  hull(t2) {
    let p2 = this.points, _p = [], q = [], idx = 0;
    q[idx++] = p2[0];
    q[idx++] = p2[1];
    q[idx++] = p2[2];
    if (this.order === 3) {
      q[idx++] = p2[3];
    }
    while (p2.length > 1) {
      _p = [];
      for (let i = 0, pt, l = p2.length - 1; i < l; i++) {
        pt = utils.lerp(t2, p2[i], p2[i + 1]);
        q[idx++] = pt;
        _p.push(pt);
      }
      p2 = _p;
    }
    return q;
  }
  split(t1, t2) {
    if (t1 === 0 && !!t2) {
      return this.split(t2).left;
    }
    if (t2 === 1) {
      return this.split(t1).right;
    }
    const q = this.hull(t1);
    const result = {
      left: this.order === 2 ? new _Bezier([q[0], q[3], q[5]]) : new _Bezier([q[0], q[4], q[7], q[9]]),
      right: this.order === 2 ? new _Bezier([q[5], q[4], q[2]]) : new _Bezier([q[9], q[8], q[6], q[3]]),
      span: q
    };
    result.left._t1 = utils.map(0, 0, 1, this._t1, this._t2);
    result.left._t2 = utils.map(t1, 0, 1, this._t1, this._t2);
    result.right._t1 = utils.map(t1, 0, 1, this._t1, this._t2);
    result.right._t2 = utils.map(1, 0, 1, this._t1, this._t2);
    if (!t2) {
      return result;
    }
    t2 = utils.map(t2, t1, 1, 0, 1);
    return result.right.split(t2).left;
  }
  extrema() {
    const result = {};
    let roots = [];
    this.dims.forEach(
      function(dim) {
        let mfn = function(v) {
          return v[dim];
        };
        let p2 = this.dpoints[0].map(mfn);
        result[dim] = utils.droots(p2);
        if (this.order === 3) {
          p2 = this.dpoints[1].map(mfn);
          result[dim] = result[dim].concat(utils.droots(p2));
        }
        result[dim] = result[dim].filter(function(t2) {
          return t2 >= 0 && t2 <= 1;
        });
        roots = roots.concat(result[dim].sort(utils.numberSort));
      }.bind(this)
    );
    result.values = roots.sort(utils.numberSort).filter(function(v, idx) {
      return roots.indexOf(v) === idx;
    });
    return result;
  }
  bbox() {
    const extrema = this.extrema(), result = {};
    this.dims.forEach(
      function(d2) {
        result[d2] = utils.getminmax(this, d2, extrema[d2]);
      }.bind(this)
    );
    return result;
  }
  overlaps(curve) {
    const lbbox = this.bbox(), tbbox = curve.bbox();
    return utils.bboxoverlap(lbbox, tbbox);
  }
  offset(t2, d2) {
    if (typeof d2 !== "undefined") {
      const c4 = this.get(t2), n2 = this.normal(t2);
      const ret = {
        c: c4,
        n: n2,
        x: c4.x + n2.x * d2,
        y: c4.y + n2.y * d2
      };
      if (this._3d) {
        ret.z = c4.z + n2.z * d2;
      }
      return ret;
    }
    if (this._linear) {
      const nv = this.normal(0), coords = this.points.map(function(p2) {
        const ret = {
          x: p2.x + t2 * nv.x,
          y: p2.y + t2 * nv.y
        };
        if (p2.z && nv.z) {
          ret.z = p2.z + t2 * nv.z;
        }
        return ret;
      });
      return [new _Bezier(coords)];
    }
    return this.reduce().map(function(s) {
      if (s._linear) {
        return s.offset(t2)[0];
      }
      return s.scale(t2);
    });
  }
  simple() {
    if (this.order === 3) {
      const a1 = utils.angle(this.points[0], this.points[3], this.points[1]);
      const a2 = utils.angle(this.points[0], this.points[3], this.points[2]);
      if (a1 > 0 && a2 < 0 || a1 < 0 && a2 > 0) return false;
    }
    const n1 = this.normal(0);
    const n2 = this.normal(1);
    let s = n1.x * n2.x + n1.y * n2.y;
    if (this._3d) {
      s += n1.z * n2.z;
    }
    return abs3(acos2(s)) < pi3 / 3;
  }
  reduce() {
    let i, t1 = 0, t2 = 0, step = 0.01, segment, pass1 = [], pass2 = [];
    let extrema = this.extrema().values;
    if (extrema.indexOf(0) === -1) {
      extrema = [0].concat(extrema);
    }
    if (extrema.indexOf(1) === -1) {
      extrema.push(1);
    }
    for (t1 = extrema[0], i = 1; i < extrema.length; i++) {
      t2 = extrema[i];
      segment = this.split(t1, t2);
      segment._t1 = t1;
      segment._t2 = t2;
      pass1.push(segment);
      t1 = t2;
    }
    pass1.forEach(function(p1) {
      t1 = 0;
      t2 = 0;
      while (t2 <= 1) {
        for (t2 = t1 + step; t2 <= 1 + step; t2 += step) {
          segment = p1.split(t1, t2);
          if (!segment.simple()) {
            t2 -= step;
            if (abs3(t1 - t2) < step) {
              return [];
            }
            segment = p1.split(t1, t2);
            segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
            segment._t2 = utils.map(t2, 0, 1, p1._t1, p1._t2);
            pass2.push(segment);
            t1 = t2;
            break;
          }
        }
      }
      if (t1 < 1) {
        segment = p1.split(t1, 1);
        segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
        segment._t2 = p1._t2;
        pass2.push(segment);
      }
    });
    return pass2;
  }
  translate(v, d1, d2) {
    d2 = typeof d2 === "number" ? d2 : d1;
    const o = this.order;
    let d3 = this.points.map((_, i) => (1 - i / o) * d1 + i / o * d2);
    return new _Bezier(
      this.points.map((p2, i) => ({
        x: p2.x + v.x * d3[i],
        y: p2.y + v.y * d3[i]
      }))
    );
  }
  scale(d2) {
    const order = this.order;
    let distanceFn = false;
    if (typeof d2 === "function") {
      distanceFn = d2;
    }
    if (distanceFn && order === 2) {
      return this.raise().scale(distanceFn);
    }
    const clockwise = this.clockwise;
    const points = this.points;
    if (this._linear) {
      return this.translate(
        this.normal(0),
        distanceFn ? distanceFn(0) : d2,
        distanceFn ? distanceFn(1) : d2
      );
    }
    const r1 = distanceFn ? distanceFn(0) : d2;
    const r2 = distanceFn ? distanceFn(1) : d2;
    const v = [this.offset(0, 10), this.offset(1, 10)];
    const np = [];
    const o = utils.lli4(v[0], v[0].c, v[1], v[1].c);
    if (!o) {
      throw new Error("cannot scale this curve. Try reducing it first.");
    }
    [0, 1].forEach(function(t2) {
      const p2 = np[t2 * order] = utils.copy(points[t2 * order]);
      p2.x += (t2 ? r2 : r1) * v[t2].n.x;
      p2.y += (t2 ? r2 : r1) * v[t2].n.y;
    });
    if (!distanceFn) {
      [0, 1].forEach((t2) => {
        if (order === 2 && !!t2) return;
        const p2 = np[t2 * order];
        const d3 = this.derivative(t2);
        const p22 = { x: p2.x + d3.x, y: p2.y + d3.y };
        np[t2 + 1] = utils.lli4(p2, p22, o, points[t2 + 1]);
      });
      return new _Bezier(np);
    }
    [0, 1].forEach(function(t2) {
      if (order === 2 && !!t2) return;
      var p2 = points[t2 + 1];
      var ov = {
        x: p2.x - o.x,
        y: p2.y - o.y
      };
      var rc = distanceFn ? distanceFn((t2 + 1) / order) : d2;
      if (distanceFn && !clockwise) rc = -rc;
      var m3 = sqrt2(ov.x * ov.x + ov.y * ov.y);
      ov.x /= m3;
      ov.y /= m3;
      np[t2 + 1] = {
        x: p2.x + rc * ov.x,
        y: p2.y + rc * ov.y
      };
    });
    return new _Bezier(np);
  }
  outline(d1, d2, d3, d4) {
    d2 = d2 === void 0 ? d1 : d2;
    if (this._linear) {
      const n2 = this.normal(0);
      const start = this.points[0];
      const end = this.points[this.points.length - 1];
      let s, mid, e;
      if (d3 === void 0) {
        d3 = d1;
        d4 = d2;
      }
      s = { x: start.x + n2.x * d1, y: start.y + n2.y * d1 };
      e = { x: end.x + n2.x * d3, y: end.y + n2.y * d3 };
      mid = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 };
      const fline = [s, mid, e];
      s = { x: start.x - n2.x * d2, y: start.y - n2.y * d2 };
      e = { x: end.x - n2.x * d4, y: end.y - n2.y * d4 };
      mid = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 };
      const bline = [e, mid, s];
      const ls2 = utils.makeline(bline[2], fline[0]);
      const le2 = utils.makeline(fline[2], bline[0]);
      const segments2 = [ls2, new _Bezier(fline), le2, new _Bezier(bline)];
      return new PolyBezier(segments2);
    }
    const reduced = this.reduce(), len = reduced.length, fcurves = [];
    let bcurves = [], p2, alen = 0, tlen = this.length();
    const graduated = typeof d3 !== "undefined" && typeof d4 !== "undefined";
    function linearDistanceFunction(s, e, tlen2, alen2, slen) {
      return function(v) {
        const f1 = alen2 / tlen2, f2 = (alen2 + slen) / tlen2, d5 = e - s;
        return utils.map(v, 0, 1, s + f1 * d5, s + f2 * d5);
      };
    }
    reduced.forEach(function(segment) {
      const slen = segment.length();
      if (graduated) {
        fcurves.push(
          segment.scale(linearDistanceFunction(d1, d3, tlen, alen, slen))
        );
        bcurves.push(
          segment.scale(linearDistanceFunction(-d2, -d4, tlen, alen, slen))
        );
      } else {
        fcurves.push(segment.scale(d1));
        bcurves.push(segment.scale(-d2));
      }
      alen += slen;
    });
    bcurves = bcurves.map(function(s) {
      p2 = s.points;
      if (p2[3]) {
        s.points = [p2[3], p2[2], p2[1], p2[0]];
      } else {
        s.points = [p2[2], p2[1], p2[0]];
      }
      return s;
    }).reverse();
    const fs = fcurves[0].points[0], fe = fcurves[len - 1].points[fcurves[len - 1].points.length - 1], bs = bcurves[len - 1].points[bcurves[len - 1].points.length - 1], be = bcurves[0].points[0], ls = utils.makeline(bs, fs), le = utils.makeline(fe, be), segments = [ls].concat(fcurves).concat([le]).concat(bcurves);
    return new PolyBezier(segments);
  }
  outlineshapes(d1, d2, curveIntersectionThreshold) {
    d2 = d2 || d1;
    const outline = this.outline(d1, d2).curves;
    const shapes = [];
    for (let i = 1, len = outline.length; i < len / 2; i++) {
      const shape = utils.makeshape(
        outline[i],
        outline[len - i],
        curveIntersectionThreshold
      );
      shape.startcap.virtual = i > 1;
      shape.endcap.virtual = i < len / 2 - 1;
      shapes.push(shape);
    }
    return shapes;
  }
  intersects(curve, curveIntersectionThreshold) {
    if (!curve) return this.selfintersects(curveIntersectionThreshold);
    if (curve.p1 && curve.p2) {
      return this.lineIntersects(curve);
    }
    if (curve instanceof _Bezier) {
      curve = curve.reduce();
    }
    return this.curveintersects(
      this.reduce(),
      curve,
      curveIntersectionThreshold
    );
  }
  lineIntersects(line4) {
    const mx = min2(line4.p1.x, line4.p2.x), my = min2(line4.p1.y, line4.p2.y), MX = max2(line4.p1.x, line4.p2.x), MY = max2(line4.p1.y, line4.p2.y);
    return utils.roots(this.points, line4).filter((t2) => {
      var p2 = this.get(t2);
      return utils.between(p2.x, mx, MX) && utils.between(p2.y, my, MY);
    });
  }
  selfintersects(curveIntersectionThreshold) {
    const reduced = this.reduce(), len = reduced.length - 2, results = [];
    for (let i = 0, result, left, right; i < len; i++) {
      left = reduced.slice(i, i + 1);
      right = reduced.slice(i + 2);
      result = this.curveintersects(left, right, curveIntersectionThreshold);
      results.push(...result);
    }
    return results;
  }
  curveintersects(c12, c22, curveIntersectionThreshold) {
    const pairs = [];
    c12.forEach(function(l) {
      c22.forEach(function(r) {
        if (l.overlaps(r)) {
          pairs.push({ left: l, right: r });
        }
      });
    });
    let intersections2 = [];
    pairs.forEach(function(pair) {
      const result = utils.pairiteration(
        pair.left,
        pair.right,
        curveIntersectionThreshold
      );
      if (result.length > 0) {
        intersections2 = intersections2.concat(result);
      }
    });
    return intersections2;
  }
  arcs(errorThreshold) {
    errorThreshold = errorThreshold || 0.5;
    return this._iterate(errorThreshold, []);
  }
  _error(pc, np1, s, e) {
    const q = (e - s) / 4, c12 = this.get(s + q), c22 = this.get(e - q), ref = utils.dist(pc, np1), d1 = utils.dist(pc, c12), d2 = utils.dist(pc, c22);
    return abs3(d1 - ref) + abs3(d2 - ref);
  }
  _iterate(errorThreshold, circles) {
    let t_s = 0, t_e = 1, safety;
    do {
      safety = 0;
      t_e = 1;
      let np1 = this.get(t_s), np2, np3, arc2, prev_arc;
      let curr_good = false, prev_good = false, done;
      let t_m = t_e, prev_e = 1, step = 0;
      do {
        prev_good = curr_good;
        prev_arc = arc2;
        t_m = (t_s + t_e) / 2;
        step++;
        np2 = this.get(t_m);
        np3 = this.get(t_e);
        arc2 = utils.getccenter(np1, np2, np3);
        arc2.interval = {
          start: t_s,
          end: t_e
        };
        let error = this._error(arc2, np1, t_s, t_e);
        curr_good = error <= errorThreshold;
        done = prev_good && !curr_good;
        if (!done) prev_e = t_e;
        if (curr_good) {
          if (t_e >= 1) {
            arc2.interval.end = prev_e = 1;
            prev_arc = arc2;
            if (t_e > 1) {
              let d2 = {
                x: arc2.x + arc2.r * cos2(arc2.e),
                y: arc2.y + arc2.r * sin2(arc2.e)
              };
              arc2.e += utils.angle({ x: arc2.x, y: arc2.y }, d2, this.get(1));
            }
            break;
          }
          t_e = t_e + (t_e - t_s) / 2;
        } else {
          t_e = t_m;
        }
      } while (!done && safety++ < 100);
      if (safety >= 100) {
        break;
      }
      prev_arc = prev_arc ? prev_arc : arc2;
      circles.push(prev_arc);
      t_s = prev_e;
    } while (t_e < 1);
    return circles;
  }
};

// ../geometry/src/bezier/index.ts
var quadraticSimple = (start, end, bend = 0) => {
  if (Number.isNaN(bend)) throw new Error(`bend is NaN`);
  if (bend < -1 || bend > 1) throw new Error(`Expects bend range of -1 to 1`);
  const middle = interpolate(0.5, start, end);
  let target = middle;
  if (end.y < start.y) {
    target = bend > 0 ? { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y) } : { x: Math.max(start.x, end.x), y: Math.max(start.y, end.y) };
  } else {
    target = bend > 0 ? { x: Math.max(start.x, end.x), y: Math.min(start.y, end.y) } : { x: Math.min(start.x, end.x), y: Math.max(start.y, end.y) };
  }
  const handle = interpolate(Math.abs(bend), middle, target);
  return quadratic(start, end, handle);
};
var interpolator = (q) => {
  const bzr = isCubicBezier(q) ? new Bezier(q.a.x, q.a.y, q.cubic1.x, q.cubic1.y, q.cubic2.x, q.cubic2.y, q.b.x, q.b.y) : new Bezier(q.a, q.quadratic, q.b);
  return (amount) => bzr.compute(amount);
};
var quadraticToSvgString = (start, end, handle) => [`M ${start.x} ${start.y} Q ${handle.x} ${handle.y} ${end.x} ${end.y}`];
var toPath3 = (cubicOrQuadratic) => {
  if (isCubicBezier(cubicOrQuadratic)) {
    return cubicToPath(cubicOrQuadratic);
  } else if (isQuadraticBezier(cubicOrQuadratic)) {
    return quadratictoPath(cubicOrQuadratic);
  } else {
    throw new Error(`Unknown bezier type`);
  }
};
var cubic = (start, end, cubic1, cubic2) => ({
  a: Object.freeze(start),
  b: Object.freeze(end),
  cubic1: Object.freeze(cubic1),
  cubic2: Object.freeze(cubic2)
});
var cubicToPath = (cubic2) => {
  const { a: a2, cubic1, cubic2: cubic22, b: b2 } = cubic2;
  const bzr = new Bezier(a2, cubic1, cubic22, b2);
  return Object.freeze({
    ...cubic2,
    length: () => bzr.length(),
    interpolate: (t2) => bzr.compute(t2),
    nearest: (_) => {
      throw new Error(`not implemented`);
    },
    bbox: () => {
      const { x, y } = bzr.bbox();
      const xSize = x.size;
      const ySize = y.size;
      if (xSize === void 0) throw new Error(`x.size not present on calculated bbox`);
      if (ySize === void 0) throw new Error(`x.size not present on calculated bbox`);
      return fromTopLeft({ x: x.min, y: y.min }, xSize, ySize);
    },
    relativePosition: (_point, _intersectionThreshold) => {
      throw new Error(`Not implemented`);
    },
    distanceToPoint: (_point) => {
      throw new Error(`Not implemented`);
    },
    toSvgString: () => [`brrup`],
    kind: `bezier/cubic`
  });
};
var quadratic = (start, end, handle) => ({
  a: Object.freeze(start),
  b: Object.freeze(end),
  quadratic: Object.freeze(handle)
});
var quadratictoPath = (quadraticBezier2) => {
  const { a: a2, b: b2, quadratic: quadratic2 } = quadraticBezier2;
  const bzr = new Bezier(a2, quadratic2, b2);
  return Object.freeze({
    ...quadraticBezier2,
    length: () => bzr.length(),
    interpolate: (t2) => bzr.compute(t2),
    nearest: (_) => {
      throw new Error(`not implemented`);
    },
    bbox: () => {
      const { x, y } = bzr.bbox();
      const xSize = x.size;
      const ySize = y.size;
      if (xSize === void 0) throw new Error(`x.size not present on calculated bbox`);
      if (ySize === void 0) throw new Error(`x.size not present on calculated bbox`);
      return fromTopLeft({ x: x.min, y: y.min }, xSize, ySize);
    },
    distanceToPoint: (_point) => {
      throw new Error(`Not implemented`);
    },
    relativePosition: (_point, _intersectionThreshold) => {
      throw new Error(`Not implemented`);
    },
    toString: () => bzr.toString(),
    toSvgString: () => quadraticToSvgString(a2, b2, quadratic2),
    kind: `bezier/quadratic`
  });
};

// ../geometry/src/ellipse.ts
var ellipse_exports = {};
__export(ellipse_exports, {
  fromDegrees: () => fromDegrees
});
var fromDegrees = (radiusX, radiusY, rotationDeg = 0, startAngleDeg = 0, endAngleDeg = 360) => ({
  radiusX,
  radiusY,
  rotation: degreeToRadian(rotationDeg),
  startAngle: degreeToRadian(startAngleDeg),
  endAngle: degreeToRadian(endAngleDeg)
});

// ../geometry/src/curve-simplification.ts
var curve_simplification_exports = {};
__export(curve_simplification_exports, {
  rdpPerpendicularDistance: () => rdpPerpendicularDistance,
  rdpShortestDistance: () => rdpShortestDistance
});
var rdpShortestDistance = (points, epsilon2 = 0.1) => {
  const firstPoint = points[0];
  const lastPoint = points.at(-1);
  if (points.length < 3) {
    return points;
  }
  let index = -1;
  let distribution = 0;
  for (let index_ = 1; index_ < points.length - 1; index_++) {
    const cDistribution = distanceFromPointToLine(points[index_], firstPoint, lastPoint);
    if (cDistribution > distribution) {
      distribution = cDistribution;
      index = index_;
    }
  }
  if (distribution > epsilon2) {
    const l1 = points.slice(0, index + 1);
    const l2 = points.slice(index);
    const r1 = rdpShortestDistance(l1, epsilon2);
    const r2 = rdpShortestDistance(l2, epsilon2);
    const rs = [...r1.slice(0, -1), ...r2];
    return rs;
  } else {
    return [firstPoint, lastPoint];
  }
};
var rdpPerpendicularDistance = (points, epsilon2 = 0.1) => {
  const firstPoint = points[0];
  const lastPoint = points.at(-1);
  if (points.length < 3) {
    return points;
  }
  let index = -1;
  let distribution = 0;
  for (let index_ = 1; index_ < points.length - 1; index_++) {
    const cDistribution = findPerpendicularDistance(points[index_], firstPoint, lastPoint);
    if (cDistribution > distribution) {
      distribution = cDistribution;
      index = index_;
    }
  }
  if (distribution > epsilon2) {
    const l1 = points.slice(0, index + 1);
    const l2 = points.slice(index);
    const r1 = rdpPerpendicularDistance(l1, epsilon2);
    const r2 = rdpPerpendicularDistance(l2, epsilon2);
    const rs = [...r1.slice(0, -1), ...r2];
    return rs;
  } else {
    return [firstPoint, lastPoint];
  }
};
function findPerpendicularDistance(p2, p1, p22) {
  let result;
  let slope2;
  let intercept;
  if (p1.x == p22.x) {
    result = Math.abs(p2.x - p1.x);
  } else {
    slope2 = (p22.y - p1.y) / (p22.x - p1.x);
    intercept = p1.y - slope2 * p1.x;
    result = Math.abs(slope2 * p2.x - p2.y + intercept) / Math.sqrt(Math.pow(slope2, 2) + 1);
  }
  return result;
}
var distanceFromPointToLine = (p2, index, index_) => {
  const lineLength = distance(index, index_);
  if (lineLength == 0) {
    return distance(p2, index);
  }
  const t2 = ((p2.x - index.x) * (index_.x - index.x) + (p2.y - index.y) * (index_.y - index.y)) / lineLength;
  if (t2 < 0) {
    return distance(p2, index);
  }
  if (t2 > 1) {
    return distance(p2, index_);
  }
  return distance(p2, { x: index.x + t2 * (index_.x - index.x), y: index.y + t2 * (index_.y - index.y) });
};

// ../geometry/src/quad-tree.ts
var quad_tree_exports = {};
__export(quad_tree_exports, {
  Direction: () => Direction,
  QuadTreeNode: () => QuadTreeNode,
  quadTree: () => quadTree
});

// ../iterables/src/guard.ts
var isAsyncIterable = (v) => {
  if (typeof v !== `object`) return false;
  if (v === null) return false;
  return Symbol.asyncIterator in v;
};
var isIterable = (v) => {
  if (typeof v !== `object`) return false;
  if (v === null) return false;
  return Symbol.iterator in v;
};

// ../iterables/src/sync.ts
function last(it) {
  let returnValue;
  for (const value of it) {
    returnValue = value;
  }
  return returnValue;
}
function* map(it, f) {
  for (const v of it) {
    yield f(v);
  }
}
function* max3(it, gt = (a2, b2) => a2 > b2) {
  let max9;
  for (const v of it) {
    if (max9 === void 0) {
      max9 = v;
      yield max9;
      continue;
    }
    if (gt(v, max9)) {
      max9 = v;
      yield max9;
    }
  }
  return max9;
}
function* min3(it, gt = (a2, b2) => a2 > b2) {
  let min8;
  for (const v of it) {
    if (min8 === void 0) {
      min8 = v;
      yield min8;
    }
    if (gt(min8, v)) {
      min8 = v;
      yield min8;
    }
  }
}

// ../collections/src/queue/queue-fns.ts
var trimQueue = (opts, queue, toAdd) => {
  const potentialLength = queue.length + toAdd.length;
  const capacity = opts.capacity ?? potentialLength;
  const toRemove = potentialLength - capacity;
  const policy = opts.discardPolicy ?? `additions`;
  switch (policy) {
    // Only add what we can from toAdd
    case `additions`: {
      if (queue.length === 0) return toAdd.slice(0, toAdd.length - toRemove);
      if (queue.length === opts.capacity) {
        return queue;
      } else {
        return [...queue, ...toAdd.slice(0, toRemove - 1)];
      }
    }
    // Remove from rear of queue (last index) before adding new things
    case `newer`: {
      if (toRemove >= queue.length) {
        if (queue.length === 0) {
          return [...toAdd.slice(0, capacity - 1), toAdd.at(-1)];
        }
        return toAdd.slice(
          Math.max(0, toAdd.length - capacity),
          Math.min(toAdd.length, capacity) + 1
        );
      } else {
        const countToAdd = Math.max(1, toAdd.length - queue.length);
        const toAddFinal = toAdd.slice(toAdd.length - countToAdd, toAdd.length);
        const toKeep = queue.slice(0, Math.min(queue.length, capacity - 1));
        const t2 = [...toKeep, ...toAddFinal];
        return t2;
      }
    }
    // Remove from the front of the queue (0 index). ie. older items are discarded
    case `older`: {
      return [...queue, ...toAdd].slice(toRemove);
    }
    default: {
      throw new Error(`Unknown overflow policy ${policy}`);
    }
  }
};
var enqueue = (opts, queue, ...toAdd) => {
  if (opts === void 0) throw new Error(`opts parameter undefined`);
  const potentialLength = queue.length + toAdd.length;
  const overSize = opts.capacity && potentialLength > opts.capacity;
  const toReturn = overSize ? trimQueue(opts, queue, toAdd) : [...queue, ...toAdd];
  if (opts.capacity && toReturn.length !== opts.capacity && overSize) {
    throw new Error(
      `Bug! Expected return to be at capacity. Return len: ${toReturn.length} capacity: ${opts.capacity} opts: ${JSON.stringify(opts)}`
    );
  }
  if (!opts.capacity && toReturn.length !== potentialLength) {
    throw new Error(
      `Bug! Return length not expected. Return len: ${toReturn.length} expected: ${potentialLength} opts: ${JSON.stringify(opts)}`
    );
  }
  return toReturn;
};
var dequeue = (opts, queue) => {
  if (queue.length === 0) throw new Error(`Queue is empty`);
  return queue.slice(1);
};
var peek = (opts, queue) => queue[0];
var isEmpty5 = (opts, queue) => queue.length === 0;
var isFull = (opts, queue) => {
  if (opts.capacity) {
    return queue.length >= opts.capacity;
  }
  return false;
};

// ../collections/src/queue/queue-mutable.ts
var QueueMutable = class extends SimpleEventEmitter {
  options;
  data;
  eq;
  constructor(opts = {}, data = []) {
    super();
    if (opts === void 0) throw new Error(`opts parameter undefined`);
    this.options = opts;
    this.data = data;
    this.eq = opts.eq ?? isEqualDefault2;
  }
  clear() {
    const copy = [...this.data];
    this.data = [];
    this.fireEvent(`removed`, { finalData: this.data, removed: copy });
    this.onClear();
  }
  /**
   * Called when all data is cleared
   */
  onClear() {
  }
  at(index) {
    if (index >= this.data.length) throw new Error(`Index outside bounds of queue`);
    const v = this.data.at(index);
    if (v === void 0) throw new Error(`Index appears to be outside range of queue`);
    return v;
  }
  enqueue(...toAdd) {
    this.data = enqueue(this.options, this.data, ...toAdd);
    const length5 = this.data.length;
    this.onEnqueue(this.data, toAdd);
    return length5;
  }
  onEnqueue(result, attemptedToAdd) {
    this.fireEvent(`enqueue`, { added: attemptedToAdd, finalData: result });
  }
  dequeue() {
    const v = peek(this.options, this.data);
    if (v === void 0) return;
    this.data = dequeue(this.options, this.data);
    this.fireEvent(`dequeue`, { removed: v, finalData: this.data });
    this.onRemoved([v], this.data);
    return v;
  }
  onRemoved(removed, finalData) {
    this.fireEvent(`removed`, { removed, finalData });
  }
  /**
   * Removes values that match `predicate`.
   * @param predicate 
   * @returns Returns number of items removed.
   */
  removeWhere(predicate) {
    const countPre = this.data.length;
    const toRemove = this.data.filter((v) => predicate(v));
    if (toRemove.length === 0) return 0;
    this.data = this.data.filter((element) => !predicate(element));
    this.onRemoved(toRemove, this.data);
    return countPre - this.data.length;
  }
  /**
  * Return a copy of the array
  * @returns 
  */
  toArray() {
    return [...this.data];
  }
  get isEmpty() {
    return isEmpty5(this.options, this.data);
  }
  get isFull() {
    return isFull(this.options, this.data);
  }
  get length() {
    return this.data.length;
  }
  get peek() {
    return peek(this.options, this.data);
  }
};

// ../collections/src/stack/StackFns.ts
var trimStack = (opts, stack, toAdd) => {
  const potentialLength = stack.length + toAdd.length;
  const policy = opts.discardPolicy ?? `additions`;
  const capacity = opts.capacity ?? potentialLength;
  const toRemove = potentialLength - capacity;
  if (opts.debug) {
    console.log(
      `Stack.push: stackLen: ${stack.length} potentialLen: ${potentialLength} toRemove: ${toRemove} policy: ${policy}`
    );
  }
  switch (policy) {
    case `additions`: {
      if (opts.debug) {
        console.log(
          `Stack.push:DiscardAdditions: stackLen: ${stack.length} slice: ${potentialLength - capacity} toAddLen: ${toAdd.length}`
        );
      }
      if (stack.length === opts.capacity) {
        return stack;
      } else {
        return [...stack, ...toAdd.slice(0, toAdd.length - toRemove)];
      }
    }
    case `newer`: {
      if (toRemove >= stack.length) {
        return toAdd.slice(
          Math.max(0, toAdd.length - capacity),
          Math.min(toAdd.length, capacity) + 1
        );
      } else {
        if (opts.debug) {
          console.log(` from orig: ${JSON.stringify(stack.slice(0, stack.length - toRemove))}`);
        }
        return [
          ...stack.slice(0, stack.length - toRemove),
          ...toAdd.slice(0, Math.min(toAdd.length, capacity - toRemove + 1))
        ];
      }
    }
    case `older`: {
      return [...stack, ...toAdd].slice(toRemove);
    }
    default: {
      throw new Error(`Unknown discard policy ${policy}`);
    }
  }
};
var push = (opts, stack, ...toAdd) => {
  const potentialLength = stack.length + toAdd.length;
  const overSize = opts.capacity && potentialLength > opts.capacity;
  const toReturn = overSize ? trimStack(opts, stack, toAdd) : [...stack, ...toAdd];
  return toReturn;
};
var pop = (opts, stack) => {
  if (stack.length === 0) throw new Error(`Stack is empty`);
  return stack.slice(0, -1);
};
var peek2 = (opts, stack) => stack.at(-1);
var isEmpty6 = (opts, stack) => stack.length === 0;
var isFull2 = (opts, stack) => {
  if (opts.capacity) {
    return stack.length >= opts.capacity;
  }
  return false;
};

// ../collections/src/stack/StackMutable.ts
var StackMutable = class {
  opts;
  /* eslint-disable-next-line functional/prefer-readonly-type */
  data;
  constructor(opts = {}, data = []) {
    this.opts = opts;
    this.data = data;
  }
  /**
   * Push data onto the stack.
   * If `toAdd` is empty, nothing happens
   * @param toAdd Data to add
   * @returns Length of stack
   */
  push(...toAdd) {
    if (toAdd.length === 0) return this.data.length;
    this.data = push(this.opts, this.data, ...toAdd);
    return this.data.length;
  }
  forEach(fn) {
    this.data.forEach(fn);
  }
  forEachFromTop(fn) {
    [...this.data].reverse().forEach(fn);
  }
  pop() {
    const v = peek2(this.opts, this.data);
    this.data = pop(this.opts, this.data);
    return v;
  }
  get isEmpty() {
    return isEmpty6(this.opts, this.data);
  }
  get isFull() {
    return isFull2(this.opts, this.data);
  }
  get peek() {
    return peek2(this.opts, this.data);
  }
  get length() {
    return this.data.length;
  }
};

// ../collections/src/stack/StackImmutable.ts
var StackImmutable = class _StackImmutable {
  opts;
  /* eslint-disable-next-line functional/prefer-readonly-type */
  data;
  constructor(opts = {}, data = []) {
    this.opts = opts;
    this.data = data;
  }
  push(...toAdd) {
    return new _StackImmutable(
      this.opts,
      push(this.opts, this.data, ...toAdd)
    );
  }
  pop() {
    return new _StackImmutable(this.opts, pop(this.opts, this.data));
  }
  forEach(fn) {
    this.data.forEach(fn);
  }
  forEachFromTop(fn) {
    [...this.data].reverse().forEach(fn);
  }
  get isEmpty() {
    return isEmpty6(this.opts, this.data);
  }
  get isFull() {
    return isFull2(this.opts, this.data);
  }
  get peek() {
    return peek2(this.opts, this.data);
  }
  get length() {
    return this.data.length;
  }
};

// ../iterables/src/async.ts
async function last2(it, opts = {}) {
  const abort = opts.abort;
  let returnValue;
  for await (const value of it) {
    if (abort?.aborted) return void 0;
    returnValue = value;
  }
  return returnValue;
}
async function* max4(it, gt = (a2, b2) => a2 > b2) {
  let max9;
  for await (const v of it) {
    if (max9 === void 0) {
      max9 = v;
      yield max9;
      continue;
    }
    if (gt(v, max9)) {
      max9 = v;
      yield v;
    }
  }
}
async function* min4(it, gt = (a2, b2) => a2 > b2) {
  let min8;
  for await (const v of it) {
    if (min8 === void 0) {
      min8 = v;
      yield min8;
      continue;
    }
    if (gt(min8, v)) {
      min8 = v;
      yield v;
    }
  }
  return min8;
}
async function nextWithTimeout(it, options) {
  const ms = intervalToMs(options, 1e3);
  const value = await Promise.race([
    (async () => {
      await sleep({ millis: ms, signal: options.signal });
      return void 0;
    })(),
    (async () => {
      return await it.next();
    })()
  ]);
  if (value === void 0) throw new Error(`Timeout`);
  return value;
}

// ../iterables/src/index.ts
function min5(it, gt = (a2, b2) => a2 > b2) {
  return isAsyncIterable(it) ? min4(it, gt) : min3(it, gt);
}
function max5(it, gt = (a2, b2) => a2 > b2) {
  return isAsyncIterable(it) ? max4(it, gt) : max3(it, gt);
}
function last3(it) {
  return isAsyncIterable(it) ? last2(it) : last(it);
}

// ../collections/src/queue/priority-mutable.ts
var PriorityMutable = class extends QueueMutable {
  constructor(opts = {}) {
    if (opts.eq === void 0) {
      opts = {
        ...opts,
        eq: (a2, b2) => {
          return isEqualDefault2(a2.item, b2.item);
        }
      };
    }
    super(opts);
  }
  /**
   * Adds an item with a given priority
   * @param item Item
   * @param priority Priority (higher numeric value means higher priority)
   */
  enqueueWithPriority(item, priority) {
    throwNumberTest(priority, `positive`);
    super.enqueue({ item, priority });
  }
  changePriority(item, priority, addIfMissing = false, eq) {
    if (item === void 0) throw new Error(`Item cannot be undefined`);
    let toDelete;
    for (const d2 of this.data) {
      if (eq) {
        if (eq(d2.item, item)) {
          toDelete = d2;
          break;
        }
      } else {
        if (this.eq(d2, { item, priority: 0 })) {
          toDelete = d2;
          break;
        }
      }
    }
    if (toDelete === void 0 && !addIfMissing) throw new Error(`Item not found in priority queue. Item: ${JSON.stringify(item)}`);
    if (toDelete !== void 0) {
      this.removeWhere((item2) => toDelete === item2);
    }
    this.enqueueWithPriority(item, priority);
  }
  dequeueMax() {
    const m3 = last3(max5(this.data, (a2, b2) => a2.priority >= b2.priority));
    if (m3 === void 0) return;
    this.removeWhere((item) => item === m3);
    return m3.item;
  }
  dequeueMin() {
    const m3 = last3(max5(this.data, (a2, b2) => a2.priority >= b2.priority));
    if (m3 === void 0) return;
    this.removeWhere((item) => item.item === m3);
    return m3.item;
  }
  peekMax() {
    const m3 = last3(max5(this.data, (a2, b2) => a2.priority >= b2.priority));
    if (m3 === void 0) return;
    return m3.item;
  }
  peekMin() {
    const m3 = last3(min5(this.data, (a2, b2) => a2.priority >= b2.priority));
    if (m3 === void 0) return;
    return m3.item;
  }
};

// ../collections/src/map/map-immutable-fns.ts
var addArray = (map3, data) => {
  const x = new Map(map3.entries());
  for (const d2 of data) {
    if (d2[0] === void 0) throw new Error(`key cannot be undefined`);
    if (d2[1] === void 0) throw new Error(`value cannot be undefined`);
    x.set(d2[0], d2[1]);
  }
  return x;
};
var addObjects = (map3, data) => {
  const x = new Map(map3.entries());
  for (const d2 of data) {
    if (d2.key === void 0) throw new Error(`key cannot be undefined`);
    if (d2.value === void 0) throw new Error(`value cannot be undefined`);
    x.set(d2.key, d2.value);
  }
  return x;
};
var add = (map3, ...data) => {
  if (map3 === void 0) throw new Error(`map parameter is undefined`);
  if (data === void 0) throw new Error(`data parameter i.s undefined`);
  if (data.length === 0) return map3;
  const firstRecord = data[0];
  const isObject = typeof firstRecord.key !== `undefined` && typeof firstRecord.value !== `undefined`;
  return isObject ? addObjects(map3, data) : addArray(map3, data);
};
var set3 = (map3, key, value) => {
  const x = new Map(map3.entries());
  x.set(key, value);
  return x;
};
var del = (map3, key) => {
  const x = new Map(map3.entries());
  x.delete(key);
  return x;
};

// ../collections/src/map/map.ts
var immutable2 = (dataOrMap) => {
  if (dataOrMap === void 0) return immutable2([]);
  if (Array.isArray(dataOrMap)) return immutable2(add(/* @__PURE__ */ new Map(), ...dataOrMap));
  const data = dataOrMap;
  return {
    add: (...itemsToAdd) => {
      const s = add(data, ...itemsToAdd);
      return immutable2(s);
    },
    set: (key, value) => {
      const s = set3(data, key, value);
      return immutable2(s);
    },
    get: (key) => data.get(key),
    delete: (key) => immutable2(del(data, key)),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clear: () => immutable2(),
    has: (key) => data.has(key),
    entries: () => data.entries(),
    values: () => data.values(),
    isEmpty: () => data.size === 0
  };
};

// ../collections/src/map/number-map.ts
var NumberMap = class extends Map {
  defaultValue;
  constructor(defaultValue = 0) {
    super();
    this.defaultValue = defaultValue;
  }
  get(key) {
    const v = super.get(key);
    if (v === void 0) return this.defaultValue;
    return v;
  }
  reset(key) {
    super.set(key, this.defaultValue);
    return this.defaultValue;
  }
  multiply(key, amount) {
    const v = super.get(key);
    let value = v ?? this.defaultValue;
    value *= amount;
    super.set(key, value);
    return value;
  }
  add(key, amount = 1) {
    const v = super.get(key);
    let value = v ?? this.defaultValue;
    value += amount;
    super.set(key, value);
    return value;
  }
  subtract(key, amount = 1) {
    const v = super.get(key);
    let value = v ?? this.defaultValue;
    value -= amount;
    super.set(key, value);
    return value;
  }
};

// ../collections/src/graph/directed-graph.ts
var directed_graph_exports = {};
__export(directed_graph_exports, {
  adjacentVertices: () => adjacentVertices,
  areAdjacent: () => areAdjacent,
  bfs: () => bfs,
  clone: () => clone,
  connect: () => connect,
  connectTo: () => connectTo,
  connectWithEdges: () => connectWithEdges,
  createVertex: () => createVertex,
  dfs: () => dfs,
  disconnect: () => disconnect,
  distance: () => distance3,
  distanceDefault: () => distanceDefault,
  dumpGraph: () => dumpGraph,
  edges: () => edges2,
  get: () => get,
  getCycles: () => getCycles,
  getOrCreate: () => getOrCreate,
  getOrFail: () => getOrFail,
  graph: () => graph,
  graphFromVertices: () => graphFromVertices,
  hasKey: () => hasKey,
  hasNoOuts: () => hasNoOuts,
  hasOnlyOuts: () => hasOnlyOuts,
  hasOut: () => hasOut,
  isAcyclic: () => isAcyclic,
  pathDijkstra: () => pathDijkstra,
  toAdjacencyMatrix: () => toAdjacencyMatrix,
  topologicalSort: () => topologicalSort,
  transitiveReduction: () => transitiveReduction,
  updateGraphVertex: () => updateGraphVertex,
  vertexHasOut: () => vertexHasOut,
  vertices: () => vertices
});

// ../collections/src/table.ts
var Table = class {
  rows = [];
  rowLabels = [];
  colLabels = [];
  labelColumns(...labels) {
    this.colLabels = labels;
  }
  labelColumn(columnNumber, label) {
    this.colLabels[columnNumber] = label;
  }
  getColumnLabelIndex(label) {
    for (const [index, l] of this.colLabels.entries()) {
      if (l === label) return index;
    }
  }
  print() {
    console.table([...this.rowsWithLabelsObject()]);
  }
  *rowsWithLabelsArray() {
    for (let index = 0; index < this.rows.length; index++) {
      const labelledRow = this.getRowWithLabelsArray(index);
      yield labelledRow;
    }
  }
  /**
   * Return a copy of table as nested array
   * ```js
   * const t = new Table();
   * // add stuff
   * // ...
   * const m = t.asArray();
   * for (const row of m) {
   *  for (const colValue of row) {
   *    // iterate over all column values for this row
   *  }
   * }
   * ```
   * 
   * Alternative: get value at row Y and column X
   * ```js
   * const value = m[y][x];
   * ```
   * @returns 
   */
  asArray() {
    const r = [];
    for (const row of this.rows) {
      if (row === void 0) r.push([]);
      else r.push([...row]);
    }
    return r;
  }
  /**
   * Return the number of rows
   */
  get rowCount() {
    return this.rows.length;
  }
  /**
   * Return the maximum number of columns in any row
   */
  get columnCount() {
    const lengths3 = this.rows.map((row) => row.length);
    return Math.max(...lengths3);
  }
  *rowsWithLabelsObject() {
    for (let index = 0; index < this.rows.length; index++) {
      const labelledRow = this.getRowWithLabelsObject(index);
      yield labelledRow;
    }
  }
  labelRows(...labels) {
    this.rowLabels = labels;
  }
  appendRow(...data) {
    this.rows.push(data);
  }
  getRowWithLabelsArray(rowNumber) {
    const row = this.rows.at(rowNumber);
    if (row === void 0) return void 0;
    return row.map((value, index) => [this.colLabels.at(index), value]);
  }
  /**
   * Return a row of objects. Keys use the column labels.
   * 
   * ```js
   * const row = table.getRowWithLabelsObject(10);
   * // eg:
   * // [{ colour: red, size: 10}, { colour: blue, size: 20 }]
   * ```
   * @param rowNumber 
   * @returns 
   */
  getRowWithLabelsObject(rowNumber) {
    const row = this.rows.at(rowNumber);
    if (row === void 0) return void 0;
    const object2 = {};
    for (let index = 0; index < this.colLabels.length; index++) {
      const label = this.colLabels.at(index) ?? index.toString();
      object2[label] = row[index];
    }
    return object2;
  }
  /**
   * Gets or creates a row at `rowNumber`.
   * @param rowNumber 
   * @returns 
   */
  getOrCreateRow(rowNumber) {
    let row = this.rows.at(rowNumber);
    if (row === void 0) {
      row = [];
      this.rows[rowNumber] = row;
    }
    return row;
  }
  /**
   * Gets the values at `rowNumber`
   * @param rowNumber 
   * @returns 
   */
  row(rowNumber) {
    return this.rows.at(rowNumber);
  }
  /**
   * Set the value of row,column to `value`
   * @param rowNumber 
   * @param columnNumber 
   * @param value 
   */
  set(rowNumber, columnNumber, value) {
    const row = this.getOrCreateRow(rowNumber);
    row[columnNumber] = value;
  }
  get(rowNumber, column) {
    const row = this.getOrCreateRow(rowNumber);
    const index = typeof column === `number` ? column : this.getColumnLabelIndex(column);
    if (index === void 0) throw new Error(`Column not found: ${column}`);
    return row[index];
  }
  /**
   * For a given row number, set all the columns to `value`.
   * `cols` gives the number of columns to set
   * @param rowNumber 
   * @param cols 
   * @param value 
   */
  setRow(rowNumber, cols, value) {
    const row = this.getOrCreateRow(rowNumber);
    for (let columnNumber = 0; columnNumber < cols; columnNumber++) {
      row[columnNumber] = value;
    }
  }
};

// ../collections/src/graph/directed-graph.ts
var createVertex = (id) => {
  return {
    id,
    out: []
  };
};
function hasKey(graph2, key) {
  throwGraphTest(graph2);
  return graph2.vertices.has(key);
}
function get(graph2, key) {
  throwGraphTest(graph2);
  throwStringTest(key, `non-empty`, `key`);
  return graph2.vertices.get(key);
}
function toAdjacencyMatrix(graph2) {
  throwGraphTest(graph2);
  const v = [...graph2.vertices.values()];
  const table = new Table();
  table.labelColumns(...v.map((vv) => vv.id));
  table.labelRows(...v.map((vv) => vv.id));
  for (let i = 0; i < v.length; i++) {
    table.setRow(i, v.length, false);
    const ii = v[i];
    for (const [j, jj] of v.entries()) {
      if (ii.out.some((o) => o.id === jj.id)) {
        table.set(i, j, true);
      }
    }
  }
  return table;
}
var dumpGraph = (graph2) => {
  const lines = debugGraphToArray(graph2);
  return lines.join(`
`);
};
var debugGraphToArray = (graph2) => {
  const r = [];
  const vertices2 = `vertices` in graph2 ? graph2.vertices.values() : graph2;
  for (const v of vertices2) {
    const str = debugDumpVertex(v);
    r.push(...str.map((line4) => ` ${line4}`));
  }
  return r;
};
var distance3 = (graph2, edge) => {
  if (edge.weight !== void 0) return edge.weight;
  return 1;
};
function* edges2(graph2) {
  throwGraphTest(graph2);
  const vertices2 = [...graph2.vertices.values()];
  for (const vertex of vertices2) {
    for (const edge of vertex.out) {
      yield edge;
    }
  }
}
function* vertices(graph2) {
  throwGraphTest(graph2);
  const vertices2 = [...graph2.vertices.values()];
  for (const vertex of vertices2) {
    yield vertex;
  }
}
function testGraph(g2, parameterName = `graph`) {
  if (g2 === void 0) return [false, `Param '${parameterName}' is undefined. Expected Graph`];
  if (g2 === null) return [false, `Param '${parameterName}' is null. Expected Graph`];
  if (typeof g2 === `object`) {
    if (!(`vertices` in g2)) return [false, `Param '${parameterName}.vertices' does not exist. Is it a Graph type?`];
  } else {
    return [false, `Param '${parameterName} is type '${typeof g2}'. Expected an object Graph`];
  }
  return [true];
}
function throwGraphTest(g2, parameterName = `graph`) {
  const r = testGraph(g2, parameterName);
  if (r[0]) return;
  throw new Error(r[1]);
}
function* adjacentVertices(graph2, context) {
  throwGraphTest(graph2);
  if (context === void 0) return;
  const vertex = typeof context === `string` ? graph2.vertices.get(context) : context;
  if (vertex === void 0) throw new Error(`Vertex not found ${JSON.stringify(context)}`);
  for (const edge of vertex.out) {
    const edgeV = graph2.vertices.get(edge.id);
    if (edgeV === void 0) throw new Error(`Could not find vertex: ${edge.id}`);
    yield edgeV;
  }
}
var vertexHasOut = (vertex, outIdOrVertex) => {
  if (vertex === void 0) return false;
  const outId = typeof outIdOrVertex === `string` ? outIdOrVertex : outIdOrVertex.id;
  return vertex.out.some((edge) => edge.id === outId);
};
var hasNoOuts = (graph2, vertex) => {
  throwGraphTest(graph2);
  const context = typeof vertex === `string` ? graph2.vertices.get(vertex) : vertex;
  if (context === void 0) return false;
  return context.out.length === 0;
};
var hasOnlyOuts = (graph2, vertex, ...outIdOrVertex) => {
  throwGraphTest(graph2);
  const context = resolveVertex(graph2, vertex);
  const outs = outIdOrVertex.map((o) => resolveVertex(graph2, o));
  if (outs.length !== context.out.length) {
    return false;
  }
  for (const out of outs) {
    if (!hasOut(graph2, context, out)) {
      return false;
    }
  }
  return true;
};
var hasOut = (graph2, vertex, outIdOrVertex) => {
  throwGraphTest(graph2);
  const context = resolveVertex(graph2, vertex);
  const outId = typeof outIdOrVertex === `string` ? outIdOrVertex : outIdOrVertex.id;
  return context.out.some((edge) => edge.id === outId);
};
var getOrCreate = (graph2, id) => {
  throwGraphTest(graph2);
  const v = graph2.vertices.get(id);
  if (v !== void 0) return { graph: graph2, vertex: v };
  const vv = createVertex(id);
  const gg = updateGraphVertex(graph2, vv);
  return { graph: gg, vertex: vv };
};
var getOrFail = (graph2, id) => {
  throwGraphTest(graph2);
  const v = graph2.vertices.get(id);
  if (v === void 0) throw new Error(`Vertex '${id}' not found in graph`);
  return v;
};
var updateGraphVertex = (graph2, vertex) => {
  throwGraphTest(graph2);
  const gr = {
    ...graph2,
    vertices: graph2.vertices.set(vertex.id, vertex)
  };
  return gr;
};
var distanceDefault = (graph2, edge) => {
  if (edge.weight !== void 0) return edge.weight;
  return 1;
};
function disconnect(graph2, from2, to4) {
  throwGraphTest(graph2);
  const fromV = resolveVertex(graph2, from2);
  const toV = resolveVertex(graph2, to4);
  return hasOut(graph2, fromV, toV) ? updateGraphVertex(graph2, {
    ...fromV,
    out: fromV.out.filter((t2) => t2.id !== toV.id)
  }) : graph2;
}
function connectTo(graph2, from2, to4, weight2) {
  throwGraphTest(graph2);
  const fromResult = getOrCreate(graph2, from2);
  graph2 = fromResult.graph;
  const toResult = getOrCreate(graph2, to4);
  graph2 = toResult.graph;
  const edge = {
    id: to4,
    weight: weight2
  };
  if (!hasOut(graph2, fromResult.vertex, toResult.vertex)) {
    graph2 = updateGraphVertex(graph2, {
      ...fromResult.vertex,
      // Add new edge to list of edges for this node
      out: [...fromResult.vertex.out, edge]
    });
  }
  return { graph: graph2, edge };
}
function connect(graph2, options) {
  if (typeof graph2 !== `object`) throw new TypeError(`Param 'graph' is expected to be a DirectedGraph object. Got: ${typeof graph2}`);
  if (typeof options !== `object`) throw new TypeError(`Param 'options' is expected to be ConnectOptions object. Got: ${typeof options}`);
  const result = connectWithEdges(graph2, options);
  return result.graph;
}
function connectWithEdges(graph2, options) {
  throwGraphTest(graph2);
  const { to: to4, weight: weight2, from: from2 } = options;
  const bidi = options.bidi ?? false;
  const toList = Array.isArray(to4) ? to4 : [to4];
  const edges4 = [];
  for (const toSingle of toList) {
    const result = connectTo(graph2, from2, toSingle, weight2);
    graph2 = result.graph;
    edges4.push(result.edge);
  }
  if (!bidi) return { graph: graph2, edges: edges4 };
  for (const toSingle of toList) {
    const result = connectTo(graph2, toSingle, from2, weight2);
    graph2 = result.graph;
    edges4.push(result.edge);
  }
  return { graph: graph2, edges: edges4 };
}
var debugDumpVertex = (v) => {
  const r = [
    v.id
  ];
  const stringForEdge = (edge) => edge.weight === void 0 ? edge.id : `${edge.id} (${edge.weight})`;
  for (const edge of v.out) {
    r.push(` -> ${stringForEdge(edge)}`);
  }
  if (v.out.length === 0) r[0] += ` (terminal)`;
  return r;
};
function areAdjacent(graph2, a2, b2) {
  throwGraphTest(graph2);
  if (hasOut(graph2, a2, b2.id)) return true;
  if (hasOut(graph2, b2, a2.id)) return true;
}
function resolveVertex(graph2, idOrVertex) {
  throwGraphTest(graph2);
  if (idOrVertex === void 0) throw new Error(`Param 'idOrVertex' is undefined. Expected string or Vertex`);
  const v = typeof idOrVertex === `string` ? graph2.vertices.get(idOrVertex) : idOrVertex;
  if (v === void 0) throw new Error(`Id not found ${idOrVertex}`);
  return v;
}
function* bfs(graph2, startIdOrVertex, targetIdOrVertex) {
  throwGraphTest(graph2);
  const start = resolveVertex(graph2, startIdOrVertex);
  const target = targetIdOrVertex === void 0 ? void 0 : resolveVertex(graph2, targetIdOrVertex);
  const queue = new QueueMutable();
  const seen = /* @__PURE__ */ new Set();
  queue.enqueue(start);
  while (!queue.isEmpty) {
    const v = queue.dequeue();
    yield v;
    if (target !== void 0 && target === v) return;
    for (const edge of adjacentVertices(graph2, v)) {
      if (!seen.has(edge.id)) {
        seen.add(edge.id);
        queue.enqueue(resolveVertex(graph2, edge.id));
      }
    }
  }
}
function* dfs(graph2, startIdOrVertex) {
  throwGraphTest(graph2);
  const source = resolveVertex(graph2, startIdOrVertex);
  const s = new StackMutable();
  const seen = /* @__PURE__ */ new Set();
  s.push(source);
  while (!s.isEmpty) {
    const v = s.pop();
    if (v === void 0) continue;
    if (!seen.has(v.id)) {
      seen.add(v.id);
      yield v;
      for (const edge of v.out) {
        const destination = graph2.vertices.get(edge.id);
        if (destination) {
          s.push(destination);
        }
      }
    }
  }
}
var pathDijkstra = (graph2, sourceOrId) => {
  throwGraphTest(graph2);
  const source = typeof sourceOrId === `string` ? graph2.vertices.get(sourceOrId) : sourceOrId;
  if (source === void 0) throw new Error(`source vertex not found`);
  const distances = /* @__PURE__ */ new Map();
  const previous = /* @__PURE__ */ new Map();
  distances.set(source.id, 0);
  const pq = new PriorityMutable();
  const vertices2 = [...graph2.vertices.values()];
  for (const v of vertices2) {
    if (v.id !== source.id) {
      distances.set(v.id, Number.MAX_SAFE_INTEGER);
      previous.set(v.id, null);
    }
    pq.enqueueWithPriority(v.id, Number.MAX_SAFE_INTEGER);
  }
  while (!pq.isEmpty) {
    const u = pq.dequeueMin();
    if (u === void 0) throw new Error(`Bug. Queue unexpectedly empty`);
    const vertexU = graph2.vertices.get(u);
    for (const neighbour of vertexU.out) {
      const alt = distances.get(u) + distance3(graph2, neighbour);
      if (alt < distances.get(neighbour.id)) {
        distances.set(neighbour.id, alt);
        previous.set(neighbour.id, vertexU);
        pq.changePriority(neighbour.id, alt, true);
      }
    }
  }
  const pathTo = (id) => {
    const path2 = [];
    while (true) {
      if (id === source.id) break;
      const v = previous.get(id);
      if (v === void 0 || v === null) throw new Error(`Id not present: ${id}`);
      path2.push({ id, weight: distances.get(id) });
      id = v.id;
    }
    return path2;
  };
  return {
    distances,
    previous,
    pathTo
  };
};
var clone = (graph2) => {
  throwGraphTest(graph2);
  const g2 = {
    vertices: immutable2([...graph2.vertices.entries()])
  };
  return g2;
};
var graph = (...initialConnections) => {
  let g2 = {
    vertices: immutable2()
  };
  for (const ic of initialConnections) {
    g2 = connect(g2, ic);
  }
  return g2;
};
function isAcyclic(graph2) {
  throwGraphTest(graph2);
  const cycles = getCycles(graph2);
  return cycles.length === 0;
}
function topologicalSort(graph2) {
  throwGraphTest(graph2);
  const indegrees = new NumberMap(0);
  for (const edge of edges2(graph2)) {
    indegrees.add(edge.id, 1);
  }
  const queue = new QueueMutable();
  let vertexCount = 0;
  for (const vertex of vertices(graph2)) {
    if (indegrees.get(vertex.id) === 0) {
      queue.enqueue(vertex);
    }
    vertexCount++;
  }
  const topOrder = [];
  while (!queue.isEmpty) {
    const u = queue.dequeue();
    topOrder.push(u);
    for (const neighbour of u.out) {
      const result = indegrees.subtract(neighbour.id, 1);
      if (result === 0) {
        queue.enqueue(graph2.vertices.get(neighbour.id));
      }
    }
  }
  if (topOrder.length !== vertexCount) {
    throw new Error(`Graph contains cycles`);
  }
  return graphFromVertices(topOrder);
}
function graphFromVertices(vertices2) {
  const keyValues = map(vertices2, (f) => {
    return [f.id, f];
  });
  const m3 = immutable2([...keyValues]);
  return {
    vertices: m3
  };
}
function getCycles(graph2) {
  throwGraphTest(graph2);
  let index = 0;
  const stack = new StackMutable();
  const vertices2 = /* @__PURE__ */ new Map();
  const scc = [];
  for (const v of graph2.vertices.values()) {
    vertices2.set(v.id, {
      ...v,
      lowlink: Number.NaN,
      index: Number.NaN,
      onStack: false
    });
  }
  const strongConnect = (vertex) => {
    vertex.index = index;
    vertex.lowlink = index;
    index++;
    stack.push(vertex);
    vertex.onStack = true;
    for (const edge of vertex.out) {
      const edgeV = vertices2.get(edge.id);
      if (Number.isNaN(edgeV.index)) {
        strongConnect(edgeV);
        vertex.lowlink = Math.min(vertex.lowlink, edgeV.lowlink);
      } else if (edgeV.onStack) {
        vertex.lowlink = Math.min(vertex.lowlink, edgeV.lowlink);
      }
    }
    if (vertex.lowlink === vertex.index) {
      const stronglyConnected = [];
      let w;
      while (vertex !== w) {
        w = stack.pop();
        w.onStack = false;
        stronglyConnected.push({ id: w.id, out: w.out });
      }
      if (stronglyConnected.length > 1)
        scc.push(stronglyConnected);
    }
  };
  for (const v of vertices2.values()) {
    if (Number.isNaN(v.index)) {
      strongConnect(v);
    }
  }
  return scc;
}
function transitiveReduction(graph2) {
  throwGraphTest(graph2);
  for (const u of vertices(graph2)) {
    for (const v of adjacentVertices(graph2, u)) {
      for (const v1 of dfs(graph2, v)) {
        if (v.id === v1.id) continue;
        if (hasOut(graph2, u, v1)) {
          const g2 = disconnect(graph2, u, v1);
          return transitiveReduction(g2);
        }
      }
    }
  }
  return graph2;
}

// ../geometry/src/quad-tree.ts
var Direction = /* @__PURE__ */ ((Direction2) => {
  Direction2[Direction2["Nw"] = 0] = "Nw";
  Direction2[Direction2["Ne"] = 1] = "Ne";
  Direction2[Direction2["Sw"] = 2] = "Sw";
  Direction2[Direction2["Se"] = 3] = "Se";
  return Direction2;
})(Direction || {});
var quadTree = (bounds, initialData = [], opts = {}) => {
  const o = {
    maxItems: opts.maxItems ?? 4,
    maxLevels: opts.maxLevels ?? 4
  };
  const n2 = new QuadTreeNode(void 0, bounds, 0, o);
  for (const d2 of initialData) {
    n2.add(d2);
  }
  return n2;
};
var QuadTreeNode = class _QuadTreeNode {
  /**
   * Constructor
   * @param boundary
   * @param level
   * @param opts
   */
  constructor(parent, boundary, level, opts) {
    this.boundary = boundary;
    this.level = level;
    this.opts = opts;
    this.#parent = parent;
  }
  #items = [];
  #children = [];
  #parent;
  getLengthChildren() {
    return this.#children.length;
  }
  *parents() {
    let n2 = this;
    while (n2.#parent !== void 0) {
      yield n2.#parent;
      n2 = n2.#parent;
    }
  }
  getParent() {
    return this.#parent;
  }
  /**
   * Iterates over immediate children
   */
  *children() {
    for (const c4 of this.#children) {
      yield c4;
    }
  }
  /**
   * Array of QuadTreeItem
   * @returns
   */
  getValue() {
    return this.#items;
  }
  getIdentity() {
    return this;
  }
  /**
   * Get a descendant node in a given direction
   * @param d
   * @returns
   */
  direction(d2) {
    return this.#children[d2];
  }
  /**
   * Add an item to the quadtree
   * @param p
   * @returns False if item is outside of boundary, True if item was added
   */
  add(p2) {
    if (!isIntersecting3(this.boundary, p2)) return false;
    if (this.#children.length > 0) {
      for (const d2 of this.#children) d2.add(p2);
      return true;
    }
    this.#items.push(p2);
    if (this.#items.length > this.opts.maxItems && this.level < this.opts.maxLevels) {
      if (this.#children.length === 0) {
        this.#subdivide();
      }
      for (const item of this.#items) {
        for (const d2 of this.#children) d2.add(item);
      }
      this.#items = [];
    }
    return true;
  }
  /**
   * Returns true if point is inside node's boundary
   * @param p
   * @returns
   */
  couldHold(p2) {
    return intersectsPoint(this.boundary, p2);
  }
  #subdivide() {
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;
    const x = this.boundary.x;
    const y = this.boundary.y;
    const coords = fromNumbers2(x + w, y, x, y, x, y + h, x + w, y + h);
    const rects = coords.map((p2) => fromTopLeft(p2, w, h));
    this.#children = rects.map(
      (r) => new _QuadTreeNode(this, r, this.level + 1, this.opts)
    );
  }
};

// ../geometry/src/scaler.ts
var scaler2 = (scaleBy = `both`, defaultRect) => {
  const defaultBounds = defaultRect ?? Placeholder4;
  let sw = 1;
  let sh = 1;
  let s = { x: 1, y: 1 };
  const computeScale = () => {
    switch (scaleBy) {
      case `height`: {
        return { x: sh, y: sh };
      }
      case `width`: {
        return { x: sw, y: sw };
      }
      case `min`: {
        return { x: Math.min(sw, sh), y: Math.min(sw, sh) };
      }
      case `max`: {
        return { x: Math.max(sw, sh), y: Math.max(sw, sh) };
      }
      default: {
        return { x: sw, y: sh };
      }
    }
  };
  const normalise4 = (a2, b2, c4, d2) => {
    let inX = Number.NaN;
    let inY = Number.NaN;
    let outW = defaultBounds.width;
    let outH = defaultBounds.height;
    if (typeof a2 === `number`) {
      inX = a2;
      if (typeof b2 === `number`) {
        inY = b2;
        if (c4 === void 0) return [inX, inY, outW, outH];
        if (isRect(c4)) {
          outW = c4.width;
          outH = c4.height;
        } else if (typeof c4 === `number`) {
          outW = c4;
          if (typeof d2 === `number`) {
            outH = d2;
          } else {
            throw new TypeError(`Missing final height value`);
          }
        } else throw new Error(`Missing valid output range`);
      } else if (isRect(b2)) {
        outW = b2.width;
        outH = b2.height;
      } else {
        throw new Error(
          `Expected input y or output Rect to follow first number parameter`
        );
      }
    } else if (isPoint(a2)) {
      inX = a2.x;
      inY = a2.y;
      if (b2 === void 0) return [inX, inY, outW, outH];
      if (isRect(b2)) {
        outW = b2.width;
        outH = b2.height;
      } else if (typeof b2 === `number`) {
        outW = b2;
        if (typeof c4 === `number`) {
          outH = c4;
        } else {
          throw new TypeError(
            `Expected height as third parameter after Point and output width`
          );
        }
      } else {
        throw new TypeError(
          `Expected Rect or width as second parameter when first parameter is a Point`
        );
      }
    } else {
      throw new Error(`Expected input Point or x value as first parameter`);
    }
    return [inX, inY, outW, outH];
  };
  const scaleAbs = (a2, b2, c4, d2) => {
    const n2 = normalise4(a2, b2, c4, d2);
    return scaleNormalised(true, ...n2);
  };
  const scaleRel = (a2, b2, c4, d2) => {
    const n2 = normalise4(a2, b2, c4, d2);
    return scaleNormalised(false, ...n2);
  };
  const scaleNormalised = (abs4, x, y, w, h) => {
    if (Number.isNaN(w)) throw new Error(`Output width range missing`);
    if (Number.isNaN(h)) throw new Error(`Output height range missing`);
    if (w !== sw || h !== sh) {
      sw = w;
      sh = h;
      s = computeScale();
    }
    return abs4 ? {
      x: x * s.x,
      y: y * s.y
    } : {
      x: x / s.x,
      y: y / s.y
    };
  };
  return {
    computeScale,
    rel: scaleRel,
    abs: scaleAbs,
    width: defaultBounds.width,
    height: defaultBounds.height
  };
};

// ../geometry/src/arc/index.ts
var arc_exports = {};
__export(arc_exports, {
  angularSize: () => angularSize,
  bbox: () => bbox5,
  distanceCenter: () => distanceCenter2,
  fromCircle: () => fromCircle,
  fromCircleAmount: () => fromCircleAmount,
  fromDegrees: () => fromDegrees2,
  getStartEnd: () => getStartEnd,
  guard: () => guard7,
  interpolate: () => interpolate6,
  isArc: () => isArc,
  isEqual: () => isEqual8,
  isPositioned: () => isPositioned3,
  length: () => length4,
  point: () => point,
  toLine: () => toLine,
  toPath: () => toPath4,
  toSvg: () => toSvg2
});
var isArc = (p2) => p2.startRadian !== void 0 && p2.endRadian !== void 0 && p2.clockwise !== void 0;
var isPositioned3 = (p2) => p2.x !== void 0 && p2.y !== void 0;
var piPi7 = Math.PI * 2;
function fromDegrees2(radius, startDegrees, endDegrees, clockwise, origin) {
  const a2 = {
    radius,
    startRadian: degreeToRadian(startDegrees),
    endRadian: degreeToRadian(endDegrees),
    clockwise
  };
  if (isPoint(origin)) {
    guard(origin);
    const ap = {
      ...a2,
      x: origin.x,
      y: origin.y
    };
    return Object.freeze(ap);
  } else {
    return Object.freeze(a2);
  }
}
var toLine = (arc2) => fromPoints(
  point(arc2, arc2.startRadian),
  point(arc2, arc2.endRadian)
);
var getStartEnd = (arc2, origin) => {
  guard7(arc2);
  const start = point(arc2, arc2.startRadian, origin);
  const end = point(arc2, arc2.endRadian, origin);
  return [start, end];
};
var point = (arc2, angleRadian3, origin) => {
  if (origin === void 0) {
    origin = isPositioned3(arc2) ? arc2 : { x: 0, y: 0 };
  }
  return {
    x: Math.cos(angleRadian3) * arc2.radius + origin.x,
    y: Math.sin(angleRadian3) * arc2.radius + origin.y
  };
};
var guard7 = (arc2) => {
  if (arc2 === void 0) throw new TypeError(`Arc is undefined`);
  if (isPositioned3(arc2)) {
    guard(arc2, `arc`);
  }
  if (arc2.radius === void 0) throw new TypeError(`Arc radius is undefined (${JSON.stringify(arc2)})`);
  if (typeof arc2.radius !== `number`) throw new TypeError(`Radius must be a number`);
  if (Number.isNaN(arc2.radius)) throw new TypeError(`Radius is NaN`);
  if (arc2.radius <= 0) throw new TypeError(`Radius must be greater than zero`);
  if (arc2.startRadian === void 0) throw new TypeError(`Arc is missing 'startRadian' field`);
  if (arc2.endRadian === void 0) throw new TypeError(`Arc is missing 'startRadian' field`);
  if (Number.isNaN(arc2.endRadian)) throw new TypeError(`Arc endRadian is NaN`);
  if (Number.isNaN(arc2.startRadian)) throw new TypeError(`Arc endRadian is NaN`);
  if (arc2.clockwise === void 0) throw new TypeError(`Arc is missing 'clockwise field`);
  if (arc2.startRadian >= arc2.endRadian) throw new TypeError(`startRadian is expected to be les than endRadian`);
};
var interpolate6 = (amount, arc2, allowOverflow, origin) => {
  guard7(arc2);
  const overflowOk = allowOverflow ?? false;
  if (!overflowOk) {
    if (amount < 0) throw new Error(`Param 'amount' is under zero, and overflow is not allowed`);
    if (amount > 1) throw new Error(`Param 'amount' is above 1 and overflow is not allowed`);
  }
  const span = angularSize(arc2);
  const rel = span * amount;
  const angle = radiansSum(arc2.startRadian, rel, arc2.clockwise);
  return point(arc2, angle, origin);
};
var angularSize = (arc2) => radianArc(arc2.startRadian, arc2.endRadian, arc2.clockwise);
var toPath4 = (arc2) => {
  guard7(arc2);
  return Object.freeze({
    ...arc2,
    nearest: (point2) => {
      throw new Error(`not implemented`);
    },
    interpolate: (amount) => interpolate6(amount, arc2),
    bbox: () => bbox5(arc2),
    length: () => length4(arc2),
    toSvgString: () => toSvg2(arc2),
    relativePosition: (_point, _intersectionThreshold) => {
      throw new Error(`Not implemented`);
    },
    distanceToPoint: (_point) => {
      throw new Error(`Not implemented`);
    },
    kind: `arc`
  });
};
var fromCircle = (circle3, startRadian, endRadian, clockwise = true) => {
  const a2 = Object.freeze({
    ...circle3,
    endRadian,
    startRadian,
    clockwise
  });
  return a2;
};
var fromCircleAmount = (circle3, startRadian, sizeRadian, clockwise = true) => {
  const endRadian = radiansSum(startRadian, sizeRadian, clockwise);
  return fromCircle(circle3, startRadian, endRadian);
};
var length4 = (arc2) => piPi7 * arc2.radius * ((arc2.startRadian - arc2.endRadian) / piPi7);
var bbox5 = (arc2) => {
  if (isPositioned3(arc2)) {
    const middle = interpolate6(0.5, arc2);
    const asLine = toLine(arc2);
    return bbox(middle, asLine.a, asLine.b);
  } else {
    return {
      width: arc2.radius * 2,
      height: arc2.radius * 2
    };
  }
};
var toSvg2 = (a2, b2, c4, d2, e) => {
  if (isArc(a2)) {
    if (isPositioned3(a2)) {
      if (isPoint(b2)) {
        return toSvgFull2(b2, a2.radius, a2.startRadian, a2.endRadian, c4);
      } else {
        return toSvgFull2(a2, a2.radius, a2.startRadian, a2.endRadian, b2);
      }
    } else {
      return isPoint(b2) ? toSvgFull2(b2, a2.radius, a2.startRadian, a2.endRadian, c4) : toSvgFull2({ x: 0, y: 0 }, a2.radius, a2.startRadian, a2.endRadian);
    }
  } else {
    if (c4 === void 0) throw new Error(`startAngle undefined`);
    if (d2 === void 0) throw new Error(`endAngle undefined`);
    if (isPoint(a2)) {
      if (typeof b2 === `number` && typeof c4 === `number` && typeof d2 === `number`) {
        return toSvgFull2(a2, b2, c4, d2, e);
      } else {
        throw new TypeError(`Expected (point, number, number, number). Missing a number param.`);
      }
    } else {
      throw new Error(`Expected (point, number, number, number). Missing first point.`);
    }
  }
};
var toSvgFull2 = (origin, radius, startRadian, endRadian, opts) => {
  if (opts === void 0 || typeof opts !== `object`) opts = {};
  const isFullCircle = endRadian - startRadian === 360;
  const start = toCartesian(radius, endRadian - 0.01, origin);
  const end = toCartesian(radius, startRadian, origin);
  const { largeArc = false, sweep = false } = opts;
  const d2 = [`
    M ${start.x} ${start.y}
    A ${radius} ${radius} 0 ${largeArc ? `1` : `0`} ${sweep ? `1` : `0`} ${end.x} ${end.y},
  `];
  if (isFullCircle) d2.push(`z`);
  return d2;
};
var distanceCenter2 = (a2, b2) => distance(a2, b2);
var isEqual8 = (a2, b2) => {
  if (a2.radius !== b2.radius) return false;
  if (a2.endRadian !== b2.endRadian) return false;
  if (a2.startRadian !== b2.startRadian) return false;
  if (a2.clockwise !== b2.clockwise) return false;
  if (isPositioned3(a2) && isPositioned3(b2)) {
    if (a2.x !== b2.x) return false;
    if (a2.y !== b2.y) return false;
    if (a2.z !== b2.z) return false;
  } else if (!isPositioned3(a2) && !isPositioned3(b2)) {
  } else return false;
  return true;
};

// ../geometry/src/surface-points.ts
var surface_points_exports = {};
__export(surface_points_exports, {
  circleRings: () => circleRings,
  circleVogelSpiral: () => circleVogelSpiral,
  sphereFibonacci: () => sphereFibonacci
});
var cos3 = Math.cos;
var sin3 = Math.sin;
var asin = Math.asin;
var sqrt3 = Math.sqrt;
var pow2 = Math.pow;
var pi4 = Math.PI;
var piPi8 = Math.PI * 2;
var goldenAngle = pi4 * (3 - sqrt3(5));
var goldenSection = (1 + sqrt3(5)) / 2;
function* circleVogelSpiral(circle3, opts = {}) {
  const maxPoints = opts.maxPoints ?? 5e3;
  const density = opts.density ?? 0.95;
  const rotationOffset = opts.rotation ?? 0;
  const c4 = toPositioned(circle3 ?? { radius: 1, x: 0, y: 0 });
  const max9 = c4.radius;
  let spacing = c4.radius * scale2(density, 0, 1, 0.3, 0.01);
  if (opts.spacing) spacing = opts.spacing;
  let radius = 0;
  let count3 = 0;
  let angle = 0;
  while (count3 < maxPoints && radius < max9) {
    radius = spacing * count3 ** 0.5;
    angle = rotationOffset + count3 * 2 * pi4 / goldenSection;
    yield Object.freeze({
      x: c4.x + radius * cos3(angle),
      y: c4.y + radius * sin3(angle)
    });
    count3++;
  }
}
function* circleRings(circle3, opts = {}) {
  const rings = opts.rings ?? 5;
  const c4 = toPositioned(circle3 ?? { radius: 1, x: 0, y: 0 });
  const ringR = 1 / rings;
  const rotationOffset = opts.rotation ?? 0;
  let ringCount = 1;
  yield Object.freeze({ x: c4.x, y: c4.y });
  for (let r = ringR; r <= 1; r += ringR) {
    const n2 = Math.round(pi4 / asin(1 / (2 * ringCount)));
    for (const theta of linearSpace(0, piPi8, n2 + 1)) {
      yield Object.freeze({
        x: c4.x + r * cos3(theta + rotationOffset) * c4.radius,
        y: c4.y + r * sin3(theta + rotationOffset) * c4.radius
      });
    }
    ringCount++;
  }
}
function* sphereFibonacci(samples = 100, rotationRadians = 0, sphere) {
  const offset2 = 2 / samples;
  const s = sphere ?? { x: 0, y: 0, z: 0, radius: 1 };
  for (let index = 0; index < samples; index++) {
    const y = index * offset2 - 1 + offset2 / 2;
    const r = sqrt3(1 - pow2(y, 2));
    const a2 = (index + 1) % samples * goldenAngle + rotationRadians;
    const x = cos3(a2) * r;
    const z = sin3(a2) * r;
    yield Object.freeze({
      x: s.x + x * s.radius,
      y: s.y + y * s.radius,
      z: s.z + z * s.radius
    });
  }
}

// ../geometry/src/triangle/index.ts
var triangle_exports = {};
__export(triangle_exports, {
  Empty: () => Empty3,
  Equilateral: () => equilateral_exports,
  Isosceles: () => isosceles_exports,
  Placeholder: () => Placeholder3,
  Right: () => right_exports,
  angles: () => angles,
  anglesDegrees: () => anglesDegrees,
  area: () => area3,
  barycentricCoord: () => barycentricCoord,
  barycentricToCartestian: () => barycentricToCartestian,
  bbox: () => bbox6,
  centroid: () => centroid2,
  corners: () => corners2,
  edges: () => edges3,
  equilateralFromVertex: () => equilateralFromVertex,
  fromFlatArray: () => fromFlatArray2,
  fromPoints: () => fromPoints3,
  fromRadius: () => fromRadius,
  guard: () => guard6,
  innerCircle: () => innerCircle,
  isAcute: () => isAcute,
  isEmpty: () => isEmpty4,
  isEqual: () => isEqual5,
  isEquilateral: () => isEquilateral,
  isIsosceles: () => isIsosceles,
  isOblique: () => isOblique,
  isObtuse: () => isObtuse,
  isPlaceholder: () => isPlaceholder4,
  isRightAngle: () => isRightAngle,
  isTriangle: () => isTriangle,
  outerCircle: () => outerCircle,
  perimeter: () => perimeter2,
  rotate: () => rotate4,
  rotateByVertex: () => rotateByVertex
});

// ../geometry/src/triangle/angles.ts
var angles = (t2) => {
  guard6(t2);
  return [
    angleRadian(t2.a, t2.b),
    angleRadian(t2.b, t2.c),
    angleRadian(t2.c, t2.a)
  ];
};
var anglesDegrees = (t2) => {
  guard6(t2);
  return radianToDegree(angles(t2));
};

// ../geometry/src/triangle/edges.ts
var edges3 = (t2) => {
  guard6(t2);
  return joinPointsToLines(t2.a, t2.b, t2.c, t2.a);
};

// ../geometry/src/triangle/area.ts
var area3 = (t2) => {
  guard6(t2, `t`);
  const lengths3 = edges3(t2).map((l) => length(l));
  const p2 = (lengths3[0] + lengths3[1] + lengths3[2]) / 2;
  return Math.sqrt(p2 * (p2 - lengths3[0]) * (p2 - lengths3[1]) * (p2 - lengths3[2]));
};

// ../geometry/src/triangle/barycentric.ts
var barycentricCoord = (t2, a2, b2) => {
  const pt = getPointParameter2(a2, b2);
  const ab = (x, y, pa, pb) => (pa.y - pb.y) * x + (pb.x - pa.x) * y + pa.x * pb.y - pb.x * pa.y;
  const alpha = ab(pt.x, pt.y, t2.b, t2.c) / ab(t2.a.x, t2.a.y, t2.b, t2.c);
  const theta = ab(pt.x, pt.y, t2.c, t2.a) / ab(t2.b.x, t2.b.y, t2.c, t2.a);
  const gamma = ab(pt.x, pt.y, t2.a, t2.b) / ab(t2.c.x, t2.c.y, t2.a, t2.b);
  return {
    a: alpha,
    b: theta,
    c: gamma
  };
};
var barycentricToCartestian = (t2, bc) => {
  guard6(t2);
  const { a: a2, b: b2, c: c4 } = t2;
  const x = a2.x * bc.a + b2.x * bc.b + c4.x * bc.c;
  const y = a2.y * bc.a + b2.y * bc.b + c4.y * bc.c;
  if (a2.z && b2.z && c4.z) {
    const z = a2.z * bc.a + b2.z * bc.b + c4.z * bc.c;
    return Object.freeze({ x, y, z });
  } else {
    return Object.freeze({ x, y });
  }
};

// ../geometry/src/triangle/bbox.ts
var bbox6 = (t2, inflation = 0) => {
  const { a: a2, b: b2, c: c4 } = t2;
  const xMin = Math.min(a2.x, b2.x, c4.x) - inflation;
  const xMax = Math.max(a2.x, b2.x, c4.x) + inflation;
  const yMin = Math.min(a2.y, b2.y, c4.y) - inflation;
  const yMax = Math.max(a2.y, b2.y, c4.y) + inflation;
  const r = {
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin
  };
  return r;
};

// ../geometry/src/triangle/corners.ts
var corners2 = (t2) => {
  guard6(t2);
  return [t2.a, t2.b, t2.c];
};

// ../geometry/src/triangle/from.ts
var fromRadius = (origin, radius, opts = {}) => {
  throwNumberTest(radius, `positive`, `radius`);
  guard(origin, `origin`);
  const initialAngleRadian = opts.initialAngleRadian ?? 0;
  const angles2 = [
    initialAngleRadian,
    initialAngleRadian + piPi2 * 1 / 3,
    initialAngleRadian + piPi2 * 2 / 3
  ];
  const points = angles2.map((a2) => toCartesian(radius, a2, origin));
  return fromPoints3(points);
};
var fromFlatArray2 = (coords) => {
  if (!Array.isArray(coords)) throw new Error(`coords expected as array`);
  if (coords.length !== 6) {
    throw new Error(
      `coords array expected with 6 elements. Got ${coords.length}`
    );
  }
  return fromPoints3(fromNumbers2(...coords));
};
var fromPoints3 = (points) => {
  if (!Array.isArray(points)) throw new Error(`points expected as array`);
  if (points.length !== 3) {
    throw new Error(
      `points array expected with 3 elements. Got ${points.length}`
    );
  }
  const t2 = {
    a: points[0],
    b: points[1],
    c: points[2]
  };
  return t2;
};

// ../geometry/src/triangle/lengths.ts
var lengths2 = (t2) => {
  guard6(t2);
  return [
    distance(t2.a, t2.b),
    distance(t2.b, t2.c),
    distance(t2.c, t2.a)
  ];
};

// ../geometry/src/triangle/kinds.ts
var isEquilateral = (t2) => {
  guard6(t2);
  const [a2, b2, c4] = lengths2(t2);
  return a2 === b2 && b2 === c4;
};
var isIsosceles = (t2) => {
  const [a2, b2, c4] = lengths2(t2);
  if (a2 === b2) return true;
  if (b2 === c4) return true;
  if (c4 === a2) return true;
  return false;
};
var isRightAngle = (t2) => angles(t2).includes(Math.PI / 2);
var isOblique = (t2) => !isRightAngle(t2);
var isAcute = (t2) => !angles(t2).some((v) => v >= Math.PI / 2);
var isObtuse = (t2) => angles(t2).some((v) => v > Math.PI / 2);

// ../geometry/src/triangle/perimeter.ts
var perimeter2 = (t2) => {
  guard6(t2);
  return edges3(t2).reduce((accumulator, v) => accumulator + length(v), 0);
};

// ../geometry/src/triangle/inner-circle.ts
var innerCircle = (t2) => {
  const c4 = centroid2(t2);
  const p2 = perimeter2(t2) / 2;
  const a2 = area3(t2);
  const radius = a2 / p2;
  return { radius, ...c4 };
};

// ../geometry/src/triangle/outer-circle.ts
var outerCircle = (t2) => {
  const [a2, b2, c4] = edges3(t2).map((l) => length(l));
  const cent = centroid2(t2);
  const radius = a2 * b2 * c4 / Math.sqrt((a2 + b2 + c4) * (-a2 + b2 + c4) * (a2 - b2 + c4) * (a2 + b2 - c4));
  return {
    radius,
    ...cent
  };
};

// ../geometry/src/triangle/rotate.ts
var rotate4 = (triangle2, amountRadian, origin) => {
  if (amountRadian === void 0 || amountRadian === 0) return triangle2;
  if (origin === void 0) origin = centroid2(triangle2);
  return Object.freeze({
    ...triangle2,
    a: rotate2(triangle2.a, amountRadian, origin),
    b: rotate2(triangle2.b, amountRadian, origin),
    c: rotate2(triangle2.c, amountRadian, origin)
  });
};
var rotateByVertex = (triangle2, amountRadian, vertex = `b`) => {
  const origin = vertex === `a` ? triangle2.a : vertex === `b` ? triangle2.b : triangle2.c;
  return Object.freeze({
    a: rotate2(triangle2.a, amountRadian, origin),
    b: rotate2(triangle2.b, amountRadian, origin),
    c: rotate2(triangle2.c, amountRadian, origin)
  });
};

// ../geometry/src/triangle/equilateral.ts
var equilateral_exports = {};
__export(equilateral_exports, {
  area: () => area4,
  centerFromA: () => centerFromA,
  centerFromB: () => centerFromB,
  centerFromC: () => centerFromC,
  circumcircle: () => circumcircle,
  fromCenter: () => fromCenter2,
  height: () => height,
  incircle: () => incircle,
  perimeter: () => perimeter3
});
var pi4over3 = Math.PI * 4 / 3;
var pi2over3 = Math.PI * 2 / 3;
var resolveLength = (t2) => {
  if (typeof t2 === `number`) return t2;
  return t2.length;
};
var fromCenter2 = (t2, origin, rotationRad) => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 });
  const r = resolveLength(t2) / Math.sqrt(3);
  const rot = rotationRad ?? Math.PI * 1.5;
  const b2 = {
    x: r * Math.cos(rot) + origin.x,
    y: r * Math.sin(rot) + origin.y
  };
  const a2 = {
    x: r * Math.cos(rot + pi4over3) + origin.x,
    y: r * Math.sin(rot + pi4over3) + origin.y
  };
  const c4 = {
    x: r * Math.cos(rot + pi2over3) + origin.x,
    y: r * Math.sin(rot + pi2over3) + origin.y
  };
  return Object.freeze({ a: a2, b: b2, c: c4 });
};
var centerFromA = (t2, ptA) => {
  if (!ptA) ptA = Object.freeze({ x: 0, y: 0 });
  const r = resolveLength(t2);
  const { radius } = incircle(t2);
  return {
    x: ptA.x + r / 2,
    y: ptA.y - radius
  };
};
var centerFromB = (t2, ptB) => {
  if (!ptB) ptB = Object.freeze({ x: 0, y: 0 });
  const { radius } = incircle(t2);
  return {
    x: ptB.x,
    y: ptB.y + radius * 2
  };
};
var centerFromC = (t2, ptC) => {
  if (!ptC) ptC = Object.freeze({ x: 0, y: 0 });
  const r = resolveLength(t2);
  const { radius } = incircle(t2);
  return {
    x: ptC.x - r / 2,
    y: ptC.y - radius
  };
};
var height = (t2) => Math.sqrt(3) / 2 * resolveLength(t2);
var perimeter3 = (t2) => resolveLength(t2) * 3;
var area4 = (t2) => Math.pow(resolveLength(t2), 2) * Math.sqrt(3) / 4;
var circumcircle = (t2) => ({
  radius: Math.sqrt(3) / 3 * resolveLength(t2)
});
var incircle = (t2) => ({
  radius: Math.sqrt(3) / 6 * resolveLength(t2)
});

// ../geometry/src/triangle/right.ts
var right_exports = {};
__export(right_exports, {
  adjacentFromHypotenuse: () => adjacentFromHypotenuse,
  adjacentFromOpposite: () => adjacentFromOpposite,
  angleAtPointA: () => angleAtPointA,
  angleAtPointB: () => angleAtPointB,
  area: () => area5,
  circumcircle: () => circumcircle2,
  fromA: () => fromA,
  fromB: () => fromB,
  fromC: () => fromC,
  height: () => height2,
  hypotenuseFromAdjacent: () => hypotenuseFromAdjacent,
  hypotenuseFromOpposite: () => hypotenuseFromOpposite,
  hypotenuseSegments: () => hypotenuseSegments,
  incircle: () => incircle2,
  medians: () => medians,
  oppositeFromAdjacent: () => oppositeFromAdjacent,
  oppositeFromHypotenuse: () => oppositeFromHypotenuse,
  perimeter: () => perimeter4,
  resolveLengths: () => resolveLengths
});
var fromA = (t2, origin) => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 });
  const tt = resolveLengths(t2);
  const seg = hypotenuseSegments(t2);
  const h = height2(t2);
  const a2 = { x: origin.x, y: origin.y };
  const b2 = { x: origin.x + tt.hypotenuse, y: origin.y };
  const c4 = { x: origin.x + seg[1], y: origin.y - h };
  return { a: a2, b: b2, c: c4 };
};
var fromB = (t2, origin) => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 });
  const tt = resolveLengths(t2);
  const seg = hypotenuseSegments(t2);
  const h = height2(t2);
  const b2 = { x: origin.x, y: origin.y };
  const a2 = { x: origin.x - tt.hypotenuse, y: origin.y };
  const c4 = { x: origin.x - seg[0], y: origin.y - h };
  return { a: a2, b: b2, c: c4 };
};
var fromC = (t2, origin) => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 });
  const seg = hypotenuseSegments(t2);
  const h = height2(t2);
  const c4 = { x: origin.x, y: origin.y };
  const a2 = { x: origin.x - seg[1], y: origin.y + h };
  const b2 = { x: origin.x + seg[0], y: origin.y + h };
  return { a: a2, b: b2, c: c4 };
};
var resolveLengths = (t2) => {
  const a2 = t2.adjacent;
  const o = t2.opposite;
  const h = t2.hypotenuse;
  if (a2 !== void 0 && o !== void 0) {
    return {
      ...t2,
      adjacent: a2,
      opposite: o,
      hypotenuse: Math.hypot(a2, o)
    };
  } else if (a2 && h) {
    return {
      ...t2,
      adjacent: a2,
      hypotenuse: h,
      opposite: h * h - a2 * a2
    };
  } else if (o && h) {
    return {
      ...t2,
      hypotenuse: h,
      opposite: o,
      adjacent: h * h - o * o
    };
  } else if (t2.opposite && t2.hypotenuse && t2.adjacent) {
    return t2;
  }
  throw new Error(`Missing at least two edges`);
};
var height2 = (t2) => {
  const tt = resolveLengths(t2);
  const p2 = tt.opposite * tt.opposite / tt.hypotenuse;
  const q = tt.adjacent * tt.adjacent / tt.hypotenuse;
  return Math.sqrt(p2 * q);
};
var hypotenuseSegments = (t2) => {
  const tt = resolveLengths(t2);
  const p2 = tt.opposite * tt.opposite / tt.hypotenuse;
  const q = tt.adjacent * tt.adjacent / tt.hypotenuse;
  return [p2, q];
};
var perimeter4 = (t2) => {
  const tt = resolveLengths(t2);
  return tt.adjacent + tt.hypotenuse + tt.opposite;
};
var area5 = (t2) => {
  const tt = resolveLengths(t2);
  return tt.opposite * tt.adjacent / 2;
};
var angleAtPointA = (t2) => {
  const tt = resolveLengths(t2);
  return Math.acos(
    (tt.adjacent * tt.adjacent + tt.hypotenuse * tt.hypotenuse - tt.opposite * tt.opposite) / (2 * tt.adjacent * tt.hypotenuse)
  );
};
var angleAtPointB = (t2) => {
  const tt = resolveLengths(t2);
  return Math.acos(
    (tt.opposite * tt.opposite + tt.hypotenuse * tt.hypotenuse - tt.adjacent * tt.adjacent) / (2 * tt.opposite * tt.hypotenuse)
  );
};
var medians = (t2) => {
  const tt = resolveLengths(t2);
  const b2 = tt.adjacent * tt.adjacent;
  const c4 = tt.hypotenuse * tt.hypotenuse;
  const a2 = tt.opposite * tt.opposite;
  return [
    Math.sqrt(2 * (b2 + c4) - a2) / 2,
    Math.sqrt(2 * (c4 + a2) - b2) / 2,
    Math.sqrt(2 * (a2 + b2) - c4) / 2
  ];
};
var circumcircle2 = (t2) => {
  const tt = resolveLengths(t2);
  return { radius: tt.hypotenuse / 2 };
};
var incircle2 = (t2) => {
  const tt = resolveLengths(t2);
  return {
    radius: (tt.adjacent + tt.opposite - tt.hypotenuse) / 2
  };
};
var oppositeFromAdjacent = (angleRad, adjacent) => Math.tan(angleRad) * adjacent;
var oppositeFromHypotenuse = (angleRad, hypotenuse) => Math.sin(angleRad) * hypotenuse;
var adjacentFromHypotenuse = (angleRadian3, hypotenuse) => Math.cos(angleRadian3) * hypotenuse;
var adjacentFromOpposite = (angleRadian3, opposite) => opposite / Math.tan(angleRadian3);
var hypotenuseFromOpposite = (angleRadian3, opposite) => opposite / Math.sin(angleRadian3);
var hypotenuseFromAdjacent = (angleRadian3, adjacent) => adjacent / Math.cos(angleRadian3);

// ../geometry/src/triangle/isosceles.ts
var isosceles_exports = {};
__export(isosceles_exports, {
  apexAngle: () => apexAngle,
  area: () => area6,
  baseAngle: () => baseAngle,
  circumcircle: () => circumcircle3,
  fromA: () => fromA2,
  fromB: () => fromB2,
  fromC: () => fromC2,
  fromCenter: () => fromCenter3,
  height: () => height3,
  incircle: () => incircle3,
  legHeights: () => legHeights,
  medians: () => medians2,
  perimeter: () => perimeter5
});
var baseAngle = (t2) => Math.acos(t2.base / (2 * t2.legs));
var apexAngle = (t2) => {
  const aa = t2.legs * t2.legs;
  const cc = t2.base * t2.base;
  return Math.acos((2 * aa - cc) / (2 * aa));
};
var height3 = (t2) => {
  const aa = t2.legs * t2.legs;
  const cc = t2.base * t2.base;
  return Math.sqrt((4 * aa - cc) / 4);
};
var legHeights = (t2) => {
  const b2 = baseAngle(t2);
  return t2.base * Math.sin(b2);
};
var perimeter5 = (t2) => 2 * t2.legs + t2.base;
var area6 = (t2) => {
  const h = height3(t2);
  return h * t2.base / 2;
};
var circumcircle3 = (t2) => {
  const h = height3(t2);
  const hh = h * h;
  const cc = t2.base * t2.base;
  return { radius: (4 * hh + cc) / (8 * h) };
};
var incircle3 = (t2) => {
  const h = height3(t2);
  return { radius: t2.base * h / (2 * t2.legs + t2.base) };
};
var medians2 = (t2) => {
  const aa = t2.legs * t2.legs;
  const cc = t2.base * t2.base;
  const medianAB = Math.sqrt(aa + 2 * cc) / 2;
  const medianC = Math.sqrt(4 * aa - cc) / 2;
  return [medianAB, medianAB, medianC];
};
var fromCenter3 = (t2, origin) => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 });
  const h = height3(t2);
  const incircleR = incircle3(t2).radius;
  const verticalToApex = h - incircleR;
  const a2 = { x: origin.x - t2.base / 2, y: origin.y + incircleR };
  const b2 = { x: origin.x + t2.base / 2, y: origin.y + incircleR };
  const c4 = { x: origin.x, y: origin.y - verticalToApex };
  return { a: a2, b: b2, c: c4 };
};
var fromA2 = (t2, origin) => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 });
  const h = height3(t2);
  const a2 = { x: origin.x, y: origin.y };
  const b2 = { x: origin.x + t2.base, y: origin.y };
  const c4 = { x: origin.x + t2.base / 2, y: origin.y - h };
  return { a: a2, b: b2, c: c4 };
};
var fromB2 = (t2, origin) => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 });
  const h = height3(t2);
  const b2 = { x: origin.x, y: origin.y };
  const a2 = { x: origin.x - t2.base, y: origin.y };
  const c4 = { x: origin.x - t2.base / 2, y: origin.y - h };
  return { a: a2, b: b2, c: c4 };
};
var fromC2 = (t2, origin) => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 });
  const h = height3(t2);
  const c4 = { x: origin.x, y: origin.y };
  const a2 = { x: origin.x - t2.base / 2, y: origin.y + h };
  const b2 = { x: origin.x + t2.base / 2, y: origin.y + h };
  return { a: a2, b: b2, c: c4 };
};

// ../dom/src/element-sizing.ts
var ElementSizer = class _ElementSizer {
  #stretch;
  #size;
  #naturalSize;
  #naturalRatio;
  #viewport;
  #onSetSize;
  #el;
  #containerEl;
  #disposed = false;
  #resizeObservable;
  constructor(elOrQuery, options) {
    this.#el = resolveEl(elOrQuery);
    this.#containerEl = options.containerEl ? resolveEl(options.containerEl) : this.#el.parentElement;
    this.#stretch = options.stretch ?? `none`;
    this.#onSetSize = options.onSetSize;
    this.#size = rect_exports.Empty;
    let naturalSize = options.naturalSize;
    if (naturalSize === void 0) {
      naturalSize = this.#el.getBoundingClientRect();
    }
    this.#naturalRatio = 1;
    this.#naturalSize = naturalSize;
    this.setNaturalSize(naturalSize);
    this.#viewport = rect_exports.EmptyPositioned;
    if (this.#containerEl === document.body) {
      this.#byViewport();
    } else {
      this.#byContainer();
    }
  }
  dispose(reason) {
    if (this.#disposed) return;
    this.#disposed = true;
    if (this.#resizeObservable) {
      this.#resizeObservable.disconnect();
      this.#resizeObservable = void 0;
    }
  }
  static canvasParent(canvasElementOrQuery, options) {
    const el = resolveEl(canvasElementOrQuery);
    const er = new _ElementSizer(el, {
      ...options,
      onSetSize(size, el2) {
        el2.width = size.width;
        el2.height = size.height;
        if (options.onSetSize) options.onSetSize(size, el2);
      }
    });
    return er;
  }
  static canvasViewport(canvasElementOrQuery, options) {
    const el = resolveEl(canvasElementOrQuery);
    el.style.position = `absolute`;
    el.style.zIndex = (options.zIndex ?? 0).toString();
    el.style.left = `0px`;
    el.style.top = `0px`;
    const opts = { ...options, containerEl: document.body };
    return this.canvasParent(canvasElementOrQuery, opts);
  }
  /**
   * Size an SVG element to match viewport
   * @param svg 
   * @returns 
   */
  static svgViewport(svg, onSizeSet) {
    const er = new _ElementSizer(svg, {
      containerEl: document.body,
      stretch: `both`,
      onSetSize(size) {
        svg.setAttribute(`width`, size.width.toString());
        svg.setAttribute(`height`, size.height.toString());
        if (onSizeSet) onSizeSet(size);
      }
    });
    return er;
  }
  #byContainer() {
    const c4 = this.#containerEl;
    if (!c4) throw new Error(`No container element`);
    const r = new ResizeObserver((entries) => {
      this.#onParentResize(entries);
    });
    r.observe(c4);
    const current = this.#computeSizeBasedOnParent(c4.getBoundingClientRect());
    this.size = current;
    this.#resizeObservable = r;
  }
  #byViewport() {
    const r = new ResizeObserver((entries) => {
      this.#onViewportResize();
    });
    r.observe(document.documentElement);
    this.#resizeObservable = r;
    this.#onViewportResize();
  }
  #onViewportResize() {
    this.size = { width: window.innerWidth, height: window.innerHeight };
    this.#viewport = {
      x: 0,
      y: 0,
      ...this.size
    };
  }
  /**
   * Sets the 'natural' size of an element.
   * This can also be specified when creating ElementSizer.
   * @param size 
   */
  setNaturalSize(size) {
    this.#naturalSize = size;
    this.#naturalRatio = size.width / size.height;
  }
  get naturalSize() {
    return this.#naturalSize;
  }
  get viewport() {
    return this.#viewport;
  }
  #computeSizeBasedOnParent(parentSize) {
    let { width, height: height4 } = parentSize;
    let stretch = this.#stretch;
    if (stretch === `min`) {
      stretch = width < height4 ? `width` : `height`;
    } else if (stretch === `max`) {
      stretch = width > height4 ? `width` : `height`;
    }
    if (stretch === `width`) {
      height4 = width / this.#naturalRatio;
    } else if (stretch === `height`) {
      width = height4 * this.#naturalRatio;
    }
    if (this.#el instanceof HTMLElement) {
      const b2 = getComputedPixels(this.#el, `borderTopWidth`, `borderLeftWidth`, `borderRightWidth`, `borderBottomWidth`);
      width -= b2.borderLeftWidth + b2.borderRightWidth;
      height4 -= b2.borderTopWidth + b2.borderBottomWidth;
    }
    return { width, height: height4 };
  }
  #onParentResize(args) {
    const box = args[0].contentBoxSize[0];
    const parentSize = { width: box.inlineSize, height: box.blockSize };
    this.size = this.#computeSizeBasedOnParent(parentSize);
    this.#viewport = {
      x: 0,
      y: 0,
      width: parentSize.width,
      height: parentSize.height
    };
  }
  set size(size) {
    rect_exports.guard(size, `size`);
    this.#size = size;
    this.#onSetSize(size, this.#el);
  }
  get size() {
    return this.#size;
  }
};

// ../dom/src/set-property.ts
function setText(selectors, value) {
  return setProperty(`textContent`, selectors, value);
}
function setHtml(selectors, value) {
  return setProperty(`innerHTML`, selectors, value);
}
function setProperty(property, selectors, value) {
  let elements = [];
  const set5 = (v) => {
    const typ = typeof v;
    const vv = typ === `string` || typ === `number` || typ === `boolean` ? v : JSON.stringify(v);
    if (elements.length === 0) {
      elements = resolveEls(selectors);
    }
    for (const element of elements) {
      element[property] = vv;
    }
    return vv;
  };
  return value === void 0 ? set5 : set5(value);
}

// numbers.ts
var numbers_exports = {};
__export(numbers_exports, {
  Bipolar: () => bipolar_exports,
  HelloTest: () => HelloTest,
  applyToValues: () => applyToValues,
  array: () => array,
  average: () => average,
  averageWeighted: () => averageWeighted,
  clamp: () => clamp,
  clampIndex: () => clampIndex,
  clamper: () => clamper,
  differenceFromFixed: () => differenceFromFixed,
  differenceFromLast: () => differenceFromLast,
  dotProduct: () => dotProduct,
  filterIterable: () => filterIterable,
  flip: () => flip,
  interpolate: () => interpolate2,
  interpolateAngle: () => interpolateAngle,
  interpolatorStepped: () => interpolatorStepped,
  isApprox: () => isApprox,
  isCloseTo: () => isCloseTo,
  isValid: () => isValid,
  linearSpace: () => linearSpace,
  max: () => max,
  maxFast: () => maxFast,
  maxIndex: () => maxIndex,
  min: () => min,
  minFast: () => minFast,
  minIndex: () => minIndex,
  movingAverage: () => movingAverage,
  movingAverageLight: () => movingAverageLight,
  noiseFilter: () => noiseFilter,
  numberArrayCompute: () => numberArrayCompute,
  proportion: () => proportion,
  quantiseEvery: () => quantiseEvery,
  rangeInclusive: () => rangeInclusive,
  round: () => round2,
  scale: () => scale2,
  scaleClamped: () => scaleClamped,
  scalePercent: () => scalePercent,
  scalePercentages: () => scalePercentages,
  scaler: () => scaler,
  scalerNull: () => scalerNull,
  scalerPercent: () => scalerPercent,
  scalerTwoWay: () => scalerTwoWay,
  softmax: () => softmax,
  stream: () => stream,
  thresholdAtLeast: () => thresholdAtLeast,
  total: () => total,
  totalFast: () => totalFast,
  validNumbers: () => validNumbers,
  weight: () => weight,
  wrap: () => wrap,
  wrapInteger: () => wrapInteger,
  wrapRange: () => wrapRange
});
var HelloTest = () => {
  console.log(`hello test`);
};

// visual.ts
var visual_exports = {};
__export(visual_exports, {
  CanvasHelper: () => CanvasHelper,
  Colour: () => colour_exports,
  ImageDataGrid: () => image_data_grid_exports,
  Video: () => video_exports,
  pointerVisualise: () => pointerVisualise
});

// ../visual/src/drawing.ts
var PIPI = Math.PI * 2;
var getContext = (canvasElementContextOrQuery) => {
  if (canvasElementContextOrQuery === null) {
    throw new Error(
      `canvasElCtxOrQuery null. Must be a 2d drawing context or Canvas element`
    );
  }
  if (canvasElementContextOrQuery === void 0) {
    throw new Error(
      `canvasElCtxOrQuery undefined. Must be a 2d drawing context or Canvas element`
    );
  }
  const ctx = canvasElementContextOrQuery instanceof CanvasRenderingContext2D ? canvasElementContextOrQuery : canvasElementContextOrQuery instanceof HTMLCanvasElement ? canvasElementContextOrQuery.getContext(`2d`) : typeof canvasElementContextOrQuery === `string` ? resolveEl(canvasElementContextOrQuery).getContext(`2d`) : canvasElementContextOrQuery;
  if (ctx === null) throw new Error(`Could not create 2d context for canvas`);
  return ctx;
};
var makeHelper = (ctxOrCanvasEl, canvasBounds) => {
  const ctx = getContext(ctxOrCanvasEl);
  return {
    ctx,
    paths(pathsToDraw, opts) {
      paths(ctx, pathsToDraw, opts);
    },
    line(lineToDraw, opts) {
      line(ctx, lineToDraw, opts);
    },
    rect(rectsToDraw, opts) {
      rect(ctx, rectsToDraw, opts);
    },
    bezier(bezierToDraw, opts) {
      bezier(ctx, bezierToDraw, opts);
    },
    connectedPoints(pointsToDraw, opts) {
      connectedPoints(ctx, pointsToDraw, opts);
    },
    pointLabels(pointsToDraw, opts) {
      pointLabels(ctx, pointsToDraw, opts);
    },
    dot(dotPosition, opts) {
      dot(ctx, dotPosition, opts);
    },
    circle(circlesToDraw, opts) {
      circle(ctx, circlesToDraw, opts);
    },
    arc(arcsToDraw, opts) {
      arc(ctx, arcsToDraw, opts);
    },
    textBlock(lines, opts) {
      if (opts.bounds === void 0 && canvasBounds !== void 0) {
        opts = { ...opts, bounds: { ...canvasBounds, x: 0, y: 0 } };
      }
      textBlock(ctx, lines, opts);
    }
  };
};
var optsOp = (opts) => coloringOp(opts.strokeStyle, opts.fillStyle);
var applyOpts = (ctx, opts = {}, ...additionalOps) => {
  if (ctx === void 0) throw new Error(`ctx undefined`);
  const stack = drawingStack(ctx).push(optsOp(opts), ...additionalOps);
  stack.apply();
  return stack;
};
var arc = (ctx, arcs, opts = {}) => {
  applyOpts(ctx, opts);
  const draw = (arc2) => {
    ctx.beginPath();
    ctx.arc(arc2.x, arc2.y, arc2.radius, arc2.startRadian, arc2.endRadian);
    ctx.stroke();
  };
  const arcsArray = Array.isArray(arcs) ? arcs : [arcs];
  for (const arc2 of arcsArray) {
    draw(arc2);
  }
};
var coloringOp = (strokeStyle, fillStyle) => {
  const apply4 = (ctx) => {
    if (fillStyle) ctx.fillStyle = fillStyle;
    if (strokeStyle) ctx.strokeStyle = strokeStyle;
  };
  return apply4;
};
var lineOp = (lineWidth, lineJoin, lineCap) => {
  const apply4 = (ctx) => {
    if (lineWidth) ctx.lineWidth = lineWidth;
    if (lineJoin) ctx.lineJoin = lineJoin;
    if (lineCap) ctx.lineCap = lineCap;
  };
  return apply4;
};
var drawingStack = (ctx, stk) => {
  if (stk === void 0) stk = new StackImmutable();
  const push2 = (...ops) => {
    if (stk === void 0) stk = new StackImmutable();
    const s = stk.push(...ops);
    for (const o of ops) o(ctx);
    return drawingStack(ctx, s);
  };
  const pop2 = () => {
    const s = stk?.pop();
    return drawingStack(ctx, s);
  };
  const apply4 = () => {
    if (stk === void 0) return drawingStack(ctx);
    for (const op of stk.data) op(ctx);
    return drawingStack(ctx, stk);
  };
  return { push: push2, pop: pop2, apply: apply4 };
};
var circle = (ctx, circlesToDraw, opts = {}) => {
  applyOpts(ctx, opts);
  const draw = (c4) => {
    ctx.beginPath();
    ctx.arc(c4.x, c4.y, c4.radius, 0, PIPI);
    if (opts.strokeStyle) ctx.stroke();
    if (opts.fillStyle) ctx.fill();
  };
  if (Array.isArray(circlesToDraw)) {
    for (const c4 of circlesToDraw) draw(c4);
  } else {
    draw(circlesToDraw);
  }
};
var paths = (ctx, pathsToDraw, opts = {}) => {
  applyOpts(ctx, opts);
  const draw = (path2) => {
    if (bezier_exports.isQuadraticBezier(path2)) quadraticBezier(ctx, path2, opts);
    else if (line_exports.isLine(path2)) line(ctx, path2, opts);
    else throw new Error(`Unknown path type ${JSON.stringify(path2)}`);
  };
  if (Array.isArray(pathsToDraw)) {
    for (const p2 of pathsToDraw) draw(p2);
  } else {
    draw(pathsToDraw);
  }
};
var connectedPoints = (ctx, pts, opts = {}) => {
  const shouldLoop = opts.loop ?? false;
  throwArrayTest(pts);
  if (pts.length === 0) return;
  for (const [index, pt] of pts.entries()) point_exports.guard(pt, `Index ${index}`);
  applyOpts(ctx, opts);
  if (opts.lineWidth) ctx.lineWidth = opts.lineWidth;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (const pt of pts) ctx.lineTo(pt.x, pt.y);
  if (shouldLoop) ctx.lineTo(pts[0].x, pts[0].y);
  if (opts.strokeStyle || opts.strokeStyle === void 0 && opts.fillStyle === void 0) {
    ctx.stroke();
  }
  if (opts.fillStyle) {
    ctx.fill();
  }
};
var pointLabels = (ctx, pts, opts = {}, labels) => {
  if (pts.length === 0) return;
  for (const [index, pt] of pts.entries()) point_exports.guard(pt, `Index ${index}`);
  applyOpts(ctx, opts);
  for (const [index, pt] of pts.entries()) {
    const label = labels !== void 0 && index < labels.length ? labels[index] : index.toString();
    ctx.fillText(label.toString(), pt.x, pt.y);
  }
};
var dot = (ctx, pos, opts) => {
  if (opts === void 0) opts = {};
  const radius = opts.radius ?? 10;
  const positions = Array.isArray(pos) ? pos : [pos];
  const stroke = opts.stroke ? opts.stroke : opts.strokeStyle !== void 0;
  let filled = opts.filled ? opts.filled : opts.fillStyle !== void 0;
  if (!stroke && !filled) filled = true;
  applyOpts(ctx, opts);
  for (const pos2 of positions) {
    ctx.beginPath();
    if (`radius` in pos2) {
      ctx.arc(pos2.x, pos2.y, pos2.radius, 0, 2 * Math.PI);
    } else {
      ctx.arc(pos2.x, pos2.y, radius, 0, 2 * Math.PI);
    }
    if (filled) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  }
};
var bezier = (ctx, bezierToDraw, opts) => {
  if (bezier_exports.isQuadraticBezier(bezierToDraw)) {
    quadraticBezier(ctx, bezierToDraw, opts);
  } else if (bezier_exports.isCubicBezier(bezierToDraw)) {
    cubicBezier(ctx, bezierToDraw, opts);
  }
};
var cubicBezier = (ctx, bezierToDraw, opts = {}) => {
  let stack = applyOpts(ctx, opts);
  const { a: a2, b: b2, cubic1, cubic2 } = bezierToDraw;
  const isDebug = opts.debug ?? false;
  if (isDebug) {
  }
  ctx.beginPath();
  ctx.moveTo(a2.x, a2.y);
  ctx.bezierCurveTo(cubic1.x, cubic1.y, cubic2.x, cubic2.y, b2.x, b2.y);
  ctx.stroke();
  if (isDebug) {
    stack = stack.push(
      optsOp({
        ...opts,
        strokeStyle: colour_exports.multiplyOpacity(opts.strokeStyle ?? `silver`, 0.6),
        fillStyle: colour_exports.multiplyOpacity(opts.fillStyle ?? `yellow`, 0.4)
      })
    );
    stack.apply();
    ctx.moveTo(a2.x, a2.y);
    ctx.lineTo(cubic1.x, cubic1.y);
    ctx.stroke();
    ctx.moveTo(b2.x, b2.y);
    ctx.lineTo(cubic2.x, cubic2.y);
    ctx.stroke();
    ctx.fillText(`a`, a2.x + 5, a2.y);
    ctx.fillText(`b`, b2.x + 5, b2.y);
    ctx.fillText(`c1`, cubic1.x + 5, cubic1.y);
    ctx.fillText(`c2`, cubic2.x + 5, cubic2.y);
    dot(ctx, cubic1, { radius: 3 });
    dot(ctx, cubic2, { radius: 3 });
    dot(ctx, a2, { radius: 3 });
    dot(ctx, b2, { radius: 3 });
    stack = stack.pop();
    stack.apply();
  }
};
var quadraticBezier = (ctx, bezierToDraw, opts = {}) => {
  const { a: a2, b: b2, quadratic: quadratic2 } = bezierToDraw;
  const isDebug = opts.debug ?? false;
  let stack = applyOpts(ctx, opts);
  ctx.beginPath();
  ctx.moveTo(a2.x, a2.y);
  ctx.quadraticCurveTo(quadratic2.x, quadratic2.y, b2.x, b2.y);
  ctx.stroke();
  if (isDebug) {
    stack = stack.push(
      optsOp({
        ...opts,
        strokeStyle: colour_exports.multiplyOpacity(opts.strokeStyle ?? `silver`, 0.6),
        fillStyle: colour_exports.multiplyOpacity(opts.fillStyle ?? `yellow`, 0.4)
      })
    );
    connectedPoints(ctx, [a2, quadratic2, b2]);
    ctx.fillText(`a`, a2.x + 5, a2.y);
    ctx.fillText(`b`, b2.x + 5, b2.y);
    ctx.fillText(`h`, quadratic2.x + 5, quadratic2.y);
    dot(ctx, quadratic2, { radius: 3 });
    dot(ctx, a2, { radius: 3 });
    dot(ctx, b2, { radius: 3 });
    stack = stack.pop();
    stack.apply();
  }
};
var line = (ctx, toDraw, opts = {}) => {
  const isDebug = opts.debug ?? false;
  const o = lineOp(opts.lineWidth, opts.lineJoin, opts.lineCap);
  applyOpts(ctx, opts, o);
  const draw = (d2) => {
    const { a: a2, b: b2 } = d2;
    ctx.beginPath();
    ctx.moveTo(a2.x, a2.y);
    ctx.lineTo(b2.x, b2.y);
    if (isDebug) {
      ctx.fillText(`a`, a2.x, a2.y);
      ctx.fillText(`b`, b2.x, b2.y);
      dot(ctx, a2, { radius: 5, strokeStyle: `black` });
      dot(ctx, b2, { radius: 5, strokeStyle: `black` });
    }
    ctx.stroke();
  };
  if (Array.isArray(toDraw)) {
    for (const t2 of toDraw) draw(t2);
  } else {
    draw(toDraw);
  }
};
var rect = (ctx, toDraw, opts = {}) => {
  applyOpts(ctx, opts);
  const filled = opts.filled ?? (opts.fillStyle === void 0 ? false : true);
  const stroke = opts.stroke ?? (opts.strokeStyle === void 0 ? false : true);
  const draw = (d2) => {
    const x = `x` in d2 ? d2.x : 0;
    const y = `y` in d2 ? d2.y : 0;
    if (filled) ctx.fillRect(x, y, d2.width, d2.height);
    if (stroke) {
      if (opts.strokeWidth) ctx.lineWidth = opts.strokeWidth;
      ctx.strokeRect(x, y, d2.width, d2.height);
    }
    if (opts.crossed) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(d2.width, d2.height);
      ctx.stroke();
      ctx.moveTo(0, d2.height);
      ctx.lineTo(d2.width, 0);
      ctx.stroke();
    }
    if (opts.debug) {
      pointLabels(ctx, rect_exports.corners(d2), void 0, [`NW`, `NE`, `SE`, `SW`]);
    }
  };
  if (Array.isArray(toDraw)) {
    for (const t2 of toDraw) {
      draw(t2);
    }
  } else {
    draw(toDraw);
  }
};
var textBlock = (ctx, lines, opts) => {
  applyOpts(ctx, opts);
  const anchorPadding = opts.anchorPadding ?? 0;
  const align2 = opts.align ?? `top`;
  const anchor = opts.anchor;
  const bounds = opts.bounds ?? { x: 0, y: 0, width: 1e6, height: 1e6 };
  const blocks = lines.map((l) => ctx.measureText(l));
  const widths = blocks.map((tm) => tm.width);
  const heights = blocks.map(
    (tm) => tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent + 3
  );
  const maxWidth = Math.max(...widths);
  const totalHeight = heights.reduce((accumulator, value) => accumulator + value, 0);
  let { x, y } = anchor;
  if (anchor.x + maxWidth > bounds.width) {
    x = bounds.width - (maxWidth + anchorPadding);
  } else x -= anchorPadding;
  if (x < bounds.x) x = bounds.x + anchorPadding;
  if (anchor.y + totalHeight > bounds.height) {
    y = bounds.height - (totalHeight + anchorPadding);
  } else y -= anchorPadding;
  if (y < bounds.y) y = bounds.y + anchorPadding;
  if (align2 === `top`) {
    ctx.textBaseline = `top`;
  } else {
    ctx.textBaseline = `middle`;
  }
  for (const [index, line4] of lines.entries()) {
    ctx.fillText(line4, x, y);
    y += heights[index];
  }
};

// ../visual/src/image-data-grid.ts
var image_data_grid_exports = {};
__export(image_data_grid_exports, {
  accessor: () => accessor,
  byColumn: () => byColumn,
  byRow: () => byRow,
  grid: () => grid,
  setter: () => setter,
  wrap: () => wrap5
});

// ../visual/src/colour/index.ts
var colour_exports = {};
__export(colour_exports, {
  cssLinearGradient: () => cssLinearGradient,
  getCssVariable: () => getCssVariable,
  goldenAngleColour: () => goldenAngleColour,
  hslFromAbsoluteValues: () => hslFromAbsoluteValues,
  hslFromRelativeValues: () => hslFromRelativeValues,
  hslToAbsolute: () => hslToAbsolute,
  hslToColorJs: () => hslToColorJs,
  hslToRelative: () => hslToRelative,
  hslToString: () => hslToString,
  interpolator: () => interpolator2,
  isHsl: () => isHsl,
  isOklch: () => isOklch,
  isRgb: () => isRgb,
  multiplyOpacity: () => multiplyOpacity,
  multiplySaturation: () => multiplySaturation,
  oklchToColorJs: () => oklchToColorJs,
  parseRgbObject: () => parseRgbObject,
  randomHue: () => randomHue,
  resolveCss: () => resolveCss,
  rgbToColorJs: () => rgbToColorJs,
  scale: () => scale4,
  structuredToColorJs: () => structuredToColorJs,
  structuredToColorJsConstructor: () => structuredToColorJsConstructor,
  toHex: () => toHex,
  toHsl: () => toHsl,
  toRgb: () => toRgb,
  toRgb8bit: () => toRgb8bit,
  toRgbRelative: () => toRgbRelative,
  toString: () => toString7,
  toStringFirst: () => toStringFirst
});

// ../visual/src/colour/generate.ts
var goldenAngleColour = (index, saturation = 0.5, lightness = 0.75, alpha = 1) => {
  throwNumberTest(index, `positive`, `index`);
  throwNumberTest(saturation, `percentage`, `saturation`);
  throwNumberTest(lightness, `percentage`, `lightness`);
  throwNumberTest(alpha, `percentage`, `alpha`);
  const hue = index * 137.508;
  return alpha === 1 ? `hsl(${hue},${saturation * 100}%,${lightness * 100}%)` : `hsl(${hue},${saturation * 100}%,${lightness * 100}%,${alpha * 100}%)`;
};
var randomHue = (rand = Math.random) => {
  const r = rand();
  return r * 360;
};

// ../../node_modules/.pnpm/colorjs.io@0.5.2/node_modules/colorjs.io/dist/color.js
function multiplyMatrices(A, B) {
  let m3 = A.length;
  if (!Array.isArray(A[0])) {
    A = [A];
  }
  if (!Array.isArray(B[0])) {
    B = B.map((x) => [x]);
  }
  let p2 = B[0].length;
  let B_cols = B[0].map((_, i) => B.map((x) => x[i]));
  let product = A.map((row) => B_cols.map((col) => {
    let ret = 0;
    if (!Array.isArray(row)) {
      for (let c4 of col) {
        ret += row * c4;
      }
      return ret;
    }
    for (let i = 0; i < row.length; i++) {
      ret += row[i] * (col[i] || 0);
    }
    return ret;
  }));
  if (m3 === 1) {
    product = product[0];
  }
  if (p2 === 1) {
    return product.map((x) => x[0]);
  }
  return product;
}
function isString(str) {
  return type(str) === "string";
}
function type(o) {
  let str = Object.prototype.toString.call(o);
  return (str.match(/^\[object\s+(.*?)\]$/)[1] || "").toLowerCase();
}
function serializeNumber(n2, { precision, unit }) {
  if (isNone(n2)) {
    return "none";
  }
  return toPrecision(n2, precision) + (unit ?? "");
}
function isNone(n2) {
  return Number.isNaN(n2) || n2 instanceof Number && n2?.none;
}
function skipNone(n2) {
  return isNone(n2) ? 0 : n2;
}
function toPrecision(n2, precision) {
  if (n2 === 0) {
    return 0;
  }
  let integer = ~~n2;
  let digits = 0;
  if (integer && precision) {
    digits = ~~Math.log10(Math.abs(integer)) + 1;
  }
  const multiplier = 10 ** (precision - digits);
  return Math.floor(n2 * multiplier + 0.5) / multiplier;
}
var angleFactor = {
  deg: 1,
  grad: 0.9,
  rad: 180 / Math.PI,
  turn: 360
};
function parseFunction(str) {
  if (!str) {
    return;
  }
  str = str.trim();
  const isFunctionRegex = /^([a-z]+)\((.+?)\)$/i;
  const isNumberRegex = /^-?[\d.]+$/;
  const unitValueRegex = /%|deg|g?rad|turn$/;
  const singleArgument = /\/?\s*(none|[-\w.]+(?:%|deg|g?rad|turn)?)/g;
  let parts = str.match(isFunctionRegex);
  if (parts) {
    let args = [];
    parts[2].replace(singleArgument, ($0, rawArg) => {
      let match = rawArg.match(unitValueRegex);
      let arg = rawArg;
      if (match) {
        let unit = match[0];
        let unitlessArg = arg.slice(0, -unit.length);
        if (unit === "%") {
          arg = new Number(unitlessArg / 100);
          arg.type = "<percentage>";
        } else {
          arg = new Number(unitlessArg * angleFactor[unit]);
          arg.type = "<angle>";
          arg.unit = unit;
        }
      } else if (isNumberRegex.test(arg)) {
        arg = new Number(arg);
        arg.type = "<number>";
      } else if (arg === "none") {
        arg = new Number(NaN);
        arg.none = true;
      }
      if ($0.startsWith("/")) {
        arg = arg instanceof Number ? arg : new Number(arg);
        arg.alpha = true;
      }
      if (typeof arg === "object" && arg instanceof Number) {
        arg.raw = rawArg;
      }
      args.push(arg);
    });
    return {
      name: parts[1].toLowerCase(),
      rawName: parts[1],
      rawArgs: parts[2],
      // An argument could be (as of css-color-4):
      // a number, percentage, degrees (hue), ident (in color())
      args
    };
  }
}
function last4(arr) {
  return arr[arr.length - 1];
}
function interpolate7(start, end, p2) {
  if (isNaN(start)) {
    return end;
  }
  if (isNaN(end)) {
    return start;
  }
  return start + (end - start) * p2;
}
function interpolateInv(start, end, value) {
  return (value - start) / (end - start);
}
function mapRange(from2, to4, value) {
  return interpolate7(to4[0], to4[1], interpolateInv(from2[0], from2[1], value));
}
function parseCoordGrammar(coordGrammars) {
  return coordGrammars.map((coordGrammar2) => {
    return coordGrammar2.split("|").map((type2) => {
      type2 = type2.trim();
      let range2 = type2.match(/^(<[a-z]+>)\[(-?[.\d]+),\s*(-?[.\d]+)\]?$/);
      if (range2) {
        let ret = new String(range2[1]);
        ret.range = [+range2[2], +range2[3]];
        return ret;
      }
      return type2;
    });
  });
}
function clamp4(min8, val, max9) {
  return Math.max(Math.min(max9, val), min8);
}
function copySign(to4, from2) {
  return Math.sign(to4) === Math.sign(from2) ? to4 : -to4;
}
function spow(base, exp) {
  return copySign(Math.abs(base) ** exp, base);
}
function zdiv(n2, d2) {
  return d2 === 0 ? 0 : n2 / d2;
}
function bisectLeft(arr, value, lo = 0, hi = arr.length) {
  while (lo < hi) {
    const mid = lo + hi >> 1;
    if (arr[mid] < value) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}
var util = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  bisectLeft,
  clamp: clamp4,
  copySign,
  interpolate: interpolate7,
  interpolateInv,
  isNone,
  isString,
  last: last4,
  mapRange,
  multiplyMatrices,
  parseCoordGrammar,
  parseFunction,
  serializeNumber,
  skipNone,
  spow,
  toPrecision,
  type,
  zdiv
});
var Hooks = class {
  add(name, callback, first) {
    if (typeof arguments[0] != "string") {
      for (var name in arguments[0]) {
        this.add(name, arguments[0][name], arguments[1]);
      }
      return;
    }
    (Array.isArray(name) ? name : [name]).forEach(function(name2) {
      this[name2] = this[name2] || [];
      if (callback) {
        this[name2][first ? "unshift" : "push"](callback);
      }
    }, this);
  }
  run(name, env) {
    this[name] = this[name] || [];
    this[name].forEach(function(callback) {
      callback.call(env && env.context ? env.context : env, env);
    });
  }
};
var hooks = new Hooks();
var defaults = {
  gamut_mapping: "css",
  precision: 5,
  deltaE: "76",
  // Default deltaE method
  verbose: globalThis?.process?.env?.NODE_ENV?.toLowerCase() !== "test",
  warn: function warn(msg) {
    if (this.verbose) {
      globalThis?.console?.warn?.(msg);
    }
  }
};
var WHITES = {
  // for compatibility, the four-digit chromaticity-derived ones everyone else uses
  D50: [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585],
  D65: [0.3127 / 0.329, 1, (1 - 0.3127 - 0.329) / 0.329]
};
function getWhite(name) {
  if (Array.isArray(name)) {
    return name;
  }
  return WHITES[name];
}
function adapt$2(W1, W2, XYZ, options = {}) {
  W1 = getWhite(W1);
  W2 = getWhite(W2);
  if (!W1 || !W2) {
    throw new TypeError(`Missing white point to convert ${!W1 ? "from" : ""}${!W1 && !W2 ? "/" : ""}${!W2 ? "to" : ""}`);
  }
  if (W1 === W2) {
    return XYZ;
  }
  let env = { W1, W2, XYZ, options };
  hooks.run("chromatic-adaptation-start", env);
  if (!env.M) {
    if (env.W1 === WHITES.D65 && env.W2 === WHITES.D50) {
      env.M = [
        [1.0479297925449969, 0.022946870601609652, -0.05019226628920524],
        [0.02962780877005599, 0.9904344267538799, -0.017073799063418826],
        [-0.009243040646204504, 0.015055191490298152, 0.7518742814281371]
      ];
    } else if (env.W1 === WHITES.D50 && env.W2 === WHITES.D65) {
      env.M = [
        [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
        [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
        [0.012314014864481998, -0.020507649298898964, 1.330365926242124]
      ];
    }
  }
  hooks.run("chromatic-adaptation-end", env);
  if (env.M) {
    return multiplyMatrices(env.M, env.XYZ);
  } else {
    throw new TypeError("Only Bradford CAT with white points D50 and D65 supported for now.");
  }
}
var noneTypes = /* @__PURE__ */ new Set(["<number>", "<percentage>", "<angle>"]);
function coerceCoords(space, format, name, coords) {
  let types = Object.entries(space.coords).map(([id, coordMeta], i) => {
    let coordGrammar2 = format.coordGrammar[i];
    let arg = coords[i];
    let providedType = arg?.type;
    let type2;
    if (arg.none) {
      type2 = coordGrammar2.find((c4) => noneTypes.has(c4));
    } else {
      type2 = coordGrammar2.find((c4) => c4 == providedType);
    }
    if (!type2) {
      let coordName = coordMeta.name || id;
      throw new TypeError(`${providedType ?? arg.raw} not allowed for ${coordName} in ${name}()`);
    }
    let fromRange = type2.range;
    if (providedType === "<percentage>") {
      fromRange ||= [0, 1];
    }
    let toRange = coordMeta.range || coordMeta.refRange;
    if (fromRange && toRange) {
      coords[i] = mapRange(fromRange, toRange, coords[i]);
    }
    return type2;
  });
  return types;
}
function parse(str, { meta } = {}) {
  let env = { "str": String(str)?.trim() };
  hooks.run("parse-start", env);
  if (env.color) {
    return env.color;
  }
  env.parsed = parseFunction(env.str);
  if (env.parsed) {
    let name = env.parsed.name;
    if (name === "color") {
      let id = env.parsed.args.shift();
      let alternateId = id.startsWith("--") ? id.substring(2) : `--${id}`;
      let ids = [id, alternateId];
      let alpha = env.parsed.rawArgs.indexOf("/") > 0 ? env.parsed.args.pop() : 1;
      for (let space of ColorSpace.all) {
        let colorSpec = space.getFormat("color");
        if (colorSpec) {
          if (ids.includes(colorSpec.id) || colorSpec.ids?.filter((specId) => ids.includes(specId)).length) {
            const coords = Object.keys(space.coords).map((_, i) => env.parsed.args[i] || 0);
            let types;
            if (colorSpec.coordGrammar) {
              types = coerceCoords(space, colorSpec, "color", coords);
            }
            if (meta) {
              Object.assign(meta, { formatId: "color", types });
            }
            if (colorSpec.id.startsWith("--") && !id.startsWith("--")) {
              defaults.warn(`${space.name} is a non-standard space and not currently supported in the CSS spec. Use prefixed color(${colorSpec.id}) instead of color(${id}).`);
            }
            if (id.startsWith("--") && !colorSpec.id.startsWith("--")) {
              defaults.warn(`${space.name} is a standard space and supported in the CSS spec. Use color(${colorSpec.id}) instead of prefixed color(${id}).`);
            }
            return { spaceId: space.id, coords, alpha };
          }
        }
      }
      let didYouMean = "";
      let registryId = id in ColorSpace.registry ? id : alternateId;
      if (registryId in ColorSpace.registry) {
        let cssId = ColorSpace.registry[registryId].formats?.color?.id;
        if (cssId) {
          didYouMean = `Did you mean color(${cssId})?`;
        }
      }
      throw new TypeError(`Cannot parse color(${id}). ` + (didYouMean || "Missing a plugin?"));
    } else {
      for (let space of ColorSpace.all) {
        let format = space.getFormat(name);
        if (format && format.type === "function") {
          let alpha = 1;
          if (format.lastAlpha || last4(env.parsed.args).alpha) {
            alpha = env.parsed.args.pop();
          }
          let coords = env.parsed.args;
          let types;
          if (format.coordGrammar) {
            types = coerceCoords(space, format, name, coords);
          }
          if (meta) {
            Object.assign(meta, { formatId: format.name, types });
          }
          return {
            spaceId: space.id,
            coords,
            alpha
          };
        }
      }
    }
  } else {
    for (let space of ColorSpace.all) {
      for (let formatId in space.formats) {
        let format = space.formats[formatId];
        if (format.type !== "custom") {
          continue;
        }
        if (format.test && !format.test(env.str)) {
          continue;
        }
        let color = format.parse(env.str);
        if (color) {
          color.alpha ??= 1;
          if (meta) {
            meta.formatId = formatId;
          }
          return color;
        }
      }
    }
  }
  throw new TypeError(`Could not parse ${str} as a color. Missing a plugin?`);
}
function getColor(color) {
  if (Array.isArray(color)) {
    return color.map(getColor);
  }
  if (!color) {
    throw new TypeError("Empty color reference");
  }
  if (isString(color)) {
    color = parse(color);
  }
  let space = color.space || color.spaceId;
  if (!(space instanceof ColorSpace)) {
    color.space = ColorSpace.get(space);
  }
  if (color.alpha === void 0) {
    color.alpha = 1;
  }
  return color;
}
var \u03B5$7 = 75e-6;
var ColorSpace = class _ColorSpace {
  constructor(options) {
    this.id = options.id;
    this.name = options.name;
    this.base = options.base ? _ColorSpace.get(options.base) : null;
    this.aliases = options.aliases;
    if (this.base) {
      this.fromBase = options.fromBase;
      this.toBase = options.toBase;
    }
    let coords = options.coords ?? this.base.coords;
    for (let name in coords) {
      if (!("name" in coords[name])) {
        coords[name].name = name;
      }
    }
    this.coords = coords;
    let white2 = options.white ?? this.base.white ?? "D65";
    this.white = getWhite(white2);
    this.formats = options.formats ?? {};
    for (let name in this.formats) {
      let format = this.formats[name];
      format.type ||= "function";
      format.name ||= name;
    }
    if (!this.formats.color?.id) {
      this.formats.color = {
        ...this.formats.color ?? {},
        id: options.cssId || this.id
      };
    }
    if (options.gamutSpace) {
      this.gamutSpace = options.gamutSpace === "self" ? this : _ColorSpace.get(options.gamutSpace);
    } else {
      if (this.isPolar) {
        this.gamutSpace = this.base;
      } else {
        this.gamutSpace = this;
      }
    }
    if (this.gamutSpace.isUnbounded) {
      this.inGamut = (coords2, options2) => {
        return true;
      };
    }
    this.referred = options.referred;
    Object.defineProperty(this, "path", {
      value: getPath(this).reverse(),
      writable: false,
      enumerable: true,
      configurable: true
    });
    hooks.run("colorspace-init-end", this);
  }
  inGamut(coords, { epsilon: epsilon2 = \u03B5$7 } = {}) {
    if (!this.equals(this.gamutSpace)) {
      coords = this.to(this.gamutSpace, coords);
      return this.gamutSpace.inGamut(coords, { epsilon: epsilon2 });
    }
    let coordMeta = Object.values(this.coords);
    return coords.every((c4, i) => {
      let meta = coordMeta[i];
      if (meta.type !== "angle" && meta.range) {
        if (Number.isNaN(c4)) {
          return true;
        }
        let [min8, max9] = meta.range;
        return (min8 === void 0 || c4 >= min8 - epsilon2) && (max9 === void 0 || c4 <= max9 + epsilon2);
      }
      return true;
    });
  }
  get isUnbounded() {
    return Object.values(this.coords).every((coord) => !("range" in coord));
  }
  get cssId() {
    return this.formats?.color?.id || this.id;
  }
  get isPolar() {
    for (let id in this.coords) {
      if (this.coords[id].type === "angle") {
        return true;
      }
    }
    return false;
  }
  getFormat(format) {
    if (typeof format === "object") {
      format = processFormat(format, this);
      return format;
    }
    let ret;
    if (format === "default") {
      ret = Object.values(this.formats)[0];
    } else {
      ret = this.formats[format];
    }
    if (ret) {
      ret = processFormat(ret, this);
      return ret;
    }
    return null;
  }
  /**
   * Check if this color space is the same as another color space reference.
   * Allows proxying color space objects and comparing color spaces with ids.
   * @param {string | ColorSpace} space ColorSpace object or id to compare to
   * @returns {boolean}
   */
  equals(space) {
    if (!space) {
      return false;
    }
    return this === space || this.id === space || this.id === space.id;
  }
  to(space, coords) {
    if (arguments.length === 1) {
      const color = getColor(space);
      [space, coords] = [color.space, color.coords];
    }
    space = _ColorSpace.get(space);
    if (this.equals(space)) {
      return coords;
    }
    coords = coords.map((c4) => Number.isNaN(c4) ? 0 : c4);
    let myPath = this.path;
    let otherPath = space.path;
    let connectionSpace, connectionSpaceIndex;
    for (let i = 0; i < myPath.length; i++) {
      if (myPath[i].equals(otherPath[i])) {
        connectionSpace = myPath[i];
        connectionSpaceIndex = i;
      } else {
        break;
      }
    }
    if (!connectionSpace) {
      throw new Error(`Cannot convert between color spaces ${this} and ${space}: no connection space was found`);
    }
    for (let i = myPath.length - 1; i > connectionSpaceIndex; i--) {
      coords = myPath[i].toBase(coords);
    }
    for (let i = connectionSpaceIndex + 1; i < otherPath.length; i++) {
      coords = otherPath[i].fromBase(coords);
    }
    return coords;
  }
  from(space, coords) {
    if (arguments.length === 1) {
      const color = getColor(space);
      [space, coords] = [color.space, color.coords];
    }
    space = _ColorSpace.get(space);
    return space.to(this, coords);
  }
  toString() {
    return `${this.name} (${this.id})`;
  }
  getMinCoords() {
    let ret = [];
    for (let id in this.coords) {
      let meta = this.coords[id];
      let range2 = meta.range || meta.refRange;
      ret.push(range2?.min ?? 0);
    }
    return ret;
  }
  static registry = {};
  // Returns array of unique color spaces
  static get all() {
    return [...new Set(Object.values(_ColorSpace.registry))];
  }
  static register(id, space) {
    if (arguments.length === 1) {
      space = arguments[0];
      id = space.id;
    }
    space = this.get(space);
    if (this.registry[id] && this.registry[id] !== space) {
      throw new Error(`Duplicate color space registration: '${id}'`);
    }
    this.registry[id] = space;
    if (arguments.length === 1 && space.aliases) {
      for (let alias of space.aliases) {
        this.register(alias, space);
      }
    }
    return space;
  }
  /**
   * Lookup ColorSpace object by name
   * @param {ColorSpace | string} name
   */
  static get(space, ...alternatives) {
    if (!space || space instanceof _ColorSpace) {
      return space;
    }
    let argType = type(space);
    if (argType === "string") {
      let ret = _ColorSpace.registry[space.toLowerCase()];
      if (!ret) {
        throw new TypeError(`No color space found with id = "${space}"`);
      }
      return ret;
    }
    if (alternatives.length) {
      return _ColorSpace.get(...alternatives);
    }
    throw new TypeError(`${space} is not a valid color space`);
  }
  /**
   * Get metadata about a coordinate of a color space
   *
   * @static
   * @param {Array | string} ref
   * @param {ColorSpace | string} [workingSpace]
   * @return {Object}
   */
  static resolveCoord(ref, workingSpace) {
    let coordType = type(ref);
    let space, coord;
    if (coordType === "string") {
      if (ref.includes(".")) {
        [space, coord] = ref.split(".");
      } else {
        [space, coord] = [, ref];
      }
    } else if (Array.isArray(ref)) {
      [space, coord] = ref;
    } else {
      space = ref.space;
      coord = ref.coordId;
    }
    space = _ColorSpace.get(space);
    if (!space) {
      space = workingSpace;
    }
    if (!space) {
      throw new TypeError(`Cannot resolve coordinate reference ${ref}: No color space specified and relative references are not allowed here`);
    }
    coordType = type(coord);
    if (coordType === "number" || coordType === "string" && coord >= 0) {
      let meta = Object.entries(space.coords)[coord];
      if (meta) {
        return { space, id: meta[0], index: coord, ...meta[1] };
      }
    }
    space = _ColorSpace.get(space);
    let normalizedCoord = coord.toLowerCase();
    let i = 0;
    for (let id in space.coords) {
      let meta = space.coords[id];
      if (id.toLowerCase() === normalizedCoord || meta.name?.toLowerCase() === normalizedCoord) {
        return { space, id, index: i, ...meta };
      }
      i++;
    }
    throw new TypeError(`No "${coord}" coordinate found in ${space.name}. Its coordinates are: ${Object.keys(space.coords).join(", ")}`);
  }
  static DEFAULT_FORMAT = {
    type: "functions",
    name: "color"
  };
};
function getPath(space) {
  let ret = [space];
  for (let s = space; s = s.base; ) {
    ret.push(s);
  }
  return ret;
}
function processFormat(format, { coords } = {}) {
  if (format.coords && !format.coordGrammar) {
    format.type ||= "function";
    format.name ||= "color";
    format.coordGrammar = parseCoordGrammar(format.coords);
    let coordFormats = Object.entries(coords).map(([id, coordMeta], i) => {
      let outputType = format.coordGrammar[i][0];
      let fromRange = coordMeta.range || coordMeta.refRange;
      let toRange = outputType.range, suffix = "";
      if (outputType == "<percentage>") {
        toRange = [0, 100];
        suffix = "%";
      } else if (outputType == "<angle>") {
        suffix = "deg";
      }
      return { fromRange, toRange, suffix };
    });
    format.serializeCoords = (coords2, precision) => {
      return coords2.map((c4, i) => {
        let { fromRange, toRange, suffix } = coordFormats[i];
        if (fromRange && toRange) {
          c4 = mapRange(fromRange, toRange, c4);
        }
        c4 = serializeNumber(c4, { precision, unit: suffix });
        return c4;
      });
    };
  }
  return format;
}
var xyz_d65 = new ColorSpace({
  id: "xyz-d65",
  name: "XYZ D65",
  coords: {
    x: { name: "X" },
    y: { name: "Y" },
    z: { name: "Z" }
  },
  white: "D65",
  formats: {
    color: {
      ids: ["xyz-d65", "xyz"]
    }
  },
  aliases: ["xyz"]
});
var RGBColorSpace = class extends ColorSpace {
  /**
   * Creates a new RGB ColorSpace.
   * If coords are not specified, they will use the default RGB coords.
   * Instead of `fromBase()` and `toBase()` functions,
   * you can specify to/from XYZ matrices and have `toBase()` and `fromBase()` automatically generated.
   * @param {*} options - Same options as {@link ColorSpace} plus:
   * @param {number[][]} options.toXYZ_M - Matrix to convert to XYZ
   * @param {number[][]} options.fromXYZ_M - Matrix to convert from XYZ
   */
  constructor(options) {
    if (!options.coords) {
      options.coords = {
        r: {
          range: [0, 1],
          name: "Red"
        },
        g: {
          range: [0, 1],
          name: "Green"
        },
        b: {
          range: [0, 1],
          name: "Blue"
        }
      };
    }
    if (!options.base) {
      options.base = xyz_d65;
    }
    if (options.toXYZ_M && options.fromXYZ_M) {
      options.toBase ??= (rgb) => {
        let xyz = multiplyMatrices(options.toXYZ_M, rgb);
        if (this.white !== this.base.white) {
          xyz = adapt$2(this.white, this.base.white, xyz);
        }
        return xyz;
      };
      options.fromBase ??= (xyz) => {
        xyz = adapt$2(this.base.white, this.white, xyz);
        return multiplyMatrices(options.fromXYZ_M, xyz);
      };
    }
    options.referred ??= "display";
    super(options);
  }
};
function getAll(color, space) {
  color = getColor(color);
  if (!space || color.space.equals(space)) {
    return color.coords.slice();
  }
  space = ColorSpace.get(space);
  return space.from(color);
}
function get2(color, prop) {
  color = getColor(color);
  let { space, index } = ColorSpace.resolveCoord(prop, color.space);
  let coords = getAll(color, space);
  return coords[index];
}
function setAll(color, space, coords) {
  color = getColor(color);
  space = ColorSpace.get(space);
  color.coords = space.to(color.space, coords);
  return color;
}
setAll.returns = "color";
function set4(color, prop, value) {
  color = getColor(color);
  if (arguments.length === 2 && type(arguments[1]) === "object") {
    let object2 = arguments[1];
    for (let p2 in object2) {
      set4(color, p2, object2[p2]);
    }
  } else {
    if (typeof value === "function") {
      value = value(get2(color, prop));
    }
    let { space, index } = ColorSpace.resolveCoord(prop, color.space);
    let coords = getAll(color, space);
    coords[index] = value;
    setAll(color, space, coords);
  }
  return color;
}
set4.returns = "color";
var XYZ_D50 = new ColorSpace({
  id: "xyz-d50",
  name: "XYZ D50",
  white: "D50",
  base: xyz_d65,
  fromBase: (coords) => adapt$2(xyz_d65.white, "D50", coords),
  toBase: (coords) => adapt$2("D50", xyz_d65.white, coords)
});
var \u03B5$6 = 216 / 24389;
var \u03B53$1 = 24 / 116;
var \u03BA$4 = 24389 / 27;
var white$4 = WHITES.D50;
var lab = new ColorSpace({
  id: "lab",
  name: "Lab",
  coords: {
    l: {
      refRange: [0, 100],
      name: "Lightness"
    },
    a: {
      refRange: [-125, 125]
    },
    b: {
      refRange: [-125, 125]
    }
  },
  // Assuming XYZ is relative to D50, convert to CIE Lab
  // from CIE standard, which now defines these as a rational fraction
  white: white$4,
  base: XYZ_D50,
  // Convert D50-adapted XYX to Lab
  //  CIE 15.3:2004 section 8.2.1.1
  fromBase(XYZ) {
    let xyz = XYZ.map((value, i) => value / white$4[i]);
    let f = xyz.map((value) => value > \u03B5$6 ? Math.cbrt(value) : (\u03BA$4 * value + 16) / 116);
    return [
      116 * f[1] - 16,
      // L
      500 * (f[0] - f[1]),
      // a
      200 * (f[1] - f[2])
      // b
    ];
  },
  // Convert Lab to D50-adapted XYZ
  // Same result as CIE 15.3:2004 Appendix D although the derivation is different
  // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
  toBase(Lab) {
    let f = [];
    f[1] = (Lab[0] + 16) / 116;
    f[0] = Lab[1] / 500 + f[1];
    f[2] = f[1] - Lab[2] / 200;
    let xyz = [
      f[0] > \u03B53$1 ? Math.pow(f[0], 3) : (116 * f[0] - 16) / \u03BA$4,
      Lab[0] > 8 ? Math.pow((Lab[0] + 16) / 116, 3) : Lab[0] / \u03BA$4,
      f[2] > \u03B53$1 ? Math.pow(f[2], 3) : (116 * f[2] - 16) / \u03BA$4
    ];
    return xyz.map((value, i) => value * white$4[i]);
  },
  formats: {
    "lab": {
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
function constrain(angle) {
  return (angle % 360 + 360) % 360;
}
function adjust(arc2, angles2) {
  if (arc2 === "raw") {
    return angles2;
  }
  let [a1, a2] = angles2.map(constrain);
  let angleDiff = a2 - a1;
  if (arc2 === "increasing") {
    if (angleDiff < 0) {
      a2 += 360;
    }
  } else if (arc2 === "decreasing") {
    if (angleDiff > 0) {
      a1 += 360;
    }
  } else if (arc2 === "longer") {
    if (-180 < angleDiff && angleDiff < 180) {
      if (angleDiff > 0) {
        a1 += 360;
      } else {
        a2 += 360;
      }
    }
  } else if (arc2 === "shorter") {
    if (angleDiff > 180) {
      a1 += 360;
    } else if (angleDiff < -180) {
      a2 += 360;
    }
  }
  return [a1, a2];
}
var lch = new ColorSpace({
  id: "lch",
  name: "LCH",
  coords: {
    l: {
      refRange: [0, 100],
      name: "Lightness"
    },
    c: {
      refRange: [0, 150],
      name: "Chroma"
    },
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    }
  },
  base: lab,
  fromBase(Lab) {
    let [L, a2, b2] = Lab;
    let hue;
    const \u03B52 = 0.02;
    if (Math.abs(a2) < \u03B52 && Math.abs(b2) < \u03B52) {
      hue = NaN;
    } else {
      hue = Math.atan2(b2, a2) * 180 / Math.PI;
    }
    return [
      L,
      // L is still L
      Math.sqrt(a2 ** 2 + b2 ** 2),
      // Chroma
      constrain(hue)
      // Hue, in degrees [0 to 360)
    ];
  },
  toBase(LCH) {
    let [Lightness, Chroma, Hue] = LCH;
    if (Chroma < 0) {
      Chroma = 0;
    }
    if (isNaN(Hue)) {
      Hue = 0;
    }
    return [
      Lightness,
      // L is still L
      Chroma * Math.cos(Hue * Math.PI / 180),
      // a
      Chroma * Math.sin(Hue * Math.PI / 180)
      // b
    ];
  },
  formats: {
    "lch": {
      coords: ["<number> | <percentage>", "<number> | <percentage>", "<number> | <angle>"]
    }
  }
});
var Gfactor = 25 ** 7;
var \u03C0$1 = Math.PI;
var r2d = 180 / \u03C0$1;
var d2r$1 = \u03C0$1 / 180;
function pow7(x) {
  const x2 = x * x;
  const x7 = x2 * x2 * x2 * x;
  return x7;
}
function deltaE2000(color, sample2, { kL = 1, kC = 1, kH = 1 } = {}) {
  [color, sample2] = getColor([color, sample2]);
  let [L1, a1, b1] = lab.from(color);
  let C1 = lch.from(lab, [L1, a1, b1])[1];
  let [L2, a2, b2] = lab.from(sample2);
  let C2 = lch.from(lab, [L2, a2, b2])[1];
  if (C1 < 0) {
    C1 = 0;
  }
  if (C2 < 0) {
    C2 = 0;
  }
  let Cbar = (C1 + C2) / 2;
  let C7 = pow7(Cbar);
  let G = 0.5 * (1 - Math.sqrt(C7 / (C7 + Gfactor)));
  let adash1 = (1 + G) * a1;
  let adash2 = (1 + G) * a2;
  let Cdash1 = Math.sqrt(adash1 ** 2 + b1 ** 2);
  let Cdash2 = Math.sqrt(adash2 ** 2 + b2 ** 2);
  let h1 = adash1 === 0 && b1 === 0 ? 0 : Math.atan2(b1, adash1);
  let h2 = adash2 === 0 && b2 === 0 ? 0 : Math.atan2(b2, adash2);
  if (h1 < 0) {
    h1 += 2 * \u03C0$1;
  }
  if (h2 < 0) {
    h2 += 2 * \u03C0$1;
  }
  h1 *= r2d;
  h2 *= r2d;
  let \u0394L = L2 - L1;
  let \u0394C = Cdash2 - Cdash1;
  let hdiff = h2 - h1;
  let hsum = h1 + h2;
  let habs = Math.abs(hdiff);
  let \u0394h;
  if (Cdash1 * Cdash2 === 0) {
    \u0394h = 0;
  } else if (habs <= 180) {
    \u0394h = hdiff;
  } else if (hdiff > 180) {
    \u0394h = hdiff - 360;
  } else if (hdiff < -180) {
    \u0394h = hdiff + 360;
  } else {
    defaults.warn("the unthinkable has happened");
  }
  let \u0394H = 2 * Math.sqrt(Cdash2 * Cdash1) * Math.sin(\u0394h * d2r$1 / 2);
  let Ldash = (L1 + L2) / 2;
  let Cdash = (Cdash1 + Cdash2) / 2;
  let Cdash7 = pow7(Cdash);
  let hdash;
  if (Cdash1 * Cdash2 === 0) {
    hdash = hsum;
  } else if (habs <= 180) {
    hdash = hsum / 2;
  } else if (hsum < 360) {
    hdash = (hsum + 360) / 2;
  } else {
    hdash = (hsum - 360) / 2;
  }
  let lsq = (Ldash - 50) ** 2;
  let SL = 1 + 0.015 * lsq / Math.sqrt(20 + lsq);
  let SC = 1 + 0.045 * Cdash;
  let T = 1;
  T -= 0.17 * Math.cos((hdash - 30) * d2r$1);
  T += 0.24 * Math.cos(2 * hdash * d2r$1);
  T += 0.32 * Math.cos((3 * hdash + 6) * d2r$1);
  T -= 0.2 * Math.cos((4 * hdash - 63) * d2r$1);
  let SH = 1 + 0.015 * Cdash * T;
  let \u0394\u03B8 = 30 * Math.exp(-1 * ((hdash - 275) / 25) ** 2);
  let RC = 2 * Math.sqrt(Cdash7 / (Cdash7 + Gfactor));
  let RT = -1 * Math.sin(2 * \u0394\u03B8 * d2r$1) * RC;
  let dE = (\u0394L / (kL * SL)) ** 2;
  dE += (\u0394C / (kC * SC)) ** 2;
  dE += (\u0394H / (kH * SH)) ** 2;
  dE += RT * (\u0394C / (kC * SC)) * (\u0394H / (kH * SH));
  return Math.sqrt(dE);
}
var XYZtoLMS_M$1 = [
  [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
  [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
  [0.0481771893596242, 0.2642395317527308, 0.6335478284694309]
];
var LMStoXYZ_M$1 = [
  [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
  [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
  [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816]
];
var LMStoLab_M = [
  [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
  [1.9779985324311684, -2.42859224204858, 0.450593709617411],
  [0.0259040424655478, 0.7827717124575296, -0.8086757549230774]
];
var LabtoLMS_M = [
  [1, 0.3963377773761749, 0.2158037573099136],
  [1, -0.1055613458156586, -0.0638541728258133],
  [1, -0.0894841775298119, -1.2914855480194092]
];
var OKLab = new ColorSpace({
  id: "oklab",
  name: "Oklab",
  coords: {
    l: {
      refRange: [0, 1],
      name: "Lightness"
    },
    a: {
      refRange: [-0.4, 0.4]
    },
    b: {
      refRange: [-0.4, 0.4]
    }
  },
  // Note that XYZ is relative to D65
  white: "D65",
  base: xyz_d65,
  fromBase(XYZ) {
    let LMS = multiplyMatrices(XYZtoLMS_M$1, XYZ);
    let LMSg = LMS.map((val) => Math.cbrt(val));
    return multiplyMatrices(LMStoLab_M, LMSg);
  },
  toBase(OKLab2) {
    let LMSg = multiplyMatrices(LabtoLMS_M, OKLab2);
    let LMS = LMSg.map((val) => val ** 3);
    return multiplyMatrices(LMStoXYZ_M$1, LMS);
  },
  formats: {
    "oklab": {
      coords: ["<percentage> | <number>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
function deltaEOK(color, sample2) {
  [color, sample2] = getColor([color, sample2]);
  let [L1, a1, b1] = OKLab.from(color);
  let [L2, a2, b2] = OKLab.from(sample2);
  let \u0394L = L1 - L2;
  let \u0394a = a1 - a2;
  let \u0394b = b1 - b2;
  return Math.sqrt(\u0394L ** 2 + \u0394a ** 2 + \u0394b ** 2);
}
var \u03B5$5 = 75e-6;
function inGamut(color, space, { epsilon: epsilon2 = \u03B5$5 } = {}) {
  color = getColor(color);
  if (!space) {
    space = color.space;
  }
  space = ColorSpace.get(space);
  let coords = color.coords;
  if (space !== color.space) {
    coords = space.from(color);
  }
  return space.inGamut(coords, { epsilon: epsilon2 });
}
function clone2(color) {
  return {
    space: color.space,
    coords: color.coords.slice(),
    alpha: color.alpha
  };
}
function distance4(color1, color2, space = "lab") {
  space = ColorSpace.get(space);
  let coords1 = space.from(color1);
  let coords2 = space.from(color2);
  return Math.sqrt(coords1.reduce((acc, c12, i) => {
    let c22 = coords2[i];
    if (isNaN(c12) || isNaN(c22)) {
      return acc;
    }
    return acc + (c22 - c12) ** 2;
  }, 0));
}
function deltaE76(color, sample2) {
  return distance4(color, sample2, "lab");
}
var \u03C0 = Math.PI;
var d2r = \u03C0 / 180;
function deltaECMC(color, sample2, { l = 2, c: c4 = 1 } = {}) {
  [color, sample2] = getColor([color, sample2]);
  let [L1, a1, b1] = lab.from(color);
  let [, C1, H1] = lch.from(lab, [L1, a1, b1]);
  let [L2, a2, b2] = lab.from(sample2);
  let C2 = lch.from(lab, [L2, a2, b2])[1];
  if (C1 < 0) {
    C1 = 0;
  }
  if (C2 < 0) {
    C2 = 0;
  }
  let \u0394L = L1 - L2;
  let \u0394C = C1 - C2;
  let \u0394a = a1 - a2;
  let \u0394b = b1 - b2;
  let H2 = \u0394a ** 2 + \u0394b ** 2 - \u0394C ** 2;
  let SL = 0.511;
  if (L1 >= 16) {
    SL = 0.040975 * L1 / (1 + 0.01765 * L1);
  }
  let SC = 0.0638 * C1 / (1 + 0.0131 * C1) + 0.638;
  let T;
  if (Number.isNaN(H1)) {
    H1 = 0;
  }
  if (H1 >= 164 && H1 <= 345) {
    T = 0.56 + Math.abs(0.2 * Math.cos((H1 + 168) * d2r));
  } else {
    T = 0.36 + Math.abs(0.4 * Math.cos((H1 + 35) * d2r));
  }
  let C4 = Math.pow(C1, 4);
  let F = Math.sqrt(C4 / (C4 + 1900));
  let SH = SC * (F * T + 1 - F);
  let dE = (\u0394L / (l * SL)) ** 2;
  dE += (\u0394C / (c4 * SC)) ** 2;
  dE += H2 / SH ** 2;
  return Math.sqrt(dE);
}
var Yw$1 = 203;
var XYZ_Abs_D65 = new ColorSpace({
  // Absolute CIE XYZ, with a D65 whitepoint,
  // as used in most HDR colorspaces as a starting point.
  // SDR spaces are converted per BT.2048
  // so that diffuse, media white is 203 cd/m²
  id: "xyz-abs-d65",
  cssId: "--xyz-abs-d65",
  name: "Absolute XYZ D65",
  coords: {
    x: {
      refRange: [0, 9504.7],
      name: "Xa"
    },
    y: {
      refRange: [0, 1e4],
      name: "Ya"
    },
    z: {
      refRange: [0, 10888.3],
      name: "Za"
    }
  },
  base: xyz_d65,
  fromBase(XYZ) {
    return XYZ.map((v) => Math.max(v * Yw$1, 0));
  },
  toBase(AbsXYZ) {
    return AbsXYZ.map((v) => Math.max(v / Yw$1, 0));
  }
});
var b$1 = 1.15;
var g = 0.66;
var n$1 = 2610 / 2 ** 14;
var ninv$1 = 2 ** 14 / 2610;
var c1$2 = 3424 / 2 ** 12;
var c2$2 = 2413 / 2 ** 7;
var c3$2 = 2392 / 2 ** 7;
var p = 1.7 * 2523 / 2 ** 5;
var pinv = 2 ** 5 / (1.7 * 2523);
var d = -0.56;
var d0 = 16295499532821565e-27;
var XYZtoCone_M = [
  [0.41478972, 0.579999, 0.014648],
  [-0.20151, 1.120649, 0.0531008],
  [-0.0166008, 0.2648, 0.6684799]
];
var ConetoXYZ_M = [
  [1.9242264357876067, -1.0047923125953657, 0.037651404030618],
  [0.35031676209499907, 0.7264811939316552, -0.06538442294808501],
  [-0.09098281098284752, -0.3127282905230739, 1.5227665613052603]
];
var ConetoIab_M = [
  [0.5, 0.5, 0],
  [3.524, -4.066708, 0.542708],
  [0.199076, 1.096799, -1.295875]
];
var IabtoCone_M = [
  [1, 0.1386050432715393, 0.05804731615611886],
  [0.9999999999999999, -0.1386050432715393, -0.05804731615611886],
  [0.9999999999999998, -0.09601924202631895, -0.8118918960560388]
];
var Jzazbz = new ColorSpace({
  id: "jzazbz",
  name: "Jzazbz",
  coords: {
    jz: {
      refRange: [0, 1],
      name: "Jz"
    },
    az: {
      refRange: [-0.5, 0.5]
    },
    bz: {
      refRange: [-0.5, 0.5]
    }
  },
  base: XYZ_Abs_D65,
  fromBase(XYZ) {
    let [Xa, Ya, Za] = XYZ;
    let Xm = b$1 * Xa - (b$1 - 1) * Za;
    let Ym = g * Ya - (g - 1) * Xa;
    let LMS = multiplyMatrices(XYZtoCone_M, [Xm, Ym, Za]);
    let PQLMS = LMS.map(function(val) {
      let num = c1$2 + c2$2 * (val / 1e4) ** n$1;
      let denom = 1 + c3$2 * (val / 1e4) ** n$1;
      return (num / denom) ** p;
    });
    let [Iz, az, bz] = multiplyMatrices(ConetoIab_M, PQLMS);
    let Jz = (1 + d) * Iz / (1 + d * Iz) - d0;
    return [Jz, az, bz];
  },
  toBase(Jzazbz2) {
    let [Jz, az, bz] = Jzazbz2;
    let Iz = (Jz + d0) / (1 + d - d * (Jz + d0));
    let PQLMS = multiplyMatrices(IabtoCone_M, [Iz, az, bz]);
    let LMS = PQLMS.map(function(val) {
      let num = c1$2 - val ** pinv;
      let denom = c3$2 * val ** pinv - c2$2;
      let x = 1e4 * (num / denom) ** ninv$1;
      return x;
    });
    let [Xm, Ym, Za] = multiplyMatrices(ConetoXYZ_M, LMS);
    let Xa = (Xm + (b$1 - 1) * Za) / b$1;
    let Ya = (Ym + (g - 1) * Xa) / g;
    return [Xa, Ya, Za];
  },
  formats: {
    // https://drafts.csswg.org/css-color-hdr/#Jzazbz
    "color": {
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
var jzczhz = new ColorSpace({
  id: "jzczhz",
  name: "JzCzHz",
  coords: {
    jz: {
      refRange: [0, 1],
      name: "Jz"
    },
    cz: {
      refRange: [0, 1],
      name: "Chroma"
    },
    hz: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    }
  },
  base: Jzazbz,
  fromBase(jzazbz) {
    let [Jz, az, bz] = jzazbz;
    let hue;
    const \u03B52 = 2e-4;
    if (Math.abs(az) < \u03B52 && Math.abs(bz) < \u03B52) {
      hue = NaN;
    } else {
      hue = Math.atan2(bz, az) * 180 / Math.PI;
    }
    return [
      Jz,
      // Jz is still Jz
      Math.sqrt(az ** 2 + bz ** 2),
      // Chroma
      constrain(hue)
      // Hue, in degrees [0 to 360)
    ];
  },
  toBase(jzczhz2) {
    return [
      jzczhz2[0],
      // Jz is still Jz
      jzczhz2[1] * Math.cos(jzczhz2[2] * Math.PI / 180),
      // az
      jzczhz2[1] * Math.sin(jzczhz2[2] * Math.PI / 180)
      // bz
    ];
  }
});
function deltaEJz(color, sample2) {
  [color, sample2] = getColor([color, sample2]);
  let [Jz1, Cz1, Hz1] = jzczhz.from(color);
  let [Jz2, Cz2, Hz2] = jzczhz.from(sample2);
  let \u0394J = Jz1 - Jz2;
  let \u0394C = Cz1 - Cz2;
  if (Number.isNaN(Hz1) && Number.isNaN(Hz2)) {
    Hz1 = 0;
    Hz2 = 0;
  } else if (Number.isNaN(Hz1)) {
    Hz1 = Hz2;
  } else if (Number.isNaN(Hz2)) {
    Hz2 = Hz1;
  }
  let \u0394h = Hz1 - Hz2;
  let \u0394H = 2 * Math.sqrt(Cz1 * Cz2) * Math.sin(\u0394h / 2 * (Math.PI / 180));
  return Math.sqrt(\u0394J ** 2 + \u0394C ** 2 + \u0394H ** 2);
}
var c1$1 = 3424 / 4096;
var c2$1 = 2413 / 128;
var c3$1 = 2392 / 128;
var m1$1 = 2610 / 16384;
var m2 = 2523 / 32;
var im1 = 16384 / 2610;
var im2 = 32 / 2523;
var XYZtoLMS_M = [
  [0.3592832590121217, 0.6976051147779502, -0.035891593232029],
  [-0.1920808463704993, 1.100476797037432, 0.0753748658519118],
  [0.0070797844607479, 0.0748396662186362, 0.8433265453898765]
];
var LMStoIPT_M = [
  [2048 / 4096, 2048 / 4096, 0],
  [6610 / 4096, -13613 / 4096, 7003 / 4096],
  [17933 / 4096, -17390 / 4096, -543 / 4096]
];
var IPTtoLMS_M = [
  [0.9999999999999998, 0.0086090370379328, 0.111029625003026],
  [0.9999999999999998, -0.0086090370379328, -0.1110296250030259],
  [0.9999999999999998, 0.5600313357106791, -0.3206271749873188]
];
var LMStoXYZ_M = [
  [2.0701522183894223, -1.3263473389671563, 0.2066510476294053],
  [0.3647385209748072, 0.6805660249472273, -0.0453045459220347],
  [-0.0497472075358123, -0.0492609666966131, 1.1880659249923042]
];
var ictcp = new ColorSpace({
  id: "ictcp",
  name: "ICTCP",
  // From BT.2100-2 page 7:
  // During production, signal values are expected to exceed the
  // range E′ = [0.0 : 1.0]. This provides processing headroom and avoids
  // signal degradation during cascaded processing. Such values of E′,
  // below 0.0 or exceeding 1.0, should not be clipped during production
  // and exchange.
  // Values below 0.0 should not be clipped in reference displays (even
  // though they represent “negative” light) to allow the black level of
  // the signal (LB) to be properly set using test signals known as “PLUGE”
  coords: {
    i: {
      refRange: [0, 1],
      // Constant luminance,
      name: "I"
    },
    ct: {
      refRange: [-0.5, 0.5],
      // Full BT.2020 gamut in range [-0.5, 0.5]
      name: "CT"
    },
    cp: {
      refRange: [-0.5, 0.5],
      name: "CP"
    }
  },
  base: XYZ_Abs_D65,
  fromBase(XYZ) {
    let LMS = multiplyMatrices(XYZtoLMS_M, XYZ);
    return LMStoICtCp(LMS);
  },
  toBase(ICtCp) {
    let LMS = ICtCptoLMS(ICtCp);
    return multiplyMatrices(LMStoXYZ_M, LMS);
  }
});
function LMStoICtCp(LMS) {
  let PQLMS = LMS.map(function(val) {
    let num = c1$1 + c2$1 * (val / 1e4) ** m1$1;
    let denom = 1 + c3$1 * (val / 1e4) ** m1$1;
    return (num / denom) ** m2;
  });
  return multiplyMatrices(LMStoIPT_M, PQLMS);
}
function ICtCptoLMS(ICtCp) {
  let PQLMS = multiplyMatrices(IPTtoLMS_M, ICtCp);
  let LMS = PQLMS.map(function(val) {
    let num = Math.max(val ** im2 - c1$1, 0);
    let denom = c2$1 - c3$1 * val ** im2;
    return 1e4 * (num / denom) ** im1;
  });
  return LMS;
}
function deltaEITP(color, sample2) {
  [color, sample2] = getColor([color, sample2]);
  let [I1, T1, P1] = ictcp.from(color);
  let [I2, T2, P2] = ictcp.from(sample2);
  return 720 * Math.sqrt((I1 - I2) ** 2 + 0.25 * (T1 - T2) ** 2 + (P1 - P2) ** 2);
}
var white$3 = WHITES.D65;
var adaptedCoef = 0.42;
var adaptedCoefInv = 1 / adaptedCoef;
var tau2 = 2 * Math.PI;
var cat16 = [
  [0.401288, 0.650173, -0.051461],
  [-0.250268, 1.204414, 0.045854],
  [-2079e-6, 0.048952, 0.953127]
];
var cat16Inv = [
  [1.8620678550872327, -1.0112546305316843, 0.14918677544445175],
  [0.38752654323613717, 0.6214474419314753, -0.008973985167612518],
  [-0.015841498849333856, -0.03412293802851557, 1.0499644368778496]
];
var m1 = [
  [460, 451, 288],
  [460, -891, -261],
  [460, -220, -6300]
];
var surroundMap = {
  dark: [0.8, 0.525, 0.8],
  dim: [0.9, 0.59, 0.9],
  average: [1, 0.69, 1]
};
var hueQuadMap = {
  // Red, Yellow, Green, Blue, Red
  h: [20.14, 90, 164.25, 237.53, 380.14],
  e: [0.8, 0.7, 1, 1.2, 0.8],
  H: [0, 100, 200, 300, 400]
};
var rad2deg = 180 / Math.PI;
var deg2rad$1 = Math.PI / 180;
function adapt$1(coords, fl) {
  const temp = coords.map((c4) => {
    const x = spow(fl * Math.abs(c4) * 0.01, adaptedCoef);
    return 400 * copySign(x, c4) / (x + 27.13);
  });
  return temp;
}
function unadapt(adapted, fl) {
  const constant = 100 / fl * 27.13 ** adaptedCoefInv;
  return adapted.map((c4) => {
    const cabs = Math.abs(c4);
    return copySign(constant * spow(cabs / (400 - cabs), adaptedCoefInv), c4);
  });
}
function hueQuadrature(h) {
  let hp = constrain(h);
  if (hp <= hueQuadMap.h[0]) {
    hp += 360;
  }
  const i = bisectLeft(hueQuadMap.h, hp) - 1;
  const [hi, hii] = hueQuadMap.h.slice(i, i + 2);
  const [ei, eii] = hueQuadMap.e.slice(i, i + 2);
  const Hi = hueQuadMap.H[i];
  const t2 = (hp - hi) / ei;
  return Hi + 100 * t2 / (t2 + (hii - hp) / eii);
}
function invHueQuadrature(H) {
  let Hp = (H % 400 + 400) % 400;
  const i = Math.floor(0.01 * Hp);
  Hp = Hp % 100;
  const [hi, hii] = hueQuadMap.h.slice(i, i + 2);
  const [ei, eii] = hueQuadMap.e.slice(i, i + 2);
  return constrain(
    (Hp * (eii * hi - ei * hii) - 100 * hi * eii) / (Hp * (eii - ei) - 100 * eii)
  );
}
function environment(refWhite, adaptingLuminance, backgroundLuminance, surround, discounting) {
  const env = {};
  env.discounting = discounting;
  env.refWhite = refWhite;
  env.surround = surround;
  const xyzW = refWhite.map((c4) => {
    return c4 * 100;
  });
  env.la = adaptingLuminance;
  env.yb = backgroundLuminance;
  const yw = xyzW[1];
  const rgbW = multiplyMatrices(cat16, xyzW);
  surround = surroundMap[env.surround];
  const f = surround[0];
  env.c = surround[1];
  env.nc = surround[2];
  const k = 1 / (5 * env.la + 1);
  const k4 = k ** 4;
  env.fl = k4 * env.la + 0.1 * (1 - k4) * (1 - k4) * Math.cbrt(5 * env.la);
  env.flRoot = env.fl ** 0.25;
  env.n = env.yb / yw;
  env.z = 1.48 + Math.sqrt(env.n);
  env.nbb = 0.725 * env.n ** -0.2;
  env.ncb = env.nbb;
  const d2 = discounting ? 1 : Math.max(
    Math.min(f * (1 - 1 / 3.6 * Math.exp((-env.la - 42) / 92)), 1),
    0
  );
  env.dRgb = rgbW.map((c4) => {
    return interpolate7(1, yw / c4, d2);
  });
  env.dRgbInv = env.dRgb.map((c4) => {
    return 1 / c4;
  });
  const rgbCW = rgbW.map((c4, i) => {
    return c4 * env.dRgb[i];
  });
  const rgbAW = adapt$1(rgbCW, env.fl);
  env.aW = env.nbb * (2 * rgbAW[0] + rgbAW[1] + 0.05 * rgbAW[2]);
  return env;
}
var viewingConditions$1 = environment(
  white$3,
  64 / Math.PI * 0.2,
  20,
  "average",
  false
);
function fromCam16(cam162, env) {
  if (!(cam162.J !== void 0 ^ cam162.Q !== void 0)) {
    throw new Error("Conversion requires one and only one: 'J' or 'Q'");
  }
  if (!(cam162.C !== void 0 ^ cam162.M !== void 0 ^ cam162.s !== void 0)) {
    throw new Error("Conversion requires one and only one: 'C', 'M' or 's'");
  }
  if (!(cam162.h !== void 0 ^ cam162.H !== void 0)) {
    throw new Error("Conversion requires one and only one: 'h' or 'H'");
  }
  if (cam162.J === 0 || cam162.Q === 0) {
    return [0, 0, 0];
  }
  let hRad = 0;
  if (cam162.h !== void 0) {
    hRad = constrain(cam162.h) * deg2rad$1;
  } else {
    hRad = invHueQuadrature(cam162.H) * deg2rad$1;
  }
  const cosh = Math.cos(hRad);
  const sinh = Math.sin(hRad);
  let Jroot = 0;
  if (cam162.J !== void 0) {
    Jroot = spow(cam162.J, 1 / 2) * 0.1;
  } else if (cam162.Q !== void 0) {
    Jroot = 0.25 * env.c * cam162.Q / ((env.aW + 4) * env.flRoot);
  }
  let alpha = 0;
  if (cam162.C !== void 0) {
    alpha = cam162.C / Jroot;
  } else if (cam162.M !== void 0) {
    alpha = cam162.M / env.flRoot / Jroot;
  } else if (cam162.s !== void 0) {
    alpha = 4e-4 * cam162.s ** 2 * (env.aW + 4) / env.c;
  }
  const t2 = spow(
    alpha * Math.pow(1.64 - Math.pow(0.29, env.n), -0.73),
    10 / 9
  );
  const et = 0.25 * (Math.cos(hRad + 2) + 3.8);
  const A = env.aW * spow(Jroot, 2 / env.c / env.z);
  const p1 = 5e4 / 13 * env.nc * env.ncb * et;
  const p2 = A / env.nbb;
  const r = 23 * (p2 + 0.305) * zdiv(t2, 23 * p1 + t2 * (11 * cosh + 108 * sinh));
  const a2 = r * cosh;
  const b2 = r * sinh;
  const rgb_c = unadapt(
    multiplyMatrices(m1, [p2, a2, b2]).map((c4) => {
      return c4 * 1 / 1403;
    }),
    env.fl
  );
  return multiplyMatrices(
    cat16Inv,
    rgb_c.map((c4, i) => {
      return c4 * env.dRgbInv[i];
    })
  ).map((c4) => {
    return c4 / 100;
  });
}
function toCam16(xyzd65, env) {
  const xyz100 = xyzd65.map((c4) => {
    return c4 * 100;
  });
  const rgbA = adapt$1(
    multiplyMatrices(cat16, xyz100).map((c4, i) => {
      return c4 * env.dRgb[i];
    }),
    env.fl
  );
  const a2 = rgbA[0] + (-12 * rgbA[1] + rgbA[2]) / 11;
  const b2 = (rgbA[0] + rgbA[1] - 2 * rgbA[2]) / 9;
  const hRad = (Math.atan2(b2, a2) % tau2 + tau2) % tau2;
  const et = 0.25 * (Math.cos(hRad + 2) + 3.8);
  const t2 = 5e4 / 13 * env.nc * env.ncb * zdiv(
    et * Math.sqrt(a2 ** 2 + b2 ** 2),
    rgbA[0] + rgbA[1] + 1.05 * rgbA[2] + 0.305
  );
  const alpha = spow(t2, 0.9) * Math.pow(1.64 - Math.pow(0.29, env.n), 0.73);
  const A = env.nbb * (2 * rgbA[0] + rgbA[1] + 0.05 * rgbA[2]);
  const Jroot = spow(A / env.aW, 0.5 * env.c * env.z);
  const J = 100 * spow(Jroot, 2);
  const Q = 4 / env.c * Jroot * (env.aW + 4) * env.flRoot;
  const C = alpha * Jroot;
  const M = C * env.flRoot;
  const h = constrain(hRad * rad2deg);
  const H = hueQuadrature(h);
  const s = 50 * spow(env.c * alpha / (env.aW + 4), 1 / 2);
  return { J, C, h, s, Q, M, H };
}
var cam16 = new ColorSpace({
  id: "cam16-jmh",
  cssId: "--cam16-jmh",
  name: "CAM16-JMh",
  coords: {
    j: {
      refRange: [0, 100],
      name: "J"
    },
    m: {
      refRange: [0, 105],
      name: "Colorfulness"
    },
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    }
  },
  base: xyz_d65,
  fromBase(xyz) {
    const cam162 = toCam16(xyz, viewingConditions$1);
    return [cam162.J, cam162.M, cam162.h];
  },
  toBase(cam162) {
    return fromCam16(
      { J: cam162[0], M: cam162[1], h: cam162[2] },
      viewingConditions$1
    );
  }
});
var white$2 = WHITES.D65;
var \u03B5$4 = 216 / 24389;
var \u03BA$3 = 24389 / 27;
function toLstar(y) {
  const fy = y > \u03B5$4 ? Math.cbrt(y) : (\u03BA$3 * y + 16) / 116;
  return 116 * fy - 16;
}
function fromLstar(lstar) {
  return lstar > 8 ? Math.pow((lstar + 16) / 116, 3) : lstar / \u03BA$3;
}
function fromHct(coords, env) {
  let [h, c4, t2] = coords;
  let xyz = [];
  let j = 0;
  if (t2 === 0) {
    return [0, 0, 0];
  }
  let y = fromLstar(t2);
  if (t2 > 0) {
    j = 0.00379058511492914 * t2 ** 2 + 0.608983189401032 * t2 + 0.9155088574762233;
  } else {
    j = 9514440756550361e-21 * t2 ** 2 + 0.08693057439788597 * t2 - 21.928975842194614;
  }
  const threshold = 2e-12;
  const max_attempts = 15;
  let attempt = 0;
  let last5 = Infinity;
  while (attempt <= max_attempts) {
    xyz = fromCam16({ J: j, C: c4, h }, env);
    const delta = Math.abs(xyz[1] - y);
    if (delta < last5) {
      if (delta <= threshold) {
        return xyz;
      }
      last5 = delta;
    }
    j = j - (xyz[1] - y) * j / (2 * xyz[1]);
    attempt += 1;
  }
  return fromCam16({ J: j, C: c4, h }, env);
}
function toHct(xyz, env) {
  const t2 = toLstar(xyz[1]);
  if (t2 === 0) {
    return [0, 0, 0];
  }
  const cam162 = toCam16(xyz, viewingConditions);
  return [constrain(cam162.h), cam162.C, t2];
}
var viewingConditions = environment(
  white$2,
  200 / Math.PI * fromLstar(50),
  fromLstar(50) * 100,
  "average",
  false
);
var hct = new ColorSpace({
  id: "hct",
  name: "HCT",
  coords: {
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    },
    c: {
      refRange: [0, 145],
      name: "Colorfulness"
    },
    t: {
      refRange: [0, 100],
      name: "Tone"
    }
  },
  base: xyz_d65,
  fromBase(xyz) {
    return toHct(xyz);
  },
  toBase(hct2) {
    return fromHct(hct2, viewingConditions);
  },
  formats: {
    color: {
      id: "--hct",
      coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"]
    }
  }
});
var deg2rad = Math.PI / 180;
var ucsCoeff = [1, 7e-3, 0.0228];
function convertUcsAb(coords) {
  if (coords[1] < 0) {
    coords = hct.fromBase(hct.toBase(coords));
  }
  const M = Math.log(Math.max(1 + ucsCoeff[2] * coords[1] * viewingConditions.flRoot, 1)) / ucsCoeff[2];
  const hrad = coords[0] * deg2rad;
  const a2 = M * Math.cos(hrad);
  const b2 = M * Math.sin(hrad);
  return [coords[2], a2, b2];
}
function deltaEHCT(color, sample2) {
  [color, sample2] = getColor([color, sample2]);
  let [t1, a1, b1] = convertUcsAb(hct.from(color));
  let [t2, a2, b2] = convertUcsAb(hct.from(sample2));
  return Math.sqrt((t1 - t2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}
var deltaEMethods = {
  deltaE76,
  deltaECMC,
  deltaE2000,
  deltaEJz,
  deltaEITP,
  deltaEOK,
  deltaEHCT
};
function calcEpsilon(jnd) {
  const order = !jnd ? 0 : Math.floor(Math.log10(Math.abs(jnd)));
  return Math.max(parseFloat(`1e${order - 2}`), 1e-6);
}
var GMAPPRESET = {
  "hct": {
    method: "hct.c",
    jnd: 2,
    deltaEMethod: "hct",
    blackWhiteClamp: {}
  },
  "hct-tonal": {
    method: "hct.c",
    jnd: 0,
    deltaEMethod: "hct",
    blackWhiteClamp: { channel: "hct.t", min: 0, max: 100 }
  }
};
function toGamut(color, {
  method = defaults.gamut_mapping,
  space = void 0,
  deltaEMethod = "",
  jnd = 2,
  blackWhiteClamp = {}
} = {}) {
  color = getColor(color);
  if (isString(arguments[1])) {
    space = arguments[1];
  } else if (!space) {
    space = color.space;
  }
  space = ColorSpace.get(space);
  if (inGamut(color, space, { epsilon: 0 })) {
    return color;
  }
  let spaceColor;
  if (method === "css") {
    spaceColor = toGamutCSS(color, { space });
  } else {
    if (method !== "clip" && !inGamut(color, space)) {
      if (Object.prototype.hasOwnProperty.call(GMAPPRESET, method)) {
        ({ method, jnd, deltaEMethod, blackWhiteClamp } = GMAPPRESET[method]);
      }
      let de = deltaE2000;
      if (deltaEMethod !== "") {
        for (let m3 in deltaEMethods) {
          if ("deltae" + deltaEMethod.toLowerCase() === m3.toLowerCase()) {
            de = deltaEMethods[m3];
            break;
          }
        }
      }
      let clipped = toGamut(to(color, space), { method: "clip", space });
      if (de(color, clipped) > jnd) {
        if (Object.keys(blackWhiteClamp).length === 3) {
          let channelMeta = ColorSpace.resolveCoord(blackWhiteClamp.channel);
          let channel = get2(to(color, channelMeta.space), channelMeta.id);
          if (isNone(channel)) {
            channel = 0;
          }
          if (channel >= blackWhiteClamp.max) {
            return to({ space: "xyz-d65", coords: WHITES["D65"] }, color.space);
          } else if (channel <= blackWhiteClamp.min) {
            return to({ space: "xyz-d65", coords: [0, 0, 0] }, color.space);
          }
        }
        let coordMeta = ColorSpace.resolveCoord(method);
        let mapSpace = coordMeta.space;
        let coordId = coordMeta.id;
        let mappedColor = to(color, mapSpace);
        mappedColor.coords.forEach((c4, i) => {
          if (isNone(c4)) {
            mappedColor.coords[i] = 0;
          }
        });
        let bounds = coordMeta.range || coordMeta.refRange;
        let min8 = bounds[0];
        let \u03B52 = calcEpsilon(jnd);
        let low = min8;
        let high = get2(mappedColor, coordId);
        while (high - low > \u03B52) {
          let clipped2 = clone2(mappedColor);
          clipped2 = toGamut(clipped2, { space, method: "clip" });
          let deltaE2 = de(mappedColor, clipped2);
          if (deltaE2 - jnd < \u03B52) {
            low = get2(mappedColor, coordId);
          } else {
            high = get2(mappedColor, coordId);
          }
          set4(mappedColor, coordId, (low + high) / 2);
        }
        spaceColor = to(mappedColor, space);
      } else {
        spaceColor = clipped;
      }
    } else {
      spaceColor = to(color, space);
    }
    if (method === "clip" || !inGamut(spaceColor, space, { epsilon: 0 })) {
      let bounds = Object.values(space.coords).map((c4) => c4.range || []);
      spaceColor.coords = spaceColor.coords.map((c4, i) => {
        let [min8, max9] = bounds[i];
        if (min8 !== void 0) {
          c4 = Math.max(min8, c4);
        }
        if (max9 !== void 0) {
          c4 = Math.min(c4, max9);
        }
        return c4;
      });
    }
  }
  if (space !== color.space) {
    spaceColor = to(spaceColor, color.space);
  }
  color.coords = spaceColor.coords;
  return color;
}
toGamut.returns = "color";
var COLORS = {
  WHITE: { space: OKLab, coords: [1, 0, 0] },
  BLACK: { space: OKLab, coords: [0, 0, 0] }
};
function toGamutCSS(origin, { space } = {}) {
  const JND = 0.02;
  const \u03B52 = 1e-4;
  origin = getColor(origin);
  if (!space) {
    space = origin.space;
  }
  space = ColorSpace.get(space);
  const oklchSpace = ColorSpace.get("oklch");
  if (space.isUnbounded) {
    return to(origin, space);
  }
  const origin_OKLCH = to(origin, oklchSpace);
  let L = origin_OKLCH.coords[0];
  if (L >= 1) {
    const white2 = to(COLORS.WHITE, space);
    white2.alpha = origin.alpha;
    return to(white2, space);
  }
  if (L <= 0) {
    const black = to(COLORS.BLACK, space);
    black.alpha = origin.alpha;
    return to(black, space);
  }
  if (inGamut(origin_OKLCH, space, { epsilon: 0 })) {
    return to(origin_OKLCH, space);
  }
  function clip(_color) {
    const destColor = to(_color, space);
    const spaceCoords = Object.values(space.coords);
    destColor.coords = destColor.coords.map((coord, index) => {
      if ("range" in spaceCoords[index]) {
        const [min9, max10] = spaceCoords[index].range;
        return clamp4(min9, coord, max10);
      }
      return coord;
    });
    return destColor;
  }
  let min8 = 0;
  let max9 = origin_OKLCH.coords[1];
  let min_inGamut = true;
  let current = clone2(origin_OKLCH);
  let clipped = clip(current);
  let E = deltaEOK(clipped, current);
  if (E < JND) {
    return clipped;
  }
  while (max9 - min8 > \u03B52) {
    const chroma = (min8 + max9) / 2;
    current.coords[1] = chroma;
    if (min_inGamut && inGamut(current, space, { epsilon: 0 })) {
      min8 = chroma;
    } else {
      clipped = clip(current);
      E = deltaEOK(clipped, current);
      if (E < JND) {
        if (JND - E < \u03B52) {
          break;
        } else {
          min_inGamut = false;
          min8 = chroma;
        }
      } else {
        max9 = chroma;
      }
    }
  }
  return clipped;
}
function to(color, space, { inGamut: inGamut2 } = {}) {
  color = getColor(color);
  space = ColorSpace.get(space);
  let coords = space.from(color);
  let ret = { space, coords, alpha: color.alpha };
  if (inGamut2) {
    ret = toGamut(ret, inGamut2 === true ? void 0 : inGamut2);
  }
  return ret;
}
to.returns = "color";
function serialize(color, {
  precision = defaults.precision,
  format = "default",
  inGamut: inGamut$1 = true,
  ...customOptions
} = {}) {
  let ret;
  color = getColor(color);
  let formatId = format;
  format = color.space.getFormat(format) ?? color.space.getFormat("default") ?? ColorSpace.DEFAULT_FORMAT;
  let coords = color.coords.slice();
  inGamut$1 ||= format.toGamut;
  if (inGamut$1 && !inGamut(color)) {
    coords = toGamut(clone2(color), inGamut$1 === true ? void 0 : inGamut$1).coords;
  }
  if (format.type === "custom") {
    customOptions.precision = precision;
    if (format.serialize) {
      ret = format.serialize(coords, color.alpha, customOptions);
    } else {
      throw new TypeError(`format ${formatId} can only be used to parse colors, not for serialization`);
    }
  } else {
    let name = format.name || "color";
    if (format.serializeCoords) {
      coords = format.serializeCoords(coords, precision);
    } else {
      if (precision !== null) {
        coords = coords.map((c4) => {
          return serializeNumber(c4, { precision });
        });
      }
    }
    let args = [...coords];
    if (name === "color") {
      let cssId = format.id || format.ids?.[0] || color.space.id;
      args.unshift(cssId);
    }
    let alpha = color.alpha;
    if (precision !== null) {
      alpha = serializeNumber(alpha, { precision });
    }
    let strAlpha = color.alpha >= 1 || format.noAlpha ? "" : `${format.commas ? "," : " /"} ${alpha}`;
    ret = `${name}(${args.join(format.commas ? ", " : " ")}${strAlpha})`;
  }
  return ret;
}
var toXYZ_M$5 = [
  [0.6369580483012914, 0.14461690358620832, 0.1688809751641721],
  [0.2627002120112671, 0.6779980715188708, 0.05930171646986196],
  [0, 0.028072693049087428, 1.060985057710791]
];
var fromXYZ_M$5 = [
  [1.716651187971268, -0.355670783776392, -0.25336628137366],
  [-0.666684351832489, 1.616481236634939, 0.0157685458139111],
  [0.017639857445311, -0.042770613257809, 0.942103121235474]
];
var REC2020Linear = new RGBColorSpace({
  id: "rec2020-linear",
  cssId: "--rec2020-linear",
  name: "Linear REC.2020",
  white: "D65",
  toXYZ_M: toXYZ_M$5,
  fromXYZ_M: fromXYZ_M$5
});
var \u03B1 = 1.09929682680944;
var \u03B2 = 0.018053968510807;
var REC2020 = new RGBColorSpace({
  id: "rec2020",
  name: "REC.2020",
  base: REC2020Linear,
  // Non-linear transfer function from Rec. ITU-R BT.2020-2 table 4
  toBase(RGB) {
    return RGB.map(function(val) {
      if (val < \u03B2 * 4.5) {
        return val / 4.5;
      }
      return Math.pow((val + \u03B1 - 1) / \u03B1, 1 / 0.45);
    });
  },
  fromBase(RGB) {
    return RGB.map(function(val) {
      if (val >= \u03B2) {
        return \u03B1 * Math.pow(val, 0.45) - (\u03B1 - 1);
      }
      return 4.5 * val;
    });
  }
});
var toXYZ_M$4 = [
  [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
  [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
  [0, 0.04511338185890264, 1.043944368900976]
];
var fromXYZ_M$4 = [
  [2.493496911941425, -0.9313836179191239, -0.40271078445071684],
  [-0.8294889695615747, 1.7626640603183463, 0.023624685841943577],
  [0.03584583024378447, -0.07617238926804182, 0.9568845240076872]
];
var P3Linear = new RGBColorSpace({
  id: "p3-linear",
  cssId: "--display-p3-linear",
  name: "Linear P3",
  white: "D65",
  toXYZ_M: toXYZ_M$4,
  fromXYZ_M: fromXYZ_M$4
});
var toXYZ_M$3 = [
  [0.41239079926595934, 0.357584339383878, 0.1804807884018343],
  [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
  [0.01933081871559182, 0.11919477979462598, 0.9505321522496607]
];
var fromXYZ_M$3 = [
  [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
  [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
  [0.05563007969699366, -0.20397695888897652, 1.0569715142428786]
];
var sRGBLinear = new RGBColorSpace({
  id: "srgb-linear",
  name: "Linear sRGB",
  white: "D65",
  toXYZ_M: toXYZ_M$3,
  fromXYZ_M: fromXYZ_M$3
});
var KEYWORDS = {
  "aliceblue": [240 / 255, 248 / 255, 1],
  "antiquewhite": [250 / 255, 235 / 255, 215 / 255],
  "aqua": [0, 1, 1],
  "aquamarine": [127 / 255, 1, 212 / 255],
  "azure": [240 / 255, 1, 1],
  "beige": [245 / 255, 245 / 255, 220 / 255],
  "bisque": [1, 228 / 255, 196 / 255],
  "black": [0, 0, 0],
  "blanchedalmond": [1, 235 / 255, 205 / 255],
  "blue": [0, 0, 1],
  "blueviolet": [138 / 255, 43 / 255, 226 / 255],
  "brown": [165 / 255, 42 / 255, 42 / 255],
  "burlywood": [222 / 255, 184 / 255, 135 / 255],
  "cadetblue": [95 / 255, 158 / 255, 160 / 255],
  "chartreuse": [127 / 255, 1, 0],
  "chocolate": [210 / 255, 105 / 255, 30 / 255],
  "coral": [1, 127 / 255, 80 / 255],
  "cornflowerblue": [100 / 255, 149 / 255, 237 / 255],
  "cornsilk": [1, 248 / 255, 220 / 255],
  "crimson": [220 / 255, 20 / 255, 60 / 255],
  "cyan": [0, 1, 1],
  "darkblue": [0, 0, 139 / 255],
  "darkcyan": [0, 139 / 255, 139 / 255],
  "darkgoldenrod": [184 / 255, 134 / 255, 11 / 255],
  "darkgray": [169 / 255, 169 / 255, 169 / 255],
  "darkgreen": [0, 100 / 255, 0],
  "darkgrey": [169 / 255, 169 / 255, 169 / 255],
  "darkkhaki": [189 / 255, 183 / 255, 107 / 255],
  "darkmagenta": [139 / 255, 0, 139 / 255],
  "darkolivegreen": [85 / 255, 107 / 255, 47 / 255],
  "darkorange": [1, 140 / 255, 0],
  "darkorchid": [153 / 255, 50 / 255, 204 / 255],
  "darkred": [139 / 255, 0, 0],
  "darksalmon": [233 / 255, 150 / 255, 122 / 255],
  "darkseagreen": [143 / 255, 188 / 255, 143 / 255],
  "darkslateblue": [72 / 255, 61 / 255, 139 / 255],
  "darkslategray": [47 / 255, 79 / 255, 79 / 255],
  "darkslategrey": [47 / 255, 79 / 255, 79 / 255],
  "darkturquoise": [0, 206 / 255, 209 / 255],
  "darkviolet": [148 / 255, 0, 211 / 255],
  "deeppink": [1, 20 / 255, 147 / 255],
  "deepskyblue": [0, 191 / 255, 1],
  "dimgray": [105 / 255, 105 / 255, 105 / 255],
  "dimgrey": [105 / 255, 105 / 255, 105 / 255],
  "dodgerblue": [30 / 255, 144 / 255, 1],
  "firebrick": [178 / 255, 34 / 255, 34 / 255],
  "floralwhite": [1, 250 / 255, 240 / 255],
  "forestgreen": [34 / 255, 139 / 255, 34 / 255],
  "fuchsia": [1, 0, 1],
  "gainsboro": [220 / 255, 220 / 255, 220 / 255],
  "ghostwhite": [248 / 255, 248 / 255, 1],
  "gold": [1, 215 / 255, 0],
  "goldenrod": [218 / 255, 165 / 255, 32 / 255],
  "gray": [128 / 255, 128 / 255, 128 / 255],
  "green": [0, 128 / 255, 0],
  "greenyellow": [173 / 255, 1, 47 / 255],
  "grey": [128 / 255, 128 / 255, 128 / 255],
  "honeydew": [240 / 255, 1, 240 / 255],
  "hotpink": [1, 105 / 255, 180 / 255],
  "indianred": [205 / 255, 92 / 255, 92 / 255],
  "indigo": [75 / 255, 0, 130 / 255],
  "ivory": [1, 1, 240 / 255],
  "khaki": [240 / 255, 230 / 255, 140 / 255],
  "lavender": [230 / 255, 230 / 255, 250 / 255],
  "lavenderblush": [1, 240 / 255, 245 / 255],
  "lawngreen": [124 / 255, 252 / 255, 0],
  "lemonchiffon": [1, 250 / 255, 205 / 255],
  "lightblue": [173 / 255, 216 / 255, 230 / 255],
  "lightcoral": [240 / 255, 128 / 255, 128 / 255],
  "lightcyan": [224 / 255, 1, 1],
  "lightgoldenrodyellow": [250 / 255, 250 / 255, 210 / 255],
  "lightgray": [211 / 255, 211 / 255, 211 / 255],
  "lightgreen": [144 / 255, 238 / 255, 144 / 255],
  "lightgrey": [211 / 255, 211 / 255, 211 / 255],
  "lightpink": [1, 182 / 255, 193 / 255],
  "lightsalmon": [1, 160 / 255, 122 / 255],
  "lightseagreen": [32 / 255, 178 / 255, 170 / 255],
  "lightskyblue": [135 / 255, 206 / 255, 250 / 255],
  "lightslategray": [119 / 255, 136 / 255, 153 / 255],
  "lightslategrey": [119 / 255, 136 / 255, 153 / 255],
  "lightsteelblue": [176 / 255, 196 / 255, 222 / 255],
  "lightyellow": [1, 1, 224 / 255],
  "lime": [0, 1, 0],
  "limegreen": [50 / 255, 205 / 255, 50 / 255],
  "linen": [250 / 255, 240 / 255, 230 / 255],
  "magenta": [1, 0, 1],
  "maroon": [128 / 255, 0, 0],
  "mediumaquamarine": [102 / 255, 205 / 255, 170 / 255],
  "mediumblue": [0, 0, 205 / 255],
  "mediumorchid": [186 / 255, 85 / 255, 211 / 255],
  "mediumpurple": [147 / 255, 112 / 255, 219 / 255],
  "mediumseagreen": [60 / 255, 179 / 255, 113 / 255],
  "mediumslateblue": [123 / 255, 104 / 255, 238 / 255],
  "mediumspringgreen": [0, 250 / 255, 154 / 255],
  "mediumturquoise": [72 / 255, 209 / 255, 204 / 255],
  "mediumvioletred": [199 / 255, 21 / 255, 133 / 255],
  "midnightblue": [25 / 255, 25 / 255, 112 / 255],
  "mintcream": [245 / 255, 1, 250 / 255],
  "mistyrose": [1, 228 / 255, 225 / 255],
  "moccasin": [1, 228 / 255, 181 / 255],
  "navajowhite": [1, 222 / 255, 173 / 255],
  "navy": [0, 0, 128 / 255],
  "oldlace": [253 / 255, 245 / 255, 230 / 255],
  "olive": [128 / 255, 128 / 255, 0],
  "olivedrab": [107 / 255, 142 / 255, 35 / 255],
  "orange": [1, 165 / 255, 0],
  "orangered": [1, 69 / 255, 0],
  "orchid": [218 / 255, 112 / 255, 214 / 255],
  "palegoldenrod": [238 / 255, 232 / 255, 170 / 255],
  "palegreen": [152 / 255, 251 / 255, 152 / 255],
  "paleturquoise": [175 / 255, 238 / 255, 238 / 255],
  "palevioletred": [219 / 255, 112 / 255, 147 / 255],
  "papayawhip": [1, 239 / 255, 213 / 255],
  "peachpuff": [1, 218 / 255, 185 / 255],
  "peru": [205 / 255, 133 / 255, 63 / 255],
  "pink": [1, 192 / 255, 203 / 255],
  "plum": [221 / 255, 160 / 255, 221 / 255],
  "powderblue": [176 / 255, 224 / 255, 230 / 255],
  "purple": [128 / 255, 0, 128 / 255],
  "rebeccapurple": [102 / 255, 51 / 255, 153 / 255],
  "red": [1, 0, 0],
  "rosybrown": [188 / 255, 143 / 255, 143 / 255],
  "royalblue": [65 / 255, 105 / 255, 225 / 255],
  "saddlebrown": [139 / 255, 69 / 255, 19 / 255],
  "salmon": [250 / 255, 128 / 255, 114 / 255],
  "sandybrown": [244 / 255, 164 / 255, 96 / 255],
  "seagreen": [46 / 255, 139 / 255, 87 / 255],
  "seashell": [1, 245 / 255, 238 / 255],
  "sienna": [160 / 255, 82 / 255, 45 / 255],
  "silver": [192 / 255, 192 / 255, 192 / 255],
  "skyblue": [135 / 255, 206 / 255, 235 / 255],
  "slateblue": [106 / 255, 90 / 255, 205 / 255],
  "slategray": [112 / 255, 128 / 255, 144 / 255],
  "slategrey": [112 / 255, 128 / 255, 144 / 255],
  "snow": [1, 250 / 255, 250 / 255],
  "springgreen": [0, 1, 127 / 255],
  "steelblue": [70 / 255, 130 / 255, 180 / 255],
  "tan": [210 / 255, 180 / 255, 140 / 255],
  "teal": [0, 128 / 255, 128 / 255],
  "thistle": [216 / 255, 191 / 255, 216 / 255],
  "tomato": [1, 99 / 255, 71 / 255],
  "turquoise": [64 / 255, 224 / 255, 208 / 255],
  "violet": [238 / 255, 130 / 255, 238 / 255],
  "wheat": [245 / 255, 222 / 255, 179 / 255],
  "white": [1, 1, 1],
  "whitesmoke": [245 / 255, 245 / 255, 245 / 255],
  "yellow": [1, 1, 0],
  "yellowgreen": [154 / 255, 205 / 255, 50 / 255]
};
var coordGrammar = Array(3).fill("<percentage> | <number>[0, 255]");
var coordGrammarNumber = Array(3).fill("<number>[0, 255]");
var sRGB = new RGBColorSpace({
  id: "srgb",
  name: "sRGB",
  base: sRGBLinear,
  fromBase: (rgb) => {
    return rgb.map((val) => {
      let sign = val < 0 ? -1 : 1;
      let abs4 = val * sign;
      if (abs4 > 31308e-7) {
        return sign * (1.055 * abs4 ** (1 / 2.4) - 0.055);
      }
      return 12.92 * val;
    });
  },
  toBase: (rgb) => {
    return rgb.map((val) => {
      let sign = val < 0 ? -1 : 1;
      let abs4 = val * sign;
      if (abs4 <= 0.04045) {
        return val / 12.92;
      }
      return sign * ((abs4 + 0.055) / 1.055) ** 2.4;
    });
  },
  formats: {
    "rgb": {
      coords: coordGrammar
    },
    "rgb_number": {
      name: "rgb",
      commas: true,
      coords: coordGrammarNumber,
      noAlpha: true
    },
    "color": {
      /* use defaults */
    },
    "rgba": {
      coords: coordGrammar,
      commas: true,
      lastAlpha: true
    },
    "rgba_number": {
      name: "rgba",
      commas: true,
      coords: coordGrammarNumber
    },
    "hex": {
      type: "custom",
      toGamut: true,
      test: (str) => /^#([a-f0-9]{3,4}){1,2}$/i.test(str),
      parse(str) {
        if (str.length <= 5) {
          str = str.replace(/[a-f0-9]/gi, "$&$&");
        }
        let rgba = [];
        str.replace(/[a-f0-9]{2}/gi, (component) => {
          rgba.push(parseInt(component, 16) / 255);
        });
        return {
          spaceId: "srgb",
          coords: rgba.slice(0, 3),
          alpha: rgba.slice(3)[0]
        };
      },
      serialize: (coords, alpha, {
        collapse = true
        // collapse to 3-4 digit hex when possible?
      } = {}) => {
        if (alpha < 1) {
          coords.push(alpha);
        }
        coords = coords.map((c4) => Math.round(c4 * 255));
        let collapsible = collapse && coords.every((c4) => c4 % 17 === 0);
        let hex = coords.map((c4) => {
          if (collapsible) {
            return (c4 / 17).toString(16);
          }
          return c4.toString(16).padStart(2, "0");
        }).join("");
        return "#" + hex;
      }
    },
    "keyword": {
      type: "custom",
      test: (str) => /^[a-z]+$/i.test(str),
      parse(str) {
        str = str.toLowerCase();
        let ret = { spaceId: "srgb", coords: null, alpha: 1 };
        if (str === "transparent") {
          ret.coords = KEYWORDS.black;
          ret.alpha = 0;
        } else {
          ret.coords = KEYWORDS[str];
        }
        if (ret.coords) {
          return ret;
        }
      }
    }
  }
});
var P3 = new RGBColorSpace({
  id: "p3",
  cssId: "display-p3",
  name: "P3",
  base: P3Linear,
  // Gamma encoding/decoding is the same as sRGB
  fromBase: sRGB.fromBase,
  toBase: sRGB.toBase
});
defaults.display_space = sRGB;
var supportsNone;
if (typeof CSS !== "undefined" && CSS.supports) {
  for (let space of [lab, REC2020, P3]) {
    let coords = space.getMinCoords();
    let color = { space, coords, alpha: 1 };
    let str = serialize(color);
    if (CSS.supports("color", str)) {
      defaults.display_space = space;
      break;
    }
  }
}
function display(color, { space = defaults.display_space, ...options } = {}) {
  let ret = serialize(color, options);
  if (typeof CSS === "undefined" || CSS.supports("color", ret) || !defaults.display_space) {
    ret = new String(ret);
    ret.color = color;
  } else {
    let fallbackColor = color;
    let hasNone = color.coords.some(isNone) || isNone(color.alpha);
    if (hasNone) {
      if (!(supportsNone ??= CSS.supports("color", "hsl(none 50% 50%)"))) {
        fallbackColor = clone2(color);
        fallbackColor.coords = fallbackColor.coords.map(skipNone);
        fallbackColor.alpha = skipNone(fallbackColor.alpha);
        ret = serialize(fallbackColor, options);
        if (CSS.supports("color", ret)) {
          ret = new String(ret);
          ret.color = fallbackColor;
          return ret;
        }
      }
    }
    fallbackColor = to(fallbackColor, space);
    ret = new String(serialize(fallbackColor, options));
    ret.color = fallbackColor;
  }
  return ret;
}
function equals3(color1, color2) {
  color1 = getColor(color1);
  color2 = getColor(color2);
  return color1.space === color2.space && color1.alpha === color2.alpha && color1.coords.every((c4, i) => c4 === color2.coords[i]);
}
function getLuminance(color) {
  return get2(color, [xyz_d65, "y"]);
}
function setLuminance(color, value) {
  set4(color, [xyz_d65, "y"], value);
}
function register$2(Color2) {
  Object.defineProperty(Color2.prototype, "luminance", {
    get() {
      return getLuminance(this);
    },
    set(value) {
      setLuminance(this, value);
    }
  });
}
var luminance = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  getLuminance,
  register: register$2,
  setLuminance
});
function contrastWCAG21(color1, color2) {
  color1 = getColor(color1);
  color2 = getColor(color2);
  let Y1 = Math.max(getLuminance(color1), 0);
  let Y2 = Math.max(getLuminance(color2), 0);
  if (Y2 > Y1) {
    [Y1, Y2] = [Y2, Y1];
  }
  return (Y1 + 0.05) / (Y2 + 0.05);
}
var normBG = 0.56;
var normTXT = 0.57;
var revTXT = 0.62;
var revBG = 0.65;
var blkThrs = 0.022;
var blkClmp = 1.414;
var loClip = 0.1;
var deltaYmin = 5e-4;
var scaleBoW = 1.14;
var loBoWoffset = 0.027;
var scaleWoB = 1.14;
function fclamp(Y) {
  if (Y >= blkThrs) {
    return Y;
  }
  return Y + (blkThrs - Y) ** blkClmp;
}
function linearize(val) {
  let sign = val < 0 ? -1 : 1;
  let abs4 = Math.abs(val);
  return sign * Math.pow(abs4, 2.4);
}
function contrastAPCA(background, foreground) {
  foreground = getColor(foreground);
  background = getColor(background);
  let S;
  let C;
  let Sapc;
  let R, G, B;
  foreground = to(foreground, "srgb");
  [R, G, B] = foreground.coords;
  let lumTxt = linearize(R) * 0.2126729 + linearize(G) * 0.7151522 + linearize(B) * 0.072175;
  background = to(background, "srgb");
  [R, G, B] = background.coords;
  let lumBg = linearize(R) * 0.2126729 + linearize(G) * 0.7151522 + linearize(B) * 0.072175;
  let Ytxt = fclamp(lumTxt);
  let Ybg = fclamp(lumBg);
  let BoW = Ybg > Ytxt;
  if (Math.abs(Ybg - Ytxt) < deltaYmin) {
    C = 0;
  } else {
    if (BoW) {
      S = Ybg ** normBG - Ytxt ** normTXT;
      C = S * scaleBoW;
    } else {
      S = Ybg ** revBG - Ytxt ** revTXT;
      C = S * scaleWoB;
    }
  }
  if (Math.abs(C) < loClip) {
    Sapc = 0;
  } else if (C > 0) {
    Sapc = C - loBoWoffset;
  } else {
    Sapc = C + loBoWoffset;
  }
  return Sapc * 100;
}
function contrastMichelson(color1, color2) {
  color1 = getColor(color1);
  color2 = getColor(color2);
  let Y1 = Math.max(getLuminance(color1), 0);
  let Y2 = Math.max(getLuminance(color2), 0);
  if (Y2 > Y1) {
    [Y1, Y2] = [Y2, Y1];
  }
  let denom = Y1 + Y2;
  return denom === 0 ? 0 : (Y1 - Y2) / denom;
}
var max6 = 5e4;
function contrastWeber(color1, color2) {
  color1 = getColor(color1);
  color2 = getColor(color2);
  let Y1 = Math.max(getLuminance(color1), 0);
  let Y2 = Math.max(getLuminance(color2), 0);
  if (Y2 > Y1) {
    [Y1, Y2] = [Y2, Y1];
  }
  return Y2 === 0 ? max6 : (Y1 - Y2) / Y2;
}
function contrastLstar(color1, color2) {
  color1 = getColor(color1);
  color2 = getColor(color2);
  let L1 = get2(color1, [lab, "l"]);
  let L2 = get2(color2, [lab, "l"]);
  return Math.abs(L1 - L2);
}
var \u03B5$3 = 216 / 24389;
var \u03B53 = 24 / 116;
var \u03BA$2 = 24389 / 27;
var white$1 = WHITES.D65;
var lab_d65 = new ColorSpace({
  id: "lab-d65",
  name: "Lab D65",
  coords: {
    l: {
      refRange: [0, 100],
      name: "Lightness"
    },
    a: {
      refRange: [-125, 125]
    },
    b: {
      refRange: [-125, 125]
    }
  },
  // Assuming XYZ is relative to D65, convert to CIE Lab
  // from CIE standard, which now defines these as a rational fraction
  white: white$1,
  base: xyz_d65,
  // Convert D65-adapted XYZ to Lab
  //  CIE 15.3:2004 section 8.2.1.1
  fromBase(XYZ) {
    let xyz = XYZ.map((value, i) => value / white$1[i]);
    let f = xyz.map((value) => value > \u03B5$3 ? Math.cbrt(value) : (\u03BA$2 * value + 16) / 116);
    return [
      116 * f[1] - 16,
      // L
      500 * (f[0] - f[1]),
      // a
      200 * (f[1] - f[2])
      // b
    ];
  },
  // Convert Lab to D65-adapted XYZ
  // Same result as CIE 15.3:2004 Appendix D although the derivation is different
  // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
  toBase(Lab) {
    let f = [];
    f[1] = (Lab[0] + 16) / 116;
    f[0] = Lab[1] / 500 + f[1];
    f[2] = f[1] - Lab[2] / 200;
    let xyz = [
      f[0] > \u03B53 ? Math.pow(f[0], 3) : (116 * f[0] - 16) / \u03BA$2,
      Lab[0] > 8 ? Math.pow((Lab[0] + 16) / 116, 3) : Lab[0] / \u03BA$2,
      f[2] > \u03B53 ? Math.pow(f[2], 3) : (116 * f[2] - 16) / \u03BA$2
    ];
    return xyz.map((value, i) => value * white$1[i]);
  },
  formats: {
    "lab-d65": {
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
var phi = Math.pow(5, 0.5) * 0.5 + 0.5;
function contrastDeltaPhi(color1, color2) {
  color1 = getColor(color1);
  color2 = getColor(color2);
  let Lstr1 = get2(color1, [lab_d65, "l"]);
  let Lstr2 = get2(color2, [lab_d65, "l"]);
  let deltaPhiStar = Math.abs(Math.pow(Lstr1, phi) - Math.pow(Lstr2, phi));
  let contrast2 = Math.pow(deltaPhiStar, 1 / phi) * Math.SQRT2 - 40;
  return contrast2 < 7.5 ? 0 : contrast2;
}
var contrastMethods = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  contrastAPCA,
  contrastDeltaPhi,
  contrastLstar,
  contrastMichelson,
  contrastWCAG21,
  contrastWeber
});
function contrast(background, foreground, o = {}) {
  if (isString(o)) {
    o = { algorithm: o };
  }
  let { algorithm, ...rest } = o;
  if (!algorithm) {
    let algorithms = Object.keys(contrastMethods).map((a2) => a2.replace(/^contrast/, "")).join(", ");
    throw new TypeError(`contrast() function needs a contrast algorithm. Please specify one of: ${algorithms}`);
  }
  background = getColor(background);
  foreground = getColor(foreground);
  for (let a2 in contrastMethods) {
    if ("contrast" + algorithm.toLowerCase() === a2.toLowerCase()) {
      return contrastMethods[a2](background, foreground, rest);
    }
  }
  throw new TypeError(`Unknown contrast algorithm: ${algorithm}`);
}
function uv(color) {
  let [X, Y, Z] = getAll(color, xyz_d65);
  let denom = X + 15 * Y + 3 * Z;
  return [4 * X / denom, 9 * Y / denom];
}
function xy(color) {
  let [X, Y, Z] = getAll(color, xyz_d65);
  let sum7 = X + Y + Z;
  return [X / sum7, Y / sum7];
}
function register$1(Color2) {
  Object.defineProperty(Color2.prototype, "uv", {
    get() {
      return uv(this);
    }
  });
  Object.defineProperty(Color2.prototype, "xy", {
    get() {
      return xy(this);
    }
  });
}
var chromaticity = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  register: register$1,
  uv,
  xy
});
function deltaE(c12, c22, o = {}) {
  if (isString(o)) {
    o = { method: o };
  }
  let { method = defaults.deltaE, ...rest } = o;
  for (let m3 in deltaEMethods) {
    if ("deltae" + method.toLowerCase() === m3.toLowerCase()) {
      return deltaEMethods[m3](c12, c22, rest);
    }
  }
  throw new TypeError(`Unknown deltaE method: ${method}`);
}
function lighten(color, amount = 0.25) {
  let space = ColorSpace.get("oklch", "lch");
  let lightness = [space, "l"];
  return set4(color, lightness, (l) => l * (1 + amount));
}
function darken(color, amount = 0.25) {
  let space = ColorSpace.get("oklch", "lch");
  let lightness = [space, "l"];
  return set4(color, lightness, (l) => l * (1 - amount));
}
var variations = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  darken,
  lighten
});
function mix(c12, c22, p2 = 0.5, o = {}) {
  [c12, c22] = [getColor(c12), getColor(c22)];
  if (type(p2) === "object") {
    [p2, o] = [0.5, p2];
  }
  let r = range(c12, c22, o);
  return r(p2);
}
function steps(c12, c22, options = {}) {
  let colorRange;
  if (isRange(c12)) {
    [colorRange, options] = [c12, c22];
    [c12, c22] = colorRange.rangeArgs.colors;
  }
  let {
    maxDeltaE,
    deltaEMethod,
    steps: steps2 = 2,
    maxSteps = 1e3,
    ...rangeOptions
  } = options;
  if (!colorRange) {
    [c12, c22] = [getColor(c12), getColor(c22)];
    colorRange = range(c12, c22, rangeOptions);
  }
  let totalDelta = deltaE(c12, c22);
  let actualSteps = maxDeltaE > 0 ? Math.max(steps2, Math.ceil(totalDelta / maxDeltaE) + 1) : steps2;
  let ret = [];
  if (maxSteps !== void 0) {
    actualSteps = Math.min(actualSteps, maxSteps);
  }
  if (actualSteps === 1) {
    ret = [{ p: 0.5, color: colorRange(0.5) }];
  } else {
    let step = 1 / (actualSteps - 1);
    ret = Array.from({ length: actualSteps }, (_, i) => {
      let p2 = i * step;
      return { p: p2, color: colorRange(p2) };
    });
  }
  if (maxDeltaE > 0) {
    let maxDelta = ret.reduce((acc, cur, i) => {
      if (i === 0) {
        return 0;
      }
      let \u0394\u0395 = deltaE(cur.color, ret[i - 1].color, deltaEMethod);
      return Math.max(acc, \u0394\u0395);
    }, 0);
    while (maxDelta > maxDeltaE) {
      maxDelta = 0;
      for (let i = 1; i < ret.length && ret.length < maxSteps; i++) {
        let prev = ret[i - 1];
        let cur = ret[i];
        let p2 = (cur.p + prev.p) / 2;
        let color = colorRange(p2);
        maxDelta = Math.max(maxDelta, deltaE(color, prev.color), deltaE(color, cur.color));
        ret.splice(i, 0, { p: p2, color: colorRange(p2) });
        i++;
      }
    }
  }
  ret = ret.map((a2) => a2.color);
  return ret;
}
function range(color1, color2, options = {}) {
  if (isRange(color1)) {
    let [r, options2] = [color1, color2];
    return range(...r.rangeArgs.colors, { ...r.rangeArgs.options, ...options2 });
  }
  let { space, outputSpace, progression, premultiplied } = options;
  color1 = getColor(color1);
  color2 = getColor(color2);
  color1 = clone2(color1);
  color2 = clone2(color2);
  let rangeArgs = { colors: [color1, color2], options };
  if (space) {
    space = ColorSpace.get(space);
  } else {
    space = ColorSpace.registry[defaults.interpolationSpace] || color1.space;
  }
  outputSpace = outputSpace ? ColorSpace.get(outputSpace) : space;
  color1 = to(color1, space);
  color2 = to(color2, space);
  color1 = toGamut(color1);
  color2 = toGamut(color2);
  if (space.coords.h && space.coords.h.type === "angle") {
    let arc2 = options.hue = options.hue || "shorter";
    let hue = [space, "h"];
    let [\u03B81, \u03B82] = [get2(color1, hue), get2(color2, hue)];
    if (isNaN(\u03B81) && !isNaN(\u03B82)) {
      \u03B81 = \u03B82;
    } else if (isNaN(\u03B82) && !isNaN(\u03B81)) {
      \u03B82 = \u03B81;
    }
    [\u03B81, \u03B82] = adjust(arc2, [\u03B81, \u03B82]);
    set4(color1, hue, \u03B81);
    set4(color2, hue, \u03B82);
  }
  if (premultiplied) {
    color1.coords = color1.coords.map((c4) => c4 * color1.alpha);
    color2.coords = color2.coords.map((c4) => c4 * color2.alpha);
  }
  return Object.assign((p2) => {
    p2 = progression ? progression(p2) : p2;
    let coords = color1.coords.map((start, i) => {
      let end = color2.coords[i];
      return interpolate7(start, end, p2);
    });
    let alpha = interpolate7(color1.alpha, color2.alpha, p2);
    let ret = { space, coords, alpha };
    if (premultiplied) {
      ret.coords = ret.coords.map((c4) => c4 / alpha);
    }
    if (outputSpace !== space) {
      ret = to(ret, outputSpace);
    }
    return ret;
  }, {
    rangeArgs
  });
}
function isRange(val) {
  return type(val) === "function" && !!val.rangeArgs;
}
defaults.interpolationSpace = "lab";
function register(Color2) {
  Color2.defineFunction("mix", mix, { returns: "color" });
  Color2.defineFunction("range", range, { returns: "function<color>" });
  Color2.defineFunction("steps", steps, { returns: "array<color>" });
}
var interpolation = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  isRange,
  mix,
  range,
  register,
  steps
});
var HSL = new ColorSpace({
  id: "hsl",
  name: "HSL",
  coords: {
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    },
    s: {
      range: [0, 100],
      name: "Saturation"
    },
    l: {
      range: [0, 100],
      name: "Lightness"
    }
  },
  base: sRGB,
  // Adapted from https://drafts.csswg.org/css-color-4/better-rgbToHsl.js
  fromBase: (rgb) => {
    let max9 = Math.max(...rgb);
    let min8 = Math.min(...rgb);
    let [r, g2, b2] = rgb;
    let [h, s, l] = [NaN, 0, (min8 + max9) / 2];
    let d2 = max9 - min8;
    if (d2 !== 0) {
      s = l === 0 || l === 1 ? 0 : (max9 - l) / Math.min(l, 1 - l);
      switch (max9) {
        case r:
          h = (g2 - b2) / d2 + (g2 < b2 ? 6 : 0);
          break;
        case g2:
          h = (b2 - r) / d2 + 2;
          break;
        case b2:
          h = (r - g2) / d2 + 4;
      }
      h = h * 60;
    }
    if (s < 0) {
      h += 180;
      s = Math.abs(s);
    }
    if (h >= 360) {
      h -= 360;
    }
    return [h, s * 100, l * 100];
  },
  // Adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative
  toBase: (hsl) => {
    let [h, s, l] = hsl;
    h = h % 360;
    if (h < 0) {
      h += 360;
    }
    s /= 100;
    l /= 100;
    function f(n2) {
      let k = (n2 + h / 30) % 12;
      let a2 = s * Math.min(l, 1 - l);
      return l - a2 * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    }
    return [f(0), f(8), f(4)];
  },
  formats: {
    "hsl": {
      coords: ["<number> | <angle>", "<percentage>", "<percentage>"]
    },
    "hsla": {
      coords: ["<number> | <angle>", "<percentage>", "<percentage>"],
      commas: true,
      lastAlpha: true
    }
  }
});
var HSV = new ColorSpace({
  id: "hsv",
  name: "HSV",
  coords: {
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    },
    s: {
      range: [0, 100],
      name: "Saturation"
    },
    v: {
      range: [0, 100],
      name: "Value"
    }
  },
  base: HSL,
  // https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
  fromBase(hsl) {
    let [h, s, l] = hsl;
    s /= 100;
    l /= 100;
    let v = l + s * Math.min(l, 1 - l);
    return [
      h,
      // h is the same
      v === 0 ? 0 : 200 * (1 - l / v),
      // s
      100 * v
    ];
  },
  // https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
  toBase(hsv) {
    let [h, s, v] = hsv;
    s /= 100;
    v /= 100;
    let l = v * (1 - s / 2);
    return [
      h,
      // h is the same
      l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l) * 100,
      l * 100
    ];
  },
  formats: {
    color: {
      id: "--hsv",
      coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"]
    }
  }
});
var hwb = new ColorSpace({
  id: "hwb",
  name: "HWB",
  coords: {
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    },
    w: {
      range: [0, 100],
      name: "Whiteness"
    },
    b: {
      range: [0, 100],
      name: "Blackness"
    }
  },
  base: HSV,
  fromBase(hsv) {
    let [h, s, v] = hsv;
    return [h, v * (100 - s) / 100, 100 - v];
  },
  toBase(hwb2) {
    let [h, w, b2] = hwb2;
    w /= 100;
    b2 /= 100;
    let sum7 = w + b2;
    if (sum7 >= 1) {
      let gray = w / sum7;
      return [h, 0, gray * 100];
    }
    let v = 1 - b2;
    let s = v === 0 ? 0 : 1 - w / v;
    return [h, s * 100, v * 100];
  },
  formats: {
    "hwb": {
      coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"]
    }
  }
});
var toXYZ_M$2 = [
  [0.5766690429101305, 0.1855582379065463, 0.1882286462349947],
  [0.29734497525053605, 0.6273635662554661, 0.07529145849399788],
  [0.02703136138641234, 0.07068885253582723, 0.9913375368376388]
];
var fromXYZ_M$2 = [
  [2.0415879038107465, -0.5650069742788596, -0.34473135077832956],
  [-0.9692436362808795, 1.8759675015077202, 0.04155505740717557],
  [0.013444280632031142, -0.11836239223101838, 1.0151749943912054]
];
var A98Linear = new RGBColorSpace({
  id: "a98rgb-linear",
  cssId: "--a98-rgb-linear",
  name: "Linear Adobe\xAE 98 RGB compatible",
  white: "D65",
  toXYZ_M: toXYZ_M$2,
  fromXYZ_M: fromXYZ_M$2
});
var a98rgb = new RGBColorSpace({
  id: "a98rgb",
  cssId: "a98-rgb",
  name: "Adobe\xAE 98 RGB compatible",
  base: A98Linear,
  toBase: (RGB) => RGB.map((val) => Math.pow(Math.abs(val), 563 / 256) * Math.sign(val)),
  fromBase: (RGB) => RGB.map((val) => Math.pow(Math.abs(val), 256 / 563) * Math.sign(val))
});
var toXYZ_M$1 = [
  [0.7977666449006423, 0.13518129740053308, 0.0313477341283922],
  [0.2880748288194013, 0.711835234241873, 8993693872564e-17],
  [0, 0, 0.8251046025104602]
];
var fromXYZ_M$1 = [
  [1.3457868816471583, -0.25557208737979464, -0.05110186497554526],
  [-0.5446307051249019, 1.5082477428451468, 0.02052744743642139],
  [0, 0, 1.2119675456389452]
];
var ProPhotoLinear = new RGBColorSpace({
  id: "prophoto-linear",
  cssId: "--prophoto-rgb-linear",
  name: "Linear ProPhoto",
  white: "D50",
  base: XYZ_D50,
  toXYZ_M: toXYZ_M$1,
  fromXYZ_M: fromXYZ_M$1
});
var Et = 1 / 512;
var Et2 = 16 / 512;
var prophoto = new RGBColorSpace({
  id: "prophoto",
  cssId: "prophoto-rgb",
  name: "ProPhoto",
  base: ProPhotoLinear,
  toBase(RGB) {
    return RGB.map((v) => v < Et2 ? v / 16 : v ** 1.8);
  },
  fromBase(RGB) {
    return RGB.map((v) => v >= Et ? v ** (1 / 1.8) : 16 * v);
  }
});
var oklch = new ColorSpace({
  id: "oklch",
  name: "Oklch",
  coords: {
    l: {
      refRange: [0, 1],
      name: "Lightness"
    },
    c: {
      refRange: [0, 0.4],
      name: "Chroma"
    },
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    }
  },
  white: "D65",
  base: OKLab,
  fromBase(oklab) {
    let [L, a2, b2] = oklab;
    let h;
    const \u03B52 = 2e-4;
    if (Math.abs(a2) < \u03B52 && Math.abs(b2) < \u03B52) {
      h = NaN;
    } else {
      h = Math.atan2(b2, a2) * 180 / Math.PI;
    }
    return [
      L,
      // OKLab L is still L
      Math.sqrt(a2 ** 2 + b2 ** 2),
      // Chroma
      constrain(h)
      // Hue, in degrees [0 to 360)
    ];
  },
  // Convert from polar form
  toBase(oklch2) {
    let [L, C, h] = oklch2;
    let a2, b2;
    if (isNaN(h)) {
      a2 = 0;
      b2 = 0;
    } else {
      a2 = C * Math.cos(h * Math.PI / 180);
      b2 = C * Math.sin(h * Math.PI / 180);
    }
    return [L, a2, b2];
  },
  formats: {
    "oklch": {
      coords: ["<percentage> | <number>", "<number> | <percentage>[0,1]", "<number> | <angle>"]
    }
  }
});
var white = WHITES.D65;
var \u03B5$2 = 216 / 24389;
var \u03BA$1 = 24389 / 27;
var [U_PRIME_WHITE, V_PRIME_WHITE] = uv({ space: xyz_d65, coords: white });
var Luv = new ColorSpace({
  id: "luv",
  name: "Luv",
  coords: {
    l: {
      refRange: [0, 100],
      name: "Lightness"
    },
    // Reference ranges from https://facelessuser.github.io/coloraide/colors/luv/
    u: {
      refRange: [-215, 215]
    },
    v: {
      refRange: [-215, 215]
    }
  },
  white,
  base: xyz_d65,
  // Convert D65-adapted XYZ to Luv
  // https://en.wikipedia.org/wiki/CIELUV#The_forward_transformation
  fromBase(XYZ) {
    let xyz = [skipNone(XYZ[0]), skipNone(XYZ[1]), skipNone(XYZ[2])];
    let y = xyz[1];
    let [up, vp] = uv({ space: xyz_d65, coords: xyz });
    if (!Number.isFinite(up) || !Number.isFinite(vp)) {
      return [0, 0, 0];
    }
    let L = y <= \u03B5$2 ? \u03BA$1 * y : 116 * Math.cbrt(y) - 16;
    return [
      L,
      13 * L * (up - U_PRIME_WHITE),
      13 * L * (vp - V_PRIME_WHITE)
    ];
  },
  // Convert Luv to D65-adapted XYZ
  // https://en.wikipedia.org/wiki/CIELUV#The_reverse_transformation
  toBase(Luv2) {
    let [L, u, v] = Luv2;
    if (L === 0 || isNone(L)) {
      return [0, 0, 0];
    }
    u = skipNone(u);
    v = skipNone(v);
    let up = u / (13 * L) + U_PRIME_WHITE;
    let vp = v / (13 * L) + V_PRIME_WHITE;
    let y = L <= 8 ? L / \u03BA$1 : Math.pow((L + 16) / 116, 3);
    return [
      y * (9 * up / (4 * vp)),
      y,
      y * ((12 - 3 * up - 20 * vp) / (4 * vp))
    ];
  },
  formats: {
    color: {
      id: "--luv",
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
var LCHuv = new ColorSpace({
  id: "lchuv",
  name: "LChuv",
  coords: {
    l: {
      refRange: [0, 100],
      name: "Lightness"
    },
    c: {
      refRange: [0, 220],
      name: "Chroma"
    },
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    }
  },
  base: Luv,
  fromBase(Luv2) {
    let [L, u, v] = Luv2;
    let hue;
    const \u03B52 = 0.02;
    if (Math.abs(u) < \u03B52 && Math.abs(v) < \u03B52) {
      hue = NaN;
    } else {
      hue = Math.atan2(v, u) * 180 / Math.PI;
    }
    return [
      L,
      // L is still L
      Math.sqrt(u ** 2 + v ** 2),
      // Chroma
      constrain(hue)
      // Hue, in degrees [0 to 360)
    ];
  },
  toBase(LCH) {
    let [Lightness, Chroma, Hue] = LCH;
    if (Chroma < 0) {
      Chroma = 0;
    }
    if (isNaN(Hue)) {
      Hue = 0;
    }
    return [
      Lightness,
      // L is still L
      Chroma * Math.cos(Hue * Math.PI / 180),
      // u
      Chroma * Math.sin(Hue * Math.PI / 180)
      // v
    ];
  },
  formats: {
    color: {
      id: "--lchuv",
      coords: ["<number> | <percentage>", "<number> | <percentage>", "<number> | <angle>"]
    }
  }
});
var \u03B5$1 = 216 / 24389;
var \u03BA = 24389 / 27;
var m_r0 = fromXYZ_M$3[0][0];
var m_r1 = fromXYZ_M$3[0][1];
var m_r2 = fromXYZ_M$3[0][2];
var m_g0 = fromXYZ_M$3[1][0];
var m_g1 = fromXYZ_M$3[1][1];
var m_g2 = fromXYZ_M$3[1][2];
var m_b0 = fromXYZ_M$3[2][0];
var m_b1 = fromXYZ_M$3[2][1];
var m_b2 = fromXYZ_M$3[2][2];
function distanceFromOriginAngle(slope2, intercept, angle) {
  const d2 = intercept / (Math.sin(angle) - slope2 * Math.cos(angle));
  return d2 < 0 ? Infinity : d2;
}
function calculateBoundingLines(l) {
  const sub1 = Math.pow(l + 16, 3) / 1560896;
  const sub2 = sub1 > \u03B5$1 ? sub1 : l / \u03BA;
  const s1r = sub2 * (284517 * m_r0 - 94839 * m_r2);
  const s2r = sub2 * (838422 * m_r2 + 769860 * m_r1 + 731718 * m_r0);
  const s3r = sub2 * (632260 * m_r2 - 126452 * m_r1);
  const s1g = sub2 * (284517 * m_g0 - 94839 * m_g2);
  const s2g = sub2 * (838422 * m_g2 + 769860 * m_g1 + 731718 * m_g0);
  const s3g = sub2 * (632260 * m_g2 - 126452 * m_g1);
  const s1b = sub2 * (284517 * m_b0 - 94839 * m_b2);
  const s2b = sub2 * (838422 * m_b2 + 769860 * m_b1 + 731718 * m_b0);
  const s3b = sub2 * (632260 * m_b2 - 126452 * m_b1);
  return {
    r0s: s1r / s3r,
    r0i: s2r * l / s3r,
    r1s: s1r / (s3r + 126452),
    r1i: (s2r - 769860) * l / (s3r + 126452),
    g0s: s1g / s3g,
    g0i: s2g * l / s3g,
    g1s: s1g / (s3g + 126452),
    g1i: (s2g - 769860) * l / (s3g + 126452),
    b0s: s1b / s3b,
    b0i: s2b * l / s3b,
    b1s: s1b / (s3b + 126452),
    b1i: (s2b - 769860) * l / (s3b + 126452)
  };
}
function calcMaxChromaHsluv(lines, h) {
  const hueRad = h / 360 * Math.PI * 2;
  const r0 = distanceFromOriginAngle(lines.r0s, lines.r0i, hueRad);
  const r1 = distanceFromOriginAngle(lines.r1s, lines.r1i, hueRad);
  const g0 = distanceFromOriginAngle(lines.g0s, lines.g0i, hueRad);
  const g1 = distanceFromOriginAngle(lines.g1s, lines.g1i, hueRad);
  const b0 = distanceFromOriginAngle(lines.b0s, lines.b0i, hueRad);
  const b1 = distanceFromOriginAngle(lines.b1s, lines.b1i, hueRad);
  return Math.min(r0, r1, g0, g1, b0, b1);
}
var hsluv = new ColorSpace({
  id: "hsluv",
  name: "HSLuv",
  coords: {
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    },
    s: {
      range: [0, 100],
      name: "Saturation"
    },
    l: {
      range: [0, 100],
      name: "Lightness"
    }
  },
  base: LCHuv,
  gamutSpace: sRGB,
  // Convert LCHuv to HSLuv
  fromBase(lch2) {
    let [l, c4, h] = [skipNone(lch2[0]), skipNone(lch2[1]), skipNone(lch2[2])];
    let s;
    if (l > 99.9999999) {
      s = 0;
      l = 100;
    } else if (l < 1e-8) {
      s = 0;
      l = 0;
    } else {
      let lines = calculateBoundingLines(l);
      let max9 = calcMaxChromaHsluv(lines, h);
      s = c4 / max9 * 100;
    }
    return [h, s, l];
  },
  // Convert HSLuv to LCHuv
  toBase(hsl) {
    let [h, s, l] = [skipNone(hsl[0]), skipNone(hsl[1]), skipNone(hsl[2])];
    let c4;
    if (l > 99.9999999) {
      l = 100;
      c4 = 0;
    } else if (l < 1e-8) {
      l = 0;
      c4 = 0;
    } else {
      let lines = calculateBoundingLines(l);
      let max9 = calcMaxChromaHsluv(lines, h);
      c4 = max9 / 100 * s;
    }
    return [l, c4, h];
  },
  formats: {
    color: {
      id: "--hsluv",
      coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"]
    }
  }
});
fromXYZ_M$3[0][0];
fromXYZ_M$3[0][1];
fromXYZ_M$3[0][2];
fromXYZ_M$3[1][0];
fromXYZ_M$3[1][1];
fromXYZ_M$3[1][2];
fromXYZ_M$3[2][0];
fromXYZ_M$3[2][1];
fromXYZ_M$3[2][2];
function distanceFromOrigin(slope2, intercept) {
  return Math.abs(intercept) / Math.sqrt(Math.pow(slope2, 2) + 1);
}
function calcMaxChromaHpluv(lines) {
  let r0 = distanceFromOrigin(lines.r0s, lines.r0i);
  let r1 = distanceFromOrigin(lines.r1s, lines.r1i);
  let g0 = distanceFromOrigin(lines.g0s, lines.g0i);
  let g1 = distanceFromOrigin(lines.g1s, lines.g1i);
  let b0 = distanceFromOrigin(lines.b0s, lines.b0i);
  let b1 = distanceFromOrigin(lines.b1s, lines.b1i);
  return Math.min(r0, r1, g0, g1, b0, b1);
}
var hpluv = new ColorSpace({
  id: "hpluv",
  name: "HPLuv",
  coords: {
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    },
    s: {
      range: [0, 100],
      name: "Saturation"
    },
    l: {
      range: [0, 100],
      name: "Lightness"
    }
  },
  base: LCHuv,
  gamutSpace: "self",
  // Convert LCHuv to HPLuv
  fromBase(lch2) {
    let [l, c4, h] = [skipNone(lch2[0]), skipNone(lch2[1]), skipNone(lch2[2])];
    let s;
    if (l > 99.9999999) {
      s = 0;
      l = 100;
    } else if (l < 1e-8) {
      s = 0;
      l = 0;
    } else {
      let lines = calculateBoundingLines(l);
      let max9 = calcMaxChromaHpluv(lines);
      s = c4 / max9 * 100;
    }
    return [h, s, l];
  },
  // Convert HPLuv to LCHuv
  toBase(hsl) {
    let [h, s, l] = [skipNone(hsl[0]), skipNone(hsl[1]), skipNone(hsl[2])];
    let c4;
    if (l > 99.9999999) {
      l = 100;
      c4 = 0;
    } else if (l < 1e-8) {
      l = 0;
      c4 = 0;
    } else {
      let lines = calculateBoundingLines(l);
      let max9 = calcMaxChromaHpluv(lines);
      c4 = max9 / 100 * s;
    }
    return [l, c4, h];
  },
  formats: {
    color: {
      id: "--hpluv",
      coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"]
    }
  }
});
var Yw = 203;
var n = 2610 / 2 ** 14;
var ninv = 2 ** 14 / 2610;
var m = 2523 / 2 ** 5;
var minv = 2 ** 5 / 2523;
var c1 = 3424 / 2 ** 12;
var c2 = 2413 / 2 ** 7;
var c3 = 2392 / 2 ** 7;
var rec2100Pq = new RGBColorSpace({
  id: "rec2100pq",
  cssId: "rec2100-pq",
  name: "REC.2100-PQ",
  base: REC2020Linear,
  toBase(RGB) {
    return RGB.map(function(val) {
      let x = (Math.max(val ** minv - c1, 0) / (c2 - c3 * val ** minv)) ** ninv;
      return x * 1e4 / Yw;
    });
  },
  fromBase(RGB) {
    return RGB.map(function(val) {
      let x = Math.max(val * Yw / 1e4, 0);
      let num = c1 + c2 * x ** n;
      let denom = 1 + c3 * x ** n;
      return (num / denom) ** m;
    });
  }
});
var a = 0.17883277;
var b = 0.28466892;
var c = 0.55991073;
var scale3 = 3.7743;
var rec2100Hlg = new RGBColorSpace({
  id: "rec2100hlg",
  cssId: "rec2100-hlg",
  name: "REC.2100-HLG",
  referred: "scene",
  base: REC2020Linear,
  toBase(RGB) {
    return RGB.map(function(val) {
      if (val <= 0.5) {
        return val ** 2 / 3 * scale3;
      }
      return (Math.exp((val - c) / a) + b) / 12 * scale3;
    });
  },
  fromBase(RGB) {
    return RGB.map(function(val) {
      val /= scale3;
      if (val <= 1 / 12) {
        return Math.sqrt(3 * val);
      }
      return a * Math.log(12 * val - b) + c;
    });
  }
});
var CATs = {};
hooks.add("chromatic-adaptation-start", (env) => {
  if (env.options.method) {
    env.M = adapt(env.W1, env.W2, env.options.method);
  }
});
hooks.add("chromatic-adaptation-end", (env) => {
  if (!env.M) {
    env.M = adapt(env.W1, env.W2, env.options.method);
  }
});
function defineCAT({ id, toCone_M, fromCone_M }) {
  CATs[id] = arguments[0];
}
function adapt(W1, W2, id = "Bradford") {
  let method = CATs[id];
  let [\u03C1s, \u03B3s, \u03B2s] = multiplyMatrices(method.toCone_M, W1);
  let [\u03C1d, \u03B3d, \u03B2d] = multiplyMatrices(method.toCone_M, W2);
  let scale5 = [
    [\u03C1d / \u03C1s, 0, 0],
    [0, \u03B3d / \u03B3s, 0],
    [0, 0, \u03B2d / \u03B2s]
  ];
  let scaled_cone_M = multiplyMatrices(scale5, method.toCone_M);
  let adapt_M = multiplyMatrices(method.fromCone_M, scaled_cone_M);
  return adapt_M;
}
defineCAT({
  id: "von Kries",
  toCone_M: [
    [0.40024, 0.7076, -0.08081],
    [-0.2263, 1.16532, 0.0457],
    [0, 0, 0.91822]
  ],
  fromCone_M: [
    [1.8599363874558397, -1.1293816185800916, 0.21989740959619328],
    [0.3611914362417676, 0.6388124632850422, -6370596838649899e-21],
    [0, 0, 1.0890636230968613]
  ]
});
defineCAT({
  id: "Bradford",
  // Convert an array of XYZ values in the range 0.0 - 1.0
  // to cone fundamentals
  toCone_M: [
    [0.8951, 0.2664, -0.1614],
    [-0.7502, 1.7135, 0.0367],
    [0.0389, -0.0685, 1.0296]
  ],
  // and back
  fromCone_M: [
    [0.9869929054667121, -0.14705425642099013, 0.15996265166373122],
    [0.4323052697233945, 0.5183602715367774, 0.049291228212855594],
    [-0.00852866457517732, 0.04004282165408486, 0.96848669578755]
  ]
});
defineCAT({
  id: "CAT02",
  // with complete chromatic adaptation to W2, so D = 1.0
  toCone_M: [
    [0.7328, 0.4296, -0.1624],
    [-0.7036, 1.6975, 61e-4],
    [3e-3, 0.0136, 0.9834]
  ],
  fromCone_M: [
    [1.0961238208355142, -0.27886900021828726, 0.18274517938277307],
    [0.4543690419753592, 0.4735331543074117, 0.07209780371722911],
    [-0.009627608738429355, -0.00569803121611342, 1.0153256399545427]
  ]
});
defineCAT({
  id: "CAT16",
  toCone_M: [
    [0.401288, 0.650173, -0.051461],
    [-0.250268, 1.204414, 0.045854],
    [-2079e-6, 0.048952, 0.953127]
  ],
  // the extra precision is needed to avoid roundtripping errors
  fromCone_M: [
    [1.862067855087233, -1.0112546305316845, 0.14918677544445172],
    [0.3875265432361372, 0.6214474419314753, -0.008973985167612521],
    [-0.01584149884933386, -0.03412293802851557, 1.0499644368778496]
  ]
});
Object.assign(WHITES, {
  // whitepoint values from ASTM E308-01 with 10nm spacing, 1931 2 degree observer
  // all normalized to Y (luminance) = 1.00000
  // Illuminant A is a tungsten electric light, giving a very warm, orange light.
  A: [1.0985, 1, 0.35585],
  // Illuminant C was an early approximation to daylight: illuminant A with a blue filter.
  C: [0.98074, 1, 1.18232],
  // The daylight series of illuminants simulate natural daylight.
  // The color temperature (in degrees Kelvin/100) ranges from
  // cool, overcast daylight (D50) to bright, direct sunlight (D65).
  D55: [0.95682, 1, 0.92149],
  D75: [0.94972, 1, 1.22638],
  // Equal-energy illuminant, used in two-stage CAT16
  E: [1, 1, 1],
  // The F series of illuminants represent fluorescent lights
  F2: [0.99186, 1, 0.67393],
  F7: [0.95041, 1, 1.08747],
  F11: [1.00962, 1, 0.6435]
});
WHITES.ACES = [0.32168 / 0.33767, 1, (1 - 0.32168 - 0.33767) / 0.33767];
var toXYZ_M = [
  [0.6624541811085053, 0.13400420645643313, 0.1561876870049078],
  [0.27222871678091454, 0.6740817658111484, 0.05368951740793705],
  [-0.005574649490394108, 0.004060733528982826, 1.0103391003129971]
];
var fromXYZ_M = [
  [1.6410233796943257, -0.32480329418479, -0.23642469523761225],
  [-0.6636628587229829, 1.6153315916573379, 0.016756347685530137],
  [0.011721894328375376, -0.008284441996237409, 0.9883948585390215]
];
var ACEScg = new RGBColorSpace({
  id: "acescg",
  cssId: "--acescg",
  name: "ACEScg",
  // ACEScg – A scene-referred, linear-light encoding of ACES Data
  // https://docs.acescentral.com/specifications/acescg/
  // uses the AP1 primaries, see section 4.3.1 Color primaries
  coords: {
    r: {
      range: [0, 65504],
      name: "Red"
    },
    g: {
      range: [0, 65504],
      name: "Green"
    },
    b: {
      range: [0, 65504],
      name: "Blue"
    }
  },
  referred: "scene",
  white: WHITES.ACES,
  toXYZ_M,
  fromXYZ_M
});
var \u03B5 = 2 ** -16;
var ACES_min_nonzero = -0.35828683;
var ACES_cc_max = (Math.log2(65504) + 9.72) / 17.52;
var acescc = new RGBColorSpace({
  id: "acescc",
  cssId: "--acescc",
  name: "ACEScc",
  // see S-2014-003 ACEScc – A Logarithmic Encoding of ACES Data
  // https://docs.acescentral.com/specifications/acescc/
  // uses the AP1 primaries, see section 4.3.1 Color primaries
  // Appendix A: "Very small ACES scene referred values below 7 1/4 stops
  // below 18% middle gray are encoded as negative ACEScc values.
  // These values should be preserved per the encoding in Section 4.4
  // so that all positive ACES values are maintained."
  coords: {
    r: {
      range: [ACES_min_nonzero, ACES_cc_max],
      name: "Red"
    },
    g: {
      range: [ACES_min_nonzero, ACES_cc_max],
      name: "Green"
    },
    b: {
      range: [ACES_min_nonzero, ACES_cc_max],
      name: "Blue"
    }
  },
  referred: "scene",
  base: ACEScg,
  // from section 4.4.2 Decoding Function
  toBase(RGB) {
    const low = (9.72 - 15) / 17.52;
    return RGB.map(function(val) {
      if (val <= low) {
        return (2 ** (val * 17.52 - 9.72) - \u03B5) * 2;
      } else if (val < ACES_cc_max) {
        return 2 ** (val * 17.52 - 9.72);
      } else {
        return 65504;
      }
    });
  },
  // Non-linear encoding function from S-2014-003, section 4.4.1 Encoding Function
  fromBase(RGB) {
    return RGB.map(function(val) {
      if (val <= 0) {
        return (Math.log2(\u03B5) + 9.72) / 17.52;
      } else if (val < \u03B5) {
        return (Math.log2(\u03B5 + val * 0.5) + 9.72) / 17.52;
      } else {
        return (Math.log2(val) + 9.72) / 17.52;
      }
    });
  }
  // encoded media white (rgb 1,1,1) => linear  [ 222.861, 222.861, 222.861 ]
  // encoded media black (rgb 0,0,0) => linear [ 0.0011857, 0.0011857, 0.0011857]
});
var spaces = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  A98RGB: a98rgb,
  A98RGB_Linear: A98Linear,
  ACEScc: acescc,
  ACEScg,
  CAM16_JMh: cam16,
  HCT: hct,
  HPLuv: hpluv,
  HSL,
  HSLuv: hsluv,
  HSV,
  HWB: hwb,
  ICTCP: ictcp,
  JzCzHz: jzczhz,
  Jzazbz,
  LCH: lch,
  LCHuv,
  Lab: lab,
  Lab_D65: lab_d65,
  Luv,
  OKLCH: oklch,
  OKLab,
  P3,
  P3_Linear: P3Linear,
  ProPhoto: prophoto,
  ProPhoto_Linear: ProPhotoLinear,
  REC_2020: REC2020,
  REC_2020_Linear: REC2020Linear,
  REC_2100_HLG: rec2100Hlg,
  REC_2100_PQ: rec2100Pq,
  XYZ_ABS_D65: XYZ_Abs_D65,
  XYZ_D50,
  XYZ_D65: xyz_d65,
  sRGB,
  sRGB_Linear: sRGBLinear
});
var Color = class _Color {
  /**
   * Creates an instance of Color.
   * Signatures:
   * - `new Color(stringToParse)`
   * - `new Color(otherColor)`
   * - `new Color({space, coords, alpha})`
   * - `new Color(space, coords, alpha)`
   * - `new Color(spaceId, coords, alpha)`
   */
  constructor(...args) {
    let color;
    if (args.length === 1) {
      color = getColor(args[0]);
    }
    let space, coords, alpha;
    if (color) {
      space = color.space || color.spaceId;
      coords = color.coords;
      alpha = color.alpha;
    } else {
      [space, coords, alpha] = args;
    }
    Object.defineProperty(this, "space", {
      value: ColorSpace.get(space),
      writable: false,
      enumerable: true,
      configurable: true
      // see note in https://262.ecma-international.org/8.0/#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
    });
    this.coords = coords ? coords.slice() : [0, 0, 0];
    this.alpha = alpha > 1 || alpha === void 0 ? 1 : alpha < 0 ? 0 : alpha;
    for (let i = 0; i < this.coords.length; i++) {
      if (this.coords[i] === "NaN") {
        this.coords[i] = NaN;
      }
    }
    for (let id in this.space.coords) {
      Object.defineProperty(this, id, {
        get: () => this.get(id),
        set: (value) => this.set(id, value)
      });
    }
  }
  get spaceId() {
    return this.space.id;
  }
  clone() {
    return new _Color(this.space, this.coords, this.alpha);
  }
  toJSON() {
    return {
      spaceId: this.spaceId,
      coords: this.coords,
      alpha: this.alpha
    };
  }
  display(...args) {
    let ret = display(this, ...args);
    ret.color = new _Color(ret.color);
    return ret;
  }
  /**
   * Get a color from the argument passed
   * Basically gets us the same result as new Color(color) but doesn't clone an existing color object
   */
  static get(color, ...args) {
    if (color instanceof _Color) {
      return color;
    }
    return new _Color(color, ...args);
  }
  static defineFunction(name, code, o = code) {
    let { instance = true, returns } = o;
    let func2 = function(...args) {
      let ret = code(...args);
      if (returns === "color") {
        ret = _Color.get(ret);
      } else if (returns === "function<color>") {
        let f = ret;
        ret = function(...args2) {
          let ret2 = f(...args2);
          return _Color.get(ret2);
        };
        Object.assign(ret, f);
      } else if (returns === "array<color>") {
        ret = ret.map((c4) => _Color.get(c4));
      }
      return ret;
    };
    if (!(name in _Color)) {
      _Color[name] = func2;
    }
    if (instance) {
      _Color.prototype[name] = function(...args) {
        return func2(this, ...args);
      };
    }
  }
  static defineFunctions(o) {
    for (let name in o) {
      _Color.defineFunction(name, o[name], o[name]);
    }
  }
  static extend(exports) {
    if (exports.register) {
      exports.register(_Color);
    } else {
      for (let name in exports) {
        _Color.defineFunction(name, exports[name]);
      }
    }
  }
};
Color.defineFunctions({
  get: get2,
  getAll,
  set: set4,
  setAll,
  to,
  equals: equals3,
  inGamut,
  toGamut,
  distance: distance4,
  toString: serialize
});
Object.assign(Color, {
  util,
  hooks,
  WHITES,
  Space: ColorSpace,
  spaces: ColorSpace.registry,
  parse,
  // Global defaults one may want to configure
  defaults
});
for (let key of Object.keys(spaces)) {
  ColorSpace.register(spaces[key]);
}
for (let id in ColorSpace.registry) {
  addSpaceAccessors(id, ColorSpace.registry[id]);
}
hooks.add("colorspace-init-end", (space) => {
  addSpaceAccessors(space.id, space);
  space.aliases?.forEach((alias) => {
    addSpaceAccessors(alias, space);
  });
});
function addSpaceAccessors(id, space) {
  let propId = id.replace(/-/g, "_");
  Object.defineProperty(Color.prototype, propId, {
    // Convert coords to coords in another colorspace and return them
    // Source colorspace: this.spaceId
    // Target colorspace: id
    get() {
      let ret = this.getAll(id);
      if (typeof Proxy === "undefined") {
        return ret;
      }
      return new Proxy(ret, {
        has: (obj, property) => {
          try {
            ColorSpace.resolveCoord([space, property]);
            return true;
          } catch (e) {
          }
          return Reflect.has(obj, property);
        },
        get: (obj, property, receiver) => {
          if (property && typeof property !== "symbol" && !(property in obj)) {
            let { index } = ColorSpace.resolveCoord([space, property]);
            if (index >= 0) {
              return obj[index];
            }
          }
          return Reflect.get(obj, property, receiver);
        },
        set: (obj, property, value, receiver) => {
          if (property && typeof property !== "symbol" && !(property in obj) || property >= 0) {
            let { index } = ColorSpace.resolveCoord([space, property]);
            if (index >= 0) {
              obj[index] = value;
              this.setAll(id, obj);
              return true;
            }
          }
          return Reflect.set(obj, property, value, receiver);
        }
      });
    },
    // Convert coords in another colorspace to internal coords and set them
    // Target colorspace: this.spaceId
    // Source colorspace: id
    set(coords) {
      this.setAll(id, coords);
    },
    configurable: true,
    enumerable: true
  });
}
Color.extend(deltaEMethods);
Color.extend({ deltaE });
Object.assign(Color, { deltaEMethods });
Color.extend(variations);
Color.extend({ contrast });
Color.extend(chromaticity);
Color.extend(luminance);
Color.extend(interpolation);
Color.extend(contrastMethods);

// ../visual/src/colour/oklch.ts
var oklchToColorJs = (lch2) => {
  throwNumberTest(lch2.l, `percentage`, `lch.l`);
  throwNumberTest(lch2.c, `percentage`, `lch.c`);
  throwNumberTest(lch2.h, `percentage`, `lch.h`);
  throwNumberTest(lch2.opacity, `percentage`, `lch.opacity`);
  return {
    alpha: lch2.opacity,
    coords: [lch2.l, lch2.c * 0.4, lch2.h * 360],
    spaceId: `oklch`
  };
};
var isOklch = (p2) => {
  if (p2 === void 0 || p2 === null) return false;
  if (typeof p2 !== `object`) return false;
  if (p2.space !== `oklch`) return false;
  if (p2.l === void 0) return false;
  if (p2.c === void 0) return false;
  if (p2.h === void 0) return false;
  return true;
};

// ../visual/src/colour/resolve-css.ts
var resolveCss = (colour, fallback) => {
  if (typeof colour === `string`) {
    if (colour.startsWith(`--`)) {
      const value = getComputedStyle(document.body).getPropertyValue(colour);
      if (!value || value.length === 0) {
        if (!fallback) throw new Error(`Variable not found: ${colour}`);
        return fallback;
      }
      return value;
    }
  }
  return colour;
};
var getCssVariable = (name, fallbackColour = `black`, root) => {
  if (root === void 0) root = document.body;
  if (name.startsWith(`--`)) name = name.slice(2);
  const fromCss = getComputedStyle(root).getPropertyValue(`--${name}`).trim();
  if (fromCss === void 0 || fromCss.length === 0) return fallbackColour;
  return fromCss;
};

// ../visual/src/colour/rgb.ts
var relativeFromAbsolute = (r, g2, b2, opacity = 255) => {
  r = clamp(r / 255);
  g2 = clamp(g2 / 255);
  b2 = clamp(b2 / 255);
  opacity = clamp(opacity);
  return {
    r,
    g: g2,
    b: b2,
    opacity,
    unit: `relative`,
    space: `srgb`
  };
};
var rgbToRelative = (rgb) => {
  if (rgb.unit === `relative`) return rgb;
  return relativeFromAbsolute(rgb.r, rgb.g, rgb.b, rgb.opacity);
};
var isRgb = (p2, validate = false) => {
  if (p2 === void 0 || p2 === null) return false;
  if (typeof p2 !== `object`) return false;
  const space = p2.space;
  if (space !== `srgb` && space !== void 0) return false;
  const pp = p2;
  if (pp.r === void 0) return false;
  if (pp.g === void 0) return false;
  if (pp.b === void 0) return false;
  if (validate) {
    if (`opacity` in pp) {
      throwFromResult(numberInclusiveRangeTest(pp.opacity, 0, 1, `opacity`));
    }
    if (pp.unit === `relative`) {
      throwFromResult(numberInclusiveRangeTest(pp.r, 0, 1, `r`));
      throwFromResult(numberInclusiveRangeTest(pp.g, 0, 1, `g`));
      throwFromResult(numberInclusiveRangeTest(pp.b, 0, 1, `b`));
    } else if (pp.unit === `8bit`) {
      throwFromResult(numberInclusiveRangeTest(pp.r, 0, 255, `r`));
      throwFromResult(numberInclusiveRangeTest(pp.g, 0, 255, `g`));
      throwFromResult(numberInclusiveRangeTest(pp.b, 0, 255, `b`));
    }
  }
  return true;
};
var rgbToColorJs = (rgb) => {
  const rel = rgbToRelative(rgb);
  return {
    alpha: rel.opacity,
    coords: [rgb.r, rgb.g, rgb.b],
    spaceId: `sRGB`
  };
};
var toRgb = (colour) => {
  if (typeof colour === `string` && colour === `transparent`) return { r: 1, g: 1, b: 1, opacity: 0, space: `srgb`, unit: `relative` };
  if (isRgb(colour)) {
    return rgbToRelative(colour);
  } else if (isHsl(colour)) {
    const hslRel = hslToRelative(colour);
    const c4 = new Color(`hsl`, [hslRel.h, hslRel.s, hslRel.l], hslRel.opacity ?? 1);
    const rgb = c4.srgb;
    return { r: rgb[0], g: rgb[1], b: rgb[2], opacity: c4.alpha, unit: `relative`, space: `srgb` };
  } else if (isOklch(colour)) {
    const c4 = new Color(`oklch`, [colour.l, colour.c, colour.h], colour.opacity ?? 1);
    const rgb = c4.srgb;
    return { r: rgb[0], g: rgb[1], b: rgb[2], opacity: c4.alpha, unit: `relative`, space: `srgb` };
  } else {
    const c4 = new Color(resolveCss(colour));
    const rgb = c4.srgb;
    return { r: rgb[0], g: rgb[1], b: rgb[2], opacity: c4.alpha, unit: `relative`, space: `srgb` };
  }
};
var toRgb8bit = (rgb, clamped = true) => {
  if (rgb.unit === `8bit`) return rgb;
  let r = rgb.r * 255;
  let g2 = rgb.g * 255;
  let b2 = rgb.b * 255;
  let opacity = (rgb.opacity ?? 1) * 255;
  if (clamped) {
    r = clamp(r, 0, 255);
    g2 = clamp(g2, 0, 255);
    b2 = clamp(b2, 0, 255);
    opacity = clamp(opacity, 0, 255);
  }
  return { r, g: g2, b: b2, opacity, unit: `8bit`, space: `srgb` };
};
var toRgbRelative = (rgb, clamped = true) => {
  if (rgb.unit === `relative`) return rgb;
  if (rgb.unit === `8bit`) {
    let r = rgb.r / 255;
    let g2 = rgb.g / 255;
    let b2 = rgb.b / 255;
    let opacity = (rgb.opacity ?? 255) / 255;
    if (clamped) {
      r = clamp(r);
      g2 = clamp(g2);
      b2 = clamp(b2);
      opacity = clamp(opacity);
    }
    return {
      r,
      g: g2,
      b: b2,
      opacity,
      unit: `relative`,
      space: `srgb`
    };
  } else {
    throw new Error(`Unknown unit. Expected '8bit'`);
  }
};
var parseRgbObject = (p2) => {
  if (p2 === void 0 || p2 === null) return { success: false, error: `Undefined/null` };
  if (typeof p2 !== `object`) return { success: false, error: `Not an object` };
  const space = p2.space ?? `srgb`;
  let { r, g: g2, b: b2, opacity } = p2;
  if (r !== void 0 || g2 !== void 0 || b2 !== void 0) {
  } else {
    const { red, green, blue } = p2;
    if (red !== void 0 || green !== void 0 || blue !== void 0) {
      r = red;
      g2 = green;
      b2 = blue;
    } else return { success: false, error: `Does not contain r,g,b or red,green,blue` };
  }
  let unit = p2.unit;
  if (unit === `relative`) {
    if (r > 1 || r < 0) return { success: false, error: `Relative units, but 'r' exceeds 0..1` };
    if (g2 > 1 || g2 < 0) return { success: false, error: `Relative units, but 'g' exceeds 0..1` };
    if (b2 > 1 || b2 < 0) return { success: false, error: `Relative units, but 'b' exceeds 0..1` };
    if (opacity > 1 || opacity < 0) return { success: false, error: `Relative units, but opacity exceeds 0..1` };
  } else if (unit === `8bit`) {
    if (r > 255 || r < 0) return { success: false, error: `8bit units, but r exceeds 0..255` };
    if (g2 > 255 || g2 < 0) return { success: false, error: `8bit units, but g exceeds 0..255` };
    if (b2 > 255 || b2 < 0) return { success: false, error: `8bit units, but b exceeds 0..255` };
    if (opacity > 255 || opacity < 0) return { success: false, error: `8bit units, but opacity exceeds 0..255` };
  } else if (!unit) {
    if (r > 1 || g2 > 1 || b2 > 1) {
      if (r <= 255 && g2 <= 255 && b2 <= 255) {
        unit = `8bit`;
      } else return { success: false, error: `Unknown units, outside 0..255 range` };
    } else if (r <= 1 && g2 <= 1 && b2 <= 1) {
      if (r >= 0 && g2 >= 0 && b2 >= 0) {
        unit = `relative`;
      } else return { success: false, error: `Unknown units, outside of 0..1 range` };
    } else return { success: false, error: `Unknown units for r,g,b,opacity values` };
  }
  if (opacity === void 0) {
    opacity = unit === `8bit` ? 255 : 1;
  }
  const c4 = {
    r,
    g: g2,
    b: b2,
    opacity,
    unit,
    space
  };
  return { success: true, value: c4 };
};

// ../visual/src/colour/hsl.ts
var hslToColorJs = (hsl) => {
  const abs4 = hslToAbsolute(hsl);
  return {
    alpha: abs4.opacity ?? 1,
    coords: [abs4.h, abs4.s, abs4.l],
    spaceId: `hsl`
  };
};
var isHsl = (p2, validate = false) => {
  if (p2 === void 0 || p2 === null) return false;
  if (typeof p2 !== `object`) return false;
  const pp = p2;
  if (pp.h === void 0) return false;
  if (pp.s === void 0) return false;
  if (pp.l === void 0) return false;
  if (validate) {
    if (pp.unit === `relative`) {
      throwFromResult(numberInclusiveRangeTest(pp.h, 0, 1, `h`));
      throwFromResult(numberInclusiveRangeTest(pp.s, 0, 1, `s`));
      throwFromResult(numberInclusiveRangeTest(pp.l, 0, 1, `l`));
    } else if (pp.unit === `absolute`) {
      throwFromResult(numberInclusiveRangeTest(pp.s, 0, 100, `s`));
      throwFromResult(numberInclusiveRangeTest(pp.l, 0, 100, `l`));
    }
    if (`opacity` in pp) {
      throwNumberTest(pp.opacity, `percentage`, `opacity`);
    }
  }
  return true;
};
var hslToString = (hsl) => {
  const { h, s, l, opacity } = hslToAbsolute(hsl, true);
  return `hsl(${h}deg ${s}% ${l}% / ${opacity}%)`;
};
var hslToAbsolute = (hsl, safe = true) => {
  if (hsl.unit === `absolute`) return hsl;
  const h = hsl.h === null ? safe ? 0 : null : hsl.h;
  const opacity = hsl.opacity === void 0 ? 1 : hsl.opacity;
  throwNumberTest(h, `percentage`, `hsl.h`);
  throwNumberTest(hsl.s, `percentage`, `hsl.s`);
  throwNumberTest(hsl.l, `percentage`, `hsl.l`);
  throwNumberTest(opacity, `percentage`, `hsl.opacity`);
  return {
    h: h * 360,
    s: hsl.s * 100,
    l: hsl.l * 100,
    opacity,
    unit: `absolute`,
    space: `hsl`
  };
};
var hslFromRelativeValues = (h = 1, s = 1, l = 0.5, opacity = 1) => {
  return {
    h,
    s,
    l,
    opacity,
    unit: `relative`,
    space: `hsl`
  };
};
var hslFromAbsoluteValues = (h, s, l, opacity = 1, safe = false) => {
  const hTest = numberInclusiveRangeTest(h, 0, 360, `h`);
  if (!hTest[0]) {
    if (safe) h = 0;
    else throwFromResult(hTest);
  }
  throwFromResult(numberInclusiveRangeTest(s, 0, 100, `s`));
  throwFromResult(numberInclusiveRangeTest(l, 0, 100, `l`));
  throwFromResult(numberInclusiveRangeTest(opacity, 0, 1, `opacity`));
  if (s > 100) throw new Error(`Param 's' expected 0..100`);
  if (l > 100) throw new Error(`Param 'l' expected 0..100`);
  h = clamp(h / 360);
  s = s / 100;
  l = l / 100;
  return {
    h,
    s,
    l,
    opacity,
    unit: `relative`,
    space: `hsl`
  };
};
var hslToRelative = (hsl, safe = true) => {
  if (hsl.unit === `relative`) return hsl;
  return hslFromAbsoluteValues(hsl.h, hsl.s, hsl.l, hsl.opacity, safe);
};
var toHsl = (colour, safe = true) => {
  if (typeof colour === `string` && colour === `transparent`) return { h: 0, s: 0, l: 0, opacity: 0, space: `hsl`, unit: `relative` };
  if (!colour && !safe) throw new Error(`Param 'colour' is undefined`);
  if (isHsl(colour)) {
    return hslToRelative(colour);
  } else if (isRgb(colour)) {
    const rgb = toRgbRelative(colour);
    const c4 = new Color(`sRGB`, [rgb.r, rgb.g, rgb.b], rgb.opacity ?? 1);
    const [h, s, l] = c4.hsl.map((v) => parseFloat(v));
    return hslFromAbsoluteValues(h, s, l, parseFloat(c4.alpha), safe);
  } else if (isOklch(colour)) {
    const c4 = new Color(`oklch`, [colour.l, colour.c, colour.h], colour.opacity ?? 1);
    const [h, s, l] = c4.hsl.map((v) => parseFloat(v));
    return hslFromAbsoluteValues(h, s, l, parseFloat(c4.alpha), safe);
  } else {
    const c4 = new Color(resolveCss(colour));
    const [h, s, l] = c4.hsl.map((v) => parseFloat(v));
    return hslFromAbsoluteValues(h, s, l, parseFloat(c4.alpha), safe);
  }
};

// ../visual/src/colour/resolve-to-color.ts
var structuredToColorJsConstructor = (colour) => {
  if (isHsl(colour, true)) {
    return hslToColorJs(colour);
  }
  if (isRgb(colour, true)) {
    return rgbToColorJs(colour);
  }
  if (isOklch(colour)) {
    return oklchToColorJs(colour);
  }
  const c4 = new Color(resolveCss(colour));
  return {
    alpha: c4.alpha,
    coords: c4.coords,
    spaceId: c4.spaceId
  };
};
var structuredToColorJs = (colour) => {
  const cc = structuredToColorJsConstructor(colour);
  return new Color(cc.spaceId, cc.coords, cc.alpha);
};

// ../visual/src/colour/to-hex.ts
var toHex = (colour) => {
  if (typeof colour === `string` && colour === `transparent`) return `#00000000`;
  const cc = structuredToColorJsConstructor(colour);
  const c4 = new Color(cc.spaceId, cc.coords, cc.alpha);
  return c4.to(`srgb`).toString({ format: `hex`, collapse: false });
};
var toString7 = (colour) => {
  const c4 = structuredToColorJs(colour);
  return c4.display().toString();
};
var toStringFirst = (...colours) => {
  for (const colour of colours) {
    if (colour === void 0) continue;
    if (colour === null) continue;
    try {
      const c4 = structuredToColorJs(colour);
      return c4.display();
    } catch (_error) {
      return colour.toString();
    }
  }
  return `rebeccapurple`;
};

// ../visual/src/colour/interpolate.ts
var interpolator2 = (colours, opts = {}) => {
  const space = opts.space ?? `lch`;
  const hue = opts.hue ?? `shorter`;
  const pieces = interpolatorInit(colours);
  const ranges = pieces.map((piece) => piece[0].range(piece[1], { space, hue }));
  return (amt) => {
    amt = clamp(amt);
    const s = scale2(amt, 0, 1, 0, ranges.length);
    const index = Math.floor(s);
    const amtAdjusted = s - index;
    const range2 = ranges[index];
    if (index === 1) return toString7(colours.at(-1));
    const colour = range2(amtAdjusted);
    return colour.display();
  };
};
var interpolatorInit = (colours) => {
  if (!Array.isArray(colours)) throw new Error(`Param 'colours' is not an array as expected. Got: ${typeof colours}`);
  if (colours.length < 2) throw new Error(`Param 'colours' should be at least two in length. Got: ${colours.length}`);
  const c4 = colours.map((colour) => {
    const c5 = structuredToColorJsConstructor(colour);
    return new Color(c5.spaceId, c5.coords, c5.alpha);
  });
  return [...pairwise(c4)];
};
var cssLinearGradient = (colours) => {
  const c4 = colours.map((c5) => toString7(c5));
  return `linear-gradient(to right, ${c4.join(`, `)})`;
};
var scale4 = (colours, numberOfSteps, opts = {}) => {
  const space = opts.space ?? `lch`;
  const hue = opts.hue ?? `shorter`;
  const pieces = interpolatorInit(colours);
  const stepsPerPair = Math.floor(numberOfSteps / pieces.length);
  const steps2 = pieces.map((piece) => piece[0].steps(
    piece[1],
    { space, hue, steps: stepsPerPair, outputSpace: `srgb` }
  ));
  return steps2.flat().map((c4) => c4.display());
};

// ../visual/src/colour/math.ts
var multiplyOpacity = (colour, amt) => {
  throwNumberTest(amt, `percentage`, `amt`);
  const c4 = structuredToColorJs(colour);
  const alpha = clamp((c4.alpha ?? 0) * amt);
  c4.alpha = alpha;
  return c4.toString();
};
var multiplySaturation = (colour, amt) => {
  throwNumberTest(amt, `percentage`, `amt`);
  const c4 = structuredToColorJs(colour);
  c4.s = (c4.s ?? 0) * amt;
  return c4.toString();
};

// ../visual/src/image-data-grid.ts
var grid = (image) => {
  const g2 = { rows: image.width, cols: image.height };
  return g2;
};
var wrap5 = (image) => {
  return {
    ...grid(image),
    get: accessor(image),
    set: setter(image)
  };
};
var accessor = (image) => {
  const g2 = grid(image);
  const data = image.data;
  const fn = (cell, bounds = `undefined`) => {
    const index = grid_exports.indexFromCell(g2, cell, bounds);
    if (index === void 0) return;
    const pxIndex = index * 4;
    return {
      r: data[pxIndex],
      g: data[pxIndex + 1],
      b: data[pxIndex + 2],
      opacity: data[pxIndex + 3],
      unit: `8bit`,
      space: `srgb`
    };
  };
  return fn;
};
var setter = (image) => {
  const g2 = grid(image);
  const data = image.data;
  const fn = (value, cell, bounds = `undefined`) => {
    const index = grid_exports.indexFromCell(g2, cell, bounds);
    if (index === void 0) throw new Error(`Cell out of range. ${cell.x},${cell.y}`);
    const pixel = toRgb8bit(value);
    const pxIndex = index * 4;
    data[pxIndex] = pixel.r;
    data[pxIndex + 1] = pixel.g;
    data[pxIndex + 2] = pixel.b;
    data[pxIndex + 3] = pixel.opacity ?? 255;
  };
  return fn;
};
function* byRow(image) {
  const a2 = accessor(image);
  const g2 = grid(image);
  const v = grid_exports.As.rows(g2, { x: 0, y: 0 });
  for (const row of v) {
    const pixels = row.map((p2) => a2(p2, `undefined`));
    yield pixels;
  }
}
function* byColumn(image) {
  const a2 = accessor(image);
  const g2 = grid(image);
  for (let x = 0; x < g2.cols; x++) {
    const col = [];
    for (let y = 0; y < g2.rows; y++) {
      const p2 = a2({ x, y }, `undefined`);
      if (p2) col.push(p2);
    }
    yield col;
  }
}

// ../core/src/records/compare.ts
var compareObjectKeys = (a2, b2) => {
  const c4 = compareIterableValuesShallow(Object.keys(a2), Object.keys(b2));
  return c4;
};
var compareArrays = (a2, b2, eq = isEqualDefault2) => {
  if (!Array.isArray(a2)) throw new Error(`Param 'a' is not an array`);
  if (!Array.isArray(b2)) throw new Error(`Param 'b' is not an array`);
  const c4 = compareObjectData(a2, b2, false, eq);
  if (!c4.isArray) throw new Error(`Change set does not have arrays as parameters`);
  const convert = (key) => {
    if (key.startsWith(`_`)) {
      return Number.parseInt(key.slice(1));
    } else throw new Error(`Unexpected key '${key}'`);
  };
  const cc = {
    ...c4,
    added: mapObjectKeys(c4.added, convert),
    changed: mapObjectKeys(c4.changed, convert),
    removed: c4.removed.map((v) => convert(v)),
    summary: c4.summary.map((value) => {
      return [value[0], convert(value[1]), value[2]];
    })
  };
  return cc;
};
var compareObjectData = (a2, b2, assumeSameShape = false, eq = isEqualDefault2) => {
  a2 ??= {};
  b2 ??= {};
  const entriesA = Object.entries(a2);
  const entriesB = Object.entries(b2);
  const scannedKeys = /* @__PURE__ */ new Set();
  const changed = {};
  const added = {};
  const children = {};
  const removed = [];
  const isArray = Array.isArray(a2);
  const summary = new Array();
  let hasChanged = false;
  for (const entry of entriesA) {
    const outputKey = isArray ? `_${entry[0]}` : entry[0];
    const aValue = entry[1];
    const bValue = b2[entry[0]];
    scannedKeys.add(entry[0]);
    if (bValue === void 0) {
      hasChanged = true;
      if (assumeSameShape && !isArray) {
        changed[outputKey] = bValue;
        summary.push([`mutate`, outputKey, bValue]);
      } else {
        removed.push(outputKey);
        summary.push([`del`, outputKey, aValue]);
      }
      continue;
    }
    if (typeof aValue === `object`) {
      const r = compareObjectData(aValue, bValue, assumeSameShape, eq);
      if (r.hasChanged) hasChanged = true;
      children[outputKey] = r;
      const childSummary = r.summary.map((sum7) => {
        return [sum7[0], outputKey + `.` + sum7[1], sum7[2]];
      });
      summary.push(...childSummary);
    } else {
      if (!eq(aValue, bValue)) {
        changed[outputKey] = bValue;
        hasChanged = true;
        summary.push([`mutate`, outputKey, bValue]);
      }
    }
  }
  if (!assumeSameShape || isArray) {
    for (const entry of entriesB) {
      const key = isArray ? `_${entry[0]}` : entry[0];
      if (scannedKeys.has(entry[0])) continue;
      added[key] = entry[1];
      hasChanged = true;
      summary.push([`add`, key, entry[1]]);
    }
  }
  return {
    changed,
    added,
    removed,
    children,
    hasChanged,
    isArray,
    summary
  };
};

// ../core/src/records/clone-from-fields.ts
var cloneFromFields = (source) => {
  const entries = [];
  for (const field2 in source) {
    const value = source[field2];
    if (isPlainObjectOrPrimitive(value)) {
      entries.push([field2, value]);
    }
  }
  return Object.fromEntries(entries);
};

// ../core/src/records/map-object.ts
var mapObjectShallow = (object2, mapFunction) => {
  const entries = Object.entries(object2);
  const mapped = entries.map(([sourceField, sourceFieldValue], index) => [
    sourceField,
    mapFunction({ value: sourceFieldValue, field: sourceField, index, path: sourceField })
  ]);
  return Object.fromEntries(mapped);
};

// ../core/src/records/pathed.ts
var getEntries = (target, deepProbe) => {
  if (target === void 0) throw new Error(`Param 'target' is undefined`);
  if (target === null) throw new Error(`Param 'target' is null`);
  if (typeof target !== `object`) throw new Error(`Param 'target' is not an object (got: ${typeof target})`);
  if (deepProbe) {
    const entries = [];
    for (const field2 in target) {
      const value = target[field2];
      if (isPlainObjectOrPrimitive(value)) {
        entries.push([field2, value]);
      }
    }
    return entries;
  } else {
    return Object.entries(target);
  }
};
function* compareData(a2, b2, options = {}) {
  if (typeof a2 === `undefined`) {
    yield {
      path: options.pathPrefix ?? ``,
      value: b2,
      state: `added`
    };
    return;
  }
  if (typeof b2 === `undefined`) {
    yield { path: options.pathPrefix ?? ``, previous: a2, value: void 0, state: `removed` };
    return;
  }
  const asPartial = options.asPartial ?? false;
  const undefinedValueMeansRemoved = options.undefinedValueMeansRemoved ?? false;
  const pathPrefix = options.pathPrefix ?? ``;
  const deepEntries = options.deepEntries ?? false;
  const eq = options.eq ?? isEqualContextString;
  const includeMissingFromA = options.includeMissingFromA ?? false;
  const includeParents = options.includeParents ?? false;
  if (isPrimitive(a2) && isPrimitive(b2)) {
    if (a2 !== b2) yield { path: pathPrefix, value: b2, previous: a2, state: `change` };
    return;
  }
  if (isPrimitive(b2)) {
    yield { path: pathPrefix, value: b2, previous: a2, state: `change` };
    return;
  }
  const entriesA = getEntries(a2, deepEntries);
  const entriesAKeys = /* @__PURE__ */ new Set();
  for (const [key, valueA] of entriesA) {
    entriesAKeys.add(key);
    const keyOfAInB = key in b2;
    const valueOfKeyInB = b2[key];
    if (typeof valueA === `object` && valueA !== null) {
      if (keyOfAInB) {
        if (valueOfKeyInB === void 0) {
          throw new Error(`Pathed.compareData Value for key ${key} is undefined`);
        } else {
          const sub = [...compareData(valueA, valueOfKeyInB, {
            ...options,
            pathPrefix: pathPrefix + key + `.`
          })];
          if (sub.length > 0) {
            for (const s of sub) yield s;
            if (includeParents) {
              yield { path: pathPrefix + key, value: b2[key], previous: valueA, state: `change` };
            }
          }
        }
      } else {
        if (asPartial) continue;
        yield { path: pathPrefix + key, value: void 0, previous: valueA, state: `removed` };
      }
    } else {
      const subPath = pathPrefix + key;
      if (keyOfAInB) {
        if (valueOfKeyInB === void 0 && undefinedValueMeansRemoved) {
          yield { path: subPath, previous: valueA, value: void 0, state: `removed` };
        } else {
          if (!eq(valueA, valueOfKeyInB, subPath)) {
            yield { path: subPath, previous: valueA, value: valueOfKeyInB, state: `change` };
          }
        }
      } else {
        if (asPartial) continue;
        yield { path: subPath, previous: valueA, value: void 0, state: `removed` };
      }
    }
  }
  if (includeMissingFromA) {
    const entriesB = getEntries(b2, deepEntries);
    for (const [key, valueB] of entriesB) {
      if (entriesAKeys.has(key)) continue;
      yield { path: pathPrefix + key, previous: void 0, value: valueB, state: `added` };
    }
  }
}
var updateByPath = (target, path2, value, allowShapeChange = false) => {
  if (path2 === void 0) throw new Error(`Parameter 'path' is undefined`);
  if (typeof path2 !== `string`) throw new Error(`Parameter 'path' should be a string. Got: ${typeof path2}`);
  if (target === void 0) throw new Error(`Parameter 'target' is undefined`);
  if (target === null) throw new Error(`Parameter 'target' is null`);
  const split2 = path2.split(`.`);
  const r = updateByPathImpl(target, split2, value, allowShapeChange);
  return r;
};
var updateByPathImpl = (o, split2, value, allowShapeChange) => {
  if (split2.length === 0) {
    if (allowShapeChange) return value;
    if (Array.isArray(o) && !Array.isArray(value)) throw new Error(`Expected array value, got: '${JSON.stringify(value)}'. Set allowShapeChange=true to ignore.`);
    if (!Array.isArray(o) && Array.isArray(value)) throw new Error(`Unexpected array value, got: '${JSON.stringify(value)}'. Set allowShapeChange=true to ignore.`);
    if (typeof o !== typeof value) throw new Error(`Cannot reassign object type. (${typeof o} -> ${typeof value}). Set allowShapeChange=true to ignore.`);
    if (typeof o === `object` && !Array.isArray(o)) {
      const c4 = compareObjectKeys(o, value);
      if (c4.a.length > 0) {
        throw new Error(`New value is missing key(s): ${c4.a.join(`,`)}`);
      }
      if (c4.b.length > 0) {
        throw new Error(`New value cannot add new key(s): ${c4.b.join(`,`)}`);
      }
    }
    return value;
  }
  const start = split2.shift();
  if (!start) return value;
  const isInt = isInteger(start);
  if (isInt && Array.isArray(o)) {
    const index = Number.parseInt(start);
    if (index >= o.length && !allowShapeChange) throw new Error(`Array index ${index.toString()} is outside of the existing length of ${o.length.toString()}. Use allowShapeChange=true to permit this.`);
    const copy = [...o];
    copy[index] = updateByPathImpl(copy[index], split2, value, allowShapeChange);
    return copy;
  } else if (start in o) {
    const copy = { ...o };
    copy[start] = updateByPathImpl(copy[start], split2, value, allowShapeChange);
    return copy;
  } else {
    throw new Error(`Path ${start} not found in data`);
  }
};
var getField = (object2, path2) => {
  if (typeof path2 !== `string`) throw new Error(`Param 'path' ought to be a string. Got: '${typeof path2}'`);
  if (path2.length === 0) throw new Error(`Param string 'path' is empty`);
  if (object2 === void 0) throw new Error(`Param 'object' is undefined`);
  if (object2 === null) throw new Error(`Param 'object' is null`);
  const split2 = path2.split(`.`);
  const v = getFieldImpl(object2, split2);
  return v;
};
var getFieldImpl = (object2, split2) => {
  if (object2 === void 0) throw new Error(`Param 'object' is undefined`);
  if (split2.length === 0) throw new Error(`Path has run out`);
  const start = split2.shift();
  if (!start) throw new Error(`Unexpected empty split path`);
  const isInt = isInteger(start);
  if (isInt && Array.isArray(object2)) {
    const index = Number.parseInt(start);
    if (typeof object2[index] === `undefined`) {
      return { success: false, error: `Index '${index}' does not exist. Length: ${object2.length}` };
    }
    if (split2.length === 0) {
      return { value: object2[index], success: true };
    } else {
      return getFieldImpl(object2[index], split2);
    }
  } else if (typeof object2 === `object` && start in object2) {
    if (split2.length === 0) {
      return { value: object2[start], success: true };
    } else {
      return getFieldImpl(object2[start], split2);
    }
  } else {
    return { success: false, error: `Path '${start}' not found` };
  }
};

// ../core/src/records/index.ts
var mapObjectKeys = (object2, mapFunction) => {
  const destinationObject = {};
  for (const entries of Object.entries(object2)) {
    const key = mapFunction(entries[0]);
    destinationObject[key] = entries[1];
  }
  return destinationObject;
};

// ../visual/src/canvas-helper.ts
var CanvasHelper = class extends SimpleEventEmitter {
  el;
  opts;
  #scaler;
  #scalerSize;
  #viewport = rect_exports.EmptyPositioned;
  #logicalSize = rect_exports.Empty;
  #ctx;
  #drawHelper;
  #resizer;
  #disposed = false;
  constructor(domQueryOrEl, opts = {}) {
    super();
    if (!domQueryOrEl) throw new Error(`Param 'domQueryOrEl' is null or undefined`);
    this.el = resolveEl(domQueryOrEl);
    if (this.el.nodeName !== `CANVAS`) {
      throw new Error(`Expected CANVAS HTML element. Got: ${this.el.nodeName}`);
    }
    const size = this.el.getBoundingClientRect();
    this.opts = {
      resizeLogic: opts.resizeLogic ?? `none`,
      disablePointerEvents: opts.disablePointerEvents ?? false,
      pixelZoom: opts.pixelZoom ?? (window.devicePixelRatio || 1),
      height: opts.height ?? size.height,
      width: opts.width ?? size.width,
      zIndex: opts.zIndex ?? -1,
      coordinateScale: opts.coordinateScale ?? `both`,
      onResize: opts.onResize,
      clearOnResize: opts.clearOnResize ?? true,
      draw: opts.draw,
      skipCss: opts.skipCss ?? false,
      colourSpace: `srgb`
    };
    this.#scaler = scaler2(`both`);
    this.#scalerSize = scaler2(`both`, size);
    this.#init();
  }
  getRectangle() {
    return {
      x: 0,
      y: 0,
      ...this.#logicalSize
    };
  }
  dispose(reason) {
    if (this.#disposed) return;
    this.#disposed = true;
    if (this.#resizer) {
      this.#resizer.dispose(`CanvasHelper disposing ${reason}`.trim());
      this.#resizer = void 0;
    }
  }
  #getContext(reset = false) {
    if (this.#ctx === void 0 || reset) {
      const ratio = this.ratio;
      const c4 = this.el.getContext(`2d`);
      if (c4 === null) throw new Error(`Could not create drawing context`);
      this.#ctx = c4;
      c4.setTransform(1, 0, 0, 1, 0, 0);
      c4.scale(ratio, ratio);
    }
    return this.#ctx;
  }
  /**
   * Gets the drawable area of the canvas.
   * This accounts for scaling due to high-DPI displays etc.
   * @returns 
   */
  getPhysicalSize() {
    return {
      width: this.width * this.ratio,
      height: this.height * this.ratio
    };
  }
  /**
   * Creates a drawing helper for the canvas.
   * If one is already created it is reused.
   */
  getDrawHelper() {
    if (!this.#drawHelper) {
      this.#drawHelper = makeHelper(this.#getContext(), {
        width: this.width,
        height: this.height
      });
    }
  }
  setLogicalSize(logicalSize) {
    rect_exports.guard(logicalSize, `logicalSize`);
    const logicalSizeInteger = rect_exports.applyFields((v) => Math.floor(v), logicalSize);
    const ratio = this.opts.pixelZoom;
    this.#scaler = scaler2(this.opts.coordinateScale, logicalSize);
    this.#scalerSize = scaler2(`both`, logicalSize);
    const pixelScaled = rect_exports.multiplyScalar(logicalSize, ratio);
    this.el.width = pixelScaled.width;
    this.el.height = pixelScaled.height;
    this.el.style.width = logicalSizeInteger.width.toString() + `px`;
    this.el.style.height = logicalSizeInteger.height.toString() + `px`;
    this.#getContext(true);
    if (this.opts.clearOnResize) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    this.#logicalSize = logicalSizeInteger;
    const r = this.opts.onResize;
    if (r) {
      setTimeout(() => {
        r(this.ctx, this.size, this);
      }, 100);
    }
    this.fireEvent(`resize`, { ctx: this.ctx, size: this.#logicalSize, helper: this });
  }
  #init() {
    const d2 = this.opts.draw;
    if (d2) {
      const sched = () => {
        d2(this.ctx, this.#logicalSize, this);
        requestAnimationFrame(sched);
      };
      setTimeout(() => {
        sched();
      }, 100);
    }
    if (!this.opts.disablePointerEvents) {
      this.#handleEvents();
    }
    const resizeLogic = this.opts.resizeLogic ?? `none`;
    if (resizeLogic === `none`) {
      this.setLogicalSize({ width: this.opts.width, height: this.opts.height });
    } else {
      const resizerOptions = {
        onSetSize: (size) => {
          if (rect_exports.isEqual(this.#logicalSize, size)) return;
          this.setLogicalSize(size);
        },
        naturalSize: { width: this.opts.width, height: this.opts.height },
        stretch: this.opts.resizeLogic ?? `none`
      };
      this.#resizer = new ElementSizer(this.el, resizerOptions);
    }
    this.#getContext();
  }
  #handleEvents() {
    const handlePointerEvent = (event2) => {
      const { offsetX, offsetY } = event2;
      const physicalX = offsetX * this.ratio;
      const physicalY = offsetY * this.ratio;
      event2 = cloneFromFields(event2);
      const eventData = {
        physicalX,
        physicalY,
        // eslint-disable-next-line @typescript-eslint/no-misused-spread
        ...event2
      };
      switch (event2.type) {
        case `pointerup`: {
          {
            this.fireEvent(`pointerup`, eventData);
            break;
          }
          ;
        }
        case `pointermove`: {
          {
            this.fireEvent(`pointermove`, eventData);
            break;
          }
          ;
        }
        case `pointerdown`: {
          {
            this.fireEvent(`pointerup`, eventData);
            break;
          }
          ;
        }
      }
      ;
    };
    this.el.addEventListener(`pointermove`, handlePointerEvent);
    this.el.addEventListener(`pointerdown`, handlePointerEvent);
    this.el.addEventListener(`pointerup`, handlePointerEvent);
  }
  /**
   * Clears the canvas.
   * 
   * Shortcut for:
   * `ctx.clearRect(0, 0, this.width, this.height)`
   */
  clear() {
    if (!this.#ctx) return;
    this.#ctx.clearRect(0, 0, this.width, this.height);
  }
  /**
   * Fills the canvas with a given colour.
   * 
   * Shortcut for:
   * ```js
      * ctx.fillStyle = ``;
   * ctx.fillRect(0, 0, this.width, this.height);
   * ```
   * @param colour Colour
   */
  fill(colour) {
    if (!this.#ctx) return;
    if (colour) this.#ctx.fillStyle = colour;
    this.#ctx.fillRect(0, 0, this.width, this.height);
  }
  /**
   * Gets the drawing context
   */
  get ctx() {
    if (this.#ctx === void 0) throw new Error(`Context not available`);
    return this.#getContext();
  }
  get viewport() {
    return this.#viewport;
  }
  /**
   * Gets the logical width of the canvas
   * See also: {@link height}, {@link size}
   */
  get width() {
    return this.#logicalSize.width;
  }
  /**
   * Gets the logical height of the canvas
   * See also: {@link width}, {@link size}
   */
  get height() {
    return this.#logicalSize.height;
  }
  /**
   * Gets the logical size of the canvas
   * See also: {@link width}, {@link height}
   */
  get size() {
    return this.#logicalSize;
  }
  /**
   * Gets the current scaling ratio being used
   * to compensate for high-DPI display
   */
  get ratio() {
    return window.devicePixelRatio || 1;
  }
  /**
   * Returns the width or height, whichever is smallest
   */
  get dimensionMin() {
    return Math.min(this.width, this.height);
  }
  /**
   * Returns the width or height, whichever is largest
   */
  get dimensionMax() {
    return Math.max(this.width, this.height);
  }
  drawBounds(strokeStyle = `green`) {
    const ctx = this.#getContext();
    rect(
      ctx,
      { x: 0, y: 0, width: this.width, height: this.height },
      { crossed: true, strokeStyle, strokeWidth: 1 }
    );
    rect(ctx, this.#viewport, { crossed: true, strokeStyle: `silver`, strokeWidth: 3 });
  }
  /**
   * Returns a Scaler that converts from absolute
   * to relative coordinates.
   * This is based on the canvas size.
   * 
   * ```js
      * // Assuming a canvas of 800x500
   * toRelative({ x: 800, y: 600 });  // { x: 1,   y: 1 }
   * toRelative({ x: 0, y: 0 });   // { x: 0,   y: 0 }
   * toRelative({ x: 400, y: 300 }); // { x: 0.5, y: 0.5 }
   * ```
   */
  get toRelative() {
    return this.#scaler.rel;
  }
  /**
   * Returns a scaler for points based on width & height
   */
  get toAbsoluteFixed() {
    return this.#scalerSize.abs;
  }
  /**
   * Returns a scaler for points based on width & height
   */
  get toRelativeFixed() {
    return this.#scalerSize.rel;
  }
  get logicalCenter() {
    return {
      x: this.#logicalSize.width / 2,
      y: this.#logicalSize.height / 2
    };
  }
  /**
  * Returns a Scaler that converts from relative to absolute
  * coordinates.
  * This is based on the canvas size.
  * 
  * ```js
  * // Assuming a canvas of 800x600
  * toAbsolute({ x: 1, y: 1 });      // { x: 800, y: 600}
  * toAbsolute({ x: 0, y: 0 });      // { x: 0, y: 0}
  * toAbsolute({ x: 0.5, y: 0.5 });  // { x: 400, y: 300}
  * ```
  */
  get toAbsolute() {
    return this.#scaler.abs;
  }
  /**
   * Gets the center coordinate of the canvas
   */
  get center() {
    return { x: this.width / 2, y: this.height / 2 };
  }
  /**
   * Gets the image data for the canvas.
   * Uses the 'physical' canvas size. Eg. A logical size of 400x400 might be
   * 536x536 with a high-DPI display.
   * @returns 
   */
  getImageData() {
    const size = this.getPhysicalSize();
    const data = this.ctx.getImageData(0, 0, size.width, size.height, { colorSpace: this.opts.colourSpace });
    if (data === null || data === void 0) throw new Error(`Could not get image data from context`);
    return data;
  }
  /**
   * Returns the canvas frame data as a writable grid.
   * When editing, make as many edits as needed before calling
   * `flip`, which writes buffer back to the canvas.
   * ```js
      * const g = helper.getWritableBuffer();
   * // Get {r,g,b,opacity} of pixel 10,10
   * const pixel = g.get({ x: 10, y: 10 });
   * 
   * // Set a colour to pixel 10,10
   * g.set({ r: 0.5, g: 1, b: 0, opacity: 0 }, { x: 10, y: 10 });
   * 
   * // Write buffer to canvas
   * g.flip();
   * ```
   * 
   * Uses 'physical' size of canvas. Eg with a high-DPI screen, this will
   * mean a higher number of rows and columns compared to the logical size.
   * @returns
   */
  getWritableBuffer() {
    const ctx = this.ctx;
    const data = this.getImageData();
    const grid3 = grid(data);
    const get4 = accessor(data);
    const set5 = setter(data);
    const flip2 = () => {
      ctx.putImageData(data, 0, 0);
    };
    return { grid: grid3, get: get4, set: set5, flip: flip2 };
  }
};

// ../visual/src/svg/apply.ts
var applyOpts2 = (elem, opts) => {
  if (opts.fillStyle) elem.setAttributeNS(null, `fill`, opts.fillStyle);
  if (opts.opacity) {
    elem.setAttributeNS(null, `opacity`, opts.opacity.toString());
  }
};

// ../visual/src/svg/create.ts
var createEl = (type2, id) => {
  const m3 = document.createElementNS(`http://www.w3.org/2000/svg`, type2);
  if (id) {
    m3.id = id;
  }
  return m3;
};
var createOrResolve = (parent, type2, queryOrExisting, suffix) => {
  let existing = null;
  if (queryOrExisting !== void 0) {
    existing = typeof queryOrExisting === `string` ? parent.querySelector(queryOrExisting) : queryOrExisting;
  }
  if (existing === null) {
    const p2 = document.createElementNS(`http://www.w3.org/2000/svg`, type2);
    parent.append(p2);
    if (queryOrExisting && typeof queryOrExisting === `string` && queryOrExisting.startsWith(`#`)) {
      p2.id = suffix !== void 0 && !queryOrExisting.endsWith(suffix) ? queryOrExisting.slice(1) + suffix : queryOrExisting.slice(1);
    }
    return p2;
  }
  return existing;
};

// ../visual/src/svg/elements.ts
var elements_exports = {};
__export(elements_exports, {
  circle: () => circle2,
  circleUpdate: () => circleUpdate,
  grid: () => grid2,
  group: () => group,
  groupUpdate: () => groupUpdate,
  line: () => line2,
  lineUpdate: () => lineUpdate,
  path: () => path,
  pathUpdate: () => pathUpdate,
  polarRayUpdate: () => polarRayUpdate,
  text: () => text,
  textPath: () => textPath,
  textPathUpdate: () => textPathUpdate,
  textUpdate: () => textUpdate
});

// ../visual/src/svg/stroke.ts
var applyStrokeOpts = (elem, opts) => {
  if (opts.strokeStyle) elem.setAttributeNS(null, `stroke`, opts.strokeStyle);
  if (opts.strokeWidth) {
    elem.setAttributeNS(null, `stroke-width`, opts.strokeWidth.toString());
  }
  if (opts.strokeDash) elem.setAttribute(`stroke-dasharray`, opts.strokeDash);
  if (opts.strokeLineCap) {
    elem.setAttribute(`stroke-linecap`, opts.strokeLineCap);
  }
};

// ../visual/src/svg/markers.ts
var createMarker = (id, opts, childCreator) => {
  const m3 = createEl(`marker`, id);
  if (opts.markerWidth) {
    m3.setAttribute(`markerWidth`, opts.markerWidth?.toString());
  }
  if (opts.markerHeight) {
    m3.setAttribute(`markerHeight`, opts.markerHeight?.toString());
  }
  if (opts.orient) m3.setAttribute(`orient`, opts.orient.toString());
  else m3.setAttribute(`orient`, `auto-start-reverse`);
  if (opts.viewBox) m3.setAttribute(`viewBox`, opts.viewBox.toString());
  if (opts.refX) m3.setAttribute(`refX`, opts.refX.toString());
  if (opts.refY) m3.setAttribute(`refY`, opts.refY.toString());
  if (childCreator) {
    const c4 = childCreator();
    m3.appendChild(c4);
  }
  return m3;
};
var markerPrebuilt = (elem, opts, _context) => {
  if (elem === null) return `(elem null)`;
  const parent = elem.ownerSVGElement;
  if (parent === null) throw new Error(`parent for elem is null`);
  const defsEl = createOrResolve(parent, `defs`, `defs`);
  let defEl = defsEl.querySelector(`#${opts.id}`);
  if (defEl !== null) {
    return `url(#${opts.id})`;
  }
  if (opts.id === `triangle`) {
    opts = { ...opts, strokeStyle: `transparent` };
    if (!opts.markerHeight) opts = { ...opts, markerHeight: 6 };
    if (!opts.markerWidth) opts = { ...opts, markerWidth: 6 };
    if (!opts.refX) opts = { ...opts, refX: opts.markerWidth };
    if (!opts.refY) opts = { ...opts, refY: opts.markerHeight };
    if (!opts.fillStyle || opts.fillStyle === `none`) {
      opts = { ...opts, fillStyle: `black` };
    }
    if (!opts.viewBox) opts = { ...opts, viewBox: `0 0 10 10` };
    defEl = createMarker(opts.id, opts, () => {
      const tri = createEl(`path`);
      tri.setAttribute(`d`, `M 0 0 L 10 5 L 0 10 z`);
      if (opts) applyOpts2(tri, opts);
      return tri;
    });
  } else throw new Error(`Do not know how to make ${opts.id}`);
  defEl.id = opts.id;
  defsEl.appendChild(defEl);
  return `url(#${opts.id})`;
};

// ../visual/src/svg/path.ts
var applyPathOpts = (elem, opts) => {
  if (opts.markerEnd) {
    elem.setAttribute(
      `marker-end`,
      markerPrebuilt(elem, opts.markerEnd, opts)
    );
  }
  if (opts.markerStart) {
    elem.setAttribute(
      `marker-start`,
      markerPrebuilt(elem, opts.markerStart, opts)
    );
  }
  if (opts.markerMid) {
    elem.setAttribute(
      `marker-mid`,
      markerPrebuilt(elem, opts.markerMid, opts)
    );
  }
};

// ../visual/src/svg/elements.ts
var numberOrPercentage = (v) => {
  if (v >= 0 && v <= 1) return `${v * 100}%`;
  return v.toString();
};
var path = (svgOrArray, parent, opts, queryOrExisting) => {
  const elem = createOrResolve(
    parent,
    `path`,
    queryOrExisting
  );
  const svg = typeof svgOrArray === `string` ? svgOrArray : svgOrArray.join(`
`);
  elem.setAttributeNS(null, `d`, svg);
  parent.append(elem);
  return pathUpdate(elem, opts);
};
var pathUpdate = (elem, opts) => {
  if (opts) applyOpts2(elem, opts);
  if (opts) applyStrokeOpts(elem, opts);
  return elem;
};
var circleUpdate = (elem, circle3, opts) => {
  elem.setAttributeNS(null, `cx`, circle3.x.toString());
  elem.setAttributeNS(null, `cy`, circle3.y.toString());
  elem.setAttributeNS(null, `r`, circle3.radius.toString());
  if (opts) applyOpts2(elem, opts);
  if (opts) applyStrokeOpts(elem, opts);
  return elem;
};
var circle2 = (circle3, parent, opts, queryOrExisting) => {
  const p2 = createOrResolve(
    parent,
    `circle`,
    queryOrExisting
  );
  return circleUpdate(p2, circle3, opts);
};
var group = (children, parent, queryOrExisting) => {
  const p2 = createOrResolve(parent, `g`, queryOrExisting);
  return groupUpdate(p2, children);
};
var groupUpdate = (elem, children) => {
  for (const c4 of children) {
    if (c4.parentNode !== elem) {
      elem.append(c4);
    }
  }
  return elem;
};
var line2 = (line4, parent, opts, queryOrExisting) => {
  const lineEl = createOrResolve(
    parent,
    `line`,
    queryOrExisting
  );
  return lineUpdate(lineEl, line4, opts);
};
var lineUpdate = (lineEl, line4, opts) => {
  lineEl.setAttributeNS(null, `x1`, line4.a.x.toString());
  lineEl.setAttributeNS(null, `y1`, line4.a.y.toString());
  lineEl.setAttributeNS(null, `x2`, line4.b.x.toString());
  lineEl.setAttributeNS(null, `y2`, line4.b.y.toString());
  if (opts) applyOpts2(lineEl, opts);
  if (opts) applyPathOpts(lineEl, opts);
  if (opts) applyStrokeOpts(lineEl, opts);
  return lineEl;
};
var polarRayUpdate = (lineEl, ray, opts) => {
  const l = polar_exports.Ray.toCartesian(ray);
  lineEl.setAttributeNS(null, `x1`, l.a.x.toString());
  lineEl.setAttributeNS(null, `y1`, l.a.y.toString());
  lineEl.setAttributeNS(null, `x2`, l.b.x.toString());
  lineEl.setAttributeNS(null, `y2`, l.b.y.toString());
  if (opts) applyOpts2(lineEl, opts);
  if (opts) applyPathOpts(lineEl, opts);
  if (opts) applyStrokeOpts(lineEl, opts);
  return lineEl;
};
var textPathUpdate = (el, text2, opts) => {
  if (opts?.method) el.setAttributeNS(null, `method`, opts.method);
  if (opts?.side) el.setAttributeNS(null, `side`, opts.side);
  if (opts?.spacing) el.setAttributeNS(null, `spacing`, opts.spacing);
  if (opts?.startOffset) {
    el.setAttributeNS(null, `startOffset`, numberOrPercentage(opts.startOffset));
  }
  if (opts?.textLength) {
    el.setAttributeNS(null, `textLength`, numberOrPercentage(opts.textLength));
  }
  if (text2) {
    el.textContent = text2;
  }
  if (opts) applyOpts2(el, opts);
  if (opts) applyStrokeOpts(el, opts);
  return el;
};
var textPath = (pathReference, text2, parent, opts, textQueryOrExisting, pathQueryOrExisting) => {
  const textEl = createOrResolve(
    parent,
    `text`,
    textQueryOrExisting,
    `-text`
  );
  textUpdate(textEl, void 0, void 0, opts);
  const p2 = createOrResolve(
    textEl,
    `textPath`,
    pathQueryOrExisting
  );
  p2.setAttributeNS(null, `href`, pathReference);
  return textPathUpdate(p2, text2, opts);
};
var textUpdate = (el, pos, text2, opts) => {
  if (pos) {
    el.setAttributeNS(null, `x`, pos.x.toString());
    el.setAttributeNS(null, `y`, pos.y.toString());
  }
  if (text2) {
    el.textContent = text2;
  }
  if (opts) {
    applyOpts2(el, opts);
    if (opts) applyStrokeOpts(el, opts);
    if (opts.anchor) el.setAttributeNS(null, `text-anchor`, opts.anchor);
    if (opts.align) el.setAttributeNS(null, `alignment-baseline`, opts.align);
    const userSelect = opts.userSelect ?? true;
    if (!userSelect) {
      el.style.userSelect = `none`;
      el.style.webkitUserSelect = `none`;
    }
  }
  return el;
};
var text = (text2, parent, pos, opts, queryOrExisting) => {
  const p2 = createOrResolve(
    parent,
    `text`,
    queryOrExisting
  );
  return textUpdate(p2, pos, text2, opts);
};
var grid2 = (parent, center4, spacing, width, height4, opts = {}) => {
  if (!opts.strokeStyle) {
    opts = { ...opts, strokeStyle: getCssVariable(`bg-dim`, `silver`) };
  }
  if (!opts.strokeWidth) opts = { ...opts, strokeWidth: 1 };
  const g2 = createEl(`g`);
  applyOpts2(g2, opts);
  applyPathOpts(g2, opts);
  applyStrokeOpts(g2, opts);
  let y = 0;
  while (y < height4) {
    const horiz = line_exports.fromNumbers(0, y, width, y);
    line2(horiz, g2);
    y += spacing;
  }
  let x = 0;
  while (x < width) {
    const vert = line_exports.fromNumbers(x, 0, x, height4);
    line2(vert, g2);
    x += spacing;
  }
  parent.append(g2);
  return g2;
};

// ../visual/src/pointer-visualise.ts
var pointerVisualise = (elOrQuery, options = {}) => {
  const touchRadius = options.touchRadius ?? 45;
  const mouseRadius = options.touchRadius ?? 20;
  const trace = options.trace ?? false;
  const hue = options.hue ?? 100;
  const startFillStyle = `hsla(${hue}, 100%, 10%, 10%)`;
  let currentHue = hue;
  const el = resolveEl(elOrQuery);
  const tracker = new PointsTracker({
    storeIntermediate: trace
  });
  const svg = document.createElementNS(
    `http://www.w3.org/2000/svg`,
    `svg`
  );
  svg.id = `pointerVis`;
  svg.style.zIndex = `-1000`;
  svg.style.position = `fixed`;
  svg.style.top = `0`;
  svg.style.left = `0`;
  svg.style.width = `100%`;
  svg.style.height = `100%`;
  svg.style.boxSizing = `border-box`;
  svg.style.border = `3px solid red`;
  svg.style.pointerEvents = `none`;
  svg.style.touchAction = `none`;
  const er = ElementSizer.svgViewport(svg);
  let pointerCount = 0;
  const lostPointer = (event2) => {
    const id = event2.pointerId.toString();
    tracker.delete(id);
    currentHue = hue;
    svg.querySelector(`#pv-start-${id}`)?.remove();
    for (let index = 0; index < pointerCount + 10; index++) {
      svg.querySelector(`#pv-progress-${id}-${index}`)?.remove();
    }
    pointerCount = 0;
  };
  const trackPointer = async (event2) => {
    const id = event2.pointerId.toString();
    const pt = { x: event2.x, y: event2.y };
    const type2 = event2.pointerType;
    if (event2.type === `pointermove` && !tracker.has(id)) {
      return;
    }
    const info = await tracker.seen(event2.pointerId.toString(), { x: event2.clientX, y: event2.clientY });
    if (info.values.length === 1) {
      const el3 = elements_exports.circle(
        {
          ...info.values[0],
          radius: type2 === `touch` ? touchRadius : mouseRadius
        },
        svg,
        {
          fillStyle: startFillStyle
        },
        `#pv-start-${id}`
      );
      el3.style.pointerEvents = `none`;
      el3.style.touchAction = `none`;
    }
    const fillStyle = `hsla(${currentHue}, 100%, 50%, 50%)`;
    const el2 = elements_exports.circle(
      { ...pt, radius: type2 === `touch` ? touchRadius : mouseRadius },
      svg,
      {
        fillStyle
      },
      `#pv-progress-${id}-${info.values.length}`
    );
    el2.style.pointerEvents = `none`;
    el2.style.touchAction = `none`;
    currentHue += 1;
    pointerCount = info.values.length;
  };
  document.body.append(svg);
  el.addEventListener(`pointerdown`, trackPointer);
  el.addEventListener(`pointermove`, trackPointer);
  el.addEventListener(`pointerup`, lostPointer);
  el.addEventListener(`pointerleave`, lostPointer);
  el.addEventListener(`contextmenu`, (event2) => {
    event2.preventDefault();
  });
};

// ../visual/src/named-colour-palette.ts
var named_colour_palette_exports = {};
__export(named_colour_palette_exports, {
  create: () => create3
});
var create3 = (fallbacks) => new NamedColourPaletteImpl(fallbacks);
var NamedColourPaletteImpl = class {
  #store = /* @__PURE__ */ new Map();
  #aliases = /* @__PURE__ */ new Map();
  fallbacks;
  #lastFallback = 0;
  #elementBase;
  constructor(fallbacks) {
    if (fallbacks !== void 0) this.fallbacks = fallbacks;
    else this.fallbacks = [`red`, `blue`, `green`, `orange`];
    this.#elementBase = document.body;
  }
  setElementBase(el) {
    this.#elementBase = el;
  }
  add(key, colour) {
    this.#store.set(key, colour);
  }
  alias(from2, to4) {
    this.#aliases.set(from2, to4);
  }
  get(key, fallback) {
    const alias = this.#aliases.get(key);
    if (alias !== void 0) key = alias;
    const c4 = this.#store.get(key);
    if (c4 !== void 0) return c4;
    const variableName = `--` + key;
    let fromCss = getComputedStyle(this.#elementBase).getPropertyValue(variableName).trim();
    if (fromCss === void 0 || fromCss.length === 0) {
      if (fallback !== void 0) return fallback;
      fromCss = this.fallbacks[this.#lastFallback];
      this.#lastFallback++;
      if (this.#lastFallback === this.fallbacks.length) this.#lastFallback = 0;
    }
    return fromCss;
  }
  getOrAdd(key, fallback) {
    if (this.has(key)) return this.get(key);
    const c4 = this.get(key, fallback);
    this.add(key, c4);
    return c4;
  }
  has(key) {
    return this.#store.has(key);
  }
};

// ../visual/src/video.ts
var video_exports = {};
__export(video_exports, {
  capture: () => capture,
  frames: () => frames,
  manualCapture: () => manualCapture
});

// ../flow/src/delay.ts
async function* delayAnimationLoop() {
  let resolve2;
  let p2 = new Promise((r) => resolve2 = r);
  let timer = 0;
  const callback = () => {
    if (resolve2) resolve2();
    p2 = new Promise((r) => resolve2 = r);
  };
  try {
    while (true) {
      timer = globalThis.requestAnimationFrame(callback);
      const _ = await p2;
      yield _;
    }
  } finally {
    if (resolve2) resolve2();
    globalThis.cancelAnimationFrame(timer);
  }
}
async function* delayLoop(timeout2) {
  const timeoutMs = intervalToMs(timeout2);
  if (typeof timeoutMs === `undefined`) throw new Error(`timeout is undefined`);
  if (timeoutMs < 0) throw new Error(`Timeout is less than zero`);
  if (timeoutMs === 0) return yield* delayAnimationLoop();
  let resolve2;
  let p2 = new Promise((r) => resolve2 = r);
  let timer;
  const callback = () => {
    if (resolve2) resolve2();
    p2 = new Promise((r) => resolve2 = r);
  };
  try {
    while (true) {
      timer = globalThis.setTimeout(callback, timeoutMs);
      const _ = await p2;
      yield _;
    }
  } finally {
    if (resolve2) resolve2();
    if (timer !== void 0) globalThis.clearTimeout(timer);
    timer = void 0;
  }
}

// ../flow/src/dispatch-list.ts
var DispatchList = class {
  #handlers;
  #counter = 0;
  #id = Math.floor(Math.random() * 100);
  constructor() {
    this.#handlers = [];
  }
  /**
   * Returns _true_ if list is empty
   * @returns 
   */
  isEmpty() {
    return this.#handlers.length === 0;
  }
  /**
   * Adds a handler
   * @param handler 
   * @param options 
   * @returns 
   */
  add(handler, options = {}) {
    this.#counter++;
    const once = options.once ?? false;
    const wrap7 = {
      id: `${this.#id} - ${this.#counter}`,
      handler,
      once
    };
    this.#handlers.push(wrap7);
    return wrap7.id;
  }
  remove(id) {
    const length5 = this.#handlers.length;
    this.#handlers = this.#handlers.filter((handler) => handler.id !== id);
    return this.#handlers.length !== length5;
  }
  notify(value) {
    for (const handler of this.#handlers) {
      handler.handler(value);
      if (handler.once) {
        this.remove(handler.id);
      }
    }
  }
  clear() {
    this.#handlers = [];
  }
};

// ../flow/src/timeout.ts
var timeout = (callback, interval) => {
  if (callback === void 0) {
    throw new Error(`callback parameter is undefined`);
  }
  const intervalMs = intervalToMs(interval);
  throwIntegerTest(intervalMs, `aboveZero`, `interval`);
  let timer;
  let startedAt = 0;
  let startCount = 0;
  let startCountTotal = 0;
  let state = `idle`;
  const clear = () => {
    startedAt = 0;
    globalThis.clearTimeout(timer);
    state = `idle`;
  };
  const start = async (altInterval = interval, args) => {
    const p2 = new Promise((resolve2, reject) => {
      startedAt = performance.now();
      const altTimeoutMs = intervalToMs(altInterval);
      const it = integerTest(altTimeoutMs, `aboveZero`, `altTimeoutMs`);
      if (!it[0]) {
        reject(new Error(it[1]));
        return;
      }
      switch (state) {
        case `scheduled`: {
          cancel();
          break;
        }
        case `running`: {
          break;
        }
      }
      state = `scheduled`;
      timer = globalThis.setTimeout(async () => {
        if (state !== `scheduled`) {
          console.warn(`Timeout skipping execution since state is not 'scheduled'`);
          clear();
          return;
        }
        const args_ = args ?? [];
        startCount++;
        startCountTotal++;
        state = `running`;
        await callback(performance.now() - startedAt, ...args_);
        state = `idle`;
        clear();
        resolve2();
      }, altTimeoutMs);
    });
    return p2;
  };
  const cancel = () => {
    if (state === `idle`) return;
    clear();
  };
  return {
    start,
    cancel,
    get runState() {
      return state;
    },
    get startCount() {
      return startCount;
    },
    get startCountTotal() {
      return startCountTotal;
    }
  };
};

// ../flow/src/repeat.ts
async function* repeat(produce, opts) {
  const signal = opts.signal ?? void 0;
  const delayWhen = opts.delayWhen ?? `before`;
  const count3 = opts.count ?? void 0;
  const allowUndefined = opts.allowUndefined ?? false;
  const minIntervalMs = opts.delayMinimum ? intervalToMs(opts.delayMinimum) : void 0;
  const whileFunction = opts.while;
  let cancelled = false;
  let sleepMs = intervalToMs(opts.delay, intervalToMs(opts.delayMinimum, 0));
  let started = performance.now();
  const doDelay = async () => {
    const elapsed3 = performance.now() - started;
    if (typeof minIntervalMs !== `undefined`) {
      sleepMs = Math.max(0, minIntervalMs - elapsed3);
    }
    if (sleepMs) {
      await sleep({ millis: sleepMs, signal });
    }
    started = performance.now();
    if (signal?.aborted) throw new Error(`Signal aborted ${signal.reason}`);
  };
  if (Array.isArray(produce)) produce = produce.values();
  if (opts.onStart) opts.onStart();
  let errored = true;
  let loopedTimes = 0;
  try {
    while (!cancelled) {
      loopedTimes++;
      if (delayWhen === `before` || delayWhen === `both`) await doDelay();
      const result = await resolve(produce);
      if (typeof result === `undefined` && !allowUndefined) {
        cancelled = true;
      } else {
        yield result;
        if (delayWhen === `after` || delayWhen === `both`) await doDelay();
        if (count3 !== void 0 && loopedTimes >= count3) cancelled = true;
      }
      if (whileFunction) {
        if (!whileFunction(loopedTimes)) {
          cancelled = true;
        }
      }
    }
    errored = false;
  } finally {
    cancelled = true;
    if (opts.onComplete) opts.onComplete(errored);
  }
}

// ../flow/src/timer.ts
function ofTotal(duration, opts = {}) {
  const totalMs = intervalToMs(duration);
  if (!totalMs) throw new Error(`Param 'duration' not valid`);
  const timerOpts = {
    ...opts,
    timer: elapsedMillisecondsAbsolute()
  };
  let t2;
  return () => {
    t2 ??= relative(totalMs, timerOpts);
    return t2.elapsed;
  };
}
function ofTotalTicks(totalTicks, opts = {}) {
  const timerOpts = {
    ...opts,
    timer: elapsedTicksAbsolute()
  };
  let t2;
  return () => {
    t2 ??= relative(totalTicks, timerOpts);
    return t2.elapsed;
  };
}
var timerAlwaysDone = () => ({
  elapsed: 1,
  isDone: true,
  reset() {
  },
  mod(amt) {
  }
});
var timerNeverDone = () => ({
  elapsed: 0,
  isDone: false,
  reset() {
  },
  mod() {
  }
});
var relative = (total2, options = {}) => {
  if (!Number.isFinite(total2)) {
    return timerAlwaysDone();
  } else if (Number.isNaN(total2)) {
    return timerNeverDone();
  }
  const clampValue = options.clampValue ?? false;
  const wrapValue = options.wrapValue ?? false;
  if (clampValue && wrapValue) throw new Error(`clampValue and wrapValue cannot both be enabled`);
  let modulationAmount = 1;
  const timer = options.timer ?? elapsedMillisecondsAbsolute();
  let lastValue = 0;
  const computeElapsed = (value) => {
    lastValue = value;
    let v = value / (total2 * modulationAmount);
    if (clampValue) v = clamp(v);
    else if (wrapValue && v >= 1) v = v % 1;
    return v;
  };
  return {
    mod(amt) {
      modulationAmount = amt;
    },
    get isDone() {
      return computeElapsed(lastValue) >= 1;
    },
    get elapsed() {
      return computeElapsed(timer.elapsed);
    },
    reset: () => {
      timer.reset();
    }
  };
};
var frequencyTimer = (frequency, options = {}) => {
  const timer = options.timer ?? elapsedMillisecondsAbsolute();
  const cyclesPerSecond = frequency / 1e3;
  let modulationAmount = 1;
  const computeElapsed = () => {
    const v = timer.elapsed * (cyclesPerSecond * modulationAmount);
    const f = v - Math.floor(v);
    if (f < 0) {
      throw new Error(
        `Unexpected cycle fraction less than 0. Elapsed: ${v} f: ${f}`
      );
    }
    if (f > 1) {
      throw new Error(
        `Unexpected cycle fraction more than 1. Elapsed: ${v} f: ${f}`
      );
    }
    return f;
  };
  return {
    mod: (amt) => {
      modulationAmount = amt;
    },
    reset: () => {
      timer.reset();
    },
    get isDone() {
      return computeElapsed() >= 1;
    },
    get elapsed() {
      return computeElapsed();
    }
  };
};
var elapsedMillisecondsAbsolute = () => {
  let start = performance.now();
  return {
    /**
     * Reset timer
     */
    reset: () => {
      start = performance.now();
    },
    /**
     * Returns elapsed time since start
     */
    get elapsed() {
      return performance.now() - start;
    }
  };
};
var elapsedTicksAbsolute = () => {
  let start = 0;
  return {
    /**
     * Reset ticks to 0. The next call to `elapsed` will return 1.
     */
    reset: () => {
      start = 0;
    },
    /**
     * Get current ticks without incrementing.
     */
    get peek() {
      return start;
    },
    /**
     * Returns the number of elapsed ticks as well as
     * incrementing the tick count. 
     * 
     * Minimum is 1
     * 
     * Use {@link peek} to get the current ticks without incrementing.
     */
    get elapsed() {
      return ++start;
    }
  };
};
var timerWithFunction = (fn, timer) => {
  if (typeof fn !== `function`) throw new Error(`Param 'fn' should be a function. Got: ${typeof fn}`);
  let startCount = 1;
  return {
    get elapsed() {
      return timer.elapsed;
    },
    get isDone() {
      return timer.isDone;
    },
    get runState() {
      if (timer.isDone) return `idle`;
      return `scheduled`;
    },
    /**
     * Returns 1 if it has been created, returns +1 for each additional time the timer has been reset.
     */
    get startCount() {
      return startCount;
    },
    get startCountTotal() {
      return startCount;
    },
    compute: () => {
      const elapsed3 = timer.elapsed;
      return fn(elapsed3);
    },
    reset: () => {
      timer.reset();
      startCount++;
    }
  };
};

// ../visual/src/video.ts
async function* frames(sourceVideoEl, opts = {}) {
  const maxIntervalMs = opts.maxIntervalMs ?? 0;
  const showCanvas = opts.showCanvas ?? false;
  let canvasEl = opts.canvasEl;
  let w, h;
  w = h = 0;
  if (canvasEl === void 0) {
    canvasEl = document.createElement(`CANVAS`);
    canvasEl.classList.add(`ixfx-frames`);
    if (!showCanvas) {
      canvasEl.style.display = `none`;
    }
    document.body.appendChild(canvasEl);
  }
  const updateSize = () => {
    if (canvasEl === void 0) return;
    w = sourceVideoEl.videoWidth;
    h = sourceVideoEl.videoHeight;
    canvasEl.width = w;
    canvasEl.height = h;
  };
  let c4 = null;
  const looper = delayLoop(maxIntervalMs);
  for await (const _ of looper) {
    if (w === 0 || h === 0) updateSize();
    if (w === 0 || h === 0) continue;
    if (c4 === null) c4 = canvasEl.getContext(`2d`);
    if (c4 === null) return;
    c4.drawImage(sourceVideoEl, 0, 0, w, h);
    const pixels = c4.getImageData(0, 0, w, h);
    yield pixels;
  }
}
var capture = (sourceVideoEl, opts = {}) => {
  const maxIntervalMs = opts.maxIntervalMs ?? 0;
  const showCanvas = opts.showCanvas ?? false;
  const onFrame = opts.onFrame;
  const w = sourceVideoEl.videoWidth;
  const h = sourceVideoEl.videoHeight;
  const canvasEl = document.createElement(`CANVAS`);
  canvasEl.classList.add(`ixfx-capture`);
  if (!showCanvas) {
    canvasEl.style.display = `none`;
  }
  canvasEl.width = w;
  canvasEl.height = h;
  let c4 = null;
  let worker;
  if (opts.workerScript) {
    worker = new Worker(opts.workerScript);
  }
  const getPixels = worker || onFrame;
  if (!getPixels && !showCanvas) {
    console.warn(
      `Video will be captured to hidden element without any processing. Is this what you want?`
    );
  }
  const loop = continuously(() => {
    if (c4 === null) c4 = canvasEl.getContext(`2d`);
    if (c4 === null) return;
    c4.drawImage(sourceVideoEl, 0, 0, w, h);
    let pixels;
    if (getPixels) {
      pixels = c4.getImageData(0, 0, w, h);
    }
    if (worker) {
      worker.postMessage(
        {
          pixels: pixels.data.buffer,
          width: w,
          height: h,
          channels: 4
        },
        [pixels.data.buffer]
      );
    }
    if (onFrame) {
      try {
        onFrame(pixels);
      } catch (e) {
        console.error(e);
      }
    }
  }, maxIntervalMs);
  return {
    start: () => {
      loop.start();
    },
    cancel: () => {
      loop.cancel();
    },
    canvasEl
  };
};
var manualCapture = (sourceVideoEl, opts = {}) => {
  const showCanvas = opts.showCanvas ?? false;
  const w = sourceVideoEl.videoWidth;
  const h = sourceVideoEl.videoHeight;
  const definedCanvasEl = opts.canvasEl !== void 0;
  let canvasEl = opts.canvasEl;
  if (!canvasEl) {
    canvasEl = document.createElement(`CANVAS`);
    canvasEl.classList.add(`ixfx-capture`);
    document.body.append(canvasEl);
    if (!showCanvas) canvasEl.style.display = `none`;
  }
  canvasEl.width = w;
  canvasEl.height = h;
  const capture2 = () => {
    let c5;
    if (!c5) c5 = canvasEl.getContext(`2d`, { willReadFrequently: true });
    if (!c5) throw new Error(`Could not create graphics context`);
    c5.drawImage(sourceVideoEl, 0, 0, w, h);
    const pixels = c5.getImageData(0, 0, w, h);
    pixels.currentTime = sourceVideoEl.currentTime;
    if (opts.postCaptureDraw) opts.postCaptureDraw(c5, w, h);
    return pixels;
  };
  const dispose = () => {
    if (definedCanvasEl) return;
    try {
      canvasEl.remove();
    } catch (_) {
    }
  };
  const c4 = {
    canvasEl,
    capture: capture2,
    dispose
  };
  return c4;
};

// ../visual/src/index.ts
try {
  if (typeof window !== `undefined`) {
    window.ixfx = {
      ...window.ixfx,
      Visuals: {
        NamedColourPalette: named_colour_palette_exports,
        Colour: colour_exports,
        Video: video_exports
      }
    };
  }
} catch {
}

// geometry.ts
var geometry_exports = {};
__export(geometry_exports, {
  Arcs: () => arc_exports,
  Beziers: () => bezier_exports,
  Circles: () => circle_exports,
  Compound: () => compound_path_exports,
  CurveSimplification: () => curve_simplification_exports,
  Ellipses: () => ellipse_exports,
  Grids: () => grid_exports,
  Layouts: () => layout_exports,
  Lines: () => line_exports,
  Paths: () => path_exports,
  Points: () => point_exports,
  Polar: () => polar_exports,
  QuadTree: () => quad_tree_exports,
  Rects: () => rect_exports,
  Shapes: () => shape_exports,
  SurfacePoints: () => surface_points_exports,
  Triangles: () => triangle_exports,
  Vectors: () => vector_exports,
  Waypoints: () => waypoint_exports,
  degreeArc: () => degreeArc,
  degreeToRadian: () => degreeToRadian,
  degreesSum: () => degreesSum,
  radianArc: () => radianArc,
  radianInvert: () => radianInvert,
  radianToDegree: () => radianToDegree,
  radiansFromAxisX: () => radiansFromAxisX,
  radiansSum: () => radiansSum,
  scaler: () => scaler2
});

// modulation.ts
var modulation_exports = {};
__export(modulation_exports, {
  Easings: () => easing_exports,
  Forces: () => forces_exports,
  Modulation: () => envelope_exports,
  Oscillators: () => oscillator_exports,
  Sources: () => source_exports,
  arcShape: () => arcShape,
  crossfade: () => crossfade,
  cubicBezierShape: () => cubicBezierShape,
  drift: () => drift,
  gaussian: () => gaussian,
  interpolate: () => interpolate8,
  interpolateAngle: () => interpolateAngle2,
  interpolatorInterval: () => interpolatorInterval,
  interpolatorStepped: () => interpolatorStepped2,
  jitter: () => jitter,
  jitterAbsolute: () => jitterAbsolute,
  mix: () => mix2,
  mixModulators: () => mixModulators,
  noop: () => noop,
  pingPong: () => pingPong,
  pingPongPercent: () => pingPongPercent,
  sineBipolarShape: () => sineBipolarShape,
  sineShape: () => sineShape,
  spring: () => spring,
  springShape: () => springShape,
  springValue: () => springValue,
  squareShape: () => squareShape,
  tickModulator: () => tickModulator,
  ticks: () => ticks2,
  time: () => time,
  timeModulator: () => timeModulator,
  timingSourceFactory: () => timingSourceFactory,
  triangleShape: () => triangleShape,
  wave: () => wave,
  waveFromSource: () => waveFromSource,
  weighted: () => weighted,
  weightedAverage: () => weightedAverage,
  weightedSource: () => weightedSource
});

// ../modulation/src/envelope/index.ts
var envelope_exports = {};
__export(envelope_exports, {
  Adsr: () => Adsr,
  AdsrBase: () => AdsrBase,
  AdsrIterator: () => AdsrIterator,
  adsr: () => adsr,
  adsrIterable: () => adsrIterable,
  adsrStateTransitions: () => adsrStateTransitions,
  defaultAdsrOpts: () => defaultAdsrOpts,
  defaultAdsrTimingOpts: () => defaultAdsrTimingOpts
});

// ../modulation/src/envelope/Types.ts
var adsrStateTransitions = Object.freeze({
  attack: [`decay`, `release`],
  decay: [`sustain`, `release`],
  sustain: [`release`],
  release: [`complete`],
  complete: null
});

// ../flow/src/state-machine/state-machine.ts
var cloneState = (toClone) => {
  return Object.freeze({
    value: toClone.value,
    visited: [...toClone.visited],
    machine: toClone.machine
  });
};
var init2 = (stateMachine, initialState) => {
  const [machine, machineValidationError] = validateMachine(stateMachine);
  if (!machine) throw new Error(machineValidationError);
  const state = (
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    initialState ?? Object.keys(machine.states)[0]
  );
  if (typeof machine.states[state] === `undefined`) {
    throw new TypeError(`Initial state ('${state}') not found`);
  }
  const transitions = validateAndNormaliseTransitions(machine.states);
  if (transitions === void 0) {
    throw new Error(`Could not normalise transitions`);
  }
  return Object.freeze({
    value: state,
    visited: [],
    machine: Object.freeze(Object.fromEntries(transitions))
  });
};
var validateMachine = (smOrTransitions) => {
  if (typeof smOrTransitions === `undefined`) {
    return [void 0, `Parameter undefined`];
  }
  if (smOrTransitions === null) {
    return [void 0, `Parameter null`];
  }
  if (`states` in smOrTransitions) {
    return [smOrTransitions, ``];
  }
  if (typeof smOrTransitions === `object`) {
    return [
      {
        states: smOrTransitions
      },
      ``
    ];
  }
  return [
    void 0,
    `Unexpected type: ${typeof smOrTransitions}. Expected object`
  ];
};
var isDone = (sm) => {
  return possible(sm).length === 0;
};
var possibleTargets = (sm) => {
  validateMachineState(sm);
  const fromS = sm.machine[sm.value];
  if (fromS.length === 1 && fromS[0].state === null) return [];
  return fromS;
};
var possible = (sm) => {
  const targets = possibleTargets(sm);
  return targets.map((v) => v.state);
};
var normaliseTargets = (targets) => {
  const normaliseSingleTarget = (target) => {
    if (target === null) return { state: null };
    if (typeof target === `string`) {
      return {
        state: target
      };
    } else if (typeof target === `object` && `state` in target) {
      const targetState = target.state;
      if (typeof targetState !== `string`) {
        throw new TypeError(
          `Target 'state' field is not a string. Got: ${typeof targetState}`
        );
      }
      if (`preconditions` in target) {
        return {
          state: targetState,
          preconditions: target.preconditions
        };
      }
      return { state: targetState };
    } else {
      throw new Error(
        `Unexpected type: ${typeof target}. Expected string or object with 'state' field.`
      );
    }
  };
  if (Array.isArray(targets)) {
    let containsNull = false;
    const mapResults = targets.map((t2) => {
      const r = normaliseSingleTarget(t2);
      if (!r) throw new Error(`Invalid target`);
      containsNull = containsNull || r.state === null;
      return r;
    });
    if (containsNull && mapResults.length > 1) {
      throw new Error(`Cannot have null as an possible state`);
    }
    return mapResults;
  } else {
    const target = normaliseSingleTarget(targets);
    if (!target) return;
    return [target];
  }
};
var validateAndNormaliseTransitions = (d2) => {
  const returnMap = /* @__PURE__ */ new Map();
  for (const [topLevelState, topLevelTargets] of Object.entries(d2)) {
    if (typeof topLevelState === `undefined`) {
      throw new TypeError(`Top-level undefined state`);
    }
    if (typeof topLevelTargets === `undefined`) {
      throw new TypeError(`Undefined target state for ${topLevelState}`);
    }
    if (returnMap.has(topLevelState)) {
      throw new Error(`State defined twice: ${topLevelState}`);
    }
    if (topLevelState.includes(` `)) {
      throw new Error(`State names cannot contain spaces`);
    }
    returnMap.set(topLevelState, []);
  }
  for (const [topLevelState, topLevelTargets] of Object.entries(d2)) {
    const targets = normaliseTargets(topLevelTargets);
    if (targets === void 0) throw new Error(`Could not normalise target`);
    if (targets !== null) {
      const seenStates = /* @__PURE__ */ new Set();
      for (const target of targets) {
        if (seenStates.has(target.state)) {
          throw new Error(
            `Target state '${target.state}' already exists for '${topLevelState}'`
          );
        }
        seenStates.add(target.state);
        if (target.state === null) continue;
        if (!returnMap.has(target.state)) {
          throw new Error(
            `Target state '${target.state}' is not defined as a top-level state. Defined under: '${topLevelState}'`
          );
        }
      }
      returnMap.set(topLevelState, targets);
    }
  }
  return returnMap;
};
var validateMachineState = (state) => {
  if (typeof state === `undefined`) {
    throw new TypeError(`Param 'state' is undefined`);
  }
  if (typeof state.value !== `string`) {
    throw new TypeError(`Existing state is not a string`);
  }
};
var to2 = (sm, toState) => {
  validateMachineState(sm);
  validateTransition(sm, toState);
  return Object.freeze({
    value: toState,
    machine: sm.machine,
    visited: unique([sm.visited, [sm.value]])
  });
};
var isValidTransition = (sm, toState) => {
  try {
    validateTransition(sm, toState);
    return true;
  } catch {
    return false;
  }
};
var validateTransition = (sm, toState) => {
  if (toState === null) throw new Error(`Cannot transition to null state`);
  if (typeof toState === `undefined`) {
    throw new Error(`Cannot transition to undefined state`);
  }
  if (typeof toState !== `string`) {
    throw new TypeError(
      `Parameter 'toState' should be a string. Got: ${typeof toState}`
    );
  }
  const p2 = possible(sm);
  if (p2.length === 0) throw new Error(`Machine is in terminal state`);
  if (!p2.includes(toState)) {
    throw new Error(
      `Target state '${toState}' not available at current state '${sm.value}'. Possible states: ${p2.join(`, `)}`
    );
  }
};

// ../flow/src/state-machine/with-events.ts
var StateMachineWithEvents = class extends SimpleEventEmitter {
  #sm;
  #smInitial;
  #debug;
  #isDoneNeedsFiring = false;
  #isDone = false;
  #changedAt = elapsedInfinity();
  /**
   * Create a state machine with initial state, description and options
   * @param m Machine description
   * @param opts Options for machine (defaults to `{debug:false}`)
   */
  constructor(m3, opts = {}) {
    super();
    this.#debug = opts.debug ?? false;
    this.#sm = init2(m3, opts.initial);
    this.#smInitial = cloneState(this.#sm);
  }
  #setIsDone(v) {
    if (this.#isDone === v) return;
    this.#isDone = v;
    if (v) {
      this.#isDoneNeedsFiring = true;
      setTimeout(() => {
        if (!this.#isDoneNeedsFiring) return;
        this.#isDoneNeedsFiring = false;
        this.fireEvent(`stop`, { state: this.#sm.value });
      }, 2);
    } else {
      this.#isDoneNeedsFiring = false;
    }
  }
  /**
   * Return a list of possible states from current state.
   *
   * If list is empty, no states are possible. Otherwise lists
   * possible states, including 'null' for terminal
   */
  get statesPossible() {
    return possible(this.#sm);
  }
  /**
   * Return a list of all defined states
   */
  get statesDefined() {
    return Object.keys(this.#sm.machine);
  }
  /**
   * Moves to the next state if possible. If multiple states are possible, it will use the first.
   * If machine is finalised, no error is thrown and null is returned.
   *
   * @returns {(string|null)} Returns new state, or null if machine is finalised
   */
  next() {
    const p2 = possible(this.#sm);
    if (p2.length === 0) return null;
    this.state = p2[0];
    return p2[0];
  }
  /**
   * Returns _true_ if state machine is in its final state
   *
   * @returns
   */
  get isDone() {
    return isDone(this.#sm);
  }
  /**
   * Resets machine to initial state
   */
  reset() {
    this.#setIsDone(false);
    this.#sm = cloneState(this.#smInitial);
    this.#changedAt = elapsedSince();
  }
  /**
   * Throws if it's not valid to transition to `newState`
   * @param newState
   * @returns
   */
  validateTransition(newState) {
    validateTransition(this.#sm, newState);
  }
  /**
   * Returns _true_ if `newState` is valid transition from current state.
   * Use {@link validateTransition} if you want an explanation for the _false_ results.
   * @param newState
   * @returns
   */
  isValid(newState) {
    return isValidTransition(this.#sm, newState);
  }
  /**
   * Gets or sets state. Throws an error if an invalid transition is attempted.
   * Use `isValid()` to check validity without changing.
   *
   * If `newState` is the same as current state, the request is ignored silently.
   */
  set state(newState) {
    const priorState = this.#sm.value;
    if (newState === this.#sm.value) return;
    this.#sm = to2(this.#sm, newState);
    if (this.#debug) {
      console.log(`StateMachine: ${priorState} -> ${newState}`);
    }
    this.#changedAt = elapsedSince();
    setTimeout(() => {
      this.fireEvent(`change`, { newState, priorState });
    }, 1);
    if (isDone(this.#sm)) this.#setIsDone(true);
  }
  get state() {
    return this.#sm.value;
  }
  /**
   * Returns timestamp when state was last changed.
   * See also `elapsed`
   */
  get changedAt() {
    return this.#changedAt();
  }
  /**
   * Returns milliseconds elapsed since last state change.
   * See also `changedAt`
   */
  get elapsed() {
    return this.#changedAt();
  }
};

// ../modulation/src/envelope/AdsrBase.ts
var defaultAdsrTimingOpts = Object.freeze({
  attackDuration: 600,
  decayDuration: 200,
  releaseDuration: 800,
  shouldLoop: false
});
var AdsrBase = class extends SimpleEventEmitter {
  #sm;
  #timeSource;
  #timer;
  #holding;
  #holdingInitial;
  #disposed = false;
  #triggered = false;
  attackDuration;
  decayDuration;
  releaseDuration;
  decayDurationTotal;
  /**
   * If _true_ envelope will loop
   */
  shouldLoop;
  constructor(opts = {}) {
    super();
    this.attackDuration = opts.attackDuration ?? defaultAdsrTimingOpts.attackDuration;
    this.decayDuration = opts.decayDuration ?? defaultAdsrTimingOpts.decayDuration;
    this.releaseDuration = opts.releaseDuration ?? defaultAdsrTimingOpts.releaseDuration;
    this.shouldLoop = opts.shouldLoop ?? defaultAdsrTimingOpts.shouldLoop;
    this.#sm = new StateMachineWithEvents(
      adsrStateTransitions,
      { initial: `attack` }
    );
    this.#sm.addEventListener(`change`, (event2) => {
      if (event2.newState === `release` && this.#holdingInitial) {
        this.#timer?.reset();
      }
      super.fireEvent(`change`, event2);
    });
    this.#sm.addEventListener(`stop`, (event2) => {
      super.fireEvent(`complete`, event2);
    });
    this.#timeSource = () => elapsedMillisecondsAbsolute();
    this.#holding = this.#holdingInitial = false;
    this.decayDurationTotal = this.attackDuration + this.decayDuration;
  }
  dispose() {
    if (this.#disposed) return;
    this.#sm.dispose();
  }
  get isDisposed() {
    return this.#disposed;
  }
  /**
   * Changes state based on timer status
   * @returns _True_ if state was changed
   */
  switchStateIfNeeded(allowLooping) {
    if (this.#timer === void 0) return false;
    let elapsed3 = this.#timer.elapsed;
    const wasHeld = this.#holdingInitial && !this.#holding;
    let hasChanged = false;
    let state = this.#sm.state;
    do {
      hasChanged = false;
      state = this.#sm.state;
      switch (state) {
        case `attack`: {
          if (elapsed3 > this.attackDuration || wasHeld) {
            this.#sm.next();
            hasChanged = true;
          }
          break;
        }
        case `decay`: {
          if (elapsed3 > this.decayDurationTotal || wasHeld) {
            this.#sm.next();
            hasChanged = true;
          }
          break;
        }
        case `sustain`: {
          if (!this.#holding || wasHeld) {
            elapsed3 = 0;
            this.#sm.next();
            this.#timer.reset();
            hasChanged = true;
          }
          break;
        }
        case `release`: {
          if (elapsed3 > this.releaseDuration) {
            this.#sm.next();
            hasChanged = true;
          }
          break;
        }
        case `complete`: {
          if (this.shouldLoop && allowLooping) {
            this.trigger(this.#holdingInitial);
          }
        }
      }
    } while (hasChanged && state !== `complete`);
    return hasChanged;
  }
  /**
   * Computes a stage's progress from 0-1
   * @param allowStateChange
   * @returns
   */
  computeRaw(allowStateChange = true, allowLooping = true) {
    if (this.#timer === void 0) {
      return [void 0, 0, this.#sm.state];
    }
    if (allowStateChange) this.switchStateIfNeeded(allowLooping);
    const previousStage = this.#sm.state;
    const elapsed3 = this.#timer.elapsed;
    let relative2 = 0;
    const state = this.#sm.state;
    switch (state) {
      case `attack`: {
        relative2 = elapsed3 / this.attackDuration;
        break;
      }
      case `decay`: {
        relative2 = (elapsed3 - this.attackDuration) / this.decayDuration;
        break;
      }
      case `sustain`: {
        relative2 = 1;
        break;
      }
      case `release`: {
        relative2 = Math.min(elapsed3 / this.releaseDuration, 1);
        break;
      }
      case `complete`: {
        return [`complete`, 1, previousStage];
      }
      default: {
        throw new Error(`State machine in unknown state: ${state}`);
      }
    }
    return [state, relative2, previousStage];
  }
  /**
   * Returns _true_ if envelope has finished
   */
  get isDone() {
    return this.#sm.isDone;
  }
  onTrigger() {
  }
  /**
   * Triggers envelope, optionally _holding_ it.
   * 
   * If `hold` is _false_ (default), envelope will run through all stages,
   * but sustain stage won't have an affect.
   * 
   * If `hold` is _true_, it will run to, and stay at the sustain stage. 
   * Use {@link release} to later release the envelope.
   *
   * If event is already trigged it will be _retriggered_. 
   * Initial value depends on `opts.retrigger`
   * * _false_ (default): envelope continues at current value.
   * * _true_: envelope value resets to `opts.initialValue`.
   *
   * @param hold If _true_ envelope will hold at sustain stage
   */
  trigger(hold = false) {
    this.onTrigger();
    this.#triggered = true;
    this.#sm.reset();
    this.#timer = this.#timeSource();
    this.#holding = hold;
    this.#holdingInitial = hold;
  }
  get hasTriggered() {
    return this.#triggered;
  }
  compute() {
  }
  /**
   * Release if 'trigger(true)' was previouslly called.
   * Has no effect if not triggered or held.
   * @returns 
   */
  release() {
    if (this.isDone || !this.#holdingInitial) return;
    this.#holding = false;
    this.compute();
  }
};

// ../modulation/src/envelope/Adsr.ts
var defaultAdsrOpts = Object.freeze({
  attackBend: -1,
  decayBend: -0.3,
  releaseBend: -0.3,
  peakLevel: 1,
  initialLevel: 0,
  sustainLevel: 0.6,
  releaseLevel: 0,
  retrigger: false
});
var AdsrIterator = class {
  constructor(adsr2) {
    this.adsr = adsr2;
  }
  next(...args) {
    if (!this.adsr.hasTriggered) {
      this.adsr.trigger();
    }
    const c4 = this.adsr.compute();
    return {
      value: c4[1],
      done: c4[0] === `complete`
    };
  }
  get [Symbol.toStringTag]() {
    return `Generator`;
  }
};
var Adsr = class extends AdsrBase {
  attackPath;
  decayPath;
  releasePath;
  initialLevel;
  peakLevel;
  releaseLevel;
  sustainLevel;
  attackBend;
  decayBend;
  releaseBend;
  initialLevelOverride;
  retrigger;
  releasedAt;
  constructor(opts = {}) {
    super(opts);
    this.retrigger = opts.retrigger ?? defaultAdsrOpts.retrigger;
    this.initialLevel = opts.initialLevel ?? defaultAdsrOpts.initialLevel;
    this.peakLevel = opts.peakLevel ?? defaultAdsrOpts.peakLevel;
    this.releaseLevel = opts.releaseLevel ?? defaultAdsrOpts.releaseLevel;
    this.sustainLevel = opts.sustainLevel ?? defaultAdsrOpts.sustainLevel;
    this.attackBend = opts.attackBend ?? defaultAdsrOpts.attackBend;
    this.releaseBend = opts.releaseBend ?? defaultAdsrOpts.releaseBend;
    this.decayBend = opts.decayBend ?? defaultAdsrOpts.decayBend;
    const max9 = 1;
    this.attackPath = bezier_exports.toPath(
      bezier_exports.quadraticSimple(
        { x: 0, y: this.initialLevel },
        { x: max9, y: this.peakLevel },
        -this.attackBend
      )
    );
    this.decayPath = bezier_exports.toPath(
      bezier_exports.quadraticSimple(
        { x: 0, y: this.peakLevel },
        { x: max9, y: this.sustainLevel },
        -this.decayBend
      )
    );
    this.releasePath = bezier_exports.toPath(
      bezier_exports.quadraticSimple(
        { x: 0, y: this.sustainLevel },
        { x: max9, y: this.releaseLevel },
        -this.releaseBend
      )
    );
  }
  onTrigger() {
    this.initialLevelOverride = void 0;
    if (!this.retrigger) {
      const [_stage, scaled, _raw] = this.compute(true, false);
      if (!Number.isNaN(scaled) && scaled > 0) {
        this.initialLevelOverride = scaled;
      }
    }
  }
  [Symbol.iterator]() {
    return new AdsrIterator(this);
  }
  /**
   * Returns the scaled value
   * Same as .compute()[1]
   */
  get value() {
    return this.compute(true)[1];
  }
  /**
   * Compute value of envelope at this point in time.
   *
   * Returns an array of [stage, scaled, raw]. Most likely you want to use {@link value} to just get the scaled value.
   * @param allowStateChange If true (default) envelope will be allowed to change state if necessary before returning value
   */
  compute(allowStateChange = true, allowLooping = true) {
    const [stage, amt] = super.computeRaw(allowStateChange, allowLooping);
    if (stage === void 0) return [void 0, Number.NaN, Number.NaN];
    let v;
    switch (stage) {
      case `attack`: {
        v = this.attackPath.interpolate(amt).y;
        if (this.initialLevelOverride !== void 0) {
          v = scale2(v, 0, 1, this.initialLevelOverride, 1);
        }
        this.releasedAt = v;
        break;
      }
      case `decay`: {
        v = this.decayPath.interpolate(amt).y;
        this.releasedAt = v;
        break;
      }
      case `sustain`: {
        v = this.sustainLevel;
        this.releasedAt = v;
        break;
      }
      case `release`: {
        v = this.releasePath.interpolate(amt).y;
        if (this.releasedAt !== void 0) {
          v = scale2(v, 0, this.sustainLevel, 0, this.releasedAt);
        }
        break;
      }
      case `complete`: {
        v = this.releaseLevel;
        this.releasedAt = void 0;
        break;
      }
      default: {
        throw new Error(`Unknown state: ${stage}`);
      }
    }
    return [stage, v, amt];
  }
};

// ../modulation/src/envelope/index.ts
var adsr = (opts = {}) => {
  const envelope = new Adsr(opts);
  const finalValue = envelope.releaseLevel;
  const iterator2 = envelope[Symbol.iterator]();
  return () => resolveWithFallbackSync(iterator2, { overrideWithLast: true, value: finalValue });
};
async function* adsrIterable(opts) {
  const envelope = new Adsr(opts.env);
  const sampleRateMs = opts.sampleRateMs ?? 100;
  envelope.trigger();
  const r = repeat(() => envelope.value, {
    while: () => !envelope.isDone,
    delay: sampleRateMs,
    signal: opts.signal
  });
  for await (const v of r) {
    yield v;
  }
}

// ../modulation/src/source/index.ts
var source_exports = {};
__export(source_exports, {
  bpm: () => bpm,
  elapsed: () => elapsed,
  hertz: () => hertz,
  perMinute: () => perMinute,
  perSecond: () => perSecond,
  ticks: () => ticks
});

// ../modulation/src/source/ticks.ts
function ticks(totalTicks, options = {}) {
  throwIntegerTest(totalTicks, `aboveZero`, `totalTicks`);
  const exclusiveStart = options.exclusiveStart ?? false;
  const exclusiveEnd = options.exclusiveEnd ?? false;
  const cycleLimit = options.cycleLimit ?? Number.MAX_SAFE_INTEGER;
  const startPoint = exclusiveStart ? 1 : 0;
  const endPoint = exclusiveEnd ? totalTicks - 1 : totalTicks;
  let cycleCount = 0;
  let v = options.startAt ?? startPoint;
  if (options.startAtRelative) {
    let totalTicksForReal = totalTicks;
    if (exclusiveStart) totalTicksForReal--;
    if (exclusiveEnd) totalTicksForReal--;
    v = Math.round(options.startAtRelative * totalTicksForReal);
  }
  return (feedback) => {
    if (feedback) {
      if (feedback.resetAt !== void 0) {
        v = feedback.resetAt;
      }
      if (feedback.resetAtRelative !== void 0) {
        v = Math.floor(feedback.resetAtRelative * totalTicks);
      }
    }
    if (cycleCount >= cycleLimit) return 1;
    const current = v / totalTicks;
    v++;
    if (v > endPoint) {
      cycleCount++;
      v = startPoint;
    }
    return current;
  };
}

// ../modulation/src/source/time.ts
function elapsed(interval, options = {}) {
  const cycleLimit = options.cycleLimit ?? Number.MAX_SAFE_INTEGER;
  const limitValue = 1;
  let start = options.startAt ?? performance.now();
  let cycleCount = 0;
  const intervalMs = intervalToMs(interval, 1e3);
  if (options.startAtRelative) {
    throwNumberTest(options.startAtRelative, `percentage`, `startAtRelative`);
    start = performance.now() - intervalMs * options.startAtRelative;
  }
  return (feedback) => {
    if (feedback) {
      if (feedback.resetAt !== void 0) {
        start = feedback.resetAt;
        if (start === 0) start = performance.now();
      }
      if (feedback.resetAtRelative !== void 0) {
        throwNumberTest(feedback.resetAtRelative, `percentage`, `resetAtRelative`);
        start = performance.now() - intervalMs * feedback.resetAtRelative;
      }
    }
    if (cycleCount >= cycleLimit) return limitValue;
    const now = performance.now();
    const elapsedCycle = now - start;
    if (elapsedCycle >= intervalMs) {
      cycleCount += Math.floor(elapsedCycle / intervalMs);
      start = now;
      if (cycleCount >= cycleLimit) return limitValue;
    }
    return elapsedCycle % intervalMs / intervalMs;
  };
}
function bpm(bpm2, options = {}) {
  const interval = 60 * 1e3 / bpm2;
  return elapsed(interval, options);
}
function hertz(hz, options = {}) {
  const interval = 1e3 / hz;
  return elapsed(interval, options);
}

// ../modulation/src/source/per-second.ts
var perSecond = (amount, options = {}) => {
  const perMilli = amount / 1e3;
  let min8 = options.min ?? Number.MIN_SAFE_INTEGER;
  let max9 = options.max ?? Number.MAX_SAFE_INTEGER;
  const clamp5 = options.clamp ?? false;
  if (clamp5 && options.max) throw new Error(`Use either 'max' or 'clamp', not both.`);
  if (clamp5) max9 = amount;
  let called = performance.now();
  return () => {
    const now = performance.now();
    const elapsed3 = now - called;
    called = now;
    const x = perMilli * elapsed3;
    if (x > max9) return max9;
    if (x < min8) return min8;
    return x;
  };
};
var perMinute = (amount, options = {}) => {
  return perSecond(amount / 60, options);
};

// ../modulation/src/cubic-bezier.ts
var cubicBezierShape = (b2, d2) => (t2) => {
  const s = 1 - t2;
  const s2 = s * s;
  const t22 = t2 * t2;
  const t3 = t22 * t2;
  return 3 * b2 * s2 * t2 + 3 * d2 * s * t22 + t3;
};

// ../modulation/src/drift.ts
var drift = (driftAmtPerMs) => {
  let lastChange = performance.now();
  const update = (v = 1) => {
    const elapsed3 = performance.now() - lastChange;
    const amt = driftAmtPerMs * elapsed3 % 1;
    lastChange = performance.now();
    const calc = (v + amt) % 1;
    return calc;
  };
  const reset = () => {
    lastChange = performance.now();
  };
  return { update, reset };
};

// ../modulation/src/easing/index.ts
var easing_exports = {};
__export(easing_exports, {
  Named: () => easings_named_exports,
  create: () => create4,
  get: () => get3,
  getEasingNames: () => getEasingNames,
  line: () => line3,
  tickEasing: () => tickEasing,
  ticks: () => ticks3,
  time: () => time2,
  timeEasing: () => timeEasing
});

// ../modulation/src/easing/easings-named.ts
var easings_named_exports = {};
__export(easings_named_exports, {
  arch: () => arch,
  backIn: () => backIn,
  backInOut: () => backInOut,
  backOut: () => backOut,
  bell: () => bell,
  bounceIn: () => bounceIn,
  bounceInOut: () => bounceInOut,
  bounceOut: () => bounceOut,
  circIn: () => circIn,
  circInOut: () => circInOut,
  circOut: () => circOut,
  cubicIn: () => cubicIn,
  cubicOut: () => cubicOut,
  elasticIn: () => elasticIn,
  elasticInOut: () => elasticInOut,
  elasticOut: () => elasticOut,
  expoIn: () => expoIn,
  expoInOut: () => expoInOut,
  expoOut: () => expoOut,
  quadIn: () => quadIn,
  quadInOut: () => quadInOut,
  quadOut: () => quadOut,
  quartIn: () => quartIn,
  quartOut: () => quartOut,
  quintIn: () => quintIn,
  quintInOut: () => quintInOut,
  quintOut: () => quintOut,
  sineIn: () => sineIn,
  sineInOut: () => sineInOut,
  sineOut: () => sineOut,
  smootherstep: () => smootherstep,
  smoothstep: () => smoothstep
});

// ../modulation/src/gaussian.ts
var pow3 = Math.pow;
var gaussianA = 1 / Math.sqrt(2 * Math.PI);
var gaussian = (standardDeviation = 0.4) => {
  const mean = 0.5;
  return (t2) => {
    const f = gaussianA / standardDeviation;
    let p2 = -2.5;
    let c4 = (t2 - mean) / standardDeviation;
    c4 *= c4;
    p2 *= c4;
    const v = f * pow3(Math.E, p2);
    if (v > 1) return 1;
    if (v < 0) return 0;
    return v;
  };
};

// ../modulation/src/easing/easings-named.ts
var sqrt4 = Math.sqrt;
var pow4 = Math.pow;
var cos4 = Math.cos;
var pi5 = Math.PI;
var sin4 = Math.sin;
var bounceOut = (x) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (x < 1 / d1) {
    return n1 * x * x;
  } else if (x < 2 / d1) {
    return n1 * (x -= 1.5 / d1) * x + 0.75;
  } else if (x < 2.5 / d1) {
    return n1 * (x -= 2.25 / d1) * x + 0.9375;
  } else {
    return n1 * (x -= 2.625 / d1) * x + 0.984375;
  }
};
var quintIn = (x) => x * x * x * x * x;
var quintOut = (x) => 1 - pow4(1 - x, 5);
var arch = (x) => x * (1 - x) * 4;
var smoothstep = (x) => x * x * (3 - 2 * x);
var smootherstep = (x) => (x * (x * 6 - 15) + 10) * x * x * x;
var sineIn = (x) => 1 - cos4(x * pi5 / 2);
var sineOut = (x) => sin4(x * pi5 / 2);
var quadIn = (x) => x * x;
var quadOut = (x) => 1 - (1 - x) * (1 - x);
var sineInOut = (x) => -(cos4(pi5 * x) - 1) / 2;
var quadInOut = (x) => x < 0.5 ? 2 * x * x : 1 - pow4(-2 * x + 2, 2) / 2;
var cubicIn = (x) => x * x * x;
var cubicOut = (x) => 1 - pow4(1 - x, 3);
var quartIn = (x) => x * x * x * x;
var quartOut = (x) => 1 - pow4(1 - x, 4);
var expoIn = (x) => x === 0 ? 0 : pow4(2, 10 * x - 10);
var expoOut = (x) => x === 1 ? 1 : 1 - pow4(2, -10 * x);
var quintInOut = (x) => x < 0.5 ? 16 * x * x * x * x * x : 1 - pow4(-2 * x + 2, 5) / 2;
var expoInOut = (x) => x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? pow4(2, 20 * x - 10) / 2 : (2 - pow4(2, -20 * x + 10)) / 2;
var circIn = (x) => 1 - sqrt4(1 - pow4(x, 2));
var circOut = (x) => sqrt4(1 - pow4(x - 1, 2));
var backIn = (x) => {
  const c12 = 1.70158;
  const c32 = c12 + 1;
  return c32 * x * x * x - c12 * x * x;
};
var backOut = (x) => {
  const c12 = 1.70158;
  const c32 = c12 + 1;
  return 1 + c32 * pow4(x - 1, 3) + c12 * pow4(x - 1, 2);
};
var circInOut = (x) => x < 0.5 ? (1 - sqrt4(1 - pow4(2 * x, 2))) / 2 : (sqrt4(1 - pow4(-2 * x + 2, 2)) + 1) / 2;
var backInOut = (x) => {
  const c12 = 1.70158;
  const c22 = c12 * 1.525;
  return x < 0.5 ? pow4(2 * x, 2) * ((c22 + 1) * 2 * x - c22) / 2 : (pow4(2 * x - 2, 2) * ((c22 + 1) * (x * 2 - 2) + c22) + 2) / 2;
};
var elasticIn = (x) => {
  const c4 = 2 * pi5 / 3;
  return x === 0 ? 0 : x === 1 ? 1 : -pow4(2, 10 * x - 10) * sin4((x * 10 - 10.75) * c4);
};
var elasticOut = (x) => {
  const c4 = 2 * pi5 / 3;
  return x === 0 ? 0 : x === 1 ? 1 : pow4(2, -10 * x) * sin4((x * 10 - 0.75) * c4) + 1;
};
var bounceIn = (x) => 1 - bounceOut(1 - x);
var bell = gaussian();
var elasticInOut = (x) => {
  const c5 = 2 * pi5 / 4.5;
  return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? -(pow4(2, 20 * x - 10) * sin4((20 * x - 11.125) * c5)) / 2 : pow4(2, -20 * x + 10) * sin4((20 * x - 11.125) * c5) / 2 + 1;
};
var bounceInOut = (x) => x < 0.5 ? (1 - bounceOut(1 - 2 * x)) / 2 : (1 + bounceOut(2 * x - 1)) / 2;

// ../modulation/src/easing/line.ts
var line3 = (bend = 0, warp = 0) => {
  const max9 = 1;
  const cubicB = {
    x: scale2(bend, -1, 1, 0, max9),
    y: scale2(bend, -1, 1, max9, 0)
  };
  let cubicA = point_exports.interpolate(Math.abs(bend), point_exports.Empty, cubicB);
  if (bend !== 0 && warp > 0) {
    if (bend > 0) {
      cubicA = point_exports.interpolate(warp, cubicA, { x: 0, y: cubicB.x * 2 });
    } else {
      cubicA = point_exports.interpolate(warp, cubicA, { x: cubicB.y * 2, y: 0 });
    }
  }
  const bzr = bezier_exports.cubic(
    point_exports.Empty,
    point_exports.Unit,
    cubicA,
    cubicB
  );
  const inter = bezier_exports.interpolator(bzr);
  return (value) => inter(value);
};

// ../modulation/src/modulator-timed.ts
var time = (fn, duration) => {
  throwFunctionTest(fn, `fn`);
  let relative2;
  return () => {
    if (relative2 === void 0) relative2 = ofTotal(duration, { clampValue: true });
    return fn(relative2());
  };
};
var timeModulator = (fn, duration) => {
  throwFunctionTest(fn, `fn`);
  const timer = elapsedMillisecondsAbsolute();
  const durationMs = intervalToMs(duration);
  if (durationMs === void 0) throw new Error(`Param 'duration' not provided`);
  const relativeTimer = relative(
    durationMs,
    {
      timer,
      clampValue: true
    }
  );
  return timerWithFunction(fn, relativeTimer);
};
var ticks2 = (fn, totalTicks) => {
  throwFunctionTest(fn, `fn`);
  let relative2;
  return () => {
    if (relative2 === void 0) relative2 = ofTotalTicks(totalTicks, { clampValue: true });
    return fn(relative2());
  };
};
var tickModulator = (fn, durationTicks) => {
  throwFunctionTest(fn, `fn`);
  const timer = elapsedTicksAbsolute();
  const relativeTimer = relative(
    durationTicks,
    {
      timer,
      clampValue: true
    }
  );
  return timerWithFunction(fn, relativeTimer);
};

// ../modulation/src/easing/index.ts
var create4 = (options) => {
  const name = resolveEasingName(options.name ?? `quintIn`);
  const fn = name ?? options.fn;
  if (typeof fn === `undefined`) throw new Error(`Either 'name' or 'fn' must be set`);
  if (`duration` in options) {
    return time2(fn, options.duration);
  } else if (`ticks` in options) {
    return ticks3(fn, options.ticks);
  } else {
    throw new Error(`Expected 'duration' or 'ticks' in options`);
  }
};
var timeEasing = (nameOrFunction, duration) => {
  const fn = resolveEasingName(nameOrFunction);
  return timeModulator(fn, duration);
};
var time2 = (nameOrFunction, duration) => {
  const fn = resolveEasingName(nameOrFunction);
  return time(fn, duration);
};
var ticks3 = (nameOrFunction, totalTicks) => {
  const fn = resolveEasingName(nameOrFunction);
  return ticks2(fn, totalTicks);
};
var tickEasing = (nameOrFunction, durationTicks) => {
  const fn = resolveEasingName(nameOrFunction);
  return tickModulator(fn, durationTicks);
};
var resolveEasingName = (nameOrFunction) => {
  const fn = typeof nameOrFunction === `function` ? nameOrFunction : get3(nameOrFunction);
  if (typeof fn === `undefined`) {
    const error = typeof nameOrFunction === `string` ? new Error(`Easing function not found: '${nameOrFunction}'`) : new Error(`Easing function not found`);
    throw error;
  }
  return fn;
};
var easingsMap;
var get3 = function(easingName) {
  throwStringTest(easingName, `non-empty`, `easingName`);
  const found = cacheEasings().get(easingName.toLowerCase());
  if (found === void 0) throw new Error(`Easing not found: '${easingName}'`);
  return found;
};
function cacheEasings() {
  if (easingsMap === void 0) {
    easingsMap = /* @__PURE__ */ new Map();
    for (const [k, v] of Object.entries(easings_named_exports)) {
      easingsMap.set(k.toLowerCase(), v);
    }
    return easingsMap;
  } else return easingsMap;
}
function* getEasingNames() {
  const map3 = cacheEasings();
  yield* map3.keys();
}

// ../modulation/src/forces.ts
var forces_exports = {};
__export(forces_exports, {
  accelerationForce: () => accelerationForce,
  angleFromAccelerationForce: () => angleFromAccelerationForce,
  angleFromVelocityForce: () => angleFromVelocityForce,
  angularForce: () => angularForce,
  apply: () => apply3,
  attractionForce: () => attractionForce,
  computeAccelerationToTarget: () => computeAccelerationToTarget,
  computeAttractionForce: () => computeAttractionForce,
  computePositionFromAngle: () => computePositionFromAngle,
  computePositionFromVelocity: () => computePositionFromVelocity,
  computeVelocity: () => computeVelocity,
  constrainBounce: () => constrainBounce,
  guard: () => guard8,
  magnitudeForce: () => magnitudeForce,
  nullForce: () => nullForce,
  orientationForce: () => orientationForce,
  pendulumForce: () => pendulumForce,
  springForce: () => springForce,
  targetForce: () => targetForce,
  velocityForce: () => velocityForce
});
var guard8 = (t2, name = `t`) => {
  if (t2 === void 0) {
    throw new Error(`Parameter ${name} is undefined. Expected ForceAffected`);
  }
  if (t2 === null) {
    throw new Error(`Parameter ${name} is null. Expected ForceAffected`);
  }
  if (typeof t2 !== `object`) {
    throw new TypeError(
      `Parameter ${name} is type ${typeof t2}. Expected object of shape ForceAffected`
    );
  }
};
var constrainBounce = (bounds, dampen = 1) => {
  if (!bounds) bounds = { width: 1, height: 1 };
  const minX = rect_exports.getEdgeX(bounds, `left`);
  const maxX = rect_exports.getEdgeX(bounds, `right`);
  const minY = rect_exports.getEdgeY(bounds, `top`);
  const maxY = rect_exports.getEdgeY(bounds, `bottom`);
  return (t2) => {
    const position = computePositionFromVelocity(
      t2.position ?? point_exports.Empty,
      t2.velocity ?? point_exports.Empty
    );
    let velocity = t2.velocity ?? point_exports.Empty;
    let { x, y } = position;
    if (x > maxX) {
      x = maxX;
      velocity = point_exports.invert(point_exports.multiplyScalar(velocity, dampen), `x`);
    } else if (x < minX) {
      x = minX;
      velocity = point_exports.invert(point_exports.multiplyScalar(velocity, dampen), `x`);
    }
    if (y > maxY) {
      y = maxY;
      velocity = point_exports.multiplyScalar(point_exports.invert(velocity, `y`), dampen);
    } else if (position.y < minY) {
      y = minY;
      velocity = point_exports.invert(point_exports.multiplyScalar(velocity, dampen), `y`);
    }
    return Object.freeze({
      ...t2,
      position: { x, y },
      velocity
    });
  };
};
var attractionForce = (attractors, gravity, distanceRange = {}) => (attractee) => {
  let accel = attractee.acceleration ?? point_exports.Empty;
  for (const a2 of attractors) {
    if (a2 === attractee) continue;
    const f = computeAttractionForce(a2, attractee, gravity, distanceRange);
    accel = point_exports.sum(accel, f);
  }
  return {
    ...attractee,
    acceleration: accel
  };
};
var computeAttractionForce = (attractor, attractee, gravity, distanceRange = {}) => {
  if (attractor.position === void 0) {
    throw new Error(`attractor.position not set`);
  }
  if (attractee.position === void 0) {
    throw new Error(`attractee.position not set`);
  }
  const distributionRangeMin = distanceRange.min ?? 0.01;
  const distributionRangeMax = distanceRange.max ?? 0.7;
  const f = point_exports.normalise(
    point_exports.subtract(attractor.position, attractee.position)
  );
  const d2 = clamp(point_exports.distance(f), distributionRangeMin, distributionRangeMax);
  return point_exports.multiplyScalar(
    f,
    gravity * (attractor.mass ?? 1) * (attractee.mass ?? 1) / (d2 * d2)
  );
};
var targetForce = (targetPos, opts = {}) => {
  const fn = (t2) => {
    const accel = computeAccelerationToTarget(
      targetPos,
      t2.position ?? { x: 0.5, y: 0.5 },
      opts
    );
    return {
      ...t2,
      acceleration: point_exports.sum(t2.acceleration ?? point_exports.Empty, accel)
    };
  };
  return fn;
};
var apply3 = (t2, ...accelForces) => {
  if (t2 === void 0) throw new Error(`t parameter is undefined`);
  for (const f of accelForces) {
    if (f === null || f === void 0) continue;
    t2 = typeof f === `function` ? f(t2) : {
      ...t2,
      acceleration: point_exports.sum(t2.acceleration ?? point_exports.Empty, f)
    };
  }
  const velo = computeVelocity(
    t2.acceleration ?? point_exports.Empty,
    t2.velocity ?? point_exports.Empty
  );
  const pos = computePositionFromVelocity(t2.position ?? point_exports.Empty, velo);
  const ff = {
    ...t2,
    position: pos,
    velocity: velo,
    // Clear accel, because it has been integrated into velocity
    acceleration: point_exports.Empty
  };
  return ff;
};
var accelerationForce = (vector, mass = `ignored`) => (t2) => Object.freeze({
  ...t2,
  acceleration: massApplyAccel(vector, t2, mass)
  //Points.sum(t.acceleration ?? Points.Empty, op(t.mass ?? 1))
});
var massApplyAccel = (vector, thing, mass = `ignored`) => {
  let op;
  switch (mass) {
    case `dampen`: {
      op = (mass2) => point_exports.divide(vector, mass2, mass2);
      break;
    }
    case `multiply`: {
      op = (mass2) => point_exports.multiply(vector, mass2, mass2);
      break;
    }
    case `ignored`: {
      op = (_mass) => vector;
      break;
    }
    default: {
      throw new Error(
        `Unknown 'mass' parameter '${mass}. Expected 'dampen', 'multiply' or 'ignored'`
      );
    }
  }
  return point_exports.sum(thing.acceleration ?? point_exports.Empty, op(thing.mass ?? 1));
};
var magnitudeForce = (force, mass = `ignored`) => (t2) => {
  if (t2.velocity === void 0) return t2;
  const mag = point_exports.distance(point_exports.normalise(t2.velocity));
  const magSq = force * mag * mag;
  const vv = point_exports.multiplyScalar(point_exports.invert(t2.velocity), magSq);
  return Object.freeze({
    ...t2,
    acceleration: massApplyAccel(vv, t2, mass)
  });
};
var nullForce = (t2) => t2;
var velocityForce = (force, mass) => {
  const pipeline2 = point_exports.pipeline(
    // Points.normalise,
    point_exports.invert,
    (v) => point_exports.multiplyScalar(v, force)
  );
  return (t2) => {
    if (t2.velocity === void 0) return t2;
    const v = pipeline2(t2.velocity);
    return Object.freeze({
      ...t2,
      acceleration: massApplyAccel(v, t2, mass)
    });
  };
};
var angularForce = () => (t2) => {
  const accumulator = t2.angularAcceleration ?? 0;
  const vel = t2.angularVelocity ?? 0;
  const angle = t2.angle ?? 0;
  const v = vel + accumulator;
  const a2 = angle + v;
  return Object.freeze({
    ...t2,
    angle: a2,
    angularVelocity: v,
    angularAcceleration: 0
  });
};
var angleFromAccelerationForce = (scaling = 20) => (t2) => {
  const accel = t2.acceleration ?? point_exports.Empty;
  return Object.freeze({
    ...t2,
    angularAcceleration: accel.x * scaling
  });
};
var angleFromVelocityForce = (interpolateAmt = 1) => (t2) => {
  const a2 = point_exports.angleRadian(t2.velocity ?? point_exports.Empty);
  return Object.freeze({
    ...t2,
    angle: interpolateAmt < 1 ? interpolateAngle(interpolateAmt, t2.angle ?? 0, a2) : a2
  });
};
var springForce = (pinnedAt, restingLength = 0.5, k = 2e-4, damping = 0.999) => (t2) => {
  const direction = point_exports.subtract(t2.position ?? point_exports.Empty, pinnedAt);
  const mag = point_exports.distance(direction);
  const stretch = Math.abs(restingLength - mag);
  const f = point_exports.pipelineApply(
    direction,
    point_exports.normalise,
    (p2) => point_exports.multiplyScalar(p2, -k * stretch)
  );
  const accel = massApplyAccel(f, t2, `dampen`);
  const velo = computeVelocity(
    accel ?? point_exports.Empty,
    t2.velocity ?? point_exports.Empty
  );
  const veloDamped = point_exports.multiply(velo, damping, damping);
  return {
    ...t2,
    velocity: veloDamped,
    acceleration: point_exports.Empty
  };
};
var pendulumForce = (pinnedAt, opts = {}) => (t2) => {
  if (!pinnedAt) pinnedAt = { x: 0, y: 0 };
  const length5 = opts.length ?? point_exports.distance(pinnedAt, t2.position ?? point_exports.Empty);
  const speed = opts.speed ?? 1e-3;
  const damping = opts.damping ?? 0.995;
  let angle = t2.angle;
  if (angle === void 0) {
    if (t2.position) {
      angle = point_exports.angleRadian(pinnedAt, t2.position) - Math.PI / 2;
    } else {
      angle = 0;
    }
  }
  const accel = -1 * speed / length5 * Math.sin(angle);
  const v = (t2.angularVelocity ?? 0) + accel;
  angle += v;
  return Object.freeze({
    angularVelocity: v * damping,
    angle,
    position: computePositionFromAngle(length5, angle + Math.PI / 2, pinnedAt)
  });
};
var computeVelocity = (acceleration, velocity, velocityMax) => {
  const p2 = point_exports.sum(velocity, acceleration);
  return velocityMax === void 0 ? p2 : point_exports.clampMagnitude(p2, velocityMax);
};
var computeAccelerationToTarget = (targetPos, currentPos, opts = {}) => {
  const diminishBy = opts.diminishBy ?? 1e-3;
  const direction = point_exports.subtract(targetPos, currentPos);
  if (opts.range && // If direction is less than range, return { x: 0, y: 0}
  point_exports.compare(point_exports.abs(direction), opts.range) === -2) {
    return point_exports.Empty;
  }
  return point_exports.multiplyScalar(direction, diminishBy);
};
var computePositionFromVelocity = (position, velocity) => point_exports.sum(position, velocity);
var computePositionFromAngle = (distance5, angleRadians, origin) => polar_exports.toCartesian(distance5, angleRadians, origin);
var _angularForce = angularForce();
var _angleFromAccelerationForce = angleFromAccelerationForce();
var orientationForce = (interpolationAmt = 0.5) => {
  const angleFromVel = angleFromVelocityForce(interpolationAmt);
  return (t2) => {
    t2 = _angularForce(t2);
    t2 = _angleFromAccelerationForce(t2);
    t2 = angleFromVel(t2);
    return t2;
  };
};

// ../modulation/src/util/pi-pi.ts
var piPi9 = Math.PI * 2;

// ../modulation/src/interpolate.ts
function interpolate8(pos1, pos2, pos3, pos4) {
  let amountProcess;
  let limits = `clamp`;
  const handleAmount = (amount) => {
    if (amountProcess) amount = amountProcess(amount);
    if (limits === void 0 || limits === `clamp`) {
      amount = clamp(amount);
    } else if (limits === `wrap`) {
      if (amount > 1) amount = amount % 1;
      else if (amount < 0) {
        amount = 1 + amount % 1;
      }
    }
    return amount;
  };
  const doTheEase = (_amt, _a, _b) => {
    throwNumberTest(_a, ``, `a`);
    throwNumberTest(_b, ``, `b`);
    throwNumberTest(_amt, ``, `amount`);
    _amt = handleAmount(_amt);
    return (1 - _amt) * _a + _amt * _b;
  };
  const readOpts = (o = {}) => {
    if (o.easing) {
      const easer = get3(o.easing);
      if (!easer) throw new Error(`Easing function '${o.easing}' not found`);
      amountProcess = easer;
    } else if (o.transform) {
      if (typeof o.transform !== `function`) throw new Error(`Param 'transform' is expected to be a function. Got: ${typeof o.transform}`);
      amountProcess = o.transform;
    }
    limits = o.limits ?? `clamp`;
  };
  const rawEase = (_amt, _a, _b) => (1 - _amt) * _a + _amt * _b;
  if (typeof pos1 !== `number`) throw new TypeError(`First param is expected to be a number. Got: ${typeof pos1}`);
  if (typeof pos2 === `number`) {
    let a2;
    let b2;
    if (pos3 === void 0 || typeof pos3 === `object`) {
      a2 = pos1;
      b2 = pos2;
      readOpts(pos3);
      return (amount) => doTheEase(amount, a2, b2);
    } else if (typeof pos3 === `number`) {
      a2 = pos2;
      b2 = pos3;
      readOpts(pos4);
      return doTheEase(pos1, a2, b2);
    } else {
      throw new Error(`Values for 'a' and 'b' not defined`);
    }
  } else if (pos2 === void 0 || typeof pos2 === `object`) {
    const amount = handleAmount(pos1);
    readOpts(pos2);
    throwNumberTest(amount, ``, `amount`);
    return (aValue, bValue) => rawEase(amount, aValue, bValue);
  }
}
var interpolatorStepped2 = (incrementAmount, a2 = 0, b2 = 1, startInterpolationAt = 0, options) => {
  let amount = startInterpolationAt;
  return (retargetB, retargetA) => {
    if (retargetB !== void 0) b2 = retargetB;
    if (retargetA !== void 0) a2 = retargetA;
    if (amount >= 1) return b2;
    const value = interpolate8(amount, a2, b2, options);
    amount += incrementAmount;
    return value;
  };
};
var interpolateAngle2 = (amount, aRadians, bRadians, options) => {
  const t2 = wrap(bRadians - aRadians, 0, piPi9);
  return interpolate8(amount, aRadians, aRadians + (t2 > Math.PI ? t2 - piPi9 : t2), options);
};
var interpolatorInterval = (duration, a2 = 0, b2 = 1, options) => {
  const durationProgression = ofTotal(duration, { clampValue: true });
  return (retargetB, retargetA) => {
    const amount = durationProgression();
    if (retargetB !== void 0) b2 = retargetB;
    if (retargetA !== void 0) a2 = retargetA;
    if (amount >= 1) return b2;
    const value = interpolate8(amount, a2, b2, options);
    return value;
  };
};

// ../modulation/src/jitter.ts
var jitterAbsolute = (options) => {
  const { relative: relative2, absolute } = options;
  const clamped = options.clamped ?? false;
  const source = options.source ?? Math.random;
  if (absolute !== void 0) {
    return (value) => {
      const abs4 = source() * absolute * 2 - absolute;
      const valueNew = value + abs4;
      if (clamped) return clamp(valueNew, 0, value);
      return valueNew;
    };
  }
  if (relative2 !== void 0) {
    return (value) => {
      const rel = value * relative2;
      const abs4 = source() * rel * 2 - rel;
      const valueNew = value + abs4;
      if (clamped) return clamp(valueNew, 0, value);
      return valueNew;
    };
  }
  throw new Error(`Either absolute or relative fields expected`);
};
var jitter = (options = {}) => {
  const clamped = options.clamped ?? true;
  let r = (_) => 0;
  if (options.absolute !== void 0) {
    throwNumberTest(
      options.absolute,
      clamped ? `percentage` : `bipolar`,
      `opts.absolute`
    );
    const absRand = floatSource({
      min: -options.absolute,
      max: options.absolute,
      source: options.source
    });
    r = (v) => v + absRand();
  } else if (options.relative === void 0) {
    throw new TypeError(`Either absolute or relative jitter amount is required.`);
  } else {
    const rel = options.relative ?? 0.1;
    throwNumberTest(
      rel,
      clamped ? `percentage` : `bipolar`,
      `opts.relative`
    );
    r = (v) => v + float({
      min: -Math.abs(rel * v),
      max: Math.abs(rel * v),
      source: options.source
    });
  }
  const compute = (value) => {
    throwNumberTest(value, clamped ? `percentage` : `bipolar`, `value`);
    let v = r(value);
    if (clamped) v = clamp(v);
    return v;
  };
  return compute;
};

// ../modulation/src/mix.ts
var mix2 = (amount, original, modulation) => {
  const m3 = modulation * amount;
  const base = (1 - amount) * original;
  return base + original * m3;
};
var mixModulators = (balance, a2, b2) => (amt) => interpolate2(balance, a2(amt), b2(amt));
var crossfade = (a2, b2) => {
  return (amt) => {
    const mixer = mixModulators(amt, a2, b2);
    return mixer(amt);
  };
};

// ../modulation/src/no-op.ts
var noop = (v) => v;

// ../modulation/src/oscillator.ts
var oscillator_exports = {};
__export(oscillator_exports, {
  saw: () => saw,
  sine: () => sine,
  sineBipolar: () => sineBipolar,
  square: () => square,
  triangle: () => triangle
});
var piPi10 = Math.PI * 2;
function* sine(timerOrFreq) {
  if (timerOrFreq === void 0) throw new TypeError(`Parameter 'timerOrFreq' is undefined`);
  if (typeof timerOrFreq === `number`) {
    timerOrFreq = frequencyTimer(timerOrFreq);
  }
  while (true) {
    yield (Math.sin(timerOrFreq.elapsed * piPi10) + 1) / 2;
  }
}
function* sineBipolar(timerOrFreq) {
  if (timerOrFreq === void 0) throw new TypeError(`Parameter 'timerOrFreq' is undefined`);
  if (typeof timerOrFreq === `number`) {
    timerOrFreq = frequencyTimer(timerOrFreq);
  }
  while (true) {
    yield Math.sin(timerOrFreq.elapsed * piPi10);
  }
}
function* triangle(timerOrFreq) {
  if (typeof timerOrFreq === `number`) {
    timerOrFreq = frequencyTimer(timerOrFreq);
  }
  while (true) {
    let v = timerOrFreq.elapsed;
    if (v < 0.5) {
      v *= 2;
    } else {
      v = 2 - v * 2;
    }
    yield v;
  }
}
function* saw(timerOrFreq) {
  if (timerOrFreq === void 0) throw new TypeError(`Parameter 'timerOrFreq' is undefined`);
  if (typeof timerOrFreq === `number`) {
    timerOrFreq = frequencyTimer(timerOrFreq);
  }
  while (true) {
    yield timerOrFreq.elapsed;
  }
}
function* square(timerOrFreq) {
  if (typeof timerOrFreq === `number`) {
    timerOrFreq = frequencyTimer(timerOrFreq);
  }
  while (true) {
    yield timerOrFreq.elapsed < 0.5 ? 0 : 1;
  }
}

// ../modulation/src/ping-pong.ts
var pingPongPercent = function(interval = 0.1, lower, upper, start, rounding) {
  if (lower === void 0) lower = 0;
  if (upper === void 0) upper = 1;
  if (start === void 0) start = lower;
  throwNumberTest(interval, `bipolar`, `interval`);
  throwNumberTest(upper, `bipolar`, `end`);
  throwNumberTest(start, `bipolar`, `offset`);
  throwNumberTest(lower, `bipolar`, `start`);
  return pingPong(interval, lower, upper, start, rounding);
};
var pingPong = function* (interval, lower, upper, start, rounding) {
  if (lower === void 0) throw new Error(`Parameter 'lower' is undefined`);
  if (interval === void 0) {
    throw new Error(`Parameter 'interval' is undefined`);
  }
  if (upper === void 0) throw new Error(`Parameter 'upper' is undefined`);
  if (rounding === void 0 && interval <= 1 && interval >= 0) {
    rounding = 10 / interval;
  } else if (rounding === void 0) rounding = 1234;
  if (Number.isNaN(interval)) throw new Error(`interval parameter is NaN`);
  if (Number.isNaN(lower)) throw new Error(`lower parameter is NaN`);
  if (Number.isNaN(upper)) throw new Error(`upper parameter is NaN`);
  if (Number.isNaN(start)) throw new Error(`upper parameter is NaN`);
  if (lower >= upper) throw new Error(`lower must be less than upper`);
  if (interval === 0) throw new Error(`Interval cannot be zero`);
  const distance5 = upper - lower;
  if (Math.abs(interval) >= distance5) {
    throw new Error(`Interval should be between -${distance5} and ${distance5}`);
  }
  let incrementing = interval > 0;
  upper = Math.floor(upper * rounding);
  lower = Math.floor(lower * rounding);
  interval = Math.floor(Math.abs(interval * rounding));
  if (interval === 0) {
    throw new Error(`Interval is zero (rounding: ${rounding})`);
  }
  start = start === void 0 ? lower : Math.floor(start * rounding);
  if (start > upper || start < lower) {
    throw new Error(
      `Start (${start / rounding}) must be within lower (${lower / rounding}) and upper (${upper / rounding})`
    );
  }
  let v = start;
  yield v / rounding;
  let firstLoop = true;
  while (true) {
    v = v + (incrementing ? interval : -interval);
    if (incrementing && v >= upper) {
      incrementing = false;
      v = upper;
      if (v === upper && firstLoop) {
        v = lower;
        incrementing = true;
      }
    } else if (!incrementing && v <= lower) {
      incrementing = true;
      v = lower;
      if (v === lower && firstLoop) {
        v = upper;
        incrementing = false;
      }
    }
    yield v / rounding;
    firstLoop = false;
  }
};

// ../modulation/src/spring.ts
function* spring(opts = {}, timerOrFreq) {
  if (timerOrFreq === void 0) timerOrFreq = elapsedMillisecondsAbsolute();
  else if (typeof timerOrFreq === `number`) {
    timerOrFreq = frequencyTimer(timerOrFreq);
  }
  const fn = springShape(opts);
  let doneCountdown = opts.countdown ?? 10;
  while (doneCountdown > 0) {
    const s = fn(timerOrFreq.elapsed / 1e3);
    yield s;
    if (s === 1) {
      doneCountdown--;
    } else {
      doneCountdown = 100;
    }
  }
}
function springValue(opts = {}, timerOrFreq) {
  const s = spring(opts, timerOrFreq);
  return () => {
    const v = s.next();
    if (v.done) return 1;
    return v.value;
  };
}
var springShape = (opts = {}) => {
  const from2 = 0;
  const to4 = 1;
  const mass = opts.mass ?? 1;
  const stiffness = opts.stiffness ?? 100;
  const soft = opts.soft ?? false;
  const damping = opts.damping ?? 10;
  const velocity = opts.velocity ?? 0.1;
  const delta = to4 - from2;
  if (soft || 1 <= damping / (2 * Math.sqrt(stiffness * mass))) {
    const angularFrequency = -Math.sqrt(stiffness / mass);
    const leftover = -angularFrequency * delta - velocity;
    return (t2) => to4 - (delta + t2 * leftover) * Math.E ** (t2 * angularFrequency);
  } else {
    const dampingFrequency = Math.sqrt(4 * mass * stiffness - damping ** 2);
    const leftover = (damping * delta - 2 * mass * velocity) / dampingFrequency;
    const dfm = 0.5 * dampingFrequency / mass;
    const dm = -(0.5 * damping) / mass;
    return (t2) => to4 - (Math.cos(t2 * dfm) * delta + Math.sin(t2 * dfm) * leftover) * Math.E ** (t2 * dm);
  }
};

// ../modulation/src/timing-source-factory.ts
var timingSourceFactory = (source, duration, options = {}) => {
  switch (source) {
    case `elapsed`:
      return () => elapsed(duration, options);
    case `bpm`:
      return () => bpm(duration, options);
    case `hertz`:
      return () => hertz(duration, options);
    default:
      throw new Error(`Unknown source '${source}'. Expected: 'elapsed', 'hertz' or 'bpm'`);
  }
};

// ../modulation/src/waveforms.ts
function triangleShape(period = 1) {
  period = 1 / period;
  const halfPeriod = period / 2;
  return (t2) => {
    const v = Math.abs(t2 % period - halfPeriod);
    return v;
  };
}
function squareShape(period = 1) {
  period = 1 / period;
  const halfPeriod = period / 2;
  return (t2) => {
    return t2 % period < halfPeriod ? 1 : 0;
  };
}
function sineShape(period = 1) {
  period = period * (Math.PI * 2);
  return (t2) => {
    const v = (Math.sin(t2 * period) + 1) / 2;
    return v;
  };
}
function arcShape(period = 1) {
  period = period * (Math.PI * 2);
  return (t2) => Math.abs(Math.sin(t2 * period));
}
function sineBipolarShape(period = 1) {
  period = period * (Math.PI * 2);
  return (t2) => Math.sin(t2 * period);
}
function wave(options) {
  const shape = options.shape ?? `sine`;
  const invert3 = options.invert ?? false;
  const period = options.period ?? 1;
  let sourceFunction;
  throwIntegerTest(period, `aboveZero`, `period`);
  const sourceOptions = {
    ...options
  };
  if (options.ticks) {
    sourceFunction = ticks(options.ticks, sourceOptions);
  } else if (options.hertz) {
    sourceFunction = hertz(options.hertz, sourceOptions);
  } else if (options.millis) {
    sourceFunction = elapsed(options.millis, sourceOptions);
  } else if (options.source) {
    sourceFunction = options.source;
  } else {
    const secs = options.secs ?? 5;
    sourceFunction = elapsed(secs * 1e3, sourceOptions);
  }
  let shaperFunction;
  switch (shape) {
    case `saw`:
      shaperFunction = (v) => v;
      break;
    case `sine`:
      shaperFunction = sineShape(period);
      break;
    case `sine-bipolar`:
      shaperFunction = sineBipolarShape(period);
      break;
    case `square`:
      shaperFunction = squareShape(period);
      break;
    case `triangle`:
      shaperFunction = triangleShape(period);
      break;
    case `arc`:
      shaperFunction = arcShape(period);
      break;
    default:
      throw new Error(`Unknown wave shape '${shape}'. Expected: sine, sine-bipolar, saw, triangle, arc or square`);
  }
  return waveFromSource(sourceFunction, shaperFunction, invert3);
}
function waveFromSource(sourceFunction, shaperFunction, invert3 = false) {
  return (feedback) => {
    let v = sourceFunction(feedback?.clock);
    if (feedback?.override) v = feedback.override;
    v = shaperFunction(v);
    if (invert3) v = 1 - v;
    return v;
  };
}

// ../modulation/src/weighted-average.ts
var weightedAverage = (currentValue, targetValue, slowDownFactor) => {
  return (currentValue * (slowDownFactor - 1) + targetValue) / slowDownFactor;
};

// ../modulation/src/weighted-random.ts
var weighted = (easingNameOrOptions = `quadIn`) => weightedSource(easingNameOrOptions)();
var weightedSource = (easingNameOrOptions = `quadIn`) => {
  const options = typeof easingNameOrOptions === `string` ? { easing: easingNameOrOptions } : easingNameOrOptions;
  const source = options.source ?? Math.random;
  const easingName = options.easing ?? `quadIn`;
  const easingFunction = get3(easingName);
  if (typeof easingFunction === `undefined`) {
    throw new Error(`Easing function '${easingName}' not found.`);
  }
  const compute = () => {
    const r = source();
    return easingFunction(r);
  };
  return compute;
};

// rx.ts
var rx_exports = {};
__export(rx_exports, {
  From: () => from_exports,
  Ops: () => Ops,
  Sinks: () => Sinks,
  annotate: () => annotate,
  annotateWithOp: () => annotateWithOp,
  average: () => average3,
  cache: () => cache,
  chunk: () => chunk,
  cloneFromFields: () => cloneFromFields2,
  combineLatestToArray: () => combineLatestToArray,
  combineLatestToObject: () => combineLatestToObject,
  computeWithPrevious: () => computeWithPrevious,
  debounce: () => debounce2,
  drop: () => drop,
  elapsed: () => elapsed2,
  field: () => field,
  filter: () => filter3,
  hasLast: () => hasLast2,
  initLazyStream: () => initLazyStream,
  initLazyStreamWithInitial: () => initLazyStreamWithInitial,
  initStream: () => initStream,
  initUpstream: () => initUpstream,
  interpolate: () => interpolate9,
  isPingable: () => isPingable,
  isReactive: () => isReactive2,
  isTrigger: () => isTrigger,
  isTriggerFunction: () => isTriggerFunction,
  isTriggerGenerator: () => isTriggerGenerator,
  isTriggerValue: () => isTriggerValue,
  isWrapped: () => isWrapped,
  isWritable: () => isWritable,
  manual: () => manual,
  max: () => max8,
  messageHasValue: () => messageHasValue,
  messageIsDoneSignal: () => messageIsDoneSignal,
  messageIsSignal: () => messageIsSignal,
  min: () => min7,
  opify: () => opify,
  pipe: () => pipe,
  prepare: () => prepare,
  rank: () => rank2,
  resolveSource: () => resolveSource,
  resolveTriggerValue: () => resolveTriggerValue,
  run: () => run,
  setHtmlText: () => setHtmlText,
  singleFromArray: () => singleFromArray,
  split: () => split,
  splitLabelled: () => splitLabelled,
  sum: () => sum6,
  switcher: () => switcher,
  symbol: () => symbol,
  syncToArray: () => syncToArray,
  syncToObject: () => syncToObject,
  takeNextValue: () => takeNextValue,
  tally: () => tally2,
  tapOps: () => tapOps,
  tapProcess: () => tapProcess,
  tapStream: () => tapStream,
  throttle: () => throttle,
  timeoutPing: () => timeoutPing,
  timeoutValue: () => timeoutValue,
  to: () => to3,
  toArray: () => toArray5,
  toArrayOrThrow: () => toArrayOrThrow,
  toGenerator: () => toGenerator,
  transform: () => transform,
  valueToPing: () => valueToPing,
  withValue: () => withValue,
  wrap: () => wrap6,
  writable: () => writable
});

// ../rx/src/util.ts
function messageIsSignal(message) {
  if (message.value !== void 0) return false;
  if (`signal` in message && message.signal !== void 0) return true;
  return false;
}
function messageIsDoneSignal(message) {
  if (message.value !== void 0) return false;
  if (`signal` in message && message.signal === `done`) return true;
  return false;
}
function messageHasValue(v) {
  if (v.value !== void 0) return true;
  return false;
}
var isPingable = (rx) => {
  if (!isReactive2(rx)) return false;
  if (`ping` in rx) {
    return true;
  }
  return false;
};
var hasLast2 = (rx) => {
  if (!isReactive2(rx)) return false;
  if (`last` in rx) {
    const v = rx.last();
    if (v !== void 0) return true;
  }
  return false;
};
var isReactive2 = (rx) => {
  if (typeof rx !== `object`) return false;
  if (rx === null) return false;
  return `on` in rx && `onValue` in rx;
};
var isWritable = (rx) => {
  if (!isReactive2(rx)) return false;
  if (`set` in rx) return true;
  return false;
};
var isWrapped = (v) => {
  if (typeof v !== `object`) return false;
  if (!(`source` in v)) return false;
  if (!(`annotate` in v)) return false;
  return true;
};
var opify = (fn, ...args) => {
  return (source) => {
    return fn(source, ...args);
  };
};
var isTriggerValue = (t2) => `value` in t2;
var isTriggerFunction = (t2) => `fn` in t2;
var isTriggerGenerator = (t2) => isIterable(t2);
var isTrigger = (t2) => {
  if (typeof t2 !== `object`) return false;
  if (isTriggerValue(t2)) return true;
  if (isTriggerFunction(t2)) return true;
  if (isTriggerGenerator(t2)) return true;
  return false;
};
function resolveTriggerValue(t2) {
  if (isTriggerValue(t2)) return [t2.value, false];
  if (isTriggerFunction(t2)) {
    const v = t2.fn();
    if (v === void 0) return [void 0, true];
    return [v, false];
  }
  if (isTriggerGenerator(t2)) {
    const v = t2.gen.next();
    if (v.done) return [void 0, true];
    return [v.value, false];
  }
  throw new Error(`Invalid trigger. Missing 'value' or 'fn' fields`);
}

// ../rx/src/from/function.ts
function func(callback, options = {}) {
  const maximumRepeats = options.maximumRepeats ?? Number.MAX_SAFE_INTEGER;
  const closeOnError = options.closeOnError ?? true;
  const intervalMs = options.interval ? intervalToMs(options.interval) : -1;
  let manual2 = options.manual ?? false;
  if (options.interval === void 0 && options.manual === void 0) manual2 = true;
  if (manual2 && options.interval) throw new Error(`If option 'manual' is set, option 'interval' cannot be used`);
  const predelay = intervalToMs(options.predelay, 0);
  const lazy = options.lazy ?? `very`;
  const signal = options.signal;
  const internalAbort = new AbortController();
  const internalAbortCallback = (reason) => {
    internalAbort.abort(reason);
  };
  let sentResults = 0;
  let enabled = false;
  const done = (reason) => {
    events.dispose(reason);
    enabled = false;
    if (run2) run2.cancel();
  };
  const ping = async () => {
    if (!enabled) return false;
    if (predelay) await sleep(predelay);
    if (sentResults >= maximumRepeats) {
      done(`Maximum repeats reached ${maximumRepeats.toString()}`);
      return false;
    }
    try {
      if (signal?.aborted) {
        done(`Signal (${signal.aborted})`);
        return false;
      }
      const value = await callback(internalAbortCallback);
      sentResults++;
      events.set(value);
      return true;
    } catch (error) {
      if (closeOnError) {
        done(`Function error: ${getErrorMessage(error)}`);
        return false;
      } else {
        events.signal(`warn`, getErrorMessage(error));
        return true;
      }
    }
  };
  const run2 = manual2 ? void 0 : continuously(async () => {
    const pingResult = await ping();
    if (!pingResult) return false;
    if (internalAbort.signal.aborted) {
      done(`callback function aborted (${internalAbort.signal.reason})`);
      return false;
    }
  }, intervalMs);
  const events = initLazyStream({
    lazy,
    onStart() {
      enabled = true;
      if (run2) run2.start();
    },
    onStop() {
      enabled = false;
      if (run2) run2.cancel();
    }
  });
  if (lazy === `never` && run2) run2.start();
  return { ...events, ping };
}

// ../rx/src/from/iterator.ts
function iterator(source, options = {}) {
  const lazy = options.lazy ?? `very`;
  const log = options.traceLifecycle ? (message) => {
    console.log(`Rx.From.iterator ${message}`);
  } : (_) => {
  };
  const readIntervalMs = intervalToMs(options.readInterval, 5);
  const readTimeoutMs = intervalToMs(options.readTimeout, 5 * 60 * 1e3);
  const whenStopped = options.whenStopped ?? `continue`;
  let iterator2;
  let ourAc;
  let sm = init2({
    idle: [`wait_for_next`],
    wait_for_next: [`processing_result`, `stopping`, `disposed`],
    processing_result: [`queued`, `disposed`, `stopping`],
    queued: [`wait_for_next`, `disposed`, `stopping`],
    stopping: `idle`,
    disposed: null
  }, `idle`);
  const onExternalSignal = () => {
    log(`onExternalSignal`);
    ourAc?.abort(options.signal?.reason);
  };
  if (options.signal) {
    options.signal.addEventListener(`abort`, onExternalSignal, { once: true });
  }
  ;
  const read = async () => {
    log(`read. State: ${sm.value}`);
    ourAc = new AbortController();
    try {
      sm = to2(sm, `wait_for_next`);
      const v = await nextWithTimeout(iterator2, { signal: ourAc.signal, millis: readTimeoutMs });
      sm = to2(sm, `processing_result`);
      ourAc.abort(`nextWithTimeout completed`);
      if (v.done) {
        log(`read v.done true`);
        events.dispose(`Generator complete`);
        sm = to2(sm, `disposed`);
      }
      if (sm.value === `stopping`) {
        log(`read. sm.value = stopping`);
        sm = to2(sm, `idle`);
        return;
      }
      if (sm.value === `disposed`) {
        log(`read. sm.value = disposed`);
        return;
      }
      events.set(v.value);
    } catch (error) {
      events.dispose(`Generator error: ${error.toString()}`);
      return;
    }
    if (sm.value === `processing_result`) {
      sm = to2(sm, `queued`);
      log(`scheduling read. State: ${sm.value}`);
      setTimeout(read, readIntervalMs);
    } else {
      sm = to2(sm, `idle`);
    }
  };
  const events = initLazyStream({
    ...options,
    lazy,
    onStart() {
      log(`onStart state: ${sm.value} whenStopped: ${whenStopped}`);
      if (sm.value !== `idle`) return;
      if (sm.value === `idle` && whenStopped === `reset` || iterator2 === void 0) {
        iterator2 = isAsyncIterable(source) ? source[Symbol.asyncIterator]() : source[Symbol.iterator]();
      }
      void read();
    },
    onStop() {
      log(`onStop state: ${sm.value} whenStopped: ${whenStopped}`);
      sm = to2(sm, `stopping`);
      if (whenStopped === `reset`) {
        log(`onStop reiniting iterator`);
        iterator2 = isAsyncIterable(source) ? source[Symbol.asyncIterator]() : source[Symbol.iterator]();
      }
    },
    onDispose(reason) {
      log(`onDispose (${reason})`);
      ourAc?.abort(`Rx.From.iterator disposed (${reason})`);
      if (options.signal) options.signal.removeEventListener(`abort`, onExternalSignal);
    }
  });
  return events;
}

// ../rx/src/resolve-source.ts
var resolveSource = (source, options = {}) => {
  if (isReactive2(source)) return source;
  const generatorOptions = options.generator ?? { lazy: `initial`, interval: 5 };
  const functionOptions = options.function ?? { lazy: `very` };
  if (Array.isArray(source)) {
    return iterator(source.values(), generatorOptions);
  } else if (typeof source === `function`) {
    return func(source, functionOptions);
  } else if (typeof source === `object`) {
    if (isWrapped(source)) {
      return source.source;
    }
    if (isIterable(source) || isAsyncIterable(source)) {
      return iterator(source, generatorOptions);
    }
  }
  throw new TypeError(`Unable to resolve source. Supports: array, Reactive, Async/Iterable. Got type: ${typeof source}`);
};

// ../rx/src/cache.ts
function cache(r, initialValue) {
  let lastValue = initialValue;
  r.onValue((value) => {
    lastValue = value;
  });
  return {
    ...r,
    last() {
      return lastValue;
    },
    resetCachedValue() {
      lastValue = void 0;
    }
  };
}

// ../rx/src/init-stream.ts
function initUpstream(upstreamSource, options) {
  const lazy = options.lazy ?? `initial`;
  const disposeIfSourceDone = options.disposeIfSourceDone ?? true;
  const onValue = options.onValue ?? ((_v) => {
  });
  const source = resolveSource(upstreamSource);
  let unsub;
  const debugLabel = options.debugLabel ? `[${options.debugLabel}]` : ``;
  const onStop = () => {
    if (unsub === void 0) return;
    unsub();
    unsub = void 0;
    if (options.onStop) options.onStop();
  };
  const onStart = () => {
    if (unsub !== void 0) return;
    if (options.onStart) options.onStart();
    unsub = source.on((value) => {
      if (messageIsSignal(value)) {
        if (value.signal === `done`) {
          onStop();
          events.signal(value.signal, value.context);
          if (disposeIfSourceDone) events.dispose(`Upstream source ${debugLabel} has completed (${value.context ?? ``})`);
        } else {
          events.signal(value.signal, value.context);
        }
      } else if (messageHasValue(value)) {
        onValue(value.value);
      }
    });
  };
  const events = initLazyStream({
    ...options,
    lazy,
    onStart,
    onStop
  });
  return events;
}
function initLazyStreamWithInitial(options) {
  const r = initLazyStream(options);
  const c4 = cache(r, options.initialValue);
  return c4;
}
function initLazyStream(options) {
  const lazy = options.lazy ?? `initial`;
  const onStop = options.onStop ?? (() => {
  });
  const onStart = options.onStart ?? (() => {
  });
  const debugLabel = options.debugLabel ? `[${options.debugLabel}]` : ``;
  const events = initStream({
    ...options,
    onFirstSubscribe() {
      if (lazy !== `never`) {
        onStart();
      }
    },
    onNoSubscribers() {
      if (lazy === `very`) {
        onStop();
      }
    }
  });
  if (lazy === `never`) onStart();
  return events;
}
function initStream(options = {}) {
  let dispatcher;
  let disposed = false;
  let firstSubscribe = false;
  let emptySubscriptions = true;
  const onFirstSubscribe = options.onFirstSubscribe ?? void 0;
  const onNoSubscribers = options.onNoSubscribers ?? void 0;
  const debugLabel = options.debugLabel ? `[${options.debugLabel}]` : ``;
  const isEmpty7 = () => {
    if (dispatcher === void 0) return;
    if (!dispatcher.isEmpty) return;
    if (!emptySubscriptions) {
      emptySubscriptions = true;
      firstSubscribe = false;
      if (onNoSubscribers) onNoSubscribers();
    }
  };
  const subscribe = (handler) => {
    if (disposed) throw new Error(`Disposed, cannot subscribe ${debugLabel}`);
    if (dispatcher === void 0) dispatcher = new DispatchList();
    const id = dispatcher.add(handler);
    emptySubscriptions = false;
    if (!firstSubscribe) {
      firstSubscribe = true;
      if (onFirstSubscribe) onFirstSubscribe();
    }
    return () => {
      dispatcher?.remove(id);
      isEmpty7();
    };
  };
  return {
    dispose: (reason) => {
      if (disposed) return;
      dispatcher?.notify({ value: void 0, signal: `done`, context: `Disposed: ${reason}` });
      disposed = true;
      if (options.onDispose) options.onDispose(reason);
    },
    isDisposed: () => {
      return disposed;
    },
    removeAllSubscribers: () => {
      dispatcher?.clear();
      isEmpty7();
    },
    set: (v) => {
      if (disposed) throw new Error(`${debugLabel} Disposed, cannot set`);
      dispatcher?.notify({ value: v });
    },
    // through: (pass: Passed<V>) => {
    //   if (disposed) throw new Error(`Disposed, cannot through`);
    //   dispatcher?.notify(pass)
    // },
    signal: (signal, context) => {
      if (disposed) throw new Error(`${debugLabel} Disposed, cannot signal`);
      dispatcher?.notify({ signal, value: void 0, context });
    },
    on: (handler) => subscribe(handler),
    onValue: (handler) => {
      const unsub = subscribe((message) => {
        if (messageHasValue(message)) {
          handler(message.value);
        }
      });
      return unsub;
    }
  };
}

// ../rx/src/sinks/dom.ts
var setHtmlText = (rxOrSource, optionsOrElementOrQuery) => {
  let el;
  let options;
  if (typeof optionsOrElementOrQuery === `string`) {
    options = { query: optionsOrElementOrQuery };
  }
  if (typeof optionsOrElementOrQuery === `object`) {
    if (`nodeName` in optionsOrElementOrQuery) {
      options = { el: optionsOrElementOrQuery };
    } else {
      options = optionsOrElementOrQuery;
    }
  }
  if (options === void 0) throw new TypeError(`Missing element as second parameter or option`);
  if (`el` in options) {
    el = options.el;
  } else if (`query` in options) {
    el = document.querySelector(options.query);
  } else {
    throw new TypeError(`Options does not include 'el' or 'query' fields`);
  }
  if (el === null || el === void 0) throw new Error(`Element could not be resolved.`);
  const stream2 = resolveSource(rxOrSource);
  const setter2 = setProperty(options.asHtml ? `innerHTML` : `textContent`, el);
  const off = stream2.onValue((value) => {
    setter2(value);
  });
  return off;
};

// ../rx/src/to-readable.ts
var toReadable = (stream2) => ({
  on: stream2.on,
  dispose: stream2.dispose,
  isDisposed: stream2.isDisposed,
  onValue: stream2.onValue
});

// ../rx/src/ops/annotate.ts
function annotate(input, annotator, options = {}) {
  const upstream = initUpstream(input, {
    ...options,
    onValue(value) {
      const annotation = annotator(value);
      upstream.set({ value, annotation });
    }
  });
  return toReadable(upstream);
}
function annotateWithOp(input, annotatorOp) {
  const inputStream = resolveSource(input);
  const stream2 = annotatorOp(inputStream);
  const synced = syncToObject({
    value: inputStream,
    annotation: stream2
  });
  return synced;
}

// ../rx/src/ops/chunk.ts
function chunk(source, options = {}) {
  const queue = new QueueMutable();
  const quantity = options.quantity ?? 0;
  const returnRemainder = options.returnRemainder ?? true;
  const upstreamOpts = {
    ...options,
    onStop() {
      if (returnRemainder && !queue.isEmpty) {
        const data = queue.toArray();
        queue.clear();
        upstream.set(data);
      }
    },
    onValue(value) {
      queue.enqueue(value);
      if (quantity > 0 && queue.length >= quantity) {
        send();
      }
      if (timer !== void 0 && timer.runState === `idle`) {
        timer.start();
      }
    }
  };
  const upstream = initUpstream(source, upstreamOpts);
  const send = () => {
    if (queue.isEmpty) return;
    if (timer !== void 0) timer.start();
    const data = queue.toArray();
    queue.clear();
    setTimeout(() => {
      upstream.set(data);
    });
  };
  const timer = options.elapsed ? timeout(send, options.elapsed) : void 0;
  return toReadable(upstream);
}

// ../rx/src/ops/transform.ts
function transform(input, transformer, options = {}) {
  const traceInput = options.traceInput ?? false;
  const traceOutput = options.traceOutput ?? false;
  const upstream = initUpstream(input, {
    lazy: `initial`,
    ...options,
    onValue(value) {
      const t2 = transformer(value);
      if (traceInput && traceOutput) {
        console.log(`Rx.Ops.transform input: ${JSON.stringify(value)} output: ${JSON.stringify(t2)}`);
      } else if (traceInput) {
        console.log(`Rx.Ops.transform input: ${JSON.stringify(value)}`);
      } else if (traceOutput) {
        console.log(`Rx.Ops.transform output: ${JSON.stringify(t2)}`);
      }
      upstream.set(t2);
    }
  });
  return toReadable(upstream);
}

// ../rx/src/ops/clone-from-fields.ts
var cloneFromFields2 = (source) => {
  return transform(source, (v) => {
    const entries = [];
    for (const field2 in v) {
      const value = v[field2];
      if (isPlainObjectOrPrimitive(value)) {
        entries.push([field2, value]);
      }
    }
    return Object.fromEntries(entries);
  });
};

// ../rx/src/ops/combine-latest-to-array.ts
function combineLatestToArray(reactiveSources, options = {}) {
  const event2 = initStream();
  const onSourceDone = options.onSourceDone ?? `break`;
  const data = [];
  const sources = reactiveSources.map((source) => resolveSource(source));
  const noop2 = () => {
  };
  const sourceOff = sources.map((_) => noop2);
  const doneSources = sources.map((_) => false);
  const unsub = () => {
    for (const v of sourceOff) {
      v();
    }
  };
  for (const [index, v] of sources.entries()) {
    data[index] = void 0;
    sourceOff[index] = v.on((message) => {
      if (messageIsDoneSignal(message)) {
        doneSources[index] = true;
        sourceOff[index]();
        sourceOff[index] = noop2;
        if (onSourceDone === `break`) {
          unsub();
          event2.dispose(`Source has completed and 'break' is set`);
          return;
        }
        if (!doneSources.includes(false)) {
          unsub();
          event2.dispose(`All sources completed`);
        }
      } else if (messageHasValue(message)) {
        data[index] = message.value;
        event2.set([...data]);
      }
    });
  }
  return {
    dispose: event2.dispose,
    isDisposed: event2.isDisposed,
    on: event2.on,
    onValue: event2.onValue
  };
}

// ../rx/src/from/object.ts
function object(initialValue, options = {}) {
  const eq = options.eq ?? isEqualContextString;
  const setEvent = initStream();
  const diffEvent = initStream();
  const fieldChangeEvents = [];
  let value = initialValue;
  let disposed = false;
  const set5 = (v) => {
    const diff = [...compareData(value ?? {}, v, { ...options, includeMissingFromA: true })];
    if (diff.length === 0) return;
    value = v;
    setEvent.set(v);
    diffEvent.set(diff);
  };
  const fireFieldUpdate = (field2, value2) => {
    for (const [matcher, pattern, list] of fieldChangeEvents) {
      if (matcher(field2)) {
        list.notify({ fieldName: field2, pattern, value: value2 });
      }
    }
  };
  const updateCompareOptions = {
    asPartial: true,
    includeParents: true
  };
  const update = (toMerge) => {
    if (value === void 0) {
      value = toMerge;
      setEvent.set(value);
      for (const [k, v] of Object.entries(toMerge)) {
        fireFieldUpdate(k, v);
      }
      return value;
    } else {
      const diff = [...compareData(value, toMerge, updateCompareOptions)];
      if (diff.length === 0) return value;
      value = {
        ...value,
        ...toMerge
      };
      setEvent.set(value);
      diffEvent.set(diff);
      for (const d2 of diff) {
        fireFieldUpdate(d2.path, d2.value);
      }
      return value;
    }
  };
  const updateField = (path2, valueForField) => {
    if (value === void 0) throw new Error(`Cannot update value when it has not already been set`);
    const existing = getField(value, path2);
    if (!throwResult(existing)) return;
    if (eq(existing.value, valueForField, path2)) {
      return;
    }
    let diff = [...compareData(existing.value, valueForField, { ...options, includeMissingFromA: true })];
    diff = diff.map((d2) => {
      if (d2.path.length > 0) return { ...d2, path: path2 + `.` + d2.path };
      return { ...d2, path: path2 };
    });
    const o = updateByPath(value, path2, valueForField, true);
    value = o;
    setEvent.set(o);
    diffEvent.set(diff);
    fireFieldUpdate(path2, valueForField);
  };
  const dispose = (reason) => {
    if (disposed) return;
    diffEvent.dispose(reason);
    setEvent.dispose(reason);
    disposed = true;
  };
  return {
    dispose,
    isDisposed() {
      return disposed;
    },
    /**
     * Update a field.
     * Exception is thrown if field does not exist
     */
    updateField,
    last: () => value,
    on: setEvent.on,
    onValue: setEvent.onValue,
    onDiff: diffEvent.onValue,
    onField(fieldPattern, handler) {
      const matcher = wildcard(fieldPattern);
      const listeners = new DispatchList();
      fieldChangeEvents.push([matcher, fieldPattern, listeners]);
      const id = listeners.add(handler);
      return () => listeners.remove(id);
    },
    /**
     * Set the whole object
     */
    set: set5,
    /**
     * Update the object with a partial set of fields and values
     */
    update
  };
}

// ../rx/src/ops/combine-latest-to-object.ts
function combineLatestToObject(reactiveSources, options = {}) {
  const disposeSources = options.disposeSources ?? true;
  const event2 = object(void 0);
  const onSourceDone = options.onSourceDone ?? `break`;
  const emitInitial = options.emitInitial ?? true;
  let emitInitialDone = false;
  const states = /* @__PURE__ */ new Map();
  for (const [key, source] of Object.entries(reactiveSources)) {
    const initialData = `last` in source ? source.last() : void 0;
    const s = {
      source: resolveSource(source),
      done: false,
      data: initialData,
      off: () => {
      }
    };
    states.set(key, s);
  }
  const sources = Object.fromEntries(Object.entries(states).map((entry) => [entry[0], entry[1].source]));
  const someUnfinished = () => some(states, (v) => !v.done);
  const unsub = () => {
    for (const state of states.values()) state.off();
  };
  const getData = () => {
    const r = {};
    for (const [key, state] of states) {
      const d2 = state.data;
      if (d2 !== void 0) {
        r[key] = state.data;
      }
    }
    return r;
  };
  const trigger = () => {
    emitInitialDone = true;
    const d2 = getData();
    event2.set(d2);
  };
  const wireUpState = (state) => {
    state.off = state.source.on((message) => {
      if (messageIsDoneSignal(message)) {
        state.done = true;
        state.off();
        state.off = () => {
        };
        if (onSourceDone === `break`) {
          unsub();
          event2.dispose(`Source has completed and 'break' is behaviour`);
          return;
        }
        if (!someUnfinished()) {
          unsub();
          event2.dispose(`All sources completed`);
        }
      } else if (messageHasValue(message)) {
        state.data = message.value;
        trigger();
      }
    });
  };
  for (const state of states.values()) {
    wireUpState(state);
  }
  if (!emitInitialDone && emitInitial) {
    trigger();
  }
  return {
    ...event2,
    hasSource(field2) {
      return states.has(field2);
    },
    replaceSource(field2, source) {
      const state = states.get(field2);
      if (state === void 0) throw new Error(`Field does not exist: '${field2}'`);
      state.off();
      const s = resolveSource(source);
      state.source = s;
      wireUpState(state);
    },
    setWith(data) {
      const written = {};
      for (const [key, value] of Object.entries(data)) {
        const state = states.get(key);
        if (state !== void 0) {
          if (isWritable(state.source)) {
            state.source.set(value);
            written[key] = value;
          }
          state.data = value;
        }
      }
      return written;
    },
    sources,
    last() {
      return getData();
    },
    dispose(reason) {
      unsub();
      event2.dispose(reason);
      if (disposeSources) {
        for (const v of states.values()) {
          v.source.dispose(`Part of disposed mergeToObject`);
        }
      }
    }
  };
}

// ../rx/src/ops/compute-with-previous.ts
function computeWithPrevious(input, fn) {
  let previousValue;
  let currentValue;
  if (hasLast2(input)) {
    currentValue = previousValue = input.last();
  }
  const trigger = () => {
    if (previousValue === void 0 && currentValue !== void 0) {
      previousValue = currentValue;
      upstream.set(previousValue);
    } else if (previousValue !== void 0 && currentValue !== void 0) {
      const vv = fn(previousValue, currentValue);
      previousValue = vv;
      upstream.set(vv);
    }
  };
  const upstream = initUpstream(input, {
    lazy: "very",
    debugLabel: `computeWithPrevious`,
    onValue(value) {
      currentValue = value;
      trigger();
    }
  });
  if (currentValue) trigger();
  return {
    ...toReadable(upstream),
    ping: () => {
      if (currentValue !== void 0) trigger();
    }
  };
}

// ../rx/src/reactives/debounce.ts
function debounce(source, options = {}) {
  const elapsed3 = intervalToMs(options.elapsed, 50);
  let lastValue;
  const timer = timeout(() => {
    const v = lastValue;
    if (v) {
      upstream.set(v);
      lastValue = void 0;
    }
  }, elapsed3);
  const upstream = initUpstream(source, {
    ...options,
    onValue(value) {
      lastValue = value;
      timer.start();
    }
  });
  return toReadable(upstream);
}

// ../rx/src/ops/debounce.ts
function debounce2(options) {
  return (source) => {
    return debounce(source, options);
  };
}

// ../rx/src/ops/elapsed.ts
var elapsed2 = (input) => {
  let last5 = 0;
  return transform(input, (_ignored) => {
    const elapsed3 = last5 === 0 ? 0 : Date.now() - last5;
    last5 = Date.now();
    return elapsed3;
  });
};

// ../rx/src/ops/field.ts
function field(fieldSource, fieldName, options = {}) {
  const fallbackFieldValue = options.fallbackFieldValue;
  const fallbackObject = options.fallbackObject;
  const upstream = initUpstream(fieldSource, {
    disposeIfSourceDone: true,
    ...options,
    onValue(value) {
      let v;
      if (fieldName in value) {
        v = value[fieldName];
      } else if (fallbackObject && fieldName in fallbackObject) {
        v = fallbackObject[fieldName];
      }
      if (v === void 0) {
        v = fallbackFieldValue;
      }
      if (v !== void 0) {
        upstream.set(v);
      }
    }
  });
  return toReadable(upstream);
}

// ../rx/src/ops/filter.ts
function filter3(input, predicate, options) {
  const upstream = initUpstream(input, {
    ...options,
    onValue(value) {
      if (predicate(value)) {
        upstream.set(value);
      }
    }
  });
  return toReadable(upstream);
}
function drop(input, predicate, options) {
  const upstream = initUpstream(input, {
    ...options,
    onValue(value) {
      if (!predicate(value)) {
        upstream.set(value);
      }
    }
  });
  return toReadable(upstream);
}

// ../rx/src/ops/interpolate.ts
function interpolate9(input, options = {}) {
  const amount = options.amount ?? 0.1;
  const snapAt = options.snapAt ?? 0.99;
  const index = interpolate8(amount, options);
  return computeWithPrevious(input, (previous, target) => {
    const v = index(previous, target);
    if (target > previous) {
      if (v / target >= snapAt) return target;
    }
    return v;
  });
}

// ../process/src/basic.ts
var max7 = () => {
  let max9 = Number.MIN_SAFE_INTEGER;
  const compute = (value) => {
    const valueArray = Array.isArray(value) ? value : [value];
    for (const subValue of valueArray) {
      if (typeof subValue !== `number`) break;
      max9 = Math.max(subValue, max9);
    }
    return max9;
  };
  return compute;
};
var min6 = () => {
  let min8 = Number.MAX_SAFE_INTEGER;
  const compute = (value) => {
    const valueArray = Array.isArray(value) ? value : [value];
    for (const subValue of valueArray) {
      if (typeof subValue !== `number`) break;
      min8 = Math.min(subValue, min8);
    }
    return min8;
  };
  return compute;
};
var sum5 = () => {
  let t2 = 0;
  const compute = (value) => {
    const valueArray = Array.isArray(value) ? value : [value];
    for (const subValue of valueArray) {
      if (typeof subValue !== `number`) continue;
      t2 += subValue;
    }
    return t2;
  };
  return compute;
};
var average2 = () => {
  let total2 = 0;
  let tally3 = 0;
  const compute = (value) => {
    const valueArray = Array.isArray(value) ? value : [value];
    for (const subValue of valueArray) {
      if (typeof subValue !== `number`) continue;
      tally3++;
      total2 += subValue;
    }
    return total2 / tally3;
  };
  return compute;
};
var tally = (countArrayItems) => {
  let t2 = 0;
  const compute = (value) => {
    if (countArrayItems) {
      if (Array.isArray(value)) t2 += value.length;
      else t2++;
    } else {
      t2++;
    }
    return t2;
  };
  return compute;
};
function rank(r, options = {}) {
  const includeType = options.includeType;
  const emitEqualRanked = options.emitEqualRanked ?? false;
  const emitRepeatHighest = options.emitRepeatHighest ?? false;
  let best;
  return (value) => {
    if (includeType && typeof value !== includeType) return;
    if (best === void 0) {
      best = value;
      return best;
    } else {
      const result = r(value, best);
      if (result == `a`) {
        best = value;
        return best;
      } else if (result === `eq` && emitEqualRanked) {
        return best;
      } else if (emitRepeatHighest) {
        return best;
      }
    }
  };
}

// ../rx/src/ops/math.ts
function max8(input, options) {
  const p2 = max7();
  return process(p2, `max`, input, options);
}
function min7(input, options) {
  const p2 = min6();
  return process(p2, `min`, input, options);
}
function average3(input, options) {
  const p2 = average2();
  return process(p2, `average`, input, options);
}
function sum6(input, options) {
  const p2 = sum5();
  return process(p2, `sum`, input, options);
}
function tally2(input, options = {}) {
  const countArrayItems = options.countArrayItems ?? true;
  const p2 = tally(countArrayItems);
  return process(p2, `tally`, input, options);
}
function rank2(input, rank3, options) {
  const p2 = rank(rank3, options);
  return process(p2, `rank`, input, options);
}
function process(processor, annotationField, input, options = {}) {
  const annotate2 = options.annotate;
  let previous;
  const skipUndefined = options.skipUndefined ?? true;
  const skipIdentical = options.skipIdentical ?? true;
  const upstream = initUpstream(input, {
    ...options,
    onValue(value) {
      const x = processor(value);
      if (x === void 0 && skipUndefined) return;
      if (skipIdentical && x === previous) return;
      previous = x;
      if (annotate2) {
        const ret = { value };
        ret[annotationField] = x;
        upstream.set(ret);
      } else {
        upstream.set(x);
      }
    }
  });
  return toReadable(upstream);
}

// ../rx/src/ops/pipe.ts
var pipe = (...streams) => {
  const event2 = initStream();
  const unsubs = [];
  const performDispose = (reason) => {
    for (const s of streams) {
      if (!s.isDisposed) s.dispose(reason);
    }
    for (const s of unsubs) {
      s();
    }
    event2.dispose(reason);
  };
  for (let index = 0; index < streams.length; index++) {
    unsubs.push(streams[index].on((message) => {
      const isLast = index === streams.length - 1;
      if (messageHasValue(message)) {
        if (isLast) {
          event2.set(message.value);
        } else {
          streams[index + 1].set(message.value);
        }
      } else if (messageIsDoneSignal(message)) {
        performDispose(`Upstream disposed`);
      }
    }));
  }
  return {
    on: event2.on,
    onValue: event2.onValue,
    dispose(reason) {
      performDispose(reason);
    },
    isDisposed() {
      return event2.isDisposed();
    }
  };
};

// ../rx/src/ops/single-from-array.ts
function singleFromArray(source, options = {}) {
  const order = options.order ?? `default`;
  if (!options.at && !options.predicate) throw new Error(`Options must have 'predicate' or 'at' fields`);
  let preprocess = (values2) => values2;
  if (order === `random`) preprocess = shuffle;
  else if (typeof order === `function`) preprocess = (values2) => values2.toSorted(order);
  const upstream = initUpstream(source, {
    onValue(values2) {
      values2 = preprocess(values2);
      if (options.predicate) {
        for (const v of values2) {
          if (options.predicate(v)) {
            upstream.set(v);
          }
        }
      } else if (options.at) {
        upstream.set(values2.at(options.at));
      }
    }
  });
  return upstream;
}

// ../rx/src/ops/split.ts
var split = (rxOrSource, options = {}) => {
  const quantity = options.quantity ?? 2;
  const outputs = [];
  const source = resolveSource(rxOrSource);
  for (let index = 0; index < quantity; index++) {
    outputs.push(initUpstream(source, { disposeIfSourceDone: true, lazy: `initial` }));
  }
  return outputs;
};
var splitLabelled = (rxOrSource, labels) => {
  const source = resolveSource(rxOrSource);
  const t2 = {};
  for (const label of labels) {
    t2[label] = initUpstream(source, { lazy: `initial`, disposeIfSourceDone: true });
  }
  return t2;
};

// ../rx/src/ops/switcher.ts
var switcher = (reactiveOrSource, cases, options = {}) => {
  const match = options.match ?? `first`;
  const source = resolveSource(reactiveOrSource);
  let disposed = false;
  const t2 = {};
  for (const label of Object.keys(cases)) {
    t2[label] = initStream();
  }
  const performDispose = () => {
    if (disposed) return;
    unsub();
    disposed = true;
    for (const stream2 of Object.values(t2)) {
      stream2.dispose(`switcher source dispose`);
    }
  };
  const unsub = source.on((message) => {
    if (messageHasValue(message)) {
      for (const [lbl, pred] of Object.entries(cases)) {
        if (pred(message.value)) {
          t2[lbl].set(message.value);
          if (match === `first`) break;
        }
      }
    } else if (messageIsDoneSignal(message)) {
      performDispose();
    }
  });
  return t2;
};

// ../rx/src/ops/sync-to-array.ts
function syncToArray(reactiveSources, options = {}) {
  const onSourceDone = options.onSourceDone ?? `break`;
  const finalValue = options.finalValue ?? `undefined`;
  const maximumWait = intervalToMs(options.maximumWait, 2e3);
  let watchdog;
  const data = [];
  const states = reactiveSources.map((source) => ({
    finalData: void 0,
    done: false,
    source: resolveSource(source),
    unsub: () => {
    }
  }));
  const unsubscribe = () => {
    for (const s of states) {
      s.unsub();
      s.unsub = () => {
      };
    }
  };
  const isDataSetComplete = () => {
    for (let index = 0; index < data.length; index++) {
      if (onSourceDone === `allow` && states[index].done) continue;
      if (data[index] === void 0) return false;
    }
    return true;
  };
  const hasIncompleteSource = () => states.some((s) => !s.done);
  const resetDataSet = () => {
    for (let index = 0; index < data.length; index++) {
      if (finalValue === `last` && states[index].done) continue;
      data[index] = void 0;
    }
  };
  const onWatchdog = () => {
    done(`Sync timeout exceeded (${maximumWait.toString()})`);
  };
  const done = (reason) => {
    if (watchdog) clearTimeout(watchdog);
    unsubscribe();
    event2.dispose(reason);
  };
  const init3 = () => {
    watchdog = setTimeout(onWatchdog, maximumWait);
    for (const [index, state] of states.entries()) {
      data[index] = void 0;
      state.unsub = state.source.on((valueChanged) => {
        if (messageIsSignal(valueChanged)) {
          if (valueChanged.signal === `done`) {
            state.finalData = data[index];
            state.unsub();
            state.done = true;
            state.unsub = () => {
            };
            if (finalValue === `undefined`) data[index] = void 0;
            if (onSourceDone === `break`) {
              done(`Source '${index.toString()}' done, and onSourceDone:'break' is set`);
              return;
            }
            if (!hasIncompleteSource()) {
              done(`All sources done`);
              return;
            }
          }
          return;
        }
        data[index] = valueChanged.value;
        if (isDataSetComplete()) {
          event2.set([...data]);
          resetDataSet();
          if (watchdog) clearTimeout(watchdog);
          watchdog = setTimeout(onWatchdog, maximumWait);
        }
      });
    }
  };
  const event2 = initStream({
    onFirstSubscribe() {
      unsubscribe();
      init3();
    },
    onNoSubscribers() {
      if (watchdog) clearTimeout(watchdog);
      unsubscribe();
    }
  });
  return {
    dispose: event2.dispose,
    isDisposed: event2.isDisposed,
    on: event2.on,
    onValue: event2.onValue
  };
}

// ../rx/src/ops/sync-to-object.ts
function syncToObject(reactiveSources, options = {}) {
  const keys = Object.keys(reactiveSources);
  const values2 = Object.values(reactiveSources);
  const s = syncToArray(values2, options);
  const st = transform(s, (streamValues) => {
    return zipKeyValue(keys, streamValues);
  });
  return st;
}

// ../rx/src/ops/tap.ts
function tapProcess(input, ...processors) {
  const inputStream = resolveSource(input);
  const chain = Process.flow(...processors);
  inputStream.onValue((value) => {
    chain(value);
  });
  return inputStream;
}
function tapStream(input, diverged) {
  const inputStream = resolveSource(input);
  inputStream.onValue((value) => {
    diverged.set(value);
  });
  return inputStream;
}
var tapOps = (input, ...ops) => {
  for (const op of ops) {
    input = op(input);
  }
  return input;
};

// ../rx/src/ops/throttle.ts
function throttle(throttleSource, options = {}) {
  const elapsed3 = intervalToMs(options.elapsed, 0);
  let lastFire = performance.now();
  let lastValue;
  const upstream = initUpstream(throttleSource, {
    ...options,
    onValue(value) {
      lastValue = value;
      trigger();
    }
  });
  const trigger = () => {
    const now = performance.now();
    if (elapsed3 > 0 && now - lastFire > elapsed3) {
      lastFire = now;
      if (lastValue !== void 0) {
        upstream.set(lastValue);
      }
    }
  };
  return toReadable(upstream);
}

// ../rx/src/ops/timeout-value.ts
function timeoutValue(source, options) {
  let timer;
  const immediate = options.immediate ?? true;
  const repeat2 = options.repeat ?? false;
  const timeoutMs = intervalToMs(options.interval, 1e3);
  if (!isTrigger(options)) {
    throw new Error(`Param 'options' does not contain trigger 'value' or 'fn' fields`);
  }
  const sendFallback = () => {
    const [value, done] = resolveTriggerValue(options);
    if (done) {
      events.dispose(`Trigger completed`);
    } else {
      if (events.isDisposed()) return;
      events.set(value);
      if (repeat2) {
        timer = setTimeout(sendFallback, timeoutMs);
      }
    }
  };
  const events = initUpstream(source, {
    disposeIfSourceDone: true,
    // Received a value from upstream source
    onValue(v) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(sendFallback, timeoutMs);
      events.set(v);
    },
    onDispose() {
      if (timer) clearTimeout(timer);
    }
  });
  if (immediate && !timer) {
    timer = setTimeout(sendFallback, timeoutMs);
  }
  return events;
}

// ../rx/src/ops/timeout-ping.ts
function timeoutPing(source, options) {
  let timer;
  const rx = resolveSource(source);
  const abort = options.abort;
  const timeoutMs = intervalToMs(options, 1e3);
  const sendPing = () => {
    if (abort?.aborted || rx.isDisposed()) {
      off();
      return;
    }
    if (isPingable(rx)) rx.ping();
    timer = setTimeout(sendPing, timeoutMs);
  };
  const cancel = () => {
    if (timer) clearTimeout(timer);
  };
  const off = rx.on((message) => {
    if (messageHasValue(message)) {
      cancel();
      timer = setTimeout(sendPing, timeoutMs);
    } else if (messageIsDoneSignal(message)) {
      off();
      cancel();
    }
  });
  timer = setTimeout(sendPing, timeoutMs);
  return rx;
}

// ../rx/src/ops/value-to-ping.ts
function valueToPing(source, target, options = {}) {
  const lazy = options.lazy ?? `initial`;
  const signal = options.signal;
  const sourceRx = resolveSource(source);
  const gate = options.gate ?? ((value) => true);
  let upstreamOff;
  let downstreamOff;
  if (signal) {
    signal.addEventListener(`abort`, () => {
      done(`Abort signal ${signal.reason}`);
    }, { once: true });
  }
  const events = initStream({
    onFirstSubscribe() {
      if (lazy !== `never` && upstreamOff === void 0) start();
    },
    onNoSubscribers() {
      if (lazy === `very` && upstreamOff !== void 0) {
        upstreamOff();
        upstreamOff = void 0;
      }
    }
  });
  const start = () => {
    upstreamOff = sourceRx.on((message) => {
      if (messageIsDoneSignal(message)) {
        done(`Upstream closed`);
      } else if (messageIsSignal(message)) {
        events.signal(message.signal);
      } else if (messageHasValue(message)) {
        if (gate(message.value)) {
          target.ping();
        }
      }
    });
    downstreamOff = target.on((message) => {
      if (messageIsDoneSignal(message)) {
        done(`Downstream closed`);
      } else if (messageIsSignal(message)) {
        events.signal(message.signal, message.context);
      } else if (messageHasValue(message)) {
        events.set(message.value);
      }
    });
  };
  const done = (reason) => {
    events.dispose(reason);
    if (upstreamOff) upstreamOff();
    if (downstreamOff) downstreamOff();
  };
  if (lazy === `never`) start();
  return events;
}

// ../rx/src/ops/with-value.ts
function withValue(input, options) {
  let lastValue = options.initial;
  const upstream = initUpstream(input, {
    ...options,
    onValue(value) {
      lastValue = value;
      upstream.set(value);
    }
  });
  const readable = toReadable(upstream);
  return {
    ...readable,
    last() {
      return lastValue;
    }
  };
}

// ../rx/src/graph.ts
function prepare(_rx) {
  let g2 = directed_graph_exports.graph();
  const nodes = /* @__PURE__ */ new Map();
  const events = initStream();
  const process2 = (o, path2) => {
    for (const [key, value] of Object.entries(o)) {
      const subPath = path2 + `.` + key;
      g2 = directed_graph_exports.connect(g2, {
        from: path2,
        to: subPath
      });
      if (isReactive2(value)) {
        nodes.set(subPath, { value, type: `rx` });
        value.on((v) => {
          console.log(`Rx.prepare value: ${JSON.stringify(v)} path: ${subPath}`);
        });
      } else {
        const valueType = typeof value;
        if (valueType === `bigint` || valueType === `boolean` || valueType === `number` || valueType === `string`) {
          nodes.set(subPath, { type: `primitive`, value });
        } else if (valueType === `object`) {
          process2(value, subPath);
        } else if (valueType === `function`) {
          console.log(`Rx.process - not handling functions`);
        }
      }
    }
  };
  const returnValue = {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    dispose: events.dispose,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    isDisposed: events.isDisposed,
    graph: g2,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    on: events.on,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    onValue: events.onValue
  };
  return returnValue;
}

// ../rx/src/types.ts
var symbol = Symbol(`Rx`);

// ../rx/src/to-array.ts
async function toArray5(source, options = {}) {
  const limit = options.limit ?? Number.MAX_SAFE_INTEGER;
  const maximumWait = intervalToMs(options.maximumWait, 10 * 1e3);
  const underThreshold = options.underThreshold ?? `partial`;
  const read = [];
  const rx = resolveSource(source);
  const promise = new Promise((resolve2, reject) => {
    const done = () => {
      clearTimeout(maxWait);
      unsub();
      if (read.length < limit && underThreshold === `throw`) {
        reject(new Error(`Threshold not reached. Wanted: ${limit} got: ${read.length}. Maximum wait: ${maximumWait}`));
        return;
      }
      if (read.length < limit && underThreshold === `fill`) {
        for (let index = 0; index < limit; index++) {
          if (read[index] === void 0) {
            read[index] = options.fillValue;
          }
        }
      }
      resolve2(read);
    };
    const maxWait = setTimeout(() => {
      done();
    }, maximumWait);
    const unsub = rx.on((message) => {
      if (messageIsDoneSignal(message)) {
        done();
      } else if (messageHasValue(message)) {
        read.push(message.value);
        if (read.length === limit) {
          done();
        }
      }
    });
  });
  return promise;
}
async function toArrayOrThrow(source, options = {}) {
  const limit = options.limit ?? Number.MAX_SAFE_INTEGER;
  const maximumWait = options.maximumWait ?? 5 * 1e3;
  const v = await toArray5(source, { limit, maximumWait, underThreshold: `partial` });
  if (options.limit && v.length < options.limit) throw new Error(`Threshold not reached. Wanted: ${options.limit}, got ${v.length}`);
  return v;
}

// ../rx/src/to-generator.ts
async function* toGenerator(source) {
  const s = resolveSource(source);
  let promiseResolve = (_) => {
  };
  let promiseReject = (_) => {
  };
  const promiseInit = () => new Promise((resolve2, reject) => {
    promiseResolve = resolve2;
    promiseReject = reject;
  });
  let promise = promiseInit();
  let keepRunning = true;
  s.on((message) => {
    if (messageHasValue(message)) {
      promiseResolve(message.value);
      promise = promiseInit();
    } else if (messageIsDoneSignal(message)) {
      keepRunning = false;
      promiseReject(`Source has completed`);
    }
  });
  while (keepRunning) {
    yield await promise;
  }
}

// ../rx/src/wrap.ts
function wrap6(source) {
  return {
    source: resolveSource(source),
    enacts: {
      setHtmlText: (options) => {
        return setHtmlText(source, options);
      }
    },
    annotate: (transformer) => {
      const a2 = annotate(source, transformer);
      return wrap6(a2);
    },
    annotateWithOp: (op) => {
      const a2 = annotateWithOp(source, op);
      return wrap6(a2);
    },
    chunk: (options) => {
      const w = wrap6(chunk(source, options));
      return w;
    },
    // debounce: (options: Partial<DebounceOptions> = {}) => {
    //   return wrap(Ops.debounce<TIn>(source, options));
    // },
    debounce: (options = {}) => {
      return wrap6(debounce(source, options));
    },
    field: (fieldName, options = {}) => {
      const f = field(source, fieldName, options);
      return wrap6(f);
    },
    filter: (predicate, options) => {
      return wrap6(filter3(source, predicate, options));
    },
    combineLatestToArray: (sources, options = {}) => {
      const srcs = [source, ...sources];
      return wrap6(combineLatestToArray(srcs, options));
    },
    combineLatestToObject: (sources, options) => {
      const name = options.name ?? `source`;
      const o = { ...sources };
      o[name] = source;
      return wrap6(combineLatestToObject(o, options));
    },
    min: (options = {}) => {
      return wrap6(min7(source, options));
    },
    max: (options = {}) => {
      return wrap6(max8(source, options));
    },
    average: (options = {}) => {
      return wrap6(average3(source, options));
    },
    sum: (options = {}) => {
      return wrap6(sum6(source, options));
    },
    tally: (options = {}) => {
      return wrap6(tally2(source, options));
    },
    split: (options = {}) => {
      const streams = split(source, options).map((v) => wrap6(v));
      return streams;
    },
    splitLabelled: (...labels) => {
      const l = splitLabelled(source, labels);
      const m3 = mapObjectShallow(l, (args) => wrap6(args.value));
      return m3;
    },
    switcher: (cases, options = {}) => {
      const s = switcher(source, cases, options);
      const m3 = mapObjectShallow(s, (args) => wrap6(args.value));
      return m3;
    },
    syncToArray: (additionalSources, options = {}) => {
      const unwrapped = [source, ...additionalSources].map((v) => resolveSource(v));
      const x = syncToArray(unwrapped, options);
      return wrap6(x);
    },
    syncToObject: (sources, options = {}) => {
      const name = options.name ?? `source`;
      const o = { ...sources };
      o[name] = source;
      return wrap6(syncToObject(o, options));
    },
    tapProcess: (...processors) => {
      tapProcess(source, ...processors);
      return wrap6(source);
    },
    tapStream: (divergedStream) => {
      tapStream(source, divergedStream);
      return wrap6(source);
    },
    tapOps: (source2, ...ops) => {
      tapOps(source2, ...ops);
      return wrap6(source2);
    },
    throttle: (options = {}) => {
      return wrap6(throttle(source, options));
    },
    transform: (transformer, options = {}) => {
      return wrap6(transform(source, transformer, options));
    },
    timeoutValue: (options) => {
      return wrap6(timeoutValue(source, options));
    },
    timeoutPing: (options) => {
      return wrap6(timeoutPing(source, options));
    },
    toArray: (options) => {
      return toArray5(source, options);
    },
    toArrayOrThrow: (options) => {
      return toArrayOrThrow(source, options);
    },
    onValue: (callback) => {
      const s = resolveSource(source);
      s.on((message) => {
        if (messageHasValue(message)) callback(message.value);
      });
    }
  };
}

// ../rx/src/from/index.ts
var from_exports = {};
__export(from_exports, {
  array: () => array2,
  arrayObject: () => arrayObject,
  arrayProxy: () => arrayProxy,
  boolean: () => boolean,
  count: () => count2,
  derived: () => derived,
  event: () => event,
  eventField: () => eventField,
  eventTrigger: () => eventTrigger,
  func: () => func,
  iterator: () => iterator,
  merged: () => merged,
  mergedWithOptions: () => mergedWithOptions,
  number: () => number,
  object: () => object,
  objectProxy: () => objectProxy,
  objectProxySymbol: () => objectProxySymbol,
  observable: () => observable,
  observableWritable: () => observableWritable,
  of: () => of,
  string: () => string
});

// ../rx/src/from/array.ts
var of = (source, options = {}) => {
  if (Array.isArray(source)) {
    return array2(source, options);
  } else {
  }
};
var array2 = (sourceArray, options = {}) => {
  const lazy = options.lazy ?? `initial`;
  const signal = options.signal;
  const whenStopped = options.whenStopped ?? `continue`;
  const debugLifecycle = options.debugLifecycle ?? false;
  const array3 = [...sourceArray];
  if (lazy !== `very` && whenStopped === `reset`) throw new Error(`whenStopped:'reset' has no effect with 'lazy:${lazy}'. Use lazy:'very' instead.`);
  const intervalMs = intervalToMs(options.interval, 5);
  let index = 0;
  let lastValue = array3[0];
  const s = initLazyStream({
    ...options,
    lazy,
    onStart() {
      if (debugLifecycle) console.log(`Rx.readFromArray:onStart`);
      c4.start();
    },
    onStop() {
      if (debugLifecycle) console.log(`Rx.readFromArray:onStop. whenStopped: ${whenStopped} index: ${index}`);
      c4.cancel();
      if (whenStopped === `reset`) index = 0;
    }
    // onFirstSubscribe() {
    //   if (debugLifecycle) console.log(`Rx.readFromArray:onFirstSubscribe lazy: ${ lazy } runState: '${ c.runState }'`);
    //   // Start if in lazy mode and not running
    //   if (lazy !== `never` && c.runState === `idle`) c.start();
    // },
    // onNoSubscribers() {
    //   if (debugLifecycle) console.log(`Rx.readFromArray:onNoSubscribers lazy: ${ lazy } runState: '${ c.runState }' whenStopped: '${ whenStopped }'`);
    //   if (lazy === `very`) {
    //     c.cancel();
    //     if (whenStopped === `reset`) {
    //       index = 0;
    //     }
    //   }
    // }
  });
  const c4 = continuously(() => {
    if (signal?.aborted) {
      s.dispose(`Signalled (${signal.reason})`);
      return false;
    }
    lastValue = array3[index];
    index++;
    s.set(lastValue);
    if (index === array3.length) {
      s.dispose(`Source array complete`);
      return false;
    }
  }, intervalMs);
  if (!lazy) c4.start();
  return {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    dispose: s.dispose,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    isDisposed: s.isDisposed,
    isDone() {
      return index === array3.length;
    },
    last() {
      return lastValue;
    },
    // eslint-disable-next-line @typescript-eslint/unbound-method
    on: s.on,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    onValue: s.onValue
  };
};

// ../rx/src/from/array-object.ts
function arrayObject(initialValue = [], options = {}) {
  const eq = options.eq ?? isEqualValueDefault2;
  const setEvent = initStream();
  const arrayEvent = initStream();
  let value = initialValue;
  let disposed = false;
  const set5 = (replacement) => {
    const diff = compareArrays(value, replacement, eq);
    value = replacement;
    setEvent.set([...replacement]);
  };
  const setAt = (index, v) => {
    value[index] = v;
    setEvent.set([...value]);
  };
  const push2 = (v) => {
    value = [...value, v];
    setEvent.set([...value]);
    const cr = [`add`, value.length - 1, v];
    arrayEvent.set([cr]);
  };
  const deleteAt = (index) => {
    const valueChanged = remove(value, index);
    if (valueChanged.length === value.length) return;
    const diff = compareArrays(value, valueChanged, eq);
    value = valueChanged;
    setEvent.set([...value]);
    arrayEvent.set(diff.summary);
  };
  const deleteWhere = (filter4) => {
    const valueChanged = value.filter((v) => !filter4(v));
    const count3 = value.length - valueChanged.length;
    const diff = compareArrays(value, valueChanged, eq);
    value = valueChanged;
    setEvent.set([...value]);
    arrayEvent.set(diff.summary);
    return count3;
  };
  const insertAt2 = (index, v) => {
    const valueChanged = insertAt(value, index, v);
    const diff = compareArrays(value, valueChanged, eq);
    value = valueChanged;
    setEvent.set([...value]);
    arrayEvent.set(diff.summary);
  };
  const dispose = (reason) => {
    if (disposed) return;
    setEvent.dispose(reason);
    disposed = true;
  };
  const r = {
    dispose,
    isDisposed() {
      return disposed;
    },
    last: () => value,
    on: setEvent.on,
    onArray: arrayEvent.on,
    onValue: setEvent.onValue,
    setAt,
    push: push2,
    deleteAt,
    deleteWhere,
    insertAt: insertAt2,
    /**
     * Set the whole object
     */
    set: set5
  };
  return r;
}

// ../rx/src/from/boolean.ts
function boolean(initialValue) {
  let value = initialValue;
  const events = initStream();
  const set5 = (v) => {
    value = v;
    events.set(v);
  };
  return {
    dispose: events.dispose,
    isDisposed: events.isDisposed,
    last: () => value,
    on: events.on,
    onValue: events.onValue,
    set: set5
  };
}

// ../rx/src/from/count.ts
function count2(options = {}) {
  const lazy = options.lazy ?? `initial`;
  const interval = intervalToMs(options.interval, 1e3);
  const amount = options.amount ?? 1;
  const offset2 = options.offset ?? 0;
  let produced = 0;
  let value = offset2;
  const done = (reason) => {
    events.dispose(reason);
  };
  const timer = continuously(() => {
    if (options.signal?.aborted) {
      done(`Aborted (${options.signal.reason})`);
      return false;
    }
    events.set(value);
    value += 1;
    produced++;
    if (produced >= amount) {
      done(`Limit reached`);
      return false;
    }
  }, interval);
  const events = initLazyStream({
    onStart() {
      timer.start();
    },
    onStop() {
      timer.cancel();
    },
    onDispose() {
      timer.cancel();
    },
    lazy
  });
  return events;
}

// ../rx/src/from/derived.ts
function derived(fn, reactiveSources, options = {}) {
  const ignoreIdentical = options.ignoreIdentical ?? true;
  const eq = options.eq ?? isEqualValueDefault2;
  const sources = combineLatestToObject(reactiveSources);
  const handle = (v) => {
    const last5 = output.last();
    const vv = fn(v);
    if (vv !== void 0) {
      if (ignoreIdentical && last5 !== void 0) {
        if (eq(vv, last5)) return vv;
      }
      output.set(vv);
    }
    return vv;
  };
  const s = initUpstream(sources, {
    ...options,
    onValue(v) {
      handle(v);
    }
  });
  const output = cache(s, fn(sources.last()));
  return output;
}

// ../rx/src/from/event.ts
function eventField(targetOrQuery, eventName, fieldName, initialValue, options = {}) {
  const initial = {};
  initial[fieldName] = initialValue;
  const rxField = field(
    event(targetOrQuery, eventName, initial, options),
    fieldName,
    options
  );
  return rxField;
}
function event(targetOrQuery, name, initialValue, options = {}) {
  let target;
  if (typeof targetOrQuery === `string`) {
    target = document.querySelector(targetOrQuery);
    if (target === null) throw new Error(`Target query did not resolve to an element. Query: '${targetOrQuery}'`);
  } else {
    target = targetOrQuery;
  }
  if (target === null) throw new Error(`Param 'targetOrQuery' is null`);
  const debugLifecycle = options.debugLifecycle ?? false;
  const debugFiring = options.debugFiring ?? false;
  const lazy = options.lazy ?? false;
  if (initialValue === void 0) initialValue = {};
  const rxObject = object(initialValue, { deepEntries: true });
  let eventAdded = false;
  let disposed = false;
  const callback = (args) => {
    if (debugFiring) console.log(`Reactive.event '${name}' firing '${JSON.stringify(args)}`);
    rxObject.set(args);
  };
  const remove2 = () => {
    if (!eventAdded) return;
    eventAdded = false;
    target.removeEventListener(name, callback);
    if (debugLifecycle) {
      console.log(`Rx.From.event remove '${name}'`);
    }
  };
  const add2 = () => {
    if (eventAdded) return;
    eventAdded = true;
    target.addEventListener(name, callback);
    if (debugLifecycle) {
      console.log(`Rx.From.event add '${name}'`);
    }
  };
  if (!lazy) add2();
  return {
    last: () => {
      if (lazy) add2();
      return rxObject.last();
    },
    dispose: (reason) => {
      if (disposed) return;
      disposed = true;
      remove2();
      rxObject.dispose(reason);
    },
    isDisposed() {
      return disposed;
    },
    on: (handler) => {
      if (lazy) add2();
      return rxObject.on(handler);
    },
    onValue: (handler) => {
      if (lazy) add2();
      return rxObject.onValue(handler);
    }
  };
}
function eventTrigger(targetOrQuery, name, options = {}) {
  let target;
  if (typeof targetOrQuery === `string`) {
    target = document.querySelector(targetOrQuery);
    if (target === null) throw new Error(`Target query did not resolve to an element. Query: '${targetOrQuery}'`);
  } else {
    target = targetOrQuery;
  }
  if (target === null) throw new Error(`Param 'targetOrQuery' is null`);
  const debugLifecycle = options.debugLifecycle ?? false;
  const debugFiring = options.debugFiring ?? false;
  const fireInitial = options.fireInitial ?? false;
  let count3 = 0;
  const elapsed3 = elapsedInterval();
  const stream2 = initLazyStream({
    lazy: options.lazy ?? `very`,
    onStart() {
      target.addEventListener(name, callback);
      if (debugLifecycle) {
        console.log(`Rx.From.eventTrigger add '${name}'`);
      }
      if (fireInitial && count3 === 0) {
        if (debugLifecycle || debugFiring) console.log(`Rx.From.eventTrigger: firing initial`);
        callback();
      }
    },
    onStop() {
      target.removeEventListener(name, callback);
      if (debugLifecycle) {
        console.log(`Rx.From.eventTrigger remove '${name}'`);
      }
    }
  });
  const callback = (_args) => {
    if (debugFiring) console.log(`Rx.From.eventTrigger '${name}' triggered'`);
    stream2.set({
      sinceLast: elapsed3(),
      total: ++count3
    });
  };
  return stream2;
}

// ../rx/src/from/merged.ts
function merged(...sources) {
  return mergedWithOptions(sources);
}
function mergedWithOptions(sources, options = {}) {
  let unsubs = [];
  const stream2 = initLazyStream({
    ...options,
    onStart() {
      for (const s of sources) {
        unsubs.push(s.onValue((v) => {
          stream2.set(v);
        }));
      }
    },
    onStop() {
      for (const un of unsubs) {
        un();
      }
      unsubs = [];
    }
  });
  return stream2;
}

// ../rx/src/from/number.ts
function number(initialValue) {
  let value = initialValue;
  const events = initStream();
  const set5 = (v) => {
    value = v;
    events.set(v);
  };
  return {
    dispose: events.dispose,
    isDisposed: events.isDisposed,
    last: () => value,
    on: events.on,
    onValue: events.onValue,
    set: set5
  };
}

// ../rx/src/from/object-proxy.ts
var objectProxy = (target) => {
  const rx = object(target);
  const proxy = new Proxy(target, {
    set(target2, p2, newValue, _receiver) {
      const isArray = Array.isArray(target2);
      if (isArray && p2 === `length`) return true;
      if (typeof p2 === `string`) {
        rx.updateField(p2, newValue);
      }
      if (isArray && typeof p2 === `string`) {
        const pAsNumber = Number.parseInt(p2);
        if (!Number.isNaN(pAsNumber)) {
          target2[pAsNumber] = newValue;
          return true;
        }
      }
      target2[p2] = newValue;
      return true;
    }
  });
  return { proxy, rx };
};
var arrayProxy = (target) => {
  const rx = arrayObject(target);
  const proxy = new Proxy(target, {
    set(target2, p2, newValue, _receiver) {
      if (p2 === `length`) return true;
      if (typeof p2 !== `string`) throw new Error(`Expected numeric index, got type: ${typeof p2} value: ${JSON.stringify(p2)}`);
      const pAsNumber = Number.parseInt(p2);
      if (!Number.isNaN(pAsNumber)) {
        rx.setAt(pAsNumber, newValue);
        target2[pAsNumber] = newValue;
        return true;
      } else {
        throw new Error(`Expected numeric index, got: '${p2}'`);
      }
    }
  });
  return { proxy, rx };
};
var objectProxySymbol = (target) => {
  const { proxy, rx } = objectProxy(target);
  const p2 = proxy;
  p2[symbol] = rx;
  return p2;
};

// ../rx/src/from/observable.ts
function observable(init3) {
  const ow = observableWritable(init3);
  return {
    dispose: ow.dispose,
    isDisposed: ow.isDisposed,
    on: ow.on,
    onValue: ow.onValue
  };
}
function observableWritable(init3) {
  let onCleanup = () => {
  };
  const ow = manual({
    onFirstSubscribe() {
      onCleanup = init3(ow);
    },
    onNoSubscribers() {
      if (onCleanup) onCleanup();
    }
  });
  return {
    ...ow,
    onValue: (callback) => {
      return ow.on((message) => {
        if (messageHasValue(message)) {
          callback(message.value);
        }
      });
    }
  };
}

// ../rx/src/from/string.ts
function string(initialValue) {
  let value = initialValue;
  const events = initStream();
  const set5 = (v) => {
    value = v;
    events.set(v);
  };
  return {
    dispose: events.dispose,
    isDisposed: events.isDisposed,
    last: () => value,
    on: events.on,
    onValue: events.onValue,
    set: set5
  };
}

// ../rx/src/index.ts
function run(source, ...ops) {
  let s = resolveSource(source);
  for (const op of ops) {
    s = op(s);
  }
  return s;
}
function writable(source, ...ops) {
  let s = resolveSource(source);
  const head = s;
  for (const op of ops) {
    s = op(s);
  }
  const ss = s;
  return {
    ...ss,
    set(value) {
      if (isWritable(head)) {
        head.set(value);
      } else throw new Error(`Original source is not writable`);
    }
  };
}
function manual(options = {}) {
  const events = initStream(options);
  return {
    dispose: events.dispose,
    isDisposed: events.isDisposed,
    set(value) {
      events.set(value);
    },
    on: events.on,
    onValue: events.onValue
  };
}
var Sinks = {
  setHtmlText: (options) => {
    return (source) => {
      setHtmlText(source, options);
    };
  }
};
var Ops = {
  /**
  * Annotates values with the result of a function.
  * The input value needs to be an object.
  * 
  * For every value `input` emits, run it through `annotator`, which should
  * return the original value with additional fields.
  * 
  * Conceptually the same as `transform`, just with typing to enforce result
  * values are V & TAnnotation
  * @param annotator 
  * @returns 
  */
  annotate: (annotator) => opify(annotate, annotator),
  /**
   * Annotates the input stream using {@link ReactiveOp} as the source of annotations.
   * The output values will have the shape of `{ value: TIn, annotation: TAnnotation }`.
   * Meaning that the original value is stored under `.value`, and the annotation under `.annotation`.
   * 
   * ```js
   * // Emit values from an array
   * const r1 = Rx.run(
   *  Rx.From.array([ 1, 2, 3 ]),
   *  Rx.Ops.annotateWithOp(
   *    // Add the 'max' operator to emit the largest-seen value
   *    Rx.Ops.sum()
   *  )
   * );
   * const data = await Rx.toArray(r1);
   * // Data =  [ { value: 1, annotation: 1 }, { value: 2, annotation: 3 }, { value: 3, annotation: 6 } ]
   * ```
   * @param annotatorOp 
   * @returns 
   */
  annotateWithOp: (annotatorOp) => opify(annotateWithOp, annotatorOp),
  /**
   * Takes a stream of values and chunks them up (by quantity or time elapsed),
   * emitting them as an array.
   * @param options 
   * @returns 
   */
  chunk: (options) => {
    return (source) => {
      return chunk(source, options);
    };
  },
  cloneFromFields: () => {
    return (source) => {
      return cloneFromFields2(source);
    };
  },
  /**
  * Merges values from several sources into a single source that emits values as an array.
  * @param options 
  * @returns 
  */
  combineLatestToArray: (options = {}) => {
    return (sources) => {
      return combineLatestToArray(sources, options);
    };
  },
  /**
   * Merges values from several sources into a single source that emits values as an object.
   * @param options
   * @returns 
   */
  combineLatestToObject: (options = {}) => {
    return (reactiveSources) => {
      return combineLatestToObject(reactiveSources, options);
    };
  },
  /**
  * Debounce values from the stream. It will wait until a certain time
  * has elapsed before emitting latest value.
  * 
  * Effect is that no values are emitted if input emits faster than the provided
  * timeout.
  * 
  * See also: throttle
  * @param options 
  * @returns 
  */
  // debounce: <V>(options: Partial<DebounceOptions>): ReactiveOp<V, V> => {
  //   return (source: ReactiveOrSource<V>) => {
  //     return OpFns.debounce(source, options);
  //   }
  // },
  /**
   * Drops values from the input stream that match `predicate`
   * @param predicate If it returns _true_ value is ignored
   * @returns 
   */
  drop: (predicate) => opify(drop, predicate),
  /**
   * Every upstream value is considered the target for interpolation.
   * Output value interpolates by a given amount toward the target.
   * @returns 
   */
  elapsed: () => opify(elapsed2),
  /**
   * Yields the value of a field from an input stream of values.
   * Eg if the source reactive emits `{ colour: string, size: number }`,
   * we might use `field` to pluck out the `colour` field, thus returning
   * a stream of string values.
   * @param fieldName 
   * @param options 
   * @returns 
   */
  field: (fieldName, options) => {
    return (source) => {
      return field(source, fieldName, options);
    };
  },
  /**
   * Filters the input stream, only re-emitting values that pass the predicate
   * @param predicate If it returns _true_ value is allowed through
   * @returns 
   */
  filter: (predicate) => opify(filter3, predicate),
  /**
   * Every upstream value is considered the target for interpolation.
   * Output value interpolates by a given amount toward the target.
   * @param options 
   * @returns 
   */
  interpolate: (options) => opify(interpolate9, options),
  /**
  * Outputs the minimum numerical value of the stream.
  * A value is only emitted when minimum decreases.
  * @returns 
  */
  min: (options) => opify(min7, options),
  /**
   * Outputs the maxium numerical value of the stream.
   * A value is only emitted when maximum increases.
   * @returns 
   */
  max: (options) => opify(max8, options),
  sum: (options) => opify(sum6, options),
  average: (options) => opify(average3, options),
  tally: (options) => opify(tally2, options),
  rank: (rank3, options) => opify(rank2, rank3, options),
  pipe: (...streams) => {
    return (source) => {
      const resolved = resolveSource(source);
      const s = [resolved, ...streams];
      return pipe(...s);
    };
  },
  singleFromArray: (options = {}) => {
    return (source) => {
      return singleFromArray(source, options);
    };
  },
  split: (options = {}) => {
    return (source) => {
      return split(source, options);
    };
  },
  splitLabelled: (labels) => {
    return (source) => {
      return splitLabelled(source, labels);
    };
  },
  switcher: (cases, options = {}) => {
    return (source) => {
      return switcher(source, cases, options);
    };
  },
  syncToArray: (options = {}) => {
    return (reactiveSources) => {
      return syncToArray(reactiveSources, options);
    };
  },
  syncToObject: (options = {}) => {
    return (reactiveSources) => {
      return syncToObject(reactiveSources, options);
    };
  },
  tapProcess: (processor) => {
    return (source) => {
      return tapProcess(source, processor);
    };
  },
  tapStream: (divergedStream) => {
    return (source) => {
      return tapStream(source, divergedStream);
    };
  },
  tapOps: (...ops) => {
    return (source) => {
      return tapOps(source, ...ops);
    };
  },
  /**
  * Throttle values from the stream.
  * Only emits a value if some minimum time has elapsed.
  * @param options 
  * @returns 
  */
  throttle: (options) => opify(throttle, options),
  /**
   * Trigger a value if 'source' does not emit a value within an interval.
   * Trigger value can be a fixed value, result of function, or step through an iterator.
   * @param options 
   * @returns 
   */
  timeoutValue: (options) => {
    return (source) => {
      return timeoutValue(source, options);
    };
  },
  timeoutPing: (options) => {
    return (source) => {
      return timeoutPing(source, options);
    };
  },
  transform: (transformer, options = {}) => {
    return (source) => {
      return transform(source, transformer, options);
    };
  },
  /**
  * Reactive where last (or a given initial) value is available to read
  * @param opts 
  * @returns 
  */
  withValue: (opts) => {
    return opify(withValue, opts);
  }
};
async function takeNextValue(source, maximumWait = 1e3) {
  const rx = resolveSource(source);
  let off = () => {
  };
  let watchdog;
  const p2 = new Promise((resolve2, reject) => {
    off = rx.on((message) => {
      if (watchdog) clearTimeout(watchdog);
      if (messageHasValue(message)) {
        off();
        resolve2(message.value);
      } else {
        if (messageIsDoneSignal(message)) {
          reject(new Error(`Source closed. ${message.context ?? ``}`));
          off();
        }
      }
    });
    watchdog = setTimeout(() => {
      watchdog = void 0;
      off();
      reject(new Error(`Timeout waiting for value (${JSON.stringify(maximumWait)})`));
    }, intervalToMs(maximumWait));
  });
  return p2;
}
var to3 = (a2, b2, transform2, closeBonA = false) => {
  const unsub = a2.on((message) => {
    if (messageHasValue(message)) {
      const value = transform2 ? transform2(message.value) : message.value;
      b2.set(value);
    } else if (messageIsDoneSignal(message)) {
      unsub();
      if (closeBonA) {
        b2.dispose(`Source closed (${message.context ?? ``})`);
      }
    } else {
    }
  });
  return unsub;
};
export {
  src_exports as Arrays,
  src_exports2 as Debug,
  dom_exports as Dom,
  geometry_exports as Geometry,
  modulation_exports as Modulation,
  numbers_exports as Numbers,
  rx_exports as Rx,
  visual_exports as Visual,
  align,
  alignById,
  compareIterableValuesShallow,
  comparerInverse,
  continuously,
  count,
  defaultComparer,
  defaultKeyer,
  defaultToString,
  elapsedInfinity,
  elapsedInterval,
  elapsedOnce,
  elapsedSince,
  elapsedToHumanString,
  filterValue,
  hasLast,
  intervalToMs,
  isEmptyEntries,
  isEqualContextString,
  isEqualDefault2 as isEqualDefault,
  isEqualTrace,
  isEqualValueDefault2 as isEqualValueDefault,
  isEqualValueIgnoreOrder,
  isEqualValuePartial,
  isInteger,
  isInterval,
  isMap,
  isPrimitive,
  isPrimitiveOrObject,
  isReactive,
  isSet,
  jsComparer,
  keyValueSorter,
  numericComparer,
  promiseFromEvent,
  resolve,
  resolveFields,
  resolveFieldsSync,
  resolveSync,
  resolveWithFallback,
  resolveWithFallbackSync,
  resultErrorToString,
  resultToError,
  resultToValue,
  runningiOS,
  sleep,
  sleepWhile,
  throwResult,
  toStringDefault2 as toStringDefault,
  toStringOrdered,
  unique2 as unique,
  uniqueInstances
};
