import { retryTask } from "../flow/Retry.js"
import { intervalToMs, type Interval } from "../flow/IntervalType.js"
import { eventRace } from "../Events.js"
import { StateMachine } from "../flow/index.js"
import { getErrorMessage } from "../debug/GetErrorMessage.js"

export type ReconnectingWebsocket = {
  /**
   * Sends data
   * @param data 
   * @returns 
   */
  send: (data: string | ArrayBufferLike | ArrayBufferView | Blob) => void
  /**
   * Closes websocket, disabling reconnection
   * @returns
   */
  close: () => void

  /**
   * Opens websocket if it's not already connected or connecting
   * @returns 
   */
  open: () => Promise<boolean>

  /**
   * Returns _true_ if it seems the websocket is connected
   * @returns 
   */
  isConnected: () => boolean
}

export type ReconnectingWebsocketStates = `connecting` | `open` | `closed`;

export type ReconnectingOptions = {
  startDelay: Interval
  maxDelay: Interval
  limitAttempts: number
  /**
   * How often to check the state of the
   * underlying websocket.
   * 
   * Default: 5s
   */
  checkStateMs: Interval
  /**
   * Callback when message is received
   * @param message 
   * @returns 
   */
  onMessage: (message: any) => void
  onConnected: () => void
  onDisconnected: () => void
  onError: (error: any) => void
}

export const reconnectingWebsocket = (url: string | URL, opts: Partial<ReconnectingOptions> = {}): ReconnectingWebsocket => {
  const startDelayMs = intervalToMs(opts.startDelay, 2000);
  const maxDelayMs = intervalToMs(opts.maxDelay, startDelayMs * 10);
  const checkStateMs = intervalToMs(opts.checkStateMs, 5000)
  if (startDelayMs > maxDelayMs) throw new Error(`startDelay should be less than maxDelay`);
  if (checkStateMs < 0) throw new Error(`Param 'checkState' should be above zero`);
  let reconnect = true;
  let currentState = StateMachine.init({
    closed: `connecting`,
    open: `closed`,
    connecting: [ `closed`, `open` ]
  });//`closed`;

  let ws: WebSocket | undefined;
  const onError = (event_: any) => {
    if (opts.onError) {
      opts.onError(event_);
    } else {
      console.log(`rw on error`, event_);
      console.error(` error: ${ event_.error }`);
      console.error(` type: ${ event_.type }`);
      console.error(` error msg: ${ event_.message }`);
    }
  }

  const onMessage = (message: MessageEvent) => {
    if (opts.onMessage) opts.onMessage(message.data);
  }

  const connect = async () => {
    if (currentState.value === `connecting`) throw new Error(`Cannot connect twice`);
    currentState = StateMachine.to(currentState, `connecting`);
    if (ws !== undefined) {
      ws.removeEventListener(`error`, onError);
      if (opts.onMessage) {
        ws.removeEventListener(`message`, onMessage);
      }
      ws = undefined;
    }

    // Keep trying to connect
    const retry = await retryTask({
      async probe(_attempts: number) {
        try {
          const wss = new WebSocket(url);
          const r = await eventRace(wss, [ `open`, `error` ], { timeout: 1000 });
          return r.type === `open` ? { success: true, value: wss } : { success: false, value: undefined };
        } catch (error) {
          return { success: false, message: getErrorMessage(error) }
        }
      },
    }, { predelayMs: startDelayMs, limitAttempts: opts.limitAttempts });

    // Final result
    ws = retry.value;
    let result = false;
    if (retry.success && ws) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      ws.addEventListener(`error`, onError);
      if (opts.onMessage) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        ws.addEventListener(`message`, onMessage);
      }
      result = true;
      currentState = StateMachine.to(currentState, `open`);
      if (opts.onConnected) opts.onConnected();
    } else {
      currentState = StateMachine.to(currentState, `closed`);
    }
    return result;
  }

  const send = (data: string | ArrayBufferLike | ArrayBufferView | Blob) => {
    if (ws) {
      if (ws.readyState === ws.OPEN) {
        ws.send(data)
      } else {
        onDisconnected();
      }
    } else {
      throw new Error(`Not connected`);
    }
  }

  const onDisconnected = () => {
    if (currentState.value === `closed`) return;
    if (currentState.value === `open`) {
      currentState = StateMachine.to(currentState, `closed`);
      if (opts.onDisconnected) opts.onDisconnected();
    }
    if (reconnect && currentState.value !== `connecting`) {
      console.log(`Scheduling connect`);
      setTimeout(() => {
        void connect();
      }, 100)
    }
  }
  const isConnected = () => {
    if (!ws) return false;
    return ws.readyState === ws.OPEN;
  }

  const close = () => {
    reconnect = false;
    currentState = StateMachine.to(currentState, `closed`);
    ws?.close();
    if (opts.onDisconnected) opts.onDisconnected();
  }

  const open = () => {
    reconnect = true;
    if (currentState.value === `open`) return Promise.resolve(true);
    if (currentState.value === `connecting`) return Promise.resolve(false);
    return connect();
  }

  void connect();

  setInterval(() => {
    if (!ws) return;
    switch (ws.readyState) {
      case ws.CLOSED: {
        if (currentState.value === `open`) {
          onDisconnected();
        }
        break;
      }
    }
  }, checkStateMs);
  return { send, isConnected, close, open }
}