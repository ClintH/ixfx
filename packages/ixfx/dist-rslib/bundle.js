// The require scope
var __webpack_require__ = {};
/************************************************************************/ // webpack/runtime/define_property_getters
(()=>{
    __webpack_require__.d = (exports, definition)=>{
        for(var key in definition){
            if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
                Object.defineProperty(exports, key, {
                    enumerable: true,
                    get: definition[key]
                });
            }
        }
    };
})();
// webpack/runtime/has_own_property
(()=>{
    __webpack_require__.o = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
})();
// webpack/runtime/make_namespace_object
(()=>{
    // define __esModule on exports
    __webpack_require__.r = (exports)=>{
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(exports, '__esModule', {
            value: true
        });
    };
})();
/************************************************************************/ // NAMESPACE OBJECT: ../modulation/src/easing/easings-named.ts
var easings_named_namespaceObject = {};
__webpack_require__.r(easings_named_namespaceObject);
__webpack_require__.d(easings_named_namespaceObject, {
    arch: ()=>arch,
    backIn: ()=>backIn,
    backInOut: ()=>backInOut,
    backOut: ()=>backOut,
    bell: ()=>bell,
    bounceIn: ()=>bounceIn,
    bounceInOut: ()=>bounceInOut,
    bounceOut: ()=>bounceOut,
    circIn: ()=>circIn,
    circInOut: ()=>circInOut,
    circOut: ()=>circOut,
    cubicIn: ()=>cubicIn,
    cubicOut: ()=>cubicOut,
    elasticIn: ()=>elasticIn,
    elasticInOut: ()=>elasticInOut,
    elasticOut: ()=>elasticOut,
    expoIn: ()=>expoIn,
    expoInOut: ()=>expoInOut,
    expoOut: ()=>expoOut,
    quadIn: ()=>quadIn,
    quadInOut: ()=>quadInOut,
    quadOut: ()=>quadOut,
    quartIn: ()=>quartIn,
    quartOut: ()=>quartOut,
    quintIn: ()=>quintIn,
    quintInOut: ()=>quintInOut,
    quintOut: ()=>quintOut,
    sineIn: ()=>sineIn,
    sineInOut: ()=>sineInOut,
    sineOut: ()=>sineOut,
    smootherstep: ()=>smootherstep,
    smoothstep: ()=>smoothstep
});
// NAMESPACE OBJECT: ../rx/src/from/index.ts
var from_namespaceObject = {};
__webpack_require__.r(from_namespaceObject);
__webpack_require__.d(from_namespaceObject, {
    array: ()=>array_array,
    arrayObject: ()=>arrayObject,
    arrayProxy: ()=>arrayProxy,
    boolean: ()=>boolean_boolean,
    count: ()=>count_count,
    derived: ()=>derived,
    event: ()=>event_event,
    eventField: ()=>eventField,
    eventTrigger: ()=>eventTrigger,
    func: ()=>func,
    iterator: ()=>iterator_iterator,
    merged: ()=>merged,
    mergedWithOptions: ()=>mergedWithOptions,
    number: ()=>number,
    object: ()=>object_object,
    objectProxy: ()=>objectProxy,
    objectProxySymbol: ()=>objectProxySymbol,
    observable: ()=>observable,
    observableWritable: ()=>observableWritable,
    of: ()=>of,
    string: ()=>string
});
; // CONCATENATED MODULE: ../guards/src/throw-from-result.ts
const throw_from_result_throwFromResult = (test)=>{
    if (test[0]) return false;
    else throw new Error(test[1]);
};
; // CONCATENATED MODULE: ../guards/src/numbers.ts
/**
 * Returns true if `x` is a power of two
 * @param x
 * @returns True if `x` is a power of two
 */ const isPowerOfTwo = (x)=>Math.log2(x) % 1 === 0;
/**
 * Returns `fallback` if `v` is NaN, otherwise returns `v`.
 *
 * Throws if `v` is not a number type.
 * @param v
 * @param fallback
 * @returns
 */ const ifNaN = (v, fallback)=>{
    // ✔️ Unit tested
    if (Number.isNaN(v)) return fallback;
    if (typeof v !== `number`) {
        throw new TypeError(`v is not a number. Got: ${typeof v}`);
    }
    return v;
};
/**
 * Parses `value` as an integer, returning it if it meets the `range` criteria.
 * If not, `defaultValue` is returned.
 *
 * ```js
 * const i = integerParse('10', 'positive');    // 10
 * const i = integerParse('10.5', 'positive');  // 10
 * const i = integerParse('0', 'nonZero', 100); // 100
 * ```
 *
 * NaN is returned if criteria does not match and no default is given
 * ```js
 * const i = integerParse('10', 'negative');    // NaN
 * ```
 *
 * @param value
 * @param range
 * @param defaultValue
 * @returns
 */ const integerParse = (value, range = ``, defaultValue = Number.NaN)=>{
    // ✔️ Unit tested
    if (value === undefined) return defaultValue;
    if (value === null) return defaultValue;
    try {
        const parsed = Number.parseInt(value);
        const r = numbers_integerTest(parsed, range, `parsed`);
        return r[0] ? parsed : defaultValue;
    } catch  {
        return defaultValue;
    }
};
/**
 * Checks if `t` is not a number or within specified range.
 * Returns `[false, reason:string]` if invalid or `[true]` if valid.
 * Use {@link throwNumberTest} to throw an error rather than return result.
 * 
 * Alternatives: {@link integerTest} for additional integer check, {@link percentTest} for percentage-range.
 *
 * * (empty, default): must be a number type and not NaN.
 * * finite: must be a number, not NaN and not infinite
 * * positive: must be at least zero
 * * negative: must be zero or lower
 * * aboveZero: must be above zero
 * * belowZero: must be below zero
 * * percentage: must be within 0-1, inclusive
 * * nonZero: can be anything except zero
 * * bipolar: can be -1 to 1, inclusive
 * @param value Value to check
 * @param parameterName Name of parameter (for more helpful exception messages)
 * @param range Range to enforce
 * @returns
 */ const numberTest = (value, range = ``, parameterName = `?`)=>{
    if (value === null) return [
        false,
        `Parameter '${parameterName}' is null`
    ];
    if (typeof value === `undefined`) {
        return [
            false,
            `Parameter '${parameterName}' is undefined`
        ];
    }
    if (Number.isNaN(value)) {
        return [
            false,
            `Parameter '${parameterName}' is NaN`
        ];
    }
    if (typeof value !== `number`) {
        return [
            false,
            `Parameter '${parameterName}' is not a number (${JSON.stringify(value)})`
        ];
    }
    switch(range){
        case `finite`:
            {
                if (!Number.isFinite(value)) {
                    return [
                        false,
                        `Parameter '${parameterName} must be finite (Got: ${value})`
                    ];
                }
                break;
            }
        case `positive`:
            {
                if (value < 0) {
                    return [
                        false,
                        `Parameter '${parameterName}' must be at least zero (${value})`
                    ];
                }
                break;
            }
        case `negative`:
            {
                if (value > 0) {
                    return [
                        false,
                        `Parameter '${parameterName}' must be zero or lower (${value})`
                    ];
                }
                break;
            }
        case `aboveZero`:
            {
                if (value <= 0) {
                    return [
                        false,
                        `Parameter '${parameterName}' must be above zero (${value})`
                    ];
                }
                break;
            }
        case `belowZero`:
            {
                if (value >= 0) {
                    return [
                        false,
                        `Parameter '${parameterName}' must be below zero (${value})`
                    ];
                }
                break;
            }
        case `percentage`:
            {
                if (value > 1 || value < 0) {
                    return [
                        false,
                        `Parameter '${parameterName}' must be in percentage range (0 to 1). (${value})`
                    ];
                }
                break;
            }
        case `nonZero`:
            {
                if (value === 0) {
                    return [
                        false,
                        `Parameter '${parameterName}' must non-zero. (${value})`
                    ];
                }
                break;
            }
        case `bipolar`:
            {
                if (value > 1 || value < -1) {
                    return [
                        false,
                        `Parameter '${parameterName}' must be in bipolar percentage range (-1 to 1). (${value})`
                    ];
                }
                break;
            }
    }
    return [
        true
    ];
};
/**
 * Checks if `t` is not a number or within specified range.
 * Throws if invalid. Use {@link numberTest} to test without throwing.
 *
* * (empty, default): must be a number type and not NaN.
* * positive: must be at least zero
* * negative: must be zero or lower
* * aboveZero: must be above zero
* * belowZero: must be below zero
* * percentage: must be within 0-1, inclusive
* * nonZero: can be anything except zero
* * bipolar: can be -1 to 1, inclusive
* 
 * Alternatives: {@link integerTest} for additional integer check, {@link percentTest} for percentage-range.
 * @param value Value to test
 * @param range Range
 * @param parameterName Name of parameter 
 */ const throwNumberTest = (value, range = ``, parameterName = `?`)=>{
    throw_from_result_throwFromResult(numberTest(value, range, parameterName));
};
/**
 * Returns test of `value` being in the range of 0-1.
 * Equiv to `number(value, `percentage`);`
 *
 * This is the same as calling ```number(t, `percentage`)```
 * @param value Value to check
 * @param parameterName Param name for customising exception message
 * @returns
 */ const percentTest = (value, parameterName = `?`)=>numberTest(value, `percentage`, parameterName);
const throwPercentTest = (value, parameterName = `?`)=>{
    throwFromResult(percentTest(value, parameterName));
};
/**
 * Checks if `value` an integer and meets additional criteria.
 * See {@link numberTest} for guard details, or use that if integer checking is not required.
 *
 * Note:
 * * `bipolar` will mean -1, 0 or 1.
 * * positive: must be at least zero
 * * negative: must be zero or lower
 * * aboveZero: must be above zero
 * * belowZero: must be below zero
 * * percentage: must be within 0-1, inclusive
 * * nonZero: can be anything except zero
 * @param value Value to check
 * @param parameterName Param name for customising exception message
 * @param range Guard specifier.
 */ const numbers_integerTest = (value, range = ``, parameterName = `?`)=>{
    // ✔️ Unit tested
    const r = numberTest(value, range, parameterName);
    if (!r[0]) return r;
    if (!Number.isInteger(value)) {
        return [
            false,
            `Param '${parameterName}' is not an integer`
        ];
    }
    return [
        true
    ];
};
const integerArrayTest = (numbers)=>{
    for (const v of numbers){
        if (Math.abs(v) % 1 !== 0) return [
            false,
            `Value is not an integer: ${v}`
        ];
    }
    return [
        true
    ];
};
/**
 * Returns _true_ if `value` is an integer in number or string form
 * @param value 
 * @returns 
 */ const isInteger = (value)=>{
    if (typeof value === `string`) value = Number.parseFloat(value);
    const r = numbers_integerTest(value);
    return r[0];
};
const throwIntegerTest = (value, range = ``, parameterName = `?`)=>{
    throw_from_result_throwFromResult(numbers_integerTest(value, range, parameterName));
};
const numberInclusiveRangeTest = (value, min, max, parameterName = `?`)=>{
    if (typeof value !== `number`) {
        return [
            false,
            `Param '${parameterName}' is not a number type. Got type: '${typeof value}' value: '${JSON.stringify(value)}'`
        ];
    }
    if (Number.isNaN(value)) {
        return [
            false,
            `Param '${parameterName}' is not within range ${min}-${max}. Got: NaN`
        ];
    }
    if (Number.isFinite(value)) {
        if (value < min) {
            return [
                false,
                `Param '${parameterName}' is below range ${min}-${max}. Got: ${value}`
            ];
        } else if (value > max) {
            return [
                false,
                `Param '${parameterName}' is above range ${min}-${max}. Got: ${value}`
            ];
        }
        return [
            true
        ];
    } else {
        return [
            false,
            `Param '${parameterName}' is not within range ${min}-${max}. Got: infinite`
        ];
    }
};
; // CONCATENATED MODULE: ../core/src/interval-type.ts
// export function intervalToMs(interval: Interval | undefined): number | undefined;
// export function intervalToMs(
//   interval: Interval | undefined,
//   defaultNumber: number
// ): number;
/**
 * Return the millisecond value of an Interval.
 * 
 * ```js
 * intervalToMs(100); // 100
 * intervalToMs({ millis: 100 }); // 100
 * ```
 *
 * Use `defaultNumber` to return a default in the case of
 * _undefined_ or invalid input.
 *
 * ```js
 * intervalToMs(undefined);      // throws error
 * intervalToMs(undefined, 100); // 100
 * ```
 *
 * If no default is provided, an exception is thrown.
 * @param interval Interval
 * @param defaultNumber Default value if `interval` is _undefined_ or invalid
 * @returns Milliseconds
 */ function interval_type_intervalToMs(interval1, defaultNumber) {
    if (isInterval(interval1)) {
        // Number given, must be millis?
        if (typeof interval1 === `number`) return interval1;
        let ms = interval1.millis ?? 0;
        ms += (interval1.hours ?? 0) * 60 * 60 * 1000;
        ms += (interval1.mins ?? 0) * 60 * 1000;
        ms += (interval1.secs ?? 0) * 1000;
        return ms;
    } else {
        if (typeof defaultNumber !== `undefined`) return defaultNumber;
        throw new Error(`Not a valid interval: ${interval1}`);
    }
}
/**
 * Returns _true_ if `interval` matches the {@link Interval} type.
 * @param interval 
 * @returns _True_ if `interval` is an {@link Interval}.
 */ function isInterval(interval1) {
    if (interval1 === undefined) return false;
    if (interval1 === null) return false;
    if (typeof interval1 === `number`) {
        if (Number.isNaN(interval1)) return false;
        if (!Number.isFinite(interval1)) return false;
        return true;
    } else if (typeof interval1 !== `object`) return false;
    const hasMillis = `millis` in interval1;
    const hasSecs = `secs` in interval1;
    const hasMins = `mins` in interval1;
    const hasHours = `hours` in interval1;
    if (hasMillis && !numberTest(interval1.millis)[0]) return false;
    if (hasSecs && !numberTest(interval1.secs)[0]) return false;
    if (hasMins && !numberTest(interval1.mins)[0]) return false;
    if (hasHours && !numberTest(interval1.hours)[0]) return false;
    if (hasMillis || hasSecs || hasHours || hasMins) return true;
    return false;
}
/**
 * Returns a human-readable representation
 * of some elapsed milliseconds
 * 
 * @example
 * ```js
 * elapsedToHumanString(10);      // `10ms`
 * elapsedToHumanString(2000);    // `2s`
 * elapsedToHumanString(65*1000); // `1mins`
 * ```
 * @param millisOrFunction Milliseconds as a number, {@link Interval} or function that resolve to a number
 * @param rounding Rounding (default: 2)
 * @returns 
 */ const elapsedToHumanString = (millisOrFunction, rounding = 2)=>{
    let interval1 = {} = 0;
    if (typeof millisOrFunction === `function`) {
        const intervalResult = millisOrFunction();
        return elapsedToHumanString(intervalResult);
    } else if (typeof millisOrFunction === `number`) {
        interval1 = millisOrFunction;
    } else if (typeof millisOrFunction === `object`) {
        interval1 = interval_type_intervalToMs(interval1);
    }
    let ms = interval_type_intervalToMs(interval1);
    if (typeof ms === `undefined`) return `(undefined)`;
    if (ms < 1000) return `${round(rounding, ms)}ms`;
    ms /= 1000;
    if (ms < 120) return `${ms.toFixed(1)}secs`;
    ms /= 60;
    if (ms < 60) return `${ms.toFixed(2)}mins`;
    ms /= 60;
    return `${ms.toFixed(2)}hrs`;
};
; // CONCATENATED MODULE: ../iterables/src/guard.ts
const guard_isAsyncIterable = (v)=>{
    if (typeof v !== `object`) return false;
    if (v === null) return false;
    return Symbol.asyncIterator in v;
};
const guard_isIterable = (v)=>{
    if (typeof v !== `object`) return false;
    if (v === null) return false;
    return Symbol.iterator in v;
};
; // CONCATENATED MODULE: ../rx/src/util.ts
function messageIsSignal(message) {
    if (message.value !== undefined) return false;
    if (`signal` in message && message.signal !== undefined) return true;
    return false;
}
function messageIsDoneSignal(message) {
    if (message.value !== undefined) return false;
    if (`signal` in message && message.signal === `done`) return true;
    return false;
}
/**
 * Returns _true_ if `v` has a non-undefined value. Note that sometimes
 * _undefined_ is a legal value to pass
 * @param v 
 * @returns 
 */ function messageHasValue(v) {
    if (v.value !== undefined) return true;
    return false;
}
const isPingable = (rx)=>{
    if (!isReactive(rx)) return false;
    if (`ping` in rx) {
        return true;
    }
    return false;
};
const hasLast = (rx)=>{
    if (!isReactive(rx)) return false;
    if (`last` in rx) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const v = rx.last();
        if (v !== undefined) return true;
    }
    return false;
};
/**
 * Returns _true_ if `rx` is a Reactive
 * @param rx 
 * @returns 
 */ const isReactive = (rx)=>{
    if (typeof rx !== `object`) return false;
    if (rx === null) return false;
    return `on` in rx && `onValue` in rx;
};
/**
 * Returns true if `rx` is a disposable reactive.
 * @param rx 
 * @returns 
 */ // export const isDisposable = <V>(rx: Reactive<V> | ReactiveWritable<V>): rx is ReactiveDisposable<V> => {
//   if (!isReactive(rx)) return false;
//   return (`isDisposed` in rx && `dispose` in rx);
// }
/**
 * Returns _true_ if `rx` is a writable Reactive
 * @param rx 
 * @returns 
 */ const isWritable = (rx)=>{
    if (!isReactive(rx)) return false;
    if (`set` in rx) return true;
    return false;
};
const isWrapped = (v)=>{
    if (typeof v !== `object`) return false;
    if (!(`source` in v)) return false;
    if (!(`annotate` in v)) return false;
    return true;
};
// export const opify = <TIn, TOut = TIn,>(fn: (source: ReactiveOrSource<TIn>, ...args: Array<any>) => Reactive<TOut>, ...args: Array<any>) => {
//   return (source: ReactiveOrSource<TIn>) => {
//     return fn(source, ...args);
//   }
// }
const opify = (fn, ...args)=>{
    return (source)=>{
        return fn(source, ...args);
    };
};
const isTriggerValue = (t)=>`value` in t;
const isTriggerFunction = (t)=>`fn` in t;
const isTriggerGenerator = (t)=>guard_isIterable(t);
const isTrigger = (t)=>{
    if (typeof t !== `object`) return false;
    if (isTriggerValue(t)) return true;
    if (isTriggerFunction(t)) return true;
    if (isTriggerGenerator(t)) return true;
    return false;
};
/**
 * Resolves a trigger value.
 * 
 * A trigger can be a value, a function or generator. Value triggers never complete.
 * A trigger function is considered complete if it returns undefined.
 * A trigger generator is considered complete if it returns done.
 * 
 * Returns `[value, _false_]` if we have a value and trigger is not completed.
 * Returns `[value, _true_]` trigger is completed
 * @param t 
 * @returns 
 */ function resolveTriggerValue(t) {
    if (isTriggerValue(t)) return [
        t.value,
        false
    ];
    if (isTriggerFunction(t)) {
        const v = t.fn();
        if (v === undefined) return [
            undefined,
            true
        ];
        return [
            v,
            false
        ];
    }
    if (isTriggerGenerator(t)) {
        const v = t.gen.next();
        if (v.done) return [
            undefined,
            true
        ];
        return [
            v.value,
            false
        ];
    }
    throw new Error(`Invalid trigger. Missing 'value' or 'fn' fields`);
}
; // CONCATENATED MODULE: ../flow/src/dispatch-list.ts
class DispatchList {
    #handlers;
    #counter = 0;
    #id = Math.floor(Math.random() * 100);
    constructor(){
        this.#handlers = [];
    }
    /**
   * Returns _true_ if list is empty
   * @returns 
   */ isEmpty() {
        return this.#handlers.length === 0;
    }
    /**
   * Adds a handler
   * @param handler 
   * @param options 
   * @returns 
   */ add(handler, options = {}) {
        this.#counter++;
        const once = options.once ?? false;
        const wrap1 = {
            id: `${this.#id} - ${this.#counter}`,
            handler,
            once
        };
        this.#handlers.push(wrap1);
        return wrap1.id;
    }
    remove(id) {
        const length = this.#handlers.length;
        this.#handlers = this.#handlers.filter((handler)=>handler.id !== id);
        return this.#handlers.length !== length;
    }
    notify(value) {
        for (const handler of this.#handlers){
            handler.handler(value);
            if (handler.once) {
                this.remove(handler.id);
            }
        }
    }
    clear() {
        this.#handlers = [];
    }
}
; // CONCATENATED MODULE: ../core/src/continuously.ts
/**
 * Returns a {@link Continuously} that continually executes `callback` at `interval` rate.
 * 
 * By default, first the sleep period happens and then the callback happens.
 *
 * Call `start` to begin/reset loop. The looping stops when `cancel` is called, or when `callback` returns _false_.
 *
 * @example
 * Animation loop
 * ```js
 * const draw = () => {
 *  // Draw on canvas
 * }
 *
 * // Run draw() synchronised with monitor refresh rate via `window.requestAnimationFrame`
 * continuously(draw).start();
 * ```
 *
 * @example
 * With delay
 * ```js
 * const fn = () => {
 *  // Runs after one minute
 * }
 * const c = continuously(fn, { mins: 1 } );
 * c.start(); // Runs `fn` every minute
 * ```
 *
 * @example
 * Control a 'continuously'
 * ```js
 * c.cancel();   // Stop the loop, cancelling any up-coming calls to `fn`
 * c.elapsedMs;  // How many milliseconds have elapsed since start
 * c.ticks;      // How many iterations of loop since start
 * c.interval;   // Get/set speed of loop. Change kicks-in at next loop.
 *               // Use .start() to reset to new interval immediately
 * ```
 *
 * Asynchronous callback functions are supported too:
 * ```js
 * continuously(async () => { ..});
 * ```
 *
 * The `callback` function can receive a few arguments:
 * 
 * ```js
 * continuously( (ticks, elapsedMs) => {
 *  // ticks: how many times loop has run
 *  // elapsedMs:  how long since last loop
 * }).start();
 * ```
 *
 * If the callback explicitly returns _false_, the loop will be cancelled.
 * 
 * ```js
 * continuously(ticks => {
 *  // Stop after 100 iterations
 *  if (ticks > 100) return false;
 * }).start();
 * ```
 *
 * You can intercept the logic for calls to `start()` with `onStartCalled`. It can determine
 * whether the `start()` proceeds, if the loop is cancelled, or the whole thing disposed,
 * so it can't run any longer.
 * 
 * ```js
 * continuously(callback, intervalMs, {
 *  onStartCalled:(ticks, elapsedMs) => {
 *    // Cancel the loop after 1000ms has elapsed
 *    if (elapsedMs > 1000) return `cancel`;
 *  }
 * }).start();
 * ```
 *
 * To run `callback` *before* the sleep happens, set `fireBeforeWait`:
 * ```js
 * continuously(callback, intervalMs, { fireBeforeWait: true });
 * ```
 * @param callback - Function to run. If it returns _false_, loop exits.
 * @param options - {@link ContinuouslyOpts ContinuouslyOpts}
 * @param interval - Speed of loop (default: 0)
 * @returns Instance to control looping.
 * @see {@link Timeout} if you want to trigger something once.
 */ const continuously = (callback, interval1, options = {})=>{
    let intervalMs = interval_type_intervalToMs(interval1, 0);
    throwIntegerTest(intervalMs, `positive`, `interval`);
    const fireBeforeWait = options.fireBeforeWait ?? false;
    const onStartCalled = options.onStartCalled;
    const signal = options.signal;
    let disposed = false;
    let runState = `idle`;
    let startCount = 0;
    let startCountTotal = 0;
    let startedAt = performance.now();
    let intervalUsed = interval1 ?? 0;
    let cancelled = false;
    let currentTimer;
    const deschedule = ()=>{
        if (currentTimer === undefined) return;
        globalThis.clearTimeout(currentTimer);
        currentTimer = undefined;
        startCount = 0;
        startedAt = Number.NaN;
    };
    const schedule = (scheduledCallback)=>{
        if (intervalMs === 0) {
            if (typeof requestAnimationFrame === `undefined`) {
                currentTimer = globalThis.setTimeout(scheduledCallback, 0);
            } else {
                currentTimer = undefined;
                requestAnimationFrame(scheduledCallback);
            }
        } else {
            currentTimer = globalThis.setTimeout(scheduledCallback, intervalMs);
        }
    };
    const cancel = ()=>{
        if (cancelled) return;
        cancelled = true;
        if (runState === `idle`) return; // No need to cancel
        runState = `idle`;
        deschedule();
    };
    const loop = async ()=>{
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
        // Didn't get a value, exit out
        if (value !== undefined && !value) {
            cancel();
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (cancelled) return; // has been cancelled
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        schedule(loop);
    };
    const start = ()=>{
        if (disposed) throw new Error(`Disposed`);
        cancelled = false;
        if (onStartCalled !== undefined) {
            // A function governs whether to allow .start() to go ahead
            const doWhat = onStartCalled(startCount, performance.now() - startedAt);
            switch(doWhat){
                case `cancel`:
                    {
                        cancel();
                        return;
                    }
                case `reset`:
                    {
                        reset();
                        return;
                    }
                case `dispose`:
                    {
                        disposed = true;
                        cancel();
                        return;
                    }
            }
        }
        if (runState === `idle`) {
            // Start running
            startCount = 0;
            startedAt = performance.now();
            runState = `scheduled`;
            if (fireBeforeWait) {
                void loop(); // Exec first, then wait
            } else {
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                schedule(loop); // Wait first, then exec
            }
        } // else: already running, ignore
    };
    const reset = ()=>{
        if (disposed) throw new Error(`Disposed`);
        cancelled = false;
        startCount = 0;
        startedAt = Number.NaN;
        // Cancel scheduled iteration
        if (runState !== `idle`) {
            cancel();
        }
        start();
    };
    return {
        start,
        reset,
        cancel,
        get interval () {
            return intervalUsed;
        },
        get runState () {
            return runState;
        },
        get startCountTotal () {
            return startCountTotal;
        },
        get startCount () {
            return startCount;
        },
        set interval (interval){
            const ms = interval_type_intervalToMs(interval, 0);
            throwIntegerTest(ms, `positive`, `interval`);
            intervalMs = ms;
            intervalUsed = interval;
        },
        get isDisposed () {
            return disposed;
        },
        get elapsedMs () {
            return performance.now() - startedAt;
        }
    };
};
; // CONCATENATED MODULE: ../debug/src/index.ts
const src_getErrorMessage = (ex)=>{
    if (typeof ex === `string`) return ex;
    if (ex instanceof Error) {
        return ex.message;
    }
    return ex;
};
; // CONCATENATED MODULE: ../core/src/sleep.ts
if (typeof window === `undefined` || !(`requestAnimationFrame` in window)) {
    // eslint-disable-next-line unicorn/no-lonely-if
    if (typeof window === `undefined`) {
        // @ts-expect-error
        globalThis.requestAnimationFrame = (callback)=>{
            setTimeout(callback, 1);
        };
    }
}
/**
 * Returns after timeout period.
 *
 * @example In an async function
 * ```js
 * console.log(`Hello`);
 * await sleep(1000);
 * console.log(`There`); // Prints one second after
 * ```
 *
 * @example As a promise
 * ```js
 * console.log(`Hello`);
 * sleep({ millis: 1000 })
 *  .then(() => console.log(`There`)); // Prints one second after
 * ```
 *
 * If a timeout of 0 is given, `requestAnimationFrame` is used instead of `setTimeout`.
 *
 * {@link delay} and {@link sleep} are similar. `delay()` takes a parameter of what code to execute after the timeout, while `sleep()` just resolves after the timeout.
 *
 * A value can be provided, which is returned on awaking:
 * ```js
 * const v = await sleep({ seconds: 1, value: `hello`);
 * // v = `hello`
 * ```
 *
 * Provide an AbortSignal to cancel the sleep and throwing an exception
 * so code after the sleep doesn't happen.
 *
 * ```js
 * const ac = new AbortController();
 * setTimeout(() => { ac.abort(); }, 1000); // Abort after 1s
 *
 * // Sleep for 1min
 * await sleep({ minutes: 1, signal: ac.signal });
 * console.log(`Awake`); // This line doesn't get called because an exception is thrown when aborting
 * ```
 * @param optsOrMillis Milliseconds to sleep, or options
 * @return
 */ const sleep_sleep = (optsOrMillis)=>{
    const timeoutMs = interval_type_intervalToMs(optsOrMillis, 1);
    const signal = optsOrMillis.signal;
    const value = optsOrMillis.value;
    throwNumberTest(timeoutMs, `positive`, `timeoutMs`);
    // eslint-disable-next-line unicorn/prefer-ternary
    if (timeoutMs === 0) {
        return new Promise((resolve)=>requestAnimationFrame((_)=>{
                resolve(value);
            }));
    } else {
        return new Promise((resolve, reject)=>{
            const onAbortSignal = ()=>{
                clearTimeout(t);
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
            const t = setTimeout(()=>{
                signal?.removeEventListener(`abort`, onAbortSignal);
                if (signal?.aborted) {
                    reject(new Error(signal.reason));
                    return;
                }
                resolve(value);
            }, timeoutMs);
        });
    }
};
/**
 * Delays until `predicate` returns true.
 * Can be useful for synchronising with other async activities.
 * ```js
 * // Delay until 'count' reaches 5
 * await sleepWhile(() => count >= 5, 100);
 * ```
 * @param predicate 
 * @param checkInterval 
 */ const sleepWhile = async (predicate, checkInterval = 100)=>{
    while(predicate()){
        await sleep_sleep(checkInterval);
    }
};
; // CONCATENATED MODULE: ../rx/src/from/function.ts
/**
 * Produces a reactive from the basis of a function. `callback` is executed, with its result emitted via the returned reactive.
 * 
 * ```js
 * // Produce a random number every second
 * const r = Rx.From.func(Math.random, { interval: 1000 });
 * ```
 * 
 * `callback` can be called repeatedly by providing the `interval` option to set the rate of repeat.
 * Looping can be limited with `options.maximumRepeats`, or passing a signal `options.signal`
 * and then activating it. 
 * ```js
 * // Reactive that emits a random number every second, five times
 * const r1 = Rx.From.func(Math.random, { interval: 1000, maximumRepeats: 5 }
 * ```
 * 
 * ```js
 * // Generate a random number every second until ac.abort() is called
 * const ac = new AbortController();
 * const r2 = Rx.From.func(Math.random, { interval: 1000, signal: ac.signal });
 * ```
 * 
 * The third option is for `callback` to fire the provided abort function.
 * ```js
 * Rx.From.func((abort) => {
 *  if (Math.random() > 0.5) abort('Random exit');
 *  return 1;
 * });
 * ```
 *
 * By default has a laziness of 'very' meaning that `callback` is run only when there's a subscriber 
 * By default stream closes if `callback` throws an error. Use `options.closeOnError:'ignore'` to change.
 * @param callback 
 * @param options 
 * @returns 
 */ function func(callback, options = {}) {
    const maximumRepeats = options.maximumRepeats ?? Number.MAX_SAFE_INTEGER;
    const closeOnError = options.closeOnError ?? true;
    const intervalMs = options.interval ? interval_type_intervalToMs(options.interval) : -1;
    let manual = options.manual ?? false;
    // If niether interval or manual is set, assume manual
    if (options.interval === undefined && options.manual === undefined) manual = true;
    if (manual && options.interval) throw new Error(`If option 'manual' is set, option 'interval' cannot be used`);
    const predelay = interval_type_intervalToMs(options.predelay, 0);
    const lazy = options.lazy ?? `very`;
    const signal = options.signal;
    const internalAbort = new AbortController();
    const internalAbortCallback = (reason)=>{
        internalAbort.abort(reason);
    };
    let sentResults = 0;
    let enabled = false;
    const done = (reason)=>{
        events.dispose(reason);
        enabled = false;
        if (run) run.cancel();
    };
    const ping = async ()=>{
        if (!enabled) return false;
        if (predelay) await sleep_sleep(predelay);
        if (sentResults >= maximumRepeats) {
            done(`Maximum repeats reached ${maximumRepeats.toString()}`);
            return false;
        }
        //console.log(`sent: ${ sentResults } max: ${ maximumRepeats }`);
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
                done(`Function error: ${src_getErrorMessage(error)}`);
                return false;
            } else {
                events.signal(`warn`, src_getErrorMessage(error));
                return true;
            }
        }
    };
    const run = manual ? undefined : continuously(async ()=>{
        const pingResult = await ping();
        if (!pingResult) return false;
        // if (!loop) {
        //   done(`fromFunction done`);
        //   return false; // Stop loop
        // }
        if (internalAbort.signal.aborted) {
            done(`callback function aborted (${internalAbort.signal.reason})`);
            return false;
        }
    }, intervalMs);
    const events = initLazyStream({
        lazy,
        onStart () {
            enabled = true;
            if (run) run.start();
        },
        onStop () {
            enabled = false;
            if (run) run.cancel();
        }
    });
    if (lazy === `never` && run) run.start();
    return {
        ...events,
        ping
    };
}
; // CONCATENATED MODULE: ../iterables/src/async.ts
/**
 * Yield values from `array`, one at a time.
 * Use `interval` to add time between each item.
 * The first item is yielded without delay.
 * 
 * @param array Array of values
 * @param interval Interval (defaults: 1ms)
 */ async function* fromArray(array, interval1 = 1) {
    for (const v of array){
        yield v;
        await sleep(interval1);
    }
}
/**
 * Yield values from `iterable`, one at a time.
 * Use `interval` to add time between each item.
 * The first item is yielded without delay.
 * @param iterable Iterable or AsyncIterable
 * @param [interval=1] Interval to wait between yield
 */ async function* fromIterable(iterable, interval1 = 1) {
    for await (const v of iterable){
        yield v;
        await sleep(interval1);
    }
}
async function* async_chunks(it, size) {
    // Source: https://surma.github.io/underdash/
    let buffer = [];
    for await (const v of it){
        buffer.push(v);
        if (buffer.length === size) {
            yield buffer;
            buffer = [];
        }
    }
    if (buffer.length > 0) yield buffer;
}
async function* concat(...its) {
    // Source: https://surma.github.io/underdash/
    for await (const it of its)yield* it;
}
async function* dropWhile(it, f) {
    for await (const v of it){
        if (!f(v)) {
            yield v;
        }
    }
}
/**
 * Loops over a generator until it finishes, calling `callback`.
 * Useful if you don't care about the value generator produces, just the number of loops.
 * 
 * In this version, we do a `for await of` over `gen`, and also `await callback()`. 

 * ```js
 * await until(count(5), () => {
 * // do something 5 times
 * });
 * ```
 * 
 * If you want the value from the generator, use a `for of` loop as usual.
 * 
 * If `callback` explicitly returns _false_, the generator is aborted.
 * @param it Generator to run
 * @param callback Code to call for each iteration
 */ // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
const until = async (it, callback)=>{
    for await (const _ of it){
        const value = await callback();
        if (typeof value === `boolean` && !value) break;
    }
};
/**
 * This generator will repeat another generator up until some condition. This is the version
 * that can handle async generators.
 * 
 * For example, {@link count} will count from 0..number and then finish:
 * ```js
 * for (const v of count(5)) {
 *  // v: 0, 1, 2, 3, 4
 * }
 * ```
 * 
 * But what if we want to repeat the count? We have to provide a function to create the generator,
 * rather than using the generator directly, since it's "one time use"
 * ```js
 * for await (const v of repeat(() => count(5))) {
 *  // v: 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, ...
 *  // warning: never ends
 * }
 * ```
 * 
 * Limiting the number of repeats can be done by passing in extra parameters
 * ```js
 * repeat(generator, { count: 5} ); // Iterate over `generator` five times
 * ```
 * 
 * ```js
 * const ac = new AbortController();
 * repeat(generator, { signal: ac.signal }); // Pass in signal
 * ...
 * ac.abort(); // Trigger signal at some point
 * ```
 * @param genCreator 
 * @param repeatsOrSignal 
 */ const async_repeat = async function*(genCreator, repeatsOrSignal) {
    const repeats = typeof repeatsOrSignal === `number` ? repeatsOrSignal : Number.POSITIVE_INFINITY;
    const signal = typeof repeatsOrSignal === `number` ? undefined : repeatsOrSignal;
    let count = repeats;
    while(true){
        for await (const v of genCreator()){
            yield v;
            if (signal?.aborted) break;
        }
        if (Number.isFinite(repeats)) {
            count--;
            if (count === 0) break;
        }
        if (signal?.aborted) break;
    }
};
/**
 * Returns true if items in two iterables are equal, as
 * determined by the `equality` function.
 * Order matters. It compares items at the same 'step' of each iterable.
 * @param it1
 * @param it2
 * @param equality
 * @returns
 */ async function equals(it1, it2, equality) {
    // https://surma.github.io/underdash/
    const iit1 = it1[Symbol.asyncIterator](); // it1[ Symbol.iterator ]();
    const iit2 = it2[Symbol.asyncIterator]();
    while(true){
        const index1 = await iit1.next();
        const index2 = await iit2.next();
        if (equality !== undefined) {
            if (!equality(index1.value, index2.value)) return false;
        } else if (index1.value !== index2.value) return false;
        if (index1.done ?? index2.done) return index1.done && index2.done;
    }
}
async function every(it, f) {
    for await (const v of it){
        const result = await f(v);
        if (!result) return false;
    }
    return true;
}
async function* fill(it, v) {
    // https://surma.github.io/underdash/
    for await (const _ of it)yield v;
}
/**
 * Filters an iterable, only yielding items which match `f`.
 *
 * ```js
 * filter([1, 2, 3, 4], e => e % 2 == 0);
 * returns [2, 4]
 * ```
 * @param it
 * @param f
 */ async function* async_filter(it, f) {
    // https://surma.github.io/underdash/
    for await (const v of it){
        if (!await f(v)) continue;
        yield v;
    }
}
async function find(it, f) {
    // https://surma.github.io/underdash/
    for await (const v of it){
        if (await f(v)) return v;
    }
}
async function* flatten(it) {
    // https://surma.github.io/underdash/
    for await (const v of it){
        if (typeof v === `object`) {
            if (Array.isArray(v)) {
                for (const vv of v)yield vv;
            } else if (isAsyncIterable(v)) {
                for await (const vv of v){
                    yield vv;
                }
            } else if (isIterable(v)) {
                for (const vv of v){
                    yield vv;
                }
            }
        } else {
            yield v;
        }
    }
}
/**
 * Iterates over an async iterable or array, calling `fn` for each value, with optional
 * interval between each loop. If the async `fn` returns _false_, iterator cancels.
 *
 * ```
 * import { forEach } from "https://unpkg.com/ixfx/dist/flow.js"
 * // Prints items from array every second
 * await forEach([0,1,2,3], i => console.log(i), 1000);
 * ```
 *
 * ```
 * // Retry up to five times, with 5 seconds between each attempt
 * await forEach(count(5), i=> {
 *  try {
 *    await doSomething();
 *    return false; // Succeeded, exit early
 *  } catch (ex) {
 *    console.log(ex);
 *    return true; // Keep trying
 *  }
 * }, 5000);
 * ```
 * @param iterator Iterable thing to loop over
 * @param fn Function to invoke on each item. If it returns _false_ loop ends.
 * @param options Options
 * @typeParam V Type of iterable
 */ const forEach = async function(iterator, fn, options = {}) {
    const interval1 = options.interval;
    if (Array.isArray(iterator)) {
        // Handle array
        for (const x of iterator){
            const r = await fn(x);
            if (typeof r === `boolean` && !r) break;
            if (interval1) await sleep(interval1);
        }
    } else {
        // Handle an async iterator
        for await (const x of iterator){
            const r = await fn(x);
            if (typeof r === `boolean` && !r) break;
            if (interval1) await sleep(interval1);
        }
    }
};
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
// export async function forEach<V>(it: AsyncIterable<V>, f: (v: V) => void | boolean | Promise<boolean | void>) {
//   // https://surma.github.io/underdash/
//   for await (const v of it) {
//     const result = await f(v);
//     if (typeof result === `boolean` && !result) break;
//   }
// }
/**
 * Returns last value from an iterable, or _undefined_
 * if no values are generated
 * @param it
 */ async function async_last(it, opts = {}) {
    const abort = opts.abort;
    let returnValue;
    for await (const value of it){
        if (abort?.aborted) return undefined;
        returnValue = value;
    }
    return returnValue;
}
/**
 * Maps an iterable through function `f`
 * ```js
 * // For every input value, multiply it by itself
 * map([1, 2, 3], e => e*e)
 * // Yields: 1, 4, 9
 * ```
 * 
 * It can also be used to transform types:
 * ```js
 * map([1, 2, 3], e => { value: e });
 * // Yields: { value: 1 }, { value: 2 }, { value: 3 }
 * ```
 * @param it
 * @param f
 */ //eslint-disable-next-line func-style
async function* async_map(it, f) {
    // https://surma.github.io/underdash/
    for await (const v of it){
        yield f(v);
    }
}
async function* async_max(it, gt = (a, b)=>a > b) {
    let max1;
    for await (const v of it){
        if (max1 === undefined) {
            max1 = v;
            yield max1;
            continue;
        }
        // If V is bigger than max, we have a new max
        if (gt(v, max1)) {
            max1 = v;
            yield v;
        }
    }
}
/**
 * Returns the minimum seen of an iterable as it changes.
 * Streaming result: works with endless iterables.
 * 
 * Note that `gt` function returns true if A is _greater_ than B, even
 * though we're looking for the minimum.
 * 
 * ```js
 * // Rank objects based on 'v' value
 * const rank = (a,b) => a.v > b.v;
 * min([
 *  {i:0,v:1},
 *  {i:1,v:9},
 *  {i:2,v:-2}
 * ], rank);
 * // Yields: {i:2, v:1}, {i:2,v:-2}
 * ```
 * @param it Iterable
 * @param gt Should return _true_ if `a` is greater than `b`.
 * @returns
 */ async function* async_min(it, gt = (a, b)=>a > b) {
    let min1;
    for await (const v of it){
        if (min1 === undefined) {
            min1 = v;
            yield min1;
            continue;
        }
        // If min is bigger than V, V is the new min
        if (gt(min1, v)) {
            min1 = v;
            yield v;
        }
    }
    return min1;
}
async function reduce(it, f, start) {
    // https://surma.github.io/underdash/
    for await (const v of it)start = f(start, v);
    return start;
}
/**
 * Calls `callback` whenever the async generator produces a value.
 * 
 * When using `asCallback`, call it with `await` to let generator 
 * run its course before continuing:
 * ```js
 * await asCallback(tick({ interval:1000, loops:5 }), x => {
 *  // Gets called 5 times, with 1000ms interval
 * });
 * console.log(`Hi`); // Prints after 5 seconds
 * ```
 * 
 * Or if you skip the `await`, code continues and callback will still run:
 * ```js
 * asCallback(tick({ interval: 1000, loops: 5}), x => {
 *  // Gets called 5 times, with 1000ms interval
 * });
 * console.log(`Hi`); // Prints immediately
 * ```
 * @param input 
 * @param callback 
 */ async function asCallback(input, callback, onDone) {
    for await (const value of input){
        callback(value);
    }
    if (onDone) onDone();
}
async function* slice(it, start = 0, end = Number.POSITIVE_INFINITY) {
    console.log(`Async slice start: ${start}`);
    // https://surma.github.io/underdash/
    const iit = it[Symbol.asyncIterator]();
    if (end < start) throw new Error(`Param 'end' should be more than 'start'`);
    for(; start > 0; start--, end--)await iit.next();
    for await (const v of it){
        if (end-- > 0) {
            yield v;
        } else {
            break;
        }
    }
}
/**
 * Enumerates over an input iterable, with a delay between items.
 * @param it 
 * @param delay 
 */ async function* withDelay(it, delay) {
    for (const v of it){
        await sleep(delay);
        yield v;
    }
}
/***
 * Returns the next IteratorResult,
 * throwing an error if it does not happen
 * within `interval` (default: 1s)
 */ async function nextWithTimeout(it, options) {
    const ms = interval_type_intervalToMs(options, 1000);
    const value = await Promise.race([
        (async ()=>{
            await sleep_sleep({
                millis: ms,
                signal: options.signal
            });
            // eslint-disable-next-line unicorn/no-useless-undefined
            return undefined;
        })(),
        (async ()=>{
            return await it.next();
        })()
    ]);
    if (value === undefined) throw new Error(`Timeout`);
    return value;
}
async function some(it, f) {
    // https://surma.github.io/underdash/
    for await (const v of it){
        if (await f(v)) return true;
    }
    return false;
}
// export async function* takeWhile<V>(
//   it: AsyncIterable<V>,
//   f: (v: V) => boolean
// ) {
//   // https://surma.github.io/underdash/
//   for await (const v of it) {
//     if (!f(v)) return;
//     yield v;
//   }
// }
/**
 * Returns an array of values from an iterator.
 *
 * ```js
 * const data = await toArray(adsrIterable(opts, 10));
 * ```
 *
 * Note: If the iterator is infinite, be sure to provide limits via the options.
 * ```js
 * // Return maximum five items
 * const data = await toArray(iterable, { limit: 5 });
 * // Return results for a maximum of 5 seconds
 * const data = await toArray(iterable, { elapsed: 5000 });
 * ```
 * Note that limits are ORed, `toArray` will finish if either of them is true.
 * 
 * @param it Asynchronous iterable
 * @param options Options when converting to array
 * @returns
 */ async function toArray(it, options = {}) {
    // https://2ality.com/2016/10/asynchronous-iteration.html
    const result = [];
    const iterator = it[Symbol.asyncIterator]();
    const started = Date.now();
    const maxItems = options.limit ?? Number.POSITIVE_INFINITY;
    const whileFunc = options.while;
    const maxElapsed = intervalToMs(options.elapsed, Number.POSITIVE_INFINITY);
    while(result.length < maxItems && Date.now() - started < maxElapsed){
        if (whileFunc) {
            if (!whileFunc(result.length)) break;
        }
        const r = await iterator.next();
        if (r.done) break;
        //eslint-disable-next-line functional/immutable-data
        result.push(r.value);
    }
    return result;
}
async function* unique(iterable) {
    const buffer = [];
    const itera = Array.isArray(iterable) ? iterable : [
        iterable
    ];
    for await (const it of itera){
        for await (const v of it){
            if (buffer.includes(v)) continue;
            buffer.push(v);
            yield v;
        }
    }
}
async function* uniqueByValue(input, toString = toStringDefault, seen = new Set()) {
    for await (const v of input){
        const key = toString(v);
        if (seen.has(key)) continue;
        seen.add(key);
        yield v;
    }
}
/**
 * Returns unique items from iterables, given a particular key function
 * ```js
 * unique([{i:0,v:2},{i:1,v:3},{i:2,v:2}], e => e.v);
 * Yields:  [{i:0,v:2},{i:1,v:3}]
 * @param it
 * @param f
 */ //eslint-disable-next-line func-style
// export async function* unique<V>(
//   it: AsyncIterable<V>,
//   f: (id: V) => V = (id) => id
// ) {
//   // https://surma.github.io/underdash/
//   const buffer: Array<V> = [];
//   for await (const v of it) {
//     const fv = f(v);
//     if (buffer.includes(fv)) continue;
//     buffer.push(fv);
//     yield v;
//   }
// }
/**
 * Combine same-positioned items from several iterables
 * ```js
 * zip( [1, 2, 3], [4, 5, 6], [7, 8, 9] );
 * Yields: [ [1, 4, 7], [2, 5, 8], [3, 6, 9] ]
 * ```
 * @param its
 * @returns
 */ async function* zip(...its) {
    // https://surma.github.io/underdash/
    const iits = its.map((it)=>it[Symbol.asyncIterator]());
    while(true){
        const vs = await Promise.all(iits.map((it)=>it.next()));
        if (vs.some((v)=>v.done)) return;
        yield vs.map((v)=>v.value);
    }
}
; // CONCATENATED MODULE: ../arrays/src/util/to-string.ts
/**
 * A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
 */ const to_string_toStringDefault = (itemToMakeStringFor)=>typeof itemToMakeStringFor === `string` ? itemToMakeStringFor : JSON.stringify(itemToMakeStringFor);
; // CONCATENATED MODULE: ../arrays/src/unique.ts
//import { additionalValues } from "../iterables/sync/AdditionalValues.js";
/**
 * Combines the values of one or more arrays, removing duplicates.
 * ```js
 * const v = Arrays.uniqueDeep([ [1, 2, 3, 4], [ 3, 4, 5, 6] ]);
 * // [ 1, 2, 3, 4, 5, 6]
 * ```
 *
 * A single array can be provided as well:
 * ```js
 * const v = Arrays.uniqueDeep([ 1, 2, 3, 1, 2, 3 ]);
 * // [ 1, 2, 3 ]
 * ```
 * 
 * By default uses Javascript's default equality checking
 * 
 * See also:
 * * {@link intersection}: Overlap between two arrays
 * * {@link additionalValues}: Yield values from an iterable not present in the other
 * * {@link containsDuplicateValues}: Returns true if array contains duplicates
 * @param arrays
 * @param comparer
 * @returns
 */ const uniqueDeep = (arrays, comparer = isEqualDefault)=>{
    const t = [];
    const contains = (v)=>{
        for (const tValue of t){
            if (comparer(tValue, v)) return true;
        }
        return false;
    };
    const flattened = arrays.flat(10);
    for (const v of flattened){
        if (!contains(v)) t.push(v);
    }
    return t;
};
/**
 * Combines the values of one or more arrays, removing duplicates.
 * Compares based on a string representation of object. Uses a Set
 * to avoid unnecessary comparisons, perhaps faster than `uniqueDeep`.
 * 
 * ```js
 * const v = Arrays.unique([ [1, 2, 3, 4], [ 3, 4, 5, 6] ]);
 * // [ 1, 2, 3, 4, 5, 6]
 * ```
 *
 * A single array can be provided as well:
 * ```js
 * const v = Arrays.unique([ 1, 2, 3, 1, 2, 3 ]);
 * // [ 1, 2, 3 ]
 * ```
 * 
 * By default uses JSON.toString() to compare values.
 * 
 * See also:
 * * {@link intersection}: Overlap between two arrays
 * * {@link additionalValues}: Yield values from an iterable not present in the other
 * * {@link containsDuplicateValues}: Returns true if array contains duplicates
 * @param arrays
 * @param comparer
 * @returns
 */ const unique_unique = (arrays, toString = to_string_toStringDefault)=>{
    const matching = new Set();
    const t = [];
    const flattened = arrays.flat(10);
    for (const a of flattened){
        const stringRepresentation = toString(a);
        if (matching.has(stringRepresentation)) continue;
        matching.add(stringRepresentation);
        t.push(a);
    }
    return t;
};
; // CONCATENATED MODULE: ../flow/src/state-machine/state-machine.ts
/**
 * Clones machine state
 * @param toClone
 * @returns Cloned of `toClone`
 */ const cloneState = (toClone)=>{
    return Object.freeze({
        value: toClone.value,
        visited: [
            ...toClone.visited
        ],
        machine: toClone.machine
    });
};
/**
 * Initialises a state machine
 * ```js
 * const desc = {
 *  pants: ['shoes','socks'],
 *  socks: ['shoes', 'pants'],
 *  shoes: 'shirt',
 *  shirt: null
 * }
 * // Defaults to first key, 'pants'
 * let sm = StateMachine.init(descr);
 * // Move to 'shoes' state
 * sm = StateMachine.to(sm, 'shoes');
 * sm.state; // 'shoes'
 * sm.visited; // [ 'pants' ]
 * StateMachineLight.isDdone(sm); // false
 * StateMachineLight.possible(sm); // [ 'shirt' ]
 * ```
 * @param stateMachine Settings for state machine
 * @param initialState Initial state name
 * @returns
 */ const state_machine_init = (stateMachine, initialState)=>{
    const [machine, machineValidationError] = validateMachine(stateMachine);
    if (!machine) throw new Error(machineValidationError);
    const state = initialState ?? Object.keys(machine.states)[0];
    if (typeof machine.states[state] === `undefined`) {
        throw new TypeError(`Initial state ('${state}') not found`);
    }
    // Normalise states
    const transitions = validateAndNormaliseTransitions(machine.states);
    if (transitions === undefined) {
        throw new Error(`Could not normalise transitions`);
    }
    return Object.freeze({
        value: state,
        visited: [],
        machine: Object.freeze(Object.fromEntries(transitions))
    });
};
const state_machine_reset = (sm)=>{
    return state_machine_init(sm.machine);
};
const validateMachine = (smOrTransitions)=>{
    if (typeof smOrTransitions === `undefined`) {
        return [
            undefined,
            `Parameter undefined`
        ];
    }
    if (smOrTransitions === null) {
        return [
            undefined,
            `Parameter null`
        ];
    }
    if (`states` in smOrTransitions) {
        // Assume Machine type
        return [
            smOrTransitions,
            ``
        ];
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
        undefined,
        `Unexpected type: ${typeof smOrTransitions}. Expected object`
    ];
};
// export const validateMachine = <V extends Transitions>(
//   sm: Machine<V>
// ): [machine: Machine<V> | undefined, msg: string] => {
//   if (typeof sm === 'undefined') {
//     return [undefined, `Parameter 'sm' is undefined`];
//   }
//   if (sm === null) return [undefined, `Parameter 'sm' is null`];
//   if (`states` in sm) {
//     const [transitions, validationError] = validateAndNormaliseTransitions(
//       sm.states
//     );
//     if (transitions) {
//       const machine: Machine<V> = {
//         // @ts-ignore
//         states: Object.fromEntries(transitions),
//       };
//       return [machine, ''];
//     } else {
//       return [undefined, validationError];
//     }
//   } else {
//     return [undefined, `Parameter 'sm.states' is undefined`];
//   }
// };
/**
 * Returns _true_ if MachineState `sm` is in its final state.
 * @param sm
 * @returns
 */ const isDone = (sm)=>{
    return possible(sm).length === 0;
};
/**
 * Returns a list of possible state targets for `sm`, or
 * an empty list if no transitions are possible.
 * @param sm
 * @returns
 */ const possibleTargets = (sm)=>{
    // Validate current state
    validateMachineState(sm);
    // get list of possible targets
    const fromS = sm.machine[sm.value];
    if (fromS.length === 1 && fromS[0].state === null) return [];
    return fromS;
};
/**
 * Returns a list of possible state names for `sm`, or
 * an empty list if no transitions are possible.
 *
 * @param sm
 * @returns
 */ const possible = (sm)=>{
    const targets = possibleTargets(sm);
    return targets.map((v)=>v.state);
};
const normaliseTargets = (targets)=>{
    const normaliseSingleTarget = (target)=>{
        // Terminal target
        if (target === null) return {
            state: null
        };
        // String is the target state
        if (typeof target === `string`) {
            return {
                state: target
            };
        } else if (typeof target === `object` && `state` in target) {
            const targetState = target.state;
            if (typeof targetState !== `string`) {
                throw new TypeError(`Target 'state' field is not a string. Got: ${typeof targetState}`);
            }
            if (`preconditions` in target) {
                return {
                    state: targetState,
                    preconditions: target.preconditions
                };
            }
            return {
                state: targetState
            };
        } else {
            throw new Error(`Unexpected type: ${typeof target}. Expected string or object with 'state' field.`);
        }
    };
    // Array of targets (either strings or objects)
    if (Array.isArray(targets)) {
        let containsNull = false;
        const mapResults = targets.map((t)=>{
            const r = normaliseSingleTarget(t);
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
        return [
            target
        ];
    }
};
const validateAndNormaliseTransitions = (d)=>{
    const returnMap = new Map();
    // 1. Index top-level states
    for (const [topLevelState, topLevelTargets] of Object.entries(d)){
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
    // 2. Normalise target
    for (const [topLevelState, topLevelTargets] of Object.entries(d)){
        const targets = normaliseTargets(topLevelTargets);
        if (targets === undefined) throw new Error(`Could not normalise target`);
        if (targets !== null) {
            // Check that they all exist as top-level states
            const seenStates = new Set();
            for (const target of targets){
                if (seenStates.has(target.state)) {
                    throw new Error(`Target state '${target.state}' already exists for '${topLevelState}'`);
                }
                seenStates.add(target.state);
                if (target.state === null) continue;
                if (!returnMap.has(target.state)) {
                    throw new Error(`Target state '${target.state}' is not defined as a top-level state. Defined under: '${topLevelState}'`);
                }
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
 */ const validateMachineState = (state)=>{
    if (typeof state === `undefined`) {
        throw new TypeError(`Param 'state' is undefined`);
    }
    if (typeof state.value !== `string`) {
        throw new TypeError(`Existing state is not a string`);
    }
};
/**
 * Attempts to transition to a new state. Either a new
 * `MachineState` is returned reflecting the change, or
 * an exception is thrown.
 * @param sm
 * @param toState
 * @returns
 */ const state_machine_to = (sm, toState)=>{
    validateMachineState(sm); // throws if not OK
    validateTransition(sm, toState); // throws if not OK
    return Object.freeze({
        value: toState,
        machine: sm.machine,
        visited: unique_unique([
            sm.visited,
            [
                sm.value
            ]
        ])
    });
};
const next = (sm)=>{
    //validateMachineState(sm);
    const first = possibleTargets(sm).at(0);
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (!first || first.state === null) {
        throw new Error(`Not possible to move to a next state from '${sm.value}`);
    }
    return state_machine_to(sm, first.state);
};
/**
 * Returns _true_ if `toState` is a valid transition from current state of `sm`
 * @param sm
 * @param toState
 * @returns
 */ const isValidTransition = (sm, toState)=>{
    try {
        validateTransition(sm, toState);
        return true;
    } catch  {
        return false;
    }
};
const validateTransition = (sm, toState)=>{
    if (toState === null) throw new Error(`Cannot transition to null state`);
    if (typeof toState === `undefined`) {
        throw new Error(`Cannot transition to undefined state`);
    }
    if (typeof toState !== `string`) {
        throw new TypeError(`Parameter 'toState' should be a string. Got: ${typeof toState}`);
    }
    //const toS = sm.machine[toState];
    //if (typeof toS === 'undefined') throw new Error(`Target state '${toState}' not defined`);
    const p = possible(sm);
    if (p.length === 0) throw new Error(`Machine is in terminal state`);
    if (!p.includes(toState)) {
        throw new Error(`Target state '${toState}' not available at current state '${sm.value}'. Possible states: ${p.join(`, `)}`);
    }
};
/**
 * Returns state transitions based on a list of strings.
 * The last string is the terminal state.
 *  A -> B -> C -> D
 * 
 * See also: {@link fromListBidirectional}
 *
 * ```js
 * const transitions = fromList([`a`, `b`, `c`, `d`]);
 * // Object state machine with events
 * const sm = new StateMachine.WithEvents(transitions);
 * // OR, immutable state machine
 * const sm = StateMachine.init(transitions);
 * ```
 * @param states List of states
 * @return MachineDescription
 */ const fromList = (...states)=>{
    const t = {};
    if (!Array.isArray(states)) throw new Error(`Expected array of strings`);
    if (states.length <= 2) throw new Error(`Expects at least two states`);
    for(let index = 0; index < states.length; index++){
        const s = states[index];
        if (typeof s !== `string`) {
            throw new TypeError(`Expected array of strings. Got type '${typeof s}' at index ${index.toString()}`);
        }
        t[s] = index === states.length - 1 ? null : states[index + 1];
    }
    return t;
};
/**
 * Returns a machine description based on a list of strings. Machine
 * can go back and forth between states:
 *  A <-> B <-> C <-> D
 * 
 * See also {@link fromList}.
 * 
 * ```js
 * const transitions = fromListBidirectional([`a`, `b`, `c`, `d`]);
 * // Object state machine with events
 * const sm = new StateMachine.WithEvents(transitions);
 * // OR, immutable state machine
 * const sm = StateMachine.init(transitions);
 * ```
 * @param states
 * @returns
 */ const fromListBidirectional = (...states)=>{
    const t = {};
    if (!Array.isArray(states)) throw new Error(`Expected array of strings`);
    if (states.length < 2) throw new Error(`Expects at least two states`);
    for (const [index, s] of states.entries()){
        if (typeof s !== `string`) {
            throw new TypeError(`Expected array of strings. Got type '${typeof s}' at index ${index.toString()}`);
        }
        t[s] = [];
    }
    for(let index = 0; index < states.length; index++){
        const v = t[states[index]];
        if (index === states.length - 1) {
            if (states.length > 1) {
                v.push(states[index - 1]);
            } else {
                t[states[index]] = null;
            }
        } else {
            v.push(states[index + 1]);
            if (index > 0) v.push(states[index - 1]);
        }
    }
    return t;
};
; // CONCATENATED MODULE: ../rx/src/from/iterator.ts
/**
 * Creates a Reactive from an AsyncGenerator or Generator
 * @param gen 
 * @returns 
 */ // export function readFromGenerator<V>(gen: AsyncGenerator<V> | Generator<V>) {
//   const rx = initStream<V>();
//   // eslint-disable-next-line @typescript-eslint/no-misused-promises
//   setTimeout(async () => {
//     try {
//       for await (const value of gen) {
//         rx.set(value);
//       }
//       rx.dispose(`Source generator complete`);
//     } catch (error) {
//       console.error(error);
//       rx.dispose(`Error while iterating`);
//     }
//   }, 1);
//   return rx;
// }
/**
 * Creates a readable reactive based on a (async)generator or iterator
 * ```js
 * // Generator a random value every 5 seconds
 * const valuesOverTime = Flow.interval(() => Math.random(), 5000);
 * // Wrap the generator
 * const r = Rx.From.iterator(time);
 * // Get notified when there is a new value
 * r.onValue(v => {
 *   console.log(v);
 * });
 * ```
 * 
 * Awaiting values could potentially hang code. Thus there is a `readTimeout`, the maximum time to wait for a value from the generator. Default: 5 minutes.
 * If `signal` is given, this will also cancel waiting for the value.
 * @param source 
 */ function iterator_iterator(source, options = {}) {
    const lazy = options.lazy ?? `very`;
    const log = options.traceLifecycle ? (message)=>{
        console.log(`Rx.From.iterator ${message}`);
    } : (_)=>{};
    const readIntervalMs = interval_type_intervalToMs(options.readInterval, 5);
    const readTimeoutMs = interval_type_intervalToMs(options.readTimeout, 5 * 60 * 1000);
    const whenStopped = options.whenStopped ?? `continue`;
    let iterator1;
    //let reading = false;
    let ourAc;
    let sm = state_machine_init({
        idle: [
            `wait_for_next`
        ],
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
    const onExternalSignal = ()=>{
        log(`onExternalSignal`);
        ourAc?.abort(options.signal?.reason);
    };
    if (options.signal) {
        options.signal.addEventListener(`abort`, onExternalSignal, {
            once: true
        });
    }
    ;
    const read = async ()=>{
        log(`read. State: ${sm.value}`);
        ourAc = new AbortController();
        try {
            sm = state_machine_to(sm, `wait_for_next`);
            const v = await nextWithTimeout(iterator1, {
                signal: ourAc.signal,
                millis: readTimeoutMs
            });
            sm = state_machine_to(sm, `processing_result`);
            ourAc.abort(`nextWithTimeout completed`);
            if (v.done) {
                log(`read v.done true`);
                events.dispose(`Generator complete`);
                //reading = false;
                sm = state_machine_to(sm, `disposed`);
            }
            //if (!reading) return;
            if (sm.value === `stopping`) {
                log(`read. sm.value = stopping`);
                sm = state_machine_to(sm, `idle`);
                return;
            }
            if (sm.value === `disposed`) {
                log(`read. sm.value = disposed`);
                return;
            }
            events.set(v.value);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            events.dispose(`Generator error: ${error.toString()}`);
            return;
        }
        //if (events.isDisposed()) return;
        //if (!reading) return;
        if (sm.value === `processing_result`) {
            sm = state_machine_to(sm, `queued`);
            log(`scheduling read. State: ${sm.value}`);
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            setTimeout(read, readIntervalMs);
        } else {
            sm = state_machine_to(sm, `idle`);
        }
    };
    const events = initLazyStream({
        ...options,
        lazy,
        onStart () {
            log(`onStart state: ${sm.value} whenStopped: ${whenStopped}`);
            if (sm.value !== `idle`) return;
            if (sm.value === `idle` && whenStopped === `reset` || iterator1 === undefined) {
                iterator1 = guard_isAsyncIterable(source) ? source[Symbol.asyncIterator]() : source[Symbol.iterator]();
            }
            //reading = true;
            void read();
        },
        onStop () {
            log(`onStop state: ${sm.value} whenStopped: ${whenStopped}`);
            //reading = false;
            sm = state_machine_to(sm, `stopping`);
            if (whenStopped === `reset`) {
                log(`onStop reiniting iterator`);
                iterator1 = guard_isAsyncIterable(source) ? source[Symbol.asyncIterator]() : source[Symbol.iterator]();
            }
        },
        onDispose (reason) {
            log(`onDispose (${reason})`);
            ourAc?.abort(`Rx.From.iterator disposed (${reason})`);
            if (options.signal) options.signal.removeEventListener(`abort`, onExternalSignal);
        }
    });
    // const readingStart = () => {
    // }
    //if (!lazy) readingStart();
    // return {
    //   on: events.on,
    //   value: events.value,
    //   dispose: events.dispose,
    //   isDisposed: events.isDisposed
    // }
    return events;
}
; // CONCATENATED MODULE: ../rx/src/resolve-source.ts
/**
 * Resolves various kinds of sources into a Reactive.
 * If `source` is an iterable/generator, it gets wrapped via `generator()`.
 * 
 * Default options:
 * * generator: `{ lazy: true, interval: 5 }`
 * @param source 
 * @returns 
 */ const resolveSource = (source, options = {})=>{
    if (isReactive(source)) return source;
    const generatorOptions = options.generator ?? {
        lazy: `initial`,
        interval: 5
    };
    const functionOptions = options.function ?? {
        lazy: `very`
    };
    if (Array.isArray(source)) {
        return iterator_iterator(source.values(), generatorOptions);
    } else if (typeof source === `function`) {
        return func(source, functionOptions);
    } else if (typeof source === `object`) {
        //console.log(`resolveSource is object`);
        if (isWrapped(source)) {
            //console.log(`resolveSource is object - wrapped`);
            return source.source;
        }
        if (guard_isIterable(source) || guard_isAsyncIterable(source)) {
            //console.log(`resolveSource is object - iterable`);
            return iterator_iterator(source, generatorOptions);
        }
    }
    throw new TypeError(`Unable to resolve source. Supports: array, Reactive, Async/Iterable. Got type: ${typeof source}`);
};
; // CONCATENATED MODULE: ../rx/src/cache.ts
/**
 * Wrapes an input stream to cache values, optionally providing an initial value
 * @param r 
 * @param initialValue 
 * @returns 
 */ function cache(r, initialValue) {
    let lastValue = initialValue;
    r.onValue((value)=>{
        lastValue = value;
    });
    return {
        ...r,
        last () {
            return lastValue;
        },
        resetCachedValue () {
            lastValue = undefined;
        }
    };
}
; // CONCATENATED MODULE: ../rx/src/init-stream.ts
/**
 * Initialise a stream based on an upstream source.
 * Calls initLazyStream under the hood.
 * 
 * Options:
 * * onValue: called when upstream emits a value (default: does nothing with upstream value)
 * * lazy: laziness of stream (default: 'initial')
 * * disposeIfSourceDone: disposes stream if upstream disposes (default: true)
 * @ignore
 * @param upstreamSource 
 * @param options 
 * @returns 
 */ function initUpstream(upstreamSource, options) {
    const lazy = options.lazy ?? `initial`;
    const disposeIfSourceDone = options.disposeIfSourceDone ?? true;
    const onValue = options.onValue ?? ((_v)=>{});
    const source = resolveSource(upstreamSource);
    let unsub;
    const debugLabel = options.debugLabel ? `[${options.debugLabel}]` : ``;
    //console.log(`initUpstream${ debugLabel } creating`);
    const onStop = ()=>{
        //console.log(`Rx.initStream${ debugLabel } stop`);
        if (unsub === undefined) return;
        unsub();
        unsub = undefined;
        if (options.onStop) options.onStop();
    };
    const onStart = ()=>{
        //console.log(`Rx.initStream${ debugLabel } start unsub ${ unsub !== undefined }`);
        if (unsub !== undefined) return;
        if (options.onStart) options.onStart();
        unsub = source.on((value)=>{
            //console.log(`Rx.initStream${ debugLabel } onValue`, value);
            if (messageIsSignal(value)) {
                if (value.signal === `done`) {
                    onStop();
                    events.signal(value.signal, value.context);
                    if (disposeIfSourceDone) events.dispose(`Upstream source ${debugLabel} has completed (${value.context ?? ``})`);
                } else {
                    //events.through_(value);
                    events.signal(value.signal, value.context);
                }
            } else if (messageHasValue(value)) {
                //lastValue = value.value;
                onValue(value.value);
            }
        });
    };
    //const initOpts = 
    // const events:ReactiveInitialStream<Out>|ReactiveStream<Out> = ((`initialValue` in options) && options.initialValue !== undefined) ?
    //   initLazyStreamWithInitial<Out>({ ...initOpts, initialValue: options.initialValue }) :
    //   initLazyStream<Out>(initOpts);
    //console.log(`initUpstream${ debugLabel } creating initLazyStream`);
    const events = initLazyStream({
        ...options,
        lazy,
        onStart,
        onStop
    });
    return events;
}
/**
 * Initialises a lazy stream with an initial value.
 * Uses {@link initLazyStream} and {@link cache} together.
 * @param options 
 * @returns 
 */ function initLazyStreamWithInitial(options) {
    const r = initLazyStream(options);
    const c = cache(r, options.initialValue);
    return c;
}
/**
 * Initialises a lazy stream
 * Consider also: {@link initLazyStreamWithInitial}
 * 
 * Uses {@link lazyStream} internally.
 * @param options 
 * @returns 
 */ function initLazyStream(options) {
    const lazy = options.lazy ?? `initial`;
    const onStop = options.onStop ?? (()=>{});
    const onStart = options.onStart ?? (()=>{});
    const debugLabel = options.debugLabel ? `[${options.debugLabel}]` : ``;
    const events = initStream({
        ...options,
        onFirstSubscribe () {
            if (lazy !== `never`) {
                //console.log(`initLazyStream${ debugLabel } onFirstSubscribe, lazy: ${ lazy }. Calling onStart`);
                onStart();
            }
        },
        onNoSubscribers () {
            if (lazy === `very`) {
                //console.log(`initLazyStream${ debugLabel } onNoSubscribers, lazy: ${ lazy }. Calling onStop`);
                onStop();
            }
        }
    });
    if (lazy === `never`) onStart();
    return events;
}
/**
 * Initialises a new stream.
 * 
 * Options:
 * * onFirstSubscribe: Called when there is a subscriber after there have been no subscribers.
 * * onNoSubscribers: Called when there are no more subscribers. 'onFirstSubscriber' will be called next time a subscriber is added.
 * 
 * Alternatives:
 * * {@link initLazyStream} - a stream with callbacks for when there is some/none subscribers
 * @ignore
 * @param options 
 * @returns 
 */ function initStream(options = {}) {
    let dispatcher;
    let disposed = false;
    let firstSubscribe = false;
    let emptySubscriptions = true;
    const onFirstSubscribe = options.onFirstSubscribe ?? undefined;
    const onNoSubscribers = options.onNoSubscribers ?? undefined;
    const debugLabel = options.debugLabel ? `[${options.debugLabel}]` : ``;
    const isEmpty = ()=>{
        if (dispatcher === undefined) return;
        if (!dispatcher.isEmpty) return;
        if (!emptySubscriptions) {
            emptySubscriptions = true;
            firstSubscribe = false;
            if (onNoSubscribers) onNoSubscribers();
        }
    };
    const subscribe = (handler)=>{
        if (disposed) throw new Error(`Disposed, cannot subscribe ${debugLabel}`);
        if (dispatcher === undefined) dispatcher = new DispatchList();
        //console.log(`initStream${ debugLabel } subscribe handler:`, handler);
        const id = dispatcher.add(handler);
        emptySubscriptions = false;
        if (!firstSubscribe) {
            firstSubscribe = true;
            //if (onFirstSubscribe) setTimeout(() => { onFirstSubscribe() }, 10);
            if (onFirstSubscribe) onFirstSubscribe();
        }
        return ()=>{
            dispatcher?.remove(id);
            isEmpty();
        };
    };
    return {
        dispose: (reason)=>{
            if (disposed) return;
            dispatcher?.notify({
                value: undefined,
                signal: `done`,
                context: `Disposed: ${reason}`
            });
            disposed = true;
            if (options.onDispose) options.onDispose(reason);
        },
        isDisposed: ()=>{
            return disposed;
        },
        removeAllSubscribers: ()=>{
            dispatcher?.clear();
            isEmpty();
        },
        set: (v)=>{
            if (disposed) throw new Error(`${debugLabel} Disposed, cannot set`);
            dispatcher?.notify({
                value: v
            });
        },
        // through: (pass: Passed<V>) => {
        //   if (disposed) throw new Error(`Disposed, cannot through`);
        //   dispatcher?.notify(pass)
        // },
        signal: (signal, context)=>{
            if (disposed) throw new Error(`${debugLabel} Disposed, cannot signal`);
            dispatcher?.notify({
                signal,
                value: undefined,
                context
            });
        },
        on: (handler)=>subscribe(handler),
        onValue: (handler)=>{
            const unsub = subscribe((message)=>{
                //console.log(`initStream${ debugLabel } onValue wrapper`, message);
                if (messageHasValue(message)) {
                    handler(message.value);
                }
            });
            return unsub;
        }
    };
}
; // CONCATENATED MODULE: ../dom/src/resolve-el.ts
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
 */ const resolveEl = (domQueryOrEl)=>{
    const r = resolveElementTry(domQueryOrEl);
    if (r.success) return r.value;
    throw resultToError(r);
};
const resolveElementTry = (domQueryOrEl)=>{
    if (typeof domQueryOrEl === `string`) {
        const d = document.querySelector(domQueryOrEl);
        if (d === null) {
            const error = domQueryOrEl.startsWith(`#`) ? `Query '${domQueryOrEl}' did not match anything. Try '#id', 'div', or '.class'` : `Query '${domQueryOrEl}' did not match anything. Did you mean '#${domQueryOrEl}?`;
            return {
                success: false,
                error
            };
        }
        domQueryOrEl = d;
    } else if (domQueryOrEl === null) {
        return {
            success: false,
            error: `Param 'domQueryOrEl' is null`
        };
    } else if (domQueryOrEl === undefined) {
        return {
            success: false,
            error: `Param 'domQueryOrEl' is undefined`
        };
    }
    const el = domQueryOrEl;
    return {
        success: true,
        value: el
    };
};
const resolveEls = (selectors)=>{
    if (selectors === undefined) return [];
    if (selectors === null) return [];
    if (Array.isArray(selectors)) return selectors;
    if (typeof selectors === `string`) {
        const elements = [
            ...document.querySelectorAll(selectors)
        ];
        return elements;
    }
    return [
        selectors
    ];
};
; // CONCATENATED MODULE: ../dom/src/set-property.ts
function setText(selectors, value) {
    return setProperty(`textContent`, selectors, value);
}
function setHtml(selectors, value) {
    return setProperty(`innerHTML`, selectors, value);
}
function setProperty(property, selectors, value) {
    let elements = [];
    const set = (v)=>{
        const typ = typeof v;
        const vv = typ === `string` || typ === `number` || typ === `boolean` ? v : JSON.stringify(v);
        if (elements.length === 0) {
            elements = resolveEls(selectors);
        }
        for (const element of elements){
            element[property] = vv;
        }
        return vv;
    };
    return value === undefined ? set : set(value);
}
; // CONCATENATED MODULE: ../rx/src/sinks/dom.ts
/**
 * Values from `input` are set to the textContent/innerHTML of an element.
 * ```js
 * const rxSource = Rx.From.string('hello');
 * const rxSet = Rx.Sinks.setHtmlText(rxSource, { query: })
 * ```
 * @param rxOrSource 
 * @param optionsOrElementOrQuery 
 */ const setHtmlText = (rxOrSource, optionsOrElementOrQuery)=>{
    let el;
    let options;
    if (typeof optionsOrElementOrQuery === `string`) {
        options = {
            query: optionsOrElementOrQuery
        };
    }
    if (typeof optionsOrElementOrQuery === `object`) {
        if (`nodeName` in optionsOrElementOrQuery) {
            options = {
                el: optionsOrElementOrQuery
            };
        } else {
            options = optionsOrElementOrQuery;
        }
    }
    if (options === undefined) throw new TypeError(`Missing element as second parameter or option`);
    if (`el` in options) {
        el = options.el;
    } else if (`query` in options) {
        el = document.querySelector(options.query);
    } else {
        throw new TypeError(`Options does not include 'el' or 'query' fields`);
    }
    if (el === null || el === undefined) throw new Error(`Element could not be resolved.`);
    const stream = resolveSource(rxOrSource);
    const setter = setProperty(options.asHtml ? `innerHTML` : `textContent`, el);
    const off = stream.onValue((value)=>{
        setter(value);
    });
    return off;
};
; // CONCATENATED MODULE: ../rx/src/to-readable.ts
/* eslint-disable @typescript-eslint/unbound-method */ /***
 * Returns a read-only version of `stream`
 */ const toReadable = (stream)=>({
        on: stream.on,
        dispose: stream.dispose,
        isDisposed: stream.isDisposed,
        onValue: stream.onValue
    });
; // CONCATENATED MODULE: ../core/src/maps.ts
/**
 * Gets the closest integer key to `target` in `data`.
 * * Requires map to have numbers as keys, not strings
 * * Math.round is used for rounding `target`.
 *
 * Examples:
 * ```js
 * // Assuming numeric keys 1, 2, 3, 4 exist:
 * getClosestIntegerKey(map, 3);    // 3
 * getClosestIntegerKey(map, 3.1);  // 3
 * getClosestIntegerKey(map, 3.5);  // 4
 * getClosestIntegerKey(map, 3.6);  // 4
 * getClosestIntegerKey(map, 100);  // 4
 * getClosestIntegerKey(map, -100); // 1
 * ```
 * @param data Map
 * @param target Target value
 * @returns
 */ const getClosestIntegerKey = (data, target)=>{
    target = Math.round(target);
    if (data.has(target)) {
        return target;
    } else {
        let offset = 1;
        while(offset < 1000){
            if (data.has(target - offset)) return target - offset;
            else if (data.has(target + offset)) return target + offset;
            offset++;
        }
        throw new Error(`Could not find target ${target.toString()}`);
    }
};
/**
 * Returns the first value in `data` that matches a key from `keys`.
 * ```js
 * // Iterate, yielding: `a.b.c.d`, `b.c.d`, `c.d`, `d`
 * const keys = Text.segmentsFromEnd(`a.b.c.d`);
 * // Gets first value that matches a key (starting from most precise)
 * const value = getFromKeys(data, keys);
 * ```
 * @param data 
 * @param keys 
 * @returns 
 */ const getFromKeys = (data, keys)=>{
    for (const key of keys){
        if (data.has(key)) return data.get(key);
    }
};
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
 */ const hasKeyValue = (map, key, value, comparer)=>{
    if (!map.has(key)) return false;
    const values = [
        ...map.values()
    ];
    return values.some((v)=>comparer(v, value));
};
/**
 * Deletes all key/values from map where value matches `value`,
 * with optional comparer. Mutates map.
 *
 * ```js
 * // Compare fruits based on their colour property
 * const colourComparer = (a, b) => a.colour === b.colour;
 *
 * // Deletes all values where .colour = `red`
 * deleteByValueMutate(map, { colour: `red` }, colourComparer);
 * ```
 * @param map
 * @param value
 * @param comparer
 */ const deleteByValueMutate = (map, value, comparer = isEqualDefault)=>{
    for (const entry of Object.entries(map)){
        if (comparer(entry[1], value)) {
            map.delete(entry[0]);
        }
    }
};
/**
 * Finds first entry by iterable value. Expects a map with an iterable as values.
 *
 * ```js
 * const map = new Map();
 * map.set('hello', 'a');
 * map.set('there', 'b');
 *
 * const entry = firstEntryByPredicate(map, (value, key) => {
 *  return (value === 'b');
 * });
 * // Entry is: ['there', 'b']
 * ```
 *
 * An alternative is {@link firstEntryByValue} to search by value.
 * @param map Map to search
 * @param predicate Filter function returns true when there is a match of value
 * @returns Entry, or _undefined_ if `filter` function never returns _true_
 */ const firstEntryByPredicate = (map, predicate)=>{
    for (const entry of map.entries()){
        if (predicate(entry[1], entry[0])) return entry;
    }
};
/**
 * Finds first entry by value.
 *
 * ```js
 * const map = new Map();
 * map.set('hello', 'a');
 * map.set('there', 'b');
 *
 * const entry = firstEntryByValue(map, 'b');
 * // Entry is: ['there', 'b']
 * ```
 *
 * An alternative is {@link firstEntryByValue} to search by predicate function.
 * @param map Map to search
 * @param value Value to seek
 * @param isEqual Filter function which checks equality. Uses JS comparer by default.
 * @returns Entry, or _undefined_ if `value` not found.
 */ const firstEntryByValue = (map, value, isEqual = isEqualDefault)=>{
    for (const entry of map.entries()){
        if (isEqual(entry[1], value)) return entry;
    }
};
/**
 * Adds items to a map only if their key doesn't already exist
 *
 * Uses provided {@link ToString} function to create keys for items. Item is only added if it doesn't already exist.
 * Thus the older item wins out, versus normal `Map.set` where the newest wins.
 *
 *
 * @example
 * ```js
 * import { Maps } from "https://unpkg.com/ixfx/dist/collections.js";
 * const map = new Map();
 * const peopleArray = [ _some people objects..._];
 * Maps.addKeepingExisting(map, p => p.name, ...peopleArray);
 * ```
 * @param set
 * @param hasher
 * @param values
 * @returns
 */ const addKeepingExisting = (set, hasher, ...values)=>{
    const s = set === undefined ? new Map() : new Map(set);
    for (const v of values){
        const hashResult = hasher(v);
        if (s.has(hashResult)) continue;
        s.set(hashResult, v);
    }
    return s;
};
/**
 * Returns a array of entries from a map, sorted by value.
 *
 * ```js
 * const m = new Map();
 * m.set(`4491`, { name: `Bob` });
 * m.set(`2319`, { name: `Alice` });
 *
 * // Compare by name
 * const comparer = (a, b) => defaultComparer(a.name, b.name);
 *
 * // Get sorted values
 * const sorted = Maps.sortByValue(m, comparer);
 * ```
 *
 * `sortByValue` takes a comparison function that should return -1, 0 or 1 to indicate order of `a` to `b`. If not provided, {@link Util.defaultComparer} is used.
 * @param map
 * @param comparer
 * @returns
 */ const sortByValue = (map, comparer)=>{
    const f = comparer ?? defaultComparer;
    return [
        ...map.entries()
    ].sort((a, b)=>f(a[1], b[1]));
};
/**
 * Returns an array of entries from a map, sorted by a property of the value
 *
 * ```js
 * cosnt m = new Map();
 * m.set(`4491`, { name: `Bob` });
 * m.set(`2319`, { name: `Alice` });
 * const sorted = Maps.sortByValue(m, `name`);
 * ```
 * @param map Map to sort
 * @param property Property of value
 * @param compareFunction Comparer. If unspecified, uses a default.
 */ const sortByValueProperty = (map, property, compareFunction)=>{
    const cfn = typeof compareFunction === `undefined` ? defaultComparer : compareFunction;
    return [
        ...map.entries()
    ].sort((aE, bE)=>{
        const a = aE[1];
        const b = bE[1];
        return cfn(a[property], b[property]);
    });
};
/**
 * Returns _true_ if any key contains `value`, based on the provided `comparer` function. Use {@link hasKeyValue}
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
 */ const hasAnyValue = (map, value, comparer)=>{
    const entries = [
        ...map.entries()
    ];
    return entries.some((kv)=>comparer(kv[1], value));
};
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
 */ function* maps_filter(map, predicate) {
    for (const v of map.values()){
        if (predicate(v)) yield v;
    }
}
//export const filter = <V>(map:ReadonlyMap<string, V>, predicate:(v:V) => boolean):ReadonlyArray<V> => Array.from(map.values()).filter(predicate);
/**
 * Copies data to an array
 * @param map
 * @returns
 */ const maps_toArray = (map)=>[
        ...map.values()
    ];
/**
 * import { Maps } from 'https://unpkg.com/ixfx/dist/data.js';
 * Returns a Map from an iterable. By default throws an exception
 * if iterable contains duplicate values.
 *
 * ```js
 * const data = [
 *  { fruit: `granny-smith`, family: `apple`, colour: `green` }
 *  { fruit: `mango`, family: `stone-fruit`, colour: `orange` }
 * ];
 * const map = Maps.fromIterable(data, v => v.fruit);
 * ```
 * @param data Input data
 * @param keyFunction Function which returns a string id. By default uses the JSON value of the object.
 * @param allowOverwrites When set to _true_, items with same id will silently overwrite each other, with last write wins. _false_ by default.
 * @returns
 */ const maps_fromIterable = (data, keyFunction = toStringDefault, allowOverwrites = false)=>{
    const m = new Map();
    for (const d of data){
        const id = keyFunction(d);
        if (m.has(id) && !allowOverwrites) {
            throw new Error(`id ${id} is already used and new data will overwrite it. `);
        }
        m.set(id, d);
    }
    return m;
};
/**
 * Returns a Map from an object, or array of objects.
 * Assumes the top-level properties of the object is the key.
 *
 * ```js
 * const data = {
 *  Sally: { name: `Sally`, colour: `red` },
 *  Bob: { name: `Bob`, colour: `pink` }
 * };
 * const map = fromObject(data);
 * map.get(`Sally`); // { name: `Sally`, colour: `red` }
 * ```
 *
 * To add an object to an existing map, use {@link addObjectMutate}.
 * @param data
 * @returns
 */ const fromObject = (data)=>{
    const map = new Map();
    if (Array.isArray(data)) {
        for (const d of data)addObjectMutate(map, d);
    } else {
        addObjectMutate(map, data);
    }
    return map;
};
/**
 * Adds an object to an existing map, mutating it. 
 * It assumes a structure where each top-level property is a key:
 *
 * ```js
 * const data = {
 *  Sally: { colour: `red` },
 *  Bob:   { colour: `pink` }
 * };
 * const map = new Map();
 * addObject(map, data);
 *
 * map.get(`Sally`); // { name: `Sally`, colour: `red` }
 * ```
 *
 * To create a new map from an object, use {@link fromObject} instead.
 * @param map
 * @param data
 */ const addObjectMutate = (map, data)=>{
    const entries = Object.entries(data);
    for (const [key, value] of entries){
        map.set(key, value);
    }
};
/**
 * Returns the first found value that matches `predicate` or _undefined_.
 *
 * Use {@link some} if you don't care about the value, just whether it appears.
 * Use {@link filter} to get all value(s) that match `predicate`.
 *
 * @example First person over thirty
 * ```js
 * const overThirty = find(people, person => person.age > 30);
 * ```
 * @param map Map to search
 * @param predicate Function that returns true for a matching value
 * @returns Found value or _undefined_
 */ const maps_find = (map, predicate)=>[
        ...map.values()
    ].find((v)=>predicate(v));
/**
 * Returns _true_ if `predicate` yields _true_ for any value in `map`.
 * Use {@link find} if you want the matched value.
 * ```js
 * const map = new Map();
 * map.set(`fruit`, `apple`);
 * map.set(`colour`, `red`);
 * Maps.some(map, v => v === `red`);    // true
 * Maps.some(map, v => v === `orange`); // false
 * ```
 * @param map 
 * @param predicate 
 * @returns 
 */ const maps_some = (map, predicate)=>[
        ...map.values()
    ].some((v)=>predicate(v));
/**
 * Converts a map to a simple object, transforming from type `T` to `K` as it does so. If no transforms are needed, use {@link toObject}.
 *
 * ```js
 * const map = new Map();
 * map.set(`name`, `Alice`);
 * map.set(`pet`, `dog`);
 *
 * const o = mapToObjectTransform(map, v => {
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
 */ const mapToObjectTransform = (m, valueTransform)=>[
        ...m
    ].reduce((object, [key, value])=>{
        const t = valueTransform(value);
        object[key] = t;
        return object;
    }, {});
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
 */ const zipKeyValue = (keys, values)=>{
    if (keys.length !== values.length) {
        throw new Error(`Keys and values arrays should be same length`);
    }
    return Object.fromEntries(keys.map((k, index)=>[
            k,
            values[index]
        ]));
};
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
 * If you want to combine values into a single object, consider instead  {@link mapToObjectTransform}.
 * @param source
 * @param transformer
 * @typeParam K Type of keys (generally a string)
 * @typeParam V Type of input map values
 * @typeParam R Type of output map values
 * @returns
 */ const transformMap = (source, transformer)=>new Map(Array.from(source, (v)=>[
            v[0],
            transformer(v[1], v[0])
        ]));
/**
 * Converts a `Map` to a plain object, useful for serializing to JSON.
 * To convert back to a map use {@link fromObject}.
 *
 * @example
 * ```js
 * const map = new Map();
 * map.set(`Sally`, { name: `Sally`, colour: `red` });
 * map.set(`Bob`, { name: `Bob`, colour: `pink });
 *
 * const objects = Maps.toObject(map);
 * // Yields: {
 * //  Sally: { name: `Sally`, colour: `red` },
 * //  Bob: { name: `Bob`, colour: `pink` }
 * // }
 * ```
 * @param m
 * @returns
 */ const toObject = (m)=>[
        ...m
    ].reduce((object, [key, value])=>{
        object[key] = value;
        return object;
    }, {});
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
 */ const mapToArray = (m, transformer)=>[
        ...m.entries()
    ].map((x)=>transformer(x[0], x[1]));
/**
 * Merges maps left to right, using the provided
 * `reconcile` function to choose a winner when keys overlap.
 *
 * There's also {@link Data.Arrays.mergeByKey Arrays.mergeByKey} if you don't already have a map.
 *
 * For example, if we have the map A:
 * 1 => `A-1`, 2 => `A-2`, 3 => `A-3`
 *
 * And map B:
 * 2 => `B-1`, 2 => `B-2`, 4 => `B-4`
 *
 * If they are merged with the reconile function:
 * ```js
 * const reconcile = (a, b) => b.replace(`-`, `!`);
 * const output = mergeByKey(reconcile, mapA, mapB);
 * ```
 *
 * The final result will be:
 *
 * 1 => `B!1`, 2 => `B!2`, 3 => `A-3`, 4 => `B-4`
 *
 * In this toy example, it's obvious how the reconciler transforms
 * data where the keys overlap. For the keys that do not overlap -
 * 3 and 4 in this example - they are copied unaltered.
 *
 * A practical use for `mergeByKey` has been in smoothing keypoints
 * from a TensorFlow pose. In this case, we want to smooth new keypoints
 * with older keypoints. But if a keypoint is not present, for it to be
 * passed through.
 *
 * @param reconcile
 * @param maps
 */ const mergeByKey = (reconcile, ...maps)=>{
    const result = new Map();
    for (const m of maps){
        for (const [mk, mv] of m){
            let v = result.get(mk);
            v = v ? reconcile(v, mv) : mv;
            result.set(mk, v);
        }
    }
    return result;
};
/**
 * @inheritDoc getOrGenerate
 * @param map
 * @param fn
 * @returns
 */ const getOrGenerateSync = (map, fn)=>(key, args)=>{
        let value = map.get(key);
        if (value !== undefined) return value;
        value = fn(key, args);
        map.set(key, value);
        return value;
    };
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
 */ const getOrGenerate = (map, fn)=>async (key, args)=>{
        let value = map.get(key);
        if (value !== undefined) return value; //Promise.resolve(value);
        value = await fn(key, args);
        if (value === undefined) throw new Error(`fn returned undefined`);
        map.set(key, value);
        return value;
    };
; // CONCATENATED MODULE: ../rx/src/ops/sync-to-array.ts
/* eslint-disable @typescript-eslint/unbound-method */ /**
 * Waits for all sources to produce a value, sending the combined results as an array.
 * After sending, it waits again for each source to send at least one value.
 * 
 * Use {@link syncToObject} to output objects based on labelled sources rather than an array of values.
 * 
 * Pace will be set by the slowest source. Alternatively, use {@link combineLatestToArray} where the rate is determined by fastest source.
 * 
 * Only complete results are sent. For example if source A & B finish and source C is still producing values,
 * synchronisation is not possible because A & B stopped producing values. Thus the stream will self-terminate
 * after `maximumWait` (2 seconds). The newer values from C are lost.
 */ function syncToArray(reactiveSources, options = {}) {
    const onSourceDone = options.onSourceDone ?? `break`;
    const finalValue = options.finalValue ?? `undefined`;
    const maximumWait = interval_type_intervalToMs(options.maximumWait, 2000);
    let watchdog;
    const data = [];
    //const finalData: Array<RxValueTypes<T> | undefined> = [];
    // Resolve sources
    //const sources = reactiveSources.map(source => resolveSource(source));
    //const noop = () => {/*no-op*/ }
    //const sourcesUnsub: Array<Unsubscriber> = sources.map(_ => noop);
    const states = reactiveSources.map((source)=>({
            finalData: undefined,
            done: false,
            source: resolveSource(source),
            unsub: ()=>{}
        }));
    const unsubscribe = ()=>{
        for (const s of states){
            s.unsub();
            s.unsub = ()=>{};
        }
    };
    const isDataSetComplete = ()=>{
        for(let index = 0; index < data.length; index++){
            if (onSourceDone === `allow` && states[index].done) continue;
            if (data[index] === undefined) return false;
        }
        return true;
    };
    const hasIncompleteSource = ()=>states.some((s)=>!s.done);
    const resetDataSet = ()=>{
        for(let index = 0; index < data.length; index++){
            if (finalValue === `last` && states[index].done) continue; // Don't overwrite
            data[index] = undefined;
        }
    };
    const onWatchdog = ()=>{
        done(`Sync timeout exceeded (${maximumWait.toString()})`);
    };
    const done = (reason)=>{
        if (watchdog) clearTimeout(watchdog);
        unsubscribe();
        event.dispose(reason);
    };
    const init = ()=>{
        watchdog = setTimeout(onWatchdog, maximumWait);
        for (const [index, state] of states.entries()){
            data[index] = undefined; // init array positions to be undefined
            state.unsub = state.source.on((valueChanged)=>{
                if (messageIsSignal(valueChanged)) {
                    if (valueChanged.signal === `done`) {
                        state.finalData = data[index];
                        state.unsub();
                        state.done = true;
                        state.unsub = ()=>{};
                        if (finalValue === `undefined`) data[index] = undefined;
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
                    // All array elements contain values
                    // Emit data and reset
                    event.set([
                        ...data
                    ]);
                    resetDataSet();
                    if (watchdog) clearTimeout(watchdog);
                    watchdog = setTimeout(onWatchdog, maximumWait);
                }
            });
        }
    };
    const event = initStream({
        onFirstSubscribe () {
            unsubscribe();
            init();
        },
        onNoSubscribers () {
            if (watchdog) clearTimeout(watchdog);
            unsubscribe();
        }
    });
    return {
        dispose: event.dispose,
        isDisposed: event.isDisposed,
        on: event.on,
        onValue: event.onValue
    };
}
; // CONCATENATED MODULE: ../rx/src/ops/transform.ts
/**
 * Transforms values from `source` using the `transformer` function.
 * @param transformer 
 * @returns 
 */ function transform_transform(input, transformer, options = {}) {
    const traceInput = options.traceInput ?? false;
    const traceOutput = options.traceOutput ?? false;
    const upstream = initUpstream(input, {
        lazy: `initial`,
        ...options,
        onValue (value) {
            const t = transformer(value);
            if (traceInput && traceOutput) {
                console.log(`Rx.Ops.transform input: ${JSON.stringify(value)} output: ${JSON.stringify(t)}`);
            } else if (traceInput) {
                console.log(`Rx.Ops.transform input: ${JSON.stringify(value)}`);
            } else if (traceOutput) {
                console.log(`Rx.Ops.transform output: ${JSON.stringify(t)}`);
            }
            upstream.set(t);
        }
    });
    return toReadable(upstream);
}
; // CONCATENATED MODULE: ../rx/src/ops/sync-to-object.ts
function syncToObject(reactiveSources, options = {}) {
    const keys = Object.keys(reactiveSources);
    const values = Object.values(reactiveSources);
    const s = syncToArray(values, options);
    const st = transform_transform(s, (streamValues)=>{
        return zipKeyValue(keys, streamValues);
    });
    return st;
}
; // CONCATENATED MODULE: ../rx/src/ops/annotate.ts
/**
 * Annotates values from `source`. Output values will be
 * in the form `{ value: TIn, annotation: TAnnotation }`.
 * Where `TIn` is the type of the input, and `TAnnotation` is
 * the return type of the annotator function.
 * 
 * Example calculating area from width & height:
 * ```js
 * const data = Rx.From.array(
 *  { w: 1, h: 3 }, { w: 1, h: 1 }, { w: 2, h: 2 }
 * );
 * const annotated = Rx.Ops.annotate(data, v => {
 *  return { area: v.w * v.h }
 * });
 * const data = await Rx.toArray(annotated);
 * // Data =  [ { value: { w:1, h:3 }, annotation: { area:3 } } ...]
 * ```
 * 
 * If you would rather annotate and have values merge with the input,
 * use `transform`:
 * ```js
 * const data = Rx.From.array(
 *  { w: 1, h: 3 }, { w: 1, h: 1 }, { w: 2, h: 2 }
 * );
 * const withArea = Rx.Ops.transform(data, v => {
 *  return { ...v, area: v.w * v.h }
 * });
 * const data = await Rx.toArray(withArea);
 * // Data =  [ { w:1, h:3, area:3 }, ...]
 * ```
 */ function annotate_annotate(input, annotator, options = {}) {
    const upstream = initUpstream(input, {
        ...options,
        onValue (value) {
            const annotation = annotator(value);
            upstream.set({
                value,
                annotation
            });
        }
    });
    return toReadable(upstream);
}
/**
 * Annotates the input stream using {@link ReactiveOp} as the source of annotations.
 * The output values will have the shape of `{ value: TIn, annotation: TAnnotation }`.
 * Meaning that the original value is stored under `.value`, and the annotation under `.annotation`.
 * 
 * ```js
 * const data = Rx.From.array([ 1, 2, 3 ]);
 * const annotated = Rx.Ops.annotateWithOp(data, Rx.Ops.sum());
 * const data = await annotated.toArray(annotated);
 * // Data =  [ { value: 1, annotation: 1 }, { value: 2, annotation: 3 }, { value: 3, annotation: 6 } ]
 * ```
 * @param annotatorOp Operator to generate annotations
 * @param input Input stream
 * @returns 
 */ function annotateWithOp(input, annotatorOp) {
    const inputStream = resolveSource(input);
    // Create annotations from input
    const stream = annotatorOp(inputStream);
    const synced = syncToObject({
        value: inputStream,
        annotation: stream
    });
    return synced;
}
; // CONCATENATED MODULE: ../collections/src/queue/queue-fns.ts
const debug = (opts, message)=>{
    opts.debug ? console.log(`queue:${message}`) : undefined;
};
const trimQueue = (opts, queue, toAdd)=>{
    const potentialLength = queue.length + toAdd.length;
    const capacity = opts.capacity ?? potentialLength;
    const toRemove = potentialLength - capacity;
    const policy = opts.discardPolicy ?? `additions`;
    // debug(
    //   opts,
    //   `queueLen: ${queue.length} potentialLen: ${potentialLength} toRemove: ${toRemove} policy: ${policy} toAdd.length: ${toAdd.length} capacity: ${capacity}`
    // );
    // debug(opts, `to add: ${JSON.stringify(toAdd)}`);
    switch(policy){
        // Only add what we can from toAdd
        case `additions`:
            {
                // debug(
                //   opts,
                //   `trimQueue:DiscardAdditions: queueLen: ${queue.length} slice: ${
                //     potentialLength - capacity
                //   } toAddLen: ${toAdd.length} nowFull: ${queue.length === opts.capacity}`
                // );
                if (queue.length === 0) return toAdd.slice(0, toAdd.length - toRemove);
                // eslint-disable-next-line unicorn/prefer-ternary
                if (queue.length === opts.capacity) {
                    return queue; // Completely full
                } else {
                    // Only add some from the new array (from the front)
                    return [
                        ...queue,
                        ...toAdd.slice(0, toRemove - 1)
                    ];
                }
            }
        // Remove from rear of queue (last index) before adding new things
        case `newer`:
            {
                if (toRemove >= queue.length) {
                    // New items will completely flush out old
                    //debug(opts, `slice start: ${toAdd.length - capacity}`);
                    if (queue.length === 0) {
                        // Special case when queue starts off empty
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        return [
                            ...toAdd.slice(0, capacity - 1),
                            toAdd.at(-1)
                        ];
                    }
                    return toAdd.slice(Math.max(0, toAdd.length - capacity), Math.min(toAdd.length, capacity) + 1);
                //debug(opts, `Final value: ${JSON.stringify(tmp)}`);
                //return tmp;
                } else {
                    // Keep some of the old
                    // const toAddFinal = toAdd.slice(
                    //   0,
                    //   Math.min(toAdd.length, capacity - toRemove + 1)
                    // );
                    // Cap 5, queue 5, toAdd: 10.
                    const countToAdd = Math.max(1, toAdd.length - queue.length);
                    const toAddFinal = toAdd.slice(toAdd.length - countToAdd, toAdd.length);
                    const toKeep = queue.slice(0, Math.min(queue.length, capacity - 1)); //toRemove);
                    // debug(
                    //   opts,
                    //   `trimQueue: countToAdd: ${countToAdd} qLen: ${
                    //     queue.length
                    //   } capacity: ${capacity} toRemove: ${toRemove} keeping: ${JSON.stringify(
                    //     toKeep
                    //   )} from orig: ${JSON.stringify(queue)} toAddFinal: ${JSON.stringify(
                    //     toAddFinal
                    //   )}`
                    // );
                    const t = [
                        ...toKeep,
                        ...toAddFinal
                    ];
                    //debug(opts, `final: ${JSON.stringify(t)}`);
                    return t;
                }
            }
        // Remove from the front of the queue (0 index). ie. older items are discarded
        case `older`:
            {
                // If queue is A, B and toAdd is C, D this yields A, B, C, D
                return [
                    ...queue,
                    ...toAdd
                ].slice(toRemove);
            }
        default:
            {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                throw new Error(`Unknown overflow policy ${policy}`);
            }
    }
};
/**
 * Adds to the back of the queue (last array index)
 * Last item of `toAdd` will potentially be the new end of the queue (depending on capacity limit and overflow policy)
 * @typeParam V - Type of values
 * @param {QueueOpts} opts
 * @param {V[]} queue
 * @param {...V[]} toAdd
 * @returns {V[]}
 */ const enqueue = (opts, queue, ...toAdd)=>{
    if (opts === undefined) throw new Error(`opts parameter undefined`);
    const potentialLength = queue.length + toAdd.length;
    const overSize = opts.capacity && potentialLength > opts.capacity;
    const toReturn = overSize ? trimQueue(opts, queue, toAdd) : [
        ...queue,
        ...toAdd
    ];
    if (opts.capacity && toReturn.length !== opts.capacity && overSize) {
        throw new Error(`Bug! Expected return to be at capacity. Return len: ${toReturn.length} capacity: ${opts.capacity} opts: ${JSON.stringify(opts)}`);
    }
    if (!opts.capacity && toReturn.length !== potentialLength) {
        throw new Error(`Bug! Return length not expected. Return len: ${toReturn.length} expected: ${potentialLength} opts: ${JSON.stringify(opts)}`);
    }
    return toReturn;
};
// Remove from front of queue (0 index)
const dequeue = (opts, queue)=>{
    if (queue.length === 0) throw new Error(`Queue is empty`);
    return queue.slice(1);
};
/**
 * Returns front of queue (oldest item), or undefined if queue is empty
 *
 * @typeParam V - Type of values stored
 * @param {QueueOpts} opts
 * @param {V[]} queue
 * @returns {(V | undefined)}
 */ const peek = (opts, queue)=>queue[0];
const queue_fns_isEmpty = (opts, queue)=>queue.length === 0;
const isFull = (opts, queue)=>{
    if (opts.capacity) {
        return queue.length >= opts.capacity;
    }
    return false;
};
; // CONCATENATED MODULE: ../core/src/to-string.ts
// Via Vuejs
// eslint-disable-next-line @typescript-eslint/unbound-method
const objectToString = Object.prototype.toString;
const toTypeString = (value)=>objectToString.call(value);
const isMap = (value)=>toTypeString(value) === `[object Map]`;
const isSet = (value)=>toTypeString(value) === `[object Set]`;
/**
 * A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
 */ const src_to_string_toStringDefault = (itemToMakeStringFor)=>typeof itemToMakeStringFor === `string` ? itemToMakeStringFor : JSON.stringify(itemToMakeStringFor);
//eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultToString = (object)=>{
    //ECMA specification: http://www.ecma-international.org/ecma-262/6.0/#sec-tostring
    if (object === null) return `null`;
    if (typeof object === `boolean` || typeof object === `number`) {
        return object.toString();
    }
    if (typeof object === `string`) return object;
    if (typeof object === `symbol`) throw new TypeError(`Symbol cannot be converted to string`);
    return JSON.stringify(object);
};
; // CONCATENATED MODULE: ../core/src/is-equal.ts
/**
 * If input is a string, it is returned.
 * Otherwise, it returns the result of JSON.stringify() with fields ordered.
 * 
 * This allows for more consistent comparisons when object field orders are different but values the same.
 * @param itemToMakeStringFor 
 * @returns 
 */ const toStringOrdered = (itemToMakeStringFor)=>{
    if (typeof itemToMakeStringFor === `string`) return itemToMakeStringFor;
    const allKeys = new Set();
    JSON.stringify(itemToMakeStringFor, (key, value)=>(allKeys.add(key), value));
    return JSON.stringify(itemToMakeStringFor, [
        ...allKeys
    ].sort());
};
/**
 * Default comparer function is equiv to checking `a === b`.
 * Use {@link isEqualValueDefault} to compare by value, via comparing JSON string representation.
 */ const is_equal_isEqualDefault = (a, b)=>a === b;
/**
 * Comparer returns true if string representation of `a` and `b` are equal.
 * Use {@link isEqualDefault} to compare using === semantics
 * Uses `toStringDefault` to generate a string representation (via `JSON.stringify`).
 * 
 * Returns _false_ if the ordering of fields is different, even though values are identical:
 * ```js
 * isEqualValueDefault({ a: 10, b: 20}, { b: 20, a: 10 }); // false
 * ```
 * 
 * Use {@link isEqualValueIgnoreOrder} to ignore order (with an overhead of additional processing).
 * ```js
 * isEqualValueIgnoreOrder({ a: 10, b: 20}, { b: 20, a: 10 }); // true
 * ```
 * 
 * Use {@link isEqualValuePartial} to partially match `b` against `a`.
 * @returns True if the contents of `a` and `b` are equal
 */ const isEqualValueDefault = (a, b)=>{
    // ✔ UNIT TESTED
    if (a === b) return true; // Object references are the same, or string values are the same
    return src_to_string_toStringDefault(a) === src_to_string_toStringDefault(b); // String representations are the same
};
/**
 * Returns _true_ if `a` contains the values of `b`. `a` may contain other values, but we
 * only check against what is in `b`. `a` and `b` must both be simple objects.
 * 
 * ```js
 * const obj = {
 *  name: `Elle`,
 *  size: 100,
 *  colour: {
 *    red: 0.5,
 *    green: 0.1,
 *    blue: 0.2
 *  }
 * }
 * 
 * isEqualValuePartial(obj, { name: `Elle` }); // true
 * isEqualValuePartial(obj, { name: { colour: red: { 0.5, green: 0.1  }} }); // true
 * 
 * isEqualValuePartial(obj, { name: `Ellen` });     // false
 * isEqualValuePartial(obj, { lastname: `Elle` });  // false
 * ```
 * @param a 
 * @param b 
 * @param fieldComparer 
 * @returns 
 */ const isEqualValuePartial = (a, b, fieldComparer)=>{
    if (typeof a !== `object`) throw new Error(`Param 'a' expected to be object`);
    if (typeof b !== `object`) throw new Error(`Param 'b' expected to be object`);
    if (Object.is(a, b)) return true;
    const comparer = fieldComparer ?? isEqualValuePartial;
    for (const entryB of Object.entries(b)){
        const valueOnAKeyFromB = a[entryB[0]];
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
/**
 * Comparer returns true if string representation of `a` and `b` are equal, regardless of field ordering.
 * Uses `toStringOrdered` to generate a string representation (via JSON.stringify`).
 * 
 * ```js
 * isEqualValueIgnoreOrder({ a: 10, b: 20}, { b: 20, a: 10 }); // true
 * isEqualValue({ a: 10, b: 20}, { b: 20, a: 10 }); // false, fields are different order
 * ```
 * 
 * There is an overhead to ordering fields. Use {@link isEqualValueDefault} if it's not possible that field ordering will change.
 * @returns True if the contents of `a` and `b` are equal
 * @typeParam T - Type of objects being compared
 */ const isEqualValueIgnoreOrder = (a, b)=>{
    // ✔ UNIT TESTED
    if (a === b) return true; // Object references are the same, or string values are the same
    return toStringOrdered(a) === toStringOrdered(b); // String representations are the same
};
/**
 * Returns _true_ if Object.entries() is empty for `value`
 * @param value 
 * @returns 
 */ const isEmptyEntries = (value)=>[
        ...Object.entries(value)
    ].length === 0;
/**
 * Returns _true_ if `a` and `b are equal based on their JSON representations.
 * `path` is ignored.
 * @param a 
 * @param b 
 * @param path 
 * @returns 
 */ const isEqualContextString = (a, b, _path)=>{
    return JSON.stringify(a) === JSON.stringify(b);
};
; // CONCATENATED MODULE: ../events/src/map-of.ts
class MapOfSimple {
    #store = new Map();
    /**
   * Gets a copy of the underlying array storing values at `key`, or an empty array if
   * key does not exist
   * @param key 
   * @returns 
   */ get(key) {
        const arr = this.#store.get(key);
        if (!arr) return [];
        return [
            ...arr
        ];
    }
    /**
   * Returns the number of values stored under `key`
   * @param key 
   * @returns 
   */ size(key) {
        const arr = this.#store.get(key);
        if (!arr) return 0;
        return arr.length;
    }
    /**
   * Iterate over all values contained under `key`
   * @param key 
   * @returns 
   */ *iterateKey(key) {
        const arr = this.#store.get(key);
        if (!arr) return;
        yield* arr.values();
    }
    /**
   * Iterate all values, regardless of key
   */ *iterateValues() {
        for (const key of this.#store.keys()){
            yield* this.iterateKey(key);
        }
    }
    /**
   * Iterate all keys
   */ *iterateKeys() {
        yield* this.#store.keys();
    }
    addKeyedValues(key, ...values) {
        let arr = this.#store.get(key);
        if (!arr) {
            arr = [];
            this.#store.set(key, arr);
        }
        arr.push(...values);
    }
    deleteKeyValue(key, value) {
        const arr = this.#store.get(key);
        if (!arr) return false;
        const arrCopy = arr.filter((v)=>v !== value);
        if (arrCopy.length === arr.length) return false;
        this.#store.set(key, arrCopy);
        return true;
    }
    clear() {
        this.#store.clear();
    }
}
; // CONCATENATED MODULE: ../events/src/simple-event-emitter.ts
class SimpleEventEmitter {
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
   */ fireEvent(type, args) {
        if (this.#disposed) throw new Error(`Disposed`);
        //console.log(`Firing ${ type as string }. Listeners: ${ this.#listeners.size(type as string) }`);
        for (const l of this.#listeners.iterateKey(type)){
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
   */ addEventListener(name, listener) {
        if (this.#disposed) throw new Error(`Disposed`);
        this.#listeners.addKeyedValues(name, listener);
    }
    /**
   * Remove event listener
   *
   * @param listener
   */ removeEventListener(type, listener) {
        if (this.#disposed) return;
        // listener: Listener<Events>): void {
        this.#listeners.deleteKeyValue(type, listener);
    }
    /**
   * Clear all event listeners
   * @private
   */ clearEventListeners() {
        if (this.#disposed) return;
        this.#listeners.clear();
    }
}
; // CONCATENATED MODULE: ../collections/src/queue/queue-mutable.ts
//'../../Events.js';
/**
 * Mutable queue that fires events when manipulated.
 * 
 * Queues are useful if you want to treat 'older' or 'newer'
 * items differently. _Enqueing_ adds items at the back of the queue, while
 * _dequeing_ removes items from the front (ie. the oldest).
 *
 * ```js
 * const q = Queues.mutable();       // Create
 * q.enqueue(`a`, `b`);     // Add two strings
 * const front = q.dequeue();  // `a` is at the front of queue (oldest)
 * ```
 *
 * @example Cap size to 5 items, throwing away newest items already in queue.
 * ```js
 * const q = Queues.mutable({capacity: 5, discardPolicy: `newer`});
 * ```
 *
 * Events can be used to monitor data flows.
 * * 'enqueue': fires when item(s) are added
 * * 'dequeue': fires when an item is dequeued from front
 * * 'removed': fires when an item is dequeued, queue is cleared or .removeWhere is used to trim queue
 * 
 * Each of the event handlers return the state of the queue as the 'finalData'
 * field.
 * 
 * ```js
 * q.addEventListener(`enqueue`, e => {
 *  // e.added, e.finalData
 * });
 * q.addEventListener(`removed`, e => {
 *  // e.removed, e.finalData
 * });
 * q.addEventListener(`dequeue`, e=> {
 *  // e.removed, e.finalData
 * })
 * ```
 * @typeParam V - Data type of items
 */ class queue_mutable_QueueMutable extends SimpleEventEmitter {
    options;
    data;
    eq;
    constructor(opts = {}, data = []){
        super();
        if (opts === undefined) throw new Error(`opts parameter undefined`);
        this.options = opts;
        this.data = data;
        this.eq = opts.eq ?? is_equal_isEqualDefault;
    }
    clear() {
        const copy = [
            ...this.data
        ];
        this.data = [];
        this.fireEvent(`removed`, {
            finalData: this.data,
            removed: copy
        });
        this.onClear();
    }
    /**
   * Called when all data is cleared
   */ onClear() {}
    at(index) {
        if (index >= this.data.length) throw new Error(`Index outside bounds of queue`);
        const v = this.data.at(index);
        if (v === undefined) throw new Error(`Index appears to be outside range of queue`);
        return v;
    }
    enqueue(...toAdd) {
        this.data = enqueue(this.options, this.data, ...toAdd);
        const length = this.data.length;
        this.onEnqueue(this.data, toAdd);
        return length;
    }
    onEnqueue(result, attemptedToAdd) {
        this.fireEvent(`enqueue`, {
            added: attemptedToAdd,
            finalData: result
        });
    }
    dequeue() {
        const v = peek(this.options, this.data);
        if (v === undefined) return;
        /* eslint-disable-next-line functional/immutable-data */ this.data = dequeue(this.options, this.data);
        this.fireEvent(`dequeue`, {
            removed: v,
            finalData: this.data
        });
        this.onRemoved([
            v
        ], this.data);
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
   */ removeWhere(predicate) {
        const countPre = this.data.length;
        const toRemove = this.data.filter((v)=>predicate(v));
        if (toRemove.length === 0) return 0;
        this.data = this.data.filter((element)=>!predicate(element));
        this.onRemoved(toRemove, this.data);
        return countPre - this.data.length;
    }
    /**
 * Return a copy of the array
 * @returns 
 */ toArray() {
        return [
            ...this.data
        ];
    }
    get isEmpty() {
        return queue_fns_isEmpty(this.options, this.data);
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
}
/**
 * Creates a new QueueMutable
 * @param options 
 * @param startingItems 
 * @returns 
 */ function mutable(options = {}, ...startingItems) {
    return new queue_mutable_QueueMutable({
        ...options
    }, [
        ...startingItems
    ]);
}
; // CONCATENATED MODULE: ../flow/src/timeout.ts
/**
 * Returns a {@link Timeout} that can be triggered, cancelled and reset. Use {@link continuously} for interval-
 * based loops.
 *
 * Once `start()` is called, `callback` will be scheduled to execute after `interval`.
 * If `start()` is called again, the waiting period will be reset to `interval`.
 *
 * @example Essential functionality
 * ```js
 * const fn = () => {
 *  console.log(`Executed`);
 * };
 * const t = timeout(fn, 60*1000);
 * t.start();   // After 1 minute `fn` will run, printing to the console
 * ```
 *
 * @example Control execution functionality
 * ```
 * t.cancel();  // Cancel it from running
 * t.start();   // Schedule again after 1 minute
 * t.start(30*1000); // Cancel that, and now scheduled after 30s
 * 
 * // Get the current state of timeout
 * t.runState;    // "idle", "scheduled" or "running"
 * ```
 *
 * Callback function receives any additional parameters passed in from start. This can be useful for passing through event data:
 *
 * @example
 * ```js
 * const t = timeout( (elapsedMs, ...args) => {
 *  // args contains event data
 * }, 1000);
 * el.addEventListener(`click`, t.start);
 * ```
 *
 * Asynchronous callbacks can be used as well:
 * ```js
 * timeout(async () => {...}, 100);
 * ```
 *
 * If you don't expect to need to control the timeout, consider using {@link delay},
 * which can run a given function after a specified delay.
 * @param callback
 * @param interval
 * @returns {@link Timeout}
 */ const timeout = (callback, interval1)=>{
    if (callback === undefined) {
        throw new Error(`callback parameter is undefined`);
    }
    const intervalMs = interval_type_intervalToMs(interval1);
    throwIntegerTest(intervalMs, `aboveZero`, `interval`);
    let timer;
    let startedAt = 0;
    let startCount = 0;
    let startCountTotal = 0;
    let state = `idle`;
    const clear = ()=>{
        startedAt = 0;
        globalThis.clearTimeout(timer);
        state = `idle`;
    };
    const start = async (altInterval = interval1, args)=>{
        const p = new Promise((resolve, reject)=>{
            startedAt = performance.now();
            const altTimeoutMs = interval_type_intervalToMs(altInterval);
            const it = numbers_integerTest(altTimeoutMs, `aboveZero`, `altTimeoutMs`);
            if (!it[0]) {
                reject(new Error(it[1]));
                return;
            }
            switch(state){
                case `scheduled`:
                    {
                        // Cancel other scheduled execution
                        cancel();
                        break;
                    }
                case `running`:
                    {
                        break;
                    }
            }
            state = `scheduled`;
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            timer = globalThis.setTimeout(async ()=>{
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
                resolve();
            }, altTimeoutMs);
        });
        return p;
    };
    const cancel = ()=>{
        if (state === `idle`) return;
        clear();
    };
    return {
        start,
        cancel,
        get runState () {
            return state;
        },
        get startCount () {
            return startCount;
        },
        get startCountTotal () {
            return startCountTotal;
        }
    };
}; // const average = movingAverageLight();
// const rm = rateMinimum({
//   interval: { secs: 1 },
//   whatToCall: (distance: number) => {
//     average(distance);
//   },
//   fallback() {
//     return 0;
//   }
// })
// document.addEventListener(`pointermove`, event => {
//   rm(event.movementX + event.movementY);
// });
; // CONCATENATED MODULE: ../rx/src/ops/chunk.ts
/**
 * Queue from `source`, emitting when thresholds are reached. 
 * The resulting Reactive produces arrays.
 * 
 * Can use a combination of elapsed time or number of data items.
 * 
 * By default options are OR'ed together.
 *
 * ```js
 * // Emit data in chunks of 5 items
 * chunk(source, { quantity: 5 });
 * // Emit a chunk of data every second
 * chunk(source, { elapsed: 1000 });
 * ```
 * @param source 
 * @param options 
 * @returns 
 */ function chunk_chunk(source, options = {}) {
    const queue = new queue_mutable_QueueMutable();
    const quantity = options.quantity ?? 0;
    const returnRemainder = options.returnRemainder ?? true;
    const upstreamOpts = {
        ...options,
        onStop () {
            if (returnRemainder && !queue.isEmpty) {
                const data = queue.toArray();
                queue.clear();
                upstream.set(data);
            }
        },
        onValue (value) {
            queue.enqueue(value);
            if (quantity > 0 && queue.length >= quantity) {
                // Reached quantity limit
                send();
            }
            // Start timer
            if (timer !== undefined && timer.runState === `idle`) {
                timer.start();
            }
        }
    };
    const upstream = initUpstream(source, upstreamOpts);
    //let testElapsed = performance.now();
    const send = ()=>{
        //console.log(`Elapsed: ${ performance.now() - testElapsed }`);
        //testElapsed = performance.now();
        if (queue.isEmpty) return;
        // Reset timer
        if (timer !== undefined) timer.start();
        // Fire queued data
        const data = queue.toArray();
        queue.clear();
        setTimeout(()=>{
            upstream.set(data);
        });
    };
    const timer = options.elapsed ? timeout(send, options.elapsed) : undefined;
    // const trigger = () => {
    //   const now = performance.now();
    //   let byElapsed = false;
    //   let byLimit = false;
    //   if (elapsed > 0 && (now - lastFire > elapsed)) {
    //     lastFire = now;
    //     byElapsed = true;
    //   }
    //   if (limit > 0 && queue.length >= limit) {
    //     byLimit = true;
    //   }
    //   if (logic === `or` && (!byElapsed && !byLimit)) return;
    //   if (logic === `and` && (!byElapsed || !byLimit)) return;
    //   send();
    // }
    return toReadable(upstream);
}
; // CONCATENATED MODULE: ../guards/src/object.ts
/**
 * Returns _true_ if `value` is a plain object
 * 
 * ```js
 * isPlainObject(`text`); // false
 * isPlainObject(document); // false
 * isPlainObject({ hello: `there` }); // true
 * ```
 * @param value 
 * @returns 
 */ const isPlainObject = (value)=>{
    if (typeof value !== `object` || value === null) return false;
    const prototype = Object.getPrototypeOf(value);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
};
/**
 * Returns _true_ if `value` is primitive value or plain object
 * @param value 
 * @returns 
 */ const isPlainObjectOrPrimitive = (value)=>{
    const t = typeof value;
    if (t === `symbol`) return false;
    if (t === `function`) return false;
    if (t === `bigint`) return true;
    if (t === `number`) return true;
    if (t === `string`) return true;
    if (t === `boolean`) return true;
    return isPlainObject(value);
};
; // CONCATENATED MODULE: ../rx/src/ops/clone-from-fields.ts
/**
 * Create a new object from input, based on cloning fields rather than a destructured copy.
 * This is useful for event args.
 * @param source 
 * @returns 
 */ const cloneFromFields = (source)=>{
    return transform_transform(source, (v)=>{
        const entries = [];
        for(const field in v){
            const value = v[field];
            if (isPlainObjectOrPrimitive(value)) {
                entries.push([
                    field,
                    value
                ]);
            }
        }
        return Object.fromEntries(entries);
    });
};
; // CONCATENATED MODULE: ../rx/src/ops/combine-latest-to-array.ts
/* eslint-disable @typescript-eslint/unbound-method */ /**
 * Monitors input reactive values, storing values as they happen to an array.
 * Whenever a new value is emitted, the whole array is sent out, containing current
 * values from each source, or _undefined_ if not yet emitted.
 * 
 * See {@link combineLatestToObject} to combine streams by name into an object, rather than array.
 * 
 * ```
 * const sources = [
 *  Rx.fromFunction(Math.random, { loop: true, interval: 100 }),
 *  Rx.fromFunction(Math.random, { loop: true, interval: 200 })
 * ];
 * const r = Rx.combineLatestToArray(sources);
 * r.onValue(value => {
 *  // Value will be an array of last value from each source:
 *  // [number,number]  
 * });
 * ```
 * 
 * The tempo of this stream will be set by the fastest source stream.
 * See {@link syncToArray} to have pace determined by slowest source, and only
 * send when each source has produce a new value compared to last time.
 * 
 * Set `onSourceDone` to choose behaviour if a source stops. By default it
 * is 'break', meaning the whole merged stream stops.
 * 
 * Note: unlike RxJS's `combineLatest`, does not wait for each source to emit once
 * before emitting first value.
 * @param reactiveSources Sources to merge
 * @param options Options for merging 
 * @returns 
 */ function combineLatestToArray(reactiveSources, options = {}) {
    const event = initStream();
    const onSourceDone = options.onSourceDone ?? `break`;
    const data = [];
    const sources = reactiveSources.map((source)=>resolveSource(source));
    const noop = ()=>{};
    const sourceOff = sources.map((_)=>noop);
    const doneSources = sources.map((_)=>false);
    const unsub = ()=>{
        for (const v of sourceOff){
            v();
        }
    };
    for (const [index, v] of sources.entries()){
        data[index] = undefined;
        sourceOff[index] = v.on((message)=>{
            if (messageIsDoneSignal(message)) {
                doneSources[index] = true;
                sourceOff[index]();
                sourceOff[index] = noop;
                if (onSourceDone === `break`) {
                    unsub();
                    event.dispose(`Source has completed and 'break' is set`);
                    return;
                }
                if (!doneSources.includes(false)) {
                    // All sources are done
                    unsub();
                    event.dispose(`All sources completed`);
                }
            } else if (messageHasValue(message)) {
                data[index] = message.value;
                event.set([
                    ...data
                ]);
            }
        });
    }
    return {
        dispose: event.dispose,
        isDisposed: event.isDisposed,
        on: event.on,
        onValue: event.onValue
    };
}
; // CONCATENATED MODULE: ../core/src/is-primitive.ts
/**
 * Returns _true_ if `value` is number, string, bigint or boolean.
 * Returns _false_ if `value` is an object, null, undefined
 * 
 * Use {@link isPrimitiveOrObject} to also return true if `value` is an object.
 * @param value Value to check
 * @returns _True_ if value is number, string, bigint or boolean.
 */ function isPrimitive(value) {
    if (typeof value === `number`) return true;
    if (typeof value === `string`) return true;
    if (typeof value === `bigint`) return true;
    if (typeof value === `boolean`) return true;
    return false;
}
/**
 * Returns _true_ if `value` is number, string, bigint, boolean or an object
 * 
 * Use {@link isPrimitive} to not include objects.
 * @param value
 * @returns 
 */ function isPrimitiveOrObject(value) {
    if (isPrimitive(value)) return true;
    if (typeof value === `object`) return true;
    return false;
}
; // CONCATENATED MODULE: ../core/src/is-integer.ts
/**
 * Returns _true_ if `value` is an integer. Parses string input, but
 * all other data types return _false_.
 * 
 * ```js
 * isInteger(1);      // true
 * isInteger(1.1);    // false
 * isInteger(`1`);    // true
 * isInteger(`1.1`);  // false
 * isInteger(true);   // false
 * isInteger(false);  // false
 * ```
 * 
 * Returns _false_ for _undefined_, NaN, booleans and infinite numbers.
 * @param value 
 * @returns 
 */ const is_integer_isInteger = (value)=>{
    if (value === undefined) return false;
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
; // CONCATENATED MODULE: ../core/src/records/index.ts
/**
 * Maps the keys of an object, returning a transformed object.
 * ```js
 * const input = {
 *  hello: `there`,
 *  chap: `chappie`
 * }
 * 
 * mapObjectKeys(input, key => key.toUppercase());
 * 
 * // Yields: { HELLO: `there`, CHAP: `chappie` }
 * ```
 * @param object 
 * @param mapFunction 
 * @returns 
 */ const mapObjectKeys = (object, mapFunction)=>{
    const destinationObject = {};
    for (const entries of Object.entries(object)){
        const key = mapFunction(entries[0]);
        destinationObject[key] = entries[1];
    }
    return destinationObject;
};
; // CONCATENATED MODULE: ../core/src/iterable-compare-values-shallow.ts
/**
 * Compares the values of two iterables, returning a list
 * of items they have in common and those unique in `a` or `b`.
 * Ignores ordering of values, and is NOT recursive.
 *
 * ```js
 * const a = ['apples', 'oranges', 'pears' ]
 * const b = ['pears', 'kiwis', 'bananas' ];
 *
 * const r = compareValuesShallow(a, b);
 * r.shared;  // [ 'pears' ]
 * r.a;       // [ 'apples', 'oranges' ]
 * r.b;       // [ 'kiwis', 'bananas' ]
 * ```
 * 
 * By default uses === semantics for comparison.
 * @param a
 * @param b
 * @param eq
 * @returns
 */ const compareIterableValuesShallow = (a, b, eq = is_equal_isEqualDefault)=>{
    const shared = [];
    const aUnique = [];
    const bUnique = [];
    for (const elementOfA of a){
        let seenInB = false;
        // Does B contain this thing from A?
        for (const elementOfB of b){
            if (eq(elementOfA, elementOfB)) {
                seenInB = true;
                break;
            }
        }
        if (seenInB) {
            // Common in A & B
            shared.push(elementOfA);
        } else {
            // No, it's only found in A
            aUnique.push(elementOfA);
        }
    }
    for (const elementOfB of b){
        let seenInA = false;
        // Does A contain this thing from B?
        for (const elementOfA of a){
            if (eq(elementOfB, elementOfA)) {
                seenInA = true;
            }
        }
        if (!seenInA) {
            // No, something unique to B
            bUnique.push(elementOfB);
        }
    }
    // Are the two iterables the same?
    const isSame = aUnique.length === 0 && bUnique.length === 0;
    return {
        shared,
        isSame,
        a: aUnique,
        b: bUnique
    };
};
; // CONCATENATED MODULE: ../core/src/records/compare.ts
/**
 * Compares the keys of two objects, returning a set of those in
 * common, and those in either A or B exclusively.
 * ```js
 * const a = { colour: `red`, intensity: 5 };
 * const b = { colour: `pink`, size: 10 };
 * const c = compareObjectKeys(a, b);
 * // c.shared = [ `colour` ]
 * // c.a = [ `intensity` ]
 * // c.b = [ `size`  ]
 * ```
 * @param a 
 * @param b 
 * @returns 
 */ const compareObjectKeys = (a, b)=>{
    const c = compareIterableValuesShallow(Object.keys(a), Object.keys(b));
    return c;
};
/**
 * Returns the changed fields from A -> B. It's assumed that A and B have the same shape.
 * ie. returns an object that only consists of fields which have changed in B compared to A.
 * 
 * ```js
 * const a = { msg: `hi`, v: 10 };
 * 
 * changedDataFields(a, { msg: `hi`,   v: 10 }); // {}
 * changedDataFields(a, { msg: `hi!!`, v: 10 }); // { msg: `hi!!` }
 * changedDataFields(a, { msg: `hi!!` });       // { msg: `hi!!`, v: undefined }
 * ```
 * 
 * Under the hood, we use {@link compareObjectData}(a, b, true). If B has additional or removed fields,
 * this is considered an error.
 * 
 * If a field is an array, the whole array is returned, rather than a diff.
 * @param a 
 * @param b 
 */ const changedObjectDataFields = (a, b)=>{
    const r = compareObjectData(a, b, true);
    if (Object.entries(r.added).length > 0) throw new Error(`Shape of data has changed`);
    if (Object.entries(r.removed).length > 0) throw new Error(`Shape of data has changed`);
    const output = compareResultToObject(r, b);
    return output;
};
const compareResultToObject = (r, b)=>{
    const output = {};
    if (r.isArray) {
        return b;
    }
    for (const entry of Object.entries(r.changed)){
        output[entry[0]] = entry[1];
    }
    for (const entry of Object.entries(r.added)){
        output[entry[0]] = entry[1];
    }
    for (const childEntry of Object.entries(r.children)){
        const childResult = childEntry[1];
        if (childResult.hasChanged) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            output[childEntry[0]] = compareResultToObject(childResult, b[childEntry[0]]);
        }
    }
    return output;
};
/**
 * Produces a {@link CompareChangeSet} between two arrays.
 * 
 * @param a Earlier array to compare
 * @param b Later array to compare
 * @param eq Equality comparison for values
 * @returns Change set.
 */ const compareArrays = (a, b, eq = is_equal_isEqualDefault)=>{
    if (!Array.isArray(a)) throw new Error(`Param 'a' is not an array`);
    if (!Array.isArray(b)) throw new Error(`Param 'b' is not an array`);
    const c = compareObjectData(a, b, false, eq);
    if (!c.isArray) throw new Error(`Change set does not have arrays as parameters`);
    const convert = (key)=>{
        if (key.startsWith(`_`)) {
            return Number.parseInt(key.slice(1));
        } else throw new Error(`Unexpected key '${key}'`);
    };
    const cc = {
        ...c,
        added: mapObjectKeys(c.added, convert),
        changed: mapObjectKeys(c.changed, convert),
        removed: c.removed.map((v)=>convert(v)),
        summary: c.summary.map((value)=>{
            return [
                value[0],
                convert(value[1]),
                value[2]
            ];
        })
    };
    return cc;
};
/**
 * Compares A to B. Assumes they are simple objects, essentially key-value pairs, where the 
 * values are primitive values or other simple objects. It also works with arrays.
 * 
 * Uses === equality semantics by default.
 * @param a 
 * @param b 
 */ const compareObjectData = (a, b, assumeSameShape = false, eq = is_equal_isEqualDefault)=>{
    a ??= {};
    b ??= {};
    const entriesA = Object.entries(a);
    const entriesB = Object.entries(b);
    const scannedKeys = new Set();
    const changed = {};
    const added = {};
    const children = {};
    const removed = [];
    const isArray = Array.isArray(a);
    const summary = new Array();
    let hasChanged = false;
    // Look for existing entries of A that are modified
    for (const entry of entriesA){
        const outputKey = isArray ? `_${entry[0]}` : entry[0];
        const aValue = entry[1];
        const bValue = b[entry[0]];
        scannedKeys.add(entry[0]);
        if (bValue === undefined) {
            // B does not have a key from A
            hasChanged = true;
            if (assumeSameShape && !isArray) {
                // If we're assuming it's the same shape, then _undefined_ is actually the value
                changed[outputKey] = bValue;
                summary.push([
                    `mutate`,
                    outputKey,
                    bValue
                ]);
            } else {
                // Key removed
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
            const childSummary = r.summary.map((sum)=>{
                return [
                    sum[0],
                    outputKey + `.` + sum[1],
                    sum[2]
                ];
            });
            summary.push(...childSummary);
        } else {
            if (!eq(aValue, bValue)) {
                changed[outputKey] = bValue;
                hasChanged = true;
                summary.push([
                    `mutate`,
                    outputKey,
                    bValue
                ]);
            }
        }
    }
    // Look for entries in B that weren't in A
    if (!assumeSameShape || isArray) {
        for (const entry of entriesB){
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
; // CONCATENATED MODULE: ../core/src/records/pathed.ts
const getEntries = (target, deepProbe)=>{
    if (target === undefined) throw new Error(`Param 'target' is undefined`);
    if (target === null) throw new Error(`Param 'target' is null`);
    if (typeof target !== `object`) throw new Error(`Param 'target' is not an object (got: ${typeof target})`);
    if (deepProbe) {
        const entries = [];
        for(const field in target){
            const value = target[field];
            if (isPlainObjectOrPrimitive(value)) {
                entries.push([
                    field,
                    value
                ]);
            }
        }
        return entries;
    } else {
        return Object.entries(target);
    }
};
/**
 * Scans object, producing a list of changed fields where B's value (newer) differs from A (older).
 * 
 * Options:
 * - `deepEntries` (_false_): If _false_ Object.entries are used to scan the object. However this won't work for some objects, eg event args, thus _true_ is needed.
 * - `eq` (JSON.stringify): By-value comparison function
 * - `includeMissingFromA` (_false): If _true_ includes fields present on B but missing on A.
 * - `asPartial` (_false): If _true_, treats B as a partial update to B. This means that things missing from B are not considered removals.
 * @param a 'Old' value
 * @param b 'New' value
 * @param options Options for comparison
 * @returns 
 */ function* compareData(a, b, options = {}) {
    if (typeof a === `undefined`) {
        yield {
            path: options.pathPrefix ?? ``,
            value: b,
            state: `added`
        };
        return;
    }
    if (typeof b === `undefined`) {
        yield {
            path: options.pathPrefix ?? ``,
            previous: a,
            value: undefined,
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
    //console.log(`Pathed.compareData: a: ${ JSON.stringify(a) } b: ${ JSON.stringify(b) } prefix: ${ pathPrefix }`);
    if (isPrimitive(a) && isPrimitive(b)) {
        if (a !== b) yield {
            path: pathPrefix,
            value: b,
            previous: a,
            state: `change`
        };
        return;
    }
    if (isPrimitive(b)) {
        yield {
            path: pathPrefix,
            value: b,
            previous: a,
            state: `change`
        };
        return;
    }
    const entriesA = getEntries(a, deepEntries);
    const entriesAKeys = new Set();
    for (const [key, valueA] of entriesA){
        entriesAKeys.add(key);
        const keyOfAInB = key in b;
        const valueOfKeyInB = b[key];
        //console.log(`Pathed.compareData Pathed.compareDataA key: ${ key } valueA: ${ JSON.stringify(valueA) }`);
        if (typeof valueA === `object` && valueA !== null) {
            if (keyOfAInB) {
                //console.log(`Pathed.compareData key ${ key } exists in B. value:`, valueB);
                if (valueOfKeyInB === undefined) {
                    throw new Error(`Pathed.compareData Value for key ${key} is undefined`);
                } else {
                    const sub = [
                        ...compareData(valueA, valueOfKeyInB, {
                            ...options,
                            pathPrefix: pathPrefix + key + `.`
                        })
                    ];
                    if (sub.length > 0) {
                        for (const s of sub)yield s;
                        if (includeParents) {
                            yield {
                                path: pathPrefix + key,
                                value: b[key],
                                previous: valueA,
                                state: `change`
                            };
                        }
                    }
                }
            } else {
                if (asPartial) continue;
                //throw new Error(`Key does not exist in B. Key: '${ key }'. B: ${ JSON.stringify(b) } A: ${ JSON.stringify(a) }`);
                yield {
                    path: pathPrefix + key,
                    value: undefined,
                    previous: valueA,
                    state: `removed`
                };
            }
        } else {
            const subPath = pathPrefix + key;
            if (keyOfAInB) {
                // B contains key from A
                if (valueOfKeyInB === undefined && undefinedValueMeansRemoved) {
                    //console.error(`Pathed.compareData (2) value for B is undefined. key: ${ key }. B: ${ JSON.stringify(b) } A: ${ JSON.stringify(a) }`);
                    yield {
                        path: subPath,
                        previous: valueA,
                        value: undefined,
                        state: `removed`
                    };
                } else {
                    if (!eq(valueA, valueOfKeyInB, subPath)) {
                        //console.log(`Pathed.compareData  value changed. A: ${ valueA } B: ${ valueB } subPath: ${ subPath }`)
                        yield {
                            path: subPath,
                            previous: valueA,
                            value: valueOfKeyInB,
                            state: `change`
                        };
                    }
                }
            } else {
                // B does not contain key from A
                if (asPartial) continue; // Ignore
                yield {
                    path: subPath,
                    previous: valueA,
                    value: undefined,
                    state: `removed`
                };
            }
        }
    }
    if (includeMissingFromA) {
        const entriesB = getEntries(b, deepEntries);
        for (const [key, valueB] of entriesB){
            if (entriesAKeys.has(key)) continue;
            // Key in B that's not in A
            //console.log(`Pathed.compareDataB key: ${ key } value: ${ valueB }`);
            yield {
                path: pathPrefix + key,
                previous: undefined,
                value: valueB,
                state: `added`
            };
        }
    }
}
/**
 * Returns a copy of `source` with `changes` applied.
 * @param source 
 * @param changes 
 */ const applyChanges = (source, changes)=>{
    for (const change of changes){
        source = updateByPath(source, change.path, change.value);
    }
    return source;
};
/**
 * Returns a copy of `target` object with a specified path changed to `value`.
 * 
 * ```js
 * const a = {
 *  message: `Hello`,
 *  position: { x: 10, y: 20 }
 * }
 * 
 * const a1 = updateByPath(a, `message`, `new message`);
 * // a1 = { message: `new message`, position: { x: 10, y: 20 }}
 * const a2 = updateByPath(a, `position.x`, 20);
 * // a2 = { message: `hello`, position: { x: 20, y: 20 }}
 * ```
 * 
 * Paths can also be array indexes:
 * ```js
 * updateByPath([`a`,`b`,`c`], 2, `d`);
 * // Yields: [ `a`, `b`, `d` ]
 * ```
 * 
 * By default, only existing array indexes can be updated. Use the `allowShapeChange` parameter 
 * to allow setting arbitrary indexes.
 * ```js
 * // Throws because array index 3 is undefined
 * updateByPath([ `a`, `b`, `c` ], `3`, `d`);
 * 
 * // With allowShapeChange flag
 * updateByPath([ `a`, `b`, `c` ], `3`, `d`, true);
 * // Returns: [ `a`, `b`, `c`, `d` ]
 * ```
 * 
 * Throws an error if:
 * * `path` cannot be resolved (eg. `position.z` in the above example)
 * * `value` applied to `target` results in the object having a different shape (eg missing a field, field
 * changing type, or array index out of bounds). Use `allowShapeChange` to suppress this error.
 * * Path is undefined or not a string
 * * Target is undefined/null
 * @param target Object to update
 * @param path Path to set value
 * @param value Value to set
 * @param allowShapeChange By default _false_, throwing an error if an update change the shape of the original object.
 * @returns 
 */ const updateByPath = (target, path, value, allowShapeChange = false)=>{
    if (path === undefined) throw new Error(`Parameter 'path' is undefined`);
    if (typeof path !== `string`) throw new Error(`Parameter 'path' should be a string. Got: ${typeof path}`);
    if (target === undefined) throw new Error(`Parameter 'target' is undefined`);
    if (target === null) throw new Error(`Parameter 'target' is null`);
    const split = path.split(`.`);
    const r = updateByPathImpl(target, split, value, allowShapeChange);
    return r;
};
const updateByPathImpl = (o, split, value, allowShapeChange)=>{
    if (split.length === 0) {
        //console.log(`Pathed.updateByPathImpl o: ${ JSON.stringify(o) } value: ${ JSON.stringify(value) }`);
        if (allowShapeChange) return value; // yolo
        if (Array.isArray(o) && !Array.isArray(value)) throw new Error(`Expected array value, got: '${JSON.stringify(value)}'. Set allowShapeChange=true to ignore.`);
        if (!Array.isArray(o) && Array.isArray(value)) throw new Error(`Unexpected array value, got: '${JSON.stringify(value)}'. Set allowShapeChange=true to ignore.`);
        if (typeof o !== typeof value) throw new Error(`Cannot reassign object type. (${typeof o} -> ${typeof value}). Set allowShapeChange=true to ignore.`);
        // Make sure new value has the same set of keys
        if (typeof o === `object` && !Array.isArray(o)) {
            const c = compareObjectKeys(o, value);
            if (c.a.length > 0) {
                throw new Error(`New value is missing key(s): ${c.a.join(`,`)}`);
            }
            if (c.b.length > 0) {
                throw new Error(`New value cannot add new key(s): ${c.b.join(`,`)}`);
            }
        }
        return value;
    }
    const start = split.shift();
    if (!start) return value;
    const isInt = is_integer_isInteger(start);
    if (isInt && Array.isArray(o)) {
        const index = Number.parseInt(start);
        if (index >= o.length && !allowShapeChange) throw new Error(`Array index ${index.toString()} is outside of the existing length of ${o.length.toString()}. Use allowShapeChange=true to permit this.`);
        const copy = [
            ...o
        ];
        copy[index] = updateByPathImpl(copy[index], split, value, allowShapeChange);
        return copy;
    } else if (start in o) {
        const copy = {
            ...o
        };
        copy[start] = updateByPathImpl(copy[start], split, value, allowShapeChange);
        return copy;
    } else {
        throw new Error(`Path ${start} not found in data`);
    }
};
/**
 * Gets the data at `path` in `object`. Assumes '.' separates each segment of path.
 * ```js
 * getField({ name: { first: `Thom`, last: `Yorke` }}, `name.first`); // 'Thom'
 * getField({ colours: [`red`, `green`, `blue` ]}, `colours.1`); // `green`
 * ```
 * 
 * Returns _undefined_ if path could not be resolved.
 * 
 * Throws if:
 * * `path` is not a string or empty
 * * `object` is _undefined_ or null
 * @param object 
 * @param path 
 * @returns 
 */ const getField = (object, path)=>{
    if (typeof path !== `string`) throw new Error(`Param 'path' ought to be a string. Got: '${typeof path}'`);
    if (path.length === 0) throw new Error(`Param string 'path' is empty`);
    if (object === undefined) throw new Error(`Param 'object' is undefined`);
    if (object === null) throw new Error(`Param 'object' is null`);
    const split = path.split(`.`);
    const v = getFieldImpl(object, split);
    return v;
};
const getFieldImpl = (object, split)=>{
    if (object === undefined) throw new Error(`Param 'object' is undefined`);
    if (split.length === 0) throw new Error(`Path has run out`);
    const start = split.shift();
    if (!start) throw new Error(`Unexpected empty split path`);
    const isInt = is_integer_isInteger(start);
    if (isInt && Array.isArray(object)) {
        const index = Number.parseInt(start); //start.slice(1, -1));
        //console.log(`getFieldImpl index: ${ index } value: ${ object[ index ] }`);
        if (typeof object[index] === `undefined`) {
            return {
                success: false,
                error: `Index '${index}' does not exist. Length: ${object.length}`
            };
        }
        if (split.length === 0) {
            return {
                value: object[index],
                success: true
            };
        } else {
            return getFieldImpl(object[index], split);
        }
    } else if (typeof object === `object` && start in object) {
        //console.log(`start in object. Start: ${ start } Len: ${ split.length } Object`, object);
        if (split.length === 0) {
            return {
                value: object[start],
                success: true
            };
        } else {
            return getFieldImpl(object[start], split);
        }
    } else {
        return {
            success: false,
            error: `Path '${start}' not found`
        };
    }
};
/**
 * Iterates 'paths' for all the fields on `o`
 * ```
 * const d = {
 *  accel: { x: 1, y: 2, z: 3 },
 *  gyro: { x: 4, y: 5, z: 6 }
 * };
 * const paths = [...getFieldPaths(d)];
 * // Yields [ `accel`, `gyro`, `accel.x`, `accel.y`,`accel.z`,`gyro.x`,`gyro.y`,`gyro.z` ]
 * ```
 *
 * Use {@link getField} to fetch data based on a path
 *
 * If object is _null_ or _undefined_, no results are returned.
 * 
 * If `onlyLeaves` is _true_ (default: _false_), only 'leaf' nodes are included. 
 * Leaf nodes are those that contain a primitive value.
 * ```js
 * const paths = getFieldPaths(d, true);
 * // Yields [ `accel.x`, `accel.y`,`accel.z`,`gyro.x`,`gyro.y`,`gyro.z` ]
 * ```
 *
 * @param object Object to get paths for.
 * @param onlyLeaves If true, only paths with a primitive value are returned.
 * @returns
 */ function* getPaths(object, onlyLeaves = false) {
    if (object === undefined || object === null) return;
    const iter = recordEntriesDepthFirst(object);
    for (const c of iter){
        if (c.nodeValue === undefined && onlyLeaves) continue;
        let path = c.name;
        if (c.ancestors.length > 0) path = c.ancestors.join(`.`) + `.` + path;
        yield path;
    }
}
/**
 * Returns a representation of the object as a set of paths and data.
 * ```js
 * const o = { name: `hello`, size: 20, colour: { r:200, g:100, b:40 } }
 * const pd = [...getPathsAndData(o)];
 * // Yields:
 * // [ 
 * // { path: `name`, value: `hello` },
 * // { path: `size`, value: `20` },
 * // { path: `colour.r`, value: `200` },
 * // { path: `colour.g`, value: `100` },
 * // { path: `colour.b`, value: `40` }
 * //]
 * ```
 * @param o Object to get paths and data for
 * @param maxDepth Set maximum recursion depth. By default unlimited.
 * @param prefix Manually set a path prefix if it's necessary
 * @returns 
 */ function* getPathsAndData(o, onlyLeaves = false, maxDepth = Number.MAX_SAFE_INTEGER, prefix = ``) {
    if (o === null) return;
    if (o === undefined) return;
    yield* getPathsAndDataImpl(o, prefix, onlyLeaves, maxDepth);
}
function* getPathsAndDataImpl(o, prefix, onlyLeaves = false, maxDepth) {
    if (maxDepth <= 0) return;
    if (typeof o !== `object`) return;
    for (const entries of Object.entries(o)){
        const sub = (prefix.length > 0 ? prefix + `.` : ``) + entries[0];
        const value = entries[1];
        const leaf = typeof value !== `object`;
        if (onlyLeaves && leaf || !onlyLeaves) {
            yield {
                path: sub,
                value
            };
        }
        yield* getPathsAndDataImpl(value, sub, onlyLeaves, maxDepth - 1);
    }
}
; // CONCATENATED MODULE: ../core/src/results.ts
// export type Result<T> = {
//   success: boolean
//   value?: T
//   error?: Error | string
// }
/**
 * If `result` is an error, throws it, otherwise ignored.
 * @param result 
 * @returns 
 */ function throwResult(result) {
    if (result.success) return true;
    if (typeof result.error === `string`) throw new Error(result.error);
    throw result.error;
}
function results_resultToError(result) {
    if (typeof result.error === `string`) return new Error(result.error);
    else return result.error;
}
function resultToValue(result) {
    if (result.success) return result.value;
    else throw results_resultToError(result);
}
function resultErrorToString(result) {
    if (typeof result.error === `string`) return result.error;
    else return getErrorMessage(result.error);
}
; // CONCATENATED MODULE: ../core/src/text.ts
//export { string as random } from './random/String.js';
//import { afterMatch, beforeAfterMatch, beforeMatch } from '../Text.js';
/**
 * Returns chunks of `source`, broken up by `delimiter` (default '.').
 * 
 * Whittles down from whole string to last token.
 * 
 * If `delimiter` is not found, no results are yielded.
 * 
 * ```js
 * stringSegmentsWholeToEnd(`a.b.c.d`);
 * // Yields:
 * // `a.b.c.d`
 * // `b.c.d`
 * // `c.d`
 * // `d`
 * ```
 * @param source 
 * @param delimiter 
 */ function* stringSegmentsWholeToEnd(source, delimiter = `.`) {
    while(source.length > 0){
        yield source;
        const trimmed = afterMatch(source, delimiter);
        if (trimmed === source) {
            break;
        }
        source = trimmed;
    }
}
/**
 * Returns chunks of `source`, broken up by `delimiter` (default '.').
 * 
 * Starts with last token, builds to whole.
 * 
 * If `delimiter` is not found, no results are yielded.
 * 
 * ````js
 * stringSegmentsLastToWhole(`a.b.c.d`);
 * // Yields:
 * // `d`
 * // `c.d`
 * // `b.c.d`
 * // `a.b.c.d`
 * ```
 * @param source 
 * @param delimiter 
 */ function* stringSegmentsLastToWhole(source, delimiter = `.`) {
    let accumulator = ``;
    const orig = source;
    while(source.length > 0){
        const ba = beforeAfterMatch(source, delimiter, {
            fromEnd: true,
            ifNoMatch: `original`
        });
        if (ba[0] === ba[1] && ba[1] === source) {
            break;
        }
        const v = ba[1] + accumulator;
        yield v;
        accumulator = delimiter + v;
        source = ba[0];
    }
    yield orig;
}
/**
 * Returns chunks of `source`, broken up by `delimiter` (default '.').
 * 
 * We start with the first token and build up until end.
 * 
 * If `delimiter` is not found, no results are yielded.
 * 
 * ```js
 * stringSegmentsFirstToWhole(`a.b.c.d`);
 * // Yields:
 * // `a`
 * // `a.b`
 * // `a.b.c`
 * // `a.b.c.d`
 * ```
 * @param source 
 * @param delimiter 
 */ function* stringSegmentsFirstToWhole(source, delimiter = `.`) {
    let accumulator = ``;
    const orig = source;
    while(source.length > 0){
        const ba = beforeAfterMatch(source, delimiter, {
            ifNoMatch: `original`
        });
        if (ba[0] === source && ba[1] === source) break;
        accumulator += ba[0];
        yield accumulator;
        accumulator += delimiter;
        source = ba[1];
    }
    yield orig;
}
/**
 * Returns chunks of `source`, broken up by `delimiter` (default '.').
 * 
 * We start with whole string and whittle down to starting token.
 * 
 * If `delimiter` is not found, no results are yielded.
 * 
 * ```js
 * stringSegmentsWholeToFirst(`a.b.c.d`);
 * // Yields:
 * // `a.b.c.d`
 * // `a.b.c`,
 * // `a.b`,
 * // `a`,
 * ```
 * @param source 
 * @param delimiter 
 */ function* stringSegmentsWholeToFirst(source, delimiter = `.`) {
    while(source.length > 0){
        yield source;
        const b = beforeMatch(source, delimiter, {
            ifNoMatch: `original`,
            fromEnd: true
        });
        if (b === source) break;
        source = b;
    }
}
/**
 * Given a long string, abbreviates it with ...
 * ```js
 * abbreviate(`This is something`, 7); // `This is...`
 * ```
 * 
 * If `source` is under `maxLength` the original is returned.
 * @param source 
 * @param maxLength Maximum length. Defaults to 20
 * @returns 
 */ const abbreviate = (source, maxLength = 15)=>{
    // ✔️ Unit tested
    throwFromResult(integerTest(maxLength, `aboveZero`, `maxLength`));
    if (typeof source !== `string`) throw new Error(`Parameter 'source' is not a string`);
    if (source.length > maxLength && source.length > 3) {
        if (maxLength > 15) {
            const chunk = Math.round((maxLength - 2) / 2);
            return source.slice(0, chunk) + `...` + source.slice(-chunk);
        }
        return source.slice(0, maxLength) + `...`;
    }
    return source;
};
/**
 * Uses JSON.toString() on `source`, but abbreviates result.
 * @param source Object to stringify
 * @param maxLength Default 20
 * @returns 
 */ const toStringAbbreviate = (source, maxLength = 20)=>{
    if (source === undefined) return `(undefined)`;
    if (source === null) return `(null)`;
    return abbreviate(JSON.stringify(source), maxLength);
};
/**
 * Returns source text that is between `start` and `end` match strings. Returns _undefined_ if start/end is not found.
 *
 * ```js
 * // Yields ` orange `;
 * between(`apple orange melon`, `apple`, `melon`);
 * ```
 * @param source Source text
 * @param start Start match
 * @param end If undefined, the `start` string will be looked for
 * @param lastEndMatch If true, looks for the last match of `end` (default). If false, looks for the first match.
 * @returns
 */ const text_between = (source, start, end, lastEndMatch = true)=>{
    // ✔ Unit tested
    const startPos = source.indexOf(start);
    if (startPos < 0) return;
    if (end === undefined) end = start;
    const endPos = lastEndMatch ? source.lastIndexOf(end) : source.indexOf(end, startPos + 1);
    if (endPos < 0) return;
    return source.slice(startPos + 1, endPos);
};
/**
 * Like {@link between}, but also returns the source string without the start/end match and what's between.
 * ```js
 * const [src,between] = betweenChomp('hello [there] friend', '[', ']');
 * // src: 'hello  friend'
 * // between: 'there'
 * ```
 * @param source
 * @param start
 * @param end
 * @param lastEndMatch
 * @returns
 */ const betweenChomp = (source, start, end, lastEndMatch = true)=>{
    // ✔ Unit tested
    if (typeof source !== `string`) throw new Error(`Parameter 'source' is not a string`);
    if (typeof start !== `string`) throw new Error(`Parameter 'start' is not a string`);
    if (end !== undefined && typeof end !== `string`) throw new Error(`Parameter 'end' is not a string`);
    const startPos = source.indexOf(start);
    if (startPos < 0) return [
        source,
        undefined
    ];
    if (end === undefined) end = start;
    const endPos = lastEndMatch ? source.lastIndexOf(end) : source.indexOf(end, startPos + 1);
    if (endPos < 0) return [
        source,
        undefined
    ];
    const between = source.slice(startPos + 1, endPos);
    const sourceResult = source.slice(0, startPos) + source.slice(endPos + 1);
    return [
        sourceResult,
        between
    ];
};
/**
 * Returns first position of the given character code, or -1 if not found.
 * @param source Source string
 * @param code Code to seek
 * @param start Start index, 0 by default
 * @param end End index (inclusive), source.length-1 by default
 * @returns Found position, or -1 if not found
 */ const indexOfCharCode = (source, code, start = 0, end = source.length - 1)=>{
    //eslint-disable-next-line functional/no-let
    for(let index = start; index <= end; index++){
        if (source.codePointAt(index) === code) return index;
    }
    return -1;
};
/**
 * Returns `source` with a given number of characters removed from start position.
 *
 * ```js
 * // Remove three characters starting at position 1
 * omitChars(`hello there`, 1, 3); // ie. removes 'ell'
 * // Yields: `ho there`
 * ```
 * @param source
 * @param removeStart Start point to remove
 * @param removeLength Number of characters to remove
 * @returns
 */ const omitChars = (source, removeStart, removeLength)=>source.slice(0, removeStart) + source.slice(removeStart + removeLength);
/**
 * Splits a string into `length`-size chunks.
 *
 * If `length` is greater than the length of `source`, a single element array is returned with source.
 * The final array element may be smaller if we ran out of characters.
 *
 * ```js
 * splitByLength(`hello there`, 2);
 * // Yields:
 * // [`he`, `ll`, `o `, `th`, `er`, `e`]
 * ```
 * @param source Source string
 * @param length Length of each chunk
 * @returns
 */ const splitByLength = (source, length)=>{
    throwFromResult(integerTest(length, `aboveZero`, `length`));
    if (source === null) throw new Error(`source parameter null`);
    if (typeof source !== `string`) {
        throw new TypeError(`source parameter not a string`);
    }
    // ✔ Unit tested
    const chunks = Math.ceil(source.length / length);
    const returnValue = [];
    //eslint-disable-next-line functional/no-let
    let start = 0;
    //eslint-disable-next-line functional/no-let
    for(let c = 0; c < chunks; c++){
        //eslint-disable-next-line functional/immutable-data
        returnValue.push(source.slice(start, start + length));
        start += length;
    }
    return returnValue;
};
// export const afterMatch = (
//   source: string,
//   match: string,
//   options: MatchOptions = {}
// ): string => {
//   if (source === undefined) throw new Error(`Param 'source' is undefined`);
//   //  ✔️ Unit tested
//   const startPos = options.startPos ?? undefined;
//   const fromEnd = options.fromEnd ?? false;
//   const m = fromEnd
//     ? source.lastIndexOf(match, startPos)
//     : source.indexOf(match, startPos);
//   if (m < 0) return source;
//   return source.slice(Math.max(0, m + match.length));
// };
/**
 * Returns all the text in `source` that precedes (and does not include) `match`. If not found, `source` is returned.
 * 
 * See also: {@link beforeMatch}, {@link beforeAfterMatch}.
 * 
 * ```js
 * afterMatch(`Hello. There`, `.`); // ' There'
 * afterMatch(`Hello, there', `,`); // 'Hello, there'
 * ```
 * 
 * If `source` is _undefined_, an error is thrown.
 * @param source
 * @param match
 * @param options
 * @returns
 */ const beforeMatch = (source, match, options = {})=>{
    const ba = beforeAfterMatch(source, match, options);
    return ba[0];
};
/**
 * Returns all the text in `source` that follows `match`. If not found, `source` is returned.
 * 
 * See also: {@link beforeMatch}, {@link beforeAfterMatch}.
 * 
 * ```js
 * afterMatch(`Hello. There`, `.`); // ' There'
 * afterMatch(`Hello, there', `,`); // 'Hello, there'
 * ```
 * 
 * If `source` is _undefined_, an error is thrown.
 * @param source
 * @param match
 * @param options
 * @returns
 */ const afterMatch = (source, match, options = {})=>{
    const ba = beforeAfterMatch(source, match, options);
    return ba[1];
};
/**
 * Returns the text that is before and after `match`.
 * 
 * See also: {@link beforeMatch}, {@link afterMatch}.
 * 
 * If `match` is at the end of start of `source`, after or before might be an empty string.
 * @param source 
 * @param match 
 * @param options 
 * @returns 
 */ const beforeAfterMatch = (source, match, options = {})=>{
    if (source === undefined) throw new Error(`Param 'source' is undefined`);
    let fallback = options.fallback;
    const ifNoMatch = options.ifNoMatch ?? (fallback ? `fallback` : `original`);
    if (ifNoMatch === `original`) fallback = source;
    if (ifNoMatch === `fallback` && fallback === undefined) throw new Error(`Fallback must be provided`);
    const startPos = options.startPos ?? undefined;
    const fromEnd = options.fromEnd ?? false;
    const m = fromEnd ? source.lastIndexOf(match, startPos) : source.indexOf(match, startPos);
    if (m < 0 && ifNoMatch === `throw`) throw new Error(`Match '${match}' not found in source.`);
    if (m < 0 && ifNoMatch === `original`) return [
        source,
        source
    ];
    if (m < 0 && ifNoMatch === `fallback`) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return [
            fallback,
            fallback
        ];
    }
    return [
        source.slice(0, m),
        source.slice(Math.max(0, m + match.length))
    ];
};
/**
 * 'Unwraps' a string, removing one or more 'wrapper' strings that it starts and ends with.
 * Only removes when a matching end is found.
 * ```js
 * unwrap("'hello'", "'");        // hello
 * // No mataching end 'a', so nothing happens
 * unwrap("apple", "a");          // apple
 * unwrap("wow", "w");            // o
 * unwrap(`"'blah'"`, '"', "'");  // blah
 * ```
 * @param source
 * @param wrappers
 * @returns
 */ const unwrap = (source, ...wrappers)=>{
    //eslint-disable-next-line functional/no-let
    let matched = false;
    do {
        matched = false;
        for (const w of wrappers){
            if (source.startsWith(w) && source.endsWith(w)) {
                source = source.slice(w.length, source.length - w.length * 2 + 1);
                matched = true;
            }
        }
    }while (matched);
    return source;
};
/**
 * Calculates the span, defined in {@link Range} indexes, that includes `start` through to `end` character positions.
 *
 * After using {@link splitRanges} to split text, `lineSpan` is used to associate some text coordinates with ranges.
 *
 * @param ranges Ranges
 * @param start Start character position, in source text reference
 * @param end End character position, in source text reference
 * @returns Span
 */ const lineSpan = (ranges, start, end)=>{
    //eslint-disable-next-line functional/no-let
    let s = -1;
    //eslint-disable-next-line functional/no-let
    let endPos = -1;
    //eslint-disable-next-line functional/no-let
    for (const [index, r] of ranges.entries()){
        s = index;
        if (r.text.length === 0) continue;
        if (start < r.end) {
            break;
        }
    }
    //eslint-disable-next-line functional/no-let
    for(let index = s; index < ranges.length; index++){
        const r = ranges[index];
        endPos = index;
        if (end === r.end) {
            endPos = index + 1;
            break;
        }
        if (end < r.end) {
            break;
        }
    }
    return {
        length: endPos - s,
        start: s,
        end: endPos
    };
};
/**
 * Splits a source string into ranges:
 * ```js
 * const ranges = splitRanges("hello;there;fella", ";");
 * ```
 *
 * Each range consists of:
 * ```js
 * {
 *  text: string  - the text of range
 *  start: number - start pos of range, wrt to source
 *  end: number   - end pos of range, wrt to source
 *  index: number - index of range (starting at 0)
 * }
 * ```
 * @param source
 * @param split
 * @returns
 */ const splitRanges = (source, split)=>{
    //eslint-disable-next-line functional/no-let
    let start = 0;
    //eslint-disable-next-line functional/no-let
    let text = ``;
    const ranges = [];
    //eslint-disable-next-line functional/no-let
    let index = 0;
    //eslint-disable-next-line functional/no-let,unicorn/prevent-abbreviations
    for(let i = 0; i < source.length; i++){
        if (source.indexOf(split, i) === i) {
            //eslint-disable-next-line functional/no-let
            const end = i;
            //eslint-disable-next-line functional/immutable-data
            ranges.push({
                text,
                start,
                end,
                index
            });
            start = end + 1;
            text = ``;
            index++;
        } else {
            text += source.charAt(i);
        }
    }
    if (start < source.length) {
        //eslint-disable-next-line functional/immutable-data
        ranges.push({
            text,
            start,
            index,
            end: source.length
        });
    }
    return ranges;
};
/**
 * Counts the number of times one of `chars` appears at the front of
 * a string, contiguously.
 *
 * ```js
 * countCharsFromStart(`  hi`, ` `); // 2
 * countCharsFromStart(`hi  `, ` `); // 0
 * countCharsFromStart(`  hi  `, ` `); // 2
 * ```
 * @param source
 * @param chars
 * @returns
 */ const countCharsFromStart = (source, ...chars)=>{
    //eslint-disable-next-line functional/no-let
    let counted = 0;
    //eslint-disable-next-line functional/no-let
    for(let index = 0; index < source.length; index++){
        if (chars.includes(source.charAt(index))) {
            counted++;
        } else {
            break;
        }
    }
    return counted;
};
/**
 * Returns _true_ if `source` starts and ends with `start` and `end`. Case-sensitive.
 * If _end_ is omitted, the the `start` value will be used.
 *
 * ```js
 * startsEnds(`This is a string`, `This`, `string`); // True
 * startsEnds(`This is a string`, `is`, `a`); // False
 * starsEnds(`test`, `t`); // True, starts and ends with 't'
 * ```
 * @param source String to search within
 * @param start Start
 * @param end End (if omitted, start will be looked for at end as well)
 * @returns True if source starts and ends with provided values.
 */ const startsEnds = (source, start, end = start)=>source.startsWith(start) && source.endsWith(end);
//eslint-disable-next-line no-useless-escape
const htmlEntities = (source)=>source.replaceAll(/[&<>\u00A0-\u9999]/g, (index)=>`&#${index.codePointAt(0)};`);
/**
 * Simple wilcard matching. Use '*' in `pattern` to denote any number of characters.
 * ```js
 * // Must start with 'cat'
 * wildcard(`cat*`,`caterpillar`); // true
 * // Must end with 'cat'
 * wildcat(`*cat`, `bobcat`);  // true
 * // 'cat' anywhere in string
 * wildcard(`*cat*`, `see cat run`); // true
 * ```
 * @param pattern 
 * @returns 
 */ const wildcard = (pattern)=>{
    // Based on source: https://stackoverflow.com/questions/26246601/wildcard-string-comparison-in-javascript
    // for this solution to work on any string, no matter what characters it has
    const escapeRegex = (value)=>value.replaceAll(/([!$()*+./:=?[\\\]^{|}])/g, `\\$1`);
    // "."  => Find a single character, except newline or line terminator
    // ".*" => Matches any string that contains zero or more characters
    pattern = pattern.split(`*`).map((m)=>escapeRegex(m)).join(`.*`);
    // "^"  => Matches any string with the following at the beginning of it
    // "$"  => Matches any string with that in front at the end of it
    pattern = `^` + pattern + `$`;
    // Create a regular expression object for matching string
    const regex = new RegExp(pattern);
    return (value)=>{
        // Returns true if it finds a match, otherwse it returns false
        return regex.test(value);
    };
};
; // CONCATENATED MODULE: ../rx/src/from/object.ts
/**
 * Creates a Reactive wrapper with the shape of the input object.
 * 
 * Changing the wrapped object directly does not update the Reactive. 
 * Instead, to update values use:
 * * `set()`, 'resets' the whole object
 * * `update()` changes a particular field
 * 
 * Consider using {@link Rx.From.objectProxy} to return a object with properties that can be
 * set in the usual way yet is also Reactive.
 * 
 * ```js
 * const o = Rx.From.object({ name: `bob`, level: 2 });
 * o.onValue(changed => {
 * });
 * o.set({ name: `mary`, level: 3 });
 * 
 * // `onValue` will get called, with `changed` having a value of:
 * // { name: `mary`, level: 3 }
 * ```
 * 
 * Use `last()` to get the most recently set value.
 * 
 * `onDiff` subscribes to a rough diff of the object.
 * 
 * ```js
 * const o = Rx.From.object({ name: `bob`, level: 2 });
 * o.onDiff(diffValue => {
 *  const diff = diffValue.value;
 * })
 * o.set({ name: `mary`, level: 3 });
 * 
 * // onDiff would fire with `diff` of:
 * [
 *  { path: `name`, previous: `bob`, value: `mary` },
 *  { path: `level`, previous: 2, value: 3 }
 * ]
 * ```
 * 
 * You can also listen to updates on a field via `onField`.
 * ```js
 * o.onField(`name`, value => {
 *  // Called whenever the 'name' field is updated
 * });
 * ```
 * @param initialValue  Initial value
 * @param options Options
 * @returns 
 */ function object_object(initialValue, options = {}) {
    const eq = options.eq ?? isEqualContextString;
    const setEvent = initStream();
    const diffEvent = initStream();
    //const fieldChangeEvents = new Map<string, DispatchList<ObjectFieldHandler>>;
    const fieldChangeEvents = [];
    let value = initialValue;
    let disposed = false;
    const set = (v)=>{
        const diff = [
            ...compareData(value ?? {}, v, {
                ...options,
                includeMissingFromA: true
            })
        ];
        if (diff.length === 0) return;
        value = v;
        setEvent.set(v);
        diffEvent.set(diff);
    };
    const fireFieldUpdate = (field, value)=>{
        for (const [matcher, pattern, list] of fieldChangeEvents){
            if (matcher(field)) {
                list.notify({
                    fieldName: field,
                    pattern,
                    value
                });
            }
        }
    //const l = fieldChangeEvents.get(field.toLowerCase());
    //if (l === undefined) return;
    //l.notify(value);
    };
    const updateCompareOptions = {
        asPartial: true,
        includeParents: true
    };
    const update = (toMerge)=>{
        //console.log(`Rx.From.object update: toMerge: ${ JSON.stringify(toMerge) } value: ${ JSON.stringify(value) }`);
        if (value === undefined) {
            value = toMerge;
            setEvent.set(value);
            for (const [k, v] of Object.entries(toMerge)){
                fireFieldUpdate(k, v);
            }
            return value;
        } else {
            const diff = [
                ...compareData(value, toMerge, updateCompareOptions)
            ];
            //const diffWithoutRemoved = diff.filter(d => d.state !== `removed`);
            if (diff.length === 0) return value; // No changes
            value = {
                ...value,
                ...toMerge
            };
            setEvent.set(value);
            diffEvent.set(diff);
            //console.log(`diff`, diff);
            for (const d of diff){
                fireFieldUpdate(d.path, d.value);
            }
            return value;
        }
    };
    const updateField = (path, valueForField)=>{
        if (value === undefined) throw new Error(`Cannot update value when it has not already been set`);
        //console.log(`Rx.Sources.Object.updateField path: ${ path } value: ${ JSON.stringify(valueForField) }`);
        const existing = getField(value, path);
        if (!throwResult(existing)) return; // Eg if path not found
        //console.log(`Rx.fromObject.updateField path: ${ path } existing: ${ JSON.stringify(existing) }`);
        if (eq(existing.value, valueForField, path)) {
            //console.log(`Rx.object.updateField identical existing: ${ existing } value: ${ valueForField } path: ${ path }`);
            return;
        }
        let diff = [
            ...compareData(existing.value, valueForField, {
                ...options,
                includeMissingFromA: true
            })
        ];
        diff = diff.map((d)=>{
            if (d.path.length > 0) return {
                ...d,
                path: path + `.` + d.path
            };
            return {
                ...d,
                path
            };
        });
        //console.log(`Rx.fromObject.updateField diff path: ${ path }`, diff);
        const o = updateByPath(value, path, valueForField, true);
        value = o;
        //diffEvent.set([ { path, value: valueForField, previous: existing } ]);
        setEvent.set(o);
        diffEvent.set(diff);
        fireFieldUpdate(path, valueForField);
    //console.log(`Rx.fromObject.updateField: path: '${ path }' value: '${ JSON.stringify(valueForField) }' o: ${ JSON.stringify(o) }`);
    };
    const dispose = (reason)=>{
        if (disposed) return;
        diffEvent.dispose(reason);
        setEvent.dispose(reason);
        disposed = true;
    };
    return {
        dispose,
        isDisposed () {
            return disposed;
        },
        /**
     * Update a field.
     * Exception is thrown if field does not exist
     */ updateField,
        last: ()=>value,
        on: setEvent.on,
        onValue: setEvent.onValue,
        onDiff: diffEvent.onValue,
        onField (fieldPattern, handler) {
            const matcher = wildcard(fieldPattern);
            const listeners = new DispatchList();
            fieldChangeEvents.push([
                matcher,
                fieldPattern,
                listeners
            ]);
            const id = listeners.add(handler);
            return ()=>listeners.remove(id);
        // let listeners = fieldChangeEvents.get(fieldName.toLowerCase());
        // if (listeners === undefined) {
        //   listeners = new DispatchList();
        //   fieldChangeEvents.set(fieldName.toLowerCase(), listeners);
        // }
        // const id = listeners.add((value) => {
        //   setTimeout(() => { handler(value, fieldName) }, 1);
        // });
        // return () => listeners.remove(id);
        },
        /**
     * Set the whole object
     */ set,
        /**
     * Update the object with a partial set of fields and values
     */ update
    };
}
; // CONCATENATED MODULE: ../rx/src/ops/combine-latest-to-object.ts
/**
 * Monitors input reactive values, storing values as they happen to an object.
 * Whenever a new value is emitted, the whole object is sent out, containing current
 * values from each source (or _undefined_ if not yet emitted)
 * 
 * See {@link combineLatestToArray} to combine streams by name into an array instead.
 * 
 * ```
 * const sources = {
 *  fast: Rx.fromFunction(Math.random, { loop: true, interval: 100 }),
 *  slow: Rx.fromFunction(Math.random, { loop: true, interval: 200 })
 * ];
 * const r = Rx.combineLatestToObject(sources);
 * r.onValue(value => {
 *  // 'value' will be an object containing the labelled latest
 *  // values from each source.
 *  // { fast: number, slow: number }
 * });
 * ```
 * 
 * The tempo of this stream will be set by the fastest source stream.
 * See {@link syncToObject} to have pace determined by slowest source, and only
 * send when each source has produce a new value compared to last time.
 * 
 * This source ends if all source streams end.
 * @param reactiveSources Sources to merge
 * @param options Options for merging 
 * @returns 
 */ function combineLatestToObject(reactiveSources, options = {}) {
    const disposeSources = options.disposeSources ?? true;
    const event = object_object(undefined);
    const onSourceDone = options.onSourceDone ?? `break`;
    const emitInitial = options.emitInitial ?? true;
    let emitInitialDone = false;
    const states = new Map();
    for (const [key, source] of Object.entries(reactiveSources)){
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const initialData = `last` in source ? source.last() : undefined;
        //console.log(`initialData: ${ initialData } src: ${ (source as any).last() }`);
        const s = {
            source: resolveSource(source),
            done: false,
            data: initialData,
            off: ()=>{}
        };
        states.set(key, s);
    }
    const sources = Object.fromEntries(Object.entries(states).map((entry)=>[
            entry[0],
            entry[1].source
        ]));
    const someUnfinished = ()=>maps_some(states, (v)=>!v.done);
    const unsub = ()=>{
        //console.log(`Rx.MergeToObject.unsub states: ${ [ ...states.keys() ].join(`,`) }`);
        for (const state of states.values())state.off();
    };
    const getData = ()=>{
        const r = {};
        for (const [key, state] of states){
            const d = state.data;
            if (d !== undefined) {
                r[key] = state.data;
            }
        }
        //console.log(`Rx.Ops.CombineLatestToObject getData`, r);
        return r;
    };
    const trigger = ()=>{
        emitInitialDone = true;
        const d = getData();
        //console.log(`Rx.Ops.combineLatestToObject trigger`, d);
        event.set(d);
    };
    const wireUpState = (state)=>{
        state.off = state.source.on((message)=>{
            if (messageIsDoneSignal(message)) {
                state.done = true;
                state.off();
                state.off = ()=>{};
                if (onSourceDone === `break`) {
                    unsub();
                    event.dispose(`Source has completed and 'break' is behaviour`);
                    return;
                }
                if (!someUnfinished()) {
                    // All sources are done
                    unsub();
                    event.dispose(`All sources completed`);
                }
            } else if (messageHasValue(message)) {
                state.data = message.value;
                trigger();
            }
        });
    };
    for (const state of states.values()){
        wireUpState(state);
    }
    if (!emitInitialDone && emitInitial) {
        //console.log(`Rx.Ops.CombineLatestToObject emitting initial`);
        trigger();
    }
    return {
        ...event,
        hasSource (field) {
            return states.has(field);
        },
        replaceSource (field, source) {
            const state = states.get(field);
            if (state === undefined) throw new Error(`Field does not exist: '${field}'`);
            state.off();
            const s = resolveSource(source);
            state.source = s;
            wireUpState(state);
        },
        setWith (data) {
            const written = {};
            for (const [key, value] of Object.entries(data)){
                const state = states.get(key);
                if (state !== undefined) {
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
        last () {
            return getData();
        },
        dispose (reason) {
            unsub();
            event.dispose(reason);
            if (disposeSources) {
                for (const v of states.values()){
                    v.source.dispose(`Part of disposed mergeToObject`);
                }
            }
        }
    };
}
; // CONCATENATED MODULE: ../rx/src/ops/filter.ts
/**
 * Passes all values where `predicate` function returns _true_.
 */ function filter_filter(input, predicate, options) {
    const upstream = initUpstream(input, {
        ...options,
        onValue (value) {
            if (predicate(value)) {
                upstream.set(value);
            }
        }
    });
    return toReadable(upstream);
}
/**
 * Drops all values where `predicate` function returns _true_.
 */ function drop(input, predicate, options) {
    const upstream = initUpstream(input, {
        ...options,
        onValue (value) {
            if (!predicate(value)) {
                upstream.set(value);
            }
        }
    });
    return toReadable(upstream);
}
; // CONCATENATED MODULE: ../rx/src/ops/elapsed.ts
/**
 * Emits time in milliseconds since last message.
 * If it is the first value, 0 is used.
 * @param input 
 * @returns 
 */ const elapsed_elapsed = (input)=>{
    let last = 0;
    return transform_transform(input, (_ignored)=>{
        const elapsed = last === 0 ? 0 : Date.now() - last;
        last = Date.now();
        return elapsed;
    });
};
; // CONCATENATED MODULE: ../rx/src/ops/field.ts
/**
 * From a source value, yields a field from it. Only works
 * if stream values are objects.
 * 
 * If a source value doesn't have that field, it is skipped.
 *
 * @returns 
 */ function field_field(fieldSource, fieldName, options = {}) {
    const fallbackFieldValue = options.fallbackFieldValue;
    const fallbackObject = options.fallbackObject;
    const upstream = initUpstream(fieldSource, {
        disposeIfSourceDone: true,
        ...options,
        onValue (value) {
            let v;
            // 1. Try to read from value
            if (fieldName in value) {
                v = value[fieldName];
            } else if (fallbackObject && fieldName in fallbackObject) {
                // 2. Read from fallback object
                v = fallbackObject[fieldName];
            }
            // 3. Use fallback value
            if (v === undefined) {
                v = fallbackFieldValue;
            }
            if (v !== undefined) {
                upstream.set(v);
            }
        }
    });
    return toReadable(upstream);
}
; // CONCATENATED MODULE: ../numbers/src/clamp.ts
/**
 * Clamps a value between min and max (both inclusive)
 * Defaults to a 0-1 range, useful for percentages.
 *
 * @example Usage
 * ```js
 * // 0.5 - just fine, within default of 0 to 1
 * clamp(0.5);
 * // 1 - above default max of 1
 * clamp(1.5);
 * // 0 - below range
 * clamp(-50, 0, 100);
 * // 50 - within range
 * clamp(50, 0, 50);
 * ```
 *
 * For clamping integer ranges, consider {@link clampIndex }
 * For clamping `{ x, y }` points, consider {@link Geometry.Points.clamp | Geometry.Points.clamp}.
 * For clamping bipolar values: {@link Bipolar.clamp}
 * @param value Value to clamp
 * @param min value (inclusive)
 * @param max value (inclusive)
 * @returns Clamped value
 */ const clamp = (value, min = 0, max = 1)=>{
    // ✔ UNIT TESTED
    if (Number.isNaN(value)) throw new Error(`Param 'value' is NaN`);
    if (Number.isNaN(min)) throw new Error(`Param 'min' is NaN`);
    if (Number.isNaN(max)) throw new Error(`Param 'max' is NaN`);
    if (value < min) return min;
    if (value > max) return max;
    return value;
};
/**
 * Returns a function that clamps values.
 * 
 * ```js
 * const c = clamper(0,100);
 * c(50);   // 50
 * c(101); // 100
 * c(-5);  // 0
 * ```
 * @param min Minimum value. Default: 0
 * @param max Maximum value. Default: 1
 */ const clamper = (min = 0, max = 1)=>{
    if (Number.isNaN(min)) throw new Error(`Param 'min' is NaN`);
    if (Number.isNaN(max)) throw new Error(`Param 'max' is NaN`);
    return (v)=>{
        if (v > max) return max;
        if (v < min) return min;
        return v;
    };
};
/**
 * Clamps integer `v` between 0 (inclusive) and array length or length (exclusive).
 * Returns value then will always be at least zero, and a valid array index.
 *
 * @example Usage
 * ```js
 * // Array of length 4
 * const myArray = [`a`, `b`, `c`, `d`];
 * clampIndex(0, myArray);    // 0
 * clampIndex(5, 3); // 2
 * ```
 *
 * Throws an error if `v` is not an integer.
 *
 * For some data it makes sense that data might 'wrap around' if it exceeds the
 * range. For example rotation angle. Consider using {@link wrap} for this.
 *
 * @param v Value to clamp (must be an interger)
 * @param arrayOrLength Array, or length of bounds (must be an integer)
 * @returns Clamped value, minimum will be 0, maximum will be one less than `length`.
 */ const clampIndex = (v, arrayOrLength)=>{
    // ✔ UNIT TESTED
    if (!Number.isInteger(v)) {
        throw new TypeError(`v parameter must be an integer (${v})`);
    }
    const length = Array.isArray(arrayOrLength) ? arrayOrLength.length : arrayOrLength;
    if (!Number.isInteger(length)) {
        throw new TypeError(`length parameter must be an integer (${length}, ${typeof length})`);
    }
    v = Math.round(v);
    if (v < 0) return 0;
    if (v >= length) return length - 1;
    return v;
};
; // CONCATENATED MODULE: ../modulation/src/gaussian.ts
//const sqrt = Math.sqrt;
const pow = Math.pow;
//const pi = Math.PI;
//const piPi = Math.PI*2;
const gaussianA = 1 / Math.sqrt(2 * Math.PI);
/**
 * Returns a roughly gaussian easing function
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const fn = Easings.gaussian();
 * ```
 *
 * Try different positive and negative values for `stdDev` to pinch
 * or flatten the bell shape.
 * @param standardDeviation
 * @returns
 */ const gaussian = (standardDeviation = 0.4)=>{
    //const a = 1 / sqrt(2 * pi);
    const mean = 0.5;
    return (t)=>{
        const f = gaussianA / standardDeviation;
        // p:-8 pinched
        let p = -2.5; // -1/1.25;
        let c = (t - mean) / standardDeviation;
        c *= c;
        p *= c;
        const v = f * pow(Math.E, p); // * (2/pi);//0.62;
        if (v > 1) return 1;
        if (v < 0) return 0;
        return v;
    };
};
; // CONCATENATED MODULE: ../modulation/src/easing/easings-named.ts
// Easings from https://easings.net/
const sqrt = Math.sqrt;
const easings_named_pow = Math.pow;
const cos = Math.cos;
const pi = Math.PI;
const sin = Math.sin;
const bounceOut = (x)=>{
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
const quintIn = (x)=>x * x * x * x * x;
const quintOut = (x)=>1 - easings_named_pow(1 - x, 5);
const arch = (x)=>x * (1 - x) * 4;
const smoothstep = (x)=>x * x * (3 - 2 * x);
const smootherstep = (x)=>(x * (x * 6 - 15) + 10) * x * x * x;
const sineIn = (x)=>1 - cos(x * pi / 2);
const sineOut = (x)=>sin(x * pi / 2);
const quadIn = (x)=>x * x;
const quadOut = (x)=>1 - (1 - x) * (1 - x);
const sineInOut = (x)=>-(cos(pi * x) - 1) / 2;
const quadInOut = (x)=>x < 0.5 ? 2 * x * x : 1 - easings_named_pow(-2 * x + 2, 2) / 2;
const cubicIn = (x)=>x * x * x;
const cubicOut = (x)=>1 - easings_named_pow(1 - x, 3);
const quartIn = (x)=>x * x * x * x;
const quartOut = (x)=>1 - easings_named_pow(1 - x, 4);
const expoIn = (x)=>x === 0 ? 0 : easings_named_pow(2, 10 * x - 10);
const expoOut = (x)=>x === 1 ? 1 : 1 - easings_named_pow(2, -10 * x);
const quintInOut = (x)=>x < 0.5 ? 16 * x * x * x * x * x : 1 - easings_named_pow(-2 * x + 2, 5) / 2;
const expoInOut = (x)=>x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? easings_named_pow(2, 20 * x - 10) / 2 : (2 - easings_named_pow(2, -20 * x + 10)) / 2;
const circIn = (x)=>1 - sqrt(1 - easings_named_pow(x, 2));
const circOut = (x)=>sqrt(1 - easings_named_pow(x - 1, 2));
const backIn = (x)=>{
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * x * x * x - c1 * x * x;
};
const backOut = (x)=>{
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * easings_named_pow(x - 1, 3) + c1 * easings_named_pow(x - 1, 2);
};
const circInOut = (x)=>x < 0.5 ? (1 - sqrt(1 - easings_named_pow(2 * x, 2))) / 2 : (sqrt(1 - easings_named_pow(-2 * x + 2, 2)) + 1) / 2;
const backInOut = (x)=>{
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return x < 0.5 ? easings_named_pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2) / 2 : (easings_named_pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
};
const elasticIn = (x)=>{
    const c4 = 2 * pi / 3;
    return x === 0 ? 0 : x === 1 ? 1 : -easings_named_pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4);
};
const elasticOut = (x)=>{
    const c4 = 2 * pi / 3;
    return x === 0 ? 0 : x === 1 ? 1 : easings_named_pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1;
};
const bounceIn = (x)=>1 - bounceOut(1 - x);
const bell = gaussian();
const elasticInOut = (x)=>{
    const c5 = 2 * pi / 4.5;
    return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? -(easings_named_pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2 : easings_named_pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5) / 2 + 1;
};
const bounceInOut = (x)=>x < 0.5 ? (1 - bounceOut(1 - 2 * x)) / 2 : (1 + bounceOut(2 * x - 1)) / 2;
; // CONCATENATED MODULE: ../guards/src/string.ts
/**
 * Throws an error if parameter is not an string
 * @param value
 * @param parameterName
 */ const stringTest = (value, range = ``, parameterName = `?`)=>{
    if (typeof value !== `string`) return [
        false,
        `Param '${parameterName} is not type string. Got: ${typeof value}`
    ];
    switch(range){
        case `non-empty`:
            if (value.length === 0) return [
                false,
                `Param '${parameterName} is empty`
            ];
            break;
    }
    return [
        true
    ];
};
const string_throwStringTest = (value, range = ``, parameterName = `?`)=>{
    throw_from_result_throwFromResult(stringTest(value, range, parameterName));
};
; // CONCATENATED MODULE: ../modulation/src/easing/index.ts
/**
 * Creates an easing function
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const e = Easings.create({ duration: 1000, name: `quadIn` });
 * const e = Easings.create({ ticks: 100, name: `sineOut` });
 * const e = Easings.create({ 
 *  duration: 1000, 
 *  fn: (v) => {
 *    // v will be 0..1 based on time
 *    return Math.random() * v
 *  }
 * });
 * ```
 * @param options 
 * @returns 
 */ const create = (options)=>{
    const name = resolveEasingName(options.name ?? `quintIn`);
    const fn = name ?? options.fn;
    if (typeof fn === `undefined`) throw new Error(`Either 'name' or 'fn' must be set`);
    if (`duration` in options) {
        return time(fn, options.duration);
    } else if (`ticks` in options) {
        return ticks(fn, options.ticks);
    } else {
        throw new Error(`Expected 'duration' or 'ticks' in options`);
    }
};
/**
 * Creates an easing based on clock time. Time
 * starts being counted when easing function is created.
 * 
 * `timeEasing` allows you to reset and check for completion.
 * Alternatively, use {@link time} which is a simple function that just returns a value.
 *
 * 
 * @example Time based easing
 * ```
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const t = Easings.timeEasing(`quintIn`, 5*1000); // Will take 5 seconds to complete
 * ...
 * t.compute(); // Get current value of easing
 * t.reset();   // Reset to 0
 * t.isDone;    // _True_ if finished
 * ```
 * 
 * Thisi function is just a wrapper around Modulator.timedModulator.
 * @param nameOrFunction Name of easing, or an easing function
 * @param duration Duration
 * @returns Easing
 */ const timeEasing = (nameOrFunction, duration)=>{
    const fn = resolveEasingName(nameOrFunction);
    return ModuleTimed.timeModulator(fn, duration);
// const timer = Timer.elapsedMillisecondsAbsolute();
// const durationMs = intervalToMs(duration);
// if (durationMs === undefined) throw new Error(`Param 'duration' not provided`);
// const relativeTimer = Timer.relative(
//   durationMs,
//   {
//     timer,
//     clampValue: true
//   });
// return Timer.timerWithFunction(fn, relativeTimer);
};
/**
 * Produce easing values over time. When the easing is complete, the final
 * value continues to return. Timer starts when return function is first invoked.
 * 
 * If you need to check if an easing is done or reset it, consider {@link timeEasing}.
 * 
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * // Quad-in easing over one second
 * const e = Easings.time(`quadIn`, 1000);
 * 
 * // Keep calling e() to get the current value
 * e();
 * ```
 * 
 * This function is just a wrapper around Modulate.time
 * @param nameOrFunction Easing name or a function that produces 0..1 scale
 * @param duration Duration
 * @returns 
 */ const time = (nameOrFunction, duration)=>{
    const fn = resolveEasingName(nameOrFunction);
    return ModuleTimed.time(fn, duration);
// let relative: undefined | (() => number);
// return () => {
//   if (relative === undefined) relative = Timer.ofTotal(duration, { clampValue: true });
//   return fn(relative());
// }
};
/**
 * Produce easing values with each invocation. When the easing is complete, the final
 * value continues to return. Timer starts when return function is first invoked.
 * 
 * If you need to check if an easing is done or reset it, consider {@link tickEasing}.
 * 
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * // Quad-in easing over 100 ticks
 * const e = Easings.ticks(`quadIn`, 100);
 * 
 * // Keep calling e() to get the current value
 * e();
 * ```
 * 
 * This is just a wrapper around Modulator.ticks
 * @param nameOrFunction Easing name or a function that produces 0..1 scale
 * @param totalTicks Total length of ticks
 * @returns 
 */ const ticks = (nameOrFunction, totalTicks)=>{
    const fn = resolveEasingName(nameOrFunction);
    return ModuleTimed.ticks(fn, totalTicks);
// let relative: undefined | (() => number);
// return () => {
//   if (relative === undefined) relative = Timer.ofTotalTicks(totalTicks, { clampValue: true });
//   return fn(relative());
// }
};
/**
 * Creates an easing based on ticks. 
 * 
 * `tickEasing` allows you to reset and check for completion.
 * Alternatively, use {@link ticks} which is a simple function that just returns a value.
 *
 * @example Tick-based easing
 * ```
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const t = Easings.tickEasing(`sineIn`, 1000);   // Will take 1000 ticks to complete
 * t.compute(); // Each call to `compute` progresses the tick count
 * t.reset();   // Reset to 0
 * t.isDone;    // _True_ if finished
 * ```
 * @param nameOrFunction Name of easing, or an easing function
 * @param durationTicks Duration in ticks
 * @returns Easing
 */ const tickEasing = (nameOrFunction, durationTicks)=>{
    const fn = resolveEasingName(nameOrFunction);
    return ModuleTimed.tickModulator(fn, durationTicks);
// const timer = Timer.elapsedTicksAbsolute();
// const relativeTimer = Timer.relative(
//   durationTicks,
//   {
//     timer,
//     clampValue: true
//   });
// return Timer.timerWithFunction(fn, relativeTimer);
};
const resolveEasingName = (nameOrFunction)=>{
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
 */ // const create = function (
//   nameOrFunction: EasingName | ((v: number) => number),
//   duration: number,
//   timerSource: TimerSource
// ): Easing {
//   const fn = typeof nameOrFunction === `function` ? nameOrFunction : get(nameOrFunction);
//   if (fn === undefined) {
//     const error = typeof nameOrFunction === `string` ? new Error(`Easing function not found: '${ nameOrFunction }'`) : new Error(`Easing function not found`);
//     throw error;
//   }
//   // Get a relative version of timer
//   const timer = relativeTimer(duration, {
//     timer: timerSource(),
//     clampValue: true,
//   });
//   let startCount = 1;
//   return {
//     get isDone() {
//       return timer.isDone;
//     },
//     get runState() {
//       if (timer.isDone) return `idle`;
//       return `scheduled`;
//     },
//     /**
//      * Returns 1 if it has been created, returns +1 for each additional time the timer has been reset.
//      */
//     get startCount() {
//       return startCount;
//     },
//     get startCountTotal() {
//       return startCount;
//     },
//     compute: () => {
//       const relative = timer.elapsed;
//       return fn(relative);
//     },
//     reset: () => {
//       timer.reset();
//       startCount++;
//     },
//   };
// };
let easingsMap;
/**
 * Returns an easing function by name. Throws an error if
 * easing is not found.
 *
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const fn = Easings.get(`sineIn`);
 * // Returns 'eased' transformation of 0.5
 * fn(0.5);
 * ```
 * @param easingName eg `sineIn`
 * @returns Easing function
 */ const get = function(easingName) {
    string_throwStringTest(easingName, `non-empty`, `easingName`);
    const found = cacheEasings().get(easingName.toLowerCase());
    if (found === undefined) throw new Error(`Easing not found: '${easingName}'`);
    return found;
};
// Cache named easings
function cacheEasings() {
    if (easingsMap === undefined) {
        easingsMap = new Map();
        for (const [k, v] of Object.entries(easings_named_namespaceObject)){
            easingsMap.set(k.toLowerCase(), v);
        }
        return easingsMap;
    } else return easingsMap;
}
/**
 * Iterate over available easings.
 * @private
 * @returns Returns list of available easing names
 */ function* getEasingNames() {
    const map = cacheEasings();
    yield* map.keys();
}
; // CONCATENATED MODULE: ../modulation/src/interpolate.ts
/**
 * Interpolates between `a` and `b` by `amount`. Aka `lerp`.
 *
 * [ixfx Guide on Interpolation](https://ixfx.fun/data/interpolation/overview/)
 *
 * @example Get the halfway point between 30 and 60
 * ```js
 * import { interpolate } from 'https://unpkg.com/ixfx/dist/numbers.js';
 * interpolate(0.5, 30, 60);
 * ```
 *
 * See also {@link interpolatorStepped} and {@link interpolatorInterval} for functions
 * which help to manage progression from A->B over steps or interval.
 * 
 * Usually interpolation amount is on a 0...1 scale, inclusive. What is the interpolation result
 * if this scale is exceeded? By default it is clamped to 0..1, so the return value is always between `a` and `b` (inclusive).
 * 
 * Alternatively, set the `limits` option to process `amount`:
 * * 'wrap': wrap amount, eg 1.5 is the same as 0.5, 2 is the same as 1
 * * 'ignore': allow exceeding values. eg 1.5 will yield b*1.5.
 * * 'clamp': default behaviour of clamping interpolation amount to 0..1
 * 
 * Interpolation can be non-linear using 'easing' option or 'transform' funciton.
 * ```js
 * interpolate(0.1, 0, 100, { easing: `quadIn` });
 * ```
 * To interpolate certain types: {@link Visual.Colour.interpolator | Visual.Colour.interpolator }, {@link Geometry.Points.interpolate | Points.interpolate}.
 * 
 * There are a few variations when calling `interpolate`, depending on what parameters are fixed.
 * * `interpolate(amount)`: returns a function that needs a & b 
 * * `interpolate(a, b)`:  returns a function that needs the interpolation amount
 */ function interpolate(pos1, pos2, pos3, pos4) {
    let amountProcess;
    let limits = `clamp`;
    const handleAmount = (amount)=>{
        if (amountProcess) amount = amountProcess(amount);
        if (limits === undefined || limits === `clamp`) {
            amount = clamp(amount);
        } else if (limits === `wrap`) {
            if (amount > 1) amount = amount % 1;
            else if (amount < 0) {
                amount = 1 + amount % 1;
            }
        }
        return amount;
    };
    const doTheEase = (_amt, _a, _b)=>{
        throwNumberTest(_a, ``, `a`);
        throwNumberTest(_b, ``, `b`);
        throwNumberTest(_amt, ``, `amount`);
        _amt = handleAmount(_amt);
        return (1 - _amt) * _a + _amt * _b;
    };
    const readOpts = (o = {})=>{
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
    const rawEase = (_amt, _a, _b)=>(1 - _amt) * _a + _amt * _b;
    if (typeof pos1 !== `number`) throw new TypeError(`First param is expected to be a number. Got: ${typeof pos1}`);
    if (typeof pos2 === `number`) {
        let a;
        let b;
        if (pos3 === undefined || typeof pos3 === `object`) {
            //interpolate(a: number, b: number, options?: Partial<InterpolateOptions>): (amount: number) => number;
            a = pos1;
            b = pos2;
            readOpts(pos3);
            return (amount)=>doTheEase(amount, a, b);
        } else if (typeof pos3 === `number`) {
            //interpolate(amount: number, a: number, b: number, options?: Partial<InterpolateOptions>): number;
            a = pos2;
            b = pos3;
            readOpts(pos4);
            return doTheEase(pos1, a, b);
        } else {
            throw new Error(`Values for 'a' and 'b' not defined`);
        }
    } else if (pos2 === undefined || typeof pos2 === `object`) {
        //interpolate(amount: number, options?: Partial<InterpolateOptions>): (a:number,b:number)=>number;
        const amount = handleAmount(pos1);
        readOpts(pos2);
        throwNumberTest(amount, ``, `amount`);
        return (aValue, bValue)=>rawEase(amount, aValue, bValue);
    }
}
/**
 * Returns a function that interpolates from A to B.
 * It steps through the interpolation with each call to the returned function.
 * This means that the `incrementAmount` will hinge on the rate
 * at which the function is called. Alternatively, consider {@link interpolatorInterval}
 * which steps on the basis of clock time.
 * 
 * ```js
 * // Interpolate from 0..1 by 0.01
 * const v = interpolatorStepped(0.01, 100, 200);
 * v(); // Each call returns a value closer to target
 * // Eg: 100, 110, 120, 130 ...
 * ```
 * 
 * Under the hood, it calls `interpolate` with an amount that
 * increases by `incrementAmount` each time.
 * 
 * When calling `v()` to step the interpolator, you can also pass
 * in new B and A values. Note that the order is swapped: the B (target) is provided first, and
 * then optionally A.
 * 
 * ```js
 * const v = interpolatorStepped(0.1, 100, 200); // Interpolate 100->200
 * v(300, 200); // Retarget to 200->300 and return result
 * v(150); // Retarget 200->150 and return result
 * ```
 * 
 * This allows you to maintain the current interpolation progress.
 * @param incrementAmount Amount to increment by
 * @param a Start value. Default: 0
 * @param b End value. Default: 1
 * @param startInterpolationAt Starting interpolation amount. Default: 0
 * @param options Options for interpolation
 * @returns 
 */ const interpolatorStepped = (incrementAmount, a = 0, b = 1, startInterpolationAt = 0, options)=>{
    let amount = startInterpolationAt;
    return (retargetB, retargetA)=>{
        if (retargetB !== undefined) b = retargetB;
        if (retargetA !== undefined) a = retargetA;
        if (amount >= 1) return b;
        const value = interpolate(amount, a, b, options);
        amount += incrementAmount;
        return value;
    };
};
/**
 * Interpolate between angles `a` and `b` by `amount`. Angles are in radians.
 *
 * ```js
 * import { interpolateAngle } from 'https://unpkg.com/ixfx/dist/data.js';
 * interpolateAngle(0.5, Math.PI, Math.PI/2);
 * ```
 * @param amount
 * @param aRadians Start angle (radian)
 * @param bRadians End angle (radian)
 * @returns
 */ const interpolateAngle = (amount, aRadians, bRadians, options)=>{
    const t = wrap(bRadians - aRadians, 0, piPi);
    return interpolate(amount, aRadians, aRadians + (t > Math.PI ? t - piPi : t), options);
};
/**
 * Interpolates between A->B over `duration`.
 * Given the same A & B values, steps will be larger if it's a longer
 * duration, and shorter if it's a smaller duration.
 * 
 * A function is returned, which when invoked yields a value between A..B.
 * 
 * Alternatively to step through by the same amount regardless
 * of time, use {@link interpolatorStepped}.
 * 
 * ```js
 * // Interpolate from 0..1 over one minute
 * const v = interpolatorInterval({mins:1});
 * v(); // Compute current value
 * ```
 * 
 * Use start and end points:
 * ```js
 * // Interpolate from 100-200 over 10 seconds
 * const v = interpolatorInterval({secs:10}, 100, 200);
 * v(); // Compute current value
 * ```
 * @param duration Duration for interpolation
 * @param a Start point
 * @param b End point
 * @param options Options for interpolation
 * @returns 
 */ const interpolatorInterval = (duration, a = 0, b = 1, options)=>{
    const durationProgression = ofTotal(duration, {
        clampValue: true
    });
    return (retargetB, retargetA)=>{
        const amount = durationProgression();
        if (retargetB !== undefined) b = retargetB;
        if (retargetA !== undefined) a = retargetA;
        if (amount >= 1) return b;
        const value = interpolate(amount, a, b, options);
        return value;
    };
};
; // CONCATENATED MODULE: ../rx/src/ops/compute-with-previous.ts
/**
 * When there is a value from `input`, or the reactive is pinged,
 * this reactive emits the result of `fn`.
 * 
 * `fn` is provided the previous value as well as the most recent value.
 * 
 * If no previous value is available, the current value is emitted and `fn` is not called.
 * @param input 
 * @param fn 
 * @returns 
 */ function computeWithPrevious(input, fn) {
    let previousValue;
    let currentValue;
    if (hasLast(input)) {
        currentValue = previousValue = input.last();
    }
    const trigger = ()=>{
        if (previousValue === undefined && currentValue !== undefined) {
            previousValue = currentValue;
            upstream.set(previousValue);
        } else if (previousValue !== undefined && currentValue !== undefined) {
            const vv = fn(previousValue, currentValue);
            //console.log(`vv: ${ vv } prev: ${ previousValue } target: ${ target }`)
            previousValue = vv;
            upstream.set(vv);
        }
    };
    const upstream = initUpstream(input, {
        lazy: "very",
        debugLabel: `computeWithPrevious`,
        onValue (value) {
            //console.log(`onValue ${ value }`);
            currentValue = value;
            trigger();
        }
    });
    if (currentValue) trigger();
    return {
        ...toReadable(upstream),
        ping: ()=>{
            if (currentValue !== undefined) trigger();
        }
    };
}
; // CONCATENATED MODULE: ../rx/src/ops/interpolate.ts
/**
 * Interpolates to the source value.
 * 
 * Outputs one value for every input value. Thus, to interpolation
 * over time, it's necessary to get the source to emit values at the desired rate.
 * 
 * Options can specify an easing name or custom transform of easing progress.
 * @param input 
 * @param options 
 * @returns 
 */ function interpolate_interpolate(input, options = {}) {
    const amount = options.amount ?? 0.1;
    const snapAt = options.snapAt ?? 0.99;
    const index = interpolate(amount, options);
    return computeWithPrevious(input, (previous, target)=>{
        const v = index(previous, target);
        if (target > previous) {
            if (v / target >= snapAt) return target;
        }
        return v;
    });
} /**
 * From the basis of an input stream of values, run a function over
 * each value. The function takes in the last value from the stream as well as the current.
 * @param input
 * @param fn
 * @returns
 */ 
// export function interpolateToTarget<TIn>(input: ReactiveOrSource<TIn>, fn: (previous: TIn, target: TIn) => TIn): ReactivePingable<TIn> {
//   let previousValue: TIn | undefined;
//   let target: TIn | undefined;
//   if (hasLast(input)) {
//     target = previousValue = input.last();
//   }
//   const ping = () => {
//     if (previousValue === undefined && target !== undefined) {
//       previousValue = target;
//     } else if (previousValue !== undefined && target !== undefined) {
//       previousValue = fn(previousValue, target);
//     }
//     upstream.set(previousValue!);
//   }
//   const upstream = initUpstream<TIn, TIn>(input, {
//     lazy: "very",
//     debugLabel: `computeWithPrevious`,
//     onValue(value) {
//       target = value;
//       ping();
//     },
//   })
//   if (target) ping();
//   return {
//     ...toReadable(upstream),
//     ping: () => {
//       if (target !== undefined) ping()
//     }
//   }
// }
; // CONCATENATED MODULE: ../process/src/basic.ts
/**
 * Outputs the current largest-seen value
 * @returns 
 */ const basic_max = ()=>{
    let max = Number.MIN_SAFE_INTEGER;
    const compute = (value)=>{
        const valueArray = Array.isArray(value) ? value : [
            value
        ];
        for (const subValue of valueArray){
            if (typeof subValue !== `number`) break;
            max = Math.max(subValue, max);
        }
        return max;
    };
    return compute;
};
/**
 * Outputs the current smallest-seen value
 * @returns
 */ const basic_min = ()=>{
    let min = Number.MAX_SAFE_INTEGER;
    const compute = (value)=>{
        const valueArray = Array.isArray(value) ? value : [
            value
        ];
        for (const subValue of valueArray){
            if (typeof subValue !== `number`) break;
            min = Math.min(subValue, min);
        }
        return min;
    };
    return compute;
};
/**
 * Returns a sum of values
 * @returns 
 */ const basic_sum = ()=>{
    let t = 0;
    const compute = (value)=>{
        const valueArray = Array.isArray(value) ? value : [
            value
        ];
        for (const subValue of valueArray){
            if (typeof subValue !== `number`) continue;
            t += subValue;
        }
        return t;
    };
    return compute;
};
/**
 * Returns the current average of input values
 * @returns 
 */ const average = ()=>{
    let total = 0;
    let tally = 0;
    const compute = (value)=>{
        const valueArray = Array.isArray(value) ? value : [
            value
        ];
        for (const subValue of valueArray){
            if (typeof subValue !== `number`) continue;
            tally++;
            total += subValue;
        }
        return total / tally;
    };
    return compute;
};
/**
 * Returns the tally (ie number of) values
 * @param countArrayItems 
 * @returns 
 */ const basic_tally = (countArrayItems)=>{
    let t = 0;
    const compute = (value)=>{
        if (countArrayItems) {
            if (Array.isArray(value)) t += value.length;
            else t++;
        } else {
            t++;
        }
        return t;
    };
    return compute;
};
/**
 * Returns the 'best' value seen so far as determined by a ranking function.
 * This is similar to min/max but usable for objects.
 * @param r 
 * @param options 
 * @returns 
 */ function basic_rank(r, options = {}) {
    const includeType = options.includeType;
    const emitEqualRanked = options.emitEqualRanked ?? false;
    const emitRepeatHighest = options.emitRepeatHighest ?? false;
    let best;
    return (value)=>{
        if (includeType && typeof value !== includeType) return;
        if (best === undefined) {
            best = value;
            return best;
        } else {
            const result = r(value, best);
            //console.log(`result: ${ result } value: ${ JSON.stringify(value) } best: ${ JSON.stringify(best) }`);
            if (result == `a`) {
                // New value is the current best
                best = value;
                return best;
            } else if (result === `eq` && emitEqualRanked) {
                // New value is same rank as previous, but we have flag on
                return best;
            } else if (emitRepeatHighest) {
                // Emit current highest due to flag
                return best;
            }
        }
    };
}
; // CONCATENATED MODULE: ../rx/src/ops/math.ts
function math_max(input, options) {
    const p = basic_max();
    return math_process(p, `max`, input, options);
}
function math_min(input, options) {
    const p = basic_min();
    return math_process(p, `min`, input, options);
}
function math_average(input, options) {
    const p = average();
    return math_process(p, `average`, input, options);
}
function math_sum(input, options) {
    const p = basic_sum();
    return math_process(p, `sum`, input, options);
}
function math_tally(input, options = {}) {
    const countArrayItems = options.countArrayItems ?? true;
    const p = basic_tally(countArrayItems);
    return math_process(p, `tally`, input, options);
}
function math_rank(input, rank, options) {
    const p = basic_rank(rank, options);
    return math_process(p, `rank`, input, options);
}
function math_process(processor, annotationField, input, options = {}) {
    const annotate = options.annotate;
    let previous;
    const skipUndefined = options.skipUndefined ?? true;
    const skipIdentical = options.skipIdentical ?? true;
    const upstream = initUpstream(input, {
        ...options,
        onValue (value) {
            const x = processor(value);
            if (x === undefined && skipUndefined) return;
            if (skipIdentical && x === previous) return;
            previous = x;
            if (annotate) {
                // eslint-disable-next-line unicorn/prevent-abbreviations
                const ret = {
                    value
                };
                ret[annotationField] = x;
                upstream.set(ret);
            } else {
                upstream.set(x);
            }
        }
    });
    return toReadable(upstream);
} //todo testing for annotation and non - annotated
// rankArray
// chunk, reduce
// debounce, delay
// duration, take
; // CONCATENATED MODULE: ../rx/src/ops/pipe.ts
/* eslint-disable @typescript-eslint/unbound-method */ /**
 * Pipes the output of one stream into another, in order.
 * The stream returned is a new stream which captures the final output.
 * 
 * If any stream in the pipe closes the whole pipe is closed.
 * @param streams 
 * @returns 
 */ const pipe = (...streams)=>{
    const event = initStream();
    const unsubs = [];
    const performDispose = (reason)=>{
        for (const s of streams){
            if (!s.isDisposed) s.dispose(reason);
        }
        for (const s of unsubs){
            s();
        }
        event.dispose(reason);
    };
    for(let index = 0; index < streams.length; index++){
        unsubs.push(streams[index].on((message)=>{
            const isLast = index === streams.length - 1;
            if (messageHasValue(message)) {
                if (isLast) {
                    // Last stream, send to output
                    event.set(message.value);
                } else {
                    // @ts-expect-error
                    streams[index + 1].set(message.value);
                }
            } else if (messageIsDoneSignal(message)) {
                performDispose(`Upstream disposed`);
            }
        }));
    }
    return {
        on: event.on,
        onValue: event.onValue,
        dispose (reason) {
            performDispose(reason);
        },
        isDisposed () {
            return event.isDisposed();
        }
    };
};
; // CONCATENATED MODULE: ../guards/src/arrays.ts
/**
 * Throws an error if parameter is not an array
 * @param value
 * @param parameterName
 */ const arrayTest = (value, parameterName = `?`)=>{
    if (!Array.isArray(value)) {
        return [
            false,
            `Parameter '${parameterName}' is expected to be an array'`
        ];
    }
    return [
        true
    ];
};
const throwArrayTest = (value, parameterName = `?`)=>{
    throwFromResult(arrayTest(value, parameterName));
};
/**
 * Returns true if parameter is an array of strings
 * @param value
 * @returns
 */ const isStringArray = (value)=>{
    if (!Array.isArray(value)) return false;
    return !value.some((v)=>typeof v !== `string`);
};
/**
 * Throws an error if `array` parameter is not a valid array
 *
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/data.js';
 * Arrays.guardArray(someVariable);
 * ```
 * @private
 * @param array
 * @param name
 */ const arrays_guardArray = (array, name = `?`)=>{
    if (array === undefined) {
        throw new TypeError(`Param '${name}' is undefined. Expected array.`);
    }
    if (array === null) {
        throw new TypeError(`Param '${name}' is null. Expected array.`);
    }
    if (!Array.isArray(array)) {
        throw new TypeError(`Param '${name}' not an array as expected`);
    }
};
/**
 * Throws if `index` is an invalid array index for `array`, and if
 * `array` itself is not a valid array.
 * @param array
 * @param index
 */ const guardIndex = (array, index, name = `index`)=>{
    arrays_guardArray(array);
    throwIntegerTest(index, `positive`, name);
    if (index > array.length - 1) {
        throw new Error(`'${name}' ${index} beyond array max of ${array.length - 1}`);
    }
};
; // CONCATENATED MODULE: ../arrays/src/random.ts
/**
 * Returns a shuffled copy of the input array.
 * @example
 * ```js
 * const d = [1, 2, 3, 4];
 * const s = shuffle(d);
 * // d: [1, 2, 3, 4], s: [3, 1, 2, 4]
 * ```
 * @param dataToShuffle
 * @param rand Random generator. `Math.random` by default.
 * @returns Copy with items moved around randomly
 * @typeParam V - Type of array items
 */ const shuffle = (dataToShuffle, rand = Math.random)=>{
    arrays_guardArray(dataToShuffle, `dataToShuffle`);
    const array = [
        ...dataToShuffle
    ];
    for(let index = array.length - 1; index > 0; index--){
        const index_ = Math.floor(rand() * (index + 1));
        [array[index], array[index_]] = [
            array[index_],
            array[index]
        ];
    }
    return array;
};
/**
 * Returns random element.
 *
 * ```js
 * const v = [`blue`, `red`, `orange`];
 * randomElement(v); // Yields `blue`, `red` or `orange`
 * ```
 *
 * Use {@link randomIndex} if you want a random index within `array`.
 *
 * @param array
 * @param rand Random generator. `Math.random` by default.
 * @returns
 */ const randomElement = (array, rand = Math.random)=>{
    guardArray(array, `array`);
    return array[Math.floor(rand() * array.length)];
};
; // CONCATENATED MODULE: ../rx/src/ops/single-from-array.ts
/**
 * For a stream that emits arrays of values, this op will select a single value.
 * 
 * Can select based on:
 * * predicate: a function that returns _true_ for a value
 * * at: selection based on array index (can be combined with random ordering to select a random value)
 * 
 * ```js
 * // If source is Reactive<Array<number>>, picks the first even number
 * singleFromArray(source, { 
 *  predicate: v => v % 2 === 0
 * });
 * 
 * // Selects a random value from source
 * singleFromArray(source, { 
 *  order: `random`,
 *  at: 0
 * });
 * ```
 * 
 * If neither `predicate` or `at` options are given, exception is thrown.
 * @param source Source to read from
 * @param options Options for selection
 * @returns 
 */ function singleFromArray(source, options = {}) {
    const order = options.order ?? `default`;
    if (!options.at && !options.predicate) throw new Error(`Options must have 'predicate' or 'at' fields`);
    let preprocess = (values)=>values;
    if (order === `random`) preprocess = shuffle;
    else if (typeof order === `function`) preprocess = (values)=>values.toSorted(order);
    const upstream = initUpstream(source, {
        onValue (values) {
            values = preprocess(values);
            if (options.predicate) {
                for (const v of values){
                    if (options.predicate(v)) {
                        upstream.set(v);
                    }
                }
            } else if (options.at) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                upstream.set(values.at(options.at));
            }
        }
    });
    return upstream;
}
; // CONCATENATED MODULE: ../rx/src/ops/split.ts
/**
 * Creates a set of streams each of which receives data from `source`.
 * By default these are lazy and dispose if the upstream source closes.
 * 
 * See also {@link splitLabelled} to split into named streams.
 * @param rxOrSource 
 * @param options 
 * @returns 
 */ const split_split = (rxOrSource, options = {})=>{
    const quantity = options.quantity ?? 2;
    const outputs = [];
    const source = resolveSource(rxOrSource);
    for(let index = 0; index < quantity; index++){
        outputs.push(initUpstream(source, {
            disposeIfSourceDone: true,
            lazy: `initial`
        }));
    }
    return outputs;
};
/**
 * Splits `source` into several duplicated streams. 
 * Returns an object with keys according to `labels`.
 * Each value is a stream which echos the values from `source`.
 * ```js
 * const { a, b, c} = splitLabelled(source, `a`, `b`, `c`);
 * // a, b, c are Reactive types
 * ```
 * 
 * See also {@link split} to get an unlabelled split
 * @param rxOrSource 
 * @param labels 
 * @returns 
 */ const splitLabelled = (rxOrSource, labels)=>{
    const source = resolveSource(rxOrSource);
    const t = {};
    for (const label of labels){
        t[label] = initUpstream(source, {
            lazy: `initial`,
            disposeIfSourceDone: true
        });
    }
    return t;
};
; // CONCATENATED MODULE: ../rx/src/ops/switcher.ts
/**
 * Switcher generates several output streams, labelled according to the values of `cases`.
 * Values from `source` are fed to the output streams if their associated predicate function returns _true_.
 * 
 * In this way, we can split one input stream into several output streams, each potentially getting a different
 * subset of the input.
 * 
 * With `options`, you can specify whether to send to multiple outputs if several match, or just the first (default behaviour).
 * 
 * The below example shows setting up a switcher and consuming the output streams.
 * @example
 * ```js
 * // Initialise a reactive number, starting at 0
 * const switcherSource = Reactive.number(0);
 * // Set up the switcher
 * const x = Reactive.switcher(switcherSource, {
 *  even: v => v % 2 === 0,
 *  odd: v => v % 2 !== 0
 * });
 * // Listen for outputs from each of the resulting streams
 * x.even.on(msg => {
 *   log(`even: ${msg.value}`);
 * });
 * x.odd.on(msg => {
 *   log(`odd: ${msg.value}`);
 * })
 * // Set new values to the number source, counting upwards
 * // ...this will in turn trigger the outputs above
 * setInterval(() => {
 *   switcherSource.set(switcherSource.last() + 1);
 * }, 1000);
 * ```
 * 
 * If `source` closes, all the output streams will be closed as well.
 * @param reactiveOrSource 
 * @param cases 
 * @param options 
 * @returns 
 */ const switcher = (reactiveOrSource, cases, options = {})=>{
    // return (r: ReactiveOrSource<TValue>): Record<TLabel, Reactive<TValue>> => {
    const match = options.match ?? `first`;
    const source = resolveSource(reactiveOrSource);
    let disposed = false;
    // Setup output streams
    const t = {};
    for (const label of Object.keys(cases)){
        t[label] = initStream();
    }
    const performDispose = ()=>{
        if (disposed) return;
        unsub();
        disposed = true;
        for (const stream of Object.values(t)){
            stream.dispose(`switcher source dispose`);
        }
    };
    // Listen to source
    const unsub = source.on((message)=>{
        // Got a value
        if (messageHasValue(message)) {
            for (const [lbl, pred] of Object.entries(cases)){
                if (pred(message.value)) {
                    t[lbl].set(message.value);
                    if (match === `first`) break;
                }
            }
        } else if (messageIsDoneSignal(message)) {
            performDispose();
        }
    });
    return t;
// }
};
; // CONCATENATED MODULE: ../rx/src/ops/tap.ts
/**
 * 'Taps' the values from 'input', passing them to the 'process' function.
 * Return stream is the input stream, unaffected by what 'process' does.
 * @param input Input stream
 * @param processors List of processors
 * @returns 
 */ function tapProcess(input, ...processors) {
    const inputStream = resolveSource(input);
    // @ts-expect-error
    const chain = Process.flow(...processors);
    inputStream.onValue((value)=>{
        chain(value);
    });
    return inputStream;
}
/**
 * 'Taps' the values from 'input', passing them to 'diverged'
 * Returns the original input stream, unaffected by what 'diverged' does.
 * @param input Input stream
 * @param diverged Stream to write to 
 * @returns 
 */ function tapStream(input, diverged) {
    const inputStream = resolveSource(input);
    inputStream.onValue((value)=>{
        diverged.set(value);
    });
    return inputStream;
}
/**
 * Create a parallel 'tap' of processing
 * @param input Input stream
 * @param ops Series of ops to process data
 * @returns 
 */ const tapOps = (input, ...ops)=>{
    for (const op of ops){
        // @ts-expect-error
        input = op(input);
    }
    return input;
};
; // CONCATENATED MODULE: ../rx/src/ops/throttle.ts
/**
 * Only allow a value through if a minimum amount of time has elapsed.
 * since the last value. This effectively slows down a source to a given number
 * of values/ms. Values emitted by the source which are too fast are discarded.
 * 
 * Throttle will fire on the first value received.
 * 
 * In more detail:
 * Every time throttle passes a value, it records the time it allowed something through. For every
 * value received, it checks the elapsed time against this timestamp, throwing away values if
 * the period hasn't elapsed.
 * 
 * With this logic, a fury of values of the source might be discarded if they fall within the elapsed time
 * window. But then if there is not a new value for a while, the actual duration between values can be longer
 * than expected. This is in contrast to {@link debounce}, which will emit the last value received after a duration, 
 * even if the source stops sending.
 * @param options 
 * @returns 
 */ function throttle(throttleSource, options = {}) {
    const elapsed = interval_type_intervalToMs(options.elapsed, 0);
    let lastFire = performance.now();
    let lastValue;
    const upstream = initUpstream(throttleSource, {
        ...options,
        onValue (value) {
            lastValue = value;
            trigger();
        }
    });
    const trigger = ()=>{
        const now = performance.now();
        if (elapsed > 0 && now - lastFire > elapsed) {
            lastFire = now;
            if (lastValue !== undefined) {
                upstream.set(lastValue);
            }
        }
    };
    return toReadable(upstream);
}
; // CONCATENATED MODULE: ../rx/src/ops/timeout-value.ts
/**
 * Emits a value if `source` does not emit a value after `interval`
 * has elapsed. This can be useful to reset a reactive to some
 * 'zero' state if nothing is going on.
 * 
 * If `source` emits faster than the `interval`, it won't get triggered.
 * 
 * Default for 'timeout': 1000s.
 * 
 * ```js
 * // Emit 'hello' if 'source' doesn't emit a value after 1 minute
 * const r = Rx.timeoutValue(source, { value: 'hello', interval: { mins: 1 } });
 * ```
 * 
 * Can also emit results from a function or generator
 * ```js
 * // Emits a random number if 'source' doesn't emit a value after 500ms
 * const r = Rx.timeoutValue(source, { fn: Math.random, interval: 500 });
 * ```
 * 
 * If `immediate` option is _true_ (default), the timer starts from stream initialisation.
 * Otherwise it won't start until it observes the first value from `source`.
 * @param source 
 * @param options 
 */ function timeoutValue(source, options) {
    let timer;
    const immediate = options.immediate ?? true;
    const repeat = options.repeat ?? false;
    const timeoutMs = interval_type_intervalToMs(options.interval, 1000);
    if (!isTrigger(options)) {
        throw new Error(`Param 'options' does not contain trigger 'value' or 'fn' fields`);
    }
    // Send value from trigger
    const sendFallback = ()=>{
        const [value, done] = resolveTriggerValue(options);
        if (done) {
            events.dispose(`Trigger completed`);
        } else {
            if (events.isDisposed()) return;
            events.set(value);
            if (repeat) {
                timer = setTimeout(sendFallback, timeoutMs);
            }
        }
    };
    const events = initUpstream(source, {
        disposeIfSourceDone: true,
        // Received a value from upstream source
        onValue (v) {
            // Reset timeout
            if (timer) clearTimeout(timer);
            timer = setTimeout(sendFallback, timeoutMs);
            // Emit value
            events.set(v);
        },
        onDispose () {
            if (timer) clearTimeout(timer);
        }
    });
    if (immediate && !timer) {
        timer = setTimeout(sendFallback, timeoutMs);
    }
    return events;
}
; // CONCATENATED MODULE: ../rx/src/ops/timeout-ping.ts
/**
 * Pings a reactive if no value is emitted at after `interval`.
 * Returns `source`.
 * 
 * ```js
 * // Ping `source` if no value is emitted after one minute
 * const r = Rx.timeoutPing(source, { mins: 1 });
 * ```
 * 
 * Behavior can be stopped using an abort signal.
 * @see {@link ReactivePingable}
 * @param source 
 * @param options 
 */ function timeoutPing(source, options) {
    let timer;
    const rx = resolveSource(source);
    const abort = options.abort;
    const timeoutMs = interval_type_intervalToMs(options, 1000);
    // Send ping
    const sendPing = ()=>{
        if (abort?.aborted || rx.isDisposed()) {
            off();
            return;
        }
        if (isPingable(rx)) rx.ping(); // ignore if not pingable
        timer = setTimeout(sendPing, timeoutMs);
    };
    const cancel = ()=>{
        if (timer) clearTimeout(timer);
    };
    const off = rx.on((message)=>{
        if (messageHasValue(message)) {
            // Reset timeout
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
; // CONCATENATED MODULE: ../rx/src/ops/with-value.ts
/**
 * A reactive where the last value can be read at any time.
 * An initial value must be provided.
 * ```js
 * const r = Rx.withValue(source, { initial: `hello` });
 * r.last(); // Read last value
 * ```
 * 
 * Warning: Since most reactives only active when subscribed to, it's important to also subscribe
 * to the results of `r` for this flow to happen. Alternatively, use `lazy: 'never'` as an option.
 * @param input 
 * @param options 
 * @returns 
 */ function withValue(input, options) {
    let lastValue = options.initial;
    const upstream = initUpstream(input, {
        ...options,
        onValue (value) {
            //console.log(`Rx.Ops.WithValue onValue: ${ value }`);
            lastValue = value;
            upstream.set(value);
        }
    });
    const readable = toReadable(upstream);
    return {
        ...readable,
        last () {
            return lastValue;
        }
    };
}
; // CONCATENATED MODULE: ../rx/src/reactives/debounce.ts
/**
 * Debounce waits for `elapsed` time after the last received value before emitting it.
 * 
 * If a flurry of values are received that are within the interval, it won't emit anything. But then
 * as soon as there is a gap in the messages that meets the interval, the last received value is sent out.
 * 
 * `debounce` always emits with at least `elapsed` as a delay after a value received. While {@link throttle} potentially
 * sends immediately, if it's outside of the elapsed period.
 * 
 * This is a subtly different logic to {@link throttle}. `throttle` more eagerly sends the first value, potentially
 * not sending later values. `debouce` however will send later values, potentially ignoring earlier ones.
 * @param source 
 * @param options 
 * @returns 
 */ function debounce(source, options = {}) {
    const elapsed = interval_type_intervalToMs(options.elapsed, 50);
    let lastValue;
    const timer = timeout(()=>{
        const v = lastValue;
        if (v) {
            upstream.set(v);
            lastValue = undefined;
        }
    }, elapsed);
    const upstream = initUpstream(source, {
        ...options,
        onValue (value) {
            lastValue = value;
            timer.start();
        }
    });
    return toReadable(upstream);
}
; // CONCATENATED MODULE: ../rx/src/ops/debounce.ts
function debounce_debounce(options) {
    return (source)=>{
        return debounce(source, options);
    };
}
; // CONCATENATED MODULE: ../rx/src/ops/value-to-ping.ts
/**
 * Pings `target` whenever `source` emits a value. The value itself is ignored, it just
 * acts as a trigger.
 * 
 * Returns a new stream capturing the output of `target`.
 * 
 * It `source` or `target` closes, output stream closes too.
 * 
 * @returns 
 */ function valueToPing(source, target, options = {}) {
    const lazy = options.lazy ?? `initial`;
    const signal = options.signal;
    const sourceRx = resolveSource(source);
    const gate = options.gate ?? ((value)=>true);
    let upstreamOff;
    let downstreamOff;
    if (signal) {
        signal.addEventListener(`abort`, ()=>{
            done(`Abort signal ${signal.reason}`);
        }, {
            once: true
        });
    }
    const events = initStream({
        onFirstSubscribe () {
            if (lazy !== `never` && upstreamOff === undefined) start();
        },
        onNoSubscribers () {
            // Unsubscribe from source if we're very lazy
            // Stay subscribed if we're only initially lazy or not lazy at all
            if (lazy === `very` && upstreamOff !== undefined) {
                upstreamOff();
                upstreamOff = undefined;
            }
        }
    });
    const start = ()=>{
        //console.log(`Rx.valueToPing  start`);
        upstreamOff = sourceRx.on((message)=>{
            if (messageIsDoneSignal(message)) {
                done(`Upstream closed`);
            } else if (messageIsSignal(message)) {
                events.signal(message.signal);
            } else if (messageHasValue(message)) {
                //console.log(`Rx.valueToPing got value: ${ message.value }`);
                if (gate(message.value)) {
                    target.ping();
                }
            }
        });
        downstreamOff = target.on((message)=>{
            if (messageIsDoneSignal(message)) {
                done(`Downstream closed`);
            } else if (messageIsSignal(message)) {
                events.signal(message.signal, message.context);
            } else if (messageHasValue(message)) {
                events.set(message.value);
            }
        });
    };
    const done = (reason)=>{
        events.dispose(reason);
        if (upstreamOff) upstreamOff();
        if (downstreamOff) downstreamOff();
    };
    if (lazy === `never`) start();
    return events;
}
; // CONCATENATED MODULE: ../rx/src/ops/index.ts
; // CONCATENATED MODULE: ../rx/src/sinks/index.ts
; // CONCATENATED MODULE: ../collections/src/map/map-immutable-fns.ts
/**
 * Adds an array o [k,v] to the map, returning a new instance
 * @param map Initial data
 * @param data Data to add
 * @returns New map with data added
 */ const addArray = (map, data)=>{
    const x = new Map(map.entries());
    for (const d of data){
        if (d[0] === undefined) throw new Error(`key cannot be undefined`);
        if (d[1] === undefined) throw new Error(`value cannot be undefined`);
        x.set(d[0], d[1]);
    }
    return x;
};
/**
 * Adds objects to the map, returning a new instance
 * @param map Initial data
 * @param data Data to add
 * @returns A new map with data added
 */ const addObjects = (map, data)=>{
    const x = new Map(map.entries());
    for (const d of data){
        if (d.key === undefined) throw new Error(`key cannot be undefined`);
        if (d.value === undefined) throw new Error(`value cannot be undefined`);
        x.set(d.key, d.value);
    }
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
 */ const has = (map, key)=>map.has(key);
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
 */ const map_immutable_fns_add = (map, ...data)=>{
    if (map === undefined) throw new Error(`map parameter is undefined`);
    if (data === undefined) throw new Error(`data parameter i.s undefined`);
    if (data.length === 0) return map;
    const firstRecord = data[0];
    const isObject = typeof firstRecord.key !== `undefined` && typeof firstRecord.value !== `undefined`; //(typeof (data[0] as {readonly key:K}).key !== undefined && typeof (data[0] as {readonly value:V}).value !== undefined);
    return isObject ? addObjects(map, data) : addArray(map, data);
};
/**
 * Sets data in a copy of the initial map
 * @param map Initial map
 * @param key Key
 * @param value Value to  set
 * @returns New map with data set
 */ const map_immutable_fns_set = (map, key, value)=>{
    const x = new Map(map.entries());
    x.set(key, value);
    return x;
};
/**
 * Delete a key from the map, returning a new map
 * @param map Initial data
 * @param key
 * @returns New map with data deleted
 */ const del = (map, key)=>{
    const x = new Map(map.entries());
    x.delete(key);
    return x;
};
; // CONCATENATED MODULE: ../collections/src/map/map.ts
/**
 * Returns an {@link IMapImmutable}.
 * Use {@link Maps.mutable} as a mutable alternatve.
 *
 * @example Basic usage
 * ```js
 * // Creating
 * let m = map();
 * // Add
 * m = m.set("name", "sally");
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
 * // Add as array or key & value pair
 * m = m.add(["name" , "sally"]);
 * m = m.add({ key: "name", value: "sally" });
 * // Add using the more typical set
 * m = m.set("name", "sally");
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
 */ const immutable = (dataOrMap)=>{
    if (dataOrMap === undefined) return immutable([]);
    if (Array.isArray(dataOrMap)) return immutable(map_immutable_fns_add(new Map(), ...dataOrMap));
    const data = dataOrMap;
    return {
        add: (...itemsToAdd)=>{
            const s = map_immutable_fns_add(data, ...itemsToAdd);
            return immutable(s);
        },
        set: (key, value)=>{
            const s = map_immutable_fns_set(data, key, value);
            return immutable(s);
        },
        get: (key)=>data.get(key),
        delete: (key)=>immutable(del(data, key)),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        clear: ()=>immutable(),
        has: (key)=>data.has(key),
        entries: ()=>data.entries(),
        values: ()=>data.values(),
        isEmpty: ()=>data.size === 0
    };
};
; // CONCATENATED MODULE: ../collections/src/graph/directed-graph.ts
/* eslint-disable @typescript-eslint/no-non-null-assertion */ /**
 * Create a vertex with given id
 * @param id 
 * @returns 
 */ const createVertex = (id)=>{
    return {
        id,
        out: []
    };
};
/**
 * Returns _true_ if graph contains `key`.
 * 
 * ```js
 * // Same as
 * g.vertices.has(key)
 * ```
 * @param graph
 * @param key 
 * @returns 
 */ function hasKey(graph, key) {
    throwGraphTest(graph);
    return graph.vertices.has(key);
}
/**
 * Returns {@link Vertex} under `key`, or _undefined_
 * if not found.
 * 
 * ```js
 * // Same as
 * g.vertices.get(key)
 * ```
 * @param graph 
 * @param key 
 * @returns 
 */ function directed_graph_get(graph, key) {
    throwGraphTest(graph);
    throwStringTest(key, `non-empty`, `key`);
    return graph.vertices.get(key);
}
// export function fromAdjacenyMatrix(m: Array<Array<boolean>>): DirectedGraph {
//   let g = graph();
//   for (const row of m) {
//     connect(g, { from, to })
//   }
//   return g;
// }
/**
 * Returns the graph connections as an adjacency matrix
 * @param graph 
 * @returns 
 */ function toAdjacencyMatrix(graph) {
    throwGraphTest(graph);
    const v = [
        ...graph.vertices.values()
    ];
    //const m: Array<Array<boolean>> = [];
    const table = new Table();
    table.labelColumns(...v.map((vv)=>vv.id));
    table.labelRows(...v.map((vv)=>vv.id));
    // const row: Array<boolean> = [];
    // for (let index = 0; index < v.length; index++) {
    //   row[ index ] = false;
    // }
    // eslint-disable-next-line @typescript-eslint/prefer-for-of, unicorn/prevent-abbreviations
    for(let i = 0; i < v.length; i++){
        //m[ i ] = [ ...row ];
        table.setRow(i, v.length, false);
        const ii = v[i];
        // eslint-disable-next-line unicorn/prevent-abbreviations
        for (const [j, jj] of v.entries()){
            if (ii.out.some((o)=>o.id === jj.id)) {
                //m[ i ][ j ] = true;
                table.set(i, j, true);
            }
        }
    }
    return table;
}
/**
 * Return a string representation of the graph for debug inspection
 * @param graph 
 * @returns 
 */ const dumpGraph = (graph)=>{
    const lines = debugGraphToArray(graph);
    return lines.join(`\n`);
};
/**
 * Return an array of a debug-print of every vertex.
 * @param graph 
 * @returns 
 */ const debugGraphToArray = (graph)=>{
    const r = [];
    const vertices = `vertices` in graph ? graph.vertices.values() : graph;
    for (const v of vertices){
        // eslint-disable-next-line unicorn/prevent-abbreviations
        const str = debugDumpVertex(v);
        r.push(...str.map((line)=>` ${line}`));
    }
    return r;
};
const distance = (graph, edge)=>{
    if (edge.weight !== undefined) return edge.weight;
    return 1;
};
/**
 * Iterate over all the edges in the graph
 * @param graph 
 */ function* directed_graph_edges(graph) {
    throwGraphTest(graph);
    const vertices = [
        ...graph.vertices.values()
    ];
    for (const vertex of vertices){
        for (const edge of vertex.out){
            yield edge;
        }
    }
}
/**
 * Iterate over all the vertices of the graph
 * @param graph 
 */ function* directed_graph_vertices(graph) {
    throwGraphTest(graph);
    const vertices = [
        ...graph.vertices.values()
    ];
    for (const vertex of vertices){
        yield vertex;
    }
}
function testGraph(g, paramName = `graph`) {
    if (g === undefined) return [
        false,
        `Param '${paramName}' is undefined. Expected Graph`
    ];
    if (g === null) return [
        false,
        `Param '${paramName}' is null. Expected Graph`
    ];
    if (typeof g === `object`) {
        if (!(`vertices` in g)) return [
            false,
            `Param '${paramName}.vertices' does not exist. Is it a Graph type?`
        ];
    } else {
        return [
            false,
            `Param '${paramName} is type '${typeof g}'. Expected an object Graph`
        ];
    }
    return [
        true
    ];
}
function throwGraphTest(g, paramName = `graph`) {
    const r = testGraph(g, paramName);
    if (r[0]) return;
    throw new Error(r[1]);
}
/**
 * Iterate over all the vertices connected to `context` vertex
 * @param graph Graph
 * @param context id or Vertex.
 * @returns 
 */ function* adjacentVertices(graph, context) {
    throwGraphTest(graph);
    if (context === undefined) return;
    const vertex = typeof context === `string` ? graph.vertices.get(context) : context;
    if (vertex === undefined) throw new Error(`Vertex not found ${JSON.stringify(context)}`);
    for (const edge of vertex.out){
        const edgeV = graph.vertices.get(edge.id);
        if (edgeV === undefined) throw new Error(`Could not find vertex: ${edge.id}`);
        yield edgeV;
    }
}
/**
 * Returns _true_ if `vertex` has an outgoing connection to
 * the supplied id or vertex.
 * 
 * If `vertex` is undefined, _false_ is returned.
 * @param vertex From vertex
 * @param outIdOrVertex To vertex
 * @returns 
 */ const vertexHasOut = (vertex, outIdOrVertex)=>{
    if (vertex === undefined) return false;
    const outId = typeof outIdOrVertex === `string` ? outIdOrVertex : outIdOrVertex.id;
    return vertex.out.some((edge)=>edge.id === outId);
};
/**
 * Returns _true_ if `vertex` has no outgoing connections
 * @param graph 
 * @param vertex 
 * @returns 
 */ const hasNoOuts = (graph, vertex)=>{
    throwGraphTest(graph);
    const context = typeof vertex === `string` ? graph.vertices.get(vertex) : vertex;
    if (context === undefined) return false;
    return context.out.length === 0;
};
/**
 * Returns _true_ if `vertex` only has the given list of vertices.
 * Returns _false_ early if the length of the list does not match up with `vertex.out`
 * @param graph 
 * @param vertex 
 * @param outIdOrVertex 
 * @returns 
 */ const hasOnlyOuts = (graph, vertex, ...outIdOrVertex)=>{
    throwGraphTest(graph);
    const context = resolveVertex(graph, vertex);
    const outs = outIdOrVertex.map((o)=>resolveVertex(graph, o));
    if (outs.length !== context.out.length) {
        //console.log(`length mismatch. context: ${ JSON.stringify(context.out) } out ${ JSON.stringify(outIdOrVertex) }`);
        return false;
    }
    for (const out of outs){
        //console.log(`Testing ${ context.id } -> ${ out.id }`);
        if (!hasOut(graph, context, out)) {
            //console.log(`  no`);
            return false;
        }
    }
    return true;
};
/**
 * Returns _true_ if `vertex` has an outgoing connection to the given vertex.
 * @param graph 
 * @param vertex 
 * @param outIdOrVertex 
 * @returns 
 */ const hasOut = (graph, vertex, outIdOrVertex)=>{
    throwGraphTest(graph);
    const context = resolveVertex(graph, vertex);
    const outId = typeof outIdOrVertex === `string` ? outIdOrVertex : outIdOrVertex.id;
    return context.out.some((edge)=>edge.id === outId);
};
// export const hasIn = (graph: Graph, contextIdOrVertex: string | Vertex, id: string): boolean => {
//   const context = typeof contextIdOrVertex === `string` ? graph.vertices.get(contextIdOrVertex) : contextIdOrVertex;
//   if (context === undefined) return false;
//   if (context.in === undefined) return false;
//   return context.in.some(edge => edge.id === id);
// }
/**
 * Gets a vertex by id, creating it if it does not exist.
 * @param graph 
 * @param id 
 * @returns 
 */ const getOrCreate = (graph, id)=>{
    throwGraphTest(graph);
    const v = graph.vertices.get(id);
    if (v !== undefined) return {
        graph,
        vertex: v
    };
    const vv = createVertex(id);
    const gg = updateGraphVertex(graph, vv);
    return {
        graph: gg,
        vertex: vv
    };
};
/**
 * Gets a vertex by id, throwing an error if it does not exist
 * @param graph 
 * @param id 
 * @returns 
 */ const getOrFail = (graph, id)=>{
    throwGraphTest(graph);
    const v = graph.vertices.get(id);
    if (v === undefined) throw new Error(`Vertex '${id}' not found in graph`);
    return v;
};
/**
 * Updates a vertex by returning a mutated graph
 * @param graph Graph
 * @param vertex Newly changed vertex
 * @returns 
 */ const updateGraphVertex = (graph, vertex)=>{
    throwGraphTest(graph);
    const gr = {
        ...graph,
        vertices: graph.vertices.set(vertex.id, vertex)
    };
    return gr;
};
/**
 * Default distance computer. Uses `weight` property of edge, or `1` if not found.
 * @param graph 
 * @param edge 
 * @returns 
 */ const distanceDefault = (graph, edge)=>{
    if (edge.weight !== undefined) return edge.weight;
    return 1;
};
/**
 * Returns a mutation of `graph`, with a given edge removed.
 * 
 * If edge was not there, original graph is returned.
 * @param graph 
 * @param from 
 * @param to 
 * @returns 
 */ function disconnect(graph, from, to) {
    throwGraphTest(graph);
    const fromV = resolveVertex(graph, from);
    const toV = resolveVertex(graph, to);
    return hasOut(graph, fromV, toV) ? updateGraphVertex(graph, {
        ...fromV,
        out: fromV.out.filter((t)=>t.id !== toV.id)
    }) : graph;
}
/**
 * Make a connection between two vertices with a given weight.
 * It returns the new graph as wll as the created edge.
 * @param graph 
 * @param from 
 * @param to 
 * @param weight 
 * @returns 
 */ function connectTo(graph, from, to, weight) {
    throwGraphTest(graph);
    const fromResult = getOrCreate(graph, from);
    graph = fromResult.graph;
    const toResult = getOrCreate(graph, to);
    graph = toResult.graph;
    const edge = {
        id: to,
        weight
    };
    if (!hasOut(graph, fromResult.vertex, toResult.vertex)) {
        graph = updateGraphVertex(graph, {
            ...fromResult.vertex,
            // Add new edge to list of edges for this node
            out: [
                ...fromResult.vertex.out,
                edge
            ]
        });
    }
    return {
        graph,
        edge
    };
}
/**
 * Connect from -> to. Same as {@link connectWithEdges}, but this version just returns the graph.
 * 
 * By default unidirectional, meaning a connection is made only from->to. Use `bidi` option to set a bidirection connection, adding also to->from.
 * 
 * Returns a result of `{ graph, edges }`, where `graph` is the new {@link DirectedGraph} and `edges`
 * is an array of {@link Edge Edges}. One for unidirectional, or two for bidirectional.
 * @param graph 
 * @param options 
 * @returns 
 */ function connect(graph, options) {
    if (typeof graph !== `object`) throw new TypeError(`Param 'graph' is expected to be a DirectedGraph object. Got: ${typeof graph}`);
    if (typeof options !== `object`) throw new TypeError(`Param 'options' is expected to be ConnectOptions object. Got: ${typeof options}`);
    const result = connectWithEdges(graph, options);
    return result.graph;
}
/**
 * Connect from -> to. Same as {@link connect} except you get back the edges as well. 
 * 
 * By default unidirectional, meaning a connection is made only from->to. Use `bidi` option to set a bidirection connection, adding also to->from.
 * 
 * Returns a result of `{ graph, edges }`, where `graph` is the new {@link DirectedGraph} and `edges`
 * is an array of {@link Edge Edges}. One for unidirectional, or two for bidirectional.
 * @param graph 
 * @param options 
 * @returns 
 */ function connectWithEdges(graph, options) {
    throwGraphTest(graph);
    const { to, weight, from } = options;
    const bidi = options.bidi ?? false;
    const toList = Array.isArray(to) ? to : [
        to
    ];
    let edges = [];
    // Connect from -> to
    for (const toSingle of toList){
        const result = connectTo(graph, from, toSingle, weight);
        graph = result.graph;
        edges.push(result.edge);
    }
    if (!bidi) return {
        graph,
        edges
    };
    // Bidirectional connection
    // Connect to -> from
    for (const toSingle of toList){
        const result = connectTo(graph, toSingle, from, weight);
        graph = result.graph;
        edges.push(result.edge);
    }
    return {
        graph,
        edges
    };
}
/**
 * Returns an array of debug-representations for the given vertex.
 * @param v 
 * @returns 
 */ const debugDumpVertex = (v)=>{
    const r = [
        v.id
    ];
    const stringForEdge = (edge)=>edge.weight === undefined ? edge.id : `${edge.id} (${edge.weight})`;
    // for (const edge of v.in) {
    //   r.push(` <- ${ stringForEdge(edge) }`);
    // }
    for (const edge of v.out){
        r.push(` -> ${stringForEdge(edge)}`);
    }
    if (v.out.length === 0) r[0] += ` (terminal)`;
    return r;
};
/**
 * Returns _true_ if a->b or b->a
 * @param graph 
 * @param a 
 * @param b 
 * @returns 
 */ function areAdjacent(graph, a, b) {
    throwGraphTest(graph);
    if (hasOut(graph, a, b.id)) return true;
    if (hasOut(graph, b, a.id)) return true;
}
/**
 * Resolves the id or vertex into a Vertex.
 * throws an error if vertex is not found
 * @param graph 
 * @param idOrVertex 
 * @returns 
 */ function resolveVertex(graph, idOrVertex) {
    throwGraphTest(graph);
    if (idOrVertex === undefined) throw new Error(`Param 'idOrVertex' is undefined. Expected string or Vertex`);
    const v = typeof idOrVertex === `string` ? graph.vertices.get(idOrVertex) : idOrVertex;
    if (v === undefined) throw new Error(`Id not found ${idOrVertex}`);
    return v;
}
/**
 * Iterates over vertices from a starting vertex in an bread-first-search
 * @param graph 
 * @param startIdOrVertex 
 * @param targetIdOrVertex 
 * @returns 
 */ function* bfs(graph, startIdOrVertex, targetIdOrVertex) {
    throwGraphTest(graph);
    const start = resolveVertex(graph, startIdOrVertex);
    const target = targetIdOrVertex === undefined ? undefined : resolveVertex(graph, targetIdOrVertex);
    const queue = new QueueMutable();
    const seen = new Set();
    queue.enqueue(start);
    while(!queue.isEmpty){
        const v = queue.dequeue();
        yield v;
        if (target !== undefined && target === v) return;
        for (const edge of adjacentVertices(graph, v)){
            if (!seen.has(edge.id)) {
                seen.add(edge.id);
                queue.enqueue(resolveVertex(graph, edge.id));
            }
        }
    }
}
/**
 * Iterates over vertices from a starting vertex in an depth-first-search
 * @param graph 
 * @param startIdOrVertex 
 */ function* dfs(graph, startIdOrVertex) {
    throwGraphTest(graph);
    const source = resolveVertex(graph, startIdOrVertex);
    const s = new StackMutable();
    const seen = new Set();
    s.push(source);
    while(!s.isEmpty){
        const v = s.pop();
        if (v === undefined) continue;
        if (!seen.has(v.id)) {
            seen.add(v.id);
            yield v;
            for (const edge of v.out){
                const destination = graph.vertices.get(edge.id);
                if (destination) {
                    s.push(destination);
                }
            }
        }
    }
}
/**
 * Compute shortest distance from the source vertex to the rest of the graph.
 * @param graph 
 * @param sourceOrId 
 * @returns 
 */ const pathDijkstra = (graph, sourceOrId)=>{
    throwGraphTest(graph);
    const source = typeof sourceOrId === `string` ? graph.vertices.get(sourceOrId) : sourceOrId;
    if (source === undefined) throw new Error(`source vertex not found`);
    const distances = new Map();
    const previous = new Map();
    distances.set(source.id, 0);
    const pq = new PriorityMutable();
    const vertices = [
        ...graph.vertices.values()
    ];
    for (const v of vertices){
        if (v.id !== source.id) {
            distances.set(v.id, Number.MAX_SAFE_INTEGER);
            // eslint-disable-next-line unicorn/no-null
            previous.set(v.id, null);
        }
        pq.enqueueWithPriority(v.id, Number.MAX_SAFE_INTEGER);
    }
    while(!pq.isEmpty){
        const u = pq.dequeueMin();
        if (u === undefined) throw new Error(`Bug. Queue unexpectedly empty`);
        const vertexU = graph.vertices.get(u);
        for (const neighbour of vertexU.out){
            //const vertexNeigbour = graph.vertices.get(neighbour.to)!;
            const alt = distances.get(u) + distance(graph, neighbour);
            if (alt < distances.get(neighbour.id)) {
                distances.set(neighbour.id, alt);
                previous.set(neighbour.id, vertexU);
                pq.changePriority(neighbour.id, alt, true);
            }
        }
    }
    const pathTo = (id)=>{
        const path = [];
        while(true){
            if (id === source.id) break;
            const v = previous.get(id);
            if (v === undefined || v === null) throw new Error(`Id not present: ${id}`);
            path.push({
                id,
                weight: distances.get(id)
            });
            id = v.id;
        }
        return path;
    };
    return {
        distances,
        previous,
        pathTo
    };
};
/**
 * Clones the graph. Uses shallow clone, because it's all immutable
 * @param graph 
 * @returns 
 */ const clone = (graph)=>{
    throwGraphTest(graph);
    const g = {
        vertices: immutableMap([
            ...graph.vertices.entries()
        ])
    };
    return g;
};
/**
 * Create a graph
 * ```js
 * let g = graph();
 * ```
 * 
 * Can optionally provide initial connections:
 * ```js
 * let g = graph(
 *  { from: `a`, to: `b` },
 *  { from: `b`, to: `c` }
 * )
 * ```
 * @param initialConnections 
 * @returns 
 */ const directed_graph_graph = (...initialConnections)=>{
    let g = {
        vertices: immutable()
    };
    for (const ic of initialConnections){
        g = connect(g, ic);
    }
    return g;
};
/**
 * Returns _true_ if the graph contains is acyclic - that is, it has no loops
 * @param graph 
 */ function isAcyclic(graph) {
    throwGraphTest(graph);
    const cycles = getCycles(graph);
    return cycles.length === 0;
}
/**
 * Topological sort using Kahn's algorithm.
 * Returns a new graph that is sorted
 * @param graph 
 */ function topologicalSort(graph) {
    throwGraphTest(graph);
    const indegrees = new NumberMap(0);
    // Increment indegrees for each edge leading to a vertex
    for (const edge of directed_graph_edges(graph)){
        indegrees.add(edge.id, 1);
    }
    // Enqueue all vertices with an indegree of 0
    const queue = new QueueMutable();
    let vertexCount = 0;
    for (const vertex of directed_graph_vertices(graph)){
        if (indegrees.get(vertex.id) === 0) {
            queue.enqueue(vertex);
        }
        vertexCount++;
    }
    const topOrder = [];
    while(!queue.isEmpty){
        // Add to topological order
        const u = queue.dequeue();
        topOrder.push(u);
        // Iterate through neighbours
        for (const neighbour of u.out){
            const result = indegrees.subtract(neighbour.id, 1);
            if (result === 0) {
                queue.enqueue(graph.vertices.get(neighbour.id));
            }
        }
    }
    if (topOrder.length !== vertexCount) {
        throw new Error(`Graph contains cycles`);
    }
    return graphFromVertices(topOrder);
}
/**
 * Create a graph from an iterable of vertices
 * @param vertices 
 * @returns 
 */ function graphFromVertices(vertices) {
    // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
    const keyValues = Sync.map(vertices, (f)=>{
        return [
            f.id,
            f
        ];
    });
    const m = immutableMap([
        ...keyValues
    ]);
    return {
        vertices: m
    };
}
/**
 * Get all the cycles ('strongly-connected-components') within the graph
 * [Read more](https://en.wikipedia.org/wiki/Strongly_connected_component)
 * @param graph 
 * @returns 
 */ function getCycles(graph) {
    throwGraphTest(graph);
    let index = 0;
    const stack = new StackMutable();
    const vertices = new Map();
    const scc = [];
    for (const v of graph.vertices.values()){
        vertices.set(v.id, {
            ...v,
            lowlink: Number.NaN,
            index: Number.NaN,
            onStack: false
        });
    }
    const strongConnect = (vertex)=>{
        vertex.index = index;
        vertex.lowlink = index;
        index++;
        stack.push(vertex);
        vertex.onStack = true;
        for (const edge of vertex.out){
            const edgeV = vertices.get(edge.id);
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
            while(vertex !== w){
                w = stack.pop();
                w.onStack = false;
                stronglyConnected.push({
                    id: w.id,
                    out: w.out
                });
            }
            if (stronglyConnected.length > 1) scc.push(stronglyConnected);
        }
    };
    for (const v of vertices.values()){
        if (Number.isNaN(v.index)) {
            strongConnect(v);
        }
    }
    return scc;
}
/**
 * Returns a new graph which is transitively reduced.
 * That is, redundant edges are removed
 * @param graph 
 * @returns 
 */ function transitiveReduction(graph) {
    throwGraphTest(graph);
    for (const u of directed_graph_vertices(graph)){
        for (const v of adjacentVertices(graph, u)){
            for (const v1 of dfs(graph, v)){
                if (v.id === v1.id) continue;
                if (hasOut(graph, u, v1)) {
                    const g = disconnect(graph, u, v1);
                    return transitiveReduction(g);
                }
            }
        }
    }
    return graph;
}
; // CONCATENATED MODULE: ../rx/src/graph.ts
// function isReactive(o: object): o is Reactive<any> {
//   if (typeof o !== `object`) return false;
//   if (`on` in o) {
//     return (typeof o.on === `function`);
//   }
//   return false;
// }
/**
 * Build a graph of reactive dependencies for `rx`
 * @param _rx 
 */ function prepare(_rx) {
    let g = directed_graph_graph();
    const nodes = new Map();
    const events = initStream();
    const process = (o, path)=>{
        for (const [key, value] of Object.entries(o)){
            const subPath = path + `.` + key;
            g = connect(g, {
                from: path,
                to: subPath
            });
            if (isReactive(value)) {
                nodes.set(subPath, {
                    value,
                    type: `rx`
                });
                value.on((v)=>{
                    console.log(`Rx.prepare value: ${JSON.stringify(v)} path: ${subPath}`);
                });
            } else {
                const valueType = typeof value;
                if (valueType === `bigint` || valueType === `boolean` || valueType === `number` || valueType === `string`) {
                    nodes.set(subPath, {
                        type: `primitive`,
                        value
                    });
                } else if (valueType === `object`) {
                    process(value, subPath);
                } else if (valueType === `function`) {
                    console.log(`Rx.process - not handling functions`);
                }
            }
        }
    };
    // const produce = () => {
    //   Object.fromEntries(entries);
    // }
    // process(rx, `_root`);
    // console.log(DiGraph.dumpGraph(g));
    // console.log(`--- Map ---`);
    // for (const entries of nodes.entries()) {
    //   console.log(entries[ 0 ]);
    //   console.log(entries[ 1 ]);
    //   console.log(``)
    // }
    const returnValue = {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        dispose: events.dispose,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        isDisposed: events.isDisposed,
        graph: g,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        on: events.on,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        onValue: events.onValue
    };
    return returnValue;
}
; // CONCATENATED MODULE: ../rx/src/types.ts
const symbol = Symbol(`Rx`);
; // CONCATENATED MODULE: ../rx/src/to-array.ts
/**
 * Reads a set number of values from `source`, returning as an array. May contain
 * empty values if desired values is not reached.
 * 
 * After the limit is reached (or `source` completes), `source` is unsubscribed from.
 * 
 * If no limit is set, it will read until `source` completes or `maximumWait` is reached.
 * `maximumWait` is 10 seconds by default.
 * 
 * Use {@link toArrayOrThrow} to throw if desired limit is not reached.
 * 
 * ```js
 * // Read from `source` for 5 seconds
 * const data = await toArray()(source);
 * // Read 5 items from `source`
 * const data = await toArray({ limit: 5 })(source);
 * // Read for 10s
 * const data = await toArray({ maximumWait: 10_1000 })(source);
 * ```
 * @param source 
 * @param options 
 * @returns 
 */ async function to_array_toArray(source, options = {}) {
    const limit = options.limit ?? Number.MAX_SAFE_INTEGER;
    const maximumWait = interval_type_intervalToMs(options.maximumWait, 10 * 1000);
    const underThreshold = options.underThreshold ?? `partial`;
    const read = [];
    const rx = resolveSource(source);
    const promise = new Promise((resolve, reject)=>{
        const done = ()=>{
            clearTimeout(maxWait);
            unsub();
            if (read.length < limit && underThreshold === `throw`) {
                reject(new Error(`Threshold not reached. Wanted: ${limit} got: ${read.length}. Maximum wait: ${maximumWait}`));
                return;
            }
            if (read.length < limit && underThreshold === `fill`) {
                for(let index = 0; index < limit; index++){
                    if (read[index] === undefined) {
                        //console.log(`Rx.toArray filling at index: ${ index }`);
                        read[index] = options.fillValue;
                    }
                }
            }
            resolve(read);
        };
        const maxWait = setTimeout(()=>{
            done();
        }, maximumWait);
        const unsub = rx.on((message)=>{
            //console.log(`Rx.toArray: ${ JSON.stringify(message) }`);
            if (messageIsDoneSignal(message)) {
                done();
            } else if (messageHasValue(message)) {
                read.push(message.value);
                //console.log(`Rx.toArray read buffer: ${ JSON.stringify(read) }`);
                if (read.length === limit) {
                    done();
                }
            }
        });
    });
    return promise;
}
/**
 * By default, reads all the values from `source`, or until 5 seconds has elapsed.
 * 
 * If `limit` is provided as an option, it will exit early, or throw if that number of values was not acheived.
 * 
 * ```js
 * // Read from `source` for 5 seconds
 * const data = await toArrayOrThrow()(source);
 * // Read 5 items from `source`
 * const data = await toArrayOrThrow({ limit: 5 })(source);
 * // Read for 10s
 * const data = await toArrayOrThrow({ maximumWait: 10_1000 })(source);
 * ```
 * @param source 
 * @param options 
 * @returns 
 */ async function toArrayOrThrow(source, options = {}) {
    const limit = options.limit ?? Number.MAX_SAFE_INTEGER;
    const maximumWait = options.maximumWait ?? 5 * 1000;
    const v = await to_array_toArray(source, {
        limit,
        maximumWait,
        underThreshold: `partial`
    });
    // There was a limit, but it wasn't reached
    if (options.limit && v.length < options.limit) throw new Error(`Threshold not reached. Wanted: ${options.limit}, got ${v.length}`);
    // Otherwise, we may have been reading for a specified duration
    return v;
}
; // CONCATENATED MODULE: ../rx/src/to-generator.ts
/**
 * Returns an AsyncGenerator wrapper around Reactive.
 * This allows values to be iterated over using a `for await` loop,
 * like Chains.
 *
 * ```js
 * // Reactive numerical value
 * const number = Reactive.number(10);
 * 
 * const g = Reactive.toGenerator(number);
 * for await (const v of g) {
 *  console.log(v); // Prints out whenever the reactive value changes
 * }
 * // Execution doesn't continue until Reactive finishes
 * ```
 * 
 * When/if `source` closes, an exception is thrown.
 * To catch this, wrap the calling `for await` in a try-catch block
 * ```js
 * try {
 *  for await (const v of g) {
 *  }
 * } catch (error) {
 * }
 * // Completed
 * ``` 
 * 
 * Use something like `setTimeout` to loop over the generator
 * without impeding the rest of your code flow. For example:
 * ```js
 * // Listen for every pointerup event
 * const ptr = Reactive.fromEvent(document.body, `pointerup`);
 * // Start iterating
 * setTimeout(async () => {
 *  const gen = Reactive.toGenerator(ptr);
 *  try {
 *    for await (const v of gen) {
 *      // Prints out whenever there is a click
 *      console.log(v);
 *    }
 *  } catch (e) { }
 *  console.log(`Iteration done`);
 * });
 * 
 * // Execution continues here immediately
 * ```
 * @param source 
 */ async function* toGenerator(source) {
    const s = resolveSource(source);
    let promiseResolve = (_)=>{};
    let promiseReject = (_)=>{};
    const promiseInit = ()=>new Promise((resolve, reject)=>{
            promiseResolve = resolve;
            promiseReject = reject;
        });
    let promise = promiseInit();
    let keepRunning = true;
    s.on((message)=>{
        if (messageHasValue(message)) {
            promiseResolve(message.value);
            promise = promiseInit();
        } else if (messageIsDoneSignal(message)) {
            keepRunning = false;
            promiseReject(`Source has completed`);
        }
    });
    while(keepRunning){
        yield await promise;
    }
}
; // CONCATENATED MODULE: ../core/src/records/map-object.ts
/**
 * Maps the top-level properties of an object through a map function.
 * That is, run each of the values of an object through a function,
 * setting the result onto the same key structure as original.
 * 
 * It is NOT recursive.
 *
 * The mapping function gets a single args object, consisting of `{ value, field, index }`,
 * where 'value' is the value of the field, 'field' the name, and 'index' a numeric count.
 * @example Double the value of all fields
 * ```js
 * const rect = { width: 100, height: 250 };
 * const doubled = mapObjectShallow(rect, args => {
 *  return args.value*2;
 * });
 * // Yields: { width: 200, height: 500 }
 * ```
 *
 * Since the map callback gets the name of the property, it can do context-dependent things.
 * ```js
 * const rect = { width: 100, height: 250, colour: 'red' }
 * const doubled = mapObjectShallow(rect, args => {
 *  if (args.field === 'width') return args.value*3;
 *  else if (typeof args.value === 'number') return args.value*2;
 *  return args.value;
 * });
 * // Yields: { width: 300, height: 500, colour: 'red' }
 * ```
 * In addition to bulk processing, it allows remapping of property types.
 *
 * In terms of type-safety, the mapped properties are assumed to have the
 * same type.
 *
 * ```js
 * const o = {
 *  x: 10,
 *  y: 20,
 *  width: 200,
 *  height: 200
 * }
 *
 * // Make each property use an averager instead
 * const oAvg = mapObjectShallow(o, args => {
 *  return movingAverage(10);
 * });
 *
 * // Instead of { x:number, y:number... }, we now have { x:movingAverage(), y:movingAverage()... }
 * // Add a value to the averager
 * oAvg.x.add(20);
 * ```
 */ const mapObjectShallow = (object, mapFunction)=>{
    const entries = Object.entries(object);
    const mapped = entries.map(([sourceField, sourceFieldValue], index)=>[
            sourceField,
            mapFunction({
                value: sourceFieldValue,
                field: sourceField,
                index,
                path: sourceField
            })
        ]);
    return Object.fromEntries(mapped);
};
/**
 * Maps the contents of `data` using `mapper` as a structured set of map functions.
 * ```js
 * const a = {
 *  person: {
 *    size: 20
 *  }
 *  hello: `there`
 * }
 * mapObjectByObject(a, {
 *  person: {
 *    size: (value, context) => {
 *      return value * 2
 *    }
 *  }
 * });
 * // Yields: { person: { size: 40 }, hello: `there` }
 * ```
 * @param data 
 * @param mapper 
 * @returns 
 */ function mapObjectByObject(data, mapper) {
    const entries = Object.entries(data);
    for (const entry of entries){
        if (entry[0] in mapper) {
            const m = mapper[entry[0]];
            entry[1] = typeof m === `object` ? mapObjectByObject(entry[1], m) : m(entry[1], data);
        }
    }
    return Object.fromEntries(entries);
}
; // CONCATENATED MODULE: ../rx/src/wrap.ts
/**
 * Wrap a reactive source to allow for chained
 * function calls.
 * 
 * Example:
 * For every `pointerup` event on the body, chunk the events over
 * periods of 200ms, get the number of events in that period,
 * and print it out.
 * 
 * eg. detecting single or double-clicks
 * ```js
 * wrap(Rx.fromEvent<{ x: number, y: number }>(document.body, `pointerup`))
 *  .chunk({ elapsed: 200 })
 *  .transform(v => v.length)
 *  .onValue(v => { console.log(v) });
 * ```
 * @param source 
 * @returns 
 */ function wrap_wrap(source) {
    return {
        source: resolveSource(source),
        enacts: {
            setHtmlText: (options)=>{
                return setHtmlText(source, options);
            }
        },
        annotate: (transformer)=>{
            const a = annotate_annotate(source, transformer);
            return wrap_wrap(a);
        },
        annotateWithOp: (op)=>{
            const a = annotateWithOp(source, op);
            return wrap_wrap(a);
        },
        chunk: (options)=>{
            const w = wrap_wrap(chunk_chunk(source, options));
            return w;
        },
        // debounce: (options: Partial<DebounceOptions> = {}) => {
        //   return wrap(Ops.debounce<TIn>(source, options));
        // },
        debounce: (options = {})=>{
            return wrap_wrap(debounce(source, options));
        },
        field: (fieldName, options = {})=>{
            // Ops.field requires TIn extends object
            // Would be good if `wrap` returns different versions depending on TIn, so .field
            // would not be present at all if we had Reactive<number>, for example
            // @ts-expect-error
            const f = field_field(source, fieldName, options);
            return wrap_wrap(f);
        },
        filter: (predicate, options)=>{
            return wrap_wrap(filter_filter(source, predicate, options));
        },
        combineLatestToArray: (sources, options = {})=>{
            const srcs = [
                source,
                ...sources
            ];
            return wrap_wrap(combineLatestToArray(srcs, options));
        },
        combineLatestToObject: (sources, options)=>{
            const name = options.name ?? `source`;
            const o = {
                ...sources
            };
            o[name] = source;
            return wrap_wrap(combineLatestToObject(o, options));
        },
        min: (options = {})=>{
            return wrap_wrap(math_min(source, options));
        },
        max: (options = {})=>{
            return wrap_wrap(math_max(source, options));
        },
        average: (options = {})=>{
            return wrap_wrap(math_average(source, options));
        },
        sum: (options = {})=>{
            return wrap_wrap(math_sum(source, options));
        },
        tally: (options = {})=>{
            return wrap_wrap(math_tally(source, options));
        },
        split: (options = {})=>{
            const streams = split_split(source, options).map((v)=>wrap_wrap(v));
            return streams;
        },
        splitLabelled: (...labels)=>{
            const l = splitLabelled(source, labels);
            const m = mapObjectShallow(l, (args)=>wrap_wrap(args.value));
            return m;
        },
        switcher: (cases, options = {})=>{
            const s = switcher(source, cases, options);
            const m = mapObjectShallow(s, (args)=>wrap_wrap(args.value));
            return m;
        },
        syncToArray: (additionalSources, options = {})=>{
            const unwrapped = [
                source,
                ...additionalSources
            ].map((v)=>resolveSource(v));
            const x = syncToArray(unwrapped, options);
            return wrap_wrap(x); //synchronise<TIn>([ source, ...unwrapped ] as const));
        },
        syncToObject: (sources, options = {})=>{
            const name = options.name ?? `source`;
            const o = {
                ...sources
            };
            o[name] = source;
            return wrap_wrap(syncToObject(o, options));
        },
        tapProcess: (...processors)=>{
            tapProcess(source, ...processors);
            return wrap_wrap(source);
        },
        tapStream: (divergedStream)=>{
            tapStream(source, divergedStream);
            return wrap_wrap(source);
        },
        tapOps: (source, ...ops)=>{
            tapOps(source, ...ops);
            return wrap_wrap(source);
        },
        throttle: (options = {})=>{
            return wrap_wrap(throttle(source, options));
        },
        transform: (transformer, options = {})=>{
            return wrap_wrap(transform_transform(source, transformer, options));
        },
        timeoutValue: (options)=>{
            return wrap_wrap(timeoutValue(source, options));
        },
        timeoutPing: (options)=>{
            return wrap_wrap(timeoutPing(source, options));
        },
        toArray: (options)=>{
            return to_array_toArray(source, options);
        },
        toArrayOrThrow: (options)=>{
            return toArrayOrThrow(source, options);
        },
        onValue: (callback)=>{
            const s = resolveSource(source);
            s.on((message)=>{
                if (messageHasValue(message)) callback(message.value);
            });
        }
    };
}
; // CONCATENATED MODULE: ../rx/src/from/array.ts
const of = (source, options = {})=>{
    if (Array.isArray(source)) {
        return array_array(source, options);
    } else {}
};
/**
 * Reads the contents of `array` into a Reactive, with optional time interval
 * between values. A copy of the array is used, so changes will not
 * affect the reactive.
 * 
 * See also {@link arrayObject} which monitors changes to array values.
 *
 * Reads items from an array with a given interval, by default 5ms
 * 
 * ```js
 * const data = [`apples`, `oranges`, `pears` ];
 * const rx = Rx.From.array(data);
 * rx.onValue(v => {
 *  // v will be each fruit in turn
 * })
 * ```
 * 
 * Note that there is the possibility of missing values since there is delay between subscribing and when items start getting emitted.
 * If a new subscriber connects to the reactive, they won't get values already emitted.
 * @param sourceArray 
 * @param options 
 * @returns 
 */ const array_array = (sourceArray, options = {})=>{
    const lazy = options.lazy ?? `initial`;
    const signal = options.signal;
    const whenStopped = options.whenStopped ?? `continue`;
    const debugLifecycle = options.debugLifecycle ?? false;
    const array = [
        ...sourceArray
    ];
    if (lazy !== `very` && whenStopped === `reset`) throw new Error(`whenStopped:'reset' has no effect with 'lazy:${lazy}'. Use lazy:'very' instead.`);
    const intervalMs = interval_type_intervalToMs(options.interval, 5);
    let index = 0;
    let lastValue = array[0];
    const s = initLazyStream({
        ...options,
        lazy,
        onStart () {
            if (debugLifecycle) console.log(`Rx.readFromArray:onStart`);
            c.start();
        },
        onStop () {
            if (debugLifecycle) console.log(`Rx.readFromArray:onStop. whenStopped: ${whenStopped} index: ${index}`);
            c.cancel();
            if (whenStopped === `reset`) index = 0;
        }
    });
    const c = continuously(()=>{
        if (signal?.aborted) {
            s.dispose(`Signalled (${signal.reason})`);
            return false; // stop looping
        }
        lastValue = array[index];
        index++;
        s.set(lastValue);
        if (index === array.length) {
            s.dispose(`Source array complete`);
            return false; // stop loop
        }
    }, intervalMs);
    if (!lazy) c.start();
    return {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        dispose: s.dispose,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        isDisposed: s.isDisposed,
        isDone () {
            return index === array.length;
        },
        last () {
            return lastValue;
        },
        // eslint-disable-next-line @typescript-eslint/unbound-method
        on: s.on,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        onValue: s.onValue
    };
};
; // CONCATENATED MODULE: ../arrays/src/remove.ts
/**
 * Removes an element at `index` index from `data`, returning the resulting array without modifying the original.
 *
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * const v = [ 100, 20, 50 ];
 * const vv = Arrays.remove(2);
 *
 * Yields:
 *  v: [ 100, 20, 50 ]
 * vv: [ 100, 20 ]
 * ```
 *
 * Consider {@link without} if you want to remove an item by value.
 *
 * Throws an exception if `index` is outside the range of `data` array.
 * @param data Input array
 * @param index Index to remove
 * @typeParam V Type of array
 * @returns
 */ const remove_remove = (data, index)=>{
    // ✔️ Unit tested
    if (!Array.isArray(data)) {
        throw new TypeError(`'data' parameter should be an array`);
    }
    guardIndex(data, index, `index`);
    return [
        ...data.slice(0, index),
        ...data.slice(index + 1)
    ];
};
; // CONCATENATED MODULE: ../arrays/src/insert-at.ts
/**
 * Inserts `values` at position `index`, shuffling remaining
 * items further down.
 * @param data 
 * @param index 
 * @param values 
 * @returns 
 */ const insert_at_insertAt = (data, index, ...values)=>{
    if (!Array.isArray(data)) {
        throw new TypeError(`Param 'data' is not an arry`);
    }
    return [
        ...data.slice(0, index),
        ...values,
        ...data.slice(index + 1)
    ];
};
; // CONCATENATED MODULE: ../rx/src/from/array-object.ts
/* eslint-disable @typescript-eslint/unbound-method */ /**
 * Wraps an array object.
 * 
 * It returns an reactive along with some array-ish functions to manipulating it.
 * @param initialValue 
 * @param options 
 * @returns 
 */ function arrayObject(initialValue = [], options = {}) {
    const eq = options.eq ?? isEqualValueDefault;
    const setEvent = initStream();
    //const diffEvent = initStream<Array<Immutable.Change<any>>>();
    const arrayEvent = initStream();
    let value = initialValue;
    let disposed = false;
    const set = (replacement)=>{
        const diff = compareArrays(value, replacement, eq);
        //console.log(`Rx.fromArray.set diff`, diff);
        //if (diff.length === 0) return;
        //diffEvent.set(diff);
        value = replacement;
        setEvent.set([
            ...replacement
        ]);
    };
    const setAt = (index, v)=>{
        value[index] = v;
        setEvent.set([
            ...value
        ]);
    };
    const push = (v)=>{
        value = [
            ...value,
            v
        ];
        setEvent.set([
            ...value
        ]);
        const cr = [
            `add`,
            value.length - 1,
            v
        ];
        arrayEvent.set([
            cr
        ]);
    };
    const deleteAt = (index)=>{
        const valueChanged = remove_remove(value, index);
        if (valueChanged.length === value.length) return; // no change
        const diff = compareArrays(value, valueChanged, eq);
        //console.log(diff.summary);
        value = valueChanged;
        setEvent.set([
            ...value
        ]);
        arrayEvent.set(diff.summary);
    };
    const deleteWhere = (filter)=>{
        const valueChanged = value.filter((v)=>!filter(v));
        const count = value.length - valueChanged.length;
        const diff = compareArrays(value, valueChanged, eq);
        value = valueChanged;
        setEvent.set([
            ...value
        ]);
        arrayEvent.set(diff.summary);
        return count;
    };
    const insertAt = (index, v)=>{
        const valueChanged = insert_at_insertAt(value, index, v);
        const diff = compareArrays(value, valueChanged, eq);
        value = valueChanged;
        setEvent.set([
            ...value
        ]);
        arrayEvent.set(diff.summary);
    };
    // const update = (toMerge: Partial<V>) => {
    //   // eslint-disable-next-line unicorn/prefer-ternary
    //   if (value === undefined) {
    //     value = toMerge as V;
    //   } else {
    //     const diff = Immutable.compareData(toMerge, value);
    //     // console.log(`Rx.fromObject.update value: ${ JSON.stringify(value) }`);
    //     // console.log(`Rx.fromObject.update  diff: ${ JSON.stringify(diff) }`);
    //     if (diff.length === 0) return; // No changes
    //     value = {
    //       ...value,
    //       ...toMerge
    //     }
    //     diffEvent.set(diff);
    //   }
    //   setEvent.set(value);
    // }
    const dispose = (reason)=>{
        if (disposed) return;
        //diffEvent.dispose(reason);
        setEvent.dispose(reason);
        disposed = true;
    };
    const r = {
        dispose,
        isDisposed () {
            return disposed;
        },
        last: ()=>value,
        on: setEvent.on,
        onArray: arrayEvent.on,
        onValue: setEvent.onValue,
        setAt,
        push,
        deleteAt,
        deleteWhere,
        insertAt,
        /**
     * Set the whole object
     */ set
    };
    return r;
}
; // CONCATENATED MODULE: ../rx/src/from/boolean.ts
/* eslint-disable @typescript-eslint/unbound-method */ function boolean_boolean(initialValue) {
    let value = initialValue;
    const events = initStream();
    const set = (v)=>{
        value = v;
        events.set(v);
    };
    return {
        dispose: events.dispose,
        isDisposed: events.isDisposed,
        last: ()=>value,
        on: events.on,
        onValue: events.onValue,
        set
    };
}
; // CONCATENATED MODULE: ../rx/src/from/count.ts
/**
 * Produces an incrementing value. By default starts at 0 and counts
 * forever, incrementing every second.
 * 
 * ```js
 * const r = Rx.From.count();
 * r.onValue(c => {
 *  // 0, 1, 2, 3 ... every second
 * });
 * ```
 * 
 * The `limit` is exclusive
 * ```js
 * const r = Rx.From.count({limit:5});
 * // Yields 0,1,2,3,4
 * ```
 * 
 * If limit is less than start, it will count down instead.
 * ```js
 * const r = Rx.count({start:5, limit: 0});
 * // Yie:ds 5,4,3,2,1
 * ```
 * 
 * ```js
 * // Count 10, 12, 14 ... every 500ms
 * const r = Rx.From.count({ start: 10, amount: 2, interval: 500 });
 * ```
 * 
 * In addition to setting `limit` (which is exclusive), you can stop with an abort signal
 * ```js
 * const ac = new AbortController();
 * const r = Rx.From.count({signal:ac.signal});
 * ...
 * ac.abort(`stop`);
 * ```
 * @param options 
 */ function count_count(options = {}) {
    const lazy = options.lazy ?? `initial`;
    const interval1 = interval_type_intervalToMs(options.interval, 1000);
    const amount = options.amount ?? 1;
    const offset = options.offset ?? 0;
    let produced = 0;
    let value = offset;
    const done = (reason)=>{
        events.dispose(reason);
    };
    const timer = continuously(()=>{
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
    }, interval1);
    const events = initLazyStream({
        onStart () {
            timer.start();
        },
        onStop () {
            timer.cancel();
        },
        onDispose () {
            timer.cancel();
        },
        lazy
    });
    return events;
}
; // CONCATENATED MODULE: ../rx/src/from/derived.ts
function derived(fn, reactiveSources, options = {}) {
    const ignoreIdentical = options.ignoreIdentical ?? true;
    const eq = options.eq ?? isEqualValueDefault;
    const sources = combineLatestToObject(reactiveSources);
    const handle = (v)=>{
        const last = output.last();
        const vv = fn(v);
        if (vv !== undefined) {
            if (ignoreIdentical && last !== undefined) {
                if (eq(vv, last)) return vv;
            }
            output.set(vv);
        }
        return vv;
    };
    // When the combined stream emits a value, output it
    const s = initUpstream(sources, {
        ...options,
        onValue (v) {
            handle(v);
        }
    });
    const output = cache(s, fn(sources.last()));
    return output;
}
; // CONCATENATED MODULE: ../core/src/elapsed.ts
//import { intervalToMs, type Interval } from './IntervalType.js';
//import { elapsedMillisecondsAbsolute, relative } from './Timer.js';
/**
 * Returns elapsed time since the initial call.
 * ```js
 * // Record start
 * const elapsed = elapsedSince();
 *
 * // Get elapsed time in millis
 * // since Elapsed.since()
 * elapsed(); // Yields number
 * ```
 *
 * If you want to initialise a stopwatch, but not yet start it, consider:
 * ```js
 * // Init
 * let state = {
 *  clicked: Stopwatch.infinity()
 * };
 *
 * state.click(); // Returns a giant value
 *
 * // Later, when click happens:
 * state = { click: elapsedSince() }
 * ```
 *
 * See also:
 * * {@link elapsedOnce} if you want to measure a single period, and stop it.
 * * {@link elapsedInterval} time _between_ calls
 * @returns
 */ const elapsedSince = ()=>{
    const start = performance.now();
    return ()=>{
        return performance.now() - start;
    };
};
/**
 * Returns the interval between the start and each subsequent call.
 * 
 * ```js
 * const interval = elapsedInterval();
 * interval(); // Time from elapsedInterval()
 * interval(); // Time since last interval() call
 * ```
 * 
 * See also:
 * * {@link elapsedSince}: time since first call
 * * {@link elapsedOnce}: time between two events
 * @returns 
 */ const elapsedInterval = ()=>{
    let start = performance.now();
    return ()=>{
        const now = performance.now();
        const x = now - start;
        start = now;
        return x;
    };
};
/**
 * Returns elapsed time since initial call, however
 * unlike {@link elapsedSince}, timer stops when first invoked.
 *
 * ```js
 * const elapsed = elapsedOnce();
 * // ...do stuff
 * elapsed(); // Yields time since elapsedOnce() was called
 * // ...do more stuff
 * elapsed(); // Is still the same number as above
 * ```
 * 
 * See also:
 * * {@link elapsedSince}: elapsed time
 * * {@link elapsedInterval}: time _between_ calls
 * @returns
 */ const elapsedOnce = ()=>{
    const start = Date.now();
    let stoppedAt = 0;
    return ()=>{
        if (stoppedAt === 0) {
            stoppedAt = Date.now() - start;
        }
        return stoppedAt;
    };
};
/**
 * Returns a function that reports an 'infinite' elapsed time.
 * this can be useful as an initialiser for `elapsedSince` et al.
 *
 * ```js
 * // Init clicked to be an infinite time
 * let clicked = elapsedInfinity();
 *
 * document.addEventListener('click', () => {
 *  // Now that click has happened, we can assign it properly
 *  clicked = Stopwatch.since();
 * });
 * ```
 * @returns
 */ const elapsedInfinity = ()=>{
    return ()=>{
        return Number.POSITIVE_INFINITY;
    };
};
; // CONCATENATED MODULE: ../rx/src/from/event.ts
/**
 * Fired when `eventName` fires on `target`. 
 * 
 * Rather than whole event args being emitted on the stream,
 * it plucks a field from the event args, or if that's missing, from the target.
 * 
 * ```js
 * // Emits the the value of a field named 'x'
 * // on the change event args
 * eventField(el, `pointermove`, `x`);
 * ```
 * @param targetOrQuery Event target, HTML element or HTML query (eg '#someId') 
 * @param eventName Name of event, eg. 'pointermove'
 * @param fieldName Name of field, eg 'x'
 * @param initialValue Initial data
 * @param options Options for source
 */ function eventField(targetOrQuery, eventName, fieldName, initialValue, options = {}) {
    const initial = {};
    initial[fieldName] = initialValue;
    const rxField = field_field(event_event(targetOrQuery, eventName, initial, options), fieldName, options);
    return rxField;
}
//export function event<V extends Record<string, any>>(target: EventTarget | null | string, name: string, options: EventOptions<V>): ReactiveNonInitial<V> & ReactiveDisposable<V>;
//export function event<V extends Record<string, any>>(target: EventTarget | null | string, name: string, options?: Optional<EventOptions<V>, `transform`>): ReactiveNonInitial<V> & ReactiveDisposable<V>;
/**
 * Subscribes to an event, emitting data
 * 
 * @example Print x,y position of mouse as it moves
 * ```js
 * const r = Rx.From.event(document, `pointermove`);
 * r.onValue(event => {
 *  const { x, y } = event;
 * });
 * ```
 * 
 * If `options.lazy` is _true_ (default: _false_), event will only be subscribed to when the stream
 * itself has a subscriber.
 * 
 * `options.debugFiring` and `options.debugLifecycle` can be turned on to troubleshoot behaviour
 * of the stream if necessary.
 * @param targetOrQuery Event emitter, HTML element or string. If a string, it will be queryed as a selector.
 * @param name Event name
 * @param options Options
 * @returns 
 */ function event_event(targetOrQuery, name, initialValue, options = {}) {
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
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (initialValue === undefined) initialValue = {};
    const rxObject = object_object(initialValue, {
        deepEntries: true
    });
    let eventAdded = false;
    let disposed = false;
    const callback = (args)=>{
        if (debugFiring) console.log(`Reactive.event '${name}' firing '${JSON.stringify(args)}`);
        rxObject.set(args);
    };
    const remove = ()=>{
        if (!eventAdded) return;
        eventAdded = false;
        target.removeEventListener(name, callback);
        if (debugLifecycle) {
            console.log(`Rx.From.event remove '${name}'`);
        }
    };
    const add = ()=>{
        if (eventAdded) return;
        eventAdded = true;
        target.addEventListener(name, callback);
        if (debugLifecycle) {
            console.log(`Rx.From.event add '${name}'`);
        }
    };
    if (!lazy) add();
    return {
        last: ()=>{
            if (lazy) add();
            return rxObject.last();
        },
        dispose: (reason)=>{
            if (disposed) return;
            disposed = true;
            remove();
            rxObject.dispose(reason);
        },
        isDisposed () {
            return disposed;
        },
        on: (handler)=>{
            if (lazy) add();
            return rxObject.on(handler);
        },
        onValue: (handler)=>{
            if (lazy) add();
            return rxObject.onValue(handler);
        }
    };
}
/**
 * Emits a value whenever event happens.
 * Data emitted is `{ sinceLast, total }`, where 'sinceLast'
 * is milliseconds since last event and 'total' is total number of 
 * times event has been fired.
 * @param targetOrQuery 
 * @param name 
 * @param options 
 * @returns 
 */ function eventTrigger(targetOrQuery, name, options = {}) {
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
    let count = 0;
    const elapsed = elapsedInterval();
    const stream = initLazyStream({
        lazy: options.lazy ?? `very`,
        onStart () {
            target.addEventListener(name, callback);
            if (debugLifecycle) {
                console.log(`Rx.From.eventTrigger add '${name}'`);
            }
            if (fireInitial && count === 0) {
                if (debugLifecycle || debugFiring) console.log(`Rx.From.eventTrigger: firing initial`);
                callback();
            }
        },
        onStop () {
            target.removeEventListener(name, callback);
            if (debugLifecycle) {
                console.log(`Rx.From.eventTrigger remove '${name}'`);
            }
        }
    });
    const callback = (_args)=>{
        if (debugFiring) console.log(`Rx.From.eventTrigger '${name}' triggered'`);
        stream.set({
            sinceLast: elapsed(),
            total: ++count
        });
    };
    return stream;
}
; // CONCATENATED MODULE: ../rx/src/from/merged.ts
/**
 * Returns a stream that merges the output of a list of homogenous streams.
 * Use {@link mergedWithOptions} to specify additional options.
 * @param sources 
 * @returns 
 */ function merged(...sources) {
    return mergedWithOptions(sources);
}
/**
 * Returns a stream that merges the output of a list of homogenous streams.
 * 
 * @param sources 
 * @param options 
 * @returns 
 */ function mergedWithOptions(sources, options = {}) {
    let unsubs = [];
    const stream = initLazyStream({
        ...options,
        onStart () {
            for (const s of sources){
                unsubs.push(s.onValue((v)=>{
                    stream.set(v);
                }));
            }
        },
        onStop () {
            for (const un of unsubs){
                un();
            }
            unsubs = [];
        }
    });
    return stream;
}
; // CONCATENATED MODULE: ../rx/src/from/number.ts
/* eslint-disable @typescript-eslint/unbound-method */ function number(initialValue) {
    let value = initialValue;
    const events = initStream();
    const set = (v)=>{
        value = v;
        events.set(v);
    };
    return {
        dispose: events.dispose,
        isDisposed: events.isDisposed,
        last: ()=>value,
        on: events.on,
        onValue: events.onValue,
        set
    };
}
; // CONCATENATED MODULE: ../rx/src/from/object-proxy.ts
/**
 * Creates a proxy of `target` object (or array), so that regular property setting will be intercepted and output
 * on a {@link Reactive} object as well.
 * 
 * ```js
 * const { proxy, rx } = Rx.From.objectProxy({ colour: `red`, x: 10, y: 20 });
 * 
 * rx.onValue(v => {
 *  // Get notified when proxy is changed
 * });
 * 
 * // Get and set properties as usual
 * console.log(proxy.x);
 * proxy.x = 20; // Triggers Reactive
 * ```
 * 
 * Keep in mind that changing `target` directly won't affect the proxied object or Reactive. Thus,
 * only update the proxied object after calling `fromProxy`.
 * 
 * The benefit of `objectProxy` instead of {@link Rx.From.object} is because the proxied object can be passed to other code that doesn't need
 * to know anything about Reactive objects.
 * 
 * You can assign the return values to more meaningful names using
 * JS syntax.
 * ```js
 * const { proxy:colour, rx:colourRx } = Rx.From.objectProxy({ colour: `red` });
 * ```
 * 
 * If `target` is an array, it's not possible to change the shape of the array by adding or removing
 * elements, only by updating existing ones. This follows the same behaviour of objects. Alternatively, use {@link arrayProxy}.
 * 
 * See also:
 * * {@link objectProxySymbol}: Instead of {proxy,rx} return result, puts the `rx` under a symbol on the proxy.
 * * {@link arrayProxy}: Proxy an array, allowing inserts and deletes.
 * @param target 
 * @returns 
 */ const objectProxy = (target)=>{
    const rx = object_object(target);
    const proxy = new Proxy(target, {
        set (target, p, newValue, _receiver) {
            const isArray = Array.isArray(target);
            //console.log(`Rx.Sources.object set. Target: ${ JSON.stringify(target) } (${ typeof target } array: ${ Array.isArray(target) }) p: ${ JSON.stringify(p) } (${ typeof p }) newValue: ${ JSON.stringify(newValue) } recv: ${ _receiver }`);
            // Ignore length if target is array
            if (isArray && p === `length`) return true;
            if (typeof p === `string`) {
                rx.updateField(p, newValue);
            }
            // If target is array and field looks like an array index...
            if (isArray && typeof p === `string`) {
                const pAsNumber = Number.parseInt(p);
                if (!Number.isNaN(pAsNumber)) {
                    target[pAsNumber] = newValue;
                    return true;
                }
            }
            target[p] = newValue;
            return true;
        }
    });
    return {
        proxy,
        rx
    };
};
const arrayProxy = (target)=>{
    const rx = arrayObject(target);
    const proxy = new Proxy(target, {
        set (target, p, newValue, _receiver) {
            //console.log(`Rx.Sources.arrayProxy set. Target: ${ JSON.stringify(target) } (${ typeof target } array: ${ Array.isArray(target) }) p: ${ JSON.stringify(p) } (${ typeof p }) newValue: ${ JSON.stringify(newValue) } recv: ${ _receiver }`);
            // Ignore length if target is array
            if (p === `length`) return true;
            if (typeof p !== `string`) throw new Error(`Expected numeric index, got type: ${typeof p} value: ${JSON.stringify(p)}`);
            const pAsNumber = Number.parseInt(p);
            if (!Number.isNaN(pAsNumber)) {
                rx.setAt(pAsNumber, newValue);
                target[pAsNumber] = newValue;
                return true;
            } else {
                throw new Error(`Expected numeric index, got: '${p}'`);
            }
        }
    });
    return {
        proxy,
        rx
    };
};
/**
 * Same as {@link proxy}, but the return value is the proxied object along with 
 * the Reactive wrapped as symbol property.
 * 
 * ```js
 * const person = Rx.fromProxySymbol({name: `marie` });
 * person.name = `blah`;
 * person[Rx.symbol].on(msg => {
 *  // Value changed...
 * });
 * ```
 * 
 * This means of access can be useful as the return result
 * is a bit neater, being a single object instead of two. 
 * @param target 
 * @returns 
 */ const objectProxySymbol = (target)=>{
    const { proxy, rx } = objectProxy(target);
    const p = proxy;
    p[symbol] = rx;
    return p;
};
; // CONCATENATED MODULE: ../rx/src/from/observable.ts
/* eslint-disable @typescript-eslint/unbound-method */ /**
 * Creates a RxJs style observable
 * ```js
 * const o = observable(stream => {
 *  // Code to run for initialisation when we go from idle to at least one subscriber
 *  // Won't run again for additional subscribers, but WILL run again if we lose
 *  // all subscribers and then get one
 * 
 *  // To send a value:
 *  stream.set(someValue);
 * 
 *   // Optional: return function to call when all subscribers are removed
 *   return () => {
 *     // Code to run when all subscribers are removed
 *   }
 * });
 * ```
 * 
 * For example:
 * ```js
 * const xy = observable<(stream => {
 *  // Send x,y coords from PointerEvent
 *  const send = (event) => {
 *    stream.set({ x: event.x, y: event.y });
 *  }
 *  window.addEventListener(`pointermove`, send);
 *  return () => {
 *    // Unsubscribe
 *    window.removeEventListener(`pointermove`, send);
 *  }
 * });
 * 
 * xy.onValue(value => {
 *  console.log(value);
 * });
 * ```
 * @param init 
 * @returns 
 */ function observable(init) {
    const ow = observableWritable(init);
    return {
        dispose: ow.dispose,
        isDisposed: ow.isDisposed,
        on: ow.on,
        onValue: ow.onValue
    };
}
/**
 * As {@link observable}, but returns a Reactive that allows writing
 * @param init 
 * @returns 
 */ function observableWritable(init) {
    let onCleanup = ()=>{};
    const ow = src_manual({
        onFirstSubscribe () {
            onCleanup = init(ow);
        },
        onNoSubscribers () {
            if (onCleanup) onCleanup();
        }
    });
    return {
        ...ow,
        onValue: (callback)=>{
            return ow.on((message)=>{
                if (messageHasValue(message)) {
                    callback(message.value);
                }
            });
        }
    };
}
; // CONCATENATED MODULE: ../rx/src/from/string.ts
/* eslint-disable @typescript-eslint/unbound-method */ function string(initialValue) {
    let value = initialValue;
    const events = initStream();
    const set = (v)=>{
        value = v;
        events.set(v);
    };
    return {
        dispose: events.dispose,
        isDisposed: events.isDisposed,
        last: ()=>value,
        on: events.on,
        onValue: events.onValue,
        set
    };
}
; // CONCATENATED MODULE: ../rx/src/from/index.ts
; // CONCATENATED MODULE: ../rx/src/index.ts
function src_run(source, ...ops) {
    let s = resolveSource(source);
    for (const op of ops){
        // @ts-ignore
        s = op(s);
    }
    return s;
}
function writable(source, ...ops) {
    let s = resolveSource(source);
    const head = s;
    for (const op of ops){
        // @ts-ignore
        s = op(s);
    }
    const ss = s;
    return {
        ...ss,
        set (value) {
            if (isWritable(head)) {
                head.set(value);
            } else throw new Error(`Original source is not writable`);
        }
    };
//return s as Reactive<T2 | T3 | T4 | T5 | T6>;
//const raw = chainer<T1, T2, T3, T4, T5, T6>(...ops);
//return raw(source);
}
/**
 * Initialises a reactive that pipes values to listeners directly.
 * @returns 
 */ function src_manual(options = {}) {
    const events = initStream(options);
    return {
        dispose: events.dispose,
        isDisposed: events.isDisposed,
        set (value) {
            events.set(value);
        },
        on: events.on,
        onValue: events.onValue
    };
}
const Sinks = {
    setHtmlText: (options)=>{
        return (source)=>{
            setHtmlText(source, options);
        };
    }
};
const Ops = {
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
 */ annotate: (annotator)=>opify(annotate_annotate, annotator),
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
   */ annotateWithOp: (annotatorOp)=>opify(annotateWithOp, annotatorOp),
    /**
   * Takes a stream of values and chunks them up (by quantity or time elapsed),
   * emitting them as an array.
   * @param options 
   * @returns 
   */ chunk: (options)=>{
        return (source)=>{
            return chunk_chunk(source, options);
        };
    },
    cloneFromFields: ()=>{
        return (source)=>{
            return cloneFromFields(source);
        };
    },
    /**
 * Merges values from several sources into a single source that emits values as an array.
 * @param options 
 * @returns 
 */ combineLatestToArray: (options = {})=>{
        return (sources)=>{
            return combineLatestToArray(sources, options);
        };
    },
    /**
   * Merges values from several sources into a single source that emits values as an object.
   * @param options
   * @returns 
   */ combineLatestToObject: (options = {})=>{
        return (reactiveSources)=>{
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
 */ // debounce: <V>(options: Partial<DebounceOptions>): ReactiveOp<V, V> => {
    //   return (source: ReactiveOrSource<V>) => {
    //     return OpFns.debounce(source, options);
    //   }
    // },
    /**
   * Drops values from the input stream that match `predicate`
   * @param predicate If it returns _true_ value is ignored
   * @returns 
   */ drop: (predicate)=>opify(drop, predicate),
    /**
   * Every upstream value is considered the target for interpolation.
   * Output value interpolates by a given amount toward the target.
   * @returns 
   */ elapsed: ()=>opify(elapsed_elapsed),
    /**
   * Yields the value of a field from an input stream of values.
   * Eg if the source reactive emits `{ colour: string, size: number }`,
   * we might use `field` to pluck out the `colour` field, thus returning
   * a stream of string values.
   * @param fieldName 
   * @param options 
   * @returns 
   */ field: (fieldName, options)=>{
        return (source)=>{
            return field_field(source, fieldName, options);
        };
    },
    /**
   * Filters the input stream, only re-emitting values that pass the predicate
   * @param predicate If it returns _true_ value is allowed through
   * @returns 
   */ filter: (predicate)=>opify(filter_filter, predicate),
    /**
   * Every upstream value is considered the target for interpolation.
   * Output value interpolates by a given amount toward the target.
   * @param options 
   * @returns 
   */ interpolate: (options)=>opify(interpolate_interpolate, options),
    /**
 * Outputs the minimum numerical value of the stream.
 * A value is only emitted when minimum decreases.
 * @returns 
 */ min: (options)=>opify(math_min, options),
    /**
   * Outputs the maxium numerical value of the stream.
   * A value is only emitted when maximum increases.
   * @returns 
   */ max: (options)=>opify(math_max, options),
    sum: (options)=>opify(math_sum, options),
    average: (options)=>opify(math_average, options),
    tally: (options)=>opify(math_tally, options),
    rank: (rank, options)=>opify(math_rank, rank, options),
    pipe: (...streams)=>{
        return (source)=>{
            const resolved = resolveSource(source);
            const s = [
                resolved,
                ...streams
            ];
            return pipe(...s);
        };
    },
    singleFromArray: (options = {})=>{
        return (source)=>{
            return singleFromArray(source, options);
        };
    },
    split: (options = {})=>{
        return (source)=>{
            return split_split(source, options);
        };
    },
    splitLabelled: (labels)=>{
        return (source)=>{
            return splitLabelled(source, labels);
        };
    },
    switcher: (cases, options = {})=>{
        return (source)=>{
            return switcher(source, cases, options);
        };
    },
    syncToArray: (options = {})=>{
        return (reactiveSources)=>{
            return syncToArray(reactiveSources, options);
        };
    },
    syncToObject: (options = {})=>{
        return (reactiveSources)=>{
            return syncToObject(reactiveSources, options);
        };
    },
    tapProcess: (processor)=>{
        return (source)=>{
            return tapProcess(source, processor);
        };
    },
    tapStream: (divergedStream)=>{
        return (source)=>{
            return tapStream(source, divergedStream);
        };
    },
    tapOps: (...ops)=>{
        return (source)=>{
            return tapOps(source, ...ops);
        };
    },
    /**
 * Throttle values from the stream.
 * Only emits a value if some minimum time has elapsed.
 * @param options 
 * @returns 
 */ throttle: (options)=>opify(throttle, options),
    /**
   * Trigger a value if 'source' does not emit a value within an interval.
   * Trigger value can be a fixed value, result of function, or step through an iterator.
   * @param options 
   * @returns 
   */ timeoutValue: (options)=>{
        return (source)=>{
            return timeoutValue(source, options);
        };
    },
    timeoutPing: (options)=>{
        return (source)=>{
            return timeoutPing(source, options);
        };
    },
    transform: (transformer, options = {})=>{
        return (source)=>{
            return transform_transform(source, transformer, options);
        };
    },
    /**
  * Reactive where last (or a given initial) value is available to read
  * @param opts 
  * @returns 
  */ withValue: (opts)=>{
        return opify(withValue, opts);
    }
};
// export const chain = <TIn, TOut>(...ops: Array<ReactiveOp<TIn, TOut>>) => {
//   return (source: ReactiveOrSource<TIn>) => {
//     for (const op of ops) {
//       // @ts-expect-error
//       source = op(source);
//     }
//     return source as any as Reactive<TOut>;
//   }
// }
// export const chainStream = <TIn, TOut>(...ops: Array<ReactiveOp<TIn, TOut>>): ReactiveStream<TIn, TOut> => {
//   const stream = manual<TIn>();
//   const c = chain(...ops);
//   const x = c(stream);
//   return x;
// }
// function chainx<TIn, TOut>(...ops: Array<ReactiveOp<any, any>>) {
//   return (source: ReactiveOrSource<TIn>) => {
//     for (const op of ops) {
//       source = op(source);
//     }
//     return source as any as Reactive<TOut>;
//   }
// }
// export function runWithInitial<TIn, TOut>(initial: TOut, source: ReactiveOrSource<TIn>, ...ops: Array<ReactiveOp<any, any>>): ReactiveInitial<TOut> & ReactiveDisposable<TOut> {
//   let lastValue = initial;
//   const raw = prepareOps<TIn, TOut>(...ops);
//   const r = raw(source);
//   let disposed = false;
//   r.onValue(value => {
//     lastValue = value;
//   });
//   return {
//     ...r,
//     isDisposed() {
//       return disposed
//     },
//     dispose(reason) {
//       if (disposed) return;
//       if (isDisposable(r)) {
//         r.dispose(reason);
//       }
//       disposed = true;
//     },
//     last() {
//       return lastValue;
//     },
//   }
// }
/**
 * Grabs the next value emitted from `source`.
 * By default waits up to a maximum of one second.
 * Handles subscribing and unsubscribing.
 * 
 * ```js
 * const value = await Rx.takeNextValue(source);
 * ```
 * 
 * Throws an error if the source closes without
 * a value or the timeout is reached.
 * 
 * @param source 
 * @param maximumWait 
 * @returns 
 */ async function takeNextValue(source, maximumWait = 1000) {
    const rx = resolveSource(source);
    let off = ()=>{};
    let watchdog;
    const p = new Promise((resolve, reject)=>{
        off = rx.on((message)=>{
            if (watchdog) clearTimeout(watchdog);
            if (messageHasValue(message)) {
                off();
                resolve(message.value);
            } else {
                if (messageIsDoneSignal(message)) {
                    reject(new Error(`Source closed. ${message.context ?? ``}`));
                    off();
                }
            }
        });
        watchdog = setTimeout(()=>{
            watchdog = undefined;
            off();
            reject(new Error(`Timeout waiting for value (${JSON.stringify(maximumWait)})`));
        }, interval_type_intervalToMs(maximumWait));
    });
    return p;
}
/**
 * Connects reactive A to B, optionally transforming the value as it does so.
 * 
 * Returns a function to unsubcribe A->B
 * @param a 
 * @param b 
 * @param transform 
 */ const src_to = (a, b, transform, closeBonA = false)=>{
    const unsub = a.on((message)=>{
        if (messageHasValue(message)) {
            const value = transform ? transform(message.value) : message.value;
            b.set(value);
        } else if (messageIsDoneSignal(message)) {
            unsub();
            if (closeBonA) {
                b.dispose(`Source closed (${message.context ?? ``})`);
            }
        } else {
        // eslint-disable-nex Unsupported message: ${ JSON.stringify(message) }`);
        }
    });
    return unsub;
};
; // CONCATENATED MODULE: ./src/rx.ts
export { from_namespaceObject as From, Ops, Sinks, annotate_annotate as annotate, annotateWithOp, math_average as average, cache, chunk_chunk as chunk, cloneFromFields, combineLatestToArray, combineLatestToObject, computeWithPrevious, debounce_debounce as debounce, drop, elapsed_elapsed as elapsed, field_field as field, filter_filter as filter, hasLast, initLazyStream, initLazyStreamWithInitial, initStream, initUpstream, interpolate_interpolate as interpolate, isPingable, isReactive, isTrigger, isTriggerFunction, isTriggerGenerator, isTriggerValue, isWrapped, isWritable, src_manual as manual, math_max as max, messageHasValue, messageIsDoneSignal, messageIsSignal, math_min as min, opify, pipe, prepare, math_rank as rank, resolveSource, resolveTriggerValue, src_run as run, setHtmlText, singleFromArray, split_split as split, splitLabelled, math_sum as sum, switcher, symbol, syncToArray, syncToObject, takeNextValue, math_tally as tally, tapOps, tapProcess, tapStream, throttle, timeoutPing, timeoutValue, src_to as to, to_array_toArray as toArray, toArrayOrThrow, toGenerator, transform_transform as transform, valueToPing, withValue, wrap_wrap as wrap, writable };
