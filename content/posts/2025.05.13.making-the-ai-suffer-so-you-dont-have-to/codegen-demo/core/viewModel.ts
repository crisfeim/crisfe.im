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
  setIteration: (i: number) => void;
  addStatus: (s: Status) => void;
  addGeneratedCode: (c: string) => void;
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
  const coordinator = new Coordinator(client, runner, withLogsIterator);

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
    status: undefined,
    run: async function () {
      this.isRunning = true;
      try {
        await coordinator.generate(this.systemPrompt, this.specification, this.maxIterations);
      } catch {
        this.status = 'failure';
        this.statuses.push('failure');
      }
      this.isRunning = false;
    },

    get generatedCode(): string | undefined {
      return this.generatedCodes[this.generatedCodes.length - 1];
    },

    setIteration(i: number) {
      this.currentIteration = i;
    },

    addStatus(s: Status) {
      this.status = s;
      this.statuses.push(s);
    },

    addGeneratedCode(c: string) {
      this.generatedCodes.push(c);
    }
  };

  observedIterator.onIterationChange = (i) => vm.setIteration(i);
  observedIterator.onStatusChange = (s) => vm.addStatus(s);
  observedIterator.onGeneratedCode = (c) => vm.addGeneratedCode(c);

  withLogsIterator.onIterationChange = (i) => {
    console.log("Will iterate again", vm.currentIteration)
    observedIterator.onIterationChange?.(i);
  }

  withLogsIterator.onStatusChange = (s) => {
    console.log("Status changed", vm.status)
    observedIterator.onStatusChange?.(s);
  }

  withLogsIterator.onGeneratedCode = (c) => {
    console.log("Generated code", vm.generatedCode)
    observedIterator.onGeneratedCode?.(c);
  }

  return vm;
}

const defaultSystemPrompt = () => `
  Imagine that you are a programmer and the user's responses are feedback from compiling your code in your development environment. Your responses are the code you write, and the user's responses represent the feedback, including any errors.

  Implement the SUT's code in javascript based on the provided specs (unit tests).

  Follow these strict guidelines:

  1. Provide ONLY runnable javascript code. No explanations, comments, or formatting (no code blocks, markdown, symbols, or text).
  2. DO NOT include unit tests or any test-related code.

  If your code fails to compile, the user will provide the error output for you to make adjustments.
  `

const initSpecs = () => `
function testAdder() {
  const sut = new Adder(1, 2);
  assertEqual(sut.result, 3);
}

testAdder();`;
