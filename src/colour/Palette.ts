export class Palette {
  store:Map<string, string> = new Map();
  default = `black`;

  add(key:string, colour:string) {
    this.store.set(key, colour);
  }

  get(key:string):string {
    let c = this.store.get(key);
    if (c === undefined) {
      const varName = `--` + key;
      c = getComputedStyle(document.body).getPropertyValue(varName).trim();
      this.add(varName, c);
    }
    return c;
  }
}

// export const fromVariables = (...vars: string[]) => {
//   const p = new Palette();
//   vars.forEach(v=> {
//     const key = v.substring(2);
//     p.add(key, getComputedStyle(document.body).getPropertyValue(v));
//   });
//   return p;
// };