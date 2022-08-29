"use strict";
// ✔ UNIT TESTED
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
exports.queueMutable = exports.queue = void 0;
var debug = function (opts, msg) {
    /* eslint-disable-next-line functional/no-expression-statement */
    opts.debug ? console.log("queue:".concat(msg)) : null;
};
var trimQueue = function (opts, queue, toAdd) {
    var _a, _b;
    var potentialLength = queue.length + toAdd.length;
    var capacity = (_a = opts.capacity) !== null && _a !== void 0 ? _a : potentialLength;
    var toRemove = potentialLength - capacity;
    var policy = (_b = opts.discardPolicy) !== null && _b !== void 0 ? _b : "additions";
    debug(opts, "queueLen: ".concat(queue.length, " potentialLen: ").concat(potentialLength, " toRemove: ").concat(toRemove, " policy: ").concat(policy));
    switch (policy) {
        // Only add what we can from toAdd
        case "additions":
            debug(opts, "trimQueue:DiscardAdditions: queueLen: ".concat(queue.length, " slice: ").concat(potentialLength - capacity, " toAddLen: ").concat(toAdd.length));
            if (queue.length === opts.capacity) {
                return queue; // Completely full
            }
            else {
                // Only add some from the new array (from the front)  
                return __spreadArray(__spreadArray([], queue, true), toAdd.slice(0, toRemove - 1), true);
            }
        // Remove from rear of queue (last index) before adding new things
        case "newer":
            if (toRemove >= queue.length) {
                // New items will completely flush out old
                return toAdd.slice(Math.max(0, toAdd.length - capacity), Math.min(toAdd.length, capacity) + 1);
            }
            else {
                // Keep some of the old
                var toAddFinal = toAdd.slice(0, Math.min(toAdd.length, capacity - toRemove + 1));
                var toKeep = queue.slice(0, queue.length - toRemove);
                debug(opts, "trimQueue: toRemove: ".concat(toRemove, " keeping: ").concat(JSON.stringify(toKeep), " from orig: ").concat(JSON.stringify(queue), " toAddFinal: ").concat(JSON.stringify(toAddFinal)));
                var t = __spreadArray(__spreadArray([], toKeep, true), toAddFinal, true);
                debug(opts, "final: ".concat(JSON.stringify(t)));
                return t;
            }
        // Remove from the front of the queue (0 index). ie. older items are discarded
        case "older":
            // If queue is A, B and toAdd is C, D this yields A, B, C, D
            return __spreadArray(__spreadArray([], queue, true), toAdd, true).slice(toRemove);
        default:
            throw new Error("Unknown overflow policy ".concat(policy));
    }
};
/**
 * Adds to the back of the queue (last array index)
 * Last item of `toAdd` will potentially be the new end of the queue (depending on capacity limit and overflow policy)
 * @template V
 * @param {QueueOpts} opts
 * @param {V[]} queue
 * @param {...V[]} toAdd
 * @returns {V[]}
 */
var enqueue = function (opts, queue) {
    var toAdd = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        toAdd[_i - 2] = arguments[_i];
    }
    if (opts === undefined)
        throw new Error("opts parameter undefined");
    var potentialLength = queue.length + toAdd.length;
    var overSize = opts.capacity && potentialLength > opts.capacity;
    var toReturn = overSize ? trimQueue(opts, queue, toAdd) : __spreadArray(__spreadArray([], queue, true), toAdd, true);
    if (opts.capacity && toReturn.length !== opts.capacity && overSize)
        throw new Error("Bug! Expected return to be at capacity. Return len: ".concat(toReturn.length, " capacity: ").concat(opts.capacity, " opts: ").concat(JSON.stringify(opts)));
    if (!opts.capacity && toReturn.length !== potentialLength)
        throw new Error("Bug! Return length not expected. Return len: ".concat(toReturn.length, " expected: ").concat(potentialLength, " opts: ").concat(JSON.stringify(opts)));
    return toReturn;
};
// Remove from front of queue (0 index)
var dequeue = function (opts, queue) {
    if (queue.length === 0)
        throw new Error("Queue is empty");
    return queue.slice(1);
};
/**
 * Returns front of queue (oldest item), or undefined if queue is empty
 *
 * @template V
 * @param {QueueOpts} opts
 * @param {V[]} queue
 * @returns {(V | undefined)}
 */
var peek = function (opts, queue) { return queue[0]; };
var isEmpty = function (opts, queue) { return queue.length === 0; };
var isFull = function (opts, queue) {
    if (opts.capacity) {
        return queue.length >= opts.capacity;
    }
    return false;
};
// -------------------------------
// Immutable
// -------------------------------
var QueueImpl = /** @class */ (function () {
    /**
     * Creates an instance of Queue.
     * @param {QueueOpts} opts Options foor queue
     * @param {V[]} data Initial data. Index 0 is front of queue
     * @memberof Queue
     */
    function QueueImpl(opts, data) {
        if (opts === undefined)
            throw new Error("opts parameter undefined");
        this.opts = opts;
        this.data = data;
    }
    QueueImpl.prototype.forEach = function (fn) {
        //eslint-disable-next-line functional/no-let
        for (var i = this.data.length - 1; i >= 0; i--) {
            fn(this.data[i]);
        }
    };
    QueueImpl.prototype.forEachFromFront = function (fn) {
        // From front of queue
        this.data.forEach(function (vv) { return fn(vv); });
    };
    QueueImpl.prototype.enqueue = function () {
        var toAdd = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            toAdd[_i] = arguments[_i];
        }
        return new QueueImpl(this.opts, enqueue.apply(void 0, __spreadArray([this.opts, this.data], toAdd, false)));
    };
    QueueImpl.prototype.dequeue = function () {
        return new QueueImpl(this.opts, dequeue(this.opts, this.data));
    };
    Object.defineProperty(QueueImpl.prototype, "isEmpty", {
        get: function () {
            return isEmpty(this.opts, this.data);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QueueImpl.prototype, "isFull", {
        get: function () {
            return isFull(this.opts, this.data);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QueueImpl.prototype, "length", {
        get: function () {
            return this.data.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QueueImpl.prototype, "peek", {
        get: function () {
            return peek(this.opts, this.data);
        },
        enumerable: false,
        configurable: true
    });
    return QueueImpl;
}());
// -------------------------------
// Mutable
// -------------------------------
var QueueMutableImpl = /** @class */ (function () {
    function QueueMutableImpl(opts, data) {
        if (opts === undefined)
            throw new Error("opts parameter undefined");
        this.opts = opts;
        this.data = data;
    }
    QueueMutableImpl.prototype.enqueue = function () {
        var toAdd = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            toAdd[_i] = arguments[_i];
        }
        /* eslint-disable-next-line functional/immutable-data */
        this.data = enqueue.apply(void 0, __spreadArray([this.opts, this.data], toAdd, false));
        return this.data.length;
    };
    QueueMutableImpl.prototype.dequeue = function () {
        var v = peek(this.opts, this.data);
        /* eslint-disable-next-line functional/immutable-data */
        this.data = dequeue(this.opts, this.data);
        return v;
    };
    Object.defineProperty(QueueMutableImpl.prototype, "isEmpty", {
        get: function () {
            return isEmpty(this.opts, this.data);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QueueMutableImpl.prototype, "isFull", {
        get: function () {
            return isFull(this.opts, this.data);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QueueMutableImpl.prototype, "length", {
        get: function () {
            return this.data.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QueueMutableImpl.prototype, "peek", {
        get: function () {
            return peek(this.opts, this.data);
        },
        enumerable: false,
        configurable: true
    });
    return QueueMutableImpl;
}());
/**
 * Returns an immutable queue. Queues are useful if you want to treat 'older' or 'newer'
 * items differently. _Enqueing_ adds items at the back of the queue, while
 * _dequeing_ removes items from the front (ie. the oldest).
 *
 * ```js
 * let q = queue();           // Create
 * q = q.enqueue(`a`, `b`);   // Add two strings
 * const front = q.peek();    // `a` is at the front of queue (oldest)
 * q = q.dequeue();           // q now just consists of `b`
 * ```
 * @example Cap size to 5 items, throwing away newest items already in queue.
 * ```js
 * const q = queue({capacity: 5, discardPolicy: `newer`});
 * ```
 *
 * @template V Data type of items
 * @param opts
 * @param startingItems Index 0 is the front of the queue
 * @returns A new queue
 */
var queue = function (opts) {
    if (opts === void 0) { opts = {}; }
    var startingItems = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        startingItems[_i - 1] = arguments[_i];
    }
    opts = __assign({}, opts); // Make a copy of options
    return new QueueImpl(opts, __spreadArray([], startingItems, true)); // Make a copy of array so it can't be modified
};
exports.queue = queue;
/**
 * Returns a mutable queue. Queues are useful if you want to treat 'older' or 'newer'
 * items differently. _Enqueing_ adds items at the back of the queue, while
 * _dequeing_ removes items from the front (ie. the oldest).
 *
 * ```js
 * const q = queue();       // Create
 * q.enqueue(`a`, `b`);     // Add two strings
 * const front = q.dequeue();  // `a` is at the front of queue (oldest)
 * ```
 *
 * @example Cap size to 5 items, throwing away newest items already in queue.
 * ```js
 * const q = queue({capacity: 5, discardPolicy: `newer`});
 * ```
 *
 * @template V Data type of items
 * @param opts
 * @param startingItems Items are added in array order. So first item will be at the front of the queue.
 */
var queueMutable = function (opts) {
    if (opts === void 0) { opts = {}; }
    var startingItems = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        startingItems[_i - 1] = arguments[_i];
    }
    return new QueueMutableImpl(__assign({}, opts), __spreadArray([], startingItems, true));
};
exports.queueMutable = queueMutable;
//# sourceMappingURL=Queue.js.map