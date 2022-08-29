"use strict";
/* eslint-disable */
exports.__esModule = true;
exports.defaultErrorHandler = void 0;
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
var defaultErrorHandler = function () {
    //eslint-disable-next-line functional/no-let
    var enabled = true;
    var container = document.createElement("div");
    container.style.color = "black";
    container.style.border = "2px solid red";
    container.style.backgroundColor = "hsl(0, 80%, 90%)";
    container.style.padding = "1em";
    container.style.display = "none";
    container.style.top = "1em";
    container.style.left = "1em";
    container.style.position = "absolute";
    container.style.fontFamily = "monospace";
    var msgEl = document.createElement("div");
    msgEl.style.maxWidth = "50vw";
    msgEl.style.maxHeight = "50vh";
    msgEl.style.overflowY = "scroll";
    container.innerHTML = "<h1>Error</h1>";
    container.append(msgEl);
    var styleButton = function (b) {
        b.style.padding = "0.3em";
        b.style.marginTop = "1em";
    };
    var btnClose = document.createElement("button");
    btnClose.innerText = "Close";
    btnClose.onclick = function () {
        hide();
    };
    var btnStop = document.createElement("button");
    btnStop.innerText = "Stop displaying errors";
    btnStop.onclick = function () {
        enabled = false;
        hide();
    };
    styleButton(btnClose);
    styleButton(btnStop);
    container.append(btnClose);
    container.append(btnStop);
    document.body.append(container);
    var show = function (ex) {
        container.style.display = "inline";
        if (ex.stack) {
            msgEl.innerHTML += "<pre>".concat(ex.stack, "</pre>");
        }
        else {
            msgEl.innerHTML += "<p>".concat(ex, "</p>");
        }
    };
    var hide = function () {
        container.style.display = "none";
    };
    window.onerror = function (msg, url, lineNo, colNo, error) {
        if (enabled) {
            if (error) {
                console.log(error);
                show(error);
            }
            else {
                console.log(msg);
                show(msg);
            }
        }
    };
    window.addEventListener("unhandledrejection", function (e) {
        console.log(e.reason);
        if (enabled) {
            show(e.reason);
        }
    });
    return { show: show, hide: hide };
};
exports.defaultErrorHandler = defaultErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map