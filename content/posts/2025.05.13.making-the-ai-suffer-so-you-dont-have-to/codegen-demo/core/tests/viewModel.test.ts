import { assert, assertEquals } from "https://deno.land/std/assert/mod.ts";
import { Coordinator, Client, Runner, RunResult, Message } from "../coordinator.ts";
import { ViewModel, Status, makeViewModel } from "../viewModel.ts";


Deno.test("ViewModel state updates during code generation", async () => {
  const client = new ClientStub("gencode")
  const runner = new AlwaysFailingRunner();
  const viewModel = makeViewModel(client, runner)
  await viewModel.load()

  assertEquals(viewModel.currentIteration, 5)
  assertEquals(viewModel.statuses, ['failure', 'failure', 'failure', 'failure', 'failure'])
  assertEquals(viewModel.generatedCodes, ['gencode', 'gencode', 'gencode', 'gencode', 'gencode'])
});



// Stubs

class AlwaysFailingRunner implements Runner {
  run(code: string): RunResult {
    return {
      isValid: false
    }
  }
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
