export const remove = <V extends SVGElement>(
  parent: SVGElement,
  queryOrExisting: string | V
) => {
  if (typeof queryOrExisting === `string`) {
    const elem = parent.querySelector(queryOrExisting);
    if (elem === null) return;
    elem.remove();
  } else {
    queryOrExisting.remove();
  }
};

export const clear = (parent: SVGElement) => {
  let c = parent.lastElementChild;
  while (c) {
    c.remove();
    c = parent.lastElementChild;
  }
};