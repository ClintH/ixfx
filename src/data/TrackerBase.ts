import { TrackedValueOpts } from "./TrackedValue.js";

export abstract class TrackerBase<V> {
  /**
   * @ignore
   */
  seenCount:number;

  /**
  * @ignore
  */
  protected storeIntermediate:boolean;
  
  /**
  * @ignore
  */
  protected resetAfterSamples:number;

  constructor(readonly id:string = `TrackerBase`, opts:TrackedValueOpts = {}) {
    this.storeIntermediate = opts.storeIntermediate ?? false;
    this.resetAfterSamples = opts.resetAfterSamples ?? -1;
    this.seenCount = 0;
  }

  /**
   * Reset tracker
   */
  reset() {
    this.seenCount = 0;
    this.onReset();
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  seen(...p:V[]):any {    
    if (this.resetAfterSamples > 0 && this.seenCount > this.resetAfterSamples) {
      this.reset();
    }

    this.seenCount += p.length;
    const t = this.seenImpl(p);
    this.onSeen(t);
  }

  /**
   * @ignore
   * @param p 
   */
  abstract seenImpl(p:V[]):V[];

  abstract get last():V|undefined;

  /**
   * Returns the initial value, or undefined
   */
  abstract get initial():V|undefined;

  /**
   * Returns the elapsed milliseconds since the initial value
   */
  abstract get elapsed():number;

  /**
   * @ignore
   */
  //eslint-disable-next-line @typescript-eslint/no-empty-function
  onSeen(_p:V[]) {
  }

  /**
   * @ignore
   */
  abstract onReset():void;
} 
