
export const create = (shape:string): SVGElement => {
  const el = document.createElementNS(`http://www.w3.org/2000/svg`, shape);

  return el;
};