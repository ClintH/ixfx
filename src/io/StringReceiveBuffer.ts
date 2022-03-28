export class StringReceiveBuffer {
  buffer: string = ``;

  constructor(private onData: (data: string) => void, private separator = `\n`) {

  }

  add(str: string) {
    if (str.length === 0) return;

    // Look for separator
    const pos = str.indexOf(this.separator);
    if (pos < 0) {
      // Not found, just add to buffer and return
      this.buffer += str;
      return;
    }

    // Found! Trigger callback for existing buffer and part of new string
    const part = str.substring(0, pos);
    this.onData(this.buffer + part);

    // Clear buffer
    this.buffer = ``;

    // If there are characters let, add remainer
    if (pos < str.length) return;
    this.add(str.substring(pos + 1));

  }
}