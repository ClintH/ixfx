import {
  createOrResolve,
  type MarkerOpts,
  createEl,
  type DrawingOpts,
  applyOpts,
} from './Svg.js';

export const createMarker = (
  id: string,
  opts: MarkerOpts,
  childCreator?: () => SVGElement
): SVGMarkerElement => {
  const m = createEl<SVGMarkerElement>(`marker`, id);

  if (opts.markerWidth) {
    m.setAttribute(`markerWidth`, opts.markerWidth?.toString());
  }
  if (opts.markerHeight) {
    m.setAttribute(`markerHeight`, opts.markerHeight?.toString());
  }
  if (opts.orient) m.setAttribute(`orient`, opts.orient.toString());
  else m.setAttribute(`orient`, `auto-start-reverse`);

  if (opts.viewBox) m.setAttribute(`viewBox`, opts.viewBox.toString());
  if (opts.refX) m.setAttribute(`refX`, opts.refX.toString());
  if (opts.refY) m.setAttribute(`refY`, opts.refY.toString());

  if (childCreator) {
    const c = childCreator();
    m.appendChild(c);
  }
  return m;
};

export const markerPrebuilt = (
  elem: SVGElement | null,
  opts: MarkerOpts,
  _context: DrawingOpts
): string => {
  if (elem === null) return `(elem null)`;

  const parent = elem.ownerSVGElement;
  if (parent === null) throw new Error(`parent for elem is null`);
  const defsEl = createOrResolve<SVGDefsElement>(parent, `defs`, `defs`);

  //eslint-disable-next-line functional/no-let
  let defEl = defsEl.querySelector(`#${opts.id}`) as SVGElement | null;

  if (defEl !== null) {
    return `url(#${opts.id})`;
  }

  if (opts.id === `triangle`) {
    opts = { ...opts, strokeStyle: `transparent` };
    if (!opts.markerHeight) opts = { ...opts, markerHeight: 6 };
    if (!opts.markerWidth) opts = { ...opts, markerWidth: 6 };
    if (!opts.refX) opts = { ...opts, refX: opts.markerWidth };
    if (!opts.refY) opts = { ...opts, refY: opts.markerHeight };
    if (!opts.fillStyle || opts.fillStyle === `none`) {
      opts = { ...opts, fillStyle: `black` };
    }
    if (!opts.viewBox) opts = { ...opts, viewBox: `0 0 10 10` };

    defEl = createMarker(opts.id, opts, () => {
      const tri = createEl<SVGPathElement>(`path`);
      tri.setAttribute(`d`, `M 0 0 L 10 5 L 0 10 z`);
      if (opts) applyOpts(tri, opts);
      return tri;
    });
  } else throw new Error(`Do not know how to make ${opts.id}`);

  //eslint-disable-next-line functional/immutable-data
  defEl.id = opts.id;
  defsEl.appendChild(defEl);

  return `url(#${opts.id})`;
};
