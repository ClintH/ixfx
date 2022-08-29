"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.mapToArray = exports.mapToObj = exports.transformMap = exports.zipKeyValue = exports.mapToObjTransform = exports.find = exports.toArray = exports.filter = exports.hasAnyValue = exports.addUniqueByHash = exports.getOrGenerateSync = exports.getOrGenerate = exports.hasKeyValue = void 0;
// ✔ UNIT TESTED!
/**
 * Returns true if map contains `value` under `key`, using `comparer` function. Use {@link hasAnyValue} if you don't care
 * what key value might be under.
 *
 * Having a comparer function is useful to check by value rather than object reference.
 *
 * @example Find key value based on string equality
 * ```js
 * hasKeyValue(map,`hello`, `samantha`, (a, b) => a === b);
 * ```
 * @param map Map to search
 * @param key Key to search
 * @param value Value to search
 * @param comparer Function to determine match
 * @returns True if key is found
 */
var hasKeyValue = function (map, key, value, comparer) {
    if (!map.has(key))
        return false;
    var values = Array.from(map.values());
    return values.some(function (v) { return comparer(v, value); });
};
exports.hasKeyValue = hasKeyValue;
/**
 * Returns a function that fetches a value from a map, or generates and sets it if not present.
 * Undefined is never returned, because if `fn` yields that, an error is thrown.
 *
 * See {@link getOrGenerateSync} for a synchronous version.
 *
 * ```
 * const m = getOrGenerate(new Map(), (key) => {
 *  return key.toUppercase();
 * });
 *
 * // Not contained in map, so it will run the uppercase function,
 * // setting the value to the key 'hello'.
 * const v = await m(`hello`);  // Yields 'HELLO'
 * const v1 = await m(`hello`); // Value exists, so it is returned ('HELLO')
 * ```
 *
 */
//eslint-disable-next-line functional/prefer-readonly-type
var getOrGenerate = function (map, fn) { return function (key, args) { return __awaiter(void 0, void 0, void 0, function () {
    var value;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                value = map.get(key);
                if (value !== undefined)
                    return [2 /*return*/, Promise.resolve(value)];
                return [4 /*yield*/, fn(key, args)];
            case 1:
                value = _a.sent();
                if (value === undefined)
                    throw new Error("fn returned undefined");
                map.set(key, value);
                return [2 /*return*/, value];
        }
    });
}); }; };
exports.getOrGenerate = getOrGenerate;
/**
 * @inheritDoc getOrGenerate
 * @param map
 * @param fn
 * @returns
 */
//eslint-disable-next-line functional/prefer-readonly-type
var getOrGenerateSync = function (map, fn) { return function (key, args) {
    //eslint-disable-next-line functional/no-let
    var value = map.get(key);
    if (value !== undefined)
        return value;
    value = fn(key, args);
    map.set(key, value);
    return value;
}; };
exports.getOrGenerateSync = getOrGenerateSync;
/**
 * Adds items to a map only if their key doesn't already exist
 *
 * Uses provided {@link Util.ToString} function to create keys for items. Item is only added if it doesn't already exist.
 * Thus the older item wins out, versus normal `Map.set` where the newest wins.
 *
 *
 * @example
 * ```js
 * const map = new Map();
 * const peopleArray = [ _some people objects..._];
 * addUniqueByHash(map, p => p.name, ...peopleArray);
 * ```
 * @param set
 * @param hashFunc
 * @param values
 * @returns
 */
var addUniqueByHash = function (set, hashFunc) {
    var values = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        values[_i - 2] = arguments[_i];
    }
    var s = set === undefined ? new Map() : new Map(set);
    values.forEach(function (v) {
        var vStr = hashFunc(v);
        if (s.has(vStr))
            return;
        s.set(vStr, v);
    });
    return s;
};
exports.addUniqueByHash = addUniqueByHash;
/**
 * Returns true if _any_ key contains `value`, based on the provided `comparer` function. Use {@link hasKeyValue}
 * if you only want to find a value under a certain key.
 *
 * Having a comparer function is useful to check by value rather than object reference.
 * @example Finds value where name is 'samantha', regardless of other properties
 * ```js
 * hasAnyValue(map, {name:`samantha`}, (a, b) => a.name === b.name);
 * ```
 *
 * Works by comparing `value` against all values contained in `map` for equality using the provided `comparer`.
 *
 * @param map Map to search
 * @param value Value to find
 * @param comparer Function that determines matching. Should return true if `a` and `b` are considered equal.
 * @returns True if value is found
 */
var hasAnyValue = function (map, value, comparer) {
    var entries = Array.from(map.entries());
    return entries.some(function (kv) { return comparer(kv[1], value); });
};
exports.hasAnyValue = hasAnyValue;
/**
 * Returns values where `predicate` returns true.
 *
 * If you just want the first match, use `find`
 *
 * @example All people over thirty
 * ```js
 * // for-of loop
 * for (const v of filter(people, person => person.age > 30)) {
 *
 * }
 * // If you want an array
 * const overThirty = Array.from(filter(people, person => person.age > 30));
 * ```
 * @param map Map
 * @param predicate Filtering predicate
 * @returns Values that match predicate
 */
//eslint-disable-next-line func-style
function filter(map, predicate) {
    var _i, _a, v;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _i = 0, _a = map.values();
                _b.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 4];
                v = _a[_i];
                if (!predicate(v)) return [3 /*break*/, 3];
                return [4 /*yield*/, v];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}
exports.filter = filter;
//export const filter = <V>(map:ReadonlyMap<string, V>, predicate:(v:V) => boolean):ReadonlyArray<V> => Array.from(map.values()).filter(predicate);
/**
 * Copies data to an array
 * @param map
 * @returns
 */
var toArray = function (map) { return Array.from(map.values()); };
exports.toArray = toArray;
/**
 * Returns the first found item that matches `predicate` or _undefined_.
 *
 * If you want all matches, use {@link filter}.
 *
 * @example First person over thirty
 * ```js
 * const overThirty = find(people, person => person.age > 30);
 * ```
 * @param map Map to search
 * @param predicate Function that returns true for a matching item
 * @returns Found item or _undefined_
 */
var find = function (map, predicate) { return Array.from(map.values()).find(function (vv) { return predicate(vv); }); };
exports.find = find;
/**
 * Converts a map to a simple object, transforming from type `T` to `K` as it does so. If no transforms are needed, use {@link mapToObj}.
 *
 * ```js
 * const map = new Map();
 * map.set(`name`, `Alice`);
 * map.set(`pet`, `dog`);
 *
 * const o = mapToObjTransform(map, v => {
 *  ...v,
 *  registered: true
 * });
 *
 * // Yields: { name: `Alice`, pet: `dog`, registered: true }
 * ```
 *
 * If the goal is to create a new map with transformed values, use {@link transformMap}.
 * @param m
 * @param valueTransform
 * @typeParam T Value type of input map
 * @typeParam K Value type of destination map
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
var mapToObjTransform = function (m, valueTransform) { return Array.from(m).reduce(function (obj, _a) {
    var key = _a[0], value = _a[1];
    var t = valueTransform(value);
    /* eslint-disable-next-line functional/immutable-data */
    obj[key] = t;
    return obj;
}, {}); };
exports.mapToObjTransform = mapToObjTransform;
/**
 * Zips together an array of keys and values into an object. Requires that
 * `keys` and `values` are the same length.
 *
 * @example
 * ```js
 * const o = zipKeyValue([`a`, `b`, `c`], [0, 1, 2])
 * Yields: { a: 0, b: 1, c: 2}
 *```
  * @param keys String keys
  * @param values Values
  * @typeParam V Type of values
  * @return Object with keys and values
  */
var zipKeyValue = function (keys, values) {
    if (keys.length !== values.length)
        throw new Error("Keys and values arrays should be same length");
    return Object.fromEntries(keys.map(function (k, i) { return [k, values[i]]; }));
};
exports.zipKeyValue = zipKeyValue;
//#region Functions by Kees C. Bakker
// Functions by Kees C. Bakker
// https://keestalkstech.com/2021/10/having-fun-grouping-arrays-into-maps-with-typescript/
/**
 * Like `Array.map`, but for a Map. Transforms from Map<K,V> to Map<K,R>, returning as a new Map.
 *
 * @example
 * ```js
 * const mapOfStrings = new Map();
 * mapOfStrings.set(`a`, `10`);
 * mapOfStrings.get(`a`); // Yields `10` (a string)
 *
 * // Convert a map of string->string to string->number
 * const mapOfInts = transformMap(mapOfStrings, (value, key) => parseInt(value));
 *
 * mapOfInts.get(`a`); // Yields 10 (a proper number)
 * ```
 *
 * If you want to combine values into a single object, consider instead  {@link mapToObjTransform}.
 * @param source
 * @param transformer
 * @typeParam K Type of keys (generally a string)
 * @typeParam V Type of input map values
 * @typeParam R Type of output map values
 * @returns
 */
var transformMap = function (source, transformer) { return new Map(Array.from(source, function (v) { return [v[0], transformer(v[1], v[0])]; })); };
exports.transformMap = transformMap;
/**
 * Converts a `Map` to a plain object, useful for serializing to JSON
 *
 * @example
 * ```js
 * const str = JSON.stringify(mapToObj(map));
 * ```
 * @param m
 * @returns
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
var mapToObj = function (m) { return Array.from(m).reduce(function (obj, _a) {
    var key = _a[0], value = _a[1];
    /* eslint-disable-next-line functional/immutable-data */
    obj[key] = value;
    return obj;
}, {}); };
exports.mapToObj = mapToObj;
/**
 * Converts Map to Array with a provided `transformer` function. Useful for plucking out certain properties
 * from contained values and for creating a new map based on transformed values from an input map.
 *
 * @example Get an array of ages from a map of Person objects
 * ```js
 * let person = { age: 29, name: `John`};
 * map.add(person.name, person);
 *
 * const ages = mapToArray(map, (key, person) => person.age);
 * // [29, ...]
 * ```
 *
 * In the above example, the `transformer` function returns a number, but it could
 * just as well return a transformed version of the input:
 *
 * ```js
 * // Return with random heights and uppercased name
 * mapToArray(map, (key, person) => ({
 *  ...person,
 *  height: Math.random(),
 *  name: person.name.toUpperCase();
 * }))
 * // Yields:
 * // [{height: 0.12, age: 29, name: "JOHN"}, ...]
 * ```
 * @param m
 * @param transformer A function that takes a key and item, returning a new item.
 * @returns
 */
var mapToArray = function (m, transformer) { return Array.from(m.entries()).map(function (x) { return transformer(x[0], x[1]); }); };
exports.mapToArray = mapToArray;
// End Functions by Kees C. Bakker
//#endregion
//# sourceMappingURL=Map.js.map