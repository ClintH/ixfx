import * as Debug from "../Debug.js";
export type FullPolicy = `error`|`evictOldestUser`

//eslint-disable-next-line functional/no-mixed-type
export type Opts<V> = {
  /**
   * Maximum number of resources for this pool
   */
  readonly capacity?:number
  /**
   * If above 0, users will be removed if there is no activity after this interval.
   * Activity is marked whenever `use` us called with that user key
   */
  readonly userExpireAfterMs?:number
  /**
   * If above 0, resources with no users will be automatically removed after this interval
   */
  readonly resourcesWithoutUserExpireAfterMs?:number
  /**
   * Maximum number of users per resource. Defaults to 0
   */
  readonly capacityPerResource?:number
  /**
   * What to do if pool is full and a new resource allocation is requested
   */
  readonly fullPolicy?:FullPolicy
  /**
   * If true, additional logging will trace activity of pool
   */
  readonly debug?:boolean
  /**
   * If specified, this function will generate new resources as needed.
   */
  readonly generate?:()=>V
  /**
   * If specified, this function will be called when a resource is disposed
   */
  readonly free?:(v:V)=>void
}

export type InitPoolItem = <V>(id:string)=>V;
export type PoolState = `idle`|`active`|`disposed`;

export class PoolUser<V> {
  private lastUpdate:number;
  private pool:Pool<V>;
  private state:PoolState;
  private userExpireAfterMs:number;

  constructor(readonly key:string, readonly resource:Resource<V>) {
    this.lastUpdate = performance.now();
    this.pool = resource.pool;
    this.userExpireAfterMs = this.pool.userExpireAfterMs;
    this.state = `idle`;
    this.pool.log.log(`PoolUser ctor key: ${this.key}`);
  }

  get elapsed() {
    return performance.now() - this.lastUpdate;
  }

  toString() {
    if (this.isDisposed) return `PoolUser. State: disposed`;

    return `PoolUser. State: ${this.state} Elapsed: ${performance.now()-this.lastUpdate} Data: ${JSON.stringify(this.resource.data)}`;
  }

  get isExpired() {
    if (this.userExpireAfterMs > 0) {
      return performance.now() > (this.lastUpdate + this.userExpireAfterMs);
    }
    return false;
  }

  get isDisposed() {
    return this.state === `disposed`;
  }

  get isValid() {
    if (this.isDisposed || this.isExpired) return false;
    if (this.resource.isDisposed) return false;
    return true;
  }

  keepAlive() {
    if (this.state === `disposed`) throw new Error(`PoolItem disposed`);
    this.lastUpdate = performance.now();
  }

  /**
   * @internal
   * @param reason 
   * @returns 
   */
  _dispose(reason:string) {
    if (this.state ===`disposed`) return;
    this.state = `disposed`;
    this.resource._release(this);
    this.pool.log.log(`PoolUser dispose key: ${this.key} reason: ${reason}`);
  }

  release(reason:string) {
    this.pool.log.log(`PoolUser release key: ${this.key} reason: ${reason}`);
    this._dispose(`release-${reason}`);
  }
}

export class Resource<V> {
  private state:PoolState;
  private readonly _data:V;
  private users:PoolUser<V>[];
  private readonly capacityPerResource;
  private readonly resourcesWithoutUserExpireAfterMs;
  private lastUsersChange:number;

  constructor(readonly pool:Pool<V>, data:V) {
    this._data = data;
    this.lastUsersChange = 0;
    this.resourcesWithoutUserExpireAfterMs = pool.resourcesWithoutUserExpireAfterMs;
    this.capacityPerResource = pool.capacityPerResource;
    this.users = [];
    this.state = `idle`;
  }


  get data() {
    if (this.state === `disposed`) throw new Error(`Resource disposed`);
    return this._data;
  }

  toString() {
    return `Resource (expired: ${this.isExpiredFromUsers} users: ${this.users.length}, state: ${this.state}) data: ${JSON.stringify(this.data)}`;
  }

  /**
   * @internal
   * @param user 
   */
  _assign(user:PoolUser<V>) {
    const existing = this.users.find(u => u === user || u.key === user.key);
    if (existing) throw new Error(`User instance already assigned to resource`);
    this.users.push(user);
    this.lastUsersChange = performance.now();
  }

  /**
   * @internal
   * @param user 
   */
  _release(user:PoolUser<V>) {
    this.users = this.users.filter(u => u !== user);
    this.pool._release(user);
    this.lastUsersChange = performance.now();
  }

  get hasUserCapacity() {
    //console.log(`hasUserCapcity: ${this.usersCount} cap: ${this.capacityPerResource}`);
    return this.usersCount < this.capacityPerResource;
  }

  get usersCount() {
    return this.users.length;
  }

  /**
   * Returns true if automatic expiry is enabled, and that interval
   * has elapsed since the users list has changed for this resource
   */
  get isExpiredFromUsers() {
    if (this.resourcesWithoutUserExpireAfterMs <= 0) return false;
    if (this.users.length > 0) return false;
    return performance.now() > this.resourcesWithoutUserExpireAfterMs + this.lastUsersChange;
  }

  get isDisposed() {
    return (this.state ===`disposed`);
  }

  dispose(reason:string) {
    if (this.state ===`disposed`) return;
    this.state = `disposed`;
    this.pool.log.log(`Resource disposed (${reason})`);
    for (const u of this.users) {
      u._dispose(`resource-${reason}`);
    }
    this.users = [];
    this.lastUsersChange = performance.now();
    this.pool._releaseResource(this, reason); 

    if (this.pool.freeResource) this.pool.freeResource(this.data);

  }
}

export class Pool<V> {
  private _resources:Resource<V>[];
  private _users:Map<string, PoolUser<V>>;
  
  readonly capacity:number;
  readonly userExpireAfterMs:number;
  readonly resourcesWithoutUserExpireAfterMs:number;

  readonly capacityPerResource:number;
  readonly fullPolicy:FullPolicy;
  readonly generateResource?:()=>V;
  readonly freeResource?:(v:V)=>void;

  readonly log:Debug.LogSet;

  constructor(opts:Opts<V>) {
    this.capacity = opts.capacity ??  -1;
    this.fullPolicy = opts.fullPolicy ?? `error`;
    this.capacityPerResource = opts.capacityPerResource ?? 1;
    
    this.generateResource = opts.generate;
    this.freeResource = opts.free;

    this._users = new Map();
    this._resources = [];

    this.userExpireAfterMs = opts.userExpireAfterMs ?? -1;
    this.resourcesWithoutUserExpireAfterMs = opts.resourcesWithoutUserExpireAfterMs ?? -1;
    this.log = Debug.logSet(`Pool`, opts.debug ?? false);
  }

  dumpToString() {
    //eslint-disable-next-line functional/no-let
    let r = 
    `Pool
    capacity: ${this.capacity} userExpireAfterMs: ${this.userExpireAfterMs} capacityPerResource: ${this.capacityPerResource}
    resources count: ${this.resources.length}`;

    const res = this._resources.map(r => r.toString()).join(`\r\n\t`);
    r +=`\r\nResources:\r\n\t` + res;

    r += `\r\nUsers: \r\n`;
    for (const [k, v] of this._users.entries()) {
      r += `\tk: ${k} v: ${v.toString()}\r\n`;
    }
    return r;
  }

  getUsersByLongestElapsed() {
    return [...this._users.values()].sort((a, b) => {
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
    return [...this._resources].sort((a, b) => {
      if (a.usersCount === b.usersCount) return 0;
      if (a.usersCount < b.usersCount) return -1;
      return 1;
    });
  }

  addResource(resource:V) {
    if (this.capacity > 0 && this._resources.length === this.capacity) throw new Error(`Capacity limit (${this.capacity}) reached. Cannot add more.`);

    this.log.log(`Adding resource: ${JSON.stringify(resource)}`);
    const pi = new Resource<V>(this, resource);
    this._resources.push(pi);
    return pi;
  }


  maintain() {
    //eslint-disable-next-line functional/no-let
    let changed = false;


    // Find all disposed resources
    const nuke:Resource<V>[] = [];
    for (const p of this._resources) {
      if (p.isDisposed) {
        this.log.log(`Maintain, disposed resource: ${JSON.stringify(p.data)}`);
        nuke.push(p);
      } else if (p.isExpiredFromUsers) {
        this.log.log(`Maintain, expired resource: ${JSON.stringify(p.data)}`);
        nuke.push(p);
      }
    }

    // Remove them
    if (nuke.length > 0) {
      for (const res of nuke) {
        res.dispose(`diposed/expired`);
      }
      changed = true;
    }

    // Find 'users' to clean up
    const userKeysToRemove:string[] = [];
    for (const [key, user] of this._users.entries()) {
      if (!user.isValid) {
        this.log.log(`Maintain. Invalid user: ${user.key} (Disposed: ${user.isDisposed} Expired: ${user.isExpired} Resource disposed: ${user.resource.isDisposed})`);

        userKeysToRemove.push(key);
        user._dispose(`invalid`);
      }
    }

    for (const userKey of userKeysToRemove) {
      this._users.delete(userKey);
      changed = true;
    }

    if (changed) {
      this.log.log(`End: resource len: ${this.resources.length} users: ${this.usersLength}`);
    }
  }

  /**
   * Iterate over resources in the pool.
   * To iterate over the data associated with each resource, use
   * `values`.
   */
  *resources() {
    const res = [...this._resources];
    for (const r of res) {
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
    const res = [...this._resources];
    for (const r of res) {
      yield r.data;
    }
  }
  
  /**
   * Unassociate a key with a pool item
   * @param userKey 
   */
  release(userKey:string, reason?:string):void {
    const pi = this._users.get(userKey);
    if (!pi) return;
    pi.release(reason ?? `Pool.release`);
  }

  /**
  * @internal
  * @param user 
  */
  _release(user:PoolUser<V>) {
    this._users.delete(user.key);
  }

  /**
   * @internal
   * @param resource
   * @param _ 
   */
  _releaseResource(resource:Resource<V>, _:string) {
    this._resources = this._resources.filter(v => v !== resource);
  }

  hasResource(res:V):boolean {
    const found =  this._resources.find(v => v.data === res);
    return found !== undefined;
  }

  hasUser(userKey:string):boolean {
    return this._users.has(userKey);
  }

  /**
   * @internal
   * @param key 
   * @param resource 
   * @returns 
   */
  private _assign(key:string, resource:Resource<V>) {
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
  private _find(userKey:string):Resource<V>|undefined {
    // Sort items by number of users per pool item
    const sorted = this.getResourcesSortedByUse();
    //eslint-disable-next-line functional/no-let
    // for (let i=0;i<sorted.length;i++) {
    //   console.log(i +`. users: ` + sorted[i].usersCount);
    // }
    if (sorted.length > 0 && sorted[0].hasUserCapacity) {
      // No problem, resource has capacity
      this.log.log(`resource has capacity: ${sorted[0].data}`);
      const u = this._assign(userKey, sorted[0]);
      return u.resource;
    }
  
    // If resource count is below capacity, can we generate more?
    if (this.generateResource && (this.capacity < 0  || this.resources.length < this.capacity)) {
      const newResource = this.addResource(this.generateResource());
      this._assign(userKey, newResource);
      return newResource;
    }
  }

  get usersLength() {
    return [...this._users.values()].length;
  }

  useValue(userKey:string):V {
    const res = this.use(userKey);
    return res.data;
  }

  /**
   * Gets a pool item based on a user key.
   * The same key should return the same pool item,
   * for as long as it still exists.
   * @param userKey 
   * @returns 
   */
  use(userKey:string):Resource<V> {
    const pi = this._users.get(userKey);
    if (pi) {
      pi.keepAlive();
      return pi.resource;
    }
    
    this.maintain();

    const match = this._find(userKey);
    if (match) return match;

    // Throw an error if all items are being used
    if (this.fullPolicy === `error`) {
      console.log(this.dumpToString());
      throw new Error(`Pool is fully used (fullPolicy: ${this.fullPolicy}, capacity: ${this.capacity})`);
    }
    // Evict oldest user
    if (this.fullPolicy === `evictOldestUser`) {
      const users = this.getUsersByLongestElapsed();
      if (users.length > 0) {
        this.release(users[0].key, `evictedOldestUser`);

        const match2 = this._find(userKey);
        if (match2) return match2;
      }
    }

    // Evict newest user

    // Evict from random pool item
    throw new Error(`Pool is fully used (${this.fullPolicy})`);
  }
}

