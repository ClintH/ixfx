
//#region rolldown:runtime
var __defProp = Object.defineProperty;
var __export = (target, all) => {
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
};

//#endregion
//#region packages/arrays/src/array-cycle.ts
const cycle = (options) => {
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
		if (typeof indexOrValue === `number`) index = indexOrValue;
		else {
			const found = opts.indexOf(indexOrValue);
			if (found === -1) throw new Error(`Could not find value`);
			index = found;
		}
	};
	const toArray$3 = () => [...opts];
	return {
		toArray: toArray$3,
		next,
		prev,
		get current() {
			return value();
		},
		select
	};
};

//#endregion
//#region packages/guards/src/throw-from-result.ts
const throwFromResult = (test) => {
	if (test[0]) return false;
	else throw new Error(test[1]);
};

//#endregion
//#region packages/guards/src/numbers.ts
const numberTest = (value, range$1 = ``, parameterName = `?`) => {
	if (value === null) return [false, `Parameter '${parameterName}' is null`];
	if (typeof value === `undefined`) return [false, `Parameter '${parameterName}' is undefined`];
	if (Number.isNaN(value)) return [false, `Parameter '${parameterName}' is NaN`];
	if (typeof value !== `number`) return [false, `Parameter '${parameterName}' is not a number (${JSON.stringify(value)})`];
	switch (range$1) {
		case `finite`: {
			if (!Number.isFinite(value)) return [false, `Parameter '${parameterName} must be finite (Got: ${value})`];
			break;
		}
		case `positive`: {
			if (value < 0) return [false, `Parameter '${parameterName}' must be at least zero (${value})`];
			break;
		}
		case `negative`: {
			if (value > 0) return [false, `Parameter '${parameterName}' must be zero or lower (${value})`];
			break;
		}
		case `aboveZero`: {
			if (value <= 0) return [false, `Parameter '${parameterName}' must be above zero (${value})`];
			break;
		}
		case `belowZero`: {
			if (value >= 0) return [false, `Parameter '${parameterName}' must be below zero (${value})`];
			break;
		}
		case `percentage`: {
			if (value > 1 || value < 0) return [false, `Parameter '${parameterName}' must be in percentage range (0 to 1). (${value})`];
			break;
		}
		case `nonZero`: {
			if (value === 0) return [false, `Parameter '${parameterName}' must non-zero. (${value})`];
			break;
		}
		case `bipolar`: {
			if (value > 1 || value < -1) return [false, `Parameter '${parameterName}' must be in bipolar percentage range (-1 to 1). (${value})`];
			break;
		}
	}
	return [true];
};
const throwNumberTest = (value, range$1 = ``, parameterName = `?`) => {
	throwFromResult(numberTest(value, range$1, parameterName));
};
const percentTest = (value, parameterName = `?`) => numberTest(value, `percentage`, parameterName);
const throwPercentTest = (value, parameterName = `?`) => {
	throwFromResult(percentTest(value, parameterName));
};
const integerTest = (value, range$1 = ``, parameterName = `?`) => {
	const r = numberTest(value, range$1, parameterName);
	if (!r[0]) return r;
	if (!Number.isInteger(value)) return [false, `Param '${parameterName}' is not an integer`];
	return [true];
};
const throwIntegerTest = (value, range$1 = ``, parameterName = `?`) => {
	throwFromResult(integerTest(value, range$1, parameterName));
};
const numberInclusiveRangeTest = (value, min$4, max$5, parameterName = `?`) => {
	if (typeof value !== `number`) return [false, `Param '${parameterName}' is not a number type. Got type: '${typeof value}' value: '${JSON.stringify(value)}'`];
	if (Number.isNaN(value)) return [false, `Param '${parameterName}' is not within range ${min$4}-${max$5}. Got: NaN`];
	if (Number.isFinite(value)) {
		if (value < min$4) return [false, `Param '${parameterName}' is below range ${min$4}-${max$5}. Got: ${value}`];
		else if (value > max$5) return [false, `Param '${parameterName}' is above range ${min$4}-${max$5}. Got: ${value}`];
		return [true];
	} else return [false, `Param '${parameterName}' is not within range ${min$4}-${max$5}. Got: infinite`];
};

//#endregion
//#region packages/guards/src/arrays.ts
const arrayTest = (value, parameterName = `?`) => {
	if (!Array.isArray(value)) return [false, `Parameter '${parameterName}' is expected to be an array'`];
	return [true];
};
const throwArrayTest = (value, parameterName = `?`) => {
	throwFromResult(arrayTest(value, parameterName));
};
const guardArray = (array$2, name = `?`) => {
	if (array$2 === void 0) throw new TypeError(`Param '${name}' is undefined. Expected array.`);
	if (array$2 === null) throw new TypeError(`Param '${name}' is null. Expected array.`);
	if (!Array.isArray(array$2)) throw new TypeError(`Param '${name}' not an array as expected`);
};
const guardIndex = (array$2, index, name = `index`) => {
	guardArray(array$2);
	throwIntegerTest(index, `positive`, name);
	if (index > array$2.length - 1) throw new Error(`'${name}' ${index} beyond array max of ${array$2.length - 1}`);
};

//#endregion
//#region packages/guards/src/function.ts
const functionTest = (value, parameterName = `?`) => {
	if (value === void 0) return [false, `Param '${parameterName}' is undefined. Expected: function.`];
	if (value === null) return [false, `Param '${parameterName}' is null. Expected: function.`];
	if (typeof value !== `function`) return [false, `Param '${parameterName}' is type '${typeof value}'. Expected: function`];
	return [true];
};
const throwFunctionTest = (value, parameterName = `?`) => {
	const [ok, msg] = functionTest(value, parameterName);
	if (ok) return;
	throw new TypeError(msg);
};

//#endregion
//#region packages/guards/src/object.ts
const isPlainObject = (value) => {
	if (typeof value !== `object` || value === null) return false;
	const prototype = Object.getPrototypeOf(value);
	return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
};
const isPlainObjectOrPrimitive = (value) => {
	const t$1 = typeof value;
	if (t$1 === `symbol`) return false;
	if (t$1 === `function`) return false;
	if (t$1 === `bigint`) return true;
	if (t$1 === `number`) return true;
	if (t$1 === `string`) return true;
	if (t$1 === `boolean`) return true;
	return isPlainObject(value);
};

//#endregion
//#region packages/guards/src/string.ts
const stringTest = (value, range$1 = ``, parameterName = `?`) => {
	if (typeof value !== `string`) return [false, `Param '${parameterName} is not type string. Got: ${typeof value}`];
	switch (range$1) {
		case `non-empty`:
			if (value.length === 0) return [false, `Param '${parameterName} is empty`];
			break;
	}
	return [true];
};
const throwStringTest = (value, range$1 = ``, parameterName = `?`) => {
	throwFromResult(stringTest(value, range$1, parameterName));
};

//#endregion
//#region packages/arrays/src/at-wrap.ts
const atWrap = (array$2, index) => {
	throwNumberTest(index, ``, `index`);
	if (!Array.isArray(array$2)) throw new Error(`Param 'array' is not an array`);
	index = index % array$2.length;
	return array$2.at(index);
};

//#endregion
//#region packages/arrays/src/chunks.ts
function chunks(array$2, size) {
	const output = [];
	for (let index = 0; index < array$2.length; index += size) output.push(array$2.slice(index, index + size));
	return output;
}

//#endregion
//#region packages/arrays/src/util/to-string.ts
const toStringDefault$1 = (itemToMakeStringFor) => typeof itemToMakeStringFor === `string` ? itemToMakeStringFor : JSON.stringify(itemToMakeStringFor);

//#endregion
//#region packages/arrays/src/util/is-equal.ts
const isEqualDefault$1 = (a$1, b$2) => a$1 === b$2;
const isEqualValueDefault$1 = (a$1, b$2) => {
	if (a$1 === b$2) return true;
	return toStringDefault$1(a$1) === toStringDefault$1(b$2);
};

//#endregion
//#region packages/arrays/src/contains.ts
const contains = (haystack, needles, eq = isEqualDefault$1) => {
	if (!Array.isArray(haystack)) throw new TypeError(`Expects haystack parameter to be an array`);
	if (!Array.isArray(needles)) throw new TypeError(`Expects needles parameter to be an array`);
	for (const needle of needles) {
		let found = false;
		for (const element of haystack) if (eq(needle, element)) {
			found = true;
			break;
		}
		if (!found) return false;
	}
	return true;
};
const containsDuplicateValues = (data, keyFunction = toStringDefault$1) => {
	if (typeof data !== `object`) throw new Error(`Param 'data' is expected to be an Iterable. Got type: ${typeof data}`);
	const set$4 = new Set();
	for (const v of data) {
		const string_ = keyFunction(v);
		if (set$4.has(string_)) return true;
		set$4.add(string_);
	}
	return false;
};
const containsDuplicateInstances = (array$2) => {
	if (!Array.isArray(array$2)) throw new Error(`Parameter needs to be an array`);
	for (let index = 0; index < array$2.length; index++) for (let x = 0; x < array$2.length; x++) {
		if (index === x) continue;
		if (array$2[index] === array$2[x]) return true;
	}
	return false;
};

//#endregion
//#region packages/arrays/src/ensure-length.ts
const ensureLength = (data, length$4, expand = `undefined`) => {
	if (data === void 0) throw new Error(`Data undefined`);
	if (!Array.isArray(data)) throw new Error(`data is not an array`);
	if (data.length === length$4) return [...data];
	if (data.length > length$4) return data.slice(0, length$4);
	const d$1 = [...data];
	const add$1 = length$4 - d$1.length;
	for (let index = 0; index < add$1; index++) switch (expand) {
		case `undefined`: {
			d$1.push(void 0);
			break;
		}
		case `repeat`: {
			d$1.push(data[index % data.length]);
			break;
		}
		case `first`: {
			d$1.push(data[0]);
			break;
		}
		case `last`: {
			d$1.push(data.at(-1));
			break;
		}
	}
	return d$1;
};

//#endregion
//#region packages/arrays/src/equality.ts
const isEqual$7 = (arrayA, arrayB, equality = isEqualDefault$1) => {
	guardArray(arrayA, `arrayA`);
	guardArray(arrayB, `arrayB`);
	if (arrayA.length !== arrayB.length) return false;
	for (let indexA = 0; indexA < arrayA.length; indexA++) if (!equality(arrayA[indexA], arrayB[indexA])) return false;
	return true;
};
const isContentsTheSame = (array$2, equality) => {
	if (!Array.isArray(array$2)) throw new Error(`Param 'array' is not an array.`);
	if (array$2.length === 0) return true;
	const eq = equality ?? isEqualValueDefault$1;
	const a$1 = array$2[0];
	const r = array$2.some((v) => !eq(a$1, v));
	if (r) return false;
	return true;
};

//#endregion
//#region packages/arrays/src/filter.ts
const withoutUndefined = (data) => {
	return data.filter((v) => v !== void 0);
};
const filterAB = (data, filter$1) => {
	const a$1 = [];
	const b$2 = [];
	for (const datum of data) if (filter$1(datum)) a$1.push(datum);
	else b$2.push(datum);
	return [a$1, b$2];
};
function* filterBetween(array$2, predicate, startIndex, endIndex) {
	guardArray(array$2);
	if (typeof startIndex === `undefined`) startIndex = 0;
	if (typeof endIndex === `undefined`) endIndex = array$2.length;
	guardIndex(array$2, startIndex, `startIndex`);
	guardIndex(array$2, endIndex - 1, `endIndex`);
	for (let index = startIndex; index < endIndex; index++) if (predicate(array$2[index], index, array$2)) yield array$2[index];
}
const without = (sourceArray, toRemove, comparer = isEqualDefault$1) => {
	if (Array.isArray(toRemove)) {
		const returnArray = [];
		for (const source of sourceArray) if (!toRemove.some((v) => comparer(source, v))) returnArray.push(source);
		return returnArray;
	} else return sourceArray.filter((v) => !comparer(v, toRemove));
};

//#endregion
//#region packages/arrays/src/flatten.ts
const flatten = (array$2) => [...array$2].flat();

//#endregion
//#region packages/arrays/src/frequency.ts
const frequencyByGroup = (groupBy$1, data) => {
	if (!Array.isArray(data)) throw new TypeError(`Param 'array' is expected to be an array. Got type: '${typeof data}'`);
	const store = new Map();
	for (const value of data) {
		const group = groupBy$1(value);
		if (typeof group !== `string` && typeof group !== `number`) throw new TypeError(`groupBy function is expected to return type string or number. Got type: '${typeof group}' for value: '${value}'`);
		let groupValue = store.get(group);
		groupValue ??= 0;
		groupValue++;
		store.set(group, groupValue);
	}
	return store;
};

//#endregion
//#region packages/arrays/src/group-by.ts
const groupBy = (array$2, grouper) => {
	const map = new Map();
	for (const a$1 of array$2) {
		const key = grouper(a$1);
		let existing = map.get(key);
		if (!existing) {
			existing = [];
			map.set(key, existing);
		}
		existing.push(a$1);
	}
	return map;
};

//#endregion
//#region packages/arrays/src/unique.ts
const uniqueDeep = (arrays, comparer = isEqualDefault$1) => {
	const t$1 = [];
	const contains$1 = (v) => {
		for (const tValue of t$1) if (comparer(tValue, v)) return true;
		return false;
	};
	const flattened = arrays.flat(10);
	for (const v of flattened) if (!contains$1(v)) t$1.push(v);
	return t$1;
};
const unique$1 = (arrays, toString$7 = toStringDefault$1) => {
	const matching = new Set();
	const t$1 = [];
	const flattened = arrays.flat(10);
	for (const a$1 of flattened) {
		const stringRepresentation = toString$7(a$1);
		if (matching.has(stringRepresentation)) continue;
		matching.add(stringRepresentation);
		t$1.push(a$1);
	}
	return t$1;
};

//#endregion
//#region packages/arrays/src/insert-at.ts
const insertAt = (data, index, ...values$1) => {
	if (!Array.isArray(data)) throw new TypeError(`Param 'data' is not an arry`);
	return [
		...data.slice(0, index),
		...values$1,
		...data.slice(index + 1)
	];
};

//#endregion
//#region packages/arrays/src/interleave.ts
const interleave = (...arrays) => {
	if (arrays.some((a$1) => !Array.isArray(a$1))) throw new Error(`All parameters must be an array`);
	const lengths$2 = arrays.map((a$1) => a$1.length);
	if (!isContentsTheSame(lengths$2)) throw new Error(`Arrays must be of same length`);
	const returnValue = [];
	const length$4 = lengths$2[0];
	for (let index = 0; index < length$4; index++) for (const array$2 of arrays) returnValue.push(array$2[index]);
	return returnValue;
};

//#endregion
//#region packages/arrays/src/intersection.ts
const intersection = (arrayA, arrayB, equality = isEqualDefault$1) => arrayA.filter((valueFromA) => arrayB.some((valueFromB) => equality(valueFromA, valueFromB)));

//#endregion
//#region packages/arrays/src/merge-by-key.ts
const mergeByKey = (keyFunction, reconcile, ...arrays) => {
	const result = new Map();
	for (const m$1 of arrays) for (const mv of m$1) {
		if (mv === void 0) continue;
		const mk = keyFunction(mv);
		let v = result.get(mk);
		v = v ? reconcile(v, mv) : mv;
		result.set(mk, v);
	}
	return [...result.values()];
};

//#endregion
//#region packages/arrays/src/pairwise.ts
function* pairwise(values$1) {
	guardArray(values$1, `values`);
	if (values$1.length < 2) throw new Error(`Array needs to have at least two entries. Length: ${values$1.length}`);
	for (let index = 1; index < values$1.length; index++) yield [values$1[index - 1], values$1[index]];
}
const pairwiseReduce = (array$2, reducer, initial) => {
	guardArray(array$2, `arr`);
	if (array$2.length < 2) return initial;
	for (let index = 0; index < array$2.length - 1; index++) initial = reducer(initial, array$2[index], array$2[index + 1]);
	return initial;
};

//#endregion
//#region packages/arrays/src/random.ts
const shuffle = (dataToShuffle, rand = Math.random) => {
	guardArray(dataToShuffle, `dataToShuffle`);
	const array$2 = [...dataToShuffle];
	for (let index = array$2.length - 1; index > 0; index--) {
		const index_ = Math.floor(rand() * (index + 1));
		[array$2[index], array$2[index_]] = [array$2[index_], array$2[index]];
	}
	return array$2;
};
const randomElement$1 = (array$2, rand = Math.random) => {
	guardArray(array$2, `array`);
	return array$2[Math.floor(rand() * array$2.length)];
};

//#endregion
//#region packages/arrays/src/remove.ts
const remove = (data, index) => {
	if (!Array.isArray(data)) throw new TypeError(`'data' parameter should be an array`);
	guardIndex(data, index, `index`);
	return [...data.slice(0, index), ...data.slice(index + 1)];
};

//#endregion
//#region packages/arrays/src/sample.ts
const sample = (array$2, amount) => {
	if (!Array.isArray(array$2)) throw new TypeError(`Param 'array' is not actually an array. Got type: ${typeof array$2}`);
	let subsampleSteps = 1;
	if (amount <= 1) {
		const numberOfItems = array$2.length * amount;
		subsampleSteps = Math.round(array$2.length / numberOfItems);
	} else subsampleSteps = amount;
	throwIntegerTest(subsampleSteps, `positive`, `amount`);
	if (subsampleSteps > array$2.length - 1) throw new Error(`Subsample steps exceeds array length`);
	const r = [];
	for (let index = subsampleSteps - 1; index < array$2.length; index += subsampleSteps) r.push(array$2[index]);
	return r;
};

//#endregion
//#region packages/arrays/src/sort.ts
const sortByNumericProperty = (data, propertyName) => [...data].sort((a$1, b$2) => {
	guardArray(data, `data`);
	const av = a$1[propertyName];
	const bv = b$2[propertyName];
	if (av < bv) return -1;
	if (av > bv) return 1;
	return 0;
});
const sortByProperty = (data, propertyName) => [...data].sort((a$1, b$2) => {
	guardArray(data, `data`);
	const av = a$1[propertyName];
	const bv = b$2[propertyName];
	if (av < bv) return -1;
	if (av > bv) return 1;
	return 0;
});

//#endregion
//#region packages/arrays/src/until.ts
function* until(data, predicate, initial) {
	let total$1 = initial;
	for (const datum of data) {
		const [stop, accumulator] = predicate(datum, total$1);
		if (stop) break;
		total$1 = accumulator;
		yield datum;
	}
}

//#endregion
//#region packages/arrays/src/zip.ts
const zip$1 = (...arrays) => {
	if (arrays.some((a$1) => !Array.isArray(a$1))) throw new Error(`All parameters must be an array`);
	const lengths$2 = arrays.map((a$1) => a$1.length);
	if (!isContentsTheSame(lengths$2)) throw new Error(`Arrays must be of same length`);
	const returnValue = [];
	const length$4 = lengths$2[0];
	for (let index = 0; index < length$4; index++) returnValue.push(arrays.map((a$1) => a$1[index]));
	return returnValue;
};

//#endregion
//#region packages/arrays/src/index.ts
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
	isEqual: () => isEqual$7,
	mergeByKey: () => mergeByKey,
	pairwise: () => pairwise,
	pairwiseReduce: () => pairwiseReduce,
	randomElement: () => randomElement$1,
	remove: () => remove,
	sample: () => sample,
	shuffle: () => shuffle,
	sortByNumericProperty: () => sortByNumericProperty,
	sortByProperty: () => sortByProperty,
	unique: () => unique$1,
	uniqueDeep: () => uniqueDeep,
	until: () => until,
	without: () => without,
	withoutUndefined: () => withoutUndefined,
	zip: () => zip$1
});

//#endregion
//#region packages/core/src/to-string.ts
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const isMap = (value) => toTypeString(value) === `[object Map]`;
const isSet = (value) => toTypeString(value) === `[object Set]`;
const toStringDefault = (itemToMakeStringFor) => typeof itemToMakeStringFor === `string` ? itemToMakeStringFor : JSON.stringify(itemToMakeStringFor);
const defaultToString = (object$1) => {
	if (object$1 === null) return `null`;
	if (typeof object$1 === `boolean` || typeof object$1 === `number`) return object$1.toString();
	if (typeof object$1 === `string`) return object$1;
	if (typeof object$1 === `symbol`) throw new TypeError(`Symbol cannot be converted to string`);
	return JSON.stringify(object$1);
};

//#endregion
//#region packages/core/src/comparers.ts
const numericComparer = (x, y) => {
	if (x === y) return 0;
	if (x > y) return 1;
	return -1;
};
const jsComparer = (x, y) => {
	if (x === void 0 && y === void 0) return 0;
	if (x === void 0) return 1;
	if (y === void 0) return -1;
	const xString = defaultToString(x);
	const yString = defaultToString(y);
	if (xString < yString) return -1;
	if (xString > yString) return 1;
	return 0;
};
const comparerInverse = (comparer) => {
	return (x, y) => {
		const v = comparer(x, y);
		return v * -1;
	};
};
const defaultComparer = (x, y) => {
	if (typeof x === `number` && typeof y === `number`) return numericComparer(x, y);
	return jsComparer(x, y);
};

//#endregion
//#region packages/core/src/count.ts
function* count(amount, offset$1 = 0) {
	throwIntegerTest(amount, ``, `amount`);
	throwIntegerTest(offset$1, ``, `offset`);
	if (amount === 0) return;
	let index = 0;
	do
		yield amount < 0 ? -index + offset$1 : index + offset$1;
	while (index++ < Math.abs(amount) - 1);
}

//#endregion
//#region packages/core/src/continuously.ts
const continuously = (callback, interval, options = {}) => {
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
		if (intervalMs === 0) if (typeof requestAnimationFrame === `undefined`) currentTimer = globalThis.setTimeout(scheduledCallback, 0);
		else {
			currentTimer = void 0;
			requestAnimationFrame(scheduledCallback);
		}
		else currentTimer = globalThis.setTimeout(scheduledCallback, intervalMs);
	};
	const cancel = () => {
		if (cancelled) return;
		cancelled = true;
		if (runState === `idle`) return;
		runState = `idle`;
		deschedule();
	};
	const loop = async () => {
		if (signal?.aborted) runState = `idle`;
		if (runState === `idle`) return;
		runState = `running`;
		startCount++;
		startCountTotal++;
		const valueOrPromise = callback(startCount, performance.now() - startedAt);
		const value = typeof valueOrPromise === `object` ? await valueOrPromise : valueOrPromise;
		if (cancelled) return;
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
			if (fireBeforeWait) loop();
			else schedule(loop);
		}
	};
	const reset = () => {
		if (disposed) throw new Error(`Disposed`);
		cancelled = false;
		startCount = 0;
		startedAt = Number.NaN;
		if (runState !== `idle`) cancel();
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
		set interval(interval$1) {
			const ms = intervalToMs(interval$1, 0);
			throwIntegerTest(ms, `positive`, `interval`);
			intervalMs = ms;
			intervalUsed = interval$1;
		},
		get isDisposed() {
			return disposed;
		},
		get elapsedMs() {
			return performance.now() - startedAt;
		}
	};
};

//#endregion
//#region packages/core/src/correlate.ts
const orderScore = (a$1, b$2) => {
	if (a$1.score > b$2.score) return -1;
	else if (a$1.score < b$2.score) return 1;
	return 0;
};
const align = (similarityFunction, lastData, newData, options = {}) => {
	const matchThreshold = options.matchThreshold ?? 0;
	const debug = options.debug ?? false;
	const results = new Map();
	const newThings = [];
	const lastMap = new Map();
	lastData?.forEach((d$1, index) => {
		if (typeof d$1 === `undefined`) throw new Error(`'lastData' contains undefined (index: ${index.toString()})`);
		lastMap.set(d$1.id, d$1);
	});
	for (const newD of newData) {
		if (!lastData || lastData.length === 0) {
			if (debug) console.debug(`Correlate.align() new id: ${newD.id}`);
			newThings.push(newD);
			continue;
		}
		const scoredLastValues = Array.from(lastMap.values()).map((last$1) => ({
			id: last$1.id,
			score: last$1 === null ? -1 : similarityFunction(last$1, newD),
			last: last$1
		}));
		if (scoredLastValues.length === 0) {
			if (debug) console.debug(`Correlate.align() no valid last values id: ${newD.id}`);
			newThings.push(newD);
			continue;
		}
		scoredLastValues.sort(orderScore);
		const top = scoredLastValues[0];
		if (top.score < matchThreshold) {
			if (debug) console.debug(`Correlate.align() new item does not reach threshold. Top score: ${top.score.toString()} id: ${newD.id}`);
			newThings.push(newD);
			continue;
		}
		if (debug && top.id !== newD.id) console.log(`Correlate.align() Remapped ${newD.id} -> ${top.id} (score: ${top.score.toString()})`);
		results.set(top.id, {
			...newD,
			id: top.id
		});
		lastMap.delete(top.id);
	}
	newThings.forEach((t$1) => results.set(t$1.id, t$1));
	return Array.from(results.values());
};
const alignById = (fn, options = {}) => {
	let lastData = [];
	const compute = (newData) => {
		lastData = align(fn, lastData, newData, options);
		return [...lastData];
	};
	return compute;
};

//#endregion
//#region packages/core/src/default-keyer.ts
const defaultKeyer = (a$1) => {
	return typeof a$1 === `string` ? a$1 : JSON.stringify(a$1);
};

//#endregion
//#region packages/core/src/elapsed.ts
const elapsedSince = () => {
	const start = performance.now();
	return () => {
		return performance.now() - start;
	};
};
const elapsedInterval = () => {
	let start = performance.now();
	return () => {
		const now = performance.now();
		const x = now - start;
		start = now;
		return x;
	};
};
const elapsedOnce = () => {
	const start = Date.now();
	let stoppedAt = 0;
	return () => {
		if (stoppedAt === 0) stoppedAt = Date.now() - start;
		return stoppedAt;
	};
};
const elapsedInfinity = () => {
	return () => {
		return Number.POSITIVE_INFINITY;
	};
};

//#endregion
//#region packages/core/src/filters.ts
const filterValue = (v, predicate, skipValue) => {
	if (predicate(v)) return v;
	return skipValue;
};

//#endregion
//#region packages/core/src/text.ts
const abbreviate = (source, maxLength = 15) => {
	throwFromResult(integerTest(maxLength, `aboveZero`, `maxLength`));
	if (typeof source !== `string`) throw new Error(`Parameter 'source' is not a string`);
	if (source.length > maxLength && source.length > 3) {
		if (maxLength > 15) {
			const chunk$1 = Math.round((maxLength - 2) / 2);
			return source.slice(0, chunk$1) + `...` + source.slice(-chunk$1);
		}
		return source.slice(0, maxLength) + `...`;
	}
	return source;
};
const toStringAbbreviate = (source, maxLength = 20) => {
	if (source === void 0) return `(undefined)`;
	if (source === null) return `(null)`;
	return abbreviate(JSON.stringify(source), maxLength);
};
const wildcard = (pattern) => {
	const escapeRegex = (value) => value.replaceAll(/([!$()*+./:=?[\\\]^{|}])/g, `\\$1`);
	pattern = pattern.split(`*`).map((m$1) => escapeRegex(m$1)).join(`.*`);
	pattern = `^` + pattern + `$`;
	const regex = new RegExp(pattern);
	return (value) => {
		return regex.test(value);
	};
};

//#endregion
//#region packages/core/src/is-equal-test.ts
const isEqualTrace = (eq) => {
	return (a$1, b$2) => {
		const result = eq(a$1, b$2);
		console.log(`isEqualTrace eq: ${result} a: ${toStringAbbreviate(a$1)} b: ${toStringAbbreviate(b$2)}`);
		return result;
	};
};

//#endregion
//#region packages/core/src/is-equal.ts
const toStringOrdered = (itemToMakeStringFor) => {
	if (typeof itemToMakeStringFor === `string`) return itemToMakeStringFor;
	const allKeys = new Set();
	JSON.stringify(itemToMakeStringFor, (key, value) => (allKeys.add(key), value));
	return JSON.stringify(itemToMakeStringFor, [...allKeys].sort());
};
const isEqualDefault = (a$1, b$2) => a$1 === b$2;
const isEqualValueDefault = (a$1, b$2) => {
	if (a$1 === b$2) return true;
	return toStringDefault(a$1) === toStringDefault(b$2);
};
const isEqualValuePartial = (a$1, b$2, fieldComparer) => {
	if (typeof a$1 !== `object`) throw new Error(`Param 'a' expected to be object`);
	if (typeof b$2 !== `object`) throw new Error(`Param 'b' expected to be object`);
	if (Object.is(a$1, b$2)) return true;
	const comparer = fieldComparer ?? isEqualValuePartial;
	for (const entryB of Object.entries(b$2)) {
		const valueOnAKeyFromB = a$1[entryB[0]];
		const valueB = entryB[1];
		if (typeof valueOnAKeyFromB === `object` && typeof valueB === `object`) {
			if (!comparer(valueOnAKeyFromB, valueB)) return false;
		} else if (valueOnAKeyFromB !== valueB) return false;
	}
	return true;
};
const isEqualValueIgnoreOrder = (a$1, b$2) => {
	if (a$1 === b$2) return true;
	return toStringOrdered(a$1) === toStringOrdered(b$2);
};
const isEmptyEntries = (value) => [...Object.entries(value)].length === 0;
const isEqualContextString = (a$1, b$2, _path) => {
	return JSON.stringify(a$1) === JSON.stringify(b$2);
};

//#endregion
//#region packages/core/src/is-integer.ts
const isInteger = (value) => {
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

//#endregion
//#region packages/core/src/is-primitive.ts
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

//#endregion
//#region packages/core/src/iterable-compare-values-shallow.ts
const compareIterableValuesShallow = (a$1, b$2, eq = isEqualDefault) => {
	const shared = [];
	const aUnique = [];
	const bUnique = [];
	for (const elementOfA of a$1) {
		let seenInB = false;
		for (const elementOfB of b$2) if (eq(elementOfA, elementOfB)) {
			seenInB = true;
			break;
		}
		if (seenInB) shared.push(elementOfA);
		else aUnique.push(elementOfA);
	}
	for (const elementOfB of b$2) {
		let seenInA = false;
		for (const elementOfA of a$1) if (eq(elementOfB, elementOfA)) seenInA = true;
		if (!seenInA) bUnique.push(elementOfB);
	}
	const isSame = aUnique.length === 0 && bUnique.length === 0;
	return {
		shared,
		isSame,
		a: aUnique,
		b: bUnique
	};
};

//#endregion
//#region packages/core/src/key-value.ts
const sorterByValueIndex = (index, reverse$1 = false) => {
	return (values$1) => {
		const s = values$1.toSorted((a$1, b$2) => {
			return defaultComparer(a$1[index], b$2[index]);
		});
		if (reverse$1) return s.reverse();
		return s;
	};
};
const keyValueSorter = (sortStyle) => {
	switch (sortStyle) {
		case `value`: return sorterByValueIndex(1, false);
		case `value-reverse`: return sorterByValueIndex(1, true);
		case `key`: return sorterByValueIndex(0, false);
		case `key-reverse`: return sorterByValueIndex(0, true);
		default: throw new Error(`Unknown sorting value '${sortStyle}'. Expecting: value, value-reverse, key or key-reverse`);
	}
};

//#endregion
//#region packages/core/src/util/round.ts
function round$2(a$1, b$2, roundUp) {
	throwIntegerTest(a$1, `positive`, `decimalPlaces`);
	let up = typeof b$2 === `boolean` ? b$2 : roundUp ?? false;
	let rounder;
	if (a$1 === 0) rounder = Math.round;
	else {
		const p$1 = Math.pow(10, a$1);
		if (up) rounder = (v) => Math.ceil(v * p$1) / p$1;
		else rounder = (v) => Math.floor(v * p$1) / p$1;
	}
	if (typeof b$2 === `number`) return rounder(b$2);
	return rounder;
}

//#endregion
//#region packages/core/src/interval-type.ts
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
const elapsedToHumanString = (millisOrFunction, rounding = 2) => {
	let interval = {} = 0;
	if (typeof millisOrFunction === `function`) {
		const intervalResult = millisOrFunction();
		return elapsedToHumanString(intervalResult);
	} else if (typeof millisOrFunction === `number`) interval = millisOrFunction;
	else if (typeof millisOrFunction === `object`) interval = intervalToMs(interval);
	let ms = intervalToMs(interval);
	if (typeof ms === `undefined`) return `(undefined)`;
	if (ms < 1e3) return `${round$2(rounding, ms)}ms`;
	ms /= 1e3;
	if (ms < 120) return `${ms.toFixed(1)}secs`;
	ms /= 60;
	if (ms < 60) return `${ms.toFixed(2)}mins`;
	ms /= 60;
	return `${ms.toFixed(2)}hrs`;
};

//#endregion
//#region packages/core/src/track-unique.ts
const unique = (toString$7 = toStringDefault) => {
	const set$4 = new Set();
	return (value) => {
		if (value === null) throw new TypeError(`Param 'value' cannot be null`);
		if (value === void 0) throw new TypeError(`Param 'value' cannot be undefined`);
		const asString = typeof value === `string` ? value : toString$7(value);
		if (set$4.has(asString)) return false;
		set$4.add(asString);
		return true;
	};
};
const uniqueInstances = () => {
	const set$4 = new Set();
	return (value) => {
		if (value === null) throw new TypeError(`Param 'value' cannot be null`);
		if (value === void 0) throw new TypeError(`Param 'value' cannot be undefined`);
		if (set$4.has(value)) return false;
		set$4.add(value);
		return true;
	};
};

//#endregion
//#region packages/core/src/platform.ts
const runningiOS = () => [
	`iPad Simulator`,
	`iPhone Simulator`,
	`iPod Simulator`,
	`iPad`,
	`iPhone`,
	`iPod`
].includes(navigator.platform) || navigator.userAgent.includes(`Mac`) && `ontouchend` in document;

//#endregion
//#region packages/core/src/promise-from-event.ts
const promiseFromEvent = (target, name) => {
	return new Promise((resolve$1) => {
		const handler = (...args) => {
			target.removeEventListener(name, handler);
			if (Array.isArray(args) && args.length === 1) resolve$1(args[0]);
			else resolve$1(args);
		};
		target.addEventListener(name, handler);
	});
};

//#endregion
//#region packages/core/src/reactive-core.ts
const isReactive = (rx) => {
	if (typeof rx !== `object`) return false;
	if (rx === null) return false;
	return `on` in rx && `onValue` in rx;
};
const hasLast = (rx) => {
	if (!isReactive(rx)) return false;
	if (`last` in rx) {
		const v = rx.last();
		if (v !== void 0) return true;
	}
	return false;
};

//#endregion
//#region packages/debug/src/util.ts
const getOrGenerateSync = (map, fn) => (key, args) => {
	let value = map.get(key);
	if (value !== void 0) return value;
	value = fn(key, args);
	map.set(key, value);
	return value;
};

//#endregion
//#region packages/debug/src/logger.ts
const logger = (prefix, kind = `log`, colourKey) => (m$1) => {
	if (m$1 === void 0) m$1 = `(undefined)`;
	else if (typeof m$1 === `object`) m$1 = JSON.stringify(m$1);
	const colour = colourKey ?? prefix;
	switch (kind) {
		case `log`: {
			console.log(`%c${prefix} ${m$1}`, `color: ${logColours(colour)}`);
			break;
		}
		case `warn`: {
			console.warn(prefix, m$1);
			break;
		}
		case `error`: {
			console.error(prefix, m$1);
			break;
		}
	}
};
const logSet = (prefix, verbose = true, colourKey) => {
	if (verbose) return {
		log: logger(prefix, `log`, colourKey),
		warn: logger(prefix, `warn`, colourKey),
		error: logger(prefix, `error`, colourKey)
	};
	return {
		log: (_) => {
			/** no-op */
		},
		warn: logger(prefix, `warn`, colourKey),
		error: logger(prefix, `error`, colourKey)
	};
};
const resolveLogOption = (l, defaults$1 = {}) => {
	if (l === void 0 || typeof l === `boolean` && !l) return (_) => {
		/** no-op */
	};
	const defaultCat = defaults$1.category ?? ``;
	const defaultKind = defaults$1.kind ?? void 0;
	if (typeof l === `boolean`) return (messageOrString) => {
		const m$1 = typeof messageOrString === `string` ? { msg: messageOrString } : messageOrString;
		const kind = m$1.kind ?? defaultKind;
		const category = m$1.category ?? defaultCat;
		let message = m$1.msg;
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
			default: console.log(message);
		}
	};
	return l;
};
let logColourCount = 0;
const logColours = getOrGenerateSync(new Map(), () => {
	const hue = ++logColourCount * 137.508;
	return `hsl(${hue},50%,75%)`;
});

//#endregion
//#region packages/debug/src/fps-counter.ts
const fpsCounter = (autoDisplay = true, computeAfterFrames = 500) => {
	let count$2 = 0;
	let lastFps = 0;
	let countStart = performance.now();
	return () => {
		if (count$2++ >= computeAfterFrames) {
			const elapsed$2 = performance.now() - countStart;
			countStart = performance.now();
			count$2 = 0;
			lastFps = Math.floor(computeAfterFrames / elapsed$2 * 1e3);
			if (autoDisplay) console.log(`fps: ${lastFps}`);
		}
		return lastFps;
	};
};

//#endregion
//#region packages/debug/src/index.ts
var src_exports$1 = {};
__export(src_exports$1, {
	fpsCounter: () => fpsCounter,
	getErrorMessage: () => getErrorMessage,
	logColours: () => logColours,
	logSet: () => logSet,
	logger: () => logger,
	resolveLogOption: () => resolveLogOption
});
const getErrorMessage = (ex) => {
	if (typeof ex === `string`) return ex;
	if (ex instanceof Error) return ex.message;
	return ex;
};

//#endregion
//#region packages/core/src/resolve-core.ts
async function resolve(r, ...args) {
	if (typeof r === `object`) if (`next` in r) {
		const tag = r[Symbol.toStringTag];
		if (tag === `Generator` || tag == `Array Iterator`) {
			const v = r.next();
			if (`done` in v && `value` in v) return v.value;
			return v;
		} else if (tag === `AsyncGenerator`) {
			const v = await r.next();
			if (`done` in v && `value` in v) return v.value;
			return v;
		} else throw new Error(`Object has 'next' prop, but does not have 'AsyncGenerator', 'Generator' or 'Array Iterator' string tag symbol. Got: '${tag}'`);
	} else if (isReactive(r)) {
		if (hasLast(r)) return r.last();
		throw new Error(`Reactive does not have last value`);
	} else return r;
	else if (typeof r === `function`) {
		const v = await r(args);
		return v;
	} else return r;
}
function resolveSync(r, ...args) {
	if (typeof r === `object`) if (`next` in r) {
		const tag = r[Symbol.toStringTag];
		if (tag === `Generator` || tag == `Array Iterator`) {
			const v = r.next();
			if (`done` in v && `value` in v) return v.value;
			return v;
		} else if (tag === `AsyncGenerator`) throw new Error(`resolveSync cannot work with an async generator`);
		else throw new Error(`Object has 'next' prop, but does not have 'Generator' or 'Array Iterator' string tag symbol. Got: '${tag}'`);
	} else if (isReactive(r)) {
		if (hasLast(r)) return r.last();
		throw new Error(`Reactive does not have last value`);
	} else return r;
	else if (typeof r === `function`) return r(args);
	else return r;
}
async function resolveWithFallback(p$1, fallback, ...args) {
	let errored = false;
	let fallbackValue = fallback.value;
	const overrideWithLast = fallback.overrideWithLast ?? false;
	if (fallbackValue === void 0) throw new Error(`Needs a fallback value`);
	try {
		const r = await resolve(p$1, ...args);
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
function resolveWithFallbackSync(p$1, fallback, ...args) {
	let errored = false;
	let fallbackValue = fallback.value;
	const overrideWithLast = fallback.overrideWithLast ?? false;
	if (fallbackValue === void 0) throw new Error(`Needs a fallback value`);
	try {
		const r = resolveSync(p$1, ...args);
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

//#endregion
//#region packages/core/src/util/zip.ts
const zip = (...arrays) => {
	if (arrays.some((a$1) => !Array.isArray(a$1))) throw new Error(`All parameters must be an array`);
	const lengths$2 = arrays.map((a$1) => a$1.length);
	const returnValue = [];
	const length$4 = lengths$2[0];
	for (let index = 0; index < length$4; index++) returnValue.push(arrays.map((a$1) => a$1[index]));
	return returnValue;
};

//#endregion
//#region packages/core/src/resolve-fields.ts
async function resolveFields(object$1) {
	const resolvers = [];
	const keys = [];
	for (const entry of Object.entries(object$1)) {
		const resolvable = entry[1];
		resolvers.push(resolve(resolvable));
		keys.push(entry[0]);
	}
	const results = await Promise.all(resolvers);
	const entries = zip(keys, results);
	return Object.fromEntries(entries);
}
function resolveFieldsSync(object$1) {
	const entries = [];
	for (const entry of Object.entries(object$1)) {
		const resolvable = entry[1];
		const value = resolveSync(resolvable);
		entries.push([entry[0], value]);
	}
	return Object.fromEntries(entries);
}
/**
* Returns a function that resolves `object`.
*
* Use {@link resolveFields} to resolve an object directly.
* @param object
* @returns
*/

//#endregion
//#region packages/core/src/results.ts
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

//#endregion
//#region packages/core/src/sleep.ts
if (typeof window === `undefined` || !(`requestAnimationFrame` in window)) {
	if (typeof window === `undefined`) globalThis.requestAnimationFrame = (callback) => {
		setTimeout(callback, 1);
	};
}
const sleep = (optsOrMillis) => {
	const timeoutMs = intervalToMs(optsOrMillis, 1);
	const signal = optsOrMillis.signal;
	const value = optsOrMillis.value;
	throwNumberTest(timeoutMs, `positive`, `timeoutMs`);
	if (timeoutMs === 0) return new Promise((resolve$1) => requestAnimationFrame((_) => {
		resolve$1(value);
	}));
	else return new Promise((resolve$1, reject) => {
		const onAbortSignal = () => {
			clearTimeout(t$1);
			if (signal) {
				signal.removeEventListener(`abort`, onAbortSignal);
				reject(new Error(signal.reason));
			} else reject(new Error(`Cancelled`));
		};
		if (signal) signal.addEventListener(`abort`, onAbortSignal);
		const t$1 = setTimeout(() => {
			signal?.removeEventListener(`abort`, onAbortSignal);
			if (signal?.aborted) {
				reject(new Error(signal.reason));
				return;
			}
			resolve$1(value);
		}, timeoutMs);
	});
};
const sleepWhile = async (predicate, checkInterval = 100) => {
	while (predicate()) await sleep(checkInterval);
};

//#endregion
//#region packages/dom/src/resolve-el.ts
const resolveEl = (domQueryOrEl) => {
	const r = resolveElementTry(domQueryOrEl);
	if (r.success) return r.value;
	throw resultToError(r);
};
const resolveElementTry = (domQueryOrEl) => {
	if (typeof domQueryOrEl === `string`) {
		const d$1 = document.querySelector(domQueryOrEl);
		if (d$1 === null) {
			const error = domQueryOrEl.startsWith(`#`) ? `Query '${domQueryOrEl}' did not match anything. Try '#id', 'div', or '.class'` : `Query '${domQueryOrEl}' did not match anything. Did you mean '#${domQueryOrEl}?`;
			return {
				success: false,
				error
			};
		}
		domQueryOrEl = d$1;
	} else if (domQueryOrEl === null) return {
		success: false,
		error: `Param 'domQueryOrEl' is null`
	};
	else if (domQueryOrEl === void 0) return {
		success: false,
		error: `Param 'domQueryOrEl' is undefined`
	};
	const el = domQueryOrEl;
	return {
		success: true,
		value: el
	};
};
const resolveEls = (selectors) => {
	if (selectors === void 0) return [];
	if (selectors === null) return [];
	if (Array.isArray(selectors)) return selectors;
	if (typeof selectors === `string`) {
		const elements = [...document.querySelectorAll(selectors)];
		return elements;
	}
	return [selectors];
};

//#endregion
//#region packages/dom/src/css.ts
const getBoundingClientRectWithBorder = (elOrQuery) => {
	let el = resolveEl(elOrQuery);
	const size = el.getBoundingClientRect();
	if (el instanceof SVGElement) el = el.parentElement;
	const border = getComputedPixels(el, `borderTopWidth`, `borderLeftWidth`, `borderRightWidth`, `borderBottomWidth`);
	return {
		x: size.x,
		y: size.y,
		width: size.width + border.borderLeftWidth + border.borderRightWidth,
		height: size.height + border.borderTopWidth + border.borderBottomWidth
	};
};
const getComputedPixels = (elOrQuery, ...properties) => {
	const s = getComputedStyle(resolveEl(elOrQuery));
	const returnValue = {};
	for (const property of properties) {
		const v = s[property];
		if (typeof v === `string`) if (v.endsWith(`px`)) returnValue[property] = Number.parseFloat(v.substring(0, v.length - 2));
		else throw new Error(`Property '${String(property)}' does not end in 'px'. Value: ${v}`);
		else throw new Error(`Property '${String(property)}' is not type string. Got: ${typeof v} Value: ${v}`);
	}
	return returnValue;
};
const setCssClass = (selectors, value, cssClass) => {
	const elements = resolveEls(selectors);
	if (elements.length === 0) return;
	for (const element of elements) if (value) element.classList.add(cssClass);
	else element.classList.remove(cssClass);
};
const setCssToggle = (selectors, cssClass) => {
	const elements = resolveEls(selectors);
	if (elements.length === 0) return;
	for (const element of elements) element.classList.toggle(cssClass);
};
const setCssDisplay = (selectors, value) => {
	const elements = resolveEls(selectors);
	if (elements.length === 0) return;
	for (const element of elements) element.style.display = value;
};

//#endregion
//#region packages/geometry/src/point/guard.ts
const isNull = (p$1) => {
	if (isPoint3d(p$1)) {
		if (p$1.z !== null) return false;
	}
	return p$1.x === null && p$1.y === null;
};
const isNaN$2 = (p$1) => {
	if (isPoint3d(p$1)) {
		if (!Number.isNaN(p$1.z)) return false;
	}
	return Number.isNaN(p$1.x) || Number.isNaN(p$1.y);
};
function guard$7(p$1, name = `Point`) {
	if (p$1 === void 0) throw new Error(`'${name}' is undefined. Expected {x,y} got ${JSON.stringify(p$1)}`);
	if (p$1 === null) throw new Error(`'${name}' is null. Expected {x,y} got ${JSON.stringify(p$1)}`);
	if (p$1.x === void 0) throw new Error(`'${name}.x' is undefined. Expected {x,y} got ${JSON.stringify(p$1)}`);
	if (p$1.y === void 0) throw new Error(`'${name}.y' is undefined. Expected {x,y} got ${JSON.stringify(p$1)}`);
	if (typeof p$1.x !== `number`) throw new TypeError(`'${name}.x' must be a number. Got ${typeof p$1.x}`);
	if (typeof p$1.y !== `number`) throw new TypeError(`'${name}.y' must be a number. Got ${typeof p$1.y}`);
	if (p$1.z !== void 0) {
		if (typeof p$1.z !== `number`) throw new TypeError(`${name}.z must be a number. Got: ${typeof p$1.z}`);
		if (Number.isNaN(p$1.z)) throw new Error(`'${name}.z' is NaN. Got: ${JSON.stringify(p$1)}`);
	}
	if (p$1.x === null) throw new Error(`'${name}.x' is null`);
	if (p$1.y === null) throw new Error(`'${name}.y' is null`);
	if (Number.isNaN(p$1.x)) throw new Error(`'${name}.x' is NaN`);
	if (Number.isNaN(p$1.y)) throw new Error(`'${name}.y' is NaN`);
}
const guardNonZeroPoint = (pt, name = `pt`) => {
	guard$7(pt, name);
	throwNumberTest(pt.x, `nonZero`, `${name}.x`);
	throwNumberTest(pt.y, `nonZero`, `${name}.y`);
	if (typeof pt.z !== `undefined`) throwNumberTest(pt.z, `nonZero`, `${name}.z`);
	return true;
};
function isPoint(p$1) {
	if (p$1 === void 0) return false;
	if (p$1 === null) return false;
	if (p$1.x === void 0) return false;
	if (p$1.y === void 0) return false;
	return true;
}
const isPoint3d = (p$1) => {
	if (p$1 === void 0) return false;
	if (p$1 === null) return false;
	if (p$1.x === void 0) return false;
	if (p$1.y === void 0) return false;
	if (p$1.z === void 0) return false;
	return true;
};
const isEmpty$5 = (p$1) => {
	if (isPoint3d(p$1)) {
		if (p$1.z !== 0) return false;
	}
	return p$1.x === 0 && p$1.y === 0;
};
const isPlaceholder$3 = (p$1) => {
	if (isPoint3d(p$1)) {
		if (!Number.isNaN(p$1.z)) return false;
	}
	return Number.isNaN(p$1.x) && Number.isNaN(p$1.y);
};

//#endregion
//#region packages/geometry/src/line/from-points.ts
const fromPoints$2 = (a$1, b$2) => {
	guard$7(a$1, `a`);
	guard$7(b$2, `b`);
	a$1 = Object.freeze({ ...a$1 });
	b$2 = Object.freeze({ ...b$2 });
	return Object.freeze({
		a: a$1,
		b: b$2
	});
};

//#endregion
//#region packages/geometry/src/line/join-points-to-lines.ts
const joinPointsToLines = (...points) => {
	const lines = [];
	let start = points[0];
	for (let index = 1; index < points.length; index++) {
		lines.push(fromPoints$2(start, points[index]));
		start = points[index];
	}
	return lines;
};

//#endregion
//#region packages/geometry/src/line/guard.ts
const isLine = (p$1) => {
	if (p$1 === void 0) return false;
	if (p$1.a === void 0) return false;
	if (p$1.b === void 0) return false;
	if (!isPoint(p$1.a)) return false;
	if (!isPoint(p$1.b)) return false;
	return true;
};
const isPolyLine = (p$1) => {
	if (!Array.isArray(p$1)) return false;
	const valid = !p$1.some((v) => !isLine(v));
	return valid;
};
const guard$6 = (line$2, name = `line`) => {
	if (line$2 === void 0) throw new Error(`${name} undefined`);
	if (line$2.a === void 0) throw new Error(`${name}.a undefined. Expected {a:Point, b:Point}. Got: ${JSON.stringify(line$2)}`);
	if (line$2.b === void 0) throw new Error(`${name}.b undefined. Expected {a:Point, b:Point} Got: ${JSON.stringify(line$2)}`);
};

//#endregion
//#region packages/geometry/src/line/get-points-parameter.ts
const getPointParameter$1 = (aOrLine, b$2) => {
	let a$1;
	if (isLine(aOrLine)) {
		b$2 = aOrLine.b;
		a$1 = aOrLine.a;
	} else {
		a$1 = aOrLine;
		if (b$2 === void 0) throw new Error(`Since first parameter is not a line, two points are expected. Got a: ${JSON.stringify(a$1)} b: ${JSON.stringify(b$2)}`);
	}
	guard$7(a$1, `a`);
	guard$7(a$1, `b`);
	return [a$1, b$2];
};

//#endregion
//#region packages/geometry/src/line/length.ts
function length$3(aOrLine, pointB) {
	if (isPolyLine(aOrLine)) {
		const sum$6 = aOrLine.reduce((accumulator, v) => length$3(v) + accumulator, 0);
		return sum$6;
	}
	if (aOrLine === void 0) throw new TypeError(`Parameter 'aOrLine' is undefined`);
	const [a$1, b$2] = getPointParameter$1(aOrLine, pointB);
	const x = b$2.x - a$1.x;
	const y = b$2.y - a$1.y;
	if (a$1.z !== void 0 && b$2.z !== void 0) {
		const z = b$2.z - a$1.z;
		return Math.hypot(x, y, z);
	} else return Math.hypot(x, y);
}

//#endregion
//#region packages/geometry/src/line/reverse.ts
function reverse(line$2) {
	guard$6(line$2, `line`);
	return {
		a: line$2.b,
		b: line$2.a
	};
}

//#endregion
//#region packages/geometry/src/line/interpolate.ts
function interpolate$8(amount, aOrLine, pointBOrAllowOverflow, allowOverflow) {
	if (typeof pointBOrAllowOverflow === `boolean`) {
		allowOverflow = pointBOrAllowOverflow;
		pointBOrAllowOverflow = void 0;
	}
	if (!allowOverflow) throwPercentTest(amount, `amount`);
	else throwNumberTest(amount, ``, `amount`);
	const [a$1, b$2] = getPointParameter$1(aOrLine, pointBOrAllowOverflow);
	const d$1 = length$3(a$1, b$2);
	const d2 = d$1 * (1 - amount);
	if (d$1 === 0 && d2 === 0) return Object.freeze({ ...b$2 });
	const x = b$2.x - d2 * (b$2.x - a$1.x) / d$1;
	const y = b$2.y - d2 * (b$2.y - a$1.y) / d$1;
	return Object.freeze({
		...b$2,
		x,
		y
	});
}
function pointAtDistance(line$2, distance$3, fromA$2 = true) {
	if (!fromA$2) line$2 = reverse(line$2);
	const dx = line$2.b.x - line$2.a.x;
	const dy = line$2.b.y - line$2.a.y;
	const theta = Math.atan2(dy, dx);
	const xp = distance$3 * Math.cos(theta);
	const yp = distance$3 * Math.sin(theta);
	return {
		x: xp + line$2.a.x,
		y: yp + line$2.a.y
	};
}

//#endregion
//#region packages/geometry/src/line/angles.ts
const directionVector = (line$2) => ({
	x: line$2.b.x - line$2.a.x,
	y: line$2.b.y - line$2.a.y
});
const directionVectorNormalised = (line$2) => {
	const l = length$3(line$2);
	const v = directionVector(line$2);
	return {
		x: v.x / l,
		y: v.y / l
	};
};
const parallel = (line$2, distance$3) => {
	const dv = directionVector(line$2);
	const dvn = directionVectorNormalised(line$2);
	const a$1 = {
		x: line$2.a.x - dvn.y * distance$3,
		y: line$2.a.y + dvn.x * distance$3
	};
	return {
		a: a$1,
		b: {
			x: a$1.x + dv.x,
			y: a$1.y + dv.y
		}
	};
};
const perpendicularPoint = (line$2, distance$3, amount = 0) => {
	const origin = interpolate$8(amount, line$2);
	const dvn = directionVectorNormalised(line$2);
	return {
		x: origin.x - dvn.y * distance$3,
		y: origin.y + dvn.x * distance$3
	};
};

//#endregion
//#region packages/geometry/src/line/midpoint.ts
const midpoint = (aOrLine, pointB) => {
	const [a$1, b$2] = getPointParameter$1(aOrLine, pointB);
	return interpolate$8(.5, a$1, b$2);
};

//#endregion
//#region packages/geometry/src/rect/guard.ts
const guardDim = (d$1, name = `Dimension`) => {
	if (d$1 === void 0) throw new Error(`${name} is undefined`);
	if (Number.isNaN(d$1)) throw new Error(`${name} is NaN`);
	if (d$1 < 0) throw new Error(`${name} cannot be negative`);
};
const guard$5 = (rect$1, name = `rect`) => {
	if (rect$1 === void 0) throw new Error(`{$name} undefined`);
	if (isPositioned$2(rect$1)) guard$7(rect$1, name);
	guardDim(rect$1.width, name + `.width`);
	guardDim(rect$1.height, name + `.height`);
};
const getRectPositioned = (rect$1, origin) => {
	guard$5(rect$1);
	if (isPositioned$2(rect$1) && origin === void 0) return rect$1;
	if (origin === void 0) throw new Error(`Unpositioned rect needs origin parameter`);
	return Object.freeze({
		...rect$1,
		...origin
	});
};
const guardPositioned$1 = (rect$1, name = `rect`) => {
	if (!isPositioned$2(rect$1)) throw new Error(`Expected ${name} to have x,y`);
	guard$5(rect$1, name);
};
const isEmpty$4 = (rect$1) => rect$1.width === 0 && rect$1.height === 0;
const isPlaceholder$2 = (rect$1) => Number.isNaN(rect$1.width) && Number.isNaN(rect$1.height);
const isPositioned$2 = (rect$1) => rect$1.x !== void 0 && rect$1.y !== void 0;
const isRect = (rect$1) => {
	if (rect$1 === void 0) return false;
	if (rect$1.width === void 0) return false;
	if (rect$1.height === void 0) return false;
	return true;
};
const isRectPositioned = (rect$1) => isRect(rect$1) && isPositioned$2(rect$1);

//#endregion
//#region packages/geometry/src/point/normalise-by-rect.ts
function normaliseByRect$1(a$1, b$2, c$1, d$1) {
	if (isPoint(a$1)) {
		if (typeof b$2 === `number` && c$1 !== void 0) {
			throwNumberTest(b$2, `positive`, `width`);
			throwNumberTest(c$1, `positive`, `height`);
		} else {
			if (!isRect(b$2)) throw new Error(`Expected second parameter to be a rect`);
			c$1 = b$2.height;
			b$2 = b$2.width;
		}
		return Object.freeze({
			x: a$1.x / b$2,
			y: a$1.y / c$1
		});
	} else {
		throwNumberTest(a$1, `positive`, `x`);
		if (typeof b$2 !== `number`) throw new TypeError(`Expecting second parameter to be a number (width)`);
		if (typeof c$1 !== `number`) throw new TypeError(`Expecting third parameter to be a number (height)`);
		throwNumberTest(b$2, `positive`, `y`);
		throwNumberTest(c$1, `positive`, `width`);
		if (d$1 === void 0) throw new Error(`Expected height parameter`);
		throwNumberTest(d$1, `positive`, `height`);
		return Object.freeze({
			x: a$1 / c$1,
			y: b$2 / d$1
		});
	}
}

//#endregion
//#region packages/numbers/src/apply-to-values.ts
const applyToValues = (object$1, apply$3) => {
	const o = { ...object$1 };
	for (const [key, value] of Object.entries(object$1)) if (typeof value === `number`) o[key] = apply$3(value);
	else o[key] = value;
	return o;
};

//#endregion
//#region packages/numbers/src/numeric-arrays.ts
const weight = (data, fn) => {
	if (!Array.isArray(data)) throw new TypeError(`Param 'data' is expected to be an array. Got type: ${typeof data}`);
	const weightingFunction = fn ?? ((x) => x);
	return data.map((value, index) => {
		if (typeof value !== `number`) throw new TypeError(`Param 'data' contains non-number at index: '${index}'. Type: '${typeof value}' value: '${value}'`);
		const relativePos = index / (data.length - 1);
		const weightForPosition = weightingFunction(relativePos);
		if (typeof weightForPosition !== `number`) throw new TypeError(`Weighting function returned type '${typeof weightForPosition}' rather than number for input: '${relativePos}'`);
		const finalResult = value * weightForPosition;
		return finalResult;
	});
};
const validNumbers = (data) => data.filter((d$1) => typeof d$1 === `number` && !Number.isNaN(d$1));
const dotProduct$3 = (values$1) => {
	let r = 0;
	const length$4 = values$1[0].length;
	for (let index = 0; index < length$4; index++) {
		let t$1 = 0;
		for (const [p$1, value] of values$1.entries()) if (p$1 === 0) t$1 = value[index];
		else t$1 *= value[index];
		r += t$1;
	}
	return r;
};
const average$2 = (data) => {
	if (data === void 0) throw new Error(`data parameter is undefined`);
	const valid = validNumbers(data);
	const total$1 = valid.reduce((accumulator, v) => accumulator + v, 0);
	return total$1 / valid.length;
};
const min$3 = (data) => Math.min(...validNumbers(data));
const maxIndex = (data) => data.reduce((bestIndex, value, index, array$2) => value > array$2[bestIndex] ? index : bestIndex, 0);
const minIndex = (...data) => data.reduce((bestIndex, value, index, array$2) => value < array$2[bestIndex] ? index : bestIndex, 0);
const max$4 = (data) => Math.max(...validNumbers(data));
const total = (data) => data.reduce((previous, current) => {
	if (typeof current !== `number`) return previous;
	if (Number.isNaN(current)) return previous;
	if (!Number.isFinite(current)) return previous;
	return previous + current;
}, 0);
const maxFast = (data) => {
	let m$1 = Number.MIN_SAFE_INTEGER;
	for (const datum of data) m$1 = Math.max(m$1, datum);
	return m$1;
};
const totalFast = (data) => {
	let m$1 = 0;
	for (const datum of data) m$1 += datum;
	return m$1;
};
const minFast = (data) => {
	let m$1 = Number.MIN_SAFE_INTEGER;
	for (const datum of data) m$1 = Math.min(m$1, datum);
	return m$1;
};

//#endregion
//#region packages/numbers/src/average-weighted.ts
const averageWeighted = (data, weightings) => {
	if (typeof weightings === `function`) weightings = weight(data, weightings);
	const ww = zip$1(data, weightings);
	const [totalV, totalW] = ww.reduce((accumulator, v) => [accumulator[0] + v[0] * v[1], accumulator[1] + v[1]], [0, 0]);
	return totalV / totalW;
};

//#endregion
//#region packages/numbers/src/clamp.ts
const clamp$3 = (value, min$4 = 0, max$5 = 1) => {
	if (Number.isNaN(value)) throw new Error(`Param 'value' is NaN`);
	if (Number.isNaN(min$4)) throw new Error(`Param 'min' is NaN`);
	if (Number.isNaN(max$5)) throw new Error(`Param 'max' is NaN`);
	if (value < min$4) return min$4;
	if (value > max$5) return max$5;
	return value;
};
const clamper = (min$4 = 0, max$5 = 1) => {
	if (Number.isNaN(min$4)) throw new Error(`Param 'min' is NaN`);
	if (Number.isNaN(max$5)) throw new Error(`Param 'max' is NaN`);
	return (v) => {
		if (v > max$5) return max$5;
		if (v < min$4) return min$4;
		return v;
	};
};
const clampIndex = (v, arrayOrLength) => {
	if (!Number.isInteger(v)) throw new TypeError(`v parameter must be an integer (${v})`);
	const length$4 = Array.isArray(arrayOrLength) ? arrayOrLength.length : arrayOrLength;
	if (!Number.isInteger(length$4)) throw new TypeError(`length parameter must be an integer (${length$4}, ${typeof length$4})`);
	v = Math.round(v);
	if (v < 0) return 0;
	if (v >= length$4) return length$4 - 1;
	return v;
};

//#endregion
//#region packages/numbers/src/difference.ts
const differenceFromFixed = (initial, kind = `absolute`) => (value) => differenceFrom(kind, value, initial);
const differenceFromLast = (kind = `absolute`, initialValue = Number.NaN) => {
	let lastValue = initialValue;
	return (value) => {
		const x = differenceFrom(kind, value, lastValue);
		lastValue = value;
		return x;
	};
};
const differenceFrom = (kind = `absolute`, value, from$1) => {
	if (Number.isNaN(from$1)) return 0;
	const d$1 = value - from$1;
	let r = 0;
	if (kind === `absolute`) r = Math.abs(d$1);
	else if (kind === `numerical`) r = d$1;
	else if (kind === `relative`) r = Math.abs(d$1 / from$1);
	else if (kind === `relativeSigned`) r = d$1 / from$1;
	else throw new TypeError(`Unknown kind: '${kind}' Expected: 'absolute', 'relative', 'relativeSigned' or 'numerical'`);
	return r;
};

//#endregion
//#region packages/numbers/src/guard.ts
const isValid = (possibleNumber) => {
	if (typeof possibleNumber !== `number`) return false;
	if (Number.isNaN(possibleNumber)) return false;
	return true;
};

//#endregion
//#region packages/numbers/src/filter.ts
function* filterIterable(it) {
	for (const v of it) if (isValid(v)) yield v;
}
const thresholdAtLeast = (threshold) => {
	return (v) => {
		return v >= threshold;
	};
};
const rangeInclusive = (min$4, max$5) => {
	return (v) => {
		return v >= min$4 && v <= max$5;
	};
};

//#endregion
//#region packages/numbers/src/flip.ts
const flip = (v) => {
	if (typeof v === `function`) v = v();
	throwNumberTest(v, `percentage`, `v`);
	return 1 - v;
};

//#endregion
//#region packages/numbers/src/is-approx.ts
function isApprox(rangePercent, baseValue, v) {
	throwNumberTest(rangePercent, `percentage`, `rangePercent`);
	const range$1 = Math.floor(rangePercent * 100);
	const test = (base, value) => {
		try {
			if (typeof value !== `number`) return false;
			if (Number.isNaN(value)) return false;
			if (!Number.isFinite(value)) return false;
			const diff = Math.abs(value - base);
			const relative$1 = base === 0 ? Math.floor(diff * 100) : Math.floor(diff / base * 100);
			return relative$1 <= range$1;
		} catch {
			return false;
		}
	};
	if (baseValue === void 0) return test;
	throwNumberTest(baseValue, ``, `baseValue`);
	if (v === void 0) return (value) => test(baseValue, value);
	else return test(baseValue, v);
}
const isCloseTo = (a$1, b$2, precision = 3) => {
	const aa = a$1.toPrecision(precision);
	const bb = b$2.toPrecision(precision);
	if (aa !== bb) return [false, `A is not close enough to B. A: ${a$1} B: ${b$2} Precision: ${precision}`];
	else return [true];
};

//#endregion
//#region packages/numbers/src/bipolar.ts
var bipolar_exports = {};
__export(bipolar_exports, {
	clamp: () => clamp$2,
	fromScalar: () => fromScalar,
	immutable: () => immutable$1,
	scale: () => scale$3,
	scaleUnclamped: () => scaleUnclamped,
	toScalar: () => toScalar,
	towardZero: () => towardZero
});
const immutable$1 = (startingValueOrBipolar = 0) => {
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
			return immutable$1(towardZero(v, amt));
		},
		add: (amt) => {
			return immutable$1(clamp$2(v + amt));
		},
		multiply: (amt) => {
			return immutable$1(clamp$2(v * amt));
		},
		inverse: () => {
			return immutable$1(-v);
		},
		interpolate: (amt, b$2) => {
			return immutable$1(clamp$2(interpolate$7(amt, v, b$2)));
		},
		asScalar: () => {
			return toScalar(v);
		}
	};
};
const toScalar = (bipolarValue) => {
	if (typeof bipolarValue !== `number`) throw new Error(`Expected v to be a number. Got: ${typeof bipolarValue}`);
	if (Number.isNaN(bipolarValue)) throw new Error(`Parameter is NaN`);
	return (bipolarValue + 1) / 2;
};
const fromScalar = (scalarValue) => {
	throwNumberTest(scalarValue, `percentage`, `v`);
	return scalarValue * 2 - 1;
};
const scale$3 = (inputValue, inMin, inMax) => {
	return clamp$2(scaler$1(inMin, inMax, -1, 1)(inputValue));
};
const scaleUnclamped = (inputValue, inMin, inMax) => {
	return scaler$1(inMin, inMax, -1, 1)(inputValue);
};
const clamp$2 = (bipolarValue) => {
	if (typeof bipolarValue !== `number`) throw new Error(`Param 'bipolarValue' must be a number. Got: ${typeof bipolarValue}`);
	if (Number.isNaN(bipolarValue)) throw new Error(`Param 'bipolarValue' is NaN`);
	if (bipolarValue > 1) return 1;
	if (bipolarValue < -1) return -1;
	return bipolarValue;
};
const towardZero = (bipolarValue, amount) => {
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

//#endregion
//#region packages/numbers/src/wrap.ts
const wrapInteger = (v, min$4 = 0, max$5 = 360) => {
	throwIntegerTest(v, void 0, `v`);
	throwIntegerTest(min$4, void 0, `min`);
	throwIntegerTest(max$5, void 0, `max`);
	if (v === min$4) return min$4;
	if (v === max$5) return min$4;
	if (v > 0 && v < min$4) v += min$4;
	v -= min$4;
	max$5 -= min$4;
	v = v % max$5;
	if (v < 0) v = max$5 - Math.abs(v) + min$4;
	return v + min$4;
};
const wrap$5 = (v, min$4 = 0, max$5 = 1) => {
	throwNumberTest(v, ``, `min`);
	throwNumberTest(min$4, ``, `min`);
	throwNumberTest(max$5, ``, `max`);
	if (v === min$4) return min$4;
	if (v === max$5) return min$4;
	while (v <= min$4 || v >= max$5) {
		if (v === max$5) break;
		if (v === min$4) break;
		if (v > max$5) v = min$4 + (v - max$5);
		else if (v < min$4) v = max$5 - (min$4 - v);
	}
	return v;
};
const wrapRange = (min$4, max$5, fn, a$1, b$2) => {
	let r = 0;
	const distF = Math.abs(b$2 - a$1);
	const distFwrap = Math.abs(max$5 - a$1 + b$2);
	const distBWrap = Math.abs(a$1 + (360 - b$2));
	const distMin = Math.min(distF, distFwrap, distBWrap);
	if (distMin === distBWrap) r = a$1 - fn(distMin);
	else if (distMin === distFwrap) r = a$1 + fn(distMin);
	else if (a$1 > b$2) r = a$1 - fn(distMin);
	else r = a$1 + fn(distMin);
	return wrapInteger(r, min$4, max$5);
};

//#endregion
//#region packages/numbers/src/pi-pi.ts
const piPi$9 = Math.PI * 2;

//#endregion
//#region packages/numbers/src/interpolate.ts
function interpolate$7(pos1, pos2, pos3, pos4) {
	let amountProcess;
	let limits = `clamp`;
	const handleAmount = (amount) => {
		if (amountProcess) amount = amountProcess(amount);
		if (limits === void 0 || limits === `clamp`) amount = clamp$3(amount);
		else if (limits === `wrap`) {
			if (amount > 1) amount = amount % 1;
			else if (amount < 0) amount = 1 + amount % 1;
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
		let a$1;
		let b$2;
		if (pos3 === void 0 || typeof pos3 === `object`) {
			a$1 = pos1;
			b$2 = pos2;
			readOpts(pos3);
			return (amount) => doTheEase(amount, a$1, b$2);
		} else if (typeof pos3 === `number`) {
			a$1 = pos2;
			b$2 = pos3;
			readOpts(pos4);
			return doTheEase(pos1, a$1, b$2);
		} else throw new Error(`Values for 'a' and 'b' not defined`);
	} else if (pos2 === void 0 || typeof pos2 === `object`) {
		const amount = handleAmount(pos1);
		readOpts(pos2);
		throwNumberTest(amount, ``, `amount`);
		return (aValue, bValue) => rawEase(amount, aValue, bValue);
	}
}
const interpolatorStepped$1 = (incrementAmount, a$1 = 0, b$2 = 1, startInterpolationAt = 0, options) => {
	let amount = startInterpolationAt;
	return (retargetB, retargetA) => {
		if (retargetB !== void 0) b$2 = retargetB;
		if (retargetA !== void 0) a$1 = retargetA;
		if (amount >= 1) return b$2;
		const value = interpolate$7(amount, a$1, b$2, options);
		amount += incrementAmount;
		return value;
	};
};
const interpolateAngle$1 = (amount, aRadians, bRadians, options) => {
	const t$1 = wrap$5(bRadians - aRadians, 0, piPi$9);
	return interpolate$7(amount, aRadians, aRadians + (t$1 > Math.PI ? t$1 - piPi$9 : t$1), options);
};

//#endregion
//#region packages/numbers/src/round.ts
function round$1(a$1, b$2, roundUp) {
	throwIntegerTest(a$1, `positive`, `decimalPlaces`);
	let up = typeof b$2 === `boolean` ? b$2 : roundUp ?? false;
	let rounder;
	if (a$1 === 0) rounder = Math.round;
	else {
		const p$1 = Math.pow(10, a$1);
		if (up) rounder = (v) => Math.ceil(v * p$1) / p$1;
		else rounder = (v) => Math.floor(v * p$1) / p$1;
	}
	if (typeof b$2 === `number`) return rounder(b$2);
	return rounder;
}

//#endregion
//#region packages/numbers/src/linear-space.ts
function* linearSpace(start, end, steps$1, precision) {
	throwNumberTest(start, ``, `start`);
	throwNumberTest(end, ``, `end`);
	throwNumberTest(steps$1, ``, `steps`);
	const r = precision ? round$1(precision) : (v) => v;
	const step = (end - start) / (steps$1 - 1);
	throwNumberTest(step, ``, `step`);
	if (!Number.isFinite(step)) throw new TypeError(`Calculated step value is infinite`);
	for (let index = 0; index < steps$1; index++) {
		const v = start + step * index;
		yield r(v);
	}
}

//#endregion
//#region packages/numbers/src/util/queue-mutable.ts
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

//#endregion
//#region packages/numbers/src/moving-average.ts
const PiPi = Math.PI * 2;
const movingAverageLight = (scaling = 3) => {
	throwNumberTest(scaling, `aboveZero`, `scaling`);
	let average$3 = 0;
	let count$2 = 0;
	return (v) => {
		const r = numberTest(v, ``, `v`);
		if (r[0] && v !== void 0) {
			count$2++;
			average$3 = average$3 + (v - average$3) / Math.min(count$2, scaling);
		}
		return average$3;
	};
};
const movingAverage = (samples = 100, weighter) => {
	const q = new BasicQueueMutable();
	return (v) => {
		const r = numberTest(v);
		if (r[0] && v !== void 0) {
			q.enqueue(v);
			while (q.size > samples) q.dequeue();
		}
		return weighter === void 0 ? average$2(q.data) : averageWeighted(q.data, weighter);
	};
};
const smoothingFactor = (timeDelta, cutoff) => {
	const r = PiPi * cutoff * timeDelta;
	return r / (r + 1);
};
const exponentialSmoothing = (smoothingFactor$1, value, previous) => {
	return smoothingFactor$1 * value + (1 - smoothingFactor$1) * previous;
};
const noiseFilter = (cutoffMin = 1, speedCoefficient = 0, cutoffDefault = 1) => {
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
		const a$1 = smoothingFactor(timeDelta, cutoff);
		const smoothed = exponentialSmoothing(a$1, value, previousValue);
		previousValue = smoothed;
		derivativeLast = derivative;
		timestampLast = timestamp;
		return smoothed;
	};
	return compute;
};

//#endregion
//#region packages/numbers/src/scale.ts
const scale$2 = (v, inMin, inMax, outMin, outMax, easing) => scaler$1(inMin, inMax, outMin, outMax, easing)(v);
const scaler$1 = (inMin, inMax, outMin, outMax, easing, clamped) => {
	throwNumberTest(inMin, `finite`, `inMin`);
	throwNumberTest(inMax, `finite`, `inMax`);
	const oMax = outMax ?? 1;
	const oMin = outMin ?? 0;
	const clampFunction = clamped ? clamper(outMin, outMax) : void 0;
	return (v) => {
		if (inMin === inMax) return oMax;
		let a$1 = (v - inMin) / (inMax - inMin);
		if (easing !== void 0) a$1 = easing(a$1);
		const x = a$1 * (oMax - oMin) + oMin;
		if (clampFunction) return clampFunction(x);
		return x;
	};
};
const scalerNull = () => (v) => v;
const scaleClamped = (v, inMin, inMax, outMin, outMax, easing) => {
	if (outMax === void 0) outMax = 1;
	if (outMin === void 0) outMin = 0;
	if (inMin === inMax) return outMax;
	const x = scale$2(v, inMin, inMax, outMin, outMax, easing);
	return clamp$3(x, outMin, outMax);
};
const scalePercentages = (percentage, outMin, outMax = 1) => {
	throwNumberTest(percentage, `percentage`, `v`);
	throwNumberTest(outMin, `percentage`, `outMin`);
	throwNumberTest(outMax, `percentage`, `outMax`);
	return scale$2(percentage, 0, 1, outMin, outMax);
};
const scalePercent = (v, outMin, outMax) => scalerPercent(outMin, outMax)(v);
const scalerPercent = (outMin, outMax) => {
	return (v) => {
		throwNumberTest(v, `percentage`, `v`);
		return scale$2(v, 0, 1, outMin, outMax);
	};
};
const scalerTwoWay = (inMin, inMax, outMin = 0, outMax = 1, clamped = false, easing) => {
	const toOut = scaler$1(inMin, inMax, outMin, outMax, easing, clamped);
	const toIn = scaler$1(outMin, outMax, inMin, inMax, easing, clamped);
	return {
		out: toOut,
		in: toIn
	};
};

//#endregion
//#region packages/numbers/src/number-array-compute.ts
const numberArrayCompute = (data, opts = {}) => {
	if (data.length === 0) return {
		total: Number.NaN,
		min: Number.NaN,
		max: Number.NaN,
		avg: Number.NaN,
		count: Number.NaN
	};
	const nonNumbers = opts.nonNumbers ?? `throw`;
	let total$1 = 0;
	let min$4 = Number.MAX_SAFE_INTEGER;
	let max$5 = Number.MIN_SAFE_INTEGER;
	let count$2 = 0;
	for (let index = 0; index < data.length; index++) {
		let value = data[index];
		if (typeof value !== `number`) {
			if (nonNumbers === `ignore`) continue;
			if (nonNumbers === `throw`) throw new Error(`Param 'data' contains a non-number at index: ${index.toString()}`);
			if (nonNumbers === `nan`) value = Number.NaN;
		}
		if (Number.isNaN(value)) continue;
		min$4 = Math.min(min$4, value);
		max$5 = Math.max(max$5, value);
		total$1 += value;
		count$2++;
	}
	return {
		total: total$1,
		max: max$5,
		min: min$4,
		count: count$2,
		avg: total$1 / count$2
	};
};

//#endregion
//#region packages/numbers/src/normalise.ts
const stream = (minDefault, maxDefault) => {
	let min$4 = minDefault ?? Number.MAX_SAFE_INTEGER;
	let max$5 = maxDefault ?? Number.MIN_SAFE_INTEGER;
	throwNumberTest(min$4);
	throwNumberTest(max$5);
	return (v) => {
		throwNumberTest(v);
		min$4 = Math.min(min$4, v);
		max$5 = Math.max(max$5, v);
		return scale$2(v, min$4, max$5);
	};
};
const array$1 = (values$1, minForced, maxForced) => {
	if (!Array.isArray(values$1)) throw new TypeError(`Param 'values' should be an array. Got: ${typeof values$1}`);
	const mma = numberArrayCompute(values$1);
	const min$4 = minForced ?? mma.min;
	const max$5 = maxForced ?? mma.max;
	return values$1.map((v) => clamp$3(scale$2(v, min$4, max$5)));
};

//#endregion
//#region packages/numbers/src/proportion.ts
const proportion = (v, t$1) => {
	if (typeof v === `function`) v = v();
	if (typeof t$1 === `function`) t$1 = t$1();
	throwNumberTest(v, `percentage`, `v`);
	throwNumberTest(t$1, `percentage`, `t`);
	return v * t$1;
};

//#endregion
//#region packages/numbers/src/quantise.ts
const quantiseEvery$1 = (v, every, middleRoundsUp = true) => {
	const everyString = every.toString();
	const decimal = everyString.indexOf(`.`);
	let multiplier = 1;
	if (decimal >= 0) {
		const d$1 = everyString.substring(decimal + 1).length;
		multiplier = 10 * d$1;
		every = Math.floor(multiplier * every);
		v = v * multiplier;
	}
	throwNumberTest(v, ``, `v`);
	throwIntegerTest(every, ``, `every`);
	let div = v / every;
	const divModule = div % 1;
	div = Math.floor(div);
	if (divModule === .5 && middleRoundsUp || divModule > .5) div++;
	const vv = every * div / multiplier;
	return vv;
};

//#endregion
//#region packages/numbers/src/softmax.ts
const softmax = (logits) => {
	const maxLogit = logits.reduce((a$1, b$2) => Math.max(a$1, b$2), Number.NEGATIVE_INFINITY);
	const scores = logits.map((l) => Math.exp(l - maxLogit));
	const denom = scores.reduce((a$1, b$2) => a$1 + b$2);
	return scores.map((s) => s / denom);
};

//#endregion
//#region packages/geometry/src/point/get-point-parameter.ts
function getTwoPointParameters(a1, ab2, ab3, ab4, ab5, ab6) {
	if (isPoint3d(a1) && isPoint3d(ab2)) return [a1, ab2];
	if (isPoint(a1) && isPoint(ab2)) return [a1, ab2];
	if (isPoint3d(a1)) {
		const b$3 = {
			x: ab2,
			y: ab3,
			z: ab4
		};
		if (!isPoint3d(b$3)) throw new Error(`Expected x, y & z parameters`);
		return [a1, b$3];
	}
	if (isPoint(a1)) {
		const b$3 = {
			x: ab2,
			y: ab3
		};
		if (!isPoint(b$3)) throw new Error(`Expected x & y parameters`);
		return [a1, b$3];
	}
	if (typeof ab5 !== `undefined` && typeof ab4 !== `undefined`) {
		const a$2 = {
			x: a1,
			y: ab2,
			z: ab3
		};
		const b$3 = {
			x: ab4,
			y: ab5,
			z: ab6
		};
		if (!isPoint3d(a$2)) throw new Error(`Expected x,y,z for first point`);
		if (!isPoint3d(b$3)) throw new Error(`Expected x,y,z for second point`);
		return [a$2, b$3];
	}
	const a$1 = {
		x: a1,
		y: ab2
	};
	const b$2 = {
		x: ab3,
		y: ab4
	};
	if (!isPoint(a$1)) throw new Error(`Expected x,y for first point`);
	if (!isPoint(b$2)) throw new Error(`Expected x,y for second point`);
	return [a$1, b$2];
}
function getPointParameter(a$1, b$2, c$1) {
	if (a$1 === void 0) return {
		x: 0,
		y: 0
	};
	if (Array.isArray(a$1)) {
		if (a$1.length === 0) return Object.freeze({
			x: 0,
			y: 0
		});
		if (a$1.length === 1) return Object.freeze({
			x: a$1[0],
			y: 0
		});
		if (a$1.length === 2) return Object.freeze({
			x: a$1[0],
			y: a$1[1]
		});
		if (a$1.length === 3) return Object.freeze({
			x: a$1[0],
			y: a$1[1],
			z: a$1[2]
		});
		throw new Error(`Expected array to be 1-3 elements in length. Got ${a$1.length}.`);
	}
	if (isPoint(a$1)) return a$1;
	else if (typeof a$1 !== `number` || typeof b$2 !== `number`) throw new TypeError(`Expected point or x,y as parameters. Got: a: ${JSON.stringify(a$1)} b: ${JSON.stringify(b$2)}`);
	if (typeof c$1 === `number`) return Object.freeze({
		x: a$1,
		y: b$2,
		z: c$1
	});
	return Object.freeze({
		x: a$1,
		y: b$2
	});
}

//#endregion
//#region packages/geometry/src/point/distance.ts
function distance$2(a$1, xOrB, y, z) {
	const pt = getPointParameter(xOrB, y, z);
	guard$7(pt, `b`);
	guard$7(a$1, `a`);
	return isPoint3d(pt) && isPoint3d(a$1) ? Math.hypot(pt.x - a$1.x, pt.y - a$1.y, pt.z - a$1.z) : Math.hypot(pt.x - a$1.x, pt.y - a$1.y);
}

//#endregion
//#region packages/geometry/src/line/nearest.ts
const nearest$1 = (line$2, point$1) => {
	const n$2 = (line$3) => {
		const { a: a$1, b: b$2 } = line$3;
		const atob = {
			x: b$2.x - a$1.x,
			y: b$2.y - a$1.y
		};
		const atop = {
			x: point$1.x - a$1.x,
			y: point$1.y - a$1.y
		};
		const length$4 = atob.x * atob.x + atob.y * atob.y;
		let dot$1 = atop.x * atob.x + atop.y * atob.y;
		const t$1 = Math.min(1, Math.max(0, dot$1 / length$4));
		dot$1 = (b$2.x - a$1.x) * (point$1.y - a$1.y) - (b$2.y - a$1.y) * (point$1.x - a$1.x);
		return {
			x: a$1.x + atob.x * t$1,
			y: a$1.y + atob.y * t$1
		};
	};
	if (Array.isArray(line$2)) {
		const pts = line$2.map((l) => n$2(l));
		const dists = pts.map((p$1) => distance$2(p$1, point$1));
		return Object.freeze(pts[minIndex(...dists)]);
	} else return Object.freeze(n$2(line$2));
};

//#endregion
//#region packages/geometry/src/line/distance-single-line.ts
const distanceSingleLine = (line$2, point$1) => {
	guard$6(line$2, `line`);
	guard$7(point$1, `point`);
	if (length$3(line$2) === 0) return length$3(line$2.a, point$1);
	const near = nearest$1(line$2, point$1);
	return length$3(near, point$1);
};

//#endregion
//#region packages/geometry/src/point/find-minimum.ts
function findMinimum(comparer, ...points) {
	if (points.length === 0) throw new Error(`No points provided`);
	let min$4 = points[0];
	for (const p$1 of points) if (isPoint3d(min$4) && isPoint3d(p$1)) min$4 = comparer(min$4, p$1);
	else min$4 = comparer(min$4, p$1);
	return min$4;
}

//#endregion
//#region packages/geometry/src/rect/max.ts
const maxFromCorners = (topLeft, topRight, bottomRight, bottomLeft) => {
	if (topLeft.y > bottomRight.y) throw new Error(`topLeft.y greater than bottomRight.y`);
	if (topLeft.y > bottomLeft.y) throw new Error(`topLeft.y greater than bottomLeft.y`);
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

//#endregion
//#region packages/geometry/src/point/bbox.ts
const bbox$5 = (...points) => {
	const leftMost = findMinimum((a$1, b$2) => {
		return a$1.x < b$2.x ? a$1 : b$2;
	}, ...points);
	const rightMost = findMinimum((a$1, b$2) => {
		return a$1.x > b$2.x ? a$1 : b$2;
	}, ...points);
	const topMost = findMinimum((a$1, b$2) => {
		return a$1.y < b$2.y ? a$1 : b$2;
	}, ...points);
	const bottomMost = findMinimum((a$1, b$2) => {
		return a$1.y > b$2.y ? a$1 : b$2;
	}, ...points);
	const topLeft = {
		x: leftMost.x,
		y: topMost.y
	};
	const topRight = {
		x: rightMost.x,
		y: topMost.y
	};
	const bottomRight = {
		x: rightMost.x,
		y: bottomMost.y
	};
	const bottomLeft = {
		x: leftMost.x,
		y: bottomMost.y
	};
	return maxFromCorners(topLeft, topRight, bottomRight, bottomLeft);
};
const bbox3d = (...points) => {
	const box = bbox$5(...points);
	const zMin = findMinimum((a$1, b$2) => {
		return a$1.z < b$2.z ? a$1 : b$2;
	}, ...points);
	const zMax = findMinimum((a$1, b$2) => {
		return a$1.z > b$2.z ? a$1 : b$2;
	}, ...points);
	return {
		...box,
		z: zMin.z,
		depth: zMax.z - zMin.z
	};
};

//#endregion
//#region packages/geometry/src/line/bbox.ts
const bbox$4 = (line$2) => bbox$5(line$2.a, line$2.b);

//#endregion
//#region packages/geometry/src/point/divider.ts
function divide$4(a1, ab2, ab3, ab4, ab5, ab6) {
	const [ptA, ptB] = getTwoPointParameters(a1, ab2, ab3, ab4, ab5, ab6);
	guard$7(ptA, `a`);
	guard$7(ptB, `b`);
	if (ptB.x === 0) throw new TypeError("Cannot divide by zero (b.x is 0)");
	if (ptB.y === 0) throw new TypeError("Cannot divide by zero (b.y is 0)");
	let pt = {
		x: ptA.x / ptB.x,
		y: ptA.y / ptB.y
	};
	if (isPoint3d(ptA) || isPoint3d(ptB)) {
		if (ptB.z === 0) throw new TypeError("Cannot divide by zero (b.z is 0)");
		pt.z = (ptA.z ?? 0) / (ptB.z ?? 0);
	}
	return Object.freeze(pt);
}
function divider(a$1, b$2, c$1) {
	const divisor = getPointParameter(a$1, b$2, c$1);
	guardNonZeroPoint(divisor, `divisor`);
	return (aa, bb, cc) => {
		const dividend = getPointParameter(aa, bb, cc);
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

//#endregion
//#region packages/geometry/src/line/divide.ts
const divide$3 = (line$2, point$1) => Object.freeze({
	...line$2,
	a: divide$4(line$2.a, point$1),
	b: divide$4(line$2.b, point$1)
});

//#endregion
//#region packages/geometry/src/line/from-numbers.ts
const fromNumbers$2 = (x1, y1, x2, y2) => {
	if (Number.isNaN(x1)) throw new Error(`x1 is NaN`);
	if (Number.isNaN(x2)) throw new Error(`x2 is NaN`);
	if (Number.isNaN(y1)) throw new Error(`y1 is NaN`);
	if (Number.isNaN(y2)) throw new Error(`y2 is NaN`);
	const a$1 = {
		x: x1,
		y: y1
	};
	const b$2 = {
		x: x2,
		y: y2
	};
	return fromPoints$2(a$1, b$2);
};

//#endregion
//#region packages/geometry/src/line/from-flat-array.ts
const fromFlatArray$1 = (array$2) => {
	if (!Array.isArray(array$2)) throw new Error(`arr parameter is not an array`);
	if (array$2.length !== 4) throw new Error(`array is expected to have length four`);
	return fromNumbers$2(array$2[0], array$2[1], array$2[2], array$2[3]);
};

//#endregion
//#region packages/geometry/src/polar/guard.ts
const isPolarCoord = (p$1) => {
	if (p$1.distance === void 0) return false;
	if (p$1.angleRadian === void 0) return false;
	return true;
};
const guard$4 = (p$1, name = `Point`) => {
	if (p$1 === void 0) throw new Error(`'${name}' is undefined. Expected {distance, angleRadian} got ${JSON.stringify(p$1)}`);
	if (p$1 === null) throw new Error(`'${name}' is null. Expected {distance, angleRadian} got ${JSON.stringify(p$1)}`);
	if (p$1.angleRadian === void 0) throw new Error(`'${name}.angleRadian' is undefined. Expected {distance, angleRadian} got ${JSON.stringify(p$1)}`);
	if (p$1.distance === void 0) throw new Error(`'${name}.distance' is undefined. Expected {distance, angleRadian} got ${JSON.stringify(p$1)}`);
	if (typeof p$1.angleRadian !== `number`) throw new TypeError(`'${name}.angleRadian' must be a number. Got ${p$1.angleRadian}`);
	if (typeof p$1.distance !== `number`) throw new TypeError(`'${name}.distance' must be a number. Got ${p$1.distance}`);
	if (p$1.angleRadian === null) throw new Error(`'${name}.angleRadian' is null`);
	if (p$1.distance === null) throw new Error(`'${name}.distance' is null`);
	if (Number.isNaN(p$1.angleRadian)) throw new TypeError(`'${name}.angleRadian' is NaN`);
	if (Number.isNaN(p$1.distance)) throw new Error(`'${name}.distance' is NaN`);
};

//#endregion
//#region packages/geometry/src/pi.ts
const piPi$8 = Math.PI * 2;

//#endregion
//#region packages/geometry/src/angles.ts
function degreeToRadian(angleInDegrees) {
	return Array.isArray(angleInDegrees) ? angleInDegrees.map((v) => v * (Math.PI / 180)) : angleInDegrees * (Math.PI / 180);
}
function radianInvert(angleInRadians) {
	return (angleInRadians + Math.PI) % (2 * Math.PI);
}
function radianToDegree(angleInRadians) {
	return Array.isArray(angleInRadians) ? angleInRadians.map((v) => v * 180 / Math.PI) : angleInRadians * 180 / Math.PI;
}
const radiansFromAxisX = (point$1) => Math.atan2(point$1.x, point$1.y);
const radiansSum = (start, amount, clockwise = true) => {
	if (clockwise) {
		let x = start + amount;
		if (x >= piPi$8) x = x % piPi$8;
		return x;
	} else {
		const x = start - amount;
		if (x < 0) return piPi$8 + x;
		return x;
	}
};
const degreesSum = (start, amount, clockwise = true) => radianToDegree(radiansSum(degreeToRadian(start), degreeToRadian(amount), clockwise));
const radianArc = (start, end, clockwise = true) => {
	let s = start;
	if (end < s) {
		s = 0;
		end = piPi$8 - start + end;
	}
	let d$1 = end - s;
	if (clockwise) d$1 = piPi$8 - d$1;
	if (d$1 >= piPi$8) return d$1 % piPi$8;
	return d$1;
};
const degreeArc = (start, end, clockwise = true) => radianToDegree(radianArc(degreeToRadian(start), degreeToRadian(end), clockwise));

//#endregion
//#region packages/geometry/src/polar/angles.ts
const rotate$3 = (c$1, amountRadian) => Object.freeze({
	...c$1,
	angleRadian: c$1.angleRadian + amountRadian
});
const invert$1 = (p$1) => {
	guard$4(p$1, `c`);
	return Object.freeze({
		...p$1,
		angleRadian: p$1.angleRadian - Math.PI
	});
};
const isOpposite = (a$1, b$2) => {
	guard$4(a$1, `a`);
	guard$4(b$2, `b`);
	if (a$1.distance !== b$2.distance) return false;
	return a$1.angleRadian === -b$2.angleRadian;
};
const isParallel = (a$1, b$2) => {
	guard$4(a$1, `a`);
	guard$4(b$2, `b`);
	return a$1.angleRadian === b$2.angleRadian;
};
const isAntiParallel = (a$1, b$2) => {
	guard$4(a$1, `a`);
	guard$4(b$2, `b`);
	return a$1.angleRadian === -b$2.angleRadian;
};
const rotateDegrees = (c$1, amountDeg) => Object.freeze({
	...c$1,
	angleRadian: c$1.angleRadian + degreeToRadian(amountDeg)
});

//#endregion
//#region packages/geometry/src/point/subtract.ts
function subtract$3(a1, ab2, ab3, ab4, ab5, ab6) {
	const [ptA, ptB] = getTwoPointParameters(a1, ab2, ab3, ab4, ab5, ab6);
	guard$7(ptA, `a`);
	guard$7(ptB, `b`);
	let pt = {
		x: ptA.x - ptB.x,
		y: ptA.y - ptB.y
	};
	if (isPoint3d(ptA) || isPoint3d(ptB)) pt.z = (ptA.z ?? 0) - (ptB.z ?? 0);
	return Object.freeze(pt);
}

//#endregion
//#region packages/geometry/src/point/empty.ts
const Empty$3 = {
	x: 0,
	y: 0
};
const Unit = {
	x: 1,
	y: 1
};
const Empty3d = {
	x: 0,
	y: 0,
	z: 0
};
const Unit3d = {
	x: 1,
	y: 1,
	z: 1
};

//#endregion
//#region packages/geometry/src/polar/conversions.ts
const toCartesian$2 = (a$1, b$2, c$1) => {
	if (isPolarCoord(a$1)) {
		if (b$2 === void 0) b$2 = Empty$3;
		if (isPoint(b$2)) return polarToCartesian(a$1.distance, a$1.angleRadian, b$2);
		throw new Error(`Expecting (Coord, Point). Second parameter is not a point`);
	} else if (typeof a$1 === `object`) throw new TypeError(`First param is an object, but not a Coord: ${JSON.stringify(a$1)}`);
	else if (typeof a$1 === `number` && typeof b$2 === `number`) {
		if (c$1 === void 0) c$1 = Empty$3;
		if (!isPoint(c$1)) throw new Error(`Expecting (number, number, Point). Point param wrong type`);
		return polarToCartesian(a$1, b$2, c$1);
	} else throw new TypeError(`Expecting parameters of (number, number). Got: (${typeof a$1}, ${typeof b$2}, ${typeof c$1}). a: ${JSON.stringify(a$1)}`);
};
const fromCartesian = (point$1, origin) => {
	point$1 = subtract$3(point$1, origin);
	const angle = Math.atan2(point$1.y, point$1.x);
	return Object.freeze({
		...point$1,
		angleRadian: angle,
		distance: Math.hypot(point$1.x, point$1.y)
	});
};
/**
* Converts a polar coordinate to Cartesian
* @param distance Distance
* @param angleRadians Angle in radians
* @param origin Origin, or 0,0 by default.
* @returns
*/
const polarToCartesian = (distance$3, angleRadians, origin = Empty$3) => {
	guard$7(origin);
	return Object.freeze({
		x: origin.x + distance$3 * Math.cos(angleRadians),
		y: origin.y + distance$3 * Math.sin(angleRadians)
	});
};
const toString$6 = (p$1, digits) => {
	if (p$1 === void 0) return `(undefined)`;
	if (p$1 === null) return `(null)`;
	const angleDeg = radianToDegree(p$1.angleRadian);
	const d$1 = digits ? p$1.distance.toFixed(digits) : p$1.distance;
	const a$1 = digits ? angleDeg.toFixed(digits) : angleDeg;
	return `(${d$1},${a$1})`;
};
const toPoint = (v, origin = Empty$3) => {
	guard$4(v, `v`);
	return Object.freeze({
		x: origin.x + v.distance * Math.cos(v.angleRadian),
		y: origin.y + v.distance * Math.sin(v.angleRadian)
	});
};

//#endregion
//#region packages/geometry/src/polar/math.ts
const normalise$2 = (c$1) => {
	if (c$1.distance === 0) throw new Error(`Cannot normalise vector of length 0`);
	return Object.freeze({
		...c$1,
		distance: 1
	});
};
const clampMagnitude$2 = (v, max$5 = 1, min$4 = 0) => {
	let mag = v.distance;
	if (mag > max$5) mag = max$5;
	if (mag < min$4) mag = min$4;
	return Object.freeze({
		...v,
		distance: mag
	});
};
const dotProduct$2 = (a$1, b$2) => {
	guard$4(a$1, `a`);
	guard$4(b$2, `b`);
	return a$1.distance * b$2.distance * Math.cos(b$2.angleRadian - a$1.angleRadian);
};
const multiply$4 = (v, amt) => {
	guard$4(v);
	throwNumberTest(amt, ``, `amt`);
	return Object.freeze({
		...v,
		distance: v.distance * amt
	});
};
const divide$2 = (v, amt) => {
	guard$4(v);
	throwNumberTest(amt, ``, `amt`);
	return Object.freeze({
		...v,
		distance: v.distance / amt
	});
};

//#endregion
//#region packages/geometry/src/point/angle.ts
const angleRadian$1 = (a$1, b$2, c$1) => {
	guard$7(a$1, `a`);
	if (b$2 === void 0) return Math.atan2(a$1.y, a$1.x);
	guard$7(b$2, `b`);
	if (c$1 === void 0) return Math.atan2(b$2.y - a$1.y, b$2.x - a$1.x);
	guard$7(c$1, `c`);
	return Math.atan2(b$2.y - a$1.y, b$2.x - a$1.x) - Math.atan2(c$1.y - a$1.y, c$1.x - a$1.x);
};
const angleRadianCircle = (a$1, b$2, c$1) => {
	const angle = angleRadian$1(a$1, b$2, c$1);
	if (angle < 0) return angle + piPi$8;
	return angle;
};

//#endregion
//#region packages/geometry/src/polar/ray.ts
var ray_exports = {};
__export(ray_exports, {
	fromLine: () => fromLine,
	toCartesian: () => toCartesian$1,
	toString: () => toString$5
});
const toCartesian$1 = (ray, origin) => {
	const o = getOrigin(ray, origin);
	const a$1 = toCartesian$2(ray.offset, ray.angleRadian, o);
	const b$2 = toCartesian$2(ray.offset + ray.length, ray.angleRadian, o);
	return {
		a: a$1,
		b: b$2
	};
};
const getOrigin = (ray, origin) => {
	if (origin !== void 0) return origin;
	if (ray.origin !== void 0) return ray.origin;
	return {
		x: 0,
		y: 0
	};
};
const toString$5 = (ray) => {
	return `PolarRay(angle: ${ray.angleRadian} offset: ${ray.offset} len: ${ray.length})`;
};
const fromLine = (line$2, origin) => {
	const o = origin ?? line$2.a;
	return {
		angleRadian: angleRadian$1(line$2.b, o),
		offset: distance$2(line$2.a, o),
		length: distance$2(line$2.b, line$2.a),
		origin: o
	};
};

//#endregion
//#region packages/geometry/src/polar/spiral.ts
function* spiral(smoothness, zoom) {
	let step = 0;
	while (true) {
		const a$1 = smoothness * step++;
		yield {
			distance: zoom * a$1,
			angleRadian: a$1,
			step
		};
	}
}
const spiralRaw = (step, smoothness, zoom) => {
	const a$1 = smoothness * step;
	return Object.freeze({
		distance: zoom * a$1,
		angleRadian: a$1
	});
};

//#endregion
//#region packages/geometry/src/polar/index.ts
var polar_exports = {};
__export(polar_exports, {
	Ray: () => ray_exports,
	clampMagnitude: () => clampMagnitude$2,
	divide: () => divide$2,
	dotProduct: () => dotProduct$2,
	fromCartesian: () => fromCartesian,
	guard: () => guard$4,
	invert: () => invert$1,
	isAntiParallel: () => isAntiParallel,
	isOpposite: () => isOpposite,
	isParallel: () => isParallel,
	isPolarCoord: () => isPolarCoord,
	multiply: () => multiply$4,
	normalise: () => normalise$2,
	rotate: () => rotate$3,
	rotateDegrees: () => rotateDegrees,
	spiral: () => spiral,
	spiralRaw: () => spiralRaw,
	toCartesian: () => toCartesian$2,
	toPoint: () => toPoint,
	toString: () => toString$6
});

//#endregion
//#region packages/geometry/src/line/from-pivot.ts
const fromPivot = (origin = {
	x: .5,
	y: .5
}, length$4 = 1, angleRadian$2 = 0, balance = .5) => {
	const left = length$4 * balance;
	const right = length$4 * (1 - balance);
	const a$1 = toCartesian$2(left, radianInvert(angleRadian$2), origin);
	const b$2 = toCartesian$2(right, angleRadian$2, origin);
	return Object.freeze({
		a: a$1,
		b: b$2
	});
};

//#endregion
//#region packages/geometry/src/line/from-points-to-path.ts
const fromPointsToPath = (a$1, b$2) => toPath$3(fromPoints$2(a$1, b$2));

//#endregion
//#region packages/geometry/src/point/is-equal.ts
const isEqual$6 = (...p$1) => {
	if (p$1 === void 0) throw new Error(`parameter 'p' is undefined`);
	if (p$1.length < 2) return true;
	for (let index = 1; index < p$1.length; index++) {
		if (p$1[index].x !== p$1[0].x) return false;
		if (p$1[index].y !== p$1[0].y) return false;
	}
	return true;
};

//#endregion
//#region packages/geometry/src/line/is-equal.ts
const isEqual$5 = (a$1, b$2) => isEqual$6(a$1.a, b$2.a) && isEqual$6(a$1.b, b$2.b);

//#endregion
//#region packages/geometry/src/point/abs.ts
function abs$2(pt) {
	if (isPoint3d(pt)) return Object.freeze({
		...pt,
		x: Math.abs(pt.x),
		y: Math.abs(pt.y),
		z: Math.abs(pt.z)
	});
	else if (isPoint(pt)) return Object.freeze({
		...pt,
		x: Math.abs(pt.x),
		y: Math.abs(pt.y)
	});
	else throw new TypeError(`Param 'pt' is not a point`);
}

//#endregion
//#region packages/geometry/src/point/apply.ts
function apply$2(pt, fn) {
	guard$7(pt, `pt`);
	if (isPoint3d(pt)) return Object.freeze({
		...pt,
		x: fn(pt.x, `x`),
		y: fn(pt.y, `y`),
		z: fn(pt.z, `z`)
	});
	return Object.freeze({
		...pt,
		x: fn(pt.x, `x`),
		y: fn(pt.y, `y`)
	});
}

//#endregion
//#region packages/geometry/src/point/averager.ts
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
		default: throw new Error(`Unknown averaging kind '${kind}'. Expected: 'moving-average-light'`);
	}
	return (point$1) => {
		let ax = x(point$1.x);
		let ay = y(point$1.y);
		if (isPoint3d(point$1)) {
			let az = z(point$1.z);
			return Object.freeze({
				x: ax,
				y: ay,
				z: az
			});
		} else return Object.freeze({
			x: ax,
			y: ay
		});
	};
}

//#endregion
//#region packages/geometry/src/point/centroid.ts
const centroid$1 = (...points) => {
	if (!Array.isArray(points)) throw new Error(`Expected list of points`);
	const sum$6 = points.reduce((previous, p$1) => {
		if (p$1 === void 0) return previous;
		if (Array.isArray(p$1)) throw new TypeError(`'points' list contains an array. Did you mean: centroid(...myPoints)?`);
		if (!isPoint(p$1)) throw new Error(`'points' contains something which is not a point: ${JSON.stringify(p$1)}`);
		return {
			x: previous.x + p$1.x,
			y: previous.y + p$1.y
		};
	}, {
		x: 0,
		y: 0
	});
	return Object.freeze({
		x: sum$6.x / points.length,
		y: sum$6.y / points.length
	});
};

//#endregion
//#region packages/geometry/src/point/clamp.ts
function clamp$1(a$1, min$4 = 0, max$5 = 1) {
	if (isPoint3d(a$1)) return Object.freeze({
		x: clamp$3(a$1.x, min$4, max$5),
		y: clamp$3(a$1.y, min$4, max$5),
		z: clamp$3(a$1.z, min$4, max$5)
	});
	else return Object.freeze({
		x: clamp$3(a$1.x, min$4, max$5),
		y: clamp$3(a$1.y, min$4, max$5)
	});
}

//#endregion
//#region packages/geometry/src/point/compare.ts
const compare = (a$1, b$2) => {
	if (a$1.x < b$2.x && a$1.y < b$2.y) return -2;
	if (a$1.x > b$2.x && a$1.y > b$2.y) return 2;
	if (a$1.x < b$2.x || a$1.y < b$2.y) return -1;
	if (a$1.x > b$2.x || a$1.y > b$2.y) return 1;
	if (a$1.x === b$2.x && a$1.x === b$2.y) return 0;
	return Number.NaN;
};
const compareByX = (a$1, b$2) => {
	if (a$1.x === b$2.x) return 0;
	if (a$1.x < b$2.x) return -1;
	return 1;
};
const compareByY = (a$1, b$2) => {
	if (a$1.y === b$2.y) return 0;
	if (a$1.y < b$2.y) return -1;
	return 1;
};
const compareByZ = (a$1, b$2) => {
	if (a$1.z === b$2.z) return 0;
	if (a$1.z < b$2.z) return -1;
	return 1;
};

//#endregion
//#region packages/geometry/src/point/convex-hull.ts
const convexHull = (...pts) => {
	const sorted = [...pts].sort(compareByX);
	if (sorted.length === 1) return sorted;
	const x = (points) => {
		const v = [];
		for (const p$1 of points) {
			while (v.length >= 2) {
				const q = v.at(-1);
				const r = v.at(-2);
				if ((q.x - r.x) * (p$1.y - r.y) >= (q.y - r.y) * (p$1.x - r.x)) v.pop();
				else break;
			}
			v.push(p$1);
		}
		v.pop();
		return v;
	};
	const upper = x(sorted);
	const lower = x(sorted.reverse());
	if (upper.length === 1 && lower.length === 1 && isEqual$6(lower[0], upper[0])) return upper;
	return [...upper, ...lower];
};

//#endregion
//#region packages/geometry/src/circle/guard.ts
const guard$3 = (circle$2, parameterName = `circle`) => {
	if (isCirclePositioned(circle$2)) guard$7(circle$2, `circle`);
	if (Number.isNaN(circle$2.radius)) throw new Error(`${parameterName}.radius is NaN`);
	if (circle$2.radius <= 0) throw new Error(`${parameterName}.radius must be greater than zero`);
};
const guardPositioned = (circle$2, parameterName = `circle`) => {
	if (!isCirclePositioned(circle$2)) throw new Error(`Expected a positioned circle with x,y`);
	guard$3(circle$2, parameterName);
};
const isNaN$1 = (a$1) => {
	if (Number.isNaN(a$1.radius)) return true;
	if (isCirclePositioned(a$1)) {
		if (Number.isNaN(a$1.x)) return true;
		if (Number.isNaN(a$1.y)) return true;
	}
	return false;
};
const isPositioned$1 = (p$1) => p$1.x !== void 0 && p$1.y !== void 0;
const isCircle = (p$1) => p$1.radius !== void 0;
const isCirclePositioned = (p$1) => isCircle(p$1) && isPositioned$1(p$1);

//#endregion
//#region packages/geometry/src/circle/distance-center.ts
const distanceCenter$1 = (a$1, b$2) => {
	guardPositioned(a$1, `a`);
	if (isCirclePositioned(b$2)) guardPositioned(b$2, `b`);
	return distance$2(a$1, b$2);
};

//#endregion
//#region packages/geometry/src/circle/distance-from-exterior.ts
const distanceFromExterior$1 = (a$1, b$2) => {
	guardPositioned(a$1, `a`);
	if (isCirclePositioned(b$2)) return Math.max(0, distanceCenter$1(a$1, b$2) - a$1.radius - b$2.radius);
	else if (isPoint(b$2)) {
		const distribution = distance$2(a$1, b$2);
		if (distribution < a$1.radius) return 0;
		return distribution;
	} else throw new Error(`Second parameter invalid type`);
};

//#endregion
//#region packages/geometry/src/circle/is-equal.ts
const isEqual$4 = (a$1, b$2) => {
	if (a$1.radius !== b$2.radius) return false;
	if (isCirclePositioned(a$1) && isCirclePositioned(b$2)) {
		if (a$1.x !== b$2.x) return false;
		if (a$1.y !== b$2.y) return false;
		if (a$1.z !== b$2.z) return false;
		return true;
	} else if (!isCirclePositioned(a$1) && !isCirclePositioned(b$2)) {} else return false;
	return false;
};

//#endregion
//#region packages/geometry/src/point/sum.ts
function sum$5(a1, ab2, ab3, ab4, ab5, ab6) {
	const [ptA, ptB] = getTwoPointParameters(a1, ab2, ab3, ab4, ab5, ab6);
	guard$7(ptA, `a`);
	guard$7(ptB, `b`);
	let pt = {
		x: ptA.x + ptB.x,
		y: ptA.y + ptB.y
	};
	if (isPoint3d(ptA) || isPoint3d(ptB)) pt.z = (ptA.z ?? 0) + (ptB.z ?? 0);
	return Object.freeze(pt);
}

//#endregion
//#region packages/geometry/src/circle/intersections.ts
const intersectionLine = (circle$2, line$2) => {
	const v1 = {
		x: line$2.b.x - line$2.a.x,
		y: line$2.b.y - line$2.a.y
	};
	const v2 = {
		x: line$2.a.x - circle$2.x,
		y: line$2.a.y - circle$2.y
	};
	const b$2 = (v1.x * v2.x + v1.y * v2.y) * -2;
	const c$1 = 2 * (v1.x * v1.x + v1.y * v1.y);
	const d$1 = Math.sqrt(b$2 * b$2 - 2 * c$1 * (v2.x * v2.x + v2.y * v2.y - circle$2.radius * circle$2.radius));
	if (Number.isNaN(d$1)) return [];
	const u1 = (b$2 - d$1) / c$1;
	const u2 = (b$2 + d$1) / c$1;
	const returnValue = [];
	if (u1 <= 1 && u1 >= 0) returnValue.push({
		x: line$2.a.x + v1.x * u1,
		y: line$2.a.y + v1.y * u1
	});
	if (u2 <= 1 && u2 >= 0) returnValue.push({
		x: line$2.a.x + v1.x * u2,
		y: line$2.a.y + v1.y * u2
	});
	return returnValue;
};
const intersections = (a$1, b$2) => {
	const vector = subtract$3(b$2, a$1);
	const centerD = Math.hypot(vector.y, vector.x);
	if (centerD > a$1.radius + b$2.radius) return [];
	if (centerD < Math.abs(a$1.radius - b$2.radius)) return [];
	if (isEqual$4(a$1, b$2)) return [];
	const centroidD = (a$1.radius * a$1.radius - b$2.radius * b$2.radius + centerD * centerD) / (2 * centerD);
	const centroid$2 = {
		x: a$1.x + vector.x * centroidD / centerD,
		y: a$1.y + vector.y * centroidD / centerD
	};
	const centroidIntersectionD = Math.sqrt(a$1.radius * a$1.radius - centroidD * centroidD);
	const intersection$1 = {
		x: -vector.y * (centroidIntersectionD / centerD),
		y: vector.x * (centroidIntersectionD / centerD)
	};
	return [sum$5(centroid$2, intersection$1), subtract$3(centroid$2, intersection$1)];
};

//#endregion
//#region packages/geometry/src/intersects.ts
const circleRect = (a$1, b$2) => {
	const deltaX = a$1.x - Math.max(b$2.x, Math.min(a$1.x, b$2.x + b$2.width));
	const deltaY = a$1.y - Math.max(b$2.y, Math.min(a$1.y, b$2.y + b$2.height));
	return deltaX * deltaX + deltaY * deltaY < a$1.radius * a$1.radius;
};
const circleCircle = (a$1, b$2) => intersections(a$1, b$2).length === 2;

//#endregion
//#region packages/geometry/src/rect/Intersects.ts
function intersectsPoint(rect$1, a$1, b$2) {
	guard$5(rect$1, `rect`);
	let x = 0;
	let y = 0;
	if (typeof a$1 === `number`) {
		if (b$2 === void 0) throw new Error(`x and y coordinate needed`);
		x = a$1;
		y = b$2;
	} else {
		x = a$1.x;
		y = a$1.y;
	}
	if (isPositioned$2(rect$1)) {
		if (x - rect$1.x > rect$1.width || x < rect$1.x) return false;
		if (y - rect$1.y > rect$1.height || y < rect$1.y) return false;
	} else {
		if (x > rect$1.width || x < 0) return false;
		if (y > rect$1.height || y < 0) return false;
	}
	return true;
}
const isIntersecting$2 = (a$1, b$2) => {
	if (!isRectPositioned(a$1)) throw new Error(`a parameter should be RectPositioned`);
	if (isCirclePositioned(b$2)) return circleRect(b$2, a$1);
	else if (isPoint(b$2)) return intersectsPoint(a$1, b$2);
	throw new Error(`Unknown shape for b: ${JSON.stringify(b$2)}`);
};

//#endregion
//#region packages/geometry/src/rect/center.ts
const center$2 = (rect$1, origin) => {
	guard$5(rect$1);
	if (origin === void 0 && isPoint(rect$1)) origin = rect$1;
	else if (origin === void 0) origin = {
		x: 0,
		y: 0
	};
	const r = getRectPositioned(rect$1, origin);
	return Object.freeze({
		x: origin.x + rect$1.width / 2,
		y: origin.y + rect$1.height / 2
	});
};

//#endregion
//#region packages/geometry/src/rect/distance.ts
const distanceFromExterior = (rect$1, pt) => {
	guardPositioned$1(rect$1, `rect`);
	guard$7(pt, `pt`);
	if (intersectsPoint(rect$1, pt)) return 0;
	const dx = Math.max(rect$1.x - pt.x, 0, pt.x - rect$1.x + rect$1.width);
	const dy = Math.max(rect$1.y - pt.y, 0, pt.y - rect$1.y + rect$1.height);
	return Math.hypot(dx, dy);
};
const distanceFromCenter = (rect$1, pt) => distance$2(center$2(rect$1), pt);

//#endregion
//#region packages/geometry/src/point/distance-to-center.ts
const distanceToCenter = (a$1, shape) => {
	if (isRectPositioned(shape)) return distanceFromExterior(shape, a$1);
	if (isCirclePositioned(shape)) return distanceFromExterior$1(shape, a$1);
	if (isPoint(shape)) return distance$2(a$1, shape);
	throw new Error(`Unknown shape`);
};

//#endregion
//#region packages/geometry/src/point/distance-to-exterior.ts
const distanceToExterior = (a$1, shape) => {
	if (isRectPositioned(shape)) return distanceFromExterior(shape, a$1);
	if (isCirclePositioned(shape)) return distanceFromExterior$1(shape, a$1);
	if (isPoint(shape)) return distance$2(a$1, shape);
	throw new Error(`Unknown shape`);
};

//#endregion
//#region packages/geometry/src/point/to-array.ts
const toArray$2 = (p$1) => [p$1.x, p$1.y];

//#endregion
//#region packages/geometry/src/point/dot-product.ts
const dotProduct$1 = (...pts) => {
	const a$1 = pts.map((p$1) => toArray$2(p$1));
	return dotProduct$3(a$1);
};

//#endregion
//#region packages/geometry/src/point/from.ts
function from(xOrArray, y, z) {
	if (Array.isArray(xOrArray)) if (xOrArray.length === 3) return Object.freeze({
		x: xOrArray[0],
		y: xOrArray[1],
		z: xOrArray[2]
	});
	else if (xOrArray.length === 2) return Object.freeze({
		x: xOrArray[0],
		y: xOrArray[1]
	});
	else throw new Error(`Expected array of length two or three, got ${xOrArray.length}`);
	else {
		if (xOrArray === void 0) throw new Error(`Requires an array of [x,y] or x,y parameters at least`);
		else if (Number.isNaN(xOrArray)) throw new Error(`x is NaN`);
		if (y === void 0) throw new Error(`Param 'y' is missing`);
		else if (Number.isNaN(y)) throw new Error(`y is NaN`);
		if (z === void 0) return Object.freeze({
			x: xOrArray,
			y
		});
		else return Object.freeze({
			x: xOrArray,
			y,
			z
		});
	}
}
const fromString = (str) => {
	if (typeof str !== `string`) throw new TypeError(`Param 'str' ought to be a string. Got: ${typeof str}`);
	const comma = str.indexOf(`,`);
	const x = Number.parseFloat(str.substring(0, comma));
	const nextComma = str.indexOf(",", comma + 1);
	if (nextComma > 0) {
		const y = Number.parseFloat(str.substring(comma + 1, nextComma - comma + 2));
		const z = Number.parseFloat(str.substring(nextComma + 1));
		return {
			x,
			y,
			z
		};
	} else {
		const y = Number.parseFloat(str.substring(comma + 1));
		return {
			x,
			y
		};
	}
};
const fromNumbers$1 = (...coords) => {
	const pts = [];
	if (Array.isArray(coords[0])) for (const coord of coords) {
		if (!(coord.length % 2 === 0)) throw new Error(`coords array should be even-numbered`);
		pts.push(Object.freeze({
			x: coord[0],
			y: coord[1]
		}));
	}
	else {
		if (coords.length % 2 !== 0) throw new Error(`Expected even number of elements: [x,y,x,y...]`);
		for (let index = 0; index < coords.length; index += 2) pts.push(Object.freeze({
			x: coords[index],
			y: coords[index + 1]
		}));
	}
	return pts;
};

//#endregion
//#region packages/geometry/src/point/interpolate.ts
const interpolate$6 = (amount, a$1, b$2, allowOverflow = false) => interpolate$8(amount, a$1, b$2, allowOverflow);

//#endregion
//#region packages/geometry/src/point/invert.ts
const invert = (pt, what = `both`) => {
	switch (what) {
		case `both`: return isPoint3d(pt) ? Object.freeze({
			...pt,
			x: pt.x * -1,
			y: pt.y * -1,
			z: pt.z * -1
		}) : Object.freeze({
			...pt,
			x: pt.x * -1,
			y: pt.y * -1
		});
		case `x`: return Object.freeze({
			...pt,
			x: pt.x * -1
		});
		case `y`: return Object.freeze({
			...pt,
			y: pt.y * -1
		});
		case `z`: if (isPoint3d(pt)) return Object.freeze({
			...pt,
			z: pt.z * -1
		});
		else throw new Error(`pt parameter is missing z`);
		default: throw new Error(`Unknown what parameter. Expecting 'both', 'x' or 'y'`);
	}
};

//#endregion
//#region packages/geometry/src/point/multiply.ts
function multiply$3(a1, ab2, ab3, ab4, ab5, ab6) {
	const [ptA, ptB] = getTwoPointParameters(a1, ab2, ab3, ab4, ab5, ab6);
	guard$7(ptA, `a`);
	guard$7(ptB, `b`);
	let pt = {
		x: ptA.x * ptB.x,
		y: ptA.y * ptB.y
	};
	if (isPoint3d(ptA) || isPoint3d(ptB)) pt.z = (ptA.z ?? 0) * (ptB.z ?? 0);
	return Object.freeze(pt);
}
const multiplyScalar$2 = (pt, v) => {
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

//#endregion
//#region packages/geometry/src/point/magnitude.ts
const clampMagnitude$1 = (pt, max$5 = 1, min$4 = 0) => {
	const length$4 = distance$2(pt);
	let ratio = 1;
	if (length$4 > max$5) ratio = max$5 / length$4;
	else if (length$4 < min$4) ratio = min$4 / length$4;
	return ratio === 1 ? pt : multiply$3(pt, ratio, ratio);
};

//#endregion
//#region packages/geometry/src/point/most.ts
const leftmost = (...points) => findMinimum((a$1, b$2) => a$1.x <= b$2.x ? a$1 : b$2, ...points);
const rightmost = (...points) => findMinimum((a$1, b$2) => a$1.x >= b$2.x ? a$1 : b$2, ...points);

//#endregion
//#region packages/geometry/src/point/normalise.ts
const length$2 = (ptOrX, y) => {
	if (isPoint(ptOrX)) {
		y = ptOrX.y;
		ptOrX = ptOrX.x;
	}
	if (y === void 0) throw new Error(`Expected y`);
	return Math.hypot(ptOrX, y);
};
const normalise$1 = (ptOrX, y) => {
	const pt = getPointParameter(ptOrX, y);
	const l = length$2(pt);
	if (l === 0) return Empty$3;
	return Object.freeze({
		...pt,
		x: pt.x / l,
		y: pt.y / l
	});
};

//#endregion
//#region packages/geometry/src/point/pipeline.ts
const pipelineApply = (point$1, ...pipelineFns) => pipeline(...pipelineFns)(point$1);
const pipeline = (...pipeline$1) => (pt) => pipeline$1.reduce((previous, current) => current(previous), pt);

//#endregion
//#region packages/core/src/trackers/tracker-base.ts
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
		if (this.debug) console.log(`TrackerBase: sampleLimit: ${this.sampleLimit} resetAfter: ${this.resetAfterSamples} store: ${this.storeIntermediate}`);
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
	seen(...p$1) {
		if (this.resetAfterSamples > 0 && this.seenCount > this.resetAfterSamples) this.reset();
		else if (this.sampleLimit > 0 && this.seenCount > this.sampleLimit * 2) {
			this.seenCount = this.trimStore(this.sampleLimit);
			this.onTrimmed(`resize`);
		}
		this.seenCount += p$1.length;
		const t$1 = this.filterData(p$1);
		return this.computeResults(t$1);
	}
};

//#endregion
//#region packages/core/src/trackers/object-tracker.ts
var ObjectTracker = class extends TrackerBase {
	values;
	constructor(opts = {}) {
		super(opts);
		this.values = [];
	}
	onTrimmed(reason) {}
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
	filterData(p$1) {
		const ts = p$1.map((v) => `at` in v ? v : {
			...v,
			at: Date.now()
		});
		const last$1 = ts.at(-1);
		if (this.storeIntermediate) this.values.push(...ts);
		else switch (this.values.length) {
			case 0: {
				this.values.push(last$1);
				break;
			}
			case 1: {
				this.values.push(last$1);
				break;
			}
			case 2: {
				this.values[1] = last$1;
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

//#endregion
//#region packages/core/src/maps.ts
const some = (map, predicate) => [...map.values()].some((v) => predicate(v));
const zipKeyValue = (keys, values$1) => {
	if (keys.length !== values$1.length) throw new Error(`Keys and values arrays should be same length`);
	return Object.fromEntries(keys.map((k, index) => [k, values$1[index]]));
};
const getOrGenerate = (map, fn) => async (key, args) => {
	let value = map.get(key);
	if (value !== void 0) return value;
	value = await fn(key, args);
	if (value === void 0) throw new Error(`fn returned undefined`);
	map.set(key, value);
	return value;
};

//#endregion
//#region packages/core/src/trackers/tracked-value.ts
var TrackedValueMap = class {
	store;
	gog;
	constructor(creator) {
		this.store = new Map();
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
	async seen(id, ...values$1) {
		const trackedValue = await this.getTrackedValue(id, ...values$1);
		const result = trackedValue.seen(...values$1);
		return result;
	}
	/**
	* Creates or returns a TrackedValue instance for `id`.
	* @param id
	* @param values
	* @returns
	*/
	async getTrackedValue(id, ...values$1) {
		if (id === null) throw new Error(`id parameter cannot be null`);
		if (id === void 0) throw new Error(`id parameter cannot be undefined`);
		const trackedValue = await this.gog(id, values$1[0]);
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
		this.store = new Map();
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
		tp.sort((a$1, b$2) => {
			const aa = a$1.elapsed;
			const bb = b$2.elapsed;
			if (aa === bb) return 0;
			if (aa > bb) return -1;
			return 1;
		});
		for (const t$1 of tp) yield t$1;
	}
	/**
	* Iterates underlying values, ordered by age (oldest first)
	* First the named values are sorted by their `elapsed` value, and then
	* we return the last value for that group.
	*/
	*valuesByAge() {
		for (const tb of this.trackedByAge()) yield tb.last;
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
		for (const p$1 of this.store.values()) yield p$1.last;
	}
	/**
	* Enumerate starting values
	*/
	*initialValues() {
		for (const p$1 of this.store.values()) yield p$1.initial;
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

//#endregion
//#region packages/geometry/src/point/To.ts
const toIntegerValues = (pt, rounder = Math.round) => {
	guard$7(pt, `pt`);
	return Object.freeze({
		x: rounder(pt.x),
		y: rounder(pt.y)
	});
};
const to2d = (pt) => {
	guard$7(pt, `pt`);
	let copy = { ...pt };
	delete copy.z;
	return Object.freeze(copy);
};
const to3d = (pt, z = 0) => {
	guard$7(pt, `pt`);
	return Object.freeze({
		...pt,
		z
	});
};
function toString$4(p$1, digits) {
	if (p$1 === void 0) return `(undefined)`;
	if (p$1 === null) return `(null)`;
	guard$7(p$1, `pt`);
	const x = digits ? p$1.x.toFixed(digits) : p$1.x;
	const y = digits ? p$1.y.toFixed(digits) : p$1.y;
	if (p$1.z === void 0) return `(${x},${y})`;
	else {
		const z = digits ? p$1.z.toFixed(digits) : p$1.z;
		return `(${x},${y},${z})`;
	}
}

//#endregion
//#region packages/geometry/src/vector.ts
var vector_exports = {};
__export(vector_exports, {
	clampMagnitude: () => clampMagnitude,
	divide: () => divide$1,
	dotProduct: () => dotProduct,
	fromLineCartesian: () => fromLineCartesian,
	fromLinePolar: () => fromLinePolar,
	fromPointPolar: () => fromPointPolar,
	fromRadians: () => fromRadians,
	multiply: () => multiply$2,
	normalise: () => normalise,
	quadrantOffsetAngle: () => quadrantOffsetAngle,
	subtract: () => subtract$2,
	sum: () => sum$4,
	toCartesian: () => toCartesian,
	toPolar: () => toPolar,
	toRadians: () => toRadians,
	toString: () => toString$3
});
const EmptyCartesian = Object.freeze({
	x: 0,
	y: 0
});
const piPi$7 = Math.PI * 2;
const pi$4 = Math.PI;
const fromRadians = (radians) => {
	return Object.freeze({
		x: Math.cos(radians),
		y: Math.sin(radians)
	});
};
const toRadians = (point$1) => {
	return Math.atan2(point$1.y, point$1.x);
};
const fromPointPolar = (pt, angleNormalisation = ``, origin = EmptyCartesian) => {
	pt = subtract$3(pt, origin);
	let direction = Math.atan2(pt.y, pt.x);
	if (angleNormalisation === `unipolar` && direction < 0) direction += piPi$7;
	else if (angleNormalisation === `bipolar`) {
		if (direction > pi$4) direction -= piPi$7;
		else if (direction <= -pi$4) direction += piPi$7;
	}
	return Object.freeze({
		distance: distance$2(pt),
		angleRadian: direction
	});
};
const fromLineCartesian = (line$2) => subtract$3(line$2.b, line$2.a);
const fromLinePolar = (line$2) => {
	guard$6(line$2, `line`);
	const pt = subtract$3(line$2.b, line$2.a);
	return fromPointPolar(pt);
};
const isPolar = (v) => {
	if (isPolarCoord(v)) return true;
	return false;
};
const isCartesian = (v) => {
	if (isPoint(v)) return true;
	return false;
};
const normalise = (v) => {
	if (isPolar(v)) return normalise$2(v);
	else if (isCartesian(v)) return normalise$1(v);
	throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
};
const quadrantOffsetAngle = (p$1) => {
	if (p$1.x >= 0 && p$1.y >= 0) return 0;
	if (p$1.x < 0 && p$1.y >= 0) return pi$4;
	if (p$1.x < 0 && p$1.y < 0) return pi$4;
	return piPi$7;
};
const toPolar = (v, origin = Empty$3) => {
	if (isPolar(v)) return v;
	else if (isCartesian(v)) return fromCartesian(v, origin);
	throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
};
const toCartesian = (v) => {
	if (isPolar(v)) return toPoint(v);
	else if (isCartesian(v)) return v;
	throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
};
const toString$3 = (v, digits) => {
	if (isPolar(v)) return toString$6(v, digits);
	else if (isCartesian(v)) return toString$4(v, digits);
	throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
};
const dotProduct = (a$1, b$2) => {
	if (isPolar(a$1) && isPolar(b$2)) return dotProduct$2(a$1, b$2);
	else if (isCartesian(a$1) && isCartesian(b$2)) return dotProduct$1(a$1, b$2);
	throw new Error(`Expected two polar/Cartesian vectors.`);
};
const clampMagnitude = (v, max$5 = 1, min$4 = 0) => {
	if (isPolar(v)) return clampMagnitude$2(v, max$5, min$4);
	else if (isCartesian(v)) return clampMagnitude$1(v, max$5, min$4);
	throw new Error(`Expected either polar or Cartesian vector`);
};
const sum$4 = (a$1, b$2) => {
	const polar = isPolar(a$1);
	a$1 = toCartesian(a$1);
	b$2 = toCartesian(b$2);
	const c$1 = sum$5(a$1, b$2);
	return polar ? toPolar(c$1) : c$1;
};
const subtract$2 = (a$1, b$2) => {
	const polar = isPolar(a$1);
	a$1 = toCartesian(a$1);
	b$2 = toCartesian(b$2);
	const c$1 = subtract$3(a$1, b$2);
	return polar ? toPolar(c$1) : c$1;
};
const multiply$2 = (a$1, b$2) => {
	const polar = isPolar(a$1);
	a$1 = toCartesian(a$1);
	b$2 = toCartesian(b$2);
	const c$1 = multiply$3(a$1, b$2);
	return polar ? toPolar(c$1) : c$1;
};
const divide$1 = (a$1, b$2) => {
	const polar = isPolar(a$1);
	a$1 = toCartesian(a$1);
	b$2 = toCartesian(b$2);
	const c$1 = divide$4(a$1, b$2);
	return polar ? toPolar(c$1) : c$1;
};

//#endregion
//#region packages/geometry/src/point/relation.ts
const relation = (a$1, b$2) => {
	const start = getPointParameter(a$1, b$2);
	let totalX = 0;
	let totalY = 0;
	let count$2 = 0;
	let lastUpdate = performance.now();
	let lastPoint = start;
	const update = (aa, bb) => {
		const p$1 = getPointParameter(aa, bb);
		totalX += p$1.x;
		totalY += p$1.y;
		count$2++;
		const distanceFromStart = distance$2(p$1, start);
		const distanceFromLast = distance$2(p$1, lastPoint);
		const now = performance.now();
		const speed = distanceFromLast / (now - lastUpdate);
		lastUpdate = now;
		lastPoint = p$1;
		return Object.freeze({
			angle: angleRadian$1(p$1, start),
			distanceFromStart,
			distanceFromLast,
			speed,
			centroid: centroid$1(p$1, start),
			average: {
				x: totalX / count$2,
				y: totalY / count$2
			}
		});
	};
	return update;
};

//#endregion
//#region packages/geometry/src/point/point-type.ts
const Placeholder$3 = Object.freeze({
	x: Number.NaN,
	y: Number.NaN
});
const Placeholder3d = Object.freeze({
	x: Number.NaN,
	y: Number.NaN,
	z: Number.NaN
});

//#endregion
//#region packages/geometry/src/point/point-tracker.ts
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
	seenEvent(p$1) {
		if (`getCoalescedEvents` in p$1) {
			const events = p$1.getCoalescedEvents();
			const asPoints$1 = events.map((event$1) => ({
				x: event$1.clientX,
				y: event$1.clientY
			}));
			return this.seen(...asPoints$1);
		} else return this.seen({
			x: p$1.clientX,
			y: p$1.clientY
		});
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
		if (this.initialRelation === void 0 && this.initial) this.initialRelation = relation(this.initial);
		else if (this.initialRelation === void 0) throw new Error(`Bug: No initialRelation, and this.inital is undefined?`);
		const lastRelation = previousLast === void 0 ? relation(currentLast) : relation(previousLast);
		const initialRel = this.initialRelation(currentLast);
		const markRel = this.markRelation !== void 0 ? this.markRelation(currentLast) : void 0;
		const speed = previousLast === void 0 ? 0 : length$3(previousLast, currentLast) / (currentLast.at - previousLast.at);
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
		if (this.values.length < 2 || !initial) return Empty$2;
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
		return this.values.length >= 2 && initial !== void 0 ? distance$2(initial, this.last) : 0;
	}
	/**
	* Difference between last point and the initial point, calculated
	* as a simple subtraction of x,y & z.
	*
	* `Points.Placeholder` is returned if there's only one point so far.
	*/
	difference() {
		const initial = this.initial;
		return this.values.length >= 2 && initial !== void 0 ? subtract$3(this.last, initial) : Placeholder$3;
	}
	/**
	* Returns angle (in radians) from latest point to the initial point
	* If there are less than two points, undefined is return.
	* @returns Angle in radians
	*/
	angleFromStart() {
		const initial = this.initial;
		if (initial !== void 0 && this.values.length > 2) return angleRadian$1(initial, this.last);
	}
	/**
	* Returns the total length of accumulated points.
	* Returns 0 if points were not saved, or there's only one
	*/
	get length() {
		if (this.values.length === 1) return 0;
		const l = this.line;
		return length$3(l);
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
			const p$1 = new PointTracker({
				...opts,
				id: key
			});
			p$1.seen(start);
			return p$1;
		});
	}
	/**
	* Track a PointerEvent
	* @param event
	*/
	seenEvent(event$1) {
		if (`getCoalescedEvents` in event$1) {
			const events = event$1.getCoalescedEvents();
			const seens = events.map((subEvent) => super.seen(subEvent.pointerId.toString(), subEvent));
			return Promise.all(seens);
		} else return Promise.all([super.seen(event$1.pointerId.toString(), event$1)]);
	}
};
const trackPoints = (options = {}) => new PointsTracker(options);
const track = (opts = {}) => new PointTracker(opts);

//#endregion
//#region packages/geometry/src/point/progress-between.ts
const progressBetween = (position, waypointA, waypointB) => {
	const a$1 = subtract$3(position, waypointA);
	const b$2 = subtract$3(waypointB, waypointA);
	return isPoint3d(a$1) && isPoint3d(b$2) ? (a$1.x * b$2.x + a$1.y * b$2.y + a$1.z * b$2.z) / (b$2.x * b$2.x + b$2.y * b$2.y + b$2.z * b$2.z) : (a$1.x * b$2.x + a$1.y * b$2.y) / (b$2.x * b$2.x + b$2.y * b$2.y);
};

//#endregion
//#region packages/geometry/src/point/project.ts
const project = (origin, distance$3, angle) => {
	const x = Math.cos(angle) * distance$3 + origin.x;
	const y = Math.sin(angle) * distance$3 + origin.y;
	return {
		x,
		y
	};
};

//#endregion
//#region packages/geometry/src/point/quantise.ts
function quantiseEvery(pt, snap, middleRoundsUp = true) {
	guard$7(pt, `pt`);
	guard$7(snap, `snap`);
	if (isPoint3d(pt)) {
		if (!isPoint3d(snap)) throw new TypeError(`Param 'snap' is missing 'z' field`);
		return Object.freeze({
			x: quantiseEvery$1(pt.x, snap.x, middleRoundsUp),
			y: quantiseEvery$1(pt.y, snap.y, middleRoundsUp),
			z: quantiseEvery$1(pt.z, snap.z, middleRoundsUp)
		});
	}
	return Object.freeze({
		x: quantiseEvery$1(pt.x, snap.x, middleRoundsUp),
		y: quantiseEvery$1(pt.y, snap.y, middleRoundsUp)
	});
}

//#endregion
//#region packages/geometry/src/point/random.ts
const random$2 = (rando) => {
	if (rando === void 0) rando = Math.random;
	return Object.freeze({
		x: rando(),
		y: rando()
	});
};
const random3d = (rando) => {
	if (rando === void 0) rando = Math.random;
	return Object.freeze({
		x: rando(),
		y: rando(),
		z: rando()
	});
};

//#endregion
//#region packages/geometry/src/point/reduce.ts
const reduce = (pts, fn, initial) => {
	if (initial === void 0) initial = {
		x: 0,
		y: 0
	};
	let accumulator = initial;
	for (const p$1 of pts) accumulator = fn(p$1, accumulator);
	return accumulator;
};

//#endregion
//#region packages/geometry/src/point/rotate.ts
function rotate$2(pt, amountRadian, origin) {
	if (origin === void 0) origin = {
		x: 0,
		y: 0
	};
	guard$7(origin, `origin`);
	throwNumberTest(amountRadian, ``, `amountRadian`);
	const arrayInput = Array.isArray(pt);
	if (amountRadian === 0) return pt;
	if (!arrayInput) pt = [pt];
	const ptAr = pt;
	for (const [index, p$1] of ptAr.entries()) guard$7(p$1, `pt[${index}]`);
	const asPolar = ptAr.map((p$1) => fromCartesian(p$1, origin));
	const rotated = asPolar.map((p$1) => rotate$3(p$1, amountRadian));
	const asCartesisan = rotated.map((p$1) => toCartesian$2(p$1, origin));
	return arrayInput ? asCartesisan : asCartesisan[0];
}

//#endregion
//#region packages/geometry/src/point/rotate-point-array.ts
const rotatePointArray = (v, amountRadian) => {
	const mat = [[Math.cos(amountRadian), -Math.sin(amountRadian)], [Math.sin(amountRadian), Math.cos(amountRadian)]];
	const result = [];
	for (const [index, element] of v.entries()) result[index] = [mat[0][0] * element[0] + mat[0][1] * element[1], mat[1][0] * element[0] + mat[1][1] * element[1]];
	return result;
};

//#endregion
//#region packages/geometry/src/point/round.ts
const round = (ptOrX, yOrDigits, digits) => {
	const pt = getPointParameter(ptOrX, yOrDigits);
	digits = digits ?? yOrDigits;
	digits = digits ?? 2;
	return Object.freeze({
		...pt,
		x: round$1(digits, pt.x),
		y: round$1(digits, pt.y)
	});
};

//#endregion
//#region packages/geometry/src/point/within-range.ts
const withinRange$1 = (a$1, b$2, maxRange) => {
	guard$7(a$1, `a`);
	guard$7(b$2, `b`);
	if (typeof maxRange === `number`) {
		throwNumberTest(maxRange, `positive`, `maxRange`);
		maxRange = {
			x: maxRange,
			y: maxRange
		};
	} else guard$7(maxRange, `maxRange`);
	const x = Math.abs(b$2.x - a$1.x);
	const y = Math.abs(b$2.y - a$1.y);
	return x <= maxRange.x && y <= maxRange.y;
};

//#endregion
//#region packages/geometry/src/point/wrap.ts
const wrap$4 = (pt, ptMax, ptMin) => {
	if (ptMax === void 0) ptMax = {
		x: 1,
		y: 1
	};
	if (ptMin === void 0) ptMin = {
		x: 0,
		y: 0
	};
	guard$7(pt, `pt`);
	guard$7(ptMax, `ptMax`);
	guard$7(ptMin, `ptMin`);
	return Object.freeze({
		x: wrap$5(pt.x, ptMin.x, ptMax.x),
		y: wrap$5(pt.y, ptMin.y, ptMax.y)
	});
};

//#endregion
//#region packages/geometry/src/point/index.ts
var point_exports = {};
__export(point_exports, {
	Empty: () => Empty$3,
	Empty3d: () => Empty3d,
	Placeholder: () => Placeholder$3,
	Placeholder3d: () => Placeholder3d,
	PointTracker: () => PointTracker,
	PointsTracker: () => PointsTracker,
	Unit: () => Unit,
	Unit3d: () => Unit3d,
	abs: () => abs$2,
	angleRadian: () => angleRadian$1,
	angleRadianCircle: () => angleRadianCircle,
	apply: () => apply$2,
	averager: () => averager,
	bbox: () => bbox$5,
	bbox3d: () => bbox3d,
	centroid: () => centroid$1,
	clamp: () => clamp$1,
	clampMagnitude: () => clampMagnitude$1,
	compare: () => compare,
	compareByX: () => compareByX,
	compareByY: () => compareByY,
	compareByZ: () => compareByZ,
	convexHull: () => convexHull,
	distance: () => distance$2,
	distanceToCenter: () => distanceToCenter,
	distanceToExterior: () => distanceToExterior,
	divide: () => divide$4,
	divider: () => divider,
	dotProduct: () => dotProduct$1,
	findMinimum: () => findMinimum,
	from: () => from,
	fromNumbers: () => fromNumbers$1,
	fromString: () => fromString,
	getPointParameter: () => getPointParameter,
	getTwoPointParameters: () => getTwoPointParameters,
	guard: () => guard$7,
	guardNonZeroPoint: () => guardNonZeroPoint,
	interpolate: () => interpolate$6,
	invert: () => invert,
	isEmpty: () => isEmpty$5,
	isEqual: () => isEqual$6,
	isNaN: () => isNaN$2,
	isNull: () => isNull,
	isPlaceholder: () => isPlaceholder$3,
	isPoint: () => isPoint,
	isPoint3d: () => isPoint3d,
	leftmost: () => leftmost,
	multiply: () => multiply$3,
	multiplyScalar: () => multiplyScalar$2,
	normalise: () => normalise$1,
	normaliseByRect: () => normaliseByRect$1,
	pipeline: () => pipeline,
	pipelineApply: () => pipelineApply,
	progressBetween: () => progressBetween,
	project: () => project,
	quantiseEvery: () => quantiseEvery,
	random: () => random$2,
	random3d: () => random3d,
	reduce: () => reduce,
	relation: () => relation,
	rightmost: () => rightmost,
	rotate: () => rotate$2,
	rotatePointArray: () => rotatePointArray,
	round: () => round,
	subtract: () => subtract$3,
	sum: () => sum$5,
	to2d: () => to2d,
	to3d: () => to3d,
	toArray: () => toArray$2,
	toIntegerValues: () => toIntegerValues,
	toString: () => toString$4,
	track: () => track,
	trackPoints: () => trackPoints,
	withinRange: () => withinRange$1,
	wrap: () => wrap$4
});

//#endregion
//#region packages/geometry/src/line/multiply.ts
const multiply$1 = (line$2, point$1) => Object.freeze({
	...line$2,
	a: multiply$3(line$2.a, point$1),
	b: multiply$3(line$2.b, point$1)
});

//#endregion
//#region packages/geometry/src/line/relative-position.ts
const relativePosition$1 = (line$2, pt) => {
	const fromStart = distance$2(line$2.a, pt);
	const total$1 = length$3(line$2);
	return fromStart / total$1;
};

//#endregion
//#region packages/geometry/src/line/rotate.ts
const rotate$1 = (line$2, amountRadian, origin) => {
	if (amountRadian === void 0 || amountRadian === 0) return line$2;
	if (origin === void 0) origin = .5;
	if (typeof origin === `number`) origin = interpolate$8(origin, line$2.a, line$2.b);
	return Object.freeze({
		...line$2,
		a: rotate$2(line$2.a, amountRadian, origin),
		b: rotate$2(line$2.b, amountRadian, origin)
	});
};

//#endregion
//#region packages/geometry/src/line/subtract.ts
const subtract$1 = (line$2, point$1) => Object.freeze({
	...line$2,
	a: subtract$3(line$2.a, point$1),
	b: subtract$3(line$2.b, point$1)
});

//#endregion
//#region packages/geometry/src/line/sum.ts
const sum$3 = (line$2, point$1) => Object.freeze({
	...line$2,
	a: sum$5(line$2.a, point$1),
	b: sum$5(line$2.b, point$1)
});

//#endregion
//#region packages/geometry/src/line/to-string.ts
function toString$2(a$1, b$2) {
	if (isLine(a$1)) {
		guard$6(a$1, `a`);
		b$2 = a$1.b;
		a$1 = a$1.a;
	} else if (b$2 === void 0) throw new Error(`Expect second point if first is a point`);
	return toString$4(a$1) + `-` + toString$4(b$2);
}

//#endregion
//#region packages/geometry/src/line/index.ts
var line_exports = {};
__export(line_exports, {
	Empty: () => Empty$2,
	Placeholder: () => Placeholder$2,
	angleRadian: () => angleRadian,
	apply: () => apply$1,
	asPoints: () => asPoints,
	bbox: () => bbox$4,
	distance: () => distance$1,
	distanceSingleLine: () => distanceSingleLine,
	divide: () => divide$3,
	extendFromA: () => extendFromA,
	fromFlatArray: () => fromFlatArray$1,
	fromNumbers: () => fromNumbers$2,
	fromPivot: () => fromPivot,
	fromPoints: () => fromPoints$2,
	fromPointsToPath: () => fromPointsToPath,
	getPointParameter: () => getPointParameter$1,
	guard: () => guard$6,
	interpolate: () => interpolate$8,
	isEmpty: () => isEmpty$3,
	isEqual: () => isEqual$5,
	isLine: () => isLine,
	isPlaceholder: () => isPlaceholder$1,
	isPolyLine: () => isPolyLine,
	joinPointsToLines: () => joinPointsToLines,
	length: () => length$3,
	midpoint: () => midpoint,
	multiply: () => multiply$1,
	nearest: () => nearest$1,
	normaliseByRect: () => normaliseByRect,
	parallel: () => parallel,
	perpendicularPoint: () => perpendicularPoint,
	pointAtDistance: () => pointAtDistance,
	pointAtX: () => pointAtX,
	pointsOf: () => pointsOf,
	relativePosition: () => relativePosition$1,
	reverse: () => reverse,
	rotate: () => rotate$1,
	scaleFromMidpoint: () => scaleFromMidpoint,
	slope: () => slope,
	subtract: () => subtract$1,
	sum: () => sum$3,
	toFlatArray: () => toFlatArray,
	toPath: () => toPath$3,
	toString: () => toString$2,
	toSvgString: () => toSvgString$1,
	withinRange: () => withinRange
});
const Empty$2 = Object.freeze({
	a: Object.freeze({
		x: 0,
		y: 0
	}),
	b: Object.freeze({
		x: 0,
		y: 0
	})
});
const Placeholder$2 = Object.freeze({
	a: Object.freeze({
		x: Number.NaN,
		y: Number.NaN
	}),
	b: Object.freeze({
		x: Number.NaN,
		y: Number.NaN
	})
});
const isEmpty$3 = (l) => isEmpty$5(l.a) && isEmpty$5(l.b);
const isPlaceholder$1 = (l) => isPlaceholder$3(l.a) && isPlaceholder$3(l.b);
const apply$1 = (line$2, fn) => Object.freeze({
	...line$2,
	a: fn(line$2.a),
	b: fn(line$2.b)
});
const angleRadian = (lineOrPoint, b$2) => {
	let a$1;
	if (isLine(lineOrPoint)) {
		a$1 = lineOrPoint.a;
		b$2 = lineOrPoint.b;
	} else {
		a$1 = lineOrPoint;
		if (b$2 === void 0) throw new Error(`b point must be provided`);
	}
	return Math.atan2(b$2.y - a$1.y, b$2.x - a$1.x);
};
const normaliseByRect = (line$2, width, height$3) => Object.freeze({
	...line$2,
	a: normaliseByRect$1(line$2.a, width, height$3),
	b: normaliseByRect$1(line$2.b, width, height$3)
});
const withinRange = (line$2, point$1, maxRange) => {
	const calculatedDistance = distance$1(line$2, point$1);
	return calculatedDistance <= maxRange;
};
const slope = (lineOrPoint, b$2) => {
	let a$1;
	if (isLine(lineOrPoint)) {
		a$1 = lineOrPoint.a;
		b$2 = lineOrPoint.b;
	} else {
		a$1 = lineOrPoint;
		if (b$2 === void 0) throw new Error(`b parameter required`);
	}
	if (b$2 === void 0) throw new TypeError(`Second point missing`);
	else return (b$2.y - a$1.y) / (b$2.x - a$1.x);
};
const scaleFromMidpoint = (line$2, factor) => {
	const a$1 = interpolate$8(factor / 2, line$2);
	const b$2 = interpolate$8(.5 + factor / 2, line$2);
	return {
		a: a$1,
		b: b$2
	};
};
const pointAtX = (line$2, x) => {
	const y = line$2.a.y + (x - line$2.a.x) * slope(line$2);
	return Object.freeze({
		x,
		y
	});
};
const extendFromA = (line$2, distance$3) => {
	const calculatedLength = length$3(line$2);
	return Object.freeze({
		...line$2,
		a: line$2.a,
		b: Object.freeze({
			x: line$2.b.x + (line$2.b.x - line$2.a.x) / calculatedLength * distance$3,
			y: line$2.b.y + (line$2.b.y - line$2.a.y) / calculatedLength * distance$3
		})
	});
};
function* pointsOf(line$2) {
	const { a: a$1, b: b$2 } = line$2;
	let x0 = Math.floor(a$1.x);
	let y0 = Math.floor(a$1.y);
	const x1 = Math.floor(b$2.x);
	const y1 = Math.floor(b$2.y);
	const dx = Math.abs(x1 - x0);
	const dy = -Math.abs(y1 - y0);
	const sx = x0 < x1 ? 1 : -1;
	const sy = y0 < y1 ? 1 : -1;
	let err = dx + dy;
	while (true) {
		yield {
			x: x0,
			y: y0
		};
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
const distance$1 = (line$2, point$1) => {
	if (Array.isArray(line$2)) {
		const distances = line$2.map((l) => distanceSingleLine(l, point$1));
		return minFast(distances);
	} else return distanceSingleLine(line$2, point$1);
};
const toFlatArray = (a$1, b$2) => {
	if (isLine(a$1)) return [
		a$1.a.x,
		a$1.a.y,
		a$1.b.x,
		a$1.b.y
	];
	else if (isPoint(a$1) && isPoint(b$2)) return [
		a$1.x,
		a$1.y,
		b$2.x,
		b$2.y
	];
	else throw new Error(`Expected single line parameter, or a and b points`);
};
function* asPoints(lines) {
	for (const l of lines) {
		yield l.a;
		yield l.b;
	}
}
const toSvgString$1 = (a$1, b$2) => [`M${a$1.x} ${a$1.y} L ${b$2.x} ${b$2.y}`];

//#endregion
//#region packages/geometry/src/line/to-path.ts
const toPath$3 = (line$2) => {
	const { a: a$1, b: b$2 } = line$2;
	return Object.freeze({
		...line$2,
		length: () => length$3(a$1, b$2),
		interpolate: (amount) => interpolate$8(amount, a$1, b$2),
		relativePosition: (point$1) => relativePosition$1(line$2, point$1),
		bbox: () => bbox$4(line$2),
		toString: () => toString$2(a$1, b$2),
		toFlatArray: () => toFlatArray(a$1, b$2),
		toSvgString: () => toSvgString$1(a$1, b$2),
		toPoints: () => [a$1, b$2],
		rotate: (amountRadian, origin) => toPath$3(rotate$1(line$2, amountRadian, origin)),
		nearest: (point$1) => nearest$1(line$2, point$1),
		sum: (point$1) => toPath$3(sum$3(line$2, point$1)),
		divide: (point$1) => toPath$3(divide$3(line$2, point$1)),
		multiply: (point$1) => toPath$3(multiply$1(line$2, point$1)),
		subtract: (point$1) => toPath$3(subtract$1(line$2, point$1)),
		midpoint: () => midpoint(a$1, b$2),
		distanceToPoint: (point$1) => distanceSingleLine(line$2, point$1),
		parallel: (distance$3) => parallel(line$2, distance$3),
		perpendicularPoint: (distance$3, amount) => perpendicularPoint(line$2, distance$3, amount),
		slope: () => slope(line$2),
		withinRange: (point$1, maxRange) => withinRange(line$2, point$1, maxRange),
		isEqual: (otherLine) => isEqual$5(line$2, otherLine),
		apply: (fn) => toPath$3(apply$1(line$2, fn)),
		kind: `line`
	});
};

//#endregion
//#region packages/geometry/src/waypoint.ts
var waypoint_exports = {};
__export(waypoint_exports, {
	fromPoints: () => fromPoints$1,
	init: () => init$1
});
const fromPoints$1 = (waypoints, opts = {}) => {
	const lines = joinPointsToLines(...waypoints);
	return init$1(lines.map((l) => toPath$3(l)), opts);
};
const init$1 = (paths$1, opts = {}) => {
	const maxDistanceFromLine = opts.maxDistanceFromLine ?? .1;
	const checkUnordered = (pt) => {
		const results = paths$1.map((p$1, index) => {
			const nearest$2 = p$1.nearest(pt);
			const distance$3 = distance$2(pt, nearest$2);
			const positionRelative = p$1.relativePosition(nearest$2, maxDistanceFromLine);
			return {
				positionRelative,
				path: p$1,
				index,
				nearest: nearest$2,
				distance: distance$3,
				rank: Number.MAX_SAFE_INTEGER
			};
		});
		const filtered = results.filter((v) => v.distance <= maxDistanceFromLine);
		const sorted = sortByNumericProperty(filtered, `distance`);
		for (let rank$2 = 0; rank$2 < sorted.length; rank$2++) sorted[rank$2].rank = rank$2;
		return sorted;
	};
	return checkUnordered;
};

//#endregion
//#region packages/geometry/src/triangle/create.ts
const Empty$1 = Object.freeze({
	a: {
		x: 0,
		y: 0
	},
	b: {
		x: 0,
		y: 0
	},
	c: {
		x: 0,
		y: 0
	}
});
const Placeholder$1 = Object.freeze({
	a: {
		x: Number.NaN,
		y: Number.NaN
	},
	b: {
		x: Number.NaN,
		y: Number.NaN
	},
	c: {
		x: Number.NaN,
		y: Number.NaN
	}
});
const equilateralFromVertex = (origin, length$4 = 10, angleRadian$2 = Math.PI / 2) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const a$1 = project(origin, length$4, Math.PI - -angleRadian$2 / 2);
	const c$1 = project(origin, length$4, Math.PI - angleRadian$2 / 2);
	return {
		a: a$1,
		b: origin,
		c: c$1
	};
};

//#endregion
//#region packages/geometry/src/rect/corners.ts
const corners$1 = (rect$1, origin) => {
	const r = getRectPositioned(rect$1, origin);
	return [
		{
			x: r.x,
			y: r.y
		},
		{
			x: r.x + r.width,
			y: r.y
		},
		{
			x: r.x + r.width,
			y: r.y + r.height
		},
		{
			x: r.x,
			y: r.y + r.height
		}
	];
};

//#endregion
//#region packages/geometry/src/rect/from-top-left.ts
const fromTopLeft = (origin, width, height$3) => {
	guardDim(width, `width`);
	guardDim(height$3, `height`);
	guard$7(origin, `origin`);
	return {
		x: origin.x,
		y: origin.y,
		width,
		height: height$3
	};
};

//#endregion
//#region packages/geometry/src/shape/arrow.ts
const arrow = (origin, from$1, opts = {}) => {
	const tailLength = opts.tailLength ?? 10;
	const tailThickness = opts.tailThickness ?? Math.max(tailLength / 5, 5);
	const angleRadian$2 = opts.angleRadian ?? 0;
	const arrowSize = opts.arrowSize ?? Math.max(tailLength / 5, 15);
	const triAngle = Math.PI / 2;
	let tri;
	let tailPoints;
	if (from$1 === `tip`) {
		tri = equilateralFromVertex(origin, arrowSize, triAngle);
		tailPoints = corners$1(fromTopLeft({
			x: tri.a.x - tailLength,
			y: origin.y - tailThickness / 2
		}, tailLength, tailThickness));
	} else if (from$1 === `middle`) {
		const midX = tailLength + arrowSize / 2;
		const midY = tailThickness / 2;
		tri = equilateralFromVertex({
			x: origin.x + arrowSize * 1.2,
			y: origin.y
		}, arrowSize, triAngle);
		tailPoints = corners$1(fromTopLeft({
			x: origin.x - midX,
			y: origin.y - midY
		}, tailLength + arrowSize, tailThickness));
	} else {
		tailPoints = corners$1(fromTopLeft({
			x: origin.x,
			y: origin.y - tailThickness / 2
		}, tailLength, tailThickness));
		tri = equilateralFromVertex({
			x: origin.x + tailLength + arrowSize * .7,
			y: origin.y
		}, arrowSize, triAngle);
	}
	const arrow$1 = rotate$2([
		tailPoints[0],
		tailPoints[1],
		tri.a,
		tri.b,
		tri.c,
		tailPoints[2],
		tailPoints[3]
	], angleRadian$2, origin);
	return arrow$1;
};

//#endregion
//#region packages/geometry/src/circle/random.ts
const piPi$6 = Math.PI * 2;
const randomPoint$2 = (within, opts = {}) => {
	const offset$1 = isCirclePositioned(within) ? within : {
		x: 0,
		y: 0
	};
	const strategy = opts.strategy ?? `uniform`;
	const margin = opts.margin ?? 0;
	const radius = within.radius - margin;
	const rand = opts.randomSource ?? Math.random;
	switch (strategy) {
		case `naive`: return sum$5(offset$1, toCartesian$2(rand() * radius, rand() * piPi$6));
		case `uniform`: return sum$5(offset$1, toCartesian$2(Math.sqrt(rand()) * radius, rand() * piPi$6));
		default: throw new Error(`Unknown strategy '${strategy}'. Expects 'uniform' or 'naive'`);
	}
};

//#endregion
//#region packages/geometry/src/rect/random.ts
const random$1 = (rando) => {
	if (rando === void 0) rando = Math.random;
	return Object.freeze({
		x: rando(),
		y: rando(),
		width: rando(),
		height: rando()
	});
};
const randomPoint$1 = (within, options = {}) => {
	const rand = options.randomSource ?? Math.random;
	const margin = options.margin ?? {
		x: 0,
		y: 0
	};
	const x = rand() * (within.width - margin.x - margin.x);
	const y = rand() * (within.height - margin.y - margin.y);
	const pos = {
		x: x + margin.x,
		y: y + margin.y
	};
	return isPositioned$2(within) ? sum$5(pos, within) : Object.freeze(pos);
};

//#endregion
//#region packages/geometry/src/circle/center.ts
const center$1 = (circle$2) => {
	return isCirclePositioned(circle$2) ? Object.freeze({
		x: circle$2.x,
		y: circle$2.y
	}) : Object.freeze({
		x: circle$2.radius,
		y: circle$2.radius
	});
};

//#endregion
//#region packages/geometry/src/triangle/guard.ts
const guard$2 = (t$1, name = `t`) => {
	if (t$1 === void 0) throw new Error(`{$name} undefined`);
	guard$7(t$1.a, name + `.a`);
	guard$7(t$1.b, name + `.b`);
	guard$7(t$1.c, name + `.c`);
};
const isTriangle = (p$1) => {
	if (p$1 === void 0) return false;
	const tri = p$1;
	if (!isPoint(tri.a)) return false;
	if (!isPoint(tri.b)) return false;
	if (!isPoint(tri.c)) return false;
	return true;
};
const isEmpty$2 = (t$1) => isEmpty$5(t$1.a) && isEmpty$5(t$1.b) && isEmpty$5(t$1.c);
const isPlaceholder = (t$1) => isPlaceholder$3(t$1.a) && isPlaceholder$3(t$1.b) && isPlaceholder$3(t$1.c);
const isEqual$3 = (a$1, b$2) => isEqual$6(a$1.a, b$2.a) && isEqual$6(a$1.b, b$2.b) && isEqual$6(a$1.c, b$2.c);

//#endregion
//#region packages/geometry/src/triangle/centroid.ts
const centroid = (t$1) => {
	guard$2(t$1);
	const total$1 = reduce([
		t$1.a,
		t$1.b,
		t$1.c
	], (p$1, accumulator) => ({
		x: p$1.x + accumulator.x,
		y: p$1.y + accumulator.y
	}));
	const div = {
		x: total$1.x / 3,
		y: total$1.y / 3
	};
	return div;
};

//#endregion
//#region packages/geometry/src/shape/etc.ts
const randomPoint = (shape, opts = {}) => {
	if (isCirclePositioned(shape)) return randomPoint$2(shape, opts);
	else if (isRectPositioned(shape)) return randomPoint$1(shape, opts);
	throw new Error(`Unknown shape. Only CirclePositioned and RectPositioned are supported.`);
};
const center = (shape) => {
	if (shape === void 0) return Object.freeze({
		x: .5,
		y: .5
	});
	else if (isRect(shape)) return center$2(shape);
	else if (isTriangle(shape)) return centroid(shape);
	else if (isCircle(shape)) return center$1(shape);
	else throw new Error(`Unknown shape: ${JSON.stringify(shape)}`);
};

//#endregion
//#region packages/geometry/src/circle/is-contained-by.ts
const isContainedBy = (a$1, b$2, c$1) => {
	const d$1 = distanceCenter$1(a$1, b$2);
	if (isCircle(b$2)) return d$1 < Math.abs(a$1.radius - b$2.radius);
	else if (isPoint(b$2)) if (c$1 === void 0) return d$1 <= a$1.radius;
	else return d$1 < Math.abs(a$1.radius - c$1);
	else throw new Error(`b parameter is expected to be CirclePositioned or Point`);
};

//#endregion
//#region packages/geometry/src/circle/intersecting.ts
const isIntersecting$1 = (a$1, b$2, c$1) => {
	if (isEqual$6(a$1, b$2)) return true;
	if (isContainedBy(a$1, b$2, c$1)) return true;
	if (isCircle(b$2)) return circleCircle(a$1, b$2);
	else if (isRectPositioned(b$2)) return circleRect(a$1, b$2);
	else if (isPoint(b$2) && c$1 !== void 0) return circleCircle(a$1, {
		...b$2,
		radius: c$1
	});
	return false;
};

//#endregion
//#region packages/geometry/src/shape/is-intersecting.ts
const isIntersecting = (a$1, b$2) => {
	if (isCirclePositioned(a$1)) return isIntersecting$1(a$1, b$2);
	else if (isRectPositioned(a$1)) return isIntersecting$2(a$1, b$2);
	throw new Error(`a or b are unknown shapes. a: ${JSON.stringify(a$1)} b: ${JSON.stringify(b$2)}`);
};

//#endregion
//#region packages/geometry/src/shape/starburst.ts
const starburst = (outerRadius, points = 5, innerRadius, origin = Empty$3, opts) => {
	throwIntegerTest(points, `positive`, `points`);
	const angle = Math.PI * 2 / points;
	const angleHalf = angle / 2;
	const initialAngle = opts?.initialAngleRadian ?? -Math.PI / 2;
	if (innerRadius === void 0) innerRadius = outerRadius / 2;
	let a$1 = initialAngle;
	const pts = [];
	for (let index = 0; index < points; index++) {
		const peak = toCartesian$2(outerRadius, a$1, origin);
		const left = toCartesian$2(innerRadius, a$1 - angleHalf, origin);
		const right = toCartesian$2(innerRadius, a$1 + angleHalf, origin);
		pts.push(left, peak);
		if (index + 1 < points) pts.push(right);
		a$1 += angle;
	}
	return pts;
};

//#endregion
//#region packages/geometry/src/shape/index.ts
var shape_exports = {};
__export(shape_exports, {
	arrow: () => arrow,
	center: () => center,
	isIntersecting: () => isIntersecting,
	randomPoint: () => randomPoint,
	starburst: () => starburst
});

//#endregion
//#region packages/geometry/src/circle-packing.ts
var circle_packing_exports = {};
__export(circle_packing_exports, { random: () => random });
const random = (circles, container, opts = {}) => {
	if (!Array.isArray(circles)) throw new Error(`Parameter 'circles' is not an array`);
	const attempts = opts.attempts ?? 2e3;
	const sorted = sortByNumericProperty(circles, `radius`);
	const positionedCircles = [];
	const willHit = (b$2, radius) => positionedCircles.some((v) => isIntersecting$1(v, b$2, radius));
	while (sorted.length > 0) {
		const circle$2 = sorted.pop();
		if (!circle$2) break;
		const randomPointOpts = {
			...opts,
			margin: {
				x: circle$2.radius,
				y: circle$2.radius
			}
		};
		for (let index = 0; index < attempts; index++) {
			const position = randomPoint(container, randomPointOpts);
			if (!willHit(position, circle$2.radius)) {
				positionedCircles.push(Object.freeze({
					...circle$2,
					...position
				}));
				break;
			}
		}
	}
	return positionedCircles;
};

//#endregion
//#region packages/geometry/src/layout.ts
var layout_exports = {};
__export(layout_exports, { CirclePacking: () => circle_packing_exports });

//#endregion
//#region packages/geometry/src/circle/area.ts
const area$5 = (circle$2) => {
	guard$3(circle$2);
	return Math.PI * circle$2.radius * circle$2.radius;
};

//#endregion
//#region packages/geometry/src/rect/from-center.ts
const fromCenter$2 = (origin, width, height$3) => {
	guard$7(origin, `origin`);
	guardDim(width, `width`);
	guardDim(height$3, `height`);
	const halfW = width / 2;
	const halfH = height$3 / 2;
	return {
		x: origin.x - halfW,
		y: origin.y - halfH,
		width,
		height: height$3
	};
};

//#endregion
//#region packages/geometry/src/circle/bbox.ts
const bbox$3 = (circle$2) => {
	return isCirclePositioned(circle$2) ? fromCenter$2(circle$2, circle$2.radius * 2, circle$2.radius * 2) : {
		width: circle$2.radius * 2,
		height: circle$2.radius * 2,
		x: 0,
		y: 0
	};
};

//#endregion
//#region packages/geometry/src/circle/exterior-points.ts
function* exteriorIntegerPoints(circle$2) {
	const { x, y, radius } = circle$2;
	let xx = radius;
	let yy = 0;
	let radiusError = 1 - x;
	while (xx >= yy) {
		yield {
			x: xx + x,
			y: yy + y
		};
		yield {
			x: yy + x,
			y: xx + y
		};
		yield {
			x: -xx + x,
			y: yy + y
		};
		yield {
			x: -yy + x,
			y: xx + y
		};
		yield {
			x: -xx + x,
			y: -yy + y
		};
		yield {
			x: -yy + x,
			y: -xx + y
		};
		yield {
			x: xx + x,
			y: -yy + y
		};
		yield {
			x: yy + x,
			y: -xx + y
		};
		yy++;
		if (radiusError < 0) radiusError += 2 * yy + 1;
		else {
			xx--;
			radiusError += 2 * (yy - xx + 1);
		}
	}
}

//#endregion
//#region packages/geometry/src/circle/interior-points.ts
function* interiorIntegerPoints(circle$2) {
	const xMin = circle$2.x - circle$2.radius;
	const xMax = circle$2.x + circle$2.radius;
	const yMin = circle$2.y - circle$2.radius;
	const yMax = circle$2.y + circle$2.radius;
	for (let x = xMin; x < xMax; x++) for (let y = yMin; y < yMax; y++) {
		const r = Math.abs(distance$2(circle$2, x, y));
		if (r <= circle$2.radius) yield {
			x,
			y
		};
	}
}

//#endregion
//#region packages/geometry/src/circle/perimeter.ts
const piPi$5 = Math.PI * 2;
const nearest = (circle$2, point$1) => {
	const n$2 = (a$1) => {
		const l = Math.sqrt(Math.pow(point$1.x - a$1.x, 2) + Math.pow(point$1.y - a$1.y, 2));
		const x = a$1.x + a$1.radius * ((point$1.x - a$1.x) / l);
		const y = a$1.y + a$1.radius * ((point$1.y - a$1.y) / l);
		return {
			x,
			y
		};
	};
	if (Array.isArray(circle$2)) {
		const pts = circle$2.map((l) => n$2(l));
		const dists = pts.map((p$1) => distance$2(p$1, point$1));
		return Object.freeze(pts[minIndex(...dists)]);
	} else return Object.freeze(n$2(circle$2));
};
const pointOnPerimeter = (circle$2, angleRadian$2, origin) => {
	if (origin === void 0) origin = isCirclePositioned(circle$2) ? circle$2 : {
		x: 0,
		y: 0
	};
	return {
		x: Math.cos(-angleRadian$2) * circle$2.radius + origin.x,
		y: Math.sin(-angleRadian$2) * circle$2.radius + origin.y
	};
};
const circumference = (circle$2) => {
	guard$3(circle$2);
	return piPi$5 * circle$2.radius;
};
const length$1 = (circle$2) => circumference(circle$2);

//#endregion
//#region packages/geometry/src/circle/interpolate.ts
const piPi$4 = Math.PI * 2;
const interpolate$5 = (circle$2, t$1) => pointOnPerimeter(circle$2, t$1 * piPi$4);

//#endregion
//#region packages/geometry/src/circle/multiply.ts
function multiplyScalar$1(a$1, value) {
	if (isCirclePositioned(a$1)) {
		const pt = multiplyScalar$2(a$1, value);
		return Object.freeze({
			...a$1,
			...pt,
			radius: a$1.radius * value
		});
	} else return Object.freeze({
		...a$1,
		radius: a$1.radius * value
	});
}

//#endregion
//#region packages/geometry/src/circle/svg.ts
const toSvg$1 = (a$1, sweep, origin) => {
	if (isCircle(a$1)) {
		if (origin !== void 0) return toSvgFull$1(a$1.radius, origin, sweep);
		if (isCirclePositioned(a$1)) return toSvgFull$1(a$1.radius, a$1, sweep);
		else throw new Error(`origin parameter needed for non-positioned circle`);
	} else if (origin === void 0) throw new Error(`origin parameter needed`);
	else return toSvgFull$1(a$1, origin, sweep);
};
const toSvgFull$1 = (radius, origin, sweep) => {
	const { x, y } = origin;
	const s = sweep ? `1` : `0`;
	return `
    M ${x}, ${y}
    m -${radius}, 0
    a ${radius},${radius} 0 1,${s} ${radius * 2},0
    a ${radius},${radius} 0 1,${s} -${radius * 2},0
  `.split(`\n`);
};

//#endregion
//#region packages/geometry/src/circle/to-path.ts
const toPath$2 = (circle$2) => {
	guard$3(circle$2);
	return {
		...circle$2,
		nearest: (point$1) => nearest(circle$2, point$1),
		interpolate: (t$1) => interpolate$5(circle$2, t$1),
		bbox: () => bbox$3(circle$2),
		length: () => circumference(circle$2),
		toSvgString: (sweep = true) => toSvg$1(circle$2, sweep),
		relativePosition: (_point, _intersectionThreshold) => {
			throw new Error(`Not implemented`);
		},
		distanceToPoint: (_point) => {
			throw new Error(`Not implemented`);
		},
		kind: `circular`
	};
};

//#endregion
//#region packages/geometry/src/circle/to-positioned.ts
const toPositioned = (circle$2, defaultPositionOrX, y) => {
	if (isCirclePositioned(circle$2)) return circle$2;
	const pt = getPointParameter(defaultPositionOrX, y);
	return Object.freeze({
		...circle$2,
		...pt
	});
};

//#endregion
//#region packages/geometry/src/circle/index.ts
var circle_exports = {};
__export(circle_exports, {
	area: () => area$5,
	bbox: () => bbox$3,
	center: () => center$1,
	circumference: () => circumference,
	distanceCenter: () => distanceCenter$1,
	distanceFromExterior: () => distanceFromExterior$1,
	exteriorIntegerPoints: () => exteriorIntegerPoints,
	guard: () => guard$3,
	guardPositioned: () => guardPositioned,
	interiorIntegerPoints: () => interiorIntegerPoints,
	interpolate: () => interpolate$5,
	intersectionLine: () => intersectionLine,
	intersections: () => intersections,
	isCircle: () => isCircle,
	isCirclePositioned: () => isCirclePositioned,
	isContainedBy: () => isContainedBy,
	isEqual: () => isEqual$4,
	isIntersecting: () => isIntersecting$1,
	isNaN: () => isNaN$1,
	isPositioned: () => isPositioned$1,
	length: () => length$1,
	multiplyScalar: () => multiplyScalar$1,
	nearest: () => nearest,
	pointOnPerimeter: () => pointOnPerimeter,
	randomPoint: () => randomPoint$2,
	toPath: () => toPath$2,
	toPositioned: () => toPositioned,
	toSvg: () => toSvg$1
});

//#endregion
//#region packages/geometry/src/rect/area.ts
const area$4 = (rect$1) => {
	guard$5(rect$1);
	return rect$1.height * rect$1.width;
};

//#endregion
//#region packages/geometry/src/rect/apply.ts
function applyFields(op, rectOrWidth, heightValue) {
	let width = typeof rectOrWidth === `number` ? rectOrWidth : rectOrWidth.width;
	let height$3 = typeof rectOrWidth === `number` ? heightValue : rectOrWidth.height;
	if (width === void 0) throw new Error(`Param 'width' undefined`);
	if (height$3 === void 0) throw new Error(`Param 'height' undefined`);
	width = op(width, `width`);
	height$3 = op(height$3, `height`);
	if (typeof rectOrWidth === `object`) if (isPositioned$2(rectOrWidth)) {
		const x = op(rectOrWidth.x, `x`);
		const y = op(rectOrWidth.y, `y`);
		return {
			...rectOrWidth,
			width,
			height: height$3,
			x,
			y
		};
	} else return {
		...rectOrWidth,
		width,
		height: height$3
	};
	return {
		width,
		height: height$3
	};
}
function applyMerge(op, a$1, b$2, c$1) {
	guard$5(a$1, `a`);
	if (isRect(b$2)) return isRectPositioned(a$1) ? Object.freeze({
		...a$1,
		x: op(a$1.x, b$2.width),
		y: op(a$1.y, b$2.height),
		width: op(a$1.width, b$2.width),
		height: op(a$1.height, b$2.height)
	}) : Object.freeze({
		...a$1,
		width: op(a$1.width, b$2.width),
		height: op(a$1.height, b$2.height)
	});
	else {
		if (typeof b$2 !== `number`) throw new TypeError(`Expected second parameter of type Rect or number. Got ${JSON.stringify(b$2)}`);
		if (typeof c$1 !== `number`) throw new Error(`Expected third param as height. Got ${JSON.stringify(c$1)}`);
		return isRectPositioned(a$1) ? Object.freeze({
			...a$1,
			x: op(a$1.x, b$2),
			y: op(a$1.y, c$1),
			width: op(a$1.width, b$2),
			height: op(a$1.height, c$1)
		}) : Object.freeze({
			...a$1,
			width: op(a$1.width, b$2),
			height: op(a$1.height, c$1)
		});
	}
}
function applyScalar(op, rect$1, parameter) {
	return isPositioned$2(rect$1) ? Object.freeze({
		...rect$1,
		x: op(rect$1.x, parameter),
		y: op(rect$1.y, parameter),
		width: op(rect$1.width, parameter),
		height: op(rect$1.height, parameter)
	}) : Object.freeze({
		...rect$1,
		width: op(rect$1.width, parameter),
		height: op(rect$1.height, parameter)
	});
}
function applyDim(op, rect$1, parameter) {
	return Object.freeze({
		...rect$1,
		width: op(rect$1.width, parameter),
		height: op(rect$1.height, parameter)
	});
}

//#endregion
//#region packages/geometry/src/rect/cardinal.ts
const cardinal = (rect$1, card) => {
	const { x, y, width, height: height$3 } = rect$1;
	switch (card) {
		case `nw`: return Object.freeze({
			x,
			y
		});
		case `n`: return Object.freeze({
			x: x + width / 2,
			y
		});
		case `ne`: return Object.freeze({
			x: x + width,
			y
		});
		case `sw`: return Object.freeze({
			x,
			y: y + height$3
		});
		case `s`: return Object.freeze({
			x: x + width / 2,
			y: y + height$3
		});
		case `se`: return Object.freeze({
			x: x + width,
			y: y + height$3
		});
		case `w`: return Object.freeze({
			x,
			y: y + height$3 / 2
		});
		case `e`: return Object.freeze({
			x: x + width,
			y: y + height$3 / 2
		});
		case `center`: return Object.freeze({
			x: x + width / 2,
			y: y + height$3 / 2
		});
		default: throw new Error(`Unknown direction: ${card}`);
	}
};

//#endregion
//#region packages/geometry/src/rect/divide.ts
const divideOp = (a$1, b$2) => a$1 / b$2;
function divide(a$1, b$2, c$1) {
	return applyMerge(divideOp, a$1, b$2, c$1);
}
function divideScalar(rect$1, amount) {
	return applyScalar(divideOp, rect$1, amount);
}
function divideDim(rect$1, amount) {
	return applyDim(divideOp, rect$1, amount);
}

//#endregion
//#region packages/geometry/src/rect/edges.ts
const edges$1 = (rect$1, origin) => {
	const c$1 = corners$1(rect$1, origin);
	return joinPointsToLines(...c$1, c$1[0]);
};
const getEdgeX = (rect$1, edge) => {
	guard$5(rect$1);
	switch (edge) {
		case `top`: return isPoint(rect$1) ? rect$1.x : 0;
		case `bottom`: return isPoint(rect$1) ? rect$1.x : 0;
		case `left`: return isPoint(rect$1) ? rect$1.y : 0;
		case `right`: return isPoint(rect$1) ? rect$1.x + rect$1.width : rect$1.width;
	}
};
const getEdgeY = (rect$1, edge) => {
	guard$5(rect$1);
	switch (edge) {
		case `top`: return isPoint(rect$1) ? rect$1.y : 0;
		case `bottom`: return isPoint(rect$1) ? rect$1.y + rect$1.height : rect$1.height;
		case `left`: return isPoint(rect$1) ? rect$1.y : 0;
		case `right`: return isPoint(rect$1) ? rect$1.y : 0;
	}
};

//#endregion
//#region packages/geometry/src/rect/empty.ts
const Empty = Object.freeze({
	width: 0,
	height: 0
});
const EmptyPositioned = Object.freeze({
	x: 0,
	y: 0,
	width: 0,
	height: 0
});

//#endregion
//#region packages/geometry/src/rect/encompass.ts
const encompass = (rect$1, ...points) => {
	const x = points.map((p$1) => p$1.x);
	const y = points.map((p$1) => p$1.y);
	let minX = Math.min(...x, rect$1.x);
	let minY = Math.min(...y, rect$1.y);
	let maxX = Math.max(...x, rect$1.x + rect$1.width);
	let maxY = Math.max(...y, rect$1.y + rect$1.height);
	let rectW = Math.max(rect$1.width, maxX - minX);
	let rectH = Math.max(rect$1.height, maxY - minY);
	return Object.freeze({
		...rect$1,
		x: minX,
		y: minY,
		width: rectW,
		height: rectH
	});
};

//#endregion
//#region packages/geometry/src/rect/from-element.ts
const fromElement = (el) => ({
	width: el.clientWidth,
	height: el.clientHeight
});

//#endregion
//#region packages/geometry/src/rect/from-numbers.ts
function fromNumbers(xOrWidth, yOrHeight, width, height$3) {
	if (width === void 0 || height$3 === void 0) {
		if (typeof xOrWidth !== `number`) throw new Error(`width is not an number`);
		if (typeof yOrHeight !== `number`) throw new TypeError(`height is not an number`);
		return Object.freeze({
			width: xOrWidth,
			height: yOrHeight
		});
	}
	if (typeof xOrWidth !== `number`) throw new Error(`x is not an number`);
	if (typeof yOrHeight !== `number`) throw new Error(`y is not an number`);
	if (typeof width !== `number`) throw new Error(`width is not an number`);
	if (typeof height$3 !== `number`) throw new Error(`height is not an number`);
	return Object.freeze({
		x: xOrWidth,
		y: yOrHeight,
		width,
		height: height$3
	});
}

//#endregion
//#region packages/geometry/src/rect/get-rect-positionedparameter.ts
function getRectPositionedParameter(a$1, b$2, c$1, d$1) {
	if (typeof a$1 === `number`) if (typeof b$2 === `number`) if (typeof c$1 === `number` && typeof d$1 === `number`) return {
		x: a$1,
		y: b$2,
		width: c$1,
		height: d$1
	};
	else if (isRect(c$1)) return {
		x: a$1,
		y: b$2,
		width: c$1.width,
		height: c$1.height
	};
	else throw new TypeError(`If params 'a' & 'b' are numbers, expect following parameters to be x,y or Rect`);
	else throw new TypeError(`If parameter 'a' is a number, expect following parameters to be: y,w,h`);
	else if (isRectPositioned(a$1)) return a$1;
	else if (isRect(a$1)) if (typeof b$2 === `number` && typeof c$1 === `number`) return {
		width: a$1.width,
		height: a$1.height,
		x: b$2,
		y: c$1
	};
	else if (isPoint(b$2)) return {
		width: a$1.width,
		height: a$1.height,
		x: b$2.x,
		y: b$2.y
	};
	else throw new TypeError(`If param 'a' is a Rect, expects following parameters to be x,y`);
	else if (isPoint(a$1)) if (typeof b$2 === `number` && typeof c$1 === `number`) return {
		x: a$1.x,
		y: a$1.y,
		width: b$2,
		height: c$1
	};
	else if (isRect(b$2)) return {
		x: a$1.x,
		y: a$1.y,
		width: b$2.width,
		height: b$2.height
	};
	else throw new TypeError(`If parameter 'a' is a Point, expect following params to be: Rect or width,height`);
	throw new TypeError(`Expect a first parameter to be x,RectPositioned,Rect or Point`);
}

//#endregion
//#region packages/geometry/src/rect/is-equal.ts
const isEqualSize = (a$1, b$2) => {
	if (a$1 === void 0) throw new Error(`a undefined`);
	if (b$2 === void 0) throw new Error(`b undefined`);
	return a$1.width === b$2.width && a$1.height === b$2.height;
};
const isEqual$2 = (a$1, b$2) => {
	if (isPositioned$2(a$1) && isPositioned$2(b$2)) {
		if (!isEqual$6(a$1, b$2)) return false;
		return a$1.width === b$2.width && a$1.height === b$2.height;
	} else if (!isPositioned$2(a$1) && !isPositioned$2(b$2)) return a$1.width === b$2.width && a$1.height === b$2.height;
	else return false;
};

//#endregion
//#region packages/geometry/src/rect/lengths.ts
const lengths$1 = (rect$1) => {
	guardPositioned$1(rect$1, `rect`);
	return edges$1(rect$1).map((l) => length$3(l));
};

//#endregion
//#region packages/geometry/src/rect/multiply.ts
const multiplyOp = (a$1, b$2) => a$1 * b$2;
function multiply(a$1, b$2, c$1) {
	return applyMerge(multiplyOp, a$1, b$2, c$1);
}
function multiplyScalar(rect$1, amount) {
	return applyScalar(multiplyOp, rect$1, amount);
}
function multiplyDim(rect$1, amount) {
	return applyDim(multiplyOp, rect$1, amount);
}

//#endregion
//#region packages/geometry/src/rect/nearest.ts
const nearestInternal = (rect$1, p$1) => {
	let { x, y } = p$1;
	if (x < rect$1.x) x = rect$1.x;
	else if (x > rect$1.x + rect$1.width) x = rect$1.x + rect$1.width;
	if (y < rect$1.y) y = rect$1.y;
	else if (y > rect$1.y + rect$1.height) y = rect$1.y + rect$1.height;
	return Object.freeze({
		...p$1,
		x,
		y
	});
};

//#endregion
//#region packages/geometry/src/rect/placeholder.ts
const Placeholder = Object.freeze({
	width: Number.NaN,
	height: Number.NaN
});
const PlaceholderPositioned = Object.freeze({
	x: Number.NaN,
	y: Number.NaN,
	width: Number.NaN,
	height: Number.NaN
});

//#endregion
//#region packages/geometry/src/rect/perimeter.ts
const perimeter$4 = (rect$1) => {
	guard$5(rect$1);
	return rect$1.height + rect$1.height + rect$1.width + rect$1.width;
};

//#endregion
//#region packages/geometry/src/rect/normalise-by-rect.ts
const dividerByLargestDimension = (rect$1) => {
	const largest = Math.max(rect$1.width, rect$1.height);
	return (value) => {
		if (typeof value === `number`) return value / largest;
		else if (isPoint3d(value)) return Object.freeze({
			...value,
			x: value.x / largest,
			y: value.y / largest,
			z: value.x / largest
		});
		else if (isPoint(value)) return Object.freeze({
			...value,
			x: value.x / largest,
			y: value.y / largest
		});
		else throw new Error(`Param 'value' is neither number nor Point`);
	};
};

//#endregion
//#region packages/geometry/src/rect/subtract.ts
const subtractOp = (a$1, b$2) => a$1 - b$2;
function subtract(a$1, b$2, c$1) {
	return applyMerge(subtractOp, a$1, b$2, c$1);
}
function subtractSize(a$1, b$2, c$1) {
	const w = typeof b$2 === `number` ? b$2 : b$2.width;
	const h = typeof b$2 === `number` ? c$1 : b$2.height;
	if (h === void 0) throw new Error(`Expected height as third parameter`);
	const r = {
		...a$1,
		width: a$1.width - w,
		height: a$1.height - h
	};
	return r;
}
function subtractOffset(a$1, b$2) {
	let x = 0;
	let y = 0;
	if (isPositioned$2(a$1)) {
		x = a$1.x;
		y = a$1.y;
	}
	let xB = 0;
	let yB = 0;
	if (isPositioned$2(b$2)) {
		xB = b$2.x;
		yB = b$2.y;
	}
	return Object.freeze({
		...a$1,
		x: x - xB,
		y: y - yB,
		width: a$1.width - b$2.width,
		height: a$1.height - b$2.height
	});
}

//#endregion
//#region packages/geometry/src/rect/sum.ts
const sumOp = (a$1, b$2) => a$1 + b$2;
function sum$2(a$1, b$2, c$1) {
	return applyMerge(sumOp, a$1, b$2, c$1);
}
function sumOffset(a$1, b$2) {
	let x = 0;
	let y = 0;
	if (isPositioned$2(a$1)) {
		x = a$1.x;
		y = a$1.y;
	}
	let xB = 0;
	let yB = 0;
	if (isPositioned$2(b$2)) {
		xB = b$2.x;
		yB = b$2.y;
	}
	return Object.freeze({
		...a$1,
		x: x + xB,
		y: y + yB,
		width: a$1.width + b$2.width,
		height: a$1.height + b$2.height
	});
}

//#endregion
//#region packages/geometry/src/rect/to-array.ts
function toArray$1(rect$1) {
	if (isPositioned$2(rect$1)) return [
		rect$1.x,
		rect$1.y,
		rect$1.width,
		rect$1.height
	];
	else if (isRect(rect$1)) return [rect$1.width, rect$1.height];
	else throw new Error(`Param 'rect' is not a rectangle. Got: ${JSON.stringify(rect$1)}`);
}

//#endregion
//#region packages/geometry/src/rect/index.ts
var rect_exports = {};
__export(rect_exports, {
	Empty: () => Empty,
	EmptyPositioned: () => EmptyPositioned,
	Placeholder: () => Placeholder,
	PlaceholderPositioned: () => PlaceholderPositioned,
	applyDim: () => applyDim,
	applyFields: () => applyFields,
	applyMerge: () => applyMerge,
	applyScalar: () => applyScalar,
	area: () => area$4,
	cardinal: () => cardinal,
	center: () => center$2,
	corners: () => corners$1,
	distanceFromCenter: () => distanceFromCenter,
	distanceFromExterior: () => distanceFromExterior,
	divide: () => divide,
	divideDim: () => divideDim,
	divideScalar: () => divideScalar,
	dividerByLargestDimension: () => dividerByLargestDimension,
	edges: () => edges$1,
	encompass: () => encompass,
	fromCenter: () => fromCenter$2,
	fromElement: () => fromElement,
	fromNumbers: () => fromNumbers,
	fromTopLeft: () => fromTopLeft,
	getEdgeX: () => getEdgeX,
	getEdgeY: () => getEdgeY,
	getRectPositioned: () => getRectPositioned,
	getRectPositionedParameter: () => getRectPositionedParameter,
	guard: () => guard$5,
	guardDim: () => guardDim,
	guardPositioned: () => guardPositioned$1,
	intersectsPoint: () => intersectsPoint,
	isEmpty: () => isEmpty$4,
	isEqual: () => isEqual$2,
	isEqualSize: () => isEqualSize,
	isIntersecting: () => isIntersecting$2,
	isPlaceholder: () => isPlaceholder$2,
	isPositioned: () => isPositioned$2,
	isRect: () => isRect,
	isRectPositioned: () => isRectPositioned,
	lengths: () => lengths$1,
	maxFromCorners: () => maxFromCorners,
	multiply: () => multiply,
	multiplyDim: () => multiplyDim,
	multiplyScalar: () => multiplyScalar,
	nearestInternal: () => nearestInternal,
	perimeter: () => perimeter$4,
	random: () => random$1,
	randomPoint: () => randomPoint$1,
	subtract: () => subtract,
	subtractOffset: () => subtractOffset,
	subtractSize: () => subtractSize,
	sum: () => sum$2,
	sumOffset: () => sumOffset,
	toArray: () => toArray$1
});

//#endregion
//#region packages/geometry/src/bezier/guard.ts
const isQuadraticBezier = (path) => path.quadratic !== void 0;
const isCubicBezier = (path) => path.cubic1 !== void 0 && path.cubic2 !== void 0;

//#endregion
//#region packages/geometry/src/path/start-end.ts
const getStart = function(path) {
	if (isQuadraticBezier(path)) return path.a;
	else if (isLine(path)) return path.a;
	else throw new Error(`Unknown path type ${JSON.stringify(path)}`);
};
const getEnd = function(path) {
	if (isQuadraticBezier(path)) return path.b;
	else if (isLine(path)) return path.b;
	else throw new Error(`Unknown path type ${JSON.stringify(path)}`);
};

//#endregion
//#region packages/geometry/src/path/compound-path.ts
var compound_path_exports = {};
__export(compound_path_exports, {
	bbox: () => bbox$2,
	computeDimensions: () => computeDimensions,
	distanceToPoint: () => distanceToPoint,
	fromPaths: () => fromPaths,
	guardContinuous: () => guardContinuous,
	interpolate: () => interpolate$4,
	relativePosition: () => relativePosition,
	setSegment: () => setSegment,
	toString: () => toString$1,
	toSvgString: () => toSvgString
});
const setSegment = (compoundPath, index, path) => {
	const existing = [...compoundPath.segments];
	existing[index] = path;
	return fromPaths(...existing);
};
const interpolate$4 = (paths$1, t$1, useWidth, dimensions) => {
	if (dimensions === void 0) dimensions = computeDimensions(paths$1);
	const expected = t$1 * (useWidth ? dimensions.totalWidth : dimensions.totalLength);
	let soFar = 0;
	const l = useWidth ? dimensions.widths : dimensions.lengths;
	for (const [index, element] of l.entries()) if (soFar + element >= expected) {
		const relative$1 = expected - soFar;
		let amt = relative$1 / element;
		if (amt > 1) amt = 1;
		return paths$1[index].interpolate(amt);
	} else soFar += element;
	return {
		x: 0,
		y: 0
	};
};
const distanceToPoint = (paths$1, point$1) => {
	if (paths$1.length === 0) return 0;
	let distances = paths$1.map((p$1, index) => ({
		path: p$1,
		index,
		distance: p$1.distanceToPoint(point$1)
	}));
	distances = sortByNumericProperty(distances, `distance`);
	if (distances.length === 0) throw new Error(`Could not look up distances`);
	return distances[0].distance;
};
const relativePosition = (paths$1, point$1, intersectionThreshold, dimensions) => {
	if (dimensions === void 0) dimensions = computeDimensions(paths$1);
	let distances = paths$1.map((p$1, index) => ({
		path: p$1,
		index,
		distance: p$1.distanceToPoint(point$1)
	}));
	distances = sortByNumericProperty(distances, `distance`);
	if (distances.length < 0) throw new Error(`Point does not intersect with path`);
	const d$1 = distances[0];
	if (d$1.distance > intersectionThreshold) throw new Error(`Point does not intersect with path. Minimum distance: ${d$1.distance}, threshold: ${intersectionThreshold}`);
	const relativePositionOnPath = d$1.path.relativePosition(point$1, intersectionThreshold);
	let accumulated = 0;
	for (let index = 0; index < d$1.index; index++) accumulated += dimensions.lengths[index];
	accumulated += dimensions.lengths[d$1.index] * relativePositionOnPath;
	const accumulatedRel = accumulated / dimensions.totalLength;
	console.log(`acc: ${accumulated} rel: ${accumulatedRel} on path: ${relativePositionOnPath} path: ${d$1.index}`);
	return accumulatedRel;
};
const computeDimensions = (paths$1) => {
	const widths = paths$1.map((l) => l.bbox().width);
	const lengths$2 = paths$1.map((l) => l.length());
	let totalLength = 0;
	let totalWidth = 0;
	for (const length$4 of lengths$2) totalLength += length$4;
	for (const width of widths) totalWidth += width;
	return {
		totalLength,
		totalWidth,
		widths,
		lengths: lengths$2
	};
};
const bbox$2 = (paths$1) => {
	const boxes = paths$1.map((p$1) => p$1.bbox());
	const corners$2 = boxes.flatMap((b$2) => corners$1(b$2));
	return bbox$5(...corners$2);
};
const toString$1 = (paths$1) => paths$1.map((p$1) => p$1.toString()).join(`, `);
const guardContinuous = (paths$1) => {
	let lastPos = getEnd(paths$1[0]);
	for (let index = 1; index < paths$1.length; index++) {
		const start = getStart(paths$1[index]);
		if (!isEqual$6(start, lastPos)) throw new Error(`Path index ${index} does not start at prior path end. Start: ${start.x},${start.y} expected: ${lastPos.x},${lastPos.y}`);
		lastPos = getEnd(paths$1[index]);
	}
};
const toSvgString = (paths$1) => paths$1.flatMap((p$1) => p$1.toSvgString());
const fromPaths = (...paths$1) => {
	guardContinuous(paths$1);
	const dims = computeDimensions(paths$1);
	return Object.freeze({
		segments: paths$1,
		length: () => dims.totalLength,
		nearest: (_) => {
			throw new Error(`not implemented`);
		},
		interpolate: (t$1, useWidth = false) => interpolate$4(paths$1, t$1, useWidth, dims),
		relativePosition: (point$1, intersectionThreshold) => relativePosition(paths$1, point$1, intersectionThreshold, dims),
		distanceToPoint: (point$1) => distanceToPoint(paths$1, point$1),
		bbox: () => bbox$2(paths$1),
		toString: () => toString$1(paths$1),
		toSvgString: () => toSvgString(paths$1),
		kind: `compound`
	});
};

//#endregion
//#region packages/geometry/src/path/index.ts
var path_exports = {};
__export(path_exports, {
	bbox: () => bbox$2,
	computeDimensions: () => computeDimensions,
	distanceToPoint: () => distanceToPoint,
	fromPaths: () => fromPaths,
	getEnd: () => getEnd,
	getStart: () => getStart,
	guardContinuous: () => guardContinuous,
	interpolate: () => interpolate$4,
	relativePosition: () => relativePosition,
	setSegment: () => setSegment,
	toString: () => toString$1,
	toSvgString: () => toSvgString
});

//#endregion
//#region packages/geometry/src/grid/inside.ts
const inside = (grid$1, cell) => {
	if (cell.x < 0 || cell.y < 0) return false;
	if (cell.x >= grid$1.cols || cell.y >= grid$1.rows) return false;
	return true;
};

//#endregion
//#region packages/geometry/src/grid/guards.ts
const isCell = (cell) => {
	if (cell === void 0) return false;
	return `x` in cell && `y` in cell;
};
const guardCell = (cell, parameterName = `Param`, grid$1) => {
	if (cell === void 0) throw new Error(parameterName + ` is undefined. Expecting {x,y}`);
	if (cell.x === void 0) throw new Error(parameterName + `.x is undefined`);
	if (cell.y === void 0) throw new Error(parameterName + `.y is undefined`);
	if (Number.isNaN(cell.x)) throw new Error(parameterName + `.x is NaN`);
	if (Number.isNaN(cell.y)) throw new Error(parameterName + `.y is NaN`);
	if (!Number.isInteger(cell.x)) throw new TypeError(parameterName + `.x is non-integer`);
	if (!Number.isInteger(cell.y)) throw new TypeError(parameterName + `.y is non-integer`);
	if (grid$1 !== void 0 && !inside(grid$1, cell)) throw new Error(`${parameterName} is outside of grid. Cell: ${cell.x},${cell.y} Grid: ${grid$1.cols}, ${grid$1.rows}`);
};
const guardGrid = (grid$1, parameterName = `Param`) => {
	if (grid$1 === void 0) throw new Error(`${parameterName} is undefined. Expecting grid.`);
	if (!(`rows` in grid$1)) throw new Error(`${parameterName}.rows is undefined`);
	if (!(`cols` in grid$1)) throw new Error(`${parameterName}.cols is undefined`);
	if (!Number.isInteger(grid$1.rows)) throw new TypeError(`${parameterName}.rows is not an integer`);
	if (!Number.isInteger(grid$1.cols)) throw new TypeError(`${parameterName}.cols is not an integer`);
};

//#endregion
//#region packages/geometry/src/grid/apply-bounds.ts
const applyBounds = function(grid$1, cell, wrap$6 = `undefined`) {
	guardGrid(grid$1, `grid`);
	guardCell(cell, `cell`);
	let x = cell.x;
	let y = cell.y;
	switch (wrap$6) {
		case `wrap`: {
			x = x % grid$1.cols;
			y = y % grid$1.rows;
			if (x < 0) x = grid$1.cols + x;
			else if (x >= grid$1.cols) x -= grid$1.cols;
			if (y < 0) y = grid$1.rows + y;
			else if (y >= grid$1.rows) y -= grid$1.rows;
			x = Math.abs(x);
			y = Math.abs(y);
			break;
		}
		case `stop`: {
			x = clampIndex(x, grid$1.cols);
			y = clampIndex(y, grid$1.rows);
			break;
		}
		case `undefined`: {
			if (x < 0 || y < 0) return;
			if (x >= grid$1.cols || y >= grid$1.rows) return;
			break;
		}
		case `unbounded`: break;
		default: throw new Error(`Unknown BoundsLogic '${wrap$6}'. Expected: wrap, stop, undefined or unbounded`);
	}
	return Object.freeze({
		x,
		y
	});
};

//#endregion
//#region packages/geometry/src/grid/array-1d.ts
var array_1d_exports = {};
__export(array_1d_exports, {
	access: () => access$1,
	createArray: () => createArray,
	createMutable: () => createMutable,
	set: () => set$3,
	setMutate: () => setMutate$1,
	wrap: () => wrap$3,
	wrapMutable: () => wrapMutable$1
});
const access$1 = (array$2, cols) => {
	const grid$1 = gridFromArrayDimensions(array$2, cols);
	const fn = (cell, wrap$6 = `undefined`) => accessWithGrid$1(grid$1, array$2, cell, wrap$6);
	return fn;
};
const accessWithGrid$1 = (grid$1, array$2, cell, wrap$6) => {
	const index = indexFromCell(grid$1, cell, wrap$6);
	if (index === void 0) return void 0;
	return array$2[index];
};
const setMutate$1 = (array$2, cols) => {
	const grid$1 = gridFromArrayDimensions(array$2, cols);
	return (value, cell, wrap$6 = `undefined`) => setMutateWithGrid$1(grid$1, array$2, value, cell, wrap$6);
};
const setMutateWithGrid$1 = (grid$1, array$2, value, cell, wrap$6) => {
	const index = indexFromCell(grid$1, cell, wrap$6);
	if (index === void 0) throw new RangeError(`Cell (${cell.x},${cell.y}) is out of range of grid cols: ${grid$1.cols} rows: ${grid$1.rows}`);
	array$2[index] = value;
	return array$2;
};
const set$3 = (array$2, cols) => {
	const grid$1 = gridFromArrayDimensions(array$2, cols);
	return (value, cell, wrap$6) => setWithGrid$1(grid$1, array$2, value, cell, wrap$6);
};
const setWithGrid$1 = (grid$1, array$2, value, cell, wrap$6) => {
	const index = indexFromCell(grid$1, cell, wrap$6);
	if (index === void 0) throw new RangeError(`Cell (${cell.x},${cell.y}) is out of range of grid cols: ${grid$1.cols} rows: ${grid$1.rows}`);
	let copy = [...array$2];
	copy[index] = value;
	array$2 = copy;
	return copy;
};
/**
* Creates a {@link Grid} from the basis of an array and a given number of columns
* @param array 
* @param cols 
* @returns 
*/
const gridFromArrayDimensions = (array$2, cols) => {
	const grid$1 = {
		cols,
		rows: Math.ceil(array$2.length / cols)
	};
	return grid$1;
};
const wrapMutable$1 = (array$2, cols) => {
	const grid$1 = gridFromArrayDimensions(array$2, cols);
	return {
		...grid$1,
		get: access$1(array$2, cols),
		set: setMutate$1(array$2, cols),
		get array() {
			return array$2;
		}
	};
};
const wrap$3 = (array$2, cols) => {
	const grid$1 = gridFromArrayDimensions(array$2, cols);
	return {
		...grid$1,
		get: (cell, boundsLogic = `undefined`) => accessWithGrid$1(grid$1, array$2, cell, boundsLogic),
		set: (value, cell, boundsLogic = `undefined`) => {
			array$2 = setWithGrid$1(grid$1, array$2, value, cell, boundsLogic);
			return wrap$3(array$2, cols);
		},
		get array() {
			return array$2;
		}
	};
};
const createArray = (initialValue, rowsOrGrid, columns$1) => {
	const rows$1 = typeof rowsOrGrid === `number` ? rowsOrGrid : rowsOrGrid.rows;
	const cols = typeof rowsOrGrid === `object` ? rowsOrGrid.cols : columns$1;
	if (!cols) throw new Error(`Parameter 'columns' missing`);
	throwIntegerTest(rows$1, `aboveZero`, `rows`);
	throwIntegerTest(cols, `aboveZero`, `cols`);
	let t$1 = [];
	let total$1 = rows$1 * cols;
	for (let i = 0; i < total$1; i++) t$1[i] = initialValue;
	return t$1;
};
const createMutable = (initialValue, rowsOrGrid, columns$1) => {
	const rows$1 = typeof rowsOrGrid === `number` ? rowsOrGrid : rowsOrGrid.rows;
	const cols = typeof rowsOrGrid === `object` ? rowsOrGrid.cols : columns$1;
	if (!cols) throw new Error(`Parameter 'columns' missing`);
	const arr = createArray(initialValue, rows$1, cols);
	return wrapMutable$1(arr, cols);
};

//#endregion
//#region packages/geometry/src/grid/array-2d.ts
var array_2d_exports = {};
__export(array_2d_exports, {
	access: () => access,
	create: () => create$2,
	set: () => set$2,
	setMutate: () => setMutate,
	wrap: () => wrap$2,
	wrapMutable: () => wrapMutable
});
const create$2 = (array$2) => {
	let colLen = NaN;
	for (const row of array$2) if (Number.isNaN(colLen)) colLen = row.length;
	else if (colLen !== row.length) throw new Error(`Array does not have uniform column length`);
	return {
		rows: array$2.length,
		cols: colLen
	};
};
const setMutate = (array$2) => {
	const grid$1 = create$2(array$2);
	return (value, cell, wrap$6 = `undefined`) => setMutateWithGrid(grid$1, array$2, value, cell, wrap$6);
};
/**
* Returns a function that updates a 2D array representation
* of a grid. Array is mutated.
*
* ```js
* const m = Grids.Array2d.setMutateWithGrid(grid, array);
* m(someValue, { x:2, y:3 });
* ```
* @param grid
* @param array
* @returns
*/
const setMutateWithGrid = (grid$1, array$2, value, cell, bounds) => {
	let boundCell = applyBounds(grid$1, cell, bounds);
	if (boundCell === void 0) throw new RangeError(`Cell (${cell.x},${cell.y}) is out of range of grid cols: ${grid$1.cols} rows: ${grid$1.rows}`);
	array$2[boundCell.y][boundCell.x] = value;
	return array$2;
};
const access = (array$2) => {
	const grid$1 = create$2(array$2);
	const fn = (cell, wrap$6 = `undefined`) => accessWithGrid(grid$1, array$2, cell, wrap$6);
	return fn;
};
const accessWithGrid = (grid$1, array$2, cell, wrap$6) => {
	let boundCell = applyBounds(grid$1, cell, wrap$6);
	if (boundCell === void 0) return void 0;
	return array$2[boundCell.y][boundCell.x];
};
const wrapMutable = (array$2) => {
	const grid$1 = create$2(array$2);
	return {
		...grid$1,
		get: access(array$2),
		set: setMutate(array$2),
		get array() {
			return array$2;
		}
	};
};
const set$2 = (array$2) => {
	const grid$1 = create$2(array$2);
	return (value, cell, wrap$6) => setWithGrid(grid$1, array$2, value, cell, wrap$6);
};
const setWithGrid = (grid$1, array$2, value, cell, wrap$6) => {
	let boundCell = applyBounds(grid$1, cell, wrap$6);
	if (boundCell === void 0) throw new RangeError(`Cell (${cell.x},${cell.y}) is out of range of grid cols: ${grid$1.cols} rows: ${grid$1.rows}`);
	let copyWhole = [...array$2];
	let copyRow = [...copyWhole[boundCell.y]];
	copyRow[boundCell.x] = value;
	copyWhole[boundCell.y] = copyRow;
	array$2 = copyWhole;
	return copyWhole;
};
const wrap$2 = (array$2) => {
	const grid$1 = create$2(array$2);
	return {
		...grid$1,
		get: (cell, boundsLogic = `undefined`) => accessWithGrid(grid$1, array$2, cell, boundsLogic),
		set: (value, cell, boundsLogic = `undefined`) => {
			array$2 = setWithGrid(grid$1, array$2, value, cell, boundsLogic);
			return wrap$2(array$2);
		},
		get array() {
			return array$2;
		}
	};
};

//#endregion
//#region packages/geometry/src/grid/values.ts
function* values(grid$1, iter) {
	for (const d$1 of iter) if (Array.isArray(d$1)) yield d$1.map((v) => grid$1.get(v, `undefined`));
	else yield grid$1.get(d$1, `undefined`);
}

//#endregion
//#region packages/geometry/src/grid/enumerators/cells.ts
function* cells(grid$1, start, wrap$6 = true) {
	if (!start) start = {
		x: 0,
		y: 0
	};
	guardGrid(grid$1, `grid`);
	guardCell(start, `start`, grid$1);
	let { x, y } = start;
	let canMove = true;
	do {
		yield {
			x,
			y
		};
		x++;
		if (x === grid$1.cols) {
			y++;
			x = 0;
		}
		if (y === grid$1.rows) if (wrap$6) {
			y = 0;
			x = 0;
		} else canMove = false;
		if (x === start.x && y === start.y) canMove = false;
	} while (canMove);
}
function* cellValues(grid$1, start, wrap$6 = true) {
	yield* values(grid$1, cells(grid$1, start, wrap$6));
}
function* cellsAndValues(grid$1, start, wrap$6 = true) {
	for (const cell of cells(grid$1, start, wrap$6)) yield {
		cell,
		value: grid$1.get(cell)
	};
}

//#endregion
//#region packages/geometry/src/grid/as.ts
var as_exports = {};
__export(as_exports, {
	columns: () => columns,
	rows: () => rows
});
const rows = function* (grid$1, start) {
	if (!start) start = {
		x: 0,
		y: 0
	};
	let row = start.y;
	let rowCells = [];
	for (const c$1 of cells(grid$1, start)) if (c$1.y === row) rowCells.push(c$1);
	else {
		yield rowCells;
		rowCells = [c$1];
		row = c$1.y;
	}
	if (rowCells.length > 0) yield rowCells;
};
function* columns(grid$1, start) {
	if (!start) start = {
		x: 0,
		y: 0
	};
	for (let x = start.x; x < grid$1.cols; x++) {
		let colCells = [];
		for (let y = start.y; y < grid$1.rows; y++) colCells.push({
			x,
			y
		});
		yield colCells;
	}
}

//#endregion
//#region packages/geometry/src/grid/offset.ts
const offset = function(grid$1, start, vector, bounds = `undefined`) {
	return applyBounds(grid$1, {
		x: start.x + vector.x,
		y: start.y + vector.y
	}, bounds);
};

//#endregion
//#region packages/geometry/src/grid/directions.ts
const allDirections = Object.freeze([
	`n`,
	`ne`,
	`nw`,
	`e`,
	`s`,
	`se`,
	`sw`,
	`w`
]);
const crossDirections = Object.freeze([
	`n`,
	`e`,
	`s`,
	`w`
]);
const offsetCardinals = (grid$1, start, steps$1, bounds = `stop`) => {
	guardGrid(grid$1, `grid`);
	guardCell(start, `start`);
	throwIntegerTest(steps$1, `aboveZero`, `steps`);
	const directions = allDirections;
	const vectors = directions.map((d$1) => getVectorFromCardinal(d$1, steps$1));
	const cells$1 = directions.map((d$1, index) => offset(grid$1, start, vectors[index], bounds));
	return zipKeyValue(directions, cells$1);
};
const getVectorFromCardinal = (cardinal$1, multiplier = 1) => {
	let v;
	switch (cardinal$1) {
		case `n`: {
			v = {
				x: 0,
				y: -1 * multiplier
			};
			break;
		}
		case `ne`: {
			v = {
				x: 1 * multiplier,
				y: -1 * multiplier
			};
			break;
		}
		case `e`: {
			v = {
				x: 1 * multiplier,
				y: 0
			};
			break;
		}
		case `se`: {
			v = {
				x: 1 * multiplier,
				y: 1 * multiplier
			};
			break;
		}
		case `s`: {
			v = {
				x: 0,
				y: 1 * multiplier
			};
			break;
		}
		case `sw`: {
			v = {
				x: -1 * multiplier,
				y: 1 * multiplier
			};
			break;
		}
		case `w`: {
			v = {
				x: -1 * multiplier,
				y: 0
			};
			break;
		}
		case `nw`: {
			v = {
				x: -1 * multiplier,
				y: -1 * multiplier
			};
			break;
		}
		default: v = {
			x: 0,
			y: 0
		};
	}
	return Object.freeze(v);
};

//#endregion
//#region packages/geometry/src/grid/enumerators/index.ts
var enumerators_exports = {};
__export(enumerators_exports, {
	cellValues: () => cellValues,
	cells: () => cells,
	cellsAndValues: () => cellsAndValues
});

//#endregion
//#region packages/geometry/src/grid/geometry.ts
const getLine = (start, end) => {
	guardCell(start);
	guardCell(end);
	let startX = start.x;
	let startY = start.y;
	const dx = Math.abs(end.x - startX);
	const dy = Math.abs(end.y - startY);
	const sx = startX < end.x ? 1 : -1;
	const sy = startY < end.y ? 1 : -1;
	let error = dx - dy;
	const cells$1 = [];
	while (true) {
		cells$1.push(Object.freeze({
			x: startX,
			y: startY
		}));
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
	return cells$1;
};
const simpleLine = function(start, end, endInclusive = false) {
	const cells$1 = [];
	if (start.x === end.x) {
		const lastY = endInclusive ? end.y + 1 : end.y;
		for (let y = start.y; y < lastY; y++) cells$1.push({
			x: start.x,
			y
		});
	} else if (start.y === end.y) {
		const lastX = endInclusive ? end.x + 1 : end.x;
		for (let x = start.x; x < lastX; x++) cells$1.push({
			x,
			y: start.y
		});
	} else throw new Error(`Only does vertical and horizontal: ${start.x},${start.y} - ${end.x},${end.y}`);
	return cells$1;
};

//#endregion
//#region packages/geometry/src/grid/indexing.ts
const indexFromCell = (grid$1, cell, wrap$6) => {
	guardGrid(grid$1, `grid`);
	if (cell.x < 0) switch (wrap$6) {
		case `stop`: {
			cell = {
				...cell,
				x: 0
			};
			break;
		}
		case `unbounded`: throw new Error(`unbounded not supported`);
		case `undefined`: return void 0;
		case `wrap`: {
			cell = offset(grid$1, {
				x: 0,
				y: cell.y
			}, {
				x: cell.x,
				y: 0
			}, `wrap`);
			break;
		}
	}
	if (cell.y < 0) switch (wrap$6) {
		case `stop`: {
			cell = {
				...cell,
				y: 0
			};
			break;
		}
		case `unbounded`: throw new Error(`unbounded not supported`);
		case `undefined`: return void 0;
		case `wrap`: {
			cell = {
				...cell,
				y: grid$1.rows + cell.y
			};
			break;
		}
	}
	if (cell.x >= grid$1.cols) switch (wrap$6) {
		case `stop`: {
			cell = {
				...cell,
				x: grid$1.cols - 1
			};
			break;
		}
		case `unbounded`: throw new Error(`unbounded not supported`);
		case `undefined`: return void 0;
		case `wrap`: {
			cell = {
				...cell,
				x: cell.x % grid$1.cols
			};
			break;
		}
	}
	if (cell.y >= grid$1.rows) switch (wrap$6) {
		case `stop`: {
			cell = {
				...cell,
				y: grid$1.rows - 1
			};
			break;
		}
		case `unbounded`: throw new Error(`unbounded not supported`);
		case `undefined`: return void 0;
		case `wrap`: {
			cell = {
				...cell,
				y: cell.y % grid$1.rows
			};
			break;
		}
	}
	const index = cell.y * grid$1.cols + cell.x;
	return index;
};
const cellFromIndex = (colsOrGrid, index) => {
	let cols = 0;
	cols = typeof colsOrGrid === `number` ? colsOrGrid : colsOrGrid.cols;
	throwIntegerTest(cols, `aboveZero`, `colsOrGrid`);
	return {
		x: index % cols,
		y: Math.floor(index / cols)
	};
};

//#endregion
//#region packages/geometry/src/grid/is-equal.ts
const isEqual$1 = (a$1, b$2) => {
	if (b$2 === void 0) return false;
	if (a$1 === void 0) return false;
	if (`rows` in a$1 && `cols` in a$1) if (`rows` in b$2 && `cols` in b$2) {
		if (a$1.rows !== b$2.rows || a$1.cols !== b$2.cols) return false;
	} else return false;
	if (`size` in a$1) if (`size` in b$2) {
		if (a$1.size !== b$2.size) return false;
	} else return false;
	return true;
};
const cellEquals = (a$1, b$2) => {
	if (b$2 === void 0) return false;
	if (a$1 === void 0) return false;
	return a$1.x === b$2.x && a$1.y === b$2.y;
};

//#endregion
//#region packages/random/src/arrays.ts
const randomElement = (array$2, rand = Math.random) => {
	guardArray(array$2, `array`);
	return array$2[Math.floor(rand() * array$2.length)];
};

//#endregion
//#region packages/random/src/float-source.ts
const floatSource = (maxOrOptions = 1) => {
	const options = typeof maxOrOptions === `number` ? { max: maxOrOptions } : maxOrOptions;
	let max$5 = options.max ?? 1;
	let min$4 = options.min ?? 0;
	const source = options.source ?? Math.random;
	throwNumberTest(min$4, ``, `min`);
	throwNumberTest(max$5, ``, `max`);
	if (!options.min && max$5 < 0) {
		min$4 = max$5;
		max$5 = 0;
	}
	if (min$4 > max$5) throw new Error(`Min is greater than max. Min: ${min$4.toString()} max: ${max$5.toString()}`);
	return () => source() * (max$5 - min$4) + min$4;
};
const float = (maxOrOptions = 1) => floatSource(maxOrOptions)();

//#endregion
//#region packages/geometry/src/grid/neighbour.ts
const randomNeighbour = (nbos) => randomElement(nbos);
/**
* Returns _true_ if `n` is a Neighbour type, eliminating NeighbourMaybe possibility
*
* @param n
* @return
*/
const isNeighbour = (n$2) => {
	if (n$2 === void 0) return false;
	if (n$2[1] === void 0) return false;
	return true;
};
const neighbourList = (grid$1, cell, directions, bounds) => {
	const cellNeighbours = neighbours(grid$1, cell, bounds, directions);
	const entries = Object.entries(cellNeighbours);
	return entries.filter((n$2) => isNeighbour(n$2));
};
const neighbours = (grid$1, cell, bounds = `undefined`, directions) => {
	const directories = directions ?? allDirections;
	const points = directories.map((c$1) => offset(grid$1, cell, getVectorFromCardinal(c$1), bounds));
	return zipKeyValue(directories, points);
};

//#endregion
//#region packages/geometry/src/grid/to-array.ts
const toArray2d = (grid$1, initialValue) => {
	const returnValue = [];
	for (let row = 0; row < grid$1.rows; row++) {
		returnValue[row] = Array.from({ length: grid$1.cols });
		if (initialValue) for (let col = 0; col < grid$1.cols; col++) returnValue[row][col] = initialValue;
	}
	return returnValue;
};

//#endregion
//#region packages/geometry/src/grid/to-string.ts
const cellKeyString = (v) => `Cell{${v.x},${v.y}}`;

//#endregion
//#region packages/geometry/src/grid/visual.ts
function* asRectangles(grid$1) {
	for (const c$1 of cells(grid$1)) yield rectangleForCell(grid$1, c$1);
}
const cellAtPoint = (grid$1, position) => {
	const size = grid$1.size;
	throwNumberTest(size, `positive`, `grid.size`);
	if (position.x < 0 || position.y < 0) return;
	const x = Math.floor(position.x / size);
	const y = Math.floor(position.y / size);
	if (x >= grid$1.cols) return;
	if (y >= grid$1.rows) return;
	return {
		x,
		y
	};
};
const rectangleForCell = (grid$1, cell) => {
	guardCell(cell);
	const size = grid$1.size;
	const x = cell.x * size;
	const y = cell.y * size;
	const r = fromTopLeft({
		x,
		y
	}, size, size);
	return r;
};
const cellMiddle = (grid$1, cell) => {
	guardCell(cell);
	const size = grid$1.size;
	const x = cell.x * size;
	const y = cell.y * size;
	return Object.freeze({
		x: x + size / 2,
		y: y + size / 2
	});
};

//#endregion
//#region packages/geometry/src/grid/visitors/breadth.ts
const breadthLogic = () => {
	return { select: (nbos) => nbos[0] };
};

//#endregion
//#region packages/geometry/src/grid/visitors/cell-neighbours.ts
const neighboursLogic = () => {
	return {
		select: (neighbours$1) => {
			return neighbours$1.at(0);
		},
		getNeighbours: (grid$1, cell) => {
			return neighbourList(grid$1, cell, allDirections, `undefined`);
		}
	};
};

//#endregion
//#region packages/geometry/src/grid/visitors/columns.ts
const columnLogic = (opts = {}) => {
	const reversed = opts.reversed ?? false;
	return {
		select: (nbos) => nbos.find((n$2) => n$2[0] === (reversed ? `n` : `s`)),
		getNeighbours: (grid$1, cell) => {
			if (reversed) if (cell.y > 0) cell = {
				x: cell.x,
				y: cell.y - 1
			};
			else if (cell.x === 0) cell = {
				x: grid$1.cols - 1,
				y: grid$1.rows - 1
			};
			else cell = {
				x: cell.x - 1,
				y: grid$1.rows - 1
			};
			else if (cell.y < grid$1.rows - 1) cell = {
				x: cell.x,
				y: cell.y + 1
			};
			else if (cell.x < grid$1.cols - 1) cell = {
				x: cell.x + 1,
				y: 0
			};
			else cell = {
				x: 0,
				y: 0
			};
			return [[reversed ? `n` : `s`, cell]];
		}
	};
};

//#endregion
//#region packages/geometry/src/grid/visitors/depth.ts
const depthLogic = () => {
	return { select: (nbos) => nbos.at(-1) };
};

//#endregion
//#region packages/geometry/src/grid/visitors/random.ts
const randomLogic = () => {
	return {
		getNeighbours: (grid$1, cell) => {
			const t$1 = [];
			for (const c$1 of cells(grid$1, cell)) t$1.push([`n`, c$1]);
			return t$1;
		},
		select: randomNeighbour
	};
};

//#endregion
//#region packages/geometry/src/grid/visitors/random-contiguous.ts
const randomContiguousLogic = () => {
	return { select: randomNeighbour };
};

//#endregion
//#region packages/geometry/src/grid/visitors/rows.ts
const rowLogic = (opts = {}) => {
	const reversed = opts.reversed ?? false;
	return {
		select: (nbos) => nbos.find((n$2) => n$2[0] === (reversed ? `w` : `e`)),
		getNeighbours: (grid$1, cell) => {
			if (reversed) if (cell.x > 0) cell = {
				x: cell.x - 1,
				y: cell.y
			};
			else if (cell.y > 0) cell = {
				x: grid$1.cols - 1,
				y: cell.y - 1
			};
			else cell = {
				x: grid$1.cols - 1,
				y: grid$1.rows - 1
			};
			else if (cell.x < grid$1.rows - 1) cell = {
				x: cell.x + 1,
				y: cell.y
			};
			else if (cell.y < grid$1.rows - 1) cell = {
				x: 0,
				y: cell.y + 1
			};
			else cell = {
				x: 0,
				y: 0
			};
			return [[reversed ? `w` : `e`, cell]];
		}
	};
};

//#endregion
//#region packages/events/src/map-of.ts
var MapOfSimple = class {
	#store = new Map();
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
		for (const key of this.#store.keys()) yield* this.iterateKey(key);
	}
	/**
	* Iterate all keys
	*/
	*iterateKeys() {
		yield* this.#store.keys();
	}
	addKeyedValues(key, ...values$1) {
		let arr = this.#store.get(key);
		if (!arr) {
			arr = [];
			this.#store.set(key, arr);
		}
		arr.push(...values$1);
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

//#endregion
//#region packages/events/src/simple-event-emitter.ts
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
	fireEvent(type$1, args) {
		if (this.#disposed) throw new Error(`Disposed`);
		for (const l of this.#listeners.iterateKey(type$1)) l(args, this);
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
		this.#listeners.addKeyedValues(name, listener);
	}
	/**
	* Remove event listener
	*
	* @param listener
	*/
	removeEventListener(type$1, listener) {
		if (this.#disposed) return;
		this.#listeners.deleteKeyValue(type$1, listener);
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

//#endregion
//#region packages/collections/src/set/set-mutable.ts
const mutable = (keyString) => new SetStringMutable(keyString);
var SetStringMutable = class extends SimpleEventEmitter {
	store = new Map();
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
	add(...values$1) {
		let somethingAdded = false;
		for (const value of values$1) {
			const isUpdated = this.has(value);
			this.store.set(this.keyString(value), value);
			super.fireEvent(`add`, {
				value,
				updated: isUpdated
			});
			if (!isUpdated) somethingAdded = true;
		}
		return somethingAdded;
	}
	/**
	* Returns values from set as an iterable
	* @returns
	*/
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

//#endregion
//#region packages/geometry/src/grid/visitors/visitor.ts
function* visitByNeighbours(logic, grid$1, opts = {}) {
	guardGrid(grid$1, `grid`);
	const start = opts.start ?? {
		x: 0,
		y: 0
	};
	guardCell(start, `opts.start`, grid$1);
	const v = opts.visited ?? mutable(cellKeyString);
	const possibleNeighbours = logic.getNeighbours ?? ((g$1, c$1) => neighbourList(g$1, c$1, crossDirections, `undefined`));
	let cellQueue = [start];
	let moveQueue = [];
	let current = void 0;
	while (cellQueue.length > 0) {
		if (current === void 0) {
			const nv = cellQueue.pop();
			if (nv === void 0) break;
			current = nv;
		}
		if (!v.has(current)) {
			v.add(current);
			yield current;
			const nextSteps = possibleNeighbours(grid$1, current).filter((step) => {
				if (step[1] === void 0) return false;
				return !v.has(step[1]);
			});
			if (nextSteps.length === 0) {
				if (current !== void 0) cellQueue = cellQueue.filter((cq) => cellEquals(cq, current));
			} else for (const n$2 of nextSteps) {
				if (n$2 === void 0) continue;
				if (n$2[1] === void 0) continue;
				moveQueue.push(n$2);
			}
		}
		moveQueue = moveQueue.filter((step) => !v.has(step[1]));
		if (moveQueue.length === 0) current = void 0;
		else {
			const potential = logic.select(moveQueue);
			if (potential !== void 0) {
				cellQueue.push(potential[1]);
				current = potential[1];
			}
		}
	}
}

//#endregion
//#region packages/geometry/src/grid/visitors/step.ts
const stepper = (grid$1, createVisitor, start = {
	x: 0,
	y: 0
}, resolution = 1) => {
	guardGrid(grid$1, `grid`);
	guardCell(start, `start`);
	throwIntegerTest(resolution, ``, `resolution`);
	const steps$1 = [];
	let count$2 = 0;
	let position = 0;
	for (const c$1 of createVisitor(grid$1, {
		start,
		boundsWrap: `undefined`
	})) {
		count$2++;
		if (count$2 % resolution !== 0) continue;
		steps$1.push(c$1);
	}
	return (step, fromStart = false) => {
		throwIntegerTest(step, ``, `step`);
		if (fromStart) position = step;
		else position += step;
		return steps$1.at(position % steps$1.length);
	};
};

//#endregion
//#region packages/geometry/src/grid/visitors/index.ts
var visitors_exports = {};
__export(visitors_exports, {
	breadthLogic: () => breadthLogic,
	columnLogic: () => columnLogic,
	create: () => create$1,
	depthLogic: () => depthLogic,
	neighboursLogic: () => neighboursLogic,
	randomContiguousLogic: () => randomContiguousLogic,
	randomLogic: () => randomLogic,
	rowLogic: () => rowLogic,
	stepper: () => stepper,
	visitByNeighbours: () => visitByNeighbours,
	withLogic: () => withLogic
});
const create$1 = (type$1, opts = {}) => {
	switch (type$1) {
		case `random-contiguous`: return withLogic(randomContiguousLogic(), opts);
		case `random`: return withLogic(randomLogic(), opts);
		case `depth`: return withLogic(depthLogic(), opts);
		case `breadth`: return withLogic(breadthLogic(), opts);
		case `neighbours`: return withLogic(neighboursLogic(), opts);
		case `row`: return withLogic(rowLogic(opts), opts);
		case `column`: return withLogic(columnLogic(opts), opts);
		default: throw new TypeError(`Param 'type' unknown. Value: ${type$1}`);
	}
};
const withLogic = (logic, options = {}) => {
	return (grid$1, optionsOverride = {}) => {
		return visitByNeighbours(logic, grid$1, {
			...options,
			...optionsOverride
		});
	};
};

//#endregion
//#region packages/geometry/src/grid/index.ts
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
	isEqual: () => isEqual$1,
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

//#endregion
//#region node_modules/.pnpm/bezier-js@6.1.4/node_modules/bezier-js/src/utils.js
const { abs: abs$1, cos: cos$3, sin: sin$3, acos: acos$1, atan2, sqrt: sqrt$3, pow: pow$3 } = Math;
function crt(v) {
	return v < 0 ? -pow$3(-v, 1 / 3) : pow$3(v, 1 / 3);
}
const pi$3 = Math.PI, tau$1 = 2 * pi$3, quart = pi$3 / 2, epsilon = 1e-6, nMax = Number.MAX_SAFE_INTEGER || 9007199254740991, nMin = Number.MIN_SAFE_INTEGER || -9007199254740991, ZERO = {
	x: 0,
	y: 0,
	z: 0
};
const utils = {
	Tvalues: [
		-.06405689286260563,
		.06405689286260563,
		-.1911188674736163,
		.1911188674736163,
		-.3150426796961634,
		.3150426796961634,
		-.4337935076260451,
		.4337935076260451,
		-.5454214713888396,
		.5454214713888396,
		-.6480936519369755,
		.6480936519369755,
		-.7401241915785544,
		.7401241915785544,
		-.820001985973903,
		.820001985973903,
		-.8864155270044011,
		.8864155270044011,
		-.9382745520027328,
		.9382745520027328,
		-.9747285559713095,
		.9747285559713095,
		-.9951872199970213,
		.9951872199970213
	],
	Cvalues: [
		.12793819534675216,
		.12793819534675216,
		.1258374563468283,
		.1258374563468283,
		.12167047292780339,
		.12167047292780339,
		.1155056680537256,
		.1155056680537256,
		.10744427011596563,
		.10744427011596563,
		.09761865210411388,
		.09761865210411388,
		.08619016153195327,
		.08619016153195327,
		.0733464814110803,
		.0733464814110803,
		.05929858491543678,
		.05929858491543678,
		.04427743881741981,
		.04427743881741981,
		.028531388628933663,
		.028531388628933663,
		.0123412297999872,
		.0123412297999872
	],
	arcfn: function(t$1, derivativeFn) {
		const d$1 = derivativeFn(t$1);
		let l = d$1.x * d$1.x + d$1.y * d$1.y;
		if (typeof d$1.z !== "undefined") l += d$1.z * d$1.z;
		return sqrt$3(l);
	},
	compute: function(t$1, points, _3d) {
		if (t$1 === 0) {
			points[0].t = 0;
			return points[0];
		}
		const order = points.length - 1;
		if (t$1 === 1) {
			points[order].t = 1;
			return points[order];
		}
		const mt = 1 - t$1;
		let p$1 = points;
		if (order === 0) {
			points[0].t = t$1;
			return points[0];
		}
		if (order === 1) {
			const ret = {
				x: mt * p$1[0].x + t$1 * p$1[1].x,
				y: mt * p$1[0].y + t$1 * p$1[1].y,
				t: t$1
			};
			if (_3d) ret.z = mt * p$1[0].z + t$1 * p$1[1].z;
			return ret;
		}
		if (order < 4) {
			let mt2 = mt * mt, t2 = t$1 * t$1, a$1, b$2, c$1, d$1 = 0;
			if (order === 2) {
				p$1 = [
					p$1[0],
					p$1[1],
					p$1[2],
					ZERO
				];
				a$1 = mt2;
				b$2 = mt * t$1 * 2;
				c$1 = t2;
			} else if (order === 3) {
				a$1 = mt2 * mt;
				b$2 = mt2 * t$1 * 3;
				c$1 = mt * t2 * 3;
				d$1 = t$1 * t2;
			}
			const ret = {
				x: a$1 * p$1[0].x + b$2 * p$1[1].x + c$1 * p$1[2].x + d$1 * p$1[3].x,
				y: a$1 * p$1[0].y + b$2 * p$1[1].y + c$1 * p$1[2].y + d$1 * p$1[3].y,
				t: t$1
			};
			if (_3d) ret.z = a$1 * p$1[0].z + b$2 * p$1[1].z + c$1 * p$1[2].z + d$1 * p$1[3].z;
			return ret;
		}
		const dCpts = JSON.parse(JSON.stringify(points));
		while (dCpts.length > 1) {
			for (let i = 0; i < dCpts.length - 1; i++) {
				dCpts[i] = {
					x: dCpts[i].x + (dCpts[i + 1].x - dCpts[i].x) * t$1,
					y: dCpts[i].y + (dCpts[i + 1].y - dCpts[i].y) * t$1
				};
				if (typeof dCpts[i].z !== "undefined") dCpts[i].z = dCpts[i].z + (dCpts[i + 1].z - dCpts[i].z) * t$1;
			}
			dCpts.splice(dCpts.length - 1, 1);
		}
		dCpts[0].t = t$1;
		return dCpts[0];
	},
	computeWithRatios: function(t$1, points, ratios, _3d) {
		const mt = 1 - t$1, r = ratios, p$1 = points;
		let f1 = r[0], f2 = r[1], f3 = r[2], f4 = r[3], d$1;
		f1 *= mt;
		f2 *= t$1;
		if (p$1.length === 2) {
			d$1 = f1 + f2;
			return {
				x: (f1 * p$1[0].x + f2 * p$1[1].x) / d$1,
				y: (f1 * p$1[0].y + f2 * p$1[1].y) / d$1,
				z: !_3d ? false : (f1 * p$1[0].z + f2 * p$1[1].z) / d$1,
				t: t$1
			};
		}
		f1 *= mt;
		f2 *= 2 * mt;
		f3 *= t$1 * t$1;
		if (p$1.length === 3) {
			d$1 = f1 + f2 + f3;
			return {
				x: (f1 * p$1[0].x + f2 * p$1[1].x + f3 * p$1[2].x) / d$1,
				y: (f1 * p$1[0].y + f2 * p$1[1].y + f3 * p$1[2].y) / d$1,
				z: !_3d ? false : (f1 * p$1[0].z + f2 * p$1[1].z + f3 * p$1[2].z) / d$1,
				t: t$1
			};
		}
		f1 *= mt;
		f2 *= 1.5 * mt;
		f3 *= 3 * mt;
		f4 *= t$1 * t$1 * t$1;
		if (p$1.length === 4) {
			d$1 = f1 + f2 + f3 + f4;
			return {
				x: (f1 * p$1[0].x + f2 * p$1[1].x + f3 * p$1[2].x + f4 * p$1[3].x) / d$1,
				y: (f1 * p$1[0].y + f2 * p$1[1].y + f3 * p$1[2].y + f4 * p$1[3].y) / d$1,
				z: !_3d ? false : (f1 * p$1[0].z + f2 * p$1[1].z + f3 * p$1[2].z + f4 * p$1[3].z) / d$1,
				t: t$1
			};
		}
	},
	derive: function(points, _3d) {
		const dpoints = [];
		for (let p$1 = points, d$1 = p$1.length, c$1 = d$1 - 1; d$1 > 1; d$1--, c$1--) {
			const list = [];
			for (let j = 0, dpt; j < c$1; j++) {
				dpt = {
					x: c$1 * (p$1[j + 1].x - p$1[j].x),
					y: c$1 * (p$1[j + 1].y - p$1[j].y)
				};
				if (_3d) dpt.z = c$1 * (p$1[j + 1].z - p$1[j].z);
				list.push(dpt);
			}
			dpoints.push(list);
			p$1 = list;
		}
		return dpoints;
	},
	between: function(v, m$1, M) {
		return m$1 <= v && v <= M || utils.approximately(v, m$1) || utils.approximately(v, M);
	},
	approximately: function(a$1, b$2, precision) {
		return abs$1(a$1 - b$2) <= (precision || epsilon);
	},
	length: function(derivativeFn) {
		const z = .5, len = utils.Tvalues.length;
		let sum$6 = 0;
		for (let i = 0, t$1; i < len; i++) {
			t$1 = z * utils.Tvalues[i] + z;
			sum$6 += utils.Cvalues[i] * utils.arcfn(t$1, derivativeFn);
		}
		return z * sum$6;
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
		if (v1.z !== void 0 && v2.z !== void 0) ret.z = v1.z + r * (v2.z - v1.z);
		return ret;
	},
	pointToString: function(p$1) {
		let s = p$1.x + "/" + p$1.y;
		if (typeof p$1.z !== "undefined") s += "/" + p$1.z;
		return s;
	},
	pointsToString: function(points) {
		return "[" + points.map(utils.pointToString).join(", ") + "]";
	},
	copy: function(obj) {
		return JSON.parse(JSON.stringify(obj));
	},
	angle: function(o, v1, v2) {
		const dx1 = v1.x - o.x, dy1 = v1.y - o.y, dx2 = v2.x - o.x, dy2 = v2.y - o.y, cross = dx1 * dy2 - dy1 * dx2, dot$1 = dx1 * dx2 + dy1 * dy2;
		return atan2(cross, dot$1);
	},
	round: function(v, d$1) {
		const s = "" + v;
		const pos = s.indexOf(".");
		return parseFloat(s.substring(0, pos + 1 + d$1));
	},
	dist: function(p1, p2) {
		const dx = p1.x - p2.x, dy = p1.y - p2.y;
		return sqrt$3(dx * dx + dy * dy);
	},
	closest: function(LUT, point$1) {
		let mdist = pow$3(2, 63), mpos, d$1;
		LUT.forEach(function(p$1, idx) {
			d$1 = utils.dist(point$1, p$1);
			if (d$1 < mdist) {
				mdist = d$1;
				mpos = idx;
			}
		});
		return {
			mdist,
			mpos
		};
	},
	abcratio: function(t$1, n$2) {
		if (n$2 !== 2 && n$2 !== 3) return false;
		if (typeof t$1 === "undefined") t$1 = .5;
		else if (t$1 === 0 || t$1 === 1) return t$1;
		const bottom = pow$3(t$1, n$2) + pow$3(1 - t$1, n$2), top = bottom - 1;
		return abs$1(top / bottom);
	},
	projectionratio: function(t$1, n$2) {
		if (n$2 !== 2 && n$2 !== 3) return false;
		if (typeof t$1 === "undefined") t$1 = .5;
		else if (t$1 === 0 || t$1 === 1) return t$1;
		const top = pow$3(1 - t$1, n$2), bottom = pow$3(t$1, n$2) + top;
		return top / bottom;
	},
	lli8: function(x1, y1, x2, y2, x3, y3, x4, y4) {
		const nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4), ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4), d$1 = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (d$1 == 0) return false;
		return {
			x: nx / d$1,
			y: ny / d$1
		};
	},
	lli4: function(p1, p2, p3, p4) {
		const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y, x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y;
		return utils.lli8(x1, y1, x2, y2, x3, y3, x4, y4);
	},
	lli: function(v1, v2) {
		return utils.lli4(v1, v1.c, v2, v2.c);
	},
	makeline: function(p1, p2) {
		return new Bezier(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2, p2.x, p2.y);
	},
	findbbox: function(sections) {
		let mx = nMax, my = nMax, MX = nMin, MY = nMin;
		sections.forEach(function(s) {
			const bbox$6 = s.bbox();
			if (mx > bbox$6.x.min) mx = bbox$6.x.min;
			if (my > bbox$6.y.min) my = bbox$6.y.min;
			if (MX < bbox$6.x.max) MX = bbox$6.x.max;
			if (MY < bbox$6.y.max) MY = bbox$6.y.max;
		});
		return {
			x: {
				min: mx,
				mid: (mx + MX) / 2,
				max: MX,
				size: MX - mx
			},
			y: {
				min: my,
				mid: (my + MY) / 2,
				max: MY,
				size: MY - my
			}
		};
	},
	shapeintersections: function(s1, bbox1, s2, bbox2, curveIntersectionThreshold) {
		if (!utils.bboxoverlap(bbox1, bbox2)) return [];
		const intersections$1 = [];
		const a1 = [
			s1.startcap,
			s1.forward,
			s1.back,
			s1.endcap
		];
		const a2 = [
			s2.startcap,
			s2.forward,
			s2.back,
			s2.endcap
		];
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
					intersections$1.push(iss);
				}
			});
		});
		return intersections$1;
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
			bbox: utils.findbbox([
				start,
				forward,
				back,
				end
			])
		};
		shape.intersections = function(s2) {
			return utils.shapeintersections(shape, shape.bbox, s2, s2.bbox, curveIntersectionThreshold);
		};
		return shape;
	},
	getminmax: function(curve, d$1, list) {
		if (!list) return {
			min: 0,
			max: 0
		};
		let min$4 = nMax, max$5 = nMin, t$1, c$1;
		if (list.indexOf(0) === -1) list = [0].concat(list);
		if (list.indexOf(1) === -1) list.push(1);
		for (let i = 0, len = list.length; i < len; i++) {
			t$1 = list[i];
			c$1 = curve.get(t$1);
			if (c$1[d$1] < min$4) min$4 = c$1[d$1];
			if (c$1[d$1] > max$5) max$5 = c$1[d$1];
		}
		return {
			min: min$4,
			mid: (min$4 + max$5) / 2,
			max: max$5,
			size: max$5 - min$4
		};
	},
	align: function(points, line$2) {
		const tx = line$2.p1.x, ty = line$2.p1.y, a$1 = -atan2(line$2.p2.y - ty, line$2.p2.x - tx), d$1 = function(v) {
			return {
				x: (v.x - tx) * cos$3(a$1) - (v.y - ty) * sin$3(a$1),
				y: (v.x - tx) * sin$3(a$1) + (v.y - ty) * cos$3(a$1)
			};
		};
		return points.map(d$1);
	},
	roots: function(points, line$2) {
		line$2 = line$2 || {
			p1: {
				x: 0,
				y: 0
			},
			p2: {
				x: 1,
				y: 0
			}
		};
		const order = points.length - 1;
		const aligned = utils.align(points, line$2);
		const reduce$1 = function(t$1) {
			return 0 <= t$1 && t$1 <= 1;
		};
		if (order === 2) {
			const a$2 = aligned[0].y, b$3 = aligned[1].y, c$2 = aligned[2].y, d$2 = a$2 - 2 * b$3 + c$2;
			if (d$2 !== 0) {
				const m1$2 = -sqrt$3(b$3 * b$3 - a$2 * c$2), m2$1 = -a$2 + b$3, v1$1 = -(m1$2 + m2$1) / d$2, v2 = -(-m1$2 + m2$1) / d$2;
				return [v1$1, v2].filter(reduce$1);
			} else if (b$3 !== c$2 && d$2 === 0) return [(2 * b$3 - c$2) / (2 * b$3 - 2 * c$2)].filter(reduce$1);
			return [];
		}
		const pa = aligned[0].y, pb = aligned[1].y, pc = aligned[2].y, pd = aligned[3].y;
		let d$1 = -pa + 3 * pb - 3 * pc + pd, a$1 = 3 * pa - 6 * pb + 3 * pc, b$2 = -3 * pa + 3 * pb, c$1 = pa;
		if (utils.approximately(d$1, 0)) {
			if (utils.approximately(a$1, 0)) {
				if (utils.approximately(b$2, 0)) return [];
				return [-c$1 / b$2].filter(reduce$1);
			}
			const q$1 = sqrt$3(b$2 * b$2 - 4 * a$1 * c$1), a2 = 2 * a$1;
			return [(q$1 - b$2) / a2, (-b$2 - q$1) / a2].filter(reduce$1);
		}
		a$1 /= d$1;
		b$2 /= d$1;
		c$1 /= d$1;
		const p$1 = (3 * b$2 - a$1 * a$1) / 3, p3 = p$1 / 3, q = (2 * a$1 * a$1 * a$1 - 9 * a$1 * b$2 + 27 * c$1) / 27, q2 = q / 2, discriminant = q2 * q2 + p3 * p3 * p3;
		let u1, v1, x1, x2, x3;
		if (discriminant < 0) {
			const mp3 = -p$1 / 3, mp33 = mp3 * mp3 * mp3, r = sqrt$3(mp33), t$1 = -q / (2 * r), cosphi = t$1 < -1 ? -1 : t$1 > 1 ? 1 : t$1, phi$1 = acos$1(cosphi), crtr = crt(r), t1 = 2 * crtr;
			x1 = t1 * cos$3(phi$1 / 3) - a$1 / 3;
			x2 = t1 * cos$3((phi$1 + tau$1) / 3) - a$1 / 3;
			x3 = t1 * cos$3((phi$1 + 2 * tau$1) / 3) - a$1 / 3;
			return [
				x1,
				x2,
				x3
			].filter(reduce$1);
		} else if (discriminant === 0) {
			u1 = q2 < 0 ? crt(-q2) : -crt(q2);
			x1 = 2 * u1 - a$1 / 3;
			x2 = -u1 - a$1 / 3;
			return [x1, x2].filter(reduce$1);
		} else {
			const sd = sqrt$3(discriminant);
			u1 = crt(-q2 + sd);
			v1 = crt(q2 + sd);
			return [u1 - v1 - a$1 / 3].filter(reduce$1);
		}
	},
	droots: function(p$1) {
		if (p$1.length === 3) {
			const a$1 = p$1[0], b$2 = p$1[1], c$1 = p$1[2], d$1 = a$1 - 2 * b$2 + c$1;
			if (d$1 !== 0) {
				const m1$2 = -sqrt$3(b$2 * b$2 - a$1 * c$1), m2$1 = -a$1 + b$2, v1 = -(m1$2 + m2$1) / d$1, v2 = -(-m1$2 + m2$1) / d$1;
				return [v1, v2];
			} else if (b$2 !== c$1 && d$1 === 0) return [(2 * b$2 - c$1) / (2 * (b$2 - c$1))];
			return [];
		}
		if (p$1.length === 2) {
			const a$1 = p$1[0], b$2 = p$1[1];
			if (a$1 !== b$2) return [a$1 / (a$1 - b$2)];
			return [];
		}
		return [];
	},
	curvature: function(t$1, d1, d2, _3d, kOnly) {
		let num, dnm, adk, dk, k = 0, r = 0;
		const d$1 = utils.compute(t$1, d1);
		const dd = utils.compute(t$1, d2);
		const qdsum = d$1.x * d$1.x + d$1.y * d$1.y;
		if (_3d) {
			num = sqrt$3(pow$3(d$1.y * dd.z - dd.y * d$1.z, 2) + pow$3(d$1.z * dd.x - dd.z * d$1.x, 2) + pow$3(d$1.x * dd.y - dd.x * d$1.y, 2));
			dnm = pow$3(qdsum + d$1.z * d$1.z, 3 / 2);
		} else {
			num = d$1.x * dd.y - d$1.y * dd.x;
			dnm = pow$3(qdsum, 3 / 2);
		}
		if (num === 0 || dnm === 0) return {
			k: 0,
			r: 0
		};
		k = num / dnm;
		r = dnm / num;
		if (!kOnly) {
			const pk = utils.curvature(t$1 - .001, d1, d2, _3d, true).k;
			const nk = utils.curvature(t$1 + .001, d1, d2, _3d, true).k;
			dk = (nk - k + (k - pk)) / 2;
			adk = (abs$1(nk - k) + abs$1(k - pk)) / 2;
		}
		return {
			k,
			r,
			dk,
			adk
		};
	},
	inflections: function(points) {
		if (points.length < 4) return [];
		const p$1 = utils.align(points, {
			p1: points[0],
			p2: points.slice(-1)[0]
		}), a$1 = p$1[2].x * p$1[1].y, b$2 = p$1[3].x * p$1[1].y, c$1 = p$1[1].x * p$1[2].y, d$1 = p$1[3].x * p$1[2].y, v1 = 18 * (-3 * a$1 + 2 * b$2 + 3 * c$1 - d$1), v2 = 18 * (3 * a$1 - b$2 - 3 * c$1), v3 = 18 * (c$1 - a$1);
		if (utils.approximately(v1, 0)) {
			if (!utils.approximately(v2, 0)) {
				let t$1 = -v3 / v2;
				if (0 <= t$1 && t$1 <= 1) return [t$1];
			}
			return [];
		}
		const d2 = 2 * v1;
		if (utils.approximately(d2, 0)) return [];
		const trm = v2 * v2 - 4 * v1 * v3;
		if (trm < 0) return [];
		const sq = Math.sqrt(trm);
		return [(sq - v2) / d2, -(v2 + sq) / d2].filter(function(r) {
			return 0 <= r && r <= 1;
		});
	},
	bboxoverlap: function(b1, b2) {
		const dims = ["x", "y"], len = dims.length;
		for (let i = 0, dim, l, t$1, d$1; i < len; i++) {
			dim = dims[i];
			l = b1[dim].mid;
			t$1 = b2[dim].mid;
			d$1 = (b1[dim].size + b2[dim].size) / 2;
			if (abs$1(l - t$1) >= d$1) return false;
		}
		return true;
	},
	expandbox: function(bbox$6, _bbox) {
		if (_bbox.x.min < bbox$6.x.min) bbox$6.x.min = _bbox.x.min;
		if (_bbox.y.min < bbox$6.y.min) bbox$6.y.min = _bbox.y.min;
		if (_bbox.z && _bbox.z.min < bbox$6.z.min) bbox$6.z.min = _bbox.z.min;
		if (_bbox.x.max > bbox$6.x.max) bbox$6.x.max = _bbox.x.max;
		if (_bbox.y.max > bbox$6.y.max) bbox$6.y.max = _bbox.y.max;
		if (_bbox.z && _bbox.z.max > bbox$6.z.max) bbox$6.z.max = _bbox.z.max;
		bbox$6.x.mid = (bbox$6.x.min + bbox$6.x.max) / 2;
		bbox$6.y.mid = (bbox$6.y.min + bbox$6.y.max) / 2;
		if (bbox$6.z) bbox$6.z.mid = (bbox$6.z.min + bbox$6.z.max) / 2;
		bbox$6.x.size = bbox$6.x.max - bbox$6.x.min;
		bbox$6.y.size = bbox$6.y.max - bbox$6.y.min;
		if (bbox$6.z) bbox$6.z.size = bbox$6.z.max - bbox$6.z.min;
	},
	pairiteration: function(c1$3, c2$3, curveIntersectionThreshold) {
		const c1b = c1$3.bbox(), c2b = c2$3.bbox(), r = 1e5, threshold = curveIntersectionThreshold || .5;
		if (c1b.x.size + c1b.y.size < threshold && c2b.x.size + c2b.y.size < threshold) return [(r * (c1$3._t1 + c1$3._t2) / 2 | 0) / r + "/" + (r * (c2$3._t1 + c2$3._t2) / 2 | 0) / r];
		let cc1 = c1$3.split(.5), cc2 = c2$3.split(.5), pairs = [
			{
				left: cc1.left,
				right: cc2.left
			},
			{
				left: cc1.left,
				right: cc2.right
			},
			{
				left: cc1.right,
				right: cc2.right
			},
			{
				left: cc1.right,
				right: cc2.left
			}
		];
		pairs = pairs.filter(function(pair) {
			return utils.bboxoverlap(pair.left.bbox(), pair.right.bbox());
		});
		let results = [];
		if (pairs.length === 0) return results;
		pairs.forEach(function(pair) {
			results = results.concat(utils.pairiteration(pair.left, pair.right, threshold));
		});
		results = results.filter(function(v, i) {
			return results.indexOf(v) === i;
		});
		return results;
	},
	getccenter: function(p1, p2, p3) {
		const dx1 = p2.x - p1.x, dy1 = p2.y - p1.y, dx2 = p3.x - p2.x, dy2 = p3.y - p2.y, dx1p = dx1 * cos$3(quart) - dy1 * sin$3(quart), dy1p = dx1 * sin$3(quart) + dy1 * cos$3(quart), dx2p = dx2 * cos$3(quart) - dy2 * sin$3(quart), dy2p = dx2 * sin$3(quart) + dy2 * cos$3(quart), mx1 = (p1.x + p2.x) / 2, my1 = (p1.y + p2.y) / 2, mx2 = (p2.x + p3.x) / 2, my2 = (p2.y + p3.y) / 2, mx1n = mx1 + dx1p, my1n = my1 + dy1p, mx2n = mx2 + dx2p, my2n = my2 + dy2p, arc$1 = utils.lli8(mx1, my1, mx1n, my1n, mx2, my2, mx2n, my2n), r = utils.dist(arc$1, p1);
		let s = atan2(p1.y - arc$1.y, p1.x - arc$1.x), m$1 = atan2(p2.y - arc$1.y, p2.x - arc$1.x), e = atan2(p3.y - arc$1.y, p3.x - arc$1.x), _;
		if (s < e) {
			if (s > m$1 || m$1 > e) s += tau$1;
			if (s > e) {
				_ = e;
				e = s;
				s = _;
			}
		} else if (e < m$1 && m$1 < s) {
			_ = e;
			e = s;
			s = _;
		} else e += tau$1;
		arc$1.s = s;
		arc$1.e = e;
		arc$1.r = r;
		return arc$1;
	},
	numberSort: function(a$1, b$2) {
		return a$1 - b$2;
	}
};

//#endregion
//#region node_modules/.pnpm/bezier-js@6.1.4/node_modules/bezier-js/src/poly-bezier.js
var PolyBezier = class PolyBezier {
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
		}).reduce(function(a$1, b$2) {
			return a$1 + b$2;
		});
	}
	curve(idx) {
		return this.curves[idx];
	}
	bbox() {
		const c$1 = this.curves;
		var bbox$6 = c$1[0].bbox();
		for (var i = 1; i < c$1.length; i++) utils.expandbox(bbox$6, c$1[i].bbox());
		return bbox$6;
	}
	offset(d$1) {
		const offset$1 = [];
		this.curves.forEach(function(v) {
			offset$1.push(...v.offset(d$1));
		});
		return new PolyBezier(offset$1);
	}
};

//#endregion
//#region node_modules/.pnpm/bezier-js@6.1.4/node_modules/bezier-js/src/bezier.js
const { abs, min: min$2, max: max$3, cos: cos$2, sin: sin$2, acos, sqrt: sqrt$2 } = Math;
const pi$2 = Math.PI;
var Bezier = class Bezier {
	constructor(coords) {
		let args = coords && coords.forEach ? coords : Array.from(arguments).slice();
		let coordlen = false;
		if (typeof args[0] === "object") {
			coordlen = args.length;
			const newargs = [];
			args.forEach(function(point$2) {
				[
					"x",
					"y",
					"z"
				].forEach(function(d$1) {
					if (typeof point$2[d$1] !== "undefined") newargs.push(point$2[d$1]);
				});
			});
			args = newargs;
		}
		let higher = false;
		const len = args.length;
		if (coordlen) {
			if (coordlen > 4) {
				if (arguments.length !== 1) throw new Error("Only new Bezier(point[]) is accepted for 4th and higher order curves");
				higher = true;
			}
		} else if (len !== 6 && len !== 8 && len !== 9 && len !== 12) {
			if (arguments.length !== 1) throw new Error("Only new Bezier(point[]) is accepted for 4th and higher order curves");
		}
		const _3d = this._3d = !higher && (len === 9 || len === 12) || coords && coords[0] && typeof coords[0].z !== "undefined";
		const points = this.points = [];
		for (let idx = 0, step = _3d ? 3 : 2; idx < len; idx += step) {
			var point$1 = {
				x: args[idx],
				y: args[idx + 1]
			};
			if (_3d) point$1.z = args[idx + 2];
			points.push(point$1);
		}
		const order = this.order = points.length - 1;
		const dims = this.dims = ["x", "y"];
		if (_3d) dims.push("z");
		this.dimlen = dims.length;
		const aligned = utils.align(points, {
			p1: points[0],
			p2: points[order]
		});
		const baselength = utils.dist(points[0], points[order]);
		this._linear = aligned.reduce((t$1, p$1) => t$1 + abs(p$1.y), 0) < baselength / 50;
		this._lut = [];
		this._t1 = 0;
		this._t2 = 1;
		this.update();
	}
	static quadraticFromPoints(p1, p2, p3, t$1) {
		if (typeof t$1 === "undefined") t$1 = .5;
		if (t$1 === 0) return new Bezier(p2, p2, p3);
		if (t$1 === 1) return new Bezier(p1, p2, p2);
		const abc = Bezier.getABC(2, p1, p2, p3, t$1);
		return new Bezier(p1, abc.A, p3);
	}
	static cubicFromPoints(S, B, E, t$1, d1) {
		if (typeof t$1 === "undefined") t$1 = .5;
		const abc = Bezier.getABC(3, S, B, E, t$1);
		if (typeof d1 === "undefined") d1 = utils.dist(B, abc.C);
		const d2 = d1 * (1 - t$1) / t$1;
		const selen = utils.dist(S, E), lx = (E.x - S.x) / selen, ly = (E.y - S.y) / selen, bx1 = d1 * lx, by1 = d1 * ly, bx2 = d2 * lx, by2 = d2 * ly;
		const e1 = {
			x: B.x - bx1,
			y: B.y - by1
		}, e2 = {
			x: B.x + bx2,
			y: B.y + by2
		}, A = abc.A, v1 = {
			x: A.x + (e1.x - A.x) / (1 - t$1),
			y: A.y + (e1.y - A.y) / (1 - t$1)
		}, v2 = {
			x: A.x + (e2.x - A.x) / t$1,
			y: A.y + (e2.y - A.y) / t$1
		}, nc1 = {
			x: S.x + (v1.x - S.x) / t$1,
			y: S.y + (v1.y - S.y) / t$1
		}, nc2 = {
			x: E.x + (v2.x - E.x) / (1 - t$1),
			y: E.y + (v2.y - E.y) / (1 - t$1)
		};
		return new Bezier(S, nc1, nc2, E);
	}
	static getUtils() {
		return utils;
	}
	getUtils() {
		return Bezier.getUtils();
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
		const p$1 = this.points, x = p$1[0].x, y = p$1[0].y, s = [
			"M",
			x,
			y,
			this.order === 2 ? "Q" : "C"
		];
		for (let i = 1, last$1 = p$1.length; i < last$1; i++) {
			s.push(p$1[i].x);
			s.push(p$1[i].y);
		}
		return s.join(" ");
	}
	setRatios(ratios) {
		if (ratios.length !== this.points.length) throw new Error("incorrect number of ratio values");
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
		return this.points.map(function(c$1, pos) {
			return "" + pos + c$1.x + c$1.y + (c$1.z ? c$1.z : 0);
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
	static getABC(order = 2, S, B, E, t$1 = .5) {
		const u = utils.projectionratio(t$1, order), um = 1 - u, C = {
			x: u * S.x + um * E.x,
			y: u * S.y + um * E.y
		}, s = utils.abcratio(t$1, order), A = {
			x: B.x + (B.x - C.x) / s,
			y: B.y + (B.y - C.y) / s
		};
		return {
			A,
			B,
			C,
			S,
			E
		};
	}
	getABC(t$1, B) {
		B = B || this.get(t$1);
		let S = this.points[0];
		let E = this.points[this.order];
		return Bezier.getABC(this.order, S, B, E, t$1);
	}
	getLUT(steps$1) {
		this.verify();
		steps$1 = steps$1 || 100;
		if (this._lut.length === steps$1 + 1) return this._lut;
		this._lut = [];
		steps$1++;
		this._lut = [];
		for (let i = 0, p$1, t$1; i < steps$1; i++) {
			t$1 = i / (steps$1 - 1);
			p$1 = this.compute(t$1);
			p$1.t = t$1;
			this._lut.push(p$1);
		}
		return this._lut;
	}
	on(point$1, error) {
		error = error || 5;
		const lut = this.getLUT(), hits = [];
		for (let i = 0, c$1, t$1 = 0; i < lut.length; i++) {
			c$1 = lut[i];
			if (utils.dist(c$1, point$1) < error) {
				hits.push(c$1);
				t$1 += i / lut.length;
			}
		}
		if (!hits.length) return false;
		return t /= hits.length;
	}
	project(point$1) {
		const LUT = this.getLUT(), l = LUT.length - 1, closest = utils.closest(LUT, point$1), mpos = closest.mpos, t1 = (mpos - 1) / l, t2 = (mpos + 1) / l, step = .1 / l;
		let mdist = closest.mdist, t$1 = t1, ft = t$1, p$1;
		mdist += 1;
		for (let d$1; t$1 < t2 + step; t$1 += step) {
			p$1 = this.compute(t$1);
			d$1 = utils.dist(point$1, p$1);
			if (d$1 < mdist) {
				mdist = d$1;
				ft = t$1;
			}
		}
		ft = ft < 0 ? 0 : ft > 1 ? 1 : ft;
		p$1 = this.compute(ft);
		p$1.t = ft;
		p$1.d = mdist;
		return p$1;
	}
	get(t$1) {
		return this.compute(t$1);
	}
	point(idx) {
		return this.points[idx];
	}
	compute(t$1) {
		if (this.ratios) return utils.computeWithRatios(t$1, this.points, this.ratios, this._3d);
		return utils.compute(t$1, this.points, this._3d, this.ratios);
	}
	raise() {
		const p$1 = this.points, np = [p$1[0]], k = p$1.length;
		for (let i = 1, pi$5, pim; i < k; i++) {
			pi$5 = p$1[i];
			pim = p$1[i - 1];
			np[i] = {
				x: (k - i) / k * pi$5.x + i / k * pim.x,
				y: (k - i) / k * pi$5.y + i / k * pim.y
			};
		}
		np[k] = p$1[k - 1];
		return new Bezier(np);
	}
	derivative(t$1) {
		return utils.compute(t$1, this.dpoints[0], this._3d);
	}
	dderivative(t$1) {
		return utils.compute(t$1, this.dpoints[1], this._3d);
	}
	align() {
		let p$1 = this.points;
		return new Bezier(utils.align(p$1, {
			p1: p$1[0],
			p2: p$1[p$1.length - 1]
		}));
	}
	curvature(t$1) {
		return utils.curvature(t$1, this.dpoints[0], this.dpoints[1], this._3d);
	}
	inflections() {
		return utils.inflections(this.points);
	}
	normal(t$1) {
		return this._3d ? this.__normal3(t$1) : this.__normal2(t$1);
	}
	__normal2(t$1) {
		const d$1 = this.derivative(t$1);
		const q = sqrt$2(d$1.x * d$1.x + d$1.y * d$1.y);
		return {
			t: t$1,
			x: -d$1.y / q,
			y: d$1.x / q
		};
	}
	__normal3(t$1) {
		const r1 = this.derivative(t$1), r2 = this.derivative(t$1 + .01), q1 = sqrt$2(r1.x * r1.x + r1.y * r1.y + r1.z * r1.z), q2 = sqrt$2(r2.x * r2.x + r2.y * r2.y + r2.z * r2.z);
		r1.x /= q1;
		r1.y /= q1;
		r1.z /= q1;
		r2.x /= q2;
		r2.y /= q2;
		r2.z /= q2;
		const c$1 = {
			x: r2.y * r1.z - r2.z * r1.y,
			y: r2.z * r1.x - r2.x * r1.z,
			z: r2.x * r1.y - r2.y * r1.x
		};
		const m$1 = sqrt$2(c$1.x * c$1.x + c$1.y * c$1.y + c$1.z * c$1.z);
		c$1.x /= m$1;
		c$1.y /= m$1;
		c$1.z /= m$1;
		const R = [
			c$1.x * c$1.x,
			c$1.x * c$1.y - c$1.z,
			c$1.x * c$1.z + c$1.y,
			c$1.x * c$1.y + c$1.z,
			c$1.y * c$1.y,
			c$1.y * c$1.z - c$1.x,
			c$1.x * c$1.z - c$1.y,
			c$1.y * c$1.z + c$1.x,
			c$1.z * c$1.z
		];
		const n$2 = {
			t: t$1,
			x: R[0] * r1.x + R[1] * r1.y + R[2] * r1.z,
			y: R[3] * r1.x + R[4] * r1.y + R[5] * r1.z,
			z: R[6] * r1.x + R[7] * r1.y + R[8] * r1.z
		};
		return n$2;
	}
	hull(t$1) {
		let p$1 = this.points, _p = [], q = [], idx = 0;
		q[idx++] = p$1[0];
		q[idx++] = p$1[1];
		q[idx++] = p$1[2];
		if (this.order === 3) q[idx++] = p$1[3];
		while (p$1.length > 1) {
			_p = [];
			for (let i = 0, pt, l = p$1.length - 1; i < l; i++) {
				pt = utils.lerp(t$1, p$1[i], p$1[i + 1]);
				q[idx++] = pt;
				_p.push(pt);
			}
			p$1 = _p;
		}
		return q;
	}
	split(t1, t2) {
		if (t1 === 0 && !!t2) return this.split(t2).left;
		if (t2 === 1) return this.split(t1).right;
		const q = this.hull(t1);
		const result = {
			left: this.order === 2 ? new Bezier([
				q[0],
				q[3],
				q[5]
			]) : new Bezier([
				q[0],
				q[4],
				q[7],
				q[9]
			]),
			right: this.order === 2 ? new Bezier([
				q[5],
				q[4],
				q[2]
			]) : new Bezier([
				q[9],
				q[8],
				q[6],
				q[3]
			]),
			span: q
		};
		result.left._t1 = utils.map(0, 0, 1, this._t1, this._t2);
		result.left._t2 = utils.map(t1, 0, 1, this._t1, this._t2);
		result.right._t1 = utils.map(t1, 0, 1, this._t1, this._t2);
		result.right._t2 = utils.map(1, 0, 1, this._t1, this._t2);
		if (!t2) return result;
		t2 = utils.map(t2, t1, 1, 0, 1);
		return result.right.split(t2).left;
	}
	extrema() {
		const result = {};
		let roots = [];
		this.dims.forEach(function(dim) {
			let mfn = function(v) {
				return v[dim];
			};
			let p$1 = this.dpoints[0].map(mfn);
			result[dim] = utils.droots(p$1);
			if (this.order === 3) {
				p$1 = this.dpoints[1].map(mfn);
				result[dim] = result[dim].concat(utils.droots(p$1));
			}
			result[dim] = result[dim].filter(function(t$1) {
				return t$1 >= 0 && t$1 <= 1;
			});
			roots = roots.concat(result[dim].sort(utils.numberSort));
		}.bind(this));
		result.values = roots.sort(utils.numberSort).filter(function(v, idx) {
			return roots.indexOf(v) === idx;
		});
		return result;
	}
	bbox() {
		const extrema = this.extrema(), result = {};
		this.dims.forEach(function(d$1) {
			result[d$1] = utils.getminmax(this, d$1, extrema[d$1]);
		}.bind(this));
		return result;
	}
	overlaps(curve) {
		const lbbox = this.bbox(), tbbox = curve.bbox();
		return utils.bboxoverlap(lbbox, tbbox);
	}
	offset(t$1, d$1) {
		if (typeof d$1 !== "undefined") {
			const c$1 = this.get(t$1), n$2 = this.normal(t$1);
			const ret = {
				c: c$1,
				n: n$2,
				x: c$1.x + n$2.x * d$1,
				y: c$1.y + n$2.y * d$1
			};
			if (this._3d) ret.z = c$1.z + n$2.z * d$1;
			return ret;
		}
		if (this._linear) {
			const nv = this.normal(0), coords = this.points.map(function(p$1) {
				const ret = {
					x: p$1.x + t$1 * nv.x,
					y: p$1.y + t$1 * nv.y
				};
				if (p$1.z && nv.z) ret.z = p$1.z + t$1 * nv.z;
				return ret;
			});
			return [new Bezier(coords)];
		}
		return this.reduce().map(function(s) {
			if (s._linear) return s.offset(t$1)[0];
			return s.scale(t$1);
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
		if (this._3d) s += n1.z * n2.z;
		return abs(acos(s)) < pi$2 / 3;
	}
	reduce() {
		let i, t1 = 0, t2 = 0, step = .01, segment, pass1 = [], pass2 = [];
		let extrema = this.extrema().values;
		if (extrema.indexOf(0) === -1) extrema = [0].concat(extrema);
		if (extrema.indexOf(1) === -1) extrema.push(1);
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
			while (t2 <= 1) for (t2 = t1 + step; t2 <= 1 + step; t2 += step) {
				segment = p1.split(t1, t2);
				if (!segment.simple()) {
					t2 -= step;
					if (abs(t1 - t2) < step) return [];
					segment = p1.split(t1, t2);
					segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
					segment._t2 = utils.map(t2, 0, 1, p1._t1, p1._t2);
					pass2.push(segment);
					t1 = t2;
					break;
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
		let d$1 = this.points.map((_, i) => (1 - i / o) * d1 + i / o * d2);
		return new Bezier(this.points.map((p$1, i) => ({
			x: p$1.x + v.x * d$1[i],
			y: p$1.y + v.y * d$1[i]
		})));
	}
	scale(d$1) {
		const order = this.order;
		let distanceFn = false;
		if (typeof d$1 === "function") distanceFn = d$1;
		if (distanceFn && order === 2) return this.raise().scale(distanceFn);
		const clockwise = this.clockwise;
		const points = this.points;
		if (this._linear) return this.translate(this.normal(0), distanceFn ? distanceFn(0) : d$1, distanceFn ? distanceFn(1) : d$1);
		const r1 = distanceFn ? distanceFn(0) : d$1;
		const r2 = distanceFn ? distanceFn(1) : d$1;
		const v = [this.offset(0, 10), this.offset(1, 10)];
		const np = [];
		const o = utils.lli4(v[0], v[0].c, v[1], v[1].c);
		if (!o) throw new Error("cannot scale this curve. Try reducing it first.");
		[0, 1].forEach(function(t$1) {
			const p$1 = np[t$1 * order] = utils.copy(points[t$1 * order]);
			p$1.x += (t$1 ? r2 : r1) * v[t$1].n.x;
			p$1.y += (t$1 ? r2 : r1) * v[t$1].n.y;
		});
		if (!distanceFn) {
			[0, 1].forEach((t$1) => {
				if (order === 2 && !!t$1) return;
				const p$1 = np[t$1 * order];
				const d$2 = this.derivative(t$1);
				const p2 = {
					x: p$1.x + d$2.x,
					y: p$1.y + d$2.y
				};
				np[t$1 + 1] = utils.lli4(p$1, p2, o, points[t$1 + 1]);
			});
			return new Bezier(np);
		}
		[0, 1].forEach(function(t$1) {
			if (order === 2 && !!t$1) return;
			var p$1 = points[t$1 + 1];
			var ov = {
				x: p$1.x - o.x,
				y: p$1.y - o.y
			};
			var rc = distanceFn ? distanceFn((t$1 + 1) / order) : d$1;
			if (distanceFn && !clockwise) rc = -rc;
			var m$1 = sqrt$2(ov.x * ov.x + ov.y * ov.y);
			ov.x /= m$1;
			ov.y /= m$1;
			np[t$1 + 1] = {
				x: p$1.x + rc * ov.x,
				y: p$1.y + rc * ov.y
			};
		});
		return new Bezier(np);
	}
	outline(d1, d2, d3, d4) {
		d2 = d2 === void 0 ? d1 : d2;
		if (this._linear) {
			const n$2 = this.normal(0);
			const start = this.points[0];
			const end = this.points[this.points.length - 1];
			let s, mid, e;
			if (d3 === void 0) {
				d3 = d1;
				d4 = d2;
			}
			s = {
				x: start.x + n$2.x * d1,
				y: start.y + n$2.y * d1
			};
			e = {
				x: end.x + n$2.x * d3,
				y: end.y + n$2.y * d3
			};
			mid = {
				x: (s.x + e.x) / 2,
				y: (s.y + e.y) / 2
			};
			const fline = [
				s,
				mid,
				e
			];
			s = {
				x: start.x - n$2.x * d2,
				y: start.y - n$2.y * d2
			};
			e = {
				x: end.x - n$2.x * d4,
				y: end.y - n$2.y * d4
			};
			mid = {
				x: (s.x + e.x) / 2,
				y: (s.y + e.y) / 2
			};
			const bline = [
				e,
				mid,
				s
			];
			const ls$1 = utils.makeline(bline[2], fline[0]);
			const le$1 = utils.makeline(fline[2], bline[0]);
			const segments$1 = [
				ls$1,
				new Bezier(fline),
				le$1,
				new Bezier(bline)
			];
			return new PolyBezier(segments$1);
		}
		const reduced = this.reduce(), len = reduced.length, fcurves = [];
		let bcurves = [], p$1, alen = 0, tlen = this.length();
		const graduated = typeof d3 !== "undefined" && typeof d4 !== "undefined";
		function linearDistanceFunction(s, e, tlen$1, alen$1, slen) {
			return function(v) {
				const f1 = alen$1 / tlen$1, f2 = (alen$1 + slen) / tlen$1, d$1 = e - s;
				return utils.map(v, 0, 1, s + f1 * d$1, s + f2 * d$1);
			};
		}
		reduced.forEach(function(segment) {
			const slen = segment.length();
			if (graduated) {
				fcurves.push(segment.scale(linearDistanceFunction(d1, d3, tlen, alen, slen)));
				bcurves.push(segment.scale(linearDistanceFunction(-d2, -d4, tlen, alen, slen)));
			} else {
				fcurves.push(segment.scale(d1));
				bcurves.push(segment.scale(-d2));
			}
			alen += slen;
		});
		bcurves = bcurves.map(function(s) {
			p$1 = s.points;
			if (p$1[3]) s.points = [
				p$1[3],
				p$1[2],
				p$1[1],
				p$1[0]
			];
			else s.points = [
				p$1[2],
				p$1[1],
				p$1[0]
			];
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
			const shape = utils.makeshape(outline[i], outline[len - i], curveIntersectionThreshold);
			shape.startcap.virtual = i > 1;
			shape.endcap.virtual = i < len / 2 - 1;
			shapes.push(shape);
		}
		return shapes;
	}
	intersects(curve, curveIntersectionThreshold) {
		if (!curve) return this.selfintersects(curveIntersectionThreshold);
		if (curve.p1 && curve.p2) return this.lineIntersects(curve);
		if (curve instanceof Bezier) curve = curve.reduce();
		return this.curveintersects(this.reduce(), curve, curveIntersectionThreshold);
	}
	lineIntersects(line$2) {
		const mx = min$2(line$2.p1.x, line$2.p2.x), my = min$2(line$2.p1.y, line$2.p2.y), MX = max$3(line$2.p1.x, line$2.p2.x), MY = max$3(line$2.p1.y, line$2.p2.y);
		return utils.roots(this.points, line$2).filter((t$1) => {
			var p$1 = this.get(t$1);
			return utils.between(p$1.x, mx, MX) && utils.between(p$1.y, my, MY);
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
	curveintersects(c1$3, c2$3, curveIntersectionThreshold) {
		const pairs = [];
		c1$3.forEach(function(l) {
			c2$3.forEach(function(r) {
				if (l.overlaps(r)) pairs.push({
					left: l,
					right: r
				});
			});
		});
		let intersections$1 = [];
		pairs.forEach(function(pair) {
			const result = utils.pairiteration(pair.left, pair.right, curveIntersectionThreshold);
			if (result.length > 0) intersections$1 = intersections$1.concat(result);
		});
		return intersections$1;
	}
	arcs(errorThreshold) {
		errorThreshold = errorThreshold || .5;
		return this._iterate(errorThreshold, []);
	}
	_error(pc, np1, s, e) {
		const q = (e - s) / 4, c1$3 = this.get(s + q), c2$3 = this.get(e - q), ref = utils.dist(pc, np1), d1 = utils.dist(pc, c1$3), d2 = utils.dist(pc, c2$3);
		return abs(d1 - ref) + abs(d2 - ref);
	}
	_iterate(errorThreshold, circles) {
		let t_s = 0, t_e = 1, safety;
		do {
			safety = 0;
			t_e = 1;
			let np1 = this.get(t_s), np2, np3, arc$1, prev_arc;
			let curr_good = false, prev_good = false, done;
			let t_m = t_e, prev_e = 1, step = 0;
			do {
				prev_good = curr_good;
				prev_arc = arc$1;
				t_m = (t_s + t_e) / 2;
				step++;
				np2 = this.get(t_m);
				np3 = this.get(t_e);
				arc$1 = utils.getccenter(np1, np2, np3);
				arc$1.interval = {
					start: t_s,
					end: t_e
				};
				let error = this._error(arc$1, np1, t_s, t_e);
				curr_good = error <= errorThreshold;
				done = prev_good && !curr_good;
				if (!done) prev_e = t_e;
				if (curr_good) {
					if (t_e >= 1) {
						arc$1.interval.end = prev_e = 1;
						prev_arc = arc$1;
						if (t_e > 1) {
							let d$1 = {
								x: arc$1.x + arc$1.r * cos$2(arc$1.e),
								y: arc$1.y + arc$1.r * sin$2(arc$1.e)
							};
							arc$1.e += utils.angle({
								x: arc$1.x,
								y: arc$1.y
							}, d$1, this.get(1));
						}
						break;
					}
					t_e = t_e + (t_e - t_s) / 2;
				} else t_e = t_m;
			} while (!done && safety++ < 100);
			if (safety >= 100) break;
			prev_arc = prev_arc ? prev_arc : arc$1;
			circles.push(prev_arc);
			t_s = prev_e;
		} while (t_e < 1);
		return circles;
	}
};

//#endregion
//#region packages/geometry/src/bezier/index.ts
var bezier_exports = {};
__export(bezier_exports, {
	cubic: () => cubic,
	interpolator: () => interpolator$1,
	isCubicBezier: () => isCubicBezier,
	isQuadraticBezier: () => isQuadraticBezier,
	quadratic: () => quadratic,
	quadraticSimple: () => quadraticSimple,
	quadraticToSvgString: () => quadraticToSvgString,
	toPath: () => toPath$1
});
const quadraticSimple = (start, end, bend = 0) => {
	if (Number.isNaN(bend)) throw new Error(`bend is NaN`);
	if (bend < -1 || bend > 1) throw new Error(`Expects bend range of -1 to 1`);
	const middle = interpolate$8(.5, start, end);
	let target = middle;
	if (end.y < start.y) target = bend > 0 ? {
		x: Math.min(start.x, end.x),
		y: Math.min(start.y, end.y)
	} : {
		x: Math.max(start.x, end.x),
		y: Math.max(start.y, end.y)
	};
	else target = bend > 0 ? {
		x: Math.max(start.x, end.x),
		y: Math.min(start.y, end.y)
	} : {
		x: Math.min(start.x, end.x),
		y: Math.max(start.y, end.y)
	};
	const handle = interpolate$8(Math.abs(bend), middle, target);
	return quadratic(start, end, handle);
};
const interpolator$1 = (q) => {
	const bzr = isCubicBezier(q) ? new Bezier(q.a.x, q.a.y, q.cubic1.x, q.cubic1.y, q.cubic2.x, q.cubic2.y, q.b.x, q.b.y) : new Bezier(q.a, q.quadratic, q.b);
	return (amount) => bzr.compute(amount);
};
const quadraticToSvgString = (start, end, handle) => [`M ${start.x} ${start.y} Q ${handle.x} ${handle.y} ${end.x} ${end.y}`];
const toPath$1 = (cubicOrQuadratic) => {
	if (isCubicBezier(cubicOrQuadratic)) return cubicToPath(cubicOrQuadratic);
	else if (isQuadraticBezier(cubicOrQuadratic)) return quadratictoPath(cubicOrQuadratic);
	else throw new Error(`Unknown bezier type`);
};
const cubic = (start, end, cubic1, cubic2) => ({
	a: Object.freeze(start),
	b: Object.freeze(end),
	cubic1: Object.freeze(cubic1),
	cubic2: Object.freeze(cubic2)
});
const cubicToPath = (cubic$1) => {
	const { a: a$1, cubic1, cubic2, b: b$2 } = cubic$1;
	const bzr = new Bezier(a$1, cubic1, cubic2, b$2);
	return Object.freeze({
		...cubic$1,
		length: () => bzr.length(),
		interpolate: (t$1) => bzr.compute(t$1),
		nearest: (_) => {
			throw new Error(`not implemented`);
		},
		bbox: () => {
			const { x, y } = bzr.bbox();
			const xSize = x.size;
			const ySize = y.size;
			if (xSize === void 0) throw new Error(`x.size not present on calculated bbox`);
			if (ySize === void 0) throw new Error(`x.size not present on calculated bbox`);
			return fromTopLeft({
				x: x.min,
				y: y.min
			}, xSize, ySize);
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
const quadratic = (start, end, handle) => ({
	a: Object.freeze(start),
	b: Object.freeze(end),
	quadratic: Object.freeze(handle)
});
const quadratictoPath = (quadraticBezier$1) => {
	const { a: a$1, b: b$2, quadratic: quadratic$1 } = quadraticBezier$1;
	const bzr = new Bezier(a$1, quadratic$1, b$2);
	return Object.freeze({
		...quadraticBezier$1,
		length: () => bzr.length(),
		interpolate: (t$1) => bzr.compute(t$1),
		nearest: (_) => {
			throw new Error(`not implemented`);
		},
		bbox: () => {
			const { x, y } = bzr.bbox();
			const xSize = x.size;
			const ySize = y.size;
			if (xSize === void 0) throw new Error(`x.size not present on calculated bbox`);
			if (ySize === void 0) throw new Error(`x.size not present on calculated bbox`);
			return fromTopLeft({
				x: x.min,
				y: y.min
			}, xSize, ySize);
		},
		distanceToPoint: (_point) => {
			throw new Error(`Not implemented`);
		},
		relativePosition: (_point, _intersectionThreshold) => {
			throw new Error(`Not implemented`);
		},
		toString: () => bzr.toString(),
		toSvgString: () => quadraticToSvgString(a$1, b$2, quadratic$1),
		kind: `bezier/quadratic`
	});
};

//#endregion
//#region packages/geometry/src/ellipse.ts
var ellipse_exports = {};
__export(ellipse_exports, { fromDegrees: () => fromDegrees$1 });
const fromDegrees$1 = (radiusX, radiusY, rotationDeg = 0, startAngleDeg = 0, endAngleDeg = 360) => ({
	radiusX,
	radiusY,
	rotation: degreeToRadian(rotationDeg),
	startAngle: degreeToRadian(startAngleDeg),
	endAngle: degreeToRadian(endAngleDeg)
});

//#endregion
//#region packages/geometry/src/curve-simplification.ts
var curve_simplification_exports = {};
__export(curve_simplification_exports, {
	rdpPerpendicularDistance: () => rdpPerpendicularDistance,
	rdpShortestDistance: () => rdpShortestDistance
});
const rdpShortestDistance = (points, epsilon$1 = .1) => {
	const firstPoint = points[0];
	const lastPoint = points.at(-1);
	if (points.length < 3) return points;
	let index = -1;
	let distribution = 0;
	for (let index_ = 1; index_ < points.length - 1; index_++) {
		const cDistribution = distanceFromPointToLine(points[index_], firstPoint, lastPoint);
		if (cDistribution > distribution) {
			distribution = cDistribution;
			index = index_;
		}
	}
	if (distribution > epsilon$1) {
		const l1 = points.slice(0, index + 1);
		const l2 = points.slice(index);
		const r1 = rdpShortestDistance(l1, epsilon$1);
		const r2 = rdpShortestDistance(l2, epsilon$1);
		const rs = [...r1.slice(0, -1), ...r2];
		return rs;
	} else return [firstPoint, lastPoint];
};
const rdpPerpendicularDistance = (points, epsilon$1 = .1) => {
	const firstPoint = points[0];
	const lastPoint = points.at(-1);
	if (points.length < 3) return points;
	let index = -1;
	let distribution = 0;
	for (let index_ = 1; index_ < points.length - 1; index_++) {
		const cDistribution = findPerpendicularDistance(points[index_], firstPoint, lastPoint);
		if (cDistribution > distribution) {
			distribution = cDistribution;
			index = index_;
		}
	}
	if (distribution > epsilon$1) {
		const l1 = points.slice(0, index + 1);
		const l2 = points.slice(index);
		const r1 = rdpPerpendicularDistance(l1, epsilon$1);
		const r2 = rdpPerpendicularDistance(l2, epsilon$1);
		const rs = [...r1.slice(0, -1), ...r2];
		return rs;
	} else return [firstPoint, lastPoint];
};
function findPerpendicularDistance(p$1, p1, p2) {
	let result;
	let slope$1;
	let intercept;
	if (p1.x == p2.x) result = Math.abs(p$1.x - p1.x);
	else {
		slope$1 = (p2.y - p1.y) / (p2.x - p1.x);
		intercept = p1.y - slope$1 * p1.x;
		result = Math.abs(slope$1 * p$1.x - p$1.y + intercept) / Math.sqrt(Math.pow(slope$1, 2) + 1);
	}
	return result;
}
const distanceFromPointToLine = (p$1, index, index_) => {
	const lineLength = distance$2(index, index_);
	if (lineLength == 0) return distance$2(p$1, index);
	const t$1 = ((p$1.x - index.x) * (index_.x - index.x) + (p$1.y - index.y) * (index_.y - index.y)) / lineLength;
	if (t$1 < 0) return distance$2(p$1, index);
	if (t$1 > 1) return distance$2(p$1, index_);
	return distance$2(p$1, {
		x: index.x + t$1 * (index_.x - index.x),
		y: index.y + t$1 * (index_.y - index.y)
	});
};

//#endregion
//#region packages/geometry/src/quad-tree.ts
var quad_tree_exports = {};
__export(quad_tree_exports, {
	Direction: () => Direction,
	QuadTreeNode: () => QuadTreeNode,
	quadTree: () => quadTree
});
let Direction = /* @__PURE__ */ function(Direction$1) {
	Direction$1[Direction$1["Nw"] = 0] = "Nw";
	Direction$1[Direction$1["Ne"] = 1] = "Ne";
	Direction$1[Direction$1["Sw"] = 2] = "Sw";
	Direction$1[Direction$1["Se"] = 3] = "Se";
	return Direction$1;
}({});
const quadTree = (bounds, initialData = [], opts = {}) => {
	const o = {
		maxItems: opts.maxItems ?? 4,
		maxLevels: opts.maxLevels ?? 4
	};
	const n$2 = new QuadTreeNode(void 0, bounds, 0, o);
	for (const d$1 of initialData) n$2.add(d$1);
	return n$2;
};
var QuadTreeNode = class QuadTreeNode {
	#items = [];
	#children = [];
	#parent;
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
	getLengthChildren() {
		return this.#children.length;
	}
	*parents() {
		let n$2 = this;
		while (n$2.#parent !== void 0) {
			yield n$2.#parent;
			n$2 = n$2.#parent;
		}
	}
	getParent() {
		return this.#parent;
	}
	/**
	* Iterates over immediate children
	*/
	*children() {
		for (const c$1 of this.#children) yield c$1;
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
	direction(d$1) {
		return this.#children[d$1];
	}
	/**
	* Add an item to the quadtree
	* @param p
	* @returns False if item is outside of boundary, True if item was added
	*/
	add(p$1) {
		if (!isIntersecting(this.boundary, p$1)) return false;
		if (this.#children.length > 0) {
			for (const d$1 of this.#children) d$1.add(p$1);
			return true;
		}
		this.#items.push(p$1);
		if (this.#items.length > this.opts.maxItems && this.level < this.opts.maxLevels) {
			if (this.#children.length === 0) this.#subdivide();
			for (const item of this.#items) for (const d$1 of this.#children) d$1.add(item);
			this.#items = [];
		}
		return true;
	}
	/**
	* Returns true if point is inside node's boundary
	* @param p
	* @returns
	*/
	couldHold(p$1) {
		return intersectsPoint(this.boundary, p$1);
	}
	#subdivide() {
		const w = this.boundary.width / 2;
		const h = this.boundary.height / 2;
		const x = this.boundary.x;
		const y = this.boundary.y;
		const coords = fromNumbers$1(x + w, y, x, y, x, y + h, x + w, y + h);
		const rects = coords.map((p$1) => fromTopLeft(p$1, w, h));
		this.#children = rects.map((r) => new QuadTreeNode(this, r, this.level + 1, this.opts));
	}
};

//#endregion
//#region packages/geometry/src/scaler.ts
const scaler = (scaleBy = `both`, defaultRect) => {
	const defaultBounds = defaultRect ?? Placeholder;
	let sw = 1;
	let sh = 1;
	let s = {
		x: 1,
		y: 1
	};
	const computeScale = () => {
		switch (scaleBy) {
			case `height`: return {
				x: sh,
				y: sh
			};
			case `width`: return {
				x: sw,
				y: sw
			};
			case `min`: return {
				x: Math.min(sw, sh),
				y: Math.min(sw, sh)
			};
			case `max`: return {
				x: Math.max(sw, sh),
				y: Math.max(sw, sh)
			};
			default: return {
				x: sw,
				y: sh
			};
		}
	};
	const normalise$3 = (a$1, b$2, c$1, d$1) => {
		let inX = Number.NaN;
		let inY = Number.NaN;
		let outW = defaultBounds.width;
		let outH = defaultBounds.height;
		if (typeof a$1 === `number`) {
			inX = a$1;
			if (typeof b$2 === `number`) {
				inY = b$2;
				if (c$1 === void 0) return [
					inX,
					inY,
					outW,
					outH
				];
				if (isRect(c$1)) {
					outW = c$1.width;
					outH = c$1.height;
				} else if (typeof c$1 === `number`) {
					outW = c$1;
					if (typeof d$1 === `number`) outH = d$1;
					else throw new TypeError(`Missing final height value`);
				} else throw new Error(`Missing valid output range`);
			} else if (isRect(b$2)) {
				outW = b$2.width;
				outH = b$2.height;
			} else throw new Error(`Expected input y or output Rect to follow first number parameter`);
		} else if (isPoint(a$1)) {
			inX = a$1.x;
			inY = a$1.y;
			if (b$2 === void 0) return [
				inX,
				inY,
				outW,
				outH
			];
			if (isRect(b$2)) {
				outW = b$2.width;
				outH = b$2.height;
			} else if (typeof b$2 === `number`) {
				outW = b$2;
				if (typeof c$1 === `number`) outH = c$1;
				else throw new TypeError(`Expected height as third parameter after Point and output width`);
			} else throw new TypeError(`Expected Rect or width as second parameter when first parameter is a Point`);
		} else throw new Error(`Expected input Point or x value as first parameter`);
		return [
			inX,
			inY,
			outW,
			outH
		];
	};
	const scaleAbs = (a$1, b$2, c$1, d$1) => {
		const n$2 = normalise$3(a$1, b$2, c$1, d$1);
		return scaleNormalised(true, ...n$2);
	};
	const scaleRel = (a$1, b$2, c$1, d$1) => {
		const n$2 = normalise$3(a$1, b$2, c$1, d$1);
		return scaleNormalised(false, ...n$2);
	};
	const scaleNormalised = (abs$3, x, y, w, h) => {
		if (Number.isNaN(w)) throw new Error(`Output width range missing`);
		if (Number.isNaN(h)) throw new Error(`Output height range missing`);
		if (w !== sw || h !== sh) {
			sw = w;
			sh = h;
			s = computeScale();
		}
		return abs$3 ? {
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

//#endregion
//#region packages/geometry/src/arc/index.ts
var arc_exports = {};
__export(arc_exports, {
	angularSize: () => angularSize,
	bbox: () => bbox$1,
	distanceCenter: () => distanceCenter,
	fromCircle: () => fromCircle,
	fromCircleAmount: () => fromCircleAmount,
	fromDegrees: () => fromDegrees,
	getStartEnd: () => getStartEnd,
	guard: () => guard$1,
	interpolate: () => interpolate$3,
	isArc: () => isArc,
	isEqual: () => isEqual,
	isPositioned: () => isPositioned,
	length: () => length,
	point: () => point,
	toLine: () => toLine,
	toPath: () => toPath,
	toSvg: () => toSvg
});
const isArc = (p$1) => p$1.startRadian !== void 0 && p$1.endRadian !== void 0 && p$1.clockwise !== void 0;
const isPositioned = (p$1) => p$1.x !== void 0 && p$1.y !== void 0;
const piPi$3 = Math.PI * 2;
function fromDegrees(radius, startDegrees, endDegrees, clockwise, origin) {
	const a$1 = {
		radius,
		startRadian: degreeToRadian(startDegrees),
		endRadian: degreeToRadian(endDegrees),
		clockwise
	};
	if (isPoint(origin)) {
		guard$7(origin);
		const ap = {
			...a$1,
			x: origin.x,
			y: origin.y
		};
		return Object.freeze(ap);
	} else return Object.freeze(a$1);
}
const toLine = (arc$1) => fromPoints$2(point(arc$1, arc$1.startRadian), point(arc$1, arc$1.endRadian));
const getStartEnd = (arc$1, origin) => {
	guard$1(arc$1);
	const start = point(arc$1, arc$1.startRadian, origin);
	const end = point(arc$1, arc$1.endRadian, origin);
	return [start, end];
};
const point = (arc$1, angleRadian$2, origin) => {
	if (origin === void 0) origin = isPositioned(arc$1) ? arc$1 : {
		x: 0,
		y: 0
	};
	return {
		x: Math.cos(angleRadian$2) * arc$1.radius + origin.x,
		y: Math.sin(angleRadian$2) * arc$1.radius + origin.y
	};
};
const guard$1 = (arc$1) => {
	if (arc$1 === void 0) throw new TypeError(`Arc is undefined`);
	if (isPositioned(arc$1)) guard$7(arc$1, `arc`);
	if (arc$1.radius === void 0) throw new TypeError(`Arc radius is undefined (${JSON.stringify(arc$1)})`);
	if (typeof arc$1.radius !== `number`) throw new TypeError(`Radius must be a number`);
	if (Number.isNaN(arc$1.radius)) throw new TypeError(`Radius is NaN`);
	if (arc$1.radius <= 0) throw new TypeError(`Radius must be greater than zero`);
	if (arc$1.startRadian === void 0) throw new TypeError(`Arc is missing 'startRadian' field`);
	if (arc$1.endRadian === void 0) throw new TypeError(`Arc is missing 'startRadian' field`);
	if (Number.isNaN(arc$1.endRadian)) throw new TypeError(`Arc endRadian is NaN`);
	if (Number.isNaN(arc$1.startRadian)) throw new TypeError(`Arc endRadian is NaN`);
	if (arc$1.clockwise === void 0) throw new TypeError(`Arc is missing 'clockwise field`);
	if (arc$1.startRadian >= arc$1.endRadian) throw new TypeError(`startRadian is expected to be les than endRadian`);
};
const interpolate$3 = (amount, arc$1, allowOverflow, origin) => {
	guard$1(arc$1);
	const overflowOk = allowOverflow ?? false;
	if (!overflowOk) {
		if (amount < 0) throw new Error(`Param 'amount' is under zero, and overflow is not allowed`);
		if (amount > 1) throw new Error(`Param 'amount' is above 1 and overflow is not allowed`);
	}
	const span = angularSize(arc$1);
	const rel = span * amount;
	const angle = radiansSum(arc$1.startRadian, rel, arc$1.clockwise);
	return point(arc$1, angle, origin);
};
const angularSize = (arc$1) => radianArc(arc$1.startRadian, arc$1.endRadian, arc$1.clockwise);
const toPath = (arc$1) => {
	guard$1(arc$1);
	return Object.freeze({
		...arc$1,
		nearest: (point$1) => {
			throw new Error(`not implemented`);
		},
		interpolate: (amount) => interpolate$3(amount, arc$1),
		bbox: () => bbox$1(arc$1),
		length: () => length(arc$1),
		toSvgString: () => toSvg(arc$1),
		relativePosition: (_point, _intersectionThreshold) => {
			throw new Error(`Not implemented`);
		},
		distanceToPoint: (_point) => {
			throw new Error(`Not implemented`);
		},
		kind: `arc`
	});
};
const fromCircle = (circle$2, startRadian, endRadian, clockwise = true) => {
	const a$1 = Object.freeze({
		...circle$2,
		endRadian,
		startRadian,
		clockwise
	});
	return a$1;
};
const fromCircleAmount = (circle$2, startRadian, sizeRadian, clockwise = true) => {
	const endRadian = radiansSum(startRadian, sizeRadian, clockwise);
	return fromCircle(circle$2, startRadian, endRadian);
};
const length = (arc$1) => piPi$3 * arc$1.radius * ((arc$1.startRadian - arc$1.endRadian) / piPi$3);
const bbox$1 = (arc$1) => {
	if (isPositioned(arc$1)) {
		const middle = interpolate$3(.5, arc$1);
		const asLine = toLine(arc$1);
		return bbox$5(middle, asLine.a, asLine.b);
	} else return {
		width: arc$1.radius * 2,
		height: arc$1.radius * 2
	};
};
const toSvg = (a$1, b$2, c$1, d$1, e) => {
	if (isArc(a$1)) if (isPositioned(a$1)) if (isPoint(b$2)) return toSvgFull(b$2, a$1.radius, a$1.startRadian, a$1.endRadian, c$1);
	else return toSvgFull(a$1, a$1.radius, a$1.startRadian, a$1.endRadian, b$2);
	else return isPoint(b$2) ? toSvgFull(b$2, a$1.radius, a$1.startRadian, a$1.endRadian, c$1) : toSvgFull({
		x: 0,
		y: 0
	}, a$1.radius, a$1.startRadian, a$1.endRadian);
	else {
		if (c$1 === void 0) throw new Error(`startAngle undefined`);
		if (d$1 === void 0) throw new Error(`endAngle undefined`);
		if (isPoint(a$1)) if (typeof b$2 === `number` && typeof c$1 === `number` && typeof d$1 === `number`) return toSvgFull(a$1, b$2, c$1, d$1, e);
		else throw new TypeError(`Expected (point, number, number, number). Missing a number param.`);
		else throw new Error(`Expected (point, number, number, number). Missing first point.`);
	}
};
const toSvgFull = (origin, radius, startRadian, endRadian, opts) => {
	if (opts === void 0 || typeof opts !== `object`) opts = {};
	const isFullCircle = endRadian - startRadian === 360;
	const start = toCartesian$2(radius, endRadian - .01, origin);
	const end = toCartesian$2(radius, startRadian, origin);
	const { largeArc = false, sweep = false } = opts;
	const d$1 = [`
    M ${start.x} ${start.y}
    A ${radius} ${radius} 0 ${largeArc ? `1` : `0`} ${sweep ? `1` : `0`} ${end.x} ${end.y},
  `];
	if (isFullCircle) d$1.push(`z`);
	return d$1;
};
const distanceCenter = (a$1, b$2) => distance$2(a$1, b$2);
const isEqual = (a$1, b$2) => {
	if (a$1.radius !== b$2.radius) return false;
	if (a$1.endRadian !== b$2.endRadian) return false;
	if (a$1.startRadian !== b$2.startRadian) return false;
	if (a$1.clockwise !== b$2.clockwise) return false;
	if (isPositioned(a$1) && isPositioned(b$2)) {
		if (a$1.x !== b$2.x) return false;
		if (a$1.y !== b$2.y) return false;
		if (a$1.z !== b$2.z) return false;
	} else if (!isPositioned(a$1) && !isPositioned(b$2)) {} else return false;
	return true;
};

//#endregion
//#region packages/geometry/src/surface-points.ts
var surface_points_exports = {};
__export(surface_points_exports, {
	circleRings: () => circleRings,
	circleVogelSpiral: () => circleVogelSpiral,
	sphereFibonacci: () => sphereFibonacci
});
const cos$1 = Math.cos;
const sin$1 = Math.sin;
const asin = Math.asin;
const sqrt$1 = Math.sqrt;
const pow$2 = Math.pow;
const pi$1 = Math.PI;
const piPi$2 = Math.PI * 2;
const goldenAngle = pi$1 * (3 - sqrt$1(5));
const goldenSection = (1 + sqrt$1(5)) / 2;
function* circleVogelSpiral(circle$2, opts = {}) {
	const maxPoints = opts.maxPoints ?? 5e3;
	const density = opts.density ?? .95;
	const rotationOffset = opts.rotation ?? 0;
	const c$1 = toPositioned(circle$2 ?? {
		radius: 1,
		x: 0,
		y: 0
	});
	const max$5 = c$1.radius;
	let spacing = c$1.radius * scale$2(density, 0, 1, .3, .01);
	if (opts.spacing) spacing = opts.spacing;
	let radius = 0;
	let count$2 = 0;
	let angle = 0;
	while (count$2 < maxPoints && radius < max$5) {
		radius = spacing * count$2 ** .5;
		angle = rotationOffset + count$2 * 2 * pi$1 / goldenSection;
		yield Object.freeze({
			x: c$1.x + radius * cos$1(angle),
			y: c$1.y + radius * sin$1(angle)
		});
		count$2++;
	}
}
function* circleRings(circle$2, opts = {}) {
	const rings = opts.rings ?? 5;
	const c$1 = toPositioned(circle$2 ?? {
		radius: 1,
		x: 0,
		y: 0
	});
	const ringR = 1 / rings;
	const rotationOffset = opts.rotation ?? 0;
	let ringCount = 1;
	yield Object.freeze({
		x: c$1.x,
		y: c$1.y
	});
	for (let r = ringR; r <= 1; r += ringR) {
		const n$2 = Math.round(pi$1 / asin(1 / (2 * ringCount)));
		for (const theta of linearSpace(0, piPi$2, n$2 + 1)) yield Object.freeze({
			x: c$1.x + r * cos$1(theta + rotationOffset) * c$1.radius,
			y: c$1.y + r * sin$1(theta + rotationOffset) * c$1.radius
		});
		ringCount++;
	}
}
function* sphereFibonacci(samples = 100, rotationRadians = 0, sphere) {
	const offset$1 = 2 / samples;
	const s = sphere ?? {
		x: 0,
		y: 0,
		z: 0,
		radius: 1
	};
	for (let index = 0; index < samples; index++) {
		const y = index * offset$1 - 1 + offset$1 / 2;
		const r = sqrt$1(1 - pow$2(y, 2));
		const a$1 = (index + 1) % samples * goldenAngle + rotationRadians;
		const x = cos$1(a$1) * r;
		const z = sin$1(a$1) * r;
		yield Object.freeze({
			x: s.x + x * s.radius,
			y: s.y + y * s.radius,
			z: s.z + z * s.radius
		});
	}
}

//#endregion
//#region packages/geometry/src/triangle/angles.ts
const angles = (t$1) => {
	guard$2(t$1);
	return [
		angleRadian$1(t$1.a, t$1.b),
		angleRadian$1(t$1.b, t$1.c),
		angleRadian$1(t$1.c, t$1.a)
	];
};
const anglesDegrees = (t$1) => {
	guard$2(t$1);
	return radianToDegree(angles(t$1));
};

//#endregion
//#region packages/geometry/src/triangle/edges.ts
const edges = (t$1) => {
	guard$2(t$1);
	return joinPointsToLines(t$1.a, t$1.b, t$1.c, t$1.a);
};

//#endregion
//#region packages/geometry/src/triangle/area.ts
const area$3 = (t$1) => {
	guard$2(t$1, `t`);
	const lengths$2 = edges(t$1).map((l) => length$3(l));
	const p$1 = (lengths$2[0] + lengths$2[1] + lengths$2[2]) / 2;
	return Math.sqrt(p$1 * (p$1 - lengths$2[0]) * (p$1 - lengths$2[1]) * (p$1 - lengths$2[2]));
};

//#endregion
//#region packages/geometry/src/triangle/barycentric.ts
const barycentricCoord = (t$1, a$1, b$2) => {
	const pt = getPointParameter(a$1, b$2);
	const ab = (x, y, pa, pb) => (pa.y - pb.y) * x + (pb.x - pa.x) * y + pa.x * pb.y - pb.x * pa.y;
	const alpha = ab(pt.x, pt.y, t$1.b, t$1.c) / ab(t$1.a.x, t$1.a.y, t$1.b, t$1.c);
	const theta = ab(pt.x, pt.y, t$1.c, t$1.a) / ab(t$1.b.x, t$1.b.y, t$1.c, t$1.a);
	const gamma = ab(pt.x, pt.y, t$1.a, t$1.b) / ab(t$1.c.x, t$1.c.y, t$1.a, t$1.b);
	return {
		a: alpha,
		b: theta,
		c: gamma
	};
};
const barycentricToCartestian = (t$1, bc) => {
	guard$2(t$1);
	const { a: a$1, b: b$2, c: c$1 } = t$1;
	const x = a$1.x * bc.a + b$2.x * bc.b + c$1.x * bc.c;
	const y = a$1.y * bc.a + b$2.y * bc.b + c$1.y * bc.c;
	if (a$1.z && b$2.z && c$1.z) {
		const z = a$1.z * bc.a + b$2.z * bc.b + c$1.z * bc.c;
		return Object.freeze({
			x,
			y,
			z
		});
	} else return Object.freeze({
		x,
		y
	});
};

//#endregion
//#region packages/geometry/src/triangle/bbox.ts
const bbox = (t$1, inflation = 0) => {
	const { a: a$1, b: b$2, c: c$1 } = t$1;
	const xMin = Math.min(a$1.x, b$2.x, c$1.x) - inflation;
	const xMax = Math.max(a$1.x, b$2.x, c$1.x) + inflation;
	const yMin = Math.min(a$1.y, b$2.y, c$1.y) - inflation;
	const yMax = Math.max(a$1.y, b$2.y, c$1.y) + inflation;
	const r = {
		x: xMin,
		y: yMin,
		width: xMax - xMin,
		height: yMax - yMin
	};
	return r;
};

//#endregion
//#region packages/geometry/src/triangle/corners.ts
const corners = (t$1) => {
	guard$2(t$1);
	return [
		t$1.a,
		t$1.b,
		t$1.c
	];
};

//#endregion
//#region packages/geometry/src/triangle/from.ts
const fromRadius = (origin, radius, opts = {}) => {
	throwNumberTest(radius, `positive`, `radius`);
	guard$7(origin, `origin`);
	const initialAngleRadian = opts.initialAngleRadian ?? 0;
	const angles$1 = [
		initialAngleRadian,
		initialAngleRadian + piPi$8 * 1 / 3,
		initialAngleRadian + piPi$8 * 2 / 3
	];
	const points = angles$1.map((a$1) => toCartesian$2(radius, a$1, origin));
	return fromPoints(points);
};
const fromFlatArray = (coords) => {
	if (!Array.isArray(coords)) throw new Error(`coords expected as array`);
	if (coords.length !== 6) throw new Error(`coords array expected with 6 elements. Got ${coords.length}`);
	return fromPoints(fromNumbers$1(...coords));
};
const fromPoints = (points) => {
	if (!Array.isArray(points)) throw new Error(`points expected as array`);
	if (points.length !== 3) throw new Error(`points array expected with 3 elements. Got ${points.length}`);
	const t$1 = {
		a: points[0],
		b: points[1],
		c: points[2]
	};
	return t$1;
};

//#endregion
//#region packages/geometry/src/triangle/lengths.ts
const lengths = (t$1) => {
	guard$2(t$1);
	return [
		distance$2(t$1.a, t$1.b),
		distance$2(t$1.b, t$1.c),
		distance$2(t$1.c, t$1.a)
	];
};

//#endregion
//#region packages/geometry/src/triangle/kinds.ts
const isEquilateral = (t$1) => {
	guard$2(t$1);
	const [a$1, b$2, c$1] = lengths(t$1);
	return a$1 === b$2 && b$2 === c$1;
};
const isIsosceles = (t$1) => {
	const [a$1, b$2, c$1] = lengths(t$1);
	if (a$1 === b$2) return true;
	if (b$2 === c$1) return true;
	if (c$1 === a$1) return true;
	return false;
};
const isRightAngle = (t$1) => angles(t$1).includes(Math.PI / 2);
const isOblique = (t$1) => !isRightAngle(t$1);
const isAcute = (t$1) => !angles(t$1).some((v) => v >= Math.PI / 2);
const isObtuse = (t$1) => angles(t$1).some((v) => v > Math.PI / 2);

//#endregion
//#region packages/geometry/src/triangle/perimeter.ts
const perimeter$3 = (t$1) => {
	guard$2(t$1);
	return edges(t$1).reduce((accumulator, v) => accumulator + length$3(v), 0);
};

//#endregion
//#region packages/geometry/src/triangle/inner-circle.ts
const innerCircle = (t$1) => {
	const c$1 = centroid(t$1);
	const p$1 = perimeter$3(t$1) / 2;
	const a$1 = area$3(t$1);
	const radius = a$1 / p$1;
	return {
		radius,
		...c$1
	};
};

//#endregion
//#region packages/geometry/src/triangle/outer-circle.ts
const outerCircle = (t$1) => {
	const [a$1, b$2, c$1] = edges(t$1).map((l) => length$3(l));
	const cent = centroid(t$1);
	const radius = a$1 * b$2 * c$1 / Math.sqrt((a$1 + b$2 + c$1) * (-a$1 + b$2 + c$1) * (a$1 - b$2 + c$1) * (a$1 + b$2 - c$1));
	return {
		radius,
		...cent
	};
};

//#endregion
//#region packages/geometry/src/triangle/rotate.ts
const rotate = (triangle$1, amountRadian, origin) => {
	if (amountRadian === void 0 || amountRadian === 0) return triangle$1;
	if (origin === void 0) origin = centroid(triangle$1);
	return Object.freeze({
		...triangle$1,
		a: rotate$2(triangle$1.a, amountRadian, origin),
		b: rotate$2(triangle$1.b, amountRadian, origin),
		c: rotate$2(triangle$1.c, amountRadian, origin)
	});
};
const rotateByVertex = (triangle$1, amountRadian, vertex = `b`) => {
	const origin = vertex === `a` ? triangle$1.a : vertex === `b` ? triangle$1.b : triangle$1.c;
	return Object.freeze({
		a: rotate$2(triangle$1.a, amountRadian, origin),
		b: rotate$2(triangle$1.b, amountRadian, origin),
		c: rotate$2(triangle$1.c, amountRadian, origin)
	});
};

//#endregion
//#region packages/geometry/src/triangle/equilateral.ts
var equilateral_exports = {};
__export(equilateral_exports, {
	area: () => area$2,
	centerFromA: () => centerFromA,
	centerFromB: () => centerFromB,
	centerFromC: () => centerFromC,
	circumcircle: () => circumcircle$2,
	fromCenter: () => fromCenter$1,
	height: () => height$2,
	incircle: () => incircle$2,
	perimeter: () => perimeter$2
});
const pi4over3 = Math.PI * 4 / 3;
const pi2over3 = Math.PI * 2 / 3;
const resolveLength = (t$1) => {
	if (typeof t$1 === `number`) return t$1;
	return t$1.length;
};
const fromCenter$1 = (t$1, origin, rotationRad) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const r = resolveLength(t$1) / Math.sqrt(3);
	const rot = rotationRad ?? Math.PI * 1.5;
	const b$2 = {
		x: r * Math.cos(rot) + origin.x,
		y: r * Math.sin(rot) + origin.y
	};
	const a$1 = {
		x: r * Math.cos(rot + pi4over3) + origin.x,
		y: r * Math.sin(rot + pi4over3) + origin.y
	};
	const c$1 = {
		x: r * Math.cos(rot + pi2over3) + origin.x,
		y: r * Math.sin(rot + pi2over3) + origin.y
	};
	return Object.freeze({
		a: a$1,
		b: b$2,
		c: c$1
	});
};
const centerFromA = (t$1, ptA) => {
	if (!ptA) ptA = Object.freeze({
		x: 0,
		y: 0
	});
	const r = resolveLength(t$1);
	const { radius } = incircle$2(t$1);
	return {
		x: ptA.x + r / 2,
		y: ptA.y - radius
	};
};
const centerFromB = (t$1, ptB) => {
	if (!ptB) ptB = Object.freeze({
		x: 0,
		y: 0
	});
	const { radius } = incircle$2(t$1);
	return {
		x: ptB.x,
		y: ptB.y + radius * 2
	};
};
const centerFromC = (t$1, ptC) => {
	if (!ptC) ptC = Object.freeze({
		x: 0,
		y: 0
	});
	const r = resolveLength(t$1);
	const { radius } = incircle$2(t$1);
	return {
		x: ptC.x - r / 2,
		y: ptC.y - radius
	};
};
const height$2 = (t$1) => Math.sqrt(3) / 2 * resolveLength(t$1);
const perimeter$2 = (t$1) => resolveLength(t$1) * 3;
const area$2 = (t$1) => Math.pow(resolveLength(t$1), 2) * Math.sqrt(3) / 4;
const circumcircle$2 = (t$1) => ({ radius: Math.sqrt(3) / 3 * resolveLength(t$1) });
const incircle$2 = (t$1) => ({ radius: Math.sqrt(3) / 6 * resolveLength(t$1) });

//#endregion
//#region packages/geometry/src/triangle/right.ts
var right_exports = {};
__export(right_exports, {
	adjacentFromHypotenuse: () => adjacentFromHypotenuse,
	adjacentFromOpposite: () => adjacentFromOpposite,
	angleAtPointA: () => angleAtPointA,
	angleAtPointB: () => angleAtPointB,
	area: () => area$1,
	circumcircle: () => circumcircle$1,
	fromA: () => fromA$1,
	fromB: () => fromB$1,
	fromC: () => fromC$1,
	height: () => height$1,
	hypotenuseFromAdjacent: () => hypotenuseFromAdjacent,
	hypotenuseFromOpposite: () => hypotenuseFromOpposite,
	hypotenuseSegments: () => hypotenuseSegments,
	incircle: () => incircle$1,
	medians: () => medians$1,
	oppositeFromAdjacent: () => oppositeFromAdjacent,
	oppositeFromHypotenuse: () => oppositeFromHypotenuse,
	perimeter: () => perimeter$1,
	resolveLengths: () => resolveLengths
});
const fromA$1 = (t$1, origin) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const tt = resolveLengths(t$1);
	const seg = hypotenuseSegments(t$1);
	const h = height$1(t$1);
	const a$1 = {
		x: origin.x,
		y: origin.y
	};
	const b$2 = {
		x: origin.x + tt.hypotenuse,
		y: origin.y
	};
	const c$1 = {
		x: origin.x + seg[1],
		y: origin.y - h
	};
	return {
		a: a$1,
		b: b$2,
		c: c$1
	};
};
const fromB$1 = (t$1, origin) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const tt = resolveLengths(t$1);
	const seg = hypotenuseSegments(t$1);
	const h = height$1(t$1);
	const b$2 = {
		x: origin.x,
		y: origin.y
	};
	const a$1 = {
		x: origin.x - tt.hypotenuse,
		y: origin.y
	};
	const c$1 = {
		x: origin.x - seg[0],
		y: origin.y - h
	};
	return {
		a: a$1,
		b: b$2,
		c: c$1
	};
};
const fromC$1 = (t$1, origin) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const seg = hypotenuseSegments(t$1);
	const h = height$1(t$1);
	const c$1 = {
		x: origin.x,
		y: origin.y
	};
	const a$1 = {
		x: origin.x - seg[1],
		y: origin.y + h
	};
	const b$2 = {
		x: origin.x + seg[0],
		y: origin.y + h
	};
	return {
		a: a$1,
		b: b$2,
		c: c$1
	};
};
const resolveLengths = (t$1) => {
	const a$1 = t$1.adjacent;
	const o = t$1.opposite;
	const h = t$1.hypotenuse;
	if (a$1 !== void 0 && o !== void 0) return {
		...t$1,
		adjacent: a$1,
		opposite: o,
		hypotenuse: Math.hypot(a$1, o)
	};
	else if (a$1 && h) return {
		...t$1,
		adjacent: a$1,
		hypotenuse: h,
		opposite: h * h - a$1 * a$1
	};
	else if (o && h) return {
		...t$1,
		hypotenuse: h,
		opposite: o,
		adjacent: h * h - o * o
	};
	else if (t$1.opposite && t$1.hypotenuse && t$1.adjacent) return t$1;
	throw new Error(`Missing at least two edges`);
};
const height$1 = (t$1) => {
	const tt = resolveLengths(t$1);
	const p$1 = tt.opposite * tt.opposite / tt.hypotenuse;
	const q = tt.adjacent * tt.adjacent / tt.hypotenuse;
	return Math.sqrt(p$1 * q);
};
const hypotenuseSegments = (t$1) => {
	const tt = resolveLengths(t$1);
	const p$1 = tt.opposite * tt.opposite / tt.hypotenuse;
	const q = tt.adjacent * tt.adjacent / tt.hypotenuse;
	return [p$1, q];
};
const perimeter$1 = (t$1) => {
	const tt = resolveLengths(t$1);
	return tt.adjacent + tt.hypotenuse + tt.opposite;
};
const area$1 = (t$1) => {
	const tt = resolveLengths(t$1);
	return tt.opposite * tt.adjacent / 2;
};
const angleAtPointA = (t$1) => {
	const tt = resolveLengths(t$1);
	return Math.acos((tt.adjacent * tt.adjacent + tt.hypotenuse * tt.hypotenuse - tt.opposite * tt.opposite) / (2 * tt.adjacent * tt.hypotenuse));
};
const angleAtPointB = (t$1) => {
	const tt = resolveLengths(t$1);
	return Math.acos((tt.opposite * tt.opposite + tt.hypotenuse * tt.hypotenuse - tt.adjacent * tt.adjacent) / (2 * tt.opposite * tt.hypotenuse));
};
const medians$1 = (t$1) => {
	const tt = resolveLengths(t$1);
	const b$2 = tt.adjacent * tt.adjacent;
	const c$1 = tt.hypotenuse * tt.hypotenuse;
	const a$1 = tt.opposite * tt.opposite;
	return [
		Math.sqrt(2 * (b$2 + c$1) - a$1) / 2,
		Math.sqrt(2 * (c$1 + a$1) - b$2) / 2,
		Math.sqrt(2 * (a$1 + b$2) - c$1) / 2
	];
};
const circumcircle$1 = (t$1) => {
	const tt = resolveLengths(t$1);
	return { radius: tt.hypotenuse / 2 };
};
const incircle$1 = (t$1) => {
	const tt = resolveLengths(t$1);
	return { radius: (tt.adjacent + tt.opposite - tt.hypotenuse) / 2 };
};
const oppositeFromAdjacent = (angleRad, adjacent) => Math.tan(angleRad) * adjacent;
const oppositeFromHypotenuse = (angleRad, hypotenuse) => Math.sin(angleRad) * hypotenuse;
const adjacentFromHypotenuse = (angleRadian$2, hypotenuse) => Math.cos(angleRadian$2) * hypotenuse;
const adjacentFromOpposite = (angleRadian$2, opposite) => opposite / Math.tan(angleRadian$2);
const hypotenuseFromOpposite = (angleRadian$2, opposite) => opposite / Math.sin(angleRadian$2);
const hypotenuseFromAdjacent = (angleRadian$2, adjacent) => adjacent / Math.cos(angleRadian$2);

//#endregion
//#region packages/geometry/src/triangle/isosceles.ts
var isosceles_exports = {};
__export(isosceles_exports, {
	apexAngle: () => apexAngle,
	area: () => area,
	baseAngle: () => baseAngle,
	circumcircle: () => circumcircle,
	fromA: () => fromA,
	fromB: () => fromB,
	fromC: () => fromC,
	fromCenter: () => fromCenter,
	height: () => height,
	incircle: () => incircle,
	legHeights: () => legHeights,
	medians: () => medians,
	perimeter: () => perimeter
});
const baseAngle = (t$1) => Math.acos(t$1.base / (2 * t$1.legs));
const apexAngle = (t$1) => {
	const aa = t$1.legs * t$1.legs;
	const cc = t$1.base * t$1.base;
	return Math.acos((2 * aa - cc) / (2 * aa));
};
const height = (t$1) => {
	const aa = t$1.legs * t$1.legs;
	const cc = t$1.base * t$1.base;
	return Math.sqrt((4 * aa - cc) / 4);
};
const legHeights = (t$1) => {
	const b$2 = baseAngle(t$1);
	return t$1.base * Math.sin(b$2);
};
const perimeter = (t$1) => 2 * t$1.legs + t$1.base;
const area = (t$1) => {
	const h = height(t$1);
	return h * t$1.base / 2;
};
const circumcircle = (t$1) => {
	const h = height(t$1);
	const hh = h * h;
	const cc = t$1.base * t$1.base;
	return { radius: (4 * hh + cc) / (8 * h) };
};
const incircle = (t$1) => {
	const h = height(t$1);
	return { radius: t$1.base * h / (2 * t$1.legs + t$1.base) };
};
const medians = (t$1) => {
	const aa = t$1.legs * t$1.legs;
	const cc = t$1.base * t$1.base;
	const medianAB = Math.sqrt(aa + 2 * cc) / 2;
	const medianC = Math.sqrt(4 * aa - cc) / 2;
	return [
		medianAB,
		medianAB,
		medianC
	];
};
const fromCenter = (t$1, origin) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const h = height(t$1);
	const incircleR = incircle(t$1).radius;
	const verticalToApex = h - incircleR;
	const a$1 = {
		x: origin.x - t$1.base / 2,
		y: origin.y + incircleR
	};
	const b$2 = {
		x: origin.x + t$1.base / 2,
		y: origin.y + incircleR
	};
	const c$1 = {
		x: origin.x,
		y: origin.y - verticalToApex
	};
	return {
		a: a$1,
		b: b$2,
		c: c$1
	};
};
const fromA = (t$1, origin) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const h = height(t$1);
	const a$1 = {
		x: origin.x,
		y: origin.y
	};
	const b$2 = {
		x: origin.x + t$1.base,
		y: origin.y
	};
	const c$1 = {
		x: origin.x + t$1.base / 2,
		y: origin.y - h
	};
	return {
		a: a$1,
		b: b$2,
		c: c$1
	};
};
const fromB = (t$1, origin) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const h = height(t$1);
	const b$2 = {
		x: origin.x,
		y: origin.y
	};
	const a$1 = {
		x: origin.x - t$1.base,
		y: origin.y
	};
	const c$1 = {
		x: origin.x - t$1.base / 2,
		y: origin.y - h
	};
	return {
		a: a$1,
		b: b$2,
		c: c$1
	};
};
const fromC = (t$1, origin) => {
	if (!origin) origin = Object.freeze({
		x: 0,
		y: 0
	});
	const h = height(t$1);
	const c$1 = {
		x: origin.x,
		y: origin.y
	};
	const a$1 = {
		x: origin.x - t$1.base / 2,
		y: origin.y + h
	};
	const b$2 = {
		x: origin.x + t$1.base / 2,
		y: origin.y + h
	};
	return {
		a: a$1,
		b: b$2,
		c: c$1
	};
};

//#endregion
//#region packages/geometry/src/triangle/index.ts
var triangle_exports = {};
__export(triangle_exports, {
	Empty: () => Empty$1,
	Equilateral: () => equilateral_exports,
	Isosceles: () => isosceles_exports,
	Placeholder: () => Placeholder$1,
	Right: () => right_exports,
	angles: () => angles,
	anglesDegrees: () => anglesDegrees,
	area: () => area$3,
	barycentricCoord: () => barycentricCoord,
	barycentricToCartestian: () => barycentricToCartestian,
	bbox: () => bbox,
	centroid: () => centroid,
	corners: () => corners,
	edges: () => edges,
	equilateralFromVertex: () => equilateralFromVertex,
	fromFlatArray: () => fromFlatArray,
	fromPoints: () => fromPoints,
	fromRadius: () => fromRadius,
	guard: () => guard$2,
	innerCircle: () => innerCircle,
	isAcute: () => isAcute,
	isEmpty: () => isEmpty$2,
	isEqual: () => isEqual$3,
	isEquilateral: () => isEquilateral,
	isIsosceles: () => isIsosceles,
	isOblique: () => isOblique,
	isObtuse: () => isObtuse,
	isPlaceholder: () => isPlaceholder,
	isRightAngle: () => isRightAngle,
	isTriangle: () => isTriangle,
	outerCircle: () => outerCircle,
	perimeter: () => perimeter$3,
	rotate: () => rotate,
	rotateByVertex: () => rotateByVertex
});
/**
* Triangle.
*
* Helpers for creating:
*  - {@link Triangles.fromFlatArray}: Create from [x1, y1, x2, y2, x3, y3]
*  - {@link Triangles.fromPoints}: Create from three `{x,y}` sets
*  - {@link Triangles.fromRadius}: Equilateral triangle of a given radius and center
*/

//#endregion
//#region packages/dom/src/element-sizing.ts
var ElementSizer = class ElementSizer {
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
		this.#size = Empty;
		let naturalSize = options.naturalSize;
		if (naturalSize === void 0) naturalSize = this.#el.getBoundingClientRect();
		this.#naturalRatio = 1;
		this.#naturalSize = naturalSize;
		this.setNaturalSize(naturalSize);
		this.#viewport = EmptyPositioned;
		if (this.#containerEl === document.body) this.#byViewport();
		else this.#byContainer();
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
		const er = new ElementSizer(el, {
			...options,
			onSetSize(size, el$1) {
				el$1.width = size.width;
				el$1.height = size.height;
				if (options.onSetSize) options.onSetSize(size, el$1);
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
		const opts = {
			...options,
			containerEl: document.body
		};
		return this.canvasParent(canvasElementOrQuery, opts);
	}
	/**
	* Size an SVG element to match viewport
	* @param svg 
	* @returns 
	*/
	static svgViewport(svg, onSizeSet) {
		const er = new ElementSizer(svg, {
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
		const c$1 = this.#containerEl;
		if (!c$1) throw new Error(`No container element`);
		const r = new ResizeObserver((entries) => {
			this.#onParentResize(entries);
		});
		r.observe(c$1);
		const current = this.#computeSizeBasedOnParent(c$1.getBoundingClientRect());
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
		this.size = {
			width: window.innerWidth,
			height: window.innerHeight
		};
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
		let { width, height: height$3 } = parentSize;
		let stretch = this.#stretch;
		if (stretch === `min`) stretch = width < height$3 ? `width` : `height`;
		else if (stretch === `max`) stretch = width > height$3 ? `width` : `height`;
		if (stretch === `width`) height$3 = width / this.#naturalRatio;
		else if (stretch === `height`) width = height$3 * this.#naturalRatio;
		if (this.#el instanceof HTMLElement) {
			const b$2 = getComputedPixels(this.#el, `borderTopWidth`, `borderLeftWidth`, `borderRightWidth`, `borderBottomWidth`);
			width -= b$2.borderLeftWidth + b$2.borderRightWidth;
			height$3 -= b$2.borderTopWidth + b$2.borderBottomWidth;
		}
		return {
			width,
			height: height$3
		};
	}
	#onParentResize(args) {
		const box = args[0].contentBoxSize[0];
		const parentSize = {
			width: box.inlineSize,
			height: box.blockSize
		};
		this.size = this.#computeSizeBasedOnParent(parentSize);
		this.#viewport = {
			x: 0,
			y: 0,
			width: parentSize.width,
			height: parentSize.height
		};
	}
	set size(size) {
		guard$5(size, `size`);
		this.#size = size;
		this.#onSetSize(size, this.#el);
	}
	get size() {
		return this.#size;
	}
};

//#endregion
//#region packages/dom/src/set-property.ts
function setText(selectors, value) {
	return setProperty(`textContent`, selectors, value);
}
function setHtml(selectors, value) {
	return setProperty(`innerHTML`, selectors, value);
}
function setProperty(property, selectors, value) {
	let elements = [];
	const set$4 = (v) => {
		const typ = typeof v;
		const vv = typ === `string` || typ === `number` || typ === `boolean` ? v : JSON.stringify(v);
		if (elements.length === 0) elements = resolveEls(selectors);
		for (const element of elements) element[property] = vv;
		return vv;
	};
	return value === void 0 ? set$4 : set$4(value);
}

//#endregion
//#region packages/ixfx/src/dom.ts
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

//#endregion
//#region packages/ixfx/src/numbers.ts
var numbers_exports = {};
__export(numbers_exports, {
	Bipolar: () => bipolar_exports,
	HelloTest: () => HelloTest,
	applyToValues: () => applyToValues,
	array: () => array$1,
	average: () => average$2,
	averageWeighted: () => averageWeighted,
	clamp: () => clamp$3,
	clampIndex: () => clampIndex,
	clamper: () => clamper,
	differenceFromFixed: () => differenceFromFixed,
	differenceFromLast: () => differenceFromLast,
	dotProduct: () => dotProduct$3,
	filterIterable: () => filterIterable,
	flip: () => flip,
	interpolate: () => interpolate$7,
	interpolateAngle: () => interpolateAngle$1,
	interpolatorStepped: () => interpolatorStepped$1,
	isApprox: () => isApprox,
	isCloseTo: () => isCloseTo,
	isValid: () => isValid,
	linearSpace: () => linearSpace,
	max: () => max$4,
	maxFast: () => maxFast,
	maxIndex: () => maxIndex,
	min: () => min$3,
	minFast: () => minFast,
	minIndex: () => minIndex,
	movingAverage: () => movingAverage,
	movingAverageLight: () => movingAverageLight,
	noiseFilter: () => noiseFilter,
	numberArrayCompute: () => numberArrayCompute,
	proportion: () => proportion,
	quantiseEvery: () => quantiseEvery$1,
	rangeInclusive: () => rangeInclusive,
	round: () => round$1,
	scale: () => scale$2,
	scaleClamped: () => scaleClamped,
	scalePercent: () => scalePercent,
	scalePercentages: () => scalePercentages,
	scaler: () => scaler$1,
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
	wrap: () => wrap$5,
	wrapInteger: () => wrapInteger,
	wrapRange: () => wrapRange
});
const HelloTest = () => {
	console.log(`hello test`);
};

//#endregion
//#region packages/collections/src/stack/StackFns.ts
const trimStack = (opts, stack, toAdd) => {
	const potentialLength = stack.length + toAdd.length;
	const policy = opts.discardPolicy ?? `additions`;
	const capacity = opts.capacity ?? potentialLength;
	const toRemove = potentialLength - capacity;
	if (opts.debug) console.log(`Stack.push: stackLen: ${stack.length} potentialLen: ${potentialLength} toRemove: ${toRemove} policy: ${policy}`);
	switch (policy) {
		case `additions`: {
			if (opts.debug) console.log(`Stack.push:DiscardAdditions: stackLen: ${stack.length} slice: ${potentialLength - capacity} toAddLen: ${toAdd.length}`);
			if (stack.length === opts.capacity) return stack;
			else return [...stack, ...toAdd.slice(0, toAdd.length - toRemove)];
		}
		case `newer`: if (toRemove >= stack.length) return toAdd.slice(Math.max(0, toAdd.length - capacity), Math.min(toAdd.length, capacity) + 1);
		else {
			if (opts.debug) console.log(` from orig: ${JSON.stringify(stack.slice(0, stack.length - toRemove))}`);
			return [...stack.slice(0, stack.length - toRemove), ...toAdd.slice(0, Math.min(toAdd.length, capacity - toRemove + 1))];
		}
		case `older`: return [...stack, ...toAdd].slice(toRemove);
		default: throw new Error(`Unknown discard policy ${policy}`);
	}
};
const push = (opts, stack, ...toAdd) => {
	const potentialLength = stack.length + toAdd.length;
	const overSize = opts.capacity && potentialLength > opts.capacity;
	const toReturn = overSize ? trimStack(opts, stack, toAdd) : [...stack, ...toAdd];
	return toReturn;
};
const pop = (opts, stack) => {
	if (stack.length === 0) throw new Error(`Stack is empty`);
	return stack.slice(0, -1);
};
const peek$1 = (opts, stack) => stack.at(-1);
const isEmpty$1 = (opts, stack) => stack.length === 0;
const isFull$1 = (opts, stack) => {
	if (opts.capacity) return stack.length >= opts.capacity;
	return false;
};

//#endregion
//#region packages/collections/src/stack/StackImmutable.ts
var StackImmutable = class StackImmutable {
	opts;
	data;
	constructor(opts = {}, data = []) {
		this.opts = opts;
		this.data = data;
	}
	push(...toAdd) {
		return new StackImmutable(this.opts, push(this.opts, this.data, ...toAdd));
	}
	pop() {
		return new StackImmutable(this.opts, pop(this.opts, this.data));
	}
	forEach(fn) {
		this.data.forEach(fn);
	}
	forEachFromTop(fn) {
		[...this.data].reverse().forEach(fn);
	}
	get isEmpty() {
		return isEmpty$1(this.opts, this.data);
	}
	get isFull() {
		return isFull$1(this.opts, this.data);
	}
	get peek() {
		return peek$1(this.opts, this.data);
	}
	get length() {
		return this.data.length;
	}
};

//#endregion
//#region packages/visual/src/drawing.ts
const PIPI = Math.PI * 2;
const getContext = (canvasElementContextOrQuery) => {
	if (canvasElementContextOrQuery === null) throw new Error(`canvasElCtxOrQuery null. Must be a 2d drawing context or Canvas element`);
	if (canvasElementContextOrQuery === void 0) throw new Error(`canvasElCtxOrQuery undefined. Must be a 2d drawing context or Canvas element`);
	const ctx = canvasElementContextOrQuery instanceof CanvasRenderingContext2D ? canvasElementContextOrQuery : canvasElementContextOrQuery instanceof HTMLCanvasElement ? canvasElementContextOrQuery.getContext(`2d`) : typeof canvasElementContextOrQuery === `string` ? resolveEl(canvasElementContextOrQuery).getContext(`2d`) : canvasElementContextOrQuery;
	if (ctx === null) throw new Error(`Could not create 2d context for canvas`);
	return ctx;
};
const makeHelper = (ctxOrCanvasEl, canvasBounds) => {
	const ctx = getContext(ctxOrCanvasEl);
	return {
		ctx,
		paths(pathsToDraw, opts) {
			paths(ctx, pathsToDraw, opts);
		},
		line(lineToDraw, opts) {
			line$1(ctx, lineToDraw, opts);
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
			circle$1(ctx, circlesToDraw, opts);
		},
		arc(arcsToDraw, opts) {
			arc(ctx, arcsToDraw, opts);
		},
		textBlock(lines, opts) {
			if (opts.bounds === void 0 && canvasBounds !== void 0) opts = {
				...opts,
				bounds: {
					...canvasBounds,
					x: 0,
					y: 0
				}
			};
			textBlock(ctx, lines, opts);
		}
	};
};
/**
* Creates a drawing op to apply provided options
* @param opts Drawing options that apply
* @returns Stack
*/
const optsOp = (opts) => coloringOp(opts.strokeStyle, opts.fillStyle);
/**
* Applies drawing options to `ctx`, returning a {@link DrawingStack}
* @param ctx Context
* @param opts Options
* @returns
*/
const applyOpts$1 = (ctx, opts = {}, ...additionalOps) => {
	if (ctx === void 0) throw new Error(`ctx undefined`);
	const stack = drawingStack(ctx).push(optsOp(opts), ...additionalOps);
	stack.apply();
	return stack;
};
const arc = (ctx, arcs, opts = {}) => {
	applyOpts$1(ctx, opts);
	const draw = (arc$1) => {
		ctx.beginPath();
		ctx.arc(arc$1.x, arc$1.y, arc$1.radius, arc$1.startRadian, arc$1.endRadian);
		ctx.stroke();
	};
	const arcsArray = Array.isArray(arcs) ? arcs : [arcs];
	for (const arc$1 of arcsArray) draw(arc$1);
};
/**
* Colouring drawing op. Applies `fillStyle` and `strokeStyle`
* @param strokeStyle
* @param fillStyle
* @returns
*/
const coloringOp = (strokeStyle, fillStyle) => {
	const apply$3 = (ctx) => {
		if (fillStyle) ctx.fillStyle = fillStyle;
		if (strokeStyle) ctx.strokeStyle = strokeStyle;
	};
	return apply$3;
};
const lineOp = (lineWidth, lineJoin, lineCap) => {
	const apply$3 = (ctx) => {
		if (lineWidth) ctx.lineWidth = lineWidth;
		if (lineJoin) ctx.lineJoin = lineJoin;
		if (lineCap) ctx.lineCap = lineCap;
	};
	return apply$3;
};
const drawingStack = (ctx, stk) => {
	if (stk === void 0) stk = new StackImmutable();
	const push$1 = (...ops) => {
		if (stk === void 0) stk = new StackImmutable();
		const s = stk.push(...ops);
		for (const o of ops) o(ctx);
		return drawingStack(ctx, s);
	};
	const pop$1 = () => {
		const s = stk?.pop();
		return drawingStack(ctx, s);
	};
	const apply$3 = () => {
		if (stk === void 0) return drawingStack(ctx);
		for (const op of stk.data) op(ctx);
		return drawingStack(ctx, stk);
	};
	return {
		push: push$1,
		pop: pop$1,
		apply: apply$3
	};
};
const circle$1 = (ctx, circlesToDraw, opts = {}) => {
	applyOpts$1(ctx, opts);
	const draw = (c$1) => {
		ctx.beginPath();
		ctx.arc(c$1.x, c$1.y, c$1.radius, 0, PIPI);
		if (opts.strokeStyle) ctx.stroke();
		if (opts.fillStyle) ctx.fill();
	};
	if (Array.isArray(circlesToDraw)) for (const c$1 of circlesToDraw) draw(c$1);
	else draw(circlesToDraw);
};
const paths = (ctx, pathsToDraw, opts = {}) => {
	applyOpts$1(ctx, opts);
	const draw = (path) => {
		if (isQuadraticBezier(path)) quadraticBezier(ctx, path, opts);
		else if (isLine(path)) line$1(ctx, path, opts);
		else throw new Error(`Unknown path type ${JSON.stringify(path)}`);
	};
	if (Array.isArray(pathsToDraw)) for (const p$1 of pathsToDraw) draw(p$1);
	else draw(pathsToDraw);
};
const connectedPoints = (ctx, pts, opts = {}) => {
	const shouldLoop = opts.loop ?? false;
	throwArrayTest(pts);
	if (pts.length === 0) return;
	for (const [index, pt] of pts.entries()) guard$7(pt, `Index ${index}`);
	applyOpts$1(ctx, opts);
	if (opts.lineWidth) ctx.lineWidth = opts.lineWidth;
	ctx.beginPath();
	ctx.moveTo(pts[0].x, pts[0].y);
	for (const pt of pts) ctx.lineTo(pt.x, pt.y);
	if (shouldLoop) ctx.lineTo(pts[0].x, pts[0].y);
	if (opts.strokeStyle || opts.strokeStyle === void 0 && opts.fillStyle === void 0) ctx.stroke();
	if (opts.fillStyle) ctx.fill();
};
const pointLabels = (ctx, pts, opts = {}, labels) => {
	if (pts.length === 0) return;
	for (const [index, pt] of pts.entries()) guard$7(pt, `Index ${index}`);
	applyOpts$1(ctx, opts);
	for (const [index, pt] of pts.entries()) {
		const label = labels !== void 0 && index < labels.length ? labels[index] : index.toString();
		ctx.fillText(label.toString(), pt.x, pt.y);
	}
};
const dot = (ctx, pos, opts) => {
	if (opts === void 0) opts = {};
	const radius = opts.radius ?? 10;
	const positions = Array.isArray(pos) ? pos : [pos];
	const stroke = opts.stroke ? opts.stroke : opts.strokeStyle !== void 0;
	let filled = opts.filled ? opts.filled : opts.fillStyle !== void 0;
	if (!stroke && !filled) filled = true;
	applyOpts$1(ctx, opts);
	for (const pos$1 of positions) {
		ctx.beginPath();
		if (`radius` in pos$1) ctx.arc(pos$1.x, pos$1.y, pos$1.radius, 0, 2 * Math.PI);
		else ctx.arc(pos$1.x, pos$1.y, radius, 0, 2 * Math.PI);
		if (filled) ctx.fill();
		if (stroke) ctx.stroke();
	}
};
const bezier = (ctx, bezierToDraw, opts) => {
	if (isQuadraticBezier(bezierToDraw)) quadraticBezier(ctx, bezierToDraw, opts);
	else if (isCubicBezier(bezierToDraw)) cubicBezier(ctx, bezierToDraw, opts);
};
const cubicBezier = (ctx, bezierToDraw, opts = {}) => {
	let stack = applyOpts$1(ctx, opts);
	const { a: a$1, b: b$2, cubic1, cubic2 } = bezierToDraw;
	const isDebug = opts.debug ?? false;
	if (isDebug) {}
	ctx.beginPath();
	ctx.moveTo(a$1.x, a$1.y);
	ctx.bezierCurveTo(cubic1.x, cubic1.y, cubic2.x, cubic2.y, b$2.x, b$2.y);
	ctx.stroke();
	if (isDebug) {
		stack = stack.push(optsOp({
			...opts,
			strokeStyle: multiplyOpacity(opts.strokeStyle ?? `silver`, .6),
			fillStyle: multiplyOpacity(opts.fillStyle ?? `yellow`, .4)
		}));
		stack.apply();
		ctx.moveTo(a$1.x, a$1.y);
		ctx.lineTo(cubic1.x, cubic1.y);
		ctx.stroke();
		ctx.moveTo(b$2.x, b$2.y);
		ctx.lineTo(cubic2.x, cubic2.y);
		ctx.stroke();
		ctx.fillText(`a`, a$1.x + 5, a$1.y);
		ctx.fillText(`b`, b$2.x + 5, b$2.y);
		ctx.fillText(`c1`, cubic1.x + 5, cubic1.y);
		ctx.fillText(`c2`, cubic2.x + 5, cubic2.y);
		dot(ctx, cubic1, { radius: 3 });
		dot(ctx, cubic2, { radius: 3 });
		dot(ctx, a$1, { radius: 3 });
		dot(ctx, b$2, { radius: 3 });
		stack = stack.pop();
		stack.apply();
	}
};
const quadraticBezier = (ctx, bezierToDraw, opts = {}) => {
	const { a: a$1, b: b$2, quadratic: quadratic$1 } = bezierToDraw;
	const isDebug = opts.debug ?? false;
	let stack = applyOpts$1(ctx, opts);
	ctx.beginPath();
	ctx.moveTo(a$1.x, a$1.y);
	ctx.quadraticCurveTo(quadratic$1.x, quadratic$1.y, b$2.x, b$2.y);
	ctx.stroke();
	if (isDebug) {
		stack = stack.push(optsOp({
			...opts,
			strokeStyle: multiplyOpacity(opts.strokeStyle ?? `silver`, .6),
			fillStyle: multiplyOpacity(opts.fillStyle ?? `yellow`, .4)
		}));
		connectedPoints(ctx, [
			a$1,
			quadratic$1,
			b$2
		]);
		ctx.fillText(`a`, a$1.x + 5, a$1.y);
		ctx.fillText(`b`, b$2.x + 5, b$2.y);
		ctx.fillText(`h`, quadratic$1.x + 5, quadratic$1.y);
		dot(ctx, quadratic$1, { radius: 3 });
		dot(ctx, a$1, { radius: 3 });
		dot(ctx, b$2, { radius: 3 });
		stack = stack.pop();
		stack.apply();
	}
};
const line$1 = (ctx, toDraw, opts = {}) => {
	const isDebug = opts.debug ?? false;
	const o = lineOp(opts.lineWidth, opts.lineJoin, opts.lineCap);
	applyOpts$1(ctx, opts, o);
	const draw = (d$1) => {
		const { a: a$1, b: b$2 } = d$1;
		ctx.beginPath();
		ctx.moveTo(a$1.x, a$1.y);
		ctx.lineTo(b$2.x, b$2.y);
		if (isDebug) {
			ctx.fillText(`a`, a$1.x, a$1.y);
			ctx.fillText(`b`, b$2.x, b$2.y);
			dot(ctx, a$1, {
				radius: 5,
				strokeStyle: `black`
			});
			dot(ctx, b$2, {
				radius: 5,
				strokeStyle: `black`
			});
		}
		ctx.stroke();
	};
	if (Array.isArray(toDraw)) for (const t$1 of toDraw) draw(t$1);
	else draw(toDraw);
};
const rect = (ctx, toDraw, opts = {}) => {
	applyOpts$1(ctx, opts);
	const filled = opts.filled ?? (opts.fillStyle === void 0 ? false : true);
	const stroke = opts.stroke ?? (opts.strokeStyle === void 0 ? false : true);
	const draw = (d$1) => {
		const x = `x` in d$1 ? d$1.x : 0;
		const y = `y` in d$1 ? d$1.y : 0;
		if (filled) ctx.fillRect(x, y, d$1.width, d$1.height);
		if (stroke) {
			if (opts.strokeWidth) ctx.lineWidth = opts.strokeWidth;
			ctx.strokeRect(x, y, d$1.width, d$1.height);
		}
		if (opts.crossed) {
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(d$1.width, d$1.height);
			ctx.stroke();
			ctx.moveTo(0, d$1.height);
			ctx.lineTo(d$1.width, 0);
			ctx.stroke();
		}
		if (opts.debug) pointLabels(ctx, corners$1(d$1), void 0, [
			`NW`,
			`NE`,
			`SE`,
			`SW`
		]);
	};
	if (Array.isArray(toDraw)) for (const t$1 of toDraw) draw(t$1);
	else draw(toDraw);
};
const textBlock = (ctx, lines, opts) => {
	applyOpts$1(ctx, opts);
	const anchorPadding = opts.anchorPadding ?? 0;
	const align$1 = opts.align ?? `top`;
	const anchor = opts.anchor;
	const bounds = opts.bounds ?? {
		x: 0,
		y: 0,
		width: 1e6,
		height: 1e6
	};
	const blocks = lines.map((l) => ctx.measureText(l));
	const widths = blocks.map((tm) => tm.width);
	const heights = blocks.map((tm) => tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent + 3);
	const maxWidth = Math.max(...widths);
	const totalHeight = heights.reduce((accumulator, value) => accumulator + value, 0);
	let { x, y } = anchor;
	if (anchor.x + maxWidth > bounds.width) x = bounds.width - (maxWidth + anchorPadding);
	else x -= anchorPadding;
	if (x < bounds.x) x = bounds.x + anchorPadding;
	if (anchor.y + totalHeight > bounds.height) y = bounds.height - (totalHeight + anchorPadding);
	else y -= anchorPadding;
	if (y < bounds.y) y = bounds.y + anchorPadding;
	if (align$1 === `top`) ctx.textBaseline = `top`;
	else ctx.textBaseline = `middle`;
	for (const [index, line$2] of lines.entries()) {
		ctx.fillText(line$2, x, y);
		y += heights[index];
	}
};

//#endregion
//#region packages/visual/src/colour/generate.ts
const goldenAngleColour = (index, saturation = .5, lightness = .75, alpha = 1) => {
	throwNumberTest(index, `positive`, `index`);
	throwNumberTest(saturation, `percentage`, `saturation`);
	throwNumberTest(lightness, `percentage`, `lightness`);
	throwNumberTest(alpha, `percentage`, `alpha`);
	const hue = index * 137.508;
	return alpha === 1 ? `hsl(${hue},${saturation * 100}%,${lightness * 100}%)` : `hsl(${hue},${saturation * 100}%,${lightness * 100}%,${alpha * 100}%)`;
};
const randomHue = (rand = Math.random) => {
	const r = rand();
	return r * 360;
};

//#endregion
//#region node_modules/.pnpm/colorjs.io@0.5.2/node_modules/colorjs.io/dist/color.js
function multiplyMatrices(A, B) {
	let m$1 = A.length;
	if (!Array.isArray(A[0])) A = [A];
	if (!Array.isArray(B[0])) B = B.map((x) => [x]);
	let p$1 = B[0].length;
	let B_cols = B[0].map((_, i) => B.map((x) => x[i]));
	let product = A.map((row) => B_cols.map((col) => {
		let ret = 0;
		if (!Array.isArray(row)) {
			for (let c$1 of col) ret += row * c$1;
			return ret;
		}
		for (let i = 0; i < row.length; i++) ret += row[i] * (col[i] || 0);
		return ret;
	}));
	if (m$1 === 1) product = product[0];
	if (p$1 === 1) return product.map((x) => x[0]);
	return product;
}
/**
* Various utility functions
*/
/**
* Check if a value is a string (including a String object)
* @param {*} str - Value to check
* @returns {boolean}
*/
function isString(str) {
	return type(str) === "string";
}
/**
* Determine the internal JavaScript [[Class]] of an object.
* @param {*} o - Value to check
* @returns {string}
*/
function type(o) {
	let str = Object.prototype.toString.call(o);
	return (str.match(/^\[object\s+(.*?)\]$/)[1] || "").toLowerCase();
}
function serializeNumber(n$2, { precision, unit }) {
	if (isNone(n$2)) return "none";
	return toPrecision(n$2, precision) + (unit ?? "");
}
/**
* Check if a value corresponds to a none argument
* @param {*} n - Value to check
* @returns {boolean}
*/
function isNone(n$2) {
	return Number.isNaN(n$2) || n$2 instanceof Number && n$2?.none;
}
/**
* Replace none values with 0
*/
function skipNone(n$2) {
	return isNone(n$2) ? 0 : n$2;
}
/**
* Round a number to a certain number of significant digits
* @param {number} n - The number to round
* @param {number} precision - Number of significant digits
*/
function toPrecision(n$2, precision) {
	if (n$2 === 0) return 0;
	let integer = ~~n$2;
	let digits = 0;
	if (integer && precision) digits = ~~Math.log10(Math.abs(integer)) + 1;
	const multiplier = 10 ** (precision - digits);
	return Math.floor(n$2 * multiplier + .5) / multiplier;
}
const angleFactor = {
	deg: 1,
	grad: .9,
	rad: 180 / Math.PI,
	turn: 360
};
/**
* Parse a CSS function, regardless of its name and arguments
* @param String str String to parse
* @return {{name, args, rawArgs}}
*/
function parseFunction(str) {
	if (!str) return;
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
			if (typeof arg === "object" && arg instanceof Number) arg.raw = rawArg;
			args.push(arg);
		});
		return {
			name: parts[1].toLowerCase(),
			rawName: parts[1],
			rawArgs: parts[2],
			args
		};
	}
}
function last(arr) {
	return arr[arr.length - 1];
}
function interpolate$2(start, end, p$1) {
	if (isNaN(start)) return end;
	if (isNaN(end)) return start;
	return start + (end - start) * p$1;
}
function interpolateInv(start, end, value) {
	return (value - start) / (end - start);
}
function mapRange(from$1, to$3, value) {
	return interpolate$2(to$3[0], to$3[1], interpolateInv(from$1[0], from$1[1], value));
}
function parseCoordGrammar(coordGrammars) {
	return coordGrammars.map((coordGrammar$1) => {
		return coordGrammar$1.split("|").map((type$1) => {
			type$1 = type$1.trim();
			let range$1 = type$1.match(/^(<[a-z]+>)\[(-?[.\d]+),\s*(-?[.\d]+)\]?$/);
			if (range$1) {
				let ret = new String(range$1[1]);
				ret.range = [+range$1[2], +range$1[3]];
				return ret;
			}
			return type$1;
		});
	});
}
/**
* Clamp value between the minimum and maximum
* @param {number} min minimum value to return
* @param {number} val the value to return if it is between min and max
* @param {number} max maximum value to return
* @returns number
*/
function clamp(min$4, val, max$5) {
	return Math.max(Math.min(max$5, val), min$4);
}
/**
* Copy sign of one value to another.
* @param {number} - to number to copy sign to
* @param {number} - from number to copy sign from
* @returns number
*/
function copySign(to$3, from$1) {
	return Math.sign(to$3) === Math.sign(from$1) ? to$3 : -to$3;
}
/**
* Perform pow on a signed number and copy sign to result
* @param {number} - base the base number
* @param {number} - exp the exponent
* @returns number
*/
function spow(base, exp) {
	return copySign(Math.abs(base) ** exp, base);
}
/**
* Perform a divide, but return zero if the numerator is zero
* @param {number} n - the numerator
* @param {number} d - the denominator
* @returns number
*/
function zdiv(n$2, d$1) {
	return d$1 === 0 ? 0 : n$2 / d$1;
}
/**
* Perform a bisect on a sorted list and locate the insertion point for
* a value in arr to maintain sorted order.
* @param {number[]} arr - array of sorted numbers
* @param {number} value - value to find insertion point for
* @param {number} lo - used to specify a the low end of a subset of the list
* @param {number} hi - used to specify a the high end of a subset of the list
* @returns number
*/
function bisectLeft(arr, value, lo = 0, hi = arr.length) {
	while (lo < hi) {
		const mid = lo + hi >> 1;
		if (arr[mid] < value) lo = mid + 1;
		else hi = mid;
	}
	return lo;
}
var util = /* @__PURE__ */ Object.freeze({
	__proto__: null,
	bisectLeft,
	clamp,
	copySign,
	interpolate: interpolate$2,
	interpolateInv,
	isNone,
	isString,
	last,
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
			for (var name in arguments[0]) this.add(name, arguments[0][name], arguments[1]);
			return;
		}
		(Array.isArray(name) ? name : [name]).forEach(function(name$1) {
			this[name$1] = this[name$1] || [];
			if (callback) this[name$1][first ? "unshift" : "push"](callback);
		}, this);
	}
	run(name, env) {
		this[name] = this[name] || [];
		this[name].forEach(function(callback) {
			callback.call(env && env.context ? env.context : env, env);
		});
	}
};
/**
* The instance of {@link Hooks} used throughout Color.js
*/
const hooks = new Hooks();
var defaults = {
	gamut_mapping: "css",
	precision: 5,
	deltaE: "76",
	verbose: globalThis?.process?.env?.NODE_ENV?.toLowerCase() !== "test",
	warn: function warn(msg) {
		if (this.verbose) globalThis?.console?.warn?.(msg);
	}
};
const WHITES = {
	D50: [
		.3457 / .3585,
		1,
		.2958 / .3585
	],
	D65: [
		.3127 / .329,
		1,
		.3583 / .329
	]
};
function getWhite(name) {
	if (Array.isArray(name)) return name;
	return WHITES[name];
}
function adapt$2(W1, W2, XYZ, options = {}) {
	W1 = getWhite(W1);
	W2 = getWhite(W2);
	if (!W1 || !W2) throw new TypeError(`Missing white point to convert ${!W1 ? "from" : ""}${!W1 && !W2 ? "/" : ""}${!W2 ? "to" : ""}`);
	if (W1 === W2) return XYZ;
	let env = {
		W1,
		W2,
		XYZ,
		options
	};
	hooks.run("chromatic-adaptation-start", env);
	if (!env.M) {
		if (env.W1 === WHITES.D65 && env.W2 === WHITES.D50) env.M = [
			[
				1.0479297925449969,
				.022946870601609652,
				-.05019226628920524
			],
			[
				.02962780877005599,
				.9904344267538799,
				-.017073799063418826
			],
			[
				-.009243040646204504,
				.015055191490298152,
				.7518742814281371
			]
		];
		else if (env.W1 === WHITES.D50 && env.W2 === WHITES.D65) env.M = [
			[
				.955473421488075,
				-.02309845494876471,
				.06325924320057072
			],
			[
				-.0283697093338637,
				1.0099953980813041,
				.021041441191917323
			],
			[
				.012314014864481998,
				-.020507649298898964,
				1.330365926242124
			]
		];
	}
	hooks.run("chromatic-adaptation-end", env);
	if (env.M) return multiplyMatrices(env.M, env.XYZ);
	else throw new TypeError("Only Bradford CAT with white points D50 and D65 supported for now.");
}
const noneTypes = new Set([
	"<number>",
	"<percentage>",
	"<angle>"
]);
/**
* Validates the coordinates of a color against a format's coord grammar and
* maps the coordinates to the range or refRange of the coordinates.
* @param {ColorSpace} space - Colorspace the coords are in
* @param {object} format - the format object to validate against
* @param {string} name - the name of the color function. e.g. "oklab" or "color"
* @returns {object[]} - an array of type metadata for each coordinate
*/
function coerceCoords(space, format, name, coords) {
	let types = Object.entries(space.coords).map(([id, coordMeta], i) => {
		let coordGrammar$1 = format.coordGrammar[i];
		let arg = coords[i];
		let providedType = arg?.type;
		let type$1;
		if (arg.none) type$1 = coordGrammar$1.find((c$1) => noneTypes.has(c$1));
		else type$1 = coordGrammar$1.find((c$1) => c$1 == providedType);
		if (!type$1) {
			let coordName = coordMeta.name || id;
			throw new TypeError(`${providedType ?? arg.raw} not allowed for ${coordName} in ${name}()`);
		}
		let fromRange = type$1.range;
		if (providedType === "<percentage>") fromRange ||= [0, 1];
		let toRange = coordMeta.range || coordMeta.refRange;
		if (fromRange && toRange) coords[i] = mapRange(fromRange, toRange, coords[i]);
		return type$1;
	});
	return types;
}
/**
* Convert a CSS Color string to a color object
* @param {string} str
* @param {object} [options]
* @param {object} [options.meta] - Object for additional information about the parsing
* @returns {Color}
*/
function parse(str, { meta } = {}) {
	let env = { "str": String(str)?.trim() };
	hooks.run("parse-start", env);
	if (env.color) return env.color;
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
						if (colorSpec.coordGrammar) types = coerceCoords(space, colorSpec, "color", coords);
						if (meta) Object.assign(meta, {
							formatId: "color",
							types
						});
						if (colorSpec.id.startsWith("--") && !id.startsWith("--")) defaults.warn(`${space.name} is a non-standard space and not currently supported in the CSS spec. Use prefixed color(${colorSpec.id}) instead of color(${id}).`);
						if (id.startsWith("--") && !colorSpec.id.startsWith("--")) defaults.warn(`${space.name} is a standard space and supported in the CSS spec. Use color(${colorSpec.id}) instead of prefixed color(${id}).`);
						return {
							spaceId: space.id,
							coords,
							alpha
						};
					}
				}
			}
			let didYouMean = "";
			let registryId = id in ColorSpace.registry ? id : alternateId;
			if (registryId in ColorSpace.registry) {
				let cssId = ColorSpace.registry[registryId].formats?.color?.id;
				if (cssId) didYouMean = `Did you mean color(${cssId})?`;
			}
			throw new TypeError(`Cannot parse color(${id}). ` + (didYouMean || "Missing a plugin?"));
		} else for (let space of ColorSpace.all) {
			let format = space.getFormat(name);
			if (format && format.type === "function") {
				let alpha = 1;
				if (format.lastAlpha || last(env.parsed.args).alpha) alpha = env.parsed.args.pop();
				let coords = env.parsed.args;
				let types;
				if (format.coordGrammar) types = coerceCoords(space, format, name, coords);
				if (meta) Object.assign(meta, {
					formatId: format.name,
					types
				});
				return {
					spaceId: space.id,
					coords,
					alpha
				};
			}
		}
	} else for (let space of ColorSpace.all) for (let formatId in space.formats) {
		let format = space.formats[formatId];
		if (format.type !== "custom") continue;
		if (format.test && !format.test(env.str)) continue;
		let color = format.parse(env.str);
		if (color) {
			color.alpha ??= 1;
			if (meta) meta.formatId = formatId;
			return color;
		}
	}
	throw new TypeError(`Could not parse ${str} as a color. Missing a plugin?`);
}
/**
* Resolves a color reference (object or string) to a plain color object
* @param {Color | {space, coords, alpha} | string | Array<Color | {space, coords, alpha} | string> } color
* @returns {{space, coords, alpha} | Array<{space, coords, alpha}}>
*/
function getColor(color) {
	if (Array.isArray(color)) return color.map(getColor);
	if (!color) throw new TypeError("Empty color reference");
	if (isString(color)) color = parse(color);
	let space = color.space || color.spaceId;
	if (!(space instanceof ColorSpace)) color.space = ColorSpace.get(space);
	if (color.alpha === void 0) color.alpha = 1;
	return color;
}
const ε$7 = 75e-6;
var ColorSpace = class ColorSpace {
	constructor(options) {
		this.id = options.id;
		this.name = options.name;
		this.base = options.base ? ColorSpace.get(options.base) : null;
		this.aliases = options.aliases;
		if (this.base) {
			this.fromBase = options.fromBase;
			this.toBase = options.toBase;
		}
		let coords = options.coords ?? this.base.coords;
		for (let name in coords) if (!("name" in coords[name])) coords[name].name = name;
		this.coords = coords;
		let white$5 = options.white ?? this.base.white ?? "D65";
		this.white = getWhite(white$5);
		this.formats = options.formats ?? {};
		for (let name in this.formats) {
			let format = this.formats[name];
			format.type ||= "function";
			format.name ||= name;
		}
		if (!this.formats.color?.id) this.formats.color = {
			...this.formats.color ?? {},
			id: options.cssId || this.id
		};
		if (options.gamutSpace) this.gamutSpace = options.gamutSpace === "self" ? this : ColorSpace.get(options.gamutSpace);
		else if (this.isPolar) this.gamutSpace = this.base;
		else this.gamutSpace = this;
		if (this.gamutSpace.isUnbounded) this.inGamut = (coords$1, options$1) => {
			return true;
		};
		this.referred = options.referred;
		Object.defineProperty(this, "path", {
			value: getPath(this).reverse(),
			writable: false,
			enumerable: true,
			configurable: true
		});
		hooks.run("colorspace-init-end", this);
	}
	inGamut(coords, { epsilon: epsilon$1 = ε$7 } = {}) {
		if (!this.equals(this.gamutSpace)) {
			coords = this.to(this.gamutSpace, coords);
			return this.gamutSpace.inGamut(coords, { epsilon: epsilon$1 });
		}
		let coordMeta = Object.values(this.coords);
		return coords.every((c$1, i) => {
			let meta = coordMeta[i];
			if (meta.type !== "angle" && meta.range) {
				if (Number.isNaN(c$1)) return true;
				let [min$4, max$5] = meta.range;
				return (min$4 === void 0 || c$1 >= min$4 - epsilon$1) && (max$5 === void 0 || c$1 <= max$5 + epsilon$1);
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
		for (let id in this.coords) if (this.coords[id].type === "angle") return true;
		return false;
	}
	getFormat(format) {
		if (typeof format === "object") {
			format = processFormat(format, this);
			return format;
		}
		let ret;
		if (format === "default") ret = Object.values(this.formats)[0];
		else ret = this.formats[format];
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
		if (!space) return false;
		return this === space || this.id === space || this.id === space.id;
	}
	to(space, coords) {
		if (arguments.length === 1) {
			const color = getColor(space);
			[space, coords] = [color.space, color.coords];
		}
		space = ColorSpace.get(space);
		if (this.equals(space)) return coords;
		coords = coords.map((c$1) => Number.isNaN(c$1) ? 0 : c$1);
		let myPath = this.path;
		let otherPath = space.path;
		let connectionSpace, connectionSpaceIndex;
		for (let i = 0; i < myPath.length; i++) if (myPath[i].equals(otherPath[i])) {
			connectionSpace = myPath[i];
			connectionSpaceIndex = i;
		} else break;
		if (!connectionSpace) throw new Error(`Cannot convert between color spaces ${this} and ${space}: no connection space was found`);
		for (let i = myPath.length - 1; i > connectionSpaceIndex; i--) coords = myPath[i].toBase(coords);
		for (let i = connectionSpaceIndex + 1; i < otherPath.length; i++) coords = otherPath[i].fromBase(coords);
		return coords;
	}
	from(space, coords) {
		if (arguments.length === 1) {
			const color = getColor(space);
			[space, coords] = [color.space, color.coords];
		}
		space = ColorSpace.get(space);
		return space.to(this, coords);
	}
	toString() {
		return `${this.name} (${this.id})`;
	}
	getMinCoords() {
		let ret = [];
		for (let id in this.coords) {
			let meta = this.coords[id];
			let range$1 = meta.range || meta.refRange;
			ret.push(range$1?.min ?? 0);
		}
		return ret;
	}
	static registry = {};
	static get all() {
		return [...new Set(Object.values(ColorSpace.registry))];
	}
	static register(id, space) {
		if (arguments.length === 1) {
			space = arguments[0];
			id = space.id;
		}
		space = this.get(space);
		if (this.registry[id] && this.registry[id] !== space) throw new Error(`Duplicate color space registration: '${id}'`);
		this.registry[id] = space;
		if (arguments.length === 1 && space.aliases) for (let alias of space.aliases) this.register(alias, space);
		return space;
	}
	/**
	* Lookup ColorSpace object by name
	* @param {ColorSpace | string} name
	*/
	static get(space, ...alternatives) {
		if (!space || space instanceof ColorSpace) return space;
		let argType = type(space);
		if (argType === "string") {
			let ret = ColorSpace.registry[space.toLowerCase()];
			if (!ret) throw new TypeError(`No color space found with id = "${space}"`);
			return ret;
		}
		if (alternatives.length) return ColorSpace.get(...alternatives);
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
		if (coordType === "string") if (ref.includes(".")) [space, coord] = ref.split(".");
		else [space, coord] = [, ref];
		else if (Array.isArray(ref)) [space, coord] = ref;
		else {
			space = ref.space;
			coord = ref.coordId;
		}
		space = ColorSpace.get(space);
		if (!space) space = workingSpace;
		if (!space) throw new TypeError(`Cannot resolve coordinate reference ${ref}: No color space specified and relative references are not allowed here`);
		coordType = type(coord);
		if (coordType === "number" || coordType === "string" && coord >= 0) {
			let meta = Object.entries(space.coords)[coord];
			if (meta) return {
				space,
				id: meta[0],
				index: coord,
				...meta[1]
			};
		}
		space = ColorSpace.get(space);
		let normalizedCoord = coord.toLowerCase();
		let i = 0;
		for (let id in space.coords) {
			let meta = space.coords[id];
			if (id.toLowerCase() === normalizedCoord || meta.name?.toLowerCase() === normalizedCoord) return {
				space,
				id,
				index: i,
				...meta
			};
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
	for (let s = space; s = s.base;) ret.push(s);
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
			} else if (outputType == "<angle>") suffix = "deg";
			return {
				fromRange,
				toRange,
				suffix
			};
		});
		format.serializeCoords = (coords$1, precision) => {
			return coords$1.map((c$1, i) => {
				let { fromRange, toRange, suffix } = coordFormats[i];
				if (fromRange && toRange) c$1 = mapRange(fromRange, toRange, c$1);
				c$1 = serializeNumber(c$1, {
					precision,
					unit: suffix
				});
				return c$1;
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
	formats: { color: { ids: ["xyz-d65", "xyz"] } },
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
		if (!options.coords) options.coords = {
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
		if (!options.base) options.base = xyz_d65;
		if (options.toXYZ_M && options.fromXYZ_M) {
			options.toBase ??= (rgb) => {
				let xyz = multiplyMatrices(options.toXYZ_M, rgb);
				if (this.white !== this.base.white) xyz = adapt$2(this.white, this.base.white, xyz);
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
/**
* Get the coordinates of a color in any color space
* @param {Color} color
* @param {string | ColorSpace} [space = color.space] The color space to convert to. Defaults to the color's current space
* @returns {number[]} The color coordinates in the given color space
*/
function getAll(color, space) {
	color = getColor(color);
	if (!space || color.space.equals(space)) return color.coords.slice();
	space = ColorSpace.get(space);
	return space.from(color);
}
function get$1(color, prop) {
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
function set$1(color, prop, value) {
	color = getColor(color);
	if (arguments.length === 2 && type(arguments[1]) === "object") {
		let object$1 = arguments[1];
		for (let p$1 in object$1) set$1(color, p$1, object$1[p$1]);
	} else {
		if (typeof value === "function") value = value(get$1(color, prop));
		let { space, index } = ColorSpace.resolveCoord(prop, color.space);
		let coords = getAll(color, space);
		coords[index] = value;
		setAll(color, space, coords);
	}
	return color;
}
set$1.returns = "color";
var XYZ_D50 = new ColorSpace({
	id: "xyz-d50",
	name: "XYZ D50",
	white: "D50",
	base: xyz_d65,
	fromBase: (coords) => adapt$2(xyz_d65.white, "D50", coords),
	toBase: (coords) => adapt$2("D50", xyz_d65.white, coords)
});
const ε$6 = 216 / 24389;
const ε3$1 = 24 / 116;
const κ$4 = 24389 / 27;
let white$4 = WHITES.D50;
var lab = new ColorSpace({
	id: "lab",
	name: "Lab",
	coords: {
		l: {
			refRange: [0, 100],
			name: "Lightness"
		},
		a: { refRange: [-125, 125] },
		b: { refRange: [-125, 125] }
	},
	white: white$4,
	base: XYZ_D50,
	fromBase(XYZ) {
		let xyz = XYZ.map((value, i) => value / white$4[i]);
		let f = xyz.map((value) => value > ε$6 ? Math.cbrt(value) : (κ$4 * value + 16) / 116);
		return [
			116 * f[1] - 16,
			500 * (f[0] - f[1]),
			200 * (f[1] - f[2])
		];
	},
	toBase(Lab) {
		let f = [];
		f[1] = (Lab[0] + 16) / 116;
		f[0] = Lab[1] / 500 + f[1];
		f[2] = f[1] - Lab[2] / 200;
		let xyz = [
			f[0] > ε3$1 ? Math.pow(f[0], 3) : (116 * f[0] - 16) / κ$4,
			Lab[0] > 8 ? Math.pow((Lab[0] + 16) / 116, 3) : Lab[0] / κ$4,
			f[2] > ε3$1 ? Math.pow(f[2], 3) : (116 * f[2] - 16) / κ$4
		];
		return xyz.map((value, i) => value * white$4[i]);
	},
	formats: { "lab": { coords: [
		"<number> | <percentage>",
		"<number> | <percentage>[-1,1]",
		"<number> | <percentage>[-1,1]"
	] } }
});
function constrain(angle) {
	return (angle % 360 + 360) % 360;
}
function adjust(arc$1, angles$1) {
	if (arc$1 === "raw") return angles$1;
	let [a1, a2] = angles$1.map(constrain);
	let angleDiff = a2 - a1;
	if (arc$1 === "increasing") {
		if (angleDiff < 0) a2 += 360;
	} else if (arc$1 === "decreasing") {
		if (angleDiff > 0) a1 += 360;
	} else if (arc$1 === "longer") {
		if (-180 < angleDiff && angleDiff < 180) if (angleDiff > 0) a1 += 360;
		else a2 += 360;
	} else if (arc$1 === "shorter") {
		if (angleDiff > 180) a1 += 360;
		else if (angleDiff < -180) a2 += 360;
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
		let [L, a$1, b$2] = Lab;
		let hue;
		const ε$8 = .02;
		if (Math.abs(a$1) < ε$8 && Math.abs(b$2) < ε$8) hue = NaN;
		else hue = Math.atan2(b$2, a$1) * 180 / Math.PI;
		return [
			L,
			Math.sqrt(a$1 ** 2 + b$2 ** 2),
			constrain(hue)
		];
	},
	toBase(LCH) {
		let [Lightness, Chroma, Hue] = LCH;
		if (Chroma < 0) Chroma = 0;
		if (isNaN(Hue)) Hue = 0;
		return [
			Lightness,
			Chroma * Math.cos(Hue * Math.PI / 180),
			Chroma * Math.sin(Hue * Math.PI / 180)
		];
	},
	formats: { "lch": { coords: [
		"<number> | <percentage>",
		"<number> | <percentage>",
		"<number> | <angle>"
	] } }
});
const Gfactor = 25 ** 7;
const π$1 = Math.PI;
const r2d = 180 / π$1;
const d2r$1 = π$1 / 180;
function pow7(x) {
	const x2 = x * x;
	const x7 = x2 * x2 * x2 * x;
	return x7;
}
function deltaE2000(color, sample$1, { kL = 1, kC = 1, kH = 1 } = {}) {
	[color, sample$1] = getColor([color, sample$1]);
	let [L1, a1, b1] = lab.from(color);
	let C1 = lch.from(lab, [
		L1,
		a1,
		b1
	])[1];
	let [L2, a2, b2] = lab.from(sample$1);
	let C2 = lch.from(lab, [
		L2,
		a2,
		b2
	])[1];
	if (C1 < 0) C1 = 0;
	if (C2 < 0) C2 = 0;
	let Cbar = (C1 + C2) / 2;
	let C7 = pow7(Cbar);
	let G = .5 * (1 - Math.sqrt(C7 / (C7 + Gfactor)));
	let adash1 = (1 + G) * a1;
	let adash2 = (1 + G) * a2;
	let Cdash1 = Math.sqrt(adash1 ** 2 + b1 ** 2);
	let Cdash2 = Math.sqrt(adash2 ** 2 + b2 ** 2);
	let h1 = adash1 === 0 && b1 === 0 ? 0 : Math.atan2(b1, adash1);
	let h2 = adash2 === 0 && b2 === 0 ? 0 : Math.atan2(b2, adash2);
	if (h1 < 0) h1 += 2 * π$1;
	if (h2 < 0) h2 += 2 * π$1;
	h1 *= r2d;
	h2 *= r2d;
	let ΔL = L2 - L1;
	let ΔC = Cdash2 - Cdash1;
	let hdiff = h2 - h1;
	let hsum = h1 + h2;
	let habs = Math.abs(hdiff);
	let Δh;
	if (Cdash1 * Cdash2 === 0) Δh = 0;
	else if (habs <= 180) Δh = hdiff;
	else if (hdiff > 180) Δh = hdiff - 360;
	else if (hdiff < -180) Δh = hdiff + 360;
	else defaults.warn("the unthinkable has happened");
	let ΔH = 2 * Math.sqrt(Cdash2 * Cdash1) * Math.sin(Δh * d2r$1 / 2);
	let Ldash = (L1 + L2) / 2;
	let Cdash = (Cdash1 + Cdash2) / 2;
	let Cdash7 = pow7(Cdash);
	let hdash;
	if (Cdash1 * Cdash2 === 0) hdash = hsum;
	else if (habs <= 180) hdash = hsum / 2;
	else if (hsum < 360) hdash = (hsum + 360) / 2;
	else hdash = (hsum - 360) / 2;
	let lsq = (Ldash - 50) ** 2;
	let SL = 1 + .015 * lsq / Math.sqrt(20 + lsq);
	let SC = 1 + .045 * Cdash;
	let T = 1;
	T -= .17 * Math.cos((hdash - 30) * d2r$1);
	T += .24 * Math.cos(2 * hdash * d2r$1);
	T += .32 * Math.cos((3 * hdash + 6) * d2r$1);
	T -= .2 * Math.cos((4 * hdash - 63) * d2r$1);
	let SH = 1 + .015 * Cdash * T;
	let Δθ = 30 * Math.exp(-1 * ((hdash - 275) / 25) ** 2);
	let RC = 2 * Math.sqrt(Cdash7 / (Cdash7 + Gfactor));
	let RT = -1 * Math.sin(2 * Δθ * d2r$1) * RC;
	let dE = (ΔL / (kL * SL)) ** 2;
	dE += (ΔC / (kC * SC)) ** 2;
	dE += (ΔH / (kH * SH)) ** 2;
	dE += RT * (ΔC / (kC * SC)) * (ΔH / (kH * SH));
	return Math.sqrt(dE);
}
const XYZtoLMS_M$1 = [
	[
		.819022437996703,
		.3619062600528904,
		-.1288737815209879
	],
	[
		.0329836539323885,
		.9292868615863434,
		.0361446663506424
	],
	[
		.0481771893596242,
		.2642395317527308,
		.6335478284694309
	]
];
const LMStoXYZ_M$1 = [
	[
		1.2268798758459243,
		-.5578149944602171,
		.2813910456659647
	],
	[
		-.0405757452148008,
		1.112286803280317,
		-.0717110580655164
	],
	[
		-.0763729366746601,
		-.4214933324022432,
		1.5869240198367816
	]
];
const LMStoLab_M = [
	[
		.210454268309314,
		.7936177747023054,
		-.0040720430116193
	],
	[
		1.9779985324311684,
		-2.42859224204858,
		.450593709617411
	],
	[
		.0259040424655478,
		.7827717124575296,
		-.8086757549230774
	]
];
const LabtoLMS_M = [
	[
		1,
		.3963377773761749,
		.2158037573099136
	],
	[
		1,
		-.1055613458156586,
		-.0638541728258133
	],
	[
		1,
		-.0894841775298119,
		-1.2914855480194092
	]
];
var OKLab = new ColorSpace({
	id: "oklab",
	name: "Oklab",
	coords: {
		l: {
			refRange: [0, 1],
			name: "Lightness"
		},
		a: { refRange: [-.4, .4] },
		b: { refRange: [-.4, .4] }
	},
	white: "D65",
	base: xyz_d65,
	fromBase(XYZ) {
		let LMS = multiplyMatrices(XYZtoLMS_M$1, XYZ);
		let LMSg = LMS.map((val) => Math.cbrt(val));
		return multiplyMatrices(LMStoLab_M, LMSg);
	},
	toBase(OKLab$1) {
		let LMSg = multiplyMatrices(LabtoLMS_M, OKLab$1);
		let LMS = LMSg.map((val) => val ** 3);
		return multiplyMatrices(LMStoXYZ_M$1, LMS);
	},
	formats: { "oklab": { coords: [
		"<percentage> | <number>",
		"<number> | <percentage>[-1,1]",
		"<number> | <percentage>[-1,1]"
	] } }
});
function deltaEOK(color, sample$1) {
	[color, sample$1] = getColor([color, sample$1]);
	let [L1, a1, b1] = OKLab.from(color);
	let [L2, a2, b2] = OKLab.from(sample$1);
	let ΔL = L1 - L2;
	let Δa = a1 - a2;
	let Δb = b1 - b2;
	return Math.sqrt(ΔL ** 2 + Δa ** 2 + Δb ** 2);
}
const ε$5 = 75e-6;
/**
* Check if a color is in gamut of either its own or another color space
* @return {Boolean} Is the color in gamut?
*/
function inGamut(color, space, { epsilon: epsilon$1 = ε$5 } = {}) {
	color = getColor(color);
	if (!space) space = color.space;
	space = ColorSpace.get(space);
	let coords = color.coords;
	if (space !== color.space) coords = space.from(color);
	return space.inGamut(coords, { epsilon: epsilon$1 });
}
function clone(color) {
	return {
		space: color.space,
		coords: color.coords.slice(),
		alpha: color.alpha
	};
}
/**
* Euclidean distance of colors in an arbitrary color space
*/
function distance(color1, color2, space = "lab") {
	space = ColorSpace.get(space);
	let coords1 = space.from(color1);
	let coords2 = space.from(color2);
	return Math.sqrt(coords1.reduce((acc, c1$3, i) => {
		let c2$3 = coords2[i];
		if (isNaN(c1$3) || isNaN(c2$3)) return acc;
		return acc + (c2$3 - c1$3) ** 2;
	}, 0));
}
function deltaE76(color, sample$1) {
	return distance(color, sample$1, "lab");
}
const π = Math.PI;
const d2r = π / 180;
function deltaECMC(color, sample$1, { l = 2, c: c$1 = 1 } = {}) {
	[color, sample$1] = getColor([color, sample$1]);
	let [L1, a1, b1] = lab.from(color);
	let [, C1, H1] = lch.from(lab, [
		L1,
		a1,
		b1
	]);
	let [L2, a2, b2] = lab.from(sample$1);
	let C2 = lch.from(lab, [
		L2,
		a2,
		b2
	])[1];
	if (C1 < 0) C1 = 0;
	if (C2 < 0) C2 = 0;
	let ΔL = L1 - L2;
	let ΔC = C1 - C2;
	let Δa = a1 - a2;
	let Δb = b1 - b2;
	let H2 = Δa ** 2 + Δb ** 2 - ΔC ** 2;
	let SL = .511;
	if (L1 >= 16) SL = .040975 * L1 / (1 + .01765 * L1);
	let SC = .0638 * C1 / (1 + .0131 * C1) + .638;
	let T;
	if (Number.isNaN(H1)) H1 = 0;
	if (H1 >= 164 && H1 <= 345) T = .56 + Math.abs(.2 * Math.cos((H1 + 168) * d2r));
	else T = .36 + Math.abs(.4 * Math.cos((H1 + 35) * d2r));
	let C4 = Math.pow(C1, 4);
	let F = Math.sqrt(C4 / (C4 + 1900));
	let SH = SC * (F * T + 1 - F);
	let dE = (ΔL / (l * SL)) ** 2;
	dE += (ΔC / (c$1 * SC)) ** 2;
	dE += H2 / SH ** 2;
	return Math.sqrt(dE);
}
const Yw$1 = 203;
var XYZ_Abs_D65 = new ColorSpace({
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
const b$1 = 1.15;
const g = .66;
const n$1 = 2610 / 2 ** 14;
const ninv$1 = 2 ** 14 / 2610;
const c1$2 = 3424 / 2 ** 12;
const c2$2 = 2413 / 2 ** 7;
const c3$2 = 2392 / 2 ** 7;
const p = 1.7 * 2523 / 2 ** 5;
const pinv = 2 ** 5 / (1.7 * 2523);
const d = -.56;
const d0 = 16295499532821565e-27;
const XYZtoCone_M = [
	[
		.41478972,
		.579999,
		.014648
	],
	[
		-.20151,
		1.120649,
		.0531008
	],
	[
		-.0166008,
		.2648,
		.6684799
	]
];
const ConetoXYZ_M = [
	[
		1.9242264357876067,
		-1.0047923125953657,
		.037651404030618
	],
	[
		.35031676209499907,
		.7264811939316552,
		-.06538442294808501
	],
	[
		-.09098281098284752,
		-.3127282905230739,
		1.5227665613052603
	]
];
const ConetoIab_M = [
	[
		.5,
		.5,
		0
	],
	[
		3.524,
		-4.066708,
		.542708
	],
	[
		.199076,
		1.096799,
		-1.295875
	]
];
const IabtoCone_M = [
	[
		1,
		.1386050432715393,
		.05804731615611886
	],
	[
		.9999999999999999,
		-.1386050432715393,
		-.05804731615611886
	],
	[
		.9999999999999998,
		-.09601924202631895,
		-.8118918960560388
	]
];
var Jzazbz = new ColorSpace({
	id: "jzazbz",
	name: "Jzazbz",
	coords: {
		jz: {
			refRange: [0, 1],
			name: "Jz"
		},
		az: { refRange: [-.5, .5] },
		bz: { refRange: [-.5, .5] }
	},
	base: XYZ_Abs_D65,
	fromBase(XYZ) {
		let [Xa, Ya, Za] = XYZ;
		let Xm = b$1 * Xa - (b$1 - 1) * Za;
		let Ym = g * Ya - (g - 1) * Xa;
		let LMS = multiplyMatrices(XYZtoCone_M, [
			Xm,
			Ym,
			Za
		]);
		let PQLMS = LMS.map(function(val) {
			let num = c1$2 + c2$2 * (val / 1e4) ** n$1;
			let denom = 1 + c3$2 * (val / 1e4) ** n$1;
			return (num / denom) ** p;
		});
		let [Iz, az, bz] = multiplyMatrices(ConetoIab_M, PQLMS);
		let Jz = (1 + d) * Iz / (1 + d * Iz) - d0;
		return [
			Jz,
			az,
			bz
		];
	},
	toBase(Jzazbz$1) {
		let [Jz, az, bz] = Jzazbz$1;
		let Iz = (Jz + d0) / (1 + d - d * (Jz + d0));
		let PQLMS = multiplyMatrices(IabtoCone_M, [
			Iz,
			az,
			bz
		]);
		let LMS = PQLMS.map(function(val) {
			let num = c1$2 - val ** pinv;
			let denom = c3$2 * val ** pinv - c2$2;
			let x = 1e4 * (num / denom) ** ninv$1;
			return x;
		});
		let [Xm, Ym, Za] = multiplyMatrices(ConetoXYZ_M, LMS);
		let Xa = (Xm + (b$1 - 1) * Za) / b$1;
		let Ya = (Ym + (g - 1) * Xa) / g;
		return [
			Xa,
			Ya,
			Za
		];
	},
	formats: { "color": { coords: [
		"<number> | <percentage>",
		"<number> | <percentage>[-1,1]",
		"<number> | <percentage>[-1,1]"
	] } }
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
		const ε$8 = 2e-4;
		if (Math.abs(az) < ε$8 && Math.abs(bz) < ε$8) hue = NaN;
		else hue = Math.atan2(bz, az) * 180 / Math.PI;
		return [
			Jz,
			Math.sqrt(az ** 2 + bz ** 2),
			constrain(hue)
		];
	},
	toBase(jzczhz$1) {
		return [
			jzczhz$1[0],
			jzczhz$1[1] * Math.cos(jzczhz$1[2] * Math.PI / 180),
			jzczhz$1[1] * Math.sin(jzczhz$1[2] * Math.PI / 180)
		];
	}
});
function deltaEJz(color, sample$1) {
	[color, sample$1] = getColor([color, sample$1]);
	let [Jz1, Cz1, Hz1] = jzczhz.from(color);
	let [Jz2, Cz2, Hz2] = jzczhz.from(sample$1);
	let ΔJ = Jz1 - Jz2;
	let ΔC = Cz1 - Cz2;
	if (Number.isNaN(Hz1) && Number.isNaN(Hz2)) {
		Hz1 = 0;
		Hz2 = 0;
	} else if (Number.isNaN(Hz1)) Hz1 = Hz2;
	else if (Number.isNaN(Hz2)) Hz2 = Hz1;
	let Δh = Hz1 - Hz2;
	let ΔH = 2 * Math.sqrt(Cz1 * Cz2) * Math.sin(Δh / 2 * (Math.PI / 180));
	return Math.sqrt(ΔJ ** 2 + ΔC ** 2 + ΔH ** 2);
}
const c1$1 = 3424 / 4096;
const c2$1 = 2413 / 128;
const c3$1 = 2392 / 128;
const m1$1 = 2610 / 16384;
const m2 = 2523 / 32;
const im1 = 16384 / 2610;
const im2 = 32 / 2523;
const XYZtoLMS_M = [
	[
		.3592832590121217,
		.6976051147779502,
		-.035891593232029
	],
	[
		-.1920808463704993,
		1.100476797037432,
		.0753748658519118
	],
	[
		.0070797844607479,
		.0748396662186362,
		.8433265453898765
	]
];
const LMStoIPT_M = [
	[
		2048 / 4096,
		2048 / 4096,
		0
	],
	[
		6610 / 4096,
		-13613 / 4096,
		7003 / 4096
	],
	[
		17933 / 4096,
		-17390 / 4096,
		-543 / 4096
	]
];
const IPTtoLMS_M = [
	[
		.9999999999999998,
		.0086090370379328,
		.111029625003026
	],
	[
		.9999999999999998,
		-.0086090370379328,
		-.1110296250030259
	],
	[
		.9999999999999998,
		.5600313357106791,
		-.3206271749873188
	]
];
const LMStoXYZ_M = [
	[
		2.0701522183894223,
		-1.3263473389671563,
		.2066510476294053
	],
	[
		.3647385209748072,
		.6805660249472273,
		-.0453045459220347
	],
	[
		-.0497472075358123,
		-.0492609666966131,
		1.1880659249923042
	]
];
var ictcp = new ColorSpace({
	id: "ictcp",
	name: "ICTCP",
	coords: {
		i: {
			refRange: [0, 1],
			name: "I"
		},
		ct: {
			refRange: [-.5, .5],
			name: "CT"
		},
		cp: {
			refRange: [-.5, .5],
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
function deltaEITP(color, sample$1) {
	[color, sample$1] = getColor([color, sample$1]);
	let [I1, T1, P1] = ictcp.from(color);
	let [I2, T2, P2] = ictcp.from(sample$1);
	return 720 * Math.sqrt((I1 - I2) ** 2 + .25 * (T1 - T2) ** 2 + (P1 - P2) ** 2);
}
const white$3 = WHITES.D65;
const adaptedCoef = .42;
const adaptedCoefInv = 1 / adaptedCoef;
const tau = 2 * Math.PI;
const cat16 = [
	[
		.401288,
		.650173,
		-.051461
	],
	[
		-.250268,
		1.204414,
		.045854
	],
	[
		-.002079,
		.048952,
		.953127
	]
];
const cat16Inv = [
	[
		1.8620678550872327,
		-1.0112546305316843,
		.14918677544445175
	],
	[
		.38752654323613717,
		.6214474419314753,
		-.008973985167612518
	],
	[
		-.015841498849333856,
		-.03412293802851557,
		1.0499644368778496
	]
];
const m1 = [
	[
		460,
		451,
		288
	],
	[
		460,
		-891,
		-261
	],
	[
		460,
		-220,
		-6300
	]
];
const surroundMap = {
	dark: [
		.8,
		.525,
		.8
	],
	dim: [
		.9,
		.59,
		.9
	],
	average: [
		1,
		.69,
		1
	]
};
const hueQuadMap = {
	h: [
		20.14,
		90,
		164.25,
		237.53,
		380.14
	],
	e: [
		.8,
		.7,
		1,
		1.2,
		.8
	],
	H: [
		0,
		100,
		200,
		300,
		400
	]
};
const rad2deg = 180 / Math.PI;
const deg2rad$1 = Math.PI / 180;
function adapt$1(coords, fl) {
	const temp = coords.map((c$1) => {
		const x = spow(fl * Math.abs(c$1) * .01, adaptedCoef);
		return 400 * copySign(x, c$1) / (x + 27.13);
	});
	return temp;
}
function unadapt(adapted, fl) {
	const constant = 100 / fl * 27.13 ** adaptedCoefInv;
	return adapted.map((c$1) => {
		const cabs = Math.abs(c$1);
		return copySign(constant * spow(cabs / (400 - cabs), adaptedCoefInv), c$1);
	});
}
function hueQuadrature(h) {
	let hp = constrain(h);
	if (hp <= hueQuadMap.h[0]) hp += 360;
	const i = bisectLeft(hueQuadMap.h, hp) - 1;
	const [hi, hii] = hueQuadMap.h.slice(i, i + 2);
	const [ei, eii] = hueQuadMap.e.slice(i, i + 2);
	const Hi = hueQuadMap.H[i];
	const t$1 = (hp - hi) / ei;
	return Hi + 100 * t$1 / (t$1 + (hii - hp) / eii);
}
function invHueQuadrature(H) {
	let Hp = (H % 400 + 400) % 400;
	const i = Math.floor(.01 * Hp);
	Hp = Hp % 100;
	const [hi, hii] = hueQuadMap.h.slice(i, i + 2);
	const [ei, eii] = hueQuadMap.e.slice(i, i + 2);
	return constrain((Hp * (eii * hi - ei * hii) - 100 * hi * eii) / (Hp * (eii - ei) - 100 * eii));
}
function environment(refWhite, adaptingLuminance, backgroundLuminance, surround, discounting) {
	const env = {};
	env.discounting = discounting;
	env.refWhite = refWhite;
	env.surround = surround;
	const xyzW = refWhite.map((c$1) => {
		return c$1 * 100;
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
	env.fl = k4 * env.la + .1 * (1 - k4) * (1 - k4) * Math.cbrt(5 * env.la);
	env.flRoot = env.fl ** .25;
	env.n = env.yb / yw;
	env.z = 1.48 + Math.sqrt(env.n);
	env.nbb = .725 * env.n ** -.2;
	env.ncb = env.nbb;
	const d$1 = discounting ? 1 : Math.max(Math.min(f * (1 - 1 / 3.6 * Math.exp((-env.la - 42) / 92)), 1), 0);
	env.dRgb = rgbW.map((c$1) => {
		return interpolate$2(1, yw / c$1, d$1);
	});
	env.dRgbInv = env.dRgb.map((c$1) => {
		return 1 / c$1;
	});
	const rgbCW = rgbW.map((c$1, i) => {
		return c$1 * env.dRgb[i];
	});
	const rgbAW = adapt$1(rgbCW, env.fl);
	env.aW = env.nbb * (2 * rgbAW[0] + rgbAW[1] + .05 * rgbAW[2]);
	return env;
}
const viewingConditions$1 = environment(white$3, 64 / Math.PI * .2, 20, "average", false);
function fromCam16(cam16$1, env) {
	if (!(cam16$1.J !== void 0 ^ cam16$1.Q !== void 0)) throw new Error("Conversion requires one and only one: 'J' or 'Q'");
	if (!(cam16$1.C !== void 0 ^ cam16$1.M !== void 0 ^ cam16$1.s !== void 0)) throw new Error("Conversion requires one and only one: 'C', 'M' or 's'");
	if (!(cam16$1.h !== void 0 ^ cam16$1.H !== void 0)) throw new Error("Conversion requires one and only one: 'h' or 'H'");
	if (cam16$1.J === 0 || cam16$1.Q === 0) return [
		0,
		0,
		0
	];
	let hRad = 0;
	if (cam16$1.h !== void 0) hRad = constrain(cam16$1.h) * deg2rad$1;
	else hRad = invHueQuadrature(cam16$1.H) * deg2rad$1;
	const cosh = Math.cos(hRad);
	const sinh = Math.sin(hRad);
	let Jroot = 0;
	if (cam16$1.J !== void 0) Jroot = spow(cam16$1.J, 1 / 2) * .1;
	else if (cam16$1.Q !== void 0) Jroot = .25 * env.c * cam16$1.Q / ((env.aW + 4) * env.flRoot);
	let alpha = 0;
	if (cam16$1.C !== void 0) alpha = cam16$1.C / Jroot;
	else if (cam16$1.M !== void 0) alpha = cam16$1.M / env.flRoot / Jroot;
	else if (cam16$1.s !== void 0) alpha = 4e-4 * cam16$1.s ** 2 * (env.aW + 4) / env.c;
	const t$1 = spow(alpha * Math.pow(1.64 - Math.pow(.29, env.n), -.73), 10 / 9);
	const et = .25 * (Math.cos(hRad + 2) + 3.8);
	const A = env.aW * spow(Jroot, 2 / env.c / env.z);
	const p1 = 5e4 / 13 * env.nc * env.ncb * et;
	const p2 = A / env.nbb;
	const r = 23 * (p2 + .305) * zdiv(t$1, 23 * p1 + t$1 * (11 * cosh + 108 * sinh));
	const a$1 = r * cosh;
	const b$2 = r * sinh;
	const rgb_c = unadapt(multiplyMatrices(m1, [
		p2,
		a$1,
		b$2
	]).map((c$1) => {
		return c$1 * 1 / 1403;
	}), env.fl);
	return multiplyMatrices(cat16Inv, rgb_c.map((c$1, i) => {
		return c$1 * env.dRgbInv[i];
	})).map((c$1) => {
		return c$1 / 100;
	});
}
function toCam16(xyzd65, env) {
	const xyz100 = xyzd65.map((c$1) => {
		return c$1 * 100;
	});
	const rgbA = adapt$1(multiplyMatrices(cat16, xyz100).map((c$1, i) => {
		return c$1 * env.dRgb[i];
	}), env.fl);
	const a$1 = rgbA[0] + (-12 * rgbA[1] + rgbA[2]) / 11;
	const b$2 = (rgbA[0] + rgbA[1] - 2 * rgbA[2]) / 9;
	const hRad = (Math.atan2(b$2, a$1) % tau + tau) % tau;
	const et = .25 * (Math.cos(hRad + 2) + 3.8);
	const t$1 = 5e4 / 13 * env.nc * env.ncb * zdiv(et * Math.sqrt(a$1 ** 2 + b$2 ** 2), rgbA[0] + rgbA[1] + 1.05 * rgbA[2] + .305);
	const alpha = spow(t$1, .9) * Math.pow(1.64 - Math.pow(.29, env.n), .73);
	const A = env.nbb * (2 * rgbA[0] + rgbA[1] + .05 * rgbA[2]);
	const Jroot = spow(A / env.aW, .5 * env.c * env.z);
	const J = 100 * spow(Jroot, 2);
	const Q = 4 / env.c * Jroot * (env.aW + 4) * env.flRoot;
	const C = alpha * Jroot;
	const M = C * env.flRoot;
	const h = constrain(hRad * rad2deg);
	const H = hueQuadrature(h);
	const s = 50 * spow(env.c * alpha / (env.aW + 4), 1 / 2);
	return {
		J,
		C,
		h,
		s,
		Q,
		M,
		H
	};
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
		const cam16$1 = toCam16(xyz, viewingConditions$1);
		return [
			cam16$1.J,
			cam16$1.M,
			cam16$1.h
		];
	},
	toBase(cam16$1) {
		return fromCam16({
			J: cam16$1[0],
			M: cam16$1[1],
			h: cam16$1[2]
		}, viewingConditions$1);
	}
});
const white$2 = WHITES.D65;
const ε$4 = 216 / 24389;
const κ$3 = 24389 / 27;
function toLstar(y) {
	const fy = y > ε$4 ? Math.cbrt(y) : (κ$3 * y + 16) / 116;
	return 116 * fy - 16;
}
function fromLstar(lstar) {
	return lstar > 8 ? Math.pow((lstar + 16) / 116, 3) : lstar / κ$3;
}
function fromHct(coords, env) {
	let [h, c$1, t$1] = coords;
	let xyz = [];
	let j = 0;
	if (t$1 === 0) return [
		0,
		0,
		0
	];
	let y = fromLstar(t$1);
	if (t$1 > 0) j = .00379058511492914 * t$1 ** 2 + .608983189401032 * t$1 + .9155088574762233;
	else j = 9514440756550361e-21 * t$1 ** 2 + .08693057439788597 * t$1 - 21.928975842194614;
	const threshold = 2e-12;
	const max_attempts = 15;
	let attempt = 0;
	let last$1 = Infinity;
	while (attempt <= max_attempts) {
		xyz = fromCam16({
			J: j,
			C: c$1,
			h
		}, env);
		const delta = Math.abs(xyz[1] - y);
		if (delta < last$1) {
			if (delta <= threshold) return xyz;
			last$1 = delta;
		}
		j = j - (xyz[1] - y) * j / (2 * xyz[1]);
		attempt += 1;
	}
	return fromCam16({
		J: j,
		C: c$1,
		h
	}, env);
}
function toHct(xyz, env) {
	const t$1 = toLstar(xyz[1]);
	if (t$1 === 0) return [
		0,
		0,
		0
	];
	const cam16$1 = toCam16(xyz, viewingConditions);
	return [
		constrain(cam16$1.h),
		cam16$1.C,
		t$1
	];
}
const viewingConditions = environment(white$2, 200 / Math.PI * fromLstar(50), fromLstar(50) * 100, "average", false);
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
	toBase(hct$1) {
		return fromHct(hct$1, viewingConditions);
	},
	formats: { color: {
		id: "--hct",
		coords: [
			"<number> | <angle>",
			"<percentage> | <number>",
			"<percentage> | <number>"
		]
	} }
});
const deg2rad = Math.PI / 180;
const ucsCoeff = [
	1,
	.007,
	.0228
];
/**
* Convert HCT chroma and hue (CAM16 JMh colorfulness and hue) using UCS logic for a and b.
* @param {number[]} coords - HCT coordinates.
* @return {number[]}
*/
function convertUcsAb(coords) {
	if (coords[1] < 0) coords = hct.fromBase(hct.toBase(coords));
	const M = Math.log(Math.max(1 + ucsCoeff[2] * coords[1] * viewingConditions.flRoot, 1)) / ucsCoeff[2];
	const hrad = coords[0] * deg2rad;
	const a$1 = M * Math.cos(hrad);
	const b$2 = M * Math.sin(hrad);
	return [
		coords[2],
		a$1,
		b$2
	];
}
/**
* Color distance using HCT.
* @param {Color} color - Color to compare.
* @param {Color} sample - Color to compare.
* @return {number[]}
*/
function deltaEHCT(color, sample$1) {
	[color, sample$1] = getColor([color, sample$1]);
	let [t1, a1, b1] = convertUcsAb(hct.from(color));
	let [t2, a2, b2] = convertUcsAb(hct.from(sample$1));
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
/**
* Calculate the epsilon to 2 degrees smaller than the specified JND.
* @param {Number} jnd - The target "just noticeable difference".
* @returns {Number}
*/
function calcEpsilon(jnd) {
	const order = !jnd ? 0 : Math.floor(Math.log10(Math.abs(jnd)));
	return Math.max(parseFloat(`1e${order - 2}`), 1e-6);
}
const GMAPPRESET = {
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
		blackWhiteClamp: {
			channel: "hct.t",
			min: 0,
			max: 100
		}
	}
};
/**
* Force coordinates to be in gamut of a certain color space.
* Mutates the color it is passed.
* @param {Object|string} options object or spaceId string
* @param {string} options.method - How to force into gamut.
*        If "clip", coordinates are just clipped to their reference range.
*        If "css", coordinates are reduced according to the CSS 4 Gamut Mapping Algorithm.
*        If in the form [colorSpaceId].[coordName], that coordinate is reduced
*        until the color is in gamut. Please note that this may produce nonsensical
*        results for certain coordinates (e.g. hue) or infinite loops if reducing the coordinate never brings the color in gamut.
* @param {ColorSpace|string} options.space - The space whose gamut we want to map to
* @param {string} options.deltaEMethod - The delta E method to use while performing gamut mapping.
*        If no method is specified, delta E 2000 is used.
* @param {Number} options.jnd - The "just noticeable difference" to target.
* @param {Object} options.blackWhiteClamp - Used to configure SDR black and clamping.
*        "channel" indicates the "space.channel" to use for determining when to clamp.
*        "min" indicates the lower limit for black clamping and "max" indicates the upper
*        limit for white clamping.
*/
function toGamut(color, { method = defaults.gamut_mapping, space = void 0, deltaEMethod = "", jnd = 2, blackWhiteClamp = {} } = {}) {
	color = getColor(color);
	if (isString(arguments[1])) space = arguments[1];
	else if (!space) space = color.space;
	space = ColorSpace.get(space);
	if (inGamut(color, space, { epsilon: 0 })) return color;
	let spaceColor;
	if (method === "css") spaceColor = toGamutCSS(color, { space });
	else {
		if (method !== "clip" && !inGamut(color, space)) {
			if (Object.prototype.hasOwnProperty.call(GMAPPRESET, method)) ({method, jnd, deltaEMethod, blackWhiteClamp} = GMAPPRESET[method]);
			let de = deltaE2000;
			if (deltaEMethod !== "") {
				for (let m$1 in deltaEMethods) if ("deltae" + deltaEMethod.toLowerCase() === m$1.toLowerCase()) {
					de = deltaEMethods[m$1];
					break;
				}
			}
			let clipped = toGamut(to$2(color, space), {
				method: "clip",
				space
			});
			if (de(color, clipped) > jnd) {
				if (Object.keys(blackWhiteClamp).length === 3) {
					let channelMeta = ColorSpace.resolveCoord(blackWhiteClamp.channel);
					let channel = get$1(to$2(color, channelMeta.space), channelMeta.id);
					if (isNone(channel)) channel = 0;
					if (channel >= blackWhiteClamp.max) return to$2({
						space: "xyz-d65",
						coords: WHITES["D65"]
					}, color.space);
					else if (channel <= blackWhiteClamp.min) return to$2({
						space: "xyz-d65",
						coords: [
							0,
							0,
							0
						]
					}, color.space);
				}
				let coordMeta = ColorSpace.resolveCoord(method);
				let mapSpace = coordMeta.space;
				let coordId = coordMeta.id;
				let mappedColor = to$2(color, mapSpace);
				mappedColor.coords.forEach((c$1, i) => {
					if (isNone(c$1)) mappedColor.coords[i] = 0;
				});
				let bounds = coordMeta.range || coordMeta.refRange;
				let min$4 = bounds[0];
				let ε$8 = calcEpsilon(jnd);
				let low = min$4;
				let high = get$1(mappedColor, coordId);
				while (high - low > ε$8) {
					let clipped$1 = clone(mappedColor);
					clipped$1 = toGamut(clipped$1, {
						space,
						method: "clip"
					});
					let deltaE$1 = de(mappedColor, clipped$1);
					if (deltaE$1 - jnd < ε$8) low = get$1(mappedColor, coordId);
					else high = get$1(mappedColor, coordId);
					set$1(mappedColor, coordId, (low + high) / 2);
				}
				spaceColor = to$2(mappedColor, space);
			} else spaceColor = clipped;
		} else spaceColor = to$2(color, space);
		if (method === "clip" || !inGamut(spaceColor, space, { epsilon: 0 })) {
			let bounds = Object.values(space.coords).map((c$1) => c$1.range || []);
			spaceColor.coords = spaceColor.coords.map((c$1, i) => {
				let [min$4, max$5] = bounds[i];
				if (min$4 !== void 0) c$1 = Math.max(min$4, c$1);
				if (max$5 !== void 0) c$1 = Math.min(c$1, max$5);
				return c$1;
			});
		}
	}
	if (space !== color.space) spaceColor = to$2(spaceColor, color.space);
	color.coords = spaceColor.coords;
	return color;
}
toGamut.returns = "color";
const COLORS = {
	WHITE: {
		space: OKLab,
		coords: [
			1,
			0,
			0
		]
	},
	BLACK: {
		space: OKLab,
		coords: [
			0,
			0,
			0
		]
	}
};
/**
* Given a color `origin`, returns a new color that is in gamut using
* the CSS Gamut Mapping Algorithm. If `space` is specified, it will be in gamut
* in `space`, and returned in `space`. Otherwise, it will be in gamut and
* returned in the color space of `origin`.
* @param {Object} origin
* @param {Object} options
* @param {ColorSpace|string} options.space
* @returns {Color}
*/
function toGamutCSS(origin, { space } = {}) {
	const JND = .02;
	const ε$8 = 1e-4;
	origin = getColor(origin);
	if (!space) space = origin.space;
	space = ColorSpace.get(space);
	const oklchSpace = ColorSpace.get("oklch");
	if (space.isUnbounded) return to$2(origin, space);
	const origin_OKLCH = to$2(origin, oklchSpace);
	let L = origin_OKLCH.coords[0];
	if (L >= 1) {
		const white$5 = to$2(COLORS.WHITE, space);
		white$5.alpha = origin.alpha;
		return to$2(white$5, space);
	}
	if (L <= 0) {
		const black = to$2(COLORS.BLACK, space);
		black.alpha = origin.alpha;
		return to$2(black, space);
	}
	if (inGamut(origin_OKLCH, space, { epsilon: 0 })) return to$2(origin_OKLCH, space);
	function clip(_color) {
		const destColor = to$2(_color, space);
		const spaceCoords = Object.values(space.coords);
		destColor.coords = destColor.coords.map((coord, index) => {
			if ("range" in spaceCoords[index]) {
				const [min$5, max$6] = spaceCoords[index].range;
				return clamp(min$5, coord, max$6);
			}
			return coord;
		});
		return destColor;
	}
	let min$4 = 0;
	let max$5 = origin_OKLCH.coords[1];
	let min_inGamut = true;
	let current = clone(origin_OKLCH);
	let clipped = clip(current);
	let E = deltaEOK(clipped, current);
	if (E < JND) return clipped;
	while (max$5 - min$4 > ε$8) {
		const chroma = (min$4 + max$5) / 2;
		current.coords[1] = chroma;
		if (min_inGamut && inGamut(current, space, { epsilon: 0 })) min$4 = chroma;
		else {
			clipped = clip(current);
			E = deltaEOK(clipped, current);
			if (E < JND) if (JND - E < ε$8) break;
			else {
				min_inGamut = false;
				min$4 = chroma;
			}
			else max$5 = chroma;
		}
	}
	return clipped;
}
/**
* Convert to color space and return a new color
* @param {Object|string} space - Color space object or id
* @param {Object} options
* @param {boolean} options.inGamut - Whether to force resulting color in gamut
* @returns {Color}
*/
function to$2(color, space, { inGamut: inGamut$1 } = {}) {
	color = getColor(color);
	space = ColorSpace.get(space);
	let coords = space.from(color);
	let ret = {
		space,
		coords,
		alpha: color.alpha
	};
	if (inGamut$1) ret = toGamut(ret, inGamut$1 === true ? void 0 : inGamut$1);
	return ret;
}
to$2.returns = "color";
/**
* Generic toString() method, outputs a color(spaceId ...coords) function, a functional syntax, or custom formats defined by the color space
* @param {Object} options
* @param {number} options.precision - Significant digits
* @param {boolean} options.inGamut - Adjust coordinates to fit in gamut first? [default: false]
*/
function serialize(color, { precision = defaults.precision, format = "default", inGamut: inGamut$1 = true,...customOptions } = {}) {
	let ret;
	color = getColor(color);
	let formatId = format;
	format = color.space.getFormat(format) ?? color.space.getFormat("default") ?? ColorSpace.DEFAULT_FORMAT;
	let coords = color.coords.slice();
	inGamut$1 ||= format.toGamut;
	if (inGamut$1 && !inGamut(color)) coords = toGamut(clone(color), inGamut$1 === true ? void 0 : inGamut$1).coords;
	if (format.type === "custom") {
		customOptions.precision = precision;
		if (format.serialize) ret = format.serialize(coords, color.alpha, customOptions);
		else throw new TypeError(`format ${formatId} can only be used to parse colors, not for serialization`);
	} else {
		let name = format.name || "color";
		if (format.serializeCoords) coords = format.serializeCoords(coords, precision);
		else if (precision !== null) coords = coords.map((c$1) => {
			return serializeNumber(c$1, { precision });
		});
		let args = [...coords];
		if (name === "color") {
			let cssId = format.id || format.ids?.[0] || color.space.id;
			args.unshift(cssId);
		}
		let alpha = color.alpha;
		if (precision !== null) alpha = serializeNumber(alpha, { precision });
		let strAlpha = color.alpha >= 1 || format.noAlpha ? "" : `${format.commas ? "," : " /"} ${alpha}`;
		ret = `${name}(${args.join(format.commas ? ", " : " ")}${strAlpha})`;
	}
	return ret;
}
const toXYZ_M$5 = [
	[
		.6369580483012914,
		.14461690358620832,
		.1688809751641721
	],
	[
		.2627002120112671,
		.6779980715188708,
		.05930171646986196
	],
	[
		0,
		.028072693049087428,
		1.060985057710791
	]
];
const fromXYZ_M$5 = [
	[
		1.716651187971268,
		-.355670783776392,
		-.25336628137366
	],
	[
		-.666684351832489,
		1.616481236634939,
		.0157685458139111
	],
	[
		.017639857445311,
		-.042770613257809,
		.942103121235474
	]
];
var REC2020Linear = new RGBColorSpace({
	id: "rec2020-linear",
	cssId: "--rec2020-linear",
	name: "Linear REC.2020",
	white: "D65",
	toXYZ_M: toXYZ_M$5,
	fromXYZ_M: fromXYZ_M$5
});
const α = 1.09929682680944;
const β = .018053968510807;
var REC2020 = new RGBColorSpace({
	id: "rec2020",
	name: "REC.2020",
	base: REC2020Linear,
	toBase(RGB) {
		return RGB.map(function(val) {
			if (val < β * 4.5) return val / 4.5;
			return Math.pow((val + α - 1) / α, 1 / .45);
		});
	},
	fromBase(RGB) {
		return RGB.map(function(val) {
			if (val >= β) return α * Math.pow(val, .45) - (α - 1);
			return 4.5 * val;
		});
	}
});
const toXYZ_M$4 = [
	[
		.4865709486482162,
		.26566769316909306,
		.1982172852343625
	],
	[
		.2289745640697488,
		.6917385218365064,
		.079286914093745
	],
	[
		0,
		.04511338185890264,
		1.043944368900976
	]
];
const fromXYZ_M$4 = [
	[
		2.493496911941425,
		-.9313836179191239,
		-.40271078445071684
	],
	[
		-.8294889695615747,
		1.7626640603183463,
		.023624685841943577
	],
	[
		.03584583024378447,
		-.07617238926804182,
		.9568845240076872
	]
];
var P3Linear = new RGBColorSpace({
	id: "p3-linear",
	cssId: "--display-p3-linear",
	name: "Linear P3",
	white: "D65",
	toXYZ_M: toXYZ_M$4,
	fromXYZ_M: fromXYZ_M$4
});
const toXYZ_M$3 = [
	[
		.41239079926595934,
		.357584339383878,
		.1804807884018343
	],
	[
		.21263900587151027,
		.715168678767756,
		.07219231536073371
	],
	[
		.01933081871559182,
		.11919477979462598,
		.9505321522496607
	]
];
const fromXYZ_M$3 = [
	[
		3.2409699419045226,
		-1.537383177570094,
		-.4986107602930034
	],
	[
		-.9692436362808796,
		1.8759675015077202,
		.04155505740717559
	],
	[
		.05563007969699366,
		-.20397695888897652,
		1.0569715142428786
	]
];
var sRGBLinear = new RGBColorSpace({
	id: "srgb-linear",
	name: "Linear sRGB",
	white: "D65",
	toXYZ_M: toXYZ_M$3,
	fromXYZ_M: fromXYZ_M$3
});
var KEYWORDS = {
	"aliceblue": [
		240 / 255,
		248 / 255,
		1
	],
	"antiquewhite": [
		250 / 255,
		235 / 255,
		215 / 255
	],
	"aqua": [
		0,
		1,
		1
	],
	"aquamarine": [
		127 / 255,
		1,
		212 / 255
	],
	"azure": [
		240 / 255,
		1,
		1
	],
	"beige": [
		245 / 255,
		245 / 255,
		220 / 255
	],
	"bisque": [
		1,
		228 / 255,
		196 / 255
	],
	"black": [
		0,
		0,
		0
	],
	"blanchedalmond": [
		1,
		235 / 255,
		205 / 255
	],
	"blue": [
		0,
		0,
		1
	],
	"blueviolet": [
		138 / 255,
		43 / 255,
		226 / 255
	],
	"brown": [
		165 / 255,
		42 / 255,
		42 / 255
	],
	"burlywood": [
		222 / 255,
		184 / 255,
		135 / 255
	],
	"cadetblue": [
		95 / 255,
		158 / 255,
		160 / 255
	],
	"chartreuse": [
		127 / 255,
		1,
		0
	],
	"chocolate": [
		210 / 255,
		105 / 255,
		30 / 255
	],
	"coral": [
		1,
		127 / 255,
		80 / 255
	],
	"cornflowerblue": [
		100 / 255,
		149 / 255,
		237 / 255
	],
	"cornsilk": [
		1,
		248 / 255,
		220 / 255
	],
	"crimson": [
		220 / 255,
		20 / 255,
		60 / 255
	],
	"cyan": [
		0,
		1,
		1
	],
	"darkblue": [
		0,
		0,
		139 / 255
	],
	"darkcyan": [
		0,
		139 / 255,
		139 / 255
	],
	"darkgoldenrod": [
		184 / 255,
		134 / 255,
		11 / 255
	],
	"darkgray": [
		169 / 255,
		169 / 255,
		169 / 255
	],
	"darkgreen": [
		0,
		100 / 255,
		0
	],
	"darkgrey": [
		169 / 255,
		169 / 255,
		169 / 255
	],
	"darkkhaki": [
		189 / 255,
		183 / 255,
		107 / 255
	],
	"darkmagenta": [
		139 / 255,
		0,
		139 / 255
	],
	"darkolivegreen": [
		85 / 255,
		107 / 255,
		47 / 255
	],
	"darkorange": [
		1,
		140 / 255,
		0
	],
	"darkorchid": [
		153 / 255,
		50 / 255,
		204 / 255
	],
	"darkred": [
		139 / 255,
		0,
		0
	],
	"darksalmon": [
		233 / 255,
		150 / 255,
		122 / 255
	],
	"darkseagreen": [
		143 / 255,
		188 / 255,
		143 / 255
	],
	"darkslateblue": [
		72 / 255,
		61 / 255,
		139 / 255
	],
	"darkslategray": [
		47 / 255,
		79 / 255,
		79 / 255
	],
	"darkslategrey": [
		47 / 255,
		79 / 255,
		79 / 255
	],
	"darkturquoise": [
		0,
		206 / 255,
		209 / 255
	],
	"darkviolet": [
		148 / 255,
		0,
		211 / 255
	],
	"deeppink": [
		1,
		20 / 255,
		147 / 255
	],
	"deepskyblue": [
		0,
		191 / 255,
		1
	],
	"dimgray": [
		105 / 255,
		105 / 255,
		105 / 255
	],
	"dimgrey": [
		105 / 255,
		105 / 255,
		105 / 255
	],
	"dodgerblue": [
		30 / 255,
		144 / 255,
		1
	],
	"firebrick": [
		178 / 255,
		34 / 255,
		34 / 255
	],
	"floralwhite": [
		1,
		250 / 255,
		240 / 255
	],
	"forestgreen": [
		34 / 255,
		139 / 255,
		34 / 255
	],
	"fuchsia": [
		1,
		0,
		1
	],
	"gainsboro": [
		220 / 255,
		220 / 255,
		220 / 255
	],
	"ghostwhite": [
		248 / 255,
		248 / 255,
		1
	],
	"gold": [
		1,
		215 / 255,
		0
	],
	"goldenrod": [
		218 / 255,
		165 / 255,
		32 / 255
	],
	"gray": [
		128 / 255,
		128 / 255,
		128 / 255
	],
	"green": [
		0,
		128 / 255,
		0
	],
	"greenyellow": [
		173 / 255,
		1,
		47 / 255
	],
	"grey": [
		128 / 255,
		128 / 255,
		128 / 255
	],
	"honeydew": [
		240 / 255,
		1,
		240 / 255
	],
	"hotpink": [
		1,
		105 / 255,
		180 / 255
	],
	"indianred": [
		205 / 255,
		92 / 255,
		92 / 255
	],
	"indigo": [
		75 / 255,
		0,
		130 / 255
	],
	"ivory": [
		1,
		1,
		240 / 255
	],
	"khaki": [
		240 / 255,
		230 / 255,
		140 / 255
	],
	"lavender": [
		230 / 255,
		230 / 255,
		250 / 255
	],
	"lavenderblush": [
		1,
		240 / 255,
		245 / 255
	],
	"lawngreen": [
		124 / 255,
		252 / 255,
		0
	],
	"lemonchiffon": [
		1,
		250 / 255,
		205 / 255
	],
	"lightblue": [
		173 / 255,
		216 / 255,
		230 / 255
	],
	"lightcoral": [
		240 / 255,
		128 / 255,
		128 / 255
	],
	"lightcyan": [
		224 / 255,
		1,
		1
	],
	"lightgoldenrodyellow": [
		250 / 255,
		250 / 255,
		210 / 255
	],
	"lightgray": [
		211 / 255,
		211 / 255,
		211 / 255
	],
	"lightgreen": [
		144 / 255,
		238 / 255,
		144 / 255
	],
	"lightgrey": [
		211 / 255,
		211 / 255,
		211 / 255
	],
	"lightpink": [
		1,
		182 / 255,
		193 / 255
	],
	"lightsalmon": [
		1,
		160 / 255,
		122 / 255
	],
	"lightseagreen": [
		32 / 255,
		178 / 255,
		170 / 255
	],
	"lightskyblue": [
		135 / 255,
		206 / 255,
		250 / 255
	],
	"lightslategray": [
		119 / 255,
		136 / 255,
		153 / 255
	],
	"lightslategrey": [
		119 / 255,
		136 / 255,
		153 / 255
	],
	"lightsteelblue": [
		176 / 255,
		196 / 255,
		222 / 255
	],
	"lightyellow": [
		1,
		1,
		224 / 255
	],
	"lime": [
		0,
		1,
		0
	],
	"limegreen": [
		50 / 255,
		205 / 255,
		50 / 255
	],
	"linen": [
		250 / 255,
		240 / 255,
		230 / 255
	],
	"magenta": [
		1,
		0,
		1
	],
	"maroon": [
		128 / 255,
		0,
		0
	],
	"mediumaquamarine": [
		102 / 255,
		205 / 255,
		170 / 255
	],
	"mediumblue": [
		0,
		0,
		205 / 255
	],
	"mediumorchid": [
		186 / 255,
		85 / 255,
		211 / 255
	],
	"mediumpurple": [
		147 / 255,
		112 / 255,
		219 / 255
	],
	"mediumseagreen": [
		60 / 255,
		179 / 255,
		113 / 255
	],
	"mediumslateblue": [
		123 / 255,
		104 / 255,
		238 / 255
	],
	"mediumspringgreen": [
		0,
		250 / 255,
		154 / 255
	],
	"mediumturquoise": [
		72 / 255,
		209 / 255,
		204 / 255
	],
	"mediumvioletred": [
		199 / 255,
		21 / 255,
		133 / 255
	],
	"midnightblue": [
		25 / 255,
		25 / 255,
		112 / 255
	],
	"mintcream": [
		245 / 255,
		1,
		250 / 255
	],
	"mistyrose": [
		1,
		228 / 255,
		225 / 255
	],
	"moccasin": [
		1,
		228 / 255,
		181 / 255
	],
	"navajowhite": [
		1,
		222 / 255,
		173 / 255
	],
	"navy": [
		0,
		0,
		128 / 255
	],
	"oldlace": [
		253 / 255,
		245 / 255,
		230 / 255
	],
	"olive": [
		128 / 255,
		128 / 255,
		0
	],
	"olivedrab": [
		107 / 255,
		142 / 255,
		35 / 255
	],
	"orange": [
		1,
		165 / 255,
		0
	],
	"orangered": [
		1,
		69 / 255,
		0
	],
	"orchid": [
		218 / 255,
		112 / 255,
		214 / 255
	],
	"palegoldenrod": [
		238 / 255,
		232 / 255,
		170 / 255
	],
	"palegreen": [
		152 / 255,
		251 / 255,
		152 / 255
	],
	"paleturquoise": [
		175 / 255,
		238 / 255,
		238 / 255
	],
	"palevioletred": [
		219 / 255,
		112 / 255,
		147 / 255
	],
	"papayawhip": [
		1,
		239 / 255,
		213 / 255
	],
	"peachpuff": [
		1,
		218 / 255,
		185 / 255
	],
	"peru": [
		205 / 255,
		133 / 255,
		63 / 255
	],
	"pink": [
		1,
		192 / 255,
		203 / 255
	],
	"plum": [
		221 / 255,
		160 / 255,
		221 / 255
	],
	"powderblue": [
		176 / 255,
		224 / 255,
		230 / 255
	],
	"purple": [
		128 / 255,
		0,
		128 / 255
	],
	"rebeccapurple": [
		102 / 255,
		51 / 255,
		153 / 255
	],
	"red": [
		1,
		0,
		0
	],
	"rosybrown": [
		188 / 255,
		143 / 255,
		143 / 255
	],
	"royalblue": [
		65 / 255,
		105 / 255,
		225 / 255
	],
	"saddlebrown": [
		139 / 255,
		69 / 255,
		19 / 255
	],
	"salmon": [
		250 / 255,
		128 / 255,
		114 / 255
	],
	"sandybrown": [
		244 / 255,
		164 / 255,
		96 / 255
	],
	"seagreen": [
		46 / 255,
		139 / 255,
		87 / 255
	],
	"seashell": [
		1,
		245 / 255,
		238 / 255
	],
	"sienna": [
		160 / 255,
		82 / 255,
		45 / 255
	],
	"silver": [
		192 / 255,
		192 / 255,
		192 / 255
	],
	"skyblue": [
		135 / 255,
		206 / 255,
		235 / 255
	],
	"slateblue": [
		106 / 255,
		90 / 255,
		205 / 255
	],
	"slategray": [
		112 / 255,
		128 / 255,
		144 / 255
	],
	"slategrey": [
		112 / 255,
		128 / 255,
		144 / 255
	],
	"snow": [
		1,
		250 / 255,
		250 / 255
	],
	"springgreen": [
		0,
		1,
		127 / 255
	],
	"steelblue": [
		70 / 255,
		130 / 255,
		180 / 255
	],
	"tan": [
		210 / 255,
		180 / 255,
		140 / 255
	],
	"teal": [
		0,
		128 / 255,
		128 / 255
	],
	"thistle": [
		216 / 255,
		191 / 255,
		216 / 255
	],
	"tomato": [
		1,
		99 / 255,
		71 / 255
	],
	"turquoise": [
		64 / 255,
		224 / 255,
		208 / 255
	],
	"violet": [
		238 / 255,
		130 / 255,
		238 / 255
	],
	"wheat": [
		245 / 255,
		222 / 255,
		179 / 255
	],
	"white": [
		1,
		1,
		1
	],
	"whitesmoke": [
		245 / 255,
		245 / 255,
		245 / 255
	],
	"yellow": [
		1,
		1,
		0
	],
	"yellowgreen": [
		154 / 255,
		205 / 255,
		50 / 255
	]
};
let coordGrammar = Array(3).fill("<percentage> | <number>[0, 255]");
let coordGrammarNumber = Array(3).fill("<number>[0, 255]");
var sRGB = new RGBColorSpace({
	id: "srgb",
	name: "sRGB",
	base: sRGBLinear,
	fromBase: (rgb) => {
		return rgb.map((val) => {
			let sign = val < 0 ? -1 : 1;
			let abs$3 = val * sign;
			if (abs$3 > .0031308) return sign * (1.055 * abs$3 ** (1 / 2.4) - .055);
			return 12.92 * val;
		});
	},
	toBase: (rgb) => {
		return rgb.map((val) => {
			let sign = val < 0 ? -1 : 1;
			let abs$3 = val * sign;
			if (abs$3 <= .04045) return val / 12.92;
			return sign * ((abs$3 + .055) / 1.055) ** 2.4;
		});
	},
	formats: {
		"rgb": { coords: coordGrammar },
		"rgb_number": {
			name: "rgb",
			commas: true,
			coords: coordGrammarNumber,
			noAlpha: true
		},
		"color": {},
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
				if (str.length <= 5) str = str.replace(/[a-f0-9]/gi, "$&$&");
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
			serialize: (coords, alpha, { collapse = true } = {}) => {
				if (alpha < 1) coords.push(alpha);
				coords = coords.map((c$1) => Math.round(c$1 * 255));
				let collapsible = collapse && coords.every((c$1) => c$1 % 17 === 0);
				let hex = coords.map((c$1) => {
					if (collapsible) return (c$1 / 17).toString(16);
					return c$1.toString(16).padStart(2, "0");
				}).join("");
				return "#" + hex;
			}
		},
		"keyword": {
			type: "custom",
			test: (str) => /^[a-z]+$/i.test(str),
			parse(str) {
				str = str.toLowerCase();
				let ret = {
					spaceId: "srgb",
					coords: null,
					alpha: 1
				};
				if (str === "transparent") {
					ret.coords = KEYWORDS.black;
					ret.alpha = 0;
				} else ret.coords = KEYWORDS[str];
				if (ret.coords) return ret;
			}
		}
	}
});
var P3 = new RGBColorSpace({
	id: "p3",
	cssId: "display-p3",
	name: "P3",
	base: P3Linear,
	fromBase: sRGB.fromBase,
	toBase: sRGB.toBase
});
defaults.display_space = sRGB;
let supportsNone;
if (typeof CSS !== "undefined" && CSS.supports) for (let space of [
	lab,
	REC2020,
	P3
]) {
	let coords = space.getMinCoords();
	let color = {
		space,
		coords,
		alpha: 1
	};
	let str = serialize(color);
	if (CSS.supports("color", str)) {
		defaults.display_space = space;
		break;
	}
}
/**
* Returns a serialization of the color that can actually be displayed in the browser.
* If the default serialization can be displayed, it is returned.
* Otherwise, the color is converted to Lab, REC2020, or P3, whichever is the widest supported.
* In Node.js, this is basically equivalent to `serialize()` but returns a `String` object instead.
*
* @export
* @param {{space, coords} | Color | string} color
* @param {*} [options={}] Options to be passed to serialize()
* @param {ColorSpace | string} [options.space = defaults.display_space] Color space to use for serialization if default is not supported
* @returns {String} String object containing the serialized color with a color property containing the converted color (or the original, if no conversion was necessary)
*/
function display(color, { space = defaults.display_space,...options } = {}) {
	let ret = serialize(color, options);
	if (typeof CSS === "undefined" || CSS.supports("color", ret) || !defaults.display_space) {
		ret = new String(ret);
		ret.color = color;
	} else {
		let fallbackColor = color;
		let hasNone = color.coords.some(isNone) || isNone(color.alpha);
		if (hasNone) {
			if (!(supportsNone ??= CSS.supports("color", "hsl(none 50% 50%)"))) {
				fallbackColor = clone(color);
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
		fallbackColor = to$2(fallbackColor, space);
		ret = new String(serialize(fallbackColor, options));
		ret.color = fallbackColor;
	}
	return ret;
}
function equals(color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);
	return color1.space === color2.space && color1.alpha === color2.alpha && color1.coords.every((c$1, i) => c$1 === color2.coords[i]);
}
/**
* Relative luminance
*/
function getLuminance(color) {
	return get$1(color, [xyz_d65, "y"]);
}
function setLuminance(color, value) {
	set$1(color, [xyz_d65, "y"], value);
}
function register$2(Color$1) {
	Object.defineProperty(Color$1.prototype, "luminance", {
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
	if (Y2 > Y1) [Y1, Y2] = [Y2, Y1];
	return (Y1 + .05) / (Y2 + .05);
}
const normBG = .56;
const normTXT = .57;
const revTXT = .62;
const revBG = .65;
const blkThrs = .022;
const blkClmp = 1.414;
const loClip = .1;
const deltaYmin = 5e-4;
const scaleBoW = 1.14;
const loBoWoffset = .027;
const scaleWoB = 1.14;
function fclamp(Y) {
	if (Y >= blkThrs) return Y;
	return Y + (blkThrs - Y) ** blkClmp;
}
function linearize(val) {
	let sign = val < 0 ? -1 : 1;
	let abs$3 = Math.abs(val);
	return sign * Math.pow(abs$3, 2.4);
}
function contrastAPCA(background, foreground) {
	foreground = getColor(foreground);
	background = getColor(background);
	let S;
	let C;
	let Sapc;
	let R, G, B;
	foreground = to$2(foreground, "srgb");
	[R, G, B] = foreground.coords;
	let lumTxt = linearize(R) * .2126729 + linearize(G) * .7151522 + linearize(B) * .072175;
	background = to$2(background, "srgb");
	[R, G, B] = background.coords;
	let lumBg = linearize(R) * .2126729 + linearize(G) * .7151522 + linearize(B) * .072175;
	let Ytxt = fclamp(lumTxt);
	let Ybg = fclamp(lumBg);
	let BoW = Ybg > Ytxt;
	if (Math.abs(Ybg - Ytxt) < deltaYmin) C = 0;
	else if (BoW) {
		S = Ybg ** normBG - Ytxt ** normTXT;
		C = S * scaleBoW;
	} else {
		S = Ybg ** revBG - Ytxt ** revTXT;
		C = S * scaleWoB;
	}
	if (Math.abs(C) < loClip) Sapc = 0;
	else if (C > 0) Sapc = C - loBoWoffset;
	else Sapc = C + loBoWoffset;
	return Sapc * 100;
}
function contrastMichelson(color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);
	let Y1 = Math.max(getLuminance(color1), 0);
	let Y2 = Math.max(getLuminance(color2), 0);
	if (Y2 > Y1) [Y1, Y2] = [Y2, Y1];
	let denom = Y1 + Y2;
	return denom === 0 ? 0 : (Y1 - Y2) / denom;
}
const max$2 = 5e4;
function contrastWeber(color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);
	let Y1 = Math.max(getLuminance(color1), 0);
	let Y2 = Math.max(getLuminance(color2), 0);
	if (Y2 > Y1) [Y1, Y2] = [Y2, Y1];
	return Y2 === 0 ? max$2 : (Y1 - Y2) / Y2;
}
function contrastLstar(color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);
	let L1 = get$1(color1, [lab, "l"]);
	let L2 = get$1(color2, [lab, "l"]);
	return Math.abs(L1 - L2);
}
const ε$3 = 216 / 24389;
const ε3 = 24 / 116;
const κ$2 = 24389 / 27;
let white$1 = WHITES.D65;
var lab_d65 = new ColorSpace({
	id: "lab-d65",
	name: "Lab D65",
	coords: {
		l: {
			refRange: [0, 100],
			name: "Lightness"
		},
		a: { refRange: [-125, 125] },
		b: { refRange: [-125, 125] }
	},
	white: white$1,
	base: xyz_d65,
	fromBase(XYZ) {
		let xyz = XYZ.map((value, i) => value / white$1[i]);
		let f = xyz.map((value) => value > ε$3 ? Math.cbrt(value) : (κ$2 * value + 16) / 116);
		return [
			116 * f[1] - 16,
			500 * (f[0] - f[1]),
			200 * (f[1] - f[2])
		];
	},
	toBase(Lab) {
		let f = [];
		f[1] = (Lab[0] + 16) / 116;
		f[0] = Lab[1] / 500 + f[1];
		f[2] = f[1] - Lab[2] / 200;
		let xyz = [
			f[0] > ε3 ? Math.pow(f[0], 3) : (116 * f[0] - 16) / κ$2,
			Lab[0] > 8 ? Math.pow((Lab[0] + 16) / 116, 3) : Lab[0] / κ$2,
			f[2] > ε3 ? Math.pow(f[2], 3) : (116 * f[2] - 16) / κ$2
		];
		return xyz.map((value, i) => value * white$1[i]);
	},
	formats: { "lab-d65": { coords: [
		"<number> | <percentage>",
		"<number> | <percentage>[-1,1]",
		"<number> | <percentage>[-1,1]"
	] } }
});
const phi = Math.pow(5, .5) * .5 + .5;
function contrastDeltaPhi(color1, color2) {
	color1 = getColor(color1);
	color2 = getColor(color2);
	let Lstr1 = get$1(color1, [lab_d65, "l"]);
	let Lstr2 = get$1(color2, [lab_d65, "l"]);
	let deltaPhiStar = Math.abs(Math.pow(Lstr1, phi) - Math.pow(Lstr2, phi));
	let contrast$1 = Math.pow(deltaPhiStar, 1 / phi) * Math.SQRT2 - 40;
	return contrast$1 < 7.5 ? 0 : contrast$1;
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
	if (isString(o)) o = { algorithm: o };
	let { algorithm,...rest } = o;
	if (!algorithm) {
		let algorithms = Object.keys(contrastMethods).map((a$1) => a$1.replace(/^contrast/, "")).join(", ");
		throw new TypeError(`contrast() function needs a contrast algorithm. Please specify one of: ${algorithms}`);
	}
	background = getColor(background);
	foreground = getColor(foreground);
	for (let a$1 in contrastMethods) if ("contrast" + algorithm.toLowerCase() === a$1.toLowerCase()) return contrastMethods[a$1](background, foreground, rest);
	throw new TypeError(`Unknown contrast algorithm: ${algorithm}`);
}
function uv(color) {
	let [X, Y, Z] = getAll(color, xyz_d65);
	let denom = X + 15 * Y + 3 * Z;
	return [4 * X / denom, 9 * Y / denom];
}
function xy(color) {
	let [X, Y, Z] = getAll(color, xyz_d65);
	let sum$6 = X + Y + Z;
	return [X / sum$6, Y / sum$6];
}
function register$1(Color$1) {
	Object.defineProperty(Color$1.prototype, "uv", { get() {
		return uv(this);
	} });
	Object.defineProperty(Color$1.prototype, "xy", { get() {
		return xy(this);
	} });
}
var chromaticity = /* @__PURE__ */ Object.freeze({
	__proto__: null,
	register: register$1,
	uv,
	xy
});
function deltaE(c1$3, c2$3, o = {}) {
	if (isString(o)) o = { method: o };
	let { method = defaults.deltaE,...rest } = o;
	for (let m$1 in deltaEMethods) if ("deltae" + method.toLowerCase() === m$1.toLowerCase()) return deltaEMethods[m$1](c1$3, c2$3, rest);
	throw new TypeError(`Unknown deltaE method: ${method}`);
}
function lighten(color, amount = .25) {
	let space = ColorSpace.get("oklch", "lch");
	let lightness = [space, "l"];
	return set$1(color, lightness, (l) => l * (1 + amount));
}
function darken(color, amount = .25) {
	let space = ColorSpace.get("oklch", "lch");
	let lightness = [space, "l"];
	return set$1(color, lightness, (l) => l * (1 - amount));
}
var variations = /* @__PURE__ */ Object.freeze({
	__proto__: null,
	darken,
	lighten
});
/**
* Functions related to color interpolation
*/
/**
* Return an intermediate color between two colors
* Signatures: mix(c1, c2, p, options)
*             mix(c1, c2, options)
*             mix(color)
* @param {Color | string} c1 The first color
* @param {Color | string} [c2] The second color
* @param {number} [p=.5] A 0-1 percentage where 0 is c1 and 1 is c2
* @param {Object} [o={}]
* @return {Color}
*/
function mix$1(c1$3, c2$3, p$1 = .5, o = {}) {
	[c1$3, c2$3] = [getColor(c1$3), getColor(c2$3)];
	if (type(p$1) === "object") [p$1, o] = [.5, p$1];
	let r = range(c1$3, c2$3, o);
	return r(p$1);
}
/**
*
* @param {Color | string | Function} c1 The first color or a range
* @param {Color | string} [c2] The second color if c1 is not a range
* @param {Object} [options={}]
* @return {Color[]}
*/
function steps(c1$3, c2$3, options = {}) {
	let colorRange;
	if (isRange(c1$3)) {
		[colorRange, options] = [c1$3, c2$3];
		[c1$3, c2$3] = colorRange.rangeArgs.colors;
	}
	let { maxDeltaE, deltaEMethod, steps: steps$1 = 2, maxSteps = 1e3,...rangeOptions } = options;
	if (!colorRange) {
		[c1$3, c2$3] = [getColor(c1$3), getColor(c2$3)];
		colorRange = range(c1$3, c2$3, rangeOptions);
	}
	let totalDelta = deltaE(c1$3, c2$3);
	let actualSteps = maxDeltaE > 0 ? Math.max(steps$1, Math.ceil(totalDelta / maxDeltaE) + 1) : steps$1;
	let ret = [];
	if (maxSteps !== void 0) actualSteps = Math.min(actualSteps, maxSteps);
	if (actualSteps === 1) ret = [{
		p: .5,
		color: colorRange(.5)
	}];
	else {
		let step = 1 / (actualSteps - 1);
		ret = Array.from({ length: actualSteps }, (_, i) => {
			let p$1 = i * step;
			return {
				p: p$1,
				color: colorRange(p$1)
			};
		});
	}
	if (maxDeltaE > 0) {
		let maxDelta = ret.reduce((acc, cur, i) => {
			if (i === 0) return 0;
			let ΔΕ = deltaE(cur.color, ret[i - 1].color, deltaEMethod);
			return Math.max(acc, ΔΕ);
		}, 0);
		while (maxDelta > maxDeltaE) {
			maxDelta = 0;
			for (let i = 1; i < ret.length && ret.length < maxSteps; i++) {
				let prev = ret[i - 1];
				let cur = ret[i];
				let p$1 = (cur.p + prev.p) / 2;
				let color = colorRange(p$1);
				maxDelta = Math.max(maxDelta, deltaE(color, prev.color), deltaE(color, cur.color));
				ret.splice(i, 0, {
					p: p$1,
					color: colorRange(p$1)
				});
				i++;
			}
		}
	}
	ret = ret.map((a$1) => a$1.color);
	return ret;
}
/**
* Interpolate to color2 and return a function that takes a 0-1 percentage
* @param {Color | string | Function} color1 The first color or an existing range
* @param {Color | string} [color2] If color1 is a color, this is the second color
* @param {Object} [options={}]
* @returns {Function} A function that takes a 0-1 percentage and returns a color
*/
function range(color1, color2, options = {}) {
	if (isRange(color1)) {
		let [r, options$1] = [color1, color2];
		return range(...r.rangeArgs.colors, {
			...r.rangeArgs.options,
			...options$1
		});
	}
	let { space, outputSpace, progression, premultiplied } = options;
	color1 = getColor(color1);
	color2 = getColor(color2);
	color1 = clone(color1);
	color2 = clone(color2);
	let rangeArgs = {
		colors: [color1, color2],
		options
	};
	if (space) space = ColorSpace.get(space);
	else space = ColorSpace.registry[defaults.interpolationSpace] || color1.space;
	outputSpace = outputSpace ? ColorSpace.get(outputSpace) : space;
	color1 = to$2(color1, space);
	color2 = to$2(color2, space);
	color1 = toGamut(color1);
	color2 = toGamut(color2);
	if (space.coords.h && space.coords.h.type === "angle") {
		let arc$1 = options.hue = options.hue || "shorter";
		let hue = [space, "h"];
		let [θ1, θ2] = [get$1(color1, hue), get$1(color2, hue)];
		if (isNaN(θ1) && !isNaN(θ2)) θ1 = θ2;
		else if (isNaN(θ2) && !isNaN(θ1)) θ2 = θ1;
		[θ1, θ2] = adjust(arc$1, [θ1, θ2]);
		set$1(color1, hue, θ1);
		set$1(color2, hue, θ2);
	}
	if (premultiplied) {
		color1.coords = color1.coords.map((c$1) => c$1 * color1.alpha);
		color2.coords = color2.coords.map((c$1) => c$1 * color2.alpha);
	}
	return Object.assign((p$1) => {
		p$1 = progression ? progression(p$1) : p$1;
		let coords = color1.coords.map((start, i) => {
			let end = color2.coords[i];
			return interpolate$2(start, end, p$1);
		});
		let alpha = interpolate$2(color1.alpha, color2.alpha, p$1);
		let ret = {
			space,
			coords,
			alpha
		};
		if (premultiplied) ret.coords = ret.coords.map((c$1) => c$1 / alpha);
		if (outputSpace !== space) ret = to$2(ret, outputSpace);
		return ret;
	}, { rangeArgs });
}
function isRange(val) {
	return type(val) === "function" && !!val.rangeArgs;
}
defaults.interpolationSpace = "lab";
function register(Color$1) {
	Color$1.defineFunction("mix", mix$1, { returns: "color" });
	Color$1.defineFunction("range", range, { returns: "function<color>" });
	Color$1.defineFunction("steps", steps, { returns: "array<color>" });
}
var interpolation = /* @__PURE__ */ Object.freeze({
	__proto__: null,
	isRange,
	mix: mix$1,
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
	fromBase: (rgb) => {
		let max$5 = Math.max(...rgb);
		let min$4 = Math.min(...rgb);
		let [r, g$1, b$2] = rgb;
		let [h, s, l] = [
			NaN,
			0,
			(min$4 + max$5) / 2
		];
		let d$1 = max$5 - min$4;
		if (d$1 !== 0) {
			s = l === 0 || l === 1 ? 0 : (max$5 - l) / Math.min(l, 1 - l);
			switch (max$5) {
				case r:
					h = (g$1 - b$2) / d$1 + (g$1 < b$2 ? 6 : 0);
					break;
				case g$1:
					h = (b$2 - r) / d$1 + 2;
					break;
				case b$2: h = (r - g$1) / d$1 + 4;
			}
			h = h * 60;
		}
		if (s < 0) {
			h += 180;
			s = Math.abs(s);
		}
		if (h >= 360) h -= 360;
		return [
			h,
			s * 100,
			l * 100
		];
	},
	toBase: (hsl) => {
		let [h, s, l] = hsl;
		h = h % 360;
		if (h < 0) h += 360;
		s /= 100;
		l /= 100;
		function f(n$2) {
			let k = (n$2 + h / 30) % 12;
			let a$1 = s * Math.min(l, 1 - l);
			return l - a$1 * Math.max(-1, Math.min(k - 3, 9 - k, 1));
		}
		return [
			f(0),
			f(8),
			f(4)
		];
	},
	formats: {
		"hsl": { coords: [
			"<number> | <angle>",
			"<percentage>",
			"<percentage>"
		] },
		"hsla": {
			coords: [
				"<number> | <angle>",
				"<percentage>",
				"<percentage>"
			],
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
	fromBase(hsl) {
		let [h, s, l] = hsl;
		s /= 100;
		l /= 100;
		let v = l + s * Math.min(l, 1 - l);
		return [
			h,
			v === 0 ? 0 : 200 * (1 - l / v),
			100 * v
		];
	},
	toBase(hsv) {
		let [h, s, v] = hsv;
		s /= 100;
		v /= 100;
		let l = v * (1 - s / 2);
		return [
			h,
			l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l) * 100,
			l * 100
		];
	},
	formats: { color: {
		id: "--hsv",
		coords: [
			"<number> | <angle>",
			"<percentage> | <number>",
			"<percentage> | <number>"
		]
	} }
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
		return [
			h,
			v * (100 - s) / 100,
			100 - v
		];
	},
	toBase(hwb$1) {
		let [h, w, b$2] = hwb$1;
		w /= 100;
		b$2 /= 100;
		let sum$6 = w + b$2;
		if (sum$6 >= 1) {
			let gray = w / sum$6;
			return [
				h,
				0,
				gray * 100
			];
		}
		let v = 1 - b$2;
		let s = v === 0 ? 0 : 1 - w / v;
		return [
			h,
			s * 100,
			v * 100
		];
	},
	formats: { "hwb": { coords: [
		"<number> | <angle>",
		"<percentage> | <number>",
		"<percentage> | <number>"
	] } }
});
const toXYZ_M$2 = [
	[
		.5766690429101305,
		.1855582379065463,
		.1882286462349947
	],
	[
		.29734497525053605,
		.6273635662554661,
		.07529145849399788
	],
	[
		.02703136138641234,
		.07068885253582723,
		.9913375368376388
	]
];
const fromXYZ_M$2 = [
	[
		2.0415879038107465,
		-.5650069742788596,
		-.34473135077832956
	],
	[
		-.9692436362808795,
		1.8759675015077202,
		.04155505740717557
	],
	[
		.013444280632031142,
		-.11836239223101838,
		1.0151749943912054
	]
];
var A98Linear = new RGBColorSpace({
	id: "a98rgb-linear",
	cssId: "--a98-rgb-linear",
	name: "Linear Adobe® 98 RGB compatible",
	white: "D65",
	toXYZ_M: toXYZ_M$2,
	fromXYZ_M: fromXYZ_M$2
});
var a98rgb = new RGBColorSpace({
	id: "a98rgb",
	cssId: "a98-rgb",
	name: "Adobe® 98 RGB compatible",
	base: A98Linear,
	toBase: (RGB) => RGB.map((val) => Math.pow(Math.abs(val), 563 / 256) * Math.sign(val)),
	fromBase: (RGB) => RGB.map((val) => Math.pow(Math.abs(val), 256 / 563) * Math.sign(val))
});
const toXYZ_M$1 = [
	[
		.7977666449006423,
		.13518129740053308,
		.0313477341283922
	],
	[
		.2880748288194013,
		.711835234241873,
		8993693872564e-17
	],
	[
		0,
		0,
		.8251046025104602
	]
];
const fromXYZ_M$1 = [
	[
		1.3457868816471583,
		-.25557208737979464,
		-.05110186497554526
	],
	[
		-.5446307051249019,
		1.5082477428451468,
		.02052744743642139
	],
	[
		0,
		0,
		1.2119675456389452
	]
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
const Et = 1 / 512;
const Et2 = 16 / 512;
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
			refRange: [0, .4],
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
		let [L, a$1, b$2] = oklab;
		let h;
		const ε$8 = 2e-4;
		if (Math.abs(a$1) < ε$8 && Math.abs(b$2) < ε$8) h = NaN;
		else h = Math.atan2(b$2, a$1) * 180 / Math.PI;
		return [
			L,
			Math.sqrt(a$1 ** 2 + b$2 ** 2),
			constrain(h)
		];
	},
	toBase(oklch$1) {
		let [L, C, h] = oklch$1;
		let a$1, b$2;
		if (isNaN(h)) {
			a$1 = 0;
			b$2 = 0;
		} else {
			a$1 = C * Math.cos(h * Math.PI / 180);
			b$2 = C * Math.sin(h * Math.PI / 180);
		}
		return [
			L,
			a$1,
			b$2
		];
	},
	formats: { "oklch": { coords: [
		"<percentage> | <number>",
		"<number> | <percentage>[0,1]",
		"<number> | <angle>"
	] } }
});
let white = WHITES.D65;
const ε$2 = 216 / 24389;
const κ$1 = 24389 / 27;
const [U_PRIME_WHITE, V_PRIME_WHITE] = uv({
	space: xyz_d65,
	coords: white
});
var Luv = new ColorSpace({
	id: "luv",
	name: "Luv",
	coords: {
		l: {
			refRange: [0, 100],
			name: "Lightness"
		},
		u: { refRange: [-215, 215] },
		v: { refRange: [-215, 215] }
	},
	white,
	base: xyz_d65,
	fromBase(XYZ) {
		let xyz = [
			skipNone(XYZ[0]),
			skipNone(XYZ[1]),
			skipNone(XYZ[2])
		];
		let y = xyz[1];
		let [up, vp] = uv({
			space: xyz_d65,
			coords: xyz
		});
		if (!Number.isFinite(up) || !Number.isFinite(vp)) return [
			0,
			0,
			0
		];
		let L = y <= ε$2 ? κ$1 * y : 116 * Math.cbrt(y) - 16;
		return [
			L,
			13 * L * (up - U_PRIME_WHITE),
			13 * L * (vp - V_PRIME_WHITE)
		];
	},
	toBase(Luv$1) {
		let [L, u, v] = Luv$1;
		if (L === 0 || isNone(L)) return [
			0,
			0,
			0
		];
		u = skipNone(u);
		v = skipNone(v);
		let up = u / (13 * L) + U_PRIME_WHITE;
		let vp = v / (13 * L) + V_PRIME_WHITE;
		let y = L <= 8 ? L / κ$1 : Math.pow((L + 16) / 116, 3);
		return [
			y * (9 * up / (4 * vp)),
			y,
			y * ((12 - 3 * up - 20 * vp) / (4 * vp))
		];
	},
	formats: { color: {
		id: "--luv",
		coords: [
			"<number> | <percentage>",
			"<number> | <percentage>[-1,1]",
			"<number> | <percentage>[-1,1]"
		]
	} }
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
	fromBase(Luv$1) {
		let [L, u, v] = Luv$1;
		let hue;
		const ε$8 = .02;
		if (Math.abs(u) < ε$8 && Math.abs(v) < ε$8) hue = NaN;
		else hue = Math.atan2(v, u) * 180 / Math.PI;
		return [
			L,
			Math.sqrt(u ** 2 + v ** 2),
			constrain(hue)
		];
	},
	toBase(LCH) {
		let [Lightness, Chroma, Hue] = LCH;
		if (Chroma < 0) Chroma = 0;
		if (isNaN(Hue)) Hue = 0;
		return [
			Lightness,
			Chroma * Math.cos(Hue * Math.PI / 180),
			Chroma * Math.sin(Hue * Math.PI / 180)
		];
	},
	formats: { color: {
		id: "--lchuv",
		coords: [
			"<number> | <percentage>",
			"<number> | <percentage>",
			"<number> | <angle>"
		]
	} }
});
const ε$1 = 216 / 24389;
const κ = 24389 / 27;
const m_r0 = fromXYZ_M$3[0][0];
const m_r1 = fromXYZ_M$3[0][1];
const m_r2 = fromXYZ_M$3[0][2];
const m_g0 = fromXYZ_M$3[1][0];
const m_g1 = fromXYZ_M$3[1][1];
const m_g2 = fromXYZ_M$3[1][2];
const m_b0 = fromXYZ_M$3[2][0];
const m_b1 = fromXYZ_M$3[2][1];
const m_b2 = fromXYZ_M$3[2][2];
function distanceFromOriginAngle(slope$1, intercept, angle) {
	const d$1 = intercept / (Math.sin(angle) - slope$1 * Math.cos(angle));
	return d$1 < 0 ? Infinity : d$1;
}
function calculateBoundingLines(l) {
	const sub1 = Math.pow(l + 16, 3) / 1560896;
	const sub2 = sub1 > ε$1 ? sub1 : l / κ;
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
	fromBase(lch$1) {
		let [l, c$1, h] = [
			skipNone(lch$1[0]),
			skipNone(lch$1[1]),
			skipNone(lch$1[2])
		];
		let s;
		if (l > 99.9999999) {
			s = 0;
			l = 100;
		} else if (l < 1e-8) {
			s = 0;
			l = 0;
		} else {
			let lines = calculateBoundingLines(l);
			let max$5 = calcMaxChromaHsluv(lines, h);
			s = c$1 / max$5 * 100;
		}
		return [
			h,
			s,
			l
		];
	},
	toBase(hsl) {
		let [h, s, l] = [
			skipNone(hsl[0]),
			skipNone(hsl[1]),
			skipNone(hsl[2])
		];
		let c$1;
		if (l > 99.9999999) {
			l = 100;
			c$1 = 0;
		} else if (l < 1e-8) {
			l = 0;
			c$1 = 0;
		} else {
			let lines = calculateBoundingLines(l);
			let max$5 = calcMaxChromaHsluv(lines, h);
			c$1 = max$5 / 100 * s;
		}
		return [
			l,
			c$1,
			h
		];
	},
	formats: { color: {
		id: "--hsluv",
		coords: [
			"<number> | <angle>",
			"<percentage> | <number>",
			"<percentage> | <number>"
		]
	} }
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
function distanceFromOrigin(slope$1, intercept) {
	return Math.abs(intercept) / Math.sqrt(Math.pow(slope$1, 2) + 1);
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
	fromBase(lch$1) {
		let [l, c$1, h] = [
			skipNone(lch$1[0]),
			skipNone(lch$1[1]),
			skipNone(lch$1[2])
		];
		let s;
		if (l > 99.9999999) {
			s = 0;
			l = 100;
		} else if (l < 1e-8) {
			s = 0;
			l = 0;
		} else {
			let lines = calculateBoundingLines(l);
			let max$5 = calcMaxChromaHpluv(lines);
			s = c$1 / max$5 * 100;
		}
		return [
			h,
			s,
			l
		];
	},
	toBase(hsl) {
		let [h, s, l] = [
			skipNone(hsl[0]),
			skipNone(hsl[1]),
			skipNone(hsl[2])
		];
		let c$1;
		if (l > 99.9999999) {
			l = 100;
			c$1 = 0;
		} else if (l < 1e-8) {
			l = 0;
			c$1 = 0;
		} else {
			let lines = calculateBoundingLines(l);
			let max$5 = calcMaxChromaHpluv(lines);
			c$1 = max$5 / 100 * s;
		}
		return [
			l,
			c$1,
			h
		];
	},
	formats: { color: {
		id: "--hpluv",
		coords: [
			"<number> | <angle>",
			"<percentage> | <number>",
			"<percentage> | <number>"
		]
	} }
});
const Yw = 203;
const n = 2610 / 2 ** 14;
const ninv = 2 ** 14 / 2610;
const m = 2523 / 2 ** 5;
const minv = 2 ** 5 / 2523;
const c1 = 3424 / 2 ** 12;
const c2 = 2413 / 2 ** 7;
const c3 = 2392 / 2 ** 7;
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
const a = .17883277;
const b = .28466892;
const c = .55991073;
const scale$1 = 3.7743;
var rec2100Hlg = new RGBColorSpace({
	id: "rec2100hlg",
	cssId: "rec2100-hlg",
	name: "REC.2100-HLG",
	referred: "scene",
	base: REC2020Linear,
	toBase(RGB) {
		return RGB.map(function(val) {
			if (val <= .5) return val ** 2 / 3 * scale$1;
			return (Math.exp((val - c) / a) + b) / 12 * scale$1;
		});
	},
	fromBase(RGB) {
		return RGB.map(function(val) {
			val /= scale$1;
			if (val <= 1 / 12) return Math.sqrt(3 * val);
			return a * Math.log(12 * val - b) + c;
		});
	}
});
const CATs = {};
hooks.add("chromatic-adaptation-start", (env) => {
	if (env.options.method) env.M = adapt(env.W1, env.W2, env.options.method);
});
hooks.add("chromatic-adaptation-end", (env) => {
	if (!env.M) env.M = adapt(env.W1, env.W2, env.options.method);
});
function defineCAT({ id, toCone_M, fromCone_M }) {
	CATs[id] = arguments[0];
}
function adapt(W1, W2, id = "Bradford") {
	let method = CATs[id];
	let [ρs, γs, βs] = multiplyMatrices(method.toCone_M, W1);
	let [ρd, γd, βd] = multiplyMatrices(method.toCone_M, W2);
	let scale$4 = [
		[
			ρd / ρs,
			0,
			0
		],
		[
			0,
			γd / γs,
			0
		],
		[
			0,
			0,
			βd / βs
		]
	];
	let scaled_cone_M = multiplyMatrices(scale$4, method.toCone_M);
	let adapt_M = multiplyMatrices(method.fromCone_M, scaled_cone_M);
	return adapt_M;
}
defineCAT({
	id: "von Kries",
	toCone_M: [
		[
			.40024,
			.7076,
			-.08081
		],
		[
			-.2263,
			1.16532,
			.0457
		],
		[
			0,
			0,
			.91822
		]
	],
	fromCone_M: [
		[
			1.8599363874558397,
			-1.1293816185800916,
			.21989740959619328
		],
		[
			.3611914362417676,
			.6388124632850422,
			-6370596838649899e-21
		],
		[
			0,
			0,
			1.0890636230968613
		]
	]
});
defineCAT({
	id: "Bradford",
	toCone_M: [
		[
			.8951,
			.2664,
			-.1614
		],
		[
			-.7502,
			1.7135,
			.0367
		],
		[
			.0389,
			-.0685,
			1.0296
		]
	],
	fromCone_M: [
		[
			.9869929054667121,
			-.14705425642099013,
			.15996265166373122
		],
		[
			.4323052697233945,
			.5183602715367774,
			.049291228212855594
		],
		[
			-.00852866457517732,
			.04004282165408486,
			.96848669578755
		]
	]
});
defineCAT({
	id: "CAT02",
	toCone_M: [
		[
			.7328,
			.4296,
			-.1624
		],
		[
			-.7036,
			1.6975,
			.0061
		],
		[
			.003,
			.0136,
			.9834
		]
	],
	fromCone_M: [
		[
			1.0961238208355142,
			-.27886900021828726,
			.18274517938277307
		],
		[
			.4543690419753592,
			.4735331543074117,
			.07209780371722911
		],
		[
			-.009627608738429355,
			-.00569803121611342,
			1.0153256399545427
		]
	]
});
defineCAT({
	id: "CAT16",
	toCone_M: [
		[
			.401288,
			.650173,
			-.051461
		],
		[
			-.250268,
			1.204414,
			.045854
		],
		[
			-.002079,
			.048952,
			.953127
		]
	],
	fromCone_M: [
		[
			1.862067855087233,
			-1.0112546305316845,
			.14918677544445172
		],
		[
			.3875265432361372,
			.6214474419314753,
			-.008973985167612521
		],
		[
			-.01584149884933386,
			-.03412293802851557,
			1.0499644368778496
		]
	]
});
Object.assign(WHITES, {
	A: [
		1.0985,
		1,
		.35585
	],
	C: [
		.98074,
		1,
		1.18232
	],
	D55: [
		.95682,
		1,
		.92149
	],
	D75: [
		.94972,
		1,
		1.22638
	],
	E: [
		1,
		1,
		1
	],
	F2: [
		.99186,
		1,
		.67393
	],
	F7: [
		.95041,
		1,
		1.08747
	],
	F11: [
		1.00962,
		1,
		.6435
	]
});
WHITES.ACES = [
	.32168 / .33767,
	1,
	.34065 / .33767
];
const toXYZ_M = [
	[
		.6624541811085053,
		.13400420645643313,
		.1561876870049078
	],
	[
		.27222871678091454,
		.6740817658111484,
		.05368951740793705
	],
	[
		-.005574649490394108,
		.004060733528982826,
		1.0103391003129971
	]
];
const fromXYZ_M = [
	[
		1.6410233796943257,
		-.32480329418479,
		-.23642469523761225
	],
	[
		-.6636628587229829,
		1.6153315916573379,
		.016756347685530137
	],
	[
		.011721894328375376,
		-.008284441996237409,
		.9883948585390215
	]
];
var ACEScg = new RGBColorSpace({
	id: "acescg",
	cssId: "--acescg",
	name: "ACEScg",
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
const ε = 2 ** -16;
const ACES_min_nonzero = -.35828683;
const ACES_cc_max = (Math.log2(65504) + 9.72) / 17.52;
var acescc = new RGBColorSpace({
	id: "acescc",
	cssId: "--acescc",
	name: "ACEScc",
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
	toBase(RGB) {
		const low = -5.279999999999999 / 17.52;
		return RGB.map(function(val) {
			if (val <= low) return (2 ** (val * 17.52 - 9.72) - ε) * 2;
			else if (val < ACES_cc_max) return 2 ** (val * 17.52 - 9.72);
			else return 65504;
		});
	},
	fromBase(RGB) {
		return RGB.map(function(val) {
			if (val <= 0) return (Math.log2(ε) + 9.72) / 17.52;
			else if (val < ε) return (Math.log2(ε + val * .5) + 9.72) / 17.52;
			else return (Math.log2(val) + 9.72) / 17.52;
		});
	}
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
var Color = class Color {
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
		if (args.length === 1) color = getColor(args[0]);
		let space, coords, alpha;
		if (color) {
			space = color.space || color.spaceId;
			coords = color.coords;
			alpha = color.alpha;
		} else [space, coords, alpha] = args;
		Object.defineProperty(this, "space", {
			value: ColorSpace.get(space),
			writable: false,
			enumerable: true,
			configurable: true
		});
		this.coords = coords ? coords.slice() : [
			0,
			0,
			0
		];
		this.alpha = alpha > 1 || alpha === void 0 ? 1 : alpha < 0 ? 0 : alpha;
		for (let i = 0; i < this.coords.length; i++) if (this.coords[i] === "NaN") this.coords[i] = NaN;
		for (let id in this.space.coords) Object.defineProperty(this, id, {
			get: () => this.get(id),
			set: (value) => this.set(id, value)
		});
	}
	get spaceId() {
		return this.space.id;
	}
	clone() {
		return new Color(this.space, this.coords, this.alpha);
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
		ret.color = new Color(ret.color);
		return ret;
	}
	/**
	* Get a color from the argument passed
	* Basically gets us the same result as new Color(color) but doesn't clone an existing color object
	*/
	static get(color, ...args) {
		if (color instanceof Color) return color;
		return new Color(color, ...args);
	}
	static defineFunction(name, code, o = code) {
		let { instance = true, returns } = o;
		let func$1 = function(...args) {
			let ret = code(...args);
			if (returns === "color") ret = Color.get(ret);
			else if (returns === "function<color>") {
				let f = ret;
				ret = function(...args$1) {
					let ret$1 = f(...args$1);
					return Color.get(ret$1);
				};
				Object.assign(ret, f);
			} else if (returns === "array<color>") ret = ret.map((c$1) => Color.get(c$1));
			return ret;
		};
		if (!(name in Color)) Color[name] = func$1;
		if (instance) Color.prototype[name] = function(...args) {
			return func$1(this, ...args);
		};
	}
	static defineFunctions(o) {
		for (let name in o) Color.defineFunction(name, o[name], o[name]);
	}
	static extend(exports) {
		if (exports.register) exports.register(Color);
		else for (let name in exports) Color.defineFunction(name, exports[name]);
	}
};
Color.defineFunctions({
	get: get$1,
	getAll,
	set: set$1,
	setAll,
	to: to$2,
	equals,
	inGamut,
	toGamut,
	distance,
	toString: serialize
});
Object.assign(Color, {
	util,
	hooks,
	WHITES,
	Space: ColorSpace,
	spaces: ColorSpace.registry,
	parse,
	defaults
});
for (let key of Object.keys(spaces)) ColorSpace.register(spaces[key]);
/**
* This plugin defines getters and setters for color[spaceId]
* e.g. color.lch on *any* color gives us the lch coords
*/
for (let id in ColorSpace.registry) addSpaceAccessors(id, ColorSpace.registry[id]);
hooks.add("colorspace-init-end", (space) => {
	addSpaceAccessors(space.id, space);
	space.aliases?.forEach((alias) => {
		addSpaceAccessors(alias, space);
	});
});
function addSpaceAccessors(id, space) {
	let propId = id.replace(/-/g, "_");
	Object.defineProperty(Color.prototype, propId, {
		get() {
			let ret = this.getAll(id);
			if (typeof Proxy === "undefined") return ret;
			return new Proxy(ret, {
				has: (obj, property) => {
					try {
						ColorSpace.resolveCoord([space, property]);
						return true;
					} catch (e) {}
					return Reflect.has(obj, property);
				},
				get: (obj, property, receiver) => {
					if (property && typeof property !== "symbol" && !(property in obj)) {
						let { index } = ColorSpace.resolveCoord([space, property]);
						if (index >= 0) return obj[index];
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

//#endregion
//#region packages/visual/src/colour/oklch.ts
const oklchToColorJs = (lch$1) => {
	throwNumberTest(lch$1.l, `percentage`, `lch.l`);
	throwNumberTest(lch$1.c, `percentage`, `lch.c`);
	throwNumberTest(lch$1.h, `percentage`, `lch.h`);
	throwNumberTest(lch$1.opacity, `percentage`, `lch.opacity`);
	return {
		alpha: lch$1.opacity,
		coords: [
			lch$1.l,
			lch$1.c * .4,
			lch$1.h * 360
		],
		spaceId: `oklch`
	};
};
const isOklch = (p$1) => {
	if (p$1 === void 0 || p$1 === null) return false;
	if (typeof p$1 !== `object`) return false;
	if (p$1.space !== `oklch`) return false;
	if (p$1.l === void 0) return false;
	if (p$1.c === void 0) return false;
	if (p$1.h === void 0) return false;
	return true;
};

//#endregion
//#region packages/visual/src/colour/resolve-css.ts
const resolveCss = (colour, fallback) => {
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
const getCssVariable = (name, fallbackColour = `black`, root) => {
	if (root === void 0) root = document.body;
	if (name.startsWith(`--`)) name = name.slice(2);
	const fromCss = getComputedStyle(root).getPropertyValue(`--${name}`).trim();
	if (fromCss === void 0 || fromCss.length === 0) return fallbackColour;
	return fromCss;
};

//#endregion
//#region packages/visual/src/colour/rgb.ts
/**
* Converts to relative Rgb value.
* RGB are 0..255 scale, opacity is always 0..1 scale
* @param r 
* @param g 
* @param b 
* @param opacity 
* @returns 
*/
const relativeFromAbsolute = (r, g$1, b$2, opacity = 255) => {
	r = clamp$3(r / 255);
	g$1 = clamp$3(g$1 / 255);
	b$2 = clamp$3(b$2 / 255);
	opacity = clamp$3(opacity);
	return {
		r,
		g: g$1,
		b: b$2,
		opacity,
		unit: `relative`,
		space: `srgb`
	};
};
const rgbToRelative = (rgb) => {
	if (rgb.unit === `relative`) return rgb;
	return relativeFromAbsolute(rgb.r, rgb.g, rgb.b, rgb.opacity);
};
const isRgb = (p$1, validate = false) => {
	if (p$1 === void 0 || p$1 === null) return false;
	if (typeof p$1 !== `object`) return false;
	const space = p$1.space;
	if (space !== `srgb` && space !== void 0) return false;
	const pp = p$1;
	if (pp.r === void 0) return false;
	if (pp.g === void 0) return false;
	if (pp.b === void 0) return false;
	if (validate) {
		if (`opacity` in pp) throwFromResult(numberInclusiveRangeTest(pp.opacity, 0, 1, `opacity`));
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
const rgbToColorJs = (rgb) => {
	const rel = rgbToRelative(rgb);
	return {
		alpha: rel.opacity,
		coords: [
			rgb.r,
			rgb.g,
			rgb.b
		],
		spaceId: `sRGB`
	};
};
const toRgb = (colour) => {
	if (typeof colour === `string` && colour === `transparent`) return {
		r: 1,
		g: 1,
		b: 1,
		opacity: 0,
		space: `srgb`,
		unit: `relative`
	};
	if (isRgb(colour)) return rgbToRelative(colour);
	else if (isHsl(colour)) {
		const hslRel = hslToRelative(colour);
		const c$1 = new Color(`hsl`, [
			hslRel.h,
			hslRel.s,
			hslRel.l
		], hslRel.opacity ?? 1);
		const rgb = c$1.srgb;
		return {
			r: rgb[0],
			g: rgb[1],
			b: rgb[2],
			opacity: c$1.alpha,
			unit: `relative`,
			space: `srgb`
		};
	} else if (isOklch(colour)) {
		const c$1 = new Color(`oklch`, [
			colour.l,
			colour.c,
			colour.h
		], colour.opacity ?? 1);
		const rgb = c$1.srgb;
		return {
			r: rgb[0],
			g: rgb[1],
			b: rgb[2],
			opacity: c$1.alpha,
			unit: `relative`,
			space: `srgb`
		};
	} else {
		const c$1 = new Color(resolveCss(colour));
		const rgb = c$1.srgb;
		return {
			r: rgb[0],
			g: rgb[1],
			b: rgb[2],
			opacity: c$1.alpha,
			unit: `relative`,
			space: `srgb`
		};
	}
};
const toRgb8bit = (rgb, clamped = true) => {
	if (rgb.unit === `8bit`) return rgb;
	let r = rgb.r * 255;
	let g$1 = rgb.g * 255;
	let b$2 = rgb.b * 255;
	let opacity = (rgb.opacity ?? 1) * 255;
	if (clamped) {
		r = clamp$3(r, 0, 255);
		g$1 = clamp$3(g$1, 0, 255);
		b$2 = clamp$3(b$2, 0, 255);
		opacity = clamp$3(opacity, 0, 255);
	}
	return {
		r,
		g: g$1,
		b: b$2,
		opacity,
		unit: `8bit`,
		space: `srgb`
	};
};
const toRgbRelative = (rgb, clamped = true) => {
	if (rgb.unit === `relative`) return rgb;
	if (rgb.unit === `8bit`) {
		let r = rgb.r / 255;
		let g$1 = rgb.g / 255;
		let b$2 = rgb.b / 255;
		let opacity = (rgb.opacity ?? 255) / 255;
		if (clamped) {
			r = clamp$3(r);
			g$1 = clamp$3(g$1);
			b$2 = clamp$3(b$2);
			opacity = clamp$3(opacity);
		}
		return {
			r,
			g: g$1,
			b: b$2,
			opacity,
			unit: `relative`,
			space: `srgb`
		};
	} else throw new Error(`Unknown unit. Expected '8bit'`);
};
const parseRgbObject = (p$1) => {
	if (p$1 === void 0 || p$1 === null) return {
		success: false,
		error: `Undefined/null`
	};
	if (typeof p$1 !== `object`) return {
		success: false,
		error: `Not an object`
	};
	const space = p$1.space ?? `srgb`;
	let { r, g: g$1, b: b$2, opacity } = p$1;
	if (r !== void 0 || g$1 !== void 0 || b$2 !== void 0) {} else {
		const { red, green, blue } = p$1;
		if (red !== void 0 || green !== void 0 || blue !== void 0) {
			r = red;
			g$1 = green;
			b$2 = blue;
		} else return {
			success: false,
			error: `Does not contain r,g,b or red,green,blue`
		};
	}
	let unit = p$1.unit;
	if (unit === `relative`) {
		if (r > 1 || r < 0) return {
			success: false,
			error: `Relative units, but 'r' exceeds 0..1`
		};
		if (g$1 > 1 || g$1 < 0) return {
			success: false,
			error: `Relative units, but 'g' exceeds 0..1`
		};
		if (b$2 > 1 || b$2 < 0) return {
			success: false,
			error: `Relative units, but 'b' exceeds 0..1`
		};
		if (opacity > 1 || opacity < 0) return {
			success: false,
			error: `Relative units, but opacity exceeds 0..1`
		};
	} else if (unit === `8bit`) {
		if (r > 255 || r < 0) return {
			success: false,
			error: `8bit units, but r exceeds 0..255`
		};
		if (g$1 > 255 || g$1 < 0) return {
			success: false,
			error: `8bit units, but g exceeds 0..255`
		};
		if (b$2 > 255 || b$2 < 0) return {
			success: false,
			error: `8bit units, but b exceeds 0..255`
		};
		if (opacity > 255 || opacity < 0) return {
			success: false,
			error: `8bit units, but opacity exceeds 0..255`
		};
	} else if (!unit) if (r > 1 || g$1 > 1 || b$2 > 1) if (r <= 255 && g$1 <= 255 && b$2 <= 255) unit = `8bit`;
	else return {
		success: false,
		error: `Unknown units, outside 0..255 range`
	};
	else if (r <= 1 && g$1 <= 1 && b$2 <= 1) if (r >= 0 && g$1 >= 0 && b$2 >= 0) unit = `relative`;
	else return {
		success: false,
		error: `Unknown units, outside of 0..1 range`
	};
	else return {
		success: false,
		error: `Unknown units for r,g,b,opacity values`
	};
	if (opacity === void 0) opacity = unit === `8bit` ? 255 : 1;
	const c$1 = {
		r,
		g: g$1,
		b: b$2,
		opacity,
		unit,
		space
	};
	return {
		success: true,
		value: c$1
	};
};

//#endregion
//#region packages/visual/src/colour/hsl.ts
const hslToColorJs = (hsl) => {
	const abs$3 = hslToAbsolute(hsl);
	return {
		alpha: abs$3.opacity ?? 1,
		coords: [
			abs$3.h,
			abs$3.s,
			abs$3.l
		],
		spaceId: `hsl`
	};
};
const isHsl = (p$1, validate = false) => {
	if (p$1 === void 0 || p$1 === null) return false;
	if (typeof p$1 !== `object`) return false;
	const pp = p$1;
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
		if (`opacity` in pp) throwNumberTest(pp.opacity, `percentage`, `opacity`);
	}
	return true;
};
const hslToString = (hsl) => {
	const { h, s, l, opacity } = hslToAbsolute(hsl, true);
	return `hsl(${h}deg ${s}% ${l}% / ${opacity}%)`;
};
const hslToAbsolute = (hsl, safe = true) => {
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
const hslFromRelativeValues = (h = 1, s = 1, l = .5, opacity = 1) => {
	return {
		h,
		s,
		l,
		opacity,
		unit: `relative`,
		space: `hsl`
	};
};
const hslFromAbsoluteValues = (h, s, l, opacity = 1, safe = false) => {
	const hTest = numberInclusiveRangeTest(h, 0, 360, `h`);
	if (!hTest[0]) if (safe) h = 0;
	else throwFromResult(hTest);
	throwFromResult(numberInclusiveRangeTest(s, 0, 100, `s`));
	throwFromResult(numberInclusiveRangeTest(l, 0, 100, `l`));
	throwFromResult(numberInclusiveRangeTest(opacity, 0, 1, `opacity`));
	if (s > 100) throw new Error(`Param 's' expected 0..100`);
	if (l > 100) throw new Error(`Param 'l' expected 0..100`);
	h = clamp$3(h / 360);
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
const hslToRelative = (hsl, safe = true) => {
	if (hsl.unit === `relative`) return hsl;
	return hslFromAbsoluteValues(hsl.h, hsl.s, hsl.l, hsl.opacity, safe);
};
const toHsl = (colour, safe = true) => {
	if (typeof colour === `string` && colour === `transparent`) return {
		h: 0,
		s: 0,
		l: 0,
		opacity: 0,
		space: `hsl`,
		unit: `relative`
	};
	if (!colour && !safe) throw new Error(`Param 'colour' is undefined`);
	if (isHsl(colour)) return hslToRelative(colour);
	else if (isRgb(colour)) {
		const rgb = toRgbRelative(colour);
		const c$1 = new Color(`sRGB`, [
			rgb.r,
			rgb.g,
			rgb.b
		], rgb.opacity ?? 1);
		const [h, s, l] = c$1.hsl.map((v) => parseFloat(v));
		return hslFromAbsoluteValues(h, s, l, parseFloat(c$1.alpha), safe);
	} else if (isOklch(colour)) {
		const c$1 = new Color(`oklch`, [
			colour.l,
			colour.c,
			colour.h
		], colour.opacity ?? 1);
		const [h, s, l] = c$1.hsl.map((v) => parseFloat(v));
		return hslFromAbsoluteValues(h, s, l, parseFloat(c$1.alpha), safe);
	} else {
		const c$1 = new Color(resolveCss(colour));
		const [h, s, l] = c$1.hsl.map((v) => parseFloat(v));
		return hslFromAbsoluteValues(h, s, l, parseFloat(c$1.alpha), safe);
	}
};

//#endregion
//#region packages/visual/src/colour/resolve-to-color.ts
const structuredToColorJsConstructor = (colour) => {
	if (isHsl(colour, true)) return hslToColorJs(colour);
	if (isRgb(colour, true)) return rgbToColorJs(colour);
	if (isOklch(colour)) return oklchToColorJs(colour);
	const c$1 = new Color(resolveCss(colour));
	return {
		alpha: c$1.alpha,
		coords: c$1.coords,
		spaceId: c$1.spaceId
	};
};
const structuredToColorJs = (colour) => {
	const cc = structuredToColorJsConstructor(colour);
	return new Color(cc.spaceId, cc.coords, cc.alpha);
};

//#endregion
//#region packages/visual/src/colour/to-hex.ts
const toHex = (colour) => {
	if (typeof colour === `string` && colour === `transparent`) return `#00000000`;
	const cc = structuredToColorJsConstructor(colour);
	const c$1 = new Color(cc.spaceId, cc.coords, cc.alpha);
	return c$1.to(`srgb`).toString({
		format: `hex`,
		collapse: false
	});
};
const toString = (colour) => {
	const c$1 = structuredToColorJs(colour);
	return c$1.display().toString();
};
const toStringFirst = (...colours) => {
	for (const colour of colours) {
		if (colour === void 0) continue;
		if (colour === null) continue;
		try {
			const c$1 = structuredToColorJs(colour);
			return c$1.display();
		} catch (_error) {
			return colour.toString();
		}
	}
	return `rebeccapurple`;
};

//#endregion
//#region packages/visual/src/colour/interpolate.ts
const interpolator = (colours, opts = {}) => {
	const space = opts.space ?? `lch`;
	const hue = opts.hue ?? `shorter`;
	const pieces = interpolatorInit(colours);
	const ranges = pieces.map((piece) => piece[0].range(piece[1], {
		space,
		hue
	}));
	return (amt) => {
		amt = clamp$3(amt);
		const s = scale$2(amt, 0, 1, 0, ranges.length);
		const index = Math.floor(s);
		const amtAdjusted = s - index;
		const range$1 = ranges[index];
		if (index === 1) return toString(colours.at(-1));
		const colour = range$1(amtAdjusted);
		return colour.display();
	};
};
const interpolatorInit = (colours) => {
	if (!Array.isArray(colours)) throw new Error(`Param 'colours' is not an array as expected. Got: ${typeof colours}`);
	if (colours.length < 2) throw new Error(`Param 'colours' should be at least two in length. Got: ${colours.length}`);
	const c$1 = colours.map((colour) => {
		const c$2 = structuredToColorJsConstructor(colour);
		return new Color(c$2.spaceId, c$2.coords, c$2.alpha);
	});
	return [...pairwise(c$1)];
};
const cssLinearGradient = (colours) => {
	const c$1 = colours.map((c$2) => toString(c$2));
	return `linear-gradient(to right, ${c$1.join(`, `)})`;
};
const scale = (colours, numberOfSteps, opts = {}) => {
	const space = opts.space ?? `lch`;
	const hue = opts.hue ?? `shorter`;
	const pieces = interpolatorInit(colours);
	const stepsPerPair = Math.floor(numberOfSteps / pieces.length);
	const steps$1 = pieces.map((piece) => piece[0].steps(piece[1], {
		space,
		hue,
		steps: stepsPerPair,
		outputSpace: `srgb`
	}));
	return steps$1.flat().map((c$1) => c$1.display());
};

//#endregion
//#region packages/visual/src/colour/math.ts
const multiplyOpacity = (colour, amt) => {
	throwNumberTest(amt, `percentage`, `amt`);
	const c$1 = structuredToColorJs(colour);
	const alpha = clamp$3((c$1.alpha ?? 0) * amt);
	c$1.alpha = alpha;
	return c$1.toString();
};
const multiplySaturation = (colour, amt) => {
	throwNumberTest(amt, `percentage`, `amt`);
	const c$1 = structuredToColorJs(colour);
	c$1.s = (c$1.s ?? 0) * amt;
	return c$1.toString();
};

//#endregion
//#region packages/visual/src/colour/index.ts
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
	interpolator: () => interpolator,
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
	scale: () => scale,
	structuredToColorJs: () => structuredToColorJs,
	structuredToColorJsConstructor: () => structuredToColorJsConstructor,
	toHex: () => toHex,
	toHsl: () => toHsl,
	toRgb: () => toRgb,
	toRgb8bit: () => toRgb8bit,
	toRgbRelative: () => toRgbRelative,
	toString: () => toString,
	toStringFirst: () => toStringFirst
});

//#endregion
//#region packages/visual/src/image-data-grid.ts
var image_data_grid_exports = {};
__export(image_data_grid_exports, {
	accessor: () => accessor,
	byColumn: () => byColumn,
	byRow: () => byRow,
	grid: () => grid,
	setter: () => setter,
	wrap: () => wrap$1
});
const grid = (image) => {
	const g$1 = {
		rows: image.width,
		cols: image.height
	};
	return g$1;
};
const wrap$1 = (image) => {
	return {
		...grid(image),
		get: accessor(image),
		set: setter(image)
	};
};
const accessor = (image) => {
	const g$1 = grid(image);
	const data = image.data;
	const fn = (cell, bounds = `undefined`) => {
		const index = indexFromCell(g$1, cell, bounds);
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
const setter = (image) => {
	const g$1 = grid(image);
	const data = image.data;
	const fn = (value, cell, bounds = `undefined`) => {
		const index = indexFromCell(g$1, cell, bounds);
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
	const a$1 = accessor(image);
	const g$1 = grid(image);
	const v = rows(g$1, {
		x: 0,
		y: 0
	});
	for (const row of v) {
		const pixels = row.map((p$1) => a$1(p$1, `undefined`));
		yield pixels;
	}
}
function* byColumn(image) {
	const a$1 = accessor(image);
	const g$1 = grid(image);
	for (let x = 0; x < g$1.cols; x++) {
		const col = [];
		for (let y = 0; y < g$1.rows; y++) {
			const p$1 = a$1({
				x,
				y
			}, `undefined`);
			if (p$1) col.push(p$1);
		}
		yield col;
	}
}

//#endregion
//#region packages/core/src/records/compare.ts
const compareObjectKeys = (a$1, b$2) => {
	const c$1 = compareIterableValuesShallow(Object.keys(a$1), Object.keys(b$2));
	return c$1;
};
const compareArrays = (a$1, b$2, eq = isEqualDefault) => {
	if (!Array.isArray(a$1)) throw new Error(`Param 'a' is not an array`);
	if (!Array.isArray(b$2)) throw new Error(`Param 'b' is not an array`);
	const c$1 = compareObjectData(a$1, b$2, false, eq);
	if (!c$1.isArray) throw new Error(`Change set does not have arrays as parameters`);
	const convert = (key) => {
		if (key.startsWith(`_`)) return Number.parseInt(key.slice(1));
		else throw new Error(`Unexpected key '${key}'`);
	};
	const cc = {
		...c$1,
		added: mapObjectKeys(c$1.added, convert),
		changed: mapObjectKeys(c$1.changed, convert),
		removed: c$1.removed.map((v) => convert(v)),
		summary: c$1.summary.map((value) => {
			return [
				value[0],
				convert(value[1]),
				value[2]
			];
		})
	};
	return cc;
};
const compareObjectData = (a$1, b$2, assumeSameShape = false, eq = isEqualDefault) => {
	a$1 ??= {};
	b$2 ??= {};
	const entriesA = Object.entries(a$1);
	const entriesB = Object.entries(b$2);
	const scannedKeys = new Set();
	const changed = {};
	const added = {};
	const children = {};
	const removed = [];
	const isArray = Array.isArray(a$1);
	const summary = new Array();
	let hasChanged = false;
	for (const entry of entriesA) {
		const outputKey = isArray ? `_${entry[0]}` : entry[0];
		const aValue = entry[1];
		const bValue = b$2[entry[0]];
		scannedKeys.add(entry[0]);
		if (bValue === void 0) {
			hasChanged = true;
			if (assumeSameShape && !isArray) {
				changed[outputKey] = bValue;
				summary.push([
					`mutate`,
					outputKey,
					bValue
				]);
			} else {
				removed.push(outputKey);
				summary.push([
					`del`,
					outputKey,
					aValue
				]);
			}
			continue;
		}
		if (typeof aValue === `object`) {
			const r = compareObjectData(aValue, bValue, assumeSameShape, eq);
			if (r.hasChanged) hasChanged = true;
			children[outputKey] = r;
			const childSummary = r.summary.map((sum$6) => {
				return [
					sum$6[0],
					outputKey + `.` + sum$6[1],
					sum$6[2]
				];
			});
			summary.push(...childSummary);
		} else if (!eq(aValue, bValue)) {
			changed[outputKey] = bValue;
			hasChanged = true;
			summary.push([
				`mutate`,
				outputKey,
				bValue
			]);
		}
	}
	if (!assumeSameShape || isArray) for (const entry of entriesB) {
		const key = isArray ? `_${entry[0]}` : entry[0];
		if (scannedKeys.has(entry[0])) continue;
		added[key] = entry[1];
		hasChanged = true;
		summary.push([
			`add`,
			key,
			entry[1]
		]);
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

//#endregion
//#region packages/core/src/records/clone-from-fields.ts
const cloneFromFields$1 = (source) => {
	const entries = [];
	for (const field$1 in source) {
		const value = source[field$1];
		if (isPlainObjectOrPrimitive(value)) entries.push([field$1, value]);
	}
	return Object.fromEntries(entries);
};

//#endregion
//#region packages/core/src/records/map-object.ts
const mapObjectShallow = (object$1, mapFunction) => {
	const entries = Object.entries(object$1);
	const mapped = entries.map(([sourceField, sourceFieldValue], index) => [sourceField, mapFunction({
		value: sourceFieldValue,
		field: sourceField,
		index,
		path: sourceField
	})]);
	return Object.fromEntries(mapped);
};

//#endregion
//#region packages/core/src/records/pathed.ts
const getEntries = (target, deepProbe) => {
	if (target === void 0) throw new Error(`Param 'target' is undefined`);
	if (target === null) throw new Error(`Param 'target' is null`);
	if (typeof target !== `object`) throw new Error(`Param 'target' is not an object (got: ${typeof target})`);
	if (deepProbe) {
		const entries = [];
		for (const field$1 in target) {
			const value = target[field$1];
			if (isPlainObjectOrPrimitive(value)) entries.push([field$1, value]);
		}
		return entries;
	} else return Object.entries(target);
};
function* compareData(a$1, b$2, options = {}) {
	if (typeof a$1 === `undefined`) {
		yield {
			path: options.pathPrefix ?? ``,
			value: b$2,
			state: `added`
		};
		return;
	}
	if (typeof b$2 === `undefined`) {
		yield {
			path: options.pathPrefix ?? ``,
			previous: a$1,
			value: void 0,
			state: `removed`
		};
		return;
	}
	const asPartial = options.asPartial ?? false;
	const undefinedValueMeansRemoved = options.undefinedValueMeansRemoved ?? false;
	const pathPrefix = options.pathPrefix ?? ``;
	const deepEntries = options.deepEntries ?? false;
	const eq = options.eq ?? isEqualContextString;
	const includeMissingFromA = options.includeMissingFromA ?? false;
	const includeParents = options.includeParents ?? false;
	if (isPrimitive(a$1) && isPrimitive(b$2)) {
		if (a$1 !== b$2) yield {
			path: pathPrefix,
			value: b$2,
			previous: a$1,
			state: `change`
		};
		return;
	}
	if (isPrimitive(b$2)) {
		yield {
			path: pathPrefix,
			value: b$2,
			previous: a$1,
			state: `change`
		};
		return;
	}
	const entriesA = getEntries(a$1, deepEntries);
	const entriesAKeys = new Set();
	for (const [key, valueA] of entriesA) {
		entriesAKeys.add(key);
		const keyOfAInB = key in b$2;
		const valueOfKeyInB = b$2[key];
		if (typeof valueA === `object` && valueA !== null) if (keyOfAInB) if (valueOfKeyInB === void 0) throw new Error(`Pathed.compareData Value for key ${key} is undefined`);
		else {
			const sub = [...compareData(valueA, valueOfKeyInB, {
				...options,
				pathPrefix: pathPrefix + key + `.`
			})];
			if (sub.length > 0) {
				for (const s of sub) yield s;
				if (includeParents) yield {
					path: pathPrefix + key,
					value: b$2[key],
					previous: valueA,
					state: `change`
				};
			}
		}
		else {
			if (asPartial) continue;
			yield {
				path: pathPrefix + key,
				value: void 0,
				previous: valueA,
				state: `removed`
			};
		}
		else {
			const subPath = pathPrefix + key;
			if (keyOfAInB) {
				if (valueOfKeyInB === void 0 && undefinedValueMeansRemoved) yield {
					path: subPath,
					previous: valueA,
					value: void 0,
					state: `removed`
				};
				else if (!eq(valueA, valueOfKeyInB, subPath)) yield {
					path: subPath,
					previous: valueA,
					value: valueOfKeyInB,
					state: `change`
				};
			} else {
				if (asPartial) continue;
				yield {
					path: subPath,
					previous: valueA,
					value: void 0,
					state: `removed`
				};
			}
		}
	}
	if (includeMissingFromA) {
		const entriesB = getEntries(b$2, deepEntries);
		for (const [key, valueB] of entriesB) {
			if (entriesAKeys.has(key)) continue;
			yield {
				path: pathPrefix + key,
				previous: void 0,
				value: valueB,
				state: `added`
			};
		}
	}
}
const updateByPath = (target, path, value, allowShapeChange = false) => {
	if (path === void 0) throw new Error(`Parameter 'path' is undefined`);
	if (typeof path !== `string`) throw new Error(`Parameter 'path' should be a string. Got: ${typeof path}`);
	if (target === void 0) throw new Error(`Parameter 'target' is undefined`);
	if (target === null) throw new Error(`Parameter 'target' is null`);
	const split$1 = path.split(`.`);
	const r = updateByPathImpl(target, split$1, value, allowShapeChange);
	return r;
};
const updateByPathImpl = (o, split$1, value, allowShapeChange) => {
	if (split$1.length === 0) {
		if (allowShapeChange) return value;
		if (Array.isArray(o) && !Array.isArray(value)) throw new Error(`Expected array value, got: '${JSON.stringify(value)}'. Set allowShapeChange=true to ignore.`);
		if (!Array.isArray(o) && Array.isArray(value)) throw new Error(`Unexpected array value, got: '${JSON.stringify(value)}'. Set allowShapeChange=true to ignore.`);
		if (typeof o !== typeof value) throw new Error(`Cannot reassign object type. (${typeof o} -> ${typeof value}). Set allowShapeChange=true to ignore.`);
		if (typeof o === `object` && !Array.isArray(o)) {
			const c$1 = compareObjectKeys(o, value);
			if (c$1.a.length > 0) throw new Error(`New value is missing key(s): ${c$1.a.join(`,`)}`);
			if (c$1.b.length > 0) throw new Error(`New value cannot add new key(s): ${c$1.b.join(`,`)}`);
		}
		return value;
	}
	const start = split$1.shift();
	if (!start) return value;
	const isInt = isInteger(start);
	if (isInt && Array.isArray(o)) {
		const index = Number.parseInt(start);
		if (index >= o.length && !allowShapeChange) throw new Error(`Array index ${index.toString()} is outside of the existing length of ${o.length.toString()}. Use allowShapeChange=true to permit this.`);
		const copy = [...o];
		copy[index] = updateByPathImpl(copy[index], split$1, value, allowShapeChange);
		return copy;
	} else if (start in o) {
		const copy = { ...o };
		copy[start] = updateByPathImpl(copy[start], split$1, value, allowShapeChange);
		return copy;
	} else throw new Error(`Path ${start} not found in data`);
};
const getField = (object$1, path) => {
	if (typeof path !== `string`) throw new Error(`Param 'path' ought to be a string. Got: '${typeof path}'`);
	if (path.length === 0) throw new Error(`Param string 'path' is empty`);
	if (object$1 === void 0) throw new Error(`Param 'object' is undefined`);
	if (object$1 === null) throw new Error(`Param 'object' is null`);
	const split$1 = path.split(`.`);
	const v = getFieldImpl(object$1, split$1);
	return v;
};
const getFieldImpl = (object$1, split$1) => {
	if (object$1 === void 0) throw new Error(`Param 'object' is undefined`);
	if (split$1.length === 0) throw new Error(`Path has run out`);
	const start = split$1.shift();
	if (!start) throw new Error(`Unexpected empty split path`);
	const isInt = isInteger(start);
	if (isInt && Array.isArray(object$1)) {
		const index = Number.parseInt(start);
		if (typeof object$1[index] === `undefined`) return {
			success: false,
			error: `Index '${index}' does not exist. Length: ${object$1.length}`
		};
		if (split$1.length === 0) return {
			value: object$1[index],
			success: true
		};
		else return getFieldImpl(object$1[index], split$1);
	} else if (typeof object$1 === `object` && start in object$1) if (split$1.length === 0) return {
		value: object$1[start],
		success: true
	};
	else return getFieldImpl(object$1[start], split$1);
	else return {
		success: false,
		error: `Path '${start}' not found`
	};
};

//#endregion
//#region packages/core/src/records/index.ts
const mapObjectKeys = (object$1, mapFunction) => {
	const destinationObject = {};
	for (const entries of Object.entries(object$1)) {
		const key = mapFunction(entries[0]);
		destinationObject[key] = entries[1];
	}
	return destinationObject;
};

//#endregion
//#region packages/visual/src/canvas-helper.ts
var CanvasHelper = class extends SimpleEventEmitter {
	el;
	opts;
	#scaler;
	#scalerSize;
	#viewport = EmptyPositioned;
	#logicalSize = Empty;
	#ctx;
	#drawHelper;
	#resizer;
	#disposed = false;
	constructor(domQueryOrEl, opts = {}) {
		super();
		if (!domQueryOrEl) throw new Error(`Param 'domQueryOrEl' is null or undefined`);
		this.el = resolveEl(domQueryOrEl);
		if (this.el.nodeName !== `CANVAS`) throw new Error(`Expected CANVAS HTML element. Got: ${this.el.nodeName}`);
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
		this.#scaler = scaler(`both`);
		this.#scalerSize = scaler(`both`, size);
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
			const c$1 = this.el.getContext(`2d`);
			if (c$1 === null) throw new Error(`Could not create drawing context`);
			this.#ctx = c$1;
			c$1.setTransform(1, 0, 0, 1, 0, 0);
			c$1.scale(ratio, ratio);
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
		if (!this.#drawHelper) this.#drawHelper = makeHelper(this.#getContext(), {
			width: this.width,
			height: this.height
		});
	}
	setLogicalSize(logicalSize) {
		guard$5(logicalSize, `logicalSize`);
		const logicalSizeInteger = applyFields((v) => Math.floor(v), logicalSize);
		const ratio = this.opts.pixelZoom;
		this.#scaler = scaler(this.opts.coordinateScale, logicalSize);
		this.#scalerSize = scaler(`both`, logicalSize);
		const pixelScaled = multiplyScalar(logicalSize, ratio);
		this.el.width = pixelScaled.width;
		this.el.height = pixelScaled.height;
		this.el.style.width = logicalSizeInteger.width.toString() + `px`;
		this.el.style.height = logicalSizeInteger.height.toString() + `px`;
		this.#getContext(true);
		if (this.opts.clearOnResize) this.ctx.clearRect(0, 0, this.width, this.height);
		this.#logicalSize = logicalSizeInteger;
		const r = this.opts.onResize;
		if (r) setTimeout(() => {
			r(this.ctx, this.size, this);
		}, 100);
		this.fireEvent(`resize`, {
			ctx: this.ctx,
			size: this.#logicalSize,
			helper: this
		});
	}
	#init() {
		const d$1 = this.opts.draw;
		if (d$1) {
			const sched = () => {
				d$1(this.ctx, this.#logicalSize, this);
				requestAnimationFrame(sched);
			};
			setTimeout(() => {
				sched();
			}, 100);
		}
		if (!this.opts.disablePointerEvents) this.#handleEvents();
		const resizeLogic = this.opts.resizeLogic ?? `none`;
		if (resizeLogic === `none`) this.setLogicalSize({
			width: this.opts.width,
			height: this.opts.height
		});
		else {
			const resizerOptions = {
				onSetSize: (size) => {
					if (isEqual$2(this.#logicalSize, size)) return;
					this.setLogicalSize(size);
				},
				naturalSize: {
					width: this.opts.width,
					height: this.opts.height
				},
				stretch: this.opts.resizeLogic ?? `none`
			};
			this.#resizer = new ElementSizer(this.el, resizerOptions);
		}
		this.#getContext();
	}
	#handleEvents() {
		const handlePointerEvent = (event$1) => {
			const { offsetX, offsetY } = event$1;
			const physicalX = offsetX * this.ratio;
			const physicalY = offsetY * this.ratio;
			event$1 = cloneFromFields$1(event$1);
			const eventData = {
				physicalX,
				physicalY,
				...event$1
			};
			switch (event$1.type) {
				case `pointerup`: {
					this.fireEvent(`pointerup`, eventData);
					break;
				}
				case `pointermove`: {
					this.fireEvent(`pointermove`, eventData);
					break;
				}
				case `pointerdown`: {
					this.fireEvent(`pointerup`, eventData);
					break;
				}
			}
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
		rect(ctx, {
			x: 0,
			y: 0,
			width: this.width,
			height: this.height
		}, {
			crossed: true,
			strokeStyle,
			strokeWidth: 1
		});
		rect(ctx, this.#viewport, {
			crossed: true,
			strokeStyle: `silver`,
			strokeWidth: 3
		});
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
		return {
			x: this.width / 2,
			y: this.height / 2
		};
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
		const grid$1 = grid(data);
		const get$2 = accessor(data);
		const set$4 = setter(data);
		const flip$1 = () => {
			ctx.putImageData(data, 0, 0);
		};
		return {
			grid: grid$1,
			get: get$2,
			set: set$4,
			flip: flip$1
		};
	}
};

//#endregion
//#region packages/visual/src/svg/apply.ts
const applyOpts = (elem, opts) => {
	if (opts.fillStyle) elem.setAttributeNS(null, `fill`, opts.fillStyle);
	if (opts.opacity) elem.setAttributeNS(null, `opacity`, opts.opacity.toString());
};

//#endregion
//#region packages/visual/src/svg/create.ts
const createOrResolve = (parent, type$1, queryOrExisting, suffix) => {
	let existing = null;
	if (queryOrExisting !== void 0) existing = typeof queryOrExisting === `string` ? parent.querySelector(queryOrExisting) : queryOrExisting;
	if (existing === null) {
		const p$1 = document.createElementNS(`http://www.w3.org/2000/svg`, type$1);
		parent.append(p$1);
		if (queryOrExisting && typeof queryOrExisting === `string` && queryOrExisting.startsWith(`#`)) p$1.id = suffix !== void 0 && !queryOrExisting.endsWith(suffix) ? queryOrExisting.slice(1) + suffix : queryOrExisting.slice(1);
		return p$1;
	}
	return existing;
};

//#endregion
//#region packages/visual/src/svg/stroke.ts
const applyStrokeOpts = (elem, opts) => {
	if (opts.strokeStyle) elem.setAttributeNS(null, `stroke`, opts.strokeStyle);
	if (opts.strokeWidth) elem.setAttributeNS(null, `stroke-width`, opts.strokeWidth.toString());
	if (opts.strokeDash) elem.setAttribute(`stroke-dasharray`, opts.strokeDash);
	if (opts.strokeLineCap) elem.setAttribute(`stroke-linecap`, opts.strokeLineCap);
};

//#endregion
//#region packages/visual/src/svg/elements.ts
const circleUpdate = (elem, circle$2, opts) => {
	elem.setAttributeNS(null, `cx`, circle$2.x.toString());
	elem.setAttributeNS(null, `cy`, circle$2.y.toString());
	elem.setAttributeNS(null, `r`, circle$2.radius.toString());
	if (opts) applyOpts(elem, opts);
	if (opts) applyStrokeOpts(elem, opts);
	return elem;
};
const circle = (circle$2, parent, opts, queryOrExisting) => {
	const p$1 = createOrResolve(parent, `circle`, queryOrExisting);
	return circleUpdate(p$1, circle$2, opts);
};

//#endregion
//#region packages/visual/src/pointer-visualise.ts
const pointerVisualise = (elOrQuery, options = {}) => {
	const touchRadius = options.touchRadius ?? 45;
	const mouseRadius = options.touchRadius ?? 20;
	const trace = options.trace ?? false;
	const hue = options.hue ?? 100;
	const startFillStyle = `hsla(${hue}, 100%, 10%, 10%)`;
	let currentHue = hue;
	const el = resolveEl(elOrQuery);
	const tracker = new PointsTracker({ storeIntermediate: trace });
	const svg = document.createElementNS(`http://www.w3.org/2000/svg`, `svg`);
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
	const lostPointer = (event$1) => {
		const id = event$1.pointerId.toString();
		tracker.delete(id);
		currentHue = hue;
		svg.querySelector(`#pv-start-${id}`)?.remove();
		for (let index = 0; index < pointerCount + 10; index++) svg.querySelector(`#pv-progress-${id}-${index}`)?.remove();
		pointerCount = 0;
	};
	const trackPointer = async (event$1) => {
		const id = event$1.pointerId.toString();
		const pt = {
			x: event$1.x,
			y: event$1.y
		};
		const type$1 = event$1.pointerType;
		if (event$1.type === `pointermove` && !tracker.has(id)) return;
		const info = await tracker.seen(event$1.pointerId.toString(), {
			x: event$1.clientX,
			y: event$1.clientY
		});
		if (info.values.length === 1) {
			const el$1 = circle({
				...info.values[0],
				radius: type$1 === `touch` ? touchRadius : mouseRadius
			}, svg, { fillStyle: startFillStyle }, `#pv-start-${id}`);
			el$1.style.pointerEvents = `none`;
			el$1.style.touchAction = `none`;
		}
		const fillStyle = `hsla(${currentHue}, 100%, 50%, 50%)`;
		const el2 = circle({
			...pt,
			radius: type$1 === `touch` ? touchRadius : mouseRadius
		}, svg, { fillStyle }, `#pv-progress-${id}-${info.values.length}`);
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
	el.addEventListener(`contextmenu`, (event$1) => {
		event$1.preventDefault();
	});
};

//#endregion
//#region packages/flow/src/delay.ts
/**
* Iterate over a source iterable with some delay between results.
* Delay can be before, after or both before and after each result from the
* source iterable.
*
* Since it's an async iterable, `for await ... of` is needed.
*
* ```js
* const opts = { intervalMs: 1000, delay: 'before' };
* const iterable = count(10);
* for await (const i of delayIterable(iterable, opts)) {
*  // Prints 0..9 with one second between
* }
* ```
*
* Use {@link delay} to return a result after some delay
*
* @param iter
* @param opts
*/
/**
* Async generator that loops via `requestAnimationFrame`.
*
* We can use `for await of` to run code:
* ```js
* const loop = delayAnimationLoop();
* for await (const o of loop) {
*  // Do something...
*  // Warning: loops forever
* }
* // Warning: execution doesn't continue to this point
* // unless there is a 'break' in loop.
* ```
* 
* Or use the generator in manually:
* ```js
* // Loop forever
* (async () => {
*  const loop = delayAnimationLoop();
*  while (true) {
*    await loop.next();
*
*    // Do something...
*    // Warning: loops forever
*  }
* })();
* ```
* 
* Practically, these approaches are not so useful
* because execution blocks until the loop finishes.
* 
* Instead, we might want to continually loop a bit
* of code while other bits of code continue to run.
* 
* The below example shows how to do this.
* 
* ```js
* setTimeout(async () => {
*  for await (const _ of delayAnimationLoop()) {
*    // Do soething at animation speed
*  }
* });
* 
* // Execution continues while loop also runs
* ```
*
*/
async function* delayAnimationLoop() {
	let resolve$1;
	let p$1 = new Promise((r) => resolve$1 = r);
	let timer = 0;
	const callback = () => {
		if (resolve$1) resolve$1();
		p$1 = new Promise((r) => resolve$1 = r);
	};
	try {
		while (true) {
			timer = globalThis.requestAnimationFrame(callback);
			const _ = await p$1;
			yield _;
		}
	} finally {
		if (resolve$1) resolve$1();
		globalThis.cancelAnimationFrame(timer);
	}
}
async function* delayLoop(timeout$1) {
	const timeoutMs = intervalToMs(timeout$1);
	if (typeof timeoutMs === `undefined`) throw new Error(`timeout is undefined`);
	if (timeoutMs < 0) throw new Error(`Timeout is less than zero`);
	if (timeoutMs === 0) return yield* delayAnimationLoop();
	let resolve$1;
	let p$1 = new Promise((r) => resolve$1 = r);
	let timer;
	const callback = () => {
		if (resolve$1) resolve$1();
		p$1 = new Promise((r) => resolve$1 = r);
	};
	try {
		while (true) {
			timer = globalThis.setTimeout(callback, timeoutMs);
			const _ = await p$1;
			yield _;
		}
	} finally {
		if (resolve$1) resolve$1();
		if (timer !== void 0) globalThis.clearTimeout(timer);
		timer = void 0;
	}
}

//#endregion
//#region packages/flow/src/dispatch-list.ts
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
		const wrap$6 = {
			id: `${this.#id} - ${this.#counter}`,
			handler,
			once
		};
		this.#handlers.push(wrap$6);
		return wrap$6.id;
	}
	remove(id) {
		const length$4 = this.#handlers.length;
		this.#handlers = this.#handlers.filter((handler) => handler.id !== id);
		return this.#handlers.length !== length$4;
	}
	notify(value) {
		for (const handler of this.#handlers) {
			handler.handler(value);
			if (handler.once) this.remove(handler.id);
		}
	}
	clear() {
		this.#handlers = [];
	}
};

//#endregion
//#region packages/flow/src/timeout.ts
const timeout = (callback, interval) => {
	if (callback === void 0) throw new Error(`callback parameter is undefined`);
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
		const p$1 = new Promise((resolve$1, reject) => {
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
				case `running`: break;
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
				resolve$1();
			}, altTimeoutMs);
		});
		return p$1;
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

//#endregion
//#region packages/flow/src/repeat.ts
async function* repeat(produce, opts) {
	const signal = opts.signal ?? void 0;
	const delayWhen = opts.delayWhen ?? `before`;
	const count$2 = opts.count ?? void 0;
	const allowUndefined = opts.allowUndefined ?? false;
	const minIntervalMs = opts.delayMinimum ? intervalToMs(opts.delayMinimum) : void 0;
	const whileFunction = opts.while;
	let cancelled = false;
	let sleepMs = intervalToMs(opts.delay, intervalToMs(opts.delayMinimum, 0));
	let started = performance.now();
	const doDelay = async () => {
		const elapsed$2 = performance.now() - started;
		if (typeof minIntervalMs !== `undefined`) sleepMs = Math.max(0, minIntervalMs - elapsed$2);
		if (sleepMs) await sleep({
			millis: sleepMs,
			signal
		});
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
			if (typeof result === `undefined` && !allowUndefined) cancelled = true;
			else {
				yield result;
				if (delayWhen === `after` || delayWhen === `both`) await doDelay();
				if (count$2 !== void 0 && loopedTimes >= count$2) cancelled = true;
			}
			if (whileFunction) {
				if (!whileFunction(loopedTimes)) cancelled = true;
			}
		}
		errored = false;
	} finally {
		cancelled = true;
		if (opts.onComplete) opts.onComplete(errored);
	}
}
/**
* Logic for continuing repeats
*/
/**
* Calls and waits for the async function `fn` repeatedly, yielding each result asynchronously.
* Use {@link repeat} if `fn` does not need to be awaited.
*
* ```js
* // Eg. iterate
* const r = Flow.repeat(5, async () => Math.random());
* for await (const v of r) {
*
* }
* // Eg read into array
* const results = await Array.fromAsync(Flow.repeatAwait(5, async () => Math.random()));
* ```
*
* The number of repeats is determined by the first parameter. If it's a:
* - number: how many times to repeat
* - function: it gets called before each repeat, if it returns _false_ repeating stops.
*
* Using a fixed number of repeats:
* ```js
* // Calls - and waits - for Flow.sleep(1) 5 times
* await Flow.repeatAwait(5, async () => {
*    // some kind of async function where we can use await
*    // eg. sleep for 1s
*    await Flow.sleep(1);
* });
* ```
*
* Using a function to dynamically determine number of repeats. The function gets
* passed the number of repeats so far as well as the number of values produced. This
* is count of non-undefined results from `cb` that is being repeated.
*
* ```js
* async function task() {
*  // do something
* }
*
* await Flow.repeatAwait(
*  (repeats, valuesProduced) => {
*    // Logic for deciding whether to repeat or not
*    if (repeats > 5) return false; // Stop repeating
*  },
*  task
* );
* ```
*
* In the above cases we're not using the return value from `fn`. This would look like:
* ```js
* const g = Flow.repeatAwait(5, async () => Math.random);
* for await (const v of g) {
*  // Loops 5 times, v is the return value of calling `fn` (Math.random)
* }
* ```
* @param countOrPredicate Number of times to repeat, or a function that returns _false_ to stop the loop.
* @param fn Function to execute. Asynchronous functions will be awited
* @typeParam V - Return type of repeating function
* @returns Asynchronous generator of `fn` results.
*/
/**
* Calls `fn` repeatedly, yielding each result.
* Use {@link repeatAwait} if `fn` is asynchronous and you want to wait for it.
*
* The number of repeats is determined by the first parameter. If it's a:
* - number: how many times to repeat
* - function: it gets called before each repeat, if it returns _false_ repeating stops.
*
* Example: using a fixed number of repeats
* ```js
* // Results will be an array with five random numbers
* const results = [...repeat(5, () => Math.random())];
*
* // Or as an generator (note also the simpler expression form)
* for (const result of repeat(5, Math.random)) {
* }
* ```
*
* Example: Using a function to dynamically determine number of repeats
* ```js
* function task() {
* }
*
* Flow.repeat(
*  (repeats, valuesProduced) => {
*    if (repeats > 5) return false; // Stop repeating
*  },
*  task
* );
* ```
*
* In the above cases we're not using the return value from `fn`. To do so,
* this would look like:
* ```js
* const g = Flow.repeat(5, () => Math.random);
* for (const v of g) {
*  // Loops 5 times, v is the return value of calling `fn` (Math.random)
* }
* ```
*
* Alternatives:
* * {@link Flow.forEach | Flow.forEach} - if you don't need return values
* * {@link Flow.interval} - if you want to repeatedly call something with an interval between
* @param countOrPredicate Numnber of repeats, or a function that returns _false_ for when to stop.
* @param fn Function to execute. Asynchronous functions will be awited
* @typeParam V - Return type of repeating function
* @returns Asynchronous generator of `fn` results.
*/
/**
* Calls `fn` until `predicate` returns _false_. Awaits result of `fn` each time.
* Yields result of `fn` asynchronously
* @param predicate
* @param fn
* @typeParam V - Return type of repeating function
*/
/**
* Calls `fn` until `predicate` returns _false_. Yields result of `fn`.
* @param predicate Determiner for whether repeating continues
* @param fn Function to call
* @typeParam V - Return type of repeating function
*/
/**
* Calls `fn`, `count` number of times, waiting for the result of `fn`.
* Yields result of `fn` asynchronously
* @param count Number of times to run
* @param fn Function to run
* @typeParam V - Return type of repeating function
*/
/**
* Calls `fn`, `count` times. Assumes a synchronous function. Yields result of `fn`.
*
* Note that if `fn` returns _undefined_ repeats will stop.
* @typeParam V - Return type of repeating function
* @param count Number of times to run
* @param fn Function to run
*/
/**
* Repeatedly calls `fn`, reducing via `reduce`.
*
* ```js
* repeatReduce(10, () => 1, (acc, v) => acc + v);
* // Yields: 10
*
* // Multiplies random values against each other 10 times
* repeatReduce(10, Math.random, (acc, v) => acc * v);
* // Yields a single number
* ```
* @param countOrPredicate Number of times to run, or function to keep running
* @param fn Function to call
* @param initial Initial value
* @param reduce Function to reduce value
* @typeParam V - Return type of repeating function
* @returns Final result
*/

//#endregion
//#region packages/iterables/src/guard.ts
const isAsyncIterable = (v) => {
	if (typeof v !== `object`) return false;
	if (v === null) return false;
	return Symbol.asyncIterator in v;
};
const isIterable = (v) => {
	if (typeof v !== `object`) return false;
	if (v === null) return false;
	return Symbol.iterator in v;
};

//#endregion
//#region packages/collections/src/queue/queue-fns.ts
const trimQueue = (opts, queue, toAdd) => {
	const potentialLength = queue.length + toAdd.length;
	const capacity = opts.capacity ?? potentialLength;
	const toRemove = potentialLength - capacity;
	const policy = opts.discardPolicy ?? `additions`;
	switch (policy) {
		case `additions`: {
			if (queue.length === 0) return toAdd.slice(0, toAdd.length - toRemove);
			if (queue.length === opts.capacity) return queue;
			else return [...queue, ...toAdd.slice(0, toRemove - 1)];
		}
		case `newer`: if (toRemove >= queue.length) {
			if (queue.length === 0) return [...toAdd.slice(0, capacity - 1), toAdd.at(-1)];
			return toAdd.slice(Math.max(0, toAdd.length - capacity), Math.min(toAdd.length, capacity) + 1);
		} else {
			const countToAdd = Math.max(1, toAdd.length - queue.length);
			const toAddFinal = toAdd.slice(toAdd.length - countToAdd, toAdd.length);
			const toKeep = queue.slice(0, Math.min(queue.length, capacity - 1));
			const t$1 = [...toKeep, ...toAddFinal];
			return t$1;
		}
		case `older`: return [...queue, ...toAdd].slice(toRemove);
		default: throw new Error(`Unknown overflow policy ${policy}`);
	}
};
const enqueue = (opts, queue, ...toAdd) => {
	if (opts === void 0) throw new Error(`opts parameter undefined`);
	const potentialLength = queue.length + toAdd.length;
	const overSize = opts.capacity && potentialLength > opts.capacity;
	const toReturn = overSize ? trimQueue(opts, queue, toAdd) : [...queue, ...toAdd];
	if (opts.capacity && toReturn.length !== opts.capacity && overSize) throw new Error(`Bug! Expected return to be at capacity. Return len: ${toReturn.length} capacity: ${opts.capacity} opts: ${JSON.stringify(opts)}`);
	if (!opts.capacity && toReturn.length !== potentialLength) throw new Error(`Bug! Return length not expected. Return len: ${toReturn.length} expected: ${potentialLength} opts: ${JSON.stringify(opts)}`);
	return toReturn;
};
const dequeue = (opts, queue) => {
	if (queue.length === 0) throw new Error(`Queue is empty`);
	return queue.slice(1);
};
const peek = (opts, queue) => queue[0];
const isEmpty = (opts, queue) => queue.length === 0;
const isFull = (opts, queue) => {
	if (opts.capacity) return queue.length >= opts.capacity;
	return false;
};

//#endregion
//#region packages/collections/src/queue/queue-mutable.ts
var QueueMutable = class extends SimpleEventEmitter {
	options;
	data;
	eq;
	constructor(opts = {}, data = []) {
		super();
		if (opts === void 0) throw new Error(`opts parameter undefined`);
		this.options = opts;
		this.data = data;
		this.eq = opts.eq ?? isEqualDefault;
	}
	clear() {
		const copy = [...this.data];
		this.data = [];
		this.fireEvent(`removed`, {
			finalData: this.data,
			removed: copy
		});
		this.onClear();
	}
	/**
	* Called when all data is cleared
	*/
	onClear() {}
	at(index) {
		if (index >= this.data.length) throw new Error(`Index outside bounds of queue`);
		const v = this.data.at(index);
		if (v === void 0) throw new Error(`Index appears to be outside range of queue`);
		return v;
	}
	enqueue(...toAdd) {
		this.data = enqueue(this.options, this.data, ...toAdd);
		const length$4 = this.data.length;
		this.onEnqueue(this.data, toAdd);
		return length$4;
	}
	onEnqueue(result, attemptedToAdd) {
		this.fireEvent(`enqueue`, {
			added: attemptedToAdd,
			finalData: result
		});
	}
	dequeue() {
		const v = peek(this.options, this.data);
		if (v === void 0) return;
		this.data = dequeue(this.options, this.data);
		this.fireEvent(`dequeue`, {
			removed: v,
			finalData: this.data
		});
		this.onRemoved([v], this.data);
		return v;
	}
	onRemoved(removed, finalData) {
		this.fireEvent(`removed`, {
			removed,
			finalData
		});
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
		return isEmpty(this.options, this.data);
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

//#endregion
//#region packages/iterables/src/async.ts
async function nextWithTimeout(it, options) {
	const ms = intervalToMs(options, 1e3);
	const value = await Promise.race([(async () => {
		await sleep({
			millis: ms,
			signal: options.signal
		});
		return void 0;
	})(), (async () => {
		return await it.next();
	})()]);
	if (value === void 0) throw new Error(`Timeout`);
	return value;
}

//#endregion
//#region packages/collections/src/map/map-immutable-fns.ts
/**
* Adds an array o [k,v] to the map, returning a new instance
* @param map Initial data
* @param data Data to add
* @returns New map with data added
*/
const addArray = (map, data) => {
	const x = new Map(map.entries());
	for (const d$1 of data) {
		if (d$1[0] === void 0) throw new Error(`key cannot be undefined`);
		if (d$1[1] === void 0) throw new Error(`value cannot be undefined`);
		x.set(d$1[0], d$1[1]);
	}
	return x;
};
/**
* Adds objects to the map, returning a new instance
* @param map Initial data
* @param data Data to add
* @returns A new map with data added
*/
const addObjects = (map, data) => {
	const x = new Map(map.entries());
	for (const d$1 of data) {
		if (d$1.key === void 0) throw new Error(`key cannot be undefined`);
		if (d$1.value === void 0) throw new Error(`value cannot be undefined`);
		x.set(d$1.key, d$1.value);
	}
	return x;
};
const add = (map, ...data) => {
	if (map === void 0) throw new Error(`map parameter is undefined`);
	if (data === void 0) throw new Error(`data parameter i.s undefined`);
	if (data.length === 0) return map;
	const firstRecord = data[0];
	const isObject = typeof firstRecord.key !== `undefined` && typeof firstRecord.value !== `undefined`;
	return isObject ? addObjects(map, data) : addArray(map, data);
};
const set = (map, key, value) => {
	const x = new Map(map.entries());
	x.set(key, value);
	return x;
};
const del = (map, key) => {
	const x = new Map(map.entries());
	x.delete(key);
	return x;
};

//#endregion
//#region packages/collections/src/map/map.ts
const immutable = (dataOrMap) => {
	if (dataOrMap === void 0) return immutable([]);
	if (Array.isArray(dataOrMap)) return immutable(add(new Map(), ...dataOrMap));
	const data = dataOrMap;
	return {
		add: (...itemsToAdd) => {
			const s = add(data, ...itemsToAdd);
			return immutable(s);
		},
		set: (key, value) => {
			const s = set(data, key, value);
			return immutable(s);
		},
		get: (key) => data.get(key),
		delete: (key) => immutable(del(data, key)),
		clear: () => immutable(),
		has: (key) => data.has(key),
		entries: () => data.entries(),
		values: () => data.values(),
		isEmpty: () => data.size === 0
	};
};

//#endregion
//#region packages/collections/src/graph/directed-graph.ts
const createVertex = (id) => {
	return {
		id,
		out: []
	};
};
function testGraph(g$1, paramName = `graph`) {
	if (g$1 === void 0) return [false, `Param '${paramName}' is undefined. Expected Graph`];
	if (g$1 === null) return [false, `Param '${paramName}' is null. Expected Graph`];
	if (typeof g$1 === `object`) {
		if (!(`vertices` in g$1)) return [false, `Param '${paramName}.vertices' does not exist. Is it a Graph type?`];
	} else return [false, `Param '${paramName} is type '${typeof g$1}'. Expected an object Graph`];
	return [true];
}
function throwGraphTest(g$1, paramName = `graph`) {
	const r = testGraph(g$1, paramName);
	if (r[0]) return;
	throw new Error(r[1]);
}
const hasOut = (graph$1, vertex, outIdOrVertex) => {
	throwGraphTest(graph$1);
	const context = resolveVertex(graph$1, vertex);
	const outId = typeof outIdOrVertex === `string` ? outIdOrVertex : outIdOrVertex.id;
	return context.out.some((edge) => edge.id === outId);
};
const getOrCreate = (graph$1, id) => {
	throwGraphTest(graph$1);
	const v = graph$1.vertices.get(id);
	if (v !== void 0) return {
		graph: graph$1,
		vertex: v
	};
	const vv = createVertex(id);
	const gg = updateGraphVertex(graph$1, vv);
	return {
		graph: gg,
		vertex: vv
	};
};
const updateGraphVertex = (graph$1, vertex) => {
	throwGraphTest(graph$1);
	const gr = {
		...graph$1,
		vertices: graph$1.vertices.set(vertex.id, vertex)
	};
	return gr;
};
function connectTo(graph$1, from$1, to$3, weight$1) {
	throwGraphTest(graph$1);
	const fromResult = getOrCreate(graph$1, from$1);
	graph$1 = fromResult.graph;
	const toResult = getOrCreate(graph$1, to$3);
	graph$1 = toResult.graph;
	const edge = {
		id: to$3,
		weight: weight$1
	};
	if (!hasOut(graph$1, fromResult.vertex, toResult.vertex)) graph$1 = updateGraphVertex(graph$1, {
		...fromResult.vertex,
		out: [...fromResult.vertex.out, edge]
	});
	return {
		graph: graph$1,
		edge
	};
}
function connect(graph$1, options) {
	if (typeof graph$1 !== `object`) throw new TypeError(`Param 'graph' is expected to be a DirectedGraph object. Got: ${typeof graph$1}`);
	if (typeof options !== `object`) throw new TypeError(`Param 'options' is expected to be ConnectOptions object. Got: ${typeof options}`);
	const result = connectWithEdges(graph$1, options);
	return result.graph;
}
function connectWithEdges(graph$1, options) {
	throwGraphTest(graph$1);
	const { to: to$3, weight: weight$1, from: from$1 } = options;
	const bidi = options.bidi ?? false;
	const toList = Array.isArray(to$3) ? to$3 : [to$3];
	let edges$2 = [];
	for (const toSingle of toList) {
		const result = connectTo(graph$1, from$1, toSingle, weight$1);
		graph$1 = result.graph;
		edges$2.push(result.edge);
	}
	if (!bidi) return {
		graph: graph$1,
		edges: edges$2
	};
	for (const toSingle of toList) {
		const result = connectTo(graph$1, toSingle, from$1, weight$1);
		graph$1 = result.graph;
		edges$2.push(result.edge);
	}
	return {
		graph: graph$1,
		edges: edges$2
	};
}
/**
* Resolves the id or vertex into a Vertex.
* throws an error if vertex is not found
* @param graph 
* @param idOrVertex 
* @returns 
*/
function resolveVertex(graph$1, idOrVertex) {
	throwGraphTest(graph$1);
	if (idOrVertex === void 0) throw new Error(`Param 'idOrVertex' is undefined. Expected string or Vertex`);
	const v = typeof idOrVertex === `string` ? graph$1.vertices.get(idOrVertex) : idOrVertex;
	if (v === void 0) throw new Error(`Id not found ${idOrVertex}`);
	return v;
}
const graph = (...initialConnections) => {
	let g$1 = { vertices: immutable() };
	for (const ic of initialConnections) g$1 = connect(g$1, ic);
	return g$1;
};

//#endregion
//#region packages/flow/src/timer.ts
function ofTotal(duration, opts = {}) {
	const totalMs = intervalToMs(duration);
	if (!totalMs) throw new Error(`Param 'duration' not valid`);
	const timerOpts = {
		...opts,
		timer: elapsedMillisecondsAbsolute()
	};
	let t$1;
	return () => {
		t$1 ??= relative(totalMs, timerOpts);
		return t$1.elapsed;
	};
}
function ofTotalTicks(totalTicks, opts = {}) {
	const timerOpts = {
		...opts,
		timer: elapsedTicksAbsolute()
	};
	let t$1;
	return () => {
		t$1 ??= relative(totalTicks, timerOpts);
		return t$1.elapsed;
	};
}
const timerAlwaysDone = () => ({
	elapsed: 1,
	isDone: true,
	reset() {},
	mod(amt) {}
});
const timerNeverDone = () => ({
	elapsed: 0,
	isDone: false,
	reset() {},
	mod() {}
});
const relative = (total$1, options = {}) => {
	if (!Number.isFinite(total$1)) return timerAlwaysDone();
	else if (Number.isNaN(total$1)) return timerNeverDone();
	const clampValue = options.clampValue ?? false;
	const wrapValue = options.wrapValue ?? false;
	if (clampValue && wrapValue) throw new Error(`clampValue and wrapValue cannot both be enabled`);
	let modulationAmount = 1;
	const timer = options.timer ?? elapsedMillisecondsAbsolute();
	let lastValue = 0;
	const computeElapsed = (value) => {
		lastValue = value;
		let v = value / (total$1 * modulationAmount);
		if (clampValue) v = clamp$3(v);
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
const frequencyTimer = (frequency, options = {}) => {
	const timer = options.timer ?? elapsedMillisecondsAbsolute();
	const cyclesPerSecond = frequency / 1e3;
	let modulationAmount = 1;
	const computeElapsed = () => {
		const v = timer.elapsed * (cyclesPerSecond * modulationAmount);
		const f = v - Math.floor(v);
		if (f < 0) throw new Error(`Unexpected cycle fraction less than 0. Elapsed: ${v} f: ${f}`);
		if (f > 1) throw new Error(`Unexpected cycle fraction more than 1. Elapsed: ${v} f: ${f}`);
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
const elapsedMillisecondsAbsolute = () => {
	let start = performance.now();
	return {
		reset: () => {
			start = performance.now();
		},
		get elapsed() {
			return performance.now() - start;
		}
	};
};
const elapsedTicksAbsolute = () => {
	let start = 0;
	return {
		reset: () => {
			start = 0;
		},
		get peek() {
			return start;
		},
		get elapsed() {
			return ++start;
		}
	};
};
const timerWithFunction = (fn, timer) => {
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
		get startCount() {
			return startCount;
		},
		get startCountTotal() {
			return startCount;
		},
		compute: () => {
			const elapsed$2 = timer.elapsed;
			return fn(elapsed$2);
		},
		reset: () => {
			timer.reset();
			startCount++;
		}
	};
};

//#endregion
//#region packages/visual/src/video.ts
var video_exports = {};
__export(video_exports, {
	capture: () => capture,
	frames: () => frames,
	manualCapture: () => manualCapture
});
async function* frames(sourceVideoEl, opts = {}) {
	const maxIntervalMs = opts.maxIntervalMs ?? 0;
	const showCanvas = opts.showCanvas ?? false;
	let canvasEl = opts.canvasEl;
	let w, h;
	w = h = 0;
	if (canvasEl === void 0) {
		canvasEl = document.createElement(`CANVAS`);
		canvasEl.classList.add(`ixfx-frames`);
		if (!showCanvas) canvasEl.style.display = `none`;
		document.body.appendChild(canvasEl);
	}
	const updateSize = () => {
		if (canvasEl === void 0) return;
		w = sourceVideoEl.videoWidth;
		h = sourceVideoEl.videoHeight;
		canvasEl.width = w;
		canvasEl.height = h;
	};
	let c$1 = null;
	const looper = delayLoop(maxIntervalMs);
	for await (const _ of looper) {
		if (w === 0 || h === 0) updateSize();
		if (w === 0 || h === 0) continue;
		if (c$1 === null) c$1 = canvasEl.getContext(`2d`);
		if (c$1 === null) return;
		c$1.drawImage(sourceVideoEl, 0, 0, w, h);
		const pixels = c$1.getImageData(0, 0, w, h);
		yield pixels;
	}
}
const capture = (sourceVideoEl, opts = {}) => {
	const maxIntervalMs = opts.maxIntervalMs ?? 0;
	const showCanvas = opts.showCanvas ?? false;
	const onFrame = opts.onFrame;
	const w = sourceVideoEl.videoWidth;
	const h = sourceVideoEl.videoHeight;
	const canvasEl = document.createElement(`CANVAS`);
	canvasEl.classList.add(`ixfx-capture`);
	if (!showCanvas) canvasEl.style.display = `none`;
	canvasEl.width = w;
	canvasEl.height = h;
	let c$1 = null;
	let worker;
	if (opts.workerScript) worker = new Worker(opts.workerScript);
	const getPixels = worker || onFrame;
	if (!getPixels && !showCanvas) console.warn(`Video will be captured to hidden element without any processing. Is this what you want?`);
	const loop = continuously(() => {
		if (c$1 === null) c$1 = canvasEl.getContext(`2d`);
		if (c$1 === null) return;
		c$1.drawImage(sourceVideoEl, 0, 0, w, h);
		let pixels;
		if (getPixels) pixels = c$1.getImageData(0, 0, w, h);
		if (worker) worker.postMessage({
			pixels: pixels.data.buffer,
			width: w,
			height: h,
			channels: 4
		}, [pixels.data.buffer]);
		if (onFrame) try {
			onFrame(pixels);
		} catch (e) {
			console.error(e);
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
const manualCapture = (sourceVideoEl, opts = {}) => {
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
	const capture$1 = () => {
		let c$2;
		if (!c$2) c$2 = canvasEl.getContext(`2d`, { willReadFrequently: true });
		if (!c$2) throw new Error(`Could not create graphics context`);
		c$2.drawImage(sourceVideoEl, 0, 0, w, h);
		const pixels = c$2.getImageData(0, 0, w, h);
		pixels.currentTime = sourceVideoEl.currentTime;
		if (opts.postCaptureDraw) opts.postCaptureDraw(c$2, w, h);
		return pixels;
	};
	const dispose = () => {
		if (definedCanvasEl) return;
		try {
			canvasEl.remove();
		} catch (_) {}
	};
	const c$1 = {
		canvasEl,
		capture: capture$1,
		dispose
	};
	return c$1;
};

//#endregion
//#region packages/ixfx/src/visual.ts
var visual_exports = {};
__export(visual_exports, {
	CanvasHelper: () => CanvasHelper,
	Colour: () => colour_exports,
	ImageDataGrid: () => image_data_grid_exports,
	Video: () => video_exports,
	pointerVisualise: () => pointerVisualise
});

//#endregion
//#region packages/ixfx/src/geometry.ts
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
	scaler: () => scaler
});

//#endregion
//#region packages/modulation/src/envelope/Types.ts
const adsrStateTransitions = Object.freeze({
	attack: [`decay`, `release`],
	decay: [`sustain`, `release`],
	sustain: [`release`],
	release: [`complete`],
	complete: null
});

//#endregion
//#region packages/flow/src/state-machine/state-machine.ts
const cloneState = (toClone) => {
	return Object.freeze({
		value: toClone.value,
		visited: [...toClone.visited],
		machine: toClone.machine
	});
};
const init = (stateMachine, initialState) => {
	const [machine, machineValidationError] = validateMachine(stateMachine);
	if (!machine) throw new Error(machineValidationError);
	const state = initialState ?? Object.keys(machine.states)[0];
	if (typeof machine.states[state] === `undefined`) throw new TypeError(`Initial state ('${state}') not found`);
	const transitions = validateAndNormaliseTransitions(machine.states);
	if (transitions === void 0) throw new Error(`Could not normalise transitions`);
	return Object.freeze({
		value: state,
		visited: [],
		machine: Object.freeze(Object.fromEntries(transitions))
	});
};
const validateMachine = (smOrTransitions) => {
	if (typeof smOrTransitions === `undefined`) return [void 0, `Parameter undefined`];
	if (smOrTransitions === null) return [void 0, `Parameter null`];
	if (`states` in smOrTransitions) return [smOrTransitions, ``];
	if (typeof smOrTransitions === `object`) return [{ states: smOrTransitions }, ``];
	return [void 0, `Unexpected type: ${typeof smOrTransitions}. Expected object`];
};
const isDone = (sm) => {
	return possible(sm).length === 0;
};
const possibleTargets = (sm) => {
	validateMachineState(sm);
	const fromS = sm.machine[sm.value];
	if (fromS.length === 1 && fromS[0].state === null) return [];
	return fromS;
};
const possible = (sm) => {
	const targets = possibleTargets(sm);
	return targets.map((v) => v.state);
};
const normaliseTargets = (targets) => {
	const normaliseSingleTarget = (target) => {
		if (target === null) return { state: null };
		if (typeof target === `string`) return { state: target };
		else if (typeof target === `object` && `state` in target) {
			const targetState = target.state;
			if (typeof targetState !== `string`) throw new TypeError(`Target 'state' field is not a string. Got: ${typeof targetState}`);
			if (`preconditions` in target) return {
				state: targetState,
				preconditions: target.preconditions
			};
			return { state: targetState };
		} else throw new Error(`Unexpected type: ${typeof target}. Expected string or object with 'state' field.`);
	};
	if (Array.isArray(targets)) {
		let containsNull = false;
		const mapResults = targets.map((t$1) => {
			const r = normaliseSingleTarget(t$1);
			if (!r) throw new Error(`Invalid target`);
			containsNull = containsNull || r.state === null;
			return r;
		});
		if (containsNull && mapResults.length > 1) throw new Error(`Cannot have null as an possible state`);
		return mapResults;
	} else {
		const target = normaliseSingleTarget(targets);
		if (!target) return;
		return [target];
	}
};
const validateAndNormaliseTransitions = (d$1) => {
	const returnMap = new Map();
	for (const [topLevelState, topLevelTargets] of Object.entries(d$1)) {
		if (typeof topLevelState === `undefined`) throw new TypeError(`Top-level undefined state`);
		if (typeof topLevelTargets === `undefined`) throw new TypeError(`Undefined target state for ${topLevelState}`);
		if (returnMap.has(topLevelState)) throw new Error(`State defined twice: ${topLevelState}`);
		if (topLevelState.includes(` `)) throw new Error(`State names cannot contain spaces`);
		returnMap.set(topLevelState, []);
	}
	for (const [topLevelState, topLevelTargets] of Object.entries(d$1)) {
		const targets = normaliseTargets(topLevelTargets);
		if (targets === void 0) throw new Error(`Could not normalise target`);
		if (targets !== null) {
			const seenStates = new Set();
			for (const target of targets) {
				if (seenStates.has(target.state)) throw new Error(
					// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
					`Target state '${target.state}' already exists for '${topLevelState}'`
);
				seenStates.add(target.state);
				if (target.state === null) continue;
				if (!returnMap.has(target.state)) throw new Error(`Target state '${target.state}' is not defined as a top-level state. Defined under: '${topLevelState}'`);
			}
			returnMap.set(topLevelState, targets);
		}
	}
	return returnMap;
};
/**
* Validates machine state, throwing an exception if not valid
* and returning `StateTargetStrict`
* @param state
* @returns
*/
const validateMachineState = (state) => {
	if (typeof state === `undefined`) throw new TypeError(`Param 'state' is undefined`);
	if (typeof state.value !== `string`) throw new TypeError(`Existing state is not a string`);
};
const to$1 = (sm, toState) => {
	validateMachineState(sm);
	validateTransition(sm, toState);
	return Object.freeze({
		value: toState,
		machine: sm.machine,
		visited: unique$1([sm.visited, [sm.value]])
	});
};
const isValidTransition = (sm, toState) => {
	try {
		validateTransition(sm, toState);
		return true;
	} catch {
		return false;
	}
};
const validateTransition = (sm, toState) => {
	if (toState === null) throw new Error(`Cannot transition to null state`);
	if (typeof toState === `undefined`) throw new Error(`Cannot transition to undefined state`);
	if (typeof toState !== `string`) throw new TypeError(`Parameter 'toState' should be a string. Got: ${typeof toState}`);
	const p$1 = possible(sm);
	if (p$1.length === 0) throw new Error(`Machine is in terminal state`);
	if (!p$1.includes(toState)) throw new Error(`Target state '${toState}' not available at current state '${sm.value}'. Possible states: ${p$1.join(`, `)}`);
};

//#endregion
//#region packages/flow/src/state-machine/with-events.ts
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
	constructor(m$1, opts = {}) {
		super();
		this.#debug = opts.debug ?? false;
		this.#sm = init(m$1, opts.initial);
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
		} else this.#isDoneNeedsFiring = false;
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
		const p$1 = possible(this.#sm);
		if (p$1.length === 0) return null;
		this.state = p$1[0];
		return p$1[0];
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
		this.#sm = to$1(this.#sm, newState);
		if (this.#debug) console.log(`StateMachine: ${priorState} -> ${newState}`);
		this.#changedAt = elapsedSince();
		setTimeout(() => {
			this.fireEvent(`change`, {
				newState,
				priorState
			});
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

//#endregion
//#region packages/modulation/src/envelope/AdsrBase.ts
const defaultAdsrTimingOpts = Object.freeze({
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
		this.#sm = new StateMachineWithEvents(adsrStateTransitions, { initial: `attack` });
		this.#sm.addEventListener(`change`, (event$1) => {
			if (event$1.newState === `release` && this.#holdingInitial) this.#timer?.reset();
			super.fireEvent(`change`, event$1);
		});
		this.#sm.addEventListener(`stop`, (event$1) => {
			super.fireEvent(`complete`, event$1);
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
		let elapsed$2 = this.#timer.elapsed;
		const wasHeld = this.#holdingInitial && !this.#holding;
		let hasChanged = false;
		let state = this.#sm.state;
		do {
			hasChanged = false;
			state = this.#sm.state;
			switch (state) {
				case `attack`: {
					if (elapsed$2 > this.attackDuration || wasHeld) {
						this.#sm.next();
						hasChanged = true;
					}
					break;
				}
				case `decay`: {
					if (elapsed$2 > this.decayDurationTotal || wasHeld) {
						this.#sm.next();
						hasChanged = true;
					}
					break;
				}
				case `sustain`: {
					if (!this.#holding || wasHeld) {
						elapsed$2 = 0;
						this.#sm.next();
						this.#timer.reset();
						hasChanged = true;
					}
					break;
				}
				case `release`: {
					if (elapsed$2 > this.releaseDuration) {
						this.#sm.next();
						hasChanged = true;
					}
					break;
				}
				case `complete`: if (this.shouldLoop && allowLooping) this.trigger(this.#holdingInitial);
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
		if (this.#timer === void 0) return [
			void 0,
			0,
			this.#sm.state
		];
		if (allowStateChange) this.switchStateIfNeeded(allowLooping);
		const previousStage = this.#sm.state;
		const elapsed$2 = this.#timer.elapsed;
		let relative$1 = 0;
		const state = this.#sm.state;
		switch (state) {
			case `attack`: {
				relative$1 = elapsed$2 / this.attackDuration;
				break;
			}
			case `decay`: {
				relative$1 = (elapsed$2 - this.attackDuration) / this.decayDuration;
				break;
			}
			case `sustain`: {
				relative$1 = 1;
				break;
			}
			case `release`: {
				relative$1 = Math.min(elapsed$2 / this.releaseDuration, 1);
				break;
			}
			case `complete`: return [
				`complete`,
				1,
				previousStage
			];
			default: throw new Error(`State machine in unknown state: ${state}`);
		}
		return [
			state,
			relative$1,
			previousStage
		];
	}
	/**
	* Returns _true_ if envelope has finished
	*/
	get isDone() {
		return this.#sm.isDone;
	}
	onTrigger() {}
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
	compute() {}
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

//#endregion
//#region packages/modulation/src/envelope/Adsr.ts
const defaultAdsrOpts = Object.freeze({
	attackBend: -1,
	decayBend: -.3,
	releaseBend: -.3,
	peakLevel: 1,
	initialLevel: 0,
	sustainLevel: .6,
	releaseLevel: 0,
	retrigger: false
});
var AdsrIterator = class {
	constructor(adsr$1) {
		this.adsr = adsr$1;
	}
	next(...args) {
		if (!this.adsr.hasTriggered) this.adsr.trigger();
		const c$1 = this.adsr.compute();
		return {
			value: c$1[1],
			done: c$1[0] === `complete`
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
		const max$5 = 1;
		this.attackPath = toPath$1(quadraticSimple({
			x: 0,
			y: this.initialLevel
		}, {
			x: max$5,
			y: this.peakLevel
		}, -this.attackBend));
		this.decayPath = toPath$1(quadraticSimple({
			x: 0,
			y: this.peakLevel
		}, {
			x: max$5,
			y: this.sustainLevel
		}, -this.decayBend));
		this.releasePath = toPath$1(quadraticSimple({
			x: 0,
			y: this.sustainLevel
		}, {
			x: max$5,
			y: this.releaseLevel
		}, -this.releaseBend));
	}
	onTrigger() {
		this.initialLevelOverride = void 0;
		if (!this.retrigger) {
			const [_stage, scaled, _raw] = this.compute(true, false);
			if (!Number.isNaN(scaled) && scaled > 0) this.initialLevelOverride = scaled;
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
		if (stage === void 0) return [
			void 0,
			Number.NaN,
			Number.NaN
		];
		let v;
		switch (stage) {
			case `attack`: {
				v = this.attackPath.interpolate(amt).y;
				if (this.initialLevelOverride !== void 0) v = scale$2(v, 0, 1, this.initialLevelOverride, 1);
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
				if (this.releasedAt !== void 0) v = scale$2(v, 0, this.sustainLevel, 0, this.releasedAt);
				break;
			}
			case `complete`: {
				v = this.releaseLevel;
				this.releasedAt = void 0;
				break;
			}
			default: throw new Error(`Unknown state: ${stage}`);
		}
		return [
			stage,
			v,
			amt
		];
	}
};

//#endregion
//#region packages/modulation/src/envelope/index.ts
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
const adsr = (opts = {}) => {
	const envelope = new Adsr(opts);
	const finalValue = envelope.releaseLevel;
	const iterator$1 = envelope[Symbol.iterator]();
	return () => resolveWithFallbackSync(iterator$1, {
		overrideWithLast: true,
		value: finalValue
	});
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
	for await (const v of r) yield v;
}

//#endregion
//#region packages/modulation/src/source/ticks.ts
function ticks$2(totalTicks, options = {}) {
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
			if (feedback.resetAt !== void 0) v = feedback.resetAt;
			if (feedback.resetAtRelative !== void 0) v = Math.floor(feedback.resetAtRelative * totalTicks);
		}
		if (cycleCount >= cycleLimit) return 1;
		let current = v / totalTicks;
		v++;
		if (v > endPoint) {
			cycleCount++;
			v = startPoint;
		}
		return current;
	};
}

//#endregion
//#region packages/modulation/src/source/time.ts
function elapsed$1(interval, options = {}) {
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
function bpm(bpm$1, options = {}) {
	const interval = 60 * 1e3 / bpm$1;
	return elapsed$1(interval, options);
}
function hertz(hz, options = {}) {
	const interval = 1e3 / hz;
	return elapsed$1(interval, options);
}

//#endregion
//#region packages/modulation/src/source/per-second.ts
const perSecond = (amount, options = {}) => {
	const perMilli = amount / 1e3;
	let min$4 = options.min ?? Number.MIN_SAFE_INTEGER;
	let max$5 = options.max ?? Number.MAX_SAFE_INTEGER;
	const clamp$4 = options.clamp ?? false;
	if (clamp$4 && options.max) throw new Error(`Use either 'max' or 'clamp', not both.`);
	if (clamp$4) max$5 = amount;
	let called = performance.now();
	return () => {
		const now = performance.now();
		const elapsed$2 = now - called;
		called = now;
		const x = perMilli * elapsed$2;
		if (x > max$5) return max$5;
		if (x < min$4) return min$4;
		return x;
	};
};
const perMinute = (amount, options = {}) => {
	return perSecond(amount / 60, options);
};

//#endregion
//#region packages/modulation/src/source/index.ts
var source_exports = {};
__export(source_exports, {
	bpm: () => bpm,
	elapsed: () => elapsed$1,
	hertz: () => hertz,
	perMinute: () => perMinute,
	perSecond: () => perSecond,
	ticks: () => ticks$2
});

//#endregion
//#region packages/modulation/src/cubic-bezier.ts
const cubicBezierShape = (b$2, d$1) => (t$1) => {
	const s = 1 - t$1;
	const s2 = s * s;
	const t2 = t$1 * t$1;
	const t3 = t2 * t$1;
	return 3 * b$2 * s2 * t$1 + 3 * d$1 * s * t2 + t3;
};

//#endregion
//#region packages/modulation/src/drift.ts
const drift = (driftAmtPerMs) => {
	let lastChange = performance.now();
	const update = (v = 1) => {
		const elapsed$2 = performance.now() - lastChange;
		const amt = driftAmtPerMs * elapsed$2 % 1;
		lastChange = performance.now();
		const calc = (v + amt) % 1;
		return calc;
	};
	const reset = () => {
		lastChange = performance.now();
	};
	return {
		update,
		reset
	};
};

//#endregion
//#region packages/modulation/src/gaussian.ts
const pow$1 = Math.pow;
const gaussianA = 1 / Math.sqrt(2 * Math.PI);
const gaussian = (standardDeviation = .4) => {
	const mean = .5;
	return (t$1) => {
		const f = gaussianA / standardDeviation;
		let p$1 = -2.5;
		let c$1 = (t$1 - mean) / standardDeviation;
		c$1 *= c$1;
		p$1 *= c$1;
		const v = f * pow$1(Math.E, p$1);
		if (v > 1) return 1;
		if (v < 0) return 0;
		return v;
	};
};

//#endregion
//#region packages/modulation/src/easing/easings-named.ts
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
const sqrt = Math.sqrt;
const pow = Math.pow;
const cos = Math.cos;
const pi = Math.PI;
const sin = Math.sin;
const bounceOut = (x) => {
	const n1 = 7.5625;
	const d1 = 2.75;
	if (x < 1 / d1) return n1 * x * x;
	else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + .75;
	else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + .9375;
	else return n1 * (x -= 2.625 / d1) * x + .984375;
};
const quintIn = (x) => x * x * x * x * x;
const quintOut = (x) => 1 - pow(1 - x, 5);
const arch = (x) => x * (1 - x) * 4;
const smoothstep = (x) => x * x * (3 - 2 * x);
const smootherstep = (x) => (x * (x * 6 - 15) + 10) * x * x * x;
const sineIn = (x) => 1 - cos(x * pi / 2);
const sineOut = (x) => sin(x * pi / 2);
const quadIn = (x) => x * x;
const quadOut = (x) => 1 - (1 - x) * (1 - x);
const sineInOut = (x) => -(cos(pi * x) - 1) / 2;
const quadInOut = (x) => x < .5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2;
const cubicIn = (x) => x * x * x;
const cubicOut = (x) => 1 - pow(1 - x, 3);
const quartIn = (x) => x * x * x * x;
const quartOut = (x) => 1 - pow(1 - x, 4);
const expoIn = (x) => x === 0 ? 0 : pow(2, 10 * x - 10);
const expoOut = (x) => x === 1 ? 1 : 1 - pow(2, -10 * x);
const quintInOut = (x) => x < .5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2;
const expoInOut = (x) => x === 0 ? 0 : x === 1 ? 1 : x < .5 ? pow(2, 20 * x - 10) / 2 : (2 - pow(2, -20 * x + 10)) / 2;
const circIn = (x) => 1 - sqrt(1 - pow(x, 2));
const circOut = (x) => sqrt(1 - pow(x - 1, 2));
const backIn = (x) => {
	const c1$3 = 1.70158;
	const c3$3 = c1$3 + 1;
	return c3$3 * x * x * x - c1$3 * x * x;
};
const backOut = (x) => {
	const c1$3 = 1.70158;
	const c3$3 = c1$3 + 1;
	return 1 + c3$3 * pow(x - 1, 3) + c1$3 * pow(x - 1, 2);
};
const circInOut = (x) => x < .5 ? (1 - sqrt(1 - pow(2 * x, 2))) / 2 : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2;
const backInOut = (x) => {
	const c1$3 = 1.70158;
	const c2$3 = c1$3 * 1.525;
	return x < .5 ? pow(2 * x, 2) * ((c2$3 + 1) * 2 * x - c2$3) / 2 : (pow(2 * x - 2, 2) * ((c2$3 + 1) * (x * 2 - 2) + c2$3) + 2) / 2;
};
const elasticIn = (x) => {
	const c4 = 2 * pi / 3;
	return x === 0 ? 0 : x === 1 ? 1 : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4);
};
const elasticOut = (x) => {
	const c4 = 2 * pi / 3;
	return x === 0 ? 0 : x === 1 ? 1 : pow(2, -10 * x) * sin((x * 10 - .75) * c4) + 1;
};
const bounceIn = (x) => 1 - bounceOut(1 - x);
const bell = gaussian();
const elasticInOut = (x) => {
	const c5 = 2 * pi / 4.5;
	return x === 0 ? 0 : x === 1 ? 1 : x < .5 ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2 : pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5) / 2 + 1;
};
const bounceInOut = (x) => x < .5 ? (1 - bounceOut(1 - 2 * x)) / 2 : (1 + bounceOut(2 * x - 1)) / 2;

//#endregion
//#region packages/modulation/src/easing/line.ts
const line = (bend = 0, warp = 0) => {
	const max$5 = 1;
	const cubicB = {
		x: scale$2(bend, -1, 1, 0, max$5),
		y: scale$2(bend, -1, 1, max$5, 0)
	};
	let cubicA = interpolate$6(Math.abs(bend), Empty$3, cubicB);
	if (bend !== 0 && warp > 0) if (bend > 0) cubicA = interpolate$6(warp, cubicA, {
		x: 0,
		y: cubicB.x * 2
	});
	else cubicA = interpolate$6(warp, cubicA, {
		x: cubicB.y * 2,
		y: 0
	});
	const bzr = cubic(Empty$3, Unit, cubicA, cubicB);
	const inter = interpolator$1(bzr);
	return (value) => inter(value);
};

//#endregion
//#region packages/modulation/src/modulator-timed.ts
const time$1 = (fn, duration) => {
	throwFunctionTest(fn, `fn`);
	let relative$1;
	return () => {
		if (relative$1 === void 0) relative$1 = ofTotal(duration, { clampValue: true });
		return fn(relative$1());
	};
};
const timeModulator = (fn, duration) => {
	throwFunctionTest(fn, `fn`);
	const timer = elapsedMillisecondsAbsolute();
	const durationMs = intervalToMs(duration);
	if (durationMs === void 0) throw new Error(`Param 'duration' not provided`);
	const relativeTimer = relative(durationMs, {
		timer,
		clampValue: true
	});
	return timerWithFunction(fn, relativeTimer);
};
const ticks$1 = (fn, totalTicks) => {
	throwFunctionTest(fn, `fn`);
	let relative$1;
	return () => {
		if (relative$1 === void 0) relative$1 = ofTotalTicks(totalTicks, { clampValue: true });
		return fn(relative$1());
	};
};
const tickModulator = (fn, durationTicks) => {
	throwFunctionTest(fn, `fn`);
	const timer = elapsedTicksAbsolute();
	const relativeTimer = relative(durationTicks, {
		timer,
		clampValue: true
	});
	return timerWithFunction(fn, relativeTimer);
};

//#endregion
//#region packages/modulation/src/easing/index.ts
var easing_exports = {};
__export(easing_exports, {
	Named: () => easings_named_exports,
	create: () => create,
	get: () => get,
	getEasingNames: () => getEasingNames,
	line: () => line,
	tickEasing: () => tickEasing,
	ticks: () => ticks,
	time: () => time,
	timeEasing: () => timeEasing
});
const create = (options) => {
	const name = resolveEasingName(options.name ?? `quintIn`);
	const fn = name ?? options.fn;
	if (typeof fn === `undefined`) throw new Error(`Either 'name' or 'fn' must be set`);
	if (`duration` in options) return time(fn, options.duration);
	else if (`ticks` in options) return ticks(fn, options.ticks);
	else throw new Error(`Expected 'duration' or 'ticks' in options`);
};
const timeEasing = (nameOrFunction, duration) => {
	const fn = resolveEasingName(nameOrFunction);
	return timeModulator(fn, duration);
};
const time = (nameOrFunction, duration) => {
	const fn = resolveEasingName(nameOrFunction);
	return time$1(fn, duration);
};
const ticks = (nameOrFunction, totalTicks) => {
	const fn = resolveEasingName(nameOrFunction);
	return ticks$1(fn, totalTicks);
};
const tickEasing = (nameOrFunction, durationTicks) => {
	const fn = resolveEasingName(nameOrFunction);
	return tickModulator(fn, durationTicks);
};
const resolveEasingName = (nameOrFunction) => {
	const fn = typeof nameOrFunction === `function` ? nameOrFunction : get(nameOrFunction);
	if (typeof fn === `undefined`) {
		const error = typeof nameOrFunction === `string` ? new Error(`Easing function not found: '${nameOrFunction}'`) : new Error(`Easing function not found`);
		throw error;
	}
	return fn;
};
/**
* Creates a new easing by name
*
* ```js
* import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
* const e = Easings.create(`circInOut`, 1000, elapsedMillisecondsAbsolute);
* ```
* @param nameOrFunction Name of easing, or an easing function
* @param duration Duration (meaning depends on timer source)
* @param timerSource Timer source
* @returns
*/
let easingsMap;
const get = function(easingName) {
	throwStringTest(easingName, `non-empty`, `easingName`);
	const found = cacheEasings().get(easingName.toLowerCase());
	if (found === void 0) throw new Error(`Easing not found: '${easingName}'`);
	return found;
};
function cacheEasings() {
	if (easingsMap === void 0) {
		easingsMap = new Map();
		for (const [k, v] of Object.entries(easings_named_exports)) easingsMap.set(k.toLowerCase(), v);
		return easingsMap;
	} else return easingsMap;
}
function* getEasingNames() {
	const map = cacheEasings();
	yield* map.keys();
}

//#endregion
//#region packages/modulation/src/forces.ts
var forces_exports = {};
__export(forces_exports, {
	accelerationForce: () => accelerationForce,
	angleFromAccelerationForce: () => angleFromAccelerationForce,
	angleFromVelocityForce: () => angleFromVelocityForce,
	angularForce: () => angularForce,
	apply: () => apply,
	attractionForce: () => attractionForce,
	computeAccelerationToTarget: () => computeAccelerationToTarget,
	computeAttractionForce: () => computeAttractionForce,
	computePositionFromAngle: () => computePositionFromAngle,
	computePositionFromVelocity: () => computePositionFromVelocity,
	computeVelocity: () => computeVelocity,
	constrainBounce: () => constrainBounce,
	guard: () => guard,
	magnitudeForce: () => magnitudeForce,
	nullForce: () => nullForce,
	orientationForce: () => orientationForce,
	pendulumForce: () => pendulumForce,
	springForce: () => springForce,
	targetForce: () => targetForce,
	velocityForce: () => velocityForce
});
const guard = (t$1, name = `t`) => {
	if (t$1 === void 0) throw new Error(`Parameter ${name} is undefined. Expected ForceAffected`);
	if (t$1 === null) throw new Error(`Parameter ${name} is null. Expected ForceAffected`);
	if (typeof t$1 !== `object`) throw new TypeError(`Parameter ${name} is type ${typeof t$1}. Expected object of shape ForceAffected`);
};
const constrainBounce = (bounds, dampen = 1) => {
	if (!bounds) bounds = {
		width: 1,
		height: 1
	};
	const minX = getEdgeX(bounds, `left`);
	const maxX = getEdgeX(bounds, `right`);
	const minY = getEdgeY(bounds, `top`);
	const maxY = getEdgeY(bounds, `bottom`);
	return (t$1) => {
		const position = computePositionFromVelocity(t$1.position ?? Empty$3, t$1.velocity ?? Empty$3);
		let velocity = t$1.velocity ?? Empty$3;
		let { x, y } = position;
		if (x > maxX) {
			x = maxX;
			velocity = invert(multiplyScalar$2(velocity, dampen), `x`);
		} else if (x < minX) {
			x = minX;
			velocity = invert(multiplyScalar$2(velocity, dampen), `x`);
		}
		if (y > maxY) {
			y = maxY;
			velocity = multiplyScalar$2(invert(velocity, `y`), dampen);
		} else if (position.y < minY) {
			y = minY;
			velocity = invert(multiplyScalar$2(velocity, dampen), `y`);
		}
		return Object.freeze({
			...t$1,
			position: {
				x,
				y
			},
			velocity
		});
	};
};
const attractionForce = (attractors, gravity, distanceRange = {}) => (attractee) => {
	let accel = attractee.acceleration ?? Empty$3;
	for (const a$1 of attractors) {
		if (a$1 === attractee) continue;
		const f = computeAttractionForce(a$1, attractee, gravity, distanceRange);
		accel = sum$5(accel, f);
	}
	return {
		...attractee,
		acceleration: accel
	};
};
const computeAttractionForce = (attractor, attractee, gravity, distanceRange = {}) => {
	if (attractor.position === void 0) throw new Error(`attractor.position not set`);
	if (attractee.position === void 0) throw new Error(`attractee.position not set`);
	const distributionRangeMin = distanceRange.min ?? .01;
	const distributionRangeMax = distanceRange.max ?? .7;
	const f = normalise$1(subtract$3(attractor.position, attractee.position));
	const d$1 = clamp$3(distance$2(f), distributionRangeMin, distributionRangeMax);
	return multiplyScalar$2(f, gravity * (attractor.mass ?? 1) * (attractee.mass ?? 1) / (d$1 * d$1));
};
const targetForce = (targetPos, opts = {}) => {
	const fn = (t$1) => {
		const accel = computeAccelerationToTarget(targetPos, t$1.position ?? {
			x: .5,
			y: .5
		}, opts);
		return {
			...t$1,
			acceleration: sum$5(t$1.acceleration ?? Empty$3, accel)
		};
	};
	return fn;
};
const apply = (t$1, ...accelForces) => {
	if (t$1 === void 0) throw new Error(`t parameter is undefined`);
	for (const f of accelForces) {
		if (f === null || f === void 0) continue;
		t$1 = typeof f === `function` ? f(t$1) : {
			...t$1,
			acceleration: sum$5(t$1.acceleration ?? Empty$3, f)
		};
	}
	const velo = computeVelocity(t$1.acceleration ?? Empty$3, t$1.velocity ?? Empty$3);
	const pos = computePositionFromVelocity(t$1.position ?? Empty$3, velo);
	const ff = {
		...t$1,
		position: pos,
		velocity: velo,
		acceleration: Empty$3
	};
	return ff;
};
const accelerationForce = (vector, mass = `ignored`) => (t$1) => Object.freeze({
	...t$1,
	acceleration: massApplyAccel(vector, t$1, mass)
});
/**
* Returns an acceleration vector with mass either dampening or multiplying it.
* The passed-in `thing` is not modified.
*
* ```js
* // Initial acceleration vector
* const accel = { x: 0.1, y: 0};
*
* // Thing being moved
* const thing = { mass: 0.5, position: ..., acceleration: ... }
*
* // New acceleration vector, affected by mass of `thing`
* const accelWithMass = massApplyAccel(accel, thing, `dampen`);
* ```
* Mass of thing can be factored in, according to `mass` setting. Use `dampen`
* to reduce acceleration with greater mass of thing. Use `multiply` to increase
* the effect of acceleration with a greater mass of thing. `ignored` means
* mass is not taken into account.
*
* If `t` has no mass, the `mass` setting is ignored.
*
* This function is used internally by the predefined forces.
*
* @param vector Vector force
* @param thing Thing being affected
* @param mass How to factor in mass of thing (default ignored)
* @returns Acceleration vector
*/
const massApplyAccel = (vector, thing, mass = `ignored`) => {
	let op;
	switch (mass) {
		case `dampen`: {
			op = (mass$1) => divide$4(vector, mass$1, mass$1);
			break;
		}
		case `multiply`: {
			op = (mass$1) => multiply$3(vector, mass$1, mass$1);
			break;
		}
		case `ignored`: {
			op = (_mass) => vector;
			break;
		}
		default: throw new Error(
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			`Unknown 'mass' parameter '${mass}. Expected 'dampen', 'multiply' or 'ignored'`
);
	}
	return sum$5(thing.acceleration ?? Empty$3, op(thing.mass ?? 1));
};
const magnitudeForce = (force, mass = `ignored`) => (t$1) => {
	if (t$1.velocity === void 0) return t$1;
	const mag = distance$2(normalise$1(t$1.velocity));
	const magSq = force * mag * mag;
	const vv = multiplyScalar$2(invert(t$1.velocity), magSq);
	return Object.freeze({
		...t$1,
		acceleration: massApplyAccel(vv, t$1, mass)
	});
};
const nullForce = (t$1) => t$1;
const velocityForce = (force, mass) => {
	const pipeline$1 = pipeline(invert, (v) => multiplyScalar$2(v, force));
	return (t$1) => {
		if (t$1.velocity === void 0) return t$1;
		const v = pipeline$1(t$1.velocity);
		return Object.freeze({
			...t$1,
			acceleration: massApplyAccel(v, t$1, mass)
		});
	};
};
const angularForce = () => (t$1) => {
	const accumulator = t$1.angularAcceleration ?? 0;
	const vel = t$1.angularVelocity ?? 0;
	const angle = t$1.angle ?? 0;
	const v = vel + accumulator;
	const a$1 = angle + v;
	return Object.freeze({
		...t$1,
		angle: a$1,
		angularVelocity: v,
		angularAcceleration: 0
	});
};
const angleFromAccelerationForce = (scaling = 20) => (t$1) => {
	const accel = t$1.acceleration ?? Empty$3;
	return Object.freeze({
		...t$1,
		angularAcceleration: accel.x * scaling
	});
};
const angleFromVelocityForce = (interpolateAmt = 1) => (t$1) => {
	const a$1 = angleRadian$1(t$1.velocity ?? Empty$3);
	return Object.freeze({
		...t$1,
		angle: interpolateAmt < 1 ? interpolateAngle$1(interpolateAmt, t$1.angle ?? 0, a$1) : a$1
	});
};
const springForce = (pinnedAt, restingLength = .5, k = 2e-4, damping = .999) => (t$1) => {
	const direction = subtract$3(t$1.position ?? Empty$3, pinnedAt);
	const mag = distance$2(direction);
	const stretch = Math.abs(restingLength - mag);
	const f = pipelineApply(direction, normalise$1, (p$1) => multiplyScalar$2(p$1, -k * stretch));
	const accel = massApplyAccel(f, t$1, `dampen`);
	const velo = computeVelocity(accel ?? Empty$3, t$1.velocity ?? Empty$3);
	const veloDamped = multiply$3(velo, damping, damping);
	return {
		...t$1,
		velocity: veloDamped,
		acceleration: Empty$3
	};
};
const pendulumForce = (pinnedAt, opts = {}) => (t$1) => {
	if (!pinnedAt) pinnedAt = {
		x: 0,
		y: 0
	};
	const length$4 = opts.length ?? distance$2(pinnedAt, t$1.position ?? Empty$3);
	const speed = opts.speed ?? .001;
	const damping = opts.damping ?? .995;
	let angle = t$1.angle;
	if (angle === void 0) if (t$1.position) angle = angleRadian$1(pinnedAt, t$1.position) - Math.PI / 2;
	else angle = 0;
	const accel = -1 * speed / length$4 * Math.sin(angle);
	const v = (t$1.angularVelocity ?? 0) + accel;
	angle += v;
	return Object.freeze({
		angularVelocity: v * damping,
		angle,
		position: computePositionFromAngle(length$4, angle + Math.PI / 2, pinnedAt)
	});
};
const computeVelocity = (acceleration, velocity, velocityMax) => {
	const p$1 = sum$5(velocity, acceleration);
	return velocityMax === void 0 ? p$1 : clampMagnitude$1(p$1, velocityMax);
};
const computeAccelerationToTarget = (targetPos, currentPos, opts = {}) => {
	const diminishBy = opts.diminishBy ?? .001;
	const direction = subtract$3(targetPos, currentPos);
	if (opts.range && compare(abs$2(direction), opts.range) === -2) return Empty$3;
	return multiplyScalar$2(direction, diminishBy);
};
const computePositionFromVelocity = (position, velocity) => sum$5(position, velocity);
const computePositionFromAngle = (distance$3, angleRadians, origin) => toCartesian$2(distance$3, angleRadians, origin);
const _angularForce = angularForce();
const _angleFromAccelerationForce = angleFromAccelerationForce();
const orientationForce = (interpolationAmt = .5) => {
	const angleFromVel = angleFromVelocityForce(interpolationAmt);
	return (t$1) => {
		t$1 = _angularForce(t$1);
		t$1 = _angleFromAccelerationForce(t$1);
		t$1 = angleFromVel(t$1);
		return t$1;
	};
};

//#endregion
//#region packages/modulation/src/util/pi-pi.ts
const piPi$1 = Math.PI * 2;

//#endregion
//#region packages/modulation/src/interpolate.ts
function interpolate$1(pos1, pos2, pos3, pos4) {
	let amountProcess;
	let limits = `clamp`;
	const handleAmount = (amount) => {
		if (amountProcess) amount = amountProcess(amount);
		if (limits === void 0 || limits === `clamp`) amount = clamp$3(amount);
		else if (limits === `wrap`) {
			if (amount > 1) amount = amount % 1;
			else if (amount < 0) amount = 1 + amount % 1;
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
			const easer = get(o.easing);
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
		let a$1;
		let b$2;
		if (pos3 === void 0 || typeof pos3 === `object`) {
			a$1 = pos1;
			b$2 = pos2;
			readOpts(pos3);
			return (amount) => doTheEase(amount, a$1, b$2);
		} else if (typeof pos3 === `number`) {
			a$1 = pos2;
			b$2 = pos3;
			readOpts(pos4);
			return doTheEase(pos1, a$1, b$2);
		} else throw new Error(`Values for 'a' and 'b' not defined`);
	} else if (pos2 === void 0 || typeof pos2 === `object`) {
		const amount = handleAmount(pos1);
		readOpts(pos2);
		throwNumberTest(amount, ``, `amount`);
		return (aValue, bValue) => rawEase(amount, aValue, bValue);
	}
}
const interpolatorStepped = (incrementAmount, a$1 = 0, b$2 = 1, startInterpolationAt = 0, options) => {
	let amount = startInterpolationAt;
	return (retargetB, retargetA) => {
		if (retargetB !== void 0) b$2 = retargetB;
		if (retargetA !== void 0) a$1 = retargetA;
		if (amount >= 1) return b$2;
		const value = interpolate$1(amount, a$1, b$2, options);
		amount += incrementAmount;
		return value;
	};
};
const interpolateAngle = (amount, aRadians, bRadians, options) => {
	const t$1 = wrap$5(bRadians - aRadians, 0, piPi$1);
	return interpolate$1(amount, aRadians, aRadians + (t$1 > Math.PI ? t$1 - piPi$1 : t$1), options);
};
const interpolatorInterval = (duration, a$1 = 0, b$2 = 1, options) => {
	const durationProgression = ofTotal(duration, { clampValue: true });
	return (retargetB, retargetA) => {
		const amount = durationProgression();
		if (retargetB !== void 0) b$2 = retargetB;
		if (retargetA !== void 0) a$1 = retargetA;
		if (amount >= 1) return b$2;
		const value = interpolate$1(amount, a$1, b$2, options);
		return value;
	};
};

//#endregion
//#region packages/modulation/src/jitter.ts
const jitterAbsolute = (options) => {
	const { relative: relative$1, absolute } = options;
	const clamped = options.clamped ?? false;
	const source = options.source ?? Math.random;
	if (absolute !== void 0) return (value) => {
		const abs$3 = source() * absolute * 2 - absolute;
		const valueNew = value + abs$3;
		if (clamped) return clamp$3(valueNew, 0, value);
		return valueNew;
	};
	if (relative$1 !== void 0) return (value) => {
		const rel = value * relative$1;
		const abs$3 = source() * rel * 2 - rel;
		const valueNew = value + abs$3;
		if (clamped) return clamp$3(valueNew, 0, value);
		return valueNew;
	};
	throw new Error(`Either absolute or relative fields expected`);
};
const jitter = (options = {}) => {
	const clamped = options.clamped ?? true;
	let r = (_) => 0;
	if (options.absolute !== void 0) {
		throwNumberTest(options.absolute, clamped ? `percentage` : `bipolar`, `opts.absolute`);
		const absRand = floatSource({
			min: -options.absolute,
			max: options.absolute,
			source: options.source
		});
		r = (v) => v + absRand();
	} else if (options.relative === void 0) throw new TypeError(`Either absolute or relative jitter amount is required.`);
	else {
		const rel = options.relative ?? .1;
		throwNumberTest(rel, clamped ? `percentage` : `bipolar`, `opts.relative`);
		r = (v) => v + float({
			min: -Math.abs(rel * v),
			max: Math.abs(rel * v),
			source: options.source
		});
	}
	const compute = (value) => {
		throwNumberTest(value, clamped ? `percentage` : `bipolar`, `value`);
		let v = r(value);
		if (clamped) v = clamp$3(v);
		return v;
	};
	return compute;
};

//#endregion
//#region packages/modulation/src/mix.ts
const mix = (amount, original, modulation) => {
	const m$1 = modulation * amount;
	const base = (1 - amount) * original;
	return base + original * m$1;
};
const mixModulators = (balance, a$1, b$2) => (amt) => interpolate$7(balance, a$1(amt), b$2(amt));
const crossfade = (a$1, b$2) => {
	return (amt) => {
		const mixer = mixModulators(amt, a$1, b$2);
		return mixer(amt);
	};
};

//#endregion
//#region packages/modulation/src/no-op.ts
const noop = (v) => v;

//#endregion
//#region packages/modulation/src/oscillator.ts
var oscillator_exports = {};
__export(oscillator_exports, {
	saw: () => saw,
	sine: () => sine,
	sineBipolar: () => sineBipolar,
	square: () => square,
	triangle: () => triangle
});
const piPi = Math.PI * 2;
function* sine(timerOrFreq) {
	if (timerOrFreq === void 0) throw new TypeError(`Parameter 'timerOrFreq' is undefined`);
	if (typeof timerOrFreq === `number`) timerOrFreq = frequencyTimer(timerOrFreq);
	while (true) yield (Math.sin(timerOrFreq.elapsed * piPi) + 1) / 2;
}
function* sineBipolar(timerOrFreq) {
	if (timerOrFreq === void 0) throw new TypeError(`Parameter 'timerOrFreq' is undefined`);
	if (typeof timerOrFreq === `number`) timerOrFreq = frequencyTimer(timerOrFreq);
	while (true) yield Math.sin(timerOrFreq.elapsed * piPi);
}
function* triangle(timerOrFreq) {
	if (typeof timerOrFreq === `number`) timerOrFreq = frequencyTimer(timerOrFreq);
	while (true) {
		let v = timerOrFreq.elapsed;
		if (v < .5) v *= 2;
		else v = 2 - v * 2;
		yield v;
	}
}
function* saw(timerOrFreq) {
	if (timerOrFreq === void 0) throw new TypeError(`Parameter 'timerOrFreq' is undefined`);
	if (typeof timerOrFreq === `number`) timerOrFreq = frequencyTimer(timerOrFreq);
	while (true) yield timerOrFreq.elapsed;
}
function* square(timerOrFreq) {
	if (typeof timerOrFreq === `number`) timerOrFreq = frequencyTimer(timerOrFreq);
	while (true) yield timerOrFreq.elapsed < .5 ? 0 : 1;
}

//#endregion
//#region packages/modulation/src/ping-pong.ts
const pingPongPercent = function(interval = .1, lower, upper, start, rounding) {
	if (lower === void 0) lower = 0;
	if (upper === void 0) upper = 1;
	if (start === void 0) start = lower;
	throwNumberTest(interval, `bipolar`, `interval`);
	throwNumberTest(upper, `bipolar`, `end`);
	throwNumberTest(start, `bipolar`, `offset`);
	throwNumberTest(lower, `bipolar`, `start`);
	return pingPong(interval, lower, upper, start, rounding);
};
const pingPong = function* (interval, lower, upper, start, rounding) {
	if (lower === void 0) throw new Error(`Parameter 'lower' is undefined`);
	if (interval === void 0) throw new Error(`Parameter 'interval' is undefined`);
	if (upper === void 0) throw new Error(`Parameter 'upper' is undefined`);
	if (rounding === void 0 && interval <= 1 && interval >= 0) rounding = 10 / interval;
	else if (rounding === void 0) rounding = 1234;
	if (Number.isNaN(interval)) throw new Error(`interval parameter is NaN`);
	if (Number.isNaN(lower)) throw new Error(`lower parameter is NaN`);
	if (Number.isNaN(upper)) throw new Error(`upper parameter is NaN`);
	if (Number.isNaN(start)) throw new Error(`upper parameter is NaN`);
	if (lower >= upper) throw new Error(`lower must be less than upper`);
	if (interval === 0) throw new Error(`Interval cannot be zero`);
	const distance$3 = upper - lower;
	if (Math.abs(interval) >= distance$3) throw new Error(`Interval should be between -${distance$3} and ${distance$3}`);
	let incrementing = interval > 0;
	upper = Math.floor(upper * rounding);
	lower = Math.floor(lower * rounding);
	interval = Math.floor(Math.abs(interval * rounding));
	if (interval === 0) throw new Error(`Interval is zero (rounding: ${rounding})`);
	start = start === void 0 ? lower : Math.floor(start * rounding);
	if (start > upper || start < lower) throw new Error(`Start (${start / rounding}) must be within lower (${lower / rounding}) and upper (${upper / rounding})`);
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

//#endregion
//#region packages/modulation/src/spring.ts
function* spring(opts = {}, timerOrFreq) {
	if (timerOrFreq === void 0) timerOrFreq = elapsedMillisecondsAbsolute();
	else if (typeof timerOrFreq === `number`) timerOrFreq = frequencyTimer(timerOrFreq);
	const fn = springShape(opts);
	let doneCountdown = opts.countdown ?? 10;
	while (doneCountdown > 0) {
		const s = fn(timerOrFreq.elapsed / 1e3);
		yield s;
		if (s === 1) doneCountdown--;
		else doneCountdown = 100;
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
const springShape = (opts = {}) => {
	/** MIT License github.com/pushkine/ */
	const from$1 = 0;
	const to$3 = 1;
	const mass = opts.mass ?? 1;
	const stiffness = opts.stiffness ?? 100;
	const soft = opts.soft ?? false;
	const damping = opts.damping ?? 10;
	const velocity = opts.velocity ?? .1;
	const delta = to$3 - from$1;
	if (soft || 1 <= damping / (2 * Math.sqrt(stiffness * mass))) {
		const angularFrequency = -Math.sqrt(stiffness / mass);
		const leftover = -angularFrequency * delta - velocity;
		return (t$1) => to$3 - (delta + t$1 * leftover) * Math.E ** (t$1 * angularFrequency);
	} else {
		const dampingFrequency = Math.sqrt(4 * mass * stiffness - damping ** 2);
		const leftover = (damping * delta - 2 * mass * velocity) / dampingFrequency;
		const dfm = .5 * dampingFrequency / mass;
		const dm = -(.5 * damping) / mass;
		return (t$1) => to$3 - (Math.cos(t$1 * dfm) * delta + Math.sin(t$1 * dfm) * leftover) * Math.E ** (t$1 * dm);
	}
};

//#endregion
//#region packages/modulation/src/timing-source-factory.ts
const timingSourceFactory = (source, duration, options = {}) => {
	switch (source) {
		case `elapsed`: return () => elapsed$1(duration, options);
		case `bpm`: return () => bpm(duration, options);
		case `hertz`: return () => hertz(duration, options);
		default: throw new Error(`Unknown source '${source}'. Expected: 'elapsed', 'hertz' or 'bpm'`);
	}
};

//#endregion
//#region packages/modulation/src/waveforms.ts
function triangleShape(period = 1) {
	period = 1 / period;
	const halfPeriod = period / 2;
	return (t$1) => {
		const v = Math.abs(t$1 % period - halfPeriod);
		return v;
	};
}
function squareShape(period = 1) {
	period = 1 / period;
	const halfPeriod = period / 2;
	return (t$1) => {
		return t$1 % period < halfPeriod ? 1 : 0;
	};
}
function sineShape(period = 1) {
	period = period * (Math.PI * 2);
	return (t$1) => {
		const v = (Math.sin(t$1 * period) + 1) / 2;
		return v;
	};
}
function arcShape(period = 1) {
	period = period * (Math.PI * 2);
	return (t$1) => Math.abs(Math.sin(t$1 * period));
}
function sineBipolarShape(period = 1) {
	period = period * (Math.PI * 2);
	return (t$1) => Math.sin(t$1 * period);
}
function wave(options) {
	const shape = options.shape ?? `sine`;
	const invert$2 = options.invert ?? false;
	const period = options.period ?? 1;
	let sourceFunction;
	throwIntegerTest(period, `aboveZero`, `period`);
	const sourceOptions = { ...options };
	if (options.ticks) sourceFunction = ticks$2(options.ticks, sourceOptions);
	else if (options.hertz) sourceFunction = hertz(options.hertz, sourceOptions);
	else if (options.millis) sourceFunction = elapsed$1(options.millis, sourceOptions);
	else if (options.source) sourceFunction = options.source;
	else {
		const secs = options.secs ?? 5;
		sourceFunction = elapsed$1(secs * 1e3, sourceOptions);
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
		default: throw new Error(`Unknown wave shape '${shape}'. Expected: sine, sine-bipolar, saw, triangle, arc or square`);
	}
	return waveFromSource(sourceFunction, shaperFunction, invert$2);
}
function waveFromSource(sourceFunction, shaperFunction, invert$2 = false) {
	return (feedback) => {
		let v = sourceFunction(feedback?.clock);
		if (feedback?.override) v = feedback.override;
		v = shaperFunction(v);
		if (invert$2) v = 1 - v;
		return v;
	};
}

//#endregion
//#region packages/modulation/src/weighted-average.ts
const weightedAverage = (currentValue, targetValue, slowDownFactor) => {
	return (currentValue * (slowDownFactor - 1) + targetValue) / slowDownFactor;
};

//#endregion
//#region packages/modulation/src/weighted-random.ts
const weighted = (easingNameOrOptions = `quadIn`) => weightedSource(easingNameOrOptions)();
const weightedSource = (easingNameOrOptions = `quadIn`) => {
	const options = typeof easingNameOrOptions === `string` ? { easing: easingNameOrOptions } : easingNameOrOptions;
	const source = options.source ?? Math.random;
	const easingName = options.easing ?? `quadIn`;
	const easingFunction = get(easingName);
	if (typeof easingFunction === `undefined`) throw new Error(`Easing function '${easingName}' not found.`);
	const compute = () => {
		const r = source();
		return easingFunction(r);
	};
	return compute;
};

//#endregion
//#region packages/ixfx/src/modulation.ts
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
	interpolate: () => interpolate$1,
	interpolateAngle: () => interpolateAngle,
	interpolatorInterval: () => interpolatorInterval,
	interpolatorStepped: () => interpolatorStepped,
	jitter: () => jitter,
	jitterAbsolute: () => jitterAbsolute,
	mix: () => mix,
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
	ticks: () => ticks$1,
	time: () => time$1,
	timeModulator: () => timeModulator,
	timingSourceFactory: () => timingSourceFactory,
	triangleShape: () => triangleShape,
	wave: () => wave,
	waveFromSource: () => waveFromSource,
	weighted: () => weighted,
	weightedAverage: () => weightedAverage,
	weightedSource: () => weightedSource
});

//#endregion
//#region packages/rx/src/util.ts
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
const isPingable = (rx) => {
	if (!isReactive$1(rx)) return false;
	if (`ping` in rx) return true;
	return false;
};
const hasLast$1 = (rx) => {
	if (!isReactive$1(rx)) return false;
	if (`last` in rx) {
		const v = rx.last();
		if (v !== void 0) return true;
	}
	return false;
};
const isReactive$1 = (rx) => {
	if (typeof rx !== `object`) return false;
	if (rx === null) return false;
	return `on` in rx && `onValue` in rx;
};
const isWritable = (rx) => {
	if (!isReactive$1(rx)) return false;
	if (`set` in rx) return true;
	return false;
};
const isWrapped = (v) => {
	if (typeof v !== `object`) return false;
	if (!(`source` in v)) return false;
	if (!(`annotate` in v)) return false;
	return true;
};
const opify = (fn, ...args) => {
	return (source) => {
		return fn(source, ...args);
	};
};
const isTriggerValue = (t$1) => `value` in t$1;
const isTriggerFunction = (t$1) => `fn` in t$1;
const isTriggerGenerator = (t$1) => isIterable(t$1);
const isTrigger = (t$1) => {
	if (typeof t$1 !== `object`) return false;
	if (isTriggerValue(t$1)) return true;
	if (isTriggerFunction(t$1)) return true;
	if (isTriggerGenerator(t$1)) return true;
	return false;
};
function resolveTriggerValue(t$1) {
	if (isTriggerValue(t$1)) return [t$1.value, false];
	if (isTriggerFunction(t$1)) {
		const v = t$1.fn();
		if (v === void 0) return [void 0, true];
		return [v, false];
	}
	if (isTriggerGenerator(t$1)) {
		const v = t$1.gen.next();
		if (v.done) return [void 0, true];
		return [v.value, false];
	}
	throw new Error(`Invalid trigger. Missing 'value' or 'fn' fields`);
}

//#endregion
//#region packages/rx/src/from/function.ts
function func(callback, options = {}) {
	const maximumRepeats = options.maximumRepeats ?? Number.MAX_SAFE_INTEGER;
	const closeOnError = options.closeOnError ?? true;
	const intervalMs = options.interval ? intervalToMs(options.interval) : -1;
	let manual$1 = options.manual ?? false;
	if (options.interval === void 0 && options.manual === void 0) manual$1 = true;
	if (manual$1 && options.interval) throw new Error(`If option 'manual' is set, option 'interval' cannot be used`);
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
		if (run$1) run$1.cancel();
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
	const run$1 = manual$1 ? void 0 : continuously(async () => {
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
			if (run$1) run$1.start();
		},
		onStop() {
			enabled = false;
			if (run$1) run$1.cancel();
		}
	});
	if (lazy === `never` && run$1) run$1.start();
	return {
		...events,
		ping
	};
}

//#endregion
//#region packages/rx/src/from/iterator.ts
function iterator(source, options = {}) {
	const lazy = options.lazy ?? `very`;
	const log = options.traceLifecycle ? (message) => {
		console.log(`Rx.From.iterator ${message}`);
	} : (_) => {};
	const readIntervalMs = intervalToMs(options.readInterval, 5);
	const readTimeoutMs = intervalToMs(options.readTimeout, 5 * 60 * 1e3);
	const whenStopped = options.whenStopped ?? `continue`;
	let iterator$1;
	let ourAc;
	let sm = init({
		idle: [`wait_for_next`],
		wait_for_next: [
			`processing_result`,
			`stopping`,
			`disposed`
		],
		processing_result: [
			`queued`,
			`disposed`,
			`stopping`
		],
		queued: [
			`wait_for_next`,
			`disposed`,
			`stopping`
		],
		stopping: `idle`,
		disposed: null
	}, `idle`);
	const onExternalSignal = () => {
		log(`onExternalSignal`);
		ourAc?.abort(options.signal?.reason);
	};
	if (options.signal) options.signal.addEventListener(`abort`, onExternalSignal, { once: true });
	const read = async () => {
		log(`read. State: ${sm.value}`);
		ourAc = new AbortController();
		try {
			sm = to$1(sm, `wait_for_next`);
			const v = await nextWithTimeout(iterator$1, {
				signal: ourAc.signal,
				millis: readTimeoutMs
			});
			sm = to$1(sm, `processing_result`);
			ourAc.abort(`nextWithTimeout completed`);
			if (v.done) {
				log(`read v.done true`);
				events.dispose(`Generator complete`);
				sm = to$1(sm, `disposed`);
			}
			if (sm.value === `stopping`) {
				log(`read. sm.value = stopping`);
				sm = to$1(sm, `idle`);
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
			sm = to$1(sm, `queued`);
			log(`scheduling read. State: ${sm.value}`);
			setTimeout(read, readIntervalMs);
		} else sm = to$1(sm, `idle`);
	};
	const events = initLazyStream({
		...options,
		lazy,
		onStart() {
			log(`onStart state: ${sm.value} whenStopped: ${whenStopped}`);
			if (sm.value !== `idle`) return;
			if (sm.value === `idle` && whenStopped === `reset` || iterator$1 === void 0) iterator$1 = isAsyncIterable(source) ? source[Symbol.asyncIterator]() : source[Symbol.iterator]();
			read();
		},
		onStop() {
			log(`onStop state: ${sm.value} whenStopped: ${whenStopped}`);
			sm = to$1(sm, `stopping`);
			if (whenStopped === `reset`) {
				log(`onStop reiniting iterator`);
				iterator$1 = isAsyncIterable(source) ? source[Symbol.asyncIterator]() : source[Symbol.iterator]();
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

//#endregion
//#region packages/rx/src/resolve-source.ts
const resolveSource = (source, options = {}) => {
	if (isReactive$1(source)) return source;
	const generatorOptions = options.generator ?? {
		lazy: `initial`,
		interval: 5
	};
	const functionOptions = options.function ?? { lazy: `very` };
	if (Array.isArray(source)) return iterator(source.values(), generatorOptions);
	else if (typeof source === `function`) return func(source, functionOptions);
	else if (typeof source === `object`) {
		if (isWrapped(source)) return source.source;
		if (isIterable(source) || isAsyncIterable(source)) return iterator(source, generatorOptions);
	}
	throw new TypeError(`Unable to resolve source. Supports: array, Reactive, Async/Iterable. Got type: ${typeof source}`);
};

//#endregion
//#region packages/rx/src/cache.ts
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

//#endregion
//#region packages/rx/src/init-stream.ts
function initUpstream(upstreamSource, options) {
	const lazy = options.lazy ?? `initial`;
	const disposeIfSourceDone = options.disposeIfSourceDone ?? true;
	const onValue = options.onValue ?? ((_v) => {});
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
			if (messageIsSignal(value)) if (value.signal === `done`) {
				onStop();
				events.signal(value.signal, value.context);
				if (disposeIfSourceDone) events.dispose(`Upstream source ${debugLabel} has completed (${value.context ?? ``})`);
			} else events.signal(value.signal, value.context);
			else if (messageHasValue(value)) onValue(value.value);
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
	const c$1 = cache(r, options.initialValue);
	return c$1;
}
function initLazyStream(options) {
	const lazy = options.lazy ?? `initial`;
	const onStop = options.onStop ?? (() => {});
	const onStart = options.onStart ?? (() => {});
	const debugLabel = options.debugLabel ? `[${options.debugLabel}]` : ``;
	const events = initStream({
		...options,
		onFirstSubscribe() {
			if (lazy !== `never`) onStart();
		},
		onNoSubscribers() {
			if (lazy === `very`) onStop();
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
	const isEmpty$6 = () => {
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
			isEmpty$6();
		};
	};
	return {
		dispose: (reason) => {
			if (disposed) return;
			dispatcher?.notify({
				value: void 0,
				signal: `done`,
				context: `Disposed: ${reason}`
			});
			disposed = true;
			if (options.onDispose) options.onDispose(reason);
		},
		isDisposed: () => {
			return disposed;
		},
		removeAllSubscribers: () => {
			dispatcher?.clear();
			isEmpty$6();
		},
		set: (v) => {
			if (disposed) throw new Error(`${debugLabel} Disposed, cannot set`);
			dispatcher?.notify({ value: v });
		},
		signal: (signal, context) => {
			if (disposed) throw new Error(`${debugLabel} Disposed, cannot signal`);
			dispatcher?.notify({
				signal,
				value: void 0,
				context
			});
		},
		on: (handler) => subscribe(handler),
		onValue: (handler) => {
			const unsub = subscribe((message) => {
				if (messageHasValue(message)) handler(message.value);
			});
			return unsub;
		}
	};
}

//#endregion
//#region packages/rx/src/sinks/dom.ts
const setHtmlText = (rxOrSource, optionsOrElementOrQuery) => {
	let el;
	let options;
	if (typeof optionsOrElementOrQuery === `string`) options = { query: optionsOrElementOrQuery };
	if (typeof optionsOrElementOrQuery === `object`) if (`nodeName` in optionsOrElementOrQuery) options = { el: optionsOrElementOrQuery };
	else options = optionsOrElementOrQuery;
	if (options === void 0) throw new TypeError(`Missing element as second parameter or option`);
	if (`el` in options) el = options.el;
	else if (`query` in options) el = document.querySelector(options.query);
	else throw new TypeError(`Options does not include 'el' or 'query' fields`);
	if (el === null || el === void 0) throw new Error(`Element could not be resolved.`);
	const stream$1 = resolveSource(rxOrSource);
	const setter$1 = setProperty(options.asHtml ? `innerHTML` : `textContent`, el);
	const off = stream$1.onValue((value) => {
		setter$1(value);
	});
	return off;
};

//#endregion
//#region packages/rx/src/to-readable.ts
const toReadable = (stream$1) => ({
	on: stream$1.on,
	dispose: stream$1.dispose,
	isDisposed: stream$1.isDisposed,
	onValue: stream$1.onValue
});

//#endregion
//#region packages/rx/src/ops/annotate.ts
function annotate(input, annotator, options = {}) {
	const upstream = initUpstream(input, {
		...options,
		onValue(value) {
			const annotation = annotator(value);
			upstream.set({
				value,
				annotation
			});
		}
	});
	return toReadable(upstream);
}
function annotateWithOp(input, annotatorOp) {
	const inputStream = resolveSource(input);
	const stream$1 = annotatorOp(inputStream);
	const synced = syncToObject({
		value: inputStream,
		annotation: stream$1
	});
	return synced;
}

//#endregion
//#region packages/rx/src/ops/chunk.ts
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
			if (quantity > 0 && queue.length >= quantity) send();
			if (timer !== void 0 && timer.runState === `idle`) timer.start();
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

//#endregion
//#region packages/rx/src/ops/transform.ts
function transform(input, transformer, options = {}) {
	const traceInput = options.traceInput ?? false;
	const traceOutput = options.traceOutput ?? false;
	const upstream = initUpstream(input, {
		lazy: `initial`,
		...options,
		onValue(value) {
			const t$1 = transformer(value);
			if (traceInput && traceOutput) console.log(`Rx.Ops.transform input: ${JSON.stringify(value)} output: ${JSON.stringify(t$1)}`);
			else if (traceInput) console.log(`Rx.Ops.transform input: ${JSON.stringify(value)}`);
			else if (traceOutput) console.log(`Rx.Ops.transform output: ${JSON.stringify(t$1)}`);
			upstream.set(t$1);
		}
	});
	return toReadable(upstream);
}

//#endregion
//#region packages/rx/src/ops/clone-from-fields.ts
const cloneFromFields = (source) => {
	return transform(source, (v) => {
		const entries = [];
		for (const field$1 in v) {
			const value = v[field$1];
			if (isPlainObjectOrPrimitive(value)) entries.push([field$1, value]);
		}
		return Object.fromEntries(entries);
	});
};

//#endregion
//#region packages/rx/src/ops/combine-latest-to-array.ts
function combineLatestToArray(reactiveSources, options = {}) {
	const event$1 = initStream();
	const onSourceDone = options.onSourceDone ?? `break`;
	const data = [];
	const sources = reactiveSources.map((source) => resolveSource(source));
	const noop$1 = () => {};
	const sourceOff = sources.map((_) => noop$1);
	const doneSources = sources.map((_) => false);
	const unsub = () => {
		for (const v of sourceOff) v();
	};
	for (const [index, v] of sources.entries()) {
		data[index] = void 0;
		sourceOff[index] = v.on((message) => {
			if (messageIsDoneSignal(message)) {
				doneSources[index] = true;
				sourceOff[index]();
				sourceOff[index] = noop$1;
				if (onSourceDone === `break`) {
					unsub();
					event$1.dispose(`Source has completed and 'break' is set`);
					return;
				}
				if (!doneSources.includes(false)) {
					unsub();
					event$1.dispose(`All sources completed`);
				}
			} else if (messageHasValue(message)) {
				data[index] = message.value;
				event$1.set([...data]);
			}
		});
	}
	return {
		dispose: event$1.dispose,
		isDisposed: event$1.isDisposed,
		on: event$1.on,
		onValue: event$1.onValue
	};
}

//#endregion
//#region packages/rx/src/from/object.ts
function object(initialValue, options = {}) {
	const eq = options.eq ?? isEqualContextString;
	const setEvent = initStream();
	const diffEvent = initStream();
	const fieldChangeEvents = [];
	let value = initialValue;
	let disposed = false;
	const set$4 = (v) => {
		const diff = [...compareData(value ?? {}, v, {
			...options,
			includeMissingFromA: true
		})];
		if (diff.length === 0) return;
		value = v;
		setEvent.set(v);
		diffEvent.set(diff);
	};
	const fireFieldUpdate = (field$1, value$1) => {
		for (const [matcher, pattern, list] of fieldChangeEvents) if (matcher(field$1)) list.notify({
			fieldName: field$1,
			pattern,
			value: value$1
		});
	};
	const updateCompareOptions = {
		asPartial: true,
		includeParents: true
	};
	const update = (toMerge) => {
		if (value === void 0) {
			value = toMerge;
			setEvent.set(value);
			for (const [k, v] of Object.entries(toMerge)) fireFieldUpdate(k, v);
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
			for (const d$1 of diff) fireFieldUpdate(d$1.path, d$1.value);
			return value;
		}
	};
	const updateField = (path, valueForField) => {
		if (value === void 0) throw new Error(`Cannot update value when it has not already been set`);
		const existing = getField(value, path);
		if (!throwResult(existing)) return;
		if (eq(existing.value, valueForField, path)) return;
		let diff = [...compareData(existing.value, valueForField, {
			...options,
			includeMissingFromA: true
		})];
		diff = diff.map((d$1) => {
			if (d$1.path.length > 0) return {
				...d$1,
				path: path + `.` + d$1.path
			};
			return {
				...d$1,
				path
			};
		});
		const o = updateByPath(value, path, valueForField, true);
		value = o;
		setEvent.set(o);
		diffEvent.set(diff);
		fireFieldUpdate(path, valueForField);
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
		updateField,
		last: () => value,
		on: setEvent.on,
		onValue: setEvent.onValue,
		onDiff: diffEvent.onValue,
		onField(fieldPattern, handler) {
			const matcher = wildcard(fieldPattern);
			const listeners = new DispatchList();
			fieldChangeEvents.push([
				matcher,
				fieldPattern,
				listeners
			]);
			const id = listeners.add(handler);
			return () => listeners.remove(id);
		},
		set: set$4,
		update
	};
}

//#endregion
//#region packages/rx/src/ops/combine-latest-to-object.ts
function combineLatestToObject(reactiveSources, options = {}) {
	const disposeSources = options.disposeSources ?? true;
	const event$1 = object(void 0);
	const onSourceDone = options.onSourceDone ?? `break`;
	const emitInitial = options.emitInitial ?? true;
	let emitInitialDone = false;
	const states = new Map();
	for (const [key, source] of Object.entries(reactiveSources)) {
		const initialData = `last` in source ? source.last() : void 0;
		const s = {
			source: resolveSource(source),
			done: false,
			data: initialData,
			off: () => {}
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
			const d$1 = state.data;
			if (d$1 !== void 0) r[key] = state.data;
		}
		return r;
	};
	const trigger = () => {
		emitInitialDone = true;
		const d$1 = getData();
		event$1.set(d$1);
	};
	const wireUpState = (state) => {
		state.off = state.source.on((message) => {
			if (messageIsDoneSignal(message)) {
				state.done = true;
				state.off();
				state.off = () => {};
				if (onSourceDone === `break`) {
					unsub();
					event$1.dispose(`Source has completed and 'break' is behaviour`);
					return;
				}
				if (!someUnfinished()) {
					unsub();
					event$1.dispose(`All sources completed`);
				}
			} else if (messageHasValue(message)) {
				state.data = message.value;
				trigger();
			}
		});
	};
	for (const state of states.values()) wireUpState(state);
	if (!emitInitialDone && emitInitial) trigger();
	return {
		...event$1,
		hasSource(field$1) {
			return states.has(field$1);
		},
		replaceSource(field$1, source) {
			const state = states.get(field$1);
			if (state === void 0) throw new Error(`Field does not exist: '${field$1}'`);
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
			event$1.dispose(reason);
			if (disposeSources) for (const v of states.values()) v.source.dispose(`Part of disposed mergeToObject`);
		}
	};
}

//#endregion
//#region packages/rx/src/ops/compute-with-previous.ts
function computeWithPrevious(input, fn) {
	let previousValue;
	let currentValue;
	if (hasLast$1(input)) currentValue = previousValue = input.last();
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

//#endregion
//#region packages/rx/src/reactives/debounce.ts
function debounce$1(source, options = {}) {
	const elapsed$2 = intervalToMs(options.elapsed, 50);
	let lastValue;
	const timer = timeout(() => {
		const v = lastValue;
		if (v) {
			upstream.set(v);
			lastValue = void 0;
		}
	}, elapsed$2);
	const upstream = initUpstream(source, {
		...options,
		onValue(value) {
			lastValue = value;
			timer.start();
		}
	});
	return toReadable(upstream);
}

//#endregion
//#region packages/rx/src/ops/debounce.ts
function debounce(options) {
	return (source) => {
		return debounce$1(source, options);
	};
}

//#endregion
//#region packages/rx/src/ops/elapsed.ts
const elapsed = (input) => {
	let last$1 = 0;
	return transform(input, (_ignored) => {
		const elapsed$2 = last$1 === 0 ? 0 : Date.now() - last$1;
		last$1 = Date.now();
		return elapsed$2;
	});
};

//#endregion
//#region packages/rx/src/ops/field.ts
function field(fieldSource, fieldName, options = {}) {
	const fallbackFieldValue = options.fallbackFieldValue;
	const fallbackObject = options.fallbackObject;
	const upstream = initUpstream(fieldSource, {
		disposeIfSourceDone: true,
		...options,
		onValue(value) {
			let v;
			if (fieldName in value) v = value[fieldName];
			else if (fallbackObject && fieldName in fallbackObject) v = fallbackObject[fieldName];
			if (v === void 0) v = fallbackFieldValue;
			if (v !== void 0) upstream.set(v);
		}
	});
	return toReadable(upstream);
}

//#endregion
//#region packages/rx/src/ops/filter.ts
function filter(input, predicate, options) {
	const upstream = initUpstream(input, {
		...options,
		onValue(value) {
			if (predicate(value)) upstream.set(value);
		}
	});
	return toReadable(upstream);
}
function drop(input, predicate, options) {
	const upstream = initUpstream(input, {
		...options,
		onValue(value) {
			if (!predicate(value)) upstream.set(value);
		}
	});
	return toReadable(upstream);
}

//#endregion
//#region packages/rx/src/ops/interpolate.ts
function interpolate(input, options = {}) {
	const amount = options.amount ?? .1;
	const snapAt = options.snapAt ?? .99;
	const index = interpolate$1(amount, options);
	return computeWithPrevious(input, (previous, target) => {
		const v = index(previous, target);
		if (target > previous) {
			if (v / target >= snapAt) return target;
		}
		return v;
	});
}
/**
* From the basis of an input stream of values, run a function over
* each value. The function takes in the last value from the stream as well as the current.
* @param input
* @param fn
* @returns
*/

//#endregion
//#region packages/process/src/basic.ts
const max$1 = () => {
	let max$5 = Number.MIN_SAFE_INTEGER;
	const compute = (value) => {
		const valueArray = Array.isArray(value) ? value : [value];
		for (const subValue of valueArray) {
			if (typeof subValue !== `number`) break;
			max$5 = Math.max(subValue, max$5);
		}
		return max$5;
	};
	return compute;
};
const min$1 = () => {
	let min$4 = Number.MAX_SAFE_INTEGER;
	const compute = (value) => {
		const valueArray = Array.isArray(value) ? value : [value];
		for (const subValue of valueArray) {
			if (typeof subValue !== `number`) break;
			min$4 = Math.min(subValue, min$4);
		}
		return min$4;
	};
	return compute;
};
const sum$1 = () => {
	let t$1 = 0;
	const compute = (value) => {
		const valueArray = Array.isArray(value) ? value : [value];
		for (const subValue of valueArray) {
			if (typeof subValue !== `number`) continue;
			t$1 += subValue;
		}
		return t$1;
	};
	return compute;
};
const average$1 = () => {
	let total$1 = 0;
	let tally$2 = 0;
	const compute = (value) => {
		const valueArray = Array.isArray(value) ? value : [value];
		for (const subValue of valueArray) {
			if (typeof subValue !== `number`) continue;
			tally$2++;
			total$1 += subValue;
		}
		return total$1 / tally$2;
	};
	return compute;
};
const tally$1 = (countArrayItems) => {
	let t$1 = 0;
	const compute = (value) => {
		if (countArrayItems) if (Array.isArray(value)) t$1 += value.length;
		else t$1++;
		else t$1++;
		return t$1;
	};
	return compute;
};
function rank$1(r, options = {}) {
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
			} else if (result === `eq` && emitEqualRanked) return best;
			else if (emitRepeatHighest) return best;
		}
	};
}

//#endregion
//#region packages/rx/src/ops/math.ts
function max(input, options) {
	const p$1 = max$1();
	return process(p$1, `max`, input, options);
}
function min(input, options) {
	const p$1 = min$1();
	return process(p$1, `min`, input, options);
}
function average(input, options) {
	const p$1 = average$1();
	return process(p$1, `average`, input, options);
}
function sum(input, options) {
	const p$1 = sum$1();
	return process(p$1, `sum`, input, options);
}
function tally(input, options = {}) {
	const countArrayItems = options.countArrayItems ?? true;
	const p$1 = tally$1(countArrayItems);
	return process(p$1, `tally`, input, options);
}
function rank(input, rank$2, options) {
	const p$1 = rank$1(rank$2, options);
	return process(p$1, `rank`, input, options);
}
function process(processor, annotationField, input, options = {}) {
	const annotate$1 = options.annotate;
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
			if (annotate$1) {
				const ret = { value };
				ret[annotationField] = x;
				upstream.set(ret);
			} else upstream.set(x);
		}
	});
	return toReadable(upstream);
}

//#endregion
//#region packages/rx/src/ops/pipe.ts
const pipe = (...streams) => {
	const event$1 = initStream();
	const unsubs = [];
	const performDispose = (reason) => {
		for (const s of streams) if (!s.isDisposed) s.dispose(reason);
		for (const s of unsubs) s();
		event$1.dispose(reason);
	};
	for (let index = 0; index < streams.length; index++) unsubs.push(streams[index].on((message) => {
		const isLast = index === streams.length - 1;
		if (messageHasValue(message)) if (isLast) event$1.set(message.value);
		else streams[index + 1].set(message.value);
		else if (messageIsDoneSignal(message)) performDispose(`Upstream disposed`);
	}));
	return {
		on: event$1.on,
		onValue: event$1.onValue,
		dispose(reason) {
			performDispose(reason);
		},
		isDisposed() {
			return event$1.isDisposed();
		}
	};
};

//#endregion
//#region packages/rx/src/ops/single-from-array.ts
function singleFromArray(source, options = {}) {
	const order = options.order ?? `default`;
	if (!options.at && !options.predicate) throw new Error(`Options must have 'predicate' or 'at' fields`);
	let preprocess = (values$1) => values$1;
	if (order === `random`) preprocess = shuffle;
	else if (typeof order === `function`) preprocess = (values$1) => values$1.toSorted(order);
	const upstream = initUpstream(source, { onValue(values$1) {
		values$1 = preprocess(values$1);
		if (options.predicate) {
			for (const v of values$1) if (options.predicate(v)) upstream.set(v);
		} else if (options.at) upstream.set(values$1.at(options.at));
	} });
	return upstream;
}

//#endregion
//#region packages/rx/src/ops/split.ts
const split = (rxOrSource, options = {}) => {
	const quantity = options.quantity ?? 2;
	const outputs = [];
	const source = resolveSource(rxOrSource);
	for (let index = 0; index < quantity; index++) outputs.push(initUpstream(source, {
		disposeIfSourceDone: true,
		lazy: `initial`
	}));
	return outputs;
};
const splitLabelled = (rxOrSource, labels) => {
	const source = resolveSource(rxOrSource);
	const t$1 = {};
	for (const label of labels) t$1[label] = initUpstream(source, {
		lazy: `initial`,
		disposeIfSourceDone: true
	});
	return t$1;
};

//#endregion
//#region packages/rx/src/ops/switcher.ts
const switcher = (reactiveOrSource, cases, options = {}) => {
	const match = options.match ?? `first`;
	const source = resolveSource(reactiveOrSource);
	let disposed = false;
	const t$1 = {};
	for (const label of Object.keys(cases)) t$1[label] = initStream();
	const performDispose = () => {
		if (disposed) return;
		unsub();
		disposed = true;
		for (const stream$1 of Object.values(t$1)) stream$1.dispose(`switcher source dispose`);
	};
	const unsub = source.on((message) => {
		if (messageHasValue(message)) {
			for (const [lbl, pred] of Object.entries(cases)) if (pred(message.value)) {
				t$1[lbl].set(message.value);
				if (match === `first`) break;
			}
		} else if (messageIsDoneSignal(message)) performDispose();
	});
	return t$1;
};

//#endregion
//#region packages/rx/src/ops/sync-to-array.ts
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
		unsub: () => {}
	}));
	const unsubscribe = () => {
		for (const s of states) {
			s.unsub();
			s.unsub = () => {};
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
		event$1.dispose(reason);
	};
	const init$2 = () => {
		watchdog = setTimeout(onWatchdog, maximumWait);
		for (const [index, state] of states.entries()) {
			data[index] = void 0;
			state.unsub = state.source.on((valueChanged) => {
				if (messageIsSignal(valueChanged)) {
					if (valueChanged.signal === `done`) {
						state.finalData = data[index];
						state.unsub();
						state.done = true;
						state.unsub = () => {};
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
					event$1.set([...data]);
					resetDataSet();
					if (watchdog) clearTimeout(watchdog);
					watchdog = setTimeout(onWatchdog, maximumWait);
				}
			});
		}
	};
	const event$1 = initStream({
		onFirstSubscribe() {
			unsubscribe();
			init$2();
		},
		onNoSubscribers() {
			if (watchdog) clearTimeout(watchdog);
			unsubscribe();
		}
	});
	return {
		dispose: event$1.dispose,
		isDisposed: event$1.isDisposed,
		on: event$1.on,
		onValue: event$1.onValue
	};
}

//#endregion
//#region packages/rx/src/ops/sync-to-object.ts
function syncToObject(reactiveSources, options = {}) {
	const keys = Object.keys(reactiveSources);
	const values$1 = Object.values(reactiveSources);
	const s = syncToArray(values$1, options);
	const st = transform(s, (streamValues) => {
		return zipKeyValue(keys, streamValues);
	});
	return st;
}

//#endregion
//#region packages/rx/src/ops/tap.ts
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
const tapOps = (input, ...ops) => {
	for (const op of ops) input = op(input);
	return input;
};

//#endregion
//#region packages/rx/src/ops/throttle.ts
function throttle(throttleSource, options = {}) {
	const elapsed$2 = intervalToMs(options.elapsed, 0);
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
		if (elapsed$2 > 0 && now - lastFire > elapsed$2) {
			lastFire = now;
			if (lastValue !== void 0) upstream.set(lastValue);
		}
	};
	return toReadable(upstream);
}

//#endregion
//#region packages/rx/src/ops/timeout-value.ts
function timeoutValue(source, options) {
	let timer;
	const immediate = options.immediate ?? true;
	const repeat$1 = options.repeat ?? false;
	const timeoutMs = intervalToMs(options.interval, 1e3);
	if (!isTrigger(options)) throw new Error(`Param 'options' does not contain trigger 'value' or 'fn' fields`);
	const sendFallback = () => {
		const [value, done] = resolveTriggerValue(options);
		if (done) events.dispose(`Trigger completed`);
		else {
			if (events.isDisposed()) return;
			events.set(value);
			if (repeat$1) timer = setTimeout(sendFallback, timeoutMs);
		}
	};
	const events = initUpstream(source, {
		disposeIfSourceDone: true,
		onValue(v) {
			if (timer) clearTimeout(timer);
			timer = setTimeout(sendFallback, timeoutMs);
			events.set(v);
		},
		onDispose() {
			if (timer) clearTimeout(timer);
		}
	});
	if (immediate && !timer) timer = setTimeout(sendFallback, timeoutMs);
	return events;
}

//#endregion
//#region packages/rx/src/ops/timeout-ping.ts
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

//#endregion
//#region packages/rx/src/ops/value-to-ping.ts
function valueToPing(source, target, options = {}) {
	const lazy = options.lazy ?? `initial`;
	const signal = options.signal;
	const sourceRx = resolveSource(source);
	const gate = options.gate ?? ((value) => true);
	let upstreamOff;
	let downstreamOff;
	if (signal) signal.addEventListener(`abort`, () => {
		done(`Abort signal ${signal.reason}`);
	}, { once: true });
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
			if (messageIsDoneSignal(message)) done(`Upstream closed`);
			else if (messageIsSignal(message)) events.signal(message.signal);
			else if (messageHasValue(message)) {
				if (gate(message.value)) target.ping();
			}
		});
		downstreamOff = target.on((message) => {
			if (messageIsDoneSignal(message)) done(`Downstream closed`);
			else if (messageIsSignal(message)) events.signal(message.signal, message.context);
			else if (messageHasValue(message)) events.set(message.value);
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

//#endregion
//#region packages/rx/src/ops/with-value.ts
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

//#endregion
//#region packages/rx/src/graph.ts
function prepare(_rx) {
	let g$1 = graph();
	const nodes = new Map();
	const events = initStream();
	const process$1 = (o, path) => {
		for (const [key, value] of Object.entries(o)) {
			const subPath = path + `.` + key;
			g$1 = connect(g$1, {
				from: path,
				to: subPath
			});
			if (isReactive$1(value)) {
				nodes.set(subPath, {
					value,
					type: `rx`
				});
				value.on((v) => {
					console.log(`Rx.prepare value: ${JSON.stringify(v)} path: ${subPath}`);
				});
			} else {
				const valueType = typeof value;
				if (valueType === `bigint` || valueType === `boolean` || valueType === `number` || valueType === `string`) nodes.set(subPath, {
					type: `primitive`,
					value
				});
				else if (valueType === `object`) process$1(value, subPath);
				else if (valueType === `function`) console.log(`Rx.process - not handling functions`);
			}
		}
	};
	const returnValue = {
		dispose: events.dispose,
		isDisposed: events.isDisposed,
		graph: g$1,
		on: events.on,
		onValue: events.onValue
	};
	return returnValue;
}

//#endregion
//#region packages/rx/src/types.ts
const symbol = Symbol(`Rx`);

//#endregion
//#region packages/rx/src/to-array.ts
async function toArray(source, options = {}) {
	const limit = options.limit ?? Number.MAX_SAFE_INTEGER;
	const maximumWait = intervalToMs(options.maximumWait, 10 * 1e3);
	const underThreshold = options.underThreshold ?? `partial`;
	const read = [];
	const rx = resolveSource(source);
	const promise = new Promise((resolve$1, reject) => {
		const done = () => {
			clearTimeout(maxWait);
			unsub();
			if (read.length < limit && underThreshold === `throw`) {
				reject(new Error(`Threshold not reached. Wanted: ${limit} got: ${read.length}. Maximum wait: ${maximumWait}`));
				return;
			}
			if (read.length < limit && underThreshold === `fill`) {
				for (let index = 0; index < limit; index++) if (read[index] === void 0) read[index] = options.fillValue;
			}
			resolve$1(read);
		};
		const maxWait = setTimeout(() => {
			done();
		}, maximumWait);
		const unsub = rx.on((message) => {
			if (messageIsDoneSignal(message)) done();
			else if (messageHasValue(message)) {
				read.push(message.value);
				if (read.length === limit) done();
			}
		});
	});
	return promise;
}
async function toArrayOrThrow(source, options = {}) {
	const limit = options.limit ?? Number.MAX_SAFE_INTEGER;
	const maximumWait = options.maximumWait ?? 5 * 1e3;
	const v = await toArray(source, {
		limit,
		maximumWait,
		underThreshold: `partial`
	});
	if (options.limit && v.length < options.limit) throw new Error(`Threshold not reached. Wanted: ${options.limit}, got ${v.length}`);
	return v;
}

//#endregion
//#region packages/rx/src/to-generator.ts
async function* toGenerator(source) {
	const s = resolveSource(source);
	let promiseResolve = (_) => {};
	let promiseReject = (_) => {};
	const promiseInit = () => new Promise((resolve$1, reject) => {
		promiseResolve = resolve$1;
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
	while (keepRunning) yield await promise;
}

//#endregion
//#region packages/rx/src/wrap.ts
function wrap(source) {
	return {
		source: resolveSource(source),
		enacts: { setHtmlText: (options) => {
			return setHtmlText(source, options);
		} },
		annotate: (transformer) => {
			const a$1 = annotate(source, transformer);
			return wrap(a$1);
		},
		annotateWithOp: (op) => {
			const a$1 = annotateWithOp(source, op);
			return wrap(a$1);
		},
		chunk: (options) => {
			const w = wrap(chunk(source, options));
			return w;
		},
		debounce: (options = {}) => {
			return wrap(debounce$1(source, options));
		},
		field: (fieldName, options = {}) => {
			const f = field(source, fieldName, options);
			return wrap(f);
		},
		filter: (predicate, options) => {
			return wrap(filter(source, predicate, options));
		},
		combineLatestToArray: (sources, options = {}) => {
			const srcs = [source, ...sources];
			return wrap(combineLatestToArray(srcs, options));
		},
		combineLatestToObject: (sources, options) => {
			const name = options.name ?? `source`;
			const o = { ...sources };
			o[name] = source;
			return wrap(combineLatestToObject(o, options));
		},
		min: (options = {}) => {
			return wrap(min(source, options));
		},
		max: (options = {}) => {
			return wrap(max(source, options));
		},
		average: (options = {}) => {
			return wrap(average(source, options));
		},
		sum: (options = {}) => {
			return wrap(sum(source, options));
		},
		tally: (options = {}) => {
			return wrap(tally(source, options));
		},
		split: (options = {}) => {
			const streams = split(source, options).map((v) => wrap(v));
			return streams;
		},
		splitLabelled: (...labels) => {
			const l = splitLabelled(source, labels);
			const m$1 = mapObjectShallow(l, (args) => wrap(args.value));
			return m$1;
		},
		switcher: (cases, options = {}) => {
			const s = switcher(source, cases, options);
			const m$1 = mapObjectShallow(s, (args) => wrap(args.value));
			return m$1;
		},
		syncToArray: (additionalSources, options = {}) => {
			const unwrapped = [source, ...additionalSources].map((v) => resolveSource(v));
			const x = syncToArray(unwrapped, options);
			return wrap(x);
		},
		syncToObject: (sources, options = {}) => {
			const name = options.name ?? `source`;
			const o = { ...sources };
			o[name] = source;
			return wrap(syncToObject(o, options));
		},
		tapProcess: (...processors) => {
			tapProcess(source, ...processors);
			return wrap(source);
		},
		tapStream: (divergedStream) => {
			tapStream(source, divergedStream);
			return wrap(source);
		},
		tapOps: (source$1, ...ops) => {
			tapOps(source$1, ...ops);
			return wrap(source$1);
		},
		throttle: (options = {}) => {
			return wrap(throttle(source, options));
		},
		transform: (transformer, options = {}) => {
			return wrap(transform(source, transformer, options));
		},
		timeoutValue: (options) => {
			return wrap(timeoutValue(source, options));
		},
		timeoutPing: (options) => {
			return wrap(timeoutPing(source, options));
		},
		toArray: (options) => {
			return toArray(source, options);
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

//#endregion
//#region packages/rx/src/from/array.ts
const of = (source, options = {}) => {
	if (Array.isArray(source)) return array(source, options);
};
const array = (sourceArray, options = {}) => {
	const lazy = options.lazy ?? `initial`;
	const signal = options.signal;
	const whenStopped = options.whenStopped ?? `continue`;
	const debugLifecycle = options.debugLifecycle ?? false;
	const array$2 = [...sourceArray];
	if (lazy !== `very` && whenStopped === `reset`) throw new Error(`whenStopped:'reset' has no effect with 'lazy:${lazy}'. Use lazy:'very' instead.`);
	const intervalMs = intervalToMs(options.interval, 5);
	let index = 0;
	let lastValue = array$2[0];
	const s = initLazyStream({
		...options,
		lazy,
		onStart() {
			if (debugLifecycle) console.log(`Rx.readFromArray:onStart`);
			c$1.start();
		},
		onStop() {
			if (debugLifecycle) console.log(`Rx.readFromArray:onStop. whenStopped: ${whenStopped} index: ${index}`);
			c$1.cancel();
			if (whenStopped === `reset`) index = 0;
		}
	});
	const c$1 = continuously(() => {
		if (signal?.aborted) {
			s.dispose(`Signalled (${signal.reason})`);
			return false;
		}
		lastValue = array$2[index];
		index++;
		s.set(lastValue);
		if (index === array$2.length) {
			s.dispose(`Source array complete`);
			return false;
		}
	}, intervalMs);
	if (!lazy) c$1.start();
	return {
		dispose: s.dispose,
		isDisposed: s.isDisposed,
		isDone() {
			return index === array$2.length;
		},
		last() {
			return lastValue;
		},
		on: s.on,
		onValue: s.onValue
	};
};

//#endregion
//#region packages/rx/src/from/array-object.ts
function arrayObject(initialValue = [], options = {}) {
	const eq = options.eq ?? isEqualValueDefault;
	const setEvent = initStream();
	const arrayEvent = initStream();
	let value = initialValue;
	let disposed = false;
	const set$4 = (replacement) => {
		const diff = compareArrays(value, replacement, eq);
		value = replacement;
		setEvent.set([...replacement]);
	};
	const setAt = (index, v) => {
		value[index] = v;
		setEvent.set([...value]);
	};
	const push$1 = (v) => {
		value = [...value, v];
		setEvent.set([...value]);
		const cr = [
			`add`,
			value.length - 1,
			v
		];
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
	const deleteWhere = (filter$1) => {
		const valueChanged = value.filter((v) => !filter$1(v));
		const count$2 = value.length - valueChanged.length;
		const diff = compareArrays(value, valueChanged, eq);
		value = valueChanged;
		setEvent.set([...value]);
		arrayEvent.set(diff.summary);
		return count$2;
	};
	const insertAt$1 = (index, v) => {
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
		push: push$1,
		deleteAt,
		deleteWhere,
		insertAt: insertAt$1,
		set: set$4
	};
	return r;
}

//#endregion
//#region packages/rx/src/from/boolean.ts
function boolean(initialValue) {
	let value = initialValue;
	const events = initStream();
	const set$4 = (v) => {
		value = v;
		events.set(v);
	};
	return {
		dispose: events.dispose,
		isDisposed: events.isDisposed,
		last: () => value,
		on: events.on,
		onValue: events.onValue,
		set: set$4
	};
}

//#endregion
//#region packages/rx/src/from/count.ts
function count$1(options = {}) {
	const lazy = options.lazy ?? `initial`;
	const interval = intervalToMs(options.interval, 1e3);
	const amount = options.amount ?? 1;
	const offset$1 = options.offset ?? 0;
	let produced = 0;
	let value = offset$1;
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

//#endregion
//#region packages/rx/src/from/derived.ts
function derived(fn, reactiveSources, options = {}) {
	const ignoreIdentical = options.ignoreIdentical ?? true;
	const eq = options.eq ?? isEqualValueDefault;
	const sources = combineLatestToObject(reactiveSources);
	const handle = (v) => {
		const last$1 = output.last();
		const vv = fn(v);
		if (vv !== void 0) {
			if (ignoreIdentical && last$1 !== void 0) {
				if (eq(vv, last$1)) return vv;
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

//#endregion
//#region packages/rx/src/from/event.ts
function eventField(targetOrQuery, eventName, fieldName, initialValue, options = {}) {
	const initial = {};
	initial[fieldName] = initialValue;
	const rxField = field(event(targetOrQuery, eventName, initial, options), fieldName, options);
	return rxField;
}
function event(targetOrQuery, name, initialValue, options = {}) {
	let target;
	if (typeof targetOrQuery === `string`) {
		target = document.querySelector(targetOrQuery);
		if (target === null) throw new Error(`Target query did not resolve to an element. Query: '${targetOrQuery}'`);
	} else target = targetOrQuery;
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
	const remove$1 = () => {
		if (!eventAdded) return;
		eventAdded = false;
		target.removeEventListener(name, callback);
		if (debugLifecycle) console.log(`Rx.From.event remove '${name}'`);
	};
	const add$1 = () => {
		if (eventAdded) return;
		eventAdded = true;
		target.addEventListener(name, callback);
		if (debugLifecycle) console.log(`Rx.From.event add '${name}'`);
	};
	if (!lazy) add$1();
	return {
		last: () => {
			if (lazy) add$1();
			return rxObject.last();
		},
		dispose: (reason) => {
			if (disposed) return;
			disposed = true;
			remove$1();
			rxObject.dispose(reason);
		},
		isDisposed() {
			return disposed;
		},
		on: (handler) => {
			if (lazy) add$1();
			return rxObject.on(handler);
		},
		onValue: (handler) => {
			if (lazy) add$1();
			return rxObject.onValue(handler);
		}
	};
}
function eventTrigger(targetOrQuery, name, options = {}) {
	let target;
	if (typeof targetOrQuery === `string`) {
		target = document.querySelector(targetOrQuery);
		if (target === null) throw new Error(`Target query did not resolve to an element. Query: '${targetOrQuery}'`);
	} else target = targetOrQuery;
	if (target === null) throw new Error(`Param 'targetOrQuery' is null`);
	const debugLifecycle = options.debugLifecycle ?? false;
	const debugFiring = options.debugFiring ?? false;
	const fireInitial = options.fireInitial ?? false;
	let count$2 = 0;
	const elapsed$2 = elapsedInterval();
	const stream$1 = initLazyStream({
		lazy: options.lazy ?? `very`,
		onStart() {
			target.addEventListener(name, callback);
			if (debugLifecycle) console.log(`Rx.From.eventTrigger add '${name}'`);
			if (fireInitial && count$2 === 0) {
				if (debugLifecycle || debugFiring) console.log(`Rx.From.eventTrigger: firing initial`);
				callback();
			}
		},
		onStop() {
			target.removeEventListener(name, callback);
			if (debugLifecycle) console.log(`Rx.From.eventTrigger remove '${name}'`);
		}
	});
	const callback = (_args) => {
		if (debugFiring) console.log(`Rx.From.eventTrigger '${name}' triggered'`);
		stream$1.set({
			sinceLast: elapsed$2(),
			total: ++count$2
		});
	};
	return stream$1;
}

//#endregion
//#region packages/rx/src/from/merged.ts
function merged(...sources) {
	return mergedWithOptions(sources);
}
function mergedWithOptions(sources, options = {}) {
	let unsubs = [];
	const stream$1 = initLazyStream({
		...options,
		onStart() {
			for (const s of sources) unsubs.push(s.onValue((v) => {
				stream$1.set(v);
			}));
		},
		onStop() {
			for (const un of unsubs) un();
			unsubs = [];
		}
	});
	return stream$1;
}

//#endregion
//#region packages/rx/src/from/number.ts
function number(initialValue) {
	let value = initialValue;
	const events = initStream();
	const set$4 = (v) => {
		value = v;
		events.set(v);
	};
	return {
		dispose: events.dispose,
		isDisposed: events.isDisposed,
		last: () => value,
		on: events.on,
		onValue: events.onValue,
		set: set$4
	};
}

//#endregion
//#region packages/rx/src/from/object-proxy.ts
const objectProxy = (target) => {
	const rx = object(target);
	const proxy = new Proxy(target, { set(target$1, p$1, newValue, _receiver) {
		const isArray = Array.isArray(target$1);
		if (isArray && p$1 === `length`) return true;
		if (typeof p$1 === `string`) rx.updateField(p$1, newValue);
		if (isArray && typeof p$1 === `string`) {
			const pAsNumber = Number.parseInt(p$1);
			if (!Number.isNaN(pAsNumber)) {
				target$1[pAsNumber] = newValue;
				return true;
			}
		}
		target$1[p$1] = newValue;
		return true;
	} });
	return {
		proxy,
		rx
	};
};
const arrayProxy = (target) => {
	const rx = arrayObject(target);
	const proxy = new Proxy(target, { set(target$1, p$1, newValue, _receiver) {
		if (p$1 === `length`) return true;
		if (typeof p$1 !== `string`) throw new Error(`Expected numeric index, got type: ${typeof p$1} value: ${JSON.stringify(p$1)}`);
		const pAsNumber = Number.parseInt(p$1);
		if (!Number.isNaN(pAsNumber)) {
			rx.setAt(pAsNumber, newValue);
			target$1[pAsNumber] = newValue;
			return true;
		} else throw new Error(`Expected numeric index, got: '${p$1}'`);
	} });
	return {
		proxy,
		rx
	};
};
const objectProxySymbol = (target) => {
	const { proxy, rx } = objectProxy(target);
	const p$1 = proxy;
	p$1[symbol] = rx;
	return p$1;
};

//#endregion
//#region packages/rx/src/from/observable.ts
function observable(init$2) {
	const ow = observableWritable(init$2);
	return {
		dispose: ow.dispose,
		isDisposed: ow.isDisposed,
		on: ow.on,
		onValue: ow.onValue
	};
}
function observableWritable(init$2) {
	let onCleanup = () => {};
	const ow = manual({
		onFirstSubscribe() {
			onCleanup = init$2(ow);
		},
		onNoSubscribers() {
			if (onCleanup) onCleanup();
		}
	});
	return {
		...ow,
		onValue: (callback) => {
			return ow.on((message) => {
				if (messageHasValue(message)) callback(message.value);
			});
		}
	};
}

//#endregion
//#region packages/rx/src/from/string.ts
function string(initialValue) {
	let value = initialValue;
	const events = initStream();
	const set$4 = (v) => {
		value = v;
		events.set(v);
	};
	return {
		dispose: events.dispose,
		isDisposed: events.isDisposed,
		last: () => value,
		on: events.on,
		onValue: events.onValue,
		set: set$4
	};
}

//#endregion
//#region packages/rx/src/from/index.ts
var from_exports = {};
__export(from_exports, {
	array: () => array,
	arrayObject: () => arrayObject,
	arrayProxy: () => arrayProxy,
	boolean: () => boolean,
	count: () => count$1,
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

//#endregion
//#region packages/rx/src/index.ts
function run(source, ...ops) {
	let s = resolveSource(source);
	for (const op of ops) s = op(s);
	return s;
}
function writable(source, ...ops) {
	let s = resolveSource(source);
	const head = s;
	for (const op of ops) s = op(s);
	const ss = s;
	return {
		...ss,
		set(value) {
			if (isWritable(head)) head.set(value);
			else throw new Error(`Original source is not writable`);
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
const Sinks = { setHtmlText: (options) => {
	return (source) => {
		setHtmlText(source, options);
	};
} };
const Ops = {
	annotate: (annotator) => opify(annotate, annotator),
	annotateWithOp: (annotatorOp) => opify(annotateWithOp, annotatorOp),
	chunk: (options) => {
		return (source) => {
			return chunk(source, options);
		};
	},
	cloneFromFields: () => {
		return (source) => {
			return cloneFromFields(source);
		};
	},
	combineLatestToArray: (options = {}) => {
		return (sources) => {
			return combineLatestToArray(sources, options);
		};
	},
	combineLatestToObject: (options = {}) => {
		return (reactiveSources) => {
			return combineLatestToObject(reactiveSources, options);
		};
	},
	drop: (predicate) => opify(drop, predicate),
	elapsed: () => opify(elapsed),
	field: (fieldName, options) => {
		return (source) => {
			return field(source, fieldName, options);
		};
	},
	filter: (predicate) => opify(filter, predicate),
	interpolate: (options) => opify(interpolate, options),
	min: (options) => opify(min, options),
	max: (options) => opify(max, options),
	sum: (options) => opify(sum, options),
	average: (options) => opify(average, options),
	tally: (options) => opify(tally, options),
	rank: (rank$2, options) => opify(rank, rank$2, options),
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
	throttle: (options) => opify(throttle, options),
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
	withValue: (opts) => {
		return opify(withValue, opts);
	}
};
async function takeNextValue(source, maximumWait = 1e3) {
	const rx = resolveSource(source);
	let off = () => {};
	let watchdog;
	const p$1 = new Promise((resolve$1, reject) => {
		off = rx.on((message) => {
			if (watchdog) clearTimeout(watchdog);
			if (messageHasValue(message)) {
				off();
				resolve$1(message.value);
			} else if (messageIsDoneSignal(message)) {
				reject(new Error(`Source closed. ${message.context ?? ``}`));
				off();
			}
		});
		watchdog = setTimeout(() => {
			watchdog = void 0;
			off();
			reject(new Error(`Timeout waiting for value (${JSON.stringify(maximumWait)})`));
		}, intervalToMs(maximumWait));
	});
	return p$1;
}
const to = (a$1, b$2, transform$1, closeBonA = false) => {
	const unsub = a$1.on((message) => {
		if (messageHasValue(message)) {
			const value = transform$1 ? transform$1(message.value) : message.value;
			b$2.set(value);
		} else if (messageIsDoneSignal(message)) {
			unsub();
			if (closeBonA) b$2.dispose(`Source closed (${message.context ?? ``})`);
		}
	});
	return unsub;
};

//#endregion
//#region packages/ixfx/src/rx.ts
var rx_exports = {};
__export(rx_exports, {
	From: () => from_exports,
	Ops: () => Ops,
	Sinks: () => Sinks,
	annotate: () => annotate,
	annotateWithOp: () => annotateWithOp,
	average: () => average,
	cache: () => cache,
	chunk: () => chunk,
	cloneFromFields: () => cloneFromFields,
	combineLatestToArray: () => combineLatestToArray,
	combineLatestToObject: () => combineLatestToObject,
	computeWithPrevious: () => computeWithPrevious,
	debounce: () => debounce,
	drop: () => drop,
	elapsed: () => elapsed,
	field: () => field,
	filter: () => filter,
	hasLast: () => hasLast$1,
	initLazyStream: () => initLazyStream,
	initLazyStreamWithInitial: () => initLazyStreamWithInitial,
	initStream: () => initStream,
	initUpstream: () => initUpstream,
	interpolate: () => interpolate,
	isPingable: () => isPingable,
	isReactive: () => isReactive$1,
	isTrigger: () => isTrigger,
	isTriggerFunction: () => isTriggerFunction,
	isTriggerGenerator: () => isTriggerGenerator,
	isTriggerValue: () => isTriggerValue,
	isWrapped: () => isWrapped,
	isWritable: () => isWritable,
	manual: () => manual,
	max: () => max,
	messageHasValue: () => messageHasValue,
	messageIsDoneSignal: () => messageIsDoneSignal,
	messageIsSignal: () => messageIsSignal,
	min: () => min,
	opify: () => opify,
	pipe: () => pipe,
	prepare: () => prepare,
	rank: () => rank,
	resolveSource: () => resolveSource,
	resolveTriggerValue: () => resolveTriggerValue,
	run: () => run,
	setHtmlText: () => setHtmlText,
	singleFromArray: () => singleFromArray,
	split: () => split,
	splitLabelled: () => splitLabelled,
	sum: () => sum,
	switcher: () => switcher,
	symbol: () => symbol,
	syncToArray: () => syncToArray,
	syncToObject: () => syncToObject,
	takeNextValue: () => takeNextValue,
	tally: () => tally,
	tapOps: () => tapOps,
	tapProcess: () => tapProcess,
	tapStream: () => tapStream,
	throttle: () => throttle,
	timeoutPing: () => timeoutPing,
	timeoutValue: () => timeoutValue,
	to: () => to,
	toArray: () => toArray,
	toArrayOrThrow: () => toArrayOrThrow,
	toGenerator: () => toGenerator,
	transform: () => transform,
	valueToPing: () => valueToPing,
	withValue: () => withValue,
	wrap: () => wrap,
	writable: () => writable
});

//#endregion
export { src_exports as Arrays, src_exports$1 as Debug, dom_exports as Dom, geometry_exports as Geometry, modulation_exports as Modulation, numbers_exports as Numbers, rx_exports as Rx, visual_exports as Visual, align, alignById, compareIterableValuesShallow, comparerInverse, continuously, count, defaultComparer, defaultKeyer, defaultToString, elapsedInfinity, elapsedInterval, elapsedOnce, elapsedSince, elapsedToHumanString, filterValue, hasLast, intervalToMs, isEmptyEntries, isEqualContextString, isEqualDefault, isEqualTrace, isEqualValueDefault, isEqualValueIgnoreOrder, isEqualValuePartial, isInteger, isInterval, isMap, isPrimitive, isPrimitiveOrObject, isReactive, isSet, jsComparer, keyValueSorter, numericComparer, promiseFromEvent, resolve, resolveFields, resolveFieldsSync, resolveSync, resolveWithFallback, resolveWithFallbackSync, resultErrorToString, resultToError, resultToValue, runningiOS, sleep, sleepWhile, throwResult, toStringDefault, toStringOrdered, unique, uniqueInstances };