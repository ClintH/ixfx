export const checkbox = (domIdOrEl: string | HTMLInputElement) => {
  if (typeof domIdOrEl === `string`) {
    const d = document.getElementById(domIdOrEl);
    if (d ===null) throw new Error(`Id ${domIdOrEl} not found`);
    domIdOrEl = d as HTMLInputElement;
  } else if (domIdOrEl === null) throw new Error(`domIdOrEl is null`);
  else if (domIdOrEl === undefined) throw new Error(`domIdOrEl is undefined`);
  
  const el = domIdOrEl as HTMLInputElement;

  return {
    get checked():boolean  {
      return el.checked;
    }
  };
};