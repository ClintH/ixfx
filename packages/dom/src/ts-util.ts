/* eslint-disable unicorn/prevent-abbreviations */
export function isHtmlElement(o: any): o is HTMLElement {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
      o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
  );
}