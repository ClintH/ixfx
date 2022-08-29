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
exports.eventsToIterable = exports.isIterable = exports.isAsyncIterable = void 0;
var isAsyncIterable = function (v) { return Symbol.asyncIterator in Object(v); };
exports.isAsyncIterable = isAsyncIterable;
var isIterable = function (v) { return Symbol.iterator in Object(v); };
exports.isIterable = isIterable;
var eventsToIterable = function (eventSource, eventType) {
    var pullQueue = [];
    var pushQueue = [];
    //eslint-disable-next-line functional/no-let
    var done = false;
    var pushValue = function (args) { return __awaiter(void 0, void 0, void 0, function () {
        var resolver;
        return __generator(this, function (_a) {
            if (pullQueue.length !== 0) {
                resolver = pullQueue.shift();
                resolver.apply(void 0, args);
            }
            else {
                pushQueue.push(args);
            }
            return [2 /*return*/];
        });
    }); };
    var pullValue = function () { return new Promise(function (resolve) {
        if (pushQueue.length !== 0) {
            var args = pushQueue.shift();
            // @ts-ignore
            resolve.apply(void 0, args);
        }
        else {
            pullQueue.push(resolve);
        }
    }); };
    var handler = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        pushValue(args);
    };
    eventSource.addEventListener(eventType, handler);
    var r = {
        next: function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (done)
                            return [2 /*return*/, { done: true, value: undefined }];
                        _a = {
                            done: false
                        };
                        return [4 /*yield*/, pullValue()];
                    case 1: return [2 /*return*/, (_a.value = _b.sent(),
                            _a)];
                }
            });
        }); },
        "return": function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                done = true;
                eventSource.removeEventListener(eventType, handler);
                return [2 /*return*/, { done: true, value: undefined }];
            });
        }); },
        "throw": function (error) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                done = true;
                return [2 /*return*/, {
                        done: true,
                        value: Promise.reject(error)
                    }];
            });
        }); }
    };
    return r;
};
exports.eventsToIterable = eventsToIterable;
//# sourceMappingURL=Iterable.js.map