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
      // eslint-disable-next-line functional/immutable-data
      el.checked = val;
    }
  };
};


export const numeric = (domIdOrEl: string | HTMLInputElement, onChanged?:(currentVal:number) => void) => {
  const el = resolveEl<HTMLInputElement>(domIdOrEl) as HTMLInputElement;

  if (onChanged) {
    el.addEventListener(`change`, () => {
      onChanged(parseInt(el.value));
    });
  }
  return {
    get value():number  {
      return parseInt(el.value);
    },
    set checked(val:number) {
      // eslint-disable-next-line functional/immutable-data
      el.value = val.toString();
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
  /**
   * If true, a placeholder option 'Choose' is added to the list
   *
   * @type {boolean}
   */
  readonly shouldAddChoosePlaceholder?:boolean
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
    set disabled(val:boolean) {
      // eslint-disable-next-line functional/immutable-data
      el.disabled = val;
    },
  };
};


/**
 * Convienence wrapper for a SELECT element.
 * 
 * Handle changes in value:
 * ```
 * const mySelect = select(`#mySelect`, (newValue) => {
 *  console.log(`Value is now ${newValue}`);
 * });
 * ```
 *
 * Enable/disable:
 * ```
 * mySelect.disabled = true / false;
 * ```
 * 
 * Get currently selected index or value:
 * ```
 * mySelect.value / mySelect.index
 * ```
 * 
 * Is the currently selected value a placeholder?
 * ```
 * mySelect.isSelectedPlaceholder
 * ```
 * 
 * Set list of options
 * ```
 * // Adds options, preselecting `opt2`.
 * mySelect.setOpts([`opt1`, `opt2 ...], `opt2`);
 * ```
 * 
 * Select an element
 * ```
 * mySelect.select(1); // Select second item
 * mySelect.select(1, true); // If true is added, change handler fires as well
 * ```
 * @param {(string|HTMLSelectElement)} domIdOrEl
 * @param {(currentVal:string) => void} [onChanged]
 * @param {SelectOpts} [opts={}]
 * @return {*} 
 */
export const select = (domIdOrEl:string|HTMLSelectElement, onChanged?:(currentVal:string) => void, opts:SelectOpts = {}) => {
  const el = resolveEl(domIdOrEl) as HTMLSelectElement;
  const {placeholderOpt, shouldAddChoosePlaceholder = false, autoSelectAfterChoice = -1} = opts;

  const change = () => {
    if (onChanged !== undefined) onChanged(el.value);
    // eslint-disable-next-line functional/immutable-data
    if (autoSelectAfterChoice >= 0) el.selectedIndex = autoSelectAfterChoice;
  };

  if (onChanged) {
    el.addEventListener(`change`, (_ev) => {
      change();
    });
  }
  return {
    set disabled(val:boolean) {
      // eslint-disable-next-line functional/immutable-data
      el.disabled = val;
    },
    get value():string {
      return el.value;
    },
    get index():number {
      return el.selectedIndex;
    },
    get isSelectedPlaceholder():boolean {
      return ((shouldAddChoosePlaceholder || opts.placeholderOpt !== undefined) && el.selectedIndex === 0);
    },
    setOpts(opts:string[], preSelect?:string):void {
      // eslint-disable-next-line functional/immutable-data
      el.options.length = 0;
      
      if (shouldAddChoosePlaceholder) opts = [`-- Choose --`, ...opts];
      else if (placeholderOpt !== undefined) opts = [placeholderOpt, ...opts];
      // eslint-disable-next-line functional/no-let
      let toSelect = 0;
      
      opts.forEach((o, index) => {
        const optEl = document.createElement(`option`);
        // eslint-disable-next-line functional/immutable-data
        optEl.value = o;
        // eslint-disable-next-line functional/immutable-data
        optEl.innerHTML = o;
        if (preSelect !== undefined && o === preSelect) toSelect = index;
        el.options.add(optEl);
      });
      // eslint-disable-next-line functional/immutable-data
      el.selectedIndex = toSelect;
    },
    select(index:number = 0, trigger:boolean = false):void {
      // eslint-disable-next-line functional/immutable-data
      el.selectedIndex = index;
      if (trigger && onChanged) {
        change();
      } 
    }
  };
};