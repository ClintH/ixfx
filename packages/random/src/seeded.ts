/**
 * Reproducible random values using the Merseene Twister algorithm.
 * With the same seed value, it produces the same series of random values.
 * 
 * ```js
 * // Seed with a value of 100
 * const r = mersenneTwister(100);
 * r.float();         // 0..1
 * ```
 * 
 * Integer values can also be produced. First parameter
 * is the maximum value (exclusive), the optional second
 * parameter is the minimum value (inclusive).
 * ```js
 * r.integer(10);     // 0..9
 * r.integer(10, 5);  // 5..9
 * 
 * // Eg random array index:
 * r.integer(someArray.length);
 * ```
 * 
 * Adapted from George MacKerron's implementation. MIT License.
 * https://github.com/jawj/mtwist/
 * @param seed Seed value 0..4294967295. Default: random seed.
 */
export function mersenneTwister(seed?: number | undefined) {
  if (!seed) seed = Math.random() * 4294967295;

  // Initialisation
  let mt = new Array(624);
  mt[ 0 ] = seed >>> 0;
  const n1 = 1812433253;
  for (let mti = 1; mti < 624; mti++) {
    const n2 = mt[ mti - 1 ] ^ (mt[ mti - 1 ] >>> 30);
    // uint32 multiplication, low 16 bits and high 16 bits multiplied separately and reassembled:
    mt[ mti ] = ((((n1 & 0xffff0000) * n2) >>> 0) + (((n1 & 0x0000ffff) * n2) >>> 0) + mti) >>> 0;
  }
  let mti = 624;

  const randomUint32 = () => {
    let y;
    if (mti >= 624) {
      for (let i = 0; i < 227; i++) {
        y = ((mt[ i ] & 0x80000000) | (mt[ i + 1 ] & 0x7fffffff)) >>> 0;
        mt[ i ] = (mt[ i + 397 ] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0)) >>> 0;
      }
      for (let i = 227; i < 623; i++) {
        y = ((mt[ i ] & 0x80000000) | (mt[ i + 1 ] & 0x7fffffff)) >>> 0;
        mt[ i ] = (mt[ i - 227 ] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0)) >>> 0;
      }
      y = ((mt[ 623 ] & 0x80000000) | (mt[ 0 ] & 0x7fffffff)) >>> 0;
      mt[ 623 ] = (mt[ 396 ] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0)) >>> 0;
      mti = 0;
    }
    y = mt[ mti++ ];
    y = (y ^ (y >>> 11)) >>> 0;
    y = (y ^ ((y << 7) & 0x9d2c5680)) >>> 0;
    y = (y ^ ((y << 15) & 0xefc60000)) >>> 0;
    y = (y ^ (y >>> 18)) >>> 0;
    return y;
  }

  const float = () => randomUint32() / 4294967296;// 2^32

  // Max is exclusive
  const integer = (maxExclusive: number, minInclusive: number = 0) => {
    if (maxExclusive < 1) throw new Error("Upper bound must be greater than or equal to 1");
    if (maxExclusive > 4294967296) throw new Error("Upper bound must not be greater than 4294967296");
    if (maxExclusive === 1) return 0;
    let range = maxExclusive - minInclusive;
    const
      bitsNeeded = Math.ceil(Math.log2(range)),
      bitMask = (1 << bitsNeeded) - 1;
    while (true) {
      const int = randomUint32() & bitMask;
      if (int < range) return minInclusive + int;
    }
  }

  return { integer, float };
}