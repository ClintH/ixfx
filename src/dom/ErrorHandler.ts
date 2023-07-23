/* eslint-disable */

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

  const msgEl = document.createElement(`div`);
  msgEl.style.maxWidth = `50vw`;
  msgEl.style.maxHeight = `50vh`;
  msgEl.style.overflowY = `scroll`;

  container.innerHTML = `<h1>Error</h1>`;
  container.append(msgEl);

  const styleButton = (b: HTMLButtonElement) => {
    b.style.padding = `0.3em`;
    b.style.marginTop = `1em`;
  };

  const btnClose = document.createElement(`button`);
  btnClose.innerText = `Close`;
  btnClose.onclick = () => {
    hide();
  };

  const btnStop = document.createElement(`button`);
  btnStop.innerText = `Stop displaying errors`;
  btnStop.onclick = () => {
    enabled = false;
    hide();
  };

  styleButton(btnClose);
  styleButton(btnStop);

  container.append(btnClose);
  container.append(btnStop);
  document.body.append(container);

  const show = (ex: Error | string | Event) => {
    container.style.display = `inline`;
    if ((ex as any).stack) {
      msgEl.innerHTML += `<pre>${(ex as any).stack}</pre>`;
    } else {
      msgEl.innerHTML += `<p>${ex}</p>`;
    }
  };

  const hide = () => {
    container.style.display = `none`;
  };

  window.onerror = (msg, url, lineNo, colNo, error) => {
    if (enabled) {
      if (error) {
        console.log(error);
        show(error);
      } else {
        console.log(msg);
        show(msg);
      }
    }
  };

  window.addEventListener(`unhandledrejection`, (e) => {
    console.log(e.reason);
    if (enabled) {
      show(e.reason);
    }
  });
  return { show, hide };
};
