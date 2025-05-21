import { assertEquals, assertRejects } from "https://deno.land/std/assert/mod.ts";

interface Client {
   generateCode(): Promise<string>;
}

interface Runner {
  run(code: string): void
}

class ClientStub implements Client {
  constructor(private result: string | Error) {}
  async generateCode(): Promise<string> {
    if (this.result instanceof Error) {
      throw this.result
    }
    return this.result
  }
}

class RunnerStub implements Runner {
  constructor(private result: void | Error) {}
  run(code: string): void {
    if (this.result instanceof Error) {
      throw this.result
    }
  }
}

class Coordinator {
  constructor(private client: Client, private runner: Runner) {
    this.client = client
    this.runner = runner
  }

  async generateAndEvaluateCode(): Promise<string> {
    const generated = await this.client.generateCode()
    this.runner.run(generated)
    return generated
  }
}

Deno.test("generateAndEvaluateCode delivers error on client error", async () => {
  const anyError = Error("any error")
  const client = new ClientStub(anyError)
  const sut = new Coordinator(client, new RunnerStub())
  await assertRejects(()=>sut.generateAndEvaluateCode(), Error, "any error")
});

Deno.test("generateAndEvaluateCode delivers code on client succes", async () => {
  const client = new ClientStub("any code")
  const sut = new Coordinator(client, new RunnerStub())
  const result = await sut.generateAndEvaluateCode()
  assertEquals(result, "any code")
})

Deno.test("generateAndEvaluateCode delivers error on runner error", async () => {
  const anyError = Error("any error")
  const client = new ClientStub("any code")
  const runner = new RunnerStub(anyError)
  const sut = new Coordinator(client, runner)
  await assertRejects(()=>sut.generateAndEvaluateCode(), Error, "any error")
})
