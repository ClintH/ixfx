export class Codec {
  enc = new TextEncoder();
  dec = new TextDecoder(`utf-8`);

  toBuffer(str: string) {
    return this.enc.encode(str);
  }

  fromBuffer(buffer: ArrayBuffer) {
    return this.dec.decode(buffer);
  }
}