import { p as proxyCustomElement, H, h } from './index.js';
import { d as defineCustomElement$2 } from './p-B0UZmkl0.js';
import { d as defineCustomElement$1 } from './p-BszEL0yL.js';

const StatusIndicator = /*@__PURE__*/ proxyCustomElement(class StatusIndicator extends H {
    constructor() {
        super();
        this.__registerHost();
    }
    status;
    render() {
        return h("div", { key: '7a8f05db2b0b76523f6188300488b397786e92cf', class: "ct" }, h("failure-indicator", { key: '72e9775e2980b3cb7b5d94083d7dc8642654ba2f', class: { 'visible': this.status === 'failure' } }), h("success-indicator", { key: 'aa4fd36d6616c1d7145fdc6ffeae8ae232d49b82', class: { 'visible': this.status === 'success' } }));
    }
    static get style() { return ".visible {\n       opacity: 1;\n     }\n\n     .status-container svg {\n       display: block;\n       width: 100%;\n       height: 100%;\n     }\n\n     .ct {\n      position: relative;\n      width: 20px;\n      height: 20px;\n     }\n\n     success-indicator,\n     failure-indicator {\n      position: absolute;\n      transition: opacity 0.2s ease;\n      opacity: 0;\n     }"; }
}, [0, "status-indicator", {
        "status": [1]
    }]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["status-indicator", "failure-indicator", "success-indicator"];
    components.forEach(tagName => { switch (tagName) {
        case "status-indicator":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, StatusIndicator);
            }
            break;
        case "failure-indicator":
            if (!customElements.get(tagName)) {
                defineCustomElement$2();
            }
            break;
        case "success-indicator":
            if (!customElements.get(tagName)) {
                defineCustomElement$1();
            }
            break;
    } });
}
defineCustomElement();

export { StatusIndicator as S, defineCustomElement as d };
