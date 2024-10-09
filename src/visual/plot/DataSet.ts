import { MapOfSimpleMutable } from "../../collections/index.js";

export class DataSet<TValue, TSeriesMeta> {
  #data;
  #meta;
  lastChange;

  constructor() {
    this.lastChange = performance.now();
    this.#data = new MapOfSimpleMutable<TValue>();

    this.#meta = new Map<string, TSeriesMeta>();
  }

  get metaCount() {
    return this.#meta.size;
  }

  clear() {
    this.#data.clear();
    this.lastChange = performance.now();
  }

  set(series: string, data: Array<TValue>) {
    this.#data.setValues(series, data);
  }

  deleteBySeries(series: string) {
    const changed = this.#data.delete(series);
    if (changed) {
      this.lastChange = performance.now();
    }
    return changed;
  }

  setMeta(series: string, meta: TSeriesMeta) {
    this.#meta.set(series, meta);
  }

  hasMeta(series: string) {
    return this.#meta.has(series);
  }

  getMeta(series: string) {
    return this.#meta.get(series);
  }

  *getValues() {
    yield* this.#data.valuesFlat();
  }

  *getEntries() {
    yield* this.#data.entries();
  }

  *getSeries() {
    yield* this.#data.values();
  }

  add(value: TValue, series = `default`) {
    this.#data.addKeyedValues(series, value);
    this.lastChange = performance.now();
  }
}