import { SimpleEventEmitter } from "@ixfx/events";
import type { MidiMessage, NoteMidiMessage } from "./types.js";
import { debounce } from "@ixfx/flow";
import { mapWithEmptyFallback } from "@ixfx/arrays";
import * as MidiFns from "./midi-fns.js";
import { noteNumberToFrequency, noteNumberToName } from "./notes.js";

export type MidiManagerState = {
  initialised: boolean
  errorReason: string
}

export type MidiManagerEvents = {
  open: { port: MIDIPort }
  close: { port: MIDIPort }
  deviceConnected: { port: MIDIPort }
  deviceDisconnected: { port: MIDIPort }
  message: (MidiMessage | NoteMidiMessage) & { port: MIDIInput, raw: Uint8Array }
}

/**
 * Midi Manager makes simplifies connecting to ports
 * and having omni input/output
 * 
 * ```js
 * const midi = new MidiManager(); // By default connects to all ins and outs
 * midi.addEventListener(`message`, event => {
 *  // Do something with received MIDI data from any input
 * })
 * 
 * midi.scan();
 * midi.send({ command: `cc`, note: 10, channel: 1, velocity: 20 });
 * 
 * // Sends note '10' on channel 1, velocity 100, duration 200ms 
 * midi.sendNote(1, 10, 100, 200);
 * ```
 * Events:
 * * open/close: Connected port is open/closed
 * * deviceConnected/deviceDisconnected: A port is newly available or unavailable
 * * message: MIDI event received
 */
export class MidiManager extends SimpleEventEmitter<MidiManagerEvents> {
  verbose = true;
  #state: MidiManagerState;
  #access?: MIDIAccess;

  #inUse: MIDIPort[] = [];
  #known: MIDIPort[] = [];

  #omniInput = true;
  #omniOutput = true;
  #connectAllInputsDebounced = debounce(() => this.#connectAllInputs(), 1000);
  #connectAllOutputsDebounced = debounce(() => this.#connectAllOutputs(), 1000);

  constructor() {
    super();
    this.#state = {
      initialised: false,
      errorReason: ``
    }
    this.#throwIfNotSupported();
  }

  *getInUse() {
    for (const p of this.#inUse) yield p;
  }

  *getInUseInput() {
    for (const p of this.#inUse) {
      if (p.type === `input`) yield p as MIDIInput;
    }
  }

  *getInUseOutput() {
    for (const p of this.#inUse) {
      if (p.type === `output`) yield p as MIDIOutput;
    }
  }

  *known() {
    for (const p of this.#known) yield p;
  }

  *knownInput() {
    for (const p of this.#known) {
      if (p.type === `input`) {
        yield p as MIDIInput;
      }
    }
  }

  *knownOutput() {
    for (const p of this.#known) {
      if (p.type === `output`) {
        yield p as MIDIOutput;
      }
    }
  }

  async scan() {
    await this.#init();
    const a = this.#access;
    if (!a) return;

    for (const [ _name, port ] of a.inputs) {
      this.#updatePort(port);
    }
    for (const [ _name, port ] of a.outputs) {
      this.#updatePort(port);
    }
    if (this.#omniInput) this.#connectAllInputsDebounced();
    if (this.#omniOutput) this.#connectAllOutputsDebounced();
  }

  /**
   * Sends a message to a port.
   * 
   * If port is omitted, all open output ports are used.
   * @param message 
   * @param port 
   * @param timestamp 
   */
  send(message: MidiMessage, port?: MIDIOutput, timestamp?: DOMHighResTimeStamp) {
    const packed = MidiFns.pack(message);
    if (typeof port === `undefined`) {
      // Send to all
      for (const p of this.#inUse) {
        if (p.type === `output`) {
          (p as MIDIOutput).send(packed, timestamp);
        }
      }
    } else {
      port.send(packed, timestamp);
    }
  }


  sendNote(channel: number, note: number, velocity: number, duration: number, delay?: DOMHighResTimeStamp, port?: MIDIOutput) {
    if (port === undefined) {
      for (const port of this.getInUseOutput()) {
        this.sendNote(channel, note, velocity, duration, delay, port);
      }
    } else {
      MidiFns.sendNote(port, channel, note, velocity, duration, delay);
    }

  }

  #updatePort(p: MIDIPort) {
    if (p.state === `connected`) {
      this.#onPortConnected(p);
      if (p.connection === `open`) {
        this.#onPortOpen(p);
      }
    } else if (p.state === `disconnected`) {
      this.#onPortDisconnected(p);
    }
  }

  #onMessage = (event: MIDIMessageEvent) => {
    const raw = event.data;
    const port = event.currentTarget as MIDIInput;
    if (!raw) return;
    const data = MidiFns.unpack(raw);
    if (data.command === `noteoff` || data.command === `noteon`) {
      this.fireEvent(`message`, {
        ...data,
        port,
        raw,
        frequency: noteNumberToFrequency(data.note),
        noteName: noteNumberToName(data.note)
      });

      return;
    }
    this.fireEvent(`message`, { ...data, port, raw });
  }

  #onPortOpen(port: MIDIPort) {
    const inUse = this.#inUse.find(p => p.id === port.id);
    this.#logVerbose(`onPortOpen: id: ${ port.id } name: ${ port.name } (${ port.type })`);

    if (inUse) {
      // Already bound to port
      this.#logVerbose(`-- bug, port already in use?`);
      return;
    }

    // Ensure that we mark port as known too
    this.#onPortConnected(port);

    if (port.type === `input`) {
      (port as MIDIInput).addEventListener(`midimessage`, this.#onMessage);
    }
    this.#inUse = [ ...this.#inUse, port ];
    this.fireEvent(`open`, { port });
  }

  #onPortClose(port: MIDIPort) {
    const inUse = this.#inUse.find(p => p.id === port.id);
    if (!inUse) return; // We aren't bound to port

    if (port.type === `input`) {
      (port as MIDIInput).removeEventListener(`midimessage`, this.#onMessage);
    }
    this.#inUse = this.#inUse.filter(p => p.id !== port.id);
    this.fireEvent(`close`, { port });
  }

  /**
   * New device connected, but not necessarily open
   * @param port 
   */
  #onPortConnected(port: MIDIPort) {
    const known = this.#known.find(p => p.id === port.id);
    if (known) return; // Already known about
    this.#known = [ ...this.#known, port ];
    this.fireEvent(`deviceConnected`, { port });
  }

  /**
   * Device disconnected
   * @param port 
   * @returns 
   */
  #onPortDisconnected(port: MIDIPort) {
    const known = this.#known.find(p => p.id === port.id);
    if (!known) return; // Not known about
    this.#onPortClose(port); // Make sure we mark port closed too
    this.#known = this.#known.filter(p => p.id !== port.id);
    this.fireEvent(`deviceDisconnected`, { port });
  }

  #isPortInUse(port: MIDIPort) {
    return this.#inUse.find(p => p.id === port.id) !== undefined;
  }

  async closeAll(what: `input` | `output` | `both` = `both`) {
    for (const p of this.#inUse) {
      if (p.type == `input` && (what === `both` || what === `input`)) {
        await p.close();
      }
      if (p.type == `output` && (what === `both` || what === `output`)) {
        await p.close();
      }

    }
  }

  async setOmniInput(value: boolean) {
    this.#omniInput = value;
    await this.closeAll(`input`);
    if (value) {
      await this.#connectAllInputs();
    }
  }

  get omniInput() {
    return this.#omniInput;
  }

  async setOmniOutput(value: boolean) {
    this.#omniOutput = value;

    await this.closeAll(`output`);
    if (value) {
      await this.#connectAllOutputs();
    }
  }

  get omniOutput() {
    return this.#omniOutput;
  }
  async #connectAllInputs() {
    const a = this.#access;
    if (!a) return;
    for (const [ _name, input ] of a.inputs) {
      if (input.connection === `closed`) {
        if (this.#isPortInUse(input)) throw new Error(`Bug: Input closed, but inUse?`);
        await input.open();
      }
    }
  }

  async #connectAllOutputs() {
    const a = this.#access;
    if (!a) return;
    for (const [ _name, output ] of a.outputs) {
      if (output.connection === `closed`) {
        if (this.#isPortInUse(output)) throw new Error(`Bug: Output closed, but inUse?`);
        await output.open();
      }
    }
  }


  dumpToStringLines() {
    const returnValue: string[] = [];
    const portToString = (p: MIDIPort) => ` -  ${ p.name } (${ p.type }) state: ${ p.state } conn: ${ p.connection } id: ${ p.id }`
    returnValue.push(`MidiManager`);
    returnValue.push(`In Use:`);
    returnValue.push(...mapWithEmptyFallback(this.#inUse, portToString, `  (none)`));

    returnValue.push(`Known:`);
    returnValue.push(...mapWithEmptyFallback(this.#known, portToString, `  (none)`));

    return returnValue;
  }

  #onStateChange(event: MIDIConnectionEvent) {
    const port = event.port;
    if (port === null) return;

    //const inUse = this.#inUse.find(p => p.id === port.id);
    //const known = this.#known.find(p => p.id === port.id);

    //this.#log(`Port: '${ port.name }' (${ port.type }) state: ${ port.state } connection: ${ port.connection }. Known: ${ known !== undefined } In use: ${ inUse !== undefined }`)

    if (port.state === `connected`) {
      if (port.connection === `open`) {
        this.#onPortOpen(port);
      } else if (port.connection === `closed`) {
        // New device connected, or going from open->closed
        this.#onPortClose(port);
        this.#onPortConnected(port);
        if (this.#omniInput && port.type === `input`) this.#connectAllInputsDebounced();
        else if (this.#omniOutput && port.type === `output`) this.#connectAllOutputsDebounced();
      }
    } else if (port.state === `disconnected`) {
      this.#onPortDisconnected(port);
    }
  }

  /**
   * Opens `port`.
   * 
   * If `exclusive` is _true_, all other ports of that type
   * (ie. input or output) are closed before the port is opened.
   * 
   * If `exclusive` is _false_ (default), already open ports are left open.
   * @param port 
   * @param exclusive 
   */
  async open(port: MIDIPort, exclusive = false) {
    if (exclusive) {
      if (port.type === `input`) {
        await this.closeAll(`input`);
      } else if (port.type === `output`) {
        await this.closeAll(`output`);
      }
    }
    const p = port.open();

  }

  #logVerbose(message: any) {
    if (!this.verbose) return;
    console.log(`MIDI`, message);
  }

  #setState(state: Partial<MidiManagerState>) {
    this.#state = {
      ...this.#state,
      ...state
    };
    this.#logVerbose(`State change: ${ JSON.stringify(this.#state) }`);
  }

  async #init() {
    if (this.#state.initialised && this.#access !== undefined) return;
    // @ts-expect-error software and sysex properties not in type
    const q = await navigator.permissions.query({ name: "midi", software: true, sysex: false });
    if (q.state === `denied`) {
      this.#access = undefined;
      this.#setState({ initialised: false, errorReason: `Permission denied` });
      return;
    }

    this.#access = await navigator.requestMIDIAccess({ software: true, sysex: false });
    this.#access.addEventListener(`statechange`, (event) => {
      this.#onStateChange(event)
    });
    this.#setState({ initialised: true, errorReason: `` });
  }

  #isSupported() {
    if (!navigator.requestMIDIAccess) return false;
    return true;
  }

  #throwIfNotSupported() {
    if (!window.isSecureContext) throw new Error(`Code is not running in a secure context. Load it via https`);
    if (!this.#isSupported()) {
      throw new Error(`MIDI not supported in this browser`);
    }
  }

  findKnownPort(fn: (p: MIDIPort) => boolean): MIDIPort | undefined {
    return this.#known.find(fn);
  }
  *filterKnownPort(fn: (p: MIDIPort) => boolean) {
    yield* this.#known.filter(fn);
  }
  findInUsePort(fn: (p: MIDIPort) => boolean): MIDIPort | undefined {
    return this.#inUse.find(fn);
  }
  *filterInUsePort(fn: (p: MIDIPort) => boolean) {
    yield* this.#inUse.filter(fn);
  }
}