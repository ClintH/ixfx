
export type Kalman1dFilterOptions = {
  /**
   * Process noise
   * @default 1
   */
  r: number
  /**
   * Measurement noise
   * @default 1
   */
  q: number
  /**
   * State vector
   * @default 1
   */
  a: number
  /**
   * Control vector
   * @default 0
   */
  b: number
  /**
   * Measurement vector
   * @default 1
   */
  c: number
}


/**
* KalmanFilter
* 
* author: Wouter Bulten
* see {@link http://github.com/wouterbulten/kalmanjs}
* version Version: 1.0.0-beta
* copyright Copyright 2015-2018 Wouter Bulten
* license MIT License
*/
export class Kalman1dFilter {
  R: number
  Q: number
  A: number
  C: number
  B: number
  cov: number
  x: number

  /**
  * Create 1-dimensional kalman filter
  */
  constructor(options: Partial<Kalman1dFilterOptions> = {}) {

    this.R = options.r ?? 1; // noise power desirable
    this.Q = options.q ?? 1; // noise power estimated

    this.A = options.a ?? 1;
    this.C = options.c ?? 1;
    this.B = options.b ?? 0;
    this.cov = NaN;
    this.x = NaN; // estimated signal without noise
  }

  /**
  * Filter a new value
  * @param  {Number} z Measurement
  * @param  {Number} u Control
  * @return {Number}
  */
  filter(z: number, u = 0) {

    if (isNaN(this.x)) {
      this.x = (1 / this.C) * z;
      this.cov = (1 / this.C) * this.Q * (1 / this.C);
    }
    else {

      // Compute prediction
      const predX = this.predict(u);
      const predCov = this.uncertainty();

      // Kalman gain
      const K = predCov * this.C * (1 / ((this.C * predCov * this.C) + this.Q));

      // Correction
      this.x = predX + K * (z - (this.C * predX));
      this.cov = predCov - (K * this.C * predCov);
    }

    return this.x;
  }

  /**
  * Predict next value
  * @param  {Number} [u] Control
  * @return {Number}
  */
  predict(u = 0) {
    return (this.A * this.x) + (this.B * u);
  }

  /**
  * Return uncertainty of filter
  * @return {Number}
  */
  uncertainty() {
    return ((this.A * this.cov) * this.A) + this.R;
  }

  /**
  * Return the last filtered measurement
  * @return {Number}
  */
  lastMeasurement() {
    return this.x;
  }

  /**
  * Set measurement noise Q
  * @param {Number} noise
  */
  setMeasurementNoise(noise: number) {
    this.Q = noise;
  }

  /**
  * Set the process noise R
  * @param {Number} noise
  */
  setProcessNoise(noise: number) {
    this.R = noise;
  }
}

/**
 * Returns a function that performs 1D Kalman filtering.
 * 
 * ```js
 * const f = kalman1dFilter();
 * f(10); // 10
 * ```
 * 
 * Under the hood creates a {@link Kalman1dFilter} instance and returns its `filter` method.
 * @param options 
 * @returns 
 */
export const kalman1dFilter = (options: Partial<Kalman1dFilterOptions> = {}) => {
  const f = new Kalman1dFilter(options);
  return f.filter.bind(f);
}