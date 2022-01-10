/**
 * Quick access to <input type="checkbox"> value.
 * Provide a checkbox by string id or object reference. If a callback is
 * supplied, it will be called when the checkbox changes value.
 * 
 * ```
 * const opt = checkbox(`chkMate`);
 * opt.checked; // Returns current state
 * 
 * const opt = checkbox(document.getElementById(`chkMate`), (newVal) => {
 *  if (newVal) ...
 * });
 *
 * @param {(string | HTMLInputElement)} domIdOrEl
 * @param {(currentVal:boolean) => void} [onChanged]
 * @returns
 */
export const checkbox = (domIdOrEl: string | HTMLInputElement, onChanged?:(currentVal:boolean) => void) => {
  const el = resolveEl<HTMLInputElement>(domIdOrEl);

  if (onChanged) {
    el.addEventListener(`change`, () => {
      onChanged(el.checked);
    });
  }
  return {
    get checked():boolean  {
      return el.checked;
    },
    set checked(val:boolean) {
      el.checked = val;
    }
  };
};

const resolveEl = <V extends HTMLElement>(domIdOrEl:string|V):V => {
  if (typeof domIdOrEl === `string`) {
    const d = document.getElementById(domIdOrEl);
    if (d === null) throw new Error(`Id ${domIdOrEl} not found`);
    domIdOrEl = d as V;
  } else if (domIdOrEl === null) throw new Error(`domIdOrEl is null`);
  else if (domIdOrEl === undefined) throw new Error(`domIdOrEl is undefined`);
  
  const el = domIdOrEl as V;
  return el;
};

type SelectOpts = {
  placeholderOpt?:string
  placeholderChoose?:boolean
  autoSelectAfterChoice?:number
}

export const button = (domIdOrEl:string|HTMLButtonElement, onClick?:() => void) => {
  const el = resolveEl(domIdOrEl) as HTMLButtonElement;

  if (onClick) {
    el.addEventListener(`click`, (_ev) => {
      onClick();
    });
  }

  return {
    click() {
      if (onClick) onClick();
    }
  };
};

export const select = (domIdOrEl:string|HTMLSelectElement, onChanged?:(currentVal:string) => void, opts:SelectOpts = {}) => {
  const el = resolveEl(domIdOrEl) as HTMLSelectElement;
  const {placeholderOpt, placeholderChoose = false, autoSelectAfterChoice = -1} = opts;

  const change = () => {
    if (onChanged !== undefined) onChanged(el.value);
    if (autoSelectAfterChoice >= 0) el.selectedIndex = autoSelectAfterChoice;
  };

  if (onChanged) {
    el.addEventListener(`change`, (_ev) => {
      change();
    });
  }
  return {
    set disabled(val:boolean) {
      el.disabled = val;
    },
    get value():string {
      return el.value;
    },
    get index():number {
      return el.selectedIndex;
    },
    get isSelectedPlaceholder():boolean {
      return ((opts.placeholderChoose || opts.placeholderOpt !== undefined) && el.selectedIndex === 0);
    },
    setOpts(opts:string[], preSelect?:string):void {
      el.options.length = 0;
      
      if (placeholderChoose) opts = [`-- Choose --`, ...opts];
      else if (placeholderOpt !== undefined) opts = [placeholderOpt, ...opts];
      let toSelect = 0;
      
      opts.forEach((o, index) => {
        const optEl = document.createElement(`option`);
        optEl.value = o;
        optEl.innerHTML = o;
        if (preSelect !== undefined && o === preSelect) toSelect = index;
        el.options.add(optEl);
      });
      el.selectedIndex = toSelect;
    },
    select(index:number = 0, trigger:boolean = false):void {
      el.selectedIndex = index;
      if (trigger && onChanged) {
        change();
      } 
    }
  };
};