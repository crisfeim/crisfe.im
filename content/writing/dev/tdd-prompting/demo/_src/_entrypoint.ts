import { makeReactiveViewModel , ViewModel, Status} from "./viewModel.ts";

import { OllamaClient } from "./ollamaclient.ts"
import { GeminiClient } from "./geminiclient.ts"
import { EvalRunner } from "./evalrunner.ts"

export const ollamaViewModel: (maxIterations: number) => ViewModel = (maxIterations) => {
  const client = new OllamaClient();
  const runner = new EvalRunner();
  return makeReactiveViewModel(client, runner, maxIterations);
};

export const geminiViewModel: (apiKey: string, maxIterations: number) => ViewModel = (apiKey, maxIterations) => {
  const client = new GeminiClient(apiKey);
  const runner = new EvalRunner();
  return makeReactiveViewModel(client, runner, maxIterations);
};

import { LLM7Client } from "./llm7client.ts";
export const llm7ViewModel: (maxIterations: number) => ViewModel = (maxIterations) => {
  const client = new LLM7Client();
  const runner = new EvalRunner();
  return makeReactiveViewModel(client, runner, maxIterations);
};

import { Client, Runner, RunResult } from "./coordinator.ts";

export const fakeClientViewModel: () => ViewModel = () => {
  class FakeClient implements Client {
    private base = [1, 2, 3];
    private ids = [...this.base];

    async send(): Promise<string> {
      if (this.ids.length === 0) {
        this.ids = [...this.base];
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return `Generated code ${this.ids.shift()}`;
    }
  }

  class FakeRunner implements Runner {
    private base = [false, false, true];
    private results = [...this.base];

    run(code: string): RunResult {
      if (this.results.length === 0) {
        this.results = [...this.base];
      }
      return { isValid: this.results.shift()! };
    }
  }

  const client = new FakeClient();
  const runner = new FakeRunner();
  return makeReactiveViewModel(client, runner, 3);
};
