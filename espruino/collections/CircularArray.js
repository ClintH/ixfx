"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CircularArrayImpl_capacity, _CircularArrayImpl_pointer;
exports.__esModule = true;
exports.circularArray = void 0;
var Guards_js_1 = require("../Guards.js");
var CircularArrayImpl = /** @class */ (function (_super) {
    __extends(CircularArrayImpl, _super);
    function CircularArrayImpl(capacity) {
        if (capacity === void 0) { capacity = 0; }
        var _this = _super.call(this) || this;
        // ✔ Class is unit tested!
        /* eslint-disable-next-line functional/prefer-readonly-type */
        _CircularArrayImpl_capacity.set(_this, void 0);
        /* eslint-disable-next-line functional/prefer-readonly-type */
        _CircularArrayImpl_pointer.set(_this, void 0);
        // Allowed to create with capacity zero
        (0, Guards_js_1.integer)(capacity, "positive", "capacity");
        // Can't throw because .filter won't use ctor proprly
        __classPrivateFieldSet(_this, _CircularArrayImpl_capacity, capacity, "f");
        __classPrivateFieldSet(_this, _CircularArrayImpl_pointer, 0, "f");
        return _this;
    }
    CircularArrayImpl.prototype.add = function (thing) {
        var ca = CircularArrayImpl.from(this);
        /* eslint-disable-next-line functional/immutable-data */
        ca[__classPrivateFieldGet(this, _CircularArrayImpl_pointer, "f")] = thing;
        /* eslint-disable-next-line functional/immutable-data */
        __classPrivateFieldSet(ca, _CircularArrayImpl_capacity, __classPrivateFieldGet(this, _CircularArrayImpl_capacity, "f"), "f");
        if (__classPrivateFieldGet(this, _CircularArrayImpl_capacity, "f") > 0) {
            /* eslint-disable-next-line functional/immutable-data */
            __classPrivateFieldSet(ca, _CircularArrayImpl_pointer, __classPrivateFieldGet(this, _CircularArrayImpl_pointer, "f") + 1 === __classPrivateFieldGet(this, _CircularArrayImpl_capacity, "f") ? 0 : __classPrivateFieldGet(this, _CircularArrayImpl_pointer, "f") + 1, "f");
        }
        else {
            /* eslint-disable-next-line functional/immutable-data */
            __classPrivateFieldSet(ca, _CircularArrayImpl_pointer, __classPrivateFieldGet(this, _CircularArrayImpl_pointer, "f") + 1, "f");
        }
        return ca;
    };
    Object.defineProperty(CircularArrayImpl.prototype, "pointer", {
        get: function () {
            return __classPrivateFieldGet(this, _CircularArrayImpl_pointer, "f");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CircularArrayImpl.prototype, "isFull", {
        get: function () {
            if (__classPrivateFieldGet(this, _CircularArrayImpl_capacity, "f") === 0)
                return false;
            return this.length === __classPrivateFieldGet(this, _CircularArrayImpl_capacity, "f");
        },
        enumerable: false,
        configurable: true
    });
    return CircularArrayImpl;
}(Array));
_CircularArrayImpl_capacity = new WeakMap(), _CircularArrayImpl_pointer = new WeakMap();
/**
 * Returns a new circular array. Immutable. A circular array only keeps up to `capacity` items.
 * Old items are overridden with new items.
 *
 * `CircularArray` extends the regular JS array. Only use `add` to change the array if you want
 * to keep the `CircularArray` behaviour.
 *
 * @example Basic functions
 * ```js
 * let a = circularArray(10);
 * a = a.add(`hello`);  // Because it's immutable, capture the return result of `add`
 * a.isFull;            // True if circular array is full
 * a.pointer;           // The current position in array it will write to
 * ```
 *
 * Since it extends the regular JS array, you can access items as usual:
 * @example Accessing
 * ```js
 * let a = circularArray(10);
 * ... add some stuff ..
 * a.forEach(item => console.log(item));
 * ```
 * @param capacity Maximum capacity before recycling array entries
 * @return Circular array
 */
var circularArray = function (capacity) { return new CircularArrayImpl(capacity); };
exports.circularArray = circularArray;
//# sourceMappingURL=CircularArray.js.map