export type Listener<Events> = (ev: unknown, sender: ISimpleEventEmitter<Events>) => void;

export interface ISimpleEventEmitter<Events> {
  addEventListener<K extends keyof Events>(type: K, listener: (ev: Events[K], sender: ISimpleEventEmitter<Events>) => void): void;
  removeEventListener<K extends keyof Events>(type: K, listener: (ev: Events[K], sender: ISimpleEventEmitter<Events>) => void): void;
};