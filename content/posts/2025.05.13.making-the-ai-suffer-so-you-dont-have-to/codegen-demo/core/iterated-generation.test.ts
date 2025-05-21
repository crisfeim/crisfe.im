import { assertEquals, assertRejects } from "https://deno.land/std/assert/mod.ts";
import { Coordinator, Client, Runner, RunResult, Message } from "./coordinator.ts";
import { Iterator } from "./iterator.ts";

Deno.test("generate iterates N times on always invalid code", async () => {
  class RunnerStub implements Runner {
    constructor(private readonly result: RunResult) {this.result = result}
    run(code: string): RunResult {
      return this.result
    }
  }
  const client = new ClientStub("any code")
  const runner = new RunnerStub({ isValid: false })
  const iterator = new IteratorSpy()
  const sut = new Coordinator(client, runner, iterator)
  const result = await sut.generate("any system prompt","any specs", 5)
  assertEquals(iterator.iterations, 5)
})

Deno.test("generate iterates until valid code", async () => {
  class RunnerStub implements Runner {
    constructor(private readonly results: boolean[]) {}
    run(code: string): RunResult {
      return { isValid: this.results.shift()! }
    }
  }

  const client = new ClientStub("any code")
  const runner = new RunnerStub([false, false, false, true])
  const iterator = new IteratorSpy()
  const sut = new Coordinator(client, runner, iterator)
  const result = await sut.generate("any system prompt", "any specs", 5)
  assertEquals(iterator.iterations, 4)
})


// Mocks
class ClientStub implements Client {
  constructor(private readonly code: string) {}
  async send(messages: Message[]): Promise<string> {
    return this.code
  }
}

export class IteratorSpy extends Iterator {
  public iterations = 0;

  override async iterate<T>(
    nTimes: number,
    action: () => Promise<T>,
    until: (value: T) => boolean
  ): Promise<T> {
    this.iterations = 0;

    return await super.iterate(
      nTimes,
      async () => {
        this.iterations++;
        return await action();
      },
      until
    );
  }
}
