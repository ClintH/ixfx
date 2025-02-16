/**
 * Handles utf-8 text encoding/decoding
 */
export class Codec {
  enc = new TextEncoder();
  dec = new TextDecoder(`utf-8`);

  /**
   * Convert string to Uint8Array buffer
   * @param text
   * @returns
   */
  toBuffer(text: string) {
    return this.enc.encode(text);
  }

  /**
   * Returns a string from a provided buffer
   * @param buffer
   * @returns
   */
  fromBuffer(buffer: AllowSharedBufferSource) {
    return this.dec.decode(buffer);
  }
}
