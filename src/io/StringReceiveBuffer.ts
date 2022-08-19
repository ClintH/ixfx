
/**
 * Receives text
 */
export class StringReceiveBuffer {
  buffer: string = ``;
  stream:WritableStream<string>|undefined;

  constructor(private onData: (data: string) => void, public separator = `\n`) {

  }

  clear() {
    this.buffer = ``;
  }

  writable() {
    if (this.stream === undefined) this.stream = this.createWritable();
    return this.stream;
  }

  private createWritable() {
    //eslint-disable-next-line @typescript-eslint/no-this-alias
    const b = this;
    return new WritableStream<string>({
      write(chunk) {
        b.add(chunk);
      },
      close() {
        b.clear();
      }
    });
  }

  addImpl(str: string):string {
    // Look for separator in new string
    const pos = str.indexOf(this.separator);
    if (pos < 0) {
      // Not found, just add to buffer and return
      this.buffer += str;
      return ``;
    }

    // Found! Trigger callback for existing buffer and part of new string
    const part = str.substring(0, pos);
    try {
      this.onData(this.buffer + part);
      str = str.substring(part.length+this.separator.length);
    } catch (ex) {
      console.warn(ex);
    }
    
    this.buffer = ``;

    return str;
  }

  add(str:string) {
    while (str.length > 0) {
      str = this.addImpl(str);
    }
  }
}