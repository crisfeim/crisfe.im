import { assert, assertEquals } from "https://deno.land/std/assert/mod.ts";
import { Coordinator, Client, Runner, RunResult, Message } from "../coordinator.ts";
import { Iterator } from "../iterator.ts";

type Status = "success" | "failure";

interface AppState {
  isRunning: boolean;
  generatedCode?: string,
  currentIteration: number,
  status?: Status
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
  generatedCode?: string;
  currentIteration = 0;
  status?: Status;

  systemPrompt: string = "default system prompt"
  maxIterations = 5
  specs: string = "default specs"

  constructor(private coordinator: Coordinator) {}

  async load() {
    this.isRunning = true
    const result = await this.coordinator.generate(this.systemPrompt, this.specs, this.maxIterations)
    this.generatedCode = result.generatedCode
  }
}

class ObservableIterator extends Iterator {
  iterator: Iterator
  onIterationChange?: (iteration: number) => void
  constructor(iterator: Iterator) { super(); this.iterator = iterator }

  override  async iterate<T>(nTimes: number, action: () => Promise<T>, until: (value: T) => boolean): Promise<T> {
    var iterationCount = 0
    const newAction = async () => {
      iterationCount++
      this.onIterationChange?.(iterationCount)
      return await action()
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

Deno.test("ViewModel iteration state updates during code generation", async () => {
  const client = new ClientStub("hello")
  const runner = new AlwaysFailingRunner();
  const iterator = new ObservableIterator(new Iterator())
  const coordinator = new Coordinator(client, runner, iterator);
  const viewModel = new ViewModel(coordinator);
  iterator.onIterationChange = (iteration: number) => {
    viewModel.currentIteration = iteration
  }
  await viewModel.load()
  assertEquals(viewModel.isRunning, true)
  assertEquals(viewModel.currentIteration, 5)
});
