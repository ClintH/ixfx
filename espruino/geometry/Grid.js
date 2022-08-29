"use strict";
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
exports.cells = exports.rows = exports.visitorColumn = exports.visitFor = exports.visitorRow = exports.visitorRandom = exports.visitorRandomContiguous = exports.visitorBreadth = exports.visitorDepth = exports.visitor = exports.offset = exports.simpleLine = exports.getVectorFromCardinal = exports.offsetCardinals = exports.getLine = exports.cellMiddle = exports.neighbours = exports.crossDirections = exports.allDirections = exports.cellAtPoint = exports.rectangleForCell = exports.inside = exports.guardCell = exports.cellEquals = exports.cellKeyString = exports.isEqual = void 0;
var index_js_1 = require("./index.js");
var Guards_js_1 = require("../Guards.js");
var Clamp_js_1 = require("../data/Clamp.js");
var Arrays_js_1 = require("../collections/Arrays.js");
var Set_js_1 = require("../collections/Set.js");
var Map_js_1 = require("../collections/Map.js");
/**
 * Returns true if `cell` parameter is a cell with x,y fields.
 * Does not check validity of fields.
 *
 * @param cell
 * @return True if parameter is a cell
 */
var isCell = function (cell) {
    if (cell === undefined)
        return false;
    return ("x" in cell && "y" in cell);
};
/**
 * Returns true if `n` is a Neighbour type, eliminating NeighbourMaybe possibility
 *
 * @param n
 * @return
 */
var isNeighbour = function (n) {
    if (n === undefined)
        return false;
    if (n[1] === undefined)
        return false;
    return true;
};
/**
 * Returns _true_ if grids `a` and `b` are equal in value
 *
 * @param a
 * @param b
 * @return
 */
var isEqual = function (a, b) {
    if ("rows" in a && "cols" in a) {
        if ("rows" in b && "cols" in b) {
            if (a.rows !== b.rows || a.cols !== b.cols)
                return false;
        }
        else
            return false;
    }
    if ("size" in a) {
        if ("size" in b) {
            if (a.size !== b.size)
                return false;
        }
        else
            return false;
    }
    return true;
};
exports.isEqual = isEqual;
/**
 * Returns a key string for a cell instance
 * A key string allows comparison of instances by value rather than reference
 * @param v
 * @returns
 */
var cellKeyString = function (v) { return "Cell{".concat(v.x, ",").concat(v.y, "}"); };
exports.cellKeyString = cellKeyString;
/**
 * Returns true if two cells equal. Returns false if either cell (or both) are undefined
 *
 * @param a
 * @param b
 * @returns
 */
var cellEquals = function (a, b) {
    if (b === undefined)
        return false;
    if (a === undefined)
        return false;
    return a.x === b.x && a.y === b.y;
};
exports.cellEquals = cellEquals;
/**
 * Throws an exception if any of the cell's parameters are invalid
 * @private
 * @param cell
 * @param paramName
 * @param grid
 */
var guardCell = function (cell, paramName, grid) {
    if (paramName === void 0) { paramName = "Param"; }
    if (cell === undefined)
        throw new Error(paramName + " is undefined. Expecting {x,y}");
    if (cell.x === undefined)
        throw new Error(paramName + ".x is undefined");
    if (cell.y === undefined)
        throw new Error(paramName + ".y is undefined");
    if (!Number.isInteger(cell.x))
        throw new Error(paramName + ".x is non-integer");
    if (!Number.isInteger(cell.y))
        throw new Error(paramName + ".y is non-integer");
    if (grid !== undefined) {
        if (!(0, exports.inside)(grid, cell))
            throw new Error("".concat(paramName, " is outside of grid. Cell: ").concat(cell.x, ",").concat(cell.y, " Grid: ").concat(grid.cols, ", ").concat(grid.rows));
    }
};
exports.guardCell = guardCell;
/**
 * Throws an exception if any of the grid's parameters are invalid
 * @param grid
 * @param paramName
 */
var guardGrid = function (grid, paramName) {
    if (paramName === void 0) { paramName = "Param"; }
    if (grid === undefined)
        throw new Error("".concat(paramName, " is undefined. Expecting grid."));
    if (!("rows" in grid))
        throw new Error("".concat(paramName, ".rows is undefined"));
    if (!("cols" in grid))
        throw new Error("".concat(paramName, ".cols is undefined"));
    if (!Number.isInteger(grid.rows))
        throw new Error("".concat(paramName, ".rows is not an integer"));
    if (!Number.isInteger(grid.cols))
        throw new Error("".concat(paramName, ".cols is not an integer"));
};
/**
 * Returns _true_ if cell coordinates are above zero and within bounds of grid
 *
 * @param grid
 * @param cell
 * @return
 */
var inside = function (grid, cell) {
    if (cell.x < 0 || cell.y < 0)
        return false;
    if (cell.x >= grid.cols || cell.y >= grid.rows)
        return false;
    return true;
};
exports.inside = inside;
/**
 * Returns a visual rectangle of the cell, positioned from the top-left corner
 *
 * @param cell
 * @param grid
 * @return
 */
var rectangleForCell = function (cell, grid) {
    (0, exports.guardCell)(cell);
    var size = grid.size;
    var x = cell.x * size;
    var y = cell.y * size;
    var r = index_js_1.Rects.fromTopLeft({ x: x, y: y }, size, size);
    return r;
};
exports.rectangleForCell = rectangleForCell;
/**
 * Returns the cell at a specified visual coordinate
 *
 * @param position Position, eg in pixels
 * @param grid Grid
 * @return Cell at position or undefined if outside of the grid
 */
var cellAtPoint = function (position, grid) {
    var size = grid.size;
    if (position.x < 0 || position.y < 0)
        return;
    var x = Math.floor(position.x / size);
    var y = Math.floor(position.y / size);
    if (x >= grid.cols)
        return;
    if (y >= grid.rows)
        return;
    return { x: x, y: y };
};
exports.cellAtPoint = cellAtPoint;
/**
 * Returns a list of all cardinal directions
 */
exports.allDirections = Object.freeze(["n", "ne", "nw", "e", "s", "se", "sw", "w"]);
/**
 * Returns a list of + shaped directions (ie. excluding diaganol)
 */
exports.crossDirections = Object.freeze(["n", "e", "s", "w"]);
/**
 * Returns neighbours for a cell. If no `directions` are provided, it defaults to all.
 *
 * ```js
 * const n = neighbours = ({rows: 5, cols: 5}, {x:2, y:2} `wrap`);
 * {
 *  n: {x: 2, y: 1}
 *  s: {x: 2, y: 3}
 *  ....
 * }
 * ```
 * @returns Returns a map of cells, keyed by cardinal direction
 * @param grid Grid
 * @param cell Cell
 * @param bounds How to handle edges of grid
 * @param directions Directions to return
 */
var neighbours = function (grid, cell, bounds, directions) {
    if (bounds === void 0) { bounds = "undefined"; }
    var dirs = directions !== null && directions !== void 0 ? directions : exports.allDirections;
    var points = dirs.map(function (c) { return (0, exports.offset)(grid, cell, (0, exports.getVectorFromCardinal)(c), bounds); });
    return (0, Map_js_1.zipKeyValue)(dirs, points);
};
exports.neighbours = neighbours;
/**
 * Returns the visual midpoint of a cell (eg pixel coordinate)
 *
 * @param cell
 * @param grid
 * @return
 */
var cellMiddle = function (cell, grid) {
    (0, exports.guardCell)(cell);
    var size = grid.size;
    var x = cell.x * size; // + (grid.spacing ? cell.x * grid.spacing : 0);
    var y = cell.y * size; // + (grid.spacing ? cell.y * grid.spacing : 0);
    return Object.freeze({ x: x + size / 2, y: y + size / 2 });
};
exports.cellMiddle = cellMiddle;
/**
 * Returns the cells on the line of start and end, inclusive
 *
 * ```js
 * // Get cells that connect 0,0 and 10,10
 * const cells = getLine({x:0,y:0}, {x:10,y:10});
 * ```
 *
 * This function does not handle wrapped coordinates.
 * @param start Starting cell
 * @param end End cell
 * @returns
 */
var getLine = function (start, end) {
    // https://stackoverflow.com/a/4672319
    (0, exports.guardCell)(start);
    (0, exports.guardCell)(end);
    // eslint-disable-next-line functional/no-let
    var startX = start.x;
    // eslint-disable-next-line functional/no-let
    var startY = start.y;
    var dx = Math.abs(end.x - startX);
    var dy = Math.abs(end.y - startY);
    var sx = (startX < end.x) ? 1 : -1;
    var sy = (startY < end.y) ? 1 : -1;
    // eslint-disable-next-line functional/no-let
    var err = dx - dy;
    var cells = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
        // eslint-disable-next-line functional/immutable-data
        cells.push(Object.freeze({ x: startX, y: startY }));
        if (startX === end.x && startY === end.y)
            break;
        var e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            startX += sx;
        }
        if (e2 < dx) {
            err += dx;
            startY += sy;
        }
    }
    return cells;
};
exports.getLine = getLine;
/**
 * Returns cells that correspond to the cardinal directions at a specified distance
 *
 * @param grid Grid
 * @param steps Distance
 * @param start Start poiint
 * @param bound Logic for if bounds of grid are exceeded
 * @returns Cells corresponding to cardinals
 */
var offsetCardinals = function (grid, start, steps, bounds) {
    if (bounds === void 0) { bounds = "stop"; }
    guardGrid(grid, "grid");
    (0, exports.guardCell)(start, "start");
    (0, Guards_js_1.integer)(steps, "aboveZero", "steps");
    var directions = exports.allDirections;
    var vectors = directions.map(function (d) { return (0, exports.getVectorFromCardinal)(d, steps); });
    var cells = directions.map(function (d, i) { return (0, exports.offset)(grid, start, vectors[i], bounds); });
    return (0, Map_js_1.zipKeyValue)(directions, cells);
};
exports.offsetCardinals = offsetCardinals;
/**
 * Returns an `{ x, y }` signed vector corresponding to the provided cardinal direction.
 * ```js
 * const n = getVectorFromCardinal(`n`); // {x: 0, y: -1}
 * ```
 *
 * Optional `multiplier` can be applied to vector
 * ```js
 * const n = getVectorFromCardinal(`n`, 10); // {x: 0, y: -10}
 * ```
 *
 * Blank direction returns `{ x: 0, y: 0 }`
 * @param cardinal Direction
 * @param multiplier Multipler
 * @returns Signed vector in the form of `{ x, y }`
 */
var getVectorFromCardinal = function (cardinal, multiplier) {
    if (multiplier === void 0) { multiplier = 1; }
    // eslint-disable-next-line functional/no-let
    var v;
    switch (cardinal) {
        case "n":
            v = { x: 0, y: -1 * multiplier };
            break;
        case "ne":
            v = { x: 1 * multiplier, y: -1 * multiplier };
            break;
        case "e":
            v = { x: 1 * multiplier, y: 0 };
            break;
        case "se":
            v = { x: 1 * multiplier, y: 1 * multiplier };
            break;
        case "s":
            v = { x: 0, y: 1 * multiplier };
            break;
        case "sw":
            v = { x: -1 * multiplier, y: 1 * multiplier };
            break;
        case "w":
            v = { x: -1 * multiplier, y: 0 };
            break;
        case "nw":
            v = { x: -1 * multiplier, y: -1 * multiplier };
            break;
        default:
            v = { x: 0, y: 0 };
    }
    return Object.freeze(v);
};
exports.getVectorFromCardinal = getVectorFromCardinal;
/**
 * Returns a list of cells from `start` to `end`.
 *
 * Throws an error if start and end are not on same row or column.
 *
 * @param start Start cell
 * @param end end clel
 * @param endInclusive
 * @return Array of cells
 */
var simpleLine = function (start, end, endInclusive) {
    if (endInclusive === void 0) { endInclusive = false; }
    // eslint-disable-next-line functional/prefer-readonly-type
    var cells = [];
    if (start.x === end.x) {
        // Vertical
        var lastY = endInclusive ? end.y + 1 : end.y;
        // eslint-disable-next-line functional/no-let
        for (var y = start.y; y < lastY; y++) {
            // eslint-disable-next-line functional/immutable-data
            cells.push({ x: start.x, y: y });
        }
    }
    else if (start.y === end.y) {
        // Horizontal
        var lastX = endInclusive ? end.x + 1 : end.x;
        // eslint-disable-next-line functional/no-let
        for (var x = start.x; x < lastX; x++) {
            // eslint-disable-next-line functional/immutable-data
            cells.push({ x: x, y: start.y });
        }
    }
    else {
        throw new Error("Only does vertical and horizontal: ".concat(start.x, ",").concat(start.y, " - ").concat(end.x, ",").concat(end.y));
    }
    return cells;
};
exports.simpleLine = simpleLine;
/**
 *
 * Returns a coordinate offset from `start` by `vector` amount.
 *
 * Different behaviour can be specified for how to handle when coordinates exceed the bounds of the grid
 *
 *
 * Note: x and y wrapping are calculated independently. A large wrapping of x, for example won't shift down a line
 * @param grid Grid to traverse
 * @param vector Offset in x/y
 * @param start Start point
 * @param bounds
 * @returns Cell
 */
var offset = function (grid, start, vector, bounds) {
    if (bounds === void 0) { bounds = "undefined"; }
    (0, exports.guardCell)(start, "start", grid);
    (0, exports.guardCell)(vector);
    guardGrid(grid, "grid");
    // eslint-disable-next-line functional/no-let
    var x = start.x;
    // eslint-disable-next-line functional/no-let
    var y = start.y;
    switch (bounds) {
        case "wrap":
            x += vector.x % grid.cols;
            y += vector.y % grid.rows;
            if (x < 0)
                x = grid.cols + x;
            else if (x >= grid.cols) {
                x -= grid.cols;
            }
            if (y < 0)
                y = grid.rows + y;
            else if (y >= grid.rows) {
                y -= grid.rows;
            }
            break;
        case "stop":
            x += vector.x;
            y += vector.y;
            x = (0, Clamp_js_1.clampIndex)(x, grid.cols);
            y = (0, Clamp_js_1.clampIndex)(y, grid.rows);
            break;
        case "undefined":
            x += vector.x;
            y += vector.y;
            if (x < 0 || y < 0)
                return;
            if (x >= grid.cols || y >= grid.rows)
                return;
            break;
        case "unbounded":
            x += vector.x;
            y += vector.y;
            break;
        default:
            throw new Error("Unknown BoundsLogic case ".concat(bounds));
    }
    return Object.freeze({ x: x, y: y });
};
exports.offset = offset;
var neighbourList = function (grid, cell, directions, bounds) {
    // Get neighbours for cell
    var cellNeighbours = (0, exports.neighbours)(grid, cell, bounds, directions);
    // Filter out undefined cells
    var entries = Object.entries(cellNeighbours);
    return entries.filter(isNeighbour);
};
/**
 * Visits every cell in grid using supplied selection function
 * In-built functions to use: visitorDepth, visitorBreadth, visitorRandom,
 * visitorColumn, visitorRow.
 *
 * Usage example:
 * ```js
 *  let visitor = Grids.visitor(Grids.visitorRandom, grid, startCell);
 *  for (let cell of visitor) {
 *   // do something with cell
 *  }
 * ```
 *
 * If you want to keep tabs on the visitor, pass in a MutableValueSet. This is
 * updated with visited cells (and is used internally anyway)
 * ```js
 *  let visited = new mutableValueSet<Grids.Cell>(c => Grids.cellKeyString(c));
 *  let visitor = Grids.visitor(Grids.visitorRandom, grid, startCell, visited);
 * ```
 *
 * To visit with some delay, try this pattern
 * ```js
 *  const delayMs = 100;
 *  const run = () => {
 *   let cell = visitor.next().value;
 *   if (cell === undefined) return;
 *   // Do something with cell
 *   setTimeout(run, delayMs);
 *  }
 *  setTimeout(run, delayMs);
 * ```
 * @param neighbourSelect Select neighbour to visit
 * @param grid Grid to visit
 * @param start Starting cell
 * @param visited Optional tracker of visited cells
 * @returns Cells
 */
// eslint-disable-next-line functional/prefer-readonly-type
var visitor = function (logic, grid, start, opts) {
    var v, possibleNeighbours, cellQueue, moveQueue, current, nv, nextSteps, potential;
    var _a;
    if (opts === void 0) { opts = {}; }
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                guardGrid(grid, "grid");
                (0, exports.guardCell)(start, "start", grid);
                v = (_a = opts.visited) !== null && _a !== void 0 ? _a : (0, Set_js_1.setMutable)(function (c) { return (0, exports.cellKeyString)(c); });
                possibleNeighbours = logic.options ? logic.options : function (g, c) { return neighbourList(g, c, exports.crossDirections, "undefined"); };
                if (!isCell(start))
                    throw new Error("'start' parameter is undefined or not a cell");
                cellQueue = [start];
                moveQueue = [];
                current = null;
                _b.label = 1;
            case 1:
                if (!(cellQueue.length > 0)) return [3 /*break*/, 4];
                // console.log(`cell queue: ${cellQueue.length} move queue: ${moveQueue.length} current: ${JSON.stringify(current)}` );
                if (current === null) {
                    nv = cellQueue.pop();
                    if (nv === undefined) {
                        // console.log(`cellQueue drained`);
                        return [3 /*break*/, 4];
                    }
                    current = nv;
                }
                if (!!v.has(current)) return [3 /*break*/, 3];
                v.add(current);
                return [4 /*yield*/, (current)];
            case 2:
                _b.sent();
                nextSteps = possibleNeighbours(grid, current)
                    .filter(function (step) { return !v.has(step[1]); });
                if (nextSteps.length === 0) {
                    // No more moves for this cell
                    if (current !== null) {
                        cellQueue = cellQueue.filter(function (cq) { return (0, exports.cellEquals)(cq, current); });
                    }
                }
                else {
                    // eslint-disable-next-line functional/immutable-data
                    moveQueue.push.apply(moveQueue, nextSteps);
                }
                _b.label = 3;
            case 3:
                // Remove steps already made
                moveQueue = moveQueue.filter(function (step) { return !v.has(step[1]); });
                if (moveQueue.length === 0) {
                    // console.log(`moveQueue empty`);
                    current = null;
                }
                else {
                    potential = logic.select(moveQueue);
                    if (potential !== undefined) {
                        // eslint-disable-next-line functional/immutable-data
                        cellQueue.push(potential[1]);
                        current = potential[1];
                    }
                }
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
};
exports.visitor = visitor;
var visitorDepth = function (grid, start, opts) {
    if (opts === void 0) { opts = {}; }
    return (0, exports.visitor)({
        select: function (nbos) { return nbos[nbos.length - 1]; }
    }, grid, start, opts);
};
exports.visitorDepth = visitorDepth;
var visitorBreadth = function (grid, start, opts) {
    if (opts === void 0) { opts = {}; }
    return (0, exports.visitor)({
        select: function (nbos) { return nbos[0]; }
    }, grid, start, opts);
};
exports.visitorBreadth = visitorBreadth;
var randomNeighbour = function (nbos) { return (0, Arrays_js_1.randomElement)(nbos); }; // .filter(isNeighbour));
var visitorRandomContiguous = function (grid, start, opts) {
    if (opts === void 0) { opts = {}; }
    return (0, exports.visitor)({
        select: randomNeighbour
    }, grid, start, opts);
};
exports.visitorRandomContiguous = visitorRandomContiguous;
var visitorRandom = function (grid, start, opts) {
    if (opts === void 0) { opts = {}; }
    return (0, exports.visitor)({
        options: function (grid, cell) {
            var t = [];
            for (var _i = 0, _a = (0, exports.cells)(grid, cell); _i < _a.length; _i++) {
                var c = _a[_i];
                // eslint-disable-next-line functional/immutable-data
                t.push(["n", c]);
            }
            return t;
        },
        select: randomNeighbour
    }, grid, start, opts);
};
exports.visitorRandom = visitorRandom;
var visitorRow = function (grid, start, opts) {
    if (opts === void 0) { opts = {}; }
    var _a = opts.reversed, reversed = _a === void 0 ? false : _a;
    var neighbourSelect = function (nbos) { return nbos.find(function (n) { return n[0] === (reversed ? "w" : "e"); }); };
    var possibleNeighbours = function (grid, cell) {
        if (reversed) {
            // WALKING BACKWARD ALONG RONG
            if (cell.x > 0) {
                // All fine, step to the left
                cell = { x: cell.x - 1, y: cell.y };
            }
            else {
                // At the beginning of a row
                if (cell.y > 0) {
                    // Wrap to next row up
                    cell = { x: grid.cols - 1, y: cell.y - 1 };
                }
                else {
                    // Wrap to end of grid
                    cell = { x: grid.cols - 1, y: grid.rows - 1 };
                }
            }
        }
        else {
            /*
             * WALKING FORWARD ALONG ROWS
             * console.log(`${cell.x}, ${cell.y}`);
             */
            if (cell.x < grid.rows - 1) {
                // All fine, step to the right
                cell = { x: cell.x + 1, y: cell.y };
            }
            else {
                // At the end of a row
                if (cell.y < grid.rows - 1) {
                    // More rows available, wrap to next row down
                    cell = { x: 0, y: cell.y + 1 };
                }
                else {
                    // No more rows available, wrap to start of the grid
                    cell = { x: 0, y: 0 };
                }
            }
        }
        return [[(reversed ? "w" : "e"), cell]];
    };
    var logic = {
        select: neighbourSelect,
        options: possibleNeighbours
    };
    return (0, exports.visitor)(logic, grid, start, opts);
};
exports.visitorRow = visitorRow;
/**
 * Runs the provided `visitor` for `steps`, returning the cell we end at
 *
 * ```js
 * // Get a cell 10 steps away (row-wise) from start
 * const cell = visitFor(grid, start, 10, visitorRow);
 * ```
 * @param grid Grid to traverse
 * @param start Start point
 * @param steps Number of steps
 * @param visitor Visitor function
 * @returns
 */
var visitFor = function (grid, start, steps, visitor) {
    (0, Guards_js_1.integer)(steps, "", "steps");
    var opts = {
        reversed: steps < 0
    };
    steps = Math.abs(steps);
    // eslint-disable-next-line functional/no-let
    var c = start;
    // eslint-disable-next-line functional/no-let
    var v = visitor(grid, start, opts);
    v.next(); // Burn up starting cell
    // eslint-disable-next-line functional/no-let
    var stepsMade = 0;
    while (stepsMade < steps) {
        stepsMade++;
        var value = v.next().value;
        if (value) {
            c = value;
            if (opts.debug)
                console.log("stepsMade: ".concat(stepsMade, " cell: ").concat(c.x, ", ").concat(c.y, " reverse: ").concat(opts.reversed));
        }
        else {
            if (steps >= grid.cols * grid.rows) {
                steps -= grid.cols * grid.rows;
                stepsMade = 0;
                v = visitor(grid, start, opts);
                v.next();
                c = start;
                if (opts.debug)
                    console.log("resetting visitor to ".concat(steps));
            }
            else
                throw new Error("Value not received by visitor");
        }
    }
    return c;
};
exports.visitFor = visitFor;
/**
 * Visits cells running down columns, left-to-right.
 * @param grid Grid to traverse
 * @param start Start cell
 * @param opts Options
 * @returns Visitor generator
 */
var visitorColumn = function (grid, start, opts) {
    if (opts === void 0) { opts = {}; }
    var _a = opts.reversed, reversed = _a === void 0 ? false : _a;
    var logic = {
        select: function (nbos) { return nbos.find(function (n) { return n[0] === (reversed ? "n" : "s"); }); },
        options: function (grid, cell) {
            if (reversed) {
                // WALK UP COLUMN, RIGHT-TO-LEFT
                if (cell.y > 0) {
                    // Easy case
                    cell = { x: cell.x, y: cell.y - 1 };
                }
                else {
                    // Top of column
                    if (cell.x === 0) {
                        // Top-left corner, need to wrap
                        cell = { x: grid.cols - 1, y: grid.rows - 1 };
                    }
                    else {
                        cell = { x: cell.x - 1, y: grid.rows - 1 };
                    }
                }
            }
            else {
                // WALK DOWN COLUMNS, LEFT-TO-RIGHT
                if (cell.y < grid.rows - 1) {
                    // Easy case, move down by one
                    cell = { x: cell.x, y: cell.y + 1 };
                }
                else {
                    // End of column
                    if (cell.x < grid.cols - 1) {
                        // Move to next column and start at top
                        cell = { x: cell.x + 1, y: 0 };
                    }
                    else {
                        // Move to start of grid
                        cell = { x: 0, y: 0 };
                    }
                }
            }
            return [[reversed ? "n" : "s", cell]];
        }
    };
    return (0, exports.visitor)(logic, grid, start, opts);
};
exports.visitorColumn = visitorColumn;
/**
 * Enumerate rows of grid, returning all the cells in the row
 * ```js
 * for (const row of Grid.rows(shape)) {
 *  // row is an array of Cells.
 * }
 * ```
 * @param grid
 * @param start
 */
var rows = function (grid, start) {
    var row, rowCells, _i, _a, c;
    if (start === void 0) { start = { x: 0, y: 0 }; }
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                row = start.y;
                rowCells = [];
                _i = 0, _a = (0, exports.cells)(grid, start);
                _b.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 5];
                c = _a[_i];
                if (!(c.y !== row)) return [3 /*break*/, 3];
                return [4 /*yield*/, rowCells];
            case 2:
                _b.sent();
                rowCells = [c];
                row = c.y;
                return [3 /*break*/, 4];
            case 3:
                //eslint-disable-next-line functional/immutable-data
                rowCells.push(c);
                _b.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 1];
            case 5:
                if (!(rowCells.length > 0)) return [3 /*break*/, 7];
                return [4 /*yield*/, rowCells];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7: return [2 /*return*/];
        }
    });
};
exports.rows = rows;
/**
 * Enumerate all cells in an efficient manner. Runs left-to-right, top-to-bottom.
 * If end of grid is reached, iterator will wrap to ensure all are visited.
 *
 * @param grid
 * @param start
 */
var cells = function (grid, start) {
    var x, y, canMove;
    if (start === void 0) { start = { x: 0, y: 0 }; }
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                guardGrid(grid, "grid");
                (0, exports.guardCell)(start, "start", grid);
                x = start.x, y = start.y;
                canMove = true;
                _a.label = 1;
            case 1: return [4 /*yield*/, { x: x, y: y }];
            case 2:
                _a.sent();
                x++;
                if (x === grid.cols) {
                    y++;
                    x = 0;
                }
                if (y === grid.rows) {
                    y = 0;
                    x = 0;
                }
                if (x === start.x && y === start.y)
                    canMove = false; // Complete
                _a.label = 3;
            case 3:
                if (canMove) return [3 /*break*/, 1];
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
};
exports.cells = cells;
//# sourceMappingURL=Grid.js.map