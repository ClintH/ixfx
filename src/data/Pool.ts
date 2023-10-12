import { SimpleEventEmitter } from '../Events.js';
import * as Debug from '../debug/index.js';
/**
 * Policy for when the pool is fully used
 */
export type FullPolicy = `error` | `evictOldestUser`;

/**
 * Pool options
 */
export type Opts<V> = {
  /**
   * Maximum number of resources for this pool
   */
  readonly capacity?: number;
  /**
   * If above 0, users will be removed if there is no activity after this interval.
   * Activity is marked whenever `use` us called with that user key.
   * Default: disabled
   */
  readonly userExpireAfterMs?: number;
  /**
   * If above 0, resources with no users will be automatically removed after this interval.
   * Default: disabled
   */
  readonly resourcesWithoutUserExpireAfterMs?: number;
  /**
   * Maximum number of users per resource. Defaults to 1
   */
  readonly capacityPerResource?: number;
  /**
   * What to do if pool is full and a new resource allocation is requested.
   * Default is `error`, throwing an error when pool is full.
   */
  readonly fullPolicy?: FullPolicy;
  /**
   * If true, additional logging will trace activity of pool.
   * Default: false
   */
  readonly debug?: boolean;
  /**
   * If specified, this function will generate new resources as needed.
   */
  readonly generate?: () => V;
  /**
   * If specified, this function will be called when a resource is disposed
   */
  readonly free?: (v: V) => void;
};

/**
 * Function that initialises a pool item
 */
//export type InitPoolItem_ = <V>(id:string)=>V;

/**
 * State of pool
 */
export type PoolState = `idle` | `active` | `disposed`;

export type PoolUserEventMap<V> = {
  readonly disposed: { readonly data: V; readonly reason: string };
  readonly released: { readonly data: V; readonly reason: string };
};

/**
 * A use of a pool resource
 *
 * Has two events, _disposed_ and _released_.
 */
export class PoolUser<V> extends SimpleEventEmitter<PoolUserEventMap<V>> {
  private _lastUpdate: number;
  private _pool: Pool<V>;
  private _state: PoolState;
  private _userExpireAfterMs: number;

  /**
   * Constructor
   * @param key User key
   * @param resource Resource being used
   */
  //eslint-disable-next-line functional/prefer-immutable-types
  constructor(readonly key: string, readonly resource: Resource<V>) {
    super();
    this._lastUpdate = performance.now();
    this._pool = resource.pool;
    this._userExpireAfterMs = this._pool.userExpireAfterMs;
    this._state = `idle`;
    this._pool.log.log(`PoolUser ctor key: ${ this.key }`);
  }

  /**
   * Returns a human readable debug string
   * @returns
   */
  toString() {
    if (this.isDisposed) return `PoolUser. State: disposed`;

    return `PoolUser. State: ${ this._state } Elapsed: ${ performance.now() - this._lastUpdate } Data: ${ JSON.stringify(this.resource.data) }`;
  }

  /**
   * Resets countdown for instance expiry.
   * Throws an error if instance is disposed.
   */
  keepAlive() {
    if (this._state === `disposed`) throw new Error(`PoolItem disposed`);
    this._lastUpdate = performance.now();
  }

  /**
   * @internal
   * @param reason
   * @returns
   */
  _dispose(reason: string) {
    if (this._state === `disposed`) return;
    const resource = this.resource;
    const data = resource.data;
    this._state = `disposed`;
    resource._release(this);
    this._pool.log.log(`PoolUser dispose key: ${ this.key } reason: ${ reason }`);
    this.fireEvent(`disposed`, { data, reason });
    super.clearEventListeners();
  }

  /**
   * Release this instance
   * @param reason
   */
  release(reason: string) {
    if (this.isDisposed) throw new Error(`User disposed`);
    const resource = this.resource;
    const data = resource.data;
    this._pool.log.log(`PoolUser release key: ${ this.key } reason: ${ reason }`);
    this.fireEvent(`released`, { data, reason });
    this._dispose(`release-${ reason }`);
  }

  // #region Properties
  get data(): V {
    if (this.isDisposed) throw new Error(`User disposed`);
    return this.resource.data;
  }

  /**
   * Returns true if this instance has expired.
   * Expiry counts if elapsed time is greater than `userExpireAfterMs`
   */
  get isExpired() {
    if (this._userExpireAfterMs > 0) {
      return performance.now() > this._lastUpdate + this._userExpireAfterMs;
    }
    return false;
  }

  /**
   * Returns elapsed time since last 'update'
   */
  get elapsed() {
    return performance.now() - this._lastUpdate;
  }

  /**
   * Returns true if instance is disposed
   */
  get isDisposed() {
    return this._state === `disposed`;
  }

  /**
   * Returns true if instance is neither disposed nor expired
   */
  get isValid() {
    if (this.isDisposed || this.isExpired) return false;
    if (this.resource.isDisposed) return false;
    return true;
  }
  // #endregion
}

/**
 * A resource allocated in the Pool
 */
export class Resource<V> {
  #state: PoolState;
  #data: V;
  #users: Array<PoolUser<V>>;
  readonly #capacityPerResource;
  readonly #resourcesWithoutUserExpireAfterMs;
  #lastUsersChange: number;

  /**
   * Constructor.
   * @param pool Pool
   * @param data Data
   */
  constructor(readonly pool: Pool<V>, data: V) {
    if (data === undefined) throw new Error(`Parameter 'data' is undefined`);
    if (pool === undefined) throw new Error(`Parameter 'pool' is undefined`);

    this.#data = data;
    this.#lastUsersChange = 0;
    this.#resourcesWithoutUserExpireAfterMs =
      pool.resourcesWithoutUserExpireAfterMs;
    this.#capacityPerResource = pool.capacityPerResource;
    this.#users = [];
    this.#state = `idle`;
  }

  /**
   * Gets data associated with resource.
   * Throws an error if disposed
   */
  get data() {
    if (this.#state === `disposed`) throw new Error(`Resource disposed`);
    return this.#data;
  }

  /**
   * Changes the data associated with this resource.
   * Throws an error if disposed or `data` is undefined.
   * @param data
   */
  updateData(data: V) {
    if (this.#state === `disposed`) throw new Error(`Resource disposed`);
    if (data === undefined) throw new Error(`Parameter 'data' is undefined`);
    this.#data = data;
  }

  /**
   * Returns a human-readable debug string for resource
   * @returns
   */
  toString() {
    return `Resource (expired: ${ this.isExpiredFromUsers } users: ${ this.#users.length }, state: ${ this.#state }) data: ${ JSON.stringify(this.data) }`;
  }

  /**
   * Assigns a user to this resource.
   * @internal
   * @param user
   */
  _assign(user: PoolUser<V>) {
    const existing = this.#users.find((u) => u === user || u.key === user.key);
    if (existing) throw new Error(`User instance already assigned to resource`);
    this.#users.push(user);
    this.#lastUsersChange = performance.now();
  }

  /**
   * Releases a user from this resource
   * @internal
   * @param user
   */
  _release(user: PoolUser<V>) {
    this.#users = this.#users.filter((u) => u !== user);
    this.pool._release(user);
    this.#lastUsersChange = performance.now();
  }

  /**
   * Returns true if resource can have additional users allocated
   */
  get hasUserCapacity() {
    return this.usersCount < this.#capacityPerResource;
  }

  /**
   * Returns number of uses of the resource
   */
  get usersCount() {
    return this.#users.length;
  }

  /**
   * Returns true if automatic expiry is enabled, and that interval
   * has elapsed since the users list has changed for this resource
   */
  get isExpiredFromUsers() {
    if (this.#resourcesWithoutUserExpireAfterMs <= 0) return false;
    if (this.#users.length > 0) return false;
    return (
      performance.now() >
      this.#resourcesWithoutUserExpireAfterMs + this.#lastUsersChange
    );
  }

  /**
   * Returns true if instance is disposed
   */
  get isDisposed() {
    return this.#state === `disposed`;
  }

  /**
   * Disposes the resource.
   * If it is already disposed, it does nothing.
   * @param reason
   * @returns
   */
  dispose(reason: string) {
    if (this.#state === `disposed`) return;
    const data = this.#data;
    this.#state = `disposed`;
    this.pool.log.log(`Resource disposed (${ reason })`);
    for (const u of this.#users) {
      u._dispose(`resource-${ reason }`);
    }
    this.#users = [];
    this.#lastUsersChange = performance.now();
    this.pool._releaseResource(this, reason);

    if (this.pool.freeResource) this.pool.freeResource(data);
  }
}

/**
 * Resource pool
 */
export class Pool<V> {
  private _resources: Array<Resource<V>>;
  private _users: Map<string, PoolUser<V>>;

  readonly capacity: number;
  readonly userExpireAfterMs: number;
  readonly resourcesWithoutUserExpireAfterMs: number;

  readonly capacityPerResource: number;
  readonly fullPolicy: FullPolicy;
  private generateResource?: () => V;
  readonly freeResource?: (v: V) => void;

  readonly log: Debug.LogSet;

  /**
   * Constructor.
   *
   * By default, no capacity limit, one user per resource
   * @param opts Pool options
   */
  constructor(opts: Opts<V> = {}) {
    this.capacity = opts.capacity ?? -1;
    this.fullPolicy = opts.fullPolicy ?? `error`;
    this.capacityPerResource = opts.capacityPerResource ?? 1;
    this.userExpireAfterMs = opts.userExpireAfterMs ?? -1;
    this.resourcesWithoutUserExpireAfterMs =
      opts.resourcesWithoutUserExpireAfterMs ?? -1;

    this.generateResource = opts.generate;
    this.freeResource = opts.free;

    this._users = new Map();
    this._resources = [];

    this.log = Debug.logSet(`Pool`, opts.debug ?? false);

    // If we have a time-based expiry, set an interval to
    // automatically do the housekeeping
    const timer = Math.max(
      this.userExpireAfterMs,
      this.resourcesWithoutUserExpireAfterMs
    );
    if (timer > 0) {
      setInterval(() => {
        this.maintain();
      }, timer * 1.1);
    }
  }

  /**
   * Returns a debug string of Pool state
   * @returns
   */
  dumpToString() {
    //eslint-disable-next-line functional/no-let
    let r = `Pool
    capacity: ${ this.capacity } userExpireAfterMs: ${ this.userExpireAfterMs } capacityPerResource: ${ this.capacityPerResource }
    resources count: ${ this._resources.length }`;

    const resource = this._resources.map((r) => r.toString()).join(`\r\n\t`);
    r += `\r\nResources:\r\n\t` + resource;

    r += `\r\nUsers: \r\n`;
    for (const [ k, v ] of this._users.entries()) {
      r += `\tk: ${ k } v: ${ v.toString() }\r\n`;
    }
    return r;
  }

  /**
   * Sorts users by longest elapsed time since update
   * @returns
   */
  getUsersByLongestElapsed() {
    return [ ...this._users.values() ].sort((a, b) => {
      const aa = a.elapsed;
      const bb = b.elapsed;
      if (aa === bb) return 0;
      if (aa < bb) return 1;
      return -1;
    });
  }

  /**
   * Returns resources sorted with least used first
   * @returns
   */
  getResourcesSortedByUse() {
    return [ ...this._resources ].sort((a, b) => {
      if (a.usersCount === b.usersCount) return 0;
      if (a.usersCount < b.usersCount) return -1;
      return 1;
    });
  }

  /**
   * Adds a resource to the pool.
   * Throws an error if the capacity limit is reached.
   * @param resource
   * @returns
   */
  addResource(resource: V) {
    if (resource === undefined) {
      throw new Error(`Cannot add undefined resource`);
    }
    if (resource === null) throw new Error(`Cannot add null resource`);

    if (this.capacity > 0 && this._resources.length === this.capacity) {
      throw new Error(
        `Capacity limit (${ this.capacity }) reached. Cannot add more.`
      );
    }

    this.log.log(`Adding resource: ${ JSON.stringify(resource) }`);
    const pi = new Resource<V>(this, resource);
    this._resources.push(pi);
    return pi;
  }

  /**
   * Performs maintenance, removing disposed/expired resources & users.
   * This is called automatically when using a resource.
   */
  maintain() {
    //eslint-disable-next-line functional/no-let
    let changed = false;

    // Find all disposed resources
    const nuke: Array<Resource<V>> = [];
    for (const p of this._resources) {
      if (p.isDisposed) {
        this.log.log(`Maintain, disposed resource: ${ JSON.stringify(p.data) }`);
        nuke.push(p);
      } else if (p.isExpiredFromUsers) {
        this.log.log(`Maintain, expired resource: ${ JSON.stringify(p.data) }`);
        nuke.push(p);
      }
    }

    // Remove them
    if (nuke.length > 0) {
      for (const resource of nuke) {
        resource.dispose(`diposed/expired`);
      }
      changed = true;
    }

    // Find 'users' to clean up
    const userKeysToRemove: Array<string> = [];
    for (const [ key, user ] of this._users.entries()) {
      if (!user.isValid) {
        this.log.log(
          `Maintain. Invalid user: ${ user.key } (Disposed: ${ user.isDisposed } Expired: ${ user.isExpired } Resource disposed: ${ user.resource.isDisposed })`
        );

        userKeysToRemove.push(key);
        user._dispose(`invalid`);
      }
    }

    for (const userKey of userKeysToRemove) {
      this._users.delete(userKey);
      changed = true;
    }

    if (changed) {
      this.log.log(
        `End: resource len: ${ this._resources.length } users: ${ this.usersLength }`
      );
    }
  }

  /**
   * Iterate over resources in the pool.
   * To iterate over the data associated with each resource, use
   * `values`.
   */
  *resources() {
    const resource = [ ...this._resources ];
    for (const r of resource) {
      yield r;
    }
  }

  /**
   * Iterate over resource values in the pool.
   * to iterate over the resources, use `resources`.
   *
   * Note that values may be returned even though there is no
   * active user.
   */
  *values() {
    const resource = [ ...this._resources ];
    for (const r of resource) {
      yield r.data;
    }
  }

  /**
   * Unassociate a key with a pool item
   * @param userKey
   */
  release(userKey: string, reason?: string): void {
    const pi = this._users.get(userKey);
    if (!pi) return;
    pi.release(reason ?? `Pool.release`);
  }

  /**
   * @internal
   * @param user
   */
  //eslint-disable-next-line functional/prefer-immutable-types
  _release(user: PoolUser<V>) {
    this._users.delete(user.key);
  }

  /**
   * @internal
   * @param resource
   * @param _
   */
  //eslint-disable-next-line functional/prefer-immutable-types
  _releaseResource(resource: Resource<V>, _: string) {
    this._resources = this._resources.filter((v) => v !== resource);
  }

  /**
   * Returns true if `v` has an associted resource in the pool
   * @param resource
   * @returns
   */
  hasResource(resource: V): boolean {
    const found = this._resources.find((v) => v.data === resource);
    return found !== undefined;
  }

  /**
   * Returns true if a given `userKey` is in use.
   * @param userKey
   * @returns
   */
  hasUser(userKey: string): boolean {
    return this._users.has(userKey);
  }

  /**
   * @internal
   * @param key
   * @param resource
   * @returns
   */
  //eslint-disable-next-line functional/prefer-immutable-types
  private _assign(key: string, resource: Resource<V>) {
    const u = new PoolUser<V>(key, resource);
    this._users.set(key, u);
    resource._assign(u);
    return u;
  }

  /**
   * @internal
   * @param userKey
   * @returns
   */
  private _findUser(userKey: string): PoolUser<V> | undefined {
    // Sort items by number of users per pool item
    const sorted = this.getResourcesSortedByUse();
    //eslint-disable-next-line functional/no-let
    // for (let i=0;i<sorted.length;i++) {
    //   console.log(i +`. users: ` + sorted[i].usersCount);
    // }
    if (sorted.length > 0 && sorted[ 0 ].hasUserCapacity) {
      // No problem, resource has capacity
      //this.log.log(`resource has capacity: ${ sorted[ 0 ].data }`);
      const u = this._assign(userKey, sorted[ 0 ]);
      return u;
    }

    // If resource count is below capacity, can we generate more?
    if (
      this.generateResource &&
      (this.capacity < 0 || this._resources.length < this.capacity)
    ) {
      this.log.log(
        `capacity: ${ this.capacity } resources: ${ this._resources.length }`
      );
      const resourceGenerated = this.addResource(this.generateResource());
      const u = this._assign(userKey, resourceGenerated);
      return u;
    }
  }

  /**
   * Return the number of users
   */
  get usersLength() {
    return [ ...this._users.values() ].length;
  }

  /**
   * 'Uses' a resource, returning the value
   * @param userKey
   * @returns
   */
  useValue(userKey: string): V {
    const resource = this.use(userKey);
    return resource.resource.data;
  }

  /**
   * Gets a pool item based on a user key.
   * The same key should return the same pool item,
   * for as long as it still exists.
   * @param userKey
   * @returns
   */
  use(userKey: string): PoolUser<V> {
    const pi = this._users.get(userKey);
    if (pi) {
      pi.keepAlive();
      return pi;
    }

    this.maintain();

    const match = this._findUser(userKey);
    if (match) return match;

    // Throw an error if all items are being used
    if (this.fullPolicy === `error`) {
      console.log(this.dumpToString());
      throw new Error(
        `Pool is fully used (fullPolicy: ${ this.fullPolicy }, capacity: ${ this.capacity })`
      );
    }
    // Evict oldest user
    if (this.fullPolicy === `evictOldestUser`) {
      const users = this.getUsersByLongestElapsed();
      if (users.length > 0) {
        this.release(users[ 0 ].key, `evictedOldestUser`);

        const match2 = this._findUser(userKey);
        if (match2) return match2;
      }
    }

    // Evict newest user

    // Evict from random pool item
    throw new Error(`Pool is fully used (${ this.fullPolicy })`);
  }
}

/**
 * Creates an instance of a Pool
 * @param opts
 * @returns
 */
export const create = <V>(opts: Opts<V> = {}): Pool<V> => new Pool<V>(opts);
