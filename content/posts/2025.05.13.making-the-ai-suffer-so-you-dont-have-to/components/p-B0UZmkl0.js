import { p as proxyCustomElement, H, h } from './index.js';

const FailureIndicator = /*@__PURE__*/ proxyCustomElement(class FailureIndicator extends H {
    constructor() {
        super();
        this.__registerHost();
    }
    render() {
        return h("svg", { key: 'db9002321ec1250e253dc8fe312a89f979ef4017', width: "20px", height: "20px", viewBox: "0 0 20 20", version: "1.1", xmlns: "http://www.w3.org/2000/svg" }, h("title", { key: 'b5b459a452fe346258960e2a62f78771981913a1' }, "192x192 copia 3@1x"), h("g", { key: '65bd07eae49653a35721aea001d42cd777f66e4b', id: "192x192-copia-3", stroke: "none", "stroke-width": "1", fill: "none", "fill-rule": "evenodd" }, h("g", { key: 'de7357083716d3ffe557b8e18f64ae2dbf1b5421', id: "Grupo", transform: "translate(2, 2)", fill: "#F6CECE", stroke: "#B26868" }, h("circle", { key: '09277f7a8a12c4f4f04c98b0f9feeb1753e781c0', id: "\u00D3valo", cx: "8", cy: "8", r: "8" })), h("g", { key: '2aa7b22fde318446509ef77fc284888bb2ea7e05', id: "Grupo-2", transform: "translate(7, 7)", stroke: "#4A0D0D", "stroke-linecap": "square", "stroke-width": "1.5" }, h("line", { key: '3de2813957e4a7010e5ddc02300eae03bda10bb7', x1: "0.719389322", y1: "0.375", x2: "5.96938932", y2: "5.625", id: "L\u00EDnea-3" }), h("line", { key: '38c4eb45f492167cf8ff80140b2ecf8c5521a3dd', x1: "5.625", y1: "0.375", x2: "0.375", y2: "5.625", id: "L\u00EDnea-6" }))));
    }
}, [0, "failure-indicator"]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["failure-indicator"];
    components.forEach(tagName => { switch (tagName) {
        case "failure-indicator":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, FailureIndicator);
            }
            break;
    } });
}
defineCustomElement();

export { FailureIndicator as F, defineCustomElement as d };
