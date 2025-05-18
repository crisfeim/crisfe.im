import { p as proxyCustomElement, H, h } from './index.js';

const SuccessIndicator = /*@__PURE__*/ proxyCustomElement(class SuccessIndicator extends H {
    constructor() {
        super();
        this.__registerHost();
    }
    render() {
        return h("svg", { key: '4aa68cf510e9873d8865c5a2e0e2cd4a6e15fd38', width: "20px", height: "20px", viewBox: "0 0 20 20", version: "1.1", xmlns: "http://www.w3.org/2000/svg" }, h("title", { key: '52615670ed9afd7712d3d112de964ad1d526d8d7' }, "192x1 92 copia@1x"), h("g", { key: 'b3f90eb4a77b94dccc1e372183f60c50b677f6dc', id: "192x192-copia", stroke: "none", "stroke-width": "1", fill: "none", "fill-rule": "evenodd" }, h("circle", { key: '88a342f6c9486d2637b46f6e564c136ac0d2f228', id: "\u00D3valo", stroke: "#81B284", fill: "#CEF6D1", cx: "10", cy: "10", r: "8" }), h("line", { key: '0d57de282196503ab2f46292cd6a9682175b9643', x1: "6", y1: "10.4615385", x2: "8.46153846", y2: "12.9230769", id: "L\u00EDnea-3", stroke: "#0D4A11", "stroke-width": "1.5", "stroke-linecap": "square" }), h("line", { key: '48d8da6b73fac5fb33efcf8bbff0d6acf9d8f83a', x1: "8.46153846", y1: "12.9230769", x2: "13.3846154", y2: "8", id: "L\u00EDnea-4", stroke: "#0D4A11", "stroke-width": "1.5", "stroke-linecap": "square" })));
    }
}, [0, "success-indicator"]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["success-indicator"];
    components.forEach(tagName => { switch (tagName) {
        case "success-indicator":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, SuccessIndicator);
            }
            break;
    } });
}
defineCustomElement();

export { SuccessIndicator as S, defineCustomElement as d };
