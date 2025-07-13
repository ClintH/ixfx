export class CancelError extends Error {
  constructor(message: any) {
    super(message);
    this.name = `CancelError`;
  }
}