const isDomElement = (d: HTMLElement): d is HTMLElement => ((d as HTMLElement).nodeType === 1 && typeof d.nodeName === `string`) || d instanceof HTMLElement;

export type EventTransform<T extends Event> = (evt:T) => object;

class DomSubscription<T extends Event> implements EventListenerObject {
  readonly eventName:string;
  #el:HTMLElement|undefined;
  readonly transform:EventTransform<T>|undefined;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  readonly value:any;
  debugEventFlow:boolean = false;

  constructor(el:HTMLElement, eventName:string, transformFn?:EventTransform<T>) {
    this.#el = el;
    this.eventName = eventName;
    this.transform = transformFn;
    this.#el.addEventListener(this.eventName, this);
    this.value = {};
  }

  handleEvent(evt:T) {
    if (this.debugEventFlow) console.log(evt);
    if (this.transform) {
      Object.assign(this.value, this.transform(evt)); 
    } else {
      Object.assign(this.value, evt);
    }
  }

  /// TODO: Ability to automatically clear triggered by some other event(s)

  clear() {
    const keys = Object.keys(this);
    console.log(`Keys to delete: ${keys}`);
    keys.forEach(key => {
      delete this.value[key];
    });

    // const keys = Object.keys(this);
    // console.log(`Keys to delete: ${keys}`);
    // keys.forEach(key => {
    //   if (key.startsWith(`_`)) return;
    //   // @ts-ignore
    //   delete this[key];
    // });
  }

  dispose() {
    if (this.#el === undefined) return;
    this.#el.removeEventListener(this.eventName, this);
    this.#el = undefined;
    this.clear();
  }
}

export class EventResponsive {
  subs:DomSubscription<any>[] = [];

  pluckedKeys(object:HTMLElement, eventName:string, ...keys:string[]) {
    const transform = (evt:Event) => {
      const ret = {};
      keys.forEach(key => {
        // @ts-ignore
        ret[key] = evt[key];
      });
      return ret;
    };

    this.add(object, eventName, transform);
  }

  add<T extends Event>(object:HTMLElement, eventName:string, transformFn:EventTransform<T>) {
    if (object === undefined) throw new Error(`object parameter undefined`);
    if (isDomElement(object)) {
      const sub = new DomSubscription<T>(object, eventName, transformFn);
      this.subs.push(sub);
      return sub;
    } else throw new Error(`Only DOM elements supported`);
  }

  // add(object:HTMLElement, ...eventNames:string[]):DomSubscription[] {
  //   if (object === undefined) throw new Error(`object parameter undefined`);
  //   if (isDomElement(object)) {
  //     const newSubs:DomSubscription[] = [];
  //     eventNames.forEach(ev => {
  //       const sub = new DomSubscription(object, ev);
  //       this.subs.push(sub);
  //       newSubs.push(sub);
  //     });
  //     return newSubs;
  //   } else throw new Error(`Only DOM elements supported`);
  // }

  dispose() {
    this.subs.forEach(s => s.dispose());
    this.subs = [];
  }
}

