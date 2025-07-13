import * as Named from './easings-named.js';
import { type Interval } from '@ixfx/core';
import type { ModulationFunction, ModulatorTimed } from '../types.js';
/**
 * Easing name
 */
export type EasingName = keyof typeof Named;

export type EasingOptions = (EasingTickOptions | EasingTimeOptions) & {
  name?: EasingName
  fn?: ModulationFunction
}

export type EasingTimeOptions = {
  duration: Interval
}
export type EasingTickOptions = {
  ticks: number
}