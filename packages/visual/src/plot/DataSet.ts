import { MapOfSimpleMutable } from "@ixfx/collections";

export class DataSet<TValue, TSeriesMeta> {
  #data: MapOfSimpleMutable<TValue>;
  #meta: Map<string, TSeriesMeta>;
  lastChange: number;

  constructor() {
    this.lastChange = performance.now();
    this.#data = new MapOfSimpleMutable<TValue>();
    this.#meta = new Map<string, TSeriesMeta>();
  }

  get metaCount(): number {
    return this.#meta.size;
  }

  clear(): void {
    this.#data.clear();
    this.lastChange = performance.now();
  }

  set(series: string, data: TValue[]): void {
    this.#data.setValues(series, data);
  }

  deleteBySeries(series: string): boolean {
    const changed = this.#data.delete(series);
    if (changed) {
      this.lastChange = performance.now();
    }
    return changed;
  }

  setMeta(series: string, meta: TSeriesMeta): void {
    this.#meta.set(series, meta);
  }

  hasMeta(series: string): boolean {
    return this.#meta.has(series);
  }

  getMeta(series: string): TSeriesMeta | undefined {
    return this.#meta.get(series);
  }

  *getValues(): Generator<TValue, void, any> {
    yield* this.#data.valuesFlat();
  }

  *getEntries(): Generator<[ key: string, value: TValue[] ], void, any> {
    yield* this.#data.entries();
  }

  *getSeries(): Generator<readonly TValue[], void, any> {
    yield* this.#data.values();
  }

  add(value: TValue, series = `default`): void {
    this.#data.addKeyedValues(series, value);
    this.lastChange = performance.now();
  }
}