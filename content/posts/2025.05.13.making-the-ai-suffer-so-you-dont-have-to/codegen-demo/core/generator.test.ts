import { assertEquals, assertRejects } from "https://deno.land/std/assert/mod.ts";

interface Client {
   generateCode(): Promise<string>;
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

class Coordinator {
  constructor(private client: Client) {
    this.client = client
  }

  async generateAndEvaluateCode(): Promise<string> {
    return await this.client.generateCode()
  }
}

Deno.test("generateAndEvaluateCode delivers error on client error", async () => {
  const anyError = Error("any error")
  const client = new ClientStub(anyError)
  const sut = new Coordinator(client)
  await assertRejects(()=>sut.generateAndEvaluateCode(), Error, "any error")
});

Deno.test("generateAndEvaluateCode delivers code on client succes", async () => {
  const client = new ClientStub("any code")
  const sut = new Coordinator(client)
  const result = await sut.generateAndEvaluateCode()
  assertEquals(result, "any code")
})
