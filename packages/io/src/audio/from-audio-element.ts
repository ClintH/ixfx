import { resolveEl } from "@ixfx/dom";

import { shortGuid } from "@ixfx/random";
import type { BasicAudioElement } from "./types.js";

/**
 * Scans page for <AUDIO> elements and creates playable controllers for them.
 * It uses the element's 'id' attribute as a way of fetching one later.
 * 
 * ```js
 * const ae = new AudioElements();
 * ae.init(); // Initialise
 * 
 * const a = ae.get('kick'); // Get the source that had id 'kick'
 * ```
 */
export class AudioElements {
  #initialised = false
  #sources = new Map<string, BasicAudioElement>();
  filterType: BiquadFilterType = `lowpass`;

  constructor() {}

  init(): void {
    if (this.#initialised) return;
    this.#initialised = true;

    for (const element of document.querySelectorAll(`audio`)) {
      this.#sources.set(element.id, createFromAudioElement(element, this.filterType));
    }
  }

  /**
   * Gets a BasicAudio instance by key
   * @param key 
   * @returns BasicAudio instance, or undefined
   */
  get(key: string): BasicAudioElement | undefined {
    this.init();
    return this.#sources.get(key);
  }
}

/**
 * Create a BasicAudioElement instance from an <AUDIO> tag in the HTML document.
 * 
 * See {@link AudioElements} to automatically create sources from all <AUDIO> elements.
 * @param audioElementOrQuery Element or query (eg '#some-id') 
 * @param filterType Filter type. Defaults to 'lowpass'
 * @returns 
 */
export function createFromAudioElement(audioElementOrQuery: HTMLMediaElement | string, filterType: BiquadFilterType = `lowpass`): BasicAudioElement {
  const el = resolveEl(audioElementOrQuery);

  const context = new AudioContext();

  // Source from AUDIO element
  const source = context.createMediaElementSource(el);

  // Create stereo panner
  const pan = context.createStereoPanner();

  // Create gain node
  const gain = context.createGain();

  // Create filter
  const filter = context.createBiquadFilter();
  filter.type = filterType;

  // Patch in
  // AUDIO elem -> gain -> panner -> speakers
  source.connect(gain);
  gain.connect(pan);
  pan.connect(filter);
  filter.connect(context.destination);

  return {
    pan, gain, filter,
    id: el.id,
    ctx: context,
    el
  };
}