export type LogSet = {
  readonly log: MessageLogger;
  readonly warn: MessageLogger;
  readonly error: MessageLogger;
}
export type MessageLogger = (message: LogMessage | string) => void;
export type LogKind = `info` | `debug` | `error` | `warn`;
export type LogMessage = {
  readonly kind?: LogKind;
  readonly msg: any;
  readonly category?: string;
}