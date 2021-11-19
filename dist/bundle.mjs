var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
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
  bbox: () => bbox,
  compute: () => compute,
  fromNumbers: () => fromNumbers,
  fromPoints: () => fromPoints,
  length: () => length,
  toString: () => toString
});

// src/geometry/Rect.ts
var Rect_exports = {};
__export(Rect_exports, {
  RectCorner: () => RectCorner,
  fromCenter: () => fromCenter,
  fromTopLeft: () => fromTopLeft,
  rectFromPoints: () => rectFromPoints
});
var RectCorner;
(function(RectCorner2) {
  RectCorner2[RectCorner2["TopLeft"] = 0] = "TopLeft";
  RectCorner2[RectCorner2["TopRight"] = 1] = "TopRight";
  RectCorner2[RectCorner2["BottomRight"] = 2] = "BottomRight";
  RectCorner2[RectCorner2["BottomLeft"] = 3] = "BottomLeft";
})(RectCorner || (RectCorner = {}));
var rectFromPoints = function(...pts) {
  if (pts.length != 4)
    throw Error("Expected four points");
  const width = Math.abs(pts[2].x - pts[3].x);
  const height = Math.abs(pts[3].y - pts[0].y);
  pts = pts.map((p) => Object.freeze(p));
  return Object.freeze({
    width,
    height,
    corners: pts
  });
};
var fromCenter = function(origin, width, height) {
  guardDim(width, "width");
  guardDim(height, "height");
  let halfW = width / 2;
  let halfH = height / 2;
  let pts = [];
  pts.push({ x: origin.x - halfW, y: origin.y - halfH });
  pts.push({ x: origin.x + halfW, y: origin.y - halfH });
  pts.push({ x: origin.x + halfW, y: origin.y + halfH });
  pts.push({ x: origin.x - halfW, y: origin.y + halfH });
  return rectFromPoints(...pts);
};
var guardDim = function(d, name = "Dimension") {
  if (isNaN(d))
    throw Error(`${name} is NaN`);
  if (d < 0)
    throw Error(`${name} cannot be negative`);
};
var fromTopLeft = function(origin, width, height) {
  guardDim(width, "width");
  guardDim(height, "height");
  let pts = [origin];
  pts.push({ x: origin.x + width, y: origin.y });
  pts.push({ x: origin.x + width, y: origin.y + height });
  pts.push({ x: origin.x, y: origin.y + height });
  return rectFromPoints(...pts);
};

// src/geometry/Point.ts
var Point_exports = {};
__export(Point_exports, {
  equals: () => equals,
  guard: () => guard,
  pointToString: () => pointToString,
  scale: () => scale,
  toArray: () => toArray
});
var pointToString = function(p) {
  if (p.z !== void 0)
    return `(${p.x},${p.y},${p.z})`;
  else
    return `(${p.x},${p.y})`;
};
var guard = function(p, name = "Point") {
  if (p === void 0)
    throw Error(`${name} is undefined`);
  if (p === null)
    throw Error(`${name} is null`);
};
var toArray = function(p) {
  return [p.x, p.y];
};
var equals = function(a, b) {
  return a.x == b.x && a.y == b.y;
};
var scale = function(a, x, y = void 0) {
  if (y === void 0)
    y = x;
  return { x: a.x * x, y: a.y * y };
};

// src/geometry/Line.ts
function length(a, b) {
  guard(a, "a");
  guard(a, "b");
  const x = b.x - a.x;
  const y = b.y - a.y;
  if (a.z !== void 0 && b.z !== void 0) {
    const z = b.z - a.z;
    return Math.hypot(x, y, z);
  } else {
    return Math.hypot(x, y);
  }
}
function guardPercent(t2, name = "Parameter") {
  if (isNaN(t2))
    throw Error(`${name} is NaN`);
  if (t2 < 0)
    throw Error(`${name} must be above or equal to 0`);
  if (t2 > 1)
    throw Error(`${name} must be below or equal to 1`);
}
function compute(a, b, t2) {
  guard(a, "a");
  guard(b, "b");
  if (t2 > 1)
    debugger;
  guardPercent(t2, "t");
  const d = length(a, b);
  const d2 = d * (1 - t2);
  const x = b.x - d2 * (b.x - a.x) / d;
  const y = b.y - d2 * (b.y - a.y) / d;
  return { x, y };
}
function bbox(...points2) {
  const x = points2.map((p) => p.x);
  const y = points2.map((p) => p.y);
  const xMin = Math.min(...x);
  const xMax = Math.max(...x);
  const yMin = Math.min(...y);
  const yMax = Math.max(...y);
  return fromTopLeft({ x: xMin, y: yMin }, xMax - xMin, yMax - yMin);
}
function toString(a, b) {
  return pointToString(a) + "-" + pointToString(b);
}
function fromNumbers(x1, y1, x2, y2) {
  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  return fromPoints(a, b);
}
function fromPoints(a, b) {
  a = Object.freeze(a);
  b = Object.freeze(b);
  return Object.freeze({
    a,
    b,
    length: () => length(a, b),
    compute: (t2) => compute(a, b, t2),
    bbox: () => bbox(a, b),
    toString: () => toString(a, b)
  });
}

// src/geometry/Bezier.ts
var Bezier_exports = {};
__export(Bezier_exports, {
  quadratic: () => quadratic,
  quadraticBend: () => quadraticBend,
  quadraticSimple: () => quadraticSimple
});

// node_modules/bezier-js/src/utils.js
var { abs, cos, sin, acos, atan2, sqrt, pow } = Math;
function crt(v) {
  return v < 0 ? -pow(-v, 1 / 3) : pow(v, 1 / 3);
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
  arcfn: function(t2, derivativeFn) {
    const d = derivativeFn(t2);
    let l = d.x * d.x + d.y * d.y;
    if (typeof d.z !== "undefined") {
      l += d.z * d.z;
    }
    return sqrt(l);
  },
  compute: function(t2, points2, _3d) {
    if (t2 === 0) {
      points2[0].t = 0;
      return points2[0];
    }
    const order = points2.length - 1;
    if (t2 === 1) {
      points2[order].t = 1;
      return points2[order];
    }
    const mt = 1 - t2;
    let p = points2;
    if (order === 0) {
      points2[0].t = t2;
      return points2[0];
    }
    if (order === 1) {
      const ret = {
        x: mt * p[0].x + t2 * p[1].x,
        y: mt * p[0].y + t2 * p[1].y,
        t: t2
      };
      if (_3d) {
        ret.z = mt * p[0].z + t2 * p[1].z;
      }
      return ret;
    }
    if (order < 4) {
      let mt2 = mt * mt, t22 = t2 * t2, a, b, c, d = 0;
      if (order === 2) {
        p = [p[0], p[1], p[2], ZERO];
        a = mt2;
        b = mt * t2 * 2;
        c = t22;
      } else if (order === 3) {
        a = mt2 * mt;
        b = mt2 * t2 * 3;
        c = mt * t22 * 3;
        d = t2 * t22;
      }
      const ret = {
        x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
        y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y,
        t: t2
      };
      if (_3d) {
        ret.z = a * p[0].z + b * p[1].z + c * p[2].z + d * p[3].z;
      }
      return ret;
    }
    const dCpts = JSON.parse(JSON.stringify(points2));
    while (dCpts.length > 1) {
      for (let i = 0; i < dCpts.length - 1; i++) {
        dCpts[i] = {
          x: dCpts[i].x + (dCpts[i + 1].x - dCpts[i].x) * t2,
          y: dCpts[i].y + (dCpts[i + 1].y - dCpts[i].y) * t2
        };
        if (typeof dCpts[i].z !== "undefined") {
          dCpts[i] = dCpts[i].z + (dCpts[i + 1].z - dCpts[i].z) * t2;
        }
      }
      dCpts.splice(dCpts.length - 1, 1);
    }
    dCpts[0].t = t2;
    return dCpts[0];
  },
  computeWithRatios: function(t2, points2, ratios, _3d) {
    const mt = 1 - t2, r = ratios, p = points2;
    let f1 = r[0], f2 = r[1], f3 = r[2], f4 = r[3], d;
    f1 *= mt;
    f2 *= t2;
    if (p.length === 2) {
      d = f1 + f2;
      return {
        x: (f1 * p[0].x + f2 * p[1].x) / d,
        y: (f1 * p[0].y + f2 * p[1].y) / d,
        z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z) / d,
        t: t2
      };
    }
    f1 *= mt;
    f2 *= 2 * mt;
    f3 *= t2 * t2;
    if (p.length === 3) {
      d = f1 + f2 + f3;
      return {
        x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x) / d,
        y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y) / d,
        z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z) / d,
        t: t2
      };
    }
    f1 *= mt;
    f2 *= 1.5 * mt;
    f3 *= 3 * mt;
    f4 *= t2 * t2 * t2;
    if (p.length === 4) {
      d = f1 + f2 + f3 + f4;
      return {
        x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x + f4 * p[3].x) / d,
        y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y + f4 * p[3].y) / d,
        z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z + f4 * p[3].z) / d,
        t: t2
      };
    }
  },
  derive: function(points2, _3d) {
    const dpoints = [];
    for (let p = points2, d = p.length, c = d - 1; d > 1; d--, c--) {
      const list = [];
      for (let j = 0, dpt; j < c; j++) {
        dpt = {
          x: c * (p[j + 1].x - p[j].x),
          y: c * (p[j + 1].y - p[j].y)
        };
        if (_3d) {
          dpt.z = c * (p[j + 1].z - p[j].z);
        }
        list.push(dpt);
      }
      dpoints.push(list);
      p = list;
    }
    return dpoints;
  },
  between: function(v, m, M) {
    return m <= v && v <= M || utils.approximately(v, m) || utils.approximately(v, M);
  },
  approximately: function(a, b, precision) {
    return abs(a - b) <= (precision || epsilon);
  },
  length: function(derivativeFn) {
    const z = 0.5, len = utils.Tvalues.length;
    let sum = 0;
    for (let i = 0, t2; i < len; i++) {
      t2 = z * utils.Tvalues[i] + z;
      sum += utils.Cvalues[i] * utils.arcfn(t2, derivativeFn);
    }
    return z * sum;
  },
  map: function(v, ds, de, ts, te) {
    const d1 = de - ds, d2 = te - ts, v2 = v - ds, r = v2 / d1;
    return ts + d2 * r;
  },
  lerp: function(r, v1, v2) {
    const ret = {
      x: v1.x + r * (v2.x - v1.x),
      y: v1.y + r * (v2.y - v1.y)
    };
    if (v1.z !== void 0 && v2.z !== void 0) {
      ret.z = v1.z + r * (v2.z - v1.z);
    }
    return ret;
  },
  pointToString: function(p) {
    let s = p.x + "/" + p.y;
    if (typeof p.z !== "undefined") {
      s += "/" + p.z;
    }
    return s;
  },
  pointsToString: function(points2) {
    return "[" + points2.map(utils.pointToString).join(", ") + "]";
  },
  copy: function(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  angle: function(o, v1, v2) {
    const dx1 = v1.x - o.x, dy1 = v1.y - o.y, dx2 = v2.x - o.x, dy2 = v2.y - o.y, cross = dx1 * dy2 - dy1 * dx2, dot = dx1 * dx2 + dy1 * dy2;
    return atan2(cross, dot);
  },
  round: function(v, d) {
    const s = "" + v;
    const pos = s.indexOf(".");
    return parseFloat(s.substring(0, pos + 1 + d));
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
  abcratio: function(t2, n) {
    if (n !== 2 && n !== 3) {
      return false;
    }
    if (typeof t2 === "undefined") {
      t2 = 0.5;
    } else if (t2 === 0 || t2 === 1) {
      return t2;
    }
    const bottom = pow(t2, n) + pow(1 - t2, n), top = bottom - 1;
    return abs(top / bottom);
  },
  projectionratio: function(t2, n) {
    if (n !== 2 && n !== 3) {
      return false;
    }
    if (typeof t2 === "undefined") {
      t2 = 0.5;
    } else if (t2 === 0 || t2 === 1) {
      return t2;
    }
    const top = pow(1 - t2, n), bottom = pow(t2, n) + top;
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
    sections.forEach(function(s) {
      const bbox2 = s.bbox();
      if (mx > bbox2.x.min)
        mx = bbox2.x.min;
      if (my > bbox2.y.min)
        my = bbox2.y.min;
      if (MX < bbox2.x.max)
        MX = bbox2.x.max;
      if (MY < bbox2.y.max)
        MY = bbox2.y.max;
    });
    return {
      x: { min: mx, mid: (mx + MX) / 2, max: MX, size: MX - mx },
      y: { min: my, mid: (my + MY) / 2, max: MY, size: MY - my }
    };
  },
  shapeintersections: function(s1, bbox1, s2, bbox2, curveIntersectionThreshold) {
    if (!utils.bboxoverlap(bbox1, bbox2))
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
    let min2 = nMax, max2 = nMin, t2, c;
    if (list.indexOf(0) === -1) {
      list = [0].concat(list);
    }
    if (list.indexOf(1) === -1) {
      list.push(1);
    }
    for (let i = 0, len = list.length; i < len; i++) {
      t2 = list[i];
      c = curve.get(t2);
      if (c[d] < min2) {
        min2 = c[d];
      }
      if (c[d] > max2) {
        max2 = c[d];
      }
    }
    return { min: min2, mid: (min2 + max2) / 2, max: max2, size: max2 - min2 };
  },
  align: function(points2, line2) {
    const tx = line2.p1.x, ty = line2.p1.y, a = -atan2(line2.p2.y - ty, line2.p2.x - tx), d = function(v) {
      return {
        x: (v.x - tx) * cos(a) - (v.y - ty) * sin(a),
        y: (v.x - tx) * sin(a) + (v.y - ty) * cos(a)
      };
    };
    return points2.map(d);
  },
  roots: function(points2, line2) {
    line2 = line2 || { p1: { x: 0, y: 0 }, p2: { x: 1, y: 0 } };
    const order = points2.length - 1;
    const aligned = utils.align(points2, line2);
    const reduce = function(t2) {
      return 0 <= t2 && t2 <= 1;
    };
    if (order === 2) {
      const a2 = aligned[0].y, b2 = aligned[1].y, c2 = aligned[2].y, d2 = a2 - 2 * b2 + c2;
      if (d2 !== 0) {
        const m1 = -sqrt(b2 * b2 - a2 * c2), m2 = -a2 + b2, v12 = -(m1 + m2) / d2, v2 = -(-m1 + m2) / d2;
        return [v12, v2].filter(reduce);
      } else if (b2 !== c2 && d2 === 0) {
        return [(2 * b2 - c2) / (2 * b2 - 2 * c2)].filter(reduce);
      }
      return [];
    }
    const pa = aligned[0].y, pb = aligned[1].y, pc = aligned[2].y, pd = aligned[3].y;
    let d = -pa + 3 * pb - 3 * pc + pd, a = 3 * pa - 6 * pb + 3 * pc, b = -3 * pa + 3 * pb, c = pa;
    if (utils.approximately(d, 0)) {
      if (utils.approximately(a, 0)) {
        if (utils.approximately(b, 0)) {
          return [];
        }
        return [-c / b].filter(reduce);
      }
      const q3 = sqrt(b * b - 4 * a * c), a2 = 2 * a;
      return [(q3 - b) / a2, (-b - q3) / a2].filter(reduce);
    }
    a /= d;
    b /= d;
    c /= d;
    const p = (3 * b - a * a) / 3, p3 = p / 3, q = (2 * a * a * a - 9 * a * b + 27 * c) / 27, q2 = q / 2, discriminant = q2 * q2 + p3 * p3 * p3;
    let u1, v1, x1, x2, x3;
    if (discriminant < 0) {
      const mp3 = -p / 3, mp33 = mp3 * mp3 * mp3, r = sqrt(mp33), t2 = -q / (2 * r), cosphi = t2 < -1 ? -1 : t2 > 1 ? 1 : t2, phi = acos(cosphi), crtr = crt(r), t1 = 2 * crtr;
      x1 = t1 * cos(phi / 3) - a / 3;
      x2 = t1 * cos((phi + tau) / 3) - a / 3;
      x3 = t1 * cos((phi + 2 * tau) / 3) - a / 3;
      return [x1, x2, x3].filter(reduce);
    } else if (discriminant === 0) {
      u1 = q2 < 0 ? crt(-q2) : -crt(q2);
      x1 = 2 * u1 - a / 3;
      x2 = -u1 - a / 3;
      return [x1, x2].filter(reduce);
    } else {
      const sd = sqrt(discriminant);
      u1 = crt(-q2 + sd);
      v1 = crt(q2 + sd);
      return [u1 - v1 - a / 3].filter(reduce);
    }
  },
  droots: function(p) {
    if (p.length === 3) {
      const a = p[0], b = p[1], c = p[2], d = a - 2 * b + c;
      if (d !== 0) {
        const m1 = -sqrt(b * b - a * c), m2 = -a + b, v1 = -(m1 + m2) / d, v2 = -(-m1 + m2) / d;
        return [v1, v2];
      } else if (b !== c && d === 0) {
        return [(2 * b - c) / (2 * (b - c))];
      }
      return [];
    }
    if (p.length === 2) {
      const a = p[0], b = p[1];
      if (a !== b) {
        return [a / (a - b)];
      }
      return [];
    }
    return [];
  },
  curvature: function(t2, d1, d2, _3d, kOnly) {
    let num, dnm, adk, dk, k = 0, r = 0;
    const d = utils.compute(t2, d1);
    const dd = utils.compute(t2, d2);
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
    r = dnm / num;
    if (!kOnly) {
      const pk = utils.curvature(t2 - 1e-3, d1, d2, _3d, true).k;
      const nk = utils.curvature(t2 + 1e-3, d1, d2, _3d, true).k;
      dk = (nk - k + (k - pk)) / 2;
      adk = (abs(nk - k) + abs(k - pk)) / 2;
    }
    return { k, r, dk, adk };
  },
  inflections: function(points2) {
    if (points2.length < 4)
      return [];
    const p = utils.align(points2, { p1: points2[0], p2: points2.slice(-1)[0] }), a = p[2].x * p[1].y, b = p[3].x * p[1].y, c = p[1].x * p[2].y, d = p[3].x * p[2].y, v1 = 18 * (-3 * a + 2 * b + 3 * c - d), v2 = 18 * (3 * a - b - 3 * c), v3 = 18 * (c - a);
    if (utils.approximately(v1, 0)) {
      if (!utils.approximately(v2, 0)) {
        let t2 = -v3 / v2;
        if (0 <= t2 && t2 <= 1)
          return [t2];
      }
      return [];
    }
    const trm = v2 * v2 - 4 * v1 * v3, sq = Math.sqrt(trm), d2 = 2 * v1;
    if (utils.approximately(d2, 0))
      return [];
    return [(sq - v2) / d2, -(v2 + sq) / d2].filter(function(r) {
      return 0 <= r && r <= 1;
    });
  },
  bboxoverlap: function(b1, b2) {
    const dims = ["x", "y"], len = dims.length;
    for (let i = 0, dim, l, t2, d; i < len; i++) {
      dim = dims[i];
      l = b1[dim].mid;
      t2 = b2[dim].mid;
      d = (b1[dim].size + b2[dim].size) / 2;
      if (abs(l - t2) >= d)
        return false;
    }
    return true;
  },
  expandbox: function(bbox2, _bbox) {
    if (_bbox.x.min < bbox2.x.min) {
      bbox2.x.min = _bbox.x.min;
    }
    if (_bbox.y.min < bbox2.y.min) {
      bbox2.y.min = _bbox.y.min;
    }
    if (_bbox.z && _bbox.z.min < bbox2.z.min) {
      bbox2.z.min = _bbox.z.min;
    }
    if (_bbox.x.max > bbox2.x.max) {
      bbox2.x.max = _bbox.x.max;
    }
    if (_bbox.y.max > bbox2.y.max) {
      bbox2.y.max = _bbox.y.max;
    }
    if (_bbox.z && _bbox.z.max > bbox2.z.max) {
      bbox2.z.max = _bbox.z.max;
    }
    bbox2.x.mid = (bbox2.x.min + bbox2.x.max) / 2;
    bbox2.y.mid = (bbox2.y.min + bbox2.y.max) / 2;
    if (bbox2.z) {
      bbox2.z.mid = (bbox2.z.min + bbox2.z.max) / 2;
    }
    bbox2.x.size = bbox2.x.max - bbox2.x.min;
    bbox2.y.size = bbox2.y.max - bbox2.y.min;
    if (bbox2.z) {
      bbox2.z.size = bbox2.z.max - bbox2.z.min;
    }
  },
  pairiteration: function(c1, c2, curveIntersectionThreshold) {
    const c1b = c1.bbox(), c2b = c2.bbox(), r = 1e5, threshold = curveIntersectionThreshold || 0.5;
    if (c1b.x.size + c1b.y.size < threshold && c2b.x.size + c2b.y.size < threshold) {
      return [
        (r * (c1._t1 + c1._t2) / 2 | 0) / r + "/" + (r * (c2._t1 + c2._t2) / 2 | 0) / r
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
    results = results.filter(function(v, i) {
      return results.indexOf(v) === i;
    });
    return results;
  },
  getccenter: function(p1, p2, p3) {
    const dx1 = p2.x - p1.x, dy1 = p2.y - p1.y, dx2 = p3.x - p2.x, dy2 = p3.y - p2.y, dx1p = dx1 * cos(quart) - dy1 * sin(quart), dy1p = dx1 * sin(quart) + dy1 * cos(quart), dx2p = dx2 * cos(quart) - dy2 * sin(quart), dy2p = dx2 * sin(quart) + dy2 * cos(quart), mx1 = (p1.x + p2.x) / 2, my1 = (p1.y + p2.y) / 2, mx2 = (p2.x + p3.x) / 2, my2 = (p2.y + p3.y) / 2, mx1n = mx1 + dx1p, my1n = my1 + dy1p, mx2n = mx2 + dx2p, my2n = my2 + dy2p, arc = utils.lli8(mx1, my1, mx1n, my1n, mx2, my2, mx2n, my2n), r = utils.dist(arc, p1);
    let s = atan2(p1.y - arc.y, p1.x - arc.x), m = atan2(p2.y - arc.y, p2.x - arc.x), e = atan2(p3.y - arc.y, p3.x - arc.x), _;
    if (s < e) {
      if (s > m || m > e) {
        s += tau;
      }
      if (s > e) {
        _ = e;
        e = s;
        s = _;
      }
    } else {
      if (e < m && m < s) {
        _ = e;
        e = s;
        s = _;
      } else {
        e += tau;
      }
    }
    arc.s = s;
    arc.e = e;
    arc.r = r;
    return arc;
  },
  numberSort: function(a, b) {
    return a - b;
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
    return this.curves.map(function(v) {
      return v.length();
    }).reduce(function(a, b) {
      return a + b;
    });
  }
  curve(idx) {
    return this.curves[idx];
  }
  bbox() {
    const c = this.curves;
    var bbox2 = c[0].bbox();
    for (var i = 1; i < c.length; i++) {
      utils.expandbox(bbox2, c[i].bbox());
    }
    return bbox2;
  }
  offset(d) {
    const offset = [];
    this.curves.forEach(function(v) {
      offset.push(...v.offset(d));
    });
    return new PolyBezier(offset);
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
    const points2 = this.points = [];
    for (let idx = 0, step = _3d ? 3 : 2; idx < len; idx += step) {
      var point = {
        x: args[idx],
        y: args[idx + 1]
      };
      if (_3d) {
        point.z = args[idx + 2];
      }
      points2.push(point);
    }
    const order = this.order = points2.length - 1;
    const dims = this.dims = ["x", "y"];
    if (_3d)
      dims.push("z");
    this.dimlen = dims.length;
    const aligned = utils.align(points2, { p1: points2[0], p2: points2[order] });
    this._linear = !aligned.some((p) => abs2(p.y) > 1e-4);
    this._lut = [];
    this._t1 = 0;
    this._t2 = 1;
    this.update();
  }
  static quadraticFromPoints(p1, p2, p3, t2) {
    if (typeof t2 === "undefined") {
      t2 = 0.5;
    }
    if (t2 === 0) {
      return new Bezier(p2, p2, p3);
    }
    if (t2 === 1) {
      return new Bezier(p1, p2, p2);
    }
    const abc = Bezier.getABC(2, p1, p2, p3, t2);
    return new Bezier(p1, abc.A, p3);
  }
  static cubicFromPoints(S, B, E, t2, d1) {
    if (typeof t2 === "undefined") {
      t2 = 0.5;
    }
    const abc = Bezier.getABC(3, S, B, E, t2);
    if (typeof d1 === "undefined") {
      d1 = utils.dist(B, abc.C);
    }
    const d2 = d1 * (1 - t2) / t2;
    const selen = utils.dist(S, E), lx = (E.x - S.x) / selen, ly = (E.y - S.y) / selen, bx1 = d1 * lx, by1 = d1 * ly, bx2 = d2 * lx, by2 = d2 * ly;
    const e1 = { x: B.x - bx1, y: B.y - by1 }, e2 = { x: B.x + bx2, y: B.y + by2 }, A = abc.A, v1 = { x: A.x + (e1.x - A.x) / (1 - t2), y: A.y + (e1.y - A.y) / (1 - t2) }, v2 = { x: A.x + (e2.x - A.x) / t2, y: A.y + (e2.y - A.y) / t2 }, nc1 = { x: S.x + (v1.x - S.x) / t2, y: S.y + (v1.y - S.y) / t2 }, nc2 = {
      x: E.x + (v2.x - E.x) / (1 - t2),
      y: E.y + (v2.y - E.y) / (1 - t2)
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
    const p = this.points, x = p[0].x, y = p[0].y, s = ["M", x, y, this.order === 2 ? "Q" : "C"];
    for (let i = 1, last = p.length; i < last; i++) {
      s.push(p[i].x);
      s.push(p[i].y);
    }
    return s.join(" ");
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
    return this.points.map(function(c, pos) {
      return "" + pos + c.x + c.y + (c.z ? c.z : 0);
    }).join("");
  }
  update() {
    this._lut = [];
    this.dpoints = utils.derive(this.points, this._3d);
    this.computedirection();
  }
  computedirection() {
    const points2 = this.points;
    const angle = utils.angle(points2[0], points2[this.order], points2[1]);
    this.clockwise = angle > 0;
  }
  length() {
    return utils.length(this.derivative.bind(this));
  }
  static getABC(order = 2, S, B, E, t2 = 0.5) {
    const u = utils.projectionratio(t2, order), um = 1 - u, C = {
      x: u * S.x + um * E.x,
      y: u * S.y + um * E.y
    }, s = utils.abcratio(t2, order), A = {
      x: B.x + (B.x - C.x) / s,
      y: B.y + (B.y - C.y) / s
    };
    return { A, B, C, S, E };
  }
  getABC(t2, B) {
    B = B || this.get(t2);
    let S = this.points[0];
    let E = this.points[this.order];
    return Bezier.getABC(this.order, S, B, E, t2);
  }
  getLUT(steps) {
    this.verify();
    steps = steps || 100;
    if (this._lut.length === steps) {
      return this._lut;
    }
    this._lut = [];
    steps--;
    for (let i = 0, p, t2; i < steps; i++) {
      t2 = i / (steps - 1);
      p = this.compute(t2);
      p.t = t2;
      this._lut.push(p);
    }
    return this._lut;
  }
  on(point, error) {
    error = error || 5;
    const lut = this.getLUT(), hits = [];
    for (let i = 0, c, t2 = 0; i < lut.length; i++) {
      c = lut[i];
      if (utils.dist(c, point) < error) {
        hits.push(c);
        t2 += i / lut.length;
      }
    }
    if (!hits.length)
      return false;
    return t /= hits.length;
  }
  project(point) {
    const LUT = this.getLUT(), l = LUT.length - 1, closest = utils.closest(LUT, point), mpos = closest.mpos, t1 = (mpos - 1) / l, t2 = (mpos + 1) / l, step = 0.1 / l;
    let mdist = closest.mdist, t3 = t1, ft = t3, p;
    mdist += 1;
    for (let d; t3 < t2 + step; t3 += step) {
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
  get(t2) {
    return this.compute(t2);
  }
  point(idx) {
    return this.points[idx];
  }
  compute(t2) {
    if (this.ratios) {
      return utils.computeWithRatios(t2, this.points, this.ratios, this._3d);
    }
    return utils.compute(t2, this.points, this._3d, this.ratios);
  }
  raise() {
    const p = this.points, np = [p[0]], k = p.length;
    for (let i = 1, pi3, pim; i < k; i++) {
      pi3 = p[i];
      pim = p[i - 1];
      np[i] = {
        x: (k - i) / k * pi3.x + i / k * pim.x,
        y: (k - i) / k * pi3.y + i / k * pim.y
      };
    }
    np[k] = p[k - 1];
    return new Bezier(np);
  }
  derivative(t2) {
    return utils.compute(t2, this.dpoints[0], this._3d);
  }
  dderivative(t2) {
    return utils.compute(t2, this.dpoints[1], this._3d);
  }
  align() {
    let p = this.points;
    return new Bezier(utils.align(p, { p1: p[0], p2: p[p.length - 1] }));
  }
  curvature(t2) {
    return utils.curvature(t2, this.dpoints[0], this.dpoints[1], this._3d);
  }
  inflections() {
    return utils.inflections(this.points);
  }
  normal(t2) {
    return this._3d ? this.__normal3(t2) : this.__normal2(t2);
  }
  __normal2(t2) {
    const d = this.derivative(t2);
    const q = sqrt2(d.x * d.x + d.y * d.y);
    return { x: -d.y / q, y: d.x / q };
  }
  __normal3(t2) {
    const r1 = this.derivative(t2), r2 = this.derivative(t2 + 0.01), q1 = sqrt2(r1.x * r1.x + r1.y * r1.y + r1.z * r1.z), q2 = sqrt2(r2.x * r2.x + r2.y * r2.y + r2.z * r2.z);
    r1.x /= q1;
    r1.y /= q1;
    r1.z /= q1;
    r2.x /= q2;
    r2.y /= q2;
    r2.z /= q2;
    const c = {
      x: r2.y * r1.z - r2.z * r1.y,
      y: r2.z * r1.x - r2.x * r1.z,
      z: r2.x * r1.y - r2.y * r1.x
    };
    const m = sqrt2(c.x * c.x + c.y * c.y + c.z * c.z);
    c.x /= m;
    c.y /= m;
    c.z /= m;
    const R = [
      c.x * c.x,
      c.x * c.y - c.z,
      c.x * c.z + c.y,
      c.x * c.y + c.z,
      c.y * c.y,
      c.y * c.z - c.x,
      c.x * c.z - c.y,
      c.y * c.z + c.x,
      c.z * c.z
    ];
    const n = {
      x: R[0] * r1.x + R[1] * r1.y + R[2] * r1.z,
      y: R[3] * r1.x + R[4] * r1.y + R[5] * r1.z,
      z: R[6] * r1.x + R[7] * r1.y + R[8] * r1.z
    };
    return n;
  }
  hull(t2) {
    let p = this.points, _p = [], q = [], idx = 0;
    q[idx++] = p[0];
    q[idx++] = p[1];
    q[idx++] = p[2];
    if (this.order === 3) {
      q[idx++] = p[3];
    }
    while (p.length > 1) {
      _p = [];
      for (let i = 0, pt, l = p.length - 1; i < l; i++) {
        pt = utils.lerp(t2, p[i], p[i + 1]);
        q[idx++] = pt;
        _p.push(pt);
      }
      p = _p;
    }
    return q;
  }
  split(t1, t2) {
    if (t1 === 0 && !!t2) {
      return this.split(t2).left;
    }
    if (t2 === 1) {
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
    if (!t2) {
      return result;
    }
    t2 = utils.map(t2, t1, 1, 0, 1);
    return result.right.split(t2).left;
  }
  extrema() {
    const result = {};
    let roots = [];
    this.dims.forEach(function(dim) {
      let mfn = function(v) {
        return v[dim];
      };
      let p = this.dpoints[0].map(mfn);
      result[dim] = utils.droots(p);
      if (this.order === 3) {
        p = this.dpoints[1].map(mfn);
        result[dim] = result[dim].concat(utils.droots(p));
      }
      result[dim] = result[dim].filter(function(t2) {
        return t2 >= 0 && t2 <= 1;
      });
      roots = roots.concat(result[dim].sort(utils.numberSort));
    }.bind(this));
    result.values = roots.sort(utils.numberSort).filter(function(v, idx) {
      return roots.indexOf(v) === idx;
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
  offset(t2, d) {
    if (typeof d !== "undefined") {
      const c = this.get(t2), n = this.normal(t2);
      const ret = {
        c,
        n,
        x: c.x + n.x * d,
        y: c.y + n.y * d
      };
      if (this._3d) {
        ret.z = c.z + n.z * d;
      }
      return ret;
    }
    if (this._linear) {
      const nv = this.normal(0), coords = this.points.map(function(p) {
        const ret = {
          x: p.x + t2 * nv.x,
          y: p.y + t2 * nv.y
        };
        if (p.z && nv.z) {
          ret.z = p.z + t2 * nv.z;
        }
        return ret;
      });
      return [new Bezier(coords)];
    }
    return this.reduce().map(function(s) {
      if (s._linear) {
        return s.offset(t2)[0];
      }
      return s.scale(t2);
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
    let s = n1.x * n2.x + n1.y * n2.y;
    if (this._3d) {
      s += n1.z * n2.z;
    }
    return abs2(acos2(s)) < pi2 / 3;
  }
  reduce() {
    let i, t1 = 0, t2 = 0, step = 0.01, segment, pass1 = [], pass2 = [];
    let extrema = this.extrema().values;
    if (extrema.indexOf(0) === -1) {
      extrema = [0].concat(extrema);
    }
    if (extrema.indexOf(1) === -1) {
      extrema.push(1);
    }
    for (t1 = extrema[0], i = 1; i < extrema.length; i++) {
      t2 = extrema[i];
      segment = this.split(t1, t2);
      segment._t1 = t1;
      segment._t2 = t2;
      pass1.push(segment);
      t1 = t2;
    }
    pass1.forEach(function(p1) {
      t1 = 0;
      t2 = 0;
      while (t2 <= 1) {
        for (t2 = t1 + step; t2 <= 1 + step; t2 += step) {
          segment = p1.split(t1, t2);
          if (!segment.simple()) {
            t2 -= step;
            if (abs2(t1 - t2) < step) {
              return [];
            }
            segment = p1.split(t1, t2);
            segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
            segment._t2 = utils.map(t2, 0, 1, p1._t1, p1._t2);
            pass2.push(segment);
            t1 = t2;
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
    const v = [this.offset(0, 10), this.offset(1, 10)];
    const points2 = this.points;
    const np = [];
    const o = utils.lli4(v[0], v[0].c, v[1], v[1].c);
    if (!o) {
      throw new Error("cannot scale this curve. Try reducing it first.");
    }
    [0, 1].forEach(function(t2) {
      const p = np[t2 * order] = utils.copy(points2[t2 * order]);
      p.x += (t2 ? r2 : r1) * v[t2].n.x;
      p.y += (t2 ? r2 : r1) * v[t2].n.y;
    });
    if (!distanceFn) {
      [0, 1].forEach((t2) => {
        if (order === 2 && !!t2)
          return;
        const p = np[t2 * order];
        const d2 = this.derivative(t2);
        const p2 = { x: p.x + d2.x, y: p.y + d2.y };
        np[t2 + 1] = utils.lli4(p, p2, o, points2[t2 + 1]);
      });
      return new Bezier(np);
    }
    [0, 1].forEach(function(t2) {
      if (order === 2 && !!t2)
        return;
      var p = points2[t2 + 1];
      var ov = {
        x: p.x - o.x,
        y: p.y - o.y
      };
      var rc = distanceFn ? distanceFn((t2 + 1) / order) : d;
      if (distanceFn && !clockwise)
        rc = -rc;
      var m = sqrt2(ov.x * ov.x + ov.y * ov.y);
      ov.x /= m;
      ov.y /= m;
      np[t2 + 1] = {
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
    function linearDistanceFunction(s, e, tlen2, alen2, slen2) {
      return function(v) {
        const f1 = alen2 / tlen2, f2 = (alen2 + slen2) / tlen2, d = e - s;
        return utils.map(v, 0, 1, s + f1 * d, s + f2 * d);
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
    bcurves = bcurves.map(function(s) {
      p = s.points;
      if (p[3]) {
        s.points = [p[3], p[2], p[1], p[0]];
      } else {
        s.points = [p[2], p[1], p[0]];
      }
      return s;
    }).reverse();
    const fs = fcurves[0].points[0], fe = fcurves[len - 1].points[fcurves[len - 1].points.length - 1], bs = bcurves[len - 1].points[bcurves[len - 1].points.length - 1], be = bcurves[0].points[0], ls = utils.makeline(bs, fs), le = utils.makeline(fe, be), segments = [ls].concat(fcurves).concat([le]).concat(bcurves), slen = segments.length;
    return new PolyBezier(segments);
  }
  outlineshapes(d1, d2, curveIntersectionThreshold) {
    d2 = d2 || d1;
    const outline = this.outline(d1, d2).curves;
    const shapes = [];
    for (let i = 1, len = outline.length; i < len / 2; i++) {
      const shape = utils.makeshape(outline[i], outline[len - i], curveIntersectionThreshold);
      shape.startcap.virtual = i > 1;
      shape.endcap.virtual = i < len / 2 - 1;
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
    return utils.roots(this.points, line2).filter((t2) => {
      var p = this.get(t2);
      return utils.between(p.x, mx, MX) && utils.between(p.y, my, MY);
    });
  }
  selfintersects(curveIntersectionThreshold) {
    const reduced = this.reduce(), len = reduced.length - 2, results = [];
    for (let i = 0, result, left, right; i < len; i++) {
      left = reduced.slice(i, i + 1);
      right = reduced.slice(i + 2);
      result = this.curveintersects(left, right, curveIntersectionThreshold);
      results.push(...result);
    }
    return results;
  }
  curveintersects(c1, c2, curveIntersectionThreshold) {
    const pairs = [];
    c1.forEach(function(l) {
      c2.forEach(function(r) {
        if (l.overlaps(r)) {
          pairs.push({ left: l, right: r });
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
  _error(pc, np1, s, e) {
    const q = (e - s) / 4, c1 = this.get(s + q), c2 = this.get(e - q), ref = utils.dist(pc, np1), d1 = utils.dist(pc, c1), d2 = utils.dist(pc, c2);
    return abs2(d1 - ref) + abs2(d2 - ref);
  }
  _iterate(errorThreshold, circles) {
    let t_s = 0, t_e = 1, safety;
    do {
      safety = 0;
      t_e = 1;
      let np1 = this.get(t_s), np2, np3, arc, prev_arc;
      let curr_good = false, prev_good = false, done;
      let t_m = t_e, prev_e = 1, step = 0;
      do {
        prev_good = curr_good;
        prev_arc = arc;
        t_m = (t_s + t_e) / 2;
        step++;
        np2 = this.get(t_m);
        np3 = this.get(t_e);
        arc = utils.getccenter(np1, np2, np3);
        arc.interval = {
          start: t_s,
          end: t_e
        };
        let error = this._error(arc, np1, t_s, t_e);
        curr_good = error <= errorThreshold;
        done = prev_good && !curr_good;
        if (!done)
          prev_e = t_e;
        if (curr_good) {
          if (t_e >= 1) {
            arc.interval.end = prev_e = 1;
            prev_arc = arc;
            if (t_e > 1) {
              let d = {
                x: arc.x + arc.r * cos2(arc.e),
                y: arc.y + arc.r * sin2(arc.e)
              };
              arc.e += utils.angle({ x: arc.x, y: arc.y }, d, this.get(1));
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
      prev_arc = prev_arc ? prev_arc : arc;
      circles.push(prev_arc);
      t_s = prev_e;
    } while (t_e < 1);
    return circles;
  }
};

// src/geometry/Bezier.ts
var quadraticBend = function(b, bend = 0) {
  return quadraticSimple(b.a, b.b, bend);
};
var quadraticSimple = function(start, end, bend = 0) {
  if (isNaN(bend))
    throw Error("bend is NaN");
  if (bend < -1 || bend > 1)
    throw Error("Expects bend range of -1 to 1");
  let middle = compute(start, end, 0.5);
  let target = middle;
  if (end.y < start.y) {
    target = bend > 0 ? { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y) } : { x: Math.max(start.x, end.x), y: Math.max(start.y, end.y) };
  } else {
    target = bend > 0 ? { x: Math.max(start.x, end.x), y: Math.min(start.y, end.y) } : { x: Math.min(start.x, end.x), y: Math.max(start.y, end.y) };
  }
  let handle = compute(middle, target, Math.abs(bend));
  return quadratic(start, end, handle);
};
var quadratic = function(start, end, handle) {
  const b = new Bezier(start, handle, end);
  return Object.freeze({
    a: start,
    b: end,
    quadratic: handle,
    length: () => b.length(),
    compute: (t2) => b.compute(t2),
    bbox: () => {
      const { x, y } = b.bbox();
      return fromTopLeft({ x: x.min, y: y.min }, x.size, y.size);
    },
    toString: () => b.toString()
  });
};

// src/geometry/Path.ts
var Path_exports = {};
__export(Path_exports, {
  getEnd: () => getEnd,
  getStart: () => getStart
});
var getStart = function(path) {
  let p = path;
  if (p.a && p.b)
    return p.a;
  throw Error("Cannot get start for path");
};
var getEnd = function(path) {
  let p = path;
  if (p.a && p.b)
    return p.b;
  throw Error("Cannot get end for path");
};

// src/geometry/MultiPath.ts
var MultiPath_exports = {};
__export(MultiPath_exports, {
  fromPaths: () => fromPaths,
  setSegment: () => setSegment
});
var setSegment = function(multiPath, index, path) {
  let existing = multiPath.segments;
  existing[index] = path;
  return fromPaths(...existing);
};
var fromPaths = function(...paths2) {
  let lastPos = getEnd(paths2[0]);
  for (let i = 1; i < paths2.length; i++) {
    let start = getStart(paths2[i]);
    if (!Point_exports.equals(start, lastPos))
      throw Error("Path index " + i + " does not start at prior path end. Start: " + start.x + "," + start.y + " expected: " + lastPos.x + "," + lastPos.y + "");
    lastPos = getEnd(paths2[i]);
  }
  let widths = paths2.map((l) => l.bbox().width);
  let lengths = paths2.map((l) => l.length());
  let totalLength = 0;
  let totalWidth = 0;
  for (let i = 0; i < lengths.length; i++)
    totalLength += lengths[i];
  for (let i = 0; i < widths.length; i++)
    totalWidth += widths[i];
  return Object.freeze({
    segments: paths2,
    length: () => totalLength,
    compute: (t2, useWidth = false) => {
      const expected = t2 * (useWidth ? totalWidth : totalLength);
      let soFar = 0;
      let l = useWidth ? widths : lengths;
      for (let i = 0; i < l.length; i++) {
        if (soFar + l[i] >= expected) {
          let relative = expected - soFar;
          let amt = relative / l[i];
          if (amt > 1)
            amt = 1;
          return paths2[i].compute(amt);
        } else
          soFar += l[i];
      }
      return { x: 0, y: 0 };
    },
    bbox: () => {
      return fromTopLeft({ x: 0, y: 0 }, 10, 10);
    },
    toString: () => {
      let s = paths2.map((p) => p.toString()).join(", ");
      return s;
    }
  });
};

// src/modulation/Envelope.ts
var Envelope_exports = {};
__export(Envelope_exports, {
  EnvelopeStage: () => EnvelopeStage,
  adsr: () => adsr,
  stages: () => stages
});

// src/modulation/AdsrEnvelope.ts
var adsr = (opts) => {
  const { sustainLevel = 0.5, attackBend = 0, decayBend = 0, releaseBend = 0 } = opts;
  if (sustainLevel > 1 || sustainLevel < 0)
    throw Error("sustainLevel must be between 0-1");
  const env = stages(opts);
  const max2 = 1;
  const attack = quadraticSimple({ x: 0, y: 0 }, { x: max2, y: max2 }, attackBend);
  const decay = quadraticSimple({ x: 0, y: max2 }, { x: max2, y: sustainLevel }, decayBend);
  const sustain = fromPoints({ x: 0, y: sustainLevel }, { x: max2, y: sustainLevel });
  const release = quadraticSimple({ x: 0, y: sustainLevel }, { x: max2, y: 0 }, releaseBend);
  const paths2 = [
    null,
    attack,
    decay,
    sustain,
    release
  ];
  return Object.freeze({
    getBeziers: () => [attack, decay, sustain, release],
    trigger: () => {
      env.trigger();
    },
    reset: () => {
      env.reset();
    },
    release: () => {
      env.release();
    },
    hold: () => {
      env.hold();
    },
    compute: () => {
      const [stage, amt] = env.compute();
      const p = paths2[stage];
      if (p === null)
        return [stage, 0];
      return [stage, p.compute(amt).y];
    }
  });
};

// src/modulation/Envelope.ts
var EnvelopeStage;
(function(EnvelopeStage2) {
  EnvelopeStage2[EnvelopeStage2["Stopped"] = 0] = "Stopped";
  EnvelopeStage2[EnvelopeStage2["Attack"] = 1] = "Attack";
  EnvelopeStage2[EnvelopeStage2["Decay"] = 2] = "Decay";
  EnvelopeStage2[EnvelopeStage2["Sustain"] = 3] = "Sustain";
  EnvelopeStage2[EnvelopeStage2["Release"] = 4] = "Release";
})(EnvelopeStage || (EnvelopeStage = {}));
var msRelativeTimer = function() {
  let start = performance.now();
  return {
    reset: () => {
      start = performance.now();
    },
    elapsed: () => {
      return performance.now() - start;
    }
  };
};
var stages = function(opts = {}) {
  const { looping = false } = opts;
  const { timerSource = msRelativeTimer } = opts;
  const { attackDuration = 300 } = opts;
  const { decayDuration = 500 } = opts;
  const { releaseDuration = 1e3 } = opts;
  let stage = 0;
  let timer2 = null;
  let isHeld = false;
  const setStage = (newStage) => {
    if (stage == newStage)
      return;
    stage = newStage;
    if (stage == 1)
      timer2 = timerSource();
    else if (stage == 4)
      timer2 = timerSource();
  };
  const compute2 = () => {
    if (stage == 0)
      return [0, 0];
    if (timer2 == null)
      throw Error("Bug: timer is null");
    if (stage == 3)
      return [stage, 1];
    let elapsed = timer2.elapsed();
    if (stage == 4) {
      let relative = elapsed / releaseDuration;
      if (relative > 1) {
        if (looping) {
          trigger();
        } else {
          setStage(0);
        }
        return [stage, 0];
      }
      return [stage, relative];
    }
    if (elapsed <= attackDuration) {
      return [stage, elapsed / attackDuration];
    } else if (elapsed <= decayDuration + attackDuration) {
      if (stage == 1)
        setStage(2);
      return [stage, (elapsed - attackDuration) / decayDuration];
    } else {
      if (stage == 2)
        setStage(3);
      if (!isHeld) {
        setStage(4);
      }
      return [stage, 0];
    }
  };
  const trigger = () => {
    isHeld = false;
    setStage(1);
  };
  const hold = () => {
    isHeld = true;
    if (stage == 0) {
      setStage(1);
    } else {
      setStage(3);
    }
  };
  const release = () => {
    if (!isHeld)
      throw Error("Not being held");
    setStage(4);
  };
  const reset = () => {
    setStage(0);
  };
  reset();
  return Object.freeze({
    trigger,
    reset,
    release,
    hold,
    compute: compute2
  });
};

// src/modulation/Easing.ts
var Easing_exports = {};
__export(Easing_exports, {
  getEasings: () => getEasings,
  tick: () => tick,
  timer: () => timer
});

// src/util.ts
var clamp = (v, min2 = 0, max2 = 1) => {
  if (v < min2)
    return min2;
  if (v > max2)
    return max2;
  return v;
};
var getMinMaxAvg = (data) => {
  let min2 = Number.MAX_SAFE_INTEGER;
  let total = 0;
  let samples = 0;
  let max2 = Number.MIN_SAFE_INTEGER;
  for (let i = 0; i < data.length; i++) {
    if (Number.isNaN(data[i]))
      continue;
    min2 = Math.min(data[i], min2);
    max2 = Math.max(data[i], max2);
    total += data[i];
    samples++;
  }
  return { min: min2, max: max2, avg: total / samples };
};

// src/modulation/Easing.ts
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
  for (const [k, v] of Object.entries(easings)) {
    if (k.toLowerCase() === name) {
      return v;
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

// src/Lists.ts
var Lists_exports = {};
__export(Lists_exports, {
  Circular: () => Circular,
  Fifo: () => Fifo,
  Lifo: () => Lifo
});
var _capacity, _pointer;
var _Circular = class extends Array {
  constructor(capacity) {
    super();
    __privateAdd(this, _capacity, void 0);
    __privateAdd(this, _pointer, void 0);
    if (Number.isNaN(capacity))
      throw Error("capacity is NaN");
    if (capacity <= 0)
      throw Error("capacity must be greater than zero");
    __privateSet(this, _capacity, capacity);
    __privateSet(this, _pointer, 0);
  }
  add(thing) {
    const ca = _Circular.from(this);
    ca[__privateGet(this, _pointer)] = thing;
    __privateSet(ca, _capacity, __privateGet(this, _capacity));
    __privateSet(ca, _pointer, __privateGet(this, _pointer) + 1 === __privateGet(this, _capacity) ? 0 : __privateGet(this, _pointer) + 1);
    return ca;
  }
};
var Circular = _Circular;
_capacity = new WeakMap();
_pointer = new WeakMap();
var _capacity2;
var _Lifo = class extends Array {
  constructor(capacity = -1) {
    super();
    __privateAdd(this, _capacity2, void 0);
    __privateSet(this, _capacity2, capacity);
  }
  add(thing) {
    let size, len;
    if (__privateGet(this, _capacity2) > 0 && this.length >= __privateGet(this, _capacity2)) {
      size = __privateGet(this, _capacity2);
      len = __privateGet(this, _capacity2) - 1;
    } else {
      size = this.length + 1;
      len = this.length;
    }
    const t2 = Array(size);
    t2[0] = thing;
    for (let i = 1; i < len + 1; i++) {
      t2[i] = this[i - 1];
    }
    const a = _Lifo.from(t2);
    __privateSet(a, _capacity2, __privateGet(this, _capacity2));
    return a;
  }
  peek() {
    return this[0];
  }
  removeLast() {
    if (this.length === 0)
      return this;
    const a = _Lifo.from(this.slice(0, this.length - 1));
    __privateSet(a, _capacity2, __privateGet(this, _capacity2));
    return a;
  }
  remove() {
    if (this.length === 0)
      return this;
    const a = _Lifo.from(this.slice(1));
    __privateSet(a, _capacity2, __privateGet(this, _capacity2));
    return a;
  }
};
var Lifo = _Lifo;
_capacity2 = new WeakMap();
var _capacity3;
var _Fifo = class extends Array {
  constructor(capacity = -1) {
    super();
    __privateAdd(this, _capacity3, void 0);
    __privateSet(this, _capacity3, capacity);
  }
  static create(capacity, data) {
    const q = new _Fifo(capacity);
    q.push(...data);
    return q;
  }
  add(thing) {
    const d = [...this, thing];
    if (__privateGet(this, _capacity3) > 0 && d.length > __privateGet(this, _capacity3)) {
      return _Fifo.create(__privateGet(this, _capacity3), d.slice(0, __privateGet(this, _capacity3)));
    }
    return _Fifo.create(__privateGet(this, _capacity3), d);
  }
  peek() {
    return this[0];
  }
  remove() {
    if (this.length === 0)
      return this;
    const d = this.slice(1);
    return _Fifo.create(__privateGet(this, _capacity3), d);
  }
};
var Fifo = _Fifo;
_capacity3 = new WeakMap();

// src/visualisation/BasePlot.ts
var BasePlot = class {
  constructor(canvasEl) {
    this.plotPadding = 10;
    this.showMiddle = true;
    this.showScale = true;
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
    const range = this.scaleMax - this.scaleMin;
    return range;
  }
  map(value, x1, y1, x2, y2) {
    return (value - x1) * (y2 - x2) / (y1 - x1) + x2;
  }
  scaleNumber(v) {
    if (Math.abs(v) > 50)
      return Math.floor(v).toString();
    return v.toFixed(this.precision);
  }
  drawScale(g, min2, max2, avg, range, plotWidth, plotHeight) {
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
    g.fillText(this.scaleNumber(range / 2 + this.scaleMin), labelInset, middleY);
    g.fillText(this.scaleNumber(this.scaleMax), labelInset, topY);
    g.fillText(this.scaleNumber(min2), rightJustif, bottomY);
    g.fillText(`Avg: ${this.scaleNumber(avg)}`, rightJustif, middleY);
    g.fillText(this.scaleNumber(max2), rightJustif, topY);
  }
  baseDraw() {
    const c = this.canvasEl;
    const g = c.getContext("2d");
    if (g === null)
      return;
    const canvasHeight = c.height;
    const canvasWidth = c.width;
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
    this.color = "silver";
    this.lineWidth = 3;
    this.buffer = new Circular(samples);
    this.samples = samples;
  }
  draw(g, plotWidth, plotHeight) {
    const d = this.buffer;
    const dataLength = d.length;
    const { min: min2, max: max2, avg } = getMinMaxAvg(d);
    const range = this.pushScale(min2, max2);
    const lineWidth = plotWidth / dataLength;
    let x = this.plotPadding;
    if (this.showScale)
      x += 25;
    g.beginPath();
    g.lineWidth = lineWidth;
    g.strokeStyle = this.color;
    for (let i = 0; i < dataLength; i++) {
      const y = this.map(d[i], this.scaleMin, this.scaleMax, plotHeight, 0) + this.plotPadding;
      if (i === 0) {
        g.moveTo(x, y);
      } else {
        g.lineTo(x, y);
      }
      x += lineWidth;
    }
    g.stroke();
    g.fillStyle = "black";
    this.drawScale(g, min2, max2, avg, range, plotWidth, plotHeight);
  }
  clear() {
    this.buffer = new Circular(this.samples);
    this.repaint();
  }
  push(v) {
    this.buffer = this.buffer.add(v);
    if (this.paused)
      return;
    this.repaint();
  }
};

// src/visualisation/Drawing.ts
var Drawing_exports = {};
__export(Drawing_exports, {
  line: () => line,
  paths: () => paths,
  pointLabels: () => pointLabels,
  points: () => points,
  pointsEnclosed: () => pointsEnclosed,
  quadraticBezier: () => quadraticBezier
});
function paths(ctx, ...pathsToDraw) {
  guardCtx(ctx);
  if (Array.isArray(pathsToDraw[0]))
    return paths(ctx, ...pathsToDraw[0]);
  for (let i = 0; i < pathsToDraw.length; i++) {
    let p = pathsToDraw[i];
    if (p.a && p.b && p.quadratic)
      quadraticBezier(p, ctx, true);
    else if (p.a && p.b)
      line(p, ctx);
  }
}
function points(ctx, ...pts) {
  guardCtx(ctx);
  if (pts.length == 0)
    return;
  if (Array.isArray(pts[0]))
    return points(ctx, ...pts[0]);
  for (let i = 0; i < pts.length; i++)
    guard(pts[i], "Index " + i);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.stroke();
}
function pointsEnclosed(ctx, ...pts) {
  guardCtx(ctx);
  if (pts.length == 0)
    return;
  if (Array.isArray(pts[0]))
    return pointsEnclosed(ctx, ...pts[0]);
  for (let i = 0; i < pts.length; i++)
    guard(pts[i], "Index " + i);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.lineTo(pts[0].x, pts[0].y);
  ctx.stroke();
}
function pointLabels(ctx, ...pts) {
  guardCtx(ctx);
  if (pts.length == 0)
    return;
  if (Array.isArray(pts[0]))
    return pointLabels(ctx, ...pts[0]);
  for (let i = 0; i < pts.length; i++)
    guard(pts[i], "Index " + i);
  for (let i = 0; i < pts.length; i++) {
    ctx.fillText(i.toString(), pts[i].x, pts[i].y);
  }
}
function guardCtx(ctx) {
  if (ctx === void 0)
    throw Error("ctx undefined");
}
function drawDot(pos, size, ctx, fillStyle = "red") {
  ctx.beginPath();
  ctx.strokeStyle = fillStyle;
  ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
  ctx.stroke();
}
function quadraticBezier(line2, ctx, debug = false) {
  guardCtx(ctx);
  const h = line2.quadratic;
  const ss = ctx.strokeStyle;
  if (debug) {
    ctx.strokeStyle = "whitesmoke";
    points(ctx, line2.a, h, line2.b);
    ctx.strokeStyle = ss;
  }
  ctx.beginPath();
  ctx.moveTo(line2.a.x, line2.a.y);
  ctx.quadraticCurveTo(h.x, h.y, line2.b.x, line2.b.y);
  ctx.stroke();
  if (debug) {
    ctx.fillText("a", line2.a.x + 5, line2.a.y);
    ctx.fillText("b", line2.b.x + 5, line2.b.y);
    ctx.fillText("h", h.x + 5, h.y);
    drawDot(h, 5, ctx);
    drawDot(line2.a, 5, ctx, "black");
    drawDot(line2.b, 5, ctx, "black");
  }
}
function line(line2, ctx, debug = false) {
  guardCtx(ctx);
  ctx.beginPath();
  ctx.moveTo(line2.a.x, line2.a.y);
  ctx.lineTo(line2.b.x, line2.b.y);
  if (debug) {
    ctx.fillText("a", line2.a.x, line2.a.y);
    ctx.fillText("b", line2.b.x, line2.b.y);
    drawDot(line2.a, 5, ctx, "black");
    drawDot(line2.b, 5, ctx, "black");
  }
  ctx.stroke();
}
export {
  Bezier_exports as Beziers,
  Drawing_exports as Drawing,
  Easing_exports as Easings,
  Envelope_exports as Envelopes,
  Line_exports as Lines,
  Lists_exports as Lists,
  MultiPath_exports as MultiPaths,
  Path_exports as Paths,
  Plot,
  Point_exports as Points,
  Rect_exports as Rects
};
//# sourceMappingURL=bundle.mjs.map
