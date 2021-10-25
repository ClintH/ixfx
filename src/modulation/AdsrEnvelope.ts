import * as Envelopes from './Envelope.js';
import * as Beziers from '../geometry/Bezier.js';
import * as Lines from '../geometry/Line.js';

export type AdsrEnvelopeOpts = Envelopes.StageOpts & {
  /**
   * Sustain level from 0-1
   *
   * @type {number}
   */
  sustainLevel?: number;
  attackBend?: number;
  decayBend?: number;
  releaseBend?: number;
}

export const adsr = (opts: AdsrEnvelopeOpts): Readonly<Envelopes.Envelope> => {
  
  const {sustainLevel = 0.5, attackBend = 0, decayBend = 0, releaseBend = 0} = opts;
  if (sustainLevel > 1 || sustainLevel < 0) throw Error('sustainLevel must be between 0-1');

  const env = Envelopes.stages(opts);
  const max = 1;
  const attack = Beziers.quadraticSimple({x: 0, y: 0}, {x: max, y: max}, attackBend);
  const decay = Beziers.quadraticSimple({x: 0, y: max}, {x: max, y: sustainLevel}, decayBend);
  const sustain = Lines.fromPoints({x: 0, y: sustainLevel}, {x: max, y: sustainLevel});
  const release = Beziers.quadraticSimple({x: 0, y: sustainLevel}, {x: max, y: 0}, releaseBend);

  const paths = [
    null,
    attack,
    decay,
    sustain,
    release
  ];
  return Object.freeze({
    getBeziers: () => [attack, decay, sustain, release],
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
    compute: (): [Envelopes.EnvelopeStage, number] => {
      const [stage, amt] = env.compute();
      const p = paths[stage];
      if (p === null) return [stage, 0];
      return [stage, p.compute(amt).y];
    }
  });
};