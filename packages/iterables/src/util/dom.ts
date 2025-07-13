export function resolveEl(elOrQuery: string | HTMLElement): HTMLElement {
  if (typeof elOrQuery === `string`) {
    const el = document.querySelector(elOrQuery);
    if (!el) throw new Error(`Element not found '${ elOrQuery }'`);
    return el as HTMLElement;
  }
  return elOrQuery;
}