export class SlidingWindow {
  data: number[] = [];
  index = 0;
  size: number;
  length = 0;
  wrapped = false;

  constructor(size = 5) {
    this.size = size;
    this.clear(size);
  }

  clear(size?: number) {
    if (size === undefined) size = this.size;
    this.size = size;
    this.index = 0;
    this.length = 0;
    this.wrapped = false;
    for (let i = 0; i < size; i++) {
      this.data[i] = NaN;
    }
  }

  /**
   * Add data to the window
   *
   * @param {number} v Value to add
   * @memberof SlidingWindow
   */
  push(v: number) {
    let idx = this.index;
    this.data[idx++] = v;
    if (idx === this.size) {
      this.wrapped = true;
      idx = 0;
    } else this.length++;
    this.index = idx;
  }

  toArray(): number[] {
    if (!this.wrapped) {
      return this.data.slice(0, this.length - 1);
    } else {
      return this.data.slice();
    }
  }

  /**
   * Calculates the current average
   *
   * @returns
   * @memberof SlidingWindow
   */
  average(): number {
    let total = 0;
    let samples = 0;
    for (let i = 0; i < this.size; i++) {
      if (isNaN(this.data[i])) continue;
      total += this.data[i];
      samples++;
    }
    return total / samples;
  }

  max(): number {
    let max = Number.MIN_SAFE_INTEGER;
    for (let i = 0; i < this.size; i++) {
      if (isNaN(this.data[i])) continue;
      max = Math.max(this.data[i], max);
    }
    return max;
  }

  min(): number {
    let min = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < this.size; i++) {
      if (isNaN(this.data[i])) continue;
      min = Math.min(this.data[i], min);
    }
    return min;
  }

  getMinMaxAvg(): {min: number, max: number, avg: number} {
    let min = Number.MAX_SAFE_INTEGER;
    let total = 0;
    let samples = 0;
    let max = Number.MIN_SAFE_INTEGER;
    for (let i = 0; i < this.size; i++) {
      if (isNaN(this.data[i])) continue;
      min = Math.min(this.data[i], min);
      max = Math.max(this.data[i], max);
      total += this.data[i];
      samples++;
    }
    return {min: min, max: max, avg: total / samples};
  }
}