import { SimpleEventEmitter } from "@ixfx/events";
import { pack, sendNote, unpack } from "./midi-fns.js";
import type { MidiMessage } from "./types.js";
import { clamp } from "@ixfx/numbers";

/**
 * Events fired by a {@link MidiFighter}} instance
 */
export type MidiFighterEvents = {
  /**
   * Virtual bank has changed
   */
  bankChange: { prev: number, current: number, mf: MidiFighter, implicit: boolean }
  /**
   * A side button has been pressed
   */
  sideButton: { position: `top` | `bottom`, side: `left` | `right`, bank: number, mf: MidiFighter }
  /**
   * An encoder has been pressed
   */
  switch: { previous: number, encoder: MidiFighterEncoder, value: number }
  /**
   * An encoder has been changed
   */
  encoder: { previous: number, encoder: MidiFighterEncoder, value: number }
  /**
   * Connection state changed
   */
  state: { previous: MidiFighterState, state: MidiFighterState, mf: MidiFighter }
}

/**
 * Events of a {@link MidiFighterEncoder}
 */
export type MidiFighterEncoderEvents = {
  switch: { previous: number, encoder: MidiFighterEncoder, value: number }
  encoder: { previous: number, encoder: MidiFighterEncoder, value: number }
}

/**
 * States for a {@link MidiFighter} instance
 */
export type MidiFighterState = `ready` | `disconnected`;

/**
 * Connects to a DJ Tech Tools Midi Fighter controller. 
 * 
 * Use the 'state' event and wait for state to be 'ready'.
 * 
 * ```js
 * const mf = new MidiFighter();
 * mf.addEventListener(`state`, event => {
 *  if (event.state === `ready`) {
 *    // Can work with device now
 *    mf.bank = 1;
 *  }
 * });
 * mf.addEventListener(`encoder`, event => {
 *  // Do something with encoder value
 * });
 * mf.setPort(someMidiInputPort);
 * mf.setPort(someMidiOutputPort);
 * ```
 * Assumes default settings are loaded on the controller
 * 
 * Supports
 * * Listening for encoder moves and button presses
 * * Changing colour pip below each encoder
 * * Setting LED bar for each encoder
 * * Changing banks, or detecting when the user has done so via the physical buttons
 * 
 * Events:
 * * bankChange: Current bank has changed
 * * sideButton: Side button pressed
 * * switch: Encoder has been pressed
 * * encoder: Encoder has been moved
 * * state: Midi Fighter has both input/output ports or not.
 */
export class MidiFighter extends SimpleEventEmitter<MidiFighterEvents> {
  readonly encoders: MidiFighterEncoder[] = [];
  #currentBank = -1;
  #state: MidiFighterState = `disconnected`;
  #inputPort?: MIDIInput;
  #outputPort?: MIDIOutput;

  /**
   * If true, messages sent to Midi Fighter are printed to console
   */
  logOutgoing = false;

  /**
   * Channel bank change events are received on
   */
  bankChangeChannel = 4;
  /**
   * Channel side button press events are received on
   */
  sideButtonChannel = 4;

  constructor() {
    super();
    for (let bank = 1; bank < 5; bank++) {
      for (let encoder = 1; encoder < 17; encoder++) {
        const enc = new MidiFighterEncoder(this, { bank, encoder });
        this.encoders.push(enc);
        enc.addEventListener(`encoder`, (event) => {
          this.fireEvent(`encoder`, event);
        });
        enc.addEventListener(`switch`, (event) => {
          this.fireEvent(`switch`, event);

        });
      }
    }
  }

  /**
   * Our input/output port has changed state
   * @param event 
   * @returns 
   */
  #onPortState = (event: MIDIConnectionEvent) => {
    const port = event.port;
    if (!port) return;
    if (port === this.#outputPort && (port.state === `disconnected` || port.connection === `closed`)) {
      this.#outputPortUnbind();
    }
    if (port === this.#inputPort && (port.state === `disconnected` || port.connection === `closed`)) {
      this.#inputPortUnbind();
    }
    if (this.#outputPort !== undefined && this.#inputPort !== undefined) {
      this.#setState(`ready`);
    } else {
      this.#setState(`disconnected`);
    }
  }

  /**
   * Unsubscribe from events of current input port, if we have one
   */
  #inputPortUnbind() {
    const ip = this.#inputPort;
    if (ip !== undefined) {
      ip.removeEventListener(`statechange`, this.#onPortState);
      ip.removeEventListener(`midimessage`, this.#onMessage);
    }
    this.#inputPort = undefined;
  }

  /**
   * Unsubcribe from events of current output port, if we have one
   */
  #outputPortUnbind() {
    const op = this.#outputPort;
    if (op !== undefined) {
      op.removeEventListener(`statechange`, this.#onPortState);
    }
    this.#outputPort = undefined;
  }

  /**
   * Sets a port for this instance to use.
   * This will need to be called separately for the input and output ports
   * @param port 
   */
  setPort(port: MIDIPort) {
    if (port.name === `Midi Fighter Twister`) {
      if (port.type === `output`) {
        this.#outputPortUnbind();
        this.#outputPort = port as MIDIOutput;
        if (this.#outputPort !== undefined) {
          this.#outputPort.addEventListener(`statechange`, this.#onPortState);

        }
      } else if (port.type === `input`) {
        this.#inputPortUnbind();
        this.#inputPort = port as MIDIInput;
        if (port !== undefined) {
          this.#inputPort.addEventListener(`midimessage`, this.#onMessage);
          this.#inputPort.addEventListener(`statechange`, this.#onPortState);
        }
      }
    }
    if (this.#outputPort !== undefined && this.#inputPort !== undefined) {
      this.#setState(`ready`);
    }
  }

  #setState(state: MidiFighterState) {
    const previous = this.#state;
    if (previous === state) return;
    this.#state = state;
    this.fireEvent(`state`, { previous, state, mf: this });
  }

  #onMessage = (event: MIDIMessageEvent) => {
    const data = event.data;
    if (!data) return;
    const message = unpack(data);
    if (message.channel === this.bankChangeChannel) {
      if (message.command === `cc` && message.note < 4) {
        this.#onBankChange(message.note + 1, false);
        return;
      }
    }

    if (message.channel === this.sideButtonChannel && message.command == `cc`) {
      let buttonBank = -1;
      let position: `top` | `bottom` | undefined;
      let side: `left` | `right` | undefined;

      if (message.note === 8) {
        buttonBank = 1;
        position = `top`;
        side = `left`;
      } else if (message.note === 10) {
        buttonBank = 1;
        side = `left`;
        position = `bottom`;
      } else if (message.note === 11) {
        buttonBank = 1;
        side = `right`;
        position = `top`;
      } else if (message.note === 13) {
        buttonBank = 1;
        side = `right`;
        position = `bottom`;
      } else if (message.note === 14) {
        buttonBank = 2;
        side = `left`;
        position = `top`
      } else if (message.note === 16) {
        buttonBank = 2;
        side = `left`;
        position = `bottom`
      } else if (message.note === 17) {
        buttonBank = 2;
        side = `right`;
        position = `top`
      } else if (message.note === 19) {
        buttonBank = 2;
        side = `right`;
        position = `bottom`;
      } else if (message.note === 20) {
        buttonBank = 3;
        position = `top`
        side = `left`
      } else if (message.note === 22) {
        buttonBank = 3;
        position = `bottom`;
        side = `left`;
      } else if (message.note === 23) {
        buttonBank = 3;
        position = `top`;
        side = `right`;
      } else if (message.note == 25) {
        buttonBank = 3;
        position = `bottom`;
        side = `right`;
      } else if (message.note == 26) {
        buttonBank = 4;
        position = `top`;
        side = `left`;
      } else if (message.note == 28) {
        buttonBank = 4;
        position = `bottom`;
        side = `left`;
      } else if (message.note == 29) {
        buttonBank = 4;
        position = `top`;
        side = `right`;
      } else if (message.note == 31) {
        buttonBank = 4;
        position = `bottom`;
        side = `right`;
      }
      if (position !== undefined && side !== undefined) {
        if (buttonBank !== this.#currentBank) this.#onBankChange(buttonBank, true);
        this.fireEvent(`sideButton`, { bank: buttonBank, position, side, mf: this });
        return;
      }
    }

    for (const enc of this.encoders) {
      if (enc.inputEncoderChannel === message.channel && enc.inputEncoderNoteOrCc === message.note) {
        enc.onValueSet(message.velocity);
        return;
      }
      if (enc.inputSwitchChannel === message.channel && enc.inputSwitchNoteOrCc === message.note) {
        enc.onSwitchSet(message.velocity);
        return;
      }
    }

    //console.log(`MF ch: ${ message.channel } type: ${ message.command } note: ${ message.note } velo: ${ message.velocity }`);

  }

  /**
   * When bank has changed
   * @param bank 
   * @param implicit 
   */
  #onBankChange(bank: number, implicit: boolean) {
    const previousBank = this.#currentBank;
    this.#currentBank = bank;
    if (previousBank !== bank) {
      this.fireEvent(`bankChange`, { prev: previousBank, current: this.#currentBank, mf: this, implicit });
    }
  }

  /**
   * Sets the current bank (1..4)
   * 
   * Triggers `bankChange` event.
   */
  set bank(bank: number) {
    if (bank < 1 || bank > 4) throw new Error(`Bank must be 1-4`);
    if (!this.#outputPort) return;
    sendNote(this.#outputPort, this.bankChangeChannel, bank - 1, 127, 100);
    this.#onBankChange(bank, false);
  }

  /**
   * Gets the current bank number (1-4)
   */
  get bank() {
    return this.#currentBank;
  }

  /**
   * Yields all encooders within the specified bank number.
   * If no bank number is given, current bank is used
   * @param bank 
   */
  *getBank(bank?: number) {
    if (typeof bank === `undefined`) bank = this.#currentBank;
    if (bank < 1 || bank > 4) throw new Error(`Bank out of range, expected 1-4`);
    for (const enc of this.encoders) {
      if (enc.bank === bank) yield enc;
    }
  }

  /**
   * Gets an encoder by its index and bank. If no bank is specified,
   * the current is used.
   * 
   * ```js
   * mf.getEncoder(4);    // Get encoder #4 on current bank
   * mf.getEncoder(4, 2); // Get encoder #4 from bank #2
   * ```
   * @param encoder Encoder number (1..16)
   * @param bank Bank number (1..4)
   * @returns Encoder
   */
  getEncoder(encoder: number, bank?: number) {
    if (typeof bank === `undefined`) bank = this.#currentBank;
    if (bank < 1 || bank > 4) throw new Error(`Bank out of range, expected 1-4. Got: ${ bank }`);
    if (encoder < 1 || encoder > 16) throw new Error(`Encoder out of range, expected 1-16`);

    return this.encoders.find(enc => enc.bank === bank && enc.encoder === encoder);
  }

  /**
   * Sends a message to the output port associated with this instance.
   * If there's no output port, message is dropped and _false_ returned.
   * @param message 
   */
  send(message: MidiMessage): boolean {
    if (this.#outputPort) {
      if (this.logOutgoing) {
        console.log(`MF send: ${ JSON.stringify(message) }`);
      }
      this.#outputPort.send(pack(message))
      return true;
    }
    return false;
  }

  /**
   * Gets the current output port
   */
  get outputPort() {
    return this.#outputPort;
  }

  /**
   * Gets the current input port
   */
  get inputPort() {
    return this.#inputPort;
  }

  /**
 * Returns the current state
 */
  get state() {
    return this.#state;
  }
}

/**
 * Represents a single encoder.
 */
export class MidiFighterEncoder extends SimpleEventEmitter<MidiFighterEncoderEvents> {
  /**
   * Bank (1..4) of encoder
   */
  readonly bank: number;
  /**
   * Encoder index (1..16)
   */
  readonly encoder: number;

  /**
   * Note/CC for received encoder values
   */
  inputEncoderNoteOrCc: number;
  /**
   * Midi channel for received encoder values
   */
  inputEncoderChannel: number;

  /**
   * Midi channel for received switch values
   */
  inputSwitchChannel: number;
  /**
   * Note/CC for received switch values
   */
  inputSwitchNoteOrCc: number;

  /**
   * Channel to change LED effect (eg strobe)
   */
  ledEffectChannel = 3
  /**
   * Channel to change LED colour
   */
  ledColourChannel = 2;
  /**
   * Channel to change LED ring value
   */
  ledRingChannel = 1;

  /**
   * Note for this encoder.
   */
  encoderStaticNote = 0;

  /**
   * The last encoder value received
   */
  lastEncoderValue = -1;
  /**
   * The last switch value received
   */
  lastSwitchValue = -1;

  /**
   * Do not create yourself. Access via a {@link MidiFighter} instance.
   * @private
   * @param mf 
   * @param options 
   */
  constructor(public readonly mf: MidiFighter, options: { bank: number, encoder: number }) {
    super();
    const bank = options.bank;
    const encoder = options.encoder;
    if (bank < 0 || bank > 4) throw new Error(`Expected bank value 1-4. Got: ${ bank }`);
    if (encoder < 0 || encoder > 16) throw new Error(`Expected encoder number 1-16. Got: ${ encoder }`);

    const bankOffset = (bank - 1) * 16;

    this.encoderStaticNote = (encoder - 1) + bankOffset;
    this.inputEncoderChannel = 1;
    this.inputEncoderNoteOrCc = this.encoderStaticNote;

    this.inputSwitchChannel = 2;
    this.inputSwitchNoteOrCc = this.encoderStaticNote;

    this.bank = bank;
    this.encoder = encoder;
  }

  /**
   * Called by a {@link MidiFighter} instance when a value is received associated with this encoder.
   * Do not call directly
   * @private
   * @param value 
   */
  onValueSet(value: number) {
    const lastValue = this.lastEncoderValue;
    this.lastEncoderValue = value;
    this.fireEvent(`encoder`, { previous: lastValue, value: value, encoder: this });
  }

  /**
   * Called by a {@link MidiFighter} instance when the switch value for this encoder changes
   * @private
   * @param value 
   */
  onSwitchSet(value: number) {
    const lastValue = this.lastSwitchValue;
    this.lastSwitchValue = value;
    this.fireEvent(`switch`, { previous: lastValue, value: value, encoder: this });
  }

  /**
   * Set a scalar LED ring value (0..1).
   * 
   * ```js
   * encoder.setLedRing(0.5); // Set to 50%
   * ```
   * Use {@link setLedRingRaw} to set 0..127 integer value
   * @param v Scalar (0..1)
   */
  setLedRing(v: number) {
    this.setLedRingRaw(clamp(Math.floor(v * 127)));
  }

  /**
   * Sets the raw (0..127) value for the LED ring feedback. Use {@link setLedRing} for scalar values (0..1)
   * 
   * ```js
   * encoder.setLedRingRaw(50);
   * ```
   * 
   * @param v Raw value (0..127)
   */
  setLedRingRaw(v: number) {
    if (v < 0 || v > 127) throw new Error(`Param 'v' should be between 0-127`);

    const message: MidiMessage = {
      channel: this.ledRingChannel,
      command: `cc`,
      note: this.encoderStaticNote,
      velocity: v
    };
    this.mf.send(message);
  }

  /**
   * Sets the switch colour based on a 0..1 standard hue degree
   * ```js
   * const hsl = Colour.HslSpace.fromCss(`orange`);
   * encoder.setSwitchColourHue(hsl.hue);
   * ```
   * @param v Hue degree (0..1) range
   */
  setSwitchColourHue(v: number) {
    if (v < 0 || v > 1) throw new Error(`Param 'v' should be in 0-1 range`);
    let vv = (1 - v) + 0.70;
    if (vv > 1) vv = vv - 1;
    const velo = Math.floor(vv * 127);
    this.setSwitchColourRaw(velo);
  }

  /**
   * Set the switch colour based on 0..127 Midi Fighter range (start/end in blue).
   * Use {@link setSwitchColourHue} to set colour based on hue angle instead
   * 
   * See page 4 of the MF manual.
   * @param v 
   * @returns 
   */
  setSwitchColourRaw(v: number) {
    if (v < 0 || v > 127) throw new Error(`Param 'v' should be between 0-127`);
    const message: MidiMessage = {
      channel: this.ledColourChannel,
      command: `cc`,
      note: this.encoderStaticNote,
      velocity: v
    };
    this.mf.send(message);
  }

  /**
   * Set the effect of the colour pip
   * ```js
   * encoder.setSwitchEffect(`strobe`, 3);
   * ```
   * @param kind 
   * @param value 
   */
  setSwitchEffect(kind: `none` | `strobe` | `pulse` | `rainbow`, value = 1) {
    let velocity = 0;
    if (kind === `rainbow`) {
      velocity = 127;
    } else if (kind === `pulse`) {
      if (value < 1 || value > 7) throw new Error(`Pulse effect expects a value 1-7`);
      velocity = 9 + value;
    } else if (kind === `strobe`) {
      if (value < 1 || value > 8) throw new Error(`Strobe effect expects a value 1-8`);
      velocity = value;
    } else if (kind === `none`) {
      velocity = 0;
    } else {
      throw new Error(`Unknown kind: '${ kind }'`);
    }
    const message: MidiMessage = { channel: this.ledEffectChannel, command: `cc`, note: this.encoderStaticNote, velocity };
    this.mf.send(message);
  }
}
