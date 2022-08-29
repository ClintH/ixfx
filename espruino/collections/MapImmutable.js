"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.map = exports.del = exports.set = exports.add = exports.has = void 0;
/**
 * Adds an array o [k,v] to the map, returning a new instance
 * @param map Initial data
 * @param data Data to add
 * @returns New map with data added
 */
var addArray = function (map, data) {
    var x = new Map(map.entries());
    data.forEach(function (d) {
        if (d[0] === undefined)
            throw new Error("key cannot be undefined");
        if (d[1] === undefined)
            throw new Error("value cannot be undefined");
        x.set(d[0], d[1]);
    });
    return x;
};
/**
 * Adds objects to the map, returning a new instance
 * @param map Initial data
 * @param data Data to add
 * @returns A new map with data added
 */
var addObjects = function (map, data) {
    var x = new Map(map.entries());
    data.forEach(function (d) {
        if (d.key === undefined)
            throw new Error("key cannot be undefined");
        if (d.value === undefined)
            throw new Error("value cannot be undefined");
        x.set(d.key, d.value);
    });
    return x;
};
/**
 * Returns true if map contains key
 *
 * @example
 * ```js
 * if (has(map, `London`)) ...
 * ```
 * @param map Map to search
 * @param key Key to find
 * @returns True if map contains key
 */
var has = function (map, key) { return map.has(key); };
exports.has = has;
/**
 * Adds data to a map, returning the new map.
 *
 * Can add items in the form of [key,value] or {key, value}.
 * @example These all produce the same result
 * ```js
 * map.set(`hello`, `samantha`);
 * map.add([`hello`, `samantha`]);
 * map.add({key: `hello`, value: `samantha`})
 * ```
 * @param map Initial data
 * @param data One or more data to add in the form of [key,value] or {key, value}
 * @returns New map with data added
 */
var add = function (map) {
    var data = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        data[_i - 1] = arguments[_i];
    }
    if (map === undefined)
        throw new Error("map parameter is undefined");
    if (data === undefined)
        throw new Error("data parameter i.s undefined");
    if (data.length === 0)
        return map;
    var firstRecord = data[0];
    var isObj = typeof firstRecord.key !== "undefined" && typeof firstRecord.value !== "undefined"; //(typeof (data[0] as {readonly key:K}).key !== undefined && typeof (data[0] as {readonly value:V}).value !== undefined);
    return isObj ? addObjects(map, data) : addArray(map, data);
};
exports.add = add;
/**
 * Sets data in a copy of the initial map
 * @param map Initial map
 * @param key Key
 * @param value Value to  set
 * @returns New map with data set
 */
var set = function (map, key, value) {
    var x = new Map(map.entries());
    x.set(key, value);
    return x;
};
exports.set = set;
/**
 * Delete a key from the map, returning a new map
 * @param map Initial data
 * @param key
 * @returns New map with data deleted
 */
var del = function (map, key) {
    var x = new Map(map.entries());
    x["delete"](key);
    return x;
};
exports.del = del;
/**
 * Returns an {@link MapImmutable}.
 * Use {@link mapMutable} as a mutable alternatve.
 *
 * @example Basic usage
 * ```js
 * // Creating
 * let m = map();
 * // Add
 * m = m.add(["name", "sally"]);
 * // Recall
 * m.get("name");
 * ```
 *
 * @example Enumerating
 * ```js
 * for (const [key, value] of map.entries()) {
 *  console.log(`${key} = ${value}`);
 * }
 * ```
 *
 * @example Overview
 * ```js
 * // Create
 * let m = map();
 * // Add
 * m = m.add(["name" , "sally"]);
 * m.get("name");   // "sally";
 * m.has("age");    // false
 * m.has("name");   // true
 * m.isEmpty;       // false
 * m = m.delete("name");
 * m.entries();     // Iterator of key value pairs
 * ```
 *
 * Since it is immutable, `add()`, `delete()` and `clear()` return a new version with change.
 *
 * @param dataOrMap Optional initial data in the form of an array of `{ key: value }` or `[ key, value ]`
 */
var map = function (dataOrMap) {
    if (dataOrMap === undefined)
        return (0, exports.map)([]);
    if (Array.isArray(dataOrMap))
        return (0, exports.map)(exports.add.apply(void 0, __spreadArray([new Map()], dataOrMap, false)));
    var data = dataOrMap;
    return {
        add: function () {
            var itemsToAdd = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                itemsToAdd[_i] = arguments[_i];
            }
            var s = exports.add.apply(void 0, __spreadArray([data], itemsToAdd, false));
            return (0, exports.map)(s);
        },
        get: function (key) { return data.get(key); },
        "delete": function (key) { return (0, exports.map)((0, exports.del)(data, key)); },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        clear: function () { return (0, exports.map)(); },
        has: function (key) { return data.has(key); },
        entries: function () { return data.entries(); },
        isEmpty: function () { return data.size === 0; }
    };
};
exports.map = map;
//# sourceMappingURL=MapImmutable.js.map