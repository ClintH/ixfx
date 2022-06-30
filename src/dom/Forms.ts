import {resolveEl} from "./Util.js";

/**
 * Adds tab and shift+tab to TEXTAREA
 * @param el 
 */
export const textAreaKeyboard = (el:HTMLTextAreaElement) => {

  el.addEventListener(`keydown`, evt => {
    const val = el.value;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (evt.key === `Tab` && evt.shiftKey) {
      if (el.value.substring(start - 2, start) === `  `) {
        //eslint-disable-next-line functional/immutable-data
        el.value = val.substring(0, start - 2) + val.substring(end);
      }
      //eslint-disable-next-line functional/immutable-data
      el.selectionStart = el.selectionEnd = start - 2;
      evt.preventDefault();
      return false;
    } else if (evt.key === `Tab`) {
      //eslint-disable-next-line functional/immutable-data
      el.value = val.substring(0, start) + `  ` + val.substring(end);
      //eslint-disable-next-line functional/immutable-data
      el.selectionStart = el.selectionEnd = start + 2;
      evt.preventDefault();
      return false;
    }
  
  });
};

/**
 * Quick access to <input type="checkbox"> value.
 * Provide a checkbox by string id or object reference. If a callback is
 * supplied, it will be called when the checkbox changes value.
 * 
 * ```
 * const opt = checkbox(`#chkMate`);
 * opt.checked; // Gets/sets
 * 
 * const opt = checkbox(document.getElementById(`#chkMate`), newVal => {
 *  if (newVal) ...
 * });
 * ```
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

/**
 * Numeric INPUT
 * 
 * ```
 * const el = numeric(`#num`, (currentValue) => {
 *  // Called when input changes
 * })
 * ```
 * 
 * Get/set value
 * ```
 * el.value = 10;
 * ```
 * @param domIdOrEl 
 * @param onChanged 
 * @param live If true, event handler fires based on `input` event, rather than `change`
 * @returns 
 */
export const numeric = (domIdOrEl: string | HTMLInputElement, onChanged?:(currentVal:number) => void, live?:boolean) => {
  const el = resolveEl<HTMLInputElement>(domIdOrEl) as HTMLInputElement;
  const evt = live ? `change` : `input`;
  if (onChanged) {
    el.addEventListener(evt, () => {
      onChanged(parseInt(el.value));
    });
  }
  return {
    get value():number  {
      return parseInt(el.value);
    },
    set value(val:number) {
      // eslint-disable-next-line functional/immutable-data
      el.value = val.toString();
    }
  };
};

/**
 * SELECT options
 */
export type SelectOpts = {
  /**
   * Placeholder item
   */
  readonly placeholderOpt?:string
  /**
   * If true, a placeholder option 'Choose' is added to the list
   */
  readonly shouldAddChoosePlaceholder?:boolean
  /**
   * Item to choose after a selection is made
   */
  readonly autoSelectAfterChoice?:number
}

/**
 * Button
 * 
 * ```
 * const b = button(`#myButton`, () => {
 *  console.log(`Button clicked`);
 * });
 * ```
 * 
 * ```
 * b.click(); // Call the click handler
 * b.disabled = true / false;
 * ```
 * @param domQueryOrEl Query string or element instance
 * @param onClick Callback when button is clicked 
 * @returns 
 */
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
 * SELECT handler
 */
export interface SelectHandler {
  /** 
   * Gets/Sets disabled
   */
  set disabled(value:boolean);

  get disabled():boolean;
/**
 * Gets value
 */
  get value():string;
/**
 * Sets selected index
 */
  get index():number;
/**
 * _True_ if currently selected item is the placeholder
 */
  get isSelectedPlaceholder():boolean;
/**
 * Set options
 * @param opts Options
 * @param preSelect Item to preselect
 */
  setOpts(opts:readonly string[], preSelect?:string):void;
/**
 * Select item by index 
 * @param index Index
 * @param trigger If true, triggers change event
 */
  select(index?:number, trigger?:boolean):void
}

/**
 * SELECT element.
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
 * @param domQueryOrEl Query (eg `#id`) or element
 * @param onChanged Callback when a selection is made
 * @param opts Options
 * @return  
 */
export const select = (domQueryOrEl:string|HTMLSelectElement, onChanged?:(currentVal:string) => void, opts:SelectOpts = {}):SelectHandler => {
  const el = resolveEl(domQueryOrEl) as HTMLSelectElement;
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