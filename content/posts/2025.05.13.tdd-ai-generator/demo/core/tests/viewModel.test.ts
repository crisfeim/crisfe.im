import { assert, assertEquals } from "https://deno.land/std/assert/mod.ts";
import { Coordinator, Client, Runner, RunResult, Message } from "../coordinator.ts";
import {  makeReactiveViewModel } from "../viewModel.ts";

const maxIterations = 5

Deno.test("ViewModel state updates during code generation", async () => {
  const client = new ClientStub("gencode")
  const alwaysFailingRunner = new RunnerStub({ isValid: false });
  const viewModel = makeReactiveViewModel(client, alwaysFailingRunner, maxIterations)
  await viewModel.run()

  assertEquals(viewModel.currentIteration, 5)
  assertEquals(viewModel.statuses, ['failure', 'failure', 'failure', 'failure', 'failure'])
  assertEquals(viewModel.generatedCodes, ['gencode', 'gencode', 'gencode', 'gencode', 'gencode'])
});

Deno.test("ViewModel delivers failure on client failure", async () => {

  const anyError = new Error("any error")
  const throwingErrorClient = new ClientStub(anyError)
  const anyRunner = new RunnerStub({ isValid: true })
  const viewModel = makeReactiveViewModel(throwingErrorClient, anyRunner, maxIterations)
  await viewModel.run()

  assertEquals(viewModel.status, 'failure', `Expected status to be failure, but got ${viewModel.status} instead`)
})

// Stubs
class RunnerStub implements Runner {
  constructor(private result: RunResult | Error) {}
  run(code: string): RunResult {
    if (this.result instanceof Error) {
      throw this.result
    }
    return this.result
  }
}

class ClientStub implements Client {
constructor(private result: string | Error) {}
 async send(messages: Message[]): Promise<string> {
   if (this.result instanceof Error) {
     throw this.result
   }
   return this.result
 }
}
