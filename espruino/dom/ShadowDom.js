"use strict";
exports.__esModule = true;
exports.addShadowCss = void 0;
var addShadowCss = function (parentEl, styles) {
    var styleEl = document.createElement("style");
    styleEl.textContent = styles;
    var shadowRoot;
    if (parentEl.shadowRoot) {
        shadowRoot = parentEl.shadowRoot;
        shadowRoot.innerHTML = "";
    }
    else {
        shadowRoot = parentEl.attachShadow({ mode: "open" });
    }
    shadowRoot.appendChild(styleEl);
    return shadowRoot;
};
exports.addShadowCss = addShadowCss;
//# sourceMappingURL=ShadowDom.js.map