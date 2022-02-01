var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};

// src/geometry/Line.ts
var Line_exports = {};
__export(Line_exports, {
  angleRadian: () => angleRadian,
  bbox: () => bbox2,
  compute: () => compute,
  distance: () => distance2,
  equals: () => equals2,
  extendFromStart: () => extendFromStart,
  extendX: () => extendX,
  fromArray: () => fromArray,
  fromNumbers: () => fromNumbers2,
  fromPoints: () => fromPoints,
  fromPointsToPath: () => fromPointsToPath,
  guard: () => guard3,
  isLine: () => isLine,
  joinPointsToLines: () => joinPointsToLines,
  length: () => length,
  nearest: () => nearest,
  slope: () => slope,
  toFlatArray: () => toFlatArray,
  toPath: () => toPath,
  toString: () => toString2,
  toSvgString: () => toSvgString,
  withinRange: () => withinRange2
});

// src/geometry/Point.ts
var Point_exports = {};
__export(Point_exports, {
  bbox: () => bbox,
  compareTo: () => compareTo,
  diff: () => diff,
  distance: () => distance,
  equals: () => equals,
  from: () => from,
  fromNumbers: () => fromNumbers,
  guard: () => guard,
  isPoint: () => isPoint,
  lerp: () => lerp,
  multiply: () => multiply,
  sum: () => sum,
  toArray: () => toArray,
  toString: () => toString,
  withinRange: () => withinRange
});

// src/geometry/Rect.ts
var Rect_exports = {};
__export(Rect_exports, {
  fromCenter: () => fromCenter,
  fromElement: () => fromElement,
  fromTopLeft: () => fromTopLeft,
  getCenter: () => getCenter,
  getCorners: () => getCorners,
  getLines: () => getLines,
  guard: () => guard2,
  isEqual: () => isEqual,
  maxFromCorners: () => maxFromCorners
});
var fromElement = (el) => ({ width: el.clientWidth, height: el.clientHeight });
var isEqual = (a2, b) => a2.width === b.width && a2.height === b.height;
var fromCenter = (origin, width, height) => {
  guard(origin, `origin`);
  guardDim(width, `width`);
  guardDim(height, `height`);
  const halfW = width / 2;
  const halfH = height / 2;
  return { x: origin.x - halfW, y: origin.y - halfH, width, height };
};
var maxFromCorners = (topLeft, topRight, bottomRight, bottomLeft) => {
  if (topLeft.y > bottomRight.y)
    throw new Error(`topLeft.y greater than bottomRight.y`);
  if (topLeft.y > bottomLeft.y)
    throw new Error(`topLeft.y greater than bottomLeft.y`);
  const w1 = topRight.x - topLeft.x;
  const w2 = bottomRight.x - bottomLeft.x;
  const h1 = Math.abs(bottomLeft.y - topLeft.y);
  const h2 = Math.abs(bottomRight.y - topRight.y);
  return {
    x: Math.min(topLeft.x, bottomLeft.x),
    y: Math.min(topRight.y, topLeft.y),
    width: Math.max(w1, w2),
    height: Math.max(h1, h2)
  };
};
var guardDim = (d, name = `Dimension`) => {
  if (d === void 0)
    throw Error(`${name} is undefined`);
  if (isNaN(d))
    throw Error(`${name} is NaN`);
  if (d < 0)
    throw Error(`${name} cannot be negative`);
};
var guard2 = (rect2, name = `rect`) => {
  if (rect2 === void 0)
    throw Error(`{$name} undefined`);
  guardDim(rect2.width, name + `.width`);
  guardDim(rect2.height, name + `.height`);
};
var fromTopLeft = (origin, width, height) => {
  guardDim(width, `width`);
  guardDim(height, `height`);
  guard(origin, `origin`);
  return { x: origin.x, y: origin.y, width, height };
};
var getCorners = (rect2, origin) => {
  guard2(rect2);
  if (origin === void 0 && isPoint(rect2))
    origin = rect2;
  else if (origin === void 0)
    throw new Error(`Unpositioned rect needs origin param`);
  return [
    { x: origin.x, y: origin.y },
    { x: origin.x + rect2.width, y: origin.y },
    { x: origin.x + rect2.width, y: origin.y + rect2.height },
    { x: origin.x, y: origin.y + rect2.height }
  ];
};
var getCenter = (rect2, origin) => {
  guard2(rect2);
  if (origin === void 0 && isPoint(rect2))
    origin = rect2;
  else if (origin === void 0)
    throw new Error(`Unpositioned rect needs origin param`);
  return {
    x: origin.x + rect2.width / 2,
    y: origin.y + rect2.height / 2
  };
};
var getLines = (rect2, origin) => joinPointsToLines(...getCorners(rect2, origin));

// src/geometry/Point.ts
var compareTo = (compareFn, ...points) => {
  if (points.length === 0)
    throw new Error(`No points provided`);
  let min2 = points[0];
  points.forEach((p) => {
    min2 = compareFn(min2, p);
  });
  return min2;
};
var distance = (a2, b) => {
  guard(a2, `a`);
  guard(b, `b`);
  return Math.hypot(b.x - a2.x, b.y - a2.y);
};
var guard = (p, name = `Point`) => {
  if (p === void 0)
    throw new Error(`'${name}' is undefined. Expected {x,y} got ${JSON.stringify(p)}`);
  if (p === null)
    throw new Error(`'${name}' is null. Expected {x,y} got ${JSON.stringify(p)}`);
  if (p.x === void 0)
    throw new Error(`'${name}.x' is undefined. Expected {x,y} got ${JSON.stringify(p)}`);
  if (p.y === void 0)
    throw new Error(`'${name}.y' is undefined. Expected {x,y} got ${JSON.stringify(p)}`);
  if (typeof p.x !== `number`)
    throw new Error(`'${name}.x' must be a number`);
  if (typeof p.y !== `number`)
    throw new Error(`'${name}.y' must be a number`);
  if (Number.isNaN(p.x))
    throw new Error(`'${name}.x' is NaN`);
  if (Number.isNaN(p.y))
    throw new Error(`'${name}.y' is NaN`);
};
var bbox = (...points) => {
  const leftMost = compareTo((a2, b) => {
    if (a2.x < b.x)
      return a2;
    else
      return b;
  }, ...points);
  const rightMost = compareTo((a2, b) => {
    if (a2.x > b.x)
      return a2;
    else
      return b;
  }, ...points);
  const topMost = compareTo((a2, b) => {
    if (a2.y < b.y)
      return a2;
    else
      return b;
  }, ...points);
  const bottomMost = compareTo((a2, b) => {
    if (a2.y > b.y)
      return a2;
    else
      return b;
  }, ...points);
  const topLeft = { x: leftMost.x, y: topMost.y };
  const topRight = { x: rightMost.x, y: topMost.y };
  const bottomRight = { x: rightMost.x, y: bottomMost.y };
  const bottomLeft = { x: leftMost.x, y: bottomMost.y };
  return maxFromCorners(topLeft, topRight, bottomRight, bottomLeft);
};
var isPoint = (p) => {
  if (p.x === void 0)
    return false;
  if (p.y === void 0)
    return false;
  return true;
};
var toArray = (p) => [p.x, p.y];
var toString = (p) => {
  if (p.z !== void 0) {
    return `(${p.x},${p.y},${p.z})`;
  } else {
    return `(${p.x},${p.y})`;
  }
};
var equals = (a2, b) => a2.x === b.x && a2.y === b.y;
var withinRange = (a2, b, maxRange) => {
  if (typeof maxRange === `number`) {
    maxRange = { x: maxRange, y: maxRange };
  }
  const x = Math.abs(b.x - a2.x);
  const y = Math.abs(b.y - a2.y);
  return x <= maxRange.x && y <= maxRange.y;
};
var lerp = (amt, a2, b) => ({ x: (1 - amt) * a2.x + amt * b.x, y: (1 - amt) * a2.y + amt * b.y });
var from = (xOrArray, y) => {
  if (Array.isArray(xOrArray)) {
    if (xOrArray.length !== 2)
      throw new Error(`Expected array of length two, got ` + xOrArray.length);
    return Object.freeze({
      x: xOrArray[0],
      y: xOrArray[1]
    });
  } else {
    if (xOrArray === void 0)
      xOrArray = 0;
    else if (Number.isNaN(xOrArray))
      throw new Error(`x is NaN`);
    if (y === void 0)
      y = 0;
    else if (Number.isNaN(y))
      throw new Error(`y is NaN`);
    return Object.freeze({ x: xOrArray, y });
  }
};
var fromNumbers = (...coords) => {
  const pts = [];
  if (Array.isArray(coords[0])) {
    coords.forEach((coord) => {
      if (!(coord.length % 2 === 0))
        throw new Error(`coords array should be even-numbered`);
      pts.push(Object.freeze({ x: coord[0], y: coord[1] }));
    });
  } else {
    if (coords.length !== 2)
      throw new Error(`Expected two elements: [x,y]`);
    pts.push(Object.freeze({ x: coords[0], y: coords[1] }));
  }
  return pts;
};
var diff = function(a2, b) {
  guard(a2, `a`);
  guard(b, `b`);
  return {
    x: a2.x - b.x,
    y: a2.y - b.y
  };
};
var sum = function(a2, b) {
  guard(a2, `a`);
  guard(b, `b`);
  return {
    x: a2.x + b.x,
    y: a2.y + b.y
  };
};
function multiply(a2, bOrX, y) {
  guard(a2, `a`);
  if (typeof bOrX === `number`) {
    if (typeof y === `undefined`)
      y = 1;
    return { x: a2.x * bOrX, y: a2.y * y };
  } else if (isPoint(bOrX)) {
    guard(bOrX, `b`);
    return {
      x: a2.x * bOrX.x,
      y: a2.y * bOrX.y
    };
  } else
    throw new Error(`Invalid arguments`);
}

// src/Guards.ts
var percent = (t3, name = `?`) => {
  if (Number.isNaN(t3))
    throw new Error(`Parameter '${name}' is NaN`);
  if (t3 < 0)
    throw new Error(`Parameter '${name}' must be above or equal to 0`);
  if (t3 > 1)
    throw new Error(`Parameter '${name}' must be below or equal to 1`);
};
var integer = (t3, name = `?`, enforcePositive = false) => {
  if (Number.isNaN(t3))
    throw new Error(`Parameter '${name}' is NaN`);
  if (!Number.isInteger(t3))
    throw new Error(`Paramter ${name} is not an integer`);
  if (enforcePositive && t3 < 0)
    throw new Error(`Parameter '${name}' must be at least zero`);
};
var isStringArray = (t3) => {
  if (!Array.isArray(t3))
    return false;
  for (let i2 = 0; i2 < t3.length; i2++) {
    if (typeof t3[i2] !== `string`)
      return false;
  }
  return true;
};
var array = (t3, name = `?`) => {
  if (!Array.isArray(t3))
    throw new Error(`Parameter '${name}' is expected to be an array'`);
};

// src/geometry/Line.ts
var isLine = (p) => p.a !== void 0 && p.b !== void 0;
var equals2 = (a2, b) => a2.a === b.a && a2.b === b.b;
var guard3 = (l2, paramName = `line`) => {
  if (l2 === void 0)
    throw new Error(`${paramName} undefined`);
  if (l2.a === void 0)
    throw new Error(`${paramName}.a undefined. Expected {a:Point, b:Point}`);
  if (l2.b === void 0)
    throw new Error(`${paramName}.b undefined. Expected {a:Point, b:Point}`);
};
var angleRadian = (lineOrPoint, b) => {
  let a2;
  if (isLine(lineOrPoint)) {
    a2 = lineOrPoint.a;
    b = lineOrPoint.b;
  } else {
    a2 = lineOrPoint;
    if (b === void 0)
      throw new Error(`b point must be provided`);
  }
  return Math.atan2(b.y - a2.y, b.x - a2.x);
};
var withinRange2 = (l2, p, maxRange) => {
  const dist = distance2(l2, p);
  return dist <= maxRange;
};
var length = (aOrLine, b) => {
  let a2;
  if (isLine(aOrLine)) {
    b = aOrLine.b;
    a2 = aOrLine.a;
  } else {
    a2 = aOrLine;
    if (b === void 0)
      throw new Error(`Requires both a and b parameters`);
  }
  guard(a2, `a`);
  guard(a2, `b`);
  const x = b.x - a2.x;
  const y = b.y - a2.y;
  if (a2.z !== void 0 && b.z !== void 0) {
    const z = b.z - a2.z;
    return Math.hypot(x, y, z);
  } else {
    return Math.hypot(x, y);
  }
};
var nearest = (line2, p) => {
  const { a: a2, b } = line2;
  const atob = { x: b.x - a2.x, y: b.y - a2.y };
  const atop = { x: p.x - a2.x, y: p.y - a2.y };
  const len = atob.x * atob.x + atob.y * atob.y;
  let dot2 = atop.x * atob.x + atop.y * atob.y;
  const t3 = Math.min(1, Math.max(0, dot2 / len));
  dot2 = (b.x - a2.x) * (p.y - a2.y) - (b.y - a2.y) * (p.x - a2.x);
  return { x: a2.x + atob.x * t3, y: a2.y + atob.y * t3 };
};
var slope = (lineOrPoint, b) => {
  let a2;
  if (isLine(lineOrPoint)) {
    a2 = lineOrPoint.a;
  } else {
    a2 = lineOrPoint;
    if (b === void 0)
      throw new Error(`b parameter required`);
  }
  return (b.y - a2.y) / (b.x - a2.x);
};
var extendX = (line2, xIntersection) => {
  const y = line2.a.y + (xIntersection - line2.a.x) * slope(line2);
  return { x: xIntersection, y };
};
var extendFromStart = (line2, distance3) => {
  const len = length(line2);
  return Object.freeze({
    a: line2.a,
    b: Object.freeze({
      x: line2.b.x + (line2.b.x - line2.a.x) / len * distance3,
      y: line2.b.y + (line2.b.y - line2.a.y) / len * distance3
    })
  });
};
var distance2 = (l2, p) => {
  guard3(l2, `l`);
  guard(p, `p`);
  const lineLength = length(l2);
  if (lineLength === 0) {
    return length(l2.a, p);
  }
  const near = nearest(l2, p);
  return length(near, p);
};
var compute = (a2, b, t3) => {
  guard(a2, `a`);
  guard(b, `b`);
  percent(t3, `t`);
  const d = length(a2, b);
  const d2 = d * (1 - t3);
  const x = b.x - d2 * (b.x - a2.x) / d;
  const y = b.y - d2 * (b.y - a2.y) / d;
  return { x, y };
};
var toString2 = (a2, b) => toString(a2) + `-` + toString(b);
var fromNumbers2 = (x1, y1, x2, y2) => {
  if (Number.isNaN(x1))
    throw new Error(`x1 is NaN`);
  if (Number.isNaN(x2))
    throw new Error(`x2 is NaN`);
  if (Number.isNaN(y1))
    throw new Error(`y1 is NaN`);
  if (Number.isNaN(y2))
    throw new Error(`y2 is NaN`);
  const a2 = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  return fromPoints(a2, b);
};
var toFlatArray = (a2, b) => [a2.x, a2.y, b.x, b.y];
var toSvgString = (a2, b) => `M${a2.x} ${a2.y} L ${b.x} ${b.y}`;
var fromArray = (arr) => {
  if (!Array.isArray(arr))
    throw new Error(`arr parameter is not an array`);
  if (arr.length !== 4)
    throw new Error(`array is expected to have length four`);
  return fromNumbers2(arr[0], arr[1], arr[2], arr[3]);
};
var fromPoints = (a2, b) => {
  guard(a2, `a`);
  guard(b, `b`);
  a2 = Object.freeze(a2);
  b = Object.freeze(b);
  return Object.freeze({
    a: a2,
    b
  });
};
var joinPointsToLines = (...points) => {
  const lines = [];
  let start = points[0];
  for (let i2 = 1; i2 < points.length; i2++) {
    lines.push(fromPoints(start, points[i2]));
    start = points[i2];
  }
  return lines;
};
var fromPointsToPath = (a2, b) => toPath(fromPoints(a2, b));
var bbox2 = (line2) => bbox(line2.a, line2.b);
var toPath = (line2) => {
  const { a: a2, b } = line2;
  return Object.freeze({
    ...line2,
    length: () => length(a2, b),
    compute: (t3) => compute(a2, b, t3),
    bbox: () => bbox2(line2),
    toString: () => toString2(a2, b),
    toFlatArray: () => toFlatArray(a2, b),
    toSvgString: () => toSvgString(a2, b),
    toPoints: () => [a2, b],
    kind: `line`
  });
};

// src/geometry/Bezier.ts
var Bezier_exports = {};
__export(Bezier_exports, {
  cubic: () => cubic,
  isCubicBezier: () => isCubicBezier,
  isQuadraticBezier: () => isQuadraticBezier,
  quadratic: () => quadratic,
  quadraticBend: () => quadraticBend,
  quadraticSimple: () => quadraticSimple,
  quadraticToSvgString: () => quadraticToSvgString,
  toPath: () => toPath2
});

// node_modules/bezier-js/src/utils.js
var { abs, cos, sin, acos, atan2, sqrt, pow } = Math;
function crt(v2) {
  return v2 < 0 ? -pow(-v2, 1 / 3) : pow(v2, 1 / 3);
}
var pi = Math.PI;
var tau = 2 * pi;
var quart = pi / 2;
var epsilon = 1e-6;
var nMax = Number.MAX_SAFE_INTEGER || 9007199254740991;
var nMin = Number.MIN_SAFE_INTEGER || -9007199254740991;
var ZERO = { x: 0, y: 0, z: 0 };
var utils = {
  Tvalues: [
    -0.06405689286260563,
    0.06405689286260563,
    -0.1911188674736163,
    0.1911188674736163,
    -0.3150426796961634,
    0.3150426796961634,
    -0.4337935076260451,
    0.4337935076260451,
    -0.5454214713888396,
    0.5454214713888396,
    -0.6480936519369755,
    0.6480936519369755,
    -0.7401241915785544,
    0.7401241915785544,
    -0.820001985973903,
    0.820001985973903,
    -0.8864155270044011,
    0.8864155270044011,
    -0.9382745520027328,
    0.9382745520027328,
    -0.9747285559713095,
    0.9747285559713095,
    -0.9951872199970213,
    0.9951872199970213
  ],
  Cvalues: [
    0.12793819534675216,
    0.12793819534675216,
    0.1258374563468283,
    0.1258374563468283,
    0.12167047292780339,
    0.12167047292780339,
    0.1155056680537256,
    0.1155056680537256,
    0.10744427011596563,
    0.10744427011596563,
    0.09761865210411388,
    0.09761865210411388,
    0.08619016153195327,
    0.08619016153195327,
    0.0733464814110803,
    0.0733464814110803,
    0.05929858491543678,
    0.05929858491543678,
    0.04427743881741981,
    0.04427743881741981,
    0.028531388628933663,
    0.028531388628933663,
    0.0123412297999872,
    0.0123412297999872
  ],
  arcfn: function(t3, derivativeFn) {
    const d = derivativeFn(t3);
    let l2 = d.x * d.x + d.y * d.y;
    if (typeof d.z !== "undefined") {
      l2 += d.z * d.z;
    }
    return sqrt(l2);
  },
  compute: function(t3, points, _3d) {
    if (t3 === 0) {
      points[0].t = 0;
      return points[0];
    }
    const order = points.length - 1;
    if (t3 === 1) {
      points[order].t = 1;
      return points[order];
    }
    const mt = 1 - t3;
    let p = points;
    if (order === 0) {
      points[0].t = t3;
      return points[0];
    }
    if (order === 1) {
      const ret = {
        x: mt * p[0].x + t3 * p[1].x,
        y: mt * p[0].y + t3 * p[1].y,
        t: t3
      };
      if (_3d) {
        ret.z = mt * p[0].z + t3 * p[1].z;
      }
      return ret;
    }
    if (order < 4) {
      let mt2 = mt * mt, t22 = t3 * t3, a2, b, c2, d = 0;
      if (order === 2) {
        p = [p[0], p[1], p[2], ZERO];
        a2 = mt2;
        b = mt * t3 * 2;
        c2 = t22;
      } else if (order === 3) {
        a2 = mt2 * mt;
        b = mt2 * t3 * 3;
        c2 = mt * t22 * 3;
        d = t3 * t22;
      }
      const ret = {
        x: a2 * p[0].x + b * p[1].x + c2 * p[2].x + d * p[3].x,
        y: a2 * p[0].y + b * p[1].y + c2 * p[2].y + d * p[3].y,
        t: t3
      };
      if (_3d) {
        ret.z = a2 * p[0].z + b * p[1].z + c2 * p[2].z + d * p[3].z;
      }
      return ret;
    }
    const dCpts = JSON.parse(JSON.stringify(points));
    while (dCpts.length > 1) {
      for (let i2 = 0; i2 < dCpts.length - 1; i2++) {
        dCpts[i2] = {
          x: dCpts[i2].x + (dCpts[i2 + 1].x - dCpts[i2].x) * t3,
          y: dCpts[i2].y + (dCpts[i2 + 1].y - dCpts[i2].y) * t3
        };
        if (typeof dCpts[i2].z !== "undefined") {
          dCpts[i2] = dCpts[i2].z + (dCpts[i2 + 1].z - dCpts[i2].z) * t3;
        }
      }
      dCpts.splice(dCpts.length - 1, 1);
    }
    dCpts[0].t = t3;
    return dCpts[0];
  },
  computeWithRatios: function(t3, points, ratios, _3d) {
    const mt = 1 - t3, r2 = ratios, p = points;
    let f1 = r2[0], f2 = r2[1], f3 = r2[2], f4 = r2[3], d;
    f1 *= mt;
    f2 *= t3;
    if (p.length === 2) {
      d = f1 + f2;
      return {
        x: (f1 * p[0].x + f2 * p[1].x) / d,
        y: (f1 * p[0].y + f2 * p[1].y) / d,
        z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z) / d,
        t: t3
      };
    }
    f1 *= mt;
    f2 *= 2 * mt;
    f3 *= t3 * t3;
    if (p.length === 3) {
      d = f1 + f2 + f3;
      return {
        x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x) / d,
        y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y) / d,
        z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z) / d,
        t: t3
      };
    }
    f1 *= mt;
    f2 *= 1.5 * mt;
    f3 *= 3 * mt;
    f4 *= t3 * t3 * t3;
    if (p.length === 4) {
      d = f1 + f2 + f3 + f4;
      return {
        x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x + f4 * p[3].x) / d,
        y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y + f4 * p[3].y) / d,
        z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z + f4 * p[3].z) / d,
        t: t3
      };
    }
  },
  derive: function(points, _3d) {
    const dpoints = [];
    for (let p = points, d = p.length, c2 = d - 1; d > 1; d--, c2--) {
      const list = [];
      for (let j = 0, dpt; j < c2; j++) {
        dpt = {
          x: c2 * (p[j + 1].x - p[j].x),
          y: c2 * (p[j + 1].y - p[j].y)
        };
        if (_3d) {
          dpt.z = c2 * (p[j + 1].z - p[j].z);
        }
        list.push(dpt);
      }
      dpoints.push(list);
      p = list;
    }
    return dpoints;
  },
  between: function(v2, m2, M) {
    return m2 <= v2 && v2 <= M || utils.approximately(v2, m2) || utils.approximately(v2, M);
  },
  approximately: function(a2, b, precision) {
    return abs(a2 - b) <= (precision || epsilon);
  },
  length: function(derivativeFn) {
    const z = 0.5, len = utils.Tvalues.length;
    let sum2 = 0;
    for (let i2 = 0, t3; i2 < len; i2++) {
      t3 = z * utils.Tvalues[i2] + z;
      sum2 += utils.Cvalues[i2] * utils.arcfn(t3, derivativeFn);
    }
    return z * sum2;
  },
  map: function(v2, ds, de, ts, te) {
    const d1 = de - ds, d2 = te - ts, v22 = v2 - ds, r2 = v22 / d1;
    return ts + d2 * r2;
  },
  lerp: function(r2, v1, v2) {
    const ret = {
      x: v1.x + r2 * (v2.x - v1.x),
      y: v1.y + r2 * (v2.y - v1.y)
    };
    if (v1.z !== void 0 && v2.z !== void 0) {
      ret.z = v1.z + r2 * (v2.z - v1.z);
    }
    return ret;
  },
  pointToString: function(p) {
    let s2 = p.x + "/" + p.y;
    if (typeof p.z !== "undefined") {
      s2 += "/" + p.z;
    }
    return s2;
  },
  pointsToString: function(points) {
    return "[" + points.map(utils.pointToString).join(", ") + "]";
  },
  copy: function(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  angle: function(o2, v1, v2) {
    const dx1 = v1.x - o2.x, dy1 = v1.y - o2.y, dx2 = v2.x - o2.x, dy2 = v2.y - o2.y, cross = dx1 * dy2 - dy1 * dx2, dot2 = dx1 * dx2 + dy1 * dy2;
    return atan2(cross, dot2);
  },
  round: function(v2, d) {
    const s2 = "" + v2;
    const pos = s2.indexOf(".");
    return parseFloat(s2.substring(0, pos + 1 + d));
  },
  dist: function(p1, p2) {
    const dx = p1.x - p2.x, dy = p1.y - p2.y;
    return sqrt(dx * dx + dy * dy);
  },
  closest: function(LUT, point) {
    let mdist = pow(2, 63), mpos, d;
    LUT.forEach(function(p, idx) {
      d = utils.dist(point, p);
      if (d < mdist) {
        mdist = d;
        mpos = idx;
      }
    });
    return { mdist, mpos };
  },
  abcratio: function(t3, n2) {
    if (n2 !== 2 && n2 !== 3) {
      return false;
    }
    if (typeof t3 === "undefined") {
      t3 = 0.5;
    } else if (t3 === 0 || t3 === 1) {
      return t3;
    }
    const bottom = pow(t3, n2) + pow(1 - t3, n2), top = bottom - 1;
    return abs(top / bottom);
  },
  projectionratio: function(t3, n2) {
    if (n2 !== 2 && n2 !== 3) {
      return false;
    }
    if (typeof t3 === "undefined") {
      t3 = 0.5;
    } else if (t3 === 0 || t3 === 1) {
      return t3;
    }
    const top = pow(1 - t3, n2), bottom = pow(t3, n2) + top;
    return top / bottom;
  },
  lli8: function(x1, y1, x2, y2, x3, y3, x4, y4) {
    const nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4), ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4), d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (d == 0) {
      return false;
    }
    return { x: nx / d, y: ny / d };
  },
  lli4: function(p1, p2, p3, p4) {
    const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y, x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y;
    return utils.lli8(x1, y1, x2, y2, x3, y3, x4, y4);
  },
  lli: function(v1, v2) {
    return utils.lli4(v1, v1.c, v2, v2.c);
  },
  makeline: function(p1, p2) {
    const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y, dx = (x2 - x1) / 3, dy = (y2 - y1) / 3;
    return new Bezier(x1, y1, x1 + dx, y1 + dy, x1 + 2 * dx, y1 + 2 * dy, x2, y2);
  },
  findbbox: function(sections) {
    let mx = nMax, my = nMax, MX = nMin, MY = nMin;
    sections.forEach(function(s2) {
      const bbox4 = s2.bbox();
      if (mx > bbox4.x.min)
        mx = bbox4.x.min;
      if (my > bbox4.y.min)
        my = bbox4.y.min;
      if (MX < bbox4.x.max)
        MX = bbox4.x.max;
      if (MY < bbox4.y.max)
        MY = bbox4.y.max;
    });
    return {
      x: { min: mx, mid: (mx + MX) / 2, max: MX, size: MX - mx },
      y: { min: my, mid: (my + MY) / 2, max: MY, size: MY - my }
    };
  },
  shapeintersections: function(s1, bbox1, s2, bbox22, curveIntersectionThreshold) {
    if (!utils.bboxoverlap(bbox1, bbox22))
      return [];
    const intersections = [];
    const a1 = [s1.startcap, s1.forward, s1.back, s1.endcap];
    const a2 = [s2.startcap, s2.forward, s2.back, s2.endcap];
    a1.forEach(function(l1) {
      if (l1.virtual)
        return;
      a2.forEach(function(l2) {
        if (l2.virtual)
          return;
        const iss = l1.intersects(l2, curveIntersectionThreshold);
        if (iss.length > 0) {
          iss.c1 = l1;
          iss.c2 = l2;
          iss.s1 = s1;
          iss.s2 = s2;
          intersections.push(iss);
        }
      });
    });
    return intersections;
  },
  makeshape: function(forward, back, curveIntersectionThreshold) {
    const bpl = back.points.length;
    const fpl = forward.points.length;
    const start = utils.makeline(back.points[bpl - 1], forward.points[0]);
    const end = utils.makeline(forward.points[fpl - 1], back.points[0]);
    const shape = {
      startcap: start,
      forward,
      back,
      endcap: end,
      bbox: utils.findbbox([start, forward, back, end])
    };
    shape.intersections = function(s2) {
      return utils.shapeintersections(shape, shape.bbox, s2, s2.bbox, curveIntersectionThreshold);
    };
    return shape;
  },
  getminmax: function(curve, d, list) {
    if (!list)
      return { min: 0, max: 0 };
    let min2 = nMax, max2 = nMin, t3, c2;
    if (list.indexOf(0) === -1) {
      list = [0].concat(list);
    }
    if (list.indexOf(1) === -1) {
      list.push(1);
    }
    for (let i2 = 0, len = list.length; i2 < len; i2++) {
      t3 = list[i2];
      c2 = curve.get(t3);
      if (c2[d] < min2) {
        min2 = c2[d];
      }
      if (c2[d] > max2) {
        max2 = c2[d];
      }
    }
    return { min: min2, mid: (min2 + max2) / 2, max: max2, size: max2 - min2 };
  },
  align: function(points, line2) {
    const tx = line2.p1.x, ty = line2.p1.y, a2 = -atan2(line2.p2.y - ty, line2.p2.x - tx), d = function(v2) {
      return {
        x: (v2.x - tx) * cos(a2) - (v2.y - ty) * sin(a2),
        y: (v2.x - tx) * sin(a2) + (v2.y - ty) * cos(a2)
      };
    };
    return points.map(d);
  },
  roots: function(points, line2) {
    line2 = line2 || { p1: { x: 0, y: 0 }, p2: { x: 1, y: 0 } };
    const order = points.length - 1;
    const aligned = utils.align(points, line2);
    const reduce3 = function(t3) {
      return 0 <= t3 && t3 <= 1;
    };
    if (order === 2) {
      const a3 = aligned[0].y, b2 = aligned[1].y, c3 = aligned[2].y, d2 = a3 - 2 * b2 + c3;
      if (d2 !== 0) {
        const m1 = -sqrt(b2 * b2 - a3 * c3), m2 = -a3 + b2, v12 = -(m1 + m2) / d2, v2 = -(-m1 + m2) / d2;
        return [v12, v2].filter(reduce3);
      } else if (b2 !== c3 && d2 === 0) {
        return [(2 * b2 - c3) / (2 * b2 - 2 * c3)].filter(reduce3);
      }
      return [];
    }
    const pa = aligned[0].y, pb = aligned[1].y, pc = aligned[2].y, pd = aligned[3].y;
    let d = -pa + 3 * pb - 3 * pc + pd, a2 = 3 * pa - 6 * pb + 3 * pc, b = -3 * pa + 3 * pb, c2 = pa;
    if (utils.approximately(d, 0)) {
      if (utils.approximately(a2, 0)) {
        if (utils.approximately(b, 0)) {
          return [];
        }
        return [-c2 / b].filter(reduce3);
      }
      const q3 = sqrt(b * b - 4 * a2 * c2), a22 = 2 * a2;
      return [(q3 - b) / a22, (-b - q3) / a22].filter(reduce3);
    }
    a2 /= d;
    b /= d;
    c2 /= d;
    const p = (3 * b - a2 * a2) / 3, p3 = p / 3, q = (2 * a2 * a2 * a2 - 9 * a2 * b + 27 * c2) / 27, q2 = q / 2, discriminant = q2 * q2 + p3 * p3 * p3;
    let u1, v1, x1, x2, x3;
    if (discriminant < 0) {
      const mp3 = -p / 3, mp33 = mp3 * mp3 * mp3, r2 = sqrt(mp33), t3 = -q / (2 * r2), cosphi = t3 < -1 ? -1 : t3 > 1 ? 1 : t3, phi = acos(cosphi), crtr = crt(r2), t1 = 2 * crtr;
      x1 = t1 * cos(phi / 3) - a2 / 3;
      x2 = t1 * cos((phi + tau) / 3) - a2 / 3;
      x3 = t1 * cos((phi + 2 * tau) / 3) - a2 / 3;
      return [x1, x2, x3].filter(reduce3);
    } else if (discriminant === 0) {
      u1 = q2 < 0 ? crt(-q2) : -crt(q2);
      x1 = 2 * u1 - a2 / 3;
      x2 = -u1 - a2 / 3;
      return [x1, x2].filter(reduce3);
    } else {
      const sd = sqrt(discriminant);
      u1 = crt(-q2 + sd);
      v1 = crt(q2 + sd);
      return [u1 - v1 - a2 / 3].filter(reduce3);
    }
  },
  droots: function(p) {
    if (p.length === 3) {
      const a2 = p[0], b = p[1], c2 = p[2], d = a2 - 2 * b + c2;
      if (d !== 0) {
        const m1 = -sqrt(b * b - a2 * c2), m2 = -a2 + b, v1 = -(m1 + m2) / d, v2 = -(-m1 + m2) / d;
        return [v1, v2];
      } else if (b !== c2 && d === 0) {
        return [(2 * b - c2) / (2 * (b - c2))];
      }
      return [];
    }
    if (p.length === 2) {
      const a2 = p[0], b = p[1];
      if (a2 !== b) {
        return [a2 / (a2 - b)];
      }
      return [];
    }
    return [];
  },
  curvature: function(t3, d1, d2, _3d, kOnly) {
    let num, dnm, adk, dk, k = 0, r2 = 0;
    const d = utils.compute(t3, d1);
    const dd = utils.compute(t3, d2);
    const qdsum = d.x * d.x + d.y * d.y;
    if (_3d) {
      num = sqrt(pow(d.y * dd.z - dd.y * d.z, 2) + pow(d.z * dd.x - dd.z * d.x, 2) + pow(d.x * dd.y - dd.x * d.y, 2));
      dnm = pow(qdsum + d.z * d.z, 3 / 2);
    } else {
      num = d.x * dd.y - d.y * dd.x;
      dnm = pow(qdsum, 3 / 2);
    }
    if (num === 0 || dnm === 0) {
      return { k: 0, r: 0 };
    }
    k = num / dnm;
    r2 = dnm / num;
    if (!kOnly) {
      const pk = utils.curvature(t3 - 1e-3, d1, d2, _3d, true).k;
      const nk = utils.curvature(t3 + 1e-3, d1, d2, _3d, true).k;
      dk = (nk - k + (k - pk)) / 2;
      adk = (abs(nk - k) + abs(k - pk)) / 2;
    }
    return { k, r: r2, dk, adk };
  },
  inflections: function(points) {
    if (points.length < 4)
      return [];
    const p = utils.align(points, { p1: points[0], p2: points.slice(-1)[0] }), a2 = p[2].x * p[1].y, b = p[3].x * p[1].y, c2 = p[1].x * p[2].y, d = p[3].x * p[2].y, v1 = 18 * (-3 * a2 + 2 * b + 3 * c2 - d), v2 = 18 * (3 * a2 - b - 3 * c2), v3 = 18 * (c2 - a2);
    if (utils.approximately(v1, 0)) {
      if (!utils.approximately(v2, 0)) {
        let t3 = -v3 / v2;
        if (0 <= t3 && t3 <= 1)
          return [t3];
      }
      return [];
    }
    const trm = v2 * v2 - 4 * v1 * v3, sq = Math.sqrt(trm), d2 = 2 * v1;
    if (utils.approximately(d2, 0))
      return [];
    return [(sq - v2) / d2, -(v2 + sq) / d2].filter(function(r2) {
      return 0 <= r2 && r2 <= 1;
    });
  },
  bboxoverlap: function(b1, b2) {
    const dims = ["x", "y"], len = dims.length;
    for (let i2 = 0, dim, l2, t3, d; i2 < len; i2++) {
      dim = dims[i2];
      l2 = b1[dim].mid;
      t3 = b2[dim].mid;
      d = (b1[dim].size + b2[dim].size) / 2;
      if (abs(l2 - t3) >= d)
        return false;
    }
    return true;
  },
  expandbox: function(bbox4, _bbox) {
    if (_bbox.x.min < bbox4.x.min) {
      bbox4.x.min = _bbox.x.min;
    }
    if (_bbox.y.min < bbox4.y.min) {
      bbox4.y.min = _bbox.y.min;
    }
    if (_bbox.z && _bbox.z.min < bbox4.z.min) {
      bbox4.z.min = _bbox.z.min;
    }
    if (_bbox.x.max > bbox4.x.max) {
      bbox4.x.max = _bbox.x.max;
    }
    if (_bbox.y.max > bbox4.y.max) {
      bbox4.y.max = _bbox.y.max;
    }
    if (_bbox.z && _bbox.z.max > bbox4.z.max) {
      bbox4.z.max = _bbox.z.max;
    }
    bbox4.x.mid = (bbox4.x.min + bbox4.x.max) / 2;
    bbox4.y.mid = (bbox4.y.min + bbox4.y.max) / 2;
    if (bbox4.z) {
      bbox4.z.mid = (bbox4.z.min + bbox4.z.max) / 2;
    }
    bbox4.x.size = bbox4.x.max - bbox4.x.min;
    bbox4.y.size = bbox4.y.max - bbox4.y.min;
    if (bbox4.z) {
      bbox4.z.size = bbox4.z.max - bbox4.z.min;
    }
  },
  pairiteration: function(c1, c2, curveIntersectionThreshold) {
    const c1b = c1.bbox(), c2b = c2.bbox(), r2 = 1e5, threshold = curveIntersectionThreshold || 0.5;
    if (c1b.x.size + c1b.y.size < threshold && c2b.x.size + c2b.y.size < threshold) {
      return [
        (r2 * (c1._t1 + c1._t2) / 2 | 0) / r2 + "/" + (r2 * (c2._t1 + c2._t2) / 2 | 0) / r2
      ];
    }
    let cc1 = c1.split(0.5), cc2 = c2.split(0.5), pairs = [
      { left: cc1.left, right: cc2.left },
      { left: cc1.left, right: cc2.right },
      { left: cc1.right, right: cc2.right },
      { left: cc1.right, right: cc2.left }
    ];
    pairs = pairs.filter(function(pair) {
      return utils.bboxoverlap(pair.left.bbox(), pair.right.bbox());
    });
    let results = [];
    if (pairs.length === 0)
      return results;
    pairs.forEach(function(pair) {
      results = results.concat(utils.pairiteration(pair.left, pair.right, threshold));
    });
    results = results.filter(function(v2, i2) {
      return results.indexOf(v2) === i2;
    });
    return results;
  },
  getccenter: function(p1, p2, p3) {
    const dx1 = p2.x - p1.x, dy1 = p2.y - p1.y, dx2 = p3.x - p2.x, dy2 = p3.y - p2.y, dx1p = dx1 * cos(quart) - dy1 * sin(quart), dy1p = dx1 * sin(quart) + dy1 * cos(quart), dx2p = dx2 * cos(quart) - dy2 * sin(quart), dy2p = dx2 * sin(quart) + dy2 * cos(quart), mx1 = (p1.x + p2.x) / 2, my1 = (p1.y + p2.y) / 2, mx2 = (p2.x + p3.x) / 2, my2 = (p2.y + p3.y) / 2, mx1n = mx1 + dx1p, my1n = my1 + dy1p, mx2n = mx2 + dx2p, my2n = my2 + dy2p, arc2 = utils.lli8(mx1, my1, mx1n, my1n, mx2, my2, mx2n, my2n), r2 = utils.dist(arc2, p1);
    let s2 = atan2(p1.y - arc2.y, p1.x - arc2.x), m2 = atan2(p2.y - arc2.y, p2.x - arc2.x), e2 = atan2(p3.y - arc2.y, p3.x - arc2.x), _2;
    if (s2 < e2) {
      if (s2 > m2 || m2 > e2) {
        s2 += tau;
      }
      if (s2 > e2) {
        _2 = e2;
        e2 = s2;
        s2 = _2;
      }
    } else {
      if (e2 < m2 && m2 < s2) {
        _2 = e2;
        e2 = s2;
        s2 = _2;
      } else {
        e2 += tau;
      }
    }
    arc2.s = s2;
    arc2.e = e2;
    arc2.r = r2;
    return arc2;
  },
  numberSort: function(a2, b) {
    return a2 - b;
  }
};

// node_modules/bezier-js/src/poly-bezier.js
var PolyBezier = class {
  constructor(curves) {
    this.curves = [];
    this._3d = false;
    if (!!curves) {
      this.curves = curves;
      this._3d = this.curves[0]._3d;
    }
  }
  valueOf() {
    return this.toString();
  }
  toString() {
    return "[" + this.curves.map(function(curve) {
      return utils.pointsToString(curve.points);
    }).join(", ") + "]";
  }
  addCurve(curve) {
    this.curves.push(curve);
    this._3d = this._3d || curve._3d;
  }
  length() {
    return this.curves.map(function(v2) {
      return v2.length();
    }).reduce(function(a2, b) {
      return a2 + b;
    });
  }
  curve(idx) {
    return this.curves[idx];
  }
  bbox() {
    const c2 = this.curves;
    var bbox4 = c2[0].bbox();
    for (var i2 = 1; i2 < c2.length; i2++) {
      utils.expandbox(bbox4, c2[i2].bbox());
    }
    return bbox4;
  }
  offset(d) {
    const offset2 = [];
    this.curves.forEach(function(v2) {
      offset2.push(...v2.offset(d));
    });
    return new PolyBezier(offset2);
  }
};

// node_modules/bezier-js/src/bezier.js
var { abs: abs2, min, max, cos: cos2, sin: sin2, acos: acos2, sqrt: sqrt2 } = Math;
var pi2 = Math.PI;
var Bezier = class {
  constructor(coords) {
    let args = coords && coords.forEach ? coords : Array.from(arguments).slice();
    let coordlen = false;
    if (typeof args[0] === "object") {
      coordlen = args.length;
      const newargs = [];
      args.forEach(function(point2) {
        ["x", "y", "z"].forEach(function(d) {
          if (typeof point2[d] !== "undefined") {
            newargs.push(point2[d]);
          }
        });
      });
      args = newargs;
    }
    let higher = false;
    const len = args.length;
    if (coordlen) {
      if (coordlen > 4) {
        if (arguments.length !== 1) {
          throw new Error("Only new Bezier(point[]) is accepted for 4th and higher order curves");
        }
        higher = true;
      }
    } else {
      if (len !== 6 && len !== 8 && len !== 9 && len !== 12) {
        if (arguments.length !== 1) {
          throw new Error("Only new Bezier(point[]) is accepted for 4th and higher order curves");
        }
      }
    }
    const _3d = this._3d = !higher && (len === 9 || len === 12) || coords && coords[0] && typeof coords[0].z !== "undefined";
    const points = this.points = [];
    for (let idx = 0, step = _3d ? 3 : 2; idx < len; idx += step) {
      var point = {
        x: args[idx],
        y: args[idx + 1]
      };
      if (_3d) {
        point.z = args[idx + 2];
      }
      points.push(point);
    }
    const order = this.order = points.length - 1;
    const dims = this.dims = ["x", "y"];
    if (_3d)
      dims.push("z");
    this.dimlen = dims.length;
    const aligned = utils.align(points, { p1: points[0], p2: points[order] });
    this._linear = !aligned.some((p) => abs2(p.y) > 1e-4);
    this._lut = [];
    this._t1 = 0;
    this._t2 = 1;
    this.update();
  }
  static quadraticFromPoints(p1, p2, p3, t3) {
    if (typeof t3 === "undefined") {
      t3 = 0.5;
    }
    if (t3 === 0) {
      return new Bezier(p2, p2, p3);
    }
    if (t3 === 1) {
      return new Bezier(p1, p2, p2);
    }
    const abc = Bezier.getABC(2, p1, p2, p3, t3);
    return new Bezier(p1, abc.A, p3);
  }
  static cubicFromPoints(S, B, E, t3, d1) {
    if (typeof t3 === "undefined") {
      t3 = 0.5;
    }
    const abc = Bezier.getABC(3, S, B, E, t3);
    if (typeof d1 === "undefined") {
      d1 = utils.dist(B, abc.C);
    }
    const d2 = d1 * (1 - t3) / t3;
    const selen = utils.dist(S, E), lx = (E.x - S.x) / selen, ly = (E.y - S.y) / selen, bx1 = d1 * lx, by1 = d1 * ly, bx2 = d2 * lx, by2 = d2 * ly;
    const e1 = { x: B.x - bx1, y: B.y - by1 }, e2 = { x: B.x + bx2, y: B.y + by2 }, A = abc.A, v1 = { x: A.x + (e1.x - A.x) / (1 - t3), y: A.y + (e1.y - A.y) / (1 - t3) }, v2 = { x: A.x + (e2.x - A.x) / t3, y: A.y + (e2.y - A.y) / t3 }, nc1 = { x: S.x + (v1.x - S.x) / t3, y: S.y + (v1.y - S.y) / t3 }, nc2 = {
      x: E.x + (v2.x - E.x) / (1 - t3),
      y: E.y + (v2.y - E.y) / (1 - t3)
    };
    return new Bezier(S, nc1, nc2, E);
  }
  static getUtils() {
    return utils;
  }
  getUtils() {
    return Bezier.getUtils();
  }
  static get PolyBezier() {
    return PolyBezier;
  }
  valueOf() {
    return this.toString();
  }
  toString() {
    return utils.pointsToString(this.points);
  }
  toSVG() {
    if (this._3d)
      return false;
    const p = this.points, x = p[0].x, y = p[0].y, s2 = ["M", x, y, this.order === 2 ? "Q" : "C"];
    for (let i2 = 1, last4 = p.length; i2 < last4; i2++) {
      s2.push(p[i2].x);
      s2.push(p[i2].y);
    }
    return s2.join(" ");
  }
  setRatios(ratios) {
    if (ratios.length !== this.points.length) {
      throw new Error("incorrect number of ratio values");
    }
    this.ratios = ratios;
    this._lut = [];
  }
  verify() {
    const print = this.coordDigest();
    if (print !== this._print) {
      this._print = print;
      this.update();
    }
  }
  coordDigest() {
    return this.points.map(function(c2, pos) {
      return "" + pos + c2.x + c2.y + (c2.z ? c2.z : 0);
    }).join("");
  }
  update() {
    this._lut = [];
    this.dpoints = utils.derive(this.points, this._3d);
    this.computedirection();
  }
  computedirection() {
    const points = this.points;
    const angle = utils.angle(points[0], points[this.order], points[1]);
    this.clockwise = angle > 0;
  }
  length() {
    return utils.length(this.derivative.bind(this));
  }
  static getABC(order = 2, S, B, E, t3 = 0.5) {
    const u2 = utils.projectionratio(t3, order), um = 1 - u2, C = {
      x: u2 * S.x + um * E.x,
      y: u2 * S.y + um * E.y
    }, s2 = utils.abcratio(t3, order), A = {
      x: B.x + (B.x - C.x) / s2,
      y: B.y + (B.y - C.y) / s2
    };
    return { A, B, C, S, E };
  }
  getABC(t3, B) {
    B = B || this.get(t3);
    let S = this.points[0];
    let E = this.points[this.order];
    return Bezier.getABC(this.order, S, B, E, t3);
  }
  getLUT(steps) {
    this.verify();
    steps = steps || 100;
    if (this._lut.length === steps) {
      return this._lut;
    }
    this._lut = [];
    steps--;
    for (let i2 = 0, p, t3; i2 < steps; i2++) {
      t3 = i2 / (steps - 1);
      p = this.compute(t3);
      p.t = t3;
      this._lut.push(p);
    }
    return this._lut;
  }
  on(point, error) {
    error = error || 5;
    const lut = this.getLUT(), hits = [];
    for (let i2 = 0, c2, t3 = 0; i2 < lut.length; i2++) {
      c2 = lut[i2];
      if (utils.dist(c2, point) < error) {
        hits.push(c2);
        t3 += i2 / lut.length;
      }
    }
    if (!hits.length)
      return false;
    return t /= hits.length;
  }
  project(point) {
    const LUT = this.getLUT(), l2 = LUT.length - 1, closest = utils.closest(LUT, point), mpos = closest.mpos, t1 = (mpos - 1) / l2, t22 = (mpos + 1) / l2, step = 0.1 / l2;
    let mdist = closest.mdist, t3 = t1, ft = t3, p;
    mdist += 1;
    for (let d; t3 < t22 + step; t3 += step) {
      p = this.compute(t3);
      d = utils.dist(point, p);
      if (d < mdist) {
        mdist = d;
        ft = t3;
      }
    }
    ft = ft < 0 ? 0 : ft > 1 ? 1 : ft;
    p = this.compute(ft);
    p.t = ft;
    p.d = mdist;
    return p;
  }
  get(t3) {
    return this.compute(t3);
  }
  point(idx) {
    return this.points[idx];
  }
  compute(t3) {
    if (this.ratios) {
      return utils.computeWithRatios(t3, this.points, this.ratios, this._3d);
    }
    return utils.compute(t3, this.points, this._3d, this.ratios);
  }
  raise() {
    const p = this.points, np = [p[0]], k = p.length;
    for (let i2 = 1, pi3, pim; i2 < k; i2++) {
      pi3 = p[i2];
      pim = p[i2 - 1];
      np[i2] = {
        x: (k - i2) / k * pi3.x + i2 / k * pim.x,
        y: (k - i2) / k * pi3.y + i2 / k * pim.y
      };
    }
    np[k] = p[k - 1];
    return new Bezier(np);
  }
  derivative(t3) {
    return utils.compute(t3, this.dpoints[0], this._3d);
  }
  dderivative(t3) {
    return utils.compute(t3, this.dpoints[1], this._3d);
  }
  align() {
    let p = this.points;
    return new Bezier(utils.align(p, { p1: p[0], p2: p[p.length - 1] }));
  }
  curvature(t3) {
    return utils.curvature(t3, this.dpoints[0], this.dpoints[1], this._3d);
  }
  inflections() {
    return utils.inflections(this.points);
  }
  normal(t3) {
    return this._3d ? this.__normal3(t3) : this.__normal2(t3);
  }
  __normal2(t3) {
    const d = this.derivative(t3);
    const q = sqrt2(d.x * d.x + d.y * d.y);
    return { x: -d.y / q, y: d.x / q };
  }
  __normal3(t3) {
    const r1 = this.derivative(t3), r2 = this.derivative(t3 + 0.01), q1 = sqrt2(r1.x * r1.x + r1.y * r1.y + r1.z * r1.z), q2 = sqrt2(r2.x * r2.x + r2.y * r2.y + r2.z * r2.z);
    r1.x /= q1;
    r1.y /= q1;
    r1.z /= q1;
    r2.x /= q2;
    r2.y /= q2;
    r2.z /= q2;
    const c2 = {
      x: r2.y * r1.z - r2.z * r1.y,
      y: r2.z * r1.x - r2.x * r1.z,
      z: r2.x * r1.y - r2.y * r1.x
    };
    const m2 = sqrt2(c2.x * c2.x + c2.y * c2.y + c2.z * c2.z);
    c2.x /= m2;
    c2.y /= m2;
    c2.z /= m2;
    const R = [
      c2.x * c2.x,
      c2.x * c2.y - c2.z,
      c2.x * c2.z + c2.y,
      c2.x * c2.y + c2.z,
      c2.y * c2.y,
      c2.y * c2.z - c2.x,
      c2.x * c2.z - c2.y,
      c2.y * c2.z + c2.x,
      c2.z * c2.z
    ];
    const n2 = {
      x: R[0] * r1.x + R[1] * r1.y + R[2] * r1.z,
      y: R[3] * r1.x + R[4] * r1.y + R[5] * r1.z,
      z: R[6] * r1.x + R[7] * r1.y + R[8] * r1.z
    };
    return n2;
  }
  hull(t3) {
    let p = this.points, _p = [], q = [], idx = 0;
    q[idx++] = p[0];
    q[idx++] = p[1];
    q[idx++] = p[2];
    if (this.order === 3) {
      q[idx++] = p[3];
    }
    while (p.length > 1) {
      _p = [];
      for (let i2 = 0, pt, l2 = p.length - 1; i2 < l2; i2++) {
        pt = utils.lerp(t3, p[i2], p[i2 + 1]);
        q[idx++] = pt;
        _p.push(pt);
      }
      p = _p;
    }
    return q;
  }
  split(t1, t22) {
    if (t1 === 0 && !!t22) {
      return this.split(t22).left;
    }
    if (t22 === 1) {
      return this.split(t1).right;
    }
    const q = this.hull(t1);
    const result = {
      left: this.order === 2 ? new Bezier([q[0], q[3], q[5]]) : new Bezier([q[0], q[4], q[7], q[9]]),
      right: this.order === 2 ? new Bezier([q[5], q[4], q[2]]) : new Bezier([q[9], q[8], q[6], q[3]]),
      span: q
    };
    result.left._t1 = utils.map(0, 0, 1, this._t1, this._t2);
    result.left._t2 = utils.map(t1, 0, 1, this._t1, this._t2);
    result.right._t1 = utils.map(t1, 0, 1, this._t1, this._t2);
    result.right._t2 = utils.map(1, 0, 1, this._t1, this._t2);
    if (!t22) {
      return result;
    }
    t22 = utils.map(t22, t1, 1, 0, 1);
    return result.right.split(t22).left;
  }
  extrema() {
    const result = {};
    let roots = [];
    this.dims.forEach(function(dim) {
      let mfn = function(v2) {
        return v2[dim];
      };
      let p = this.dpoints[0].map(mfn);
      result[dim] = utils.droots(p);
      if (this.order === 3) {
        p = this.dpoints[1].map(mfn);
        result[dim] = result[dim].concat(utils.droots(p));
      }
      result[dim] = result[dim].filter(function(t3) {
        return t3 >= 0 && t3 <= 1;
      });
      roots = roots.concat(result[dim].sort(utils.numberSort));
    }.bind(this));
    result.values = roots.sort(utils.numberSort).filter(function(v2, idx) {
      return roots.indexOf(v2) === idx;
    });
    return result;
  }
  bbox() {
    const extrema = this.extrema(), result = {};
    this.dims.forEach(function(d) {
      result[d] = utils.getminmax(this, d, extrema[d]);
    }.bind(this));
    return result;
  }
  overlaps(curve) {
    const lbbox = this.bbox(), tbbox = curve.bbox();
    return utils.bboxoverlap(lbbox, tbbox);
  }
  offset(t3, d) {
    if (typeof d !== "undefined") {
      const c2 = this.get(t3), n2 = this.normal(t3);
      const ret = {
        c: c2,
        n: n2,
        x: c2.x + n2.x * d,
        y: c2.y + n2.y * d
      };
      if (this._3d) {
        ret.z = c2.z + n2.z * d;
      }
      return ret;
    }
    if (this._linear) {
      const nv = this.normal(0), coords = this.points.map(function(p) {
        const ret = {
          x: p.x + t3 * nv.x,
          y: p.y + t3 * nv.y
        };
        if (p.z && nv.z) {
          ret.z = p.z + t3 * nv.z;
        }
        return ret;
      });
      return [new Bezier(coords)];
    }
    return this.reduce().map(function(s2) {
      if (s2._linear) {
        return s2.offset(t3)[0];
      }
      return s2.scale(t3);
    });
  }
  simple() {
    if (this.order === 3) {
      const a1 = utils.angle(this.points[0], this.points[3], this.points[1]);
      const a2 = utils.angle(this.points[0], this.points[3], this.points[2]);
      if (a1 > 0 && a2 < 0 || a1 < 0 && a2 > 0)
        return false;
    }
    const n1 = this.normal(0);
    const n2 = this.normal(1);
    let s2 = n1.x * n2.x + n1.y * n2.y;
    if (this._3d) {
      s2 += n1.z * n2.z;
    }
    return abs2(acos2(s2)) < pi2 / 3;
  }
  reduce() {
    let i2, t1 = 0, t22 = 0, step = 0.01, segment, pass1 = [], pass2 = [];
    let extrema = this.extrema().values;
    if (extrema.indexOf(0) === -1) {
      extrema = [0].concat(extrema);
    }
    if (extrema.indexOf(1) === -1) {
      extrema.push(1);
    }
    for (t1 = extrema[0], i2 = 1; i2 < extrema.length; i2++) {
      t22 = extrema[i2];
      segment = this.split(t1, t22);
      segment._t1 = t1;
      segment._t2 = t22;
      pass1.push(segment);
      t1 = t22;
    }
    pass1.forEach(function(p1) {
      t1 = 0;
      t22 = 0;
      while (t22 <= 1) {
        for (t22 = t1 + step; t22 <= 1 + step; t22 += step) {
          segment = p1.split(t1, t22);
          if (!segment.simple()) {
            t22 -= step;
            if (abs2(t1 - t22) < step) {
              return [];
            }
            segment = p1.split(t1, t22);
            segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
            segment._t2 = utils.map(t22, 0, 1, p1._t1, p1._t2);
            pass2.push(segment);
            t1 = t22;
            break;
          }
        }
      }
      if (t1 < 1) {
        segment = p1.split(t1, 1);
        segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
        segment._t2 = p1._t2;
        pass2.push(segment);
      }
    });
    return pass2;
  }
  scale(d) {
    const order = this.order;
    let distanceFn = false;
    if (typeof d === "function") {
      distanceFn = d;
    }
    if (distanceFn && order === 2) {
      return this.raise().scale(distanceFn);
    }
    const clockwise = this.clockwise;
    const r1 = distanceFn ? distanceFn(0) : d;
    const r2 = distanceFn ? distanceFn(1) : d;
    const v2 = [this.offset(0, 10), this.offset(1, 10)];
    const points = this.points;
    const np = [];
    const o2 = utils.lli4(v2[0], v2[0].c, v2[1], v2[1].c);
    if (!o2) {
      throw new Error("cannot scale this curve. Try reducing it first.");
    }
    [0, 1].forEach(function(t3) {
      const p = np[t3 * order] = utils.copy(points[t3 * order]);
      p.x += (t3 ? r2 : r1) * v2[t3].n.x;
      p.y += (t3 ? r2 : r1) * v2[t3].n.y;
    });
    if (!distanceFn) {
      [0, 1].forEach((t3) => {
        if (order === 2 && !!t3)
          return;
        const p = np[t3 * order];
        const d2 = this.derivative(t3);
        const p2 = { x: p.x + d2.x, y: p.y + d2.y };
        np[t3 + 1] = utils.lli4(p, p2, o2, points[t3 + 1]);
      });
      return new Bezier(np);
    }
    [0, 1].forEach(function(t3) {
      if (order === 2 && !!t3)
        return;
      var p = points[t3 + 1];
      var ov = {
        x: p.x - o2.x,
        y: p.y - o2.y
      };
      var rc = distanceFn ? distanceFn((t3 + 1) / order) : d;
      if (distanceFn && !clockwise)
        rc = -rc;
      var m2 = sqrt2(ov.x * ov.x + ov.y * ov.y);
      ov.x /= m2;
      ov.y /= m2;
      np[t3 + 1] = {
        x: p.x + rc * ov.x,
        y: p.y + rc * ov.y
      };
    });
    return new Bezier(np);
  }
  outline(d1, d2, d3, d4) {
    d2 = typeof d2 === "undefined" ? d1 : d2;
    const reduced = this.reduce(), len = reduced.length, fcurves = [];
    let bcurves = [], p, alen = 0, tlen = this.length();
    const graduated = typeof d3 !== "undefined" && typeof d4 !== "undefined";
    function linearDistanceFunction(s2, e2, tlen2, alen2, slen2) {
      return function(v2) {
        const f1 = alen2 / tlen2, f2 = (alen2 + slen2) / tlen2, d = e2 - s2;
        return utils.map(v2, 0, 1, s2 + f1 * d, s2 + f2 * d);
      };
    }
    reduced.forEach(function(segment) {
      const slen2 = segment.length();
      if (graduated) {
        fcurves.push(segment.scale(linearDistanceFunction(d1, d3, tlen, alen, slen2)));
        bcurves.push(segment.scale(linearDistanceFunction(-d2, -d4, tlen, alen, slen2)));
      } else {
        fcurves.push(segment.scale(d1));
        bcurves.push(segment.scale(-d2));
      }
      alen += slen2;
    });
    bcurves = bcurves.map(function(s2) {
      p = s2.points;
      if (p[3]) {
        s2.points = [p[3], p[2], p[1], p[0]];
      } else {
        s2.points = [p[2], p[1], p[0]];
      }
      return s2;
    }).reverse();
    const fs = fcurves[0].points[0], fe = fcurves[len - 1].points[fcurves[len - 1].points.length - 1], bs = bcurves[len - 1].points[bcurves[len - 1].points.length - 1], be = bcurves[0].points[0], ls = utils.makeline(bs, fs), le = utils.makeline(fe, be), segments = [ls].concat(fcurves).concat([le]).concat(bcurves), slen = segments.length;
    return new PolyBezier(segments);
  }
  outlineshapes(d1, d2, curveIntersectionThreshold) {
    d2 = d2 || d1;
    const outline = this.outline(d1, d2).curves;
    const shapes = [];
    for (let i2 = 1, len = outline.length; i2 < len / 2; i2++) {
      const shape = utils.makeshape(outline[i2], outline[len - i2], curveIntersectionThreshold);
      shape.startcap.virtual = i2 > 1;
      shape.endcap.virtual = i2 < len / 2 - 1;
      shapes.push(shape);
    }
    return shapes;
  }
  intersects(curve, curveIntersectionThreshold) {
    if (!curve)
      return this.selfintersects(curveIntersectionThreshold);
    if (curve.p1 && curve.p2) {
      return this.lineIntersects(curve);
    }
    if (curve instanceof Bezier) {
      curve = curve.reduce();
    }
    return this.curveintersects(this.reduce(), curve, curveIntersectionThreshold);
  }
  lineIntersects(line2) {
    const mx = min(line2.p1.x, line2.p2.x), my = min(line2.p1.y, line2.p2.y), MX = max(line2.p1.x, line2.p2.x), MY = max(line2.p1.y, line2.p2.y);
    return utils.roots(this.points, line2).filter((t3) => {
      var p = this.get(t3);
      return utils.between(p.x, mx, MX) && utils.between(p.y, my, MY);
    });
  }
  selfintersects(curveIntersectionThreshold) {
    const reduced = this.reduce(), len = reduced.length - 2, results = [];
    for (let i2 = 0, result, left, right; i2 < len; i2++) {
      left = reduced.slice(i2, i2 + 1);
      right = reduced.slice(i2 + 2);
      result = this.curveintersects(left, right, curveIntersectionThreshold);
      results.push(...result);
    }
    return results;
  }
  curveintersects(c1, c2, curveIntersectionThreshold) {
    const pairs = [];
    c1.forEach(function(l2) {
      c2.forEach(function(r2) {
        if (l2.overlaps(r2)) {
          pairs.push({ left: l2, right: r2 });
        }
      });
    });
    let intersections = [];
    pairs.forEach(function(pair) {
      const result = utils.pairiteration(pair.left, pair.right, curveIntersectionThreshold);
      if (result.length > 0) {
        intersections = intersections.concat(result);
      }
    });
    return intersections;
  }
  arcs(errorThreshold) {
    errorThreshold = errorThreshold || 0.5;
    return this._iterate(errorThreshold, []);
  }
  _error(pc, np1, s2, e2) {
    const q = (e2 - s2) / 4, c1 = this.get(s2 + q), c2 = this.get(e2 - q), ref = utils.dist(pc, np1), d1 = utils.dist(pc, c1), d2 = utils.dist(pc, c2);
    return abs2(d1 - ref) + abs2(d2 - ref);
  }
  _iterate(errorThreshold, circles) {
    let t_s = 0, t_e = 1, safety;
    do {
      safety = 0;
      t_e = 1;
      let np1 = this.get(t_s), np2, np3, arc2, prev_arc;
      let curr_good = false, prev_good = false, done;
      let t_m = t_e, prev_e = 1, step = 0;
      do {
        prev_good = curr_good;
        prev_arc = arc2;
        t_m = (t_s + t_e) / 2;
        step++;
        np2 = this.get(t_m);
        np3 = this.get(t_e);
        arc2 = utils.getccenter(np1, np2, np3);
        arc2.interval = {
          start: t_s,
          end: t_e
        };
        let error = this._error(arc2, np1, t_s, t_e);
        curr_good = error <= errorThreshold;
        done = prev_good && !curr_good;
        if (!done)
          prev_e = t_e;
        if (curr_good) {
          if (t_e >= 1) {
            arc2.interval.end = prev_e = 1;
            prev_arc = arc2;
            if (t_e > 1) {
              let d = {
                x: arc2.x + arc2.r * cos2(arc2.e),
                y: arc2.y + arc2.r * sin2(arc2.e)
              };
              arc2.e += utils.angle({ x: arc2.x, y: arc2.y }, d, this.get(1));
            }
            break;
          }
          t_e = t_e + (t_e - t_s) / 2;
        } else {
          t_e = t_m;
        }
      } while (!done && safety++ < 100);
      if (safety >= 100) {
        break;
      }
      prev_arc = prev_arc ? prev_arc : arc2;
      circles.push(prev_arc);
      t_s = prev_e;
    } while (t_e < 1);
    return circles;
  }
};

// src/geometry/Bezier.ts
var isQuadraticBezier = (path) => path.quadratic !== void 0;
var isCubicBezier = (path) => path.cubic1 !== void 0 && path.cubic2 !== void 0;
var quadraticBend = (a2, b, bend = 0) => quadraticSimple(a2, b, bend);
var quadraticSimple = (start, end, bend = 0) => {
  if (isNaN(bend))
    throw Error(`bend is NaN`);
  if (bend < -1 || bend > 1)
    throw Error(`Expects bend range of -1 to 1`);
  const middle = compute(start, end, 0.5);
  let target = middle;
  if (end.y < start.y) {
    target = bend > 0 ? { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y) } : { x: Math.max(start.x, end.x), y: Math.max(start.y, end.y) };
  } else {
    target = bend > 0 ? { x: Math.max(start.x, end.x), y: Math.min(start.y, end.y) } : { x: Math.min(start.x, end.x), y: Math.max(start.y, end.y) };
  }
  const handle = compute(middle, target, Math.abs(bend));
  return quadratic(start, end, handle);
};
var quadraticToSvgString = (start, end, handle) => `M ${start.x} ${start.y} Q ${handle.x} ${handle.y} ${end.x} ${end.y}`;
var toPath2 = (cubicOrQuadratic) => {
  if (isCubicBezier(cubicOrQuadratic)) {
    return cubicToPath(cubicOrQuadratic);
  } else if (isQuadraticBezier(cubicOrQuadratic)) {
    return quadratictoPath(cubicOrQuadratic);
  } else {
    throw new Error(`Unknown bezier type`);
  }
};
var cubic = (start, end, cubic1, cubic2) => ({
  a: Object.freeze(start),
  b: Object.freeze(end),
  cubic1: Object.freeze(cubic1),
  cubic2: Object.freeze(cubic2)
});
var cubicToPath = (cubic2) => {
  const { a: a2, cubic1, cubic2: cubic22, b } = cubic2;
  const bzr = new Bezier(a2, cubic1, cubic22, b);
  return Object.freeze({
    ...cubic2,
    length: () => bzr.length(),
    compute: (t3) => bzr.compute(t3),
    bbox: () => {
      const { x, y } = bzr.bbox();
      const xSize = x.size;
      const ySize = y.size;
      if (xSize === void 0)
        throw new Error(`x.size not present on calculated bbox`);
      if (ySize === void 0)
        throw new Error(`x.size not present on calculated bbox`);
      return fromTopLeft({ x: x.min, y: y.min }, xSize, ySize);
    },
    toString: () => bzr.toString(),
    toSvgString: () => `brrup`,
    kind: `bezier/cubic`
  });
};
var quadratic = (start, end, handle) => ({
  a: Object.freeze(start),
  b: Object.freeze(end),
  quadratic: Object.freeze(handle)
});
var quadratictoPath = (quadraticBezier2) => {
  const { a: a2, b, quadratic: quadratic2 } = quadraticBezier2;
  const bzr = new Bezier(a2, quadratic2, b);
  return Object.freeze({
    ...quadraticBezier2,
    length: () => bzr.length(),
    compute: (t3) => bzr.compute(t3),
    bbox: () => {
      const { x, y } = bzr.bbox();
      const xSize = x.size;
      const ySize = y.size;
      if (xSize === void 0)
        throw new Error(`x.size not present on calculated bbox`);
      if (ySize === void 0)
        throw new Error(`x.size not present on calculated bbox`);
      return fromTopLeft({ x: x.min, y: y.min }, xSize, ySize);
    },
    toString: () => bzr.toString(),
    toSvgString: () => quadraticToSvgString(a2, b, quadratic2),
    kind: `bezier/quadratic`
  });
};

// src/geometry/Path.ts
var Path_exports = {};
__export(Path_exports, {
  getEnd: () => getEnd,
  getStart: () => getStart
});
var getStart = function(path) {
  if (isQuadraticBezier(path))
    return path.a;
  else if (isLine(path))
    return path.a;
  else
    throw new Error(`Unknown path type ${JSON.stringify(path)}`);
};
var getEnd = function(path) {
  if (isQuadraticBezier(path))
    return path.b;
  else if (isLine(path))
    return path.b;
  else
    throw new Error(`Unknown path type ${JSON.stringify(path)}`);
};

// src/geometry/CompoundPath.ts
var CompoundPath_exports = {};
__export(CompoundPath_exports, {
  bbox: () => bbox3,
  compute: () => compute2,
  computeDimensions: () => computeDimensions,
  fromPaths: () => fromPaths,
  guardContinuous: () => guardContinuous,
  setSegment: () => setSegment,
  toString: () => toString3,
  toSvgString: () => toSvgString2
});
var setSegment = (compoundPath, index, path) => {
  const existing = compoundPath.segments;
  existing[index] = path;
  return fromPaths(...existing);
};
var compute2 = (paths2, t3, useWidth, dimensions) => {
  if (dimensions === void 0) {
    dimensions = computeDimensions(paths2);
  }
  const expected = t3 * (useWidth ? dimensions.totalWidth : dimensions.totalLength);
  let soFar = 0;
  const l2 = useWidth ? dimensions.widths : dimensions.lengths;
  for (let i2 = 0; i2 < l2.length; i2++) {
    if (soFar + l2[i2] >= expected) {
      const relative = expected - soFar;
      let amt = relative / l2[i2];
      if (amt > 1)
        amt = 1;
      return paths2[i2].compute(amt);
    } else
      soFar += l2[i2];
  }
  return { x: 0, y: 0 };
};
var computeDimensions = (paths2) => {
  const widths = paths2.map((l2) => l2.bbox().width);
  const lengths = paths2.map((l2) => l2.length());
  let totalLength = 0;
  let totalWidth = 0;
  for (let i2 = 0; i2 < lengths.length; i2++)
    totalLength += lengths[i2];
  for (let i2 = 0; i2 < widths.length; i2++)
    totalWidth += widths[i2];
  return { totalLength, totalWidth, widths, lengths };
};
var bbox3 = (paths2) => {
  const boxes = paths2.map((p) => p.bbox());
  const corners = boxes.map((b) => getCorners(b)).flat();
  return Point_exports.bbox(...corners);
};
var toString3 = (paths2) => paths2.map((p) => p.toString()).join(`, `);
var guardContinuous = (paths2) => {
  let lastPos = getEnd(paths2[0]);
  for (let i2 = 1; i2 < paths2.length; i2++) {
    const start = getStart(paths2[i2]);
    if (!Point_exports.equals(start, lastPos))
      throw new Error(`Path index ` + i2 + ` does not start at prior path end. Start: ` + start.x + `,` + start.y + ` expected: ` + lastPos.x + `,` + lastPos.y);
    lastPos = getEnd(paths2[i2]);
  }
};
var toSvgString2 = (paths2) => {
  const svg = paths2.map((p) => p.toSvgString());
  return svg.join(` `);
};
var fromPaths = (...paths2) => {
  guardContinuous(paths2);
  const dims = computeDimensions(paths2);
  return Object.freeze({
    segments: paths2,
    length: () => dims.totalLength,
    compute: (t3, useWidth = false) => compute2(paths2, t3, useWidth, dims),
    bbox: () => bbox3(paths2),
    toString: () => toString3(paths2),
    toSvgString: () => toSvgString2(paths2),
    kind: `compound`
  });
};

// src/geometry/Grid.ts
var Grid_exports = {};
__export(Grid_exports, {
  allDirections: () => allDirections,
  cellAtPoint: () => cellAtPoint,
  cellEquals: () => cellEquals,
  cellKeyString: () => cellKeyString,
  cellMiddle: () => cellMiddle,
  cells: () => cells,
  crossDirections: () => crossDirections,
  getLine: () => getLine,
  getVectorFromCardinal: () => getVectorFromCardinal,
  guard: () => guard4,
  inside: () => inside,
  isEqual: () => isEqual2,
  neighbours: () => neighbours,
  offset: () => offset,
  offsetCardinals: () => offsetCardinals,
  rectangleForCell: () => rectangleForCell,
  simpleLine: () => simpleLine,
  visitFor: () => visitFor,
  visitor: () => visitor,
  visitorBreadth: () => visitorBreadth,
  visitorColumn: () => visitorColumn,
  visitorDepth: () => visitorDepth,
  visitorRandom: () => visitorRandom,
  visitorRandomContiguous: () => visitorRandomContiguous,
  visitorRow: () => visitorRow
});

// src/util.ts
var clamp = (v2, min2 = 0, max2 = 1) => {
  if (Number.isNaN(v2))
    throw new Error(`v parameter is NaN`);
  if (Number.isNaN(min2))
    throw new Error(`min parameter is NaN`);
  if (Number.isNaN(max2))
    throw new Error(`max parameter is NaN`);
  if (v2 < min2)
    return min2;
  if (v2 > max2)
    return max2;
  return v2;
};
var clampZeroBounds = (v2, length2) => {
  if (!Number.isInteger(v2))
    throw new Error(`v parameter must be an integer (${v2})`);
  if (!Number.isInteger(length2))
    throw new Error(`length parameter must be an integer (${length2}, ${typeof length2})`);
  v2 = Math.round(v2);
  if (v2 < 0)
    return 0;
  if (v2 >= length2)
    return length2 - 1;
  return v2;
};
var getMinMaxAvg = (data) => {
  const validNumbers = data.filter((d) => typeof d === `number` && !Number.isNaN(d));
  const total = validNumbers.reduce((acc, v2) => acc + v2, 0);
  return {
    total,
    max: Math.max(...validNumbers),
    min: Math.min(...validNumbers),
    avg: total / validNumbers.length
  };
};
var sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
var isEqualDefault = (a2, b) => a2 === b;

// src/collections/Lists.ts
var Lists_exports = {};
__export(Lists_exports, {
  QueueOverflowPolicy: () => OverflowPolicy2,
  StackOverflowPolicy: () => OverflowPolicy,
  queue: () => queue,
  queueMutable: () => queueMutable,
  randomElement: () => randomElement,
  randomIndex: () => randomIndex,
  randomPluck: () => randomPluck,
  shuffle: () => shuffle,
  stack: () => stack,
  stackMutable: () => stackMutable,
  without: () => without
});

// src/collections/Stack.ts
var OverflowPolicy = /* @__PURE__ */ ((OverflowPolicy3) => {
  OverflowPolicy3[OverflowPolicy3["DiscardOlder"] = 0] = "DiscardOlder";
  OverflowPolicy3[OverflowPolicy3["DiscardNewer"] = 1] = "DiscardNewer";
  OverflowPolicy3[OverflowPolicy3["DiscardAdditions"] = 2] = "DiscardAdditions";
  return OverflowPolicy3;
})(OverflowPolicy || {});
var trimStack = (opts, stack2, toAdd) => {
  const potentialLength = stack2.length + toAdd.length;
  const policy = opts.overflowPolicy ?? 2 /* DiscardAdditions */;
  const capacity = opts.capacity ?? potentialLength;
  const toRemove = potentialLength - capacity;
  if (opts.debug)
    console.log(`Stack.push: stackLen: ${stack2.length} potentialLen: ${potentialLength} toRemove: ${toRemove} policy: ${OverflowPolicy[policy]}`);
  switch (policy) {
    case 2 /* DiscardAdditions */:
      if (opts.debug)
        console.log(`Stack.push:DiscardAdditions: stackLen: ${stack2.length} slice: ${potentialLength - capacity} toAddLen: ${toAdd.length}`);
      if (stack2.length === opts.capacity) {
        return stack2;
      } else {
        return [...stack2, ...toAdd.slice(0, toAdd.length - toRemove)];
      }
    case 1 /* DiscardNewer */:
      if (toRemove >= stack2.length) {
        return toAdd.slice(Math.max(0, toAdd.length - capacity), Math.min(toAdd.length, capacity) + 1);
      } else {
        if (opts.debug)
          console.log(` from orig: ${stack2.slice(0, toRemove - 1)}`);
        return [...stack2.slice(0, toRemove - 1), ...toAdd.slice(0, Math.min(toAdd.length, capacity - toRemove + 1))];
      }
    case 0 /* DiscardOlder */:
      return [...stack2, ...toAdd].slice(toRemove);
    default:
      throw new Error(`Unknown overflow policy ${policy}`);
  }
};
var push = (opts, stack2, ...toAdd) => {
  const potentialLength = stack2.length + toAdd.length;
  const overSize = opts.capacity && potentialLength > opts.capacity;
  const toReturn = overSize ? trimStack(opts, stack2, toAdd) : [...stack2, ...toAdd];
  return toReturn;
};
var pop = (opts, stack2) => {
  if (stack2.length === 0)
    throw new Error(`Stack is empty`);
  return stack2.slice(0, stack2.length - 1);
};
var peek = (opts, stack2) => stack2[stack2.length - 1];
var isEmpty = (opts, stack2) => stack2.length === 0;
var isFull = (opts, stack2) => {
  if (opts.capacity) {
    return stack2.length >= opts.capacity;
  }
  return false;
};
var Stack = class {
  constructor(opts, data) {
    __publicField(this, "opts");
    __publicField(this, "data");
    this.opts = opts;
    this.data = data;
  }
  push(...toAdd) {
    return new Stack(this.opts, push(this.opts, this.data, ...toAdd));
  }
  pop() {
    return new Stack(this.opts, pop(this.opts, this.data));
  }
  forEach(fn) {
    this.data.forEach(fn);
  }
  forEachFromTop(fn) {
    [...this.data].reverse().forEach(fn);
  }
  get isEmpty() {
    return isEmpty(this.opts, this.data);
  }
  get isFull() {
    return isFull(this.opts, this.data);
  }
  get peek() {
    return peek(this.opts, this.data);
  }
  get length() {
    return this.data.length;
  }
};
var stack = (opts = {}, ...startingItems) => new Stack({ ...opts }, [...startingItems]);
var MutableStack = class {
  constructor(opts, data) {
    __publicField(this, "opts");
    __publicField(this, "data");
    this.opts = opts;
    this.data = data;
  }
  push(...toAdd) {
    this.data = push(this.opts, this.data, ...toAdd);
    return this.data.length;
  }
  pop() {
    const v2 = peek(this.opts, this.data);
    pop(this.opts, this.data);
    return v2;
  }
  get isEmpty() {
    return isEmpty(this.opts, this.data);
  }
  get isFull() {
    return isFull(this.opts, this.data);
  }
  get peek() {
    return peek(this.opts, this.data);
  }
  get length() {
    return this.data.length;
  }
};
var stackMutable = (opts, ...startingItems) => new MutableStack({ ...opts }, [...startingItems]);

// src/collections/Queue.ts
var OverflowPolicy2 = /* @__PURE__ */ ((OverflowPolicy3) => {
  OverflowPolicy3[OverflowPolicy3["DiscardOlder"] = 0] = "DiscardOlder";
  OverflowPolicy3[OverflowPolicy3["DiscardNewer"] = 1] = "DiscardNewer";
  OverflowPolicy3[OverflowPolicy3["DiscardAdditions"] = 2] = "DiscardAdditions";
  return OverflowPolicy3;
})(OverflowPolicy2 || {});
var debug = (opts, msg) => {
  opts.debug ? console.log(`queue:${msg}`) : null;
};
var trimQueue = (opts, queue2, toAdd) => {
  const potentialLength = queue2.length + toAdd.length;
  const capacity = opts.capacity ?? potentialLength;
  const toRemove = potentialLength - capacity;
  const policy = opts.overflowPolicy ?? 2 /* DiscardAdditions */;
  debug(opts, `queueLen: ${queue2.length} potentialLen: ${potentialLength} toRemove: ${toRemove} policy: ${OverflowPolicy2[policy]}`);
  switch (policy) {
    case 2 /* DiscardAdditions */:
      debug(opts, `enqueue:DiscardAdditions: queueLen: ${queue2.length} slice: ${potentialLength - capacity} toAddLen: ${toAdd.length}`);
      if (queue2.length === opts.capacity) {
        return queue2;
      } else {
        return [...queue2, ...toAdd.slice(0, toRemove - 1)];
      }
    case 1 /* DiscardNewer */:
      if (toRemove >= queue2.length) {
        return toAdd.slice(Math.max(0, toAdd.length - capacity), Math.min(toAdd.length, capacity) + 1);
      } else {
        debug(opts, ` from orig: ${queue2.slice(0, toRemove - 1)}`);
        return [...queue2.slice(0, toRemove - 1), ...toAdd.slice(0, Math.min(toAdd.length, capacity - toRemove + 1))];
      }
    case 0 /* DiscardOlder */:
      return [...queue2, ...toAdd].slice(toRemove);
    default:
      throw new Error(`Unknown overflow policy ${policy}`);
  }
};
var enqueue = (opts, queue2, ...toAdd) => {
  if (opts === void 0)
    throw new Error(`opts parameter undefined`);
  const potentialLength = queue2.length + toAdd.length;
  const overSize = opts.capacity && potentialLength > opts.capacity;
  const toReturn = overSize ? trimQueue(opts, queue2, toAdd) : [...queue2, ...toAdd];
  if (opts.capacity && toReturn.length !== opts.capacity && overSize)
    throw new Error(`Bug! Expected return to be at capacity. Return len: ${toReturn.length} capacity: ${opts.capacity} opts: ${JSON.stringify(opts)}`);
  if (!opts.capacity && toReturn.length !== potentialLength)
    throw new Error(`Bug! Return length not expected. Return len: ${toReturn.length} expected: ${potentialLength} opts: ${JSON.stringify(opts)}`);
  return toReturn;
};
var dequeue = (opts, queue2) => {
  if (queue2.length === 0)
    throw new Error(`Queue is empty`);
  return queue2.slice(1);
};
var peek2 = (opts, queue2) => queue2[0];
var isEmpty2 = (opts, queue2) => queue2.length === 0;
var isFull2 = (opts, queue2) => {
  if (opts.capacity) {
    return queue2.length >= opts.capacity;
  }
  return false;
};
var Queue = class {
  constructor(opts, data) {
    __publicField(this, "opts");
    __publicField(this, "data");
    if (opts === void 0)
      throw new Error(`opts parameter undefined`);
    this.opts = opts;
    this.data = data;
  }
  enqueue(...toAdd) {
    return new Queue(this.opts, enqueue(this.opts, this.data, ...toAdd));
  }
  dequeue() {
    return new Queue(this.opts, dequeue(this.opts, this.data));
  }
  get isEmpty() {
    return isEmpty2(this.opts, this.data);
  }
  get isFull() {
    return isFull2(this.opts, this.data);
  }
  get length() {
    return this.data.length;
  }
  get peek() {
    return peek2(this.opts, this.data);
  }
};
var queue = (opts = {}, ...startingItems) => {
  opts = { ...opts };
  return new Queue(opts, [...startingItems]);
};
var MutableQueueImpl = class {
  constructor(opts, data) {
    __publicField(this, "opts");
    __publicField(this, "data");
    if (opts === void 0)
      throw new Error(`opts parameter undefined`);
    this.opts = opts;
    this.data = data;
  }
  enqueue(...toAdd) {
    this.data = enqueue(this.opts, this.data, ...toAdd);
    return this.data.length;
  }
  dequeue() {
    const v2 = peek2(this.opts, this.data);
    this.data = dequeue(this.opts, this.data);
    return v2;
  }
  get isEmpty() {
    return isEmpty2(this.opts, this.data);
  }
  get isFull() {
    return isFull2(this.opts, this.data);
  }
  get length() {
    return this.data.length;
  }
  get peek() {
    return peek2(this.opts, this.data);
  }
};
var queueMutable = (opts = {}, ...startingItems) => new MutableQueueImpl({ ...opts }, [...startingItems]);

// src/collections/Lists.ts
var randomIndex = (array2) => Math.floor(Math.random() * array2.length);
var randomElement = (array2) => array2[Math.floor(Math.random() * array2.length)];
var randomPluck = (array2, mutate = false) => {
  if (array2 === void 0)
    throw new Error(`array is undefined`);
  if (!Array.isArray(array2))
    throw new Error(`'array' param is not an array`);
  if (array2.length === 0)
    return { value: void 0, array: [] };
  const index = randomIndex(array2);
  if (mutate) {
    return {
      value: array2[index],
      array: array2.splice(index, 1)
    };
  } else {
    const t3 = [...array2];
    t3.splice(index, 1);
    return {
      value: array2[index],
      array: t3
    };
  }
};
var shuffle = (dataToShuffle) => {
  const array2 = [...dataToShuffle];
  for (let i2 = array2.length - 1; i2 > 0; i2--) {
    const j = Math.floor(Math.random() * (i2 + 1));
    [array2[i2], array2[j]] = [array2[j], array2[i2]];
  }
  return array2;
};
var without = (data, value, comparer = isEqualDefault) => data.filter((v2) => !comparer(v2, value));

// src/collections/Set.ts
var Set_exports = {};
__export(Set_exports, {
  addUniqueByHash: () => addUniqueByHash,
  mutableStringSet: () => mutableStringSet
});

// src/collections/SimpleMutableMapArray.ts
var _map;
var SimpleMutableMapArray = class {
  constructor() {
    __privateAdd(this, _map, /* @__PURE__ */ new Map());
  }
  add(key, ...values) {
    const existing = __privateGet(this, _map).get(key);
    if (existing === void 0) {
      __privateGet(this, _map).set(key, values);
    } else {
      __privateGet(this, _map).set(key, [...existing, ...values]);
    }
  }
  debugString() {
    let r2 = ``;
    const keys = Array.from(__privateGet(this, _map).keys());
    keys.every((k) => {
      const v2 = __privateGet(this, _map).get(k);
      if (v2 === void 0)
        return;
      r2 += k + ` (${v2.length}) = ${JSON.stringify(v2)}\r
`;
    });
    return r2;
  }
  get(key) {
    return __privateGet(this, _map).get(key);
  }
  delete(key, v2) {
    const existing = __privateGet(this, _map).get(key);
    if (existing === void 0)
      return false;
    const without2 = existing.filter((i2) => i2 !== v2);
    __privateGet(this, _map).set(key, without2);
    return without2.length < existing.length;
  }
  clear() {
    __privateGet(this, _map).clear();
  }
};
_map = new WeakMap();

// src/Events.ts
var _listeners;
var SimpleEventEmitter = class {
  constructor() {
    __privateAdd(this, _listeners, new SimpleMutableMapArray());
  }
  fireEvent(type, args) {
    const listeners = __privateGet(this, _listeners).get(type);
    if (listeners === void 0)
      return;
    listeners.forEach((l2) => {
      try {
        l2(args, this);
      } catch (err) {
        console.debug(`Event listener error: `, err);
      }
    });
  }
  addEventListener(type, listener) {
    __privateGet(this, _listeners).add(type, listener);
  }
  removeEventListener(type, listener) {
    __privateGet(this, _listeners).delete(type, listener);
  }
  clearEventListeners() {
    __privateGet(this, _listeners).clear();
  }
};
_listeners = new WeakMap();

// src/collections/Set.ts
var addUniqueByHash = (set, hashFunc, ...values) => {
  const s2 = set === void 0 ? /* @__PURE__ */ new Map() : new Map(set);
  values.forEach((v2) => {
    const vStr = hashFunc(v2);
    if (s2.has(vStr))
      return;
    s2.set(vStr, v2);
  });
  return s2;
};
var mutableStringSet = (keyString = void 0) => new MutableStringSetImpl(keyString);
var MutableStringSetImpl = class extends SimpleEventEmitter {
  constructor(keyString = void 0) {
    super();
    __publicField(this, "store", /* @__PURE__ */ new Map());
    __publicField(this, "keyString");
    if (keyString === void 0) {
      keyString = (a2) => {
        if (typeof a2 === `string`) {
          return a2;
        } else {
          return JSON.stringify(a2);
        }
      };
    }
    this.keyString = keyString;
  }
  add(...v2) {
    v2.forEach((i2) => {
      const isUpdated = this.has(i2);
      this.store.set(this.keyString(i2), i2);
      super.fireEvent(`add`, { value: i2, updated: isUpdated });
    });
  }
  values() {
    return this.store.values();
  }
  clear() {
    this.store.clear();
    super.fireEvent(`clear`, true);
  }
  delete(v2) {
    const isDeleted = this.store.delete(this.keyString(v2));
    if (isDeleted)
      super.fireEvent(`delete`, v2);
    return isDeleted;
  }
  has(v2) {
    return this.store.has(this.keyString(v2));
  }
  toArray() {
    return Array.from(this.store.values());
  }
};

// src/collections/util.ts
var zipKeyValue = (keys, values) => {
  if (keys.length !== values.length)
    throw new Error(`Keys and values arrays should be same length`);
  return Object.fromEntries(keys.map((k, i2) => [k, values[i2]]));
};

// src/geometry/Grid.ts
var isCell = (c2) => {
  if (c2 === void 0)
    return false;
  return `x` in c2 && `y` in c2;
};
var isNeighbour = (n2) => {
  if (n2 === void 0)
    return false;
  if (n2[1] === void 0)
    return false;
  return true;
};
var isEqual2 = (a2, b) => {
  if (`rows` in a2 && `cols` in a2) {
    if (`rows` in b && `cols` in b) {
      if (a2.rows !== b.rows || a2.cols !== b.cols)
        return false;
    } else
      return false;
  }
  if (`size` in a2) {
    if (`size` in b) {
      if (a2.size !== b.size)
        return false;
    } else
      return false;
  }
  return true;
};
var cellKeyString = (v2) => `Cell{${v2.x},${v2.y}}`;
var cellEquals = (a2, b) => {
  if (b === void 0)
    return false;
  if (a2 === void 0)
    return false;
  return a2.x === b.x && a2.y === b.y;
};
var guard4 = (a2, paramName = `Param`, grid) => {
  if (a2 === void 0)
    throw new Error(paramName + ` is undefined. Expecting {x,y}`);
  if (a2.x === void 0)
    throw new Error(paramName + `.x is undefined`);
  if (a2.y === void 0)
    throw new Error(paramName + `.y is undefined`);
  if (!Number.isInteger(a2.x))
    throw new Error(paramName + `.x is non-integer`);
  if (!Number.isInteger(a2.y))
    throw new Error(paramName + `.y is non-integer`);
  if (grid !== void 0) {
    if (!inside(grid, a2))
      throw new Error(`${paramName} is outside of grid. Cell: ${a2.x},${a2.y} Grid: ${grid.cols}, ${grid.rows}`);
  }
};
var guardGrid = (g, paramName = `Param`) => {
  if (g === void 0)
    throw new Error(`${paramName} is undefined. Expecting grid.`);
  if (!(`rows` in g))
    throw new Error(`${paramName}.rows is undefined`);
  if (!(`cols` in g))
    throw new Error(`${paramName}.cols is undefined`);
  if (!Number.isInteger(g.rows))
    throw new Error(`${paramName}.rows is not an integer`);
  if (!Number.isInteger(g.cols))
    throw new Error(`${paramName}.cols is not an integer`);
};
var inside = (grid, cell) => {
  if (cell.x < 0 || cell.y < 0)
    return false;
  if (cell.x >= grid.cols || cell.y >= grid.rows)
    return false;
  return true;
};
var rectangleForCell = (cell, grid) => {
  guard4(cell);
  const size = grid.size;
  const x = cell.x * size;
  const y = cell.y * size;
  const r2 = fromTopLeft({ x, y }, size, size);
  return r2;
};
var cellAtPoint = (position, grid) => {
  const size = grid.size;
  if (position.x < 0 || position.y < 0)
    return;
  const x = Math.floor(position.x / size);
  const y = Math.floor(position.y / size);
  if (x >= grid.cols)
    return;
  if (y >= grid.rows)
    return;
  return { x, y };
};
var allDirections = Object.freeze([`n`, `ne`, `nw`, `e`, `s`, `se`, `sw`, `w`]);
var crossDirections = Object.freeze([`n`, `e`, `s`, `w`]);
var neighbours = (grid, cell, bounds = `undefined`, directions) => {
  const dirs = directions ?? allDirections;
  const points = dirs.map((c2) => offset(grid, cell, getVectorFromCardinal(c2), bounds));
  return zipKeyValue(dirs, points);
};
var cellMiddle = (cell, grid) => {
  guard4(cell);
  const size = grid.size;
  const x = cell.x * size;
  const y = cell.y * size;
  return Object.freeze({ x: x + size / 2, y: y + size / 2 });
};
var getLine = (start, end) => {
  guard4(start);
  guard4(end);
  let startX = start.x;
  let startY = start.y;
  const dx = Math.abs(end.x - startX);
  const dy = Math.abs(end.y - startY);
  const sx = startX < end.x ? 1 : -1;
  const sy = startY < end.y ? 1 : -1;
  let err = dx - dy;
  const cells2 = [];
  while (true) {
    cells2.push(Object.freeze({ x: startX, y: startY }));
    if (startX === end.x && startY === end.y)
      break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      startX += sx;
    }
    if (e2 < dx) {
      err += dx;
      startY += sy;
    }
  }
  return cells2;
};
var offsetCardinals = (grid, start, steps, bounds = `stop`) => {
  integer(steps, `steps`, true);
  if (steps < 1)
    throw new Error(`steps should be above zero`);
  const directions = allDirections;
  const vectors = directions.map((d) => getVectorFromCardinal(d, steps));
  const cells2 = directions.map((d, i2) => offset(grid, start, vectors[i2], bounds));
  return zipKeyValue(directions, cells2);
};
var getVectorFromCardinal = (cardinal, multiplier = 1) => {
  let v2;
  switch (cardinal) {
    case `n`:
      v2 = { x: 0, y: -1 * multiplier };
      break;
    case `ne`:
      v2 = { x: 1 * multiplier, y: -1 * multiplier };
      break;
    case `e`:
      v2 = { x: 1 * multiplier, y: 0 };
      break;
    case `se`:
      v2 = { x: 1 * multiplier, y: 1 * multiplier };
      break;
    case `s`:
      v2 = { x: 0, y: 1 * multiplier };
      break;
    case `sw`:
      v2 = { x: -1 * multiplier, y: 1 * multiplier };
      break;
    case `w`:
      v2 = { x: -1 * multiplier, y: 0 };
      break;
    case `nw`:
      v2 = { x: -1 * multiplier, y: -1 * multiplier };
      break;
    default:
      v2 = { x: 0, y: 0 };
  }
  return Object.freeze(v2);
};
var simpleLine = function(start, end, endInclusive = false) {
  const cells2 = [];
  if (start.x === end.x) {
    const lastY = endInclusive ? end.y + 1 : end.y;
    for (let y = start.y; y < lastY; y++) {
      cells2.push({ x: start.x, y });
    }
  } else if (start.y === end.y) {
    const lastX = endInclusive ? end.x + 1 : end.x;
    for (let x = start.x; x < lastX; x++) {
      cells2.push({ x, y: start.y });
    }
  } else {
    throw new Error(`Only does vertical and horizontal: ${start.x},${start.y} - ${end.x},${end.y}`);
  }
  return cells2;
};
var offset = function(grid, start, vector, bounds = `undefined`) {
  guard4(start, `start`, grid);
  guard4(vector);
  guardGrid(grid, `grid`);
  let x = start.x;
  let y = start.y;
  switch (bounds) {
    case `wrap`:
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
    case `stop`:
      x += vector.x;
      y += vector.y;
      x = clampZeroBounds(x, grid.cols);
      y = clampZeroBounds(y, grid.rows);
      break;
    case `undefined`:
      x += vector.x;
      y += vector.y;
      if (x < 0 || y < 0)
        return;
      if (x >= grid.cols || y >= grid.rows)
        return;
      break;
    case `unbounded`:
      x += vector.x;
      y += vector.y;
      break;
    default:
      throw new Error(`Unknown BoundsLogic case ${bounds}`);
  }
  return Object.freeze({ x, y });
};
var neighbourList = (grid, cell, directions, bounds) => {
  const cellNeighbours = neighbours(grid, cell, bounds, directions);
  const entries = Object.entries(cellNeighbours);
  return entries.filter(isNeighbour);
};
var visitor = function* (logic, grid, start, opts = {}) {
  guardGrid(grid, `grid`);
  guard4(start, `start`, grid);
  const v2 = opts.visited ?? mutableStringSet((c2) => cellKeyString(c2));
  const possibleNeighbours = logic.options ? logic.options : (g, c2) => neighbourList(g, c2, crossDirections, `undefined`);
  if (!isCell(start))
    throw new Error(`'start' parameter is undefined or not a cell`);
  let cellQueue = [start];
  let moveQueue = [];
  let current = null;
  while (cellQueue.length > 0) {
    if (current === null) {
      const nv = cellQueue.pop();
      if (nv === void 0) {
        break;
      }
      current = nv;
    }
    if (!v2.has(current)) {
      v2.add(current);
      yield current;
      const nextSteps = possibleNeighbours(grid, current).filter((step) => !v2.has(step[1]));
      if (nextSteps.length === 0) {
        if (current !== null) {
          cellQueue = cellQueue.filter((cq) => cellEquals(cq, current));
        }
      } else {
        moveQueue.push(...nextSteps);
      }
    }
    moveQueue = moveQueue.filter((step) => !v2.has(step[1]));
    if (moveQueue.length === 0) {
      current = null;
    } else {
      const potential = logic.select(moveQueue);
      if (potential !== void 0) {
        cellQueue.push(potential[1]);
        current = potential[1];
      }
    }
  }
};
var visitorDepth = (grid, start, opts = {}) => visitor({
  select: (nbos) => nbos[nbos.length - 1]
}, grid, start, opts);
var visitorBreadth = (grid, start, opts = {}) => visitor({
  select: (nbos) => nbos[0]
}, grid, start, opts);
var randomNeighbour = (nbos) => randomElement(nbos);
var visitorRandomContiguous = (grid, start, opts = {}) => visitor({
  select: randomNeighbour
}, grid, start, opts);
var visitorRandom = (grid, start, opts = {}) => visitor({
  options: (grid2, cell) => {
    const t3 = [];
    for (const c2 of cells(grid2, cell)) {
      t3.push([`n`, c2]);
    }
    return t3;
  },
  select: randomNeighbour
}, grid, start, opts);
var visitorRow = (grid, start, opts = {}) => {
  const { reversed = false } = opts;
  const neighbourSelect = (nbos) => nbos.find((n2) => n2[0] === (reversed ? `w` : `e`));
  const possibleNeighbours = (grid2, cell) => {
    if (reversed) {
      if (cell.x > 0) {
        cell = { x: cell.x - 1, y: cell.y };
      } else {
        if (cell.y > 0) {
          cell = { x: grid2.cols - 1, y: cell.y - 1 };
        } else {
          cell = { x: grid2.cols - 1, y: grid2.rows - 1 };
        }
      }
    } else {
      if (cell.x < grid2.rows - 1) {
        cell = { x: cell.x + 1, y: cell.y };
      } else {
        if (cell.y < grid2.rows - 1) {
          cell = { x: 0, y: cell.y + 1 };
        } else {
          cell = { x: 0, y: 0 };
        }
      }
    }
    return [[reversed ? `w` : `e`, cell]];
  };
  const logic = {
    select: neighbourSelect,
    options: possibleNeighbours
  };
  return visitor(logic, grid, start, opts);
};
var visitFor = (grid, start, steps, visitor2) => {
  integer(steps, `steps`);
  const opts = {
    reversed: steps < 0
  };
  steps = Math.abs(steps);
  let c2 = start;
  let v2 = visitor2(grid, start, opts);
  v2.next();
  let stepsMade = 0;
  while (stepsMade < steps) {
    stepsMade++;
    const { value } = v2.next();
    if (value) {
      c2 = value;
      if (opts.debug)
        console.log(`stepsMade: ${stepsMade} cell: ${c2.x}, ${c2.y} reverse: ${opts.reversed}`);
    } else {
      if (steps >= grid.cols * grid.rows) {
        steps -= grid.cols * grid.rows;
        stepsMade = 0;
        v2 = visitor2(grid, start, opts);
        v2.next();
        c2 = start;
        if (opts.debug)
          console.log(`resetting visitor to ${steps}`);
      } else
        throw new Error(`Value not received by visitor`);
    }
  }
  return c2;
};
var visitorColumn = (grid, start, opts = {}) => {
  const { reversed = false } = opts;
  const logic = {
    select: (nbos) => nbos.find((n2) => n2[0] === (reversed ? `n` : `s`)),
    options: (grid2, cell) => {
      if (reversed) {
        if (cell.y > 0) {
          cell = { x: cell.x, y: cell.y - 1 };
        } else {
          if (cell.x === 0) {
            cell = { x: grid2.cols - 1, y: grid2.rows - 1 };
          } else {
            cell = { x: cell.x - 1, y: grid2.rows - 1 };
          }
        }
      } else {
        if (cell.y < grid2.rows - 1) {
          cell = { x: cell.x, y: cell.y + 1 };
        } else {
          if (cell.x < grid2.cols - 1) {
            cell = { x: cell.x + 1, y: 0 };
          } else {
            cell = { x: 0, y: 0 };
          }
        }
      }
      return [[reversed ? `n` : `s`, cell]];
    }
  };
  return visitor(logic, grid, start, opts);
};
var cells = function* (grid, start = { x: 0, y: 0 }) {
  guardGrid(grid, `grid`);
  guard4(start, `start`, grid);
  let { x, y } = start;
  let canMove = true;
  do {
    yield { x, y };
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
      canMove = false;
  } while (canMove);
};

// src/modulation/Envelope.ts
var Envelope_exports = {};
__export(Envelope_exports, {
  adsr: () => adsr,
  defaultAdsrOpts: () => defaultAdsrOpts
});

// src/Timer.ts
var msRelativeTimer = () => {
  let start = window.performance.now();
  return {
    reset: () => {
      start = window.performance.now();
    },
    elapsed: () => window.performance.now() - start
  };
};

// src/StateMachine.ts
var fromList = (...states) => {
  const t3 = {};
  for (let i2 = 0; i2 < states.length; i2++) {
    if (i2 === states.length - 1) {
      t3[states[i2]] = null;
    } else {
      t3[states[i2]] = states[i2 + 1];
    }
  }
  return t3;
};
var _state, _debug, _m, _isDone, _initial;
var _StateMachine = class extends SimpleEventEmitter {
  constructor(initial, m2, opts = { debug: false }) {
    super();
    __privateAdd(this, _state, void 0);
    __privateAdd(this, _debug, void 0);
    __privateAdd(this, _m, void 0);
    __privateAdd(this, _isDone, void 0);
    __privateAdd(this, _initial, void 0);
    const [isValid, errorMsg] = _StateMachine.validate(initial, m2);
    if (!isValid)
      throw new Error(errorMsg);
    __privateSet(this, _initial, initial);
    __privateSet(this, _m, m2);
    __privateSet(this, _debug, opts.debug ?? false);
    __privateSet(this, _state, initial);
    __privateSet(this, _isDone, false);
  }
  get states() {
    return Object.keys(__privateGet(this, _m));
  }
  static validate(initial, m2) {
    const keys = Object.keys(m2);
    const finalStates = [];
    const seenKeys = /* @__PURE__ */ new Set();
    const seenVals = /* @__PURE__ */ new Set();
    for (let i2 = 0; i2 < keys.length; i2++) {
      const key = keys[i2];
      if (seenKeys.has(key))
        return [false, `Key ${key} is already used`];
      seenKeys.add(key);
      if (typeof keys[i2] !== `string`)
        return [false, `Key[${i2}] is not a string`];
      const val = m2[key];
      if (val === void 0)
        return [false, `Key ${key} value is undefined`];
      if (typeof val === `string`) {
        seenVals.add(val);
        if (val === key)
          return [false, `Loop present for ${key}`];
      } else if (Array.isArray(val)) {
        if (!isStringArray(val))
          return [false, `Key ${key} value is not an array of strings`];
        val.forEach((v2) => seenVals.add(v2));
        if (val.find((v2) => v2 === key))
          return [false, `Loop present for ${key}`];
      } else if (val === null) {
        finalStates.push(key);
      } else {
        return [false, `Key ${key} has a value that is neither null, string or array`];
      }
    }
    const seenValsArray = Array.from(seenVals);
    const missing = seenValsArray.find((v2) => !seenKeys.has(v2));
    if (missing)
      return [false, `Potential state '${missing}' does not exist as a top-level state`];
    if (m2[initial] === void 0)
      return [false, `Initial state ${initial} not present`];
    return [true, ``];
  }
  next() {
    const r2 = __privateGet(this, _m)[__privateGet(this, _state)];
    if (r2 === null)
      return null;
    if (Array.isArray(r2)) {
      if (typeof r2[0] === `string`)
        this.state = r2[0];
      else
        throw new Error(`Error in machine description. Potential state array does not contain strings`);
    } else if (typeof r2 === `string`) {
      this.state = r2;
    } else
      throw new Error(`Error in machine description. Potential state is neither array nor string`);
    return this.state;
  }
  get isDone() {
    return __privateGet(this, _isDone);
  }
  reset() {
    __privateSet(this, _isDone, false);
    __privateSet(this, _state, __privateGet(this, _initial));
  }
  static isValid(priorState, newState, description) {
    if (description[newState] === void 0)
      return [false, `Machine cannot change to non-existent state ${newState}`];
    const rules = description[priorState];
    if (Array.isArray(rules)) {
      if (!rules.includes(newState))
        return [false, `Machine cannot ${priorState} -> ${newState}. Allowed transitions: ${rules.join(`, `)}`];
    } else {
      if (newState !== rules && rules !== `*`)
        return [false, `Machine cannot ${priorState} -> ${newState}. Allowed transition: ${rules}`];
    }
    return [true, `ok`];
  }
  isValid(newState) {
    return _StateMachine.isValid(this.state, newState, __privateGet(this, _m));
  }
  set state(newState) {
    const priorState = __privateGet(this, _state);
    const [isValid, errorMsg] = _StateMachine.isValid(priorState, newState, __privateGet(this, _m));
    if (!isValid)
      throw new Error(errorMsg);
    if (__privateGet(this, _debug))
      console.log(`StateMachine: ${priorState} -> ${newState}`);
    __privateSet(this, _state, newState);
    const rules = __privateGet(this, _m)[newState];
    if (rules === null) {
      __privateSet(this, _isDone, true);
    }
    setTimeout(() => {
      this.fireEvent(`change`, { newState, priorState });
      if (this.isDone)
        this.fireEvent(`stop`, { state: newState });
    }, 1);
  }
  get state() {
    return __privateGet(this, _state);
  }
};
var StateMachine = _StateMachine;
_state = new WeakMap();
_debug = new WeakMap();
_m = new WeakMap();
_isDone = new WeakMap();
_initial = new WeakMap();

// src/modulation/Envelope.ts
var defaultAdsrOpts = () => ({
  attackBend: -1,
  decayBend: -0.3,
  releaseBend: -0.3,
  peakLevel: 1,
  initialLevel: 0,
  sustainLevel: 0.6,
  releaseLevel: 0,
  attackDuration: 600,
  decayDuration: 200,
  releaseDuration: 800,
  shouldLoop: false
});
var _sm, _timeSource, _timer, _holding, _holdingInitial;
var AdsrBase = class extends SimpleEventEmitter {
  constructor(opts) {
    super();
    __privateAdd(this, _sm, void 0);
    __privateAdd(this, _timeSource, void 0);
    __privateAdd(this, _timer, void 0);
    __privateAdd(this, _holding, void 0);
    __privateAdd(this, _holdingInitial, void 0);
    __publicField(this, "attackDuration");
    __publicField(this, "decayDuration");
    __publicField(this, "releaseDuration");
    __publicField(this, "decayDurationTotal");
    __publicField(this, "shouldLoop");
    this.attackDuration = opts.attackDuration ?? 300;
    this.decayDuration = opts.decayDuration ?? 500;
    this.releaseDuration = opts.releaseDuration ?? 1e3;
    this.shouldLoop = opts.shouldLoop ?? false;
    const descr = fromList(`attack`, `decay`, `sustain`, `release`, `complete`);
    __privateSet(this, _sm, new StateMachine(`attack`, descr));
    __privateGet(this, _sm).addEventListener(`change`, (ev) => {
      super.fireEvent(`change`, ev);
    });
    __privateGet(this, _sm).addEventListener(`stop`, (ev) => {
      super.fireEvent(`complete`, ev);
    });
    __privateSet(this, _timeSource, msRelativeTimer);
    __privateSet(this, _holding, __privateSet(this, _holdingInitial, false));
    this.decayDurationTotal = this.attackDuration + this.decayDuration;
  }
  switchState() {
    if (__privateGet(this, _timer) === void 0)
      return;
    let elapsed = __privateGet(this, _timer).elapsed();
    let hasChanged = false;
    do {
      hasChanged = false;
      switch (__privateGet(this, _sm).state) {
        case `attack`:
          if (elapsed > this.attackDuration) {
            __privateGet(this, _sm).next();
            hasChanged = true;
          }
          break;
        case `decay`:
          if (elapsed > this.decayDurationTotal) {
            __privateGet(this, _sm).next();
            hasChanged = true;
          }
          break;
        case `sustain`:
          if (!__privateGet(this, _holding)) {
            elapsed = 0;
            __privateGet(this, _timer)?.reset();
            __privateGet(this, _sm).next();
            hasChanged = true;
          }
          break;
        case `release`:
          if (elapsed > this.releaseDuration) {
            __privateGet(this, _sm).next();
            hasChanged = true;
          }
          break;
        case `complete`:
          if (this.shouldLoop) {
            this.trigger(__privateGet(this, _holdingInitial));
          }
      }
    } while (hasChanged);
  }
  computeRaw() {
    if (__privateGet(this, _timer) === void 0)
      return [void 0, 0];
    this.switchState();
    const elapsed = __privateGet(this, _timer).elapsed();
    let relative = 0;
    const state = __privateGet(this, _sm).state;
    switch (state) {
      case `attack`:
        relative = elapsed / this.attackDuration;
        break;
      case `decay`:
        relative = (elapsed - this.attackDuration) / this.decayDuration;
        break;
      case `sustain`:
        relative = 1;
        break;
      case `release`:
        relative = elapsed / this.releaseDuration;
        break;
      case `complete`:
        return [void 0, 0];
      default:
        throw new Error(`State machine in unknown state: ${state}`);
    }
    return [state, relative];
  }
  get isDone() {
    return __privateGet(this, _sm).isDone;
  }
  trigger(hold = false) {
    __privateGet(this, _sm).reset();
    __privateSet(this, _timer, __privateGet(this, _timeSource).call(this));
    __privateSet(this, _holding, hold);
    __privateSet(this, _holdingInitial, hold);
  }
  release() {
    __privateSet(this, _holding, false);
  }
};
_sm = new WeakMap();
_timeSource = new WeakMap();
_timer = new WeakMap();
_holding = new WeakMap();
_holdingInitial = new WeakMap();
var Adsr = class extends AdsrBase {
  constructor(opts) {
    super(opts);
    __publicField(this, "attackPath");
    __publicField(this, "decayPath");
    __publicField(this, "releasePath");
    __publicField(this, "initialLevel");
    __publicField(this, "peakLevel");
    __publicField(this, "releaseLevel");
    __publicField(this, "sustainLevel");
    __publicField(this, "attackBend");
    __publicField(this, "decayBend");
    __publicField(this, "releaseBend");
    this.initialLevel = opts.initialLevel ?? 0;
    this.peakLevel = opts.peakLevel ?? 1;
    this.releaseLevel = opts.releaseLevel ?? 0;
    this.sustainLevel = opts.sustainLevel ?? 0.75;
    this.attackBend = opts.attackBend ?? 0;
    this.releaseBend = opts.releaseBend ?? 0;
    this.decayBend = opts.decayBend ?? 0;
    const max2 = 1;
    this.attackPath = toPath2(quadraticSimple({ x: 0, y: this.initialLevel }, { x: max2, y: this.peakLevel }, -this.attackBend));
    this.decayPath = toPath2(quadraticSimple({ x: 0, y: this.peakLevel }, { x: max2, y: this.sustainLevel }, -this.decayBend));
    this.releasePath = toPath2(quadraticSimple({ x: 0, y: this.sustainLevel }, { x: max2, y: this.releaseLevel }, -this.releaseBend));
  }
  compute() {
    const [stage, amt] = super.computeRaw();
    if (stage === void 0)
      return [void 0, NaN, NaN];
    let v2;
    switch (stage) {
      case `attack`:
        v2 = this.attackPath.compute(amt);
        break;
      case `decay`:
        v2 = this.decayPath.compute(amt);
        break;
      case `sustain`:
        v2 = { x: 1, y: this.sustainLevel };
        break;
      case `release`:
        v2 = this.releasePath.compute(amt);
        break;
      case `complete`:
        v2 = { x: 1, y: this.releaseLevel };
        break;
      default:
        throw new Error(`Unknown state: ${stage}`);
    }
    return [stage, v2.y, amt];
  }
};
var adsr = (opts) => new Adsr(opts);

// src/modulation/Easing.ts
var Easing_exports = {};
__export(Easing_exports, {
  getEasings: () => getEasings,
  tick: () => tick,
  timer: () => timer
});
var sqrt3 = Math.sqrt;
var pow2 = Math.pow;
var cos3 = Math.cos;
var PI = Math.PI;
var sin3 = Math.sin;
var msRelativeTimer2 = function(upperBound) {
  let start = performance.now();
  return {
    reset: () => {
      start = performance.now();
    },
    elapsed: () => clamp((performance.now() - start) / upperBound),
    isDone: () => performance.now() - start >= upperBound
  };
};
var tickRelativeTimer = function(upperBound) {
  let start = 0;
  return {
    reset: () => {
      start = 0;
    },
    elapsed: () => clamp(start++ / upperBound),
    isDone: () => start >= upperBound
  };
};
var timer = function(easingName, durationMs) {
  return create(easingName, durationMs, msRelativeTimer2);
};
var tick = function(easingName, durationTicks) {
  return create(easingName, durationTicks, tickRelativeTimer);
};
var create = function(easingName, duration, timerSource) {
  const fn = resolveEasing(easingName);
  const timer2 = timerSource(duration);
  return {
    isDone: () => timer2.isDone(),
    compute: () => {
      const relative = timer2.elapsed();
      return fn(relative);
    },
    reset: () => {
      timer2.reset();
    }
  };
};
var resolveEasing = function(easingName) {
  const name = easingName.toLowerCase();
  for (const [k, v2] of Object.entries(easings)) {
    if (k.toLowerCase() === name) {
      return v2;
    }
  }
  throw Error(`Easing '${easingName}' not found.`);
};
var getEasings = function() {
  return Array.from(Object.keys(easings));
};
var easeOutBounce = function(x) {
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
var easings = {
  easeInSine: (x) => 1 - cos3(x * PI / 2),
  easeOutSine: (x) => sin3(x * PI / 2),
  easeInQuad: (x) => x * x,
  easeOutQuad: (x) => 1 - (1 - x) * (1 - x),
  easeInOutSine: (x) => -(cos3(PI * x) - 1) / 2,
  easeInOutQuad: (x) => x < 0.5 ? 2 * x * x : 1 - pow2(-2 * x + 2, 2) / 2,
  easeInCubic: (x) => x * x * x,
  easeOutCubic: (x) => 1 - pow2(1 - x, 3),
  easeInQuart: (x) => x * x * x * x,
  easeOutQuart: (x) => 1 - pow2(1 - x, 4),
  easeInQuint: (x) => x * x * x * x * x,
  easeOutQuint: (x) => 1 - pow2(1 - x, 5),
  easeInExpo: (x) => x === 0 ? 0 : pow2(2, 10 * x - 10),
  easeOutExpo: (x) => x === 1 ? 1 : 1 - pow2(2, -10 * x),
  easeInOutQuint: (x) => x < 0.5 ? 16 * x * x * x * x * x : 1 - pow2(-2 * x + 2, 5) / 2,
  easeInOutExpo: (x) => x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? pow2(2, 20 * x - 10) / 2 : (2 - pow2(2, -20 * x + 10)) / 2,
  easeInCirc: (x) => 1 - sqrt3(1 - pow2(x, 2)),
  easeOutCirc: (x) => sqrt3(1 - pow2(x - 1, 2)),
  easeInBack: (x) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * x * x * x - c1 * x * x;
  },
  easeOutBack: (x) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * pow2(x - 1, 3) + c1 * pow2(x - 1, 2);
  },
  easeInOutCirc: (x) => x < 0.5 ? (1 - sqrt3(1 - pow2(2 * x, 2))) / 2 : (sqrt3(1 - pow2(-2 * x + 2, 2)) + 1) / 2,
  easeInOutBack: (x) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return x < 0.5 ? pow2(2 * x, 2) * ((c2 + 1) * 2 * x - c2) / 2 : (pow2(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
  },
  easeInElastic: (x) => {
    const c4 = 2 * PI / 3;
    return x === 0 ? 0 : x === 1 ? 1 : -pow2(2, 10 * x - 10) * sin3((x * 10 - 10.75) * c4);
  },
  easeOutElastic: (x) => {
    const c4 = 2 * PI / 3;
    return x === 0 ? 0 : x === 1 ? 1 : pow2(2, -10 * x) * sin3((x * 10 - 0.75) * c4) + 1;
  },
  easeInBounce: (x) => 1 - easeOutBounce(1 - x),
  easeOutBounce,
  easeInOutElastic: (x) => {
    const c5 = 2 * PI / 4.5;
    return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? -(pow2(2, 20 * x - 10) * sin3((20 * x - 11.125) * c5)) / 2 : pow2(2, -20 * x + 10) * sin3((20 * x - 11.125) * c5) / 2 + 1;
  },
  easeInOutBounce: (x) => x < 0.5 ? (1 - easeOutBounce(1 - 2 * x)) / 2 : (1 + easeOutBounce(2 * x - 1)) / 2
};

// src/collections/MutableCircularArray.ts
var _capacity, _pointer;
var _MutableCircularArray = class extends Array {
  constructor(capacity) {
    super();
    __privateAdd(this, _capacity, void 0);
    __privateAdd(this, _pointer, void 0);
    if (Number.isNaN(capacity))
      throw Error(`capacity is NaN`);
    __privateSet(this, _capacity, capacity);
    __privateSet(this, _pointer, 0);
  }
  add(thing) {
    const ca = _MutableCircularArray.from(this);
    ca[__privateGet(this, _pointer)] = thing;
    __privateSet(ca, _capacity, __privateGet(this, _capacity));
    __privateSet(ca, _pointer, __privateGet(this, _pointer) + 1 === __privateGet(this, _capacity) ? 0 : __privateGet(this, _pointer) + 1);
    return ca;
  }
  get pointer() {
    return __privateGet(this, _pointer);
  }
  get isFull() {
    if (__privateGet(this, _capacity) === 0)
      return false;
    return this.length === __privateGet(this, _capacity);
  }
};
var MutableCircularArray = _MutableCircularArray;
_capacity = new WeakMap();
_pointer = new WeakMap();

// src/visualisation/BasePlot.ts
var BasePlot = class {
  constructor(canvasEl) {
    __publicField(this, "canvasEl");
    __publicField(this, "precision");
    __publicField(this, "paused");
    __publicField(this, "scaleMin");
    __publicField(this, "scaleMax");
    __publicField(this, "allowScaleDeflation");
    __publicField(this, "labelInset");
    __publicField(this, "lastPaint");
    __publicField(this, "maxPaintMs");
    __publicField(this, "textHeight");
    __publicField(this, "plotPadding", 10);
    __publicField(this, "showMiddle", true);
    __publicField(this, "showScale", true);
    __publicField(this, "drawLoop");
    if (canvasEl === void 0)
      throw Error("canvasEl undefined");
    this.canvasEl = canvasEl;
    this.drawLoop = this.baseDraw.bind(this);
    this.precision = 3;
    this.paused = false;
    this.allowScaleDeflation = false;
    this.scaleMin = Number.MAX_SAFE_INTEGER;
    this.scaleMax = Number.MIN_SAFE_INTEGER;
    this.labelInset = 5;
    this.lastPaint = 0;
    this.maxPaintMs = 10;
    canvasEl.addEventListener("pointerup", () => {
      this.paused = !this.paused;
      if (this.paused) {
        canvasEl.classList.add("paused");
      } else {
        canvasEl.classList.remove("paused");
      }
    });
    const measure = this.canvasEl.getContext("2d")?.measureText("Xy");
    if (measure === void 0)
      this.textHeight = 20;
    else
      this.textHeight = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
  }
  pushScale(min2, max2) {
    if (min2 > this.scaleMin && this.allowScaleDeflation)
      this.scaleMin = min2;
    else
      this.scaleMin = Math.min(min2, this.scaleMin);
    if (max2 < this.scaleMax && this.allowScaleDeflation)
      this.scaleMax = max2;
    else
      this.scaleMax = Math.max(max2, this.scaleMax);
    const range3 = this.scaleMax - this.scaleMin;
    return range3;
  }
  map(value, x1, y1, x2, y2) {
    return (value - x1) * (y2 - x2) / (y1 - x1) + x2;
  }
  scaleNumber(v2) {
    if (Math.abs(v2) > 50)
      return Math.floor(v2).toString();
    return v2.toFixed(this.precision);
  }
  drawScale(g, min2, max2, avg, range3, plotWidth, plotHeight) {
    if (!this.showScale)
      return;
    const labelInset = this.labelInset;
    const textHalf = this.textHeight / 3;
    const rightJustif = plotWidth - 40;
    g.fillStyle = "black";
    const bottomY = this.plotPadding + plotHeight + textHalf;
    const middleY = this.plotPadding + plotHeight / 2 + textHalf;
    const topY = this.plotPadding + textHalf;
    g.fillText(this.scaleNumber(this.scaleMin), labelInset, bottomY);
    g.fillText(this.scaleNumber(range3 / 2 + this.scaleMin), labelInset, middleY);
    g.fillText(this.scaleNumber(this.scaleMax), labelInset, topY);
    g.fillText(this.scaleNumber(min2), rightJustif, bottomY);
    g.fillText(`Avg: ${this.scaleNumber(avg)}`, rightJustif, middleY);
    g.fillText(this.scaleNumber(max2), rightJustif, topY);
  }
  baseDraw() {
    const c2 = this.canvasEl;
    const g = c2.getContext("2d");
    if (g === null)
      return;
    const canvasHeight = c2.height;
    const canvasWidth = c2.width;
    const plotHeight = canvasHeight - this.plotPadding - this.plotPadding;
    const plotWidth = canvasWidth - this.plotPadding - this.plotPadding;
    g.fillStyle = "white";
    g.fillRect(0, 0, canvasWidth, canvasHeight);
    if (this.showMiddle) {
      g.lineWidth = 2;
      g.beginPath();
      g.strokeStyle = "whitesmoke";
      g.moveTo(this.plotPadding, plotHeight / 2 + this.plotPadding);
      g.lineTo(plotWidth, plotHeight / 2 + this.plotPadding);
      g.stroke();
    }
    this.draw(g, plotWidth, plotHeight);
    this.lastPaint = performance.now();
  }
  draw(g, plotWidth, plotHeight) {
  }
  repaint() {
    if (this.paused)
      return;
    const elapsed = performance.now() - this.lastPaint;
    if (elapsed >= this.maxPaintMs) {
      window.requestAnimationFrame(this.drawLoop);
    }
  }
};

// src/visualisation/Plot.ts
var Plot = class extends BasePlot {
  constructor(canvasEl, samples = 10) {
    super(canvasEl);
    __publicField(this, "buffer");
    __publicField(this, "samples");
    __publicField(this, "color", `silver`);
    __publicField(this, "lineWidth", 3);
    if (samples <= 0)
      throw new Error(`samples must be greater than zero`);
    this.buffer = new MutableCircularArray(samples);
    this.samples = samples;
  }
  draw(g, plotWidth, plotHeight) {
    const d = this.buffer;
    const dataLength = d.length;
    const { min: min2, max: max2, avg } = getMinMaxAvg(d);
    const range3 = this.pushScale(min2, max2);
    const lineWidth = plotWidth / dataLength;
    let x = this.plotPadding;
    if (this.showScale)
      x += 25;
    g.beginPath();
    g.lineWidth = lineWidth;
    g.strokeStyle = this.color;
    for (let i2 = 0; i2 < dataLength; i2++) {
      const y = this.map(d[i2], this.scaleMin, this.scaleMax, plotHeight, 0) + this.plotPadding;
      if (i2 === 0) {
        g.moveTo(x, y);
      } else {
        g.lineTo(x, y);
      }
      x += lineWidth;
    }
    g.stroke();
    g.fillStyle = `black`;
    this.drawScale(g, min2, max2, avg, range3, plotWidth, plotHeight);
  }
  clear() {
    this.buffer = new MutableCircularArray(this.samples);
    this.repaint();
  }
  push(v2) {
    this.buffer = this.buffer.add(v2);
    if (this.paused)
      return;
    this.repaint();
  }
};

// src/visualisation/Drawing.ts
var Drawing_exports = {};
__export(Drawing_exports, {
  arc: () => arc,
  autoSizeCanvas: () => autoSizeCanvas,
  bezier: () => bezier,
  circle: () => circle,
  connectedPoints: () => connectedPoints,
  drawingStack: () => drawingStack,
  getCtx: () => getCtx,
  line: () => line,
  makeHelper: () => makeHelper,
  paths: () => paths,
  pointLabels: () => pointLabels,
  rect: () => rect,
  textBlock: () => textBlock
});

// node_modules/color2k/dist/index.module.js
function t2(t3, n2, r2) {
  return Math.min(Math.max(t3, r2), n2);
}
var n = class extends Error {
  constructor(t3) {
    super(`Failed to parse color: "${t3}"`);
  }
};
function r(r2) {
  if (typeof r2 != "string")
    throw new n(r2);
  if (r2.trim().toLowerCase() === "transparent")
    return [0, 0, 0, 0];
  let e2 = r2.trim();
  e2 = u.test(r2) ? function(t3) {
    const r3 = t3.toLowerCase().trim(), e3 = o[function(t4) {
      let n2 = 5381, r4 = t4.length;
      for (; r4; )
        n2 = 33 * n2 ^ t4.charCodeAt(--r4);
      return (n2 >>> 0) % 2341;
    }(r3)];
    if (!e3)
      throw new n(t3);
    return `#${e3}`;
  }(r2) : r2;
  const f2 = s.exec(e2);
  if (f2) {
    const t3 = Array.from(f2).slice(1);
    return [...t3.slice(0, 3).map((t4) => parseInt(_(t4, 2), 16)), parseInt(_(t3[3] || "f", 2), 16) / 255];
  }
  const p = i.exec(e2);
  if (p) {
    const t3 = Array.from(p).slice(1);
    return [...t3.slice(0, 3).map((t4) => parseInt(t4, 16)), parseInt(t3[3] || "ff", 16) / 255];
  }
  const z = a.exec(e2);
  if (z) {
    const t3 = Array.from(z).slice(1);
    return [...t3.slice(0, 3).map((t4) => parseInt(t4, 10)), parseFloat(t3[3] || "1")];
  }
  const h = c.exec(e2);
  if (h) {
    const [e3, o2, _2, s2] = Array.from(h).slice(1).map(parseFloat);
    if (t2(0, 100, o2) !== o2)
      throw new n(r2);
    if (t2(0, 100, _2) !== _2)
      throw new n(r2);
    return [...l(e3, o2, _2), s2 || 1];
  }
  throw new n(r2);
}
var e = (t3) => parseInt(t3.replace(/_/g, ""), 36);
var o = "1q29ehhb 1n09sgk7 1kl1ekf_ _yl4zsno 16z9eiv3 1p29lhp8 _bd9zg04 17u0____ _iw9zhe5 _to73___ _r45e31e _7l6g016 _jh8ouiv _zn3qba8 1jy4zshs 11u87k0u 1ro9yvyo 1aj3xael 1gz9zjz0 _3w8l4xo 1bf1ekf_ _ke3v___ _4rrkb__ 13j776yz _646mbhl _nrjr4__ _le6mbhl 1n37ehkb _m75f91n _qj3bzfz 1939yygw 11i5z6x8 _1k5f8xs 1509441m 15t5lwgf _ae2th1n _tg1ugcv 1lp1ugcv 16e14up_ _h55rw7n _ny9yavn _7a11xb_ 1ih442g9 _pv442g9 1mv16xof 14e6y7tu 1oo9zkds 17d1cisi _4v9y70f _y98m8kc 1019pq0v 12o9zda8 _348j4f4 1et50i2o _8epa8__ _ts6senj 1o350i2o 1mi9eiuo 1259yrp0 1ln80gnw _632xcoy 1cn9zldc _f29edu4 1n490c8q _9f9ziet 1b94vk74 _m49zkct 1kz6s73a 1eu9dtog _q58s1rz 1dy9sjiq __u89jo3 _aj5nkwg _ld89jo3 13h9z6wx _qa9z2ii _l119xgq _bs5arju 1hj4nwk9 1qt4nwk9 1ge6wau6 14j9zlcw 11p1edc_ _ms1zcxe _439shk6 _jt9y70f _754zsow 1la40eju _oq5p___ _x279qkz 1fa5r3rv _yd2d9ip _424tcku _8y1di2_ _zi2uabw _yy7rn9h 12yz980_ __39ljp6 1b59zg0x _n39zfzp 1fy9zest _b33k___ _hp9wq92 1il50hz4 _io472ub _lj9z3eo 19z9ykg0 _8t8iu3a 12b9bl4a 1ak5yw0o _896v4ku _tb8k8lv _s59zi6t _c09ze0p 1lg80oqn 1id9z8wb _238nba5 1kq6wgdi _154zssg _tn3zk49 _da9y6tc 1sg7cv4f _r12jvtt 1gq5fmkz 1cs9rvci _lp9jn1c _xw1tdnb 13f9zje6 16f6973h _vo7ir40 _bt5arjf _rc45e4t _hr4e100 10v4e100 _hc9zke2 _w91egv_ _sj2r1kk 13c87yx8 _vqpds__ _ni8ggk8 _tj9yqfb 1ia2j4r4 _7x9b10u 1fc9ld4j 1eq9zldr _5j9lhpx _ez9zl6o _md61fzm".split(" ").reduce((t3, n2) => {
  const r2 = e(n2.substring(0, 3)), o2 = e(n2.substring(3)).toString(16);
  let _2 = "";
  for (let t4 = 0; t4 < 6 - o2.length; t4++)
    _2 += "0";
  return t3[r2] = `${_2}${o2}`, t3;
}, {});
var _ = (t3, n2) => Array.from(Array(n2)).map(() => t3).join("");
var s = new RegExp(`^#${_("([a-f0-9])", 3)}([a-f0-9])?$`, "i");
var i = new RegExp(`^#${_("([a-f0-9]{2})", 3)}([a-f0-9]{2})?$`, "i");
var a = new RegExp(`^rgba?\\(\\s*(\\d+)\\s*${_(",\\s*(\\d+)\\s*", 2)}(?:,\\s*([\\d.]+))?\\s*\\)$`, "i");
var c = /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/i;
var u = /^[a-z]+$/i;
var f = (t3) => Math.round(255 * t3);
var l = (t3, n2, r2) => {
  let e2 = r2 / 100;
  if (n2 === 0)
    return [e2, e2, e2].map(f);
  const o2 = (t3 % 360 + 360) % 360 / 60, _2 = (1 - Math.abs(2 * e2 - 1)) * (n2 / 100), s2 = _2 * (1 - Math.abs(o2 % 2 - 1));
  let i2 = 0, a2 = 0, c2 = 0;
  o2 >= 0 && o2 < 1 ? (i2 = _2, a2 = s2) : o2 >= 1 && o2 < 2 ? (i2 = s2, a2 = _2) : o2 >= 2 && o2 < 3 ? (a2 = _2, c2 = s2) : o2 >= 3 && o2 < 4 ? (a2 = s2, c2 = _2) : o2 >= 4 && o2 < 5 ? (i2 = s2, c2 = _2) : o2 >= 5 && o2 < 6 && (i2 = _2, c2 = s2);
  const u2 = e2 - _2 / 2;
  return [i2 + u2, a2 + u2, c2 + u2].map(f);
};
function m(n2, r2, e2, o2) {
  return `rgba(${t2(0, 255, n2).toFixed()}, ${t2(0, 255, r2).toFixed()}, ${t2(0, 255, e2).toFixed()}, ${parseFloat(t2(0, 1, o2).toFixed(3))})`;
}
function v(t3, n2) {
  const [e2, o2, _2, s2] = r(t3);
  return m(e2, o2, _2, s2 - n2);
}

// src/dom/Forms.ts
var resolveEl = (domQueryOrEl) => {
  if (typeof domQueryOrEl === `string`) {
    const d = document.querySelector(domQueryOrEl);
    if (d === null)
      throw new Error(`Id ${domQueryOrEl} not found`);
    domQueryOrEl = d;
  } else if (domQueryOrEl === null)
    throw new Error(`domQueryOrEl ${domQueryOrEl} is null`);
  else if (domQueryOrEl === void 0)
    throw new Error(`domQueryOrEl ${domQueryOrEl} is undefined`);
  const el = domQueryOrEl;
  return el;
};

// src/dom/index.ts
import { Observable, throttleTime } from "rxjs";
var resizeObservable = (elem2, timeoutMs = 1e3) => {
  const o2 = new Observable((subscriber) => {
    const ro = new ResizeObserver((entries) => {
      subscriber.next(entries);
    });
    ro.observe(elem2);
    return function unsubscribe() {
      ro.unobserve(elem2);
    };
  });
  return o2.pipe(throttleTime(timeoutMs));
};

// src/visualisation/Drawing.ts
var PIPI = Math.PI * 2;
var autoSizeCanvas = (canvasEl, callback, timeoutMs = 1e3) => {
  const ro = resizeObservable(canvasEl, timeoutMs).subscribe((entries) => {
    const e2 = entries.find((v2) => v2.target === canvasEl);
    if (e2 === void 0)
      return;
    canvasEl.width = e2.contentRect.width;
    canvasEl.height = e2.contentRect.height;
    callback();
  });
  return ro;
};
var getCtx = (canvasElCtxOrQuery) => {
  if (canvasElCtxOrQuery === null)
    throw Error(`canvasElCtxOrQuery null. Must be a 2d drawing context or Canvas element`);
  if (canvasElCtxOrQuery === void 0)
    throw Error(`canvasElCtxOrQuery undefined. Must be a 2d drawing context or Canvas element`);
  const ctx = canvasElCtxOrQuery instanceof CanvasRenderingContext2D ? canvasElCtxOrQuery : canvasElCtxOrQuery instanceof HTMLCanvasElement ? canvasElCtxOrQuery.getContext(`2d`) : typeof canvasElCtxOrQuery === `string` ? resolveEl(canvasElCtxOrQuery).getContext(`2d`) : canvasElCtxOrQuery;
  if (ctx === null)
    throw new Error(`Could not create 2d context for canvas`);
  return ctx;
};
var makeHelper = (ctxOrCanvasEl, canvasBounds) => {
  const ctx = getCtx(ctxOrCanvasEl);
  return {
    paths(pathsToDraw, opts) {
      paths(ctx, pathsToDraw, opts);
    },
    line(lineToDraw, opts) {
      line(ctx, lineToDraw, opts);
    },
    rect(rectsToDraw, opts) {
      rect(ctx, rectsToDraw, opts);
    },
    bezier(bezierToDraw, opts) {
      bezier(ctx, bezierToDraw, opts);
    },
    connectedPoints(pointsToDraw, opts) {
      connectedPoints(ctx, pointsToDraw, opts);
    },
    pointLabels(pointsToDraw, opts) {
      pointLabels(ctx, pointsToDraw, opts);
    },
    dot(dotPosition, opts) {
      dot(ctx, dotPosition, opts);
    },
    circle(circlesToDraw, opts) {
      circle(ctx, circlesToDraw, opts);
    },
    arc(arcsToDraw, opts) {
      arc(ctx, arcsToDraw, opts);
    },
    textBlock(lines, opts) {
      if (opts.bounds === void 0 && canvasBounds !== void 0)
        opts = { ...opts, bounds: { ...canvasBounds, x: 0, y: 0 } };
      textBlock(ctx, lines, opts);
    }
  };
};
var optsOp = (opts) => coloringOp(opts.strokeStyle, opts.fillStyle);
var applyOpts = (ctx, opts = {}) => {
  if (ctx === void 0)
    throw Error(`ctx undefined`);
  const stack2 = drawingStack(ctx).push(optsOp(opts));
  stack2.apply();
  return stack2;
};
var arc = (ctx, arcs, opts = {}) => {
  applyOpts(ctx, opts);
  const draw = (arc2) => {
    ctx.beginPath();
    ctx.arc(arc2.x, arc2.y, arc2.radius, arc2.startRadian, arc2.endRadian);
    ctx.stroke();
  };
  if (Array.isArray(arcs)) {
    arcs.forEach(draw);
  } else
    draw(arcs);
};
var coloringOp = (strokeStyle, fillStyle) => {
  const apply = (ctx) => {
    if (fillStyle)
      ctx.fillStyle = fillStyle;
    if (strokeStyle)
      ctx.strokeStyle = strokeStyle;
  };
  return apply;
};
var drawingStack = (ctx, stk) => {
  if (stk === void 0)
    stk = stack();
  const push2 = (op) => {
    if (stk === void 0)
      stk = stack();
    const s2 = stk.push(op);
    op(ctx);
    return drawingStack(ctx, s2);
  };
  const pop2 = () => {
    const s2 = stk?.pop();
    return drawingStack(ctx, s2);
  };
  const apply = () => {
    if (stk === void 0)
      return drawingStack(ctx);
    stk.forEach((op) => op(ctx));
    return drawingStack(ctx, stk);
  };
  return { push: push2, pop: pop2, apply };
};
var circle = (ctx, circlesToDraw, opts = {}) => {
  applyOpts(ctx, opts);
  const draw = (c2) => {
    ctx.beginPath();
    ctx.arc(c2.x, c2.y, c2.radius, 0, PIPI);
    ctx.stroke();
  };
  if (Array.isArray(circlesToDraw))
    circlesToDraw.forEach(draw);
  else
    draw(circlesToDraw);
};
var paths = (ctx, pathsToDraw, opts = {}) => {
  applyOpts(ctx, opts);
  const draw = (path) => {
    if (isQuadraticBezier(path))
      quadraticBezier(ctx, path, opts);
    else if (isLine(path))
      line(ctx, path, opts);
    else
      throw new Error(`Unknown path type ${JSON.stringify(path)}`);
  };
  if (Array.isArray(pathsToDraw))
    pathsToDraw.forEach(draw);
  else
    draw(pathsToDraw);
};
var connectedPoints = (ctx, pts, opts = {}) => {
  const shouldLoop = opts.loop ?? false;
  array(pts);
  if (pts.length === 0)
    return;
  pts.forEach((pt, i2) => guard(pt, `Index ${i2}`));
  applyOpts(ctx, opts);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.forEach((pt) => ctx.lineTo(pt.x, pt.y));
  if (shouldLoop)
    ctx.lineTo(pts[0].x, pts[0].y);
  ctx.stroke();
};
var pointLabels = (ctx, pts, opts = {}, labels) => {
  if (pts.length === 0)
    return;
  pts.forEach((pt, i2) => guard(pt, `Index ${i2}`));
  applyOpts(ctx, opts);
  pts.forEach((pt, i2) => {
    const label = labels !== void 0 && i2 < labels.length ? labels[i2] : i2.toString();
    ctx.fillText(label.toString(), pt.x, pt.y);
  });
};
var dot = (ctx, pos, opts) => {
  if (opts === void 0)
    opts = {};
  const radius = opts.radius ?? 10;
  applyOpts(ctx, opts);
  ctx.beginPath();
  if (Array.isArray(pos)) {
    pos.forEach((p) => {
      ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
    });
  } else {
    const p = pos;
    ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
  }
  if (opts.filled || !opts.outlined)
    ctx.fill();
  if (opts.outlined)
    ctx.stroke();
};
var bezier = (ctx, bezierToDraw, opts) => {
  if (isQuadraticBezier(bezierToDraw)) {
    quadraticBezier(ctx, bezierToDraw, opts);
  } else if (isCubicBezier(bezierToDraw)) {
    cubicBezier(ctx, bezierToDraw, opts);
  }
};
var cubicBezier = (ctx, bezierToDraw, opts = {}) => {
  let stack2 = applyOpts(ctx, opts);
  const { a: a2, b, cubic1, cubic2 } = bezierToDraw;
  const isDebug = opts.debug ?? false;
  if (isDebug) {
  }
  ctx.beginPath();
  ctx.moveTo(a2.x, a2.y);
  ctx.bezierCurveTo(cubic1.x, cubic1.y, cubic2.x, cubic2.y, b.x, b.y);
  ctx.stroke();
  if (isDebug) {
    stack2 = stack2.push(optsOp({
      ...opts,
      strokeStyle: v(opts.strokeStyle ?? `silver`, 0.6),
      fillStyle: v(opts.fillStyle ?? `yellow`, 0.4)
    }));
    stack2.apply();
    ctx.moveTo(a2.x, a2.y);
    ctx.lineTo(cubic1.x, cubic1.y);
    ctx.stroke();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(cubic2.x, cubic2.y);
    ctx.stroke();
    ctx.fillText(`a`, a2.x + 5, a2.y);
    ctx.fillText(`b`, b.x + 5, b.y);
    ctx.fillText(`c1`, cubic1.x + 5, cubic1.y);
    ctx.fillText(`c2`, cubic2.x + 5, cubic2.y);
    dot(ctx, cubic1, { radius: 3 });
    dot(ctx, cubic2, { radius: 3 });
    dot(ctx, a2, { radius: 3 });
    dot(ctx, b, { radius: 3 });
    stack2 = stack2.pop();
    stack2.apply();
  }
};
var quadraticBezier = (ctx, bezierToDraw, opts = {}) => {
  const { a: a2, b, quadratic: quadratic2 } = bezierToDraw;
  const isDebug = opts.debug ?? false;
  let stack2 = applyOpts(ctx, opts);
  ctx.beginPath();
  ctx.moveTo(a2.x, a2.y);
  ctx.quadraticCurveTo(quadratic2.x, quadratic2.y, b.x, b.y);
  ctx.stroke();
  if (isDebug) {
    stack2 = stack2.push(optsOp({
      ...opts,
      strokeStyle: v(opts.strokeStyle ?? `silver`, 0.6),
      fillStyle: v(opts.fillStyle ?? `yellow`, 0.4)
    }));
    connectedPoints(ctx, [a2, quadratic2, b]);
    ctx.fillText(`a`, a2.x + 5, a2.y);
    ctx.fillText(`b`, b.x + 5, b.y);
    ctx.fillText(`h`, quadratic2.x + 5, quadratic2.y);
    dot(ctx, quadratic2, { radius: 3 });
    dot(ctx, a2, { radius: 3 });
    dot(ctx, b, { radius: 3 });
    stack2 = stack2.pop();
    stack2.apply();
  }
};
var line = (ctx, toDraw, opts = {}) => {
  const isDebug = opts.debug ?? false;
  applyOpts(ctx, opts);
  const draw = (d) => {
    const { a: a2, b } = d;
    ctx.beginPath();
    ctx.moveTo(a2.x, a2.y);
    ctx.lineTo(b.x, b.y);
    if (isDebug) {
      ctx.fillText(`a`, a2.x, a2.y);
      ctx.fillText(`b`, b.x, b.y);
      dot(ctx, a2, { radius: 5, strokeStyle: `black` });
      dot(ctx, b, { radius: 5, strokeStyle: `black` });
    }
    ctx.stroke();
  };
  if (Array.isArray(toDraw))
    toDraw.forEach(draw);
  else
    draw(toDraw);
};
var rect = (ctx, toDraw, opts = {}) => {
  applyOpts(ctx, opts);
  const draw = (d) => {
    if (opts.filled)
      ctx.fillRect(d.x, d.y, d.width, d.height);
    ctx.strokeRect(d.x, d.y, d.width, d.height);
    if (opts.debug) {
      pointLabels(ctx, getCorners(d), void 0, [`NW`, `NE`, `SE`, `SW`]);
    }
  };
  if (Array.isArray(toDraw))
    toDraw.forEach(draw);
  else
    draw(toDraw);
};
var textBlock = (ctx, lines, opts) => {
  applyOpts(ctx, opts);
  const anchorPadding = opts.anchorPadding ?? 0;
  const anchor = opts.anchor;
  const bounds = opts.bounds ?? { x: 0, y: 0, width: 1e6, height: 1e6 };
  const blocks = lines.map((l2) => ctx.measureText(l2));
  const widths = blocks.map((tm) => tm.width);
  const heights = blocks.map((tm) => tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent);
  const maxWidth = Math.max(...widths);
  const totalHeight = heights.reduce((acc, val) => acc + val, 0);
  let { x, y } = anchor;
  if (anchor.x + maxWidth > bounds.width)
    x = bounds.width - (maxWidth + anchorPadding);
  else
    x -= anchorPadding;
  if (x < bounds.x)
    x = bounds.x + anchorPadding;
  if (anchor.y + totalHeight > bounds.height)
    y = bounds.height - (totalHeight + anchorPadding);
  else
    y -= anchorPadding;
  if (y < bounds.y)
    y = bounds.y + anchorPadding;
  lines.forEach((line2, i2) => {
    ctx.fillText(line2, x, y);
    y += heights[i2];
  });
};

// src/Generators.ts
var Generators_exports = {};
__export(Generators_exports, {
  atInterval: () => atInterval,
  numericRange: () => numericRange,
  numericRangeRaw: () => numericRangeRaw,
  pingPong: () => pingPong,
  pingPongPercent: () => pingPongPercent
});
var atInterval = async function* (produce, intervalMs) {
  let cancelled = false;
  try {
    while (!cancelled) {
      await sleep(intervalMs);
      if (cancelled)
        return;
      yield await produce();
    }
  } finally {
    cancelled = true;
  }
};
var numericRangeRaw = function* (interval, start = 0, end, repeating = false) {
  if (interval <= 0)
    throw new Error(`Interval is expected to be above zero`);
  if (end === void 0)
    end = Number.MAX_SAFE_INTEGER;
  let v2 = start;
  do {
    while (v2 < end) {
      yield v2;
      v2 += interval;
    }
  } while (repeating);
};
var numericRange = function* (interval, start = 0, end, repeating = false, rounding) {
  if (interval <= 0)
    throw Error(`Interval is expected to be above zero`);
  rounding = rounding ?? 1e3;
  if (end === void 0)
    end = Number.MAX_SAFE_INTEGER;
  else
    end *= rounding;
  interval = interval * rounding;
  do {
    let v2 = start * rounding;
    while (v2 <= end) {
      yield v2 / rounding;
      v2 += interval;
    }
  } while (repeating);
};
var pingPongPercent = function(interval = 0.1, offset2, rounding = 1e3) {
  if (offset2 === void 0 && interval > 0)
    offset2 = 0;
  else if (offset2 === void 0 && interval < 0)
    offset2 = 1;
  else
    offset2 = offset2;
  if (offset2 > 1 || offset2 < 0)
    throw new Error(`offset must be between 0 and 1`);
  return pingPong(interval, 0, 1, offset2, rounding);
};
var pingPong = function* (interval, lower, upper, offset2, rounding = 1) {
  if (Number.isNaN(interval))
    throw new Error(`interval parameter is NaN`);
  if (Number.isNaN(lower))
    throw new Error(`lower parameter is NaN`);
  if (Number.isNaN(upper))
    throw new Error(`upper parameter is NaN`);
  if (Number.isNaN(offset2))
    throw new Error(`upper parameter is NaN`);
  if (lower >= upper)
    throw new Error(`lower must be less than upper`);
  if (interval === 0)
    throw new Error(`Interval cannot be zero`);
  const distance3 = upper - lower;
  if (Math.abs(interval) >= distance3)
    throw new Error(`Interval should be between -${distance3} and ${distance3}`);
  let incrementing = interval > 0;
  upper = Math.floor(upper * rounding);
  lower = Math.floor(lower * rounding);
  interval = Math.floor(Math.abs(interval * rounding));
  if (offset2 === void 0)
    offset2 = lower;
  else
    offset2 = Math.floor(offset2 * rounding);
  if (offset2 > upper || offset2 < lower)
    throw new Error(`Offset must be within lower and upper`);
  let v2 = offset2;
  yield v2 / rounding;
  let firstLoop = true;
  while (true) {
    v2 = v2 + (incrementing ? interval : -interval);
    if (incrementing && v2 >= upper) {
      incrementing = false;
      v2 = upper;
      if (v2 === upper && firstLoop) {
        v2 = lower;
        incrementing = true;
      }
    } else if (!incrementing && v2 <= lower) {
      incrementing = true;
      v2 = lower;
      if (v2 === lower && firstLoop) {
        v2 = upper;
        incrementing = false;
      }
    }
    yield v2 / rounding;
    firstLoop = false;
  }
};

// node_modules/fp-ts/es6/function.js
function identity(a2) {
  return a2;
}
function pipe(a2, ab, bc, cd, de, ef, fg, gh, hi) {
  switch (arguments.length) {
    case 1:
      return a2;
    case 2:
      return ab(a2);
    case 3:
      return bc(ab(a2));
    case 4:
      return cd(bc(ab(a2)));
    case 5:
      return de(cd(bc(ab(a2))));
    case 6:
      return ef(de(cd(bc(ab(a2)))));
    case 7:
      return fg(ef(de(cd(bc(ab(a2))))));
    case 8:
      return gh(fg(ef(de(cd(bc(ab(a2)))))));
    case 9:
      return hi(gh(fg(ef(de(cd(bc(ab(a2))))))));
    default:
      var ret = arguments[0];
      for (var i2 = 1; i2 < arguments.length; i2++) {
        ret = arguments[i2](ret);
      }
      return ret;
  }
}

// node_modules/fp-ts/es6/internal.js
var isSome = function(fa) {
  return fa._tag === "Some";
};
var emptyReadonlyArray = [];

// node_modules/fp-ts/es6/Eq.js
var eqStrict = {
  equals: function(a2, b) {
    return a2 === b;
  }
};
var strictEqual = eqStrict.equals;

// node_modules/fp-ts/es6/Ord.js
var equalsDefault = function(compare2) {
  return function(first, second) {
    return first === second || compare2(first, second) === 0;
  };
};
var fromCompare = function(compare2) {
  return {
    equals: equalsDefault(compare2),
    compare: function(first, second) {
      return first === second ? 0 : compare2(first, second);
    }
  };
};
var reverse = function(O) {
  return fromCompare(function(first, second) {
    return O.compare(second, first);
  });
};
var contramap = function(f2) {
  return function(fa) {
    return fromCompare(function(first, second) {
      return fa.compare(f2(first), f2(second));
    });
  };
};
function compare(first, second) {
  return first < second ? -1 : first > second ? 1 : 0;
}
var strictOrd = {
  equals: eqStrict.equals,
  compare
};

// node_modules/fp-ts/es6/ReadonlyNonEmptyArray.js
var __spreadArray = function(to, from2) {
  for (var i2 = 0, il = from2.length, j = to.length; i2 < il; i2++, j++)
    to[j] = from2[i2];
  return to;
};
var empty = emptyReadonlyArray;
var appendW = function(end) {
  return function(init3) {
    return __spreadArray(__spreadArray([], init3), [end]);
  };
};
var append = appendW;

// node_modules/fp-ts/es6/NonEmptyArray.js
var __spreadArray2 = function(to, from2) {
  for (var i2 = 0, il = from2.length, j = to.length; i2 < il; i2++, j++)
    to[j] = from2[i2];
  return to;
};
var appendW2 = function(end) {
  return function(init3) {
    return __spreadArray2(__spreadArray2([], init3), [end]);
  };
};
var append2 = appendW2;

// node_modules/fp-ts/es6/number.js
var Eq = {
  equals: function(first, second) {
    return first === second;
  }
};
var Ord = {
  equals: Eq.equals,
  compare: function(first, second) {
    return first < second ? -1 : first > second ? 1 : 0;
  }
};
var Bounded = {
  equals: Eq.equals,
  compare: Ord.compare,
  top: Infinity,
  bottom: -Infinity
};
var MagmaSub = {
  concat: function(first, second) {
    return first - second;
  }
};
var SemigroupSum = {
  concat: function(first, second) {
    return first + second;
  }
};
var SemigroupProduct = {
  concat: function(first, second) {
    return first * second;
  }
};
var MonoidSum = {
  concat: SemigroupSum.concat,
  empty: 0
};
var MonoidProduct = {
  concat: SemigroupProduct.concat,
  empty: 1
};
var Field = {
  add: SemigroupSum.concat,
  zero: 0,
  mul: SemigroupProduct.concat,
  one: 1,
  sub: MagmaSub.concat,
  degree: function(_2) {
    return 1;
  },
  div: function(first, second) {
    return first / second;
  },
  mod: function(first, second) {
    return first % second;
  }
};

// node_modules/fp-ts/es6/Separated.js
var separated = function(left, right) {
  return { left, right };
};

// node_modules/fp-ts/es6/Witherable.js
function wiltDefault(T, C) {
  return function(F) {
    var traverseF = T.traverse(F);
    return function(wa, f2) {
      return F.map(traverseF(wa, f2), C.separate);
    };
  };
}
function witherDefault(T, C) {
  return function(F) {
    var traverseF = T.traverse(F);
    return function(wa, f2) {
      return F.map(traverseF(wa, f2), C.compact);
    };
  };
}

// node_modules/fp-ts/es6/ReadonlyArray.js
var append3 = append;
var _map2 = function(fa, f2) {
  return pipe(fa, map(f2));
};
var _reduce = function(fa, b, f2) {
  return pipe(fa, reduce(b, f2));
};
var _foldMap = function(M) {
  var foldMapM = foldMap(M);
  return function(fa, f2) {
    return pipe(fa, foldMapM(f2));
  };
};
var _reduceRight = function(fa, b, f2) {
  return pipe(fa, reduceRight(b, f2));
};
var _traverse = function(F) {
  var traverseF = traverse(F);
  return function(ta, f2) {
    return pipe(ta, traverseF(f2));
  };
};
var zero = function() {
  return empty2;
};
var map = function(f2) {
  return function(fa) {
    return fa.map(function(a2) {
      return f2(a2);
    });
  };
};
var separate = function(fa) {
  var left = [];
  var right = [];
  for (var _i = 0, fa_1 = fa; _i < fa_1.length; _i++) {
    var e2 = fa_1[_i];
    if (e2._tag === "Left") {
      left.push(e2.left);
    } else {
      right.push(e2.right);
    }
  }
  return separated(left, right);
};
var filterMapWithIndex = function(f2) {
  return function(fa) {
    var out = [];
    for (var i2 = 0; i2 < fa.length; i2++) {
      var optionB = f2(i2, fa[i2]);
      if (isSome(optionB)) {
        out.push(optionB.value);
      }
    }
    return out;
  };
};
var filterMap = function(f2) {
  return filterMapWithIndex(function(_2, a2) {
    return f2(a2);
  });
};
var compact = /* @__PURE__ */ filterMap(identity);
var foldMapWithIndex = function(M) {
  return function(f2) {
    return function(fa) {
      return fa.reduce(function(b, a2, i2) {
        return M.concat(b, f2(i2, a2));
      }, M.empty);
    };
  };
};
var reduce = function(b, f2) {
  return reduceWithIndex(b, function(_2, b2, a2) {
    return f2(b2, a2);
  });
};
var foldMap = function(M) {
  var foldMapWithIndexM = foldMapWithIndex(M);
  return function(f2) {
    return foldMapWithIndexM(function(_2, a2) {
      return f2(a2);
    });
  };
};
var reduceWithIndex = function(b, f2) {
  return function(fa) {
    var len = fa.length;
    var out = b;
    for (var i2 = 0; i2 < len; i2++) {
      out = f2(i2, out, fa[i2]);
    }
    return out;
  };
};
var reduceRight = function(b, f2) {
  return reduceRightWithIndex(b, function(_2, a2, b2) {
    return f2(a2, b2);
  });
};
var reduceRightWithIndex = function(b, f2) {
  return function(fa) {
    return fa.reduceRight(function(b2, a2, i2) {
      return f2(i2, a2, b2);
    }, b);
  };
};
var traverse = function(F) {
  var traverseWithIndexF = traverseWithIndex(F);
  return function(f2) {
    return traverseWithIndexF(function(_2, a2) {
      return f2(a2);
    });
  };
};
var sequence = function(F) {
  return function(ta) {
    return _reduce(ta, F.of(zero()), function(fas, fa) {
      return F.ap(F.map(fas, function(as) {
        return function(a2) {
          return pipe(as, append3(a2));
        };
      }), fa);
    });
  };
};
var traverseWithIndex = function(F) {
  return function(f2) {
    return reduceWithIndex(F.of(zero()), function(i2, fbs, a2) {
      return F.ap(F.map(fbs, function(bs) {
        return function(b) {
          return pipe(bs, append3(b));
        };
      }), f2(i2, a2));
    });
  };
};
var URI = "ReadonlyArray";
var Compactable = {
  URI,
  compact,
  separate
};
var Traversable = {
  URI,
  map: _map2,
  reduce: _reduce,
  foldMap: _foldMap,
  reduceRight: _reduceRight,
  traverse: _traverse,
  sequence
};
var _wither = witherDefault(Traversable, Compactable);
var _wilt = wiltDefault(Traversable, Compactable);
var empty2 = empty;

// node_modules/fp-ts/es6/Array.js
var append4 = append2;
var copy = function(as) {
  return as.slice();
};
var sort = function(O) {
  return function(as) {
    return as.length <= 1 ? copy(as) : as.slice().sort(O.compare);
  };
};
var _map3 = function(fa, f2) {
  return pipe(fa, map2(f2));
};
var _reduce2 = function(fa, b, f2) {
  return pipe(fa, reduce2(b, f2));
};
var _foldMap2 = function(M) {
  var foldMapM = foldMap2(M);
  return function(fa, f2) {
    return pipe(fa, foldMapM(f2));
  };
};
var _reduceRight2 = function(fa, b, f2) {
  return pipe(fa, reduceRight2(b, f2));
};
var _traverse2 = function(F) {
  var traverseF = traverse2(F);
  return function(ta, f2) {
    return pipe(ta, traverseF(f2));
  };
};
var zero2 = function() {
  return [];
};
var map2 = function(f2) {
  return function(fa) {
    return fa.map(function(a2) {
      return f2(a2);
    });
  };
};
var filterMapWithIndex2 = function(f2) {
  return function(fa) {
    var out = [];
    for (var i2 = 0; i2 < fa.length; i2++) {
      var optionB = f2(i2, fa[i2]);
      if (isSome(optionB)) {
        out.push(optionB.value);
      }
    }
    return out;
  };
};
var filterMap2 = function(f2) {
  return filterMapWithIndex2(function(_2, a2) {
    return f2(a2);
  });
};
var compact2 = /* @__PURE__ */ filterMap2(identity);
var separate2 = function(fa) {
  var left = [];
  var right = [];
  for (var _i = 0, fa_1 = fa; _i < fa_1.length; _i++) {
    var e2 = fa_1[_i];
    if (e2._tag === "Left") {
      left.push(e2.left);
    } else {
      right.push(e2.right);
    }
  }
  return separated(left, right);
};
var foldMap2 = foldMap;
var reduce2 = reduce;
var reduceWithIndex2 = reduceWithIndex;
var reduceRight2 = reduceRight;
var traverse2 = function(F) {
  var traverseWithIndexF = traverseWithIndex2(F);
  return function(f2) {
    return traverseWithIndexF(function(_2, a2) {
      return f2(a2);
    });
  };
};
var sequence2 = function(F) {
  return function(ta) {
    return _reduce2(ta, F.of(zero2()), function(fas, fa) {
      return F.ap(F.map(fas, function(as) {
        return function(a2) {
          return pipe(as, append4(a2));
        };
      }), fa);
    });
  };
};
var traverseWithIndex2 = function(F) {
  return function(f2) {
    return reduceWithIndex2(F.of(zero2()), function(i2, fbs, a2) {
      return F.ap(F.map(fbs, function(bs) {
        return function(b) {
          return pipe(bs, append4(b));
        };
      }), f2(i2, a2));
    });
  };
};
var URI2 = "Array";
var Compactable2 = {
  URI: URI2,
  compact: compact2,
  separate: separate2
};
var Traversable2 = {
  URI: URI2,
  map: _map3,
  reduce: _reduce2,
  foldMap: _foldMap2,
  reduceRight: _reduceRight2,
  traverse: _traverse2,
  sequence: sequence2
};
var _wither2 = witherDefault(Traversable2, Compactable2);
var _wilt2 = wiltDefault(Traversable2, Compactable2);

// node_modules/fp-ts/es6/string.js
var Eq2 = {
  equals: function(first, second) {
    return first === second;
  }
};
var Semigroup = {
  concat: function(first, second) {
    return first + second;
  }
};
var Monoid = {
  concat: Semigroup.concat,
  empty: ""
};
var Ord2 = {
  equals: Eq2.equals,
  compare: function(first, second) {
    return first < second ? -1 : first > second ? 1 : 0;
  }
};

// src/KeyValue.ts
var byKey = (reverse2 = false) => pipe(reverse2 ? reverse(Ord2) : Ord2, contramap((v2) => v2[0]));
var byValueNumber = (reverse2 = false) => pipe(reverse2 ? reverse(Ord) : Ord, contramap((v2) => v2[1]));
var sortByKey = (reverse2 = false) => sort(byKey(reverse2));
var sortByValueNumber = (reverse2 = false) => sort(byValueNumber(reverse2));

// src/visualisation/FrequencyHistogramPlot.ts
var _sorter;
var FrequencyHistogramPlot = class {
  constructor(parentEl) {
    __publicField(this, "parentEl");
    __publicField(this, "el");
    __privateAdd(this, _sorter, void 0);
    console.log(`FreqHistoPlot`);
    this.parentEl = parentEl;
    this.init();
  }
  setAutoSort(sortStyle) {
    switch (sortStyle) {
      case `value`:
        __privateSet(this, _sorter, sortByValueNumber(false));
        break;
      case `valueReverse`:
        __privateSet(this, _sorter, sortByValueNumber(true));
        break;
      case `key`:
        __privateSet(this, _sorter, sortByKey(false));
        break;
      case `keyReverse`:
        __privateSet(this, _sorter, sortByKey(true));
        break;
      default:
        throw new Error(`Unknown sorting value '${sortStyle}'. Expecting: value, valueReverse, key or keyReverse`);
    }
  }
  clear() {
    if (this.el === void 0)
      return;
    this.el.data = [];
  }
  init() {
    if (this.el !== void 0)
      return;
    this.el = document.createElement(`histogram-vis`);
    this.parentEl.appendChild(this.el);
  }
  dispose() {
    const el = this.el;
    if (el === void 0)
      return;
    el.remove();
  }
  update(data) {
    if (this.el === void 0)
      return;
    if (__privateGet(this, _sorter) !== void 0) {
      this.el.data = __privateGet(this, _sorter).call(this, data);
    } else {
      this.el.data = [...data];
    }
  }
};
_sorter = new WeakMap();
export {
  Bezier_exports as Beziers,
  CompoundPath_exports as Compound,
  Drawing_exports as Drawing,
  Easing_exports as Easings,
  Envelope_exports as Envelopes,
  FrequencyHistogramPlot,
  Grid_exports as Grids,
  Line_exports as Lines,
  Lists_exports as Lists,
  Path_exports as Paths,
  Plot,
  Point_exports as Points,
  Generators_exports as Producers,
  Rect_exports as Rects,
  Set_exports as Sets
};
//# sourceMappingURL=bundle.js.map