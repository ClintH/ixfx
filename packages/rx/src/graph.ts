import {Directed} from "@ixfxfun/collections/graph";
import { initStream } from "./init-stream.js";
import type { Reactive } from "./types.js";
import { isReactive } from "./util.js";
type RxNodeBase = {
  type: `primitive` | `rx` | `object`
}

type RxNodeRx = RxNodeBase & {
  type: `rx`,
  value: Reactive<any>
}

type RxNodePrimitive = RxNodeBase & {
  type: `primitive`,
  value: any
}

type RxNode = RxNodeRx | RxNodePrimitive;

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
 */
export function prepare<V extends Record<string, any>>(_rx: V): Reactive<V> {
  let g = Directed.graph();
  const nodes = new Map<string, RxNode>();
  const events = initStream<V>();

  const process = (o: object, path: string) => {
    for (const [ key, value ] of Object.entries(o)) {
      const subPath = path + `.` + key;
      g = Directed.connect(g, {
        from: path,
        to: subPath
      });
      if (isReactive(value)) {
        nodes.set(subPath, { value, type: `rx` });
        value.on(v => {
          console.log(`Rx.prepare value: ${ JSON.stringify(v) } path: ${ subPath }`);
        });
      } else {
        const valueType = typeof value;
         
        if (valueType === `bigint` || valueType === `boolean` || valueType === `number` || valueType === `string`) {
          nodes.set(subPath, { type: `primitive`, value });
        } else if (valueType === `object`) {
          process(value, subPath)
        } else if (valueType === `function`) {
          console.log(`Rx.process - not handling functions`);
        }
      }
    }
  }

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
  }
  return returnValue;
}

