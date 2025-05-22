import { makeReactiveViewModel , AppState, Status} from "./viewModel.ts";

import { OllamaClient } from "./ollamaclient.ts"
import { EvalRunner } from "./evalrunner.ts"

const defaultVM: () => AppState & {
  status: () => Status | undefined;
  generatedCode: () => string | undefined;
  run: () => Promise<void>;
} = () => {
  const client = new OllamaClient();
  const runner = new EvalRunner();
  return makeReactiveViewModel(client, runner);
};

this.defaultVM = defaultVM;
