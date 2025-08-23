export type MidiCommands = 'noteon' | 'noteoff' | 'pitchbend' | 'cc' | 'poly-at' | 'progchange' | 'at'

export type MidiMessage = {
  command: MidiCommands
  channel: number
  note: number
  velocity: number
}