import { assertEquals, assertRejects } from "https://deno.land/std/assert/mod.ts";

interface Client {
  generateCode(): Promise<void>;
}

class ClientStub implements Client {
  constructor(private result: void | Error) {}
  async generateCode() {
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

  async generateAndEvaluateCode() {
    await this.client.generateCode()
  }
}

Deno.test("generateAndEvaluateCode delivers error on client error", async () => {
  const anyError = Error("any error")
  const client = new ClientStub(anyError)
  const sut = new Coordinator(client)
  await assertRejects(()=>sut.generateAndEvaluateCode(), Error, "any error")
});
