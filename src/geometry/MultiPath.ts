import {Points} from "../index.js";
import * as Paths from "./Path.js";
import * as Rects from './Rect.js';

export type MultiPath = Paths.Path & {
  segments: Paths.Path[]
}

export const setSegment = function (multiPath: MultiPath, index: number, path: Paths.Path): MultiPath {
  let existing = multiPath.segments;
  existing[index] = path;
  return fromPaths(...existing);
}

export const fromPaths = function (...paths: Paths.Path[]): MultiPath {
  // Sanity check paths are connected
  let lastPos = Paths.getEnd(paths[0]);
  for (let i = 1; i < paths.length; i++) {
    let start = Paths.getStart(paths[i]);
    if (!Points.equals(start, lastPos))
      throw Error('Path index ' + i + ' does not start at prior path end. Start: ' + start.x + ',' + start.y + ' expected: ' + lastPos.x + ',' + lastPos.y + '');
    lastPos = Paths.getEnd(paths[i]);
  }

  let widths = paths.map(l => l.bbox().width);
  let lengths = paths.map(l => l.length());
  let totalLength = 0;
  let totalWidth = 0;
  for (let i = 0; i < lengths.length; i++) totalLength += lengths[i];
  for (let i = 0; i < widths.length; i++) totalWidth += widths[i];

  return Object.freeze({
    segments: paths,
    length: () => totalLength,
    compute: (t: number, useWidth: boolean = false) => {
      // Expected value to land on
      const expected = t * (useWidth ? totalWidth : totalLength);
      let soFar = 0;

      // Use widths or lengths?
      let l = useWidth ? widths : lengths;
      for (let i = 0; i < l.length; i++) {
        if (soFar + l[i] >= expected) {
          let relative = expected - soFar;
          let amt = relative / l[i];
          if (amt > 1) amt = 1;
          return paths[i].compute(amt);
        } else soFar += l[i];
      }
      return {x: 0, y: 0}
    },
    bbox: () => {
      return Rects.fromTopLeft({x: 0, y: 0}, 10, 10)
    },
    toString: () => {
      let s = paths.map(p => p.toString()).join(', ');
      return s;
    }
  });
}
