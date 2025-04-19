import { shortGuid } from "@ixfx/random"
import { resolveEl } from "./resolve-el.js"

export type Panel<TNotifyArgs> = {
  mount: (parentEl: HTMLElement) => void
  dismount: () => void
  id: string
  label: string
  /**
   * Panel gets a notification
   * @param name 
   * @param args 
   * @returns 
   */
  notify?: (name: string, args: TNotifyArgs) => void
}

export const tabSet = <TNotifyArgs>(options: {
  panels: Panel<TNotifyArgs>[],
  parent: HTMLElement | string,
  preselectId?: string,
  onPanelChanging?: (priorPanel: Panel<TNotifyArgs> | undefined, newPanel: Panel<TNotifyArgs> | undefined) => boolean | void,
  onPanelChange?: (priorPanel: Panel<TNotifyArgs> | undefined, newPanel: Panel<TNotifyArgs> | undefined) => void
}) => {

  const panels = options.panels;
  const preselectId = options.preselectId ?? panels[ 0 ].id;
  const guid = `tabset-${ shortGuid() }`;
  const parentEl = resolveEl(options.parent);
  const switcher = `
  <div class="ixfx-tabset" id="${ guid }">
    <fieldset class="ixfx-tabset-controls">
    ${ panels.map(p => {
    const panelId = `${ guid }-${ p.id }-select`;
    return `<input type="radio" name="${ guid }-tabs" id="${ panelId }" data-tabset="${ p.id }"><label for="${ panelId }">${ p.label }</label>`
  }).join(``) }
    </fieldset>
    <div class="ixfx-tabset-host" id="${ guid }-host"></div>
  </div>
  `
  parentEl.innerHTML = switcher;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const hostEl = document.getElementById(`${ guid }-host`)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const tabSetEl = document.getElementById(guid)!;

  tabSetEl.querySelector(`fieldset`)?.addEventListener(`change`, event => {
    const el = event.target as HTMLInputElement;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    select(el.getAttribute(`data-tabset`)!);
  })

  let currentPanel: Panel<any> | undefined;

  const select = (id: string) => {
    const newPanel = panels.find(p => p.id === id);
    const priorPanel = currentPanel;

    if (options.onPanelChanging) {
      const allow = options.onPanelChanging(priorPanel, newPanel);
      if (typeof allow === `boolean` && !allow) return; // Cancel panel change
    }
    if (priorPanel) {
      priorPanel.dismount();
    }
    currentPanel = newPanel;
    if (newPanel) {
      newPanel.mount(hostEl);
      const domId = `#${ guid }-${ id }-select`;
      const inputEl = tabSetEl.querySelector(domId) as HTMLInputElement | undefined;
      if (inputEl) {
        inputEl.checked = true;
      } else {
        console.warn(`Could not find INPUT element for panel id: ${ id } (${ domId })`);
      }
    }
    if (options.onPanelChange) options.onPanelChange(priorPanel, newPanel);
  }

  select(preselectId);
  let warned = false;
  const notify = (name: string, args: TNotifyArgs) => {
    if (!currentPanel) return;
    if (currentPanel.notify) {
      currentPanel.notify(name, args);
    } else if (!warned) {
      warned = true;
      console.warn(`TabbedPanel.notify dropping notification '${ name }'. Panel implementation is missing 'notify' function`);
    }
  }

  return { select, panels, hostEl, tabSetEl, notify }
}