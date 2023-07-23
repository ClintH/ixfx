/**
 * Handles utf-8 text encoding/decoding
 */
export class Codec {
  enc = new TextEncoder();
  dec = new TextDecoder(`utf-8`);

  /**
   * Convert string to Uint8Array buffer
   * @param str
   * @returns
   */
  toBuffer(str: string) {
    return this.enc.encode(str);
  }

  /**
   * Returns a string from a provided buffer
   * @param buffer
   * @returns
   */
  fromBuffer(buffer: ArrayBuffer) {
    return this.dec.decode(buffer);
  }
}
