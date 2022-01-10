export const checkbox = (domIdOrEl: string | HTMLInputElement, onChanged?:(currentVal:boolean) => void) => {
  if (typeof domIdOrEl === `string`) {
    const d = document.getElementById(domIdOrEl);
    if (d ===null) throw new Error(`Id ${domIdOrEl} not found`);
    domIdOrEl = d as HTMLInputElement;
  } else if (domIdOrEl === null) throw new Error(`domIdOrEl is null`);
  else if (domIdOrEl === undefined) throw new Error(`domIdOrEl is undefined`);
  
  const el = domIdOrEl as HTMLInputElement;

  if (onChanged) {
    el.addEventListener(`change`, () => {
      onChanged(el.checked);
    });
  }
  return {
    get checked():boolean  {
      return el.checked;
    }
  };
};