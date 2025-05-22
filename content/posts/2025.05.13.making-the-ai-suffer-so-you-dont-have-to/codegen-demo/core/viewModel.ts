import { Coordinator, Client, Runner, RunResult, Message } from "./coordinator.ts";
import { Iterator } from "./iterator.ts";

export type Status = "success" | "failure";

export interface AppState {
  isRunning: boolean;
  generatedCodes: string[],
  currentIteration: number,
  statuses: Status[],
  specification: string,
  maxIterations: number,
  systemPrompt: string,
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

export function makeReactiveViewModel(client: Client, runner: Runner) {
  const iterator = new ObservableIterator(new Iterator());
  const coordinator = new Coordinator(client, runner, iterator);

  const initialState: AppState = {
    isRunning: false,
    generatedCodes: [],
    currentIteration: 0,
    statuses: [],
    specification: initSpecs(),
    maxIterations: 5,
    systemPrompt: defaultSystemPrompt(),
  }
  const vm = {
    ...initialState,
    run: async function () {
      this.isRunning = true;
      try {
        await coordinator.generate(this.systemPrompt, this.specification, this.maxIterations);
      } catch {
        this.statuses.push('failure');
      }
      this.isRunning = false;
    },

    status() {
      return this.statuses[this.statuses.length - 1];
    },

    generatedCode() {
      return this.generatedCodes[this.generatedCodes.length - 1];
    },

    setIteration(i: number) {
      this.currentIteration = i;
    },

    addStatus(s: Status) {
      this.statuses.push(s);
    },

    addGeneratedCode(c: string) {
      this.generatedCodes.push(c);
    }
  };

  iterator.onIterationChange = (i) => vm.setIteration(i);
  iterator.onStatusChange = (s) => vm.addStatus(s);
  iterator.onGeneratedCode = (c) => vm.addGeneratedCode(c);

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
  assert(sut.result === 3);
}

testAdder();`;
