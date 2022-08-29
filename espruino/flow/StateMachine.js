"use strict";
// ✔ UNIT TESTED
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
var _StateMachine_state, _StateMachine_debug, _StateMachine_m, _StateMachine_isDone, _StateMachine_initial;
exports.__esModule = true;
exports.StateMachine = exports.create = exports.fromList = exports.descriptionFromList = void 0;
var Events_js_1 = require("../Events.js");
var Guards_js_1 = require("../Guards.js");
/**
 * Returns a machine description based on a list of strings. The final string is the final
 * state.
 *
 * ```js
 * const states = [`one`, `two`, `three`];
 * const sm = StateMachine.create(states[0], descriptionFromList(states));
 * ```
 * @param states List of states
 * @return MachineDescription
 */
var descriptionFromList = function () {
    var states = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        states[_i] = arguments[_i];
    }
    var t = {};
    // eslint-disable-next-line functional/no-let
    for (var i = 0; i < states.length; i++) {
        if (i === states.length - 1) {
            /** @ts-ignore */
            // eslint-disable-next-line functional/immutable-data 
            t[states[i]] = null;
        }
        else {
            /** @ts-ignore */
            // eslint-disable-next-line functional/immutable-data
            t[states[i]] = states[i + 1];
        }
    }
    return t;
};
exports.descriptionFromList = descriptionFromList;
/**
 * Returns a state machine based on a list of strings. The first string is used as the initial state,
 * the last string is considered the final. To just generate a description, use {@link descriptionFromList}.
 *
 * ```js
 * const states = [`one`, `two`, `three`];
 * const sm = StateMachine.fromList(states);
 * ```
 */
var fromList = function () {
    var states = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        states[_i] = arguments[_i];
    }
    return new StateMachine(states[0], exports.descriptionFromList.apply(void 0, states));
};
exports.fromList = fromList;
/**
 * Creates a new state machine
 * @param initial Initial state
 * @param m Machine description
 * @param opts Options
 * @returns State machine instance
 */
var create = function (initial, m, opts) {
    if (opts === void 0) { opts = { debug: false }; }
    return new StateMachine(initial, m, opts);
};
exports.create = create;
/**
 * State machine
 *
 * Machine description is a simple object of possible state names to allowed state(s). Eg. the following
 * has four possible states (`wakeup, sleep, coffee, breakfast, bike`). `Sleep` can only transition to the `wakeup`
 * state, while `wakeup` can transition to either `coffee` or `breakfast`.
 *
 * Use `null` to signify the final state. Multiple states can terminate the machine if desired.
 * ```
 * const description = {
 *  sleep: 'wakeup',
 *  wakeup: ['coffee', 'breakfast'],
 *  coffee: `bike`,
 *  breakfast: `bike`,
 *  bike: null
 * }
 * ```
 * Create the machine with the starting state (`sleep`)
 * ```
 * const machine = StateMachine.create(`sleep`, description);
 * ```
 *
 * Change the state by name:
 * ```
 * machine.state = `wakeup`
 * ```
 *
 * Or request an automatic transition (will use first state if there are several options)
 * ```
 * machine.next();
 * ```
 *
 * Check status
 * ```
 * if (machine.state === `coffee`) ...;
 * if (machine.isDone()) ...
 * ```
 *
 * Listen for state changes
 * ```
 * machine.addEventListener(`change`, (evt) => {
 *  const {priorState, newState} = evt;
 *  console.log(`State change from ${priorState} -> ${newState}`);
 * });
 * ```
 * @export
 * @class StateMachine
 * @extends {SimpleEventEmitter<StateMachineEventMap>}
 */
var StateMachine = /** @class */ (function (_super) {
    __extends(StateMachine, _super);
    /**
     * Create a state machine with initial state, description and options
     * @param string initial Initial state
     * @param MachineDescription m Machine description
     * @param Options Options for machine (defaults to `{debug:false}`)
     * @memberof StateMachine
     */
    function StateMachine(initial, m, opts) {
        if (opts === void 0) { opts = { debug: false }; }
        var _this = this;
        var _a;
        _this = _super.call(this) || this;
        // eslint-disable-next-line functional/prefer-readonly-type
        _StateMachine_state.set(_this, void 0);
        // eslint-disable-next-line functional/prefer-readonly-type
        _StateMachine_debug.set(_this, void 0);
        // eslint-disable-next-line functional/prefer-readonly-type
        _StateMachine_m.set(_this, void 0);
        // eslint-disable-next-line functional/prefer-readonly-type
        _StateMachine_isDone.set(_this, void 0);
        // eslint-disable-next-line functional/prefer-readonly-type
        _StateMachine_initial.set(_this, void 0);
        var _b = StateMachine.validate(initial, m), isValid = _b[0], errorMsg = _b[1];
        if (!isValid)
            throw new Error(errorMsg);
        __classPrivateFieldSet(_this, _StateMachine_initial, initial, "f");
        __classPrivateFieldSet(_this, _StateMachine_m, m, "f");
        __classPrivateFieldSet(_this, _StateMachine_debug, (_a = opts.debug) !== null && _a !== void 0 ? _a : false, "f");
        __classPrivateFieldSet(_this, _StateMachine_state, initial, "f");
        __classPrivateFieldSet(_this, _StateMachine_isDone, false, "f");
        return _this;
    }
    Object.defineProperty(StateMachine.prototype, "states", {
        get: function () {
            return Object.keys(__classPrivateFieldGet(this, _StateMachine_m, "f"));
        },
        enumerable: false,
        configurable: true
    });
    StateMachine.validate = function (initial, m) {
        // Check that object is structured properly
        var keys = Object.keys(m);
        // eslint-disable-next-line functional/prefer-readonly-type
        var finalStates = [];
        var seenKeys = new Set();
        var seenVals = new Set();
        var _loop_1 = function (i) {
            var key = keys[i];
            if (seenKeys.has(key))
                return { value: [false, "Key ".concat(key, " is already used")] };
            seenKeys.add(key);
            if (typeof keys[i] !== "string")
                return { value: [false, "Key[".concat(i, "] is not a string")] };
            var val = m[key];
            if (val === undefined)
                return { value: [false, "Key ".concat(key, " value is undefined")] };
            if (typeof val === "string") {
                seenVals.add(val);
                if (val === key)
                    return { value: [false, "Loop present for ".concat(key)] };
            }
            else if (Array.isArray(val)) {
                if (!(0, Guards_js_1.isStringArray)(val))
                    return { value: [false, "Key ".concat(key, " value is not an array of strings")] };
                val.forEach(function (v) { return seenVals.add(v); });
                if (val.find(function (v) { return v === key; }))
                    return { value: [false, "Loop present for ".concat(key)] };
            }
            else if (val === null) {
                // eslint-disable-next-line functional/immutable-data
                finalStates.push(key);
            }
            else {
                return { value: [false, "Key ".concat(key, " has a value that is neither null, string or array")] };
            }
        };
        // eslint-disable-next-line functional/no-let
        for (var i = 0; i < keys.length; i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        // Check that all values have a top-level state
        var seenValsArray = Array.from(seenVals);
        var missing = seenValsArray.find(function (v) { return !seenKeys.has(v); });
        if (missing)
            return [false, "Potential state '".concat(missing, "' does not exist as a top-level state")];
        // Check machine contains intial state
        if (m[initial] === undefined)
            return [false, "Initial state ".concat(initial, " not present")];
        return [true, ""];
    };
    /**
     * Moves to the next state if possible. If multiple states are possible, it will use the first.
     * If machine is finalised, no error is thrown and null is returned.
     *
     * @returns {(string|null)} Returns new state, or null if machine is finalised
     * @memberof StateMachine
     */
    StateMachine.prototype.next = function () {
        // Get possible transitions for current state
        var r = __classPrivateFieldGet(this, _StateMachine_m, "f")[__classPrivateFieldGet(this, _StateMachine_state, "f")];
        if (r === null)
            return null; // At the end
        // If there are multiple options, use the first
        if (Array.isArray(r)) {
            // eslint-disable-next-line functional/immutable-data
            if (typeof r[0] === "string")
                this.state = r[0];
            else
                throw new Error("Error in machine description. Potential state array does not contain strings");
        }
        else if (typeof r === "string") {
            // eslint-disable-next-line functional/immutable-data
            this.state = r; // Just one option
        }
        else
            throw new Error("Error in machine description. Potential state is neither array nor string");
        return this.state;
    };
    Object.defineProperty(StateMachine.prototype, "isDone", {
        /**
         * Returns true if state machine is in its final state
         *
         * @returns
         * @memberof StateMachine
         */
        get: function () {
            return __classPrivateFieldGet(this, _StateMachine_isDone, "f");
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Resets machine to initial state
     *
     * @memberof StateMachine
     */
    StateMachine.prototype.reset = function () {
        // eslint-disable-next-line functional/immutable-data
        __classPrivateFieldSet(this, _StateMachine_isDone, false, "f");
        // eslint-disable-next-line functional/immutable-data
        __classPrivateFieldSet(this, _StateMachine_state, __classPrivateFieldGet(this, _StateMachine_initial, "f"), "f");
    };
    /**
     * Checks whether a state change is valid.
     *
     * @static
     * @param priorState From state
     * @param newState To state
     * @param description Machine description
     * @returns If valid: [true,''], if invalid: [false, 'Error msg here']
     * @memberof StateMachine
     */
    StateMachine.isValid = function (priorState, newState, description) {
        // Does state exist?
        if (description[newState] === undefined)
            return [false, "Machine cannot change to non-existent state ".concat(newState)];
        // Is transition allowed?
        var rules = description[priorState];
        if (Array.isArray(rules)) {
            if (!rules.includes(newState))
                return [false, "Machine cannot change '".concat(priorState, " -> ").concat(newState, "'. Allowed transitions: ").concat(rules.join(", "))];
        }
        else {
            if (newState !== rules && rules !== "*")
                return [false, "Machine cannot '".concat(priorState, " -> ").concat(newState, "'. Allowed transition: ").concat(rules)];
        }
        return [true, "ok"];
    };
    StateMachine.prototype.isValid = function (newState) {
        return StateMachine.isValid(this.state, newState, __classPrivateFieldGet(this, _StateMachine_m, "f"));
    };
    Object.defineProperty(StateMachine.prototype, "state", {
        get: function () {
            return __classPrivateFieldGet(this, _StateMachine_state, "f");
        },
        /**
         * Gets or sets state. Throws an error if an invalid transition is attempted.
         * Use `StateMachine.isValid` to check validity without changing.
         *
         * @memberof StateMachine
         */
        set: function (newState) {
            var _this = this;
            var priorState = __classPrivateFieldGet(this, _StateMachine_state, "f");
            var _a = StateMachine.isValid(priorState, newState, __classPrivateFieldGet(this, _StateMachine_m, "f")), isValid = _a[0], errorMsg = _a[1];
            if (!isValid)
                throw new Error(errorMsg);
            if (__classPrivateFieldGet(this, _StateMachine_debug, "f"))
                console.log("StateMachine: ".concat(priorState, " -> ").concat(newState));
            // eslint-disable-next-line functional/immutable-data
            __classPrivateFieldSet(this, _StateMachine_state, newState, "f");
            var rules = __classPrivateFieldGet(this, _StateMachine_m, "f")[newState];
            if (rules === null) {
                // eslint-disable-next-line functional/immutable-data
                __classPrivateFieldSet(this, _StateMachine_isDone, true, "f");
            }
            setTimeout(function () {
                _this.fireEvent("change", { newState: newState, priorState: priorState });
                if (_this.isDone)
                    _this.fireEvent("stop", { state: newState });
            }, 1);
        },
        enumerable: false,
        configurable: true
    });
    return StateMachine;
}(Events_js_1.SimpleEventEmitter));
exports.StateMachine = StateMachine;
_StateMachine_state = new WeakMap(), _StateMachine_debug = new WeakMap(), _StateMachine_m = new WeakMap(), _StateMachine_isDone = new WeakMap(), _StateMachine_initial = new WeakMap();
//# sourceMappingURL=StateMachine.js.map