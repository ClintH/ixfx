// import * as Filters from "./Filters.js";
//type NumberToTrigger = (v: number) => boolean;
//type TriggerToTrigger = (trigger: boolean) => boolean;

type FlowHandler = (args?:any) => void;

interface FlowSink {
 [key:string]: FlowHandler;
}

type EventFilter<T extends Event> = (v:T) => boolean;

type FlowSource = {
  name:string,
  dispose():void,
  input:FlowSink,
};

type FlowFactory = (sink:FlowSink, opts:any) => FlowSource;

const sinkify = (handler:FlowHandler): FlowSink => ({ '*': handler });

export const compose = (sink:FlowSink, ...what:[FlowFactory, any][]): FlowSource => {
  const startSink = sink;
  // let sink = sinkify((args:any) => {
  //   console.log(`default sink ${JSON.stringify(args)}`);
  // });

  const sources:FlowSource[] = [];
  for (let i=0;i<what.length;i++) {
    const [factory, opts] = what[i];
    const src = factory(sink, opts[i]);
    sink = src.input;
    sources.push(src);
  }

  const dispose = () => {
    sources.forEach(s => s.dispose());
  };
  return {
    name:`compose`,
    input: startSink,
    dispose
  };
};

export const debounceFactory = (sink:FlowSink, opts:{timeoutMs:number}): FlowSource => {
  let timer:number|undefined;

  const input = sinkify(() => {
    //console.log(`debounce reset`);
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => { sink[`*`](null); }, opts.timeoutMs);
  });

  const dispose = () => {
    if (timer) window.clearTimeout(timer);
    timer = undefined;
  };

  return { input, dispose, name:`debounce` };
};

export type Debouncer = {
  reset:()=>void
  dispose:()=>void
}
export const debounce = (triggered:()=>void, timeoutMs:number):Debouncer => {
  const opts = { timeoutMs: timeoutMs};
  
  const sink:FlowSink = {
    '*': () => {
      triggered();
    }
  };
  const source = debounceFactory(sink, opts);
  const reset = () => {
    source.input[`*`](null);
  };
  return {...source, reset};
};


export const event = <T extends Event>(sink:FlowSink, opts:{object:EventSource, eventName:string, filter?:EventFilter<T>}):FlowSource => {
  let started = false;
  let disposed = false;
  const {object, eventName, filter } = opts;

  const listener = (evt:T) => {
    if (filter !== undefined && !filter(evt)) return;
    sink[`*`](null);
  };
  
  const input = {
    start: () => {
      if (started) return;
      if (disposed) throw new Error(`Cannot start after being disposed`);
      started = true;
      object.addEventListener(eventName as keyof EventSourceEventMap, listener as EventListener);
    },
    stop: () => {
      if (!started) return;
      started = false;
      object.removeEventListener(eventName as keyof EventSourceEventMap, listener as EventListener);
    }
  };

  const dispose = () => {
    console.log(`debouncer dispose`);
    if (disposed) return;
    disposed = true;
    stop();
  };

  return {
    input,
    dispose,
    name:`event`
  };
};


// let pointerMove = compose(
//   sinkify((args:any) => {
//     console.log(`compose default sink!`)
//   }), [event, {object:window, eventName:'click'}]);
   
// const createProbability = (probability: number): NumberToTrigger | TriggerToTrigger => {
//   return (v: number | boolean): boolean => {
//     const rando = Math.random();
//     return (rando <= probability);
//   };
// };

// const delay = (timeMs: number): TriggerToTrigger => {
//   let p = new Promise<boolean>((resolve, reject) => {
//     setTimeout(() => {
//       resolve(true);
//     }, timeMs);
//   });
//   return p;
// }

// const f = Filters.threshold(0.5);
// const f2 = Filters.rangeInclusive(0.7, 1);


// for await (let n of s) {
//   //filterChain.reduceRight()
//   if (!chain(n)) console.log(' X ' + n);
//   else console.log(n);
// }

