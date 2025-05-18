import { p as proxyCustomElement, H, h } from './index.js';
import { d as defineCustomElement$6 } from './p-B9_Daez8.js';
import { d as defineCustomElement$5 } from './p-B0UZmkl0.js';
import { d as defineCustomElement$4 } from './p-BGmMH4Nw.js';
import { d as defineCustomElement$3 } from './p-B707bNMm.js';
import { d as defineCustomElement$2 } from './p-BszEL0yL.js';

class ViewModel {
    onRunningChange;
    onStatusChange;
    onGeneratedCode;
    onIterationChange;
    async generateCode(specs) {
        console.log(specs);
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        this.onRunningChange?.(true);
        await delay(1000);
        this.onIterationChange?.(1);
        this.onGeneratedCode?.(`
class Adder {
  constructor(x, ) {
  }
}
      `);
        this.onStatusChange?.('failure');
        await delay(1000);
        this.onIterationChange?.(2);
        this.onGeneratedCode?.(`
class Adder {
  }
}
      `);
        this.onStatusChange?.('failure');
        await delay(1000);
        this.onIterationChange?.(3);
        this.onGeneratedCode?.(`
class Adder {
  constructor( y) {
  }
}
`);
        this.onStatusChange?.('failure');
        await delay(1000);
        this.onIterationChange?.(4);
        this.onGeneratedCode?.(`
class Adder {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.result = x + y;
  }
}
`);
        this.onStatusChange?.('success');
        this.onRunningChange(false);
        await delay(1000);
    }
}

const codegenDemoCss = "@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap');button{border:0;background:none}*,*::before,*::after{box-sizing:border-box}.container{border:1px solid #D9D9D9;font-size:16px;position:relative;border-radius:4px;overflow:hidden;box-shadow:0px 2px 4px rgba(0, 0, 0, 0.05);font-family:ui-sans-serif,\n        -apple-system,\n        BlinkMacSystemFont,\n        \"Segoe UI\",\n        Roboto,\n        sans-serif}.header{height:48px;padding:0px 16px}.border-bottom{border-bottom:1px solid #D9D9D9}.jet{font-family:'JetBrains Mono', monospace;font-size:13px}textarea{padding:0;margin:0;width:100%;height:100%;border:0;padding:0 16px;resize:none;background:none}textarea:focus{outline:none}vstack.left{border-right:1px solid #D9D9D9}.grid-background{background-color:#f9f9f9;background-image:radial-gradient(rgba(0, 0, 0, 0.05) 1.2px, transparent 0);background-size:12px 12px}.body,vstack.right{background-color:#F9F9F9}button#run-button{cursor:not-allowed;opacity:0.5;will-change:opacity;transition:opacity 0.2s ease}button#run-button.canRun{opacity:1;cursor:pointer}button#run-button.canRun:hover{opacity:0.5}button#clear{font-size:16px;width:32px;border-radius:2px;transition:background-color 0.2s ease, opacity 0.2s ease;cursor:pointer;opacity:0}button#clear.visible{opacity:1}button#clear:hover{background-color:#E3E3E3}#count{font-size:13px;font-weight:bold;padding:16px}#mobile-version{display:block}.footer{position:absolute;padding:0px 12px;bottom:0;left:0;right:0}.body{position:relative;height:300px}#regular-version{display:none}@media (min-width: 768px){#mobile-version{display:none}#regular-version{display:flex}textarea{height:340px}}hstack{display:flex;align-self:stretch;align-items:center;flex-direction:row}hstack[spacing=xl]>*{margin-right:40px}hstack[spacing=l]>*{margin-right:28px}hstack[spacing=m]>*{margin-right:20px}hstack[spacing=s]>*{margin-right:15px}hstack[spacing=xs]>*{margin-right:10px}hstack[spacing=xxs]>*{margin-right:6px}hstack[spacing]>:last-child{margin-right:0}hstack[align-y=top]{align-items:flex-start}hstack[align-y=center]{align-items:center}hstack[align-y=bottom]{align-items:flex-end}hstack[align-x=left]{justify-content:flex-start}hstack[align-x=center]{justify-content:center}hstack[align-x=right]{justify-content:flex-end}vstack{display:flex;align-self:stretch;flex:1 1 auto;flex-direction:column}vstack[spacing=xl]>*{margin-bottom:40px}vstack[spacing=l]>*{margin-bottom:28px}vstack[spacing=m]>*{margin-bottom:20px}vstack[spacing=s]>*{margin-bottom:15px}vstack[spacing=xs]>*{margin-bottom:10px}vstack[spacing=xxs]>*{margin-bottom:6px}vstack[spacing]>:last-child{margin-bottom:0}vstack[align-x=left]{align-items:flex-start}vstack[align-x=center]{align-items:center}vstack[align-x=right]{align-items:flex-end}vstack[align-y=top]{justify-content:flex-start}vstack[align-y=center]{justify-content:center}vstack[align-y=bottom]{justify-content:flex-end}list{display:flex;align-self:stretch;flex:1 1 auto;flex-direction:column}list>*{border-bottom:1px solid #d9ddde}list>*,list vstack{margin:0}list>:last-child{border-bottom:none}list[spacing=xl]>*{padding:40px 0}list[spacing=l]>*{padding:28px 0}list[spacing=m]>*{padding:20px 0}list[spacing=s]>*{padding:15px 0}list[spacing=xs]>*{padding:10px 0}list[spacing=xxs]>*{padding:6px 0}list[align-x=left]{align-items:flex-start}list[align-x=center]{align-items:center}list[align-x=right]{align-items:flex-end}list[align-y=top]{justify-content:flex-start}list[align-y=center]{justify-content:center}list[align-y=bottom]{justify-content:flex-end}spacer{flex:1}divider{background-color:#d9ddde;align-self:stretch}vstack>divider{margin:10px 0;height:1px}vstack[spacing]>divider{margin-top:0}hstack>divider{margin:0 10px;width:1px}hstack[spacing]>divider{margin-left:0}divider+list{margin-top:calc(-1*10px)}text{line-height:auto}text[font=title]{font-size:24px;font-weight:600}text[font=caption]{color:#999;font-size:13px}text[bold]{font-weight:700}text[underline=true],text[underline]{text-decoration:underline}text[underline=false]{text-decoration:none}view{display:flex;height:100%}.pylon{height:100%;padding:0;margin:0}[debug] *{outline:1px solid #009ddc!important}[stretch]{align-self:stretch;flex:1 1 auto}vstack[stretch]{height:100%}";

const CodeGenerator = /*@__PURE__*/ proxyCustomElement(class CodeGenerator extends H {
    constructor() {
        super();
        this.__registerHost();
        this.__attachShadow();
    }
    generatedCode = "";
    specs = `
function testAdder() {
  const sut = new Adder(1, 2);
  assert(sut.result === 3);
}

testAdder();`;
    isRunning = false;
    status = null;
    iteration = 0;
    canRun() {
        return !this.isRunning;
    }
    viewModel = new ViewModel();
    componentWillLoad() {
        this.viewModel.onRunningChange = (isRunnnig) => this.isRunning = isRunnnig;
        this.viewModel.onGeneratedCode = (code) => this.generatedCode = code;
        this.viewModel.onStatusChange = (status) => this.status = status;
        this.viewModel.onIterationChange = (iteration) => this.iteration = iteration;
    }
    render() {
        return h("div", { key: 'c9e6147b0d4b1f9cd4988498a49b1c345ff0d4b2' }, this.mobileVersion(), this.regularVersion());
    }
    clearSVG() {
        return (h("svg", { fill: "#737373", width: "16px", height: "16px", viewBox: "0 0 1024 1024", class: "icon", version: "1.1", xmlns: "http://www.w3.org/2000/svg", "p-id": "9723" }, h("defs", null, h("style", { type: "text/css" })), h("path", { d: "M899.1 869.6l-53-305.6H864c14.4 0 26-11.6 26-26V346c0-14.4-11.6-26-26-26H618V138c0-14.4-11.6-26-26-26H432c-14.4 0-26 11.6-26 26v182H160c-14.4 0-26 11.6-26 26v192c0 14.4 11.6 26 26 26h17.9l-53 305.6c-0.3 1.5-0.4 3-0.4 4.4 0 14.4 11.6 26 26 26h723c1.5 0 3-0.1 4.4-0.4 14.2-2.4 23.7-15.9 21.2-30zM204 390h272V182h72v208h272v104H204V390z m468 440V674c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v156H416V674c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v156H202.8l45.1-260H776l45.1 260H672z", "p-id": "9724" })));
    }
    mobileVersion() {
        return (h("vstack", { id: "mobile-version", class: "container" }, h("hstack", { class: "header border-bottom" }, this.isRunning && h("activity-indicator", null), h("spacer", null), h("button", { id: "run-button", class: { canRun: this.canRun() }, onClick: () => this.canRun() && this.run() }, h("play-button", null))), h("div", { class: { 'body': true, 'grid-background': this.status === null } }, this.status === null && this.specsArea(), this.status !== null && this.generatedArea(), h("hstack", { id: "count", class: "footer", style: { opacity: this.status != null ? 1 : 0 } }, h("status-indicator", { status: this.status }), h("spacer", null), h("button", { id: "clear", class: { visible: this.status !== null && !this.isRunning }, onClick: () => this.resetState() }, this.clearSVG()), h("spacer", null), h("span", null, this.iteration, "/5")))));
    }
    header() {
        return (h("hstack", { class: "header" }, h("spacer", null), h("button", { id: "run-button", class: { canRun: this.canRun() }, onClick: () => this.canRun() && this.run() }, h("play-button", null))));
    }
    specsArea() {
        return (h("textarea", { class: "jet", value: this.specs, onInput: (event) => this.handleSpecsInput(event) }));
    }
    generatedArea() {
        return (h("textarea", { class: "jet", value: this.generatedCode, readonly: true }));
    }
    regularVersion() {
        return (h("hstack", { id: "regular-version", class: "container" }, h("vstack", { class: "left" }, this.header(), this.specsArea()), h("vstack", { class: { 'right': true, 'grid-background': this.canRun() } }, h("hstack", { class: "header" }, this.isRunning && (h("activity-indicator", null)), h("spacer", null), h("status-indicator", { status: this.status })), this.generatedArea(), h("hstack", { id: "count", style: { opacity: this.status != null ? 1 : 0 } }, h("spacer", null), h("span", null, this.iteration, " of 5")))));
    }
    async run() {
        this.resetState();
        this.viewModel.generateCode(this.specs);
    }
    resetState() {
        this.status = null;
        this.generatedCode = '';
        this.iteration = 0;
    }
    handleSpecsInput(event) {
        const target = event.target;
        this.specs = target.value;
    }
    static get style() { return codegenDemoCss; }
}, [1, "codegen-demo", {
        "generatedCode": [32],
        "specs": [32],
        "isRunning": [32],
        "status": [32],
        "iteration": [32]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["codegen-demo", "activity-indicator", "failure-indicator", "play-button", "status-indicator", "success-indicator"];
    components.forEach(tagName => { switch (tagName) {
        case "codegen-demo":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, CodeGenerator);
            }
            break;
        case "activity-indicator":
            if (!customElements.get(tagName)) {
                defineCustomElement$6();
            }
            break;
        case "failure-indicator":
            if (!customElements.get(tagName)) {
                defineCustomElement$5();
            }
            break;
        case "play-button":
            if (!customElements.get(tagName)) {
                defineCustomElement$4();
            }
            break;
        case "status-indicator":
            if (!customElements.get(tagName)) {
                defineCustomElement$3();
            }
            break;
        case "success-indicator":
            if (!customElements.get(tagName)) {
                defineCustomElement$2();
            }
            break;
    } });
}
defineCustomElement$1();

const CodegenDemo = CodeGenerator;
const defineCustomElement = defineCustomElement$1;

export { CodegenDemo, defineCustomElement };
