var CodeGenCore = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // coordinator.ts
  var Coordinator;
  var init_coordinator = __esm({
    "coordinator.ts"() {
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
          const concatenated = `${specs}
${generated}`;
          const runResult = this.runner.run(concatenated);
          return { generatedCode: generated, stdErr: runResult.stdErr, isValid: runResult.isValid };
        }
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

  // iterator.ts
  var Iterator;
  var init_iterator = __esm({
    "iterator.ts"() {
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

  // viewModel.ts
  function makeReactiveViewModel(client, runner, maxIterations) {
    const iterator = new ObservableIterator(new Iterator());
    const coordinator = new Coordinator(client, runner, iterator);
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
      },
      setIteration(i) {
        this.currentIteration = i;
      },
      addStatus(s) {
        this.statuses.push(s);
      },
      addGeneratedCode(c) {
        this.generatedCodes.push(c);
      }
    };
    iterator.onIterationChange = (i) => vm.setIteration(i);
    iterator.onStatusChange = (s) => vm.addStatus(s);
    iterator.onGeneratedCode = (c) => vm.addGeneratedCode(c);
    return vm;
  }
  var ObservableIterator, defaultSystemPrompt, initSpecs;
  var init_viewModel = __esm({
    "viewModel.ts"() {
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

  Implement the SUT's code in javascript based on the provided specs (unit tests).

  Follow these strict guidelines:

  1. Provide ONLY runnable javascript code. No explanations, comments, or formatting (no code blocks, markdown, symbols, or text).
  2. DO NOT include unit tests or any test-related code.

  If your code fails to compile, the user will provide the error output for you to make adjustments.
  `;
      initSpecs = () => `
function testAdder() {
  const sut = new Adder(1, 2);
  assert(sut.result === 3);
}

testAdder();`;
    }
  });

  // ollamaclient.ts
  var OllamaClient;
  var init_ollamaclient = __esm({
    "ollamaclient.ts"() {
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

  // geminiclient.ts
  var GeminiClient;
  var init_geminiclient = __esm({
    "geminiclient.ts"() {
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

  // evalrunner.ts
  var EvalRunner;
  var init_evalrunner = __esm({
    "evalrunner.ts"() {
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

  // _entrypoint.ts
  var ollamaViewModel, geminiViewModel;
  var init_entrypoint = __esm({
    "_entrypoint.ts"() {
      init_viewModel();
      init_ollamaclient();
      init_geminiclient();
      init_evalrunner();
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
    }
  });

  // entrypoint.ts
  var require_entrypoint = __commonJS({
    "entrypoint.ts"(exports) {
      init_entrypoint();
      exports.ollamaViewModel = ollamaViewModel;
      exports.geminiViewModel = geminiViewModel;
    }
  });
  return require_entrypoint();
})();
