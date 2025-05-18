import { p as proxyCustomElement, H, h } from './index.js';

const ActivityIndicator = /*@__PURE__*/ proxyCustomElement(class ActivityIndicator extends H {
    constructor() {
        super();
        this.__registerHost();
        this.__attachShadow();
    }
    render() {
        return h("div", { key: '538c995d3b8ed9b6dd5dfeb70affdb4ff9eba582', class: "ispinner" }, h("div", { key: 'd341a9224884253cca34011636f1bb2eb62be5ab', class: "ispinner-blade" }), h("div", { key: 'ea7e6810909f1481a80fc7791a3bd1dfde9d2519', class: "ispinner-blade" }), h("div", { key: '32544ed07d4ff34e3e53d9c6e686a5c8ed8ad833', class: "ispinner-blade" }), h("div", { key: '582eea4eaf74a9ef18756eb5320f9e8f3b1504a6', class: "ispinner-blade" }), h("div", { key: '566031a5874e7d5c8a65562805c1f20c36e2f11f', class: "ispinner-blade" }), h("div", { key: 'fdeb4c33c6994f24a687382c3f86d03e2e962e60', class: "ispinner-blade" }), h("div", { key: '043dd18e6c8de3e8a57382168ed9817fcc1ff591', class: "ispinner-blade" }), h("div", { key: 'fc2b3f46ab7e1a5dc77a76a24f9eb74be421f77e', class: "ispinner-blade" }));
    }
    static get style() { return ".ispinner {\n    position: relative;\n    width: 20px;\n    height: 20px; }\n    .ispinner .ispinner-blade {\n      position: absolute;\n      top: 6.5px;\n      left: 8.5px;\n      width: 2.5px;\n      height: 6.5px;\n      background-color: #8e8e93;\n      border-radius: 1.25px;\n      animation: iSpinnerBlade 1s linear infinite;\n      will-change: opacity; }\n      .ispinner .ispinner-blade:nth-child(1) {\n        transform: rotate(45deg) translateY(-6.5px);\n        animation-delay: -1.625s; }\n      .ispinner .ispinner-blade:nth-child(2) {\n        transform: rotate(90deg) translateY(-6.5px);\n        animation-delay: -1.5s; }\n      .ispinner .ispinner-blade:nth-child(3) {\n        transform: rotate(135deg) translateY(-6.5px);\n        animation-delay: -1.375s; }\n      .ispinner .ispinner-blade:nth-child(4) {\n        transform: rotate(180deg) translateY(-6.5px);\n        animation-delay: -1.25s; }\n      .ispinner .ispinner-blade:nth-child(5) {\n        transform: rotate(225deg) translateY(-6.5px);\n        animation-delay: -1.125s; }\n      .ispinner .ispinner-blade:nth-child(6) {\n        transform: rotate(270deg) translateY(-6.5px);\n        animation-delay: -1s; }\n      .ispinner .ispinner-blade:nth-child(7) {\n        transform: rotate(315deg) translateY(-6.5px);\n        animation-delay: -0.875s; }\n      .ispinner .ispinner-blade:nth-child(8) {\n        transform: rotate(360deg) translateY(-6.5px);\n        animation-delay: -0.75s; }\n    .ispinner.ispinner-large {\n      width: 35px;\n      height: 35px; }\n      .ispinner.ispinner-large .ispinner-blade {\n        top: 11.5px;\n        left: 15px;\n        width: 5px;\n        height: 12px;\n        border-radius: 2.5px; }\n        .ispinner.ispinner-large .ispinner-blade:nth-child(1) {\n          transform: rotate(45deg) translateY(-11.5px); }\n        .ispinner.ispinner-large .ispinner-blade:nth-child(2) {\n          transform: rotate(90deg) translateY(-11.5px); }\n        .ispinner.ispinner-large .ispinner-blade:nth-child(3) {\n          transform: rotate(135deg) translateY(-11.5px); }\n        .ispinner.ispinner-large .ispinner-blade:nth-child(4) {\n          transform: rotate(180deg) translateY(-11.5px); }\n        .ispinner.ispinner-large .ispinner-blade:nth-child(5) {\n          transform: rotate(225deg) translateY(-11.5px); }\n        .ispinner.ispinner-large .ispinner-blade:nth-child(6) {\n          transform: rotate(270deg) translateY(-11.5px); }\n        .ispinner.ispinner-large .ispinner-blade:nth-child(7) {\n          transform: rotate(315deg) translateY(-11.5px); }\n        .ispinner.ispinner-large .ispinner-blade:nth-child(8) {\n          transform: rotate(360deg) translateY(-11.5px); }\n\n  @keyframes iSpinnerBlade {\n    0% {\n      opacity: 0.85; }\n    50% {\n      opacity: 0.25; }\n    100% {\n      opacity: 0.25; } }"; }
}, [1, "activity-indicator"]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["activity-indicator"];
    components.forEach(tagName => { switch (tagName) {
        case "activity-indicator":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, ActivityIndicator);
            }
            break;
    } });
}
defineCustomElement();

export { ActivityIndicator as A, defineCustomElement as d };
