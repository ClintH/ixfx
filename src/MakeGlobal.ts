import * as Util from './Util.js';
import * as Random from './random/index.js';
import * as Data from './data/index.js';
import * as Geometry from './geometry/index.js';
import * as Text from './Text.js';
import * as Numbers from './numbers/index.js';
import * as Io from './io/index.js';
import * as Flow from './flow/index.js';
import * as Iterables from './iterables/index.js';
import * as Visual from './visual/index.js';
import * as Dom from './dom/index.js';
import * as Events from './Events.js';
import * as Modulation from './modulation/index.js';
import * as Collections from './collections/index.js';
try {
  if (typeof window !== `undefined`) {
    (window as any).Util = Util;
    (window as any).Random = Random;
    (window as any).Data = Data;
    (window as any).Text = Text;
    (window as any).Numbers = Numbers;
    (window as any).Io = Io;
    (window as any).Geometry = Geometry;
    (window as any).Flow = Flow;
    (window as any).Iterables = Iterables;
    (window as any).Visual = Visual;
    (window as any).Events = Events;
    (window as any).Modulation = Modulation;
    (window as any).Dom = Dom;
    (window as any).Collections = Collections;
  }
} catch { /* no-op */ }