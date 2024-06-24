import AudioVisualiser from './AudioVisualiser.js';
import { throwNumberTest, throwIntegerTest, isPowerOfTwo } from '../util/GuardNumbers.js';
import { max, maxFast } from '../numbers/NumericArrays.js';

/**
 * Options for audio processing
 *
 * fftSize: Must be a power of 2, from 32 - 32768. Higher number means
 * more precision and higher CPU overhead
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
 *
 * smoothingTimeConstant: Range from 0-1, default is 0.8.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/smoothingTimeConstant
 *
 * debug: If true, additonal console logging will happen
 */
export type Opts = {
  readonly showVis?: boolean;
  /**
   * FFT size. Must be a power of 2, from 32 - 32768. Higher number means
   * more precision and higher CPU overhead
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
   */
  readonly fftSize?: number;
  /**
   * Range from 0-1, default is 0.8
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/smoothingTimeConstant
   */
  readonly smoothingTimeConstant?: number;
  readonly debug?: boolean;
};

export type DataAnalyser = (
  node: AnalyserNode,
  analyser: AudioAnalyser
) => void;

/**
 * Basic audio analyser. Returns back waveform and FFT analysis. Use {@link peakLevel} if you want sound level, or {@link freq} if you just want FFT results.
 *
 * ```js
 * const onData = (freq, wave, analyser) => {
 *  // Demo: Get FFT results just for 100Hz-1KHz.
 *  const freqSlice = analyser.sliceByFrequency(100,1000,freq);
 *
 *  // Demo: Get FFT value for a particular frequency (1KHz)
 *  const amt = freq[analyser.getIndexForFrequency(1000)];
 * }
 * basic(onData, {fftSize: 512});
 * ```
 *
 * An `Analyser` instance is returned and can be controlled:
 * ```js
 * const analyser = basic(onData);
 * analyser.paused = true;
 * ```
 *
 * Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
 *
 * @param onData Handler for data
 * @param opts Options
 * @returns Analyser instance
 */
export const basic = (
  onData: (
    freq: Float32Array,
    wave: Float32Array,
    analyser: AudioAnalyser
  ) => void,
  opts: Opts = {}
): AudioAnalyser =>
  new AudioAnalyser((node, analyser) => {
    // Get frequency and amplitude data
    const freq = new Float32Array(node.frequencyBinCount);
    const wave = new Float32Array(node.fftSize);

    // Load arrays with data
    node.getFloatFrequencyData(freq);
    node.getFloatTimeDomainData(wave);

    // Send back
    onData(freq, wave, analyser);
  }, opts);

/**
 * Basic audio analyser. Returns FFT analysis. Use {@link peakLevel} if you want the sound level, or {@link basic} if you also want the waveform.
 *
 * ```js
 * const onData = (freq, analyser) => {
 *  // Demo: Print out each sound frequency (Hz) and amount of energy in that band
 *  for (let i=0;i<freq.length;i++) {
 *    const f = analyser.getFrequencyAtIndex(0);
 *    console.log(`${i}. frequency: ${f} amount: ${freq[i]}`);
 *  }
 * }
 * freq(onData, {fftSize:512});
 * ```
 *
 * Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
 *
 * @param onData
 * @param opts
 * @returns
 */
export const freq = (
  onData: (freq: Float32Array, analyser: AudioAnalyser) => void,
  opts: Opts = {}
): AudioAnalyser =>
  new AudioAnalyser((node, analyser) => {
    const freq = new Float32Array(node.frequencyBinCount);
    node.getFloatFrequencyData(freq);
    onData(freq, analyser);
  }, opts);

/**
 * Basic audio analyser which reports the peak sound level.
 *
 * ```js
 * peakLevel(level => {
 *  console.log(level);
 * });
 * ```
 *
 * Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
 * @param onData
 * @param opts
 * @returns
 */
export const peakLevel = (
  onData: (level: number, analyser: AudioAnalyser) => void,
  opts: Opts = {}
): AudioAnalyser =>
  new AudioAnalyser((node, analyser) => {
    const wave = new Float32Array(node.fftSize);
    node.getFloatTimeDomainData(wave);
    onData(maxFast(wave), analyser);
  }, opts);

/**
 * Helper for doing audio analysis. It takes case of connecting the audio stream, running in a loop and pause capability.
 *
 * Provide a function which works with an [AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode), and does something with the result.
 * ```js
 * const myAnalysis = (node, analyser) => {
 *  const freq = new Float32Array(node.frequencyBinCount);
 *  node.getFloatFrequencyData(freq);
 *  // Do something with frequency data...
 * }
 * const a = new Analyser(myAnalysis);
 * ```
 *
 * Two helper functions provide ready-to-use Analysers:
 * * {@link peakLevel} peak decibel reading
 * * {@link freq} FFT results
 * * {@link basic} FFT results and waveform
 *
 * Note: Browers won't allow microphone access unless the call has come from a user-interaction, eg pointerup event handler.
 *
 */
export class AudioAnalyser {
  showVis: boolean;
  fftSize: number;
  smoothingTimeConstant: number;
  #isPaused = false;
  debug: boolean;
  #initInProgress = false;

  visualiser: AudioVisualiser | undefined;
  audioCtx: AudioContext | undefined;
  analyserNode: AnalyserNode | undefined;

  analyse: DataAnalyser;

  constructor(analyse: DataAnalyser, opts: Opts = {}) {
    this.showVis = opts.showVis ?? false;
    this.fftSize = opts.fftSize ?? 1024;
    this.debug = opts.debug ?? false;
    this.smoothingTimeConstant = opts.smoothingTimeConstant ?? 0.8;

    throwIntegerTest(this.fftSize, `positive`, `opts.fftSize`);
    throwNumberTest(
      this.smoothingTimeConstant,
      `percentage`,
      `opts.smoothingTimeConstant`
    );

    if (!isPowerOfTwo(this.fftSize)) {
      throw new Error(
        `fftSize must be a power of two from 32 to 32768 (${ this.fftSize })`
      );
    }
    if (this.fftSize < 32) throw new Error(`fftSize must be at least 32`);
    if (this.fftSize > 32_768) { throw new Error(`fftSize must be no greater than 32768`); }

    this.analyse = analyse;
    this.paused = false;

    this.init();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const visualiserEl = document.querySelector(`#audio-visualiser`) as HTMLElement | null;
    if (visualiserEl) {
      const visualiser = new AudioVisualiser(visualiserEl, this);
      visualiser.setExpanded(this.showVis);
      this.visualiser = visualiser;
    }
  }

  init() {
    if (this.#initInProgress) {
      if (this.debug) console.debug(`Init already in progress`);
      return;
    }
    this.#initInProgress = true;

    // Initalise microphone
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.onMicSuccess(stream);
      })
      .catch((error: unknown) => {
        this.#initInProgress = false;
        console.error(error);
      });
  }

  get paused(): boolean {
    return this.#isPaused;
  }

  set paused(v: boolean) {
    if (v === this.#isPaused) return;
    this.#isPaused = v;
    if (v) {
      if (this.debug) console.log(`Paused`);
    } else {
      if (this.debug) console.log(`Unpaused`);
      window.requestAnimationFrame(this.analyseLoop.bind(this));

    }
  }

  private setup(context: AudioContext, stream: MediaStream) {
    const analyser = context.createAnalyser();

    // fftSize must be a power of 2. Higher values slower, more detailed
    // Range is 32-32768
    analyser.fftSize = this.fftSize;

    // smoothingTimeConstant ranges from 0.0 to 1.0
    // 0 = no averaging. Fast response, jittery
    // 1 = maximum averaging. Slow response, smooth
    analyser.smoothingTimeConstant = this.smoothingTimeConstant;

    // Microphone -> analyser
    const micSource = context.createMediaStreamSource(stream);
    micSource.connect(analyser);
    return analyser;
  }

  // Microphone successfully initalised, now have access to audio data
  private onMicSuccess(stream: MediaStream) {
    try {
      const context = new AudioContext();

      context.addEventListener(`statechange`, () => {
        if (this.debug) console.log(`Audio context state: ${ context.state }`);
      });

      this.audioCtx = context;
      this.analyserNode = this.setup(context, stream);

      // Start loop
      window.requestAnimationFrame(this.analyseLoop.bind(this));
    } catch (error) {
      this.#initInProgress = false;
      console.error(error);
    }
  }

  private analyseLoop() {
    if (this.paused) {
      if (this.debug) console.log(`Paused`);
      return;
    }

    const a = this.analyserNode;
    if (a === undefined) {
      console.warn(`Analyser undefined`);
      return;
    }

    try {
      // Perform analysis
      this.analyse(a, this);
    } catch (error) {
      console.error(error);
    }

    // Run again
    window.requestAnimationFrame(this.analyseLoop.bind(this));
  }

  // visualise(wave, freq) {
  //   if (!this.visualiser) return;
  //   this.visualiser.renderWave(wave, true);
  //   this.visualiser.renderFreq(freq);
  // }

  /**
   * Returns the maximum FFT value within the given frequency range
   */
  getFrequencyRangeMax(
    lowFreq: number,
    highFreq: number,
    freqData: ReadonlyArray<number>
  ): number {
    const samples = this.sliceByFrequency(lowFreq, highFreq, freqData);
    return max(samples);
  }

  /**
   * Returns a sub-sampling of frequency analysis data that falls between
   * `lowFreq` and `highFreq`.
   * @param lowFreq Low frequency
   * @param highFreq High frequency
   * @param freqData Full-spectrum frequency data
   * @returns Sub-sampling of analysis
   */
  sliceByFrequency(
    lowFreq: number,
    highFreq: number,
    freqData: ReadonlyArray<number>
  ) {
    const lowIndex = this.getIndexForFrequency(lowFreq);
    const highIndex = this.getIndexForFrequency(highFreq);

    // Grab a 'slice' of the array between these indexes
    const samples = freqData.slice(lowIndex, highIndex);
    return samples;
  }

  /**
   * Returns the starting frequency for a given binned frequency index.
   * @param index Array index
   * @returns Sound frequency
   */
  getFrequencyAtIndex(index: number): number {
    const a = this.analyserNode;
    const ctx = this.audioCtx;
    if (a === undefined) throw new Error(`Analyser not available`);
    if (ctx === undefined) throw new Error(`Audio context not available`);

    throwIntegerTest(index, `positive`, `index`);
    if (index > a.frequencyBinCount) {
      throw new Error(
        `Index ${ index } exceeds frequency bin count ${ a.frequencyBinCount }`
      );
    }

    return (index * ctx.sampleRate) / (a.frequencyBinCount * 2);
  }

  /**
   * Returns a binned array index for a given frequency
   * @param freq Sound frequency
   * @returns Array index into frequency bins
   */
  getIndexForFrequency(freq: number): number {
    const a = this.analyserNode;
    if (a === undefined) throw new Error(`Analyser not available`);

    const nyquist = a.context.sampleRate / 2;
    const index = Math.round((freq / nyquist) * a.frequencyBinCount);
    if (index < 0) return 0;
    if (index >= a.frequencyBinCount) return a.frequencyBinCount - 1;
    return index;
  }
}
