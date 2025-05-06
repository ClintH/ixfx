import { shortGuid } from "@ixfx/random";
import type { AudioOscillatorOptions, BasicAudioOscillator } from "./types.js";

/**
 * Initialise audio with an oscillator source
 * @param oscillatorOptions
 * @returns BasicAudio instance
 */
export function createOscillator(oscillatorOptions: Partial<AudioOscillatorOptions> = {}): BasicAudioOscillator {
  const context = new AudioContext();
  const oscType = oscillatorOptions.type ?? `sawtooth`;
  const oscFreq = oscillatorOptions.frequency ?? 440;
  const id = oscillatorOptions.id ?? shortGuid();

  // Source oscillator
  const source = context.createOscillator();
  source.type = oscType;
  source.frequency.setValueAtTime(oscFreq, context.currentTime);

  // Create stereo panner
  const pan = context.createStereoPanner();

  // Create gain node
  const gain = context.createGain();

  // Create filter
  const filter = context.createBiquadFilter();

  // Patch in
  // Oscillator -> gain -> panner -> speakers
  source.connect(gain);
  gain.connect(pan);
  pan.connect(filter);
  filter.connect(context.destination);

  return {
    pan, gain, filter,
    ctx: context,
    osc: source,
    id
  };
}