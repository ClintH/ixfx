import { getErrorMessage } from "@ixfxfun/debug";

/**
 * Creates an error handler to show errors on-screen.
 * This is useful when testing on mobile devices that lack access to the console.
 *
 * ```js
 * const e = defaultErrorHandler();
 * ```
 *
 * Manual control:
 * ```js
 * const e = defaultErrorHandler();
 * e.show(someError);
 * e.hide();
 * ```
 * @returns
 */
export const defaultErrorHandler = () => {
  //eslint-disable-next-line functional/no-let
  let enabled = true;
  const container = document.createElement(`div`);
  container.style.color = `black`;
  container.style.border = `2px solid red`;
  container.style.backgroundColor = `hsl(0, 80%, 90%)`;
  container.style.padding = `1em`;
  container.style.display = `none`;
  container.style.top = `1em`;
  container.style.left = `1em`;
  container.style.position = `absolute`;

  container.style.fontFamily = `monospace`;

  const messageElement = document.createElement(`div`);
  messageElement.style.maxWidth = `50vw`;
  messageElement.style.maxHeight = `50vh`;
  messageElement.style.overflowY = `scroll`;

  container.innerHTML = `<h1>Error</h1>`;
  container.append(messageElement);

  const styleButton = (b: HTMLButtonElement) => {
    b.style.padding = `0.3em`;
    b.style.marginTop = `1em`;
  };

  const buttonClose = document.createElement(`button`);
  buttonClose.textContent = `Close`;
  buttonClose.addEventListener(`click`, () => {
    hide();
  });

  const buttonStop = document.createElement(`button`);
  buttonStop.textContent = `Stop displaying errors`;
  buttonStop.addEventListener(`click`, () => {
    enabled = false;
    hide();
  });

  styleButton(buttonClose);
  styleButton(buttonStop);

  container.append(buttonClose);
  container.append(buttonStop);
  document.body.append(container);

  const show = (ex: Error | string | Event) => {
    container.style.display = `inline`;
    messageElement.innerHTML += (ex as any).stack ? `<pre>${ (ex as any).stack }</pre>` : `<p>${ getErrorMessage(ex) }</p>`;
  };

  const hide = () => {
    container.style.display = `none`;
  };

  // eslint-disable-next-line unicorn/prefer-add-event-listener
  window.onerror = (message, url, lineNo, colNo, error) => {
    if (enabled) {
      if (error) {
        console.log(error);
        show(error);
      } else {
        console.log(message);
        show(message);
      }
    }
  };

  window.addEventListener(`unhandledrejection`, (event) => {
    console.log(event.reason);
    if (enabled) {
      show(event.reason);
    }
  });
  return { show, hide };
};
