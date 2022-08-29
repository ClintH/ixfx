"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.reconcileChildren = exports.copyToClipboard = exports.resizeObservable = exports.themeChangeObservable = exports.clear = exports.dataTable = exports.dataTableList = exports.createIn = exports.createAfter = exports.resolveEl = exports.windowResize = exports.parentSizeCanvas = exports.getTranslation = exports.parentSize = exports.fullSizeCanvas = exports.fullSizeElement = void 0;
var rxjs_1 = require("rxjs");
var json5_1 = __importDefault(require("json5"));
var fullSizeElement = function (domQueryOrEl, onResized) {
    var el = (0, exports.resolveEl)(domQueryOrEl);
    var r = (0, exports.windowResize)();
    var update = function () {
        var width = window.innerWidth;
        var height = window.innerHeight;
        el.setAttribute("width", width.toString());
        el.setAttribute("height", height.toString());
        var bounds = { width: width, height: height, center: { x: width / 2, y: height / 2 } };
        if (onResized !== undefined)
            onResized({ el: el, bounds: bounds });
    };
    r.subscribe(update);
    update();
    return r;
};
exports.fullSizeElement = fullSizeElement;
/// TODO: MAke fullSizeCanvas use fullSizeElement
/**
 * Resizes given canvas element to match window size.
 * To resize canvas to match its parent, use {@link parentSizeCanvas}.
 *
 * To make the canvas appear propery, it sets the following CSS:
 * ```css
 * {
 *  top: 0;
 *  left: 0;
 *  zIndex: -1;
 *  position: fixed;
 * }
 * ```
 * Pass _true_ for `skipCss` to avoid this.
 *
 * Provide a callback for when resize happens.
 * @param domQueryOrEl Query string or reference to canvas element
 * @param onResized Callback for when resize happens, eg for redrawing canvas
 * @param skipCss if true, style are not added
 * @returns Observable
 */
var fullSizeCanvas = function (domQueryOrEl, onResized, skipCss) {
    if (skipCss === void 0) { skipCss = false; }
    if (domQueryOrEl === null || domQueryOrEl === undefined)
        throw new Error("domQueryOrEl is null or undefined");
    var el = (0, exports.resolveEl)(domQueryOrEl);
    if (el.nodeName !== "CANVAS")
        throw new Error("Expected HTML element with node name CANVAS, not ".concat(el.nodeName));
    var ctx = el.getContext("2d");
    if (ctx === null)
        throw new Error("Could not create drawing context");
    var update = function () {
        var width = window.innerWidth;
        var height = window.innerHeight;
        //eslint-disable-next-line functional/immutable-data
        el.width = width;
        //eslint-disable-next-line functional/immutable-data
        el.height = height;
        var bounds = { width: width, height: height, center: { x: width / 2, y: height / 2 } };
        if (onResized !== undefined)
            onResized({ ctx: ctx, el: el, bounds: bounds });
    };
    // Setup
    if (!skipCss) {
        //eslint-disable-next-line functional/immutable-data
        el.style.top = "0";
        //eslint-disable-next-line functional/immutable-data
        el.style.left = "0";
        //eslint-disable-next-line functional/immutable-data
        el.style.zIndex = "-100";
        //eslint-disable-next-line functional/immutable-data
        el.style.position = "fixed";
    }
    var r = (0, exports.windowResize)();
    r.subscribe(update);
    update();
    return r;
};
exports.fullSizeCanvas = fullSizeCanvas;
/**
 * Sets width/height atributes on the given element according to the size of its parent.
 * @param domQueryOrEl Elememnt to resize
 * @param onResized Callback when resize happens
 * @param timeoutMs Timeout for debouncing events
 * @returns
 */
var parentSize = function (domQueryOrEl, onResized, timeoutMs) {
    if (timeoutMs === void 0) { timeoutMs = 100; }
    var el = (0, exports.resolveEl)(domQueryOrEl);
    var parent = el.parentElement;
    if (parent === null)
        throw new Error("Element has no parent");
    var ro = (0, exports.resizeObservable)(parent, timeoutMs).subscribe(function (entries) {
        var e = entries.find(function (v) { return v.target === parent; });
        if (e === undefined)
            return;
        var width = e.contentRect.width;
        var height = e.contentRect.height;
        el.setAttribute("width", width + "px");
        el.setAttribute("height", height + "px");
        var bounds = { width: width, height: height, center: { x: width / 2, y: height / 2 } };
        if (onResized !== undefined)
            onResized({ el: el, bounds: bounds });
    });
    return ro;
};
exports.parentSize = parentSize;
/**
 * Source: https://zellwk.com/blog/translate-in-javascript
 * @param domQueryOrEl
 */
var getTranslation = function (domQueryOrEl) {
    // Source:
    // https://raw.githubusercontent.com/zellwk/javascript/master/src/browser/dom/translate-values.js
    var el = (0, exports.resolveEl)(domQueryOrEl);
    var style = window.getComputedStyle(el);
    var matrix = style.transform;
    // No transform property. Simply return 0 values.
    if (matrix === "none" || typeof matrix === "undefined") {
        return {
            x: 0,
            y: 0,
            z: 0
        };
    }
    // Can either be 2d or 3d transform
    var matrixType = matrix.includes("3d") ? "3d" : "2d";
    // @ts-ignore
    var matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(", ");
    // 2d Matrixes have 6 values
    // Last 2 values are X and Y.
    // 2d Matrixes does not have Z value.
    if (matrixType === "2d") {
        return {
            x: parseFloat(matrixValues[4]),
            y: parseFloat(matrixValues[5]),
            z: 0
        };
    }
    // 3d Matrixes have 16 values
    // The 13th, 14th, and 15th values are X, Y, and Z
    if (matrixType === "3d") {
        return {
            x: parseFloat(matrixValues[12]),
            y: parseFloat(matrixValues[13]),
            z: parseFloat(matrixValues[14])
        };
    }
    return { x: 0, y: 0, z: 0 };
};
exports.getTranslation = getTranslation;
/**
 * Resizes given canvas to its parent element.
 * To resize canvas to match the viewport, use {@link fullSizeCanvas}.
 *
 * Provide a callback for when resize happens.
 * @param domQueryOrEl Query string or reference to canvas element
 * @param onResized Callback for when resize happens, eg for redrawing canvas
 * @returns Observable
 */
var parentSizeCanvas = function (domQueryOrEl, onResized, timeoutMs) {
    if (timeoutMs === void 0) { timeoutMs = 100; }
    var el = (0, exports.resolveEl)(domQueryOrEl);
    if (el.nodeName !== "CANVAS")
        throw new Error("Expected HTML element with node name CANVAS, not ".concat(el.nodeName));
    var parent = el.parentElement;
    if (parent === null)
        throw new Error("Element has no parent");
    var ctx = el.getContext("2d");
    if (ctx === null)
        throw new Error("Could not create drawing context");
    //const safetyMargin = 4;
    //eslint-disable-next-line functional/immutable-data
    el.style.width = "100%";
    //eslint-disable-next-line functional/immutable-data
    el.style.height = "100%";
    //console.log('parent height: ' + parent.getBoundingClientRect().height);
    //console.log(`parent offset Height: ${parent.offsetHeight}`);
    var ro = (0, exports.resizeObservable)(parent, timeoutMs).subscribe(function (entries) {
        var e = entries.find(function (v) { return v.target === parent; });
        if (e === undefined)
            return;
        var width = e.contentRect.width;
        var height = e.contentRect.height;
        //console.log(`contentH: ${e.contentRect.height} current: ${el.getBoundingClientRect().height}`);
        // el.setAttribute(`width`, width-safetyMargin + `px`);
        // el.setAttribute(`height`, height-safetyMargin + `px`);
        el.setAttribute("width", el.offsetWidth + "px");
        el.setAttribute("height", el.offsetHeight + "px");
        var bounds = { width: width, height: height, center: { x: width / 2, y: height / 2 } };
        if (onResized !== undefined)
            onResized({ ctx: ctx, el: el, bounds: bounds });
    });
    return ro;
};
exports.parentSizeCanvas = parentSizeCanvas;
/**
 * Returns an Observable for window resize. Default 100ms debounce.
 * @param timeoutMs
 * @returns
 */
var windowResize = function (timeoutMs) {
    if (timeoutMs === void 0) { timeoutMs = 100; }
    return (0, rxjs_1.fromEvent)(window, "resize").pipe((0, rxjs_1.debounceTime)(timeoutMs));
};
exports.windowResize = windowResize;
/**
 * Resolves either a string or HTML element to an element.
 * Useful when an argument is either an HTML element or query.
 *
 * ```js
 * resolveEl(`#someId`);
 * resolveEl(someElement);
 * ```
 * @param domQueryOrEl
 * @returns
 */
var resolveEl = function (domQueryOrEl) {
    if (typeof domQueryOrEl === "string") {
        var d = document.querySelector(domQueryOrEl);
        if (d === null) {
            if (!domQueryOrEl.startsWith("#")) {
                throw new Error("Query '".concat(domQueryOrEl, "' did not match anything. Did you mean '#").concat(domQueryOrEl, "?"));
            }
            else {
                throw new Error("Query '".concat(domQueryOrEl, "' did not match anything. Try '#id', 'div', or '.class'"));
            }
        }
        domQueryOrEl = d;
    }
    else if (domQueryOrEl === null)
        throw new Error("domQueryOrEl ".concat(domQueryOrEl, " is null"));
    else if (domQueryOrEl === undefined)
        throw new Error("domQueryOrEl ".concat(domQueryOrEl, " is undefined"));
    var el = domQueryOrEl;
    return el;
};
exports.resolveEl = resolveEl;
/**
 * Creates an element after `sibling`
 * ```
 * const el = createAfter(siblingEl, `DIV`);
 * ```
 * @param sibling Element
 * @param tagName Element to create
 * @returns New element
 */
var createAfter = function (sibling, tagName) {
    var _a;
    var el = document.createElement(tagName);
    (_a = sibling.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(el, sibling.nextSibling);
    return el;
};
exports.createAfter = createAfter;
/**
 * Creates an element inside of `parent`
 * ```
 * const newEl = createIn(parentEl, `DIV`);
 * ```
 * @param parent Parent element
 * @param tagName Tag to create
 * @returns New element
 */
var createIn = function (parent, tagName) {
    var el = document.createElement(tagName);
    parent.appendChild(el);
    return el;
};
exports.createIn = createIn;
/**
 * Creates a table based on a list of objects
 * ```
 * const t = dataTableList(parentEl, map);
 *
 * t(newMap)
 * ```
 */
var dataTableList = function (parentOrQuery, data) {
    var parent = (0, exports.resolveEl)(parentOrQuery);
    var update = function (data) {
        var seenTables = new Set();
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var _a = data_1[_i], key = _a[0], value = _a[1];
            var tKey = "table-".concat(key);
            seenTables.add(tKey);
            //eslint-disable-next-line functional/no-let
            var t = parent.querySelector("#".concat(tKey));
            if (t === null) {
                t = document.createElement("table");
                //eslint-disable-next-line functional/immutable-data
                t.id = tKey;
                parent.append(t);
            }
            updateDataTable(t, value);
        }
        // Remove tables that aren't present in map
        var tables = Array.from(parent.querySelectorAll("table"));
        tables.forEach(function (t) {
            if (!seenTables.has(t.id)) {
                t.remove();
            }
        });
    };
    if (data)
        update(data);
    return function (d) {
        update(d);
    };
};
exports.dataTableList = dataTableList;
/**
 * Updates a TABLE elment based on `data`'s key-object pairs
 * @param t
 * @param data
 * @returns
 */
var updateDataTable = function (t, data, opts) {
    var _a;
    if (opts === void 0) { opts = {}; }
    var precision = (_a = opts.precision) !== null && _a !== void 0 ? _a : 2;
    if (data === undefined) {
        //eslint-disable-next-line functional/immutable-data
        t.innerHTML = "";
        return;
    }
    var seenRows = new Set();
    for (var _i = 0, _b = Object.entries(data); _i < _b.length; _i++) {
        var _c = _b[_i], key = _c[0], value = _c[1];
        var domKey = "row-".concat(key);
        seenRows.add(domKey);
        //eslint-disable-next-line functional/no-let
        var rowEl = t.querySelector("#".concat(domKey));
        if (rowEl === null) {
            rowEl = document.createElement("tr");
            t.append(rowEl);
            //eslint-disable-next-line functional/immutable-data
            rowEl.id = domKey;
            var keyEl = document.createElement("td");
            //eslint-disable-next-line functional/immutable-data
            keyEl.innerText = key;
            rowEl.append(keyEl);
        }
        //eslint-disable-next-line functional/no-let
        var valEl = rowEl.querySelector("#".concat(domKey, "-val"));
        if (valEl === null) {
            valEl = document.createElement("td");
            //eslint-disable-next-line functional/immutable-data
            valEl.id = "".concat(domKey, "-val");
            rowEl.append(valEl);
        }
        //eslint-disable-next-line functional/no-let
        var valueHTML = void 0;
        if (opts.formatter) {
            valueHTML = opts.formatter(value, key);
        }
        // If there's no formatter, or not handled...
        if (valueHTML === undefined) {
            if (typeof value === "object") {
                valueHTML = json5_1["default"].stringify(value);
            }
            else if (typeof value === "number") {
                if (opts.roundNumbers) {
                    valueHTML = Math.round(value).toString();
                }
                else {
                    valueHTML = value.toFixed(precision);
                }
            }
            else {
                valueHTML = value.toString();
            }
        }
        //eslint-disable-next-line functional/immutable-data
        valEl.innerHTML = valueHTML;
    }
    // Remove rows that aren't present in data
    var rows = Array.from(t.querySelectorAll("tr"));
    rows.forEach(function (r) {
        if (!seenRows.has(r.id)) {
            r.remove();
        }
    });
};
/**
 * Creates a HTML table where each row is a key-value pair from `data`.
 * First column is the key, second column data.
 *
 * ```js
 * const dt = dataTable(`#hostDiv`);
 * dt({
 *  name: `Blerg`,
 *  height: 120
 * });
 * ```
 */
var dataTable = function (parentOrQuery, data, opts) {
    var parent = (0, exports.resolveEl)(parentOrQuery);
    var t = document.createElement("table");
    parent.append(t);
    if (data)
        updateDataTable(t, data, opts);
    return function (d) {
        updateDataTable(t, d, opts);
    };
};
exports.dataTable = dataTable;
/**
 * Remove all child nodes from `parent`
 * @param parent
 */
var clear = function (parent) {
    //eslint-disable-next-line functional/no-let
    var c = parent.lastElementChild;
    while (c) {
        parent.removeChild(c);
        c = parent.lastElementChild;
    }
};
exports.clear = clear;
/**
 * Observer when document's class changes
 *
 * ```js
 * const c = themeChangeObservable();
 * c.subscribe(() => {
 *  // Class has changed...
 * });
 * ```
 * @returns
 */
var themeChangeObservable = function () {
    var o = new rxjs_1.Observable(function (subscriber) {
        var ro = new MutationObserver(function (entries) {
            subscriber.next(entries);
        });
        var opts = {
            attributeFilter: ["class"],
            attributes: true
        };
        ro.observe(document.documentElement, opts);
        return function unsubscribe() {
            ro.disconnect();
        };
    });
    return o;
};
exports.themeChangeObservable = themeChangeObservable;
/**
 * Observer when element resizes. Specify `timeoutMs` to debounce.
 *
 * ```
 * const o = resizeObservable(myEl, 500);
 * o.subscribe(() => {
 *  // called 500ms after last resize
 * });
 * ```
 * @param elem
 * @param timeoutMs Tiemout before event gets triggered
 * @returns
 */
var resizeObservable = function (elem, timeoutMs) {
    if (timeoutMs === void 0) { timeoutMs = 1000; }
    if (elem === null)
        throw new Error("elem parameter is null. Expected element to observe");
    if (elem === undefined)
        throw new Error("elem parameter is undefined. Expected element to observe");
    var o = new rxjs_1.Observable(function (subscriber) {
        var ro = new ResizeObserver(function (entries) {
            subscriber.next(entries);
        });
        ro.observe(elem);
        return function unsubscribe() {
            ro.unobserve(elem);
        };
    });
    return o.pipe((0, rxjs_1.debounceTime)(timeoutMs));
};
exports.resizeObservable = resizeObservable;
/**
 * Copies string representation of object to clipboard
 * @param obj
 * @returns Promise
 */
var copyToClipboard = function (obj) {
    var p = new Promise(function (resolve, reject) {
        //const json = JSON.stringify(obj, null, 2);
        var str = json5_1["default"].stringify(obj);
        navigator.clipboard.writeText(JSON.stringify(str)).then(function () {
            resolve(true);
        }, function (_err) {
            console.warn("Could not copy to clipboard");
            console.log(str);
            reject(_err);
        });
    });
    return p;
};
exports.copyToClipboard = copyToClipboard;
var reconcileChildren = function (parentEl, list, createUpdate) {
    if (parentEl === null)
        throw new Error("parentEl is null");
    if (parentEl === undefined)
        throw new Error("parentEl is undefined");
    var seen = new Set();
    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
        var _a = list_1[_i], key = _a[0], value = _a[1];
        var id = "c-".concat(key);
        var el = parentEl.querySelector("#".concat(id));
        var finalEl = createUpdate(value, el);
        //eslint-disable-next-line functional/immutable-data
        if (el !== finalEl) {
            //eslint-disable-next-line functional/immutable-data
            finalEl.id = id;
            parentEl.append(finalEl);
        }
        seen.add(id);
    }
    var prune = [];
    //eslint-disable-next-line functional/no-let
    for (var i = 0; i < parentEl.children.length; i++) {
        var c = parentEl.children[i];
        if (!seen.has(c.id)) {
            //eslint-disable-next-line functional/immutable-data
            prune.push(c);
        }
    }
    prune.forEach(function (p) { return p.remove(); });
};
exports.reconcileChildren = reconcileChildren;
//# sourceMappingURL=Util.js.map