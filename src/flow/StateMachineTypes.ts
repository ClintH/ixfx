export type StateEvent = (args: unknown, sender: any) => void;
export type StateHandler = string | StateEvent | null;

export interface State {
  readonly [event: string]: StateHandler;
}

// export interface MachineDescription {
//   readonly [key: string]: string | readonly string[] | null;
// }
