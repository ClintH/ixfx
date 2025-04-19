import { resolveEl } from './resolve-el.js';


/**
 * Adds tab and shift+tab to TEXTAREA
 * @param el
 */
export const textAreaKeyboard = (el: HTMLTextAreaElement) => {
  el.addEventListener(`keydown`, (event) => {
    const elementValue = el.value;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (event.key === `Tab` && event.shiftKey) {

      if (el.value.substring(start - 2, start) === `  `) {
        el.value = elementValue.slice(0, Math.max(0, start - 2)) + elementValue.slice(Math.max(0, end));
      }
      el.selectionStart = el.selectionEnd = start - 2;
      event.preventDefault();
      return false;
    } else if (event.key === `Tab`) {
      el.value = elementValue.slice(0, Math.max(0, start)) + `  ` + elementValue.slice(Math.max(0, end));
      el.selectionStart = el.selectionEnd = start + 2;
      event.preventDefault();
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
export const checkbox = (
  domIdOrEl: string | HTMLInputElement,
  onChanged?: (currentValue: boolean) => void
) => {
  const el = resolveEl<HTMLInputElement>(domIdOrEl);

  if (onChanged) {
    el.addEventListener(`change`, () => {
      onChanged(el.checked);
    });
  }
  return {
    get checked(): boolean {
      return el.checked;
    },
    set checked(value: boolean) {
      el.checked = value;
    },
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
export const numeric = (
  domIdOrEl: string | HTMLInputElement,
  onChanged?: (currentValue: number) => void,
  live?: boolean
) => {
  const el = resolveEl<HTMLInputElement>(domIdOrEl);
  const eventName = live ? `change` : `input`;
  if (onChanged) {
    el.addEventListener(eventName, () => {
      onChanged(Number.parseInt(el.value));
    });
  }
  return {
    get value(): number {
      return Number.parseInt(el.value);
    },
    set value(value: number) {
      el.value = value.toString();
    },
  };
};

/**
 * SELECT options
 */
export type SelectOpts = {
  /**
   * Placeholder item
   */
  readonly placeholderOpt?: string;
  /**
   * If true, a placeholder option 'Choose' is added to the list
   */
  readonly shouldAddChoosePlaceholder?: boolean;
  /**
   * Item to choose after a selection is made
   */
  readonly autoSelectAfterChoice?: number;
};

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
 * @param onClickHandler Callback when button is clicked
 * @returns
 */
export const button = (
  domQueryOrEl: string | HTMLButtonElement,
  onClickHandler?: () => void
) => {
  const el = resolveEl(domQueryOrEl);

  const addEvent = () => {
    if (onClickHandler) {
      el.addEventListener(`click`, onClickHandler);
    }
  }

  const removeEvent = () => {
    if (onClickHandler) {
      el.removeEventListener(`click`, onClickHandler)
    }
  }

  addEvent();

  return {
    /**
     * Gets text content of button
     */
    get title(): string | null {
      return el.textContent;
    },
    /**
     * Sets text content of button
     */
    set title(value: string) {
      el.textContent = value;
    },
    /**
     * Disposes the button.
     * Removes event handler and optionally removes from document
     * @param deleteElement 
     */
    dispose(deleteElement = false) {
      removeEvent();
      if (deleteElement) el.remove();
    },
    /**
     * Sets the click handler, overwriting existing.
     * @param handler 
     */
    onClick(handler?: () => void) {
      removeEvent();
      onClickHandler = handler;
      addEvent();
    },
    /**
     * Trigger onClick handler
     */
    click() {
      if (onClickHandler) onClickHandler();
    },
    /**
     * Sets disabled state of button
     */
    set disabled(value: boolean) {
      el.disabled = value;
    },
    /**
     * Gets the button element
     */
    get el(): HTMLButtonElement {
      return el
    }
  };
};

/**
 * Creates a BUTTON element, wrapping it via {@link button} and returning it.
 * ```js
 * const b = buttonCreate(`Stop`, () => console.log(`Stop`));
 * someParent.addNode(b.el);
 * ```
 * @param title 
 * @param onClick 
 * @returns 
 */
export const buttonCreate = (title: string, onClick?: () => void) => {
  const el = document.createElement(`button`);
  const w = button(el, onClick);
  w.title = title;
  return w;
}

/**
 * SELECT handler
 */
export type SelectHandler = {
  /**
   * Gets/Sets disabled
   */
  set disabled(value: boolean);

  get disabled(): boolean;
  /**
   * Gets value
   */
  get value(): string;
  /**
   * Sets selected index
   */
  get index(): number;
  /**
   * _True_ if currently selected item is the placeholder
   */
  get isSelectedPlaceholder(): boolean;
  /**
   * Set options
   * @param options Options
   * @param preSelect Item to preselect
   */
  setOpts(options: readonly string[], preSelect?: string): void;
  /**
   * Select item by index
   * @param index Index
   * @param trigger If true, triggers change event
   */
  select(index?: number, trigger?: boolean): void;
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
 * @param options Options
 * @return
 */
export const select = (
  domQueryOrEl: string | HTMLSelectElement,
  onChanged?: (currentValue: string) => void,
  options: SelectOpts = {}
): SelectHandler => {
  const el = resolveEl(domQueryOrEl);
  const {
    placeholderOpt,
    shouldAddChoosePlaceholder = false,
    autoSelectAfterChoice = -1,
  } = options;

  const change = () => {
    if (onChanged !== undefined) onChanged(el.value);
    if (autoSelectAfterChoice >= 0) el.selectedIndex = autoSelectAfterChoice;
  };

  if (onChanged) {
    el.addEventListener(`change`, (_event) => {
      change();
    });
  }
  return {
    set disabled(value: boolean) {
      el.disabled = value;
    },
    get value(): string {
      return el.value;
    },
    get index(): number {
      return el.selectedIndex;
    },
    get isSelectedPlaceholder(): boolean {
      return (
        (shouldAddChoosePlaceholder || options.placeholderOpt !== undefined) &&
        el.selectedIndex === 0
      );
    },
    setOpts(opts: string[], preSelect?: string): void {
      el.options.length = 0;

      if (shouldAddChoosePlaceholder) opts = [ `-- Choose --`, ...opts ];
      else if (placeholderOpt !== undefined) opts = [ placeholderOpt, ...opts ];
      let toSelect = 0;

      for (const [ index, o ] of opts.entries()) {
        const optEl = document.createElement(`option`);
        optEl.value = o;
        optEl.innerHTML = o;
        if (preSelect !== undefined && o === preSelect) toSelect = index;
        el.options.add(optEl);
      }
      el.selectedIndex = toSelect;
    },
    select(index = 0, trigger = false): void {
      el.selectedIndex = index;
      if (trigger && onChanged) {
        change();
      }
    },
  };
};
