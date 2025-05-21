import { assertEquals, assertRejects } from "https://deno.land/std/assert/mod.ts";
import { Coordinator, Client, Runner, RunResult, Message } from "./coordinator.ts";
import { Iterator } from "./iterator.ts";

Deno.test("generate appends run feedback as assistant message on each iteration", async () => {

  class AlywaysFailingRunner implements Runner {
    errorMessage: string
    constructor(errorMessage: string) {this.errorMessage = errorMessage}
    run(code: string): RunResult { return {
      stdErr: this.errorMessage,
      isValid: false
    } }
  }

  class ClientSpy implements Client {
    calls: Message[][] = []
    async send(messages: Message[]): Promise<string> {
      this.calls.push(messages)
      return "any generated code"
    }
  }

 const anyRunErrorMessage = "any run error message"
 const alwaysFailingRunner = new AlywaysFailingRunner(anyRunErrorMessage)
 const client = new ClientSpy()
 const iterator = new Iterator()
 const sut = new Coordinator(client, alwaysFailingRunner, iterator)
 const result = await sut.generate("any system prompt", "any specs", 2)

 assertEquals(client.calls.length, 2)

 assertEquals(client.calls[0], [
   { role: "system", content: "any system prompt" },
   { role: "user", content: "any specs" },
 ]);

 assertEquals(client.calls[1], [
   { role: "system", content: "any system prompt" },
   { role: "user", content: "any specs" },
   { role: "assistant", content: anyRunErrorMessage }
 ]);
})
