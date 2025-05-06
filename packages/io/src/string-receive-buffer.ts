/**
 * Receives text
 */
export class StringReceiveBuffer {
  buffer = ``;
  stream: WritableStream<string> | undefined;

  constructor(
    private onData: (data: string) => void,
    public separator = `\n`
  ) {}

  async close() {
    const s = this.stream;
    if (!s) return;
    await s.abort();

    await s.close();
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
      },
    });
  }

  addImpl(string_: string): string {
    // Look for separator in new string
    const pos = string_.indexOf(this.separator);
    if (pos < 0) {
      // Not found, just add to buffer and return
      this.buffer += string_;
      return ``;
    }

    // Found! Trigger callback for existing buffer and part of new string
    const part = string_.substring(0, pos);
    try {
      this.onData(this.buffer + part);
      string_ = string_.substring(part.length + this.separator.length);
    } catch (ex) {
      console.warn(ex);
    }

    this.buffer = ``;

    return string_;
  }

  add(string_: string) {
    while (string_.length > 0) {
      string_ = this.addImpl(string_);
    }
  }
}
