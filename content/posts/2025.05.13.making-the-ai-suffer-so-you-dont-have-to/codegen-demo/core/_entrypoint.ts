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
