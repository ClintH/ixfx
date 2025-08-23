import type { MidiCommands, MidiMessage } from "./types.js";


/**
 * Sends a note on and note off
 * @param port 
 * @param channel 
 * @param note 
 * @param velocity 
 * @param duration 
 * @param delay 
 */
export const sendNote = (port: MIDIOutput, channel: number, note: number, velocity: number, duration = 200, delay?: DOMHighResTimeStamp) => {
  const noteOn: MidiMessage = {
    channel, note, velocity, command: `noteon`
  }
  const noteOff: MidiMessage = {
    channel, note, velocity: 0, command: `noteoff`
  }
  port.send(pack(noteOn), delay);
  port.send(pack(noteOff), window.performance.now() + duration)
}

/**
 * Parses MIDI data from an array into a MidiMessage
 * 
 * ```js
 * function onMidiMessage(event: MIDIMessageEvent) {
 *  const msg = unpack(event.data);
 *  // { command, channel, note, velocity }
 * }
 * 
 * // Where 'input' is a MIDIInput
 * input.addEventListener(`midimessage`, onMidiMessage);
 * ```
 * @param data 
 * @returns 
 */
export const unpack = (data: Uint8Array): MidiMessage => {
  let command: MidiCommands | undefined;

  const first = data[ 0 ];
  const second = data[ 1 ];
  const third = data[ 2 ];

  let channel = 0;
  if (first >= 144 && first <= 159) {
    channel = first - 143;
    command = third === 0 ? `noteoff` : `noteon`;
  } else if (first >= 128 && first <= 143) {
    channel = first - 127;
    command = `noteoff`;
  } else if (first >= 160 && first <= 175) {
    channel = first - 159;
    command = `poly-at`;
  } else if (first >= 176 && first <= 191) {
    channel = first - 175;
    command = `cc`;
  } else if (first >= 192 && first <= 207) {
    channel = first - 191;
    command = `progchange`;
  } else if (first >= 208 && first <= 223) {
    channel = first - 207;
    command = `at`;
  } else if (first >= 224 && first <= 239) {
    channel = first - 223;
    command = `pitchbend`;
  }

  if (command === undefined) {
    throw new Error(`Unknown command: '${ command }'`);
  } else {
    return { command, note: second, velocity: third, channel };
  }
};

/**
 * Packs a MidiMessage into an array for sending to a MIDIOutput.
 * 
 * ```js
 * const msg: Midi.MidiMessage = {
 *  command: `cc`,
 *  channel: 1,
 *  velocity: 50,
 *  note: 40
 * }
 * 
 * // Where 'output' is a MIDIOutput
 * output.send(pack(msg));
 * ```
 * @param message 
 * @returns 
 */
export const pack = (message: MidiMessage): Uint8Array => {
  const data = new Uint8Array(3);
  data[ 1 ] = message.note;
  data[ 2 ] = message.velocity;
  switch (message.command) {
    case `cc`:
      data[ 0 ] = message.channel + 175;
      break;
    case `noteon`:
      data[ 0 ] = message.channel + 143;
      break;
    case `noteoff`:
      data[ 0 ] = message.channel + 127;
      break;
    case `pitchbend`:
      data[ 0 ] = message.channel + 223;
      break;
    case `poly-at`:
      data[ 0 ] = message.channel + 159;
      break;
    case `progchange`:
      data[ 0 ] = message.channel + 191;
      break;
    case `at`:
      data[ 0 ] = message.channel + 207;
      break;
    default:
      throw new Error(`Command not supported '${ message.command }'`);
  }
  return data;
}