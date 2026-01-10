import { scale } from "@ixfx/numbers";
import type { MidiCommands, MidiMessage } from "./types.js";
import { SimpleEventEmitter } from "@ixfx/events";
import { pack, sendNote } from "./midi-fns.js";

export type ControlEvents = {
  change: { velocity: number, velocityScaled: number, control: Control }
}


export class Feedback {
  channel = 0
  cc = -1
  note = -1;
  output?: MIDIOutput;
  portName?: string;

  constructor(options: Partial<{ channel: number, cc: number, note: number, output: MIDIOutput, portName: string }> = {}) {
    this.channel = options.channel ?? -1;
    this.cc = options.cc ?? -1;
    this.note = options.note ?? -1;
    this.output = options.output;
    this.portName = options.portName;
  }

  setOutputPort(port: MIDIPort): boolean {
    if (port.type === `input`) return false;
    if (this.portName !== undefined) {
      if (port.name !== port.name) {
        return false;
      }
    }
    this.output = port as MIDIOutput;
    return true;
  }

  sendRaw(value: number): boolean {
    if (!this.output) return false;
    if (this.channel < 0) return false;
    if (this.cc < 0 && this.note < 0) return false;

    let message: MidiMessage | undefined;
    if (this.cc >= 0) {
      message = {
        channel: this.channel,
        command: `cc`,
        note: this.cc,
        velocity: value
      }
      console.log(message);
      this.output.send(pack(message));
      return true;
    }
    console.log(`sendNote: ch: ${ this.channel } note: ${ this.note } vel: ${ value }`);
    sendNote(this.output, this.channel, this.note, value, 200);
    return true;
  }
}

export class Control extends SimpleEventEmitter<ControlEvents> {
  static controlCount = 0;

  inputChannel = 1;
  inputCommand?: MidiCommands = `cc`;
  inputNote = -1;
  inputVelocityScale = [ 0, 127 ] as const

  feedbackChannel = 1;
  feedbackCommand?: MidiCommands = `cc`;
  feedbackNote = -1;
  feedbackVelocity = 1;

  name = `Control-${ Control.controlCount++ }`;

  lastMessage?: MidiMessage;

  onInputMessage(message: MidiMessage): boolean {
    // Filter out messages
    if (this.inputChannel >= 0 && message.channel !== this.inputChannel) return false;
    if (this.inputNote >= 0 && message.note !== this.inputNote) return false;
    if (this.inputCommand !== undefined && message.command !== this.inputCommand) return false;

    this.lastMessage = message;
    //this.#log(`Received: ch: ${ message.channel } cmd: ${ message.command } n: ${ message.note } v: ${ message.velocity }`);
    this.fireEvent(`change`, { velocity: message.velocity, velocityScaled: this.#scaleVelocity(message.velocity), control: this });
    return true;
  }

  // #log(message: string) {
  //   console.log(`${ this.name } ${ message }`);
  // }

  #scaleVelocity(v: number) {
    return scale(v, this.inputVelocityScale[ 0 ], this.inputVelocityScale[ 1 ]);
  }

  get scaledVelocity(): number {
    if (this.lastMessage) {
      return this.#scaleVelocity(this.lastMessage.velocity);
    }
    return Number.NaN;
  }
}