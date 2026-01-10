import { MapOfSimple } from "./map-of.js";
import type { ISimpleEventEmitter, Listener } from "./types.js";

export class SimpleEventEmitter<Events> implements ISimpleEventEmitter<Events> {
  readonly #listeners = new MapOfSimple<Listener<Events>>();
  #disposed = false;

  dispose(): void {
    if (this.#disposed) return;
    this.clearEventListeners();
  }

  get isDisposed(): boolean {
    return this.#disposed;
  }

  /**
   * Fire event
   * @param type Type of event
   * @param args Arguments for event
   * @returns
   */
  protected fireEvent<K extends keyof Events>(type: K, args: Events[ K ]): void {
    if (this.#disposed) throw new Error(`Disposed`);
    //console.log(`Firing ${ type as string }. Listeners: ${ this.#listeners.size(type as string) }`);
    for (const l of this.#listeners.iterateKey(type as string)) {
      l(args, this);
    }
  }

  /**
   * Adds event listener.
   * 
   * @throws Error if emitter is disposed
   * @typeParam K - Events
   * @param name Event name
   * @param listener Event handler
   */
  addEventListener<K extends keyof Events>(
    name: K,
    listener: (event: Events[ K ], sender: SimpleEventEmitter<Events>) => void
  ): void {
    if (this.#disposed) throw new Error(`Disposed`);
    this.#listeners.addKeyedValues(
      name as string,
      listener as Listener<Events>
    );
  }

  /**
   * Remove event listener
   *
   * @param listener
   */
  removeEventListener<K extends keyof Events>(
    type: K,
    listener: (event: Events[ K ], sender: SimpleEventEmitter<Events>) => void
  ): void {
    if (this.#disposed) return;

    // listener: Listener<Events>): void {
    this.#listeners.deleteKeyValue(
      type as string,
      listener as Listener<Events>
    );
  }

  /**
   * Clear all event listeners
   * @private
   */
  clearEventListeners(): void {
    if (this.#disposed) return;
    this.#listeners.clear();
  }
}