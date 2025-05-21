import { assertEquals, assertRejects } from "https://deno.land/std/assert/mod.ts";

interface Client {
   generateCode(): Promise<string>;
}

type RunResult = boolean
interface Runner {
  run(code: string): RunResult
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
  const sut = makeSUT({client})
  await assertRejects(()=>sut.generateAndEvaluateCode(), Error, "any error")
});

Deno.test("generateAndEvaluateCode delivers code on client succes", async () => {
  const client = new ClientStub("any code")
  const sut = makeSUT({client})
  const result = await sut.generateAndEvaluateCode()
  assertEquals(result, "any code")
})

Deno.test("generateAndEvaluateCode delivers error on runner error", async () => {
  const anyError = Error("any error")
  const runner = new RunnerStub(anyError)
  const sut = makeSUT({runner})
  await assertRejects(()=>sut.generateAndEvaluateCode(), Error, "any error")
})

Deno.test("generateAndEvaluateCode delivers generated code on runner success", async () => {
  const runner = new RunnerStub(anySuccessRunnerResult)
  const sut = makeSUT({runner})
  const result = await sut.generateAndEvaluateCode()
  assertEquals(result, "any code")
})

const anySuccessRunnerResult = true

// Stubs

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
  constructor(private result: RunResult | Error) {}
  run(code: string): RunResult {
    if (this.result instanceof Error) {
      throw this.result
    }
    return this.result
  }
}

const anySuccesfulClient = new ClientStub("any code")
const anySuccesfulRunner = new RunnerStub(anySuccessRunnerResult)

const makeSUT = ({ client = anySuccesfulClient, runner = anySuccesfulRunner }: {
  client?: Client,
  runner?: Runner
}): Coordinator => new Coordinator(client, runner);
