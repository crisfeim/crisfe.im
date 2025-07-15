var CodeGenCore = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // core/coordinator.ts
  var Coordinator;
  var init_coordinator = __esm({
    "core/coordinator.ts"() {
      Coordinator = class {
        constructor(client, runner, iterator) {
          this.client = client;
          this.runner = runner;
          this.iterator = iterator;
          this.client = client;
          this.runner = runner;
          this.iterator = iterator;
        }
        async generate(systemPrompt, specs, maxIterations) {
          let previousStderr;
          return await this.iterator.iterate(
            maxIterations,
            async () => await this.generateCodeFromSpecsWithPreviousFeedback(systemPrompt, specs, previousStderr),
            (result) => {
              previousStderr = result.stdErr;
              return result.isValid;
            }
          );
        }
        async generateCodeFromSpecsWithPreviousFeedback(systemPrompt, specs, previousStderr) {
          const systemPromptMessage = { role: "system", content: systemPrompt };
          const userMessage = { role: "user", content: specs };
          let messages = [systemPromptMessage, userMessage];
          if (previousStderr) {
            messages.push({ role: "assistant", content: previousStderr });
          }
          const generated = await this.client.send(messages);
          const processed = generated.replace(/^```(?:\w+)?\s*/m, "").replace(/```$/, "");
          const concatenated = `${generated}
${specs}`;
          const runResult = this.runner.run(concatenated);
          return { generatedCode: generated, stdErr: runResult.stdErr, isValid: runResult.isValid };
        }
        // @TODO: remove this method
        async generateCodeFromSpecs(systemPrompt, specs) {
          const systemPromptMessage = { role: "system", content: systemPrompt };
          const userMessage = { role: "user", content: specs };
          const generated = await this.client.send([systemPromptMessage, userMessage]);
          const concatenated = `${specs}
${generated}`;
          const runResult = this.runner.run(concatenated);
          return { generatedCode: generated, isValid: runResult.isValid };
        }
      };
    }
  });

  // core/iterator.ts
  var Iterator;
  var init_iterator = __esm({
    "core/iterator.ts"() {
      Iterator = class {
        async iterate(nTimes, action, until) {
          let currentIteration = 0;
          let result;
          while (currentIteration < nTimes) {
            result = await action();
            if (until(result)) {
              return result;
            }
            currentIteration++;
          }
          return result;
        }
      };
    }
  });

  // core/viewModel.ts
  function makeReactiveViewModel(client, runner, maxIterations) {
    const baseIterator = new Iterator();
    const observedIterator = new ObservableIterator(baseIterator);
    const coordinator = new Coordinator(client, runner, observedIterator);
    const initialState = {
      isRunning: false,
      generatedCodes: [],
      currentIteration: 0,
      statuses: [],
      specification: initSpecs(),
      maxIterations,
      systemPrompt: defaultSystemPrompt()
    };
    const vm = {
      ...initialState,
      run: async function() {
        observedIterator.onIterationChange = (i) => this.currentIteration = i;
        observedIterator.onStatusChange = (s) => this.statuses.push(s);
        observedIterator.onGeneratedCode = (c) => this.generatedCodes.push(c);
        this.generatedCodes.splice(0);
        this.statuses.splice(0);
        this.currentIteration = 0;
        this.isRunning = true;
        try {
          await coordinator.generate(this.systemPrompt, this.specification, this.maxIterations);
        } catch {
          this.statuses.push("failure");
        }
        this.isRunning = false;
      },
      get status() {
        return this.statuses[this.statuses.length - 1];
      },
      get generatedCode() {
        return this.generatedCodes[this.generatedCodes.length - 1];
      }
    };
    return vm;
  }
  var ObservableIterator, defaultSystemPrompt, initSpecs;
  var init_viewModel = __esm({
    "core/viewModel.ts"() {
      init_coordinator();
      init_iterator();
      ObservableIterator = class extends Iterator {
        iterator;
        onIterationChange;
        onStatusChange;
        onGeneratedCode;
        constructor(iterator) {
          super();
          this.iterator = iterator;
        }
        async iterate(nTimes, action, until) {
          var iterationCount = 0;
          const newAction = async () => {
            iterationCount++;
            const result = await action();
            const mapped = result;
            this.onStatusChange?.(mapped.isValid ? "success" : "failure");
            this.onIterationChange?.(iterationCount);
            this.onGeneratedCode?.(mapped.generatedCode);
            return result;
          };
          return await super.iterate(nTimes, newAction, until);
        }
      };
      defaultSystemPrompt = () => `
  Imagine that you are a programmer and the user's responses are feedback from compiling your code in your development environment. Your responses are the code you write, and the user's responses represent the feedback, including any errors.

  Implement the SUT's code in JavaScript based on the provided specs (unit tests).

  Follow these strict guidelines:

  1. Provide ONLY runnable JavaScript code. No explanations, comments, or formatting (no code blocks, markdown, symbols, or text).
  2. DO NOT include unit tests or any test-related code.
  3. DO NOT redefine any global functions or helpers (such as assertEqual) that may already be provided by the environment.
  4. Only implement the code required to make the current test pass.
  5. Avoid including unnecessary wrappers, main functions, or scaffolding \u2014 only the essential implementation.

  If your code fails to compile, the user will provide the error output for you to make adjustments.
  `;
      initSpecs = () => `
function testAdder() {
  const sut = new Adder(1, 2);
  assertEqual(sut.result, 3);
}

testAdder();`;
    }
  });

  // core/ollamaclient.ts
  var OllamaClient;
  var init_ollamaclient = __esm({
    "core/ollamaclient.ts"() {
      OllamaClient = class {
        model = "llama3.2";
        url = "http://localhost:11434/api/chat";
        async send(messages) {
          const body = {
            model: this.model,
            messages,
            stream: false
          };
          const response = await fetch(this.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          if (!response.ok) {
            throw new Error(`OllamaClient: HTTP error ${response.status}`);
          }
          const data = await response.json();
          if (!data?.message?.content) {
            throw new Error("OllamaClient: Invalid response shape");
          }
          return data.message.content;
        }
      };
    }
  });

  // core/geminiclient.ts
  var GeminiClient;
  var init_geminiclient = __esm({
    "core/geminiclient.ts"() {
      GeminiClient = class {
        constructor(apiKey) {
          this.apiKey = apiKey;
        }
        async send(messages) {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
          const mapped = messages.map(({ role, content }) => ({
            role: role === "system" ? "model" : role,
            parts: [{ text: content }]
          }));
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: mapped,
              generationConfig: {
                stopSequences: []
              }
            })
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(`GeminiClient: API error: ${err.error.message}`);
          }
          const data = await res.json();
          return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        }
      };
    }
  });

  // core/evalrunner.ts
  var EvalRunner;
  var init_evalrunner = __esm({
    "core/evalrunner.ts"() {
      EvalRunner = class {
        run(code) {
          const assertHelpers = `
       function assertEqual(actual, expected) {
         if (actual !== expected) {
           throw new Error(\`Assertion failed: expected \${expected}, but got \${actual}\`);
         }
       }
     `;
          try {
            eval(assertHelpers + "\n" + code);
            return { isValid: true };
          } catch (error) {
            return {
              isValid: false,
              stdErr: String(error)
            };
          }
        }
      };
    }
  });

  // core/llm7client.ts
  var LLM7Client;
  var init_llm7client = __esm({
    "core/llm7client.ts"() {
      LLM7Client = class {
        model = "gpt-3.5-turbo";
        url = "https://api.llm7.io/v1/chat/completions";
        async send(messages) {
          const body = {
            model: this.model,
            messages,
            stream: false
          };
          const response = await fetch(this.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          if (!response.ok) {
            throw new Error(`LLM7Client: HTTP error ${response.status}`);
          }
          const data = await response.json();
          if (!data?.choices?.[0]?.message?.content) {
            throw new Error("LLM7Client: Invalid response shape");
          }
          return data.choices[0].message.content;
        }
      };
    }
  });

  // core/_entrypoint.ts
  var ollamaViewModel, geminiViewModel, llm7ViewModel, fakeClientViewModel;
  var init_entrypoint = __esm({
    "core/_entrypoint.ts"() {
      init_viewModel();
      init_ollamaclient();
      init_geminiclient();
      init_evalrunner();
      init_llm7client();
      ollamaViewModel = (maxIterations) => {
        const client = new OllamaClient();
        const runner = new EvalRunner();
        return makeReactiveViewModel(client, runner, maxIterations);
      };
      geminiViewModel = (apiKey, maxIterations) => {
        const client = new GeminiClient(apiKey);
        const runner = new EvalRunner();
        return makeReactiveViewModel(client, runner, maxIterations);
      };
      llm7ViewModel = (maxIterations) => {
        const client = new LLM7Client();
        const runner = new EvalRunner();
        return makeReactiveViewModel(client, runner, maxIterations);
      };
      fakeClientViewModel = () => {
        class FakeClient {
          base = [1, 2, 3];
          ids = [...this.base];
          async send() {
            if (this.ids.length === 0) {
              this.ids = [...this.base];
            }
            await new Promise((resolve) => setTimeout(resolve, 1e3));
            return `Generated code ${this.ids.shift()}`;
          }
        }
        class FakeRunner {
          base = [false, false, true];
          results = [...this.base];
          run(code2) {
            if (this.results.length === 0) {
              this.results = [...this.base];
            }
            return { isValid: this.results.shift() };
          }
        }
        const client = new FakeClient();
        const runner = new FakeRunner();
        return makeReactiveViewModel(client, runner, 3);
      };
    }
  });

  // core/entrypoint.ts
  var require_entrypoint = __commonJS({
    "core/entrypoint.ts"(exports) {
      init_entrypoint();
      exports.ollamaViewModel = ollamaViewModel;
      exports.geminiViewModel = geminiViewModel;
      exports.fakeClientViewModel = fakeClientViewModel;
      exports.llm7ViewModel = llm7ViewModel;
    }
  });
  return require_entrypoint();
})();
