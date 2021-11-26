import * as Envelope from './Envelope.js';
import * as Bezier from '../geometry/Bezier.js';
import * as Line from '../geometry/Line.js';
import {Paths} from '../index.js';

export type DadsrEnvelopeOpts = Envelope.StageOpts & {

  /**
   * Sustain level from 0-1
   *
   * @type {number}
   */
  sustainLevel?: number
  /**
   * Attack bezier 'bend'
   *
   * @type {number} Bend from -1 to 1. 0 for a straight line
   */
  attackBend?: number
  /**
   * Decay bezier 'bend'
   *
   * @type {number} Bend from -1 to 1. 0 for a straight line
   */
  decayBend?: number
  /**
   * Release bezier 'bend'
   *
   * @type {number} Bend from -1 to 1. 0 for a straight line
   */
  releaseBend?: number
}
/**
 * Create a 'dadsr' (delay, attack, decay, sustain, release) envelope
 *
 * @param {DadsrEnvelopeOpts} opts Options for envelope
 * @returns {Readonly<Envelope.Envelope>} Envelope
 */
export const dadsr = (opts: DadsrEnvelopeOpts): Readonly<Envelope.Envelope> => {

  const {sustainLevel = 0.5, attackBend = 0, decayBend = 0, releaseBend = 0} = opts;
  if (sustainLevel > 1 || sustainLevel < 0) throw Error('sustainLevel must be between 0-1');

  // Create envelope
  const env = Envelope.stages(opts);
  const max = 1;

  // Create and assign beziers for each bendable segment
  const paths: Paths.Path[] = new Array<Paths.Path>(5);
  paths[Envelope.Stage.Attack] = Bezier.quadraticSimple({x: 0, y: 0}, {x: max, y: max}, attackBend);;
  paths[Envelope.Stage.Decay] = Bezier.quadraticSimple({x: 0, y: max}, {x: max, y: sustainLevel}, decayBend);
  paths[Envelope.Stage.Sustain] = Line.fromPoints({x: 0, y: sustainLevel}, {x: max, y: sustainLevel});
  paths[Envelope.Stage.Release] = Bezier.quadraticSimple({x: 0, y: sustainLevel}, {x: max, y: 0}, releaseBend);

  return Object.freeze({
    getBeziers: () => [...paths],
    trigger: () => {
      env.trigger();
    },
    reset: () => {
      env.reset();
    },
    release: () => {
      env.release();
    },
    hold: () => {
      env.hold();
    },
    compute: (): [Envelope.Stage, number] => {
      const [stage, amt] = env.compute();
      const p = paths[stage];
      if (p === null || p === undefined) return [stage, 0];
      return [stage, p.compute(amt).y];
    }
  });
};