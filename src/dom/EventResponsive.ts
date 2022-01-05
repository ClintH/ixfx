//const isDomElement = (d: HTMLElement): d is HTMLElement => ((d as HTMLElement).nodeType === 1 && typeof d.nodeName === `string`) || d instanceof HTMLElement;

import {Debouncer, debounce} from "../Trigger";

export type EventTransform<T extends Event> = (evt:T) => object;

interface SubOptions<T extends Event> {
  transform?:EventTransform<T>
  autoClearMs?:number
  eventName:string
  object:HTMLElement
}

class DomSubscription<T extends Event> implements EventListenerObject {
  readonly eventName:string;
  #el:HTMLElement|undefined;
  readonly transform:EventTransform<T>|undefined;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  readonly value:any;
  debugEventFlow:boolean = false;
  #debouncer:Debouncer|undefined = undefined;

  constructor(opts:SubOptions<T>) {
    this.#el = opts.object;
    this.eventName = opts.eventName;
    this.transform = opts.transform;
    this.#el.addEventListener(this.eventName, this);
    this.value = {};
  
    if (opts.autoClearMs) {
      this.#debouncer = debounce(() => {
        //console.log(`debounce has triggered clear!`);
        this.clear();
      }, opts.autoClearMs);
    }
  }

  handleEvent(evt:T) {
    if (this.debugEventFlow) console.log(`EventResponsive.handleEvent: ${JSON.stringify(evt)}`);
    if (this.transform) {
      Object.assign(this.value, this.transform(evt)); 
    } else {
      Object.assign(this.value, evt);
    }

    if (this.#debouncer) this.#debouncer.reset();
  }

  clear() {
    const keys = Object.keys(this.value);
    //console.log(`Keys to delete: ${keys}`);
    keys.forEach(key => {
      delete this.value[key];
    });
  }

  dispose() {
    console.log(`EventResponsive dispose`);

    if (this.#el === undefined) return;
    this.#el.removeEventListener(this.eventName, this);
    this.clear();
    this.#el = undefined;
    if (this.#debouncer) this.#debouncer.dispose();
  }
}

export const dom = <T extends Event>(opts:SubOptions<T>) => new DomSubscription<T>(opts);