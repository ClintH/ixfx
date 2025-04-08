import {type Rect } from '@ixfxfun/geometry/rect';
/**
 * Get the bounds of an SVG element (determined by its width/height attribs)
 * @param svg
 * @returns
 */
export const getBounds = (svg: SVGElement): Rect => {
  const w = svg.getAttributeNS(null, `width`);
  const width = w === null ? 0 : Number.parseFloat(w);
  const h = svg.getAttributeNS(null, `height`);
  const height = h === null ? 0 : Number.parseFloat(h);
  return { width, height };
};

/**
 * Set the bounds of an element, using its width/height attribs.
 * @param svg
 * @param bounds
 */
export const setBounds = (svg: SVGElement, bounds: Rect): void => {
  svg.setAttributeNS(null, `width`, bounds.width.toString());
  svg.setAttributeNS(null, `height`, bounds.height.toString());
};