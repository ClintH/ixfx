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

export const resolveEl = <V extends HTMLElement>(domQueryOrEl:string|V):V => {
  if (typeof domQueryOrEl === `string`) {
    const d = document.querySelector(domQueryOrEl);
    if (d === null) throw new Error(`Id ${domQueryOrEl} not found`);
    domQueryOrEl = d as V;
  } else if (domQueryOrEl === null) throw new Error(`domQueryOrEl ${domQueryOrEl} is null`);
  else if (domQueryOrEl === undefined) throw new Error(`domQueryOrEl ${domQueryOrEl} is undefined`);
  
  const el = domQueryOrEl as V;
  return el;
};

type SelectOpts = {
  readonly placeholderOpt?:string
  readonly placeholderChoose?:boolean
  readonly autoSelectAfterChoice?:number
}

export const button = (domQueryOrEl:string|HTMLButtonElement, onClick?:() => void) => {
  const el = resolveEl(domQueryOrEl) as HTMLButtonElement;

  if (onClick) {
    el.addEventListener(`click`, (_ev) => {
      onClick();
    });
  }

  return {
    click() {
      if (onClick) onClick();
    },
    disable() {
      // eslint-disable-next-line functional/immutable-data
      el.disabled = true;
    },
    enable(value = true) {
      // eslint-disable-next-line functional/immutable-data
      el.disabled = !value;
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