"use strict";
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
var _PaletteImpl_store, _PaletteImpl_aliases, _PaletteImpl_lastFallback, _PaletteImpl_elementBase;
exports.__esModule = true;
exports.create = void 0;
var create = function (fallbacks) { return new PaletteImpl(fallbacks); };
exports.create = create;
var PaletteImpl = /** @class */ (function () {
    function PaletteImpl(fallbacks) {
        /* eslint-disable-next-line functional/prefer-readonly-type */
        _PaletteImpl_store.set(this, new Map());
        /* eslint-disable-next-line functional/prefer-readonly-type */
        _PaletteImpl_aliases.set(this, new Map());
        _PaletteImpl_lastFallback.set(this, 0);
        _PaletteImpl_elementBase.set(this, void 0);
        if (fallbacks !== undefined)
            this.fallbacks = fallbacks;
        else
            this.fallbacks = ["red", "blue", "green", "orange"];
        __classPrivateFieldSet(this, _PaletteImpl_elementBase, document.body, "f");
    }
    PaletteImpl.prototype.setElementBase = function (el) {
        __classPrivateFieldSet(this, _PaletteImpl_elementBase, el, "f");
    };
    PaletteImpl.prototype.add = function (key, colour) {
        __classPrivateFieldGet(this, _PaletteImpl_store, "f").set(key, colour);
    };
    PaletteImpl.prototype.alias = function (from, to) {
        __classPrivateFieldGet(this, _PaletteImpl_aliases, "f").set(from, to);
    };
    PaletteImpl.prototype.get = function (key, fallback) {
        var _a;
        var alias = __classPrivateFieldGet(this, _PaletteImpl_aliases, "f").get(key);
        if (alias !== undefined)
            key = alias;
        var c = __classPrivateFieldGet(this, _PaletteImpl_store, "f").get(key);
        if (c !== undefined)
            return c;
        var varName = "--" + key;
        // eslint-disable-next-line functional/no-let
        var fromCss = getComputedStyle(__classPrivateFieldGet(this, _PaletteImpl_elementBase, "f")).getPropertyValue(varName).trim();
        // Not found
        if (fromCss === undefined || fromCss.length === 0) {
            if (fallback !== undefined)
                return fallback;
            fromCss = this.fallbacks[__classPrivateFieldGet(this, _PaletteImpl_lastFallback, "f")];
            __classPrivateFieldSet(this, _PaletteImpl_lastFallback, (_a = __classPrivateFieldGet(this, _PaletteImpl_lastFallback, "f"), _a++, _a), "f");
            if (__classPrivateFieldGet(this, _PaletteImpl_lastFallback, "f") === this.fallbacks.length)
                __classPrivateFieldSet(this, _PaletteImpl_lastFallback, 0, "f");
        }
        return fromCss;
    };
    PaletteImpl.prototype.getOrAdd = function (key, fallback) {
        if (this.has(key))
            return this.get(key);
        var c = this.get(key, fallback);
        this.add(key, c);
        return c;
    };
    PaletteImpl.prototype.has = function (key) {
        return __classPrivateFieldGet(this, _PaletteImpl_store, "f").has(key);
    };
    return PaletteImpl;
}());
_PaletteImpl_store = new WeakMap(), _PaletteImpl_aliases = new WeakMap(), _PaletteImpl_lastFallback = new WeakMap(), _PaletteImpl_elementBase = new WeakMap();
//# sourceMappingURL=Palette.js.map