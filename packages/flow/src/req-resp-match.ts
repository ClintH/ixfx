/* eslint-disable unicorn/prevent-abbreviations */
import { continuously } from "@ixfx/core"
import { SimpleEventEmitter } from "@ixfx/events"

export type RequestResponseOptions<TRequest, TResp> = {
  timeoutMs: number
  key: (requestOrResp: TRequest | TResp) => string
  keyRequest: (request: TRequest) => string
  keyResponse: (resp: TResp) => string
  whenUnmatchedResponse: `ignore` | `throw`
}

type SeenRequest<TRequest, TResp> = {
  expiresAt: number
  id: string
  req: TRequest
  promiseResolve?: (value: TResp) => void
  promiseReject?: (message: string) => void
  callback?: (error: boolean, value: TResp | string) => void
}

export type RequestResponseMatchEvents<TRequest, TResp> = {
  match: { request: TRequest, response: TResp }
  completed: { request: TRequest, response: TResp | string, success: boolean }
}

/**
 * Matches responses with requests, expiring requests if they do not get a response in a timely manner.
 * 
 * Basic usage:
 * ```js
 * const m = new RequestResponseMatch(options);
 * // Listen for when a response matches a request
 * m.addEventListener(`match`, event => {
 *  // event: { request:Req, response:Resp}
 * });
 * // Or alternatively, listen for success and failures
 * m.addEventListener(`completed`, event => {
 *  // { request:Resp, response:Req|undefined, success:boolean }
 *  // 'response' will be data or a string error message
 * });
 * m.request(req); // Note that some request was sent
 * ...
 * m.response(resp); // Call when a response is received
 * ```
 * 
 * It's also possible to wait for specific replies:
 * ```js
 * // With a promise
 * const resp = await m.requestAwait(req);
 * // With a callback
 * m.requestCallback(req, (success, resp) => {
 *  // Runs on success or failure
 * })
 * ```
 * 
 * It relies on creating an id of a request/response for them to be matched up. Use the `key`
 * option if the function can generate a key from either request or response. 
 * Or alternatively set both `keyRequest` and `keyResponse` for two functions that can generate a key for request and response respectively.
 * 
 * 
 * The easy case is if req & resp both have the same field:
 * ```js
 * const m = new RequestResponseMatch({
 *  key: (reqOrResp) => {
 *    // Requests has an 'id' field
 *    // Response also has an 'id' field that corresponds to the request id
 *    return reqOrResp.id; 
 *  }
 * });
 * ```
 * 
 * A more complicated case:
 * ```js
 * const m = new RequestResponseMatch({
 *  keyRequest: (req) => {
 *    // Requests have an 'id' field
 *    return req.id; 
 *  },
 *  keyResponse: (resp) => {
 *    // Responses have id under a different field
 *    return resp.reply_to
 *  }
 * })
 * ```
 * 
 * By default, error will be thrown if a response is received that doesn't match up to any request.
 */
export class RequestResponseMatch<TRequest, TResp> extends SimpleEventEmitter<RequestResponseMatchEvents<TRequest, TResp>> {
  timeoutMs: number;
  whenUnmatchedResponse: "ignore" | "throw";
  keyRequest: (request: TRequest) => string;
  keyResponse: (resp: TResp) => string;

  #outgoing = new Map<string, SeenRequest<TRequest, TResp>>();
  #maintainLoop;

  constructor(options: Partial<RequestResponseOptions<TRequest, TResp>> = {}) {
    super();
    if (typeof window === `undefined`) {
      (globalThis as any).window = {
        setTimeout: setTimeout,
        clearTimeout: clearTimeout
      }
    }
    this.timeoutMs = options.timeoutMs ?? 1000;
    this.whenUnmatchedResponse = options.whenUnmatchedResponse ?? `throw`;
    this.#maintainLoop = continuously(() => this.#maintain(), Math.floor(this.timeoutMs * 1.2));
    if (options.key) {
      if (options.keyRequest) throw new Error(`Cannot set 'keyRequest' when 'key' is set `);
      if (options.keyResponse) throw new Error(`Cannot set 'keyResponse' when 'key' is set `);

      this.keyRequest = options.key;
      this.keyResponse = options.key;
    } else {
      if (!options.keyRequest || !options.keyResponse) {
        throw new Error(`Expects 'keyRequest' & 'keyResponse' fields to be set if 'key' is not set`);
      }
      this.keyRequest = options.keyRequest;
      this.keyResponse = options.keyResponse;
    }
  }

  /**
   * Stops the maintenance loop and cleans up resources.
   * Should be called when done using the matcher.
   */
  dispose(): void {
    this.#maintainLoop.cancel();

    // Reject all pending promises before clearing
    for (const v of this.#outgoing.values()) {
      if (v.promiseReject) {
        v.promiseReject(`Request timeout`);
      }
    }
    this.#outgoing.clear();
  }

  #maintain() {
    const values = [ ...this.#outgoing.values() ];
    const now = Date.now();
    for (const v of values) {
      if (v.expiresAt <= now) {

        if (v.promiseReject) {
          v.promiseReject(`Request timeout`);
        }
        const callback = v.callback;
        if (callback) {
          callback(true, `Request timeout`);
        }
        this.fireEvent(`completed`, { request: v.req, response: `Request timeout`, success: false });
        this.#outgoing.delete(v.id);
      }
    }
    return this.#outgoing.size > 0;
  }

  /**
   * For debugging, logs all pending requests and their time to expiry
   */
  debugDump(): void {
    const values = [ ...this.#outgoing.values() ];
    const now = Date.now();
    for (const v of values) {
      const expire = now - v.expiresAt;
      console.log(`${ v.id } Expires in: ${ Math.floor(expire / 1000).toString() }s`);
    }
  }

  /**
   * Make a request and get the outcome via a Promise
   * @param request 
   */
  request(request: TRequest): Promise<TResp>;

  /**
   * Makes a request with a callback for the outcome
   * @param request 
   * @param callback 
   */
  request(request: TRequest, callback: (error: boolean, response: TResp | string) => void): void;

  /**
   * Makes a request.
   * If `callback` is set, it's equivalent to calling `requestCallback`.
   * If `callback` is not set, a promise is returned
   * @param request 
   * @param callback 
   * @returns 
   */

  request(request: TRequest, callback?: (error: boolean, response: TResp | string) => void): void | Promise<TResp> {
    if (callback !== undefined) { this.#requestCallback(request, callback); return; }
     const id = this.keyRequest(request);
    if (this.#outgoing.has(id)) throw new Error(`Already a request pending with id '${ id }'`);

    return this.#requestAwait(id, request);
  }

  /**
   * Make a request and don't wait for the outcome.
   * @param request 
   */
  requestAndForget(request: TRequest): void {
    const id = this.keyRequest(request);
    if (this.#outgoing.has(id)) throw new Error(`Already a request pending with id '${ id }'`);

    const r: SeenRequest<TRequest, TResp> = {
      expiresAt: Date.now() + this.timeoutMs,
      id,
      req: request
    };
    this.#outgoing.set(id, r);
    this.#maintainLoop.start();
  }

  /**
   * Make a request, returning a Promise for the outcome.
   * Errors will throw an exception.
   * 
   * @param request 
   * @returns 
   */
  #requestAwait(id:string, request: TRequest) {
    if (this.#outgoing.has(id)) throw new Error(`Already a request pending with id '${ id }'`);

    const p = new Promise<TResp>((resolve, reject) => {
      const r: SeenRequest<TRequest, TResp> = {
        expiresAt: Date.now() + this.timeoutMs,
        id,
        req: request,
        promiseResolve: resolve,
        promiseReject: reject
      };
      this.#outgoing.set(id, r);
      this.#maintainLoop.start();

    });
    return p;
  }

  /**
   * Make a request, and get notified of outcome with a callback
   * @param request 
   * @param callback 
   */
  #requestCallback(request: TRequest, callback: (error: boolean, response: TResp | string) => void) {
    const id = this.keyRequest(request);
    if (this.#outgoing.has(id)) throw new Error(`Already a request pending with id '${ id }'`);

    const r: SeenRequest<TRequest, TResp> = {
      expiresAt: Date.now() + this.timeoutMs,
      id,
      req: request,
      callback
    };
    this.#outgoing.set(id, r);
    this.#maintainLoop.start();
  }

  /**
   * Response has been received
   * @param response Response
   * @returns _True_ if response matched a request 
   */
  response(response: TResp, keepAlive: boolean): boolean {
    const id = this.keyResponse(response);
    const request = this.#outgoing.get(id);
    if (!request) {
      if (this.whenUnmatchedResponse === `throw`) throw new Error(`Unmatched response with id: '${ id }'`, { cause: response });
      // otherwise ignore
      return false;
    }

    if (keepAlive) {
      // Continue life of request
      request.expiresAt = Date.now() + this.timeoutMs
    } else {
      this.#outgoing.delete(id);
    }
    if (request.promiseResolve) {
      request.promiseResolve(response);
    }
    if (request.callback) {
      request.callback(false, response);
    }
    this.fireEvent(`match`, { request: request.req, response: response });
    if (!keepAlive) {
      this.fireEvent(`completed`, { request: request.req, response: response, success: true });
    }
    return true;
  }
}