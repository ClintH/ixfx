export type Listener<Events> = (event: unknown, sender: ISimpleEventEmitter<Events>) => void;

export interface ISimpleEventEmitter<Events> {
  addEventListener<K extends keyof Events>(type: K, listener: (event: Events[ K ], sender: ISimpleEventEmitter<Events>) => void): void;
  removeEventListener<K extends keyof Events>(type: K, listener: (event: Events[ K ], sender: ISimpleEventEmitter<Events>) => void): void;
};