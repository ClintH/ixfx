import * as Envelopes from './Envelope.js';
import * as Beziers from '../geometry/Bezier.js';
import * as Lines from '../geometry/Line.js';
import {clamp} from '../util.js';

export type PathEnvelopeOpts = Envelopes.StageOpts & {
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

export const pathEnvelope = (opts: PathEnvelopeOpts): Readonly<Envelopes.Envelope> => {
  let {sustainLevel = 0.5, attackBend = 0, decayBend = 0, releaseBend = 0} = opts;
  sustainLevel = clamp(sustainLevel);

  let env = Envelopes.stages(opts);
  let max = 1;
  let attack = Beziers.quadraticSimple({x: 0, y: 0}, {x: max, y: max}, attackBend);
  let decay = Beziers.quadraticSimple({x: 0, y: max}, {x: max, y: sustainLevel}, decayBend);
  let sustain = Lines.fromPoints({x: 0, y: sustainLevel}, {x: max, y: sustainLevel});
  let release = Beziers.quadraticSimple({x: 0, y: sustainLevel}, {x: max, y: 0}, releaseBend);

  let paths = [
    null,
    attack,
    decay,
    sustain,
    release
  ]
  return Object.freeze({
    trigger: () => {
      env.trigger()
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
      let [stage, amt] = env.compute();
      let p = paths[stage];
      if (p == null) return [stage, 0];
      return [stage, p.compute(amt).y];
    }
  });

}