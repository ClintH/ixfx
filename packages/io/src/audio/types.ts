
export type AudioOscillatorOptions = {
  type: OscillatorType
  frequency: number
  id: string
}
export type BasicAudio = {
  ctx: AudioContext
  pan: StereoPannerNode
  gain: GainNode
  filter: BiquadFilterNode
  id: string
}

export type BasicAudioElement = BasicAudio & {
  el: HTMLMediaElement
}

export type BasicAudioOscillator = BasicAudio & {
  osc: OscillatorNode
}