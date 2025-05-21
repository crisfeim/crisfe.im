import { assertEquals, assertRejects } from "https://deno.land/std/assert/mod.ts";
import { Coordinator, Client, Runner, RunResult } from "./coordinator.ts";

Deno.test("generateCodeFromSpecs delivers error on client error", async () => {
  const client = new ClientStub(anyError())
  const sut = makeSUT({client})
  await assertRejects(()=>sut.generateCodeFromSpecs(anySpecs()), Error, "any error")
});

Deno.test("generateCodeFromSpecs delivers code on client succes", async () => {
  const client = new ClientStub("any code")
  const sut = makeSUT({client})
  const result = await sut.generateCodeFromSpecs(anySpecs())
  assertEquals(result.generatedCode, "any code")
})

Deno.test("generateCodeFromSpecs delivers error on runner error", async () => {
  const runner = new RunnerStub(anyError())
  const sut = makeSUT({runner})
  await assertRejects(()=>sut.generateCodeFromSpecs(anySpecs()), Error, "any error")
})

Deno.test("generateCodeFromSpecs delivers generated code on runner success", async () => {
  const runner = new RunnerStub(anySuccessRunnerResult)
  const sut = makeSUT({runner})
  const result = await sut.generateCodeFromSpecs(anySpecs())
  assertEquals(result.generatedCode, "any code")
})

Deno.test("generateCodeFromSpecs sends code to client", async () => {
  class ClientSpy implements Client {
    received: string[] = []
    constructor() {}
    async send(specs: string): Promise<string> {
      this.received.push(specs)
      return "any generated code"
    }
  }

  const client = new ClientSpy()
  const sut = makeSUT({client})
  await sut.generateCodeFromSpecs(anySpecs())
  assertEquals(client.received, [anySpecs()])
})

Deno.test("generateAndEvaluateCode sends concatenated code to runner", async () => {
  class RunnerSpy implements Runner {
    received: string[] = []
    constructor() { }
    run(code: string): RunResult {
      this.received.push(code)
      return true
    }
  }

  const client = new ClientStub("any generated code")
  const runner = new RunnerSpy()
  const sut = makeSUT({ client, runner })
  await sut.generateCodeFromSpecs(anySpecs())
  assertEquals(runner.received, ["any specs\nany generated code"])
});

Deno.test("generateAndEvaluatedCode delivers expected result on client and runner success", async () => {
  const client = new ClientStub("any code")
  const runner = new RunnerStub(false)
  const sut = makeSUT({client, runner})
  const result = await sut.generateCodeFromSpecs(anySpecs())
  const expectedResult: Coordinator.Result = {
    generatedCode: "any code",
    isValid: false
  }
  assertEquals(result, expectedResult)
})

const anySuccessRunnerResult = true
const anyError = () => Error("any error")
const anySpecs = () => "any specs"

// Stubs

class ClientStub implements Client {
  constructor(private result: string | Error) {}
  async send(): Promise<string> {
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

import { Iterator } from "./iterator.ts";
const anyIterator = new Iterator()
const makeSUT = ({ client = anySuccesfulClient, runner = anySuccesfulRunner }: {
  client?: Client,
  runner?: Runner
}): Coordinator => new Coordinator(client, runner, anyIterator);
