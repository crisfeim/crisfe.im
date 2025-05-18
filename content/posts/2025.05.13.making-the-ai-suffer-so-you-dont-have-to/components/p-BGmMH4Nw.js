import { p as proxyCustomElement, H, h } from './index.js';

const PlayButton = /*@__PURE__*/ proxyCustomElement(class PlayButton extends H {
    constructor() {
        super();
        this.__registerHost();
        this.__attachShadow();
    }
    render() {
        return h("svg", { key: 'a74842960c4faecf4d76e65df40ae1a854dc8678', width: "20px", height: "20px", viewBox: "0 0 20 20", version: "1.1", xmlns: "http://www.w3.org/2000/svg" }, h("title", { key: 'f89d4d29db2c34ac43684420e31357893cf2bafd' }, "192x192@1x"), h("defs", { key: '73413d30b2cd68144d1291d690fce361500e6c47' }, h("path", { key: '2ebcf8aa068dd1fec063285acced82c2e83b0b13', d: "M17.6313437,9.40334243 L2.96465625,2.06999755 C2.758,1.96734128 2.5133125,1.97799753 2.31665625,2.0993413 C2.12,2.22134132 2,2.43534135 2,2.66665389 L2,17.3333124 C2,17.5646562 2.12,17.7786562 2.31665625,17.9006562 C2.4233125,17.9666562 2.54465625,18 2.66665625,18 C2.76865625,18 2.87065625,17.9766562 2.96465625,17.93 L17.6313125,10.5966551 C17.8573437,10.4833426 18,10.2526551 18,10 C18,9.74734248 17.8573437,9.51665494 17.6313437,9.40334243 Z", id: "path-1" }), h("filter", { key: '823c9bf594e37bfba9ddb8f3935794c1c33b5fe0', x: "-46.9%", y: "-34.4%", width: "194.9%", height: "193.5%", filterUnits: "objectBoundingBox", id: "filter-2" }, h("feMorphology", { key: '81d96021101d19595522194bb73e132b01eefa0b', radius: "0.5", operator: "dilate", in: "SourceAlpha", result: "shadowSpreadOuter1" }), h("feOffset", { key: '8be931c765cd8c1ad8fb0f652a7f932a4871b92b', dx: "0", dy: "2", in: "shadowSpreadOuter1", result: "shadowOffsetOuter1" }), h("feGaussianBlur", { key: '404c7c58efb4252f8a72de87e22d3408e75d0d00', stdDeviation: "2", in: "shadowOffsetOuter1", result: "shadowBlurOuter1" }), h("feComposite", { key: 'c8b146493b2c9519d387d73c749cbba0f911db7b', in: "shadowBlurOuter1", in2: "SourceAlpha", operator: "out", result: "shadowBlurOuter1" }), h("feColorMatrix", { key: 'a7ec056cd4aaf1bd937ddacaa8ea7f691052e673', values: "0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.100305944 0", type: "matrix", in: "shadowBlurOuter1" }))), h("g", { key: 'dcc33d77810fa7256260b3c501b69efee9e94b14', id: "192x192", stroke: "none", "stroke-width": "1", fill: "none", "fill-rule": "evenodd" }, h("rect", { key: '77cd73888f09533ac9208b56140c1c0c5f303c6a', fill: "#FFFFFF", x: "0", y: "0", width: "20", height: "20" }), h("g", { key: '652de4c6257b115b6c0f973626ebd0af10809e64', id: "Trazado", "fill-rule": "nonzero" }, h("use", { key: 'f71b9af0612e3c6e7cb0d01d5a3adefbb899d280', fill: "black", "fill-opacity": "1", filter: "url(#filter-2)", xlinkHref: "#path-1" }), h("use", { key: '20b470adace58e38282a27211c1b6a66c0eea8ec', stroke: "#737373", "stroke-width": "1", fill: "#E3E3E3", xlinkHref: "#path-1" }))));
    }
}, [1, "play-button"]);
function defineCustomElement() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["play-button"];
    components.forEach(tagName => { switch (tagName) {
        case "play-button":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, PlayButton);
            }
            break;
    } });
}
defineCustomElement();

export { PlayButton as P, defineCustomElement as d };
