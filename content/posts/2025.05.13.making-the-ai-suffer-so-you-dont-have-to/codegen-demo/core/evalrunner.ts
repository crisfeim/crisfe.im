import { Runner, RunResult } from "./coordinator.ts";

export class EvalRunner implements Runner {

  run(code: string): RunResult {
    const assertHelpers = `
       function assertEquals(actual, expected) {
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
        stdErr: String(error),
      };
    }
  }
}
