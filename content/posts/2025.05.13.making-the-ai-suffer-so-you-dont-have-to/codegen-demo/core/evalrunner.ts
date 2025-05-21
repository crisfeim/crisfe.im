import { Runner, RunResult } from "./coordinator.ts";

export class EvalRunner implements Runner {
  run(code: string): RunResult {
    try {
      eval(code);
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        stdErr: String(error),
      };
    }
  }
}
