"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.stackMutable = exports.stack = void 0;
var trimStack = function (opts, stack, toAdd) {
    var _a, _b;
    var potentialLength = stack.length + toAdd.length;
    var policy = (_a = opts.discardPolicy) !== null && _a !== void 0 ? _a : "additions";
    var capacity = (_b = opts.capacity) !== null && _b !== void 0 ? _b : potentialLength;
    var toRemove = potentialLength - capacity;
    if (opts.debug)
        console.log("Stack.push: stackLen: ".concat(stack.length, " potentialLen: ").concat(potentialLength, " toRemove: ").concat(toRemove, " policy: ").concat(policy));
    switch (policy) {
        case "additions":
            if (opts.debug)
                console.log("Stack.push:DiscardAdditions: stackLen: ".concat(stack.length, " slice: ").concat(potentialLength - capacity, " toAddLen: ").concat(toAdd.length));
            if (stack.length === opts.capacity) {
                return stack; // Completely full
            }
            else {
                // Only add some from the new array
                return __spreadArray(__spreadArray([], stack, true), toAdd.slice(0, toAdd.length - toRemove), true);
            }
        case "newer":
            if (toRemove >= stack.length) {
                // New items will completely flush out old
                return toAdd.slice(Math.max(0, toAdd.length - capacity), Math.min(toAdd.length, capacity) + 1);
            }
            else {
                // Keep some of the old (from 0)
                //if (opts.debug) console.log(` orig: ${JSON.stringify(stack)}`);
                if (opts.debug)
                    console.log(" from orig: ".concat(stack.slice(0, stack.length - toRemove)));
                return __spreadArray(__spreadArray([], stack.slice(0, stack.length - toRemove), true), toAdd.slice(0, Math.min(toAdd.length, capacity - toRemove + 1)), true);
            }
        case "older":
            // Oldest item in stack is position 0
            return __spreadArray(__spreadArray([], stack, true), toAdd, true).slice(toRemove);
        default:
            throw new Error("Unknown discard policy ".concat(policy));
    }
};
// Add to top (last index)
var push = function (opts, stack) {
    var toAdd = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        toAdd[_i - 2] = arguments[_i];
    }
    // If stack is A, B and toAdd is C, D this yields A, B, C, D
    //const mutated = [...stack, ...toAdd];
    var potentialLength = stack.length + toAdd.length;
    var overSize = (opts.capacity && potentialLength > opts.capacity);
    var toReturn = overSize ? trimStack(opts, stack, toAdd) : __spreadArray(__spreadArray([], stack, true), toAdd, true);
    return toReturn;
};
// Remove from top (last index)
var pop = function (opts, stack) {
    if (stack.length === 0)
        throw new Error("Stack is empty");
    return stack.slice(0, stack.length - 1);
};
/**
 * Peek at the top of the stack (end of array)
 *
 * @template V
 * @param {StackOpts} opts
 * @param {V[]} stack
 * @returns {(V | undefined)}
 */
var peek = function (opts, stack) { return stack[stack.length - 1]; };
var isEmpty = function (opts, stack) { return stack.length === 0; };
var isFull = function (opts, stack) {
    if (opts.capacity) {
        return stack.length >= opts.capacity;
    }
    return false;
};
// -------------------------
// Immutable
// -------------------------
var StackImpl = /** @class */ (function () {
    function StackImpl(opts, data) {
        this.opts = opts;
        this.data = data;
    }
    StackImpl.prototype.push = function () {
        var toAdd = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            toAdd[_i] = arguments[_i];
        }
        return new StackImpl(this.opts, push.apply(void 0, __spreadArray([this.opts, this.data], toAdd, false)));
    };
    StackImpl.prototype.pop = function () {
        return new StackImpl(this.opts, pop(this.opts, this.data));
    };
    StackImpl.prototype.forEach = function (fn) {
        this.data.forEach(fn);
    };
    StackImpl.prototype.forEachFromTop = function (fn) {
        __spreadArray([], this.data, true).reverse().forEach(fn);
    };
    Object.defineProperty(StackImpl.prototype, "isEmpty", {
        get: function () {
            return isEmpty(this.opts, this.data);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StackImpl.prototype, "isFull", {
        get: function () {
            return isFull(this.opts, this.data);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StackImpl.prototype, "peek", {
        get: function () {
            return peek(this.opts, this.data);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StackImpl.prototype, "length", {
        get: function () {
            return this.data.length;
        },
        enumerable: false,
        configurable: true
    });
    return StackImpl;
}());
// -------------------------
// Mutable
// -------------------------
var StackMutableImpl = /** @class */ (function () {
    function StackMutableImpl(opts, data) {
        this.opts = opts;
        this.data = data;
    }
    StackMutableImpl.prototype.push = function () {
        var toAdd = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            toAdd[_i] = arguments[_i];
        }
        /* eslint-disable-next-line functional/immutable-data */
        this.data = push.apply(void 0, __spreadArray([this.opts, this.data], toAdd, false));
        return this.data.length;
    };
    StackMutableImpl.prototype.forEach = function (fn) {
        this.data.forEach(fn);
    };
    StackMutableImpl.prototype.forEachFromTop = function (fn) {
        __spreadArray([], this.data, true).reverse().forEach(fn);
    };
    StackMutableImpl.prototype.pop = function () {
        var v = peek(this.opts, this.data);
        pop(this.opts, this.data);
        return v;
    };
    Object.defineProperty(StackMutableImpl.prototype, "isEmpty", {
        get: function () {
            return isEmpty(this.opts, this.data);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StackMutableImpl.prototype, "isFull", {
        get: function () {
            return isFull(this.opts, this.data);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StackMutableImpl.prototype, "peek", {
        get: function () {
            return peek(this.opts, this.data);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StackMutableImpl.prototype, "length", {
        get: function () {
            return this.data.length;
        },
        enumerable: false,
        configurable: true
    });
    return StackMutableImpl;
}());
/**
 * Returns a stack. Immutable. Use {@link stackMutable} for a mutable alternative.
 *
 * The basic usage is `push`/`pop` to add/remove, returning the modified stack. Use the
 * property `peek` to see what's on top.
 *
 * @example Basic usage
 * ```js
 * // Create
 * let s = stack();
 * // Add one or more items
 * s = s.push(1, 2, 3, 4);
 * // See what's at the top of the stack
 * s.peek;      // 4
 *
 * // Remove from the top of the stack, returning
 * // a new stack without item
 * s = s.pop();
 * s.peek;        // 3
 * ```
 * @param opts Options
 * @param startingItems List of items to add to stack. Items will be pushed 'left to right', ie array index 0 will be bottom of the stack.
 */
var stack = function (opts) {
    if (opts === void 0) { opts = {}; }
    var startingItems = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        startingItems[_i - 1] = arguments[_i];
    }
    return new StackImpl(__assign({}, opts), __spreadArray([], startingItems, true));
};
exports.stack = stack;
/**
 * Creates a stack. Mutable. Use {@link stack} for an immutable alternative.
 *
 * @example Basic usage
 * ```js
 * // Create
 * const s = stackMutable();
 * // Add one or more items
 * s.push(1, 2, 3, 4);
 *
 * // See what's on top
 * s.peek;  // 4
 *
 * // Remove the top-most, and return it
 * s.pop();   // 4
 *
 * // Now there's a new top-most element
 * s.peek;  // 3
 * ```
 */
var stackMutable = function (opts) {
    if (opts === void 0) { opts = {}; }
    var startingItems = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        startingItems[_i - 1] = arguments[_i];
    }
    return new StackMutableImpl(__assign({}, opts), __spreadArray([], startingItems, true));
};
exports.stackMutable = stackMutable;
//# sourceMappingURL=Stack.js.map