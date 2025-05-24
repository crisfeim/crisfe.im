import { Coordinator, Client, Runner, RunResult, Message } from "./coordinator.ts";
import { Iterator } from "./iterator.ts";

export type Status = "success" | "failure";

interface AppState {
  isRunning: boolean;
  generatedCodes: string[],
  currentIteration: number,
  statuses: Status[],
  specification: string,
  maxIterations: number,
  systemPrompt: string,
}

export interface ViewModel extends AppState {
  run: () => Promise<void>;
  status?: Status;
  generatedCode?: string;
}

class ObservableIterator extends Iterator {
  iterator: Iterator
  onIterationChange?: (iteration: number) => void
  onStatusChange?: (status: Status) => void
  onGeneratedCode?: (code: string) => void
  constructor(iterator: Iterator) { super(); this.iterator = iterator }

  override  async iterate<T>(nTimes: number, action: () => Promise<T>, until: (value: T) => boolean): Promise<T> {
    var iterationCount = 0
    const newAction = async () => {
      iterationCount++

      const result = await action()
      const mapped = result as Coordinator.Result
      this.onStatusChange?.(mapped.isValid ? 'success' : 'failure')
      this.onIterationChange?.(iterationCount)
      this.onGeneratedCode?.(mapped.generatedCode)
      return result
    }
    return await super.iterate(nTimes, newAction, until)
  }
}

export function makeReactiveViewModel(client: Client, runner: Runner, maxIterations: number): ViewModel {
  const baseIterator = new Iterator()
  const observedIterator = new ObservableIterator(baseIterator);
  const withLogsIterator = new ObservableIterator(observedIterator);
  const coordinator = new Coordinator(client, runner, observedIterator);

  const initialState: AppState = {
    isRunning: false,
    generatedCodes: [],
    currentIteration: 0,
    statuses: [],
    specification: initSpecs(),
    maxIterations: maxIterations,
    systemPrompt: defaultSystemPrompt(),
  }
  const vm: ViewModel = {
    ...initialState,
    run: async function () {
      observedIterator.onIterationChange = (i) => this.currentIteration = i
      observedIterator.onStatusChange = (s) => this.statuses.push(s)
      observedIterator.onGeneratedCode = (c) => this.generatedCodes.push(c)
      this.generatedCodes.splice(0);
      this.statuses.splice(0);
      this.currentIteration = 0;
      this.isRunning = true;
      try {
        await coordinator.generate(this.systemPrompt, this.specification, this.maxIterations);
      } catch {
        this.statuses.push('failure');
      }
      this.isRunning = false;
    },

    get status(): Status | undefined {
      return this.statuses[this.statuses.length - 1];
    },
    get generatedCode(): string | undefined {
      return this.generatedCodes[this.generatedCodes.length - 1];
    }
  };

  return vm;
}

const defaultSystemPrompt = () => `
  Imagine that you are a programmer and the user's responses are feedback from compiling your code in your development environment. Your responses are the code you write, and the user's responses represent the feedback, including any errors.

  Implement the SUT's code in JavaScript based on the provided specs (unit tests).

  Follow these strict guidelines:

  1. Provide ONLY runnable JavaScript code. No explanations, comments, or formatting (no code blocks, markdown, symbols, or text).
  2. DO NOT include unit tests or any test-related code.
  3. DO NOT redefine any global functions or helpers (such as assertEqual) that may already be provided by the environment.
  4. Only implement the code required to make the current test pass.
  5. Avoid including unnecessary wrappers, main functions, or scaffolding — only the essential implementation.

  If your code fails to compile, the user will provide the error output for you to make adjustments.
  `

const initSpecs = () => `
function testAdder() {
  const sut = new Adder(1, 2);
  assertEqual(sut.result, 3);
}

testAdder();`;
