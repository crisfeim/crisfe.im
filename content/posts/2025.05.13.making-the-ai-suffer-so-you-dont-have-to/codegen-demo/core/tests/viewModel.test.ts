import { assert, assertEquals } from "https://deno.land/std/assert/mod.ts";
import { Coordinator, Client, Runner, RunResult, Message } from "../coordinator.ts";
import { Iterator } from "../iterator.ts";

type Status = "success" | "failure";

interface AppState {
  isRunning: boolean;
  generatedCodes: string[],
  currentIteration: number,
  statuses: Status[]
}

class ClientStub implements Client {
  response: string
constructor(response: string) {
  this.response = response
}
 async send(messages: Message[]): Promise<string> {
   return this.response;
 }
}

class ViewModel implements AppState {
  isRunning: boolean = false
  generatedCodes: string[] = []
  currentIteration = 0;
  statuses: Status[] = []

  get lastStatus(): Status | undefined {
    return this.statuses[this.statuses.length - 1];
  }

  get lastGeneratedCode(): string | undefined {
    return this.generatedCodes[this.generatedCodes.length - 1];
  }

  systemPrompt: string = "default system prompt"
  maxIterations = 5
  specs: string = "default specs"

  constructor(private coordinator: Coordinator) {}

  async load() {
    this.isRunning = true
    const result = await this.coordinator.generate(this.systemPrompt, this.specs, this.maxIterations)
    this.isRunning = false
  }
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

class AlwaysFailingRunner implements Runner {
  run(code: string): RunResult {
    return {
      isValid: false
    }
  }
}

Deno.test("ViewModel state updates during code generation", async () => {
  const client = new ClientStub("gencode")
  const runner = new AlwaysFailingRunner();
  const iterator = new ObservableIterator(new Iterator())
  const coordinator = new Coordinator(client, runner, iterator);
  const viewModel = new ViewModel(coordinator);


  iterator.onIterationChange = (iteration: number) => {
    viewModel.currentIteration = iteration
  }


  iterator.onStatusChange = (status: Status) => {
    viewModel.statuses.push(status)
  }


  iterator.onGeneratedCode = (code: string) => {
    viewModel.generatedCodes.push(code)
  }

  await viewModel.load()

  assertEquals(viewModel.currentIteration, 5)
  assertEquals(viewModel.statuses, ['failure', 'failure', 'failure', 'failure', 'failure'])
  assertEquals(viewModel.generatedCodes, ['gencode', 'gencode', 'gencode', 'gencode', 'gencode'])
});
